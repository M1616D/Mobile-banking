/* ==========================================================================
   auth.js — splash, sign-in (biometrics first, PIN second) and the shared
   authentication sequence used by sign-in *and* by every payment.
   ========================================================================== */
(function (global) {
  'use strict';

  var CBE = global.CBE || (global.CBE = {});
  var h = CBE.h, icon = CBE.icon, qs = CBE.qs, on = CBE.on, raw = CBE.raw;
  var st = CBE.state;

  /* ------------------------------------------------------------- branding */
  function cbeMark(size) {
    var s = size || 128;
    return '<img class="logo-block__img" src="img/cbe-logo.png" alt="Commercial Bank of Ethiopia" style="width:' + s + 'px">';
  }

  function noorMark(width) {
    var w = width || 216;
    return '<div style="display:flex;align-items:center;justify-content:center;gap:12px">' +
      '<span style="position:relative;display:grid;place-items:center;width:' + Math.round(w * 0.21) + 'px;height:' + Math.round(w * 0.21) +
      'px;background:linear-gradient(140deg,#8e2f52,#5d1793);border-radius:8px;transform:rotate(0deg)">' +
      '<span style="color:#fff;font:700 ' + Math.round(w * 0.09) + 'px/1 Georgia,serif">\u0646\u0648\u0631</span></span>' +
      '<span style="text-align:left">' +
      '<span style="display:block;font:700 ' + Math.round(w * 0.075) + 'px/1.2 var(--font-ethiopic);color:#8e2f52">\u1209\u120d \u1291\u122d</span>' +
      '<span style="display:block;margin-top:2px;font:800 ' + Math.round(w * 0.1) + 'px/1.25 var(--font-sans);letter-spacing:.02em;color:#3b2a2f">CBE NOOR</span>' +
      '</span></div>';
  }

  function logoBlock() {
    return h`
      <div class="logo-block" data-a="toggleNoor" role="button" aria-label="Switch account brand">
        ${raw(st.noor ? noorMark(230) : cbeMark(132))}
        <div class="logo-block__am">${st.letterhead.amharic}</div>
        <div class="logo-block__en">COMMERCIAL BANK OF ETHIOPIA</div>
        <div class="logo-block__rule"></div>
      </div>`;
  }

  function topBar() {
    return h`
      <div class="auth__bar">
        <button class="icon-btn" data-a="notifications" aria-label="Notifications">${raw(icon('bell', 23))}</button>
        <button class="auth__lang" data-a="langSheet">${st.lang === 'am' ? '\u12a0\u121b\u122d\u129b' : 'English'} ${raw(icon('chevronDown', 14))}</button>
        <button class="auth__grid" data-a="otherServices" data-prelogin="1" aria-label="Other services">${raw(icon('grid4', 18))}</button>
      </div>`;
  }

  /* ================================================================ splash */
  CBE.define('splash', function () {
    return {
      appbar: false,
      nav: '',
      screenClass: 'splash',
      bodyClass: '',
      body: '<div class="splash__plate">' + (st.noor ? noorMark(150) : '<img src="img/cbe-logo.png" alt="CBE">') + '</div>',
      onMount: function () {
        setTimeout(function () {
          if (CBE.currentScreen() && CBE.currentScreen().name === 'splash') CBE.reset('welcome');
        }, st.session.loggedIn ? 1100 : 1500);
      }
    };
  });

  /* =============================================================== welcome */
  CBE.define('welcome', function () {
    return {
      appbar: false,
      nav: '',
      screenClass: 'auth',
      body: h`
        ${raw(topBar())}
        <div class="auth__body">
          ${raw(logoBlock())}
          <div class="welcome-back">Welcome back</div>
          <div class="auth__spacer"></div>
          <button class="bio-btn" data-a="biometricLogin" aria-label="Sign in with biometrics">
            <img src="img/fingerprint-white.png" alt="">
          </button>
          <div class="bio-label">USE BIOMETRICS</div>
          <button class="linkish" data-a="usePin">Use PIN</button>
          <div class="credit">\u00a9 Commercial Bank of Ethiopia</div>
        </div>`
    };
  });

  /* ---------------------------------------------------------------- PIN page */
  CBE.define('loginPin', function () {
    return {
      appbar: false,
      nav: '',
      screenClass: 'auth',
      body: h`
        ${raw(topBar())}
        <div class="auth__body">
          ${raw(logoBlock())}
          <div class="welcome-back">Welcome back</div>
          <label class="pin-field" id="pinField">
            ${raw(icon('lock', 20))}
            <input id="loginPin" type="password" inputmode="numeric" autocomplete="off" maxlength="6" placeholder="PIN" data-in="loginPin" aria-label="PIN">
          </label>
          <div class="pin-field__err is-hidden" id="pinErr">This field is required</div>
          <button class="bio-btn bio-btn--sm" data-a="biometricLogin" aria-label="Sign in with biometrics">
            <img src="img/fingerprint-white.png" alt="">
          </button>
          <div class="bio-label">USE BIOMETRICS</div>
          <div class="auth__spacer"></div>
          <button class="login-btn" data-a="submitPin">Login ${raw(icon('chevronRight', 20))}</button>
          <div class="credit">\u00a9 Commercial Bank of Ethiopia</div>
        </div>`,
      onMount: function (node) {
        var field = qs('#loginPin', node);
        if (field) setTimeout(function () { field.focus(); }, 120);
      }
    };
  });

  /* ===================================================== authentication flows */
  function authCardHtml(state, extra) {
    if (state === 'ok') {
      return h`<div class="auth-card">
          <div class="ok-badge">${raw('<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.6 9.6 17.2 19 7.6"/></svg>')}</div>
          <div class="auth-card__label auth-card__label--ok">Authenticated!</div>
        </div>`;
    }
    if (state === 'biometric-ok') {
      return h`<div class="auth-card">
          <div class="ok-badge">${raw('<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.6 9.6 17.2 19 7.6"/></svg>')}</div>
          <div class="auth-card__label auth-card__label--ok">Biometrics Authenticated!</div>
          ${extra ? raw('<div class="ok-sub">' + extra + '</div>') : ''}
        </div>`;
    }
    return h`<div class="auth-card">
        <div class="auth-card__ring">
          <span class="bio-ring__arc"></span>
          <img src="img/fingerprint.png" alt="">
        </div>
        <div class="auth-card__label">Authenticating...</div>
      </div>`;
  }

  /* the native-looking OS fingerprint dialog */
  function biosimHtml(title, message, cancelLabel) {
    return h`<div class="biosim">
        <div class="biosim__head">
          <h3>${title}</h3>
        </div>
        <div class="biosim__tabs">
          <button class="biosim__tab is-active" data-a="biosimTab">Fingerprint</button>
          <button class="biosim__tab" data-a="biosimTab">Face</button>
        </div>
        <div class="biosim__body">
          <div class="biosim__app">
            <img src="img/cbe-logo.png" width="26" height="26" alt="">
            <b>CBE Mobile Banking</b>
          </div>
          <div class="biosim__hint"><b>${message}</b></div>
          <div class="biosim__target">${raw('<img src="img/fingerprint.png" width="30" height="30" alt="">')}</div>
          <div class="biosim__hint">${cancelLabel || 'Authenticate to continue.'}</div>
          <button class="biosim__cancel" data-a="biosimCancel">Cancel</button>
        </div>
      </div>`;
  }

  var timers = [];
  var cancelled = false;
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function later(fn, ms) {
    timers.push(setTimeout(function () { if (!cancelled) fn(); }, ms));
  }

  /* run the OS dialog over the app's authenticating card and finish green */
  function runBiometric(opts, done) {
    opts = opts || {};
    clearTimers();
    cancelled = false;
    var mode = opts.mode || 'login';
    CBE.overlay.popAll();
    CBE.overlay.authCard({ html: authCardHtml('busy'), dismissible: true });

    later(function () {
      CBE.overlay.authCard({
        html: biosimHtml(
          mode === 'login' ? 'Authenticating...' : 'Verify Identity',
          mode === 'login' ? 'Unlock to use Mobile Banking' : 'Authentication Required',
          mode === 'login' ? 'Authenticate to continue.' : 'Confirm your identity to continue.'
        ),
        dismissible: true
      });
    }, mode === 'login' ? 760 : 620);

    later(function () {
      CBE.overlay.pop(); /* the OS dialog finishes itself */
      CBE.vibrate(14);
      CBE.overlay.replace('modal', '<div class="modal" style="width:auto;padding:0;background:none;box-shadow:none">' +
        (mode === 'login' ? authCardHtml('ok') : authCardHtml('biometric-ok', 'Proceed to enter your PIN')) + '</div>');
    }, mode === 'login' ? 1900 : 1900);

    later(function () {
      CBE.overlay.pop();
      if (done) done();
    }, mode === 'login' ? 2680 : 3000);
  }

  /* --------------------------------------------------------- PIN keypad sheet */
  function pinSheetHtml(label, prompt) {
    var keys = '';
    for (var n = 1; n <= 9; n++) keys += '<button data-a="pinKey" data-k="' + n + '">' + n + '</button>';
    return h`
      <button class="sheet__close" data-a="overlayClose" aria-label="Close" style="color:#e04a44;background:#fdeaea">${raw(icon('x', 16))}</button>
      <div class="confirm__title" style="color:#7b2bbd;font-size:15.5px;margin-bottom:6px">${label}</div>
      <div class="pin-dots" id="pinDots">${raw(new Array(6 + 1).join('<i></i>'))}</div>
      <button class="pad-cancel" data-a="overlayClose">Cancel</button>
      <div class="keypad keypad--keys">
        ${raw(keys)}
        <button class="is-danger" data-a="pinBack" aria-label="Delete">${raw('<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5.4h9.6a1.8 1.8 0 0 1 1.8 1.8v9.6a1.8 1.8 0 0 1-1.8 1.8H9L3.4 12Z"/><path d="M12.6 9.6l4.8 4.8M17.4 9.6l-4.8 4.8"/></svg>')}</button>
        <button data-a="pinKey" data-k="0">0</button>
        <button class="is-ok" data-a="pinSubmit" aria-label="Confirm">${raw(icon('check', 22))}</button>
      </div>`;
  }

  var pinValue = '';
  var pinCb = null;

  function openPin(opts, done) {
    opts = opts || {};
    pinValue = '';
    pinCb = done;
    CBE.overlay.sheet({
      html: pinSheetHtml(opts.label || 'Enter your PIN to confirm'),
      dragAnywhere: true,
      onMount: function () { paintDots(); }
    });
  }

  function paintDots() {
    var dots = qs('#pinDots');
    if (!dots) return;
    var kids = dots.children;
    for (var i = 0; i < kids.length; i++) kids[i].className = i < pinValue.length ? 'is-on' : '';
    var ok = qs('[data-a="pinSubmit"]');
    if (ok) ok.classList.toggle('is-ready', pinValue.length >= 4);
  }

  function pinKey(k) {
    if (pinValue.length >= 6) return;
    pinValue += String(k);
    paintDots();
    if (pinValue.length >= 6) setTimeout(function () { pinSubmit(); }, 120);
  }

  function pinBack() {
    pinValue = pinValue.slice(0, -1);
    paintDots();
  }

  function pinSubmit() {
    if (pinValue.length < 4) { CBE.toast('PIN must be at least 4 digits'); CBE.vibrate(24); return; }
    var cb = pinCb;
    pinCb = null;
    var value = pinValue;
    if (cb) cb(value);
  }

  /* public auth façade */
  var auth = {
    /* sign in: biometrics first, PIN on request */
    signIn: function (method) {
      if (method === 'pin') { CBE.go('loginPin'); return; }
      runBiometric({ mode: 'login' }, function () {
        st.session.loggedIn = true;
        st.session.lastSignIn = Date.now();
        CBE.store.save();
        CBE.reset('home');
      });
    },
    /* payments: the in-app Verify Identity sheet, then the OS dialog, then PIN */
    approve: function (opts, done) {
      opts = opts || {};
      cancelled = false;
      clearTimers();
      CBE.overlay.authCard({
        html: h`<div class="auth-card" style="width:min(330px,88%);height:auto;padding:26px 22px 30px">
            <div class="ok-line" style="font-size:19px">Verify Identity</div>
            <div class="ok-sub" style="margin-bottom:10px">${opts.subtitle || 'Scan your fingerprint to complete the transfer'}</div>
            <div style="display:grid;place-items:center;padding:6px 0 4px">
              <img src="img/fingerprint.png" width="86" height="86" alt="">
            </div>
            <div class="ok-line" style="font-size:15.5px;color:#2c3340;margin-top:10px">Scan your fingerprint</div>
            <div class="ok-sub">Place your finger on the sensor to confirm.</div>
          </div>`,
        dismissible: true
      });
      setTimeout(function () {
        if (cancelled) return;
        CBE.overlay.pop();
        runBiometric({ mode: 'payment' }, function () {
          openPin({ label: 'Enter your PIN to confirm' }, function (pin) {
            CBE.overlay.pop();
            if (done) done(pin);
          });
        });
      }, 1100);
    },
    /* service taps before sign-in: authenticate first, then continue */
    requireLogin: function (run) {
      runBiometric({ mode: 'login' }, function () {
        st.session.loggedIn = true;
        st.session.lastSignIn = Date.now();
        CBE.store.save();
        if (run) run();
      });
    },
    pinKey: pinKey,
    pinBack: pinBack,
    pinSubmit: pinSubmit,
    openPin: openPin,
    /* the user backed out of the OS dialog or the sheet */
    cancel: function () {
      cancelled = true;
      clearTimers();
      pinCb = null;
      CBE.overlay.popAll();
      CBE.vibrate(18);
      CBE.toast('Authentication cancelled');
    }
  };

  /* ------------------------------------------------------- language sheet */
  function languageSheetHtml() {
    return h`
      <div class="sheet__title" style="color:#7b2bbd">Select Language</div>
      <div class="choice-row" data-a="setLang" data-lang="am" style="${st.lang === 'am' ? 'background:#f4f2f8;border-radius:14px' : ''}">
        <span class="choice-row__radio${st.lang === 'am' ? ' is-on' : ''}"><i></i></span>
        <span style="font-size:19px">\u1308\u130d</span>
        <b style="font-family:var(--font-ethiopic)">\u12a0\u121b\u122d\u129b</b>
      </div>
      <div class="choice-row" data-a="setLang" data-lang="en" style="${st.lang === 'en' ? 'background:#f4f2f8;border-radius:14px' : ''}">
        <span class="choice-row__radio${st.lang === 'en' ? ' is-on' : ''}"><i></i></span>
        <span style="font-size:19px">\ud83c\uddfa\ud83c\uddf8</span>
        <b>English</b>
      </div>`;
  }

  CBE.auth = auth;
  CBE.authSheets = {
    language: function () { CBE.overlay.sheet({ html: languageSheetHtml() }); }
  };
})(typeof window !== 'undefined' ? window : this);
