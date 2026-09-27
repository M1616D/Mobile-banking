/* =========================================================================
   i18n.js — the app language state.
   The language pill on the login screen / home and the Language row in
   Settings all write here; every screen reads its labels through Lang.t().
   Switching the language re-renders the current screen and updates the
   document language, so the choice is visible everywhere immediately.
   ========================================================================= */
(function (global) {
  "use strict";

  var DICT = {
    en: {
      login_welcome: "Welcome back",
      use_biometrics: "USE BIOMETRICS",
      use_pin: "Use PIN",
      login: "Login",
      hello: "Hello,",
      nav_home: "Home",
      nav_tx: "Transactions",
      nav_settings: "Settings",
      select_language: "Select Language",
      settings_language: "Language",
      lang_name: "English"
    },
    am: {
      login_welcome: "እንኳን ደህና መጡ",
      use_biometrics: "ባዮሜትሪክ ይጠቀሙ",
      use_pin: "ፒን ይጠቀሙ",
      login: "ግባ",
      hello: "ሰላም፣",
      nav_home: "መነሻ",
      nav_tx: "ግብዛዎች",
      nav_settings: "ቅንብሮች",
      select_language: "ቋንቋ ይምረጡ",
      settings_language: "ቋንቋ",
      lang_name: "አማርኛ"
    }
  };

  var Lang = {
    current: function () {
      var l = (global.Store && Store.get().language) || "en";
      return DICT[l] ? l : "en";
    },

    t: function (key) {
      var table = DICT[this.current()] || DICT.en;
      if (table[key] !== undefined) return table[key];
      return DICT.en[key] !== undefined ? DICT.en[key] : key;
    },

    /* name of the language currently selected, for the pills */
    name: function () { return DICT[this.current()].lang_name; },

    set: function (lang) {
      if (!DICT[lang]) lang = "en";
      Store.set({ language: lang });
      this.apply();
      if (global.Router && Router.refresh) Router.refresh();
    },

    /* keep the <html lang> and every language pill in step */
    apply: function () {
      try { document.documentElement.setAttribute("lang", this.current()); } catch (e) { }
      var label = this.name();
      document.querySelectorAll("[data-langlabel]").forEach(function (n) { n.textContent = label; });
    }
  };

  global.Lang = Lang;
})(window);
