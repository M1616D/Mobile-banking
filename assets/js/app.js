/* ==========================================================================
   app.js — one delegated click listener, the action table, keyboard support
   and bootstrap. No device chrome: this is a plain web app.
   ========================================================================== */
(function (global) {
  'use strict';
  var CBE = global.CBE;
  var U = CBE.ui;
  var t = function (k) { return CBE.t(k); };

  /* ------------------------------------------------------------- helpers */
  function fieldError(fieldId, errorId, msg) {
    var f = document.getElementById(fieldId);
    var e = document.getElementById(errorId);
    if (f) f.classList.add('invalid');
    if (e) { e.textContent = msg; e.style.display = 'flex'; }
  }
  function readNumber(id) {
    var el = document.getElementById(id);
    return el ? Number(String(el.value).replace(/[^\d.]/g, '')) || 0 : 0;
  }
  function amountThen(title, cb) {
    CBE.amountSheet(title, function (v) {
      var el = document.getElementById(title === t('amount') ? '' : '');
      cb(v);
    });
  }

  /* ---------------------------------------------------------- action table */
  var ACTIONS = {
    back: function () { CBE.back(); },
    goto: function (d) { CBE.nav(d.goto, { id: d.value, value: d.value, name: d.value }); },
    nav: function (d) { CBE.nav(d.value); },
    goHome: function () { CBE.reset('home'); },
    closeSheet: function () { U.closeTop(); },
    language: function () { CBE.openLanguage(); },
    notifications: function () { CBE.nav('notifications'); },
    openNotification: function (d) {
      var n = CBE.notifications.filter(function (x) { return x.id === d.value; })[0];
      if (!n) return;
      U.open('<div class="grabber"></div><h2>' + U.esc(n.title) + '</h2>' +
        '<p class="center" style="font-size:13.5px;color:#4d5766;line-height:1.6;margin:0 0 6px">' + U.esc(n.body) + '</p>' +
        '<p class="center muted" style="font-size:12px;margin:0 0 16px">' + U.esc(U.longDate(n.date)) + '</p>' +
        '<button class="btn btn-primary" data-action="closeSheet">' + U.esc(t('close')) + '</button>', {});
    },
    clearNotifications: function () { CBE.notifications.length = 0; CBE.render(); U.toast('Notifications cleared'); },
    searchMenu: function () { CBE.nav('searchMenu'); },
    clearSearch: function () {
      var input = document.getElementById('menu-search');
      if (input) {
        input.value = '';
        CBE.state.menuQuery = '';
        if (CBE._paintSearch) CBE._paintSearch();
        input.focus();
      }
    },
    appGrid: function () { CBE.nav('myInfo'); },
    myInfo: function () { CBE.nav('myInfo'); },
    myInfoTab: function (d) {
      var cur = CBE.currentScreen();
      cur.params = cur.params || {};
      cur.params.tab = d.myinfoTab;
      CBE.screens.myInfo.keepScroll = true;
      CBE.render();
    },
    toggleBalance: function () {
      CBE.state.showBalance = !CBE.state.showBalance;
      CBE.save();
      CBE.render();
    },
    copyAccount: function () { U.copy(CBE.state.profile.accountNumber, 'Account number copied'); },
    copyValue: function (d) { U.copy(d.value, 'Copied: ' + d.value); },
    refresh: function () { CBE.render(); U.toast('Updated ' + U.cardStamp(Date.now())); },
    txDetail: function (d) { CBE.nav('txDetail', { id: d.value }); },
    social: function (d) {
      U.open('<div class="grabber"></div><h2>' + U.esc(d.value) + '</h2>' +
        '<p class="center muted" style="font-size:13.5px;line-height:1.6;margin:0 0 18px">' +
        U.esc('Commercial Bank of Ethiopia on ' + d.value) + '</p>' +
        '<button class="btn btn-primary" data-action="copyValue" data-value="https://combanketh.et">Copy link</button>' +
        '<button class="btn btn-soft" style="margin-top:12px" data-action="closeSheet">' + U.esc(t('close')) + '</button>', {});
    },

    /* ---------------------------------------------------------- sign in */
    biometric: function () { CBE.loginActions.useBiometric(); },
    pinLogin: function () { CBE.nav('pinLogin'); },
    loginSubmit: function () { CBE.loginActions.submit(); },
    otherServices: function () { CBE.nav('otherServices'); },
    osOpen: function (d) { CBE.requireAuth(function () { CBE.nav(d.goto); }); },

    /* --------------------------------------------------------- transfer */
    pickAccount: function () { CBE.pickers.account(); },
    transferContinue: function () { CBE.transferActions.continueTransfer(); },
    useRecipient: function (d) { CBE.transferActions.useHistory(d.value); },
    deleteRecent: function (d) { CBE.transferActions.deleteRecent(d.value); },
    doTransfer: function () { CBE.transferActions.doTransfer(); },
    pickRecipient: function () {
      CBE.pickers.from(CBE.state.recents.map(function (r) {
        return { name: r.name, sub: r.account, _id: r.id };
      }), t('recentTransfers'), function (item) { CBE.transferActions.useHistory(item._id); });
    },
    toggleRemark: function () {
      var def = CBE.screens.cbeTransfer;
      def.showRemark = !def.showRemark;
      CBE.render();
    },
    openAmountSheet: function () {
      CBE.amountSheet(t('amount'), function (v) {
        var input = document.getElementById('tf-amount');
        if (input) input.value = v.toFixed(2);
        else CBE.transferActions.setAmount(v);
      });
    },
    openAmountSheetOther: function () {
      CBE.amountSheet(t('amount'), function (v) {
        var input = document.getElementById('ota-amount');
        if (input) input.value = v.toFixed(2);
      });
    },
    openAmountSheetAir: function () {
      CBE.amountSheet(t('amount'), function (v) {
        var input = document.getElementById('air-amount');
        if (input) input.value = v.toFixed(2);
      });
    },
    pickOtherBank: function () { CBE.serviceActions.pickOtherBank(); },
    validateOtherAccount: function () { CBE.serviceActions.validateOtherAccount(); },
    otherTransferPay: function () { CBE.serviceActions.otherTransferPay(); },
    pickMfi: function () {
      CBE.pickers.bank(CBE.data.microFinances, function (mfi) {
        CBE.serviceActions.other().mfi = mfi;
        CBE.render();
      });
    },
    mfiPay: function () {
      var st = CBE.serviceActions.other();
      var raw = (document.getElementById('mfi-account') || {}).value || '';
      raw = String(raw).replace(/\D/g, '');
      if (!st.mfi) { U.toast(t('selectBank')); return; }
      if (raw.length !== 13) { fieldError('mfi-account-field', 'mfi-account-error', t('invalidAccount')); return; }
      st.account = raw;
      st.holder = st.holder || CBE.state.receiverName;
      CBE.amountSheet(t('amount'), function (amount) {
        CBE.pay.start({
          amount: amount, toName: st.holder, toAcc: U.maskAccount(raw), toAccRaw: raw,
          bank: st.mfi.name, kind: 'transfer', tag: 'ACCOUNT TO ACCOUNT', charges: true
        });
      });
    },
    walletTransfer: function (d) {
      var w = CBE.data.wallets.concat([{ id: 'vita', name: 'VitaBirr', brand: 'vita' }])
        .filter(function (x) { return x.id === d.value; })[0];
      if (!w) return;
      CBE.serviceActions.walletTransfer(w);
    },
    saccoPay: function (d) {
      CBE.amountSheet(d.value, function (amount) {
        CBE.pay.start({
          amount: amount, toName: CBE.state.receiverName, toAcc: '', bank: d.value,
          kind: 'transfer', tag: 'SACCO', remark: 'SACCO Transfer', charges: true
        });
      });
    },
    pickLoanType: function () { CBE.nav('loanProducts'); },

    /* -------------------------------------------------------- services */
    airtimeOption: function (d) {
      var cur = CBE.currentScreen();
      var title = cur.name === 'safaricomTopup' ? 'Safaricom Top Up' : 'Ethio Telecom Top Up';
      CBE.nav('airtimeAmount', { title: title, others: d.value === 'others' });
    },
    airtimePayNow: function () {
      var cur = CBE.currentScreen();
      var amount = readNumber('air-amount');
      if (!(amount > 0)) { fieldError('air-amount-field', 'air-amount-error', t('amountRequired')); return; }
      var phone = (document.getElementById('air-phone') || {}).value || '';
      if (cur.params && cur.params.others && String(phone).replace(/\D/g, '').length < 9) {
        U.toast('Enter the phone number'); return;
      }
      CBE.pay.start({
        amount: amount,
        toName: cur.params && cur.params.title ? cur.params.title : 'Airtime',
        toAcc: phone ? String(phone).slice(0, 4) + '****' + String(phone).slice(-3) : '',
        tag: 'AIRTIME', kind: 'airtime', remark: 'Airtime Topup', charges: false
      });
    },
    billPay: function (d) {
      var b = CBE.data.billers.filter(function (x) { return x.id === d.value; })[0];
      var label = b ? b.name : 'Bill';
      U.open('<div class="grabber"></div><h2>' + U.esc(label) + '</h2>' +
        '<div class="field"><span class="fico">' + CBE.icon('doc', { size: 20 }) + '</span>' +
        '<input id="bill-ref" placeholder="Customer / meter number"></div>' +
        '<div class="field"><span class="fico">' + CBE.icon('wallet', { size: 20 }) + '</span>' +
        '<input id="bill-amount" inputmode="decimal" placeholder="' + U.esc(t('enterAmount')) + '"></div>' +
        '<button class="btn btn-primary" id="bill-go" style="margin-top:18px">' + U.esc(t('continue')) + '</button>', {
        onMount: function (el) {
          el.querySelector('#bill-go').addEventListener('click', function () {
            var amount = Number(String(el.querySelector('#bill-amount').value).replace(/[^\d.]/g, '')) || 0;
            var ref = el.querySelector('#bill-ref').value.trim();
            if (!(amount > 0)) { U.toast(t('amountRequired')); return; }
            if (!ref) { U.toast('Enter the customer number'); return; }
            U.close(el);
            setTimeout(function () {
              CBE.pay.start({
                amount: amount, toName: label, toAcc: ref, tag: 'BILL PAYMENT',
                kind: 'bill', remark: 'Bill Payment', charges: false
              });
            }, 120);
          });
        }
      });
    },
    cbebirrPay: function (d) {
      var o = CBE.data.cbebirrOptions.filter(function (x) { return x.id === d.value; })[0];
      U.open('<div class="grabber"></div><h2>' + U.esc(o ? o.title : t('cbeBirr')) + '</h2>' +
        (o && o.phone ? '<div class="field"><span class="fico">' + CBE.icon('phone', { size: 20 }) + '</span>' +
          '<input id="cb-phone" inputmode="tel" placeholder="09XXXXXXXX"></div>' : '<div class="field"><span class="fico">' +
          CBE.icon('building', { size: 20 }) + '</span><input id="cb-phone" placeholder="Agent code"></div>') +
        '<div class="field"><span class="fico">' + CBE.icon('wallet', { size: 20 }) + '</span>' +
        '<input id="cb-amount" inputmode="decimal" placeholder="' + U.esc(t('enterAmount')) + '"></div>' +
        '<button class="btn btn-primary" id="cb-go" style="margin-top:18px">' + U.esc(t('continue')) + '</button>', {
        onMount: function (el) {
          el.querySelector('#cb-go').addEventListener('click', function () {
            var amount = Number(String(el.querySelector('#cb-amount').value).replace(/[^\d.]/g, '')) || 0;
            var phone = el.querySelector('#cb-phone').value.trim();
            if (!phone) { U.toast('Enter the CBEBirr number'); return; }
            if (!(amount > 0)) { U.toast(t('amountRequired')); return; }
            U.close(el);
            setTimeout(function () {
              CBE.pay.start({
                amount: amount, toName: CBE.state.receiverName, toAcc: phone.replace(/\D/g, '').slice(0, 4) + '****' + phone.slice(-3),
                tag: 'WALLET', kind: 'wallet', remark: 'CBEBirr Transfer', charges: true
              });
            }, 120);
          });
        }
      });
    },
    cashOutPay: function () {
      var amount = readNumber('co-amount');
      if (!(amount > 0)) { fieldError('co-amount-field', 'co-amount-error', t('amountRequired')); return; }
      var txn = CBE.record({
        name: 'Cash Out', amount: -Math.abs(amount), tag: 'CASH OUT', kind: 'cashout',
        to: 'CBE Agent', toAcc: (document.getElementById('co-agent') || {}).value || '', charges: false, remark: 'Cash Out'
      });
      CBE.state.withdrawals = CBE.state.withdrawals || [];
      CBE.state.withdrawals.unshift(txn);
      CBE.save();
      CBE.nav('receipt', { id: txn.id }, { replace: true });
    },
    billSharePay: function () {
      var amount = readNumber('bs-amount');
      var phone = (document.getElementById('bs-phone') || {}).value || '';
      if (!(amount > 0)) { fieldError('bs-amount-field', 'bs-amount-error', t('amountRequired')); return; }
      if (String(phone).replace(/\D/g, '').length < 9) { U.toast('Enter the phone number'); return; }
      CBE.pay.start({
        amount: amount, toName: 'Bill Share', toAcc: String(phone).replace(/\D/g, '').slice(0, 4) + '****' + String(phone).slice(-3),
        tag: 'BILL SHARE', kind: 'transfer', remark: 'Bill Share', charges: true
      });
    },
    govPay: function (d) {
      var g = CBE.data.governmentServices.filter(function (x) { return x.id === d.value; })[0];
      var label = g ? g.name : 'Government Service';
      U.open('<div class="grabber"></div><h2>' + U.esc(label) + '</h2>' +
        '<div class="field"><span class="fico">' + CBE.icon('doc', { size: 20 }) + '</span>' +
        '<input id="gov-ref" placeholder="Reference number"></div>' +
        '<div class="field"><span class="fico">' + CBE.icon('wallet', { size: 20 }) + '</span>' +
        '<input id="gov-amount" inputmode="decimal" placeholder="' + U.esc(t('enterAmount')) + '"></div>' +
        '<button class="btn btn-primary" id="gov-go" style="margin-top:18px">' + U.esc(t('continue')) + '</button>', {
        onMount: function (el) {
          el.querySelector('#gov-go').addEventListener('click', function () {
            var amount = Number(String(el.querySelector('#gov-amount').value).replace(/[^\d.]/g, '')) || 0;
            var ref = el.querySelector('#gov-ref').value.trim();
            if (!(amount > 0)) { U.toast(t('amountRequired')); return; }
            U.close(el);
            setTimeout(function () {
              CBE.pay.start({
                amount: amount, toName: label, toAcc: ref, tag: 'BILL PAYMENT',
                kind: 'bill', remark: 'Government Payment', charges: false
              });
            }, 120);
          });
        }
      });
    },
    merchantStart: function (d) {
      var parts = String(d.value).split(':');
      var name = parts.slice(1).join(':') || parts[0];
      CBE.amountSheet(name, function (amount) {
        CBE.pay.start({
          amount: amount, toName: name, toAcc: '', tag: 'MERCHANT',
          kind: 'bill', remark: 'Merchant Payment', charges: false
        });
      });
    },
    refreshHistory: function () {
      CBE.render();
      U.toast('History refreshed');
    },
    shareStatement: function () {
      var text = CBE.state.transactions.slice(0, 8).map(function (x) {
        return U.shortDate(x.date) + '  ' + x.name + '  ' + U.signed(x.amount) + ' ETB';
      }).join('\n');
      if (global.navigator && navigator.share) navigator.share({ title: 'CBE Mini Statement', text: text }).catch(function () { });
      else U.copy(text, 'Statement copied');
    },
    freezeCard: function () {
      CBE._frozen = !CBE._frozen;
      CBE.render();
      U.toast(CBE._frozen ? 'Card frozen' : 'Card unfrozen');
    },
    cardLimit: function () {
      CBE.amountSheet('Daily limit', function (v) {
        CBE._cardLimit = v;
        CBE.render();
        U.toast('Daily limit set to ' + U.moneyCur(v));
      }, CBE._cardLimit || 20000);
    },
    cardRequest: function () {
      CBE.textSheet('Request new card', [
        { id: 'cr-type', label: 'Card type', value: 'CBE Debit Classic' },
        { id: 'cr-branch', label: 'Pick-up branch', value: 'Bole Branch' }
      ], function () { U.toast('Card request submitted'); });
    },
    placeDetail: function (d) {
      U.open('<div class="grabber"></div><h2>' + U.esc(d.value) + '</h2>' +
        '<div class="group" style="box-shadow:none">' +
          U.kvRow('Name', d.value) +
          U.kvRow('Hours', 'Monday – Friday · 8:00 AM – 5:00 PM') +
          U.kvRow('Saturday', '8:00 AM – 12:30 PM') +
        '</div>' +
        '<button class="btn btn-primary" style="margin-top:18px" data-action="closeSheet">' + U.esc(t('close')) + '</button>', {});
    },
    submitLoan: function () {
      var amount = readNumber('ln-amount');
      if (!(amount > 0)) { fieldError('ln-amount-field', 'ln-amount-error', t('amountRequired')); return; }
      var term = (document.getElementById('ln-term') || {}).value || '12';
      CBE.settingsActions.editReceipt; /* no-op keeps the table readable */
      U.open('<div class="ok-circle green" style="margin:0 auto 14px">' + CBE.icon('check', { size: 42, weight: 2.6 }) + '</div>' +
        '<p class="center" style="font-size:16px;font-weight:700">Loan request submitted</p>' +
        '<p class="center muted" style="font-size:13px;margin:8px 0 18px">' + U.esc(U.moneyCur(amount) + ' over ' + term + ' months. You will be notified once it is approved.') + '</p>' +
        '<button class="btn btn-primary" data-action="closeSheet">' + U.esc(t('close')) + '</button>', { modal: true });
    },
    eslPay: function () {
      var code = (document.getElementById('esl-code') || {}).value || '';
      if (!code) { U.toast('Enter the bill of lading number'); return; }
      CBE.amountSheet('ESL Payment', function (amount) {
        CBE.pay.start({
          amount: amount, toName: 'Ethiopian Shipping & Logistics', toAcc: code,
          tag: 'BILL PAYMENT', kind: 'bill', remark: 'ESL Payment', charges: false
        });
      });
    },
    verifyReceiptNow: function () {
      var ref = ((document.getElementById('vr-ref') || {}).value || '').trim().toUpperCase();
      if (!ref) { U.toast('Enter a receipt number'); return; }
      var found = CBE.state.transactions.filter(function (x) { return String(x.ref).toUpperCase() === ref; })[0];
      if (!found) {
        CBE.failModal({ title: 'Receipt not found', retry: 'Try again', alternate: 'Close' });
        return;
      }
      CBE.nav('receiptPaper', { id: found.id });
    },
    sendFeedback: function () {
      var text = (document.getElementById('fb-text') || {}).value || '';
      if (!text.trim()) { U.toast('Write your feedback first'); return; }
      CBE.reset('home');
      U.toast('Thank you for your feedback');
    },
    rate: function (d) { U.toast('You rated us ' + d.value + '/10 — thank you!'); },
    addBeneficiary: function () {
      CBE.textSheet('Add beneficiary', [
        { id: 'ben-name', label: 'Full name', icon: 'person' },
        { id: 'ben-acc', label: 'Account number', icon: 'card', inputmode: 'numeric' }
      ], function (out) {
        var raw = String(out['ben-acc']).replace(/\D/g, '');
        if (!out['ben-name'] || raw.length !== 13) { U.toast(t('invalidAccount')); return; }
        CBE.state.beneficiaries.push({
          id: 'b' + Date.now(), name: out['ben-name'], account: U.maskAccount(raw), bank: 'Commercial Bank of Ethiopia'
        });
        CBE.save();
        CBE.render();
        U.toast('Beneficiary added');
      });
    },
    deleteBeneficiary: function (d) {
      CBE.state.beneficiaries = CBE.state.beneficiaries.filter(function (b) { return b.id !== d.value; });
      CBE.save();
      CBE.render();
      U.toast('Beneficiary removed');
    },

    /* --------------------------------------------------- receive money */
    shareQr: function () {
      var text = 'Pay ' + CBE.state.profile.holderName + ' · CBE account ' + CBE.state.profile.accountNumber;
      if (global.navigator && navigator.share) navigator.share({ title: 'CBE Receive Money', text: text }).catch(function () { });
      else U.copy(text, 'Payment details copied');
    },
    copyLink: function () { U.copy('https://cbe.com.et/pay/' + CBE.state.profile.accountNumber, 'Payment link copied'); },
    downloadQr: function () {
      var a = document.createElement('a');
      a.href = CBE.qr.dataUrl(CBE.state.profile.accountNumber + '|' + (CBE._receiveAmount || 0).toFixed(2), { modules: 37 });
      a.download = 'cbe-receive-' + U.last4(CBE.state.profile.accountNumber) + '.svg';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      U.toast('QR code saved');
    },
    addReceiveAmount: function () {
      CBE.amountSheet('Add amount', function (v) {
        CBE._receiveAmount = v;
        CBE.render();
        U.toast('Amount set to ' + U.moneyCur(v));
      });
    },

    /* -------------------------------------------------- settings / hidden */
    toggleSecret: function (d) { CBE.settingsActions.toggle(d.eye); },
    setLang: function (d) { CBE.setLang(d.setLang); },
    savePin: function () { CBE.settingsActions.savePin(); },
    savePassphrase: function () { CBE.settingsActions.savePassphrase(); },
    savePrivate: function () { CBE.settingsActions.savePrivate(); },
    resetPrivate: function () { CBE.settingsActions.resetPrivate(); },
    doResetAll: function () { CBE.resetAll(); U.toast('App reset'); },
    versionTap: function () { CBE.settingsActions.versionTap(); },
    testBiometric: function () {
      CBE.bioSheet({ title: 'Test biometrics', subtitle: 'Touch the sensor to verify', onDone: function () { U.toast('Biometrics working'); } });
    },
    doLogout: function () {
      U.open('<div class="grabber"></div><h2>' + U.esc(t('logOut')) + '</h2>' +
        '<p class="center muted" style="font-size:13.5px;margin:0 0 18px">You will need your fingerprint or PIN to sign back in.</p>' +
        '<div class="btn-stack"><button class="btn btn-cancel" data-action="closeSheet">' + U.esc(t('cancel')) + '</button>' +
        '<button class="btn btn-primary" id="logout-yes">' + U.esc(t('logOut')) + '</button></div>', {
        onMount: function (el) {
          el.querySelector('#logout-yes').addEventListener('click', function () {
            U.close(el);
            setTimeout(function () { CBE.settingsActions.logout(); }, 130);
          });
        }
      });
    },

    /* ------------------------------------------------------------ receipts */
    editReceipt: function (d) { CBE.settingsActions.editReceipt(d.value); },
    deleteReceipt: function (d) { CBE.settingsActions.deleteReceipt(d.value); },
    downloadReceipt: function (d) { CBE.receiptActions.download(d.value); },
    printReceipt: function (d) { CBE.receiptActions.print(d.value); },
    shareReceipt: function (d) { CBE.receiptActions.share(d.value); }
  };

  CBE.actions = ACTIONS;

  /* ------------------------------------------------------- attribute reader */
  function data(el) {
    var d = {};
    for (var i = 0; i < el.attributes.length; i++) {
      var a = el.attributes[i];
      if (a.name.indexOf('data-') === 0) {
        var key = a.name.slice(5).replace(/-([a-z])/g, function (m, c) { return c.toUpperCase(); });
        d[key] = a.value;
      }
    }
    return d;
  }

  document.addEventListener('click', function (e) {
    var target = e.target;

    /* the confirm sheet's continue button starts the biometric step */
    var flow = target.closest('[data-flow]');
    if (flow) {
      var f = flow.getAttribute('data-flow');
      if (f === 'verify') CBE.pay.verify();
      else if (f === 'pin') CBE.pay.pin();
      return;
    }

    /* the sign-in keypad */
    var key = target.closest('[data-k]');
    if (key && CBE.currentScreen().name === 'pinLogin') {
      CBE.loginActions.key(key.getAttribute('data-k'));
      return;
    }

    var mtab = target.closest('[data-myinfo-tab]');
    if (mtab) { ACTIONS.myInfoTab({ myinfoTab: mtab.getAttribute('data-myinfo-tab') }); return; }
    var filter = target.closest('[data-filter]');
    if (filter) { CBE.setTxnFilter(filter.getAttribute('data-filter')); return; }
    var mini = target.closest('[data-mini-filter]');
    if (mini) {
      var cur = CBE.currentScreen();
      cur.params = cur.params || {};
      cur.params.filter = mini.getAttribute('data-mini-filter');
      CBE.render();
      return;
    }
    var ttab = target.closest('[data-transfer-tab]');
    if (ttab) { CBE.transferActions.setTab(ttab.getAttribute('data-transfer-tab')); return; }
    var tog = target.closest('[data-toggle]');
    if (tog) { CBE.settingsActions.toggle(tog.getAttribute('data-toggle')); return; }
    var lang = target.closest('[data-set-lang]');
    if (lang) {
      U.closeTop();
      setTimeout(function () { CBE.setLang(lang.getAttribute('data-set-lang')); }, 110);
      return;
    }

    var act = target.closest('[data-action]');
    if (act) {
      var name = act.getAttribute('data-action');
      var fn = ACTIONS[name];
      if (fn) { e.preventDefault(); fn(data(act), act); return; }
    }

    var go = target.closest('[data-goto]');
    if (go) { e.preventDefault(); ACTIONS.goto(data(go)); return; }
  }, false);

  /* -------------------------------------- swipe between the three tabs */
  (function () {
    var TABS = ['home', 'transactions', 'settings'];
    var x0 = 0, y0 = 0, tracking = false;
    document.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1 || U.hasLayers()) { tracking = false; return; }
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
      tracking = true;
    }, { passive: true });
    document.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      var tt = e.changedTouches[0];
      var dx = tt.clientX - x0, dy = tt.clientY - y0;
      if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.7) return;
      var name = CBE.currentScreen().name;
      var i = TABS.indexOf(name);
      if (i < 0) return;
      var next = i + (dx < 0 ? 1 : -1);
      if (next < 0 || next >= TABS.length) return;
      CBE.nav(TABS[next]);
    }, { passive: true });
  })();

  /* -------------------------------------------------------- keyboard */
  document.addEventListener('keydown', function (e) {
    var name = CBE.currentScreen().name;
    if (e.key === 'Escape') {
      if (U.hasLayers()) U.closeTop();
      else if (name !== 'home') CBE.back();
      return;
    }
    if (name !== 'pinLogin') return;
    if (/^[0-9]$/.test(e.key)) CBE.loginActions.key(e.key);
    else if (e.key === 'Backspace') CBE.loginActions.key('del');
    else if (e.key === 'Enter') CBE.loginActions.submit();
  });

  /* -------------------------------------------------------- bootstrap */
  function boot() {
    CBE.load();
    CBE.state.authed = false;              /* always start locked */
    U.setRoot(document.getElementById('layer-root'));
    CBE.reset('splash');
    if ('serviceWorker' in navigator && /^https?:$/.test(global.location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(function () { });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(typeof window !== 'undefined' ? window : this);
