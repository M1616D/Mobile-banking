/* ==========================================================================
   router.js — screen registry, history and the shared chrome builders.
   A screen is a function that returns plain HTML; navigation crossfades with
   transform/opacity only, so it never drops a frame on a phone.
   ========================================================================== */
(function (global) {
  'use strict';

  var CBE = global.CBE || (global.CBE = {});
  var h = CBE.h, qs = CBE.qs, on = CBE.on, html2node = CBE.html2node, icon = CBE.icon;

  var screens = {};
  var history = [];
  var current = null;
  var mountToken = 0;
  var afterMount = [];

  function define(name, def) { screens[name] = def; }

  function screenNode() { return qs('#layer-screen'); }

  function currentScreen() { return current; }

  /* --------------------------------------------------------------- chrome */
  function appbar(opts) {
    opts = opts || {};
    var tools = opts.tools || [];
    var toolsHtml = tools.map(function (t) {
      if (t === 'search') return '<button class="icon-btn" data-a="search" aria-label="Search">' + icon('search', 23) + '</button>';
      if (t === 'refresh') return '<button class="icon-btn" data-a="refresh" aria-label="Refresh">' + icon('refresh', 22) + '</button>';
      if (t === 'eye') return '<button class="icon-btn" data-a="toggleAcctEye" aria-label="Show account">' + icon('eye', 22) + '</button>';
      if (t === 'camera') return '<button class="icon-btn" data-a="receiptCamera" aria-label="Scan">' + icon('camera', 22) + '</button>';
      return typeof t === 'string' ? icon(t, 22) : t;
    }).join('');
    return h`
      <header class="appbar${opts.center ? ' appbar--centered' : ''}">
        ${opts.back === false ? '' : CBE.raw('<button class="icon-btn" data-a="back" aria-label="Back">' + icon('chevronLeft', 24) + '</button>')}
        <h1 class="appbar__title">${opts.title || ''}</h1>
        ${CBE.raw(toolsHtml ? '<div class="appbar__tools">' + toolsHtml + '</div>' : '')}
      </header>`;
  }

  var TABS = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'transactions', label: 'Transactions', icon: 'bank' },
    { id: 'settings', label: 'Settings', icon: 'sliders' }
  ];

  function tabbar(active) {
    return h`
      <nav class="tabbar" role="tablist">
        <div class="tabbar__inner">
          ${TABS.map(function (t) {
            return h`<button class="tab${t.id === active ? ' is-active' : ''}" role="tab" data-a="tab" data-tab="${t.id}" aria-selected="${t.id === active ? 'true' : 'false'}">
              <span class="tab__pill">${CBE.raw(icon(t.icon, t.id === 'settings' ? 22 : 23))}</span>
              <span>${t.label}</span>
            </button>`;
          })}
        </div>
      </nav>`;
  }

  /* ---------------------------------------------------------------- render */
  function build(name, params) {
    var def = screens[name];
    if (!def) return null;
    var out = def(params || {});
    var cls = 'screen' + (out.screenClass ? ' ' + out.screenClass : '');
    var body = '<div class="screen-body ' + (out.bodyClass || '') + '">' + (out.body || '') + '</div>';
    var markup = '<div class="' + cls + '" data-screen="' + name + '">' +
      (out.appbar === false ? '' : (out.appbar || '')) +
      body +
      (out.nav ? tabbar(out.nav) : '') +
      (out.fab || '') +
      '</div>';
    return { node: html2node(markup), out: out };
  }

  function mount(name, params, opts) {
    var built = build(name, params);
    if (!built) { CBE.toast('Missing screen: ' + name); return; }
    opts = opts || {};
    var root = screenNode();
    var node = built.node;
    node.style.opacity = '0';

    /* drop the outgoing screen now, never on a timer: a throttled tab would
       otherwise leave two screens (and duplicate #ids) alive at once, and
       every handler lookup would resolve against the stale one */
    while (root.firstElementChild) root.removeChild(root.firstElementChild);
    root.appendChild(node);

    current = { name: name, params: params || {}, def: built.out };

    requestAnimationFrame(function () {
      node.style.transition = 'opacity .16s linear';
      node.style.opacity = '1';
    });

    restoreScroll(name, params, node);

    var token = ++mountToken;
    afterMount = [];
    if (built.out.onMount) built.out.onMount(node, params || {});
    var pending = afterMount;
    requestAnimationFrame(function () { if (token === mountToken) pending.forEach(function (fn) { try { fn(node); } catch (e) { /* noop */ } }); });
  }

  /* per-screen scroll memory so going back feels native */
  var scrollMemo = {};
  function memoKey(name, params) {
    var extra = '';
    if (name === 'receiptView' && params && params.id) extra = ':' + params.id;
    return name + extra;
  }

  function rememberScroll() {
    if (!current) return;
    var node = screenNode().firstElementChild;
    if (!node) return;
    var body = node.querySelector('.screen-body');
    if (!body) return;
    scrollMemo[memoKey(current.name, current.params)] = body.scrollTop;
  }

  function restoreScroll(name, params, node) {
    var body = node.querySelector('.screen-body');
    if (!body) return;
    var y = scrollMemo[memoKey(name, params)];
    if (y) body.scrollTop = y;
  }

  function refresh() {
    if (!current) return;
    var node = screenNode().firstElementChild;
    var y = 0;
    if (node) {
      var body = node.querySelector('.screen-body');
      if (body) y = body.scrollTop;
    }
    mount(current.name, current.params, { noFade: true });
    var next = screenNode().firstElementChild;
    if (next && y) {
      var nb = next.querySelector('.screen-body');
      if (nb) nb.scrollTop = y;
    }
  }

  function go(name, params, opts) {
    opts = opts || {};
    if (current && !opts.replace) {
      if (current.name !== name || JSON.stringify(current.params) !== JSON.stringify(params || {})) {
        rememberScroll();
        history.push({ name: current.name, params: current.params });
      }
    }
    mount(name, params || {}, opts);
  }

  function back(fallback) {
    if (!history.length) {
      if (fallback) { mount(fallback, {}, {}); return; }
      return;
    }
    var prev = history.pop();
    mount(prev.name, prev.params, {});
  }

  function goTab(id) {
    rememberScroll();
    history = [];
    mount(id, {}, {});
  }

  function reset(name, params) {
    history = [];
    scrollMemo = {};
    mount(name, params || {}, {});
  }

  function onMount(fn) { afterMount.push(fn); }

  CBE.define = define;
  CBE.go = go;
  CBE.back = back;
  CBE.goTab = goTab;
  CBE.reset = reset;
  CBE.refresh = refresh;
  CBE.onMount = onMount;
  CBE.appbar = appbar;
  CBE.tabbar = tabbar;
  CBE.currentScreen = currentScreen;
  CBE.screens = screens;

  /* a tiny gesture layer: swipe sideways between the three tabs */
  (function swipe() {
    var x0 = 0, y0 = 0, tracking = false;
    on(document, 'touchstart', function (e) {
      if (CBE.overlay.count()) { tracking = false; return; }
      if (e.touches.length !== 1) return;
      var t = e.touches[0];
      x0 = t.clientX; y0 = t.clientY;
      tracking = true;
    }, { passive: true });

    on(document, 'touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      var t = e.changedTouches[0];
      var dx = t.clientX - x0, dy = t.clientY - y0;
      if (Math.abs(dx) < 60 || Math.abs(dy) > 46) return;
      var cur = CBE.currentScreen();
      if (!cur || !['home', 'transactions', 'settings'].indexOf(cur.name) === -1) { /* keep simple */ }
      if (!cur || ['home', 'transactions', 'settings'].indexOf(cur.name) < 0) return;
      var order = ['home', 'transactions', 'settings'];
      var i = order.indexOf(cur.name);
      var next = dx < 0 ? order[i + 1] : order[i - 1];
      if (next) CBE.goTab(next);
    }, { passive: true });
  })();
})(typeof window !== 'undefined' ? window : this);
