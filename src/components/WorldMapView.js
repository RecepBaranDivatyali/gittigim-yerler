import L from 'leaflet';
import { WORLD_COUNTRIES } from '../data/worldData.js';
import { TURKEY_PROVINCES } from '../data/turkeyData.js';
import { getLocalizedName, getCountryLocalizedName } from '../data/regionNames.js';
import { getStorageData, saveWorldVisit, saveTurkeyVisit } from '../utils/storage.js';

// ─── Config ───────────────────────────────────────────────────────────────────
const REGION_ZOOM = 5.2;
const SUBREGION_ZOOM = 7.5;

const STATUS = {
  visited:   { label: '🟢 Gidildi',     color: '#ff5722', fillOpacity: 0.90 },
  planned:   { label: '🟡 Planlanıyor', color: '#f59e0b', fillOpacity: 0.85 },
  wishlist:  { label: '🟣 İsteniyor',   color: '#8b5cf6', fillOpacity: 0.80 },
  unvisited: { label: '⚫ Gidilmedi',   color: '#1e293b', fillOpacity: 0.95 },
};

function ns(s) {
  if (s === 'target') return 'planned';
  return STATUS[s] ? s : 'unvisited';
}

// ─── Module state ──────────────────────────────────────────────────────────
let map = null;
let countriesLayer = null;
let turkeyLayer = null;
let regionLayers = {};
let regionCache = {};
let subregionLayers = {};
let subregionCache = {};
let selectedCountryCode = null;
let selectedRegionName = null;

// ─── Entry point ──────────────────────────────────────────────────────────────
export function renderWorldMapView(container, options = {}) {
  let userAvatar = '🧭';
  let userName = 'Profilim';
  try {
    const raw = localStorage.getItem('gv_profile');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.avatar) userAvatar = parsed.avatar;
      if (parsed.username) userName = parsed.username;
    }
  } catch {}

  container.innerHTML = `
    <div id="map-root" style="width:100%;height:100%;position:relative;background:#090d16;">
      <div id="leaflet-map" style="width:100%;height:100%;background:#090d16;"></div>

      <!-- Floating Profile Button (top-left) -->
      <div id="profile-btn-wrap" class="floating-profile-wrap">
        <button id="btn-open-profile" class="floating-profile-btn" aria-label="Profilimi Aç">
          <span class="floating-profile-avatar">${userAvatar}</span>
          <span class="floating-profile-name">${userName}</span>
        </button>
      </div>

      <!-- Legend (top-right, vertical column) -->
      <div id="map-legend" class="floating-legend">
        <div class="legend-items-list">
          ${Object.entries(STATUS).filter(([k]) => k !== 'unvisited').map(([, v]) =>
            `<span class="legend-item"><span class="legend-dot" style="background:${v.color};"></span>${v.label.replace(/^.+? /, '')}</span>`
          ).join('')}
          <span class="legend-item"><span class="legend-dot" style="background:rgba(255,87,34,.22);border:1px solid #ff5722;"></span>Gidilmemiş</span>
        </div>
        <button id="btn-reset-data" class="legend-reset-btn">🗑 Sıfırla</button>
      </div>

      <!-- Stats overlay (bottom-left) -->
      <div id="stats-overlay">
        <div id="stats-countries" class="stats-chip"></div>
        <div id="stats-regions" class="stats-chip stats-chip-region" style="display:none;"></div>
      </div>
    </div>
  `;

  initMap(container);

  container.querySelector('#btn-reset-data').addEventListener('click', () => {
    if (confirm('Tüm işaretleme verilerini silmek istediğinizden emin misiniz?')) {
      ['gittigim_yerler_turkey_v2','gittigim_yerler_world_v2',
       'gittigim_yerler_cities_v2','gittigim_yerler_profile_v2'].forEach(k => localStorage.removeItem(k));
      location.reload();
    }
  });

  const profileBtn = container.querySelector('#btn-open-profile');
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      if (options.onOpenProfile) options.onOpenProfile();
    });
  }

  window.__refreshMapStats = refreshStats;
  refreshStats();
}

