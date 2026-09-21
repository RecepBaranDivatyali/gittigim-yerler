// syncService.js - Firebase Firestore Offline-First Cloud Sync Engine
import { db, auth } from './firebase.js';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  limit,
  serverTimestamp
} from 'firebase/firestore';

let syncStatus = navigator.onLine ? 'synced' : 'offline';
let lastSyncTime = null;
let syncTimeout = null;
const statusListeners = new Set();

export function getSyncStatus() {
  return {
    status: syncStatus, // 'synced' | 'syncing' | 'offline' | 'error'
    lastSyncTime,
    isOnline: navigator.onLine
  };
}

export function onSyncStatusChange(callback) {
  if (typeof callback === 'function') {
    statusListeners.add(callback);
    callback(getSyncStatus());
    return () => statusListeners.delete(callback);
  }
  return () => {};
}

function notifyStatus(newStatus) {
  syncStatus = newStatus;
  if (newStatus === 'synced') {
    lastSyncTime = new Date();
  }
  const current = getSyncStatus();
  statusListeners.forEach(cb => {
    try { cb(current); } catch (e) { console.error('Sync status listener error:', e); }
  });
}

// Global Online / Offline event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    notifyStatus('syncing');
    queueCloudSync(true);
  });
  window.addEventListener('offline', () => {
    notifyStatus('offline');
  });
}

/**
 * Get the current active user identifier for Firestore document
 */
export function getCurrentUserIdentifier() {
  if (auth?.currentUser?.uid) {
    return auth.currentUser.uid;
  }
  try {
    const pStr = localStorage.getItem('gv_profile') || sessionStorage.getItem('gv_profile');
    if (pStr) {
      const p = JSON.parse(pStr);
      if (p && p.username) {
        return 'user_' + p.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      }
    }
  } catch {}
  return null;
}

/**
 * Gather all local storage state to pack into cloud document
 */
export function getLocalDataPayload() {
  let worldVisits = {};
  let turkeyVisits = {};
  let worldCities = [];
  let userVisas = [];
  let userPlaces = {};
  let notes = {};
  let ratings = {};
  let bucketRanks = [];
  let airlines = [];
  let aircraft = [];
  let profile = { username: 'Gezgin', avatar: '🧭' };
  let homeCountry = 'TR';

  try {
    worldVisits = JSON.parse(localStorage.getItem('gittigim_yerler_world_v2') || '{}');
    turkeyVisits = JSON.parse(localStorage.getItem('gittigim_yerler_turkey_v2') || '{}');
    worldCities = JSON.parse(localStorage.getItem('gittigim_yerler_cities_v2') || '[]');
    userVisas = JSON.parse(localStorage.getItem('gittigim_yerler_user_visas_v1') || '[]');
    userPlaces = JSON.parse(localStorage.getItem('gittigim_yerler_user_places_v1') || '{}');
    notes = JSON.parse(localStorage.getItem('gittigim_yerler_country_notes_v1') || '{}');
    ratings = JSON.parse(localStorage.getItem('gittigim_yerler_country_ratings_v1') || '{}');
    bucketRanks = JSON.parse(localStorage.getItem('gittigim_yerler_bucket_ranks_v1') || '[]');
    airlines = JSON.parse(localStorage.getItem('gittigim_yerler_airlines_v1') || '[]');
    aircraft = JSON.parse(localStorage.getItem('gittigim_yerler_aircraft_v1') || '[]');
    homeCountry = localStorage.getItem('gv_home_country') || 'TR';

    const pStr = localStorage.getItem('gv_profile') || sessionStorage.getItem('gv_profile');
    if (pStr) profile = JSON.parse(pStr);
  } catch (err) {
    console.warn('Error reading local data payload for cloud sync:', err);
  }

  const cleanUsername = (profile.username || 'gezgin').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

  return {
    userId: getCurrentUserIdentifier(),
    username: cleanUsername,
    displayName: profile.username || 'Gezgin',
    avatar: profile.avatar || '🧭',
    photoUrl: profile.photoUrl || null,
    bio: profile.bio || '',
    homeCountry,
    stats: {
      worldCountryCount: Object.keys(worldVisits).filter(k => !k.includes('::') && worldVisits[k]?.status === 'visited').length,
      turkeyCount: Object.keys(turkeyVisits).filter(k => turkeyVisits[k]?.status === 'visited').length,
      worldCityCount: Array.isArray(worldCities) ? worldCities.length : 0,
      visasCount: Array.isArray(userVisas) ? userVisas.length : 0
    },
    worldVisits,
    turkeyVisits,
    worldCities,
    userVisas,
    userPlaces,
    notes,
    ratings,
    bucketRanks,
    airlines,
    aircraft,
    clientUpdatedAt: new Date().toISOString()
  };
}

/**
 * Debounced queue function to sync data to Firestore.
 * Automatically handles offline writes (Firestore caches into IndexedDB).
 */
