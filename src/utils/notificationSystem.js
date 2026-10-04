// notificationSystem.js - Travel Buddy Trip Notifications & Approval Engine
import { 
  saveWorldVisit, 
  saveTurkeyVisit, 
  getStorageData, 
  notifyStateChange 
} from './storage.js';
import { db, auth } from '../services/firebase.js';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc 
} from 'firebase/firestore';

const NOTIFICATIONS_STORAGE_KEY = 'gittigim_yerler_notifications_v2';
const listeners = new Set();

export function onNotificationsChange(cb) {
  if (typeof cb === 'function') {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }
  return () => {};
}

function emitChange() {
  const notifs = getAllNotifications();
  listeners.forEach(cb => {
    try { cb(notifs); } catch (e) { console.error('Notification listener error:', e); }
  });
}

/**
 * Get all notifications from localStorage
 */
export function getAllNotifications() {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    // Filter out any demo/test notifications
    return parsed.filter(n => !n.id || !n.id.startsWith('demo_'));
  } catch {
    return [];
  }
}

/**
 * Permanently purge all demo notifications from local storage
 */
export function purgeDemoNotifications() {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const cleaned = parsed.filter(n => !n.id || !n.id.startsWith('demo_'));
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(cleaned));
        emitChange();
      }
    }
  } catch {}
}

/**
 * Get pending unhandled notifications for current user
 */
export function getPendingNotifications(currentUsername = '') {
  const all = getAllNotifications();
  const cleanCurrent = (currentUsername || '').trim().toLowerCase().replace(/^@/, '');
  return all.filter(n => {
    if (n.status !== 'pending') return false;
    if (!cleanCurrent) return true;
    const target = (n.targetUser || '').trim().toLowerCase().replace(/^@/, '');
    return target === cleanCurrent || target === 'all';
  });
}

/**
 * Save notification locally and broadcast
 */
function saveLocalNotification(notif) {
  const all = getAllNotifications();
  const existingIdx = all.findIndex(n => n.id === notif.id);
  if (existingIdx >= 0) {
    all[existingIdx] = { ...all[existingIdx], ...notif };
  } else {
    all.unshift(notif);
  }
  // Keep max 50 notifications
  if (all.length > 50) all.length = 50;
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(all));
  emitChange();
}

/**
 * Dispatch trip invitation when a user marks a place with travel buddy tagged
 */
export async function sendTripInvitation({ fromProfile, toUsername, placeId, placeName, visitData }) {
  if (!toUsername || !placeId) return null;
  const cleanTo = toUsername.trim().toLowerCase().replace(/^@/, '');
  if (!cleanTo) return null;

  const fromUser = fromProfile?.username ? `@${fromProfile.username.trim().toLowerCase().replace(/^@/, '')}` : '@gezgin';
  const notifId = 'trip_inv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  const notif = {
    id: notifId,
    type: 'trip_tagged',
    fromUsername: fromUser,
    fromName: fromProfile?.name || fromProfile?.username || 'Gezgin',
    fromAvatar: fromProfile?.avatar || '🧭',
    fromPhotoUrl: fromProfile?.photoUrl || null,
    targetUser: cleanTo,
    placeId: String(placeId),
    placeName: placeName || placeId,
    visitData: {
      entryDate: visitData?.entryDate || new Date().toISOString().split('T')[0],
      exitDate: visitData?.exitDate || '',
      entryTransport: visitData?.entryTransport || 'flight',
      notes: visitData?.notes || ''
    },
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  saveLocalNotification(notif);

  // Send to Firebase Cloud if available & online
  if (navigator.onLine && db) {
    try {
      const inviteRef = doc(collection(db, 'trip_invitations'), notifId);
      await setDoc(inviteRef, notif);
    } catch (err) {
      console.warn('Could not sync trip invite to Firestore:', err);
    }
  }

  return notif;
}

/**
 * Accept a trip invitation: automatically adds the trip to current user's map and updates stats
 */
export async function acceptTripInvitation(notificationId) {
  const all = getAllNotifications();
  const notif = all.find(n => n.id === notificationId);
  if (!notif) return null;

  notif.status = 'accepted';
  notif.handledAt = new Date().toISOString();
  saveLocalNotification(notif);

  // Automatically add trip to current user's travel collection
  const { placeId, visitData, fromUsername } = notif;
  const buddies = [fromUsername];

  if (placeId.startsWith('TR::')) {
    // Turkey province
    const provId = placeId.replace('TR::', '');
    saveTurkeyVisit(provId, 'visited', {
      entryDate: visitData?.entryDate || '',
      entryTransport: visitData?.entryTransport || 'car',
      buddies,
      notes: visitData?.notes ? `(${fromUsername} ile birlikte): ${visitData.notes}` : `${fromUsername} ile birlikte gezildi`
    });
  } else {
    // World country or city
    saveWorldVisit(placeId, 'visited', {
      entryDate: visitData?.entryDate || '',
      exitDate: visitData?.exitDate || '',
      entryTransport: visitData?.entryTransport || 'flight',
      buddies,
      notes: visitData?.notes ? `(${fromUsername} ile birlikte): ${visitData.notes}` : `${fromUsername} ile birlikte gezildi`
    });
  }

  // Update cloud doc if online (skip demo invitations)
  if (navigator.onLine && db && !notificationId.startsWith('demo_')) {
    try {
      const inviteRef = doc(db, 'trip_invitations', notificationId);
      await updateDoc(inviteRef, { status: 'accepted', handledAt: notif.handledAt });
    } catch (e) {
      console.warn('Cloud invite accept sync error:', e);
    }
  }

  notifyStateChange();
  return notif;
}

/**
 * Decline a trip invitation
 */
export async function declineTripInvitation(notificationId) {
  const all = getAllNotifications();
  const notif = all.find(n => n.id === notificationId);
  if (!notif) return false;

  notif.status = 'declined';
  notif.handledAt = new Date().toISOString();
  saveLocalNotification(notif);

  if (navigator.onLine && db && !notificationId.startsWith('demo_')) {
    try {
      const inviteRef = doc(db, 'trip_invitations', notificationId);
      await updateDoc(inviteRef, { status: 'declined', handledAt: notif.handledAt });
    } catch (e) {
      console.warn('Cloud invite decline sync error:', e);
    }
  }

  return true;
}

/**
 * Poll or fetch incoming invitations from cloud for current user
 */
export async function fetchCloudNotifications(currentUsername) {
  if (!navigator.onLine || !db || !currentUsername) return;
  const clean = currentUsername.trim().toLowerCase().replace(/^@/, '');
  try {
    const q = query(collection(db, 'trip_invitations'), where('targetUser', '==', clean), where('status', '==', 'pending'));
    const snap = await getDocs(q);
    snap.forEach(docSnap => {
      const data = docSnap.data();
      if (data && data.id) {
        saveLocalNotification(data);
      }
    });
  } catch (err) {
    console.warn('fetchCloudNotifications error:', err);
  }
}

