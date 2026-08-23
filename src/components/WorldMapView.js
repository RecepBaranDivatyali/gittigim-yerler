import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getStorageData, saveWorldVisit, saveTurkeyVisit, resetTravelData, onStateChange } from '../utils/storage.js';
import { TURKEY_PROVINCES, TURKEY_REGIONS } from '../data/turkeyData.js';
import { WORLD_COUNTRIES, WORLD_CONTINENTS } from '../data/worldData.js';
import { bbox as turfBbox } from '@turf/bbox';
import { t, getLanguage, setLanguage, getCountryDisplayName, onLanguageChange, getLocalizedName } from '../utils/i18n.js';
import { THEMES, getTheme, setTheme, onThemeChange, getThemeConfig, applyTheme, getStatusColor } from '../utils/theme.js';

const REGION_ZOOM = 5.2;
const SUBREGION_ZOOM = 7.5;

function getStatusConfig() {
  const themeCfg = getThemeConfig();
  return {
    visited:   { label: '🟢 ' + t('visited'),   color: getStatusColor('visited'),  fillOpacity: 0.90 },
    planned:   { label: '🟡 ' + t('planned'),   color: getStatusColor('planned'),  fillOpacity: 0.85 },
    wishlist:  { label: '🟣 ' + t('wishlist'),  color: getStatusColor('wishlist'), fillOpacity: 0.80 },
    unvisited: { label: '⚫ ' + t('unvisited'), color: themeCfg.landFill,          fillOpacity: 0.95 },
  };
}

function ns(s) {
  if (s === 'target') return 'planned';
  const cfg = getStatusConfig();
  return cfg[s] ? s : 'unvisited';
}

