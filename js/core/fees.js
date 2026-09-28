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

  /* payload encoded into every receipt QR code: a deep link back into the
     app itself.  Scanning it with any phone camera opens the deployed app,
     which rebuilds the full detailed statement straight from the data packed
     in the code — no login, no network, no backend.  v1 fields, pipe
     separated: r=v1|<id>|<unix-ms>|<amount>|<service>|<vat>|<drrf>|<total>|
     <sender>|<senderLast4>|<receiver>|<receiverLast4>|<reason>.  Names and
     reason are URI-encoded; money values are decimal strings of birr. */
  function qrLinkBase() {
    if (location.protocol === "http:" || location.protocol === "https:")
      return location.origin + location.pathname.replace(/[^/]*$/, "");
    /* opened from disk during development: the QR still points at the live app */
    return "https://m1616d.github.io/Mobile-banking/";
  }
  function qrName(s) {
    return encodeURIComponent(String(s || "").slice(0, 60));
  }
  function qrPayload(tx) {
    var f = tx.fees;
    var fields = [
      "v1", tx.id, new Date(tx.date).getTime(),
      U.money(f.amount), U.money(f.service), U.money(f.vat), U.money(f.drrf), U.money(f.total),
      qrName(tx.senderName), tx.senderLast4 || "",
      qrName(tx.receiverName), tx.receiverLast4 || "",
      qrName(tx.reason || "MB Transfer")
    ];
    return qrLinkBase() + "#r=" + fields.join("|");
  }
  /* the decoder half: rebuild a tx object from the payload a QR carries
     (passed without the leading "#").  Returns null for anything that is not
     a well-formed v1 receipt link, so a foreign QR can never fabricate one. */
  function txFromQr(payload) {
    var s = String(payload || "");
    if (!/^r=v1\|/.test(s)) return null;
    /* keep "v1" in the split: f[0] is the format version, f[1] the id, ... */
    var f = s.slice(2).split("|");
    if (f.length < 13) return null;
    function birr(v) { var n = parseFloat(v); return isFinite(n) ? Math.round(n * 100) : 0; }
    function dec(s2) { try { return decodeURIComponent(s2); } catch (e) { return s2; } }
    var date = parseInt(f[2], 10);
    var id = String(f[1] || "").slice(0, 40);
    if (!id || !isFinite(date)) return null;
    return {
      id: id,
      date: date,
      senderName: dec(f[8]), senderLast4: String(f[9] || "").slice(0, 4),
      receiverName: dec(f[10]), receiverLast4: String(f[11] || "").slice(0, 4),
      reason: dec(f[12]) || "MB Transfer",
      scanned: true,
      fees: {
        amount: birr(f[3]), service: birr(f[4]),
        vat: birr(f[5]), drrf: birr(f[6]), total: birr(f[7])
      }
    };
  }

  global.Fees = {
    compute: compute, serviceCharge: serviceCharge, inWords: inWords,
    summaryText: summaryText, summaryHtml: summaryHtml, qrPayload: qrPayload,
    txFromQr: txFromQr,
    CHANNELS: CHANNELS, VAT_RATE: VAT_RATE, DRRF_RATE: DRRF_RATE, TIERS: TIERS
  };
})(window);
