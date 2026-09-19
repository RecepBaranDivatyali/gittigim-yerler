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

  // İngiltere / UK: Big Ben & Elizabeth Tower
  GB: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M34 40V14l6-10 6 10v26" />
    <circle cx="40" cy="20" r="3.5" />
    <path d="M40 18v2l1.5 1" />
    <path d="M30 40h20M36 28h8M36 34h8" />
  </svg>`,

  // ABD: Özgürlük Heykeli Meşalesi & Tacı
  US: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M40 4l-4 6h8z" fill="currentColor" fill-opacity="0.3" />
    <path d="M40 10v18M38 28h4v12h-4zM35 15l5-5 5 5" />
    <path d="M28 22l6-2 3 4M52 22l-6-2-3 4" />
  </svg>`,

  // Japonya: Torii Kapısı & Yükselen Güneş
  JP: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="40" cy="14" r="6" fill="currentColor" fill-opacity="0.18" stroke="none" />
    <path d="M12 12c16-3 40-3 56 0" stroke-width="2.2" />
    <path d="M16 17h48" />
    <path d="M26 12v26M54 12v26" stroke-width="2" />
    <path d="M22 38h8M50 38h8M36 17v5M44 17v5" />
  </svg>`,

  // Almanya: Brandenburg Kapısı & Quadriga
  DE: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 38h52M16 16h48v-3H16z" fill="currentColor" fill-opacity="0.15" />
    <path d="M20 16v22M28 16v22M36 16v22M44 16v22M52 16v22M60 16v22" />
    <path d="M36 13l4-7 4 7" stroke-width="1.5" />
  </svg>`,

  // Hollanda: Tarihi Yel Değirmeni
  NL: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M32 38l4-22h8l4 22z" fill="currentColor" fill-opacity="0.15" />
    <circle cx="40" cy="16" r="2" fill="currentColor" />
    <path d="M40 16L24 8M40 16L56 24M40 16L48 0M40 16L32 32" stroke-width="2" />
  </svg>`,

  // İspanya: Sagrada Familia Kuleleri
  ES: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 38V18l4-12 4 12v20M34 38V14l4-10 4 10v24M46 38V18l4-12 4 12v20" />
    <circle cx="26" cy="6" r="1.5" fill="currentColor" />
    <circle cx="38" cy="4" r="1.5" fill="currentColor" />
    <circle cx="50" cy="6" r="1.5" fill="currentColor" />
    <path d="M24 24h4M36 20h4M48 24h4M20 38h40" />
  </svg>`,

  // Bosna Hersek (BA): Mostar Köprüsü (Stari Most) & Kuleleri
  BA: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 38h52M12 36c10-18 46-18 56 0" stroke-width="2.2" />
    <path d="M12 38V22l6-4 4 2v18M58 38V20l4-2 6 4v16" />
    <path d="M28 25c6-6 18-6 24 0" stroke-dasharray="2 2" />
    <circle cx="40" cy="22" r="1.5" fill="currentColor" />
  </svg>`,

  // Kuzey Makedonya (MK): Üsküp Taşköprüsü (Stone Bridge) & Kalesi
  MK: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 38h64M10 26h60" />
    <path d="M14 26c0 8 10 8 10 0M28 26c0 8 10 8 10 0M42 26c0 8 10 8 10 0M56 26c0 8 10 8 10 0" stroke-width="2" />
    <path d="M36 26v-10h8v10M38 12l2-3 2 3" />
    <path d="M14 34h52" stroke-dasharray="2 2" />
  </svg>`,

  // Arnavutluk (AL): Krujë Kalesi & İskender Bey Çift Başlı Kartal Arması
  AL: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 38h56M16 38V20h12v18M52 38V24h12v14" />
    <path d="M14 20h16M50 24h16" />
    <path d="M34 18c0-5 6-9 6-9s6 4 6 9c0 8-6 13-6 13s-6-5-6-13z" fill="currentColor" fill-opacity="0.15" />
    <path d="M32 14l8 6 8-6M40 10v14" />
  </svg>`,

  // Karadağ (ME): Kotor Körfezi, Sveti Stefan & Venedik Kalesi
  ME: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 22l16-12 18 10 16-14 14 16" stroke-width="1.4" />
    <path d="M14 38c6-2 14-2 20 0s14 2 20 0 12-2 18 0" />
    <path d="M26 36V26h28v10M36 26v-8l4-3 4 3v8" fill="currentColor" fill-opacity="0.15" />
    <path d="M32 30h4M44 30h4" />
  </svg>`,

  // Sırbistan (RS): Belgrad Kalemegdan Kalesi & Pobednik Anıtı
  RS: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 38h56M16 38V24h14v14M50 38V24h14v14M14 24h18M48 24h18" />
    <path d="M38 38V16h4v22M40 16l-3-6 3-2 3 2-3 6z" fill="currentColor" />
  </svg>`,

  // Hırvatistan (HR): Dubrovnik Şehir Surları & Minceta Kulesi
  HR: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 38h60M14 38V26c8-4 18-4 26 0v12M40 26l24 4v8" />
    <path d="M22 24v-8h10v8M20 16h14" />
    <path d="M12 34c12-3 24-3 36 0" stroke-dasharray="2 2" />
  </svg>`,

  // Bulgaristan (BG): Alexander Nevsky Katedrali
  BG: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 38h52M18 38V26h44v12" />
    <path d="M32 26c0-7 8-12 8-12s8 5 8 12M22 26c0-4 4-8 4-8s4 4 4 8M50 26c0-4 4-8 4-8s4 4 4 8" fill="currentColor" fill-opacity="0.15" />
    <path d="M40 14V8M38 10h4" />
  </svg>`,

  // Romanya (RO): Bran Şatosu (Drakula Şatosu)
  RO: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 38l12-8h36l12 8M18 30V18l6-8 6 8v12M44 30V14l6-8 6 8v16" />
    <path d="M30 30V22h14v8" fill="currentColor" fill-opacity="0.15" />
    <circle cx="24" cy="9" r="1" fill="currentColor" />
    <circle cx="50" cy="5" r="1" fill="currentColor" />
  </svg>`,

  // Macaristan (HU): Budapeşte Parlamento Binası
  HU: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 38h64M12 34h56M14 26h52" />
    <path d="M36 26c0-6 4-12 4-12s4 6 4 12" fill="currentColor" fill-opacity="0.2" />
    <path d="M40 14V6M22 26l3-8 3 8M52 26l3-8 3 8" />
    <path d="M16 26v8M28 26v8M40 26v8M52 26v8M64 26v8" />
  </svg>`,

  // Çekya (CZ): Karl Köprüsü Kulesi & Prag Kalesi
  CZ: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 38h56M32 38V18l8-10 8 10v20" />
    <path d="M36 24h8v8h-8z" />
    <path d="M16 38l8-6h8M48 32h8l8 6" />
    <circle cx="40" cy="7" r="1" fill="currentColor" />
  </svg>`,

  // Polonya (PL): Varşova Kraliyet Kalesi & Sigismund Sütunu
  PL: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 38h56M20 38V22h24v16M28 22V14l4-4 4 4v8" />
    <path d="M54 38V12h4v26M56 12l-2-4 2-1 2 1-2 4z" fill="currentColor" />
  </svg>`,

  // Portekiz (PT): Belém Kulesi
  PT: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 38c10-2 20-2 30 0s20 2 30 0M18 36V22h28v14M24 22V12h16v10" />
    <path d="M22 12h20M16 22h32M14 22l-2 4v4h4" />
  </svg>`,

  // Belçika (BE): Atomium Küreleri
  BE: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="40" cy="22" r="4" fill="currentColor" fill-opacity="0.2" />
    <circle cx="22" cy="12" r="3.5" /><circle cx="58" cy="12" r="3.5" />
    <circle cx="22" cy="32" r="3.5" /><circle cx="58" cy="32" r="3.5" />
    <circle cx="40" cy="6" r="3" /><circle cx="40" cy="38" r="3" />
    <path d="M22 12l18 10 18-10M22 32l18-10 18 10M40 6v32" />
  </svg>`,

  // İsveç (SE): Stockholm Belediye Binası (Stadshuset)
  SE: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 38h52M20 38V24h32v14" />
    <path d="M42 24V10l4-4 4 4v14" />
    <circle cx="46" cy="5" r="1.5" fill="currentColor" />
    <path d="M16 38c10-2 20-2 30 0" stroke-dasharray="2 2" />
  </svg>`,

  // Norveç (NO): Fiyort Dağları & Viking Gemisi
  NO: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 28l18-16 14 12 18-18 14 22" stroke-width="1.4" />
    <path d="M12 38c8-2 18-2 28 0s18 2 28 0" />
    <path d="M26 36c4-6 16-6 24 0l4-4M38 34V20l8 6" />
  </svg>`,

  // Danimarka (DK): Nyhavn Renkli Kanal Evleri
  DK: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 38h60M16 38V20l6-6 6 6v18M28 38V16l6-6 6 6v22M40 38V22l6-5 6 5v16" />
    <path d="M12 36c16-2 36-2 56 0" />
  </svg>`,

  // Finlandiya (FI): Helsinki Katedrali
  FI: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 38h56M16 34h48M20 34V22h40v12" />
    <path d="M36 22c0-8 4-14 4-14s4 6 4 14" fill="currentColor" fill-opacity="0.2" />
    <path d="M40 8V3M24 22c0-4 2-7 2-7s2 3 2 7M52 22c0-4 2-7 2-7s2 3 2 7" />
  </svg>`,

  // Avusturya: Aziz Stefan Katedrali & Alp Zirveleri
  AT: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 38h60M18 38V22l14-14 14 14v16" />
    <path d="M46 38V12l6-8 6 8v26" stroke-width="2" />
    <path d="M52 4V1M22 28l5-5 5 5M32 28l5-5 5 5" />
  </svg>`,

  // İsviçre: Matterhorn Zirvesi & Şale
  CH: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 38l26-28 12 10 16-16 12 34" stroke-width="2" />
    <path d="M24 24l8-4 4 6M44 22l6-4 4 6" stroke-dasharray="2 2" />
    <path d="M36 38v-6h8v6M34 32l6-4 6 4" />
  </svg>`,

  // Mısır: Giza Piramitleri & Sfenks
  EG: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 38l28-26 28 26" stroke-width="2" />
    <path d="M34 12l26 26M42 22l20-14 14 30" stroke-width="1.5" />
    <path d="M4 38h72" />
  </svg>`,

  // Birleşik Arap Emirlikleri: Burç Halife & Yelken Otel
  AE: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M38 40V4l2-2 2 2v36" stroke-width="2" />
    <path d="M34 40V16h4M42 16h4v24M30 40V26h4M46 26h4v14" />
    <path d="M16 40c0-16 8-24 16-24v24M20 40h12" stroke-width="1.5" />
  </svg>`,

  // Suudi Arabistan: Mekke Kabe & Medine Kubbesi
  SA: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="18" y="18" width="20" height="20" rx="1" fill="currentColor" fill-opacity="0.2" />
    <path d="M18 24h20" stroke-dasharray="2 2" />
    <path d="M46 38V26c0-6 6-10 6-10s6 4 6 10v12" />
    <circle cx="52" cy="14" r="1.5" fill="currentColor" />
  </svg>`,

  // Rusya: Aziz Vasil Katedrali Soğan Kubbeleri
  RU: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 38h60M20 38V26h12v12M48 38V26h12v12M32 38V20h16v18" />
    <path d="M26 26c0-4 4-8 4-8s4 4 4 8M54 26c0-4 4-8 4-8s4 4 4 8M40 20c0-6 5-11 5-11s5 5 5 11" fill="currentColor" fill-opacity="0.2" />
    <path d="M40 9V4M26 18v-3M54 18v-3" />
  </svg>`,

  // Çin: Çin Seddi & Pagoda
  CN: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 38c14-6 26-14 38-14s22 6 30 14" stroke-width="2" />
    <path d="M16 32v-8h10v6M42 24v-8h10v6M64 32v-8h10v8" />
    <path d="M14 24h14M40 16h14M62 24h14" />
  </svg>`,

  // Hindistan: Taç Mahal Kubbesi & Minareleri
  IN: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 38h64M24 38V24h32v14M14 38V14l2-2 2 2v24M62 38V14l2-2 2 2v24" />
    <path d="M40 24c-8 0-10-8-10-8s2-8 10-8 10 8 10 8-2 8-10 8z" fill="currentColor" fill-opacity="0.2" />
    <path d="M40 8V3M34 24a6 6 0 0 1 12 0" />
  </svg>`,

  // Brezilya: Kurtarıcı İsa Heykeli (Cristo Redentor)
  BR: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 38l14-12 12 4 12-4 14 12" />
    <path d="M38 26v-12l-18-2v3l18 3M42 26v-12l18-2v3l-18 3" stroke-width="2" />
    <circle cx="40" cy="8" r="2.5" fill="currentColor" />
  </svg>`,

  // Avustralya: Sidney Opera Binası Yelkenleri
  AU: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 38h64" />
    <path d="M16 38c0-14 10-22 20-22s6 14 6 22M28 38c0-18 12-28 22-28s8 18 8 28M44 38c0-12 8-18 16-18s6 12 6 18" fill="currentColor" fill-opacity="0.15" />
  </svg>`,

  // Güney Kore: Gyeongbokgung Sarayı Kapısı
  KR: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 20c16-4 44-4 60 0M16 28c14-3 34-3 48 0" stroke-width="2" />
    <path d="M20 38V28h40v10M32 38a8 8 0 0 1 16 0" fill="currentColor" fill-opacity="0.2" />
  </svg>`,

  // Tayland: Wat Arun Pagodası
  TH: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M36 38l4-28 4 28z" fill="currentColor" fill-opacity="0.2" stroke-width="2" />
    <path d="M24 38l4-16 4 16zM48 38l4-16 4 16zM40 10V4" />
  </svg>`,

  // Kanada: Akçaağaç Yaprağı
  CA: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M40 6l3 7 7-3-2 8 8 2-6 6 4 6-9-2-5 8-5-8-9 2 4-6-6-6 8-2-2-8 7 3z" fill="currentColor" fill-opacity="0.2" />
    <path d="M40 34v6" stroke-width="2" />
  </svg>`,

  // Meksika: Chichen Itza Kukulcan Piramidi
  MX: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 38h56M16 34h48M20 30h40M24 26h32M28 22h24M34 22v-6h12v6" />
    <path d="M36 38V22h8v16" fill="currentColor" fill-opacity="0.2" />
  </svg>`,

  // Gürcistan: Narikala Kalesi & Tiflis Balkonları
  GE: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 38l16-12 16 6 16-10 12 16M18 30v-8h8v8M46 26v-10h8v10" />
    <path d="M20 38c10-2 20-2 30 0" />
  </svg>`,

  // Azerbaycan: Alev Kuleleri (Flame Towers)
  AZ: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M24 38c0-10 6-18 6-24 0 8 4 14 4 24M36 38c0-12 8-24 8-32 0 10 6 18 6 32M48 38c0-8 6-16 6-20 0 6 4 12 4 20" stroke-width="2" fill="currentColor" fill-opacity="0.15" />
  </svg>`,

  // Ürdün (JO): Petra El-Hazne (Hazine)
  JO: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 38h48M20 38V16h40v22M24 22l16-8 16 8" />
    <path d="M28 22v16M36 22v16M44 22v16M52 22v16M36 38v-8h8v8" />
    <circle cx="40" cy="11" r="2" fill="currentColor" />
  </svg>`,

  // Fas (MA): Koutoubia & Mağribi Kemer
  MA: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 38h48M22 38V12l6-4 6 4v26" />
    <path d="M40 38V22c0-8 12-8 12 0v16M42 22c0-4 8-4 8 0v16" fill="currentColor" fill-opacity="0.15" />
  </svg>`,

  // Endonezya (ID): Borobudur Stupası & Candi Bentar
  ID: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 38h60M16 38V16l8-10v32M56 38V16l-8-10v32" />
    <path d="M34 38c0-8 6-12 6-12s6 4 6 12" fill="currentColor" fill-opacity="0.2" />
    <circle cx="40" cy="22" r="2" />
  </svg>`,

  // Vietnam (VN): Ha Long Bay & Pagoda
  VN: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 38l14-18 10 12 14-22 14 16 8 12" />
    <path d="M14 36c12-3 24-3 36 0" stroke-dasharray="2 2" />
    <path d="M38 34v-8h8v8M36 26l6-4 6 4" />
  </svg>`,

  // Kamboçya (KH): Angkor Wat Lotus Kuleleri
  KH: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 38h56M16 38c0-8 4-16 6-16s6 8 6 16M52 38c0-8 4-16 6-16s6 8 6 16M32 38c0-14 8-26 8-26s8 12 8 26" fill="currentColor" fill-opacity="0.15" />
  </svg>`,

  // Jenerik Ülke Özel Mühür Rozeti (Herhangi Bir Ülke İçin Kod & Çelenk İle Dinamik Üretilir)
  DEFAULT: `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="40" cy="22" r="16" stroke-dasharray="3 3" />
    <circle cx="40" cy="22" r="12" />
    <path d="M22 22h4M54 22h4M40 8v4M40 32v4" />
    <path d="M35 17l5 5-5 5M45 17l-5 5 5 5" stroke-width="1.4" />
  </svg>`
};

