/* ==========================================================================
   screens-home.js — the home page, the transactions tab and the small
   supporting screens (detail, notifications, menu search).
   ========================================================================== */
(function (global) {
  'use strict';
  var CBE = global.CBE;
  var U = CBE.ui;
  var t = function (k) { return CBE.t(k); };

  var BODY = 'padding:0 0 calc(var(--nav-h) + 26px + var(--bot-pad))';

  /* --------------------------------------------------------------- home */
  CBE.define('home', {
    render: function () {
      var tiles = CBE.data.homeTileIcons;
      var cards = CBE.data.homeCards;
      var extras = CBE.data.homeExtras;
      return '<section class="screen">' +
        '<div class="screen-body" style="' + BODY + '">' +
          U.homeHead() +
          U.balanceCard() +
          '<div class="amber-bar"></div>' +
          '<div class="tiles4-wrap">' +
            '<div class="tiles4">' + tiles.map(function (x) {
              return U.iconTile({ title: x.key ? t(x.key) : x.title, icon: x.icon, goto: x.goto });
            }).join('') + '</div>' +
            '<button class="tile-more" data-goto="otherServices" aria-label="More services">' + CBE.icon('chevronRight', { size: 16 }) + '</button>' +
          '</div>' +
          '<div class="cards2">' + cards.map(function (x) {
            return U.cardTile({
              title: x.key ? t(x.key) : x.title,
              sub: x.subKey ? t(x.subKey) : x.sub,
              icon: x.icon, tone: x.tone,
              center: x.center, goto: x.goto
            });
          }).join('') + '</div>' +
          '<div class="bar3">' +
            '<button class="bar3-item" data-goto="branches" aria-label="Branches">' + CBE.icon('columns', { size: 25, weight: 1.8 }) + '</button>' +
            '<button class="scan-qr" data-goto="scanner">' + CBE.icon('scanQr', { size: 20 }) + U.esc(t('scanQr')) + '</button>' +
            '<button class="bar3-item" data-goto="agents" aria-label="Agents">' + CBE.icon('building', { size: 25, weight: 1.8 }) + '</button>' +
          '</div>' +
          '<div class="sec-label" style="margin-left:16px">' + U.esc(t('moreServices')) + '</div>' +
          '<div class="cards2" style="padding-top:0">' + extras.map(function (x) {
            return U.cardTile({ title: x.title, sub: x.sub, icon: x.icon, tone: x.tone, goto: x.goto });
          }).join('') + '</div>' +
        '</div>' +
        U.tabbar('home') +
      '</section>';
    }
  });

  /* ------------------------------------------------------- transactions */
  CBE.define('transactions', {
    render: function () {
      var st = CBE.state;
      var f = st.txnFilter || 'all';
      var list = st.transactions.filter(function (x) {
        if (f === 'out') return x.amount < 0;
        if (f === 'in') return x.amount > 0;
        return true;
      });
      return '<section class="screen">' +
        '<div class="screen-body" style="' + BODY + '">' +
          U.homeHead() +
          U.balanceCard() +
          '<div class="seg" style="margin-top:6px">' +
            '<button class="seg-item' + (f === 'all' ? ' active' : '') + '" data-filter="all"><span>' + U.esc(t('all')) + '</span></button>' +
            '<button class="seg-item' + (f === 'out' ? ' active' : '') + '" data-filter="out"><span>' + U.esc(t('debited')) + '</span></button>' +
            '<button class="seg-item' + (f === 'in' ? ' active' : '') + '" data-filter="in"><span>' + U.esc(t('credited')) + '</span></button>' +
            '<button class="seg-search" data-action="searchMenu" aria-label="Search">' + CBE.icon('search', { size: 21 }) + '</button>' +
          '</div>' +
          '<div style="padding:14px 0 0">' +
            (list.length ? list.map(function (x) { return U.txRow(x); }).join('') : U.emptyState(t('noResults'))) +
          '</div>' +
        '</div>' +
        U.tabbar('transactions') +
      '</section>';
    }
  });

  /* --------------------------------------------------------- tx detail */
  CBE.define('txDetail', {
    render: function (p) {
      var r = CBE.receiptOf(p.id) || CBE.receiptOf();
      if (!r) return '<section class="screen">' + U.appbar(t('transactions')) + '<div class="screen-body no-nav">' + U.emptyState(t('noResults')) + '</div></section>';
      var out = r.direction === 'debit';
      return '<section class="screen">' +
        '<div class="screen-body no-nav">' +
          U.appbar(t('transactions')) +
          '<div class="receipt-title" style="font-size:20px;color:' + (out ? '#d9534f' : '#1fa84c') + '">' +
            (out ? '-' : '+') + U.money(r.amount) + ' ETB</div>' +
          '<div class="group" style="margin-top:8px">' +
            U.kvRow('Name', r.receiverName) +
            U.kvRow(t('account'), r.receiverAccount) +
            U.kvRow(t('reasonType'), r.remark) +
            U.kvRow(t('paymentDateTime'), U.longDate(r.date)) +
            U.kvRow(t('referenceNo'), r.ref) +
            U.kvRow(t('transferredAmount'), U.moneyCur(r.amount)) +
            U.kvRow(t('serviceCharge'), U.moneyCur(r.txn.serviceCharge || 0)) +
            U.kvRow('VAT', U.moneyCur(r.txn.vat || 0)) +
            U.kvRow('Disaster Risk Response Fund', U.moneyCur(r.txn.drf || 0)) +
            U.kvRow(t('totalDebited'), U.moneyCur(r.txn.total || r.amount)) +
          '</div>' +
          '<button class="btn btn-primary" style="margin-top:18px" data-goto="receipt" data-value="' + U.esc(r.txn.id) + '">' +
            U.esc('View receipt') + '</button>' +
        '</div>' +
      '</section>';
    }
  });

  /* ------------------------------------------------------ notifications */
  CBE.define('notifications', {
    render: function () {
      var authed = !!CBE.state.authed;
      var list = CBE.notifications;
      return '<section class="screen">' +
        '<div class="screen-body' + (authed ? ' no-nav' : '') + '">' +
          U.appbar(t('notifications'), { right: '' }) +
          (list.length
            ? '<div class="group" style="margin-top:8px">' + list.map(function (n) {
                return '<button class="row" data-action="openNotification" data-value="' + U.esc(n.id) + '">' +
                  '<span class="ico">' + CBE.icon('bell', { size: 19 }) + '</span>' +
                  '<span class="txt"><b>' + U.esc(n.title) + '</b><small>' + U.esc(n.body) + '</small>' +
                  '<small style="color:#a8aeba">' + U.esc(U.longDate(n.date)) + '</small></span></button>';
              }).join('') + '</div>'
            : U.emptyState('No notifications')) +
          (list.length ? '<button class="btn btn-soft" style="margin-top:18px" data-action="clearNotifications">Clear all</button>' : '') +
        '</div>' +
      '</section>';
    }
  });

  /* ------------------------------------------------------- menu search */
  CBE.define('searchMenu', {
    render: function () {
      var q = (CBE.state.menuQuery || '').toLowerCase();
      var items = CBE.data.serviceCatalog.filter(function (s) {
        return !q || s.name.toLowerCase().indexOf(q) >= 0;
      });
      return '<section class="screen">' +
        '<div class="screen-body no-nav">' +
          '<div class="appbar" style="margin:-16px -16px 14px;padding-top:calc(14px + var(--top-pad))">' +
            '<button class="icon-btn" data-action="back" aria-label="Back">' + CBE.icon('chevronLeft', { size: 23 }) + '</button>' +
            '<div class="field" style="flex:1;min-height:44px;background:rgba(255,255,255,.16);border:0">' +
              '<span class="fico" style="color:#fff">' + CBE.icon('search', { size: 19 }) + '</span>' +
              '<input id="menu-search" placeholder="' + U.esc(t('searchMenu')) + '" value="' + U.esc(CBE.state.menuQuery || '') + '"' +
                ' style="color:#fff;padding:10px 0;font-size:15px">' +
            '</div>' +
            '<button class="icon-btn" data-action="clearSearch" aria-label="Clear">' + CBE.icon('x', { size: 20 }) + '</button>' +
          '</div>' +
          (q
            ? (items.length
                ? '<div class="pill-list">' + items.map(function (s) {
                    return U.osItem({ title: s.name, icon: 'grid', goto: s.route });
                  }).join('') + '</div>'
                : U.emptyState(t('noResults')))
            : '<div class="empty-state" style="padding-top:60px">' + U.esc(t('typeToSearch')) + '</div>') +
        '</div>' +
      '</section>';
    },
    after: function () {
      var input = document.getElementById('menu-search');
      if (!input) return;
      var node = document.getElementById('screen-root');
      var body = node.querySelector('.screen-body');
      var self = this;
      function paint() {
        CBE.state.menuQuery = input.value;
        var q = input.value.toLowerCase();
        var items = CBE.data.serviceCatalog.filter(function (s) { return !q || s.name.toLowerCase().indexOf(q) >= 0; });
        var host = body.querySelector('.pill-list') || body.querySelector('.empty-state');
        if (!host) return;
        var html = q
          ? (items.length
              ? '<div class="pill-list">' + items.map(function (s) {
                  return U.osItem({ title: s.name, icon: 'grid', goto: s.route });
                }).join('') + '</div>'
              : '<div class="empty-state" style="padding-top:60px">' + U.esc(t('noResults')) + '</div>')
          : '<div class="empty-state" style="padding-top:60px">' + U.esc(t('typeToSearch')) + '</div>';
        var wrap = document.createElement('div');
        wrap.innerHTML = html;
        body.replaceChild(wrap.firstChild, host);
      }
      input.addEventListener('input', paint);
      CBE._paintSearch = paint;
    }
  });
})(typeof window !== 'undefined' ? window : this);
