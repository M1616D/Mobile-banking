/* ==========================================================================
   data.js — all mock data for the CBE Mobile Banking replica
   Everything lives locally so the app is 100% offline.
   `logo` keys point at the real artwork in assets/img/brands/.
   ========================================================================== */
(function (global) {
  'use strict';
  var CBE = global.CBE || (global.CBE = {});

  /* ---------------------------------------------------------------- user */
  var user = {
    name: 'Bereket Mamuye Beyene',
    short: 'Bereket',
    account: '1******3619',
    full: '1000407533619',
    balance: 5005.71,
    lastSignIn: 'Sep 22, 2026 - 06:27 PM',
    phone: '+251902468625',
    tin: '0000006966'
  };

  var accounts = [
    { id: 'sav1', type: 'savings', label: 'Saving Account 1******3619', account: '1******3619', full: '1000407533619', balance: 5005.71 },
    { id: 'sav2', type: 'savings', label: 'Saving Account 1******7214', account: '1******7214', full: '1000123457214', balance: 4230.10 },
    { id: 'cur1', type: 'current', label: 'Current Account 1******5580', account: '1******5580', full: '1000123455580', balance: 90120.00 },
    { id: 'birr', type: 'CBEBirr Wallet', label: 'CBEBirr Wallet 8********214', account: '8********214', full: '0911234214', balance: 640.00 }
  ];

  /* -------------------------------------------------------- transactions */
  var transactions = [
    { id: 't1', name: 'Yfuri Hanna', date: '2026-09-21T14:22', amount: -546.00, tag: 'ACCOUNT TO ACCOUNT', to: 'Yfuri Hanna B35-45 Selam C ETB-3257', toAcc: '1******3257', charges: true, ref: 'FT26264LRXTX', toAccRaw: '1000555663257' },
    { id: 't2', name: 'Hizkel Wana', date: '2026-09-18T13:07', amount: -550.00, tag: 'ACCOUNT TO ACCOUNT', to: 'Hizkel Wana Waza', toAcc: '1******2238', charges: true, ref: 'FT26188KDQPL', toAccRaw: '1000555662238' },
    { id: 't3', name: 'Wisenbet Wondimu', date: '2026-09-16T20:09', amount: 2000.00, tag: 'ACCOUNT TO ACCOUNT', to: 'Bereket Mamuye', toAcc: '1******3619', ref: 'FT25973BMTAX' },
    { id: 't4', name: 'Eyob Sintayehu', date: '2026-09-15T21:38', amount: 3500.00, tag: 'ACCOUNT TO ACCOUNT', to: 'Bereket Mamuye', toAcc: '1******3619', ref: 'FT25844EYQRN' },
    { id: 't5', name: 'Mamuye Beyene', date: '2026-09-14T00:00', amount: 600.00, tag: 'TRANSFER', to: 'Bereket Mamuye', toAcc: '1******3619', ref: 'FT25710MMABE' },
    { id: 't6', name: 'Ethio Telecom', date: '2026-09-12T19:04', amount: -50.00, tag: 'AIRTIME', to: '0911****214', ref: 'FT25103ATTOP' },
    { id: 't7', name: 'Safaricom Topup', date: '2026-09-09T11:26', amount: -100.00, tag: 'AIRTIME', to: '0912****880', ref: 'FT25012SFTUP' },
    { id: 't8', name: 'Ethiopian Electric Utility', date: '2026-09-05T16:41', amount: -320.00, tag: 'BILL PAYMENT', to: 'Meter 451****12', ref: 'FT24991EEUPM' },
    { id: 't9', name: 'TeleBirr Wallet', date: '2026-09-02T08:12', amount: -1000.00, tag: 'WALLET', to: '0911****214', ref: 'FT24932TBBTR' },
    { id: 't10', name: 'Anisa Mudesir Suleyman', date: '2026-08-30T15:55', amount: -120.00, tag: 'ACCOUNT TO ACCOUNT', to: 'Anisa Mudesir Suleyman', toAcc: '1******4719', charges: true, ref: 'FT24810AMLWD', toAccRaw: '1000555664719' }
  ];

  /* -------------------------------------------- saved / recent recipients */
  var recents = [
    { id: 'r1', name: 'Hizkel Wana Waza', account: '1******2238', raw: '1000555662238', bank: 'Commercial Bank of Ethiopia' },
    { id: 'r2', name: 'Timbertu Wujira Wonji', account: '1******3375', raw: '1000555663375', bank: 'Commercial Bank of Ethiopia' },
    { id: 'r3', name: 'Yared Wendimagegnehu', account: '1******7579', raw: '1000555667579', bank: 'Commercial Bank of Ethiopia' },
    { id: 'r4', name: 'Anisa Mudesir Suleyman', account: '1******4719', raw: '1000555664719', bank: 'Commercial Bank of Ethiopia' }
  ];

  var beneficiaries = [];

  /* --------------------------------------------------------------- banks */
  function b(name, abbr, color, extra) {
    var o = { name: name, abbr: abbr, color: color };
    if (extra) Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
    return o;
  }
  var banks = [
    b('Abay Bank', 'AB', '#1b5e9c', { logo: 'abay' }),
    b('Addis Bank', 'AD', '#1f7fc4', { logo: 'addis' }),
    b('Ahadu Bank', 'AH', '#9b1c31', { logo: 'ahadu' }),
    b('Ahadu E-birr', 'AE', '#7b2cbf'),
    b('Amhara Bank', 'AM', '#1c6fd4', { logo: 'amhara' }),
    b('Awash Bank', 'AW', '#e8862a', { logo: 'awash' }),
    b('Bank of Abyssinia', 'BoA', '#f2a11a', { logo: 'abyssinia' }),
    b('Berhan Bank', 'BB', '#e0902f', { logo: 'berhan' }),
    b('Bunna Bank', 'BU', '#6d2b2f', { logo: 'bunna' }),
    b('Cooperative Bank of Oromia S.C.', 'CBO', '#29abe2', { logo: 'coop' }),
    b('Coopay E-Birr', 'CE', '#7b2cbf'),
    b('Dashen Bank', 'DB', '#20347a', { logo: 'dashen' }),
    b('Enat Bank', 'EN', '#d63b3b', { logo: 'enat' }),
    b('Gadaa Bank', 'GA', '#e2402f'),
    b('Global Bank Ethiopia', 'GB', '#1f9d55'),
    b('Goh Betoch Bank', 'GH', '#1a3f7a'),
    b('H-CASH', 'HC', '#7b2cbf'),
    b('Halal Pay', 'HP', '#1f9d9d'),
    b('Hibret Bank', 'HB', '#2b7fc4'),
    b('Hijra Bank', 'HJ', '#1f67c8'),
    b('Kacha', 'KA', '#f0a800'),
    b('Lion International Bank', 'LB', '#2f8f4e'),
    b('M-Pesa', 'MP', '#e2231a', { logo: 'mpesa' }),
    b('Nib E-birr', 'NB', '#7b2cbf'),
    b('Nib International Bank', 'NIB', '#8a5a2b', { logo: 'nib' }),
    b('Omo Bank', 'OM', '#1f7fc4'),
    b('Oromia Bank', 'OB', '#1f9d55', { logo: 'oromia' }),
    b('Premier Switch Solutions', 'PSS', '#2b6fc4'),
    b('Rammis Bank', 'RM', '#1b7a4d'),
    b('SahayPay', 'SP', '#d6247e', { logo: 'sahaypay' }),
    b('Shabelle Bank', 'SB', '#1b5e9c'),
    b('Sidama Bank', 'SD', '#8a5a2b'),
    b('Siinqee Bank', 'SQ', '#e2731f'),
    b('TeleBirr', 'TB', '#1b9ad6', { logo: 'telebirr' }),
    b('Tsehay Bank', 'TS', '#1b7a4d', { logo: 'tsehay' }),
    b('Tsedey Bank', 'TD', '#1f6fb2'),
    b('Wegagen Bank', 'WG', '#f0a11a', { logo: 'wegagen' }),
    b('YaYa Wallet', 'YY', '#6a2bb5', { logo: 'yaya' }),
    b('ZamZam Bank', 'ZZ', '#1d8f6f'),
    b('Zemen Bank', 'ZB', '#cc2229', { logo: 'zemen' })
  ];

  /* ------------------------------------------------------------- wallets */
  var wallets = [
    { id: 'telebirr', name: 'TeleBirr', logo: 'telebirr' },
    { id: 'ebirr', name: 'EBirr', logo: 'ebirr' },
    { id: 'mpesa', name: 'M-Pesa', logo: 'mpesa' },
    { id: 'yaya', name: 'YaYa Wallet', logo: 'yaya' },
    { id: 'binget', name: 'BinGet Birr', logo: 'binget' },
    { id: 'sahay', name: 'SahayPay', logo: 'sahaypay' },
    { id: 'cbebirr', name: 'CBEBirr', brand: 'cbe' }
  ];

  /* -------------------------------------------------------------- airtime */
  var airtimeProviders = [
    { id: 'ethio', name: 'Ethio telecom Topup', logo: 'ethiotelecom' },
    { id: 'safaricom', name: 'Safaricom Topup', brand: 'safaricom' }
  ];

  var airtimeOptions = [
    { id: 'self', name: 'Buy Airtime - Self', sub: 'Buy Airtime - Self' },
    { id: 'others', name: 'Buy Airtime - Others', sub: 'Buy Airtime - Others' }
  ];

  /* --------------------------------------------------------------- billers */
  var billers = [
    { id: 'eeu', name: 'Ethiopian Electric Utility Prepaid', brand: 'eeu' },
    { id: 'safbill', name: 'Safaricom Bill Payment', brand: 'safaricom' },
    { id: 'aawsa', name: 'AAWSA', brand: 'aawsa' },
    { id: 'ethiopost', name: 'Ethio Telecom Postpaid', logo: 'ethiotelecom' },
    { id: 'webirr', name: 'WeBirr', brand: 'webirr' },
    { id: 'websprix', name: 'WebSprix', brand: 'websprix' },
    { id: 'safdep', name: 'Safaricom Deposit', brand: 'safaricom' },
    { id: 'telebill', name: 'TeleBirr Bill Payment', logo: 'telebirr' }
  ];

  /* ------------------------------------------------------- other transfers */
  var otherTransfers = [
    { id: 'wallet', name: 'Wallet', sub: 'Wallet', icon: 'wallet', tone: '#7b2cbf', route: 'wallet' },
    { id: 'banks', name: 'Transfer to Other Banks', sub: 'Transfer to Other Banks', icon: 'transferOut', tone: '#ef7d1a', route: 'accountValidation' },
    { id: 'micro', name: 'Transfer to Micro Finances', sub: 'Transfer to Micro Finances', icon: 'moneyBag', tone: '#7b2cbf', route: 'microForm' },
    { id: 'sacco', name: 'SACCO', sub: 'SACCO', icon: 'coins', tone: '#7b2cbf', route: 'saccos' }
  ];

  var microFinances = [
    b('Amhara Credit & Saving Institution', 'ACSI', '#1f7fc4'),
    b('Oromia Credit & Saving S.C.', 'OCSS', '#e8862a'),
    b('Tsedey MFI', 'TSD', '#1b7a4d'),
    b('Vision Fund MFI', 'VFM', '#2f8f4e'),
    b('Wasasa MFI', 'WSM', '#8a4b9c'),
    b('PEACE MFI', 'PCM', '#1f9d9d'),
    b('Buusaa Gonofaa MFI', 'BGM', '#d63b3b'),
    b('Metemamen MFI', 'MTM', '#6d2b2f')
  ];

  var saccos = [
    b('Awach SACCO', 'AWA', '#1f7fc4'),
    b('Yehulu SACCO', 'YEH', '#1b1f3a'),
    b('Dil SACCO', 'DIL', '#1b3a8f'),
    b('Amigos SACCO', 'AMI', '#e2402f'),
    b('Washa SACCO', 'WSH', '#1b5e9c'),
    b('Hidasie SACCO', 'HDS', '#e8862a')
  ];

  /* ------------------------------------------------------------- banking */
  var bankingServices = [
    { id: 'beneficiary', name: 'Beneficiary', icon: 'userPlus', route: 'beneficiary' },
    { id: 'cards', name: 'Cards', icon: 'cardStack', route: 'cards' }
  ];

  /* --------------------------------------------------- government services */
  var governmentServices = [
    { id: 'fcsc', name: 'Federal Civil Service Commission', sub: 'Federal Civil Service Commission (FCSC)', icon: 'building' },
    { id: 'motri', name: 'MOTRI', sub: 'Ministry of Transport and Logistics', icon: 'bus' },
    { id: 'era', name: 'ERA Overloading Penalty', sub: 'ERA Overloading Penalty', icon: 'warning' },
    { id: 'housing', name: 'Federal Housing Corporation', sub: 'Federal Housing Corporation', icon: 'building' },
    { id: 'land', name: 'Addis Ababa Land Admin', sub: 'Addis Ababa Land Administration', icon: 'doc' },
    { id: 'tmaTraffic', name: 'A.A TMA Traffic Penalty', sub: 'A.A TMA Traffic Penalty', icon: 'car' },
    { id: 'tmaParking', name: 'A.A TMA Parking Payment', sub: 'A.A TMA Parking Payment', icon: 'car' },
    { id: 'dars', name: 'DARS', sub: 'DARS', icon: 'medal' },
    { id: 'mesob', name: 'Mesob Services', sub: 'Mesob Services', icon: 'receipt' },
    { id: 'ics', name: 'ICS / Immigration', sub: 'ICS / Immigration', icon: 'clip' }
  ];

  /* --------------------------------------------------------- pay merchants
     Pay for → grid of merchant tiles, exactly like the screenshots. */
  var payMerchants = [
    { name: 'School Fee', icon: 'doc' },
    { name: 'Auction Ethiopia', icon: 'store' },
    { name: 'British Council', icon: 'globe' },
    { name: 'Digital Equb', mark: 'DE' },
    { name: 'Booking Technologies', mark: 'bt' },
    { name: 'StarPay', mark: 'SP' },
    { name: 'Donation', icon: 'coins' },
    { name: 'Moenco', mark: 'MO' },
    { name: 'Hajj and Umrah', icon: 'pin' },
    { name: 'Santimpay by PNR', mark: 'PAY' },
    { name: 'Chapa', mark: 'CH' },
    { name: 'BirrLink', mark: '3' },
    { name: 'LakIPay', mark: 'LK' },
    { name: 'YaqoutPay', mark: 'YQ' },
    { name: 'Vite Technologies', icon: 'star' },
    { name: 'EMWC Payment', mark: 'EW' }
  ];

  var taxPayments = [
    { id: 'mor', name: 'Ministry of Revenue (MOR) Tax Payment', sub: 'Ministry of Revenue (MOR) Tax Payment', icon: 'receipt' },
    { id: 'taxpay', name: 'Tax Payments', sub: 'Tax Payments', icon: 'building' }
  ];

  var shoppingMerchants = [
    { name: 'Serategna Geteya', icon: 'cart' },
    { name: 'Fiomart', icon: 'cart' }
  ];

  var entertainmentMerchants = [
    { name: 'DStv', mark: 'DStv' },
    { name: 'Semu Audio film Production', icon: 'film' }
  ];

  var travelServices = [
    { id: 'tolo', name: 'TOLO Payment', icon: 'coins' },
    { id: 'air', name: 'Air Transport', icon: 'plane' },
    { id: 'land', name: 'Land Transport', icon: 'car' }
  ];

  /* ---------------------------------------------------------- other services
     The grid the 4-cube icon opens in the real app. */
  var otherServices = [
    { id: 'fx', name: 'Exchange Rates', icon: 'exchangeRate', route: 'fx' },
    { id: 'internet', name: 'Internet Banking', icon: 'bank', route: 'internetBanking' },
    { id: 'ussd', name: 'USSD', icon: 'ussd', route: 'ussd' },
    { id: 'verifyReceipt', name: 'Verify Receipt', icon: 'receiptCheck', route: 'verifyReceipt', tone: '#d6247e' },
    { id: 'feedback', name: 'Feedback', icon: 'chat', route: 'feedback' },
    { id: 'locator', name: 'CBE Locator', icon: 'pin', route: 'branches' },
    { id: 'callCenter', name: 'Call Center', icon: 'callCenter', route: 'contactUs' },
    { id: 'privacy', name: 'Privacy Policy', icon: 'cbe', route: 'privacy' },
    { id: 'terms', name: 'Terms and Tariffs', icon: 'cbe', route: 'terms' },
    { id: 'survey', name: 'Survey', icon: 'cbe', route: 'survey' },
    { id: 'links', name: 'CBE Links', icon: 'link', route: 'cbeLinks' }
  ];

  /* ---------------------------------------------------------------- loans */
  var loanProducts = [
    { id: 'fast', name: 'Fast Loan', sub: 'Finds the best term loan for your needs.', icon: 'cashOut' },
    { id: 'revolving', name: 'Fast Revolving', sub: 'Top up your account instantly with an OD.', icon: 'refresh', soon: true }
  ];

  /* ------------------------------------------------------------- CBEBirr */
  var cbebirrOptions = [
    { id: 'own', title: 'Transfer to own CBEBirr wallet', sub: 'Transfer to own CBEBirr wallet.', phone: true },
    { id: 'other', title: 'Transfer to other CBEBirr wallet', sub: 'Transfer to other CBEBirr wallet.', phone: true },
    { id: 'agent', title: 'Transfer to CBEBirr Agent', sub: 'Transfer to CBEBirr Agent.', phone: false }
  ];

  /* --------------------------------------------------------- card products */
  var cardTypes = [
    { id: 'debit', name: 'CBE Debit Card (Classic)' },
    { id: 'master', name: 'CBE Debit Mastercard' },
    { id: 'virtual', name: 'CBEBirr Virtual Card' },
    { id: 'atm', name: 'CBE ATM Card' }
  ];

  /* ------------------------------------------------------ branches / agents */
  var branches = [
    { id: 'b1', name: 'Bole Branch', city: 'Addis Ababa', hours: '8:00 AM – 5:00 PM' },
    { id: 'b2', name: 'Kera Branch', city: 'Addis Ababa', hours: '8:00 AM – 5:00 PM' },
    { id: 'b3', name: 'Meskel Flower Branch', city: 'Addis Ababa', hours: '8:00 AM – 5:00 PM' },
    { id: 'b4', name: 'Piassa Branch', city: 'Addis Ababa', hours: '8:00 AM – 4:30 PM' },
    { id: 'b5', name: 'Adama Branch', city: 'Adama', hours: '8:00 AM – 5:00 PM' },
    { id: 'b6', name: 'Hawassa Branch', city: 'Hawassa', hours: '8:00 AM – 5:00 PM' },
    { id: 'b7', name: 'Mekelle Branch', city: 'Mekelle', hours: '8:00 AM – 5:00 PM' },
    { id: 'b8', name: 'Bahir Dar Branch', city: 'Bahir Dar', hours: '8:00 AM – 5:00 PM' }
  ];

  var agents = [
    { id: 'a1', name: 'AGT-100231 Bole', city: 'Addis Ababa', hours: 'Open now' },
    { id: 'a2', name: 'AGT-100455 Kera', city: 'Addis Ababa', hours: 'Open now' },
    { id: 'a3', name: 'AGT-101002 Merkato', city: 'Addis Ababa', hours: 'Open now' },
    { id: 'a4', name: 'AGT-102233 Adama', city: 'Adama', hours: 'Open now' },
    { id: 'a5', name: 'AGT-105511 Hawassa', city: 'Hawassa', hours: 'Closed' },
    { id: 'a6', name: 'AGT-107744 Mekelle', city: 'Mekelle', hours: 'Open now' }
  ];

  var rates = [
    { cur: 'USD', name: 'US Dollar', buy: 143.5211, sell: 146.3913 },
    { cur: 'EUR', name: 'Euro', buy: 156.8042, sell: 159.9403 },
    { cur: 'GBP', name: 'Pound Sterling', buy: 182.2201, sell: 185.8645 },
    { cur: 'AED', name: 'UAE Dirham', buy: 38.9714, sell: 39.7508 },
    { cur: 'SAR', name: 'Saudi Riyal', buy: 38.1812, sell: 38.9451 },
    { cur: 'CNY', name: 'Chinese Yuan', buy: 19.8041, sell: 20.2002 },
    { cur: 'KES', name: 'Kenyan Shilling', buy: 1.1062, sell: 1.1283 }
  ];

  /* ------------------------------------------------------- home shortcuts
     Everything the home page links to. The first six are the cards in the
     reference screenshot; the rest are the extra tools the app also carries. */
  var homeTileIcons = [
    { title: 'Mini Statement', key: 'miniStatement', icon: 'statement', goto: 'miniStatement' },
    { title: 'Cash Out', key: 'cashOut', icon: 'cashOut', goto: 'cashOut' },
    { title: 'Bill Share', key: 'billShare', icon: 'splitShare', goto: 'billShare' },
    { title: 'Cards', key: 'cards', icon: 'cardStack', goto: 'cards' }
  ];

  var homeCards = [
    { title: 'CBE Transfer', sub: 'Send Money', subKey: 'sendMoney', icon: 'arrowUpRight', tone: 'pink', goto: 'cbeTransfer' },
    { title: 'Receive', sub: 'Get Paid', subKey: 'getPaid', icon: 'arrowDownLeft', tone: 'green', goto: 'receive' },
    { title: 'Airtime', key: 'airtime', icon: 'phone', center: true, goto: 'airtime' },
    { title: 'Other Transfers', key: 'otherTransfers', icon: 'sync', center: true, goto: 'otherTransfers' },
    { title: 'CBEBirr', key: 'cbeBirr', icon: 'cardStack', center: true, goto: 'cbebirr' },
    { title: 'Bills & Utilities', key: 'billsUtilities', icon: 'receipt', center: true, goto: 'bills' }
  ];

  /* the extra functional buttons the home page also carries */
  var homeExtras = [
    { title: 'CBE Fast Loan', sub: 'Instant pre-approved loan', icon: 'rocket', tone: 'purple', goto: 'fastLoan' },
    { title: 'Shopping', sub: 'Pay online merchants', icon: 'cart', tone: 'purple', goto: 'shopping' },
    { title: 'Tax Payment', sub: 'Ministry of Revenue', icon: 'receipt', tone: 'purple', goto: 'taxPayment' },
    { title: 'Pay Merchant', sub: 'Merchant code payment', icon: 'store', tone: 'purple', goto: 'payMerchant' },
    { title: 'Forex', sub: 'Exchange rates', icon: 'exchangeRate', tone: 'purple', goto: 'fx' },
    { title: 'Loan Products', sub: 'Choose your loan', icon: 'coins', tone: 'purple', goto: 'loanProducts' },
    { title: 'Micro Finance', sub: 'Transfer to MFI', icon: 'moneyBag', tone: 'purple', goto: 'microForm' },
    { title: 'SACCO', sub: 'Transfer to SACCO', icon: 'handshake', tone: 'purple', goto: 'saccos' },
    { title: 'Traffic Fine', sub: 'TMA penalty payment', icon: 'car', tone: 'purple', goto: 'government' },
    { title: 'Donation', sub: 'Give to a cause', icon: 'coins', tone: 'purple', goto: 'payFor' }
  ];

  /* ------------------------------------------------------------ menu search */
  var serviceCatalog = [
    { route: 'cbeTransfer', name: 'CBE Transfer', group: 'Transfers' },
    { route: 'receive', name: 'Receive Money', group: 'Transfers' },
    { route: 'airtime', name: 'Airtime', group: 'Top up' },
    { route: 'otherTransfers', name: 'Other Transfers', group: 'Transfers' },
    { route: 'wallet', name: 'Wallet', group: 'Transfers' },
    { route: 'banksList', name: 'Transfer to Other Banks', group: 'Transfers' },
    { route: 'microForm', name: 'Transfer to Micro Finance', group: 'Transfers' },
    { route: 'saccos', name: 'SACCO', group: 'Transfers' },
    { route: 'scanner', name: 'Scan QR', group: 'Transfers' },
    { route: 'cbebirr', name: 'CBEBirr', group: 'Wallets' },
    { route: 'bills', name: 'Bills & Utilities', group: 'Payments' },
    { route: 'payFor', name: 'Pay for', group: 'Payments' },
    { route: 'taxPayment', name: 'Tax Payment', group: 'Payments' },
    { route: 'payMerchant', name: 'Pay to Merchant', group: 'Payments' },
    { route: 'shopping', name: 'Shopping', group: 'Payments' },
    { route: 'entertainment', name: 'Entertainment', group: 'Payments' },
    { route: 'travel', name: 'Travel', group: 'Payments' },
    { route: 'esl', name: 'Ethiopian Shipping & Logistics', group: 'Payments' },
    { route: 'fastLoan', name: 'CBE Fast Loan', group: 'Services' },
    { route: 'banking', name: 'Banking', group: 'Services' },
    { route: 'beneficiary', name: 'Beneficiary', group: 'Services' },
    { route: 'cards', name: 'Account Cards', group: 'Services' },
    { route: 'government', name: 'Government Services', group: 'Services' },
    { route: 'loanProducts', name: 'Loan Products', group: 'Services' },
    { route: 'withdrawalHistory', name: 'Withdrawal History', group: 'Services' },
    { route: 'miniStatement', name: 'Mini Statement', group: 'Services' },
    { route: 'billShare', name: 'Bill Share', group: 'Services' },
    { route: 'cashOut', name: 'Cash Out', group: 'Services' },
    { route: 'fx', name: 'Exchange Rates', group: 'Services' },
    { route: 'branches', name: 'Branches', group: 'Services' },
    { route: 'agents', name: 'Agents', group: 'Services' },
    { route: 'otherServices', name: 'Other Services', group: 'App' },
    { route: 'settings', name: 'Settings', group: 'App' },
    { route: 'transactions', name: 'Transactions', group: 'App' },
    { route: 'myInfo', name: 'My Information', group: 'App' },
    { route: 'notifications', name: 'Notifications', group: 'App' },
    { route: 'language', name: 'Language', group: 'Preferences' },
    { route: 'accountPreferences', name: 'Account Preferences', group: 'Preferences' },
    { route: 'notificationPreferences', name: 'Notification Preferences', group: 'Preferences' },
    { route: 'servicePreferences', name: 'Service Preferences', group: 'Preferences' },
    { route: 'changePin', name: 'Change PIN', group: 'Security' },
    { route: 'changePassphrase', name: 'Change Passphrase', group: 'Security' },
    { route: 'biometricLogin', name: 'Biometric Login', group: 'Security' },
    { route: 'cbeNoor', name: 'CBE NOOR', group: 'Services' },
    { route: 'contactUs', name: 'Contact Us', group: 'App' },
    { route: 'myAccounts', name: 'My Accounts', group: 'App' },
    { route: 'logout', name: 'Log out', group: 'App' }
  ];

  /* ------------------------------------------------------------- i18n */
  var strings = {
    en: {
      hello: 'Hello', language: 'English', home: 'Home', transactions: 'Transactions', settings: 'Settings',
      sendMoney: 'Send Money', getPaid: 'Get Paid', airtime: 'Airtime', otherTransfers: 'Other Transfers',
      cbeBirr: 'CBEBirr', billsUtilities: 'Bills & Utilities', banking: 'Banking', government: 'Government Services',
      scanQr: 'Scan QR', miniStatement: 'Mini Statement', cashOut: 'Cash Out', billShare: 'Bill Share', cards: 'Cards',
      tagline: 'The bank you can always rely on !', savingAccount: 'Saving Account',
      welcomeBack: 'Welcome back', useBiometrics: 'Use Biometrics', usePin: 'Use PIN',
      fromAccount: 'From Account', accountNumber: 'Account Number', amount: 'Amount', addRemark: 'Add remark',
      defaultRemark: '*Default: MB transfer', continue: 'Continue', recentTransfers: 'Recent Transfers',
      beneficiaries: 'Beneficiaries', noBeneficiaries: 'No beneficiaries', pleaseConfirm: 'Please Confirm',
      from: 'From', to: 'To', totalAmount: 'Total Amount', cancel: 'Cancel', transfer: 'Transfer',
      verifyIdentity: 'Verify Identity', scanFingerprint: 'Scan your fingerprint to complete the transfer',
      biometricsAuthenticated: 'Biometrics Authenticated!', proceedPin: 'Proceed to enter your PIN.',
      enterPinConfirm: 'Enter your PIN to confirm', transactionCompleted: 'Transaction Completed Successfully!',
      thankYou: 'Thank you', success: 'Success', transactionSummary: 'Transaction Summary',
      receiveMoney: 'Receive Money', accountNo: 'Account No:', reason: 'Reason', addAmount: 'ADD AMOUNT',
      shareQr: 'Share QR', copyLink: 'Copy Link', download: 'Download', searchMenu: 'Search menu',
      typeToSearch: 'Type to search menus...', logOut: 'Log out', myInformation: 'My Information',
      bankName: 'Bank Name', account: 'Account', selectFromList: 'Select from the list', enterAccountNumber: 'Enter Account Number',
      enterAmount: 'Enter Amount', search: 'Search...', lastSignIn: 'Last Sign In', contactUs: 'Contact Us',
      myAccounts: 'My Accounts', phoneNumber: 'Phone Number', scanAccount: 'Scan this account number.',
      bankNameLong: 'Commercial Bank of Ethiopia', selectBank: 'Select from the list',
      preferences: 'Preferences', accountPreferences: 'Account Preferences',
      notificationPreferences: 'Notification Preferences', servicePreferences: 'Service Preferences',
      securitySettings: 'Security Settings', accountActions: 'Account Actions',
      biometricLogin: 'Biometric Login', changePin: 'Change PIN', changePassphrase: 'Change Passphrase',
      privacyPolicy: 'Privacy Policy', termsTariffs: 'Terms and Tariffs', version: 'Version',
      wallet: 'Wallet', transferToOtherBanks: 'Transfer to Other Banks', microFinances: 'Transfer to Micro Finances',
      sacco: 'SACCO', ethioTopup: 'Ethio telecom Topup', safaricomTopup: 'Safaricom Topup',
      buyAirtimeSelf: 'Buy Airtime - Self', buyAirtimeOthers: 'Buy Airtime - Others',
      ethioTopUpTitle: 'Ethio Telecom Top Up', safaricomTopUpTitle: 'Safaricom Top Up',
      cbeNoor: 'CBE NOOR', auth: 'Authenticating...', authenticated: 'Authenticated!',
      notifications: 'Notifications', allAccounts: 'All Accounts',
      customerReceipt: 'Customer Receipt', status: 'Status', completed: 'COMPLETED',
      companyInfo: 'Company Address & Other Information', customerInfo: 'Customer Information',
      paymentInfo: 'Payment / Transaction Information', country: 'Country', city: 'City', address: 'Address',
      postalCode: 'Postal code', swiftCode: 'SWIFT Code', email: 'Email', tel: 'Tel', fax: 'Fax',
      tinLabel: 'Tin', vatReceiptNo: 'VAT Receipt No', vatRegNo: 'VAT Registration No', vatRegDate: 'VAT Registration Date',
      customerName: 'Customer Name', region: 'Region', subCity: 'Sub City', wereda: 'Wereda/Kebele',
      branchLabel: 'Branch', payer: 'Payer', receiver: 'Receiver', paymentType: 'Payment Type',
      paymentDateTime: 'Payment Date & Time', referenceNo: 'Reference No. (VAT Invoice No)',
      reasonType: 'Reason / Type of service', transferredAmount: 'Transferred Amount',
      serviceCharge: 'Service Charge', vat: 'VAT (15% of service charge)',
      disaster: 'Disaster Risk Response Fund (5% of service charge)',
      totalDebited: "Total amount debited from customer's account",
      amountInWord: 'Amount in Word', downloadPdf: 'Download PDF',
      bankRelyOn: 'The Bank you can always rely on.', allRights: '© 2026 Commercial Bank of Ethiopia. All rights reserved.',
      noResults: 'No results found', summary: 'Transaction Summary',
      scanToPay: 'Scan to pay', myProfile: 'My Information', done: 'Done',
      companyName: 'Company Name', receiverBank: "Receiver's Bank",
      login: 'Login', fieldRequired: 'This field is required', enterPinTitle: 'Enter your PIN',
      selectLanguage: 'Select Language', change: 'Change',
      defaultAccountPreferences: 'Default Account Preferences', defaultAccounts: 'DEFAULT ACCOUNTS',
      sendingMoney: 'Sending Money', receivingMoney: 'Receiving Money',
      generalNotifications: 'General Notifications', serviceOptions: 'Service Options',
      securitySetting: 'Security Setting', biometricIsOn: 'Biometric login is on',
      updatePin: 'Update PIN', updatePassphrase: 'Update Passphrase',
      noWithdrawals: 'No withdrawal requests found yet.',
      noWithdrawalsHint: 'When you initiate a withdrawal, it will show up here.',
      contactAddresses: 'Contact addresses', socialMedias: 'Social medias',
      scanPhone: 'Scan this phone number.', withdrawalHistory: 'Withdrawal History',
      transferTo: 'Transfer to', amountRequired: 'Enter an amount',
      invalidAccount: 'Account number must be 13 digits', receiverName: 'Receiver full name',
      serviceChargeFee: 'Service charge', vatPct: 'VAT (%)', drfPct: 'Disaster recovery (%)',
      rates: 'Charges and taxes', madeReceipts: 'Made receipts', noReceipts: 'No receipts made yet',
      save: 'Save', saved: 'Saved', close: 'Close', receipt: 'Receipt', screenshot: 'Screenshot',
      share: 'Share', downloadReceipt: 'Download', printReceipt: 'Print',
      authFailed: 'Authentication failed', tryAgain: 'Try Again', usePinInstead: 'Use PIN Instead',
      biometricsRequired: 'Authentication required', confirmIdentity: 'Confirm your identity to continue.',
      fingerprint: 'Fingerprint', face: 'Face', securedBy: 'Secured by CBE',
      scanTitle: 'Scan your fingerprint', scanSub: 'Place your finger on the sensor to confirm.',
      savings: 'savings', selectAccount: 'Select account', defaultAccount: 'Default account preferences',
      sendingMoneyAccount: 'Saving Account', sendingMoney: 'Sending Money', receivingMoney: 'Receiving Money',
      all: 'All', debited: 'Debited', credited: 'Credited',
      fullReceipt: 'Full receipt', verifyReceiptTitle: 'Verify Receipt',
      minStatement: 'Mini Statement', filter: 'Filter', refreshHistoryBtn: 'Refresh History',
      newWithdrawal: 'New Withdrawal', walletTransfer: 'Wallet Transfer',
      internetBanking: 'Internet Banking', cbeLinks: 'CBE Links', survey: 'Survey',
      termsAndTariffs: 'Terms and Tariffs', exchangeRates: 'Exchange Rates',
      payForTitle: 'Pay for', merchantTitle: 'Pay to Merchant',
      enterMerchantCode: 'Enter merchant code', schoolFee: 'School Fee',
      comingSoonTitle: 'Coming Soon', goBack: 'Go Back',
      accountValidation: 'Account Validation',
      transferSummary: 'Transfer summary',
      receiptId: 'Receipt No.',
      balance: 'Balance',
      name: 'Name',
      phone: 'Phone number',
      optional: 'Optional',
      moreServices: 'More services',
      moreTitle: 'More'
    },
    am: {
      hello: 'ሰላም', language: 'አማርኛ', home: 'ዋና ገጽ', transactions: 'ግብይቶች', settings: 'ቅንብሮች',
      sendMoney: 'አስተላልፍ', getPaid: 'መቀበል', airtime: 'ካርድ መሙላት', otherTransfers: 'ሌሎች ዝውውሮች',
      cbeBirr: 'CBEBirr', billsUtilities: 'ደረሰኞች እና አገልግሎቶች', banking: 'የባንክ አገልግሎት', government: 'የመንግስት አገልግሎቶች',
      scanQr: 'QR ቃኝ', miniStatement: 'አጭር ሂሳብ', cashOut: 'ጥሬ ገንዘብ', billShare: 'ደረሰኝ አጋራ', cards: 'ካርዶች',
      tagline: 'ሁል ጊዜ የሚታመኑት ባንክ!', savingAccount: 'የቁጠባ ሂሳብ',
      welcomeBack: 'እንኳን ደህና መጡ', useBiometrics: 'የጣት አሻራ ይጠቀሙ', usePin: 'ፒን ይጠቀሙ',
      fromAccount: 'ከሂሳብ', accountNumber: 'የሂሳብ ቁጥር', amount: 'መጠን', addRemark: 'ማስታወሻ ያክሉ',
      defaultRemark: '*ነባሪ፡ የሞባይል ዝውውር', continue: 'ይቀጥሉ', recentTransfers: 'የቅርብ ዝውውሮች',
      beneficiaries: 'ተጠቃሚዎች', noBeneficiaries: 'ተጠቃሚ አልተገኘም', pleaseConfirm: 'እባክዎ ያረጋግጡ',
      from: 'ከ', to: 'ወደ', totalAmount: 'ጠቅላላ መጠን', cancel: 'ሰርዝ', transfer: 'አስተላልፍ',
      verifyIdentity: 'ማንነትዎን ያረጋግጡ', scanFingerprint: 'ዝውውሩን ለማጠናቀቅ የጣት አሻራዎን ያንሱ',
      biometricsAuthenticated: 'የጣት አሻራ ተረጋግጧል!', proceedPin: 'ፒንዎን ለማስገባት ይቀጥሉ።',
      enterPinConfirm: 'ለማረጋገጥ ፒንዎን ያስገቡ', transactionCompleted: 'ግብይቱ በተሳካ ሁኔታ ተጠናቅቋል!',
      thankYou: 'እናመሰግናለን', success: 'ተሳክቷል', transactionSummary: 'የግብይት ማጠቃለያ',
      receiveMoney: 'ገንዘብ ይቀበሉ', accountNo: 'የሂሳብ ቁጥር:', reason: 'ምክንያት', addAmount: 'መጠን ያክሉ',
      shareQr: 'QR አጋራ', copyLink: 'ሊንክ ቅዳ', download: 'አውርድ', searchMenu: 'ማውጫ ይፈልጉ',
      typeToSearch: 'ማውጫዎችን ለመፈለግ ይጻፉ...', logOut: 'ውጣ', myInformation: 'የእኔ መረጃ',
      bankName: 'የባንክ ስም', account: 'ሂሳብ', selectFromList: 'ከዝርዝሩ ይምረጡ', enterAccountNumber: 'የሂሳብ ቁጥር ያስገቡ',
      enterAmount: 'መጠን ያስገቡ', search: 'ፈልግ...', lastSignIn: 'የመጨረሻ ግባት', contactUs: 'ያግኙን',
      myAccounts: 'የእኔ ሂሳቦች', phoneNumber: 'ስልክ ቁጥር', scanAccount: 'ይህን የሂሳብ ቁጥር ይቃኙ።',
      bankNameLong: 'የኢትዮጵያ ንግድ ባንክ', selectBank: 'ከዝርዝሩ ይምረጡ',
      preferences: 'ምርጫዎች', accountPreferences: 'የሂሳብ ምርጫዎች',
      notificationPreferences: 'የማሳወቂያ ምርጫዎች', servicePreferences: 'የአገልግሎት ምርጫዎች',
      securitySettings: 'የደህንነት ቅንብሮች', accountActions: 'የሂሳብ እርምጃዎች',
      biometricLogin: 'የጣት አሻራ መግቢያ', changePin: 'ፒን ቀይር', changePassphrase: 'የይለፍ ሐረግ ቀይር',
      privacyPolicy: 'የግላዊነት መመሪያ', termsTariffs: 'ውሎች እና ተመኖች', version: 'ቅጥያ',
      wallet: 'ዋሌት', transferToOtherBanks: 'ወደ ሌሎች ባንኮች', microFinances: 'ወደ ጥቃቅን ፋይናንስ',
      sacco: 'ሳኮ', ethioTopup: 'ኢትዮ ቴሌኮም ጫና', safaricomTopup: 'ሳፋሪኮም ጫና',
      buyAirtimeSelf: 'ለራሴ ካርድ ግዛ', buyAirtimeOthers: 'ለሌሎች ካርድ ግዛ',
      ethioTopUpTitle: 'የኢትዮ ቴሌኮም ጫና', safaricomTopUpTitle: 'የሳፋሪኮም ጫና',
      cbeNoor: 'CBE NOOR', auth: 'በማረጋገጥ ላይ...', authenticated: 'ተረጋግጧል!',
      notifications: 'ማሳወቂያዎች', allAccounts: 'ሁሉም ሂሳቦች',
      customerReceipt: 'የደንበኛ ደረሰኝ', status: 'ሁኔታ', completed: 'ተጠናቅቋል',
      companyInfo: 'የኩባንያ አድራሻ እና ሌሎች መረጃዎች', customerInfo: 'የደንበኛ መረጃ',
      paymentInfo: 'የክፍያ / ግብይት መረጃ', country: 'ሀገር', city: 'ከተማ', address: 'አድራሻ',
      postalCode: 'ፖስታ ኮድ', swiftCode: 'ስዊፍት ኮድ', email: 'ኢሜይል', tel: 'ስልክ', fax: 'ፋክስ',
      tinLabel: 'ቲን', vatReceiptNo: 'የተእ ደረሰኝ ቁጥር', vatRegNo: 'የተእ ምዝገባ ቁጥር', vatRegDate: 'የተእ ምዝገባ ቀን',
      customerName: 'የደንበኛ ስም', region: 'ክልል', subCity: 'ክፍለ ከተማ', wereda: 'ወረዳ/ቀበሌ',
      branchLabel: 'ቅርንጫፍ', payer: 'ከፋይ', receiver: 'ተቀባይ', paymentType: 'የክፍያ ዓይነት',
      paymentDateTime: 'የክፍያ ቀን እና ሰዓት', referenceNo: 'ማጣቀሻ ቁጥር',
      reasonType: 'ምክንያት / የአገልግሎት ዓይነት', transferredAmount: 'የተላለፈው መጠን',
      serviceCharge: 'የአገልግሎት ክፍያ', vat: 'ተእ (15%)',
      disaster: 'የአደጋ መከላከያ ፈንድ (5%)',
      totalDebited: 'ከሂሳብዎ የተቀነሰው ጠቅላላ መጠን', amountInWord: 'የመጠን ቃላት', downloadPdf: 'PDF አውርድ',
      bankRelyOn: 'ሁል ጊዜ የሚታመኑት ባንክ።', allRights: '© 2026 የኢትዮጵያ ንግድ ባንክ። መብቱ በህግ የተጠበቀ ነው።',
      noResults: 'ውጤት አልተገኘም', summary: 'የግብይት ማጠቃለያ',
      scanToPay: 'ለመክፈል ይቃኙ', myProfile: 'የእኔ መረጃ', done: 'ተጠናቅቋል',
      companyName: 'የኩባንያ ስም', receiverBank: 'የተቀባዩ ባንክ',
      login: 'ግባ', fieldRequired: 'ይህ መስክ ያስፈልጋል', enterPinTitle: 'ፒንዎን ያስገቡ',
      selectLanguage: 'ቋንቋ ይምረጡ', change: 'ቀይር',
      defaultAccountPreferences: 'ነባሪ የሂሳብ ምርጫዎች', defaultAccounts: 'ነባሪ ሂሳቦች',
      sendingMoney: 'ገንዘብ መላክ', receivingMoney: 'ገንዘብ መቀበል',
      generalNotifications: 'ጠቅላላ ማሳወቂያዎች', serviceOptions: 'የአገልግሎት አማራጮች',
      securitySetting: 'የደህንነት ቅንብር', biometricIsOn: 'የጣት አሻራ ግቤት በርቷል',
      updatePin: 'ፒን አዘምን', updatePassphrase: 'የይለፍ ሐረግ አዘምን',
      noWithdrawals: 'እስካሁን የወጪ ጥያቄ አልተገኘም።',
      noWithdrawalsHint: 'ወጪ ሲጀምሩ እዚህ ይታያል።',
      contactAddresses: 'የመገኛ አድራሻዎች', socialMedias: 'ማህበራዊ ሚዲያ',
      scanPhone: 'ይህን ስልክ ቁጥር ይቃኙ።', withdrawalHistory: 'የወጪ ታሪክ',
      transferTo: 'ወደ', amountRequired: 'መጠን ያስገቡ',
      invalidAccount: 'የሂሳብ ቁጥር 13 አሃዝ መሆን አለበት', receiverName: 'የተቀባዩ ሙሉ ስም',
      serviceChargeFee: 'የአገልግሎት ክፍያ', vatPct: 'ተእ (%)', drfPct: 'የአደጋ ፈንድ (%)',
      rates: 'ክፍያዎች እና ታክሶች', madeReceipts: 'የተሰሩ ደረሰኞች', noReceipts: 'እስካሁን ደረሰኝ አልተሰራም',
      save: 'አስቀምጥ', saved: 'ተቀምጧል', close: 'ዝጋ', receipt: 'ደረሰኝ', screenshot: 'ፎቶ',
      share: 'አጋራ', downloadReceipt: 'አውርድ', printReceipt: 'አትም',
      authFailed: 'ማረጋገጫ አልተሳካም', tryAgain: 'እንደገና ሞክር', usePinInstead: 'በፒን ተጠቀም',
      biometricsRequired: 'ማረጋገጫ ያስፈልጋል', confirmIdentity: 'ለመቀጠል ማንነትዎን ያረጋግጡ።',
      fingerprint: 'የጣት አሻራ', face: 'ፊት', securedBy: 'በCBE የተጠበቀ',
      scanTitle: 'የጣት አሻራዎን ያንሱ', scanSub: 'ለማረጋገጥ ጣትዎን በሴንሰሩ ላይ ያድርጉ።',
      savings: 'ቁጠባ', selectAccount: 'ሂሳብ ይምረጡ', defaultAccount: 'ነባሪ የሂሳብ ምርጫዎች',
      sendingMoneyAccount: 'የቁጠባ ሂሳብ', sendingMoney: 'ገንዘብ መላክ', receivingMoney: 'ገንዘብ መቀበል',
      all: 'ሁሉም', debited: 'የተቀነሰ', credited: 'የተጨመረ',
      fullReceipt: 'ሙሉ ደረሰኝ', verifyReceiptTitle: 'ደረሰኝ አረጋግጥ',
      minStatement: 'አጭር ሂሳብ', filter: 'አጣራ', refreshHistoryBtn: 'ታሪክ አድስ',
      newWithdrawal: 'አዲስ ወጪ', walletTransfer: 'የዋሌት ዝውውር',
      internetBanking: 'የኢንተርኔት ባንክ', cbeLinks: 'የCBE ሊንኮች', survey: 'የምርጫ ጥናት',
      termsAndTariffs: 'ውሎች እና ተመኖች', exchangeRates: 'የምንዛሬ ተመን',
      payForTitle: 'ይክፈሉ', merchantTitle: 'ለነጋዴ ይክፈሉ',
      enterMerchantCode: 'የነጋዴ ኮድ ያስገቡ', schoolFee: 'የትምህርት ክፍያ',
      comingSoonTitle: 'በቅርቡ', goBack: 'ተመለስ',
      accountValidation: 'የሂሳብ ማረጋገጫ',
      transferSummary: 'የዝውውር ማጠቃለያ',
      receiptId: 'የደረሰኝ ቁጥር',
      balance: 'ቀሪ ሂሳብ',
      name: 'ስም',
      phone: 'ስልክ ቁጥር',
      optional: 'አማራጭ',
      moreServices: 'ተጨማሪ አገልግሎቶች',
      moreTitle: 'ተጨማሪ'
    }
  };

  CBE.data = {
    user: user,
    accounts: accounts,
    transactions: transactions,
    recents: recents,
    beneficiaries: beneficiaries,
    banks: banks,
    wallets: wallets,
    airtimeProviders: airtimeProviders,
    airtimeOptions: airtimeOptions,
    billers: billers,
    otherTransfers: otherTransfers,
    microFinances: microFinances,
    saccos: saccos,
    bankingServices: bankingServices,
    governmentServices: governmentServices,
    payMerchants: payMerchants,
    taxPayments: taxPayments,
    shoppingMerchants: shoppingMerchants,
    entertainmentMerchants: entertainmentMerchants,
    travelServices: travelServices,
    otherServices: otherServices,
    loanProducts: loanProducts,
    cbebirrOptions: cbebirrOptions,
    cardTypes: cardTypes,
    serviceCatalog: serviceCatalog,
    branches: branches,
    agents: agents,
    rates: rates,
    homeTileIcons: homeTileIcons,
    homeCards: homeCards,
    homeExtras: homeExtras,
    strings: strings,
    version: '6.1.0',
    branch: 'Ras Desta Damtew St, 01, Kirkos, Addis Ababa',
    swift: 'CBETETAA',
    tel: '+251-551-50-04',
    email: 'info@cbe.com.et'
  };
})(typeof window !== 'undefined' ? window : this);
