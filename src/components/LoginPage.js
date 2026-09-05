import { t, getLanguage, setLanguage } from '../utils/i18n.js';
import { sanitizeText } from '../utils/security.js';

const ALLOWED_AVATARS = ['🧭', '🗺️', '✈️', '🚀', '🏔️', '🏖️', '🎒', '🌊', '🦅', '🌺', '🐉', '🦁'];

export function renderLoginPage(container, onLogin) {
  // Check if already logged in
  if (localStorage.getItem('gv_logged_in') === '1') {
    try {
      const profileStr = localStorage.getItem('gv_profile');
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
    }
  }

  let selectedAvatar = '🧭';
  let savedUsername = '';
  let savedBio = '';

  function render() {
    const currentLang = getLanguage();

    container.innerHTML = `
      <div class="login-overlay">
        <div style="position:absolute;top:20px;right:20px;z-index:10001;">
          <div class="lang-toggle-btn" id="login-lang-toggle" style="background:rgba(30,41,59,0.8);border:1px solid rgba(255,255,255,0.15);border-radius:20px;padding:6px 14px;color:#f8fafc;font-size:0.85rem;cursor:pointer;display:flex;align-items:center;gap:6px;backdrop-filter:blur(8px);">
            <span>🌐</span>
            <span style="font-weight:700;">${currentLang.toUpperCase()}</span>
          </div>
        </div>

        <div class="login-card">
          <div class="login-logo">
            <span class="login-globe">🌍</span>
            <h1 class="login-title">${t('appName')}</h1>
            <p class="login-subtitle">${t('appSubtitle')}</p>
          </div>
          <div class="avatar-section">
            <div class="avatar-label">${t('selectAvatar')}</div>
            <div class="avatar-grid" id="login-avatar-grid">
              ${ALLOWED_AVATARS.map((emoji) => `
                <button type="button" class="avatar-btn ${emoji === selectedAvatar ? 'selected' : ''}" data-emoji="${emoji}" aria-label="Avatar ${emoji}" title="Avatar ${emoji}">${emoji}</button>
              `).join('')}
            </div>
          </div>
          <form id="login-inner-form" class="login-form" onsubmit="return false;">
            <div class="input-group">
              <label for="login-username">${t('username')}</label>
              <input type="text" id="login-username" maxlength="20" placeholder="${t('usernamePlaceholder')}" value="${sanitizeText(savedUsername, 20)}" autocomplete="off">
            </div>
            <div class="input-group">
              <label for="login-bio">${t('bio')}</label>
              <input type="text" id="login-bio" maxlength="60" placeholder="${t('bioPlaceholder')}" value="${sanitizeText(savedBio, 60)}" autocomplete="off">
            </div>
            <button type="submit" id="login-start-btn" class="login-btn">${t('startMap')}</button>
          </form>
          <div class="login-note">${t('notePrivacy')}</div>
        </div>
      </div>
    `;

    const usernameInput = container.querySelector('#login-username');
    const bioInput = container.querySelector('#login-bio');

    const langBtn = container.querySelector('#login-lang-toggle');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        if (usernameInput) savedUsername = usernameInput.value;
        if (bioInput) savedBio = bioInput.value;
        const nextLang = currentLang === 'tr' ? 'en' : 'tr';
        setLanguage(nextLang);
        render();
      });
    }

    const avatarBtns = container.querySelectorAll('.avatar-btn');
    avatarBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        avatarBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const emo = btn.getAttribute('data-emoji');
        if (ALLOWED_AVATARS.includes(emo)) {
          selectedAvatar = emo;
        }
      });
    });

    const form = container.querySelector('#login-inner-form');
    const handleSubmit = () => {
      const defaultName = currentLang === 'tr' ? 'Maceracı' : 'Adventurer';
      const rawUser = usernameInput ? usernameInput.value.trim() : '';
      const rawBio = bioInput ? bioInput.value.trim() : '';

      const username = sanitizeText(rawUser.slice(0, 20), 20) || defaultName;
      const bio = sanitizeText(rawBio.slice(0, 60), 60);
      const avatar = ALLOWED_AVATARS.includes(selectedAvatar) ? selectedAvatar : '🧭';
      const createdAt = new Date().toISOString();

      const profile = { username, bio, avatar, createdAt };
      localStorage.setItem('gv_logged_in', '1');
      localStorage.setItem('gv_profile', JSON.stringify(profile));

      onLogin(profile);
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
