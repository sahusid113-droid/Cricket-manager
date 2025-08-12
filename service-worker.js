const CACHE_NAME = 'cricket-manager-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/manifest.json',
  '/data-squads.json',
  '/assets/mi-logo.svg',
  '/assets/csk-logo.svg',
  '/assets/india-flag.svg',
  '/assets/australia-flag.svg',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
];

// Install event - caching all essential files
self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches if any
self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch event - respond with cached resources or fetch from network
self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches.match(evt.request).then(response => {
      return response || fetch(evt.request);
    })
  );
});