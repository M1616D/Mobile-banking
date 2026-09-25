/* =========================================================================
   transactions.js — activity feed
   ========================================================================= */
(function () {
  "use strict";

  function txnItem(t) {
    var out = t.dir === "out";
    return '<button class="txn-item" data-id="' + U.esc(t.id) + '">' +
      '<span class="txn-item__dir txn-item__dir--' + (out ? "out" : "in") + '">' +
        Icon(out ? "arrowUpRight" : "arrowDownLeft", 20) + "</span>" +
      '<span class="txn-item__mid">' +
        '<span class="txn-item__name">' + U.esc(t.name) + "</span>" +
        '<div class="txn-item__meta">' + U.esc(U.shortDate(new Date(t.date))) + "</div>" +
      "</span>" +
      '<span class="txn-item__right">' +
        '<span class="txn-item__amt money ' + (out ? "money--out" : "money--in") + '">' +
          (out ? "-" : "+") + U.money(t.amount) + " ETB</span>" +
        '<div class="txn-item__tag">' + U.esc(t.tag || "") + "</div>" +
      "</span>" +
    "</button>";
  }

  function view() {
    var filter = "all";
    /* The balance panel and the All/Debited/Credited tabs are pinned to the top
       of the screen; only the feed underneath them scrolls, so the balance is
       never scrolled out of view. */
    var el = UI.h('<div class="home txn">' +
      '<header class="txn__top">' +
        '<section class="hero">' +
          '<div class="hero__top">' +
            '<button class="iconbtn hero__icon" data-act="myinfo" style="width:34px;height:34px">' + Icon("grid", 22) + "</button>" +
            '<div class="hello"><div class="hello__hi">Hello,</div>' +
              '<div class="hello__name" data-slot="name"></div></div>' +
            '<button class="lang-pill" data-act="lang">English ' + Icon("chevronDown", 13) + "</button>" +
            '<button class="iconbtn hero__icon" data-act="refresh" style="width:34px;height:34px">' + Icon("refresh", 20) + "</button>" +
          "</div>" +
          '<div data-slot="card"></div>' +
        "</section>" +
        '<div class="txn__sheethead">' +
          '<div class="handle"></div>' +
          '<div class="pad txn__tabs">' +
            '<div class="row between">' +
              '<div class="tabs" style="flex:1">' +
                '<button class="tabs__item is-on" data-f="all">All</button>' +
                '<button class="tabs__item" data-f="out">Debited</button>' +
                '<button class="tabs__item" data-f="in">Credited</button>' +
              "</div>" +
              '<button class="iconbtn" data-act="search" style="color:var(--purple)">' + Icon("search", 21) + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</header>" +
      '<div class="txn__list" data-slot="list"></div>' +
      UI.bottomNav("transactions") +
    "</div>");

    el.querySelector('[data-slot="name"]').textContent = U.firstName(Store.get().holderName);

    function paintCard() {
      el.querySelector('[data-slot="card"]').innerHTML = UI.balanceCard(Store.get().revealBalance);
    }
    function paintList() {
      var list = (Store.get().transactions || []).filter(function (t) {
        return filter === "all" || t.dir === filter;
      });
      var host = el.querySelector('[data-slot="list"]');
      if (!list.length) {
        host.innerHTML = '<div class="empty"><div class="empty__icon">' + Icon("history", 38) + "</div>" +
          '<div class="empty__title">Nothing here yet</div>' +
          '<p class="empty__text">Transactions you make will appear in this list.</p></div>';
        return;
      }
      host.innerHTML = list.map(txnItem).join("");
    }
    paintCard(); paintList();

    /* a hairline shadow appears under the pinned header once the feed moves */
    var list = el.querySelector(".txn__list");
    var top = el.querySelector(".txn__top");
    function syncShadow() { top.classList.toggle("is-lifted", list.scrollTop > 2); }
    list.addEventListener("scroll", syncShadow);
    syncShadow();

    el.addEventListener("click", function (e) {
      var nav = e.target.closest("[data-nav]");
      if (nav) {
        var id = nav.dataset.nav;
        if (id === "home") Router.root("home");
        else if (id === "settings") Router.root("settings");
        return;
      }
      var act = e.target.closest("[data-act]");
      if (act) {
        if (act.dataset.act === "reveal") { Store.set({ revealBalance: !Store.get().revealBalance }); paintCard(); return; }
        if (act.dataset.act === "copy") { UI.toast("Account number copied"); return; }
        if (act.dataset.act === "search") { Router.push("search"); return; }
        if (act.dataset.act === "myinfo") { Router.push("myinfo"); return; }
        if (act.dataset.act === "refresh") { paintList(); UI.toast("Transactions updated"); return; }
        if (act.dataset.act === "lang") {
          UI.selectSheet("Select Language", ["አማርኛ", "English"], function (v) { UI.toast(v + " selected"); });
          return;
        }
      }
      var tab = e.target.closest("[data-f]");
      if (tab) {
        filter = tab.dataset.f;
        el.querySelectorAll("[data-f]").forEach(function (b) { b.classList.toggle("is-on", b === tab); });
        paintList();
        return;
      }
      var item = e.target.closest("[data-id]");
      if (item) {
        var t = (Store.get().transactions || []).filter(function (x) { return x.id === item.dataset.id; })[0];
        if (!t) return;
        var receipt = Store.findReceipt(t.id);
        if (receipt) { Router.push("statement", { tx: receipt }); return; }
        UI.sheet({
          title: "Transaction Detail",
          closeBtn: true,
          body: '<div class="confirm-row"><span class="confirm-row__k">' + (t.dir === "out" ? "To" : "From") + "</span>" +
              '<span class="confirm-row__v"><b>' + U.esc(t.name) + "</b><span>" + U.esc(U.maskShort(t.account)) + "</span></span></div>" +
            '<div class="confirm-row"><span class="confirm-row__k">Reference</span>' +
              '<span class="confirm-row__v"><b>' + U.esc(t.id) + "</b><span>" + U.esc(U.statementDate(new Date(t.date))) + "</span></span></div>" +
            '<div class="confirm-row"><span class="confirm-row__k">Type</span>' +
              '<span class="confirm-row__v"><b>' + U.esc(t.reason || t.tag) + "</b></span></div>" +
            '<div class="confirm-row" style="align-items:center"><span class="confirm-total__k">Amount</span>' +
              '<span class="confirm-total__v ' + (t.dir === "out" ? "money--out" : "money--in") + '">' +
              (t.dir === "out" ? "-" : "+") + U.money(t.amount) + " <small>ETB</small></span></div>"
        });
      }
    });

    var unsub = Store.on(function () { if (el.isConnected) { paintCard(); paintList(); } });
    el._cleanup = unsub;
    return { el: el };
  }

  Router.define("transactions", view);
})();
