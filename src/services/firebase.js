import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCING-uq0k7y-F4yMhrGdbkWLhRGNgQLuM",
  authDomain: "gezgin-app-c269d.firebaseapp.com",
  projectId: "gezgin-app-c269d",
  storageBucket: "gezgin-app-c269d.firebasestorage.app",
  messagingSenderId: "272484411443",
  appId: "1:272484411443:web:af4e862034f0a7fa46db46",
  measurementId: "G-SLQCC3G8MZ"
};

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with Offline-First Persistent Cache
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (err) {
  console.warn('Firestore multi-tab persistent cache fallback to default:', err);
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;
export default app;
