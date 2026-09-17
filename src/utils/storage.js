import { AIRLINE_ALLIANCES, ALL_AIRLINES, AIRCRAFT_MODELS, AIRCRAFT_FAMILIES, getAircraftBlueprint } from '../data/airlineData.js';
export { AIRLINE_ALLIANCES, ALL_AIRLINES, AIRCRAFT_MODELS, AIRCRAFT_FAMILIES, getAircraftBlueprint };
import confetti from 'canvas-confetti';
import { TURKEY_PROVINCES } from '../data/turkeyData.js';
import { WORLD_COUNTRIES, TOTAL_WORLD_COUNTRIES_BENCHMARK } from '../data/worldData.js';

export const STORAGE_KEYS = {
  TURKEY_VISITS: 'gittigim_yerler_turkey_v2',
  WORLD_VISITS: 'gittigim_yerler_world_v2',
  WORLD_CITIES: 'gittigim_yerler_cities_v2',
  USER_PROFILE: 'gittigim_yerler_profile_v2',
  BUCKET_RANKS: 'gittigim_yerler_bucket_ranks_v1',
  USER_AIRLINES: 'gittigim_yerler_airlines_v1',
  USER_AIRCRAFT: 'gittigim_yerler_aircraft_v1',
  SAVED_FRIENDS: 'gittigim_yerler_saved_friends_v1',
  USER_FEEDBACKS: 'gv_user_feedbacks_v1',
  FEEDBACK_STATUS_OVERRIDES: 'gv_feedback_status_overrides_v1',
  HOME_COUNTRY: 'gv_home_country'
};

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn('LocalStorage save error for key:', key, e);
  }
}

// Store default initial state
export function getStorageData() {
  let turkeyVisits = {};
  let worldVisits = {};
  let worldCities = [];
  let userProfile = { name: 'Gezgin', bio: 'Dünyayı keşfediyorum!' };

  try {
    const rawTurkey = localStorage.getItem(STORAGE_KEYS.TURKEY_VISITS);
    if (rawTurkey) turkeyVisits = JSON.parse(rawTurkey);

    const rawWorld = localStorage.getItem(STORAGE_KEYS.WORLD_VISITS);
    if (rawWorld) worldVisits = JSON.parse(rawWorld);

    const rawCities = localStorage.getItem(STORAGE_KEYS.WORLD_CITIES);
    if (rawCities) worldCities = JSON.parse(rawCities);

    const rawProfile = localStorage.getItem('gv_profile') || localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (rawProfile) {
      const parsed = JSON.parse(rawProfile);
      if (parsed && typeof parsed === 'object') userProfile = parsed;
    }
  } catch (err) {
    console.error('Error loading LocalStorage:', err);
  }

  return { turkeyVisits, worldVisits, worldCities, userProfile };
}

export function saveTurkeyVisit(provinceId, status, details = {}) {
  const { turkeyVisits } = getStorageData();
  if (status === 'unvisited' || !status) {
    delete turkeyVisits[provinceId];
  } else {
    const existing = turkeyVisits[provinceId] || {};
    turkeyVisits[provinceId] = {
      status,
      date: details.date || existing.date || new Date().toISOString().split('T')[0],
      notes: details.notes !== undefined ? details.notes : (existing.notes || ''),
      rating: details.rating !== undefined ? details.rating : (existing.rating || 0),
      entryDate: details.entryDate !== undefined ? details.entryDate : (existing.entryDate || ''),
      entryTransport: details.entryTransport !== undefined ? details.entryTransport : (existing.entryTransport || ''),
      exitDate: details.exitDate !== undefined ? details.exitDate : (existing.exitDate || ''),
      exitTransport: details.exitTransport !== undefined ? details.exitTransport : (existing.exitTransport || '')
    };
    if (status === 'visited') {
      triggerConfetti();
    }
  }
  safeSetItem(STORAGE_KEYS.TURKEY_VISITS, JSON.stringify(turkeyVisits));

  // Two-way synchronization with Turkey (TR) country status
  syncCountryFromSubdivision('TR', status);

  notifyStateChange();
}

