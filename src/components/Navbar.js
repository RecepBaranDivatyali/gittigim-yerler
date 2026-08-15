import { getStorageData, calculateStats, exportBackup, importBackup } from '../utils/storage.js';

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

    <div class="nav-actions">
      <button class="action-btn" id="btn-export" title="Harita Verilerini İndir">
        💾 Yedekle
      </button>
      <button class="action-btn" id="btn-import" title="Yedek Yükle">
        📂 Yükle
      </button>
      <input type="file" id="file-import-input" accept=".json" style="display: none;" />
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

  nav.querySelector('#btn-export').addEventListener('click', exportBackup);

  const fileInput = nav.querySelector('#file-import-input');
  nav.querySelector('#btn-import').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (importBackup(evt.target.result)) {
          alert('Yedek başarıyla içe aktarıldı!');
        }
      };
      reader.readAsText(file);
    }
  });

  return nav;
}
