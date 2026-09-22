/* ==========================================================================
   screens-transfer.js — CBE Transfer, Transfer (recipient), Other Transfers,
   Wallet, Account Validation and Receive Money
   ========================================================================== */
(function (global) {
  'use strict';
  var CBE = global.CBE;
  var U = CBE.ui;

  var transferTab = 'recent';
  var draftForm = null;
  var receiveAmount = 0;

  /* the transfer form always starts empty — the account number, the amount and
     the remark are typed in by hand. The receiver name of the coming transfer
     comes from the private setup and is printed on the receipt. */
  function form() {
    if (!draftForm) draftForm = { account: '', amount: '', remark: '', showRemark: false };
    return draftForm;
  }
  function resetForm() { draftForm = null; }

  function accountField() {
    var f = form();
    return U.field({
      icon: 'bankNote', inputId: 'f-account', name: 'account', placeholder: CBE.t('accountNumber'),
      value: f.account, inputmode: 'numeric', maxlength: 18,
      tailAction: 'pickPreset', tail: CBE.icon('userPlus', { size: 21 })
    });
  }

  function amountField() {
    var f = form();
    return U.field({
      icon: 'cash', inputId: 'f-amount', name: 'amount', placeholder: CBE.t('amount') + '*',
      value: f.amount ? U.money(f.amount) : '', inputmode: 'decimal',
      tailAction: 'openAmountSheet', tail: CBE.icon('card', { size: 20 })
    });
  }

  /* the receiver of the coming transfer: whatever the private setup keeps, or
     the recipient that was picked on the way in. Never a hard-coded name. */
  function receiverName(r) {
    if (r && r.name) return r.name;
    var pre = CBE.state.preset || {};
    return pre.name || CBE.t('accountNumber');
  }
  function receiverAccount(r) {
    if (r && r.account) return r.account;
    var pre = CBE.state.preset || {};
    return pre.account ? U.maskAccount(pre.account) : '';
  }

  function remarkBlock() {
    var f = form();
    return '<button class="add-remark" data-action="toggleRemark">' +
      '<span class="plus">' + CBE.icon('plus', { size: 14, weight: 2.4 }) + '</span>' +
      '<span>' + U.esc(CBE.t('addRemark')) + '</span>' +
      '<span class="hint">' + U.esc(CBE.t('defaultRemark')) + '</span></button>' +
      (f.showRemark ? '<div class="field" style="margin-top:12px">' + CBE.icon('doc', { size: 20, cls: 'fico' }) +
        '<input id="f-remark" placeholder="Remark" value="' + U.esc(f.remark) + '"></div>' : '');
  }

  /* -------------------------------------------------------- CBE Transfer */
  CBE.define('cbeTransfer', {
    render: function () {
      var recents = CBE.state.recents;
      var bens = CBE.state.beneficiaries;
      return '<section class="screen">' +
        U.appbar('CBE Transfer') +
        '<div class="sheet-light"><div class="screen-body">' +
          U.accountCard(CBE.state.account) +
          '<div style="margin-top:14px">' + accountField() + '</div>' +
          amountField() +
          remarkBlock() +
          '<div style="margin-top:18px"></div>' +
          '<button class="btn btn-primary" data-action="transferContinue">' + U.esc(CBE.t('continue')) + '</button>' +
          '<div class="tabs centered" style="margin-top:26px">' +
            '<button class="tab' + (transferTab === 'recent' ? ' active' : '') + '" data-transfer-tab="recent">' + U.esc(CBE.t('recentTransfers')) + '</button>' +
            '<button class="tab' + (transferTab === 'ben' ? ' active' : '') + '" data-transfer-tab="ben">' + U.esc(CBE.t('beneficiaries')) + '</button>' +
          '</div>' +
          '<div style="padding-top:14px;padding-bottom:20px">' +
            (transferTab === 'recent'
              ? (recents.length ? recents.map(function (r) {
                  return '<div class="recipient">' +
                    '<span class="av">' + U.esc(U.initials(r.name)) + '</span>' +
                    '<span class="txt"><b>' + U.esc(r.name) + '</b><small>' + U.esc(r.account) + '</small></span>' +
                    '<span class="tools">' +
                      '<button class="del" data-action="deleteRecent" data-value="' + U.esc(r.id) + '" aria-label="Remove">' + CBE.icon('trash', { size: 19 }) + '</button>' +
                      '<button data-action="useRecipient" data-value="' + U.esc(r.id) + '" aria-label="Transfer">' + CBE.icon('chevronRight', { size: 20 }) + '</button>' +
                    '</span></div>';
                }).join('') : U.emptyState(CBE.t('noResults')))
              : (bens.length ? bens.map(function (r) {
                  return '<div class="recipient">' +
                    '<span class="av">' + U.esc(U.initials(r.name)) + '</span>' +
                    '<span class="txt"><b>' + U.esc(r.name) + '</b><small>' + U.esc(r.account) + '</small></span>' +
                    '<span class="tools"><button data-action="useRecipient" data-value="' + U.esc(r.id) + '">' + CBE.icon('chevronRight', { size: 20 }) + '</button></span>' +
                    '</div>';
                }).join('') : U.emptyState(CBE.t('noBeneficiaries')))) +
          '</div>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* ------------------------------------------------------------- transfer */
  CBE.define('transfer', {
    render: function (p) {
      var r = p.recipient || (CBE.state.transferDraft && CBE.state.transferDraft.recipient) || null;
      var f = form();
      var amount = p.amount != null ? p.amount : (f.amount ? Number(f.amount) : null);
      var remark = p.remark != null ? p.remark : f.remark;
      return '<section class="screen">' +
        U.appbar('Transfer') +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="field" style="flex-direction:column;align-items:stretch;gap:10px;padding:14px">' +
            '<span style="font-size:12.5px;color:var(--muted)">Transfer to</span>' +
            '<div style="display:flex;align-items:center;gap:12px">' +
              '<span class="ico round" style="width:42px;height:42px;border-radius:50%;background:var(--purple-050);display:grid;place-items:center;color:var(--purple-500)">' +
                CBE.icon(r && r.scanned ? 'scanQr' : 'bankNote', { size: 20 }) + '</span>' +
              '<span style="flex:1;min-width:0">' +
                '<b style="display:block;font-size:15px">' + U.esc(receiverName(r)) + '</b>' +
                '<small style="display:block;font-size:12px;color:var(--muted);font-family:var(--font-mono);margin-top:3px">' +
                  U.esc(receiverAccount(r)) + '</small></span>' +
              '<span style="color:#b9c0bd">' + CBE.icon('chevronRight', { size: 20 }) + '</span>' +
            '</div>' +
          '</div>' +
          '<div style="margin-top:14px">' + U.accountCard(CBE.state.account) + '</div>' +
          '<div style="margin-top:14px">' + U.field({
            icon: 'cash', inputId: 'f-amount', name: 'amount', placeholder: CBE.t('amount') + '*',
            value: amount ? U.money(amount) : '', inputmode: 'decimal',
            tailAction: 'openAmountSheet', tail: CBE.icon('card', { size: 20 })
          }) + '</div>' +
          (remark ? '<div class="field" style="margin-top:12px">' + CBE.icon('doc', { size: 20, cls: 'fico' }) +
            '<input id="f-remark" placeholder="Remark" value="' + U.esc(remark) + '"></div>' :
            '<button class="add-remark" data-action="toggleRemark2"><span class="plus">' + CBE.icon('plus', { size: 14, weight: 2.4 }) + '</span>' +
            '<span>' + U.esc(CBE.t('addRemark')) + '</span></button>') +
          '<button class="btn btn-primary" style="margin-top:22px" data-action="doTransfer">' + U.esc(CBE.t('transfer')) + '</button>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* ----------------------------------------------------- Other Transfers */
  CBE.define('otherTransfers', {
    render: function () {
      var items = CBE.data.otherTransfers;
      return '<section class="screen">' +
        U.appbar(CBE.t('otherTransfers')) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="ot-list">' +
            items.map(function (it) {
              var lead = it.logo || it.brand
                ? '<span class="ic img">' + CBE.logoFor(it, 34) + '</span>'
                : '<span class="ic" style="color:' + (it.tone || '#7b2cbf') + '">' +
                  CBE.icon(it.icon || 'coins', { size: 22 }) + '</span>';
              return '<button class="ot-row" data-goto="' + U.esc(it.route || it.id) + '" data-action="goto">' +
                lead +
                '<span class="txt"><b>' + U.esc(it.name) + '</b><small>' + U.esc(it.sub) + '</small></span>' +
                '<span class="chev">' + CBE.icon('chevronRight', { size: 20 }) + '</span></button>';
            }).join('') +
          '</div>' +
        '</div></div>' +
        U.tabbar('home') +
      '</section>';
    }
  });

  /* ----------------------------------------------------------- wallet grid */
  CBE.define('wallet', {
    render: function () {
      return '<section class="screen">' +
        U.appbar(CBE.t('wallet')) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="logo-grid" style="margin-top:6px">' +
            CBE.data.wallets.map(function (w) {
              return '<button class="logo-tile" data-goto="walletAmount" data-action="goto" data-value="' + U.esc(w.name) + '">' +
                '<span class="brand">' + CBE.logoFor(w, 46) + '</span>' +
                '<span>' + U.esc(w.name) + '</span></button>';
            }).join('') +
          '</div>' +
        '</div></div>' +
        U.tabbar('home') +
      '</section>';
    }
  });

  CBE.define('walletAmount', {
    render: function (p) {
      var name = p.value || p.name || 'TeleBirr';
      return '<section class="screen">' +
        U.appbar(name) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="field-label" style="margin-top:14px">' + U.esc(CBE.t('phoneNumber')) + '</div>' +
          U.field({ icon: 'phoneHandset', inputId: 'w-phone', name: 'phone', placeholder: '09** *** ** **', inputmode: 'tel' }) +
          '<div class="field-label">' + U.esc(CBE.t('amount')) + '</div>' +
          U.field({ icon: 'cash', inputId: 'w-amount', name: 'amount', placeholder: CBE.t('enterAmount'), inputmode: 'decimal', tailAction: 'openAmountSheet', tail: CBE.icon('card', { size: 20 }) }) +
          '<button class="btn btn-primary" style="margin-top:22px" data-action="walletPay" data-value="' + U.esc(name) + '">' + U.esc(CBE.t('continue')) + '</button>' +
          '<div class="pill-note">' + CBE.icon('shieldCheck', { size: 21 }) +
            '<span>Funds move instantly to <b>' + U.esc(name) + '</b>. Service charge of ETB 0.50 plus VAT applies.</span></div>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* ------------------------------------------------------ Account Validation */
  CBE.define('bankValidation', {
    render: function () {
      var sel = CBE.state.selectedBank;
      return '<section class="screen">' +
        U.appbar('Account Validation') +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="field-label" style="margin-top:14px">' + U.esc(CBE.t('bankName')) + '</div>' +
          '<button class="field" data-action="pickBank" style="width:100%">' +
            '<span class="fico">' + CBE.icon('columns', { size: 21 }) + '</span>' +
            '<span style="flex:1;text-align:left;color:' + (sel ? 'var(--ink)' : '#a7aeb4') + ';font-size:15px">' +
              U.esc(sel ? sel.name : CBE.t('selectFromList')) + '</span>' +
            '<span class="tail">' + CBE.icon('chevronDown', { size: 20 }) + '</span></button>' +
          '<div class="field-label">' + U.esc(CBE.t('account')) + '</div>' +
          U.field({ icon: 'edit', inputId: 'b-account', name: 'account', placeholder: CBE.t('enterAccountNumber'), inputmode: 'numeric', maxlength: 18 }) +
          '<button class="btn btn-primary" style="margin-top:22px" data-action="validateBank">' + U.esc(CBE.t('continue')) + '</button>' +
        '</div></div>' +
      '</section>';
    }
  });

  /* --------------------------------------------------------- Receive Money */
  CBE.define('receive', {
    render: function () {
      var p = CBE.state.profile;
      var acc = U.maskAccount(p.accountNumber);
      var payload = String(p.accountNumber) + '|' + receiveAmount.toFixed(2) + '|Mobile Banking';
      return '<section class="screen">' +
        U.appbar(CBE.t('receiveMoney')) +
        '<div class="sheet-light"><div class="screen-body">' +
          '<div class="receive-card">' +
            '<div class="brandline">' + CBE.cbeLogo(30) +
              '<div><div class="n">' + U.esc(CBE.t('bankNameLong')) + '</div>' +
              '<div class="t">' + U.esc(CBE.t('tagline')) + '</div></div></div>' +
            '<div class="acct-no"><span>' + U.esc(CBE.t('accountNo')) + '</span><b>' + U.esc(acc) + '</b></div>' +
            '<div class="amrow">' +
              '<div><div class="lbl">Amount</div><div class="val">' + U.money(receiveAmount) + '</div></div>' +
              '<div class="reason"><div class="lbl">' + U.esc(CBE.t('reason')) + '</div><div class="val">Mobile Banking</div></div>' +
            '</div>' +
            '<div class="qr-frame">' + CBE.qr.svg(payload, { modules: 37 }) +
              '<span class="qr-logo">' + CBE.cbeLogo(26) + '</span></div>' +
            '<div class="receive-actions">' +
              '<button class="act" data-action="shareQr"><span class="ico">' + CBE.icon('share', { size: 22 }) + '</span>' + U.esc(CBE.t('shareQr')) + '</button>' +
              '<button class="act" data-action="copyLink"><span class="ico">' + CBE.icon('link', { size: 22 }) + '</span>' + U.esc(CBE.t('copyLink')) + '</button>' +
              '<button class="act" data-action="downloadQr"><span class="ico">' + CBE.icon('download', { size: 22 }) + '</span>' + U.esc(CBE.t('download')) + '</button>' +
            '</div>' +
            '<button class="btn btn-primary" data-action="addReceiveAmount">' + U.esc(CBE.t('addAmount')) + '</button>' +
          '</div>' +
          '<div class="pill-note" style="margin-top:16px">' + CBE.icon('shieldCheck', { size: 21 }) +
            '<span>Anyone with this QR can pay into <b>' + U.esc(acc) + '</b>. The code is generated offline on your device.</span></div>' +
        '</div></div>' +
        U.tabbar('home') +
      '</section>';
    }
  });

  /* ------------------------------------------------------------- actions */
  CBE.transferActions = {
    setTab: function (tab) { transferTab = tab; CBE.render(); },
    form: form,
    resetForm: resetForm,
    collect: function () {
      var f = form();
      var a = document.getElementById('f-account');
      var m = document.getElementById('f-amount');
      var r = document.getElementById('f-remark');
      if (a) f.account = a.value.trim();
      if (m) f.amount = m.value.replace(/[^\d.]/g, '');
      if (r) f.remark = r.value.trim();
      return f;
    },
    setAmount: function (v) {
      form().amount = String(v);
      CBE.render();
    },
    pickPreset: function () {
      CBE.pickers.sheet('Recent receivers', CBE.state.recents, function (item) {
        var f = form();
        f.account = String(item.account).replace(/\D/g, '');
        CBE.render();
        U.toast(item.name + ' filled in');
      }, { searchable: true });
    },
    continueTransfer: function () {
      var f = CBE.transferActions.collect();
      var preset = CBE.state.preset || {};
      var digits = String(f.account || '').replace(/\D/g, '');
      if (!digits) digits = String(preset.account || '').replace(/\D/g, '');
      if (!digits || digits.length < 6) { U.toast('Enter a valid account number'); return; }
      if (!(Number(f.amount) > 0)) { U.toast('Enter a valid amount'); return; }
      var known = CBE.state.recents.filter(function (r) {
        return String(r.account).slice(-4) === digits.slice(-4);
      })[0];
      var recipient = {
        name: preset.name || (known ? known.name : ''),
        account: U.maskAccount(digits),
        accountRaw: digits,
        bank: (known && known.bank) || CBE.t('bankNameLong')
      };
      CBE.nav('transfer', { recipient: recipient, amount: Number(f.amount), remark: f.remark });
    },
    useRecipient: function (id) {
      var r = CBE.state.recents.concat(CBE.state.beneficiaries).filter(function (x) { return x.id === id; })[0];
      if (!r) return;
      CBE.nav('transfer', { recipient: { name: r.name, account: r.account } });
    },
    deleteRecent: function (id) {
      CBE.state.recents = CBE.state.recents.filter(function (r) { return r.id !== id; });
      CBE.save();
      CBE.render();
      U.toast('Recipient removed');
    },
    doTransfer: function () {
      var st = CBE.currentScreen().params || {};
      var preset = CBE.state.preset || {};
      var presetRaw = String(preset.account || '');
      var recipient = st.recipient || (CBE.state.transferDraft && CBE.state.transferDraft.recipient) || null;
      var amtEl = document.getElementById('f-amount');
      var remEl = document.getElementById('f-remark');
      var amount = amtEl && amtEl.value ? Number(String(amtEl.value).replace(/[^\d.]/g, '')) : Number(st.amount);
      var remark = remEl ? remEl.value.trim() : (st.remark || '');
      if (!(amount > 0)) { U.toast('Enter a valid amount'); return; }
      if (!recipient || !recipient.name) {
        recipient = {
          name: (recipient && recipient.name) || preset.name || '',
          account: (recipient && recipient.account) || (presetRaw ? U.maskAccount(presetRaw) : ''),
          accountRaw: (recipient && recipient.accountRaw) || presetRaw
        };
      }
      if (!recipient.name) { U.toast('Enter the receiver name in the private setup'); return; }
      CBE.pay.start({
        kind: 'transfer', tag: 'ACCOUNT TO ACCOUNT', charges: true,
        toName: recipient.name, toAcc: recipient.account || '',
        toAccRaw: recipient.toAccRaw || recipient.accountRaw || '',
        bank: recipient.bank || CBE.t('bankNameLong'),
        amount: amount, remark: remark
      });
    },
    validateBank: function () {
      var bank = CBE.state.selectedBank;
      var acc = document.getElementById('b-account');
      var value = acc ? acc.value.trim() : '';
      if (!bank) { U.toast('Select a bank from the list'); return; }
      if (!value || value.length < 8) { U.toast('Enter a valid account number'); return; }
      var masked = U.maskAccount(value);
      CBE.state.transferDraft = { recipient: { name: 'CBE Account Holder', account: masked, bank: bank.name } };
      CBE.nav('transfer', { recipient: { name: 'CBE Account Holder', account: masked, bank: bank.name } });
    },
    walletPay: function (name) {
      var phone = document.getElementById('w-phone');
      var amount = document.getElementById('w-amount');
      var ph = phone ? phone.value.trim() : '';
      var amt = amount ? Number(String(amount.value).replace(/[^\d.]/g, '')) : 0;
      if (ph.length < 9) { U.toast('Enter a valid phone number'); return; }
      if (!(amt > 0)) { U.toast('Enter a valid amount'); return; }
      CBE.pay.start({ kind: 'wallet', tag: 'WALLET', charges: true, toName: name, toAcc: ph, amount: amt });
    },
    setReceiveAmount: function (v) { receiveAmount = Number(v) || 0; CBE.render(); },
    getReceiveAmount: function () { return receiveAmount; }
  };
})(typeof window !== 'undefined' ? window : this);
