const CACHE_VERSION = 'v1';
const APP_SHELL_CACHE = `leads-app-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `leads-runtime-${CACHE_VERSION}`;

const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/admissions.html',
  '/contact.html',
  '/downloads.html',
  '/faculty.html',
  '/gallery.html',
  '/insights.html',
  '/news.html',
  '/programs.html',
  '/terms.html',
  '/manifest.webmanifest',
  '/school-logo.jpg',
  '/js/config.js',
  '/js/news.js',
  '/js/programs.js',
  '/js/faculty.js',
  '/js/gallery.js',
  '/js/downloads.js',
  '/js/articles.js',
  '/js/calendar.js',
  '/js/thought.js',
  '/js/pwa.js',
  '/news/content.json',
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
  self.skipWaiting();
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

  if (request.method !== 'GET') {
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/oauth-worker')) {
    return;
  }

  if (request.mode === 'navigate') {
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
          return caches.match('/index.html');
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