// ─── Ülke Damga Stilleri Eşleşmesi (8 Airbnb Formu & 9 Canlı Mürekkep) ─────────
export const COUNTRY_CUSTOM_STAMPS = {
  // Türkiye & Balkanlar
  'TR': { shape: STAMP_SHAPES.HEX_POINTED, ink: STAMP_INKS.TURKISH_RED, label: 'TÜRKİYE', landmark: 'TR' },
  'GR': { shape: STAMP_SHAPES.ARCH_TEMPLE, ink: STAMP_INKS.COBALT, label: 'HELLAS', landmark: 'GR' },
  'BA': { shape: STAMP_SHAPES.ARCH_TEMPLE, ink: STAMP_INKS.TEAL, label: 'BOSNA I HERCEGOVINA', landmark: 'BA' },
  'MK': { shape: STAMP_SHAPES.NOTCHED_RECT, ink: STAMP_INKS.TERRACOTTA, label: 'NORTH MACEDONIA', landmark: 'MK' },
  'AL': { shape: STAMP_SHAPES.SHIELD_CREST, ink: STAMP_INKS.CRIMSON, label: 'SHQIPËRIA', landmark: 'AL' },
  'ME': { shape: STAMP_SHAPES.OCTAGON_SEAL, ink: STAMP_INKS.NAVY, label: 'CRNA GORA', landmark: 'ME' },
  'RS': { shape: STAMP_SHAPES.SHIELD_CREST, ink: STAMP_INKS.COBALT, label: 'SRBIJA', landmark: 'RS' },
  'HR': { shape: STAMP_SHAPES.PILL_STADIUM, ink: STAMP_INKS.BURGUNDY, label: 'HRVATSKA', landmark: 'HR' },
  'BG': { shape: STAMP_SHAPES.OCTAGON_SEAL, ink: STAMP_INKS.EMERALD, label: 'BULGARIA', landmark: 'BG' },
  'RO': { shape: STAMP_SHAPES.NOTCHED_RECT, ink: STAMP_INKS.BURGUNDY, label: 'ROMANIA', landmark: 'RO' },

  // Batı & Orta Avrupa
  'FR': { shape: STAMP_SHAPES.ARCH_TEMPLE, ink: STAMP_INKS.NAVY, label: 'FRANCE', landmark: 'FR' },
  'IT': { shape: STAMP_SHAPES.PILL_STADIUM, ink: STAMP_INKS.BURGUNDY, label: 'ITALIA', landmark: 'IT' },
  'ES': { shape: STAMP_SHAPES.HEX_POINTED, ink: STAMP_INKS.TERRACOTTA, label: 'ESPAÑA', landmark: 'ES' },
  'DE': { shape: STAMP_SHAPES.OCTAGON_SEAL, ink: STAMP_INKS.NAVY, label: 'DEUTSCHLAND', landmark: 'DE' },
  'GB': { shape: STAMP_SHAPES.SHIELD_CREST, ink: STAMP_INKS.VIOLET, label: 'UNITED KINGDOM', landmark: 'GB' },
  'NL': { shape: STAMP_SHAPES.SCALLOPED_CIRCLE, ink: STAMP_INKS.TERRACOTTA, label: 'NEDERLAND', landmark: 'NL' },
  'BE': { shape: STAMP_SHAPES.DIAMOND_BADGE, ink: STAMP_INKS.NAVY, label: 'BELGIQUE', landmark: 'BE' },
  'AT': { shape: STAMP_SHAPES.SHIELD_CREST, ink: STAMP_INKS.CRIMSON, label: 'ÖSTERREICH', landmark: 'AT' },
  'CH': { shape: STAMP_SHAPES.OCTAGON_SEAL, ink: STAMP_INKS.CRIMSON, label: 'SCHWEIZ', landmark: 'CH' },
  'HU': { shape: STAMP_SHAPES.ARCH_TEMPLE, ink: STAMP_INKS.EMERALD, label: 'MAGYARORSZÁG', landmark: 'HU' },
  'CZ': { shape: STAMP_SHAPES.NOTCHED_RECT, ink: STAMP_INKS.COBALT, label: 'ČESKÁ REPUBLIKA', landmark: 'CZ' },
  'PL': { shape: STAMP_SHAPES.SHIELD_CREST, ink: STAMP_INKS.CRIMSON, label: 'POLSKA', landmark: 'PL' },
  'PT': { shape: STAMP_SHAPES.SCALLOPED_CIRCLE, ink: STAMP_INKS.TEAL, label: 'PORTUGAL', landmark: 'PT' },

  // İskandinavya
  'SE': { shape: STAMP_SHAPES.SHIELD_CREST, ink: STAMP_INKS.COBALT, label: 'SVERIGE', landmark: 'SE' },
  'NO': { shape: STAMP_SHAPES.OCTAGON_SEAL, ink: STAMP_INKS.TEAL, label: 'NORGE', landmark: 'NO' },
  'DK': { shape: STAMP_SHAPES.PILL_STADIUM, ink: STAMP_INKS.CRIMSON, label: 'DANMARK', landmark: 'DK' },
  'FI': { shape: STAMP_SHAPES.HEX_POINTED, ink: STAMP_INKS.COBALT, label: 'SUOMI', landmark: 'FI' },

  // Kafkaslar & Doğu Avrupa
  'AZ': { shape: STAMP_SHAPES.OCTAGON_SEAL, ink: STAMP_INKS.COBALT, label: 'AZƏRBAYCAN', landmark: 'AZ' },
  'GE': { shape: STAMP_SHAPES.SHIELD_CREST, ink: STAMP_INKS.BURGUNDY, label: 'GEORGIA', landmark: 'GE' },
  'RU': { shape: STAMP_SHAPES.ARCH_TEMPLE, ink: STAMP_INKS.BURGUNDY, label: 'RUSSIA', landmark: 'RU' },

  // Orta Doğu & Kuzey Afrika
  'EG': { shape: STAMP_SHAPES.DIAMOND_BADGE, ink: STAMP_INKS.TERRACOTTA, label: 'EGYPT', landmark: 'EG' },
  'SA': { shape: STAMP_SHAPES.OCTAGON_SEAL, ink: STAMP_INKS.EMERALD, label: 'SAUDI ARABIA', landmark: 'SA' },
  'AE': { shape: STAMP_SHAPES.HEX_POINTED, ink: STAMP_INKS.TEAL, label: 'EMIRATES', landmark: 'AE' },
  'JO': { shape: STAMP_SHAPES.ARCH_TEMPLE, ink: STAMP_INKS.TERRACOTTA, label: 'JORDAN', landmark: 'JO' },
  'MA': { shape: STAMP_SHAPES.HEX_POINTED, ink: STAMP_INKS.TERRACOTTA, label: 'MAROC', landmark: 'MA' },

  // Asya & Pasifik
  'JP': { shape: STAMP_SHAPES.SCALLOPED_CIRCLE, ink: STAMP_INKS.CRIMSON, label: 'NIPPON', landmark: 'JP' },
  'CN': { shape: STAMP_SHAPES.OCTAGON_SEAL, ink: STAMP_INKS.CRIMSON, label: 'CHINA', landmark: 'CN' },
  'KR': { shape: STAMP_SHAPES.HEX_POINTED, ink: STAMP_INKS.COBALT, label: 'KOREA', landmark: 'KR' },
  'IN': { shape: STAMP_SHAPES.ARCH_TEMPLE, ink: STAMP_INKS.TERRACOTTA, label: 'INDIA', landmark: 'IN' },
  'TH': { shape: STAMP_SHAPES.ARCH_TEMPLE, ink: STAMP_INKS.TERRACOTTA, label: 'THAILAND', landmark: 'TH' },
  'ID': { shape: STAMP_SHAPES.OCTAGON_SEAL, ink: STAMP_INKS.EMERALD, label: 'INDONESIA', landmark: 'ID' },
  'VN': { shape: STAMP_SHAPES.PILL_STADIUM, ink: STAMP_INKS.TEAL, label: 'VIET NAM', landmark: 'VN' },
  'KH': { shape: STAMP_SHAPES.ARCH_TEMPLE, ink: STAMP_INKS.BURGUNDY, label: 'CAMBODIA', landmark: 'KH' },
  'AU': { shape: STAMP_SHAPES.HEX_POINTED, ink: STAMP_INKS.TEAL, label: 'AUSTRALIA', landmark: 'AU' },

  // Amerika Kıtası
  'US': { shape: STAMP_SHAPES.SHIELD_CREST, ink: STAMP_INKS.COBALT, label: 'UNITED STATES', landmark: 'US' },
  'CA': { shape: STAMP_SHAPES.SHIELD_CREST, ink: STAMP_INKS.TURKISH_RED, label: 'CANADA', landmark: 'CA' },
  'MX': { shape: STAMP_SHAPES.DIAMOND_BADGE, ink: STAMP_INKS.TERRACOTTA, label: 'MÉXICO', landmark: 'MX' },
  'BR': { shape: STAMP_SHAPES.SCALLOPED_CIRCLE, ink: STAMP_INKS.EMERALD, label: 'BRASIL', landmark: 'BR' }
};

