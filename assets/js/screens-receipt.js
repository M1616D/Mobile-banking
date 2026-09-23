/* ==========================================================================
   screens-receipt.js — the success sheet from the screenshot and the full
   "Customer Receipt" page the bank e-mails you, plus its offline download.
   ========================================================================== */
(function (global) {
  'use strict';
  var CBE = global.CBE;
  var U = CBE.ui;
  var t = function (k) { return CBE.t(k); };

  function summaryHTML(r) {
    var f = CBE.fees(r.amount, r.charges);
    var dir = r.direction === 'debit' ? 'debited from' : 'credited to';
    return 'ETB <b>' + U.money(r.amount) + '</b> has been ' + dir + ' <b>' + U.esc(r.senderName) + ' ETB-' + U.last4(r.senderAccount) + '</b>' +
      (r.direction === 'debit' ? ' for ' : ' ') +
      (r.direction === 'debit' ? '<b>' + U.esc(r.receiverName) + ' ' + U.esc(shortRef(r)) + ' ETB-' + U.last4(r.receiverAccountRaw || r.receiverAccount) + '</b>' : '') +
      ' on <b>' + U.esc(U.longDate(r.date)) + '</b> with transaction ID: <b>' + U.esc(r.ref) + '</b>.' +
      ' Reason: ' + U.esc(r.remark) +
      ' Total Amount Debited: ETB<b>' + U.money(f.total) + '</b> with Service Charge of ETB' + U.money(f.sc) +
      ', VAT (' + CBE.state.feeCfg.vatPct + '%) of ETB' + U.money(f.vat) +
      ' and Disaster Recovery (' + CBE.state.feeCfg.drfPct + '%) of ETB' + U.money(f.drf) + '.';
  }
  /* the "B35-45 Selam C" style branch-group tag on the reference receipt */
  function shortRef(r) {
    var txt = r.txn && r.txn.to ? String(r.txn.to) : '';
    var m = txt.match(/[A-Z]\d+-\d+\s+\S+\s+\S$/);
    return m ? m[0] : '';
  }

  /* ------------------------------------------------------ success sheet */
  CBE.define('receipt', {
    render: function (p) {
      var r = CBE.receiptOf(p.id);
      if (!r) return '<section class="screen"><div class="screen-body no-nav">' + U.emptyState(t('noResults')) + '</div></section>';
      var code = r.ref + '|' + r.amount.toFixed(2) + '|' + r.receiverAccountRaw + '|' + r.senderAccount;
      return '<section class="screen" style="background:#fff">' +
        '<div class="sheet-success" style="height:100%;border-radius:0">' +
          '<div class="thanks-head">' +
            '<span class="mark">' + CBE.icon('check', { size: 18, weight: 2.6 }) + '</span>' +
            '<div><h2>' + U.esc(t('thankYou')) + '</h2><div class="sub">' + U.esc(t('success')) + '</div></div>' +
          '</div>' +
          '<div class="thanks-circle"><span class="inner">' + CBE.icon('check', { size: 36, weight: 2.8 }) + '</span></div>' +
          '<div class="receipt-scroll">' +
            '<div class="receipt-title">' + U.esc(t('transactionCompleted')) + '</div>' +
            '<div class="summary-block"><div class="cap">' + U.esc(t('transactionSummary')) + '</div>' +
              '<p>' + summaryHTML(r) + '</p></div>' +
            '<div class="receipt-qr"><img src="' + CBE.qr.dataUrl(code, { modules: 33 }) + '" alt="Receipt QR code"></div>' +
            '<div class="receipt-brand">' + U.cbeLogo(46) +
              '<span class="am">የኢትዮጵያ ንግድ ባንክ</span>' +
              '<span class="en">' + U.esc(t('bankNameLong')) + '</span>' +
              '<span class="en" style="font-weight:500;color:#98a0ac">' + U.esc(t('tagline')) + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="receipt-actions">' +
            '<div class="mini-actions">' +
              '<button data-goto="receiptPaper" data-value="' + U.esc(r.txn.id) + '">' + CBE.icon('receipt', { size: 18 }) + U.esc(t('receipt')) + '</button>' +
              '<button data-action="shareReceipt" data-value="' + U.esc(r.txn.id) + '">' + CBE.icon('screenshot', { size: 18 }) + U.esc(t('screenshot')) + '</button>' +
              '<button data-action="shareReceipt" data-value="' + U.esc(r.txn.id) + '">' + CBE.icon('share', { size: 18 }) + U.esc(t('share')) + '</button>' +
            '</div>' +
            '<button class="btn btn-ghost" data-action="goHome">' + U.esc(t('close')) + '</button>' +
          '</div>' +
        '</div>' +
      '</section>';
    }
  });

  /* -------------------------------------------------------- full receipt */
  function row(k, v, cls) {
    return '<div class="pdf-row' + (cls ? ' ' + cls : '') + '"><span class="k">' + U.esc(k) + '</span><span class="v">' + U.esc(v) + '</span></div>';
  }

  function paperHTML(r, opts) {
    opts = opts || {};
    var meta = CBE.state.receiptMeta;
    var st = CBE.state;
    var f = CBE.fees(r.amount, r.charges);
    var mask = function (v) {
      var d = String(v || '').replace(/\D/g, '');
      return d.length > 4 ? d.slice(0, 1) + '***' + d.slice(-4) : v;
    };
    return '<div class="pdf-page">' +
      '<div class="pdf-head">' +
        '<h1>' + U.esc(meta.company) + '</h1>' +
        '<div class="r">' + U.esc(t('customerReceipt')) + '</div>' +
        '<div class="s">Status: ' + U.esc(t('completed')) + '</div>' +
      '</div>' +
      '<div class="pdf-cols">' +
        '<div>' +
          '<div class="pdf-h" style="padding-left:0">' + U.esc(t('companyInfo')) + '</div>' +
          row(t('country'), meta.country) +
          row(t('city'), meta.city) +
          row(t('address'), meta.address) +
          row('Post code', meta.postal) +
          row('SWIFT Code', meta.swift) +
          row(t('email'), meta.email) +
          row(t('tel'), meta.tel) +
          row(t('fax'), meta.fax) +
          row('Tin', meta.tin) +
          row('VAT Receipt No', r.ref) +
          row('VAT Registration No', meta.vatRegNo) +
          row('VAT Registration Date', meta.vatRegDate) +
        '</div>' +
        '<div>' +
          '<div class="pdf-h" style="padding-left:0">' + U.esc(t('customerInfo')) + '</div>' +
          row(t('customerName'), r.senderName) +
          row(t('region'), '-') +
          row(t('city'), '-') +
          row(t('subCity'), '-') +
          row(t('wereda'), '-') +
          row('VAT Registration No', '-') +
          row('VAT Registration Date', '-') +
          row('TIN (TAX ID)', '-') +
          row(t('branchLabel'), '-') +
        '</div>' +
      '</div>' +
      '<div class="pdf-band" style="text-align:center">' + U.esc('Payment / Transaction Informations') + '</div>' +
      '<div class="pdf-table">' +
        row(t('payer'), r.senderName) +
        row(t('account'), mask(r.senderAccount)) +
        row(t('receiver'), (r.receiverName + ' ' + shortRef(r)).trim()) +
        row(t('account'), mask(r.receiverAccountRaw || r.receiverAccount)) +
        row(t('paymentType'), r.paymentType || 'A2A') +
        row(t('paymentDateTime'), U.longDate(r.date)) +
        row(t('referenceNo'), r.ref, 'head') +
        row(t('reasonType'), r.remark) +
        row(t('transferredAmount'), U.money(f.total - f.sc - f.vat - f.drf) + ' ETB', 'head') +
        row(t('serviceCharge'), U.money(f.sc) + ' ETB') +
        row('VAT (' + CBE.state.feeCfg.vatPct + '% of service charge)', U.money(f.vat) + ' ETB') +
        row('Disaster Risk Response Fund (' + CBE.state.feeCfg.drfPct + '% of service charge)', U.money(f.drf) + ' ETB') +
        row(t('totalDebited'), U.money(f.total) + ' ETB', 'head') +
        '<img class="pdf-stamp" src="' + (opts.absolute ? '' : '') + 'assets/img/bank-stamp.png" alt="">' +
      '</div>' +
      '<div class="pdf-words">' +
        '<div class="w">' + U.esc(t('amountInWord')) + '<b>' + U.esc(U.amountInWords(r.amount)) + '</b></div>' +
        '<img src="' + CBE.qr.dataUrl(r.ref + '|' + r.amount.toFixed(2), { modules: 29 }) + '" alt="QR code">' +
      '</div>' +
      '<div class="pdf-foot"><b>' + U.esc(t('bankRelyOn')) + '</b>' + U.esc(t('allRights')) + '</div>' +
    '</div>';
  }

  CBE.define('receiptPaper', {
    render: function (p) {
      var r = CBE.receiptOf(p.id);
      if (!r) return '<section class="screen"><div class="screen-body no-nav">' + U.emptyState(t('noResults')) + '</div></section>';
      return '<section class="screen" style="background:#e9e7ee">' +
        '<div class="screen-body no-nav">' +
          U.appbar(t('customerReceipt'), { right: '' }) +
          '<div class="pdf-wrap" style="margin-top:16px">' + paperHTML(r) + '</div>' +
          '<div class="pdf-actions">' +
            '<button class="btn btn-primary" data-action="downloadReceipt" data-value="' + U.esc(r.txn.id) + '">' +
              U.esc(t('downloadPdf')) + '</button>' +
            '<button class="btn btn-soft" style="margin-top:12px" data-action="printReceipt" data-value="' + U.esc(r.txn.id) + '">' +
              U.esc(t('printReceipt')) + '</button>' +
          '</div>' +
        '</div>' +
      '</section>';
    }
  });

  /* ------------------------------------------------------------- download */
  var PAPER_CSS = [
    '*{box-sizing:border-box}',
    'body{margin:0;background:#e9e7ee;font:400 15px/1.45 Inter,Segoe UI,system-ui,sans-serif;color:#20232b}',
    '.pdf-page{max-width:820px;margin:24px auto;background:#fff;font-size:13px;line-height:1.45;box-shadow:0 8px 30px rgba(0,0,0,.14)}',
    '.pdf-head{background:linear-gradient(112deg,#8a2fd0,#5d1793);color:#fff;padding:16px 18px 12px;text-align:center}',
    '.pdf-head h1{font-size:19px;margin:0;font-weight:700}',
    '.pdf-head .r{font-size:12px;opacity:.92;margin-top:4px}',
    '.pdf-head .s{font-size:12px;font-weight:700;margin-top:4px}',
    '.pdf-band{background:#ece3f7;padding:8px 18px;font-size:13px;font-weight:700;color:#3f0f68}',
    '.pdf-cols{display:grid;grid-template-columns:1fr 1fr;padding:6px 0}',
    '.pdf-cols>div{padding:10px 16px}',
    '.pdf-cols>div:first-child{border-right:1px solid #e7e6ec}',
    '.pdf-h{font-size:12px;font-weight:700;color:#5b6472;padding:6px 16px 6px 0}',
    '.pdf-row{display:flex;gap:10px;padding:3px 16px;font-size:12px}',
    '.pdf-row .k{color:#6b7280}',
    '.pdf-row .v{font-weight:600;color:#20232b;margin-left:auto;text-align:right}',
    '.pdf-row.head .k,.pdf-row.head .v{font-weight:700}',
    '.pdf-table{position:relative;padding:6px 0}',
    '.pdf-stamp{position:absolute;left:50%;top:52%;width:180px;height:180px;transform:translate(-50%,-50%) rotate(-14deg);opacity:.85}',
    '.pdf-words{display:flex;align-items:center;gap:16px;padding:14px 16px;border-top:1px solid #e7e6ec}',
    '.pdf-words .w{flex:1;font-size:12px;color:#6b7280}',
    '.pdf-words .w b{display:block;font-size:13px;color:#20232b;margin-top:4px}',
    '.pdf-words img{width:110px;height:110px}',
    '.pdf-foot{text-align:center;font-size:11.5px;color:#6b7280;padding:12px 16px 18px;border-top:1px solid #e7e6ec}',
    '.pdf-foot b{display:block;font-size:13px;color:#20232b;margin-bottom:4px}',
    '@media print{body{background:#fff}.pdf-page{box-shadow:none;margin:0;max-width:none}}'
  ].join('\n');

  function paperDocument(r) {
    var body = paperHTML(r).replace('src="assets/img/bank-stamp.png"', 'src="' + stampDataUrl() + '"');
    return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>Customer Receipt ' + U.esc(r.ref) + '</title><style>' + PAPER_CSS + '</style></head>' +
      '<body>' + body + '</body></html>';
  }

  var stampCache = null;
  function stampDataUrl() {
    if (stampCache) return stampCache;
    try {
      var img = document.querySelector('img[src$="bank-stamp.png"]');
      if (img && img.complete && img.naturalWidth) {
        var c = document.createElement('canvas');
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        c.getContext('2d').drawImage(img, 0, 0);
        stampCache = c.toDataURL('image/png');
        return stampCache;
      }
    } catch (e) { /* canvas unavailable */ }
    return 'assets/img/bank-stamp.png';
  }

  function download(name, text, mime) {
    var blob = new Blob([text], { type: mime || 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  CBE.receiptActions = {
    open: function (id) { CBE.nav('receiptPaper', { id: id }); },
    download: function (id) {
      var r = CBE.receiptOf(id);
      if (!r) return;
      download('cbe-receipt-' + r.ref + '.html', paperDocument(r));
      U.toast('Receipt downloaded');
    },
    print: function (id) {
      var r = CBE.receiptOf(id);
      if (!r) return;
      var frame = document.createElement('iframe');
      frame.setAttribute('aria-hidden', 'true');
      frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
      document.body.appendChild(frame);
      var doc = frame.contentWindow.document;
      doc.open(); doc.write(paperDocument(r)); doc.close();
      setTimeout(function () {
        try { frame.contentWindow.focus(); frame.contentWindow.print(); }
        catch (e) { U.toast('Printing is not available here'); }
        setTimeout(function () { document.body.removeChild(frame); }, 1500);
      }, 350);
    },
    share: function (id) {
      var r = CBE.receiptOf(id);
      if (!r) return;
      var text = 'CBE receipt ' + r.ref + ' — ETB ' + U.money(r.amount) + ' to ' + r.receiverName +
        ' on ' + U.longDate(r.date) + '. Total debited ETB ' + U.money(CBE.fees(r.amount, r.charges).total) + '.';
      if (global.navigator && navigator.share) {
        navigator.share({ title: 'CBE Mobile Banking receipt', text: text }).catch(function () { });
      } else {
        U.copy(text, 'Receipt details copied');
      }
    }
  };
})(typeof window !== 'undefined' ? window : this);
