/* =========================================================================
   settings.js — settings + sub-pages
   The version string at the bottom is the only entry point to the hidden
   configuration panel (five taps). Nothing on screen hints at it.
   ========================================================================= */
(function () {
  "use strict";

  function view() {
    var s = Store.get();
    var el = UI.h('<div class="screen">' +
      UI.appbar({ title: "Settings" }) +
      '<div class="body"><div class="sheet"><div class="pad">' +
        '<div class="section-label">Preferences</div>' +
        '<div class="group">' +
          '<div class="rowline" data-go="language">' +
            '<span class="rowline__icon">' + Icon("globe", 22) + "</span>" +
            '<span class="rowline__text"><span class="rowline__title">Language</span>' +
              '<div class="rowline__sub">' + (s.language === "am" ? "አማርኛ" : "English") + "</div></span>" +
            '<span class="rowline__chev">' + Icon("chevronRight", 20) + "</span></div>" +
          '<div class="rowline" data-go="accountPrefs">' +
            '<span class="rowline__icon">' + Icon("userPlus", 22) + "</span>" +
            '<span class="rowline__text"><span class="rowline__title">Account Preferences</span></span>' +
            '<span class="rowline__chev">' + Icon("chevronRight", 20) + "</span></div>" +
          '<div class="rowline" data-go="notificationPrefs">' +
            '<span class="rowline__icon">' + Icon("bell", 22) + "</span>" +
            '<span class="rowline__text"><span class="rowline__title">Notification Preferences</span></span>' +
            '<span class="rowline__chev">' + Icon("chevronRight", 20) + "</span></div>" +
          '<div class="rowline" data-go="servicePrefs">' +
            '<span class="rowline__icon">' + Icon("sliders", 22) + "</span>" +
            '<span class="rowline__text"><span class="rowline__title">Service Preferences</span></span>' +
            '<span class="rowline__chev">' + Icon("chevronRight", 20) + "</span></div>" +
        "</div>" +
        '<div class="section-label">Security Settings</div>' +
        '<div class="group">' +
          '<div class="rowline" data-go="biometric">' +
            '<span class="rowline__icon">' + Icon.fingerprint(24, "dark") + "</span>" +
            '<span class="rowline__text"><span class="rowline__title">Biometric Login</span></span>' +
            '<span class="rowline__chev">' + Icon("chevronRight", 20) + "</span></div>" +
          '<div class="rowline" data-go="changePin">' +
            '<span class="rowline__icon">' + Icon("key", 22) + "</span>" +
            '<span class="rowline__text"><span class="rowline__title">Change PIN</span></span>' +
            '<span class="rowline__chev">' + Icon("chevronRight", 20) + "</span></div>" +
          '<div class="rowline" data-go="changePass">' +
            '<span class="rowline__icon">' + Icon("lock", 22) + "</span>" +
            '<span class="rowline__text"><span class="rowline__title">Change Passphrase</span></span>' +
            '<span class="rowline__chev">' + Icon("chevronRight", 20) + "</span></div>" +
        "</div>" +
        '<div class="section-label">Account Actions</div>' +
        '<div class="group">' +
          '<div class="rowline rowline--danger" data-act="logout">' +
            '<span class="rowline__icon" style="background:var(--red-bg);color:var(--red-strong)">' +
              Icon("logOut", 22) + "</span>" +
            '<span class="rowline__text"><span class="rowline__title">Log out</span></span>' +
            '<span class="rowline__chev">' + Icon("chevronRight", 20) + "</span></div>" +
        "</div>" +
        '<div class="settings-foot">' +
          '<button class="version-btn" data-version="1">Version: 6.1.0</button>' +
          '<div class="settings-links">' +
            '<button data-go="privacy">Privacy Policy</button><span>·</span>' +
            '<button data-go="terms">Terms and Tariffs</button>' +
          "</div>" +
        "</div>" +
      "</div></div></div>" +
      UI.bottomNav("settings") +
    "</div>");

    el.addEventListener("click", function (e) {
      var nav = e.target.closest("[data-nav]");
      if (nav) {
        var id = nav.dataset.nav;
        if (id === "home") Router.root("home");
        else if (id === "transactions") Router.root("transactions");
        return;
      }
      if (e.target.closest('[data-version]')) return; // handled by the global tap counter
      var go = e.target.closest("[data-go]");
      if (go) {
        var target = go.dataset.go;
        if (target === "language") { Misc.languageSheet(); return; }
        Router.push(target);
        return;
      }
      if (e.target.closest('[data-act="logout"]')) {
        UI.sheet({
          title: "Log out?",
          closeBtn: true,
          body: '<p class="form-note" style="padding-bottom:16px">You will need to authenticate again to use CBE Mobile Banking.</p>' +
            '<div class="btn-row"><button class="btn btn--quiet" data-close="1">Cancel</button>' +
            '<button class="btn btn--danger" data-act="yes">Log out</button></div>'
        }).node.addEventListener("click", function (ev) {
          if (ev.target.closest('[data-act="yes"]')) Router.root("login");
        });
      }
    });
    return { el: el };
  }

  /* --------------------------------------------------- account preferences */
  function accountPrefsView() {
    var s = Store.get();
    var el = UI.h('<div class="screen">' +
      UI.appbar({
        title: "Default Account Preferences",
        actions: '<button class="iconbtn" data-act="reveal" aria-label="Reveal">' + Icon("eye", 21) + "</button>"
      }) +
      '<div class="body"><div class="sheet"><div class="pad">' +
        '<div class="section-label">Default Accounts</div>' +
        '<div class="group">' +
          '<div class="simple-row">' +
            '<span class="rowline__icon" style="width:34px;height:34px">' + Icon("arrowUpRight", 18) + "</span>" +
            '<span class="grow"><span class="rowline__title">Sending Money</span>' +
              '<div class="rowline__sub">Saving Account (' + U.esc(U.maskShort(s.accountNumber)) + ")</div></span>" +
            '<button class="change-btn" data-act="change">Change ' + Icon("chevronDown", 15) + "</button>" +
          "</div>" +
          '<div class="simple-row">' +
            '<span class="rowline__icon" style="width:34px;height:34px">' + Icon("arrowDownLeft", 18) + "</span>" +
            '<span class="grow"><span class="rowline__title">Receiving Money</span>' +
              '<div class="rowline__sub">Saving Account (' + U.esc(U.maskShort(s.accountNumber)) + ")</div></span>" +
            '<button class="change-btn" data-act="change">Change ' + Icon("chevronDown", 15) + "</button>" +
          "</div>" +
        "</div>" +
      "</div></div></div></div>");
    el.addEventListener("click", function (e) {
      if (e.target.closest('[data-act="change"]')) UI.toast("This is your only CBE account");
      if (e.target.closest('[data-act="reveal"]')) UI.toast("Account " + Store.get().accountNumber);
    });
    return { el: el };
  }

  /* ------------------------------------------------ notification preferences */
  function notificationPrefsView() {
    var keys = [
      { k: "sms", icon: "chat", t: "SMS Notifications", d: "Receive important updates via SMS" },
      { k: "email", icon: "mail", t: "Email Notifications", d: "Get emails for account activity and promotions" },
      { k: "push", icon: "bell", t: "Push Notifications", d: "Receive instant alerts on your device" },
      { k: "inapp", icon: "phone", t: "In-App Notifications", d: "See notifications directly within the app" }
    ];
    var el = UI.h('<div class="screen">' +
      UI.appbar({ title: "Notification Preferences" }) +
      '<div class="body"><div class="sheet"><div class="pad">' +
        '<div class="section-title" style="padding:18px 4px 10px">General Notifications</div>' +
        '<div class="group">' + keys.map(function (n) {
          return '<div class="rowline" style="cursor:default">' +
            '<span class="rowline__icon">' + Icon(n.icon, 22) + "</span>" +
            '<span class="rowline__text"><span class="rowline__title">' + n.t + "</span>" +
              '<div class="rowline__sub">' + n.d + "</div></span>" +
            UI.toggle(Store.getIn("notifications." + n.k), 'data-n="' + n.k + '"') + "</div>";
        }).join("") + "</div>" +
      "</div></div></div></div>");
    el.addEventListener("click", function (e) {
      var t = e.target.closest("[data-n]");
      if (!t) return;
      var k = t.dataset.n;
      var on = !Store.getIn("notifications." + k);
      Store.setIn("notifications." + k, on);
      t.classList.toggle("is-on", on);
    });
    return { el: el };
  }

  /* ------------------------------------------------- service preferences -- */
  function servicePrefsView() {
    var el = UI.h('<div class="screen">' +
      UI.appbar({ title: "Service Preferences" }) +
      '<div class="body"><div class="sheet"><div class="pad">' +
        '<div class="section-title" style="padding:18px 4px 10px">Service Options</div>' +
        '<div class="group">' +
          '<div class="rowline" style="cursor:default">' +
            '<span class="rowline__icon">' + Icon("ussd", 22) + "</span>" +
            '<span class="rowline__text"><span class="rowline__title">USSD Enabled</span>' +
              '<div class="rowline__sub">Allow USSD interactions for specific services</div></span>' +
            UI.toggle(Store.get().ussd, 'data-ussd') + "</div>" +
        "</div>" +
      "</div></div></div></div>");
    el.addEventListener("click", function (e) {
      var t = e.target.closest("[data-ussd]");
      if (!t) return;
      var on = !Store.get().ussd;
      Store.set({ ussd: on });
      t.classList.toggle("is-on", on);
    });
    return { el: el };
  }

  /* ------------------------------------------------------------ biometric - */
  function biometricView() {
    var el = UI.h('<div class="screen">' +
      UI.appbar({ title: "Security Setting" }) +
      '<div class="body"><div class="sheet"><div class="pad">' +
        '<div class="section-label">Preferences</div>' +
        '<div class="group">' +
          '<div class="rowline" style="cursor:default">' +
            '<span class="rowline__icon rowline__icon--filled">' + Icon.fingerprint(24, "light") + "</span>" +
            '<span class="rowline__text"><span class="rowline__title">Biometric Login</span>' +
              '<div class="rowline__sub" data-sub></div></span>' +
            UI.toggle(Store.get().biometric, 'data-bio') + "</div>" +
        "</div>" +
      "</div></div></div></div>");

    function paint() {
      el.querySelector("[data-sub]").textContent =
        "Biometric login is " + (Store.get().biometric ? "on" : "off");
    }
    paint();
    el.addEventListener("click", function (e) {
      var t = e.target.closest("[data-bio]");
      if (!t) return;
      var on = !Store.get().biometric;
      Store.set({ biometric: on });
      t.classList.toggle("is-on", on);
      paint();
      UI.toast("Biometric login " + (on ? "enabled" : "disabled"));
    });
    return { el: el };
  }

  /* --------------------------------------------------------- change pin --- */
  function changePinView() {
    var el = UI.h('<div class="screen">' +
      UI.appbar({ title: "Change PIN" }) +
      '<div class="body"><div class="sheet"><div class="pad" style="padding-top:16px">' +
        '<div class="field" style="margin-top:0"><div class="input">' +
          '<span class="input__icon">' + Icon("lock", 21) + "</span>" +
          '<input data-cur type="text" inputmode="numeric" maxlength="6" placeholder="Current PIN"></div></div>' +
        '<div class="field"><div class="input">' +
          '<span class="input__icon">' + Icon("card", 21) + "</span>" +
          '<input data-new type="text" inputmode="numeric" maxlength="6" placeholder="New PIN"></div></div>' +
        '<div class="field"><div class="input">' +
          '<span class="input__icon">' + Icon("checkCircle", 21) + "</span>" +
          '<input data-conf type="text" inputmode="numeric" maxlength="6" placeholder="Confirm New PIN">' +
          '<span class="input__suffix">' + Icon("checkCircle", 18) + Icon("eye", 18) + "</span></div></div>" +
        '<button class="btn btn--block is-disabled" data-act="update" style="margin-top:22px;opacity:.55">Update PIN</button>' +
      "</div></div></div></div>");

    function upd() {
      var c = el.querySelector("[data-cur]").value.trim();
      var n = el.querySelector("[data-new]").value.trim();
      var f = el.querySelector("[data-conf]").value.trim();
      el.querySelector('[data-act="update"]').classList.toggle("is-disabled",
        !(c && n && f));
    }
    el.addEventListener("input", upd);
    el.addEventListener("click", function (e) {
      if (!e.target.closest('[data-act="update"]')) return;
      var c = el.querySelector("[data-cur]").value.trim();
      var n = el.querySelector("[data-new]").value.trim();
      var f = el.querySelector("[data-conf]").value.trim();
      if (c !== Store.get().pin) { UI.toast("Current PIN is incorrect"); return; }
      if (n.length !== 6 || U.digits(n) !== n) { UI.toast("New PIN must be 6 digits"); return; }
      if (n !== f) { UI.toast("New PINs do not match"); return; }
      Store.set({ pin: n });
      UI.toast("PIN updated");
      Router.back();
    });
    return { el: el };
  }

  /* --------------------------------------------------- change passphrase - */
  function changePassView() {
    var el = UI.h('<div class="screen">' +
      UI.appbar({ title: "Change Passphrase" }) +
      '<div class="body"><div class="sheet"><div class="pad" style="padding-top:16px">' +
        '<div class="field" style="margin-top:0"><div class="input">' +
          '<span class="input__icon">' + Icon("lock", 21) + "</span>" +
          '<input data-cur type="password" placeholder="Current Passphrase"></div></div>' +
        '<div class="field"><div class="input">' +
          '<span class="input__icon">' + Icon("key", 21) + "</span>" +
          '<input data-new type="password" placeholder="New Passphrase"></div></div>' +
        '<div class="field"><div class="input">' +
          '<span class="input__icon">' + Icon("checkCircle", 21) + "</span>" +
          '<input data-conf type="password" placeholder="Confirm New Passphrase">' +
          '<span class="input__suffix">' + Icon("checkCircle", 18) + Icon("eye", 18) + "</span></div></div>" +
        '<button class="btn btn--block" data-act="update" style="margin-top:22px;opacity:.55">Update Passphrase</button>' +
      "</div></div></div></div>");
    el.addEventListener("click", function (e) {
      if (!e.target.closest('[data-act="update"]')) return;
      var n = el.querySelector("[data-new]").value;
      var f = el.querySelector("[data-conf]").value;
      if (n.length < 6) { UI.toast("Passphrase must be at least 6 characters"); return; }
      if (n !== f) { UI.toast("Passphrases do not match"); return; }
      UI.toast("Passphrase updated");
      Router.back();
    });
    return { el: el };
  }

  Router.define("settings", view);
  Router.define("accountPrefs", accountPrefsView);
  Router.define("notificationPrefs", notificationPrefsView);
  Router.define("servicePrefs", servicePrefsView);
  Router.define("biometric", biometricView);
  Router.define("changePin", changePinView);
  Router.define("changePass", changePassView);
})();
