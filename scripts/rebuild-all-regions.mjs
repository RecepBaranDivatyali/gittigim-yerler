// scripts/rebuild-all-regions.mjs
// Master cleaner: removes doughnut holes from all polygons, dissolves tiny parish enclaves into primary regions/districts for all 240+ countries.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const regionsDir = path.join(__dirname, '../public/data/regions');
const files = fs.readdirSync(regionsDir).filter(f => f.endsWith('.json') && !f.startsWith('_'));

console.log(`Rebuilding and cleaning all ${files.length} region files...`);

// Helper to remove interior doughnut holes from any geometry
function removeHolesFromGeometry(geometry) {
  if (!geometry) return null;
  if (geometry.type === 'Polygon') {
    return { type: 'Polygon', coordinates: [geometry.coordinates[0]] };
  }
  if (geometry.type === 'MultiPolygon') {
    return {
      type: 'MultiPolygon',
      coordinates: geometry.coordinates.map(poly => [poly[0]])
    };
  }
  return geometry;
}

// Special custom region mergers for over-fragmented countries
const CUSTOM_MERGERS = {
  // Kosovo: 7 Major Districts
  XK: (feature) => {
    const p = feature.properties || {};
    const reg = p.region || p.woe_name || p.name || 'Pristina';
    const trMap = {
      'Đakovica': 'Gjakova (Yakova)',
      'Prizren': 'Prizren',
      'Gnjilane': 'Gjilan (Gilan)',
      'Uroševac': 'Ferizaj (Ferizovik)',
      'Kosovska Mitrovica': 'Mitrovica (Mitroviça)',
      'Pristina': 'Priştine (Pristina)',
      'Peć': 'Peja (İpek)'
    };
    return { key: reg, name: trMap[reg] || reg };
  },

  // North Macedonia: 8 Statistical Regions
  MK: (feature) => {
    const p = feature.properties || {};
    const name = p.name || '';
    const reg = p.region || p.gns_region || '';

    let key = 'Skopje';
    if (['Struga','Centar župa','Debar','Mavrovo and Rostusa','Vevčani','Ohrid','Debarca','Kičevo','Drugovo','Zajas','Oslomej','Vraneštica'].some(x => name.includes(x))) key = 'Southwestern';
    else if (['Tetovo','Gostivar','Bogovinje','Brvenica','Vrapčište','Želino','Jegunovce','Tearce'].some(x => name.includes(x))) key = 'Polog';
    else if (['Bitola','Prilep','Resen','Kruševo','Demir Hisar','Dolneni','Krivogaštani','Mogila','Novaci'].some(x => name.includes(x))) key = 'Pelagonia';
    else if (['Strumitsa','Strumica','Gevgelija','Radoviš','Valandovo','Bosilovo','Vasilevo','Dojran','Konče','Novo Selo','Bogdanci'].some(x => name.includes(x))) key = 'Southeastern';
    else if (['Veles','Kavadartsi','Kavadarci','Negotino','Gradsko','Rosoman','Čaška','Lozovo','Demir Kapija'].some(x => name.includes(x))) key = 'Vardar';
    else if (['Kumanovo','Kratovo','Kriva Palanka','Lipkovo','Rankovce','Staro Nagoričane'].some(x => name.includes(x))) key = 'Northeastern';
    else if (['Štip','Kočani','Berovo','Vinica','Delčevo','Zrnovci','Karbinci','Makedonska Kamenica','Pehčevo','Probištip','Češinovo-Obleševo'].some(x => name.includes(x))) key = 'Eastern';

    const trNames = {
      'Skopje': 'Üsküp Bölgesi (Skopje)',
      'Polog': 'Polog (Kalkandelen / Tetovo)',
      'Southwestern': 'Güneybatı (Ohri / Struga)',
      'Southeastern': 'Güneydoğu (Ustrumca)',
      'Pelagonia': 'Pelagonya (Manastır / Bitola)',
      'Vardar': 'Vardar (Köprülü / Veles)',
      'Northeastern': 'Kuzeydoğu (Kumanova)',
      'Eastern': 'Doğu (İştip)'
    };
    return { key, name: trNames[key] || key };
  }
};

let updatedCount = 0;

for (const file of files) {
  const code = file.replace('.json', '');
  const filePath = path.join(regionsDir, file);
  const geojson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  let features = geojson.features;

  // 1. Remove urban enclave holes (e.g. Hungary Urban county holes)
  if (code === 'HU') {
    features = features.filter(f => f.properties?.type_en !== 'Urban county');
  } else if (code === 'SI') {
    const stats = features.filter(f => f.properties?.type_en === 'Statistical Region');
    if (stats.length > 0) features = stats;
  } else if (code === 'PH') {
    features = features.filter(f => f.properties?.type_en === 'Province');
  }

  // 2. Custom merger if defined (e.g. Kosovo, North Macedonia)
  if (CUSTOM_MERGERS[code]) {
    const groups = {};
    features.forEach(f => {
      const info = CUSTOM_MERGERS[code](f);
      if (!groups[info.key]) groups[info.key] = { name: info.name, polygons: [] };
      const g = removeHolesFromGeometry(f.geometry);
      if (!g) return;
      if (g.type === 'Polygon') groups[info.key].polygons.push([g.coordinates[0]]);
      else if (g.type === 'MultiPolygon') g.coordinates.forEach(p => groups[info.key].polygons.push([p[0]]));
    });

    features = Object.keys(groups).map(key => ({
      type: 'Feature',
      properties: { name: groups[key].name, type_en: 'Region', iso_a2: code },
      geometry: { type: 'MultiPolygon', coordinates: groups[key].polygons }
    }));
  } else {
    // 3. Remove interior doughnut holes from all remaining geometries!
    features = features.map(f => ({
      ...f,
      geometry: removeHolesFromGeometry(f.geometry)
    }));
  }

  const newGeoJSON = { type: 'FeatureCollection', features };
  fs.writeFileSync(filePath, JSON.stringify(newGeoJSON), 'utf-8');
  updatedCount++;
}

console.log(`\nSuccess! All ${updatedCount} region files rebuilt, cleaned, and holes completely removed.`);
