/* ==========================================================================
   app.js — one delegated click listener, the action table, keyboard support
   and bootstrap. No status bar, no device chrome: this is a plain web app.
   ========================================================================== */
(function (global) {
  'use strict';
  var CBE = global.CBE;
  var U = CBE.ui;

  /* ---------------------------------------------------------- every action */
  var ACTIONS = {
    back: function () { CBE.back(); },
    goto: function (d) { CBE.nav(d.goto, { value: d.value, id: d.value, name: d.value }); },
    nav: function (d) { CBE.nav(d.value); },
    goHome: function () { CBE.reset('home'); },
    closeSheet: function () { U.closeTop(); },
    language: function () { CBE.openLanguage(); },
    notifications: function () { CBE.nav('notifications'); },
    /* the 4-cube icon on the home page opens My Information */
    appGrid: function () { CBE.nav('myInfo'); },
    myInfo: function () { CBE.nav('myInfo'); },
    myInfoTab: function (d) { CBE.settingsActions.myInfoTab(d.infoTab); },
    toggleSecret: function (d) { CBE.settingsActions.toggleSecret(d.eye); },
    social: function (d) {
      U.open('<div class="grabber"></div><h2>' + U.esc(d.value) + '</h2>' +
        '<p class="center muted" style="font-size:13.5px;line-height:1.6;margin:0 0 18px">' +
        U.esc('Commercial Bank of Ethiopia on ' + d.value) + '</p>' +
        '<button class="btn btn-primary" data-action="copyValue" data-value="https://combanketh.et">Copy link</button>' +
        '<button class="btn btn-soft" style="margin-top:12px" data-action="closeSheet">Close</button>', {});
    },
    biometric: function () { CBE.loginActions.useBiometric(); },
    pinLogin: function () { CBE.nav('pinLogin'); },
    loginSubmit: function () { CBE.loginActions.submit(); },
    otherServices: function () { CBE.nav('otherServices'); },
    newWithdrawal: function () { CBE.nav('cashOut'); },
    refresh: function () {
      CBE.render();
      U.toast('Balance refreshed — ' + U.cardStamp(Date.now()));
    },
    toggleBalance: function () {
      CBE.state.showBalance = !CBE.state.showBalance;
      CBE.save();
      CBE.render();
    },
    copyAccount: function () { U.copy(CBE.state.profile.accountNumber, 'Account number copied'); },
    copyValue: function (d) { U.copy(d.value, 'Copied: ' + d.value); },
    txDetail: function (d) { CBE.nav('txDetail', { id: d.value }); },
    openNotification: function (d) {
      var n = CBE.notifications.filter(function (x) { return x.id === d.value; })[0];
      if (!n) return;
      U.open('<div class="grabber"></div><h2>' + U.esc(n.title) + '</h2>' +
        '<p class="center" style="font-size:13.5px;color:var(--ink-2);line-height:1.6;margin:0 0 6px">' + U.esc(n.body) + '</p>' +
        '<p class="center muted" style="font-size:12px;margin:0 0 16px">' + U.esc(U.longDate(n.date)) + '</p>' +
        '<button class="btn btn-primary" data-action="closeSheet">Close</button>', {});
    },
    clearNotifications: function () {
      CBE.notifications.length = 0;
      CBE.render();
      U.toast('Notifications cleared');
    },
    searchMenu: function () { CBE.nav('searchMenu'); },
    clearSearch: function () {
      var input = document.getElementById('menu-search');
      if (input) {
        input.value = '';
        if (CBE._paintSearch) CBE._paintSearch('');
        input.focus();
      }
    },
    toggleTorch: function () { U.toast('Flashlight toggled'); },
    pickGallery: function () { U.toast('Gallery is not available offline'); },

    /* transfer flow */
    pickAccount: function () { CBE.pickers.account(function () { CBE.render(); }); },
    transferContinue: function () { CBE.transferActions.continueTransfer(); },
    useRecipient: function (d) { CBE.transferActions.useRecipient(d.value); },
    deleteRecent: function (d) { CBE.transferActions.deleteRecent(d.value); },
    doTransfer: function () { CBE.transferActions.doTransfer(); },
    editPreset: function () { CBE.nav('privateSettings'); },
    toggleRemark: function () {
      var f = CBE.transferActions.collect();
      f.showRemark = !f.showRemark;
      CBE.transferActions.setAmount(f.amount ? Number(f.amount) : 0);
    },
    toggleRemark2: function () {
      var cur = CBE.currentScreen();
      cur.params.remark = ' ';
      CBE.render();
    },
    openAmountSheet: function () {
      CBE.amountSheet(CBE.t('amount'), function (v) {
        var cur = CBE.currentScreen();
        if (cur.params && cur.params.amount != null) cur.params.amount = v;
        CBE.transferActions.setAmount(v);
      });
    },
    pickBank: function () {
      CBE.pickers.bank(CBE.data.banks, function (bank) {
        CBE.state.selectedBank = bank;
        CBE.save();
        CBE.render();
        U.toast(bank.name + ' selected');
      });
    },
    validateBank: function () { CBE.transferActions.validateBank(); },
    walletPay: function (d) { CBE.transferActions.walletPay(d.value); },

    /* receive money */
    shareQr: function () {
      var text = 'Pay ' + CBE.state.profile.holderName + ' • CBE account ' + CBE.state.profile.accountNumber;
      if (global.navigator && navigator.share) navigator.share({ title: 'CBE Receive Money', text: text }).catch(function () { });
      else U.copy(text, 'Payment details copied');
    },
    copyLink: function () { U.copy('https://cbe.com.et/pay/' + CBE.state.profile.accountNumber, 'Payment link copied'); },
    downloadQr: function () {
      var a = document.createElement('a');
      a.href = CBE.qr.dataUrl(CBE.state.profile.accountNumber + '|' + CBE.transferActions.getReceiveAmount().toFixed(2), { modules: 37 });
      a.download = 'cbe-receive-' + U.last4(CBE.state.profile.accountNumber) + '.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      U.toast('QR code saved');
    },
    addReceiveAmount: function () {
      CBE.amountSheet('Add amount', function (v) {
        CBE.transferActions.setReceiveAmount(v);
        U.toast('Amount set to ' + U.moneyCur(v));
      });
    },

    /* payments */
    airtimePay: function (d) { CBE.paymentActions.airtimePay(d.value); },
    billPay: function (d) { CBE.paymentActions.billPay(d.value); },
    cbebirrPay: function () { CBE.paymentActions.cbebirrPay(); },
    cashOutPay: function () { CBE.serviceActions.cashOutPay(); },
    govPay: function (d) { CBE.serviceActions.govPay(d.value); },
    externalPay: function (d) { CBE.serviceActions.externalPay(d.value); },
    mfiPay: function () { CBE.serviceActions.mfiPay(); },
    saccoPay: function (d) { CBE.serviceActions.saccoPay(d.value); },
    searchSacco: function () { CBE.serviceActions.searchSacco(); },
    pickMfi: function () { CBE.serviceActions.pickMfi(); },
    ussdPay: function () { CBE.serviceActions.ussdPay(); },
    eslPay: function () { CBE.serviceActions.eslPay(); },
    merchantPayStart: function (d) { CBE.serviceActions.merchantPayStart(d.value); },
    merchantPayNow: function () { CBE.serviceActions.merchantPayNow(); },
    submitLoan: function () { CBE.serviceActions.submitLoan(); },
    loanProduct: function (d) { CBE.serviceActions.loanProduct(d.value); },
    pickLoanType: function () { CBE.serviceActions.pickLoanType(); },
    pickLoanTerm: function () { CBE.serviceActions.pickLoanTerm(); },
    placeDetail: function (d) { CBE.serviceActions.placeDetail(d.value); },
    freezeCard: function (d) { CBE.serviceActions.freezeCard(d.value); },
    pickCardAccount: function () { CBE.serviceActions.pickCardAccount(); },
    pickCardType: function () { CBE.serviceActions.pickCardType(); },
    pickCardBranch: function () { CBE.serviceActions.pickCardBranch(); },
    sendCardRequest: function () { CBE.serviceActions.sendCardRequest(); },
    addBeneficiary: function () { CBE.serviceActions.addBeneficiary(); },
    refreshHistory: function () { CBE.serviceActions.refreshHistory(); },
    clearWithdrawals: function () { CBE.serviceActions.clearWithdrawals(); },
    verifyReceiptNow: function () { CBE.serviceActions.verifyReceiptNow(); },
    sendFeedback: function () { CBE.serviceActions.sendFeedback(); },
    rate: function (d) { CBE.serviceActions.rate(d.value); },
    startSurvey: function () { CBE.serviceActions.startSurvey(); },
    shareStatement: function () { CBE.serviceActions.shareStatement(); },
    printStatement: function () { CBE.serviceActions.printStatement(); },

    /* settings + private setup */
    setLang: function (d) { CBE.settingsActions.setLang(d.setLang); },
    setAccount: function (d) { CBE.settingsActions.setAccount(d.setAccount); },
    savePin: function () { CBE.settingsActions.savePin(); },
    savePassphrase: function () { CBE.settingsActions.savePassphrase(); },
    savePrivate: function () { CBE.settingsActions.savePrivate(); },
    resetPrivate: function () { CBE.settingsActions.resetPrivate(); },
    doResetAll: function () { CBE.settingsActions.doResetAll(); },
    versionTap: function () { CBE.settingsActions.versionTap(); },
    testBiometric: function () {
      CBE.bioSheet({ title: 'Test biometrics', subtitle: 'Touch the sensor to verify', onDone: function () { U.toast('Biometrics working'); } });
    },
    doLogout: function () { CBE.settingsActions.logout(); },

    /* receipts — view, edit, download, print */
    editReceipt: function (d) { CBE.receiptActions.edit(d.value); },
    downloadReceipt: function (d) { CBE.receiptActions.download(d.value); },
    downloadPaper: function (d) { CBE.receiptActions.downloadPaper(d.value); },
    shareReceipt: function (d) { CBE.receiptActions.share(d.value); },
    printReceipt: function (d) { CBE.receiptActions.print(d.value); }
  };

  /* ------------------------------------------------------ attribute reader */
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

    /* payment confirm sheet → continue */
    var flow = target.closest('[data-flow]');
    if (flow) {
      var f = flow.getAttribute('data-flow');
      if (f === 'verify') CBE.pay.verify();
      else if (f === 'pin') CBE.pay.pin();
      return;
    }

    /* the sign-in keypad — only on the login screen, every other keypad
       (payment PIN, amount pad) has its own listener */
    var key = target.closest('[data-k]');
    if (key && CBE.currentScreen().name === 'login') {
      CBE.loginActions.key(key.getAttribute('data-k'));
      return;
    }

    /* tabs, filters, toggles and pick-lists */
    var mtab2 = target.closest('[data-myinfo-tab]');
    if (mtab2) { CBE.settingsActions.myInfoTab(mtab2.getAttribute('data-myinfo-tab')); return; }
    var eye = target.closest('[data-eye]');
    if (eye) { CBE.settingsActions.toggleSecret(eye.getAttribute('data-eye')); return; }
    var tab = target.closest('[data-transfer-tab]');
    if (tab) { CBE.transferActions.setTab(tab.getAttribute('data-transfer-tab')); return; }
    var ctabs = target.closest('[data-card-tab]');
    if (ctabs) { CBE.serviceActions.setCardsTab(ctabs.getAttribute('data-card-tab')); return; }
    var mtab = target.closest('[data-merchant-mode]');
    if (mtab) { CBE.serviceActions.setMerchantMode(mtab.getAttribute('data-merchant-mode')); return; }
    var ppage = target.closest('[data-pay-page]');
    if (ppage) { CBE.serviceActions.setPayPage(ppage.getAttribute('data-pay-page')); return; }
    var mcard = target.closest('[data-merchant-tile]');
    if (mcard) { CBE.serviceActions.merchantTileStart(mcard.getAttribute('data-merchant-tile')); return; }
    var cmode = target.closest('[data-card-mode]');
    if (cmode) { CBE.serviceActions.setCardMode(cmode.getAttribute('data-card-mode')); return; }
    var filter = target.closest('[data-filter]');
    if (filter) { CBE.setTxnFilter(filter.getAttribute('data-filter')); return; }
    var mini = target.closest('[data-mini-filter]');
    if (mini) { CBE.serviceActions.setMiniFilter(mini.getAttribute('data-mini-filter')); return; }
    var tog = target.closest('[data-toggle]');
    if (tog) { CBE.settingsActions.toggle(tog.getAttribute('data-toggle')); return; }
    var lang = target.closest('[data-set-lang]');
    if (lang) { CBE.settingsActions.setLang(lang.getAttribute('data-set-lang')); return; }
    var acc = target.closest('[data-set-account]');
    if (acc) { CBE.settingsActions.setAccount(acc.getAttribute('data-set-account')); return; }
    var freeze = target.closest('[data-card-freeze]');
    if (freeze) { CBE.serviceActions.freezeCard(freeze.getAttribute('data-card-freeze')); return; }
    var limit = target.closest('[data-card-limit]');
    if (limit) { CBE.serviceActions.setCardLimit(limit.getAttribute('data-card-limit')); return; }

    /* actions */
    var act = target.closest('[data-action]');
    if (act) {
      var name = act.getAttribute('data-action');
      var fn = ACTIONS[name];
      if (fn) { e.preventDefault(); fn(data(act), act); return; }
    }

    /* bare data-goto */
    var go = target.closest('[data-goto]');
    if (go) { e.preventDefault(); ACTIONS.goto(data(go)); return; }
  }, false);

  /* --------------------------------------------- swipe between the 3 tabs
     Home ⇄ Transactions ⇄ Settings, exactly like flicking the tab bar. The
     gesture is ignored while a sheet is open or while the touch is mostly
     vertical, so scrolling is never stolen. */
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
      var t = e.changedTouches[0];
      var dx = t.clientX - x0, dy = t.clientY - y0;
      if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.7) return;
      var name = CBE.currentScreen().name;
      var i = TABS.indexOf(name);
      if (i < 0) return;
      var next = i + (dx < 0 ? 1 : -1);
      if (next < 0 || next >= TABS.length) return;
      CBE.nav(TABS[next]);
    }, { passive: true });
  })();

  /* --------------------------------------------------------- keyboard help */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (U.hasLayers()) U.closeTop();
      else if (CBE.currentScreen().name !== 'home') CBE.back();
    }
  });

  /* the sign-in PIN also types from a hardware keyboard */
  document.addEventListener('keydown', function (e) {
    if (CBE.currentScreen().name !== 'login') return;
    if (/^[0-9]$/.test(e.key)) CBE.loginActions.key(e.key);
    else if (e.key === 'Backspace') CBE.loginActions.key('del');
    else if (e.key === 'Enter') CBE.loginActions.submit();
  });

  /* ------------------------------------------------------------- bootstrap */
  function boot() {
    CBE.load();
    U.setRoot(document.getElementById('layer-root'));
    CBE.reset(CBE.state.authed ? 'home' : 'splash');

    if ('serviceWorker' in navigator && /^https?:$/.test(global.location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(function () { });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(typeof window !== 'undefined' ? window : this);
