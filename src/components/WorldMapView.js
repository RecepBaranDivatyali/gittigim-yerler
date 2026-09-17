import L from 'leaflet';
import { WORLD_REGIONS_INDEX } from '../data/universalSearchData.js';
import { WORLD_COUNTRIES } from '../data/worldData.js';
import { TURKEY_PROVINCES } from '../data/turkeyData.js';
import { COUNTRY_CENTROIDS } from '../data/countryCoordinates.js';
import { WORLD_CITIES_INDEX } from '../data/worldCitiesData.js';
import { getLocalizedName } from '../data/regionNames.js';
import { getStorageData, saveWorldVisit, saveTurkeyVisit, toggleWorldCity, getUserFeedbacks, saveUserFeedback, updateFeedbackStatus, deleteUserFeedback, getHomeCountry, syncPendingFeedbacks, getPassportType } from '../utils/storage.js';
import { getCountryGuide, getVisaBadgeInfo } from '../data/countryGuideData.js';
import { t, getLanguage, onLanguageChange, getCountryDisplayName, getCountryFlagHtml } from '../utils/i18n.js';
import { getTheme, onThemeChange, getThemeConfig, applyTheme, getStatusColor, blendColors } from '../utils/theme.js';
import { escapeHtml } from '../utils/security.js';
import { savePhoto, getPhotosByTarget, deletePhoto } from '../utils/photoStorage.js';
import { renderSimulatorSwitcherButton } from './PhoneSimulator.js';

const countryByCode = new Map(WORLD_COUNTRIES.map(c => [c.code, c]));

const COUNTRY_LABEL_OFFSETS = {
  'IT': [42.5, 12.8],  // Italy (Centered in mainland Italian peninsula, Lazio/Abruzzo Apennines)
  'HR': [45.3, 16.0],  // Croatia (Central mainland body between Zagreb & Karlovac)
  'AT': [47.5, 14.2],  // Austria (Styria / Upper Austria body, away from edges)
  'BA': [44.1, 17.8],  // Bosnia & Herzegovina (Central Bosnia Travnik/Zenica)
  'SI': [46.12, 14.8], // Slovenia (Central body)
  'ME': [42.8, 19.3],  // Montenegro (Central Kolašin)
  'RS': [44.0, 20.8],  // Serbia (Central Šumadija Kragujevac)
  'XK': [42.6, 20.9],  // Kosovo (Central body)
  'MK': [41.6, 21.7],  // North Macedonia (Central body Veles)
  'AL': [41.1, 20.1],  // Albania (Central body Elbasan)
  'GR': [39.3, 22.0],  // Greece (Mainland Thessaly/Larissa)
  'CL': [-33.5, -70.6],// Chile (Central valley)
  'NO': [61.0, 8.5],   // Norway (Southern interior body)
  'SE': [62.5, 16.5],  // Sweden (Central mainland)
  'FI': [64.5, 26.3],  // Finland (Central body)
  'VN': [16.0, 107.5], // Vietnam (Central body Da Nang / Hue)
  'MY': [4.0, 102.0],  // Peninsular Malaysia
  'ID': [-2.0, 117.0], // Indonesia
  'JP': [36.2, 138.2], // Japan (Central Honshu)
  'CA': [56.0, -96.0], // Canada
  'US': [38.5, -97.0], // USA (Lower 48)
  'RU': [60.0, 95.0],  // Russia
  'TR': [39.0, 35.2],  // Turkey (Central Anatolia)
  'DE': [51.2, 10.4],  // Germany (Central Thuringia)
  'FR': [46.8, 2.4],   // France (Central Berry)
  'ES': [40.2, -3.7],  // Spain (Central Madrid/Castile)
  'PT': [39.5, -8.0],  // Portugal (Central interior)
  'GB': [53.5, -1.8],  // UK (Central England / Pennines)
  'IE': [53.4, -7.9],  // Ireland (Central)
  'PL': [52.1, 19.4],  // Poland (Central body Łódź)
  'UA': [49.0, 31.5],  // Ukraine (Central body)
  'CH': [46.8, 8.2],   // Switzerland (Central)
  'CZ': [49.8, 15.5],  // Czechia (Central Highlands)
  'SK': [48.7, 19.6],  // Slovakia (Central Banská Bystrica)
  'HU': [47.15, 19.5], // Hungary (Pannonian basin center)
  'RO': [45.9, 25.0],  // Romania (Central Transylvania Sibiu)
  'BG': [42.7, 25.3],  // Bulgaria (Thracian plain center)
  'NL': [52.2, 5.5],   // Netherlands mainland
  'BE': [50.6, 4.6],   // Belgium (Central)
  'DK': [55.8, 9.3],   // Denmark mainland Jutland
  'CY': [35.0, 33.2],  // Cyprus (Central Troodos/Nicosia)
  'GE': [42.0, 43.5],  // Georgia (Central body)
  'AM': [40.1, 44.8],  // Armenia (Central body)
  'AZ': [40.4, 47.5],  // Azerbaijan (Central body)
  'IQ': [33.2, 43.7],  // Iraq (Mesopotamian plain)
  'IR': [32.5, 53.7],  // Iran (Central plateau)
  'SY': [35.0, 38.5],  // Syria (Central body)
  'JO': [31.2, 36.5],  // Jordan (Central)
  'IL': [31.5, 34.8],  // Israel (Central)
  'LB': [33.9, 35.8],  // Lebanon (Central)
  'EG': [26.8, 30.0],  // Egypt (Nile Valley interior)
  'SA': [24.0, 45.0],  // Saudi Arabia (Central Najd)
};

const PROVINCE_LABEL_OFFSETS = {
  // Turkey manual fine-tuned offsets for complex coastal/peninsular shapes
  'TR::7': [36.98, 30.65],  // Antalya (Inland plateau north of gulf, safely away from sea)
  'TR::07': [36.98, 30.65],
  'TR::33': [36.88, 33.80], // Mersin (Inland plateau, safely away from coastline/sea)
  'TR::35': [38.45, 27.25], // İzmir (Central inland valley, balanced)
  'TR::48': [37.15, 28.36], // Muğla (Menteşe interior plateau)
  'TR::34': [41.12, 28.75], // İstanbul (Centrally balanced across landmass)
  'TR::10': [39.67, 27.87], // Balıkesir (Central interior)
  'TR::17': [39.98, 26.81], // Çanakkale (Biga mainland geometric center)
  'TR::14': [40.60, 31.67], // Bolu (Bolu central valley)
  'TR::41': [40.86, 29.90], // Kocaeli (Geometric center)
  'TR::77': [40.59, 29.12], // Yalova (Center)
  'TR::59': [41.11, 27.45], // Tekirdağ (Center)
  'TR::31': [36.44, 36.26], // Hatay (Center)
  'TR::9': [37.75, 28.02],  // Aydın (Center)
  'TR::09': [37.75, 28.02],
  'TR::45': [38.77, 28.15], // Manisa (Geometric & visual center of the whole province)
  'TR::22': [41.25, 26.60], // Edirne (Center)
  'TR::39': [41.68, 27.44], // Kırklareli (Geometric center)
  'TR::6': [39.80, 32.62],  // Ankara (Center of province)
  'TR::06': [39.80, 32.62],
  'TR::42': [38.04, 32.64], // Konya (Center)
  'TR::57': [41.65, 34.88], // Sinop (Central inland body)
  'TR::55': [41.21, 36.02], // Samsun (Center)
  'TR::61': [40.80, 39.82], // Trabzon (Center)
  'TR::53': [40.93, 40.87], // Rize (Center)
  'TR::8': [41.11, 41.82],  // Artvin (Center)
  'TR::08': [41.11, 41.82],
  // Georgia fine-tuned label offsets
  'GE::Ajaria': [41.60, 41.85],      // Batum (Ajaria, safely on land body)
  'GE::Tbilisi': [41.715, 44.827],   // Tiflis
  'GE::Imereti': [42.25, 42.70],     // Kutaisi
  'GE::Abkhazia': [43.05, 41.15],    // Sohum
  // Central European fine-tuned offsets (perfect optical centering in polygon)
  'AT::Wien': [48.21, 16.37],         // Wien city center
  'SK::Bratislavský': [48.25, 17.15], // Centered in Bratislava region territory
};

