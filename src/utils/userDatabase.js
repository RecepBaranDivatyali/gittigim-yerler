// userDatabase.js - Offline-First Community Traveler Database & Accounts
// Supports username-based friend search, 1-click comparison, and offline synchronization
import { searchCloudTravelers, getCloudTravelerProfile, queueCloudSync } from '../services/syncService.js';
import { sendTripInvitation } from './notificationSystem.js';

const COMMUNITY_USERS_KEY = 'gv_community_travelers';
const CURRENT_ACCOUNT_KEY = 'gv_account';

// No mock/fake seed travelers — only genuine registered traveler profiles
const SEED_TRAVELERS = [];

export function initCommunityDatabase() {
  try {
    const raw = localStorage.getItem(COMMUNITY_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Clean out legacy mock accounts if still present in user storage
        const deadIds = new Set(['user_atlas_mert', 'user_selin_yollarda', 'user_bora_explorer', 'atlas_mert', 'selin_yollarda', 'bora_explorer']);
        const cleaned = parsed.filter(u => !deadIds.has(u.id) && !deadIds.has(u.username?.toLowerCase()));
        localStorage.setItem(COMMUNITY_USERS_KEY, JSON.stringify(cleaned));
      }
    } else {
      localStorage.setItem(COMMUNITY_USERS_KEY, JSON.stringify([]));
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
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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

export async function syncTripToBuddy(buddyUsername, placeId, visitData, currentUserProfile) {
  if (!buddyUsername || !placeId) return;
  try {
    const cleanBuddy = buddyUsername.trim().toLowerCase().replace(/^@/, '');
    if (!cleanBuddy) return;

    // Dispatch official pending notification for the buddy so they can review and approve it
    await sendTripInvitation({
      fromProfile: currentUserProfile,
      toUsername: cleanBuddy,
      placeId,
      placeName: visitData?.placeName || placeId,
      visitData
    });
  } catch (err) {
    console.warn('syncTripToBuddy error:', err);
  }
}


