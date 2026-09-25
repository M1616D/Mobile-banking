/* CBE Mobile Banking — offline service worker */
const CACHE = 'cbe-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/tokens.css',
  './css/base.css',
  './css/components.css',
  './css/screens.css',
  './js/core/qr.js',
  './js/core/util.js',
  './js/core/store.js',
  './js/core/icons.js',
  './js/core/brands.js',
  './js/core/ui.js',
  './js/core/router.js',
  './js/core/guard.js',
  './js/screens/auth.js',
  './js/screens/home.js',
  './js/screens/services.js',
  './js/screens/transfer.js',
  './js/screens/receipt.js',
  './js/screens/pages.js',
  './js/screens/settings.js',
  './js/app.js',
  './img/cbe-mark.png',
  './img/cbe-logo.png',
  './img/appicon.jpg',
  './img/stamp.png',
  './img/fingerprint.png',
  './img/fingerprint-white.png',
  './img/card-art.jpg',
  './img/map.png',
  './img/bank-stamp.png'
];
// brand logos cached on-demand (runtime cache)
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(hit =>
      hit ||
      fetch(req).then(res => {
        if (res.ok && new URL(req.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
