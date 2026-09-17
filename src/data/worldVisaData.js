// worldVisaData.js - Kapsamlı Dünya Vize Rejimleri Veri Tabanı
// Türkiye Cumhuriyeti Bordo ve Yeşil Pasaport Rejimleri
// 4 Ana Kategori: vizesiz | vize | kapida_vize | e_vize

export const VISA_CATEGORIES = {
  vizesiz: {
    id: 'vizesiz',
    label: 'Vizesiz',
    icon: '🟢',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.18)',
    border: '#10b981'
  },
  vize: {
    id: 'vize',
    label: 'Vize',
    icon: '🔴',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.18)',
    border: '#ef4444'
  },
  kapida_vize: {
    id: 'kapida_vize',
    label: 'Kapıda Vize',
    icon: '🟡',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.18)',
    border: '#f59e0b'
  },
  e_vize: {
    id: 'e_vize',
    label: 'e-Vize',
    icon: '🟣',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.18)',
    border: '#8b5cf6'
  }
};

// vb = Bordo Pasaport, vy = Yeşil Pasaport, vd = Detay/Süre Notu
export const WORLD_VISA_DATA = {
  // ─── Türkiye & Komşular ──────────────────────────────────────────
  "TR": { vb: "vizesiz", vy: "vizesiz", vd: "Ana Vatan" },
  "AZ": { vb: "vizesiz", vy: "vizesiz", vd: "Kimlikle Vizesiz (90 Gün)" },
  "GE": { vb: "vizesiz", vy: "vizesiz", vd: "Kimlikle Vizesiz (1 Yıl)" },
  "CY": { vb: "vizesiz", vy: "vizesiz", vd: "Kimlikle Vizesiz (KKTC)" },
  "GR": { vb: "vize", vy: "vizesiz", vd: "Schengen (Ege Adalarında Kapıda Vize)" },
  "BG": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "RO": { vb: "vize", vy: "vizesiz", vd: "Schengen (180 Günde 90 Gün)" },
  "IR": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "IQ": { vb: "kapida_vize", vy: "vizesiz", vd: "Kapıda Vize (Bağdat/Erbil)" },
  "SY": { vb: "vize", vy: "vizesiz", vd: "Vize Gerekli" },
  "AM": { vb: "e_vize", vy: "vizesiz", vd: "Online e-Vize / Kapıda Vize" },

  // ─── Balkanlar & Doğu Avrupa (Vizesiz Bölge) ──────────────────────
  "BA": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "RS": { vb: "vizesiz", vy: "vizesiz", vd: "Kimlikle / Vizesiz (90 Gün)" },
  "ME": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "AL": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "MK": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "XK": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "MD": { vb: "vizesiz", vy: "vizesiz", vd: "Kimlikle Vizesiz (90 Gün)" },
  "UA": { vb: "vizesiz", vy: "vizesiz", vd: "Kimlikle Vizesiz (90 Gün)" },
  "BY": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (30 Gün)" },

  // ─── Schengen Bölgesi & Batı Avrupa ──────────────────────────────
  "DE": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "FR": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "IT": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "ES": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "NL": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "BE": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "AT": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "CH": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "PT": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "SE": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "NO": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "DK": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "FI": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "PL": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "CZ": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "HU": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "SK": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "SI": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "HR": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "EE": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "LV": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "LT": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "IS": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "LU": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "MT": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "LI": { vb: "vize", vy: "vizesiz", vd: "Schengen (90 Gün)" },
  "MC": { vb: "vize", vy: "vizesiz", vd: "Fransa / Schengen Giriş" },
  "AD": { vb: "vize", vy: "vizesiz", vd: "Schengen Üzerinden Giriş" },
  "SM": { vb: "vize", vy: "vizesiz", vd: "İtalya / Schengen Giriş" },
  "VA": { vb: "vize", vy: "vizesiz", vd: "İtalya / Schengen Giriş" },

  // ─── Birleşik Krallık, İrlanda & Rusya ─────────────────────────────
  "GB": { vb: "vize", vy: "vize", vd: "İngiltere Konsolosluk Vizesi" },
  "IE": { vb: "vize", vy: "vize", vd: "İrlanda Vizesi Gerekli" },
  "RU": { vb: "e_vize", vy: "vizesiz", vd: "Elektronik e-Vize (16 Gün)" },

  // ─── Kuzey Amerika & Karayipler ──────────────────────────────────
  "US": { vb: "vize", vy: "vize", vd: "B1/B2 Konsolosluk Vizesi" },
  "CA": { vb: "vize", vy: "vize", vd: "Kanada Turist Vizesi" },
  "MX": { vb: "e_vize", vy: "vizesiz", vd: "Online Kolay SAE e-Vize" },
  "CU": { vb: "vize", vy: "vizesiz", vd: "Turist Kartı / Vize" },
  "DO": { vb: "e_vize", vy: "vizesiz", vd: "Online e-Ticket Giriş Formu" },
  "JM": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "BS": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (8 Ay)" },
  "BB": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "TT": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "HT": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "AG": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (180 Gün)" },
  "DM": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (21 Gün)" },
  "GD": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "KN": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "LC": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (6 Hafta)" },
  "VC": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (30 Gün)" },
  "BZ": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "CR": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (30 Gün)" },
  "PA": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "GT": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "HN": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "NI": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "SV": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },

  // ─── Güney Amerika (Tamamı Vizesiz) ──────────────────────────────
  "BR": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "AR": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "CL": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "CO": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "PE": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "EC": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "UY": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "PY": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "BO": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "VE": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "SR": { vb: "e_vize", vy: "vizesiz", vd: "Online Giriş Kartı" },
  "GY": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },

  // ─── Asya & Uzak Doğu ───────────────────────────────────────────
  "JP": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "KR": { vb: "e_vize", vy: "vizesiz", vd: "K-ETA Elektronik Onay" },
  "SG": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (30 Gün)" },
  "MY": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "TH": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (60 Gün)" },
  "PH": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (30 Gün)" },
  "ID": { vb: "kapida_vize", vy: "vizesiz", vd: "Kapıda Vize / e-VOA (30 Gün)" },
  "VN": { vb: "e_vize", vy: "vizesiz", vd: "Online e-Vize (90 Gün)" },
  "KH": { vb: "kapida_vize", vy: "kapida_vize", vd: "Kapıda Vize / e-Vize (30 Gün)" },
  "LA": { vb: "kapida_vize", vy: "kapida_vize", vd: "Kapıda Vize (30 Gün)" },
  "MM": { vb: "e_vize", vy: "vizesiz", vd: "Online e-Vize" },
  "CN": { vb: "vize", vy: "vizesiz", vd: "Elçilik Vizesi (Yeşile 30 Gün)" },
  "HK": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "MO": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (30 Gün)" },
  "TW": { vb: "kapida_vize", vy: "vizesiz", vd: "Havalimanında Kapıda Vize (30 Gün)" },
  "MN": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (30 Gün)" },
  "KZ": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (30 Gün)" },
  "UZ": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (30 Gün)" },
  "KG": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "TJ": { vb: "e_vize", vy: "vizesiz", vd: "Online e-Vize" },
  "TM": { vb: "vize", vy: "vizesiz", vd: "Vize Gerekli" },
  "IN": { vb: "e_vize", vy: "vizesiz", vd: "Online e-Vize" },
  "PK": { vb: "e_vize", vy: "vizesiz", vd: "Online e-Vize" },
  "BD": { vb: "kapida_vize", vy: "vizesiz", vd: "Kapıda Vize (30 Gün)" },
  "LK": { vb: "e_vize", vy: "vizesiz", vd: "Online ETA / Kapıda Vize" },
  "MV": { vb: "kapida_vize", vy: "kapida_vize", vd: "Ücretsiz Kapıda Vize (30 Gün)" },
  "NP": { vb: "kapida_vize", vy: "kapida_vize", vd: "Kapıda Vize (15-90 Gün)" },
  "BT": { vb: "vize", vy: "vize", vd: "Tur Operatörü Vizesi" },
  "BN": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (30 Gün)" },
  "TL": { vb: "kapida_vize", vy: "vizesiz", vd: "Kapıda Vize (30 Gün)" },

  // ─── Orta Doğu & Körfez ──────────────────────────────────────────
  "QA": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "AE": { vb: "e_vize", vy: "vizesiz", vd: "Online Kolay e-Vize (Yeşile Vizesiz)" },
  "SA": { vb: "e_vize", vy: "vizesiz", vd: "Online e-Vize / Kapıda Vize (90 Gün)" },
  "OM": { vb: "vizesiz", vy: "vizesiz", vd: "14 Gün Vizesiz" },
  "KW": { vb: "kapida_vize", vy: "vizesiz", vd: "Kapıda Vize / e-Vize (90 Gün)" },
  "BH": { vb: "kapida_vize", vy: "vizesiz", vd: "Kapıda Vize / e-Vize (15 Gün)" },
  "JO": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "LB": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "IL": { vb: "vize", vy: "vizesiz", vd: "Vize Gerekli (Yeşile 90 Gün)" },
  "PS": { vb: "vize", vy: "vizesiz", vd: "İsrail Kontrolünde Giriş" },
  "YE": { vb: "vize", vy: "vizesiz", vd: "Vize Gerekli" },
  "AF": { vb: "vize", vy: "vize", vd: "Vize Gerekli" },

  // ─── Afrika ──────────────────────────────────────────────────────
  "MA": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "TN": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "DZ": { vb: "vize", vy: "vizesiz", vd: "Vize Gerekli (Yeşile 90 Gün)" },
  "EG": { vb: "kapida_vize", vy: "vizesiz", vd: "Kapıda Vize (30 Gün)" },
  "LY": { vb: "vize", vy: "vizesiz", vd: "Vize Gerekli" },
  "SD": { vb: "kapida_vize", vy: "vizesiz", vd: "Kapıda Vize" },
  "ZA": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (30 Gün)" },
  "KE": { vb: "e_vize", vy: "vizesiz", vd: "eTA Elektronik Onay" },
  "TZ": { vb: "kapida_vize", vy: "vizesiz", vd: "Kapıda Vize (50$ - Zanzibar)" },
  "ET": { vb: "e_vize", vy: "vizesiz", vd: "Online e-Vize" },
  "MU": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "SC": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "MG": { vb: "kapida_vize", vy: "kapida_vize", vd: "Kapıda Vize (30 Gün)" },
  "RW": { vb: "kapida_vize", vy: "vizesiz", vd: "Kapıda Vize / e-Vize (30 Gün)" },
  "UG": { vb: "e_vize", vy: "vizesiz", vd: "Online e-Vize" },
  "ZM": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "ZW": { vb: "kapida_vize", vy: "kapida_vize", vd: "Kapıda Vize" },
  "SN": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "CI": { vb: "e_vize", vy: "vizesiz", vd: "Online e-Vize" },
  "GH": { vb: "vize", vy: "vizesiz", vd: "Vize Gerekli" },
  "NG": { vb: "vize", vy: "vizesiz", vd: "Vize Gerekli" },
  "AO": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (30 Gün)" },
  "BW": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (90 Gün)" },
  "NA": { vb: "kapida_vize", vy: "vizesiz", vd: "Kapıda Vize (90 Gün)" },
  "MZ": { vb: "e_vize", vy: "vizesiz", vd: "Online e-Vize (30 Gün)" },
  "BJ": { vb: "e_vize", vy: "vizesiz", vd: "Online e-Vize" },
  "GA": { vb: "e_vize", vy: "vizesiz", vd: "Online e-Vize" },
  "GN": { vb: "e_vize", vy: "vizesiz", vd: "Online e-Vize" },
  "DJ": { vb: "e_vize", vy: "vizesiz", vd: "Online e-Vize" },
  "CV": { vb: "e_vize", vy: "vizesiz", vd: "EASE Online Ön Kayıt" },
  "KM": { vb: "kapida_vize", vy: "kapida_vize", vd: "Kapıda Vize (45 Gün)" },
  "ST": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (15 Gün)" },

  // ─── Okyanusya & Pasifik ──────────────────────────────────────────
  "AU": { vb: "e_vize", vy: "e_vize", vd: "Online eVisitor / e600 Vizesi" },
  "NZ": { vb: "e_vize", vy: "e_vize", vd: "NZeTA Elektronik Onay" },
  "FJ": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (120 Gün)" },
  "VU": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (30 Gün)" },
  "WS": { vb: "kapida_vize", vy: "kapida_vize", vd: "Kapıda Giriş İzni (60 Gün)" },
  "TO": { vb: "kapida_vize", vy: "kapida_vize", vd: "Kapıda Vize (31 Gün)" },
  "TV": { vb: "kapida_vize", vy: "kapida_vize", vd: "Kapıda Vize (30 Gün)" },
  "PW": { vb: "kapida_vize", vy: "kapida_vize", vd: "Kapıda Vize (30 Gün)" },
  "MH": { vb: "kapida_vize", vy: "kapida_vize", vd: "Kapıda Vize (90 Gün)" },
  "FM": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (30 Gün)" },
  "KI": { vb: "vizesiz", vy: "vizesiz", vd: "Vizesiz (30 Gün)" },
  "NR": { vb: "vize", vy: "vize", vd: "Vize Gerekli" },
  "SB": { vb: "kapida_vize", vy: "kapida_vize", vd: "Kapıda Ziyaretçi İzni" }
};