export function queueCloudSync(force = false) {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
    syncTimeout = null;
  }

  const doSync = async () => {
    const userDocId = getCurrentUserIdentifier();
    if (!userDocId) {
      // User is not logged in yet, local storage remains active
      return;
    }

    if (!navigator.onLine) {
      notifyStatus('offline');
    } else {
      notifyStatus('syncing');
    }

    try {
      const payload = getLocalDataPayload();
      const userRef = doc(db, 'users', userDocId);

      // setDoc with merge: true writes to IndexedDB cache immediately (0ms)
      // and automatically queues network synchronization with Firestore
      await setDoc(userRef, {
        ...payload,
        serverUpdatedAt: serverTimestamp()
      }, { merge: true });

      // Also register or update username directory for global friend searches
      if (payload.username) {
        const usernameRef = doc(db, 'usernames', payload.username);
        await setDoc(usernameRef, {
          uid: userDocId,
          username: payload.username,
          displayName: payload.displayName,
          avatar: payload.avatar,
          photoUrl: payload.photoUrl,
          stats: payload.stats,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      if (navigator.onLine) {
        notifyStatus('synced');
      } else {
        notifyStatus('offline');
      }
    } catch (err) {
      console.warn('Cloud sync error (stored in offline cache if available):', err);
      if (!navigator.onLine) {
        notifyStatus('offline');
      } else {
        notifyStatus('error');
      }
    }
  };

  if (force) {
    return doSync();
  }

  // 1200ms debounce to prevent burst network queries during rapid clicks
  syncTimeout = setTimeout(doSync, 1200);
}

/**
 * Fetch cloud data for user and merge into LocalStorage
 */
export async function fetchAndMergeUserDataFromCloud(userIdOrUsername = null) {
  const targetId = userIdOrUsername || getCurrentUserIdentifier();
  if (!targetId) return null;

  try {
    notifyStatus('syncing');
    const userRef = doc(db, 'users', targetId);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();

      // Merge into local storage
      if (data.worldVisits && typeof data.worldVisits === 'object') {
        const localWorld = JSON.parse(localStorage.getItem('gittigim_yerler_world_v2') || '{}');
        const mergedWorld = { ...data.worldVisits, ...localWorld };
        localStorage.setItem('gittigim_yerler_world_v2', JSON.stringify(mergedWorld));
      }

      if (data.turkeyVisits && typeof data.turkeyVisits === 'object') {
        const localTR = JSON.parse(localStorage.getItem('gittigim_yerler_turkey_v2') || '{}');
        const mergedTR = { ...data.turkeyVisits, ...localTR };
        localStorage.setItem('gittigim_yerler_turkey_v2', JSON.stringify(mergedTR));
      }

      if (Array.isArray(data.userVisas) && data.userVisas.length > 0) {
        const localVisas = JSON.parse(localStorage.getItem('gittigim_yerler_user_visas_v1') || '[]');
        const existingIds = new Set(localVisas.map(v => v.id));
        data.userVisas.forEach(v => {
          if (!existingIds.has(v.id)) localVisas.push(v);
        });
        localStorage.setItem('gittigim_yerler_user_visas_v1', JSON.stringify(localVisas));
      }

      if (data.userPlaces && typeof data.userPlaces === 'object') {
        const localPlaces = JSON.parse(localStorage.getItem('gittigim_yerler_user_places_v1') || '{}');
        const mergedPlaces = { ...data.userPlaces, ...localPlaces };
        localStorage.setItem('gittigim_yerler_user_places_v1', JSON.stringify(mergedPlaces));
      }

      if (data.notes && typeof data.notes === 'object') {
        const localNotes = JSON.parse(localStorage.getItem('gittigim_yerler_country_notes_v1') || '{}');
        localStorage.setItem('gittigim_yerler_country_notes_v1', JSON.stringify({ ...data.notes, ...localNotes }));
      }

      if (data.ratings && typeof data.ratings === 'object') {
        const localRatings = JSON.parse(localStorage.getItem('gittigim_yerler_country_ratings_v1') || '{}');
        localStorage.setItem('gittigim_yerler_country_ratings_v1', JSON.stringify({ ...data.ratings, ...localRatings }));
      }

      notifyStatus('synced');
      return data;
    }
  } catch (err) {
    console.warn('Could not fetch cloud data, using offline state:', err);
    notifyStatus(navigator.onLine ? 'error' : 'offline');
  }
  return null;
}

/**
 * Search registered travelers in Firestore
 */
export async function searchCloudTravelers(searchQuery) {
  if (!searchQuery || typeof searchQuery !== 'string') return [];
  const cleanQ = searchQuery.trim().toLowerCase().replace(/^@/, '');
  if (!cleanQ) return [];

  try {
    const q = query(collection(db, 'usernames'), limit(20));
    const snapshot = await getDocs(q);
    const results = [];
    snapshot.forEach(docSnap => {
      const u = docSnap.data();
      if (u && (u.username?.includes(cleanQ) || u.displayName?.toLowerCase().includes(cleanQ))) {
        results.push(u);
      }
    });
    return results;
  } catch (err) {
    console.warn('Error querying Firestore for travelers:', err);
    return [];
  }
}

/**
 * Fetch a full public profile of a traveler by username
 */
export async function getCloudTravelerProfile(username) {
  if (!username) return null;
  const clean = username.trim().toLowerCase().replace(/^@/, '');
  try {
    const usernameSnap = await getDoc(doc(db, 'usernames', clean));
    if (usernameSnap.exists()) {
      const uData = usernameSnap.data();
      const userSnap = await getDoc(doc(db, 'users', uData.uid));
      if (userSnap.exists()) {
        return userSnap.data();
      }
      return uData;
    }
  } catch (err) {
    console.warn('Error fetching traveler cloud profile:', err);
  }
  return null;
}
