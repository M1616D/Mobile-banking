/* ==========================================================================
   util.js — tiny DOM helpers, number/word/date formatting, QR-free utilities.
   Loaded first; everything else hangs off the single global `CBE`.
   ========================================================================== */
(function (global) {
  'use strict';

  var CBE = global.CBE || (global.CBE = {});

  /* ------------------------------------------------------------- escaping */
  function esc(v) {
    if (v === null || v === undefined) return '';
    return String(v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function raw(v) { return { __raw: v === null || v === undefined ? '' : String(v) }; }

  /* one interpolation: anything already produced by h() or raw() is trusted
     HTML, everything else is escaped */
  function piece(v) {
    if (v === null || v === undefined || v === false) return '';
    if (v && v.__raw !== undefined) return v.__raw;
    if (Array.isArray(v)) return v.map(piece).join('');
    return esc(v);
  }

  /* tagged template: escapes every interpolation unless it came from raw()
     or from another h`` call */
  function h(strs) {
    var vals = Array.prototype.slice.call(arguments, 1);
    var out = strs[0];
    for (var i = 0; i < vals.length; i++) {
      out += piece(vals[i]);
      out += strs[i + 1];
    }
    var boxed = new String(out);
    boxed.__raw = out;
    return boxed;
  }

  /* ------------------------------------------------------------------ dom */
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function html2node(markup) {
    var tpl = document.createElement('template');
    tpl.innerHTML = String(markup).trim();
    return tpl.content.firstElementChild;
  }

  function on(node, type, fn, opts) { node.addEventListener(type, fn, opts || false); return fn; }

  /* settle a click before running the heavy handler so the :active state paints */
  function tap(node, fn) {
    var done = false;
    return on(node, 'click', function (e) {
      if (done) return;
      done = true;
      setTimeout(function () { done = false; }, 60);
      fn(e, node);
    });
  }

  function vibrate(ms) {
    var n = global.navigator;
    if (n && typeof n.vibrate === 'function') { try { n.vibrate(ms || 8); } catch (e) { /* ignore */ } }
  }

  /* ------------------------------------------------------------- numbers */
  function num(v) {
    var n = typeof v === 'number' ? v : parseFloat(String(v === null || v === undefined ? '' : v).replace(/[^0-9.\-]/g, ''));
    return isFinite(n) ? n : 0;
  }

  function money(v, dp) {
    var n = num(v);
    var d = dp === undefined ? 2 : dp;
    var neg = n < 0;
    var parts = Math.abs(n).toFixed(d).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '-' : '') + parts.join('.');
  }

  function money0(v) { return money(v, 0); }

  var ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
    'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  var TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function trio(n) {
    var out = '';
    if (n > 99) { out += ONES[Math.floor(n / 100)] + ' Hundred'; n %= 100; if (n) out += ' '; }
    if (n > 19) { out += TENS[Math.floor(n / 10)]; if (n % 10) out += ' ' + ONES[n % 10]; }
    else if (n) out += ONES[n];
    return out;
  }

  function under1000(n) { return n ? trio(n) : ''; }

  function intWords(n) {
    if (n === 0) return 'Zero';
    var units = ['', ' Thousand', ' Million', ' Billion'];
    var out = [];
    var i = 0;
    while (n > 0) {
      var chunk = n % 1000;
      if (chunk) out.unshift(trio(chunk) + units[i]);
      n = Math.floor(n / 1000);
      i++;
    }
    return out.join(' ');
  }

  /* "Five Hundred Forty Six ETB and Sixty One cents" — exactly as the receipt */
  function words(v) {
    var n = num(v);
    var whole = Math.floor(Math.abs(n));
    var cents = Math.round((Math.abs(n) - whole) * 100);
    var s = intWords(whole) + ' ETB';
    if (cents) s += ' and ' + trio(cents) + (cents === 1 ? ' cent' : ' cents');
    return s;
  }

  function digits(v) { return String(v === null || v === undefined ? '' : v).replace(/\D/g, ''); }

  function group4(v) {
    return digits(v).replace(/(.{4})/g, '$1 ').trim();
  }

  /* account display helpers ------------------------------------------------ */
  function last4(acc) {
    var d = digits(acc);
    return d.length > 4 ? d.slice(-4) : d;
  }

  function maskAcct(acc, stars) {
    var d = digits(acc);
    if (!d) return '—';
    var s = stars === undefined ? 7 : stars;
    if (d.length <= 4) return d;
    return d.charAt(0) + new Array(s + 1).join('*') + d.slice(-4);
  }

  /* card style: "1 **** 3619" */
  function cardAcct(acc) {
    var d = digits(acc);
    if (!d) return '—';
    return d.slice(0, 1) + ' **** ' + d.slice(-4);
  }

  function accountLabel(acc) {
    var d = digits(acc);
    if (d.length >= 13) return d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6, 9) + '-' + d.slice(9);
    return d;
  }

  /* ---------------------------------------------------------------- dates */
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function clock(d) {
    var h = d.getHours();
    var ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if (!h) h = 12;
    return h + ':' + pad2(d.getMinutes()) + ' ' + ap;
  }

  function toDate(v) {
    if (v instanceof Date) return v;
    if (typeof v === 'number') return new Date(v);
    var d = new Date(v === undefined || v === null || v === '' ? Date.now() : v);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  function fmtShort(v) { var d = toDate(v); return d.getDate() + ' ' + MON[d.getMonth()] + ', ' + d.getFullYear(); }
  function fmtLong(v) { var d = toDate(v); return MON[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); }
  function fmtStamp(v) { var d = toDate(v); return d.getDate() + ' ' + MON[d.getMonth()] + ', ' + String(d.getFullYear()).slice(2) + ' ' + clock(d); }
  function fmtFull(v) { var d = toDate(v); return fmtLong(d) + ', ' + clock(d); }
  function fmtDay(v) { var d = toDate(v); return fmtLong(d) + ' \u2022 ' + clock(d); }

  /* --------------------------------------------------------------- random */
  var ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  function ref() {
    var s = 'FT26';
    for (var i = 0; i < 8; i++) s += ALPHA.charAt(Math.floor(Math.random() * ALPHA.length));
    return s;
  }

  function uid() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3); }

  function initials(name) {
    var p = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!p.length) return '?';
    if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
    return (p[0].charAt(0) + p[p.length - 1].charAt(0)).toUpperCase();
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function debounce(fn, ms) {
    var t;
    return function () {
      var a = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, a); }, ms || 120);
    };
  }

  CBE.esc = esc;
  CBE.raw = raw;
  CBE.h = h;
  CBE.qs = qs;
  CBE.qsa = qsa;
  CBE.html2node = html2node;
  CBE.on = on;
  CBE.tap = tap;
  CBE.vibrate = vibrate;
  CBE.num = num;
  CBE.money = money;
  CBE.money0 = money0;
  CBE.words = words;
  CBE.digits = digits;
  CBE.group4 = group4;
  CBE.last4 = last4;
  CBE.maskAcct = maskAcct;
  CBE.cardAcct = cardAcct;
  CBE.accountLabel = accountLabel;
  CBE.fmtShort = fmtShort;
  CBE.fmtLong = fmtLong;
  CBE.fmtStamp = fmtStamp;
  CBE.fmtFull = fmtFull;
  CBE.fmtDay = fmtDay;
  CBE.toDate = toDate;
  CBE.ref = ref;
  CBE.uid = uid;
  CBE.initials = initials;
  CBE.clamp = clamp;
  CBE.debounce = debounce;
})(typeof window !== 'undefined' ? window : this);
