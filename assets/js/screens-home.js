/* ==========================================================================
   screens-home.js — home dashboard, transactions, transaction detail,
   notifications, the "Other Services" menu, the full service list,
   menu search and the QR scanner
   ========================================================================== */
(function (global) {
  'use strict';
  var CBE = global.CBE;
  var U = CBE.ui;

  /* --------------------------------------------------------- quick actions */
  var QUICK = [
    { id: 'mini', labelKey: 'miniStatement', icon: 'statement', route: 'miniStatement' },
    { id: 'cash', labelKey: 'cashOut', icon: 'cashOut', route: 'cashOut' },
    { id: 'billshare', labelKey: 'billShare', icon: 'splitShare', route: 'billShare' },
    { id: 'cards', labelKey: 'cards', icon: 'cardStack', route: 'cards' }
  ];

  function quickRow() {
    return '<div class="quick-wrap">' +
      '<div class="quick-row">' + QUICK.map(function (q) {
        return '<button class="quick-item" data-goto="' + q.route + '" data-action="goto">' +
          '<span class="bubble">' + CBE.icon(q.icon, { size: 23 }) + '</span>' +
          '<span class="txt">' + U.esc(CBE.t(q.labelKey)) + '</span></button>';
      }).join('') + '</div>' +
      '<button class="quick-more" data-goto="allServices" data-action="goto" aria-label="More services">' +
        CBE.icon('chevronRight', { size: 14, weight: 2.6 }) + '</button>' +
      '</div>';
  }

  /* the six tiles the home page shows, in the order of the screenshot */
  var TILES = [
    { kind: 'split', title: 'CBE Transfer', sub: 'sendMoney', icon: 'arrowUpRight', tone: 'red', route: 'cbeTransfer' },
    { kind: 'split', title: 'Receive', sub: 'getPaid', icon: 'arrowDownLeft', tone: 'green', route: 'receive' },
    { kind: 'plain', titleKey: 'airtime', icon: 'phoneHandset', route: 'airtime' },
    { kind: 'plain', titleKey: 'otherTransfers', icon: 'sync', route: 'otherTransfers' },
    { kind: 'plain', titleKey: 'cbeBirr', icon: 'bankNote', route: 'cbebirr' },
    { kind: 'plain', titleKey: 'billsUtilities', icon: 'receipt', route: 'bills' }
  ];

  /* everything else, reachable from the little chevron on the quick row */
  var TILES_MORE = [
    { titleKey: 'banking', icon: 'columns', route: 'banking' },
    { titleKey: 'government', icon: 'building', route: 'government' },
    { title: 'Pay to Merchant', icon: 'store', route: 'payMerchant' },
    { title: 'Travel', icon: 'plane', route: 'travel' },
    { title: 'Shopping', icon: 'cart', route: 'shopping' },
    { title: 'Entertainment', icon: 'film', route: 'entertainment' },
    { title: 'Pay for', icon: 'cashOut', route: 'payFor' },
    { title: 'Tax Payment', icon: 'receiptCheck', route: 'taxPayment' },
    { title: 'Ethiopian Shipping & Logistics', icon: 'doc', route: 'esl', small: true },
    { title: 'CBE Fast Loan', icon: 'coins', route: 'fastLoan' }
  ];

  function tileHtml(t) {
    if (t.kind === 'split') {
      return '<button class="tile split" data-goto="' + t.route + '" data-action="goto">' +
        '<span class="bubble ' + t.tone + '">' + CBE.icon(t.icon, { size: 20, weight: 2 }) + '</span>' +
        '<span class="txt"><b>' + U.esc(t.title) + '</b><small>' + U.esc(CBE.t(t.sub)) + '</small></span></button>';
    }
    var label = t.titleKey ? CBE.t(t.titleKey) : t.title;
    return '<button class="tile' + (t.small ? ' small' : '') + '" data-goto="' + t.route + '" data-action="goto">' +
      '<span class="ic">' + CBE.icon(t.icon, { size: 25 }) + '</span>' +
      '<span class="lbl">' + U.esc(label) + '</span></button>';
  }

  function tileGrid(list) { return '<div class="tile-grid">' + list.map(tileHtml).join('') + '</div>'; }

  function homeBottomBar() {
    return '<div class="home-bar">' +
      '<button class="icon-btn" data-goto="branches" data-action="goto" aria-label="Branches">' + CBE.icon('columns', { size: 24 }) + '</button>' +
      '<button class="scan-btn" data-goto="scanner" data-action="goto">' +
        CBE.icon('scanQr', { size: 19 }) + '<span>' + U.esc(CBE.t('scanQr')) + '</span></button>' +
      '<button class="icon-btn" data-goto="agents" data-action="goto" aria-label="Agents">' + CBE.icon('bank', { size: 24 }) + '</button>' +
      '</div>';
  }

  /* the greeting block: grid icon + "Home" breadcrumb + the account holder */
  function heroTop(opts) {
    opts = opts || {};
    var am = CBE.state.lang === 'am';
    return '<div class="hero-top">' +
      (opts.back
        ? '<button class="icon-btn" data-action="back" aria-label="Back" style="margin-left:-8px">' + CBE.icon('chevronLeft', { size: 25 }) + '</button>'
        : '') +
      '<button class="hello" data-action="' + (opts.action || 'myInfo') + '" style="color:#fff">' +
        (opts.back
          ? '<strong>' + U.esc(CBE.state.user.short) + '</strong>'
          : '<span class="eyebrow">' + CBE.icon('grid', { size: 14, weight: 2 }) + '<span>' + U.esc(CBE.t('home')) + '</span></span>' +
            '<strong>' + U.esc(CBE.state.user.short) + '</strong>') +
        '</button>' +
      '<div class="hero-actions">' +
        '<button class="lang-pill" data-action="language"><span class="' + (am ? 'am' : '') + '">' +
          U.esc(CBE.t('language')) + '</span>' + CBE.icon('chevronDown', { size: 14 }) + '</button>' +
        '<button class="icon-btn" data-action="refresh" aria-label="Refresh">' + CBE.icon('refresh', { size: 20 }) + '</button>' +
        '<button class="icon-btn" data-goto="searchMenu" data-action="goto" aria-label="Search">' + CBE.icon('search', { size: 21 }) + '</button>' +
      '</div>' +
      '</div>';
  }

  /* ---------------------------------------------------------------- home */
  CBE.define('home', {
    render: function () {
      return '<section class="screen no-anim">' +
        '<header class="hero">' +
          heroTop({}) +
          U.balanceCard({}) +
        '</header>' +
        '<div class="screen-body" style="padding-top:64px;padding-bottom:calc(180px + var(--safe-bottom))">' +
          '<div class="motif"></div>' +
          quickRow() +
          tileGrid(TILES) +
        '</div>' +
        '<div class="dock">' + homeBottomBar() + U.tabbar('home') + '</div>' +
      '</section>';
    }
  });

  /* -------------------------------------------------------- transactions */
  var txnFilter = 'all';
  CBE.setTxnFilter = function (f) { txnFilter = f; CBE.render(); };
  CBE.define('transactions', {
    render: function () {
      var list = CBE.state.transactions.filter(function (t) {
        if (txnFilter === 'debit') return t.amount < 0;
        if (txnFilter === 'credit') return t.amount > 0;
        return true;
      });
      return '<section class="screen no-anim">' +
        '<header class="hero">' +
          heroTop({ back: true, action: 'goHome' }) +
          U.balanceCard({}) +
        '</header>' +
        '<div class="sheet-light"><div class="screen-body" style="padding-top:0">' +
          '<div class="tabs" style="margin-top:8px">' +
            '<button class="tab' + (txnFilter === 'all' ? ' active' : '') + '" data-filter="all">All</button>' +
            '<button class="tab' + (txnFilter === 'debit' ? ' active' : '') + '" data-filter="debit">Debited</button>' +
            '<button class="tab' + (txnFilter === 'credit' ? ' active' : '') + '" data-filter="credit">Credited</button>' +
            '<span class="spacer"></span>' +
            '<button class="icon-btn" data-goto="searchMenu" data-action="goto" aria-label="Search">' + CBE.icon('search', { size: 21 }) + '</button>' +
          '</div>' +
          '<div class="tx-list" style="padding-top:6px">' +
            (list.length ? list.map(U.txRow).join('') : U.emptyState(CBE.t('noResults'))) +
          '</div>' +
        '</div></div>' +
        U.tabbar('transactions') +
      '</section>';
    }
  });

  /* --------------------------------------------------- transaction detail */
  CBE.define('txDetail', {
    render: function (p) {
      var r = CBE.receiptOf(p.id);
      if (!r) return U.emptyState(CBE.t('noResults'));
      var t = r.txn;
      var out = r.direction === 'debit';
      var f = CBE.fees(r.amount, r.charges);
      return '<section class="screen">' +
        U.appbar(out ? 'Debit Transaction' : 'Credit Transaction') +
        '<div class="sheet-light"><div class="screen-body no-nav">' +
          '<div class="group" style="margin-top:6px;padding:4px 14px">' +
            '<div class="kv"><span class="k">' + U.esc(CBE.t('to')) + '</span><span class="v">' + U.esc(r.receiverName) +
              '<small>' + U.esc(r.receiverAccount) + '</small></span></div>' +
            '<div class="kv"><span class="k">' + U.esc(CBE.t('from')) + '</span><span class="v">' + U.esc(r.senderName) +
              '<small>' + U.esc(U.maskAccount(r.senderAccount)) + '</small></span></div>' +
            '<div class="kv"><span class="k">' + U.esc(CBE.t('totalAmount')) + '</span><span class="v" style="color:' +
              (out ? 'var(--red)' : 'var(--green)') + '">' + U.signed(t.amount) + ' ETB</span></div>' +
            '<div class="kv"><span class="k">' + U.esc(CBE.t('paymentDateTime')) + '</span><span class="v">' + U.esc(U.longDate(r.date)) + '</span></div>' +
            '<div class="kv"><span class="k">' + U.esc(CBE.t('referenceNo')) + '</span><span class="v">' + U.esc(r.ref) + '</span></div>' +
            (r.charges ? '<div class="kv"><span class="k">' + U.esc(CBE.t('serviceCharge')) + '</span><span class="v">' + U.money(f.sc) + ' ETB</span></div>' +
              '<div class="kv"><span class="k">' + U.esc(CBE.t('vat')) + '</span><span class="v">' + U.money(f.vat) + ' ETB</span></div>' +
              '<div class="kv"><span class="k">' + U.esc(CBE.t('disaster')) + '</span><span class="v">' + U.money(f.drf) + ' ETB</span></div>' : '') +
          '</div>' +
          '<div class="qr-flat" style="margin-top:18px">' + CBE.qr.svg(r.ref + '|' + r.amount, { modules: 33 }) + '</div>' +
          '<button class="btn btn-primary" style="margin-top:18px" data-goto="fullReceipt" data-action="goto" data-value="' + U.esc(t.id) + '">' +
            U.esc(CBE.t('customerReceipt')) + '</button>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* -------------------------------------------------------- notifications */
  CBE.define('notifications', {
    render: function () {
      return '<section class="screen">' +
        U.appbar(CBE.t('notifications'), { right: '<button class="icon-btn" data-action="clearNotifications">' + CBE.icon('trash', { size: 20 }) + '</button>' }) +
        '<div class="sheet-light"><div class="screen-body no-nav">' +
          '<div class="group" id="notif-list" style="margin-top:6px">' +
            (CBE.notifications.length ? CBE.notifications.map(function (n) {
              return '<button class="row tall" data-action="openNotification" data-value="' + n.id + '">' +
                '<span class="ico">' + CBE.icon('bell', { size: 20 }) + '</span>' +
                '<span class="txt"><b>' + U.esc(n.title) + '</b><small>' + U.esc(n.body) + '</small></span>' +
                '<span class="chev">' + CBE.icon('chevronRight', { size: 19 }) + '</span></button>';
            }).join('') : U.emptyState('No notifications')) +
          '</div>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* -------------------------------------------------------- other services
     The 4-cube icon on the sign-in page opens this: two columns of icon +
     label pills, exactly like the reference screenshot. */
  CBE.define('otherServices', {
    render: function () {
      var items = CBE.data.otherServices.filter(function (s) { return s.id !== 'links'; });
      return '<section class="screen">' +
        U.appbar('Other Services') +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="os-grid">' +
            items.map(function (s) {
              var inner = s.icon === 'cbe' ? CBE.cbeLogo(26) : CBE.icon(s.icon, { size: 23 });
              var tone = s.tone ? ' style="color:' + s.tone + '"' : (s.icon === 'cbe' ? '' : ' style="color:var(--purple-600)"');
              return '<button class="os-item" data-goto="' + s.route + '" data-action="goto">' +
                '<span class="ic"' + tone + '>' + inner + '</span>' +
                '<span class="lbl">' + U.esc(s.name) + '</span></button>';
            }).join('') +
          '</div>' +
          '<button class="os-item wide" data-goto="cbeLinks" data-action="goto">' +
            '<span class="ic" style="color:var(--purple-600)">' + CBE.icon('link', { size: 22 }) + '</span>' +
            '<span class="lbl">' + U.esc('CBE Links') + '</span></button>' +
        '</div></div>' +
        U.tabbar('home') +
      '</section>';
    }
  });

  /* ------------------------------------------------------- full service list */
  CBE.define('allServices', {
    render: function () {
      var items = [
        { name: 'CBE Transfer', sub: 'Send money to a CBE account', icon: 'transfer', route: 'cbeTransfer' },
        { name: 'Receive Money', sub: 'Share your QR to get paid', icon: 'qr', route: 'receive' },
        { name: 'Airtime', sub: 'Ethio telecom & Safaricom', icon: 'phoneHandset', route: 'airtime' },
        { name: 'Other Transfers', sub: 'Wallet, banks, micro finance, SACCO', icon: 'sync', route: 'otherTransfers' },
        { name: 'CBEBirr', sub: 'Move money to your wallet', icon: 'bankNote', route: 'cbebirr' },
        { name: 'Bills & Utilities', sub: 'Pay utilities and services', icon: 'receipt', route: 'bills' },
        { name: 'Pay for', sub: 'Merchants, school fees, donations', icon: 'store', route: 'payFor' },
        { name: 'Banking', sub: 'Beneficiary and account cards', icon: 'columns', route: 'banking' },
        { name: 'Government Services', sub: 'Taxes, fines and licences', icon: 'building', route: 'government' },
        { name: 'Loan Products', sub: 'Fast Loan and Fast Revolving', icon: 'coins', route: 'loanProducts' },
        { name: 'Branches', sub: 'Find a nearby branch', icon: 'columns', route: 'branches' },
        { name: 'Agents', sub: 'Find a CBE agent', icon: 'store', route: 'agents' },
        { name: 'Other Services', sub: 'USSD, CBE Links, feedback', icon: 'grid', route: 'otherServices' },
        { name: 'My Information', sub: 'Profile, accounts and QR', icon: 'person', route: 'myInfo' },
        { name: 'Settings', sub: 'Preferences and security', icon: 'gear', route: 'settings' }
      ];
      return '<section class="screen">' +
        U.appbar('More Services') +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="group" style="margin-top:6px">' +
            items.map(function (it) {
              return U.listRowSimple({ title: it.name, sub: it.sub, icon: it.icon, goto: it.route });
            }).join('') +
          '</div>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* -------------------------------------------------------- menu search */
  CBE.define('searchMenu', {
    render: function () {
      return '<section class="screen">' +
        '<header class="appbar" style="padding-bottom:22px">' +
          '<div class="appbar-search">' +
            '<button class="icon-btn" data-action="back" style="width:36px;height:36px;display:grid;place-items:center;color:#fff">' + CBE.icon('chevronLeft', { size: 23 }) + '</button>' +
            '<span style="color:#fff;display:grid;place-items:center">' + CBE.icon('search', { size: 21 }) + '</span>' +
            '<input id="menu-search" placeholder="' + U.esc(CBE.t('searchMenu')) + '" autocomplete="off">' +
            '<button class="icon-btn" data-action="clearSearch" style="width:36px;height:36px;display:grid;place-items:center;color:#fff">' + CBE.icon('x', { size: 20 }) + '</button>' +
          '</div>' +
        '</header>' +
        '<div class="sheet-light" style="margin-top:-16px"><div class="screen-body no-nav" id="menu-results">' +
          '<p class="search-empty">' + U.esc(CBE.t('typeToSearch')) + '</p>' +
        '</div></div>' +
      '</section>';
    },
    after: function () {
      var input = document.getElementById('menu-search');
      var out = document.getElementById('menu-results');
      var catalog = CBE.data.serviceCatalog;
      function paint(q) {
        q = (q || '').trim().toLowerCase();
        if (!q) { out.innerHTML = '<p class="search-empty">' + U.esc(CBE.t('typeToSearch')) + '</p>'; return; }
        var hits = catalog.filter(function (c) {
          return (c.name + ' ' + c.group).toLowerCase().indexOf(q) >= 0;
        });
        out.innerHTML = hits.length ? hits.map(function (c) {
          return '<button class="search-hit" data-goto="' + U.esc(c.route) + '" data-action="goto" style="width:100%">' +
            '<span class="ic">' + CBE.icon('search', { size: 19 }) + '</span>' +
            '<span style="flex:1;text-align:left"><b>' + U.esc(c.name) + '</b><small>' + U.esc(c.group) + '</small></span>' +
            CBE.icon('chevronRight', { size: 18 }) + '</button>';
        }).join('') : U.emptyState(CBE.t('noResults'));
      }
      if (input) {
        input.addEventListener('input', function () { paint(input.value); });
        setTimeout(function () { input.focus(); }, 140);
      }
      CBE._paintSearch = paint;
    }
  });

  /* -------------------------------------------------------- QR scanner */
  var flashOn = false;
  CBE.define('scanner', {
    render: function () {
      return '<section class="screen no-anim" style="background:#0b0d0f">' +
        '<header class="appbar" style="background:#5b1d8f;border-radius:0">' +
          '<button class="icon-btn" data-action="back">' + CBE.icon('chevronLeft', { size: 24 }) + '</button>' +
          '<h1>' + U.esc(CBE.t('scanQr')) + '</h1>' +
        '</header>' +
        '<div class="scanner" style="position:relative;inset:auto;flex:1;background:#0b0d0f">' +
          '<div class="viewport"><div class="frame"><i></i><i></i><i></i><i></i><div class="laser"></div></div></div>' +
          '<div class="hint">Place the QR Code within the frame</div>' +
          '<div class="tools">' +
            '<button class="tool' + (flashOn ? ' on' : '') + '" data-action="toggleTorch">' +
              '<span class="circle">' + CBE.icon('star', { size: 20, fill: flashOn ? '#20242a' : '#fff' }) + '</span>Flash on</button>' +
            '<button class="tool" data-action="pickGallery">' +
              '<span class="circle">' + CBE.icon('doc', { size: 20 }) + '</span>Gallery</button>' +
            '<span class="zoombar"></span>' +
          '</div>' +
        '</div>' +
      '</section>';
    },
    after: function () {
      setTimeout(function () {
        if (CBE.currentScreen().name !== 'scanner') return;
        U.toast('QR code detected — Selam Shop');
        var recipient = { name: 'Selam Shop', account: '1********8820', scanned: true };
        CBE.state.transferDraft = { recipient: recipient };
        setTimeout(function () {
          if (CBE.currentScreen().name === 'scanner') CBE.nav('transfer', { recipient: recipient, amount: 250 });
        }, 600);
      }, 2600);
    }
  });
})(typeof window !== 'undefined' ? window : this);
