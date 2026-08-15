// scripts/clean-regions.mjs
// Cleans region GeoJSON files to eliminate duplicate urban county holes, tiny sub-communes, and over-fragmented districts.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const regionsDir = path.join(__dirname, '../public/data/regions');

const files = fs.readdirSync(regionsDir).filter(f => f.endsWith('.json') && !f.startsWith('_'));
console.log(`Cleaning ${files.length} country region files...`);

let totalOriginal = 0;
let totalCleaned = 0;

for (const file of files) {
  const countryCode = file.replace('.json', '');
  const filePath = path.join(regionsDir, file);
  const geojson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const originalCount = geojson.features.length;
  totalOriginal += originalCount;

  let filteredFeatures = geojson.features;

  if (countryCode === 'HU') {
    // Hungary: Keep 19 Counties + Budapest (remove 23 Urban county holes)
    filteredFeatures = geojson.features.filter(f => f.properties?.type_en !== 'Urban county');
  } else if (countryCode === 'SI') {
    // Slovenia: Keep 12 Statistical Regions (remove 181 tiny communes)
    const stats = geojson.features.filter(f => f.properties?.type_en === 'Statistical Region');
    if (stats.length > 0) filteredFeatures = stats;
  } else if (countryCode === 'GB') {
    // UK: Remove London Borough sub-districts (keep London as region + Administrative Counties)
    filteredFeatures = geojson.features.filter(f => {
      const t = f.properties?.type_en || '';
      return !t.startsWith('London Borough') && t !== 'City Corporation';
    });
  } else if (countryCode === 'PH') {
    // Philippines: Keep Provinces (remove 35 Highly Urbanized City holes)
    filteredFeatures = geojson.features.filter(f => f.properties?.type_en === 'Province');
  } else {
    // Generic Rule: If country has both 'County' / 'Province' / 'State' AND 'Urban county' / 'Urban district' holes, filter out the urban enclave holes
    const types = new Set(geojson.features.map(f => f.properties?.type_en || ''));
    if ((types.has('County') || types.has('Province')) && types.has('Urban county')) {
      filteredFeatures = geojson.features.filter(f => f.properties?.type_en !== 'Urban county');
    }
  }

  totalCleaned += filteredFeatures.length;

  if (filteredFeatures.length !== originalCount) {
    console.log(`  ${countryCode}: ${originalCount} -> ${filteredFeatures.length} clean regions`);
    const newGeoJSON = { type: 'FeatureCollection', features: filteredFeatures };
    fs.writeFileSync(filePath, JSON.stringify(newGeoJSON), 'utf-8');
  }
}

console.log(`\nDone! Total features reduced from ${totalOriginal} to ${totalCleaned}`);
