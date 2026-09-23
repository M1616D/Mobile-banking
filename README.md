# CBE Mobile Banking — offline web app

A faithful **100% offline** rebuild of the Commercial Bank of Ethiopia mobile
banking app, matched screen by screen against the screenshots in `ui/`.
No frameworks, no build step, no CDN, no network calls — plain HTML + CSS +
vanilla JavaScript.

## Run it

```bash
# any static server works (only needed for the service-worker/PWA extras)
python -m http.server 8137
# then open http://127.0.0.1:8137/index.html
```

Opening `index.html` straight from the file system works too — every asset path
is relative. On a phone, *Add to Home screen* launches it full-screen.

## It is a web app, not a phone mock-up

No drawn phone, no bezel, no fake status bar — no clock, no battery, no Wi-Fi or
network icons. The layout is the app itself: it fills the viewport (`100dvh`),
respects `env(safe-area-inset-*)`, and on a wide screen centres itself at a
comfortable width instead of pretending to be a device.

## Demo credentials

| What | Value |
| --- | --- |
| PIN | `123456` |
| Sign-in | fingerprint is the default — tap the purple sensor, or *Use PIN* to type it |
| Account | Bereket Mamuye Beyene · `1******3619` · ETB 5,005.71 |

The balance starts masked (`******`); the eye on the balance card reveals the
amount **and** the full account number, and hides both again.

## The flow, as in the screenshots

**Splash** – white screen, the CBE gold logo inside a centred white plate, and
three pulsing dots.

**Sign-in** – the fingerprint is the default: bell · language · grid header,
gold CBE logo, *የኢትዮጵያ ንግድ ባንክ*, **COMMERCIAL BANK OF ETHIOPIA**, *Welcome
back*, the purple sensor disc, `USE BIOMETRICS` and the *Use PIN* link. The
sensor opens the native-looking *Fingerprint / Face* prompt, then the
*Authenticating…* card ticking around the fingerprint line-art, then a **green**
*Authenticated!* tick before the home page appears. *Use PIN* shows the PIN
field with the gold lock, the gold **Login →** button and the numeric keypad
(empty submit gets the red border and *This field is required*; the wrong PIN is
rejected and the session stays locked).

**Home** – purple hero (Hello / name, language pill, bell, search), the dark
balance card (gold bank name and tagline, balance with the eye, `Saving
Account`, timestamp), the amber motif, the four round tiles (Mini Statement,
Cash Out, Bill Share, Cards with the › more button), the two-per-row cards (CBE
Transfer · Send Money, Receive · Get Paid, Airtime, Other Transfers, CBEBirr,
Bills & Utilities), the Branches / **Scan QR** / Agents bar, ten more working
tools (CBE Fast Loan, Shopping, Tax Payment, Pay Merchant, Forex, Loan Products,
Micro Finance, SACCO, Traffic Fine, Donation) and the bottom bar whose selected
item is a **rounded cream pill**. The 4-cube header icon opens **My
Information**.

**My Information** – name with *Last Sign In*, Contact Us, the CBE NOOR switch,
the My Accounts / Phone Number segmented control, the account QR with *Scan this
account number.* and the gold **Log out**.

**Transactions** – All / Debited / Credited with the search icon and the
colour-coded rows from the screenshots (Yfuri Hanna, Hizkel Wana, Wisenbet
Wondimu, Eyob Sintayehu, Mamuye Beyene), each opening its detail page.

**CBE Transfer** – starts blank. The dark *From Account* card, then **Account
Number** and **Amount\*** with a clear gap between them (they never touch), *+
Add remark* with *\*Default: MB transfer*, **Continue**, then Recent Transfers /
Beneficiaries. An account shorter than **13 digits is refused** with a red field
and *Account number must be 13 digits*. Only after **Continue** does the
`Transfer to <name>` card appear — with the default receiver **Abel Yakob**
until the hidden setup or the history overrides it. Picking a row from the
history fills the name and account and asks for the amount only. Then **Please
Confirm** (From · To · Total Amount · Cancel/Continue) → the sensor prompt →
**Verify Identity** → the green *Biometrics Authenticated!* → the PIN pad →
**Thank you / Transaction Completed Successfully!**

