import { t, getLanguage, setLanguage } from '../utils/i18n.js';

export function renderLoginPage(container, onLogin) {
  // Check if already logged in
  if (localStorage.getItem('gv_logged_in') === '1') {
    try {
      const profileStr = localStorage.getItem('gv_profile');
      if (profileStr) {
        const profile = JSON.parse(profileStr);
        onLogin(profile);
        return;
      }
    } catch (e) {
      console.error('Profile parse error', e);
    }
  }

  let selectedAvatar = '🧭';

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
              ${['🧭', '🗺️', '✈️', '🚀', '🏔️', '🏖️', '🎒', '🌊', '🦅', '🌺', '🐉', '🦁'].map((emoji) => `
                <button class="avatar-btn ${emoji === selectedAvatar ? 'selected' : ''}" data-emoji="${emoji}">${emoji}</button>
              `).join('')}
            </div>
          </div>
          <div class="login-form">
            <div class="input-group">
              <label for="login-username">${t('username')}</label>
              <input type="text" id="login-username" maxlength="20" placeholder="${t('usernamePlaceholder')}" autocomplete="off">
            </div>
            <div class="input-group">
              <label for="login-bio">${t('bio')}</label>
              <input type="text" id="login-bio" maxlength="60" placeholder="${t('bioPlaceholder')}" autocomplete="off">
            </div>
          </div>
          <button id="login-start-btn" class="login-btn">${t('startMap')}</button>
          <div class="login-note">${t('notePrivacy')}</div>
        </div>
      </div>
    `;

    const langBtn = container.querySelector('#login-lang-toggle');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
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
        selectedAvatar = btn.getAttribute('data-emoji');
      });
    });

    const startBtn = container.querySelector('#login-start-btn');
    const usernameInput = container.querySelector('#login-username');
    const bioInput = container.querySelector('#login-bio');

    startBtn.addEventListener('click', () => {
      const defaultName = currentLang === 'tr' ? 'Maceracı' : 'Adventurer';
      const username = usernameInput.value.trim() || defaultName;
      const bio = bioInput.value.trim();
      const createdAt = new Date().toISOString();

      const profile = { username, bio, avatar: selectedAvatar, createdAt };
      localStorage.setItem('gv_logged_in', '1');
      localStorage.setItem('gv_profile', JSON.stringify(profile));

      onLogin(profile);
    });
  }

  render();
}
