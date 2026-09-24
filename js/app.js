/* ==========================================================================
   app.js — one delegated click handler, one input handler and the boot
   sequence. Every button in the app is listed here, so nothing is decorative.
   ========================================================================== */
(function (global) {
  'use strict';

  var CBE = global.CBE || (global.CBE = {});
  var h = CBE.h, qs = CBE.qsa ? CBE.qs : null, icon = CBE.icon, raw = CBE.raw;
  var st = CBE.state;
  var A = {};
  var IN = {};
  var versionTaps = 0, versionTimer = null;

  /* ------------------------------------------------------------- utilities */
  function digits(el) { return CBE.digits(el && el.value); }

  function copy(text, label) {
    var t = String(text);
    function done() { CBE.toast((label || 'Copied') + ': ' + t); CBE.vibrate(6); }
    if (global.navigator && global.navigator.clipboard && global.navigator.clipboard.writeText) {
      global.navigator.clipboard.writeText(t).then(done, function () { fallback(); });
    } else fallback();

    function fallback() {
      try {
        var ta = document.createElement('textarea');
        ta.value = t;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;left:-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        done();
      } catch (e) { CBE.toast('Could not copy'); }
    }
  }

  function sheet(html, opts) { return CBE.overlay.sheet(Object.assign({ html: html }, opts || {})); }
  function modal(html, opts) { return CBE.overlay.modal(Object.assign({ html: html }, opts || {})); }

  function info(title, body, iconName) {
    return modal(h`
      <div class="ok-circle" style="width:66px;height:66px;margin:0 auto 14px">${raw(icon(iconName || 'info', 30))}</div>
      <h3 style="font-size:17px;font-weight:700">${title}</h3>
      <p style="margin-top:8px;font-size:13px;line-height:1.55;color:#6b7280">${body}</p>
      <div class="modal-actions" style="margin-top:18px">
        <button class="btn btn--primary" data-a="overlayClose">OK</button>
      </div>`);
  }

  /* -------------------------------------------------------------- navigation */
  A.back = function () { CBE.back('home'); };
  A.tab = function (el) { CBE.goTab(el.getAttribute('data-tab')); };
  A.go = function (el) { CBE.go(el.getAttribute('data-go')); };
  /* shortcuts used by a few tiles/rows */
  A.miniStatement = function () { CBE.go('miniStatement'); };
  A.airtime = function () { CBE.go('airtime'); };
  A.loanProducts = function () { CBE.go('loanProducts'); };
  A.toggleAcctEye = function () { CBE.home.toggleHidden(); CBE.refresh(); };
  A.productDetail = function (el) {
    CBE.go('productDetail', { name: el.getAttribute('data-name'), desc: el.getAttribute('data-desc') });
  };
  A.otherServices = function (el) {
    CBE.go('otherServices', { prelogin: el && el.getAttribute('data-prelogin') === '1' ? 1 : 0 });
  };
  A.refresh = function () { CBE.refresh(); CBE.toast('Up to date'); };
  A.search = function () { CBE.go('search'); };
  A.notifications = function () { CBE.go('notifications'); };
  A.overlayClose = function () { CBE.overlay.pop(); };

  /* ------------------------------------------------------------------- auth */
  A.biometricLogin = function () { CBE.auth.signIn('bio'); };
  A.usePin = function () { CBE.auth.signIn('pin'); };
  A.submitPin = function (el, ctx) {
    var input = ctx && ctx.root ? ctx.root.querySelector('#loginPin') : null;
    var value = input ? digits(input) : '';
    if (value.length < 4) {
      if (input) {
        input.closest('.pin-field').classList.add('is-invalid');
        var err = ctx.root.querySelector('#pinErr');
        if (err) err.classList.remove('is-hidden');
        input.focus();
      }
      CBE.vibrate(28);
      return;
    }
    st.session.loggedIn = true;
    st.session.lastSignIn = Date.now();
    CBE.store.save();
    CBE.reset('home');
  };
  A.pinKey = function (el) { CBE.auth.pinKey(el.getAttribute('data-k')); };
  A.pinBack = function () { CBE.auth.pinBack(); };
  A.pinSubmit = function () { CBE.auth.pinSubmit(); };
  A.biosimTab = function (el) {
    var tabs = el.parentNode.children;
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.toggle('is-active', tabs[i] === el);
  };
  A.biosimCancel = function () { CBE.auth.cancel(); };

  /* ---------------------------------------------------------------- language */
  A.langSheet = function () { CBE.authSheets.language(); };
  A.setLang = function (el) {
    st.lang = el.getAttribute('data-lang');
    CBE.store.save();
    CBE.overlay.pop();
    CBE.refresh();
    CBE.toast('Language set to ' + (st.lang === 'am' ? '\u12a0\u121b\u122d\u129b' : 'English'));
  };

  /* ------------------------------------------------------------ brand switch */
  A.toggleNoor = function () {
    st.noor = !st.noor;
    CBE.store.save();
    CBE.refresh();
    CBE.toast(st.noor ? 'CBE NOOR' : 'Commercial Bank of Ethiopia');
  };

  /* -------------------------------------------------------------------- home */
  A.toggleAmount = function () {
    CBE.home.toggleHidden();
    CBE.refresh();
  };
  A.copyAccount = function () {
    if (CBE.home.isHidden()) CBE.home.toggleHidden();
    copy(CBE.digits(st.holder.account), 'Account number');
    CBE.refresh();
  };
  A.tileNext = function (el) {
    var row = el.parentNode;
    var step = row.clientWidth - 60;
    var max = row.scrollWidth - row.clientWidth;
    var next = row.scrollLeft + step;
    if (next > max - 8) next = 0;
    row.scrollTo({ left: next, behavior: 'smooth' });
  };
  A.txFilter = function (el) { CBE.txFilter = el.getAttribute('data-filter'); CBE.refresh(); };
  A.txOpen = function (el) {
    CBE.go('txDetail', { name: el.getAttribute('data-name'), amount: el.getAttribute('data-amount'), kind: el.getAttribute('data-kind') });
  };
  A.myInformation = function () { CBE.go('myInformation'); };
  A.miTab = function (el) { CBE.miAccount = el.getAttribute('data-tab') === 'account'; CBE.refresh(); };

  /* ---------------------------------------------------------------- transfer */
  A.continueTransfer = function (el, ctx) {
    var f = CBE.transfer.form();
    var root = ctx.root;
    if (!f.receiverAccount) {
      var input = root.querySelector('#accInput');
      var value = input ? CBE.digits(input.value) : '';
      if (value.length !== 13) {
        if (input) {
          input.closest('.field').classList.add('is-invalid');
          var err = root.querySelector('#accErr');
          if (err) err.classList.remove('is-hidden');
        }
        CBE.toast('Account number must be 13 digits');
        CBE.vibrate(28);
        return;
      }
      var amt = root.querySelector('#amtInput');
      f.account = value;
      f.amount = amt ? amt.value.replace(/[^0-9.]/g, '') : '';
      f.receiverAccount = value;
      f.receiverName = CBE.transfer.resolveName(value);
      var rem = root.querySelector('[data-in="remarkInput"]');
      if (rem) f.remark = rem.value;
      CBE.go('transferForm');
      return;
    }
    var amountInput = root.querySelector('#amtInput');
    if (amountInput) f.amount = amountInput.value.replace(/[^0-9.]/g, '');
    if (!f.amount || CBE.num(f.amount) <= 0) { CBE.toast('Enter an amount'); CBE.vibrate(24); return; }
    CBE.transfer.startPayment({
      amount: CBE.num(f.amount),
      receiverName: f.receiverName,
      receiverAccount: f.receiverAccount,
      bank: f.bank || 'CBE',
      remark: f.remark || st.preset.remark || 'MB Transfer',
      payType: 'A2A'
    });
  };
  A.histTab = function (el) {
    CBE.transfer.form().tab = el.getAttribute('data-tab');
    CBE.refresh();
  };
  A.pickHistory = function (el) {
    var f = CBE.transfer.form();
    f.receiverName = el.getAttribute('data-name');
    f.receiverAccount = el.getAttribute('data-account');
    f.account = el.getAttribute('data-account');
    f.amount = '';
    f.remark = st.preset.remark || '';
    CBE.go('transferForm');
  };
  A.toggleRemark = function () {
    var f = CBE.transfer.form();
    f.remarkOpen = !f.remarkOpen;
    CBE.refresh();
  };
  A.openPad = function (el) {
    var target = el.getAttribute('data-target') || 'amount';
    CBE.transfer.openPad(target, target === 'chargeAmount' ? 'Enter Amount' : 'Enter Amount');
  };
  A.padKey = function (el) {
    var p = CBE.transfer.padRef;
    if (p.value.length >= 9) return;
    p.value += el.getAttribute('data-k');
    CBE.transfer.paintPad();
  };
  A.padDot = function () {
    var p = CBE.transfer.padRef;
    if (p.value.indexOf('.') >= 0) return;
    p.value = (p.value || '0') + '.';
    CBE.transfer.paintPad();
  };
  A.padBack = function () {
    var p = CBE.transfer.padRef;
    p.value = String(p.value || '').slice(0, -1);
    CBE.transfer.paintPad();
  };
  A.padDone = function () {
    var p = CBE.transfer.padRef;
    CBE.overlay.pop();
    if (p.target === 'chargeAmount') {
      CBE.chargeValues.amount = p.value || '';
    } else {
      CBE.transfer.form().amount = p.value || '';
    }
    CBE.refresh();
  };
  A.confirmCancel = function () { CBE.overlay.pop(); };
  A.confirmGo = function () {
    var payload = CBE.pendingPayment;
    CBE.overlay.pop();
    if (payload) CBE.transfer.runPayment(payload);
  };

  /* ---------------------------------------------------------- other transfers */
  A.otherBankContinue = function (el, ctx) {
    var ob = CBE.transfer.otherBank;
    var input = ctx.root.querySelector('#obAcc');
    var value = input ? CBE.digits(input.value) : '';
    if (!ob.bank) { CBE.toast('Select a bank'); return; }
    if (value.length < 10) { CBE.toast('Enter a valid account number'); return; }
    var f = CBE.transfer.form();
    f.receiverAccount = value;
    f.receiverName = CBE.transfer.resolveName(value);
    f.bank = ob.bank;
    f.amount = '';
    CBE.go('transferForm');
  };
  A.bankSheet = function () {
    sheet(CBE.transfer.bankSheetHtml(''), { dragAnywhere: true });
  };
  A.pickBank = function (el) {
    CBE.transfer.otherBank.bank = el.getAttribute('data-name');
    CBE.overlay.popAll();
    CBE.refresh();
  };
  A.walletGo = function (el) {
    var name = el.getAttribute('data-name');
    CBE.chargeValues = { brand: name };
    CBE.go('airtimeTopup', { name: name });
  };
  A.brandGo = function (el) {
    var name = el.getAttribute('data-name');
    CBE.chargeValues = { brand: name };
    if (name.indexOf('Topup') >= 0) {
      if (name.indexOf('Ethio') === 0) CBE.go('etTopup');
      else CBE.go('airtimeTopup', { name: name });
      return;
    }
    CBE.go('billPay', { name: name });
  };
  A.airtimeTopup = function (el) { CBE.go('airtimeTopup', { name: el.getAttribute('data-name') }); };
  A.airtimeContinue = function (el, ctx) {
    var input = ctx.root.querySelector('#airAmt');
    var amount = CBE.num(input && input.value);
    if (amount < 1) { CBE.toast('Enter an amount'); return; }
    payService(el.getAttribute('data-name') || 'Airtime', amount, 'AIRTIME');
  };
  A.chargeGo = function (el, ctx) {
    var screen = el.getAttribute('data-screen');
    var amount = CBE.num(CBE.chargeValues.amount);
    if (amount < 1) { CBE.toast('Enter an amount'); CBE.vibrate(24); return; }
    var names = {
      cashOut: 'Cash Out', billShare: 'Bill Share', taxPayment: 'Tax Payment', payMerchant: 'Merchant Payment',
      trafficFine: 'Traffic Fine', donation: 'Donation', shopping: 'Shopping', forex: 'Forex Order'
    };
    payService(names[screen] || screen, amount, 'MB');
  };

  function payService(label, amount, payType) {
    CBE.transfer.startPayment({
      amount: amount,
      receiverName: (st.preset.enabled && st.preset.name) ? st.preset.name : label,
      receiverAccount: (st.preset.enabled && st.preset.account) ? st.preset.account : st.holder.account,
      bank: (CBE.chargeValues && CBE.chargeValues.brand) || label,
      remark: (st.preset.remark || 'MB Transfer'),
      payType: payType || 'MB'
    });
  }

  /* ----------------------------------------------------------------- services */
  var SERVICE_SCREEN = {
    rates: 'rates', internet: 'internetBanking', ussd: 'ussd', verify: 'verifyReceipt',
    feedback: 'feedback', locator: 'locator', callcenter: 'callcenter',
    privacy: 'privacy', terms: 'terms', survey: 'survey', links: 'cbeLinks'
  };

  A.service = function (el) {
    var id = el.getAttribute('data-service');
    var prelogin = el.getAttribute('data-prelogin') === '1';
    var run = function () { CBE.go(SERVICE_SCREEN[id] || id); };
    if (prelogin) {
      CBE.auth.requireLogin(function () {
        st.session.loggedIn = true;
        st.session.lastSignIn = Date.now();
        CBE.store.save();
        CBE.reset('home');
        setTimeout(run, 60);
      });
    } else run();
  };
  A.copyText = function (el) { copy(el.getAttribute('data-text'), 'Copied'); };
  A.verifyReceipt = function (el, ctx) {
    var input = ctx.root.querySelector('#refInput');
    var ref = (input && input.value || '').trim().toUpperCase();
    var out = ctx.root.querySelector('#verifyOut');
    if (!ref) { CBE.toast('Enter a reference number'); return; }
    var found = null;
    for (var i = 0; i < st.receipts.length; i++) if (st.receipts[i].ref.toUpperCase() === ref) found = st.receipts[i];
    if (!out) return;
    out.innerHTML = found
      ? '<div class="group" style="margin-top:18px;padding:14px 16px"><div class="kv"><span class="kv__key">Status</span><span class="kv__val" style="color:#2fae55">' + found.status + '</span></div><div class="kv"><span class="kv__key">Amount</span><span class="kv__val">' + CBE.money(found.total) + ' ETB</span></div><div class="kv"><span class="kv__key">Receiver</span><span class="kv__val">' + CBE.esc(found.receiverName) + '</span></div></div><button class="btn btn--primary" style="margin-top:14px" data-a="openReceipt" data-id="' + found.id + '">Open receipt</button>'
      : '<div class="empty-state">No receipt found for that reference.</div>';
  };
  A.sendFeedback = function (el, ctx) {
    var subject = ctx.root.querySelector('[data-in="fbSubject"]');
    var body = ctx.root.querySelector('[data-in="fbBody"]');
    if (!subject.value.trim() || !body.value.trim()) { CBE.toast('Fill in the subject and message'); return; }
    subject.value = '';
    body.value = '';
    info('Feedback sent', 'Thank you. Our team will get back to you within one working day.', 'check');
  };
  A.callTopic = function (el) {
    var name = el.getAttribute('data-name');
    sheet(h`
      <div class="sheet__grabber"></div>
      <div class="sheet__title">${name}</div>
      <p style="font-size:13.5px;line-height:1.6;color:#6b7280;text-align:center">Call 951 and choose option 2 for ${name.toLowerCase()}. Toll free, 24/7.</p>
      <button class="btn btn--primary" style="margin-top:18px" data-a="dial">${raw(icon('phone', 19))} Call 951</button>`);
  };
  A.dial = function () {
    CBE.toast('Dialling 951…');
    try { global.location.href = 'tel:951'; } catch (e) { /* blocked */ }
  };
  A.surveyPick = function (el) {
    var rows = el.parentNode.children;
    for (var i = 0; i < rows.length; i++) {
      var radio = rows[i].querySelector('.choice-row__radio');
      if (radio) radio.classList.toggle('is-on', rows[i] === el);
    }
  };
  A.sendSurvey = function () { info('Thank you', 'Your responses were submitted. They help us improve CBE Mobile Banking.', 'check'); };

  /* ------------------------------------------------------------------- cards */
  A.cardDetail = function (el) { CBE.go('cardDetail', { id: el.getAttribute('data-id') }); };
  A.freezeCard = function (el) {
    CBE.cardFrozen = CBE.cardFrozen || {};
    CBE.cardFrozen[el.getAttribute('data-id')] = !CBE.cardFrozen[el.getAttribute('data-id')];
    CBE.refresh();
    CBE.toast(CBE.cardFrozen[el.getAttribute('data-id')] ? 'Card frozen' : 'Card unfrozen');
  };
  A.toggleSwitch = function (el) {
    el.classList.toggle('is-on');
    CBE.toast(el.classList.contains('is-on') ? 'Enabled' : 'Disabled');
  };
  A.viewPin = function () {
    modal(h`
      <h3 style="font-size:17px;font-weight:700">Card PIN</h3>
      <p style="margin-top:8px;font-size:13px;color:#6b7280">For your security the card PIN is sent by SMS to ${CBE.maskAcct(st.holder.phone)} when requested.</p>
      <div class="modal-actions" style="margin-top:18px">
        <button class="btn btn--plain" style="background:#e9e7ef" data-a="overlayClose">Cancel</button>
        <button class="btn btn--primary" data-a="sendPin">Send to my phone</button>
      </div>`);
  };
  A.sendPin = function () { CBE.overlay.pop(); CBE.toast('Card PIN sent by SMS'); };
  A.cardLimits = function () {
    sheet(h`
      <div class="sheet__grabber"></div>
      <div class="sheet__title">Card Limits</div>
      <div class="kv"><span class="kv__key">ATM withdrawal (daily)</span><span class="kv__val">20,000.00 ETB</span></div>
      <div class="kv"><span class="kv__key">POS purchase (daily)</span><span class="kv__val">50,000.00 ETB</span></div>
      <div class="kv"><span class="kv__key">Online payment (daily)</span><span class="kv__val">30,000.00 ETB</span></div>
      <div class="kv"><span class="kv__key">Contactless per tap</span><span class="kv__val">2,000.00 ETB</span></div>
      <button class="btn btn--outline" style="margin-top:16px" data-a="overlayClose">Close</button>`);
  };
  A.requestCard = function () {
    sheet(h`
      <div class="sheet__grabber"></div>
      <div class="sheet__title">Request a card</div>
      <div class="choice-row" data-a="pickCardType" data-name="Visa Debit">
        <span class="choice-row__radio"><i></i></span><b>Visa Debit \u2022 free</b>
      </div>
      <div class="choice-row" data-a="pickCardType" data-name="Debit Mastercard">
        <span class="choice-row__radio"><i></i></span><b>Debit Mastercard \u2022 free</b>
      </div>
      <div class="choice-row" data-a="pickCardType" data-name="CBE NOOR Card">
        <span class="choice-row__radio"><i></i></span><b>CBE NOOR Card \u2022 200.00 ETB</b>
      </div>`);
  };
  A.pickCardType = function (el) {
    CBE.overlay.popAll();
    info('Card requested', el.getAttribute('data-name') + ' will be ready for collection at your branch within 5 working days.', 'check');
  };

  /* ----------------------------------------------------------- receive money */
  A.shareQr = function () {
    var link = 'https://mbrecieve.cbe.com.et/acct?n=' + CBE.digits(st.holder.account);
    if (global.navigator && global.navigator.share) {
      global.navigator.share({ title: 'CBE account', text: 'Pay me on CBE: ' + CBE.maskAcct(st.holder.account), url: link }).catch(function () { });
    } else copy(link, 'Payment link copied');
  };
  A.copyLink = function () { copy('https://mbrecieve.cbe.com.et/acct?n=' + CBE.digits(st.holder.account), 'Link copied'); };
  A.downloadQr = function () {
    var svg = CBE.qrSvg('https://mbrecieve.cbe.com.et/acct?n=' + CBE.digits(st.holder.account), 512, 'M');
    CBE.receipt.download('cbe-account-qr.svg', svg, 'image/svg+xml');
    CBE.toast('QR code downloaded');
  };
  A.addReceiveAmount = function () { CBE.transfer.openPad('chargeAmount', 'Amount to receive'); };
  A.togglePreset = function () {
    st.preset.enabled = !st.preset.enabled;
    CBE.store.save();
    CBE.refresh();
  };

  /* ------------------------------------------------------- settings & prefs */
  A.versionTap = function () {
    versionTaps++;
    clearTimeout(versionTimer);
    /* five taps, quickly but forgivingly: the window is generous enough for a
       real thumb and short enough that no ordinary use ever reaches it */
    versionTimer = setTimeout(function () { versionTaps = 0; }, 3200);
    if (versionTaps >= 5) {
      versionTaps = 0;
      CBE.go('privateSetup');
    }
  };
  A.toggleNotif = function (el) {
    var key = el.getAttribute('data-key');
    st.prefs.notif[key] = !(st.prefs.notif[key] !== false);
    CBE.store.save();
    CBE.refresh();
  };
  A.togglePref = function (el) {
    var key = el.getAttribute('data-key');
    st.prefs[key] = !(st.prefs[key] !== false);
    CBE.store.save();
    CBE.refresh();
  };
  A.toggleBiometric = function () {
    st.prefs.biometric = !(st.prefs.biometric !== false);
    CBE.store.save();
    CBE.refresh();
  };
  A.changeDefault = function (el) {
    var which = el.getAttribute('data-which');
    sheet(h`
      <div class="sheet__grabber"></div>
      <div class="sheet__title">Default account</div>
      ${['Saving Account (*****3619)', 'CBE Birr Wallet (*****7228)', 'CBE NOOR (*****8814)'].map(function (a) {
        return h`<div class="choice-row" data-a="setDefault" data-which="${which}" data-value="${a}">
          <span class="choice-row__radio${st.prefs[which === 'send' ? 'sendDefault' : 'receiveDefault'] === a ? ' is-on' : ''}"><i></i></span>
          <b>${a}</b>
        </div>`;
      })}`);
  };
  A.setDefault = function (el) {
    var which = el.getAttribute('data-which');
    var value = el.getAttribute('data-value');
    if (which === 'send') st.prefs.sendDefault = value; else st.prefs.receiveDefault = value;
    CBE.store.save();
    CBE.overlay.pop();
    CBE.refresh();
  };
  A.saveChange = function (el, ctx) {
    var kind = el.getAttribute('data-kind');
    var inputs = ctx.root.querySelectorAll('[data-in="changeField"]');
    var values = [];
    for (var i = 0; i < inputs.length; i++) values.push(inputs[i].value);
    if (values.some(function (v) { return !v; })) { CBE.toast('Fill in all three fields'); return; }
    if (values[1] !== values[2]) { CBE.toast('New values do not match'); return; }
    if (values[1].length < (kind === 'pin' ? 4 : 6)) { CBE.toast('Too short'); return; }
    for (var k = 0; k < inputs.length; k++) inputs[k].value = '';
    info(kind === 'pin' ? 'PIN updated' : 'Passphrase updated', 'Use your new ' + (kind === 'pin' ? 'PIN' : 'passphrase') + ' the next time you sign in.', 'check');
  };
  A.peek = function (el) {
    var input = el.parentNode.querySelector('input');
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
    el.style.color = input.type === 'text' ? '#7b2bbd' : '';
  };
  A.logout = function () {
    modal(h`
      <h3 style="font-size:17px;font-weight:700">Log out?</h3>
      <p style="margin-top:8px;font-size:13px;color:#6b7280">You will need your fingerprint or PIN to sign back in.</p>
      <div class="modal-actions" style="margin-top:18px">
        <button class="btn btn--plain" style="background:#e9e7ef;color:#d93b3b" data-a="overlayClose">Cancel</button>
        <button class="btn btn--primary" data-a="logoutNow">Log out</button>
      </div>`);
  };
  A.logoutNow = function () {
    st.session.loggedIn = false;
    CBE.store.save();
    CBE.overlay.popAll();
    CBE.reset('welcome');
  };

  /* ------------------------------------------------------ private setup & receipts */
  A.saveSetup = function (el, ctx) {
    function val(name) {
      var input = ctx.root.querySelector('[data-in="' + name + '"]');
      return input && input.value.trim() ? input.value.trim() : '';
    }
    var name = val('psName'), account = val('psAccount'), balance = val('psBalance');
    var phone = val('psPhone'), tin = val('psTin');
    if (name) st.holder.name = name;
    if (account) st.holder.account = CBE.digits(account);
    if (balance) st.holder.balance = CBE.num(balance);
    if (phone) st.holder.phone = phone;
    if (tin) st.holder.tin = CBE.digits(tin);
    if (name || account || balance) st.accountUpdated = Date.now();

    var rName = val('psRName'), rAccount = val('psRAccount'), rBank = val('psRBank');
    var rAmount = val('psRAmount'), rRemark = val('psRRemark');
    if (rName) st.preset.name = rName;
    if (rAccount) st.preset.account = CBE.digits(rAccount);
    if (rBank) st.preset.bank = rBank;
    if (rAmount) st.preset.amount = CBE.money(rAmount);
    if (rRemark) st.preset.remark = rRemark;

    var svc = val('psService'), vat = val('psVat'), drf = val('psDrf');
    if (svc) st.fees.service = CBE.num(svc);
    if (vat) st.fees.vat = CBE.num(vat);
    if (drf) st.fees.drf = CBE.num(drf);

    var company = val('psCompany'), tagline = val('psTagline'), am = val('psAmharic');
    if (company) st.letterhead.company = company;
    if (tagline) st.letterhead.tagline = tagline;
    if (am) st.letterhead.amharic = am;

    CBE.store.save();
    CBE.refresh();
    CBE.toast('Saved');
  };
  A.resetAll = function () {
    modal(h`
      <h3 style="font-size:17px;font-weight:700">Reset everything?</h3>
      <p style="margin-top:8px;font-size:13px;color:#6b7280">Account details, receipts and preferences return to their defaults. This cannot be undone.</p>
      <div class="modal-actions" style="margin-top:18px">
        <button class="btn btn--plain" style="background:#e9e7ef;color:#d93b3b" data-a="overlayClose">Cancel</button>
        <button class="btn btn--primary" data-a="resetNow">Reset</button>
      </div>`);
  };
  A.resetNow = function () {
    CBE.store.reset();
    CBE.overlay.popAll();
    CBE.reset('welcome');
  };
  A.openReceipt = function (el) { CBE.go('receipt', { id: el.getAttribute('data-id'), view: 1 }); };
  A.editReceipt = function (el) {
    var r = CBE.store.findReceipt(el.getAttribute('data-id'));
    if (!r) return;
    sheet(CBE.settings.editReceiptHtml(r), { dragAnywhere: true });
  };
  A.saveReceipt = function (el, ctx) {
    var id = el.getAttribute('data-id');
    var patch = {};
    CBE.qsa('[data-in="editReceipt"]', ctx.root).forEach(function (input) {
      var field = input.getAttribute('data-field');
      var value = input.value.trim();
      if (!value) return;
      patch[field] = (field === 'amount') ? CBE.num(value) : (field === 'receiverAccount' || field === 'senderAccount') ? CBE.digits(value) : value;
    });
    CBE.store.updateReceipt(id, patch);
    CBE.overlay.popAll();
    CBE.refresh();
    CBE.toast('Receipt updated');
  };
  A.receiptClose = function () { CBE.reset('home'); };
  A.receiptCamera = function () { CBE.go('scanner'); };
  A.openFullReceipt = function (el) { CBE.go('fullReceipt', { id: el.getAttribute('data-id') }); };
  A.downloadReceipt = function (el) {
    var r = CBE.store.findReceipt(el.getAttribute('data-id'));
    if (!r) return;
    var ok = CBE.receipt.download('CBE-Receipt-' + r.ref + '.html', CBE.receipt.standalone(r));
    if (ok) {
      CBE.toast('Receipt downloaded');
      var cur = CBE.currentScreen();
      if (cur && cur.name === 'receipt') CBE.go('dlReceipt', { id: r.id });
    }
  };
  A.printReceipt = function (el) {
    var r = CBE.store.findReceipt(el.getAttribute('data-id'));
    if (!r) return;
    CBE.receipt.print(CBE.receipt.standalone(r));
  };
  A.screenshot = function () {
    CBE.toast('Receipt framed. Use your phone\u2019s screenshot to save it.');
  };
  A.shareReceipt = function (el) {
    var r = CBE.store.findReceipt(el.getAttribute('data-id'));
    if (!r) return;
    var text = CBE.receipt.summaryText(r);
    if (global.navigator && global.navigator.share) {
      global.navigator.share({ title: 'CBE Receipt ' + r.ref, text: text, url: CBE.receipt.qrUrl(r) }).catch(function () { });
      return;
    }
    sheet(h`
      <div class="sheet__grabber"></div>
      <div class="sheet__title">Share receipt</div>
      <button class="row" data-a="shareCopy" data-text="${text}">
        <span class="row__icon">${raw(icon('copy', 20))}</span>
        <span class="row__text"><b>Copy receipt text</b></span>
      </button>
      <button class="row" data-a="downloadReceipt" data-id="${r.id}">
        <span class="row__icon">${raw(icon('download', 20))}</span>
        <span class="row__text"><b>Download receipt file</b></span>
      </button>
      <button class="row" data-a="copyText" data-text="${CBE.receipt.qrUrl(r)}">
        <span class="row__icon">${raw(icon('link', 20))}</span>
        <span class="row__text"><b>Copy verification link</b></span>
      </button>`);
  };
  A.shareCopy = function (el) { copy(el.getAttribute('data-text'), 'Receipt copied'); };

  /* ------------------------------------------------------------ withdrawals */
  A.submitWithdrawal = function (el, ctx) {
    var amount = CBE.num((ctx.root.querySelector('[data-in="wdAmount"]') || {}).value);
    var reason = ((ctx.root.querySelector('[data-in="wdReason"]') || {}).value || '').trim() || 'Cash withdrawal';
    if (amount < 1) { CBE.toast('Enter an amount'); return; }
    CBE.withdrawals = CBE.withdrawals || [];
    CBE.withdrawals.unshift({ amount: amount, reason: reason, status: 'PENDING', date: Date.now() });
    CBE.toast('Withdrawal request submitted');
    CBE.back();
    setTimeout(function () { CBE.refresh(); }, 30);
  };

  /* ------------------------------------------------------------------- misc */
  A.branchDetail = function (el) {
    var name = el.getAttribute('data-name');
    var addr = el.getAttribute('data-addr') || '';
    var code = el.getAttribute('data-code') || '';
    sheet(h`
      <div class="sheet__grabber"></div>
      <div class="sheet__title">${name}</div>
      <div class="kv"><span class="kv__key">Address</span><span class="kv__val">${addr}</span></div>
      <div class="kv"><span class="kv__key">Code</span><span class="kv__val">${code}</span></div>
      <div class="kv"><span class="kv__key">Hours</span><span class="kv__val">Mon \u2013 Fri 8:30 \u2013 17:00, Sat 8:30 \u2013 12:00</span></div>
      <button class="btn btn--primary" style="margin-top:16px" data-a="directions" data-name="${name}">${raw(icon('mapPin', 19))} Get directions</button>`);
  };
  A.directions = function (el) {
    var q = encodeURIComponent(el.getAttribute('data-name') + ' Commercial Bank of Ethiopia Addis Ababa');
    CBE.toast('Opening maps…');
    try { global.open('https://www.google.com/maps/search/?api=1&query=' + q, '_blank', 'noopener'); } catch (e) { /* blocked */ }
  };
  A.scanManual = function () {
    sheet(h`
      <div class="sheet__grabber"></div>
      <div class="sheet__title">Enter code</div>
      <div class="field">${raw(icon('qr', 20, 'field__icon--gold'))}
        <input type="text" autocomplete="off" placeholder="Account or merchant code" data-in="scanCode" aria-label="Code">
      </div>
      <button class="btn btn--primary" style="margin-top:16px" data-a="scanSubmit">Continue</button>`);
  };
  A.scanSubmit = function (el, ctx) {
    var input = ctx.root.querySelector('[data-in="scanCode"]');
    var value = (input && input.value || '').trim();
    if (!value) { CBE.toast('Enter a code'); return; }
    CBE.overlay.popAll();
    var f = CBE.transfer.form();
    f.receiverAccount = CBE.digits(value).length >= 10 ? CBE.digits(value) : '1000074503257';
    f.receiverName = CBE.transfer.resolveName(f.receiverAccount);
    f.bank = 'CBE';
    f.amount = '';
    CBE.go('transferForm');
  };
  A.searchClear = function (el, ctx) {
    var input = ctx.root.querySelector('#menuSearch');
    if (input) { input.value = ''; input.focus(); }
    var out = ctx.root.querySelector('#searchOut');
    if (out) out.innerHTML = '<div class="empty-state" style="padding-top:120px">Type to search menu.</div>';
  };
  A.requestLoan = function (el) {
    var amount = CBE.num(el.getAttribute('data-amount')) || 5000;
    var name = el.getAttribute('data-name') || 'Fast Loan';
    modal(h`
      <h3 style="font-size:17px;font-weight:700">Apply for ${name}</h3>
      <p style="margin-top:8px;font-size:13px;color:#6b7280">${CBE.money(amount)} ETB will be credited to ${CBE.maskAcct(st.holder.account)} after approval.</p>
      <div class="modal-actions" style="margin-top:18px">
        <button class="btn btn--plain" style="background:#e9e7ef" data-a="overlayClose">Cancel</button>
        <button class="btn btn--primary" data-a="loanGo" data-amount="${amount}" data-name="${name}">Confirm</button>
      </div>`);
  };
  A.loanGo = function (el) {
    var amount = CBE.num(el.getAttribute('data-amount'));
    var name = el.getAttribute('data-name');
    CBE.overlay.popAll();
    CBE.auth.approve({ subtitle: 'Scan your fingerprint to approve the loan' }, function () {
      st.holder.balance = Math.round((CBE.num(st.holder.balance) + amount) * 100) / 100;
      var rec = CBE.store.addReceipt({
        amount: amount, service: st.fees.service, vat: CBE.store.fees(1).vat, drf: CBE.store.fees(1).drf,
        total: amount, reason: name + ' disbursement', payType: 'LOAN', bank: 'CBE', channel: 'MB',
        senderName: st.letterhead.company, senderAccount: st.holder.account,
        receiverName: st.holder.name, receiverAccount: st.holder.account
      });
      CBE.store.save();
      CBE.reset('receipt', { id: rec.id, fresh: 1 });
    });
  };

  /* ------------------------------------------------------------- input layer */
  IN.loginPin = function (el, ctx) {
    var field = el.closest('.pin-field');
    if (field) field.classList.remove('is-invalid');
    var err = ctx.root.querySelector('#pinErr');
    if (err) err.classList.add('is-hidden');
  };
  IN.accInput = function (el, ctx) {
    var value = CBE.digits(el.value);
    if (value !== el.value) el.value = value;
    el.closest('.field').classList.remove('is-invalid');
    var err = ctx.root.querySelector('#accErr');
    if (err) err.classList.add('is-hidden');

    /* the holder's name only resolves once the account number is complete:
       a full 13 digit account. Never before, never with a shorter number. */
    var box = ctx.root.querySelector('#accOwner');
    if (!box) return;
    var field = el.closest('.field');
    if (value.length === 13) {
      var nameEl = ctx.root.querySelector('#accOwnerName');
      if (nameEl) nameEl.textContent = CBE.transfer.resolveName(value);
      box.classList.remove('is-hidden');
      if (field) field.classList.add('is-complete');
    } else {
      box.classList.add('is-hidden');
      if (field) field.classList.remove('is-complete');
    }
  };
  IN.otherBankAcc = function (el) {
    var value = CBE.digits(el.value);
    if (value !== el.value) el.value = value;
    CBE.transfer.otherBank.account = value;
  };
  IN.amtInput = function (el) { CBE.transfer.form().amount = el.value.replace(/[^0-9.]/g, ''); };
  IN.remarkInput = function (el) { CBE.transfer.form().remark = el.value; };
  IN.chargeAmount = function (el) { CBE.chargeValues.amount = el.value.replace(/[^0-9.]/g, ''); };
  IN.bankSearch = function (el) {
    var q = el.value;
    var list = document.getElementById('bankList');
    if (!list) return;
    var tmp = document.createElement('div');
    tmp.innerHTML = CBE.transfer.bankSheetHtml(q);
    var fresh = tmp.querySelector('#bankList');
    if (fresh) list.innerHTML = fresh.innerHTML;
  };
  IN.menuSearch = function (el, ctx) {
    var q = el.value.trim().toLowerCase();
    var out = ctx.root.querySelector('#searchOut');
    if (!out) return;
    var index = CBE.menuIndex || [];
    if (!q) { out.innerHTML = '<div class="empty-state" style="padding-top:120px">Type to search menu.</div>'; return; }
    var hits = index.filter(function (m) { return m[0].toLowerCase().indexOf(q) >= 0; });
    out.innerHTML = hits.length
      ? hits.map(function (m) {
        return '<button class="row row--flat" style="margin-bottom:9px;border-radius:14px;background:#fff;box-shadow:0 1px 2px rgba(24,16,40,.06)" data-a="go" data-go="' + m[1] + '">' +
          '<span class="row__icon" style="color:#7b2bbd">' + icon('search', 19) + '</span>' +
          '<span class="row__text"><b>' + CBE.esc(m[0]) + '</b></span>' +
          '<span class="row__chev">' + icon('chevronRight', 18) + '</span></button>';
      }).join('')
      : '<div class="empty-state">Nothing matches \u201c' + CBE.esc(q) + '\u201d.</div>';
  };
  IN.wdAmount = function (el) { el.value = el.value.replace(/[^0-9.]/g, ''); };

  /* --------------------------------------------------------------- dispatch */
  function contextFor(el) {
    var overlay = document.getElementById('layer-overlay');
    if (overlay && overlay.contains(el)) {
      var screen = document.getElementById('layer-screen');
      return { root: overlay, screenRoot: screen, overlay: true };
    }
    /* scope lookups to the *live* screen: the screen layer can briefly hold a
       previous screen, and a bare #id query would then hit the stale copy */
    var layer = document.getElementById('layer-screen');
    var live = layer ? layer.lastElementChild : null;
    var root = (live && live.dataset && live.dataset.screen) ? live : layer;
    return { root: root, screenRoot: root, overlay: false };
  }

  CBE.on(document, 'click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-a]') : null;
    if (!el) return;
    var name = el.getAttribute('data-a');
    var fn = A[name];
    if (!fn) return;
    e.preventDefault();
    CBE.vibrate(7);
    fn(el, contextFor(el));
  });

  CBE.on(document, 'input', function (e) {
    var el = e.target.closest ? e.target.closest('[data-in]') : null;
    if (!el) return;
    var fn = IN[el.getAttribute('data-in')];
    if (fn) fn(el, contextFor(el));
    var changeBtn = document.getElementById('changeBtn');
    if (changeBtn) {
      var inputs = document.querySelectorAll('[data-in="changeField"]');
      var filled = 0;
      for (var i = 0; i < inputs.length; i++) if (inputs[i].value) filled++;
      var ready = filled === 3 && inputs[1].value === inputs[2].value && inputs[1].value.length >= (changeBtn.getAttribute('data-kind') === 'pin' ? 4 : 6);
      changeBtn.style.opacity = ready ? '1' : '.5';
      changeBtn.style.pointerEvents = ready ? 'auto' : 'none';
    }
  });

  CBE.on(document, 'keydown', function (e) {
    if (e.key !== 'Enter') return;
    var el = e.target.closest ? e.target.closest('[data-in]') : null;
    if (!el) return;
    var name = el.getAttribute('data-in');
    if (name === 'loginPin') { e.preventDefault(); A.submitPin(el, contextFor(el)); }
    else if (name === 'bankSearch' || name === 'menuSearch' || name === 'chargeAmount' || name === 'amtInput') { e.preventDefault(); el.blur(); }
  });

  /* allow the search field to be focused on tap of the whole label */
  CBE.on(document, 'focusin', function (e) {
    var el = e.target;
    if (el && el.tagName === 'INPUT' && el.closest('.pin-field')) {
      var field = el.closest('.pin-field');
      field.classList.remove('is-invalid');
    }
  });

  /* ------------------------------------------------------------------- boot */
  function boot() {
    CBE.store.load();
    CBE.txFilter = CBE.txFilter || 'all';
    CBE.chargeValues = CBE.chargeValues || {};
    /* every launch replays the logo loading screen and asks for the
       fingerprint (or PIN) again — exactly like the reference app */
    st.session.loggedIn = false;
    CBE.reset('splash');

    /* keep the viewport height honest on mobile browsers */
    function fixHeight() {
      document.documentElement.style.setProperty('--vh', (global.innerHeight * 0.01) + 'px');
    }
    fixHeight();
    CBE.on(global, 'resize', CBE.debounce(fixHeight, 120));
    CBE.on(global, 'orientationchange', function () { setTimeout(fixHeight, 260); });
  }

  CBE.actions = A;
  CBE.inputs = IN;

  if (document.readyState === 'loading') CBE.on(document, 'DOMContentLoaded', boot);
  else boot();

  /* service worker: offline after the first visit (?dev=1 skips it while
     developing so a cached copy can never mask an edit) */
  var devMode = global.location.search.indexOf('dev') >= 0;
  if (!devMode && 'serviceWorker' in global.navigator && global.location.protocol.indexOf('http') === 0) {
    CBE.on(global, 'load', function () {
      global.navigator.serviceWorker.register('sw.js').catch(function () { });
    });
  }
})(typeof window !== 'undefined' ? window : this);