// ─── Module state ──────────────────────────────────────────────────────────
let map = null;
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
  // Apply active theme to document root
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

        <!-- Floating Top-Right Controls Bar (Lang, Theme, Legend) -->
        <div id="map-legend" class="floating-legend">
          <!-- Quick Action Bar -->
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:6px;">
            <button id="btn-lang-toggle" title="${t('language')}" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:var(--theme-text-main, #f8fafc);padding:4px 8px;font-size:0.75rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px;">
              <span>🌐</span> <span>${currentLang.toUpperCase()}</span>
            </button>

            <button id="btn-theme-toggle" title="${t('theme')}" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:var(--theme-text-main, #f8fafc);padding:4px 8px;font-size:0.75rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px;">
              <span>${themeCfg.icon}</span> <span>${currentLang === 'tr' ? themeCfg.name : themeCfg.nameEn}</span>
            </button>
          </div>

          <div class="legend-items-list">
            ${Object.entries(STATUS).filter(([k]) => k !== 'unvisited').map(([, v]) =>
              `<span class="legend-item"><span class="legend-dot" style="background:${v.color};"></span>${v.label.replace(/^.+? /, '')}</span>`
            ).join('')}
            <span class="legend-item"><span class="legend-dot" style="background:${getStatusColor('visited')}38;border:1px solid ${getStatusColor('visited')};"></span>${t('unvisited')}</span>
          </div>
        </div>

        <!-- Stats overlay (bottom-left) -->
        <div id="stats-overlay">
          <div id="stats-countries" class="stats-chip"></div>
          <div id="stats-regions" class="stats-chip stats-chip-region" style="display:none;"></div>
        </div>

        <!-- Floating Feedback Button (bottom-right) -->
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
    const langBtn = container.querySelector('#btn-lang-toggle');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        const nextLang = getLanguage() === 'tr' ? 'en' : 'tr';
        setLanguage(nextLang);
      });
    }

    const themeBtn = container.querySelector('#btn-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const current = getTheme();
        const nextTheme = current === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
      });
    }

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

  // Listen to language changes
  onLanguageChange(() => {
    container.innerHTML = getHtml();
    if (map) {
      const el = container.querySelector('#leaflet-map');
      if (el) {
        // Reattach Leaflet container
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

  // Listen to theme & custom color changes
  onThemeChange((newTheme) => {
    const cfg = getThemeConfig(newTheme);
    const rootEl = container.querySelector('#map-root');
    if (rootEl) rootEl.style.backgroundColor = cfg.oceanBg;
    const mapEl = container.querySelector('#leaflet-map');
    if (mapEl) mapEl.style.backgroundColor = cfg.oceanBg;
    if (map) {
      const mc = map.getContainer();
      if (mc) mc.style.backgroundColor = cfg.oceanBg;
    }
    
    // Update theme toggle button label
    const themeBtn = container.querySelector('#btn-theme-toggle');
    if (themeBtn) {
      themeBtn.innerHTML = `<span>${cfg.icon}</span> <span>${getLanguage() === 'tr' ? cfg.name : cfg.nameEn}</span>`;
    }

    refreshAllStyles();
    scheduleLabelUpdate();
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

  // Create custom panes for strict, predictable layering:
  // Level 1: countriesPane (z-index 410)
  // Level 2: statesPane    (z-index 420)
  // Level 3: citiesPane    (z-index 430)
  // Level 4: labelsPane    (z-index 450)
  const countriesPane = map.createPane('countriesPane');
  countriesPane.style.zIndex = 410;

  const statesPane = map.createPane('statesPane');
  statesPane.style.zIndex = 420;

  const citiesPane = map.createPane('citiesPane');
  citiesPane.style.zIndex = 430;

  const labelsPane = map.createPane('labelsPane');
  labelsPane.style.zIndex = 450;
  labelsPane.style.pointerEvents = 'none';

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  loadCountries(container);

  map.on('zoomend', () => {
    scheduleViewChange();
    scheduleLabelUpdate();
  });

  map.on('moveend', () => {
    scheduleViewChange();
    scheduleLabelUpdate();
  });
}

// ─── Debounced Zoom / Move Handlers ──────────────────────────────────────────
let viewChangeTimer = null;
function scheduleViewChange() {
  if (viewChangeTimer) clearTimeout(viewChangeTimer);
  viewChangeTimer = setTimeout(() => {
    onViewChange();
  }, 100);
}

let labelUpdateTimer = null;
function scheduleLabelUpdate() {
  if (labelUpdateTimer) clearTimeout(labelUpdateTimer);
  labelUpdateTimer = setTimeout(() => {
    updateCountryLabels();
  }, 80);
}

// ─── Level 1: Load World Countries GeoJSON ─────────────────────────────────────
async function loadCountries(container) {
  try {
    const res = await fetch('/data/world-countries.json');
    if (!res.ok) throw new Error('world-countries.json not found');
    const data = await res.json();

    const loadingEl = container.querySelector('#map-loading');
    if (loadingEl) loadingEl.style.display = 'none';

    // Sort countries descending by bounding box area (largest countries in background)
    const sortedFeatures = [...data.features].sort((a, b) => {
      try {
        const bboxA = turfBbox(a);
        const bboxB = turfBbox(b);
        const areaA = (bboxA[2] - bboxA[0]) * (bboxA[3] - bboxA[1]);
        const areaB = (bboxB[2] - bboxB[0]) * (bboxB[3] - bboxB[1]);
        return areaB - areaA;
      } catch { return 0; }
    });

    const sortedData = { ...data, features: sortedFeatures };

    countriesLayer = L.geoJSON(sortedData, {
      pane: 'countriesPane',
      style: f => countryStyle(findCountry(f)),
      onEachFeature: (f, l) => {
        const c = findCountry(f);
        if (!c) return;

        l.on('click', e => {
          L.DomEvent.stopPropagation(e);
          // If zoomed into region level and this country has active region layers, let region handle it
          const zoom = map?.getZoom() || 3;
          if (zoom >= REGION_ZOOM) {
            if (c.code === 'TR' && turkeyLayer && map.hasLayer(turkeyLayer)) return;
            if (regionLayers[c.code] && map.hasLayer(regionLayers[c.code])) return;
          }
          selectedCountryCode = c.code;
          selectedRegionName = null;
          refreshStats();
          openStatusPopup(e.latlng, c.code, `${c.flag} ${getCountryDisplayName(c)}`, 'country', c.code);
        });
      }
    }).addTo(map);

    // Initial label calculation
    updateCountryLabels();

    // Trigger initial view check
    onViewChange();
    refreshStats();

  } catch (err) {
    console.error('Failed to load world map:', err);
    const loadingEl = container.querySelector('#map-loading');
    if (loadingEl) {
      loadingEl.innerHTML = `<div style="color:#ef4444;font-size:0.9rem;">⚠️ ${t('loadError')}</div>`;
    }
  }
}

// ─── Watermark Labels Layer ───────────────────────────────────────────────────
function updateCountryLabels() {
  if (!map || !countriesLayer) return;

  if (!countryLabelsLayer) {
    countryLabelsLayer = L.layerGroup([], { pane: 'labelsPane' }).addTo(map);
  } else {
    countryLabelsLayer.clearLayers();
  }

  const zoom = map.getZoom();
  const themeCfg = getThemeConfig();

  // Hide country watermark labels when zoomed in deep into regions
  if (zoom > 6.5) return;

  const mapBounds = map.getBounds();
  const mapCenter = map.getCenter();

  // Generous 500px viewport buffer for zero pop-in
  const mapSize = map.getSize();
  const halfW = mapSize.x / 2 + 500;
  const halfH = mapSize.y / 2 + 500;

  WORLD_COUNTRIES.forEach(c => {
    if (!c.latlng) return;
    const latlng = L.latLng(c.latlng[0], c.latlng[1]);

    const pt = map.latLngToContainerPoint(latlng);
    const centerPt = map.latLngToContainerPoint(mapCenter);
    const dx = Math.abs(pt.x - centerPt.x);
    const dy = Math.abs(pt.y - centerPt.y);
    if (dx > halfW || dy > halfH) return;

    let fontSize = 11;
    if (zoom === 2) fontSize = 8;
    else if (zoom === 3) fontSize = 9.5;
    else if (zoom === 4) fontSize = 11;
    else if (zoom === 5) fontSize = 12.5;
    else if (zoom === 6) fontSize = 14;

    const displayName = getCountryDisplayName(c);

    const icon = L.divIcon({
      className: 'country-label-marker',
      html: `<div style="
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        font-size: ${fontSize}px;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: ${themeCfg.labelColor};
        text-shadow: ${themeCfg.labelShadow};
        white-space: nowrap;
        pointer-events: none;
        user-select: none;
        transform: translate(-50%, -50%);
      ">${displayName}</div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    const marker = L.marker(latlng, { icon, interactive: false, pane: 'labelsPane' });
    countryLabelsLayer.addLayer(marker);
  });
}

// ─── View Change Coordinator (Dynamic Lazy-loading & Level Switching) ─────────
async function onViewChange() {
  if (!map) return;
  const zoom = map.getZoom();

  // ── Turkey Level 2 (81 Provinces) ──────────────────────────────────────────
  if (isTurkeyInView()) {
    if (zoom >= REGION_ZOOM && !turkeyLayer) {
      await loadTurkeyProvinces();
    } else if (zoom >= REGION_ZOOM && turkeyLayer && !map.hasLayer(turkeyLayer)) {
      turkeyLayer.addTo(map);
      // Re-fade Turkey country polygon now provinces are visible
      if (countriesLayer) {
        countriesLayer.eachLayer(l => {
          if (findCountry(l.feature)?.code === 'TR') l.setStyle(countryStyle(findCountry(l.feature)));
        });
      }
    } else if (zoom < REGION_ZOOM && map.hasLayer(turkeyLayer)) {
      map.removeLayer(turkeyLayer);
      // Restore Turkey country polygon opacity
      if (countriesLayer) {
        countriesLayer.eachLayer(l => {
          if (findCountry(l.feature)?.code === 'TR') l.setStyle(countryStyle(findCountry(l.feature)));
        });
      }
    }
  }

  // ── World region layers: add when zoomed in, REMOVE when zoomed out ────────
  if (zoom >= REGION_ZOOM) {
    const visibleCodes = getVisibleCountries();
    for (const code of visibleCodes) {
      if (code !== 'TR') {
        if (!regionLayers[code]) {
          await loadRegionData(code);
        } else if (!map.hasLayer(regionLayers[code])) {
          regionLayers[code].addTo(map);
          // Re-fade country polygon now regions are visible
          if (countriesLayer) {
            countriesLayer.eachLayer(l => {
              if (findCountry(l.feature)?.code === code) l.setStyle(countryStyle(findCountry(l.feature)));
            });
          }
        }
      }
    }
  } else {
    // ZOOM OUT — remove ALL region layers from map (keep cache)
    Object.entries(regionLayers).forEach(([code, layer]) => {
      if (layer && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
    // Restore full opacity on all country polygons
    if (countriesLayer) {
      countriesLayer.eachLayer(l => l.setStyle(countryStyle(findCountry(l.feature))));
    }
  }

  // ── World subregion layers: add when zoomed in, REMOVE when zoomed out ────
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
    // ZOOM OUT — remove ALL subregion layers from map (keep cache)
    Object.entries(subregionLayers).forEach(([code, layer]) => {
      if (layer && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
    // Restore region layers' interactivity (they were blocked by subregions)
    if (zoom >= REGION_ZOOM) {
      Object.keys(regionLayers).forEach(code => refreshRegionLayer(code));
    }
  }
}

function getVisibleCountries() {
  if (!countriesLayer || !map) return [];
  const bounds = map.getBounds().pad(0.8); // 80% padding around screen to prevent blank edges during panning
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

// ─── Turkey Provinces Loader (Level 2) ─────────────────────────────────────────
async function loadTurkeyProvinces() {
  if (turkeyLayer) return;
  try {
    const res = await fetch('/data/turkey-provinces.json');
    if (!res.ok) return;
    const data = await res.json();

    turkeyLayer = L.geoJSON(data, {
      pane: 'statesPane',
      style: f => provinceStyle(f.properties?.number),
      onEachFeature: (f, l) => {
        const id = f.properties?.number;
        const name = TURKEY_PROVINCES[id]?.name || f.properties?.name || 'İl';

        l.bindTooltip(`<span>🇹🇷 ${name}</span>`, {
          direction: 'top', offset: [0, -10], className: 'clean-hover-tooltip',
          sticky: true, permanent: false
        });

        l.on('click', e => {
          L.DomEvent.stopPropagation(e);
          selectedCountryCode = 'TR';
          selectedRegionName = name;
          refreshStats();
          openStatusPopup(e.latlng, id, `🇹🇷 ${name}`, 'turkey_province');
        });
      }
    });

    if (map.getZoom() >= REGION_ZOOM) {
      turkeyLayer.addTo(map);
      if (countriesLayer) {
        countriesLayer.eachLayer(l => {
          if (findCountry(l.feature)?.code === 'TR') l.setStyle(countryStyle(findCountry(l.feature)));
        });
      }
    }
  } catch (e) {
    console.warn('Could not load Turkey provinces', e);
  }
}

// ─── World Region Data Loader (Level 2 States/Provinces) ──────────────────────
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

  // Sort region features descending by bounding box area (largest first, small enclave cities last on top)
  const sortedFeatures = [...data.features].sort((a, b) => {
    try {
      const bboxA = turfBbox(a);
      const bboxB = turfBbox(b);
      const areaA = (bboxA[2] - bboxA[0]) * (bboxA[3] - bboxA[1]);
      const areaB = (bboxB[2] - bboxB[0]) * (bboxB[3] - bboxB[1]);
      return areaB - areaA;
    } catch { return 0; }
  });

  const sortedData = { ...data, features: sortedFeatures };

  const layer = L.geoJSON(sortedData, {
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
        openStatusPopup(e.latlng, `${code}::${raw}`, `${flag} ${display}`, 'region', code);
      });
    }
  });

  regionLayers[code] = layer;
  if (map.getZoom() >= REGION_ZOOM) {
    layer.addTo(map);
    // Dim the Level 1 country polygon
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

// ─── World Subregion Data Loader (Level 3 Cities) ──────────────────────────────
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

  // Sort subregion features descending by bounding box area (largest first, small enclave cities last on top)
  const sortedFeatures = [...data.features].sort((a, b) => {
    try {
      const bboxA = turfBbox(a);
      const bboxB = turfBbox(b);
      const areaA = (bboxA[2] - bboxA[0]) * (bboxA[3] - bboxA[1]);
      const areaB = (bboxB[2] - bboxB[0]) * (bboxB[3] - bboxB[1]);
      return areaB - areaA;
    } catch { return 0; }
  });

  const sortedData = { ...data, features: sortedFeatures };

  const layer = L.geoJSON(sortedData, {
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
        openStatusPopup(e.latlng, `${code}::${raw}`, `${flag} ${display}`, 'subregion', code);
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
function openStatusPopup(latlng, id, title, type, countryCode) {
  const currentLang = getLanguage();
  const STATUS = getStatusConfig();
  const { turkeyVisits, worldVisits } = getStorageData();

  let currentStatus = 'unvisited';
  if (type === 'turkey_province') currentStatus = ns(turkeyVisits[id]?.status);
  else currentStatus = ns(worldVisits[id]?.status);

  const btnsHtml = Object.entries(STATUS).map(([key, val]) => `
    <button class="map-status-btn ${currentStatus === key ? 'active' : ''}" data-status="${key}">
      <span class="map-status-dot" style="background:${val.color};"></span>
      <span>${val.label.replace(/^.+? /, '')}</span>
    </button>
  `).join('');

  const content = `
    <div class="map-status-popup">
      <div class="map-status-popup-header">
        <span class="map-status-popup-title">${title}</span>
        <button class="map-status-popup-close">&times;</button>
      </div>
      <div class="map-status-popup-buttons">
        ${btnsHtml}
      </div>
    </div>
  `;

  const popup = L.popup({
    closeButton: false,
    className: 'clean-status-popup',
    offset: [0, -10],
    maxWidth: 260
  })
  .setLatLng(latlng)
  .setContent(content)
  .openOn(map);

  setTimeout(() => {
    const el = popup.getElement();
    if (!el) return;

    el.querySelector('.map-status-popup-close')?.addEventListener('click', () => map.closePopup());

    el.querySelectorAll('.map-status-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.status;

        if (type === 'turkey_province') {
          saveTurkeyVisit(id, val);

          // ── Two-Way Sync for Turkey ──
          if (val === 'visited') {
            saveWorldVisit('TR', 'visited', 'Auto-marked');
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
              saveWorldVisit(countryCode, 'visited', 'Auto-marked');
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
  }, 10);
}

// ─── Style Functions ──────────────────────────────────────────────────────────
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

  // Visited/planned/wishlist il → dolgu rengini göster
  if (status !== 'unvisited') {
    return { fillColor: cfg.color, fillOpacity: cfg.fillOpacity, color: '#ffffff', weight: 1.2, opacity: 1 };
  }
  
  // Türkiye işaretliyse hafif renk
  const tintMap = { visited: getStatusColor('visited'), planned: getStatusColor('planned'), wishlist: getStatusColor('wishlist') };
  const tint = tintMap[trStatus];
  if (tint) return { fillColor: tint, fillOpacity: 0.22, color: themeCfg.landBorderZoomed, weight: 1.0, opacity: 0.8 };

  // Unvisited: şeffaf dolgu + beyaz sınır çizgisi (regionStyle ile aynı davranış)
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
  const iso2 = (f.properties?.iso_a2 || f.properties?.ISO_A2 || f.id || '').toUpperCase();
  const name = f.properties?.name || '';

  return WORLD_COUNTRIES.find(c =>
    (iso2 && c.code === iso2) ||
    c.name.toLowerCase() === name.toLowerCase() ||
    c.nameTr.toLowerCase() === name.toLowerCase()
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
