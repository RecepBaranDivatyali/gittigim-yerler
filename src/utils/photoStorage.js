// photoStorage.js - Offline IndexedDB Photo Storage with Canvas Compression
const DB_NAME = 'GezginPhotosDB';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

let dbPromise = null;

function getDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB is not supported in this environment.');
      resolve(null);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('targetId', 'targetId', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = (e) => {
      resolve(e.target.result);
    };

    request.onerror = (e) => {
      console.error('IndexedDB open error:', e);
      resolve(null);
    };
  });

  return dbPromise;
}

/**
 * Resizes and compresses an image file or dataURL using HTML5 canvas.
 * Max dimension 1200px, quality 0.82 JPEG to keep storage fast and lightweight.
 */
export function compressImage(fileOrDataUrl, maxWidth = 1200, maxHeight = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    const process = () => {
      try {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({ dataUrl: img.src, width: img.width, height: img.height });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({
          dataUrl,
          width,
          height
        });
      } catch (err) {
        console.warn('Canvas compression fallback:', err);
        resolve(typeof fileOrDataUrl === 'string' ? { dataUrl: fileOrDataUrl, width: 800, height: 600 } : null);
      }
    };

    img.onload = process;
    img.onerror = () => reject(new Error('Failed to load image for compression'));

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else if (fileOrDataUrl instanceof Blob || fileOrDataUrl instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    } else {
      reject(new Error('Invalid image input'));
    }
  });
}

/**
 * Saves a photo for a given destination (e.g. 'TR', 'FR', 'TR::34', 'IT::Roma').
 */
export async function savePhoto(targetId, fileOrDataUrl, caption = '') {
  try {
    const db = await getDB();
    if (!db) return null;

    const compressed = await compressImage(fileOrDataUrl);
    if (!compressed || !compressed.dataUrl) return null;

    const record = {
      id: 'photo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      targetId: String(targetId),
      dataUrl: compressed.dataUrl,
      width: compressed.width,
      height: compressed.height,
      caption: String(caption || '').trim(),
      createdAt: new Date().toISOString()
    };

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.add(record);

      req.onsuccess = () => resolve(record);
      req.onerror = (e) => {
        console.error('Save photo error:', e);
        resolve(null);
      };
    });
  } catch (err) {
    console.error('Error saving photo:', err);
    return null;
  }
}

/**
 * Retrieves all photos for a specific destination.
 */
export async function getPhotosByTarget(targetId) {
  try {
    const db = await getDB();
    if (!db) return [];

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('targetId');
      const req = index.getAll(String(targetId));

      req.onsuccess = (e) => {
        const results = e.target.result || [];
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        resolve(results);
      };

      req.onerror = () => resolve([]);
    });
  } catch (err) {
    console.error('Error fetching photos by target:', err);
    return [];
  }
}

/**
 * Deletes a single photo by its ID.
 */
export async function deletePhoto(photoId) {
  try {
    const db = await getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(photoId);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    console.error('Error deleting photo:', err);
    return false;
  }
}

/**
 * Deletes all photos associated with a specific target destination.
 */
export async function deletePhotosByTarget(targetId) {
  try {
    const db = await getDB();
    if (!db) return false;

    const photos = await getPhotosByTarget(targetId);
    if (!photos || photos.length === 0) return true;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      photos.forEach(p => {
        if (p && p.id) store.delete(p.id);
      });
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => {
        console.error('Error in batch photo delete tx:', e);
        resolve(false);
      };
    });
  } catch (err) {
    console.error('Error deleting photos by target:', err);
    return false;
  }
}

/**
 * Retrieves all photos stored in the database.
 */
export async function getAllPhotos(limit = 100) {
  try {
    const db = await getDB();
    if (!db) return [];

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = (e) => {
        const results = e.target.result || [];
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        resolve(results.slice(0, limit));
      };

      req.onerror = () => resolve([]);
    });
  } catch (err) {
    console.error('Error fetching all photos:', err);
    return [];
  }
}

/**
 * Gets total count of photos stored in IndexedDB.
 */
export async function getTotalPhotoCount() {
  try {
    const db = await getDB();
    if (!db) return 0;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.count();

      req.onsuccess = (e) => resolve(e.target.result || 0);
      req.onerror = () => resolve(0);
    });
  } catch {
    return 0;
  }
}
