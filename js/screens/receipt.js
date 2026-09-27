/* =========================================================================
   receipt.js — the two receipt replicas plus PDF export and verification.
   Layout numbers come straight from ui/recite/*.png (720x1600 native = 360x800
   CSS px): purple header 145px, 92px check circle, summary card inset 18px,
   statement paper 280px wide on the 360px design width.
   ========================================================================= */
(function () {
  "use strict";

  function bank() {
    return {
      name: "Commercial Bank of Ethiopia",
      address: [
        ["Country:", "Ethiopia"],
        ["City:", "Addis Ababa"],
        ["Address:", "Ras Desta Damtew St, 01, Kirkos"],
        ["Postal code:", "255"],
        ["SWIFT Code:", "CBETETAA"],
        ["Email:", "info@cbe.com.et"],
        ["Tel:", "+251-551-50-04"],
        ["Fax:", "+251-551-45-22"],
        ["Tin:", "0000006966"],
        ["VAT Receipt No:", ""],
        ["VAT Registration No:", "01140"],
        ["VAT Registration Date:", "01/01/2003"]
      ]
    };
  }

  /* ------------------------------------------------------- success view -- */
  function receiptView(params) {
    var tx = params.tx;
    var f = tx.fees;
    var s = Store.get();
    var el = UI.h('<div class="screen">' +
      '<div class="body receipt" data-scroll>' +
        '<div class="receipt__head">' +
          '<span class="receipt__shield">' + Icon("shieldCheckSolid", 30) + "</span>" +
          '<div class="receipt__head-txt">' +
            '<div class="receipt__head-title">Thank you</div>' +
            '<div class="receipt__head-sub">Success</div>' +
          "</div>" +
          '<button class="iconbtn receipt__head-act" data-act="screenshot" aria-label="Save receipt">' +
            Icon("screenshot", 24) + "</button>" +
        "</div>" +
        '<div class="receipt__sheet">' +
          '<div class="receipt__check">' + Icon("check", 46) + "</div>" +
          '<div class="receipt__done">Transaction Completed Successfully!</div>' +
          '<div class="receipt__card">' +
            '<div class="receipt__card-label">Transaction Summary</div>' +
            '<div class="receipt__summary" data-summary></div>' +
            '<div class="receipt__qr"><div class="receipt__qrbox" data-qr></div></div>' +
            '<div class="receipt__brand">' +
              '<img src="img/cbe-logo.png" alt="">' +
              '<span><b>Commercial Bank of Ethiopia</b><span>The bank you can always rely on!</span></span>' +
            "</div>" +
          "</div>" +
          '<div class="receipt__actions">' +
            '<button class="receipt__action" data-act="full">' + Icon("receiptLines", 24) + "<span>Receipt</span></button>" +
            '<button class="receipt__action" data-act="screenshot">' + Icon("camera", 24) + "<span>Screenshot</span></button>" +
            '<button class="receipt__action" data-act="share">' + Icon("share", 24) + "<span>Share</span></button>" +
          "</div>" +
          '<div class="receipt__close-wrap">' +
            '<button class="btn btn--quiet btn--block" data-act="close">Close</button>' +
          "</div>" +
        "</div>" +
      "</div></div>");

    el.querySelector("[data-summary]").innerHTML = Fees.summaryHtml(tx);
    /* no frame and no white plate: pure black modules straight on the card,
       so the code reads as part of the receipt instead of a pasted box.
       Snapped to the module grid so no module ends up half a pixel wide, on
       screen and in the saved image alike. */
    var qrCanvas = document.createElement("canvas");
    el.querySelector("[data-qr]").appendChild(qrCanvas);
    QR.draw(qrCanvas, Fees.qrPayload(tx), 132, "M", 2, true, true, null);

    el.addEventListener("click", function (e) {
      var act = e.target.closest("[data-act]");
      if (!act) return;
      var a = act.dataset.act;
      if (a === "full") { Router.push("statement", { tx: tx }); return; }
      if (a === "close") { Guard.secure(false); Router.root("home"); return; }
      if (a === "screenshot") { saveReceipt(el, tx); return; }
      if (a === "share") {
        var text = Fees.summaryText(tx);
        if (navigator.share) navigator.share({ title: "CBE receipt " + tx.id, text: text }).catch(function () { });
        else {
          if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () { });
          UI.toast("Receipt copied to clipboard");
        }
        return;
      }
    });

    return { el: el, secure: true };
  }

  /* ------------------------------------------------- official statement -- */
  function statementRows(tx) {
    var f = tx.fees;
    return [
      ["Payer:", tx.senderName],
      ["Account:", "1****" + tx.senderLast4],
      ["Receiver:", tx.receiverName],
      ["Account:", "1****" + tx.receiverLast4],
      ["Payment Type:", "A2A"],
      ["Payment Date & Time:", U.statementDate(new Date(tx.date))],
      ["Reference No. (VAT Invoice No):", tx.id],
      ["Reason / Type of service:", tx.reason || "MB Transfer"],
      ["Transferred Amount:", U.money(f.amount) + " ETB"],
      ["Service Charge:", U.money(f.service) + " ETB"],
      ["VAT (15% of service charge):", U.money(f.vat) + " ETB"],
      ["Disaster Risk Response Fund (5% of service charge):", U.money(f.drrf) + " ETB"]
    ];
  }

  function statementHtml(tx) {
    var f = tx.fees, s = Store.get();
    var b = bank();
    var rows = statementRows(tx).map(function (r) {
      return '<div class="stmt-row"><span>' + U.esc(r[0]) + "</span><span>" + U.esc(r[1]) + "</span></div>";
    }).join("");
    var cust = [
      ["Customer Name:", s.holderName],
      ["Region:", "-"], ["City:", "-"], ["Sub City:", "-"], ["Wereda/Kebele:", "-"],
      ["VAT Registration No:", "-"], ["VAT Registration Date:", "-"], ["TIN (TAX ID):", "-"], ["Branch:", "-"]
    ];
    return '<div class="stmt-viewport"><div class="stmt-doc"><div class="stmt-paper">' +
      '<div class="stmt-head">' +
        '<img src="img/cbe-logo.png" alt="">' +
        '<div class="stmt-head__title">Commercial Bank of Ethiopia</div>' +
        '<div class="stmt-head__sub">Customer Receipt</div>' +
        '<div class="stmt-head__status">Status: COMPLETED</div>' +
      "</div>" +
      '<div class="stmt-cols">' +
        '<div><div class="stmt-col__title">Company Address &amp; Other Information</div>' +
          b.address.map(function (r) {
            var v = r[0] === "VAT Receipt No:" ? tx.id : r[1];
            return '<div class="stmt-kv"><span>' + U.esc(r[0]) + "</span><span>" + U.esc(v) + "</span></div>";
          }).join("") +
        "</div>" +
        '<div><div class="stmt-col__title">Customer Information</div>' +
          cust.map(function (r) {
            return '<div class="stmt-kv"><span>' + U.esc(r[0]) + "</span><span>" + U.esc(r[1]) + "</span></div>";
          }).join("") +
        "</div>" +
      "</div>" +
      '<div class="stmt-section-title">Payment / Transaction Informations</div>' +
      '<div class="stmt-summary-block">' +
        '<div class="stmt-rows">' + rows +
          '<div class="stmt-row stmt-row--total"><span>Total amount debited from customer\'s account:</span>' +
            "<span>" + U.money(f.total) + " ETB</span></div>" +
        "</div>" +
        '<img class="stmt-stamp" src="img/stamp.png" alt="">' +
      "</div>" +
      '<div class="stmt-word-row">' +
        '<div class="stmt-word"><div class="stmt-word__label">Amount in Word:</div>' +
          '<div class="stmt-word__value">' + U.esc(Fees.inWords(f.amount)) + "</div></div>" +
        '<div class="stmt-qr" data-qr></div>' +
      "</div>" +
      '<div class="stmt-foot">' +
        '<div class="stmt-foot__a">The Bank you can always rely on.</div>' +
        '<div class="stmt-foot__b">© ' + new Date().getFullYear() + " Commercial Bank of Ethiopia. All rights reserved.</div>" +
      "</div>" +
    "</div></div></div>" +
    '<div class="stmt-download"><button class="btn btn--xs" data-act="pdf">Download PDF</button></div>';
  }

  /* The reference statement is a 720px-wide document scaled into the phone
     width; the wrapper height is corrected so the page keeps scrolling right. */
  function fitStatement(el) {
    var vp = el.querySelector(".stmt-viewport");
    var doc = el.querySelector(".stmt-doc");
    if (!vp || !doc) return;
    var w = vp.clientWidth || window.innerWidth;
    var h = doc.offsetHeight;
    if (!w || !h) { requestAnimationFrame(function () { fitStatement(el); }); return; }
    var s = Math.min(1, w / 720);
    doc.style.transform = s === 1 ? "" : "scale(" + s + ")";
    vp.style.height = Math.round(h * s) + "px";
  }

  function statementView(params) {
    var tx = params.tx;
    var el = UI.h('<div class="screen">' +
      '<div class="body"><div class="stmt-page">' + statementHtml(tx) + "</div></div></div>");
    var canvas = document.createElement("canvas");
    el.querySelector("[data-qr]").appendChild(canvas);
    QR.draw(canvas, Fees.qrPayload(tx), 72, "M", 1);
    fitStatement(el);
    requestAnimationFrame(function () { fitStatement(el); });
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () {
        if (!document.body.contains(el)) { ro.disconnect(); return; }
        fitStatement(el);
      });
      ro.observe(el.querySelector(".stmt-doc"));
    }
    var onResize = function () {
      if (document.body.contains(el)) fitStatement(el);
      else window.removeEventListener("resize", onResize);
    };
    window.addEventListener("resize", onResize);

    el.addEventListener("click", function (e) {
      if (e.target.closest('[data-act="pdf"]')) {
        try {
          downloadPdf(tx);
          UI.toast("Receipt PDF downloaded");
        } catch (err) { UI.toast("Could not create the PDF"); }
      }
    });
    return { el: el, secure: true };
  }

  /* ------------------------------------------------------ saved receipts */
  function receiptsView() {
    var list = Store.get().receipts || [];
    var el = UI.h('<div class="screen">' +
      UI.appbar({ title: "Receipt" }) +
      '<div class="body"><div class="sheet"><div class="pad" style="padding-top:16px" data-list></div></div></div>' +
      UI.bottomNav("home") +
    "</div>");
    var host = el.querySelector("[data-list]");
    if (!list.length) {
      host.innerHTML = '<div class="empty">' +
        '<div class="empty__icon">' + Icon("receiptLines", 40) + "</div>" +
        '<div class="empty__title">No receipts yet</div>' +
        '<p class="empty__text">Every transfer you complete will keep its receipt here, available offline.</p></div>';
    } else {
      host.innerHTML = list.map(function (r, i) {
        return '<button class="txn-item" data-i="' + i + '">' +
          '<span class="txn-item__dir txn-item__dir--out">' + Icon("arrowUpRight", 20) + "</span>" +
          '<span class="txn-item__mid"><span class="txn-item__name">' + U.esc(r.receiverName) + "</span>" +
            '<div class="txn-item__meta">' + U.esc(r.id) + " · " + U.esc(U.shortDate(new Date(r.date))) + "</div></span>" +
          '<span class="txn-item__right"><span class="txn-item__amt money">' + U.money(r.fees.amount) + " ETB</span>" +
            '<div class="txn-item__tag">' + U.esc((r.reason || "MB TRANSFER").toUpperCase()) + "</div></span></button>";
      }).join("");
    }
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-i]");
      if (b) { Router.push("statement", { tx: list[+b.dataset.i] }); return; }
      var nav = e.target.closest("[data-nav]");
      if (nav) {
        var id = nav.dataset.nav;
        if (id === "home") Router.root("home");
        else if (id === "transactions") Router.root("transactions");
        else Router.root("settings");
      }
    });
    return { el: el };
  }

  /* ------------------------------------------------- receipt verification */
  function verifyReceiptView() {
    var el = UI.h('<div class="screen">' +
      UI.appbar({ title: "Verify Receipt" }) +
      '<div class="body"><div class="sheet"><div class="verify-form">' +
        '<div class="field" style="margin-top:0">' +
          '<div class="input"><span class="input__icon">' + Icon("receiptLines", 21) + "</span>" +
            '<input data-id placeholder="Enter Receipt ID">' +
            '<button class="iconbtn" data-act="scan" style="width:30px;height:30px">' + Icon("qr", 20) + "</button></div>" +
        "</div>" +
        '<button class="btn btn--block" data-act="check" style="margin-top:18px">Verify Receipt</button>' +
      "</div></div></div></div>");

    el.addEventListener("click", function (e) {
      var act = e.target.closest("[data-act]");
      if (!act) return;
      if (act.dataset.act === "scan") { Router.push("scan"); return; }
      if (act.dataset.act === "check") {
        var id = (el.querySelector("[data-id]").value || "").trim().toUpperCase();
        if (!id) { UI.toast("Enter a receipt ID"); return; }
        var found = Store.findReceipt(id);
        if (found) Router.push("statement", { tx: found, verified: true });
        else UI.toast("No receipt found for " + id);
      }
    });
    return { el: el };
  }

  /* -------------------------------------------------------- export tools --
     "Screenshot / Download" captures the receipt exactly as it is laid out on
     screen (the action row and the Close button belong to the app chrome, not
     to the receipt, so they are left out) and hands the PNG to the device. */
  function saveReceipt(el, tx) {
    var node = el.querySelector(".receipt") || el;
    var name = "CBE-receipt-" + tx.id + ".png";
    /* Measure the receipt on screen instead of assuming a phone size: a fixed
       360x800 box re-wrapped the text and cropped the bottom of the sheet, so
       the export no longer sat where the eye expects it.  clientWidth keeps
       the real device width and scrollHeight keeps the whole document. */
    var w = Math.round(node.clientWidth) || 360;
    var h = Math.max(Math.round(node.scrollHeight), Math.round(node.clientHeight)) || 800;
    /* the printed/downloaded copy frames the code in a thin rule; the one on
       screen stays frameless.  Capture clones the tree synchronously, so the
       class is removed again in the same tick and never paints. */
    var qrBox = el.querySelector(".receipt__qrbox");
    if (qrBox) qrBox.classList.add("is-download");
    var shot = Capture.png(node, {
      width: w,
      height: h,
      scale: 2,
      background: "#ffffff",
      hide: [".receipt__actions", ".receipt__close-wrap", ".receipt__head-act"]
    });
    if (qrBox) qrBox.classList.remove("is-download");
    return shot.then(function (canvas) {
      return Capture.saveCanvas(canvas, name);
    }).then(function () {
      UI.toast("Receipt saved to your device");
    }).catch(function () {
      /* last resort: the hand drawn canvas replica */
      try {
        saveReceiptImage(tx);
        UI.toast("Receipt saved to your device");
      } catch (e) { UI.toast("Could not save the receipt"); }
    });
  }

  function saveReceiptImage(tx) {
    try {
      var canvas = document.createElement("canvas");
      canvas.width = 720; canvas.height = 1600;
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 720, 1600);
      ctx.fillStyle = "#7a1fa2";
      ctx.fillRect(0, 0, 720, 290);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px " + "'Times New Roman', serif";
      ctx.fillText("Thank you", 120, 110);
      ctx.font = "24px 'Times New Roman', serif";
      ctx.fillText("Success", 120, 150);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.arc(360, 268, 92, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#7a1fa2";
      ctx.beginPath(); ctx.arc(360, 268, 78, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(325, 270); ctx.lineTo(352, 297); ctx.lineTo(400, 240); ctx.stroke();
      ctx.fillStyle = "#1c1c1c";
      ctx.font = "bold 30px 'Times New Roman', serif";
      ctx.fillText("Transaction Completed Successfully!", 26, 420);
      ctx.fillStyle = "#ebebeb";
      ctx.fillRect(36, 450, 648, 900);
      ctx.fillStyle = "#8a8a8a";
      ctx.font = "26px 'Times New Roman', serif";
      ctx.fillText("Transaction Summary", 60, 500);
      wrap(ctx, Fees.summaryText(tx), 60, 550, 600, 40, "#101010", "30px 'Times New Roman', serif");
      var qr = document.createElement("canvas");
      QR.draw(qr, Fees.qrPayload(tx), 300, "M", 2);
      ctx.drawImage(qr, 210, 900, 300, 300);
      ctx.drawImage(el0("img/cbe-logo.png"), 60, 1240, 60, 60);
      ctx.fillStyle = "#2f2440";
      ctx.font = "bold 28px 'Times New Roman', serif";
      ctx.fillText("Commercial Bank of Ethiopia", 140, 1275);
      ctx.fillStyle = "#8b8b95";
      ctx.font = "24px 'Times New Roman', serif";
      ctx.fillText("The bank you can always rely on!", 140, 1310);
      var url = canvas.toDataURL("image/png");
      download(url, "CBE-receipt-" + tx.id + ".png");
    } catch (e) { /* capture of the canvas is best effort */ }
  }

  var _logoCache = null;
  function el0(src) {
    if (!_logoCache) {
      _logoCache = new Image();
      _logoCache.src = src;
    }
    return _logoCache;
  }

  function wrap(ctx, text, x, y, maxW, lh, color, font) {
    ctx.font = font; ctx.fillStyle = color;
    var words = String(text).split(" "), line = "";
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, y); y += lh; line = words[i];
      } else line = test;
      if (y > 1180) return y;
    }
    if (line) { ctx.fillText(line, x, y); y += lh; }
    return y;
  }

  function download(url, name) {
    var a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); }, 60);
  }

  /* ------------------------------------------------------------ PDF ------ */
  function pdfEscape(s) {
    return String(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
      .replace(/[^\x20-\x7e]/g, "");
  }
  function pdfWidth(text, size, bold) {
    return String(text).length * size * (bold ? 0.56 : 0.5);
  }

  function buildPdf(tx) {
    var f = tx.fees, s = Store.get(), b = bank();
    var W = 360, H = 780;
    var ops = [];
    function txt(x, y, size, text, opts) {
      opts = opts || {};
      var font = opts.serif ? (opts.bold ? "/F4" : "/F3") : (opts.bold ? "/F2" : "/F1");
      var str = "BT " + font + " " + size + " Tf " + (opts.gray || "0 0 0") + " rg " +
        x.toFixed(1) + " " + y.toFixed(1) + " Td (" + pdfEscape(text) + ") Tj ET";
      ops.push(str);
    }
    function right(x, y, size, text, opts) {
      txt(x - pdfWidth(text, size, opts && opts.bold), y, size, text, opts);
    }
    function rect(x, y, w, h, color) {
      ops.push(color + " rg " + x + " " + y + " " + w + " " + h + " re f");
    }
    function line(x1, y1, x2, y2) {
      ops.push("0.92 0.92 0.92 RG 0.6 w " + x1 + " " + y1 + " m " + x2 + " " + y2 + " l S");
    }

    // header band
    rect(0, H - 42, W, 42, "0.514 0.145 0.482");
    txt(0, H - 22, 16, "Commercial Bank of Ethiopia", { bold: 1, gray: "1 1 1" });
    // centre the title
    ops.pop();
    var title = "Commercial Bank of Ethiopia";
    txt((W - pdfWidth(title, 16, true)) / 2, H - 22, 16, title, { bold: 1, gray: "1 1 1" });
    var sub = "Customer Receipt", st = "Status: COMPLETED";
    txt((W - pdfWidth(sub, 13, false)) / 2, H - 34, 13, sub, { gray: "1 1 1" });
    txt((W - pdfWidth(st, 11, true)) / 2, H - 55 + 11, 11, st, { bold: 1, gray: "1 1 1" });

    var y = H - 62, m = 40;
    txt(m, y, 12.5, "Company Address & Other Information", { bold: 1 });
    txt(m + 155, y, 12.5, "Customer Information", { bold: 1 });
    y -= 16;
    var left = b.address.map(function (r) { return [r[0], r[0] === "VAT Receipt No:" ? tx.id : r[1]]; });
    var rightCol = [
      ["Customer Name:", s.holderName], ["Region:", "-"], ["City:", "-"], ["Sub City:", "-"],
      ["Wereda/Kebele:", "-"], ["VAT Registration No:", "-"], ["VAT Registration Date:", "-"],
      ["TIN (TAX ID):", "-"], ["Branch:", "-"]
    ];
    var n = Math.max(left.length, rightCol.length);
    for (var i = 0; i < n; i++) {
      var yy = y - i * 13;
      if (left[i]) { txt(m, yy, 12, left[i][0]); right(m + 140, yy, 12, left[i][1]); }
      if (rightCol[i]) { txt(m + 155, yy, 12, rightCol[i][0]); right(W - m, yy, 12, rightCol[i][1]); }
    }
    y = y - n * 13 - 20;
    txt((W - pdfWidth("Payment / Transaction Informations", 13, true)) / 2, y, 13,
      "Payment / Transaction Informations", { bold: 1 });
    y -= 20;
    statementRows(tx).forEach(function (r) {
      line(m, y + 8, W - m, y + 8);
      txt(m, y, 12, r[0]);
      right(W - m, y, 12, r[1]);
      y -= 26;
    });
    line(m, y + 8, W - m, y + 8);
    txt(m, y, 12, "Total amount debited from customer's account:", { bold: 1 });
    right(W - m, y, 12, U.money(f.total) + " ETB", { bold: 1 });
    y -= 30;

    // amount in words + QR
    rect(m, y - 6, 170, 30, "0.949 0.949 0.949");
    txt(m + 85 - pdfWidth("Amount in Word:", 12, true) / 2, y + 8, 12, "Amount in Word:", { bold: 1 });
    var words = Fees.inWords(f.amount);
    txt(m + 85 - pdfWidth(words, 11, false) / 2, y - 2, 11, words, { serif: 1 });

    txt(m + 120 - pdfWidth("The Bank you can always rely on.", 12, true) / 2, y - 30, 12,
      "The Bank you can always rely on.", { bold: 1, gray: "0.514 0.145 0.482" });
    txt(m + 120 - pdfWidth("© " + new Date().getFullYear() + " Commercial Bank of Ethiopia. All rights reserved.", 11, false) / 2,
      y - 44, 11, "© " + new Date().getFullYear() + " Commercial Bank of Ethiopia. All rights reserved.", { gray: "0.42 0.42 0.42" });

    var content = ops.join("\n");

    /* ---- assemble the file (offsets tracked for the xref table) ---- */
    var objects = [];
    function add(str) { objects.push(str); return objects.length; }
    var fontHelv = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    var fontHelvB = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
    var fontTimes = add("<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>");
    var fontTimesB = add("<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>");
    var contentId = add("<< /Length " + content.length + " >>\nstream\n" + content + "\nendstream");
    var res = "<< /Font << /F1 " + fontHelv + " 0 R /F2 " + fontHelvB + " 0 R /F3 " + fontTimes +
      " 0 R /F4 " + fontTimesB + " 0 R >> >>";
    var pageId = add("<< /Type /Page /Parent 0 2 R /MediaBox [0 0 " + W + " " + H + "] /Resources " + res +
      " /Contents " + contentId + " 0 R >>");
    var pagesId = add("<< /Type /Pages /Kids [" + pageId + " 0 R] /Count 1 >>");
    var catId = add("<< /Type /Catalog /Pages " + pagesId + " 0 R >>");

    // fix the parent reference now that the page object number is known
    objects[pageId - 1] = objects[pageId - 1].replace("/Parent 0 2 R", "/Parent " + pagesId + " 0 R");

    var header = "%PDF-1.4\n";
    var body = header;
    var offsets = [];
    for (var k = 0; k < objects.length; k++) {
      offsets.push(body.length);
      body += (k + 1) + " 0 obj\n" + objects[k] + "\nendobj\n";
    }
    var xrefAt = body.length;
    body += "xref\n0 " + (objects.length + 1) + "\n0000000000 65535 f \n";
    offsets.forEach(function (o) {
      body += ("0000000000" + o).slice(-10) + " 00000 n \n";
    });
    body += "trailer\n<< /Size " + (objects.length + 1) + " /Root " + catId + " 0 R >>\nstartxref\n" +
      xrefAt + "\n%%EOF";

    var bytes = new Uint8Array(body.length);
    for (var q = 0; q < body.length; q++) bytes[q] = body.charCodeAt(q) & 0xff;
    return bytes;
  }

  function downloadPdf(tx) {
    var bytes = buildPdf(tx);
    var blob = new Blob([bytes], { type: "application/pdf" });
    var url = URL.createObjectURL(blob);
    download(url, "CBE-receipt-" + tx.id + ".pdf");
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  Router.define("receipt", receiptView);
  Router.define("statement", statementView);
  Router.define("receipts", receiptsView);
  Router.define("verifyReceipt", verifyReceiptView);
})();
