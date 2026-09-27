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
        '<img src="img/cbe-logo.png" alt="Mobile Banking App" style="width:74%">' +
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
      navigator.serviceWorker.register("sw.js").catch(function () { });
    } catch (e) { }
  }

  /* ------------------------------------------------------------ boot ----- */
  function boot() {
    Guard.init();
    Misc.init();
    installBackHandling();
    installBackButtons();
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
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  global.App = { boot: boot };
})(window);
