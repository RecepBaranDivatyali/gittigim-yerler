// stampStyles.js - Airbnb Tarzı Ülkeye Özel Pasaport Damgaları & Mühür Motoru
// Her ülke benzersiz bir damga geometrisine, mürekkep rengine ve sınır kapısı ismine sahiptir.

export const STAMP_SHAPES = {
  SCHENGEN_RECT: 'schengen_rect',   // Çift çizgili dikdörtgen, sol köşede giriş oku ve ülke harfi
  JAPAN_OVAL: 'japan_oval',         // Yuvarlak stadyum/oval, kiraz çiçeği/kapı armalı
  TURKEY_SHIELD: 'turkey_shield',   // Hilal-yıldızlı kalkan/oval mühür
  ARAB_OCTAGON: 'arab_octagon',     // 8 köşeli geometrik mühür
  UK_ROUND: 'uk_round',             // Tırtıklı kraliyet yıldızlı yuvarlak mühür
  USA_HEX: 'usa_hex',               // Köşeleri kesik poligon / CBP tarzı altıgen
  TROPICAL_WAVE: 'tropical_wave',   // Dalgalı veya elmas kenarlı retro mühür
  CLASSIC_BADGE: 'classic_badge'    // Klasik konsolosluk mühür rozeti
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

// Ülke koduna göre özel sınır kapıları ve damga konfigürasyonu
const COUNTRY_CUSTOM_STAMPS = {
  'TR': { shape: STAMP_SHAPES.TURKEY_SHIELD, ink: STAMP_INKS.TURKISH_RED, port: 'İSTANBUL HAVALİMANI', label: 'TÜRKİYE' },
  'FR': { shape: STAMP_SHAPES.SCHENGEN_RECT, ink: STAMP_INKS.NAVY, port: 'PARIS-CDG 01', label: 'FRANCE' },
  'DE': { shape: STAMP_SHAPES.SCHENGEN_RECT, ink: STAMP_INKS.NAVY, port: 'FRANKFURT FLUGHAFEN', label: 'DEUTSCHLAND' },
  'IT': { shape: STAMP_SHAPES.SCHENGEN_RECT, ink: STAMP_INKS.NAVY, port: 'ROMA-FIUMICINO', label: 'ITALIA' },
  'ES': { shape: STAMP_SHAPES.SCHENGEN_RECT, ink: STAMP_INKS.NAVY, port: 'MADRID-BARAJAS', label: 'ESPAÑA' },
  'NL': { shape: STAMP_SHAPES.SCHENGEN_RECT, ink: STAMP_INKS.NAVY, port: 'AMSTERDAM-SCHIPHOL', label: 'NEDERLAND' },
  'GR': { shape: STAMP_SHAPES.SCHENGEN_RECT, ink: STAMP_INKS.NAVY, port: 'ATHENS ELEFTHERIOS', label: 'HELLAS' },
  'JP': { shape: STAMP_SHAPES.JAPAN_OVAL, ink: STAMP_INKS.CRIMSON, port: 'NARITA INTL AIRPORT', label: 'JAPAN 審査済' },
  'KR': { shape: STAMP_SHAPES.JAPAN_OVAL, ink: STAMP_INKS.COBALT, port: 'INCHEON INTL', label: 'KOREA 입국' },
  'GB': { shape: STAMP_SHAPES.UK_ROUND, ink: STAMP_INKS.VIOLET, port: 'UK BORDER - HEATHROW', label: 'UNITED KINGDOM' },
  'US': { shape: STAMP_SHAPES.USA_HEX, ink: STAMP_INKS.COBALT, port: 'US CBP - JFK NY', label: 'UNITED STATES' },
  'AE': { shape: STAMP_SHAPES.ARAB_OCTAGON, ink: STAMP_INKS.EMERALD, port: 'DUBAI INTL DXB', label: 'U.A.E. دبي' },
  'SA': { shape: STAMP_SHAPES.ARAB_OCTAGON, ink: STAMP_INKS.EMERALD, port: 'KING KHALID INTL', label: 'K.S.A. الرياض' },
  'EG': { shape: STAMP_SHAPES.ARAB_OCTAGON, ink: STAMP_INKS.TERRACOTTA, port: 'CAIRO AIRPORT', label: 'EGYPT القاهرة' },
  'TH': { shape: STAMP_SHAPES.TROPICAL_WAVE, ink: STAMP_INKS.CRIMSON, port: 'SUVARNABHUMI BKK', label: 'THAILAND' },
  'ID': { shape: STAMP_SHAPES.TROPICAL_WAVE, ink: STAMP_INKS.TEAL, port: 'BALI NGURAH RAI', label: 'INDONESIA' },
  'BR': { shape: STAMP_SHAPES.TROPICAL_WAVE, ink: STAMP_INKS.TERRACOTTA, port: 'SÃO PAULO GUARULHOS', label: 'BRASIL' },
  'RS': { shape: STAMP_SHAPES.CLASSIC_BADGE, ink: STAMP_INKS.BURGUNDY, port: 'BEOGRAD NIKOLA TESLA', label: 'SRBIJA' },
  'BA': { shape: STAMP_SHAPES.CLASSIC_BADGE, ink: STAMP_INKS.BURGUNDY, port: 'SARAJEVO AIRPORT', label: 'BOSNA I HERC.' },
  'RU': { shape: STAMP_SHAPES.CLASSIC_BADGE, ink: STAMP_INKS.CRIMSON, port: 'SHEREMETYEVO SVO', label: 'RUSSIA РОССИЯ' },
  'CH': { shape: STAMP_SHAPES.SCHENGEN_RECT, ink: STAMP_INKS.NAVY, port: 'ZÜRICH FLUGHAFEN', label: 'SCHWEIZ' },
  'AT': { shape: STAMP_SHAPES.SCHENGEN_RECT, ink: STAMP_INKS.NAVY, port: 'WIEN-SCHWECHAT', label: 'ÖSTERREICH' },
  'AZ': { shape: STAMP_SHAPES.TURKEY_SHIELD, ink: STAMP_INKS.TURKISH_RED, port: 'HEYDAR ALIYEV GYD', label: 'AZƏRBAYCAN' },
  'GE': { shape: STAMP_SHAPES.CLASSIC_BADGE, ink: STAMP_INKS.BURGUNDY, port: 'TBILISI INTL', label: 'GEORGIA საქართველო' }
};

/**
 * Ülke koduna ve dizin indeksine göre zengin, özgün damga özellikleri döndürür.
 */
export function getCountryStampStyle(countryCode, index = 0) {
  const code = String(countryCode || '').toUpperCase();
  const custom = COUNTRY_CUSTOM_STAMPS[code];

  if (custom) {
    const rot = (((index * 13) % 7) - 3) * 1.4;
    return {
      shape: custom.shape,
      ink: custom.ink,
      port: custom.port,
      label: custom.label,
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
  const rot = ((hash % 9) - 4) * 1.2;

  return {
    shape: selectedShape,
    ink: selectedInk,
    port: `${code} INTL POST-${(hash % 9) + 1}`,
    label: code,
    rotation: rot
  };
}
