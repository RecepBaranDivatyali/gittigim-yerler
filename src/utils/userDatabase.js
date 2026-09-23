// userDatabase.js - Offline-First Community Traveler Database & Accounts
// Supports username-based friend search, 1-click comparison, and offline synchronization
import { searchCloudTravelers, getCloudTravelerProfile, queueCloudSync } from '../services/syncService.js';

const COMMUNITY_USERS_KEY = 'gv_community_travelers';
const CURRENT_ACCOUNT_KEY = 'gv_account';

// Pre-seeded verified traveler profiles so user can immediately test username search
const SEED_TRAVELERS = [
  {
    id: 'user_atlas_mert',
    username: 'atlas_mert',
    name: 'Mert Yılmaz',
    avatar: '🧭',
    bio: '42 ülke gezdim, sıradaki hedef Asya! 🌍✈️',
    homeCountry: 'TR',
    stats: { worldCountryCount: 42, turkeyCount: 38, worldCityCount: 84 },
    worldVisits: {
      'TR': { status: 'visited', rating: 10, entryDate: '2020-01-01', entryTransport: 'car', notes: 'Memleket' },
      'DE': { status: 'visited', rating: 9, entryDate: '2023-04-12', entryTransport: 'flight', notes: 'Berlin ve Münih harika' },
      'FR': { status: 'visited', rating: 9, entryDate: '2022-06-18', entryTransport: 'flight', notes: 'Paris sanat dolu' },
      'IT': { status: 'visited', rating: 10, entryDate: '2023-09-05', entryTransport: 'flight', notes: 'Roma ve Floransa mutfağı' },
      'ES': { status: 'visited', rating: 9, entryDate: '2023-08-20', entryTransport: 'flight', notes: 'Barselona mimarisi' },
      'GR': { status: 'visited', rating: 9, entryDate: '2022-07-14', entryTransport: 'ship', notes: 'Ege adaları ve Atina' },
      'NL': { status: 'visited', rating: 8, entryDate: '2023-05-01', entryTransport: 'flight', notes: 'Kanallar ve bisiklet turu' },
      'AT': { status: 'visited', rating: 8, entryDate: '2022-12-25', entryTransport: 'train', notes: 'Viyana kış pazarları' },
      'CH': { status: 'visited', rating: 10, entryDate: '2023-01-10', entryTransport: 'train', notes: 'Alpler manzarası nefes kesici' },
      'JP': { status: 'visited', rating: 10, entryDate: '2024-03-22', entryTransport: 'flight', notes: 'Tokyo ve Kyoto kiraz çiçekleri' },
      'US': { status: 'visited', rating: 9, entryDate: '2023-11-10', entryTransport: 'flight', notes: 'New York ve San Francisco' },
      'GB': { status: 'visited', rating: 8, entryDate: '2022-10-15', entryTransport: 'flight', notes: 'Londra müzeleri' },
      'PT': { status: 'visited', rating: 9, entryDate: '2023-09-18', entryTransport: 'flight', notes: 'Lizbon ve Porto pastel de nata' },
      'SE': { status: 'visited', rating: 8, entryDate: '2021-08-04', entryTransport: 'flight', notes: 'Stockholm adaları' },
      'NO': { status: 'visited', rating: 10, entryDate: '2022-08-12', entryTransport: 'flight', notes: 'Fiyortlar muazzam' }
    },
    turkeyVisits: {
      '34': { status: 'visited', rating: 10, notes: 'İstanbul' },
      '06': { status: 'visited', rating: 9, notes: 'Ankara' },
      '35': { status: 'visited', rating: 10, notes: 'İzmir' },
      '07': { status: 'visited', rating: 9, notes: 'Antalya' },
      '48': { status: 'visited', rating: 10, notes: 'Muğla' }
    },
    worldCities: [
      { countryCode: 'FR', cityName: 'Paris' },
      { countryCode: 'IT', cityName: 'Roma' },
      { countryCode: 'JP', cityName: 'Tokyo' },
      { countryCode: 'US', cityName: 'New York' },
      { countryCode: 'DE', cityName: 'Berlin' }
    ]
  },
  {
    id: 'user_selin_yollarda',
    username: 'selin_yollarda',
    name: 'Selin Doğan',
    avatar: '✈️',
    bio: 'Balkanlar ve Akdeniz aşığı gezgin 🎒🌅',
    homeCountry: 'TR',
    stats: { worldCountryCount: 28, turkeyCount: 45, worldCityCount: 56 },
    worldVisits: {
      'TR': { status: 'visited', rating: 10, notes: 'Evim' },
      'GR': { status: 'visited', rating: 10, notes: 'Selanik ve Rodos' },
      'BG': { status: 'visited', rating: 8, notes: 'Sofya ve Plovdiv' },
      'MK': { status: 'visited', rating: 9, notes: 'Üsküp ve Ohri Gölü' },
      'AL': { status: 'visited', rating: 8, notes: 'Tiran ve Saranda' },
      'ME': { status: 'visited', rating: 10, notes: 'Kotor Körfezi büyüleyici' },
      'BA': { status: 'visited', rating: 10, notes: 'Saraybosna ve Mostar Köprüsü' },
      'HR': { status: 'visited', rating: 9, notes: 'Dubrovnik ve Split' },
      'RS': { status: 'visited', rating: 8, notes: 'Belgrad' },
      'IT': { status: 'visited', rating: 10, notes: 'Venedik ve Milano' },
      'ES': { status: 'visited', rating: 9, notes: 'Madrid ve Sevilla' }
    },
    turkeyVisits: {
      '34': { status: 'visited', rating: 10 },
      '35': { status: 'visited', rating: 10 },
      '07': { status: 'visited', rating: 9 },
      '48': { status: 'visited', rating: 10 },
      '26': { status: 'visited', rating: 9 }
    },
    worldCities: [
      { countryCode: 'ME', cityName: 'Kotor' },
      { countryCode: 'BA', cityName: 'Saraybosna' },
      { countryCode: 'HR', cityName: 'Dubrovnik' },
      { countryCode: 'IT', cityName: 'Venedik' }
    ]
  },
  {
    id: 'user_bora_explorer',
    username: 'bora_explorer',
    name: 'Bora Aksoy',
    avatar: '🚀',
    bio: 'Dağlar, doğa ve kamp rotaları 🏕️🌲',
    homeCountry: 'TR',
    stats: { worldCountryCount: 19, turkeyCount: 52, worldCityCount: 41 },
    worldVisits: {
      'TR': { status: 'visited', rating: 10 },
      'GE': { status: 'visited', rating: 9, notes: 'Tiflis ve Kazbek Dağı' },
      'AZ': { status: 'visited', rating: 9, notes: 'Bakü ve Şeki' },
      'KZ': { status: 'visited', rating: 8, notes: 'Almatı doğası' },
      'KG': { status: 'visited', rating: 9, notes: 'Issık Göl' },
      'UZ': { status: 'visited', rating: 10, notes: 'Semerkant ve Buhara' },
      'IR': { status: 'visited', rating: 9, notes: 'İsfahan ve Şiraz' },
      'IS': { status: 'visited', rating: 10, notes: 'İzlanda şelaleleri' }
    },
    turkeyVisits: {
      '34': { status: 'visited', rating: 10 },
      '53': { status: 'visited', rating: 10, notes: 'Rize yaylaları' },
      '61': { status: 'visited', rating: 9, notes: 'Trabzon' },
      '08': { status: 'visited', rating: 10, notes: 'Artvin Karagöl' },
      '50': { status: 'visited', rating: 10, notes: 'Kapadokya' }
    },
    worldCities: [
      { countryCode: 'GE', cityName: 'Tiflis' },
      { countryCode: 'UZ', cityName: 'Semerkant' },
      { countryCode: 'IS', cityName: 'Reykjavik' }
    ]
  }
];

