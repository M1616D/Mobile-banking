/* =========================================================================
   qr.js — self-contained QR Code encoder (byte mode, versions 1..20, L/M/Q)
   No dependencies, no network: the app must render receipts fully offline.
   ========================================================================= */
(function (global) {
  "use strict";

  /* Reed-Solomon block structure: [ecPerBlock, g1Blocks, g1Data, g2Blocks, g2Data] */
  var BLOCKS = {
    L: [[7, 1, 19, 0, 0], [10, 1, 34, 0, 0], [15, 1, 55, 0, 0], [20, 1, 80, 0, 0], [26, 1, 108, 0, 0],
      [18, 2, 68, 0, 0], [20, 2, 78, 0, 0], [24, 2, 97, 0, 0], [30, 2, 116, 0, 0], [18, 2, 68, 2, 69],
      [20, 4, 81, 0, 0], [24, 2, 92, 2, 93], [26, 4, 107, 0, 0], [30, 3, 115, 1, 116], [22, 5, 87, 1, 88],
      [24, 5, 98, 1, 99], [28, 1, 107, 5, 108], [30, 5, 120, 1, 121], [28, 3, 113, 4, 114], [28, 3, 107, 5, 108]],
    M: [[10, 1, 16, 0, 0], [16, 1, 28, 0, 0], [26, 1, 44, 0, 0], [18, 2, 32, 0, 0], [24, 2, 43, 0, 0],
      [16, 4, 27, 0, 0], [18, 4, 31, 0, 0], [22, 2, 38, 2, 39], [22, 3, 36, 2, 37], [26, 4, 43, 1, 44],
      [30, 1, 50, 4, 51], [22, 6, 36, 2, 37], [22, 8, 37, 1, 38], [24, 4, 40, 5, 41], [24, 5, 41, 5, 42],
      [28, 7, 45, 3, 46], [28, 10, 46, 1, 47], [26, 9, 43, 4, 44], [26, 3, 44, 11, 45], [26, 3, 41, 13, 42]],
    Q: [[13, 1, 13, 0, 0], [22, 1, 22, 0, 0], [18, 2, 17, 0, 0], [26, 2, 24, 0, 0], [18, 2, 15, 2, 16],
      [24, 4, 19, 0, 0], [18, 2, 14, 4, 15], [22, 4, 18, 2, 19], [20, 4, 16, 4, 17], [24, 6, 19, 2, 20],
      [28, 4, 22, 4, 23], [26, 4, 20, 6, 21], [24, 8, 20, 4, 21], [20, 11, 16, 5, 17], [30, 5, 24, 7, 25],
      [24, 15, 19, 2, 20], [28, 1, 22, 15, 23], [28, 17, 22, 1, 23], [26, 17, 21, 4, 22], [30, 15, 24, 5, 25]]
  };
  var ECC_BITS = { L: 1, M: 0, Q: 3, H: 2 };

  /* ---------------------------------------------------------- GF(256) ---- */
  var EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  (function () {
    var x = 1;
    for (var i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; }
    for (var j = 255; j < 512; j++) EXP[j] = EXP[j - 255];
  })();
  function gmul(a, b) { return (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]]; }

  function genPoly(deg) {
    var g = [1];
    for (var i = 0; i < deg; i++) {
      var next = new Array(g.length + 1).fill(0);
      for (var j = 0; j < g.length; j++) {
        next[j] ^= g[j];
        next[j + 1] ^= gmul(g[j], EXP[i]);
      }
      g = next;
    }
    return g;
  }

  /* LFSR remainder division — identical maths to the reference implementation */
  function rsRemainder(data, deg) {
    var gen = genPoly(deg);
    var res = new Uint8Array(deg);
    for (var k = 0; k < data.length; k++) {
      var factor = data[k] ^ res[0];
      res.copyWithin(0, 1);
      res[deg - 1] = 0;
      for (var i = 0; i < deg; i++) res[i] ^= gmul(gen[i + 1], factor);
    }
    return res;
  }

  /* --------------------------------------------------------- bit buffer -- */
  function BitBuf() { this.bits = []; }
  BitBuf.prototype.put = function (val, len) {
    for (var i = len - 1; i >= 0; i--) this.bits.push((val >>> i) & 1);
  };

  function utf8Bytes(str) {
    var out = [], s = unescape(encodeURIComponent(str));
    for (var i = 0; i < s.length; i++) out.push(s.charCodeAt(i) & 0xff);
    return out;
  }

  function capacityBytes(ver, ecc) {
    var b = BLOCKS[ecc][ver - 1];
    var dataCodewords = b[1] * b[2] + b[3] * b[4];
    var ccBits = ver <= 9 ? 8 : 16;
    return { codewords: dataCodewords, maxBytes: dataCodewords - Math.ceil((4 + ccBits) / 8) - 1 };
  }

  function pickVersion(len, ecc) {
    for (var v = 1; v <= 20; v++) if (capacityBytes(v, ecc).maxBytes >= len) return v;
    return 0;
  }

  /* ------------------------------------------------------ RS block build -- */
  function buildCodewords(bytes, ver, ecc) {
    var b = BLOCKS[ecc][ver - 1];
    var ecLen = b[0], g1 = b[1], d1 = b[2], g2 = b[3], d2 = b[4];
    var totalData = g1 * d1 + g2 * d2;
    var ccBits = ver <= 9 ? 8 : 16;

    var bb = new BitBuf();
    bb.put(4, 4);                 // byte mode
    bb.put(bytes.length, ccBits); // character count
    for (var i = 0; i < bytes.length; i++) bb.put(bytes[i], 8);
    // terminator + pad to byte boundary
    var cap = totalData * 8;
    bb.put(0, Math.min(4, cap - bb.bits.length));
    while (bb.bits.length % 8 !== 0) bb.bits.push(0);

    var data = [];
    for (var p = 0; p < bb.bits.length; p += 8) {
      var byte = 0;
      for (var q = 0; q < 8; q++) byte = (byte << 1) | bb.bits[p + q];
      data.push(byte);
    }
    var pad = [0xEC, 0x11], pi = 0;
    while (data.length < totalData) data.push(pad[pi++ % 2]);

    // split into blocks, add error correction, then interleave
    var blocks = [], offset = 0;
    for (var bi = 0; bi < g1 + g2; bi++) {
      var dl = bi < g1 ? d1 : d2;
      var dat = data.slice(offset, offset + dl); offset += dl;
      blocks.push({ data: dat, ec: rsRemainder(dat, ecLen) });
    }
    var out = [];
    var maxData = Math.max(d1, d2);
    for (var c = 0; c < maxData; c++)
      for (var k = 0; k < blocks.length; k++)
        if (c < blocks[k].data.length) out.push(blocks[k].data[c]);
    for (var c2 = 0; c2 < ecLen; c2++)
      for (var k2 = 0; k2 < blocks.length; k2++) out.push(blocks[k2].ec[c2]);
    return out;
  }

  /* ------------------------------------------------------------ matrix -- */
  function alignmentPositions(ver) {
    if (ver === 1) return [];
    var num = Math.floor(ver / 7) + 2;
    var step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (num * 2 - 2)) * 2;
    var res = [6];
    for (var pos = ver * 4 + 10; res.length < num; pos -= step) res.splice(1, 0, pos);
    return res;
  }

  function versionBits(ver) {
    var rem = ver;
    for (var i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
    return (ver << 12) | rem;
  }

  function formatBits(ecc, mask) {
    var data = (ECC_BITS[ecc] << 3) | mask;
    var rem = data;
    for (var i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    return ((data << 10) | rem) ^ 0x5412;
  }

  function Matrix(size) {
    this.size = size;
    this.m = new Uint8Array(size * size);
    this.fn = new Uint8Array(size * size);
  }
  Matrix.prototype.set = function (x, y, dark) { this.m[y * this.size + x] = dark ? 1 : 0; };
  Matrix.prototype.get = function (x, y) { return this.m[y * this.size + x]; };
  Matrix.prototype.setFn = function (x, y, dark) {
    if (x < 0 || y < 0 || x >= this.size || y >= this.size) return;
    this.m[y * this.size + x] = dark ? 1 : 0;
    this.fn[y * this.size + x] = 1;
  };

  function drawFinder(m, cx, cy) {
    for (var dy = -4; dy <= 4; dy++) {
      for (var dx = -4; dx <= 4; dx++) {
        var d = Math.max(Math.abs(dx), Math.abs(dy));
        m.setFn(cx + dx, cy + dy, d !== 2 && d !== 4);
      }
    }
  }

  function drawAlign(m, cx, cy) {
    for (var dy = -2; dy <= 2; dy++)
      for (var dx = -2; dx <= 2; dx++)
        m.setFn(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }

  function drawFormat(m, ecc, mask) {
    var bits = formatBits(ecc, mask), n = m.size;
    for (var i = 0; i <= 5; i++) m.setFn(8, i, ((bits >>> i) & 1) !== 0);
    m.setFn(8, 7, ((bits >>> 6) & 1) !== 0);
    m.setFn(8, 8, ((bits >>> 7) & 1) !== 0);
    m.setFn(7, 8, ((bits >>> 8) & 1) !== 0);
    for (var j = 9; j < 15; j++) m.setFn(14 - j, 8, ((bits >>> j) & 1) !== 0);
    for (var k = 0; k < 8; k++) m.setFn(n - 1 - k, 8, ((bits >>> k) & 1) !== 0);
    for (var l = 8; l < 15; l++) m.setFn(8, n - 15 + l, ((bits >>> l) & 1) !== 0);
    m.setFn(8, n - 8, true);
  }

  function drawFunctionPatterns(m, ver, ecc) {
    var n = m.size, i, j;
    for (i = 0; i < n; i++) {
      m.setFn(6, i, i % 2 === 0);
      m.setFn(i, 6, i % 2 === 0);
    }
    drawFinder(m, 3, 3); drawFinder(m, n - 4, 3); drawFinder(m, 3, n - 4);
    var ap = alignmentPositions(ver);
    for (i = 0; i < ap.length; i++)
      for (j = 0; j < ap.length; j++) {
        if ((i === 0 && j === 0) || (i === 0 && j === ap.length - 1) || (i === ap.length - 1 && j === 0)) continue;
        drawAlign(m, ap[i], ap[j]);
      }
    drawFormat(m, ecc, 0);
    if (ver >= 7) {
      var vb = versionBits(ver);
      for (i = 0; i < 18; i++) {
        var bit = ((vb >>> i) & 1) !== 0;
        var a = n - 11 + (i % 3), b = Math.floor(i / 3);
        m.setFn(a, b, bit);
        m.setFn(b, a, bit);
      }
    }
  }

  function drawCodewords(m, codewords) {
    var n = m.size, i = 0, up = true;
    for (var right = n - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < n; vert++) {
        var y = up ? n - 1 - vert : vert;
        for (var c = 0; c < 2; c++) {
          var x = right - c;
          if (m.fn[y * n + x]) continue;
          var bit = 0;
          if (i < codewords.length * 8) bit = (codewords[i >>> 3] >>> (7 - (i & 7))) & 1;
          m.set(x, y, bit === 1);
          i++;
        }
      }
      up = !up;
    }
  }

  function maskBit(mask, x, y) {
    switch (mask) {
      case 0: return (x + y) % 2 === 0;
      case 1: return y % 2 === 0;
      case 2: return x % 3 === 0;
      case 3: return (x + y) % 3 === 0;
      case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
      case 5: return ((x * y) % 2) + ((x * y) % 3) === 0;
      case 6: return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
      case 7: return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
    }
    return false;
  }

  function applyMask(m, mask) {
    var n = m.size;
    for (var y = 0; y < n; y++)
      for (var x = 0; x < n; x++)
        if (!m.fn[y * n + x] && maskBit(mask, x, y)) m.m[y * n + x] ^= 1;
  }

  function penalty(m) {
    var n = m.size, score = 0, x, y, i, run, dark = 0;

    // rule 1: runs of 5+
    for (y = 0; y < n; y++) {
      run = 1;
      for (x = 1; x < n; x++) {
        if (m.get(x, y) === m.get(x - 1, y)) run++;
        else { if (run >= 5) score += run - 2; run = 1; }
      }
      if (run >= 5) score += run - 2;
    }
    for (x = 0; x < n; x++) {
      run = 1;
      for (y = 1; y < n; y++) {
        if (m.get(x, y) === m.get(x, y - 1)) run++;
        else { if (run >= 5) score += run - 2; run = 1; }
      }
      if (run >= 5) score += run - 2;
    }
    // rule 2: 2x2 blocks
    for (y = 0; y < n - 1; y++)
      for (x = 0; x < n - 1; x++) {
        var c = m.get(x, y);
        if (c === m.get(x + 1, y) && c === m.get(x, y + 1) && c === m.get(x + 1, y + 1)) score += 3;
      }
    // rule 3: finder-like patterns (1011101 with 4 light modules on a side)
    var P1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
    var P2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
    function scan(get) {
      for (var s = 0; s + 11 <= n; s++) {
        var a = true, b = true;
        for (var t = 0; t < 11; t++) {
          var v = get(s + t);
          if (v !== P1[t]) a = false;
          if (v !== P2[t]) b = false;
        }
        if (a) score += 40;
        if (b) score += 40;
      }
    }
    for (y = 0; y < n; y++) scan((function (yy) { return function (x2) { return m.get(x2, yy); }; })(y));
    for (x = 0; x < n; x++) scan((function (xx) { return function (y2) { return m.get(xx, y2); }; })(x));
    // rule 4: dark/light balance
    for (i = 0; i < n * n; i++) if (m.m[i]) dark++;
    var total = n * n;
    var k = Math.floor(Math.abs(dark * 20 - total * 10) / total);
    score += k * 10;
    return score;
  }

  function encode(text, eccLevel) {
    var ecc = eccLevel || "M";
    var bytes = utf8Bytes(String(text));
    var ver = pickVersion(bytes.length, ecc);
    if (!ver) { // too long: fall back to L, then to a shorter payload
      ecc = "L";
      ver = pickVersion(bytes.length, ecc);
      if (!ver) throw new Error("qr: payload too long (" + bytes.length + " bytes)");
    }
    var codewords = buildCodewords(bytes, ver, ecc);
    var n = ver * 4 + 17;
    var m = new Matrix(n);
    drawFunctionPatterns(m, ver, ecc);
    drawCodewords(m, codewords);
    var best = 0, bestScore = Infinity;
    for (var mask = 0; mask < 8; mask++) {
      applyMask(m, mask);
      drawFormat(m, ecc, mask);
      var s = penalty(m);
      if (s < bestScore) { bestScore = s; best = mask; }
      applyMask(m, mask); // undo
    }
    applyMask(m, best);
    drawFormat(m, ecc, best);
    return { size: n, modules: m, version: ver, ecc: ecc, mask: best };
  }

  /* render into a canvas, scaled to fit `px` css pixels */
  function draw(canvas, text, px, eccLevel, quiet) {
    var qr = encode(text, eccLevel);
    var q = quiet === undefined ? 2 : quiet;
    var total = qr.size + q * 2;
    var scale = Math.max(1, Math.floor((px || 160) / total));
    var dim = total * scale;
    canvas.width = dim; canvas.height = dim;
    canvas.style.width = px + "px"; canvas.style.height = px + "px";
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, dim, dim);
    ctx.fillStyle = "#111111";
    for (var y = 0; y < qr.size; y++)
      for (var x = 0; x < qr.size; x++)
        if (qr.modules.get(x, y)) ctx.fillRect((x + q) * scale, (y + q) * scale, scale, scale);
    return qr;
  }

  global.QR = { encode: encode, draw: draw };
})(window);