// ─── Map initialization ───────────────────────────────────────────────────────
function initMap(container) {
  const el = container.querySelector('#leaflet-map');
  if (!el) return;
  if (map) { map.remove(); map = null; }

  map = L.map(el, {
    center: [39, 35], zoom: 5,
    minZoom: 2, maxZoom: 12,
    zoomControl: false,
    attributionControl: false,
    tap: false
  });

  map.createPane('countriesPane');
  map.getPane('countriesPane').style.zIndex = 430;

  map.createPane('statesPane');
  map.getPane('statesPane').style.zIndex = 420;

  map.createPane('citiesPane');
  map.getPane('citiesPane').style.zIndex = 410;

  // Pure dark ocean background
  el.style.backgroundColor = '#090d16';

  // Load World Countries (pure vector landmass - 100% clean, no third party text/noise)
  fetch(`/data/world-countries.json?v=${Date.now()}`, { cache: 'no-store' }).then(r => r.json()).then(data => {
    countriesLayer = L.geoJSON(data, {
      pane: 'countriesPane',
      style: f => countryStyle(findCountry(f)),
      onEachFeature: (f, layer) => {
        const c = findCountry(f);
        const label = c ? `${c.flag} ${c.name}` : (f.properties?.name || 'Ülke');
        layer.bindTooltip(`<span>${label}</span>`, {
          direction: 'top', offset: [0, -10], className: 'clean-hover-tooltip',
          sticky: true, permanent: false
        });
        layer.on('click', e => {
          if (!c) return;
          L.DomEvent.stopPropagation(e);
          selectedCountryCode = c.code;
          selectedRegionName = null;
          refreshStats();
          openStatusPopup(e.latlng, c.code, `${c.flag} ${c.name}`, 'country');
        });
      }
    }).addTo(map);
  });

  // Load Turkey Provinces
  fetch(`/data/turkey-provinces.json?v=${Date.now()}`, { cache: 'no-store' }).then(r => r.json()).then(data => {
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
  });

  let rafId = null;
  function handleContinuousViewChange() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      onViewChange();
    });
  }

  map.on('move zoom moveend zoomend', handleContinuousViewChange);
  map.on('zoomstart', () => {
    map.eachLayer(l => l.closeTooltip && l.closeTooltip());
  });
}

// ─── View change handler (regions lazy-loaded on zoom) ────────────────────────
async function onViewChange() {
  const zoom = map.getZoom();

  // Turkey province layer zoom control
  if (turkeyLayer) {
    if (zoom >= REGION_ZOOM && !map.hasLayer(turkeyLayer)) {
      turkeyLayer.addTo(map);
      turkeyLayer.bringToFront();
    } else if (zoom < REGION_ZOOM && map.hasLayer(turkeyLayer)) {
      map.removeLayer(turkeyLayer);
    }
  }

  // Zoom < REGION_ZOOM: hide region layers and subregion layers
  if (zoom < REGION_ZOOM) {
    Object.keys(regionLayers).forEach(code => {
      if (map.hasLayer(regionLayers[code])) map.removeLayer(regionLayers[code]);
    });
    Object.keys(subregionLayers).forEach(code => {
      if (map.hasLayer(subregionLayers[code])) map.removeLayer(subregionLayers[code]);
    });
  } else {
    // Zoom >= REGION_ZOOM: load and show visible countries' regions/subregions
    const rawBounds = map.getBounds();
    const bounds = rawBounds.pad ? rawBounds.pad(0.35) : rawBounds;
    const boundsLeft = L.latLngBounds(
      [bounds.getSouth(), bounds.getWest() - 360],
      [bounds.getNorth(), bounds.getEast() - 360]
    );
    const boundsRight = L.latLngBounds(
      [bounds.getSouth(), bounds.getWest() + 360],
      [bounds.getNorth(), bounds.getEast() + 360]
    );
    const visibleCodes = [];

    countriesLayer?.eachLayer(layer => {
      try {
        const lb = layer.getBounds();
        if (bounds.intersects(lb) || boundsLeft.intersects(lb) || boundsRight.intersects(lb)) {
          const c = findCountry(layer.feature);
          if (c && c.code !== 'TR') {
            if (!visibleCodes.includes(c.code)) visibleCodes.push(c.code);
          }
        }
      } catch {}
    });

    await Promise.all(visibleCodes.map(code => loadAndShowRegions(code)));

    if (zoom >= SUBREGION_ZOOM) {
      await Promise.all(visibleCodes.map(code => loadAndShowSubregions(code)));
    } else {
      // Zoom < SUBREGION_ZOOM: hide subregion layers
      Object.keys(subregionLayers).forEach(code => {
        if (map.hasLayer(subregionLayers[code])) map.removeLayer(subregionLayers[code]);
      });
    }

    // Now determine which region layers to show/hide
    Object.keys(regionLayers).forEach(code => {
      if (!visibleCodes.includes(code)) {
        if (map.hasLayer(regionLayers[code])) map.removeLayer(regionLayers[code]);
      } else {
        if (!map.hasLayer(regionLayers[code])) {
          regionLayers[code].addTo(map);
          regionLayers[code].bringToFront();
        }
      }
    });

    // Hide subregion layers out of view
    Object.keys(subregionLayers).forEach(code => {
      if (!visibleCodes.includes(code) && map.hasLayer(subregionLayers[code])) {
        map.removeLayer(subregionLayers[code]);
      }
    });
  }

  // Refresh country layer visual styles at the end
  countriesLayer?.eachLayer(l => {
    const c = findCountry(l.feature);
    let style = countryStyle(c);
    l.setStyle(style);
    
    // Z-index: Bring visited countries to front so their borders aren't hidden by unvisited neighbors
    if (c) {
      const { worldVisits } = getStorageData();
      if (ns(worldVisits[c.code]?.status) !== 'unvisited' && l.bringToFront) {
        l.bringToFront();
      }
    }

    // Leaflet setStyle doesn't update pointer-events dynamically, so we do it manually
    if (l._path) {
      if (style.interactive === false) {
        l._path.style.pointerEvents = 'none';
      } else {
        l._path.style.pointerEvents = 'visiblePainted';
      }
    }
  });
}

