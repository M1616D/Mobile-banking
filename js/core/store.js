/* =========================================================================
   store.js — persisted app state (localStorage, works from file:// too)
   The hidden configuration panel writes straight into this store, so the
   holder name, account, balance and receiver name stay consistent with what
   the receipts and the home screen display.
   ========================================================================= */
(function (global) {
  "use strict";

  var KEY = "cbe.mobile.state.v1";

  var DEFAULTS = {
    /* ---- configurable through the hidden 5-tap panel ---- */
    holderName: "Bereket Mamuye Beyene",
    accountNumber: "1000407533619",
    balance: 500571,                 // cents  -> 5,005.71 ETB
    receiverName: "Abreham Bekalu",  // default receiver for a typed account
    accountType: "Saving Account",

    /* ---- app state ---- */
    pin: "123456",
    biometric: true,
    language: "en",
    noor: false,
    revealBalance: false,
    ussd: true,
    notifications: { sms: true, email: true, push: true, inapp: true },
    lastSignIn: null,
    receiptCount: 4,

    cards: [
      { pan: "4583 00** **** 4314", exp: "30 DEC 2030", label: "1 Card(s)" }
    ],

    beneficiaries: [
      { name: "Hizkel Wana Waza", account: "1000000002238" },
      { name: "Timhertu Wujira Wonji", account: "1000000003375" },
      { name: "Yared Wendimagegnehu", account: "1000000007579" },
      { name: "Anisa Mudesir Suleyman", account: "1000000004719" },
      { name: "Tsebelua Getachew Fekede", account: "1000000002063" },
      { name: "Yfuri Hanna B35-45 Selam C", account: "1000000003257" }
    ],

    /* seeded so the Transactions tab matches the reference screenshots */
    transactions: [
      { id: "FT26245N70K3", dir: "out", name: "Yfuri Hanna", account: "1000000003257", amount: 54600, tag: "ACCOUNT TO ACCOUNT", reason: "MB Transfer", date: "2026-09-21T14:22:00" },
      { id: "FT26198L37D2", dir: "out", name: "Hizkel Wana", account: "1000000002238", amount: 55000, tag: "ACCOUNT TO ACCOUNT", reason: "MB Transfer", date: "2026-09-18T13:07:00" },
      { id: "FT26165C93P8", dir: "in", name: "W/senbet Wondimu", account: "1000000009124", amount: 200000, tag: "ACCOUNT TO ACCOUNT", reason: "MB Transfer", date: "2026-09-16T20:09:00" },
      { id: "FT26148T21M5", dir: "in", name: "Eyob Sintayehu", account: "1000000006671", amount: 350000, tag: "ACCOUNT TO ACCOUNT", reason: "MB Transfer", date: "2026-09-15T21:38:00" },
      { id: "FT26115V88R6", dir: "out", name: "Eeu For", account: "1000000000031", amount: 10000, tag: "BILL PAYMENT", reason: "BILL PAYMENT", date: "2026-09-11T05:53:00" }
    ],

    receipts: []                     // every completed transfer, newest first
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  var state = clone(DEFAULTS);
  var listeners = [];

  function load() {
    try {
      var raw = global.localStorage && localStorage.getItem(KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      Object.keys(saved || {}).forEach(function (k) {
        if (saved[k] !== undefined && saved[k] !== null) state[k] = saved[k];
      });
      // never leave the app without a usable account
      if (!state.holderName) state.holderName = DEFAULTS.holderName;
      if (!state.accountNumber) state.accountNumber = DEFAULTS.accountNumber;
      if (typeof state.balance !== "number" || isNaN(state.balance)) state.balance = DEFAULTS.balance;
      if (!Array.isArray(state.transactions) || !state.transactions.length) state.transactions = DEFAULTS.transactions;
      if (!Array.isArray(state.beneficiaries) || !state.beneficiaries.length) state.beneficiaries = DEFAULTS.beneficiaries;
      if (!Array.isArray(state.receipts)) state.receipts = [];
      // the reference PIN sheet shows six digits — keep the stored PIN in step
      if (!state.pin || String(state.pin).length !== 6) state.pin = DEFAULTS.pin;
    } catch (e) { /* corrupt storage — keep defaults */ }
  }

  function persist() {
    try { global.localStorage && localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { }
  }

  function emit() {
    listeners.forEach(function (fn) { try { fn(state); } catch (e) { console.error(e); } });
  }

  var Store = {
    DEFAULTS: DEFAULTS,
    get: function () { return state; },
    getRaw: function () { return state; },
    set: function (patch, silent) {
      Object.keys(patch).forEach(function (k) { state[k] = patch[k]; });
      persist();
      if (!silent) emit();
      return state;
    },
    getIn: function (path) {
      return path.split(".").reduce(function (o, k) { return (o || {})[k]; }, state);
    },
    setIn: function (path, value) {
      var keys = path.split("."), last = keys.pop();
      var obj = keys.reduce(function (o, k) {
        if (typeof o[k] !== "object" || o[k] === null) o[k] = {};
        return o[k];
      }, state);
      obj[last] = value;
      persist(); emit();
    },
    on: function (fn) { listeners.push(fn); return function () { listeners = listeners.filter(function (f) { return f !== fn; }); }; },
    reset: function () { state = clone(DEFAULTS); persist(); emit(); },
    wipe: function () { state = clone(DEFAULTS); persist(); emit(); },

    /* ------------------------------------------------------------ money */
    debit: function (cents) {
      state.balance = Math.max(0, state.balance - Math.round(cents));
      persist(); emit();
      return state.balance;
    },
    credit: function (cents) {
      state.balance = Math.round(state.balance + cents);
      persist(); emit();
      return state.balance;
    },
    last4: function () { return String(state.accountNumber).slice(-4); },

    /* -------------------------------------------------------- activity */
    record: function (tx) {
      state.transactions.unshift({
        id: tx.id, dir: "out", name: tx.receiverName, account: tx.receiverAccount,
        amount: tx.fees.amount, tag: (tx.reason || "MB Transfer").toUpperCase(),
        reason: tx.reason || "MB Transfer", date: new Date(tx.date).toISOString()
      });
      if (state.transactions.length > 60) state.transactions.length = 60;
      state.receipts.unshift(tx);
      if (state.receipts.length > 40) state.receipts.length = 40;
      state.receiptCount = (state.receiptCount || 0) + 1;
      persist(); emit();
    },
    findReceipt: function (id) {
      for (var i = 0; i < state.receipts.length; i++)
        if (state.receipts[i].id === id) return state.receipts[i];
      return null;
    },
    recent: function (n) {
      return state.beneficiaries.slice(0, n || 6);
    }
  };

  load();
  global.Store = Store;
})(window);
