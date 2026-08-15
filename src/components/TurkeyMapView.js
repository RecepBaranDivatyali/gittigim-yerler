import L from 'leaflet';
import { TURKEY_PROVINCES, TURKEY_REGIONS } from '../data/turkeyData.js';
import { getStorageData, saveTurkeyVisit } from '../utils/storage.js';

let turkeyMapInstance = null;
let geojsonLayer = null;
let turkeyGeoJsonData = null;

export function renderTurkeyMapView(container) {
  const { turkeyVisits } = getStorageData();

  container.innerHTML = `
    <div class="view-header">
      <div class="view-title">
        <span>🇹🇷</span> Türkiye Haritası & İlleri
      </div>

      <div class="controls-group">
        <div class="search-input-wrapper">
          <span class="search-icon-inside">🔍</span>
          <input type="text" id="turkey-search" class="search-input" placeholder="İl ara... (Örn: İzmir, Trabzon)" />
        </div>

        <div class="filter-pills" id="turkey-filter-pills">
          <button class="pill-btn active" data-filter="all">Tümü (81)</button>
          <button class="pill-btn" data-filter="visited">Gidilenler</button>
          <button class="pill-btn" data-filter="target">Gezilecekler</button>
        </div>
      </div>
    </div>

    <!-- Mode Indicator Bar -->
    <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid var(--border-glass); padding: 0.6rem 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
      <div style="font-size: 0.85rem; color: #94a3b8; display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 1.1rem;">💡</span>
        <span>Şehirlerin üzerine gelerek isimlerini görebilir, üzerine tıklayarak işaretleyebilirsiniz.</span>
      </div>
      <div style="display: flex; gap: 1rem; font-size: 0.8rem; font-weight: 600;">
        <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 12px; height: 12px; background: #ff5722; border-radius: 3px; display: inline-block;"></span> Gidildi (#ff5722)</span>
        <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 12px; height: 12px; background: #f59e0b; border-radius: 3px; display: inline-block;"></span> Gezilecek (#f59e0b)</span>
        <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 12px; height: 12px; background: #1e293b; border: 1px solid #475569; border-radius: 3px; display: inline-block;"></span> Gitmedim</span>
      </div>
    </div>

    <div class="map-layout">
      <!-- Leaflet Polygon Map Container -->
      <div class="leaflet-map-wrapper">
        <div id="map-container-turkey"></div>
      </div>

      <!-- Side Province List Panel -->
      <div class="side-panel">
        <div class="side-panel-title">
          <span>İl Listesi</span>
          <span id="province-count-badge" style="font-size: 0.85rem; color: #94a3b8;">81 İl</span>
        </div>
        
        <!-- Region Filter Pills -->
        <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 8px;" id="region-filter-bar">
          <button class="pill-btn active" data-region="all" style="font-size: 0.75rem; white-space: nowrap;">Tüm Bölgeler</button>
          ${TURKEY_REGIONS.map(r => `<button class="pill-btn" data-region="${r.id}" style="font-size: 0.75rem; white-space: nowrap;">${r.name.replace(' Bölgesi', '')}</button>`).join('')}
        </div>

        <div class="item-list-scroll" id="turkey-province-list">
          <!-- Rendered via JS -->
        </div>
      </div>
    </div>

    <!-- Province Detail Modal Container -->
    <div id="province-modal-wrapper"></div>
  `;

  // Fetch GeoJSON and Init Map
  setTimeout(() => {
    initLeafletTurkeyGeoJsonMap(container);
    renderProvinceList(container);
  }, 50);

  // Setup Event Listeners
  const searchInput = container.querySelector('#turkey-search');
  searchInput.addEventListener('input', () => filterAndRenderList(container));

  container.querySelector('#turkey-filter-pills').addEventListener('click', (e) => {
    if (e.target.classList.contains('pill-btn')) {
      container.querySelectorAll('#turkey-filter-pills .pill-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      filterAndRenderList(container);
    }
  });

  container.querySelector('#region-filter-bar').addEventListener('click', (e) => {
    if (e.target.classList.contains('pill-btn')) {
      container.querySelectorAll('#region-filter-bar .pill-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      filterAndRenderList(container);
    }
  });
}

function initLeafletTurkeyGeoJsonMap(container) {
  const mapElement = container.querySelector('#map-container-turkey');
  if (!mapElement) return;

  if (turkeyMapInstance) {
    turkeyMapInstance.remove();
    turkeyMapInstance = null;
  }

  turkeyMapInstance = L.map(mapElement, {
    center: [39.0, 35.2],
    zoom: 6,
    minZoom: 5,
    maxZoom: 10,
    zoomControl: true,
    attributionControl: false
  });

  // NO-LABELS Dark vector tiles backdrop
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(turkeyMapInstance);

  // Load GeoJSON
  if (turkeyGeoJsonData) {
    drawGeoJsonPolygons(container, turkeyGeoJsonData);
  } else {
    fetch('/data/turkey-provinces.json')
      .then(res => res.json())
      .then(data => {
        turkeyGeoJsonData = data;
        drawGeoJsonPolygons(container, data);
      })
      .catch(err => {
        console.error('Error loading Turkey GeoJSON:', err);
      });
  }
}

function getStyleForProvince(provinceId) {
  const { turkeyVisits } = getStorageData();
  const visitInfo = turkeyVisits[provinceId];
  const status = visitInfo ? visitInfo.status : 'unvisited';

  if (status === 'visited') {
    return {
      fillColor: '#ff5722', // Been App Coral
      weight: 1.5,
      opacity: 1,
      color: '#ffffff',
      fillOpacity: 0.88
    };
  } else if (status === 'target') {
    return {
      fillColor: '#f59e0b', // Amber/Gold
      weight: 1.5,
      opacity: 1,
      color: '#ffffff',
      fillOpacity: 0.80
    };
  } else {
    return {
      fillColor: '#1e293b', // Dark Slate
      weight: 1,
      opacity: 0.8,
      color: '#334155',
      fillOpacity: 0.65
    };
  }
}

function drawGeoJsonPolygons(container, geojson) {
  if (!turkeyMapInstance) return;
  if (geojsonLayer) {
    turkeyMapInstance.removeLayer(geojsonLayer);
  }

  geojsonLayer = L.geoJSON(geojson, {
    style: (feature) => {
      const provinceId = feature.properties.number;
      return getStyleForProvince(provinceId);
    },
    onEachFeature: (feature, layer) => {
      const provinceId = feature.properties.number;
      const provinceObj = TURKEY_PROVINCES.find(p => p.id === provinceId) || { id: provinceId, name: feature.properties.name, region: 'marmara' };

      // Polygon Hover Effect
      layer.on({
        mouseover: (e) => {
          const l = e.target;
          l.setStyle({
            weight: 2.5,
            color: '#38bdf8', // Neon cyan border on hover
            fillOpacity: 0.95
          });
          l.bringToFront();
        },
        mouseout: (e) => {
          if (geojsonLayer) {
            geojsonLayer.resetStyle(e.target);
          }
        },
        click: () => {
          openProvinceModal(provinceObj, container);
        }
      });

      // Sleek Floating Hover Tooltip: ONLY City Name! No extra "Gitmedim/Gidildi" lines!
      layer.bindTooltip(`<span>${provinceObj.name}</span>`, {
        sticky: true,
        direction: 'top',
        offset: [0, -10],
        className: 'clean-hover-tooltip'
      });
    }
  }).addTo(turkeyMapInstance);
}

function refreshMapStyles() {
  if (geojsonLayer) {
    geojsonLayer.eachLayer(layer => {
      const provinceId = layer.feature.properties.number;
      layer.setStyle(getStyleForProvince(provinceId));
    });
  }
}

function renderProvinceList(container) {
  filterAndRenderList(container);
}

function filterAndRenderList(container) {
  const { turkeyVisits } = getStorageData();
  const search = container.querySelector('#turkey-search').value.toLowerCase().trim();
  const statusFilter = container.querySelector('#turkey-filter-pills .active').getAttribute('data-filter');
  const regionFilter = container.querySelector('#region-filter-bar .active').getAttribute('data-region');

  const listContainer = container.querySelector('#turkey-province-list');
  listContainer.innerHTML = '';

  const filtered = TURKEY_PROVINCES.filter(p => {
    const visit = turkeyVisits[p.id];
    const status = visit ? visit.status : 'unvisited';

    const matchesSearch = p.name.toLowerCase().includes(search) || p.id.toString() === search;
    
    let matchesStatus = true;
    if (statusFilter === 'visited') matchesStatus = status === 'visited';
    if (statusFilter === 'target') matchesStatus = status === 'target';

    let matchesRegion = true;
    if (regionFilter !== 'all') matchesRegion = p.region === regionFilter;

    return matchesSearch && matchesStatus && matchesRegion;
  });

  container.querySelector('#province-count-badge').textContent = `${filtered.length} İl`;

  filtered.forEach(p => {
    const visit = turkeyVisits[p.id];
    const status = visit ? visit.status : 'unvisited';

    let badgeClass = 'chip-unvisited';
    let badgeText = 'Gitmedim';
    if (status === 'visited') { badgeClass = 'chip-visited'; badgeText = 'Gidildi'; }
    if (status === 'target') { badgeClass = 'chip-target'; badgeText = 'Gezilecek'; }

    const item = document.createElement('div');
    item.className = `list-item-card status-${status}`;
    item.innerHTML = `
      <div class="item-name-box">
        <span style="font-weight: 800; color: #94a3b8; font-size: 0.85rem; width: 22px;">${p.id}</span>
        <div>
          <div class="item-title">${p.name}</div>
          <div class="item-subtitle">${TURKEY_REGIONS.find(r => r.id === p.region)?.name || ''}</div>
        </div>
      </div>
      <span class="status-badge-chip ${badgeClass}">${badgeText}</span>
    `;

    item.addEventListener('click', () => {
      openProvinceModal(p, container);
      if (turkeyMapInstance) {
        turkeyMapInstance.flyTo([p.lat, p.lng], 8, { duration: 1 });
      }
    });

    listContainer.appendChild(item);
  });
}

function openProvinceModal(province, container) {
  const { turkeyVisits } = getStorageData();
  const currentVisit = turkeyVisits[province.id] || {};
  let selectedStatus = currentVisit.status || 'unvisited';

  const modalWrapper = container.querySelector('#province-modal-wrapper');
  modalWrapper.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-card">
        <button class="modal-close-btn" id="modal-close">&times;</button>
        <div class="modal-title">
          <span>🇹🇷</span> ${province.id} - ${province.name}
        </div>
        <div class="modal-subtitle">
          ${TURKEY_REGIONS.find(r => r.id === province.region)?.name}
        </div>

        <div style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem;">Şehir Ziyaret Durumu:</div>
        <div class="status-selector">
          <button class="status-opt-btn ${selectedStatus === 'visited' ? 'selected-visited' : ''}" data-val="visited">
            ✅ Gidildi
          </button>
          <button class="status-opt-btn ${selectedStatus === 'target' ? 'selected-target' : ''}" data-val="target">
            🎯 Gezilecek
          </button>
          <button class="status-opt-btn ${selectedStatus === 'unvisited' ? 'selected-unvisited' : ''}" data-val="unvisited">
            ⚪ Gitmedim
          </button>
        </div>

        <div style="margin-bottom: 1.25rem;">
          <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #94a3b8; margin-bottom: 0.4rem;">
            Ziyaret Tarihi:
          </label>
          <input type="date" id="visit-date" value="${currentVisit.date || new Date().toISOString().split('T')[0]}" 
                 style="width: 100%; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); color: white; padding: 0.6rem; border-radius: 8px; font-family: inherit;" />
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #94a3b8; margin-bottom: 0.4rem;">
            Gezi Notları & Hatıralar:
          </label>
          <textarea id="visit-notes" placeholder="Örn: Tarihi yerleri gezdik, harika fotoğraflar çektik..." 
                    rows="3" style="width: 100%; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); color: white; padding: 0.6rem; border-radius: 8px; font-family: inherit; resize: none;"></textarea>
        </div>

        <button class="portal-cta" id="btn-save-province" style="width: 100%; background: #ff5722;">
          💾 Kaydet & Haritada Güncelle
        </button>
      </div>
    </div>
  `;

  modalWrapper.querySelector('#visit-notes').value = currentVisit.notes || '';

  // Options click
  modalWrapper.querySelectorAll('.status-opt-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      modalWrapper.querySelectorAll('.status-opt-btn').forEach(b => {
        b.className = 'status-opt-btn';
      });
      const val = e.currentTarget.getAttribute('data-val');
      selectedStatus = val;
      if (val === 'visited') e.currentTarget.classList.add('selected-visited');
      if (val === 'target') e.currentTarget.classList.add('selected-target');
      if (val === 'unvisited') e.currentTarget.classList.add('selected-unvisited');
    });
  });

  // Save
  modalWrapper.querySelector('#btn-save-province').addEventListener('click', () => {
    const date = modalWrapper.querySelector('#visit-date').value;
    const notes = modalWrapper.querySelector('#visit-notes').value;

    saveTurkeyVisit(province.id, selectedStatus, { date, notes });

    modalWrapper.innerHTML = '';
    refreshMapStyles();
    filterAndRenderList(container);
  });

  // Close
  modalWrapper.querySelector('#modal-close').addEventListener('click', () => {
    modalWrapper.innerHTML = '';
  });
}
