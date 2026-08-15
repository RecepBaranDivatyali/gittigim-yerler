import confetti from 'canvas-confetti';
import { TURKEY_PROVINCES } from '../data/turkeyData.js';
import { WORLD_COUNTRIES, TOTAL_WORLD_COUNTRIES_BENCHMARK } from '../data/worldData.js';

const STORAGE_KEYS = {
  TURKEY_VISITS: 'gittigim_yerler_turkey_v2',
  WORLD_VISITS: 'gittigim_yerler_world_v2',
  WORLD_CITIES: 'gittigim_yerler_cities_v2',
  USER_PROFILE: 'gittigim_yerler_profile_v2'
};

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

    const rawProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (rawProfile) userProfile = JSON.parse(rawProfile);
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
    turkeyVisits[provinceId] = {
      status, // 'visited' | 'target'
      date: details.date || new Date().toISOString().split('T')[0],
      notes: details.notes || '',
      rating: details.rating || 5
    };
    if (status === 'visited') {
      triggerConfetti();
    }
  }
  localStorage.setItem(STORAGE_KEYS.TURKEY_VISITS, JSON.stringify(turkeyVisits));
  notifyStateChange();
}

export function saveWorldVisit(countryCode, status, details = {}) {
  const { worldVisits } = getStorageData();
  if (status === 'unvisited' || !status) {
    delete worldVisits[countryCode];
  } else {
    worldVisits[countryCode] = {
      status, // 'visited' | 'target'
      date: details.date || new Date().toISOString().split('T')[0],
      notes: details.notes || ''
    };
    if (status === 'visited') {
      triggerConfetti();
    }
  }
  localStorage.setItem(STORAGE_KEYS.WORLD_VISITS, JSON.stringify(worldVisits));
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
      localStorage.setItem(STORAGE_KEYS.WORLD_VISITS, JSON.stringify(worldVisits));
    }
    triggerConfetti();
  } else {
    worldCities = worldCities.filter(c => !(c.countryCode === countryCode && c.cityName.toLowerCase() === cityName.toLowerCase()));
  }

  localStorage.setItem(STORAGE_KEYS.WORLD_CITIES, JSON.stringify(worldCities));
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
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gittigim-yerler-yedek-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function resetTravelData() {
  localStorage.removeItem(STORAGE_KEYS.TURKEY_VISITS);
  localStorage.removeItem(STORAGE_KEYS.WORLD_VISITS);
  localStorage.removeItem(STORAGE_KEYS.WORLD_CITIES);
  localStorage.removeItem('gv_unlocked_achievements');
  unlockedCache = [];
  notifyStateChange();
}

export function importBackup(fileContent) {
  try {
    const data = JSON.parse(fileContent);
    if (data.turkeyVisits) localStorage.setItem(STORAGE_KEYS.TURKEY_VISITS, JSON.stringify(data.turkeyVisits));
    if (data.worldVisits) localStorage.setItem(STORAGE_KEYS.WORLD_VISITS, JSON.stringify(data.worldVisits));
    if (data.worldCities) localStorage.setItem(STORAGE_KEYS.WORLD_CITIES, JSON.stringify(data.worldCities));
    if (data.userProfile) localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(data.userProfile));
    notifyStateChange();
    return true;
  } catch (e) {
    alert('Geçersiz yedek dosyası formatı!');
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
    localStorage.setItem('gv_unlocked_achievements', JSON.stringify(earnedIds));
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