/**
 * Ülke koduna özel dinamik damga mühür grafiği üretir.
 * Listede doğrudan çizimi olmayan ülkeler için bile ISO2 kodu ve özgün mühür arması içerir.
 */
function createDynamicCountrySvg(code) {
  return `<svg viewBox="0 0 80 44" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="18" y="8" width="44" height="28" rx="6" stroke-dasharray="2 2" fill="currentColor" fill-opacity="0.06" />
    <path d="M14 22h6M60 22h6M40 4v6M40 34v6" stroke-width="1.5" />
    <circle cx="40" cy="22" r="10" stroke-width="1.6" />
    <text x="40" y="25.5" text-anchor="middle" font-size="8.5" font-family="monospace" font-weight="900" fill="currentColor" stroke="none">${code}</text>
  </svg>`;
}

/**
 * Ülke koduna ve dizin indeksine göre zengin, özgün Airbnb tarzı damga özellikleri döndürür.
 */
export function getCountryStampStyle(countryCode, index = 0) {
  const code = String(countryCode || '').toUpperCase();
  const custom = COUNTRY_CUSTOM_STAMPS[code];

  if (custom) {
    const rot = (((index * 13) % 7) - 3) * 1.3;
    const svg = LANDMARK_SVGS[custom.landmark] || createDynamicCountrySvg(code);
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
  const svg = LANDMARK_SVGS[code] || createDynamicCountrySvg(code);

  return {
    shape: selectedShape,
    ink: selectedInk,
    label: code,
    landmarkSvg: svg,
    rotation: rot
  };
}
