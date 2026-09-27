/* CBE Mobile Banking - offline service worker.
   Cache-first: every asset is stored on install so the app runs with no
   network at all. Opening index.html straight from disk works even without
   this worker, because nothing in the app ever requests a remote resource. */
const CACHE = 'cbe-mobile-72d13b6385';
const ASSETS = [
  "css/base.css",
  "css/components.css",
  "css/screens.css",
  "css/tokens.css",
  "img/appicon-context.jpg",
  "img/appicon-dark.jpg",
  "img/appicon.jpg",
  "img/apple-touch-icon.png",
  "img/brands/aaland.png",
  "img/brands/aarev.png",
  "img/brands/aatma.png",
  "img/brands/aawsa.png",
  "img/brands/abay.png",
  "img/brands/abyssinia.png",
  "img/brands/addis.png",
  "img/brands/ahadu-ebirr.svg",
  "img/brands/ahadu.png",
  "img/brands/amhara.png",
  "img/brands/awash.png",
  "img/brands/berhan.png",
  "img/brands/binget.png",
  "img/brands/birrlink.png",
  "img/brands/booking.png",
  "img/brands/british.png",
  "img/brands/buna.png",
  "img/brands/cbebirr.png",
  "img/brands/chapa.png",
  "img/brands/coop.svg",
  "img/brands/coopay.svg",
  "img/brands/dars.png",
  "img/brands/dashen.png",
  "img/brands/dirrev.png",
  "img/brands/dstv.png",
  "img/brands/ebirr.png",
  "img/brands/eeu.png",
  "img/brands/emyc.png",
  "img/brands/enat.png",
  "img/brands/equb.png",
  "img/brands/era.png",
  "img/brands/ethiopian.png",
  "img/brands/ethiotelecom.png",
  "img/brands/ethtravel.png",
  "img/brands/facebook.png",
  "img/brands/fcsc.png",
  "img/brands/fhc.png",
  "img/brands/flomart.png",
  "img/brands/guzo.png",
  "img/brands/haji.png",
  "img/brands/kaafi.png",
  "img/brands/lakipay.png",
  "img/brands/linkedin.png",
  "img/brands/moenco.png",
  "img/brands/mor.png",
  "img/brands/motri.png",
  "img/brands/mpesa.png",
  "img/brands/nib.png",
  "img/brands/noor-icon.png",
  "img/brands/noor-logo.png",
  "img/brands/oromia.png",
  "img/brands/rays.png",
  "img/brands/sacco-amigos.svg",
  "img/brands/sacco-awach.svg",
  "img/brands/sacco-dil.svg",
  "img/brands/sacco-yehulu.svg",
  "img/brands/sahaypay.png",
  "img/brands/santim.png",
  "img/brands/semu.png",
  "img/brands/seregela.png",
  "img/brands/somrev.png",
  "img/brands/starpay.png",
  "img/brands/telebirr.png",
  "img/brands/telegram.png",
  "img/brands/tolo.svg",
  "img/brands/tsehay.png",
  "img/brands/twitter.png",
  "img/brands/vision.png",
  "img/brands/vitabirr.svg",
  "img/brands/vite.png",
  "img/brands/webirr.png",
  "img/brands/websprix.png",
  "img/brands/yagout.png",
  "img/brands/yaya.png",
  "img/brands/youtube.png",
  "img/brands/zagol.png",
  "img/brands/zemen.png",
  "img/cbe-logo-light.png",
  "img/cbe-logo.png",
  "img/fingerprint-dark.png",
  "img/fingerprint-light.png",
  "img/icon-192.png",
  "img/icon-512.png",
  "img/icon-maskable-512.png",
  "img/map.png",
  "img/stamp.png",
  "index.html",
  "js/app.js",
  "js/core/brands.js",
  "js/core/capture.js",
  "js/core/fees.js",
  "js/core/guard.js",
  "js/core/i18n.js",
  "js/core/icons.js",
  "js/core/install.js",
  "js/core/qr.js",
  "js/core/router.js",
  "js/core/store.js",
  "js/core/ui.js",
  "js/core/util.js",
  "js/screens/auth.js",
  "js/screens/home.js",
  "js/screens/misc.js",
  "js/screens/receipt.js",
  "js/screens/receive.js",
  "js/screens/services.js",
  "js/screens/settings.js",
  "js/screens/transactions.js",
  "js/screens/transfer.js",
  "manifest.json"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match('index.html')))
  );
});
