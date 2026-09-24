/* ==========================================================================
   guard.js — screen protection for the private surfaces (the hidden setup and
   every receipt). A web page cannot forbid the operating system from taking a
   screenshot, so this does everything the platform does allow: the protected
   layers are blurred the instant the app leaves the foreground (so the app
   switcher and its thumbnail never carry a readable copy), the print-screen,
   snapshot and Ctrl+P shortcuts are swallowed on those layers, long-press and
   right-click menus are blocked and the text cannot be selected or dragged.
   None of it shows up anywhere in the interface.
   ========================================================================== */
(function (global) {
  'use strict';

  var CBE = global.CBE || (global.CBE = {});
  var on = CBE.on;

  var GUARDED = '.is-guarded';
  var obscured = false;

  function any() { return !!document.querySelector(GUARDED); }

  function obscure(state) {
    if (state === obscured) return;
    obscured = state;
    if (document.body) document.body.classList.toggle('is-obscured', state);
  }

  /* a screenshot that reached the clipboard would otherwise be re-pasted;
     clearing it is the one thing a page may still do about that */
  function wipeClipboard() {
    try {
      if (global.navigator && global.navigator.clipboard && global.navigator.clipboard.writeText) {
        global.navigator.clipboard.writeText('').catch(function () { /* needs a user gesture */ });
      }
    } catch (e) { /* ignore */ }
  }

  function protectedTarget(e) {
    var t = e.target;
    if (!t || !t.closest) return false;
    return !!t.closest(GUARDED);
  }

  function boot() {
    /* hide the content the moment the app goes to the background */
    on(document, 'visibilitychange', function () {
      obscure(document.visibilityState === 'hidden' && any());
    });
    on(global, 'blur', function () { if (any()) obscure(true); });
    on(global, 'focus', function () { obscure(false); });

    /* any fresh interaction brings the protected layer back */
    on(document, 'pointerdown', function () { obscure(false); }, true);
    on(document, 'touchstart', function () { obscure(false); }, { passive: true, capture: true });

    /* print screen / snipping / Ctrl+P / Ctrl+S on a protected layer */
    on(document, 'keydown', function (e) {
      if (!any()) return;
      var k = e.key || '';
      var combo = (e.ctrlKey || e.metaKey) && (k === 'p' || k === 's');
      if (k === 'PrintScreen' || k === 'Snapshot' || combo) {
        e.preventDefault();
        e.stopPropagation();
        wipeClipboard();
        obscure(true);
        setTimeout(function () {
          if (document.visibilityState !== 'hidden' && document.hasFocus()) obscure(false);
        }, 1400);
      }
    }, true);

    on(document, 'contextmenu', function (e) {
      if (protectedTarget(e)) e.preventDefault();
    }, true);
    on(document, 'dragstart', function (e) {
      if (protectedTarget(e)) e.preventDefault();
    }, true);

    var style = document.createElement('style');
    style.textContent =
      '.is-guarded,.is-guarded *{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}' +
      'body.is-obscured .is-guarded{filter:blur(18px)}' +
      'body.is-obscured .is-guarded::after{content:"";position:absolute;inset:0;background:#fff;opacity:.6}' +
      '@media print{body.is-obscured .is-guarded{visibility:hidden}}';
    document.head.appendChild(style);
  }

  CBE.guard = { boot: boot, any: any, obscure: obscure };

  if (document.readyState === 'loading') on(document, 'DOMContentLoaded', boot);
  else boot();
})(typeof window !== 'undefined' ? window : this);
