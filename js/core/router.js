/* CBE Mobile Banking — screen router */
(function () {
  const reg = {};
  const stack = [];
  let current = null;

  CBE.router = {
    on(name, fn) { reg[name] = fn; },
    go(name, params, opts) {
      const fn = reg[name];
      if (!fn) { console.warn('no screen', name); return; }
      const node = fn(params || {}, opts || {});
      if (!node) return;
      const scr = document.getElementById('screen');
      scr.innerHTML = '';
      scr.appendChild(node);
      const sc = node.querySelector('.scroll');
      if (sc) sc.scrollTop = 0;
      stack.push({name, params: params || {}});
      current = {name, params: params || {}, node};
      document.body.classList.remove('is-obscured');
      if (typeof CBE.guard !== 'undefined') CBE.guard.refresh();
    },
    replace(name, params, opts) {
      stack.pop();
      CBE.router.go(name, params, opts);
    },
    back() {
      if (CBE.ui._sheetClose) { CBE.ui.closeSheet(); return; }
      if (stack.length > 1) {
        stack.pop();
        const top = stack[stack.length - 1];
        const fn = reg[top.name];
        if (!fn) return;
        const node = fn(top.params, {});
        const scr = document.getElementById('screen');
        scr.innerHTML = '';
        scr.appendChild(node);
        current = {name: top.name, params: top.params, node};
        document.body.classList.remove('is-obscured');
        if (typeof CBE.guard !== 'undefined') CBE.guard.refresh();
      } else {
        CBE.router.go('home');
      }
    },
    reset(name) {
      stack.length = 0;
      CBE.router.go(name, {}, {});
    },
    currentName() { return current ? current.name : ''; }
  };
})();
