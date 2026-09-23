/* ==========================================================================
   screens-services.js — the service pages the home grid opens: airtime,
   bills, CBEBirr, cash out, bill share, mini statement, cards, receive money,
   branches, agents, forex, government, loans, merchants, USSD and the rest.
   ========================================================================== */
(function (global) {
  'use strict';
  var CBE = global.CBE;
  var U = CBE.ui;
  var t = function (k) { return CBE.t(k); };

  var BODY = 'has-nav';

  function screen(title, inner, opts) {
    opts = opts || {};
    return '<section class="screen">' +
      '<div class="screen-body ' + BODY + '">' +
        U.appbar(title, opts.appbar || {}) +
        (opts.flush ? inner : '<div style="padding-top:' + (opts.gap == null ? 18 : opts.gap) + 'px">' + inner + '</div>') +
      '</div>' +
      U.tabbar(opts.tab || 'home') +
    '</section>';
  }

  function out(title, kicker, text, opts) {
    opts = opts || {};
    return screen(title, '<div class="soon">' +
      '<span class="halo"><span class="box">' + CBE.icon(opts.icon || 'rocket', { size: 30 }) + '</span></span>' +
      '<h2>' + U.esc(kicker) + '</h2><p>' + U.esc(text) + '</p>' +
      '<button class="btn btn-primary" style="max-width:280px" data-action="back">' + U.esc(t('goBack')) + '</button>' +
      '</div>', { flush: true });
  }

  function tiles(items, opts) {
    opts = opts || {};
    return '<div class="' + (opts.grid === 'wallet' ? 'wallet-grid' : 'pill-list') + '">' + items.map(function (it) {
      return U.osItem({ title: it.name, icon: it.icon, logo: it.logo, brand: it.brand, action: it.action, value: it.id, goto: it.goto });
    }).join('') + '</div>';
  }

  /* ------------------------------------------------------------- airtime */
  CBE.define('airtime', {
    render: function () {
      return screen(t('airtime'),
        '<div class="stack">' + CBE.data.airtimeProviders.map(function (p) {
          return '<button class="row" style="border-radius:14px;box-shadow:var(--shadow-1);border-bottom:0" data-goto="' + p.id + 'Topup">' +
            '<span class="ico plain">' + CBE.logoFor(p, 40) + '</span>' +
            '<span class="txt"><b>' + U.esc(p.name) + '</b></span></button>';
        }).join('') + '</div>', { gap: 20 });
    }
  });

  function topupScreen(id, title) {
    CBE.define(id, {
      render: function () {
        return screen(title,
          '<div class="stack">' + CBE.data.airtimeOptions.map(function (o) {
            return '<button class="row" style="border-radius:14px;box-shadow:var(--shadow-1);border-bottom:0" data-action="airtimeOption" data-value="' + U.esc(o.id) + '">' +
              '<span class="ico plain" style="background:#eff6f1;border-radius:12px">' + CBE.icon('phone', { size: 20 }) + '</span>' +
              '<span class="txt"><b>' + U.esc(o.name) + '</b><small>' + U.esc(o.sub) + '</small></span>' +
              '<span class="chev">' + CBE.icon('chevronRight', { size: 20 }) + '</span></button>';
          }).join('') + '</div>', { gap: 20 });
      }
    });
  }
  topupScreen('ethioTopup', 'Ethio telecom Topup');
  topupScreen('safaricomTopup', 'Safaricom Topup');

  CBE.define('airtimeAmount', {
    render: function (p) {
      return screen(p.title || 'Ethio Telecom Top Up',
        '<div class="field-label">' + U.esc(t('amount')) + '</div>' +
        '<div class="field" id="air-amount-field" style="margin-top:0">' +
          '<span class="fico">' + CBE.icon('wallet', { size: 20 }) + '</span>' +
          '<input id="air-amount" inputmode="decimal" placeholder="' + U.esc(t('enterAmount')) + '">' +
          '<span class="tail" data-action="openAmountSheetAir" style="cursor:pointer">' + CBE.icon('calculator', { size: 20 }) + '</span>' +
        '</div>' +
        '<div class="field-error" id="air-amount-error" style="display:none"></div>' +
        (p.others
          ? '<div class="field-label" style="margin-top:20px">' + U.esc(t('phone')) + '</div>' +
            '<div class="field" style="margin-top:0"><span class="fico">' + CBE.icon('phone', { size: 20 }) + '</span>' +
            '<input id="air-phone" inputmode="tel" placeholder="09XXXXXXXX"></div>'
          : '') +
        '<button class="btn btn-primary" style="margin-top:26px" data-action="airtimePayNow">' + U.esc(t('continue')) + '</button>', { gap: 20 });
    }
  });

  /* --------------------------------------------------------------- bills */
  CBE.define('bills', {
    render: function () {
      return screen(t('billsUtilities'),
        '<div class="wallet-grid">' + CBE.data.billers.map(function (b) {
          return U.walletTile({ title: b.name, logo: b.logo, brand: b.brand, action: 'billPay', value: b.id });
        }).join('') + '</div>', { gap: 20 });
    }
  });

  /* --------------------------------------------------------------- CBEBirr */
  CBE.define('cbebirr', {
    render: function () {
      return screen(t('cbeBirr'),
        '<div class="stack">' + CBE.data.cbebirrOptions.map(function (o) {
          return '<button class="row" style="border-radius:14px;box-shadow:var(--shadow-1);border-bottom:0" data-action="cbebirrPay" data-value="' + U.esc(o.id) + '">' +
            '<span class="ico">' + CBE.icon('cardStack', { size: 20 }) + '</span>' +
            '<span class="txt"><b>' + U.esc(o.title) + '</b></span>' +
            '<span class="chev">' + CBE.icon('chevronRight', { size: 20 }) + '</span></button>';
        }).join('') + '</div>', { gap: 20 });
    }
  });

  /* ------------------------------------------------------------- receive */
  CBE.define('receive', {
    render: function () {
      var st = CBE.state;
      var amount = CBE._receiveAmount || 0;
      var payload = st.profile.accountNumber + '|' + amount.toFixed(2);
      return '<section class="screen">' +
        '<div class="screen-body has-nav">' +
          U.appbar(t('receiveMoney'), { right: '' }) +
          '<div class="receive-card">' +
            '<div style="display:flex;justify-content:center">' +
              '<span class="receive-brand">' + U.cbeLogo(22) +
                '<span>Commercial Bank of Ethiopia<br>The bank you can always rely on!</span></span>' +
            '</div>' +
            '<div class="receive-meta">' +
              '<span>' + U.esc(t('accountNo')) + '<b>' + U.esc(U.maskAccount(st.profile.accountNumber)) + '</b></span>' +
              '<span style="text-align:right">' + U.esc(t('reason')) + '<b>Mobile Banking</b></span>' +
            '</div>' +
            '<div class="receive-meta" style="margin-top:14px">' +
              '<span>' + U.esc(t('amount')) + '<b>' + U.money(amount) + '</b></span>' +
            '</div>' +
            '<div class="qr-frame"><img src="' + CBE.qr.dataUrl(payload, { modules: 33 }) + '" alt="QR code">' +
              '<span class="qr-mark">' + U.cbeLogo(44) + '</span></div>' +
            '<div class="action-row">' +
              '<button data-action="shareQr">' + CBE.icon('share', { size: 21 }) + '<span>' + U.esc(t('shareQr')) + '</span></button>' +
              '<button data-action="copyLink">' + CBE.icon('link', { size: 21 }) + '<span>' + U.esc(t('copyLink')) + '</span></button>' +
              '<button data-action="downloadQr">' + CBE.icon('download', { size: 21 }) + '<span>' + U.esc(t('download')) + '</span></button>' +
            '</div>' +
            '<button class="add-amount" data-action="addReceiveAmount" style="margin-top:20px">' + U.esc(t('addAmount')) + '</button>' +
          '</div>' +
        '</div>' +
        U.tabbar('home') +
      '</section>';
    }
  });

  /* -------------------------------------------------------- cash out / etc */
  CBE.define('cashOut', {
    render: function () {
      return screen(t('cashOut'),
        '<div class="field-label">' + U.esc(t('amount')) + '</div>' +
        '<div class="field" id="co-amount-field" style="margin-top:0">' +
          '<span class="fico">' + CBE.icon('wallet', { size: 20 }) + '</span>' +
          '<input id="co-amount" inputmode="decimal" placeholder="' + U.esc(t('enterAmount')) + '"></div>' +
        '<div class="field-error" id="co-amount-error" style="display:none"></div>' +
        '<div class="field-label" style="margin-top:20px">' + U.esc('Agent code') + ' <span class="muted">(' + U.esc(t('optional')) + ')</span></div>' +
        '<div class="field" style="margin-top:0"><span class="fico">' + CBE.icon('building', { size: 20 }) + '</span>' +
          '<input id="co-agent" placeholder="AGT-000000"></div>' +
        '<button class="btn btn-primary" style="margin-top:26px" data-action="cashOutPay">' + U.esc(t('continue')) + '</button>', { gap: 20 });
    }
  });

  CBE.define('billShare', {
    render: function () {
      return screen(t('billShare'),
        '<div class="field-label">' + U.esc(t('amount')) + '</div>' +
        '<div class="field" id="bs-amount-field" style="margin-top:0">' +
          '<span class="fico">' + CBE.icon('wallet', { size: 20 }) + '</span>' +
          '<input id="bs-amount" inputmode="decimal" placeholder="' + U.esc(t('enterAmount')) + '"></div>' +
        '<div class="field-error" id="bs-amount-error" style="display:none"></div>' +
        '<div class="field-label" style="margin-top:20px">' + U.esc('Share with') + '</div>' +
        '<div class="field" style="margin-top:0"><span class="fico">' + CBE.icon('phone', { size: 20 }) + '</span>' +
          '<input id="bs-phone" inputmode="tel" placeholder="09XXXXXXXX"></div>' +
        '<button class="btn btn-primary" style="margin-top:26px" data-action="billSharePay">' + U.esc(t('continue')) + '</button>', { gap: 20 });
    }
  });

  CBE.define('miniStatement', {
    render: function (p) {
      var f = p.filter || 'all';
      var list = CBE.state.transactions.filter(function (x) {
        if (f === 'out') return x.amount < 0;
        if (f === 'in') return x.amount > 0;
        return true;
      }).slice(0, 8);
      return screen(t('minStatement'),
        '<div class="mini-filter">' +
          '<button class="' + (f === 'all' ? 'active' : '') + '" data-mini-filter="all">' + U.esc(t('all')) + '</button>' +
          '<button class="' + (f === 'out' ? 'active' : '') + '" data-mini-filter="out">' + U.esc(t('debited')) + '</button>' +
          '<button class="' + (f === 'in' ? 'active' : '') + '" data-mini-filter="in">' + U.esc(t('credited')) + '</button>' +
        '</div>' +
        list.map(function (x) { return U.txRow(x); }).join('') +
        '<button class="btn btn-soft" style="margin-top:8px" data-action="shareStatement">' + U.esc('Share statement') + '</button>', { gap: 14 });
    }
  });

  CBE.define('cards', {
    render: function () {
      var st = CBE.state;
      var frozen = !!CBE._frozen;
      var acc = st.profile.accountNumber;
      return screen(t('cards'),
        '<div class="card-visual' + (frozen ? ' frozen' : '') + '">' +
          '<div class="cv-top"><span style="font-size:12.5px;font-weight:700">' + U.esc(t('bankNameLong')) + '</span>' +
            '<span style="font-size:11px;opacity:.85">' + U.esc(frozen ? 'FROZEN' : 'DEBIT') + '</span></div>' +
          '<div class="cv-num">' + U.esc(acc.slice(0, 4) + ' ' + acc.slice(4, 8) + ' ' + acc.slice(8, 12) + ' ' + acc.slice(12)) + '</div>' +
          '<div class="cv-bot"><span>' + U.esc(st.profile.holderName.toUpperCase()) + '</span><span>12/29</span></div>' +
        '</div>' +
        '<div class="group" style="margin-top:18px">' +
          '<div class="switch-row" style="padding:14px 4px"><span class="txt"><b>Freeze card</b>' +
            '<small>' + U.esc(frozen ? 'Card is temporarily blocked' : 'Block all transactions instantly') + '</small></span>' +
            '<button class="switch' + (frozen ? ' on' : '') + '" data-action="freezeCard"></button></div>' +
          U.kvRow('Daily limit', U.moneyCur(CBE._cardLimit || 20000)) +
          U.kvRow('Card type', 'CBE Debit Classic') +
        '</div>' +
        '<button class="btn btn-soft" style="margin-top:18px" data-action="cardLimit">Change limit</button>' +
        '<button class="btn btn-outline" style="margin-top:12px" data-action="cardRequest">Request new card</button>', { gap: 18 });
    }
  });

  /* ------------------------------------------------------ branches/agents */
  function placeScreen(name, title, list, icon) {
    CBE.define(name, {
      render: function (p) {
        var q = (p.q || '').toLowerCase();
        var items = list.filter(function (x) { return !q || (x.name + ' ' + (x.city || '')).toLowerCase().indexOf(q) >= 0; });
        return screen(title,
          '<div class="field" style="margin:0 0 12px"><span class="fico muted">' + CBE.icon('search', { size: 20 }) +
            '</span><input id="place-search" placeholder="' + U.esc(t('search')) + '" value="' + U.esc(p.q || '') + '"></div>' +
          (items.length ? items.map(function (x) {
            return '<button class="row" style="border-radius:14px;box-shadow:var(--shadow-1);border-bottom:0;margin-bottom:10px" data-action="placeDetail" data-value="' + U.esc(x.name) + '">' +
              '<span class="ico">' + CBE.icon(icon, { size: 21 }) + '</span>' +
              '<span class="txt"><b>' + U.esc(x.name) + '</b><small>' + U.esc(x.city + ' · ' + x.hours) + '</small></span>' +
              '<span class="chev">' + CBE.icon('chevronRight', { size: 20 }) + '</span></button>';
          }).join('') : U.emptyState(t('noResults'))), { gap: 14, flush: false });
      },
      after: function () {
        var input = document.getElementById('place-search');
        if (!input) return;
        input.addEventListener('input', function () { CBE._placeQuery = input.value; });
      }
    });
  }
  placeScreen('branches', 'Branches', CBE.data.branches, 'columns');
  placeScreen('agents', 'Agents', CBE.data.agents, 'building');

  /* ------------------------------------------------------------- forex */
  CBE.define('fx', {
    render: function () {
      return screen(t('exchangeRates'),
        '<div class="group">' + CBE.data.rates.map(function (r) {
          return '<div class="kv"><span class="k" style="font-weight:700;color:#1e2430">' + U.esc(r.cur) + ' · ' + U.esc(r.name) + '</span>' +
            '<span class="v">' + r.buy.toFixed(4) + ' / ' + r.sell.toFixed(4) + '</span></div>';
        }).join('') + '</div>' +
        '<p class="plan">Buying / selling rates in ETB. Updated ' + U.esc(U.cardStamp(Date.now())) + '.</p>', { gap: 18 });
    }
  });

  /* -------------------------------------------------------- government */
  CBE.define('government', {
    render: function () {
      return screen(t('government'),
        '<div class="stack">' + CBE.data.governmentServices.map(function (g) {
          return '<button class="row" style="border-radius:14px;box-shadow:var(--shadow-1);border-bottom:0" data-action="govPay" data-value="' + U.esc(g.id) + '">' +
            '<span class="ico">' + CBE.icon(g.icon, { size: 20 }) + '</span>' +
            '<span class="txt"><b>' + U.esc(g.name) + '</b></span>' +
            '<span class="chev">' + CBE.icon('chevronRight', { size: 20 }) + '</span></button>';
        }).join('') + '</div>', { gap: 18 });
    }
  });

  /* ------------------------------------------------------------- loans */
  CBE.define('fastLoan', {
    render: function () {
      return screen('CBE Fast Loan',
        '<div class="group">' +
          U.kvRow('Pre-approved amount', U.moneyCur(50000)) +
          U.kvRow('Interest rate', '14.5% per year') +
          U.kvRow('Max term', '60 months') +
        '</div>' +
        '<div class="field-label" style="margin-top:20px">' + U.esc(t('amount')) + '</div>' +
        '<div class="field" id="ln-amount-field" style="margin-top:0">' +
          '<span class="fico">' + CBE.icon('wallet', { size: 20 }) + '</span>' +
          '<input id="ln-amount" inputmode="decimal" placeholder="' + U.esc(t('enterAmount')) + '"></div>' +
        '<div class="field-error" id="ln-amount-error" style="display:none"></div>' +
        '<div class="field-label" style="margin-top:20px">' + U.esc('Term (months)') + '</div>' +
        '<div class="field" style="margin-top:0"><span class="fico">' + CBE.icon('clock', { size: 20 }) + '</span>' +
          '<input id="ln-term" inputmode="numeric" value="12"></div>' +
        '<button class="btn btn-primary" style="margin-top:26px" data-action="submitLoan">' + U.esc('Request loan') + '</button>', { gap: 18 });
    }
  });

  CBE.define('loanProducts', {
    render: function () {
      return screen('Choose Your Loan',
        '<div class="stack">' + CBE.data.loanProducts.map(function (p) {
          return '<button class="row" style="border-radius:14px;box-shadow:var(--shadow-1);border-bottom:0" data-goto="' + (p.soon ? 'comingSoon' : 'fastLoan') + '">' +
            '<span class="ico">' + CBE.icon(p.icon, { size: 20 }) + '</span>' +
            '<span class="txt"><b>' + U.esc(p.name) + '</b><small>' + U.esc(p.sub) + '</small></span>' +
            '<span class="chev">' + CBE.icon('chevronRight', { size: 20 }) + '</span></button>';
        }).join('') + '</div>', { gap: 18 });
    }
  });

  /* --------------------------------------------------------- merchants */
  function merchantScreen(name, title, list, mode) {
    CBE.define(name, {
      render: function () {
        return screen(title,
          '<div class="wallet-grid">' + list.map(function (m) {
            return U.walletTile({ title: m.name, logo: m.logo, brand: m.brand, action: 'merchantStart', value: mode + ':' + m.name, icon: m.icon });
          }).join('') + '</div>', { gap: 18 });
      }
    });
  }
  merchantScreen('payFor', t('payForTitle'), CBE.data.payMerchants.slice(0, 8), 'payFor');
  merchantScreen('payMerchant', t('merchantTitle'), CBE.data.payMerchants.slice(8), 'merchant');
  merchantScreen('shopping', 'Shopping', CBE.data.shoppingMerchants.concat(CBE.data.entertainmentMerchants), 'shopping');
  merchantScreen('taxPayment', 'Tax Payment', [
    { name: 'MOR Tax Payment', icon: 'receipt' },
    { name: 'Tax Payments', icon: 'building' },
    { name: 'Withholding Tax', icon: 'doc' },
    { name: 'VAT Declaration', icon: 'doc' }
  ], 'tax');

  CBE.define('esl', {
    render: function () {
      return screen('Ethiopian Shipping & Logistics',
        '<div class="field" style="margin:0 0 16px"><span class="fico">' + CBE.icon('doc', { size: 20 }) +
          '</span><input id="esl-code" placeholder="Bill of lading number"></div>' +
        '<button class="btn btn-primary" data-action="eslPay">' + U.esc(t('continue')) + '</button>', { gap: 18 });
    }
  });

  CBE.define('comingSoon', {
    render: function (p) {
      return out(p.title || t('comingSoonTitle'), p.title || t('comingSoonTitle'),
        'This service is on its way. It will appear here as soon as it is enabled for your account.', { icon: 'rocket' });
    }
  });

  /* ------------------------------------------------------- verify / info */
  CBE.define('verifyReceipt', {
    render: function () {
      return screen(t('verifyReceiptTitle'),
        '<div class="field" style="margin:0 0 16px"><span class="fico">' + CBE.icon('receiptCheck', { size: 20 }) +
          '</span><input id="vr-ref" placeholder="Receipt number (e.g. FT26264LRXTX)"></div>' +
        '<button class="btn btn-primary" data-action="verifyReceiptNow">' + U.esc('Verify') + '</button>', { gap: 18 });
    }
  });

  CBE.define('feedback', {
    render: function () {
      return screen('Feedback',
        '<div class="field" style="margin:0 0 16px;align-items:flex-start;padding-top:14px;min-height:120px">' +
          '<textarea id="fb-text" style="flex:1;border:0;background:none;outline:none;resize:none;font-size:15px;min-height:96px" placeholder="Tell us what you think"></textarea></div>' +
        '<button class="btn btn-primary" data-action="sendFeedback">' + U.esc('Send feedback') + '</button>', { gap: 18 });
    }
  });

  CBE.define('survey', {
    render: function () {
      return screen('Survey',
        '<div class="group" style="padding:18px 16px">' +
          '<b style="font-size:15px">How likely are you to recommend CBE Mobile Banking?</b>' +
          '<div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">' +
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (n) {
              return '<button class="btn mini btn-soft" data-action="rate" data-value="' + n + '">' + n + '</button>';
            }).join('') +
          '</div>' +
        '</div>', { gap: 18 });
    }
  });

  CBE.define('internetBanking', {
    render: function () {
      return screen('Internet Banking',
        '<div class="group">' +
          U.kvRow('Username', CBE.state.profile.phone) +
          U.kvRow('Status', 'Active') +
          U.kvRow('Last login', CBE.state.profile.lastSignIn) +
        '</div>' +
        '<button class="btn btn-primary" style="margin-top:18px" data-action="copyValue" data-value="https://combanketh.et">Open web banking</button>', { gap: 18 });
    }
  });

  CBE.define('ussd', {
    render: function () {
      return screen('USSD',
        '<div class="stack">' +
          ['*889#', '*889*1#', '*889*2#', '*889*3#'].map(function (code) {
            return '<button class="row" style="border-radius:14px;box-shadow:var(--shadow-1);border-bottom:0" data-action="copyValue" data-value="' + code + '">' +
              '<span class="ico">' + CBE.icon('ussd', { size: 20 }) + '</span>' +
              '<span class="txt"><b>' + code + '</b><small>Tap to copy and dial</small></span></button>';
          }).join('') + '</div>', { gap: 18 });
    }
  });

  CBE.define('cbeLinks', {
    render: function () {
      var links = [
        ['CBE官方网站', 'https://combanketh.et'],
        ['CBEBirr', 'https://cbebirr.com'],
        ['CBE NOOR', 'https://combanketh.et/noor'],
        ['CBE Careers', 'https://combanketh.et/careers']
      ];
      return screen('CBE Links',
        links.map(function (l) {
          return '<button class="row" style="border-radius:14px;box-shadow:var(--shadow-1);border-bottom:0;margin-bottom:10px" data-action="copyValue" data-value="' + l[1] + '">' +
            '<span class="ico">' + CBE.icon('link', { size: 20 }) + '</span>' +
            '<span class="txt"><b>' + U.esc(l[0]) + '</b><small>' + U.esc(l[1]) + '</small></span>' +
            '<span class="chev">' + CBE.icon('copy', { size: 18 }) + '</span></button>';
        }).join(''), { gap: 18 });
    }
  });

  CBE.define('privacy', {
    render: function () {
      return screen('Privacy Policy',
        '<div class="group" style="padding:18px 16px;font-size:13.5px;line-height:1.7;color:#4d5766">' +
          '<b style="display:block;font-size:15px;color:#1e2430;margin-bottom:8px">Commercial Bank of Ethiopia</b>' +
          'We collect only the information needed to operate your CBE Mobile Banking account: your account ' +
          'number, contact details and transaction history. We never share your data with third parties for ' +
          'marketing. You can request a copy or deletion of your data from any branch.' +
        '</div>', { gap: 18 });
    }
  });

  CBE.define('terms', {
    render: function () {
      return screen('Terms and Tariffs',
        '<div class="group">' +
          U.kvRow('Service charge', U.moneyCur(CBE.state.feeCfg.sc)) +
          U.kvRow('VAT', CBE.state.feeCfg.vatPct + '% of service charge') +
          U.kvRow('Disaster Recovery Fund', CBE.state.feeCfg.drfPct + '% of service charge') +
          U.kvRow('Daily transfer limit', U.moneyCur(200000)) +
        '</div>' +
        '<p class="plan">Fees are charged exactly as shown and appear on every receipt.</p>', { gap: 18 });
    }
  });

  CBE.define('beneficiary', {
    render: function () {
      var list = CBE.state.beneficiaries;
      return screen(t('beneficiaries'),
        (list.length
          ? list.map(function (b) {
              return '<button class="row" style="border-radius:14px;box-shadow:var(--shadow-1);border-bottom:0;margin-bottom:10px" data-action="deleteBeneficiary" data-value="' + U.esc(b.id) + '">' +
                '<span class="avatar">' + U.esc(U.initials(b.name)) + '</span>' +
                '<span class="txt"><b>' + U.esc(b.name) + '</b><small>' + U.esc(b.account) + '</small></span>' +
                '<span class="chev">' + CBE.icon('trash', { size: 18 }) + '</span></button>';
            }).join('')
          : U.emptyState('No beneficiaries yet')) +
        '<button class="btn btn-primary" style="margin-top:10px" data-action="addBeneficiary">' + U.esc('Add beneficiary') + '</button>', { gap: 18 });
    }
  });
})(typeof window !== 'undefined' ? window : this);
