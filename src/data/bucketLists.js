/**
 * bucketLists.js - Hazır Keşif & Hedef Paketleri (Bucket Lists)
 * Gezgin Seyahat Uygulaması
 */
import { queueCloudSync } from '../services/syncService.js';

export const BUCKET_LISTS = [
  {
    id: 'seven_wonders',
    titleTr: 'Dünyanın 7 Harikası',
    titleEn: 'New 7 Wonders of the World',
    descTr: 'İnsanlık tarihinin en büyüleyici 7 anıtsal yapısını keşfet.',
    descEn: 'Discover the 7 most breathtaking monumental wonders of humankind.',
    icon: '🏛️',
    color: '#f59e0b',
    countries: [
      { code: 'IT', nameTr: 'İtalya (Kolezyum)', nameEn: 'Italy (Colosseum)', flag: '🇮🇹' },
      { code: 'JO', nameTr: 'Ürdün (Petra Antik Kenti)', nameEn: 'Jordan (Petra)', flag: '🇯🇴' },
      { code: 'PE', nameTr: 'Peru (Machu Picchu)', nameEn: 'Peru (Machu Picchu)', flag: '🇵🇪' },
      { code: 'MX', nameTr: 'Meksika (Chichen Itza)', nameEn: 'Mexico (Chichen Itza)', flag: '🇲🇽' },
      { code: 'BR', nameTr: 'Brezilya (Kurtarıcı İsa)', nameEn: 'Brazil (Christ the Redeemer)', flag: '🇧🇷' },
      { code: 'IN', nameTr: 'Hindistan (Tac Mahal)', nameEn: 'India (Taj Mahal)', flag: '🇮🇳' },
      { code: 'CN', nameTr: 'Çin (Çin Seddi)', nameEn: 'China (Great Wall)', flag: '🇨🇳' }
    ]
  },
  {
    id: 'visa_free_gems',
    titleTr: 'Vizesiz Favori Rotalar',
    titleEn: 'Top Visa-Free Escapes',
    descTr: 'Bordo pasaport ile vize derdi olmadan gidilebilecek rüya destinasyonlar.',
    descEn: 'Dream destinations accessible with ease and minimal visa bureaucracy.',
    icon: '🌴',
    color: '#10b981',
    countries: [
      { code: 'JP', nameTr: 'Japonya', nameEn: 'Japan', flag: '🇯🇵' },
      { code: 'KR', nameTr: 'Güney Kore', nameEn: 'South Korea', flag: '🇰🇷' },
      { code: 'TH', nameTr: 'Tayland', nameEn: 'Thailand', flag: '🇹🇭' },
      { code: 'BR', nameTr: 'Brezilya', nameEn: 'Brazil', flag: '🇧🇷' },
      { code: 'RS', nameTr: 'Sırbistan', nameEn: 'Serbia', flag: '🇷🇸' },
      { code: 'BA', nameTr: 'Bosna-Hersek', nameEn: 'Bosnia & Herzegovina', flag: '🇧🇦' },
      { code: 'ME', nameTr: 'Karadağ', nameEn: 'Montenegro', flag: '🇲🇪' },
      { code: 'AL', nameTr: 'Arnavutluk', nameEn: 'Albania', flag: '🇦🇱' },
      { code: 'GE', nameTr: 'Gürcistan', nameEn: 'Georgia', flag: '🇬🇪' },
      { code: 'MA', nameTr: 'Fas', nameEn: 'Morocco', flag: '🇲🇦' }
    ]
  },
  {
    id: 'euro_capitals',
    titleTr: 'Avrupa Kültür Başkentleri',
    titleEn: 'European Cultural Capitals',
    descTr: 'Müzeleri, sokakları ve mimarisiyle Avrupa\'nın kalbinde unutulmaz yolculuk.',
    descEn: 'An unforgettable journey through the art, architecture, and streets of Europe.',
    icon: '🏰',
    color: '#3b82f6',
    countries: [
      { code: 'FR', nameTr: 'Fransa (Paris)', nameEn: 'France (Paris)', flag: '🇫🇷' },
      { code: 'IT', nameTr: 'İtalya (Roma)', nameEn: 'Italy (Rome)', flag: '🇮🇹' },
      { code: 'ES', nameTr: 'İspanya (Madrid)', nameEn: 'Spain (Madrid)', flag: '🇪🇸' },
      { code: 'DE', nameTr: 'Almanya (Berlin)', nameEn: 'Germany (Berlin)', flag: '🇩🇪' },
      { code: 'NL', nameTr: 'Hollanda (Amsterdam)', nameEn: 'Netherlands (Amsterdam)', flag: '🇳🇱' },
      { code: 'AT', nameTr: 'Avusturya (Viyana)', nameEn: 'Austria (Vienna)', flag: '🇦🇹' },
      { code: 'CZ', nameTr: 'Çekya (Prag)', nameEn: 'Czechia (Prague)', flag: '🇨🇿' },
      { code: 'HU', nameTr: 'Macaristan (Budapeşte)', nameEn: 'Hungary (Budapest)', flag: '🇭🇺' },
      { code: 'GB', nameTr: 'Birleşik Krallık (Londra)', nameEn: 'United Kingdom (London)', flag: '🇬🇧' },
      { code: 'PT', nameTr: 'Portekiz (Lizbon)', nameEn: 'Portugal (Lisbon)', flag: '🇵🇹' }
    ]
  },
  {
    id: 'ancient_worlds',
    titleTr: 'Antik Medeniyetler Beşiği',
    titleEn: 'Cradle of Ancient Civilizations',
    descTr: 'Mısır firavunlarından Truva\'ya, İnka tapınaklarından Pers diyarına antik miras.',
    descEn: 'From Egyptian pharaohs to Troy, Inca ruins to Persian palaces.',
    icon: '🏺',
    color: '#8b5cf6',
    countries: [
      { code: 'EG', nameTr: 'Mısır', nameEn: 'Egypt', flag: '🇪🇬' },
      { code: 'GR', nameTr: 'Yunanistan', nameEn: 'Greece', flag: '🇬🇷' },
      { code: 'IT', nameTr: 'İtalya', nameEn: 'Italy', flag: '🇮🇹' },
      { code: 'TR', nameTr: 'Türkiye', nameEn: 'Turkey', flag: '🇹🇷' },
      { code: 'PE', nameTr: 'Peru', nameEn: 'Peru', flag: '🇵🇪' },
      { code: 'MX', nameTr: 'Meksika', nameEn: 'Mexico', flag: '🇲🇽' },
      { code: 'IR', nameTr: 'İran', nameEn: 'Iran', flag: '🇮🇷' },
      { code: 'IN', nameTr: 'Hindistan', nameEn: 'India', flag: '🇮🇳' }
    ]
  },
  {
    id: 'nordic_lights',
    titleTr: 'Kuzey Işıkları & Fiyortlar',
    titleEn: 'Nordic Lights & Wild Fjords',
    descTr: 'İskandinavya\'nın vahşi doğası, buzulları ve dans eden aurora ışıkları.',
    descEn: 'Untamed Scandinavian wilderness, majestic glaciers, and dancing auroras.',
    icon: '❄️',
    color: '#06b6d4',
    countries: [
      { code: 'NO', nameTr: 'Norveç', nameEn: 'Norway', flag: '🇳🇴' },
      { code: 'IS', nameTr: 'İzlanda', nameEn: 'Iceland', flag: '🇮🇸' },
      { code: 'SE', nameTr: 'İsveç', nameEn: 'Sweden', flag: '🇸🇪' },
      { code: 'FI', nameTr: 'Finlandiya', nameEn: 'Finland', flag: '🇫🇮' },
      { code: 'DK', nameTr: 'Danimarka', nameEn: 'Denmark', flag: '🇩🇰' }
    ]
  },
  {
    id: 'asia_express',
    titleTr: 'Uzak Doğu Rüyası',
    titleEn: 'Far East Adventure',
    descTr: 'Gökdelenlerden tapınaklara, fütüristik şehirler ve egzotik lezzetler.',
    descEn: 'From towering skyscrapers to ancient shrines and exotic culinary worlds.',
    icon: '⛩️',
    color: '#ec4899',
    countries: [
      { code: 'JP', nameTr: 'Japonya', nameEn: 'Japan', flag: '🇯🇵' },
      { code: 'KR', nameTr: 'Güney Kore', nameEn: 'South Korea', flag: '🇰🇷' },
      { code: 'SG', nameTr: 'Singapur', nameEn: 'Singapore', flag: '🇸🇬' },
      { code: 'TH', nameTr: 'Tayland', nameEn: 'Thailand', flag: '🇹🇭' },
      { code: 'VN', nameTr: 'Vietnam', nameEn: 'Vietnam', flag: '🇻🇳' },
      { code: 'ID', nameTr: 'Endonezya', nameEn: 'Indonesia', flag: '🇮🇩' },
      { code: 'MY', nameTr: 'Malezya', nameEn: 'Malaysia', flag: '🇲🇾' }
    ]
  }
];

