import { t, getLanguage, setLanguage } from '../utils/i18n.js';
import { sanitizeText, escapeHtml } from '../utils/security.js';
import { registerOrUpdateCurrentUser } from '../utils/userDatabase.js';

const ALLOWED_AVATARS = ['🧭', '🗺️', '✈️', '🚀', '🏔️', '🏖️', '🎒', '🌊', '🦅', '🌺', '🐉', '🦁', '🐤', '🐥'];

export function renderLoginPage(container, onLogin) {
  // Check if already logged in (Persistent localStorage or current sessionStorage)
  const isLogged = localStorage.getItem('gv_logged_in') === '1' || sessionStorage.getItem('gv_logged_in') === '1';
  if (isLogged) {
    try {
      const profileStr = localStorage.getItem('gv_profile') || sessionStorage.getItem('gv_profile');
      if (profileStr) {
        const profile = JSON.parse(profileStr);
        if (profile && profile.username) {
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

  let authMode = 'login'; // 'login' | 'register'
  let rememberMe = true;
  let selectedAvatar = '🧭';
  let emailVal = '';
  let passwordVal = '';
  let usernameVal = '';

  function saveAndCompleteLogin(profile, remember) {
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

    try {
      registerOrUpdateCurrentUser(profile);
    } catch (e) {
      console.warn('Could not register in community db', e);
    }

    onLogin(profile);
  }

  function showGoogleAccountPicker(currentLang) {
    const picker = document.createElement('div');
    picker.className = 'google-picker-overlay';
    picker.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(6px);z-index:10005;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn 0.2s ease;';

    const defaultName = 'Baran Divatyalı';
    const defaultEmail = 'baran.divatyali@gmail.com';

    picker.innerHTML = `
      <div style="background:#ffffff;border-radius:20px;width:min(400px, 100%);box-shadow:0 24px 60px rgba(0,0,0,0.35);padding:24px;color:#202124;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;animation:slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <svg style="width:24px;height:24px;" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span style="font-size:1rem;font-weight:600;color:#3c4043;">Google</span>
          </div>
          <button type="button" id="btn-google-cancel" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#5f6368;line-height:1;">&times;</button>
        </div>

        <div style="margin-bottom:18px;">
          <h3 style="margin:0 0 4px 0;font-size:1.15rem;font-weight:700;color:#202124;">${currentLang === 'tr' ? 'Bir hesap seçin' : 'Choose an account'}</h3>
          <p style="margin:0;font-size:0.85rem;color:#5f6368;">${currentLang === 'tr' ? 'Gezgin uygulamasına devam etmek için' : 'to continue to Gezgin'}</p>
        </div>

        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:18px;">
          <div id="btn-pick-account-main" style="display:flex;align-items:center;gap:12px;padding:10px 12px;border:1px solid #dadce0;border-radius:12px;cursor:pointer;transition:background 0.2s ease;">
            <div style="width:38px;height:38px;border-radius:50%;background:#1a73e8;color:#ffffff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1rem;">B</div>
            <div style="flex:1;min-width:0;">
              <div style="font-weight:600;font-size:0.92rem;color:#202124;">${defaultName}</div>
              <div style="font-size:0.8rem;color:#5f6368;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${defaultEmail}</div>
            </div>
            <span style="color:#1a73e8;font-size:1.1rem;">➔</span>
          </div>

          <div id="btn-pick-account-custom" style="display:flex;align-items:center;gap:12px;padding:10px 12px;border:1px solid #dadce0;border-radius:12px;cursor:pointer;transition:background 0.2s ease;">
            <div style="width:38px;height:38px;border-radius:50%;background:#f1f3f4;color:#5f6368;display:flex;align-items:center;justify-content:center;font-size:1.2rem;">👤</div>
            <div style="flex:1;">
              <div style="font-weight:600;font-size:0.88rem;color:#3c4043;">${currentLang === 'tr' ? 'Başka bir Google hesabı kullan' : 'Use another account'}</div>
            </div>
          </div>
        </div>

        <div style="font-size:0.75rem;color:#70757a;line-height:1.4;border-top:1px solid #e8eaed;padding-top:12px;">
          ${currentLang === 'tr' ? 'Devam ederek Gezgin uygulamasının adınızı, e-posta adresinizi ve profil resminizi doğrulamasına izin verirsiniz.' : 'To continue, Google will share your name, email address, and profile picture with Gezgin.'}
        </div>
      </div>
    `;

    document.body.appendChild(picker);

    const closePicker = () => picker.remove();

    picker.querySelector('#btn-google-cancel')?.addEventListener('click', closePicker);
    picker.addEventListener('click', (e) => {
      if (e.target === picker) closePicker();
    });

    picker.querySelector('#btn-pick-account-main')?.addEventListener('click', () => {
      closePicker();
      const profile = {
        username: 'Baran Divatyalı',
        email: defaultEmail,
        avatar: '🧭',
        photoUrl: null,
        authProvider: 'google',
        createdAt: new Date().toISOString()
      };
      saveAndCompleteLogin(profile, rememberMe);
    });

    picker.querySelector('#btn-pick-account-custom')?.addEventListener('click', () => {
      closePicker();
      const promptEmail = prompt(currentLang === 'tr' ? 'Google E-posta Adresiniz:' : 'Your Google Email:', '');
      if (promptEmail && promptEmail.includes('@')) {
        const cleanName = promptEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const profile = {
          username: cleanName || 'Google Gezgini',
          email: promptEmail,
          avatar: '🧭',
          authProvider: 'google',
          createdAt: new Date().toISOString()
        };
        saveAndCompleteLogin(profile, rememberMe);
      }
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
          <!-- Logo & Branding -->
          <div class="login-logo">
            <span class="login-globe">🌍</span>
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

          <!-- Official Google Single Sign-On Button -->
          <button type="button" class="google-auth-btn" id="btn-google-auth">
            <svg class="google-icon-svg" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>${authMode === 'login' ? (currentLang === 'tr' ? 'Google ile Giriş Yap' : 'Sign in with Google') : (currentLang === 'tr' ? 'Google ile Kayıt Ol' : 'Sign up with Google')}</span>
          </button>

          <!-- Divider -->
          <div class="auth-divider">
            <span>${currentLang === 'tr' ? 'veya e-posta ile' : 'or with email'}</span>
          </div>

          <!-- Email/Password Auth Form -->
          <form id="auth-main-form" class="login-form" onsubmit="return false;">
            ${authMode === 'register' ? `
              <div class="input-group">
                <label for="auth-username">${currentLang === 'tr' ? 'Gezgin Adı / Kullanıcı Adı' : 'Traveler Name / Username'}</label>
                <input type="text" id="auth-username" maxlength="25" placeholder="${currentLang === 'tr' ? 'Örn: atlas_mert, selin...' : 'e.g. atlas_mert'}" value="${sanitizeText(usernameVal, 25)}" autocomplete="name" required />
              </div>

              <!-- Avatar Selection for Registration -->
              <div class="avatar-section" style="margin-top:4px;margin-bottom:8px;">
                <div class="avatar-label">${t('selectAvatar')}</div>
                <div class="avatar-grid" id="login-avatar-grid">
                  ${ALLOWED_AVATARS.map((emoji) => `
                    <button type="button" class="avatar-btn ${emoji === selectedAvatar ? 'selected' : ''}" data-emoji="${emoji}" aria-label="Avatar ${emoji}">${emoji}</button>
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
              <input type="password" id="auth-password" placeholder="${authMode === 'register' ? (currentLang === 'tr' ? 'En az 6 karakter' : 'At least 6 characters') : '••••••••'}" value="${escapeHtml(passwordVal)}" autocomplete="${authMode === 'register' ? 'new-password' : 'current-password'}" required />
            </div>

            <!-- "Oturumum Açık Kalsın" Checkbox (User Request) -->
            <div class="auth-checkbox-row">
              <label class="auth-checkbox-label">
                <input type="checkbox" id="auth-remember-me" ${rememberMe ? 'checked' : ''} />
                <span>${currentLang === 'tr' ? 'Oturumum açık kalsın' : 'Keep me signed in'}</span>
              </label>
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

          <div class="login-note">${t('notePrivacy')}</div>
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

    container.querySelector('#login-lang-toggle')?.addEventListener('click', () => {
      syncFormState();
      const nextLang = currentLang === 'tr' ? 'en' : 'tr';
      setLanguage(nextLang);
      render();
    });

    // Google Sign-In button click
    container.querySelector('#btn-google-auth')?.addEventListener('click', () => {
      syncFormState();
      showGoogleAccountPicker(currentLang);
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

    // Form submission
    const form = container.querySelector('#auth-main-form');
    const handleSubmit = () => {
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
        profileUsername = sanitizeText(usernameVal.slice(0, 25), 25) || emailVal.split('@')[0];
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
      const formattedName = profileUsername.replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      const profile = {
        username: formattedName,
        email: emailVal,
        avatar: selectedAvatar,
        createdAt: new Date().toISOString()
      };

      saveAndCompleteLogin(profile, rememberMe);
    };

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSubmit();
      });
    }
  }

  render();
}
