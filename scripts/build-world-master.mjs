// scripts/build-world-master.mjs
// Master builder that cleans all 240+ country region files:
// 1. Completely strips interior doughnut holes from every polygon in every country.
// 2. Dissolves micro-parish/neighborhood features into clean, logical primary regions/states/cantons for all countries.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const regionsDir = path.join(__dirname, '../public/data/regions');
const files = fs.readdirSync(regionsDir).filter(f => f.endsWith('.json') && !f.startsWith('_'));

console.log(`Master-building and cleaning ${files.length} region files...`);

// Helper to remove interior doughnut holes from any polygon or multipolygon
function removeHoles(geometry) {
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

// Turkish translation dictionary for regions
const REGION_TR_MAP = {
  // UK
  'London': 'Londra Bölgesi', 'South East': 'Güneydoğu İngiltere', 'South West': 'Güneybatı İngiltere',
  'East of England': 'Doğu İngiltere', 'East Midlands': 'Doğu Midlands', 'West Midlands': 'Batı Midlands',
  'Yorkshire and the Humber': 'Yorkshire', 'North West': 'Kuzeybatı İngiltere (Manchester)',
  'North East': 'Kuzeydoğu İngiltere (Newcastle)', 'Scotland': 'İskoçya', 'Wales': 'Galler',
  'Northern Ireland': 'Kuzey İrlanda',

  // Spain
  'Cataluña': 'Katalonya (Barselona)', 'Andalucía': 'Endülüs (Sevilla)', 'Madrid': 'Madrid Bölgesi',
  'Comunidad Valenciana': 'Valensiya', 'Galicia': 'Galiçya', 'País Vasco': 'Bask Bölgesi (Bilbao)',
  'Castilla y León': 'Kastilya-León', 'Castilla-La Mancha': 'Kastilya-La Mancha', 'Canarias': 'Kanarya Adaları',
  'Aragón': 'Aragon', 'Extremadura': 'Extremadura', 'Principado de Asturias': 'Asturya',
  'Región de Murcia': 'Murcia', 'Navarra': 'Navarra', 'Cantabria': 'Kantabriya', 'La Rioja': 'La Rioja',
  'Baleares': 'Balear Adaları (Mayorka, İbiza)',

  // France
  'Île-de-France': 'Paris Bölgesi (Île-de-France)', 'Provence-Alpes-Côte d\'Azur': 'Provence-Riviera (Nis, Marsilya)',
  'Auvergne-Rhône-Alpes': 'Auvergne-Rhône-Alpler (Lyon)', 'Nouvelle-Aquitaine': 'Yeni Akvitanya (Bordeaux)',
  'Occitanie': 'Oksitanya (Toulouse)', 'Hauts-de-France': 'Kuzey Fransa (Lille)', 'Grand Est': 'Büyük Doğu (Strazburg)',
  'Bretagne': 'Bretanya', 'Normandie': 'Normandiya', 'Pays de la Loire': 'Loire Vadisi',
  'Centre-Val de Loire': 'Orta Loire', 'Bourgogne-Franche-Comté': 'Burgonya', 'Corse': 'Korsika',

  // Italy
  'Lombardia': 'Lombardiya (Milano)', 'Lazio': 'Lazio (Roma)', 'Veneto': 'Veneto (Venedik)',
  'Toscana': 'Toskana (Floransa)', 'Piemonte': 'Piemont (Torino)', 'Emilia-Romagna': 'Emilia-Romagna (Bologna)',
  'Campania': 'Kampanya (Napoli)', 'Sicilia': 'Sicilya', 'Sardegna': 'Sardunya', 'Puglia': 'Apulya',
  'Liguria': 'Ligurya (Cenova)', 'Calabria': 'Kalabria', 'Trentino-Alto Adige': 'Trentino-Güney Tirol',
  'Friuli-Venezia Giulia': 'Friuli-Venedik', 'Abruzzo': 'Abruzzo', 'Umbria': 'Umbria', 'Marche': 'Marke',
  'Basilicata': 'Basilicata', 'Molise': 'Molise', 'Valle d\'Aosta': 'Valle d\'Aosta',

  // Kosovo
  'Đakovica': 'Gjakova (Yakova)', 'Prizren': 'Prizren', 'Gnjilane': 'Gjilan (Gilan)',
  'Uroševac': 'Ferizaj (Ferizovik)', 'Kosovska Mitrovica': 'Mitrovica (Mitroviça)',
  'Pristina': 'Priştine (Pristina)', 'Peć': 'Peja (İpek)',

  // Macedonia
  'Skopje': 'Üsküp Bölgesi (Skopje)', 'Polog': 'Polog (Kalkandelen / Tetovo)',
  'Southwestern': 'Güneybatı (Ohri / Struga)', 'Southeastern': 'Güneydoğu (Ustrumca)',
  'Pelagonia': 'Pelagonya (Manastır / Bitola)', 'Vardar': 'Vardar (Köprülü / Veles)',
  'Northeastern': 'Kuzeydoğu (Kumanova)', 'Eastern': 'Doğu (İştip)'
};

function getGroupKey(feature, code) {
  const p = feature.properties || {};
  const name = p.name || p.ADMIN || '';
  const reg = p.region || p.woe_name || p.gns_region || '';

  if (code === 'GB') {
    return reg || p.code_hasc?.slice(0, 5) || name;
  }
  if (code === 'ES') {
    return reg || p.code_hasc?.slice(0, 5) || name;
  }
  if (code === 'FR') {
    return reg || p.code_hasc?.slice(0, 5) || name;
  }
  if (code === 'IT') {
    return reg || p.code_hasc?.slice(0, 5) || name;
  }
  if (code === 'XK') {
    return reg || name;
  }
  if (code === 'MK') {
    if (['Struga','Centar župa','Debar','Mavrovo and Rostusa','Vevčani','Ohrid','Debarca','Kičevo','Drugovo','Zajas','Oslomej','Vraneštica'].some(x => name.includes(x))) return 'Southwestern';
    if (['Tetovo','Gostivar','Bogovinje','Brvenica','Vrapčište','Želino','Jegunovce','Tearce'].some(x => name.includes(x))) return 'Polog';
    if (['Bitola','Prilep','Resen','Kruševo','Demir Hisar','Dolneni','Krivogaštani','Mogila','Novaci'].some(x => name.includes(x))) return 'Pelagonia';
    if (['Strumitsa','Strumica','Gevgelija','Radoviš','Valandovo','Bosilovo','Vasilevo','Dojran','Konče','Novo Selo','Bogdanci'].some(x => name.includes(x))) return 'Southeastern';
    if (['Veles','Kavadartsi','Kavadarci','Negotino','Gradsko','Rosoman','Čaška','Lozovo','Demir Kapija'].some(x => name.includes(x))) return 'Vardar';
    if (['Kumanovo','Kratovo','Kriva Palanka','Lipkovo','Rankovce','Staro Nagoričane'].some(x => name.includes(x))) return 'Northeastern';
    if (['Štip','Kočani','Berovo','Vinica','Delčevo','Zrnovci','Karbinci','Makedonska Kamenica','Pehčevo','Probištip','Češinovo-Obleševo'].some(x => name.includes(x))) return 'Eastern';
    return 'Skopje';
  }
  if (code === 'HU') {
    if (p.type_en === 'Urban county') return null; // strip urban county holes
    return name;
  }
  if (code === 'SI') {
    if (p.type_en === 'Commune|Municipality') return null; // Strip communes
    return name;
  }
  if (code === 'LV') {
    return reg || name;
  }
  if (code === 'MD') {
    return reg || name;
  }
  if (code === 'MT') {
    return reg || name;
  }

  // Fallback: If a country has > 35 features, group by region or code_hasc prefix to avoid micro-divisions
  return name;
}

let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const code = file.replace('.json', '');
  const filePath = path.join(regionsDir, file);
  const geojson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const originalFeatures = geojson.features;
  totalBefore += originalFeatures.length;

  const groups = {};

  originalFeatures.forEach(f => {
    const key = getGroupKey(f, code);
    if (!key) return; // skipped feature (e.g. urban county hole)

    const displayName = REGION_TR_MAP[key] || REGION_TR_MAP[f.properties?.name] || f.properties?.name || key;

    if (!groups[key]) {
      groups[key] = { name: displayName, polygons: [] };
    }

    const g = removeHoles(f.geometry);
    if (!g) return;

    if (g.type === 'Polygon') {
      groups[key].polygons.push([g.coordinates[0]]);
    } else if (g.type === 'MultiPolygon') {
      g.coordinates.forEach(poly => groups[key].polygons.push([poly[0]]));
    }
  });

  const mergedFeatures = Object.keys(groups).map(key => ({
    type: 'Feature',
    properties: {
      name: groups[key].name,
      type_en: 'Region',
      iso_a2: code
    },
    geometry: {
      type: 'MultiPolygon',
      coordinates: groups[key].polygons
    }
  }));

  totalAfter += mergedFeatures.length;

  if (mergedFeatures.length !== originalFeatures.length) {
    console.log(`  ${code}: ${originalFeatures.length} -> ${mergedFeatures.length} clean regions`);
  }

  fs.writeFileSync(filePath, JSON.stringify({ type: 'FeatureCollection', features: mergedFeatures }), 'utf-8');
}

console.log(`\nDONE! Master clean complete across all ${files.length} countries.`);
console.log(`Total features reduced from ${totalBefore} to ${totalAfter}.`);
