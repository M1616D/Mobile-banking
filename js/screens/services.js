/* =========================================================================
   services.js — every category screen driven by Brands.CATALOG
   ========================================================================= */
(function () {
  "use strict";

  function catalogKey(params) { return params.key; }

  function titleFor(key) {
    var c = Brands.CATALOG[key];
    return (c && c.title) || "Services";
  }

  /* ------------------------------------------------------------- grid ---- */
  function catalogView(params) {
    var key = catalogKey(params);
    var cat = Brands.CATALOG[key] || {};
    var el = UI.h('<div class="screen">' +
      UI.appbar({ title: cat.title || "Services", search: !!cat.search }) +
      '<div class="body"><div class="sheet"><div data-slot="content"></div></div></div>' +
      (cat.nav === false ? "" : UI.bottomNav("home")) +
    "</div>");
    var host = el.querySelector('[data-slot="content"]');

    function paint() {
      if (cat.kind === "form") { paintForm(); return; }
      if (cat.kind === "merchant") { paintMerchant(); return; }
      if (cat.kind === "toll") { paintToll(); return; }
      if (cat.kind === "oservices") { paintOServices(); return; }
      if (cat.dynamic === "beneficiaries") { paintBeneficiaries(); return; }
      if (cat.kind === "rows") {
        host.innerHTML = '<div class="cardlist pad" style="padding-top:16px">' +
          (cat.items || []).map(function (i) { return UI.row(i); }).join("") + "</div>";
        return;
      }
      host.innerHTML = '<div class="svc-grid grid2" style="padding-top:16px">' +
        (cat.items || []).map(function (i) { return UI.tile(i); }).join("") + "</div>";
    }

    function paintBeneficiaries() {
      var list = Store.get().beneficiaries || [];
      host.innerHTML = '<div class="cardlist pad" style="padding-top:16px">' +
        list.map(function (b) {
          return UI.row({ label: b.name, sub: U.maskShort(b.account), img: "img/cbe-logo.png" });
        }).join("") + "</div>";
    }

    /* --------------------------------------------------- generic form --- */
    function paintForm() {
      host.innerHTML = '<div class="pad" style="padding-top:16px">' +
        (cat.fields || []).map(function (f) { return UI.field(f); }).join("") +
        '<button class="btn btn--block" data-act="submit" style="margin-top:24px">' +
        U.esc(cat.continueLabel || "Continue") + "</button>" +
        '<div class="form-note">' + (cat.note || "") + "</div>" +
      "</div>";
    }

    /* ------------------------------------------------------ merchant ---- */
    function paintMerchant() {
      host.innerHTML = '<div class="pad" style="padding-top:16px">' +
        '<div class="segmented" data-seg>' +
          '<button class="segmented__item is-on" data-mode="customer">Customer initiated</button>' +
          '<button class="segmented__item" data-mode="dynamic">Dynamic ID</button>' +
        "</div>" +
        '<div data-slot="mfields"></div>' +
        '<button class="btn btn--block" data-act="submit" style="margin-top:24px">Continue</button>' +
      "</div>" +
      '<button class="scan-fab" style="bottom:22px" data-act="scanqr">' + Icon("qrScan", 22) + "</button>";
      paintMerchantFields("customer");
    }

    function paintMerchantFields(mode) {
      var slot = host.querySelector('[data-slot="mfields"]');
      if (!slot) return;
      slot.innerHTML = mode === "customer"
        ? UI.field({ label: "", icon: "list", key: "merchant", placeholder: "Merchant code*" }) +
          UI.field({ label: "", icon: "list", key: "operator", placeholder: "Operator code" })
        : UI.field({ label: "", icon: "list", key: "dynamic", placeholder: "Dynamic ID*" });
    }

    /* ---------------------------------------------------------- toll ---- */
    function paintToll() {
      host.innerHTML = '<div class="pad" style="padding-top:24px">' +
        '<div class="empty" style="padding-top:10px">' +
          '<div class="empty__icon" style="border-radius:22px;width:74px;height:74px">' + Icon("car", 34) + "</div>" +
          '<div class="empty__title">No Vehicle Registered</div>' +
          '<p class="empty__text">Register your vehicle for Toll Road / ETC to view its wallet, recharge balance, and track toll usage.</p>' +
        "</div>" +
        '<button class="btn btn--grad btn--block" data-act="addveh">Add a New Vehicle</button>' +
        '<button class="btn btn--ghost btn--block" data-act="scanqr" style="margin-top:14px">' +
          Icon("qr", 20) + " Scan QR Code</button>" +
      "</div>";
    }

    /* -------------------------------------------------- other services --
       Every entry is a real, touchable button: the ones with a target open
       their screen, the rest raise the generic error toast rather than sit
       there dead or claim everything is "Coming Soon". */
    function paintOServices() {
      host.innerHTML = '<div class="pad" style="padding-top:16px">' +
        '<div class="grid2">' + (cat.items || []).map(function (i) {
          var icon = i.img
            ? '<img src="' + U.esc(i.img) + '" style="width:26px;height:26px;object-fit:contain">'
            : Icon(i.icon || "list", 24);
          return '<button class="tile tile--left" style="min-height:56px;padding:12px 14px;gap:12px' +
            (i.wide ? ";grid-column:1 / -1" : "") + '" data-os="' + U.esc(i.to || "") + '"' +
            ' data-label="' + U.esc(i.label) + '">' +
            '<span style="color:var(--purple);flex:0 0 auto">' + icon + "</span>" +
            '<span class="tile__label">' + U.esc(i.label).replace(/\n/g, "<br>") + "</span></button>";
        }).join("") + "</div></div>";
    }

    paint();

    el.addEventListener("click", function (e) {
      var seg = e.target.closest("[data-mode]");
      if (seg) {
        host.querySelectorAll("[data-mode]").forEach(function (b) { b.classList.toggle("is-on", b === seg); });
        paintMerchantFields(seg.dataset.mode);
        host.dataset.mode = seg.dataset.mode;
        return;
      }
      var os = e.target.closest("[data-os]");
      if (os) {
        if (os.dataset.os) Router.push(os.dataset.os);
        else UI.toast("Something went wrong, try again later.");
        return;
      }
      var tile = e.target.closest("[data-to]");
      if (tile) { openTarget(tile.dataset.to, { label: tile.dataset.label }); return; }
      var rowBtn = e.target.closest("[data-to]");
      var act = e.target.closest("[data-act]");
      if (act) {
        var a = act.dataset.act;
        if (a === "scanqr") { Router.push("scan"); return; }
        if (a === "addveh") {
          UI.sheet({
            title: "Add a New Vehicle",
            closeBtn: true,
            body: '<div class="field" style="margin-top:0"><div class="input">' +
              '<input data-plate placeholder="Plate number"></div></div>' +
              '<div class="field"><div class="input"><input data-etc placeholder="ETC tag / wallet ID"></div></div>' +
              '<button class="btn btn--block" data-act="save" style="margin-top:18px">Save vehicle</button>'
          }).node.addEventListener("click", function (ev) {
            if (ev.target.closest('[data-act="save"]')) {
              ev.target.closest(".sheetmodal")._close();
              UI.toast("Vehicle registered");
            }
          });
          return;
        }
        if (a === "submit") { submitForm(act.closest(".screen")); return; }
      }
      var seg2 = e.target.closest("[data-seg]");
      if (seg2) return;
    });

    /* the search icon in the app bar opens menu search */
    el.addEventListener("click", function (e) {
      if (e.target.closest('[data-act="search"]')) Router.push("search");
    });

    function openTarget(to, extra) {
      if (!to) return;
      var cat2 = Brands.CATALOG[to];
      if (cat2) { Router.push("catalog", { key: to, label: extra.label }); return; }
      if (to === "transfer") { Router.push("transfer"); return; }
      if (to === "receive") { Router.push("receive"); return; }
      if (to === "cards") { Router.push("cards"); return; }
      Router.push(to, extra);
    }

    function splitFields() {
      var out = {};
      host.querySelectorAll(".input input, .selectbtn").forEach(function (n) {
        var key = n.dataset.key || n.dataset.select;
        if (!key) return;
        var v = n.tagName === "BUTTON" ? (n.dataset.value || "") : n.value;
        out[key] = v;
      });
      return out;
    }

    function submitForm(root) {
      root = root || el;
      var values = {};
      root.querySelectorAll(".input input, .selectbtn").forEach(function (n) {
        var key = n.dataset.key || n.dataset.select;
        if (!key) return;
        values[key] = n.tagName === "BUTTON" ? (n.dataset.value || "") : (n.value || "").trim();
      });
      if (cat.kind === "form") {
        var required = (cat.fields || []).filter(function (f) { return f.required !== false; });
        for (var i = 0; i < required.length; i++) {
          if (!values[required[i].key]) { UI.toast("Enter " + (required[i].label || "the field")); return; }
        }
      }
      if (cat.kind === "merchant") {
        var mode = host.dataset.mode || "customer";
        if (mode === "dynamic" && !values.dynamic) { UI.toast("Enter the Dynamic ID"); return; }
        if (mode === "customer" && !values.merchant) { UI.toast("Enter the merchant code"); return; }
      }

      /* Account Validation: bank + account, then the amount, then the receipt.
         Microfinance uses the exact same intermediate step (choose from the
         list, enter the account) before the transfer is confirmed. */
      if (key === "otherBank" || key === "microfinance") {
        var bank = values.bankName || "";
        var acct = U.digits(values.account || "");
        if (!bank) { UI.toast(key === "microfinance" ? "Select the microfinance" : "Select the bank"); return; }
        if (acct.length < 5) { UI.toast("Enter a valid account number"); return; }
        var rec = Flow.resolveReceiver(acct);
        Flow.amountSheet("", function (cents) {
          Flow.pay({
            amount: cents,
            receiverName: rec.name || Store.get().receiverName,
            receiverAccount: acct,
            channel: key === "otherBank" ? "otherbank" : "mb",
            label: bank
          }).catch(function () { });
        });
        return;
      }
      var isTollLike = cat.kind === "toll";
      var label = (params.label && params.label !== "undefined") ? params.label : (cat.title || "Payment");
      var reference = values.account || values.dynamic || values.merchant || values.operator || "";

      // account validation and wallet style screens capture an amount next
      Flow.amountSheet("", function (cents) {
        Flow.pay({
          amount: cents,
          receiverName: label,
          receiverAccount: U.digits(reference) || Store.get().accountNumber,
          channel: cat.channel || "mb",
          label: label
        }).catch(function () { });
      });
    }

    /* select fields open a sheet; the bank picker adds search + brand marks */
    el.addEventListener("click", function (e) {
      var sel = e.target.closest("[data-select]");
      if (!sel) return;
      var key = sel.dataset.select;
      var field = (cat.fields || []).filter(function (f) { return (f.key || "value") === key; })[0];
      if (!field || !field.options) return;
      UI.selectSheet(field.label || "Select", field.options, function (val) {
        sel.dataset.value = val;
        var label = sel.querySelector(".grow");
        label.textContent = val;
        label.style.color = "var(--ink)";
      }, field.picker ? { placeholder: "Search...", noClose: false } : {});
    });

    return { el: el };
  }

  /* -------------------------------------------------------- coming soon -- */
  function comingView(params) {
    params = params || {};
    var el = UI.h('<div class="screen">' +
      UI.appbar({ title: params.title || "Coming Soon" }) +
      '<div class="body"><div class="sheet">' +
        '<div class="empty" style="padding-top:80px">' +
          '<div class="empty__icon">' + Icon("rocket", 40) + "</div>" +
          '<div class="empty__title">Coming Soon</div>' +
          '<p class="empty__text">' + U.esc(params.body || "We are working hard to bring you this feature. Stay tuned!") + "</p>" +
          '<button class="btn btn--sm" data-act="back" style="margin-top:10px">Go Back</button>' +
        "</div>" +
      "</div></div></div>");
    return { el: el };
  }

  /* ------------------------------------------------------- withdrawals --- */
  function withdrawalsView() {
    var el = UI.h('<div class="screen">' +
      UI.appbar({
        title: "Withdrawal History",
        actions: '<button class="iconbtn" data-act="refresh" aria-label="Refresh">' + Icon("refresh", 21) + "</button>"
      }) +
      '<div class="body"><div class="sheet"><div class="pad" style="padding-top:60px">' +
        '<div class="empty">' +
          '<div class="empty__icon" style="background:transparent;width:auto;height:auto;color:var(--purple-300)">' +
            Icon("ticket", 96) + "</div>" +
          '<div class="empty__title">No withdrawal requests found yet.</div>' +
          '<p class="empty__text">When you initiate a withdrawal, it will show up here.</p>' +
        "</div>" +
        '<div class="btn-row" style="margin-top:10px">' +
          '<button class="btn" data-act="new">' + Icon("plus", 18) + " New Withdrawal</button>" +
          '<button class="btn" data-act="refresh">' + Icon("refresh", 18) + " Refresh History</button>" +
        "</div>" +
      "</div></div></div></div>");
    el.addEventListener("click", function (e) {
      if (e.target.closest('[data-act="refresh"]')) { UI.toast("No withdrawal requests found yet."); return; }
      if (e.target.closest('[data-act="new"]')) {
        UI.sheet({
          title: "New Withdrawal",
          closeBtn: true,
          body: '<div class="field" style="margin-top:0"><div class="input">' +
            '<input data-amt inputmode="decimal" placeholder="Amount"></div></div>' +
            '<button class="btn btn--block" data-act="go" style="margin-top:16px">Request withdrawal</button>'
        }).node.addEventListener("click", function (ev) {
          if (ev.target.closest('[data-act="go"]')) {
            ev.target.closest(".sheetmodal")._close();
            UI.toast("Withdrawal request submitted");
          }
        });
      }
    });
    return { el: el };
  }

  /* ------------------------------------------------------------ cards ---- */
  function cardsView() {
    var s = Store.get();
    var tab = "issued";
    var el = UI.h('<div class="screen">' +
      UI.appbar({ title: "Account Cards" }) +
      '<div class="body"><div class="sheet"><div class="pad" style="padding-top:16px">' +
        '<div class="tabs tabs--pill">' +
          '<button class="tabs__item is-on" data-tab="issued">Issued</button>' +
          '<button class="tabs__item" data-tab="requested">Requested</button>' +
          '<button class="tabs__item" data-tab="request">Request</button>' +
        "</div>" +
        '<div data-slot="panel" style="padding-top:18px"></div>' +
      "</div></div></div></div>");

    function paint() {
      var panel = el.querySelector('[data-slot="panel"]');
      if (tab === "request") {
        panel.innerHTML = '<div class="empty" style="padding-top:20px">' +
          '<div class="empty__icon">' + Icon("card", 40) + "</div>" +
          '<div class="empty__title">Request a card</div>' +
          '<p class="empty__text">Order a new debit card and collect it from your nearest CBE branch.</p>' +
          '<button class="btn" data-act="req" style="margin-top:10px">Request new card</button></div>';
        return;
      }
      var issued = tab === "issued";
      panel.innerHTML =
        (issued ?
          '<div class="bank-card">' +
            '<div class="bank-card__brand"><img src="img/cbe-logo.png" alt="">' +
              "<span><div class='bank-card__name'>Commercial Bank of Ethiopia</div>" +
              "<div class='bank-card__tag'>The bank you can always rely on!</div></span>" +
              '<span style="margin-left:auto">' + Icon("contactless", 22) + "</span>" +
            "</div>" +
            '<div class="bank-card__mid"><span class="bank-card__chip"></span></div>' +
            '<div class="bank-card__pan">' + U.esc(s.cards[0] ? s.cards[0].pan : "4583 00** **** 4314") + "</div>" +
            '<div class="bank-card__foot">' +
              '<span class="bank-card__exp">' + U.esc(s.cards[0] ? s.cards[0].exp : "30 DEC 2030") + "</span>" +
              '<span class="bank-card__holder">' + U.esc(s.holderName.toUpperCase()) + "</span>" +
            "</div>" +
          "</div>" +
          '<div class="card-row"><span class="rowline__icon">' + Icon("card", 21) + "</span>" +
            '<span class="grow"><span class="rowline__title">' + U.esc(U.maskShort(s.accountNumber)) + "</span></span>" +
            '<span class="chip">1 Card(s)</span></div>'
          :
          '<div class="empty" style="padding-top:20px">' +
            '<div class="empty__icon">' + Icon("card", 40) + "</div>" +
            '<div class="empty__title">No requested cards</div>' +
            '<p class="empty__text">Cards you request will appear here while they are being printed.</p></div>');
    }
    paint();

    el.addEventListener("click", function (e) {
      var tb = e.target.closest("[data-tab]");
      if (tb) {
        tab = tb.dataset.tab;
        el.querySelectorAll("[data-tab]").forEach(function (b) { b.classList.toggle("is-on", b === tb); });
        paint();
        return;
      }
      if (e.target.closest('[data-act="req"]')) {
        UI.toast("Card request submitted");
        tab = "requested";
        el.querySelectorAll("[data-tab]").forEach(function (b) { b.classList.toggle("is-on", b.dataset.tab === "requested"); });
        paint();
      }
    });
    return { el: el };
  }

  /* ------------------------------------------------------------- loans --- */
  function loanView() {
    var el = UI.h('<div class="screen">' +
      UI.appbar({ title: "Loan Products", light: true, center: true }) +
      '<div class="body"><div class="sheet"><div class="pad" style="padding-top:10px">' +
        '<div class="loan-hero">' +
          '<div class="loan-hero__badge">' + Icon("bankSolid", 24) + "</div>" +
          '<div class="loan-hero__title">Choose Your Loan</div>' +
          '<div class="loan-hero__text">Select the financial product that best fits your current needs.</div>' +
        "</div>" +
        '<div class="section-title">Available Products</div>' +
        '<div class="loan-card" data-card="fast">' +
          '<div class="loan-card__head">' +
            '<span class="loan-card__icon">' + Icon("dollarCircle", 22) + "</span>" +
            '<span class="grow"><span class="loan-card__title">Fast Loan</span>' +
              '<div class="loan-card__sub">Finds the best term loan for your needs.</div></span>' +
            '<span class="loan-card__chev">' + Icon("chevronDown", 20) + "</span>" +
          "</div>" +
          '<div class="loan-card__body hide">' +
            '<div class="loan-card__limit">You have a pre-approved limit from 300 upto 50,000 ETB</div>' +
            '<ul class="loan-list">' +
              "<li>" + Icon("checkCircle", 18) + "<span>No waiting, no hassle. Get the money you need quickly and easily</span></li>" +
              "<li>" + Icon("checkCircle", 18) + "<span>Tap into your pre-approved funds and make your goals a reality today</span></li>" +
              "<li>" + Icon("checkCircle", 18) + "<span>No more guessing games. You're already approved</span></li>" +
            "</ul>" +
            '<div class="loan-card__actions">' +
              '<button class="btn btn--ghost" data-act="know">Know More</button>' +
              '<button class="btn" data-act="apply" data-product="Fast Loan">Apply Now</button>' +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="loan-card" data-card="revolving">' +
          '<div class="loan-card__head">' +
            '<span class="loan-card__icon">' + Icon("card", 22) + "</span>" +
            '<span class="grow"><span class="loan-card__title">Fast Revolving ' +
              '<span class="chip">Coming Soon</span></span>' +
              '<div class="loan-card__sub">Top up your account instantly with a OD</div></span>' +
            '<span class="loan-card__chev">' + Icon("chevronDown", 20) + "</span>" +
          "</div>" +
          '<div class="loan-card__body hide">' +
            '<div class="loan-card__limit">Access funds as you need them with an overdraft limit</div>' +
            '<ul class="loan-list">' +
              "<li>" + Icon("checkCircle", 18) + "<span>Utilize your overdraft limit to accomplish your aspirations without delay.</span></li>" +
              "<li>" + Icon("checkCircle", 18) + "<span>Instant access to funds whenever you need them, without delay</span></li>" +
              "<li>" + Icon("checkCircle", 18) + "<span>Pay and draw as needed</span></li>" +
              "<li>" + Icon("checkCircle", 18) + "<span>Say goodbye to uncertainty - your overdraft limit is here for you</span></li>" +
            "</ul>" +
            '<div class="loan-card__actions">' +
              '<button class="btn btn--ghost" data-act="know">Know More</button>' +
              '<button class="btn" data-act="apply" data-product="Fast Revolving OD">Activate OD</button>' +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div></div></div></div>");

    el.addEventListener("click", function (e) {
      var head = e.target.closest(".loan-card__head");
      if (head) {
        var card = head.closest(".loan-card");
        var body = card.querySelector(".loan-card__body");
        body.classList.toggle("hide");
        card.classList.toggle("is-open");
        return;
      }
      var act = e.target.closest("[data-act]");
      if (!act) return;
      if (act.dataset.act === "know") { UI.toast("A CBE advisor will contact you shortly"); return; }
      if (act.dataset.act === "apply") {
        var name = act.dataset.product;
        UI.sheet({
          title: name,
          closeBtn: true,
          body: '<div class="field" style="margin-top:0"><label class="field__label">Loan amount</label>' +
            '<div class="input"><input data-amt inputmode="decimal" placeholder="Enter amount"></div></div>' +
            '<div class="field"><label class="field__label">Repayment period</label>' +
            '<div class="input selectbtn" data-select="term"><span class="grow">Select from the list</span>' +
            Icon("chevronDown", 20) + "</div></div>" +
            '<button class="btn btn--block" data-act="send" style="margin-top:18px">Submit application</button>'
        }).node.addEventListener("click", function (ev) {
          var sel = ev.target.closest('[data-select="term"]');
          if (sel) {
            UI.selectSheet("Repayment period", ["3 months", "6 months", "12 months", "24 months"], function (v) {
              sel.querySelector(".grow").textContent = v;
            });
            return;
          }
          if (ev.target.closest('[data-act="send"]')) {
            ev.target.closest(".sheetmodal")._close();
            UI.toast("Application submitted");
          }
        });
      }
    });
    return { el: el };
  }

  /* -------------------------------------------------------- static text -- */
  function textPage(title, paragraphs) {
    return function () {
      var el = UI.h('<div class="screen">' +
        UI.appbar({ title: title }) +
        '<div class="body"><div class="sheet"><div class="pad" style="padding:18px 16px 40px">' +
          paragraphs.map(function (p) {
            return '<h3 style="font-size:16.5px;padding:14px 0 6px">' + U.esc(p[0]) + "</h3>" +
              '<p style="font-size:14.5px;line-height:1.6;color:var(--ink-3)">' + U.esc(p[1]) + "</p>";
          }).join("") +
        "</div></div></div></div>");
      return { el: el };
    };
  }

  Router.define("catalog", catalogView);
  /* the login screen's "Other Services" grid opens the same catalogue view */
  Router.define("otherServices", function () { return catalogView({ key: "otherServices", title: "Other Services" }); });
  Router.define("coming", comingView);
  Router.define("withdrawals", withdrawalsView);
  Router.define("scheduled", function () {
    return comingView({
      title: "Scheduled Payments",
      body: "We are working hard to bring you the Scheduled Payments feature. Stay tuned!"
    });
  });
  Router.define("cards", cardsView);
  Router.define("loan", loanView);
  Router.define("privacy", textPage("Privacy Policy", [
    ["Your data stays on your device", "The Mobile Banking App keeps your configuration, balance and receipts in local storage on this device. Nothing is uploaded anywhere by this build."],
    ["What we store", "Your account holder name, account number, balance, PIN and transfer receipts are stored locally so the app works with no network connection."],
    ["Your control", "Logging out or clearing the app data removes everything that was stored."]
  ]));
  Router.define("terms", textPage("Terms and Tariffs", [
    ["Transfers", "A service charge applies to every transfer and is calculated from the amount you send. VAT of 15% and the Disaster Risk Response Fund contribution of 5% are charged on the service charge."],
    ["Service charge bands", "0.01 – 1,000 ETB: 0.50 · 1,000.01 – 2,000: 1.00 · 2,000.01 – 3,000: 1.50 · 3,000.01 – 4,000: 2.00 · 4,000.01 – 5,000: 2.50 · 5,000.01 – 10,000: 5.00 · 10,000.01 – 25,000: 10.00 · 25,000.01 – 50,000: 15.00 · above 50,000: 20.00"],
    ["Receipts", "Every completed transfer produces a receipt showing the transferred amount, service charge, VAT, disaster recovery contribution and the total debited from your account."]
  ]));
})();
