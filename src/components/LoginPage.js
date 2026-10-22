import { t, getLanguage, setLanguage } from '../utils/i18n.js';
import { sanitizeText, escapeHtml } from '../utils/security.js';
import { registerOrUpdateCurrentUser } from '../utils/userDatabase.js';
import { auth } from '../services/firebase.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  updateProfile,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  sendPasswordResetEmail
} from 'firebase/auth';
import { queueCloudSync, fetchAndMergeUserDataFromCloud } from '../services/syncService.js';
import { isUsernameAvailable, isUsernameAvailableAsync } from '../utils/userDatabase.js';
import { resetTravelData, silenceAndHydrateUnlockedAchievements } from '../utils/storage.js';
import { suppressAchievementNotifications } from '../utils/notifications.js';

const ALLOWED_AVATARS = [
  '🧭', '🗺️', '✈️', '🚀', '🏔️', '🏖️', '🎒', '🌊', '🚢', '🚂', 
  '🚁', '🏕️', '⛺', '🗿', '🗽', '🗼', '⛩️', '🌍', '🌎', '🌏',
  '🦅', '🐉', '🦁', '🐺', '🦊', '🐯', '🐻', '🐼', '🐨', '🐬', 
  '🐋', '🐧', '🦉', '🐪', '🐎', '🐤', '🐥', '🌺', '🌴', '🌲', 
  '🌋', '🌅', '🌌', '🪐', '⭐', '🔥', '⚡', '🌈', '💎', '🤠', 
  '🧳', '📸', '🏄', '🧗', '🚵', '🎿', '⛵', '🛰️', '🪂'
];

/**
 * Huawei/HMS cihaz tespiti.
 * Huawei cihazlarda Google Play Services yoktur → Google Sign-In çalışmaz.
 */
function isHuaweiDevice() {
  try {
    const ua = (navigator.userAgent || '').toLowerCase();
    if (ua.includes('huawei') || ua.includes('honor') || ua.includes('hmscore') || ua.includes('hms')) return true;
    if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.getPlatform() === 'android') {
      if (typeof window.HMSPushKit !== 'undefined' || typeof window.HMS !== 'undefined') return true;
    }
    return false;
  } catch {
    return false;
  }
}

const HUAWEI_DEVICE = isHuaweiDevice();
// Apple sign-in needs the native iOS sheet or a browser popup. Inside the Android WebView neither works,
// and Apple only requires it on iOS, so the button is hidden on native Android.
const HIDE_APPLE_BUTTON = (() => {
  try { return window.Capacitor?.getPlatform?.() === 'android'; } catch { return false; }
})();

/** Eski veri var mı? (giriş yapılmadan önce localStorage'da gezgin verisi olan kullanıcılar) */
function hasLegacyData() {
  try {
    const worldRaw = localStorage.getItem('gittigim_yerler_world_v2');
    const turkeyRaw = localStorage.getItem('gittigim_yerler_turkey_v2');
    if (worldRaw) {
      const parsed = JSON.parse(worldRaw);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) return true;
    }
    if (turkeyRaw) {
      const parsed = JSON.parse(turkeyRaw);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) return true;
    }
  } catch {}
  return false;
}

