/* ==========================================================================
   qr.js — a self-contained QR encoder (byte mode, versions 1–10, ECC L/M/Q/H).
   No network, no dependency: used for every QR surface in the app.
   ========================================================================== */
(function (global) {
  'use strict';

  var CBE = global.CBE || (global.CBE = {});

  /* ----------------------------------------------------- GF(256) arithmetic */
  var EXP = new Array(512), LOG = new Array(256);
  (function () {
    var x = 1;
    for (var i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; }
    for (var j = 255; j < 512; j++) EXP[j] = EXP[j - 255];
  })();

  function gmul(a, b) { return (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]]; }

  function rsGen(n) {
    var g = [1];
    for (var i = 0; i < n; i++) {
      var ng = new Array(g.length + 1);
      for (var k = 0; k < ng.length; k++) ng[k] = 0;
      for (var j = 0; j < g.length; j++) {
        ng[j] ^= g[j];
        ng[j + 1] ^= gmul(g[j], EXP[i]);
      }
      g = ng;
    }
    return g;
  }

  function rsEncode(data, ecLen) {
    var gen = rsGen(ecLen);
    var res = new Array(ecLen);
    for (var i = 0; i < ecLen; i++) res[i] = 0;
    for (var d = 0; d < data.length; d++) {
      var factor = data[d] ^ res[0];
      res.shift();
      res.push(0);
      if (factor !== 0) for (var j = 0; j < ecLen; j++) res[j] ^= gmul(gen[j + 1], factor);
    }
    return res;
  }

  /* --------------------------------------------- version / ecc block table  */
  /* [ecCodewordsPerBlock, blocks1, dataCodewords1, blocks2, dataCodewords2] */
  var BLOCKS = {
    L: { 1: [7, 1, 19, 0, 0], 2: [10, 1, 34, 0, 0], 3: [15, 1, 55, 0, 0], 4: [20, 1, 80, 0, 0], 5: [26, 1, 108, 0, 0], 6: [18, 2, 68, 0, 0], 7: [20, 2, 78, 0, 0], 8: [24, 2, 97, 0, 0], 9: [30, 2, 116, 0, 0], 10: [18, 2, 68, 2, 69] },
    M: { 1: [10, 1, 16, 0, 0], 2: [16, 1, 28, 0, 0], 3: [26, 1, 44, 0, 0], 4: [18, 2, 32, 0, 0], 5: [24, 2, 43, 0, 0], 6: [16, 4, 27, 0, 0], 7: [18, 4, 31, 0, 0], 8: [22, 2, 38, 2, 39], 9: [22, 3, 36, 2, 37], 10: [26, 4, 43, 1, 44] },
    Q: { 1: [13, 1, 13, 0, 0], 2: [22, 1, 22, 0, 0], 3: [18, 2, 17, 0, 0], 4: [26, 2, 24, 0, 0], 5: [18, 2, 15, 2, 16], 6: [24, 4, 19, 0, 0], 7: [18, 2, 14, 4, 15], 8: [22, 4, 18, 2, 19], 9: [20, 4, 16, 4, 17], 10: [24, 6, 19, 2, 20] },
    H: { 1: [17, 1, 9, 0, 0], 2: [28, 1, 16, 0, 0], 3: [22, 2, 13, 0, 0], 4: [16, 4, 9, 0, 0], 5: [22, 2, 11, 2, 12], 6: [28, 4, 15, 0, 0], 7: [26, 4, 13, 1, 14], 8: [26, 4, 14, 2, 15], 9: [24, 4, 12, 4, 13], 10: [28, 6, 15, 2, 16] }
  };

  var ALIGN = { 1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50] };
  var VERSION_BITS = { 7: 0x07c94, 8: 0x085bc, 9: 0x09a99, 10: 0x0a4d3 };

  /* -------------------------------------------------------------- encoding */
  function utf8(str) {
    var out = [], s = String(str);
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) { out.push(0xc0 | (c >> 6), 0x80 | (c & 63)); }
      else if (c < 0xd800 || c >= 0xe000) { out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63)); }
      else {
        i++;
        var c2 = 0x10000 + (((c & 0x3ff) << 10) | (s.charCodeAt(i) & 0x3ff));
        out.push(0xf0 | (c2 >> 18), 0x80 | ((c2 >> 12) & 63), 0x80 | ((c2 >> 6) & 63), 0x80 | (c2 & 63));
      }
    }
    return out;
  }

  function chooseVersion(bytes, ecl) {
    for (var v = 1; v <= 10; v++) {
      var t = BLOCKS[ecl][v];
      var dataCodewords = t[1] * t[2] + t[3] * t[4];
      var headerBits = 4 + (v < 10 ? 8 : 16);
      if (headerBits + bytes.length * 8 <= dataCodewords * 8) return v;
    }
    return 10;
  }

  function buildBytes(bytes, ecl, v) {
    var t = BLOCKS[ecl][v];
    var dataCodewords = t[1] * t[2] + t[3] * t[4];
    var bits = [];
    function put(val, len) { for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
    put(4, 4);
    put(bytes.length, v < 10 ? 8 : 16);
    for (var i = 0; i < bytes.length; i++) put(bytes[i], 8);
    var cap = dataCodewords * 8;
    for (var p = 0; p < 4 && bits.length < cap; p++) bits.push(0);
    while (bits.length % 8) bits.push(0);
    var out = [];
    for (var b = 0; b < bits.length; b += 8) {
      var byte = 0;
      for (var k = 0; k < 8; k++) byte = (byte << 1) | bits[b + k];
      out.push(byte);
    }
    var pad = [0xec, 0x11], pi = 0;
    while (out.length < dataCodewords) { out.push(pad[pi % 2]); pi++; }
    return out;
  }

  function makeBlocks(data, ecl, v) {
    var t = BLOCKS[ecl][v];
    var ecLen = t[0], blocks = [], pos = 0;
    function add(count, size) {
      for (var i = 0; i < count; i++) {
        var chunk = data.slice(pos, pos + size);
        pos += size;
        blocks.push({ data: chunk, ec: rsEncode(chunk, ecLen) });
      }
    }
    add(t[1], t[2]);
    add(t[3], t[4]);
    var maxData = 0;
    for (var i = 0; i < blocks.length; i++) maxData = Math.max(maxData, blocks[i].data.length);
    var final = [];
    for (var d = 0; d < maxData; d++) for (var b = 0; b < blocks.length; b++) if (d < blocks[b].data.length) final.push(blocks[b].data[d]);
    for (var e = 0; e < ecLen; e++) for (var c = 0; c < blocks.length; c++) final.push(blocks[c].ec[e]);
    return final;
  }

  /* ---------------------------------------------------------------- matrix */
  function maskFn(pattern, i, j) {
    switch (pattern) {
      case 0: return (i + j) % 2 === 0;
      case 1: return i % 2 === 0;
      case 2: return j % 3 === 0;
      case 3: return (i + j) % 3 === 0;
      case 4: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
      case 5: return ((i * j) % 2) + ((i * j) % 3) === 0;
      case 6: return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
      default: return (((i + j) % 2) + ((i * j) % 3)) % 2 === 0;
    }
  }

  function emptyMatrix(size) {
    var m = new Array(size);
    for (var i = 0; i < size; i++) { m[i] = new Array(size); for (var j = 0; j < size; j++) m[i][j] = null; }
    return m;
  }

  function placeFinder(m, size, r, c) {
    for (var i = -1; i <= 7; i++) {
      for (var j = -1; j <= 7; j++) {
        var rr = r + i, cc = c + j;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        var on = (i >= 0 && i <= 6 && (j === 0 || j === 6)) ||
          (j >= 0 && j <= 6 && (i === 0 || i === 6)) ||
          (i >= 2 && i <= 4 && j >= 2 && j <= 4);
        m[rr][cc] = on;
      }
    }
  }

  function placeFixed(m, size, v) {
    placeFinder(m, size, 0, 0);
    placeFinder(m, size, size - 7, 0);
    placeFinder(m, size, 0, size - 7);
    for (var i = 8; i < size - 8; i++) { m[i][6] = (i % 2 === 0); m[6][i] = (i % 2 === 0); }
    var pos = ALIGN[v] || [];
    for (var a = 0; a < pos.length; a++) {
      for (var b = 0; b < pos.length; b++) {
        var r = pos[a], c = pos[b];
        if ((r === 6 && c === 6) || (r === 6 && c === size - 7) || (r === size - 7 && c === 6)) continue;
        for (var y = -2; y <= 2; y++) {
          for (var x = -2; x <= 2; x++) {
            m[r + y][c + x] = (Math.max(Math.abs(y), Math.abs(x)) !== 1);
          }
        }
      }
    }
    /* reserve format areas */
    for (var f = 0; f < 9; f++) {
      if (m[8][f] === null) m[8][f] = false;
      if (m[f][8] === null) m[f][8] = false;
    }
    for (var g = 0; g < 8; g++) {
      if (m[8][size - 1 - g] === null) m[8][size - 1 - g] = false;
      if (m[size - 1 - g][8] === null) m[size - 1 - g][8] = false;
    }
    m[size - 8][8] = true;
    if (v >= 7) {
      var vb = VERSION_BITS[v];
      for (var k = 0; k < 18; k++) {
        var bit = ((vb >> k) & 1) === 1;
        m[Math.floor(k / 3)][size - 11 + (k % 3)] = bit;
        m[size - 11 + (k % 3)][Math.floor(k / 3)] = bit;
      }
    }
  }

  function placeData(m, size, data, pattern) {
    var inc = -1, row = size - 1, bitIndex = 7, byteIndex = 0;
    for (var col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--;
      for (; ;) {
        for (var c = 0; c < 2; c++) {
          if (m[row][col - c] === null) {
            var dark = false;
            if (byteIndex < data.length) dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
            if (maskFn(pattern, row, col - c)) dark = !dark;
            m[row][col - c] = dark;
            bitIndex--;
            if (bitIndex === -1) { byteIndex++; bitIndex = 7; }
          }
        }
        row += inc;
        if (row < 0 || row >= size) { row -= inc; inc = -inc; break; }
      }
    }
  }

  function formatBits(ecl, pattern) {
    var eclBits = { L: 1, M: 0, Q: 3, H: 2 }[ecl];
    var data = (eclBits << 3) | pattern;
    var rem = data;
    for (var i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    return ((data << 10) | rem) ^ 0x5412;
  }

  function placeFormat(m, size, ecl, pattern) {
    var bits = formatBits(ecl, pattern);
    for (var i = 0; i < 15; i++) {
      var mod = ((bits >> i) & 1) === 1;
      if (i < 6) m[i][8] = mod;
      else if (i < 8) m[i + 1][8] = mod;
      else m[size - 15 + i][8] = mod;
      if (i < 8) m[8][size - i - 1] = mod;
      else if (i < 9) m[8][15 - i - 1 + 1] = mod;
      else m[8][15 - i - 1] = mod;
    }
    m[size - 8][8] = true;
  }

  function penalty(m, size) {
    var p = 0, i, j, run, dark = 0;
    for (i = 0; i < size; i++) {
      run = 1;
      for (j = 1; j < size; j++) {
        if (m[i][j] === m[i][j - 1]) run++; else { if (run >= 5) p += 3 + (run - 5); run = 1; }
      }
      if (run >= 5) p += 3 + (run - 5);
      run = 1;
      for (j = 1; j < size; j++) {
        if (m[j][i] === m[j - 1][i]) run++; else { if (run >= 5) p += 3 + (run - 5); run = 1; }
      }
      if (run >= 5) p += 3 + (run - 5);
    }
    for (i = 0; i < size - 1; i++) {
      for (j = 0; j < size - 1; j++) {
        var c = m[i][j];
        if (c === m[i][j + 1] && c === m[i + 1][j] && c === m[i + 1][j + 1]) p += 3;
      }
    }
    for (i = 0; i < size; i++) for (j = 0; j < size; j++) if (m[i][j]) dark++;
    var total = size * size;
    p += Math.floor(Math.abs(dark * 20 - total * 10) / total) * 10;
    return p;
  }

  /* --------------------------------------------------------------- public */
  function encode(text, ecl) {
    var level = BLOCKS[ecl] ? ecl : 'M';
    var bytes = utf8(text);
    var v = chooseVersion(bytes, level);
    var data = makeBlocks(buildBytes(bytes, level, v), level, v);
    var size = 17 + v * 4;
    var best = null, bestScore = Infinity;
    for (var pattern = 0; pattern < 8; pattern++) {
      var m = emptyMatrix(size);
      placeFixed(m, size, v);
      placeData(m, size, data, pattern);
      placeFormat(m, size, level, pattern);
      var score = penalty(m, size);
      if (score < bestScore) { bestScore = score; best = m; }
    }
    return { size: size, version: v, modules: best };
  }

  function svg(text, px, ecl) {
    var qr = encode(text, ecl || 'M');
    var s = qr.size, mod = (px || 160) / s;
    var path = '';
    for (var i = 0; i < s; i++) {
      for (var j = 0; j < s; j++) {
        if (qr.modules[i][j]) path += 'M' + j + ' ' + i + 'h1v1h-1z';
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + (px || 160) + '" height="' + (px || 160) +
      '" viewBox="0 0 ' + s + ' ' + s + '" shape-rendering="crispEdges"><rect width="' + s + '" height="' + s +
      '" fill="#fff"/><path d="' + path + '" fill="#111"/></svg>';
  }

  CBE.qr = encode;
  CBE.qrSvg = svg;
})(typeof window !== 'undefined' ? window : this);
