/* =========================================================================
   app.js — bootstrap
   ========================================================================= */
(function (global) {
  "use strict";

  /* ---------------------------------------------------------- splash ----- */
  function splash() {
    var node = UI.h('<div class="splash">' +
      '<div style="display:grid;place-items:center;width:47%;max-width:190px;aspect-ratio:1/1;' +
        'background:#fff;border-radius:24%;box-shadow:0 18px 44px rgba(0,0,0,.55);' +
        'animation:splashIn .7s cubic-bezier(.2,.8,.3,1) both">' +
        '<img src="img/cbe-logo.png" alt="CBE Mobile Banking" style="width:74%">' +
      "</div></div>");
    document.getElementById("phone").appendChild(node);
    setTimeout(function () {
      node.classList.add("is-out");
      setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 500);
    }, 1150);
  }

  /* ------------------------------------------- hardware / browser back --- */
  function installBackHandling() {
    try {
      history.replaceState({ app: 1 }, "", location.href);
      global.addEventListener("popstate", function () {
        if (Router.depth() > 1) {
          Router.back();
          history.pushState({ app: 1 }, "", location.href);
        } else {
          // stay inside the app on the root screen
          history.pushState({ app: 1 }, "", location.href);
        }
      });
    } catch (e) { /* file:// contexts can refuse history manipulation */ }

    var origPush = Router.push;
    Router.push = function (id, params) {
      var out = origPush.call(Router, id, params);
      try { history.pushState({ app: 1, id: id }, "", location.href); } catch (e) { }
      return out;
    };
    var origRoot = Router.root;
    Router.root = function (id, params) {
      var out = origRoot.call(Router, id, params);
      try { history.replaceState({ app: 1, id: id }, "", location.href); } catch (e) { }
      return out;
    };

    // ESC acts as back on a keyboard, like the hardware back button
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && Router.depth() > 1) Router.back();
    });
  }

  /* --------------------------------------------- on-screen back buttons --
     Every app bar carries a [data-act="back"] button. Handling it once here
     keeps the client-side stack authoritative on every screen, so no back
     button ever falls through to a browser reload. */
  function installBackButtons() {
    document.addEventListener("click", function (e) {
      var b = e.target.closest('[data-act="back"]');
      if (!b || b.disabled) return;
      e.preventDefault();
      Router.back();
    });
  }

  /* --------------------------------------------- unmapped buttons ------
     Every button must respond. Each screen wires its own controls through
     the attributes below; anything that reaches the document without one of
     them has no page or route behind it, so it answers with the generic error
     toast instead of sitting there dead. This runs on the bubble phase, after
     every screen handler, so it can only ever speak for buttons nobody owned. */
  var WIRED_ATTRS = [
    "data-act", "data-to", "data-go", "data-nav", "data-key", "data-select",
    "data-tab", "data-i", "data-f", "data-id", "data-pick", "data-quickitem",
    "data-n", "data-ussd", "data-bio", "data-mode", "data-os", "data-lang",
    "data-close", "data-version", "data-install", "data-dismiss"
  ];

  function installButtonFallback() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest("button");
      if (!btn || btn.disabled) return;
      if (btn.closest("a[href]")) return;
      for (var i = 0; i < WIRED_ATTRS.length; i++) {
        if (btn.closest("[" + WIRED_ATTRS[i] + "]")) return;
      }
      UI.toast("Something went wrong, try again later.");
    });
  }

  /* --------------------------------------------------------- offline ----- */
  function installServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    if (location.protocol !== "http:" && location.protocol !== "https:") return;
    // During local development always run from the network so edits are never
    // shadowed by a stale offline cache. Offline support stays on for the app.
    var devHost = /^(127\.0\.0\.1|localhost|\[::1\])$/.test(location.hostname);
    try {
      if (devHost) {
        navigator.serviceWorker.getRegistrations().then(function (rs) {
          rs.forEach(function (r) { r.unregister(); });
        }).catch(function () { });
        if (global.caches && caches.keys) {
          caches.keys().then(function (ks) { ks.forEach(function (k) { caches.delete(k); }); });
        }
        return;
      }
      /* read this *before* registering: a page that is already run by a worker
         is an update, one that is not is a first install (whose brand new
         worker broadcasts exactly the same "updated" message). */
      var hadController = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.register("sw.js", { updateViaCache: "none" })
        .then(function (reg) { wireUpdates(reg, hadController); })
        .catch(function () { });
    } catch (e) { }
  }

  /* Every deploy rewrites sw.js (its cache name carries a content hash), so
     the browser installs a new worker, `skipWaiting` + `clients.claim` swap
     it in at once, and the page reloads onto the new cache.  Without this an
     already-installed device could keep serving the build it booted with
     until the worker was unregistered by hand.

     `updateViaCache: "none"` keeps the worker script itself out of the http
     cache, and the update check runs again whenever the app is brought back
     to the foreground, which is when a home-screen install actually resumes. */
  function wireUpdates(reg, hadController) {
    function found() { if (hadController) showUpdateBar(); }
    /* the worker broadcasts on activate — the reliable signal that a new
       build has taken over, skipWaiting or not */
    if (navigator.serviceWorker.addEventListener) {
      navigator.serviceWorker.addEventListener("message", function (e) {
        if (e.data && e.data.type === "cbe-updated") found();
      });
    }
    reg.addEventListener("updatefound", function () {
      var next = reg.installing;
      if (!next) return;
      next.addEventListener("statechange", function () {
        if (next.state === "activated") found();
      });
    });
    function check() {
      if (document.visibilityState !== "visible") return;
      try { reg.update(); } catch (e) { /* offline, or an engine without it */ }
    }
    check();
    document.addEventListener("visibilitychange", check);
    global.addEventListener("focus", check);
  }

  /* one dismissible bar per page: the cache is already updated when it shows,
     so reloading is the whole fix and is left as the user's tap. */
  function showUpdateBar() {
    var host = document.getElementById("overlays");
    if (!host || host.querySelector("[data-update-bar]")) return;
    var bar = UI.h('<div class="update-bar" data-update-bar>' +
      '<span class="grow"><b>A new version is ready</b>' +
        "<small>Reload to get the latest CBE Mobile Banking</small></span>" +
      '<button class="btn btn--sm" data-update>Update</button>' +
      '<button class="update-bar__x" data-dismiss aria-label="Later">' + Icon("x", 18) + "</button></div>");
    bar.addEventListener("click", function (e) {
      if (e.target.closest("[data-update]")) {
        var sw = navigator.serviceWorker.controller;
        if (sw) { try { sw.postMessage({ type: "cbe-skip-waiting" }); } catch (err) { } }
        location.reload();
        return;
      }
      if (e.target.closest("[data-dismiss]") && bar.parentNode) bar.parentNode.removeChild(bar);
    });
    host.appendChild(bar);
  }

  /* ------------------------------------------------------------ boot ----- */
  function boot() {
    Guard.init();
    Misc.init();
    if (global.Install) Install.init();
    installBackHandling();
    installBackButtons();
    installButtonFallback();
    splash();

    // screens that must never be re-rendered from a stale stack
    Router.root("login");

    // keep the guard in step with the screen on the stack
    var origBack = Router.back;
    Router.back = function () {
      var out = origBack.call(Router);
      var top = Router.top();
      Guard.secure(!!(top && top.secure));
      return out;
    };

    installServiceWorker();

    if (global.Lang) Lang.apply();
    document.addEventListener("gesturestart", function (e) { e.preventDefault(); });
    document.addEventListener("dblclick", function (e) { e.preventDefault(); }, { passive: false });

    /* a scanned receipt QR deep-links here as #r=v1|... — open the full
       statement straight away, no login, no stored transaction needed.  The
       hash is cleared afterwards so a reload or a share never re-enters it. */
    try {
      var h = location.hash || "";
      if (h.charAt(0) === "#") h = h.slice(1);
      var qrTx = global.Fees && Fees.txFromQr && Fees.txFromQr(h);
      if (qrTx) {
        history.replaceState(null, "", location.pathname + location.search);
        Router.root("statement", { tx: qrTx, verified: true });
        return;
      }
    } catch (e) { /* a malformed hash must never block the normal boot */ }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  global.App = { boot: boot };
})(window);
