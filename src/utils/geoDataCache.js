// geoDataCache.js - Ultra-fast IndexedDB caching for GeoJSON map datasets
const DB_NAME = 'GezginGeoCacheDB';
const DB_VERSION = 1;
const STORE_NAME = 'geojson_datasets';

let dbPromise = null;

function getCacheDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

export async function getCachedGeoData(key) {
  try {
    const db = await getCacheDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setCachedGeoData(key, data) {
  try {
    const db = await getCacheDB();
    if (!db || !data) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ key, data, timestamp: Date.now() });
  } catch {}
}

/**
 * Loads GeoJSON dataset instantly from IndexedDB cache if available.
 * Silently updates cache in the background.
 */
export async function fetchGeoDataWithCache(url, cacheKey) {
  // 1. Try to load from IndexedDB cache immediately (typically 5-15ms)
  try {
    const cached = await getCachedGeoData(cacheKey);
    if (cached && cached.features && cached.features.length > 0) {
      // In background, refresh from network so updates propagate smoothly
      fetch(url)
        .then(r => (r.ok ? r.json() : null))
        .then(fresh => {
          if (fresh && fresh.features && fresh.features.length > 0) {
            setCachedGeoData(cacheKey, fresh);
          }
        })
        .catch(() => {});
      return cached;
    }
  } catch {}

  // 2. Not in IndexedDB: fetch from network and save to IndexedDB
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network error ' + res.status);
  const data = await res.json();
  setCachedGeoData(cacheKey, data);
  return data;
}
