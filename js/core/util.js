/* =========================================================================
   util.js — tiny helpers (no dependencies, no network)
   ========================================================================= */
(function (global) {
  "use strict";

  var U = {};

  /* ------------------------------------------------------------- money -- */
  U.cents = function (v) { return Math.round(Number(v) * 100); };
  U.money = function (cents) {
    var neg = cents < 0, n = Math.abs(Math.round(cents));
    var whole = Math.floor(n / 100), frac = n % 100;
    var s = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (neg ? "-" : "") + s + "." + (frac < 10 ? "0" + frac : frac);
  };
  U.money0 = function (cents) {
    return U.money(cents);
  };
  U.etb = function (cents) { return "ETB" + U.money(cents); };

  /* -------------------------------------------------------------- text -- */
  U.esc = function (s) {
    return String(s === undefined || s === null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };
  U.pad = function (n, w) { n = String(n); while (n.length < (w || 2)) n = "0" + n; return n; };

  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /* "21-Sep-26 2:22 PM" — list rows */
  U.shortDate = function (d) {
    d = d || new Date();
    return U.pad(d.getDate()) + "-" + MON[d.getMonth()] + "-" + String(d.getFullYear()).slice(2) +
      " " + U.time12(d, false);
  };
  /* "2:22 PM" */
  U.time12 = function (d, padHour) {
    var h = d.getHours(), m = d.getMinutes(), ap = h >= 12 ? "PM" : "AM";
    h = h % 12; if (h === 0) h = 12;
    return (padHour ? U.pad(h) : String(h)) + ":" + U.pad(m) + " " + ap;
  };
  /* "Sep 21, 2026, 2:22 PM" — statement */
  U.statementDate = function (d) {
    d = d || new Date();
    return MON[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear() + ", " + U.time12(d, false);
  };
  /* "Sep 21, 2026 02:22 PM" — receipt summary */
  U.receiptDate = function (d) {
    d = d || new Date();
    return MON[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear() + " " + U.time12(d, true);
  };
  /* "23 Sep 2026 • 03:44 PM" — balance card */
  U.cardStamp = function (d) {
    d = d || new Date();
    return U.pad(d.getDate()) + " " + MON[d.getMonth()] + " " + d.getFullYear() +
      " • " + U.time12(d, true);
  };
  /* "Sep 24, 2026 · 11:20 AM" — my information */
  U.signIn = function (d) {
    d = d || new Date();
    return MON[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear() + " · " + U.time12(d, true);
  };

  /* ----------------------------------------------------------------- id -- */
  var ALNUM = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  U.txnId = function () {
    var d = new Date(), rand = "";
    for (var i = 0; i < 6; i++) rand += ALNUM[Math.floor(Math.random() * ALNUM.length)];
    return "FT" + String(d.getFullYear()).slice(2) + U.pad(d.getMonth() + 1) + rand;
  };
  U.uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };

  /* -------------------------------------------------------------- misc -- */
  U.maskAccount = function (acc) {
    var s = String(acc || "");
    if (s.length <= 4) return s;
    return "1" + "*".repeat(Math.max(0, s.length - 5)) + s.slice(-4);
  };
  /* reference shows "1****3819" (4 stars) for a 13-digit account */
  U.maskShort = function (acc) {
    var s = String(acc || "");
    if (s.length <= 4) return s;
    return s[0] + "****" + s.slice(-4);
  };
  U.maskGrouped = function (acc) {
    var s = String(acc || "");
    if (s.length <= 4) return s;
    return s.slice(0, 1) + " **** " + s.slice(-4);
  };
  U.firstName = function (full) { return String(full || "").trim().split(/\s+/)[0] || ""; };
  U.initials = function (full) {
    var p = String(full || "").trim().split(/\s+/).filter(Boolean);
    if (!p.length) return "??";
    return ((p[0][0] || "") + (p.length > 1 ? (p[p.length - 1][0] || "") : "")).toUpperCase();
  };
  U.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  U.digits = function (s) { return String(s || "").replace(/\D+/g, ""); };
  U.sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  U.haptic = function (ms) { try { if (navigator.vibrate) navigator.vibrate(ms || 8); } catch (e) { } };

  U.debounce = function (fn, wait) {
    var t;
    return function () {
      var a = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, a); }, wait);
    };
  };

  /* --------------------------------------------------------- number words */
  var ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  var TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  U.words = function (num) {
    num = Math.floor(Math.abs(Number(num) || 0));
    if (num === 0) return "Zero";
    var parts = [], units = [[1000000000, "Billion"], [1000000, "Million"], [1000, "Thousand"], [100, "Hundred"]];
    for (var i = 0; i < units.length; i++) {
      var v = units[i][0], name = units[i][1];
      if (num >= v) {
        var q = Math.floor(num / v);
        num = num % v;
        if (name === "Hundred") parts.push(U.words(q) + " Hundred");
        else parts.push(U.words(q) + " " + name);
      }
    }
    if (num > 0) {
      if (num < 20) parts.push(ONES[num]);
      else {
        var t = Math.floor(num / 10), o = num % 10;
        parts.push(TENS[t] + (o ? " " + ONES[o] : ""));
      }
    }
    return parts.join(" ").replace(/\s+/g, " ").trim();
  };

  global.U = U;
})(window);
