// medalDesigns.js - 3D Commemorative Medal Tokens & Spotlight Modal
import { escapeHtml } from './security.js';
import { ACHIEVEMENT_SVGS } from '../data/achievementIcons.js';

// Highest legendary tier achievements get gold border & ambient shine
const GOLD_LEGEND_IDS = new Set([
  'world_50', 'world_100', 'turkey_all', 'six_continents', 'five_continents',
  'city_100', 'europe_20', 'quad_jet_legend', 'issue_resolved'
]);

export function getMedalTierClass(ach) {
  if (!ach) return 'medal-tier-world';
  if (GOLD_LEGEND_IDS.has(ach.id)) return 'medal-tier-gold';
  switch (ach.category) {
    case 'world': return 'medal-tier-world';
    case 'continent': return 'medal-tier-continent';
    case 'turkey': return 'medal-tier-turkey';
    case 'city': return 'medal-tier-city';
    case 'aviation': return 'medal-tier-aviation';
    case 'special': return 'medal-tier-special';
    case 'community': return 'medal-tier-community';
    default: return 'medal-tier-world';
  }
}

export function renderMedalEmblemContent(ach, size = 'md') {
  if (!ach) return '<span class="medal-core-icon">🏅</span>';
  // Use premium SVG icon if available, fallback to emoji
  const svg = ACHIEVEMENT_SVGS[ach.id];
  if (svg) {
    return `<div class="medal-svg-icon">${svg}</div>`;
  }
  return `<span class="medal-core-icon">${ach.icon || '🏅'}</span>`;
}

export function renderMedalTokenHtml(ach, options = {}) {
  const size = options.size || 'md'; // sm, md, lg, xl
  const isLocked = Boolean(options.isLocked);
  const tierClass = isLocked ? 'locked' : getMedalTierClass(ach);
  const title = escapeHtml(ach.title || 'Madalya');
  const desc = escapeHtml(ach.desc || '');

  return `
    <div class="medal-token size-${size} ${tierClass}" 
         data-medal-id="${escapeHtml(ach.id)}" 
         data-medal-locked="${isLocked ? '1' : '0'}"
         title="${title} • ${desc}"
         tabindex="0"
         role="button"
         aria-label="${title}">
      <div class="medal-token-inner">
        <div class="medal-emblem-content">
          ${renderMedalEmblemContent(ach, size)}
        </div>
      </div>
      ${isLocked ? '<div class="medal-locked-overlay">🔒</div>' : ''}
    </div>
  `;
}

export function openMedalSpotlightModal(ach, isLocked = false, currentLang = 'tr') {
  if (!ach) return;

  const existing = document.querySelector('.medal-spotlight-overlay');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'medal-spotlight-overlay';

  const tierClass = isLocked ? 'locked' : getMedalTierClass(ach);
  const title = currentLang === 'en' ? (ach.titleEn || ach.title) : ach.title;
  const desc = currentLang === 'en' ? (ach.descEn || ach.desc) : ach.desc;

  const catNames = {
    world: currentLang === 'tr' ? 'Dünya Gezgini' : 'World Explorer',
    continent: currentLang === 'tr' ? 'Kıta Kâşifi' : 'Continent Pioneer',
    turkey: currentLang === 'tr' ? 'Anadolu & Türkiye' : 'Anatolia & Turkey',
    city: currentLang === 'tr' ? 'Şehir Avcısı' : 'City Hunter',
    aviation: currentLang === 'tr' ? 'Havacılık & Filo' : 'Aviation & Fleet',
    special: currentLang === 'tr' ? 'Özel & Rotalar' : 'Special Routes',
    community: currentLang === 'tr' ? 'Topluluk & Katkı' : 'Community'
  };

  const catLabel = catNames[ach.category] || (currentLang === 'tr' ? 'Gezgin Başarımı' : 'Traveler Badge');

  modal.innerHTML = `
    <div class="medal-spotlight-dialog">
      <button type="button" class="medal-spotlight-close" id="btn-close-spotlight" aria-label="Kapat">&times;</button>
      
      <div class="medal-spotlight-halo">
        <div class="medal-token size-xl ${tierClass}">
          <div class="medal-token-inner">
            <div class="medal-emblem-content">
              ${renderMedalEmblemContent(ach, 'xl')}
            </div>
          </div>
          ${isLocked ? '<div class="medal-locked-overlay">🔒</div>' : ''}
        </div>
      </div>

      <div class="medal-spotlight-title">${escapeHtml(title)}</div>
      <div class="medal-spotlight-cat ${tierClass}">${escapeHtml(catLabel)}</div>
      <div class="medal-spotlight-desc">${escapeHtml(desc)}</div>

      <div class="medal-spotlight-status ${isLocked ? 'locked' : 'earned'}">
        ${isLocked 
          ? `<span>🔒 ${currentLang === 'tr' ? 'Henüz Açılmadı' : 'Locked'}</span>` 
          : `<span>✓ ${currentLang === 'tr' ? 'Kazanıldı & Koleksiyona Eklendi' : 'Unlocked & Collected'}</span>`
        }
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#btn-close-spotlight')?.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      close();
      window.removeEventListener('keydown', onKeyDown);
    }
  };
  window.addEventListener('keydown', onKeyDown);
}

export function attachMedalSpotlightListeners(container, achievementsList = [], currentLang = 'tr') {
  if (!container) return;
  const achMap = new Map((achievementsList || []).map(a => [a.id, a]));

  container.querySelectorAll('.medal-token:not(.ach-card .medal-token), .ach-card[data-medal-id]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const mid = el.dataset.medalId;
      const isLocked = el.dataset.medalLocked === '1';
      const ach = achMap.get(mid);
      if (ach) {
        openMedalSpotlightModal(ach, isLocked, currentLang);
      }
    });

    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });
}

