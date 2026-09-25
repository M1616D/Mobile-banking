/* CBE Mobile Banking — quick-row utility pages + cards */
(function () {
  const U = CBE.util;

  function soon(title, text, icon) {
    return CBE.ui.page({title: title, back: true},
      '<div class="soon-card">' +
      '<span class="ic">' + CBE.icon(icon || 'clock', 32) + '</span>' +
      '<h3>Coming Soon</h3>' +
      '<p>' + text + '</p>' +
      '<button class="btn" style="width:200px;margin:0 auto" data-a="back">Go Back</button>' +
      '</div>');
  }

  CBE.router.on('miniStatement', function () {
    return soon('Mini Statement', 'We are working on a new Mini Statement feature! You will soon be able to pick your account and set a time range to generate your statement.');
  });
  CBE.router.on('cashOut', function () {
    return soon('Cash Out', 'Cash Out at agents and ATMs is on the way. Soon you will withdraw without a card.');
  });
  CBE.router.on('billShare', function () {
    return soon('Bill Share', 'Bill Share is on the way! Soon you will be able to split and share your bills with ease. Stay tuned for the launch!');
  });
  CBE.router.on('schedules', function () {
    return soon('Scheduled Payments', 'We are working hard to bring you the Scheduled Payments feature. Stay tuned!');
  });

  CBE.router.on('cards', function () {
    const el = CBE.ui.el(
      '<div class="page" data-screen="cards">' +
      '<div class="appbar"><button class="back" data-a="back">' + CBE.icon('back', 22) + '</button><h1>Account Cards</h1></div>' +
      '<div class="seg" style="padding-top:12px">' +
      '<button class="active" data-a="cardTab" data-t="issued">Issued</button>' +
      '<button data-a="cardTab" data-t="requested">Requested</button>' +
      '<button data-a="cardTab" data-t="request">Request</button>' +
      '</div>' +
      '<div class="scroll"><div class="rows-sec" id="cardBody">' +
      '<div class="tx-item" style="margin-bottom:12px"><span class="tx-av out" style="background:var(--purple)">' + CBE.icon('card', 18) + '</span><span class="tx"><span class="tt">' + U.maskStar(CBE.state.account.number) + '</span><br><span class="ss">1 Card(s)</span></span></div>' +
      '<div class="card" style="max-width:330px;margin:0 auto;background:linear-gradient(135deg,#17131c,#2b1f38 60%,#150f1d);color:#fff;padding:0;overflow:hidden">' +
      '<img src="img/card-art.jpg" alt="CBE debit card" style="width:100%;display:block">' +
      '</div>' +
      '</div></div></div>'
    );
    return el;
  });

  CBE.router.on('beneficiaries', function () {
    const rows = CBE.state.recents.map(r =>
      '<div class="bene"><span class="av">' + U.initials(r.name) + '</span>' +
      '<span class="tx"><span class="tt">' + U.esc(r.name) + '</span><br><span class="ss">' + U.mask(r.account) + '</span></span></div>'
    ).join('');
    return CBE.ui.page({title: 'Beneficiary', back: true, search: true},
      '<div class="search-wrap" style="padding-top:12px"><div class="search">' + CBE.icon('search', 18) + '<input id="menuSearch" placeholder="Search beneficiary"></div></div>' +
      '<div class="rows-sec" style="padding-top:0">' +
      (rows || '') +
      '</div>');
  });

  CBE.router.on('contactUs', function () {
    return CBE.ui.page({title: 'Contact Us', back: true},
      '<div class="form" style="padding-top:6px">' +
      '<div class="contact-hero"><div class="v">Version</div><div class="n">6.1.0</div></div>' +
      '<div class="card"><div class="contact-block"><b>Contact addresses</b>' +
      '951<br>contact@cbe.com.et<br>https://combanketh.et</div></div>' +
      '<div class="card"><h4>Social medias</h4>' +
      '<div class="socials">' +
      ['Facebook', 'Twitter', 'Telegram', 'LinkedIn', 'YouTube'].map(s =>
        '<div class="soc-row"><span class="ic">' + CBE.icon('link', 18) + '</span>' + s + '</div>'
      ).join('') +
      '</div></div>' +
      '</div>');
  });

  CBE.router.on('fastLoan', function () {
    return CBE.ui.page({title: 'Loan Products', back: true},
      '<div class="form" style="padding-top:6px">' +
      '<div class="loan-hero">' +
      '<span class="ic">' + CBE.icon('percent', 30) + '</span>' +
      '<h2>Choose Your Loan</h2>' +
      '<p>Select the financial product that best fits your current needs.</p>' +
      '</div>' +
      '<div class="sec-title" style="padding-left:0">Available Products</div>' +
      '<div class="loan-card">' +
      '<div class="hd"><span class="ic purple">' + CBE.icon('cash', 20) + '</span><span class="tt">Fast Loan</span></div>' +
      '<p>You have a pre-approved limit from 300 upto 50,000 ETB. No waiting, no hassle. Get the money you need quickly and easily. Tap into your pre-approved funds and make your goals a reality today. No more guessing games. You\u2019re already approved.</p>' +
      '<div class="acts"><button class="btn ghost" data-a="soonToast" data-t="Loan details">Know More</button><button class="btn" data-a="soonToast" data-t="Loan application">Apply Now</button></div>' +
      '</div>' +
      '<div class="loan-card">' +
      '<div class="hd"><span class="ic teal">' + CBE.icon('refresh', 20) + '</span><span class="tt">Fast Revolving</span><span class="badge">Coming Soon</span></div>' +
      '<p>Top up your account instantly with an overdraft limit. Access funds as you need them. Pay and draw as needed \u2014 your overdraft limit is here for you.</p>' +
      '<div class="acts"><button class="btn ghost" disabled>Know More</button><button class="btn" disabled>Activate OD</button></div>' +
      '</div>' +
      '</div>');
  });

  CBE.router.on('verifyReceipt', function () {
    return CBE.ui.page({title: 'Verify Receipt', back: true},
      '<div class="form">' +
      '<div style="display:flex;gap:12px;margin-bottom:16px">' +
      '<span class="mono" style="width:46px;height:46px;border-radius:12px;background:var(--purple-50);color:var(--purple);display:grid;place-items:center">' + CBE.icon('doc', 22) + '</span>' +
      '<input id="vrId" placeholder="Enter Receipt ID" style="flex:1;border:1.5px solid var(--line);border-radius:12px;padding:12px 14px;font-size:15px;outline:none">' +
      '</div>' +
      '<button class="btn" data-a="vrGo">Verify Receipt</button>' +
      '</div>');
  });

  CBE.router.on('withdrawHistory', function () {
    return CBE.ui.page({title: 'Withdrawal History', back: true},
      '<div class="soon-card">' +
      '<span class="ic">' + CBE.icon('history', 30) + '</span>' +
      '<h3>No withdrawal requests found yet.</h3>' +
      '<p>When you initiate a withdrawal, it will show up here.</p>' +
      '<div style="display:flex;gap:10px;justify-content:center">' +
      '<button class="btn ghost" style="width:180px" data-a="soonToast" data-t="History refreshed">Refresh History</button>' +
      '<button class="btn" style="width:180px" data-a="soonToast" data-t="New withdrawal">New Withdrawal</button>' +
      '</div>' +
      '</div>');
  });
})();