export function syncCountryFromSubdivision(countryCode, subStatus) {
  if (!countryCode) return;
  const { worldVisits } = getStorageData();
  const currentCountry = worldVisits[countryCode] || {};
  const currentStatus = currentCountry.status || 'unvisited';

  if (subStatus === 'visited') {
    if (currentStatus !== 'visited') {
      worldVisits[countryCode] = {
        ...currentCountry,
        status: 'visited',
        date: currentCountry.date || new Date().toISOString().split('T')[0],
        notes: currentCountry.notes || 'Alt bölge ziyareti ile otomatik işaretlendi'
      };
      safeSetItem(STORAGE_KEYS.WORLD_VISITS, JSON.stringify(worldVisits));
    }
  } else if (subStatus === 'planned') {
    // Only upgrade to planned if not already visited
    if (currentStatus !== 'visited' && currentStatus !== 'planned') {
      worldVisits[countryCode] = {
        ...currentCountry,
        status: 'planned',
        date: currentCountry.date || new Date().toISOString().split('T')[0]
      };
      safeSetItem(STORAGE_KEYS.WORLD_VISITS, JSON.stringify(worldVisits));
    }
  } else if (subStatus === 'wishlist') {
    // Only upgrade to wishlist if unvisited
    if (currentStatus === 'unvisited' || !currentStatus) {
      worldVisits[countryCode] = {
        ...currentCountry,
        status: 'wishlist',
        date: currentCountry.date || new Date().toISOString().split('T')[0]
      };
      safeSetItem(STORAGE_KEYS.WORLD_VISITS, JSON.stringify(worldVisits));
    }
  }
}

export function saveWorldVisit(countryCode, status, details = {}) {
  const { worldVisits } = getStorageData();
  if (status === 'unvisited' || !status) {
    delete worldVisits[countryCode];
  } else {
    const existing = worldVisits[countryCode] || {};
    worldVisits[countryCode] = {
      status,
      date: details.date || existing.date || new Date().toISOString().split('T')[0],
      notes: details.notes !== undefined ? details.notes : (existing.notes || ''),
      rating: details.rating !== undefined ? details.rating : (existing.rating || 0),
      entryDate: details.entryDate !== undefined ? details.entryDate : (existing.entryDate || ''),
      entryTransport: details.entryTransport !== undefined ? details.entryTransport : (existing.entryTransport || ''),
      exitDate: details.exitDate !== undefined ? details.exitDate : (existing.exitDate || ''),
      exitTransport: details.exitTransport !== undefined ? details.exitTransport : (existing.exitTransport || '')
    };
    if (status === 'visited') {
      triggerConfetti();
    }
  }
  safeSetItem(STORAGE_KEYS.WORLD_VISITS, JSON.stringify(worldVisits));

  // If this is a region/subregion (contains '::'), synchronize with parent country
  if (countryCode.includes('::')) {
    const parentCode = countryCode.split('::')[0];
    syncCountryFromSubdivision(parentCode, status);
  }

  notifyStateChange();
}

export function toggleWorldCity(countryCode, cityName, isVisited, notes = '') {
  let { worldCities, worldVisits } = getStorageData();
  
  if (isVisited) {
    const exists = worldCities.some(c => c.countryCode === countryCode && c.cityName.toLowerCase() === cityName.toLowerCase());
    if (!exists) {
      worldCities.push({ countryCode, cityName, date: new Date().toISOString().split('T')[0], notes });
    }
    // Auto-mark country as visited if not already
    if (!worldVisits[countryCode] || worldVisits[countryCode].status !== 'visited') {
      worldVisits[countryCode] = { status: 'visited', date: new Date().toISOString().split('T')[0], notes: 'Şehir ziyareti ile otomatik işaretlendi' };
      safeSetItem(STORAGE_KEYS.WORLD_VISITS, JSON.stringify(worldVisits));
    }
    triggerConfetti();
  } else {
    worldCities = worldCities.filter(c => !(c.countryCode === countryCode && c.cityName.toLowerCase() === cityName.toLowerCase()));
  }

  safeSetItem(STORAGE_KEYS.WORLD_CITIES, JSON.stringify(worldCities));
  notifyStateChange();
}

export function triggerConfetti() {
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  } catch (e) {
    // Ignore if canvas confetti not active
  }
}

