// bucketLists.js - Hazır Keşif Rotaları & Hedef Paketleri
import { getStorageData, saveWorldVisit } from '../utils/storage.js';

export const BUCKET_LISTS = [
  {
    id: 'wonders',
    icon: '🏛️',
    titleTr: 'Dünyanın 7 Harikası',
    titleEn: 'New 7 Wonders of the World',
    descTr: 'Antik ve modern dünyanın büyüleyici anıtları',
    descEn: 'Breathtaking monuments of ancient and modern human history',
    countries: ['IT', 'JO', 'IN', 'CN', 'MX', 'PE', 'BR']
  },
  {
    id: 'visa_free',
    icon: '✈️',
    titleTr: 'Vizesiz Favori Rotalar',
    titleEn: 'Top Visa-Free Destinations',
    descTr: 'Türk vatandaşları için vizesiz ve kolay seyahat rotaları',
    descEn: 'Hassle-free, top visa-free destinations',
    countries: ['RS', 'ME', 'BA', 'GE', 'AL', 'MK', 'XK']
  },
  {
    id: 'culture_capitals',
    icon: '🎨',
    titleTr: 'Avrupa Kültür Başkentleri',
    titleEn: 'European Cultural Capitals',
    descTr: 'Sanat, mimari ve tarihin kalbinin attığı Avrupa şehirleri',
    descEn: 'Epicenters of art, architecture and European culture',
    countries: ['FR', 'IT', 'ES', 'AT', 'CZ', 'NL', 'DE']
  },
  {
    id: 'ancient_civ',
    icon: '🏺',
    titleTr: 'Antik Medeniyetler',
    titleEn: 'Ancient Civilizations',
    descTr: 'İnsanlık tarihinin başladığı ve şekillendiği kadim topraklar',
    descEn: 'Cradles of ancient civilization and archaeological marvels',
    countries: ['TR', 'EG', 'GR', 'IT', 'IR', 'CN', 'MX']
  },
  {
    id: 'northern_lights',
    icon: '🌌',
    titleTr: 'Kuzey Işıkları & Fiyortlar',
    titleEn: 'Northern Lights & Fjords',
    descTr: 'Büyüleyici fiyortlar, kutup geceleri ve aurora manzaraları',
    descEn: 'Magical fjords, polar nights and aurora borealis',
    countries: ['NO', 'IS', 'FI', 'SE', 'DK']
  },
  {
    id: 'far_east',
    icon: '⛩️',
    titleTr: 'Uzak Doğu Rüyası',
    titleEn: 'Far East Dream',
    descTr: 'Gökdelenler, kadim tapınaklar ve egzotik lezzetler',
    descEn: 'Skyscrapers, ancient shrines and exotic traditions',
    countries: ['JP', 'KR', 'TH', 'VN', 'SG', 'MY', 'ID']
  }
];

export function calculateBucketListProgress(list, worldVisits = {}, turkeyCount = 0) {
  const countries = list.countries || [];
  let visitedCount = 0;
  let wishlistCount = 0;
  const countryStatuses = {};

  countries.forEach(code => {
    let status = 'unvisited';
    if (code === 'TR' && turkeyCount > 0) {
      status = 'visited';
    } else if (worldVisits[code] && worldVisits[code].status) {
      status = worldVisits[code].status;
    }
    countryStatuses[code] = status;
    if (status === 'visited') visitedCount++;
    else if (status === 'wishlist' || status === 'planned' || status === 'target') wishlistCount++;
  });

  const total = countries.length;
  const percent = total > 0 ? Math.round((visitedCount / total) * 100) : 0;
  const remainingCount = total - visitedCount;

  return {
    visitedCount,
    wishlistCount,
    total,
    percent,
    remainingCount,
    countryStatuses
  };
}

export function applyBucketListToWishlist(listId) {
  const list = BUCKET_LISTS.find(l => l.id === listId);
  if (!list) return 0;
  const { worldVisits, turkeyVisits } = getStorageData();
  const turkeyCount = Object.keys(turkeyVisits || {}).filter(k => turkeyVisits[k]?.status === 'visited').length;
  let addedCount = 0;

  list.countries.forEach(code => {
    const isVisited = (code === 'TR' && turkeyCount > 0) || (worldVisits[code]?.status === 'visited');
    if (!isVisited && (!worldVisits[code] || worldVisits[code].status !== 'wishlist')) {
      saveWorldVisit(code, 'wishlist');
      addedCount++;
    }
  });

  return addedCount;
}