function refreshCountryStyle(code) {
  countriesLayer?.eachLayer(l => {
    const c = findCountry(l.feature);
    if (c && c.code === code) {
      const style = countryStyle(c);
      l.setStyle(style);
      if (l._path) {
        l._path.style.pointerEvents = style.interactive === false ? 'none' : 'visiblePainted';
      }
    }
  });
}

async function loadAndShowSubregions(code) {
  if (!subregionCache[code]) {
    try {
      const resp = await fetch(`/data/subregions/${code}.json?v=${Date.now()}`, { cache: 'no-store' });
      if (!resp.ok) {
        subregionCache[code] = { type: 'FeatureCollection', features: [] }; // Mark as empty to avoid refetching
        return;
      }
      subregionCache[code] = await resp.json();
    } catch { return; }
  }

  if (subregionCache[code].features.length === 0) return; // No subregions for this country

  if (!subregionLayers[code]) {
    subregionLayers[code] = buildSubregionLayer(subregionCache[code], code);
  }

  if (!map.hasLayer(subregionLayers[code])) {
    subregionLayers[code].addTo(map);
    refreshRegionLayer(code);
  } else {
    refreshSubregionLayer(code);
  }
}

async function loadAndShowRegions(code) {
  if (!regionCache[code]) {
    try {
      const resp = await fetch(`/data/regions/${code}.json?v=${Date.now()}`, { cache: 'no-store' });
      if (!resp.ok) return;
      regionCache[code] = await resp.json();
    } catch { return; }
  }

  if (!regionLayers[code]) {
    regionLayers[code] = buildRegionLayer(regionCache[code], code);
  }

  if (!map.hasLayer(regionLayers[code])) {
    regionLayers[code].addTo(map);
    refreshCountryStyle(code);
  } else {
    refreshRegionLayer(code);
  }
}

function buildRegionLayer(data, code) {
  const countryObj = WORLD_COUNTRIES.find(c => c.code === code);
  const flag = countryObj?.flag || '';

  return L.geoJSON(data, {
    pane: 'statesPane',
    style: f => regionStyle(f.properties?.name || f.properties?.NAME_1 || '', code),
    onEachFeature: (f, layer) => {
      const raw = f.properties?.name || f.properties?.NAME_1 || 'Bölge';
      const display = getLocalizedName(raw);
      layer.bindTooltip(`<span>${flag} ${display}</span>`, {
        direction: 'top', offset: [0, -10], className: 'clean-hover-tooltip',
        sticky: true, permanent: false
      });
      layer.on('click', e => {
        L.DomEvent.stopPropagation(e);
        selectedCountryCode = code;
        selectedRegionName = raw;
        refreshStats();
        openStatusPopup(e.latlng, `${code}::${raw}`, `${flag} ${display}`, 'region', code);
      });
    }
  });
}

