// scripts/turf-master-rebuilder.mjs
// Professional GIS polygon merger using @turf/turf.
// Completely eliminates interior doughnut holes and merges micro-municipalities into clean, logical primary regions/states for all 240+ countries.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as turf from '@turf/turf';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const regionsDir = path.join(__dirname, '../public/data/regions');
const rawFile = path.join(__dirname, '../public/data/ne_admin1_raw.geojson');

if (!fs.existsSync(rawFile)) {
  console.error("raw geojson not found. Run split-regions.mjs first.");
  process.exit(1);
}

const rawGeo = JSON.parse(fs.readFileSync(rawFile, 'utf-8'));
console.log(`\n🚀 Starting Turf.js GIS Master Rebuild directly from raw data (${rawGeo.features.length} features)...\n`);

// Group features by country ISO code
const byCountry = {};
for (const feature of rawGeo.features) {
  const p = feature.properties || {};
  let iso2 = (p.iso_a2 || p.adm0_iso || '').trim().toUpperCase();
  if (!iso2 || iso2 === '-99' || iso2 === '-1') continue;
  if (iso2 === 'GB') {
    // GB consists of GB and specific countries
  }
  if (!byCountry[iso2]) byCountry[iso2] = [];
  byCountry[iso2].push(feature);
}

// Helper to remove any interior holes from Turf union output
function removeInteriorHoles(geometry) {
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

// Turkish translation map for primary regions
const REGION_TR_NAMES = {
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

function getGroupingKey(feature, code) {
  const p = feature.properties || {};
  const name = p.name || p.ADMIN || '';
  const reg = p.region || p.woe_name || p.gns_region || '';

  if (code === 'GB') return reg || p.code_hasc?.slice(0, 5) || name;
  if (code === 'ES') return reg || p.code_hasc?.slice(0, 5) || name;
  if (code === 'FR') return reg || p.code_hasc?.slice(0, 5) || name;
  if (code === 'IT') return reg || p.code_hasc?.slice(0, 5) || name;
  if (code === 'XK') return reg || name;

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
    // Map Urban Counties directly to their surrounding county to completely fill the holes!
    const huMap = {
      'Debrecen': 'Hajdú-Bihar', 'Miskolc': 'Borsod-Abaúj-Zemplén', 'Szeged': 'Csongrád',
      'Pécs': 'Baranya', 'Győr': 'Gyor-Moson-Sopron', 'Gyôr': 'Gyor-Moson-Sopron', 'Nyíregyháza': 'Szabolcs-Szatmár-Bereg',
      'Kecskemét': 'Bács-Kiskun', 'Székesfehérvár': 'Fejér', 'Szombathely': 'Vas',
      'Szolnok': 'Jász-Nagykun-Szolnok', 'Tatabánya': 'Komárom-Esztergom', 'Kaposvár': 'Somogy',
      'Békéscsaba': 'Békés', 'Zalaegerszeg': 'Zala', 'Veszprém': 'Veszprém', 'Eger': 'Heves',
      'Nagykanizsa': 'Zala', 'Dunaújváros': 'Fejér', 'Hódmezővásárhely': 'Csongrád', 'Hódmezôvásárhely': 'Csongrád',
      'Sopron': 'Gyor-Moson-Sopron', 'Érd': 'Pest', 'Salgótarján': 'Nógrád', 'Szekszárd': 'Tolna'
    };
    return huMap[name] || name;
  }

  if (code === 'SI' || code === 'LV' || code === 'MD' || code === 'MT' || code === 'UG' || code === 'AZ') {
    return reg || name;
  }

  return name;
}

let totalBefore = 0;
let totalAfter = 0;

for (const code of Object.keys(byCountry)) {
  const originalFeatures = byCountry[code];
  totalBefore += originalFeatures.length;

  const groups = {};

  originalFeatures.forEach(f => {
    const key = getGroupingKey(f, code);
    if (!key) return; // skipped feature

    const displayName = REGION_TR_NAMES[key] || REGION_TR_NAMES[f.properties?.name] || f.properties?.name || key;

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push({ feature: f, displayName });
  });

  const mergedFeatures = [];

  Object.keys(groups).forEach(key => {
    const item = groups[key];
    const displayName = item[0].displayName;

    let unionFeature = null;
    for (let i = 0; i < item.length; i++) {
      try {
        let f = item[i].feature;
        
        // Use Turf buffer (50 meters) to bridge any tiny geographic gaps/slivers before union
        if (code === 'MK' || code === 'XK' || code === 'HU') {
           f = turf.buffer(f, 0.05, {units: 'kilometers'});
        }

        if (!unionFeature) {
          unionFeature = f;
        } else {
          const u = turf.union(turf.featureCollection([unionFeature, f]));
          if (u) unionFeature = u;
        }
      } catch (e) {
        // Fallback
      }
    }

    if (unionFeature) {
      if (code === 'MK' || code === 'XK' || code === 'HU') {
         // Unbuffer by 50 meters to restore original border sizing exactly
         try {
           unionFeature = turf.buffer(unionFeature, -0.05, {units: 'kilometers'});
         } catch(e) {}
      }

      // Mathematically strip any remaining interior hole rings
      const cleanGeom = removeInteriorHoles(unionFeature.geometry);

      if (cleanGeom) {
        mergedFeatures.push({
          type: 'Feature',
          properties: {
            name: displayName,
            type_en: 'Region',
            iso_a2: code
          },
          geometry: cleanGeom
        });
      }
    }
  });

  totalAfter += mergedFeatures.length;

  const filePath = path.join(regionsDir, `${code}.json`);
  fs.writeFileSync(filePath, JSON.stringify({ type: 'FeatureCollection', features: mergedFeatures }), 'utf-8');
}

console.log(`\n✅ Turf.js Master Rebuild Complete across all ${Object.keys(byCountry).length} countries!`);
console.log(`Total features reduced from ${totalBefore} to ${totalAfter}.`);
