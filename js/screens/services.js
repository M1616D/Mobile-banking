/* CBE Mobile Banking — service category screens */
(function () {
  const U = CBE.util;

  function menu(o) {
    return CBE.ui.page(
      {title: o.title, back: true, search: o.search, tabs: o.tabs},
      (o.pre || '') +
      '<div class="rows-sec"><div class="rows">' +
      o.items.map(it => CBE.ui.rowItem(it)).join('') +
      '</div></div>'
    );
  }

  function searchRows(el) {
    // wire live filter
    setTimeout(() => {
      const inp = el.querySelector('#menuSearch');
      if (!inp) return;
      inp.addEventListener('input', () => {
        const q = inp.value.toLowerCase();
        el.querySelectorAll('.row-item').forEach(r => {
          r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
      });
    });
    return el;
  }

  CBE.router.on('airtime', function () {
    return menu({
      title: 'Airtime', search: true,
      items: [
        {t: 'Ethio telecom Topup', s: 'Buy airtime for any Ethio telecom number', logo: 'ethiotelecom', a: 'airtimeSel', data: ' data-p="ethio"'},
        {t: 'Safaricom Topup', s: 'Buy airtime for any Safaricom number', logo: 'mpesa', a: 'airtimeSel', data: ' data-p="safaricom"'}
      ]
    });
  });

  CBE.router.on('airtimePick', function (p) {
    const ethio = p.provider === 'ethio';
    return menu({
      title: ethio ? 'Ethio telecom Topup' : 'Safaricom Topup',
      items: [
        {t: 'Buy Airtime - Self', s: 'Recharge your own number', ic: 'phone', a: 'airtimeAmount', data: ' data-p="' + p.provider + '"'},
        {t: 'Buy Airtime - Others', s: 'Recharge any other number', ic: 'users', a: 'airtimeAmount', data: ' data-p="' + p.provider + '"'}
      ]
    });
  });

  CBE.router.on('airtimeAmount', function (p) {
    const ethio = p.provider === 'ethio';
    return CBE.ui.page({
      title: ethio ? 'Ethio Telecom Top Up' : 'Safaricom Top Up', back: true
    },
    '<div class="form">' +
    CBE.ui.field({label: 'Amount', id: 'airAmt', ph: 'Enter Amount', inputmode: 'decimal', icon: 'cash'}) +
    (p.mode === 'others' ? CBE.ui.field({label: 'Mobile Number', id: 'airNum', ph: 'Enter Mobile Number', inputmode: 'numeric', max: 13}) : '') +
    '<button class="btn" data-a="airGo" data-p="' + p.provider + '">Continue</button>' +
    '</div>');
  });

  CBE.router.on('bills', function () {
    return menu({
      title: 'Bills & Utilities', search: true,
      items: [
        {t: 'Ethiopian Electric Utility Prepaid', s: 'EEU prepaid meter top up', logo: 'eeu', a: 'billsEEU'},
        {t: 'Safaricom Bill Payment', s: 'Postpaid bill payment', logo: 'mpesa', a: 'refForm', data: ' data-t="Safaricom Bill Payment"'},
        {t: 'Ethio Telecom Postpaid', s: 'Settle your postpaid bill', logo: 'ethiotelecom', a: 'refForm', data: ' data-t="Ethio Telecom Postpaid"'},
        {t: 'AAWSA', s: 'Addis Ababa water & sewerage', logo: 'aawsa', a: 'refForm', data: ' data-t="AAWSA"'},
        {t: 'WeBirr', s: 'WeBirr bill payment', logo: 'webirr', a: 'refForm', data: ' data-t="WeBirr"'},
        {t: 'WebSprix', s: 'WebSprix internet bill', logo: 'websprix', a: 'refForm', data: ' data-t="WebSprix"'},
        {t: 'Safaricom Deposit', s: 'Deposit to Safaricom', logo: 'mpesa', a: 'refForm', data: ' data-t="Safaricom Deposit"'},
        {t: 'EEU Postpaid', s: 'EEU postpaid bill payment', logo: 'eeu', a: 'refForm', data: ' data-t="EEU Postpaid"'}
      ]
    });
  });

  CBE.router.on('billsEEU', function () {
    return menu({
      title: 'Ethiopian Electric Utility Pre...',
      items: [
        {t: 'EEU prepaid TopUp by amount', s: 'Top up by money amount', ic: 'utility', a: 'refForm', data: ' data-t="EEU prepaid TopUp by amount"'},
        {t: 'EEU prepaid TopUp by kWh', s: 'Top up by kWh', ic: 'utility', a: 'refForm', data: ' data-t="EEU prepaid TopUp by kWh"'}
      ]
    });
  });

  CBE.router.on('govServices', function () {
    return searchRows(menu({
      title: 'Government Services', search: true,
      items: [
        {t: 'ICS / Immigration', s: 'Immigration services', logo: 'gov' in {} ? null : null, ic: 'gov', a: 'refForm', data: ' data-t="ICS / Immigration"'},
        {t: 'Mesob Services', s: 'Mesob digital services', ic: 'doc', a: 'refForm', data: ' data-t="Mesob Services"'},
        {t: 'DARS', s: 'DARS service payment', logo: 'dars', a: 'refForm', data: ' data-t="DARS"'},
        {t: 'A.A TMA Parking Payment', s: 'Addis Ababa parking', logo: 'aatma', a: 'refForm', data: ' data-t="A.A TMA Parking Payment"'},
        {t: 'A.A TMA Traffic Penalty', s: 'Traffic penalty payment', logo: 'aatma', a: 'refForm', data: ' data-t="A.A TMA Traffic Penalty"'},
        {t: 'Addis Ababa Land Admin', s: 'Land administration', logo: 'aaland', a: 'refForm', data: ' data-t="Addis Ababa Land Admin"'},
        {t: 'Federal Housing Corporation', s: 'FHC payments', logo: 'fhc', a: 'refForm', data: ' data-t="Federal Housing Corporation"'},
        {t: 'ERA Overloading Penalty', s: 'Road authority penalty', logo: 'era', a: 'refForm', data: ' data-t="ERA Overloading Penalty"'},
        {t: 'MOTRI', s: 'Ministry of Transport', logo: 'motri', a: 'refForm', data: ' data-t="MOTRI"'},
        {t: 'Federal Civil Service Commission (FCSC)', s: 'FCSC services', logo: 'fcsc', a: 'refForm', data: ' data-t="FCSC"'}
      ]
    }));
  });

  CBE.router.on('travel', function () {
    return menu({
      title: 'Travel',
      items: [
        {t: 'Air Transport', s: 'Airline ticket payments', ic: 'plane', a: 'airTransport'},
        {t: 'Land Transport', s: 'Bus and land transport', ic: 'bus', a: 'refForm', data: ' data-t="Land Transport"'},
        {t: 'TOLO Payment', s: 'Toll Road / ETC', ic: 'ship', a: 'tolo'}
      ]
    });
  });

  CBE.router.on('airTransport', function () {
    return menu({
      title: 'Air Transport',
      items: [
        {t: 'Ethiopian Airlines Ticket', s: 'Pay for your flight ticket', logo: 'ethiopian', a: 'refForm', data: ' data-t="Ethiopian Airlines Ticket"'},
        {t: 'Ethiopian Airlines E-staff', s: 'E-staff payments', logo: 'ethiopian', a: 'refForm', data: ' data-t="Ethiopian Airlines E-staff"'},
        {t: 'Zagol', s: 'Zagol travel services', logo: 'zagol', a: 'refForm', data: ' data-t="Zagol"'},
        {t: 'Guzo Go', s: 'Guzo Go travel', logo: 'guzo', a: 'refForm', data: ' data-t="Guzo Go"'},
        {t: 'Ethiopian Airlines Cargo Service Payment', s: 'Cargo services', logo: 'ethiopian', a: 'refForm', data: ' data-t="Ethiopian Cargo"'},
        {t: 'Ethio Travel Services', s: 'Ethio travel & tours', logo: 'ethtravel', a: 'refForm', data: ' data-t="Ethio Travel Services"'}
      ]
    });
  });

  CBE.router.on('tolo', function () {
    return CBE.ui.page({title: 'Toll Road \u00b7 ETC', back: true},
      '<div class="empty">' +
      '<span class="ic" style="width:74px;height:74px;border-radius:50%;background:var(--purple-50);color:var(--purple);display:grid;place-items:center">' + CBE.icon('ship', 30) + '</span>' +
      '<div class="big">No Vehicle Registered</div>' +
      '<p>Register your vehicle for Toll Road / ETC to view its wallet, recharge balance, and track toll usage.</p>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:10px;padding:0 30px">' +
      '<button class="btn" data-a="soonToast" data-t="Vehicle registration">Add a New Vehicle</button>' +
      '<button class="btn ghost" data-a="scanQr">Scan QR Code</button>' +
      '</div>');
  });

  CBE.router.on('shopping', function () {
    return menu({
      title: 'Shopping',
      items: [
        {t: 'Seregela Gebeya', s: 'Online marketplace payment', logo: 'seregela', a: 'refForm', data: ' data-t="Seregela Gebeya"', label: 'Order ID'},
        {t: 'Flomart', s: 'Fresh market delivery', logo: 'flomart', a: 'refForm', data: ' data-t="Flomart"', label: 'Order ID'}
      ]
    });
  });

  CBE.router.on('entertainment', function () {
    return menu({
      title: 'Entertainment',
      items: [
        {t: 'DStv', s: 'DStv subscription payments', logo: 'dstv', a: 'dstv'},
        {t: 'Semu Audio film Production', s: 'Audio film payments', logo: 'semu', a: 'refForm', data: ' data-t="Semu Audio film Production"'}
      ]
    });
  });

  CBE.router.on('dstv', function () {
    return menu({
      title: 'DStv',
      items: [
        {t: 'DSTV Pay Current Package', s: 'Renew current package', logo: 'dstv', a: 'refForm', data: ' data-t="DSTV Pay Current Package"'},
        {t: 'DStv Pay Change Package', s: 'Change your package', logo: 'dstv', a: 'refForm', data: ' data-t="DStv Pay Change Package"'},
        {t: 'DStv Additional Payment (Change Package)', s: 'Additional payment', logo: 'dstv', a: 'refForm', data: ' data-t="DStv Additional"'},
        {t: 'DStv Additional Payment (current package)', s: 'Top up current package', logo: 'dstv', a: 'refForm', data: ' data-t="DStv Additional"'}
      ]
    });
  });

  CBE.router.on('payFor', function () {
    return menu({
      title: 'Pay for',
      items: [
        {t: 'School Fee', s: 'Pay school fees', ic: 'doc', a: 'refForm', data: ' data-t="School Fee"'},
        {t: 'Donation', s: 'Donate to causes', ic: 'gift', a: 'refForm', data: ' data-t="Donation"'},
        {t: 'Auction Ethiopia', s: 'Auction payments', ic: 'scale', a: 'refForm', data: ' data-t="Auction Ethiopia"'},
        {t: 'Moenco', s: 'Moenco payments', logo: 'moenco', a: 'refForm', data: ' data-t="Moenco"'},
        {t: 'British Council', s: 'British Council fees', logo: 'british', a: 'refForm', data: ' data-t="British Council"'},
        {t: 'Hajj and Umrah', s: 'Pilgrimage payments', logo: 'haji', a: 'refForm', data: ' data-t="Hajj and Umrah"'},
        {t: 'Digital Equb', s: 'Digital lottery equb', logo: 'equb', a: 'refForm', data: ' data-t="Digital Equb"'},
        {t: 'Santimpay by PNR', s: 'SantimPay', logo: 'santim', a: 'refForm', data: ' data-t="Santimpay"'},
        {t: 'Booking Technologies', s: 'Booking payments', logo: 'booking', a: 'refForm', data: ' data-t="Booking Technologies"'},
        {t: 'Chapa', s: 'Chapa payment', logo: 'chapa', a: 'refForm', data: ' data-t="Chapa"'},
        {t: 'StarPay', s: 'StarPay', logo: 'starpay', a: 'refForm', data: ' data-t="StarPay"'},
        {t: 'BirrLink', s: 'BirrLink payment', logo: 'birrlink', a: 'refForm', data: ' data-t="BirrLink"'},
        {t: 'YagoutPay', s: 'YagoutPay', logo: 'yagout', a: 'refForm', data: ' data-t="YagoutPay"'},
        {t: 'EMYC Payment', s: 'EMYC payments', logo: 'emyc', a: 'refForm', data: ' data-t="EMYC Payment"'},
        {t: 'LakiPay', s: 'LakiPay', logo: 'lakipay', a: 'refForm', data: ' data-t="LakiPay"'},
        {t: 'Vite Technologies', s: 'Vite payments', logo: 'vite', a: 'refForm', data: ' data-t="Vite Technologies"'}
      ]
    });
  });

  CBE.router.on('taxPayment', function () {
    return menu({
      title: 'Tax Payment',
      items: [
        {t: 'Ministry of Revenue (MOR) Tax Payment', s: 'Federal tax payments', logo: 'mor', a: 'morTax'},
        {t: 'Tax Payments', s: 'Regional tax payments', ic: 'tax', a: 'regTax'}
      ]
    });
  });

  CBE.router.on('morTax', function () {
    return menu({
      title: 'Ministry of Revenue (MOR)',
      items: [
        {t: 'Full Tax Payment', s: 'Pay full declared tax', logo: 'mor', a: 'morCenter'},
        {t: 'Partial Tax Payment', s: 'Pay partial tax', logo: 'mor', a: 'morCenter'}
      ]
    });
  });

  CBE.router.on('morCenter', function () {
    return CBE.ui.page({title: 'MOR', back: true},
      '<div class="form">' +
      CBE.ui.field({label: 'Tax Center', id: 'taxCenter', select: true, options: [['第一大', 'Select from the list'], ['kirkos', 'Kirkos'], ['bole', 'Bole'], ['mexico', 'Mexico'], ['piassa', 'Piassa']]}) +
      CBE.ui.field({label: 'Order Code', id: 'orderCode', ph: 'Enter Order Code', icon: 'doc'}) +
      '<button class="btn" data-a="taxGo">Continue</button>' +
      '</div>');
  });

  CBE.router.on('regTax', function () {
    return menu({
      title: 'Tax Payments',
      items: [
        {t: 'Dire Dawa Revenue', s: 'Dire Dawa authority', logo: 'dirrev', a: 'refForm', data: ' data-t="Dire Dawa Revenue"'},
        {t: 'Somali Revenue', s: 'Somali region revenue', logo: 'somrev', a: 'refForm', data: ' data-t="Somali Revenue"'},
        {t: 'Addis Ababa Revenue', s: 'Addis Ababa revenue', logo: 'aarev', a: 'refForm', data: ' data-t="Addis Ababa Revenue"'},
        {t: 'Amhara Revenue', s: 'Amhara region revenue', ic: 'tax', a: 'refForm', data: ' data-t="Amhara Revenue"'}
      ]
    });
  });

  CBE.router.on('otherTransfers', function () {
    return menu({
      title: 'Other Transfers',
      items: [
        {t: 'Wallet', s: 'Mobile wallet transfers', ic: 'wallet', a: 'wallets'},
        {t: 'Transfer to Other Banks', s: 'Validate & transfer', ic: 'bank', a: 'otherBanks'},
        {t: 'Transfer to Micro Finances', s: 'Microfinance transfer', ic: 'users', a: 'microFinance'},
        {t: 'SACCO', s: 'Savings & credit coops', ic: 'coin', a: 'sacco'}
      ]
    });
  });

  CBE.router.on('wallets', function () {
    return menu({
      title: 'Wallet',
      items: CBE.catalog.wallets.map(w => ({t: w.n, logo: w.k, a: 'refForm', data: ' data-t="' + U.esc(w.n) + '"'}))
    });
  });

  CBE.router.on('otherBanks', function () {
    return CBE.ui.page({title: 'Account Validation', back: true},
      '<div class="form">' +
      CBE.ui.field({label: 'Bank Name', id: 'bankSel', select: true, options: [['', 'Select from the list']].concat(CBE.catalog.banks.map(b => [b.k, b.n]))}) +
      CBE.ui.field({label: 'Account', id: 'bankAcc', ph: 'Enter Account Number', inputmode: 'numeric', max: 13, icon: 'bank', owner: 'bankOwner'}) +
      '<button class="btn" data-a="bankValidate">Continue</button>' +
      '</div>');
  });

  CBE.router.on('microFinance', function () {
    return CBE.ui.page({title: 'Transfer to Micro Finance', back: true},
      '<div class="form">' +
      CBE.ui.field({label: 'Microfinance Name', id: 'microSel', select: true, options: [['', 'Select from the list']].concat(CBE.catalog.micro.map(m => [m.n, m.n]))}) +
      CBE.ui.field({label: 'Account', id: 'microAcc', ph: 'Enter Account Number', inputmode: 'numeric', max: 13, icon: 'bank', owner: 'microOwner'}) +
      '<button class="btn" data-a="microGo">Continue</button>' +
      '</div>');
  });

  CBE.router.on('sacco', function () {
    return menu({
      title: 'SACCO',
      items: CBE.catalog.sacco.map(s => ({t: s.n, mono: U.initials(s.n), a: 'saccoForm', data: ' data-t="' + U.esc(s.n) + '"'}))
    });
  });

  CBE.router.on('saccoForm', function (p) {
    return CBE.ui.page({title: p.t || 'Awach SACCOS', back: true},
      '<div class="form">' +
      CBE.ui.field({label: 'Awach Account Number', id: 'saccoAcc', ph: 'Enter Account Number', inputmode: 'numeric', max: 13, icon: 'bank', owner: 'saccoOwner'}) +
      '<button class="btn" data-a="saccoGo" data-t="' + U.esc(p.t || 'Awach SACCO') + '">Continue</button>' +
      '</div>');
  });

  CBE.router.on('cbebirr', function () {
    return menu({
      title: 'CBEBirr',
      items: [
        {t: 'Transfer to own CBEBirr wallet', s: 'Move money to your wallet', ic: 'coin', a: 'refForm', data: ' data-t="CBEBirr own wallet"'},
        {t: 'Transfer to other CBEBirr wallet', s: 'Send to any CBEBirr user', ic: 'coin', a: 'refForm', data: ' data-t="CBEBirr other wallet"'},
        {t: 'Transfer to CBEBirr Agent', s: 'Agent cash services', ic: 'users', a: 'refForm', data: ' data-t="CBEBirr Agent"'}
      ]
    });
  });

  CBE.router.on('banking', function () {
    return menu({
      title: 'Banking',
      items: [
        {t: 'Beneficiary', s: 'Manage saved beneficiaries', ic: 'users', a: 'beneficiaries'},
        {t: 'Cards', s: 'Your account cards', ic: 'card', a: 'cards'}
      ]
    });
  });

  CBE.router.on('payMerchant', function () {
    return CBE.ui.page({title: 'Pay Merchant', back: true},
      '<div class="form">' +
      '<div style="display:flex;gap:10px;margin-bottom:14px">' +
      '<button class="btn ghost" style="flex:1" data-a="pmTab" data-t="ci">Customer initiated</button>' +
      '<button class="btn" style="flex:1" data-a="pmTab" data-t="dyn">Dynamic ID</button>' +
      '</div>' +
      '<div id="pmBody">' +
      CBE.ui.field({label: 'Merchant code*', id: 'pmCode', ph: 'Enter Merchant code', icon: 'cart'}) +
      CBE.ui.field({label: 'Operator code', id: 'pmOp', ph: 'Enter Operator code', icon: 'user'}) +
      '</div>' +
      '<button class="btn" data-a="pmGo">Continue</button>' +
      '</div>');
  });

  CBE.router.on('esl', function () {
    return CBE.ui.page({title: 'ESL', back: true},
      '<div class="form">' +
      CBE.ui.field({label: 'Reference Number', id: 'eslRef', ph: 'Enter Reference Number', icon: 'ship'}) +
      '<button class="btn" data-a="eslGo">Continue</button>' +
      '</div>');
  });
})();