/**
 * Verilen keşif paketinin kullanıcının ziyaretlerine göre ilerleme durumunu hesaplar.
 * @param {Object} list - Keşif paketi nesnesi
 * @param {Object} worldVisits - Dünya ziyaretleri nesnesi
 * @param {Object} [turkeyVisits={}] - Türkiye illeri ziyaret nesnesi (TR tespiti için opsiyonel)
 * @returns {Object} İlerleme istatistiği
 */
export function calculateBucketListProgress(list, worldVisits = {}, turkeyVisits = {}) {
  if (!list || !Array.isArray(list.countries)) {
    return {
      total: 0,
      visited: 0,
      remaining: 0,
      percentage: 0,
      isCompleted: false,
      visitedCountries: [],
      remainingCountries: []
    };
  }

  const isCountryVisited = (c) => {
    const code = c.code;
    if (worldVisits && worldVisits[code] && worldVisits[code].status === 'visited') {
      return true;
    }
    if (code === 'TR') {
      if (worldVisits && worldVisits.TR && worldVisits.TR.status === 'visited') return true;
      if (turkeyVisits && typeof turkeyVisits === 'object' && Object.values(turkeyVisits).some(v => v?.status === 'visited')) return true;
    }
    return false;
  };

  const visitedCountries = list.countries.filter(isCountryVisited);
  const remainingCountries = list.countries.filter(c => !isCountryVisited(c));
  const total = list.countries.length;
  const visited = visitedCountries.length;
  const percentage = total > 0 ? Math.round((visited / total) * 100) : 0;

  return {
    total,
    visited,
    remaining: total - visited,
    percentage,
    isCompleted: total > 0 && visited === total,
    visitedCountries,
    remainingCountries
  };
}

export function applyBucketListToWishlist(listId) {
  const list = BUCKET_LISTS.find(l => l.id === listId);
  if (!list) return 0;
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('gittigim_yerler_world_v2') : null;
    const worldVisits = raw ? JSON.parse(raw) : {};
    let added = 0;
    const nowTs = Date.now();
    for (const c of list.countries) {
      if (!worldVisits[c.code] || (worldVisits[c.code].status !== 'visited' && worldVisits[c.code].status !== 'wishlist')) {
        worldVisits[c.code] = {
          ...(worldVisits[c.code] || {}),
          status: 'wishlist',
          updatedAt: nowTs
        };
        added++;
      }
    }
    if (added > 0 && typeof localStorage !== 'undefined') {
      localStorage.setItem('gittigim_yerler_world_v2', JSON.stringify(worldVisits));
      try { queueCloudSync(); } catch {}
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('GezginDataUpdated'));
      }
    }
    return added;
  } catch {
    return 0;
  }
}