**Receipts** – the success card is the exact reference layout (purple header
with the tick and *Thank you · Success*, the overlapping badge, the summary
block, the QR, the logo, Receipt · Screenshot · Share and Close). *Receipt*
opens the full `Customer Receipt` page — company and customer columns, the
payment table, the round bank stamp **centred on the table**, the amount in
words, the QR and **Download PDF**, which writes a standalone receipt file
offline (print renders the same paper into a hidden iframe so *Save as PDF* is
never popup-blocked). Fees are always calculated: service charge, VAT 15 % of
the charge, Disaster Recovery 5 % of the charge.

**Services** – Other Services (before *or* after sign-in: the two-column grid;
before sign-in it shows **no tab bar** and asks for the fingerprint/PIN before
opening anything), Exchange Rates, Internet Banking, USSD, Verify Receipt,
Feedback, CBE Locator, Call Center, Privacy Policy, Terms and Tariffs, Survey,
CBE Links, Airtime (Ethio telecom / Safaricom, self or others), Bills &
Utilities, CBEBirr, Receive Money (live QR, Share / Copy link / Download / Add
amount), Mini Statement, Cash Out, Bill Share, Cards (freeze, limits), Branches,
Agents, Government Services, Loans, Pay for / Pay to Merchant, Shopping,
Withdrawal History, Settings and every settings sub-page.

**Settings** – Language, Account Preferences, Notification Preferences, Service
Preferences · Biometric Login, Change PIN, Change Passphrase · Log out, then
`Version: 6.1.0` and Privacy Policy · Terms and Tariffs.

## Real brand artwork

Every uploaded logo ships in `assets/img/brands/` and is used wherever the brand
appears — abay, addis, ahadu, amhara, awash, abyssinia, berhan, bunna, nib,
tsehay, zemen, telebirr, ebirr, mpesa, yaya, binget, sahaypay, ethiotelecom —
plus the CBE logo, the fingerprint line-art (white on the sensor disc, purple on
the light sheets) and the bank stamp. Brands without artwork fall back to a
colour-matched monogram tile, so nothing is ever broken or missing.

## Engineering notes

* **Smoothness** – only `transform`, `opacity` and `background-color` animate,
  there is no `backdrop-filter`, every scroll container uses `contain`, and a
  screen change is a single `innerHTML` swap. Measured while scrolling the home
  page: median frame 16.7 ms, p95 17.0 ms, worst 17.2 ms (a locked 60 fps).
* **Responsive** – no horizontal overflow from 320 px up; the two-column grids
  hold all the way down.
* **State** – balance, accounts, transactions, recipients, the receiver, the fee
  rates, the PIN and preferences persist in `localStorage`; the session always
  starts locked.
* **Offline** – `sw.js` is network-first with a cache fallback, so a fresh copy
  is used when the file is newer and the cached copy keeps the app working with
  no connection. No external request is ever made.
* **Language** – English ⇄ አማርኛ switches the shell and the home tiles.

## Layout

```
index.html                  app shell (no chrome, no status bar)
manifest.json  sw.js        installable PWA + offline cache
assets/css/app.css          one stylesheet — all components, all breakpoints
assets/js/qr.js             offline QR generator (no library, no CDN)
assets/js/data.js           banks, wallets, billers, SACCOs, strings (EN/AM)
assets/js/ui.js             icons, real logos, formatters, sheets, fragments
assets/js/core.js           state, storage, router, sign-in gate, fee maths,
                            pickers, payment pipeline, receipt model
assets/js/screens-auth.js   splash · sign-in · PIN sign-in · other services
assets/js/screens-home.js   home · transactions · detail · notifications · search
assets/js/screens-services.js  every service and payment page
assets/js/screens-transfer.js  CBE Transfer · other transfers · wallet · scanner
assets/js/screens-settings.js  settings · My Information · Contact Us · setup
assets/js/screens-receipt.js   success receipt · full receipt · download/print
assets/js/app.js            event delegation, action table, boot
assets/img/                 cbe-logo, fingerprint, fingerprint-white, bank-stamp, brands/
ui/                         the reference screenshots the UI was matched against
```
