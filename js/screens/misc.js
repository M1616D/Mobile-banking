/* =========================================================================
   misc.js — Contact Us, the language sheet, and the hidden configuration
   panel that is reachable only by tapping the version string five times.
   No label, icon or visual affordance anywhere points at that gesture.
   ========================================================================= */
(function () {
  "use strict";

  var APP_VERSION = "6.1.0";
  var TAPS = 5;
  var tapCount = 0;
  var tapTimer = null;

  function flagEth() {
    return '<svg class="flag" viewBox="0 0 30 20" aria-hidden="true">' +
      '<rect width="30" height="20" fill="#078930"/><rect y="6.66" width="30" height="6.68" fill="#fcdd09"/>' +
      '<rect y="13.34" width="30" height="6.66" fill="#da121a"/>' +
      '<circle cx="15" cy="10" r="5" fill="#0f47af"/>' +
      '<path d="M15 6.9l1.1 2.4 2.6.3-1.9 1.8.5 2.6-2.3-1.3-2.3 1.3.5-2.6-1.9-1.8 2.6-.3z" fill="#fcdd09"/></svg>';
  }
  function flagUs() {
    var s = "";
    for (var i = 0; i < 7; i++) {
      s += '<rect y="' + (i * 2.86) + '" width="30" height="1.43" fill="' + (i % 2 ? "#ffffff" : "#b22234") + '"/>';
    }
    s += '<rect width="13" height="10" fill="#3c3b6e"/>';
    for (var r = 0; r < 3; r++) for (var c = 0; c < 4; c++)
      s += '<circle cx="' + (2 + c * 3) + '" cy="' + (2 + r * 3) + '" r="0.7" fill="#fff"/>';
    return '<svg class="flag" viewBox="0 0 30 20" aria-hidden="true">' + s + "</svg>";
  }

  function languageSheet() {
    var cur = Store.get().language;
    var opts = [
      { id: "am", label: "አማርኛ", flag: flagEth() },
      { id: "en", label: "English", flag: flagUs() }
    ];
    var body = '<div style="padding:6px 0 10px">' + opts.map(function (o) {
      return '<button class="radio-row' + (o.id === cur ? " is-on" : "") + '" data-lang="' + o.id + '">' +
        '<span class="radio-row__check">' + (o.id === cur ? Icon("check", 16) : "") + "</span>" +
        o.flag + "<span>" + o.label + "</span></button>";
    }).join("") + "</div>";
    var s = UI.sheet({ title: Lang.t("select_language"), body: body });
    s.node.addEventListener("click", function (e) {
      var b = e.target.closest("[data-lang]");
      if (!b) return;
      var lang = b.dataset.lang;
      s.close();
      /* this re-renders the current screen and every language pill */
      Lang.set(lang);
      UI.toast(lang === "en" ? "English selected" : "አማርኛ ተመርጧል");
    });
  }

  /* ----------------------------------------------------------- contact --- */
  function contactView() {
    var social = [
      ["facebook.png", "Facebook"],
      ["twitter.png", "Twitter"],
      ["telegram.png", "Telegram"],
      ["linkedin.png", "LinkedIn"],
      ["youtube.png", "YouTube"]
    ];
    var el = UI.h('<div class="screen">' +
      UI.appbar({ title: "Contact Us" }) +
      '<div class="body"><div class="sheet"><div class="pad" style="padding-top:16px">' +
        '<div class="contact-card">' +
          '<div class="contact-head">' +
            '<img src="img/cbe-logo.png" alt="">' +
            '<span><div class="contact-head__name">Commercial Bank of Ethiopia</div>' +
              '<div class="contact-head__sub">Digital Factory</div></span>' +
          "</div>" +
          '<div class="rowline" style="cursor:default;min-height:54px">' +
            '<span class="rowline__icon rowline__icon--filled" style="width:34px;height:34px">' +
              Icon("info", 18) + "</span>" +
            '<span class="rowline__text"><span class="rowline__title">Version</span>' +
              '<div class="rowline__sub">' + APP_VERSION + "</div></span>" +
          "</div>" +
        "</div>" +
        '<div class="contact-card mt12">' +
          '<div class="section-label" style="padding:14px 14px 6px">Contact addresses</div>' +
          '<div class="simple-row" style="padding:12px 14px">' +
            '<span class="rowline__icon" style="background:transparent">' + Icon("phoneCall", 20) + "</span>" +
            '<span class="grow simple-row__k">951</span></div>' +
          '<div class="simple-row" style="padding:12px 14px">' +
            '<span class="rowline__icon" style="background:transparent">' + Icon("mail", 20) + "</span>" +
            '<span class="grow simple-row__k">contact@cbe.com.et</span></div>' +
          '<div class="simple-row" style="padding:12px 14px">' +
            '<span class="rowline__icon" style="background:transparent">' + Icon("globe", 20) + "</span>" +
            '<span class="grow simple-row__k">https://combanketh.et</span></div>' +
        "</div>" +
        '<div class="contact-card mt12" style="padding-bottom:8px">' +
          '<div class="section-label" style="padding:14px 14px 6px">Social medias</div>' +
          social.map(function (s) {
            return '<div class="simple-row" style="padding:11px 14px;justify-content:flex-start;gap:14px">' +
              '<img class="social-icon" src="img/brands/' + s[0] + '" alt="">' +
              '<span class="simple-row__k">' + s[1] + "</span></div>";
          }).join("") +
        "</div>" +
      "</div></div></div></div>");
    return { el: el };
  }

  /* --------------------------------------------------- hidden config ----- */
  function hiddenView() {
    var s = Store.get();
    var el = UI.h('<div class="screen">' +
      UI.appbar({ title: "Configuration" }) +
      '<div class="body"><div class="sheet"><div class="pad hidden-panel" style="padding-top:16px">' +
        '<div class="hidden-note">Application state. Changes apply everywhere: the home balance, the ' +
          'transfer receiver lookup and every receipt.</div>' +
        '<div class="field"><label class="field__label">Account Holder Full Name</label>' +
          '<div class="input"><span class="input__icon">' + Icon("users", 21) + "</span>" +
            '<input data-holder value="' + U.esc(s.holderName) + '"></div></div>' +
        '<div class="field"><label class="field__label">Main Account Number (13 digits)</label>' +
          '<div class="input"><span class="input__icon">' + Icon("bank", 21) + "</span>" +
            '<input data-account inputmode="numeric" maxlength="13" value="' + U.esc(s.accountNumber) + '"></div></div>' +
        '<div class="field"><label class="field__label">Main Account Balance (ETB)</label>' +
          '<div class="input"><span class="input__icon">' + Icon("wallet", 21) + "</span>" +
            '<input data-balance inputmode="decimal" value="' + U.money(s.balance) + '"></div></div>' +
        '<div class="field"><label class="field__label">Custom Receiver Account Holder Name</label>' +
          '<div class="input"><span class="input__icon">' + Icon("userPlus", 21) + "</span>" +
            '<input data-receiver value="' + U.esc(s.receiverName) + '"></div>' +
          '<div class="hint">Used as the receiver name whenever a 13-digit account number is entered ' +
            "on the transfer screen.</div></div>" +
        '<button class="btn btn--block" data-act="save" style="margin-top:22px">Save configuration</button>' +
        '<div class="btn-row" style="margin-top:12px">' +
          '<button class="btn btn--quiet" data-act="cancel">Cancel</button>' +
          '<button class="btn btn--ghost" data-act="reset">Reset defaults</button>' +
        "</div>" +
      "</div></div></div></div>");

    el.addEventListener("click", function (e) {
      var act = e.target.closest("[data-act]");
      if (!act) return;
      var a = act.dataset.act;
      if (a === "cancel") { Router.back(); return; }
      if (a === "reset") {
        Store.wipe();
        UI.toast("Configuration reset");
        Router.popToRoot && Router.popToRoot();
        Router.root("home");
        return;
      }
      if (a === "save") {
        var holder = el.querySelector("[data-holder]").value.trim();
        var account = U.digits(el.querySelector("[data-account]").value);
        var balance = el.querySelector("[data-balance]").value.replace(/[^\d.]/g, "");
        var receiver = el.querySelector("[data-receiver]").value.trim();
        if (!holder) { UI.toast("Enter the account holder name"); return; }
        if (account.length !== 13) { UI.toast("Account number must be 13 digits"); return; }
        if (balance === "" || isNaN(parseFloat(balance))) { UI.toast("Enter a valid balance"); return; }
        if (!receiver) { UI.toast("Enter the receiver account holder name"); return; }
        Store.set({
          holderName: holder,
          accountNumber: account,
          balance: U.cents(parseFloat(balance)),
          receiverName: receiver
        });
        UI.toast("Configuration saved");
        Router.root("home");
      }
    });
    return { el: el };
  }

  /* ------------------------------------------------- five-tap trigger ----- */
  function init() {
    document.addEventListener("click", function (e) {
      var v = e.target.closest("[data-version]");
      if (!v) return;
      tapCount++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(function () { tapCount = 0; }, 2200);
      if (tapCount >= TAPS) {
        tapCount = 0;
        clearTimeout(tapTimer);
        Router.push("hidden");
      }
    });
  }

  Router.define("contact", contactView);
  Router.define("hidden", hiddenView);

  window.Misc = {
    init: init,
    languageSheet: languageSheet,
    VERSION: APP_VERSION
  };
})();
