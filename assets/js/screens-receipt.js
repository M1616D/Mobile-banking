/* ==========================================================================
   screens-receipt.js — the success receipt (exact replica of the reference
   photo), the plain receipt the download button writes, and the full CBE
   customer receipt that opens at breciept.cbe.com.et.
   Every name, account, amount and charge comes from CBE.receiptOf(), so the
   receipt always prints what the private setup holds.
   ========================================================================== */
(function (global) {
  'use strict';
  var CBE = global.CBE;
  var U = CBE.ui;

  var LOGO = 'assets/img/cbe-logo.png';
  var STAMP = 'assets/img/bank-stamp.png';

  function txnFor(p) {
    return CBE.state.transactions.filter(function (t) { return t.id === (p.txnId || p.id); })[0] || CBE.state.transactions[0];
  }

  /* the sentence printed on the success receipt, exactly like the photo:
     one serif paragraph with the bold names, date and transaction id */
  function narrative(r) {
    var f = CBE.fees(r.amount, r.charges);
    var verb = r.direction === 'debit' ? 'debited from' : 'credited to';
    var sender = r.senderName + ' ' + U.maskAccount(r.senderAccount);
    var receiver = r.receiverName + (r.receiverAccount ? ' ' + r.receiverAccount : '');
    var html = 'ETB ' + U.money(r.amount) + ' has been ' + verb + ' <b>' + U.esc(sender) + '</b> for <b>' +
      U.esc(receiver) + '</b> on <b>' + U.esc(U.longDate(r.date)) + '</b> with transaction ID: <b>' +
      U.esc(r.ref) + '.</b> Reason: ' + U.esc(r.remark || r.reasonType);
    if (r.charges) {
      html += ' Total Amount ' + (r.direction === 'debit' ? 'Debited' : 'Credited') + ': ETB' + U.money(f.total) +
        ' with Service Charge of ETB' + U.money(f.sc) + ', VAT (15%) of ETB' + U.money(f.vat) +
        ' and Disaster Recovery (5%) of ETB' + U.money(f.drf) + '.';
    } else {
      html += ' No service charge was applied on this transaction.';
    }
    return html;
  }

  /* the grey summary card, shared by the screen and the downloaded receipt */
  function summaryCard(r, opts) {
    opts = opts || {};
    var brandName = opts.english ? 'Commercial Bank of Ethiopia' : 'የኢትዮጵያ ንግድ ባንክ';
    return '<div class="summary-card">' +
      '<h3>' + U.esc(CBE.t('transactionSummary')) + '</h3>' +
      '<p>' + narrative(r) + '</p>' +
      '<div class="summary-qr"><span class="box">' + CBE.qr.svg(r.ref + '|' + r.amount, { modules: 33 }) + '</span></div>' +
      '<div class="summary-brand">' +
        '<img src="' + LOGO + '" alt="">' +
        '<div><div class="n' + (opts.english ? '' : ' am') + '">' + U.esc(brandName) + '</div>' +
        '<div class="t">' + U.esc(CBE.t('tagline')) + '</div></div>' +
      '</div>' +
      '</div>';
  }

  function thanksHeader() {
    return '<header class="thanks-header">' +
        '<div class="tline">' +
          '<span class="shield">' + CBE.icon('shieldCheck', { size: 22 }) + '</span>' +
          '<span><h1>' + U.esc(CBE.t('thankYou')) + '</h1><p>' + U.esc(CBE.t('success')) + '</p></span>' +
        '</div>' +
        '<span class="scan-ic">' + CBE.icon('scanShare', { size: 22 }) + '</span>' +
        '<div class="thanks-check">' + CBE.icon('check', { size: 50, weight: 3 }) + '</div>' +
      '</header>';
  }

  /* ------------------------------------------------------- success receipt
     Row for row the reference photo: purple header, tick badge, the white
     sheet with the summary card and the QR, then Receipt · Screenshot ·
     Share and Close. */
  CBE.define('receipt', {
    render: function (p) {
      var t = txnFor(p);
      var r = CBE.receiptOf(t && t.id);
      if (!r) return U.emptyState(CBE.t('noResults'));
      return '<section class="screen no-anim">' +
        thanksHeader() +
        '<div class="screen-body receipt-body">' +
          '<h2>' + U.esc(CBE.t('transactionCompleted')) + '</h2>' +
          summaryCard(r, {}) +
          '<div class="rec-actions">' +
            '<button data-goto="fullReceipt" data-action="goto" data-value="' + U.esc(r.txn.id) + '">' +
              '<span class="ic">' + CBE.icon('receipt', { size: 22 }) + '</span>' + U.esc('Receipt') + '</button>' +
            '<button data-action="downloadReceipt" data-value="' + U.esc(r.txn.id) + '">' +
              '<span class="ic">' + CBE.icon('screenshot', { size: 22 }) + '</span>' + U.esc('Screenshot') + '</button>' +
            '<button data-action="shareReceipt" data-value="' + U.esc(r.txn.id) + '">' +
              '<span class="ic">' + CBE.icon('share', { size: 22 }) + '</span>' + U.esc('Share') + '</button>' +
          '</div>' +
          '<button class="btn btn-soft" style="margin-top:22px" data-action="goHome">' + U.esc('Close') + '</button>' +
        '</div>' +
      '</section>';
    }
  });

  /* ------------------------------------------------------ full CBE receipt */
  CBE.define('fullReceipt', {
    render: function (p) {
      var t = txnFor(p);
      var r = CBE.receiptOf(t && t.id);
      if (!r) return U.emptyState(CBE.t('noResults'));
      return '<section class="screen web-page no-anim">' +
        '<div class="web-toolbar">' +
          '<button data-action="back" aria-label="Back">' + CBE.icon('chevronLeft', { size: 21 }) + '</button>' +
          '<span class="omni">' + CBE.icon('lock', { size: 13 }) + 'breciept.cbe.com.et</span>' +
          '<button data-action="printReceipt" data-value="' + U.esc(r.txn.id) + '" aria-label="Print">' + CBE.icon('doc', { size: 20 }) + '</button>' +
        '</div>' +
        '<div class="screen-body no-nav web-body">' +
          '<div class="receipt-paper">' + receiptPaper(r, CBE.fees(r.amount, r.charges), CBE.state.receiptMeta) + '</div>' +
          '<div class="pdf-btn"><button data-action="downloadPaper" data-value="' + U.esc(r.txn.id) + '">' +
            U.esc(CBE.t('downloadPdf')) + '</button></div>' +
        '</div>' +
      '</section>';
    }
  });

  /* the paper itself — shared by the screen and the downloaded file */
  function receiptPaper(r, f, m) {
    var company = [
      ['Country', m.country], ['City', m.city], ['Address', m.address], ['Postal code', m.postal],
      ['SWIFT Code', m.swift], ['Email', m.email], ['Tel', m.tel], ['Fax', m.fax],
      ['P.O.Box', m.poBox], ['VAT Receipt No', r.ref], ['VAT Registration No', m.vatRegNo],
      ['VAT Registration Date', m.vatRegDate]
    ];
    var customer = [
      ['Customer Name', r.senderName], ['Region', ''], ['City', ''], ['Sub City', ''],
      ['Woreda', ''], ['VAT Registration No', ''], ['VAT Registration Date', ''],
      ['TIN (TAX ID)', CBE.state.profile.tin], ['Branch', '']
    ];
    var rows = [
      ['Payer', r.senderName],
      ['Account', U.maskAccount(r.senderAccount)],
      ['Receiver', r.receiverName],
      ['Account', r.receiverAccount || U.maskAccount(r.senderAccount)],
      ['Payment Type', 'A2A'],
      ['Payment Date &amp; Time', U.longDate(r.date)],
      ['Reference No. (VAT Invoice No)', r.ref],
      ['Reason / Type of service', r.reasonType || r.remark],
      ['Transferred Amount', U.money(r.amount) + ' ETB'],
      ['Service Charge', U.money(f.sc) + ' ETB'],
      ['VAT (15% of service charge)', U.money(f.vat) + ' ETB'],
      ['Disaster Risk Response Fund (5% of service charge)', U.money(f.drf) + ' ETB']
    ];
    function lines(list) {
      return list.map(function (x) {
        return '<div class="pline"><span class="k">' + U.esc(x[0]) + ':</span><span class="v">' + U.esc(x[1]) + '</span></div>';
      }).join('');
    }
    return '<div class="receipt-head">' +
        '<img src="' + LOGO + '" alt="">' +
        '<h1>' + U.esc(m.company) + '</h1>' +
        '<p>' + U.esc(CBE.t('customerReceipt')) + '</p>' +
        '<div class="st">' + U.esc(CBE.t('status')) + ': ' + U.esc(CBE.t('completed')) + '</div>' +
      '</div>' +
      '<div class="paper-cols">' +
        '<div class="paper-col"><h4>' + U.esc(CBE.t('companyInfo')) + '</h4>' + lines(company) + '</div>' +
        '<div class="paper-col"><h4>' + U.esc(CBE.t('customerInfo')) + '</h4>' + lines(customer) + '</div>' +
      '</div>' +
      '<div class="paper-block">' +
        '<h3>' + U.esc('Payment / Transaction Informations') + '</h3>' +
        '<div class="paper-rows">' +
          rows.map(function (x) {
            return '<div class="paper-row"><span>' + x[0] + ':</span><span>' + U.esc(x[1]) + '</span></div>';
          }).join('') +
          '<div class="paper-row strong"><span>' + U.esc(CBE.t('totalDebited')) + ':</span><span>' + U.money(f.total) + ' ETB</span></div>' +
          '<span class="stamp-img"><img src="' + STAMP + '" alt=""></span>' +
        '</div>' +
        '<div class="amount-word">' +
          '<span class="t"><b>' + U.esc(CBE.t('amountInWord')) + ':</b>' + U.esc(U.amountInWords(r.amount)) + '</span>' +
          '<span class="qr">' + CBE.qr.svg(r.ref, { modules: 25 }) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="paper-foot"><b>' + U.esc(m.footer || CBE.t('bankRelyOn')) + '</b><br>' + U.esc(CBE.t('allRights')) + '</div>';
  }
  CBE.receiptPaper = receiptPaper;

  /* -------------------------------------------------- the downloaded files
     Both are self-contained: inline CSS, inline QR, and the logo inlined as a
     data URI when the browser allows it, so the file renders on its own. */
  var PAPER_CSS =
    '.receipt-paper{background:#fff;border-radius:3px;overflow:hidden;border:1px solid #e2e5e9}' +
    '.receipt-head{background:#6c1f9e;color:#fff;text-align:center;padding:10px 46px 12px;position:relative}' +
    '.receipt-head h1{margin:0;font-size:14px}.receipt-head p{margin:2px 0 0;font-size:10px}' +
    '.receipt-head .st{margin-top:4px;font-size:10px;font-weight:700}' +
    '.receipt-head img{position:absolute;left:10px;top:12px;width:30px;height:30px;object-fit:contain}' +
    '.paper-cols{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #dcdfdd}' +
    '.paper-col{padding:9px 10px}.paper-col+.paper-col{border-left:1px solid #dcdfdd}' +
    '.paper-col h4{margin:0 0 8px;font-size:10.5px;text-align:center}' +
    '.pline{display:flex;justify-content:space-between;gap:8px;font-size:9.5px;margin-bottom:5px;color:#4a5157}' +
    '.pline .v{text-align:right;color:#2b3138}' +
    '.paper-block{padding:10px}.paper-block h3{text-align:center;font-size:11px;margin:0 0 10px}' +
    '.paper-rows{position:relative;padding:0 26px}' +
    '.paper-row{display:flex;justify-content:space-between;gap:10px;font-size:9.5px;padding:5px 0;border-bottom:1px solid #eceeed;color:#3c4349}' +
    '.paper-row span:last-child{text-align:right}.paper-row.strong{font-weight:700}' +
    '.stamp-img{position:absolute;left:-6px;top:44%;transform:translateY(-50%) rotate(-8deg);width:118px;height:118px;opacity:.55;display:block}' +
    '.stamp-img img{width:100%;height:100%;object-fit:contain}' +
    '.amount-word{display:flex;align-items:center;justify-content:space-between;gap:10px;background:#f1f2f4;padding:8px 10px;margin-top:12px}' +
    '.amount-word .t{font-size:9.5px;text-align:center;flex:1}.amount-word .t b{display:block;margin-bottom:2px}' +
    '.amount-word .qr{width:54px;height:54px;flex:0 0 auto}.amount-word .qr svg{width:100%;height:100%}' +
    '.paper-foot{text-align:center;padding:9px 12px 13px;font-size:9.5px;color:#5a6167}.paper-foot b{color:#6c1f9e}';

  var SHELL_CSS =
    '*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    'body{margin:0;background:#eef0f3;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;color:#1f2328}' +
    '.wrap{max-width:460px;margin:0 auto;min-height:100vh}' +
    '.thanks-header{background:linear-gradient(180deg,#4d1479,#7a33b8);padding:26px 20px 58px;color:#fff;position:relative}' +
    '.thanks-header .tline{display:flex;align-items:center;gap:12px}' +
    '.thanks-header h1{font-size:18px;margin:0}' +
    '.thanks-header p{margin:3px 0 0;font-size:12.5px;opacity:.9}' +
    '.thanks-header .scan-ic{position:absolute;right:18px;top:26px;opacity:.95}' +
    '.thanks-check{position:absolute;left:50%;bottom:-38px;transform:translateX(-50%);width:96px;height:96px;border-radius:50%;' +
      'background:#7b2cbf;border:5px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff}' +
    '.body{padding:56px 15px 30px}' +
    '.body h2{text-align:center;font-size:15.5px;font-weight:600;color:#3c434a;margin:6px 0 18px}' +
    '.summary-card{background:#f1f2f5;border-radius:20px;padding:16px 15px 18px}' +
    '.summary-card h3{font-size:13px;color:#9aa3a7;font-weight:600;margin:0 0 12px}' +
    '.summary-card p{font-family:Georgia,"Times New Roman",Times,serif;font-size:14.5px;line-height:1.6;color:#2b3036;margin:0}' +
    '.summary-qr{display:flex;justify-content:center;margin:22px 0 18px}' +
    '.summary-qr .box{background:#fff;padding:10px;width:172px}' +
    '.summary-qr svg{width:100%;height:auto;display:block}' +
    '.summary-brand{display:flex;align-items:center;gap:10px}' +
    '.summary-brand img{width:48px;height:48px;object-fit:contain}' +
    '.summary-brand .n{font-size:13.5px;font-weight:700;color:#3e464d}' +
    '.summary-brand .t{font-size:12px;color:#8b9498;margin-top:2px}';

  /* the plain receipt the Screenshot button writes — the same card as on the
     screen, with no buttons, exactly like the reference "downloaded" photo */
  function receiptDocument(r, png) {
    return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>CBE Receipt ' + U.esc(r.ref) + '</title><style>' + SHELL_CSS +
      '.wrap{background:#fff}' + '</style></head><body><div class="wrap">' +
      thanksHeader() +
      '<div class="body"><h2>' + U.esc(CBE.t('transactionCompleted')) + '</h2>' +
      summaryCard(r, { english: true }).replace(LOGO, png || LOGO) +
      '</div></div></body></html>';
  }

  function paperDocument(r, f, m) {
    return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>CBE Customer Receipt ' + U.esc(r.ref) + '</title><style>' + SHELL_CSS + PAPER_CSS +
      '.wrap{background:#fff;padding:14px}' + '</style></head><body><div class="wrap">' +
      '<div class="receipt-paper">' + receiptPaper(r, f, m) + '</div>' +
      '</div></body></html>';
  }

  /* read the logo once so the downloaded file can carry it inline */
  function inlineLogo() {
    return new Promise(function (resolve) {
      try {
        fetch(LOGO).then(function (res) { return res.blob(); }).then(function (b) {
          var fr = new FileReader();
          fr.onload = function () { resolve(fr.result); };
          fr.onerror = function () { resolve(null); };
          fr.readAsDataURL(b);
        }).catch(function () { resolve(null); });
      } catch (e) { resolve(null); }
    });
  }

  function save(html, name, ok) {
    try {
      var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      U.toast(ok + ' — ' + name);
    } catch (e) {
      U.toast('Download is not available in this browser');
    }
  }

  /* -------------------------------------------------------------- actions */
  CBE.receiptActions = {
    share: function (id) {
      var r = CBE.receiptOf(id);
      if (!r) return;
      var text = 'Commercial Bank of Ethiopia\nReceipt ' + r.ref + '\n' +
        'From: ' + r.senderName + ' (' + U.maskAccount(r.senderAccount) + ')\n' +
        'To: ' + r.receiverName + (r.receiverAccount ? ' (' + r.receiverAccount + ')' : '') + '\n' +
        'Amount: ' + U.money(r.amount) + ' ETB\nDate: ' + U.longDate(r.date);
      if (global.navigator && navigator.share) {
        navigator.share({ title: 'CBE Receipt', text: text }).catch(function () { });
      } else { U.copy(text, 'Receipt copied'); }
    },

    /* the receipt screen has no edit button any more — receipts are adjusted
       from the receipts list inside the private setup */
    edit: function (id) {
      var r = CBE.receiptOf(id);
      if (!r) return;
      CBE.textSheet('Receipt ' + r.ref, [
        { id: 'senderName', label: 'Payer name', icon: 'person', value: r.senderName },
        { id: 'senderAccount', label: 'Payer account', icon: 'bankNote', value: r.senderAccount, inputmode: 'numeric' },
        { id: 'receiverName', label: 'Receiver name', icon: 'person', value: r.receiverName },
        { id: 'receiverAccount', label: 'Receiver account', icon: 'bankNote', value: r.receiverAccountRaw || r.receiverAccount, inputmode: 'numeric' },
        { id: 'amount', label: 'Amount (ETB)', icon: 'cash', value: U.group(r.amount), inputmode: 'decimal' },
        { id: 'remark', label: 'Remark / reason', icon: 'doc', value: r.remark }
      ], function (out) {
        var amount = Number(String(out.amount).replace(/[^\d.]/g, ''));
        CBE.applyReceiptFields(id, {
          senderName: out.senderName || r.senderName,
          senderAccount: String(out.senderAccount).replace(/\D/g, '') || r.senderAccount,
          receiverName: out.receiverName || r.receiverName,
          receiverAccountRaw: String(out.receiverAccount).replace(/\D/g, '') || r.receiverAccountRaw,
          amount: amount > 0 ? amount : r.amount,
          remark: out.remark || r.remark
        });
        CBE.render();
        U.toast('Receipt updated');
      });
    },

    download: function (id) {
      var r = CBE.receiptOf(id);
      if (!r) return;
      inlineLogo().then(function (png) {
        save(receiptDocument(r, png), 'CBE-Receipt-' + r.ref + '.html', 'Receipt downloaded');
      });
    },

    downloadPaper: function (id) {
      var r = CBE.receiptOf(id);
      if (!r) return;
      save(paperDocument(r, CBE.fees(r.amount, r.charges), CBE.state.receiptMeta),
        'CBE-Customer-Receipt-' + r.ref + '.html', 'Customer receipt downloaded');
    },

    print: function (id) {
      var r = CBE.receiptOf(id);
      if (!r) return;
      var html = paperDocument(r, CBE.fees(r.amount, r.charges), CBE.state.receiptMeta);
      var frame = document.createElement('iframe');
      frame.setAttribute('aria-hidden', 'true');
      frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
      document.body.appendChild(frame);
      try {
        var doc = frame.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();
      } catch (e) {
        frame.parentNode.removeChild(frame);
        U.toast('Printing is not available in this browser');
        return;
      }
      setTimeout(function () {
        try { frame.contentWindow.focus(); frame.contentWindow.print(); } catch (e) { /* ignore */ }
        setTimeout(function () { if (frame.parentNode) frame.parentNode.removeChild(frame); }, 2000);
      }, 350);
      U.toast('Print view ready — choose “Save as PDF”');
    }
  };
})(typeof window !== 'undefined' ? window : this);