function getProvinceOffset(item) {
  if (!item) return null;
  if (PROVINCE_LABEL_OFFSETS[item.idKey]) return PROVINCE_LABEL_OFFSETS[item.idKey];
  if (item.countryCode === 'TR') {
    const rawNum = String(item.idKey || '').replace('TR::', '');
    const num = parseInt(rawNum, 10);
    if (!isNaN(num)) {
      const padded = `TR::${String(num).padStart(2, '0')}`;
      const unpadded = `TR::${num}`;
      if (PROVINCE_LABEL_OFFSETS[padded]) return PROVINCE_LABEL_OFFSETS[padded];
      if (PROVINCE_LABEL_OFFSETS[unpadded]) return PROVINCE_LABEL_OFFSETS[unpadded];
    }
  }
  return null;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const REGION_ZOOM = 5.5;
const SUBREGION_ZOOM = 6.8;

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
let countryBordersLayer = null;
let countryLabelsLayer = null;
let turkeyLayer = null;
let regionLayers = {};
let regionCache = {};
let subregionLayers = {};
let subregionCache = {};
const inFlightRegions = {};
const inFlightSubregions = {};

const KNOWN_SUBREGION_PARENTS = {
  'DE::Freiburg': 'Baden-Württemberg',
  'DE::Karlsruhe': 'Baden-Württemberg',
  'DE::Stuttgart': 'Baden-Württemberg',
  'DE::Tübingen': 'Baden-Württemberg',
  'DE::Nürnberg Bölgesi': 'Bayern',
  'DE::Landshut Bölgesi': 'Bayern',
  'DE::Münih Bölgesi': 'Bayern',
  'DE::Bayreuth Bölgesi': 'Bayern',
  'DE::Regensburg Bölgesi': 'Bayern',
  'DE::Augsburg Bölgesi': 'Bayern',
  'DE::Würzburg Bölgesi': 'Bayern',
  'DE::Berlin': 'Berlin',
  'DE::Brandenburg': 'Brandenburg',
  'DE::Bremen': 'Bremen',
  'DE::Hamburg': 'Hamburg',
  'DE::Frankfurt/Darmstadt': 'Hessen',
  'DE::Gießen': 'Hessen',
  'DE::Kassel': 'Hessen',
  'DE::Mecklenburg-Vorpommern': 'Mecklenburg-Vorpommern',
  'DE::Braunschweig': 'Niedersachsen',
  'DE::Hannover': 'Niedersachsen',
  'DE::Luneburg': 'Niedersachsen',
  'DE::Oldenburg': 'Niedersachsen',
  'DE::Dortmund/Arnsberg': 'Nordrhein-Westfalen',
  'DE::Bielefeld/Detmold': 'Nordrhein-Westfalen',
  'DE::Düsseldorf': 'Nordrhein-Westfalen',
  'DE::Köln': 'Nordrhein-Westfalen',
  'DE::Munster': 'Nordrhein-Westfalen',
  'DE::Koblenz': 'Rheinland-Pfalz',
  'DE::Mainz/Pfalz': 'Rheinland-Pfalz',
  'DE::Trier': 'Rheinland-Pfalz',
  'DE::Saarland': 'Saarland',
  'DE::Dessau': 'Sachsen-Anhalt',
  'DE::Halle': 'Sachsen-Anhalt',
  'DE::Magdeburg': 'Sachsen-Anhalt',
  'DE::Chemnitz': 'Sachsen',
  'DE::Dresden': 'Sachsen',
  'DE::Leipzig': 'Sachsen',
  'DE::Schleswig-Holstein': 'Schleswig-Holstein',
  'DE::Thüringen': 'Thüringen'
};

const dynamicSubregionParents = new Map();

function registerSubregionRelations(countryCode, data) {
  if (!countryCode || !data?.features) return;
  data.features.forEach(f => {
    const sName = f.properties?.name;
    const pName = f.properties?.parent_region;
    if (sName && pName) {
      dynamicSubregionParents.set(`${countryCode}::${sName}`, pName);
    }
  });
}

function getSubregionParentRegion(countryCode, subregionRawName) {
  if (!countryCode || !subregionRawName) return null;
  const key = `${countryCode}::${subregionRawName}`;
  return dynamicSubregionParents.get(key) || KNOWN_SUBREGION_PARENTS[key] || null;
}

function getSubregionsForParentRegion(countryCode, parentRegionName) {
  if (!countryCode || !parentRegionName) return [];
  const results = new Set();
  const prefix = `${countryCode}::`;

  Object.entries(KNOWN_SUBREGION_PARENTS).forEach(([k, pName]) => {
    if (k.startsWith(prefix) && pName === parentRegionName) {
      results.add(k.slice(prefix.length));
    }
  });

  dynamicSubregionParents.forEach((pName, k) => {
    if (k.startsWith(prefix) && pName === parentRegionName) {
      results.add(k.slice(prefix.length));
    }
  });

  const cached = subregionCache[countryCode];
  if (cached?.features) {
    cached.features.forEach(f => {
      if (f.properties?.parent_region === parentRegionName && f.properties?.name) {
        results.add(f.properties.name);
      }
    });
  }

  return Array.from(results);
}
let selectedCountryCode = null;
let activeStatusPopup = null;
let isVisaModeActive = false;
let activePopupOutsideListener = null;
let popupBackdropEl = null;
let provinceLabelsLayer = null;
let activeLabelPlacedBoxes = [];
let countryBordersRenderer = null;
let stateBordersRenderer = null;
let activeFeatureRenderer = null;
let activeFeatureLayer = null;
let activeLabelLayer = null;
let stateBordersLayers = {};
let countryFeaturesByCode = {};
let countryLayersByCode = {};
let sortedCountryLayers = [];
let lastZoomCategory = -1;
let lastPopupClosedAt = 0;
let _popupClosedOnPointerDown = false;
let promotedLabelMarker = null;
let promotedLabelParent = null;
let cachedWorldCountriesData = null;
let cachedTurkeyProvincesData = null;

function showPopupBackdrop(feature = null, currentStatus = 'unvisited', displayName = '', latlng = null, id = '', type = '', countryCode = '') {
  const mapContainer = map?.getContainer();
  if (mapContainer) {
    mapContainer.classList.add('map-dimmed');
  }

  if (activeFeatureLayer && map) {
    try { map.removeLayer(activeFeatureLayer); } catch {}
    activeFeatureLayer = null;
  }
  if (promotedLabelMarker && promotedLabelMarker._icon && promotedLabelParent) {
    try { promotedLabelParent.appendChild(promotedLabelMarker._icon); } catch {}
    promotedLabelMarker = null;
    promotedLabelParent = null;
  }

  if (feature && map) {
    const STATUS = getStatusConfig();
    const cfg = STATUS[currentStatus] || STATUS.unvisited;
    const themeCfg = getThemeConfig();
    const fillColor = currentStatus === 'unvisited' ? themeCfg.landFill : cfg.color;
    const normalBorder = countryBorderStyle();

    // Preserve exact normal border thickness and color (no thickening per user request)
    activeFeatureLayer = L.geoJSON(feature, {
      pane: 'activeFeaturePane',
      style: {
        color: normalBorder.color,
        weight: normalBorder.weight,
        opacity: normalBorder.opacity,
        fillColor: fillColor,
        fillOpacity: 1,
        interactive: false
      }
    }).addTo(map);
    try {
      activeFeatureLayer.bringToFront();
    } catch {}

    // Find the exact existing marker element on the map and promote it to activeFeaturePane
    // This keeps ONLY this active label sharp while all other labels blur with labelsPane!
    // Zero coordinate shift, zero font change, zero color change, zero casing change!
    let targetMarker = null;
    if (type === 'province' || type === 'region' || type === 'subregion') {
      if (provinceLabelsLayer) {
        provinceLabelsLayer.eachLayer(m => {
          if (targetMarker) return;
          if (m.featureId && (m.featureId === id || m.featureId === `${countryCode}::${id}`)) {
            targetMarker = m;
          } else if (m.featureCountry === countryCode && (
            (m.featureName && displayName && m.featureName.toLowerCase() === displayName.toLowerCase()) ||
            (m.rawName && id && id.includes(m.rawName))
          )) {
            targetMarker = m;
          }
        });
      }
    }

    if (!targetMarker && (type === 'country' || countryCode || id)) {
      const cCode = countryCode || id;
      if (countryLabelsLayer) {
        countryLabelsLayer.eachLayer(m => {
          if (targetMarker) return;
          if (m.featureCode === cCode) {
            targetMarker = m;
          }
        });
      }
    }

    if (targetMarker && targetMarker._icon) {
      const afPane = map.getPane('activeFeaturePane');
      if (afPane && targetMarker._icon.parentNode) {
        promotedLabelMarker = targetMarker;
        promotedLabelParent = targetMarker._icon.parentNode;
        afPane.appendChild(targetMarker._icon);
      }
    }
  }
}

function hidePopupBackdrop() {
  const mapContainer = map?.getContainer();
  if (mapContainer) {
    mapContainer.classList.remove('map-dimmed');
  }
  if (activeFeatureLayer && map) {
    try { map.removeLayer(activeFeatureLayer); } catch {}
    activeFeatureLayer = null;
  }
  if (promotedLabelMarker && promotedLabelMarker._icon && promotedLabelParent) {
    try { promotedLabelParent.appendChild(promotedLabelMarker._icon); } catch {}
    promotedLabelMarker = null;
    promotedLabelParent = null;
  }
}

function closeActivePopup() {
  if (activeStatusPopup) {
    lastPopupClosedAt = Date.now();
  }
  hidePopupBackdrop();
  if (activePopupOutsideListener) {
    document.removeEventListener('pointerdown', activePopupOutsideListener, true);
    activePopupOutsideListener = null;
  }
  if (activeStatusPopup && map) {
    try { map.closePopup(activeStatusPopup); } catch {}
    activeStatusPopup = null;
  }
  if (map) {
    try { map.closeTooltip(); } catch {}
    try {
      map.eachLayer(l => {
        if (l.closeTooltip) l.closeTooltip();
      });
    } catch {}
  }
}


const FEDERAL_STATE_COUNTRIES = new Set([
  'US', // United States (50 States)
  'AU', // Australia (States)
  'BR', // Brazil (States)
  'MX', // Mexico (States)
  'IN', // India (States)
  'CA', // Canada (Provinces/Territories)
  'AT', // Austria (Bundesländer)
  'CH', // Switzerland (Cantons)
  'NG', // Nigeria (States)
  'RU', // Russia (Federal Subjects)
]);

const GERMANY_STATE_NAMES = [
  'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen',
  'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen',
  'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen',
  'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'
];

function getHomeCountrySubdivisionStats(homeCode, turkeyVisits, worldVisits) {
  const isTr = homeCode === 'TR';
  const isDe = homeCode === 'DE';
  const homeCountryObj = WORLD_COUNTRIES.find(c => c.code === homeCode) || { code: 'TR', flag: '🇹🇷', name: 'Türkiye' };

  if (isTr) {
    const visited = Object.values(turkeyVisits || {}).filter(v => v?.status === 'visited').length;
    return {
      hasBoth: false,
      homeCountryObj,
      visited,
      total: 81,
      label: t('provincesVisited') || 'İl Gezildi'
    };
  }

  if (isDe) {
    const subregionNames = Object.keys(KNOWN_SUBREGION_PARENTS)
      .filter(k => k.startsWith('DE::'))
      .map(k => k.slice(4));

    const stateVisited = GERMANY_STATE_NAMES.filter(sName => {
      if (worldVisits?.[`DE::${sName}`]?.status === 'visited') return true;
      const subregions = getSubregionsForParentRegion('DE', sName);
      return subregions.some(sub => worldVisits?.[`DE::${sub}`]?.status === 'visited');
    }).length;

    const provinceVisited = subregionNames.filter(sName => {
      return worldVisits?.[`DE::${sName}`]?.status === 'visited';
    }).length;

    return {
      hasBoth: true,
      homeCountryObj,
      stateVisited,
      totalStates: 16,
      stateLabel: t('statesVisited') || 'Eyalet Gezildi',
      provinceVisited,
      totalProvinces: subregionNames.length || 40,
      provinceLabel: t('provincesVisited') || 'İl Gezildi'
    };
  }

  // Other countries
  const prefix = `${homeCode}::`;
  const visited = Object.entries(worldVisits || {}).filter(([k, v]) => k.startsWith(prefix) && v?.status === 'visited').length;
  const homeRegions = WORLD_REGIONS_INDEX.filter(r => r.countryCode === homeCode);
  const total = homeRegions.length || 0;

  const label = FEDERAL_STATE_COUNTRIES.has(homeCode)
    ? (t('statesVisited') || 'Eyalet Gezildi')
    : (t('regionsVisited') || 'Bölge Gezildi');

  return {
    hasBoth: false,
    homeCountryObj,
    visited,
    total,
    label
  };
}

function buildStatsCountriesHtml(worldCount, stats, visitedColor) {
  const homeCountryObj = stats?.homeCountryObj;
  const flagHtml = getCountryFlagHtml(homeCountryObj?.code, homeCountryObj?.flag, { width: 24, height: 16 });

  if (stats?.hasBoth) {
    const stateDenom = stats.totalStates > 0 ? `/${stats.totalStates}` : '';
    const provDenom = stats.totalProvinces > 0 ? `/${stats.totalProvinces}` : '';

    return `
      <!-- 1. Ülke Gezildi -->
      <div class="stats-item" style="display:flex;align-items:center;gap:8px;">
        <span class="stats-icon" style="font-size:1.2rem;">🌍</span>
        <div>
          <div class="stats-number" style="color:${visitedColor};">${worldCount}</div>
          <div class="stats-label">${t('countriesVisited')}</div>
        </div>
      </div>
      <div class="stats-divider-mobile"></div>

      <!-- 2. Eyalet Gezildi (Ülke Gezildinin yanında, İl Gezildinin solunda) -->
      <div class="stats-item" style="display:flex;align-items:center;gap:8px;">
        <span class="stats-icon" style="font-size:1.2rem;" title="${escapeHtml(stats.stateLabel)}">🏛️</span>
        <div>
          <div class="stats-number" style="color:${visitedColor};">${stats.stateVisited}<span class="stats-denom" style="font-size:0.75rem;color:var(--theme-text-muted, #64748b);">${stateDenom}</span></div>
          <div class="stats-label">${escapeHtml(stats.stateLabel)}</div>
        </div>
      </div>
      <div class="stats-divider-mobile"></div>

      <!-- 3. İl Gezildi -->
      <div class="stats-item" style="display:flex;align-items:center;gap:8px;">
        <span class="stats-icon-flag" style="display:inline-flex;align-items:center;justify-content:center;line-height:1;" title="${escapeHtml(homeCountryObj?.name || '')}">${flagHtml}</span>
        <div>
          <div class="stats-number" style="color:${visitedColor};">${stats.provinceVisited}<span class="stats-denom" style="font-size:0.75rem;color:var(--theme-text-muted, #64748b);">${provDenom}</span></div>
          <div class="stats-label">${escapeHtml(stats.provinceLabel)}</div>
        </div>
      </div>
    `;
  }

  const denom = (stats?.total > 0) ? `/${stats.total}` : '';
  return `
    <div class="stats-item" style="display:flex;align-items:center;gap:10px;">
      <span class="stats-icon" style="font-size:1.3rem;">🌍</span>
      <div>
        <div class="stats-number" style="color:${visitedColor};">${worldCount}</div>
        <div class="stats-label">${t('countriesVisited')}</div>
      </div>
    </div>
    <div class="stats-divider-mobile"></div>
    <div class="stats-item" style="display:flex;align-items:center;gap:10px;">
      <span class="stats-icon-flag" style="display:inline-flex;align-items:center;justify-content:center;line-height:1;" title="${escapeHtml(homeCountryObj?.name || 'Türkiye')}">${flagHtml}</span>
      <div>
        <div class="stats-number" style="color:${visitedColor};">${stats?.visited || 0}<span class="stats-denom" style="font-size:0.8rem;color:var(--theme-text-muted, #64748b);">${denom}</span></div>
        <div class="stats-label">${escapeHtml(stats?.label || '')}</div>
      </div>
    </div>
  `;
}

// ─── Entry point ──────────────────────────────────────────────────────────────
export function renderWorldMapView(container, options = {}) {
  applyTheme(getTheme());

  let activeDocListeners = [];
  function addDocListener(type, fn) {
    document.addEventListener(type, fn);
    activeDocListeners.push({ type, fn });
  }
  function clearDocListeners() {
    activeDocListeners.forEach(({ type, fn }) => document.removeEventListener(type, fn));
    activeDocListeners = [];
  }

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

    const { turkeyVisits, worldVisits } = getStorageData();
    const homeCode = getHomeCountry() || 'TR';
    const subStats = getHomeCountrySubdivisionStats(homeCode, turkeyVisits, worldVisits);

    const trVisited = Object.values(turkeyVisits || {}).filter(v => v?.status === 'visited').length;
    const worldCodes = Object.keys(worldVisits || {}).filter(k => !k.includes('::') && worldVisits[k]?.status === 'visited');
    if (trVisited > 0 && !worldCodes.includes('TR')) worldCodes.push('TR');
    const worldCount = worldCodes.length;

    return `
      <div id="map-root" style="width:100%;height:100%;position:relative;background:${themeCfg.oceanBg};">
        <div id="leaflet-map" style="width:100%;height:100%;background:${themeCfg.oceanBg};"></div>

        <!-- Visa Mode Banner (Visible only in Visa Mode) -->
        <div id="visa-mode-banner" class="visa-mode-banner" style="display:none;">
          <div class="visa-mode-inner">
            <div class="visa-mode-info">
              <span class="visa-banner-icon">🛂</span>
              <span class="visa-banner-title" id="visa-banner-title">Vize Muafiyet Haritası</span>
              <div class="visa-mode-chips">
                <span class="visa-mode-chip free">🟢 Vizesiz</span>
                <span class="visa-mode-chip voa">🟡 Kapıda / e-Vize</span>
                <span class="visa-mode-chip req">🔴 Vize Gerekli</span>
              </div>
            </div>
            <button type="button" id="btn-exit-visa-mode" class="btn-exit-visa-mode">✖️ Seyahat Haritama Dön</button>
          </div>
        </div>

        <!-- Floating Profile & Poster Buttons (top-left) -->
        <div id="profile-btn-wrap" class="floating-profile-wrap">
          <button id="btn-open-profile" class="floating-profile-btn" aria-label="${t('profile')}">
            <span class="floating-profile-avatar">${escapeHtml(userAvatar)}</span>
            <span class="floating-profile-name">${escapeHtml(userName)}</span>
          </button>
          <button id="btn-open-poster-map" class="floating-poster-btn" aria-label="${t('createPoster')}">
            <span>📸</span> <span class="poster-btn-text">${t('createPoster')}</span>
          </button>
        </div>

        <!-- Floating Live Search Bar (top-center) -->
        <div id="map-search-wrap" class="floating-search-wrap">
          <div class="map-search-input-box">
            <span class="map-search-icon">🔍</span>
            <input type="text" id="map-search-input" placeholder="${t('searchPlaceholder')}" autocomplete="off" />
            <button type="button" id="map-search-clear" class="map-search-clear" style="display:none;">✕</button>
          </div>
          <div id="map-search-results" class="map-search-results" style="display:none;"></div>
        </div>

        <!-- Floating Top-Right: Visa Mode Button & Travel Legend -->
        <div class="floating-top-right-group">
          <button type="button" id="btn-toggle-visa-mode" class="floating-visa-mode-btn" title="Vize Haritası Modu">
            <span>🛂</span> <span class="visa-btn-lbl">Vize Modu</span>
          </button>
          <div id="map-legend" class="floating-legend" title="${t('legend') || 'Lejant'}">
          <div class="legend-items-list">
            ${Object.entries(STATUS).filter(([k]) => k !== 'unvisited').map(([, v]) =>
              `<span class="legend-item"><span class="legend-dot" style="background:${v.color};box-shadow:0 0 6px ${v.color}88;"></span><span class="legend-text">${v.label.replace(/^.+? /, '')}</span></span>`
            ).join('')}
            <span class="legend-item"><span class="legend-dot" style="background:transparent;border:2px solid ${themeCfg.landBorder};"></span><span class="legend-text">${t('unvisited')}</span></span>
          </div>
          </div>
        </div>

        <!-- Stats & Layer HUD overlay (bottom-left natural stack) -->
        <div id="stats-overlay">
          <div id="layer-hud" class="floating-layer-hud" title="Harita Katmanı">
            <span id="layer-hud-icon">🌍</span>
            <span id="layer-hud-text">${t('layer1Countries')}</span>
          </div>
          <div id="stats-countries" class="stats-chip">
            ${buildStatsCountriesHtml(worldCount, subStats, visitedColor)}
          </div>
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

            <!-- Subtabs: [New Feedback] [My Feedbacks] -->
            <div class="feedback-nav-tabs">
              <button type="button" class="feedback-nav-tab active" id="fb-tab-new">${t('tabNewFeedback')}</button>
              <button type="button" class="feedback-nav-tab" id="fb-tab-list">
                ${t('tabMyFeedbacks')}
                <span id="fb-count-badge" class="fb-count-badge" style="display:none;">0</span>
              </button>
            </div>

            <!-- TAB 1: New Feedback Form -->
            <div id="fb-panel-new" class="feedback-tab-panel">
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

            <!-- TAB 2: My Feedbacks & Status List -->
            <div id="fb-panel-list" class="feedback-tab-panel" style="display:none;">
              <div id="fb-list-container" class="feedback-list-wrap">
                <!-- Injected dynamically -->
              </div>

              <!-- Admin Mode Toggle & Login Section -->
              <div class="fb-admin-section" id="fb-admin-auth-section">
                <div class="fb-admin-toggle-row">
                  <button type="button" id="btn-toggle-admin" class="fb-admin-toggle-btn">
                    <span>👑</span> <span>${t('adminMode')}</span>
                  </button>
                </div>
                <div id="fb-admin-drawer" class="fb-admin-drawer" style="display:none;margin-top:8px;">
                  <div class="fb-admin-auth-row" id="fb-admin-auth-row">
                    <input type="password" id="fb-admin-pin" class="feedback-input" style="width:140px;margin:0;" placeholder="${t('adminPinPlaceholder')}" />
                    <button type="button" id="btn-admin-login" class="feedback-submit-btn" style="width:auto;padding:8px 16px;margin:0;">Giriş</button>
                  </div>
                </div>
              </div>
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
    clearDocListeners();
    const currentLang = getLanguage();

    // Search Autocomplete Handler
    const searchInput = container.querySelector('#map-search-input');
    const searchClear = container.querySelector('#map-search-clear');
    const searchResults = container.querySelector('#map-search-results');

    // ── Universal Search Database: Every Clickable Country, Province, Capital, City & World Region ──
    const searchDatabase = [
      // 1. Turkey 81 Provinces
      ...TURKEY_PROVINCES.map(p => ({
        type: 'province',
        id: `TR::${p.id}`,
        name: p.name,
        altName: '',
        sub: 'Türkiye (İl)',
        flag: getFlagHtml('TR'),
        coords: [p.lat, p.lng],
        countryCode: 'TR'
      })),
      // 2. World Countries (All 241 countries with accurate centroids)
      ...WORLD_COUNTRIES.map(c => {
        let altName = c.nameEn || c.name;
        if (c.code === 'GB') {
          altName = 'Birleşik Krallık / United Kingdom / UK / England / Great Britain / Büyük Britanya / Londra / London';
        } else if (c.code === 'IE') {
          altName = 'Ireland / Republic of Ireland / İrlanda Cumhuriyeti / Dublin';
        }
        return {
          type: 'country',
          id: c.code,
          name: getCountryDisplayName(c),
          altName: altName,
          sub: currentLang === 'tr' ? (c.code === 'GB' ? 'Birleşik Krallık / UK' : (c.nameEn || c.name)) : (c.code === 'GB' ? 'İngiltere / United Kingdom' : c.name),
          flag: getFlagHtml(c.code),
          coords: COUNTRY_CENTROIDS[c.code] || COUNTRY_LABEL_OFFSETS[c.code] || null,
          countryCode: c.code
        };
      }),
      // 2B. Direct Fast-Search for UK Constituent Nations
      {
        type: 'region',
        id: 'GB::Scotland',
        name: 'İskoçya',
        altName: 'Scotland / Edinburgh / Glasgow / Highlands / UK',
        sub: 'İngiltere & Birleşik Krallık (Kurucu Ülke)',
        flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
        coords: [56.4907, -4.2026],
        countryCode: 'GB'
      },
      {
        type: 'region',
        id: 'GB::Wales',
        name: 'Galler',
        altName: 'Wales / Cymru / Cardiff / UK',
        sub: 'İngiltere & Birleşik Krallık (Kurucu Ülke)',
        flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
        coords: [52.1307, -3.7837],
        countryCode: 'GB'
      },
      {
        type: 'region',
        id: 'GB::Northern Ireland',
        name: 'Kuzey İrlanda',
        altName: 'Northern Ireland / Belfast / Ulster / UK',
        sub: 'İngiltere & Birleşik Krallık (Bölge)',
        flag: '🇬🇧',
        coords: [54.7877, -6.4923],
        countryCode: 'GB'
      },
      // 3. World Capitals & Major Global Cities (Over 240 global hubs with TR/EN names)
      ...WORLD_CITIES_INDEX.map(city => {
        const c = countryByCode.get(city.countryCode);
        const countryName = c ? getCountryDisplayName(c) : city.countryCode;
        const isTr = currentLang === 'tr';
        const primary = isTr ? city.nameTr : city.nameEn;
        const secondary = isTr ? city.nameEn : city.nameTr;
        return {
          type: 'city',
          id: `${city.countryCode}::${city.nameEn}`,
          name: primary,
          altName: secondary,
          sub: `${countryName} (Şehir/Başkent)`,
          flag: getFlagHtml(city.countryCode),
          coords: [city.lat, city.lng],
          countryCode: city.countryCode
        };
      }),
      // 4. All World Regions & Subdivisions (3,500+ states, provinces, prefectures, cantons)
      ...WORLD_REGIONS_INDEX.map(r => {
        const c = countryByCode.get(r.countryCode);
        const countryName = c ? getCountryDisplayName(c) : r.countryCode;
        const localizedName = getLocalizedName(r.name, r.countryCode);
        return {
          type: 'region',
          id: `${r.countryCode}::${r.name}`,
          name: localizedName,
          altName: r.name !== localizedName ? r.name : '',
          sub: `${countryName} (Bölge/Eyalet)`,
          flag: getFlagHtml(r.countryCode),
          coords: (r.lat && r.lng) ? [r.lat, r.lng] : (COUNTRY_CENTROIDS[r.countryCode] || null),
          countryCode: r.countryCode
        };
      })
    ];

    if (searchInput && searchResults) {
      let searchTimeout = null;
      let selectedResultIndex = -1;

      const updateSelectedResult = () => {
        const items = searchResults.querySelectorAll('.search-item');
        items.forEach((item, i) => {
          if (i === selectedResultIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest' });
          } else {
            item.classList.remove('selected');
          }
        });
      };

      searchInput.addEventListener('keydown', (e) => {
        const items = searchResults.querySelectorAll('.search-item:not(.empty)');
        if (!items || items.length === 0 || searchResults.style.display === 'none') return;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectedResultIndex = (selectedResultIndex + 1) % items.length;
          updateSelectedResult();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectedResultIndex = (selectedResultIndex - 1 + items.length) % items.length;
          updateSelectedResult();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (selectedResultIndex >= 0 && items[selectedResultIndex]) {
            items[selectedResultIndex].click();
          } else if (items[0]) {
            items[0].click();
          }
        } else if (e.key === 'Escape') {
          searchResults.style.display = 'none';
        }
      });

      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          const query = searchInput.value.trim().toLowerCase();
          selectedResultIndex = -1;
          if (query.length === 0) {
            searchResults.style.display = 'none';
            if (searchClear) searchClear.style.display = 'none';
            return;
          }
          if (searchClear) searchClear.style.display = 'block';

          const norm = (s) => (s || '').toLowerCase()
            .replace(/ı/g, 'i')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c');
          const qNorm = norm(query);

          // Search matches with prioritization scoring: exact match > startsWith > includes
          const scoredMatches = [];
          for (let i = 0; i < searchDatabase.length; i++) {
            const item = searchDatabase[i];
            const nameNorm = norm(item.name);
            const altNorm = norm(item.altName);
            const subNorm = norm(item.sub);

            let score = 0;
            if (nameNorm === qNorm) {
              score = 100;
            } else if (nameNorm.startsWith(qNorm)) {
              score = 80;
            } else if (altNorm.startsWith(qNorm)) {
              score = 60;
            } else if (nameNorm.includes(qNorm)) {
              score = 40;
            } else if (altNorm.includes(qNorm)) {
              score = 20;
            } else if (subNorm.includes(qNorm)) {
              score = 10;
            }

            if (score > 0) {
              if (item.type === 'country') score += 5;
              else if (item.type === 'province') score += 3;
              scoredMatches.push({ item, score });
            }
          }

          scoredMatches.sort((a, b) => b.score - a.score);
          const matches = scoredMatches.slice(0, 12).map(s => s.item);

          if (matches.length === 0) {
            searchResults.innerHTML = `<div class="search-item empty">${t('searchNoResults')}</div>`;
            searchResults.style.display = 'block';
            return;
          }

          searchResults.innerHTML = matches.map((m, idx) => `
            <div class="search-item" data-idx="${idx}">
              <span class="search-item-flag">${m.flag}</span>
              <div class="search-item-info">
                <span class="search-item-title">${m.name}${m.altName && m.altName !== m.name ? ` <span style="opacity:0.6;font-size:0.8em;">(${m.altName})</span>` : ''}</span>
                <span class="search-item-sub">${m.sub}</span>
              </div>
            </div>
          `).join('');
          searchResults.style.display = 'block';

          searchResults.querySelectorAll('.search-item').forEach(itemEl => {
            itemEl.addEventListener('click', async () => {
              const idx = parseInt(itemEl.dataset.idx, 10);
              const m = matches[idx];
              if (!m) return;
              searchResults.style.display = 'none';
              searchInput.value = '';
              if (searchClear) searchClear.style.display = 'none';

              // If it's a world region or city, ensure country's region layer is loaded
              if ((m.type === 'region' || m.type === 'city') && m.countryCode && m.countryCode !== 'TR') {
                if (!regionLayers[m.countryCode]) {
                  await loadRegionData(m.countryCode);
                }
              }

              const coords = m.coords || (m.countryCode ? COUNTRY_CENTROIDS[m.countryCode] : null);
              if (coords && map) {
                const targetZoom = m.type === 'country' ? 5.0 : (m.type === 'province' ? 6.5 : (m.type === 'city' ? 7.5 : 6.5));
                map.flyTo(coords, targetZoom, { duration: 0.8 });
                setTimeout(() => {
                  if (m.countryCode) {
                    selectedCountryCode = m.countryCode;
                    refreshStats();
                  }
                  const titleHtml = `${m.flag} ${m.name}`;
                  openStatusPopup(coords, m.id || m.countryCode, titleHtml, m.type, m.countryCode);
                }, 850);
              }
            });
          });
        }, 150);
      });

      if (searchClear) {
        searchClear.addEventListener('click', () => {
          searchInput.value = '';
          searchResults.style.display = 'none';
          searchClear.style.display = 'none';
        });
      }

      // Close search results on outside click
      addDocListener('click', (e) => {
        if (!e.target.closest('#map-search-wrap')) {
          searchResults.style.display = 'none';
        }
      });
    }

    // Mount Desktop Simulator Switcher if running in fullscreen mode
    renderSimulatorSwitcherButton();

    // Visa Mode Toggle Handling
    const visaToggleBtn = container.querySelector('#btn-toggle-visa-mode');
    const visaExitBtn = container.querySelector('#btn-exit-visa-mode');
    const visaBanner = container.querySelector('#visa-mode-banner');
    const legendEl = container.querySelector('#map-legend');

    function toggleVisaMode() {
      isVisaModeActive = !isVisaModeActive;
      const pType = getPassportType();

      if (isVisaModeActive) {
        if (visaBanner) {
          visaBanner.style.display = 'block';
          const titleEl = container.querySelector('#visa-banner-title');
          if (titleEl) {
            titleEl.textContent = pType === 'yesil' ? 'Yeşil (Hususi) Pasaport Vize Haritası' : 'Bordo Pasaport Vize Haritası';
          }
        }
        if (visaToggleBtn) visaToggleBtn.classList.add('active');
        if (legendEl) legendEl.style.display = 'none';
      } else {
        if (visaBanner) visaBanner.style.display = 'none';
        if (visaToggleBtn) visaToggleBtn.classList.remove('active');
        if (legendEl) legendEl.style.display = '';
      }

      if (worldLayer) {
        worldLayer.setStyle(countryStyle);
      }
    }

    visaToggleBtn?.addEventListener('click', toggleVisaMode);
    visaExitBtn?.addEventListener('click', () => {
      if (isVisaModeActive) toggleVisaMode();
    });

    // Poster button handler
    const posterBtn = container.querySelector('#btn-open-poster-map');
    if (posterBtn) {
      posterBtn.addEventListener('click', () => {
        if (options.onOpenProfile) {
          // Open profile in poster mode or open profile view
          window.__openPosterOnProfile = true;
          options.onOpenProfile();
        }
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

    // Subtabs: New / List
    const tabNew = container.querySelector('#fb-tab-new');
    const tabList = container.querySelector('#fb-tab-list');
    const panelNew = container.querySelector('#fb-panel-new');
    const panelList = container.querySelector('#fb-panel-list');
    const countBadge = container.querySelector('#fb-count-badge');

    // Admin Mode state (persisted across reloads)
    let isAdminActive = localStorage.getItem('gv_admin_active') === '1';

    function updateBadgeCount() {
      const fbs = getUserFeedbacks();
      if (countBadge) {
        if (fbs.length > 0) {
          countBadge.textContent = fbs.length;
          countBadge.style.display = 'inline-flex';
        } else {
          countBadge.style.display = 'none';
        }
      }
    }

    function renderFeedbackList() {
      const feedbacks = getUserFeedbacks();
      const listWrap = container.querySelector('#fb-list-container');
      const authSection = container.querySelector('#fb-admin-auth-section');
      updateBadgeCount();
      if (!listWrap) return;

      if (authSection) {
        authSection.style.display = isAdminActive ? 'none' : 'block';
      }

      const statusMap = {
        pending: { label: t('statusPending'), class: 'status-pending' },
        considering: { label: t('statusConsidering'), class: 'status-considering' },
        in_progress: { label: t('statusProgress'), class: 'status-progress' },
        resolved: { label: t('statusResolved'), class: 'status-resolved' },
        declined: { label: t('statusDeclined'), class: 'status-declined' }
      };

      const typeIconMap = {
        bug: '🐞',
        feature: '✨',
        suggestion: '💡',
        other: '💬'
      };

      let html = '';

      if (isAdminActive) {
        html += `
          <div class="fb-admin-status-banner">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:1.3rem;">👑</span>
              <div>
                <div style="font-weight:800;font-size:0.85rem;color:#10b981;">Yönetici Modu (${feedbacks.length} Bildirim)</div>
                <div style="font-size:0.72rem;color:#94a3b8;">Aşağı kaydırarak her bildirimin durumuna dokunabilirsiniz</div>
              </div>
            </div>
            <button type="button" id="btn-admin-logout" class="fb-admin-logout-btn">Çıkış Yap</button>
          </div>
        `;
      }

      if (feedbacks.length === 0) {
        html += `
          <div class="fb-empty-state">
            <span style="font-size:2.5rem;display:block;margin-bottom:8px;">📬</span>
            <p>${t('noFeedbacksYet')}</p>
            ${isAdminActive ? '<p style="font-size:0.75rem;color:#64748b;margin-top:6px;">Kullanıcılar bildirim gönderdikçe bu listede görünecektir.</p>' : ''}
          </div>
        `;
        listWrap.innerHTML = html;
        if (isAdminActive) {
          container.querySelector('#btn-admin-logout')?.addEventListener('click', () => {
            isAdminActive = false;
            localStorage.removeItem('gv_admin_active');
            renderFeedbackList();
          });
        }
        return;
      }

      html += feedbacks.map(fb => {
        const st = statusMap[fb.status] || statusMap.pending;
        const icon = typeIconMap[fb.type] || '💡';
        const dateStr = fb.createdAt ? new Date(fb.createdAt).toLocaleDateString(currentLang === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

        return `
          <div class="feedback-card ${isAdminActive ? 'is-admin-card' : ''}" data-id="${escapeHtml(fb.id)}">
            <div class="fb-card-header">
              <div class="fb-card-meta">
                <span class="fb-type-icon">${icon}</span>
                <span class="fb-card-date">${dateStr}</span>
                ${isAdminActive ? `<span style="font-size:0.72rem;color:#38bdf8;font-weight:700;">👤 ${escapeHtml(fb.username || 'Gezgin')}</span>` : ''}
                ${(isAdminActive && fb.contact) ? `<span style="font-size:0.72rem;color:#94a3b8;">📱 ${escapeHtml(fb.contact)}</span>` : ''}
              </div>
              <div style="display:flex;align-items:center;gap:6px;">
                ${fb.synced === false ? `<span class="feedback-status-badge status-pending" title="İnternet bağlantısı kurulduğunda iletilecektir" style="background:rgba(234,179,8,0.18);color:#fbbf24;border-color:rgba(234,179,8,0.35);">⏳ İletilmeyi Bekliyor</span>` : ''}
                <span class="feedback-status-badge ${st.class}">${st.label}</span>
              </div>
            </div>
            <div class="fb-card-msg">${escapeHtml(fb.message)}</div>
            ${fb.devResponse ? `
              <div class="fb-dev-response">
                <div class="fb-dev-response-title">💬 ${t('devResponse')}:</div>
                <div class="fb-dev-response-text">${escapeHtml(fb.devResponse)}</div>
              </div>
            ` : ''}
            ${isAdminActive ? `
              <div class="fb-admin-direct-controls">
                <div class="fb-admin-controls-title">Durum Seçin (Tek Tıkla Belirleyin):</div>
                <div class="fb-admin-pills-row">
                  <button type="button" class="fb-pill-btn ${fb.status === 'pending' ? 'active status-pending' : ''}" data-id="${escapeHtml(fb.id)}" data-status="pending">⏳ İnceleniyor</button>
                  <button type="button" class="fb-pill-btn ${fb.status === 'considering' ? 'active status-considering' : ''}" data-id="${escapeHtml(fb.id)}" data-status="considering">💡 Düşünülüyor</button>
                  <button type="button" class="fb-pill-btn ${fb.status === 'in_progress' ? 'active status-progress' : ''}" data-id="${escapeHtml(fb.id)}" data-status="in_progress">🛠️ Hazırlanıyor</button>
                  <button type="button" class="fb-pill-btn ${fb.status === 'resolved' ? 'active status-resolved' : ''}" data-id="${escapeHtml(fb.id)}" data-status="resolved">✅ Yapıldı</button>
                  <button type="button" class="fb-pill-btn ${fb.status === 'declined' ? 'active status-declined' : ''}" data-id="${escapeHtml(fb.id)}" data-status="declined">🛑 Vazgeçildi</button>
                </div>

                <div class="fb-admin-actions-bar">
                  <button type="button" class="fb-action-link-btn fb-toggle-note-btn" data-id="${escapeHtml(fb.id)}">
                    ${fb.devResponse ? '✏️ Yanıtı Güncelle' : '💬 Kullanıcıya Yanıt Yaz'}
                  </button>
                  <button type="button" class="fb-action-link-btn fb-delete-card-btn" data-id="${escapeHtml(fb.id)}" style="color:#ef4444;">
                    🗑️ Sil
                  </button>
                </div>

                <div class="fb-inline-note-box" id="note-box-${escapeHtml(fb.id)}" style="display:none;">
                  <textarea class="feedback-textarea fb-note-text" rows="2" placeholder="Kullanıcıya gösterilecek geliştirici yanıtı yazın...">${escapeHtml(fb.devResponse || '')}</textarea>
                  <div style="display:flex;gap:6px;justify-content:flex-end;margin-top:6px;">
                    <button type="button" class="feedback-submit-btn fb-save-note-btn" data-id="${escapeHtml(fb.id)}" style="width:auto;padding:6px 14px;font-size:0.8rem;margin:0;">Kaydet</button>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');

      listWrap.innerHTML = html;

      // Attach listeners in Admin Mode
      if (isAdminActive) {
        // Logout listener
        container.querySelector('#btn-admin-logout')?.addEventListener('click', (e) => {
          e.stopPropagation();
          isAdminActive = false;
          localStorage.removeItem('gv_admin_active');
          renderFeedbackList();
        });

        // Quick status pills (1-click direct status toggle)
        listWrap.querySelectorAll('.fb-pill-btn[data-status]').forEach(pb => {
          pb.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetId = pb.getAttribute('data-id');
            const targetStatus = pb.getAttribute('data-status');
            updateFeedbackStatus(targetId, targetStatus);
            renderFeedbackList();
          });
        });

        // Toggle developer response box
        listWrap.querySelectorAll('.fb-toggle-note-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetId = btn.getAttribute('data-id');
            const box = container.querySelector('#note-box-' + targetId);
            if (box) {
              const isHidden = box.style.display === 'none';
              box.style.display = isHidden ? 'block' : 'none';
            }
          });
        });

        // Save developer response note
        listWrap.querySelectorAll('.fb-save-note-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetId = btn.getAttribute('data-id');
            const box = container.querySelector('#note-box-' + targetId);
            const noteText = box?.querySelector('.fb-note-text')?.value?.trim() || '';
            const fbItem = feedbacks.find(f => f.id === targetId);
            updateFeedbackStatus(targetId, fbItem?.status || 'pending', noteText);
            renderFeedbackList();
          });
        });

        // Delete feedback card
        listWrap.querySelectorAll('.fb-delete-card-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetId = btn.getAttribute('data-id');
            if (confirm('Bu bildirimi silmek istediğinize emin misiniz?')) {
              deleteUserFeedback(targetId);
              renderFeedbackList();
            }
          });
        });
      }
    }

    // Initialize badge count immediately
    updateBadgeCount();

    // Modal open/close listeners with ghost-click protection
    let lastModalOpenedAt = 0;
    const handleOpenModal = (e) => {
      if (e) {
        e.stopPropagation();
        if (e.type === 'touchend') e.preventDefault();
      }
      lastModalOpenedAt = Date.now();
      if (feedbackModal) {
        feedbackModal.style.display = 'flex';
        updateBadgeCount();
        syncPendingFeedbacks().then(() => {
          updateBadgeCount();
          if (tabList && tabList.classList.contains('active')) {
            renderFeedbackList();
          }
        });
        if (tabList && tabList.classList.contains('active')) {
          renderFeedbackList();
        }
      }
    };

    if (openFeedbackBtn) {
      openFeedbackBtn.addEventListener('click', handleOpenModal);
      openFeedbackBtn.addEventListener('touchend', handleOpenModal);
    }

    if (closeFeedbackBtn && feedbackModal) {
      const handleCloseModal = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.type === 'touchend') e.preventDefault();
        }
        feedbackModal.style.display = 'none';
      };
      closeFeedbackBtn.addEventListener('click', handleCloseModal);
      closeFeedbackBtn.addEventListener('touchend', handleCloseModal);
    }

    if (feedbackModal) {
      feedbackModal.addEventListener('click', (e) => {
        // Prevent accidental closing right after touch-opening
        if (Date.now() - lastModalOpenedAt < 350) return;
        if (e.target === feedbackModal) feedbackModal.style.display = 'none';
      });
    }

    // Subtab click handlers (New Feedback / My Feedbacks)
    if (tabNew && tabList && panelNew && panelList) {
      const showNewTab = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.type === 'touchend') e.preventDefault();
        }
        tabNew.classList.add('active');
        tabList.classList.remove('active');
        panelNew.style.display = 'block';
        panelList.style.display = 'none';
      };

      const showListTab = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.type === 'touchend') e.preventDefault();
        }
        tabList.classList.add('active');
        tabNew.classList.remove('active');
        panelList.style.display = 'block';
        panelNew.style.display = 'none';
        renderFeedbackList();
      };

      tabNew.addEventListener('click', showNewTab);
      tabNew.addEventListener('touchend', showNewTab);
      tabList.addEventListener('click', showListTab);
      tabList.addEventListener('touchend', showListTab);
    }

    // Feedback type buttons
    let activeFeedbackType = 'suggestion';
    container.querySelectorAll('.feedback-type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        container.querySelectorAll('.feedback-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFeedbackType = btn.getAttribute('data-type');
      });
    });

    // Feedback submit button
    if (submitFeedbackBtn) {
      submitFeedbackBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const msg = container.querySelector('#feedback-message')?.value?.trim();
        const contact = container.querySelector('#feedback-contact')?.value?.trim();
        if (!msg) return;

        submitFeedbackBtn.disabled = true;
        const origText = submitFeedbackBtn.textContent;
        submitFeedbackBtn.textContent = '⏳ Gönderiliyor...';

        const feedbackId = 'fb_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

        let isSent = false;
        // 1. Send via secure Vercel serverless API endpoint
        try {
          const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          const apiUrl = isLocal && !window.Capacitor
            ? 'https://gittigim-yerler.vercel.app/api/feedback'
            : '/api/feedback';

          const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: feedbackId,
              type: activeFeedbackType,
              message: msg,
              contact,
              username: userName
            })
          });

          if (res.ok) {
            isSent = true;
          } else {
            console.warn('Feedback serverless endpoint returned status:', res.status);
          }
        } catch (err) {
          console.warn('Feedback offline, saved locally for auto-sync:', err);
        }

        // 2. Save to user feedbacks storage
        saveUserFeedback({
          id: feedbackId,
          type: activeFeedbackType,
          message: msg,
          contact,
          username: userName,
          synced: isSent
        });

        submitFeedbackBtn.disabled = false;
        submitFeedbackBtn.textContent = origText;

        const successMsg = container.querySelector('#feedback-success-msg');
        if (successMsg) {
          successMsg.style.display = 'block';
          updateBadgeCount();
          setTimeout(() => {
            successMsg.style.display = 'none';
            if (container.querySelector('#feedback-message')) container.querySelector('#feedback-message').value = '';
            if (container.querySelector('#feedback-contact')) container.querySelector('#feedback-contact').value = '';
            // Switch to list tab to see submitted item!
            if (tabList) tabList.click();
          }, 1200);
        }
      });
    }

    // Admin Drawer & Auth Handlers
    const btnToggleAdmin = container.querySelector('#btn-toggle-admin');
    const adminDrawer = container.querySelector('#fb-admin-drawer');
    const btnAdminLogin = container.querySelector('#btn-admin-login');
    const adminPinInput = container.querySelector('#fb-admin-pin');

    if (btnToggleAdmin && adminDrawer) {
      btnToggleAdmin.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = adminDrawer.style.display === 'none';
        adminDrawer.style.display = isHidden ? 'block' : 'none';
        if (isHidden && adminPinInput) adminPinInput.focus();
      });
    }

    if (btnAdminLogin && adminPinInput) {
      const handleAdminLogin = (e) => {
        if (e) e.stopPropagation();
        const pin = adminPinInput.value.trim();
        if (pin === '1923' || pin === 'admin') {
          isAdminActive = true;
          localStorage.setItem('gv_admin_active', '1');
          adminPinInput.value = '';
          if (adminDrawer) adminDrawer.style.display = 'none';
          renderFeedbackList();
        } else {
          alert('Hatalı PIN!');
        }
      };

      btnAdminLogin.addEventListener('click', handleAdminLogin);
      adminPinInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAdminLogin(e);
        }
      });
    }

    // Disable click / touch propagation on floating overlays so map doesn't steal button taps
    const floatingSelectors = [
      '#map-legend',
      '.floating-profile-wrap',
      '.floating-poster-btn',
      '.floating-search-wrap',
      '#stats-overlay'
    ];
    floatingSelectors.forEach(sel => {
      const el = container.querySelector(sel);
      if (el) {
        L.DomEvent.disableClickPropagation(el);
        L.DomEvent.disableScrollPropagation(el);
      }
    });

    // Legend Tap to Toggle Popover
    const mapLegend = container.querySelector('#map-legend');
    if (mapLegend) {
      mapLegend.addEventListener('click', (e) => {
        e.stopPropagation();
        mapLegend.classList.toggle('expanded');
      });
      addDocListener('click', (e) => {
        if (mapLegend && !mapLegend.contains(e.target) && mapLegend.classList.contains('expanded')) {
          mapLegend.classList.remove('expanded');
        }
      });
    }
  }

  attachUIEvents();

  const unsubLang = onLanguageChange(() => {
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
    updateLegendColors();
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
          `<span class="legend-item"><span class="legend-dot" style="background:${v.color};box-shadow:0 0 6px ${v.color}88;"></span><span class="legend-text">${v.label.replace(/^.+? /, '')}</span></span>`
        ).join('')}
        <span class="legend-item"><span class="legend-dot" style="background:transparent;border:2px solid ${themeCfg.landBorder};box-shadow:none;"></span><span class="legend-text">${t('unvisited')}</span></span>
      </div>
    `;
  }

  const unsubTheme = onThemeChange((newTheme) => {
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
  window.__leafletMapInstance = map;
  refreshStats();

  const cleanup = () => {
    closeActivePopup();
    clearDocListeners();
    if (typeof unsubLang === 'function') unsubLang();
    if (typeof unsubTheme === 'function') unsubTheme();
    if (_labelUpdateTimer) { clearTimeout(_labelUpdateTimer); _labelUpdateTimer = null; }
    if (window.__leafletMapInstance === map) window.__leafletMapInstance = null;
    if (promotedLabelMarker && promotedLabelMarker._icon && promotedLabelParent) {
      try { promotedLabelParent.appendChild(promotedLabelMarker._icon); } catch {}
    }
    promotedLabelMarker = null;
    promotedLabelParent = null;
    if (map) { map.remove(); map = null; }
    regionLayers = {};
    subregionLayers = {};
    countriesLayer = null;
    countryBordersLayer = null;
    stateBordersLayers = {};
    turkeyLayer = null;
    countryLabelsLayer = null;
    provinceLabelsLayer = null;
    activeStatusPopup = null;
    activeFeatureLayer = null;
    activeLabelLayer = null;
    activeLabelPlacedBoxes = [];
    invalidateStorageCache();
  };

  window.__cleanupWorldMap = cleanup;
  return cleanup;
}

function refreshAllStyles() {
  invalidateStorageCache();
  if (countryBordersLayer) {
    countryBordersLayer.setStyle(countryBorderStyle());
  }
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
  regionLayers = {};
  stateBordersLayers = {};
  subregionLayers = {};
  countriesLayer = null;
  countryBordersLayer = null;
  turkeyLayer = null;
  countryLabelsLayer = null;
  provinceLabelsLayer = null;
  activeStatusPopup = null;
  activePopupOutsideListener = null;
  activeFeatureLayer = null;
  activeLabelLayer = null;
  activeLabelPlacedBoxes = [];

  const themeCfg = getThemeConfig();

  map = L.map(el, {
    center: [39.0, 35.0],
    zoom: 4,
    minZoom: 2,
    maxZoom: 12,
    zoomControl: false,
    attributionControl: false,
    doubleClickZoom: true,
    tap: false,
    worldCopyJump: false,
    maxBounds: [[-85, -180], [85, 180]],
    maxBoundsViscosity: 1.0,
    inertia: true,
    inertiaDeceleration: 3000,
    easeLinearity: 0.2,
    zoomAnimation: true,
    fadeAnimation: true,
    markerZoomAnimation: true,
  });

  map.on('popupclose', () => {
    lastPopupClosedAt = Date.now();
    hidePopupBackdrop();
    if (activePopupOutsideListener) {
      document.removeEventListener('pointerdown', activePopupOutsideListener, true);
      activePopupOutsideListener = null;
    }
    activeStatusPopup = null;
    if (map) {
      try { map.closeTooltip(); } catch {}
    }
  });

  map.on('tooltipopen', (e) => {
    if (activeStatusPopup || _popupClosedOnPointerDown || (Date.now() - lastPopupClosedAt < 800)) {
      try {
        if (e.tooltip) map.closeTooltip(e.tooltip);
        if (e.tooltip?._source) e.tooltip._source.closeTooltip();
      } catch {}
    }
  });

  map.on('click', () => {
    closeActivePopup();
  });

  document.addEventListener('pointerup', () => {
    if (_popupClosedOnPointerDown) {
      setTimeout(() => {
        _popupClosedOnPointerDown = false;
      }, 150);
    }
  }, true);

  // Optimized SVG renderer buffer: 0.2 padding keeps SVG canvas compact and eliminates GPU stalls
  mapRenderer = L.svg({ padding: 0.2 });

  map.createPane('countriesPane');
  map.getPane('countriesPane').style.zIndex = 410;

  map.createPane('statesPane');
  map.getPane('statesPane').style.zIndex = 420;

  map.createPane('citiesPane');
  map.getPane('citiesPane').style.zIndex = 430;

  // Level 3 State / Province Borders Pane: Always drawn above cities!
  map.createPane('stateBordersPane');
  map.getPane('stateBordersPane').style.zIndex = 440;
  map.getPane('stateBordersPane').style.pointerEvents = 'none';
  stateBordersRenderer = L.svg({ pane: 'stateBordersPane', padding: 0.2 });

  // Prominent Country Borders Pane: Level 1 & Level 2 bold country borders, always above states and cities!
  map.createPane('countryBordersPane');
  map.getPane('countryBordersPane').style.zIndex = 450;
  map.getPane('countryBordersPane').style.pointerEvents = 'none';
  countryBordersRenderer = L.svg({ pane: 'countryBordersPane', padding: 0.2 });

  map.createPane('labelsPane');
  map.getPane('labelsPane').style.zIndex = 460;
  map.getPane('labelsPane').style.pointerEvents = 'none';

  // Active Feature Pane: rendered crystal clear above backdrop (650), completely unblurred!
  const afPane = map.createPane('activeFeaturePane');
  afPane.style.zIndex = 660;
  afPane.style.pointerEvents = 'none';
  afPane.classList.add('no-blur-pane', 'leaflet-activefeature-pane', 'leaflet-activeFeature-pane');

  const ppPane = map.getPane('popupPane');
  if (ppPane) {
    ppPane.classList.add('no-blur-pane');
  }
  activeFeatureRenderer = L.svg({ pane: 'activeFeaturePane', padding: 0.2 });

  countryLabelsLayer = L.layerGroup([], { pane: 'labelsPane' }).addTo(map);
  provinceLabelsLayer = L.layerGroup([], { pane: 'labelsPane' }).addTo(map);

  el.style.backgroundColor = themeCfg.oceanBg;

  const baseUrl = import.meta.env.BASE_URL || './';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';

  // Load World Countries
  const loadWorldPromise = cachedWorldCountriesData
    ? Promise.resolve(cachedWorldCountriesData)
    : fetch(`${cleanBase}data/world-countries.json`).then(r => {
        if (!r.ok) throw new Error('Network ' + r.status);
        return r.json();
      }).then(d => {
        cachedWorldCountriesData = d;
        return d;
      });

  loadWorldPromise.then(data => {
    countryFeaturesByCode = {};
    if (data && data.features) {
      data.features.forEach(f => {
        const c = findCountry(f);
        if (c && c.code) {
          countryFeaturesByCode[c.code] = f;
        }
      });
    }
    countryLayersByCode = {};
    countriesLayer = L.geoJSON(data, {
      renderer: mapRenderer,
      pane: 'countriesPane',
      style: f => countryStyle(findCountry(f)),
      onEachFeature: (f, layer) => {
        const c = findCountry(f);
        if (c && c.code) {
          countryLayersByCode[c.code] = layer;
        }
        layer.on('click', e => {
          if (activeStatusPopup || _popupClosedOnPointerDown || (Date.now() - lastPopupClosedAt < 400)) {
            _popupClosedOnPointerDown = false;
            closeActivePopup();
            if (map) {
              try { map.closeTooltip(); } catch {}
            }
            L.DomEvent.stopPropagation(e);
            return;
          }
          if (!c) return;
          const zoom = map?.getZoom() || 3;
          if (zoom >= REGION_ZOOM) {
            const hasReg = (regionLayers[c.code] && map.hasLayer(regionLayers[c.code])) ||
                           (c.code === 'TR' && turkeyLayer && map.hasLayer(turkeyLayer));
            if (hasReg) return;
          }
          L.DomEvent.stopPropagation(e);
          selectedCountryCode = c.code;
          refreshStats();
          const displayName = getCountryDisplayName(c);
          openStatusPopup(e.latlng, c.code, displayName, 'country', c.code, f);
        });
        layer.on('dblclick', e => {
          L.DomEvent.stopPropagation(e);
          map.flyTo(e.latlng, map.getZoom() + 1.5, { duration: 0.5 });
        });
      }
    }).addTo(map);

    // Pre-sort country layers once by polygon area descending (no sorting per frame!)
    sortedCountryLayers = [...(data.features || [])].map(f => {
      const c = findCountry(f);
      const layer = c && c.code ? countryLayersByCode[c.code] : null;
      return { feature: f, country: c, layer };
    }).filter(item => item.country && item.layer);

    sortedCountryLayers.sort((a, b) => {
      try {
        const ba = a.layer.getBounds();
        const bb = b.layer.getBounds();
        const areaA = (ba.getEast() - ba.getWest()) * (ba.getNorth() - ba.getSouth());
        const areaB = (bb.getEast() - bb.getWest()) * (bb.getNorth() - bb.getSouth());
        return areaB - areaA;
      } catch { return 0; }
    });

    // Prominent outer country borders: only active above regions (Zoom >= REGION_ZOOM)
    countryBordersLayer = L.geoJSON(data, {
      renderer: countryBordersRenderer,
      pane: 'countryBordersPane',
      style: () => countryBorderStyle(),
      interactive: false
    });
    if (map && map.getZoom() >= REGION_ZOOM) {
      countryBordersLayer.addTo(map);
    }

    scheduleLabelUpdate();
    
    // Hide loading indicator
    const loadingEl = document.getElementById('map-loading');
    if (loadingEl) loadingEl.style.display = 'none';
  }).catch(err => {
    console.error('World countries load error:', err);
    const loadingEl = document.getElementById('map-loading');
    if (loadingEl) loadingEl.innerHTML = `<div style="text-align:center;color:#ef4444;font-size:0.9rem;">${t('loadError')}</div>`;
  });

  // Load Turkey Provinces
  const loadTurkeyPromise = cachedTurkeyProvincesData
    ? Promise.resolve(cachedTurkeyProvincesData)
    : fetch(`${cleanBase}data/turkey-provinces.json`).then(r => {
        if (!r.ok) throw new Error('Network ' + r.status);
        return r.json();
      }).then(d => {
        cachedTurkeyProvincesData = d;
        return d;
      });

  loadTurkeyPromise.then(data => {
    turkeyLayer = L.geoJSON(data, {
      renderer: mapRenderer,
      pane: 'statesPane',
      style: f => provinceStyle(f.properties?.number),
      onEachFeature: (f, layer) => {
        const id = f.properties?.number;
        const prov = TURKEY_PROVINCES.find(p => p.id === id) || { id, name: f.properties?.name || 'İl' };
        // Province name is rendered cleanly on map via provinceLabelsLayer
        layer.on('click', e => {
          if (activeStatusPopup || _popupClosedOnPointerDown || (Date.now() - lastPopupClosedAt < 400)) {
            _popupClosedOnPointerDown = false;
            closeActivePopup();
            L.DomEvent.stopPropagation(e);
            return;
          }
          L.DomEvent.stopPropagation(e);
          selectedCountryCode = 'TR';
          refreshStats();
          openStatusPopup(e.latlng, `TR::${prov.id}`, prov.name, 'province', 'TR', f);
        });
        layer.on('dblclick', e => {
          L.DomEvent.stopPropagation(e);
          map.flyTo(e.latlng, map.getZoom() + 1.5, { duration: 0.5 });
        });
      }
    });
    if (map.getZoom() >= REGION_ZOOM && isTurkeyInView()) {
      turkeyLayer.addTo(map);
      if (countriesLayer) {
        countriesLayer.eachLayer(l => {
          if (findCountry(l.feature)?.code === 'TR') l.setStyle(countryStyle(findCountry(l.feature)));
        });
      }
    }
    scheduleLabelUpdate();
  }).catch(err => {
    console.error('Turkey provinces load error:', err);
  });


  function updateLayerHud() {
    const hudEl = document.getElementById('layer-hud');
    if (!hudEl || !map) return;
    const z = map.getZoom();
    const iconEl = document.getElementById('layer-hud-icon');
    const textEl = document.getElementById('layer-hud-text');
    if (z < REGION_ZOOM) {
      if (iconEl) iconEl.textContent = '🌍';
      if (textEl) textEl.textContent = t('layer1Countries');
    } else if (z < SUBREGION_ZOOM) {
      if (iconEl) iconEl.textContent = '🏙️';
      if (textEl) textEl.textContent = t('layer2Regions');
    } else {
      if (iconEl) iconEl.textContent = '📍';
      if (textEl) textEl.textContent = t('layer3Cities');
    }
  }

  // (updateProvinceLabels and updateCountryLabels are coordinated at module level)

  let isViewUpdating = false;
  let viewUpdatePending = false;

  async function requestViewUpdate() {
    updateLayerHud();
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
const _textWidthCache = new Map();
function measureTextWidth(text, fontSize) {
  const key = `${fontSize}_${text}`;
  const cached = _textWidthCache.get(key);
  if (cached !== undefined) return cached;
  if (!_measureCtx) {
    const c = document.createElement('canvas');
    _measureCtx = c.getContext('2d');
  }
  _measureCtx.font = `800 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`;
  const w = _measureCtx.measureText(text.toUpperCase()).width;
  _textWidthCache.set(key, w);
  return w;
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

function getPointToSegmentDistSq(px, py, ax, ay, bx, by) {
  let dx = bx - ax, dy = by - ay;
  if (dx !== 0 || dy !== 0) {
    const t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
    if (t > 1) { ax = bx; ay = by; }
    else if (t > 0) { ax += dx * t; ay += dy * t; }
  }
  dx = px - ax; dy = py - ay;
  return dx * dx + dy * dy;
}

function pointToPolygonDist(x, y, ring) {
  let inside = false;
  let minDistSq = Infinity;
  for (let i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a[1] > y !== b[1] > y) && (x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0])) inside = !inside;
    minDistSq = Math.min(minDistSq, getPointToSegmentDistSq(x, y, a[0], a[1], b[0], b[1]));
  }
  return minDistSq === 0 ? 0 : (inside ? 1 : -1) * Math.sqrt(minDistSq);
}

// Pole of inaccessibility: finds the point inside polygon that is farthest from all borders
function polylabelFast(ring, precision = 0.05) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < ring.length; i++) {
    const p = ring[i];
    if (p[0] < minX) minX = p[0];
    if (p[1] < minY) minY = p[1];
    if (p[0] > maxX) maxX = p[0];
    if (p[1] > maxY) maxY = p[1];
  }
  const width = maxX - minX, height = maxY - minY;
  const cellSize = Math.min(width, height);
  let h = cellSize / 2;
  if (cellSize === 0) return [minX, minY, 0];

  let bestCell = { x: minX + width / 2, y: minY + height / 2, h: 0, d: pointToPolygonDist(minX + width / 2, minY + height / 2, ring) };

  const cells = [];
  for (let x = minX; x < maxX; x += cellSize) {
    for (let y = minY; y < maxY; y += cellSize) {
      const cx = x + h, cy = y + h;
      const d = pointToPolygonDist(cx, cy, ring);
      const c = { x: cx, y: cy, h, d, max: d + h * Math.SQRT2 };
      cells.push(c);
      if (d > bestCell.d) bestCell = c;
    }
  }

  while (cells.length) {
    cells.sort((a, b) => b.max - a.max);
    const cell = cells.shift();
    if (cell.d > bestCell.d) bestCell = cell;
    if (cell.max - bestCell.d <= precision) continue;

    h = cell.h / 2;
    const sub = [
      { x: cell.x - h, y: cell.y - h },
      { x: cell.x + h, y: cell.y - h },
      { x: cell.x - h, y: cell.y + h },
      { x: cell.x + h, y: cell.y + h }
    ];
    for (const p of sub) {
      const d = pointToPolygonDist(p.x, p.y, ring);
      const c = { x: p.x, y: p.y, h, d, max: d + h * Math.SQRT2 };
      if (d > bestCell.d) bestCell = c;
      if (c.max > bestCell.d) cells.push(c);
    }
  }
  return [bestCell.x, bestCell.y, bestCell.d];
}

// Find the visual centroid and bounding box of ONLY the largest mainland polygon,
// guaranteed inside the landmass (with fast fallback to polylabel only when needed)
function getMainlandInfo(feature) {
  if (feature?._cachedMainland) return feature._cachedMainland;
  const geom = feature?.geometry;
  if (!geom) return null;

  let best = null;
  let maxArea = -1;
  let bestRing = null;

  function processRing(ring) {
    const res = polygonCentroid(ring);
    if (res.area > maxArea) {
      maxArea = res.area;
      best = res;
      bestRing = ring;
    }
  }

  if (geom.type === 'Polygon') {
    processRing(geom.coordinates[0]);
  } else if (geom.type === 'MultiPolygon') {
    geom.coordinates.forEach(poly => processRing(poly[0]));
  }

  if (!best || !bestRing) return null;

  // 97% of mainland centroids are already inside the landmass!
  // Only compute polylabel if mathematical centroid falls in water/outside polygon
  if (pointToPolygonDist(best.cx, best.cy, bestRing) <= 0) {
    try {
      const pl = polylabelFast(bestRing, 0.05);
      if (pl && pl[2] > 0) {
        best.cx = pl[0]; // lng
        best.cy = pl[1]; // lat
      }
    } catch (e) {}
  }

  if (feature) feature._cachedMainland = best;
  return best;
}

let _labelUpdateTimer = null;
function scheduleLabelUpdate() {
  if (_labelUpdateTimer) clearTimeout(_labelUpdateTimer);
  _labelUpdateTimer = setTimeout(() => {
    updateCountryLabels();
    updateProvinceLabels();
  }, 120);
}

function updateCountryLabels() {
  if (!countryLabelsLayer || !countriesLayer || !map) return;
  countryLabelsLayer.clearLayers();
  activeLabelPlacedBoxes = [];
  const themeCfg = getThemeConfig();

  const items = (sortedCountryLayers && sortedCountryLayers.length > 0)
    ? sortedCountryLayers
    : [];

  const mapSize = map.getSize();
  const mapBounds = map.getBounds().pad(0.15);

  items.forEach(({ feature: f, country: c, layer }) => {
    if (layer.getBounds && !mapBounds.intersects(layer.getBounds())) return;
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

    if (!c) return;
    const countryName = getCountryDisplayName(c);
    if (!countryName) return;

    // If zoom is deep and regions/provinces are active for this country, skip country watermark label
    const zoom = map.getZoom();
    if (zoom >= REGION_ZOOM) {
      if (c.code === 'TR' && turkeyLayer && map.hasLayer(turkeyLayer)) return;
      if (regionLayers[c.code] && map.hasLayer(regionLayers[c.code])) return;
    }

    try {
      // Get mainland polygon info (eliminates overseas islands like Curacao on Netherlands)
      const mainland = getMainlandInfo(f);
      if (!mainland || mainland.area <= 0) return;

      // Project mainland bounding box to screen pixels
      const nw = map.latLngToContainerPoint([mainland.bbox.maxLat, mainland.bbox.minLng]);
      const se = map.latLngToContainerPoint([mainland.bbox.minLat, mainland.bbox.maxLng]);
      const pixelWidth = Math.abs(se.x - nw.x);
      const pixelHeight = Math.abs(se.y - nw.y);

      // Balanced pixel dimensions: allow medium European countries to display clearly at Zoom 4
      if (pixelWidth < 36 || pixelHeight < 18) {
        return;
      }

      const textLen = Math.max(countryName.length, 3);

      // Proportionate font size with minimum 9px for legibility
      const byWidth = Math.floor(pixelWidth / (textLen * 0.95));
      const byHeight = Math.floor(pixelHeight / 1.8);
      let fontSize = Math.min(14, Math.max(9, Math.min(byWidth, byHeight)));

      // Measure actual rendered text width
      const actualTextWidth = measureTextWidth(countryName, fontSize);
      const letterSpacingExtra = textLen * fontSize * 0.12;
      const totalTextWidth = actualTextWidth + letterSpacingExtra;

      // Balanced boundary enforcement: allows clean fit without dropping European countries
      if (totalTextWidth > pixelWidth * 1.05 || fontSize > pixelHeight * 0.90) {
        return;
      }

      // Visual center point on screen
      const visualCenter = COUNTRY_LABEL_OFFSETS[c.code] ? L.latLng(COUNTRY_LABEL_OFFSETS[c.code]) : L.latLng(mainland.cy, mainland.cx);
      const centerPt = map.latLngToContainerPoint(visualCenter);

      // Generous buffer (500px outside screen) so half-visible countries have their labels ready
      const halfW = totalTextWidth / 2 + 8;
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
      const collides = activeLabelPlacedBoxes.some(p => (
        box.x1 < p.x2 && box.x2 > p.x1 &&
        box.y1 < p.y2 && box.y2 > p.y1
      ));
      if (collides) return;

      activeLabelPlacedBoxes.push(box);

      // Render label centered at visual centroid with generous buffer so letters are never clipped
      const renderWidth = Math.ceil(totalTextWidth) + 24;
      const renderHeight = fontSize + 8;

      const icon = L.divIcon({
        className: 'country-watermark-wrap',
        html: `<div class="country-tattoo" style="font-size:${fontSize}px;color:${themeCfg.labelColor};text-shadow:${themeCfg.labelShadow};">${countryName}</div>`,
        iconSize: [renderWidth, renderHeight],
        iconAnchor: [renderWidth / 2, renderHeight / 2]
      });

      const cMarker = L.marker(visualCenter, { icon, interactive: false, pane: 'labelsPane' });
      cMarker.featureCode = c.code;
      cMarker.addTo(countryLabelsLayer);
    } catch (e) {}
  });
}

const CAPITAL_COORDINATES = {
  'TR': [39.9334, 32.8597],
  'HU': [47.4979, 19.0402],
  'AT': [48.2082, 16.3738],
  'SK': [48.1486, 17.1077],
  'CZ': [50.0755, 14.4378],
  'DE': [52.5200, 13.4050],
  'FR': [48.8566, 2.3522],
  'GB': [51.5074, -0.1278],
  'IT': [41.9028, 12.4964],
  'ES': [40.4168, -3.7038],
  'NL': [52.3676, 4.9041],
  'BE': [50.8503, 4.3517],
  'GR': [37.9838, 23.7275],
  'BG': [42.6977, 23.3219],
  'RO': [44.4268, 26.1025],
  'RS': [44.7866, 20.4489],
  'BA': [43.8563, 18.4131],
  'HR': [45.8150, 15.9819],
  'ME': [42.4304, 19.2594],
  'MK': [41.9981, 21.4254],
  'AL': [41.3275, 19.8187],
  'XK': [42.6629, 21.1655],
  'PL': [52.2297, 21.0122],
  'UA': [50.4501, 30.5234],
  'RU': [55.7558, 37.6173],
  'PT': [38.7223, -9.1393],
  'SE': [59.3293, 18.0686],
  'NO': [59.9139, 10.7522],
  'FI': [60.1699, 24.9384],
  'DK': [55.6761, 12.5683],
  'IE': [53.3498, -6.2603],
  'CH': [46.9480, 7.4474],
  'AZ': [40.4093, 49.8671],
  'GE': [41.7151, 44.8271],
  'AM': [40.1792, 44.4991],
  'EG': [30.0444, 31.2357],
  'US': [38.9072, -77.0369],
  'JP': [35.6762, 139.6503],
  'KR': [37.5665, 126.9780],
  'CN': [39.9042, 116.4074]
};

const COUNTRY_CAPITALS = {
  'IT': { name: 'Roma', match: ['lazio', 'roma', 'rome'] },
  'ME': { name: 'Podgorica', match: ['podgorica'] },
  'CY': { name: 'Lefkoşa', match: ['nicosia', 'lefkoşa', 'lefkosa'] },
  'UA': { name: 'Kiev', match: ['kyiv', 'kiev'] },
  'GR': { name: 'Atina', match: ['attica', 'attiki', 'atina', 'athens'] },
  'NL': { name: 'Amsterdam', match: ['noord-holland', 'amsterdam'] },
  'FR': { name: 'Paris', match: ['île-de-france', 'ile-de-france', 'paris'] },
  'ES': { name: 'Madrid', match: ['madrid'] },
  'DE': { name: 'Berlin', match: ['berlin'] },
  'GB': { name: 'Londra', match: ['greater london', 'london', 'londra'] },
  'AT': { name: 'Viyana', match: ['wien', 'vienna', 'viyana'] },
  'HU': { name: 'Budapeşte', match: ['budapest', 'budapeşte'] },
  'CZ': { name: 'Prag', match: ['praha', 'prague', 'prag'] },
  'SK': { name: 'Bratislava', match: ['bratislavsky', 'bratislava'] },
  'PL': { name: 'Varşova', match: ['mazowieckie', 'warsaw', 'warszawa', 'varşova'] },
  'PT': { name: 'Lizbon', match: ['lisboa', 'lisbon', 'lizbon'] },
  'BE': { name: 'Brüksel', match: ['brussels', 'bruxelles', 'brüksel'] },
  'CH': { name: 'Bern', match: ['bern'] },
  'SE': { name: 'Stockholm', match: ['stockholm'] },
  'NO': { name: 'Oslo', match: ['oslo'] },
  'FI': { name: 'Helsinki', match: ['helsinki', 'uusimaa'] },
  'DK': { name: 'Kopenhag', match: ['copenhagen', 'hovedstaden', 'kopenhag'] },
  'IE': { name: 'Dublin', match: ['dublin'] },
  'RS': { name: 'Belgrad', match: ['beograd', 'belgrade', 'belgrad'] },
  'BA': { name: 'Saraybosna', match: ['sarajevo', 'saraybosna'] },
  'HR': { name: 'Zagreb', match: ['grad zagreb', 'zagreb'] },
  'MK': { name: 'Üsküp', match: ['skopje', 'üsküp'] },
  'AL': { name: 'Tiran', match: ['tiran', 'tirane', 'tirana'] },
  'XK': { name: 'Priştine', match: ['pristina', 'priştine'] },
  'BG': { name: 'Sofya', match: ['sofia', 'sofya', 'grad sofiya'] },
  'RO': { name: 'Bükreş', match: ['bucharest', 'bucuresti', 'bükreş'] },
  'TR': { name: 'Ankara', match: ['ankara'] },
  'GE': { name: 'Tiflis', match: ['tbilisi', 'tiflis'] },
  'AZ': { name: 'Bakü', match: ['baku', 'baki', 'bakü', 'xizi', 'xızı', 'abşeron', 'absheron'] },
  'AM': { name: 'Erivan', match: ['yerevan', 'erivan', 'erevan'] },
  'RU': { name: 'Moskova', match: ['moscow', 'moskova', 'moskva'] },
  'UZ': { name: 'Taşkent', match: ['tashkent', 'taşkent'] },
  'KZ': { name: 'Astana', match: ['astana', 'nur-sultan'] },
  'AE': { name: 'Abu Dabi', match: ['abu dhabi', 'abu dabi'] },
  'EG': { name: 'Kahire', match: ['cairo', 'al qahirah', 'kahire'] },
  'SA': { name: 'Riyad', match: ['riyadh', 'ar riyad', 'riyad'] },
  'TH': { name: 'Bangkok', match: ['bangkok', 'bangkok metropolis'] },
  'ID': { name: 'Cakarta', match: ['jakarta', 'jakarta raya', 'cakarta'] }
};

const CAPITAL_KEYWORDS = [
  'ankara', 'budapest', 'budapeşte', 'wien', 'vienna', 'viyana', 'bratislava', 'bratislavsky',
  'prague', 'praha', 'prag', 'berlin', 'paris', 'london', 'londra', 'roma', 'rome',
  'madrid', 'amsterdam', 'brussel', 'bruxelles', 'brussels', 'brüksel', 'athens', 'atina',
  'sofia', 'sofya', 'bucuresti', 'bucharest', 'bükreş', 'beograd', 'belgrade', 'belgrad',
  'sarajevo', 'saraybosna', 'zagreb', 'podgorica', 'skopje', 'üsküp', 'tirana', 'tiran',
  'pristina', 'priştine', 'warsaw', 'warszawa', 'varşova', 'kyiv', 'kiev', 'moscow', 'moskova',
  'lisbon', 'lisboa', 'lizbon', 'stockholm', 'oslo', 'helsinki', 'copenhagen', 'kopenhag',
  'dublin', 'bern', 'baku', 'bakü', 'tbilisi', 'tiflis', 'yerevan', 'erivan', 'cairo', 'kahire',
  'washington', 'tokyo', 'seoul', 'seul', 'beijing', 'pekin', 'astana', 'taşkent', 'tashkent',
  'abu dhabi', 'abu dabi', 'riyad', 'riyadh', 'bangkok', 'jakarta', 'cakarta'
];

function matchesWord(str, target) {
  if (!str || !target) return false;
  const s = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const t = target.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  if (t.includes(' ') || t.includes('-')) {
    return s.includes(t);
  }
  return new RegExp('(^|[^a-z0-9])' + t + '([^a-z0-9]|$)', 'i').test(s);
}

function isCapitalItem(item) {
  if (!item) return false;
  const rawLower = (item.rawName || item.name || '').toLowerCase().trim();
  const displayLower = (item.name || '').toLowerCase().trim();
  if (rawLower.includes('başkent') || displayLower.includes('başkent') || rawLower.includes('capital') || displayLower.includes('capital')) {
    return true;
  }
  const cap = COUNTRY_CAPITALS[item.countryCode];
  if (cap) {
    if (item.countryCode === 'BA' && rawLower.includes('sarajevo-romanija')) return false;
    if (cap.match.some(m => matchesWord(rawLower, m) || matchesWord(displayLower, m))) return true;
  }
  return CAPITAL_KEYWORDS.some(k => matchesWord(rawLower, k) || matchesWord(displayLower, k));
}

const FAMOUS_CITIES = new Set([
  // İtalya, İspanya, Fransa, Almanya, Hollanda, Portekiz
  'Milano', 'Venedik', 'Floransa', 'Napoli', 'Torino', 'Bolonya', 'Bologna', 'Cenova', 'Palermo', 'Bari', 'Trieste',
  'Barselona', 'Sevilla', 'Bilbao', 'Valensiya', 'Valencia', 'Granada', 'Málaga', 'Zaragoza', 'İbiza', 'Mallorca',
  'Lyon', 'Marseille', 'Marsilya', 'Nice', 'Bordeaux', 'Toulouse', 'Lille', 'Strazburg', 'Rennes', 'Cannes',
  'Münih', 'Frankfurt', 'Köln', 'Hamburg', 'Stuttgart', 'Dresden', 'Hannover', 'Nürnberg', 'Düsseldorf', 'Dortmund',
  'Rotterdam', 'Lahey', 'Eindhoven', 'Krakov', 'Kraków', 'Gdansk', 'Gdańsk', 'Wrocław', 'Poznań', 'Katowice',
  'Selanik', 'Porto', 'Lozan', 'Zermatt', 'St. Moritz', 'Cenevre', 'Zürih', 'Luzern', 'Basel',
  'Salzburg', 'Innsbruck', 'Graz', 'Linz',
  // Kafkaslar & Karadeniz (Batum, Tiflis, Bakü vb.)
  'Batum', 'Batumi', 'Kutaisi', 'Sohum', 'Zugdidi', 'Tiflis', 'Bakü', 'Gence', 'Sumqayıt', 'Erivan', 'Gümrü',
  'Köstence', 'Cluj-Napoca', 'Braşov', 'Timișoara', 'Sibiu', 'Yaş',
  'Varna', 'Burgaz', 'Burgas', 'Plovdiv', 'Filibe', 'Rusçuk',
  // Balkanlar (Mostar, Kotor, Budva, Dubrovnik, Ohri vb.)
  'Mostar', 'Banja Luka', 'Tuzla', 'Zenica', 'Kotor', 'Budva', 'Herceg Novi', 'Tivat',
  'Dubrovnik', 'Split', 'Zadar', 'Pula', 'Rovinj', 'Rijeka',
  'Ohri', 'Ohrid', 'Kalkandelen', 'Manastır', 'Bitola', 'Struga',
  'Tiran', 'Dıraç', 'Avlonya', 'İşkodra', 'Berat', 'Novi Sad', 'Niş',
  // Doğu Avrupa & Orta Asya
  'Lviv', 'Odessa', 'Harkov', 'Dnipro', 'Kırım',
  'Semerkant', 'Buhara', 'Hive', 'Almatı', 'Astana', 'Çimkent',
  // Orta Doğu & Kuzey Afrika
  'Dubai', 'Abu Dabi', 'Şarika', 'Kahire', 'İskenderiye', 'Şarm El-Şeyh', 'Hurgada', 'Luksor', 'Gize',
  'Kazablanka', 'Marakeş', 'Fes', 'Tanca', 'Agadir', 'Mekke', 'Medine', 'Cidde', 'Riyad',
  // Asya & Egzotik Rotalar
  'Phuket', 'Pattaya', 'Chiang Mai', 'Koh Samui', 'Bali', 'Cakarta', 'Yogyakarta', 'Surabaya', 'Bandung'
]);

function resolveItemDisplay(item) {
  let displayName = item.name;
  const rawLower = (item.rawName || '').toLowerCase().trim();
  const displayLower = (item.name || '').toLowerCase().trim();
  const cap = COUNTRY_CAPITALS[item.countryCode];
  let isFamous = false;

  if (item.isCapital && cap && cap.match.some(m => matchesWord(rawLower, m) || matchesWord(displayLower, m))) {
    displayName = cap.name;
  } else {
    const parenMatch = displayName.match(/\(([^)]+)\)/);
    if (parenMatch) {
      const cityPart = parenMatch[1].split('/')[0].split(',')[0].trim();
      const basePart = displayName.replace(/\s*\([^)]+\)/g, '').replace(/\s+Bölgesi$/i, '').trim();
      if (FAMOUS_CITIES.has(cityPart)) {
        displayName = cityPart;
        isFamous = true;
      } else {
        displayName = basePart;
      }
    } else {
      displayName = displayName.replace(/\s+Bölgesi$/i, '').replace(/\s+Region$/i, '').trim();
      if (displayName.includes('/')) {
        displayName = displayName.split('/')[0].trim();
      }
      if (FAMOUS_CITIES.has(displayName) || FAMOUS_CITIES.has(item.rawName)) {
        isFamous = true;
      }
    }
  }
  if (item.isCapital) {
    displayName = displayName.replace(/\s*\([^)]*başkent[^)]*\)/gi, '').trim();
  }
  return { displayName, isFamous };
}

