import { getStorageData, calculateStats } from '../utils/storage.js';

export function createNavbar(currentTab, onTabChange) {
  const stats = calculateStats();
  
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.innerHTML = `
    <div class="nav-brand" id="nav-brand-click">
      <span class="nav-logo-icon">📍</span>
      <span>Gittiğim Yerler</span>
    </div>

    <div class="nav-menu">
      <button class="nav-btn ${currentTab === 'home' ? 'active' : ''}" data-tab="home">
        🏠 Ana Sayfa
      </button>
      <button class="nav-btn ${currentTab === 'world' || currentTab === 'turkey' ? 'active' : ''}" data-tab="world">
        🌍 Dünya & Türkiye Haritası
      </button>
      <button class="nav-btn ${currentTab === 'stats' ? 'active' : ''}" data-tab="stats">
        📊 İstatistik & Rozetler
      </button>
    </div>
  `;

  // Event Listeners
  nav.querySelector('#nav-brand-click').addEventListener('click', () => onTabChange('home'));

  nav.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.getAttribute('data-tab');
      onTabChange(tab);
    });
  });

  return nav;
}
