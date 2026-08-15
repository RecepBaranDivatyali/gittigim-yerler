// split-regions.mjs
// Natural Earth admin-1 GeoJSON dosyasını ülke başına böler
// Çalıştırma: node scripts/split-regions.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputFile = path.join(__dirname, '../public/data/ne_admin1_raw.geojson');
const outputDir = path.join(__dirname, '../public/data/regions');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Reading raw GeoJSON...');
const raw = fs.readFileSync(inputFile, 'utf-8');
const geojson = JSON.parse(raw);
console.log(`Total features: ${geojson.features.length}`);

// Group features by country ISO code
const byCountry = {};

for (const feature of geojson.features) {
  const props = feature.properties || {};
  // Natural Earth uses iso_a2 for 2-letter country code
  const iso2 = (props.iso_a2 || props.adm0_iso || '').trim().toUpperCase();
  if (!iso2 || iso2 === '-99' || iso2 === '-1') continue;

  if (!byCountry[iso2]) byCountry[iso2] = [];
  byCountry[iso2].push(feature);
}

const countries = Object.keys(byCountry).sort();
console.log(`Unique countries with admin-1 data: ${countries.length}`);

let writtenCount = 0;
for (const iso2 of countries) {
  const features = byCountry[iso2];
  const outGeoJSON = {
    type: 'FeatureCollection',
    features: features
  };
  const outPath = path.join(outputDir, `${iso2}.json`);
  fs.writeFileSync(outPath, JSON.stringify(outGeoJSON), 'utf-8');
  writtenCount++;
  if (writtenCount % 20 === 0) {
    console.log(`  Written ${writtenCount}/${countries.length}...`);
  }
}

// Write an index file listing all available country codes
const indexPath = path.join(outputDir, '_index.json');
fs.writeFileSync(indexPath, JSON.stringify({ countries }), 'utf-8');

console.log(`\nDone! Written ${writtenCount} country files to ${outputDir}`);
console.log(`Index written to ${indexPath}`);

// Print top 10 largest files
const fileSizes = countries.map(c => ({
  code: c,
  size: fs.statSync(path.join(outputDir, `${c}.json`)).size
})).sort((a, b) => b.size - a.size).slice(0, 10);

console.log('\nTop 10 largest region files:');
fileSizes.forEach(f => console.log(`  ${f.code}: ${(f.size / 1024).toFixed(1)} KB`));
