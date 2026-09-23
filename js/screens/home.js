/* ==========================================================================
   home.js — the greeting bar, the balance card, the tool tiles, the six
   service cards, the quick row and the transactions list.
   ========================================================================== */
(function (global) {
  'use strict';

  var CBE = global.CBE || (global.CBE = {});
  var h = CBE.h, icon = CBE.icon, raw = CBE.raw;
  var st = CBE.state;

  var HIDDEN = true;                     /* amount masked on first paint */
  function isHidden() { return HIDDEN; }
  function toggleHidden() { HIDDEN = !HIDDEN; }

  /* --------------------------------------------------------- greeting bar */
  function homeBar() {
    return h`
      <header class="appbar appbar--home">
        <button class="icon-btn" data-a="myInformation" aria-label="My information">${raw(icon('grid4', 19, 'grid-mark'))}</button>
        <div class="greeting">
          <small>Hello,</small>
          <b>${firstName()}</b>
        </div>
        <button class="lang-pill" data-a="langSheet">${st.lang === 'am' ? '\u12a0\u121b\u122d\u129b' : 'English'} ${raw(icon('chevronDown', 13))}</button>
        <button class="icon-btn" data-a="refresh" aria-label="Refresh">${raw(icon('refresh', 21))}</button>
        <button class="icon-btn" data-a="search" aria-label="Search">${raw(icon('search', 22))}</button>
      </header>`;
  }

  function firstName() {
    var parts = String(st.holder.name || '').trim().split(/\s+/);
    return parts.length ? parts[0] : 'there';
  }

  /* ---------------------------------------------------------- balance card */
  function balCard() {
    var noor = st.noor;
    var brand = noor
      ? h`<div class="bal-card__brand bal-card__brand--noor">
            <span style="display:grid;place-items:center;width:28px;height:28px;background:linear-gradient(140deg,#a04a6a,#5d1793);border-radius:6px;color:#fff;font:700 10px/1 Georgia,serif">\u0646\u0648\u0631</span>
            <span style="text-align:left">
              <b>CBE NOOR</b>
              <small>\u1209\u120d \u1291\u122d</small>
            </span>
          </div>`
      : h`<div class="bal-card__brand">
            <img src="img/cbe-logo.png" alt="">
            <span style="text-align:left">
              <b>${st.letterhead.company}</b>
              <small>${st.letterhead.tagline}</small>
            </span>
          </div>`;

    var amount = isHidden()
      ? '<b style="letter-spacing:.06em">******</b>'
      : '<b>' + CBE.money(st.holder.balance) + '</b>';

    var account = isHidden()
      ? CBE.cardAcct(st.holder.account)
      : CBE.digits(st.holder.account);

    return h`
      <div class="bal-wrap">
        <div class="bal-card">
          ${raw(brand)}
          <div class="bal-card__amount">
            ${raw(amount)}<span>ETB</span>
            <button class="bal-card__eye" data-a="toggleAmount" aria-label="${isHidden() ? 'Show' : 'Hide'} balance">
              ${raw(icon(isHidden() ? 'eyeOff' : 'eye', 21))}
            </button>
          </div>
          <div class="bal-card__acc">
            <span>${st.accountType} ${account}</span>
            <button class="icon-btn" data-a="copyAccount" aria-label="Copy account number">${raw(icon('copy', 15))}</button>
          </div>
          <div class="bal-card__time">${CBE.fmtDay(new Date(st.accountUpdated || Date.now()))}</div>
        </div>
      </div>`;
  }

  /* ---------------------------------------------------------------- tiles */
  var TILES = [
    { label: 'Mini Statement', icon: 'doc', go: 'miniStatement' },
    { label: 'Cash Out', icon: 'coins', go: 'cashOut' },
    { label: 'Bill Share', icon: 'share', go: 'billShare' },
    { label: 'Cards', icon: 'creditCard', go: 'cards' },
    { label: 'CBE Fast Loan', icon: 'bolt', go: 'fastLoan' },
    { label: 'Shopping', icon: 'cart', go: 'shopping' },
    { label: 'Tax Payment', icon: 'percent', go: 'taxPayment' },
    { label: 'Pay Merchant', icon: 'tag', go: 'payMerchant' },
    { label: 'Forex', icon: 'exchange', go: 'forex' },
    { label: 'Loan Products', icon: 'bankCard', go: 'loanProducts' },
    { label: 'Micro Finance', icon: 'briefcase', go: 'microFinance' },
    { label: 'SACCO', icon: 'users', go: 'sacco' },
    { label: 'Traffic Fine', icon: 'car', go: 'trafficFine' },
    { label: 'Donation', icon: 'gift', go: 'donation' }
  ];

  function tileRow() {
    return h`
      <div class="tile-wrap">
        <div class="tile-row">
          ${TILES.map(function (t) {
            return h`<button class="tile" data-a="go" data-go="${t.go}" data-label="${t.label}">
              <span class="tile__icon">${raw(icon(t.icon, 22))}</span>
              <span class="tile__label">${t.label}</span>
            </button>`;
          })}
        </div>
      </div>`;
  }

  var CARDS = [
    { label: 'CBE Transfer', sub: 'Send Money', icon: 'arrowUpRight', tone: 'rose', go: 'cbeTransfer' },
    { label: 'Receive', sub: 'Get Paid', icon: 'arrowDownLeft', tone: 'mint', go: 'receiveMoney' },
    { label: 'Airtime', icon: 'phone', tall: true, go: 'airtime' },
    { label: 'Other Transfers', icon: 'arrowsSwap', tall: true, go: 'otherTransfers' },
    { label: 'CBEBirr', icon: 'wallet', tall: true, go: 'cbeBirr' },
    { label: 'Bills & Utilities', icon: 'listRows', tall: true, go: 'bills' }
  ];

  function cardGrid() {
    return h`
      <div class="card-grid">
        ${CARDS.map(function (c) {
          return h`<button class="card-btn${c.tall ? ' card-btn--tall' : ''}" data-a="go" data-go="${c.go}" data-label="${c.label}">
            <span class="card-btn__icon${c.tone ? ' card-btn__icon--disc card-btn__icon--' + c.tone : ''}">${raw(icon(c.icon, c.tall ? 26 : 22))}</span>
            <span class="card-btn__text">
              <b>${c.label}</b>
              ${c.sub ? raw('<small>' + CBE.esc(c.sub) + '</small>') : ''}
            </span>
          </button>`;
        })}
      </div>`;
  }

  function quickRow() {
    return h`
      <div class="quick-row">
        <button class="quick-row__item" data-a="go" data-go="branches" aria-label="Branches">${raw(icon('bank', 26))}</button>
        <button class="scan-pill" data-a="go" data-go="scanner">${raw(icon('qr', 22))}<span>Scan QR</span></button>
        <button class="quick-row__item" data-a="go" data-go="agents" aria-label="Agents">${raw(icon('atm', 26))}</button>
      </div>`;
  }

  /* ================================================================ screens */
  CBE.define('home', function () {
    return {
      appbar: false,
      bodyClass: 'home-body',
      nav: 'home',
      body: h`
        ${raw(homeBar())}
        ${raw(balCard())}
        <div class="handle"></div>
        <div class="sect">${raw(tileRow())}</div>
        ${raw(cardGrid())}
        ${raw(quickRow())}`,
      onMount: function (node) {
        pageTiles(node);
      },
      fab: ''
    };
  });

  /* the tile strip pages through 4 at a time, exactly as the little chevron
     button on the reference screenshot implies */
  function pageTiles(node) {
    var row = node.querySelector('.tile-row');
    var wrap = node.querySelector('.tile-wrap') || row;
    if (!row || !wrap) return;
    if (row.scrollWidth <= row.clientWidth + 4) return;
    var more = document.createElement('button');
    more.className = 'tile-more';
    more.setAttribute('data-a', 'tileNext');
    more.setAttribute('aria-label', 'More services');
    more.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9.4 5.6 15.8 12l-6.4 6.4"/></svg>';
    wrap.appendChild(more);
  }

  CBE.define('transactions', function () {
    var all = CBE.store.txList();
    var filter = CBE.txFilter || 'all';
    var list = all.filter(function (t) {
      if (filter === 'debit') return t.direction === 'out';
      if (filter === 'credit') return t.direction === 'in';
      return true;
    });
    return {
      appbar: false,
      bodyClass: 'home-body',
      nav: 'transactions',
      body: h`
        ${raw(homeBar())}
        ${raw(balCard())}
        <div class="handle"></div>
        <div class="tx-tabs">
          <div class="seg" style="flex:1 1 auto;padding:0">
            <button class="seg__item${filter === 'all' ? ' is-active' : ''}" data-a="txFilter" data-filter="all"><span>All</span></button>
            <button class="seg__item${filter === 'debit' ? ' is-active' : ''}" data-a="txFilter" data-filter="debit"><span>Debited</span></button>
            <button class="seg__item${filter === 'credit' ? ' is-active' : ''}" data-a="txFilter" data-filter="credit"><span>Credited</span></button>
          </div>
          <button class="seg__search" data-a="search" aria-label="Search transactions">${raw(icon('search', 22))}</button>
        </div>
        <div class="tx-list">
          ${list.length ? list.map(function (t) {
            return h`<button class="tx-row" data-a="txOpen" data-name="${t.name}" data-amount="${t.amount}" data-kind="${t.kind}">
              <span class="tx-row__icon tx-row__icon--${t.direction === 'out' ? 'out' : 'in'}">${raw(icon(t.direction === 'out' ? 'arrowUpRight' : 'arrowDownLeft', 22))}</span>
              <span class="tx-row__main">
                <b>${t.name}</b>
                <small>${CBE.fmtStamp(t.date)}</small>
              </span>
              <span class="tx-row__amt">
                <b class="is-${t.direction === 'out' ? 'out' : 'in'}">${t.amount < 0 ? '-' : '+'}${CBE.money(Math.abs(t.amount))} ETB</b>
                <span class="chip">${t.kind}</span>
              </span>
            </button>`;
          }) : raw('<div class="empty-state">No transactions in this view.</div>')}
        </div>`
    };
  });

  CBE.home = { balCard: balCard, homeBar: homeBar, toggleHidden: toggleHidden, isHidden: isHidden, TILES: TILES };
})(typeof window !== 'undefined' ? window : this);
