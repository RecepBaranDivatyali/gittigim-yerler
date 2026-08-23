const COUNTRY_LABEL_OFFSETS = {
  'HR': [45.4, 17.5],  // Croatia (Deep inside Slavonia heartland, 100% inside borders)
  'AT': [47.5, 14.5],  // Austria (Lower/Upper Austria central interior)
  'BA': [44.1, 17.8],  // Bosnia & Herzegovina
  'SI': [46.1, 14.8],  // Slovenia
  'ME': [42.8, 19.3],  // Montenegro
  'RS': [44.0, 20.8],  // Serbia
  'XK': [42.6, 20.9],  // Kosovo
  'MK': [41.6, 21.7],  // North Macedonia
  'AL': [41.3, 20.0],  // Albania
  'GR': [39.2, 21.9],  // Greece mainland
  'IT': [42.6, 12.8],  // Italy (Central peninsula)
  'CL': [-33.5, -70.6],// Chile (Central valley)
  'NO': [60.8, 8.5],   // Norway (Southern interior)
  'SE': [60.0, 15.0],  // Sweden
  'FI': [63.0, 26.0],  // Finland
  'VN': [21.0, 105.8], // Vietnam (Red River plain)
  'MY': [4.0, 102.0],  // Peninsular Malaysia
  'ID': [-2.0, 117.0], // Indonesia
  'JP': [36.2, 138.2], // Japan (Central Honshu)
  'CA': [56.0, -96.0], // Canada
  'US': [38.5, -97.0], // USA (Lower 48)
  'RU': [60.0, 95.0],  // Russia
  'TR': [39.0, 35.2],  // Turkey (Central Anatolia)
  'DE': [51.2, 10.4],  // Germany
  'FR': [46.8, 2.4],   // France (Central)
  'ES': [40.2, -3.7],  // Spain (Central)
  'PT': [39.5, -8.2],  // Portugal
  'GB': [53.8, -2.0],  // UK (Central England)
  'IE': [53.4, -7.9],  // Ireland
  'PL': [52.0, 19.3],  // Poland
  'UA': [49.0, 31.5],  // Ukraine
  'CH': [46.8, 8.2],   // Switzerland
  'CZ': [49.8, 15.5],  // Czechia
  'SK': [48.7, 19.5],  // Slovakia
  'HU': [47.1, 19.3],  // Hungary
  'RO': [45.9, 24.8],  // Romania
  'BG': [42.6, 25.3],  // Bulgaria
  'NL': [52.2, 5.6],   // Netherlands mainland
  'BE': [50.6, 4.6],   // Belgium
  'DK': [55.7, 9.5],   // Denmark mainland
};

import L from 'leaflet';
import { WORLD_COUNTRIES } from '../data/worldData.js';
import { TURKEY_PROVINCES } from '../data/turkeyData.js';
import { getLocalizedName, getCountryLocalizedName } from '../data/regionNames.js';
import { getStorageData, saveWorldVisit, saveTurkeyVisit, resetTravelData } from '../utils/storage.js';
import { t, getLanguage, setLanguage, onLanguageChange, getCountryDisplayName } from '../utils/i18n.js';
import { THEMES, getTheme, setTheme, onThemeChange, getThemeConfig, applyTheme, getStatusColor } from '../utils/theme.js';

// ─── Config ───────────────────────────────────────────────────────────────────
const REGION_ZOOM = 5.2;
const SUBREGION_ZOOM = 7.5;

function getFlagHtml(code) {
  if (!code) return '🌍';
  const c = code.toLowerCase();
  return `<img src="https://flagcdn.com/w40/${c}.png" class="country-flag-badge" alt="${code}" style="width:22px;height:15px;border-radius:3px;vertical-align:middle;display:inline-block;margin-right:6px;object-fit:cover;box-shadow:0 1px 4px rgba(0,0,0,0.3);" />`;
}

function getStatusConfig() {
  const themeCfg = getThemeConfig();
  return {
    visited:   { label: '🟢 ' + t('visited'),   color: getStatusColor('visited'),  fillOpacity: 0.90 },
    planned:   { label: '🟡 ' + t('planned'),   color: getStatusColor('planned'),  fillOpacity: 0.85 },
    wishlist:  { label: '🟣 ' + t('wishlist'),  color: getStatusColor('wishlist'), fillOpacity: 0.80 },
    unvisited: { label: '⚫ ' + t('unvisited'), color: themeCfg.landBorder,        fillOpacity: 0.95 },
  };
}

function ns(s) {
  if (s === 'target') return 'planned';
  const cfg = getStatusConfig();
  return cfg[s] ? s : 'unvisited';
}

// ─── Module state ──────────────────────────────────────────────────────────
let map = null;
let mapRenderer = null;
let countriesLayer = null;
let countryLabelsLayer = null;
let turkeyLayer = null;
let regionLayers = {};
let regionCache = {};
let subregionLayers = {};
let subregionCache = {};
let selectedCountryCode = null;
let selectedRegionName = null;

