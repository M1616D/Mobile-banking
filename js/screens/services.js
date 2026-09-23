/* ==========================================================================
   services.js — every service behind the home tiles and the Other Services
   grid. Most screens are built from three small factories so each one stays
   short but still fully wired.
   ========================================================================== */
(function (global) {
  'use strict';

  var CBE = global.CBE || (global.CBE = {});
  var h = CBE.h, icon = CBE.icon, raw = CBE.raw;
  var st = CBE.state;
  var B = CBE.brands;

  /* ------------------------------------------------------------ factories */
  function page(opts) {
    return {
      appbar: opts.appbar === false ? false : CBE.appbar({ title: opts.title, tools: opts.tools || [], back: opts.back }),
      nav: opts.nav || '',
      bodyClass: opts.bodyClass || '',
      screenClass: opts.screenClass || '',
      body: opts.body,
      onMount: opts.onMount
    };
  }

  /* a two-column grid of logo cards */
  function logoGrid(title, items, action, tools) {
    return CBE.define(title.__screen, function () {
      return page({
        title: title.text,
        tools: tools || ['search'],
        body: h`<div class="airtime-grid">
          ${items.map(function (it) {
            return h`<button class="logo-card" data-a="${action}" data-name="${it.name}"${it.id ? raw(' data-id="' + it.id + '"') : ''}>
              ${raw(it.visual ? it.visual : CBE.brands.visual(it, 46))}
              <span>${it.name}</span>
            </button>`;
          })}
        </div>`
      });
    });
  }

  /* a labelled form that ends in an amount and a real payment */
  function chargeScreen(cfg) {
    CBE.define(cfg.screen, function (p) {
      var values = CBE.chargeValues || (CBE.chargeValues = {});
      var ctx = cfg.params ? cfg.params(p, values) : {};
      return page({
        title: cfg.title,
        tools: cfg.tools || ['search'],
        body: h`
          ${cfg.note ? raw('<div class="ps-note">' + CBE.esc(cfg.note) + '</div>') : ''}
          ${(cfg.fields || []).map(function (f) {
            return h`<div class="field-label">${f.label}</div>
              <div class="field">
                ${raw(icon(f.icon || 'bank', 20, 'field__icon--gold'))}
                <input type="${f.type || 'text'}" inputmode="${f.mode || 'numeric'}" autocomplete="off" placeholder="${f.placeholder}"
                       value="${values[f.key] || ''}" data-in="${f.key}" aria-label="${f.label}">
              </div>`;
          })}
          <div class="field-label" style="margin-top:20px">Amount</div>
          <div class="field">
            ${raw(icon('bankCard', 20, 'field__icon--gold'))}
            <input type="text" inputmode="decimal" autocomplete="off" placeholder="Enter Amount"
                   value="${values.amount || ''}" data-in="chargeAmount" aria-label="Amount">
            <button class="field__tail field__tail--tappable" data-a="openPad" data-target="chargeAmount" aria-label="Amount keypad">${raw(icon('calculator', 19))}</button>
          </div>
          <button class="btn btn--primary" style="margin-top:24px" data-a="chargeGo" data-screen="${cfg.screen}">${cfg.cta || 'Continue'}</button>`
      });
    });
  }

  /* rows of institutions that all funnel into the payment form */
  function rowsScreen(cfg) {
    CBE.define(cfg.screen, function () {
      return page({
        title: cfg.title,
        tools: ['search'],
        body: h`<div class="group" style="padding:4px 6px">
          ${cfg.items.map(function (it) {
            return h`<button class="bank-row" data-a="${cfg.action}" data-name="${it.name}">
              <span class="bank-row__logo">${raw(it.visual || CBE.brands.visual(it, 36))}</span>
              <span class="bank-row__text"><b>${it.name}</b>${cfg.sub ? raw('<small>' + CBE.esc(cfg.sub(it)) + '</small>') : ''}</span>
              <span class="bank-row__chev">${raw(icon('chevronRight', 19))}</span>
            </button>`;
          })}
        </div>`
      });
    });
  }

  /* ======================================================= other services */
  CBE.define('otherServices', function (p) {
    var prelogin = !!p.prelogin;
    return page({
      title: 'Other Services',
      nav: prelogin ? '' : 'home',
      body: h`<div class="svc-grid">
        ${B.otherServices.map(function (s) {
          return h`<button class="svc-tile${s.wide ? ' svc-tile--wide' : ''}" data-a="service" data-service="${s.id}" data-prelogin="${prelogin ? 1 : 0}">
            <span class="svc-tile__icon">${raw(s.coin ? '<img src="img/cbe-logo.png" width="30" height="30" alt="">' : icon(s.icon || 'dot', 24))}</span>
            <span>${s.name}</span>
          </button>`;
        })}
      </div>`
    });
  });

  /* ============================================================== airtime */
  logoGrid({ __screen: 'airtime', text: 'Airtime' }, B.airtime, 'brandGo');

  CBE.define('airtimeTopup', function (p) {
    var brand = p.name || 'Ethio telecom Topup';
    return page({
      title: brand.replace(' Topup', ' Top Up'),
      body: h`
        <div class="field-label">Amount</div>
        <div class="field">
          ${raw(icon('bankCard', 20, 'field__icon--gold', 'field__icon'))}
          <input id="airAmt" type="text" inputmode="decimal" autocomplete="off" placeholder="Enter Amount"
                 value="${(CBE.chargeValues || {}).amount || ''}" data-in="chargeAmount" aria-label="Amount">
        </div>
        <button class="btn btn--primary" style="margin-top:22px" data-a="airtimeContinue" data-name="${brand}">Continue</button>`
    });
  });

  CBE.define('etTopup', function () {
    return page({
      title: 'Ethio telecom Topup',
      tools: ['search'],
      body: h`<div class="group" style="padding:4px 6px">
        <button class="bank-row" data-a="airtimeTopup" data-name="Ethio telecom Topup" data-self="1">
          <span class="bank-row__logo">${raw(CBE.brands.visual(B.airtime[0], 36))}</span>
          <span class="bank-row__text"><b>Buy Airtime - Self</b><small>Buy Airtime - Self</small></span>
          <span class="bank-row__chev">${raw(icon('chevronRight', 19))}</span>
        </button>
        <button class="bank-row" data-a="airtimeTopup" data-name="Ethio telecom Topup">
          <span class="bank-row__logo">${raw(CBE.brands.visual(B.airtime[0], 36))}</span>
          <span class="bank-row__text"><b>Buy Airtime - Others</b><small>Buy Airtime - Others</small></span>
          <span class="bank-row__chev">${raw(icon('chevronRight', 19))}</span>
        </button>
      </div>`
    });
  });

  /* ======================================================= bills & utilities */
  logoGrid({ __screen: 'bills', text: 'Bills & Utilities' }, B.bills, 'brandGo');

  /* a bill payment asks for the customer number and the amount */
  CBE.define('billPay', function (p) {
    var name = p.name || (CBE.chargeValues && CBE.chargeValues.brand) || 'Bill Payment';
    return page({
      title: name,
      body: h`
        <div class="field-label">Customer Number</div>
        <div class="field">
          ${raw(icon('idCard', 20, 'field__icon--gold'))}
          <input type="text" inputmode="numeric" autocomplete="off" placeholder="Enter customer number" data-in="billCustomer" aria-label="Customer number">
        </div>
        <div class="field-label" style="margin-top:20px">Amount</div>
        <div class="field">
          ${raw(icon('bankCard', 20, 'field__icon--gold'))}
          <input type="text" inputmode="decimal" autocomplete="off" placeholder="Enter Amount"
                 value="${(CBE.chargeValues || {}).amount || ''}" data-in="chargeAmount" aria-label="Amount">
          <button class="field__tail field__tail--tappable" data-a="openPad" data-target="chargeAmount" aria-label="Amount keypad">${raw(icon('calculator', 19))}</button>
        </div>
        <button class="btn btn--primary" style="margin-top:24px" data-a="chargeGo" data-screen="billPay">Pay Bill</button>`
    });
  });

  /* ================================================================ cards */
  CBE.define('cards', function () {
    var cards = [
      { id: 'c1', label: 'Saving Account Debit', pan: '5061 2400 1187 3619', type: 'Visa Debit', tone: '' },
      { id: 'c2', label: 'CBE NOOR Card', pan: '5061 2400 5521 8814', type: 'Debit Mastercard', tone: '--gold' }
    ];
    return page({
      title: 'Cards',
      tools: ['search'],
      body: h`<div class="u-stack">
        ${cards.map(function (c) {
          return h`<button class="card-visual${c.tone === '--gold' ? ' card-visual--gold' : ''}" data-a="cardDetail" data-id="${c.id}" style="width:100%;text-align:left">
            <div class="card-visual__top">
              <span style="font-size:12px;opacity:.9">${c.type}</span>
              <img src="img/cbe-logo.png" width="26" height="26" alt="" style="background:#fff;border-radius:6px;padding:2px">
            </div>
            <div class="card-visual__number">${c.pan}</div>
            <div class="card-visual__bottom">
              <span>${st.holder.name}</span>
              <span>12/29</span>
            </div>
          </button>`;
        })}
        <button class="btn btn--soft" data-a="requestCard">${raw(icon('plus', 19))} Request a new card</button>
      </div>`
    });
  });

  CBE.define('cardDetail', function (p) {
    var frozen = !!(CBE.cardFrozen && CBE.cardFrozen[p.id]);
    return page({
      title: 'Card Details',
      body: h`
        <div class="card-visual${frozen ? ' card-visual--frozen' : ''}">
          <div class="card-visual__top">
            <span style="font-size:12px">Visa Debit</span>
            <img src="img/cbe-logo.png" width="26" height="26" alt="" style="background:#fff;border-radius:6px;padding:2px">
          </div>
          <div class="card-visual__number">5061 2400 1187 3619</div>
          <div class="card-visual__bottom"><span>${st.holder.name}</span><span>12/29</span></div>
        </div>
        <div class="group" style="margin-top:18px;padding:4px 16px">
          <div class="switch-row">
            <span class="row__text"><b>Freeze card</b><small>Temporarily block all transactions</small></span>
            <button class="switch${frozen ? ' is-on' : ''}" data-a="freezeCard" data-id="${p.id}" aria-label="Freeze card"></button>
          </div>
          <div class="switch-row">
            <span class="row__text"><b>Online payments</b><small>Allow internet purchases</small></span>
            <button class="switch is-on" data-a="toggleSwitch" aria-label="Online payments"></button>
          </div>
          <div class="switch-row">
            <span class="row__text"><b>Contactless</b><small>Tap to pay up to 2,000 ETB</small></span>
            <button class="switch is-on" data-a="toggleSwitch" aria-label="Contactless"></button>
          </div>
        </div>
        <div class="btn-stack" style="margin-top:18px">
          <button class="btn btn--outline" data-a="viewPin">${raw(icon('key', 19))} View PIN</button>
          <button class="btn btn--ghost" data-a="cardLimits">Limits</button>
        </div>`
    });
  });

  /* ============================================================ CBE Birr */
  CBE.define('cbeBirr', function () {
    return page({
      title: 'CBEBirr',
      body: h`
        <div class="bal-card" style="padding:16px 18px">
          <div style="font-size:12px;color:#e3b95c">CBE Birr Wallet</div>
          <div style="margin-top:8px;font-size:24px;font-weight:700">${CBE.money(st.holder.balance * 0.18)} <span style="font-size:12px">ETB</span></div>
          <div style="margin-top:6px;font-size:12px;letter-spacing:.05em;color:#e6bb5f">${CBE.maskAcct(st.holder.account)}</div>
        </div>
        <div class="card-grid" style="padding:16px 0 0">
          <button class="card-btn" data-a="walletGo" data-name="CBEBirr Transfer"><span class="card-btn__icon card-btn__icon--disc card-btn__icon--violet">${raw(icon('send', 22))}</span><span class="card-btn__text"><b>Transfer</b><small>Send money</small></span></button>
          <button class="card-btn" data-a="airtime" ><span class="card-btn__icon card-btn__icon--disc card-btn__icon--mint">${raw(icon('phone', 22))}</span><span class="card-btn__text"><b>Buy Airtime</b><small>Top up now</small></span></button>
          <button class="card-btn" data-a="walletGo" data-name="CBEBirr Top Up"><span class="card-btn__icon card-btn__icon--disc card-btn__icon--rose">${raw(icon('plus', 22))}</span><span class="card-btn__text"><b>Top Up</b><small>From your account</small></span></button>
          <button class="card-btn" data-a="miniStatement"><span class="card-btn__icon card-btn__icon--disc">${raw(icon('doc', 22))}</span><span class="card-btn__text"><b>Statement</b><small>Last transactions</small></span></button>
        </div>`
    });
  });

  /* ========================================================== receive money */
  CBE.define('receiveMoney', function () {
    var amount = CBE.receiveAmount || 0;
    var payload = JSON.stringify({ account: st.holder.account, amount: amount, reason: 'Mobile Banking' });
    return page({
      title: 'Receive Money',
      body: h`
        <div class="rm-card">
          <div class="rm-card__brand">
            <img src="img/cbe-logo.png" alt="">
            <span>
              <b>${st.letterhead.company}</b>
              <small>${st.letterhead.tagline}</small>
            </span>
          </div>
          <div class="rm-card__acc">Account No: <b>${CBE.maskAcct(st.holder.account)}</b></div>
          <div class="rm-card__meta">
            <span>Amount<b>${CBE.money(amount)}</b></span>
            <span style="text-align:right">Reason<b>Mobile Banking</b></span>
          </div>
        </div>
        <div class="rm-qr">
          <div class="rm-qr__inner">
            ${raw(CBE.qrSvg('https://mbrecieve.cbe.com.et/?d=' + encodeURIComponent(payload), 216, 'M'))}
            <span class="rm-qr__mark"><img src="img/cbe-logo.png" alt=""></span>
          </div>
        </div>
        <div class="rm-actions">
          <button data-a="shareQr">${raw(icon('share', 22))}<span>Share QR</span></button>
          <button data-a="copyLink">${raw(icon('link', 22))}<span>Copy Link</span></button>
          <button data-a="downloadQr">${raw(icon('download', 22))}<span>Download</span></button>
        </div>
        <button class="btn btn--primary" style="margin-top:16px" data-a="addReceiveAmount">ADD AMOUNT</button>`
    });
  });

  /* ======================================================= mini statement */
  CBE.define('miniStatement', function () {
    var list = CBE.store.txList().slice(0, 10);
    return page({
      title: 'Mini Statement',
      tools: ['download'],
      body: h`
        <div class="group" style="padding:14px 16px">
          <div class="kv"><span class="kv__key">Account</span><span class="kv__val">${CBE.maskAcct(st.holder.account)}</span></div>
          <div class="kv"><span class="kv__key">Type</span><span class="kv__val">${st.accountType}</span></div>
          <div class="kv"><span class="kv__key">Available balance</span><span class="kv__val">${CBE.money(st.holder.balance)} ETB</span></div>
          <div class="kv"><span class="kv__key">Printed</span><span class="kv__val">${CBE.fmtFull(new Date())}</span></div>
        </div>
        <div class="tx-list" style="padding:14px 0 0">
          ${list.map(function (t) {
            return h`<div class="tx-row">
              <span class="tx-row__icon tx-row__icon--${t.direction}">${raw(icon(t.direction === 'out' ? 'arrowUpRight' : 'arrowDownLeft', 21))}</span>
              <span class="tx-row__main"><b>${t.name}</b><small>${CBE.fmtStamp(t.date)}</small></span>
              <span class="tx-row__amt"><b class="is-${t.direction}">${t.amount < 0 ? '-' : '+'}${CBE.money(Math.abs(t.amount))}</b><span class="chip">${t.kind}</span></span>
            </div>`;
          })}
        </div>`
    });
  });

  /* =============================================================== cash out */
  chargeScreen({
    screen: 'cashOut',
    title: 'Cash Out',
    cta: 'Request Cash Out',
    fields: [
      { key: 'agentCode', label: 'Agent Code', icon: 'atm', placeholder: 'Enter agent code' },
      { key: 'otpPhone', label: 'Phone Number', icon: 'phone', placeholder: 'Enter phone number' }
    ]
  });

  chargeScreen({ screen: 'billShare', title: 'Bill Share', cta: 'Share Bill', fields: [{ key: 'sharePhone', label: 'Phone Number', icon: 'phone', placeholder: 'Enter phone number' }] });
  chargeScreen({ screen: 'taxPayment', title: 'Tax Payment', cta: 'Pay Tax', fields: [{ key: 'tin', label: 'TIN (TAX ID)', icon: 'idCard', placeholder: 'Enter TIN' }] });
  chargeScreen({ screen: 'payMerchant', title: 'Pay Merchant', cta: 'Pay Merchant', fields: [{ key: 'merchant', label: 'Merchant Code', icon: 'tag', placeholder: 'Enter merchant code' }] });
  chargeScreen({ screen: 'trafficFine', title: 'Traffic Fine', cta: 'Pay Fine', fields: [{ key: 'plate', label: 'Plate Number', icon: 'car', placeholder: 'AA 3 B 12345', mode: 'text' }] });
  chargeScreen({ screen: 'donation', title: 'Donation', cta: 'Donate', fields: [{ key: 'cause', label: 'Organization', icon: 'heart', placeholder: 'Choose a cause', mode: 'text' }] });
  chargeScreen({ screen: 'shopping', title: 'Shopping', cta: 'Pay', fields: [{ key: 'shop', label: 'Merchant', icon: 'cart', placeholder: 'Select merchant', mode: 'text' }] });
  chargeScreen({ screen: 'forex', title: 'Forex', cta: 'Order Currency', fields: [{ key: 'currency', label: 'Currency', icon: 'exchange', placeholder: 'USD, EUR, GBP…', mode: 'text' }] });

  /* ================================================================ loans */
  CBE.define('fastLoan', function () {
    return page({
      title: 'CBE Fast Loan',
      body: h`
        <div class="dash-card" style="background:var(--brand-grad);color:#fff;box-shadow:var(--e-brand)">
          <h3 style="color:#fff">You are eligible for up to</h3>
          <div style="margin-top:10px;font-size:30px;font-weight:800">${CBE.money(50000, 0)} <span style="font-size:13px">ETB</span></div>
          <p style="color:rgba(255,255,255,.8)">Interest 12% per year \u2022 Tenor 3 \u2013 24 months</p>
        </div>
        <div class="group" style="margin-top:16px;padding:12px 16px">
          <div class="kv"><span class="kv__key">Processing fee</span><span class="kv__val">0.50 ETB</span></div>
          <div class="kv"><span class="kv__key">VAT (${st.fees.vat}%)</span><span class="kv__val">${CBE.money(CBE.store.fees(1).vat)} ETB</span></div>
          <div class="kv"><span class="kv__key">Repayment</span><span class="kv__val">Monthly</span></div>
          <div class="kv"><span class="kv__key">Disbursement</span><span class="kv__val">${CBE.maskAcct(st.holder.account)}</span></div>
        </div>
        <button class="btn btn--primary" style="margin-top:20px" data-a="requestLoan" data-amount="5000">Request ${CBE.money(5000, 0)} ETB</button>
        <button class="btn btn--ghost" style="margin-top:10px" data-a="loanProducts">See all loan products</button>`
    });
  });

  CBE.define('loanProducts', function () {
    var products = [
      { name: 'Fast Loan', desc: 'Instant, up to 50,000 ETB', icon: 'bolt' },
      { name: 'Personal Loan', desc: 'Up to 500,000 ETB, 36 months', icon: 'user' },
      { name: 'Mortgage Loan', desc: 'Up to 15 years', icon: 'home' },
      { name: 'Vehicle Loan', desc: 'Up to 5 years', icon: 'car' },
      { name: 'Business Loan', desc: 'Working capital', icon: 'briefcase' },
      { name: 'Diaspora Loan', desc: 'For Ethiopians abroad', icon: 'globe' }
    ];
    return page({
      title: 'Loan Products',
      tools: ['search'],
      body: h`<div class="group" style="padding:4px 6px">
        ${products.map(function (p) {
          return h`<button class="bank-row" data-a="productDetail" data-name="${p.name}" data-desc="${p.desc}">
            <span class="bank-row__logo" style="color:#7b2bbd">${raw(icon(p.icon, 24))}</span>
            <span class="bank-row__text"><b>${p.name}</b><small>${p.desc}</small></span>
            <span class="bank-row__chev">${raw(icon('chevronRight', 19))}</span>
          </button>`;
        })}
      </div>`
    });
  });

  CBE.define('productDetail', function (p) {
    return page({
      title: p.name || 'Product',
      body: h`
        <div class="dash-card">
          <h3>${p.name || 'Product'}</h3>
          <p>${p.desc || 'Talk to a branch officer to complete this application.'}</p>
        </div>
        <div class="group" style="margin-top:16px;padding:12px 16px">
          <div class="kv"><span class="kv__key">Service charge</span><span class="kv__val">${CBE.money(st.fees.service)} ETB</span></div>
          <div class="kv"><span class="kv__key">VAT (${st.fees.vat}%)</span><span class="kv__val">${CBE.money(CBE.store.fees(1).vat)} ETB</span></div>
          <div class="kv"><span class="kv__key">Disaster recovery (${st.fees.drf}%)</span><span class="kv__val">${CBE.money(CBE.store.fees(1).drf)} ETB</span></div>
        </div>
        <button class="btn btn--primary" style="margin-top:18px" data-a="requestLoan" data-amount="2500" data-name="${p.name || 'Loan'}">Apply now</button>`
    });
  });

  /* ======================================================= info screens */
  CBE.define('rates', function () {
    return page({
      title: 'Exchange Rates',
      body: h`
        <div class="group" style="padding:6px 16px">
          <div class="kv" style="font-weight:700"><span class="kv__key">Currency</span><span class="kv__val">Buy / Sell</span></div>
          ${B.rates.map(function (r) {
            return h`<div class="kv"><span class="kv__key">${r[0]} \u2022 ${r[1]}</span><span class="kv__val">${r[2]} / ${r[3]}</span></div>`;
          })}
        </div>
        <div class="ps-note" style="margin-top:14px">Indicative rates, updated ${CBE.fmtFull(new Date())}.</div>`
    });
  });

  CBE.define('ussd', function () {
    var codes = [['*889#', 'Main menu'], ['*889*1#', 'Balance enquiry'], ['*889*2#', 'Mini statement'], ['*889*3#', 'Transfer'], ['*889*4#', 'Airtime top up'], ['*889*5#', 'Change PIN']];
    return page({
      title: 'USSD',
      body: h`<div class="group" style="padding:4px 6px">
        ${codes.map(function (c) {
          return h`<button class="bank-row" data-a="copyText" data-text="${c[0]}">
            <span class="bank-row__logo" style="color:#7b2bbd">${raw(icon('ussd', 22))}</span>
            <span class="bank-row__text"><b>${c[0]}</b><small>${c[1]}</small></span>
            <span class="bank-row__chev">${raw(icon('copy', 18))}</span>
          </button>`;
        })}
      </div>`
    });
  });

  CBE.define('internetBanking', function () {
    return page({
      title: 'Internet Banking',
      body: h`
        <div class="dash-card">
          <h3>Internet Banking</h3>
          <p>Your online banking profile is linked to ${CBE.maskAcct(st.holder.account)}. Use the same credentials at combanketh.et.</p>
        </div>
        <div class="group" style="margin-top:16px;padding:12px 16px">
          <div class="kv"><span class="kv__key">Online banking</span><span class="kv__val">Enabled</span></div>
          <div class="kv"><span class="kv__key">Last sign in</span><span class="kv__val">${CBE.fmtFull(new Date(st.session.lastSignIn))}</span></div>
          <div class="kv"><span class="kv__key">Two-factor</span><span class="kv__val">SMS OTP</span></div>
        </div>
        <button class="btn btn--outline" style="margin-top:18px" data-a="copyText" data-text="https://combanketh.et">Open combanketh.et</button>`
    });
  });

  CBE.define('verifyReceipt', function () {
    return page({
      title: 'Verify Receipt',
      body: h`
        <div class="field-label">Reference Number</div>
        <div class="field">
          ${raw(icon('receiptCheck', 20, 'field__icon--gold'))}
          <input id="refInput" type="text" autocomplete="off" placeholder="FT26264LRXTX" data-in="verifyRef" aria-label="Reference number">
        </div>
        <button class="btn btn--primary" style="margin-top:20px" data-a="verifyReceipt">Verify</button>
        <div id="verifyOut"></div>`
    });
  });

  CBE.define('feedback', function () {
    return page({
      title: 'Feedback',
      body: h`
        <div class="field-label">Subject</div>
        <div class="field">
          ${raw(icon('chat', 20, 'field__icon--gold'))}
          <input type="text" autocomplete="off" placeholder="How can we help?" data-in="fbSubject" aria-label="Subject">
        </div>
        <div class="field-label" style="margin-top:20px">Message</div>
        <div class="field" style="min-height:140px;align-items:flex-start;padding-top:8px">
          <textarea rows="5" placeholder="Write your feedback…" data-in="fbBody" aria-label="Message" style="min-height:110px"></textarea>
        </div>
        <button class="btn btn--primary" style="margin-top:20px" data-a="sendFeedback">Send Feedback</button>`
    });
  });

  CBE.define('callcenter', function () {
    return page({
      title: 'Call Center',
      body: h`
        <div class="dash-card" style="text-align:center">
          <h3 style="font-size:26px">951</h3>
          <p>Toll free, 24 hours a day, 7 days a week.</p>
        </div>
        <div class="group" style="margin-top:16px;padding:4px 6px">
          ${[['Card blocking', 'lost, stolen or damaged cards'], ['Transaction dispute', 'report a wrong debit'], ['Loan enquiry', 'status of an application'], ['General support', 'anything else']].map(function (r) {
            return h`<button class="bank-row" data-a="callTopic" data-name="${r[0]}">
              <span class="bank-row__logo" style="color:#7b2bbd">${raw(icon('phone', 22))}</span>
              <span class="bank-row__text"><b>${r[0]}</b><small>${r[1]}</small></span>
              <span class="bank-row__chev">${raw(icon('chevronRight', 19))}</span>
            </button>`;
          })}
        </div>
        <button class="btn btn--primary" style="margin-top:18px" data-a="dial">${raw(icon('phone', 19))} Call 951</button>`
    });
  });

  CBE.define('locator', function () {
    return page({
      title: 'CBE Locator',
      tools: ['search'],
      body: h`
        <div class="scan-box" style="width:100%;aspect-ratio:16/10;margin-bottom:16px">
          <div style="text-align:center;color:#fff">
            ${raw(icon('mapPin', 30))}
            <div style="margin-top:8px;font-size:12px;opacity:.75">Map preview \u2022 Addis Ababa</div>
          </div>
        </div>
        <div class="group" style="padding:4px 6px">
          ${B.branches.map(function (b) {
            return h`<button class="bank-row" data-a="branchDetail" data-name="${b.name}" data-addr="${b.addr}" data-code="${b.code}">
              <span class="bank-row__logo" style="color:#7b2bbd">${raw(icon('bank', 22))}</span>
              <span class="bank-row__text"><b>${b.name}</b><small>${b.addr}</small></span>
              <span class="bank-row__chev">${raw(icon('chevronRight', 19))}</span>
            </button>`;
          })}
        </div>`
    });
  });

  CBE.define('survey', function () {
    var questions = [
      ['How easy was it to use the app today?', ['Very easy', 'Easy', 'Neutral', 'Hard']],
      ['Would you recommend CBE Mobile Banking?', ['Definitely', 'Probably', 'Not sure', 'No']]
    ];
    return page({
      title: 'Survey',
      body: h`${questions.map(function (q, i) {
        return h`<div class="group" style="padding:14px 16px;margin-bottom:14px">
          <b style="font-size:14.5px">${q[0]}</b>
          <div style="margin-top:10px">
            ${q[1].map(function (opt) {
              return h`<div class="choice-row" data-a="surveyPick" data-q="${i}" data-opt="${opt}">
                <span class="choice-row__radio"><i></i></span><b>${opt}</b>
              </div>`;
            })}
          </div>
        </div>`;
      })}<button class="btn btn--primary" data-a="sendSurvey">Submit Survey</button>`
    });
  });

  CBE.define('cbeLinks', function () {
    var links = [
      ['CBE Website', 'https://combanketh.et'],
      ['CBE Noor', 'https://combanketh.et/noor'],
      ['CBE Birr', 'https://cbebirr.cbe.com.et'],
      ['Internet Banking', 'https://cbeib.cbe.com.et'],
      ['Careers', 'https://combanketh.et/careers']
    ];
    return page({
      title: 'CBE Links',
      body: h`<div class="group" style="padding:4px 6px">
        ${links.map(function (l) {
          return h`<button class="bank-row" data-a="copyText" data-text="${l[1]}">
            <span class="bank-row__logo" style="color:#7b2bbd">${raw(icon('link', 22))}</span>
            <span class="bank-row__text"><b>${l[0]}</b><small>${l[1]}</small></span>
            <span class="bank-row__chev">${raw(icon('copy', 18))}</span>
          </button>`;
        })}
      </div>`
    });
  });

  var PRIVACY = ['We collect only the information required to provide banking services to you.',
    'Transaction data is processed inside Ethiopia and retained for the period required by the National Bank of Ethiopia.',
    'Biometric data never leaves your device: matching happens in the secure element of your phone.',
    'You may request a copy or deletion of your personal data at any branch or through 951.'];
  var TERMS = ['Service charges shown in the app are updated before every debit and displayed on the confirmation sheet.',
    'VAT is charged at 15% of the service charge; the Disaster Risk Response Fund is 5% of the service charge.',
    'Transfers to other banks settle through EthSwitch and normally arrive within minutes.',
    'Keep your PIN and passphrase secret. CBE will never ask for them over the phone.'];

  function legal(title, items) {
    CBE.define(title.__screen, function () {
      return page({
        title: title.text,
        body: h`<div class="group" style="padding:16px">
          ${items.map(function (t) { return h`<p style="margin-bottom:12px;font-size:13.5px;line-height:1.6">${t}</p>`; })}
        </div>`
      });
    });
  }
  legal({ __screen: 'privacy', text: 'Privacy Policy' }, PRIVACY);
  legal({ __screen: 'terms', text: 'Terms and Tariffs' }, TERMS);

  CBE.services = {
    page: page,
    chargeValues: {}
  };
})(typeof window !== 'undefined' ? window : this);
