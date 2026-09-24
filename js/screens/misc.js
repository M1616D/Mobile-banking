/* ==========================================================================
   misc.js — branches, agents, the QR scanner, menu search, the transaction
   detail sheet and notifications.
   ========================================================================== */
(function (global) {
  'use strict';

  var CBE = global.CBE || (global.CBE = {});
  var h = CBE.h, icon = CBE.icon, raw = CBE.raw;
  var st = CBE.state;
  var B = CBE.brands;

  CBE.define('branches', function () {
    return {
      appbar: CBE.appbar({ title: 'Branches', tools: ['search'] }),
      body: h`<div class="group" style="padding:4px 6px">
        ${B.branches.map(function (b) {
          return h`<button class="bank-row" data-a="branchDetail" data-name="${b.name}" data-addr="${b.addr}" data-code="${b.code}" data-open="${b.open}">
            <span class="bank-row__logo" style="color:#7b2bbd">${raw(icon('bank', 23))}</span>
            <span class="bank-row__text"><b>${b.name}</b><small>${b.addr}</small></span>
            <span class="chip${b.open.indexOf('Open') === 0 ? ' chip--green' : ''}" style="margin-right:6px">${b.open.split(' ')[0]}</span>
          </button>`;
        })}
      </div>`
    };
  });

  CBE.define('agents', function () {
    return {
      appbar: CBE.appbar({ title: 'Agents', tools: ['search'] }),
      body: h`<div class="group" style="padding:4px 6px">
        ${B.agents.map(function (a) {
          return h`<button class="bank-row" data-a="branchDetail" data-name="${a.name}" data-addr="${a.addr}" data-code="${a.code}">
            <span class="bank-row__logo" style="color:#7b2bbd">${raw(icon('atm', 23))}</span>
            <span class="bank-row__text"><b>${a.name}</b><small>${a.addr} \u2022 ${a.code}</small></span>
            <span class="chip">${a.dist}</span>
          </button>`;
        })}
      </div>`
    };
  });

  CBE.define('scanner', function () {
    return {
      appbar: CBE.appbar({ title: 'Scan QR', back: true }),
      nav: '',
      screenClass: 'scan-screen',
      body: h`
        <div class="scan-box">
          <div class="scan-box__frame"></div>
          <div class="scan-box__beam"></div>
        </div>
        <div class="scan-help" style="margin-top:22px">
          Point the camera at a CBE QR code to pay a merchant, or scan the account QR in My Information to get paid.
        </div>
        <div style="display:flex;justify-content:center;margin-top:22px">
          <button class="btn btn--outline" style="width:auto;padding:0 20px" data-a="scanManual">Enter code manually</button>
        </div>`
    };
  });

  /* ------------------------------------------------------------- menu search */
  CBE.define('search', function () {
    var MENU = [
      ['CBE Transfer', 'cbeTransfer'], ['Other Transfers', 'otherTransfers'], ['Wallet', 'wallet'],
      ['Receive Money', 'receiveMoney'], ['Airtime', 'airtime'], ['Bills & Utilities', 'bills'],
      ['CBEBirr', 'cbeBirr'], ['Cards', 'cards'], ['Mini Statement', 'miniStatement'],
      ['Cash Out', 'cashOut'], ['Bill Share', 'billShare'], ['CBE Fast Loan', 'fastLoan'],
      ['Loan Products', 'loanProducts'], ['Shopping', 'shopping'], ['Tax Payment', 'taxPayment'],
      ['Pay Merchant', 'payMerchant'], ['Forex', 'forex'], ['Micro Finance', 'microFinance'],
      ['SACCO', 'sacco'], ['Traffic Fine', 'trafficFine'], ['Donation', 'donation'],
      ['Exchange Rates', 'rates'], ['Branches', 'branches'], ['Agents', 'agents'],
      ['Withdrawal History', 'withdrawalHistory'], ['My Information', 'myInformation'],
      ['Contact Us', 'contactUs'], ['Settings', 'settings'], ['Verify Receipt', 'verifyReceipt'],
      ['Call Center', 'callcenter'], ['CBE Locator', 'locator'], ['USSD', 'ussd']
    ];
    return {
      appbar: h`
        <header class="appbar">
          <button class="icon-btn" data-a="back" aria-label="Back">${raw(icon('chevronLeft', 24))}</button>
          <label style="flex:1 1 auto;display:flex;align-items:center;gap:10px;min-width:0">
            ${raw(icon('search', 20))}
            <input id="menuSearch" type="search" autocomplete="off" placeholder="Search menu" data-in="menuSearch"
                   style="flex:1 1 auto;min-width:0;color:#fff;font-size:16px" aria-label="Search menu">
          </label>
          <button class="icon-btn" data-a="searchClear" aria-label="Clear">${raw(icon('x', 20))}</button>
        </header>`,
      nav: '',
      body: `<div id="searchOut"><div class="empty-state" style="padding-top:120px">Type to search menu.</div></div>`,
      onMount: function (node) {
        var el = node.querySelector('#menuSearch');
        if (el) setTimeout(function () { el.focus(); }, 120);
        CBE.menuIndex = MENU;
      }
    };
  });

  /* ------------------------------------------------------ transaction detail */
  CBE.define('txDetail', function (p) {
    var amount = CBE.num(p.amount);
    return {
      appbar: CBE.appbar({ title: 'Transaction' }),
      body: h`
        <div class="dash-card" style="text-align:center">
          <div class="avatar" style="margin:0 auto 10px;width:52px;height:52px">${CBE.initials(p.name)}</div>
          <h3>${p.name}</h3>
          <div style="margin-top:8px;font-size:24px;font-weight:800;color:${amount < 0 ? '#d9443c' : '#2fae55'}">
            ${amount < 0 ? '-' : '+'}${CBE.money(Math.abs(amount))} ETB
          </div>
          <p>${p.kind}</p>
        </div>
        <div class="group" style="margin-top:16px;padding:12px 16px">
          <div class="kv"><span class="kv__key">Account</span><span class="kv__val">${CBE.maskAcct(st.holder.account)}</span></div>
          <div class="kv"><span class="kv__key">Type</span><span class="kv__val">${p.kind}</span></div>
          <div class="kv"><span class="kv__key">Status</span><span class="kv__val">Completed</span></div>
          <div class="kv"><span class="kv__key">Reference</span><span class="kv__val">${CBE.ref()}</span></div>
        </div>
        <button class="btn btn--outline" style="margin-top:16px" data-a="go" data-go="miniStatement">View in statement</button>`
    };
  });

  /* ------------------------------------------------------------ notifications */
  CBE.define('notifications', function () {
    var items = [
      { title: 'Salary credited', body: 'Your account was credited with 24,500.00 ETB.', when: '5 Sep, 7:15 AM', icon: 'arrowDownLeft' },
      { title: 'Transfer successful', body: '546.00 ETB was debited for Yfuri Hanna.', when: '21 Sep, 2:22 PM', icon: 'arrowUpRight' },
      { title: 'Airtime purchase', body: '100.00 ETB airtime was sent to 0902468625.', when: '8 Sep, 8:30 AM', icon: 'phone' }
    ];
    return {
      appbar: CBE.appbar({ title: 'Notifications' }),
      nav: '',
      body: h`${items.length ? items.map(function (n) {
        return h`<div class="group" style="padding:14px 16px;margin-bottom:12px">
          <div style="display:flex;gap:13px">
            <span class="row__icon">${raw(icon(n.icon, 20))}</span>
            <span style="flex:1 1 auto">
              <b style="display:block;font-size:14.5px">${n.title}</b>
              <small style="display:block;margin-top:3px;font-size:12px;color:#6b7280;line-height:1.45">${n.body}</small>
              <small style="display:block;margin-top:5px;font-size:11px;color:#9ba1a9">${n.when}</small>
            </span>
          </div>
        </div>`;
      }) : raw('<div class="empty-state">No notifications.</div>')}`
    };
  });
})(typeof window !== 'undefined' ? window : this);
