/* ==========================================================================
   screens-services.js — Banking, Beneficiary, Account Cards, Government
   Services, Cash Out, Withdrawal History, Branches, Agents, Micro Finance,
   SACCO, Loans, Forex, Pay for, Pay Merchant, Travel, Shopping, Entertainment
   and the "coming soon" placeholders from the reference screenshots.
   ========================================================================== */
(function (global) {
  'use strict';
  var CBE = global.CBE;
  var U = CBE.ui;

  var miniFilter = 'all';
  var cardsTab = 'issued';
  var cardMode = 'new';
  var cardAccountIdx = 0;
  var cardType = null;
  var cardBranch = null;
  var payForPage = 0;

  var branchList = [
    { name: 'Ras Desta Damtew Branch', addr: 'Kirkos, Addis Ababa', dist: '0.8 km' },
    { name: 'Bole Medhanialem Branch', addr: 'Bole, Addis Ababa', dist: '2.4 km' },
    { name: 'Meskel Flower Branch', addr: 'Yeka, Addis Ababa', dist: '3.1 km' },
    { name: 'Mexico Branch', addr: 'Arada, Addis Ababa', dist: '4.6 km' },
    { name: 'Sarris Branch', addr: 'Nifas Silk, Addis Ababa', dist: '5.2 km' }
  ];
  var agentList = [
    { name: 'Selam Shop Agent', addr: 'Kirkos, Woreda 03', dist: '0.3 km' },
    { name: 'Zewditu Mini Market', addr: 'Yeka, Woreda 05', dist: '1.1 km' },
    { name: 'Hana Kiosk', addr: 'Bole, Woreda 02', dist: '1.9 km' },
    { name: 'Alem Mobile Agent', addr: 'Gulele, Woreda 08', dist: '2.7 km' }
  ];

  var cardsState = [
    { id: 'c1', number: '4583 00** **** 4234', exp: '30 DEC 2030', type: 'DEBIT'.replace('DEBIT', 'VISA DEBIT'), account: '1********3619', status: 'Active' }
  ];
  var requestedCards = [];
  var withdrawalHistory = [];

  /* -------------------------------------------------------- mini statement */
  CBE.define('miniStatement', {
    render: function () {
      return U.comingSoon({
        title: 'Mini Statement',
        icon: 'rocket',
        text: 'We are working on a new Mini Statement feature! You will soon be able to pick your account and set a time range to generate your statement.',
        cta: 'Go Back'
      });
    }
  });

  /* ------------------------------------------------------------- cash out */
  CBE.define('cashOut', {
    render: function () {
      return '<section class="screen">' +
        U.appbar(CBE.t('cashOut'), { right: '<button class="icon-btn" data-goto="withdrawalHistory" data-action="goto" aria-label="History">' + CBE.icon('clock', { size: 21 }) + '</button>' }) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="field-label" style="margin-top:14px">Agent code</div>' +
          U.field({ icon: 'store', inputId: 'co-agent', name: 'agent', placeholder: 'Enter agent code', inputmode: 'numeric' }) +
          '<div class="field-label">' + U.esc(CBE.t('amount')) + '</div>' +
          U.field({ icon: 'cash', inputId: 'co-amount', name: 'amount', placeholder: CBE.t('enterAmount'), inputmode: 'decimal', tailAction: 'openAmountSheet', tail: CBE.icon('card', { size: 20 }) }) +
          '<button class="btn btn-primary" style="margin-top:22px" data-action="cashOutPay">' + U.esc(CBE.t('continue')) + '</button>' +
          '<div class="pill-note">' + CBE.icon('store', { size: 20 }) +
            '<span>Collect the cash from the agent after you authorise the withdrawal with your PIN.</span></div>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* ---------------------------------------------------- withdrawal history */
  CBE.define('withdrawalHistory', {
    render: function () {
      return '<section class="screen">' +
        U.appbar('Withdrawal History', { right: '<button class="icon-btn" data-action="clearWithdrawals">' + CBE.icon('trash', { size: 20 }) + '</button>' }) +
        '<div class="sheet-light"><div class="screen-body no-nav">' +
          (withdrawalHistory.length ? '<div class="group" style="margin-top:14px">' + withdrawalHistory.map(function (w) {
            return '<div class="row"><span class="ico">' + CBE.icon('cashOut', { size: 20 }) + '</span>' +
              '<span class="txt"><b>' + U.esc(w.agent) + '</b><small>' + U.esc(U.shortDate(w.date)) + '</small></span>' +
              '<span class="txt" style="flex:0 0 auto;text-align:right"><b>' + U.moneyCur(w.amount) + '</b>' +
              '<small>' + U.esc(w.status) + '</small></span></div>';
          }).join('') + '</div>'
            : U.emptyVisual({
              icon: 'cardStack',
              title: 'No withdrawal requests found yet.',
              text: 'When you initiate a withdrawal, it will show up here.',
              cta: 'Refresh History', ctaIcon: 'refresh', action: 'refreshHistory'
            }) +
            '<div style="display:flex;justify-content:center;margin-top:8px">' +
              '<button class="pill-btn ghost" data-goto="cashOut" data-action="goto">' + CBE.icon('plusCircle', { size: 18 }) + 'New Withdrawal</button>' +
            '</div>') +
        '</div></div>' +
      '</section>';
    }
  });

  /* ----------------------------------------------------------- bill share */
  CBE.define('billShare', {
    render: function () {
      return U.comingSoon({
        title: 'Bill Share',
        icon: 'splitShare',
        text: 'Bill Share is on the way! Soon you will be able to split and share your bills with ease. Stay tuned for the launch!',
        cta: 'Go Back'
      });
    }
  });

  /* -------------------------------------------------------- account cards */
  CBE.define('cards', {
    render: function () {
      var tabs = '<div class="tabs" style="margin-top:8px">' +
        ['issued', 'requested', 'request'].map(function (k) {
          var label = k.charAt(0).toUpperCase() + k.slice(1);
          return '<button class="tab' + (cardsTab === k ? ' active' : '') + '" data-card-tab="' + k + '">' + label + '</button>';
        }).join('') + '</div>';

      var body = '';
      if (cardsTab === 'issued') body = issuedTab();
      else if (cardsTab === 'requested') body = requestedTab();
      else body = requestTab();

      return '<section class="screen">' +
        U.appbar('Account Cards') +
        '<div class="sheet-light"><div class="screen-body">' +
          tabs + '<div style="padding-top:18px">' + body + '</div>' +
        '</div></div>' +
      '</section>';
    }
  });

  function issuedTab() {
    if (!cardsState.length) return U.emptyState('No issued cards');
    return cardsState.map(function (c) {
      var p = CBE.state.profile;
      return '<div class="card-visual" style="margin-bottom:18px">' +
        '<div class="brandline">' + CBE.cbeLogo(34) +
          '<div style="text-align:right"><div class="nm">Commercial Bank of Ethiopia</div>' +
          '<div class="tg">The bank you can always rely on!</div></div>' +
        '</div>' +
        '<div class="wave">' + CBE.icon('contactless', { size: 26 }) + '</div>' +
        '<div class="numbers"><span>4583 00**</span><span>**** 4234</span></div>' +
        '<div class="foot">' +
          '<div><div class="holder">' + U.esc(p.holderName) + '</div>' +
          '<div class="exp">' + U.esc(c.exp) + '</div></div>' +
          CBE.icon('chip', { size: 28 }) +
        '</div>' +
      '</div>' +
      '<div class="card-meta">' +
        '<div class="m"><span class="ico">' + CBE.icon('cardStack', { size: 18 }) + '</span>1 Card(s)</div>' +
        '<div class="m"><span class="ico">' + CBE.icon('bankNote', { size: 18 }) + '</span>' + U.esc(U.maskAccount(p.accountNumber)) + '</div>' +
        '<div class="m"><span class="ico">' + CBE.icon('shieldCheck', { size: 18 }) + '</span>' + U.esc(c.status) + ' • Daily limit ' + U.moneyCur(20000) + '</div>' +
      '</div>' +
      '<div class="btn-stack">' +
        '<button class="btn btn-soft" data-action="freezeCard" data-value="' + c.id + '">Freeze card</button>' +
        '<button class="btn btn-primary" data-card-tab="request">Request replacement</button>' +
      '</div>';
    }).join('');
  }

  function requestedTab() {
    if (!requestedCards.length) return U.emptyState('No requested cards');
    return '<div class="group">' + requestedCards.map(function (r) {
      return '<div class="row"><span class="ico">' + CBE.icon('card', { size: 20 }) + '</span>' +
        '<span class="txt"><b>' + U.esc(r.type) + '</b><small>' + U.esc(r.branch) + ' • ' + U.esc(U.shortDate(r.date)) + '</small></span>' +
        '<span class="chip purple">PENDING</span></div>';
    }).join('') + '</div>';
  }

  function requestTab() {
    var acc = CBE.state.accounts[cardAccountIdx] || CBE.state.accounts[0];
    return '<div class="field-label" style="margin-top:0">Select your account</div>' +
      '<button class="select-box" data-action="pickCardAccount">' +
        '<span class="fico">' + CBE.icon('bankNote', { size: 20 }) + '</span>' +
        '<span class="val">' + U.esc(acc.label) + '</span>' +
        CBE.icon('chevronDown', { size: 20 }) +
      '</button>' +

      '<div class="field-label">Card request type</div>' +
      '<div class="radio-line' + (cardMode === 'new' ? ' on' : '') + '" data-card-mode="new">' +
        '<span class="dot">' + (cardMode === 'new' ? CBE.icon('check', { size: 14, weight: 3 }) : '') + '</span><span>NEW</span></div>' +
      '<div class="radio-line' + (cardMode === 'replacement' ? ' on' : '') + '" data-card-mode="replacement">' +
        '<span class="dot">' + (cardMode === 'replacement' ? CBE.icon('check', { size: 14, weight: 3 }) : '') + '</span><span>Replacement</span></div>' +

      (cardMode === 'replacement' ? '<p class="center muted" style="font-size:14px;padding:24px 0">Coming soon!</p>' : '') +

      '<div class="field-label">Select card type</div>' +
      '<button class="select-box tall" data-action="pickCardType">' +
        '<span class="fico">' + CBE.icon('card', { size: 20 }) + '</span>' +
        '<span class="val">' + U.esc(cardType || 'Select from the list') + '</span>' +
        '<span class="corner">' + CBE.icon('sliders', { size: 16 }) + '</span>' +
      '</button>' +

      '<div class="field-label">Select Branch</div>' +
      '<button class="select-box tall" data-action="pickCardBranch">' +
        '<span class="fico">' + CBE.icon('columns', { size: 20 }) + '</span>' +
        '<span class="val">' + U.esc(cardBranch || 'Select from the list') + '</span>' +
        '<span class="corner">' + CBE.icon('sliders', { size: 16 }) + '</span>' +
      '</button>' +

      (cardMode === 'new'
        ? '<button class="btn btn-primary" style="margin-top:24px" data-action="sendCardRequest">Send Request</button>'
        : '<button class="btn btn-soft" style="margin-top:24px" disabled>Send Request</button>');
  }

  /* -------------------------------------------------------------- banking */
  CBE.define('banking', {
    render: function () {
      return '<section class="screen">' +
        U.appbar(CBE.t('banking')) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="tile-grid" style="margin-top:6px">' +
            CBE.data.bankingServices.map(function (s) {
              return '<button class="tile" data-goto="' + s.route + '" data-action="goto">' +
                '<span class="ic">' + CBE.icon(s.icon, { size: 26 }) + '</span>' +
                '<span class="lbl">' + U.esc(s.name) + '</span></button>';
            }).join('') +
          '</div>' +
        '</div></div>' +
        U.tabbar('home') +
      '</section>';
    }
  });

  CBE.define('beneficiary', {
    render: function () {
      var list = CBE.state.beneficiaries.concat(CBE.state.recents);
      return '<section class="screen">' +
        U.appbar('Beneficiary', { right: '<button class="icon-btn" data-action="addBeneficiary" aria-label="Add">' + CBE.icon('userPlus', { size: 21 }) + '</button>' }) +
        '<div class="sheet-light"><div class="screen-body">' +
          (list.length ? '<div class="group" style="margin-top:12px">' + list.map(function (b) {
            return '<button class="row" data-action="useRecipient" data-value="' + U.esc(b.id) + '">' +
              '<span class="ico round">' + U.esc(U.initials(b.name)) + '</span>' +
              '<span class="txt"><b>' + U.esc(b.name) + '</b><small>' + U.esc(b.account) + '</small></span>' +
              '<span class="chev">' + CBE.icon('arrowUpRight', { size: 19 }) + '</span></button>';
          }).join('') + '</div>' : U.emptyState('No beneficiaries yet') ) +
          '<div class="pill-note">' + CBE.icon('userPlus', { size: 20 }) +
            '<span>Beneficiaries are stored on this device only. Tap the plus icon to add one.</span></div>' +
        '</div></div>' +
        U.tabbar('home') +
      '</section>';
    }
  });

  /* -------------------------------------------------------- government */
  CBE.define('government', {
    render: function () {
      return '<section class="screen">' +
        U.appbar(CBE.t('government')) +
        '<div class="sheet-light"><div class="screen-body">' +
            '<div class="gov-list" style="margin-top:4px">' +
              CBE.data.governmentServices.map(function (s) {
                return U.govItem({
                  title: s.name, sub: s.sub, icon: s.icon,
                  goto: 'govForm', value: s.name
                });
              }).join('') +
            '</div>' +
          '</div>' +
        '</div></div>' +
        U.tabbar('home') +
      '</section>';
    }
  });

  CBE.define('govForm', {
    render: function (p) {
      var name = p.value || 'Tax Payment';
      return '<section class="screen">' +
        U.appbar(name) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="field-label" style="margin-top:14px">Reference number</div>' +
          U.field({ icon: 'edit', inputId: 'g-ref', name: 'ref', placeholder: 'Enter reference number' }) +
          '<div class="field-label">' + U.esc(CBE.t('amount')) + '</div>' +
          U.field({ icon: 'cash', inputId: 'g-amount', name: 'amount', placeholder: CBE.t('enterAmount'), inputmode: 'decimal', tailAction: 'openAmountSheet', tail: CBE.icon('card', { size: 20 }) }) +
          '<button class="btn btn-primary" style="margin-top:22px" data-action="govPay" data-value="' + U.esc(name) + '">' + U.esc(CBE.t('continue')) + '</button>' +
          '<div class="pill-note">' + CBE.icon('shieldCheck', { size: 20 }) +
            '<span>A government receipt is generated with the payment reference and stored in your transactions.</span></div>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* --------------------------------------------------- branches and agents */
  function placeScreen(kind) {
    var list = kind === 'branches' ? branchList : agentList;
    return '<section class="screen">' +
      U.appbar(kind === 'branches' ? 'Branches' : 'Agents') +
      '<div class="sheet-light"><div class="screen-body">' +
        (kind === 'branches'
          ? '<div class="group" style="margin-top:6px;padding:14px"><b style="font-size:13.5px">' + U.esc(CBE.state.profile.holderName) + '</b>' +
            '<small class="muted" style="display:block;font-size:12px;margin-top:4px">Your account ' + U.esc(U.maskAccount(CBE.state.profile.accountNumber)) + ' is domiciled at Ras Desta Damtew Branch</small></div>'
          : '') +
        '<div class="group" style="margin-top:12px">' +
          list.map(function (p) {
            return '<button class="row tall" data-action="placeDetail" data-value="' + U.esc(p.name + '|' + p.addr + '|' + p.dist) + '">' +
              '<span class="ico">' + CBE.icon(kind === 'branches' ? 'columns' : 'store', { size: 21 }) + '</span>' +
              '<span class="txt"><b>' + U.esc(p.name) + '</b><small>' + U.esc(p.addr) + ' · ' + U.esc(p.dist) + '</small></span>' +
              '<span class="chev">' + CBE.icon('chevronRight', { size: 20 }) + '</span></button>';
          }).join('') +
        '</div>' +
        '<div class="pill-note">' + CBE.icon('pin', { size: 20 }) +
          '<span>Distances are demo values. Open a location to call, copy the address or share it.</span></div>' +
      '</div></div>' +
      U.tabbar('home') +
    '</section>';
  }
  CBE.define('branches', { render: function () { return placeScreen('branches'); } });
  CBE.define('agents', { render: function () { return placeScreen('agents'); } });

  /* ------------------------------------------------- micro finance transfer */
  CBE.define('microForm', {
    render: function () {
      var sel = CBE.state.selectedMfi;
      return '<section class="screen">' +
        U.appbar('Transfer to Micro Finance') +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="field-label" style="margin-top:14px">Microfinance Name</div>' +
          '<button class="field" data-action="pickMfi" style="width:100%">' +
            '<span class="fico">' + CBE.icon('moneyBag', { size: 21 }) + '</span>' +
            '<span style="flex:1;text-align:left;font-size:15px;color:' + (sel ? 'var(--ink)' : '#a7aeb4') + '">' +
              U.esc(sel ? sel.name : CBE.t('selectFromList')) + '</span>' +
            '<span class="tail">' + CBE.icon('chevronDown', { size: 20 }) + '</span></button>' +
          '<div class="field-label">' + U.esc(CBE.t('account')) + '</div>' +
          U.field({ icon: 'edit', inputId: 'mf-account', name: 'account', placeholder: CBE.t('enterAccountNumber'), inputmode: 'numeric', maxlength: 18 }) +
          '<div class="field-label">' + U.esc(CBE.t('amount')) + '</div>' +
          U.field({ icon: 'cash', inputId: 'mf-amount', name: 'amount', placeholder: CBE.t('enterAmount'), inputmode: 'decimal', tailAction: 'openAmountSheet', tail: CBE.icon('card', { size: 20 }) }) +
          '<button class="btn btn-primary" style="margin-top:22px" data-action="mfiPay">' + U.esc(CBE.t('continue')) + '</button>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* -------------------------------------------------------------- sacco */
  CBE.define('saccos', {
    render: function () {
      return '<section class="screen">' +
        U.appbar(CBE.t('sacco'), { right: '<button class="icon-btn" data-action="searchSacco" aria-label="Search">' + CBE.icon('search', { size: 21 }) + '</button>' }) +
        '<div class="sheet-light"><div class="screen-body">' +
            '<div class="logo-grid">' + CBE.data.saccos.map(function (s) {
              return '<button class="logo-tile" data-action="saccoPay" data-value="' + U.esc(s.name) + '">' +
                '<span class="brand">' + U.badge(s, 'lg') + '</span>' +
                '<span>' + U.esc(s.name) + '</span></button>';
            }).join('') + '</div>' +
          '</div>' +
        '</div></div>' +
        U.tabbar('home') +
      '</section>';
    }
  });

  CBE.define('microFinances', { render: function () { return CBE.screens.microForm.render(); } });

  /* ------------------------------------------- transfer to other banks list */
  function externalListScreen(title, list, group) {
    return '<section class="screen">' +
      U.appbar(title, { right: '<button class="icon-btn" data-action="pickBank" aria-label="Search">' + CBE.icon('search', { size: 21 }) + '</button>' }) +
      '<div class="sheet-light"><div class="screen-body">' +
        '<div class="group" style="margin-top:8px">' +
          list.map(function (b) {
            return '<button class="row" data-goto="externalAccount" data-action="goto" data-value="' + U.esc(b.name + '|' + group) + '">' +
              '<span class="ico plain">' + U.badge(b, 'sm') + '</span>' +
              '<span class="txt"><b>' + U.esc(b.name) + '</b><small>Transfer from ' + U.esc(U.maskAccount(CBE.state.profile.accountNumber)) + '</small></span>' +
              '<span class="chev">' + CBE.icon('chevronRight', { size: 20 }) + '</span></button>';
          }).join('') +
        '</div>' +
      '</div></div>' +
      U.tabbar('home') +
    '</section>';
  }
  CBE.define('banksList', { render: function () { return externalListScreen(CBE.t('transferToOtherBanks'), CBE.data.banks, 'Other Banks'); } });

  CBE.define('externalAccount', {
    render: function (p) {
      var parts = String(p.value || '').split('|');
      var name = parts[0] || 'Institution', group = parts[1] || '';
      return '<section class="screen">' +
        U.appbar('Account Validation') +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="field" style="margin-top:12px">' +
            '<span class="fico">' + CBE.icon('columns', { size: 20 }) + '</span>' +
            '<span style="flex:1;min-width:0"><b style="display:block;font-size:14.5px">' + U.esc(name) + '</b>' +
            '<small style="display:block;font-size:11.5px;color:var(--muted);margin-top:3px">' + U.esc(group) + '</small></span></div>' +
          '<div class="field-label">' + U.esc(CBE.t('account')) + '</div>' +
          U.field({ icon: 'edit', inputId: 'x-account', name: 'account', placeholder: CBE.t('enterAccountNumber'), inputmode: 'numeric' }) +
          '<div class="field-label">' + U.esc(CBE.t('amount')) + '</div>' +
          U.field({ icon: 'cash', inputId: 'x-amount', name: 'amount', placeholder: CBE.t('enterAmount'), inputmode: 'decimal', tailAction: 'openAmountSheet', tail: CBE.icon('card', { size: 20 }) }) +
          '<button class="btn btn-primary" style="margin-top:22px" data-action="externalPay" data-value="' + U.esc(name) + '">' + U.esc(CBE.t('continue')) + '</button>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* ---------------------------------------------------------- pay for grid */
  CBE.define('payFor', {
    render: function () {
      var all = CBE.data.payMerchants;
      var perPage = 12;
      var pages = Math.ceil(all.length / perPage) || 1;
      if (payForPage >= pages) payForPage = 0;
      var slice = all.slice(payForPage * perPage, payForPage * perPage + perPage);
      return '<section class="screen">' +
        U.appbar('Pay for') +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="merchant-grid" style="grid-template-columns:1fr 1fr">' +
            slice.map(function (m) {
              return U.merchantTile({
                title: m.name, icon: m.icon, mark: m.mark,
                goto: 'merchantPay', value: m.name + '|payfor|BILL PAYMENT|0'
              });
            }).join('') +
          '</div>' +
          (pages > 1 ? '<div class="pager">' + new Array(pages).join(0).split('').map(function (_, i) {
            return '<i class="' + (i === payForPage ? 'on' : '') + '" data-pay-page="' + i + '"></i>';
          }).join('') + '</div>' : '') +
        '</div></div>' +
        U.tabbar('home') +
      '</section>';
    }
  });

  /* Pay for "pages" need real buttons, the dots are read-only decoration */
  CBE.define('payForPage', { render: function () { return CBE.screens.payFor.render(); } });

  /* ------------------------------------------------------------- tax */
  CBE.define('taxPayment', {
    render: function () {
      return '<section class="screen">' +
        U.appbar('Tax Payment') +
        '<div class="sheet-light"><div class="screen-body">' +
            '<div class="gov-list" style="margin-top:4px">' +
              CBE.data.taxPayments.map(function (s) {
                return U.govItem({ title: s.name, sub: s.sub, icon: s.icon, goto: 'govForm', value: s.name });
              }).join('') +
            '</div>' +
          '</div>' +
        '</div></div>' +
        U.tabbar('home') +
      '</section>';
    }
  });

  /* ------------------------------------------------- shopping / entertainment */
  function simpleGrid(title, list, kind) {
    return '<section class="screen">' +
      U.appbar(title) +
      '<div class="sheet-light"><div class="sheet-light" style="margin-top:0;padding-top:12px">' +
        '<div class="screen-body">' +
          '<div class="tile-grid" style="margin-top:4px">' + list.map(function (m) {
            var inner = m.mark
              ? '<span class="mark" style="width:34px;height:34px;border-radius:10px;background:var(--purple-050);display:grid;place-items:center;color:var(--purple-500);font-weight:800;font-size:11px">' + U.esc(m.mark) + '</span>'
              : CBE.icon(m.icon || 'cart', { size: 26 });
            return '<button class="tile" data-goto="merchantPay" data-action="goto" data-value="' +
              U.esc(m.name + '|' + kind + '|BILL PAYMENT|0') + '">' +
              '<span class="ic">' + inner + '</span>' +
              '<span class="lbl">' + U.esc(m.name) + '</span></button>';
          }).join('') + '</div>' +
        '</div>' +
      '</div></div>' +
      U.tabbar('home') +
    '</section>';
  }
  CBE.define('shopping', { render: function () { return simpleGrid('Shopping', CBE.data.shoppingMerchants, 'shopping'); } });
  CBE.define('entertainment', { render: function () { return simpleGrid('Entertainment', CBE.data.entertainmentMerchants, 'entertainment'); } });

  /* ------------------------------------------------------------- travel */
  CBE.define('travel', {
    render: function () {
      return simpleGridTiles('Travel', CBE.data.travelServices);
    }
  });
  function simpleGridTiles(title, list) {
    return '<section class="screen">' +
      U.appbar(title) +
      '<div class="sheet-light"><div class="sheet-light" style="margin-top:0;padding-top:12px">' +
        '<div class="screen-body">' +
          '<div class="tile-grid" style="margin-top:4px">' + list.map(function (s) {
            return '<button class="tile" data-goto="merchantPay" data-action="goto" data-value="' +
              U.esc(s.name + '|travel|BILL PAYMENT|0') + '">' +
              '<span class="ic">' + CBE.icon(s.icon || 'plane', { size: 26 }) + '</span>' +
              '<span class="lbl">' + U.esc(s.name) + '</span></button>';
          }).join('') + '</div>' +
        '</div>' +
      '</div></div>' +
      U.tabbar('home') +
    '</section>';
  }

  /* --------------------------------------------------------------- ESL */
  CBE.define('esl', {
    render: function () {
      return '<section class="screen">' +
        U.appbar('ESL') +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="field-label" style="margin-top:14px">Reference Number</div>' +
          U.field({ icon: 'edit', inputId: 'esl-ref', name: 'ref', placeholder: 'Enter Reference Number' }) +
          '<div class="field-label">' + U.esc(CBE.t('amount')) + '</div>' +
          U.field({ icon: 'cash', inputId: 'esl-amount', name: 'amount', placeholder: CBE.t('enterAmount'), inputmode: 'decimal', tailAction: 'openAmountSheet', tail: CBE.icon('card', { size: 20 }) }) +
          '<button class="btn btn-primary" style="margin-top:22px" data-action="eslPay">' + U.esc(CBE.t('continue')) + '</button>' +
          '<div class="pill-note">' + CBE.icon('doc', { size: 20 }) +
            '<span>Ethiopian Shipping &amp; Logistics — pay your shipping and logistics charges with the reference number on your invoice.</span></div>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* ---------------------------------------------------- pay to merchant */
  var merchantMode = 'customer';
  CBE.define('payMerchant', {
    render: function () {
      return '<section class="screen">' +
        U.appbar('Pay Merchant') +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="tabs" style="margin-top:18px">' +
            '<button class="tab' + (merchantMode === 'customer' ? ' active' : '') + '" data-merchant-mode="customer">Customer Initiated</button>' +
            '<button class="tab' + (merchantMode === 'dynamic' ? ' active' : '') + '" data-merchant-mode="dynamic">Dynamic ID</button>' +
          '</div>' +
          '<div class="field-label" style="margin-top:20px">Merchant code*</div>' +
          U.field({ icon: 'receipt', inputId: 'pm-merchant', name: 'merchant', placeholder: '', inputmode: 'numeric', tail: CBE.icon('sliders', { size: 20 }) }) +
          '<div class="field-label">' + U.esc(merchantMode === 'dynamic' ? 'Dynamic ID' : 'Operator code') + '</div>' +
          U.field({ icon: 'person', inputId: 'pm-operator', name: 'operator', placeholder: '', inputmode: 'numeric', tail: CBE.icon('sliders', { size: 20 }) }) +
          '<div class="field-label">' + U.esc(CBE.t('amount')) + '</div>' +
          U.field({ icon: 'cash', inputId: 'pm-amount', name: 'amount', placeholder: CBE.t('enterAmount'), inputmode: 'decimal', tailAction: 'openAmountSheet', tail: CBE.icon('card', { size: 20 }) }) +
          '<button class="btn btn-primary" style="margin-top:24px" data-action="merchantPayNow">' + U.esc(CBE.t('continue')) + '</button>' +
          '<div style="display:flex;justify-content:flex-start;margin-top:22px">' +
            '<button class="pill-btn" style="padding:0;width:52px;height:52px;border-radius:16px;justify-content:center" data-goto="scanner" data-action="goto" aria-label="Scan QR">' +
              CBE.icon('scanQr', { size: 24 }) + '</button>' +
          '</div>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* generic "pay a merchant / biller" form used by Pay for, Travel, Shopping,
     Entertainment and ESL-style flows */
  CBE.define('merchantPay', {
    render: function (p) {
      var parts = String(p.value || 'Merchant|payfor|BILL PAYMENT|0').split('|');
      var name = parts[0], kind = parts[1] || 'payfor', tag = parts[2] || 'BILL PAYMENT';
      var charges = parts[3] === '1';
      var label = kind === 'travel' ? 'Booking reference' : kind === 'entertainment' ? 'Customer / smartcard number'
        : kind === 'shopping' ? 'Customer number' : 'Reference / customer number';
      return '<section class="screen">' +
        U.appbar(name) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="field-label" style="margin-top:14px">' + U.esc(label) + '</div>' +
          U.field({ icon: 'edit', inputId: 'mp-ref', name: 'ref', placeholder: 'Enter ' + label.toLowerCase() }) +
          '<div class="field-label">' + U.esc(CBE.t('amount')) + '</div>' +
          U.field({ icon: 'cash', inputId: 'mp-amount', name: 'amount', placeholder: CBE.t('enterAmount'), inputmode: 'decimal', tailAction: 'openAmountSheet', tail: CBE.icon('card', { size: 20 }) }) +
          '<button class="btn btn-primary" style="margin-top:22px" data-action="merchantPayStart" data-value="' +
            U.esc(name + '|' + kind + '|' + tag + '|' + (charges ? 1 : 0)) + '">' + U.esc(CBE.t('continue')) + '</button>' +
          '<div class="pill-note">' + CBE.icon('shieldCheck', { size: 20 }) +
            '<span>Payment to <b>' + U.esc(name) + '</b> is posted immediately and stored in your transactions.</span></div>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* ------------------------------------------------------- loan products */
  CBE.define('loanProducts', {
    render: function () {
      return '<section class="screen">' +
        U.appbar('Loan Products', { right: '<button class="icon-btn" data-action="searchMenu" aria-label="Search">' + CBE.icon('search', { size: 21 }) + '</button>' }) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="loan-hero" style="margin-top:8px">' +
            '<span class="badge">' + CBE.icon('columns', { size: 24 }) + '</span>' +
            '<h2>Choose Your Loan</h2>' +
            '<p>Select the financial product that best fits your current needs.</p>' +
          '</div>' +
          '<div class="section-label">Available products</div>' +
          CBE.data.loanProducts.map(function (l) {
            return '<button class="loan-tile" data-action="loanProduct" data-value="' + l.id + '">' +
              '<span class="ico">' + CBE.icon(l.icon, { size: 20 }) + '</span>' +
              '<span class="txt"><b>' + U.esc(l.name) + '</b><small>' + U.esc(l.sub) + '</small>' +
                (l.soon ? '<span class="badge-soon">Coming Soon</span>' : '') + '</span>' +
              '<span class="chev">' + CBE.icon('chevronDown', { size: 19 }) + '</span></button>';
          }).join('') +
        '</div></div>' +
        U.tabbar('home') +
      '</section>';
    }
  });
  CBE.define('fastLoan', { render: function () { return CBE.screens.loanProducts.render(); } });
  CBE.define('loan', { render: function () { return CBE.screens.loanProducts.render(); } });

  CBE.define('loanRequest', {
    render: function () {
      return '<section class="screen">' +
        U.appbar('Fast Loan') +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="field-label" style="margin-top:14px">Loan type</div>' +
          '<button class="field" data-action="pickLoanType"><span class="fico">' + CBE.icon('coins', { size: 20 }) + '</span>' +
            '<span style="flex:1;text-align:left;font-size:15px">' + U.esc(CBE.state.loanType || 'Fast Loan') + '</span>' +
            '<span class="tail">' + CBE.icon('chevronDown', { size: 20 }) + '</span></button>' +
          '<div class="field-label">Loan amount</div>' +
          U.field({ icon: 'cash', inputId: 'l-amount', name: 'amount', placeholder: CBE.t('enterAmount'), inputmode: 'decimal', tailAction: 'openAmountSheet', tail: CBE.icon('card', { size: 20 }) }) +
          '<div class="field-label">Repayment period</div>' +
          '<button class="field" data-action="pickLoanTerm"><span class="fico">' + CBE.icon('sliders', { size: 20 }) + '</span>' +
            '<span style="flex:1;text-align:left;font-size:15px">' + U.esc((CBE.state.loanTerm || 12) + ' months') + '</span>' +
            '<span class="tail">' + CBE.icon('chevronDown', { size: 20 }) + '</span></button>' +
          '<button class="btn btn-primary" style="margin-top:22px" data-action="submitLoan">Submit request</button>' +
          '<div class="pill-note">' + CBE.icon('doc', { size: 20 }) +
            '<span>Requests are reviewed within 3 working days. A branch officer will call your registered number.</span></div>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* --------------------------------------------------------------- forex */
  CBE.define('fx', {
    render: function () {
      var rates = [
        { c: 'USD', buy: 122.45, sell: 124.92 },
        { c: 'EUR', buy: 132.10, sell: 134.75 },
        { c: 'GBP', buy: 154.20, sell: 157.40 },
        { c: 'AED', buy: 33.32, sell: 34.00 },
        { c: 'SAR', buy: 32.62, sell: 33.28 },
        { c: 'CNY', buy: 16.80, sell: 17.14 }
      ];
      return '<section class="screen">' +
        U.appbar('Exchange Rates') +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="group" style="margin-top:10px">' +
            '<div class="row" style="box-shadow:none"><span class="txt"><b>Currency</b></span>' +
              '<span style="display:flex;gap:26px;font-size:12px;font-weight:700;color:var(--muted)"><span>Buy</span><span>Sell</span></span></div>' +
            rates.map(function (r) {
              return '<div class="row"><span class="txt"><b>' + U.esc(r.c) + '</b><small>Ethiopian Birr</small></span>' +
                '<span style="display:flex;gap:22px;font-size:13.5px;font-weight:700;color:var(--ink-2)">' +
                '<span>' + U.money(r.buy) + '</span><span>' + U.money(r.sell) + '</span></span></div>';
            }).join('') +
          '</div>' +
          '<div class="pill-note">' + CBE.icon('globe', { size: 20 }) +
            '<span>Indicative rates for the current banking day. Confirm at your branch before dealing.</span></div>' +
        '</div></div>' +
        U.tabbar('home') +
      '</section>';
    }
  });

  /* --------------------------------------------- other services sub-pages */
  CBE.define('internetBanking', {
    render: function () {
      return '<section class="screen">' +
        U.appbar('Internet Banking') +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div style="text-align:center;padding:22px 0 6px;color:var(--purple-500)">' + CBE.icon('bank', { size: 58 }) + '</div>' +
          '<p class="center muted" style="font-size:13.5px;margin:8px 0 18px">Use the same credentials you use on cbe.com.et for internet banking. Nothing is shared with the mobile app.</p>' +
          '<div class="group">' +
            U.listRowSimple({ title: 'Open internet banking', sub: 'cbe.com.et', icon: 'globe', action: 'copyValue', extra: ' data-value="https://cbe.com.et"' }) +
            U.listRowSimple({ title: 'Reset password', sub: 'Call the contact centre', icon: 'lock', action: 'copyValue', extra: ' data-value="+251-551-50-04"' }) +
          '</div>' +
        '</div></div>' +
      '</section>';
    }
  });

  CBE.define('ussd', {
    render: function () {
      return '<section class="screen">' +
        U.appbar('USSD') +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="field-label" style="margin-top:14px">' + U.esc(CBE.t('phoneNumber')) + '</div>' +
          U.field({ icon: 'phoneHandset', inputId: 'ussd-phone', name: 'phone', placeholder: '09** *** ** **', inputmode: 'tel' }) +
          '<div class="field-label">' + U.esc(CBE.t('amount')) + '</div>' +
          U.field({ icon: 'cash', inputId: 'ussd-amount', name: 'amount', placeholder: CBE.t('enterAmount'), inputmode: 'decimal', tailAction: 'openAmountSheet', tail: CBE.icon('card', { size: 20 }) }) +
          '<button class="btn btn-primary" style="margin-top:22px" data-action="ussdPay">' + U.esc(CBE.t('continue')) + '</button>' +
          '<div class="pill-note">' + CBE.icon('ussd', { size: 20 }) +
            '<span>USSD top up works without an internet connection — dial <b>*888#</b> on your registered number.</span></div>' +
        '</div></div>' +
      '</section>';
    }
  });

  CBE.define('verifyReceipt', {
    render: function () {
      return '<section class="screen">' +
        U.appbar('Verify Receipt') +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="field-label" style="margin-top:14px">Reference number</div>' +
          U.field({ icon: 'receiptCheck', inputId: 'vr-ref', name: 'ref', placeholder: 'FT...' }) +
          '<button class="btn btn-primary" style="margin-top:22px" data-action="verifyReceiptNow">' + U.esc(CBE.t('continue')) + '</button>' +
          '<div class="pill-note">' + CBE.icon('shieldCheck', { size: 20 }) +
            '<span>Enter the reference number printed on a CBE receipt to confirm it is genuine.</span></div>' +
        '</div></div>' +
      '</section>';
    }
  });

  CBE.define('feedback', {
    render: function () {
      return '<section class="screen">' +
        U.appbar('Feedback') +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="field-label" style="margin-top:14px">How are we doing?</div>' +
          '<div class="group" style="padding:14px">' +
            '<div style="display:flex;gap:10px;justify-content:space-between">' +
              [1, 2, 3, 4, 5].map(function (n) {
                return '<button style="color:#e9a23b" data-action="rate" data-value="' + n + '">' + CBE.icon('star', { size: 30, fill: '#e9a23b' }) + '</button>';
              }).join('') +
            '</div>' +
          '</div>' +
          '<div class="field-label">Your message</div>' +
          '<div class="field" style="min-height:96px;align-items:flex-start"><textarea id="fb-text" rows="4" placeholder="Tell us what you think about CBE Mobile Banking"></textarea></div>' +
          '<button class="btn btn-primary" style="margin-top:22px" data-action="sendFeedback">Send feedback</button>' +
        '</div></div>' +
      '</section>';
    }
  });

  CBE.define('survey', {
    render: function () {
      return '<section class="screen">' +
        U.appbar('Survey') +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="group" style="margin-top:14px;padding:16px">' +
            '<b style="font-size:15px">CBE Mobile Banking experience survey</b>' +
            '<p class="muted" style="font-size:13px;line-height:1.6;margin:10px 0 0">Two minutes. Ten questions. Your answers help us improve the mobile banking experience for everyone.</p>' +
          '</div>' +
          '<div class="pill-note">' + CBE.icon('survey', { size: 20 }) +
            '<span>Surveys are anonymous. Start yours and it will open in a new window.</span></div>' +
          '<button class="btn btn-primary" style="margin-top:20px" data-action="startSurvey">Start survey</button>' +
        '</div></div>' +
      '</section>';
    }
  });

  CBE.define('cbeLinks', {
    render: function () {
      var links = [
        { t: 'Commercial Bank of Ethiopia', s: 'cbe.com.et', v: 'https://www.cbe.com.et' },
        { t: 'CBEBirr', s: 'cbebirr.com', v: 'https://www.cbebirr.com' },
        { t: 'CBE NOOR', s: 'Interest free banking', v: 'https://www.cbe.com.et/noor' },
        { t: 'Career at CBE', s: 'Vacancies and internships', v: 'https://www.cbe.com.et/careers' }
      ];
      return '<section class="screen">' +
        U.appbar('CBE Links') +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="group" style="margin-top:14px">' +
            links.map(function (l) {
              return U.listRowSimple({ title: l.t, sub: l.s, icon: 'link', action: 'copyValue', extra: ' data-value="' + U.esc(l.v) + '"' });
            }).join('') +
          '</div>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* -------------------------------------------------------------- actions */
  CBE.serviceActions = {
    setMiniFilter: function (f) { miniFilter = f; CBE.render(); },
    printStatement: function () { global.print(); },
    shareStatement: function () {
      var text = 'CBE Mini Statement\nAccount ' + CBE.state.profile.accountNumber + '\nBalance ' + U.moneyCur(CBE.state.profile.balance);
      if (global.navigator && navigator.share) navigator.share({ title: 'CBE Mini Statement', text: text }).catch(function () { });
      else U.copy(text, 'Statement copied');
    },
    cashOutPay: function () {
      var agent = document.getElementById('co-agent'), amount = document.getElementById('co-amount');
      var code = agent ? agent.value.trim() : '';
      var amt = amount ? Number(String(amount.value).replace(/[^\d.]/g, '')) : 0;
      if (!code) { U.toast('Enter the agent code'); return; }
      if (!(amt > 0)) { U.toast('Enter a valid amount'); return; }
      withdrawalHistory.unshift({ agent: 'Agent ' + code, amount: amt, status: 'PENDING', date: new Date().toISOString() });
      CBE.pay.start({ kind: 'cashout', tag: 'TRANSFER', charges: true, toName: 'Agent ' + code, toAcc: code, amount: amt });
    },
    refreshHistory: function () {
      CBE.render();
      U.toast(withdrawalHistory.length ? 'History refreshed' : 'No withdrawal requests found yet');
    },
    clearWithdrawals: function () {
      withdrawalHistory = [];
      CBE.render();
      U.toast('Withdrawal history cleared');
    },
    govPay: function (name) {
      var ref = document.getElementById('g-ref'), amount = document.getElementById('g-amount');
      var r = ref ? ref.value.trim() : '';
      var amt = amount ? Number(String(amount.value).replace(/[^\d.]/g, '')) : 0;
      if (!r) { U.toast('Enter the reference number'); return; }
      if (!(amt > 0)) { U.toast('Enter a valid amount'); return; }
      CBE.pay.start({ kind: 'gov', tag: 'BILL PAYMENT', charges: false, toName: name, toAcc: r, amount: amt });
    },
    externalPay: function (name) {
      var acc = document.getElementById('x-account'), amount = document.getElementById('x-amount');
      var a = acc ? acc.value.trim() : '';
      var amt = amount ? Number(String(amount.value).replace(/[^\d.]/g, '')) : 0;
      if (a.length < 8) { U.toast('Enter a valid account number'); return; }
      if (!(amt > 0)) { U.toast('Enter a valid amount'); return; }
      CBE.pay.start({
        kind: 'external', tag: 'ACCOUNT TO ACCOUNT', charges: true, toName: name,
        toAcc: U.maskAccount(a), amount: amt
      });
    },
    mfiPay: function () {
      var sel = CBE.state.selectedMfi;
      var acc = document.getElementById('mf-account'), amount = document.getElementById('mf-amount');
      var a = acc ? acc.value.trim() : '';
      var amt = amount ? Number(String(amount.value).replace(/[^\d.]/g, '')) : 0;
      if (!sel) { U.toast('Select a microfinance institution'); return; }
      if (a.length < 8) { U.toast('Enter a valid account number'); return; }
      if (!(amt > 0)) { U.toast('Enter a valid amount'); return; }
      CBE.pay.start({ kind: 'mfi', tag: 'ACCOUNT TO ACCOUNT', charges: true, toName: sel.name, toAcc: U.maskAccount(a), amount: amt });
    },
    saccoPay: function (name) {
      CBE.nav('merchantPay', { value: name + '|sacco|ACCOUNT TO ACCOUNT|1' });
    },
    pickMfi: function () {
      CBE.pickers.sheet('Microfinance Name', CBE.data.microFinances, function (item) {
        CBE.state.selectedMfi = item;
        CBE.save();
        CBE.render();
      }, { searchable: true, logo: true });
    },
    searchSacco: function () {
      CBE.pickers.sheet('SACCO', CBE.data.saccos, function (item) {
        CBE.serviceActions.saccoPay(item.name);
      }, { searchable: true, logo: true });
    },
    eslPay: function () {
      var ref = document.getElementById('esl-ref'), amount = document.getElementById('esl-amount');
      var r = ref ? ref.value.trim() : '';
      var amt = amount ? Number(String(amount.value).replace(/[^\d.]/g, '')) : 0;
      if (!r) { U.toast('Enter the reference number'); return; }
      if (!(amt > 0)) { U.toast('Enter a valid amount'); return; }
      CBE.pay.start({ kind: 'esl', tag: 'BILL PAYMENT', charges: false, toName: 'Ethiopian Shipping & Logistics', toAcc: r, amount: amt });
    },
    merchantPayStart: function (value) {
      var parts = String(value).split('|');
      var name = parts[0], kind = parts[1], tag = parts[2], charges = parts[3] === '1';
      var ref = document.getElementById('mp-ref'), amount = document.getElementById('mp-amount');
      var r = ref ? ref.value.trim() : '';
      var amt = amount ? Number(String(amount.value).replace(/[^\d.]/g, '')) : 0;
      if (!r) { U.toast('Enter the reference number'); return; }
      if (!(amt > 0)) { U.toast('Enter a valid amount'); return; }
      CBE.pay.start({ kind: kind, tag: tag, charges: charges, toName: name, toAcc: r, amount: amt });
    },
    merchantPayNow: function () {
      var m = document.getElementById('pm-merchant'), o = document.getElementById('pm-operator'), a = document.getElementById('pm-amount');
      var code = m ? m.value.trim() : '';
      var op = o ? o.value.trim() : '';
      var amt = a ? Number(String(a.value).replace(/[^\d.]/g, '')) : 0;
      if (!code) { U.toast('Enter the merchant code'); return; }
      if (!(amt > 0)) { U.toast('Enter a valid amount'); return; }
      CBE.pay.start({
        kind: 'merchant', tag: 'BILL PAYMENT', charges: false,
        toName: 'Merchant ' + code, toAcc: op || code, amount: amt
      });
    },
    setMerchantMode: function (mode) { merchantMode = mode; CBE.render(); },
    setPayPage: function (i) { payForPage = Number(i) || 0; CBE.render(); },
    merchantTileStart: function () { },

    /* account cards */
    setCardsTab: function (tab) { cardsTab = tab; CBE.render(); },
    setCardMode: function (mode) { cardMode = mode; CBE.render(); },
    pickCardAccount: function () {
      CBE.pickers.sheet('Select your account', CBE.state.accounts.map(function (a, i) {
        return { name: a.label, sub: U.moneyCur(a.balance), _i: i };
      }), function (item) {
        cardAccountIdx = item._i;
        CBE.render();
      });
    },
    pickCardType: function () {
      CBE.pickers.sheet('Select card type', CBE.data.cardTypes, function (item) {
        cardType = item.name;
        CBE.render();
      });
    },
    pickCardBranch: function () {
      CBE.pickers.sheet('Select Branch', branchList, function (item) {
        cardBranch = item.name;
        CBE.render();
      }, { searchable: true });
    },
    sendCardRequest: function () {
      if (cardMode === 'replacement') { U.toast('Replacement requests are coming soon'); return; }
      if (!cardType) { U.toast('Select a card type'); return; }
      if (!cardBranch) { U.toast('Select a branch'); return; }
      requestedCards.unshift({ type: cardType, branch: cardBranch, date: new Date().toISOString() });
      cardsTab = 'requested';
      CBE.render();
      U.toast('Card request sent');
    },
    freezeCard: function () {
      cardsState[0].status = cardsState[0].status === 'Active' ? 'Frozen' : 'Active';
      CBE.render();
      U.toast('Card ' + cardsState[0].status.toLowerCase());
    },
    addBeneficiary: function () {
      CBE.textSheet('Add beneficiary', [
        { id: 'b-name', label: 'Full name', icon: 'person', placeholder: 'Beneficiary name' },
        { id: 'b-acc', label: 'Account number', icon: 'bankNote', placeholder: CBE.t('enterAccountNumber'), inputmode: 'numeric' }
      ], function (v) {
        if (!v['b-name'] || v['b-acc'].length < 6) { U.toast('Enter a name and a valid account'); return; }
        CBE.state.beneficiaries.push({
          id: 'b' + Date.now(), name: v['b-name'], account: U.maskAccount(v['b-acc']),
          bank: CBE.t('bankNameLong')
        });
        CBE.save();
        CBE.render();
        U.toast('Beneficiary saved');
      });
    },
    placeDetail: function (value) {
      var parts = String(value).split('|');
      var name = parts[0], addr = parts[1], dist = parts[2];
      U.open('<div class="grabber"></div><h2>' + U.esc(name) + '</h2>' +
        '<div class="kv"><span class="k">Address</span><span class="v">' + U.esc(addr) + '</span></div>' +
        '<div class="kv"><span class="k">Distance</span><span class="v">' + U.esc(dist) + '</span></div>' +
        '<div class="kv"><span class="k">Opening hours</span><span class="v">Mon–Fri 8:00 AM – 5:00 PM<small>Saturday 8:00 AM – 12:00 PM</small></span></div>' +
        '<div class="btn-stack"><button class="btn btn-soft" data-action="copyValue" data-value="' + U.esc(addr) + '">Copy address</button>' +
        '<button class="btn btn-primary" data-action="copyValue" data-value="+251-551-50-04">Call</button></div>', {});
    },
    loanProduct: function (id) {
      if (id === 'revolving') {
        U.open('<div class="grabber"></div><h2>Fast Revolving</h2>' +
          '<p class="center muted" style="font-size:13.5px;line-height:1.6;margin:0 0 18px">Fast Revolving is coming soon. Top up your account instantly with an overdraft facility once it launches.</p>' +
          '<button class="btn btn-primary" data-action="closeSheet">Go Back</button>', {});
        return;
      }
      CBE.nav('loanRequest');
    },
    pickLoanType: function () {
      CBE.pickers.sheet('Loan type', [
        { name: 'Fast Loan' }, { name: 'Personal Loan' }, { name: 'Housing Loan' },
        { name: 'Vehicle Loan' }, { name: 'Business Loan' }
      ], function (item) { CBE.state.loanType = item.name; CBE.save(); CBE.render(); });
    },
    pickLoanTerm: function () {
      CBE.pickers.sheet('Repayment period', [{ name: '6 months' }, { name: '12 months' }, { name: '24 months' }, { name: '36 months' }],
        function (item) { CBE.state.loanTerm = parseInt(item.name, 10); CBE.save(); CBE.render(); });
    },
    submitLoan: function () {
      var amount = document.getElementById('l-amount');
      var amt = amount ? Number(String(amount.value).replace(/[^\d.]/g, '')) : 0;
      if (!(amt > 0)) { U.toast('Enter a valid loan amount'); return; }
      U.toast('Loan request submitted for review');
      setTimeout(function () { CBE.back(); }, 700);
    },
    verifyReceiptNow: function () {
      var ref = document.getElementById('vr-ref');
      var v = ref ? ref.value.trim() : '';
      if (!v) { U.toast('Enter the reference number'); return; }
      var found = CBE.state.transactions.filter(function (t) { return String(t.ref).toLowerCase() === v.toLowerCase(); })[0];
      U.open('<div class="grabber"></div><h2>' + (found ? 'Receipt verified' : 'Receipt not found') + '</h2>' +
        '<p class="center muted" style="font-size:13.5px;line-height:1.6;margin:0 0 18px">' +
        (found ? U.esc(found.ref) + ' — ' + U.moneyCur(Math.abs(found.amount)) + ' on ' + U.esc(U.shortDate(found.date))
          : 'No transaction in this device matches ' + U.esc(v) + '.') + '</p>' +
        '<button class="btn btn-primary" data-action="closeSheet">Close</button>', {});
    },
    sendFeedback: function () {
      var t = document.getElementById('fb-text');
      if (!t || !t.value.trim()) { U.toast('Write your message first'); return; }
      t.value = '';
      U.toast('Thank you — feedback sent');
    },
    rate: function (n) { U.toast('Rated ' + n + ' out of 5'); },
    startSurvey: function () { U.toast('Survey opened — thank you'); },
    ussdPay: function () {
      var phone = document.getElementById('ussd-phone'), amount = document.getElementById('ussd-amount');
      var ph = phone ? phone.value.trim() : '';
      var amt = amount ? Number(String(amount.value).replace(/[^\d.]/g, '')) : 0;
      if (ph.length < 9) { U.toast('Enter a valid phone number'); return; }
      if (!(amt > 0)) { U.toast('Enter a valid amount'); return; }
      CBE.pay.start({ kind: 'airtime', tag: 'AIRTIME', charges: false, toName: 'Ethio Telecom USSD', toAcc: ph, amount: amt });
    }
  };
})(typeof window !== 'undefined' ? window : this);
