/* ==========================================================================
   brands.js — every institution the app can talk about, with the uploaded
   artwork where it exists and a colour-matched mark where it does not, so a
   logo never 404s.
   ========================================================================== */
(function (global) {
  'use strict';

  var CBE = global.CBE || (global.CBE = {});
  var B = 'img/brands/';

  function L(name, file, code) { return { name: name, logo: B + file, code: code }; }
  function M(name, text, color, code) { return { name: name, mark: [text, color], code: code }; }
  function C(name, code) { return { name: name, chip: true, code: code }; }          /* e-birr style card chip */
  function E(name, emblem, code) { return { name: name, emblem: emblem, code: code }; }

  /* ---------------------------------------------- banks & wallets (A → Z) */
  var banks = [
    L('Abay Bank', 'abay.png', 'ABAY'),
    L('Addis Bank', 'addis.png', 'ADDI'),
    L('Ahadu Bank', 'ahadu.png', 'AHAD'),
    C('Ahadu E-birr', 'AHAD-EB'),
    L('Amhara Bank', 'amhara.png', 'AMHR'),
    L('Awash Bank', 'awash.png', 'AWAS'),
    L('Bank of Abyssinia', 'abyssinia.png', 'BOAB'),
    L('Berhan Bank', 'berhan.png', 'BRHN'),
    L('Bunna Bank', 'bunna.png', 'BUNN'),
    L('Cooperative Bank of Oromia S.C.', 'coop.png', 'CBOR'),
    C('Coopay E-Birr', 'COOP-EB'),
    L('Dashen Bank', 'dashen.png', 'DASH'),
    L('Enat Bank', 'enat.png', 'ENAT'),
    M('Gadaa Bank', 'Ga', '#e2231a', 'GADA'),
    M('Global Bank Ethiopia', 'G', '#0e6b3c', 'GLBL'),
    M('Goh Betoch Bank', 'GB', '#1b6ea8', 'GOHE'),
    C('H-CASH', 'HCAS'),
    E('Halal Pay', 'halalpay', 'HALA'),
    M('Hibret Bank', 'H', '#2f8f6a', 'HIBR'),
    M('Hijra Bank', 'H', '#1f6fb2', 'HIJR'),
    E('Kacha', 'kacha', 'KACH'),
    M('Lion International Bank', 'L', '#b8860b', 'LION'),
    L('M-Pesa', 'mpesa.png', 'MPES'),
    C('Nib E-birr', 'NIBE'),
    L('Nib International Bank', 'nib.png', 'NIBB'),
    M('Omo Bank', 'O', '#0a6ebd', 'OMOB'),
    L('Oromia Bank', 'oromia.png', 'OROM'),
    M('Rammis Bank', 'R', '#22509c', 'RAMM'),
    M('Shabelle Bank', 'S', '#0b7a75', 'SHAB'),
    M('Sidama Bank', 'S', '#33564d', 'SIDA'),
    M('Siinqee Bank', 'S', '#6f9a2b', 'SIIN'),
    L('Wegagen Bank', 'wegagen.png', 'WEGA'),
    L('Zemen Bank', 'zemen.png', 'ZEME'),
    L('Tsehay Bank', 'tsehay.png', 'TSEH'),
    L('Telebirr', 'telebirr.png', 'TELE'),
    L('EBirr', 'ebirr.png', 'EBIR'),
    L('SahaayPay', 'sahaypay.png', 'SAHA'),
    L('YaYa Wallet', 'yaya.png', 'YAYA'),
    L('BinGet Birr', 'binget.png', 'BING')
  ];

  var wallets = [
    L('TeleBirr', 'telebirr.png', 'TELE'),
    L('EBirr', 'ebirr.png', 'EBIR'),
    L('M-Pesa', 'mpesa.png', 'MPES'),
    L('YaYa Wallet', 'yaya.png', 'YAYA'),
    L('BinGet Birr', 'binget.png', 'BING'),
    L('SahayPay', 'sahaypay.png', 'SAHA'),
    M('VitaBirr', 'VB', '#1554a8', 'VITA')
  ];

  var airtime = [
    L('Ethio telecom Topup', 'ethiotelecom.png', 'ETC'),
    E('Safaricom Topup', 'safaricom', 'SAFA')
  ];

  var bills = [
    E('Ethiopian Electric Utility Prepaid', 'ethiopian-electric', 'EEU'),
    E('Safaricom Bill Payment', 'safaricom', 'SAFA'),
    E('AAWSA', 'aawsa', 'AAWS'),
    L('Ethio Telecom Postpaid', 'ethiotelecom.png', 'ETC'),
    E('WeBirr', 'webirr', 'WEBR'),
    E('WebSprix', 'websprix', 'WSRX'),
    E('Safaricom Deposit', 'safaricom', 'SAFA'),
    E('EEU Postpaid', 'eeu', 'EEU')
  ];

  var micro = [
    M('Amhara Credit & Saving Institution', 'ACSI', '#1b5e9c', 'ACSI'),
    M('Oromia Credit & Saving', 'OCSS', '#0f7b6c', 'OCSS'),
    M('Addis Credit & Saving', 'ADCSI', '#7b2bbd', 'ADCS'),
    M('Dedebit Credit & Saving', 'DECSI', '#c0392b', 'DECS'),
    M('Sidama Micro Finance', 'SMFI', '#2f8f6a', 'SMFI'),
    M('Busa Gonofa Micro Finance', 'BG', '#0a6ebd', 'BUSG'),
    M('Wasasa Micro Finance', 'WMFI', '#b8860b', 'WASA'),
    M('PEACE Micro Finance', 'PMFI', '#1f6fb2', 'PEAC')
  ];

  var saccos = [
    M('Police SACCO', 'POL', '#1f3b8c', 'PLC'),
    M('Teachers SACCO', 'TCH', '#0f7b6c', 'TCH'),
    M('Defence SACCO', 'DEF', '#5d6d3a', 'DEF'),
    M('Government Employees SACCO', 'GOV', '#7b2bbd', 'GOV'),
    M('Ethio Telecom SACCO', 'ETC', '#1b8f4a', 'ETC'),
    M('Health Workers SACCO', 'HLT', '#c0392b', 'HLT')
  ];

  var branches = [
    { name: 'Ras Desta Damtew Branch', addr: 'Ras Desta Damtew St, 01', code: '00140', open: 'Open \u2022 8:30 AM \u2013 5:00 PM' },
    { name: 'Bole Medhanialem Branch', addr: 'Bole Road, near Getu Commercial', code: '00235', open: 'Open \u2022 8:30 AM \u2013 5:00 PM' },
    { name: 'Meskel Flower Branch', addr: 'Meskel Flower Road, Kirkos', code: '00318', open: 'Open \u2022 8:30 AM \u2013 5:00 PM' },
    { name: 'Piassa Branch', addr: 'Addis Ababa, Arada Sub City', code: '00012', open: 'Closed \u2022 opens 8:30 AM' },
    { name: 'Megaz Quarter Branch', addr: 'Bishoftu, Oromia', code: '00521', open: 'Open \u2022 8:30 AM \u2013 5:00 PM' },
    { name: 'Adama Branch', addr: 'Adama, Oromia Region', code: '00704', open: 'Open \u2022 8:30 AM \u2013 5:00 PM' }
  ];

  var agents = [
    { name: 'Selam Grocery Agent', code: 'AGT-1042', addr: 'Kirkos, Woreda 03', dist: '120 m' },
    { name: 'Zewditu Mini Market', code: 'AGT-1188', addr: 'Bole, Woreda 06', dist: '340 m' },
    { name: 'Abel Mobile Shop', code: 'AGT-1290', addr: 'Arada, Woreda 01', dist: '780 m' },
    { name: 'Fana Pharmacy Agent', code: 'AGT-1334', addr: 'Yeka, Woreda 09', dist: '1.2 km' }
  ];

  var otherServices = [
    { id: 'rates', name: 'Exchange Rates', icon: 'exchange' },
    { id: 'internet', name: 'Internet Banking', icon: 'globe' },
    { id: 'ussd', name: 'USSD', icon: 'ussd' },
    { id: 'verify', name: 'Verify Receipt', icon: 'receiptCheck' },
    { id: 'feedback', name: 'Feedback', icon: 'chat' },
    { id: 'locator', name: 'CBE Locator', icon: 'mapPin' },
    { id: 'callcenter', name: 'Call Center', icon: 'phone' },
    { id: 'privacy', name: 'Privacy Policy', coin: true },
    { id: 'terms', name: 'Terms and Tariffs', coin: true },
    { id: 'survey', name: 'Survey', coin: true },
    { id: 'links', name: 'CBE Links', icon: 'link', wide: true }
  ];

  var servicePrefs = [
    { key: 'ussd', name: 'USSD Enabled', desc: 'Allow USSD interactions for specific services', icon: 'ussd' }
  ];

  var notificationPrefs = [
    { key: 'sms', name: 'SMS Notifications', desc: 'Receive important updates via SMS', icon: 'chat' },
    { key: 'email', name: 'Email Notifications', desc: 'Get emails for account activity and promotions', icon: 'mail' },
    { key: 'push', name: 'Push Notifications', desc: 'Receive instant alerts on your device', icon: 'bell' },
    { key: 'inapp', name: 'In-App Notifications', desc: 'See notifications directly within the app', icon: 'chat' }
  ];

  var rates = [
    ['USD', 'US Dollar', '124.8500', '127.3470'],
    ['EUR', 'Euro', '134.2200', '136.9044'],
    ['GBP', 'British Pound', '157.4000', '160.5480'],
    ['AED', 'UAE Dirham', '33.9500', '34.6290'],
    ['SAR', 'Saudi Riyal', '33.2400', '33.9048'],
    ['CAD', 'Canadian Dollar', '91.1000', '92.9220'],
    ['CNY', 'Chinese Yuan', '17.3200', '17.6664'],
    ['JPY', 'Japanese Yen', '0.8100', '0.8262']
  ];

  /* resolve a brand entry into its visual */
  function brandVisual(b, size) {
    var s = size || 40;
    if (b.logo) return '<img src="' + b.logo + '" alt="" width="' + s + '" height="' + s + '" style="width:' + s + 'px;height:' + s + 'px;object-fit:contain">';
    if (b.emblem) return CBE.emblem(b.emblem, s);
    if (b.mark) return CBE.mark(b.mark[0], b.mark[1], s);
    if (b.chip) return '<span style="display:grid;place-items:center;width:' + s + 'px;height:' + s + 'px;color:#7b2bbd">' + CBE.icon('creditCard', Math.round(s * 0.7)) + '</span>';
    return CBE.mark(CBE.initials(b.name), '#7b2bbd', s);
  }

  CBE.brands = {
    banks: banks,
    wallets: wallets,
    airtime: airtime,
    bills: bills,
    micro: micro,
    saccos: saccos,
    branches: branches,
    agents: agents,
    otherServices: otherServices,
    servicePrefs: servicePrefs,
    notificationPrefs: notificationPrefs,
    rates: rates,
    visual: brandVisual,
    findBank: function (name) {
      for (var i = 0; i < banks.length; i++) if (banks[i].name === name) return banks[i];
      return null;
    }
  };
})(typeof window !== 'undefined' ? window : this);
