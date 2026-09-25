/* CBE Mobile Banking — global namespace + helpers */
window.CBE = window.CBE || {};

CBE.util = {
  esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  },
  fmt(n) {
    return Number(n || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  },
  fmt0(n) {
    return Number(n || 0).toLocaleString('en-US');
  },
  mask(acc) {
    const s = String(acc || '');
    if (s.length < 6) return s;
    return s[0] + '********' + s.slice(-4);
  },
  maskStar(acc) {
    const s = String(acc || '');
    if (s.length < 6) return s;
    return s[0] + '****' + s.slice(-4);
  },
  now() {
    const d = new Date();
    const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const h24 = d.getHours(), m = d.getMinutes();
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    let h = h24 % 12; if (h === 0) h = 12;
    const mm = m < 10 ? '0' + m : '' + m;
    return M[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + ', ' + h + ':' + mm + ' ' + ampm;
  },
  homeStamp() {
    const d = new Date();
    const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const h24 = d.getHours(), m = d.getMinutes();
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    let h = h24 % 12; if (h === 0) h = 12;
    const mm = m < 10 ? '0' + m : '' + m;
    return d.getDate() + ' ' + M[d.getMonth()] + ' ' + d.getFullYear() + ' \u00b7 ' + h + ':' + mm + ' ' + ampm;
  },
  txId() {
    // FT + YYDDD + 6 random alnum  (like FT26253C0DV1)
    const d = new Date();
    const start = new Date(d.getFullYear(), 0, 0);
    const doy = Math.floor((d - start) / 864e5);
    const yy = String(d.getFullYear()).slice(2);
    const ddd = String(doy).padStart(3, '0');
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
    let r = '';
    for (let i = 0; i < 6; i++) r += chars[Math.floor(Math.random() * chars.length)];
    return 'FT' + yy + ddd + r;
  },
  amountWords(n) {
    n = Math.round(Number(n) * 100) / 100;
    const birr = Math.floor(n);
    const cents = Math.round((n - birr) * 100);
    const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    function under1000(x) {
      let s = '';
      if (x >= 100) { s += ones[Math.floor(x / 100)] + ' Hundred'; x %= 100; if (x) s += ' '; }
      if (x >= 20) { s += tens[Math.floor(x / 10)]; x %= 10; if (x) s += ' ' + ones[x]; }
      else if (x > 0) s += ones[x];
      return s;
    }
    function whole(x) {
      let s = '';
      const bil = Math.floor(x / 1e9); x %= 1e9;
      const mil = Math.floor(x / 1e6); x %= 1e6;
      const tho = Math.floor(x / 1e3); x %= 1e3;
      let parts = [];
      if (bil) parts.push(under1000(bil) + ' Billion');
      if (mil) parts.push(under1000(mil) + ' Million');
      if (tho) parts.push(under1000(tho) + ' Thousand');
      if (x) parts.push(under1000(x));
      return parts.join(' ');
    }
    let out = birr === 0 ? 'Zero' : whole(birr);
    out += ' ETB';
    if (cents > 0) out += ' and ' + whole(cents) + ' cents';
    return out;
  },
  initials(name) {
    return String(name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
  },
  vibrate(ms) {
    try { if (navigator.vibrate) navigator.vibrate(ms || 10); } catch (e) {}
  }
};

CBE.qr = null; // filled by qr.js
