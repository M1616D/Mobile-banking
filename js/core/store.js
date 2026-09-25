/* CBE Mobile Banking — persistent state + fee maths */
(function () {
  const DEFAULTS = {
    holder: {name: 'Abreham Bekalu'},
    account: {number: '1000407533619', type: 'Saving Account'},
    balance: 5005.71,
    fees: {service: 0.5, vat: 15, drf: 5}, // service in ETB (flat), vat/drf as % of service
    preset: {receiverName: 'Abreham Bekalu'},
    settings: {biometric: true, hideBalance: false, sms: true, email: true, push: true, inapp: true, ussd: true, language: 'English', noor: false},
    receipts: [],
    recents: [
      {name: 'Hizkel Wana Waza', account: '1223888223838'},
      {name: 'Timheritu Wujira Wonji', account: '10002345673375'},
      {name: 'Yared Wendimagegnehu', account: '10004562347579'},
      {name: 'Anisa Mudesir Suleyiman', account: '10007845624719'}
    ],
    seedTx: [
      {dir: 'out', name: 'Yfuri Hanna B35-45 Selam C', amt: 546.0, date: '21-Sep-26 2:22 PM', kind: 'ACCOUNT TO ACCOUNT'},
      {dir: 'out', name: 'Hizkel Wana', amt: 550.0, date: '18-Sep-26 1:07 PM', kind: 'ACCOUNT TO ACCOUNT'},
      {dir: 'in', name: 'W/senbet Wondimu', amt: 2000.0, date: '16-Sep-26 8:09 PM', kind: 'ACCOUNT TO ACCOUNT'},
      {dir: 'in', name: 'Eyob Sintayehu', amt: 3500.0, date: '15-Sep-26 9:38 PM', kind: 'ACCOUNT TO ACCOUNT'},
      {dir: 'out', name: 'Eeu For', amt: 100.0, date: '11-Sep-26 5:53 AM', kind: 'BILL PAYMENT'}
    ]
  };

  const LS = 'cbe.state.v2';

  let state = load();

  function fresh() {
    return JSON.parse(JSON.stringify(DEFAULTS));
  }

  function load() {
    try {
      const raw = localStorage.getItem(LS);
      if (raw) {
        const s = JSON.parse(raw);
        // merge over defaults so new keys always exist
        return Object.assign(fresh(), s);
      }
    } catch (e) {}
    return fresh();
  }

  function save() {
    try { localStorage.setItem(LS, JSON.stringify(state)); } catch (e) {}
  }

  // fee maths: service flat 0.50, VAT = 15% of service, DRF = 5% of service
  function fees(amount) {
    const f = state.fees;
    const service = round2(f.service);
    const vat = round2(service * f.vat / 100);
    const drf = round2(service * f.drf / 100);
    const total = round2(Number(amount || 0) + service + vat + drf);
    return {amount: round2(amount || 0), service, vat, drf, total};
  }

  function round2(x) { return Math.round((Number(x) + Number.EPSILON) * 100) / 100; }

  function addReceipt(r) {
    state.receipts.unshift(r);
    if (state.receipts.length > 40) state.receipts.pop();
    save();
  }
  function findReceipt(id) {
    return state.receipts.find(x => x.id === id) || null;
  }

  function reset() {
    const f = fresh();
    // mutate in place so every module referencing CBE.state sees fresh values
    for (const k of Object.keys(state)) delete state[k];
    Object.assign(state, f);
    save();
  }

  function debit(amount) {
    state.balance = round2(Number(state.balance) - Number(amount));
    save();
    return state.balance;
  }
  function credit(amount) {
    state.balance = round2(Number(state.balance) + Number(amount));
    save();
    return state.balance;
  }

  CBE.store = {fees, addReceipt, findReceipt, reset, debit, credit, save, round2};
  CBE.state = state;
})();