// ─── Entry point ──────────────────────────────────────────────────────────────
export function renderWorldMapView(container, options = {}) {
  applyTheme(getTheme());

  let userAvatar = '🧭';
  let userName = t('profile');
  try {
    const raw = localStorage.getItem('gv_profile');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.avatar) userAvatar = parsed.avatar;
      if (parsed.username) userName = parsed.username;
    }
  } catch {}

  function getHtml() {
    const currentLang = getLanguage();
    const currentTheme = getTheme();
    const themeCfg = getThemeConfig(currentTheme);
    const STATUS = getStatusConfig();
    const visitedColor = getStatusColor('visited');

    return `
      <div id="map-root" style="width:100%;height:100%;position:relative;background:${themeCfg.oceanBg};">
        <div id="leaflet-map" style="width:100%;height:100%;background:${themeCfg.oceanBg};"></div>

        <!-- Floating Profile Button (top-left) -->
        <div id="profile-btn-wrap" class="floating-profile-wrap">
          <button id="btn-open-profile" class="floating-profile-btn" aria-label="${t('profile')}">
            <span class="floating-profile-avatar">${userAvatar}</span>
            <span class="floating-profile-name">${userName}</span>
          </button>
        </div>

        <!-- Floating Top-Right Legend (Clean: Only Status indicators) -->
        <div id="map-legend" class="floating-legend">
          <div class="legend-items-list" style="margin-top:2px;">
            ${Object.entries(STATUS).filter(([k]) => k !== 'unvisited').map(([, v]) =>
              `<span class="legend-item"><span class="legend-dot" style="background:${v.color};box-shadow:0 0 6px ${v.color}88;"></span>${v.label.replace(/^.+? /, '')}</span>`
            ).join('')}
            <span class="legend-item"><span class="legend-dot" style="background:transparent;border:2px solid ${themeCfg.landBorder};"></span>${t('unvisited')}</span>
          </div>
        </div>

        <!-- Stats overlay (bottom-left) -->
        <div id="stats-overlay">
          <div id="stats-countries" class="stats-chip"></div>
          <div id="stats-regions" class="stats-chip stats-chip-region" style="display:none;"></div>
        </div>

        <!-- Floating Feedback Button (bottom-right: aligned at safe height bottom:76px) -->
        <div id="feedback-btn-wrap" class="floating-feedback-wrap">
          <button id="btn-open-feedback" class="floating-feedback-btn" aria-label="${t('feedbackBtn')}">
            <span>💬</span> <span class="feedback-btn-text">${t('feedbackBtn')}</span>
          </button>
        </div>

        <!-- Feedback Modal (Hidden by default) -->
        <div id="feedback-modal" class="feedback-modal-overlay" style="display:none;">
          <div class="feedback-modal-card">
            <div class="feedback-modal-header">
              <h3>${t('feedbackTitle')}</h3>
              <button id="feedback-close-btn" class="feedback-close-btn">&times;</button>
            </div>
            <p class="feedback-modal-sub">${t('feedbackSubtitle')}</p>
            
            <div class="feedback-form">
              <div class="feedback-type-group">
                <button type="button" class="feedback-type-btn active" data-type="suggestion">${t('feedbackSuggestion')}</button>
                <button type="button" class="feedback-type-btn" data-type="bug">${t('feedbackBug')}</button>
                <button type="button" class="feedback-type-btn" data-type="other">${t('feedbackOther')}</button>
              </div>
              
              <textarea id="feedback-message" class="feedback-textarea" rows="4" placeholder="${t('feedbackMsgPlaceholder')}"></textarea>
              <input type="text" id="feedback-contact" class="feedback-input" placeholder="${t('feedbackEmailPlaceholder')}" />
              
              <button type="button" id="feedback-submit-btn" class="feedback-submit-btn">${t('feedbackSend')}</button>
              <div id="feedback-success-msg" class="feedback-success-msg" style="display:none;">${t('feedbackSent')}</div>
            </div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div id="map-loading" style="position:absolute;inset:0;display:${countriesLayer ? 'none' : 'flex'};align-items:center;justify-content:center;z-index:9000;pointer-events:none;">
          <div style="text-align:center;color:#94a3b8;font-size:0.9rem;">
            <div style="font-size:2rem;margin-bottom:8px;animation:spin 2s linear infinite;">🌍</div>
            <div>${t('loading')}</div>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = getHtml();

  initMap(container);

  // Setup UI button events
  function attachUIEvents() {
    const profileBtn = container.querySelector('#btn-open-profile');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        if (options.onOpenProfile) options.onOpenProfile();
      });
    }

    // Feedback modal handling
    const openFeedbackBtn = container.querySelector('#btn-open-feedback');
    const feedbackModal = container.querySelector('#feedback-modal');
    const closeFeedbackBtn = container.querySelector('#feedback-close-btn');
    const submitFeedbackBtn = container.querySelector('#feedback-submit-btn');

    if (openFeedbackBtn && feedbackModal) {
      openFeedbackBtn.addEventListener('click', () => {
        feedbackModal.style.display = 'flex';
      });
    }

    if (closeFeedbackBtn && feedbackModal) {
      closeFeedbackBtn.addEventListener('click', () => {
        feedbackModal.style.display = 'none';
      });
    }

    if (feedbackModal) {
      feedbackModal.addEventListener('click', (e) => {
        if (e.target === feedbackModal) feedbackModal.style.display = 'none';
      });
    }

    let activeFeedbackType = 'suggestion';
    container.querySelectorAll('.feedback-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.feedback-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFeedbackType = btn.getAttribute('data-type');
      });
    });

    if (submitFeedbackBtn) {
      submitFeedbackBtn.addEventListener('click', () => {
        const msg = container.querySelector('#feedback-message')?.value?.trim();
        const contact = container.querySelector('#feedback-contact')?.value?.trim();
        if (!msg) return;

        try {
          const stored = JSON.parse(localStorage.getItem('gv_feedbacks') || '[]');
          stored.push({ type: activeFeedbackType, message: msg, contact, date: new Date().toISOString() });
          localStorage.setItem('gv_feedbacks', JSON.stringify(stored));
        } catch {}

        const successMsg = container.querySelector('#feedback-success-msg');
        if (successMsg) {
          successMsg.style.display = 'block';
          setTimeout(() => {
            feedbackModal.style.display = 'none';
            successMsg.style.display = 'none';
            if (container.querySelector('#feedback-message')) container.querySelector('#feedback-message').value = '';
          }, 2000);
        }
      });
    }
  }

  attachUIEvents();

  onLanguageChange(() => {
    updateLegendColors();
    container.innerHTML = getHtml();
    if (map) {
      const el = container.querySelector('#leaflet-map');
      if (el) {
        const mapContainer = map.getContainer();
        if (mapContainer && el.parentNode) {
          el.parentNode.replaceChild(mapContainer, el);
        }
      }
    }
    attachUIEvents();
    refreshAllStyles();
    scheduleLabelUpdate();
    refreshStats();
  });

  function updateLegendColors() {
    const legendEl = container.querySelector('#map-legend');
    if (!legendEl) return;
    const STATUS = getStatusConfig();
    const themeCfg = getThemeConfig();
    legendEl.innerHTML = `
      <div class="legend-items-list" style="margin-top:2px;">
        ${Object.entries(STATUS).filter(([k]) => k !== 'unvisited').map(([, v]) =>
          `<span class="legend-item"><span class="legend-dot" style="background:${v.color};box-shadow:0 0 6px ${v.color}88;"></span>${v.label.replace(/^.+? /, '')}</span>`
        ).join('')}
        <span class="legend-item"><span class="legend-dot" style="background:transparent;border:2px solid ${themeCfg.landBorder};box-shadow:none;"></span>${t('unvisited')}</span>
      </div>
    `;
  }

  onThemeChange((newTheme) => {
    updateLegendColors();
    const cfg = getThemeConfig(newTheme);
    const rootEl = container.querySelector('#map-root');
    if (rootEl) rootEl.style.backgroundColor = cfg.oceanBg;
    const mapEl = container.querySelector('#leaflet-map');
    if (mapEl) mapEl.style.backgroundColor = cfg.oceanBg;
    if (map) {
      const mc = map.getContainer();
      if (mc) mc.style.backgroundColor = cfg.oceanBg;
    }
    
    refreshAllStyles();
    scheduleLabelUpdate();
    refreshStats();
  });

  window.__refreshMapStats = refreshStats;
  refreshStats();
}

function refreshAllStyles() {
  if (countriesLayer) {
    countriesLayer.eachLayer(l => l.setStyle(countryStyle(findCountry(l.feature))));
  }
  if (turkeyLayer) {
    turkeyLayer.eachLayer(l => l.setStyle(provinceStyle(l.feature?.properties?.number)));
  }
  Object.keys(regionLayers).forEach(code => refreshRegionLayer(code));
  Object.keys(subregionLayers).forEach(code => refreshSubregionLayer(code));
}

// ─── Map initialization ───────────────────────────────────────────────────────
function initMap(container) {
  const el = container.querySelector('#leaflet-map');
  if (!el) return;
  if (map) { map.remove(); map = null; }

  const themeCfg = getThemeConfig();

  map = L.map(el, {
    center: [39.0, 35.0],
    zoom: 4,
    minZoom: 2,
    maxZoom: 12,
    zoomControl: false,
    attributionControl: false,
    worldCopyJump: false,
    maxBounds: [[-85, -180], [85, 180]],
    maxBoundsVisiblity: 1.0,
  });

  // Huge 200% SVG renderer buffer: eliminates all panning cutoff lines!
  mapRenderer = L.svg({ padding: 2.0 });

  map.createPane('countriesPane');
  map.getPane('countriesPane').style.zIndex = 410;

  map.createPane('statesPane');
  map.getPane('statesPane').style.zIndex = 420;

  map.createPane('citiesPane');
  map.getPane('citiesPane').style.zIndex = 430;

  map.createPane('labelsPane');
  map.getPane('labelsPane').style.zIndex = 450;
  map.getPane('labelsPane').style.pointerEvents = 'none';

  countryLabelsLayer = L.layerGroup([], { pane: 'labelsPane' }).addTo(map);

  el.style.backgroundColor = themeCfg.oceanBg;

  // Load World Countries
  fetch('/data/world-countries.json').then(r => {
    if (!r.ok) throw new Error('Network ' + r.status);
    return r.json();
  }).then(data => {
    countriesLayer = L.geoJSON(data, {
      renderer: mapRenderer,
      pane: 'countriesPane',
      style: f => countryStyle(findCountry(f)),
      onEachFeature: (f, layer) => {
        const c = findCountry(f);
        layer.on('click', e => {
          if (!c) return;
          const zoom = map?.getZoom() || 3;
          if (zoom >= REGION_ZOOM) {
            const hasReg = (regionLayers[c.code] && map.hasLayer(regionLayers[c.code])) ||
                           (c.code === 'TR' && turkeyLayer && map.hasLayer(turkeyLayer));
            if (hasReg) return;
          }
          L.DomEvent.stopPropagation(e);
          selectedCountryCode = c.code;
          selectedRegionName = null;
          refreshStats();
          const displayName = getCountryDisplayName(c);
          openStatusPopup(e.latlng, c.code, `${getFlagHtml(c.code)} ${displayName}`, 'country', c.code);
        });
      }
    }).addTo(map);
    setTimeout(updateCountryLabels, 100);
    
    // Hide loading indicator
    const loadingEl = document.getElementById('map-loading');
    if (loadingEl) loadingEl.style.display = 'none';
  }).catch(err => {
    console.error('World countries load error:', err);
    const loadingEl = document.getElementById('map-loading');
    if (loadingEl) loadingEl.innerHTML = `<div style="text-align:center;color:#ef4444;font-size:0.9rem;">${t('loadError')}</div>`;
  });

  // Load Turkey Provinces
  fetch('/data/turkey-provinces.json').then(r => {
    if (!r.ok) throw new Error('Network ' + r.status);
    return r.json();
  }).then(data => {
    turkeyLayer = L.geoJSON(data, {
      renderer: mapRenderer,
      pane: 'statesPane',
      style: f => provinceStyle(f.properties?.number),
      onEachFeature: (f, layer) => {
        const id = f.properties?.number;
        const prov = TURKEY_PROVINCES.find(p => p.id === id) || { id, name: f.properties?.name || 'İl' };
        layer.bindTooltip(`<span>🇹🇷 ${prov.name}</span>`, {
          direction: 'top', offset: [0, -10], className: 'clean-hover-tooltip',
          sticky: true, permanent: false
        });
        layer.on('click', e => {
          L.DomEvent.stopPropagation(e);
          openStatusPopup(e.latlng, `TR::${prov.id}`, `${getFlagHtml('TR')} ${prov.name}`, 'province', 'TR');
        });
      }
    });
  }).catch(err => {
    console.error('Turkey provinces load error:', err);
  });

  let isViewUpdating = false;
  let viewUpdatePending = false;

  async function requestViewUpdate() {
    if (isViewUpdating) {
      viewUpdatePending = true;
      return;
    }
    isViewUpdating = true;
    viewUpdatePending = false;

    try {
      await onViewChange();
      scheduleLabelUpdate();
    } catch {} finally {
      isViewUpdating = false;
      if (viewUpdatePending) {
        requestAnimationFrame(requestViewUpdate);
      }
    }
  }

  map.on('moveend zoomend', requestViewUpdate);
}

const IGNORED_LABEL_CODES = new Set([
  'VA', 'SM', 'MC', 'LI', 'AD', 'GI', 'MT', 'IO', 'BM', 'KY',
  'VG', 'AI', 'TC', 'MS', 'BL', 'MF', 'SX', 'CW', 'BQ', 'FK', 'GS', 'PN',
  'SH', 'CC', 'CX', 'NF', 'CK', 'NU', 'TK', 'WF', 'PF', 'NC', 'PM', 'FO', 'SJ'
]);

let _measureCtx = null;
function measureTextWidth(text, fontSize) {
  if (!_measureCtx) {
    const c = document.createElement('canvas');
    _measureCtx = c.getContext('2d');
  }
  _measureCtx.font = `800 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`;
  return _measureCtx.measureText(text.toUpperCase()).width;
}

// Proper area-weighted centroid and bounding box of a single polygon ring
function polygonCentroid(ring) {
  let area = 0, cx = 0, cy = 0;
  const n = ring.length;
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (let i = 0; i < n - 1; i++) {
    const x0 = ring[i][0], y0 = ring[i][1];
    const x1 = ring[i + 1][0], y1 = ring[i + 1][1];
    minX = Math.min(minX, x0, x1);
    maxX = Math.max(maxX, x0, x1);
    minY = Math.min(minY, y0, y1);
    maxY = Math.max(maxY, y0, y1);

    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  area /= 2;
  const absArea = Math.abs(area);
  const bbox = { minLng: minX, minLat: minY, maxLng: maxX, maxLat: maxY };

  if (absArea < 1e-10) {
    let sx = 0, sy = 0;
    for (let i = 0; i < n; i++) { sx += ring[i][0]; sy += ring[i][1]; }
    return { cx: sx / n, cy: sy / n, area: 0, bbox };
  }
  return { cx: cx / (6 * area), cy: cy / (6 * area), area: absArea, bbox };
}

// Find the visual centroid and bounding box of ONLY the largest mainland polygon
function getMainlandInfo(feature) {
  const geom = feature?.geometry;
  if (!geom) return null;

  let best = null;
  let maxArea = -1;

  function processRing(ring) {
    const res = polygonCentroid(ring);
    if (res.area > maxArea) {
      maxArea = res.area;
      best = res;
    }
  }

  if (geom.type === 'Polygon') {
    processRing(geom.coordinates[0]);
  } else if (geom.type === 'MultiPolygon') {
    geom.coordinates.forEach(poly => processRing(poly[0]));
  }

  return best;
}

let _labelUpdateTimer = null;
function scheduleLabelUpdate() {
  if (_labelUpdateTimer) clearTimeout(_labelUpdateTimer);
  _labelUpdateTimer = setTimeout(updateCountryLabels, 120);
}

function updateCountryLabels() {
  if (!countryLabelsLayer || !countriesLayer || !map) return;
  countryLabelsLayer.clearLayers();
  const placedBoxes = [];
  const themeCfg = getThemeConfig();

  const layers = [];
  countriesLayer.eachLayer(layer => layers.push(layer));

  // Sort country layers by polygon area descending (largest first for priority)
  layers.sort((a, b) => {
    try {
      const ba = a.getBounds();
      const bb = b.getBounds();
      const areaA = (ba.getEast() - ba.getWest()) * (ba.getNorth() - ba.getSouth());
      const areaB = (bb.getEast() - bb.getWest()) * (bb.getNorth() - bb.getSouth());
      return areaB - areaA;
    } catch { return 0; }
  });

  const mapSize = map.getSize();

  layers.forEach(layer => {
    const f = layer.feature;
    const iso = (f?.properties?.['ISO3166-1-Alpha-2'] || f?.properties?.iso_a2 || f?.properties?.ISO_A2 || f?.id || '').toUpperCase();
    const rawName = f?.properties?.name || '';

    // 1. Blacklist check
    if (IGNORED_LABEL_CODES.has(iso) ||
        rawName.includes('Base') ||
        rawName.includes('No Mans') ||
        rawName.includes('Dhekelia') ||
        rawName.includes('Akrotiri') ||
        rawName.includes('Baykonur')) {
      return;
    }

    const c = findCountry(f);
    if (!c) return;
    const countryName = getCountryDisplayName(c);
    if (!countryName) return;

    try {
      // Get mainland polygon info (eliminates overseas islands like Curacao on Netherlands)
      const mainland = getMainlandInfo(f);
      if (!mainland || mainland.area <= 0) return;

      // Project mainland bounding box to screen pixels
      const nw = map.latLngToContainerPoint([mainland.bbox.maxLat, mainland.bbox.minLng]);
      const se = map.latLngToContainerPoint([mainland.bbox.minLat, mainland.bbox.maxLng]);
      const pixelWidth = Math.abs(se.x - nw.x);
      const pixelHeight = Math.abs(se.y - nw.y);

      // Strict minimum pixel size: country must have ample screen space
      if (pixelWidth < 52 || pixelHeight < 28) {
        return;
      }

      const textLen = countryName.length;

      // Calculate font size strictly proportionate to country's mainland size
      const maxFontByWidth = Math.floor(pixelWidth / (textLen * 1.55));
      const maxFontByHeight = Math.floor(pixelHeight / 2.6);
      let fontSize = Math.min(15, Math.min(maxFontByWidth, maxFontByHeight));

      // If font size is under 10px to fit inside country, HIDE IT until user zooms in!
      if (fontSize < 10) {
        return;
      }

      // Measure actual rendered text width
      const actualTextWidth = measureTextWidth(countryName, fontSize);
      const letterSpacingExtra = textLen * fontSize * 0.12;
      const totalTextWidth = actualTextWidth + letterSpacingExtra;

      // Strict boundary enforcement: text must fit comfortably within 68% of country width & 55% of height
      if (totalTextWidth > pixelWidth * 0.68 || (fontSize + 6) > pixelHeight * 0.55) {
        return;
      }

      // Visual center point on screen
      const visualCenter = COUNTRY_LABEL_OFFSETS[c.code] ? L.latLng(COUNTRY_LABEL_OFFSETS[c.code]) : L.latLng(mainland.cy, mainland.cx);
      const centerPt = map.latLngToContainerPoint(visualCenter);

      // Generous buffer (500px outside screen) so half-visible countries have their labels ready
      const halfW = totalTextWidth / 2 + 5;
      const halfH = fontSize / 2 + 4;
      const vpBuffer = 500;
      if (centerPt.x < -vpBuffer || centerPt.x > mapSize.x + vpBuffer ||
          centerPt.y < -vpBuffer || centerPt.y > mapSize.y + vpBuffer) {
        return;
      }

      // Build collision box
      const box = {
        x1: centerPt.x - halfW - 4,
        y1: centerPt.y - halfH - 3,
        x2: centerPt.x + halfW + 4,
        y2: centerPt.y + halfH + 3
      };

      // 2. Collision Detection
      const collides = placedBoxes.some(p => (
        box.x1 < p.x2 && box.x2 > p.x1 &&
        box.y1 < p.y2 && box.y2 > p.y1
      ));
      if (collides) return;

      placedBoxes.push(box);

      // Render label centered at visual centroid with active theme styling
      const renderWidth = Math.ceil(totalTextWidth) + 4;
      const renderHeight = fontSize + 4;

      const icon = L.divIcon({
        className: 'country-watermark-wrap',
        html: `<div class="country-tattoo" style="width:${renderWidth}px;font-size:${fontSize}px;color:${themeCfg.labelColor};text-shadow:${themeCfg.labelShadow};">${countryName}</div>`,
        iconSize: [renderWidth, renderHeight],
        iconAnchor: [renderWidth / 2, renderHeight / 2]
      });

      L.marker(visualCenter, { icon, interactive: false, pane: 'labelsPane' }).addTo(countryLabelsLayer);
    } catch (e) {}
  });
}

// ─── Level 2 & Level 3 Region Coordinators ─────────────────────────────────────
async function onViewChange() {
  if (!map) return;
  const zoom = map.getZoom();

  // ── Turkey Level 2 (81 Provinces) ──────────────────────────────────────────
  if (isTurkeyInView()) {
    if (zoom >= REGION_ZOOM && turkeyLayer && !map.hasLayer(turkeyLayer)) {
      turkeyLayer.addTo(map);
      if (countriesLayer) {
        countriesLayer.eachLayer(l => {
          if (findCountry(l.feature)?.code === 'TR') l.setStyle(countryStyle(findCountry(l.feature)));
        });
      }
    } else if (zoom < REGION_ZOOM && turkeyLayer && map.hasLayer(turkeyLayer)) {
      map.removeLayer(turkeyLayer);
      if (countriesLayer) {
        countriesLayer.eachLayer(l => {
          if (findCountry(l.feature)?.code === 'TR') l.setStyle(countryStyle(findCountry(l.feature)));
        });
      }
    }
  }

  // ── World region layers (Level 2) ──────────────────────────────────────────
  if (zoom >= REGION_ZOOM) {
    const visibleCodes = getVisibleCountries();
    for (const code of visibleCodes) {
      if (code !== 'TR') {
        if (!regionLayers[code]) {
          await loadRegionData(code);
        } else if (!map.hasLayer(regionLayers[code])) {
          regionLayers[code].addTo(map);
          if (countriesLayer) {
            countriesLayer.eachLayer(l => {
              if (findCountry(l.feature)?.code === code) l.setStyle(countryStyle(findCountry(l.feature)));
            });
          }
        }
      }
    }
  } else {
    // ZOOM OUT — remove ALL region layers from map
    Object.entries(regionLayers).forEach(([code, layer]) => {
      if (layer && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
    if (countriesLayer) {
      countriesLayer.eachLayer(l => l.setStyle(countryStyle(findCountry(l.feature))));
    }
  }

  // ── World subregion layers (Level 3) ──────────────────────────────────────
  if (zoom >= SUBREGION_ZOOM) {
    const visibleCodes = getVisibleCountries();
    for (const code of visibleCodes) {
      if (code !== 'TR') {
        if (!subregionLayers[code]) {
          await loadSubregionData(code);
        } else if (!map.hasLayer(subregionLayers[code])) {
          subregionLayers[code].addTo(map);
          refreshRegionLayer(code);
        }
      }
    }
  } else {
    // ZOOM OUT — remove ALL subregion layers from map
    Object.entries(subregionLayers).forEach(([code, layer]) => {
      if (layer && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
    if (zoom >= REGION_ZOOM) {
      Object.keys(regionLayers).forEach(code => refreshRegionLayer(code));
    }
  }
}

function getVisibleCountries() {
  if (!countriesLayer || !map) return [];
  const bounds = map.getBounds().pad(1.0); // 100% padding around screen for seamless preloading
  const visible = [];
  countriesLayer.eachLayer(layer => {
    if (layer.getBounds && bounds.intersects(layer.getBounds())) {
      const c = findCountry(layer.feature);
      if (c) visible.push(c.code);
    }
  });
  return visible;
}

function isTurkeyInView() {
  if (!map) return false;
  const turkeyBounds = L.latLngBounds([[35.8, 25.6], [42.2, 44.8]]);
  return map.getBounds().intersects(turkeyBounds);
}

// ─── Load World Region Data ───────────────────────────────────────────────────
async function loadRegionData(code) {
  if (regionCache[code] === null) return;
  if (regionCache[code]) {
    attachRegionLayer(code, regionCache[code]);
    return;
  }

  try {
    const r = await fetch(`/data/regions/${code}.json`);
    if (!r.ok) { regionCache[code] = null; return; }
    const data = await r.json();
    regionCache[code] = data;
    attachRegionLayer(code, data);
  } catch {
    regionCache[code] = null;
  }
}

function attachRegionLayer(code, data) {
  if (regionLayers[code] || !map) return;
  const c = WORLD_COUNTRIES.find(x => x.code === code);
  const flag = c ? c.flag : '';

  const sortedFeatures = [...data.features].sort((a, b) => {
    try {
      const areaA = (a.geometry?.coordinates?.[0]?.length || 1);
      const areaB = (b.geometry?.coordinates?.[0]?.length || 1);
      return areaB - areaA;
    } catch { return 0; }
  });

  const sortedData = { ...data, features: sortedFeatures };

  const layer = L.geoJSON(sortedData, {
    renderer: mapRenderer,
    pane: 'statesPane',
    style: f => regionStyle(f.properties?.name || f.properties?.NAME_1, code),
    onEachFeature: (f, l) => {
      const raw = f.properties?.name || f.properties?.NAME_1 || 'Bölge';
      const display = getLocalizedName(raw, code);

      l.bindTooltip(`<span>${flag} ${display}</span>`, {
        direction: 'top', offset: [0, -10], className: 'clean-hover-tooltip',
        sticky: true, permanent: false
      });

      l.on('click', e => {
        L.DomEvent.stopPropagation(e);
        selectedCountryCode = code;
        selectedRegionName = raw;
        refreshStats();
        openStatusPopup(e.latlng, `${code}::${raw}`, `${getFlagHtml(code)} ${display}`, 'region', code);
      });
    }
  });

  regionLayers[code] = layer;
  if (map.getZoom() >= REGION_ZOOM) {
    layer.addTo(map);
    if (countriesLayer) {
      countriesLayer.eachLayer(l => {
        if (findCountry(l.feature)?.code === code) l.setStyle(countryStyle(findCountry(l.feature)));
      });
    }
  }
}

function refreshRegionLayer(code) {
  regionLayers[code]?.eachLayer(l => {
    const raw = l.feature?.properties?.name || l.feature?.properties?.NAME_1;
    const style = regionStyle(raw, code);
    l.setStyle(style);
    
    const { worldVisits } = getStorageData();
    const status = ns(worldVisits[`${code}::${raw}`]?.status);
    if (status !== 'unvisited' && l.bringToFront) l.bringToFront();

    if (l._path) {
      if (style.interactive === false) {
        l._path.style.pointerEvents = 'none';
      } else {
        l._path.style.pointerEvents = 'visiblePainted';
      }
    }
  });
}

// ─── Load World Subregion Data ────────────────────────────────────────────────
async function loadSubregionData(code) {
  if (subregionCache[code] === null) return;
  if (subregionCache[code]) {
    attachSubregionLayer(code, subregionCache[code]);
    return;
  }

  try {
    const r = await fetch(`/data/subregions/${code}.json`);
    if (!r.ok) { subregionCache[code] = null; return; }
    const data = await r.json();
    subregionCache[code] = data;
    attachSubregionLayer(code, data);
  } catch {
    subregionCache[code] = null;
  }
}

function attachSubregionLayer(code, data) {
  if (subregionLayers[code] || !map) return;
  const c = WORLD_COUNTRIES.find(x => x.code === code);
  const flag = c ? c.flag : '';

  const sortedFeatures = [...data.features].sort((a, b) => {
    try {
      const areaA = (a.geometry?.coordinates?.[0]?.length || 1);
      const areaB = (b.geometry?.coordinates?.[0]?.length || 1);
      return areaB - areaA;
    } catch { return 0; }
  });

  const sortedData = { ...data, features: sortedFeatures };

  const layer = L.geoJSON(sortedData, {
    renderer: mapRenderer,
    pane: 'citiesPane',
    style: f => subregionStyle(f.properties?.name, code),
    onEachFeature: (f, l) => {
      const raw = f.properties?.name || 'Şehir';
      const display = getLocalizedName(raw, code);

      l.bindTooltip(`<span>${flag} ${display}</span>`, {
        direction: 'top', offset: [0, -10], className: 'clean-hover-tooltip',
        sticky: true, permanent: false
      });
      l.on('click', e => {
        L.DomEvent.stopPropagation(e);
        selectedCountryCode = code;
        refreshStats();
        openStatusPopup(e.latlng, `${code}::${raw}`, `${getFlagHtml(code)} ${display}`, 'subregion', code);
      });
    }
  });

  subregionLayers[code] = layer;
  if (map.getZoom() >= SUBREGION_ZOOM) {
    layer.addTo(map);
    refreshRegionLayer(code);
  }
}

function refreshSubregionLayer(code) {
  subregionLayers[code]?.eachLayer(l => {
    l.setStyle(subregionStyle(l.feature?.properties?.name, code));
  });
}

// ─── Status Popup & Two-Way Sync Logic ─────────────────────────────────────────
// ─── Status Popup & Two-Way Sync Logic (Clean Centered Popup with Glow Buttons) ───
function openStatusPopup(latlng, id, title, type, countryCode) {
  const currentLang = getLanguage();
  const STATUS = getStatusConfig();
  const { turkeyVisits, worldVisits } = getStorageData();

  let currentStatus = 'unvisited';
  if (type === 'province') {
    const num = id.replace('TR::', '');
    currentStatus = ns(turkeyVisits[num]?.status);
  } else {
    currentStatus = ns(worldVisits[id]?.status);
  }

  const content = document.createElement('div');
  content.className = 'map-status-popup';
  content.innerHTML = `
    <div class="map-status-popup-title">${title}</div>
    <div class="map-status-popup-buttons">
      ${Object.entries(STATUS).map(([val, cfg]) => {
        const isAct = currentStatus === val;
        const textLabel = t(val);
        return `
          <button type="button" class="map-status-btn ${isAct ? 'active' : ''}"
                  data-val="${val}" style="--btn-color:${cfg.color};">
            <span class="map-status-dot" style="${val === 'unvisited' ? 'background:transparent;border:2px solid ' + cfg.color + ';box-shadow:none;' : 'background:' + cfg.color + ';box-shadow:0 0 10px ' + cfg.color + 'bb;'}"></span>
            <span class="map-status-text">${textLabel}</span>
          </button>
        `;
      }).join('')}
    </div>
  `;

  content.querySelectorAll('.map-status-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const val = btn.dataset.val;

      if (type === 'province') {
        const num = id.replace('TR::', '');
        saveTurkeyVisit(num, val);

        // ── Two-Way Sync for Turkey ──
        if (val === 'visited') {
          saveWorldVisit('TR', 'visited', { notes: 'Auto-marked' });
        } else if (val === 'unvisited') {
          const data = getStorageData();
          const hasAnyVisited = Object.values(data.turkeyVisits).some(v => v.status === 'visited');
          if (!hasAnyVisited) {
            saveWorldVisit('TR', 'unvisited');
          }
        }
      } else if (type === 'country') {
        saveWorldVisit(id, val);

        // ── Downward Clearing: Unvisiting country unvisits all its children ──
        if (val === 'unvisited') {
          if (id === 'TR') {
            const data = getStorageData();
            Object.keys(data.turkeyVisits).forEach(pid => saveTurkeyVisit(pid, 'unvisited'));
          } else {
            const data = getStorageData();
            const prefix = `${id}::`;
            Object.keys(data.worldVisits).forEach(k => {
              if (k.startsWith(prefix)) saveWorldVisit(k, 'unvisited');
            });
          }
        }
      } else if (type === 'region' || type === 'subregion') {
        saveWorldVisit(id, val);

        // ── Two-Way Sync for World Regions / Subregions ──
        if (countryCode) {
          if (val === 'visited') {
            saveWorldVisit(countryCode, 'visited', { notes: 'Auto-marked' });
          } else if (val === 'unvisited') {
            const data = getStorageData();
            const prefix = `${countryCode}::`;
            const hasAnyVisited = Object.entries(data.worldVisits).some(([k, v]) => k.startsWith(prefix) && v.status === 'visited');
            if (!hasAnyVisited) {
              saveWorldVisit(countryCode, 'unvisited');
            }
          }
        }
      }

      map.closePopup();
      refreshAllStyles();
      refreshStats();
    });
  });

  L.popup({
    closeButton: false,
    className: 'clean-status-popup',
    offset: [0, -10],
    maxWidth: 240
  })
  .setLatLng(latlng)
  .setContent(content)
  .openOn(map);
}


function countryStyle(c) {
  const { worldVisits, turkeyVisits } = getStorageData();
  let rawStatus = worldVisits[c?.code]?.status;

  // If Turkey has any visited province, treat Turkey as visited
  if (c?.code === 'TR' && !rawStatus) {
    if (Object.values(turkeyVisits).some(v => v.status === 'visited')) rawStatus = 'visited';
  }
  // If country has any visited province/subregion in worldVisits, treat country as visited
  if (c?.code && !rawStatus) {
    const prefix = `${c.code}::`;
    if (Object.entries(worldVisits).some(([k, v]) => k.startsWith(prefix) && v.status === 'visited')) {
      rawStatus = 'visited';
    }
  }

  const status = ns(rawStatus);
  const zoom = map?.getZoom() || 3;
  const STATUS = getStatusConfig();
  const cfg = STATUS[status];
  const themeCfg = getThemeConfig();
  const zoomed = zoom >= REGION_ZOOM;

  let isInteractive = true;
  let hasRegions = false;
  if (zoomed) {
    const hasRegionLayer = regionLayers[c?.code] && map.hasLayer(regionLayers[c?.code]);
    const hasTurkeyLayer = c?.code === 'TR' && turkeyLayer && map.hasLayer(turkeyLayer);
    if (hasRegionLayer || hasTurkeyLayer) {
      isInteractive = false;
      hasRegions = true;
    }
  }

  // When region layer is active: country polygon becomes a ghost (only border shows)
  const fillOpacity = hasRegions
    ? 0.01
    : (status === 'unvisited' ? 0.95 : cfg.fillOpacity);

  return {
    fillColor: status === 'unvisited' ? themeCfg.landFill : cfg.color,
    fillOpacity,
    color: zoomed
      ? (status === 'unvisited' ? themeCfg.landBorderZoomed : '#ffffff')
      : (status === 'unvisited' ? themeCfg.landBorder : 'rgba(255,255,255,0.7)'),
    weight: zoomed ? 2.5 : 1.5,
    opacity: 1.0,
    interactive: isInteractive
  };
}

function regionStyle(rawName, countryCode) {
  const { worldVisits } = getStorageData();
  const key = `${countryCode}::${rawName}`;
  const status = ns(worldVisits[key]?.status);
  const countryStatus = ns(worldVisits[countryCode]?.status);
  const STATUS = getStatusConfig();
  const cfg = STATUS[status];
  const themeCfg = getThemeConfig();

  let isInteractive = true;
  let hasSubregions = false;
  if (subregionLayers[countryCode] && map && map.hasLayer(subregionLayers[countryCode])) {
    isInteractive = false;
    hasSubregions = true;
  }

  if (status !== 'unvisited') {
    return { fillColor: cfg.color, fillOpacity: hasSubregions ? 0.01 : cfg.fillOpacity, color: '#ffffff', weight: 1.5, opacity: 1, interactive: isInteractive };
  }

  const tintMap = { visited: getStatusColor('visited'), planned: getStatusColor('planned'), wishlist: getStatusColor('wishlist') };
  const tint = tintMap[countryStatus];
  if (tint) return { fillColor: tint, fillOpacity: hasSubregions ? 0.01 : 0.22, color: themeCfg.landBorder, weight: 1.2, opacity: 0.8, interactive: isInteractive };

  return { fillColor: '#ffffff', fillOpacity: 0.01, color: themeCfg.landBorder, weight: 1.0, opacity: hasSubregions ? 0.3 : 0.7, interactive: isInteractive };
}

function provinceStyle(provinceId) {
  const { turkeyVisits, worldVisits } = getStorageData();
  const status = ns(turkeyVisits[provinceId]?.status);
  const trStatus = ns(
    worldVisits['TR']?.status ||
    (Object.values(turkeyVisits).some(v => v.status === 'visited') ? 'visited' : 'unvisited')
  );
  const STATUS = getStatusConfig();
  const cfg = STATUS[status];
  const themeCfg = getThemeConfig();

  if (status !== 'unvisited') {
    return { fillColor: cfg.color, fillOpacity: cfg.fillOpacity, color: '#ffffff', weight: 1.2, opacity: 1 };
  }
  
  const tintMap = { visited: getStatusColor('visited'), planned: getStatusColor('planned'), wishlist: getStatusColor('wishlist') };
  const tint = tintMap[trStatus];
  if (tint) return { fillColor: tint, fillOpacity: 0.22, color: themeCfg.landBorderZoomed, weight: 1.0, opacity: 0.8 };

  return { fillColor: '#ffffff', fillOpacity: 0.01, color: themeCfg.landBorderZoomed, weight: 1.0, opacity: 0.8 };
}

function subregionStyle(name, code) {
  const { worldVisits } = getStorageData();
  const key = `${code}::${name}`;
  const status = ns(worldVisits[key]?.status);
  const countryStatus = ns(worldVisits[code]?.status);
  const STATUS = getStatusConfig();
  const cfg = STATUS[status];
  const themeCfg = getThemeConfig();
  
  if (status !== 'unvisited') {
    return { fillColor: cfg.color, fillOpacity: cfg.fillOpacity, color: '#ffffff', weight: 1.2, opacity: 1 };
  }

  // Ülke ziyaret edildiyse, alt şehirler 2. katmandaki gibi hafif sıcak turuncu tonda (0.22) kalsın:
  const tintMap = { visited: getStatusColor('visited'), planned: getStatusColor('planned'), wishlist: getStatusColor('wishlist') };
  const tint = tintMap[countryStatus];
  if (tint) {
    return { fillColor: tint, fillOpacity: 0.22, color: themeCfg.landBorderZoomed, weight: 1.0, opacity: 0.8 };
  }

  // Ziyaret edilmemiş ülke alt şehirleri: koyu/şeffaf
  return { fillColor: '#ffffff', fillOpacity: 0.01, color: themeCfg.landBorder, weight: 0.7, opacity: 0.6 };
}

// ─── Country Finder Helper ─────────────────────────────────────────────────────
function findCountry(f) {
  if (!f) return null;
  const iso2 = (f.properties?.['ISO3166-1-Alpha-2'] || f.properties?.iso_a2 || f.properties?.ISO_A2 || f.id || '').toUpperCase();
  const name = f.properties?.name || '';
  if (iso2 && iso2 !== '-99' && iso2 !== 'UU') {
    const found = WORLD_COUNTRIES.find(c => c.code === iso2);
    if (found) return found;
  }
  return WORLD_COUNTRIES.find(c =>
    (c.name && c.name.toLowerCase() === name.toLowerCase()) ||
    (c.nameEn && c.nameEn.toLowerCase() === name.toLowerCase())
  ) || null;
}

// ─── Stats Refresh ─────────────────────────────────────────────────────────────
function refreshStats() {
  const cEl = document.getElementById('stats-countries');
  const rEl = document.getElementById('stats-regions');
  if (!cEl) return;

  const { turkeyVisits, worldVisits, worldCities } = getStorageData();

  // Turkey province visited count
  const trVisited = Object.values(turkeyVisits).filter(v => v.status === 'visited').length;

  // World countries visited count
  const worldCodes = Object.keys(worldVisits).filter(k => !k.includes('::') && worldVisits[k]?.status === 'visited');
  if (trVisited > 0 && !worldCodes.includes('TR')) worldCodes.push('TR');
  const worldCount = worldCodes.length;

  const visitedColor = getStatusColor('visited');

  cEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;">
      <span style="font-size:1.6rem;">🌍</span>
      <div>
        <div class="stats-number" style="color:${visitedColor};">${worldCount}</div>
        <div class="stats-label">${t('countriesVisited')}</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:12px;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08);">
      <span style="font-size:0.95rem;font-weight:800;color:var(--theme-text-muted, #94a3b8);">TR</span>
      <div>
        <div class="stats-number" style="color:${visitedColor};">${trVisited}<span style="font-size:0.85rem;color:var(--theme-text-muted, #64748b);">/81</span></div>
        <div class="stats-label">${t('provincesVisited')}</div>
      </div>
    </div>
  `;

  if (selectedCountryCode && selectedCountryCode !== 'TR' && rEl) {
    const c = WORLD_COUNTRIES.find(x => x.code === selectedCountryCode);
    if (c) {
      const prefix = `${selectedCountryCode}::`;
      const regVisited = Object.entries(worldVisits).filter(([k, v]) => k.startsWith(prefix) && v.status === 'visited').length;
      const totalReg = regionCache[selectedCountryCode]?.features?.length || 0;

      rEl.style.display = 'block';
      rEl.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div>
            <div style="font-size:0.85rem;font-weight:700;color:var(--theme-text-main, #f8fafc);">${c.flag} ${getCountryDisplayName(c)}</div>
            <div class="stats-label">${c.continent}</div>
          </div>
          <div style="text-align:right;">
            <div class="stats-number" style="color:#3b82f6;">${regVisited}${totalReg > 0 ? `<span style="font-size:0.85rem;color:var(--theme-text-muted, #64748b);">/${totalReg}</span>` : ''}</div>
            <div class="stats-label">${t('citiesVisited')}</div>
          </div>
        </div>
      `;
    }
  } else if (rEl) {
    rEl.style.display = 'none';
  }
}
