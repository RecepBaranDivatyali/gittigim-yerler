import L from 'leaflet';
import { 
  getStorageData, calculateStats, resetTravelData, 
  getBucketRanks, saveBucketRanks, 
  getUserAirlines, saveUserAirlines, toggleUserAirline,
  getUserAircraft, saveUserAircraft, toggleUserAircraft,
  AIRLINE_ALLIANCES, ALL_AIRLINES, AIRCRAFT_MODELS, AIRCRAFT_FAMILIES, getAircraftBlueprint,
  getSavedFriends, saveFriend, deleteFriend,
  getHomeCountry, setHomeCountry,
  exportBackup, importBackup,
  getPassportType, setPassportType,
  getUpcomingTrip, saveUpcomingTrip, deleteUpcomingTrip,
  getAllSavedPlaces, getTotalPlacesCount
} from '../utils/storage.js';
import { getAllPhotos, getTotalPhotoCount } from '../utils/photoStorage.js';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, getEarnedAchievements } from '../data/achievements.js';
import { TRAVEL_CHALLENGES, calculateChallengesProgress } from '../data/challengesData.js';
import { WORLD_COUNTRIES } from '../data/worldData.js';
import { TURKEY_PROVINCES } from '../data/turkeyData.js';
import { t, getLanguage, setLanguage, getCountryDisplayName, getCountryFlagHtml } from '../utils/i18n.js';
import { THEMES, getTheme, setTheme, COLOR_PALETTES, getStatusColor, setStatusColor, getUiSize, setUiSize } from '../utils/theme.js';
import { toPng } from 'html-to-image';
import { escapeHtml, sanitizeText, parseSecureShareCode } from '../utils/security.js';

const ALLOWED_AVATARS = ['🧭', '🗺️', '✈️', '🚀', '🏔️', '🏖️', '🎒', '🌊', '🦅', '🌺', '🐉', '🦁'];

