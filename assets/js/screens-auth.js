/* ==========================================================================
   screens-auth.js — splash, biometric sign-in, PIN sign-in, and the
   "Other Services" page that is reachable before logging in.
   ========================================================================== */
(function (global) {
  'use strict';
  var CBE = global.CBE;
  var U = CBE.ui;
  var t = function (k) { return CBE.t(k); };

  /* ------------------------------------------------------------- splash */
  CBE.define('splash', {
    render: function () {
      return '<section class="screen">' +
        '<div class="splash">' +
          '<div class="splash-plate">' + U.cbeLogo(118) + '</div>' +
          '<div class="splash-ring">' +
            '<div class="splash-row"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>' +
          '</div>' +
        '</div>' +
      '</section>';
    },
    after: function () {
      clearTimeout(CBE._splashTimer);
      CBE._splashTimer = setTimeout(function () {
        if (CBE.currentScreen().name === 'splash') CBE.nav('login', {}, { replace: true });
      }, 1700);
    }
  });

  /* -------------------------------------------------------------- login */
  function authHead() {
    return '<div class="auth-head">' +
      '<button class="icon-btn" style="color:#4d5766" data-action="notifications" aria-label="Notifications">' +
        CBE.icon('bell', { size: 21 }) + '</button>' +
      '<span class="spacer"></span>' +
      '<button class="auth-lang" data-action="language">' + U.esc(CBE.t('language')) + CBE.icon('chevronDown', { size: 14 }) + '</button>' +
      '<button class="icon-btn" style="color:#4d5766" data-action="otherServices" aria-label="Other services">' +
        CBE.icon('grid', { size: 21 }) + '</button>' +
    '</div>';
  }

  function brandBlock() {
    return '<div class="brand-block">' +
      U.cbeLogo(80) +
      '<div class="brand-am">የኢትዮጵያ ንግድ ባንክ</div>' +
      '<div class="brand-en">COMMERCIAL BANK OF ETHIOPIA</div>' +
    '</div>';
  }

  CBE.define('login', {
    render: function () {
      var noor = !!CBE.state.noor;
      return '<section class="screen">' +
        '<div class="auth">' +
          authHead() +
          '<div class="auth-body">' +
            (noor
              ? '<div class="brand-block">' + U.cbeLogo(80) + '<div class="brand-accent">CBE NOOR</div>' +
                '<div class="brand-am">የኢትዮጵያ ንግድ ባንክ</div>' +
                '<div class="brand-en">COMMERCIAL BANK OF ETHIOPIA</div></div>'
              : brandBlock()) +
            '<p class="welcome">' + U.esc(t('welcomeBack')) + '</p>' +
            '<div class="auth-center">' +
              '<button class="bio-btn" style="width:104px;height:104px" data-action="biometric" aria-label="Use biometrics">' +
                U.fingerprint(48) + '</button>' +
              '<span class="bio-label">' + U.esc(t('useBiometrics')).toUpperCase() + '</span>' +
              '<button class="linkish" data-action="pinLogin">' + U.esc(t('usePin')) + '</button>' +
            '</div>' +
          '</div>' +
          '<div class="auth-foot">© Commercial Bank of Ethiopia</div>' +
        '</div>' +
      '</section>';
    }
  });

  /* -------------------------------------------------------------- PIN login */
  CBE.define('pinLogin', {
    pad: false,
    pin: '',
    render: function () {
      var st = this;
      var digits = st.pin.length;
      return '<section class="screen">' +
        '<div class="auth">' +
          authHead() +
          '<div class="auth-body">' +
            brandBlock() +
            '<p class="welcome">' + U.esc(t('welcomeBack')) + '</p>' +
            '<div class="auth-fields">' +
              '<div class="field' + (st.error ? ' invalid' : '') + '" id="login-pin-field">' +
                '<span class="fico" style="color:' + (st.error ? '#d93b3b' : '#c08a2e') + '">' + CBE.icon('lock', { size: 20 }) + '</span>' +
                '<input id="login-pin" type="tel" inputmode="numeric" readonly placeholder="PIN"' +
                  ' value="' + U.esc(new Array(digits + 1).join('•')) + '" aria-label="PIN">' +
              '</div>' +
              (st.error ? '<div class="field-error">' + CBE.icon('warning', { size: 15 }) + U.esc(st.error) + '</div>' : '') +
            '</div>' +
            '<button class="bio-btn" style="width:78px;height:78px;margin-top:26px" data-action="biometric" aria-label="Use biometrics">' +
              U.fingerprint(36) + '</button>' +
            '<span class="bio-label">' + U.esc(t('useBiometrics')).toUpperCase() + '</span>' +
            '<button class="btn btn-gold" style="margin-top:26px" data-action="loginSubmit">' +
              U.esc(t('login')) + CBE.icon('arrowRight', { size: 19 }) + '</button>' +
            (st.pad
              ? '<div class="keypad flat-key" id="login-pad" style="width:100%;margin-top:20px">' +
                  [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return '<button data-k="' + n + '">' + n + '</button>'; }).join('') +
                  '<button class="flat danger" data-k="del">' + CBE.icon('x', { size: 19 }) + '</button>' +
                  '<button data-k="0">0</button>' +
                  '<button class="flat ok' + (digits >= 6 ? ' on' : '') + '" data-k="ok">' + CBE.icon('check', { size: 20 }) + '</button>' +
                '</div>'
              : '') +
          '</div>' +
          '<div class="auth-foot">© Commercial Bank of Ethiopia</div>' +
        '</div>' +
      '</section>';
    },
    key: function (k) {
      var st = this;
      st.error = '';
      if (k === 'del') st.pin = st.pin.slice(0, -1);
      else if (k === 'ok') return st.submit();
      else if (st.pin.length < 6) st.pin += k;
      st.paint();
    },
    /* the pad updates in place — no re-render per key press */
    paint: function () {
      var st = this;
      var input = document.getElementById('login-pin');
      if (input) input.value = new Array(st.pin.length + 1).join('•');
      var ok = document.querySelector('#login-pad [data-k="ok"]');
      if (ok) ok.classList.toggle('on', st.pin.length >= 6);
      var err = document.querySelector('.field-error');
      if (err) err.style.display = 'none';
      var field = document.getElementById('login-pin-field');
      if (field) field.classList.remove('invalid');
    },
    focus: function () {
      this.pad = true;
      CBE.render();
    },
    submit: function () {
      var st = this;
      if (st.pin.length < 6) { st.error = t('fieldRequired'); CBE.render(); return; }
      if (st.pin !== CBE.state.pin) {
        st.pin = '';
        st.error = 'Incorrect PIN';
        CBE.render();
        return;
      }
      st.error = '';
      st.pin = '';
      st.pad = false;
      CBE.state.authed = true;
      CBE.save();
      CBE.reset('home');
    },
    after: function () {
      var st = this;
      var field = document.getElementById('login-pin-field');
      var input = document.getElementById('login-pin');
      if (field) {
        field.addEventListener('click', function () { if (!st.pad) st.focus(); });
      }
      if (input) {
        input.addEventListener('click', function () { if (!st.pad) st.focus(); });
      }
    }
  });

  /* ------------------------------------------------------- other services
     Reachable from the sign-in page before logging in: it never shows the
     logged-in tab bar and it never unlocks the app — a service asks for the
     fingerprint or the PIN first. */
  CBE.define('otherServices', {
    render: function () {
      var authed = !!CBE.state.authed;
      var items = CBE.data.otherServices;
      return '<section class="screen">' +
        '<div class="screen-body' + (authed ? ' has-nav' : ' no-nav') + '">' +
          U.appbar(t('otherServices'), { right: '' }) +
          '<div style="padding:16px 0 0">' +
            '<div class="pill-list">' + items.map(function (it) {
              return U.osItem({
                title: it.name,
                icon: it.icon,
                cbe: it.icon === 'cbe',
                goto: it.route,
                value: it.id,
                action: 'osOpen'
              });
            }).join('') + '</div>' +
          '</div>' +
        '</div>' +
        (authed ? U.tabbar('settings') : '') +
      '</section>';
    }
  });
})(typeof window !== 'undefined' ? window : this);
