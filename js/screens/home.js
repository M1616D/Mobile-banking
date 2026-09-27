/* =========================================================================
   home.js — home screen, bottom navigation, menu search
   ========================================================================= */
(function () {
  "use strict";

  /* --------------------------------------------------------- bottom nav -- */
  UI.bottomNav = function (active) {
    var items = [
      { id: "home", label: "Home", icon: "homeSolid" },
      { id: "transactions", label: "Transactions", icon: "bankSolid" },
      { id: "settings", label: "Settings", icon: "gearSolid" }
    ];
    var names = { home: Lang.t("nav_home"), transactions: Lang.t("nav_tx"), settings: Lang.t("nav_settings") };
    return '<nav class="nav">' + items.map(function (it) {
      return '<button class="nav__item' + (it.id === active ? " is-on" : "") + '" data-nav="' + it.id + '">' +
        Icon(it.icon, 23) + "<span>" + names[it.id] + "</span></button>";
    }).join("") + "</nav>";
  };

  function routeNav(id) {
    if (id === "home") Router.root("home");
    else if (id === "transactions") Router.root("transactions");
    else if (id === "settings") Router.root("settings");
  }

  /* ------------------------------------------------------- balance card -- */
  function balanceCard(reveal) {
    var s = Store.get();
    var acct = reveal ? s.accountNumber : U.maskGrouped(s.accountNumber);
    var amount = reveal ? U.money(s.balance) : "*******";
    var brandName = s.noor ? "CBE NOOR" : "Commercial Bank of Ethiopia";
    var tag = s.noor ? "ሉአን ኑር" : "The bank you can always rely on!";
    var logo = s.noor ? "img/brands/noor-icon.png" : "img/cbe-logo.png";
    return '<div class="balance">' +
      '<div class="balance__brand">' +
        '<img class="balance__logo" src="' + logo + '" alt="">' +
        "<span>" +
          '<div class="balance__name">' + U.esc(brandName) + "</div>" +
          '<div class="balance__tag">' + U.esc(tag) + "</div>" +
        "</span>" +
      "</div>" +
      '<div class="balance__amount">' +
        '<span class="balance__value money">' + amount + "</span>" +
        '<span class="balance__cur">ETB</span>' +
        '<button class="balance__eye iconbtn" data-act="reveal" style="width:32px;height:32px" ' +
          'aria-label="' + (reveal ? "Hide" : "Show") + ' balance">' +
          Icon(reveal ? "eye" : "eyeOff", 20) + "</button>" +
      "</div>" +
      '<div class="balance__acct"><b>Saving Account&nbsp; ' + U.esc(acct) + "</b>" +
        '<button class="iconbtn" data-act="copy" style="width:26px;height:26px;color:var(--gold)" aria-label="Copy account number">' +
          Icon("copy", 18) + "</button>" +
      "</div>" +
      '<div class="balance__time">' + U.esc(U.cardStamp(new Date())) + "</div>" +
    "</div>";
  }

  UI.balanceCard = balanceCard;

  /* ------------------------------------------------------------- home --- */
  function homeView() {
    var el = UI.h('<div class="home">' +
      '<div class="home__scroll" data-scroll>' +
        '<section class="hero">' +
          '<div class="hero__top">' +
            '<button class="iconbtn hero__icon" data-act="myinfo" aria-label="My information" style="width:34px;height:34px">' +
              Icon("grid", 22) + "</button>" +
            '<div class="hello"><div class="hello__hi">' + Lang.t("hello") + '</div>' +
              '<div class="hello__name" data-slot="name"></div></div>' +
            '<button class="lang-pill" data-act="lang"><span data-langlabel>' + Lang.name() + '</span> ' + Icon("chevronDown", 13) + "</button>" +
            '<button class="iconbtn hero__icon" data-act="refresh" aria-label="Refresh" style="width:34px;height:34px">' +
              Icon("refresh", 20) + "</button>" +
            '<button class="iconbtn hero__icon" data-act="search" aria-label="Search" style="width:34px;height:34px">' +
              Icon("search", 20) + "</button>" +
          "</div>" +
          '<div data-slot="card"></div>' +
        "</section>" +
        '<section class="home__sheet">' +
          '<div class="handle"></div>' +
          '<div class="quick">' +
            '<button class="quick__nav quick__nav--prev" data-act="qprev" hidden>' + Icon("chevronLeft", 17) + "</button>" +
            '<div class="quick__scroller" data-quick></div>' +
            '<button class="quick__nav quick__nav--next" data-act="qnext">' + Icon("chevronRight", 17) + "</button>" +
          "</div>" +
          '<div class="service-grid grid2" data-tiles></div>' +
        "</section>" +
      "</div>" +
      '<button class="scan-fab" data-act="scan">' + Icon("qrScan", 19) + "<span>Scan QR</span></button>" +
      UI.bottomNav("home") +
    "</div>");

    function paintCard() {
      el.querySelector('[data-slot="card"]').innerHTML = balanceCard(Store.get().revealBalance);
    }
    function paintQuick() {
      el.querySelector("[data-quick]").innerHTML = Brands.QUICK.map(function (q) {
        return '<button class="quick__item" data-quickitem="' + U.esc(q.to) + '" ' +
          'data-qparams=\'' + U.esc(JSON.stringify(q.params || {})) + '\' data-qlabel="' + U.esc(q.label) + '">' +
          '<span class="quick__circle">' + Icon(q.icon, 23) + "</span>" +
          '<span class="quick__label">' + U.esc(q.label).replace(/\n/g, "<br>") + "</span></button>";
      }).join("");
    }
    function paintTiles() {
      el.querySelector("[data-tiles]").innerHTML = Brands.HOME_TILES.map(function (t) {
        var inner;
        if (t.bubble) {
          inner = '<span class="tile__row"><span class="bubble bubble--' + t.bubble + '">' + Icon(t.icon, 22) + "</span>" +
            '<span class="tile__stack"><span class="t">' + U.esc(t.label) + "</span>" +
            '<span class="s">' + U.esc(t.sub) + "</span></span></span>";
          return '<button class="tile tile--action" data-go="' + U.esc(t.to) + '">' + inner + "</button>";
        }
        return '<button class="tile" data-go="' + U.esc(t.to) + '">' +
          '<span class="tile__icon">' + Icon(t.icon, 30) + "</span>" +
          '<span class="tile__label">' + U.esc(t.label) + "</span></button>";
      }).join("");
    }

    el.querySelector('[data-slot="name"]').textContent = U.firstName(Store.get().holderName);
    paintCard(); paintQuick(); paintTiles();

    /* the quick strip shows its chevrons only when there is more to reveal */
    var scroller = el.querySelector("[data-quick]");
    function syncArrows() {
      var prev = el.querySelector('[data-act="qprev"]');
      var next = el.querySelector('[data-act="qnext"]');
      var max = scroller.scrollWidth - scroller.clientWidth - 2;
      prev.hidden = scroller.scrollLeft <= 2;
      next.hidden = scroller.scrollLeft >= max;
    }
    scroller.addEventListener("scroll", syncArrows);
    setTimeout(syncArrows, 60);
    window.addEventListener("resize", syncArrows);

    el.addEventListener("click", function (e) {
      var nav = e.target.closest("[data-nav]");
      if (nav) { routeNav(nav.dataset.nav); return; }

      var act = e.target.closest("[data-act]");
      if (act) {
        var a = act.dataset.act;
        if (a === "reveal") {
          Store.set({ revealBalance: !Store.get().revealBalance });
          paintCard();
          return;
        }
        if (a === "copy") {
          var acc = Store.get().accountNumber;
          if (navigator.clipboard) navigator.clipboard.writeText(acc).catch(function () { });
          UI.toast("Account number copied");
          return;
        }
        if (a === "myinfo") { Router.push("myinfo"); return; }
        if (a === "search") { Router.push("search"); return; }
        if (a === "scan") { Router.push("scan"); return; }
        if (a === "lang") {
          Misc.languageSheet();
          return;
        }
        if (a === "refresh") {
          paintCard();
          UI.toast("Balance updated");
          return;
        }
        if (a === "qnext") { scroller.scrollBy({ left: 220, behavior: "smooth" }); setTimeout(syncArrows, 320); return; }
        if (a === "qprev") { scroller.scrollBy({ left: -220, behavior: "smooth" }); setTimeout(syncArrows, 320); return; }
      }

      var qi = e.target.closest("[data-quickitem]");
      if (qi) {
        var to = qi.dataset.quickitem;
        var params = {};
        try { params = JSON.parse(qi.dataset.qparams || "{}"); } catch (err) { }
        params.title = params.title || qi.dataset.qlabel.replace(/\n/g, " ");
        if (to === "cards" || to === "withdrawals" || to === "scheduled" || to === "receipts") Router.push(to, params);
        else Router.push("coming", params);
        return;
      }

      var tile = e.target.closest("[data-go]");
      if (tile) { gotoService(tile.dataset.go); return; }
    });

    /* returning home should refresh the balance shown in the hero card */
    var unsub = Store.on(function () { if (el.isConnected) paintCard(); });
    el._cleanup = unsub;
    return { el: el, onBack: function () { } };
  }

  function gotoService(id) {
    if (!id) return;
    /* anything declared in the catalogue opens the generic catalogue screen;
       everything else is a screen of its own. Unmapped ids fall through to
       Router.push, which raises the generic error toast. */
    if (Brands.CATALOG[id]) { Router.push("catalog", { key: id }); return; }
    Router.push(id);
  }
  window.gotoService = gotoService;

  /* ------------------------------------------------------------ search -- */
  function searchView() {
    var index = Brands.searchIndex();
    var el = UI.h('<div class="screen">' +
      '<header class="appbar">' +
        '<button class="iconbtn" data-act="back" aria-label="Back">' + Icon("back", 22) + "</button>" +
        '<div class="search-bar">' + Icon("search", 19) + '<input data-q placeholder="Search menu..." autocomplete="off"></div>' +
        '<button class="iconbtn" data-act="clear" aria-label="Close">' + Icon("x", 21) + "</button>" +
      "</header>" +
      '<div class="body"><div class="sheet"><div class="search-group" data-results></div></div></div>' +
      UI.bottomNav("home") +
    "</div>");

    var input = el.querySelector("[data-q]");
    var results = el.querySelector("[data-results]");
    function paint(q) {
      q = (q || "").trim().toLowerCase();
      if (!q) {
        results.innerHTML = '<div class="search-empty">Type to search menus...</div>';
        return;
      }
      var hits = index.filter(function (i) { return i.label.toLowerCase().indexOf(q) >= 0; });
      if (!hits.length) {
        results.innerHTML = '<div class="search-empty">No menu found for “' + U.esc(q) + '”</div>';
        return;
      }
      results.innerHTML = hits.slice(0, 40).map(function (i) {
        var icon = i.img
          ? '<span class="rowline__icon"><img src="' + U.esc(i.img) + '" alt=""></span>'
          : '<span class="rowline__icon">' + Icon(i.icon || "list", 21) + "</span>";
        return '<button class="search-item" data-go="' + U.esc(i.to) + '">' + icon + U.esc(i.label) + "</button>";
      }).join("");
    }
    paint("");
    input.addEventListener("input", U.debounce(function () { paint(input.value); }, 90));
    setTimeout(function () { input.focus(); }, 120);

    el.addEventListener("click", function (e) {
      if (e.target.closest('[data-act="clear"]')) { Router.back(); return; }
      var go = e.target.closest("[data-go]");
      if (go) {
        var id = go.dataset.go;
        if (id === "search") return;
        gotoService(id);
      }
    });
    return { el: el };
  }

  Router.define("home", homeView);
  Router.define("search", searchView);
})();
