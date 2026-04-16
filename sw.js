const CACHE_NAME = 'arsh-logistics-v4';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Don't cache API calls
  if(url.includes('firebaseio.com') || url.includes('googleapis.com/v1beta') || 
     url.includes('anthropic.com') || e.request.method !== 'GET') return;
  
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if(response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
