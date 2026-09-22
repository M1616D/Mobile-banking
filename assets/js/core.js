/* ==========================================================================
   core.js — state, storage, i18n, router, shared flows (confirm → biometric
   → PIN → receipt), fee maths, pickers and the private (hidden) setup.
   ========================================================================== */
(function (global) {
  'use strict';
  var CBE = global.CBE || (global.CBE = {});
  var U = CBE.ui;

  var STORE_KEY = 'cbe-mobile-banking-v3';

  function round2(v) { return Math.round((Number(v) || 0) * 100) / 100; }

  /* --------------------------------------------------------------- state
     `profile` is what the private settings screen edits; everything the user
     sees (greeting, balance card, receipts) reads from it. */
  var state = {
    lang: 'en',
    authed: false,
    showBalance: true,
    accountIndex: 0,
    biometric: true,
    biometricTxn: true,
    /* the login screen + the balance card follow the CBE NOOR switch that
       lives on the My Information page */
    noor: false,
    pin: '123456',
    profile: {
      holderName: 'Bereket Mamuye Beyene',
      accountNumber: '1000407533619',
      balance: 5005.71,
      phone: '+251902468625',
      tin: '0000006966',
      lastSignIn: 'Sep 22, 2026 - 06:27 PM'
    },
    /* the receiver the private setup issues coming transfers to. Empty until it
       is filled in, so every field of the transfer form starts blank. */
    preset: {
      name: '',
      account: ''
    },
    /* every receipt charge is calculated from these rates */
    feeCfg: { sc: 0.50, vatPct: 15, drfPct: 5 },
    receiptMeta: {
      company: 'Commercial Bank of Ethiopia',
      branch: 'Ras Desta Damtew St, Kera',
      country: 'Ethiopia',
      city: 'Addis Ababa',
      address: 'Ras Desta Damtew St, Kera',
      postal: '255',
      poBox: '255',
      swift: 'CBETETAA',
      email: 'info@cbe.com.et',
      tel: '+251-551-50-04',
      fax: '+251-551-45-22',
      tin: '0000006966',
      vatRegNo: '017140',
      vatRegDate: '01/01/2003',
      footer: 'The Bank you can always rely on.'
    },
    accounts: CBE.data.accounts.slice(),
    transactions: CBE.data.transactions.slice(),
    recents: CBE.data.recents.slice(),
    beneficiaries: CBE.data.beneficiaries.slice(),
    seenSplash: false
  };

  /* keep the primary account row and the profile in step */
  function syncAccount() {
    var p = state.profile;
    var a = state.accounts[0];
    if (!a) return;
    a.full = String(p.accountNumber);
    a.account = U.maskAccount(p.accountNumber);
    a.label = 'Saving Account ' + a.account;
    a.balance = round2(p.balance);
    state.balance = a.balance;
  }

  /* ----------------------------------------------------------- state api */
  Object.defineProperty(state, 'account', {
    get: function () {
      syncAccount();
      return state.accounts[state.accountIndex] || state.accounts[0];
    }
  });
  Object.defineProperty(state, 'user', {
    get: function () {
      var p = state.profile;
      return {
        name: p.holderName,
        short: String(p.holderName || '').split(/\s+/)[0] || p.holderName,
        account: U.maskAccount(p.accountNumber),
        full: String(p.accountNumber),
        balance: round2(p.balance),
        phone: p.phone,
        tin: p.tin,
        lastSignIn: p.lastSignIn
      };
    }
  });

  /* --------------------------------------------------------- persistence */
  function load() {
    try {
      var raw = global.localStorage && localStorage.getItem(STORE_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        Object.keys(saved).forEach(function (k) {
          if (k === 'authed') return;                 // always start locked
          if (!(k in state)) return;
          if (k === 'profile' || k === 'preset' || k === 'receiptMeta') {
            Object.keys(saved[k] || {}).forEach(function (kk) { state[k][kk] = saved[k][kk]; });
          } else {
            state[k] = saved[k];
          }
        });
      }
    } catch (e) { /* storage unavailable — stay in-memory */ }
    /* migrate the older store shape if it is still around */
    try {
      var legacy = global.localStorage && localStorage.getItem('cbe-mobile-banking-v1');
      if (legacy && !global.localStorage.getItem(STORE_KEY)) {
        var old = JSON.parse(legacy);
        if (old.balance != null) state.profile.balance = old.balance;
        if (old.pin) state.pin = old.pin;
      }
    } catch (e) { /* ignore */ }
    syncAccount();
  }
  function save() {
    try {
      if (global.localStorage) localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) { /* ignore */ }
  }
  function resetAll() {
    try {
      if (global.localStorage) {
        localStorage.removeItem(STORE_KEY);
        localStorage.removeItem('cbe-mobile-banking-v1');
      }
    } catch (e) { /* ignore */ }
    state.profile.balance = CBE.data.user.balance;
    state.profile.holderName = CBE.data.user.name;
    state.profile.accountNumber = CBE.data.user.full;
    state.accounts = CBE.data.accounts.slice();
    state.transactions = CBE.data.transactions.slice();
    state.recents = CBE.data.recents.slice();
    state.beneficiaries = CBE.data.beneficiaries.slice();
    state.accountIndex = 0;
    state.showBalance = false;
    state.preset = { name: '', account: '' };
    state.noor = false;
    syncAccount();
    save();
  }

  /* ---------------------------------------------------------------- i18n */
  function t(key) {
    var s = CBE.data.strings[state.lang] || CBE.data.strings.en;
    if (s && s[key] != null) return s[key];
    return CBE.data.strings.en[key] != null ? CBE.data.strings.en[key] : key;
  }
  function toggleLang() {
    state.lang = state.lang === 'en' ? 'am' : 'en';
    save();
    render();
  }

  /* ------------------------------------------------------------ registry */
  var screens = {};
  function define(name, def) { screens[name] = def; }
  function get(name) { return screens[name]; }

  var stack = [{ name: 'home', params: {} }];
  var current = stack[0];

  function nav(name, params, opts) {
    opts = opts || {};
    var def = screens[name];
    if (!def) { console.warn('unknown screen', name); return; }
    if (opts.replace && stack.length) stack.pop();
    current = { name: name, params: params || {} };
    stack.push(current);
    if (opts.silent) return;
    render();
  }
  function back() {
    if (U.hasLayers()) { U.closeTop(); return; }
    if (stack.length <= 1) return;
    stack.pop();
    current = stack[stack.length - 1];
    render();
  }
  function reset(name, params) {
    U.closeAll();
    stack = [{ name: name, params: params || {} }];
    current = stack[0];
    render();
  }
  function currentScreen() { return current; }

  var rootNode = null;
  function render(target) {
    var node = rootNode || (rootNode = document.getElementById('screen-root'));
    if (!node) return;
    var c = target || current;
    var def = screens[c.name] || screens.home;
    node.innerHTML = def.render(c.params || {});
    var body = node.querySelector('.screen-body');
    if (body) body.scrollTop = 0;
    if (def.after) def.after(c.params || {});
  }

  /* -------------------------------------------------------------- helpers */
  function accountByIndex(i) { return state.accounts[i] || state.accounts[0]; }

  function fees(amount, apply) {
    amount = Number(amount) || 0;
    var cfg = state.feeCfg || { sc: 0.50, vatPct: 15, drfPct: 5 };
    if (!apply) return { sc: 0, vat: 0, drf: 0, total: amount };
    var sc = amount > 0 ? Number(cfg.sc) || 0 : 0;
    var vat = round2(sc * (Number(cfg.vatPct) || 0) / 100);
    var drf = round2(sc * (Number(cfg.drfPct) || 0) / 100);
    return { sc: round2(sc), vat: vat, drf: drf, total: round2(amount + sc + vat + drf) };
  }

  /* -------- receipt field resolution: a transaction can be edited, so the
     receipt always asks for the resolved values instead of raw storage ---- */
  function receiptOf(id) {
    var t = id ? state.transactions.filter(function (x) { return x.id === id; })[0] : state.transactions[0];
    if (!t) return null;
    var over = t.custom || {};
    var profile = state.profile;
    var amt = over.amount != null ? Number(over.amount) : Math.abs(t.amount);
    var out = t.amount < 0;
    return {
      txn: t,
      senderName: over.senderName != null ? over.senderName : profile.holderName,
      senderAccount: over.senderAccount != null ? over.senderAccount : String(profile.accountNumber),
      receiverName: over.receiverName != null ? over.receiverName : (t.to || t.name || ''),
      receiverAccount: over.receiverAccount != null ? over.receiverAccount : (t.toAcc || ''),
      /* the unmasked digits, so a receipt can rewrite the number safely */
      receiverAccountRaw: over.receiverAccountRaw != null ? over.receiverAccountRaw
        : (t.toAccRaw || String(t.toAcc || '').replace(/\D/g, '')),
      receiverBank: over.receiverBank != null ? over.receiverBank : (t.bank || 'Commercial Bank of Ethiopia'),
      amount: amt,
      direction: out ? 'debit' : 'credit',
      remark: over.remark != null ? over.remark : (t.remark || 'MB Transfer'),
      reasonType: over.reasonType != null ? over.reasonType : (t.kind === 'airtime' ? 'Airtime Topup' : t.kind === 'bill' ? 'Bill Payment' : t.kind === 'wallet' ? 'Wallet Transfer' : 'MB Transfer'),
      charges: over.charges != null ? !!over.charges : !!t.charges,
      date: over.date || t.date,
      ref: over.ref || t.ref,
      edited: Object.keys(over).length > 0
    };
  }

  function applyReceiptFields(id, fields) {
    var t = state.transactions.filter(function (x) { return x.id === id; })[0];
    if (!t) return null;
    var out = t.amount < 0;
    t.custom = t.custom || {};
    t.custom.senderName = fields.senderName;
    t.custom.senderAccount = fields.senderAccount;
    t.custom.receiverName = fields.receiverName;
    if (fields.receiverAccountRaw != null && fields.receiverAccountRaw !== '') {
      t.custom.receiverAccountRaw = String(fields.receiverAccountRaw).replace(/\D/g, '');
      t.custom.receiverAccount = U.maskAccount(t.custom.receiverAccountRaw);
      t.toAccRaw = t.custom.receiverAccountRaw;
      t.toAcc = t.custom.receiverAccount;
    } else {
      t.custom.receiverAccount = fields.receiverAccount;
    }
    t.custom.remark = fields.remark;
    if (fields.amount != null && fields.amount !== '') {
      t.custom.amount = round2(fields.amount);
      t.amount = out ? -round2(fields.amount) : round2(fields.amount);
    }
    if (fields.charges != null) t.custom.charges = !!fields.charges;
    var f = fees(t.custom.amount != null ? t.custom.amount : Math.abs(t.amount), t.custom.charges != null ? t.custom.charges : t.charges);
    t.serviceCharge = f.sc; t.vat = f.vat; t.drf = f.drf; t.total = f.total;
    save();
    return t;
  }

  function record(payload) {
    var amt = Number(payload.amount) || 0;
    var f = fees(Math.abs(amt), payload.charges);
    var t = {
      id: 't' + Date.now() + Math.floor(Math.random() * 1000),
      name: payload.name || payload.to || 'CBE Transfer',
      date: new Date().toISOString(),
      amount: amt,
      tag: payload.tag || 'ACCOUNT TO ACCOUNT',
      to: payload.to || '',
      toAcc: payload.toAcc || '',
      toAccRaw: payload.toAccRaw || '',
      bank: payload.bank || 'Commercial Bank of Ethiopia',
      ref: payload.ref || U.ref(),
      charges: !!payload.charges,
      kind: payload.kind || 'transfer',
      remark: payload.remark || '',
      serviceCharge: f.sc, vat: f.vat, drf: f.drf, total: f.total
    };
    state.transactions.unshift(t);
    /* the balance moves by the exact debited total, charges included */
    var delta = amt < 0 ? -f.total : Math.abs(amt);
    state.profile.balance = round2(state.profile.balance + delta);
    syncAccount();
    save();
    return t;
  }

  function addRecent(name, account) {
    var exists = state.recents.some(function (r) { return r.account === account; });
    if (exists) return;
    state.recents.unshift({ id: 'r' + Date.now(), name: name, account: account, bank: 'Commercial Bank of Ethiopia' });
    save();
  }

  /* ------------------------------------------------ pickers (bottom sheets)*/
  function pickerSheet(title, items, onPick, opts) {
    opts = opts || {};
    function paintList(filter) {
      var f = (filter || '').toLowerCase();
      var shown = 0;
      var out = items.map(function (it, i) {
        var label = (it.name || it.label) + ' ' + (it.sub || it.account || '');
        if (f && label.toLowerCase().indexOf(f) < 0) return '';
        shown++;
        /* the bank / wallet sheet is a flat list with the real logo, no cards */
        if (opts.flat) {
          return '<button class="bank-row" data-pick="' + i + '">' +
            '<span class="lg">' + CBE.logoFor(it, 36) + '</span>' +
            '<span class="txt"><b>' + U.esc(it.name || it.label) + '</b></span></button>';
        }
        return '<button class="row" data-pick="' + i + '">' +
          (opts.logo ? '<span class="ico plain">' + CBE.logoFor(it, 34) + '</span>' : '') +
          '<span class="txt"><b>' + U.esc(it.name || it.label) + '</b>' +
          (it.sub || it.account ? '<small>' + U.esc(it.sub || it.account) + '</small>' : '') + '</span>' +
          '<span class="chev">' + CBE.icon('chevronRight', { size: 20 }) + '</span></button>';
      }).join('');
      return shown ? out : U.emptyState(t('noResults'));
    }
    var html = '<div class="grabber"></div><h2' + (opts.flat ? ' style="font-size:19px;color:#2b3138;margin:4px 0 16px"' : '') + '>' + U.esc(title) + '</h2>' +
      (opts.searchable ? '<div class="field" style="margin-bottom:12px"><span class="fico purple">' + CBE.icon('search', { size: 20 }) +
        '</span><input id="picker-search" placeholder="' + U.esc(t('search')) + '" autocomplete="off"></div>' : '') +
      '<div id="picker-list" class="' + (opts.flat ? 'bank-list' : '') + '" style="padding-bottom:6px">' + paintList('') + '</div>';

    U.open(html, {
      onMount: function (el) {
        var list = el.querySelector('#picker-list');
        el.addEventListener('click', function (e) {
          var btn = e.target.closest('[data-pick]');
          if (!btn) return;
          var item = items[Number(btn.getAttribute('data-pick'))];
          U.close(el);
          setTimeout(function () { onPick(item); }, 120);
        });
        var search = el.querySelector('#picker-search');
        if (search) {
          search.addEventListener('input', function () { list.innerHTML = paintList(search.value); });
          setTimeout(function () { search.focus(); }, 140);
        }
      }
    });
  }

  function pickAccount(cb) {
    pickerSheet(t('fromAccount'), state.accounts.map(function (a) {
      return { name: a.label, sub: U.moneyCur(a.balance), _acc: a };
    }), function (item) {
      var idx = state.accounts.indexOf(item._acc);
      if (idx >= 0) state.accountIndex = idx;
      save();
      (cb || render)();
      U.toast(t('fromAccount') + ': ' + item._acc.label);
    });
  }

  function pickBank(list, cb) {
    pickerSheet(t('bankName'), list, function (item) { cb(item); }, { searchable: true, logo: true, flat: true });
  }

  /* ------------------------------------------------------------- amounts */
  function amountSheet(title, onDone, initial) {
    var value = initial ? String(initial) : '';
    var html = '<button class="close-x" data-action="closeSheet" aria-label="Close">' + CBE.icon('x', { size: 17 }) + '</button>' +
      '<div class="grabber"></div><h2>' + U.esc(title || t('amount')) + '</h2>' +
      '<div class="field"><span class="fico">' + CBE.icon('cash', { size: 20 }) + '</span>' +
      '<input id="amount-input" inputmode="decimal" placeholder="' + U.esc(t('enterAmount')) + '" autocomplete="off">' +
      '<span class="tail" style="font-weight:700;color:#9aa1a8">ETB</span></div>' +
      '<div style="display:flex;gap:9px;flex-wrap:wrap;margin:14px 0 4px">' +
        [50, 100, 200, 500, 1000].map(function (v) {
          return '<button class="btn mini btn-soft" data-quick="' + v + '">' + v + '</button>';
        }).join('') +
      '</div>' +
      '<div class="keypad" id="amount-pad">' +
        [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return '<button data-k="' + n + '">' + n + '</button>'; }).join('') +
        '<button class="flat" data-k=".">.</button><button data-k="0">0</button>' +
        '<button class="flat danger" data-k="del">' + CBE.icon('x', { size: 20 }) + '</button>' +
      '</div>' +
      '<button class="btn btn-primary" id="amount-ok" style="margin-top:16px">' + U.esc(t('continue')) + '</button>';

    U.open(html, {
      onMount: function (el) {
        var input = el.querySelector('#amount-input');
        var ok = el.querySelector('#amount-ok');
        function paint() { input.value = value; ok.disabled = !(Number(value) > 0); }
        paint();
        el.addEventListener('click', function (e) {
          var k = e.target.closest('[data-k]');
          if (k) {
            var key = k.getAttribute('data-k');
            if (key === 'del') value = value.slice(0, -1);
            else if (key === '.') { if (value.indexOf('.') < 0) value = (value || '0') + '.'; }
            else if (value.length < 12) value += key;
            paint();
            return;
          }
          var q = e.target.closest('[data-quick]');
          if (q) { value = q.getAttribute('data-quick'); paint(); }
        });
        ok.addEventListener('click', function () {
          var v = Number(value);
          if (!(v > 0)) return;
          U.close(el);
          setTimeout(function () { onDone(v); }, 120);
        });
        input.addEventListener('input', function () { value = input.value.replace(/[^\d.]/g, ''); paint(); });
      }
    });
  }

  function textSheet(title, fields, onDone) {
    var html = '<button class="close-x" data-action="closeSheet" aria-label="Close">' + CBE.icon('x', { size: 17 }) + '</button>' +
      '<div class="grabber"></div><h2>' + U.esc(title) + '</h2>' +
      '<div class="edit-grid">' + fields.map(function (f) {
        return '<label><span class="field-label" style="margin:0 0 6px;display:block">' + U.esc(f.label) + '</span>' +
          '<div class="field">' + (f.icon ? '<span class="fico">' + CBE.icon(f.icon, { size: 20 }) + '</span>' : '') +
          '<input id="' + U.esc(f.id) + '" value="' + U.esc(f.value == null ? '' : f.value) + '"' +
          (f.inputmode ? ' inputmode="' + f.inputmode + '"' : '') +
          ' placeholder="' + U.esc(f.placeholder || '') + '"></div></label>';
      }).join('') + '</div>' +
      '<button class="btn btn-primary" id="text-ok" style="margin-top:18px">' + U.esc(t('continue')) + '</button>';

    U.open(html, {
      onMount: function (el) {
        el.querySelector('#text-ok').addEventListener('click', function () {
          var out = {};
          fields.forEach(function (f) {
            var input = el.querySelector('#' + f.id);
            out[f.id] = input ? input.value.trim() : '';
          });
          U.close(el);
          setTimeout(function () { onDone(out); }, 120);
        });
      }
    });
  }

  function pinSheet(title, onOk) {
    var value = '';
    var html = '<button class="close-x" data-action="closeSheet" aria-label="Close">' + CBE.icon('x', { size: 17 }) + '</button>' +
      '<div class="grabber"></div>' +
      '<div class="sheet-title-purple" style="margin-top:6px">' + U.esc(title || t('enterPinConfirm')) + '</div>' +
      '<div class="pin-dots" id="pin-dots"><i></i><i></i><i></i><i></i><i></i><i></i></div>' +
      '<button class="pad-cancel" data-action="closeSheet">' + U.esc(t('cancel')) + '</button>' +
      '<div class="keypad" id="pin-pad">' +
        [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return '<button data-k="' + n + '">' + n + '</button>'; }).join('') +
        '<button class="flat danger" data-k="del">' + CBE.icon('x', { size: 20 }) + '</button>' +
        '<button data-k="0">0</button>' +
        '<button class="flat ok" data-k="ok">' + CBE.icon('check', { size: 21 }) + '</button>' +
      '</div>';

    U.open(html, {
      dismissible: false,
      onMount: function (el) {
        var dots = el.querySelectorAll('#pin-dots i');
        function paint() {
          for (var i = 0; i < dots.length; i++) dots[i].classList.toggle('on', i < value.length);
        }
        function submit() {
          if (value.length < 6) { U.toast('Enter all 6 digits'); return; }
          if (value === state.pin) { U.close(el); setTimeout(function () { onOk(); }, 130); }
          else {
            value = '';
            paint();
            U.toast('Incorrect PIN. Demo PIN is 123456');
          }
        }
        el.addEventListener('click', function (e) {
          var k = e.target.closest('[data-k]');
          if (!k) return;
          var key = k.getAttribute('data-k');
          if (key === 'del') value = value.slice(0, -1);
          else if (key === 'ok') return submit();
          else if (value.length < 6) value += key;
          paint();
          if (value.length === 6) setTimeout(submit, 200);
        });
        paint();
      }
    });
  }

  /* biometric sheet: fingerprint artwork from the uploaded images, then the
     purple tick, then the PIN pad. */
  function bioSheet(opts) {
    opts = opts || {};
    var html = '<div class="grabber"></div>' +
      '<div class="bio-sheet">' +
      '<h2 style="text-align:center">' + U.esc(opts.title || t('verifyIdentity')) + '</h2>' +
      '<p class="sub">' + U.esc(opts.subtitle || t('scanFingerprint')) + '</p>' +
      '<div id="bio-stage">' +
        '<div class="bio-circle"><span class="arc"></span>' + CBE.fingerprintLine(72, 'fp') + '</div>' +
        '<p class="scan-title">Scan your fingerprint</p>' +
        '<p class="scan-sub">Place your finger on the sensor to confirm.</p>' +
      '</div>' +
      '<button class="btn btn-soft" data-action="closeSheet" style="margin-top:22px">' + U.esc(t('cancel')) + '</button>' +
      '</div>';

    U.open(html, {
      dismissible: false,
      onMount: function (el) {
        var stage = el.querySelector('#bio-stage');
        setTimeout(function () {
          stage.innerHTML =
            '<div class="ok-circle" style="width:92px;height:92px;border-radius:50%;background:#7b2cbf;color:#fff;display:grid;place-items:center;margin:0 auto 18px">' +
              CBE.icon('check', { size: 50, weight: 3 }) + '</div>' +
            '<p class="center" style="margin:0;font-size:17px;font-weight:700;color:#7b2cbf">' + U.esc(t('biometricsAuthenticated')) + '</p>' +
            '<p class="center muted" style="margin:8px 0 0;font-size:13.5px">' + U.esc(t('proceedPin')) + '</p>';
          setTimeout(function () {
            U.close(el);
            setTimeout(function () { if (opts.onDone) opts.onDone(); }, 150);
          }, 850);
        }, 1200);
      }
    });
  }

  /* the "Authentication failed" modal from the screenshots */
  function failModal(opts) {
    opts = opts || {};
    var el = U.open(
      '<div class="fail-circle">' + CBE.icon('x', { size: 46, weight: 3 }) + '</div>' +
      '<p class="fail-text" style="font-size:18px;font-weight:700">' + U.esc(opts.title || 'Authentication failed') + '</p>' +
      '<div class="modal-actions">' +
        '<button class="btn btn-gold" data-action="closeSheet" id="fail-retry">' + U.esc(opts.retry || 'Try Again') + '</button>' +
        '<button class="btn btn-outline" data-action="closeSheet">' + U.esc(opts.alternate || 'Use PIN Instead') + '</button>' +
      '</div>', { modal: true }
    );
    var retry = el.querySelector('#fail-retry');
    if (retry && opts.onRetry) retry.addEventListener('click', function () { setTimeout(opts.onRetry, 160); });
    return el;
  }

  /* ----------------------------------------------------- payment pipeline */
  var draft = null;

  function startPayment(d) {
    draft = d || {};
    if (!draft.amount || draft.amount <= 0) { U.toast('Enter a valid amount'); return; }
    confirmSheet();
  }

  function confirmSheet() {
    var d = draft;
    var withCharges = d.charges !== false;
    var f = fees(d.amount, withCharges);
    /* exact layout of the reference photo: From / To / Total Amount, then
       Cancel · Continue. The service charge, VAT and DRF are calculated here
       and printed on the receipt, not on this sheet. */
    var html = '<div class="grabber"></div>' +
      '<div class="confirm-sheet">' +
      '<h2>' + U.esc(t('pleaseConfirm')) + '</h2>' +
      '<div class="confirm-row"><span class="k">' + U.esc(t('from')) + '</span><span class="v">' +
        U.esc(d.fromName || state.profile.holderName) +
        '<small>' + U.esc(U.maskAccount(state.profile.accountNumber)) + '</small></span></div>' +
      '<div class="confirm-row"><span class="k">' + U.esc(t('to')) + '</span><span class="v">' +
        U.esc(d.toName || '—') +
        (d.toAcc ? '<small>' + U.esc(d.toAcc) + '</small>' : '') + '</span></div>' +
      '<div class="confirm-row total"><span class="k">' + U.esc(t('totalAmount')) + '</span><span class="v">' +
        U.money(d.amount) + ' <span class="cur">ETB</span></span></div>' +
      '<div class="btn-stack" style="margin-top:18px">' +
        '<button class="btn btn-cancel" data-action="closeSheet">' + U.esc(t('cancel')) + '</button>' +
        '<button class="btn btn-primary" data-flow="verify">' + U.esc(t('continue')) + '</button></div>' +
      '</div>';

    U.open(html, { dismissible: false, className: 'sheet' });
  }

  function verifyStep() {
    U.closeTop();
    setTimeout(function () {
      if (state.biometricTxn !== false) bioSheet({ onDone: pinStep });
      else pinStep();
    }, 150);
  }

  function pinStep() {
    pinSheet(t('enterPinConfirm'), function () { finishPayment(); });
  }

  function finishPayment() {
    var d = draft;
    var preset = state.preset || {};
    var receiverName = d.toName || d.name || preset.name || 'CBE Account Holder';
    var receiverAccount = d.toAcc || '';
    var txn = record({
      name: receiverName,
      amount: -Math.abs(d.amount),
      tag: d.tag || 'ACCOUNT TO ACCOUNT',
      to: receiverName,
      toAcc: receiverAccount,
      toAccRaw: d.toAccRaw || '',
      bank: d.bank || 'Commercial Bank of Ethiopia',
      charges: d.charges !== false,
      kind: d.kind || 'transfer',
      remark: d.remark || 'MB Transfer'
    });
    if (receiverName && receiverAccount) addRecent(receiverName, receiverAccount);
    draft = null;
    nav('receipt', { txnId: txn.id }, { replace: true });
    U.toast('Transfer completed');
  }

  function lastTxn(id) {
    if (!id) return state.transactions[0];
    return state.transactions.filter(function (t) { return t.id === id; })[0] || state.transactions[0];
  }

  /* --------------------------------------------------------- notifications*/
  var notifications = [
    { id: 'n1', title: 'Transfer successful', body: 'ETB 546.00 has been debited from your account.', date: '2026-09-21T14:22' },
    { id: 'n2', title: 'Credit alert', body: 'ETB 2,000.00 has been credited to your saving account.', date: '2026-09-16T20:09' },
    { id: 'n3', title: 'Security notice', body: 'New sign-in to CBE Mobile Banking on 21 Sep 2026 at 02:24 PM.', date: '2026-09-21T14:24' },
    { id: 'n4', title: 'Airtime purchase', body: 'ETB 50.00 airtime purchased for 0911****214.', date: '2026-09-12T19:04' }
  ];

  /* --------------------------------------------------------------- exports */
  CBE.state = state;
  CBE.t = t;
  CBE.define = define;
  CBE.screens = screens;
  CBE.nav = nav;
  CBE.back = back;
  CBE.reset = reset;
  CBE.currentScreen = currentScreen;
  CBE.render = render;
  CBE.save = save;
  CBE.load = load;
  CBE.syncAccount = syncAccount;
  CBE.toggleLang = toggleLang;
  CBE.accountByIndex = accountByIndex;
  CBE.fees = fees;
  CBE.record = record;
  CBE.addRecent = addRecent;
  CBE.receiptOf = receiptOf;
  CBE.applyReceiptFields = applyReceiptFields;
  CBE.round2 = round2;
  CBE.pickers = { sheet: pickerSheet, account: pickAccount, bank: pickBank };
  CBE.amountSheet = amountSheet;
  CBE.textSheet = textSheet;
  CBE.pinSheet = pinSheet;
  CBE.bioSheet = bioSheet;
  CBE.failModal = failModal;
  CBE.pay = { start: startPayment, confirm: confirmSheet, verify: verifyStep, pin: pinStep, finish: finishPayment, draft: function () { return draft; } };
  CBE.notifications = notifications;
  CBE.resetAll = resetAll;
  CBE.storeKey = STORE_KEY;
})(typeof window !== 'undefined' ? window : this);
