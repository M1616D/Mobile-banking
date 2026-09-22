# CBE Mobile Banking — offline web app replica

A pixel-faithful, **100% offline** replica of the Commercial Bank of Ethiopia
mobile banking app, rebuilt from the screenshots in `ui/` and `ui/another/`.
No frameworks, no build step, no CDN, no network calls — plain HTML + CSS +
vanilla JavaScript.

## Run it

```bash
# any static server works (needed only for the service-worker/PWA extras)
python -m http.server 8137
# then open http://127.0.0.1:8137/index.html
```

Opening `index.html` straight from the file system also works — every asset path
is relative. On a phone, use the browser's *Add to Home screen* and it launches
full-screen with no browser chrome.

## It is a web app, not a phone mock-up

There is no drawn phone, no bezel, no fake status bar — no clock, no battery,
no Wi-Fi or network bars. The layout is the real app: it fills the viewport
(`100dvh`), respects `env(safe-area-inset-*)` for notches, and on a wide screen
it simply centres itself at a comfortable width instead of pretending to be a
device.

## Demo credentials

| What | Value |
| --- | --- |
| Login / transaction PIN | `123456` |
| Biometrics | tap the purple fingerprint button (simulated) |
| Account | Bereket Mamuye Beyene, `1********3619`, ETB 5,005.71 |

## What was replicated

**Auth** – splash (dark, white logo tile) → login (bell, language pill, 4-cube
icon, gold CBE logo, *Welcome back*, PIN field with the lock, the purple
fingerprint sensor, `USE BIOMETRICS`, gold **Login**) with the
*Authenticating…* card whose arc sweeps around the fingerprint line-art, then
the *Authenticated!* tick. The CBE NOOR variant, the *Use PIN* link and the
6-dot PIN keypad screen (including the red *This field is required* state) are
all there too.

**Home** – purple hero with greeting, language switch, refresh and search; the
dark balance card (balance + eye toggle that swaps the amount for asterisks
**and** the account number between `1********3619` and the full number, plus
copy and the timestamp); amber motif; quick actions (Mini Statement, Cash Out,
Bill Share, Cards + “more”); the service grid (CBE Transfer, Receive, Airtime,
Other Transfers, CBEBirr, Bills & Utilities, Banking, Government, Pay to
Merchant, Travel, Shopping, Entertainment, Pay for, Tax Payment, ESL, CBE Fast
Loan); floating bar (Branches, **Scan QR**, Agents) and the cream
Home/Transactions/Settings tab bar. **The 4-cube icon opens My Information.**

**My Information** – holder name with *Last Sign In*, Contact Us, the CBE NOOR
switch, the My Accounts / Phone Number segmented control, the account QR with
*Scan this account number.* and the masked number, then the gold **Log out**
button. **Contact Us** carries the logo, `Version: 6.1.0`, the three contact
addresses and the five social rows.

**Transactions** – All / Debited / Credited tabs with the search icon,
colour-coded rows (red arrow out, green arrow in) with the amount, the relative
date and the `ACCOUNT TO ACCOUNT` / `TRANSFER` tag, then the detail screen.

**Other Services** – the two-column grid the 4-cube icon opens before sign-in:
Exchange Rates, Internet Banking, USSD, Verify Receipt, Feedback, CBE Locator,
Call Center, Privacy Policy, Terms and Tariffs, Survey and CBE Links.

**Transfers** – CBE Transfer (dark *From Account* card with the hidden-number
dots, account number, amount, *Add remark*, **Continue**, Recent Transfers /
Beneficiaries) → Transfer review → **Please Confirm** (From · To · Total Amount,
Cancel · Continue) → **Verify Identity** → the PIN pad → **Thank you /
Transaction Completed Successfully!** with the summary card, QR,
Receipt · Screenshot · Share and Close → the full
`breciept.cbe.com.et` customer receipt with the stamp, amount in words, QR and
**Download PDF**.

