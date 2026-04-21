const CACHE = 'arsh-v5';
const STATIC = [
  '/arsh-logistics/',
  '/arsh-logistics/index.html',
  '/arsh-logistics/manifest.json',
  '/arsh-logistics/icon-192.png',
  '/arsh-logistics/icon-512.png'
];

// Install - cache static files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// Activate - clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', e => {
  const url = e.request.url;
  
  // Skip non-GET and external API calls
  if (e.request.method !== 'GET') return;
  if (url.includes('firebaseio.com')) return;
  if (url.includes('googleapis.com')) return;
  if (url.includes('anthropic.com')) return;
  if (url.includes('gstatic.com')) return;
  
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