export function calculateStats() {
  const { turkeyVisits, worldVisits, worldCities } = getStorageData();

  // Turkey stats
  const turkeyVisitedIds = Object.keys(turkeyVisits).filter(id => turkeyVisits[id].status === 'visited');
  const turkeyTargetIds = Object.keys(turkeyVisits).filter(id => turkeyVisits[id].status === 'target');
  const turkeyCount = turkeyVisitedIds.length;
  const turkeyPercentage = ((turkeyCount / 81) * 100).toFixed(1);

  // Region breakdown
  const regionCounts = {};
  TURKEY_PROVINCES.forEach(p => {
    if (turkeyVisits[p.id]?.status === 'visited') {
      regionCounts[p.region] = (regionCounts[p.region] || 0) + 1;
    }
  });

  // World stats
  const worldVisitedCodes = Object.keys(worldVisits).filter(code => !code.includes('::') && worldVisits[code]?.status === 'visited');
  const worldTargetCodes = Object.keys(worldVisits).filter(code => !code.includes('::') && (worldVisits[code]?.status === 'planned' || worldVisits[code]?.status === 'target'));
  
  // Include Turkey in worldVisitedCodes if at least 1 Turkish province is visited
  if (turkeyCount > 0 && !worldVisitedCodes.includes('TR')) {
    worldVisitedCodes.push('TR');
  }

  const worldCountryCount = worldVisitedCodes.length;
  const worldPercentage = ((worldCountryCount / TOTAL_WORLD_COUNTRIES_BENCHMARK) * 100).toFixed(1);

  // Continent breakdown
  const continentCounts = {};
  WORLD_COUNTRIES.forEach(c => {
    if (worldVisits[c.code]?.status === 'visited' || (c.code === 'TR' && turkeyCount > 0)) {
      continentCounts[c.continent] = (continentCounts[c.continent] || 0) + 1;
    }
  });

  const markedRegionCount = Object.keys(worldVisits).filter(code => code.includes('::') && worldVisits[code]?.status === 'visited').length;
  const worldCityCount = Math.max(worldCities.length, markedRegionCount) + turkeyCount;

  return {
    turkeyCount,
    turkeyTargetCount: turkeyTargetIds.length,
    turkeyPercentage,
    regionCounts,
    worldCountryCount,
    worldTargetCount: worldTargetCodes.length,
    worldPercentage,
    continentCounts,
    worldCityCount,
    totalPlacesMarked: turkeyCount + worldCountryCount
  };
}

export function exportBackup() {
  const data = getStorageData();
  let userProfile = null;
  try {
    const raw = localStorage.getItem('gv_profile');
    if (raw) userProfile = JSON.parse(raw);
  } catch {}

  const backupPayload = {
    ...data,
    profile: userProfile || data.userProfile,
    userProfile: userProfile || data.userProfile,
    userAirlines: getUserAirlines(),
    userAircraft: getUserAircraft(),
    bucketRanks: getBucketRanks(),
    savedFriends: getSavedFriends(),
    userFeedbacks: getUserFeedbacks(),
    feedbackOverrides: getFeedbackStatusOverrides(),
    homeCountry: getHomeCountry(),
    exportedAt: new Date().toISOString()
  };
  const jsonStr = JSON.stringify(backupPayload, null, 2);
  if (typeof document !== 'undefined' && typeof Blob !== 'undefined' && typeof URL !== 'undefined' && URL.createObjectURL) {
    try {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gittigim-yerler-yedek-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  }
  return jsonStr;
}

export function resetTravelData() {
  localStorage.removeItem(STORAGE_KEYS.TURKEY_VISITS);
  localStorage.removeItem(STORAGE_KEYS.WORLD_VISITS);
  localStorage.removeItem(STORAGE_KEYS.WORLD_CITIES);
  localStorage.removeItem('gv_unlocked_achievements');
  localStorage.removeItem(STORAGE_KEYS.BUCKET_RANKS);
  localStorage.removeItem(STORAGE_KEYS.USER_AIRLINES);
  localStorage.removeItem(STORAGE_KEYS.USER_AIRCRAFT);
  localStorage.removeItem(STORAGE_KEYS.HOME_COUNTRY);
  unlockedCache = [];
  notifyStateChange();
}

export function importBackup(fileContent) {
  try {
    const data = JSON.parse(fileContent);
    if (data.turkeyVisits) safeSetItem(STORAGE_KEYS.TURKEY_VISITS, JSON.stringify(data.turkeyVisits));
    if (data.worldVisits) safeSetItem(STORAGE_KEYS.WORLD_VISITS, JSON.stringify(data.worldVisits));
    if (data.worldCities) safeSetItem(STORAGE_KEYS.WORLD_CITIES, JSON.stringify(data.worldCities));
    const prof = data.profile || data.userProfile;
    if (prof) {
      safeSetItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(prof));
      safeSetItem('gv_profile', JSON.stringify(prof));
    }
    if (data.userAirlines) safeSetItem(STORAGE_KEYS.USER_AIRLINES, JSON.stringify(data.userAirlines));
    if (data.userAircraft) safeSetItem(STORAGE_KEYS.USER_AIRCRAFT, JSON.stringify(data.userAircraft));
    if (data.bucketRanks) safeSetItem(STORAGE_KEYS.BUCKET_RANKS, JSON.stringify(data.bucketRanks));
    if (data.savedFriends) safeSetItem(STORAGE_KEYS.SAVED_FRIENDS, JSON.stringify(data.savedFriends));
    if (data.userFeedbacks) safeSetItem(STORAGE_KEYS.USER_FEEDBACKS, JSON.stringify(data.userFeedbacks));
    if (data.feedbackOverrides) safeSetItem(STORAGE_KEYS.FEEDBACK_STATUS_OVERRIDES, JSON.stringify(data.feedbackOverrides));
    if (data.homeCountry) setHomeCountry(data.homeCountry);
    notifyStateChange();
    return true;
  } catch (e) {
    if (typeof alert !== 'undefined') alert('Geçersiz yedek dosyası formatı!');
    else console.warn('Geçersiz yedek dosyası formatı:', e);
    return false;
  }
}