function updateProvinceLabels() {
  if (!provinceLabelsLayer || !map) return;
  provinceLabelsLayer.clearLayers();

  const zoom = map.getZoom();
  if (zoom < REGION_ZOOM) return;

  const themeCfg = getThemeConfig();
  const mapSize = map.getSize();
  const labelColor = themeCfg?.labelColor || '#f8fafc';
  const labelShadow = themeCfg?.labelShadow || '0 1px 3px rgba(0, 0, 0, 0.85), 0 0 6px rgba(0, 0, 0, 0.6)';

  // Collect candidate region / province features from active layers on map
  const candidates = [];

  const mapBounds = map.getBounds().pad(0.12);

  // 1. Turkey Layer
  if (turkeyLayer && map.hasLayer(turkeyLayer)) {
    turkeyLayer.eachLayer(l => {
      if (l.getBounds && !mapBounds.intersects(l.getBounds())) return;
      const name = l.feature?.properties?.name;
      const num = l.feature?.properties?.number;
      if (name) candidates.push({ layer: l, name, rawName: name, countryCode: 'TR', idKey: `TR::${num}` });
    });
  }

  // 2. World Region Layers (Level 2)
  Object.entries(regionLayers).forEach(([code, rLayer]) => {
    if (rLayer && map.hasLayer(rLayer)) {
      // When zoomed into Level 3 subregions (districts/iller), skip Level 2 region labels
      // for countries that have active or cached subregion layers (e.g. Bavaria state label disappears)
      if (zoom >= SUBREGION_ZOOM && (
        code === 'DE' ||
        (subregionLayers[code] && map.hasLayer(subregionLayers[code])) ||
        inFlightSubregions[code] ||
        (subregionCache[code] && subregionCache[code] !== null)
      )) {
        return;
      }
      rLayer.eachLayer(l => {
        if (l.getBounds && !mapBounds.intersects(l.getBounds())) return;
        const raw = l.feature?.properties?.name || l.feature?.properties?.NAME_1;
        if (raw) {
          const display = getLocalizedName(raw, code);
          candidates.push({ layer: l, name: display, rawName: raw, countryCode: code, idKey: `${code}::${raw}` });
        }
      });
    }
  });

  // 3. World Subregion Layers (Level 3)
  if (zoom >= SUBREGION_ZOOM) {
    Object.entries(subregionLayers).forEach(([code, sLayer]) => {
      if (sLayer && map.hasLayer(sLayer)) {
        sLayer.eachLayer(l => {
          if (l.getBounds && !mapBounds.intersects(l.getBounds())) return;
          const raw = l.feature?.properties?.name;
          if (raw) {
            const display = getLocalizedName(raw, code);
            candidates.push({ layer: l, name: display, rawName: raw, countryCode: code, idKey: `${code}::${raw}` });
          }
        });
      }
    });
  }

  if (candidates.length === 0) return;

  // Pre-calculate screen bounding boxes and areas using mainland geometry
  const prepared = [];
  candidates.forEach(item => {
    try {
      const f = item.layer.feature;
      const mainland = getMainlandInfo(f);
      if (!mainland || mainland.area <= 0) return;

      const nw = map.latLngToContainerPoint([mainland.bbox.maxLat, mainland.bbox.minLng]);
      const se = map.latLngToContainerPoint([mainland.bbox.minLat, mainland.bbox.maxLng]);
      const pixelWidth = Math.abs(se.x - nw.x);
      const pixelHeight = Math.abs(se.y - nw.y);

      // Area in screen pixels
      const screenArea = pixelWidth * pixelHeight;

      const isCapital = isCapitalItem(item);
      const { displayName, isFamous } = resolveItemDisplay({ ...item, isCapital });

      // Centroid: fine-tuned province offset takes priority, otherwise exact capital coordinates only for micro-regions, otherwise tuned visual center / mainland centroid
      const offset = getProvinceOffset(item);
      let visualCenter;
      if (offset) {
        visualCenter = L.latLng(offset);
      } else if (isCapital && CAPITAL_COORDINATES[item.countryCode] && (!mainland || mainland.area < 0.02)) {
        visualCenter = L.latLng(CAPITAL_COORDINATES[item.countryCode]);
      } else {
        visualCenter = L.latLng(mainland.cy, mainland.cx);
      }

      prepared.push({
        ...item,
        isCapital,
        isFamous,
        displayName,
        center: visualCenter,
        pixelWidth,
        pixelHeight,
        screenArea
      });
    } catch (e) {}
  });

  // Sort: Priority places (Capitals and Famous Cities like Batum, Kotor, Dubrovnik) first, then descending by screenArea
  prepared.sort((a, b) => {
    const aPriority = a.isCapital || a.isFamous;
    const bPriority = b.isCapital || b.isFamous;
    if (aPriority && !bPriority) return -1;
    if (!aPriority && bPriority) return 1;
    return b.screenArea - a.screenArea;
  });

  prepared.forEach(item => {
    const isPriority = item.isCapital || item.isFamous;

    // 1. Strict minimum pixel dimensions:
    // Priority places (Capitals and Famous Cities like Batum, Kotor, Dubrovnik) are exempt from 50x22 minimum!
    if (!isPriority && (item.pixelWidth < 50 || item.pixelHeight < 22)) return;
    if (isPriority && (item.pixelWidth < 16 || item.pixelHeight < 10)) return;

    // 2. Measure text width
    let displayName = item.displayName;
    const fontSize = item.isCapital ? 12 : 11;
    const textWidth = measureTextWidth(displayName, fontSize);

    // 3. User rule: "onlarda da ülkelerdeki aynı kuralı uygulayalım. adı sığanlar gözüksün"
    // Capitals & Famous Cities are exempt from strict polygon clipping filter so they always display
    if (!isPriority) {
      if (textWidth > item.pixelWidth * 0.70 || (fontSize + 6) > item.pixelHeight * 0.65) {
        return;
      }
    }

    // 4. Viewport visibility check
    const centerPt = map.latLngToContainerPoint(item.center);
    const vpBuffer = 150;
    if (centerPt.x < -vpBuffer || centerPt.x > mapSize.x + vpBuffer ||
        centerPt.y < -vpBuffer || centerPt.y > mapSize.y + vpBuffer) {
      return;
    }

    // 5. Collision box against ALL already placed labels
    const halfW = textWidth / 2 + (item.isCapital ? 10 : 4);
    const halfH = fontSize / 2 + 3;
    const box = {
      x1: centerPt.x - halfW - 3,
      y1: centerPt.y - halfH - 3,
      x2: centerPt.x + halfW + 3,
      y2: centerPt.y + halfH + 3
    };

    const collides = activeLabelPlacedBoxes.some(p => (
      box.x1 < p.x2 && box.x2 > p.x1 &&
      box.y1 < p.y2 && box.y2 > p.y1
    ));
    if (collides) return;

    // Register collision box
    activeLabelPlacedBoxes.push(box);

    // Create marker
    const renderWidth = Math.ceil(textWidth) + (item.isCapital ? 28 : 16);
    const renderHeight = fontSize + (item.isCapital ? 10 : 6);

    const icon = L.divIcon({
      className: `map-province-label ${item.isCapital ? 'is-capital' : ''}`,
      html: `<div class="prov-label-text ${item.isCapital ? 'capital-label-text' : ''}" style="font-size:${fontSize}px;color:${item.isCapital ? '#ffffff' : labelColor};text-shadow:${labelShadow};">${escapeHtml(displayName)}</div>`,
      iconSize: [renderWidth, renderHeight],
      iconAnchor: [renderWidth / 2, renderHeight / 2]
    });

    const pMarker = L.marker(item.center, { icon, interactive: false, pane: 'labelsPane' });
    pMarker.featureId = item.idKey;
    pMarker.featureCountry = item.countryCode;
    pMarker.featureName = displayName;
    pMarker.rawName = item.rawName;
    pMarker.addTo(provinceLabelsLayer);
  });
}

