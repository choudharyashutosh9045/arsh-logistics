const CACHE = 'arsh-v6';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => {
      return c.addAll(['./index.html', './manifest.json']).catch(() => {});
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  if (url.includes('firebaseio.com') || url.includes('googleapis.com') || url.includes('gstatic.com')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      return fetch(e.request)
        .then(resp => {
          if (resp && resp.status === 200) {
            caches.open(CACHE).then(c => c.put(e.request, resp.clone()));
          }
          return resp;
        })
        .catch(() => cached);
    })
  );
});
