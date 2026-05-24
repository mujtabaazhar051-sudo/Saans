/* ================================================
   SAANS — Service Worker (sw.js)
   Caches key pages for offline access.
   ================================================ */

const CACHE_NAME = 'saans-v1';
const ASSETS = [
  '/saans/',
  '/saans/index.html',
  '/saans/app.html',
  '/saans/styles.css',
  '/saans/utils.js',
  '/saans/chat.js',
  '/saans/nav.js',
  '/saans/tracker.html',
  '/saans/savings.html',
  '/saans/breathing.html',
  '/saans/motivation.html',
  '/saans/badges.html',
  '/saans/health.html',
  '/saans/tips.html',
  '/saans/helplines.html',
  '/saans/resources.html',
  '/saans/settings.html',
  '/saans/favicon.ico',
];

// Install — cache all assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — serve from cache, fall back to network
self.addEventListener('fetch', e => {
  // Skip non-GET and cross-origin requests
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cache successful responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Offline fallback
      if (e.request.destination === 'document') {
        return caches.match('/saans/app.html');
      }
    })
  );
});