/* ==========================================================================
   screens-auth.js — splash, sign-in (PIN field + keypad + biometrics),
   the round "Authenticating…" loader, sign in with PIN and the language sheet
   ========================================================================== */
(function (global) {
  'use strict';
  var CBE = global.CBE;
  var U = CBE.ui;

  /* kept outside the render function so the field survives a repaint */
  var pin = '';
  var pinFocus = false;
  var pinError = false;

  function resetLogin() { pin = ''; pinFocus = false; pinError = false; }

  /* --------------------------------------------------------------- splash
     The logo tile, then a loading bar — the reference photos show the app
     mark on the dark splash and the loader continues into the next screen. */
  CBE.define('splash', {
    render: function () {
      return '<section class="screen no-anim">' +
        '<div class="splash">' +
          '<div class="tile mark"><img src="assets/img/cbe-logo.png" alt="Commercial Bank of Ethiopia"></div>' +
        '</div></section>';
    },
    after: function () {
      setTimeout(function () {
        if (CBE.currentScreen().name === 'splash') CBE.nav('login', {}, { replace: true });
      }, 1900);
    }
  });

  /* ------------------------------------------- brand blocks for the login */
  function cbeLogoBlock() {
    return '<div class="logo-block">' +
      '<img src="assets/img/cbe-logo.png" alt="Commercial Bank of Ethiopia">' +
      '<div class="am">የኢትዮጵያ ንግድ ባንክ</div>' +
      '<div class="en">COMMERCIAL BANK OF ETHIOPIA</div>' +
      '<hr>' +
      '</div>';
  }
  function noorLogoBlock() {
    return '<div class="noor-mark">' +
        '<span class="gem"><span>ስ</span></span>' +
        '<span class="txt"><span class="am">ስሉ ኑር</span><span class="en">CBE NOOR</span></span>' +
      '</div>' +
      '<div class="logo-block" style="padding-top:26px">' +
        '<div class="am">የኢትዮጵያ ንግድ ባንክ</div>' +
        '<div class="en">COMMERCIAL BANK OF ETHIOPIA</div>' +
      '</div>';
  }

  function authTop() {
    var am = CBE.state.lang === 'am';
    return '<div class="auth-top">' +
      '<button class="auth-circle" data-action="notifications" aria-label="Notifications">' + CBE.icon('bell', { size: 19 }) + '</button>' +
      '<button class="auth-pill" data-action="language"><span class="' + (am ? 'am' : '') + '">' +
        U.esc(CBE.t('language')) + '</span>' + CBE.icon('chevronDown', { size: 14 }) + '</button>' +
      '<button class="auth-circle" data-action="otherServices" aria-label="Other services">' + CBE.icon('grid', { size: 17 }) + '</button>' +
      '</div>';
  }

  /* ---------------------------------------------------------------- login */
  CBE.define('login', {
    render: function () {
      var noor = !!CBE.state.noor;
      var head = '<div class="screen-body no-nav" style="display:flex;flex-direction:column;padding:0 20px">' +
        authTop() +
        (noor ? noorLogoBlock() : cbeLogoBlock()) +
        '<p class="welcome-back">' + U.esc(CBE.t('welcomeBack')) + '</p>';

      if (noor) {
        return '<section class="screen no-anim">' + head +
          '<div style="flex:1"></div>' +
          '<div style="text-align:center;padding-bottom:10px">' +
            U.bioButton(96, 'biometric', CBE.t('useBiometrics')) +
            '<div class="bio-label">' + U.esc(CBE.t('useBiometrics')) + '</div>' +
            '<button class="linkish" data-action="pinLogin">' + U.esc(CBE.t('usePin')) + '</button>' +
            '<div class="credit" style="margin-top:38px">© Commercial Bank of Ethiopia</div>' +
          '</div>' +
          '</section>';
      }

      /* classic CBE sign-in: PIN field, then either the biometric button or
         the keypad, exactly like the two reference photos */
      var dots = pin ? new Array(pin.length + 1).join('•') : '';
      var body = '<div style="margin-top:22px">' +
          '<div class="field' + (pinError ? ' error' : '') + '" id="login-field">' +
            '<span class="fico">' + CBE.icon('lock', { size: 21 }) + '</span>' +
            '<input id="login-pin" type="text" inputmode="numeric" readonly ' +
              'placeholder="PIN" value="' + U.esc(dots) + '" aria-label="PIN">' +
          '</div>' +
          (pinError ? '<div class="field-error">' + U.esc(CBE.t('fieldRequired')) + '</div>' : '') +
        '</div>';

      if (pinFocus) {
        body += '<div class="keypad login-pad" id="login-pad">' +
            [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return '<button data-k="' + n + '">' + n + '</button>'; }).join('') +
            '<button class="flat danger" data-k="del">' + CBE.icon('x', { size: 20 }) + '</button>' +
            '<button data-k="0">0</button>' +
            '<button class="flat ok" data-k="ok">' + CBE.icon('check', { size: 22, weight: 2.4 }) + '</button>' +
          '</div>';
      } else {
        body += '<div style="flex:1"></div>' +
          '<div style="text-align:center;padding-bottom:6px">' +
            U.bioButton(90, 'biometric', CBE.t('useBiometrics')) +
            '<div class="bio-label">' + U.esc(CBE.t('useBiometrics')) + '</div>' +
          '</div>' +
          '<button class="btn btn-login" data-action="loginSubmit" style="margin-top:34px">' +
            U.esc(CBE.t('login')) + CBE.icon('arrowRight', { size: 20 }) + '</button>';
      }

      var foot = pinFocus ? '<div style="flex:1"></div>' :
        '<div class="credit" style="margin-top:20px;padding-bottom:2px">© Commercial Bank of Ethiopia</div>';

      return '<section class="screen no-anim">' + head + body + foot + '</div></section>';
    },
    after: function () {
      var field = document.getElementById('login-field');
      if (field) {
        field.addEventListener('click', function () { CBE.loginActions.focusPin(); });
      }
    }
  });

  /* ------------------------------------------------------------ PIN sign in */
  CBE.define('pinLogin', {
    render: function () {
      return '<section class="screen no-anim">' +
        '<div class="screen-body no-nav" style="display:flex;flex-direction:column;padding:0 20px">' +
          '<div style="padding-top:6px">' +
            '<button class="icon-btn" data-action="back" style="color:#4b515a;margin-left:-10px">' +
              CBE.icon('chevronLeft', { size: 24 }) + '</button>' +
          '</div>' +
          '<div class="logo-block sm">' +
            '<img src="assets/img/cbe-logo.png" alt="">' +
            '<div class="en" style="margin-top:8px">COMMERCIAL BANK OF ETHIOPIA</div>' +
          '</div>' +
          '<p class="welcome-back" style="margin-top:18px">' + U.esc(CBE.t('enterPinTitle')) + '</p>' +
          '<div class="pin-dots" id="pin-dots"><i></i><i></i><i></i><i></i><i></i><i></i></div>' +
          '<div class="keypad" id="pin-pad">' +
            [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return '<button data-k="' + n + '">' + n + '</button>'; }).join('') +
            '<button class="flat danger" data-k="del">' + CBE.icon('x', { size: 20 }) + '</button>' +
            '<button data-k="0">0</button>' +
            '<button class="flat ok" data-k="ok">' + CBE.icon('check', { size: 22, weight: 2.4 }) + '</button>' +
          '</div>' +
          '<div class="center" style="margin-top:14px">' +
            '<button class="linkish" data-action="biometric" style="margin-top:4px">' + U.esc(CBE.t('useBiometrics')) + '</button>' +
          '</div>' +
          '<div style="flex:1"></div>' +
          '<div class="credit" style="padding-bottom:4px">© Commercial Bank of Ethiopia</div>' +
        '</div>' +
      '</section>';
    },
    after: function () {
      var screen = document.querySelector('.screen');
      var value = '';
      var dots = screen.querySelectorAll('#pin-dots i');
      function paint() { for (var i = 0; i < dots.length; i++) dots[i].classList.toggle('on', i < value.length); }
      function submit() {
        if (value.length < 6) { U.toast('Enter all 6 digits'); return; }
        if (value === CBE.state.pin) CBE.loginActions.unlock();
        else { value = ''; paint(); U.toast('Incorrect PIN'); }
      }
      screen.addEventListener('click', function (e) {
        var k = e.target.closest('[data-k]');
        if (!k) return;
        var key = k.getAttribute('data-k');
        if (key === 'del') value = value.slice(0, -1);
        else if (key === 'ok') return submit();
        else if (value.length < 6) value += key;
        paint();
        if (value.length === 6) setTimeout(submit, 180);
      });
      paint();
    }
  });

  /* ------------------------------------------------- the round auth loader
     A thin arc spinning around the purple fingerprint line-art over a white
     card — the exact screen the reference photos show while authenticating. */
  function ringSvg(cls) {
    return '<span class="' + cls + '">' +
      '<svg viewBox="0 0 120 120" fill="none" aria-hidden="true">' +
        '<defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#e9e2f4"/><stop offset="0.6" stop-color="#c3b4de"/>' +
          '<stop offset="1" stop-color="#8d76b6"/></linearGradient></defs>' +
        '<circle cx="60" cy="60" r="55" stroke="url(#ringGrad)" stroke-width="2.2" ' +
          'stroke-linecap="round" stroke-dasharray="268 78" transform="rotate(-118 60 60)"/>' +
      '</svg></span>';
  }

  CBE.authLoader = function (opts) {
    opts = opts || {};
    var el = U.open(
      '<div class="auth-loader">' +
        '<div class="auth-ring">' + ringSvg('spin') + CBE.fingerprintLine(62, 'fp') + '</div>' +
        '<span class="auth-text">' + U.esc(CBE.t('auth')) + '</span>' +
      '</div>',
      { modal: true, dismissible: false, className: 'modal auth-modal' }
    );
    el.style.background = 'transparent';
    el.style.width = 'auto';
    el.style.padding = '0';
    setTimeout(function () {
      if (!el.parentNode) return;
      el.innerHTML = '<div class="modal" style="position:static;transform:none;width:230px;background:#fdfdfd">' +
        '<div class="ok-circle" style="width:92px;height:92px">' + CBE.icon('check', { size: 50, weight: 3 }) + '</div>' +
        '<p class="ok-text" style="font-size:16px;font-weight:700">' + U.esc(CBE.t('authenticated')) + '</p>' +
      '</div>';
      setTimeout(function () {
        U.close(el);
        if (opts.onDone) setTimeout(opts.onDone, 140);
      }, 750);
    }, opts.delay || 1400);
    return el;
  };

  /* ------------------------------------------------------------ login api */
  CBE.loginActions = {
    focusPin: function () {
      if (pinFocus) return;
      pinFocus = true;
      pinError = false;
      CBE.render();
    },
    key: function (k) {
      if (k === 'del') pin = pin.slice(0, -1);
      else if (k === 'ok') return CBE.loginActions.submit();
      else if (pin.length < 6) pin += k;
      CBE.render();
      if (pin.length === 6) setTimeout(function () { CBE.loginActions.submit(); }, 180);
    },
    submit: function () {
      if (!pin) { pinError = true; CBE.render(); return; }
      if (pin !== CBE.state.pin) {
        pin = ''; pinError = false;
        CBE.render();
        U.toast('Incorrect PIN');
        return;
      }
      CBE.authLoader({ delay: 900, onDone: CBE.loginActions.unlock });
    },
    useBiometric: function () {
      CBE.authLoader({ onDone: CBE.loginActions.unlock });
    },
    unlock: function () {
      resetLogin();
      CBE.state.authed = true;
      CBE.save();
      CBE.nav('home', {}, { replace: true });
      U.toast('Welcome ' + CBE.state.user.short);
    }
  };

  /* --------------------------------------------------------- language sheet
     "Select Language" with the two radio rows from the reference photo. */
  CBE.openLanguage = function () {
    var items = [
      { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
      { code: 'en', name: 'English', flag: '🇺🇸' }
    ];
    var html = '<div class="grabber"></div>' +
      '<h2 style="color:#7b2cbf;font-size:19px;margin:2px 0 16px">' + U.esc(CBE.t('selectLanguage')) + '</h2>' +
      items.map(function (l) {
        return '<button class="lang-opt' + (CBE.state.lang === l.code ? ' active' : '') + '" data-set-lang="' + l.code + '">' +
          '<span class="dot">' + (CBE.state.lang === l.code ? CBE.icon('check', { size: 14, weight: 3 }) : '') + '</span>' +
          '<span class="flag">' + l.flag + '</span>' +
          '<span class="' + (l.code === 'am' ? 'am' : '') + '" style="font-family:inherit">' + U.esc(l.name) + '</span>' +
          '</button>';
      }).join('') +
      '<div style="height:6px"></div>';
    U.open(html, {});
  };
})(typeof window !== 'undefined' ? window : this);
