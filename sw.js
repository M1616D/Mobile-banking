/* ==========================================================================
   sw.js — offline support for the CBE Mobile Banking replica.
   Strategy: network-first with a cache fallback, so the files on disk always
   win while the app keeps working with no connection at all.
   ========================================================================== */
'use strict';

var CACHE = 'cbe-mobile-v7';

var ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/app.css',
  './assets/img/cbe-logo.png',
  './assets/img/fingerprint.png',
  './assets/img/fingerprint-white.png',
  './assets/img/bank-stamp.png',
  './assets/js/qr.js',
  './assets/js/data.js',
  './assets/js/ui.js',
  './assets/js/core.js',
  './assets/js/screens-auth.js',
  './assets/js/screens-home.js',
  './assets/js/screens-services.js',
  './assets/js/screens-transfer.js',
  './assets/js/screens-payments.js',
  './assets/js/screens-settings.js',
  './assets/js/screens-receipt.js',
  './assets/js/app.js'
];

/* brand artwork is cached lazily on first use instead of listed one by one */
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(ASSETS.map(function (url) {
      return c.add(new Request(url, { cache: 'reload' })).catch(function () { return null; });
    }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || e.request.url.indexOf(self.location.origin) !== 0) return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return res;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
        return hit || caches.match('./index.html');
      });
    })
  );
});
