/* CBE Mobile Banking — receipt screens: success, saved, full customer receipt */
(function () {
  const U = CBE.util;

  function drawQr(canvasId, text) {
    setTimeout(() => {
      const cv = document.getElementById(canvasId);
      if (cv && CBE.qr) {
        try { CBE.qr.draw(cv, text, 300); } catch (e) { console.warn('qr', e); }
      }
    }, 30);
  }

  CBE.router.on('receipt', function (p) {
    const r = p;
    drawQr('rcptQr', 'CBE|' + r.id + '|' + r.total + 'ETB|' + r.fromAcc + '>' + r.toAcc);
    return CBE.ui.el(
      '<div class="page rcpt-page is-guarded" data-screen="receipt">' +
      '<div class="rcpt-hero">' +
      '<span class="ok-badge" style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.16);display:grid;place-items:center">' + CBE.icon('check', 22) + '</span>' +
      '<div><div class="t1">Thank you</div><div class="t2">Success</div></div>' +
      '<button class="right" data-a="rcptShot" style="color:#fff">' + CBE.icon('screenshot', 22) + '</button>' +
      '</div>' +
      '<div class="scroll">' +
      '<div class="rcpt-body">' +
      '<div class="pop-wrap" style="padding-top:0"><span class="pop">' + CBE.icon('check', 42) + '</span></div>' +
      '<div class="ok-t">Transaction Completed Successfully!</div>' +
      '<div class="rcpt-summary">' +
      'ETB <b>' + U.fmt(r.amount) + '</b> has been debited from <b>' + U.esc(r.fromName) + '</b> ETB-' + U.esc(r.fromAcc.slice(-4)) +
      ' for <b>' + U.esc(r.toName) + '</b> ETB-' + U.esc(r.toAcc.slice(-4)) + ' on <b>' + U.esc(r.stamp) + '</b>' +
      ' with transaction ID: <b>' + U.esc(r.id) + '</b>. Reason: ' + U.esc(r.remark) + '<br>' +
      'Total Amount Debited: <b>ETB' + U.fmt(r.total) + '</b> with Service Charge of <b>ETB' + U.fmt(r.service) +
      '</b>, VAT (15%) of <b>ETB' + U.fmt(r.vat) + '</b> and Disaster Recovery (5%) of <b>ETB' + U.fmt(r.drf) + '</b>.' +
      '</div>' +
      '<div class="rcpt-qr"><canvas id="rcptQr"></canvas></div>' +
      '<div class="rcpt-foot">' +
      '<img class="mark" src="img/cbe-mark.png" alt="">' +
      '<div class="fx"><div class="amh">\u12d5\u1295\u1275\u12cd\u1260\u1295 \u1263\u1295\u12ad \u12a2\u1275\u12ee\u1335\u12eb</div><div class="en">The bank you can always rely on!</div></div>' +
      '</div>' +
      '</div>' +
      '<div class="rcpt-actions">' +
      '<button class="rc-act primary" data-a="rcptFull"><span class="ic">' + CBE.icon('doc', 20) + '</span>Receipt</button>' +
      '<button class="rc-act" data-a="rcptShot"><span class="ic">' + CBE.icon('screenshot', 20) + '</span>Screenshot</button>' +
      '<button class="rc-act" data-a="soonToast" data-t="Receipt shared"><span class="ic">' + CBE.icon('share', 20) + '</span>Share</button>' +
      '</div>' +
      '<div style="text-align:center;padding-bottom:calc(20px + var(--sab))"><button class="btn ghost" style="width:200px" data-a="rcptClose">Close</button></div>' +
      '</div>' +
      '</div>'
    );
  });

  // "screenshot" version: a flat saved image look
  CBE.router.on('savedReceipt', function (p) {
    const r = p;
    drawQr('rcptQr2', 'CBE|' + r.id + '|' + r.total + 'ETB|' + r.fromAcc + '>' + r.toAcc);
    return CBE.ui.el(
      '<div class="page is-guarded" data-screen="savedReceipt">' +
      '<div class="appbar"><button class="back" data-a="back">' + CBE.icon('back', 22) + '</button><h1>Saved Receipt</h1></div>' +
      '<div class="scroll"><div class="saved-wrap">' +
      '<div class="saved-card">' +
      '<div class="ok-mark">' + CBE.icon('check', 30) + '</div>' +
      '<div style="font-size:19px;font-weight:800">Thank you</div>' +
      '<div style="font-size:13px;color:var(--green);font-weight:800;margin-top:2px">Success</div>' +
      '<div style="margin:16px 0 6px;font-weight:800;font-size:14px">Transaction Completed Successfully!</div>' +
      '<div class="rcpt-summary" style="margin-top:12px">' +
      'ETB <b>' + U.fmt(r.amount) + '</b> has been debited from <b>' + U.esc(r.fromName) + '</b> ETB-' + U.esc(r.fromAcc.slice(-4)) +
      ' for <b>' + U.esc(r.toName) + '</b> ETB-' + U.esc(r.toAcc.slice(-4)) + ' on <b>' + U.esc(r.stamp) + '</b>' +
      ' with transaction ID: <b>' + U.esc(r.id) + '</b>. Reason: ' + U.esc(r.remark) + '<br>' +
      'Total Amount Debited: <b>ETB' + U.fmt(r.total) + '</b> with Service Charge of <b>ETB' + U.fmt(r.service) +
      '</b>, VAT (15%) of <b>ETB' + U.fmt(r.vat) + '</b> and Disaster Recovery (5%) of <b>ETB' + U.fmt(r.drf) + '</b>.' +
      '</div>' +
      '<div class="rcpt-qr"><canvas id="rcptQr2"></canvas></div>' +
      '<div class="rcpt-foot" style="border-top:1px solid var(--line);margin-top:10px;padding-top:14px">' +
      '<img class="mark" src="img/cbe-mark.png" alt="">' +
      '<div class="fx"><div class="amh">\u12d5\u1295\u1275\u12cd\u1260\u1295 \u1263\u1295\u12ad \u12a2\u1275\u12ee\u1335\u12eb</div><div class="en">The bank you can always rely on!</div></div>' +
      '</div>' +
      '</div>' +
      '<div style="text-align:center;margin-top:16px;color:var(--ink-3);font-size:11.5px">Screenshot saved to your gallery \u00b7 ' + U.esc(r.stamp) + '</div>' +
      '</div></div></div>'
    );
  });

  function fr(label, value, wide) {
    if (wide) return '<div class="fr wide"><span class="k">' + label + '</span><span class="v">' + value + '</span></div>';
    return '<div class="fr"><span class="k">' + label + '</span><span class="v">' + value + '</span></div>';
  }

  // full Customer Receipt (paper style) — exact structure of the ui/ reference
  CBE.router.on('fullReceipt', function (p) {
    const r = p;
    const el = CBE.ui.el(
      '<div class="page is-guarded" data-screen="fullReceipt">' +
      '<div class="appbar"><button class="back" data-a="back">' + CBE.icon('back', 22) + '</button><h1>Customer Receipt</h1></div>' +
      '<div class="scroll"><div class="frcpt-wrap">' +
      '<div class="frcpt">' +
      '<div class="hd">' +
      '<img src="img/cbe-mark.png" alt="">' +
      '<div class="t1">Commercial Bank of Ethiopia</div>' +
      '<div class="t2">Customer Receipt</div>' +
      '<div class="st">Status: COMPLETED</div>' +
      '</div>' +

      '<h5>Company Address &amp; Other Information</h5>' +
      '<div class="two">' +
      '<div>' +
      fr('Country:', 'Ethiopia') +
      fr('City:', 'Addis Ababa') +
      fr('Address:', 'Ras Desta Damtew St, 01,') +
      fr('Sub City:', 'Kirkos') +
      fr('Postal code:', '255') +
      fr('SWIFT Code:', 'CBETETAA') +
      fr('Email:', 'info@cbe.com.et') +
      fr('Tel:', '+251-551-50-04') +
      fr('Fax:', '+251-551-45-22') +
      fr('Tin:', '0000006966') +
      fr('VAT Receipt No:', U.esc(r.id)) +
      fr('VAT Registration No:', '011140') +
      fr('VAT Registration Date:', '01/01/2003') +
      '</div>' +
      '<div>' +
      fr('Customer Name:', U.esc(r.fromName)) +
      fr('Region:', 'Kirkos') +
      fr('City:', 'Addis Ababa') +
      fr('Sub City:', 'Kirkos') +
      fr('Wereda/Kebele:', '01/03') +
      fr('VAT Registration No:', '011140') +
      fr('VAT Registration Date:', '01/01/2003') +
      fr('TIN (TAX ID):', '0000006966') +
      fr('Branch:', 'Kirkos Branch') +
      '</div>' +
      '</div>' +

      '<h5>Payment / Transaction Informations</h5>' +
      fr('Payer:', U.esc(r.fromName)) +
      fr('Account:', U.esc(r.fromAcc.slice(0, 1)) + '****' + U.esc(r.fromAcc.slice(-4))) +
      fr('Receiver:', U.esc(r.toName)) +
      fr('Account:', U.esc(r.toAcc.slice(0, 1)) + '****' + U.esc(r.toAcc.slice(-4))) +
      fr('Payment Type:', 'A2A') +
      fr('Payment Date &amp; Time:', U.esc(r.stamp)) +
      fr('Reference No. (VAT Invoice No):', U.esc(r.id)) +
      fr('Reason / Type of service:', U.esc(r.remark)) +
      fr('Transferred Amount:', U.fmt(r.amount) + ' ETB') +
      fr('Service Charge:', U.fmt(r.service) + ' ETB') +
      fr('VAT (15% of service charge):', U.fmt(r.vat) + ' ETB') +
      fr('Disaster Risk Response Fund (5% of service charge):', U.fmt(r.drf) + ' ETB') +
      fr('Total amount debited from customer\u2019s account:', U.fmt(r.total) + ' ETB') +

      '<div class="amt-word"><b>Amount in Word:</b>' + U.esc(U.amountWords(r.total)) + '</div>' +

      '<div class="foot">' +
      'The Bank you can always rely on.<br>' +
      '\u00a92026 Commercial Bank of Ethiopia. All rights reserved.' +
      '</div>' +
      '</div>' +
      '<div class="dl-wrap"><button class="dl-btn" data-a="rcptDownload">Download PDF</button></div>' +
      '</div></div></div>'
    );
    return el;
  });

  CBE.router.on('receiptsHub', function () {
    const rows = CBE.state.receipts.map(r =>
      CBE.ui.rowItem({
        t: r.toName, s: 'ETB ' + U.fmt(r.amount) + ' \u00b7 ' + r.stamp, ic: 'bookmark',
        a: 'openReceipt', data: ' data-id="' + U.esc(r.id) + '"'
      })
    ).join('');
    return CBE.ui.page({title: 'Receipts', back: true},
      rows
        ? '<div class="rows-sec"><div class="rows">' + rows + '</div></div>'
        : '<div class="empty"><span class="ic" style="width:74px;height:74px;border-radius:50%;background:var(--purple-50);color:var(--purple);display:grid;place-items:center">' + CBE.icon('bookmark', 30) + '</span><div class="big">No receipts yet</div><p>Receipts of your transfers will appear here after you send money.</p></div>'
    );
  });
})();