import { getEarnedAchievements } from '../data/achievements.js';
import { notifyAchievementUnlocked } from './notifications.js';

// Event system for real-time UI reactive updates
const listeners = [];
export function onStateChange(callback) {
  listeners.push(callback);
}

let unlockedCache = null;
function getUnlockedCache() {
  if (unlockedCache === null) {
    try {
      const raw = localStorage.getItem('gv_unlocked_achievements');
      unlockedCache = raw ? JSON.parse(raw) : [];
    } catch {
      unlockedCache = [];
    }
  }
  return unlockedCache;
}

export function checkAndNotifyAchievements(storageData, baseStats) {
  try {
    const earned = getEarnedAchievements(storageData, baseStats);
    const earnedIds = earned.map(a => a.id);
    const unlocked = getUnlockedCache();

    const newlyUnlocked = earned.filter(a => !unlocked.includes(a.id));
    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach(a => {
        notifyAchievementUnlocked(a);
      });
    }

    unlockedCache = earnedIds;
    safeSetItem('gv_unlocked_achievements', JSON.stringify(earnedIds));
  } catch (e) {
    console.error('Achievement check error', e);
  }
}

function notifyStateChange() {
  const sData = getStorageData();
  const sStats = calculateStats();
  checkAndNotifyAchievements(sData, sStats);
  listeners.forEach(cb => cb(sData, sStats));
}

// ─── Bucket List Priority Rankings ───────────────────────────────────────────
export function getBucketRanks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUCKET_RANKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBucketRanks(ranks) {
  try {
    safeSetItem(STORAGE_KEYS.BUCKET_RANKS, JSON.stringify(ranks));
    notifyStateChange();
  } catch (e) {
    console.error('Error saving bucket ranks', e);
  }
}

// ─── User Airlines Tracker ────────────────────────────────────────────────────
export function getUserAirlines() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_AIRLINES);
    const data = raw ? JSON.parse(raw) : {};
    let changed = false;
    for (const airline of ALL_AIRLINES) {
      if (airline.code && data[airline.id]) {
        const siblings = ALL_AIRLINES.filter(a => a.code === airline.code);
        for (const sib of siblings) {
          if (!data[sib.id]) {
            data[sib.id] = { ...data[airline.id] };
            changed = true;
          }
        }
      }
    }
    if (changed) {
      saveUserAirlines(data);
    }
    return data;
  } catch {
    return {};
  }
}

export function saveUserAirlines(airlines) {
  try {
    safeSetItem(STORAGE_KEYS.USER_AIRLINES, JSON.stringify(airlines));
    notifyStateChange();
  } catch (e) {
    console.error('Error saving user airlines', e);
  }
}

