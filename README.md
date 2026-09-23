# CBE Mobile Banking

A pixel-faithful, fully offline replica of the CBE Mobile Banking app, built as a
plain web app (no framework, no build step, no network calls).

## Run it

Open `index.html` directly, or serve the folder:

```bash
python -m http.server 8000
# then open http://127.0.0.1:8000/index.html
```

Add `?dev=1` to the URL to skip service-worker registration while developing.

## Layout

```
index.html          the shell (screen layer, overlay layer, toast layer)
css/
  tokens.css        colours, spacing, radii, shadows, type
  layout.css        app shell, layers, appbar, tab bar
  components.css    buttons, fields, sheets, rows, switches, keypads
  screens.css       one block per screen, matching ui/ reference shots
js/
  core/
    util.js         template tag, formatters, money/date helpers
    icons.js        inline SVG icon set
    brands.js       bank and wallet brand marks
    qr.js           self-contained QR encoder (byte mode, ECC L–H)
    overlay.js      sheet / modal / toast stack
    store.js        state, seeded data, service-charge and tax maths
    router.js       screen registry, mounting, history, swipe
  screens/
    auth.js         splash, sign-in (biometrics first), PIN, Verify Identity
    home.js         home, transactions, accounts, statements
    transfer.js     CBE Transfer, Other Transfers, bank list, confirm sheet
    receipt.js      Thank-you receipt, downloaded receipt, full customer receipt
    services.js     airtime, bills, wallets, cards, loans, QR, support
    settings.js     settings, subpages, receipts list, hidden setup
    misc.js         remaining surfaces
  app.js            the single action table every button is wired through
img/                logo, fingerprint marks, bank stamp, brand logos
ui/                 the reference screenshots the UI was built against
```

## Notes

- **Sign-in** always starts at the logo loading screen, then the fingerprint
  prompt, with PIN as the fallback — matching the reference app.
- **Service charge, VAT and disaster-recovery** figures are computed, not
  hard-coded: the charge comes from settings, VAT and DRF are percentages of it,
  and a transfer debits exactly `amount + service + vat + drf`.
- **Offline**: `sw.js` precaches the shell so the app opens with no connection.
- The account holder, the incoming-transfer details and the charge rates are all
  editable at runtime; every receipt is generated from whatever is stored.

## Deploy

The repo is pure static files, so GitHub Pages can serve it straight from `main`.
