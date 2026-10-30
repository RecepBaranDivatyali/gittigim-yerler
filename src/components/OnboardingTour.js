// OnboardingTour.js - Hızlı Ülke Seçim Sihirbazı & Hoş Geldiniz
import { getStorageData, saveWorldVisit, saveTurkeyVisit } from '../utils/storage.js';
import { getLanguage, getCountryDisplayName } from '../utils/i18n.js';
import { WORLD_COUNTRIES } from '../data/worldData.js';
import { escapeHtml } from '../utils/security.js';

// En çok seyahat edilen popüler başlangıç ülkeleri
const POPULAR_QUICK_COUNTRIES = [
  'TR', 'DE', 'IT', 'FR', 'ES', 'GR', 'GB', 'NL', 'US', 'GE',
  'AZ', 'AT', 'CH', 'ME', 'RS', 'BA', 'HU', 'CZ', 'BE', 'EG',
  'AE', 'JP', 'TH', 'PT', 'PL', 'SE', 'NO', 'DK', 'RO', 'BG'
];

export function openQuickCountryWizard(onComplete) {
  const lang = getLanguage();
  const isTr = lang === 'tr';
  const { worldVisits, turkeyVisits } = getStorageData();
  const turkeyCount = Object.keys(turkeyVisits || {}).filter(k => turkeyVisits[k]?.status === 'visited').length;

  const modal = document.createElement('div');
  modal.className = 'onboarding-overlay quick-wizard-overlay';

  const countryItems = POPULAR_QUICK_COUNTRIES.map(code => {
    const info = WORLD_COUNTRIES.find(c => c.code === code) || { code, nameTr: code, nameEn: code };
    const name = getCountryDisplayName(info);
    const isVisited = (code === 'TR' && turkeyCount > 0) || (worldVisits[code]?.status === 'visited');
    return {
      code,
      name,
      flag: (code === 'IL') ? '' : (info.flag || '🌍'),
      visited: isVisited
    };
  });

  modal.innerHTML = `
    <div class="onboarding-card quick-wizard-card" style="max-width: 540px; width: 92%; max-height: 85vh; display: flex; flex-direction: column;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
        <h3 style="margin:0; font-size: 1.15rem; display:flex; align-items:center; gap:8px;">
          <span>⚡</span>
          <span>${isTr ? '10 Saniyede Gezdiğin Ülkeleri Seç' : 'Quick Country Selector'}</span>
        </h3>
        <button type="button" class="wizard-close-btn" style="background:none; border:none; font-size:1.4rem; cursor:pointer; color:inherit; opacity:0.7;">&times;</button>
      </div>

      <p style="margin: 0 0 14px 0; font-size: 0.85rem; opacity: 0.8; line-height: 1.4;">
        ${isTr 
          ? 'Gezdiğin ülkelere dokunarak tek tıkla haritana ekle. Sonradan istediğin zaman haritadan yenilerini ekleyebilirsin.' 
          : 'Tap the countries you have visited to add them instantly. You can always add more on the map later.'}
      </p>

      <div class="wizard-country-grid" style="overflow-y:auto; flex:1; display:grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; padding-right: 4px; margin-bottom: 16px;">
        ${countryItems.map(item => `
          <button type="button" class="wizard-country-chip ${item.visited ? 'selected' : ''}" data-code="${item.code}" style="
            display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 10px; border: 1px solid var(--border, rgba(255,255,255,0.12));
            background: ${item.visited ? 'var(--primary, #3b82f6)' : 'var(--bg-secondary, rgba(255,255,255,0.05))'};
            color: ${item.visited ? '#ffffff' : 'inherit'};
            font-size: 0.82rem; cursor: pointer; text-align: left; transition: all 0.15s ease;
          ">
            <span style="font-size: 1.2rem; line-height: 1;">${item.flag}</span>
            <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight: 500;">${escapeHtml(item.name)}</span>
            <span class="chip-check" style="opacity: ${item.visited ? '1' : '0.2'}; font-size: 0.85rem;">✓</span>
          </button>
        `).join('')}
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; pt-2; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
        <span id="wizard-selected-count" style="font-size: 0.85rem; opacity: 0.85;">
          ${isTr ? 'Seçilen:' : 'Selected:'} <strong>${countryItems.filter(x => x.visited).length}</strong>
        </span>
        <button type="button" id="wizard-done-btn" class="onboarding-btn primary" style="padding: 8px 20px; font-weight: 600;">
          ${isTr ? 'Kaydet & Haritayı Gör 🚀' : 'Save & View Map 🚀'}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const chips = modal.querySelectorAll('.wizard-country-chip');
  const countSpan = modal.querySelector('#wizard-selected-count strong');

  const updateCount = () => {
    const selected = modal.querySelectorAll('.wizard-country-chip.selected').length;
    if (countSpan) countSpan.textContent = selected;
  };

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const code = chip.dataset.code;
      const isSelected = chip.classList.toggle('selected');
      const check = chip.querySelector('.chip-check');

      if (isSelected) {
        chip.style.background = 'var(--primary, #3b82f6)';
        chip.style.color = '#ffffff';
        if (check) check.style.opacity = '1';
        saveWorldVisit(code, 'visited');
        if (code === 'TR') {
          saveTurkeyVisit('34', 'visited'); // İstanbul varsayılan
        }
      } else {
        chip.style.background = 'var(--bg-secondary, rgba(255,255,255,0.05))';
        chip.style.color = 'inherit';
        if (check) check.style.opacity = '0.2';
        saveWorldVisit(code, 'unvisited');
      }
      updateCount();
    });
  });

  const close = () => {
    modal.remove();
    if (typeof onComplete === 'function') {
      try { onComplete(); } catch (e) { console.error(e); }
    }
  };

  modal.querySelector('.wizard-close-btn')?.addEventListener('click', close);
  modal.querySelector('#wizard-done-btn')?.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
}