export function toggleUserAirline(airlineId, flightsCount = 1) {
  const data = getUserAirlines();
  const currentItem = ALL_AIRLINES.find(a => a.id === airlineId);
  const targetCode = currentItem?.code;

  // Find all airline IDs that represent the same airline (e.g. 'thy' and 'thy_star' for TK)
  const matchingIds = targetCode
    ? ALL_AIRLINES.filter(a => a.code === targetCode).map(a => a.id)
    : [airlineId];

  const willRemove = !!data[airlineId];

  matchingIds.forEach(id => {
    if (willRemove) {
      delete data[id];
    } else {
      data[id] = { flown: true, count: Math.max(1, flightsCount), date: new Date().toISOString().split('T')[0] };
    }
  });

  saveUserAirlines(data);
  return data;
}

// ─── Saved Friends System ─────────────────────────────────────────────────────
export function getSavedFriends() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_FRIENDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFriend(friendObj) {
  const friends = getSavedFriends();
  const existingIdx = friends.findIndex(f => f.id === friendObj.id || (f.username && f.username.toLowerCase() === friendObj.username.toLowerCase()));
  if (existingIdx >= 0) {
    friends[existingIdx] = { ...friends[existingIdx], ...friendObj, updatedAt: new Date().toISOString() };
  } else {
    friends.push({
      id: friendObj.id || 'f_' + Date.now(),
      username: friendObj.username || 'Arkadaş',
      avatar: friendObj.avatar || '🌍',
      bio: friendObj.bio || '',
      code: friendObj.code || '',
      data: friendObj.data || null,
      savedAt: new Date().toISOString()
    });
  }
  safeSetItem(STORAGE_KEYS.SAVED_FRIENDS, JSON.stringify(friends));
  notifyStateChange();
  return friends;
}

export function deleteFriend(friendId) {
  const friends = getSavedFriends().filter(f => f.id !== friendId);
  safeSetItem(STORAGE_KEYS.SAVED_FRIENDS, JSON.stringify(friends));
  notifyStateChange();
  return friends;
}

// ─── Aircraft Fleet Tracker ──────────────────────────────────────────────────
export function getUserAircraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_AIRCRAFT);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveUserAircraft(aircraft) {
  try {
    safeSetItem(STORAGE_KEYS.USER_AIRCRAFT, JSON.stringify(aircraft));
    notifyStateChange();
  } catch (e) {
    console.error('Error saving user aircraft', e);
  }
}

export function toggleUserAircraft(modelId) {
  const data = getUserAircraft();
  if (data[modelId]) {
    delete data[modelId];
  } else {
    data[modelId] = { flown: true, date: new Date().toISOString().split('T')[0] };
  }
  saveUserAircraft(data);
  return data;
}


// ─── Feedback & Bug Report Tracker ──────────────────────────────────────────
export function getUserFeedbacks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_FEEDBACKS);
    const parsed = raw ? JSON.parse(raw) : null;
    let feedbacks = Array.isArray(parsed) ? parsed : [];
    
    // Apply any status overrides (e.g. from developer/admin or shared status)
    const overrides = getFeedbackStatusOverrides();
    return feedbacks.map(fb => {
      if (overrides[fb.id]) {
        return { ...fb, ...overrides[fb.id] };
      }
      return fb;
    });
  } catch {
    return [];
  }
}

export function saveUserFeedback(item) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_FEEDBACKS);
    const parsed = raw ? JSON.parse(raw) : null;
    let feedbacks = Array.isArray(parsed) ? parsed : [];
    
    const feedbackObj = {
      id: item.id || ('fb_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)),
      type: item.type || 'suggestion',
      message: item.message || '',
      contact: item.contact || '',
      username: item.username || 'Gezgin',
      status: item.status || 'pending', // pending, considering, in_progress, resolved, declined
      synced: item.synced === true, // true if sent to server, false if offline/pending
      devResponse: item.devResponse || '',
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    feedbacks.unshift(feedbackObj);
    safeSetItem(STORAGE_KEYS.USER_FEEDBACKS, JSON.stringify(feedbacks));
    notifyStateChange();
    return feedbackObj;
  } catch (e) {
    console.error('Error saving user feedback', e);
    return item;
  }
}

