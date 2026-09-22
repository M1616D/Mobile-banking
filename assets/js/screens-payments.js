/* ==========================================================================
   screens-payments.js — Airtime, Bills & Utilities and CBEBirr wallet moves
   ========================================================================== */
(function (global) {
  'use strict';
  var CBE = global.CBE;
  var U = CBE.ui;

  /* --------------------------------------------------------------- airtime */
  CBE.define('airtime', {
    render: function () {
      return '<section class="screen">' +
        U.appbar(CBE.t('airtime')) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="logo-grid" style="margin-top:6px">' +
            CBE.data.airtimeProviders.map(function (p) {
              return '<button class="logo-tile" data-goto="airtimeProvider" data-action="goto" data-value="' + U.esc(p.id) + '">' +
                '<span class="brand">' + CBE.logoFor(p, 46) + '</span>' +
                '<span>' + U.esc(p.name) + '</span></button>';
            }).join('') +
          '</div>' +
        '</div></div>' +
        U.tabbar('home') +
      '</section>';
    }
  });

  CBE.define('airtimeProvider', {
    render: function (p) {
      var id = p.value || 'ethio';
      var prov = CBE.data.airtimeProviders.filter(function (x) { return x.id === id; })[0] || CBE.data.airtimeProviders[0];
      return '<section class="screen">' +
        U.appbar(prov.name) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="group" style="margin-top:6px">' +
            CBE.data.airtimeOptions.map(function (o) {
              return '<button class="row" data-goto="airtimeAmount" data-action="goto" data-value="' + U.esc(prov.id + '|' + o.id) + '">' +
                '<span class="ico plain">' + CBE.logoFor(prov, 34) + '</span>' +
                '<span class="txt"><b>' + U.esc(o.name) + '</b><small>' + U.esc(o.sub) + '</small></span>' +
                '<span class="chev">' + CBE.icon('chevronRight', { size: 20 }) + '</span></button>';
            }).join('') +
          '</div>' +
        '</div></div>' +
        U.tabbar('home') +
      '</section>';
    }
  });

  CBE.define('airtimeAmount', {
    render: function (p) {
      var parts = String(p.value || 'ethio|self').split('|');
      var provId = parts[0], mode = parts[1] || 'self';
      var title = provId === 'safaricom' ? CBE.t('safaricomTopUpTitle') : CBE.t('ethioTopUpTitle');
      var self = mode === 'self';
      return '<section class="screen">' +
        U.appbar(title) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="field-label" style="margin-top:14px">' + U.esc(self ? CBE.t('phoneNumber') : 'Recipient ' + CBE.t('phoneNumber')) + '</div>' +
          '<div class="field">' + CBE.icon('phoneHandset', { size: 21, cls: 'fico' }) +
            '<input id="a-phone" inputmode="tel" placeholder="09** *** ** **" value="' + U.esc(self ? (CBE.state.profile.phone || '0911****214') : '') + '">' +
            (self ? '<span class="tail">' + CBE.icon('userPlus', { size: 20 }) + '</span>' : '') + '</div>' +
          '<div class="field-label">' + U.esc(CBE.t('amount')) + '</div>' +
          U.field({ icon: 'cash', inputId: 'a-amount', name: 'amount', placeholder: CBE.t('enterAmount'), inputmode: 'decimal', tailAction: 'openAmountSheet', tail: CBE.icon('card', { size: 20 }) }) +
          '<button class="btn btn-primary" style="margin-top:22px" data-action="airtimePay" data-value="' + U.esc(provId + '|' + mode) + '">' + U.esc(CBE.t('continue')) + '</button>' +
          '<div class="pill-note">' + CBE.icon('phoneHandset', { size: 20 }) +
            '<span>' + (self ? 'Your airtime is delivered instantly to your registered number.'
              : 'Airtime is delivered instantly to the recipient number you enter.') + '</span></div>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* ----------------------------------------------------------------- bills */
  CBE.define('bills', {
    render: function () {
      return '<section class="screen">' +
        U.appbar(CBE.t('billsUtilities')) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="logo-grid" style="margin-top:6px">' +
            CBE.data.billers.map(function (b) {
              return '<button class="logo-tile" data-goto="billerForm" data-action="goto" data-value="' + U.esc(b.id) + '">' +
                '<span class="brand">' + CBE.logoFor(b, 46) + '</span>' +
                '<span>' + U.esc(b.name) + '</span></button>';
            }).join('') +
          '</div>' +
        '</div></div>' +
        U.tabbar('home') +
      '</section>';
    }
  });

  CBE.define('billerForm', {
    render: function (p) {
      var biller = CBE.data.billers.filter(function (b) { return b.id === p.value; })[0] || CBE.data.billers[0];
      var needsAccount = ['eeu', 'aawsa', 'websprix', 'etiopost', 'ethiopost', 'safbill'].indexOf(biller.id) >= 0;
      return '<section class="screen">' +
        U.appbar(biller.name) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div style="display:flex;justify-content:center;padding:12px 0 6px">' + CBE.logoFor(biller, 62) + '</div>' +
          (needsAccount ? '<div class="field-label">' + U.esc(biller.id === 'aawsa' ? 'Customer Number' : 'Account / Meter Number') + '</div>' +
            U.field({ icon: 'edit', inputId: 'p-account', name: 'account', placeholder: 'Enter account number', inputmode: 'numeric' }) : '') +
          '<div class="field-label">' + U.esc(CBE.t('amount')) + '</div>' +
          U.field({ icon: 'cash', inputId: 'p-amount', name: 'amount', placeholder: CBE.t('enterAmount'), inputmode: 'decimal', tailAction: 'openAmountSheet', tail: CBE.icon('card', { size: 20 }) }) +
          '<button class="btn btn-primary" style="margin-top:22px" data-action="billPay" data-value="' + U.esc(biller.name) + '">' + U.esc(CBE.t('continue')) + '</button>' +
          '<div class="pill-note">' + CBE.icon('receipt', { size: 20 }) +
            '<span>Payment for <b>' + U.esc(biller.name) + '</b> is posted immediately. Keep the receipt for your records.</span></div>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* -------------------------------------------------------------- CBEBirr */
  CBE.define('cbebirr', {
    render: function () {
      return '<section class="screen">' +
        U.appbar('CBEBirr') +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div style="display:flex;justify-content:center;padding:14px 0 4px">' + CBE.cbeLogo(64) + '</div>' +
          '<p class="center muted" style="margin:0 0 14px;font-size:13.5px">Move money in and out of your CBEBirr wallet.</p>' +
          CBE.data.cbebirrOptions.map(function (o) {
            return '<button class="loan-tile" style="margin-bottom:12px" data-goto="cbebirrForm" data-action="goto" data-value="' + U.esc(o.id + '|' + o.title) + '">' +
              '<span class="txt" style="text-align:right">' +
                '<b>' + U.esc(o.title) + '</b><small>' + U.esc(o.sub) + '</small>' +
              '</span>' +
              '<span class="ico">' + CBE.icon('bankNote', { size: 20 }) + '</span>' +
              '</button>';
          }).join('') +
        '</div></div>' +
        U.tabbar('home') +
      '</section>';
    }
  });

  CBE.define('cbebirrForm', {
    render: function (p) {
      var parts = String(p.value || 'own|Transfer to own CBEBirr wallet').split('|');
      var id = parts[0], title = parts[1] || 'Transfer to own CBEBirr wallet';
      var needsPhone = id !== 'agent';
      return '<section class="screen">' +
        U.appbar(title) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="field-label" style="margin-top:14px">' +
            U.esc(needsPhone ? CBE.t('phoneNumber') : 'Agent code') + '</div>' +
          U.field({
            icon: needsPhone ? 'phoneHandset' : 'store', inputId: 'c-phone', name: 'phone',
            placeholder: needsPhone ? '09** *** ** **' : 'Enter agent code',
            inputmode: needsPhone ? 'tel' : 'numeric'
          }) +
          '<div class="field-label">' + U.esc(CBE.t('amount')) + '</div>' +
          U.field({ icon: 'cash', inputId: 'c-amount', name: 'amount', placeholder: CBE.t('enterAmount'), inputmode: 'decimal', tailAction: 'openAmountSheet', tail: CBE.icon('card', { size: 20 }) }) +
          '<button class="btn btn-primary" style="margin-top:22px" data-action="cbebirrPay" data-value="' + U.esc(title) + '">' + U.esc(CBE.t('continue')) + '</button>' +
          '<div class="pill-note">' + CBE.icon('shieldCheck', { size: 20 }) +
            '<span>CBEBirr transfers are instant and settled on the Ethio telecom wallet network.</span></div>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* -------------------------------------------------------------- actions */
  CBE.paymentActions = {
    airtimePay: function (value) {
      var parts = String(value || 'ethio|self').split('|');
      var prov = parts[0], self = parts[1] === 'self';
      var phone = document.getElementById('a-phone');
      var amount = document.getElementById('a-amount');
      var ph = phone ? phone.value.trim() : '';
      var amt = amount ? Number(String(amount.value).replace(/[^\d.]/g, '')) : 0;
      if (ph.length < 9) { U.toast('Enter a valid phone number'); return; }
      if (!(amt > 0)) { U.toast('Enter a valid amount'); return; }
      CBE.pay.start({
        kind: 'airtime', tag: 'AIRTIME', charges: false,
        toName: prov === 'safaricom' ? 'Safaricom Topup' : 'Ethio Telecom',
        toAcc: ph, amount: amt,
        remark: self ? 'Airtime - self' : 'Airtime - other'
      });
    },
    billPay: function (name) {
      var amount = document.getElementById('p-amount');
      var acc = document.getElementById('p-account');
      var amt = amount ? Number(String(amount.value).replace(/[^\d.]/g, '')) : 0;
      if (!(amt > 0)) { U.toast('Enter a valid amount'); return; }
      CBE.pay.start({
        kind: 'bill', tag: 'BILL PAYMENT', charges: false,
        toName: name, toAcc: acc ? acc.value.trim() : '', amount: amt
      });
    },
    cbebirrPay: function (title) {
      var phone = document.getElementById('c-phone');
      var amount = document.getElementById('c-amount');
      var ph = phone ? phone.value.trim() : '';
      var amt = amount ? Number(String(amount.value).replace(/[^\d.]/g, '')) : 0;
      if (!ph) { U.toast('Enter the wallet number or agent code'); return; }
      if (!(amt > 0)) { U.toast('Enter a valid amount'); return; }
      CBE.pay.start({
        kind: 'cbebirr', tag: 'WALLET', charges: true,
        toName: String(title || 'CBEBirr Wallet').replace('Transfer to ', '').replace(/^\w/, function (c) { return c.toUpperCase(); }),
        toAcc: ph, amount: amt
      });
    }
  };
})(typeof window !== 'undefined' ? window : this);
