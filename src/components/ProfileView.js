import { getStorageData, calculateStats } from '../utils/storage.js';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, getEarnedAchievements } from '../data/achievements.js';
import { WORLD_COUNTRIES } from '../data/worldData.js';
import { t, getLanguage, setLanguage, getCountryDisplayName } from '../utils/i18n.js';
import { THEMES, getTheme, setTheme } from '../utils/theme.js';

export function renderProfileView(container, onBack) {
  let activeTab = 'profile'; // profile, medals, compare, settings

  function render() {
    const currentLang = getLanguage();
    const currentTheme = getTheme();

    container.innerHTML = `
      <div class="profile-overlay">
        <div class="profile-topbar">
          <button class="profile-back-btn" id="profile-back">${t('backToMap')}</button>
          <div class="profile-tabs">
            <button class="ptab ${activeTab === 'profile' ? 'active' : ''}" data-tab="profile">${t('tabProfile')}</button>
            <button class="ptab ${activeTab === 'medals' ? 'active' : ''}" data-tab="medals">${t('tabMedals')}</button>
            <button class="ptab ${activeTab === 'compare' ? 'active' : ''}" data-tab="compare">${t('tabCompare')}</button>
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
        activeTab = e.target.getAttribute('data-tab');
        render();
      });
    });

    const contentArea = document.getElementById('profile-content-area');
    if (activeTab === 'profile') renderProfileTab(contentArea);
    else if (activeTab === 'medals') renderMedalsTab(contentArea);
    else if (activeTab === 'compare') renderCompareTab(contentArea);
  }

  function renderProfileTab(contentArea) {
    const currentLang = getLanguage();
    const currentTheme = getTheme();

    const profileStr = localStorage.getItem('gv_profile');
    const profile = profileStr ? JSON.parse(profileStr) : { username: 'Kullanıcı', avatar: '🧭', bio: '' };
    
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
            <div class="profile-avatar">${profile.avatar}</div>
            <div>
              <div class="profile-username">${profile.username}</div>
              <div class="profile-bio">${profile.bio || (currentLang === 'tr' ? 'Dünyayı geziyor...' : 'Exploring the world...')}</div>
            </div>
          </div>
          <div class="profile-stats">
            <div class="pstat"><span class="pstat-num" style="color:#ff5722">${baseStats.worldCountryCount || 0}</span><span class="pstat-lbl">${t('countriesVisited')}</span></div>
            <div class="pstat"><span class="pstat-num" style="color:#ef4444">${baseStats.turkeyCount || 0}</span><span class="pstat-lbl">${t('provincesVisited')}</span></div>
            <div class="pstat"><span class="pstat-num" style="color:#3b82f6">${baseStats.worldCityCount || 0}</span><span class="pstat-lbl">${t('citiesVisited')}</span></div>
            <div class="pstat"><span class="pstat-num" style="color:#10b981">${earnedMedals.length}/${ACHIEVEMENTS.length}</span><span class="pstat-lbl">${t('tabMedals')}</span></div>
          </div>
          ${earnedMedals.length > 0 ? `
            <div class="profile-badges-header" style="font-size:0.85rem;color:#94a3b8;font-weight:600;margin-bottom:8px;">${currentLang === 'tr' ? 'Kazanılan Rozetler' : 'Earned Badges'} (${earnedMedals.length})</div>
            <div class="profile-badges">
              ${earnedMedals.map(m => `<span class="badge-icon" title="${m.title} - ${m.desc}">${m.icon}</span>`).join('')}
            </div>
          ` : `<div style="color:#64748b;font-size:0.85rem;margin-bottom:20px;">${currentLang === 'tr' ? 'Henüz madalya kazanılmadı. Haritada yerleri işaretleyerek madalya topla!' : 'No medals earned yet. Mark places on the map to earn medals!'}</div>`}
        </div>

        <!-- Theme & Language Settings Card -->
        <div class="share-section" style="margin-top:0;">
          <h3 style="margin-bottom:12px;font-size:1.05rem;">⚙️ ${currentLang === 'tr' ? 'Görünüm ve Dil Ayarları' : 'Appearance & Language'}</h3>
          
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;margin-top:10px;">
            <!-- Language Selector -->
            <div>
              <div style="font-size:0.85rem;color:#94a3b8;margin-bottom:8px;font-weight:600;">🌐 ${t('language')}</div>
              <div style="display:flex;gap:8px;">
                <button class="lang-select-btn ${currentLang === 'tr' ? 'active' : ''}" data-lang="tr" style="flex:1;padding:10px;border-radius:10px;border:1px solid ${currentLang === 'tr' ? '#ff5722' : 'rgba(255,255,255,0.15)'};background:${currentLang === 'tr' ? 'rgba(255,87,34,0.2)' : 'rgba(15,23,42,0.6)'};color:#f8fafc;cursor:pointer;font-weight:700;">🇹🇷 Türkçe</button>
                <button class="lang-select-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en" style="flex:1;padding:10px;border-radius:10px;border:1px solid ${currentLang === 'en' ? '#ff5722' : 'rgba(255,255,255,0.15)'};background:${currentLang === 'en' ? 'rgba(255,87,34,0.2)' : 'rgba(15,23,42,0.6)'};color:#f8fafc;cursor:pointer;font-weight:700;">🇬🇧 English</button>
              </div>
            </div>

            <!-- Theme Selector -->
            <div>
              <div style="font-size:0.85rem;color:#94a3b8;margin-bottom:8px;font-weight:600;">🎨 ${t('theme')}</div>
              <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:8px;">
                ${Object.values(THEMES).map(th => `
                  <button class="theme-select-btn ${currentTheme === th.id ? 'active' : ''}" data-theme="${th.id}" style="padding:8px 10px;border-radius:10px;border:1px solid ${currentTheme === th.id ? '#ff5722' : 'rgba(255,255,255,0.15)'};background:${currentTheme === th.id ? 'rgba(255,87,34,0.2)' : 'rgba(15,23,42,0.6)'};color:#f8fafc;cursor:pointer;font-size:0.82rem;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;">
                    <span>${th.icon}</span> <span>${currentLang === 'tr' ? th.name : th.nameEn}</span>
                  </button>
                `).join('')}
              </div>
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

    // Language selection event
    contentArea.querySelectorAll('.lang-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        setLanguage(lang);
        render();
      });
    });

    // Theme selection event
    contentArea.querySelectorAll('.theme-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const themeId = btn.getAttribute('data-theme');
        setTheme(themeId);
        render();
      });
    });

    document.getElementById('profile-copy-btn')?.addEventListener('click', (e) => {
      const input = document.getElementById('profile-share-code');
      input.select();
      document.execCommand('copy');
      e.target.textContent = t('copied');
      setTimeout(() => e.target.textContent = t('copy'), 2000);
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

  function renderCompareTab(contentArea) {
    const currentLang = getLanguage();

    contentArea.innerHTML = `
      <div class="compare-view">
        <div class="compare-top">
          <div class="compare-mine" id="compare-mine-area"></div>
          <div class="compare-vs">⚔️ VS</div>
          <div class="compare-other">
            <div id="compare-input-area" class="compare-input-card">
              <h3 style="color:#f8fafc;margin-bottom:6px;font-size:1.15rem;">${currentLang === 'tr' ? 'Arkadaşının Profilini Yükle' : 'Load Friend\'s Profile'}</h3>
              <p style="color:#94a3b8;font-size:0.82rem;margin-bottom:14px;">${currentLang === 'tr' ? 'Arkadaşının sana verdiği paylaşım kodunu yapıştırarak seyahatlerinizi yan yana karşılaştırın.' : 'Paste your friend\'s share code to compare your travels side by side.'}</p>
              <textarea class="compare-code-input" id="compare-code" rows="3" placeholder="${t('comparePlaceholder')}"></textarea>
              <button class="compare-load-btn" id="compare-load-btn">⚡ ${t('loadProfile')}</button>
            </div>
            <div id="compare-other-area" style="display:none;"></div>
          </div>
        </div>
        <div id="compare-results-area" style="display:none;margin-top:24px;"></div>
      </div>
    `;

    // Render my profile card
    const myProfileStr = localStorage.getItem('gv_profile');
    const myProfile = myProfileStr ? JSON.parse(myProfileStr) : { username: (currentLang === 'tr' ? 'Ben' : 'Me'), avatar: '🧭' };
    
    let myStats = { worldCountryCount: 0, turkeyCount: 0, worldCityCount: 0 };
    let myEarnedCount = 0;
    let myStorage = { worldVisits: {}, turkeyVisits: {}, worldCities: [] };

    try {
      myStorage = getStorageData();
      myStats = calculateStats();
      myEarnedCount = getEarnedAchievements(myStorage, myStats).length;
    } catch(e) {}

    document.getElementById('compare-mine-area').innerHTML = `
      <div class="profile-card" style="margin:0;height:100%;">
        <div class="profile-card-label" style="background:rgba(59,130,246,0.2);color:#3b82f6;border-color:rgba(59,130,246,0.3);">${currentLang === 'tr' ? 'BENİM PROFİLİM' : 'MY PROFILE'}</div>
        <div class="profile-header">
          <div class="profile-avatar">${myProfile.avatar}</div>
          <div>
            <div class="profile-username">${myProfile.username}</div>
            <div class="profile-bio">${myProfile.bio || (currentLang === 'tr' ? 'Dünyayı keşfediyorum' : 'Exploring the world')}</div>
          </div>
        </div>
        <div class="profile-stats">
          <div class="pstat"><span class="pstat-num" style="color:#ff5722">${myStats.worldCountryCount || 0}</span><span class="pstat-lbl">${t('countriesVisited')}</span></div>
          <div class="pstat"><span class="pstat-num" style="color:#ef4444">${myStats.turkeyCount || 0}</span><span class="pstat-lbl">${t('provincesVisited')}</span></div>
          <div class="pstat"><span class="pstat-num" style="color:#3b82f6">${myStats.worldCityCount || 0}</span><span class="pstat-lbl">${t('citiesVisited')}</span></div>
          <div class="pstat"><span class="pstat-num" style="color:#10b981">${myEarnedCount}</span><span class="pstat-lbl">${t('tabMedals')}</span></div>
        </div>
      </div>
    `;

    document.getElementById('compare-load-btn').addEventListener('click', () => {
      const code = document.getElementById('compare-code').value.trim();
      if (!code) {
        alert(currentLang === 'tr' ? 'Lütfen bir paylaşım kodu girin!' : 'Please enter a share code!');
        return;
      }
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(code)));
        const otherProfile = decoded.profile || { username: (currentLang === 'tr' ? 'Arkadaş' : 'Friend'), avatar: '👤' };
        const otherWorldObj = decoded.worldVisits || {};
        const otherTurkeyObj = decoded.turkeyVisits || {};
        const otherCitiesArr = decoded.worldCities || [];

        const otherCountryCodes = Array.isArray(otherWorldObj) 
          ? otherWorldObj 
          : Object.entries(otherWorldObj).filter(([k, v]) => !k.includes('::') && v?.status === 'visited').map(([k]) => k);

        const myCountryCodes = Object.entries(myStorage.worldVisits)
          .filter(([k, v]) => !k.includes('::') && v?.status === 'visited')
          .map(([k]) => k);

        const otherTurkeyCount = Array.isArray(otherTurkeyObj) 
          ? otherTurkeyObj.length 
          : Object.values(otherTurkeyObj).filter(v => v?.status === 'visited').length;

        const otherCitiesCount = otherCitiesArr.length;
        const otherStats = {
          worldCountryCount: otherCountryCodes.length,
          turkeyCount: otherTurkeyCount,
          worldCityCount: otherCitiesCount
        };
        const otherEarnedCount = getEarnedAchievements({ worldVisits: otherWorldObj, turkeyVisits: otherTurkeyObj, worldCities: otherCitiesArr }, otherStats).length;

        // Render other profile card
        document.getElementById('compare-input-area').style.display = 'none';
        const otherArea = document.getElementById('compare-other-area');
        otherArea.style.display = 'block';
        otherArea.innerHTML = `
          <div class="profile-card" style="margin:0;height:100%;">
            <div class="profile-card-label" style="background:rgba(245,158,11,0.2);color:#f59e0b;border-color:rgba(245,158,11,0.3);">${otherProfile.username.toUpperCase()}</div>
            <div class="profile-header">
              <div class="profile-avatar">${otherProfile.avatar}</div>
              <div>
                <div class="profile-username">${otherProfile.username}</div>
                <div class="profile-bio">${otherProfile.bio || ''}</div>
              </div>
            </div>
            <div class="profile-stats">
              <div class="pstat"><span class="pstat-num" style="color:#ff5722">${otherCountryCodes.length}</span><span class="pstat-lbl">${t('countriesVisited')}</span></div>
              <div class="pstat"><span class="pstat-num" style="color:#ef4444">${otherTurkeyCount}</span><span class="pstat-lbl">${t('provincesVisited')}</span></div>
              <div class="pstat"><span class="pstat-num" style="color:#3b82f6">${otherCitiesCount}</span><span class="pstat-lbl">${t('citiesVisited')}</span></div>
              <div class="pstat"><span class="pstat-num" style="color:#10b981">${otherEarnedCount}</span><span class="pstat-lbl">${t('tabMedals')}</span></div>
            </div>
          </div>
        `;

        // Calculate comparison breakdown
        const commonCountries = myCountryCodes.filter(c => otherCountryCodes.includes(c));
        const onlyMyCountries = myCountryCodes.filter(c => !otherCountryCodes.includes(c));
        const onlyOtherCountries = otherCountryCodes.filter(c => !myCountryCodes.includes(c));

        const getCName = (code) => {
          const c = WORLD_COUNTRIES.find(x => x.code === code);
          return c ? getCountryDisplayName(c) : code;
        };

        const resultsArea = document.getElementById('compare-results-area');
        resultsArea.style.display = 'block';
        resultsArea.innerHTML = `
          <div class="share-section" style="margin-top:0;">
            <h3 style="margin-bottom:16px;">📊 ${currentLang === 'tr' ? 'Karşılaştırma Sonuçları' : 'Comparison Results'}</h3>
            
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;">
              <div style="background:rgba(15,23,42,0.6);border-radius:12px;padding:16px;">
                <div style="font-weight:700;color:#10b981;margin-bottom:8px;">🤝 ${currentLang === 'tr' ? 'İkinizin de Gittiği Ortak Ülkeler' : 'Common Countries Visited'} (${commonCountries.length})</div>
                <div style="font-size:0.85rem;color:#cbd5e1;line-height:1.6;">
                  ${commonCountries.length > 0 ? commonCountries.map(c => `• ${getCName(c)}`).join('<br>') : (currentLang === 'tr' ? 'Ortak ülke bulunamadı.' : 'No common countries found.')}
                </div>
              </div>

              <div style="background:rgba(15,23,42,0.6);border-radius:12px;padding:16px;">
                <div style="font-weight:700;color:#3b82f6;margin-bottom:8px;">⭐ ${currentLang === 'tr' ? `Sadece Senin Gittiğin Ülkeler` : 'Only You Visited'} (${onlyMyCountries.length})</div>
                <div style="font-size:0.85rem;color:#cbd5e1;line-height:1.6;">
                  ${onlyMyCountries.length > 0 ? onlyMyCountries.map(c => `• ${getCName(c)}`).join('<br>') : (currentLang === 'tr' ? 'Farklı ülke yok.' : 'No unique countries.')}
                </div>
              </div>

              <div style="background:rgba(15,23,42,0.6);border-radius:12px;padding:16px;">
                <div style="font-weight:700;color:#f59e0b;margin-bottom:8px;">🚀 ${currentLang === 'tr' ? `Sadece ${otherProfile.username}'in Gittiği Ülkeler` : `Only ${otherProfile.username} Visited`} (${onlyOtherCountries.length})</div>
                <div style="font-size:0.85rem;color:#cbd5e1;line-height:1.6;">
                  ${onlyOtherCountries.length > 0 ? onlyOtherCountries.map(c => `• ${getCName(c)}`).join('<br>') : (currentLang === 'tr' ? 'Farklı ülke yok.' : 'No unique countries.')}
                </div>
              </div>
            </div>
          </div>
        `;
      } catch (err) {
        console.error('Compare parse error:', err);
        alert(t('invalidCode'));
      }
    });
  }
}
