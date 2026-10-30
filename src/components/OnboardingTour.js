// OnboardingTour.js - Gezgin 3.0 Hoş Geldiniz Turu & 10 Saniyede Gezdiğin Ülkeleri Seç Sihirbazı
import { getLanguage, getCountryDisplayName } from '../utils/i18n.js';
import { WORLD_COUNTRIES } from '../data/worldData.js';
import { escapeHtml } from '../utils/security.js';

export const POPULAR_COUNTRIES = [
  { code: 'TR', name: 'Türkiye', nameEn: 'Turkey', flag: '🇹🇷' },
  { code: 'GE', name: 'Gürcistan', nameEn: 'Georgia', flag: '🇬🇪' },
  { code: 'AZ', name: 'Azerbaycan', nameEn: 'Azerbaijan', flag: '🇦🇿' },
  { code: 'GR', name: 'Yunanistan', nameEn: 'Greece', flag: '🇬🇷' },
  { code: 'BG', name: 'Bulgaristan', nameEn: 'Bulgaria', flag: '🇧🇬' },
  { code: 'IT', name: 'İtalya', nameEn: 'Italy', flag: '🇮🇹' },
  { code: 'FR', name: 'Fransa', nameEn: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Almanya', nameEn: 'Germany', flag: '🇩🇪' },
  { code: 'ES', name: 'İspanya', nameEn: 'Spain', flag: '🇪🇸' },
  { code: 'NL', name: 'Hollanda', nameEn: 'Netherlands', flag: '🇳🇱' },
  { code: 'GB', name: 'İngiltere', nameEn: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AT', name: 'Avusturya', nameEn: 'Austria', flag: '🇦🇹' },
  { code: 'CH', name: 'İsviçre', nameEn: 'Switzerland', flag: '🇨🇭' },
  { code: 'BE', name: 'Belçika', nameEn: 'Belgium', flag: '🇧🇪' },
  { code: 'CZ', name: 'Çekya', nameEn: 'Czechia', flag: '🇨🇿' },
  { code: 'HU', name: 'Macaristan', nameEn: 'Hungary', flag: '🇭🇺' },
  { code: 'PL', name: 'Polonya', nameEn: 'Poland', flag: '🇵🇱' },
  { code: 'PT', name: 'Portekiz', nameEn: 'Portugal', flag: '🇵🇹' },
  { code: 'RS', name: 'Sırbistan', nameEn: 'Serbia', flag: '🇷🇸' },
  { code: 'BA', name: 'Bosna-Hersek', nameEn: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: 'ME', name: 'Karadağ', nameEn: 'Montenegro', flag: '🇲🇪' },
  { code: 'AL', name: 'Arnavutluk', nameEn: 'Albania', flag: '🇦🇱' },
  { code: 'MK', name: 'Kuzey Makedonya', nameEn: 'North Macedonia', flag: '🇲🇰' },
  { code: 'RU', name: 'Rusya', nameEn: 'Russia', flag: '🇷🇺' },
  { code: 'UA', name: 'Ukrayna', nameEn: 'Ukraine', flag: '🇺🇦' },
  { code: 'EG', name: 'Mısır', nameEn: 'Egypt', flag: '🇪🇬' },
  { code: 'AE', name: 'BAE (Dubai)', nameEn: 'UAE (Dubai)', flag: '🇦🇪' },
  { code: 'JP', name: 'Japonya', nameEn: 'Japan', flag: '🇯🇵' },
  { code: 'TH', name: 'Tayland', nameEn: 'Thailand', flag: '🇹🇭' },
  { code: 'US', name: 'ABD', nameEn: 'USA', flag: '🇺🇸' }
];

/**
 * ⚡ 10 Saniyede Gezdiğin Ülkeleri Seç Hızlı Başlangıç Sihirbazı
 * @param {Function} [onComplete]
 */
export function openQuickCountryWizard(onComplete) {
  const isTr = getLanguage() === 'tr';

  let currentVisits = {};
  try {
    currentVisits = JSON.parse(localStorage.getItem('gittigim_yerler_world_v2') || '{}');
  } catch {
    currentVisits = {};
  }

  const selectedCodes = new Set();
  Object.entries(currentVisits).forEach(([code, data]) => {
    if (!code.includes('::') && (data?.status === 'visited' || data === 'visited')) {
      selectedCodes.add(code);
    }
  });

  const overlay = document.createElement('div');
  overlay.className = 'quick-wizard-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(3, 7, 18, 0.85);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    box-sizing: border-box;
  `;

  overlay.innerHTML = `
    <style>
      .wizard-country-chip {
        border: 1px solid var(--theme-border, rgba(148, 163, 184, 0.35));
        transition: all 0.18s ease;
      }
      .wizard-country-chip.selected {
        border: 1px solid #10b981 !important;
      }
    </style>
    <div class="qw-card" style="
      background: var(--theme-bg-card, #0f172a);
      color: var(--theme-text-main, #f8fafc);
      border: 1px solid var(--theme-border, rgba(148, 163, 184, 0.35));
      border-radius: 20px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      width: 100%;
      max-width: 560px;
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="padding: 18px 20px 14px; border-bottom: 1px solid var(--theme-border, rgba(148, 163, 184, 0.25)); position: relative;">
        <button type="button" id="qw-btn-close" style="
          position: absolute; top: 16px; right: 16px;
          background: rgba(148, 163, 184, 0.15); border: 1px solid var(--theme-border, rgba(148, 163, 184, 0.35));
          color: var(--theme-text-muted, #94a3b8); font-size: 1.1rem; width: 34px; height: 34px;
          border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;
        ">✕</button>
        <div style="font-size: 1.25rem; font-weight: 800; margin: 0 0 6px 0; display: flex; align-items: center; gap: 8px;">
          <span>⚡</span>
          <span>${isTr ? '10 Saniyede Gezdiğin Ülkeleri Seç' : 'Pick Visited Countries in 10s'}</span>
        </div>
        <div style="font-size: 0.85rem; color: var(--theme-text-muted, #94a3b8); margin: 0 0 12px 0; line-height: 1.4;">
          ${isTr 
            ? 'Şimdiye kadar ayak bastığın ülkeleri dokunarak işaretle, dünya haritan saniyeler içinde rengarenk boyansın!' 
            : 'Tap the countries you’ve visited to light up your world map in seconds!'}
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
          <div id="qw-counter" style="
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.3));
            border: 1px solid #10b981; color: #10b981; font-size: 0.85rem; font-weight: 700;
            padding: 5px 12px; border-radius: 20px; display: inline-flex; align-items: center; gap: 6px;
          ">
            <span>🎉</span>
            <span id="qw-counter-text">${selectedCodes.size} ${isTr ? 'Ülke Seçildi' : 'Countries Selected'}</span>
          </div>
        </div>

        <div style="position: relative; margin-top: 10px;">
          <input type="text" id="qw-search-input" placeholder="${isTr ? '🔍 Tüm dünya ülkelerinde ara (195 ülke)...' : '🔍 Search all world countries (195 countries)...'}" style="
            width: 100%; background: rgba(148, 163, 184, 0.1); border: 1px solid var(--theme-border, rgba(148, 163, 184, 0.35));
            border-radius: 12px; padding: 10px 14px; color: var(--theme-text-main, #f8fafc); font-size: 0.92rem;
            outline: none; box-sizing: border-box;
          " />
        </div>
      </div>

      <div style="padding: 14px 16px; overflow-y: auto; flex: 1; -webkit-overflow-scrolling: touch;">
        <div id="qw-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(115px, 1fr)); gap: 8px;"></div>
      </div>

      <div style="padding: 14px 20px; border-top: 1px solid var(--theme-border, rgba(148, 163, 184, 0.25)); display: flex; align-items: center; justify-content: space-between; gap: 12px; background: var(--theme-bg-card, #0b1120);">
        <button type="button" id="qw-btn-clear" style="background: transparent; border: 1px solid var(--theme-border, rgba(148, 163, 184, 0.35)); color: var(--theme-text-muted, #94a3b8); padding: 10px 14px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; cursor: pointer;">
          ${isTr ? 'Temizle' : 'Clear'}
        </button>
        <button type="button" id="qw-btn-save" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; padding: 12px 20px; border-radius: 12px; font-size: 0.95rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35); flex: 1; justify-content: center; display: inline-flex; align-items: center; gap: 8px;">
          <span>${isTr ? 'Kaydet ve Haritamı Boya 🚀' : 'Save & Paint My Map 🚀'}</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const gridEl = overlay.querySelector('#qw-grid');
  const counterTextEl = overlay.querySelector('#qw-counter-text');
  const counterBadgeEl = overlay.querySelector('#qw-counter');
  const searchInput = overlay.querySelector('#qw-search-input');
  const btnClose = overlay.querySelector('#qw-btn-close');
  const btnClear = overlay.querySelector('#qw-btn-clear');
  const btnSave = overlay.querySelector('#qw-btn-save');

  function updateCounter() {
    if (counterTextEl) {
      counterTextEl.textContent = `${selectedCodes.size} ${isTr ? 'Ülke Seçildi' : 'Countries Selected'}`;
    }
    if (counterBadgeEl) {
      counterBadgeEl.style.transform = 'scale(1.06)';
      setTimeout(() => {
        if (counterBadgeEl) counterBadgeEl.style.transform = 'scale(1)';
      }, 120);
    }
  }

  function normText(s) {
    return (s || '')
      .toLocaleLowerCase('tr-TR')
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
  }

  function getDisplayedCountries(query = '') {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    if (!q) {
      const popular30 = POPULAR_COUNTRIES.slice(0, 30);
      const popularCodes = new Set(popular30.map(c => c.code));
      const extraSelected = Array.from(selectedCodes)
        .filter(code => !popularCodes.has(code))
        .map(code => {
          const found = WORLD_COUNTRIES.find(c => c.code === code);
          return found ? { code: found.code, name: found.name, nameEn: found.nameEn, flag: found.flag } : null;
        })
        .filter(Boolean);

      return [...popular30, ...extraSelected];
    }

    const qNorm = normText(q);
    return WORLD_COUNTRIES.filter(c => {
      const trName = (c.name || '').toLocaleLowerCase('tr-TR');
      const enName = (c.nameEn || '').toLocaleLowerCase('tr-TR');
      const code = (c.code || '').toLocaleLowerCase('tr-TR');
      return (
        trName.includes(q) ||
        enName.includes(q) ||
        normText(trName).includes(qNorm) ||
        normText(enName).includes(qNorm) ||
        code === q
      );
    });
  }

  function renderGrid(query = '') {
    const list = getDisplayedCountries(query);
    if (list.length === 0) {
      gridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 30px 10px; color: var(--theme-text-muted, #64748b);">
          ${isTr ? 'Aradığınız kriterde ülke bulunamadı.' : 'No countries found matching your search.'}
        </div>
      `;
      return;
    }

    gridEl.innerHTML = list.map(c => {
      const isSelected = selectedCodes.has(c.code);
      const name = isTr ? c.name : (c.nameEn || c.name);
      return `
        <button type="button" class="qw-chip wizard-country-chip ${isSelected ? 'selected' : ''}" data-code="${c.code}" style="
          background: ${isSelected ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.35))' : 'rgba(148, 163, 184, 0.1)'};
          border: 1px solid ${isSelected ? '#10b981' : 'var(--theme-border, rgba(148, 163, 184, 0.35))'};
          box-shadow: ${isSelected ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none'};
          border-radius: 12px; padding: 8px 10px; cursor: pointer; display: flex; align-items: center; gap: 8px;
          user-select: none; text-align: left; color: inherit; width: 100%;
        ">
          <span style="font-size: 1.25rem; line-height: 1; flex-shrink: 0;">${c.flag || '🌍'}</span>
          <span style="font-size: 0.82rem; font-weight: 600; color: ${isSelected ? '#10b981' : 'var(--theme-text-main, #e2e8f0)'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(name)}">${escapeHtml(name)}</span>
        </button>
      `;
    }).join('');

    gridEl.querySelectorAll('.wizard-country-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const code = chip.getAttribute('data-code');
        if (!code) return;
        if (selectedCodes.has(code)) {
          selectedCodes.delete(code);
        } else {
          selectedCodes.add(code);
        }
        renderGrid(searchInput?.value || '');
        updateCounter();
      });
    });
  }

  renderGrid();

  searchInput?.addEventListener('input', (e) => {
    renderGrid(e.target.value);
  });

  btnClear?.addEventListener('click', () => {
    selectedCodes.clear();
    renderGrid(searchInput?.value || '');
    updateCounter();
  });

  function closeWizard() {
    overlay.remove();
  }

  btnClose?.addEventListener('click', closeWizard);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeWizard();
  });

  btnSave?.addEventListener('click', () => {
    try {
      let worldVisits = {};
      try {
        worldVisits = JSON.parse(localStorage.getItem('gittigim_yerler_world_v2') || '{}');
      } catch {
        worldVisits = {};
      }

      const nowTs = Date.now();
      const today = new Date().toISOString().split('T')[0];

      // 1. Seçilen ülkeleri mevcut alt alanlarını (notes, rating, date, expenses vb.) koruyarak visited yap
      selectedCodes.forEach(code => {
        const existing = (worldVisits[code] && typeof worldVisits[code] === 'object') ? worldVisits[code] : {};
        worldVisits[code] = {
          ...existing,
          status: 'visited',
          updatedAt: nowTs,
          entryDate: existing.entryDate || existing.date || today,
          entryTransport: existing.entryTransport || ((code === 'TR' || code.startsWith('TR::')) ? 'car' : 'flight')
        };
      });

      // 2. Seçimi kaldırılan (unvisited) ülkelerde mevcut notları/tarihi/harcamaları/puanı silmeden yalnızca status: 'unvisited' ve updatedAt: Date.now() güncelle
      Object.keys(worldVisits).forEach(code => {
        if (code.includes('::')) return;
        const existing = worldVisits[code];
        const wasVisited = existing?.status === 'visited' || existing === 'visited';
        if (wasVisited && !selectedCodes.has(code)) {
          const baseObj = (existing && typeof existing === 'object') ? existing : {};
          worldVisits[code] = {
            ...baseObj,
            status: 'unvisited',
            updatedAt: nowTs
          };
        }
      });

      localStorage.setItem('gittigim_yerler_world_v2', JSON.stringify(worldVisits));
      try {
        localStorage.setItem('gv_onboarded', '1');
      } catch {}

      window.dispatchEvent(new CustomEvent('GezginDataUpdated', {
        detail: { source: 'quick-wizard', count: selectedCodes.size }
      }));
    } catch (e) {
      console.error('Failed to save quick country wizard visits:', e);
    }

    closeWizard();
    if (typeof onComplete === 'function') {
      try { onComplete(); } catch (err) { console.error(err); }
    }
  });
}

/**
 * Onboarding turunu kontrol eder ve gerekiyorsa başlatır
 */
export function checkOnboarding() {
  try {
    if (localStorage.getItem('gv_onboarded')) return;
  } catch {
    return;
  }

  const lang = getLanguage();
  const isTr = lang === 'tr';

  const steps = [
    {
      icon: '🌍',
      title: isTr ? 'Dünyayı Keşfet & Boya' : 'Explore & Color the World',
      desc: isTr 
        ? 'Haritadaki ülkelere, eyaletlere ve şehirlere dokun. Gezdiğin yerleri, seyahat planlarını ve hayalindeki rotaları favori renklerine boya!' 
        : 'Tap on countries, states, and cities on the map. Color your visited places, travel plans, and dream bucket list!'
    },
    {
      icon: '🛂',
      title: isTr ? 'Damgalar & Ulaşım Araçları' : 'Stamps & Transport Modes',
      desc: isTr 
        ? 'Her ülkeye giriş ve çıkış damgası bas! Seyahat ettiğin aracı seç: Uçak ✈️, Tren 🚆, Şahsi Araba 🚗, Otobüs 🚌 veya Gemi 🚢 ile anılarını ölümsüzleştir.' 
        : 'Stamp your passport with entry and exit marks! Choose your mode: Flight ✈️, Train 🚆, Car 🚗, Bus 🚌, or Ship 🚢.'
    },
    {
      icon: '🏅',
      title: isTr ? 'Sanal Pasaport & Rozetler' : 'Virtual Passport & Badges',
      desc: isTr 
        ? 'Sınırları aştıkça özel gezgin madalyaları kazan, arkadaşlarınla rotalarını kıyasla ve yüksek çözünürlüklü Sanal Pasaportunu indirip paylaş!' 
        : 'Earn traveler badges as you cross borders, compare journeys with friends, and download your high-res Virtual Passport!'
    }
  ];

  let currentStep = 0;

  const overlay = document.createElement('div');
  overlay.className = 'onboarding-overlay';

  function renderCard() {
    const s = steps[currentStep];
    const isLast = currentStep === steps.length - 1;

    overlay.innerHTML = `
      <div class="onboarding-card">
        <div class="onboarding-icon">${s.icon}</div>
        <div class="onboarding-title">${s.title}</div>
        <div class="onboarding-desc">${s.desc}</div>

        <div class="onboarding-dots-row">
          ${steps.map((_, i) => `<span class="onboarding-dot ${i === currentStep ? 'active' : ''}"></span>`).join('')}
        </div>

        <div class="onboarding-btn-row">
          <button type="button" class="onboarding-btn secondary" id="btn-onboard-skip">${isTr ? 'Atla' : 'Skip'}</button>
          <button type="button" class="onboarding-btn primary" id="btn-onboard-next">${isLast ? (isTr ? 'Ülkelerimi Seç 🚀' : 'Pick My Countries 🚀') : (isTr ? 'Devam Et ➔' : 'Continue ➔')}</button>
        </div>
      </div>
    `;

    overlay.querySelector('#btn-onboard-skip')?.addEventListener('click', finish);
    overlay.querySelector('#btn-onboard-next')?.addEventListener('click', () => {
      if (isLast) {
        finish();
        openQuickCountryWizard();
      } else {
        currentStep++;
        renderCard();
      }
    });
  }

  function finish() {
    try {
      localStorage.setItem('gv_onboarded', '1');
    } catch {}
    overlay.remove();
  }

  renderCard();
  document.body.appendChild(overlay);
}
