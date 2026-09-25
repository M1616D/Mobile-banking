/* CBE Mobile Banking — splash, login & biometric auth */
(function () {
  const U = CBE.util;

  CBE.router.on('splash', function () {
    const el = CBE.ui.el(
      '<div class="page" data-screen="splash">' +
      '<div class="splash"><img src="img/cbe-mark.png" alt="CBE"></div>' +
      '</div>'
    );
    setTimeout(() => { if (CBE.router.currentName() === 'splash') CBE.router.replace('login'); }, 1400);
    return el;
  });

  function loginShell(inner, modalHtml) {
    return CBE.ui.el(
      '<div class="page" data-screen="login">' +
      '<div class="login">' +
      '<div class="topbar">' +
      '<button class="bell" data-a="noop" style="width:40px;height:40px;display:grid;place-items:center;border-radius:50%;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.18)">' + CBE.icon('bell', 20) + '</button>' +
      '<button class="lang" data-a="langPick">English ' + CBE.icon('down', 14) + '</button>' +
      '<button class="sq" data-a="otherServices">' + CBE.icon('grid', 20) + '</button>' +
      '</div>' +
      '<div class="brand-area">' +
      '<img class="crest" src="img/cbe-mark.png" alt="CBE">' +
      '<div class="brand-amh">\u12d5\u1295\u1275\u12cd\u1260\u1295 \u1263\u1295\u12ad \u12a2\u1275\u12ee\u1335\u12eb</div>' +
      '<div class="brand-en">COMMERCIAL BANK OF ETHIOPIA</div>' +
      '<div class="brand-rule"></div>' +
      inner +
      '</div>' +
      '<div class="bottom">' +
      '<button class="bio-btn" data-a="bioLogin"><img src="img/fingerprint.png" alt=""></button>' +
      '<div class="bio-lb">USE BIOMETRICS</div>' +
      '<button class="pin-link" data-a="loginPin">Use PIN</button>' +
      '<div class="foot">\u00a9 Commercial Bank of Ethiopia</div>' +
      '</div>' +
      (modalHtml || '') +
      '</div>' +
      '</div>'
    );
  }

  CBE.router.on('login', function () {
    return loginShell(
      '<div class="welcome">Welcome back</div>' +
      '<div class="num">' + U.esc(CBE.state.holder.name) + '</div>'
    );
  });

  CBE.router.on('loginPin', function () {
    return loginShell(
      '<div class="welcome">Welcome back</div>' +
      '<div class="login-pin-form">' +
      CBE.ui.field({label: 'PIN', id: 'pinInput', type: 'password', max: 4, inputmode: 'numeric', ph: '\u2022\u2022\u2022\u2022'}) +
      '<div class="login-err" id="loginErr"></div>' +
      '<div style="display:flex;justify-content:center;margin-top:10px">' +
      '<button class="btn" style="width:190px" data-a="loginPinGo">Login</button>' +
      '</div>' +
      '</div>'
    );
  });

  function bioModal(state) {
    const body =
      state === 'ok' ? '<div class="fingerprint ok">' + CBE.icon('fingerprint', 54) + '</div>' :
      state === 'fail' ? '<div class="fingerprint fail" style="color:var(--red)">' + CBE.icon('close', 44) + '</div>' :
      '<div class="fingerprint">' + CBE.icon('fingerprint', 54) + '</div>';
    const t1 = state === 'ok' ? 'Authenticated!' : state === 'fail' ? 'Authentication failed' : 'Authenticating...';
    const t2 = state === 'ok' ? 'Welcome back.' : state === 'fail' ? 'Scan did not match. Try again.' : 'Fingerprint';
    const extra = state === 'fail'
      ? '<button class="btn" style="margin-top:14px" data-a="bioLogin">Try Again</button><div style="text-align:center;margin-top:12px"><button class="pin-link" style="color:var(--purple)" data-a="loginPin">Use PIN instead</button></div>'
      : '';
    return (
      '<div class="auth-modal ' + (state || '') + '" id="bioModal">' +
      body +
      '<div class="t1">' + t1 + '</div>' +
      '<div class="t2">' + t2 + '</div>' +
      extra +
      (state !== 'fail' ? '<div class="app-line"><img src="img/appicon.jpg" alt="">CBE Mobile Banking</div><div class="sec-by">Secured by Knox</div>' : '') +
      '</div>'
    );
  }

  CBE.router.on('bioAuth', function (params) {
    const stage = params.stage || 'scan';
    const modal =
      stage === 'scan' ? bioModal('scan') :
      stage === 'ok' ? bioModal('ok') :
      stage === 'fail' ? bioModal('fail') : '';
    return loginShell(
      '<div class="welcome">Welcome back</div>' +
      '<div class="num">' + U.esc(CBE.state.holder.name) + '</div>',
      modal
    );
  });

  CBE.router.on('otherServices', function () {
    const rows = [
      ['Exchange Rates', 'percent'], ['Internet Banking', 'globe'], ['USSD', 'sms'],
      ['Verify Receipt', 'doc'], ['Feedback', 'mail'], ['CBE Locator', 'pin'],
      ['Call Center', 'phone'], ['Privacy Policy', 'shield'], ['Terms and Tariffs', 'doc'],
      ['Survey', 'edit'], ['CBE Links', 'link']
    ];
    const html = rows.map(([t, ic]) =>
      '<button class="lang-opt" data-a="soonToast" data-t="' + U.esc(t) + '">' + CBE.icon(ic, 20) + t + '</button>'
    ).join('');
    CBE.ui.sheet(
      '<h3>Other Services</h3>' +
      '<div style="max-height:52vh;overflow-y:auto">' + html + '</div>'
    );
    return null;
  });

  CBE.router.on('langPick', function () {
    const langs = [['\u12a0\u121b\u122d\u129b', '\ud83c\udde8\ud83c\uddef'], ['English', '\ud83c\uddfa\ud83c\uddf8']];
    CBE.ui.sheet(
      '<h3>Select Language</h3>' +
      langs.map(([n, f]) =>
        '<button class="lang-opt" data-a="langSet" data-l="' + n + '"><span class="flag">' + f + '</span> ' + n +
        (CBE.state.settings.language === n ? '<span class="ck">' + CBE.icon('check', 20) + '</span>' : '') +
        '</button>'
      ).join('')
    );
    return null;
  });
})();
