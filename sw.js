/* =======================================================
   SAANS — Service Worker (sw.js)
   Handles caching + push notifications.
   ======================================================= */

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Firebase config
firebase.initializeApp({
  apiKey:            "AIzaSyCle5cJcgH_uIZC4tOoD-wTqAfghLJIOFA",
  authDomain:        "saans-3206a.firebaseapp.com",
  projectId:         "saans-3206a",
  storageBucket:     "saans-3206a.firebasestorage.app",
  messagingSenderId: "203356336705",
  appId:             "1:203356336705:web:00c8ded21431df1c8cccc0",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(payload => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'سانس', {
    body:  body  || 'آج کا چیک‑ان باقی ہے 🌿',
    icon:  icon  || '/Saans/icon-192.png',
    badge: '/Saans/icon-192.png',
    tag:   'saans-notification',
    data:  payload.data || {},
    actions: [
      { action: 'checkin', title: '✓ چیک‑ان کریں' },
      { action: 'dismiss', title: 'بعد میں' },
    ]
  });
});

// Handle notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.action === 'checkin'
    ? '/Saans/app.html'
    : '/Saans/app.html';
  e.waitUntil(clients.openWindow(url));
});

// ── Caching ────────────────────────────────────────
const CACHE_NAME = 'saans-v2';
const ASSETS = [
  '/Saans/',
  '/Saans/index.html',
  '/Saans/app.html',
  '/Saans/styles.css',
  '/Saans/utils.js',
  '/Saans/chat.js',
  '/Saans/nav.js',
  '/Saans/tracker.html',
  '/Saans/savings.html',
  '/Saans/breathing.html',
  '/Saans/motivation.html',
  '/Saans/badges.html',
  '/Saans/health.html',
  '/Saans/settings.html',
  '/Saans/favicon.ico',
  '/Saans/icon-192.png',
  '/Saans/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      });
    }).catch(() => {
      if (e.request.destination === 'document') {
        return caches.match('/Saans/app.html');
      }
    })
  );
});