// ─── Level 2 & Level 3 Region Coordinators ─────────────────────────────────────
const OVERSEAS_MAINLAND_BBOX = {
  'FR': { minLat: 41.3, maxLat: 51.1, minLng: -5.2, maxLng: 9.6 },
  'GB': { minLat: 49.8, maxLat: 60.9, minLng: -8.7, maxLng: 1.8 },
  'US': { minLat: 24.5, maxLat: 49.4, minLng: -125.0, maxLng: -66.9 },
  'NL': { minLat: 50.7, maxLat: 53.6, minLng: 3.3, maxLng: 7.3 },
  'DK': { minLat: 54.5, maxLat: 57.8, minLng: 8.0, maxLng: 15.2 },
  'NO': { minLat: 57.9, maxLat: 71.2, minLng: 4.5, maxLng: 31.1 },
  'ES': { minLat: 35.9, maxLat: 43.8, minLng: -9.3, maxLng: 4.4 },
  'PT': { minLat: 36.9, maxLat: 42.2, minLng: -9.5, maxLng: -6.1 }
};

function getVisibleCountries() {
  if (!map) return [];
  const bounds = map.getBounds().pad(0.12); // Tighter padding for lean DOM and rapid loading
  const visible = [];

  Object.entries(countryLayersByCode).forEach(([code, layer]) => {
    if (!code || code.length !== 2 || code === '-99') return;
    if (!layer || !layer.getBounds) return;
    const lBounds = layer._cachedBounds || (layer._cachedBounds = layer.getBounds());
    if (!bounds.intersects(lBounds)) return;

    // Guard against distant overseas territories pulling countries across the planet
    if (OVERSEAS_MAINLAND_BBOX[code]) {
      const mb = OVERSEAS_MAINLAND_BBOX[code];
      const mBounds = mb._bounds || (mb._bounds = L.latLngBounds([[mb.minLat, mb.minLng], [mb.maxLat, mb.maxLng]]));
      if (!bounds.intersects(mBounds)) return;
    }

    visible.push(code);
  });

  // Prioritize countries closest to map viewport center (where the user is looking)
  const mapCenter = map.getCenter();
  visible.sort((a, b) => {
    const cA = COUNTRY_CENTROIDS[a] || (countryLayersByCode[a]?._cachedBounds ? [countryLayersByCode[a]._cachedBounds.getCenter().lat, countryLayersByCode[a]._cachedBounds.getCenter().lng] : null);
    const cB = COUNTRY_CENTROIDS[b] || (countryLayersByCode[b]?._cachedBounds ? [countryLayersByCode[b]._cachedBounds.getCenter().lat, countryLayersByCode[b]._cachedBounds.getCenter().lng] : null);
    if (!cA || !cB) return 0;
    const distA = Math.hypot(cA[0] - mapCenter.lat, cA[1] - mapCenter.lng);
    const distB = Math.hypot(cB[0] - mapCenter.lat, cB[1] - mapCenter.lng);
    return distA - distB;
  });

  return visible;
}

