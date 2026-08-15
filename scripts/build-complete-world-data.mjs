import fs from 'fs';

const SPECIAL_ISO_MAP = {
  France: 'FR',
  Norway: 'NO',
  Kosovo: 'XK',
  'Northern Cyprus': 'XN',
  Somaliland: 'XS',
  'Western Sahara': 'EH',
  Taiwan: 'TW',
  'South Sudan': 'SS'
};

const CONTINENT_MAP = {
  // Europe
  AL: 'europe', AD: 'europe', AT: 'europe', BY: 'europe', BE: 'europe', BA: 'europe', BG: 'europe',
  HR: 'europe', CY: 'europe', CZ: 'europe', DK: 'europe', EE: 'europe', FI: 'europe', FR: 'europe',
  DE: 'europe', GR: 'europe', HU: 'europe', IS: 'europe', IE: 'europe', IT: 'europe', XK: 'europe',
  LV: 'europe', LI: 'europe', LT: 'europe', LU: 'europe', MT: 'europe', MD: 'europe', MC: 'europe',
  ME: 'europe', NL: 'europe', MK: 'europe', NO: 'europe', PL: 'europe', PT: 'europe', RO: 'europe',
  RU: 'europe', SM: 'europe', RS: 'europe', SK: 'europe', SI: 'europe', ES: 'europe', SE: 'europe',
  CH: 'europe', UA: 'europe', GB: 'europe', VA: 'europe', TR: 'europe', GG: 'europe', JE: 'europe',
  IM: 'europe', FO: 'europe', AX: 'europe', GI: 'europe', SJ: 'europe',

  // Asia
  AF: 'asia', AM: 'asia', AZ: 'asia', BH: 'asia', BD: 'asia', BT: 'asia', BN: 'asia',
  KH: 'asia', CN: 'asia', GE: 'asia', IN: 'asia', ID: 'asia', IR: 'asia', IQ: 'asia',
  IL: 'asia', JP: 'asia', JO: 'asia', KZ: 'asia', KW: 'asia', KG: 'asia', LA: 'asia',
  LB: 'asia', MY: 'asia', MV: 'asia', MN: 'asia', MM: 'asia', NP: 'asia', KP: 'asia',
  OM: 'asia', PK: 'asia', PS: 'asia', PH: 'asia', QA: 'asia', SA: 'asia', SG: 'asia',
  KR: 'asia', LK: 'asia', SY: 'asia', TW: 'asia', TJ: 'asia', TH: 'asia', TL: 'asia',
  TM: 'asia', AE: 'asia', UZ: 'asia', VN: 'asia', YE: 'asia', HK: 'asia', MO: 'asia',
  XN: 'asia',

  // Africa
  DZ: 'africa', AO: 'africa', BJ: 'africa', BW: 'africa', BF: 'africa', BI: 'africa',
  CV: 'africa', CM: 'africa', CF: 'africa', TD: 'africa', KM: 'africa', CG: 'africa',
  CD: 'africa', CI: 'africa', DJ: 'africa', EG: 'africa', GQ: 'africa', ER: 'africa',
  SZ: 'africa', ET: 'africa', GA: 'africa', GM: 'africa', GH: 'africa', GN: 'africa',
  GW: 'africa', KE: 'africa', LS: 'africa', LR: 'africa', LY: 'africa', MG: 'africa',
  MW: 'africa', ML: 'africa', MR: 'africa', MU: 'africa', MA: 'africa', MZ: 'africa',
  NA: 'africa', NE: 'africa', NG: 'africa', RW: 'africa', ST: 'africa', SN: 'africa',
  SC: 'africa', SL: 'africa', SO: 'africa', ZA: 'africa', SS: 'africa', SD: 'africa',
  TZ: 'africa', TG: 'africa', TN: 'africa', UG: 'africa', ZM: 'africa', ZW: 'africa',
  XS: 'africa', RE: 'africa', YT: 'africa', SH: 'africa', EH: 'africa',

  // North America
  AG: 'north_america', BS: 'north_america', BB: 'north_america', BZ: 'north_america',
  CA: 'north_america', CR: 'north_america', CU: 'north_america', DM: 'north_america',
  DO: 'north_america', SV: 'north_america', GD: 'north_america', GT: 'north_america',
  HT: 'north_america', HN: 'north_america', JM: 'north_america', MX: 'north_america',
  NI: 'north_america', PA: 'north_america', KN: 'north_america', LC: 'north_america',
  VC: 'north_america', TT: 'north_america', US: 'north_america', GL: 'north_america',
  PR: 'north_america', BM: 'north_america', KY: 'north_america', AW: 'north_america',
  CW: 'north_america', SX: 'north_america', TC: 'north_america', VG: 'north_america',
  VI: 'north_america', AI: 'north_america', MS: 'north_america', BL: 'north_america',
  MF: 'north_america', PM: 'north_america',

  // South America
  AR: 'south_america', BO: 'south_america', BR: 'south_america', CL: 'south_america',
  CO: 'south_america', EC: 'south_america', GY: 'south_america', PY: 'south_america',
  PE: 'south_america', SR: 'south_america', UY: 'south_america', VE: 'south_america',
  GF: 'south_america', FK: 'south_america',

  // Oceania
  AU: 'oceania', FJ: 'oceania', KI: 'oceania', MH: 'oceania', FM: 'oceania',
  NR: 'oceania', NZ: 'oceania', PW: 'oceania', PG: 'oceania', WS: 'oceania',
  SB: 'oceania', TO: 'oceania', TV: 'oceania', VU: 'oceania', NC: 'oceania',
  PF: 'oceania', GU: 'oceania', MP: 'oceania', AS: 'oceania', CK: 'oceania',
  NU: 'oceania', TK: 'oceania', WF: 'oceania'
};

