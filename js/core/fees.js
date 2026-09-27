/* =========================================================================
   fees.js — the money engine.
   Every figure shown on the confirm sheet, the receipt and the balance is
   derived here so the numbers can never disagree with each other.

   CBE mobile-banking transfer tariff (service charge by amount band), plus
     VAT        = 15 % of the service charge
     DRRF       =  5 % of the service charge  (Disaster Risk Response Fund)
     Total debit= amount + service charge + VAT + DRRF
   All maths is done in integer cents; levy rounding is half-up, which is what
   the reference receipts show (0.50 service -> 0.08 VAT / 0.03 DRRF).
   ========================================================================= */
(function (global) {
  "use strict";

  var TIERS = [
    { upTo: 100000, fee: 50 },        // 0.01 – 1,000.00        -> 0.50
    { upTo: 200000, fee: 100 },       // 1,000.01 – 2,000.00    -> 1.00
    { upTo: 300000, fee: 150 },       // 2,000.01 – 3,000.00    -> 1.50
    { upTo: 400000, fee: 200 },       // 3,000.01 – 4,000.00    -> 2.00
    { upTo: 500000, fee: 250 },       // 4,000.01 – 5,000.00    -> 2.50
    { upTo: 1000000, fee: 500 },      // 5,000.01 – 10,000.00   -> 5.00
    { upTo: 2500000, fee: 1000 },     // 10,000.01 – 25,000.00  -> 10.00
    { upTo: 5000000, fee: 1500 },     // 25,000.01 – 50,000.00  -> 15.00
    { upTo: Infinity, fee: 2000 }     // above 50,000.00        -> 20.00
  ];
  var VAT_RATE = 0.15;
  var DRRF_RATE = 0.05;
  var FREE_UPTO = 100;                // amounts up to 1.00 ETB are not charged

  function halfUp(v) { return Math.floor(v + 0.5); }

  function serviceCharge(amountCents) {
    if (amountCents <= 0) return 0;
    if (amountCents <= FREE_UPTO) return 0;
    for (var i = 0; i < TIERS.length; i++) if (amountCents <= TIERS[i].upTo) return TIERS[i].fee;
    return TIERS[TIERS.length - 1].fee;
  }

  /* channel labels only — every channel is charged the same published tariff
     table so a receipt reads the same whichever route the money took. */
  var CHANNELS = {
    mb: { label: "MB Transfer", reason: "MB Transfer", surcharge: 0 },
    cbebirr: { label: "CBEBirr Transfer", reason: "CBEBirr Transfer", surcharge: 0 },
    otherbank: { label: "Other Bank Transfer", reason: "Other Bank Transfer", surcharge: 0 },
    wallet: { label: "Wallet Transfer", reason: "Wallet Transfer", surcharge: 0 },
    merchant: { label: "Merchant Payment", reason: "Merchant Payment", surcharge: 0 },
    bill: { label: "Bill Payment", reason: "BILL PAYMENT", surcharge: 0 },
    airtime: { label: "Airtime Top-up", reason: "AIRTIME", surcharge: 0 },
    tax: { label: "Tax Payment", reason: "TAX PAYMENT", surcharge: 0 },
    loan: { label: "Loan Repayment", reason: "LOAN REPAYMENT", surcharge: 0 }
  };

  function compute(amountCents, channelKey) {
    amountCents = Math.max(0, Math.round(amountCents || 0));
    var ch = CHANNELS[channelKey] || CHANNELS.mb;
    var service = serviceCharge(amountCents) + (amountCents > 0 ? ch.surcharge : 0);
    var vat = halfUp(service * VAT_RATE);
    var drrf = halfUp(service * DRRF_RATE);
    var total = amountCents + service + vat + drrf;
    return {
      amount: amountCents,
      service: service,
      vat: vat,
      drrf: drrf,
      total: total,
      channel: ch,
      reason: ch.reason
    };
  }

  /* "Five Hundred Forty Six ETB and Sixty One cents" */
  function inWords(amountCents) {
    var n = Math.max(0, Math.round(amountCents || 0));
    var whole = Math.floor(n / 100), cents = n % 100;
    var head = U.words(whole) + " ETB";
    if (cents === 0) return head;
    return head + " and " + U.words(cents) + (cents === 1 ? " cent" : " cents");
  }

  /* the sentence used on the success receipt, verbatim from the reference */
  function summaryText(tx) {
    var f = tx.fees;
    return "ETB " + U.money(f.amount) +
      " has been debited from " + tx.senderName + " ETB-" + tx.senderLast4 +
      " for " + tx.receiverName + " ETB-" + tx.receiverLast4 +
      " on " + U.receiptDate(new Date(tx.date)) +
      " with transaction ID: " + tx.id + ". Reason: " + (tx.reason || "MB Transfer") +
      " Total Amount Debited: " + U.etb(f.total) +
      " with Service Charge of " + U.etb(f.service) +
      ", VAT (15%) of " + U.etb(f.vat) +
      " and Disaster Recovery (5%) of " + U.etb(f.drrf) + ".";
  }

  /* Bolds the same fragments the reference screenshot emphasises. */
  function summaryHtml(tx) {
    var f = tx.fees;
    return "ETB " + U.money(f.amount) + " has been debited from <b>" + U.esc(tx.senderName) +
      "</b> <b>ETB-" + U.esc(tx.senderLast4) + "</b> for <b>" + U.esc(tx.receiverName) +
      "</b> <b>ETB-" + U.esc(tx.receiverLast4) + "</b> on <b>" +
      U.receiptDate(new Date(tx.date)) + "</b> with transaction ID: <b>" + U.esc(tx.id) +
      ".</b> Reason: " + U.esc(tx.reason || "MB Transfer") +
      " Total Amount Debited: " + U.etb(f.total) +
      " with Service Charge of " + U.etb(f.service) +
      ", VAT (15%) of " + U.etb(f.vat) +
      " and Disaster Recovery (5%) of " + U.etb(f.drrf) + ".";
  }

  /* payload encoded into every receipt QR code.
     It stays under 41 bytes on purpose: that keeps the symbol a 29 module
     (version 3) code at ECC M — the same grid, scale and quiet zone as the
     printed reference receipt — while still carrying the receipt's identity
     (reference number, date, amount, total debited).  The statement page still
     spells out every field in full. */
  var QMON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function qrDate(d) {
    return U.pad(d.getDate()) + "-" + QMON[d.getMonth()] + "-" + String(d.getFullYear()).slice(2);
  }
  function qrPayload(tx) {
    var f = tx.fees;
    return [
      "CBE", tx.id, qrDate(new Date(tx.date)),
      U.money(f.amount), U.money(f.total)
    ].join("|");
  }

  global.Fees = {
    compute: compute, serviceCharge: serviceCharge, inWords: inWords,
    summaryText: summaryText, summaryHtml: summaryHtml, qrPayload: qrPayload,
    CHANNELS: CHANNELS, VAT_RATE: VAT_RATE, DRRF_RATE: DRRF_RATE, TIERS: TIERS
  };
})(window);
