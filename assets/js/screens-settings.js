/* ==========================================================================
   screens-settings.js — settings and every sub page, My Information,
   Contact Us, Withdrawal History plus the hidden setup and the list of
   receipts that were already made.
   ========================================================================== */
(function (global) {
  'use strict';
  var CBE = global.CBE;
  var U = CBE.ui;
  var t = function (k) { return CBE.t(k); };

  function body(inner, opts) {
    opts = opts || {};
    return '<section class="screen">' +
      '<div class="screen-body has-nav">' +
        U.appbar(opts.title, opts.appbar || {}) +
        inner +
      '</div>' +
      U.tabbar(opts.tab || 'settings') +
    '</section>';
  }

  /* ------------------------------------------------------------- settings */
  CBE.define('settings', {
    render: function () {
      var st = CBE.state;
      function srow(icon, title, sub, action, value) {
        var attr = '';
        if (value) attr = action === 'goto' ? ' data-goto="' + U.esc(value) + '"' : ' data-value="' + U.esc(value) + '"';
        return '<button class="row" data-action="' + action + '"' + attr + '>' +
          '<span class="ico">' + CBE.icon(icon, { size: 19 }) + '</span>' +
          '<span class="txt"><b>' + U.esc(title) + '</b>' + (sub ? '<small>' + U.esc(sub) + '</small>' : '') + '</span>' +
          '<span class="chev">' + CBE.icon('chevronRight', { size: 20 }) + '</span></button>';
      }
      return body(
        '<div class="sec-label" style="margin-top:16px">' + U.esc(t('preferences')) + '</div>' +
        '<div class="group">' +
          srow('globe', t('language'), CBE.t('language'), 'language') +
          srow('sliders', t('accountPreferences'), '', 'goto', 'accountPreferences') +
          srow('bell', t('notificationPreferences'), '', 'goto', 'notificationPreferences') +
          srow('filterLines', t('servicePreferences'), '', 'goto', 'servicePreferences') +
        '</div>' +
        '<div class="sec-label">' + U.esc(t('securitySettings')) + '</div>' +
        '<div class="group">' +
          srow('fingerprint', t('biometricLogin'), st.biometric ? 'On' : 'Off', 'goto', 'securitySettings') +
          srow('lock', t('changePin'), '', 'goto', 'changePin') +
          srow('shield', t('changePassphrase'), '', 'goto', 'changePassphrase') +
        '</div>' +
        '<div class="sec-label">' + U.esc(t('accountActions')) + '</div>' +
        '<div class="group">' +
          '<button class="row danger" data-action="doLogout">' +
            '<span class="ico">' + CBE.icon('logOut', { size: 19 }) + '</span>' +
            '<span class="txt"><b>' + U.esc(t('logOut')) + '</b></span>' +
            '<span class="chev">' + CBE.icon('chevronRight', { size: 20 }) + '</span></button>' +
        '</div>' +
        '<div class="version" data-action="versionTap">' + U.esc(t('version')) + ': ' + U.esc(CBE.data.version) + '</div>' +
        '<div class="legal-links">' +
          '<button data-goto="privacy">' + U.esc(t('privacyPolicy')) + '</button>' +
          '<span class="dot">·</span>' +
          '<button data-goto="terms">' + U.esc(t('termsTariffs')) + '</button>' +
        '</div>',
        { title: t('settings'), tab: 'settings' }
      );
    }
  });

  /* --------------------------------------------------------- my information */
  CBE.define('myInfo', {
    render: function (p) {
      var st = CBE.state;
      var tab = p.tab || 'accounts';
      var code = tab === 'phone' ? st.profile.phone : st.profile.accountNumber;
      var caption = tab === 'phone' ? t('scanPhone') : t('scanAccount');
      return '<section class="screen">' +
        '<div class="screen-body has-nav">' +
          U.appbar(t('myInformation'), { right: '' }) +
          '<div class="person-head" style="margin-top:16px">' +
            '<span class="avatar">' + CBE.icon('person', { size: 24 }) + '</span>' +
            '<span class="person-head-inner"><b>' + U.esc(st.profile.holderName) + '</b>' +
            '<small>' + U.esc(t('lastSignIn')) + ': ' + U.esc(st.profile.lastSignIn) + '</small></span>' +
          '</div>' +
          '<div class="group" style="margin-top:12px">' +
            '<button class="row" data-goto="contactUs">' +
              '<span class="ico">' + CBE.icon('phone', { size: 19 }) + '</span>' +
              '<span class="txt"><b>' + U.esc(t('contactUs')) + '</b></span>' +
              '<span class="chev">' + CBE.icon('chevronRight', { size: 20 }) + '</span></button>' +
            '<div class="switch-row" style="padding:14px 14px">' +
              '<span class="ico" style="width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:#fdf3dd">' + U.cbeLogo(22) + '</span>' +
              '<span class="txt"><b>' + U.esc(t('cbeNoor')) + '</b></span>' +
              '<button class="switch' + (st.noor ? ' on' : '') + '" data-toggle="noor"></button>' +
            '</div>' +
          '</div>' +
          '<div class="segmented">' +
            '<button class="' + (tab === 'accounts' ? 'active' : '') + '" data-myinfo-tab="accounts">' + U.esc(t('myAccounts')) + '</button>' +
            '<button class="' + (tab === 'phone' ? 'active' : '') + '" data-myinfo-tab="phone">' + U.esc(t('phoneNumber')) + '</button>' +
          '</div>' +
          '<div class="qr-plate narrow">' + '<img src="' + CBE.qr.dataUrl(code + '|myinfo', { modules: 33 }) + '" alt="QR code"></div>' +
          '<div class="qr-caption" style="font-weight:700;color:#1e2430;margin-top:12px">' + U.esc(tab === 'phone' ? st.profile.phone : U.maskAccount(st.profile.accountNumber)) + '</div>' +
          '<div class="qr-caption">' + U.esc(caption) + '</div>' +
          '<button class="btn btn-gold" style="margin-top:24px" data-action="doLogout">' + U.esc(t('logOut')) + '</button>' +
        '</div>' +
        U.tabbar('home') +
      '</section>';
    }
  });

  /* ---------------------------------------------------------- contact us */
  CBE.define('contactUs', {
    render: function () {
      var socials = [
        ['Facebook', '#1877f2', 'f'],
        ['Twitter', '#1da1f2', 't'],
        ['Telegram', '#2aabee', '✦'],
        ['LinkedIn', '#0a66c2', 'in'],
        ['YouTube', '#ff0000', '▶']
      ];
      return '<section class="screen">' +
        '<div class="screen-body has-nav">' +
          U.appbar(t('contactUs'), { right: '' }) +
          '<div class="brand-line" style="margin-top:16px">' + U.cbeLogo(40) +
            '<span class="t"><b>' + U.esc(t('bankNameLong')) + '</b><small>Digitally yours!</small></span></div>' +
          '<div class="group" style="margin-top:12px">' +
            '<div class="row" style="border-bottom:0">' +
              '<span class="ico">' + CBE.icon('globe', { size: 19 }) + '</span>' +
              '<span class="txt"><b>' + U.esc(t('version')) + '</b><small>' + U.esc(CBE.data.version) + '</small></span>' +
            '</div>' +
          '</div>' +
          '<div class="sec-label">' + U.esc(t('contactAddresses')) + '</div>' +
          '<div class="group">' +
            '<button class="row" data-action="copyValue" data-value="951">' +
              '<span class="ico">' + CBE.icon('callCenter', { size: 19 }) + '</span>' +
              '<span class="txt"><b>951</b></span><span class="chev">' + CBE.icon('copy', { size: 17 }) + '</span></button>' +
            '<button class="row" data-action="copyValue" data-value="contact@cbe.com.et">' +
              '<span class="ico">' + CBE.icon('chat', { size: 19 }) + '</span>' +
              '<span class="txt"><b>contact@cbe.com.et</b></span><span class="chev">' + CBE.icon('copy', { size: 17 }) + '</span></button>' +
            '<button class="row" data-action="copyValue" data-value="https://combanketh.et">' +
              '<span class="ico">' + CBE.icon('globe', { size: 19 }) + '</span>' +
              '<span class="txt"><b>https://combanketh.et</b></span><span class="chev">' + CBE.icon('copy', { size: 17 }) + '</span></button>' +
          '</div>' +
          '<div class="sec-label">' + U.esc(t('socialMedias')) + '</div>' +
          '<div class="group" style="padding:6px 14px">' +
            '<div class="medas">' + socials.map(function (s) {
              return '<button data-action="social" data-value="' + U.esc(s[0]) + '">' +
                '<span class="mi" style="width:28px;height:28px;border-radius:50%;background:' + s[1] + ';color:#fff;font-size:12px;font-weight:800;display:grid;place-items:center">' + s[2] + '</span>' +
                U.esc(s[0]) + '</button>';
            }).join('') + '</div>' +
          '</div>' +
        '</div>' +
        U.tabbar('settings') +
      '</section>';
    }
  });

  /* --------------------------------------------------- withdrawal history */
  CBE.define('withdrawalHistory', {
    render: function () {
      var list = CBE.state.withdrawals || [];
      return '<section class="screen">' +
        '<div class="screen-body has-nav">' +
          U.appbar(t('withdrawalHistory')) +
          (list.length
            ? list.map(function (w) { return U.txRow(w); }).join('')
            : '<div class="empty-visual">' +
                '<span class="sq">' + CBE.icon('receiptCheck', { size: 32 }) + '</span>' +
                '<h3>' + U.esc(t('noWithdrawals')) + '</h3>' +
                '<p>' + U.esc(t('noWithdrawalsHint')) + '</p>' +
                '<button class="pill-btn" data-action="refreshHistory">' + CBE.icon('refresh', { size: 18 }) + U.esc(t('refreshHistoryBtn')) + '</button>' +
              '</div>') +
          '<button class="fab" data-goto="cashOut">' + CBE.icon('plus', { size: 18 }) + U.esc(t('newWithdrawal')) + '</button>' +
        '</div>' +
        U.tabbar('home') +
      '</section>';
    }
  });

  /* ------------------------------------------------ preference sub pages */
  CBE.define('accountPreferences', {
    render: function () {
      var st = CBE.state;
      function row(kind, title) {
        return '<div class="row" style="border-bottom:0">' +
          '<span class="ico">' + CBE.icon(kind === 'send' ? 'arrowUpRight' : 'arrowDownLeft', { size: 19 }) + '</span>' +
          '<span class="txt"><b>' + U.esc(title) + '</b><small>' + U.esc(t('sendingMoneyAccount')) + ' (****' + U.last4(st.profile.accountNumber) + ')</small></span>' +
          '<button class="btn mini btn-soft" data-action="pickAccount">' + U.esc(t('change')) + CBE.icon('chevronDown', { size: 15 }) + '</button>' +
        '</div>';
      }
      return body(
        '<div class="sec-label" style="margin-top:16px">' + U.esc(t('defaultAccounts')) + '</div>' +
        '<div class="group">' + row('send', t('sendingMoney')) + row('receive', t('receivingMoney')) + '</div>',
        { title: t('defaultAccountPreferences') }
      );
    }
  });

  CBE.define('notificationPreferences', {
    render: function () {
      var st = CBE.state;
      return body(
        '<div class="sec-label" style="margin-top:16px">' + U.esc(t('generalNotifications')) + '</div>' +
        '<div class="group" style="padding:4px 14px">' +
          U.switchRow({ key: 'sms', on: st.sms !== false, title: 'SMS Notifications', sub: 'Receive important updates via SMS' }) +
          U.switchRow({ key: 'email', on: !!st.email, title: 'Email Notifications', sub: 'Get emails for account activity and promotions' }) +
          U.switchRow({ key: 'push', on: st.push !== false, title: 'Push Notifications', sub: 'Receive instant alerts on your device' }) +
          U.switchRow({ key: 'inapp', on: st.inapp !== false, title: 'In-App Notifications', sub: 'See notifications directly within the app' }) +
        '</div>',
        { title: t('notificationPreferences') }
      );
    }
  });

  CBE.define('servicePreferences', {
    render: function () {
      var st = CBE.state;
      return body(
        '<div class="sec-label" style="margin-top:16px">' + U.esc(t('serviceOptions')) + '</div>' +
        '<div class="group" style="padding:4px 14px">' +
          U.switchRow({ key: 'ussd', on: st.ussd !== false, title: 'USSD Enabled', sub: 'Allow USSD interactions for specific services' }) +
        '</div>',
        { title: t('servicePreferences') }
      );
    }
  });

  CBE.define('securitySettings', {
    render: function () {
      var st = CBE.state;
      return body(
        '<div class="sec-label" style="margin-top:16px">' + U.esc(t('preferences')) + '</div>' +
        '<div class="group" style="padding:4px 14px">' +
          U.switchRow({ key: 'biometric', on: !!st.biometric, title: t('biometricLogin'), sub: 'Biometric login is ' + (st.biometric ? 'on' : 'off') }) +
          U.switchRow({ key: 'biometricTxn', on: st.biometricTxn !== false, title: 'Authorise payments', sub: 'Confirm transfers with your fingerprint' }) +
        '</div>' +
        '<button class="btn btn-soft" style="margin-top:20px" data-action="testBiometric">Test biometrics</button>',
        { title: t('securitySetting') }
      );
    }
  });

  CBE.define('biometricLogin', { render: function () { return CBE.screens.securitySettings.render(); } });

  CBE.define('changePin', {
    render: function () {
      return body(
        '<div class="field" style="margin-top:18px"><span class="fico">' + CBE.icon('lock', { size: 20 }) +
          '</span><input id="cp-current" type="password" inputmode="numeric" maxlength="6" placeholder="Current PIN">' +
          '<span class="tail">' + CBE.icon('eye', { size: 19 }) + '</span></div>' +
        '<div class="field"><span class="fico">' + CBE.icon('lock', { size: 20 }) +
          '</span><input id="cp-new" type="password" inputmode="numeric" maxlength="6" placeholder="New PIN">' +
          '<span class="tail">' + CBE.icon('eye', { size: 19 }) + '</span></div>' +
        '<div class="field"><span class="fico">' + CBE.icon('lock', { size: 20 }) +
          '</span><input id="cp-confirm" type="password" inputmode="numeric" maxlength="6" placeholder="Confirm New PIN">' +
          '<span class="tail">' + CBE.icon('eye', { size: 19 }) + '</span></div>' +
        '<div class="field-error" id="cp-error" style="display:none"></div>' +
        '<button class="btn btn-primary" style="margin-top:24px" data-action="savePin">' + U.esc(t('updatePin')) + '</button>',
        { title: t('changePin') }
      );
    }
  });

  CBE.define('changePassphrase', {
    render: function () {
      return body(
        '<div class="field" style="margin-top:18px"><span class="fico">' + CBE.icon('shield', { size: 20 }) +
          '</span><input id="cps-current" type="password" placeholder="Current Passphrase">' +
          '<span class="tail">' + CBE.icon('eye', { size: 19 }) + '</span></div>' +
        '<div class="field"><span class="fico">' + CBE.icon('shield', { size: 20 }) +
          '</span><input id="cps-new" type="password" placeholder="New Passphrase">' +
          '<span class="tail">' + CBE.icon('eye', { size: 19 }) + '</span></div>' +
        '<div class="field"><span class="fico">' + CBE.icon('shield', { size: 20 }) +
          '</span><input id="cps-confirm" type="password" placeholder="Confirm New Passphrase">' +
          '<span class="tail">' + CBE.icon('eye', { size: 19 }) + '</span></div>' +
        '<div class="field-error" id="cps-error" style="display:none"></div>' +
        '<button class="btn btn-primary" style="margin-top:24px" data-action="savePassphrase">' + U.esc(t('updatePassphrase')) + '</button>',
        { title: t('changePassphrase') }
      );
    }
  });

  /* --------------------------------------------------- hidden setup screen
     Reached only by tapping the version line five times. It carries no hint
     anywhere in the app. */
  CBE.define('privateSetup', {
    render: function () {
      var st = CBE.state;
      return body(
        '<div class="sec-label" style="margin-top:16px">Receiver</div>' +
        '<div class="field" style="min-height:58px">' +
          '<span class="fico">' + CBE.icon('person', { size: 20 }) + '</span>' +
          '<input id="pv-name" value="' + U.esc(st.preset.name) + '" placeholder="Full name">' +
        '</div>' +
        '<div class="sec-label">Charges and taxes</div>' +
        '<div class="field" style="min-height:58px">' +
          '<span class="fico">' + CBE.icon('coins', { size: 20 }) + '</span>' +
          '<input id="pv-sc" inputmode="decimal" value="' + U.esc(st.feeCfg.sc) + '" placeholder="Service charge (ETB)">' +
        '</div>' +
        '<div class="field">' +
          '<span class="fico">' + CBE.icon('receipt', { size: 20 }) + '</span>' +
          '<input id="pv-vat" inputmode="decimal" value="' + U.esc(st.feeCfg.vatPct) + '" placeholder="VAT (%)">' +
        '</div>' +
        '<div class="field">' +
          '<span class="fico">' + CBE.icon('shield', { size: 20 }) + '</span>' +
          '<input id="pv-drf" inputmode="decimal" value="' + U.esc(st.feeCfg.drfPct) + '" placeholder="Disaster recovery (%)">' +
        '</div>' +
        '<button class="btn btn-primary" style="margin-top:24px" data-action="savePrivate">' + U.esc(t('save')) + '</button>' +
        '<button class="btn btn-soft" style="margin-top:12px" data-goto="madeReceipts">' + U.esc(t('madeReceipts')) + '</button>' +
        '<button class="btn btn-ghost" style="margin-top:12px" data-action="resetPrivate">' + U.esc('Clear') + '</button>',
        { title: 'Setup', tab: 'settings' }
      );
    }
  });

  CBE.define('madeReceipts', {
    render: function () {
      var list = CBE.state.transactions.filter(function (x) { return x.amount < 0; });
      return body(
        (list.length
          ? '<div style="padding-top:16px">' + list.map(function (x) {
              return '<div class="txn" style="align-items:flex-start;flex-direction:column;gap:10px">' +
                '<div style="display:flex;align-items:center;gap:12px;width:100%">' +
                  '<span class="ico out">' + CBE.icon('arrowUpRight', { size: 19 }) + '</span>' +
                  '<span class="txt" style="flex:1"><b>' + U.esc(x.name) + '</b><small>' + U.esc(U.shortDate(x.date)) + '</small></span>' +
                  '<span class="amt out">' + U.signed(x.amount) + ' ETB</span>' +
                '</div>' +
                '<div style="display:flex;gap:8px;width:100%">' +
                  '<button class="btn mini btn-soft" style="flex:1" data-action="editReceipt" data-value="' + U.esc(x.id) + '">Edit</button>' +
                  '<button class="btn mini btn-soft" style="flex:1" data-goto="receipt" data-value="' + U.esc(x.id) + '">Open</button>' +
                  '<button class="btn mini btn-ghost" data-action="deleteReceipt" data-value="' + U.esc(x.id) + '">Delete</button>' +
                '</div>' +
              '</div>';
            }).join('') + '</div>'
          : U.emptyState(t('noReceipts')))
        , { title: t('madeReceipts'), tab: 'settings' }
      );
    }
  });
})(typeof window !== 'undefined' ? window : this);