export function initCommunityDatabase() {
  try {
    const raw = localStorage.getItem(COMMUNITY_USERS_KEY);
    if (!raw) {
      localStorage.setItem(COMMUNITY_USERS_KEY, JSON.stringify(SEED_TRAVELERS));
    }
  } catch (e) {
    console.warn('Community DB init error', e);
  }
}

export function getAllCommunityTravelers() {
  try {
    initCommunityDatabase();
    const raw = localStorage.getItem(COMMUNITY_USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : SEED_TRAVELERS;
  } catch {
    return SEED_TRAVELERS;
  }
}

export function registerOrUpdateCurrentUser(profile, worldVisits, turkeyVisits, worldCities) {
  if (!profile || !profile.username) return;
  try {
    const users = getAllCommunityTravelers();
    const cleanUsername = profile.username.trim().toLowerCase().replace(/^@/, '');
    const userIndex = users.findIndex(u => u.username.toLowerCase() === cleanUsername);

    const countryCount = Object.keys(worldVisits || {}).filter(k => !k.includes('::') && worldVisits[k]?.status === 'visited').length;
    const turkeyCount = Object.keys(turkeyVisits || {}).filter(k => turkeyVisits[k]?.status === 'visited').length;
    const cityCount = Array.isArray(worldCities) ? worldCities.length : 0;

    const userEntry = {
      id: userIndex >= 0 ? users[userIndex].id : ('user_' + cleanUsername),
      username: cleanUsername,
      name: profile.name || profile.username,
      avatar: profile.avatar || '🧭',
      photoUrl: profile.photoUrl || null,
      bio: profile.bio || '',
      homeCountry: profile.homeCountry || 'TR',
      stats: { worldCountryCount: countryCount, turkeyCount, worldCityCount: cityCount },
      worldVisits: worldVisits || {},
      turkeyVisits: turkeyVisits || {},
      worldCities: worldCities || [],
      updatedAt: new Date().toISOString()
    };

    if (userIndex >= 0) {
      users[userIndex] = userEntry;
    } else {
      users.push(userEntry);
    }

    localStorage.setItem(COMMUNITY_USERS_KEY, JSON.stringify(users));
    try {
      queueCloudSync();
    } catch {}
  } catch (e) {
    console.warn('Error updating current user in community db', e);
  }
}

export function searchTravelersByUsername(query) {
  if (!query || typeof query !== 'string') return [];
  const cleanQ = query.trim().toLowerCase().replace(/^@/, '');
  if (!cleanQ || cleanQ.length < 3) return [];

  const all = getAllCommunityTravelers();
  return all.filter(u => {
    return u.username.toLowerCase().includes(cleanQ) || (u.name && u.name.toLowerCase().includes(cleanQ));
  });
}

/**
 * Searches travelers with instant local results plus background/live cloud query
 */
export async function searchTravelersByUsernameAsync(query) {
  const cleanQ = (query || '').trim().toLowerCase().replace(/^@/, '');
  if (!cleanQ || cleanQ.length < 3) return [];

  const localResults = searchTravelersByUsername(query);
  if (!navigator.onLine) return localResults;

  try {
    const cloudResults = await searchCloudTravelers(query);
    if (Array.isArray(cloudResults) && cloudResults.length > 0) {
      const mergedMap = new Map();
      localResults.forEach(u => mergedMap.set(u.username.toLowerCase(), u));
      cloudResults.forEach(u => {
        const k = u.username.toLowerCase();
        if (!mergedMap.has(k)) {
          mergedMap.set(k, {
            id: u.uid || ('user_' + k),
            username: u.username,
            name: u.displayName || u.username,
            avatar: u.avatar || '🧭',
            photoUrl: u.photoUrl || null,
            bio: u.bio || '',
            homeCountry: u.homeCountry || 'TR',
            stats: u.stats || { worldCountryCount: 0, turkeyCount: 0, worldCityCount: 0 },
            worldVisits: u.worldVisits || {},
            turkeyVisits: u.turkeyVisits || {},
            worldCities: u.worldCities || []
          });
        }
      });
      return Array.from(mergedMap.values());
    }
  } catch (e) {
    console.warn('Async cloud search fallback to local:', e);
  }

  return localResults;
}

export function getTravelerByUsername(username) {
  if (!username) return null;
  const clean = username.trim().toLowerCase().replace(/^@/, '');
  const all = getAllCommunityTravelers();
  return all.find(u => u.username.toLowerCase() === clean) || null;
}

export async function getTravelerByUsernameAsync(username) {
  const local = getTravelerByUsername(username);
  if (local && Object.keys(local.worldVisits || {}).length > 0) return local;
  if (!navigator.onLine) return local;

  try {
    const cloud = await getCloudTravelerProfile(username);
    if (cloud) return cloud;
  } catch (e) {
    console.warn('Async get traveler fallback to local:', e);
  }
  return local;
}

export function isUsernameAvailable(username, currentUserId = null) {
  if (!username || typeof username !== 'string') return false;
  const clean = username.trim().toLowerCase().replace(/^@/, '');
  if (!clean || clean.length < 3) return false;
  const users = getAllCommunityTravelers();
  const existing = users.find(u => u.username.toLowerCase() === clean);
  if (!existing) return true;
  if (currentUserId && existing.id === currentUserId) return true;
  return false;
}


