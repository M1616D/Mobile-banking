/* ==========================================================================
   receipt.js — every receipt surface: the in-app success receipt (recite pic),
   the clean downloaded receipt and the full Customer Receipt with the bank
   stamp centred on the payment table.
   ========================================================================== */
(function (global) {
  'use strict';

  var CBE = global.CBE || (global.CBE = {});
  var h = CBE.h, icon = CBE.icon, raw = CBE.raw;
  var st = CBE.state;

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function recDate(ts) {
    var d = new Date(ts);
    var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var hr = d.getHours();
    var ap = hr >= 12 ? 'PM' : 'AM';
    hr = hr % 12; if (!hr) hr = 12;
    return MON[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + ' ' + pad2(hr) + ':' + pad2(d.getMinutes()) + ' ' + ap;
  }

  function recDateLong(ts) {
    var d = new Date(ts);
    var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var hr = d.getHours();
    var ap = hr >= 12 ? 'PM' : 'AM';
    hr = hr % 12; if (!hr) hr = 12;
    return MON[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + ', ' + hr + ':' + pad2(d.getMinutes()) + ' ' + ap;
  }

  function summaryText(r) {
    return h`ETB ${CBE.money(r.amount)} has been debited from ${r.senderName} ETB-${CBE.last4(r.senderAccount)} for ${r.receiverName} ETB-${CBE.last4(r.receiverAccount)} on ${recDate(r.date)} with transaction ID: ${r.ref}. Reason: ${r.reason} Total Amount Debited: ETB${CBE.money(r.total)} with Service Charge of ETB${CBE.money(r.service)}, VAT (${st.fees.vat}%) of ETB${CBE.money(r.vat)} and Disaster Recovery (${st.fees.drf}%) of ETB${CBE.money(r.drf)}.`;
  }

  function qrUrl(r) { return 'https://breciept.cbe.com.et/' + r.ref; }

  function brandBlock(inline) {
    var mark = '<img src="img/cbe-logo.png" alt="" width="34" height="34">';
    if (inline) {
      return h`<div class="rec-brand rec-brand--inline">
        ${raw(mark)}
        <span style="text-align:left">
          <b style="display:block;font-family:var(--font-sans);font-size:12.5px;color:#2c3340">${st.letterhead.company}</b>
          <small>${st.letterhead.tagline}</small>
        </span>
      </div>`;
    }
    return h`<div class="rec-brand">
      ${raw(mark)}
      <b>${st.letterhead.amharic}</b>
      <small>${st.letterhead.tagline}</small>
    </div>`;
  }

  /* --------------------------------------------------------- receipt card body */
  function cardBody(r, opts) {
    opts = opts || {};
    return h`
      <div class="rec-box">
        <div class="rec-box__title">Transaction Summary</div>
        <div class="rec-box__text">${summaryText(r)}</div>
        <div class="rec-box__qr">${raw(CBE.qrSvg(qrUrl(r), 138, 'M'))}</div>
      </div>
      ${opts.noBrand ? '' : raw(brandBlock(opts.inlineBrand))}`;
  }

  /* ============================================ in-app success receipt (recite pic) */
  CBE.define('receipt', function (p) {
    var r = CBE.store.findReceipt(p.id) || st.receipts[0];
    if (!r) {
      return { appbar: CBE.appbar({ title: 'Receipt' }), nav: '', body: '<div class="empty-state">No receipt to show.</div>' };
    }
    var viewing = !!p.view;

    var head = h`
        <div class="thanks__head">
          <div class="thanks__head-row">
            <span>${raw('<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.4 19 6.2v5.6c0 4.3-3 8-7 9.2-4-1.2-7-4.9-7-9.2V6.2Z"/><path d="M8.8 12.2 11 14.4l4.2-4.4"/></svg>')}</span>
            <span>
              <b>Thank you</b>
              <small>Success</small>
            </span>
            <button class="icon-btn thanks__cam" data-a="go" data-go="scanner" aria-label="Scan">${raw(icon('camera', 23))}</button>
          </div>
        </div>`;

    return {
      appbar: viewing ? CBE.appbar({ title: 'Receipt' }) : false,
      nav: '',
      screenClass: 'thanks is-guarded',
      bodyClass: 'screen-body--flush',
      body: h`
        ${raw(viewing ? '' : head)}
        <div class="thanks__sheet">
          <div class="thanks__badge">${raw('<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.6 9.6 17.2 19 7.6"/></svg>')}</div>
          <div class="thanks__line">Transaction Completed Successfully!</div>
          ${raw(cardBody(r))}
          <div class="rec-actions">
            <button data-a="openFullReceipt" data-id="${r.id}">${raw(icon('receipt', 21))}<span>Receipt</span></button>
            <button data-a="screenshot">${raw(icon('screenshot', 21))}<span>Screenshot</span></button>
            <button data-a="shareReceipt" data-id="${r.id}">${raw(icon('share', 21))}<span>Share</span></button>
          </div>
          ${viewing
            ? raw(h`<div class="rec-actions" style="margin-top:6px">
                <button data-a="downloadReceipt" data-id="${r.id}">${raw(icon('download', 21))}<span>Download</span></button>
                <button data-a="editReceipt" data-id="${r.id}">${raw(icon('doc', 21))}<span>Edit</span></button>
                <button data-a="printReceipt" data-id="${r.id}">${raw(icon('printer', 21))}<span>Print</span></button>
              </div>`)
            : ''}
          <button class="rec-close" data-a="receiptClose">Close</button>
        </div>`
    };
  });

  /* ============================================= downloaded receipt (clean card) */
  CBE.define('dlReceipt', function (p) {
    var r = CBE.store.findReceipt(p.id) || st.receipts[0];
    if (!r) return { appbar: CBE.appbar({ title: 'Receipt' }), body: '<div class="empty-state">No receipt.</div>' };
    return {
      appbar: CBE.appbar({ title: 'Downloaded Receipt' }),
      nav: '',
      screenClass: 'dl-wrap is-guarded',
      bodyClass: 'dl-wrap',
      body: h`
        <div class="dl-sheet">
          <div class="thanks__head" style="padding:20px 20px 42px">
            <div class="thanks__head-row">
              <span>${raw('<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.4 19 6.2v5.6c0 4.3-3 8-7 9.2-4-1.2-7-4.9-7-9.2V6.2Z"/><path d="M8.8 12.2 11 14.4l4.2-4.4"/></svg>')}</span>
              <span><b>Thank you</b><small>Success</small></span>
            </div>
          </div>
          <div style="padding:0 18px 18px;background:#fbfaff">
            <div class="thanks__badge" style="margin-top:-42px">${raw('<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.6 9.6 17.2 19 7.6"/></svg>')}</div>
            <div class="thanks__line">Transaction Completed Successfully!</div>
            ${raw(cardBody(r, { inlineBrand: true }))}
          </div>
        </div>
        <div class="btn-stack" style="margin-top:16px">
          <button class="btn btn--primary" data-a="downloadReceipt" data-id="${r.id}">${raw(icon('download', 20))} Download</button>
          <button class="btn btn--ghost" data-a="printReceipt" data-id="${r.id}">${raw(icon('printer', 20))} Print</button>
        </div>`
    };
  });

  /* ================================== the big Customer Receipt (breciept.cbe.com.et) */
  function pdfRows(r) {
    return [
      ['Payer:', r.senderName],
      ['Account:', CBE.maskAcct(r.senderAccount, 5)],
      ['Receiver:', r.receiverName],
      ['Account:', CBE.maskAcct(r.receiverAccount, 5)],
      ['Payment Type:', r.payType || 'A2A'],
      ['Payment Date & Time:', recDateLong(r.date)],
      ['Reference No. (VAT Invoice No):', r.ref],
      ['Reason / Type of service:', r.reason],
      ['Transferred Amount:', CBE.money(r.amount) + ' ETB'],
      ['Service Charge:', CBE.money(r.service) + ' ETB'],
      ['VAT (' + st.fees.vat + '% of service charge):', CBE.money(r.vat) + ' ETB'],
      ['Disaster Risk Response Fund (' + st.fees.drf + '% of service charge):', CBE.money(r.drf) + ' ETB']
    ];
  }

  function companyRows(r) {
    return [
      ['Country:', 'Ethiopia'], ['City:', 'Addis Ababa'],
      ['Address:', 'Ras Desta Damtew St, 01, Kirkos'], ['Postal code:', '255'],
      ['SWIFT Code:', 'CBETETAA'], ['Email:', 'info@cbe.com.et'],
      ['Tel:', '+251-551-50-04'], ['Fax:', '+251-551-45-22'],
      ['Tin:', '0000006966'], ['VAT Receipt No:', r.ref],
      ['VAT Registration No:', '011140'], ['VAT Registration Date:', '01/01/2003']
    ];
  }

  function customerRows() {
    return [
      ['Customer Name:', st.holder.name], ['Region:', st.holder.region || '-'],
      ['City:', st.holder.city || 'Addis Ababa'], ['Sub City:', st.holder.subCity || '-'],
      ['Wereda/Kebele:', '-'], ['VAT Registration No:', '-'],
      ['VAT Registration Date:', '-'], ['TIN (TAX ID):', st.holder.tin || '0000000000'],
      ['Branch:', '-']
    ];
  }

  function pair(name, value) {
    return h`<div class="pdf__kv"><span>${name}</span><b>${value}</b></div>`;
  }

  function pdfPage(r) {
    var rows = pdfRows(r);
    return h`
      <div class="pdf__page" id="pdfPage">
        <div class="pdf__head">
          <span class="pdf__head-mark"><img src="img/cbe-logo.png" alt=""></span>
          <span class="pdf__head-text">
            <b>${st.letterhead.company}</b>
            <small>Customer Receipt</small>
            <i>Status: ${r.status}</i>
          </span>
        </div>
        <div class="pdf__grid">
          <div>
            <div class="pdf__col-title">Company Address &amp; Other Information</div>
            ${raw(companyRows(r).map(function (kv) { return pair(kv[0], kv[1]); }).join(''))}
          </div>
          <div>
            <div class="pdf__col-title">Customer Information</div>
            ${raw(customerRows().map(function (kv) { return pair(kv[0], kv[1]); }).join(''))}
          </div>
        </div>
        <div class="pdf__section">
          <div class="pdf__section-title">Payment / Transaction Informations</div>
          <img class="pdf__stamp" src="img/bank-stamp.png" alt="">
          ${raw(rows.map(function (kv) {
            return h`<div class="pdf__row"><span>${kv[0]}</span><b>${kv[1]}</b></div>`;
          }).join(''))}
          <div class="pdf__row pdf__row--strong" style="border-bottom:0;padding-top:8px">
            <span style="color:#222;font-weight:700">Total amount debited from customer's account:</span>
            <b>${CBE.money(r.total)} ETB</b>
          </div>
        </div>
        <div class="pdf__word">
          <div class="pdf__word-text">
            <b>Amount in Word:</b>
            ${CBE.words(r.total)}
          </div>
          <div class="pdf__word-qr">${raw(CBE.qrSvg(qrUrl(r), 62, 'L'))}</div>
        </div>
        <div class="pdf__foot">
          <b>The Bank you can always rely on.</b>
          \u00a9 2026 ${st.letterhead.company}. All rights reserved.
        </div>
      </div>`;
  }

  CBE.define('fullReceipt', function (p) {
    var r = CBE.store.findReceipt(p.id) || st.receipts[0];
    if (!r) return { appbar: CBE.appbar({ title: 'Receipt' }), body: '<div class="empty-state">No receipt.</div>' };
    return {
      appbar: CBE.appbar({ title: 'Customer Receipt' }),
      nav: '',
      screenClass: 'is-guarded',
      bodyClass: 'pdf',
      body: h`
        ${raw(pdfPage(r))}
        <button class="pdf__dl" data-a="downloadReceipt" data-id="${r.id}" style="height:38px;width:auto;padding:0 18px;font-size:13px;border-radius:var(--r-full)">Download PDF</button>`
    };
  });

  /* ------------------------------------------------- standalone offline file */
  function standalone(r) {
    var css = [
      'body{margin:0;background:#e9e9ee;font:400 12px/1.4 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#222}',
      '.wrap{max-width:640px;margin:0 auto;background:#fff}',
      '.head{display:flex;align-items:center;gap:8px;padding:10px 12px;background:#6b1cae;color:#fff}',
      '.head img{width:30px;height:30px;background:#fff;border-radius:3px;padding:3px}',
      '.head .t{flex:1;text-align:center;margin-left:-40px}',
      '.head b{display:block;font-size:14px}.head small{display:block;font-size:11.5px}.head i{display:block;font-size:10px}',
      '.grid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px;padding:10px 12px 0}',
      '.ct{font-size:11px;font-weight:700;padding-bottom:5px}',
      '.kv{display:flex;gap:8px;padding:2px 0;font-size:10.5px}',
      '.kv span{flex:none;color:#444}.kv b{flex:1;font-weight:500;text-align:right}',
      '.sec{position:relative;padding:0 12px;margin-top:14px}',
      '.sec h3{margin:0;padding:6px 0 9px;font-size:12px;text-align:center}',
      '.row{display:flex;gap:10px;padding:5px 0;border-bottom:1px solid #ececf0;font-size:10.5px}',
      '.row span{flex:1;color:#333}.row b{flex:none;font-weight:700;text-align:right}',
      '.stamp{position:absolute;left:50%;top:49%;width:150px;transform:translate(-50%,-50%);opacity:.88}',
      '.word{display:flex;align-items:center;gap:12px;margin:12px;padding:8px 10px;background:#f0eff3;border-radius:3px}',
      '.word .wt{flex:1;text-align:center;font-size:10px}.word .wt b{display:block}',
      '.foot{padding:12px;text-align:center;font-size:9.5px;color:#555}.foot b{display:block;color:#222;font-size:10px}',
      '.thanks{background:#6b1cae;color:#fff;padding:16px 20px}',
      '.thanks b{font-size:17px}.thanks small{opacity:.8}',
      '.thanks .badge{display:grid;place-items:center;width:78px;height:78px;margin:-40px auto 0;border:4px solid #fff;border-radius:50%;background:#6b1cae;font-size:38px}',
      '.sheet{background:#fbfaff;padding:0 18px 22px;border-radius:26px 26px 0 0;margin-top:-36px}',
      '.box{margin-top:14px;padding:12px;background:#f1f0f6;border-radius:12px}',
      '.box h4{margin:0;font-size:13px;color:#8f95a0;font-weight:400}',
      '.box p{margin:9px 0 0;font-size:13.5px;line-height:1.55;color:#23282f}',
      '.qrm{display:flex;justify-content:center;margin-top:14px}',
      '.brand{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:16px}',
      '.brand img{width:32px;height:32px}.brand b{font-size:12px}.brand small{color:#555}'
    ].join('');

    var qr = CBE.qrSvg(qrUrl(r), 150, 'M');
    var body = '<div class="wrap">' +
      '<div class="head"><img src="img/cbe-logo.png" alt=""><span class="t"><b>' + CBE.esc(st.letterhead.company) +
      '</b><small>Customer Receipt</small><i>Status: ' + CBE.esc(r.status) + '</i></span></div>' +
      '<div class="grid"><div><div class="ct">Company Address &amp; Other Information</div>' +
      companyRows(r).map(function (kv) { return '<div class="kv"><span>' + kv[0] + '</span><b>' + CBE.esc(kv[1]) + '</b></div>'; }).join('') +
      '</div><div><div class="ct">Customer Information</div>' +
      customerRows().map(function (kv) { return '<div class="kv"><span>' + kv[0] + '</span><b>' + CBE.esc(kv[1]) + '</b></div>'; }).join('') +
      '</div></div>' +
      '<div class="sec"><h3>Payment / Transaction Informations</h3>' +
      '<img class="stamp" src="img/bank-stamp.png" alt="">' +
      pdfRows(r).map(function (kv) { return '<div class="row"><span>' + kv[0] + '</span><b>' + CBE.esc(kv[1]) + '</b></div>'; }).join('') +
      '<div class="row" style="border:0"><span style="font-weight:700">Total amount debited from customer\'s account:</span><b>' + CBE.money(r.total) + ' ETB</b></div>' +
      '</div>' +
      '<div class="word"><div class="wt"><b>Amount in Word:</b>' + CBE.esc(CBE.words(r.total)) + '</div><div>' + qr + '</div></div>' +
      '<div class="foot"><b>The Bank you can always rely on.</b>\u00a9 2026 ' + CBE.esc(st.letterhead.company) + '. All rights reserved.</div>' +
      '</div>';

    return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>Customer Receipt ' + CBE.esc(r.ref) + '</title><style>' + css + '</style></head><body>' + body + '</body></html>';
  }

  function download(name, text, type) {
    try {
      var blob = new Blob([text], { type: type || 'text/html;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
      return true;
    } catch (e) {
      CBE.toast('Download failed');
      return false;
    }
  }

  function print(html) {
    var frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(frame);
    var doc = frame.contentDocument;
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(function () {
      try { frame.contentWindow.focus(); frame.contentWindow.print(); } catch (e) { /* blocked */ }
      setTimeout(function () { frame.remove(); }, 800);
    }, 260);
  }

  CBE.receipt = {
    cardBody: cardBody,
    summaryText: summaryText,
    qrUrl: qrUrl,
    pdfPage: pdfPage,
    standalone: standalone,
    download: download,
    print: print,
    recDate: recDate,
    recDateLong: recDateLong
  };
})(typeof window !== 'undefined' ? window : this);
