/* =========================================================================
   transfer.js — CBE Transfer, the shared payment pipeline and its sheets.
   Money rules: the entered amount plus service charge, VAT and DRRF are
   debited from the active balance in one step, and the same numbers are
   handed to the receipt so confirmation, balance and receipt always agree.
   ========================================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------- receiver lookup -- */
  function resolveReceiver(account) {
    var acc = U.digits(account);
    var list = Store.get().beneficiaries || [];
    for (var i = 0; i < list.length; i++) {
      if (U.digits(list[i].account) === acc) return { name: list[i].name, known: true };
    }
    if (acc.length === 13) return { name: Store.get().receiverName, known: false };
    return { name: "", known: false };
  }

  /* ------------------------------------------------------- amount sheet -- */
  function amountSheet(initial, onDone, opts) {
    opts = opts || {};
    var raw = initial ? String(initial) : "";
    var s = UI.sheet({
      title: opts.title || "Enter Amount",
      closeBtn: true,
      body: '<div class="field" style="margin-top:0">' +
          '<div class="input"><span class="input__icon">' + Icon("cash", 21) + "</span>" +
            '<input data-amt type="text" inputmode="decimal" placeholder="0.00" value="' + U.esc(raw) + '"></div>' +
          '<div class="hint">Available balance: ' + U.money(Store.get().balance) + " ETB</div>" +
        "</div>" +
        '<div data-pad style="margin-top:10px"></div>' +
        '<button class="btn btn--block" data-act="ok" style="margin-top:14px">Continue</button>'
    });
    var input = s.node.querySelector("[data-amt]");
    var pad = UI.pinPad({
      length: 99,
      onChange: function () { },
      onSubmit: function () { }
    });
    // digits-only keypad driving the amount field
    var html = UI.keypad();
    var padHost = s.node.querySelector("[data-pad]");
    padHost.innerHTML = html;
    padHost.addEventListener("click", function (e) {
      var b = e.target.closest("[data-key]");
      if (!b) return;
      var k = b.dataset.key;
      U.haptic(6);
      if (k === "back") raw = raw.slice(0, -1);
      else if (k === "ok") return;
      else if (k === ".") { if (raw.indexOf(".") < 0) raw = (raw || "0") + "."; }
      else {
        if (raw === "0") raw = "";
        if (raw.split(".")[1] && raw.split(".")[1].length >= 2) return;
        raw += k;
      }
      input.value = raw;
    });
    input.addEventListener("input", function () { raw = U.esc(input.value).replace(/[^\d.]/g, ""); input.value = raw; });
    s.node.querySelector('[data-act="ok"]').addEventListener("click", function () {
      var v = parseFloat(raw || "0");
      if (!v || v <= 0) { UI.toast("Enter a valid amount"); return; }
      s.close();
      onDone(U.cents(v));
    });
    setTimeout(function () { input.focus(); }, 80);
    return s;
  }

  /* ------------------------------------------------ biometric + PIN gates */
  function verifyIdentity(opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var refused = !Store.get().biometric;
      var s = UI.sheet({
        cls: "verify-sheet",
        dismissible: false,
        body: '<div class="verify">' +
            '<div class="verify__title">Verify Identity</div>' +
            '<div class="verify__sub">Scan your ' + (opts.method || "fingerprint") + ' to complete the transfer</div>' +
            '<div class="verify__art" data-art>' +
              '<svg class="arc" viewBox="0 0 108 108" fill="none">' +
                '<circle cx="54" cy="54" r="50" stroke="#e23b2e" stroke-width="3" stroke-linecap="round" ' +
                'stroke-dasharray="180 320" transform="rotate(120 54 54)"/></svg>' +
              '<span class="verify__fp">' + Icon.fingerprint(58, "dark") + "</span>" +
            "</div>" +
            '<div class="verify__say">Scan your fingerprint</div>' +
            '<div class="verify__say2">Place your finger on the sensor to confirm</div>' +
          "</div>"
      });

      setTimeout(function () {
        if (refused) {
          s.node.querySelector(".sheetmodal__body").innerHTML =
            '<div class="verify">' +
              '<div class="verify__circle verify__circle--red">' + Icon("x", 44) + "</div>" +
              '<div class="verify__fail">Verification Failed</div>' +
              '<div class="verify__say2">Biometric scan failed. Please try again.</div>' +
              '<button class="btn btn--block" data-act="retry" style="margin-top:22px">Try Again</button>' +
            "</div>";
          s.node.querySelector('[data-act="retry"]').addEventListener("click", function () {
            s.close();
            verifyIdentity(opts).then(resolve);
          });
          return;
        }
        s.node.querySelector(".sheetmodal__body").innerHTML =
          '<div class="verify">' +
            '<div class="verify__circle verify__circle--green">' + Icon("check", 44) + "</div>" +
            '<div class="verify__ok">Biometrics Authenticated!</div>' +
            '<div class="verify__say2">Proceed to enter your PIN.</div>' +
          "</div>";
        U.haptic(26);
        setTimeout(function () { s.close(); resolve(true); }, 900);
      }, 1600);
    });
  }

  function askPin() {
    return new Promise(function (resolve, reject) {
      var settled = false;
      var s = UI.sheet({
        cls: "pin-sheet",
        dismissible: false,
        closeBtn: true,
        onClose: function () { if (!settled) { settled = true; reject("cancelled"); } },
        body: '<div class="verify" style="padding-bottom:2px">' +
            '<div style="color:var(--purple);font-size:19px;font-weight:700;padding:2px 0 4px">Enter your PIN to confirm</div>' +
          "</div>" +
          '<div data-dots></div>' +
          '<button class="btn btn--quiet" data-act="cancel" style="height:36px;background:none;color:var(--ink-3);margin:4px auto 6px;display:block;font-size:14px">Cancel</button>' +
          '<div data-pad></div>'
      });
      var pad = UI.pinPad({
        length: 6,
        onChange: function () { },
        onSubmit: function (v) {
          if (v === Store.get().pin) {
            settled = true;
            s.node._ok = true;
            resolve(true);
            s.close();
          } else {
            UI.toast("Incorrect PIN. Please try again.");
            pad.clear();
          }
        },
        onShort: function () { UI.toast("Enter your 6-digit PIN"); }
      });
      s.node.querySelector("[data-dots]").appendChild(pad.dots);
      s.node.querySelector("[data-pad]").appendChild(pad.pad);
      s.node.querySelector('[data-act="cancel"]').addEventListener("click", function () { s.close(); });
    });
  }

  /* ------------------------------------------------------------ pipeline */
  var Flow = {
    amountSheet: amountSheet,
    resolveReceiver: resolveReceiver,

    /* builds the transaction record, gates it, then debits and receipts */
    pay: function (req) {
      var amount = req.amount;
      var fees = Fees.compute(amount, req.channel || "mb");
      var senderName = Store.get().holderName;
      var tx = {
        id: U.txnId(),
        date: new Date(),
        senderName: senderName,
        senderLast4: Store.last4(),
        receiverName: req.receiverName,
        receiverAccount: U.digits(req.receiverAccount),
        receiverLast4: U.digits(req.receiverAccount).slice(-4),
        channel: req.channel || "mb",
        reason: fees.reason,
        label: req.label || "CBE Transfer",
        fees: fees
      };

      return new Promise(function (resolve, reject) {
        var proceed = function () {
          verifyIdentity({ method: "fingerprint" }).then(function () {
            askPin().then(function () {
              if (fees.total > Store.get().balance) {
                UI.toast("Insufficient balance for this transfer");
                reject("insufficient");
                return;
              }
              tx.balanceAfter = Store.debit(fees.total);
              Store.record(tx);
              Guard.secure(true);
              Router.push("receipt", { tx: tx, fresh: true });
              resolve(tx);
            }).catch(reject);
          });
        };

        var feesHtml = "";
        if (fees.service > 0) {
          feesHtml =
            '<div class="confirm-row"><span class="confirm-row__k">Service Charge</span>' +
              '<span class="confirm-row__v"><b>' + U.money(fees.service) + " ETB</b></span></div>" +
            '<div class="confirm-row"><span class="confirm-row__k">VAT (15%)</span>' +
              '<span class="confirm-row__v"><b>' + U.money(fees.vat) + " ETB</b></span></div>" +
            '<div class="confirm-row"><span class="confirm-row__k">Disaster Recovery</span>' +
              '<span class="confirm-row__v"><b>' + U.money(fees.drrf) + " ETB</b></span></div>";
        }

        var sheet = UI.sheet({
          dismissible: true,
          body: '<h2 class="sheetmodal__title" style="padding-bottom:8px">Please Confirm</h2>' +
            '<div class="confirm-row"><span class="confirm-row__k">From</span>' +
              '<span class="confirm-row__v"><b>' + U.esc(tx.senderName) + "</b>" +
              "<span>" + U.esc(U.maskShort(Store.get().accountNumber)) + "</span></span></div>" +
            '<div class="confirm-row"><span class="confirm-row__k">To</span>' +
              '<span class="confirm-row__v"><b>' + U.esc(tx.receiverName) + "</b>" +
              "<span>" + U.esc(U.maskShort(tx.receiverAccount)) + "</span></span></div>" +
            feesHtml +
            '<div class="confirm-row" style="align-items:center;padding-top:18px">' +
              '<span class="confirm-total__k">Total Amount</span>' +
              '<span class="confirm-total__v">' + U.money(fees.total) + " <small>ETB</small></span></div>" +
            '<div class="btn-row" style="margin-top:16px">' +
              '<button class="btn btn--quiet" data-act="cancel" style="background:#fdeceb;color:var(--red-strong)">Cancel</button>' +
              '<button class="btn" data-act="go">Continue</button>' +
            "</div>"
        });
        sheet.node.querySelector('[data-act="cancel"]').addEventListener("click", function () {
          sheet.close(); reject("cancelled");
        });
        sheet.node.querySelector('[data-act="go"]').addEventListener("click", function () {
          sheet.close();
          proceed();
        });
      });
    }
  };

  /* ------------------------------------------------------ transfer form -- */
  function transferView() {
    var el = UI.h('<div class="screen">' +
      UI.appbar({ title: "CBE Transfer" }) +
      '<div class="body"><div class="sheet">' +
        '<div class="pad" style="padding-top:16px">' +
          '<div class="fromacct">' +
            '<div class="fromacct__label">From Account</div>' +
            '<div class="fromacct__acct">savings <b data-slot="acct"></b></div>' +
            '<div class="fromacct__row"><span class="fromacct__dots">••••••</span>' +
              Icon("eyeOff", 18) + "</div>" +
          "</div>" +
          '<div class="field" data-slot="acctfield"></div>' +
          '<div class="field">' +
            '<div class="input"><span class="input__icon">' + Icon("wallet", 21) + "</span>" +
              '<input data-amount type="text" inputmode="decimal" placeholder="Amount*">' +
              '<button class="iconbtn" data-act="pad" style="width:28px;height:28px">' + Icon("calculator", 20) + "</button>" +
            "</div></div>" +
          '<div class="remark-row"><button class="remark-row__plus" data-act="remark">' + Icon("plusBox", 21) + "</button>" +
            "<span>Add remark</span> <small data-remark>*Default: MB transfer</small></div>" +
          '<div data-slot="receiver"></div>' +
          '<button class="btn btn--block" data-act="continue" style="margin-top:18px">Continue</button>' +
          '<div class="tabs mt20">' +
            '<button class="tabs__item is-on" data-tab="recent">Recent Transfers</button>' +
            '<button class="tabs__item" data-tab="benef">Beneficiaries</button>' +
          "</div>" +
        "</div>" +
        '<div class="pad" data-slot="list" style="padding-top:14px"></div>' +
      '</div></div></div>');

    var mode = "account";     // account | phone
    var account = "";
    var amount = "";
    var remark = "";
    var tab = "recent";
    var selected = null;

    el.querySelector('[data-slot="acct"]').textContent = U.maskAccount(Store.get().accountNumber);

    function paintField() {
      el.querySelector('[data-slot="acctfield"]').innerHTML =
        '<div class="input">' +
          '<span class="input__icon">' + Icon("bank", 21) + "</span>" +
          '<input data-account type="tel" inputmode="numeric" autocomplete="off" maxlength="13" ' +
            'placeholder="' + (mode === "account" ? "Account Number" : "Phone Number") + '" value="' + U.esc(account) + '">' +
          '<button class="iconbtn" data-act="mode" style="width:30px;height:30px" aria-label="Switch to ' +
            (mode === "account" ? "phone number" : "account number") + '">' + Icon("userPlus", 20) + "</button>" +
        "</div>";
    }

    function paintReceiver() {
      var slot = el.querySelector('[data-slot="receiver"]');
      if (!selected || !selected.name) { slot.innerHTML = ""; return; }
      slot.innerHTML = '<div class="info-card mt16">' +
        '<div class="info-card__row">' +
          '<span class="avatar avatar--sm avatar--solid">' + Icon("bank", 20) + "</span>" +
          "<span class=grow><span class='info-card__name'>" + U.esc(selected.name) + "</span>" +
          '<div class="info-card__acct">' + U.esc(U.maskShort(selected.account)) + "</div></span>" +
        "</div></div>";
    }

    function paintList() {
      var list = Store.get();
      var rows = tab === "recent" ? (list.receipts || []).slice(0, 8).map(function (r) {
        return { name: r.receiverName, account: r.receiverAccount, receipt: r };
      }) : list.beneficiaries;
      var items = rows.length ? rows : list.beneficiaries;
      el.querySelector('[data-slot="list"]').innerHTML = items.map(function (b) {
        return '<div class="cardlist" style="margin-bottom:10px">' +
          '<div class="rowline" style="border-radius:16px;box-shadow:var(--shadow-tile)">' +
            '<span class="avatar avatar--sm">' + U.esc(U.initials(b.name)) + "</span>" +
            '<span class="rowline__text" data-pick="' + U.esc(b.account) + '" data-name="' + U.esc(b.name) + '">' +
              '<span class="rowline__title">' + U.esc(b.name) + "</span>" +
              '<div class="rowline__sub">' + U.esc(U.maskShort(b.account)) + "</div></span>" +
            '<button class="iconbtn" data-act="del" style="color:var(--ink-3);width:32px;height:32px">' + Icon("trash", 19) + "</button>" +
            '<span class="rowline__chev">' + Icon("chevronRight", 20) + "</span>" +
          "</div></div>";
      }).join("");
    }

    paintField(); paintReceiver(); paintList();

    function readAmount() { return U.cents(amount || 0); }

    el.addEventListener("input", function (e) {
      if (e.target.matches("[data-account]")) {
        account = U.digits(e.target.value).slice(0, 13);
        e.target.value = account;
        selected = account.length ? Object.assign(resolveReceiver(account), { account: account }) : null;
        paintReceiver();
      }
      if (e.target.matches("[data-amount]")) {
        amount = e.target.value.replace(/[^\d.]/g, "");
        e.target.value = amount;
      }
    });

    el.addEventListener("click", function (e) {
      var pick = e.target.closest("[data-pick]");
      if (pick) {
        account = U.digits(pick.dataset.pick);
        selected = { name: pick.dataset.name, account: account, known: true };
        paintField(); paintReceiver();
        return;
      }
      var tb = e.target.closest("[data-tab]");
      if (tb) {
        tab = tb.dataset.tab;
        el.querySelectorAll("[data-tab]").forEach(function (b) { b.classList.toggle("is-on", b === tb); });
        paintList();
        return;
      }
      var act = e.target.closest("[data-act]");
      if (!act) return;
      if (act.dataset.act === "mode") { mode = mode === "account" ? "phone" : "account"; paintField(); return; }
      if (act.dataset.act === "pad") { amountSheet(amount, function (cents) { amount = U.money(cents); el.querySelector("[data-amount]").value = amount; }); return; }
      if (act.dataset.act === "remark") {
        UI.sheet({
          title: "Add remark",
          closeBtn: true,
          body: '<div class="field" style="margin-top:0"><div class="input">' +
            '<input data-r placeholder="MB transfer" value="' + U.esc(remark) + '"></div></div>' +
            '<button class="btn btn--block" data-act="save" style="margin-top:16px">Save remark</button>'
        }).node.addEventListener("click", function (ev) {
          var save = ev.target.closest('[data-act="save"]');
          if (save) {
            var input = save.closest(".sheetmodal").querySelector("[data-r]");
            remark = input.value.trim();
            el.querySelector("[data-remark]").textContent = remark ? "· " + remark : "*Default: MB transfer";
            save.closest(".sheetmodal")._close();
          }
        });
        return;
      }
      if (act.dataset.act === "del") { UI.toast("Beneficiary removed"); return; }
      if (act.dataset.act === "continue") {
        var cents = readAmount();
        var digits = U.digits(account);
        if (!digits) { UI.toast("Enter the account number"); return; }
        if (digits.length !== 13) { UI.toast("Account number must be 13 digits"); return; }
        if (!cents) { UI.toast("Enter the amount"); return; }
        var rec = selected && selected.account === digits ? selected : Object.assign(resolveReceiver(digits), { account: digits });
        if (!rec.name) { UI.toast("Enter a valid account number"); return; }
        Router.push("transferReview", { account: digits, name: rec.name, amount: cents, remark: remark });
        return;
      }
    });

    return { el: el };
  }

  /* ---------------------------------------------------------- review ---- */
  function transferReviewView(params) {
    var el = UI.h('<div class="screen">' +
      UI.appbar({ title: "Transfer" }) +
      '<div class="body"><div class="sheet"><div class="pad" style="padding-top:16px">' +
        '<div class="info-card">' +
          '<div class="info-card__label">Transfer to</div>' +
          '<div class="info-card__row mt12">' +
            '<span class="avatar avatar--sm avatar--solid">' + Icon("bank", 20) + "</span>" +
            "<span><span class='info-card__name' data-slot='name'></span>" +
            '<div class="info-card__acct" data-slot="acct"></div></span>' +
          "</div>" +
        "</div>" +
        '<div class="fromacct mt16">' +
          '<div class="fromacct__label">From Account</div>' +
          '<div class="fromacct__acct">savings <b data-slot="src"></b></div>' +
          '<div class="fromacct__row"><span class="fromacct__dots">••••••</span>' + Icon("eyeOff", 18) + "</div>" +
        "</div>" +
        '<div class="field mt16"><label class="field__label">Amount*</label>' +
          '<div class="input"><span class="input__icon">' + Icon("wallet", 21) + "</span>" +
            '<input data-amount type="text" inputmode="decimal" value="' + U.money(params.amount) + '">' +
            '<button class="iconbtn" data-act="pad" style="width:28px;height:28px">' + Icon("calculator", 20) + "</button>" +
          "</div>" +
          '<div class="hint" data-fees></div>' +
        "</div>" +
        '<div class="remark-row"><button class="remark-row__plus">' + Icon("plusBox", 21) + "</button>" +
          "<span>Add remark</span> <small>" + U.esc(params.remark ? "· " + params.remark : "*Default: MB transfer") + "</small></div>" +
        '<button class="btn btn--block" data-act="transfer" style="margin-top:20px">Transfer</button>' +
      "</div></div></div></div>");

    var amount = params.amount;
    el.querySelector('[data-slot="name"]').textContent = params.name;
    el.querySelector('[data-slot="acct"]').textContent = U.maskShort(params.account);
    el.querySelector('[data-slot="src"]').textContent = U.maskAccount(Store.get().accountNumber);

    function paintFees() {
      var f = Fees.compute(amount, "mb");
      el.querySelector("[data-fees]").innerHTML =
        "Service charge " + U.money(f.service) + " ETB · VAT " + U.money(f.vat) +
        " ETB · Total debit <b>" + U.money(f.total) + " ETB</b>";
    }
    paintFees();

    el.addEventListener("input", function (e) {
      if (e.target.matches("[data-amount]")) {
        var v = parseFloat(e.target.value.replace(/[^\d.]/g, "") || "0");
        amount = U.cents(v || 0);
        paintFees();
      }
    });

    el.addEventListener("click", function (e) {
      var act = e.target.closest("[data-act]");
      if (!act) return;
      if (act.dataset.act === "pad") {
        amountSheet(U.money(amount), function (cents) {
          amount = cents;
          el.querySelector("[data-amount]").value = U.money(cents);
          paintFees();
        });
        return;
      }
      if (act.dataset.act === "transfer") {
        if (!amount) { UI.toast("Enter the amount"); return; }
        if (Fees.compute(amount, "mb").total > Store.get().balance) { UI.toast("Insufficient balance"); return; }
        Flow.pay({
          amount: amount, receiverName: params.name, receiverAccount: params.account,
          channel: "mb", label: "CBE Transfer"
        }).catch(function () { });
      }
    });

    return { el: el };
  }

  window.Flow = Flow;
  Router.define("transfer", transferView);
  Router.define("transferReview", transferReviewView);
})();