export async function syncPendingFeedbacks() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_FEEDBACKS);
    if (!raw) return true;
    let feedbacks = JSON.parse(raw);
    if (!Array.isArray(feedbacks) || feedbacks.length === 0) return true;

    const pending = feedbacks.filter(fb => fb.synced === false);
    if (pending.length === 0) return true;

    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const apiUrl = isLocal && !(typeof window !== 'undefined' && window.Capacitor)
      ? 'https://gittigim-yerler.vercel.app/api/feedback'
      : '/api/feedback';

    let updated = false;
    for (const fb of pending) {
      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: fb.id,
            type: fb.type,
            message: fb.message,
            contact: fb.contact,
            username: fb.username
          })
        });
        if (res.ok) {
          fb.synced = true;
          fb.syncedAt = new Date().toISOString();
          updated = true;
        }
      } catch (err) {
        console.warn('Sync pending feedback deferred for item:', fb.id, err);
      }
    }

    if (updated) {
      safeSetItem(STORAGE_KEYS.USER_FEEDBACKS, JSON.stringify(feedbacks));
      notifyStateChange();
    }
    return true;
  } catch (e) {
    console.error('Error syncing pending feedbacks', e);
    return false;
  }
}

export function getFeedbackStatusOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FEEDBACK_STATUS_OVERRIDES);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function updateFeedbackStatus(id, newStatus, devResponse = '') {
  try {
    const overrides = getFeedbackStatusOverrides();
    overrides[id] = {
      status: newStatus,
      devResponse: devResponse !== undefined ? devResponse : (overrides[id]?.devResponse || ''),
      updatedAt: new Date().toISOString()
    };
    safeSetItem(STORAGE_KEYS.FEEDBACK_STATUS_OVERRIDES, JSON.stringify(overrides));
    
    // Also update directly in user feedbacks if present
    const raw = localStorage.getItem(STORAGE_KEYS.USER_FEEDBACKS);
    const parsed = raw ? JSON.parse(raw) : null;
    let feedbacks = Array.isArray(parsed) ? parsed : [];
    const idx = feedbacks.findIndex(f => f.id === id);
    if (idx !== -1) {
      feedbacks[idx].status = newStatus;
      if (devResponse) feedbacks[idx].devResponse = devResponse;
      feedbacks[idx].updatedAt = new Date().toISOString();
      safeSetItem(STORAGE_KEYS.USER_FEEDBACKS, JSON.stringify(feedbacks));
    }
    
    notifyStateChange();
    return true;
  } catch (e) {
    console.error('Error updating feedback status', e);
    return false;
  }
}

export function deleteUserFeedback(id) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_FEEDBACKS);
    const parsed = raw ? JSON.parse(raw) : null;
    let feedbacks = Array.isArray(parsed) ? parsed : [];
    feedbacks = feedbacks.filter(f => f.id !== id);
    safeSetItem(STORAGE_KEYS.USER_FEEDBACKS, JSON.stringify(feedbacks));
    
    // Also clean override if present
    const overrides = getFeedbackStatusOverrides();
    if (overrides[id]) {
      delete overrides[id];
      safeSetItem(STORAGE_KEYS.FEEDBACK_STATUS_OVERRIDES, JSON.stringify(overrides));
    }
    
    notifyStateChange();
    return true;
  } catch (e) {
    console.error('Error deleting feedback', e);
    return false;
  }
}

// ─── Home Country Selection ───────────────────────────────────────────────────
export function getHomeCountry() {
  try {
    return localStorage.getItem(STORAGE_KEYS.HOME_COUNTRY) || 'TR';
  } catch {
    return 'TR';
  }
}

export function setHomeCountry(code) {
  try {
    safeSetItem(STORAGE_KEYS.HOME_COUNTRY, code || 'TR');
  } catch (e) {
    console.warn('Error saving home country', e);
  }
  notifyStateChange();
}

// ─── Passport Type (Bordo / Yesil) ───────────────────────────────────────────
export function getPassportType() {
  try {
    return localStorage.getItem('gv_passport_type') || 'bordo';
  } catch {
    return 'bordo';
  }
}

export function setPassportType(type) {
  try {
    safeSetItem('gv_passport_type', type === 'yesil' ? 'yesil' : 'bordo');
  } catch (e) {
    console.warn('Error saving passport type', e);
  }
  notifyStateChange();
}