export function renderLoginPage(container, onLogin) {
  // Check if already logged in (Persistent localStorage or current sessionStorage)
  const isLogged = localStorage.getItem('gv_logged_in') === '1' || sessionStorage.getItem('gv_logged_in') === '1';
  if (isLogged) {
    try {
      const profileStr = localStorage.getItem('gv_profile') || sessionStorage.getItem('gv_profile');
      if (profileStr) {
        const profile = JSON.parse(profileStr);
        if (profile && profile.username) {
          if (!localStorage.getItem('gv_data_owner_key')) {
            try {
              const ownerKey = profile.isGuest
                ? '__guest__'
                : String(profile.uid || auth?.currentUser?.uid || profile.email || profile.username || '').trim().toLowerCase();
              localStorage.setItem('gv_data_owner_key', ownerKey);
            } catch {}
          }
          if (navigator.onLine && !profile.isGuest) {
            suppressAchievementNotifications(true);
            fetchAndMergeUserDataFromCloud(profile.uid || profile.username).then(() => {
              silenceAndHydrateUnlockedAchievements();
              if (window.__refreshMapStats) window.__refreshMapStats();
              setTimeout(() => suppressAchievementNotifications(false), 2000);
            }).catch(() => {
              setTimeout(() => suppressAchievementNotifications(false), 2000);
            });
          }
          silenceAndHydrateUnlockedAchievements();
          onLogin(profile);
          return;
        }
      }
    } catch (e) {
      console.error('Profile parse error', e);
      localStorage.removeItem('gv_logged_in');
      sessionStorage.removeItem('gv_logged_in');
    }
  }

  // Eski veri var mı? Migration modu bayrağı
  const showMigrationBanner = hasLegacyData() && !localStorage.getItem('gv_migration_dismissed');

  let authMode = 'login'; // 'login' | 'register'
  let rememberMe = true;
  let selectedAvatar = '🧭';
  let emailVal = '';
  let passwordVal = '';
  let usernameVal = '';
  let _isSubmitting = false;
  let migrateLegacyData = false;


  async function saveAndCompleteLogin(profile, remember) {
    suppressAchievementNotifications(true);
    if (profile && !profile.isGuest && auth?.currentUser?.uid) {
      profile.uid = auth.currentUser.uid;
    }
    const newOwnerKey = profile?.isGuest
      ? '__guest__'
      : String(profile?.uid || auth?.currentUser?.uid || profile?.email || profile?.username || '').trim().toLowerCase();
    const legacyEmailKey = String(profile?.email || profile?.username || '').trim().toLowerCase();
    const prevOwnerKey = localStorage.getItem('gv_data_owner_key') || '';
    const isSameOwner = prevOwnerKey !== '' && (prevOwnerKey === newOwnerKey || prevOwnerKey === legacyEmailKey);

    // Clear local travel storage whenever switching accounts (or logging in from guest/unowned state without migration)
    // so previous or guest map data never contaminates the authenticated account.
    if (!profile?.isGuest && !isSameOwner && !migrateLegacyData) {
      try {
        resetTravelData({ skipCloudSync: true });
      } catch (err) {
        console.warn('Reset local travel data on account switch warning:', err);
      }
    }
    migrateLegacyData = false;

    try {
      localStorage.setItem('gv_data_owner_key', newOwnerKey);
    } catch {}

    if (remember) {
      localStorage.setItem('gv_logged_in', '1');
      localStorage.setItem('gv_profile', JSON.stringify(profile));
      localStorage.setItem('gv_remember_me', '1');
      sessionStorage.removeItem('gv_logged_in');
      sessionStorage.removeItem('gv_profile');
    } else {
      sessionStorage.setItem('gv_logged_in', '1');
      sessionStorage.setItem('gv_profile', JSON.stringify(profile));
      localStorage.removeItem('gv_logged_in');
      localStorage.removeItem('gv_profile');
      localStorage.removeItem('gv_remember_me');
    }

    const emailLower = String(profile?.email || '').toLowerCase().trim();
    if (emailLower !== 'baranimoley@gmail.com' && emailLower !== 'barandivatyali@gmail.com') {
      try { localStorage.removeItem('gv_admin_active'); } catch {}
    }

    try {
      // Pull and merge ONLY this user's cloud data before rendering the map
      if (navigator.onLine && !profile?.isGuest) {
        try {
          const cloudData = await fetchAndMergeUserDataFromCloud(profile.username);
          if (cloudData) {
            if (cloudData.displayName && authMode !== 'register') {
              profile.username = cloudData.displayName;
            }
            if (cloudData.avatar && authMode !== 'register') {
              profile.avatar = cloudData.avatar;
            }
            if (cloudData.bio && !profile.bio) {
              profile.bio = cloudData.bio;
            }
            if (cloudData.photoUrl && !profile.photoUrl) {
              profile.photoUrl = cloudData.photoUrl;
            }
            if (remember) {
              localStorage.setItem('gv_profile', JSON.stringify(profile));
            } else {
              sessionStorage.setItem('gv_profile', JSON.stringify(profile));
            }
          }
        } catch {}
      }

      let worldVisits = {};
      let turkeyVisits = {};
      let worldCities = [];
      try {
        worldVisits = JSON.parse(localStorage.getItem('gittigim_yerler_world_v2') || '{}');
        turkeyVisits = JSON.parse(localStorage.getItem('gittigim_yerler_turkey_v2') || '{}');
        worldCities = JSON.parse(localStorage.getItem('gittigim_yerler_cities_v2') || '[]');
      } catch {}
      registerOrUpdateCurrentUser(profile, worldVisits, turkeyVisits, worldCities);

      if (!profile?.isGuest) {
        queueCloudSync(true);
      }
      silenceAndHydrateUnlockedAchievements();
      setTimeout(() => suppressAchievementNotifications(false), 2000);
    } catch (e) {
      console.warn('Could not register in community db / cloud sync', e);
      setTimeout(() => suppressAchievementNotifications(false), 2000);
    }

    onLogin(profile);
  }

  function render() {
    const currentLang = getLanguage();

    container.innerHTML = `
      <div class="login-overlay">
        <!-- Language Switcher in Top Right -->
        <div style="position:fixed;top:max(12px, env(safe-area-inset-top, 12px));right:max(12px, env(safe-area-inset-right, 12px));z-index:10001;">
          <div class="lang-toggle-btn" id="login-lang-toggle" style="background:rgba(30,41,59,0.85);border:1px solid rgba(255,255,255,0.15);border-radius:20px;padding:6px 14px;color:#f8fafc;font-size:0.85rem;cursor:pointer;display:flex;align-items:center;gap:6px;backdrop-filter:blur(8px);">
            <span>🌐</span>
            <span style="font-weight:700;">${currentLang.toUpperCase()}</span>
          </div>
        </div>

        <div class="login-card">
          <!-- 🔄 Migration Banner: Eski verisi olan kullanıcılar için -->
          ${showMigrationBanner ? `
            <div class="migration-banner" id="migration-banner">
              <div class="migration-banner-icon">📦</div>
              <div class="migration-banner-text">
                <strong>${currentLang === 'tr' ? 'Gezgin verileriniz bu cihazda!' : 'Your Gezgin data is on this device!'}</strong>
                <span>${currentLang === 'tr' ? 'Hesap oluşturarak tüm verilerinizi koruyabilirsiniz.' : 'Create an account to keep all your data.'}</span>
              </div>
              <div class="migration-banner-actions">
                <button type="button" class="migration-cta-btn" id="btn-migration-signup">
                  ${currentLang === 'tr' ? '✨ Hesap Oluştur' : '✨ Create Account'}
                </button>
                <button type="button" class="migration-dismiss-btn" id="btn-migration-dismiss" title="${currentLang === 'tr' ? 'Kapat' : 'Dismiss'}">✕</button>
              </div>
            </div>
          ` : ''}

          <!-- Logo & Branding -->
          <div class="login-logo">
            <img src="./icon-192.png" class="login-brand-logo-img" alt="Gezgin" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='block';" />
            <span class="login-globe" style="display:none;">🌍</span>
            <h1 class="login-title">${t('appName')}</h1>
            <p class="login-subtitle">${t('appSubtitle')}</p>
          </div>

          <!-- Auth Switch Tabs: Giriş Yap / Kayıt Ol -->
          <div class="auth-tabs-row">
            <button type="button" class="auth-tab-btn ${authMode === 'login' ? 'active' : ''}" id="tab-login">
              🔑 ${currentLang === 'tr' ? 'Giriş Yap' : 'Sign In'}
            </button>
            <button type="button" class="auth-tab-btn ${authMode === 'register' ? 'active' : ''}" id="tab-register">
              ✨ ${currentLang === 'tr' ? 'Kayıt Ol' : 'Register'}
            </button>
          </div>

          <!-- Official Sign in with Apple Button (Guideline 4 Equivalent Design & Prominence) -->
          ${!HIDE_APPLE_BUTTON ? `
          <button type="button" class="apple-auth-btn" id="btn-apple-auth">
            <svg class="apple-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span>${authMode === 'login' ? (currentLang === 'tr' ? 'Apple ile Giriş Yap' : 'Sign in with Apple') : (currentLang === 'tr' ? 'Apple ile Kayıt Ol' : 'Sign up with Apple')}</span>
          </button>
          ` : ''}

          <!-- Official Google Single Sign-On Button — Huawei cihazlarda gizlenir (GMS yok) -->
          ${!HUAWEI_DEVICE ? `
          <button type="button" class="google-auth-btn" id="btn-google-auth">
            <svg class="google-icon-svg" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>${authMode === 'login' ? (currentLang === 'tr' ? 'Google ile Giriş Yap' : 'Sign in with Google') : (currentLang === 'tr' ? 'Google ile Kayıt Ol' : 'Sign up with Google')}</span>
          </button>
          ` : ''}

          <!-- Divider -->
          <div class="auth-divider">
            <span>${currentLang === 'tr' ? 'veya e-posta ile' : 'or with email'}</span>
          </div>

          <!-- Email/Password Auth Form -->
          <form id="auth-main-form" class="login-form" onsubmit="return false;">
            ${authMode === 'register' ? `
              <div class="input-group">
                <label for="auth-username">${currentLang === 'tr' ? 'Gezgin Adı / Kullanıcı Adı' : 'Traveler Name / Username'}</label>
                <input type="text" id="auth-username" maxlength="25" placeholder="${currentLang === 'tr' ? 'Örn: gezgin_mert, seyahatsever...' : 'e.g. globetrotter'}" value="${sanitizeText(usernameVal, 25)}" autocomplete="name" required />
              </div>

              <!-- Avatar Selection for Registration -->
              <div class="avatar-section" style="margin-top:4px;margin-bottom:8px;">
                <div class="avatar-label">${t('selectAvatar')}</div>
                <div class="avatar-grid" id="login-avatar-grid">
                  ${ALLOWED_AVATARS.map((emoji) => `
                    <button type="button" class="avatar-btn ${emoji === selectedAvatar ? 'selected' : ''}" data-emoji="${emoji}" tabindex="-1" aria-label="Avatar ${emoji}">${emoji}</button>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <div class="input-group">
              <label for="auth-email">${currentLang === 'tr' ? 'E-Posta Adresi' : 'Email Address'}</label>
              <input type="email" id="auth-email" placeholder="ornek@email.com" value="${escapeHtml(emailVal)}" autocomplete="email" required />
            </div>

            <div class="input-group">
              <label for="auth-password">${currentLang === 'tr' ? 'Şifre' : 'Password'}</label>
              <div style="position:relative;">
                <input type="password" id="auth-password" style="padding-right:44px;" placeholder="${authMode === 'register' ? (currentLang === 'tr' ? 'En az 6 karakter' : 'At least 6 characters') : '••••••••'}" value="${escapeHtml(passwordVal)}" autocomplete="${authMode === 'register' ? 'new-password' : 'current-password'}" required />
                <button type="button" id="btn-toggle-password" tabindex="-1" title="Şifreyi Göster/Gizle" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#94a3b8;font-size:1.1rem;padding:4px;line-height:1;">👁</button>
              </div>
            </div>

            <!-- "Oturumum Açık Kalsın" Checkbox & Şifremi Unuttum -->
            <div class="auth-checkbox-row" style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
              <label class="auth-checkbox-label">
                <input type="checkbox" id="auth-remember-me" ${rememberMe ? 'checked' : ''} />
                <span>${currentLang === 'tr' ? 'Oturumum açık kalsın' : 'Keep me signed in'}</span>
              </label>
              ${authMode === 'login' ? `
                <button type="button" id="btn-forgot-password" style="background:none;border:none;color:#60a5fa;font-size:0.8rem;cursor:pointer;padding:0;text-decoration:underline;">
                  ${currentLang === 'tr' ? 'Şifremi Unuttum' : 'Forgot Password?'}
                </button>
              ` : ''}
            </div>

            <button type="submit" id="auth-submit-btn" class="login-btn" style="margin-top:6px;">
              <span>${authMode === 'login' ? '🚀' : '✨'}</span>
              <span>${authMode === 'login' ? (currentLang === 'tr' ? 'Giriş Yap' : 'Sign In') : (currentLang === 'tr' ? 'Kayıt Ol ve Keşfe Başla' : 'Register & Start Exploring')}</span>
            </button>
          </form>

          <!-- Switch Prompt -->
          <div class="auth-switch-prompt">
            ${authMode === 'login' ? `
              <span>${currentLang === 'tr' ? 'Henüz hesabın yok mu?' : "Don't have an account?"}</span>
              <button type="button" class="auth-switch-link" id="link-switch-register">${currentLang === 'tr' ? 'Kayıt Ol' : 'Sign Up'}</button>
            ` : `
              <span>${currentLang === 'tr' ? 'Zaten hesabın var mı?' : 'Already have an account?'}</span>
              <button type="button" class="auth-switch-link" id="link-switch-login">${currentLang === 'tr' ? 'Giriş Yap' : 'Sign In'}</button>
            `}
          </div>

          <!-- Misafir Modu (Giriş Yapmadan Devam Et) - Apple & App Store Review Uyumluluğu -->
          <div style="margin-top:12px;text-align:center;">
            <button type="button" id="btn-guest-continue" style="
              width: 100%;
              background: rgba(148, 163, 184, 0.08);
              border: 1px dashed rgba(148, 163, 184, 0.28);
              border-radius: 12px;
              padding: 10px 14px;
              color: #cbd5e1;
              font-size: 0.85rem;
              font-weight: 600;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              transition: all 0.2s ease;
            ">
              <span>🗺️</span>
              <span>${currentLang === 'tr' ? 'Giriş Yapmadan Devam Et (Misafir Modu)' : 'Continue as Guest (Explore Map)'}</span>
            </button>
          </div>

          <!-- Gizlilik Politikası ve Koşullar (Huawei Rule 7.5 & App Store Compliance) -->
          <div class="auth-privacy-agreement" style="margin-top:14px;text-align:center;font-size:0.75rem;color:#94a3b8;line-height:1.45;">
            ${currentLang === 'tr'
              ? 'Devam ederek <a href="https://gittigim-yerler.vercel.app/privacy.html" target="_blank" rel="noopener" style="color:#60a5fa;text-decoration:underline;font-weight:600;">Gizlilik Politikası</a>\'nı kabul etmiş olursunuz.'
              : 'By continuing, you agree to our <a href="https://gittigim-yerler.vercel.app/privacy.html" target="_blank" rel="noopener" style="color:#60a5fa;text-decoration:underline;font-weight:600;">Privacy Policy</a>.'}
          </div>

          <div class="login-note" style="margin-top:8px;">${t('notePrivacy')}</div>
        </div>
      </div>
    `;

    // ── Interactive Listeners ──
    const emailInput = container.querySelector('#auth-email');
    const passwordInput = container.querySelector('#auth-password');
    const usernameInput = container.querySelector('#auth-username');
    const rememberCheckbox = container.querySelector('#auth-remember-me');

    rememberCheckbox?.addEventListener('change', (e) => {
      rememberMe = e.target.checked;
    });

    container.querySelector('#btn-toggle-password')?.addEventListener('click', () => {
      const pwdInput = container.querySelector('#auth-password');
      if (!pwdInput) return;
      const isHidden = pwdInput.type === 'password';
      pwdInput.type = isHidden ? 'text' : 'password';
      const btn = container.querySelector('#btn-toggle-password');
      if (btn) btn.textContent = isHidden ? '🙈' : '👁';
    });

    // Migration banner butonları
    container.querySelector('#btn-migration-signup')?.addEventListener('click', () => {
      migrateLegacyData = true;
      authMode = 'register';
      render();
    });
    container.querySelector('#btn-migration-dismiss')?.addEventListener('click', () => {
      localStorage.setItem('gv_migration_dismissed', '1');
      const banner = container.querySelector('#migration-banner');
      if (banner) banner.remove();
    });

    const syncFormState = () => {
      if (emailInput) emailVal = emailInput.value.trim();
      if (passwordInput) passwordVal = passwordInput.value;
      if (usernameInput) usernameVal = usernameInput.value.trim();
      if (rememberCheckbox) rememberMe = rememberCheckbox.checked;
    };

    container.querySelector('#tab-login')?.addEventListener('click', () => {
      if (authMode !== 'login') {
        syncFormState();
        authMode = 'login';
        render();
      }
    });

    container.querySelector('#tab-register')?.addEventListener('click', () => {
      if (authMode !== 'register') {
        syncFormState();
        authMode = 'register';
        render();
      }
    });

    container.querySelector('#link-switch-register')?.addEventListener('click', () => {
      syncFormState();
      authMode = 'register';
      render();
    });

    container.querySelector('#link-switch-login')?.addEventListener('click', () => {
      syncFormState();
      authMode = 'login';
      render();
    });

    container.querySelector('#btn-guest-continue')?.addEventListener('click', () => {
      const guestProfile = {
        uid: 'guest_' + Math.random().toString(36).substring(2, 9),
        username: currentLang === 'tr' ? 'Misafir Gezgin' : 'Guest Traveler',
        avatar: '🧭',
        bio: currentLang === 'tr' ? 'Haritayı keşfeden misafir gezgin' : 'Guest exploring the world map',
        createdAt: new Date().toISOString(),
        isGuest: true
      };
      saveAndCompleteLogin(guestProfile, false);
    });

    container.querySelector('#btn-forgot-password')?.addEventListener('click', async (e) => {
      e.preventDefault();
      syncFormState();
      const emailInput = container.querySelector('#auth-email');
      const email = (emailInput?.value || emailVal || '').trim();
      if (!email || !email.includes('@')) {
        alert(currentLang === 'tr' ? 'Lütfen önce geçerli bir e-posta adresi yazın.' : 'Please enter a valid email address first.');
        emailInput?.focus();
        return;
      }
      if (!navigator.onLine) {
        alert(currentLang === 'tr' ? 'Şifre sıfırlama işlemi için internet bağlantısı gereklidir.' : 'Internet connection is required for password reset.');
        return;
      }
      try {
        await sendPasswordResetEmail(auth, email);
        alert(currentLang === 'tr' 
          ? `Şifre sıfırlama bağlantısı ${email} adresinize gönderildi. Lütfen gelen kutunuzu (ve spam/gereksiz klasörünü) kontrol edin.` 
          : `Password reset link has been sent to ${email}. Please check your inbox and spam folder.`);
      } catch (err) {
        console.warn('Password reset error:', err);
        let msg = currentLang === 'tr' ? 'Şifre sıfırlama e-postası gönderilemedi.' : 'Failed to send password reset email.';
        if (err?.code === 'auth/user-not-found') {
          msg = currentLang === 'tr' ? 'Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.' : 'No user found with this email address.';
        } else if (err?.code === 'auth/invalid-email') {
          msg = currentLang === 'tr' ? 'Geçersiz e-posta formatı.' : 'Invalid email format.';
        }
        alert(msg);
      }
    });

    container.querySelector('#login-lang-toggle')?.addEventListener('click', () => {
      syncFormState();
      const nextLang = currentLang === 'tr' ? 'en' : 'tr';
      setLanguage(nextLang);
      render();
    });

    // ── Social sign-in helpers (REAL provider tokens only; no password derivation, no fake sheets) ──
    const NATIVE_PLATFORM = window.Capacitor?.getPlatform?.() || 'web';
    const hasAndroidGoogleBridge = !!(window.NativeAuthBridge && typeof window.NativeAuthBridge.signInWithGoogle === 'function');
    const hasIosAuthBridge = !!(window.webkit?.messageHandlers?.nativeAuth);

    const isCancelledError = (err) => {
      const code = String(err?.code || '');
      return code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request' || code === 'native/cancelled';
    };

    const socialErrorMessage = (err, providerLabel) => {
      const code = String(err?.code || '');
      if (code === 'auth/operation-not-allowed') {
        return currentLang === 'tr'
          ? `${providerLabel} ile giriş şu anda etkin değil. Lütfen e-posta ile giriş yapın.`
          : `${providerLabel} sign-in is not enabled right now. Please sign in with email.`;
      }
      if (code === 'auth/account-exists-with-different-credential') {
        return currentLang === 'tr'
          ? 'Bu e-posta başka bir giriş yöntemiyle kayıtlı. Önce o yöntemle giriş yapın.'
          : 'This email is registered with a different sign-in method. Please use that method first.';
      }
      if (code === 'auth/network-request-failed') {
        return currentLang === 'tr' ? 'İnternet bağlantısı hatası. Lütfen tekrar deneyin.' : 'Network error. Please try again.';
      }
      if (code === 'auth/popup-blocked') {
        return currentLang === 'tr' ? 'Açılır pencere engellendi. Lütfen izin verip tekrar deneyin.' : 'Popup was blocked. Please allow popups and try again.';
      }
      if (code === 'auth/invalid-credential' || code === 'auth/invalid-app-credential') {
        return currentLang === 'tr' ? `${providerLabel} girişi doğrulanamadı. Lütfen tekrar deneyin.` : `Could not verify ${providerLabel} sign-in. Please try again.`;
      }
      return currentLang === 'tr'
        ? `${providerLabel} ile giriş tamamlanamadı. Lütfen tekrar deneyin veya e-posta ile giriş yapın.`
        : `Could not complete ${providerLabel} sign-in. Please try again or use email.`;
    };

    const setBtnLoading = (btn, loading) => {
      if (!btn) return;
      btn.disabled = loading;
      btn.style.opacity = loading ? '0.7' : '1';
      btn.style.pointerEvents = loading ? 'none' : 'auto';
    };

    // Complete app login for a user that Firebase has ALREADY authenticated with a verified provider credential.
    // Same email => same Firebase account (Firebase links by email), so cloud data always matches.
    const finishFirebaseSocialLogin = async (user, providerName, nameHint = '') => {
      if (!user) throw new Error('No Firebase user');
      const email = String(user.email || user.providerData?.find(p => p?.email)?.email || '').trim().toLowerCase();
      const rawName = user.displayName || nameHint || (email ? email.split('@')[0] : '') || 'Gezgin';
      const username = sanitizeText(String(rawName).slice(0, 25), 25) || 'Gezgin';
      if (!user.displayName && nameHint) {
        await updateProfile(user, { displayName: username }).catch(() => {});
      }
      await saveAndCompleteLogin({
        uid: user.uid,
        username,
        email,
        avatar: selectedAvatar || (providerName === 'google' ? '✈️' : '🧭'),
        photoUrl: user.photoURL || null,
        authProvider: providerName,
        createdAt: new Date().toISOString()
      }, rememberMe);
    };

    const requestNativeGoogleIdToken = () => new Promise((resolve, reject) => {
      window.__onNativeGoogleAuthResult = (res) => {
        window.__onNativeGoogleAuthResult = null;
        if (res?.idToken) return resolve(res.idToken);
        const err = new Error(res?.error || 'cancelled');
        err.code = res?.error ? `native/error-${res.code ?? 'unknown'}` : 'native/cancelled';
        reject(err);
      };
      if (hasAndroidGoogleBridge) {
        window.NativeAuthBridge.signInWithGoogle();
      } else {
        window.webkit.messageHandlers.nativeAuth.postMessage({ action: 'signInWithGoogle' });
      }
    });

    const randomNonce = () => {
      const bytes = new Uint8Array(32);
      crypto.getRandomValues(bytes);
      return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    };
    const sha256Hex = async (text) => {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
    };

    const requestNativeAppleToken = (hashedNonce) => new Promise((resolve, reject) => {
      window.__onNativeAppleAuthResult = (res) => {
        window.__onNativeAppleAuthResult = null;
        if (res?.identityToken) return resolve(res);
        const err = new Error(res?.error || 'cancelled');
        err.code = res?.error ? 'native/error' : 'native/cancelled';
        reject(err);
      };
      window.webkit.messageHandlers.nativeAuth.postMessage({ action: 'signInWithApple', nonce: hashedNonce });
    });

    // ── Google ──
    const googleBtn = container.querySelector('#btn-google-auth');
    googleBtn?.addEventListener('click', async () => {
      syncFormState();
      if (!navigator.onLine) {
        alert(currentLang === 'tr' ? 'Google ile giriş yapmak için internet bağlantısı gereklidir.' : 'Internet connection is required to sign in with Google.');
        return;
      }
      if (!auth) {
        alert(currentLang === 'tr' ? 'Kimlik doğrulama servisine şu anda ulaşılamıyor. Lütfen e-posta ile giriş yapın.' : 'Authentication service is unavailable. Please sign in with email.');
        return;
      }
      setBtnLoading(googleBtn, true);
      try {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
        let cred;
        if (hasAndroidGoogleBridge || hasIosAuthBridge) {
          const idToken = await requestNativeGoogleIdToken();
          cred = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
        } else {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: 'select_account' });
          cred = await signInWithPopup(auth, provider);
        }
        await finishFirebaseSocialLogin(cred.user, 'google');
      } catch (err) {
        if (!isCancelledError(err)) {
          console.warn('Google sign-in error:', err?.code, err?.message);
          alert(socialErrorMessage(err, 'Google'));
        }
      } finally {
        setBtnLoading(googleBtn, false);
      }
    });

    // ── Apple ──
    const appleBtn = container.querySelector('#btn-apple-auth');
    appleBtn?.addEventListener('click', async () => {
      syncFormState();
      if (!navigator.onLine) {
        alert(currentLang === 'tr' ? 'Apple ile giriş yapmak için internet bağlantısı gereklidir.' : 'Internet connection is required to sign in with Apple.');
        return;
      }
      if (!auth) {
        alert(currentLang === 'tr' ? 'Kimlik doğrulama servisine şu anda ulaşılamıyor. Lütfen e-posta ile giriş yapın.' : 'Authentication service is unavailable. Please sign in with email.');
        return;
      }
      setBtnLoading(appleBtn, true);
      try {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
        const appleProvider = new OAuthProvider('apple.com');
        appleProvider.addScope('email');
        appleProvider.addScope('name');
        let cred;
        let nameHint = '';
        if (hasIosAuthBridge) {
          const rawNonce = randomNonce();
          const res = await requestNativeAppleToken(await sha256Hex(rawNonce));
          nameHint = res.fullName || '';
          cred = await signInWithCredential(auth, appleProvider.credential({ idToken: res.identityToken, rawNonce }));
        } else {
          cred = await signInWithPopup(auth, appleProvider);
        }
        await finishFirebaseSocialLogin(cred.user, 'apple', nameHint);
      } catch (err) {
        if (!isCancelledError(err)) {
          console.warn('Apple sign-in error:', err?.code, err?.message);
          alert(socialErrorMessage(err, 'Apple'));
        }
      } finally {
        setBtnLoading(appleBtn, false);
      }
    });

    // Avatar pick in registration
    container.querySelectorAll('.avatar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const emo = btn.getAttribute('data-emoji');
        if (ALLOWED_AVATARS.includes(emo)) {
          selectedAvatar = emo;
        }
      });
    });

    // Form submission with Firebase Auth
    const form = container.querySelector('#auth-main-form');
    const handleSubmit = async () => {
      if (_isSubmitting) return;
      _isSubmitting = true;
      try {
        syncFormState();

        if (!emailVal || !emailVal.includes('@')) {
          alert(currentLang === 'tr' ? 'Lütfen geçerli bir e-posta adresi girin.' : 'Please enter a valid email address.');
          return;
        }

        if (!passwordVal || passwordVal.length < 4) {
          alert(currentLang === 'tr' ? 'Lütfen şifrenizi girin (en az 4 karakter).' : 'Please enter password (min 4 chars).');
          return;
        }

        let profileUsername = '';
        if (authMode === 'register') {
          const rawUser = usernameVal.trim();
          profileUsername = sanitizeText(rawUser.slice(0, 25), 25) || emailVal.split('@')[0];
          if (profileUsername.length < 3) {
            alert(currentLang === 'tr' 
              ? 'Kullanıcı adı en az 3 karakter olmalıdır.' 
              : 'Username must be at least 3 characters.');
            return;
          }
          const isAvail = await isUsernameAvailableAsync(profileUsername);
          if (!isAvail) {
            alert(currentLang === 'tr' 
              ? `"${profileUsername}" kullanıcı adı zaten kullanımda. Lütfen başka bir kullanıcı adı seçin.` 
              : `Username "${profileUsername}" is already taken. Please choose another.`);
            return;
          }
        } else {
          // In login mode, only reuse stored profile username if it belongs to this same email
          let existingName = emailVal.split('@')[0];
          try {
            const stored = localStorage.getItem('gv_profile') || sessionStorage.getItem('gv_profile');
            if (stored) {
              const p = JSON.parse(stored);
              if (p?.username && p?.email && String(p.email).toLowerCase().trim() === emailVal.toLowerCase().trim()) {
                existingName = p.username;
              }
            }
          } catch {}
          profileUsername = existingName;
        }

        // Capitalize clean display name
        let formattedName = profileUsername.replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        // Attempt real Firebase Auth in background
        if (navigator.onLine && auth) {
          try {
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
            if (authMode === 'register') {
              const cred = await createUserWithEmailAndPassword(auth, emailVal, passwordVal);
              if (cred.user) {
                await updateProfile(cred.user, { displayName: formattedName }).catch(() => {});
              }
            } else {
              const cred = await signInWithEmailAndPassword(auth, emailVal, passwordVal);
              if (cred?.user?.displayName) {
                formattedName = cred.user.displayName;
              }
            }
          } catch (fbErr) {
            console.warn('Firebase auth notice:', fbErr?.code || fbErr?.message);
            let msg = fbErr.message || (currentLang === 'tr' ? 'Giriş başarısız. Lütfen tekrar deneyin.' : 'Sign in failed. Please try again.');
            if (fbErr.code === 'auth/wrong-password' || fbErr.code === 'auth/invalid-credential') {
              msg = currentLang === 'tr'
                ? 'E-posta veya şifre hatalı. Bu hesabı Google/Apple ile açtıysanız o butonla giriş yapın.'
                : 'Incorrect email or password. If you created this account with Google/Apple, use that button instead.';
            } else if (fbErr.code === 'auth/user-not-found') {
              msg = currentLang === 'tr' ? 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.' : 'No account found with this email.';
            } else if (fbErr.code === 'auth/email-already-in-use') {
              msg = currentLang === 'tr' ? 'Bu e-posta adresi zaten kullanımda.' : 'This email is already registered.';
            } else if (fbErr.code === 'auth/too-many-requests') {
              msg = currentLang === 'tr' ? 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.' : 'Too many failed attempts. Please try again later.';
            } else if (fbErr.code === 'auth/weak-password') {
              msg = currentLang === 'tr' ? 'Şifre çok zayıf. En az 6 karakter kullanın.' : 'Password too weak. Use at least 6 characters.';
            }
            alert(msg);
            return;
          }
        }

        const profile = {
          username: formattedName,
          email: emailVal,
          avatar: selectedAvatar,
          createdAt: new Date().toISOString()
        };

        await saveAndCompleteLogin(profile, rememberMe);
      } finally {
        _isSubmitting = false;
      }
    };

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = container.querySelector('#auth-submit-btn');
        const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.7';
          submitBtn.style.pointerEvents = 'none';
          submitBtn.innerHTML = `<span>⏳</span><span>${currentLang === 'tr' ? 'Giriş yapılıyor...' : 'Signing in...'}</span>`;
        }
        await handleSubmit();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.style.pointerEvents = 'auto';
          if (originalBtnHtml) submitBtn.innerHTML = originalBtnHtml;
        }
      });
    }
  }

  render();
}
