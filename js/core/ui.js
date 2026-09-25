/* =========================================================================
   ui.js — markup builders + overlay primitives shared by every screen
   ========================================================================= */
(function (global) {
  "use strict";

  function h(html) {
    var t = document.createElement("template");
    t.innerHTML = String(html).trim();
    return t.content.firstElementChild;
  }
  function html(strings) { return strings.join(""); }

  var UI = {};

  /* ------------------------------------------------------------- app bar */
  UI.appbar = function (opts) {
    opts = opts || {};
    var cls = "appbar";
    if (opts.light) cls += " appbar--light";
    if (opts.gradient) cls += " appbar--grad";
    if (opts.center) cls += " appbar--center";
    var left = opts.back === false ? "" :
      '<button class="iconbtn" data-act="back" aria-label="Back">' + Icon("back", 22) + "</button>";
    var actions = opts.actions || "";
    if (opts.search && !actions) {
      actions = '<button class="iconbtn" data-act="search" aria-label="Search">' + Icon("search", 21) + "</button>";
    }
    return '<header class="' + cls + '">' + left +
      '<h1 class="appbar__title">' + U.esc(opts.title || "") + "</h1>" +
      (actions ? '<div class="appbar__actions">' + actions + "</div>" : "") +
      "</header>";
  };

  /* ---------------------------------------------------------- list rows */
  UI.row = function (item, opts) {
    opts = opts || {};
    var icon = item.img
      ? '<span class="rowline__icon"><img src="' + U.esc(item.img) + '" alt=""></span>'
      : (item.icon ? '<span class="rowline__icon">' + Icon(item.icon, 22) + "</span>" : "");
    if (item.icon && item.filled) icon = '<span class="rowline__icon rowline__icon--filled">' + Icon(item.icon, 22) + "</span>";
    if (item.icon && item.plain) icon = '<span class="rowline__icon rowline__icon--plain">' + Icon(item.icon, 28) + "</span>";
    var sub = item.sub ? '<div class="rowline__sub">' + U.esc(item.sub) + "</div>" : "";
    var chev = opts.chevron === false ? "" : '<span class="rowline__chev">' + Icon("chevronRight", 20) + "</span>";
    var right = item.right || chev;
    var danger = item.danger ? " rowline--danger" : "";
    return '<button class="rowline' + danger + '" ' + UI.dataAttrs(item) + ">" + icon +
      '<span class="rowline__text"><span class="rowline__title">' + U.esc(item.label) + "</span>" + sub + "</span>" +
      right + "</button>";
  };

  UI.tile = function (item) {
    var inner;
    if (item.bubble) {
      inner = '<span class="tile__row"><span class="bubble bubble--' + item.bubble + '">' + Icon(item.icon, 22) + "</span>" +
        '<span class="tile__stack"><span class="t">' + U.esc(item.label) + "</span>" +
        (item.sub ? '<span class="s">' + U.esc(item.sub) + "</span>" : "") + "</span></span>";
      return '<button class="tile tile--action" ' + UI.dataAttrs(item) + ">" + inner + "</button>";
    }
    var icon = item.img
      ? '<span class="tile__icon"><img src="' + U.esc(item.img) + '" alt=""></span>'
      : '<span class="tile__icon">' + Icon(item.icon || "help", 30) + "</span>";
    return '<button class="tile' + (item.img ? " tile--img" : "") + (item.wide ? " tile--left" : "") + '" ' +
      UI.dataAttrs(item) + ">" + icon + '<span class="tile__label">' + U.esc(item.label) + "</span></button>";
  };

  UI.dataAttrs = function (item) {
    var out = "";
    if (item.to) out += ' data-to="' + U.esc(item.to) + '"';
    if (item.data) out += ' data-data="' + U.esc(item.data) + '"';
    if (item.action) out += ' data-svc="' + U.esc(item.action) + '"';
    if (item.label) out += ' data-label="' + U.esc(item.label) + '"';
    return out;
  };

  /* ---------------------------------------------------------- catalog screens */
  UI.grid = function (items) {
    return '<div class="svc-grid grid2">' + items.map(UI.tile).join("") + "</div>";
  };
  UI.rows = function (items) {
    return '<div class="cardlist pad">' + items.map(function (i) { return UI.row(i); }).join("") + "</div>";
  };

  /* -------------------------------------------------------------- fields */
  UI.field = function (f, opts) {
    opts = opts || {};
    var icon = f.icon ? '<span class="input__icon">' + Icon(f.icon, 21) + "</span>" : "";
    var suffix = f.suffix || "";
    var attrs = 'data-key="' + U.esc(f.key || "value") + '"';
    if (f.maxlength) attrs += ' maxlength="' + f.maxlength + '"';
    if (f.inputmode) attrs += ' inputmode="' + f.inputmode + '"';
    var control;
    if (f.type === "select") {
      control = '<button class="input selectbtn" type="button" data-select="' + U.esc(f.key || "value") + '"' +
        (f.picker ? ' data-picker="1"' : "") + ">" +
        icon + '<span class="grow" style="color:var(--muted-2)">' + U.esc(f.placeholder || (f.label ? "Select from the list" : "")) + "</span>" +
        '<span class="input__icon">' + Icon("chevronDown", 20) + "</span></button>";
      return '<div class="field"><label class="field__label">' + U.esc(f.label) + "</label>" + control + "</div>";
    }
    control = '<div class="input' + (f.dark ? " input--dark" : "") + '">' + icon +
      '<input type="' + (f.type || "text") + '" ' + attrs + ' placeholder="' + U.esc(f.placeholder || "") + '" ' +
      (f.value !== undefined ? 'value="' + U.esc(f.value) + '"' : "") +
      (f.type === "tel" ? ' inputmode="numeric" autocomplete="off"' : "") + ">" +
      (suffix ? '<span class="input__suffix">' + suffix + "</span>" : "") + "</div>";
    return '<div class="field"><label class="field__label">' + U.esc(f.label) + "</label>" + control +
      (f.error ? '<div class="error-text">' + U.esc(f.error) + "</div>" : "") + "</div>";
  };

  UI.toggle = function (on, attrs) {
    return '<button class="toggle' + (on ? " is-on" : "") + '" role="switch" aria-checked="' + (on ? "true" : "false") +
      '" ' + (attrs || "") + "></button>";
  };

  /* ------------------------------------------------------------ overlays */
  UI.overlay = function (node, opts) {
    opts = opts || {};
    var host = document.getElementById("overlays");
    var veil = h('<div class="veil"></div>');
    host.appendChild(veil);
    host.appendChild(node);
    function close() {
      if (node.classList.contains("sheetmodal")) {
        node.classList.add("is-closing");
        setTimeout(done, 200);
      } else done();
      if (opts.onClose) opts.onClose();
    }
    function done() {
      if (veil.parentNode) veil.parentNode.removeChild(veil);
      if (node.parentNode) node.parentNode.removeChild(node);
    }
    if (opts.dismissible !== false) veil.addEventListener("click", close);
    node._close = close;
    return { node: node, close: close };
  };

  UI.sheet = function (opts) {
    opts = opts || {};
    var node = h('<div class="sheetmodal' + (opts.cls ? " " + opts.cls : "") + '">' +
      '<div class="sheetmodal__grab"></div>' +
      (opts.title ? '<h2 class="sheetmodal__title">' + U.esc(opts.title) + "</h2>" : "") +
      (opts.closeBtn ? '<button class="sheetmodal__close" data-close="1">' + Icon("x", 20) + "</button>" : "") +
      '<div class="sheetmodal__body">' + (opts.body || "") + "</div></div>");
    var api = UI.overlay(node, { dismissible: opts.dismissible !== false, onClose: opts.onClose });
    node.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", api.close); });
    return api;
  };

  UI.dialog = function (opts) {
    var node = h('<div class="dialog">' + (opts.body || "") + "</div>");
    var api = UI.overlay(node, { dismissible: false, onClose: opts.onClose });
    return api;
  };

  UI.toast = function (msg, ms) {
    var node = h('<div class="toast">' + U.esc(msg) + "</div>");
    document.getElementById("overlays").appendChild(node);
    setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, ms || 2200);
    return node;
  };

  /* ------------------------------------------------------------- keypad */
  UI.keypad = function (opts) {
    opts = opts || {};
    var keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "back", "0", "ok"];
    return '<div class="keypad">' + keys.map(function (k) {
      if (k === "back") return '<button class="keypad__key keypad__key--icon" data-key="back">' + Icon("x", 22) + "</button>";
      if (k === "ok") return '<button class="keypad__key keypad__key--ok" data-key="ok">' + Icon("check", 24) + "</button>";
      return '<button class="keypad__key" data-key="' + k + '">' + k + "</button>";
    }).join("") + "</div>";
  };

  /* wire a keypad + dots into a small controller used by PIN / amount entry */
  UI.pinPad = function (opts) {
    var len = opts.length || 6;
    var value = "";
    var root = h('<div>' + UI.keypad() + "</div>");
    var dots = h('<div class="dots">' + Array.from({ length: len }).map(function () { return '<span class="dot"></span>'; }).join("") + "</div>");
    function paint() {
      dots.querySelectorAll(".dot").forEach(function (d, i) { d.classList.toggle("is-on", i < value.length); });
      var ok = root.querySelector('[data-key="ok"]');
      if (ok) ok.classList.toggle("is-ready", value.length === len);
    }
    root.addEventListener("click", function (e) {
      var b = e.target.closest("[data-key]");
      if (!b) return;
      var k = b.dataset.key;
      U.haptic(6);
      if (k === "back") value = value.slice(0, -1);
      else if (k === "ok") { if (value.length === len) opts.onSubmit(value); else opts.onShort && opts.onShort(); }
      else if (value.length < len) value += k;
      paint();
      if (k !== "ok") opts.onChange && opts.onChange(value);
    });
    paint();
    return { dots: dots, pad: root, value: function () { return value; }, clear: function () { value = ""; paint(); } };
  };

  /* ------------------------------------------------------------ helpers */
  UI.icon = Icon;
  UI.h = h;

  /* A brand disc: the real logo when the design folder ships one, otherwise a
     monogram in a colour derived from the name so every row still reads as a
     round brand mark, exactly like the reference list. */
  var MONO_COLORS = [
    "#1f7ae0", "#1e9e5a", "#e0342b", "#7a1fa2", "#d9a441", "#0891b2",
    "#c2410c", "#4338ca", "#0f766e", "#be185d", "#4d7c0f", "#7c3aed"
  ];
  UI.brandMark = function (label, img, size) {
    var px = size || 42;
    if (img) return '<img class="brandmark" src="' + U.esc(img) + '" alt="">';
    var h = 0, s = String(label || "?");
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973;
    var p = s.split(/\s+/).filter(Boolean);
    var txt = ((p[0] || "?")[0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
    return '<span class="brandmark brandmark--mono" style="background:' + MONO_COLORS[h % MONO_COLORS.length] +
      ";width:" + px + "px;height:" + px + 'px;font-size:' + Math.round(px * 0.36) + 'px">' + U.esc(txt) + "</span>";
  };

  /*
   * selectSheet(title, options, onPick, opts)
   *   options -> ["English", ...] or [{ label, img }, ...]
   *   the search box appears for long lists (the bank picker) or via opts.search
   */
  UI.selectSheet = function (title, options, onPick, opts) {
    opts = opts || {};
    var searchable = opts.search !== undefined
      ? !!opts.search
      : (options.length > 8 || options.some(function (o) { return typeof o === "object"; }));
    var body =
      (searchable ? '<div class="picker-search">' + Icon("search", 19) +
        '<input data-pq placeholder="' + U.esc(opts.placeholder || "Search...") + '" autocomplete="off"></div>' : "") +
      '<div class="picker-list" data-plist></div>';
    var s = UI.sheet({
      /* the reference picker carries only the grab handle, so no close disc */
      title: title, body: body, closeBtn: !opts.noClose && !searchable,
      cls: searchable ? "sheetmodal--picker" : ""
    });
    var list = s.node.querySelector("[data-plist]");

    function paint(q) {
      q = (q || "").trim().toLowerCase();
      var hits = [];
      options.forEach(function (o, i) {
        var label = typeof o === "object" ? o.label : o;
        if (!q || String(label).toLowerCase().indexOf(q) >= 0) hits.push({ o: o, i: i });
      });
      if (!hits.length) {
        list.innerHTML = '<div class="picker-empty">No result found</div>';
        return;
      }
      list.innerHTML = hits.map(function (hit) {
        var o = hit.o, label = typeof o === "object" ? o.label : o;
        var mark = typeof o === "object"
          ? UI.brandMark(label, o.img, 44)
          : '<span class="brandmark brandmark--dot"></span>';
        return '<button class="picker-row" data-i="' + hit.i + '">' + mark +
          '<span class="picker-row__label">' + U.esc(label) + "</span></button>";
      }).join("");
    }
    paint("");

    var input = s.node.querySelector("[data-pq]");
    if (input) {
      input.addEventListener("input", function () { paint(input.value); });
      setTimeout(function () { input.focus(); }, 140);
    }

    s.node.addEventListener("click", function (e) {
      var b = e.target.closest("[data-i]");
      if (!b) return;
      var picked = options[+b.dataset.i];
      onPick(typeof picked === "object" ? picked.label : picked, picked);
      s.close();
    });
    return s;
  };

  global.UI = UI;
})(window);
