/* CBE Mobile Banking — UI helpers: pages, appbar, sheets, toast, fields */
(function () {
  const U = CBE.util;

  CBE.ui = {
    el(html) {
      const t = document.createElement('template');
      t.innerHTML = html.trim();
      return t.content.firstElementChild;
    },

    page(opts, bodyHtml) {
      const cls = ['page', opts.cls || ''].join(' ');
      const guarded = opts.guard ? ' is-guarded' : '';
      const html =
        '<div class="' + cls + guarded + '" data-screen="' + (opts.screen || '') + '">' +
        (opts.appbar === false ? '' : CBE.ui.appbar(opts)) +
        '<div class="scroll">' + (bodyHtml || '') + '</div>' +
        (opts.tabs ? CBE.ui.tabbar(opts.tabs) : '') +
        '</div>';
      return CBE.ui.el(html);
    },

    appbar(o) {
      if (o.appbar === false) return '';
      const light = o.light ? ' light' : '';
      return (
        '<div class="appbar' + light + '">' +
        (o.back ? '<button class="back" data-a="back">' + CBE.icon('back', 22) + '</button>' : '') +
        '<h1>' + U.esc(o.title || '') + '</h1>' +
        (o.search ? '<button class="bar-action" data-a="noop">' + CBE.icon('search', 21) + '</button>' : '') +
        '</div>'
      );
    },

    tabbar(active) {
      const items = [
        ['home', 'Home', 'home'],
        ['transactions', 'Transactions', 'bank'],
        ['settings', 'Settings', 'gear']
      ];
      return (
        '<nav class="tabbar">' +
        items.map(([s, lb, ic]) =>
          '<button class="tab' + (s === active ? ' active' : '') + '" data-a="tab" data-s="' + s + '">' +
          '<span class="pill">' + CBE.icon(ic, 22) + '</span>' + lb + '</button>'
        ).join('') +
        '</nav>'
      );
    },

    toast(msg) {
      const layer = document.getElementById('toast');
      layer.innerHTML = '<div class="toast">' + U.esc(msg) + '</div>';
      clearTimeout(CBE.ui._tt);
      CBE.ui._tt = setTimeout(() => { layer.innerHTML = ''; }, 2200);
    },

    sheet(html, onReady) {
      const layer = document.getElementById('sheet');
      layer.innerHTML = '<div class="veil" data-a="sheetClose"></div><div class="sheet"><div class="grab"></div>' + html + '</div>';
      const veil = layer.querySelector('.veil');
      const sh = layer.querySelector('.sheet');
      requestAnimationFrame(() => { veil.classList.add('show'); sh.classList.add('show'); });
      if (onReady) onReady(sh);
      CBE.ui._sheetClose = function () {
        veil.classList.remove('show');
        sh.classList.remove('show');
        setTimeout(() => { layer.innerHTML = ''; }, 240);
      };
      return sh;
    },
    closeSheet() { if (CBE.ui._sheetClose) CBE.ui._sheetClose(); },

    field(o) {
      let inner;
      if (o.select) {
        inner = '<select id="' + o.id + '">' +
          (o.options || []).map(op => '<option value="' + U.esc(op[0]) + '">' + U.esc(op[1]) + '</option>').join('') +
          '</select>';
      } else {
        inner = '<input id="' + o.id + '" type="' + (o.type || 'text') + '" placeholder="' + U.esc(o.ph || '') + '"' +
          (o.max ? ' maxlength="' + o.max + '"' : '') +
          (o.inputmode ? ' inputmode="' + o.inputmode + '"' : '') +
          (o.value ? ' value="' + U.esc(o.value) + '"' : '') +
          (o.inpId ? ' data-in="' + o.inpId + '"' : '') + '>';
      }
      return (
        '<div class="field">' +
        '<label>' + U.esc(o.label || '') + '</label>' +
        '<div class="control">' + inner +
        (o.icon ? '<span class="hint-ic">' + CBE.icon(o.icon, 20) + '</span>' : '') +
        '</div>' +
        (o.owner ? '<div id="' + o.owner + '" class="acc-owner" style="display:none"></div>' : '') +
        '</div>'
      );
    },

    pinPad(o) {
      let keys = '';
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 'fp', 0, 'del'].forEach(k => {
        if (k === 'fp') keys += '<button class="key muted" data-a="' + (o.fpAction || 'noop') + '">' + CBE.icon('fingerprint', 26) + '</button>';
        else if (k === 'del') keys += '<button class="key muted" data-a="pinDel">' + CBE.icon('close', 24) + '</button>';
        else keys += '<button class="key" data-a="pinKey" data-k="' + k + '">' + k + '</button>';
      });
      let dots = '';
      for (let i = 0; i < (o.len || 4); i++) dots += '<span class="pin-dot"></span>';
      return '<div class="pin-dots" id="pinDots">' + dots + '</div><div class="pad">' + keys + '</div>';
    },

    rowItem(o) {
      const logo = o.logo ? CBE.logo(o.logo) : (o.mono ? CBE.mono(o.mono) : '<span class="mono">' + CBE.icon(o.ic || 'doc', 20) + '</span>');
      return (
        '<button class="row-item" data-a="' + (o.a || 'noop') + '"' + (o.data || '') + '>' +
        logo +
        '<span class="tx"><span class="tt">' + U.esc(o.t) + '</span>' +
        (o.s ? '<span class="ss">' + U.esc(o.s) + '</span>' : '') +
        '</span>' +
        '<span class="chev">' + CBE.icon('chev', 18) + '</span>' +
        '</button>'
      );
    }
  };
})();
