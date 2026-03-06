const CACHE = 'medwiki-v4';
const ASSETS = [
  '/MedWiki/',
  '/MedWiki/index.html',
  '/MedWiki/manifest.json',
  '/MedWiki/icon-192.png',
  '/MedWiki/icon-512.png',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone@7.23.10/babel.min.js',
];

// Never cache these - they need live internet
const NEVER_CACHE = [
  'apis.google.com',
  'firestore.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'firebase',
  'gstatic.com/firebasejs',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  
  // Never intercept Google/Firebase requests
  const skip = NEVER_CACHE.some(domain => url.includes(domain));
  if (skip) return;
  
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).catch(() => caches.match('/MedWiki/'));
    })
  );
});