function refreshRegionLayer(code) {
  regionLayers[code]?.eachLayer(l => {
    const raw = l.feature?.properties?.name || l.feature?.properties?.NAME_1 || '';
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

function buildSubregionLayer(data, code) {
  const countryObj = WORLD_COUNTRIES.find(c => c.code === code);
  const flag = countryObj?.flag || '';

  return L.geoJSON(data, {
    pane: 'citiesPane',
    style: f => subregionStyle(f.properties?.name || '', code),
    onEachFeature: (f, layer) => {
      const raw = f.properties?.name || 'Şehir';
      const display = getLocalizedName(raw);
      layer.bindTooltip(`<span>${flag} ${display}</span>`, {
        direction: 'top', offset: [0, -10], className: 'clean-hover-tooltip',
        sticky: true, permanent: false
      });
      layer.on('click', e => {
        L.DomEvent.stopPropagation(e);
        selectedCountryCode = code;
        selectedRegionName = f.properties.parent_region || raw;
        refreshStats();
        openStatusPopup(e.latlng, `${code}::${raw}`, `${flag} ${display}`, 'subregion', code, f.properties.parent_region);
      });
    }
  });
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
          // If a Region is marked, visiblePainted-mark its Country
          if (type === 'region' && parentCode) {
            saveWorldVisit(parentCode, 'visited', { notes: 'Otomatik işaretlendi (Bölge ziyareti)' });
          }
          // If a Subregion is marked, visiblePainted-mark its Region, and then its Country
          if (type === 'subregion' && parentCode && parentRegionName) {
            const regionKey = `${parentCode}::${parentRegionName}`;
            saveWorldVisit(regionKey, 'visited', { notes: 'Otomatik işaretlendi (Şehir ziyareti)' });
            saveWorldVisit(parentCode, 'visited', { notes: 'Otomatik işaretlendi (Şehir ziyareti)' });
          }
        }
      }
      map.closePopup();
      
      // Visually refresh layers immediately
      if (countriesLayer) countriesLayer.eachLayer(l => l.setStyle(countryStyle(findCountry(l.feature))));
      if (turkeyLayer) turkeyLayer.eachLayer(l => l.setStyle(provinceStyle(l.feature?.properties?.number)));
      if (parentCode || type === 'country') {
        const codeToRefresh = parentCode || key;
        refreshRegionLayer(codeToRefresh);
        refreshSubregionLayer(codeToRefresh);
      }
      Object.keys(regionLayers).forEach(code => refreshRegionLayer(code));
      Object.keys(subregionLayers).forEach(code => refreshSubregionLayer(code));
      
      window.__refreshMapStats?.();
    });
  });

  L.popup({
    className: 'clean-status-popup',
    closeButton: false,
    visiblePaintedClose: true,
    closeOnClick: true,
    maxWidth: 240,
    offset: [0, -6]
  })
    .setLatLng(latlng)
    .setContent(content)
    .openOn(map);
}

// ─── Apply visit status ───────────────────────────────────────────────────────
function applyStatus(key, status, type, parentCode) {
  const save = status === 'unvisited' ? null : status;

  if (type === 'province') {
    const id = parseInt(key.replace('TR::', ''));
    saveTurkeyVisit(id, save || 'unvisited', {});
    turkeyLayer?.eachLayer(l => l.setStyle(provinceStyle(l.feature?.properties?.number)));
    countriesLayer?.eachLayer(l => l.setStyle(countryStyle(findCountry(l.feature))));
  } else {
    saveWorldVisit(key, save || 'unvisited', {});

    if (type === 'region' && parentCode && status === 'visited') {
      const { worldVisits } = getStorageData();
      if (!worldVisits[parentCode] || worldVisits[parentCode].status !== 'visited') {
        saveWorldVisit(parentCode, 'visited', {});
      }
    }

    countriesLayer?.eachLayer(l => l.setStyle(countryStyle(findCountry(l.feature))));
    const code = type === 'region' ? parentCode : key;
    if (code) refreshRegionLayer(code);
  }

  refreshStats();
}

