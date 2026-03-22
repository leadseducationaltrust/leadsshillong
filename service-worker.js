const CACHE_VERSION = 'v7';
const APP_SHELL_CACHE = `leads-app-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `leads-runtime-${CACHE_VERSION}`;
const OFFLINE_FALLBACK_URL = '/offline.html';

const APP_SHELL_ASSETS = [
  // Redirect-only shells (for example news.html) are intentionally excluded from pre-cache.
  '/',
  '/index.html',
  '/about.html',
  '/admissions.html',
  '/contact.html',
  '/career.html',
  '/downloads.html',
  '/faculty.html',
  '/gallery.html',
  '/insights.html',
  '/programs.html',
  '/terms.html',
  OFFLINE_FALLBACK_URL,
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/school-logo.jpg',
  '/js/config.js',
  '/js/news.js',
  '/js/programs.js',
  '/js/faculty.js',
  '/js/gallery.js',
  '/js/downloads.js',
  '/js/articles-data.js',
  '/js/article-detail.js',
  '/js/insights.js',
  '/js/home-article-highlight.js',
  '/js/calendar.js',
  '/js/thought.js',
  '/js/pwa.js',
  '/career/career.css',
  '/career/career.js',
  '/news/content.json',
  '/jobs/jobs.json',
  '/downloads/content.json',
  '/calendar/content.json',
  '/thought/content.json',
  '/gallery/content.json',
  '/faculty/content.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_ASSETS))
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== APP_SHELL_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  const isNavigation = request.mode === 'navigate';
  const isUpdateSensitive = /\.(html|json|js|css|webmanifest)$/i.test(url.pathname);

  if (request.method !== 'GET') {
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/oauth-worker')) {
    return;
  }

  if (url.pathname === '/service-worker.js') {
    return;
  }

  if (isNavigation || isUpdateSensitive) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          if (cachedPage) {
            return cachedPage;
          }

          if (isNavigation) {
            return (await caches.match(OFFLINE_FALLBACK_URL)) || (await caches.match('/index.html'));
          }

          return new Response('Offline', {
            status: 503,
            statusText: 'Offline'
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkFetch = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const networkClone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, networkClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});