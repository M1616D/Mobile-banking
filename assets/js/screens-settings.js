/* ==========================================================================
   screens-settings.js — Settings, its preference pages, My Information,
   Contact Us, Withdrawal History and the hidden private setup
   ========================================================================== */
(function (global) {
  'use strict';
  var CBE = global.CBE;
  var U = CBE.ui;

  function iconRow(title, sub, icon, goto, opts) {
    opts = opts || {};
    return '<button class="row" data-action="goto" data-goto="' + U.esc(goto) + '">' +
      '<span class="ico"' + (opts.danger ? ' style="background:var(--red-soft);color:var(--red)"' : '') + '>' +
        (opts.logo ? CBE.cbeLogo(22) : CBE.icon(icon, { size: 20 })) + '</span>' +
      '<span class="txt"><b' + (opts.danger ? ' style="color:var(--red)"' : '') + '>' + U.esc(title) + '</b>' +
      (sub ? '<small>' + U.esc(sub) + '</small>' : '') + '</span>' +
      '<span class="chev">' + CBE.icon('chevronRight', { size: 19 }) + '</span></button>';
  }

  /* a settings card: icon tile, bold title, small description, purple switch */
  function switchCard(icon, title, sub, key, on) {
    return '<div class="row' + '" style="align-items:center">' +
      '<span class="ico">' + CBE.icon(icon, { size: 20 }) + '</span>' +
      '<span class="txt"><b>' + U.esc(title) + '</b>' + (sub ? '<small>' + U.esc(sub) + '</small>' : '') + '</span>' +
      '<button class="switch set-switch' + (on ? ' on' : '') + '" data-toggle="' + U.esc(key) + '" aria-label="' + U.esc(title) + '"></button>' +
      '</div>';
  }

  /* ------------------------------------------------------------- settings */
  CBE.define('settings', {
    render: function () {
      return '<section class="screen">' +
        U.appbar(CBE.t('settings'), { right: '' }) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="section-label">' + U.esc(CBE.t('preferences')) + '</div>' +
          '<div class="group">' +
            iconRow(CBE.t('languageLabel'), CBE.t('language'), 'globe', 'language') +
            iconRow(CBE.t('accountPreferences'), '', 'users', 'accountPreferences') +
            iconRow(CBE.t('notificationPreferences'), '', 'bell', 'notificationPreferences') +
            iconRow(CBE.t('servicePreferences'), '', 'sliders', 'servicePreferences') +
          '</div>' +
          '<div class="section-label">' + U.esc(CBE.t('securitySettings')) + '</div>' +
          '<div class="group">' +
            iconRow(CBE.t('biometricLogin'), '', 'fingerprint', 'biometricLogin') +
            iconRow(CBE.t('changePin'), '', 'key', 'changePin') +
            iconRow(CBE.t('changePassphrase'), '', 'lockSquare', 'changePassphrase') +
          '</div>' +
          '<div class="section-label">' + U.esc(CBE.t('accountActions')) + '</div>' +
          '<div class="group">' +
            iconRow(CBE.t('logOut'), '', 'logOut', 'logout', { danger: true }) +
          '</div>' +
          '<button class="version-note" data-action="versionTap">' +
            U.esc(CBE.t('version')) + ': ' + CBE.data.version + '</button>' +
          '<div class="legal-links">' +
            '<button data-goto="privacy" data-action="goto">' + U.esc(CBE.t('privacyPolicy')) + '</button>' +
            '<span class="muted">·</span>' +
            '<button data-goto="terms" data-action="goto">' + U.esc(CBE.t('termsTariffs')) + '</button>' +
          '</div>' +
        '</div></div>' +
        U.tabbar('settings') +
      '</section>';
    }
  });

  /* --------------------------------------------------------- language page */
  CBE.define('language', {
    render: function () {
      var langs = [
        { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
        { code: 'en', name: 'English', flag: '🇺🇸' }
      ];
      return '<section class="screen">' +
        U.appbar(CBE.t('selectLanguage')) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="group" style="margin-top:8px;padding:6px 10px">' +
            langs.map(function (l) {
              return '<button class="lang-opt' + (CBE.state.lang === l.code ? ' active' : '') + '" data-set-lang="' + l.code + '">' +
                '<span class="dot">' + (CBE.state.lang === l.code ? CBE.icon('check', { size: 14, weight: 3 }) : '') + '</span>' +
                '<span class="flag">' + l.flag + '</span>' +
                '<span>' + U.esc(l.name) + '</span></button>';
            }).join('') +
          '</div>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* ------------------------------- default account preferences (screenshot) */
  function defaultAccountRow(title, sub, icon, which) {
    var a = CBE.state.account;
    return '<div class="row" style="align-items:center">' +
      '<span class="ico">' + CBE.icon(icon, { size: 20 }) + '</span>' +
      '<span class="txt"><b>' + U.esc(title) + '</b><small>' + U.esc(sub) + '</small></span>' +
      '<button class="btn mini btn-soft" data-set-account="' + CBE.state.accountIndex + '" ' +
        'style="width:auto;background:#f2edfa;color:var(--purple-600);font-weight:700" data-action="pickDefaultAccount">' +
        U.esc(CBE.t('change')) + ' ' + CBE.icon('chevronDown', { size: 15 }) + '</button>' +
      '</div>';
  }

  CBE.define('accountPreferences', {
    render: function () {
      var a = CBE.state.account;
      return '<section class="screen">' +
        U.appbar(CBE.t('defaultAccountPreferences'), {
          right: '<button class="icon-btn" data-action="toggleBalance">' + CBE.icon(CBE.state.showBalance ? 'eye' : 'eyeOff', { size: 20 }) + '</button>'
        }) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="section-label">' + U.esc(CBE.t('defaultAccounts')) + '</div>' +
          '<div class="group">' +
            defaultAccountRow(CBE.t('sendingMoney'), a.type === 'CBEBirr Wallet' ? a.label : CBE.t('savingAccount') + ' (****' + U.last4(CBE.state.profile.accountNumber) + ')', 'arrowUpRight', 'send') +
            defaultAccountRow(CBE.t('receivingMoney'), CBE.t('savingAccount') + ' (****' + U.last4(CBE.state.profile.accountNumber) + ')', 'arrowDownLeft', 'receive') +
          '</div>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* ------------------------------------------- notification preferences */
  CBE.define('notificationPreferences', {
    render: function () {
      return '<section class="screen">' +
        U.appbar(CBE.t('notificationPreferences'), { right: '' }) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="section-label">' + U.esc(CBE.t('generalNotifications')) + '</div>' +
          '<div class="group">' +
            switchCard('chat', 'SMS Notifications', 'Receive important updates via SMS', 'smsAlerts', CBE.state.smsAlerts !== false) +
            switchCard('chat', 'Email Notifications', 'Get emails for account activity and promotions', 'emailAlerts', CBE.state.emailAlerts !== false) +
            switchCard('bell', 'Push Notifications', 'Receive instant alerts on your device', 'pushAlerts', CBE.state.pushAlerts !== false) +
            switchCard('phoneGrid', 'In-App Notifications', 'See notifications directly within the app', 'inAppAlerts', CBE.state.inAppAlerts !== false) +
          '</div>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* ------------------------------------------------- service preferences */
  CBE.define('servicePreferences', {
    render: function () {
      return '<section class="screen">' +
        U.appbar(CBE.t('servicePreferences'), { right: '' }) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="section-label">' + U.esc(CBE.t('serviceOptions')) + '</div>' +
          '<div class="group">' +
            switchCard('ussd', 'USSD Enabled', 'Allow USSD interactions for specific services', 'ussdEnabled', CBE.state.ussdEnabled !== false) +
          '</div>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* ------------------------------------------------------ security setting */
  CBE.define('biometricLogin', {
    render: function () {
      return '<section class="screen">' +
        U.appbar(CBE.t('securitySetting'), { right: '' }) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="section-label">' + U.esc(CBE.t('preferences')) + '</div>' +
          '<div class="group">' +
            '<div class="row" style="align-items:center">' +
              '<span class="ico" style="background:var(--purple-500);color:#fff;border-radius:12px">' + CBE.icon('fingerprint', { size: 20 }) + '</span>' +
              '<span class="txt"><b>' + U.esc(CBE.t('biometricLogin')) + '</b>' +
                '<small>' + U.esc(CBE.t('biometricIsOn')) + '</small></span>' +
              '<button class="switch set-switch' + (CBE.state.biometric ? ' on' : '') + '" data-toggle="biometric"></button>' +
            '</div>' +
          '</div>' +
          '<div class="group">' +
            switchCard('shieldCheck', 'Biometric transfers', 'Ask for a fingerprint before every transfer', 'biometricTxn', CBE.state.biometricTxn !== false) +
          '</div>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* ------------------------------------------------------------- change PIN */
  function secretField(id, label, icon) {
    return '<div class="field-label" style="margin-top:14px">' + U.esc(label) + '</div>' +
      '<div class="field"><span class="fico purple">' + CBE.icon(icon, { size: 20 }) + '</span>' +
        '<input id="' + id + '" type="password" inputmode="numeric" autocomplete="off" placeholder="' + U.esc(label) + '">' +
        '<span class="tail" data-eye="' + id + '">' + CBE.icon('eye', { size: 19 }) + '</span>' +
      '</div>';
  }

  CBE.define('changePin', {
    render: function () {
      return '<section class="screen">' +
        U.appbar(CBE.t('changePin'), { right: '' }) +
        '<div class="sheet-light"><div class="screen-body">' +
          secretField('pin-old', 'Current PIN', 'lock') +
          secretField('pin-new', 'New PIN', 'key') +
          secretField('pin-confirm', 'Confirm New PIN', 'key') +
          '<button class="btn btn-primary" style="margin-top:22px;background:#c9a2e8" data-action="savePin">' + U.esc(CBE.t('updatePin')) + '</button>' +
        '</div></div>' +
      '</section>';
    }
  });

  CBE.define('changePassphrase', {
    render: function () {
      return '<section class="screen">' +
        U.appbar(CBE.t('changePassphrase'), { right: '' }) +
        '<div class="sheet-light"><div class="screen-body">' +
          secretField('pp-old', 'Current Passphrase', 'lockSquare') +
          secretField('pp-new', 'New Passphrase', 'key') +
          secretField('pp-confirm', 'Confirm New Passphrase', 'key') +
          '<button class="btn btn-primary" style="margin-top:22px;background:#c9a2e8" data-action="savePassphrase">' + U.esc(CBE.t('updatePassphrase')) + '</button>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* ----------------------------------------------------- withdrawal history */
  CBE.define('withdrawalHistory', {
    render: function () {
      var list = CBE.state.withdrawals || [];
      var empty = U.emptyVisual({
        icon: 'receiptCheck',
        title: CBE.t('noWithdrawals'),
        text: CBE.t('noWithdrawalsHint'),
        cta: 'Refresh History',
        action: 'refreshHistory',
        ctaIcon: 'refresh'
      });
      return '<section class="screen">' +
        U.appbar(CBE.t('withdrawalHistory'), {
          right: '<button class="icon-btn" data-action="refreshHistory">' + CBE.icon('refresh', { size: 20 }) + '</button>'
        }) +
        '<div class="sheet-light"><div class="sheet-light" style="margin-top:0;padding-top:0">' +
          '<div class="screen-body no-nav">' +
            (list.length ? '<div class="group" style="margin-top:10px">' + list.map(function (w) {
              return '<div class="row"><span class="ico">' + CBE.icon('cashOut', { size: 20 }) + '</span>' +
                '<span class="txt"><b>' + U.esc(w.agent || 'Agent withdrawal') + '</b><small>' + U.esc(U.longDate(w.date)) + '</small></span>' +
                '<span class="txt" style="flex:0 0 auto"><b>' + U.moneyCur(w.amount) + '</b></span></div>';
            }).join('') + '</div>' : '<div style="padding-top:40px">' + empty + '</div>') +
          '</div>' +
          '<button class="fab" data-action="newWithdrawal">' + CBE.icon('plusCircle', { size: 20 }) + 'New Withdrawal</button>' +
        '</div></div>' +
      '</section>';
    }
  });

  CBE.define('privacy', {
    render: function () {
      return '<section class="screen">' +
        U.appbar(CBE.t('privacyPolicy')) +
        '<div class="sheet-light"><div class="screen-body no-nav">' +
          '<div class="group" style="margin-top:8px;padding:16px">' +
            '<p style="font-size:13.5px;line-height:1.7;margin:0 0 12px">Commercial Bank of Ethiopia respects your privacy. This app keeps every preference, recipient and transaction on your device only; nothing is sent anywhere and it works with no connection.</p>' +
            '<p style="font-size:13.5px;line-height:1.7;margin:0 0 12px">Account numbers are shown masked, and the balance displayed is demo data for presentation purposes.</p>' +
            '<p style="font-size:13.5px;line-height:1.7;margin:0">For the production application, refer to the official CBE privacy notice published at cbe.com.et.</p>' +
          '</div>' +
        '</div></div>' +
      '</section>';
    }
  });

  CBE.define('terms', {
    render: function () {
      var f = CBE.state.feeCfg;
      return '<section class="screen">' +
        U.appbar(CBE.t('termsTariffs')) +
        '<div class="sheet-light"><div class="screen-body no-nav">' +
          '<div class="group" style="margin-top:8px;padding:16px">' +
            '<p style="font-size:13.5px;line-height:1.7;margin:0 0 14px"><b>Service charges</b><br>Transfer service charge ' +
              U.moneyCur(f.sc) + ', VAT ' + f.vatPct + '% of the charge, and Disaster Risk Response Fund ' + f.drfPct + '% of the charge.</p>' +
            '<p style="font-size:13.5px;line-height:1.7;margin:0 0 14px"><b>Airtime and bill payments</b><br>No service charge is applied on airtime or utility payments.</p>' +
            '<p style="font-size:13.5px;line-height:1.7;margin:0"><b>Daily limits</b><br>ETB 50,000 per transaction and ETB 200,000 per day for mobile banking transfers.</p>' +
          '</div>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* -------------------------------------------------------- My Information */
  CBE.define('myInfo', {
    render: function () {
      var p = CBE.state.profile;
      var tab = CBE.state.myInfoTab || 'account';
      var isPhone = tab === 'phone';
      var phone = p.phone || '+251902468625';
      var label = isPhone ? phone : U.maskAccount(p.accountNumber);
      var payload = String(isPhone ? phone : p.accountNumber);
      return '<section class="screen">' +
        U.appbar(CBE.t('myInformation'), { right: '' }) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="group" style="margin-top:8px">' +
            '<div class="row" style="padding:15px 14px">' +
              '<span class="av-lg">' + CBE.icon('person', { size: 24 }) + '</span>' +
              '<span class="txt"><b>' + U.esc(p.holderName) + '</b>' +
              '<small>' + U.esc(CBE.t('lastSignIn')) + ': ' + U.esc(p.lastSignIn) + '</small></span>' +
            '</div>' +
            '<button class="row" data-goto="contactUs" data-action="goto">' +
              '<span class="ico">' + CBE.icon('clip', { size: 20 }) + '</span>' +
              '<span class="txt"><b>' + U.esc(CBE.t('contactUs')) + '</b></span>' +
              '<span class="chev">' + CBE.icon('chevronRight', { size: 19 }) + '</span></button>' +
            '<div class="row" style="align-items:center">' +
              '<span class="ico gold">' + CBE.cbeLogo(24) + '</span>' +
              '<span class="txt"><b>' + U.esc(CBE.t('cbeNoor')) + '</b>' +
                '<small>' + U.esc('ለፉ ኑር') + '</small></span>' +
              '<button class="switch set-switch' + (CBE.state.noor ? ' on' : '') + '" data-toggle="noor" ' +
                'aria-label="CBE NOOR"></button>' +
            '</div>' +
          '</div>' +

          '<div class="seg" style="margin-top:16px">' +
            '<button class="' + (isPhone ? '' : 'active') + '" data-myinfo-tab="account">' + U.esc(CBE.t('myAccounts')) + '</button>' +
            '<button class="' + (isPhone ? 'active' : '') + '" data-myinfo-tab="phone">' + U.esc(CBE.t('phoneNumber')) + '</button>' +
          '</div>' +

          '<div class="qr-plate" style="margin-top:14px">' +
            '<span class="frame">' + CBE.qr.svg(payload, { modules: 33 }) + '</span>' +
            '<span class="label">' + U.esc(label) + '</span>' +
            '<span class="hint">' + U.esc(isPhone ? CBE.t('scanPhone') : CBE.t('scanAccount')) + '</span>' +
          '</div>' +

          '<button class="btn btn-gold" style="margin-top:20px" data-goto="logout" data-action="goto">' + U.esc(CBE.t('logOut')) + '</button>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* ------------------------------------------------------------ contact us */
  CBE.define('contactUs', {
    render: function () {
      var social = [
        { name: 'Facebook', icon: 'globe', color: '#1877f2' },
        { name: 'Twitter', icon: 'chat', color: '#1da1f2' },
        { name: 'Telegram', icon: 'share', color: '#2aabee' },
        { name: 'LinkedIn', icon: 'users', color: '#0a66c2' },
        { name: 'YouTube', icon: 'film', color: '#ff0000' }
      ];
      return '<section class="screen">' +
        U.appbar(CBE.t('contactUs'), { right: '' }) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="group" style="margin-top:6px">' +
            '<div class="row">' + CBE.cbeLogo(38) +
              '<span class="txt"><b>' + U.esc(CBE.t('bankNameLong')) + '</b><small>Digital Factory</small></span></div>' +
            '<div class="row"><span class="ico">' + CBE.icon('doc', { size: 20 }) + '</span>' +
              '<span class="txt"><b>' + U.esc(CBE.t('version')) + '</b><small>' + CBE.data.version + '</small></span></div>' +
          '</div>' +
          '<div class="section-label">' + U.esc(CBE.t('contactAddresses')) + '</div>' +
          '<div class="group">' +
            '<button class="row" data-action="copyValue" data-value="' + U.esc(CBE.data.tel) + '"><span class="ico">' + CBE.icon('callCenter', { size: 20 }) + '</span>' +
              '<span class="txt"><b>' + U.esc(CBE.data.tel) + '</b></span></button>' +
            '<button class="row" data-action="copyValue" data-value="' + U.esc(CBE.data.email) + '"><span class="ico">' + CBE.icon('chat', { size: 20 }) + '</span>' +
              '<span class="txt"><b>' + U.esc(CBE.data.email) + '</b></span></button>' +
            '<button class="row" data-action="copyValue" data-value="https://combanketh.et"><span class="ico">' + CBE.icon('globe', { size: 20 }) + '</span>' +
              '<span class="txt"><b>https://combanketh.et</b></span></button>' +
          '</div>' +
          '<div class="section-label">' + U.esc(CBE.t('socialMedias')) + '</div>' +
          '<div class="group">' +
            social.map(function (s) {
              return '<button class="row" data-action="social" data-value="' + s.name + '">' +
                '<span class="ico" style="color:' + s.color + ';background:transparent">' + CBE.icon(s.icon, { size: 20 }) + '</span>' +
                '<span class="txt"><b>' + s.name + '</b></span></button>';
            }).join('') +
          '</div>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* --------------------------------------------------------- my accounts */
  CBE.define('myAccounts', {
    render: function () {
      return '<section class="screen">' +
        U.appbar(CBE.t('myAccounts')) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="group" style="margin-top:8px">' +
            CBE.state.accounts.map(function (a, i) {
              return '<div class="row"><span class="ico">' + CBE.icon('bankNote', { size: 20 }) + '</span>' +
                '<span class="txt"><b>' + U.esc(a.label) + '</b><small>' + U.moneyCur(a.balance) + '</small></span>' +
                '<button class="btn mini btn-soft" data-set-account="' + i + '">' + (CBE.state.accountIndex === i ? 'Primary' : 'Set') + '</button></div>';
            }).join('') +
          '</div>' +
        '</div></div>' +
      '</section>';
    }
  });

  CBE.define('cbeNoor', {
    render: function () {
      return '<section class="screen">' +
        U.appbar(CBE.t('cbeNoor')) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div style="text-align:center;padding:20px 0 4px">' + CBE.cbeLogo(64) + '</div>' +
          '<p class="center muted" style="font-size:13.5px;margin:10px 0 18px">CBE NOOR is Commercial Bank of Ethiopia’s interest free banking window with profit-sharing accounts.</p>' +
          '<div class="group">' +
            iconRow('Open a NOOR account', 'Wadiah and Mudarabah products', 'bankNote', 'contactUs') +
            iconRow('NOOR service charges', 'Interest free fee schedule', 'receipt', 'terms') +
            iconRow('NOOR support line', CBE.data.tel, 'callCenter', 'contactUs') +
          '</div>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* ------------------------------------------------------- private setup
     The hidden screen: the account holder details, the receiver every coming
     transfer is issued to, the letterhead of the customer receipt and the
     already issued receipts, ready to be adjusted. */
  CBE.define('privateSettings', {
    render: function () {
      var p = CBE.state.profile, pre = CBE.state.preset, m = CBE.state.receiptMeta, f = CBE.state.feeCfg;
      function inp(id, label, value, icon, mode) {
        return '<div class="field-label">' + U.esc(label) + '</div>' +
          U.field({ icon: icon, inputId: id, name: id, value: value, inputmode: mode });
      }
      return '<section class="screen">' +
        U.appbar('Private Setup', { right: '' }) +
        '<div class="sheet-light"><div class="sheet-light" style="margin-top:0;padding-top:6px"><div class="screen-body">' +
          '<div class="section-label">Account</div>' +
          inp('ps-name', 'Account holder name', p.holderName, 'person') +
          inp('ps-account', 'Account number', p.accountNumber, 'bankNote', 'numeric') +
          inp('ps-balance', 'Balance (ETB)', String(p.balance), 'cash', 'decimal') +
          inp('ps-phone', 'Phone number', p.phone, 'phoneHandset', 'tel') +
          inp('ps-tin', 'TIN', p.tin, 'doc') +

          '<div class="section-label">Receiver</div>' +
          inp('ps-rname', 'Receiver full name', pre.name, 'person') +
          inp('ps-raccount', 'Receiver account', pre.account, 'bankNote', 'numeric') +

          '<div class="section-label">Service charges</div>' +
          inp('fc-sc', 'Service charge (ETB)', String(f.sc), 'cash', 'decimal') +
          inp('fc-vat', 'VAT (% of service charge)', String(f.vatPct), 'doc', 'decimal') +
          inp('fc-drf', 'Disaster Recovery (% of service charge)', String(f.drfPct), 'doc', 'decimal') +

          '<div class="btn-stack">' +
            '<button class="btn btn-soft" data-action="resetPrivate">Reset all</button>' +
            '<button class="btn btn-primary" data-action="savePrivate">Save</button>' +
          '</div>' +

          '<button class="ghost-row" data-goto="receiptList" data-action="goto">' +
            '<span class="ico">' + CBE.icon('receipt', { size: 20 }) + '</span>' +
            '<span class="txt"><b>' + U.esc('Receipts') + '</b></span>' +
            '<span class="chev">' + CBE.icon('chevronRight', { size: 19 }) + '</span></button>' +
        '</div></div></div>' +
      '</section>';
    }
  });

  /* --------------------------------------------- already issued receipts */
  CBE.define('receiptList', {
    render: function () {
      var list = CBE.state.transactions;
      return '<section class="screen">' +
        U.appbar('Made receipts', { right: '' }) +
        '<div class="sheet-light"><div class="sheet-body screen-body">' +
          (list.length ? '<div class="group" style="margin-top:8px;padding:4px 12px">' + list.map(function (t) {
            return '<button class="rec-pick" data-action="editReceipt" data-value="' + U.esc(t.id) + '">' +
              '<span class="txt"><b>' + U.esc(t.to || t.name) + '</b>' +
              '<small>' + U.esc(U.shortDate(t.date)) + ' · ' + U.esc(t.ref) + '</small></span>' +
              '<span class="amt">' + U.moneyCur(Math.abs(t.amount)) + '</span></button>';
          }).join('') + '</div>' : U.emptyState(CBE.t('noResults'))) +
        '</div></div>' +
      '</section>';
    }
  });

  /* --------------------------------------------------------------- actions */
  var versionTaps = 0, versionTimer = null;

  CBE.settingsActions = {
    setLang: function (code) {
      CBE.state.lang = code;
      CBE.save();
      CBE.render();
      U.toast(code === 'am' ? 'ቋንቋ ተቀይሯል' : 'Language set to English');
    },
    setAccount: function (i) {
      var a = CBE.state.accounts[Number(i)];
      if (!a) return;
      CBE.state.accountIndex = Number(i);
      CBE.state.profile.accountNumber = String(a.full);
      CBE.state.profile.balance = CBE.round2(a.balance);
      CBE.syncAccount();
      CBE.save();
      CBE.render();
      U.toast('Primary account updated');
    },
    pickDefaultAccount: function () {
      CBE.pickers.sheet('Choose account', CBE.state.accounts.map(function (a) {
        return { name: a.label, sub: U.moneyCur(a.balance), _acc: a };
      }), function (item) {
        var idx = CBE.state.accounts.indexOf(item._acc);
        if (idx >= 0) CBE.settingsActions.setAccount(idx);
      });
    },
    toggle: function (key) {
      CBE.state[key] = !CBE.state[key];
      CBE.save();
      CBE.render();
      if (key === 'noor') U.toast(CBE.state.noor ? 'CBE NOOR on' : 'CBE NOOR off');
    },
    myInfoTab: function (tab) { CBE.state.myInfoTab = tab; CBE.save(); CBE.render(); },
    toggleSecret: function (id) {
      var el = document.getElementById(id);
      if (el) el.type = el.type === 'password' ? 'text' : 'password';
    },
    savePin: function () {
      var a = document.getElementById('pin-old'), b = document.getElementById('pin-new'), c = document.getElementById('pin-confirm');
      var oldv = a ? a.value.trim() : '', nv = b ? b.value.trim() : '', cv = c ? c.value.trim() : '';
      if (oldv !== CBE.state.pin) { U.toast('Current PIN is incorrect'); return; }
      if (!/^\d{6}$/.test(nv)) { U.toast('New PIN must be 6 digits'); return; }
      if (nv !== cv) { U.toast('PINs do not match'); return; }
      CBE.state.pin = nv;
      CBE.save();
      U.toast('PIN changed successfully');
      CBE.back();
    },
    savePassphrase: function () {
      var a = document.getElementById('pp-old'), b = document.getElementById('pp-new'), c = document.getElementById('pp-confirm');
      var nv = b ? b.value.trim() : '', cv = c ? c.value.trim() : '';
      if (!(a && a.value)) { U.toast('Enter your current passphrase'); return; }
      if (nv.length < 8) { U.toast('Passphrase must be at least 8 characters'); return; }
      if (nv !== cv) { U.toast('Passphrases do not match'); return; }
      CBE.state.passphrase = nv;
      CBE.save();
      U.toast('Passphrase updated');
      CBE.back();
    },
    versionTap: function () {
      versionTaps++;
      clearTimeout(versionTimer);
      versionTimer = setTimeout(function () { versionTaps = 0; }, 1400);
      if (versionTaps >= 5) {
        versionTaps = 0;
        CBE.nav('privateSettings');
      }
    },
    savePrivate: function () {
      function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
      var p = CBE.state.profile, pre = CBE.state.preset, f = CBE.state.feeCfg;
      if (val('ps-name')) p.holderName = val('ps-name');
      var acc = val('ps-account').replace(/\D/g, '');
      if (acc.length >= 6) p.accountNumber = acc;
      var bal = Number(String(val('ps-balance')).replace(/[^\d.]/g, ''));
      if (!isNaN(bal) && bal >= 0) p.balance = CBE.round2(bal);
      if (val('ps-phone')) p.phone = val('ps-phone');
      if (val('ps-tin')) p.tin = val('ps-tin');

      /* the receiver every coming transfer is issued to */
      pre.name = val('ps-rname');
      pre.account = val('ps-raccount').replace(/\D/g, '');

      /* service charge and the two rates are read back as real numbers, so
         every receipt is computed from them */
      var sc = Number(String(val('fc-sc')).replace(/[^\d.]/g, ''));
      var vat = Number(String(val('fc-vat')).replace(/[^\d.]/g, ''));
      var drf = Number(String(val('fc-drf')).replace(/[^\d.]/g, ''));
      f.sc = isNaN(sc) ? 0 : CBE.round2(sc);
      f.vatPct = isNaN(vat) ? 0 : vat;
      f.drfPct = isNaN(drf) ? 0 : drf;

      CBE.syncAccount();
      CBE.save();
      U.toast('Saved');
      CBE.back();
    },
    resetPrivate: function () {
      U.open('<div class="grabber"></div><h2>Reset everything?</h2>' +
        '<p class="center muted" style="font-size:13.5px;line-height:1.6;margin:0 0 18px">This clears the stored balance, account details, receipts and transactions.</p>' +
        '<div class="btn-stack"><button class="btn btn-cancel" data-action="closeSheet">Cancel</button>' +
        '<button class="btn btn-primary" data-action="doResetAll">Reset</button></div>', {});
    },
    doResetAll: function () {
      U.closeAll();
      CBE.resetAll();
      U.toast('Everything reset to defaults');
      CBE.reset('home');
    },
    refreshHistory: function () {
      U.toast('History refreshed');
      CBE.render();
    },
    newWithdrawal: function () {
      CBE.nav('cashOut');
    },
    logout: function () {
      CBE.state.authed = false;
      U.closeAll();
      CBE.nav('login', {}, { replace: true });
      U.toast('You have been logged out');
    }
  };

  CBE.define('logout', {
    render: function () {
      return '<section class="screen">' +
        U.appbar(CBE.t('logOut'), { right: '' }) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div style="text-align:center;padding:26px 0 6px;color:var(--red)">' + CBE.icon('logOut', { size: 60 }) + '</div>' +
          '<p class="center" style="font-size:15px;font-weight:700;margin:8px 0 6px">Log out of CBE Mobile Banking?</p>' +
          '<p class="center muted" style="font-size:13.5px;margin:0 0 20px">You will need your fingerprint or PIN to sign in again.</p>' +
          '<div class="btn-stack">' +
            '<button class="btn btn-cancel" data-action="back">' + U.esc(CBE.t('cancel')) + '</button>' +
            '<button class="btn btn-primary" data-action="doLogout">' + U.esc(CBE.t('logOut')) + '</button>' +
          '</div>' +
        '</div></div>' +
      '</section>';
    }
  });
})(typeof window !== 'undefined' ? window : this);
