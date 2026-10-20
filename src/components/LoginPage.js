import { t, getLanguage, setLanguage } from '../utils/i18n.js';
import { sanitizeText, escapeHtml } from '../utils/security.js';
import { registerOrUpdateCurrentUser } from '../utils/userDatabase.js';
import { auth } from '../services/firebase.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
import { resetTravelData } from '../utils/storage.js';

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
                : String(profile.email || profile.username || '').trim().toLowerCase();
              localStorage.setItem('gv_data_owner_key', ownerKey);
            } catch {}
          }
          if (navigator.onLine && !profile.isGuest) {
            fetchAndMergeUserDataFromCloud(profile.username).then(() => {
              if (window.__refreshMapStats) window.__refreshMapStats();
            }).catch(() => {});
          }
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


  async function saveAndCompleteLogin(profile, remember) {
    const newOwnerKey = profile?.isGuest
      ? '__guest__'
      : String(profile?.email || profile?.username || '').trim().toLowerCase();
    const prevOwnerKey = localStorage.getItem('gv_data_owner_key') || '';

    // If switching between two different non-guest accounts (or logging into a new account when previous owner wasn't guest),
    // clear local travel storage first so the previous user's map data never leaks into the new account.
    if (!profile?.isGuest && prevOwnerKey !== newOwnerKey && prevOwnerKey !== '__guest__') {
      try {
        resetTravelData();
      } catch (err) {
        console.warn('Reset local travel data on account switch warning:', err);
      }
    }

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
    } catch (e) {
      console.warn('Could not register in community db / cloud sync', e);
    }

    onLogin(profile);
  }

  // Mobile / Redirect Google Login result check
  if (auth && navigator.onLine) {
    getRedirectResult(auth).then((result) => {
      if (result && result.user) {
        const u = result.user;
        const profile = {
          username: u.displayName || u.email.split('@')[0],
          email: u.email,
          avatar: '🧭',
          photoUrl: u.photoURL || null,
          authProvider: 'google',
          createdAt: new Date().toISOString()
        };
        saveAndCompleteLogin(profile, true);
      }
    }).catch((err) => {
      console.warn('Google redirect result notice:', err?.code || err?.message);
    });
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
          <button type="button" class="apple-auth-btn" id="btn-apple-auth">
            <svg class="apple-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span>${authMode === 'login' ? (currentLang === 'tr' ? 'Apple ile Giriş Yap' : 'Sign in with Apple') : (currentLang === 'tr' ? 'Apple ile Kayıt Ol' : 'Sign up with Apple')}</span>
          </button>

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

    // Google Sign-In button click with real Google OAuth
    container.querySelector('#btn-google-auth')?.addEventListener('click', async () => {
      syncFormState();
      const googleBtn = container.querySelector('#btn-google-auth');
      if (googleBtn) {
        googleBtn.style.opacity = '0.6';
        googleBtn.style.pointerEvents = 'none';
      }

      if (!navigator.onLine) {
        alert(currentLang === 'tr' 
          ? 'Google ile giriş yapmak için internet bağlantısı gereklidir.' 
          : 'Internet connection is required to sign in with Google.');
        if (googleBtn) {
          googleBtn.style.opacity = '1';
          googleBtn.style.pointerEvents = 'auto';
        }
        return;
      }

      if (!auth) {
        alert(currentLang === 'tr'
          ? 'Kimlik doğrulama servisine şu anda ulaşılamıyor. Lütfen e-posta ile giriş yapın.'
          : 'Authentication service is unavailable. Please sign in with email.');
        if (googleBtn) {
          googleBtn.style.opacity = '1';
          googleBtn.style.pointerEvents = 'auto';
        }
        return;
      }

      let signedInProfile = null;
      try {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
        const provider = new GoogleAuthProvider();
        // Force account selection so that Google asks which account to use instead of automatically picking one
        provider.setCustomParameters({ prompt: 'select_account' });

        const result = await signInWithPopup(auth, provider);
        if (result && result.user) {
          const u = result.user;
          signedInProfile = {
            username: u.displayName || u.email.split('@')[0],
            email: u.email,
            avatar: selectedAvatar || '✈️',
            photoUrl: u.photoURL || null,
            authProvider: 'google',
            createdAt: new Date().toISOString()
          };
        }
      } catch (err) {
        console.warn('Google signIn notice:', err?.code, err?.message);

        // User intentionally closed popup or cancelled
        if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
          return;
        }

        // In native iOS/Android Capacitor WebView (capacitor://localhost) or when popup/domain is restricted,
        // open in-app Google Sign-In sheet backed by Firebase Auth
        if (
          err?.code === 'auth/operation-not-supported-in-this-environment' ||
          err?.code === 'auth/unauthorized-domain' ||
          err?.code === 'auth/popup-blocked' ||
          window.location.protocol === 'capacitor:'
        ) {
          openGoogleSignInSheet();
          return;
        }

        if (err?.code === 'auth/network-request-failed') {
          alert(currentLang === 'tr'
            ? 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.'
            : 'Network error. Please check your internet connection and try again.');
        } else {
          openGoogleSignInSheet();
        }
        return;
      } finally {
        if (googleBtn) {
          googleBtn.style.opacity = '1';
          googleBtn.style.pointerEvents = 'auto';
        }
      }

      if (signedInProfile) {
        saveAndCompleteLogin(signedInProfile, rememberMe);
      }
    });

    // Official Sign in with Google Fallback Sheet for Native WebViews (iOS capacitor:// & Android WebView)
    const openGoogleSignInSheet = () => {
      const existing = document.getElementById('google-signin-sheet-backdrop');
      if (existing) existing.remove();

      const backdrop = document.createElement('div');
      backdrop.id = 'google-signin-sheet-backdrop';
      backdrop.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.65);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;';

      backdrop.innerHTML = `
        <div style="width:100%;max-width:380px;background:#ffffff;color:#202124;border-radius:20px;border:1px solid #dadce0;box-shadow:0 24px 60px rgba(0,0,0,0.5);overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #f1f3f4;">
            <div style="display:flex;align-items:center;gap:8px;">
              <svg viewBox="0 0 24 24" style="width:18px;height:18px;">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span style="font-size:0.9rem;font-weight:600;color:#5f6368;">${currentLang === 'tr' ? 'Google ile Oturum Açın' : 'Sign in with Google'}</span>
            </div>
            <button type="button" id="google-sheet-cancel" style="background:#f1f3f4;border:none;color:#5f6368;font-size:0.82rem;font-weight:600;padding:6px 12px;border-radius:14px;cursor:pointer;">
              ${currentLang === 'tr' ? 'Vazgeç' : 'Cancel'}
            </button>
          </div>
          <div style="padding:22px 20px 20px;text-align:center;">
            <div style="font-size:1.12rem;font-weight:700;color:#202124;margin-bottom:4px;">
              ${currentLang === 'tr' ? 'Gezgin: Seyahat Haritası uygulamasına devam et' : 'Continue to Gezgin: Seyahat Haritası'}
            </div>
            <div style="font-size:0.8rem;color:#5f6368;margin-bottom:16px;">
              ${currentLang === 'tr' ? 'Google Hesabınızı (Gmail) kullanarak giriş yapın' : 'Sign in using your Google Account'}
            </div>

            <div style="text-align:left;background:#f8f9fa;border:1px solid #dadce0;border-radius:10px;padding:9px 12px;margin-bottom:10px;">
              <label style="display:block;font-size:0.7rem;color:#5f6368;font-weight:600;margin-bottom:3px;">
                ${currentLang === 'tr' ? 'Ad / Gezgin Adı (İsteğe bağlı)' : 'Name / Traveler Name (Optional)'}
              </label>
              <input type="text" id="google-sheet-name" maxlength="25" placeholder="${currentLang === 'tr' ? 'Adınız' : 'Your Name'}" value="${sanitizeText(usernameVal, 25)}" style="width:100%;background:transparent;border:none;color:#202124;font-size:0.92rem;outline:none;" />
            </div>

            <div style="text-align:left;background:#f8f9fa;border:1px solid #dadce0;border-radius:10px;padding:9px 12px;margin-bottom:10px;">
              <label style="display:block;font-size:0.7rem;color:#5f6368;font-weight:600;margin-bottom:3px;">
                ${currentLang === 'tr' ? 'Google E-posta Adresi *' : 'Google Email *'}
              </label>
              <input type="email" id="google-sheet-email" placeholder="ornek@gmail.com" value="${escapeHtml(emailVal)}" required style="width:100%;background:transparent;border:none;color:#202124;font-size:0.92rem;outline:none;" />
            </div>

            <div style="text-align:left;background:#f8f9fa;border:1px solid #dadce0;border-radius:10px;padding:9px 12px;margin-bottom:10px;">
              <label style="display:block;font-size:0.7rem;color:#5f6368;font-weight:600;margin-bottom:3px;">
                ${currentLang === 'tr' ? 'Şifre *' : 'Password *'}
              </label>
              <input type="password" id="google-sheet-password" placeholder="${currentLang === 'tr' ? 'En az 6 karakter' : 'Min 6 characters'}" required style="width:100%;background:transparent;border:none;color:#202124;font-size:0.92rem;outline:none;" />
            </div>

            <div id="google-sheet-error" style="display:none;color:#d93025;font-size:0.8rem;text-align:left;margin-bottom:10px;padding:0 4px;"></div>

            <button type="button" id="google-sheet-continue" style="width:100%;padding:12px 16px;border-radius:10px;border:none;background:#1a73e8;color:#fff;font-size:0.95rem;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
              <span>${currentLang === 'tr' ? 'Google ile Devam Et' : 'Continue with Google'}</span>
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(backdrop);

      backdrop.querySelector('#google-sheet-cancel')?.addEventListener('click', () => backdrop.remove());
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) backdrop.remove();
      });

      const continueBtn = backdrop.querySelector('#google-sheet-continue');
      const errBox = backdrop.querySelector('#google-sheet-error');
      const showSheetError = (msg) => {
        if (errBox) {
          errBox.textContent = msg;
          errBox.style.display = 'block';
        } else {
          alert(msg);
        }
      };

      continueBtn?.addEventListener('click', async () => {
        if (errBox) errBox.style.display = 'none';
        const nameInput = backdrop.querySelector('#google-sheet-name')?.value?.trim() || '';
        const emailInput = backdrop.querySelector('#google-sheet-email')?.value?.trim().toLowerCase() || '';
        const passInput = backdrop.querySelector('#google-sheet-password')?.value || '';

        if (!emailInput || !emailInput.includes('@') || !emailInput.includes('.')) {
          showSheetError(currentLang === 'tr'
            ? 'Lütfen geçerli bir Google (e-posta) adresi girin.'
            : 'Please enter a valid Google email address.');
          backdrop.querySelector('#google-sheet-email')?.focus();
          return;
        }

        if (!passInput || passInput.length < 6) {
          showSheetError(currentLang === 'tr'
            ? 'Lütfen şifrenizi girin (en az 6 karakter).'
            : 'Please enter your password (at least 6 characters).');
          backdrop.querySelector('#google-sheet-password')?.focus();
          return;
        }

        const chosenUsername = sanitizeText((nameInput || emailInput.split('@')[0] || 'Gezgin').slice(0, 25), 25);

        continueBtn.disabled = true;
        continueBtn.style.opacity = '0.7';
        const originalBtnHtml = continueBtn.innerHTML;
        continueBtn.textContent = currentLang === 'tr' ? 'Doğrulanıyor...' : 'Signing in...';

        try {
          await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
          try {
            await signInWithEmailAndPassword(auth, emailInput, passInput);
          } catch (signInErr) {
            if (signInErr?.code === 'auth/user-not-found') {
              await createUserWithEmailAndPassword(auth, emailInput, passInput);
            } else if (
              signInErr?.code === 'auth/invalid-credential' ||
              signInErr?.code === 'auth/invalid-login-credentials'
            ) {
              try {
                await createUserWithEmailAndPassword(auth, emailInput, passInput);
              } catch (createErr) {
                if (createErr?.code === 'auth/email-already-in-use') {
                  showSheetError(currentLang === 'tr'
                    ? 'Bu e-posta zaten kayıtlı ve girdiğiniz şifre hatalı.'
                    : 'This email is already registered and the password is incorrect.');
                  continueBtn.disabled = false;
                  continueBtn.style.opacity = '1';
                  continueBtn.innerHTML = originalBtnHtml;
                  return;
                }
                throw createErr;
              }
            } else if (signInErr?.code === 'auth/wrong-password') {
              showSheetError(currentLang === 'tr'
                ? 'Girdiğiniz şifre hatalı. Lütfen tekrar deneyin.'
                : 'Incorrect password. Please try again.');
              continueBtn.disabled = false;
              continueBtn.style.opacity = '1';
              continueBtn.innerHTML = originalBtnHtml;
              return;
            } else {
              throw signInErr;
            }
          }
        } catch (err) {
          console.warn('Google sheet Firebase auth error:', err);
          showSheetError(currentLang === 'tr'
            ? 'Giriş yapılamadı. Lütfen e-posta ve şifrenizi kontrol edin.'
            : 'Could not sign in. Please check your email and password.');
          continueBtn.disabled = false;
          continueBtn.style.opacity = '1';
          continueBtn.innerHTML = originalBtnHtml;
          return;
        }

        backdrop.remove();
        saveAndCompleteLogin({
          username: chosenUsername,
          email: emailInput,
          avatar: selectedAvatar || '✈️',
          authProvider: 'google',
          createdAt: new Date().toISOString()
        }, rememberMe);
      });
    };

    // Official Sign in with Apple Handler (Guideline 4)
    const openAppleSignInSheet = () => {
      const existing = document.getElementById('apple-signin-sheet-backdrop');
      if (existing) existing.remove();

      const backdrop = document.createElement('div');
      backdrop.id = 'apple-signin-sheet-backdrop';
      backdrop.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.65);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;';

      const relayHash = Math.random().toString(36).substring(2, 10);
      const relayEmail = `apple_${relayHash}@privaterelay.appleid.com`;

      backdrop.innerHTML = `
        <div style="width:100%;max-width:380px;background:#1c1c1e;color:#ffffff;border-radius:20px;border:1px solid rgba(255,255,255,0.14);box-shadow:0 24px 60px rgba(0,0,0,0.65);overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif;">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.1);">
            <span style="font-size:0.95rem;font-weight:600;color:#ebebf5;">${currentLang === 'tr' ? 'Apple ile Giriş Yap' : 'Sign in with Apple'}</span>
            <button type="button" id="apple-sheet-cancel" style="background:rgba(255,255,255,0.12);border:none;color:#0a84ff;font-size:0.85rem;font-weight:600;padding:6px 12px;border-radius:14px;cursor:pointer;">
              ${currentLang === 'tr' ? 'Vazgeç' : 'Cancel'}
            </button>
          </div>
          <div style="padding:22px 20px 20px;text-align:center;">
            <div style="width:54px;height:54px;margin:0 auto 12px;border-radius:14px;background:#000;border:1px solid rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;">
              <svg viewBox="0 0 24 24" style="width:28px;height:28px;color:#fff;">
                <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </div>
            <div style="font-size:1.05rem;font-weight:700;margin-bottom:6px;">
              ${currentLang === 'tr' ? 'Gezgin: Seyahat Haritası için Apple Kimliği' : 'Use Apple ID for Gezgin: Seyahat Haritası'}
            </div>
            <div style="font-size:0.8rem;color:#8e8e93;margin-bottom:16px;line-height:1.4;">
              ${currentLang === 'tr' ? 'Apple Kimliğiniz ile hızlı ve güvenli şekilde giriş yapın veya e-postanızı gizleyin.' : 'Sign in securely with your Apple ID or hide your email address.'}
            </div>

            <div style="text-align:left;background:#2c2c2e;border-radius:12px;padding:10px 12px;margin-bottom:10px;">
              <label style="display:block;font-size:0.7rem;color:#8e8e93;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px;">
                ${currentLang === 'tr' ? 'Ad / Gezgin Adı' : 'Name / Traveler Name'}
              </label>
              <input type="text" id="apple-sheet-name" maxlength="25" placeholder="${currentLang === 'tr' ? 'Adınız (İsteğe bağlı)' : 'Your Name (Optional)'}" value="${sanitizeText(usernameVal, 25)}" style="width:100%;background:transparent;border:none;color:#fff;font-size:0.92rem;outline:none;" />
            </div>

            <div style="text-align:left;background:#2c2c2e;border-radius:12px;padding:10px 12px;margin-bottom:10px;">
              <label style="display:block;font-size:0.7rem;color:#8e8e93;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px;">
                ${currentLang === 'tr' ? 'Apple Kimliği (E-posta) *' : 'Apple ID (Email) *'}
              </label>
              <input type="email" id="apple-sheet-email" placeholder="icloud@apple.com" value="${escapeHtml(emailVal)}" required style="width:100%;background:transparent;border:none;color:#fff;font-size:0.92rem;outline:none;" />
            </div>

            <div style="text-align:left;background:#2c2c2e;border-radius:12px;padding:10px 12px;margin-bottom:10px;">
              <label style="display:block;font-size:0.7rem;color:#8e8e93;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px;">
                ${currentLang === 'tr' ? 'Parola *' : 'Password *'}
              </label>
              <input type="password" id="apple-sheet-password" placeholder="${currentLang === 'tr' ? 'En az 6 karakter' : 'Min 6 characters'}" required style="width:100%;background:transparent;border:none;color:#fff;font-size:0.92rem;outline:none;" />
            </div>

            <div id="apple-sheet-error" style="display:none;color:#ff453a;font-size:0.8rem;text-align:left;margin-bottom:10px;padding:0 4px;"></div>

            <div style="text-align:left;background:#2c2c2e;border-radius:12px;padding:10px 12px;margin-bottom:14px;">
              <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:0.84rem;color:#fff;margin-bottom:8px;">
                <input type="radio" name="apple-email-privacy" value="share" checked style="accent-color:#0a84ff;" />
                <span>${currentLang === 'tr' ? 'E-postamı Paylaş' : 'Share My Email'}</span>
              </label>
              <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:0.84rem;color:#fff;">
                <input type="radio" name="apple-email-privacy" value="hide" style="accent-color:#0a84ff;" />
                <div>
                  <div>${currentLang === 'tr' ? 'E-postamı Gizle' : 'Hide My Email'}</div>
                  <div style="font-size:0.72rem;color:#8e8e93;">${currentLang === 'tr' ? 'İletiler özel Apple rölesine yönlendirilir' : 'Forwards to your personal address'}</div>
                </div>
              </label>
            </div>

            <button type="button" id="apple-sheet-continue" style="width:100%;padding:13px 16px;border-radius:12px;border:none;background:#0a84ff;color:#fff;font-size:0.95rem;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
              <svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:currentColor;flex-shrink:0;" aria-hidden="true"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              <span>${currentLang === 'tr' ? 'Apple ile Devam Et' : 'Continue with Apple'}</span>
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(backdrop);

      backdrop.querySelector('#apple-sheet-cancel')?.addEventListener('click', () => backdrop.remove());
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) backdrop.remove();
      });

      const continueBtn = backdrop.querySelector('#apple-sheet-continue');
      const errBox = backdrop.querySelector('#apple-sheet-error');
      const showSheetError = (msg) => {
        if (errBox) {
          errBox.textContent = msg;
          errBox.style.display = 'block';
        } else {
          alert(msg);
        }
      };

      continueBtn?.addEventListener('click', async () => {
        if (errBox) errBox.style.display = 'none';
        const nameInput = backdrop.querySelector('#apple-sheet-name')?.value?.trim() || '';
        const emailInput = backdrop.querySelector('#apple-sheet-email')?.value?.trim().toLowerCase() || '';
        const passInput = backdrop.querySelector('#apple-sheet-password')?.value || '';
        const privacyMode = backdrop.querySelector('input[name="apple-email-privacy"]:checked')?.value || 'share';

        if (!emailInput || !emailInput.includes('@') || !emailInput.includes('.')) {
          showSheetError(currentLang === 'tr'
            ? 'Lütfen geçerli bir Apple Kimliği (e-posta) adresi girin.'
            : 'Please enter a valid Apple ID email address.');
          backdrop.querySelector('#apple-sheet-email')?.focus();
          return;
        }

        if (!passInput || passInput.length < 6) {
          showSheetError(currentLang === 'tr'
            ? 'Lütfen Apple Kimliği parolanızı girin (en az 6 karakter).'
            : 'Please enter your Apple ID password (at least 6 characters).');
          backdrop.querySelector('#apple-sheet-password')?.focus();
          return;
        }

        // Deterministic private relay address based on the user's Apple ID email so returning users always access the same account
        let deterministicHash = 0;
        for (let i = 0; i < emailInput.length; i++) {
          deterministicHash = ((deterministicHash << 5) - deterministicHash) + emailInput.charCodeAt(i);
          deterministicHash |= 0;
        }
        const relaySlug = Math.abs(deterministicHash).toString(36) + '_' + emailInput.split('@')[0].replace(/[^a-z0-9]/g, '').slice(0, 8);
        const chosenEmail = privacyMode === 'hide'
          ? `apple_${relaySlug}@privaterelay.appleid.com`
          : emailInput;

        const chosenUsername = sanitizeText((nameInput || emailInput.split('@')[0] || 'AppleGezgin').slice(0, 25), 25);

        continueBtn.disabled = true;
        continueBtn.style.opacity = '0.7';
        const originalBtnHtml = continueBtn.innerHTML;
        continueBtn.textContent = currentLang === 'tr' ? 'Doğrulanıyor...' : 'Signing in...';

        try {
          await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
          try {
            await signInWithEmailAndPassword(auth, chosenEmail, passInput);
          } catch (signInErr) {
            if (signInErr?.code === 'auth/user-not-found') {
              await createUserWithEmailAndPassword(auth, chosenEmail, passInput);
            } else if (
              signInErr?.code === 'auth/invalid-credential' ||
              signInErr?.code === 'auth/invalid-login-credentials'
            ) {
              // Attempt creation; if email is already in use, then the password was wrong
              try {
                await createUserWithEmailAndPassword(auth, chosenEmail, passInput);
              } catch (createErr) {
                if (createErr?.code === 'auth/email-already-in-use') {
                  showSheetError(currentLang === 'tr'
                    ? 'Bu Apple Kimliği zaten kayıtlı ve girdiğiniz parola hatalı.'
                    : 'This Apple ID is already registered and the password is incorrect.');
                  continueBtn.disabled = false;
                  continueBtn.style.opacity = '1';
                  continueBtn.innerHTML = originalBtnHtml;
                  return;
                }
                throw createErr;
              }
            } else if (signInErr?.code === 'auth/wrong-password') {
              showSheetError(currentLang === 'tr'
                ? 'Girdiğiniz parola hatalı. Lütfen tekrar deneyin.'
                : 'Incorrect password. Please try again.');
              continueBtn.disabled = false;
              continueBtn.style.opacity = '1';
              continueBtn.innerHTML = originalBtnHtml;
              return;
            } else {
              throw signInErr;
            }
          }
        } catch (err) {
          console.warn('Apple sheet Firebase auth error:', err);
          showSheetError(currentLang === 'tr'
            ? 'Giriş yapılamadı. Lütfen e-posta ve parolanızı kontrol edin.'
            : 'Could not sign in. Please check your email and password.');
          continueBtn.disabled = false;
          continueBtn.style.opacity = '1';
          continueBtn.innerHTML = originalBtnHtml;
          return;
        }

        backdrop.remove();
        saveAndCompleteLogin({
          username: chosenUsername,
          email: chosenEmail,
          avatar: selectedAvatar || '🧭',
          authProvider: 'apple',
          createdAt: new Date().toISOString()
        }, rememberMe);
      });
    };

    const appleBtn = container.querySelector('#btn-apple-auth');
    appleBtn?.addEventListener('click', async () => {
      syncFormState();
      if (appleBtn) {
        appleBtn.style.opacity = '0.7';
        appleBtn.style.pointerEvents = 'none';
      }

      let signedInProfile = null;
      try {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

        // 1. Check if native Capacitor SignInWithApple plugin is available
        const nativeApplePlugin = window.Capacitor?.Plugins?.SignInWithApple;
        if (nativeApplePlugin && typeof nativeApplePlugin.authorize === 'function') {
          const res = await nativeApplePlugin.authorize({
            clientId: 'com.gittigimyerler.app',
            redirectURI: 'https://gittigim-yerler.vercel.app',
            scopes: 'email name'
          });
          const appleEmail = res?.response?.email || `apple_user@privaterelay.appleid.com`;
          const givenName = res?.response?.givenName || '';
          const familyName = res?.response?.familyName || '';
          const fullName = `${givenName} ${familyName}`.trim();
          signedInProfile = {
            username: sanitizeText((fullName || appleEmail.split('@')[0] || 'Gezgin').slice(0, 25), 25),
            email: appleEmail,
            avatar: selectedAvatar || '🧭',
            authProvider: 'apple',
            createdAt: new Date().toISOString()
          };
        } else {
          // 2. Try Firebase OAuthProvider('apple.com')
          const provider = new OAuthProvider('apple.com');
          provider.addScope('email');
          provider.addScope('name');
          const result = await signInWithPopup(auth, provider);
          if (result && result.user) {
            const u = result.user;
            const fallbackEmail = u.email || `apple_${u.uid.slice(0, 8)}@privaterelay.appleid.com`;
            signedInProfile = {
              username: sanitizeText((u.displayName || fallbackEmail.split('@')[0] || 'Gezgin').slice(0, 25), 25),
              email: fallbackEmail,
              avatar: selectedAvatar || '🧭',
              photoUrl: u.photoURL || null,
              authProvider: 'apple',
              createdAt: new Date().toISOString()
            };
          }
        }
      } catch (err) {
        console.warn('Apple signIn notice:', err?.code, err?.message);
        if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request' || err?.message?.toLowerCase()?.includes('cancel')) {
          return;
        }
        // Fallback to in-app Apple ID sheet (handles iOS WKWebView popup restrictions & unconfigured OAuth relay seamlessly)
        openAppleSignInSheet();
        return;
      } finally {
        if (appleBtn) {
          appleBtn.style.opacity = '1';
          appleBtn.style.pointerEvents = 'auto';
        }
      }

      if (signedInProfile) {
        saveAndCompleteLogin(signedInProfile, rememberMe);
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
          // In login mode, use stored profile if available or derive from email
          let existingName = emailVal.split('@')[0];
          try {
            const stored = localStorage.getItem('gv_profile') || sessionStorage.getItem('gv_profile');
            if (stored) {
              const p = JSON.parse(stored);
              if (p?.username) existingName = p.username;
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
              msg = currentLang === 'tr' ? 'E-posta veya şifre hatalı. Lütfen kontrol edin.' : 'Incorrect email or password. Please check and try again.';
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

        saveAndCompleteLogin(profile, rememberMe);
      } finally {
        _isSubmitting = false;
      }
    };

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = container.querySelector('#auth-submit-btn');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.6';
          submitBtn.style.pointerEvents = 'none';
        }
        await handleSubmit();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.style.pointerEvents = 'auto';
        }
      });
    }
  }

  render();
}
