/* =========================================================================
   auth.js — login (biometric + PIN), My Information
   ========================================================================= */
(function () {
  "use strict";

  /* CBE NOOR ships as a lock-up (mark + wordmark); the standard identity is
     the gold coin mark on its own. */
  function logoAsset() { return Store.get().noor ? "img/brands/noor-logo.png" : "img/cbe-logo.png"; }

  /* ------------------------------------------------------------- login -- */
  function loginView() {
    var s = Store.get();
    var el = UI.h(
      '<div class="login">' +
        '<div class="login__top">' +
          '<button class="iconbtn" data-act="bell" aria-label="Notifications" style="color:#6c6c78">' + Icon("bell", 21) + "</button>" +
          '<div class="pin-center"><button class="lang-pill" data-act="lang">English ' + Icon("chevronDown", 14) + "</button></div>" +
          '<button class="iconbtn" data-act="other" aria-label="Other services" style="color:#4a3562">' + Icon("grid", 22) + "</button>" +
        "</div>" +
        '<div class="login__body">' +
          '<div class="login__inner">' +
            '<img class="login__logo" src="' + logoAsset() + '" alt="Commercial Bank of Ethiopia">' +
            (s.noor ? "" : '<div class="login__amharic am">የኢትዮጵያ ንግድ ባንክ</div>') +
            '<div class="login__bank">COMMERCIAL BANK OF ETHIOPIA</div>' +
            '<div class="login__rule"></div>' +
            '<div class="login__welcome">Welcome back</div>' +
            '<div class="login__field" data-slot="field"></div>' +
          "</div>" +
          '<div class="login__orb-wrap" data-slot="orb"></div>' +
          '<div class="login__actions" data-slot="actions"></div>' +
          '<div class="login__copyright">© Commercial Bank of Ethiopia</div>' +
        "</div>" +
        '<div data-slot="keypad"></div>' +
      "</div>");

    var mode = "bio";        // bio | pin
    var pinValue = "";
    var keypadOpen = false;
    var pad = null;
    var failNext = false;

    function renderField() {
      var slot = el.querySelector('[data-slot="field"]');
      var orb = el.querySelector('[data-slot="orb"]');
      var actions = el.querySelector('[data-slot="actions"]');
      var kp = el.querySelector('[data-slot="keypad"]');

      if (mode === "bio") {
        slot.innerHTML = "";
        orb.innerHTML =
          '<button class="login__orb" data-act="bio" aria-label="Use biometrics">' +
            '<img src="img/fingerprint-light.png" alt=""></button>' +
          '<div class="login__orb-label">USE BIOMETRICS</div>' +
          '<button class="login__usebtn" data-act="topin"><u>Use PIN</u></button>';
        actions.innerHTML = "";
        kp.innerHTML = "";
        keypadOpen = false;
        return;
      }

      // PIN mode
      orb.innerHTML = keypadOpen ? "" :
        '<div class="login__orb-label" style="margin-top:28px">OR</div>' +
        '<button class="login__orb" data-act="bio" aria-label="Use biometrics" style="margin-top:16px">' +
          '<img src="img/fingerprint-light.png" alt=""></button>' +
        '<div class="login__orb-label">USE BIOMETRICS</div>';
      actions.innerHTML = keypadOpen ? "" :
        '<button class="btn btn--grad btn--block" data-act="login">Login ' + Icon("arrowRight", 20) + "</button>";

      var err = el._pinError;
      slot.innerHTML =
        '<div class="field" style="margin-top:0">' +
          '<div class="input' + (err ? " is-error" : "") + '" data-slot="pinwrap">' +
            '<span class="input__icon" style="color:#c98a2a">' + Icon("lock", 20) + "</span>" +
            '<input data-pininput type="text" inputmode="numeric" autocomplete="off" maxlength="6" ' +
              'placeholder="PIN" value="' + U.esc(pinValue) + '">' +
          "</div>" +
          (err ? '<div class="error-text">' + U.esc(err) + "</div>" : "") +
        "</div>";

      if (keypadOpen) {
        kp.innerHTML = '<div class="login__keypad"></div>';
        pad = UI.pinPad({
          length: 6,
          onChange: function (v) { pinValue = v; syncInput(); },
          onSubmit: function (v) { pinValue = v; submitPin(); },
          onShort: function () { el._pinError = "This field is required"; renderField(); }
        });
        kp.querySelector(".login__keypad").appendChild(pad.dots);
        kp.querySelector(".login__keypad").appendChild(pad.pad);
      } else {
        kp.innerHTML = "";
      }
    }

    function syncInput() {
      var input = el.querySelector("[data-pininput]");
      if (input && input.value !== pinValue) input.value = pinValue;
      var wrap = el.querySelector('[data-slot="pinwrap"]');
      if (wrap && el._pinError) {
        el._pinError = "";
        wrap.classList.remove("is-error");
        var et = el.querySelector(".error-text");
        if (et) et.remove();
      }
      if (pad) {
        // keep the dots in step with the typed value
        var dots = pad.dots.querySelectorAll(".dot");
        dots.forEach(function (d, i) { d.classList.toggle("is-on", i < pinValue.length); });
      }
    }

    function openKeypad() {
      keypadOpen = true;
      el._pinError = "";
      renderField();
      var input = el.querySelector("[data-pininput]");
      if (input) input.setAttribute("readonly", "readonly");
    }

    function submitPin() {
      var pin = pinValue.trim();
      if (!pin) {
        el._pinError = "This field is required";
        renderField();
        return;
      }
      if (pad && pad.value().length < 6) {
        el._pinError = "PIN must be 6 digits";
        renderField();
        return;
      }
      if (pin === Store.get().pin) {
        el._pinError = "";
        succeed();
      } else {
        el._pinError = "Invalid PIN. Please try again.";
        pinValue = "";
        renderField();
      }
    }

    /* -------------------------------------------------- authentication */
    function succeed() {
      var d = UI.dialog({
        body: '<div class="dialog__circle dialog__circle--green">' + Icon("check", 44) + "</div>" +
          '<div class="dialog__green">Authenticated!</div>'
      });
      U.haptic(30);
      setTimeout(function () {
        d.close();
        enterHome();
      }, 900);
    }

    function fail() {
      var d = UI.dialog({
        body: '<div class="verify__circle verify__circle--red" style="margin:0 auto 16px">' + Icon("x", 42) + "</div>" +
          '<div class="verify__fail">Verification Failed</div>' +
          '<p class="verify__say2">Biometric scan failed. Please try again.</p>' +
          '<button class="btn btn--block" data-act="retry" style="margin-top:18px">Try Again</button>'
      });
      d.node.querySelector('[data-act="retry"]').addEventListener("click", function () {
        d.close();
        runBiometric();
      });
    }

    function runBiometric() {
      var refused = failNext || !Store.get().biometric;
      failNext = false;
      var d = UI.dialog({
        body: '<div class="dialog__ring">' +
            '<svg class="spin" viewBox="0 0 72 72" fill="none">' +
              '<circle cx="36" cy="36" r="32" stroke="#e23b2e" stroke-width="3.4" stroke-linecap="round" ' +
                'stroke-dasharray="130 200" transform="rotate(-90 36 36)"/></svg>' +
            '<span class="dialog__fp">' + Icon.fingerprint(46, "dark") + "</span>" +
          "</div>" +
          '<div class="dialog__text">Authenticating…</div>'
      });
      U.haptic(14);
      setTimeout(function () {
        d.close();
        if (refused) fail(); else succeed();
      }, 1500);
    }

    function enterHome() {
      Store.set({ lastSignIn: new Date().toISOString() }, true);
      Router.root("home");
    }

    /* ---------------------------------------------------------- events */
    el.addEventListener("click", function (e) {
      var t = e.target.closest("[data-act]");
      if (!t) {
        // tapping the PIN field opens the keypad, like the reference
        if (e.target.closest("[data-pininput]") && mode === "pin" && !keypadOpen) openKeypad();
        return;
      }
      var act = t.dataset.act;
      if (act === "bio") { runBiometric(); return; }
      if (act === "topin") { mode = "pin"; pinValue = ""; keypadOpen = false; el._pinError = ""; renderField(); return; }
      if (act === "login") { mode = "pin"; renderField(); openKeypad(); return; }
      if (act === "bell") { UI.toast("No new notifications"); return; }
      if (act === "other") { Router.push("otherServices"); return; }
      if (act === "lang") {
        UI.selectSheet("Select Language", ["አማርኛ", "English"], function (v) {
          Store.set({ language: v === "English" ? "en" : "am" });
          UI.toast(v + " selected");
        });
        return;
      }
    });

    el.addEventListener("input", function (e) {
      if (e.target.matches("[data-pininput]")) {
        pinValue = U.digits(e.target.value).slice(0, 6);
        e.target.value = pinValue;
        var dots = el.querySelectorAll(".dot");
        dots.forEach(function (d, i) { d.classList.toggle("is-on", i < pinValue.length); });
        if (pinValue.length === 6) submitPin();
      }
    });

    renderField();
    return { el: el };
  }

  /* ------------------------------------------------- My Information ----- */
  function myInfoView() {
    var s = Store.get();
    var tab = "accounts";
    var el = UI.h(
      '<div class="screen">' +
        UI.appbar({ title: "My Information" }) +
        '<div class="body"><div class="sheet">' +
          '<div class="pad" style="padding-top:16px">' +
            '<div class="group">' +
              '<div class="mi-head">' +
                '<span class="avatar avatar--solid">' + Icon("users", 26) + "</span>" +
                '<span class="grow"><span class="mi-head__name">' + U.esc(s.holderName) + "</span>" +
                  '<div class="mi-head__sub">Last Sign In: ' + U.esc(U.signIn(s.lastSignIn ? new Date(s.lastSignIn) : new Date())) + "</div></span>" +
              "</div>" +
            "</div>" +
            '<div class="group mt12">' +
              UI.row({ label: "Contact Us", icon: "idCard", to: "contact" }) +
              '<div class="rowline" style="cursor:default">' +
                '<span class="rowline__icon">' + Icon("mosque", 22) + "</span>" +
                '<span class="rowline__text"><span class="rowline__title">CBE NOOR</span></span>' +
                UI.toggle(s.noor, 'data-act="noor"') +
              "</div>" +
            "</div>" +
            '<div class="tabs mt20" data-slot="tabs">' +
              '<button class="tabs__item is-on" data-tab="accounts">My Accounts</button>' +
              '<button class="tabs__item" data-tab="phone">Phone Number</button>' +
            "</div>" +
            '<div class="info-card mt16" data-slot="panel" style="border:1px solid var(--line);box-shadow:none"></div>' +
          "</div>" +
          '<div class="logout-wrap"><button class="logout-btn" data-act="logout">Log out</button></div>' +
        "</div></div>" +
      "</div>");

    function paint() {
      var panel = el.querySelector('[data-slot="panel"]');
      var isAcc = tab === "accounts";
      var payload = isAcc ? U.maskShort(s.accountNumber) : "+251902468625";
      panel.innerHTML =
        '<div class="mi-qr" data-qr></div>' +
        '<div class="mi-qr-caption">' + U.esc(payload) + "</div>" +
        '<div class="mi-qr-caption" style="padding-top:2px;color:var(--muted)">' +
          (isAcc ? "Scan this account number." : "Scan this phone number.") + "</div>";
      var canvas = document.createElement("canvas");
      canvas.style.width = "150px";
      canvas.style.height = "150px";
      panel.querySelector("[data-qr]").appendChild(canvas);
      QR.draw(canvas, (isAcc ? "CBE|ACCOUNT|" + s.accountNumber : "CBE|PHONE|+251902468625") + "|" + s.holderName, 150, "M", 2);
    }
    paint();

    el.addEventListener("click", function (e) {
      var noor = e.target.closest('[data-act="noor"]');
      if (noor) {
        Store.set({ noor: !Store.get().noor });
        Router.refresh();
        UI.toast(Store.get().noor ? "CBE NOOR activated" : "CBE NOOR deactivated");
        return;
      }
      var tb = e.target.closest("[data-tab]");
      if (tb) {
        tab = tb.dataset.tab;
        el.querySelectorAll("[data-tab]").forEach(function (b) { b.classList.toggle("is-on", b === tb); });
        paint();
        return;
      }
      if (e.target.closest('[data-act="logout"]')) {
        UI.sheet({
          title: "Log out?",
          closeBtn: true,
          body: '<p class="form-note" style="padding-bottom:16px">You will need to authenticate again to use CBE Mobile Banking.</p>' +
            '<div class="btn-row"><button class="btn btn--quiet" data-close="1">Cancel</button>' +
            '<button class="btn btn--danger" data-act="confirm-logout">Log out</button></div>'
        }).node.addEventListener("click", function (ev) {
          if (ev.target.closest('[data-act="confirm-logout"]')) {
            Router.root("login");
          }
        });
      }
    });

    return { el: el };
  }

  Router.define("login", loginView);
  Router.define("myinfo", myInfoView);
})();
