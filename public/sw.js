// CropNex Progressive Web App Service Worker v3.2
const CACHE_NAME = 'cropnex-pwa-v3.2';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  '/offline.html',
  '/manifest.json',
  '/images/cropnex_logo.png',
  '/images/icon-192.png',
  '/images/icon-512.png',
];

// 1. Install Event: Cache essential offline assets only
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[PWA SW] Pre-caching warning:', err);
      });
    })
  );
});

// 2. Activate Event: Instantly delete ALL old caches (v1, v2, v2.1, v3.0)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[PWA SW] Deleting obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Message Event: allow immediate skipWaiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 4. Fetch Event: Network-First for HTML navigation so phone always gets the latest deployed code
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Don't intercept non-GET, API/Auth, or Next.js RSC flight requests
  if (request.method !== 'GET') return;
  if (
    request.url.includes('/api/') ||
    request.url.includes('/auth/') ||
    request.url.includes('_rsc=') ||
    request.headers.get('RSC') === '1'
  ) {
    return;
  }

  // Navigation requests (HTML pages): ALWAYS try fresh network first!
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(async () => {
          const offlinePage = await caches.match(OFFLINE_URL);
          return offlinePage || new Response('Offline', { status: 503, statusText: 'Offline' });
        })
    );
    return;
  }

  // Static assets (images, icons, styles, scripts): Network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        return cached || Response.error();
      })
  );
});
