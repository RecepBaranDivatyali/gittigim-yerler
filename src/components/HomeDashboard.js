import { calculateStats } from '../utils/storage.js';

export function renderHomeDashboard(container, onNavigate) {
  const stats = calculateStats();

  container.innerHTML = `
    <div class="hero-header">
      <h1 class="hero-title">Gittiğin Yerleri İşaretle & Say 🗺️</h1>
      <p class="hero-subtitle">
        Dünyadaki tüm ülkeleri ve şehirleri tek bir interaktif harita üzerinde işaretle, seyahat oranlarını takip et!
      </p>
    </div>

    <!-- Quick Stats Row -->
    <div class="quick-stats-row">
      <div class="stat-box">
        <div class="stat-icon">🇹🇷</div>
        <div>
          <div class="stat-val" style="color: #ef4444;">${stats.turkeyCount} <span style="font-size: 1rem; font-weight: normal; color: #94a3b8;">/ 81 İl</span></div>
          <div class="stat-label">Türkiye Gezilen (%${stats.turkeyPercentage})</div>
        </div>
      </div>

      <div class="stat-box">
        <div class="stat-icon">🌍</div>
        <div>
          <div class="stat-val" style="color: #3b82f6;">${stats.worldCountryCount} <span style="font-size: 1rem; font-weight: normal; color: #94a3b8;">Ülke</span></div>
          <div class="stat-label">Dünya Gezilen (%${stats.worldPercentage})</div>
        </div>
      </div>

      <div class="stat-box">
        <div class="stat-icon">🏙️</div>
        <div>
          <div class="stat-val" style="color: #10b981;">${stats.worldCityCount}</div>
          <div class="stat-label">Dünya Şehri İşaretlendi</div>
        </div>
      </div>

      <div class="stat-box">
        <div class="stat-icon">🏆</div>
        <div>
          <div class="stat-val" style="color: #f59e0b;">${stats.totalPlacesMarked}</div>
          <div class="stat-label">Toplam İşaretlenen Yer</div>
        </div>
      </div>
    </div>

    <!-- Unified Master Portal Card -->
    <div style="max-width: 860px; margin: 0 auto 3rem auto;">
      <div class="portal-card world" id="portal-world-click" style="min-height: 360px;">
        <div class="portal-card-bg-icon">🌍</div>
        <div>
          <div class="portal-header">
            <div class="portal-badge-icon">🌍</div>
            <div>
              <h2 class="portal-title">DÜNYA & TÜRKİYE İNTERAKTİF HARİTASI</h2>
              <span style="font-size: 0.85rem; color: #60a5fa; font-weight: 600;">YAKINLAŞTIRMA DESTEKLİ ÜLKE & ŞEHİR TAKİBİ</span>
            </div>
          </div>
          <p class="portal-desc">
            Haritada uzaklaşınca ülkeler, yaklaştıkça ise Türkiye illeri ve Dünya şehir sınırları görünür. Almanya'da Münih, Berlin gibi şehirleri arama çubuğuyla kolayca işaretleyin!
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <div class="portal-progress-wrapper" style="margin-bottom: 0;">
              <div class="progress-header">
                <span>🇹🇷 Türkiye İlerlemesi</span>
                <span>${stats.turkeyCount} / 81 İl (%${stats.turkeyPercentage})</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill tr" style="width: ${stats.turkeyPercentage}%;"></div>
              </div>
            </div>

            <div class="portal-progress-wrapper" style="margin-bottom: 0;">
              <div class="progress-header">
                <span>🌍 Dünya İlerlemesi</span>
                <span>${stats.worldCountryCount} / 195 Ülke (%${stats.worldPercentage})</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill world" style="width: ${stats.worldPercentage}%;"></div>
              </div>
            </div>
          </div>
        </div>

        <button class="portal-cta" style="font-size: 1.1rem; padding: 1.1rem;">
          🌍 İnteraktif Haritayı Aç &rarr;
        </button>
      </div>
    </div>
  `;

  // Attach Navigation Click Handler
  container.querySelector('#portal-world-click').addEventListener('click', () => onNavigate('world'));
}
