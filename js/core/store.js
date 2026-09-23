/* ==========================================================================
   store.js — all application state, the seeded data and the fee maths.
   Nothing here is decorative: a transfer mutates `balance` and pushes a real
   receipt object that every receipt surface renders from.
   ========================================================================== */
(function (global) {
  'use strict';

  var CBE = global.CBE || (global.CBE = {});
  var KEY = 'cbe.v6';

  var D = CBE.toDate;

  function defaultState() {
    return {
      lang: 'en',
      session: { loggedIn: false, lastSignIn: new Date(2026, 8, 22, 18, 27).getTime() },
      holder: {
        name: 'Abel Yakob',
        account: '1000407533619',
        balance: 5005.71,
        phone: '+251902468625',
        tin: '0000000000',
        branch: 'Ras Desta Damtew St, 01',
        city: 'Addis Ababa',
        region: '-',
        subCity: '-'
      },
      accountType: 'Saving Account 1',
      noor: false,
      fees: { service: 0.5, vat: 15, drf: 5 },
      /* the private "next transfer" preset: blank until it is filled in */
      preset: { enabled: true, name: '', account: '', bank: 'Commercial Bank of Ethiopia', amount: '', remark: '' },
      letterhead: {
        company: 'Commercial Bank of Ethiopia',
        tagline: 'The bank you can always rely on!',
        amharic: '\u12e8\u12a2\u1275\u12ee\u1335\u12eb \u1295\u130d\u12f5 \u1263\u1295\u12ad'
      },
      receipts: [],
      prefs: {
        biometric: true,
        ussd: true,
        notif: { sms: true, email: true, push: true, inapp: true },
        sendDefault: 'Saving Account (*****3619)',
        receiveDefault: 'Saving Account (*****3619)'
      },
      prepared: null
    };
  }

  var state = defaultState();

  /* ------------------------------------------------------------ persistence */
  function save() {
    try { global.localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
  }

  /* merge into the *same* object so every module that captured CBE.state at
     load time keeps seeing the persisted values */
  function load() {
    try {
      var raw = global.localStorage.getItem(KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return;
      var merged = merge(defaultState(), parsed);
      for (var k in merged) if (Object.prototype.hasOwnProperty.call(merged, k)) state[k] = merged[k];
    } catch (e) { /* ignore corrupt payloads */ }
  }

  function merge(base, patch) {
    for (var k in patch) {
      if (!Object.prototype.hasOwnProperty.call(patch, k)) continue;
      var v = patch[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
        merge(base[k], v);
      } else if (v !== undefined) {
        base[k] = v;
      }
    }
    return base;
  }

  function reset() {
    state = defaultState();
    save();
  }

  /* ------------------------------------------------------------ fee maths */
  /* service charge is configured; VAT and DRF are percentages of it, each
     rounded to the cent exactly as the reference receipt shows. */
  function fees(amount) {
    var service = CBE.num(state.fees.service);
    var vat = Math.round(service * CBE.num(state.fees.vat)) / 100;
    var drf = Math.round(service * CBE.num(state.fees.drf)) / 100;
    var total = Math.round((CBE.num(amount) + service + vat + drf) * 100) / 100;
    return { service: service, vat: vat, drf: drf, total: total };
  }

  function summary(amount) {
    var f = fees(amount);
    return {
      amount: Math.round(CBE.num(amount) * 100) / 100,
      service: f.service,
      vat: f.vat,
      drf: f.drf,
      total: f.total
    };
  }

  /* ------------------------------------------------------------- receipts */
  function addReceipt(rec) {
    var entry = {
      id: CBE.uid(),
      ref: rec.ref || CBE.ref(),
      date: rec.date || Date.now(),
      status: 'COMPLETED',
      amount: CBE.num(rec.amount),
      service: CBE.num(rec.service),
      vat: CBE.num(rec.vat),
      drf: CBE.num(rec.drf),
      total: CBE.num(rec.total),
      reason: rec.reason || 'MB Transfer',
      payType: rec.payType || 'A2A',
      senderName: rec.senderName || state.holder.name,
      senderAccount: rec.senderAccount || state.holder.account,
      receiverName: rec.receiverName || state.holder.name,
      receiverAccount: rec.receiverAccount || state.holder.account,
      bank: rec.bank || 'CBE',
      channel: rec.channel || 'MB',
      holder: rec.holder || state.holder.name
    };
    state.receipts.unshift(entry);
    if (state.receipts.length > 60) state.receipts.length = 60;
    save();
    return entry;
  }

  function findReceipt(id) {
    for (var i = 0; i < state.receipts.length; i++) if (state.receipts[i].id === id) return state.receipts[i];
    return null;
  }

  function updateReceipt(id, patch) {
    var r = findReceipt(id);
    if (!r) return null;
    for (var k in patch) if (Object.prototype.hasOwnProperty.call(patch, k)) r[k] = patch[k];
    save();
    return r;
  }

  /* ------------------------------------------------------------- seed data */
  var seedTx = [
    { name: 'Yfuri Hanna', amount: -546, kind: 'ACCOUNT TO ACCOUNT', date: new Date(2026, 8, 21, 14, 22) },
    { name: 'Hizkel Wana', amount: -550, kind: 'ACCOUNT TO ACCOUNT', date: new Date(2026, 8, 18, 13, 7) },
    { name: 'W/senbet Wondimu', amount: 2000, kind: 'ACCOUNT TO ACCOUNT', date: new Date(2026, 8, 16, 20, 9) },
    { name: 'Eyob Sintayehu', amount: 3500, kind: 'ACCOUNT TO ACCOUNT', date: new Date(2026, 8, 15, 21, 38) },
    { name: 'Mamuye Beyene', amount: 600, kind: 'TRANSFER', date: new Date(2026, 8, 14, 0, 0) },
    { name: 'Timhertu Wujira', amount: -1200, kind: 'TRANSFER', date: new Date(2026, 8, 12, 9, 12) },
    { name: 'Selam Supermarket', amount: -845.5, kind: 'POS PURCHASE', date: new Date(2026, 8, 11, 19, 4) },
    { name: 'Abebe Kebede', amount: 15000, kind: 'ACCOUNT TO ACCOUNT', date: new Date(2026, 8, 9, 11, 41) },
    { name: 'Ethio Telecom', amount: -100, kind: 'AIRTIME', date: new Date(2026, 8, 8, 8, 30) },
    { name: 'Anisa Mudesir', amount: -3200, kind: 'ACCOUNT TO ACCOUNT', date: new Date(2026, 8, 6, 16, 55) },
    { name: 'Salary Credit', amount: 24500, kind: 'SALARY', date: new Date(2026, 8, 5, 7, 15) },
    { name: 'Yared Wendimagegnehu', amount: -275, kind: 'TRANSFER', date: new Date(2026, 8, 3, 15, 20) },
    { name: 'Bole City Mall', amount: -60.5, kind: 'POS PURCHASE', date: new Date(2026, 8, 2, 20, 2) },
    { name: 'Sisay Tamru', amount: -886, kind: 'ACCOUNT TO ACCOUNT', date: new Date(2026, 7, 31, 10, 39) }
  ];

  var recent = [
    { name: 'Hizkel Wana Waza', account: '1000074522238', bank: 'CBE' },
    { name: 'Timhertu Wujira Wonji', account: '1000074533375', bank: 'CBE' },
    { name: 'Yared Wendimagegnehu', account: '1000074577579', bank: 'CBE' },
    { name: 'Anisa Mudesir Suleyiman', account: '1000074544719', bank: 'CBE' },
    { name: 'Yfuri Hanna', account: '1000074503257', bank: 'CBE' },
    { name: 'Mamuye Beyene', account: '1000074599801', bank: 'CBE' }
  ];

  var beneficiaries = [
    { name: 'Yfuri Hanna B35-45 Selam C', account: '1000074503257', bank: 'CBE' },
    { name: 'Sisay Tamru Mihretu', account: '1000074504343', bank: 'CBE' },
    { name: 'W/senbet Wondimu', account: '1000074511882', bank: 'CBE' },
    { name: 'Eyob Sintayehu', account: '1000074522907', bank: 'CBE' },
    { name: 'Abebe Kebede', account: '1000074533764', bank: 'CBE' },
    { name: 'Selam Supermarket', account: '1000074544190', bank: 'CBE' }
  ];

  /* number of free interactions so the tab strips feel alive */
  function txList() {
    return seedTx.map(function (t) {
      return {
        name: t.name,
        amount: t.amount,
        kind: t.kind,
        date: t.date,
        direction: t.amount < 0 ? 'out' : 'in'
      };
    });
  }

  CBE.state = state;
  CBE.store = {
    get: function () { return state; },
    save: save,
    load: load,
    reset: reset,
    summary: summary,
    fees: fees,
    addReceipt: addReceipt,
    findReceipt: findReceipt,
    updateReceipt: updateReceipt,
    txList: txList,
    seedTx: seedTx,
    recent: recent,
    beneficiaries: beneficiaries,
    KEY: KEY
  };
})(typeof window !== 'undefined' ? window : this);
