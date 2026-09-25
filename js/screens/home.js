/* CBE Mobile Banking — home, drawer, notifications, transactions, scan & receive */
(function () {
  const U = CBE.util;

  CBE.router.on('home', function () {
    const S = CBE.state;
    const hide = S.settings.hideBalance;
    const bal = hide ? '******' : U.fmt(S.balance);
    const accTail = U.esc(S.account.number.slice(-4));

    const quick = [
      ['miniStatement', 'doc', 'Mini<br>Statement'],
      ['cashOut', 'cash', 'Cash Out'],
      ['billShare', 'share', 'Bill Share'],
      ['cards', 'card', 'Cards'],
      ['schedules', 'calendar', 'Schedules'],
      ['receiptsHub', 'bookmark', 'Receipt']
    ];

    const grid = [
      ['cbeTransfer', 'send', 'purple', 'CBE Transfer', 'Send Money'],
      ['receive', 'receive', 'green', 'Receive', 'Get Paid'],
      ['airtime', 'phone', 'orange', 'Airtime', ''],
      ['otherTransfers', 'swap', 'teal', 'Other Transfers', ''],
      ['cbebirr', 'coin', 'violet', 'CBEBirr', ''],
      ['bills', 'utility', 'blue', 'Bills & Utilities', ''],
      ['banking', 'bank', 'slate', 'Banking', ''],
      ['govServices', 'gov', 'gold-c', 'Government Services', ''],
      ['payMerchant', 'cart', 'green', 'Pay to Merchant', ''],
      ['travel', 'plane', 'blue', 'Travel', ''],
      ['shopping', 'cart', 'orange', 'Shopping', ''],
      ['entertainment', 'film', 'red', 'Entertainment', ''],
      ['payFor', 'gift', 'violet', 'Pay for', ''],
      ['taxPayment', 'tax', 'slate', 'Tax Payment', ''],
      ['esl', 'ship', 'teal', 'Ethiopian Shipping & Logistics', ''],
      ['fastLoan', 'percent', 'gold-c', 'CBE Fast Loan', '']
    ];

    const el = CBE.ui.el(
      '<div class="page" data-screen="home">' +
      '<div class="hello">' +
      '<button class="bell" data-a="notifications">' + CBE.icon('bell', 20) + '</button>' +
      '<div class="hello-tx"><div class="t1">Hello,</div><div class="t2">' + U.esc(S.holder.name.split(' ')[0]) + '</div></div>' +
      '<button class="lang" data-a="langPick">English ' + CBE.icon('down', 13) + '</button>' +
      '<button class="sq" data-a="drawer">' + CBE.icon('grid', 20) + '</button>' +
      '</div>' +
      '<div class="scroll">' +
      '<div class="hero">' +
      '<div class="hero-card">' +
      '<div class="map-bg"></div>' +
      '<div class="hero-brand"><img src="img/cbe-logo.png" alt="CBE"><div><div class="t1">Commercial Bank of Ethiopia</div><div class="t2">The bank you can always rely on!</div></div></div>' +
      '<div class="hero-bal"><span class="amt" id="homeBal">' + bal + '</span><span class="cur">ETB</span></div>' +
      '<div class="hero-acc"><span class="acc">' + U.esc(S.account.type) + ' 1****' + accTail + '</span>' +
      '<button class="eye" data-a="toggleBalance">' + CBE.icon(hide ? 'eyeOff' : 'eye', 19) + '</button></div>' +
      '<div class="hero-date">' + U.homeStamp() + '</div>' +
      '</div>' +
      '</div>' +
      '<div class="quick-row">' +
      quick.map(([a, ic, lb]) =>
        '<button class="quick" data-a="' + a + '"><span class="ic">' + CBE.icon(ic, 24) + '</span><span class="lb">' + lb + '</span></button>'
      ).join('') +
      '</div>' +
      '<div class="grid-sec"><div class="grid-2">' +
      grid.map(([a, ic, cls, lb, sub]) =>
        '<button class="tile" data-a="' + a + '"><span class="ic ' + cls + '">' + CBE.icon(ic, 22) + '</span>' +
        '<span class="lb">' + lb + (sub ? '<br><span style="font-weight:600;color:var(--ink-3);font-size:12px">' + sub + '</span>' : '') + '</span></button>'
      ).join('') +
      '</div></div>' +
      '<div class="scan-wrap"><button class="scan-pill" data-a="scanQr">' + CBE.icon('scan', 20) + ' Scan QR</button></div>' +
      '</div>' +
      CBE.ui.tabbar('home') +
      '</div>'
    );
    return el;
  });

  CBE.router.on('drawer', function () {
    const S = CBE.state;
    const el = CBE.ui.el(
      '<div class="page" data-screen="drawer">' +
      '<div class="drawer-veil" data-a="back"></div>' +
      '<div class="drawer">' +
      '<div class="dr-head"><div class="t1">' + U.esc(S.holder.name) + '</div><div class="t2">Last Sign In: ' + U.now() + '</div></div>' +
      '<div class="dr-body">' +
      '<div class="scan-row" data-a="receive"><div>' + U.esc(S.account.number) + '</div><div class="hint">Scan this account number.</div></div>' +
      '<button class="dr-row" data-a="contactUs"><span class="l"><span class="ic">' + CBE.icon('mail', 20) + '</span>Contact Us</span><span class="chev">' + CBE.icon('chev', 16) + '</span></button>' +
      '<button class="dr-row" data-a="noorToggle"><span class="l"><span class="ic">' + CBE.icon('wifi', 20) + '</span>CBE NOOR</span><span class="val">' + (S.settings.noor ? 'On' : 'Off') + '</span></button>' +
      '<button class="dr-row" data-a="acctIdent"><span class="l"><span class="ic">' + CBE.icon('card', 20) + '</span>My Accounts</span><span class="val">Account Number</span></button>' +
      '</div>' +
      '<div class="dr-foot"><button class="logout" data-a="logout">' + CBE.icon('logout', 18) + ' Log out</button></div>' +
      '</div>' +
      '</div>'
    );
    return el;
  });

  CBE.router.on('notifications', function () {
    const S = CBE.state;
    const items = [];
    if (S.receipts.length) {
      S.receipts.slice(0, 8).forEach(r => {
        items.push(
          '<div class="notif-item unread"><span class="ic">' + CBE.icon('send', 20) + '</span>' +
          '<div class="tx"><div class="tt">Transfer successful</div>' +
          '<div class="ss">ETB ' + U.fmt(r.amount) + ' sent to ' + U.esc(r.toName) + '. Ref: ' + r.id + '</div>' +
          '<div class="tm">' + U.esc(r.stamp) + '</div></div></div>'
        );
      });
    } else {
      items.push('<div class="notif-item"><span class="ic">' + CBE.icon('bell', 20) + '</span><div class="tx"><div class="tt">Welcome to CBE Mobile Banking</div><div class="ss">You will see your transaction alerts here.</div><div class="tm">Today</div></div></div>');
    }
    return CBE.ui.page({title: 'Notifications', back: true}, '<div class="rows-sec" style="display:flex;flex-direction:column;gap:10px">' + items.join('') + '</div>');
  });

  CBE.router.on('transactions', function () {
    const S = CBE.state;
    const all = S.seedTx.concat(S.receipts.map(r => ({
      dir: 'out', name: r.toName, amt: r.amount, date: r.stamp.replace(',', ''), kind: 'ACCOUNT TO ACCOUNT'
    })));
    const rows = all.map(t =>
      '<div class="tx-item">' +
      '<span class="tx-av ' + (t.dir === 'in' ? 'in' : 'out') + '">' + (t.dir === 'in' ? '+' : U.initials(t.name)) + '</span>' +
      '<span class="tx"><span class="tt">' + U.esc(t.name) + '</span><br><span class="ss">' + U.esc(t.date) + '</span><br><span class="tag">' + U.esc(t.kind) + '</span></span>' +
      '<span class="amt ' + (t.dir === 'in' ? 'in' : 'out') + '">' + (t.dir === 'in' ? '+' : '-') + U.fmt(t.amt) + ' ETB</span>' +
      '</div>'
    ).join('');
    const el = CBE.ui.el(
      '<div class="page" data-screen="transactions">' +
      '<div class="hello">' +
      '<button class="bell" data-a="notifications">' + CBE.icon('bell', 20) + '</button>' +
      '<div class="hello-tx"><div class="t1">Hello,</div><div class="t2">' + U.esc(S.holder.name.split(' ')[0]) + '</div></div>' +
      '<button class="lang" data-a="langPick">English ' + CBE.icon('down', 13) + '</button>' +
      '<button class="sq" data-a="drawer">' + CBE.icon('grid', 20) + '</button>' +
      '</div>' +
      '<div class="seg" style="padding-top:12px">' +
      '<button class="active" data-a="txFilter" data-f="all">All</button>' +
      '<button data-a="txFilter" data-f="out">Debited</button>' +
      '<button data-a="txFilter" data-f="in">Credited</button>' +
      '</div>' +
      '<div class="scroll"><div class="rows-sec" style="display:flex;flex-direction:column;gap:10px" id="txList">' + rows + '</div></div>' +
      CBE.ui.tabbar('transactions') +
      '</div>'
    );
    return el;
  });

  CBE.router.on('scanQr', function () {
    return CBE.ui.el(
      '<div class="page scan-page" data-screen="scanQr">' +
      '<div class="top"><button class="back" data-a="back" style="color:#fff">' + CBE.icon('back', 22) + '</button><h1>Scan QR</h1></div>' +
      '<div class="scan-view"><div class="scan-frame"><div class="scan-hint">Place the QR Code within the frame</div></div></div>' +
      '<div class="scan-actions">' +
      '<button data-a="soonToast" data-t="Flash">' + CBE.icon('flash', 17) + ' Flash on</button>' +
      '<button data-a="soonToast" data-t="Gallery">' + CBE.icon('image', 17) + ' Gallery</button>' +
      '</div>' +
      '</div>'
    );
  });

  CBE.router.on('receive', function () {
    const S = CBE.state;
    const el = CBE.ui.el(
      '<div class="page" data-screen="receive">' +
      '<div class="appbar"><button class="back" data-a="back">' + CBE.icon('back', 22) + '</button><h1>Receive Money</h1></div>' +
      '<div class="scroll">' +
      '<div class="qr-hero">' +
      '<div class="map-bg"></div>' +
      '<h2 style="text-align:left">Receive Money</h2>' +
      '<div class="brand"><img src="img/cbe-mark.png" alt=""><div class="t1">Commercial Bank of Ethiopia</div><div class="t2">The bank you can always rely on!</div></div>' +
      '<div class="acc">Account No: ' + U.mask(S.account.number) + '</div>' +
      '<div class="qr-fields">' +
      '<div class="f"><label>Amount</label><div class="v" id="qrAmt">0.00</div></div>' +
      '<div class="f"><label>Reason</label><div class="v" style="text-align:right" id="qrReason">Mobile Banking</div></div>' +
      '</div>' +
      '</div>' +
      '<div class="qr-card"><canvas id="qrCanvas"></canvas></div>' +
      '<div class="qr-actions">' +
      '<button class="rc-act" data-a="soonToast" data-t="QR shared"><span class="ic">' + CBE.icon('share', 20) + '</span>Share QR</button>' +
      '<button class="rc-act" data-a="copyAcc"><span class="ic">' + CBE.icon('copy', 20) + '</span>Copy Link</button>' +
      '<button class="rc-act" data-a="soonToast" data-t="QR saved"><span class="ic">' + CBE.icon('download', 20) + '</span>Download</button>' +
      '</div>' +
      '<div class="qr-add"><button class="btn ghost" style="width:240px" data-a="qrAddAmount">ADD AMOUNT</button></div>' +
      '</div>' +
      '</div>'
    );
    setTimeout(() => {
      const cv = el.querySelector('#qrCanvas');
      if (cv && CBE.qr) {
        try { CBE.qr.draw(cv, 'CBE:' + S.account.number + ':' + S.holder.name, 230); } catch (e) {}
      }
    });
    return el;
  });
})();
