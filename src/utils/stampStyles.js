// stampStyles.js - Airbnb Tarzı Ülkeye Özel Pasaport Mühürleri & Mimari Simgeler
// Havaalanı ve PASSED yazıları kaldırılmış, ülkenin ikonik tarihi/mimari simgesiyle donatılmıştır.

export const STAMP_SHAPES = {
  ARCH_TEMPLE: 'arch_temple',         // Klasik kemerli tapınak silüeti (Atina / Airbnb tarzı)
  HEX_POINTED: 'hex_pointed',         // Sivri uçlu altıgen rozet (Alanya / Airbnb tarzı)
  OCTAGON_SEAL: 'octagon_seal',       // 8 köşeli geometrik mühür
  SCALLOPED_CIRCLE: 'scalloped_circle', // Dalgalı / tırtıklı yuvarlak mühür
  DIAMOND_BADGE: 'diamond_badge',     // Baklava / elmas rozet
  PILL_STADIUM: 'pill_stadium',       // Yuvarlatılmış stadyum kapsülü
  SHIELD_CREST: 'shield_crest',       // Hanedan arması / kalkan
  NOTCHED_RECT: 'notched_rect'        // Köşeleri oyulmuş klasik dikdörtgen
};

export const STAMP_INKS = {
  NAVY: '#1e3a8a',        // Prusya / Koyu Lacivert (Avrupa)
  CRIMSON: '#dc2626',     // İmparatorluk Kırmızısı (Japonya, Asya)
  TURKISH_RED: '#b91c1c', // Koyu Bayrak Kırmızısı (Türkiye)
  EMERALD: '#047857',     // Zümrüt Yeşili (Orta Doğu, İskandinavya)
  VIOLET: '#6d28d9',      // Kraliyet Moru (Birleşik Krallık, Monako)
  COBALT: '#1d4ed8',      // Okyanus Kobaltı (Kuzey Amerika, Okyanusya)
  TERRACOTTA: '#c2410c',  // Pişmiş Toprak / Pas Turuncusu (Latin Amerika)
  TEAL: '#0e7490',        // Derin Petrol Yeşili (Afrika, Karayipler)
  BURGUNDY: '#831843'     // Şarap Kırmızısı (Balkanlar, Kafkaslar)
};

