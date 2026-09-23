/* ==========================================================================
   core.js — state, storage, i18n, router, the login gate, the payment
   pipeline (confirm → biometrics → PIN → receipt), fee maths, pickers and the
   hidden setup screen's data.
   ========================================================================== */
(function (global) {
  'use strict';
  var CBE = global.CBE || (global.CBE = {});
  var U = CBE.ui;

  var STORE_KEY = 'cbe-mobile-banking-v4';
  var DEFAULT_RECEIVER = 'Abel Yakob';

  function round2(v) { return Math.round((Number(v) || 0) * 100) / 100; }

  /* --------------------------------------------------------------- state */
  var state = {
    lang: 'en',
    authed: false,
    showBalance: false,
    accountIndex: 0,
    biometric: true,
    biometricTxn: true,
    noor: false,
    pin: '123456',
    txnFilter: 'all',
    menuQuery: '',
    profile: {
      holderName: 'Bereket Mamuye Beyene',
      accountNumber: '1000407533619',
      balance: 5005.71,
      phone: '+251902468625',
      tin: '0000006966',
      lastSignIn: 'Sep 22, 2026 - 06:27 PM'
    },
    /* the receiver the hidden setup pre-fills coming transfers with. Empty
       until it is filled in, so the form always starts blank. */
    preset: {
      name: '',
      account: ''
    },
    /* every receipt charge is calculated from these rates */
    feeCfg: { sc: 0.50, vatPct: 15, drfPct: 5 },
    receiptMeta: {
      company: 'Commercial Bank of Ethiopia',
      country: 'Ethiopia',
      city: 'Addis Ababa',
      address: 'Ras Desta Damtew St, 01, Kirkos',
      postal: '255',
      swift: 'CBETETAA',
      email: 'info@cbe.com.et',
      tel: '+251-551-50-04',
      fax: '+251-551-45-22',
      tin: '0000006966',
      vatRegNo: '011140',
      vatRegDate: '01/01/2003'
    },
    accounts: CBE.data.accounts.slice(),
    transactions: CBE.data.transactions.slice(),
    recents: CBE.data.recents.slice(),
    beneficiaries: CBE.data.beneficiaries.slice(),
    withdrawals: [],
    hidden: { taps: 0 }
  };

  function syncAccount() {
    var p = state.profile;
    var a = state.accounts[0];
    if (!a) return;
    a.full = String(p.accountNumber);
    a.account = U.maskAccount(p.accountNumber);
    a.label = 'Saving Account ' + p.accountNumber;
    a.balance = round2(p.balance);
    state.balance = a.balance;
  }

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
  /* the receiver a coming transfer is issued to: whatever the hidden setup
     was given, otherwise the app default */
  Object.defineProperty(state, 'receiverName', {
    get: function () { return (state.preset && state.preset.name) || DEFAULT_RECEIVER; }
  });

  /* --------------------------------------------------------- persistence */
  function load() {
    try {
      var raw = global.localStorage && localStorage.getItem(STORE_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        Object.keys(saved).forEach(function (k) {
          if (k === 'authed' || k === 'hidden') return;   /* always start locked */
          if (!(k in state)) return;
          if (k === 'profile' || k === 'preset' || k === 'receiptMeta' || k === 'feeCfg') {
            Object.keys(saved[k] || {}).forEach(function (kk) { state[k][kk] = saved[k][kk]; });
          } else {
            state[k] = saved[k];
          }
        });
      }
    } catch (e) { /* storage unavailable — stay in-memory */ }
    if (state.biometric == null) state.biometric = true;
    if (state.biometricTxn == null) state.biometricTxn = true;
    syncAccount();
  }
  function save() {
    try {
      if (global.localStorage) localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) { /* ignore */ }
  }
  function resetAll() {
    try {
      if (global.localStorage) localStorage.removeItem(STORE_KEY);
    } catch (e) { /* ignore */ }
    state.profile.balance = CBE.data.user.balance;
    state.profile.holderName = CBE.data.user.name;
    state.profile.accountNumber = CBE.data.user.full;
    state.profile.phone = CBE.data.user.phone;
    state.profile.tin = CBE.data.user.tin;
    state.accounts = CBE.data.accounts.slice();
    state.transactions = CBE.data.transactions.slice();
    state.recents = CBE.data.recents.slice();
    state.beneficiaries = CBE.data.beneficiaries.slice();
    state.withdrawals = [];
    state.accountIndex = 0;
    state.showBalance = false;
    state.preset = { name: '', account: '' };
    state.feeCfg = { sc: 0.50, vatPct: 15, drfPct: 5 };
    state.noor = false;
    state.authed = false;
    syncAccount();
    save();
  }

  /* ---------------------------------------------------------------- i18n */
  function t(key) {
    var s = CBE.data.strings[state.lang] || CBE.data.strings.en;
    if (s && s[key] != null) return s[key];
    return CBE.data.strings.en[key] != null ? CBE.data.strings.en[key] : key;
  }
  function toggleLang() { setLang(state.lang === 'en' ? 'am' : 'en'); }
  function setLang(code) {
    state.lang = code === 'am' ? 'am' : 'en';
    save();
    render();
  }

  /* ------------------------------------------------------------ registry */
  var screens = {};
  function define(name, def) { screens[name] = def; }
  function get(name) { return screens[name]; }

  var stack = [{ name: 'splash', params: {} }];
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
    /* keep whatever the user already typed, and the scroll position, across
       a re-render so nothing is ever lost while the screen updates */
    var keep = {};
    var oldBody = node.querySelector('.screen-body');
    var scroll = oldBody ? oldBody.scrollTop : 0;
    Array.prototype.forEach.call(node.querySelectorAll('input'), function (input) {
      if (input.readOnly || !input.id) return;
      keep[input.id] = input.value;
    });
    node.innerHTML = def.render(c.params || {});
    Object.keys(keep).forEach(function (id) {
      var el = node.querySelector('#' + id);
      if (el && el.value !== keep[id]) el.value = keep[id];
    });
    var body = node.querySelector('.screen-body');
    if (body) body.scrollTop = def.keepScroll ? scroll : 0;
    if (def.after) def.after(c.params || {});
  }

  /* -------------------------------------------------------------- helpers */
  function fees(amount, apply) {
    amount = Number(amount) || 0;
    var cfg = state.feeCfg || { sc: 0.50, vatPct: 15, drfPct: 5 };
    if (apply === false) return { sc: 0, vat: 0, drf: 0, total: amount };
    var sc = amount > 0 ? Number(cfg.sc) || 0 : 0;
    var vat = round2(sc * (Number(cfg.vatPct) || 0) / 100);
    var drf = round2(sc * (Number(cfg.drfPct) || 0) / 100);
    return { sc: round2(sc), vat: vat, drf: drf, total: round2(amount + sc + vat + drf) };
  }

  function receiptOf(id) {
    var list = state.transactions;
    var tx = id ? list.filter(function (x) { return x.id === id; })[0] : list[0];
    if (!tx) return null;
    var over = tx.custom || {};
    var profile = state.profile;
    var amt = over.amount != null ? Number(over.amount) : Math.abs(tx.amount);
    var out = tx.amount < 0;
    return {
      txn: tx,
      senderName: over.senderName != null ? over.senderName : profile.holderName,
      senderAccount: over.senderAccount != null ? over.senderAccount : String(profile.accountNumber),
      receiverName: over.receiverName != null ? over.receiverName : (tx.to || tx.name || ''),
      receiverAccount: over.receiverAccount != null ? over.receiverAccount : (tx.toAcc || ''),
      receiverAccountRaw: over.receiverAccountRaw != null ? over.receiverAccountRaw
        : (tx.toAccRaw || String(tx.toAcc || '').replace(/\D/g, '')),
      amount: amt,
      direction: out ? 'debit' : 'credit',
      remark: over.remark != null ? over.remark : (tx.remark || 'MB Transfer'),
      reasonType: over.reasonType != null ? over.reasonType : (tx.kind === 'airtime' ? 'Airtime' : tx.kind === 'bill' ? 'Bill Payment' : tx.kind === 'wallet' ? 'Wallet Transfer' : 'MB Transfer'),
      paymentType: tx.kind === 'transfer' ? 'A2A' : 'A2A',
      charges: over.charges != null ? !!over.charges : !!tx.charges,
      date: over.date || tx.date,
      ref: over.ref || tx.ref
    };
  }

  function applyReceiptFields(id, fields) {
    var tx = state.transactions.filter(function (x) { return x.id === id; })[0];
    if (!tx) return null;
    var out = tx.amount < 0;
    tx.custom = tx.custom || {};
    tx.custom.senderName = fields.senderName;
    tx.custom.senderAccount = fields.senderAccount;
    tx.custom.receiverName = fields.receiverName;
    if (fields.receiverAccount != null) {
      var raw = String(fields.receiverAccount).replace(/\D/g, '');
      tx.custom.receiverAccountRaw = raw;
      tx.custom.receiverAccount = raw.length > 6 ? U.maskAccount(raw) : fields.receiverAccount;
      tx.toAccRaw = raw;
      tx.toAcc = tx.custom.receiverAccount;
      tx.to = fields.receiverName;
      tx.name = fields.receiverName;
    }
    tx.custom.remark = fields.remark;
    if (fields.amount != null && fields.amount !== '') {
      tx.custom.amount = round2(fields.amount);
      tx.amount = out ? -round2(fields.amount) : round2(fields.amount);
    }
    var f = fees(tx.custom.amount != null ? tx.custom.amount : Math.abs(tx.amount), tx.charges);
    tx.serviceCharge = f.sc; tx.vat = f.vat; tx.drf = f.drf; tx.total = f.total;
    save();
    return tx;
  }

  function record(payload) {
    var amt = Number(payload.amount) || 0;
    var f = fees(Math.abs(amt), payload.charges);
    var tx = {
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
      remark: payload.remark || 'MB Transfer',
      serviceCharge: f.sc, vat: f.vat, drf: f.drf, total: f.total
    };
    state.transactions.unshift(tx);
    var delta = amt < 0 ? -f.total : Math.abs(amt);
    state.profile.balance = round2(state.profile.balance + delta);
    syncAccount();
    save();
    return tx;
  }

  function addRecent(name, account, bank) {
    if (!name || !account) return;
    var exists = state.recents.some(function (r) { return r.account === account; });
    if (exists) return;
    state.recents.unshift({ id: 'r' + Date.now(), name: name, account: account, bank: bank || 'Commercial Bank of Ethiopia' });
    save();
  }

  /* ------------------------------------------------------ auth gate ------
     Everything behind the login is gated: the app only unlocks after the
     fingerprint or the PIN is given. */
  function requireAuth(then) {
    if (state.authed) { if (then) then(); return; }
    biosimPrompt(function (ok) {
      if (!ok) return;
      state.authed = true;
      save();
      if (then) then();
    });
  }

  /* --------------------------------------------------------- pickers */
  function pickerSheet(title, items, onPick, opts) {
    opts = opts || {};
    function paintList(filter) {
      var f = (filter || '').toLowerCase();
      var shown = 0;
      var out = items.map(function (it, i) {
        var label = (it.name || it.title || it.label) + ' ' + (it.sub || it.account || '');
        if (f && label.toLowerCase().indexOf(f) < 0) return '';
        shown++;
        return '<button class="bank-row" data-pick="' + i + '">' +
          '<span class="lg">' + CBE.logoFor(it, 38) + '</span>' +
          '<span class="txt"><b>' + U.esc(it.name || it.title || it.label) + '</b>' +
          (it.sub || it.account ? '<small style="display:block;font-size:11.5px;color:#98a0ac;margin-top:2px">' + U.esc(it.sub || it.account) + '</small>' : '') +
          '</span></button>';
      }).join('');
      return shown ? out : U.emptyState(t('noResults'));
    }
    var html = '<button class="close-x" data-action="closeSheet" aria-label="Close">' + CBE.icon('x', { size: 16 }) + '</button>' +
      '<div class="grabber"></div><h2>' + U.esc(title) + '</h2>' +
      (opts.searchable === false ? '' : '<div class="field" style="min-height:54px"><span class="fico muted">' + CBE.icon('search', { size: 20 }) +
        '</span><input id="picker-search" placeholder="' + U.esc(t('search')) + '" autocomplete="off"></div>') +
      '<div id="picker-list" style="margin-top:6px">' + paintList('') + '</div>';

    U.open(html, {
      onMount: function (el) {
        var list = el.querySelector('#picker-list');
        el.addEventListener('click', function (e) {
          var btn = e.target.closest('[data-pick]');
          if (!btn) return;
          var item = items[Number(btn.getAttribute('data-pick'))];
          U.close(el);
          setTimeout(function () { onPick(item); }, 110);
        });
        var search = el.querySelector('#picker-search');
        if (search) {
          search.addEventListener('input', function () { list.innerHTML = paintList(search.value); });
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
      render();
      if (cb) cb(item._acc);
    }, { searchable: false });
  }

  function pickBank(list, cb) {
    pickerSheet(t('bankName'), list, function (item) { cb(item); });
  }
  function pickFrom(list, title, cb) {
    pickerSheet(title, list, function (item) { cb(item); });
  }

  /* ------------------------------------------------------------- amounts */
  var keys = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  function amountSheet(title, onDone, initial, opts) {
    opts = opts || {};
    var value = initial ? String(initial) : '';
    var html = '<button class="close-x" data-action="closeSheet" aria-label="Close">' + CBE.icon('x', { size: 16 }) + '</button>' +
      '<div class="grabber"></div><h2>' + U.esc(title || t('amount')) + '</h2>' +
      '<div class="field"><span class="fico">' + CBE.icon('wallet', { size: 20 }) + '</span>' +
      '<input id="amount-input" inputmode="decimal" placeholder="' + U.esc(t('enterAmount')) + '" autocomplete="off">' +
      '<span class="tail" style="font-weight:700">ETB</span></div>' +
      '<div style="display:flex;gap:9px;flex-wrap:wrap;margin:14px 0 4px">' +
        [50, 100, 200, 500, 1000].map(function (v) {
          return '<button class="btn mini btn-soft" data-quick="' + v + '">' + v + '</button>';
        }).join('') +
      '</div>' +
      '<div class="keypad" id="amount-pad">' +
        keys.map(function (n) { return '<button data-k="' + n + '">' + n + '</button>'; }).join('') +
        '<button class="flat" data-k=".">.</button><button data-k="0">0</button>' +
        '<button class="flat danger" data-k="del">' + CBE.icon('x', { size: 19 }) + '</button>' +
      '</div>' +
      '<button class="btn btn-primary" id="amount-ok" style="margin-top:16px">' + U.esc(opts.cta || t('continue')) + '</button>' +
      '<div class="field-error" id="amount-err" style="display:none"></div>';

    U.open(html, {
      onMount: function (el) {
        var input = el.querySelector('#amount-input');
        var ok = el.querySelector('#amount-ok');
        function paint() { input.value = value; }
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
          if (!(v > 0)) {
            var err = el.querySelector('#amount-err');
            err.textContent = t('amountRequired');
            err.style.display = 'flex';
            el.querySelector('.field').classList.add('invalid');
            return;
          }
          U.close(el);
          setTimeout(function () { onDone(v); }, 110);
        });
        input.addEventListener('input', function () { value = input.value.replace(/[^\d.]/g, ''); });
      }
    });
  }

  function textSheet(title, fields, onDone) {
    var html = '<button class="close-x" data-action="closeSheet" aria-label="Close">' + CBE.icon('x', { size: 16 }) + '</button>' +
      '<div class="grabber"></div><h2>' + U.esc(title) + '</h2>' +
      '<div class="edit-grid">' + fields.map(function (f) {
        return '<label><span class="field-label">' + U.esc(f.label) + '</span>' +
          '<div class="field" style="min-height:56px">' + (f.icon ? '<span class="fico">' + CBE.icon(f.icon, { size: 20 }) + '</span>' : '') +
          '<input id="' + U.esc(f.id) + '" value="' + U.esc(f.value == null ? '' : f.value) + '"' +
          (f.inputmode ? ' inputmode="' + f.inputmode + '"' : '') +
          ' placeholder="' + U.esc(f.placeholder || '') + '"></div></label>';
      }).join('') + '</div>' +
      '<button class="btn btn-primary" id="text-ok" style="margin-top:20px">' + U.esc(t('save')) + '</button>';

    U.open(html, {
      onMount: function (el) {
        el.querySelector('#text-ok').addEventListener('click', function () {
          var out = {};
          fields.forEach(function (f) {
            var input = el.querySelector('#' + f.id);
            out[f.id] = input ? input.value.trim() : '';
          });
          U.close(el);
          setTimeout(function () { onDone(out); }, 110);
        });
      }
    });
  }

  /* the payment PIN pad, exactly like "Enter your PIN to confirm" */
  function pinSheet(title, onOk, opts) {
    opts = opts || {};
    var value = '';
    var len = opts.length || 6;
    var dots = '';
    for (var i = 0; i < len; i++) dots += '<i></i>';
    var html = '<button class="close-x" data-action="closeSheet" aria-label="Close">' + CBE.icon('x', { size: 16 }) + '</button>' +
      '<div class="grabber"></div>' +
      '<div class="sheet-title-purple" style="margin-top:4px">' + U.esc(title || t('enterPinConfirm')) + '</div>' +
      '<div class="pin-dots" id="pin-dots">' + dots + '</div>' +
      '<button class="pad-cancel" data-action="closeSheet">' + U.esc(t('cancel')) + '</button>' +
      '<div class="keypad" id="pin-pad">' +
        keys.map(function (n) { return '<button data-k="' + n + '">' + n + '</button>'; }).join('') +
        '<button class="flat danger" data-k="del">' + CBE.icon('x', { size: 19 }) + '</button>' +
        '<button data-k="0">0</button>' +
        '<button class="flat ok" data-k="ok">' + CBE.icon('check', { size: 20 }) + '</button>' +
      '</div>' +
      '<div class="field-error" id="pin-err" style="display:none;justify-content:center"></div>';

    U.open(html, {
      dismissible: opts.dismissible !== false,
      onMount: function (el) {
        var dotEls = el.querySelectorAll('#pin-dots i');
        var err = el.querySelector('#pin-err');
        var okBtn = el.querySelector('[data-k="ok"]');
        function paint() {
          for (var i = 0; i < dotEls.length; i++) dotEls[i].classList.toggle('on', i < value.length);
          okBtn.classList.toggle('on', value.length === len);
        }
        function wrong(msg) {
          value = '';
          paint();
          err.textContent = msg;
          err.style.display = 'flex';
        }
        function submit() {
          if (value.length < len) { wrong('Enter all ' + len + ' digits'); return; }
          if (value === state.pin) { U.close(el); setTimeout(function () { onOk(); }, 120); }
          else wrong('Incorrect PIN');
        }
        el.addEventListener('click', function (e) {
          var k = e.target.closest('[data-k]');
          if (!k) return;
          var key = k.getAttribute('data-k');
          if (key === 'del') value = value.slice(0, -1);
          else if (key === 'ok') return submit();
          else if (value.length < len) value += key;
          err.style.display = 'none';
          paint();
          if (value.length === len) setTimeout(submit, 180);
        });
        paint();
      }
    });
  }

  /* "Verify Identity" sheet — the white card from the screenshot */
  function bioSheet(opts) {
    opts = opts || {};
    var html = '<button class="close-x" data-action="closeSheet" aria-label="Close">' + CBE.icon('x', { size: 16 }) + '</button>' +
      '<div class="grabber"></div>' +
      '<div class="bio-sheet">' +
      '<h2>' + U.esc(opts.title || t('verifyIdentity')) + '</h2>' +
      '<p class="sub">' + U.esc(opts.subtitle || t('scanFingerprint')) + '</p>' +
      '<div id="bio-stage"></div>' +
      '<button class="btn btn-soft" data-action="closeSheet" style="margin-top:26px">' + U.esc(t('cancel')) + '</button>' +
      '</div>';

    U.open(html, {
      dismissible: false,
      onMount: function (el) {
        var stage = el.querySelector('#bio-stage');
        stage.innerHTML =
          '<div class="bio-circle"><span class="arc"></span>' + U.fingerprintLine(74) + '</div>' +
          '<p class="scan-title">' + U.esc(t('scanTitle')) + '</p>' +
          '<p class="scan-sub">' + U.esc(t('scanSub')) + '</p>';
        setTimeout(function () {
          stage.innerHTML =
            '<div class="ok-circle green">' + CBE.icon('check', { size: 46, weight: 2.6 }) + '</div>' +
            '<p class="ok-line green">' + U.esc(t('biometricsAuthenticated')) + '</p>' +
            '<p class="ok-sub" style="margin-top:7px">' + U.esc(t('proceedPin')) + '</p>';
          setTimeout(function () {
            U.close(el);
            setTimeout(function () { if (opts.onDone) opts.onDone(); }, 140);
          }, 900);
        }, 1150);
      }
    });
  }

  /* the native looking fingerprint dialog (Fingerprint / Face tabs) */
  function biosimPrompt(onDone) {
    var html = '<div class="biosim">' +
      '<div class="biosim-head"><h3>' + U.esc(t('verifyIdentity')) + '</h3>' +
        '<p>' + U.esc(t('scanFingerprint')) + '</p></div>' +
      '<div class="biosim-tabs">' +
        '<button class="biosim-tab active" data-bio-tab="fingerprint">' + U.esc(t('fingerprint')) + '</button>' +
        '<button class="biosim-tab" data-bio-tab="face">' + U.esc(t('face')) + '</button>' +
      '</div>' +
      '<div class="biosim-body">' +
        '<div class="biosim-app">' + CBE.cbeLogo(26) + '<b>CBE Mobile Banking</b></div>' +
        '<p class="hint" style="font-weight:700;color:#1e2430;margin-top:12px">' + U.esc(t('biometricsRequired')) + '</p>' +
        '<div class="biosim-target" id="biosim-target">' + U.fingerprintLine(46) + '</div>' +
        '<p class="hint">' + U.esc(t('confirmIdentity')) + '</p>' +
        '<button class="biosim-body cancel" data-action="bioCancel">' + U.esc(t('cancel')) + '</button>' +
      '</div></div>';

    var el = U.open(html, { modal: true, className: 'biosim-holder', dismissible: false, onMount: mount });
    var cancelled = false;

    function mount(holder) {
      holder.addEventListener('click', function (e) {
        var tab = e.target.closest('[data-bio-tab]');
        if (tab) {
          holder.querySelectorAll('.biosim-tab').forEach(function (b) { b.classList.remove('active'); });
          tab.classList.add('active');
          var target = holder.querySelector('#biosim-target');
          if (target) {
            target.innerHTML = tab.getAttribute('data-bio-tab') === 'face'
              ? CBE.icon('person', { size: 40, weight: 1.6 })
              : U.fingerprintLine(46);
          }
          return;
        }
        if (e.target.closest('[data-action="bioCancel"]')) {
          cancelled = true;
          U.close(holder);
          setTimeout(function () { if (onDone) onDone(false); }, 120);
        }
      });
      setTimeout(function () {
        if (cancelled) return;
        var target = holder.querySelector('#biosim-target');
        if (target) target.style.background = '#e4f6ea';
        U.close(holder);
        setTimeout(function () { if (onDone) onDone(true); }, 140);
      }, 1250);
    }
    return el;
  }

  function failModal(opts) {
    opts = opts || {};
    var el = U.open(
      '<div class="ok-circle" style="background:#fdeaea;color:#d93b3b;width:80px;height:80px">' + CBE.icon('x', { size: 40, weight: 3 }) + '</div>' +
      '<p style="font-size:17px;font-weight:700;margin:6px 0 18px">' + U.esc(opts.title || t('authFailed')) + '</p>' +
      '<div class="btn-stack">' +
        '<button class="btn btn-soft" data-action="closeSheet" id="fail-retry">' + U.esc(opts.retry || t('tryAgain')) + '</button>' +
        '<button class="btn btn-primary" data-action="closeSheet">' + U.esc(opts.alternate || t('usePinInstead')) + '</button>' +
      '</div>', { modal: true });
    var retry = el.querySelector('#fail-retry');
    if (retry && opts.onRetry) retry.addEventListener('click', function () { setTimeout(opts.onRetry, 150); });
    return el;
  }

  /* ----------------------------------------------------- payment pipeline */
  var draft = null;

  function startPayment(d) {
    draft = d || {};
    if (!draft.amount || draft.amount <= 0) { U.toast(t('amountRequired')); return; }
    confirmSheet();
  }

  function confirmSheet() {
    var d = draft;
    var f = fees(d.amount, d.charges);
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
        U.money(f.total) + ' <span class="cur">ETB</span></span></div>' +
      '<div class="btn-stack" style="margin-top:14px">' +
        '<button class="btn btn-cancel" data-action="closeSheet">' + U.esc(t('cancel')) + '</button>' +
        '<button class="btn btn-primary" data-flow="verify">' + U.esc(t('continue')) + '</button></div>' +
      '</div>';
    U.open(html, { dismissible: false });
  }

  function verifyStep() {
    U.closeTop();
    setTimeout(function () {
      if (state.biometricTxn === false) { pinStep(); return; }
      /* the sensor prompt first, then the Verify Identity card, then the PIN */
      biosimPrompt(function (ok) {
        if (!ok) { pinStep(); return; }
        bioSheet({ onDone: pinStep });
      });
    }, 150);
  }

  function pinStep() {
    pinSheet(t('enterPinConfirm'), function () { finishPayment(); });
  }

  function finishPayment() {
    var d = draft || {};
    var receiverName = d.toName || d.name || state.receiverName;
    var receiverAccount = d.toAcc || '';
    var tx = record({
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
    if (receiverName && receiverAccount) addRecent(receiverName, receiverAccount, d.bank);
    draft = null;
    nav('receipt', { id: tx.id }, { replace: true });
  }

  /* --------------------------------------------------------- login actions */
  var loginActions = {
    useBiometric: function () {
      biosimPrompt(function (ok) {
        if (!ok) return;
        var node = document.getElementById('screen-root');
        var card = document.createElement('div');
        card.className = 'auth-card';
        card.innerHTML = '<div class="auth-ring"><span class="arc"></span>' + U.fingerprintLine(52) + '</div>' +
          '<span class="txt">' + U.esc(t('auth')) + '</span>';
        var host = node && node.querySelector('.screen');
        if (host) host.appendChild(card);
        setTimeout(function () {
          card.innerHTML = '<div class="ok-circle green" style="margin:0">' + CBE.icon('check', { size: 46, weight: 2.6 }) + '</div>' +
            '<span class="txt" style="color:#1fa84c;font-weight:700">' + U.esc(t('authenticated')) + '</span>';
          setTimeout(function () {
            state.authed = true;
            save();
            reset('home');
          }, 800);
        }, 1150);
      });
    },
    showPin: function () { nav('pinLogin'); },
    submit: function () {
      var def = screens.pinLogin;
      if (def && def.submit) def.submit();
    },
    key: function (k) {
      var def = screens.pinLogin;
      if (def && def.key) def.key(k);
    }
  };

  /* ------------------------------------------------------ transfer actions */
  var transferState = { recip: null, amount: '', remark: '', tab: 'recent' };

  var transferActions = {
    state: function () { return transferState; },
    reset: function () { transferState = { recip: null, amount: '', remark: '', tab: 'recent' }; },
    setTab: function (tab) { transferState.tab = tab; render(); },
    setRecipient: function (name, account, raw) {
      transferState.recip = { name: name, account: account, raw: raw || String(account).replace(/\D/g, '') };
      render();
    },
    useHistory: function (id) {
      var item = state.recents.filter(function (r) { return r.id === id; })[0] ||
        state.beneficiaries.filter(function (r) { return r.id === id; })[0];
      if (!item) return;
      transferState.recip = {
        name: item.name,
        account: item.account,
        raw: item.raw || String(item.account).replace(/\D/g, '')
      };
      transferState.tab = 'recent';
      render();
      U.toast(item.name + ' selected');
    },
    deleteRecent: function (id) {
      state.recents = state.recents.filter(function (r) { return r.id !== id; });
      save();
      render();
      U.toast('Removed from recent transfers');
    },
    continueTransfer: function () {
      var input = document.getElementById('tf-account');
      var raw = (input ? input.value : '').replace(/\D/g, '');
      var field = document.getElementById('tf-account-field');
      var err = document.getElementById('tf-account-error');
      if (raw.length !== 13) {
        if (field) field.classList.add('invalid');
        if (err) { err.textContent = t('invalidAccount'); err.style.display = 'flex'; }
        U.toast(t('invalidAccount'));
        return;
      }
      if (field) field.classList.remove('invalid');
      if (err) err.style.display = 'none';
      transferState.recip = {
        name: state.receiverName,
        account: U.maskAccount(raw),
        raw: raw
      };
      transferState.remark = '';
      render();
    },
    doTransfer: function () {
      var input = document.getElementById('tf-amount');
      var amount = input ? Number(String(input.value).replace(/[^\d.]/g, '')) : 0;
      var field = document.getElementById('tf-amount-field');
      var err = document.getElementById('tf-amount-error');
      if (!(amount > 0)) {
        if (field) field.classList.add('invalid');
        if (err) { err.textContent = t('amountRequired'); err.style.display = 'flex'; }
        return;
      }
      if (field) field.classList.remove('invalid');
      if (err) err.style.display = 'none';
      var recip = transferState.recip || {};
      var remark = document.getElementById('tf-remark');
      CBE.pay.start({
        amount: amount,
        toName: recip.name || state.receiverName,
        toAcc: recip.account || '',
        toAccRaw: recip.raw || '',
        remark: (remark && remark.value.trim()) || 'MB Transfer',
        tag: 'ACCOUNT TO ACCOUNT',
        kind: 'transfer',
        charges: true
      });
    },
    setAmount: function (v) {
      transferState.amount = v;
    }
  };

  /* ------------------------------------------------------ other transfers */
  var otherTransferState = { bank: null, account: '', amount: '' };
  var serviceActions = {
    other: function () { return otherTransferState; },
    resetOther: function () { otherTransferState = { bank: null, account: '', amount: '' }; },
    pickOtherBank: function (cb) {
      pickBank(CBE.data.banks, function (bank) { otherTransferState.bank = bank; render(); if (cb) cb(bank); });
    },
    validateOtherAccount: function () {
      var accInput = document.getElementById('ot-account');
      var raw = (accInput ? accInput.value : '').replace(/\D/g, '');
      var field = document.getElementById('ot-account-field');
      var err = document.getElementById('ot-account-error');
      if (!otherTransferState.bank) { U.toast(t('selectBank')); return; }
      if (raw.length !== 13) {
        if (field) field.classList.add('invalid');
        if (err) { err.textContent = t('invalidAccount'); err.style.display = 'flex'; }
        return;
      }
      if (field) field.classList.remove('invalid');
      if (err) err.style.display = 'none';
      otherTransferState.account = raw;
      U.open('<div class="grabber"></div><h2>' + U.esc(t('accountValidation')) + '</h2>' +
        '<div class="brand-line" style="box-shadow:none;padding:0 0 14px"><span class="lg">' + CBE.logoFor(otherTransferState.bank, 40) + '</span>' +
        '<span class="t"><b>' + U.esc(otherTransferState.bank.name) + '</b><small>' + U.esc(U.maskAccount(raw)) + '</small></span></div>' +
        '<div class="field"><span class="fico muted">' + CBE.icon('person', { size: 20 }) + '</span><input id="ot-holder" placeholder="Account holder name"></div>' +
        '<button class="btn btn-primary" id="ot-confirm" style="margin-top:18px">' + U.esc(t('continue')) + '</button>', {
        onMount: function (el) {
          el.querySelector('#ot-confirm').addEventListener('click', function () {
            var holder = el.querySelector('#ot-holder').value.trim() || state.receiverName;
            otherTransferState.holder = holder;
            U.close(el);
            setTimeout(function () { nav('otherTransferAmount'); }, 120);
          });
        }
      });
    },
    otherTransferPay: function () {
      var input = document.getElementById('ota-amount');
      var amount = input ? Number(String(input.value).replace(/[^\d.]/g, '')) : 0;
      if (!(amount > 0)) { U.toast(t('amountRequired')); return; }
      var st = otherTransferState;
      CBE.pay.start({
        amount: amount,
        toName: st.holder || state.receiverName,
        toAcc: U.maskAccount(st.account),
        toAccRaw: st.account,
        bank: st.bank ? st.bank.name : '',
        tag: 'ACCOUNT TO ACCOUNT',
        kind: 'transfer',
        remark: 'MB Transfer',
        charges: true
      });
    },
    walletTransfer: function (wallet) {
      var st = { name: wallet.name, logo: wallet.logo, brand: wallet.brand };
      amountSheetFor('Transfer to ' + wallet.name, function (amount) {
        CBE.pay.start({
          amount: amount,
          toName: state.receiverName,
          toAcc: '',
          bank: wallet.name,
          tag: 'WALLET',
          kind: 'wallet',
          remark: 'Wallet Transfer',
          charges: true
        });
      });
    }
  };

  function amountSheetFor(title, cb) {
    amountSheet(title, cb, '', { cta: t('continue') });
  }

  /* --------------------------------------------------- settings / services */
  var settingsActions = {
    toggle: function (key) {
      if (key === 'biometric') state.biometric = !state.biometric;
      else if (key === 'biometricTxn') state.biometricTxn = !state.biometricTxn;
      else if (key === 'noor') state.noor = !state.noor;
      else if (key === 'push') state.push = !state.push;
      else if (key === 'sms') state.sms = state.sms === false ? true : false;
      else if (key === 'email') state.email = !state.email;
      else if (key === 'inapp') state.inapp = state.inapp === false ? true : false;
      else if (key === 'ussd') state.ussd = state.ussd === false ? true : false;
      save();
      render();
    },
    versionTap: function () {
      state.hidden = state.hidden || { taps: 0 };
      state.hidden.taps = (state.hidden.taps || 0) + 1;
      if (state.hidden.taps >= 5) {
        state.hidden.taps = 0;
        nav('privateSetup');
      }
    },
    savePrivate: function () {
      var name = (document.getElementById('pv-name') || {}).value || '';
      var sc = (document.getElementById('pv-sc') || {}).value || '';
      var vat = (document.getElementById('pv-vat') || {}).value || '';
      var drf = (document.getElementById('pv-drf') || {}).value || '';
      state.preset.name = String(name).trim();
      if (sc !== '') state.feeCfg.sc = Number(sc) || 0;
      if (vat !== '') state.feeCfg.vatPct = Number(vat) || 0;
      if (drf !== '') state.feeCfg.drfPct = Number(drf) || 0;
      save();
      render();
      U.toast(t('saved'));
    },
    resetPrivate: function () {
      state.preset = { name: '', account: '' };
      state.feeCfg = { sc: 0.50, vatPct: 15, drfPct: 5 };
      save();
      render();
      U.toast('Cleared');
    },
    savePin: function () {
      var cur = (document.getElementById('cp-current') || {}).value || '';
      var nu = (document.getElementById('cp-new') || {}).value || '';
      var cf = (document.getElementById('cp-confirm') || {}).value || '';
      var err = document.getElementById('cp-error');
      function fail(msg) { if (err) { err.textContent = msg; err.style.display = 'flex'; } }
      if (cur !== state.pin) return fail('Current PIN is incorrect');
      if (!/^\d{6}$/.test(nu)) return fail('The new PIN must be 6 digits');
      if (nu !== cf) return fail('The new PIN does not match');
      state.pin = nu;
      save();
      if (err) err.style.display = 'none';
      U.toast('PIN updated');
      render();
    },
    savePassphrase: function () {
      var cur = (document.getElementById('cps-current') || {}).value || '';
      var nu = (document.getElementById('cps-new') || {}).value || '';
      var cf = (document.getElementById('cps-confirm') || {}).value || '';
      var err = document.getElementById('cps-error');
      function fail(msg) { if (err) { err.textContent = msg; err.style.display = 'flex'; } }
      if (!cur) return fail('Enter your current passphrase');
      if (nu.length < 6) return fail('The new passphrase is too short');
      if (nu !== cf) return fail('The new passphrase does not match');
      state.passphrase = nu;
      save();
      if (err) err.style.display = 'none';
      U.toast('Passphrase updated');
      render();
    },
    logout: function () {
      state.authed = false;
      transferState = { recip: null, amount: '', remark: '', tab: 'recent' };
      U.closeAll();
      reset('login');
    },
    editReceipt: function (id) {
      var tx = state.transactions.filter(function (x) { return x.id === id; })[0];
      if (!tx) return;
      var r = receiptOf(id);
      textSheet('Edit receipt', [
        { id: 'ed-sender', label: 'Sender name', value: r.senderName, icon: 'person' },
        { id: 'ed-sender-acc', label: 'Sender account', value: r.senderAccount, icon: 'card', inputmode: 'numeric' },
        { id: 'ed-receiver', label: 'Receiver name', value: r.receiverName, icon: 'person' },
        { id: 'ed-receiver-acc', label: 'Receiver account', value: r.receiverAccountRaw, icon: 'card', inputmode: 'numeric' },
        { id: 'ed-amount', label: 'Amount (ETB)', value: r.amount, icon: 'wallet', inputmode: 'decimal' },
        { id: 'ed-remark', label: 'Reason', value: r.remark, icon: 'chat' }
      ], function (out) {
        applyReceiptFields(id, {
          senderName: out['ed-sender'],
          senderAccount: out['ed-sender-acc'],
          receiverName: out['ed-receiver'],
          receiverAccount: out['ed-receiver-acc'],
          amount: out['ed-amount'],
          remark: out['ed-remark']
        });
        U.toast('Receipt updated');
        render();
      });
    },
    deleteReceipt: function (id) {
      state.transactions = state.transactions.filter(function (x) { return x.id !== id; });
      save();
      render();
      U.toast('Receipt deleted');
    }
  };

  /* -------------------------------------------------------------- language */
  function openLanguage() {
    var html = '<div class="grabber"></div><h2>' + U.esc(t('selectLanguage')) + '</h2>' +
      '<div class="country" style="border-bottom:0">' +
        '<span class="radio' + (state.lang === 'am' ? ' on' : '') + '" data-set-lang="am"><i></i></span>' +
        '<b data-set-lang="am">አማርኛ</b></div>' +
      '<div class="country">' +
        '<span class="radio' + (state.lang === 'en' ? ' on' : '') + '" data-set-lang="en"><i></i></span>' +
        '<b data-set-lang="en">English</b></div>';
    U.open(html, {
      onMount: function (el) {
        el.addEventListener('click', function (e) {
          var pick = e.target.closest('[data-set-lang]');
          if (!pick) return;
          U.close(el);
          setTimeout(function () { setLang(pick.getAttribute('data-set-lang')); }, 110);
        });
      }
    });
  }

  /* --------------------------------------------------------- notifications */
  var notifications = [
    { id: 'n1', title: 'Transfer successful', body: 'ETB 546.00 has been debited from your account.', date: '2026-09-21T14:22' },
    { id: 'n2', title: 'Credit alert', body: 'ETB 2,000.00 has been credited to your saving account.', date: '2026-09-16T20:09' },
    { id: 'n3', title: 'Security notice', body: 'New sign-in to CBE Mobile Banking on 21 Sep 2026 at 02:24 PM.', date: '2026-09-21T14:24' },
    { id: 'n4', title: 'Airtime purchase', body: 'ETB 50.00 airtime purchased for 0911****214.', date: '2026-09-12T19:04' }
  ];

  function setTxnFilter(f) { state.txnFilter = f; render(); }

  /* --------------------------------------------------------------- exports */
  CBE.state = state;
  CBE.DEFAULT_RECEIVER = DEFAULT_RECEIVER;
  CBE.t = t;
  CBE.setLang = setLang;
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
  CBE.fees = fees;
  CBE.record = record;
  CBE.addRecent = addRecent;
  CBE.receiptOf = receiptOf;
  CBE.applyReceiptFields = applyReceiptFields;
  CBE.round2 = round2;
  CBE.pickers = { sheet: pickerSheet, account: pickAccount, bank: pickBank, from: pickFrom };
  CBE.amountSheet = amountSheet;
  CBE.amountSheetFor = amountSheetFor;
  CBE.textSheet = textSheet;
  CBE.pinSheet = pinSheet;
  CBE.bioSheet = bioSheet;
  CBE.biosimPrompt = biosimPrompt;
  CBE.failModal = failModal;
  CBE.requireAuth = requireAuth;
  CBE.loginActions = loginActions;
  CBE.transferActions = transferActions;
  CBE.serviceActions = serviceActions;
  CBE.settingsActions = settingsActions;
  CBE.pay = { start: startPayment, confirm: confirmSheet, verify: verifyStep, pin: pinStep, finish: finishPayment, draft: function () { return draft; } };
  CBE.notifications = notifications;
  CBE.resetAll = resetAll;
  CBE.openLanguage = openLanguage;
  CBE.setTxnFilter = setTxnFilter;
  CBE.storeKey = STORE_KEY;
})(typeof window !== 'undefined' ? window : this);
