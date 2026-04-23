const CACHE_NAME = 'beytenu-v1';
const urlsToCache = [
  '/',
  '/index.html',
  'https://beytenu.org.il/wp-content/uploads/2023/07/IB_New-Logo_Dark-4-1024x369.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).then(fetchRes => {
          if (!fetchRes || fetchRes.status !== 200 || fetchRes.type !== 'basic') {
            return fetchRes;
          }
          const resToCache = fetchRes.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, resToCache));
          return fetchRes;
        });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});