// ─── Layer Style Generators ───────────────────────────────────────────────────
function countryStyle(c) {
  const { worldVisits } = getStorageData();
  const status = ns(worldVisits[c?.code]?.status);
  const zoom = map?.getZoom() || 3;
  const cfg = STATUS[status];
  const zoomed = zoom >= REGION_ZOOM;

  let isInteractive = true;
  let hasRegions = false;
  if (zoomed) {
    if (regionLayers[c?.code] && map.hasLayer(regionLayers[c?.code])) {
      isInteractive = false;
      hasRegions = true;
    }
    if (c?.code === 'TR' && turkeyLayer && map.hasLayer(turkeyLayer)) {
      isInteractive = false;
      hasRegions = true;
    }
  }

  return {
    fillColor: status === 'unvisited' ? '#1e293b' : cfg.color,
    fillOpacity: hasRegions ? 0.01 : (zoomed
      ? (status === 'unvisited' ? 0.15 : 0.25)
      : (status === 'unvisited' ? 0.95 : cfg.fillOpacity)),
    color: zoomed
      ? (status === 'unvisited' ? '#cbd5e1' : '#ffffff')
      : (status === 'unvisited' ? '#94a3b8' : 'rgba(255,255,255,0.7)'),
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
  const cfg = STATUS[status];
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
  if (tint) return { fillColor: tint, fillOpacity: hasSubregions ? 0.01 : 0.35, color: '#94a3b8', weight: 1.5, opacity: 0.9, interactive: isInteractive };

  return { fillColor: '#ffffff', fillOpacity: 0.01, color: '#475569', weight: 1.0, opacity: zoomedToSubregions ? 0.3 : 0.8, interactive: isInteractive };
}

function provinceStyle(provinceId) {
  const { turkeyVisits, worldVisits } = getStorageData();
  const status = ns(turkeyVisits[provinceId]?.status);
  const trStatus = ns(
    worldVisits['TR']?.status ||
    (Object.values(turkeyVisits).some(v => v.status === 'visited') ? 'visited' : 'unvisited')
  );
  const cfg = STATUS[status];

  if (status !== 'unvisited') {
    return { fillColor: cfg.color, fillOpacity: cfg.fillOpacity, color: '#ffffff', weight: 1.0, opacity: 1 };
  }
  const tintMap = { visited: '#ff5722', planned: '#f59e0b', wishlist: '#8b5cf6' };
  const tint = tintMap[trStatus];
  if (tint) return { fillColor: tint, fillOpacity: 0.35, color: '#64748b', weight: 0.8, opacity: 0.5 };

  return { fillColor: '#1e293b', fillOpacity: 0.95, color: '#64748b', weight: 0.8, opacity: 0.5 };
}

function subregionStyle(name, code) {
  const { worldVisits } = getStorageData();
  const key = `${code}::${name}`;
  const status = ns(worldVisits[key]?.status);
  const countryStatus = ns(worldVisits[code]?.status);
  const cfg = STATUS[status];
  
  if (status !== 'unvisited') {
    return { fillColor: cfg.color, fillOpacity: cfg.fillOpacity, color: '#ffffff', weight: 1.0, opacity: 1 };
  }

  const tintMap = { visited: '#ff5722', planned: '#f59e0b', wishlist: '#8b5cf6' };
  const tint = tintMap[countryStatus];
  if (tint) return { fillColor: tint, fillOpacity: 0.35, color: '#64748b', weight: 0.8, opacity: 0.5 };

  return { fillColor: '#1e293b', fillOpacity: 0.95, color: '#64748b', weight: 0.8, opacity: 0.5 };
}

// ─── Floating Stats Overlay ───────────────────────────────────────────────────
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
    `<div class="stats-row"><span class="stats-icon">🌍</span><div><div class="stats-number" style="color:#ff5722;">${visited}</div><div class="stats-label">Ülke Gezildi</div></div></div>`,
    planned  > 0 ? `<div class="stats-divider"></div><div class="stats-row"><span class="stats-icon">🎯</span><div><div class="stats-number" style="color:#f59e0b;">${planned}</div><div class="stats-label">Planlanıyor</div></div></div>` : '',
    wishlist > 0 ? `<div class="stats-divider"></div><div class="stats-row"><span class="stats-icon">💜</span><div><div class="stats-number" style="color:#8b5cf6;">${wishlist}</div><div class="stats-label">İsteniyor</div></div></div>` : '',
    trVisited > 0 ? `<div class="stats-divider"></div><div class="stats-row"><span class="stats-icon">🇹🇷</span><div><div class="stats-number" style="color:#ff5722;">${trVisited}/81</div><div class="stats-label">Türkiye İli</div></div></div>` : '',
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

      if (totalSubregions === 0) {
        statsHtml = `
          <div class="stats-row" style="justify-content:space-between;width:100%;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="stats-icon">${countryObj.flag}</span>
              <div>
                <div class="stats-number" style="color:#ff5722;">${visitedRegionsCount}${totalRegions ? `/${totalRegions}` : ''}</div>
                <div class="stats-label">Gidilen Bölgeler</div>
              </div>
            </div>
            <button id="close-region-counter" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:1.1rem;padding:4px 2px;">✕</button>
          </div>`;
      } else {
        statsHtml = `
          <div class="stats-row" style="justify-content:space-between;width:100%;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="stats-icon">${countryObj.flag}</span>
              <div style="display:flex;flex-direction:column;gap:4px;">
                <div style="display:flex;align-items:baseline;gap:6px;">
                  <span class="stats-number" style="color:#ff5722;font-size:1.0rem;">${visitedRegionsCount}${totalRegions ? `/${totalRegions}` : ''}</span>
                  <span class="stats-label">Gidilen Eyaletler</span>
                </div>
                <div style="display:flex;align-items:baseline;gap:6px;">
                  <span class="stats-number" style="color:#ff5722;font-size:1.0rem;">${selectedRegionName ? specificVisitedSubregions : visitedSubregionsCount}${selectedRegionName ? (specificTotalSubregions ? `/${specificTotalSubregions}` : '') : (totalSubregions ? `/${totalSubregions}` : '')}</span>
                  <span class="stats-label">Gidilen Şehirler ${selectedRegionName ? `(${selectedRegionName})` : ''}</span>
                </div>
              </div>
            </div>
            <button id="close-region-counter" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:1.1rem;padding:4px 2px;align-self:flex-start;">✕</button>
          </div>`;
      }

      regionsEl.innerHTML = statsHtml;

      document.getElementById('close-region-counter')?.addEventListener('click', () => {
        selectedCountryCode = null;
        regionsEl.style.display = 'none';
      });
    }
  } else {
    regionsEl.style.display = 'none';
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2 || countryCode.startsWith('X')) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function findCountry(feature) {
  const p = feature?.properties || {};
  let iso2 = (p['ISO3166-1-Alpha-2'] || p['ISO_A2'] || p['iso_a2'] || '').trim().toUpperCase();
  let name = p.name || p.ADMIN || p.NAME || 'Ülke';

  if (iso2 === '-99' || !iso2) {
    if (name === 'Kosovo') iso2 = 'XK';
    else if (name === 'Somaliland') iso2 = 'XS';
    else if (name === 'Northern Cyprus') iso2 = 'XN';
    else if (p['ISO3166-1-Alpha-3']) iso2 = p['ISO3166-1-Alpha-3'].slice(0, 2).toUpperCase();
    else iso2 = name.slice(0, 2).toUpperCase();
  }

  let found = WORLD_COUNTRIES.find(c => c.code.toUpperCase() === iso2);
  if (!found) {
    found = WORLD_COUNTRIES.find(c =>
      c.nameEn.toLowerCase() === name.toLowerCase() || c.name.toLowerCase() === name.toLowerCase()
    );
  }
  if (found) return found;

  const flag = getFlagEmoji(iso2);
  const trName = getCountryLocalizedName(name);

  return {
    code: iso2,
    name: trName,
    nameEn: name,
    flag: flag,
    capital: '',
    continent: (p.CONTINENT || p.continent || 'europe').toLowerCase()
  };
}