async function onViewChange() {
  if (!map) return;
  const zoom = map.getZoom();

  // Prominent outer country borders: only mounted when zoomed into regions (Zoom >= REGION_ZOOM)
  if (zoom >= REGION_ZOOM) {
    if (countryBordersLayer && !map.hasLayer(countryBordersLayer)) {
      countryBordersLayer.addTo(map);
    }
  } else {
    if (countryBordersLayer && map.hasLayer(countryBordersLayer)) {
      map.removeLayer(countryBordersLayer);
    }
  }

  // Only restyle borders if zoom category actually changed (avoids 250 SVG re-stylings per drag)
  const currentZoomCategory = zoom >= SUBREGION_ZOOM ? 3 : (zoom >= REGION_ZOOM ? 2 : 1);
  if (currentZoomCategory !== lastZoomCategory) {
    lastZoomCategory = currentZoomCategory;
    if (countryBordersLayer && map.hasLayer(countryBordersLayer)) {
      countryBordersLayer.setStyle(countryBorderStyle());
    }
  }

  // ── Turkey Level 2 (81 Provinces) ──────────────────────────────────────────
  if (isTurkeyInView()) {
    if (zoom >= 5.0 && turkeyLayer && !map.hasLayer(turkeyLayer)) {
      turkeyLayer.addTo(map);
      if (countryLayersByCode['TR']) {
        countryLayersByCode['TR'].setStyle(countryStyle(countryByCode.get('TR')));
      }
    } else if (zoom < 5.0 && turkeyLayer && map.hasLayer(turkeyLayer)) {
      map.removeLayer(turkeyLayer);
      if (countryLayersByCode['TR']) {
        countryLayersByCode['TR'].setStyle(countryStyle(countryByCode.get('TR')));
      }
    }
  } else {
    // If Turkey is scrolled away at high zoom, unmount it to keep SVG DOM lean
    if (turkeyLayer && map.hasLayer(turkeyLayer)) {
      map.removeLayer(turkeyLayer);
      if (countryLayersByCode['TR']) {
        countryLayersByCode['TR'].setStyle(countryStyle(countryByCode.get('TR')));
      }
    }
  }

  const visibleCodes = getVisibleCountries();

  // ── World region layers (Level 2) ──────────────────────────────────────────
  if (zoom >= REGION_ZOOM) {
    // Top 8 visible countries nearest to screen center get region layers mounted (prevents 40-country lag)
    const targetCodes = visibleCodes.slice(0, 8);
    const targetSet = new Set(targetCodes);

    // Evict off-screen or non-priority region layers from the SVG DOM to keep memory tiny & 60fps
    Object.entries(regionLayers).forEach(([code, layer]) => {
      if (layer && map.hasLayer(layer) && !targetSet.has(code)) {
        map.removeLayer(layer);
        if (countryLayersByCode[code]) {
          countryLayersByCode[code].setStyle(countryStyle(countryByCode.get(code)));
        }
      }
    });

    const toLoad = targetCodes.filter(code => code !== 'TR' && !regionLayers[code]);
    if (toLoad.length > 0) {
      await Promise.all(toLoad.map(code => loadRegionData(code)));
    }
    if (map && map.getZoom() >= REGION_ZOOM) {
      for (const code of targetCodes) {
        if (code !== 'TR' && regionLayers[code] && !map.hasLayer(regionLayers[code])) {
          regionLayers[code].addTo(map);
          if (countryLayersByCode[code]) {
            countryLayersByCode[code].setStyle(countryStyle(countryByCode.get(code)));
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
    // At deep zoom, only the top 4 most central visible countries need subregions
    const targetSubCodes = visibleCodes.slice(0, 4);
    const targetSubSet = new Set(targetSubCodes);

    // Evict off-screen subregion layers
    Object.entries(subregionLayers).forEach(([code, layer]) => {
      if (layer && map.hasLayer(layer) && !targetSubSet.has(code)) {
        map.removeLayer(layer);
      }
    });
    Object.entries(stateBordersLayers).forEach(([code, layer]) => {
      if (layer && map.hasLayer(layer) && !targetSubSet.has(code)) {
        map.removeLayer(layer);
      }
    });

    const toLoadSub = targetSubCodes.filter(code => code !== 'TR' && !subregionLayers[code]);
    if (toLoadSub.length > 0) {
      await Promise.all(toLoadSub.map(code => loadSubregionData(code)));
    }
    if (map && map.getZoom() >= SUBREGION_ZOOM) {
      for (const code of targetSubCodes) {
        if (code !== 'TR') {
          if (subregionLayers[code] && !map.hasLayer(subregionLayers[code])) {
            subregionLayers[code].addTo(map);
            refreshRegionLayer(code);
          }
          if (stateBordersLayers[code] && !map.hasLayer(stateBordersLayers[code])) {
            stateBordersLayers[code].addTo(map);
          }
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
    Object.entries(stateBordersLayers).forEach(([code, layer]) => {
      if (layer && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
    if (zoom >= REGION_ZOOM) {
      Object.keys(regionLayers).forEach(code => refreshRegionLayer(code));
    }
  }
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
  if (inFlightRegions[code]) {
    await inFlightRegions[code];
    return;
  }

  inFlightRegions[code] = (async () => {
    try {
      const baseUrl = import.meta.env.BASE_URL || './';
      const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
      const r = await fetch(`${cleanBase}data/regions/${code}.json`);
      if (!r.ok) { regionCache[code] = null; return; }
      const data = await r.json();
      regionCache[code] = data;
      attachRegionLayer(code, data);
    } catch (err) {
      console.warn(`[RegionLayer] Failed loading regions for ${code}:`, err);
      regionCache[code] = null;
    } finally {
      delete inFlightRegions[code];
    }
  })();

  await inFlightRegions[code];
}

function attachRegionLayer(code, data) {
  if (regionLayers[code] || !map) return;
  const c = countryByCode.get(code);
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
      // Region name is rendered cleanly on map via provinceLabelsLayer
      l.on('click', e => {
        if (activeStatusPopup || _popupClosedOnPointerDown || (Date.now() - lastPopupClosedAt < 400)) {
          _popupClosedOnPointerDown = false;
          closeActivePopup();
          L.DomEvent.stopPropagation(e);
          return;
        }
        L.DomEvent.stopPropagation(e);
        selectedCountryCode = code;
        refreshStats();
        openStatusPopup(e.latlng, `${code}::${raw}`, display, 'region', code, l.feature);
      });
      l.on('dblclick', e => {
        L.DomEvent.stopPropagation(e);
        map.flyTo(e.latlng, map.getZoom() + 1.5, { duration: 0.5 });
      });
    }
  });

  regionLayers[code] = layer;

  // Dedicated Level 3 State / Province border outlines above city fills
  const stateBorder = L.geoJSON(sortedData, {
    renderer: stateBordersRenderer,
    pane: 'stateBordersPane',
    style: () => ({
      fill: false,
      fillOpacity: 0,
      color: getTheme() !== 'light' ? 'rgba(226, 232, 240, 0.70)' : 'rgba(30, 41, 59, 0.65)',
      weight: 1.7,
      opacity: 1,
      interactive: false
    }),
    interactive: false
  });
  stateBordersLayers[code] = stateBorder;

  if (map.getZoom() >= REGION_ZOOM) {
    layer.addTo(map);
    if (map.getZoom() >= SUBREGION_ZOOM) {
      stateBorder.addTo(map);
    }
    if (countriesLayer) {
      countriesLayer.eachLayer(l => {
        if (findCountry(l.feature)?.code === code) l.setStyle(countryStyle(findCountry(l.feature)));
      });
    }
    scheduleLabelUpdate();
  }
}

function refreshRegionLayer(code) {
  regionLayers[code]?.eachLayer(l => {
    const raw = l.feature?.properties?.name || l.feature?.properties?.NAME_1;
    const style = regionStyle(raw, code);
    l.setStyle(style);
    
    const { worldVisits } = getCachedStorage();
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
  if (inFlightSubregions[code]) {
    await inFlightSubregions[code];
    return;
  }

  inFlightSubregions[code] = (async () => {
    try {
      const baseUrl = import.meta.env.BASE_URL || './';
      const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
      const r = await fetch(`${cleanBase}data/subregions/${code}.json`);
      if (!r.ok) { subregionCache[code] = null; return; }
      const data = await r.json();
      subregionCache[code] = data;
      attachSubregionLayer(code, data);
    } catch (err) {
      console.warn(`[SubregionLayer] Failed loading subregions for ${code}:`, err);
      subregionCache[code] = null;
    } finally {
      delete inFlightSubregions[code];
    }
  })();

  await inFlightSubregions[code];
}

function attachSubregionLayer(code, data) {
  registerSubregionRelations(code, data);
  if (subregionLayers[code] || !map) return;
  const c = countryByCode.get(code);
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
      // City name is rendered cleanly on map via provinceLabelsLayer
      l.on('click', e => {
        if (activeStatusPopup || _popupClosedOnPointerDown || (Date.now() - lastPopupClosedAt < 400)) {
          _popupClosedOnPointerDown = false;
          closeActivePopup();
          L.DomEvent.stopPropagation(e);
          return;
        }
        L.DomEvent.stopPropagation(e);
        selectedCountryCode = code;
        refreshStats();
        openStatusPopup(e.latlng, `${code}::${raw}`, display, 'subregion', code, l.feature);
      });
      l.on('dblclick', e => {
        L.DomEvent.stopPropagation(e);
        map.flyTo(e.latlng, map.getZoom() + 1.5, { duration: 0.5 });
      });
    }
  });

  subregionLayers[code] = layer;
  if (map.getZoom() >= SUBREGION_ZOOM) {
    layer.addTo(map);
    refreshRegionLayer(code);
    scheduleLabelUpdate();
  }
}

function refreshSubregionLayer(code) {
  subregionLayers[code]?.eachLayer(l => {
    l.setStyle(subregionStyle(l.feature?.properties?.name, code));
  });
}

// ─── Geo Point-in-Polygon & Region Resolvers for Cities ────────────────────────
function pointInPolygon(point, vs) {
  const x = point[1], y = point[0];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function featureContainsPoint(feature, latlng) {
  if (!feature || !feature.geometry) return false;
  const { type, coordinates } = feature.geometry;
  if (type === 'Polygon') {
    return pointInPolygon(latlng, coordinates[0]);
  } else if (type === 'MultiPolygon') {
    return coordinates.some(poly => pointInPolygon(latlng, poly[0]));
  }
  return false;
}

function findRegionRawForPoint(countryCode, latlng, cityName) {
  if (!countryCode) return null;
  const features = regionCache[countryCode]?.features;
  const lat = Array.isArray(latlng) ? latlng[0] : (latlng?.lat !== undefined ? latlng.lat : null);
  const lng = Array.isArray(latlng) ? latlng[1] : (latlng?.lng !== undefined ? latlng.lng : null);

  if (features && lat !== null && lng !== null) {
    const matched = [];
    for (const f of features) {
      if (featureContainsPoint(f, [lat, lng])) {
        matched.push(f);
      }
    }
    if (matched.length === 1) {
      return matched[0].properties?.name || matched[0].properties?.NAME_1;
    }
    if (matched.length > 1) {
      matched.sort((a, b) => {
        const areaA = a.geometry?.coordinates?.[0]?.length || 1;
        const areaB = b.geometry?.coordinates?.[0]?.length || 1;
        return areaA - areaB;
      });
      return matched[0].properties?.name || matched[0].properties?.NAME_1;
    }
  }

  if (features && cityName) {
    const cityLower = cityName.toLowerCase().trim();
    const feat = features.find(f => {
      const raw = (f.properties?.name || f.properties?.NAME_1 || '').toLowerCase();
      return raw.includes(cityLower);
    });
    if (feat) return feat.properties?.name || feat.properties?.NAME_1;
  }

  const cap = COUNTRY_CAPITALS[countryCode];
  if (cap && cityName && (matchesWord(cityName, cap.name) || cap.match.some(m => matchesWord(cityName, m)))) {
    if (features) {
      const feat = features.find(f => {
        const raw = (f.properties?.name || f.properties?.NAME_1 || '').toLowerCase();
        return cap.match.some(m => raw.includes(m.toLowerCase()));
      });
      if (feat) return feat.properties?.name || feat.properties?.NAME_1;
    }
  }

  return null;
}

// ─── Photo Lightbox Modal Helper ───────────────────────────────────────────
function openPhotoLightbox(imgSrc, title = '', caption = '') {
  const existing = document.getElementById('photo-lightbox-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'photo-lightbox-modal';
  modal.className = 'photo-lightbox-overlay';
  modal.innerHTML = `
    <div class="photo-lightbox-content">
      <button type="button" class="photo-lightbox-close" id="btn-close-lightbox">&times;</button>
      <img src="${imgSrc}" class="photo-lightbox-img" alt="Memory Photo" />
      ${title || caption ? `
        <div class="photo-lightbox-footer">
          ${title ? `<div class="photo-lightbox-title">${escapeHtml(title)}</div>` : ''}
          ${caption ? `<div class="photo-lightbox-caption">${escapeHtml(caption)}</div>` : ''}
        </div>
      ` : ''}
    </div>
  `;
  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  modal.querySelector('#btn-close-lightbox')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  const handleKey = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      window.removeEventListener('keydown', handleKey);
    }
  };
  window.addEventListener('keydown', handleKey);
}

// ─── Status Popup & Two-Way Sync Logic ─────────────────────────────────────────
// ─── Status Popup & Two-Way Sync Logic (Clean Centered Popup with Glow Buttons) ───
function openStatusPopup(latlng, id, title, type, countryCode, feature = null) {
  const currentLang = getLanguage();
  const STATUS = getStatusConfig();
  const { turkeyVisits, worldVisits, worldCities = [] } = getStorageData();

  let currentStatus = 'unvisited';
  let currentRating = 0;
  let currentNotes = '';
  let currentEntryDate = '';
  let currentEntryTransport = type === 'province' ? 'car' : 'flight';
  let currentExitDate = '';
  let currentExitTransport = type === 'province' ? 'car' : 'flight';
  let currentBuddies = [];
  let currentPlaces = [];
  let currentJournal = null;

  if (type === 'province') {
    const num = id.replace('TR::', '');
    const pData = turkeyVisits[num] || {};
    currentStatus = ns(pData.status);
    currentRating = pData.rating || 0;
    currentNotes = pData.notes || '';
    currentEntryDate = pData.entryDate || '';
    currentEntryTransport = pData.entryTransport || 'car';
    currentExitDate = pData.exitDate || '';
    currentExitTransport = pData.exitTransport || 'car';
    currentBuddies = Array.isArray(pData.buddies) ? [...pData.buddies] : [];
    currentPlaces = Array.isArray(pData.places) ? [...pData.places] : [];
    currentJournal = pData.journal || null;
  } else if (type === 'city') {
    const cleanCityName = id.includes('::') ? id.slice(id.indexOf('::') + 2) : id;
    const wData = worldVisits[id] || {};
    const matchedRegionRaw = findRegionRawForPoint(countryCode, latlng, cleanCityName);
    const regionData = matchedRegionRaw ? (worldVisits[`${countryCode}::${matchedRegionRaw}`] || {}) : {};
    const isCityInList = (worldCities || []).some(c => c.countryCode === countryCode && c.cityName.toLowerCase() === cleanCityName.toLowerCase());

    currentStatus = ns(wData.status) !== 'unvisited'
      ? ns(wData.status)
      : (ns(regionData.status) !== 'unvisited' ? ns(regionData.status) : (isCityInList ? 'visited' : 'unvisited'));
    currentRating = wData.rating || regionData.rating || 0;
    currentNotes = wData.notes || regionData.notes || '';
    currentEntryDate = wData.entryDate || regionData.entryDate || '';
    currentEntryTransport = wData.entryTransport || regionData.entryTransport || 'flight';
    currentExitDate = wData.exitDate || regionData.exitDate || '';
    currentExitTransport = wData.exitTransport || regionData.exitTransport || 'flight';
    currentBuddies = Array.isArray(wData.buddies) ? [...wData.buddies] : (Array.isArray(regionData.buddies) ? [...regionData.buddies] : []);
    currentPlaces = Array.isArray(wData.places) ? [...wData.places] : (Array.isArray(regionData.places) ? [...regionData.places] : []);
    currentJournal = wData.journal || regionData.journal || null;
  } else {
    const wData = worldVisits[id] || {};
    currentStatus = ns(wData.status);
    currentRating = wData.rating || 0;
    currentNotes = wData.notes || '';
    currentBuddies = Array.isArray(wData.buddies) ? [...wData.buddies] : [];
    currentEntryDate = wData.entryDate || '';
    currentEntryTransport = wData.entryTransport || 'flight';
    currentExitDate = wData.exitDate || '';
    currentExitTransport = wData.exitTransport || 'flight';
    currentPlaces = Array.isArray(wData.places) ? [...wData.places] : [];
    currentJournal = wData.journal || null;
  }

  const content = document.createElement('div');
  content.className = 'map-status-popup';
  L.DomEvent.disableClickPropagation(content);
  L.DomEvent.disableScrollPropagation(content);

  const cleanTitle = typeof title === 'string' ? title.replace(/<[^>]*>/g, '').trim() : '';
  const flagBadgeHtml = getFlagHtml(countryCode);

  const passportType = getPassportType();
  const visaBadge = countryCode ? getVisaBadgeInfo(countryCode, passportType) : null;
  const guide = countryCode ? getCountryGuide(countryCode) : null;

  const transportIcons = {
    flight: '✈️ Uçak',
    train: '🚆 Tren',
    car: '🚗 Şahsi Araba',
    bus: '🚌 Otobüs',
    ship: '🚢 Gemi'
  };

  content.innerHTML = `
    <div class="map-status-popup-header" style="justify-content:center;flex-direction:column;align-items:center;margin-bottom:10px;gap:6px;">
      <div class="map-status-popup-title" style="text-align:center;display:flex;align-items:center;justify-content:center;gap:6px;">
        ${flagBadgeHtml} <span>${escapeHtml(cleanTitle)}</span>
      </div>
      ${visaBadge ? `
        <div class="popup-visa-pill" style="background:${visaBadge.bg};border:1px solid ${visaBadge.border};color:${visaBadge.color};font-size:0.72rem;font-weight:700;padding:2px 8px;border-radius:99px;display:inline-flex;align-items:center;gap:4px;">
          <span>${visaBadge.icon}</span> <span>${escapeHtml(visaBadge.label)}</span> <span style="opacity:0.8;font-size:0.68rem;font-weight:600;">(${escapeHtml(visaBadge.days)})</span>
        </div>
      ` : ''}
    </div>

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

    <!-- 🎛️ Segmented Action Hub Tabs (Only visible when status === 'visited') -->
    <div class="popup-action-hub-tabs" id="popup-action-hub-tabs" style="display: ${currentStatus === 'visited' ? 'flex' : 'none'};">
      <button type="button" class="popup-hub-btn" data-drawer="stamp" title="Pasaport Damgaları">
        <span class="hub-btn-icon">🛂</span>
        <span class="hub-btn-label">Damga</span>
      </button>
      <button type="button" class="popup-hub-btn" data-drawer="journal" title="Seyahat Günlüğü & Fotoğraflar">
        <span class="hub-btn-icon">📸</span>
        <span class="hub-btn-label">Günlük</span>
      </button>
      <button type="button" class="popup-hub-btn" data-drawer="places" title="Mekanlar & Restoranlar">
        <span class="hub-btn-icon">🍽️</span>
        <span class="hub-btn-label">Mekanlar</span>
      </button>
      <button type="button" class="popup-hub-btn" data-drawer="review" title="Puan & Not">
        <span class="hub-btn-icon">⭐</span>
        <span class="hub-btn-label">Puan</span>
      </button>
      ${guide ? `
        <button type="button" class="popup-hub-btn" data-drawer="guide" title="Rehber & Bilgi">
          <span class="hub-btn-icon">🧳</span>
          <span class="hub-btn-label">Rehber</span>
        </button>
      ` : ''}
    </div>

    <!-- 🛂 Pasaport Giriş & Çıkış Çift Damgası Çekmecesi -->
    <div class="map-status-stamp-drawer" id="map-status-stamp-drawer" style="display: none;">
      <div class="stamp-drawer-header">
        <span class="stamp-drawer-title">🛂 Giriş & Çıkış Pasaport Damgası</span>
      </div>

      <!-- Giriş Damgası Bölümü -->
      <div class="stamp-section-box stamp-entry-box">
        <div class="stamp-section-label">🟢 GİRİŞ DAMGASI (ENTRY)</div>
        <div class="stamp-inputs-row">
          <input type="date" id="popup-stamp-entry-date" class="stamp-date-field" value="${currentEntryDate}" />
          <select id="popup-stamp-entry-transport" class="stamp-transport-select">
            <option value="flight" ${currentEntryTransport === 'flight' ? 'selected' : ''}>✈️ Uçak</option>
            <option value="train" ${currentEntryTransport === 'train' ? 'selected' : ''}>🚆 Tren</option>
            <option value="car" ${currentEntryTransport === 'car' ? 'selected' : ''}>🚗 Şahsi Araba</option>
            <option value="bus" ${currentEntryTransport === 'bus' ? 'selected' : ''}>🚌 Otobüs</option>
            <option value="ship" ${currentEntryTransport === 'ship' ? 'selected' : ''}>🚢 Gemi</option>
          </select>
        </div>
      </div>

      <!-- Çıkış Damgası Bölümü -->
      <div class="stamp-section-box stamp-exit-box">
        <div class="stamp-section-label">🔴 ÇIKIŞ DAMGASI (EXIT)</div>
        <div class="stamp-inputs-row">
          <input type="date" id="popup-stamp-exit-date" class="stamp-date-field" value="${currentExitDate}" />
          <select id="popup-stamp-exit-transport" class="stamp-transport-select">
            <option value="flight" ${currentExitTransport === 'flight' ? 'selected' : ''}>✈️ Uçak</option>
            <option value="train" ${currentExitTransport === 'train' ? 'selected' : ''}>🚆 Tren</option>
            <option value="car" ${currentExitTransport === 'car' ? 'selected' : ''}>🚗 Şahsi Araba</option>
            <option value="bus" ${currentExitTransport === 'bus' ? 'selected' : ''}>🚌 Otobüs</option>
            <option value="ship" ${currentExitTransport === 'ship' ? 'selected' : ''}>🚢 Gemi</option>
          </select>
        </div>
      </div>

      <!-- Canlı Damga Mürekkep Önizlemesi -->
      <div class="stamp-live-preview-row">
        <div class="ink-stamp-badge ink-entry" id="ink-preview-entry">
          <div class="ink-header">★ GİRİŞ / ENTRY ★</div>
          <div class="ink-code">${countryCode || 'TR'}</div>
          <div class="ink-sub" id="ink-entry-sub">${currentEntryTransport === 'flight' ? '✈️' : (currentEntryTransport === 'train' ? '🚆' : (currentEntryTransport === 'car' ? '🚗' : (currentEntryTransport === 'bus' ? '🚌' : '🚢')))} ${currentEntryDate || 'Tarih Gir'}</div>
        </div>
        <div class="ink-stamp-badge ink-exit" id="ink-preview-exit">
          <div class="ink-header">★ ÇIKIŞ / EXIT ★</div>
          <div class="ink-code">${countryCode || 'TR'}</div>
          <div class="ink-sub" id="ink-exit-sub">${currentExitTransport === 'flight' ? '✈️' : (currentExitTransport === 'train' ? '🚆' : (currentExitTransport === 'car' ? '🚗' : (currentExitTransport === 'bus' ? '🚌' : '🚢')))} ${currentExitDate || 'Tarih Gir'}</div>
        </div>
      </div>

      <!-- Yol Arkadaşları / Travel Buddies Bölümü -->
      <div class="stamp-section-box stamp-buddies-box">
        <div class="stamp-section-label">👥 YOL ARKADAŞLARI (TRAVEL BUDDIES)</div>
        <div class="stamp-buddies-input-row">
          <input type="text" id="popup-buddy-input" class="stamp-buddy-input" placeholder="Yol arkadaşı ekle (Örn: @ali, Ece)..." maxlength="25" />
          <button type="button" id="popup-buddy-add-btn" class="stamp-buddy-add-btn">+ Ekle</button>
        </div>
        <div class="stamp-buddies-chips-row" id="popup-buddies-chips">
          ${currentBuddies.map(b => `<span class="buddy-chip">${escapeHtml(b)} <button type="button" class="del-buddy" data-name="${escapeHtml(b)}">&times;</button></span>`).join('')}
        </div>
      </div>

      <button type="button" id="btn-save-stamp-data" class="stamp-save-btn">
        <span>💾 Damgaları & Yol Arkadaşlarını Kaydet</span>
      </button>
    </div>

    <!-- 📸 Seyahat Günlüğü & Fotoğraflar Çekmecesi -->
    <div class="map-status-journal-drawer" id="map-status-journal-drawer" style="display: none;">
      <div class="journal-drawer-header">
        <span class="journal-drawer-title">📸 Seyahat Anıları & Günlük</span>
      </div>

      <!-- Mood Seçimi -->
      <div class="journal-mood-section">
        <div class="journal-section-label">HİS & SEYAHAT MODU:</div>
        <div class="journal-moods-row" id="journal-moods-row">
          ${['😍 Harika', '🎉 Eğlenceli', '☕ Huzurlu', '🥾 Maceralı', '🏖️ Dinlendirici', '🍷 Keyifli'].map(m => {
            const moodVal = m.split(' ')[0];
            const isSel = (currentJournal?.mood || '') === moodVal;
            return `<button type="button" class="journal-mood-btn ${isSel ? 'active' : ''}" data-mood="${moodVal}">${m}</button>`;
          }).join('')}
        </div>
      </div>

      <!-- Fotoğraflar Galerisi -->
      <div class="journal-photos-section">
        <div class="journal-photos-top-row">
          <span class="journal-section-label">FOTOĞRAFLAR (<span id="journal-photo-count">0</span>):</span>
          <label class="journal-upload-trigger" for="journal-file-input">
            <span>➕ Fotoğraf Yükle</span>
          </label>
          <input type="file" id="journal-file-input" accept="image/*" style="display:none;" />
        </div>
        <div class="journal-photos-grid" id="journal-photos-grid">
          <div class="journal-photo-loading">Fotoğraflar yükleniyor...</div>
        </div>
      </div>

      <!-- Günlük Notu / Anı Yazısı -->
      <div class="journal-text-section">
        <div class="journal-section-label">GÜNLÜK NOTUNUZ:</div>
        <textarea id="journal-text-input" class="journal-textarea" placeholder="Bu seyahatten unutulmaz bir anı, his veya tavsiye yazın..." rows="3">${escapeHtml(currentJournal?.text || '')}</textarea>
        <button type="button" id="btn-save-journal" class="journal-save-btn">
          <span>💾 Günlüğü Kaydet</span>
        </button>
      </div>
    </div>

    <!-- 🍽️ Mekan / Kafe / Restoran Çekmecesi -->
    <div class="map-status-places-drawer" id="map-status-places-drawer" style="display: none;">
      <div class="places-drawer-header">
        <span class="places-drawer-title">🍽️ Keşfedilen Mekanlar & Rota Durakları</span>
      </div>

      <!-- Yeni Mekan Ekleme Formu -->
      <div class="places-add-form">
        <div class="place-categories-row" id="place-categories-row">
          <button type="button" class="place-cat-btn active" data-cat="restaurant">🍽️ Restoran</button>
          <button type="button" class="place-cat-btn" data-cat="cafe">☕ Kafe</button>
          <button type="button" class="place-cat-btn" data-cat="museum">🏛️ Müze</button>
          <button type="button" class="place-cat-btn" data-cat="nature">🏖️ Doğa/Plaj</button>
          <button type="button" class="place-cat-btn" data-cat="shopping">🛍️ Alışveriş</button>
          <button type="button" class="place-cat-btn" data-cat="hotel">🏨 Otel</button>
        </div>

        <div class="place-inputs-row">
          <input type="text" id="place-name-input" class="place-input" placeholder="Mekan adı (Örn: Café de Flore)..." maxlength="50" />
          <select id="place-rating-select" class="place-select">
            <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
            <option value="4">⭐⭐⭐⭐ (4/5)</option>
            <option value="3">⭐⭐⭐ (3/5)</option>
            <option value="2">⭐⭐ (2/5)</option>
            <option value="1">⭐ (1/5)</option>
          </select>
        </div>

        <div class="place-notes-row">
          <input type="text" id="place-note-input" class="place-input" placeholder="Gurme/ziyaret notu (Örn: Kruvasanı ve kahvesi şahane!)..." maxlength="100" />
          <button type="button" id="btn-add-place" class="place-add-btn">+ Ekle</button>
        </div>
      </div>

      <!-- Kayıtlı Mekanlar Listesi -->
      <div class="places-saved-list" id="places-saved-list"></div>
    </div>

    <!-- 🧳 Gezgin Alet Çantası & Rehber Çekmecesi -->
    ${guide ? `
      <div class="map-status-guide-drawer" id="map-status-guide-drawer" style="display: none;">
        <div class="guide-grid-info">
          <div class="guide-item">
            <span class="guide-lbl">🔌 Priz Tipi:</span>
            <span class="guide-val">${escapeHtml(guide.plug)}</span>
          </div>
          <div class="guide-item">
            <span class="guide-lbl">💵 Para Birimi:</span>
            <span class="guide-val">${escapeHtml(guide.cur)}</span>
          </div>
          <div class="guide-item">
            <span class="guide-lbl">🚨 Acil Durum:</span>
            <span class="guide-val">${escapeHtml(guide.em)}</span>
          </div>
        </div>
        <div class="guide-recommendations">
          <div class="guide-rec-box">
            <span class="guide-rec-title">🍽️ Meşhur 3 Lezzet:</span>
            <span class="guide-rec-text">${escapeHtml(guide.foods.join(', '))}</span>
          </div>
          <div class="guide-rec-box">
            <span class="guide-rec-title">📍 Görülmesi Gereken 3 Yer:</span>
            <span class="guide-rec-text">${escapeHtml(guide.spots.join(', '))}</span>
          </div>
        </div>
      </div>
    ` : ''}

    <!-- IMDb Tarzı 10 Yıldız Değerlendirme & Seyahat Notu Çekmecesi -->
    <div class="map-status-review-drawer" id="map-status-review-drawer" style="display: none;">
      <div class="imdb-rating-header">
        <span class="imdb-score-title">${t('rateThisPlace')}</span>
        <span class="imdb-score-display" id="rating-score-display">${currentRating > 0 ? `⭐ ${currentRating}/10` : '-'}</span>
      </div>
      <div class="imdb-stars-row" id="imdb-stars-row">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => `
          <span class="imdb-star ${s <= currentRating ? 'filled' : ''}" data-score="${s}" title="${s}/10">★</span>
        `).join('')}
      </div>
      <div class="popup-notes-input-row">
        <input type="text" id="popup-note-input" class="popup-note-input" placeholder="${t('notePlaceholder')}" value="${escapeHtml(currentNotes)}" />
        <button type="button" id="popup-note-save-btn" class="popup-note-save-btn" title="${t('save')}">💾</button>
      </div>
    </div>
  `;

  // Helper to persist visit details cleanly across types
  function persistVisitDetails(patch) {
    if (type === 'province') {
      const num = id.replace('TR::', '');
      saveTurkeyVisit(num, 'visited', patch);
    } else if (type === 'city') {
      saveWorldVisit(id, 'visited', patch);
      const cleanCityName = id.includes('::') ? id.slice(id.indexOf('::') + 2) : id;
      const matchedRegionRaw = findRegionRawForPoint(countryCode, latlng, cleanCityName);
      if (matchedRegionRaw) {
        saveWorldVisit(`${countryCode}::${matchedRegionRaw}`, 'visited', patch);
      }
    } else {
      saveWorldVisit(id, 'visited', patch);
    }
    invalidateStorageCache();
    refreshStats();
  }

  // Action Hub Drawers and Buttons
  const hubBtns = content.querySelectorAll('.popup-hub-btn');
  const allDrawers = {
    stamp: content.querySelector('#map-status-stamp-drawer'),
    journal: content.querySelector('#map-status-journal-drawer'),
    places: content.querySelector('#map-status-places-drawer'),
    review: content.querySelector('#map-status-review-drawer'),
    guide: content.querySelector('#map-status-guide-drawer')
  };

  hubBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetDrawerKey = btn.dataset.drawer;
      const targetDrawer = allDrawers[targetDrawerKey];
      if (!targetDrawer) return;

      const isCurrentlyOpen = targetDrawer.style.display === 'flex' || targetDrawer.style.display === 'block';

      // Close all drawers and deactivate all hub buttons
      Object.values(allDrawers).forEach(d => { if (d) d.style.display = 'none'; });
      hubBtns.forEach(b => b.classList.remove('active'));

      if (!isCurrentlyOpen) {
        targetDrawer.style.display = 'flex';
        btn.classList.add('active');

        if (targetDrawerKey === 'journal') {
          loadAndRenderPhotos();
        }
      }
    });
  });

  // Stamp Live Preview updates
  const entryDateInput = content.querySelector('#popup-stamp-entry-date');
  const entryTransportSelect = content.querySelector('#popup-stamp-entry-transport');
  const exitDateInput = content.querySelector('#popup-stamp-exit-date');
  const exitTransportSelect = content.querySelector('#popup-stamp-exit-transport');
  const inkEntrySub = content.querySelector('#ink-entry-sub');
  const inkExitSub = content.querySelector('#ink-exit-sub');

  function updateStampPreviews() {
    const tIcons = { flight: '✈️', train: '🚆', car: '🚗', bus: '🚌', ship: '🚢' };
    if (inkEntrySub && entryTransportSelect && entryDateInput) {
      inkEntrySub.textContent = `${tIcons[entryTransportSelect.value] || '✈️'} ${entryDateInput.value || 'Tarih Gir'}`;
    }
    if (inkExitSub && exitTransportSelect && exitDateInput) {
      inkExitSub.textContent = `${tIcons[exitTransportSelect.value] || '✈️'} ${exitDateInput.value || 'Tarih Gir'}`;
    }
  }

  entryDateInput?.addEventListener('input', updateStampPreviews);
  entryTransportSelect?.addEventListener('change', updateStampPreviews);
  exitDateInput?.addEventListener('input', updateStampPreviews);
  exitTransportSelect?.addEventListener('change', updateStampPreviews);

  // Travel Buddies interactivity
  const buddiesChipsEl = content.querySelector('#popup-buddies-chips');
  const buddyInput = content.querySelector('#popup-buddy-input');
  const buddyAddBtn = content.querySelector('#popup-buddy-add-btn');

  function renderBuddyChips() {
    if (!buddiesChipsEl) return;
    buddiesChipsEl.innerHTML = currentBuddies.map(b => `
      <span class="buddy-chip">${escapeHtml(b)} <button type="button" class="del-buddy" data-name="${escapeHtml(b)}">&times;</button></span>
    `).join('');
    buddiesChipsEl.querySelectorAll('.del-buddy').forEach(db => {
      db.addEventListener('click', (e) => {
        const name = e.currentTarget.dataset.name;
        currentBuddies = currentBuddies.filter(x => x !== name);
        renderBuddyChips();
      });
    });
  }

  renderBuddyChips();

  buddyAddBtn?.addEventListener('click', () => {
    const val = (buddyInput?.value || '').trim();
    if (val && !currentBuddies.includes(val)) {
      currentBuddies.push(val);
      buddyInput.value = '';
      renderBuddyChips();
    }
  });

  buddyInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buddyAddBtn?.click();
    }
  });

  // Save Stamp Data Handler
  content.querySelector('#btn-save-stamp-data')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const eDate = entryDateInput?.value || '';
    const eTrans = entryTransportSelect?.value || 'flight';
    const xDate = exitDateInput?.value || '';
    const xTrans = exitTransportSelect?.value || 'flight';

    const stampPayload = {
      entryDate: eDate,
      entryTransport: eTrans,
      exitDate: xDate,
      exitTransport: xTrans,
      buddies: currentBuddies
    };

    persistVisitDetails(stampPayload);
    triggerConfetti();

    const saveBtn = content.querySelector('#btn-save-stamp-data');
    if (saveBtn) {
      saveBtn.innerHTML = '<span>✅ Pasaporta Damgalandı!</span>';
      setTimeout(() => {
        if (saveBtn) saveBtn.innerHTML = '<span>💾 Damgaları & Yol Arkadaşlarını Kaydet</span>';
        if (allDrawers.stamp) allDrawers.stamp.style.display = 'none';
        hubBtns.forEach(b => { if (b.dataset.drawer === 'stamp') b.classList.remove('active'); });
      }, 1200);
    }
  });

  // ─── 📸 Photo Storage & Gallery Logic ───
  const photosGrid = content.querySelector('#journal-photos-grid');
  const photoCountSpan = content.querySelector('#journal-photo-count');
  const fileInput = content.querySelector('#journal-file-input');

  async function loadAndRenderPhotos() {
    if (!photosGrid) return;
    photosGrid.innerHTML = '<div class="journal-photo-loading">Fotoğraflar yükleniyor...</div>';
    const photos = await getPhotosByTarget(id);
    if (photoCountSpan) photoCountSpan.textContent = photos.length;

    if (photos.length === 0) {
      photosGrid.innerHTML = '<div class="journal-no-photos">Henüz fotoğraf eklenmemiş. Yukarıdaki <b>➕ Fotoğraf Yükle</b> butonuyla anılarınızı ekleyin!</div>';
      return;
    }

    photosGrid.innerHTML = photos.map(p => `
      <div class="journal-photo-thumb" data-id="${p.id}">
        <img src="${p.dataUrl}" alt="Photo" />
        <button type="button" class="del-photo-btn" data-id="${p.id}" title="Fotoğrafı Sil">&times;</button>
      </div>
    `).join('');

    photosGrid.querySelectorAll('.journal-photo-thumb img').forEach(img => {
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        const photoThumb = img.closest('.journal-photo-thumb');
        const photoId = photoThumb?.dataset.id;
        const photoObj = photos.find(p => p.id === photoId);
        openPhotoLightbox(img.src, cleanTitle, photoObj?.caption || '');
      });
    });

    photosGrid.querySelectorAll('.del-photo-btn').forEach(delBtn => {
      delBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const photoId = delBtn.dataset.id;
        await deletePhoto(photoId);
        await loadAndRenderPhotos();
      });
    });
  }

  fileInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const saved = await savePhoto(id, file);
      if (saved) {
        triggerConfetti();
        await loadAndRenderPhotos();
      }
    } catch (err) {
      console.error('Photo upload failed:', err);
    }
    fileInput.value = '';
  });

  // ─── 📝 Journal Mood & Notes Logic ───
  let selectedMood = currentJournal?.mood || '';
  const moodBtns = content.querySelectorAll('.journal-mood-btn');
  moodBtns.forEach(mb => {
    mb.addEventListener('click', (e) => {
      e.stopPropagation();
      moodBtns.forEach(b => b.classList.remove('active'));
      const mood = mb.dataset.mood;
      if (selectedMood === mood) {
        selectedMood = '';
      } else {
        selectedMood = mood;
        mb.classList.add('active');
      }
    });
  });

  const saveJournalBtn = content.querySelector('#btn-save-journal');
  const journalTextInput = content.querySelector('#journal-text-input');
  saveJournalBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const jText = journalTextInput?.value.trim() || '';
    const journalData = {
      text: jText,
      mood: selectedMood,
      updatedAt: new Date().toISOString()
    };
    currentJournal = journalData;

    persistVisitDetails({ journal: journalData });

    if (saveJournalBtn) {
      saveJournalBtn.innerHTML = '<span>✅ Günlük Kaydedildi!</span>';
      setTimeout(() => {
        if (saveJournalBtn) saveJournalBtn.innerHTML = '<span>💾 Günlüğü Kaydet</span>';
      }, 1500);
    }
  });

  // ─── 🍽️ Favorite Places Tracker Logic ───
  let selectedCategory = 'restaurant';
  const catBtns = content.querySelectorAll('.place-cat-btn');
  catBtns.forEach(cb => {
    cb.addEventListener('click', (e) => {
      e.stopPropagation();
      catBtns.forEach(b => b.classList.remove('active'));
      cb.classList.add('active');
      selectedCategory = cb.dataset.cat;
    });
  });

  const placesListEl = content.querySelector('#places-saved-list');
  const placeNameInput = content.querySelector('#place-name-input');
  const placeRatingSelect = content.querySelector('#place-rating-select');
  const placeNoteInput = content.querySelector('#place-note-input');
  const addPlaceBtn = content.querySelector('#btn-add-place');

  const catIcons = {
    restaurant: '🍽️',
    cafe: '☕',
    museum: '🏛️',
    nature: '🏖️',
    shopping: '🛍️',
    hotel: '🏨'
  };

  function renderPlacesList() {
    if (!placesListEl) return;
    if (!currentPlaces || currentPlaces.length === 0) {
      placesListEl.innerHTML = '<div class="places-empty-note">Henüz kayıtlı mekan yok. Yukarıdaki formdan favori restoran, kafe veya duraklarınızı ekleyin!</div>';
      return;
    }

    placesListEl.innerHTML = currentPlaces.map((pl, idx) => {
      const starCount = pl.rating !== undefined && pl.rating !== null ? Math.max(0, Math.min(5, Math.floor(Number(pl.rating) || 0))) : 5;
      return `
      <div class="place-card-item">
        <div class="place-card-left">
          <span class="place-card-cat">${catIcons[pl.category] || '📍'}</span>
          <div class="place-card-meta">
            <div class="place-card-name">${escapeHtml(pl.name)} <span class="place-card-stars">${starCount > 0 ? '⭐'.repeat(starCount) : ''}</span></div>
            ${pl.note ? `<div class="place-card-note">${escapeHtml(pl.note)}</div>` : ''}
          </div>
        </div>
        <button type="button" class="del-place-btn" data-idx="${idx}" title="Mekanı Sil">&times;</button>
      </div>
    `;
    }).join('');

    placesListEl.querySelectorAll('.del-place-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx, 10);
        currentPlaces.splice(idx, 1);
        persistVisitDetails({ places: currentPlaces });
        renderPlacesList();
      });
    });
  }

  renderPlacesList();

  addPlaceBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const name = (placeNameInput?.value || '').trim();
    if (!name) return;

    const newPlace = {
      id: 'place_' + Date.now(),
      name,
      category: selectedCategory,
      rating: parseInt(placeRatingSelect?.value || '5', 10),
      note: (placeNoteInput?.value || '').trim(),
      createdAt: new Date().toISOString()
    };

    currentPlaces.push(newPlace);
    persistVisitDetails({ places: currentPlaces });
    if (placeNameInput) placeNameInput.value = '';
    if (placeNoteInput) placeNoteInput.value = '';
    renderPlacesList();
    triggerConfetti();
  });

  // IMDb Stars Interaction (Click & Hover)
  const starSpans = content.querySelectorAll('.imdb-star');
  const scoreDisplay = content.querySelector('#rating-score-display');
  const starsRow = content.querySelector('#imdb-stars-row');

  function renderStars(val) {
    starSpans.forEach(s => {
      const sVal = parseInt(s.dataset.score, 10);
      if (sVal <= val) {
        s.classList.add('filled');
      } else {
        s.classList.remove('filled');
      }
    });
  }

  starSpans.forEach(star => {
    star.addEventListener('mouseenter', () => {
      const hoverVal = parseInt(star.dataset.score, 10);
      renderStars(hoverVal);
      if (scoreDisplay) scoreDisplay.textContent = `⭐ ${hoverVal}/10`;
    });

    star.addEventListener('click', (e) => {
      e.stopPropagation();
      const scoreVal = parseInt(star.dataset.score, 10);
      currentRating = (currentRating === scoreVal) ? 0 : scoreVal;
      renderStars(currentRating);

      if (scoreDisplay) {
        scoreDisplay.textContent = currentRating > 0 ? `⭐ ${currentRating}/10` : '-';
      }

      persistVisitDetails({ rating: currentRating });
    });
  });

  starsRow?.addEventListener('mouseleave', () => {
    renderStars(currentRating);
    if (scoreDisplay) {
      scoreDisplay.textContent = currentRating > 0 ? `⭐ ${currentRating}/10` : '-';
    }
  });

  // Note save handler
  const saveNote = () => {
    const noteVal = content.querySelector('#popup-note-input')?.value.trim() || '';
    persistVisitDetails({ notes: noteVal });
    const saveBtn = content.querySelector('#popup-note-save-btn');
    if (saveBtn) {
      saveBtn.textContent = '✓';
      setTimeout(() => { if (saveBtn) saveBtn.textContent = '💾'; }, 1500);
    }
  };

  content.querySelector('#popup-note-save-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    saveNote();
  });
  content.querySelector('#popup-note-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveNote();
    }
  });

  // Status buttons click handler
  content.querySelectorAll('.map-status-btn[data-val]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const val = btn.dataset.val;
      currentStatus = val;

      if (type === 'province') {
        const num = id.replace('TR::', '');
        saveTurkeyVisit(num, val);

        if (val === 'visited') {
          saveWorldVisit('TR', 'visited');
        } else if (val === 'planned') {
          const data = getStorageData();
          if (data.worldVisits['TR']?.status !== 'visited') saveWorldVisit('TR', 'planned');
        } else if (val === 'wishlist') {
          const data = getStorageData();
          if (!['visited', 'planned'].includes(data.worldVisits['TR']?.status)) saveWorldVisit('TR', 'wishlist');
        } else if (val === 'unvisited') {
          const data = getStorageData();
          const provs = Object.values(data.turkeyVisits);
          if (provs.some(v => v.status === 'visited')) saveWorldVisit('TR', 'visited');
          else if (provs.some(v => v.status === 'planned')) saveWorldVisit('TR', 'planned');
          else if (provs.some(v => v.status === 'wishlist')) saveWorldVisit('TR', 'wishlist');
        }
      } else if (type === 'country') {
        saveWorldVisit(id, val);

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
      } else if (type === 'subregion') {
        saveWorldVisit(id, val);

        const subregionRaw = id.includes('::') ? id.slice(id.indexOf('::') + 2) : id;
        const parentRegion = feature?.properties?.parent_region || getSubregionParentRegion(countryCode, subregionRaw);
        const parentRegionKey = parentRegion ? `${countryCode}::${parentRegion}` : null;

        if (parentRegionKey && parentRegion) {
          if (val === 'visited') {
            saveWorldVisit(parentRegionKey, 'visited');
          } else if (val === 'planned') {
            const data = getStorageData();
            if (data.worldVisits[parentRegionKey]?.status !== 'visited') {
              saveWorldVisit(parentRegionKey, 'planned');
            }
          } else if (val === 'wishlist') {
            const data = getStorageData();
            const pStatus = data.worldVisits[parentRegionKey]?.status;
            if (!pStatus || pStatus === 'unvisited') {
              saveWorldVisit(parentRegionKey, 'wishlist');
            }
          } else if (val === 'unvisited') {
            const data = getStorageData();
            const siblingNames = getSubregionsForParentRegion(countryCode, parentRegion);
            const siblingStatuses = siblingNames.map(s => data.worldVisits[`${countryCode}::${s}`]?.status).filter(Boolean);

            if (siblingStatuses.includes('visited')) {
              saveWorldVisit(parentRegionKey, 'visited');
            } else if (siblingStatuses.includes('planned')) {
              saveWorldVisit(parentRegionKey, 'planned');
            } else if (siblingStatuses.includes('wishlist')) {
              saveWorldVisit(parentRegionKey, 'wishlist');
            } else {
              saveWorldVisit(parentRegionKey, 'unvisited');
            }
          }
        }

        if (countryCode) {
          if (val === 'visited') {
            saveWorldVisit(countryCode, 'visited');
          } else if (val === 'planned') {
            const data = getStorageData();
            if (data.worldVisits[countryCode]?.status !== 'visited') {
              saveWorldVisit(countryCode, 'planned');
            }
          } else if (val === 'wishlist') {
            const data = getStorageData();
            const cStatus = data.worldVisits[countryCode]?.status;
            if (!cStatus || cStatus === 'unvisited') {
              saveWorldVisit(countryCode, 'wishlist');
            }
          } else if (val === 'unvisited') {
            const data = getStorageData();
            const prefix = `${countryCode}::`;
            const allSubs = Object.entries(data.worldVisits)
              .filter(([k]) => k.startsWith(prefix))
              .map(([, v]) => v.status);

            if (allSubs.includes('visited')) {
              saveWorldVisit(countryCode, 'visited');
            } else if (allSubs.includes('planned')) {
              saveWorldVisit(countryCode, 'planned');
            } else if (allSubs.includes('wishlist')) {
              saveWorldVisit(countryCode, 'wishlist');
            } else {
              saveWorldVisit(countryCode, 'unvisited');
            }
          }
        }
      } else if (type === 'region') {
        saveWorldVisit(id, val);

        const regionRaw = id.includes('::') ? id.slice(id.indexOf('::') + 2) : id;
        const childSubregions = getSubregionsForParentRegion(countryCode, regionRaw);

        if (childSubregions.length > 0) {
          childSubregions.forEach(sName => {
            saveWorldVisit(`${countryCode}::${sName}`, val);
          });
        }

        if (countryCode) {
          if (val === 'visited') {
            saveWorldVisit(countryCode, 'visited');
          } else if (val === 'planned') {
            const data = getStorageData();
            if (data.worldVisits[countryCode]?.status !== 'visited') {
              saveWorldVisit(countryCode, 'planned');
            }
          } else if (val === 'wishlist') {
            const data = getStorageData();
            const cStatus = data.worldVisits[countryCode]?.status;
            if (!cStatus || cStatus === 'unvisited') {
              saveWorldVisit(countryCode, 'wishlist');
            }
          } else if (val === 'unvisited') {
            const data = getStorageData();
            const prefix = `${countryCode}::`;
            const allSubs = Object.entries(data.worldVisits)
              .filter(([k]) => k.startsWith(prefix))
              .map(([, v]) => v.status);

            if (allSubs.includes('visited')) {
              saveWorldVisit(countryCode, 'visited');
            } else if (allSubs.includes('planned')) {
              saveWorldVisit(countryCode, 'planned');
            } else if (allSubs.includes('wishlist')) {
              saveWorldVisit(countryCode, 'wishlist');
            } else {
              saveWorldVisit(countryCode, 'unvisited');
            }
          }
        }
      } else if (type === 'city') {
        const cleanCityName = id.includes('::') ? id.slice(id.indexOf('::') + 2) : id;

        if (val === 'visited') {
          toggleWorldCity(countryCode, cleanCityName, true);
        } else {
          toggleWorldCity(countryCode, cleanCityName, false);
        }

        saveWorldVisit(id, val);

        const matchedRegionRaw = findRegionRawForPoint(countryCode, latlng, cleanCityName);
        if (matchedRegionRaw) {
          const regionKey = `${countryCode}::${matchedRegionRaw}`;
          if (val === 'unvisited') {
            const data = getStorageData();
            const subregionsInParent = getSubregionsForParentRegion(countryCode, matchedRegionRaw);
            const otherSubVisited = subregionsInParent.some(sName => {
              const sKey = `${countryCode}::${sName}`;
              return sKey !== id && data.worldVisits[sKey]?.status === 'visited';
            });
            const otherCitiesVisitedInRegion = (data.worldCities || []).some(c => {
              if (c.countryCode !== countryCode || c.cityName.toLowerCase() === cleanCityName.toLowerCase()) return false;
              const r = findRegionRawForPoint(countryCode, null, c.cityName);
              return r && r === matchedRegionRaw;
            });
            if (!otherSubVisited && !otherCitiesVisitedInRegion) {
              saveWorldVisit(regionKey, 'unvisited');
            }
          } else {
            saveWorldVisit(regionKey, val);
          }

          if (!activeFeatureLayer && regionLayers[countryCode]) {
            regionLayers[countryCode].eachLayer(l => {
              const raw = l.feature?.properties?.name || l.feature?.properties?.NAME_1;
              if (raw && raw === matchedRegionRaw) {
                activeFeatureLayer = l;
              }
            });
          }
        }

        if (countryCode) {
          if (val === 'visited') {
            saveWorldVisit(countryCode, 'visited');
          } else if (val === 'planned') {
            const data = getStorageData();
            if (data.worldVisits[countryCode]?.status !== 'visited') {
              saveWorldVisit(countryCode, 'planned');
            }
          } else if (val === 'wishlist') {
            const data = getStorageData();
            const cStatus = data.worldVisits[countryCode]?.status;
            if (!cStatus || cStatus === 'unvisited') {
              saveWorldVisit(countryCode, 'wishlist');
            }
          } else if (val === 'unvisited') {
            const data = getStorageData();
            const prefix = `${countryCode}::`;
            const allSubs = Object.entries(data.worldVisits)
              .filter(([k]) => k.startsWith(prefix) && k !== id && (!matchedRegionRaw || k !== `${countryCode}::${matchedRegionRaw}`))
              .map(([, v]) => v.status);
            const hasVisitedCities = (data.worldCities || []).some(c => c.countryCode === countryCode && c.cityName.toLowerCase() !== cleanCityName.toLowerCase());

            if (allSubs.includes('visited') || hasVisitedCities) {
              saveWorldVisit(countryCode, 'visited');
            } else if (allSubs.includes('planned')) {
              saveWorldVisit(countryCode, 'planned');
            } else if (allSubs.includes('wishlist')) {
              saveWorldVisit(countryCode, 'wishlist');
            } else {
              saveWorldVisit(countryCode, 'unvisited');
            }
          }
        }
      }

      if (activeFeatureLayer) {
        const STATUS = getStatusConfig();
        const cfg = STATUS[val] || STATUS.unvisited;
        const themeCfg = getThemeConfig();
        const fillColor = val === 'unvisited' ? themeCfg.landFill : cfg.color;
        activeFeatureLayer.setStyle({ fillColor });
      }

      refreshAllStyles();
      refreshStats();

      content.querySelectorAll('.map-status-btn[data-val]').forEach(b => {
        if (b.dataset.val === val) b.classList.add('active');
        else b.classList.remove('active');
      });

      const hubTabsEl = content.querySelector('#popup-action-hub-tabs');
      if (val === 'visited') {
        if (hubTabsEl) hubTabsEl.style.display = 'flex';
      } else {
        if (hubTabsEl) hubTabsEl.style.display = 'none';
        Object.values(allDrawers).forEach(d => { if (d) d.style.display = 'none'; });
        hubBtns.forEach(b => b.classList.remove('active'));
      }
    });
  });
  let activeGeoFeature = feature;
  if (!activeGeoFeature && countryCode && countryFeaturesByCode[countryCode]) {
    activeGeoFeature = countryFeaturesByCode[countryCode];
  }
  closeActivePopup();
  if (map) {
    try { map.closeTooltip(); } catch {}
  }
  showPopupBackdrop(activeGeoFeature, currentStatus, cleanTitle, latlng, id, type, countryCode);

  activeStatusPopup = L.popup({
    closeButton: false,
    className: 'clean-status-popup',
    offset: [0, -10],
    maxWidth: typeof window !== 'undefined' ? Math.min(320, window.innerWidth - 20) : 320
  })
  .setLatLng(latlng)
  .setContent(content)
  .openOn(map);

  activePopupOutsideListener = (e) => {
    const popupEl = activeStatusPopup ? activeStatusPopup.getElement() : null;
    if ((content && content.contains(e.target)) || (popupEl && popupEl.contains(e.target))) {
      return;
    }
    _popupClosedOnPointerDown = true;
    lastPopupClosedAt = Date.now();
    closeActivePopup();
    if (map) {
      try { map.closeTooltip(); } catch {}
    }
  };

  setTimeout(() => {
    if (activeStatusPopup && activePopupOutsideListener) {
      document.addEventListener('pointerdown', activePopupOutsideListener, true);
    }
  }, 20);
}


