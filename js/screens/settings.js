/* ==========================================================================
   settings.js — Settings and everything behind it, My Information, Contact Us,
   the withdrawal history and the hidden private setup (five taps on the
   version line, no hints anywhere in the UI).
   ========================================================================== */
(function (global) {
  'use strict';

  var CBE = global.CBE || (global.CBE = {});
  var h = CBE.h, icon = CBE.icon, raw = CBE.raw, qs = CBE.qs;
  var st = CBE.state;
  var B = CBE.brands;

  function row(opts) {
    return h`<button class="row" data-a="${opts.act}"${opts.go ? raw(' data-go="' + opts.go + '"') : ''}${opts.id ? raw(' data-id="' + opts.id + '"') : ''}>
      <span class="row__icon${opts.bare ? ' row__icon--bare' : ''}${opts.danger ? ' row__icon--plain' : ''}"${opts.danger ? raw(' style="color:#d93b3b"') : ''}>${raw(icon(opts.icon, 21))}</span>
      <span class="row__text"><b>${opts.title}</b>${opts.sub ? raw('<small>' + CBE.esc(opts.sub) + '</small>') : ''}</span>
      ${opts.trailing ? raw(opts.trailing) : raw('<span class="row__chev">' + icon('chevronRight', 19) + '</span>')}
    </button>`;
  }

  /* ================================================================ settings */
  CBE.define('settings', function () {
    return {
      appbar: CBE.appbar({ title: 'Settings' }),
      nav: 'settings',
      body: h`
        <div class="u-section-label" style="margin-top:4px">Preferences</div>
        <div class="group">
          ${raw(row({ act: 'langSheet', icon: 'globe', title: 'Language', sub: st.lang === 'am' ? '\u12a0\u121b\u122d\u129b' : 'English' }))}
          ${raw(row({ act: 'go', go: 'defaultAccounts', icon: 'users', title: 'Account Preferences' }))}
          ${raw(row({ act: 'go', go: 'notificationPrefs', icon: 'bell', title: 'Notification Preferences' }))}
          ${raw(row({ act: 'go', go: 'servicePrefs', icon: 'sliders', title: 'Service Preferences' }))}
        </div>
        <div class="u-section-label">Security Settings</div>
        <div class="group">
          ${raw(row({ act: 'go', go: 'securitySetting', icon: 'fingerprint', title: 'Biometric Login' }))}
          ${raw(row({ act: 'go', go: 'changePin', icon: 'key', title: 'Change PIN' }))}
          ${raw(row({ act: 'go', go: 'changePassphrase', icon: 'lock', title: 'Change Passphrase' }))}
        </div>
        <div class="u-section-label">Account Actions</div>
        <div class="group">
          ${raw(row({ act: 'logout', icon: 'logout', title: 'Log out', danger: true }))}
        </div>
        <button class="version" id="versionLine" data-a="versionTap" style="display:block;width:100%">Version: 6.1.0</button>
        <div class="legal-links">
          <button data-a="go" data-go="privacy">Privacy Policy</button>
          <span class="sep">\u00b7</span>
          <button data-a="go" data-go="terms">Terms and Tariffs.</button>
        </div>`
    };
  });

  /* ========================================================= my information */
  CBE.define('myInformation', function () {
    var account = !!CBE.miAccount;
    var qrPayload = 'https://mbrecieve.cbe.com.et/acct?n=' + CBE.digits(st.holder.account);
    if (!account) qrPayload = 'https://mbrecieve.cbe.com.et/tel?n=' + CBE.digits(st.holder.phone);
    return {
      appbar: CBE.appbar({ title: 'My Information' }),
      nav: '',
      body: h`
        <div class="mi-head" style="border-bottom:0">
          <span class="mi-avatar">${raw('<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8.6" r="3.6"/><path d="M5.4 20a6.6 6.6 0 0 1 13.2 0"/></svg>')}</span>
          <span>
            <b>${st.holder.name}</b>
            <small>Last Sign In: ${CBE.fmtLong(new Date(st.session.lastSignIn))} - ${CBE.fmtFull(new Date(st.session.lastSignIn)).split(', ')[1] || ''}</small>
          </span>
        </div>
        <div class="group" style="margin-top:4px">
          ${raw(row({ act: 'go', go: 'contactUs', icon: 'contact', title: 'Contact Us' }))}
          ${raw(row({
            act: 'toggleNoor', icon: 'wallet', title: 'CBE NOOR',
            trailing: '<span class="power-switch' + (st.noor ? ' is-on' : '') + '"><i></i>' + (st.noor ? 'on' : 'off') + '</span>'
          }))}
        </div>
        <div class="pill-tabs">
          <button class="${account ? 'is-active' : ''}" data-a="miTab" data-tab="account">My Accounts</button>
          <button class="${account ? '' : 'is-active'}" data-a="miTab" data-tab="phone">Phone Number</button>
        </div>
        <div class="qr-plate">
          <div class="qr-plate__img">${raw(CBE.qrSvg(qrPayload, 168, 'M'))}</div>
          <div class="qr-plate__num">${account ? CBE.maskAcct(st.holder.account) : CBE.digits(st.holder.phone)}</div>
          <div class="qr-plate__hint">Scan this ${account ? 'account' : 'phone'} number.</div>
        </div>
        <button class="logout-btn" data-a="logout">Log out</button>`
    };
  });

  /* ============================================================= contact us */
  CBE.define('contactUs', function () {
    var socials = [
      ['Facebook', '#1877f2', 'f'], ['Twitter', '#1da1f2', 't'], ['Telegram', '#229ed9', 't'],
      ['LinkedIn', '#0a66c2', 'in'], ['YouTube', '#ff0000', 'yt']
    ];
    return {
      appbar: CBE.appbar({ title: 'Contact Us' }),
      nav: '',
      body: h`
        <div class="group" style="padding:14px 16px">
          <div style="display:flex;align-items:center;gap:12px">
            <img src="img/cbe-logo.png" width="42" height="42" alt="">
            <span>
              <b style="font-size:15px">${st.letterhead.company}</b>
              <small style="display:block;font-size:11.5px;color:#9ba1a9">Digital Factory</small>
            </span>
          </div>
          <div style="display:flex;align-items:center;gap:12px;margin-top:14px">
            <span class="row__icon">${raw(icon('info', 19))}</span>
            <span><b style="display:block;font-size:14.5px">Version</b><small style="display:block;font-size:11.5px;color:#9ba1a9">6.1.0</small></span>
          </div>
        </div>
        <div class="u-section-label">Contact addresses</div>
        <div class="group" style="padding:4px 16px">
          ${[['phone', '951'], ['mail', 'contact@cbe.com.et'], ['globe', 'https://combanketh.et']].map(function (c) {
            return h`<button class="row" style="padding-left:0;padding-right:0" data-a="copyText" data-text="${c[1]}">
              <span class="row__icon row__icon--plain" style="color:#7b2bbd">${raw(icon(c[0], 20))}</span>
              <span class="row__text"><b>${c[1]}</b></span>
              <span class="row__chev">${raw(icon('copy', 17))}</span>
            </button>`;
          })}
        </div>
        <div class="u-section-label">Social medias</div>
        <div class="group" style="padding:4px 16px">
          ${socials.map(function (s) {
            return h`<button class="row" style="padding-left:0;padding-right:0" data-a="copyText" data-text="${s[0]}">
              <span class="media-list__mark" style="background:${s[1]};width:24px;height:24px;font-size:11px">${s[2]}</span>
              <span class="row__text"><b>${s[0]}</b></span>
              <span class="row__chev">${raw(icon('chevronRight', 18))}</span>
            </button>`;
          })}
        </div>`
    };
  });

  /* ==================================================== preference subpages */
  CBE.define('defaultAccounts', function () {
    return {
      appbar: CBE.appbar({ title: 'Default Account Preferences', tools: ['eye'] }),
      nav: '',
      body: h`
        <div class="u-section-label" style="margin-top:4px">Default Accounts</div>
        <div class="group">
          <div class="row">
            <span class="row__icon row__icon--plain" style="color:#d9443c">${raw(icon('arrowUpRight', 21))}</span>
            <span class="row__text"><b>Sending Money</b><small>${st.prefs.sendDefault}</small></span>
            <button class="btn btn--mini btn--soft" data-a="changeDefault" data-which="send">Change ${raw(icon('chevronDown', 14))}</button>
          </div>
          <div class="row">
            <span class="row__icon row__icon--plain" style="color:#2fae55">${raw(icon('arrowDownLeft', 21))}</span>
            <span class="row__text"><b>Receiving Money</b><small>${st.prefs.receiveDefault}</small></span>
            <button class="btn btn--mini btn--soft" data-a="changeDefault" data-which="receive">Change ${raw(icon('chevronDown', 14))}</button>
          </div>
        </div>`
    };
  });

  CBE.define('notificationPrefs', function () {
    return {
      appbar: CBE.appbar({ title: 'Notification Preferences' }),
      nav: '',
      body: h`
        <div class="u-section-label" style="margin-top:4px">General Notifications</div>
        ${B.notificationPrefs.map(function (n) {
          var on = st.prefs.notif[n.key] !== false;
          return h`<div class="group" style="padding:14px 16px;margin-bottom:12px">
            <div style="display:flex;align-items:center;gap:13px">
              <span class="row__icon">${raw(icon(n.icon, 20))}</span>
              <span style="flex:1 1 auto">
                <b style="display:block;font-size:14.5px">${n.name}</b>
                <small style="display:block;margin-top:3px;font-size:11.5px;color:#9ba1a9;line-height:1.4">${n.desc}</small>
              </span>
              <button class="switch${on ? ' is-on' : ''}" data-a="toggleNotif" data-key="${n.key}" aria-label="${n.name}"></button>
            </div>
          </div>`;
        })}`
    };
  });

  CBE.define('servicePrefs', function () {
    return {
      appbar: CBE.appbar({ title: 'Service Preferences' }),
      nav: '',
      body: h`
        <div class="u-section-label" style="margin-top:4px">Service Options</div>
        ${B.servicePrefs.map(function (s) {
          var on = st.prefs[s.key] !== false;
          return h`<div class="group" style="padding:14px 16px">
            <div style="display:flex;align-items:center;gap:13px">
              <span class="row__icon">${raw(icon(s.icon, 20))}</span>
              <span style="flex:1 1 auto">
                <b style="display:block;font-size:14.5px">${s.name}</b>
                <small style="display:block;margin-top:3px;font-size:11.5px;color:#9ba1a9;line-height:1.4">${s.desc}</small>
              </span>
              <button class="switch${on ? ' is-on' : ''}" data-a="togglePref" data-key="${s.key}" aria-label="${s.name}"></button>
            </div>
          </div>`;
        })}`
    };
  });

  CBE.define('securitySetting', function () {
    var on = st.prefs.biometric !== false;
    return {
      appbar: CBE.appbar({ title: 'Security Setting' }),
      nav: '',
      body: h`
        <div class="u-section-label" style="margin-top:4px">Preferences</div>
        <div class="group" style="padding:14px 16px">
          <div style="display:flex;align-items:center;gap:13px">
            <span style="display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:var(--brand-grad);color:#fff">
              ${raw('<img src="img/fingerprint-white.png" width="22" height="22" alt="">')}
            </span>
            <span style="flex:1 1 auto">
              <b style="display:block;font-size:14.5px">Biometric Login</b>
              <small style="display:block;margin-top:3px;font-size:11.5px;color:#9ba1a9">Biometric login is ${on ? 'on' : 'off'}</small>
            </span>
            <button class="switch${on ? ' is-on' : ''}" data-a="toggleBiometric" aria-label="Biometric login"></button>
          </div>
        </div>`
    };
  });

  function changeForm(kind) {
    var isPin = kind === 'pin';
    var noun = isPin ? 'PIN' : 'Passphrase';
    return {
      appbar: CBE.appbar({ title: 'Change ' + noun }),
      nav: '',
      body: h`
        ${[['lock', 'Current ' + noun], ['idCard', 'New ' + noun], ['shieldCheck', 'Confirm New ' + noun]].map(function (f, i) {
          return h`<div class="field" style="margin-bottom:14px">
            ${raw(icon(f[0], 20, 'field__icon--muted'))}
            <input type="password" autocomplete="off" placeholder="${f[1]}" data-in="changeField" data-index="${i}" aria-label="${f[1]}">
            <button class="field__tail field__tail--tappable" data-a="peek" aria-label="Show ${noun}">${raw(icon('eye', 18))}</button>
          </div>`;
        })}
        <button class="btn btn--primary" style="margin-top:10px;opacity:.5;pointer-events:none" id="changeBtn"
                data-a="saveChange" data-kind="${kind}">Update ${noun}</button>`
    };
  }

  CBE.define('changePin', function () { return changeForm('pin'); });
  CBE.define('changePassphrase', function () { return changeForm('pass'); });

  /* ======================================================== withdrawal history */
  CBE.define('withdrawalHistory', function () {
    var list = CBE.withdrawals || (CBE.withdrawals = []);
    return {
      appbar: CBE.appbar({ title: 'Withdrawal History', tools: ['refresh'] }),
      nav: '',
      body: list.length
        ? h`<div class="group" style="padding:4px 6px">
            ${list.map(function (w) {
              return h`<div class="bank-row">
                <span class="bank-row__logo" style="color:#7b2bbd">${raw(icon('coins', 22))}</span>
                <span class="bank-row__text"><b>${CBE.money(w.amount)} ETB</b><small>${w.reason} \u2022 ${CBE.fmtStamp(w.date)}</small></span>
                <span class="chip chip--violet">${w.status}</span>
              </div>`;
            })}
          </div>`
        : h`<div class="empty-visual">
            <span class="empty-visual__mark">${raw('<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.4 3.8h11.2v16.8l-5.6-3.4-5.6 3.4Z"/><path d="M9.4 11l1.8 1.8L14.6 9.4"/></svg>')}</span>
            <h3>No withdrawal requests found yet.</h3>
            <p>When you initiate a withdrawal, it will show up here.</p>
            <button class="pill-btn" data-a="refresh">${raw(icon('refresh', 18))} Refresh History</button>
          </div>`,
      fab: h`<button class="fab" data-a="go" data-go="newWithdrawal">${raw(icon('plus', 18))} New Withdrawal</button>`
    };
  });

  CBE.define('newWithdrawal', function () {
    return {
      appbar: CBE.appbar({ title: 'New Withdrawal' }),
      nav: '',
      body: h`
        <div class="field-label">Amount</div>
        <div class="field">
          ${raw(icon('bankCard', 20, 'field__icon--gold'))}
          <input type="text" inputmode="decimal" autocomplete="off" placeholder="Enter amount" data-in="wdAmount" aria-label="Amount">
        </div>
        <div class="field-label" style="margin-top:20px">Reason</div>
        <div class="field">
          ${raw(icon('doc', 20, 'field__icon--gold'))}
          <input type="text" autocomplete="off" placeholder="Reason for withdrawal" data-in="wdReason" aria-label="Reason">
        </div>
        <button class="btn btn--primary" style="margin-top:22px" data-a="submitWithdrawal">Submit Request</button>`
    };
  });

  /* ========================================================= private setup */
  function psField(label, key, value, opts) {
    opts = opts || {};
    return h`<div class="field" style="margin-bottom:12px;min-height:54px">
      ${raw(icon(opts.icon || 'doc', 19, 'field__icon--muted'))}
      <span style="flex:1 1 auto;min-width:0">
        <input style="width:100%;padding:8px 0" type="${opts.type || 'text'}" ${opts.mode ? raw('inputmode="' + opts.mode + '"') : ''}
               autocomplete="off" placeholder="${opts.placeholder || label}" data-in="${key}" aria-label="${label}">
        <small style="display:block;font-size:10.5px;color:#b9bfc9">${label}</small>
      </span>
    </div>`;
  }

  CBE.define('privateSetup', function () {
    var p = st.preset;
    return {
      appbar: CBE.appbar({ title: 'Setup' }),
      nav: '',
      body: h`
        <div class="ps-card" style="margin-top:0">
          <div class="ps-card__title">${raw(icon('user', 18))} Account holder</div>
          ${raw(psField('Account holder full name', 'psName', '', { icon: 'user', placeholder: st.holder.name }))}
          ${raw(psField('Account number', 'psAccount', '', { icon: 'bank', mode: 'numeric', placeholder: st.holder.account }))}
          ${raw(psField('Balance', 'psBalance', '', { icon: 'coins', mode: 'decimal', placeholder: CBE.money(st.holder.balance) }))}
          ${raw(psField('Phone number', 'psPhone', '', { icon: 'phone', mode: 'tel', placeholder: st.holder.phone }))}
          ${raw(psField('TIN (TAX ID)', 'psTin', '', { icon: 'idCard', mode: 'numeric', placeholder: st.holder.tin }))}
        </div>
        <div class="ps-card">
          <div class="ps-card__title">${raw(icon('send', 18))} Incoming transfer</div>
          <div class="switch-row" style="padding-top:4px">
            <span class="switch-row__text"><b>Use a prepared receiver</b><small>Name written on the next receipt</small></span>
            <button class="switch${p.enabled ? ' is-on' : ''}" data-a="togglePreset" aria-label="Prepared receiver"></button>
          </div>
          ${raw(psField('Receiver account holder name', 'psRName', '', { icon: 'user', placeholder: p.name || 'Full name' }))}
          ${raw(psField('Receiver account number', 'psRAccount', '', { icon: 'bank', mode: 'numeric', placeholder: p.account || '13 digits' }))}
          ${raw(psField('Receiver bank', 'psRBank', '', { icon: 'bank', placeholder: p.bank || 'Bank name' }))}
          ${raw(psField('Amount', 'psRAmount', '', { icon: 'coins', mode: 'decimal', placeholder: p.amount || '0.00' }))}
          ${raw(psField('Remark / reason', 'psRRemark', '', { icon: 'doc', placeholder: p.remark || 'MB Transfer' }))}
        </div>
        <div class="ps-card">
          <div class="ps-card__title">${raw(icon('percent', 18))} Service charge and tax</div>
          ${raw(psField('Service charge (ETB)', 'psService', '', { icon: 'coins', mode: 'decimal', placeholder: CBE.money(st.fees.service) }))}
          ${raw(psField('VAT % of service charge', 'psVat', '', { icon: 'percent', mode: 'decimal', placeholder: String(st.fees.vat) }))}
          ${raw(psField('Disaster recovery % of service charge', 'psDrf', '', { icon: 'percent', mode: 'decimal', placeholder: String(st.fees.drf) }))}
        </div>
        <div class="ps-card">
          <div class="ps-card__title">${raw(icon('receipt', 18))} Receipt letterhead</div>
          ${raw(psField('Bank name on the receipt', 'psCompany', '', { icon: 'bank', placeholder: st.letterhead.company }))}
          ${raw(psField('Tagline', 'psTagline', '', { icon: 'doc', placeholder: st.letterhead.tagline }))}
          ${raw(psField('Amharic name', 'psAmharic', '', { icon: 'doc', placeholder: st.letterhead.amharic }))}
        </div>
        <div class="btn-stack" style="margin-top:18px">
          <button class="btn btn--primary" data-a="saveSetup">Save</button>
          <button class="btn btn--outline" data-a="go" data-go="madeReceipts">${raw(icon('listRows', 19))} Receipts</button>
        </div>
        <button class="btn btn--ghost" style="margin-top:12px" data-a="resetAll">Reset everything</button>`
    };
  });

  CBE.define('madeReceipts', function () {
    var list = st.receipts;
    return {
      appbar: CBE.appbar({ title: 'Receipts' }),
      nav: '',
      body: list.length
        ? h`<div class="group" style="padding:4px 12px">
            ${list.map(function (r) {
              return h`<button class="rec-list__item" data-a="openReceipt" data-id="${r.id}">
                <span class="avatar avatar--solid">${CBE.initials(r.receiverName)}</span>
                <span>
                  <b>${r.receiverName}</b>
                  <small>${CBE.fmtStamp(r.date)} \u2022 ${r.ref}</small>
                </span>
                <span class="rec-list__amt">${CBE.money(r.total)}</span>
              </button>`;
            })}
          </div>`
        : '<div class="empty-state">No receipts yet. Complete a transfer and it will appear here, ready to edit.</div>'
    };
  });

  function editReceiptHtml(r) {
    return h`
      <div class="sheet__grabber"></div>
      <div class="sheet__title">Edit Receipt</div>
      ${[['Receiver name', 'receiverName', r.receiverName], ['Receiver account', 'receiverAccount', r.receiverAccount],
        ['Sender name', 'senderName', r.senderName], ['Sender account', 'senderAccount', r.senderAccount],
        ['Amount', 'amount', r.amount], ['Remark / reason', 'reason', r.reason]].map(function (f) {
        return h`<div class="field" style="margin-bottom:12px">
          ${raw(icon('doc', 18, 'field__icon--muted'))}
          <input type="text" autocomplete="off" placeholder="${f[0]}" value="${f[2]}" data-in="editReceipt" data-field="${f[1]}" aria-label="${f[0]}">
        </div>`;
      })}
      <div class="modal-actions" style="margin-top:8px">
        <button class="btn btn--plain" style="background:#e9e7ef" data-a="overlayClose">Cancel</button>
        <button class="btn btn--primary" data-a="saveReceipt" data-id="${r.id}">Save</button>
      </div>`;
  }

  CBE.settings = {
    row: row,
    editReceiptHtml: editReceiptHtml,
    psField: psField
  };
})(typeof window !== 'undefined' ? window : this);
