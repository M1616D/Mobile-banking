/* ==========================================================================
   overlay.js — a small stack of overlays that live above the screen layer:
   bottom sheets, centred modals, the biometric dialog, the authenticating
   card and toasts. Only transform/opacity ever animate.
   ========================================================================== */
(function (global) {
  'use strict';

  var CBE = global.CBE || (global.CBE = {});
  var h = CBE.h, qs = CBE.qs, on = CBE.on, html2node = CBE.html2node;

  var stack = [];
  var toastTimer = null;

  function layer() { return qs('#layer-overlay'); }
  function toastLayer() { return qs('#layer-toast'); }

  function top() { return stack.length ? stack[stack.length - 1] : null; }
  function count() { return stack.length; }

  function remove(node) {
    if (node && node.parentNode) node.parentNode.removeChild(node);
  }

  function pop() {
    var entry = stack.pop();
    if (!entry) return false;
    var node = entry.node;
    var inner = node.firstElementChild;
    if (inner) {
      inner.style.transition = 'transform .2s cubic-bezier(.4,0,.2,1), opacity .2s linear';
      inner.style.transform = entry.kind === 'sheet' ? 'translate3d(0,100%,0)' : 'scale(.96)';
      inner.style.opacity = '0';
    }
    node.style.transition = 'opacity .2s linear';
    node.style.opacity = '0';
    setTimeout(function () { remove(node); }, 210);
    if (entry.onClose) entry.onClose();
    return true;
  }

  function popAll() { while (stack.length) pop(); }

  function push(kind, inner, opts) {
    opts = opts || {};
    var scrim = document.createElement('div');
    scrim.className = 'scrim' + (kind === 'sheet' ? '' : ' scrim--center');
    scrim.appendChild(inner);
    layer().appendChild(scrim);

    var entry = { kind: kind, node: scrim, inner: inner, onClose: opts.onClose };

    if (opts.dismissible !== false) {
      on(scrim, 'click', function (e) {
        if (e.target === scrim) pop();
      });
    }

    if (kind === 'sheet') attachSheetDrag(scrim, inner, opts);

    stack.push(entry);
    if (opts.onMount) opts.onMount(inner);
    return entry;
  }

  /* drag a sheet down with the finger to dismiss it */
  function attachSheetDrag(scrim, sheet, opts) {
    var startY = 0, dy = 0, dragging = false, scroll = null;
    var allowWhenShort = opts.dragAnywhere === true;

    on(sheet, 'touchstart', function (e) {
      if (opts.dismissible === false) return;
      if (e.touches.length !== 1) return;
      scroll = sheet.scrollTop;
      if (!allowWhenShort && scroll > 2) { dragging = false; return; }
      dragging = true;
      startY = e.touches[0].clientY;
      dy = 0;
      sheet.style.transition = 'none';
    }, { passive: true });

    on(sheet, 'touchmove', function (e) {
      if (!dragging) return;
      dy = e.touches[0].clientY - startY;
      if (dy < 0) dy = 0;
      if (!allowWhenShort && sheet.scrollTop > 2) { dragging = false; dy = 0; sheet.style.transform = ''; return; }
      sheet.style.transform = 'translate3d(0,' + dy + 'px,0)';
      if (dy > 0 && e.cancelable) e.preventDefault();
    }, { passive: false });

    on(sheet, 'touchend', function () {
      if (!dragging) return;
      dragging = false;
      sheet.style.transition = 'transform .22s cubic-bezier(.22,.61,.36,1)';
      if (dy > 92) { pop(); return; }
      sheet.style.transform = 'translate3d(0,0,0)';
    });
  }

  /* ------------------------------------------------------------- public api */
  function sheet(opts) {
    var inner = html2node(h`
      <div class="sheet" role="dialog" aria-modal="true">
        <div class="sheet__grabber"></div>
        ${CBE.raw(opts.html || '')}
      </div>`);
    if (opts.grabber === false) { var g = inner.firstElementChild; if (g) remove(g); }
    return push('sheet', inner, opts);
  }

  function modal(opts) {
    var inner = html2node(h`
      <div class="${opts.className || 'modal'}" role="dialog" aria-modal="true">
        ${CBE.raw(opts.html || '')}
      </div>`);
    return push('modal', inner, opts);
  }

  /* the wide centred card used for the authenticating / authenticated state */
  function authCard(opts) {
    var inner = html2node(h`
      <div class="modal" style="width:auto;padding:0;background:none;box-shadow:none;text-align:center">
        ${CBE.raw(opts.html || '')}
      </div>`);
    return push('modal', inner, opts);
  }

  function replace(kind, html, opts) {
    if (stack.length && stack[stack.length - 1].kind === kind) {
      var entry = stack[stack.length - 1];
      entry.node.innerHTML = '';
      var inner = html2node(kind === 'sheet'
        ? h`<div class="sheet" role="dialog" aria-modal="true">${CBE.raw(html)}</div>`
        : h`<div class="modal" role="dialog" aria-modal="true">${CBE.raw(html)}</div>`);
      entry.node.appendChild(inner);
      entry.inner = inner;
      if (opts && opts.onClose) entry.onClose = opts.onClose;
      if (opts && opts.onMount) opts.onMount(inner);
      return entry;
    }
    popAll();
    return kind === 'sheet' ? sheet({ html: html, onClose: opts && opts.onClose, onMount: opts && opts.onMount })
      : modal({ html: html, onClose: opts && opts.onClose, onMount: opts && opts.onMount });
  }

  function toast(text, ms) {
    var layerEl = toastLayer();
    if (!layerEl) return;
    layerEl.innerHTML = '';
    var node = html2node(h`<div class="toast">${text}</div>`);
    layerEl.appendChild(node);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      node.style.transition = 'opacity .2s linear';
      node.style.opacity = '0';
      setTimeout(function () { remove(node); }, 220);
    }, ms || 1900);
  }

  CBE.overlay = {
    sheet: sheet,
    modal: modal,
    authCard: authCard,
    replace: replace,
    toast: toast,
    pop: pop,
    popAll: popAll,
    top: top,
    count: count
  };
  CBE.sheet = sheet;
  CBE.modal = modal;
  CBE.toast = toast;

  /* escape closes the newest overlay */
  on(document, 'keydown', function (e) {
    if (e.key === 'Escape' && stack.length) pop();
  });
})(typeof window !== 'undefined' ? window : this);
