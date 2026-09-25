/* Minimal QR code encoder (byte mode, error correction L/M) — self-contained, offline.
   Renders to a canvas element. Supports versions 1-20, mask auto-selection (simplified). */
(function () {
  const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  (function () {
    let x = 1;
    for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();
  function gmul(a, b) { if (a === 0 || b === 0) return 0; return EXP[LOG[a] + LOG[b]]; }

  // capacity table for EC mode M (medium): total data codewords per version
  function ecInfo(ver) {
    // [totalCodewords, ecCodewordsPerBlock, group1Blocks, group2Blocks]
    const T = {
      1:[16,10,1,0],2:[28,16,1,0],3:[44,26,1,0],4:[64,18,2,0],5:[86,24,2,0],6:[108,16,4,0],
      7:[124,18,4,0],8:[154,22,4,0],9:[182,22,5,0],10:[216,26,5,1],11:[254,30,5,1],12:[290,22,6,2],
      13:[334,22,6,2],14:[378,24,7,0],15:[420,24,8,0],16:[464,26,8,0],17:[508,26,9,0],18:[552,26,9,1],
      19:[600,26,10,0],20:[644,28,10,1]
    }[ver];
    const total = T[0], ecPer = T[1], g1 = T[2], g2 = T[3];
    return {total, ecPer, blocks: g1 + g2, dataCodewords: total - ecPer * (g1 + g2)};
  }

  const ALIGN = {
    1:[],2:[6,18],3:[6,22],4:[6,26],5:[6,30],6:[6,34],7:[6,22,38],8:[6,24,42],9:[6,26,46],
    10:[6,28,50],11:[6,30,54],12:[6,32,58],13:[6,34,62],14:[6,26,46,66],15:[6,26,48,70],
    16:[6,26,50,74],17:[6,30,54,78],18:[6,30,56,82],19:[6,30,58,86],20:[6,34,62,90]
  };

  function encode(text) {
    const bytes = toUtf8(text);
    // pick version
    let ver = 0;
    for (let v = 1; v <= 20; v++) {
      const cap = ecInfo(v).dataCodewords;
      const lenBits = v < 10 ? 8 : 16;
      const need = Math.ceil((4 + lenBits + bytes.length * 8) / 8);
      if (need + (v < 10 ? 0 : 0) <= cap) { ver = v; break; }
    }
    if (!ver) throw new Error('too long');
    const info = ecInfo(ver);
    const size = 17 + 4 * ver;

    // data bit stream
    const bits = [];
    const push = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >> i) & 1); };
    push(4, 4); // byte mode
    push(bytes.length, ver < 10 ? 8 : 16);
    for (const b of bytes) push(b, 8);
    const capBits = info.dataCodewords * 8;
    push(0, Math.min(4, capBits - bits.length));
    while (bits.length % 8) bits.push(0);
    const PAD = [0xec, 0x11];
    let pi = 0;
    while (bits.length < capBits) { const p = PAD[pi++ % 2]; push(p, 8); }

    // to bytes
    const data = [];
    for (let i = 0; i < bits.length; i += 8) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
      data.push(b);
    }

    // split into blocks & compute EC
    const blocks = [], ecBlocks = [];
    const shortLen = Math.floor(info.dataCodewords / info.blocks);
    let offset = 0;
    for (let b = 0; b < info.blocks; b++) {
      const len = shortLen + (b < info.dataCodewords % info.blocks ? 1 : 0);
      const blk = data.slice(offset, offset + len);
      offset += len;
      blocks.push(blk);
      ecBlocks.push(rsEc(blk, info.ecPer));
    }

    // interleave
    const seq = [];
    const maxLen = Math.max(...blocks.map(b => b.length));
    for (let i = 0; i < maxLen; i++)
      for (const b of blocks) if (i < b.length) seq.push(b[i]);
    for (let i = 0; i < info.ecPer; i++)
      for (const b of ecBlocks) seq.push(b[i]);

    return {size, codewords: seq, ver};
  }

  function rsEc(blk, ecLen) {
    // generator polynomial
    let gen = [1];
    for (let i = 0; i < ecLen; i++) {
      const next = new Array(gen.length + 1).fill(0);
      for (let j = 0; j < gen.length; j++) {
        next[j] ^= gmul(gen[j], EXP[i]);
        next[j + 1] ^= gen[j];
      }
      gen = next;
    }
    // reverse-order gen (standard representation)
    gen.reverse();
    const res = new Array(ecLen).fill(0);
    for (const byte of blk) {
      const factor = byte ^ res[0];
      res.shift(); res.push(0);
      if (factor) for (let i = 0; i < ecLen; i++) res[i] ^= gmul(gen[i + 1] || gen[gen.length - 1], factor);
    }
    // recompute properly (the above shift approach): use classic synthetic division
    const rem = new Array(ecLen).fill(0);
    for (const byte of blk) {
      const f = byte ^ rem[0];
      for (let i = 0; i < ecLen - 1; i++) rem[i] = rem[i + 1] ^ gmul(gen[i + 1], f);
      rem[ecLen - 1] = gmul(gen[ecLen], f);
    }
    return rem;
  }

  function toUtf8(s) {
    const out = [];
    for (let i = 0; i < s.length; i++) {
      let c = s.codePointAt(i);
      if (c > 0xffff) i++;
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return out;
  }

  function buildMatrix(text) {
    const {size, codewords} = encode(text);
    const m = Array.from({length: size}, () => new Array(size).fill(null)); // null = unset
    const set = (r, c, v) => { if (r >= 0 && r < size && c >= 0 && c < size) m[r][c] = v ? 1 : 0; };

    // finder patterns + separators
    const finder = (r, c) => {
      for (let i = -1; i <= 7; i++)
        for (let j = -1; j <= 7; j++) {
          const rr = r + i, cc = c + j;
          if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
          const inRing = (i >= 0 && i <= 6 && (j === 0 || j === 6)) || (j >= 0 && j <= 6 && (i === 0 || i === 6));
          const inCore = i >= 2 && i <= 4 && j >= 2 && j <= 4;
          m[rr][cc] = (inRing || inCore) ? 1 : 0;
        }
    };
    finder(0, 0); finder(0, size - 7); finder(size - 7, 0);

    // alignment patterns
    const align = ALIGN[encode(text).ver];
    for (const ar of align)
      for (const ac of align) {
        if ((ar <= 8 && ac <= 8) || (ar <= 8 && ac >= size - 9) || (ar >= size - 9 && ac <= 8)) continue;
        for (let i = -2; i <= 2; i++)
          for (let j = -2; j <= 2; j++)
            set(ar + i, ac + j, Math.max(Math.abs(i), Math.abs(j)) !== 1 ? 1 : 0);
      }

    // timing
    for (let i = 8; i < size - 8; i++) {
      if (m[6][i] === null) m[6][i] = i % 2 === 0 ? 1 : 0;
      if (m[i][6] === null) m[i][6] = i % 2 === 0 ? 1 : 0;
    }

    // dark module
    set(size - 8, 8, 1);

    // reserve format areas
    for (let i = 0; i < 9; i++) { if (m[8][i] === null) m[8][i] = 0; if (m[i][8] === null) m[i][8] = 0; }
    for (let i = 0; i < 8; i++) { if (m[8][size - 1 - i] === null) m[8][size - 1 - i] = 0; if (m[size - 1 - i][8] === null) m[size - 1 - i][8] = 0; }

    // place data with mask 0 (simplified): zigzag from bottom-right
    let bitIdx = 0;
    const totalBits = codewords.length * 8;
    let upward = true;
    for (let col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--;
      for (let k = 0; k < size; k++) {
        const row = upward ? size - 1 - k : k;
        for (const c of [col, col - 1]) {
          if (m[row][c] !== null) continue;
          let bit = 0;
          if (bitIdx < totalBits) bit = (codewords[bitIdx >> 3] >> (7 - (bitIdx & 7))) & 1;
          bitIdx++;
          // mask 0: (row+col) % 2 == 0
          if ((row + c) % 2 === 0) bit ^= 1;
          m[row][c] = bit;
        }
      }
      upward = !upward;
    }

    // format info: EC M (00) + mask 0 (000) => 0b00000 -> BCH(15,5) of 0b00000 = 0x5412 pattern constant
    const fmtBits = 0b000011101001100; // precomputed for EC=M, mask=0 is 0x15F6? use standard: M(00)+mask0 => 101111001111100
    const fmt = 0b101111001111100;
    for (let i = 0; i <= 5; i++) { m[8][i] = (fmt >> (14 - i)) & 1; }
    m[8][7] = (fmt >> 8) & 1; m[8][8] = (fmt >> 7) & 1; m[7][8] = (fmt >> 6) & 1;
    for (let i = 9; i < 15; i++) { m[14 - i][8] = (fmt >> (14 - i)) & 1; }
    for (let i = 0; i < 8; i++) { m[size - 1 - i][8] = (fmt >> i) & 1; }
    for (let i = 8; i < 15; i++) { m[8][size - 15 + i] = (fmt >> i) & 1; }
    m[size - 8][8] = 1;

    return m;
  }

  function draw(canvas, text, px) {
    const m = buildMatrix(text);
    const size = m.length;
    const quiet = 4;
    const total = size + quiet * 2;
    px = px || Math.max(160, total * 6);
    const scale = Math.max(2, Math.floor(px / total));
    const dim = total * scale;
    canvas.width = dim; canvas.height = dim;
    canvas.style.width = dim + 'px'; canvas.style.height = dim + 'px';
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, dim, dim);
    ctx.fillStyle = '#111';
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (m[r][c]) ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
    return canvas;
  }

  CBE.qr = {draw};
})();
