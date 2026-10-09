// src/services/communityService.js - Cloud Database for Shared Places & Ratings
import { db, auth } from './firebase.js';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { isCurrentUserSuperAdmin } from '../utils/storage.js';

// In-memory cache for speed and instant response
const COMMUNITY_CACHE = {
  places: new Map(),
  reviews: new Map()
};

/**
 * Get active user metadata (ID, username, avatar, photo)
 */
export function getCurrentCommunityUser() {
  let uid = auth?.currentUser?.uid || null;
  let username = 'Gezgin';
  let avatar = '🧭';
  let photoUrl = null;

  try {
    const pStr = localStorage.getItem('gv_profile') || sessionStorage.getItem('gv_profile');
    if (pStr) {
      const p = JSON.parse(pStr);
      if (p.username) username = p.username.trim();
      if (p.avatar) avatar = p.avatar;
      if (p.photoUrl) photoUrl = p.photoUrl;
    }
  } catch {}

  if (!uid) {
    if (username) {
      uid = 'user_' + username.toLowerCase().replace(/[^a-z0-9_]/g, '');
    } else {
      uid = 'guest_' + Math.random().toString(36).substring(2, 9);
    }
  }

  return {
    uid,
    username: username || 'Gezgin',
    avatar: avatar || '🧭',
    photoUrl: photoUrl || auth?.currentUser?.photoURL || null,
    isSuperAdmin: isCurrentUserSuperAdmin()
  };
}

/**
 * Normalize place ID (e.g. TR::34 -> TR::34, 34 -> TR::34, TR -> TR)
 */
export function normalizePlaceId(id, type = null, countryCode = null) {
  if (!id) return '';
  const str = String(id).trim();
  if (type === 'province' && !str.startsWith('TR::')) {
    return 'TR::' + str;
  }
  if (type === 'city' && countryCode && !str.includes('::')) {
    return `${countryCode}::${str}`;
  }
  return str;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🍽️ COMMUNITY PLACES (Keşfedilen Mekanlar & Rota Durakları)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all shared community places for a given place ID
 */
export async function fetchCommunityPlaces(placeId) {
  if (!placeId) return [];
  const cleanId = String(placeId).trim();

  try {
    if (db) {
      const q = query(
        collection(db, 'community_places'),
        where('placeId', '==', cleanId),
        limit(120)
      );
      const snapshot = await getDocs(q);
      const cloudPlaces = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data && data.name) {
          cloudPlaces.push({
            ...data,
            id: data.id || docSnap.id
          });
        }
      });

      cloudPlaces.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      COMMUNITY_CACHE.places.set(cleanId, cloudPlaces);
      try {
        localStorage.setItem(`gv_comm_places_${cleanId}`, JSON.stringify(cloudPlaces));
      } catch {}

      return cloudPlaces;
    }
  } catch (err) {
    console.warn('Error fetching cloud community places:', err);
  }

  // Fallback to in-memory or localStorage cache
  if (COMMUNITY_CACHE.places.has(cleanId)) {
    return COMMUNITY_CACHE.places.get(cleanId);
  }
  try {
    const cached = localStorage.getItem(`gv_comm_places_${cleanId}`);
    if (cached) return JSON.parse(cached);
  } catch {}

  return [];
}

/**
 * Add a new place to Firestore and update cache
 */
export async function addCommunityPlace(placeId, { name, category, rating, note }) {
  if (!placeId || !name) return null;
  const cleanId = String(placeId).trim();
  const user = getCurrentCommunityUser();

  const newPlace = {
    id: 'place_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    placeId: cleanId,
    name: name.trim(),
    category: category || 'restaurant',
    rating: Number(rating) || 5,
    note: (note || '').trim(),
    userId: user.uid,
    username: user.username,
    avatar: user.avatar,
    photoUrl: user.photoUrl,
    createdAt: new Date().toISOString()
  };

  if (db) {
    try {
      const placeRef = doc(db, 'community_places', newPlace.id);
      await setDoc(placeRef, newPlace);
    } catch (err) {
      console.warn('Error saving community place to Firestore:', err);
    }
  }

  const list = COMMUNITY_CACHE.places.get(cleanId) || [];
  const updated = [newPlace, ...list.filter(p => p.id !== newPlace.id)];
  COMMUNITY_CACHE.places.set(cleanId, updated);
  try {
    localStorage.setItem(`gv_comm_places_${cleanId}`, JSON.stringify(updated));
  } catch {}

  return newPlace;
}

/**
 * Delete a place from Firestore (only author or admin)
 */
