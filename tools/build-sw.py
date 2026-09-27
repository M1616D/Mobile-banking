#!/usr/bin/env python3
"""Generate sw.js with every app asset precached for fully offline use."""
import hashlib
import json
import os

CORE = [
    "index.html", "manifest.json",
    "css/tokens.css", "css/base.css", "css/components.css", "css/screens.css",
    "js/app.js",
    "js/core/util.js", "js/core/icons.js", "js/core/qr.js", "js/core/fees.js",
    "js/core/store.js", "js/core/i18n.js", "js/core/brands.js", "js/core/guard.js",
    "js/core/ui.js", "js/core/router.js", "js/core/install.js", "js/core/capture.js",
    "js/screens/auth.js", "js/screens/home.js", "js/screens/transactions.js",
    "js/screens/transfer.js", "js/screens/receipt.js", "js/screens/receive.js",
    "js/screens/services.js", "js/screens/settings.js", "js/screens/misc.js",
]

TEMPLATE = """/* CBE Mobile Banking - offline service worker.
   Cache-first: every asset is stored on install so the app runs with no
   network at all. Opening index.html straight from disk works even without
   this worker, because nothing in the app ever requests a remote resource. */
const CACHE = 'cbe-mobile-{version}';
const ASSETS = {assets};

self.addEventListener('install', (event) => {{
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
}});

self.addEventListener('activate', (event) => {{
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
}});

self.addEventListener('fetch', (event) => {{
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req)
      .then((res) => {{
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {{}});
        return res;
      }})
      .catch(() => caches.match('index.html')))
  );
}});
"""


def main():
    assets = list(CORE)
    for root, _dirs, files in os.walk("img"):
        for f in sorted(files):
            assets.append(os.path.join(root, f).replace(os.sep, "/"))
    assets.sort(key=lambda p: p)
    # cache name carries a content hash so every rebuild invalidates old caches
    digest = hashlib.sha1()
    for path in assets:
        digest.update(path.encode())
        try:
            with open(path, "rb") as fh:
                digest.update(str(os.path.getsize(path)).encode())
                digest.update(fh.read(4096))
        except OSError:
            pass
    version = digest.hexdigest()[:10]
    with open("sw.js", "w", encoding="utf-8", newline="\n") as fh:
        fh.write(TEMPLATE.format(assets=json.dumps(assets, indent=2), version=version))
    print("sw.js written with", len(assets), "precached assets, cache", version)


if __name__ == "__main__":
    main()
