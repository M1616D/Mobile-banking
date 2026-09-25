/* CBE Mobile Banking — settings + hidden private setup (opened by 5 taps on version) */
(function () {
  const U = CBE.util;

  function setRow(a, ic, t, sub, chev) {
    return '<button class="set-row" data-a="' + a + '"><span class="ic">' + CBE.icon(ic, 20) + '</span>' +
      '<span class="tx">' + t + (sub ? '<span class="sub">' + sub + '</span>' : '') + '</span>' +
      (chev === false ? '' : '<span class="chev">' + CBE.icon('chev', 16) + '</span>') +
      '</button>';
  }

  CBE.router.on('settings', function () {
    const el = CBE.ui.el(
      '<div class="page" data-screen="settings">' +
      '<div class="appbar"><button class="back" data-a="back">' + CBE.icon('back', 22) + '</button><h1>Settings</h1></div>' +
      '<div class="scroll">' +
      '<div class="set-sec"><div class="sec-title">PREFERENCES</div>' +
      '<div class="set-group">' +
      setRow('setLanguage', 'globe', 'Language', U.esc(CBE.state.settings.language)) +
      setRow('setAccountPref', 'user', 'Account Preferences', '') +
      setRow('setNotif', 'bell', 'Notification Preferences', '') +
      setRow('setService', 'utility', 'Service Preferences', '') +
      '</div>' +
      '<div class="sec-title">SECURITY SETTINGS</div>' +
      '<div class="set-group">' +
      setRow('setBiometric', 'fingerprint', 'Biometric Login', CBE.state.settings.biometric ? 'Biometric login is on' : 'Biometric login is off') +
      setRow('setPin', 'key', 'Change PIN', '') +
      setRow('setPass', 'lock', 'Change Passphrase', '') +
      '</div>' +
      '<div class="sec-title">ACCOUNT ACTIONS</div>' +
      '<div class="set-group">' +
      '<button class="set-row" data-a="logout" style="color:var(--red)"><span class="ic" style="color:var(--red)">' + CBE.icon('logout', 20) + '</span><span class="tx">Log out</span></button>' +
      '</div>' +
      '<div class="set-ver" data-a="versionTap">Version: 6.1.0</div>' +
      '<div class="set-links"><button data-a="soonToast" data-t="Privacy Policy">Privacy Policy</button><span class="dot">\u00b7</span><button data-a="soonToast" data-t="Terms and Tariffs">Terms and Tarrifs</button></div>' +
      '</div>' +
      '</div>' +
      CBE.ui.tabbar('settings') +
      '</div>'
    );
    return el;
  });

  CBE.router.on('setLanguage', function () {
    return CBE.ui.page({title: 'Language', back: true},
      '<div class="form"><div class="card">' +
      '<h4 style="margin-bottom:10px">Select Language</h4>' +
      ['\u12a0\u121b\u122d\u129b', 'English'].map(l =>
        '<button class="lang-opt" data-a="langSet" data-l="' + l + '">' +
        (l === 'English' ? '\ud83c\uddfa\ud83c\uddf8' : '\ud83c\udde8\ud83c\uddef') + ' ' + l +
        (CBE.state.settings.language === l ? '<span class="ck">' + CBE.icon('check', 20) + '</span>' : '') + '</button>'
      ).join('') +
      '</div></div>');
  });

  CBE.router.on('setAccountPref', function () {
    return CBE.ui.page({title: 'Default Account Preferences', back: true},
      '<div class="form"><div class="sec-title" style="padding-left:0">DEFAULT ACCOUNTS</div>' +
      '<div class="card">' +
      '<div style="display:flex;align-items:center;gap:12px;padding:8px 0">' +
      '<span class="mono" style="width:40px;height:40px;border-radius:50%;background:var(--purple-50);color:var(--purple);display:grid;place-items:center">' + CBE.icon('send', 18) + '</span>' +
      '<div style="flex:1"><div style="font-weight:800;font-size:14.5px">Sending Money</div><div style="font-size:12px;color:var(--ink-3)">Saving Account (****' + CBE.state.account.number.slice(-4) + ')</div></div>' +
      '<span class="tag" style="font-size:11px;color:var(--purple);background:var(--purple-50);padding:4px 10px;border-radius:999px;font-weight:800">Change</span>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:12px;padding:8px 0">' +
      '<span class="mono" style="width:40px;height:40px;border-radius:50%;background:var(--green-bg);color:var(--green);display:grid;place-items:center">' + CBE.icon('receive', 18) + '</span>' +
      '<div style="flex:1"><div style="font-weight:800;font-size:14.5px">Receiving Money</div><div style="font-size:12px;color:var(--ink-3)">Saving Account (****' + CBE.state.account.number.slice(-4) + ')</div></div>' +
      '<span class="tag" style="font-size:11px;color:var(--purple);background:var(--purple-50);padding:4px 10px;border-radius:999px;font-weight:800">Change</span>' +
      '</div>' +
      '</div></div>');
  });

  function toggleRows() {
    return [
      ['SMS Notifications', 'Receive important updates via SMS', 'sms', 'sms'],
      ['Email Notifications', 'Get emails for account activity and promotions', 'mail', 'email'],
      ['Push Notifications', 'Receive instant alerts on your device', 'bell', 'push'],
      ['In-App Notifications', 'See notifications directly within the app', 'info', 'inapp']
    ];
  }

  CBE.router.on('setNotif', function () {
    return CBE.ui.page({title: 'Notification Preferences', back: true},
      '<div class="form"><div class="sec-title" style="padding-left:0">General Notifications</div>' +
      '<div class="card" style="padding:4px 14px">' +
      toggleRows().map(([t, s, ic, key]) =>
        '<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--line)">' +
        '<span class="ic" style="color:var(--purple)">' + CBE.icon(ic, 20) + '</span>' +
        '<div style="flex:1"><div style="font-weight:800;font-size:14px">' + t + '</div><div style="font-size:11.5px;color:var(--ink-3);margin-top:2px">' + s + '</div></div>' +
        '<button class="tgl ' + (CBE.state.settings[key] ? 'on' : '') + '" data-a="tglSet" data-k="' + key + '"></button>' +
        '</div>'
      ).join('') +
      '</div></div>');
  });

  CBE.router.on('setService', function () {
    return CBE.ui.page({title: 'Service Preferences', back: true},
      '<div class="form"><div class="sec-title" style="padding-left:0">Service Options</div>' +
      '<div class="card" style="display:flex;align-items:center;gap:12px">' +
      '<span style="color:var(--purple)">' + CBE.icon('sms', 20) + '</span>' +
      '<div style="flex:1"><div style="font-weight:800;font-size:14px">USSD Enabled</div><div style="font-size:11.5px;color:var(--ink-3);margin-top:2px">Allow USSD interactions for specific services</div></div>' +
      '<button class="tgl ' + (CBE.state.settings.ussd ? 'on' : '') + '" data-a="tglSet" data-k="ussd"></button>' +
      '</div></div>');
  });

  CBE.router.on('setBiometric', function () {
    return CBE.ui.page({title: 'Security Setting', back: true},
      '<div class="form"><div class="sec-title" style="padding-left:0">PREFERENCES</div>' +
      '<div class="card" style="display:flex;align-items:center;gap:12px">' +
      '<span style="color:var(--purple)">' + CBE.icon('fingerprint', 22) + '</span>' +
      '<div style="flex:1"><div style="font-weight:800;font-size:14px">Biometric Login</div>' +
      '<div style="font-size:11.5px;color:var(--ink-3);margin-top:2px">Biometric login is ' + (CBE.state.settings.biometric ? 'on' : 'off') + '</div></div>' +
      '<button class="tgl ' + (CBE.state.settings.biometric ? 'on' : '') + '" data-a="tglSet" data-k="biometric"></button>' +
      '</div></div>');
  });

  CBE.router.on('setPin', function () {
    return CBE.ui.page({title: 'Change PIN', back: true},
      '<div class="form">' +
      CBE.ui.field({label: 'Current PIN', id: 'cp0', type: 'password', max: 4, inputmode: 'numeric'}) +
      CBE.ui.field({label: 'New PIN', id: 'cp1', type: 'password', max: 4, inputmode: 'numeric'}) +
      CBE.ui.field({label: 'Confirm New PIN', id: 'cp2', type: 'password', max: 4, inputmode: 'numeric'}) +
      '<button class="btn" data-a="soonToast" data-t="PIN updated">Update PIN</button>' +
      '</div>');
  });

  CBE.router.on('setPass', function () {
    return CBE.ui.page({title: 'Change Passphrase', back: true},
      '<div class="form">' +
      CBE.ui.field({label: 'New Passphrase', id: 'np1', type: 'password'}) +
      CBE.ui.field({label: 'Confirm New Passphrase', id: 'np2', type: 'password'}) +
      '<button class="btn" data-a="soonToast" data-t="Passphrase updated">Update Passphrase</button>' +
      '</div>');
  });

  /* ============ HIDDEN PRIVATE SETUP (no visual hint anywhere) ============
     Opens only after 5 taps on the version text within the tap window. */
  CBE.router.on('privateSetup', function () {
    const s = CBE.state;
    return CBE.ui.el(
      '<div class="page is-guarded" data-screen="privateSetup">' +
      '<div class="appbar"><button class="back" data-a="back">' + CBE.icon('back', 22) + '</button><h1>Private Setup</h1></div>' +
      '<div class="scroll"><div class="form">' +
      '<div class="card" style="margin-bottom:14px"><h4>Account Holder</h4><div class="sub">Shown across the app and on receipts.</div></div>' +
      CBE.ui.field({label: 'Account Holder Full Name', id: 'psName', value: s.holder.name, icon: 'user'}) +
      CBE.ui.field({label: 'Main Account Number', id: 'psAcc', value: s.account.number, inputmode: 'numeric', max: 13, icon: 'bank'}) +
      CBE.ui.field({label: 'Balance (ETB)', id: 'psBal', value: String(s.balance), inputmode: 'decimal', icon: 'cash'}) +
      CBE.ui.field({label: 'Service Charge (ETB)', id: 'psService', value: String(s.fees.service), inputmode: 'decimal', icon: 'percent'}) +
      CBE.ui.field({label: 'VAT (% of service charge)', id: 'psVat', value: String(s.fees.vat), inputmode: 'decimal', icon: 'percent'}) +
      CBE.ui.field({label: 'Disaster Recovery Fund (% of service charge)', id: 'psDrf', value: String(s.fees.drf), inputmode: 'decimal', icon: 'percent'}) +
      '<div class="card" style="margin:14px 0"><h4>Receipt Receiver Name</h4>' +
      '<div class="sub">The receiver account-holder name shown on every transfer after a full 13-digit account number is entered.</div></div>' +
      CBE.ui.field({label: 'Receiver Account Holder Name', id: 'psReceiver', value: s.preset.receiverName, icon: 'user'}) +
      '<button class="btn" data-a="saveSetup" style="margin-top:6px">Save</button>' +
      '<button class="btn danger" data-a="resetNow" style="margin-top:12px">Reset App Data</button>' +
      '</div></div></div>'
    );
  });

  CBE.router.on('editReceiptName', function () {
    const s = CBE.state;
    return CBE.ui.el(
      '<div class="page is-guarded" data-screen="editReceiptName">' +
      '<div class="appbar"><button class="back" data-a="back">' + CBE.icon('back', 22) + '</button><h1>Receipt Name</h1></div>' +
      '<div class="scroll"><div class="form">' +
      CBE.ui.field({label: 'Receiver Account Holder Name', id: 'psReceiver', value: s.preset.receiverName, icon: 'user'}) +
      '<button class="btn" data-a="saveReceipt">Save</button>' +
      '</div></div></div>'
    );
  });
})();