const TR_NAMES = {
  TR: 'Türkiye', DE: 'Almanya', FR: 'Fransa', IT: 'İtalya', ES: 'İspanya', GB: 'Birleşik Krallık',
  US: 'Amerika Birleşik Devletleri', NL: 'Hollanda', GR: 'Yunanistan', AT: 'Avusturya', CH: 'İsviçre',
  JP: 'Japonya', AE: 'Birleşik Arap Emirlikleri', RU: 'Rusya', PT: 'Portekiz', BE: 'Belçika',
  SE: 'İsveç', NO: 'Norveç', FI: 'Finlandiya', DK: 'Danimarka', PL: 'Polonya', CZ: 'Çekya',
  HU: 'Macaristan', RO: 'Romanya', BG: 'Bulgaristan', HR: 'Hırvatistan', RS: 'Sırbistan',
  BA: 'Bosna-Hersek', ME: 'Karadağ', AL: 'Arnavutluk', MK: 'Kuzey Makedonya', XK: 'Kosova',
  SI: 'Slovenya', SK: 'Slovakya', IE: 'İrlanda', IS: 'İzlanda', CY: 'Kıbrıs', MT: 'Malta',
  LU: 'Lüksemburg', GE: 'Gürcistan', AM: 'Ermenistan', AZ: 'Azerbaycan', IR: 'İran',
  IQ: 'Irak', SY: 'Suriye', LB: 'Lübnan', JO: 'Ürdün', IL: 'İsrail', SA: 'Suudi Arabistan',
  QA: 'Katar', KW: 'Kuveyt', OM: 'Umman', YE: 'Yemen', EG: 'Mısır', MA: 'Fas', DZ: 'Cezayir',
  TN: 'Tunus', LY: 'Libya', ZA: 'Güney Afrika', KE: 'Kenya', TZ: 'Tanzanya', ET: 'Etiyopya',
  NG: 'Nijerya', GH: 'Gana', SN: 'Senegal', CN: 'Çin', IN: 'Hindistan', KR: 'Güney Kore',
  KP: 'Kuzey Kore', TH: 'Tayland', VN: 'Vietnam', ID: 'Endonezya', MY: 'Malezya', SG: 'Singapur',
  PH: 'Filipinler', PK: 'Pakistan', BD: 'Bangladeş', KZ: 'Kazakistan', UZ: 'Özbekistan',
  TM: 'Türkmenistan', KG: 'Kırgızistan', TJ: 'Tacikistan', MN: 'Moğolistan', CA: 'Kanada',
  MX: 'Meksika', BR: 'Brezilya', AR: 'Arjantin', CL: 'Şili', CO: 'Kolombiya', PE: 'Peru',
  EC: 'Ekvador', UY: 'Uruguay', PY: 'Paraguay', BO: 'Bolivya', VE: 'Venezuela', CU: 'Küba',
  DO: 'Dominik Cumhuriyeti', CR: 'Kosta Rika', PA: 'Panama', AU: 'Avustralya', NZ: 'Yeni Zelanda'
};

function getFlag(iso2) {
  if (!iso2 || iso2.length !== 2) return '🌐';
  if (iso2 === 'XK') return '🇽🇰';
  if (iso2 === 'XN') return '🇨🇾';
  const codePoints = iso2
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const geo = JSON.parse(fs.readFileSync('public/data/world-countries.json', 'utf8'));
const countryMap = new Map();

geo.features.forEach(f => {
  const p = f.properties || {};
  let name = p.name || p.ADMIN || 'Country';
  let iso2 = SPECIAL_ISO_MAP[name] || (p['ISO3166-1-Alpha-2'] || p['ISO_A2'] || '').trim().toUpperCase();
  
  if (iso2 === '-99' || !iso2) {
    if (p['ISO3166-1-Alpha-3'] && p['ISO3166-1-Alpha-3'] !== '-99') iso2 = p['ISO3166-1-Alpha-3'].slice(0, 2);
  }
  if (iso2 && iso2.length === 2 && iso2 !== '-9' && !countryMap.has(iso2)) {
    const continent = CONTINENT_MAP[iso2] || 'europe';
    const trName = TR_NAMES[iso2] || name;
    countryMap.set(iso2, {
      code: iso2,
      name: trName,
      nameEn: name,
      continent,
      flag: getFlag(iso2)
    });
  }
});

const countriesArray = Array.from(countryMap.values());

const outCode = `// worldData.js - Tam Dünya Ülkeleri ve Kıtaları Veri Seti (${countriesArray.length} Ülke)
export const WORLD_CONTINENTS = [
  { id: 'europe', name: 'Avrupa', color: '#6366f1' },
  { id: 'asia', name: 'Asya', color: '#f59e0b' },
  { id: 'africa', name: 'Afrika', color: '#10b981' },
  { id: 'north_america', name: 'Kuzey Amerika', color: '#ef4444' },
  { id: 'south_america', name: 'Güney Amerika', color: '#ec4899' },
  { id: 'oceania', name: 'Okyanusya', color: '#06b6d4' }
];

export const TOTAL_WORLD_COUNTRIES_BENCHMARK = 195;

export const WORLD_COUNTRIES = ${JSON.stringify(countriesArray, null, 2)};
`;

fs.writeFileSync('src/data/worldData.js', outCode, 'utf8');
console.log('Successfully regenerated complete worldData.js with', countriesArray.length, 'countries!');