// ─── İkonik Ülke Mimari / Kültürel Simgeleri (Vektörel Çizgi Çizimleri) ─────────
export const LANDMARK_SVGS = {
  // Türkiye: Anıtkabir (Sütunlu Anıt & Merdivenli Kaide)
  TR: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 38h68M10 34h60M14 30h52" />
    <path d="M16 16v14M24 16v14M32 16v14M40 16v14M48 16v14M56 16v14M64 16v14" stroke-width="2.2" />
    <path d="M12 16h56v-4H12z" fill="currentColor" fill-opacity="0.15" />
    <path d="M14 12l26-6 26 6" />
    <circle cx="40" cy="9" r="1.5" fill="currentColor" />
  </svg>`,

  // Yunanistan: Parthenon / Akropolis (Antik Kemerli Sütunlu Tapınak)
  GR: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 38h64M12 34h56M15 30h50" />
    <path d="M18 16v14M27 16v14M36 16v14M44 16v14M53 16v14M62 16v14" stroke-width="2" />
    <path d="M14 16h52" />
    <path d="M14 16L40 6l26 10H14z" fill="currentColor" fill-opacity="0.15" />
    <circle cx="40" cy="11" r="2" />
  </svg>`,

  // Fransa: Eyfel Kulesi
  FR: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M30 40c0-6 4-9 10-9s10 3 10 9M26 40l10-34h8l10 34" />
    <path d="M33 26h14M35 15h10M39 6v-4h2v4" />
    <circle cx="40" cy="2" r="1" fill="currentColor" />
  </svg>`,

  // İtalya: Kolezyum (Roma Kemeri)
  IT: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 38h60" />
    <path d="M12 38V18c0-4 12-8 28-8s28 4 28 8v20" />
    <path d="M18 24a4 4 0 0 1 8 0v4h-8zM31 24a4 4 0 0 1 8 0v4h-8zM44 24a4 4 0 0 1 8 0v4h-8z" />
    <path d="M18 34h44M12 28h56M14 20h52" />
  </svg>`,

  // İngiltere / UK: Big Ben (Elizabeth Kulesi)
  GB: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M34 40V12l6-8 6 8v28" />
    <circle cx="40" cy="18" r="4" />
    <path d="M40 16v2h1.5" stroke-width="1.4" />
    <path d="M32 40h16M36 28h8M36 34h8" />
    <path d="M38 4h4" />
  </svg>`,

  // Amerika: Özgürlük Heykeli Meşalesi & Taç
  US: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M34 40l4-18h4l4 18M36 22h8" />
    <circle cx="40" cy="14" r="5" fill="currentColor" fill-opacity="0.2" />
    <path d="M33 11l-3-4M36 9l-1-5M40 8V2M44 9l1-5M47 11l3-4" />
    <path d="M48 20l4-12 3 2-3 10" fill="currentColor" fill-opacity="0.3" />
    <path d="M54 7c0-2 2-3 2-3s1 2 0 3z" fill="currentColor" />
  </svg>`,

  // Japonya: Torii Kapısı & Doğan Güneş
  JP: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="40" cy="18" r="9" fill="currentColor" fill-opacity="0.2" stroke-dasharray="2 2" />
    <path d="M18 10c14-2 30-2 44 0M22 15h36" stroke-width="2.2" />
    <path d="M28 15v23M52 15v23" stroke-width="2.5" />
    <path d="M26 38h6M50 38h6" />
    <path d="M35 15h10v6H35z" />
  </svg>`,

  // Almanya: Brandenburg Kapısı
  DE: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 38h56M16 16h48v-4H16z" />
    <path d="M20 16v22M28 16v22M36 16v22M44 16v22M52 16v22M60 16v22" stroke-width="2" />
    <path d="M36 8l4-4 4 4v4h-8z" fill="currentColor" fill-opacity="0.25" />
  </svg>`,

  // Hollanda: Tarihi Yel Değirmeni
  NL: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M32 40l3-20h10l3 20z" fill="currentColor" fill-opacity="0.15" />
    <circle cx="40" cy="18" r="3" fill="currentColor" />
    <path d="M40 18L24 6M40 18L56 30M40 18L56 6M40 18L24 30" stroke-width="2.2" />
    <path d="M22 4l4 4M58 4l-4 4M22 32l4-4M58 32l-4-4" />
  </svg>`,

  // İspanya: Sagrada Familia Kuleleri
  ES: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 40V14l4-6 4 6v26M34 40V8l6-6 6 6v32M50 40V14l4-6 4 6v26" />
    <circle cx="26" cy="7" r="1.2" fill="currentColor" />
    <circle cx="40" cy="2" r="1.5" fill="currentColor" />
    <circle cx="54" cy="7" r="1.2" fill="currentColor" />
    <path d="M24 22h4M36 16h8M36 24h8M52 22h4" />
  </svg>`,

  // Mısır: Gize Piramitleri & Sfenks
  EG: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 38L32 10l24 28H8z" fill="currentColor" fill-opacity="0.15" />
    <path d="M32 10l8 28M38 20l28 18H52" />
    <circle cx="24" cy="12" r="4" stroke-dasharray="2 2" />
  </svg>`,

  // BAE / Dubai: Burj Khalifa / Burj Al Arab
  AE: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M37 40V10l3-8 3 8v30" />
    <path d="M34 40V18l3-4M46 40V18l-3-4" />
    <path d="M31 40V26l3-3M49 40V26l-3-3" />
    <path d="M26 40h28" />
  </svg>`,

  // Suudi Arabistan: Hurma Ağacı & Hilal
  SA: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M38 40c0-10 2-18 2-18s2 8 2 18" stroke-width="2.5" />
    <path d="M40 22c-6-6-16-4-18-2 6 4 14 2 18 2zM40 22c6-6 16-4 18-2-6 4-14 2-18 2z" fill="currentColor" fill-opacity="0.25" />
    <path d="M40 22c-4-10-12-12-14-11 3 6 10 9 14 11zM40 22c4-10 12-12 14-11-3 6-10 9-14 11z" fill="currentColor" fill-opacity="0.25" />
  </svg>`,

  // Rusya: Aziz Vasil Soğan Kubbeleri
  RU: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 40h48" />
    <path d="M36 20c0-6 4-12 4-12s4 6 4 12v20h-8z" fill="currentColor" fill-opacity="0.2" />
    <path d="M24 26c0-4 3-8 3-8s3 4 3 8v14h-6zM50 26c0-4 3-8 3-8s3 4 3 8v14h-6z" fill="currentColor" fill-opacity="0.2" />
    <path d="M40 8V4M27 18v-3M53 18v-3" />
  </svg>`,

  // İsviçre: Matterhorn Zirvesi & İsviçre Haçı
  CH: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 38L38 8l10 8 18 22H12z" fill="currentColor" fill-opacity="0.15" />
    <path d="M38 8l-6 12 10 6-4 12" />
    <path d="M52 14h6v-6h4v6h6v4h-6v6h-4v-6h-6z" fill="currentColor" stroke="none" />
  </svg>`,

  // Avusturya: Alp Zirveleri & Viyana Katedrali
  AT: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 38L32 16l14 14 20-20 8 28H14z" fill="currentColor" fill-opacity="0.15" />
    <path d="M42 38V12l4-8 4 8v26" stroke-width="2" />
    <circle cx="46" cy="4" r="1" fill="currentColor" />
  </svg>`,

  // Azerbaycan: Kız Kalesi (Qız Qalası) & Alev Kuleleri
  AZ: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M24 40V16c0-3 6-5 12-5v29M36 20h8v20" />
    <path d="M48 40c0-8 6-16 10-22 2 8 0 16-2 22" fill="currentColor" fill-opacity="0.2" />
    <circle cx="30" cy="8" r="3" stroke-dasharray="1 1" />
  </svg>`,

  // Gürcistan: Gergeti Teslis Kilisesi (Kafkaslar)
  GE: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 38L30 18l14 10 24-16 8 26H10z" fill="currentColor" fill-opacity="0.15" />
    <path d="M34 38V22l6-6 6 6v16" stroke-width="2" />
    <path d="M40 16v-4" />
  </svg>`,

  // Çin: Çin Seddi Burcu & Surlar
  CN: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 32l16-6v-6h10v6l18-4v-8h10v8l10-2" />
    <path d="M26 20h10v18H26zM54 14h10v24H54z" fill="currentColor" fill-opacity="0.2" />
    <path d="M29 24h4v6h-4zM57 18h4v6h-4z" />
  </svg>`,

  // Hindistan: Tac Mahal
  IN: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 38h56M16 16v22M64 16v22" />
    <path d="M32 38V22c0-8 8-14 8-14s8 6 8 14v16H32z" fill="currentColor" fill-opacity="0.15" />
    <path d="M36 28a4 4 0 0 1 8 0v10h-8z" />
    <path d="M40 8V3M16 16l-1-4M64 16l1-4" />
  </svg>`,

  // Brezilya: Kurtarıcı İsa Heykeli (Corcovado)
  BR: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M26 40c4-12 10-18 14-20 4 2 10 8 14 20" />
    <path d="M20 16h40M38 12v12M42 12v12" stroke-width="2.5" />
    <circle cx="40" cy="9" r="3" fill="currentColor" />
  </svg>`,

  // Avustralya: Sidney Opera Binası Yelkenleri
  AU: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 38h52" />
    <path d="M18 38c2-12 12-22 22-22-2 10-6 22-22 22z" fill="currentColor" fill-opacity="0.2" />
    <path d="M34 38c2-10 10-18 18-18-2 8-5 18-18 18z" fill="currentColor" fill-opacity="0.2" />
    <path d="M48 38c2-7 7-12 14-12-1 6-4 12-14 12z" fill="currentColor" fill-opacity="0.2" />
  </svg>`,

  // Güney Kore: Sungnyemun / Namdaemun Saray Kapısı
  KR: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 38h52M20 38V22h40v16" />
    <path d="M12 22c16-4 40-4 56 0M16 14c14-4 34-4 48 0" stroke-width="2" />
    <path d="M34 38v-8a6 6 0 0 1 12 0v8" fill="currentColor" fill-opacity="0.15" />
  </svg>`,

  // Tayland: Wat Arun Pagoda Spire
  TH: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M24 38h32M28 34h24M32 26h16M36 16h8" />
    <path d="M40 4v34M38 12l2-8 2 8" stroke-width="2" />
    <circle cx="40" cy="3" r="1.5" fill="currentColor" />
  </svg>`,

  // Kanada: Akçaağaç Yaprağı & CN Kulesi
  CA: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M24 40l3-28 2-6 2 6 3 28M26 22h6" />
    <circle cx="46" cy="20" r="12" fill="currentColor" fill-opacity="0.1" stroke-dasharray="2 2" />
    <path d="M46 32v-6l-3 2 1-5-4 1 3-3-4-2 4-1-1-4 3 2 2-4 2 4 3-2-1 4 4 1-4 2 3 3-4-1 1 5-3-2z" fill="currentColor" />
  </svg>`,

  // Meksika: Chichen Itza Basamaklı Piramidi
  MX: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 38h60M16 34h48M22 28h36M28 22h24M34 16h12" />
    <path d="M36 16V10h8v6" fill="currentColor" fill-opacity="0.2" />
    <path d="M38 38V16h4v22" stroke-width="2.2" />
  </svg>`,

  // Dünya / Genel Varsayılan: Pusula Gülü & Ufuk Çizgisi
  DEFAULT: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="40" cy="22" r="16" stroke-dasharray="3 2" />
    <path d="M40 6v32M24 22h32" stroke-width="1.2" />
    <path d="M40 10l3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9z" fill="currentColor" fill-opacity="0.2" />
    <circle cx="40" cy="22" r="2.5" fill="currentColor" />
  </svg>`
};

// Ülke konfigürasyon tablosu (Özel şekil, renk ve simge eşleştirmeleri)
const COUNTRY_CUSTOM_STAMPS = {
  'TR': { shape: STAMP_SHAPES.HEX_POINTED, ink: STAMP_INKS.TURKISH_RED, label: 'TÜRKİYE', landmark: 'TR' },
  'GR': { shape: STAMP_SHAPES.ARCH_TEMPLE, ink: STAMP_INKS.NAVY, label: 'HELLAS', landmark: 'GR' },
  'FR': { shape: STAMP_SHAPES.ARCH_TEMPLE, ink: STAMP_INKS.NAVY, label: 'FRANCE', landmark: 'FR' },
  'DE': { shape: STAMP_SHAPES.NOTCHED_RECT, ink: STAMP_INKS.NAVY, label: 'DEUTSCHLAND', landmark: 'DE' },
  'IT': { shape: STAMP_SHAPES.ARCH_TEMPLE, ink: STAMP_INKS.BURGUNDY, label: 'ITALIA', landmark: 'IT' },
  'ES': { shape: STAMP_SHAPES.SCALLOPED_CIRCLE, ink: STAMP_INKS.TERRACOTTA, label: 'ESPAÑA', landmark: 'ES' },
  'NL': { shape: STAMP_SHAPES.OCTAGON_SEAL, ink: STAMP_INKS.COBALT, label: 'NEDERLAND', landmark: 'NL' },
  'GB': { shape: STAMP_SHAPES.SHIELD_CREST, ink: STAMP_INKS.VIOLET, label: 'UNITED KINGDOM', landmark: 'GB' },
  'US': { shape: STAMP_SHAPES.HEX_POINTED, ink: STAMP_INKS.COBALT, label: 'UNITED STATES', landmark: 'US' },
  'JP': { shape: STAMP_SHAPES.PILL_STADIUM, ink: STAMP_INKS.CRIMSON, label: 'JAPAN', landmark: 'JP' },
  'KR': { shape: STAMP_SHAPES.PILL_STADIUM, ink: STAMP_INKS.COBALT, label: 'KOREA', landmark: 'KR' },
  'AE': { shape: STAMP_SHAPES.OCTAGON_SEAL, ink: STAMP_INKS.EMERALD, label: 'U.A.E.', landmark: 'AE' },
  'SA': { shape: STAMP_SHAPES.OCTAGON_SEAL, ink: STAMP_INKS.EMERALD, label: 'K.S.A.', landmark: 'SA' },
  'EG': { shape: STAMP_SHAPES.DIAMOND_BADGE, ink: STAMP_INKS.TERRACOTTA, label: 'EGYPT', landmark: 'EG' },
  'RU': { shape: STAMP_SHAPES.NOTCHED_RECT, ink: STAMP_INKS.CRIMSON, label: 'RUSSIA', landmark: 'RU' },
  'CH': { shape: STAMP_SHAPES.SHIELD_CREST, ink: STAMP_INKS.TURKISH_RED, label: 'SCHWEIZ', landmark: 'CH' },
  'AT': { shape: STAMP_SHAPES.NOTCHED_RECT, ink: STAMP_INKS.NAVY, label: 'ÖSTERREICH', landmark: 'AT' },
  'AZ': { shape: STAMP_SHAPES.HEX_POINTED, ink: STAMP_INKS.TURKISH_RED, label: 'AZƏRBAYCAN', landmark: 'AZ' },
  'GE': { shape: STAMP_SHAPES.ARCH_TEMPLE, ink: STAMP_INKS.BURGUNDY, label: 'GEORGIA', landmark: 'GE' },
  'CN': { shape: STAMP_SHAPES.NOTCHED_RECT, ink: STAMP_INKS.CRIMSON, label: 'CHINA', landmark: 'CN' },
  'IN': { shape: STAMP_SHAPES.ARCH_TEMPLE, ink: STAMP_INKS.TERRACOTTA, label: 'INDIA', landmark: 'IN' },
  'BR': { shape: STAMP_SHAPES.SCALLOPED_CIRCLE, ink: STAMP_INKS.EMERALD, label: 'BRASIL', landmark: 'BR' },
  'AU': { shape: STAMP_SHAPES.HEX_POINTED, ink: STAMP_INKS.TEAL, label: 'AUSTRALIA', landmark: 'AU' },
  'CA': { shape: STAMP_SHAPES.SHIELD_CREST, ink: STAMP_INKS.TURKISH_RED, label: 'CANADA', landmark: 'CA' },
  'MX': { shape: STAMP_SHAPES.DIAMOND_BADGE, ink: STAMP_INKS.TERRACOTTA, label: 'MÉXICO', landmark: 'MX' },
  'TH': { shape: STAMP_SHAPES.ARCH_TEMPLE, ink: STAMP_INKS.TERRACOTTA, label: 'THAILAND', landmark: 'TH' }
};

/**
 * Ülke koduna ve dizin indeksine göre zengin, özgün Airbnb tarzı damga özellikleri döndürür.
 */
export function getCountryStampStyle(countryCode, index = 0) {
  const code = String(countryCode || '').toUpperCase();
  const custom = COUNTRY_CUSTOM_STAMPS[code];

  if (custom) {
    const rot = (((index * 13) % 7) - 3) * 1.3;
    const svg = LANDMARK_SVGS[custom.landmark] || LANDMARK_SVGS.DEFAULT;
    return {
      shape: custom.shape,
      ink: custom.ink,
      label: custom.label,
      landmarkSvg: svg,
      rotation: rot
    };
  }

  // Varsayılan dinamik kural motoru (bölge ve hash tabanlı)
  const shapes = Object.values(STAMP_SHAPES);
  const inks = Object.values(STAMP_INKS);
  
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = (hash * 31 + code.charCodeAt(i)) & 0xffffffff;
  }
  hash = Math.abs(hash + index * 7);

  const selectedShape = shapes[hash % shapes.length];
  const selectedInk = inks[(hash >> 2) % inks.length];
  const rot = ((hash % 9) - 4) * 1.1;
  const svg = LANDMARK_SVGS[code] || LANDMARK_SVGS.DEFAULT;

  return {
    shape: selectedShape,
    ink: selectedInk,
    label: code,
    landmarkSvg: svg,
    rotation: rot
  };
}
