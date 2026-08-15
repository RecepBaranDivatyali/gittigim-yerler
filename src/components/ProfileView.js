import { getStorageData, calculateStats } from '../utils/storage.js';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, getEarnedAchievements } from '../data/achievements.js';
import { WORLD_COUNTRIES } from '../data/worldData.js';

export function renderProfileView(container, onBack) {
  let activeTab = 'profile'; // profile, medals, compare

  function render() {
    container.innerHTML = `
      <div class="profile-overlay">
        <div class="profile-topbar">
          <button class="profile-back-btn" id="profile-back">← Haritaya Dön</button>
          <div class="profile-tabs">
            <button class="ptab ${activeTab === 'profile' ? 'active' : ''}" data-tab="profile">Profilim</button>
            <button class="ptab ${activeTab === 'medals' ? 'active' : ''}" data-tab="medals">Madalyalar</button>
            <button class="ptab ${activeTab === 'compare' ? 'active' : ''}" data-tab="compare">Karşılaştır</button>
          </div>
          <button id="profile-logout" style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#f87171;border-radius:10px;padding:8px 14px;font-size:0.85rem;cursor:pointer;font-family:inherit;font-weight:600;">🚪 Çıkış Yap</button>
        </div>
        <div class="profile-content" id="profile-content-area"></div>
      </div>
    `;

    document.getElementById('profile-back').addEventListener('click', onBack);

    const logoutBtn = document.getElementById('profile-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Çıkmak istiyor musun? Verileriniz silinmeyecek, sadece oturum kapanacak.')) {
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
          <div class="profile-card-label">GEZGİN KARTI</div>
          <div class="profile-header">
            <div class="profile-avatar">${profile.avatar}</div>
            <div>
              <div class="profile-username">${profile.username}</div>
              <div class="profile-bio">${profile.bio || 'Dünyayı geziyor...'}</div>
            </div>
          </div>
          <div class="profile-stats">
            <div class="pstat"><span class="pstat-num" style="color:#ff5722">${baseStats.worldCountryCount || 0}</span><span class="pstat-lbl">Ülke</span></div>
            <div class="pstat"><span class="pstat-num" style="color:#ef4444">${baseStats.turkeyCount || 0}</span><span class="pstat-lbl">TR İl</span></div>
            <div class="pstat"><span class="pstat-num" style="color:#3b82f6">${baseStats.worldCityCount || 0}</span><span class="pstat-lbl">Şehir</span></div>
            <div class="pstat"><span class="pstat-num" style="color:#10b981">${earnedMedals.length}/${ACHIEVEMENTS.length}</span><span class="pstat-lbl">Madalya</span></div>
          </div>
          ${earnedMedals.length > 0 ? `
            <div class="profile-badges-header" style="font-size:0.85rem;color:#94a3b8;font-weight:600;margin-bottom:8px;">Kazanılan Rozetler (${earnedMedals.length})</div>
            <div class="profile-badges">
              ${earnedMedals.map(m => `<span class="badge-icon" title="${m.title} - ${m.desc}">${m.icon}</span>`).join('')}
            </div>
          ` : '<div style="color:#64748b;font-size:0.85rem;margin-bottom:20px;">Henüz madalya kazanılmadı. Haritada yerleri işaretleyerek madalya topla!</div>'}
        </div>
        
        <div class="share-section">
          <h3>Profilini Paylaş</h3>
          <p>Aşağıdaki kodu kopyalayarak profilini ve seyahat haritanı arkadaşlarına gönder veya karşılaştırma yap.</p>
          <div class="share-code-row">
            <input type="text" class="share-code-input" id="profile-share-code" readonly value="${shareCode}">
            <button class="share-copy-btn" id="profile-copy-btn">Kopyala</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('profile-copy-btn')?.addEventListener('click', (e) => {
      const input = document.getElementById('profile-share-code');
      input.select();
      document.execCommand('copy');
      e.target.textContent = 'Kopyalandı!';
      setTimeout(() => e.target.textContent = 'Kopyala', 2000);
    });
  }

  function renderMedalsTab(contentArea) {
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
          <div class="ach-progress-text">${earnedCount} / ${total} Madalya Kazanıldı (%${percent})</div>
          <div class="ach-progress-bar-wrap">
            <div class="ach-progress-bar" style="width: ${percent}%"></div>
          </div>
        </div>
    `;

    catEntries.forEach(([catId, cat]) => {
      const catAchs = achievements.filter(a => a.category === catId);
      if (catAchs.length === 0) return;

      const catEarned = catAchs.filter(a => earnedIds.includes(a.id)).length;

      html += `
        <div class="ach-category">
          <div class="ach-cat-title" style="color:${cat.color}">
            ${cat.label} <span style="font-size:0.8rem;color:#64748b;font-weight:500;">(${catEarned}/${catAchs.length})</span>
          </div>
          <div class="ach-grid">
            ${catAchs.map(ach => {
              const isEarned = earnedIds.includes(ach.id);
              return `
                <div class="ach-card ${isEarned ? 'earned' : 'locked'}">
                  ${isEarned ? '<div class="ach-check">✓</div>' : '<div class="ach-lock">🔒</div>'}
                  <div class="ach-icon">${ach.icon}</div>
                  <div class="ach-name">${ach.title}</div>
                  <div class="ach-desc">${ach.desc}</div>
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
    contentArea.innerHTML = `
      <div class="compare-view">
        <div class="compare-top">
          <div class="compare-mine" id="compare-mine-area"></div>
          <div class="compare-vs">⚔️ VS</div>
          <div class="compare-other">
            <div id="compare-input-area" class="compare-input-card">
              <h3 style="color:#f8fafc;margin-bottom:6px;font-size:1.15rem;">Arkadaşının Profilini Yükle</h3>
              <p style="color:#94a3b8;font-size:0.82rem;margin-bottom:14px;">Arkadaşının sana verdiği paylaşım kodunu yapıştırarak seyahatlerinizi yan yana karşılaştırın.</p>
              <textarea class="compare-code-input" id="compare-code" rows="3" placeholder="Paylaşım kodunu buraya yapıştır..."></textarea>
              <button class="compare-load-btn" id="compare-load-btn">⚡ Profili Karşılaştır</button>
            </div>
            <div id="compare-other-area" style="display:none;"></div>
          </div>
        </div>
        <div id="compare-results-area" style="display:none;margin-top:24px;"></div>
      </div>
    `;

    // Render my profile card
    const myProfileStr = localStorage.getItem('gv_profile');
    const myProfile = myProfileStr ? JSON.parse(myProfileStr) : { username: 'Ben', avatar: '🧭' };
    
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
        <div class="profile-card-label" style="background:rgba(59,130,246,0.2);color:#3b82f6;border-color:rgba(59,130,246,0.3);">BENİM PROFİLİM</div>
        <div class="profile-header">
          <div class="profile-avatar">${myProfile.avatar}</div>
          <div>
            <div class="profile-username">${myProfile.username}</div>
            <div class="profile-bio">${myProfile.bio || 'Dünyayı keşfediyorum'}</div>
          </div>
        </div>
        <div class="profile-stats">
          <div class="pstat"><span class="pstat-num" style="color:#ff5722">${myStats.worldCountryCount || 0}</span><span class="pstat-lbl">Ülke</span></div>
          <div class="pstat"><span class="pstat-num" style="color:#ef4444">${myStats.turkeyCount || 0}</span><span class="pstat-lbl">TR İl</span></div>
          <div class="pstat"><span class="pstat-num" style="color:#3b82f6">${myStats.worldCityCount || 0}</span><span class="pstat-lbl">Şehir</span></div>
          <div class="pstat"><span class="pstat-num" style="color:#10b981">${myEarnedCount}</span><span class="pstat-lbl">Madalya</span></div>
        </div>
      </div>
    `;

    document.getElementById('compare-load-btn').addEventListener('click', () => {
      const code = document.getElementById('compare-code').value.trim();
      if (!code) {
        alert('Lütfen bir paylaşım kodu girin!');
        return;
      }
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(code)));
        const otherProfile = decoded.profile || { username: 'Arkadaş', avatar: '👤' };
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

        const otherCitiesCount = Math.max(
          Array.isArray(otherCitiesArr) ? otherCitiesArr.length : 0,
          !Array.isArray(otherWorldObj) ? Object.keys(otherWorldObj).filter(k => k.includes('::') && otherWorldObj[k]?.status === 'visited').length : 0
        );

        // Calculate other's earned medals
        let otherEarnedCount = 0;
        try {
          const fakeStorage = { worldVisits: otherWorldObj, turkeyVisits: otherTurkeyObj, worldCities: otherCitiesArr };
          const fakeBase = {
            worldCountryCount: otherCountryCodes.length,
            turkeyCount: otherTurkeyCount,
            worldCityCount: otherCitiesCount,
            continentCounts: {}
          };
          otherEarnedCount = getEarnedAchievements(fakeStorage, fakeBase).length;
        } catch {}

        // Find common countries and unique countries
        const commonCodes = myCountryCodes.filter(c => otherCountryCodes.includes(c));
        const onlyOtherCodes = otherCountryCodes.filter(c => !myCountryCodes.includes(c));
        const onlyMyCodes = myCountryCodes.filter(c => !otherCountryCodes.includes(c));

        function getCountryDisplay(code) {
          const country = WORLD_COUNTRIES.find(c => c.code === code);
          return country ? `${country.flag} ${country.name}` : code;
        }

        // Show other card
        document.getElementById('compare-input-area').style.display = 'none';
        const otherArea = document.getElementById('compare-other-area');
        otherArea.style.display = 'block';
        otherArea.innerHTML = `
          <div class="profile-card" style="margin:0;height:100%;">
            <div class="profile-card-label" style="background:rgba(16,185,129,0.2);color:#10b981;border-color:rgba(16,185,129,0.3);">ARKADAŞIN</div>
            <div class="profile-header">
              <div class="profile-avatar">${otherProfile.avatar || '👤'}</div>
              <div>
                <div class="profile-username">${otherProfile.username || 'Arkadaş'}</div>
                <div class="profile-bio">${otherProfile.bio || 'Dünyayı keşfediyor'}</div>
              </div>
            </div>
            <div class="profile-stats">
              <div class="pstat"><span class="pstat-num" style="color:#ff5722">${otherCountryCodes.length}</span><span class="pstat-lbl">Ülke</span></div>
              <div class="pstat"><span class="pstat-num" style="color:#ef4444">${otherTurkeyCount}</span><span class="pstat-lbl">TR İl</span></div>
              <div class="pstat"><span class="pstat-num" style="color:#3b82f6">${otherCitiesCount}</span><span class="pstat-lbl">Şehir</span></div>
              <div class="pstat"><span class="pstat-num" style="color:#10b981">${otherEarnedCount}</span><span class="pstat-lbl">Madalya</span></div>
            </div>
            <button id="compare-reset-btn" style="width:100%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:#f8fafc;padding:9px;margin-top:14px;cursor:pointer;font-size:0.85rem;font-weight:600;transition:all .2s;">🔄 Başka Birini Karşılaştır</button>
          </div>
        `;

        document.getElementById('compare-reset-btn').addEventListener('click', () => {
          document.getElementById('compare-other-area').style.display = 'none';
          document.getElementById('compare-input-area').style.display = 'block';
          document.getElementById('compare-results-area').style.display = 'none';
          document.getElementById('compare-code').value = '';
        });

        // Detailed battle results
        const resultsArea = document.getElementById('compare-results-area');
        resultsArea.style.display = 'block';
        resultsArea.innerHTML = `
          <div class="compare-breakdown">
            <h3 style="color:#f8fafc;font-size:1.2rem;margin-bottom:16px;text-align:center;">📊 Seyahat Karşılaştırma Analizi</h3>
            
            <!-- Comparison Metric Bars -->
            <div class="compare-bars-card">
              <div class="comp-bar-item">
                <div class="comp-bar-label">
                  <span>${myProfile.username} (${myStats.worldCountryCount || 0})</span>
                  <span style="color:#f59e0b;font-weight:700;">🌍 Gezilen Ülke</span>
                  <span>(${otherCountryCodes.length}) ${otherProfile.username}</span>
                </div>
                <div class="comp-bar-track">
                  <div class="comp-bar-mine" style="width:${((myStats.worldCountryCount || 0) / Math.max((myStats.worldCountryCount || 0) + otherCountryCodes.length, 1)) * 100}%"></div>
                  <div class="comp-bar-other" style="width:${(otherCountryCodes.length / Math.max((myStats.worldCountryCount || 0) + otherCountryCodes.length, 1)) * 100}%"></div>
                </div>
              </div>

              <div class="comp-bar-item" style="margin-top:14px;">
                <div class="comp-bar-label">
                  <span>${myProfile.username} (${myStats.turkeyCount || 0})</span>
                  <span style="color:#ef4444;font-weight:700;">🇹🇷 Türkiye İlleri</span>
                  <span>(${otherTurkeyCount}) ${otherProfile.username}</span>
                </div>
                <div class="comp-bar-track">
                  <div class="comp-bar-mine" style="width:${((myStats.turkeyCount || 0) / Math.max((myStats.turkeyCount || 0) + otherTurkeyCount, 1)) * 100}%"></div>
                  <div class="comp-bar-other" style="width:${(otherTurkeyCount / Math.max((myStats.turkeyCount || 0) + otherTurkeyCount, 1)) * 100}%"></div>
                </div>
              </div>

              <div class="comp-bar-item" style="margin-top:14px;">
                <div class="comp-bar-label">
                  <span>${myProfile.username} (${myEarnedCount})</span>
                  <span style="color:#10b981;font-weight:700;">🏆 Kazanılan Madalyalar</span>
                  <span>(${otherEarnedCount}) ${otherProfile.username}</span>
                </div>
                <div class="comp-bar-track">
                  <div class="comp-bar-mine" style="width:${(myEarnedCount / Math.max(myEarnedCount + otherEarnedCount, 1)) * 100}%"></div>
                  <div class="comp-bar-other" style="width:${(otherEarnedCount / Math.max(myEarnedCount + otherEarnedCount, 1)) * 100}%"></div>
                </div>
              </div>
            </div>

            <!-- Common & Unique Countries Grid -->
            <div class="compare-details-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;margin-top:20px;">
              <!-- Common Countries -->
              <div class="comp-card-box">
                <div class="comp-card-title" style="color:#10b981;">🤝 Ortak Gezilen Ülkeler (${commonCodes.length})</div>
                ${commonCodes.length > 0 ? `
                  <div class="comp-chips-wrap">
                    ${commonCodes.map(c => `<span class="comp-chip common">${getCountryDisplay(c)}</span>`).join('')}
                  </div>
                ` : '<div style="color:#64748b;font-size:0.85rem;">Henüz ortak gezdiğiniz bir ülke yok.</div>'}
              </div>

              <!-- Only Friend Visited -->
              <div class="comp-card-box">
                <div class="comp-card-title" style="color:#3b82f6;">💡 Arkadaşının Gidip Senin Gitmediğin (${onlyOtherCodes.length})</div>
                ${onlyOtherCodes.length > 0 ? `
                  <div class="comp-chips-wrap">
                    ${onlyOtherCodes.map(c => `<span class="comp-chip friend-only">${getCountryDisplay(c)}</span>`).join('')}
                  </div>
                ` : '<div style="color:#64748b;font-size:0.85rem;">Arkadaşının gidip senin gitmediğin bir ülke yok.</div>'}
              </div>

              <!-- Only Mine Visited -->
              <div class="comp-card-box">
                <div class="comp-card-title" style="color:#ff5722;">🌟 Senin Gidip Arkadaşının Gitmediği (${onlyMyCodes.length})</div>
                ${onlyMyCodes.length > 0 ? `
                  <div class="comp-chips-wrap">
                    ${onlyMyCodes.map(c => `<span class="comp-chip mine-only">${getCountryDisplay(c)}</span>`).join('')}
                  </div>
                ` : '<div style="color:#64748b;font-size:0.85rem;">Senin gidip arkadaşının gitmediği bir ülke yok.</div>'}
              </div>
            </div>
          </div>
        `;

      } catch (err) {
        alert('Geçersiz veya bozuk paylaşım kodu!');
      }
    });
  }

  render();
}
