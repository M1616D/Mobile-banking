/* CBE Mobile Banking — app bootstrap + single delegated event dispatcher */
(function () {
  const U = CBE.util;
  const R = CBE.router;

  /* ---------- hidden version tap: 5 taps inside the window ---------- */
  let vTaps = 0, vTimer = null;
  function versionTap() {
    vTaps++;
    U.vibrate(15);
    clearTimeout(vTimer);
    vTimer = setTimeout(() => { vTaps = 0; }, 3200);
    if (vTaps >= 5) {
      vTaps = 0;
      clearTimeout(vTimer);
      R.go('privateSetup');
    }
  }

  /* ---------- PIN pad ---------- */
  function pinKey(k) {
    const pin = CBE.pin;
    if (!pin || pin.value.length >= 4) return;
    pin.value += k;
    U.vibrate(8);
    renderDots();
    if (pin.value.length === 4) setTimeout(() => submitPin(), 180);
  }
  function pinDel() {
    const pin = CBE.pin;
    if (!pin || !pin.value.length) return;
    pin.value = pin.value.slice(0, -1);
    renderDots();
  }
  function renderDots() {
    const dots = document.querySelectorAll('#pinDots .pin-dot');
    dots.forEach((d, i) => d.classList.toggle('fill', i < (CBE.pin ? CBE.pin.value.length : 0)));
  }
  function submitPin() {
    const pin = CBE.pin;
    const ctx = pin.ctx;
    if (pin.value !== '1234') {
      const err = document.getElementById('pinErr');
      if (err) err.textContent = 'Incorrect PIN. Try again.';
      pin.value = '';
      renderDots();
      U.vibrate(80);
      return;
    }
    executePayment(ctx);
  }

  /* ---------- the real money movement ---------- */
  function executePayment(ctx) {
    const f = CBE.store.fees(Number(ctx.amount));
    const id = U.txId();
    const stamp = U.now();
    const r = {
      id, stamp,
      fromName: CBE.state.holder.name,
      fromAcc: CBE.state.account.number,
      toName: ctx.toName,
      toAcc: ctx.to,
      amount: f.amount, service: f.service, vat: f.vat, drf: f.drf, total: f.total,
      remark: ctx.remark || 'MB Transfer'
    };
    CBE.store.debit(f.total);
    // move to top of recents
    CBE.state.recents = CBE.state.recents.filter(x => x.account !== ctx.to);
    CBE.state.recents.unshift({name: ctx.toName, account: ctx.to});
    CBE.state.recents = CBE.state.recents.slice(0, 8);
    CBE.store.addReceipt(r);
    CBE.pin = null;
    R.go('receipt', r);
  }

  /* ---------- account input reveal (13 digits) ---------- */
  function accInput(inputEl) {
    const digits = inputEl.value.replace(/\D/g, '');
    if (digits !== inputEl.value) inputEl.value = digits;
    const ownerBox = document.getElementById('accOwner') ||
                     document.getElementById('bankOwner') ||
                     document.getElementById('microOwner') ||
                     document.getElementById('saccoOwner');
    if (!ownerBox) return;
    if (digits.length === 13) {
      const name = CBE.resolveName(digits);
      ownerBox.innerHTML = '<span class="dot"></span>' + U.esc(name);
      ownerBox.style.display = 'flex';
      inputEl.closest('.control').style.borderColor = 'var(--green)';
    } else {
      ownerBox.style.display = 'none';
      inputEl.closest('.control').style.borderColor = '';
    }
  }

  /* ---------- delegated actions ---------- */
  const A = {
    noop() {},
    back() { R.back(); },
    tab(el) { R.reset(el.dataset.s === 'home' ? 'home' : el.dataset.s); },

    /* login */
    bioLogin() {
      R.go('bioAuth', {stage: 'scan'});
      setTimeout(() => {
        if (R.currentName() !== 'bioAuth') return;
        const ok = Math.random() > 0.12;
        R.go('bioAuth', {stage: ok ? 'ok' : 'fail'});
        if (ok) setTimeout(() => { if (R.currentName() === 'bioAuth') R.reset('home'); }, 900);
      }, 1300);
    },
    loginPin() { R.go('loginPin'); },
    loginPinGo() {
      const v = document.getElementById('pinInput').value;
      if (v === '1234') R.reset('home');
      else {
        document.getElementById('loginErr').textContent = 'Incorrect PIN. Try again.';
        U.vibrate(60);
      }
    },
    otherServices() { R.go('otherServices'); },
    langPick() { R.go('langPick'); },
    langSet(el) {
      CBE.state.settings.language = el.dataset.l;
      CBE.store.save();
      CBE.ui.closeSheet();
      CBE.ui.toast('Language: ' + el.dataset.l);
    },

    /* home */
    drawer() { R.go('drawer'); },
    notifications() { R.go('notifications'); },
    toggleBalance() { R.replace('home'); },
    scanQr() { R.go('scanQr'); },
    receive() { R.go('receive'); },
    copyAcc() {
      const acc = CBE.state.account.number;
      try { navigator.clipboard.writeText(acc); } catch (e) {}
      CBE.ui.toast('Account number copied');
    },
    qrAddAmount() {
      CBE.ui.sheet(
        '<h3>Add Amount</h3>' +
        CBE.ui.field({label: 'Amount', id: 'qrAmtIn', inputmode: 'decimal', ph: '0.00'}) +
        '<button class="btn" data-a="qrAmtSave">Save</button>'
      );
    },
    qrAmtSave() {
      const v = parseFloat(document.getElementById('qrAmtIn').value) || 0;
      const el = document.getElementById('qrAmt');
      if (el) el.textContent = U.fmt(v);
      CBE.ui.closeSheet();
      CBE.ui.toast('Amount added to your QR');
    },
    acctIdent() {
      CBE.ui.toast('Account: ' + CBE.state.account.number);
      R.back();
    },
    noorToggle() {
      CBE.state.settings.noor = !CBE.state.settings.noor;
      CBE.store.save();
      CBE.ui.toast('CBE NOOR ' + (CBE.state.settings.noor ? 'On' : 'Off'));
      R.replace('drawer');
    },
    contactUs() { R.go('contactUs'); },
    logout() { CBE.store.save(); R.reset('splash'); },

    /* transactions */
    txFilter(el) {
      const f = el.dataset.f;
      el.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === el));
      const S = CBE.state;
      const all = S.seedTx.concat(S.receipts.map(r => ({dir: 'out', name: r.toName, amt: r.amount, date: r.stamp, kind: 'ACCOUNT TO ACCOUNT'})));
      const list = f === 'all' ? all : all.filter(t => t.dir === f);
      document.getElementById('txList').innerHTML = list.map(t =>
        '<div class="tx-item">' +
        '<span class="tx-av ' + (t.dir === 'in' ? 'in' : 'out') + '">' + (t.dir === 'in' ? '+' : U.initials(t.name)) + '</span>' +
        '<span class="tx"><span class="tt">' + U.esc(t.name) + '</span><br><span class="ss">' + U.esc(t.date) + '</span><br><span class="tag">' + U.esc(t.kind) + '</span></span>' +
        '<span class="amt ' + (t.dir === 'in' ? 'in' : 'out') + '">' + (t.dir === 'in' ? '+' : '-') + U.fmt(t.amt) + ' ETB</span></div>'
      ).join('') || '<div class="empty"><div class="big">Nothing here</div></div>';
    },

    /* transfer */
    cbeTransfer() { R.go('cbeTransfer'); },
    destTab(el) {
      const t = el.dataset.t;
      el.parentElement.querySelectorAll('button').forEach(b => {
        const on = b === el;
        b.classList.toggle('active', on);
        b.style.borderColor = on ? 'var(--purple)' : 'var(--line)';
        b.style.color = on ? 'var(--purple)' : 'var(--ink-3)';
        b.style.background = on ? 'var(--purple-50)' : '#fff';
      });
      document.getElementById('destWrap').innerHTML = t === 'acc'
        ? CBE.ui.field({label: 'Account Number', id: 'toAcc', ph: 'Enter 13-digit account', owner: 'accOwner'}).replace('data-in="accInput"', 'data-in="accInput"')
        : CBE.ui.field({label: 'Phone Number', id: 'toAcc', ph: '09xxxxxxxx', inputmode: 'numeric', max: 10, owner: 'accOwner'});
      const inp = document.querySelector('#toAcc');
      if (inp) inp.setAttribute('data-in', 'accInput');
    },
    pickRecent(el) {
      document.getElementById('toAcc').value = el.dataset.acc;
      const ownerBox = document.getElementById('accOwner');
      ownerBox.innerHTML = '<span class="dot"></span>' + U.esc(el.dataset.name);
      ownerBox.style.display = 'flex';
    },
    transferContinue() {
      const to = document.getElementById('toAcc').value.trim();
      const amt = parseFloat(document.getElementById('amt').value);
      if (!to || to.length < 9) { CBE.ui.toast('Enter a valid account number'); return; }
      if (!amt || amt <= 0) { CBE.ui.toast('Enter a valid amount'); return; }
      const f = CBE.store.fees(amt);
      if (f.total > CBE.state.balance) { CBE.ui.toast('Insufficient balance'); return; }
      const toName = CBE.resolveName(to);
      const remark = document.getElementById('remark').value.trim() || 'MB Transfer';
      R.go('transferConfirm', {to, toName, amount: amt, remark});
    },
    confirmGo(el) {
      CBE.ui.closeSheet();
      const ctx = {
        to: el.dataset.to, toName: el.dataset.name,
        amount: parseFloat(el.dataset.amt), remark: el.dataset.remark
      };
      R.go('verify', {stage: 'scan'});
      setTimeout(() => {
        if (R.currentName() !== 'verify') return;
        const ok = Math.random() > 0.1;
        R.go('verify', {stage: ok ? 'ok' : 'fail'});
        if (ok) setTimeout(() => { if (R.currentName() === 'verify') R.go('payPin', ctx); }, 900);
      }, 1400);
    },
    verifyRetry() { R.replace('verify', {stage: 'scan'}); },
    pinKey(el) { pinKey(Number(el.dataset.k)); },
    pinDel() { pinDel(); },
    pinFp() { if (CBE.pin) { CBE.pin.value = '1234'; renderDots(); setTimeout(submitPin, 200); } },

    /* receipts */
    rcptFull() {
      const r = currentReceipt();
      if (r) R.go('fullReceipt', r);
    },
    rcptShot() {
      const r = currentReceipt();
      if (r) R.go('savedReceipt', r);
    },
    rcptClose() { R.reset('home'); },
    rcptDownload() { CBE.ui.toast('Receipt PDF downloaded'); },
    openReceipt(el) {
      const r = CBE.store.findReceipt(el.dataset.id);
      if (r) R.go('receipt', r);
    },

    /* services & misc */
    airtimeSel(el) { R.go('airtimePick', {provider: el.dataset.p}); },
    airtimeAmount(el) {
      R.go('airtimeAmount', {provider: el.dataset.p, mode: 'self'});
    },
    airGo(el) {
      const amt = parseFloat(document.getElementById('airAmt').value);
      if (!amt || amt <= 0) { CBE.ui.toast('Enter a valid amount'); return; }
      R.go('transferConfirm', {to: 'AIRTIME-' + el.dataset.p, toName: (el.dataset.p === 'ethio' ? 'Ethio telecom Topup' : 'Safaricom Topup') + ' ' + amt.toFixed(2), amount: amt, remark: 'Airtime'});
      // airtime goes straight to PIN (skip biometric style confirm for brevity of flow? keep same flow)
    },
    billsEEU() { R.go('billsEEU'); },
    refGo(el) {
      const amt = parseFloat((document.getElementById('refAmt') || {}).value);
      if (!amt || amt <= 0) { CBE.ui.toast('Enter a valid amount'); return; }
      R.go('transferConfirm', {to: 'REF-' + Date.now(), toName: el.dataset.t + ' \u00b7 ' + (document.getElementById('refNum').value || 'Payment'), amount: amt, remark: el.dataset.t});
    },
    taxGo() {
      const code = document.getElementById('orderCode').value.trim();
      if (!code) { CBE.ui.toast('Enter the Order Code'); return; }
      R.go('refForm', {t: 'MOR Tax Payment \u00b7 ' + code});
    },
    bankValidate() {
      const acc = document.getElementById('bankAcc').value.trim();
      const bank = document.getElementById('bankSel');
      if (!bank.value) { CBE.ui.toast('Select a bank'); return; }
      if (acc.length !== 13) { CBE.ui.toast('Enter the full 13-digit account'); return; }
      R.go('transferConfirm', {to: acc, toName: CBE.resolveName(acc), amount: 0.01, remark: 'Account Validation'});
    },
    microGo() { CBE.ui.toast('Continue with microfinance transfer'); },
    saccoGo(el) { R.go('refForm', {t: el.dataset.t}); },
    pmTab(el) {
      const dyn = el.dataset.t === 'dyn';
      document.getElementById('pmBody').innerHTML = dyn
        ? CBE.ui.field({label: 'Dynamic ID*', id: 'pmCode', ph: 'Enter Dynamic ID', icon: 'qr'})
        : CBE.ui.field({label: 'Merchant code*', id: 'pmCode', ph: 'Enter Merchant code', icon: 'cart'}) +
          CBE.ui.field({label: 'Operator code', id: 'pmOp', ph: 'Enter Operator code', icon: 'user'});
    },
    pmGo() { CBE.ui.toast('Merchant payment coming soon'); },
    eslGo() { CBE.ui.toast('ESL payment coming soon'); },
    beneficiaries() { R.go('beneficiaries'); },
    cards() { R.go('cards'); },
    cardTab(el) {
      el.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === el));
      const body = document.getElementById('cardBody');
      if (el.dataset.t === 'issued') {
        body.innerHTML = '<div class="tx-item" style="margin-bottom:12px"><span class="tx-av out" style="background:var(--purple)">' + CBE.icon('card', 18) + '</span><span class="tx"><span class="tt">' + U.maskStar(CBE.state.account.number) + '</span><br><span class="ss">1 Card(s)</span></span></div>' +
          '<div class="card" style="max-width:330px;margin:0 auto;overflow:hidden;padding:0">' +
          '<img src="img/card-art.jpg" alt="CBE debit card" style="width:100%;display:block"></div>';
      } else if (el.dataset.t === 'requested') {
        body.innerHTML = '<div class="empty"><div class="big">No requested cards</div></div>';
      } else {
        body.innerHTML = '<div class="form"><div class="seg" style="padding:0 0 12px"><button class="active">NEW</button><button>Replacement</button></div>' +
          CBE.ui.field({label: 'Select your account', id: 'cdAcc', value: 'Saving Account ' + U.maskStar(CBE.state.account.number), icon: 'bank'}) +
          CBE.ui.field({label: 'Select card type', id: 'cdType', select: true, options: [['classic', 'Classic'], ['gold', 'Gold']]}) +
          CBE.ui.field({label: 'Select Branch', id: 'cdBr', select: true, options: [['kirkos', 'Kirkos'], ['bole', 'Bole']]}) +
          '<button class="btn" data-a="soonToast" data-t="Card request sent">Send Request</button></div>';
      }
    },
    fastLoan() { R.go('fastLoan'); },
    verifyReceipt() { R.go('verifyReceipt'); },
    vrGo() {
      const id = document.getElementById('vrId').value.trim();
      const r = CBE.store.findReceipt(id);
      if (r) R.go('fullReceipt', r);
      else CBE.ui.toast('Receipt not found');
    },
    withdrawHistory() { R.go('withdrawHistory'); },
    miniStatement() { R.go('miniStatement'); },
    cashOut() { R.go('cashOut'); },
    billShare() { R.go('billShare'); },
    schedules() { R.go('schedules'); },
    receiptsHub() { R.go('receiptsHub'); },
    soonToast(el) { CBE.ui.toast(el.dataset.t || 'Coming soon'); },
    sheetClose() { CBE.ui.closeSheet(); },

    /* settings */
    setLanguage() { R.go('setLanguage'); },
    setAccountPref() { R.go('setAccountPref'); },
    setNotif() { R.go('setNotif'); },
    setService() { R.go('setService'); },
    setBiometric() { R.go('setBiometric'); },
    setPin() { R.go('setPin'); },
    setPass() { R.go('setPass'); },
    tglSet(el) {
      const k = el.dataset.k;
      CBE.state.settings[k] = !CBE.state.settings[k];
      el.classList.toggle('on', CBE.state.settings[k]);
      CBE.store.save();
    },
    versionTap() { versionTap(); },
    saveSetup() {
      const s = CBE.state;
      const name = document.getElementById('psName').value.trim();
      const acc = document.getElementById('psAcc').value.replace(/\D/g, '');
      const bal = parseFloat(document.getElementById('psBal').value);
      const svc = parseFloat(document.getElementById('psService').value);
      const vat = parseFloat(document.getElementById('psVat').value);
      const drf = parseFloat(document.getElementById('psDrf').value);
      const recv = document.getElementById('psReceiver').value.trim();
      if (name) s.holder.name = name;
      if (acc.length === 13) s.account.number = acc;
      if (!isNaN(bal)) s.balance = CBE.store.round2(bal);
      if (!isNaN(svc)) s.fees.service = svc;
      if (!isNaN(vat)) s.fees.vat = vat;
      if (!isNaN(drf)) s.fees.drf = drf;
      if (recv) s.preset.receiverName = recv;
      CBE.store.save();
      CBE.ui.toast('Saved');
      R.back();
    },
    resetNow() {
      CBE.store.reset();
      CBE.ui.toast('App data reset');
      R.reset('splash');
    },
    saveReceipt() {
      const v = document.getElementById('psReceiver').value.trim();
      if (v) { CBE.state.preset.receiverName = v; CBE.store.save(); }
      CBE.ui.toast('Saved');
      R.back();
    }
  };

  function currentReceipt() {
    // pull the receipt object stashed on the current screen context
    return CBE._lastReceipt || null;
  }

  /* ---------- global delegated listeners ---------- */
  document.addEventListener('click', function (e) {
    const t = e.target.closest('[data-a]');
    if (!t) return;
    const a = t.dataset.a;
    if (a === 'versionTap') { versionTap(); return; }
    const fn = A[a];
    if (fn) fn(t, e);
  });

  document.addEventListener('input', function (e) {
    const el = e.target;
    if (el.dataset && el.dataset.in === 'accInput') accInput(el);
  });

  /* stash receipt on navigation so receipt screens can chain */
  const _go = R.go.bind(R);
  R.go = function (name, params, opts) {
    if (name === 'receipt' && params && params.id) CBE._lastReceipt = params;
    return _go(name, params, opts);
  };

  /* ---------- boot ---------- */
  CBE.boot = function () {
    CBE.guard.boot();
    R.reset('splash');
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', CBE.boot);
  else CBE.boot();
})();
