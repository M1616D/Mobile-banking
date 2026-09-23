/* ==========================================================================
   sw.js — cache the whole app on install so it runs with no network at all,
   then serve cache-first with a silent background refresh.
   ========================================================================== */
var VERSION = 'cbe-v6.1.2';
var SHELL = [
  './',
  'index.html',
  'manifest.json',
  'css/tokens.css',
  'css/layout.css',
  'css/components.css',
  'css/screens.css',
  'js/core/util.js',
  'js/core/icons.js',
  'js/core/brands.js',
  'js/core/qr.js',
  'js/core/overlay.js',
  'js/core/store.js',
  'js/core/router.js',
  'js/screens/auth.js',
  'js/screens/home.js',
  'js/screens/transfer.js',
  'js/screens/receipt.js',
  'js/screens/services.js',
  'js/screens/settings.js',
  'js/screens/misc.js',
  'js/app.js',
  'img/cbe-logo.png',
  'img/bank-stamp.png',
  'img/fingerprint.png',
  'img/fingerprint-white.png'
];

var BRANDS = [
  'abay', 'abyssinia', 'addis', 'ahadu', 'amhara', 'awash', 'berhan', 'binget', 'bunna', 'coop',
  'dashen', 'ebirr', 'enat', 'ethiotelecom', 'mpesa', 'nib', 'oromia', 'sahaypay', 'telebirr',
  'tsehay', 'wegagen', 'yaya', 'zemen'
].map(function (n) {
  return 'img/brands/' + n + '.png';
});

var ASSETS = SHELL.concat(BRANDS);

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (cache) {
      return Promise.all(ASSETS.map(function (url) {
        return cache.add(new Request(url, { cache: 'reload' })).catch(function () { /* optional asset */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || req.url.indexOf('http') !== 0) return;

  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit) {
        /* refresh quietly in the background */
        fetch(req).then(function (res) {
          if (res && res.ok) caches.open(VERSION).then(function (c) { c.put(req, res.clone()); });
        }).catch(function () { });
        return hit;
      }
      return fetch(req).then(function (res) {
        if (res && res.ok && res.type === 'basic') {
          var copy = res.clone();
          caches.open(VERSION).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match('index.html');
      });
    })
  );
});
