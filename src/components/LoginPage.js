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

  container.innerHTML = `
    <div class="login-overlay">
      <div class="login-card">
        <div class="login-logo">
          <span class="login-globe">🌍</span>
          <h1 class="login-title">Gittiğim Yerler</h1>
          <p class="login-subtitle">Keşfet, kaydet, paylaş</p>
        </div>
        <div class="avatar-section">
          <div class="avatar-label">Bir Avatar Seç</div>
          <div class="avatar-grid" id="login-avatar-grid">
            ${['🧭', '🗺️', '✈️', '🚀', '🏔️', '🏖️', '🎒', '🌊', '🦅', '🌺', '🐉', '🦁'].map((emoji, i) => `
              <button class="avatar-btn ${i === 0 ? 'selected' : ''}" data-emoji="${emoji}">${emoji}</button>
            `).join('')}
          </div>
        </div>
        <div class="login-form">
          <div class="input-group">
            <label for="login-username">Kullanıcı Adı</label>
            <input type="text" id="login-username" maxlength="20" placeholder="Maceracı" autocomplete="off">
          </div>
          <div class="input-group">
            <label for="login-bio">Biyografi (İsteğe Bağlı)</label>
            <input type="text" id="login-bio" maxlength="60" placeholder="Dünyayı geziyorum..." autocomplete="off">
          </div>
        </div>
        <button id="login-start-btn" class="login-btn">Haritaya Başla</button>
        <div class="login-note">Verileriniz yalnızca tarayıcınızda saklanır</div>
      </div>
    </div>
  `;

  let selectedAvatar = '🧭';

  const avatarBtns = container.querySelectorAll('.avatar-btn');
  avatarBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      avatarBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedAvatar = btn.getAttribute('data-emoji');
    });
  });

  const startBtn = document.getElementById('login-start-btn');
  const usernameInput = document.getElementById('login-username');
  const bioInput = document.getElementById('login-bio');

  startBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim() || 'Maceracı';
    const bio = bioInput.value.trim();
    const createdAt = new Date().toISOString();

    const profile = { username, bio, avatar: selectedAvatar, createdAt };
    localStorage.setItem('gv_logged_in', '1');
    localStorage.setItem('gv_profile', JSON.stringify(profile));

    onLogin(profile);
  });
}
