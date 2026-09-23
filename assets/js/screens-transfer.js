/* ==========================================================================
   screens-transfer.js — CBE Transfer (blank until it is filled in), the
   other-transfer routes, the bank picker sheet, wallets, micro finance,
   SACCO and the QR scanner.
   ========================================================================== */
(function (global) {
  'use strict';
  var CBE = global.CBE;
  var U = CBE.ui;
  var t = function (k) { return CBE.t(k); };

  function fromAccountCard() {
    var acc = CBE.state.accounts[CBE.state.accountIndex] || CBE.state.accounts[0];
    return '<button class="from-acct" data-action="pickAccount">' +
      '<small>' + U.esc(t('fromAccount')) + '</small>' +
      '<div class="acc">' + U.esc(t('savings')) + ' ' + U.esc(acc.account) + '</div>' +
      '<div class="acts"><span class="dots">••••••</span>' +
        '<button data-action="refresh" aria-label="Refresh">' + CBE.icon('sync', { size: 17 }) + '</button></div>' +
    '</button>';
  }

  function remarkRow(state) {
    var shown = state.showRemark;
    return '<button class="remark-row" data-action="toggleRemark">' +
      CBE.icon('plusCircle', { size: 20 }) +
      '<span>' + U.esc(t('addRemark')) + '</span>' +
      '<span class="hint">' + U.esc(t('defaultRemark')) + '</span>' +
    '</button>' +
    (shown ? '<div class="field remark-field"><span class="fico muted">' + CBE.icon('chat', { size: 20 }) + '</span>' +
      '<input id="tf-remark" placeholder="' + U.esc(t('addRemark')) + '"></div>' : '');
  }

  function prefRow(item) {
    return '<div class="pref-row">' +
      '<span class="avatar" style="width:42px;height:42px">' + U.esc(U.initials(item.name)) + '</span>' +
      '<span class="txt"><b>' + U.esc(item.name) + '</b><small>' + U.esc(item.account) + '</small></span>' +
      '<button class="mini-btn" data-action="copyValue" data-value="' + U.esc(item.account) + '" aria-label="Copy">' + CBE.icon('copy', { size: 18 }) + '</button>' +
      '<button class="chev" data-action="useRecipient" data-value="' + U.esc(item.id) + '" aria-label="Use">' + CBE.icon('chevronRight', { size: 20 }) + '</button>' +
    '</div>';
  }

  /* --------------------------------------------------------- CBE Transfer */
  CBE.define('cbeTransfer', {
    showRemark: false,
    render: function () {
      var st = CBE.transferActions.state();
      var recip = st.recip;
      var tab = st.tab || 'recent';
      var list = tab === 'recent' ? CBE.state.recents : CBE.state.beneficiaries;
      return '<section class="screen">' +
        '<div class="screen-body no-nav">' +
          U.appbar(t('cbeTransfer'), { right: '' }) +
          (recip
            ? '<div class="recip-card"><span class="rc-ico">' + CBE.icon('bank', { size: 21 }) + '</span>' +
              '<span class="rc-txt"><b>' + U.esc(t('transferTo')) + ' ' + U.esc(recip.name) + '</b>' +
              '<small>' + U.esc(recip.account) + '</small></span></div>'
            : '') +
          fromAccountCard() +
          (recip ? '' :
            '<div class="field" id="tf-account-field">' +
              '<span class="fico">' + CBE.icon('bank', { size: 20 }) + '</span>' +
              '<input id="tf-account" inputmode="numeric" maxlength="13" placeholder="' + U.esc(t('accountNumber')) + '" autocomplete="off">' +
              '<span class="tail" data-action="pickRecipient" style="cursor:pointer">' + CBE.icon('userPlus', { size: 20 }) + '</span>' +
            '</div>' +
            '<div class="field-error" id="tf-account-error" style="display:none"></div>') +
          '<div class="field" id="tf-amount-field" style="margin-top:' + (recip ? '0' : '18px') + '">' +
            '<span class="fico">' + CBE.icon('wallet', { size: 20 }) + '</span>' +
            '<input id="tf-amount" inputmode="decimal" placeholder="' + U.esc(t('amount')) + '*" autocomplete="off">' +
            '<span class="tail" data-action="openAmountSheet" style="cursor:pointer">' + CBE.icon('calculator', { size: 20 }) + '</span>' +
          '</div>' +
          '<div class="field-error" id="tf-amount-error" style="display:none"></div>' +
          remarkRow(this) +
          '<button class="btn btn-primary" style="margin-top:24px" data-action="' + (recip ? 'doTransfer' : 'transferContinue') + '">' +
            U.esc(recip ? t('transfer') : t('continue')) + '</button>' +
          (recip ? '' :
            '<div class="seg tabs" style="margin-top:26px">' +
              '<button class="seg-item' + (tab === 'recent' ? ' active' : '') + '" data-transfer-tab="recent"><span>' + U.esc(t('recentTransfers')) + '</span></button>' +
              '<button class="seg-item' + (tab === 'benef' ? ' active' : '') + '" data-transfer-tab="benef"><span>' + U.esc(t('beneficiaries')) + '</span></button>' +
            '</div>' +
            '<div style="padding:8px 0 10px">' +
              (list && list.length ? list.map(prefRow).join('') : U.emptyState(t('noBeneficiaries'))) +
            '</div>') +
        '</div>' +
      '</section>';
    },
    after: function () {
      var input = document.getElementById('tf-account');
      if (input) {
        input.addEventListener('input', function () {
          input.value = input.value.replace(/\D/g, '').slice(0, 13);
          var f = document.getElementById('tf-account-field');
          var e = document.getElementById('tf-account-error');
          if (f) f.classList.remove('invalid');
          if (e) e.style.display = 'none';
        });
      }
    }
  });

  /* ---------------------------------------------------- other transfers */
  CBE.define('otherTransfers', {
    render: function () {
      var items = CBE.data.otherTransfers;
      return '<section class="screen">' +
        '<div class="screen-body no-nav">' +
          U.appbar(t('otherTransfers')) +
          '<div style="padding:18px 0 0">' + items.map(function (it) {
            return '<button class="row" style="border-radius:14px;box-shadow:var(--shadow-1);margin-bottom:12px;border-bottom:0" data-goto="' + it.route + '">' +
              '<span class="ico" style="background:' + it.tone + '22;color:' + it.tone + '">' + CBE.icon(it.icon, { size: 21 }) + '</span>' +
              '<span class="txt"><b>' + U.esc(it.name) + '</b><small>' + U.esc(it.sub) + '</small></span>' +
              '<span class="chev">' + CBE.icon('chevronRight', { size: 20 }) + '</span></button>';
          }).join('') + '</div>' +
        '</div>' +
      '</section>';
    }
  });

  /* -------------------------------------------------- account validation */
  CBE.define('accountValidation', {
    render: function () {
      var st = CBE.serviceActions.other();
      return '<section class="screen">' +
        '<div class="screen-body no-nav">' +
          U.appbar(t('accountValidation'), { right: '' }) +
          '<div class="field-label" style="margin-top:20px">' + U.esc(t('bankName')) + '</div>' +
          '<button class="field" style="width:100%;text-align:left" data-action="pickOtherBank">' +
            '<span class="fico">' + CBE.icon('bank', { size: 20 }) + '</span>' +
            '<span style="flex:1;font-size:15.5px;font-weight:600;color:' + (st.bank ? '#1e2430' : '#98a0ac') + '">' +
              U.esc(st.bank ? st.bank.name : t('selectFromList')) + '</span>' +
            '<span class="tail">' + CBE.icon('chevronDown', { size: 20 }) + '</span>' +
          '</button>' +
          '<div class="field-label" style="margin-top:20px">' + U.esc(t('account')) + '</div>' +
          '<div class="field" id="ot-account-field" style="margin-top:0">' +
            '<span class="fico">' + CBE.icon('card', { size: 20 }) + '</span>' +
            '<input id="ot-account" inputmode="numeric" maxlength="13" placeholder="' + U.esc(t('enterAccountNumber')) + '" autocomplete="off">' +
          '</div>' +
          '<div class="field-error" id="ot-account-error" style="display:none"></div>' +
          '<button class="btn btn-primary" style="margin-top:26px" data-action="validateOtherAccount">' + U.esc(t('continue')) + '</button>' +
        '</div>' +
      '</section>';
    },
    after: function () {
      var input = document.getElementById('ot-account');
      if (!input) return;
      input.addEventListener('input', function () {
        input.value = input.value.replace(/\D/g, '').slice(0, 13);
        var f = document.getElementById('ot-account-field');
        var e = document.getElementById('ot-account-error');
        if (f) f.classList.remove('invalid');
        if (e) e.style.display = 'none';
      });
    }
  });

  CBE.define('otherTransferAmount', {
    render: function () {
      var st = CBE.serviceActions.other();
      return '<section class="screen">' +
        '<div class="screen-body no-nav">' +
          U.appbar(t('amount'), { right: '' }) +
          '<div class="recip-card"><span class="rc-ico">' + CBE.icon('bank', { size: 21 }) + '</span>' +
            '<span class="rc-txt"><b>' + U.esc(st.holder || CBE.state.receiverName) + '</b>' +
            '<small>' + U.esc((st.bank ? st.bank.name + ' · ' : '') + U.maskAccount(st.account)) + '</small></span></div>' +
          fromAccountCard() +
          '<div class="field" id="ota-amount-field">' +
            '<span class="fico">' + CBE.icon('wallet', { size: 20 }) + '</span>' +
            '<input id="ota-amount" inputmode="decimal" placeholder="' + U.esc(t('amount')) + '*" autocomplete="off">' +
            '<span class="tail" data-action="openAmountSheetOther" style="cursor:pointer">' + CBE.icon('calculator', { size: 20 }) + '</span>' +
          '</div>' +
          '<button class="btn btn-primary" style="margin-top:26px" data-action="otherTransferPay">' + U.esc(t('transfer')) + '</button>' +
        '</div>' +
      '</section>';
    }
  });

  /* --------------------------------------------------------------- wallet */
  CBE.define('wallet', {
    render: function () {
      var wallets = CBE.data.wallets.concat([{ id: 'vita', name: 'VitaBirr', brand: 'vita' }]);
      return '<section class="screen">' +
        '<div class="screen-body no-nav">' +
          U.appbar(t('wallet')) +
          '<div class="wallet-grid" style="padding-top:18px">' + wallets.map(function (w) {
            return U.walletTile({ title: w.name, logo: w.logo, brand: w.brand, action: 'walletTransfer', value: w.id });
          }).join('') + '</div>' +
        '</div>' +
      '</section>';
    }
  });

  /* --------------------------------------------------------- micro finance */
  CBE.define('microForm', {
    render: function () {
      var st = CBE.serviceActions.other();
      return '<section class="screen">' +
        '<div class="screen-body no-nav">' +
          U.appbar(t('microFinances'), { right: '' }) +
          '<div class="field-label" style="margin-top:20px">' + U.esc('Micro Finance') + '</div>' +
          '<button class="field" style="width:100%;text-align:left" data-action="pickMfi">' +
            '<span class="fico">' + CBE.icon('moneyBag', { size: 20 }) + '</span>' +
            '<span style="flex:1;font-size:15.5px;font-weight:600;color:' + (st.mfi ? '#1e2430' : '#98a0ac') + '">' +
              U.esc(st.mfi ? st.mfi.name : t('selectFromList')) + '</span>' +
            '<span class="tail">' + CBE.icon('chevronDown', { size: 20 }) + '</span>' +
          '</button>' +
          '<div class="field-label" style="margin-top:20px">' + U.esc(t('account')) + '</div>' +
          '<div class="field" id="mfi-account-field" style="margin-top:0">' +
            '<span class="fico">' + CBE.icon('card', { size: 20 }) + '</span>' +
            '<input id="mfi-account" inputmode="numeric" maxlength="13" placeholder="' + U.esc(t('enterAccountNumber')) + '">' +
          '</div>' +
          '<div class="field-error" id="mfi-account-error" style="display:none"></div>' +
          '<button class="btn btn-primary" style="margin-top:26px" data-action="mfiPay">' + U.esc(t('continue')) + '</button>' +
        '</div>' +
      '</section>';
    }
  });

  /* ---------------------------------------------------------------- SACCO */
  CBE.define('saccos', {
    render: function (p) {
      var q = (p.q || '').toLowerCase();
      var list = CBE.data.saccos.filter(function (s) { return !q || s.name.toLowerCase().indexOf(q) >= 0; });
      return '<section class="screen">' +
        '<div class="screen-body no-nav">' +
          U.appbar(t('sacco')) +
          '<div class="field" style="margin-top:16px"><span class="fico muted">' + CBE.icon('search', { size: 20 }) +
            '</span><input id="sacco-search" placeholder="' + U.esc(t('search')) + '" value="' + U.esc(p.q || '') + '"></div>' +
          '<div style="padding-top:10px">' + (list.length ? list.map(function (s) {
            return '<button class="bank-row" data-action="saccoPay" data-value="' + U.esc(s.name) + '">' +
              '<span class="lg">' + CBE.logoFor(s, 38) + '</span>' +
              '<span class="txt"><b>' + U.esc(s.name) + '</b></span>' +
              '<span class="chev" style="margin-left:auto;color:#b9bfc9">' + CBE.icon('chevronRight', { size: 20 }) + '</span></button>';
          }).join('') : U.emptyState(t('noResults'))) + '</div>' +
        '</div>' +
      '</section>';
    },
    after: function () {
      var input = document.getElementById('sacco-search');
      if (!input) return;
      CBE._saccoSearch = function (v) { CBE.nav('saccos', { q: v }); };
      input.addEventListener('input', function () {
        var q = input.value.toLowerCase();
        var node = document.getElementById('screen-root');
        var list = CBE.data.saccos.filter(function (s) { return !q || s.name.toLowerCase().indexOf(q) >= 0; });
        var host = node.querySelector('.screen-body > div:last-child');
        if (host) {
          host.innerHTML = list.length ? list.map(function (s) {
            return '<button class="bank-row" data-action="saccoPay" data-value="' + U.esc(s.name) + '">' +
              '<span class="lg">' + CBE.logoFor(s, 38) + '</span>' +
              '<span class="txt"><b>' + U.esc(s.name) + '</b></span>' +
              '<span class="chev" style="margin-left:auto;color:#b9bfc9">' + CBE.icon('chevronRight', { size: 20 }) + '</span></button>';
          }).join('') : U.emptyState(t('noResults'));
        }
      });
    }
  });

  /* -------------------------------------------------------------- scanner */
  CBE.define('scanner', {
    render: function () {
      return '<section class="screen">' +
        '<div class="screen-body no-nav">' +
          U.appbar(t('scanQr'), { right: '' }) +
          '<div class="scan-box"><span class="frame"></span><span class="line"></span></div>' +
          '<p class="center muted" style="font-size:13px;margin-top:16px">Align the QR code inside the frame to pay instantly.</p>' +
          '<button class="btn btn-soft" style="margin-top:22px" data-action="goto" data-goto="cbeTransfer">Enter account manually</button>' +
        '</div>' +
      '</section>';
    }
  });
})(typeof window !== 'undefined' ? window : this);
