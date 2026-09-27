/* =========================================================================
   router.js — screen stack.
   Screens register a factory returning { el, mount? , onBack? , secure? }.
   Push animates in, back pops; tab switches reset the stack to a single root.
   ========================================================================= */
(function (global) {
  "use strict";

  var screens = {};
  var stack = [];
  var host = null;

  function hostEl() {
    if (!host) host = document.getElementById("stack");
    return host;
  }

  function define(id, factory) { screens[id] = factory; }

  function build(id, params) {
    var factory = screens[id];
    if (!factory) return null;
    var view = factory(params || {}) || {};
    var el = view.el || view;
    if (el && el.classList) el.classList.add("screen");
    return { el: el, mount: view.mount, onBack: view.onBack, secure: view.secure, title: view.title };
  }

  function animateIn(el) {
    el.classList.add("is-top", "screen--enter");
    setTimeout(function () { el.classList.remove("screen--enter"); }, 300);
  }

  var Router = {
    define: define,

    push: function (id, params) {
      if (!screens[id]) {
        /* an unmapped button must never look dead or freeze the app */
        if (global.UI && UI.toast) UI.toast("Something went wrong, try again later.");
        else console.warn("Router: no screen registered for", id);
        return null;
      }
      var view = build(id, params);
      view.id = id;
      view.params = params || {};
      var prev = stack[stack.length - 1];
      if (prev) prev.el.classList.remove("is-top");
      stack.push(view);
      hostEl().appendChild(view.el);
      animateIn(view.el);
      if (view.mount) { try { view.mount(view.el, params || {}); } catch (e) { console.error(e); } }
      if (global.Guard && view.secure) Guard.secure(true);
      else if (global.Guard) Guard.secure(!!(view.secure));
      return view;
    },

    /* replace the whole stack (bottom-tab navigation) */
    root: function (id, params) {
      while (stack.length) {
        var top = stack.pop();
        if (top.el.parentNode) top.el.parentNode.removeChild(top.el);
      }
      return Router.push(id, params);
    },

    back: function () {
      if (stack.length < 2) return false;
      var top = stack.pop();
      if (top.onBack) { try { top.onBack(top.params); } catch (e) { console.error(e); } }
      top.el.classList.remove("is-top");
      top.el.classList.add("screen--pop");
      setTimeout(function () {
        if (top.el.parentNode) top.el.parentNode.removeChild(top.el);
      }, 230);
      var now = stack[stack.length - 1];
      if (now) now.el.classList.add("is-top");
      Guard.secure(!!(now && now.secure));
      return true;
    },

    /* back to a named screen if it is on the stack, otherwise push it */
    backTo: function (id) {
      for (var i = stack.length - 1; i >= 0; i--) {
        if (stack[i].id === id) {
          while (stack.length - 1 > i) Router.back();
          return true;
        }
      }
      return false;
    },

    top: function () { return stack[stack.length - 1]; },
    depth: function () { return stack.length; },
    current: function () { return stack.length ? stack[stack.length - 1].id : null; },
    isRoot: function () { return stack.length <= 1; },
    stackIds: function () { return stack.map(function (s) { return s.id; }); },

    /* re-render the screen on top (used after the hidden config saves) */
    refresh: function () {
      var top = stack[stack.length - 1];
      if (!top) return;
      var fresh = build(top.id, top.params);
      if (!fresh || !fresh.el) return;
      top.el.innerHTML = fresh.el.innerHTML;
      if (fresh.mount) { try { fresh.mount(top.el, top.params); } catch (e) { console.error(e); } }
    },

    /* re-render every screen on the stack (after a language switch) */
    refreshAll: function () {
      stack.forEach(function (entry) {
        var fresh = build(entry.id, entry.params);
        if (fresh && fresh.el) entry.el.innerHTML = fresh.el.innerHTML;
      });
      var top = stack[stack.length - 1];
      var freshTop = top && build(top.id, top.params);
      if (freshTop && freshTop.mount) { try { freshTop.mount(top.el, top.params); } catch (e) { console.error(e); } }
      if (global.Lang && Lang.apply) Lang.apply();
    }
  };

  global.Router = Router;
})(window);