export function renderProfileView(container, onBack) {
  let activeTab = 'profile'; // profile, medals, compare, settings
  let activeCountdownTimerId = null;

  function clearActiveTimers() {
    if (activeCountdownTimerId) {
      clearInterval(activeCountdownTimerId);
      activeCountdownTimerId = null;
    }
  }

  function render() {
    clearActiveTimers();
    const currentLang = getLanguage();
    const currentTheme = getTheme();
    const currentUiSize = getUiSize();

    container.innerHTML = `
      <div class="profile-overlay">
        <div class="profile-topbar">
          <button class="profile-back-btn" id="profile-back">${t('backToMap')}</button>
          <div class="profile-tabs">
            <button class="ptab ${activeTab === 'profile' ? 'active' : ''}" data-tab="profile"><span class="tab-icon">👤</span><span class="tab-label">${t('tabProfile')}</span></button>
            <button class="ptab ${activeTab === 'medals' ? 'active' : ''}" data-tab="medals"><span class="tab-icon">🏅</span><span class="tab-label">${t('tabMedals')}</span></button>
            <button class="ptab ${activeTab === 'bucket' ? 'active' : ''}" data-tab="bucket"><span class="tab-icon">🎯</span><span class="tab-label">${t('tabBucket')}</span></button>
            <button class="ptab ${activeTab === 'flights' ? 'active' : ''}" data-tab="flights"><span class="tab-icon">✈️</span><span class="tab-label">${t('tabFlights')}</span></button>
            <button class="ptab ${activeTab === 'compare' ? 'active' : ''}" data-tab="compare"><span class="tab-icon">⚔️</span><span class="tab-label">${t('tabCompare')}</span></button>
            <button class="ptab ${activeTab === 'settings' ? 'active' : ''}" data-tab="settings"><span class="tab-icon">⚙️</span><span class="tab-label">${t('settings')}</span></button>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <button id="profile-logout" style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#f87171;border-radius:10px;padding:8px 14px;font-size:0.85rem;cursor:pointer;font-family:inherit;font-weight:600;">${t('logout')}</button>
          </div>
        </div>
        <div class="profile-content" id="profile-content-area"></div>
      </div>
    `;

    document.getElementById('profile-back').addEventListener('click', () => {
      clearActiveTimers();
      onBack();
    });

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

    const totalPlacesCount = getTotalPlacesCount();
    const currentHomeCountry = getHomeCountry();
    const homeCountryObj = WORLD_COUNTRIES.find(c => c.code === currentHomeCountry) || { code: 'TR', flag: '🇹🇷', name: 'Türkiye' };
    const homeFlagHtml = getCountryFlagHtml(homeCountryObj.code, homeCountryObj.flag, { width: 20, height: 14 });
    let isGermanHome = currentHomeCountry === 'DE';
    let homeStateCount = 0;
    let homeSubdivisionCount = 0;
    let homeSubdivisionLabel = t('provincesVisited');
    if (currentHomeCountry === 'TR') {
      homeSubdivisionCount = baseStats.turkeyCount || 0;
      homeSubdivisionLabel = `${homeFlagHtml} ${t('provincesVisited')}`;
    } else if (isGermanHome) {
      const stateNames = [
        'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen',
        'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen',
        'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen',
        'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'
      ];
      homeStateCount = stateNames.filter(sName => storageData.worldVisits?.[`DE::${sName}`]?.status === 'visited').length;
      const subregionPrefix = 'DE::';
      homeSubdivisionCount = Object.entries(storageData.worldVisits || {}).filter(([k, v]) => k.startsWith(subregionPrefix) && !stateNames.includes(k.slice(4)) && v?.status === 'visited').length;
    } else {
      const prefix = `${currentHomeCountry}::`;
      homeSubdivisionCount = Object.entries(storageData.worldVisits || {}).filter(([k, v]) => k.startsWith(prefix) && v?.status === 'visited').length;
      const label = ['US', 'AU', 'BR', 'MX', 'IN', 'CA', 'AT', 'CH', 'NG'].includes(currentHomeCountry)
        ? (t('statesVisited') || 'Eyalet Gezildi')
        : (t('regionsVisited') || 'Bölge Gezildi');
      homeSubdivisionLabel = `${homeFlagHtml} ${label}`;
    }

    const shareData = {
      profile,
      worldVisits: storageData.worldVisits,
      turkeyVisits: storageData.turkeyVisits,
      worldCities: storageData.worldCities,
      homeCountry: currentHomeCountry
    };
    const shareCode = btoa(encodeURIComponent(JSON.stringify(shareData)));

    contentArea.innerHTML = `
      <div class="profile-main">
        <div class="profile-card">
          <div class="profile-header">
            <div class="profile-avatar">${escapeHtml(profile.avatar || '🧭')}</div>
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:4px;">
                <span class="profile-username">${escapeHtml(profile.username || 'Gezgin')}</span>
                <span class="profile-card-label">${currentLang === 'tr' ? 'GEZGİN KARTI' : 'TRAVELER CARD'}</span>
              </div>
              <div class="profile-bio">${escapeHtml(profile.bio) || (currentLang === 'tr' ? 'Dünyayı geziyor...' : 'Exploring the world...')}</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              <button id="btn-trigger-poster" class="profile-poster-trigger-btn" title="${t('createPoster')}">
                <span>📸</span> <span class="poster-btn-txt">${t('createPoster')}</span>
              </button>
              <button id="btn-trigger-wrapped" class="profile-poster-trigger-btn profile-wrapped-trigger-btn" title="${currentLang === 'tr' ? 'Gezgin Wrapped 2026 (Yıl Sonu Seyahat Karnesi)' : 'Traveler Wrapped 2026'}">
                <span>🎁</span> <span class="poster-btn-txt">Wrapped</span>
              </button>
            </div>
          </div>
          <div class="profile-stats">
            <div class="pstat"><span class="pstat-num" style="color:var(--status-visited, #ff5722)">${baseStats.worldCountryCount || 0}</span><span class="pstat-lbl">${t('countriesVisited')}</span></div>
            ${isGermanHome ? `
              <div class="pstat"><span class="pstat-num" style="color:var(--status-visited, #ff5722)">${homeStateCount}</span><span class="pstat-lbl">🏛️ ${t('statesVisited')}</span></div>
              <div class="pstat"><span class="pstat-num" style="color:var(--status-visited, #ff5722)">${homeSubdivisionCount}</span><span class="pstat-lbl">${homeFlagHtml} ${t('provincesVisited')}</span></div>
            ` : `
              <div class="pstat"><span class="pstat-num" style="color:var(--status-visited, #ff5722)">${homeSubdivisionCount}</span><span class="pstat-lbl">${homeSubdivisionLabel}</span></div>
            `}
            <div class="pstat"><span class="pstat-num" style="color:#3b82f6">${baseStats.worldCityCount || 0}</span><span class="pstat-lbl">${t('citiesVisited')}</span></div>
            <div class="pstat"><span class="pstat-num" style="color:#10b981">${earnedMedals.length}/${ACHIEVEMENTS.length}</span><span class="pstat-lbl">${t('tabMedals')}</span></div>
            <div class="pstat"><span class="pstat-num" style="color:#f59e0b">${totalPlacesCount}</span><span class="pstat-lbl">🍽️ ${currentLang === 'tr' ? 'Mekanlar' : 'Places'}</span></div>
            <div class="pstat"><span class="pstat-num" style="color:#ec4899" id="profile-stat-photos">0</span><span class="pstat-lbl">📸 ${currentLang === 'tr' ? 'Fotoğraf' : 'Photos'}</span></div>
            <div class="pstat"><span class="pstat-num" style="color:#06b6d4">%${baseStats.landAreaPercent || 0}</span><span class="pstat-lbl">🌐 ${currentLang === 'tr' ? 'Karasal Alan' : 'Land Area'}</span></div>
            <div class="pstat"><span class="pstat-num" style="color:#a855f7">%${baseStats.populationPercent || 0}</span><span class="pstat-lbl">👥 ${currentLang === 'tr' ? 'Dünya Nüfusu' : 'World Population'}</span></div>
          </div>
          ${earnedMedals.length > 0 ? `
            <div class="profile-badges-header" style="font-size:0.85rem;color:var(--theme-text-muted, #94a3b8);font-weight:600;margin-bottom:8px;">${currentLang === 'tr' ? 'Kazanılan Rozetler' : 'Earned Badges'} (${earnedMedals.length})</div>
            <div class="profile-badges">
              ${earnedMedals.map(m => `<span class="badge-icon" title="${m.title} - ${m.desc}">${m.icon}</span>`).join('')}
            </div>
          ` : `<div style="color:#64748b;font-size:0.85rem;margin-bottom:20px;">${currentLang === 'tr' ? 'Henüz madalya kazanılmadı. Haritada yerleri işaretleyerek madalya topla!' : 'No medals earned yet. Mark places on the map to earn medals!'}</div>`}
        </div>

        <!-- 📸 Seyahat Albümü & Fotoğraf Vitrini Card -->
        <div class="profile-photo-showcase-card" id="profile-photo-showcase">
          <div class="photo-showcase-header">
            <div class="photo-showcase-title">
              <span>📸 ${currentLang === 'tr' ? 'Seyahat Albümü & Hatıralar' : 'Travel Photo Album'}</span>
              <span class="photo-showcase-badge" id="photo-showcase-count">0 ${currentLang === 'tr' ? 'Fotoğraf' : 'Photos'}</span>
            </div>
            <span style="font-size:0.8rem;color:var(--theme-text-muted,#94a3b8);">${currentLang === 'tr' ? 'Haritada yerlere eklediğiniz anı fotoğrafları' : 'Memories added to places on map'}</span>
          </div>
          <div class="photo-showcase-grid" id="photo-showcase-grid">
            <div class="photo-showcase-empty">
              <span style="font-size:2rem;display:block;margin-bottom:6px;">📸</span>
              <div>${currentLang === 'tr' ? 'Henüz fotoğraf eklenmemiş.' : 'No photos added yet.'}</div>
              <div style="font-size:0.75rem;color:#64748b;margin-top:4px;">${currentLang === 'tr' ? 'Haritada gezdiğin yerlere tıklayıp "📸 Günlük" çekmecesinden anılarını ekleyebilirsin!' : 'Click any visited place on the map and add photos from the "📸 Journal" tab!'}</div>
            </div>
          </div>
        </div>

        <!-- Upcoming Trip Countdown Card -->
        <div id="trip-countdown-container"></div>

        <!-- Virtual Passport Banner Card -->
        <div class="passport-banner-card" id="btn-trigger-passport">
          <div class="passport-banner-inner">
            <div class="passport-banner-emblem">🛂</div>
            <div class="passport-banner-info">
              <div class="passport-banner-title">
                <span>${currentLang === 'tr' ? 'Sanal Gezgin Pasaportu' : 'Virtual Traveler Passport'}</span>
                <span style="font-size:0.7rem;background:rgba(255,215,0,0.2);color:#fbbf24;padding:2px 8px;border-radius:6px;border:1px solid rgba(255,215,0,0.35);">FAZ 1</span>
              </div>
              <div class="passport-banner-sub">${currentLang === 'tr' ? 'Resmi damgalarını, vizelerini ve biyometrik pasaportunu görüntüle' : 'View official stamped visas, entry/exit logs & biometric passport'}</div>
            </div>
            <div class="passport-banner-badge">
              <span>${currentLang === 'tr' ? 'Pasaportu İncele' : 'Open Passport'} ➔</span>
            </div>
          </div>
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

    document.getElementById('btn-trigger-wrapped')?.addEventListener('click', () => {
      openWrappedModal();
    });

    document.getElementById('btn-trigger-passport')?.addEventListener('click', () => {
      openPassportModal();
    });

    // Fetch photos for profile showcase & counter
    getAllPhotos(24).then(photos => {
      const pCountEl = document.getElementById('profile-stat-photos');
      const sCountEl = document.getElementById('photo-showcase-count');
      const gridEl = document.getElementById('photo-showcase-grid');
      if (pCountEl) pCountEl.textContent = photos.length;
      if (sCountEl) sCountEl.textContent = `${photos.length} ${currentLang === 'tr' ? 'Fotoğraf' : 'Photos'}`;

      if (gridEl && photos.length > 0) {
        gridEl.innerHTML = photos.map(p => `
          <div class="photo-showcase-item" data-id="${p.id}" title="${escapeHtml(p.caption || p.targetId || '')}">
            <img src="${p.dataUrl}" alt="Memory" loading="lazy" />
            <div class="photo-showcase-tag">${escapeHtml(p.targetId ? (p.targetId.includes('::') ? p.targetId.split('::')[1] : p.targetId) : '')}</div>
          </div>
        `).join('');

        gridEl.querySelectorAll('.photo-showcase-item').forEach(item => {
          item.addEventListener('click', () => {
            const photoId = item.dataset.id;
            const photoObj = photos.find(p => p.id === photoId);
            if (photoObj) {
              const placeTitle = photoObj.targetId ? (photoObj.targetId.includes('::') ? photoObj.targetId.split('::')[1] : photoObj.targetId) : 'Seyahat Hatırası';
              const existing = document.getElementById('photo-lightbox-modal');
              if (existing) existing.remove();
              const modal = document.createElement('div');
              modal.id = 'photo-lightbox-modal';
              modal.className = 'photo-lightbox-overlay';
              modal.innerHTML = `
                <div class="photo-lightbox-content">
                  <button type="button" class="photo-lightbox-close" id="btn-close-lightbox">&times;</button>
                  <img src="${photoObj.dataUrl}" class="photo-lightbox-img" alt="Memory Photo" />
                  <div class="photo-lightbox-footer">
                    <div class="photo-lightbox-title">${escapeHtml(placeTitle)}</div>
                    ${photoObj.caption ? `<div class="photo-lightbox-caption">${escapeHtml(photoObj.caption)}</div>` : ''}
                  </div>
                </div>
              `;
              document.body.appendChild(modal);
              modal.querySelector('#btn-close-lightbox')?.addEventListener('click', () => modal.remove());
              modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
            }
          });
        });
      }
    }).catch(err => console.warn('Could not load profile photos', err));

    // Render and manage Upcoming Trip Countdown
    const countdownContainer = document.getElementById('trip-countdown-container');

    function renderTripCountdown() {
      clearActiveTimers();
      if (!countdownContainer) return;

      const upcomingTrip = getUpcomingTrip();
      const transportIcons = { flight: '✈️', train: '🚆', car: '🚗', bus: '🚌', ship: '🚢' };

      if (!upcomingTrip) {
        countdownContainer.innerHTML = `
          <div class="trip-countdown-card empty" id="btn-create-trip">
            <div class="trip-empty-inner">
              <div class="trip-empty-icon">⏳</div>
              <div class="trip-empty-info">
                <div class="trip-empty-title">${currentLang === 'tr' ? 'Yaklaşan Seyahat Geri Sayımı Ekle' : 'Add Upcoming Trip Countdown'}</div>
                <div class="trip-empty-sub">${currentLang === 'tr' ? 'Bir sonraki rotanı belirle, gün ve saniyeleri canlı geri say!' : 'Set your next destination and count down the days & seconds!'}</div>
              </div>
              <button type="button" class="trip-add-btn">+ ${currentLang === 'tr' ? 'Seyahat Planla' : 'Plan Trip'}</button>
            </div>
          </div>
        `;
        document.getElementById('btn-create-trip')?.addEventListener('click', () => openTripModal());
        return;
      }

      const transIcon = transportIcons[upcomingTrip.transport] || '✈️';

      countdownContainer.innerHTML = `
        <div class="trip-countdown-card active">
          <div class="trip-countdown-header">
            <div class="trip-countdown-badge">⏳ ${currentLang === 'tr' ? 'YAKLAŞAN SEYAHAT GERİ SAYIMI' : 'UPCOMING TRIP COUNTDOWN'}</div>
            <div class="trip-countdown-actions">
              <button type="button" class="trip-action-icon-btn" id="btn-edit-trip" title="${currentLang === 'tr' ? 'Düzenle' : 'Edit'}">✏️</button>
              <button type="button" class="trip-action-icon-btn del" id="btn-del-trip" title="${currentLang === 'tr' ? 'Sil' : 'Delete'}">🗑️</button>
            </div>
          </div>
          <div class="trip-target-info">
            <span class="trip-trans-icon">${transIcon}</span>
            <div style="flex:1;min-width:0;">
              <div class="trip-dest-name">${escapeHtml(upcomingTrip.destination || 'Yeni Rota')}</div>
              <div class="trip-target-meta">📅 ${new Date(upcomingTrip.date).toLocaleString(currentLang === 'tr' ? 'tr-TR' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}${upcomingTrip.notes ? ` • <i>"${escapeHtml(upcomingTrip.notes)}"</i>` : ''}</div>
            </div>
          </div>
          <div class="countdown-timer-grid">
            <div class="timer-unit-box">
              <span class="timer-val" id="cd-days">00</span>
              <span class="timer-lbl">${currentLang === 'tr' ? 'GÜN' : 'DAYS'}</span>
            </div>
            <div class="timer-sep">:</div>
            <div class="timer-unit-box">
              <span class="timer-val" id="cd-hours">00</span>
              <span class="timer-lbl">${currentLang === 'tr' ? 'SAAT' : 'HOURS'}</span>
            </div>
            <div class="timer-sep">:</div>
            <div class="timer-unit-box">
              <span class="timer-val" id="cd-mins">00</span>
              <span class="timer-lbl">${currentLang === 'tr' ? 'DAKİKA' : 'MINUTES'}</span>
            </div>
            <div class="timer-sep">:</div>
            <div class="timer-unit-box">
              <span class="timer-val" id="cd-secs">00</span>
              <span class="timer-lbl">${currentLang === 'tr' ? 'SANİYE' : 'SECONDS'}</span>
            </div>
          </div>
        </div>
      `;

      document.getElementById('btn-edit-trip')?.addEventListener('click', () => openTripModal(upcomingTrip));
      document.getElementById('btn-del-trip')?.addEventListener('click', () => {
        if (confirm(currentLang === 'tr' ? 'Bu seyahat geri sayımını kaldırmak istediğine emin misin?' : 'Delete this upcoming trip countdown?')) {
          deleteUpcomingTrip();
          renderTripCountdown();
        }
      });

      function updateClock() {
        const targetMs = new Date(upcomingTrip.date).getTime();
        const nowMs = Date.now();
        const diff = targetMs - nowMs;

        if (diff <= 0) {
          const elDays = document.getElementById('cd-days');
          if (elDays) {
            elDays.textContent = '00';
            document.getElementById('cd-hours').textContent = '00';
            document.getElementById('cd-mins').textContent = '00';
            document.getElementById('cd-secs').textContent = '00';
          }
          return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        const elDays = document.getElementById('cd-days');
        if (elDays) {
          elDays.textContent = String(d).padStart(2, '0');
          document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
          document.getElementById('cd-mins').textContent = String(m).padStart(2, '0');
          document.getElementById('cd-secs').textContent = String(s).padStart(2, '0');
        }
      }

      updateClock();
      activeCountdownTimerId = setInterval(updateClock, 1000);
    }

    renderTripCountdown();

    function openTripModal(existingTrip = null) {
      const modal = document.createElement('div');
      modal.className = 'trip-modal-overlay';
      const getLocalDatetimeStr = (dateObj) => {
        const d = dateObj || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 16);
      };
      const defaultDate = existingTrip ? (existingTrip.date ? getLocalDatetimeStr(new Date(existingTrip.date)) : getLocalDatetimeStr()) : getLocalDatetimeStr();
      let selectedTrans = existingTrip ? existingTrip.transport : 'flight';

      modal.innerHTML = `
        <div class="trip-modal-dialog">
          <div class="trip-modal-top">
            <h3>⏳ ${existingTrip ? (currentLang === 'tr' ? 'Seyahati Düzenle' : 'Edit Trip') : (currentLang === 'tr' ? 'Yeni Seyahat Planla' : 'Plan New Trip')}</h3>
            <button class="trip-modal-close" id="trip-modal-close-btn">&times;</button>
          </div>
          <div class="trip-modal-body">
            <div class="trip-form-group">
              <label>${currentLang === 'tr' ? 'Hedef Ülke veya Şehir' : 'Destination Country / City'}</label>
              <input type="text" id="trip-in-dest" class="trip-form-input" placeholder="${currentLang === 'tr' ? 'Örn: Roma, İtalya veya Tokyo, Japonya' : 'e.g. Rome, Italy or Tokyo, Japan'}" value="${existingTrip ? escapeHtml(existingTrip.destination) : ''}" maxlength="40">
            </div>
            <div class="trip-form-group">
              <label>${currentLang === 'tr' ? 'Seyahat Tarihi & Saati' : 'Date & Time'}</label>
              <input type="datetime-local" id="trip-in-date" class="trip-form-input" value="${defaultDate}">
            </div>
            <div class="trip-form-group">
              <label>${currentLang === 'tr' ? 'Ulaşım Aracı' : 'Mode of Transport'}</label>
              <div class="trip-trans-row">
                <button type="button" class="trip-trans-btn ${selectedTrans === 'flight' ? 'active' : ''}" data-trans="flight">✈️ <span>Uçak</span></button>
                <button type="button" class="trip-trans-btn ${selectedTrans === 'train' ? 'active' : ''}" data-trans="train">🚆 <span>Tren</span></button>
                <button type="button" class="trip-trans-btn ${selectedTrans === 'car' ? 'active' : ''}" data-trans="car">🚗 <span>Araba</span></button>
                <button type="button" class="trip-trans-btn ${selectedTrans === 'bus' ? 'active' : ''}" data-trans="bus">🚌 <span>Otobüs</span></button>
                <button type="button" class="trip-trans-btn ${selectedTrans === 'ship' ? 'active' : ''}" data-trans="ship">🚢 <span>Gemi</span></button>
              </div>
            </div>
            <div class="trip-form-group">
              <label>${currentLang === 'tr' ? 'Kısa Not / Heyecan Notu (İsteğe bağlı)' : 'Short Note (Optional)'}</label>
              <input type="text" id="trip-in-notes" class="trip-form-input" placeholder="${currentLang === 'tr' ? 'Örn: Biletler hazır, otel rezervasyonu tamam!' : 'e.g. Tickets booked, hotel confirmed!'}" value="${existingTrip ? escapeHtml(existingTrip.notes || '') : ''}" maxlength="60">
            </div>
            <button type="button" class="trip-submit-btn" id="trip-save-btn">💾 ${currentLang === 'tr' ? 'Geri Sayımı Başlat' : 'Start Countdown'}</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      modal.querySelectorAll('.trip-trans-btn').forEach(b => {
        b.addEventListener('click', () => {
          modal.querySelectorAll('.trip-trans-btn').forEach(x => x.classList.remove('active'));
          b.classList.add('active');
          selectedTrans = b.dataset.trans;
        });
      });

      const close = () => modal.remove();
      modal.querySelector('#trip-modal-close-btn').addEventListener('click', close);
      modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

      modal.querySelector('#trip-save-btn').addEventListener('click', () => {
        const dest = sanitizeText(modal.querySelector('#trip-in-dest')?.value || '', 40);
        const dt = modal.querySelector('#trip-in-date')?.value;
        const notes = sanitizeText(modal.querySelector('#trip-in-notes')?.value || '', 60);

        if (!dest) {
          alert(currentLang === 'tr' ? 'Lütfen bir seyahat hedefi girin.' : 'Please enter a destination.');
          return;
        }
        if (!dt) {
          alert(currentLang === 'tr' ? 'Lütfen seyahat tarihini seçin.' : 'Please select travel date.');
          return;
        }

        saveUpcomingTrip({
          destination: dest,
          date: dt,
          transport: selectedTrans,
          notes
        });

        close();
        renderTripCountdown();
      });
    }

    document.getElementById('profile-copy-btn')?.addEventListener('click', (e) => {
      const input = document.getElementById('profile-share-code');
      const textToCopy = input ? input.value : '';
      const updateBtn = () => {
        e.target.textContent = t('copied');
        setTimeout(() => e.target.textContent = t('copy'), 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(updateBtn).catch(() => {
          input?.select();
          document.execCommand('copy');
          updateBtn();
        });
      } else {
        input?.select();
        document.execCommand('copy');
        updateBtn();
      }
    });
  }

  function renderSettingsTab(contentArea) {
    const currentLang = getLanguage();
    const currentTheme = getTheme();
    const currentUiSize = getUiSize();
    const currentHomeCountry = getHomeCountry();
    const visitedColor = getStatusColor('visited');
    const plannedColor = getStatusColor('planned');
    const wishlistColor = getStatusColor('wishlist');

    let userProfile = { username: 'Gezgin', avatar: '🧭', bio: '' };
    try {
      const raw = localStorage.getItem('gv_profile');
      if (raw) {
        const p = JSON.parse(raw);
        if (p && typeof p === 'object') userProfile = p;
      }
    } catch (e) {}

    const homeCountryObj = WORLD_COUNTRIES.find(c => c.code === currentHomeCountry) || { code: 'TR', flag: '🇹🇷', name: 'Türkiye' };
    const homeCountryFlagHtml = getCountryFlagHtml(currentHomeCountry, homeCountryObj?.flag, { width: 34, height: 24 });

    const sortedCountries = [...WORLD_COUNTRIES].sort((a, b) => {
      const nameA = currentLang === 'tr' ? (a.name || a.nameEn) : (a.nameEn || a.name);
      const nameB = currentLang === 'tr' ? (b.name || b.nameEn) : (b.nameEn || b.name);
      return nameA.localeCompare(nameB, currentLang === 'tr' ? 'tr' : 'en');
    });

    const currentPassportType = getPassportType();

    const themeList = [
      { id: 'dark', name: currentLang === 'tr' ? 'Karanlık' : 'Dark', icon: '🌙', colors: ['#090d16', '#1e293b', '#ff5722'] },
      { id: 'light', name: currentLang === 'tr' ? 'Aydınlık' : 'Light', icon: '☀️', colors: ['#c5dff6', '#f8fafc', '#ff5722'] },
      { id: 'ocean', name: currentLang === 'tr' ? 'Okyanus' : 'Ocean', icon: '🌊', colors: ['#0c1929', '#1a3a5c', '#38bdf8'] },
      { id: 'emerald', name: currentLang === 'tr' ? 'Zümrüt' : 'Emerald', icon: '🌲', colors: ['#0a1f0a', '#1a3d1a', '#10b981'] },
      { id: 'vintage', name: currentLang === 'tr' ? 'Nostalji' : 'Vintage', icon: '📜', colors: ['#2c1810', '#4a3828', '#d97706'] },
      { id: 'midnight_gold', name: currentLang === 'tr' ? 'Gece & Altın' : 'Midnight Gold', icon: '👑', colors: ['#0b0d13', '#161922', '#e5c07b'] },
      { id: 'natgeo_atlas', name: currentLang === 'tr' ? 'Atlas Klasik' : 'NatGeo Atlas', icon: '🗺️', colors: ['#0f172a', '#1e293b', '#fbbf24'] },
      { id: 'cyberpunk', name: currentLang === 'tr' ? 'Siberpunk Gece' : 'Cyberpunk', icon: '⚡', colors: ['#050510', '#120d26', '#06b6d4'] },
      { id: 'pure_oled', name: currentLang === 'tr' ? 'Saf OLED Siyah' : 'Pure OLED', icon: '🖤', colors: ['#000000', '#0a0a0a', '#3b82f6'] }
    ];

    const uiScaleOptions = [
      { id: 'small', label: t('uiSizeSmall'), icon: '🔍' },
      { id: 'medium', label: t('uiSizeMedium'), icon: '⚖️' },
      { id: 'large', label: t('uiSizeLarge'), icon: '🔎' }
    ];

    contentArea.innerHTML = `
      <div class="settings-container">
        
        <!-- 1. Traveler Identity & Profile Customization -->
        <div class="settings-card">
          <div class="settings-card-header">
            <h3 class="settings-card-title">👤 ${t('profileSettingsTitle')}</h3>
          </div>
          <p class="settings-card-desc">${t('profileSettingsDesc')}</p>
          
          <div class="settings-profile-preview">
            <div class="settings-profile-avatar" id="settings-preview-avatar">${escapeHtml(userProfile.avatar || '🧭')}</div>
            <div class="settings-profile-info">
              <div class="settings-profile-name">
                <span>${escapeHtml(userProfile.username || 'Gezgin')}</span>
              </div>
              <div class="settings-profile-bio">${escapeHtml(userProfile.bio) || (currentLang === 'tr' ? 'Dünyayı keşfediyor...' : 'Exploring the world...')}</div>
            </div>
            <button type="button" class="settings-edit-toggle-btn" id="settings-toggle-edit-btn">
              ✏️ ${t('editProfile')}
            </button>
          </div>

          <!-- Collapsible Profile Edit Drawer -->
          <div class="settings-edit-drawer" id="settings-edit-drawer" style="display:none;">
            <div class="settings-input-group">
              <label>${t('selectAvatar')}</label>
              <div class="settings-avatar-picker-grid" id="settings-avatar-picker-grid">
                ${ALLOWED_AVATARS.map(em => `
                  <button type="button" class="settings-avatar-pick-btn ${em === (userProfile.avatar || '🧭') ? 'selected' : ''}" data-avatar="${em}">${em}</button>
                `).join('')}
              </div>
            </div>
            <div class="settings-input-group">
              <label for="settings-edit-username">${t('username')} (Max 20)</label>
              <input type="text" id="settings-edit-username" class="settings-text-input" maxlength="20" value="${escapeHtml(userProfile.username || '')}" placeholder="${t('usernamePlaceholder')}">
            </div>
            <div class="settings-input-group">
              <label for="settings-edit-bio">${t('bio')} (Max 60)</label>
              <input type="text" id="settings-edit-bio" class="settings-text-input" maxlength="60" value="${escapeHtml(userProfile.bio || '')}" placeholder="${t('bioPlaceholder')}">
            </div>
            <button type="button" class="settings-save-profile-btn" id="settings-save-profile-btn">
              💾 ${t('saveProfile')}
            </button>
          </div>
        </div>

        <!-- 2. Theme & Atmosphere Studio -->
        <div class="settings-card">
          <div class="settings-card-header">
            <h3 class="settings-card-title">🎨 ${t('themeStudio')}</h3>
          </div>
          <p class="settings-card-desc">${t('themeStudioDesc')}</p>
          <div class="settings-themes-grid">
            ${themeList.map(th => {
              const isActive = currentTheme === th.id;
              return `
                <button type="button" class="theme-card-btn ${isActive ? 'active' : ''}" data-theme="${th.id}">
                  ${isActive ? `<span class="theme-active-tag">✓</span>` : ''}
                  <span class="theme-card-icon">${th.icon}</span>
                  <span class="theme-card-name">${th.name}</span>
                  <div class="theme-swatch-bar">
                    <span style="background:${th.colors[0]};"></span>
                    <span style="background:${th.colors[1]};"></span>
                    <span style="background:${th.colors[2]};"></span>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 3. UI & Font Scale -->
        <div class="settings-card">
          <div class="settings-card-header">
            <h3 class="settings-card-title">📐 ${t('uiScaleTitle')}</h3>
          </div>
          <p class="settings-card-desc">${t('uiScaleDesc')}</p>
          <div class="settings-scale-row">
            ${uiScaleOptions.map(opt => `
              <button type="button" class="scale-btn ${currentUiSize === opt.id ? 'active' : ''}" data-size="${opt.id}">
                <span>${opt.icon}</span>
                <span>${opt.label}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 3B. Screen & View Mode (Desktop Fullscreen vs Mobile Phone Frame) -->
        <div class="settings-card">
          <div class="settings-card-header">
            <h3 class="settings-card-title">📱 ${currentLang === 'tr' ? 'Ekran & Görünüm Modu' : 'Display & View Mode'}</h3>
          </div>
          <p class="settings-card-desc">${currentLang === 'tr' ? 'Masaüstü bilgisayarlarda telefon çerçevesi veya tam ekran harita modu arasında geçiş yapın:' : 'Switch between mobile phone simulator or fullscreen map mode on desktop:'}</p>
          <div class="settings-scale-row">
            <button type="button" class="scale-btn ${localStorage.getItem('gv_simulator_mode') !== 'fullscreen' ? 'active' : ''}" id="btn-set-mode-phone">
              <span>📱</span>
              <span>${currentLang === 'tr' ? 'Mobil Çerçeve (390×844)' : 'Phone Frame (390×844)'}</span>
            </button>
            <button type="button" class="scale-btn ${localStorage.getItem('gv_simulator_mode') === 'fullscreen' ? 'active' : ''}" id="btn-set-mode-fullscreen">
              <span>🖥️</span>
              <span>${currentLang === 'tr' ? 'Masaüstü Tam Ekran' : 'Desktop Fullscreen'}</span>
            </button>
          </div>
        </div>

        <!-- 4. Language & Region -->
        <div class="settings-card">
          <div class="settings-card-header">
            <h3 class="settings-card-title">🌐 ${t('language')}</h3>
          </div>
          <p class="settings-card-desc">${currentLang === 'tr' ? 'Uygulama arayüzünün dilini seçin:' : 'Select application interface language:'}</p>
          <div class="lang-btn-group">
            <button type="button" class="lang-btn ${currentLang === 'tr' ? 'active' : ''}" data-lang="tr">
              <span style="font-size:1.25rem;">🇹🇷</span>
              <span style="font-weight:700;">Türkçe</span>
            </button>
            <button type="button" class="lang-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en">
              <span style="font-size:1.25rem;">🇬🇧</span>
              <span style="font-weight:700;">English</span>
            </button>
          </div>
        </div>

        <!-- 5. Home Country (Ana Ülke) -->
        <div class="settings-card">
          <div class="settings-card-header">
            <h3 class="settings-card-title">📍 ${t('homeCountry')}</h3>
          </div>
          <p class="settings-card-desc">${t('homeCountryDesc')}</p>
          <div class="home-country-picker-box">
            <div class="home-country-current-pill">
              <span id="settings-home-country-flag">${homeCountryFlagHtml}</span>
              <span class="home-country-current-name">${currentLang === 'tr' ? (homeCountryObj?.name || homeCountryObj?.nameEn) : (homeCountryObj?.nameEn || homeCountryObj?.name)}</span>
            </div>
            <select id="settings-home-country-select" class="home-country-select-styled">
              ${sortedCountries.map(c => `
                <option value="${c.code}" ${c.code === currentHomeCountry ? 'selected' : ''}>
                  ${currentLang === 'tr' ? (c.name || c.nameEn) : (c.nameEn || c.name)} (${c.code})
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- 5B. Passport Type & Visa Privilege -->
        <div class="settings-card">
          <div class="settings-card-header">
            <h3 class="settings-card-title">🛂 ${currentLang === 'tr' ? 'Pasaport Türü & Vize Ayrımı' : 'Passport Type & Visa Rules'}</h3>
          </div>
          <p class="settings-card-desc">${currentLang === 'tr' ? 'Harita pop-up\'larında ve gezgin rehberinde doğru vize kurallarını görebilmek için pasaportunuzu seçin:' : 'Select your passport type to display accurate visa rules across the map and country popups:'}</p>
          <div class="passport-type-switch-row">
            <button type="button" class="passport-type-btn ${currentPassportType === 'bordo' ? 'active' : ''}" data-passport="bordo">
              <div class="passport-type-icon">📕</div>
              <div class="passport-type-info">
                <span class="passport-type-title">${currentLang === 'tr' ? 'Bordo Pasaport' : 'Ordinary (Burgundy)'}</span>
                <span class="passport-type-desc">${currentLang === 'tr' ? 'Umuma Mahsus Türk Pasaportu' : 'Standard Turkish Citizen Passport'}</span>
              </div>
            </button>
            <button type="button" class="passport-type-btn ${currentPassportType === 'yesil' ? 'active' : ''}" data-passport="yesil">
              <div class="passport-type-icon">📗</div>
              <div class="passport-type-info">
                <span class="passport-type-title">${currentLang === 'tr' ? 'Yeşil Pasaport' : 'Special (Green)'}</span>
                <span class="passport-type-desc">${currentLang === 'tr' ? 'Hususi Damgalı Pasaport (Schengen vizesiz)' : 'Special Passport (Schengen Visa-Free)'}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- 6. Custom Map Status Colors -->
        <div class="settings-card">
          <div class="settings-card-header">
            <h3 class="settings-card-title">🌈 ${t('customizeColors')}</h3>
          </div>
          <p class="settings-card-desc">${currentLang === 'tr' ? 'Haritada gezdiğiniz, planladığınız ve istek listenizdeki yerlerin parlak vurgu renklerini belirleyin:' : 'Customize highlighting colors for visited, planned and wishlist locations:'}</p>

          <!-- Visited Color Selection -->
          <div class="color-status-group">
            <div class="color-status-header">
              <span class="color-status-dot" style="background:${visitedColor};color:${visitedColor};"></span>
              <span class="color-status-title">✅ ${t('colorVisited')}</span>
            </div>
            <div class="color-chips-row">
              ${COLOR_PALETTES.map(p => {
                const isSelected = p.color.toLowerCase() === visitedColor.toLowerCase();
                return `
                  <button type="button" class="settings-color-chip ${isSelected ? 'selected' : ''}"
                          data-status="visited" data-color="${p.color}" title="${currentLang === 'tr' ? p.name : p.nameEn}"
                          style="background:${p.color};box-shadow:${isSelected ? '0 0 12px ' + p.color : 'none'};">
                    ${isSelected ? '<span class="chip-check">✓</span>' : ''}
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Planned Color Selection -->
          <div class="color-status-group">
            <div class="color-status-header">
              <span class="color-status-dot" style="background:${plannedColor};color:${plannedColor};"></span>
              <span class="color-status-title">⏳ ${t('colorPlanned')}</span>
            </div>
            <div class="color-chips-row">
              ${COLOR_PALETTES.map(p => {
                const isSelected = p.color.toLowerCase() === plannedColor.toLowerCase();
                return `
                  <button type="button" class="settings-color-chip ${isSelected ? 'selected' : ''}"
                          data-status="planned" data-color="${p.color}" title="${currentLang === 'tr' ? p.name : p.nameEn}"
                          style="background:${p.color};box-shadow:${isSelected ? '0 0 12px ' + p.color : 'none'};">
                    ${isSelected ? '<span class="chip-check">✓</span>' : ''}
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Wishlist Color Selection -->
          <div class="color-status-group">
            <div class="color-status-header">
              <span class="color-status-dot" style="background:${wishlistColor};color:${wishlistColor};"></span>
              <span class="color-status-title">💜 ${t('colorWishlist')}</span>
            </div>
            <div class="color-chips-row">
              ${COLOR_PALETTES.map(p => {
                const isSelected = p.color.toLowerCase() === wishlistColor.toLowerCase();
                return `
                  <button type="button" class="settings-color-chip ${isSelected ? 'selected' : ''}"
                          data-status="wishlist" data-color="${p.color}" title="${currentLang === 'tr' ? p.name : p.nameEn}"
                          style="background:${p.color};box-shadow:${isSelected ? '0 0 12px ' + p.color : 'none'};">
                    ${isSelected ? '<span class="chip-check">✓</span>' : ''}
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <div>
            <button type="button" class="reset-colors-btn" id="settings-reset-colors-btn">
              <span>↺</span> <span>${t('resetColors')}</span>
            </button>
          </div>
        </div>

        <!-- 7. Data Backup & Restore -->
        <div class="settings-card">
          <div class="settings-card-header">
            <h3 class="settings-card-title">💾 ${t('backupTitle')}</h3>
          </div>
          <p class="settings-card-desc">${t('backupDesc')}</p>
          <div class="backup-actions-grid">
            <button type="button" class="backup-action-card" id="settings-export-backup-btn">
              <span class="backup-icon">📥</span>
              <div>
                <div class="backup-title">${t('downloadBackup')}</div>
                <div class="backup-subtitle">${currentLang === 'tr' ? 'Tüm verilerinizi tek bir .json dosyasında cihazınıza indirin' : 'Export all your travel data as a .json backup'}</div>
              </div>
            </button>
            <button type="button" class="backup-action-card" id="settings-import-backup-btn">
              <span class="backup-icon">📤</span>
              <div>
                <div class="backup-title">${t('restoreBackup')}</div>
                <div class="backup-subtitle">${currentLang === 'tr' ? 'Daha önce aldığınız bir yedek dosyasını geri yükleyin' : 'Restore from a previously saved backup file'}</div>
              </div>
            </button>
            <input type="file" id="settings-backup-file-input" accept=".json" style="display:none;">
          </div>
        </div>

        <!-- 8. Danger Zone -->
        <div class="settings-card settings-danger-card">
          <div class="settings-card-header">
            <h3 class="settings-card-title" style="color:#ef4444;">⚠️ ${t('dangerZone')}</h3>
          </div>
          <p class="settings-card-desc">${t('resetDataDesc')}</p>
          <button type="button" id="profile-reset-map-btn" class="settings-danger-btn">
            <span>🗑️</span> <span>${t('reset')}</span>
          </button>
        </div>

        <!-- 9. App Info & Security Footnote -->
        <div class="settings-about-box">
          <div class="settings-about-logo">
            <span style="font-size:1.8rem;">🧭</span>
            <div>
              <div class="settings-about-title">${t('appName')}</div>
              <div class="settings-about-sub">${t('appInfoDesc')}</div>
            </div>
          </div>
          <div class="settings-privacy-badge">
            <span>🛡️</span>
            <span>%100 Offline & Safe</span>
          </div>
        </div>

      </div>
    `;

    // ── Bind Interactive Event Handlers ──────────────────────────────────────────

    // 1. Profile Edit Drawer Toggle & Avatar Picker
    const toggleEditBtn = document.getElementById('settings-toggle-edit-btn');
    const editDrawer = document.getElementById('settings-edit-drawer');
    let selectedAvatarEmoji = userProfile.avatar || '🧭';

    toggleEditBtn?.addEventListener('click', () => {
      const isHidden = editDrawer.style.display === 'none';
      editDrawer.style.display = isHidden ? 'flex' : 'none';
      toggleEditBtn.textContent = isHidden ? (currentLang === 'tr' ? '✕ Kapat' : '✕ Close') : `✏️ ${t('editProfile')}`;
    });

    document.querySelectorAll('.settings-avatar-pick-btn').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.settings-avatar-pick-btn').forEach(btn => btn.classList.remove('selected'));
        b.classList.add('selected');
        selectedAvatarEmoji = b.getAttribute('data-avatar');
        const preview = document.getElementById('settings-preview-avatar');
        if (preview) preview.textContent = selectedAvatarEmoji;
      });
    });

    document.getElementById('settings-save-profile-btn')?.addEventListener('click', () => {
      const nameInput = document.getElementById('settings-edit-username');
      const bioInput = document.getElementById('settings-edit-bio');
      const newName = sanitizeText(nameInput?.value || '', 20) || 'Gezgin';
      const newBio = sanitizeText(bioInput?.value || '', 60);

      const updated = {
        ...userProfile,
        username: newName,
        bio: newBio,
        avatar: selectedAvatarEmoji
      };

      try {
        localStorage.setItem('gv_profile', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save profile', e);
      }

      alert(t('profileSaved'));
      render();
    });

    // 2. Theme Selection
    contentArea.querySelectorAll('.theme-card-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tid = btn.getAttribute('data-theme');
        setTheme(tid);
        render();
      });
    });

    // 3. UI Scale Selection
    contentArea.querySelectorAll('.scale-btn[data-size]').forEach(btn => {
      btn.addEventListener('click', () => {
        const sizeKey = btn.getAttribute('data-size');
        if (sizeKey) {
          setUiSize(sizeKey);
          render();
        }
      });
    });

    // 3B. Display View Mode Selection
    contentArea.querySelector('#btn-set-mode-phone')?.addEventListener('click', () => {
      localStorage.removeItem('gv_simulator_mode');
      window.location.reload();
    });
    contentArea.querySelector('#btn-set-mode-fullscreen')?.addEventListener('click', () => {
      localStorage.setItem('gv_simulator_mode', 'fullscreen');
      window.location.reload();
    });

    // 4. Language Selection
    contentArea.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setLanguage(btn.getAttribute('data-lang'));
        render();
      });
    });

    // 5. Home Country Selection
    document.getElementById('settings-home-country-select')?.addEventListener('change', (e) => {
      setHomeCountry(e.target.value);
      if (window.__refreshMapStats) {
        window.__refreshMapStats();
      }
      render();
    });

    // 5B. Passport Type Selection
    contentArea.querySelectorAll('.passport-type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pType = e.currentTarget.getAttribute('data-passport');
        setPassportType(pType);
        render();
      });
    });

    // 6. Color Chips Selection
    contentArea.querySelectorAll('.settings-color-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const statusKey = btn.getAttribute('data-status');
        const color = btn.getAttribute('data-color');
        setStatusColor(statusKey, color);
        render();
      });
    });

    // Reset Colors to Default
    document.getElementById('settings-reset-colors-btn')?.addEventListener('click', () => {
      setStatusColor('visited', '#ff5722');
      setStatusColor('planned', '#f59e0b');
      setStatusColor('wishlist', '#8b5cf6');
      alert(t('colorsReset'));
      render();
    });

    // 7. Backup & Restore
    document.getElementById('settings-export-backup-btn')?.addEventListener('click', () => {
      exportBackup();
    });

    const fileInput = document.getElementById('settings-backup-file-input');
    document.getElementById('settings-import-backup-btn')?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try { e.target.value = ''; } catch {}
        const content = event.target?.result;
        if (content) {
          const success = importBackup(content);
          if (success) {
            alert(t('backupRestored'));
            render();
            if (window.__refreshMapStats) {
              window.__refreshMapStats();
            }
          } else {
            alert(t('backupError'));
          }
        }
      };
      reader.onerror = () => {
        try { e.target.value = ''; } catch {}
        alert(t('backupError'));
      };
      reader.readAsText(file);
    });

    // 8. Danger Zone - Reset Data
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
    let challengesList = [];

    try {
      const _sd = getStorageData();
      const _bs = calculateStats();
      const earned = getEarnedAchievements(_sd, _bs);
      earnedIds = earned.map(e => e.id);

      const visitedCodes = Object.keys(_sd.worldVisits || {}).filter(k => !k.includes('::') && _sd.worldVisits[k]?.status === 'visited');
      if ((_bs.turkeyCount || 0) > 0 && !visitedCodes.includes('TR')) visitedCodes.push('TR');
      challengesList = calculateChallengesProgress(visitedCodes);
    } catch(e) { console.error(e); }

    const total = achievements.length;
    const earnedCount = earnedIds.length;
    const percent = total > 0 ? Math.round((earnedCount / total) * 100) : 0;
    const completedChallengesCount = challengesList.filter(c => c.isCompleted).length;

    let html = `
      <div class="achievements-view">
        <div class="ach-header">
          <div class="ach-progress-text">${t('medalsEarned', { count: earnedCount, total, percent })}</div>
          <div class="ach-progress-bar-wrap">
            <div class="ach-progress-bar" style="width: ${percent}%"></div>
          </div>
        </div>

        <!-- 🗺️ Rota Koleksiyonları & Seyahat Challenge'ları -->
        <div class="challenges-section">
          <div class="challenges-header">
            <div class="challenges-title-row">
              <span class="challenges-main-title">🗺️ ${currentLang === 'tr' ? "Gezgin Challenge'ları & Rota Koleksiyonları" : 'Route Collections & Challenges'}</span>
              <span class="challenges-badge-count">${completedChallengesCount} / ${challengesList.length} ${currentLang === 'tr' ? 'Tamamlandı' : 'Completed'}</span>
            </div>
            <p class="challenges-desc">${currentLang === 'tr' ? 'Dünyanın en ikonik rotalarını tamamla, özel unvan ve koleksiyon rozetlerini kazan!' : 'Complete the world\'s most iconic routes and unlock exclusive title badges!'}</p>
          </div>

          <div class="challenges-grid">
            ${challengesList.map(ch => {
              const title = currentLang === 'en' ? (ch.titleEn || ch.title) : ch.title;
              const desc = currentLang === 'en' ? (ch.descEn || ch.desc) : ch.desc;
              return `
                <div class="challenge-card ${ch.isCompleted ? 'completed' : ''}">
                  <div class="challenge-card-top">
                    <div class="challenge-icon-wrap">${ch.icon}</div>
                    <div class="challenge-title-info">
                      <div class="challenge-card-title">${escapeHtml(title)}</div>
                      <div class="challenge-badge-tag ${ch.isCompleted ? 'earned' : 'locked'}">
                        ${ch.isCompleted ? `<span>🎉 ${escapeHtml(ch.badge)}</span>` : `<span>🔒 ${escapeHtml(ch.badge)}</span>`}
                      </div>
                    </div>
                  </div>
                  <div class="challenge-card-desc">${escapeHtml(desc)}</div>
                  
                  <div class="challenge-progress-box">
                    <div class="challenge-progress-bar-bg">
                      <div class="challenge-progress-bar-fill" style="width: ${ch.percentage}%"></div>
                    </div>
                    <div class="challenge-progress-labels">
                      <span class="ch-count">${ch.count} / ${ch.total} ${currentLang === 'tr' ? 'Ülke' : 'Countries'}</span>
                      <span class="ch-percent">%${ch.percentage}</span>
                    </div>
                  </div>

                  <div class="challenge-flags-row">
                    ${ch.countries.map(code => {
                      const isVis = ch.visitedCodes.includes(code);
                      const cObj = WORLD_COUNTRIES.find(x => x.code === code);
                      const cName = cObj ? getCountryDisplayName(cObj) : code;
                      const flag = cObj?.flag || '🌍';
                      return `
                        <span class="challenge-flag-chip ${isVis ? 'visited' : 'missing'}" title="${escapeHtml(cName)}: ${isVis ? (currentLang === 'tr' ? 'Ziyaret Edildi ✓' : 'Visited ✓') : (currentLang === 'tr' ? 'Henüz Gidilmedi' : 'Not Visited')}">
                          <span class="flag-icon">${flag}</span>
                          ${isVis ? '<span class="flag-check-dot">✓</span>' : ''}
                        </span>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
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
                  <div class="bucket-item-card" data-id="${escapeHtml(item.id)}" data-idx="${index}">
                    <div class="bucket-rank-num">#${index + 1}</div>
                    <div class="bucket-flag-wrap">${flagHtml}</div>
                    <div class="bucket-info-wrap">
                      <div class="bucket-item-title">${escapeHtml(item.name)}</div>
                      <div class="bucket-item-sub">${escapeHtml(item.sub)}</div>
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
          <div class="profile-stats" style="margin-bottom:20px;">
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
          <div class="aviation-subtabs-row" style="margin-bottom:20px;">
            <button type="button" class="aviation-subtab-btn ${flightSubTab === 'alliances' ? 'active' : ''}" id="tab-btn-alliances">
              🏢 ${currentLang === 'tr' ? 'Havayolu Birlikleri' : 'Airline Alliances'}
            </button>
            <button type="button" class="aviation-subtab-btn ${flightSubTab === 'aircraft' ? 'active' : ''}" id="tab-btn-aircraft">
              🛩️ ${currentLang === 'tr' ? 'Uçak Filosu' : 'Aircraft Fleet'}
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

          <!-- PANE 2: AIRCRAFT FLEET MODELS TRACKER (Categorized Families & Technical Blueprints) -->
          <div id="flight-pane-aircraft" style="display:${flightSubTab === 'aircraft' ? 'block' : 'none'};">
            ${AIRCRAFT_FAMILIES.map(family => {
              const familyModels = AIRCRAFT_MODELS.filter(m => m.familyId === family.id);
              const completedCount = familyModels.filter(m => userAircraft[m.id]?.flown).length;
              const totalCount = familyModels.length;
              const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
              const isFull = completedCount === totalCount && totalCount > 0;

              return `
                <div class="alliance-set-card" style="border-left: 4px solid ${family.color}; margin-bottom: 24px;">
                  <div class="alliance-set-header">
                    <div class="alliance-title-wrap">
                      <span class="alliance-icon">${family.icon}</span>
                      <div>
                        <div class="alliance-name">${family.name}</div>
                        <div class="alliance-sub">${family.desc}</div>
                      </div>
                    </div>
                    <div class="alliance-progress-wrap">
                      <div class="alliance-count-badge" style="color:${family.color};background:${family.color}18;border-color:${family.color}44;">
                        ${isFull ? '🏆 ' : ''}${completedCount} / ${totalCount} (${percent}%)
                      </div>
                    </div>
                  </div>

                  <!-- Hot Wheels Style Progress Bar -->
                  <div class="alliance-progress-bar-bg">
                    <div class="alliance-progress-bar-fill" style="width:${percent}%;background:${family.color};"></div>
                  </div>

                  <!-- Grid of Aircraft in this Family with Kroki / Blueprint -->
                  <div class="aircraft-grid" style="margin-top: 14px;">
                    ${familyModels.map(model => {
                      const isFlown = !!userAircraft[model.id]?.flown;
                      const blueprintSvg = getAircraftBlueprint(model.id);
                      return `
                        <div class="aircraft-card ${isFlown ? 'active' : ''}" data-id="${model.id}" style="--aircraft-accent:${model.color};">
                          <div class="aircraft-blueprint-wrap">
                            <div class="aircraft-blueprint-art">
                              ${blueprintSvg}
                              <div class="aircraft-badge" style="color:${model.color};border-color:${model.color}44;">${model.badge}</div>
                            </div>
                            <div class="aircraft-telemetry-hud">
                              <div class="hud-blueprint-header">
                                <span class="hud-tech-badge">✈️ TEKNİK VERİLER</span>
                                <span class="hud-country-pill">${model.country || '-'}</span>
                              </div>
                              <div class="hud-grid-compact">
                                <div class="hud-stat-cell" title="${model.id === 'a380' ? 'Alt Kat (Ana Gövde): 3-4-3 | Üst Kat: 2-4-2' : (model.seatLayout || '-')}">
                                  <span class="hud-lbl">💺 Düzen</span>
                                  <span class="hud-val" style="${model.id === 'a380' ? 'font-size:0.62rem;line-height:1.2;color:#f8fafc;' : ''}">${model.id === 'a380' ? 'Alt 3-4-3<br>Üst 2-4-2' : (model.seatLayout || '-')}</span>
                                </div>
                                <div class="hud-stat-cell">
                                  <span class="hud-lbl">👥 Koltuk</span>
                                  <span class="hud-val">${model.seats}</span>
                                </div>
                                <div class="hud-stat-cell">
                                  <span class="hud-lbl">📅 İlk Uçuş</span>
                                  <span class="hud-val">${model.firstFlight || '-'}</span>
                                </div>
                                <div class="hud-stat-cell">
                                  <span class="hud-lbl">🛫 Menzil</span>
                                  <span class="hud-val">${model.range}</span>
                                </div>
                                <div class="hud-stat-cell">
                                  <span class="hud-lbl">⚡ Hız</span>
                                  <span class="hud-val">${model.speed ? model.speed.split(' ')[0] : '-'}</span>
                                </div>
                                <div class="hud-stat-cell">
                                  <span class="hud-lbl">📐 Kanat</span>
                                  <span class="hud-val">${model.wingspan || '-'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="aircraft-card-content">
                            <div class="aircraft-header">
                              <span class="aircraft-icon">${model.icon}</span>
                              <div class="aircraft-model-name">${escapeHtml(model.name)}</div>
                            </div>
                            <div class="aircraft-builder">${model.builder} • ${model.type}</div>
                            <div class="aircraft-desc">${model.desc}</div>
                            <button type="button" class="aircraft-toggle-btn ${isFlown ? 'flown' : ''}">
                              ${isFlown ? `✓ ${currentLang === 'tr' ? 'Binildi' : 'Flown'}` : `+ ${currentLang === 'tr' ? 'Bindim' : 'Add to Log'}`}
                            </button>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
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
  async function openPosterModal() {
    const { POSTER_WORLD_MAP_SVG } = await import('../data/posterWorldMapSvg.js');
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
                <span class="poster-stat-sub">${currentLang === 'tr' ? '%' + stats.worldPercentage : stats.worldPercentage + '%'} ${currentLang === 'tr' ? 'Dünya' : 'World'}</span>
              </div>
              <div class="poster-stat-box">
                <span class="poster-stat-num">${stats.turkeyCount}</span>
                <span class="poster-stat-lbl">${currentLang === 'tr' ? 'İl' : 'Provinces'}</span>
                <span class="poster-stat-sub">${currentLang === 'tr' ? '%' + stats.turkeyPercentage : stats.turkeyPercentage + '%'} ${currentLang === 'tr' ? 'Türkiye' : 'Turkey'}</span>
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

            <!-- Demographics Highlight Row -->
            <div class="poster-demographics-row">
              <span>🌐 ${currentLang === 'tr' ? 'Karasal Alan' : 'Land Area'}: <strong>%${stats.landAreaPercent || 0}</strong></span>
              <span>👥 ${currentLang === 'tr' ? 'Dünya Nüfusu' : 'World Population'}: <strong>%${stats.populationPercent || 0}</strong></span>
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
    const svgEl = modal.querySelector('.poster-world-svg') || modal.querySelector('.poster-svg-wrapper svg') || modal.querySelector('svg');
    if (svgEl) {
      visitedCodes.forEach(cCode => {
        const paths = svgEl.querySelectorAll(`path[data-code="${cCode}"], [id="${cCode}"]`);
        paths.forEach(p => {
          p.classList.add('visited');
          p.style.fill = visitedColor;
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

  async function openPassportModal() {
    const currentLang = getLanguage();
    const storageData = getStorageData();
    const stats = calculateStats();
    const passportType = getPassportType();
    
    let profile = { username: 'Gezgin', avatar: '🧭', bio: '' };
    try {
      const profileStr = localStorage.getItem('gv_profile');
      if (profileStr) {
        const parsed = JSON.parse(profileStr);
        if (parsed && typeof parsed === 'object') profile = parsed;
      }
    } catch (e) {
      console.error('Profile parse error', e);
    }

    const isYesil = passportType === 'yesil';
    const passportTitle = isYesil 
      ? (currentLang === 'tr' ? 'HUSUSİ PASAPORT' : 'SPECIAL PASSPORT')
      : (currentLang === 'tr' ? 'UMUMA MAHSUS PASAPORT' : 'PASSPORT');
    const passportSubtitle = currentLang === 'tr' ? 'TÜRKİYE CUMHURİYETİ' : 'REPUBLIC OF TURKEY';
    const passportBadgeText = isYesil 
      ? (currentLang === 'tr' ? 'YEŞİL (HUSUSİ)' : 'SPECIAL (GREEN)')
      : (currentLang === 'tr' ? 'BORDO (STANDART)' : 'REGULAR (BURGUNDY)');

    const userHash = Math.abs(
      (profile.username || 'GEZGIN').split('').reduce((acc, c) => ((acc << 5) - acc) + c.charCodeAt(0), 5381)
    );
    const passportNo = 'U' + String(userHash).padStart(8, '0').slice(0, 8);

    const visitedCodes = Object.keys(storageData.worldVisits || {}).filter(k => !k.includes('::') && storageData.worldVisits[k]?.status === 'visited');
    if (stats.turkeyCount > 0 && !visitedCodes.includes('TR')) visitedCodes.push('TR');

    const transportIcons = {
      flight: '✈️',
      train: '🚆',
      car: '🚗',
      bus: '🚌',
      ship: '🚢'
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const months = currentLang === 'tr' 
            ? ['OCA', 'ŞUB', 'MAR', 'NİS', 'MAY', 'HAZ', 'TEM', 'AĞU', 'EYL', 'EKİ', 'KAS', 'ARA']
            : ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
          const mIdx = parseInt(parts[1], 10) - 1;
          return `${parts[2]} ${months[mIdx] || parts[1]} ${parts[0]}`;
        }
      } catch {}
      return dateStr;
    };

    const safeUserUpper = (profile.username || 'GEZGIN').toUpperCase().replace(/[^A-Z0-9]/g, '').padEnd(20, '<').slice(0, 20);
    const mrzLine1 = `P<TUR${safeUserUpper}<<<<<<<<<<<<<<<<<<<<<<`;
    const mrzLine2 = `${passportNo}4TUR9501018M3001015<<<<<<<<<<<<<<04`;

    const modal = document.createElement('div');
    modal.className = 'passport-modal-overlay';
    modal.innerHTML = `
      <div class="passport-modal-dialog">
        <div class="passport-modal-top">
          <h3>🛂 ${currentLang === 'tr' ? 'Sanal Gezgin Pasaportu' : 'Virtual Traveler Passport'}</h3>
          <button class="passport-modal-close" id="passport-close-btn">&times;</button>
        </div>

        <div class="passport-modal-body">
          <!-- Passport Document Canvas -->
          <div id="traveler-passport-canvas" class="passport-book-card">
            
            <!-- Passport Cover -->
            <div class="passport-book-cover ${isYesil ? 'yesil' : 'bordo'}">
              <div class="passport-cover-country">${passportSubtitle}</div>
              <div class="passport-cover-sub">${passportTitle}</div>
              <div class="passport-cover-emblem">🇹🇷</div>
              <div class="passport-cover-badge">${passportBadgeText}</div>
            </div>

            <!-- Identity Page -->
            <div class="passport-id-page">
              <div class="passport-id-header">
                <span class="id-title">${currentLang === 'tr' ? 'BİYOMETRİK KİMLİK SAYFASI' : 'BIOMETRIC IDENTITY PAGE'}</span>
                <span class="id-type">TUR / P</span>
              </div>

              <div class="passport-id-content">
                <div class="passport-photo-frame">
                  <div class="passport-photo-avatar">${escapeHtml(profile.avatar || '🧭')}</div>
                  <div class="passport-photo-watermark">GEZGİN</div>
                </div>

                <div class="passport-fields-grid">
                  <div class="passport-field-item">
                    <span class="f-label">${currentLang === 'tr' ? 'BELGE NO / DOC NO' : 'DOC NO'}</span>
                    <span class="f-val">${passportNo}</span>
                  </div>
                  <div class="passport-field-item">
                    <span class="f-label">${currentLang === 'tr' ? 'UYRUK / NATIONALITY' : 'NATIONALITY'}</span>
                    <span class="f-val">TUR</span>
                  </div>
                  <div class="passport-field-item full">
                    <span class="f-label">${currentLang === 'tr' ? 'AD SOYAD / FULL NAME' : 'FULL NAME'}</span>
                    <span class="f-val">${escapeHtml((profile.username || 'GEZGİN').toUpperCase())}</span>
                  </div>
                  <div class="passport-field-item">
                    <span class="f-label">${currentLang === 'tr' ? 'DÜZENLEYEN / AUTHORITY' : 'AUTHORITY'}</span>
                    <span class="f-val">GEZGİN APP</span>
                  </div>
                  <div class="passport-field-item">
                    <span class="f-label">${currentLang === 'tr' ? 'GEÇERLİLİK / VALID UNTIL' : 'VALID UNTIL'}</span>
                    <span class="f-val">${currentLang === 'tr' ? 'ÖMÜR BOYU' : 'LIFETIME'}</span>
                  </div>
                  <div class="passport-field-item full">
                    <span class="f-label">${currentLang === 'tr' ? 'SEYAHAT İSTATİSTİĞİ' : 'TRAVEL SUMMARY'}</span>
                    <span class="f-val" style="font-size:0.75rem;color:#475569;">
                      ${stats.worldCountryCount} ${currentLang === 'tr' ? 'Ülke' : 'Countries'} • ${stats.worldCityCount} ${currentLang === 'tr' ? 'Şehir' : 'Cities'} • %${stats.worldPercentage} ${currentLang === 'tr' ? 'Dünya' : 'World'} • %${stats.landAreaPercent || 0} ${currentLang === 'tr' ? 'Karasal Alan' : 'Land'} • %${stats.populationPercent || 0} ${currentLang === 'tr' ? 'Nüfus' : 'Pop'}
                    </span>
                  </div>
                </div>
              </div>

              <div class="passport-mrz-box">${mrzLine1}\n${mrzLine2}</div>
            </div>

            <!-- Stamped Visas Page -->
            <div class="passport-stamps-page">
              <div class="passport-stamps-header">
                <span class="p-title">✈️ ${currentLang === 'tr' ? 'MÜHÜRLER & DAMGALAR (VISAS)' : 'STAMPS & VISAS'}</span>
                <span class="p-count">${visitedCodes.length} ${currentLang === 'tr' ? 'Damga' : 'Stamps'}</span>
              </div>

              ${visitedCodes.length > 0 ? `
                <div class="passport-stamps-grid">
                  ${visitedCodes.map((cCode, idx) => {
                    const country = WORLD_COUNTRIES.find(c => c.code === cCode) || { code: cCode, name: cCode, flag: '🌍' };
                    const cName = getCountryDisplayName(country);
                    const visit = storageData.worldVisits?.[cCode] || {};
                    const entryDate = formatDate(visit.entryDate || visit.date || '2024-05-15');
                    const entryTrans = transportIcons[visit.entryTransport] || '✈️';
                    const exitDate = visit.exitDate ? formatDate(visit.exitDate) : null;
                    const exitTrans = transportIcons[visit.exitTransport] || entryTrans;

                    const rotEntry = ((idx * 7) % 7 - 3) * 1.5;
                    const rotExit = (((idx * 11) % 7) - 3) * 1.8;

                    return `
                      <div class="passport-stamp-cell">
                        <div class="stamp-seal-item entry" style="transform: rotate(${rotEntry}deg);">
                          <div class="stamp-seal-top">GİRİŞ • ENTRY</div>
                          <div class="stamp-seal-country">${escapeHtml(cCode)} - ${escapeHtml(cName.slice(0, 10))}</div>
                          <div class="stamp-seal-mid">
                            <span>${entryTrans}</span>
                            <span style="font-size:0.6rem;letter-spacing:1px;">PASSED</span>
                          </div>
                          <div class="stamp-seal-date">${entryDate}</div>
                        </div>
                      </div>
                      ${exitDate ? `
                        <div class="passport-stamp-cell">
                          <div class="stamp-seal-item exit" style="transform: rotate(${rotExit}deg);">
                            <div class="stamp-seal-top">ÇIKIŞ • EXIT</div>
                            <div class="stamp-seal-country">${escapeHtml(cCode)} - ${escapeHtml(cName.slice(0, 10))}</div>
                            <div class="stamp-seal-mid">
                              <span>${exitTrans}</span>
                              <span style="font-size:0.6rem;letter-spacing:1px;">DEPARTED</span>
                            </div>
                            <div class="stamp-seal-date">${exitDate}</div>
                          </div>
                        </div>
                      ` : ''}
                    `;
                  }).join('')}
                </div>
              ` : `
                <div class="passport-empty-stamps">
                  <div class="empty-icon">🛂</div>
                  <p>${currentLang === 'tr' ? 'Henüz damga basılmadı. Haritadan bir ülkeye tıklayıp "Gidildi" olarak işaretle ve ulaşım aracı seç!' : 'No stamps yet. Mark countries as visited on the map and choose a transport method!'}</p>
                </div>
              `}
            </div>

          </div>
        </div>

        <div class="passport-actions-row">
          <button type="button" id="btn-download-passport" class="passport-action-btn primary">
            <span>📥</span> <span>${currentLang === 'tr' ? 'Pasaportumu İndir (PNG)' : 'Download Passport (PNG)'}</span>
          </button>
          ${navigator.share ? `
            <button type="button" id="btn-share-passport" class="passport-action-btn secondary">
              <span>📲</span> <span>${t('sharePoster')}</span>
            </button>
          ` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => {
      document.removeEventListener('keydown', handleEsc);
      modal.remove();
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleEsc);

    modal.querySelector('#passport-close-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Download PNG using html-to-image
    modal.querySelector('#btn-download-passport')?.addEventListener('click', async () => {
      const node = document.getElementById('traveler-passport-canvas');
      if (!node) return;
      try {
        const dataUrl = await toPng(node, { quality: 0.95, pixelRatio: 2 });
        const link = document.createElement('a');
        const cleanName = (profile.username || 'Gezgin').replace(/[^a-zA-Z0-9_\-\u00C0-\u017F]/g, '_');
        link.download = `Gezgin-Pasaportum-${cleanName}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Passport generation error', err);
        alert(currentLang === 'tr' ? 'Pasaport görseli oluşturulurken bir hata oluştu.' : 'Error generating passport image.');
      }
    });

    // Share API
    modal.querySelector('#btn-share-passport')?.addEventListener('click', async () => {
      const node = document.getElementById('traveler-passport-canvas');
      if (!node || !navigator.share) return;
      try {
        const dataUrl = await toPng(node, { quality: 0.95, pixelRatio: 2 });
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'gezgin-pasaportum.png', { type: 'image/png' });
        if (navigator.canShare && !navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${profile.username} - Sanal Gezgin Pasaportu`,
            text: `Damgalarımı ve gezdiğim ülkeleri incele! 🛂✈️`,
            url: window.location.href
          });
        } else {
          await navigator.share({
            title: `${profile.username} - Sanal Gezgin Pasaportu`,
            text: `Damgalarımı ve gezdiğim ülkeleri incele! 🛂✈️`,
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

  // ─── 🎁 Gezgin Wrapped (Yıl Sonu Seyahat Karnesi) ──────────────────────────
  async function openWrappedModal() {
    const currentLang = getLanguage();
    const storageData = getStorageData();
    const stats = calculateStats();
    let profile = { username: 'Gezgin', avatar: '🧭', bio: '' };
    try {
      const profileStr = localStorage.getItem('gv_profile');
      if (profileStr) {
        const parsed = JSON.parse(profileStr);
        if (parsed && typeof parsed === 'object') profile = parsed;
      }
    } catch (e) {
      console.error('Profile parse error', e);
    }

    const visitedCountryCodes = Object.keys(storageData.worldVisits || {}).filter(k => !k.includes('::') && storageData.worldVisits[k]?.status === 'visited');
    if (stats.turkeyCount > 0 && !visitedCountryCodes.includes('TR')) visitedCountryCodes.push('TR');

    // Transport breakdown across all visits
    const transportCounts = { flight: 0, train: 0, car: 0, bus: 0, ship: 0 };
    const allVisits = [
      ...Object.values(storageData.worldVisits || {}),
      ...Object.values(storageData.turkeyVisits || {})
    ];
    allVisits.forEach(v => {
      if (v?.entryTransport && transportCounts[v.entryTransport] !== undefined) transportCounts[v.entryTransport]++;
      if (v?.exitTransport && transportCounts[v.exitTransport] !== undefined) transportCounts[v.exitTransport]++;
    });

    let topTransport = 'flight';
    let maxTransCount = -1;
    Object.entries(transportCounts).forEach(([k, cnt]) => {
      if (cnt > maxTransCount) {
        maxTransCount = cnt;
        topTransport = k;
      }
    });

    const transportNames = {
      flight: { tr: '✈️ Gökyüzü Fatihi (Uçak)', en: '✈️ Sky Conqueror (Flight)' },
      train: { tr: '🚆 Demiryolu Romantiği (Tren)', en: '🚆 Railway Romantic (Train)' },
      car: { tr: '🚗 Karayolu Kaşifi (Araba)', en: '🚗 Roadtrip Explorer (Car)' },
      bus: { tr: '🚌 Seyyah Yolcu (Otobüs)', en: '🚌 Cross-country Voyager (Bus)' },
      ship: { tr: '🚢 Deniz Kurdu (Gemi)', en: '🚢 Sea Voyager (Cruise/Ship)' }
    };
    const favoriteTransLabel = maxTransCount > 0 
      ? (currentLang === 'tr' ? transportNames[topTransport]?.tr : transportNames[topTransport]?.en)
      : (currentLang === 'tr' ? '🧭 Serbest Gezgin' : '🧭 Free Explorer');

    // Archetype Title
    let archetype = currentLang === 'tr' ? 'Meraklı Kaşif' : 'Curious Explorer';
    if (stats.worldCountryCount >= 20) archetype = currentLang === 'tr' ? 'Dünya Vatandaşı' : 'Global Citizen';
    else if (stats.worldCountryCount >= 10) archetype = currentLang === 'tr' ? 'Kıta Gezgini' : 'Continental Explorer';
    else if (stats.turkeyCount >= 30) archetype = currentLang === 'tr' ? 'Anadolu Fatihi' : 'Anatolia Master';
    else if (stats.worldCountryCount >= 5) archetype = currentLang === 'tr' ? 'Sınır Aşan Seyyah' : 'Border Crosser';

    // Top rated places
    const ratedPlaces = [];
    Object.entries(storageData.worldVisits || {}).forEach(([k, v]) => {
      if (!k.includes('::') && v?.status === 'visited' && v?.rating) {
        const c = WORLD_COUNTRIES.find(x => x.code === k);
        ratedPlaces.push({
          name: c ? getCountryDisplayName(c) : k,
          flag: c?.flag || '🌍',
          rating: Number(v.rating) || 0,
          notes: v.notes || ''
        });
      }
    });
    Object.entries(storageData.turkeyVisits || {}).forEach(([pid, v]) => {
      if (v?.status === 'visited' && v?.rating) {
        const p = TURKEY_PROVINCES.find(x => String(x.id) === String(pid));
        ratedPlaces.push({
          name: p?.name || `İl ${pid}`,
          flag: '🇹🇷',
          rating: Number(v.rating) || 0,
          notes: v.notes || ''
        });
      }
    });
    ratedPlaces.sort((a, b) => b.rating - a.rating);
    const topRated = ratedPlaces[0] || null;

    // Collect all buddies
    const allBuddiesSet = new Set();
    allVisits.forEach(v => {
      if (Array.isArray(v?.buddies)) {
        v.buddies.forEach(b => { if (b) allBuddiesSet.add(b); });
      }
    });
    const uniqueBuddies = Array.from(allBuddiesSet);

    // Challenges progress
    const chProgress = calculateChallengesProgress(visitedCountryCodes);
    const completedCh = chProgress.filter(c => c.isCompleted);

    const totalPlaces = getTotalPlacesCount();
    let totalPhotos = 0;
    try {
      totalPhotos = await getTotalPhotoCount();
    } catch { totalPhotos = 0; }

    const modal = document.createElement('div');
    modal.className = 'wrapped-modal-overlay';
    modal.innerHTML = `
      <div class="wrapped-modal-dialog">
        <div class="wrapped-modal-top">
          <h3>🎁 ${currentLang === 'tr' ? 'Gezgin Wrapped 2026' : 'Traveler Wrapped 2026'}</h3>
          <button class="wrapped-modal-close" id="wrapped-close-btn">&times;</button>
        </div>

        <div class="wrapped-preview-container">
          <!-- 9:16 Instagram Story Canvas -->
          <div id="travel-wrapped-canvas" class="travel-wrapped-card">
            <div class="wrapped-glow-orb orb-1"></div>
            <div class="wrapped-glow-orb orb-2"></div>
            <div class="wrapped-glow-orb orb-3"></div>

            <div class="wrapped-card-inner">
              <!-- Top Branding -->
              <div class="wrapped-brand-header">
                <div class="wrapped-brand-logo">🧭 GEZGİN 2.0</div>
                <div class="wrapped-year-pill">WRAPPED 2026</div>
              </div>

              <!-- Traveler Profile Box -->
              <div class="wrapped-traveler-box">
                <div class="wrapped-avatar-circle">${escapeHtml(profile.avatar || '🧭')}</div>
                <div class="wrapped-traveler-names">
                  <div class="wrapped-user-name">${escapeHtml(profile.username || 'Gezgin')}</div>
                  <div class="wrapped-archetype-tag">✨ ${archetype}</div>
                </div>
              </div>

              <!-- Story Headline -->
              <div class="wrapped-hero-message">
                ${currentLang === 'tr' 
                  ? `Bu yıl dünyanın <strong>%${stats.landAreaPercent || 0}</strong>'sini ve <strong>${stats.worldCountryCount}</strong> ülkesini keşfettin!` 
                  : `This year you explored <strong>${stats.landAreaPercent || 0}%</strong> of the world land across <strong>${stats.worldCountryCount}</strong> countries!`}
              </div>

              <!-- 4 Big Metric Tiles -->
              <div class="wrapped-metrics-grid">
                <div class="wrapped-metric-tile">
                  <span class="wm-val">${stats.worldCountryCount}</span>
                  <span class="wm-lbl">${currentLang === 'tr' ? 'Ülke Gezildi' : 'Countries'}</span>
                </div>
                <div class="wrapped-metric-tile">
                  <span class="wm-val">${stats.turkeyCount + stats.worldCityCount}</span>
                  <span class="wm-lbl">${currentLang === 'tr' ? 'İl & Şehir' : 'Cities & Provs'}</span>
                </div>
                <div class="wrapped-metric-tile">
                  <span class="wm-val">%${stats.populationPercent || 0}</span>
                  <span class="wm-lbl">${currentLang === 'tr' ? 'Dünya Nüfusu' : 'World Pop'}</span>
                </div>
                <div class="wrapped-metric-tile">
                  <span class="wm-val">%${stats.landAreaPercent || 0}</span>
                  <span class="wm-lbl">${currentLang === 'tr' ? 'Karasal Alan' : 'Land Area'}</span>
                </div>
              </div>

              <!-- Favorite Transport Mode -->
              <div class="wrapped-highlight-row">
                <div class="wh-icon">🚀</div>
                <div class="wh-info">
                  <div class="wh-label">${currentLang === 'tr' ? 'Favori Seyahat Tarzı' : 'Favorite Travel Mode'}</div>
                  <div class="wh-val">${favoriteTransLabel}</div>
                </div>
              </div>

              <!-- Memories & Gourmet Spots -->
              ${totalPlaces > 0 || totalPhotos > 0 ? `
                <div class="wrapped-highlight-row">
                  <div class="wh-icon">📸</div>
                  <div class="wh-info">
                    <div class="wh-label">${currentLang === 'tr' ? 'Anı Defteri & Lezzet Durakları' : 'Memories & Gourmet Spots'}</div>
                    <div class="wh-val">📸 ${totalPhotos} Fotoğraf • 🍽️ ${totalPlaces} Mekan</div>
                  </div>
                </div>
              ` : ''}

              <!-- Top Rated Place -->
              ${topRated ? `
                <div class="wrapped-highlight-row">
                  <div class="wh-icon">⭐</div>
                  <div class="wh-info">
                    <div class="wh-label">${currentLang === 'tr' ? 'Zirve Destinasyon' : 'Top Destination'}</div>
                    <div class="wh-val">${escapeHtml(topRated.flag)} ${escapeHtml(topRated.name)} <span class="wh-score">(${topRated.rating}/10)</span></div>
                    ${topRated.notes ? `<div class="wh-sub">"${escapeHtml(topRated.notes.slice(0, 45))}"</div>` : ''}
                  </div>
                </div>
              ` : ''}

              <!-- Travel Buddies or Route Collections -->
              ${uniqueBuddies.length > 0 ? `
                <div class="wrapped-highlight-row">
                  <div class="wh-icon">👥</div>
                  <div class="wh-info">
                    <div class="wh-label">${currentLang === 'tr' ? 'Yol Arkadaşların' : 'Travel Buddies'}</div>
                    <div class="wh-buddies-pills">
                      ${uniqueBuddies.slice(0, 5).map(b => `<span class="wb-pill">${escapeHtml(b)}</span>`).join('')}
                      ${uniqueBuddies.length > 5 ? `<span class="wb-pill more">+${uniqueBuddies.length - 5}</span>` : ''}
                    </div>
                  </div>
                </div>
              ` : (completedCh.length > 0 ? `
                <div class="wrapped-highlight-row">
                  <div class="wh-icon">🎖️</div>
                  <div class="wh-info">
                    <div class="wh-label">${currentLang === 'tr' ? 'Kazanılan Challenge' : 'Challenges Completed'}</div>
                    <div class="wh-val">${completedCh.map(c => c.badge).join(', ')}</div>
                  </div>
                </div>
              ` : '')}

              <!-- Bottom Watermark & QR/Domain -->
              <div class="wrapped-footer">
                <div class="wf-quote">${currentLang === 'tr' ? 'Dünyayı keşfetmek senin süper gücün 🌍' : 'Exploring the world is your superpower 🌍'}</div>
                <div class="wf-domain">gittigimyerler.app</div>
              </div>
            </div>
          </div>
        </div>

        <div class="wrapped-actions-row">
          <button type="button" id="btn-download-wrapped" class="wrapped-action-btn primary">
            <span>📥</span> <span>${currentLang === 'tr' ? 'Hikaye Olarak İndir (PNG)' : 'Download Story (PNG)'}</span>
          </button>
          ${navigator.share ? `
            <button type="button" id="btn-share-wrapped" class="wrapped-action-btn secondary">
              <span>📲</span> <span>${t('sharePoster')}</span>
            </button>
          ` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => {
      document.removeEventListener('keydown', handleEsc);
      modal.remove();
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleEsc);

    modal.querySelector('#wrapped-close-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Download PNG
    modal.querySelector('#btn-download-wrapped')?.addEventListener('click', async () => {
      const node = document.getElementById('travel-wrapped-canvas');
      if (!node) return;
      try {
        const dataUrl = await toPng(node, { quality: 0.95, pixelRatio: 2 });
        const link = document.createElement('a');
        const cleanName = (profile.username || 'Gezgin').replace(/[^a-zA-Z0-9_\-\u00C0-\u017F]/g, '_');
        link.download = `Gezgin-Wrapped-2026-${cleanName}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Wrapped download error', err);
        alert(currentLang === 'tr' ? 'Karneniz oluşturulurken hata oluştu.' : 'Error generating wrapped image.');
      }
    });

    // Native Share
    modal.querySelector('#btn-share-wrapped')?.addEventListener('click', async () => {
      const node = document.getElementById('travel-wrapped-canvas');
      if (!node || !navigator.share) return;
      try {
        const dataUrl = await toPng(node, { quality: 0.95, pixelRatio: 2 });
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'gezgin-wrapped-2026.png', { type: 'image/png' });
        if (navigator.canShare && !navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${profile.username} - Gezgin Wrapped 2026`,
            text: `2026 Seyahat Karnem! Dünyanın %${stats.landAreaPercent}%'sini gezdim 🌍✨`,
            url: window.location.href
          });
        } else {
          await navigator.share({
            title: `${profile.username} - Gezgin Wrapped 2026`,
            text: `2026 Seyahat Karnem! Dünyanın %${stats.landAreaPercent}%'sini gezdim 🌍✨`,
            files: [file]
          });
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Share error', err);
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
        <div class="profile-header">
          <div class="profile-avatar">${escapeHtml(myProfile.avatar || '🧭')}</div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:4px;">
              <span class="profile-username">${escapeHtml(myProfile.username || 'Sen')}</span>
              <span class="profile-card-label" style="background:rgba(59,130,246,0.2);border-color:rgba(59,130,246,0.3);color:#3b82f6;">${currentLang === 'tr' ? 'SENİN PROFİLİN' : 'YOUR PROFILE'}</span>
            </div>
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
          <div class="profile-header">
            <div class="profile-avatar">${escapeHtml(safeProfile.avatar || '✈️')}</div>
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:4px;">
                <span class="profile-username">${escapeHtml(safeProfile.username || 'Arkadaş')}</span>
                <span class="profile-card-label" style="background:rgba(16,185,129,0.2);border-color:rgba(16,185,129,0.3);color:#10b981;">${currentLang === 'tr' ? 'ARKADAŞININ PROFİLİ' : 'FRIEND\'S PROFILE'}</span>
              </div>
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

      // ── Calculate World Cities Comparison ──
      const extractCities = (worldVisitsObj, worldCitiesArr) => {
        const map = new Map();
        if (Array.isArray(worldCitiesArr)) {
          worldCitiesArr.forEach(item => {
            let cName = '';
            let cCountry = '';
            if (typeof item === 'string' && item.trim()) {
              cName = item.trim();
            } else if (item && typeof item === 'object') {
              cName = (item.cityName || item.name || '').trim();
              cCountry = (item.countryCode || '').trim();
            }
            if (cName) {
              const normKey = (cCountry ? `${cCountry}::` : '') + cName.toLowerCase();
              const displayName = cCountry ? `${cName} (${cCountry})` : cName;
              if (!map.has(normKey)) {
                map.set(normKey, { displayName, normKey, cName: cName.toLowerCase() });
              }
            }
          });
        }
        Object.keys(worldVisitsObj || {}).forEach(k => {
          if (k.includes('::') && worldVisitsObj[k]?.status === 'visited') {
            const parts = k.split('::');
            const cCountry = parts[0]?.trim() || '';
            const cityName = parts[1]?.trim();
            if (cityName) {
              const normKey = (cCountry ? `${cCountry}::` : '') + cityName.toLowerCase();
              const displayName = `${cityName} (${cCountry})`;
              map.set(normKey, { displayName, normKey, cName: cityName.toLowerCase() });
            }
          }
        });
        return Array.from(map.values());
      };

      const myCitiesList = extractCities(myStorage.worldVisits, myStorage.worldCities);
      const otherCitiesList = extractCities(safeWorldVisits, safeCities);

      const isCityMatch = (c1, c2) => (c1.normKey === c2.normKey) || (c1.cName === c2.cName);
      const commonCities = myCitiesList.filter(c => otherCitiesList.some(oc => isCityMatch(c, oc))).map(c => c.displayName);
      const onlyMyCities = myCitiesList.filter(c => !otherCitiesList.some(oc => isCityMatch(c, oc))).map(c => c.displayName);
      const onlyOtherCities = otherCitiesList.filter(oc => !myCitiesList.some(mc => isCityMatch(mc, oc))).map(oc => oc.displayName);

      const resultsArea = document.getElementById('compare-results-area');
      resultsArea.style.display = 'block';
      resultsArea.innerHTML = `
        <div class="share-section" style="margin-top:0;">
          <!-- Category Tabs: Countries / World Cities / Turkey 81 Provinces / Reviews / Duo Map -->
          <div class="compare-subtabs-row">
            <button type="button" class="compare-subtab active" data-sub="countries">🌍 ${currentLang === 'tr' ? 'Ülkeler' : 'Countries'}</button>
            <button type="button" class="compare-subtab" data-sub="cities">🏙️ ${currentLang === 'tr' ? 'Dünya Şehirleri' : 'World Cities'}</button>
            <button type="button" class="compare-subtab" data-sub="provinces">🇹🇷 ${currentLang === 'tr' ? 'Türkiye (81 İl)' : 'Turkey (81 Provinces)'}</button>
            <button type="button" class="compare-subtab" data-sub="reviews">📝 ${currentLang === 'tr' ? 'Yorumlar & Puanlar' : 'Reviews & Scores'}</button>
            <button type="button" class="compare-subtab" data-sub="duomap">🗺️ ${currentLang === 'tr' ? 'Karşılaştırma Haritası' : 'Duo Map'}</button>
          </div>

          <!-- Section 1: Countries -->
          <div id="compare-pane-countries" class="compare-pane active">
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;">
              <div class="comp-card-box">
                <div style="font-weight:700;color:#10b981;margin-bottom:8px;">🤝 ${currentLang === 'tr' ? 'İkinizin de Gittiği Ortak Ülkeler' : 'Common Countries'} (${commonCountries.length})</div>
                <div style="font-size:0.85rem;color:var(--theme-text-main, #cbd5e1);line-height:1.6;max-height:220px;overflow-y:auto;">
                  ${commonCountries.length > 0 ? commonCountries.map(c => `• ${escapeHtml(getCName(c))}`).join('<br>') : (currentLang === 'tr' ? 'Ortak ülke bulunamadı.' : 'No common countries.')}
                </div>
              </div>

              <div class="comp-card-box">
                <div style="font-weight:700;color:#3b82f6;margin-bottom:8px;">⭐ ${currentLang === 'tr' ? 'Sadece Senin Gittiğin Ülkeler' : 'Only You Visited'} (${onlyMyCountries.length})</div>
                <div style="font-size:0.85rem;color:var(--theme-text-main, #cbd5e1);line-height:1.6;max-height:220px;overflow-y:auto;">
                  ${onlyMyCountries.length > 0 ? onlyMyCountries.map(c => `• ${escapeHtml(getCName(c))}`).join('<br>') : (currentLang === 'tr' ? 'Farklı ülke yok.' : 'No unique countries.')}
                </div>
              </div>

              <div class="comp-card-box">
                <div style="font-weight:700;color:#f59e0b;margin-bottom:8px;">🚀 ${currentLang === 'tr' ? `Sadece ${escapeHtml(safeProfile.username)}'in Gittiği Ülkeler` : `Only ${escapeHtml(safeProfile.username)}`} (${onlyOtherCountries.length})</div>
                <div style="font-size:0.85rem;color:var(--theme-text-main, #cbd5e1);line-height:1.6;max-height:220px;overflow-y:auto;">
                  ${onlyOtherCountries.length > 0 ? onlyOtherCountries.map(c => `• ${escapeHtml(getCName(c))}`).join('<br>') : (currentLang === 'tr' ? 'Farklı ülke yok.' : 'No unique countries.')}
                </div>
              </div>
            </div>
          </div>

          <!-- Section 1B: World Cities -->
          <div id="compare-pane-cities" class="compare-pane" style="display:none;">
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;">
              <div class="comp-card-box">
                <div style="font-weight:700;color:#10b981;margin-bottom:8px;">🤝 ${currentLang === 'tr' ? 'Ortak Gezilen Dünya Şehirleri' : 'Common World Cities'} (${commonCities.length})</div>
                <div style="font-size:0.85rem;color:var(--theme-text-main, #cbd5e1);line-height:1.6;max-height:220px;overflow-y:auto;">
                  ${commonCities.length > 0 ? commonCities.map(c => `• ${escapeHtml(c)}`).join('<br>') : (currentLang === 'tr' ? 'Ortak şehir bulunamadı.' : 'No common cities.')}
                </div>
              </div>

              <div class="comp-card-box">
                <div style="font-weight:700;color:#3b82f6;margin-bottom:8px;">⭐ ${currentLang === 'tr' ? 'Sadece Senin Gezdiğin Şehirler' : 'Only You Visited'} (${onlyMyCities.length})</div>
                <div style="font-size:0.85rem;color:var(--theme-text-main, #cbd5e1);line-height:1.6;max-height:220px;overflow-y:auto;">
                  ${onlyMyCities.length > 0 ? onlyMyCities.map(c => `• ${escapeHtml(c)}`).join('<br>') : (currentLang === 'tr' ? 'Farklı şehir yok.' : 'No unique cities.')}
                </div>
              </div>

              <div class="comp-card-box">
                <div style="font-weight:700;color:#f59e0b;margin-bottom:8px;">🚀 ${currentLang === 'tr' ? `Sadece ${escapeHtml(safeProfile.username)}'in Gezdiği Şehirler` : `Only ${escapeHtml(safeProfile.username)}`} (${onlyOtherCities.length})</div>
                <div style="font-size:0.85rem;color:var(--theme-text-main, #cbd5e1);line-height:1.6;max-height:220px;overflow-y:auto;">
                  ${onlyOtherCities.length > 0 ? onlyOtherCities.map(c => `• ${escapeHtml(c)}`).join('<br>') : (currentLang === 'tr' ? 'Farklı şehir yok.' : 'No unique cities.')}
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Turkey 81 Provinces -->
          <div id="compare-pane-provinces" class="compare-pane" style="display:none;">
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;">
              <div class="comp-card-box">
                <div style="font-weight:700;color:#10b981;margin-bottom:8px;">🤝 ${currentLang === 'tr' ? 'Ortak Gezilen İller' : 'Common Provinces'} (${commonProvs.length})</div>
                <div style="font-size:0.85rem;color:var(--theme-text-main, #cbd5e1);line-height:1.6;max-height:220px;overflow-y:auto;">
                  ${commonProvs.length > 0 ? commonProvs.map(pid => `• ${escapeHtml(getPName(pid))}`).join('<br>') : (currentLang === 'tr' ? 'Ortak il bulunamadı.' : 'No common provinces.')}
                </div>
              </div>

              <div class="comp-card-box">
                <div style="font-weight:700;color:#3b82f6;margin-bottom:8px;">⭐ ${currentLang === 'tr' ? 'Sadece Senin Gezdiğin İller' : 'Only You Visited'} (${onlyMyProvs.length})</div>
                <div style="font-size:0.85rem;color:var(--theme-text-main, #cbd5e1);line-height:1.6;max-height:220px;overflow-y:auto;">
                  ${onlyMyProvs.length > 0 ? onlyMyProvs.map(pid => `• ${escapeHtml(getPName(pid))}`).join('<br>') : (currentLang === 'tr' ? 'Farklı il yok.' : 'No unique provinces.')}
                </div>
              </div>

              <div class="comp-card-box">
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
              <div class="comp-card-box">
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
                      <div class="comp-review-item" style="border-radius:8px;padding:8px 10px;font-size:0.85rem;">
                        <div class="comp-review-title" style="display:flex;justify-content:space-between;align-items:center;font-weight:600;">
                          <span>${escapeHtml(r.flag)} ${escapeHtml(r.name)}</span>
                          ${r.rating > 0 ? `<span style="color:#f59e0b;font-size:0.8rem;background:rgba(245,158,11,0.15);padding:2px 6px;border-radius:6px;">⭐ ${r.rating}/10</span>` : ''}
                        </div>
                        ${r.notes ? `<div style="color:var(--theme-text-muted, #94a3b8);font-size:0.78rem;margin-top:4px;font-style:italic;">"${escapeHtml(r.notes)}"</div>` : ''}
                      </div>
                    `).join('');
                  })()}
                </div>
              </div>

              <!-- Friend's Reviews -->
              <div class="comp-card-box">
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
                      <div class="comp-review-item" style="border-radius:8px;padding:8px 10px;font-size:0.85rem;">
                        <div class="comp-review-title" style="display:flex;justify-content:space-between;align-items:center;font-weight:600;">
                          <span>${escapeHtml(r.flag)} ${escapeHtml(r.name)}</span>
                          ${r.rating > 0 ? `<span style="color:#f59e0b;font-size:0.8rem;background:rgba(245,158,11,0.15);padding:2px 6px;border-radius:6px;">⭐ ${r.rating}/10</span>` : ''}
                        </div>
                        ${r.notes ? `<div style="color:var(--theme-text-muted, #94a3b8);font-size:0.78rem;margin-top:4px;font-style:italic;">"${escapeHtml(r.notes)}"</div>` : ''}
                      </div>
                    `).join('');
                  })()}
                </div>
              </div>
            </div>

            <!-- Favorite Places & Eats Comparison -->
            <div style="margin-top:20px;">
              <div style="font-weight:700;color:var(--theme-text-main, #f8fafc);margin-bottom:12px;display:flex;align-items:center;gap:6px;">
                <span>🍽️</span> <span>${currentLang === 'tr' ? 'Keşfedilen Mekanlar & Lezzet Durakları' : 'Favorite Places & Gourmet Spots'}</span>
              </div>
              <div class="compare-reviews-grid" style="gap:16px;">
                <!-- My Places -->
                <div class="comp-card-box">
                  <div style="font-weight:700;color:#3b82f6;margin-bottom:12px;">🍽️ ${currentLang === 'tr' ? 'Senin Kaydettiğin Mekanlar' : 'Your Saved Places'}</div>
                  <div style="display:flex;flex-direction:column;gap:8px;max-height:240px;overflow-y:auto;">
                    ${(() => {
                      const places = [];
                      const extract = (vObj) => {
                        Object.entries(vObj || {}).forEach(([k, v]) => {
                          if (Array.isArray(v?.places) && v.places.length > 0) {
                            v.places.forEach(p => places.push({ ...p, location: k }));
                          }
                        });
                      };
                      extract(myStorage.worldVisits);
                      extract(myStorage.turkeyVisits);
                      if (places.length === 0) return `<span style="color:#64748b;font-size:0.85rem;">${currentLang === 'tr' ? 'Henüz kaydedilmiş mekan yok.' : 'No saved places yet.'}</span>`;
                      const catIcons = { restaurant: '🍽️', cafe: '☕', museum: '🏛️', nature: '🏖️', shopping: '🛍️', hotel: '🏨' };
                      return places.map(pl => {
                        const r = pl.rating !== undefined && pl.rating !== null ? Math.max(0, Math.min(5, Math.floor(Number(pl.rating) || 0))) : 5;
                        return `
                        <div class="comp-review-item" style="border-radius:8px;padding:8px 10px;font-size:0.85rem;">
                          <div class="comp-review-title" style="display:flex;justify-content:space-between;align-items:center;font-weight:600;">
                            <span>${catIcons[pl.category] || '📍'} ${escapeHtml(pl.name)}</span>
                            <span style="color:#f59e0b;font-size:0.75rem;">${r > 0 ? '⭐'.repeat(r) : ''}</span>
                          </div>
                          ${pl.note ? `<div style="color:var(--theme-text-muted, #94a3b8);font-size:0.78rem;margin-top:4px;font-style:italic;">"${escapeHtml(pl.note)}"</div>` : ''}
                        </div>
                      `;
                      }).join('');
                    })()}
                  </div>
                </div>

                <!-- Friend's Places -->
                <div class="comp-card-box">
                  <div style="font-weight:700;color:#10b981;margin-bottom:12px;">🍽️ ${currentLang === 'tr' ? `${escapeHtml(safeProfile.username)} Mekanları` : `${escapeHtml(safeProfile.username)} Places`}</div>
                  <div style="display:flex;flex-direction:column;gap:8px;max-height:240px;overflow-y:auto;">
                    ${(() => {
                      const places = [];
                      const extract = (vObj) => {
                        Object.entries(vObj || {}).forEach(([k, v]) => {
                          if (Array.isArray(v?.places) && v.places.length > 0) {
                            v.places.forEach(p => places.push({ ...p, location: k }));
                          }
                        });
                      };
                      extract(safeWorldVisits);
                      extract(safeTurkeyVisits);
                      if (places.length === 0) return `<span style="color:#64748b;font-size:0.85rem;">${currentLang === 'tr' ? 'Arkadaşının kayıtlı mekanı yok.' : 'Friend has no saved places.'}</span>`;
                      const catIcons = { restaurant: '🍽️', cafe: '☕', museum: '🏛️', nature: '🏖️', shopping: '🛍️', hotel: '🏨' };
                      return places.map(pl => {
                        const r = pl.rating !== undefined && pl.rating !== null ? Math.max(0, Math.min(5, Math.floor(Number(pl.rating) || 0))) : 5;
                        return `
                        <div class="comp-review-item" style="border-radius:8px;padding:8px 10px;font-size:0.85rem;">
                          <div class="comp-review-title" style="display:flex;justify-content:space-between;align-items:center;font-weight:600;">
                            <span>${catIcons[pl.category] || '📍'} ${escapeHtml(pl.name)}</span>
                            <span style="color:#f59e0b;font-size:0.75rem;">${r > 0 ? '⭐'.repeat(r) : ''}</span>
                          </div>
                          ${pl.note ? `<div style="color:var(--theme-text-muted, #94a3b8);font-size:0.78rem;margin-top:4px;font-style:italic;">"${escapeHtml(pl.note)}"</div>` : ''}
                        </div>
                      `;
                      }).join('');
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 4: Duo Comparison Map -->
          <div id="compare-pane-duomap" class="compare-pane" style="display:none;">
            <div class="duo-map-legend-row">
              <span class="duo-legend-chip common">🟡 ${currentLang === 'tr' ? 'İkiniz de Gezdiniz' : 'Both Visited'} (${commonCountries.length})</span>
              <span class="duo-legend-chip mine">🟢 ${currentLang === 'tr' ? 'Sadece Sen' : 'Only You'} (${onlyMyCountries.length})</span>
              <span class="duo-legend-chip other">🔵 ${currentLang === 'tr' ? `Sadece ${escapeHtml(safeProfile.username)}` : 'Only Friend'} (${onlyOtherCountries.length})</span>
            </div>
            <div id="duo-map-container" class="duo-map-frame" style="width:100%;height:440px;border-radius:16px;overflow:hidden;background:#090d16;position:relative;border:1px solid rgba(255,255,255,0.1);"></div>
          </div>
        </div>
      `;

      // Subtab switching & Duo Map initialization
      let duoMapInstance = null;

      function initDuoMap() {
        if (duoMapInstance) {
          duoMapInstance.invalidateSize();
          return;
        }

        const mapEl = document.getElementById('duo-map-container');
        if (!mapEl) return;

        duoMapInstance = L.map(mapEl, {
          center: [25, 10],
          zoom: 2,
          minZoom: 1.5,
          maxZoom: 6,
          zoomControl: true,
          attributionControl: false
        });

        const baseUrl = import.meta.env.BASE_URL || '/';
        const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
        
        fetch(`${cleanBase}data/world-countries.json`)
          .then(r => r.json())
          .then(geoData => {
            if (!geoData || !geoData.features) return;

            const duoGeoLayer = L.geoJSON(geoData, {
              style: (feature) => {
                const code = feature.id || feature.properties?.ISO_A2 || feature.properties?.wb_a2 || feature.properties?.postal;
                const isCommon = commonCountries.includes(code);
                const isMine = onlyMyCountries.includes(code);
                const isOther = onlyOtherCountries.includes(code);

                if (isCommon) {
                  return { fillColor: '#f59e0b', fillOpacity: 0.85, color: '#d97706', weight: 1.5 };
                } else if (isMine) {
                  return { fillColor: '#10b981', fillOpacity: 0.85, color: '#059669', weight: 1.5 };
                } else if (isOther) {
                  return { fillColor: '#3b82f6', fillOpacity: 0.85, color: '#2563eb', weight: 1.5 };
                } else {
                  return { fillColor: '#1e293b', fillOpacity: 0.5, color: '#334155', weight: 0.7 };
                }
              },
              onEachFeature: (feature, layer) => {
                const code = feature.id || feature.properties?.ISO_A2 || feature.properties?.wb_a2 || feature.properties?.postal;
                const cObj = WORLD_COUNTRIES.find(x => x.code === code);
                const cName = cObj ? getCountryDisplayName(cObj) : (feature.properties?.name || code);

                const isCommon = commonCountries.includes(code);
                const isMine = onlyMyCountries.includes(code);
                const isOther = onlyOtherCountries.includes(code);

                let statusBadge = `<span style="color:#94a3b8;">${currentLang === 'tr' ? 'Henüz ikiniz de gitmediniz' : 'Neither visited yet'}</span>`;
                if (isCommon) {
                  statusBadge = `<span style="color:#f59e0b;font-weight:700;">🤝 ${currentLang === 'tr' ? 'İkiniz de gezdiniz!' : 'Both of you visited!'}</span>`;
                } else if (isMine) {
                  statusBadge = `<span style="color:#10b981;font-weight:700;">⭐ ${currentLang === 'tr' ? 'Sadece Sen gezdin!' : 'Only you visited!'}</span>`;
                } else if (isOther) {
                  statusBadge = `<span style="color:#3b82f6;font-weight:700;">🚀 ${currentLang === 'tr' ? `Sadece ${escapeHtml(safeProfile.username)} gezdi!` : 'Only friend visited!'}</span>`;
                }

                layer.bindPopup(`
                  <div style="font-family:inherit;padding:6px 8px;text-align:center;min-width:140px;">
                    <div style="font-size:1.3rem;margin-bottom:2px;">${cObj?.flag || '🌍'}</div>
                    <div style="font-weight:800;color:#0f172a;font-size:0.95rem;">${escapeHtml(cName)}</div>
                    <div style="margin-top:6px;font-size:0.8rem;">${statusBadge}</div>
                  </div>
                `);

                layer.on('mouseover', function () {
                  if (isCommon || isMine || isOther) {
                    this.setStyle({ weight: 2.5, fillOpacity: 1 });
                  }
                });
                layer.on('mouseout', function () {
                  duoGeoLayer.resetStyle(this);
                });
              }
            }).addTo(duoMapInstance);

            setTimeout(() => duoMapInstance && duoMapInstance.invalidateSize(), 150);
          })
          .catch(err => console.error('Duo Map load error', err));
      }

      resultsArea.querySelectorAll('.compare-subtab').forEach(btn => {
        btn.addEventListener('click', () => {
          resultsArea.querySelectorAll('.compare-subtab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const sub = btn.dataset.sub;
          const pCountries = document.getElementById('compare-pane-countries');
          const pCities = document.getElementById('compare-pane-cities');
          const pProvinces = document.getElementById('compare-pane-provinces');
          const pReviews = document.getElementById('compare-pane-reviews');
          const pDuoMap = document.getElementById('compare-pane-duomap');

          if (pCountries) pCountries.style.display = sub === 'countries' ? 'block' : 'none';
          if (pCities) pCities.style.display = sub === 'cities' ? 'block' : 'none';
          if (pProvinces) pProvinces.style.display = sub === 'provinces' ? 'block' : 'none';
          if (pReviews) pReviews.style.display = sub === 'reviews' ? 'block' : 'none';
          if (pDuoMap) pDuoMap.style.display = sub === 'duomap' ? 'block' : 'none';

          if (sub === 'duomap') {
            setTimeout(initDuoMap, 50);
          }
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
