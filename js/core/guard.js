/* CBE Mobile Banking — screen protection (honest browser-level guard).
   A web page cannot fully block OS screenshots, but we:
   - blur the whole screen whenever the page loses focus / visibility (hides app-switcher preview too)
   - swallow PrintScreen / Win+Shift+S style shortcuts, Ctrl+P, Ctrl+S
   - clear the clipboard after PrintScreen keypress
   - block context menu, drag and text selection on guarded screens */
(function () {
  let armed = false;

  function onKey(e) {
    const k = (e.key || '').toLowerCase();
    if (k === 'printscreen' || k === 'snapshot') {
      obscureBurst();
      try { navigator.clipboard.writeText(' '); } catch (err) {}
      e.preventDefault();
      return;
    }
    if ((e.metaKey || e.ctrlKey) && (k === 'p' || k === 's')) {
      e.preventDefault();
      obscureBurst();
      return;
    }
    if (e.metaKey && e.shiftKey && (k === 's' || k === '3' || k === '4' || k === '5')) {
      obscureBurst();
      e.preventDefault();
    }
  }

  function obscureBurst() {
    document.body.classList.add('is-obscured');
    setTimeout(() => {
      if (!document.hidden && document.hasFocus()) document.body.classList.remove('is-obscured');
    }, 1500);
  }

  function onBlur() {
    if (armed) document.body.classList.add('is-obscured');
  }
  function onFocus() {
    if (!document.hidden) document.body.classList.remove('is-obscured');
  }
  function onVis() {
    if (armed && (document.hidden || !document.hasFocus())) document.body.classList.add('is-obscured');
    else document.body.classList.remove('is-obscured');
  }
  function onCtx(e) {
    if (armed) e.preventDefault();
  }
  function onDrag(e) {
    if (armed) e.preventDefault();
  }
  function onCopy(e) {
    if (armed) {
      e.clipboardData.setData('text/plain', ' ');
      e.preventDefault();
    }
  }

  CBE.guard = {
    boot() {
      window.addEventListener('blur', onBlur);
      window.addEventListener('focus', onFocus);
      document.addEventListener('visibilitychange', onVis);
      window.addEventListener('focus', onVis);
      document.addEventListener('keydown', onKey, true);
      document.addEventListener('contextmenu', onCtx);
      document.addEventListener('dragstart', onDrag);
      document.addEventListener('copy', onCopy);
      document.addEventListener('cut', onCopy);
    },
    refresh() {
      const scr = document.querySelector('#screen .page');
      armed = !!(scr && scr.classList.contains('is-guarded'));
      if (!armed) document.body.classList.remove('is-obscured');
      else onVis();
    },
    obscure() { obscureBurst(); }
  };
})();
