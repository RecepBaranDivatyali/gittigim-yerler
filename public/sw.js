// Modern Network-First Service Worker for Instant Updates
const CACHE_NAME = 'gittigim-yerler-v2';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  // Always fetch from network first so all updates are seen immediately
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