// ─── Style Caching & Country Status Helpers ────────────────────────────────────
let _cachedStorageData = null;
let _cachedSubdivisionSummary = null;

function invalidateStorageCache() {
  _cachedStorageData = null;
  _cachedSubdivisionSummary = null;
}

function getCachedStorage() {
  if (!_cachedStorageData) {
    _cachedStorageData = getStorageData();
  }
  return _cachedStorageData;
}

function getSubdivisionSummary() {
  if (_cachedSubdivisionSummary) return _cachedSubdivisionSummary;
  const { worldVisits, turkeyVisits } = getCachedStorage();
  const visited = new Set();
  const planned = new Set();
  const wishlist = new Set();

  if (turkeyVisits && Object.values(turkeyVisits).some(v => v?.status === 'visited')) visited.add('TR');
  else if (turkeyVisits && Object.values(turkeyVisits).some(v => v?.status === 'planned')) planned.add('TR');
  else if (turkeyVisits && Object.values(turkeyVisits).some(v => v?.status === 'wishlist')) wishlist.add('TR');

  if (worldVisits) {
    for (const [k, v] of Object.entries(worldVisits)) {
      if (k.includes('::') && v?.status) {
        const parentCode = k.split('::')[0];
        if (v.status === 'visited') visited.add(parentCode);
        else if (v.status === 'planned' && !visited.has(parentCode)) planned.add(parentCode);
        else if (v.status === 'wishlist' && !visited.has(parentCode) && !planned.has(parentCode)) wishlist.add(parentCode);
      }
    }
  }
  _cachedSubdivisionSummary = { visited, planned, wishlist };
  return _cachedSubdivisionSummary;
}

