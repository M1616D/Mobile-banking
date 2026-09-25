/* =========================================================================
   guard.js — screen-capture deterrent for the sensitive / receipt screens.

   A browser cannot forbid the operating-system screenshot key, so this does
   what a banking web client can: it refuses every in-page capture route
   (print, devtools copy, context menu, drag-out, select-all), and the moment
   a capture attempt is seen — PrintScreen, Cmd+Shift+3/4/5, Ctrl+P — or the
   app loses the foreground while a secure screen is open, the content is
   veiled instantly and a "screen capture is disabled" notice is shown.
   ========================================================================= */
(function (global) {
  "use strict";

  var secure = false;
  var veiled = false;
  var veil = null;
  var timer = null;

  function veilEl() {
    if (!veil) veil = document.getElementById("secure-veil");
    return veil;
  }

  function showVeil(hold) {
    if (!secure) return;
    var v = veilEl();
    if (!v) return;
    veiled = true;
    v.classList.add("is-on");
    clearTimeout(timer);
    if (hold) timer = setTimeout(hideVeil, 1800);
    if (U.haptic) U.haptic(24);
  }

  function hideVeil() {
    var v = veilEl();
    veiled = false;
    if (v) v.classList.remove("is-on");
  }

  function block(e) {
    if (!secure) return;
    if (e.preventDefault) e.preventDefault();
    e.stopPropagation();
    return false;
  }

  function onKeyDown(e) {
    if (!secure) return;
    var k = e.key || "";
    var meta = e.ctrlKey || e.metaKey;
    // PrintScreen (Windows/Linux) and the macOS screenshot chords
    if (k === "PrintScreen" || e.code === "PrintScreen" ||
      e.keyCode === 44 ||
      (meta && e.shiftKey && (k === "3" || k === "4" || k === "5" || k === "S" || k === "s")) ||
      (meta && (k === "p" || k === "P" || k === "s" || k === "S")) ||
      e.key === "F12" ||
      (meta && e.shiftKey && (k === "I" || k === "i" || k === "C" || k === "c" || k === "J" || k === "j"))) {
      showVeil(true);
      return block(e);
    }
  }

  function init() {
    document.addEventListener("contextmenu", function (e) {
      if (secure || e.target.closest(".receipt, .stmt-paper, .secure")) return block(e);
    }, true);
    document.addEventListener("dragstart", function (e) {
      if (secure || e.target.closest("img, .receipt")) return block(e);
    }, true);
    document.addEventListener("selectstart", function (e) {
      if (secure && !e.target.closest("input, textarea")) return block(e);
    }, true);
    document.addEventListener("copy", function (e) { if (secure) block(e); }, true);
    document.addEventListener("cut", function (e) { if (secure) block(e); }, true);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("keyup", function (e) {
      if (!secure) return;
      if (e.key === "PrintScreen" || e.code === "PrintScreen" || e.keyCode === 44) showVeil(true);
    }, true);
    global.addEventListener("beforeprint", function () { if (secure) showVeil(true); });
    global.addEventListener("blur", function () { if (secure) showVeil(false); });
    document.addEventListener("visibilitychange", function () {
      if (!secure) return;
      if (document.hidden) showVeil(false);
      else setTimeout(function () { if (!veiled) hideVeil(); }, 40);
    });
    // re-hide on tap while the veil is up
    document.addEventListener("click", function () { if (veiled) hideVeil(); }, true);
  }

  var Guard = {
    init: init,
    secure: function (on) {
      secure = !!on;
      var phone = document.getElementById("phone");
      if (phone) phone.classList.toggle("is-secure", secure);
      if (!secure) hideVeil();
    },
    isSecure: function () { return secure; },
    /* let callers know a capture attempt happened (used by the receipt screen) */
    onAttempt: null
  };

  global.Guard = Guard;
})(window);
