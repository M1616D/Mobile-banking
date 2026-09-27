# CBE Mobile Banking

A from-scratch, offline-capable replica of the Commercial Bank of Ethiopia
mobile-banking app: the same screens, spacing, typography and brand assets as
the design reference, with the money maths actually working.

No build step, no framework, no network calls. Open `index.html` and it runs.

```
python3 -m http.server 8000     # then browse to http://localhost:8000/
```

## What is in here

| path | what it is |
| --- | --- |
| `index.html` | the app shell – everything else is loaded from here |
| `css/tokens.css` | colours, type scale and geometry measured off the design |
| `css/base.css` | reset, phone shell, screen stack and transitions |
| `css/components.css` | app bar, list rows, tiles, fields, sheets, keypads |
| `css/screens.css` | per-screen layout |
| `js/core/` | `util`, `icons`, `qr`, `fees`, `store`, `brands`, `guard`, `ui`, `router`, `install`, `capture` |
| `js/screens/` | `auth`, `home`, `transactions`, `transfer`, `receipt`, `receive`, `services`, `settings`, `misc` |
| `img/` | every runtime asset, extracted from the design folder with clean names |
| `sw.js` | generated service worker – precaches all 112 assets for offline use |
| `tools/` | the scripts that regenerate `img/` and `sw.js` |

## Behaviour worth knowing

**Money.** `js/core/fees.js` owns every figure. The service charge comes from
the published amount bands, VAT is 15% of it, the Disaster Risk Response Fund
contribution is 5%, and half-up rounding on integer cents reproduces the
reference receipt exactly (546.00 + 0.50 + 0.08 + 0.03 = 546.61). Sending money
debits the total, and the confirmation sheet, the balance and the receipt all
read from the same object, so they can never disagree.

**Offline.** `sw.js` is cache-first over a hash-named cache, so a new build
invalidates the old one. On `127.0.0.1`/`localhost` the worker is deliberately
unregistered so edits are never shadowed by a stale cache.

**Hidden configuration.** Tapping the version string on the Settings screen
five times in a row opens a panel that edits the account holder name, the main
account number and balance, and the custom receiver name. There is no label,
icon or hint anywhere for that gesture. Any 13-digit account number typed on
the transfer screen is shown as that custom receiver (default
`Abreham Bekalu`).

**Screen capture.** Sensitive screens (the receipt and the statement) mark
themselves secure: the shell enters a guarded state that suppresses the context
menu, dragging and gestures. On the receipt, *Screenshot* copies the receipt
itself — not the app chrome — into a 720×1600 PNG via `js/core/capture.js`, an
SVG `foreignObject` rasteriser with the styles and images frozen inline.

**Documents.** The official statement is laid out at 720 units wide and scaled
into the phone, which is how the reference shows it.

**Install prompt.** The build is installable (manifest + service worker). The
only place the app ever invites you to install it is a banner on the login
screen, shown once the browser reports an install prompt on a device that has
not decided yet. Dismissing it — or installing — is remembered per device, and
no other screen carries an install surface.

## Regenerating assets

`tools/build-assets.py` expects the design reference folder (`ui/`) next to the
project; it is kept locally only and is not committed.

```
python3 tools/build-assets.py    # ui/  -> img/ with clean web-safe names
python3 tools/build-sw.py        # rewrite sw.js with a fresh cache hash
```
