import { calculateStats, getStorageData } from '../utils/storage.js';
import { BADGES } from '../data/badges.js';
import { TURKEY_REGIONS } from '../data/turkeyData.js';
import { CONTINENTS } from '../data/worldData.js';
import { toPng } from 'html-to-image';

export function renderStatsView(container) {
  const stats = calculateStats();
  const { worldCities } = getStorageData();

  container.innerHTML = `
    <div class="view-header">
      <div class="view-title">
        <span>📊</span> Seyahat İstatistikleri & Rozetler
      </div>

      <button class="action-btn" id="btn-create-share-card" style="background: linear-gradient(135deg, #3b82f6, #ec4899); border: none; font-weight: 700;">
        📸 Harita Kartımı Paylaş / İndir
      </button>
    </div>

    <!-- Quick Stats Cards Grid -->
    <div class="quick-stats-row" style="margin-bottom: 2rem;">
      <div class="stat-box">
        <div class="stat-icon" style="background: rgba(239, 68, 68, 0.2); color: #ef4444;">🇹🇷</div>
        <div>
          <div class="stat-val" style="color: #ef4444;">%${stats.turkeyPercentage}</div>
          <div class="stat-label">Türkiye Gezilen (${stats.turkeyCount}/81 İl)</div>
        </div>
      </div>

      <div class="stat-box">
        <div class="stat-icon" style="background: rgba(59, 130, 246, 0.2); color: #3b82f6;">🌍</div>
        <div>
          <div class="stat-val" style="color: #3b82f6;">%${stats.worldPercentage}</div>
          <div class="stat-label">Dünya Gezilen (${stats.worldCountryCount}/195 Ülke)</div>
        </div>
      </div>

      <div class="stat-box">
        <div class="stat-icon" style="background: rgba(16, 185, 129, 0.2); color: #10b981;">🏙️</div>
        <div>
          <div class="stat-val" style="color: #10b981;">${stats.worldCityCount}</div>
          <div class="stat-label">Dünya Şehri Gezildi</div>
        </div>
      </div>

      <div class="stat-box">
        <div class="stat-icon" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b;">🎯</div>
        <div>
          <div class="stat-val" style="color: #f59e0b;">${stats.turkeyTargetCount + stats.worldTargetCount}</div>
          <div class="stat-label">Gezilecek Hedef Yerler</div>
        </div>
      </div>
    </div>

    <!-- Breakdowns: Regions vs Continents -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem; margin-bottom: 3rem;">
      <!-- Türkiye Bölge Dağılımı -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: var(--radius-lg); padding: 1.5rem;">
        <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>🇹🇷</span> Türkiye Bölge İlerlemeleri
        </h3>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${TURKEY_REGIONS.map(r => {
            const count = stats.regionCounts[r.id] || 0;
            const totalForRegion = getRegionTotal(r.id);
            const pct = Math.round((count / totalForRegion) * 100);
            return `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">
                  <span>${r.name}</span>
                  <span style="color: ${r.color};">${count}/${totalForRegion} İl (%${pct})</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" style="width: ${pct}%; background: ${r.color};"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Dünya Kıta Dağılımı -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: var(--radius-lg); padding: 1.5rem;">
        <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>🌍</span> Dünya Kıta Dağılımı
        </h3>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${CONTINENTS.map(c => {
            const count = stats.continentCounts[c.id] || 0;
            return `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">
                  <span>${c.icon} ${c.name}</span>
                  <span style="color: ${c.color};">${count} Ülke Gezildi</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" style="width: ${Math.min(count * 10, 100)}%; background: ${c.color};"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Marked Cities List snippet -->
        <div style="margin-top: 1.5rem; border-top: 1px solid var(--border-glass); padding-top: 1rem;">
          <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem; color: #94a3b8;">Gezilen Şehirler Özet Listesi (${worldCities.length})</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; max-height: 100px; overflow-y: auto;">
            ${worldCities.length === 0 ? '<span style="font-size: 0.8rem; color: #64748b;">Henüz şehir eklenmedi (Almanya -> Münih gibi şehirleri Dünya haritasından ekleyebilirsiniz).</span>' : ''}
            ${worldCities.map(c => `<span style="background: rgba(59,130,246,0.2); border: 1px solid rgba(59,130,246,0.4); color: #60a5fa; font-size: 0.75rem; padding: 2px 8px; border-radius: 12px;">📍 ${c.cityName}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Badges Showcase -->
    <div>
      <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem;">🏆 Başarı Rozetleri</h2>
      <p style="color: #94a3b8; font-size: 0.95rem;">Gezdiğin şehir ve ülkelere göre kazandığın seyahat unvanları.</p>

      <div class="badges-grid">
        ${BADGES.map(badge => {
          const isUnlocked = badge.condition(stats);
          return `
            <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}">
              <div class="badge-icon">${badge.icon}</div>
              <div class="badge-title" style="color: ${isUnlocked ? badge.color : '#94a3b8'};">${badge.title}</div>
              <div class="badge-desc">${badge.description}</div>
              <div style="margin-top: 0.5rem; font-size: 0.75rem; font-weight: 700;">
                ${isUnlocked ? '✅ KAZANILDI' : '🔒 KİLİTLİ'}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Export Share Modal Container -->
    <div id="share-modal-container"></div>
  `;

  // Share Card Handler
  container.querySelector('#btn-create-share-card').addEventListener('click', () => {
    openShareCardModal(container);
  });
}

function getRegionTotal(regionId) {
  const totals = {
    marmara: 11,
    ege: 8,
    akdeniz: 8,
    ic_anadolu: 13,
    karadeniz: 18,
    dogu_anadolu: 14,
    guneydogu_anadolu: 9
  };
  return totals[regionId] || 10;
}

function openShareCardModal(container) {
  const stats = calculateStats();
  const modalContainer = container.querySelector('#share-modal-container');

  modalContainer.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-card" style="max-width: 440px;">
        <button class="modal-close-btn" id="share-close">&times;</button>

        <h3 style="text-align: center; font-size: 1.3rem; margin-bottom: 0.5rem;">📸 Seyahat Kartım</h3>
        <p style="text-align: center; color: #94a3b8; font-size: 0.85rem; margin-bottom: 1rem;">Instagram veya sosyal medyada paylaşmak için resim olarak indir!</p>

        <!-- Preview Card to Capture -->
        <div id="capture-target-card" class="social-card-preview">
          <div style="font-size: 2.2rem; margin-bottom: 0.25rem;">🗺️</div>
          <div class="social-card-title">Gittiğim Yerler</div>
          <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 1rem;">Benim Seyahat Haritam</div>

          <div class="social-stats-grid">
            <div class="social-stat-pill">
              <div class="social-stat-num" style="color: #ef4444;">${stats.turkeyCount}/81</div>
              <div class="social-stat-lbl">Türkiye İlleri (%${stats.turkeyPercentage})</div>
            </div>
            <div class="social-stat-pill">
              <div class="social-stat-num" style="color: #3b82f6;">${stats.worldCountryCount}</div>
              <div class="social-stat-lbl">Dünya Ülkeleri</div>
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.06); padding: 0.75rem; border-radius: 12px; font-size: 0.85rem; margin-bottom: 1rem;">
            🏙️ <strong>${stats.worldCityCount}</strong> Dünya Şehri İşaretlendi
          </div>

          <div style="font-size: 0.75rem; color: #94a3b8;">
            gittigimyerler.app • Haritamı İncele
          </div>
        </div>

        <button class="portal-cta" id="btn-download-image" style="width: 100%; background: linear-gradient(135deg, #10b981, #059669); margin-top: 1rem;">
          📥 Kart Görselini İndir (.PNG)
        </button>
      </div>
    </div>
  `;

  modalContainer.querySelector('#share-close').addEventListener('click', () => {
    modalContainer.innerHTML = '';
  });

  modalContainer.querySelector('#btn-download-image').addEventListener('click', () => {
    const cardEl = modalContainer.querySelector('#capture-target-card');
    toPng(cardEl)
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `gittigim-yerler-haritam-${new Date().toISOString().split('T')[0]}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Error generating image:', err);
        alert('Görsel oluşturulurken bir hata oluştu.');
      });
  });
}
