import { 
  getStorageData, calculateStats, resetTravelData, 
  getBucketRanks, saveBucketRanks, 
  getUserAirlines, saveUserAirlines, toggleUserAirline,
  getUserAircraft, saveUserAircraft, toggleUserAircraft,
  AIRLINE_ALLIANCES, ALL_AIRLINES, AIRCRAFT_MODELS,
  getSavedFriends, saveFriend, deleteFriend 
} from '../utils/storage.js';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, getEarnedAchievements } from '../data/achievements.js';
import { WORLD_COUNTRIES } from '../data/worldData.js';
import { TURKEY_PROVINCES } from '../data/turkeyData.js';
import { t, getLanguage, setLanguage, getCountryDisplayName } from '../utils/i18n.js';
import { THEMES, getTheme, setTheme, COLOR_PALETTES, getStatusColor, setStatusColor, getUiSize, setUiSize } from '../utils/theme.js';
import { toPng } from 'html-to-image';
import { escapeHtml, sanitizeText, parseSecureShareCode } from '../utils/security.js';
import { POSTER_WORLD_MAP_SVG } from '../data/posterWorldMapSvg.js';

export function renderProfileView(container, onBack) {
  let activeTab = 'profile'; // profile, medals, compare, settings

  function render() {
    const currentLang = getLanguage();
    const currentTheme = getTheme();
    const currentUiSize = getUiSize();

    container.innerHTML = `
      <div class="profile-overlay">
        <div class="profile-topbar">
          <button class="profile-back-btn" id="profile-back">${t('backToMap')}</button>
          <div class="profile-tabs">
            <button class="ptab ${activeTab === 'profile' ? 'active' : ''}" data-tab="profile">👤 ${t('tabProfile')}</button>
            <button class="ptab ${activeTab === 'medals' ? 'active' : ''}" data-tab="medals">🏅 ${t('tabMedals')}</button>
            <button class="ptab ${activeTab === 'bucket' ? 'active' : ''}" data-tab="bucket">🎯 ${t('tabBucket')}</button>
            <button class="ptab ${activeTab === 'flights' ? 'active' : ''}" data-tab="flights">✈️ ${t('tabFlights')}</button>
            <button class="ptab ${activeTab === 'compare' ? 'active' : ''}" data-tab="compare">⚔️ ${t('tabCompare')}</button>
            <button class="ptab ${activeTab === 'settings' ? 'active' : ''}" data-tab="settings">⚙️ ${t('settings')}</button>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <button id="profile-logout" style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#f87171;border-radius:10px;padding:8px 14px;font-size:0.85rem;cursor:pointer;font-family:inherit;font-weight:600;">${t('logout')}</button>
          </div>
        </div>
        <div class="profile-content" id="profile-content-area"></div>
      </div>
    `;

    document.getElementById('profile-back').addEventListener('click', onBack);

    const logoutBtn = document.getElementById('profile-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm(t('logoutConfirm'))) {
          localStorage.removeItem('gv_logged_in');
          localStorage.removeItem('gv_profile');
          location.reload();
        }
      });
    }
    
    const tabs = container.querySelectorAll('.ptab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        activeTab = e.target.closest('.ptab').getAttribute('data-tab');
        render();
      });
    });

    const contentArea = document.getElementById('profile-content-area');
    if (activeTab === 'profile') renderProfileTab(contentArea);
    else if (activeTab === 'medals') renderMedalsTab(contentArea);
    else if (activeTab === 'bucket') renderBucketTab(contentArea);
    else if (activeTab === 'flights') renderFlightsTab(contentArea);
    else if (activeTab === 'compare') renderCompareTab(contentArea);
    else if (activeTab === 'settings') renderSettingsTab(contentArea);

    if (window.__openPosterOnProfile) {
      window.__openPosterOnProfile = false;
      setTimeout(() => openPosterModal(), 200);
    }
  }

  function renderProfileTab(contentArea) {
    const currentLang = getLanguage();
    let profile = { username: 'Kullanıcı', avatar: '🧭', bio: '' };
    try {
      const profileStr = localStorage.getItem('gv_profile');
      if (profileStr) {
        const parsed = JSON.parse(profileStr);
        if (parsed && typeof parsed === 'object') profile = parsed;
      }
    } catch (e) {
      console.error('Error parsing profile', e);
    }
    
    let earnedMedals = [];
    let storageData = { worldVisits: {}, turkeyVisits: {}, worldCities: [] };
    let baseStats = { worldCountryCount: 0, turkeyCount: 0, worldCityCount: 0, worldTargetCount: 0, continentCounts: {} };
    
    try {
      storageData = getStorageData();
      baseStats = calculateStats();
      earnedMedals = getEarnedAchievements(storageData, baseStats);
    } catch(e) { console.error('Error fetching stats', e); }

    const shareData = {
      profile,
      worldVisits: storageData.worldVisits,
      turkeyVisits: storageData.turkeyVisits,
      worldCities: storageData.worldCities
    };
    const shareCode = btoa(encodeURIComponent(JSON.stringify(shareData)));

    contentArea.innerHTML = `
      <div class="profile-main">
        <div class="profile-card">
          <div class="profile-card-label">${currentLang === 'tr' ? 'GEZGİN KARTI' : 'TRAVELER CARD'}</div>
          <div class="profile-header">
            <div class="profile-avatar">${escapeHtml(profile.avatar || '🧭')}</div>
            <div style="flex:1;">
              <div class="profile-username">${escapeHtml(profile.username || 'Gezgin')}</div>
              <div class="profile-bio">${escapeHtml(profile.bio) || (currentLang === 'tr' ? 'Dünyayı geziyor...' : 'Exploring the world...')}</div>
            </div>
            <button id="btn-trigger-poster" class="profile-poster-trigger-btn" title="${t('createPoster')}">
              <span>📸</span> <span class="poster-btn-txt">${t('createPoster')}</span>
            </button>
          </div>
          <div class="profile-stats">
            <div class="pstat"><span class="pstat-num" style="color:var(--status-visited, #ff5722)">${baseStats.worldCountryCount || 0}</span><span class="pstat-lbl">${t('countriesVisited')}</span></div>
            <div class="pstat"><span class="pstat-num" style="color:var(--status-visited, #ff5722)">${baseStats.turkeyCount || 0}</span><span class="pstat-lbl">${t('provincesVisited')}</span></div>
            <div class="pstat"><span class="pstat-num" style="color:#3b82f6">${baseStats.worldCityCount || 0}</span><span class="pstat-lbl">${t('citiesVisited')}</span></div>
            <div class="pstat"><span class="pstat-num" style="color:#10b981">${earnedMedals.length}/${ACHIEVEMENTS.length}</span><span class="pstat-lbl">${t('tabMedals')}</span></div>
          </div>
          ${earnedMedals.length > 0 ? `
            <div class="profile-badges-header" style="font-size:0.85rem;color:var(--theme-text-muted, #94a3b8);font-weight:600;margin-bottom:8px;">${currentLang === 'tr' ? 'Kazanılan Rozetler' : 'Earned Badges'} (${earnedMedals.length})</div>
            <div class="profile-badges">
              ${earnedMedals.map(m => `<span class="badge-icon" title="${m.title} - ${m.desc}">${m.icon}</span>`).join('')}
            </div>
          ` : `<div style="color:#64748b;font-size:0.85rem;margin-bottom:20px;">${currentLang === 'tr' ? 'Henüz madalya kazanılmadı. Haritada yerleri işaretleyerek madalya topla!' : 'No medals earned yet. Mark places on the map to earn medals!'}</div>`}
        </div>

        <!-- Share Section -->
        <div class="share-section">
          <h3>${t('shareCodeTitle')}</h3>
          <p>${t('shareCodeDesc')}</p>
          <div class="share-code-row">
            <input type="text" class="share-code-input" id="profile-share-code" readonly value="${shareCode}">
            <button class="share-copy-btn" id="profile-copy-btn">${t('copy')}</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-trigger-poster')?.addEventListener('click', () => {
      openPosterModal();
    });

    document.getElementById('profile-copy-btn')?.addEventListener('click', (e) => {
      const input = document.getElementById('profile-share-code');
      input.select();
      document.execCommand('copy');
      e.target.textContent = t('copied');
      setTimeout(() => e.target.textContent = t('copy'), 2000);
    });
  }

  function renderSettingsTab(contentArea) {
    const currentLang = getLanguage();
    const currentTheme = getTheme();
    const currentUiSize = getUiSize();
    const visitedColor = getStatusColor('visited');
    const plannedColor = getStatusColor('planned');
    const wishlistColor = getStatusColor('wishlist');

    contentArea.innerHTML = `
      <div class="profile-main">
        <!-- Appearance Theme & Language -->
        <div class="share-section" style="margin-top:0;">
          <h3 style="margin-bottom:16px;font-size:1.1rem;">🎨 ${t('theme')} & 🌐 ${t('language')}</h3>
          
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:20px;">
            <!-- Language Selector -->
            <div>
              <div style="font-size:0.85rem;color:var(--theme-text-muted, #94a3b8);margin-bottom:8px;font-weight:600;">🌐 ${t('language')}</div>
              <div style="display:flex;gap:8px;">
                <button class="lang-select-btn ${currentLang === 'tr' ? 'active' : ''}" data-lang="tr" style="flex:1;padding:12px;border-radius:12px;border:1px solid ${currentLang === 'tr' ? '#ff5722' : 'rgba(255,255,255,0.15)'};background:${currentLang === 'tr' ? 'rgba(255,87,34,0.2)' : 'rgba(15,23,42,0.6)'};color:var(--theme-text-main, #f8fafc);cursor:pointer;font-weight:700;font-size:0.9rem;">🇹🇷 Türkçe</button>
                <button class="lang-select-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en" style="flex:1;padding:12px;border-radius:12px;border:1px solid ${currentLang === 'en' ? '#ff5722' : 'rgba(255,255,255,0.15)'};background:${currentLang === 'en' ? 'rgba(255,87,34,0.2)' : 'rgba(15,23,42,0.6)'};color:var(--theme-text-main, #f8fafc);cursor:pointer;font-weight:700;font-size:0.9rem;">🇬🇧 English</button>
              </div>
            </div>

            <!-- Theme Selector (Dark & Light) -->
            <div>
              <div style="font-size:0.85rem;color:var(--theme-text-muted, #94a3b8);margin-bottom:8px;font-weight:600;">🌗 ${t('theme')}</div>
              <div style="display:flex;gap:8px;">
                <button class="theme-select-btn ${currentTheme === 'dark' ? 'active' : ''}" data-theme="dark" style="flex:1;padding:12px;border-radius:12px;border:1px solid ${currentTheme === 'dark' ? '#ff5722' : 'rgba(255,255,255,0.15)'};background:${currentTheme === 'dark' ? 'rgba(255,87,34,0.2)' : 'rgba(15,23,42,0.6)'};color:var(--theme-text-main, #f8fafc);cursor:pointer;font-weight:700;font-size:0.9rem;display:flex;align-items:center;justify-content:center;gap:6px;">
                  <span>🌙</span> <span>${t('themeDark')}</span>
                </button>
                <button class="theme-select-btn ${currentTheme === 'light' ? 'active' : ''}" data-theme="light" style="flex:1;padding:12px;border-radius:12px;border:1px solid ${currentTheme === 'light' ? '#ff5722' : 'rgba(255,255,255,0.15)'};background:${currentTheme === 'light' ? 'rgba(255,87,34,0.2)' : 'rgba(15,23,42,0.6)'};color:var(--theme-text-main, #f8fafc);cursor:pointer;font-weight:700;font-size:0.9rem;display:flex;align-items:center;justify-content:center;gap:6px;">
                  <span>☀️</span> <span>${t('themeLight')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Custom Map Colors Card -->
        <div class="share-section">
          <h3 style="margin-bottom:12px;font-size:1.1rem;">🌈 ${t('customizeColors')}</h3>
          <p style="color:var(--theme-text-muted, #94a3b8);font-size:0.85rem;margin-bottom:18px;">${currentLang === 'tr' ? 'Haritada gezdiğiniz ve planladığınız yerlerin vurgu renklerini dilediğiniz gibi özelleştirin.' : 'Customize the accent colors for visited and planned locations on the map.'}</p>
          
          <!-- Visited Color Selection -->
          <div style="margin-bottom:20px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
              <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${visitedColor};"></span>
              <span style="font-weight:600;font-size:0.9rem;color:var(--theme-text-main, #f8fafc);">${t('colorVisited')}</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:10px;">
              ${COLOR_PALETTES.map(p => `
                <button class="color-chip-btn ${p.color.toLowerCase() === visitedColor.toLowerCase() ? 'selected' : ''}" 
                        data-status="visited" data-color="${p.color}" title="${currentLang === 'tr' ? p.name : p.nameEn}"
                        style="width:36px;height:36px;border-radius:50%;background:${p.color};border:2px solid ${p.color.toLowerCase() === visitedColor.toLowerCase() ? '#ffffff' : 'transparent'};box-shadow:${p.color.toLowerCase() === visitedColor.toLowerCase() ? '0 0 10px ' + p.color : 'none'};cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;">
                  ${p.color.toLowerCase() === visitedColor.toLowerCase() ? '<span style="color:#fff;font-size:0.85rem;font-weight:900;">✓</span>' : ''}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Planned Color Selection -->
          <div style="margin-bottom:20px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
              <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${plannedColor};"></span>
              <span style="font-weight:600;font-size:0.9rem;color:var(--theme-text-main, #f8fafc);">${t('colorPlanned')}</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:10px;">
              ${COLOR_PALETTES.map(p => `
                <button class="color-chip-btn ${p.color.toLowerCase() === plannedColor.toLowerCase() ? 'selected' : ''}" 
                        data-status="planned" data-color="${p.color}" title="${currentLang === 'tr' ? p.name : p.nameEn}"
                        style="width:36px;height:36px;border-radius:50%;background:${p.color};border:2px solid ${p.color.toLowerCase() === plannedColor.toLowerCase() ? '#ffffff' : 'transparent'};box-shadow:${p.color.toLowerCase() === plannedColor.toLowerCase() ? '0 0 10px ' + p.color : 'none'};cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;">
                  ${p.color.toLowerCase() === plannedColor.toLowerCase() ? '<span style="color:#fff;font-size:0.85rem;font-weight:900;">✓</span>' : ''}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Wishlist Color Selection -->
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
              <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${wishlistColor};"></span>
              <span style="font-weight:600;font-size:0.9rem;color:var(--theme-text-main, #f8fafc);">${t('colorWishlist')}</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:10px;">
              ${COLOR_PALETTES.map(p => `
                <button class="color-chip-btn ${p.color.toLowerCase() === wishlistColor.toLowerCase() ? 'selected' : ''}" 
                        data-status="wishlist" data-color="${p.color}" title="${currentLang === 'tr' ? p.name : p.nameEn}"
                        style="width:36px;height:36px;border-radius:50%;background:${p.color};border:2px solid ${p.color.toLowerCase() === wishlistColor.toLowerCase() ? '#ffffff' : 'transparent'};box-shadow:${p.color.toLowerCase() === wishlistColor.toLowerCase() ? '0 0 10px ' + p.color : 'none'};cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;">
                  ${p.color.toLowerCase() === wishlistColor.toLowerCase() ? '<span style="color:#fff;font-size:0.85rem;font-weight:900;">✓</span>' : ''}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Danger Zone: Reset Map Data -->
        <div class="share-section" style="border-color:rgba(239,68,68,0.3);background:rgba(239,68,68,0.06);">
          <h3 style="color:#ef4444;margin-bottom:8px;font-size:1.05rem;">⚠️ ${t('dangerZone')}</h3>
          <p style="color:var(--theme-text-muted, #94a3b8);font-size:0.85rem;margin-bottom:16px;">${t('resetDataDesc')}</p>
          <button id="profile-reset-map-btn" style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);color:#f87171;padding:12px 20px;border-radius:12px;font-weight:700;font-size:0.9rem;cursor:pointer;transition:all .2s;font-family:inherit;">
            ${t('reset')}
          </button>
        </div>
      </div>
    `;

    // Language selection
    contentArea.querySelectorAll('.lang-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setLanguage(btn.getAttribute('data-lang'));
        render();
      });
    });

    // Theme selection
    contentArea.querySelectorAll('.theme-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setTheme(btn.getAttribute('data-theme'));
        render();
      });
    });

    // Color chips selection
    contentArea.querySelectorAll('.color-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const statusKey = btn.getAttribute('data-status');
        const color = btn.getAttribute('data-color');
        setStatusColor(statusKey, color);
        render();
      });
    });

    // Reset button
    document.getElementById('profile-reset-map-btn')?.addEventListener('click', () => {
      if (confirm(t('resetConfirm'))) {
        resetTravelData();
        alert(currentLang === 'tr' ? 'Harita verileri başarıyla sıfırlandı.' : 'Map data reset successfully.');
        render();
      }
    });
  }

  function renderMedalsTab(contentArea) {
    const currentLang = getLanguage();
    let earnedIds = [];
    const achievements = ACHIEVEMENTS || [];
    const catEntries = ACHIEVEMENT_CATEGORIES ? Object.entries(ACHIEVEMENT_CATEGORIES) : [];

    try {
      const _sd = getStorageData();
      const _bs = calculateStats();
      const earned = getEarnedAchievements(_sd, _bs);
      earnedIds = earned.map(e => e.id);
    } catch(e) { console.error(e); }

    const total = achievements.length;
    const earnedCount = earnedIds.length;
    const percent = total > 0 ? Math.round((earnedCount / total) * 100) : 0;

    let html = `
      <div class="achievements-view">
        <div class="ach-header">
          <div class="ach-progress-text">${t('medalsEarned', { count: earnedCount, total, percent })}</div>
          <div class="ach-progress-bar-wrap">
            <div class="ach-progress-bar" style="width: ${percent}%"></div>
          </div>
        </div>
    `;

    catEntries.forEach(([catId, cat]) => {
      const catAchs = achievements.filter(a => a.category === catId);
      if (catAchs.length === 0) return;

      const catEarned = catAchs.filter(a => earnedIds.includes(a.id)).length;
      const catTitle = currentLang === 'en' ? (cat.labelEn || cat.label) : cat.label;

      html += `
        <div class="ach-category">
          <div class="ach-cat-title" style="color:${cat.color}">
            ${catTitle} <span style="font-size:0.8rem;color:#64748b;font-weight:500;">(${catEarned}/${catAchs.length})</span>
          </div>
          <div class="ach-grid">
            ${catAchs.map(ach => {
              const isEarned = earnedIds.includes(ach.id);
              const title = currentLang === 'en' ? (ach.titleEn || ach.title) : ach.title;
              const desc = currentLang === 'en' ? (ach.descEn || ach.desc) : ach.desc;
              return `
                <div class="ach-card ${isEarned ? 'earned' : 'locked'}">
                  ${isEarned ? '<div class="ach-check">✓</div>' : '<div class="ach-lock">🔒</div>'}
                  <div class="ach-icon">${ach.icon}</div>
                  <div class="ach-name">${title}</div>
                  <div class="ach-desc">${desc}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    contentArea.innerHTML = html;
  }


  // ─── 🎯 Bucket List Priority Ranking Tab ──────────────────────────────────────
  function renderBucketTab(contentArea) {
    const currentLang = getLanguage();
    const storageData = getStorageData();
    let savedRanks = getBucketRanks();

    // Collect all planned and wishlist places
    const bucketItems = [];

    // Turkey provinces
    Object.entries(storageData.turkeyVisits || {}).forEach(([pid, data]) => {
      if (data.status === 'planned' || data.status === 'wishlist' || data.status === 'target') {
        const prov = TURKEY_PROVINCES.find(p => p.id === pid) || { id: pid, name: `İl ${pid}` };
        bucketItems.push({
          id: `TR::${pid}`,
          name: prov.name,
          sub: 'Türkiye',
          flag: '🇹🇷',
          status: data.status === 'target' ? 'planned' : data.status,
          type: 'province'
        });
      }
    });

    // World countries
    Object.entries(storageData.worldVisits || {}).forEach(([code, data]) => {
      if (!code.includes('::') && (data.status === 'planned' || data.status === 'wishlist' || data.status === 'target')) {
        const c = WORLD_COUNTRIES.find(x => x.code === code) || { code, name: code };
        bucketItems.push({
          id: code,
          name: getCountryDisplayName(c),
          sub: c.continent || 'Dünya',
          flag: `https://flagcdn.com/w40/${code.toLowerCase()}.png`,
          status: data.status === 'target' ? 'planned' : data.status,
          type: 'country'
        });
      }
    });

    // Sort according to savedRanks order if present
    if (savedRanks && savedRanks.length > 0) {
      bucketItems.sort((a, b) => {
        const idxA = savedRanks.indexOf(a.id);
        const idxB = savedRanks.indexOf(b.id);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
    }

    contentArea.innerHTML = `
      <div class="profile-main">
        <div class="share-section" style="margin-top:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <div>
              <h3 style="margin-bottom:4px;">🎯 ${t('tabBucket')}</h3>
              <p style="color:var(--theme-text-muted, #94a3b8);font-size:0.85rem;">${currentLang === 'tr' ? 'Planladığın ve gitmek istediğin yerlerin öncelik sırasını belirle.' : 'Prioritize your planned and dream destinations.'}</p>
            </div>
            <span class="bucket-count-badge">${bucketItems.length} ${currentLang === 'tr' ? 'Hedef' : 'Places'}</span>
          </div>

          ${bucketItems.length === 0 ? `
            <div style="text-align:center;padding:40px 20px;color:var(--theme-text-muted, #64748b);">
              <div style="font-size:3rem;margin-bottom:12px;">🗺️</div>
              <p>${currentLang === 'tr' ? 'Henüz planlanan veya istenen bir yer işaretlemediniz. Haritada ülkelere tıklayarak "Planlanıyor" veya "İsteniyor" yapın!' : 'No planned or wishlist destinations yet. Click places on the map to add them!'}</p>
            </div>
          ` : `
            <div class="bucket-list-grid" id="bucket-list-container">
              ${bucketItems.map((item, index) => {
                const isPlanned = item.status === 'planned';
                const statusBadge = isPlanned ? `<span class="bucket-status-tag planned">🟡 ${t('planned')}</span>` : `<span class="bucket-status-tag wishlist">🟣 ${t('wishlist')}</span>`;
                const flagHtml = item.flag.startsWith('http') ? `<img src="${item.flag}" class="bucket-item-flag" alt="" />` : `<span style="font-size:1.4rem;">${item.flag}</span>`;
                return `
                  <div class="bucket-item-card" data-id="${item.id}" data-idx="${index}">
                    <div class="bucket-rank-num">#${index + 1}</div>
                    <div class="bucket-flag-wrap">${flagHtml}</div>
                    <div class="bucket-info-wrap">
                      <div class="bucket-item-title">${item.name}</div>
                      <div class="bucket-item-sub">${item.sub}</div>
                    </div>
                    ${statusBadge}
                    <div class="bucket-order-btns">
                      <button type="button" class="bucket-move-btn btn-up" data-idx="${index}" ${index === 0 ? 'disabled' : ''} title="Yukarı">▲</button>
                      <button type="button" class="bucket-move-btn btn-down" data-idx="${index}" ${index === bucketItems.length - 1 ? 'disabled' : ''} title="Aşağı">▼</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    // Order change handlers
    const orderBtns = contentArea.querySelectorAll('.bucket-move-btn');
    orderBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        const isUp = btn.classList.contains('btn-up');
        const targetIdx = isUp ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= bucketItems.length) return;

        // Swap
        const temp = bucketItems[idx];
        bucketItems[idx] = bucketItems[targetIdx];
        bucketItems[targetIdx] = temp;

        // Save ranks
        const newRanks = bucketItems.map(b => b.id);
        saveBucketRanks(newRanks);

        renderBucketTab(contentArea);
      });
    });
  }

  // ─── ✈️ Airlines & Aircraft Fleet Collection Tab ───────────────────────────
  let flightSubTab = 'alliances'; // 'alliances' | 'aircraft'

  function renderFlightsTab(contentArea) {
    const currentLang = getLanguage();
    const userAirlines = getUserAirlines();
    const userAircraft = getUserAircraft();
    
    // Calculate flown airline and aircraft counts
    let flownAirlinesCount = 0;
    Object.values(userAirlines).forEach(a => {
      if (a && a.flown) {
        flownAirlinesCount++;
      }
    });

    const flownAircraftCount = Object.values(userAircraft).filter(a => a && a.flown).length;
    const completedAlliancesCount = AIRLINE_ALLIANCES.filter(al => {
      return al.airlines.length > 0 && al.airlines.every(line => userAirlines[line.id]?.flown);
    }).length;

    contentArea.innerHTML = `
      <div class="profile-main">
        <div class="share-section" style="margin-top:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px;">
            <div>
              <h3 style="margin-bottom:4px;">✈️ ${t('tabFlights')} & Koleksiyon</h3>
              <p style="color:var(--theme-text-muted, #94a3b8);font-size:0.85rem;">${currentLang === 'tr' ? 'Bindiğin havayolu birliklerini tamamla ve uçak modelleri filonu oluştur.' : 'Collect airline alliances and track your aircraft fleet.'}</p>
            </div>
          </div>

          <!-- Top Aviation Stats Grid -->
          <div class="profile-stats" style="grid-template-columns:repeat(3, 1fr);margin-bottom:20px;">
            <div class="pstat">
              <span class="pstat-num" style="color:#10b981;">${flownAirlinesCount} / ${ALL_AIRLINES.length}</span>
              <span class="pstat-lbl">${currentLang === 'tr' ? 'Uçulan Havayolu' : 'Flown Airlines'}</span>
            </div>
            <div class="pstat">
              <span class="pstat-num" style="color:#8b5cf6;">${flownAircraftCount} / ${AIRCRAFT_MODELS.length}</span>
              <span class="pstat-lbl">${currentLang === 'tr' ? 'Uçak Modeli' : 'Aircraft'}</span>
            </div>
            <div class="pstat">
              <span class="pstat-num" style="color:#f59e0b;">${completedAlliancesCount} / ${AIRLINE_ALLIANCES.length}</span>
              <span class="pstat-lbl">${currentLang === 'tr' ? 'Kazanılan Birlik' : 'Completed Alliances'}</span>
            </div>
          </div>

          <!-- Aviation Subtabs Switcher -->
          <div class="compare-subtabs-row" style="margin-bottom:20px;">
            <button type="button" class="compare-subtab ${flightSubTab === 'alliances' ? 'active' : ''}" id="tab-btn-alliances">
              🏢 ${currentLang === 'tr' ? 'Havayolu Birlikleri (Koleksiyon)' : 'Airline Alliances (Collection)'}
            </button>
            <button type="button" class="compare-subtab ${flightSubTab === 'aircraft' ? 'active' : ''}" id="tab-btn-aircraft">
              🛩️ ${currentLang === 'tr' ? 'Uçak Filosu (Hangar)' : 'Aircraft Fleet (Hangar)'}
            </button>
          </div>

          <!-- PANE 1: ALLIANCES & AIRLINES COLLECTION -->
          <div id="flight-pane-alliances" style="display:${flightSubTab === 'alliances' ? 'block' : 'none'};">
            ${AIRLINE_ALLIANCES.map(alliance => {
              const allianceAirlines = alliance.airlines;
              const completedCount = allianceAirlines.filter(al => userAirlines[al.id]?.flown).length;
              const totalCount = allianceAirlines.length;
              const percent = Math.round((completedCount / totalCount) * 100);
              const isFull = completedCount === totalCount;

              return `
                <div class="alliance-set-card" style="border-left: 4px solid ${alliance.color};">
                  <div class="alliance-set-header">
                    <div class="alliance-title-wrap">
                      <span class="alliance-icon">${alliance.icon}</span>
                      <div>
                        <div class="alliance-name">${alliance.name}</div>
                        <div class="alliance-sub">${alliance.desc}</div>
                      </div>
                    </div>
                    <div class="alliance-progress-wrap">
                      <div class="alliance-count-badge" style="color:${alliance.color};background:${alliance.color}18;border-color:${alliance.color}44;">
                        ${isFull ? '🏆 ' : ''}${completedCount} / ${totalCount} (${percent}%)
                      </div>
                    </div>
                  </div>

                  <!-- Hot Wheels Style Progress Bar -->
                  <div class="alliance-progress-bar-bg">
                    <div class="alliance-progress-bar-fill" style="width:${percent}%;background:${alliance.color};"></div>
                  </div>

                  <!-- Grid of Airlines in this Alliance -->
                  <div class="airlines-grid" style="margin-top:14px;">
                    ${allianceAirlines.map(airline => {
                      const uData = userAirlines[airline.id] || {};
                      const isFlown = !!uData.flown;
                      return `
                        <div class="airline-card ${isFlown ? 'active' : ''}" data-id="${airline.id}" style="cursor:pointer;">
                          <div class="airline-top">
                            <div class="airline-logo-badge">
                              <img src="https://images.kiwi.com/airlines/64/${airline.code}.png"
                                   alt="${escapeHtml(airline.name)}"
                                   class="airline-logo-img"
                                   loading="lazy"
                                   onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline';" />
                              <span class="airline-flag-fallback" style="display:none;">${airline.flag}</span>
                            </div>
                            <span class="airline-code">${airline.code}</span>
                            <button type="button" class="airline-check-btn ${isFlown ? 'checked' : ''}" aria-label="Seç">${isFlown ? '✓' : ''}</button>
                          </div>
                          <div class="airline-name">${escapeHtml(airline.name)}</div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- PANE 2: AIRCRAFT FLEET MODELS TRACKER -->
          <div id="flight-pane-aircraft" style="display:${flightSubTab === 'aircraft' ? 'block' : 'none'};">
            <div class="aircraft-grid">
              ${AIRCRAFT_MODELS.map(model => {
                const isFlown = !!userAircraft[model.id]?.flown;
                return `
                  <div class="aircraft-card ${isFlown ? 'active' : ''}" data-id="${model.id}" style="--aircraft-accent:${model.color};">
                    <div class="aircraft-photo-wrap">
                      <img src="${model.image}" alt="${escapeHtml(model.name)}" class="aircraft-photo-img" loading="lazy" />
                      <div class="aircraft-photo-overlay"></div>
                      <div class="aircraft-badge" style="color:${model.color};border-color:${model.color}44;">${model.badge}</div>
                    </div>
                    <div class="aircraft-card-content">
                      <div class="aircraft-header">
                        <span class="aircraft-icon">${model.icon}</span>
                        <div class="aircraft-model-name">${escapeHtml(model.name)}</div>
                      </div>
                      <div class="aircraft-builder">${model.builder} • ${model.type}</div>
                      <div class="aircraft-desc">${model.desc}</div>
                      <div class="aircraft-specs-row">
                        <span>💺 ${model.seats}</span>
                        <span>🌐 ${model.range}</span>
                      </div>
                      <button type="button" class="aircraft-toggle-btn ${isFlown ? 'flown' : ''}">
                        ${isFlown ? `✓ ${currentLang === 'tr' ? 'Binildi' : 'Flown'}` : `+ ${currentLang === 'tr' ? 'Bindim' : 'Add to Log'}`}
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Subtab click handlers
    contentArea.querySelector('#tab-btn-alliances')?.addEventListener('click', () => {
      flightSubTab = 'alliances';
      renderFlightsTab(contentArea);
    });

    contentArea.querySelector('#tab-btn-aircraft')?.addEventListener('click', () => {
      flightSubTab = 'aircraft';
      renderFlightsTab(contentArea);
    });

    // Airline card click toggles flown status directly
    contentArea.querySelectorAll('.airline-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        if (!id) return;
        toggleUserAirline(id);
        renderFlightsTab(contentArea);
      });
    });

    // Aircraft toggle click
    contentArea.querySelectorAll('.aircraft-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.aircraft-card');
        const id = card.dataset.id;
        toggleUserAircraft(id);
        renderFlightsTab(contentArea);
      });
    });

    contentArea.querySelectorAll('.aircraft-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.aircraft-toggle-btn')) return;
        const id = card.dataset.id;
        toggleUserAircraft(id);
        renderFlightsTab(contentArea);
      });
    });
  }

  // ─── 📸 Instagram / Story Travel Poster Generator Modal ───────────────────────
  function openPosterModal() {
    const currentLang = getLanguage();
    const currentTheme = getTheme();
    const storageData = getStorageData();
    const stats = calculateStats();
    let profile = { username: 'Gezgin', avatar: '🧭' };
    try {
      const profileStr = localStorage.getItem('gv_profile');
      if (profileStr) {
        const parsed = JSON.parse(profileStr);
        if (parsed && typeof parsed === 'object') profile = parsed;
      }
    } catch (e) {
      console.error('Profile parse error', e);
    }
    const earnedMedals = getEarnedAchievements(storageData, stats);
    const visitedColor = getStatusColor('visited');

    // Visited country codes
    const visitedCodes = Object.keys(storageData.worldVisits || {}).filter(k => !k.includes('::') && storageData.worldVisits[k]?.status === 'visited');
    if (stats.turkeyCount > 0 && !visitedCodes.includes('TR')) visitedCodes.push('TR');

    const modal = document.createElement('div');
    modal.className = 'poster-modal-overlay';
    modal.innerHTML = `
      <div class="poster-modal-dialog">
        <div class="poster-modal-top">
          <h3>📸 ${t('createPoster')}</h3>
          <button class="poster-modal-close" id="poster-close-btn">&times;</button>
        </div>

        <div class="poster-preview-container">
          <!-- The Rendered World Map Poster Card -->
          <div id="travel-poster-canvas" class="travel-poster-card" style="--poster-accent:${visitedColor};">
            <div class="poster-noise-bg"></div>
            
            <div class="poster-header">
              <div class="poster-brand">
                <span class="poster-brand-icon">🧭</span>
                <span class="poster-brand-text">GEZGİN</span>
              </div>
              <div class="poster-subtitle-tag">${currentLang === 'tr' ? 'DÜNYA SEYAHAT HARİTASI' : 'WORLD TRAVEL MAP'}</div>
              <div class="poster-date">${new Date().toLocaleDateString(currentLang === 'tr' ? 'tr-TR' : 'en-US', { month: 'long', year: 'numeric' })}</div>
            </div>

            <!-- Authentic Centerpiece: Vector World Map -->
            <div class="poster-map-box">
              <div class="poster-svg-wrapper">
                ${POSTER_WORLD_MAP_SVG}
              </div>
              <div class="poster-map-latlong">EQUIRECTANGULAR PROJECTION • 1:50M</div>
            </div>

            <!-- 4 Aesthetic Key Stat Badges -->
            <div class="poster-stats-grid">
              <div class="poster-stat-box">
                <span class="poster-stat-num">${stats.worldCountryCount}</span>
                <span class="poster-stat-lbl">${currentLang === 'tr' ? 'Ülke' : 'Countries'}</span>
                <span class="poster-stat-sub">%${stats.worldPercentage} ${currentLang === 'tr' ? 'Dünya' : 'World'}</span>
              </div>
              <div class="poster-stat-box">
                <span class="poster-stat-num">${stats.turkeyCount}</span>
                <span class="poster-stat-lbl">${currentLang === 'tr' ? 'İl' : 'Provinces'}</span>
                <span class="poster-stat-sub">%${stats.turkeyPercentage} ${currentLang === 'tr' ? 'Türkiye' : 'Turkey'}</span>
              </div>
              <div class="poster-stat-box">
                <span class="poster-stat-num">${stats.worldCityCount}</span>
                <span class="poster-stat-lbl">${currentLang === 'tr' ? 'Şehir' : 'Cities'}</span>
                <span class="poster-stat-sub">${currentLang === 'tr' ? 'Keşfedildi' : 'Explored'}</span>
              </div>
              <div class="poster-stat-box">
                <span class="poster-stat-num">${earnedMedals.length}</span>
                <span class="poster-stat-lbl">${currentLang === 'tr' ? 'Madalya' : 'Medals'}</span>
                <span class="poster-stat-sub">${earnedMedals.length} / ${ACHIEVEMENTS.length}</span>
              </div>
            </div>

            <!-- Visited Countries Badges Preview (top 16) -->
            ${visitedCodes.length > 0 ? `
              <div class="poster-flags-title">${currentLang === 'tr' ? 'Ziyaret Edilen Ülkeler' : 'Visited Countries'}</div>
              <div class="poster-flags-grid">
                ${visitedCodes.slice(0, 16).map(cCode => {
                  const c = WORLD_COUNTRIES.find(x => x.code === cCode);
                  const cName = c ? getCountryDisplayName(c) : cCode;
                  return `<span class="poster-flag-chip"><img src="https://flagcdn.com/w40/${cCode.toLowerCase()}.png" class="poster-chip-flag" alt="${cCode}" /> ${escapeHtml(cName)}</span>`;
                }).join('')}
                ${visitedCodes.length > 16 ? `<span class="poster-flag-chip more">+${visitedCodes.length - 16} ${currentLang === 'tr' ? 'daha' : 'more'}</span>` : ''}
              </div>
            ` : ''}

            <div class="poster-footer">
              <div class="poster-user-sign">
                <span class="poster-user-sign-avatar">${escapeHtml(profile.avatar || '🧭')}</span>
                <span class="poster-user-sign-name">@${escapeHtml(profile.username || 'Gezgin')}</span>
              </div>
              <div class="poster-footer-brand">
                <span class="poster-tagline">${currentLang === 'tr' ? 'Gez • Keşfet • Paylaş' : 'Travel • Explore • Share'}</span>
                <span class="poster-url">gezgin.app</span>
              </div>
            </div>
          </div>
        </div>

        <div class="poster-actions-row">
          <button type="button" id="btn-download-poster" class="poster-action-btn primary">
            <span>📥</span> <span>${t('downloadPoster')}</span>
          </button>
          ${navigator.share ? `
            <button type="button" id="btn-share-poster" class="poster-action-btn secondary">
              <span>📲</span> <span>${t('sharePoster')}</span>
            </button>
          ` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Highlight visited countries on the poster SVG map
    const svgEl = modal.querySelector('.poster-world-svg');
    if (svgEl) {
      visitedCodes.forEach(cCode => {
        const paths = svgEl.querySelectorAll(`path[data-code="${cCode}"]`);
        paths.forEach(p => {
          p.classList.add('visited');
        });
      });
    }

    const closeModal = () => {
      document.removeEventListener('keydown', handleEsc);
      modal.remove();
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleEsc);

    modal.querySelector('#poster-close-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Download PNG using html-to-image
    modal.querySelector('#btn-download-poster')?.addEventListener('click', async () => {
      const node = document.getElementById('travel-poster-canvas');
      if (!node) return;
      try {
        const dataUrl = await toPng(node, { quality: 0.95, pixelRatio: 2 });
        const link = document.createElement('a');
        const cleanName = (profile.username || 'Gezgin').replace(/[^a-zA-Z0-9_\-\u00C0-\u017F]/g, '_');
        link.download = `Gezgin-Seyahat-Posteri-${cleanName}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Poster generation error', err);
        alert(currentLang === 'tr' ? 'Poster oluşturulurken bir hata oluştu.' : 'Error generating poster.');
      }
    });

    // Share API
    modal.querySelector('#btn-share-poster')?.addEventListener('click', async () => {
      const node = document.getElementById('travel-poster-canvas');
      if (!node || !navigator.share) return;
      try {
        const dataUrl = await toPng(node, { quality: 0.95, pixelRatio: 2 });
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'gezgin-posteri.png', { type: 'image/png' });
        if (navigator.canShare && !navigator.canShare({ files: [file] })) {
          // Fallback to text/url sharing
          await navigator.share({
            title: `${profile.username} - Gezgin Seyahat Haritası`,
            text: `Gezdiğim yerleri incele! 🌍`,
            url: window.location.href
          });
        } else {
          await navigator.share({
            title: `${profile.username} - Gezgin Seyahat Haritası`,
            text: `Gezdiğim yerleri incele! 🌍`,
            files: [file]
          });
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share error', err);
        }
      }
    });
  }

  function renderCompareTab(contentArea) {
    const currentLang = getLanguage();
    const savedFriends = getSavedFriends();

    contentArea.innerHTML = `
      <div class="compare-view">
        <!-- Saved Friends Bar -->
        ${savedFriends.length > 0 ? `
          <div class="saved-friends-panel" id="saved-friends-panel">
            <div class="saved-friends-header">
              <span>${t('savedFriends')}</span>
              <span class="saved-friends-count">(${savedFriends.length})</span>
            </div>
            <div class="saved-friends-chips-row">
              ${savedFriends.map(f => `
                <div class="saved-friend-chip" data-id="${escapeHtml(f.id)}">
                  <span class="sf-avatar">${escapeHtml(f.avatar || '🌍')}</span>
                  <span class="sf-name">${escapeHtml(f.username || 'Arkadaş')}</span>
                  <button type="button" class="sf-del-btn" data-id="${escapeHtml(f.id)}" title="Sil">&times;</button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="compare-top">
          <div class="compare-mine" id="compare-mine-area"></div>
          <div class="compare-vs">⚔️ VS</div>
          <div class="compare-other">
            <div id="compare-input-area" class="compare-input-card">
              <h3 style="color:var(--theme-text-main, #f8fafc);margin-bottom:6px;font-size:1.15rem;">${currentLang === 'tr' ? 'Arkadaşının Profilini Yükle' : 'Load Friend\'s Profile'}</h3>
              <p style="color:var(--theme-text-muted, #94a3b8);font-size:0.82rem;margin-bottom:14px;">${currentLang === 'tr' ? 'Arkadaşının sana verdiği paylaşım kodunu yapıştırarak seyahatlerinizi yan yana karşılaştırın.' : 'Paste your friend\'s share code to compare your travels side by side.'}</p>
              <textarea class="compare-code-input" id="compare-code" rows="3" placeholder="${t('comparePlaceholder')}"></textarea>
              <button class="compare-load-btn" id="compare-load-btn">⚡ ${t('loadProfile')}</button>
            </div>
            <div id="compare-other-card" style="display:none;"></div>
          </div>
        </div>

        <div id="compare-results-area" style="display:none;"></div>
      </div>
    `;

    // Render my profile in compare
    let myProfile = { username: 'Sen', avatar: '🧭', bio: '' };
    try {
      const myProfileStr = localStorage.getItem('gv_profile');
      if (myProfileStr) {
        const parsed = JSON.parse(myProfileStr);
        if (parsed && typeof parsed === 'object') myProfile = parsed;
      }
    } catch (e) {
      console.error('My profile parse error', e);
    }
    const myStorage = getStorageData();
    const myStats = calculateStats();
    const myMedals = getEarnedAchievements(myStorage, myStats);

    document.getElementById('compare-mine-area').innerHTML = `
      <div class="profile-card">
        <div class="profile-card-label" style="background:rgba(59,130,246,0.2);border-color:rgba(59,130,246,0.3);color:#3b82f6;">${currentLang === 'tr' ? 'SENİN PROFİLİN' : 'YOUR PROFILE'}</div>
        <div class="profile-header">
          <div class="profile-avatar">${escapeHtml(myProfile.avatar || '🧭')}</div>
          <div>
            <div class="profile-username">${escapeHtml(myProfile.username || 'Sen')}</div>
            <div class="profile-bio">${escapeHtml(myProfile.bio || '')}</div>
          </div>
        </div>
        <div class="profile-stats" style="grid-template-columns:repeat(2,1fr);">
          <div class="pstat"><span class="pstat-num" style="color:var(--status-visited, #ff5722);">${myStats.worldCountryCount}</span><span class="pstat-lbl">${t('countriesVisited')}</span></div>
          <div class="pstat"><span class="pstat-num" style="color:var(--status-visited, #ff5722);">${myStats.turkeyCount}</span><span class="pstat-lbl">${t('provincesVisited')}</span></div>
          <div class="pstat"><span class="pstat-num" style="color:#3b82f6;">${myStats.worldCityCount}</span><span class="pstat-lbl">${t('citiesVisited')}</span></div>
          <div class="pstat"><span class="pstat-num" style="color:#10b981;">${myMedals.length}</span><span class="pstat-lbl">${t('tabMedals')}</span></div>
        </div>
      </div>
    `;

    // Function to load and render decoded friend data
    function applyFriendComparison(otherProfile, otherWorldVisits, otherTurkeyVisits, otherCities, rawCode = '') {
      const safeProfile = otherProfile || { username: 'Arkadaş', avatar: '✈️', bio: '' };
      const safeWorldVisits = (otherWorldVisits && typeof otherWorldVisits === 'object') ? otherWorldVisits : {};
      const safeTurkeyVisits = (otherTurkeyVisits && typeof otherTurkeyVisits === 'object') ? otherTurkeyVisits : {};
      const safeCities = Array.isArray(otherCities) ? otherCities : [];

      const otherCountriesCount = Object.keys(safeWorldVisits).filter(k => !k.includes('::') && safeWorldVisits[k]?.status === 'visited').length;
      const otherTurkeyCount = Object.keys(safeTurkeyVisits).filter(k => safeTurkeyVisits[k]?.status === 'visited').length;
      const otherTotalCountries = otherCountriesCount + (otherTurkeyCount > 0 && !safeWorldVisits['TR'] ? 1 : 0);
      const otherCitiesCount = safeCities.length + Object.keys(safeWorldVisits).filter(k => k.includes('::') && safeWorldVisits[k]?.status === 'visited').length + otherTurkeyCount;

      const currentFriends = getSavedFriends();
      const isAlreadySaved = currentFriends.some(f => 
        (f.username && safeProfile.username && f.username.toLowerCase() === safeProfile.username.toLowerCase()) || 
        (rawCode && f.code === rawCode)
      );

      document.getElementById('compare-input-area').style.display = 'none';
      const otherCard = document.getElementById('compare-other-card');
      otherCard.style.display = 'block';
      otherCard.innerHTML = `
        <div class="profile-card">
          <div class="profile-card-label" style="background:rgba(16,185,129,0.2);border-color:rgba(16,185,129,0.3);color:#10b981;">${currentLang === 'tr' ? 'ARKADAŞININ PROFİLİ' : 'FRIEND\'S PROFILE'}</div>
          <div class="profile-header">
            <div class="profile-avatar">${escapeHtml(safeProfile.avatar || '✈️')}</div>
            <div style="flex:1;">
              <div class="profile-username">${escapeHtml(safeProfile.username || 'Arkadaş')}</div>
              <div class="profile-bio">${escapeHtml(safeProfile.bio || '')}</div>
            </div>
            ${rawCode && !isAlreadySaved ? `<button type="button" id="btn-save-this-friend" class="save-friend-action-btn">⭐ ${t('saveFriend')}</button>` : ''}
          </div>
          <div class="profile-stats" style="grid-template-columns:repeat(2,1fr);">
            <div class="pstat"><span class="pstat-num" style="color:var(--status-visited, #ff5722);">${otherTotalCountries}</span><span class="pstat-lbl">${t('countriesVisited')}</span></div>
            <div class="pstat"><span class="pstat-num" style="color:var(--status-visited, #ff5722);">${otherTurkeyCount}</span><span class="pstat-lbl">${t('provincesVisited')}</span></div>
            <div class="pstat"><span class="pstat-num" style="color:#3b82f6;">${otherCitiesCount}</span><span class="pstat-lbl">${t('citiesVisited')}</span></div>
            <div class="pstat"><span class="pstat-num" style="color:#10b981;">${Object.keys(safeWorldVisits).length}</span><span class="pstat-lbl">${currentLang === 'tr' ? 'Kayıt' : 'Marks'}</span></div>
          </div>
        </div>
      `;

      // Save friend button handler
      document.getElementById('btn-save-this-friend')?.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        saveFriend({
          username: safeProfile.username,
          avatar: safeProfile.avatar,
          bio: safeProfile.bio,
          code: rawCode,
          data: { profile: safeProfile, worldVisits: safeWorldVisits, turkeyVisits: safeTurkeyVisits, worldCities: safeCities }
        });
        btn.textContent = '✓ ' + t('friendSaved');
        btn.disabled = true;
        btn.style.opacity = '0.7';
      });

      // ── Calculate Country Comparison ──
      const myCountryCodes = Object.keys(myStorage.worldVisits || {}).filter(k => !k.includes('::') && myStorage.worldVisits[k]?.status === 'visited');
      if (myStats.turkeyCount > 0 && !myCountryCodes.includes('TR')) myCountryCodes.push('TR');

      const otherCountryCodes = Object.keys(safeWorldVisits).filter(k => !k.includes('::') && safeWorldVisits[k]?.status === 'visited');
      if (otherTurkeyCount > 0 && !otherCountryCodes.includes('TR')) otherCountryCodes.push('TR');

      const commonCountries = myCountryCodes.filter(c => otherCountryCodes.includes(c));
      const onlyMyCountries = myCountryCodes.filter(c => !otherCountryCodes.includes(c));
      const onlyOtherCountries = otherCountryCodes.filter(c => !myCountryCodes.includes(c));

      const getCName = (code) => {
        const c = WORLD_COUNTRIES.find(x => x.code === code);
        return c ? getCountryDisplayName(c) : code;
      };

      // ── Calculate Turkey Provinces Comparison ──
      const myProvIds = Object.keys(myStorage.turkeyVisits || {}).filter(pid => myStorage.turkeyVisits[pid]?.status === 'visited');
      const otherProvIds = Object.keys(safeTurkeyVisits).filter(pid => safeTurkeyVisits[pid]?.status === 'visited');

      const commonProvs = myProvIds.filter(p => otherProvIds.includes(p));
      const onlyMyProvs = myProvIds.filter(p => !otherProvIds.includes(p));
      const onlyOtherProvs = otherProvIds.filter(p => !myProvIds.includes(p));

      const getPName = (pid) => {
        const p = TURKEY_PROVINCES.find(x => String(x.id) === String(pid));
        return p ? p.name : `İl ${pid}`;
      };

      const resultsArea = document.getElementById('compare-results-area');
      resultsArea.style.display = 'block';
      resultsArea.innerHTML = `
        <div class="share-section" style="margin-top:0;">
          <!-- Category Tabs: Countries / Turkey 81 Provinces / Reviews & Scores -->
          <div class="compare-subtabs-row">
            <button type="button" class="compare-subtab active" data-sub="countries">🌍 ${currentLang === 'tr' ? 'Ülkeler' : 'Countries'}</button>
            <button type="button" class="compare-subtab" data-sub="provinces">🇹🇷 ${currentLang === 'tr' ? 'Türkiye (81 İl)' : 'Turkey (81 Provinces)'}</button>
            <button type="button" class="compare-subtab" data-sub="reviews">📝 ${currentLang === 'tr' ? 'Yorumlar & Puanlar (1-10)' : 'Reviews & Scores (1-10)'}</button>
          </div>

          <!-- Section 1: Countries -->
          <div id="compare-pane-countries" class="compare-pane active">
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;">
              <div style="background:rgba(15,23,42,0.6);border-radius:12px;padding:16px;">
                <div style="font-weight:700;color:#10b981;margin-bottom:8px;">🤝 ${currentLang === 'tr' ? 'İkinizin de Gittiği Ortak Ülkeler' : 'Common Countries'} (${commonCountries.length})</div>
                <div style="font-size:0.85rem;color:var(--theme-text-main, #cbd5e1);line-height:1.6;max-height:220px;overflow-y:auto;">
                  ${commonCountries.length > 0 ? commonCountries.map(c => `• ${escapeHtml(getCName(c))}`).join('<br>') : (currentLang === 'tr' ? 'Ortak ülke bulunamadı.' : 'No common countries.')}
                </div>
              </div>

              <div style="background:rgba(15,23,42,0.6);border-radius:12px;padding:16px;">
                <div style="font-weight:700;color:#3b82f6;margin-bottom:8px;">⭐ ${currentLang === 'tr' ? 'Sadece Senin Gittiğin Ülkeler' : 'Only You Visited'} (${onlyMyCountries.length})</div>
                <div style="font-size:0.85rem;color:var(--theme-text-main, #cbd5e1);line-height:1.6;max-height:220px;overflow-y:auto;">
                  ${onlyMyCountries.length > 0 ? onlyMyCountries.map(c => `• ${escapeHtml(getCName(c))}`).join('<br>') : (currentLang === 'tr' ? 'Farklı ülke yok.' : 'No unique countries.')}
                </div>
              </div>

              <div style="background:rgba(15,23,42,0.6);border-radius:12px;padding:16px;">
                <div style="font-weight:700;color:#f59e0b;margin-bottom:8px;">🚀 ${currentLang === 'tr' ? `Sadece ${escapeHtml(safeProfile.username)}'in Gittiği Ülkeler` : `Only ${escapeHtml(safeProfile.username)}`} (${onlyOtherCountries.length})</div>
                <div style="font-size:0.85rem;color:var(--theme-text-main, #cbd5e1);line-height:1.6;max-height:220px;overflow-y:auto;">
                  ${onlyOtherCountries.length > 0 ? onlyOtherCountries.map(c => `• ${escapeHtml(getCName(c))}`).join('<br>') : (currentLang === 'tr' ? 'Farklı ülke yok.' : 'No unique countries.')}
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Turkey 81 Provinces -->
          <div id="compare-pane-provinces" class="compare-pane" style="display:none;">
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;">
              <div style="background:rgba(15,23,42,0.6);border-radius:12px;padding:16px;">
                <div style="font-weight:700;color:#10b981;margin-bottom:8px;">🤝 ${currentLang === 'tr' ? 'Ortak Gezilen İller' : 'Common Provinces'} (${commonProvs.length})</div>
                <div style="font-size:0.85rem;color:var(--theme-text-main, #cbd5e1);line-height:1.6;max-height:220px;overflow-y:auto;">
                  ${commonProvs.length > 0 ? commonProvs.map(pid => `• ${escapeHtml(getPName(pid))}`).join('<br>') : (currentLang === 'tr' ? 'Ortak il bulunamadı.' : 'No common provinces.')}
                </div>
              </div>

              <div style="background:rgba(15,23,42,0.6);border-radius:12px;padding:16px;">
                <div style="font-weight:700;color:#3b82f6;margin-bottom:8px;">⭐ ${currentLang === 'tr' ? 'Sadece Senin Gezdiğin İller' : 'Only You Visited'} (${onlyMyProvs.length})</div>
                <div style="font-size:0.85rem;color:var(--theme-text-main, #cbd5e1);line-height:1.6;max-height:220px;overflow-y:auto;">
                  ${onlyMyProvs.length > 0 ? onlyMyProvs.map(pid => `• ${escapeHtml(getPName(pid))}`).join('<br>') : (currentLang === 'tr' ? 'Farklı il yok.' : 'No unique provinces.')}
                </div>
              </div>

              <div style="background:rgba(15,23,42,0.6);border-radius:12px;padding:16px;">
                <div style="font-weight:700;color:#f59e0b;margin-bottom:8px;">🚀 ${currentLang === 'tr' ? `Sadece ${escapeHtml(safeProfile.username)}'in Gezdiği İller` : `Only ${escapeHtml(safeProfile.username)}`} (${onlyOtherProvs.length})</div>
                <div style="font-size:0.85rem;color:var(--theme-text-main, #cbd5e1);line-height:1.6;max-height:220px;overflow-y:auto;">
                  ${onlyOtherProvs.length > 0 ? onlyOtherProvs.map(pid => `• ${escapeHtml(getPName(pid))}`).join('<br>') : (currentLang === 'tr' ? 'Farklı il yok.' : 'No unique provinces.')}
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Reviews & Scores (1-10) -->
          <div id="compare-pane-reviews" class="compare-pane" style="display:none;">
            <div class="compare-reviews-grid" style="gap:16px;">
              <!-- My Reviews -->
              <div style="background:rgba(15,23,42,0.6);border-radius:12px;padding:16px;">
                <div style="font-weight:700;color:#3b82f6;margin-bottom:12px;">📝 ${currentLang === 'tr' ? 'Senin Yorumların & Puanların' : 'Your Reviews & Scores'}</div>
                <div style="display:flex;flex-direction:column;gap:8px;max-height:280px;overflow-y:auto;">
                  ${(() => {
                    const reviews = [];
                    Object.entries(myStorage.worldVisits || {}).forEach(([k, v]) => {
                      if (v && (v.rating || v.notes)) {
                        const c = WORLD_COUNTRIES.find(x => x.code === k);
                        reviews.push({ name: c ? getCountryDisplayName(c) : k, flag: c?.flag || '🌍', rating: Number(v.rating) || 0, notes: v.notes });
                      }
                    });
                    Object.entries(myStorage.turkeyVisits || {}).forEach(([pid, v]) => {
                      if (v && (v.rating || v.notes)) {
                        const p = TURKEY_PROVINCES.find(x => String(x.id) === String(pid));
                        reviews.push({ name: p?.name || `İl ${pid}`, flag: '🇹🇷', rating: Number(v.rating) || 0, notes: v.notes });
                      }
                    });
                    if (reviews.length === 0) return `<span style="color:#64748b;font-size:0.85rem;">${currentLang === 'tr' ? 'Henüz puan veya not girmediniz.' : 'No reviews or notes yet.'}</span>`;
                    return reviews.map(r => `
                      <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:8px 10px;font-size:0.85rem;">
                        <div style="display:flex;justify-content:space-between;align-items:center;font-weight:600;color:#f8fafc;">
                          <span>${escapeHtml(r.flag)} ${escapeHtml(r.name)}</span>
                          ${r.rating > 0 ? `<span style="color:#f59e0b;font-size:0.8rem;background:rgba(245,158,11,0.15);padding:2px 6px;border-radius:6px;">⭐ ${r.rating}/10</span>` : ''}
                        </div>
                        ${r.notes ? `<div style="color:#94a3b8;font-size:0.78rem;margin-top:4px;font-style:italic;">"${escapeHtml(r.notes)}"</div>` : ''}
                      </div>
                    `).join('');
                  })()}
                </div>
              </div>

              <!-- Friend's Reviews -->
              <div style="background:rgba(15,23,42,0.6);border-radius:12px;padding:16px;">
                <div style="font-weight:700;color:#10b981;margin-bottom:12px;">📝 ${currentLang === 'tr' ? `${escapeHtml(safeProfile.username)} Yorumları & Puanları` : `${escapeHtml(safeProfile.username)} Reviews`}</div>
                <div style="display:flex;flex-direction:column;gap:8px;max-height:280px;overflow-y:auto;">
                  ${(() => {
                    const reviews = [];
                    Object.entries(safeWorldVisits).forEach(([k, v]) => {
                      if (v && (v.rating || v.notes)) {
                        const c = WORLD_COUNTRIES.find(x => x.code === k);
                        reviews.push({ name: c ? getCountryDisplayName(c) : k, flag: c?.flag || '🌍', rating: Number(v.rating) || 0, notes: v.notes });
                      }
                    });
                    Object.entries(safeTurkeyVisits).forEach(([pid, v]) => {
                      if (v && (v.rating || v.notes)) {
                        const p = TURKEY_PROVINCES.find(x => String(x.id) === String(pid));
                        reviews.push({ name: p?.name || `İl ${pid}`, flag: '🇹🇷', rating: Number(v.rating) || 0, notes: v.notes });
                      }
                    });
                    if (reviews.length === 0) return `<span style="color:#64748b;font-size:0.85rem;">${currentLang === 'tr' ? 'Arkadaşının henüz yorumu yok.' : 'Friend has no reviews yet.'}</span>`;
                    return reviews.map(r => `
                      <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:8px 10px;font-size:0.85rem;">
                        <div style="display:flex;justify-content:space-between;align-items:center;font-weight:600;color:#f8fafc;">
                          <span>${escapeHtml(r.flag)} ${escapeHtml(r.name)}</span>
                          ${r.rating > 0 ? `<span style="color:#f59e0b;font-size:0.8rem;background:rgba(245,158,11,0.15);padding:2px 6px;border-radius:6px;">⭐ ${r.rating}/10</span>` : ''}
                        </div>
                        ${r.notes ? `<div style="color:#94a3b8;font-size:0.78rem;margin-top:4px;font-style:italic;">"${escapeHtml(r.notes)}"</div>` : ''}
                      </div>
                    `).join('');
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Subtab switching
      resultsArea.querySelectorAll('.compare-subtab').forEach(btn => {
        btn.addEventListener('click', () => {
          resultsArea.querySelectorAll('.compare-subtab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const sub = btn.dataset.sub;
          const pCountries = document.getElementById('compare-pane-countries');
          const pProvinces = document.getElementById('compare-pane-provinces');
          const pReviews = document.getElementById('compare-pane-reviews');
          if (pCountries) pCountries.style.display = sub === 'countries' ? 'block' : 'none';
          if (pProvinces) pProvinces.style.display = sub === 'provinces' ? 'block' : 'none';
          if (pReviews) pReviews.style.display = sub === 'reviews' ? 'block' : 'none';
        });
      });
    }

    // Saved friend chips click
    contentArea.querySelectorAll('.saved-friend-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        if (e.target.closest('.sf-del-btn')) return;
        const fid = chip.dataset.id;
        const friend = savedFriends.find(f => f.id === fid);
        if (friend && friend.data) {
          applyFriendComparison(
            friend.data.profile || { username: friend.username, avatar: friend.avatar },
            friend.data.worldVisits || {},
            friend.data.turkeyVisits || {},
            friend.data.worldCities || [],
            friend.code
          );
        }
      });
    });

    // Delete saved friend handler
    contentArea.querySelectorAll('.sf-del-btn').forEach(delBtn => {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const fid = delBtn.dataset.id;
        deleteFriend(fid);
        renderCompareTab(contentArea);
      });
    });

    // Manual load button
    document.getElementById('compare-load-btn')?.addEventListener('click', () => {
      const codeInput = document.getElementById('compare-code');
      const code = codeInput ? codeInput.value.trim() : '';
      if (!code) {
        alert(currentLang === 'tr' ? 'Lütfen bir profil paylaşım kodu yapıştırın.' : 'Please paste a profile share code.');
        return;
      }

      try {
        const decoded = parseSecureShareCode(code);
        if (!decoded) throw new Error('Invalid code format');
        applyFriendComparison(
          decoded.profile || { username: 'Arkadaşın', avatar: '✈️' },
          decoded.worldVisits || {},
          decoded.turkeyVisits || {},
          decoded.worldCities || [],
          code
        );
      } catch (err) {
        console.error('Compare parse error:', err);
        alert(t('invalidCode'));
      }
    });
  }

  // Mount and render profile view
  render();
}
