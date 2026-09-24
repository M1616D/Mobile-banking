/* ==========================================================================
   transfer.js — CBE Transfer, the transfer form, other-transfers branches,
   the amount keypad, the confirm sheet and the payment authorisation chain.
   ========================================================================== */
(function (global) {
  'use strict';

  var CBE = global.CBE || (global.CBE = {});
  var h = CBE.h, icon = CBE.icon, raw = CBE.raw, qs = CBE.qs;
  var st = CBE.state;

  var form = { account: '', amount: '', remark: '', tab: 'recent', receiverName: '', receiverAccount: '', bank: '', locked: false };
  var pad = { target: 'amount', value: '' };

  function resetForm() {
    form = { account: '', amount: '', remark: '', tab: 'recent', receiverName: '', receiverAccount: '', bank: '', locked: false };
  }

  /* ------------------------------------------------------ shared fragments */
  function fromCard() {
    return h`
      <div class="bal-card" style="padding:12px 16px 14px;text-align:left">
        <div style="font-size:12px;color:#e3b95c">From Account</div>
        <div style="margin-top:3px;font-size:13.5px;font-weight:600;letter-spacing:.03em">
          ${st.accountType.toLowerCase()} ${CBE.maskAcct(st.holder.account)}
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:4px;color:rgba(255,255,255,.6);font-size:12px">
          <span style="letter-spacing:.16em">\u2022\u2022\u2022\u2022\u2022\u2022</span>
          ${raw(icon('eyeOff', 15))}
        </div>
      </div>`;
  }

  function receiverCard() {
    return h`
      <div class="group" style="padding:12px 16px;background:#f1f0f5;box-shadow:none">
        <div style="font-size:12px;color:#8f95a0">Transfer to</div>
        <div style="display:flex;align-items:center;gap:11px;margin-top:8px">
          <span class="row__icon row__icon--plain">${raw(icon('bank', 24))}</span>
          <span>
            <b style="display:block;font-size:15px">${form.receiverName}</b>
            <small style="display:block;margin-top:2px;font-size:12px;color:#8f95a0">${CBE.maskAcct(form.receiverAccount)}</small>
          </span>
        </div>
      </div>`;
  }

  function accountField() {
    return h`
      <div class="field" id="accField">
        ${raw(icon('bank', 21, 'field__icon--gold'))}
        <input id="accInput" type="text" inputmode="numeric" autocomplete="off" maxlength="13"
               placeholder="Account Number" value="${form.account}" data-in="accInput" aria-label="Account number">
        ${raw('<span class="field__tail">' + icon('user', 19) + '</span>')}
      </div>
      <div class="field-error is-hidden" id="accErr">
        ${raw(icon('alert', 14))}<span>Account number must be 13 digits</span>
      </div>
      <div class="acc-owner is-hidden" id="accOwner">
        <span class="acc-owner__mark">${raw(icon('user', 17))}</span>
        <span class="acc-owner__text">
          <b id="accOwnerName"></b>
          <small>Account holder</small>
        </span>
      </div>`;
  }

  function amountField() {
    return h`
      <div class="field" style="margin-top:16px">
        ${raw(icon('bankCard', 21, 'field__icon--gold'))}
        <input id="amtInput" type="text" inputmode="decimal" autocomplete="off" placeholder="Amount*"
               value="${form.amount}" data-in="amtInput" aria-label="Amount">
        <button class="field__tail field__tail--tappable" data-a="openPad" data-target="amount" aria-label="Amount keypad">${raw(icon('calculator', 20))}</button>
      </div>`;
  }

  function remarkRow() {
    return h`
      <div style="display:flex;align-items:center;gap:10px;margin-top:14px;padding:0 6px">
        <button class="icon-btn icon-btn--ink" style="width:28px;height:28px;border:1.4px solid #cfd4dd;border-radius:8px" data-a="toggleRemark" aria-label="Add remark">${raw(icon('plus', 16))}</button>
        <b style="font-size:13.5px">Add remark</b>
        ${form.remark ? raw('<span style="font-size:13px;color:#8f95a0">' + CBE.esc(form.remark) + '</span>') : ''}
      </div>
      ${form.remarkOpen ? raw(h`<div class="field" style="margin-top:10px">
        ${raw(icon('doc', 19, 'field__icon--muted'))}
        <input type="text" autocomplete="off" placeholder="Remark" value="${form.remark}" data-in="remarkInput" aria-label="Remark">
      </div>`) : ''}`;
  }

  function historyBlock() {
    var recent = CBE.store.recent;
    var benef = CBE.store.beneficiaries;
    var rows = form.tab === 'benef' ? benef : recent;
    return h`
      <div class="seg" style="margin-top:22px;justify-content:space-between">
        <button class="seg__item${form.tab === 'recent' ? ' is-active' : ''}" data-a="histTab" data-tab="recent"><span>Recent Transfers</span></button>
        <button class="seg__item${form.tab === 'benef' ? ' is-active' : ''}" data-a="histTab" data-tab="benef"><span>Beneficiaries</span></button>
      </div>
      <div style="margin-top:12px">
        ${rows.map(function (r) {
          return h`<button class="bank-row" data-a="pickHistory" data-name="${r.name}" data-account="${r.account}">
            <span class="avatar">${CBE.initials(r.name)}</span>
            <span class="bank-row__text" style="flex:1 1 auto">
              <b>${r.name}</b>
              <small>${CBE.maskAcct(r.account)}</small>
            </span>
            <span class="row__chev" style="color:#c3c7d0">${raw(icon('trash', 18))}</span>
            <span class="row__chev">${raw(icon('chevronRight', 19))}</span>
          </button>`;
        })}
      </div>`;
  }

  /* ------------------------------------------------------------ amount pad */
  function padHtml(title) {
    var keys = '';
    for (var n = 1; n <= 9; n++) keys += '<button data-a="padKey" data-k="' + n + '">' + n + '</button>';
    return h`
      <div class="sheet__grabber"></div>
      <div class="confirm__title">${title}</div>
      <div class="amount-display"><span id="padValue">${CBE.money(pad.value || 0)}</span> <small>ETB</small></div>
      <div class="keypad">
        ${raw(keys)}
        <button data-a="padDot">.</button>
        <button data-a="padKey" data-k="0">0</button>
        <button data-a="padBack" aria-label="Delete">${raw(icon('x', 20))}</button>
      </div>
      <button class="btn btn--primary" style="margin-top:14px" data-a="padDone">Done</button>`;
  }

  function openPad(target, title) {
    pad.target = target || 'amount';
    pad.value = form[pad.target] ? String(form[pad.target]) : '';
    CBE.overlay.sheet({ html: padHtml(title || 'Enter Amount'), dragAnywhere: true });
  }

  function paintPad() {
    var el = qs('#padValue');
    if (el) el.textContent = CBE.money(pad.value || 0);
  }

  /* ----------------------------------------------------------- confirm sheet */
  function confirmHtml(p) {
    return h`
      <div class="sheet__grabber"></div>
      <div class="confirm__title">Please Confirm</div>
      <div class="confirm__row">
        <span class="confirm__key">From</span>
        <span class="confirm__val">${st.holder.name}<small>${CBE.maskAcct(st.holder.account)}</small></span>
      </div>
      <div class="confirm__row">
        <span class="confirm__key">To</span>
        <span class="confirm__val">${p.receiverName}<small>${CBE.maskAcct(p.receiverAccount)}${p.bank && p.bank !== 'CBE' ? ' \u2022 ' + p.bank : ''}</small></span>
      </div>
      <div class="sheet__grabber" style="margin:14px auto 10px"></div>
      <div class="confirm__row confirm__row--total">
        <span class="confirm__key">Total Amount</span>
        <span class="confirm__val">${CBE.money(p.total)} <span class="cur">ETB</span></span>
      </div>
      <div class="confirm__row" style="border-top:1px solid #eceaf1;padding-top:12px;margin-top:4px">
        <span class="confirm__key">Service charge</span>
        <span class="confirm__val" style="font-weight:600;color:#6b7280">${CBE.money(p.service)} ETB</span>
      </div>
      <div class="confirm__row" style="padding-top:0">
        <span class="confirm__key">VAT (${st.fees.vat}%)</span>
        <span class="confirm__val" style="font-weight:600;color:#6b7280">${CBE.money(p.vat)} ETB</span>
      </div>
      <div class="confirm__row" style="padding-top:0">
        <span class="confirm__key">Disaster recovery (${st.fees.drf}%)</span>
        <span class="confirm__val" style="font-weight:600;color:#6b7280">${CBE.money(p.drf)} ETB</span>
      </div>
      <div class="modal-actions" style="margin-top:18px">
        <button class="btn btn--plain" style="background:#e9e7ef;color:#d93b3b" data-a="confirmCancel">Cancel</button>
        <button class="btn btn--primary" data-a="confirmGo">Continue</button>
      </div>`;
  }

  /* --------------------------------------------------- payment authorisation */
  function runPayment(p) {
    CBE.overlay.popAll();
    CBE.auth.approve({ subtitle: 'Scan your fingerprint to complete the transfer' }, function () {
      var rec = CBE.store.addReceipt({
        amount: p.amount, service: p.service, vat: p.vat, drf: p.drf, total: p.total,
        reason: p.remark || 'MB Transfer',
        payType: p.payType || 'A2A',
        bank: p.bank || 'CBE',
        channel: p.channel || 'MB',
        senderName: st.holder.name,
        senderAccount: st.holder.account,
        receiverName: p.receiverName,
        receiverAccount: p.receiverAccount
      });
      st.holder.balance = Math.round((CBE.num(st.holder.balance) - p.total) * 100) / 100;
      st.accountUpdated = Date.now();
      CBE.store.save();
      resetForm();
      CBE.reset('receipt', { id: rec.id, fresh: 1 });
    });
  }

  function resolveName(account, explicit) {
    if (explicit) return explicit;
    /* the prepared receiver name owns every account number that is typed in,
       so the receipt always carries the name that was set up in advance */
    if (st.preset.enabled && st.preset.name) return st.preset.name;
    var d = CBE.digits(account);
    var pool = CBE.store.recent.concat(CBE.store.beneficiaries);
    for (var i = 0; i < pool.length; i++) if (CBE.digits(pool[i].account) === d) return pool[i].name;
    return st.holder.name;
  }

  function startPayment(p) {
    var s = CBE.store.summary(p.amount);
    if (p.amount < 1) { CBE.toast('Enter an amount of at least 1.00 ETB'); return; }
    if (s.total > CBE.num(st.holder.balance)) { CBE.toast('Insufficient balance'); CBE.vibrate(30); return; }
    var payload = {
      amount: s.amount, service: s.service, vat: s.vat, drf: s.drf, total: s.total,
      receiverName: p.receiverName, receiverAccount: p.receiverAccount,
      bank: p.bank, remark: p.remark, payType: p.payType, channel: p.channel
    };
    CBE.overlay.sheet({ html: confirmHtml(payload), onClose: function () { } });
    CBE.pendingPayment = payload;
  }

  /* ================================================================ screens */
  CBE.define('cbeTransfer', function () {
    var locked = !!form.receiverAccount;
    return {
      appbar: CBE.appbar({ title: locked ? 'Transfer' : 'CBE Transfer' }),
      body: h`
        <div class="u-stack">
          ${locked ? raw(receiverCard()) : ''}
          ${raw(fromCard())}
          ${locked ? '' : raw(accountField())}
          ${raw(amountField())}
          ${raw(remarkRow())}
          <button class="btn btn--primary" style="margin-top:18px" data-a="continueTransfer">${locked ? 'Transfer' : 'Continue'}</button>
          ${locked ? '' : raw(historyBlock())}
        </div>`
    };
  });

  CBE.define('transferForm', function () {
    return {
      appbar: CBE.appbar({ title: 'Transfer' }),
      body: h`
        <div class="u-stack">
          ${raw(receiverCard())}
          ${raw(fromCard())}
          ${raw(amountField())}
          ${raw(remarkRow())}
          <button class="btn btn--primary" style="margin-top:18px" data-a="continueTransfer">Transfer</button>
        </div>`
    };
  });

  /* ------------------------------------------------------ other transfers */
  var OTHER = [
    { id: 'wallet', name: 'Wallet', icon: 'wallet' },
    { id: 'otherBanks', name: 'Transfer to Other Banks', emblem: 'safaricom' },
    { id: 'microFinance', name: 'Transfer to Micro Finances', icon: 'briefcase' },
    { id: 'sacco', name: 'SACCO', icon: 'coins' }
  ];

  CBE.define('otherTransfers', function () {
    return {
      appbar: CBE.appbar({ title: 'Other Transfers', tools: ['search'] }),
      nav: '',
      body: h`
        <div class="group" style="padding:4px 6px">
          ${OTHER.map(function (o) {
            return h`<button class="bank-row" data-a="go" data-go="${o.id}">
              <span class="bank-row__logo" style="${o.id === 'otherBanks' ? 'background:#fff' : ''}">
                ${raw(o.emblem ? CBE.emblem(o.emblem, 30) : '<span style="color:#7b2bbd">' + icon(o.icon, 24) + '</span>')}
              </span>
              <span class="bank-row__text">
                <b>${o.name}</b>
                <small>${o.name}</small>
              </span>
              <span class="bank-row__chev">${raw(icon('chevronRight', 19))}</span>
            </button>`;
          })}
        </div>`
    };
  });

  CBE.define('wallet', function () {
    return {
      appbar: CBE.appbar({ title: 'Wallet', tools: ['search'] }),
      body: h`
        <div class="airtime-grid">
          ${CBE.brands.wallets.map(function (w) {
            return h`<button class="logo-card" data-a="walletGo" data-name="${w.name}">
              ${raw(CBE.brands.visual(w, 46))}
              <span>${w.name}</span>
            </button>`;
          })}
        </div>`
    };
  });

  CBE.define('microFinance', function () {
    return {
      appbar: CBE.appbar({ title: 'Micro Finances', tools: ['search'] }),
      body: h`
        <div class="group" style="padding:4px 6px">
          ${CBE.brands.micro.map(function (m) {
            return h`<button class="bank-row" data-a="walletGo" data-name="${m.name}">
              <span class="bank-row__logo">${raw(CBE.brands.visual(m, 36))}</span>
              <span class="bank-row__text"><b>${m.name}</b><small>Micro Finance</small></span>
              <span class="bank-row__chev">${raw(icon('chevronRight', 19))}</span>
            </button>`;
          })}
        </div>`
    };
  });

  CBE.define('sacco', function () {
    return {
      appbar: CBE.appbar({ title: 'SACCO', tools: ['search'] }),
      body: h`
        <div class="group" style="padding:4px 6px">
          ${CBE.brands.saccos.map(function (m) {
            return h`<button class="bank-row" data-a="walletGo" data-name="${m.name}">
              <span class="bank-row__logo">${raw(CBE.brands.visual(m, 36))}</span>
              <span class="bank-row__text"><b>${m.name}</b><small>SACCO</small></span>
              <span class="bank-row__chev">${raw(icon('chevronRight', 19))}</span>
            </button>`;
          })}
        </div>`
    };
  });

  /* ---------------------------------------------- other-bank account validation */
  var otherBank = { bank: '', account: '' };

  CBE.define('otherBanks', function () {
    return {
      appbar: CBE.appbar({ title: 'Account Validation' }),
      body: h`
        <div class="field-label">Bank Name</div>
        <button class="field" data-a="bankSheet" style="width:100%">
          ${raw(icon('bank', 21, 'field__icon--gold'))}
          <span style="flex:1 1 auto;font-size:15.5px;font-weight:600;color:${otherBank.bank ? '#1e2430' : '#98a0ac'};text-align:left">
            ${otherBank.bank || 'Select from the list'}
          </span>
          ${raw(icon('chevronDown', 19))}
        </button>
        <div class="field-label" style="margin-top:20px">Account</div>
        <div class="field">
          ${raw('<span class="field__icon field__icon--gold" style="font-size:14px;font-weight:700">$=</span>')}
          <input id="obAcc" type="text" inputmode="numeric" autocomplete="off" maxlength="20"
                 placeholder="Enter Account Number" value="${otherBank.account}" data-in="otherBankAcc" aria-label="Account number">
        </div>
        <button class="btn btn--primary" style="margin-top:26px" data-a="otherBankContinue">Continue</button>`
    };
  });

  function bankSheetHtml(query) {
    var q = String(query || '').toLowerCase();
    var list = CBE.brands.banks.filter(function (b) { return b.name.toLowerCase().indexOf(q) >= 0; });
    return h`
      <div class="sheet__grabber"></div>
      <div class="sheet__title" style="margin-bottom:12px">Bank Name</div>
      <label class="field" style="min-height:48px;border-radius:var(--r-full);background:#f6f5f9">
        ${raw(icon('search', 20, 'field__icon--muted'))}
        <input id="bankSearch" type="search" autocomplete="off" placeholder="Search..." value="${query || ''}" data-in="bankSearch" aria-label="Search banks">
      </label>
      <div style="margin-top:8px" id="bankList">
        ${list.length ? list.map(function (b) {
          return h`<button class="bank-row" data-a="pickBank" data-name="${b.name}">
            <span class="bank-row__logo">${raw(CBE.brands.visual(b, 38))}</span>
            <span class="bank-row__text"><b>${b.name}</b></span>
          </button>`;
        }) : raw('<div class="empty-state">No bank matches that search.</div>')}
      </div>`;
  }

  /* -------------------------------------------------------------- exports */
  CBE.transfer = {
    resetForm: resetForm,
    form: function () { return form; },
    startPayment: startPayment,
    openPad: openPad,
    paintPad: paintPad,
    padRef: pad,
    resolveName: resolveName,
    bankSheetHtml: bankSheetHtml,
    otherBank: otherBank,
    confirmHtml: confirmHtml,
    runPayment: runPayment
  };
})(typeof window !== 'undefined' ? window : this);