**Other Transfers** – separate cards for Wallet, Transfer to Other Banks (the
searchable *Bank Name* sheet: logo + name rows with the search field, exactly
like the photos), Transfer to Micro Finances and SACCO. **Airtime** (Ethio
telecom / Safaricom, self or others), **Bills & Utilities** (all eight
billers), **CBEBirr**, **Receive Money** (live QR, Share / Copy link / Download
/ Add amount), Mini Statement, Cash Out, Bill Share, Cards, Banking, Government
Services, Branches, Agents, Loan, Forex, Withdrawal History, Settings and its
sub-pages.

**Real brand artwork** – the uploaded logos are shipped in
`assets/img/brands/` and used everywhere a brand appears (abay, addis, ahadu,
amhara, awash, abyssinia, berhan, bunna, nib, tsehay, zemen, telebirr, ebirr,
mpesa, yaya, binget, sahaypay, ethiotelecom), plus the CBE logo and the
fingerprint line-art (white for the sensor disc, purple for the light sheets).
Banks without artwork fall back to a colour-matched monogram tile, so nothing is
ever missing or broken.

**Language** – English ⇄ አማርኛ switches the whole shell and uses the Ethiopic
font stack; verified with no layout overflow in Amharic.

## Receipts

* The on-screen receipt is the exact reference layout: purple gradient header
  with the shield and the *Thank you / Success*, the overlapping tick badge,
  *Transaction Completed Successfully!*, the serif narrative paragraph with the
  payer, receiver, date, transaction ID, reason and the full charge breakdown,
  the QR, the CBE logo and tagline, then Receipt · Screenshot · Share · Close.
* **Screenshot** writes a plain, self-contained copy of that receipt — inline
  CSS, inline QR, the logo inlined as a data URI, no buttons — named
  `CBE-Receipt-<ref>.html`, which is exactly the “downloaded receipt” layout.
* **Receipt** opens the full customer receipt, whose **Download PDF** writes the
  same paper as a standalone file and whose print button renders it into a
  hidden iframe so *Save as PDF* can never be popup-blocked.
* Every charge printed on them is computed: service charge, VAT 15 % of the
  charge and Disaster Recovery 5 % of the charge.

## Engineering notes

* **Smoothness** – only `transform` / `opacity` / `background-color` are ever
  animated, there is no `backdrop-filter` anywhere, every scroll container has
  `contain`, rows and tiles use `translateZ(0)` for GPU compositing,
  `touch-action: manipulation` removes the 300 ms tap delay, and `100dvh`
  avoids mobile viewport jumps while scrolling. Screens are painted as a single
  `innerHTML` swap — no framework diffing between frames.
* **Responsive** – no horizontal overflow at 320 × 568, 390 × 844 and
  1024 × 820; the two-column grids hold all the way down to 320 px.
* **State** – balance, accounts, transactions, recipients, the receiver, the
  fee rates, PIN and preferences persist in `localStorage`; the session always
  starts locked.
* **Offline** – `sw.js` is network-first with a cache fallback, so a fresh copy
  is used when the file is newer and the cached copy keeps the app working with
  no connection at all. No external request is ever made.

## Layout

```
index.html                  app shell (no chrome, no status bar)
manifest.json  sw.js        installable PWA + offline cache
assets/css/app.css          one stylesheet — all components, all breakpoints
assets/js/qr.js             offline QR generator (no library, no CDN)
assets/js/data.js           banks, wallets, billers, SACCOs, strings (EN/AM)
assets/js/ui.js             icons, real logos, formatters, sheets, toasts
assets/js/core.js           state, storage, router, fee maths, pickers,
                            payment pipeline, receipt model
assets/js/screens-*.js      auth · home · services · transfer · payments ·
                            settings · receipt · app (event delegation, boot)
assets/img/                 cbe-logo, fingerprint, fingerprint-white, brands/
```