export async function deleteCommunityPlace(placeId, placeItemId) {
  if (!placeId || !placeItemId) return false;
  const cleanId = String(placeId).trim();

  if (db) {
    try {
      await deleteDoc(doc(db, 'community_places', placeItemId));
    } catch (err) {
      console.warn('Error deleting community place from Firestore:', err);
    }
  }

  const list = COMMUNITY_CACHE.places.get(cleanId) || [];
  const updated = list.filter(p => p.id !== placeItemId);
  COMMUNITY_CACHE.places.set(cleanId, updated);
  try {
    localStorage.setItem(`gv_comm_places_${cleanId}`, JSON.stringify(updated));
  } catch {}

  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// ⭐ COMMUNITY RATINGS & REVIEWS (10 Yıldız Değerlendirme & Gezgin Notları)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all ratings and notes for this country / province / city from Firestore
 */
export async function fetchCommunityReviews(placeId) {
  if (!placeId) return { average: 0, count: 0, reviews: [] };
  const cleanId = String(placeId).trim();

  let reviews = [];

  if (db) {
    try {
      const q = query(
        collection(db, 'community_reviews'),
        where('placeId', '==', cleanId),
        limit(150)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data && (Number(data.rating) > 0 || (data.note && data.note.trim().length > 0))) {
          reviews.push({
            ...data,
            id: data.id || docSnap.id
          });
        }
      });

      reviews.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));

      COMMUNITY_CACHE.reviews.set(cleanId, reviews);
      try {
        localStorage.setItem(`gv_comm_reviews_${cleanId}`, JSON.stringify(reviews));
      } catch {}
    } catch (err) {
      console.warn('Error fetching community reviews:', err);
    }
  }

  if (reviews.length === 0) {
    if (COMMUNITY_CACHE.reviews.has(cleanId)) {
      reviews = COMMUNITY_CACHE.reviews.get(cleanId);
    } else {
      try {
        const cached = localStorage.getItem(`gv_comm_reviews_${cleanId}`);
        if (cached) reviews = JSON.parse(cached);
      } catch {}
    }
  }

  const rated = reviews.filter(r => Number(r.rating) > 0);
  const count = rated.length;
  const average = count > 0
    ? (rated.reduce((sum, r) => sum + Number(r.rating), 0) / count).toFixed(1)
    : 0;

  return {
    average: Number(average),
    count,
    reviews
  };
}

/**
 * Save user's 10-star rating and/or note to Firestore collection 'community_reviews'
 */
export async function saveCommunityReview(placeId, rating, note) {
  if (!placeId) return null;
  const cleanId = String(placeId).trim();
  const user = getCurrentCommunityUser();
  const cleanRating = Number(rating) || 0;
  const cleanNote = (note || '').trim();

  const docId = `${cleanId}_${user.uid}`.replace(/[^a-zA-Z0-9_-]/g, '_');

  // If both rating is 0 and note is blank, delete existing review
  if (cleanRating === 0 && !cleanNote) {
    if (db) {
      try {
        await deleteDoc(doc(db, 'community_reviews', docId));
      } catch {}
    }
    const list = (COMMUNITY_CACHE.reviews.get(cleanId) || []).filter(r => r.userId !== user.uid);
    COMMUNITY_CACHE.reviews.set(cleanId, list);
    try { localStorage.setItem(`gv_comm_reviews_${cleanId}`, JSON.stringify(list)); } catch {}
    return null;
  }

  const reviewData = {
    id: docId,
    placeId: cleanId,
    userId: user.uid,
    username: user.username,
    avatar: user.avatar,
    photoUrl: user.photoUrl,
    rating: cleanRating,
    note: cleanNote,
    updatedAt: new Date().toISOString()
  };

  if (db) {
    try {
      const reviewRef = doc(db, 'community_reviews', docId);
      await setDoc(reviewRef, {
        ...reviewData,
        serverUpdatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('Error saving community review to Firestore:', err);
    }
  }

  const list = COMMUNITY_CACHE.reviews.get(cleanId) || [];
  const updated = [reviewData, ...list.filter(r => r.id !== docId && r.userId !== user.uid)];
  COMMUNITY_CACHE.reviews.set(cleanId, updated);
  try {
    localStorage.setItem(`gv_comm_reviews_${cleanId}`, JSON.stringify(updated));
  } catch {}

  return reviewData;
}

/**
 * Delete review by ID or current user's review for this place
 */
export async function deleteCommunityReview(placeId, reviewId = null) {
  if (!placeId) return false;
  const cleanId = String(placeId).trim();
  const user = getCurrentCommunityUser();
  const targetDocId = reviewId || `${cleanId}_${user.uid}`.replace(/[^a-zA-Z0-9_-]/g, '_');

  if (db) {
    try {
      await deleteDoc(doc(db, 'community_reviews', targetDocId));
    } catch (err) {
      console.warn('Error deleting community review:', err);
    }
  }

  const list = (COMMUNITY_CACHE.reviews.get(cleanId) || []).filter(r => r.id !== targetDocId);
  COMMUNITY_CACHE.reviews.set(cleanId, list);
  try {
    localStorage.setItem(`gv_comm_reviews_${cleanId}`, JSON.stringify(list));
  } catch {}
  return true;
}
