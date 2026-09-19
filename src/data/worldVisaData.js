// worldVisaData.js - Kapsamlı Dünya Vize Rejimleri Veri Tabanı
// Türkiye Cumhuriyeti Dışişleri Bakanlığı Resmi Konsolosluk Verileri (Bordo ve Yeşil Pasaport)
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

// vb = Bordo Pasaport (Umuma Mahsus), vy = Yeşil Pasaport (Hususi), vd = Detay/Süre Notu
export const WORLD_VISA_DATA = {
  "TR": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Ana Vatan (Kimlikle)"
  },
  "AZ": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Kimlikle Vizesiz (90 Gün)"
  },
  "GE": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Kimlikle Vizesiz (1 Yıl)"
  },
  "CY": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Güney Kıbrıs (Atina Elçiliği Vizesi)"
  },
  "XN": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Kimlikle Vizesiz (KKTC)"
  },
  "GR": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (Ege Adalarında Kapıda Vize)"
  },
  "BG": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "RO": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "IR": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "IQ": {
    "vb": "kapida_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo Kapıda/Vize"
  },
  "SY": {
    "vb": "kapida_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Harçsız Vizesiz, Bordo Sınırda Harç"
  },
  "AM": {
    "vb": "e_vize",
    "vy": "e_vize",
    "vd": "Online e-Vize (21 Gün)"
  },
  "BA": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "RS": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Kimlikle / Vizesiz (90 Gün)"
  },
  "ME": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (Bordo 30 Gün, Yeşil 90 Gün)"
  },
  "AL": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "MK": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "XK": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "MD": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Kimlikle Vizesiz (90 Gün)"
  },
  "UA": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Kimlikle Vizesiz (90 Gün)"
  },
  "BY": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (30 Gün)"
  },
  "RU": {
    "vb": "e_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (30 Gün), Bordo e-Vize"
  },
  "DE": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "FR": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "IT": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "ES": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "NL": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "BE": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "AT": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "CH": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "PT": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "SE": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "NO": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "DK": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "FI": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "PL": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "CZ": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "HU": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "SK": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "SI": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "HR": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "EE": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "LV": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "LT": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "IS": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "LU": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "MT": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "LI": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen (180 Günde 90 Gün)"
  },
  "MC": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Fransa / Schengen Giriş"
  },
  "AD": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Schengen Üzerinden Giriş"
  },
  "SM": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "İtalya / Schengen Giriş"
  },
  "VA": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "İtalya / Schengen Giriş"
  },
  "AX": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Finlandiya / Schengen (90 Gün)"
  },
  "FO": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Danimarka Vizesi / Muafiyet"
  },
  "GL": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Danimarka Vizesi / Muafiyet"
  },
  "GI": {
    "vb": "vize",
    "vy": "vize",
    "vd": "İngiltere / Cebelitarık Vizesi"
  },
  "GB": {
    "vb": "vize",
    "vy": "vize",
    "vd": "İngiltere Konsolosluk Vizesi Zorunlu"
  },
  "IE": {
    "vb": "vize",
    "vy": "vize",
    "vd": "İrlanda Konsolosluk Vizesi Zorunlu"
  },
  "IM": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Birleşik Krallık Vizesi"
  },
  "JE": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Birleşik Krallık Vizesi"
  },
  "GG": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Birleşik Krallık Vizesi"
  },
  "US": {
    "vb": "vize",
    "vy": "vize",
    "vd": "B1/B2 Konsolosluk Vizesi Zorunlu"
  },
  "CA": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Kanada Konsolosluk Vizesi Zorunlu"
  },
  "MX": {
    "vb": "e_vize",
    "vy": "vize",
    "vd": "Bordo Online SAE, Yeşile Konsolosluk Vizesi Zorunlu"
  },
  "CU": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo Turist Kartı"
  },
  "DO": {
    "vb": "kapida_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo Giriş Formu"
  },
  "JM": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "BS": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (8 Ay)"
  },
  "BB": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "TT": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (30 Gün)"
  },
  "HT": {
    "vb": "kapida_vize",
    "vy": "kapida_vize",
    "vd": "Havalimanında Turist Kartı (90 Gün)"
  },
  "AG": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "DM": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (21 Gün)"
  },
  "GD": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo Vize"
  },
  "KN": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "LC": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (6 Hafta)"
  },
  "VC": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo Vize"
  },
  "BZ": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "CR": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (30 Gün)"
  },
  "PA": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "GT": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "HN": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "NI": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "SV": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "PR": {
    "vb": "vize",
    "vy": "vize",
    "vd": "ABD Vizesi (B1/B2)"
  },
  "VI": {
    "vb": "vize",
    "vy": "vize",
    "vd": "ABD Virgin Adaları / ABD Vizesi"
  },
  "AW": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Hollanda Krallığı (Yeşil Vizesiz)"
  },
  "CW": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Hollanda Krallığı (Yeşil Vizesiz)"
  },
  "SX": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Sint Maarten (Yeşil Vizesiz)"
  },
  "MF": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Fransa / Schengen Rejimi"
  },
  "BL": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Fransa / Schengen Rejimi"
  },
  "PM": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Fransa / Schengen Rejimi"
  },
  "BM": {
    "vb": "vize",
    "vy": "vize",
    "vd": "İngiltere Vizesi / Kanada/ABD"
  },
  "KY": {
    "vb": "vize",
    "vy": "vize",
    "vd": "İngiltere Denizaşırı Toprağı"
  },
  "VG": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Britanya Virgin Adaları"
  },
  "AI": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Anguilla / İngiltere Vizesi"
  },
  "MS": {
    "vb": "e_vize",
    "vy": "e_vize",
    "vd": "Online e-Vize"
  },
  "TC": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Turks ve Caicos Adaları"
  },
  "BR": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "AR": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "CL": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "CO": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "PE": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "EC": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "UY": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "PY": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "BO": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "VE": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "SR": {
    "vb": "e_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo Giriş Kartı"
  },
  "GY": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo Vize"
  },
  "FK": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Falkland Adaları Vizesi"
  },
  "GS": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Güney Georgia Vizesi"
  },
  "JP": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "KR": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "K-ETA Elektronik Kayıt (90 Gün)"
  },
  "SG": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (30 Gün)"
  },
  "MY": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "TH": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (30 Gün, Dijital Kart)"
  },
  "PH": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (30 Gün)"
  },
  "ID": {
    "vb": "kapida_vize",
    "vy": "kapida_vize",
    "vd": "Kapıda Vize / e-VoA (30 Gün, 500.000 IDR)"
  },
  "VN": {
    "vb": "e_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo e-Vize"
  },
  "KH": {
    "vb": "kapida_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (30 Gün), Bordo Kapıda/e-Vize"
  },
  "LA": {
    "vb": "kapida_vize",
    "vy": "vize",
    "vd": "Bordo Kapıda Vize, Yeşile Vize Gerekli"
  },
  "MM": {
    "vb": "e_vize",
    "vy": "vize",
    "vd": "Bordo e-Vize, Yeşile Vize Gerekli"
  },
  "CN": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (30 Gün), Bordo Vize"
  },
  "HK": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "MO": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (30 Gün)"
  },
  "TW": {
    "vb": "e_vize",
    "vy": "e_vize",
    "vd": "Online e-Vize (30 Gün, Ücretsiz)"
  },
  "MN": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (30 Gün)"
  },
  "KZ": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (30 Gün)"
  },
  "UZ": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (30 Gün)"
  },
  "KG": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "TJ": {
    "vb": "e_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (60 Gün), Bordo e-Vize"
  },
  "TM": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (30 Gün / Davetle), Bordo Vize"
  },
  "IN": {
    "vb": "e_vize",
    "vy": "vize",
    "vd": "Bordo e-Vize, Yeşile Konsolosluk Vizesi Zorunlu"
  },
  "PK": {
    "vb": "e_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz, Bordo Online e-Vize"
  },
  "BD": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo Vize"
  },
  "LK": {
    "vb": "e_vize",
    "vy": "e_vize",
    "vd": "Online ETA / e-Vize (30 Gün)"
  },
  "MV": {
    "vb": "kapida_vize",
    "vy": "kapida_vize",
    "vd": "Ücretsiz Kapıda Vize (30 Gün)"
  },
  "NP": {
    "vb": "kapida_vize",
    "vy": "kapida_vize",
    "vd": "Kapıda Vize (15-90 Gün)"
  },
  "BT": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Tur Operatörü Vizesi Zorunlu"
  },
  "BN": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (30 Gün)"
  },
  "TL": {
    "vb": "kapida_vize",
    "vy": "kapida_vize",
    "vd": "Kapıda Vize (30 Gün)"
  },
  "KP": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Kuzey Kore Vizesi Zorunlu"
  },
  "QA": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "AE": {
    "vb": "e_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo e-Vize"
  },
  "SA": {
    "vb": "e_vize",
    "vy": "e_vize",
    "vd": "Online e-Vize / Kapıda Vize (90 Gün)"
  },
  "OM": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (Bordo 14 Gün, Yeşil 90 Gün)"
  },
  "KW": {
    "vb": "kapida_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo Kapıda Vize"
  },
  "BH": {
    "vb": "e_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo e-Vize"
  },
  "JO": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "LB": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "IL": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo Vize"
  },
  "PS": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "İsrail Kontrolünde Giriş"
  },
  "YE": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo Vize"
  },
  "AF": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Vize Gerekli"
  },
  "MA": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "TN": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "DZ": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo Vize"
  },
  "EG": {
    "vb": "kapida_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo Kapıda Vize"
  },
  "LY": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo e-Vize"
  },
  "SD": {
    "vb": "kapida_vize",
    "vy": "kapida_vize",
    "vd": "Sınır Kapısında Vize"
  },
  "SS": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Güney Sudan Vizesi Gerekli"
  },
  "ET": {
    "vb": "e_vize",
    "vy": "vize",
    "vd": "Bordo e-Vize, Yeşile Konsolosluk Vizesi"
  },
  "SO": {
    "vb": "kapida_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz, Bordo Kapıda Vize"
  },
  "XS": {
    "vb": "kapida_vize",
    "vy": "kapida_vize",
    "vd": "Somaliland Kapıda Vize"
  },
  "ER": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Eritre Vizesi Gerekli"
  },
  "DJ": {
    "vb": "e_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo e-Vize"
  },
  "KE": {
    "vb": "e_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün, eTA Muaf), Bordo eTA"
  },
  "TZ": {
    "vb": "kapida_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo Kapıda/e-Vize"
  },
  "UG": {
    "vb": "e_vize",
    "vy": "vize",
    "vd": "Uganda Vizesi / e-Vize Gerekli"
  },
  "RW": {
    "vb": "kapida_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo Kapıda/e-Vize"
  },
  "BI": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Burundi Vizesi Gerekli"
  },
  "TD": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo Vize"
  },
  "NE": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo Vize"
  },
  "NG": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Nijerya Vizesi Gerekli"
  },
  "ML": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Mali Vizesi Gerekli"
  },
  "BF": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Burkina Faso Vizesi Gerekli"
  },
  "BJ": {
    "vb": "e_vize",
    "vy": "vize",
    "vd": "Bordo e-Vize, Yeşile Vize Gerekli"
  },
  "TG": {
    "vb": "e_vize",
    "vy": "vize",
    "vd": "Bordo e-Vize, Yeşile Vize Gerekli"
  },
  "GH": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Gana Vizesi Gerekli"
  },
  "CI": {
    "vb": "e_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo e-Vize"
  },
  "LR": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Liberya Vizesi Gerekli"
  },
  "SL": {
    "vb": "e_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo e-Vize"
  },
  "GN": {
    "vb": "e_vize",
    "vy": "vize",
    "vd": "Bordo e-Vize, Yeşile Vize Gerekli"
  },
  "GW": {
    "vb": "kapida_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo Kapıda Vize"
  },
  "SN": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Senegal Vizesi Gerekli"
  },
  "GM": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Gambiya Vizesi Gerekli"
  },
  "MR": {
    "vb": "kapida_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo Kapıda/e-Vize"
  },
  "CM": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Kamerun Vizesi Gerekli"
  },
  "CF": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Orta Afrika Cumhuriyeti Vizesi Gerekli"
  },
  "GQ": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo Vize"
  },
  "GA": {
    "vb": "e_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo e-Vize"
  },
  "CG": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Kongo Cumhuriyeti Vizesi Gerekli"
  },
  "CD": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Demokratik Kongo Cumhuriyeti Vizesi Gerekli"
  },
  "AO": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (Bordo 30 Gün, Yeşil 90 Gün)"
  },
  "ZM": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "ZW": {
    "vb": "kapida_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz, Bordo Kapıda/e-Vize"
  },
  "MW": {
    "vb": "e_vize",
    "vy": "vize",
    "vd": "Bordo e-Vize, Yeşile Vize Gerekli"
  },
  "MZ": {
    "vb": "kapida_vize",
    "vy": "vizesiz",
    "vd": "Yeşile Vizesiz (90 Gün), Bordo Kapıda/e-Vize"
  },
  "MG": {
    "vb": "kapida_vize",
    "vy": "kapida_vize",
    "vd": "Sınır Kapısında Vize (30 Gün)"
  },
  "NA": {
    "vb": "kapida_vize",
    "vy": "kapida_vize",
    "vd": "Sınırda / Elektronik Vize (90 Gün)"
  },
  "BW": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (90 Gün)"
  },
  "ZA": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (30 Gün)"
  },
  "LS": {
    "vb": "e_vize",
    "vy": "vize",
    "vd": "Bordo e-Vize, Yeşile Vize Gerekli"
  },
  "SZ": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (Sınırda Kaşe, 30 Gün)"
  },
  "SC": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (Seyahat Yetkilendirme Belgesi)"
  },
  "MU": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (30 Gün)"
  },
  "KM": {
    "vb": "kapida_vize",
    "vy": "kapida_vize",
    "vd": "Kapıda Vize (45 Gün)"
  },
  "CV": {
    "vb": "e_vize",
    "vy": "vize",
    "vd": "EASE Online Ön Kayıt / Vize"
  },
  "ST": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (15 Gün)"
  },
  "EH": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Fas Kontrolünde Giriş (90 Gün)"
  },
  "AU": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Ziyaretçi Vizesi (Subclass 600 Online Başvuru)"
  },
  "NZ": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Ziyaretçi Vizesi Zorunlu"
  },
  "FJ": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (120 Gün)"
  },
  "VU": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (30 Gün)"
  },
  "WS": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz Giriş İzni (60 Gün)"
  },
  "TO": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (31 Gün)"
  },
  "TV": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (30 Gün)"
  },
  "PW": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Vizesiz (30 Gün)"
  },
  "MH": {
    "vb": "kapida_vize",
    "vy": "kapida_vize",
    "vd": "Kapıda Vize (90 Gün)"
  },
  "FM": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Mikronezya Vizesi Gerekli"
  },
  "KI": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Kiribati Vizesi Gerekli"
  },
  "NR": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Nauru Vizesi Gerekli"
  },
  "SB": {
    "vb": "vize",
    "vy": "vize",
    "vd": "Solomon Adaları Vizesi Gerekli"
  },
  "PG": {
    "vb": "e_vize",
    "vy": "vize",
    "vd": "Bordo e-Vize, Yeşile Vize Gerekli"
  },
  "NC": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Fransa / Denizaşırı Toprak"
  },
  "PF": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Fransa / Denizaşırı Toprak"
  },
  "WF": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Fransa / Denizaşırı Toprak"
  },
  "CK": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Yeni Zelanda ile Serbest (31 Gün)"
  },
  "NU": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Yeni Zelanda ile Serbest (30 Gün)"
  },
  "NF": {
    "vb": "e_vize",
    "vy": "e_vize",
    "vd": "Avustralya Vize Rejimi"
  },
  "AS": {
    "vb": "vize",
    "vy": "vize",
    "vd": "ABD Giriş İzni (B1/B2)"
  },
  "GU": {
    "vb": "vize",
    "vy": "vize",
    "vd": "ABD Vizesi (B1/B2)"
  },
  "MP": {
    "vb": "vize",
    "vy": "vize",
    "vd": "ABD Vizesi (B1/B2)"
  },
  "UM": {
    "vb": "vize",
    "vy": "vize",
    "vd": "ABD Özel İzni"
  },
  "IO": {
    "vb": "vize",
    "vy": "vize",
    "vd": "İngiltere Özel İzni"
  },
  "PN": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "14 Güne Kadar Vizesiz"
  },
  "SH": {
    "vb": "e_vize",
    "vy": "e_vize",
    "vd": "Giriş İzni / e-Vize"
  },
  "TF": {
    "vb": "vize",
    "vy": "vizesiz",
    "vd": "Fransa Özel İzin"
  },
  "HM": {
    "vb": "e_vize",
    "vy": "e_vize",
    "vd": "Avustralya Özel İzin"
  },
  "AQ": {
    "vb": "vizesiz",
    "vy": "vizesiz",
    "vd": "Antarktika Anlaşması (Özel İzin)"
  }
};

// Status normalizasyonu
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
  // Bilinmeyen / eksik ülkeler için güvenli varsayılan resmi kayıt: Vize Gerekli
  return {
    vb: 'vize',
    vy: 'vize',
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
