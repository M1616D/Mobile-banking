/* ==========================================================================
   qr.js — offline QR-style code generator (no network, no dependencies)
   Produces a deterministic, QR-looking matrix with real finder / timing /
   alignment patterns so receipts and receive-money codes render identically
   every time. Pure string -> SVG, fast enough to run on every render.
   ========================================================================== */
(function (global) {
  'use strict';

  var CBE = global.CBE || (global.CBE = {});

  function hash(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function blank(n) {
    var m = [];
    for (var y = 0; y < n; y++) {
      m.push(new Array(n).fill(0));
    }
    return m;
  }

  function placeFinder(m, ox, oy) {
    for (var y = -1; y < 8; y++) {
      for (var x = -1; x < 8; x++) {
        var gx = ox + x, gy = oy + y;
        if (gx < 0 || gy < 0 || gy >= m.length || gx >= m.length) continue;
        var inside = x >= 0 && x <= 6 && y >= 0 && y <= 6;
        var dark = inside && (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4));
        m[gy][gx] = dark ? 1 : 2; // 2 = reserved light
      }
    }
  }

  function placeAlignment(m, cx, cy) {
    for (var y = -2; y <= 2; y++) {
      for (var x = -2; x <= 2; x++) {
        var dark = Math.max(Math.abs(x), Math.abs(y)) !== 1;
        m[cy + y][cx + x] = dark ? 1 : 2;
      }
    }
  }

  function matrix(text, n) {
    n = n || 33;
    var m = blank(n);
    placeFinder(m, 0, 0);
    placeFinder(m, n - 7, 0);
    placeFinder(m, 0, n - 7);
    // timing patterns
    for (var i = 8; i < n - 8; i++) {
      m[6][i] = i % 2 === 0 ? 1 : 2;
      m[i][6] = i % 2 === 0 ? 1 : 2;
    }
    // alignment patterns
    placeAlignment(m, n - 9, n - 9);
    if (n >= 33) placeAlignment(m, n - 9, 20);
    // dark module + format-info reservations
    m[n - 8][8] = 1;
    for (var k = 0; k < 9; k++) {
      if (m[8][k] === 0) m[8][k] = 2;
      if (m[k][8] === 0) m[k][8] = 2;
      if (m[8][n - 1 - k] === 0) m[8][n - 1 - k] = 2;
      if (m[n - 1 - k][8] === 0) m[n - 1 - k][8] = 2;
    }
    // deterministic "data"
    var rand = rng(hash(String(text)));
    for (var y = 0; y < n; y++) {
      for (var x = 0; x < n; x++) {
        if (m[y][x] !== 0) continue;
        m[y][x] = rand() > 0.52 ? 1 : 2;
      }
    }
    // randomise a slice of the format area for realism
    var f = rng(hash(String(text) + '#fmt'));
    for (var q = 0; q < 8; q++) {
      m[8][q] = f() > 0.5 ? 1 : 2;
      m[q][8] = f() > 0.5 ? 1 : 2;
    }
    return m;
  }

  function svg(text, opts) {
    opts = opts || {};
    var n = opts.modules || 33;
    var m = matrix(text, n);
    var d = '';
    for (var y = 0; y < n; y++) {
      var run = 0;
      for (var x = 0; x <= n; x++) {
        var dark = x < n && m[y][x] === 1;
        if (dark) { run++; continue; }
        if (run) { d += 'M' + (x - run) + ' ' + y + 'h' + run + 'v1h-' + run + 'z'; run = 0; }
      }
    }
    var dark = opts.dark || '#101114';
    var light = opts.light || '#ffffff';
    return '<svg viewBox="0 0 ' + n + ' ' + n + '" xmlns="http://www.w3.org/2000/svg" ' +
      'shape-rendering="crispEdges" role="img" aria-label="QR code">' +
      '<rect width="' + n + '" height="' + n + '" fill="' + light + '"/>' +
      '<path d="' + d + '" fill="' + dark + '"/></svg>';
  }

  function dataUrl(text, opts) {
    return 'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(svg(text, opts).replace('<svg ', '<svg width="512" height="512" '));
  }

  CBE.qr = { svg: svg, matrix: matrix, dataUrl: dataUrl };
})(typeof window !== 'undefined' ? window : this);
