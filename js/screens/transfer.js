/* CBE Mobile Banking — CBE transfer flow: form, confirm, verify, PIN, execute */
(function () {
  const U = CBE.util;

  // resolve receiver name: saved custom receiver name owns every typed account;
  // known recent/beneficiary accounts show their real owner.
  function resolveName(acc) {
    const s = CBE.state;
    const clean = String(acc || '').trim();
    const known = s.recents.find(r => r.account === clean);
    if (known) return known.name;
    return s.preset.receiverName;
  }

  function accountField(o) {
    return (
      '<div class="field">' +
      '<label>' + U.esc(o.label) + '</label>' +
      '<div class="control">' +
      '<input id="' + o.id + '" type="text" inputmode="numeric" maxlength="13" placeholder="' + U.esc(o.ph) + '" data-in="accInput">' +
      '<span class="hint-ic">' + CBE.icon('user', 20) + '</span>' +
      '</div>' +
      '<div id="' + o.owner + '" class="acc-owner" style="display:none"></div>' +
      '</div>'
    );
  }

  CBE.router.on('cbeTransfer', function (p) {
    const pre = p && p.account ? p.account : '';
    return CBE.ui.page({title: 'CBE Transfer', back: true},
      '<div class="form" style="padding-bottom:20px">' +
      CBE.ui.field({label: 'From Account', id: 'fromAcc', value: CBE.state.account.type + ' 1********' + CBE.state.account.number.slice(-4), icon: 'bank'}) +
      '<div class="tabs" style="display:flex;gap:10px;margin-bottom:8px">' +
      '<button class="seg-btn active" data-a="destTab" data-t="acc" style="flex:1;padding:9px;border-radius:10px;border:1.5px solid var(--purple);color:var(--purple);font-weight:700;font-size:13px;background:var(--purple-50)">Account Number</button>' +
      '<button class="seg-btn" data-a="destTab" data-t="phone" style="flex:1;padding:9px;border-radius:10px;border:1.5px solid var(--line);color:var(--ink-3);font-weight:700;font-size:13px;background:#fff">Phone Number</button>' +
      '</div>' +
      '<div id="destWrap">' + accountField({label: 'Account Number', id: 'toAcc', ph: 'Enter 13-digit account', owner: 'accOwner'}) + '</div>' +
      CBE.ui.field({label: 'Amount*', id: 'amt', ph: '0.00', inputmode: 'decimal', icon: 'cash'}) +
      CBE.ui.field({label: 'Add remark', id: 'remark', ph: 'Default: MB transfer', icon: 'edit'}) +
      '<button class="btn" data-a="transferContinue">Continue</button>' +
      '<div class="recent-h"><span class="t">Recent Transfers</span><span class="tabs"><span class="active">Beneficiaries</span></span></div>' +
      '<div id="recentList">' +
      CBE.state.recents.map(r =>
        '<div class="bene" data-a="pickRecent" data-acc="' + r.account + '" data-name="' + U.esc(r.name) + '">' +
        '<span class="av">' + U.initials(r.name) + '</span>' +
        '<span class="tx"><span class="tt">' + U.esc(r.name) + '</span><br><span class="ss">' + U.mask(r.account) + '</span></span>' +
        '<span class="chev">' + CBE.icon('chev', 16) + '</span></div>'
      ).join('') +
      '</div>' +
      '</div>');
  });

  CBE.router.on('transferConfirm', function (p) {
    const f = CBE.store.fees(p.amount);
    const total = f.total;
    const sheet = CBE.ui.sheet(
      '<h3>Please Confirm</h3>' +
      '<div class="cf-row"><span class="k">From</span><span class="v">' + U.esc(CBE.state.holder.name) + '<span class="sub">' + U.maskStar(CBE.state.account.number) + '</span></span></div>' +
      '<div class="cf-row"><span class="k">To</span><span class="v">' + U.esc(p.toName) + '<span class="sub">' + U.maskStar(p.to) + '</span></span></div>' +
      '<div class="cf-row"><span class="k">Service Charge</span><span class="v">' + U.fmt(f.service) + ' ETB</span></div>' +
      '<div class="cf-row"><span class="k">VAT (15%)</span><span class="v">' + U.fmt(f.vat) + ' ETB</span></div>' +
      '<div class="cf-row"><span class="k">Disaster Recovery (5%)</span><span class="v">' + U.fmt(f.drf) + ' ETB</span></div>' +
      '<div class="cf-row cf-total"><span class="k">Total Amount</span><span class="v">' + U.fmt(total) + ' <small style="font-size:12px">ETB</small></span></div>' +
      '<div class="btn-row" style="margin-top:16px">' +
      '<button class="btn ghost" data-a="sheetClose">Cancel</button>' +
      '<button class="btn" data-a="confirmGo" data-to="' + U.esc(p.to) + '" data-name="' + U.esc(p.toName) + '" data-amt="' + p.amount + '" data-remark="' + U.esc(p.remark || 'MB Transfer') + '">Continue</button>' +
      '</div>'
    );
    return null;
  });

  CBE.router.on('verify', function (p) {
    const stage = p.stage || 'scan';
    let bodyInner;
    if (stage === 'scan') {
      bodyInner =
        '<div class="ring"><img src="img/fingerprint.png" alt=""></div>' +
        '<div class="verify-title">Scan your fingerprint</div>' +
        '<div class="verify-sub">Place your finger on the sensor to confirm</div>';
    } else if (stage === 'ok') {
      bodyInner =
        '<div class="ok-ring">' + CBE.icon('check', 44) + '</div>' +
        '<div class="verify-title">Biometrics Authenticated!</div>' +
        '<div class="verify-sub">Proceed to enter your PIN.</div>';
    } else {
      bodyInner =
        '<div class="fail-ring">' + CBE.icon('close', 44) + '</div>' +
        '<div class="verify-title">Verification Failed</div>' +
        '<div class="verify-sub">Biometric scan failed. Please try again.</div>' +
        '<button class="btn" style="width:200px" data-a="verifyRetry">Try Again</button>';
    }
    return CBE.ui.el(
      '<div class="page verify-page" data-screen="verify">' +
      '<div class="verify-hero"><h2>Verify Identity</h2><p>Scan your fingerprint to complete the transfer</p></div>' +
      '<div class="verify-body">' + bodyInner + '</div>' +
      '</div>'
    );
  });

  CBE.router.on('payPin', function (p) {
    const el = CBE.ui.el(
      '<div class="page" data-screen="payPin">' +
      '<div class="appbar"><button class="back" data-a="back">' + CBE.icon('back', 22) + '</button><h1>Transfer</h1></div>' +
      '<div class="scroll" style="display:flex;flex-direction:column">' +
      '<div class="card" style="margin:12px 16px;display:flex;gap:12px;align-items:center">' +
      '<span class="mono" style="width:44px;height:44px;border-radius:50%;background:var(--purple-100);color:var(--purple-700);display:grid;place-items:center;font-weight:800">' + U.initials(p.toName) + '</span>' +
      '<div style="flex:1"><div style="font-size:14.5px;font-weight:800">' + U.esc(p.toName) + '</div><div style="font-size:12px;color:var(--ink-3);margin-top:2px">' + U.maskStar(p.to) + ' \u00b7 ETB ' + U.fmt(p.amount) + '</div></div>' +
      '</div>' +
      '<div style="text-align:center;font-size:15px;font-weight:800;margin-top:8px">Enter your PIN to confirm</div>' +
      CBE.ui.pinPad({len: 4, fpAction: 'pinFp'}) +
      '<div style="text-align:center;color:var(--red);font-size:13px;font-weight:700;min-height:20px" id="pinErr"></div>' +
      '</div>' +
      '</div>'
    );
    CBE.pin = {value: '', ctx: p};
    return el;
  });

  CBE.router.on('refForm', function (p) {
    return CBE.ui.page({title: p.t || 'Payment', back: true},
      '<div class="form">' +
      CBE.ui.field({label: 'Reference Number', id: 'refNum', ph: 'Enter Reference Number', icon: 'doc'}) +
      CBE.ui.field({label: 'Amount*', id: 'refAmt', ph: '0.00', inputmode: 'decimal', icon: 'cash'}) +
      '<button class="btn" data-a="refGo" data-t="' + U.esc(p.t || 'Payment') + '">Continue</button>' +
      '</div>');
  });

  CBE.resolveName = resolveName;
})();