function getEffectiveCountryStatus(countryCode) {
  if (!countryCode) return 'unvisited';
  const { worldVisits } = getCachedStorage();
  const direct = worldVisits[countryCode]?.status;
  if (direct && direct !== 'unvisited') return direct;
  const summary = getSubdivisionSummary();
  if (summary.visited.has(countryCode)) return 'visited';
  if (summary.planned.has(countryCode)) return 'planned';
  if (summary.wishlist.has(countryCode)) return 'wishlist';
  return 'unvisited';
}

function countryBorderStyle() {
  const zoom = map?.getZoom() || 3;
  const isDark = getTheme() !== 'light';
  const zoomed = zoom >= REGION_ZOOM;
  return {
    fill: false,
    fillOpacity: 0,
    color: isDark ? 'rgba(255, 255, 255, 0.90)' : 'rgba(15, 23, 42, 0.85)',
    weight: zoomed ? (zoom >= SUBREGION_ZOOM ? 2.1 : 1.9) : 1.3,
    opacity: 1,
    interactive: false
  };
}

function countryStyle(c) {
  const code = c?.code;
  const zoom = map?.getZoom() || 3;
  const themeCfg = getThemeConfig();
  const isDark = getTheme() !== 'light';
  const zoomed = zoom >= REGION_ZOOM;

  if (isVisaModeActive) {
    const pType = getPassportType();
    const visaInfo = getVisaBadgeInfo(code, pType);
    let visaFill = '#1e293b';
    if (visaInfo) {
      if (visaInfo.status === 'free') visaFill = '#10b981';
      else if (visaInfo.status === 'voa_evisa') visaFill = '#f59e0b';
      else if (visaInfo.status === 'required') visaFill = '#ef4444';
    }
    return {
      fillColor: visaFill,
      fillOpacity: 0.85,
      color: isDark ? 'rgba(255, 255, 255, 0.70)' : 'rgba(15, 23, 42, 0.65)',
      weight: zoomed ? 2.0 : 1.5,
      opacity: 1.0,
      interactive: true
    };
  }

  const status = ns(getEffectiveCountryStatus(code));
  const STATUS = getStatusConfig();
  const cfg = STATUS[status];

  let isInteractive = true;
  let hasRegions = false;
  if (zoomed) {
    const hasRegionLayer = regionLayers[code] && map.hasLayer(regionLayers[code]);
    const hasTurkeyLayer = code === 'TR' && turkeyLayer && map.hasLayer(turkeyLayer);
    if (hasRegionLayer || hasTurkeyLayer) {
      isInteractive = false;
      hasRegions = true;
    }
  }

  // When region layer is active: country polygon becomes a ghost (no fill, so it doesn't color provinces from behind)
  const fillOpacity = hasRegions
    ? 0
    : (status === 'unvisited' ? 0.95 : cfg.fillOpacity);

  return {
    fillColor: status === 'unvisited' ? themeCfg.landFill : cfg.color,
    fillOpacity,
    color: isDark ? 'rgba(255, 255, 255, 0.70)' : 'rgba(15, 23, 42, 0.65)',
    weight: zoomed ? 2.0 : 1.5,
    opacity: hasRegions ? 0 : 1.0,
    interactive: isInteractive
  };
}