// Normalizer: Geçmişteki veya farklı isimlendirmeleri 4 standart formata çevirir
export function normalizeVisaStatus(raw) {
  if (!raw) return 'vize';
  const s = String(raw).toLowerCase().trim();
  if (s === 'free' || s === 'vizesiz') return 'vizesiz';
  if (s === 'required' || s === 'vize') return 'vize';
  if (s === 'kapida_vize' || s === 'kapida' || s === 'voa') return 'kapida_vize';
  if (s === 'e_vize' || s === 'evisa' || s === 'e-vize') return 'e_vize';
  if (s === 'voa_evisa') return 'kapida_vize';
  return 'vize';
}

// Ülke ve pasaport tipine göre resmi vize verisini getirir
export function getOfficialVisaData(countryCode) {
  if (!countryCode) return null;
  const code = countryCode.toUpperCase();
  if (WORLD_VISA_DATA[code]) {
    return WORLD_VISA_DATA[code];
  }
  // Varsayılan resmi kayıt: Vize Gerekli
  return {
    vb: 'vize',
    vy: 'vizesiz',
    vd: 'Vize Gerekli'
  };
}

// Kullanıcı özel tercihi dahil nihai vize rozet/durum nesnesini döndürür
export function getCountryVisaInfo(countryCode, passportType = 'bordo', customOverride = null) {
  if (!countryCode) return null;
  const code = countryCode.toUpperCase();
  const official = getOfficialVisaData(code);

  const isBordo = passportType === 'bordo';
  const officialStatus = normalizeVisaStatus(isBordo ? official.vb : official.vy);

  // Kullanıcı bu ülke için vize durumunu elle seçmişse:
  const activeStatus = customOverride ? normalizeVisaStatus(customOverride) : officialStatus;
  const isCustom = Boolean(customOverride && customOverride !== officialStatus);

  const cfg = VISA_CATEGORIES[activeStatus] || VISA_CATEGORIES.vize;

  return {
    status: activeStatus,
    officialStatus,
    isCustom,
    label: cfg.label,
    icon: cfg.icon,
    color: cfg.color,
    bg: cfg.bg,
    border: cfg.border,
    days: official.vd || cfg.label,
    passportType
  };
}
