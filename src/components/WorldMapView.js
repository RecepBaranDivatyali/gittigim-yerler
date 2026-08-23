import L from 'leaflet';
import { WORLD_COUNTRIES } from '../data/worldData.js';
import { TURKEY_PROVINCES } from '../data/turkeyData.js';
import { getLocalizedName, getCountryLocalizedName } from '../data/regionNames.js';
import { getStorageData, saveWorldVisit, saveTurkeyVisit, resetTravelData } from '../utils/storage.js';
import { t, getLanguage, setLanguage, onLanguageChange, getCountryDisplayName } from '../utils/i18n.js';
import { THEMES, getTheme, setTheme, onThemeChange, getThemeConfig, applyTheme } from '../utils/theme.js';

// ─── Config ───────────────────────────────────────────────────────────────────
const REGION_ZOOM = 5.2;
const SUBREGION_ZOOM = 7.5;

function getStatusConfig() {
  return {
    visited:   { label: '🟢 ' + t('visited'),   color: '#ff5722', fillOpacity: 0.90 },
    planned:   { label: '🟡 ' + t('planned'),   color: '#f59e0b', fillOpacity: 0.85 },
    wishlist:  { label: '🟣 ' + t('wishlist'),  color: '#8b5cf6', fillOpacity: 0.80 },
    unvisited: { label: '⚫ ' + t('unvisited'), color: '#1e293b', fillOpacity: 0.95 },
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

        <!-- Floating Top-Right Controls Bar (Lang, Theme, Legend, Reset) -->
        <div id="map-legend" class="floating-legend">
          <!-- Quick Action Bar -->
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:6px;">
            <button id="btn-lang-toggle" title="${t('language')}" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#f8fafc;padding:4px 8px;font-size:0.75rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px;">
              <span>🌐</span> <span>${currentLang.toUpperCase()}</span>
            </button>

            <button id="btn-theme-toggle" title="${t('theme')}" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#f8fafc;padding:4px 8px;font-size:0.75rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px;">
              <span>${themeCfg.icon}</span> <span>${currentLang === 'tr' ? themeCfg.name : themeCfg.nameEn}</span>
            </button>
          </div>

          <div class="legend-items-list">
            ${Object.entries(STATUS).filter(([k]) => k !== 'unvisited').map(([, v]) =>
              `<span class="legend-item"><span class="legend-dot" style="background:${v.color};"></span>${v.label.replace(/^.+? /, '')}</span>`
            ).join('')}
            <span class="legend-item"><span class="legend-dot" style="background:rgba(255,87,34,.22);border:1px solid #ff5722;"></span>${t('unvisited')}</span>
          </div>
          <button id="btn-reset-data" class="legend-reset-btn">${t('reset')}</button>
        </div>

        <!-- Stats overlay (bottom-left) -->
        <div id="stats-overlay">
          <div id="stats-countries" class="stats-chip"></div>
          <div id="stats-regions" class="stats-chip stats-chip-region" style="display:none;"></div>
        </div>

        <!-- Loading indicator -->
        <div id="map-loading" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:9000;pointer-events:none;">
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
    const resetBtn = container.querySelector('#btn-reset-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm(t('resetConfirm'))) {
          resetTravelData();
          countriesLayer?.eachLayer(l => {
            const c = findCountry(l.feature);
            l.setStyle(countryStyle(c));
          });
          if (turkeyLayer) {
            turkeyLayer.eachLayer(l => {
              l.setStyle(provinceStyle(l.feature?.properties?.number));
            });
          }
          Object.keys(regionLayers).forEach(code => {
            if (regionLayers[code]) {
              regionLayers[code].eachLayer(l => {
                l.setStyle(regionStyle(null));
              });
            }
          });
          refreshStats();
        }
      });
    }

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
        const themeList = ['dark', 'ocean', 'emerald', 'vintage'];
        const current = getTheme();
        const nextIdx = (themeList.indexOf(current) + 1) % themeList.length;
        setTheme(themeList[nextIdx]);
      });
    }

    const profileBtn = container.querySelector('#btn-open-profile');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        if (options.onOpenProfile) options.onOpenProfile();
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

  // Listen to theme changes
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
    center: [39, 35], zoom: 5,
    minZoom: 2, maxZoom: 12,
    zoomControl: false,
    attributionControl: false,
    tap: L.Browser.safari ? false : true,
    tapTolerance: 15
  });

  map.createPane('countriesPane');
  map.getPane('countriesPane').style.zIndex = 410;

  map.createPane('statesPane');
  map.getPane('statesPane').style.zIndex = 420;

  map.createPane('citiesPane');
  map.getPane('citiesPane').style.zIndex = 430;

  map.createPane('labelsPane');
  map.getPane('labelsPane').style.zIndex = 450;
  map.getPane('labelsPane').style.pointerEvents = 'none';

  countryLabelsLayer = L.layerGroup().addTo(map);

  el.style.backgroundColor = themeCfg.oceanBg;

  // Load World Countries — allow browser caching (14MB file)
  fetch('/data/world-countries.json').then(r => {
    if (!r.ok) throw new Error('Network ' + r.status);
    return r.json();
  }).then(data => {
    countriesLayer = L.geoJSON(data, {
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
          openStatusPopup(e.latlng, c.code, `${c.flag} ${displayName}`, 'country');
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
          openStatusPopup(e.latlng, `TR::${prov.id}`, `🇹🇷 ${prov.name}`, 'province');
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
  '-99', 'UU', 'VA', 'SM', 'MC', 'LI', 'AD', 'GI', 'MT', 'IO', 'BM', 'KY',
  'VG', 'AI', 'TC', 'MS', 'BL', 'MF', 'SX', 'CW', 'BQ', 'FK', 'GS', 'PN',
  'SH', 'CC', 'CX', 'NF', 'CK', 'NU', 'TK', 'WF', 'PF', 'NC', 'PM', 'FO', 'SJ'
]);

// ─── Hidden canvas for accurate text measurement ──────────────────────────
let _measureCtx = null;
function measureTextWidth(text, fontSize) {
  if (!_measureCtx) {
    const c = document.createElement('canvas');
    _measureCtx = c.getContext('2d');
  }
  _measureCtx.font = `800 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`;
  return _measureCtx.measureText(text.toUpperCase()).width;
}

// Proper area-weighted centroid of a polygon ring (Shoelace formula)
function polygonCentroid(ring) {
  let area = 0, cx = 0, cy = 0;
  const n = ring.length;
  for (let i = 0; i < n - 1; i++) {
    const x0 = ring[i][0], y0 = ring[i][1];
    const x1 = ring[i + 1][0], y1 = ring[i + 1][1];
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  area /= 2;
  if (Math.abs(area) < 1e-10) {
    let sx = 0, sy = 0;
    for (let i = 0; i < n; i++) { sx += ring[i][0]; sy += ring[i][1]; }
    return [sx / n, sy / n, Math.abs(area)];
  }
  cx /= (6 * area);
  cy /= (6 * area);
  return [cx, cy, Math.abs(area)];
}

// Find the visual centroid: area-weighted centroid of the largest polygon
function getVisualCenter(feature) {
  const geom = feature.geometry;
  if (!geom) return null;

  let bestCx = 0, bestCy = 0, bestArea = 0;

  function processRing(ring) {
    const [cx, cy, area] = polygonCentroid(ring);
    if (area > bestArea) {
      bestArea = area;
      bestCx = cx;
      bestCy = cy;
    }
  }

  if (geom.type === 'Polygon') {
    processRing(geom.coordinates[0]);
  } else if (geom.type === 'MultiPolygon') {
    geom.coordinates.forEach(poly => processRing(poly[0]));
  }

  if (bestArea === 0) return null;
  return L.latLng(bestCy, bestCx);
}

// Debounce timer for label updates during zoom/pan
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
  const vpPadding = 20;

  layers.forEach(layer => {
    const f = layer.feature;
    const iso = f?.properties?.iso_a2 || f?.properties?.ISO_A2 || f?.id || '';
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
      const bounds = layer.getBounds();
      const nw = map.latLngToContainerPoint(bounds.getNorthWest());
      const se = map.latLngToContainerPoint(bounds.getSouthEast());
      const pixelWidth = Math.abs(se.x - nw.x);
      const pixelHeight = Math.abs(se.y - nw.y);

      // Dynamic font size: scale with country pixel width
      const textLen = countryName.length;
      const dynamicFontSize = Math.min(15, Math.max(9, Math.floor(pixelWidth / (textLen * 1.3))));

      // Measure actual rendered text width with canvas
      const actualTextWidth = measureTextWidth(countryName, dynamicFontSize);
      const letterSpacingExtra = textLen * dynamicFontSize * 0.12;
      const totalTextWidth = actualTextWidth + letterSpacingExtra;

      // Strict: text must fit within 80% of country pixel width
      const maxAllowedWidth = Math.floor(pixelWidth * 0.80);
      if (totalTextWidth > maxAllowedWidth || pixelHeight < 18) {
        return;
      }

      // Use proper area-weighted visual centroid
      const visualCenter = getVisualCenter(f) || bounds.getCenter();
      const centerPt = map.latLngToContainerPoint(visualCenter);

      // Generous buffer (500px outside screen) so partially visible countries (Greece, Romania, Italy, etc.)
      // have their names ready and visible, even if cut off by screen edge!
      const vpBuffer = 500;
      if (centerPt.x < -vpBuffer || centerPt.x > mapSize.x + vpBuffer ||
          centerPt.y < -vpBuffer || centerPt.y > mapSize.y + vpBuffer) {
        return;
      }

      // Build collision box
      const box = {
        x1: centerPt.x - halfW - 6,
        y1: centerPt.y - halfH - 4,
        x2: centerPt.x + halfW + 6,
        y2: centerPt.y + halfH + 4
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
      const renderHeight = dynamicFontSize + 4;

      const icon = L.divIcon({
        className: 'country-watermark-wrap',
        html: `<div class="country-tattoo" style="width:${renderWidth}px;font-size:${dynamicFontSize}px;color:${themeCfg.labelColor};text-shadow:${themeCfg.labelShadow};">${countryName}</div>`,
        iconSize: [renderWidth, renderHeight],
        iconAnchor: [renderWidth / 2, renderHeight / 2]
      });

      L.marker(visualCenter, { icon, interactive: false, pane: 'labelsPane' }).addTo(countryLabelsLayer);
    } catch (e) {}
  });
}

// ─── View change handler (regions lazy-loaded on zoom) ────────────────────────
async function onViewChange() {
  if (!map) return;
  const zoom = map.getZoom();
  const mapEl = map.getContainer();
  if (mapEl) {
    if (zoom >= REGION_ZOOM) mapEl.classList.add('zoom-regional');
    else mapEl.classList.remove('zoom-regional');
  }

  // ── Turkey province layer zoom control ────────────────────────────────────
  if (turkeyLayer) {
    if (zoom >= REGION_ZOOM && !map.hasLayer(turkeyLayer)) {
      turkeyLayer.addTo(map);
      // Refresh country style so Turkey becomes transparent
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
  if (!countriesLayer) return [];
  const bounds = map.getBounds();
  const visible = [];
  countriesLayer.eachLayer(layer => {
    if (layer.getBounds && bounds.intersects(layer.getBounds())) {
      const c = findCountry(layer.feature);
      if (c) visible.push(c.code);
    }
  });
  return visible;
}

// ─── World Region Data Loader ─────────────────────────────────────────────────
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
  const countryName = c ? getCountryDisplayName(c) : '';

  // Sort region features ascending by bounding box area
  const sortedFeatures = [...data.features].sort((a, b) => {
    try {
      const bboxA = turfBbox(a);
      const bboxB = turfBbox(b);
      const areaA = (bboxA[2] - bboxA[0]) * (bboxA[3] - bboxA[1]);
      const areaB = (bboxB[2] - bboxB[0]) * (bboxB[3] - bboxB[1]);
      return areaA - areaB;
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
    if (countriesLayer) {
      countriesLayer.eachLayer(l => {
        if (findCountry(l.feature)?.code === code) l.setStyle(countryStyle(findCountry(l.feature)));
      });
    }
  }
}

function turfBbox(feature) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  function traverse(coords) {
    if (typeof coords[0] === 'number') {
      const [x, y] = coords;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    } else {
      coords.forEach(traverse);
    }
  }
  if (feature.geometry?.coordinates) traverse(feature.geometry.coordinates);
  return [minX, minY, maxX, maxY];
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

  const sortedFeatures = [...data.features].sort((a, b) => {
    try {
      const bboxA = turfBbox(a);
      const bboxB = turfBbox(b);
      const areaA = (bboxA[2] - bboxA[0]) * (bboxA[3] - bboxA[1]);
      const areaB = (bboxB[2] - bboxB[0]) * (bboxB[3] - bboxB[1]);
      return areaA - areaB;
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
        selectedRegionName = f.properties.parent_region || raw;
        refreshStats();
        openStatusPopup(e.latlng, `${code}::${raw}`, `${flag} ${display}`, 'subregion', code, f.properties.parent_region);
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
    const raw = l.feature?.properties?.name || '';
    const style = subregionStyle(raw, code);
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

// ─── Status Popup (Native Leaflet Popup with Custom Styling) ─────────────────
function openStatusPopup(latlng, key, label, type, parentCode, parentRegionName) {
  const { worldVisits, turkeyVisits } = getStorageData();
  const STATUS = getStatusConfig();
  let currentStatus;
  if (type === 'province') {
    const id = parseInt(key.replace('TR::', ''));
    currentStatus = ns(turkeyVisits[id]?.status);
  } else {
    currentStatus = ns(worldVisits[key]?.status);
  }

  const content = document.createElement('div');
  content.className = 'map-status-popup';
  content.innerHTML = `
    <div class="map-status-popup-title">${label}</div>
    <div class="map-status-popup-buttons">
      ${Object.entries(STATUS).map(([val, cfg]) => `
        <button class="map-status-btn ${currentStatus === val ? 'active' : ''}"
                data-val="${val}" style="--btn-color:${cfg.color};">
          ${cfg.label}
        </button>`).join('')}
    </div>
  `;

  content.querySelectorAll('.map-status-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const val = btn.dataset.val;
      if (type === 'province') {
        const id = parseInt(key.replace('TR::', ''));
        saveTurkeyVisit(id, val);
      } else {
        saveWorldVisit(key, val);
        
        // UPWARD AUTO-MARKING LOGIC
        if (val === 'visited') {
          if (type === 'region' && parentCode) {
            saveWorldVisit(parentCode, 'visited', { notes: 'Auto-marked' });
          }
          if (type === 'subregion' && parentCode && parentRegionName) {
            const regionKey = `${parentCode}::${parentRegionName}`;
            saveWorldVisit(regionKey, 'visited', { notes: 'Auto-marked' });
            saveWorldVisit(parentCode, 'visited', { notes: 'Auto-marked' });
          }
        }
      }
      map.closePopup();
      
      refreshAllStyles();
      window.__refreshMapStats?.();
    });
  });

  L.popup({
    className: 'clean-status-popup',
    closeButton: false,
    autoClose: true,
    closeOnClick: true,
    maxWidth: 240,
    offset: [0, -6]
  })
    .setLatLng(latlng)
    .setContent(content)
    .openOn(map);
}

// ─── Layer Style Generators ───────────────────────────────────────────────────
function countryStyle(c) {
  const { worldVisits } = getStorageData();
  const status = ns(worldVisits[c?.code]?.status);
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
  // When zoomed but NO region layer yet: keep full country style, don't dim
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
  const zoom = map?.getZoom() || 3;
  const zoomedToSubregions = zoom >= SUBREGION_ZOOM;

  let isInteractive = true;
  let hasSubregions = false;
  if (zoomedToSubregions && subregionLayers[countryCode] && map.hasLayer(subregionLayers[countryCode])) {
    isInteractive = false;
    hasSubregions = true;
  }

  if (status !== 'unvisited') {
    return { fillColor: cfg.color, fillOpacity: hasSubregions ? 0.01 : cfg.fillOpacity, color: '#ffffff', weight: 1.5, opacity: 1, interactive: isInteractive };
  }

  const tintMap = { visited: '#ff5722', planned: '#f59e0b', wishlist: '#8b5cf6' };
  const tint = tintMap[countryStatus];
  if (tint) return { fillColor: tint, fillOpacity: hasSubregions ? 0.01 : 0.35, color: themeCfg.landBorder, weight: 1.5, opacity: 0.9, interactive: isInteractive };

  return { fillColor: '#ffffff', fillOpacity: 0.01, color: themeCfg.landBorder, weight: 1.0, opacity: zoomedToSubregions ? 0.3 : 0.8, interactive: isInteractive };
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
  const tintMap = { visited: '#ff5722', planned: '#f59e0b', wishlist: '#8b5cf6' };
  const tint = tintMap[trStatus];
  if (tint) return { fillColor: tint, fillOpacity: 0.30, color: themeCfg.landBorderZoomed, weight: 1.0, opacity: 0.9 };

  // Unvisited: şeffaf dolgu + beyaz sınır çizgisi (regionStyle ile aynı davranış)
  return { fillColor: '#ffffff', fillOpacity: 0.01, color: themeCfg.landBorderZoomed, weight: 1.0, opacity: 0.85 };
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
    return { fillColor: cfg.color, fillOpacity: cfg.fillOpacity, color: '#ffffff', weight: 1.0, opacity: 1 };
  }

  const tintMap = { visited: '#ff5722', planned: '#f59e0b', wishlist: '#8b5cf6' };
  const tint = tintMap[countryStatus];
  if (tint) return { fillColor: tint, fillOpacity: 0.35, color: themeCfg.landBorder, weight: 0.8, opacity: 0.5 };

  return { fillColor: themeCfg.provinceFill, fillOpacity: 0.95, color: themeCfg.landBorder, weight: 0.8, opacity: 0.5 };
}

// ─── Country Finder Helper ─────────────────────────────────────────────────────
function findCountry(f) {
  if (!f) return null;
  const iso2 = (f.properties?.iso_a2 || f.properties?.ISO_A2 || f.id || '').toUpperCase();
  const name = f.properties?.name || '';
  if (iso2 && iso2 !== '-99' && iso2 !== 'UU') {
    const found = WORLD_COUNTRIES.find(c => c.code === iso2);
    if (found) return found;
  }
  return WORLD_COUNTRIES.find(c =>
    c.name.toLowerCase() === name.toLowerCase() ||
    c.nameEn.toLowerCase() === name.toLowerCase()
  ) || null;
}

// ─── Stats Refresh ────────────────────────────────────────────────────────────
function refreshStats() {
  const { worldVisits, turkeyVisits } = getStorageData();

  const countriesEl = document.getElementById('stats-countries');
  const regionsEl = document.getElementById('stats-regions');
  if (!countriesEl) return;

  const visited  = Object.entries(worldVisits).filter(([k, v]) => !k.includes('::') && v.status === 'visited').length;
  const planned  = Object.entries(worldVisits).filter(([k, v]) => !k.includes('::') && v.status === 'planned').length;
  const wishlist = Object.entries(worldVisits).filter(([k, v]) => !k.includes('::') && v.status === 'wishlist').length;
  const trVisited = Object.values(turkeyVisits).filter(v => v.status === 'visited').length;

  const rows = [
    `<div class="stats-row"><span class="stats-icon">🌍</span><div><div class="stats-number" style="color:#ff5722;">${visited}</div><div class="stats-label">${t('countriesVisited')}</div></div></div>`,
    planned  > 0 ? `<div class="stats-divider"></div><div class="stats-row"><span class="stats-icon">🎯</span><div><div class="stats-number" style="color:#f59e0b;">${planned}</div><div class="stats-label">${t('planned')}</div></div></div>` : '',
    wishlist > 0 ? `<div class="stats-divider"></div><div class="stats-row"><span class="stats-icon">💜</span><div><div class="stats-number" style="color:#8b5cf6;">${wishlist}</div><div class="stats-label">${t('wishlist')}</div></div></div>` : '',
    trVisited > 0 ? `<div class="stats-divider"></div><div class="stats-row"><span class="stats-icon">🇹🇷</span><div><div class="stats-number" style="color:#ff5722;">${trVisited}/81</div><div class="stats-label">${t('provincesVisited')}</div></div></div>` : '',
  ];
  countriesEl.innerHTML = rows.join('');

  if (selectedCountryCode && selectedCountryCode !== 'TR') {
    const countryObj = WORLD_COUNTRIES.find(c => c.code === selectedCountryCode);
    if (countryObj) {
      let visitedRegionsCount = 0;
      let visitedSubregionsCount = 0;
      
      const rCache = regionCache[selectedCountryCode]?.features || [];
      const sCache = subregionCache[selectedCountryCode]?.features || [];
      const totalRegions = rCache.length;
      const totalSubregions = sCache.length;
      
      let specificTotalSubregions = 0;
      let specificVisitedSubregions = 0;
      if (selectedRegionName) {
        specificTotalSubregions = sCache.filter(f => f.properties.parent_region === selectedRegionName).length;
      }

      Object.entries(worldVisits).forEach(([k, v]) => {
        if (!k.startsWith(`${selectedCountryCode}::`) || v.status !== 'visited') return;
        const name = k.split('::')[1];
        
        if (rCache.some(f => (f.properties?.name || f.properties?.NAME_1) === name)) {
          visitedRegionsCount++;
        }
        
        const subFeat = sCache.find(f => (f.properties?.name) === name);
        if (subFeat) {
          visitedSubregionsCount++;
          if (selectedRegionName && subFeat.properties.parent_region === selectedRegionName) {
            specificVisitedSubregions++;
          }
        }
      });

      regionsEl.style.display = 'flex';
      let statsHtml = '';

      const displayName = getCountryDisplayName(countryObj);

      if (totalSubregions === 0) {
        statsHtml = `
          <div class="stats-row" style="justify-content:space-between;width:100%;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="stats-icon">${countryObj.flag}</span>
              <div>
                <div class="stats-number" style="font-size:1rem;color:#f8fafc;">${displayName}</div>
                <div class="stats-label">${t('totalWorld')}</div>
              </div>
            </div>
            ${totalRegions > 0 ? `
              <div style="text-align:right;">
                <div class="stats-number" style="color:#ff5722;">${visitedRegionsCount}/${totalRegions}</div>
                <div class="stats-label">${t('provincesVisited')}</div>
              </div>
            ` : ''}
          </div>
        `;
      } else {
        const activeRegionName = selectedRegionName ? getLocalizedName(selectedRegionName, selectedCountryCode) : displayName;
        const count = selectedRegionName ? specificVisitedSubregions : visitedSubregionsCount;
        const total = selectedRegionName ? specificTotalSubregions : totalSubregions;

        statsHtml = `
          <div class="stats-row" style="justify-content:space-between;width:100%;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="stats-icon">${countryObj.flag}</span>
              <div>
                <div class="stats-number" style="font-size:0.95rem;color:#f8fafc;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${activeRegionName}</div>
                <div class="stats-label">${selectedRegionName ? displayName : t('citiesVisited')}</div>
              </div>
            </div>
            <div style="text-align:right;">
              <div class="stats-number" style="color:#3b82f6;">${count}/${total}</div>
              <div class="stats-label">${t('citiesVisited')}</div>
            </div>
          </div>
        `;
      }

      regionsEl.innerHTML = statsHtml;
    }
  } else {
    regionsEl.style.display = 'none';
  }
}