function regionStyle(rawName, countryCode) {
  const { worldVisits } = getCachedStorage();
  const key = `${countryCode}::${rawName}`;
  const status = ns(worldVisits[key]?.status);
  const STATUS = getStatusConfig();
  const cfg = STATUS[status];
  const themeCfg = getThemeConfig();
  const isDark = getTheme() !== 'light';

  let isInteractive = true;
  let hasSubregions = false;
  if (subregionLayers[countryCode] && map && map.hasLayer(subregionLayers[countryCode])) {
    isInteractive = false;
    hasSubregions = true;
  }

  // 1. Durum: Bölge bizzat işaretlenmiş (Gidildi / Planlanıyor / İstek Listesi)
  if (status !== 'unvisited') {
    return {
      fillColor: cfg.color,
      fillOpacity: hasSubregions ? 0 : cfg.fillOpacity,
      color: '#ffffff',
      weight: 1.5,
      opacity: 1,
      interactive: isInteractive
    };
  }

  // 3. Durum: Ülke ziyaret edilmiş (veya planlanmış/istek) ama bu bölge henüz ziyaret edilmemiş!
  const countryStatus = ns(getEffectiveCountryStatus(countryCode));

  if (countryStatus !== 'unvisited') {
    const tintColor = getStatusColor(countryStatus);
    const blended = blendColors(themeCfg.landFill, tintColor, 0.28);
    return {
      fillColor: blended,
      fillOpacity: hasSubregions ? 0 : 0.95,
      color: isDark ? 'rgba(148, 163, 184, 0.45)' : 'rgba(100, 116, 139, 0.45)',
      weight: hasSubregions ? 1.8 : 1.0,
      opacity: hasSubregions ? 0.6 : 0.85,
      interactive: isInteractive
    };
  }

  // 2. Durum: Ülke de ziyaret edilmemiş (saf harita zemin rengi)
  return {
    fillColor: themeCfg.landFill,
    fillOpacity: hasSubregions ? 0 : 0.95,
    color: isDark ? 'rgba(148, 163, 184, 0.40)' : 'rgba(100, 116, 139, 0.40)',
    weight: hasSubregions ? 1.8 : 1.0,
    opacity: hasSubregions ? 0.6 : 0.8,
    interactive: isInteractive
  };
}

function provinceStyle(provinceId) {
  const { turkeyVisits } = getCachedStorage();
  const status = ns(turkeyVisits[provinceId]?.status);
  const STATUS = getStatusConfig();
  const cfg = STATUS[status];
  const themeCfg = getThemeConfig();
  const isDark = getTheme() !== 'light';

  // 1. Durum: İl bizzat ziyaret edilmiş / planlanmış / istek listesinde
  if (status !== 'unvisited') {
    return {
      fillColor: cfg.color,
      fillOpacity: cfg.fillOpacity,
      color: '#ffffff',
      weight: 1.2,
      opacity: 1
    };
  }

  // 3. Durum: Türkiye ziyaret edilmiş ama bu il henüz ziyaret edilmemiş!
  const trStatus = ns(getEffectiveCountryStatus('TR'));

  if (trStatus !== 'unvisited') {
    const tintColor = getStatusColor(trStatus);
    const blended = blendColors(themeCfg.landFill, tintColor, 0.28);
    return {
      fillColor: blended,
      fillOpacity: 0.95,
      color: isDark ? 'rgba(148, 163, 184, 0.45)' : 'rgba(100, 116, 139, 0.45)',
      weight: 1.0,
      opacity: 0.85
    };
  }

  // 2. Durum: Türkiye de ziyaret edilmemiş (saf harita zemin rengi)
  return {
    fillColor: themeCfg.landFill,
    fillOpacity: 0.95,
    color: isDark ? 'rgba(148, 163, 184, 0.40)' : 'rgba(100, 116, 139, 0.40)',
    weight: 1.0,
    opacity: 0.8
  };
}

function subregionStyle(name, code) {
  const { worldVisits } = getCachedStorage();
  const key = `${code}::${name}`;
  const status = ns(worldVisits[key]?.status);
  const STATUS = getStatusConfig();
  const cfg = STATUS[status];
  const themeCfg = getThemeConfig();
  const isDark = getTheme() !== 'light';
  
  // 1. Durum: Alt şehir bizzat ziyaret edilmiş / planlanmış / istek
  if (status !== 'unvisited') {
    return {
      fillColor: cfg.color,
      fillOpacity: cfg.fillOpacity,
      color: '#ffffff',
      weight: 1.2,
      opacity: 1
    };
  }

  // 3. Durum: Ülke ziyaret edilmiş ama bu alt şehir henüz ziyaret edilmemiş!
  const countryStatus = ns(getEffectiveCountryStatus(code));

  if (countryStatus !== 'unvisited') {
    const tintColor = getStatusColor(countryStatus);
    const blended = blendColors(themeCfg.landFill, tintColor, 0.28);
    return {
      fillColor: blended,
      fillOpacity: 0.95,
      color: isDark ? 'rgba(148, 163, 184, 0.30)' : 'rgba(100, 116, 139, 0.30)',
      weight: 0.7,
      opacity: 0.75
    };
  }

  // 2. Durum: Ziyaret edilmemiş ülke alt şehirleri
  return {
    fillColor: themeCfg.landFill,
    fillOpacity: 0.95,
    color: isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(100, 116, 139, 0.25)',
    weight: 0.7,
    opacity: 0.7
  };
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

  const homeCode = getHomeCountry() || 'TR';
  const subStats = getHomeCountrySubdivisionStats(homeCode, turkeyVisits, worldVisits);

  // World countries visited count
  const trVisited = Object.values(turkeyVisits || {}).filter(v => v?.status === 'visited').length;
  const worldCodes = Object.keys(worldVisits || {}).filter(k => !k.includes('::') && worldVisits[k]?.status === 'visited');
  if (trVisited > 0 && !worldCodes.includes('TR')) worldCodes.push('TR');
  const worldCount = worldCodes.length;

  const visitedColor = getStatusColor('visited');

  cEl.innerHTML = buildStatsCountriesHtml(worldCount, subStats, visitedColor);

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
