/* =========================================================================
   install.js — the "Install App" invitation.

   The manifest + service worker already make the build installable; this is
   the only surface that ever asks the user to add it to the home screen.

   Rules, deliberately narrow:
     • it is only ever mounted inside the login screen, so it can never appear
       on Settings or anywhere else in the app;
     • it appears only when the browser actually offers an install prompt
       (beforeinstallprompt) on a device that has not decided yet;
     • dismissing it, or installing, records the decision for that device and
       the banner never comes back.
   ========================================================================= */
(function (global) {
  "use strict";

  var DISMISS_KEY = "cbe.mobile.install.dismissed";
  var INSTALLED_KEY = "cbe.mobile.install.installed";

  var deferred = null;      // the captured BeforeInstallPromptEvent
  var listeners = [];

  function flag(key) {
    try { return !!(global.localStorage && localStorage.getItem(key) === "1"); }
    catch (e) { return false; }
  }
  function setFlag(key) {
    try { if (global.localStorage) localStorage.setItem(key, "1"); } catch (e) { /* private mode */ }
  }

  /* already running as an installed app? then there is nothing to offer */
  function standalone() {
    try {
      if (global.matchMedia && global.matchMedia("(display-mode: standalone)").matches) return true;
    } catch (e) { /* older engines */ }
    return !!(global.navigator && navigator.standalone);
  }

  /* the device has already made its choice */
  function decided() {
    return flag(DISMISS_KEY) || flag(INSTALLED_KEY) || standalone();
  }

  function eligible() {
    return !!deferred && !decided();
  }

  function emit() {
    listeners.slice().forEach(function (fn) {
      try { fn(eligible()); } catch (e) { console.error(e); }
    });
  }

  /* hide the banner and remember the decision, so it never shows again */
  function settle(banner) {
    setFlag(DISMISS_KEY);
    deferred = null;
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
    emit();
  }

  function wire(banner) {
    banner.addEventListener("click", function (e) {
      if (e.target.closest("[data-dismiss]")) { settle(banner); return; }
      if (!e.target.closest("[data-install]")) return;
      var prompt = deferred;
      settle(banner);
      if (!prompt || !prompt.prompt) return;
      try {
        prompt.prompt();
        if (prompt.userChoice && prompt.userChoice.then) {
          prompt.userChoice.then(function (choice) {
            if (choice && choice.outcome === "accepted") {
              setFlag(INSTALLED_KEY);
              UI.toast("CBE Mobile Banking installed");
            }
          }).catch(function () { });
        }
      } catch (err) { /* the browser refused the prompt — nothing else to do */ }
    });
  }

  var Install = {
    /* true once the browser has offered the prompt and no decision is stored */
    ready: eligible,

    /* the banner markup, hidden until `ready()` */
    html: function () {
      return '<div class="install-banner" data-install-banner hidden>' +
        '<img src="img/icon-192.png" alt="">' +
        '<span class="grow"><b>Install App</b>' +
          '<small>Add CBE Mobile Banking to your home screen</small></span>' +
        '<button class="btn btn--sm" data-install>Install</button>' +
        '<button class="install-banner__x" data-dismiss aria-label="Not now">' + Icon("x", 18) + "</button>" +
      "</div>";
    },

    /* bind (and keep in step with) the banner inside `root` */
    mount: function (root) {
      if (!root) return;
      var banner = root.querySelector("[data-install-banner]");
      if (!banner) return;
      wire(banner);
      function paint() {
        /* the slot can be torn down with the login screen at any time */
        if (!banner.isConnected) { off(); return; }
        var on = eligible();
        banner.hidden = !on;
        if (!on && decided() && banner.parentNode) banner.parentNode.removeChild(banner);
      }
      var off = function () { listeners = listeners.filter(function (f) { return f !== paint; }); };
      listeners.push(paint);
      paint();
    },

    /* expose the raw prompt for any future "Install" row */
    prompt: function () {
      if (!deferred || !deferred.prompt) return false;
      try { deferred.prompt(); return true; } catch (e) { return false; }
    },

    init: function () {
      global.addEventListener("beforeinstallprompt", function (e) {
        e.preventDefault();
        deferred = e;
        emit();
      });
      global.addEventListener("appinstalled", function () {
        setFlag(INSTALLED_KEY);
        setFlag(DISMISS_KEY);
        deferred = null;
        document.querySelectorAll("[data-install-banner]").forEach(function (n) {
          if (n.parentNode) n.parentNode.removeChild(n);
        });
        emit();
        UI.toast("CBE Mobile Banking installed");
      });
    }
  };

  global.Install = Install;
})(window);
