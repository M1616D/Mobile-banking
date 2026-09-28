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
   Cache-first for assets: every asset is stored on install so the app runs
   with no network at all.  Opening index.html straight from disk works even
   without this worker, because nothing in the app ever requests a remote
   resource.

   Updates: the cache name carries a content hash, so every deploy installs a
   brand new worker.  `skipWaiting` + `clients.claim` swap it in immediately,
   activate drops the previous cache, and every open page is then told to
   reload so an installed device never keeps running the old build.  The
   document itself is fetched network-first, so even a plain reload cannot
   serve a stale shell while the new worker is still catching up. */
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
      .then(() => self.clients.matchAll({{ type: 'window' }}))
      .then((clients) => clients.forEach((client) => client.postMessage({{ type: 'cbe-updated', cache: CACHE }})))
  );
}});

self.addEventListener('fetch', (event) => {{
  const req = event.request;
  if (req.method !== 'GET') return;
  const path = new URL(req.url).pathname;
  /* the shell and the manifest are the two things that must never be stale:
     a navigation or a manifest read goes to the network first when there is
     one, and falls back to the cached copy so the app still opens with no
     connection at all.  The manifest also names the installed app, so serving
     a cached copy could keep an old home-screen label alive for good. */
  if (req.mode === 'navigate' || path.slice(-13) === 'manifest.json') {{
    event.respondWith(
      fetch(req)
        .then((res) => {{
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {{}});
          return res;
        }})
        .catch(() => caches.match(req).then((hit) => hit || caches.match('index.html')))
    );
    return;
  }}
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

self.addEventListener('message', (event) => {{
  if (event.data && event.data.type === 'cbe-skip-waiting') self.skipWaiting();
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
