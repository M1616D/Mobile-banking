/* =========================================================================
   brands.js — the service catalogue.
   Every tile, row and list on every category screen of the reference UI is
   declared here, in the same order the screenshots show them.
   item = { label, sub?, img?, icon?, to?, kind? }
     img   -> asset under img/brands/
     to    -> another catalogue key, or the id of a special screen
   ========================================================================= */
(function (global) {
  "use strict";

  var B = "img/brands/";

  /* quick actions strip on the home screen (horizontally scrollable) */
  var QUICK = [
    { label: "Mini\nStatement", icon: "list", to: "coming", params: { title: "Mini Statement", body: "We are working on a new Mini Statement feature! You will soon be able to pick your account and set a time range to generate your statement." } },
    { label: "Cash Out", icon: "dollarCircle", to: "coming", params: { title: "Cash Out", body: "Cash Out is being upgraded. You will soon be able to withdraw to an agent or an ATM near you." } },
    { label: "Bill Share", icon: "shareAlt", to: "coming", params: { title: "Bill Share", body: "Bill Share is on the way! Soon you will be able to split and share your bills with ease. Stay tuned for the launch!" } },
    { label: "Cards", icon: "card", to: "cards" },
    { label: "Withdrawal\nHistory", icon: "ticketArrow", to: "withdrawals" },
    { label: "Schedules", icon: "clock", to: "scheduled" },
    { label: "Receipt", icon: "checkCircle", to: "receipts" }
  ];

  /* the 16 home service tiles, in the order the screenshots show them */
  var HOME_TILES = [
    { label: "CBE Transfer", sub: "Send Money", icon: "arrowUpRight", bubble: "red", to: "transfer" },
    { label: "Receive", sub: "Get Paid", icon: "arrowDownLeft", bubble: "green", to: "receive" },
    { label: "Airtime", icon: "phone", to: "airtime" },
    { label: "Other Transfers", icon: "repeat", to: "other" },
    { label: "CBEBirr", icon: "wallet", to: "cbebirr" },
    { label: "Bills & Utilities", icon: "receiptLines", to: "bills" },
    { label: "Banking", icon: "bank", to: "banking" },
    { label: "Government Services", icon: "building", to: "gov" },
    { label: "Pay to Merchant", icon: "store", to: "merchant" },
    { label: "Travel", icon: "bus", to: "travel" },
    { label: "Shopping", icon: "cart", to: "shopping" },
    { label: "Entertainment", icon: "film", to: "entertainment" },
    { label: "Pay for", icon: "handCoin", to: "payfor" },
    { label: "Tax Payment", icon: "receiptLines", to: "tax" },
    { label: "Ethiopian Shipping & Logistics", icon: "ship", to: "esl" },
    { label: "CBE Fast Loan", icon: "moneyBag", to: "loan" }
  ];

  /* forms reuse a single generic screen: label + input(s) + Continue */
  function form(title, fields, opts) {
    return Object.assign({ kind: "form", title: title, fields: fields }, opts || {});
  }

  /* ------------------------------------------------- the "Other Bank" list --
     The bank picker behind Account Validation, in the exact order the
     screenshots scroll it.  Items without an `img` fall back to a monogram
     disc, because the design folder carries no asset for that brand.        */
  var BANK_LIST = [
    { label: "Abay Bank", img: B + "abay.png" },
    { label: "Addis Bank", img: B + "addis.png" },
    { label: "Ahadu Bank", img: B + "ahadu.png" },
    { label: "Ahadu E-birr", img: B + "ahadu-ebirr.svg" },
    { label: "Amhara Bank", img: B + "amhara.png" },
    { label: "Awash Bank", img: B + "awash.png" },
    { label: "Bank of Abyssinia", img: B + "abyssinia.png" },
    { label: "Berhan Bank", img: B + "berhan.png" },
    { label: "Bunna Bank", img: B + "buna.png" },
    { label: "Cooperative Bank of Oromia S.C.", img: B + "coop.svg" },
    { label: "Coopay E-Birr", img: B + "coopay.svg" },
    { label: "Dashen Bank", img: B + "dashen.png" },
    { label: "Enat Bank", img: B + "enat.png" },
    { label: "Gadaa Bank" },
    { label: "Global Bank Ethiopia" },
    { label: "Goh Betoch Bank" },
    { label: "H-CASH" },
    { label: "Halal Pay" },
    { label: "Hibret Bank" },
    { label: "Hijra Bank" },
    { label: "Kacha" },
    { label: "Lion International Bank" },
    { label: "M-Pesa", img: B + "mpesa.png" },
    { label: "Nib E-birr" },
    { label: "Nib International Bank", img: B + "nib.png" },
    { label: "Omo Bank" },
    { label: "Oromia Bank", img: B + "oromia.png" },
    { label: "Ramnis Bank" },
    { label: "Shabelle Bank" },
    { label: "Sidama Bank" },
    { label: "Siinqee Bank" },
    { label: "Siket Bank" },
    { label: "Tsedey Bank" },
    { label: "Tsehay Bank", img: B + "tsehay.png" },
    { label: "VitaBirr Financial Service S.C", img: B + "vitabirr.svg" },
    { label: "Wegaben Bank" },
    { label: "Wegaben E-Birr" },
    { label: "YaYa Wallet", img: B + "yaya.png" },
    { label: "ZamZam Bank" },
    { label: "Zemen Bank", img: B + "zemen.png" }
  ];

  /* ------------------------------------------ the "Micro Finance" list --
     "Transfer to Micro Finances" opens Account Validation first: the
     microfinance is chosen from this list, then the account number is typed.
     Only after that does the picker list itself appear. */
  var MICRO_LIST = [
    { label: "KAAFI Microfinance", img: B + "kaafi.png" },
    { label: "RAYS Microfinance", img: B + "rays.png" },
    { label: "Vision Fund Microfinance", img: B + "vision.png" }
  ];

  var CATALOG = {
    /* ------------------------------------------------------------ travel */
    airtime: {
      kind: "tiles", title: "Airtime", search: true, items: [
        { label: "Ethio telecom Topup", img: B + "ethiotelecom.png", to: "ethioTopup" },
        { label: "Safaricom Topup", img: B + "mpesa.png", to: "safaricomTopup" }
      ]
    },
    ethioTopup: {
      kind: "rows", title: "Ethio telecom Topup", search: true, items: [
        { label: "Buy Airtime - Self", sub: "Buy Airtime - Self", img: B + "ethiotelecom.png", data: "self" },
        { label: "Buy Airtime - Others", sub: "Buy Airtime - Others", img: B + "ethiotelecom.png", data: "other" }
      ]
    },
    safaricomTopup: {
      kind: "rows", title: "Safaricom Topup", search: true, items: [
        { label: "Buy Airtime - Self", sub: "Buy Airtime - Self", img: B + "mpesa.png", data: "self" },
        { label: "Buy Airtime - Others", sub: "Buy Airtime - Others", img: B + "mpesa.png", data: "other" }
      ]
    },

    /* ---------------------------------------------------- other transfers */
    other: {
      kind: "rows", title: "Other Transfers", search: true, items: [
        { label: "Wallet", sub: "Wallet", icon: "walletSolid", to: "wallet" },
        { label: "Transfer to Other Banks", sub: "Transfer to Other Banks", img: B + "flomart.png", to: "otherBank" },
        { label: "Transfer to Micro Finances", sub: "Transfer to Micro Finances", icon: "dollarCircle", to: "microfinance" },
        { label: "SACCO", sub: "SACCO", icon: "cashSolid", to: "sacco" }
      ]
    },
    wallet: {
      kind: "tiles", title: "Wallet", search: true, items: [
        { label: "TeleBirr", img: B + "telebirr.png", to: "walletForm" },
        { label: "EBirr", img: B + "ebirr.png", to: "walletForm" },
        { label: "M-Pesa", img: B + "mpesa.png", to: "walletForm" },
        { label: "YaYa Wallet", img: B + "yaya.png", to: "walletForm" },
        { label: "BinGet Birr", img: B + "binget.png", to: "walletForm" },
        { label: "SahayPay", img: B + "sahaypay.png", to: "walletForm" },
        { label: "VitaBirr", img: B + "vitabirr.svg", to: "walletForm" }
      ]
    },
    /* "Transfer to Other Banks" stops on Account Validation first: the bank is
       picked from a searchable sheet, then the account number is typed. */
    otherBank: form("Account Validation", [
      { label: "Bank Name", icon: "bank", type: "select", key: "bankName",
        placeholder: "Select from the list", options: BANK_LIST, picker: true },
      { label: "Account", icon: "cash", type: "tel", maxlength: 20, key: "account",
        placeholder: "Enter Account Number" }
    ], { channel: "otherbank", continueLabel: "Continue", nav: false }),

    microfinance: form("Account Validation", [
      { label: "Microfinance Name", icon: "dollarCircle", type: "select", key: "bankName",
        placeholder: "Select from the list", options: MICRO_LIST, picker: true },
      { label: "Account", icon: "cash", type: "tel", maxlength: 13, key: "account",
        placeholder: "Enter Account Number" }
    ], { channel: "mb", continueLabel: "Continue", nav: false }),
    microForm: form("Transfer to Micro Finance", [
      { label: "Microfinance Name", icon: "dollarCircle", type: "select", options: MICRO_LIST, key: "bankName" },
      { label: "Account", icon: "idCard", type: "tel", maxlength: 13, key: "account", placeholder: "Enter Account Number" }
    ], { channel: "mb" }),

    sacco: {
      kind: "tiles", title: "SACCO", search: true, items: [
        { label: "Awach SACCO", img: B + "sacco-awach.svg", to: "saccoForm" },
        { label: "Yehulu SACCO", img: B + "sacco-yehulu.svg", to: "saccoForm" },
        { label: "Dil SACCO", img: B + "sacco-dil.svg", to: "saccoForm" },
        { label: "Amigos SACCO", img: B + "sacco-amigos.svg", to: "saccoForm" }
      ]
    },
    saccoForm: form("SACCO", [
      { label: "SACCO Name", icon: "cashSolid", type: "select", options: ["Awach SACCO", "Yehulu SACCO", "Dil SACCO", "Amigos SACCO"], key: "bankName" },
      { label: "Member ID", icon: "idCard", type: "tel", key: "member", placeholder: "Enter Member ID" },
      { label: "Account", icon: "bank", type: "tel", maxlength: 13, key: "account", placeholder: "Enter Account Number" }
    ], { channel: "mb" }),

    /* ------------------------------------------------------------ cbebirr */
    cbebirr: {
      kind: "rows", title: "CBEBirr", search: true, items: [
        { label: "Transfer to own CBEBirr wallet", sub: "Transfer to own CBEBirr wallet", img: B + "cbebirr.png", to: "cbebirrForm" },
        { label: "Transfer to other CBEBirr wallet", sub: "Transfer to other CBEBirr wallet", img: B + "cbebirr.png", to: "cbebirrForm" },
        { label: "Transfer to CBEBirr Agent", sub: "Transfer to CBEBirr Agent", img: B + "cbebirr.png", to: "cbebirrForm" }
      ]
    },
    cbebirrForm: form("CBEBirr", [
      { label: "CBEBirr Number", icon: "wallet", type: "tel", key: "account", placeholder: "Enter CBEBirr Number" }
    ], { channel: "cbebirr" }),

    /* -------------------------------------------------- bills & utilities */
    bills: {
      kind: "tiles", title: "Bills & Utilities", search: true, items: [
        { label: "Ethiopian Electric Utility Prepaid", img: B + "eeu.png", to: "billsForm" },
        { label: "Safaricom Bill Payment", img: B + "mpesa.png", to: "billsForm" },
        { label: "AAWSA", img: B + "aawsa.png", to: "billsForm" },
        { label: "Ethio Telecom Postpaid", img: B + "ethiotelecom.png", to: "billsForm" },
        { label: "WeBirr", img: B + "webirr.png", to: "billsForm" },
        { label: "WebSpirix", img: B + "websprix.png", to: "billsForm" },
        { label: "Safaricom Deposit", img: B + "mpesa.png", to: "billsForm" },
        { label: "EEU Postpaid", img: B + "eeu.png", to: "billsForm" }
      ]
    },
    billsForm: form("Bills & Utilities", [
      { label: "Customer Number", icon: "idCard", type: "tel", key: "account", placeholder: "Enter Customer Number" }
    ], { channel: "bill" }),

    /* ------------------------------------------------------------- banking */
    banking: {
      kind: "tiles", title: "Banking", search: true, items: [
        { label: "Beneficiary", icon: "users", to: "beneficiary" },
        { label: "Cards", icon: "card", to: "cards" }
      ]
    },
    beneficiary: {
      kind: "rows", title: "Beneficiary", search: true, dynamic: "beneficiaries"
    },

    /* -------------------------------------------------- government services */
    gov: {
      kind: "rows", title: "Government Services", search: true, items: [
        { label: "ICS / Immigration", sub: "ICS / Immigration", icon: "idCard", to: "govForm" },
        { label: "Mesob Services", sub: "Mesob Services", icon: "building", to: "govForm" },
        { label: "DARS", sub: "DARS", img: B + "dars.png", to: "govForm" },
        { label: "A.A TMA Parking Payment", sub: "A.A TMA Parking Payment", img: B + "aatma.png", to: "govForm" },
        { label: "A.A TMA Traffic Penalty", sub: "A.A TMA Traffic Penalty", img: B + "aatma.png", to: "govForm" },
        { label: "Addis Ababa Land Admin", sub: "Addis Ababa Land Admin", img: B + "aaland.png", to: "govForm" },
        { label: "Federal Housing Corporation", sub: "Federal Housing Corporation", img: B + "fhc.png", to: "govForm" },
        { label: "ERA Overloading Penalty", sub: "ERA Overloading Penalty", img: B + "era.png", to: "govForm" },
        { label: "MOTRI", sub: "MOTRI", img: B + "motri.png", to: "govForm" },
        { label: "Federal Civil Service Commission (FCSC)", sub: "Federal Civil Service Commission (FCSC)", img: B + "fcsc.png", to: "govForm" }
      ]
    },
    govForm: form("Government Services", [
      { label: "Reference Number", icon: "ticket", type: "text", key: "account", placeholder: "Enter Reference Number" }
    ], { channel: "mb" }),

    /* -------------------------------------------------------- pay merchant */
    merchant: {
      kind: "merchant", title: "Pay Merchant"
    },

    /* -------------------------------------------------------------- travel */
    travel: {
      kind: "tiles", title: "Travel", search: true, items: [
        { label: "Air Transport", icon: "plane", to: "airtransport" },
        { label: "Land Transport", icon: "bus", to: "landtransport" },
        { label: "TOLO Payment", img: B + "tolo.svg", to: "tolo" }
      ]
    },
    airtransport: {
      kind: "tiles", title: "Air Transport", search: true, items: [
        { label: "Ethiopian Airlines Ticket", img: B + "ethiopian.png", to: "airForm" },
        { label: "Ethiopian Airlines E-staff", img: B + "ethiopian.png", to: "airForm" },
        { label: "Zagol", img: B + "zagol.png", to: "airForm" },
        { label: "Guzo Go", img: B + "guzo.png", to: "airForm" },
        { label: "Ethiopian Airlines Cargo Service Payment", img: B + "ethiopian.png", to: "airForm" },
        { label: "Ethio Travel Services", img: B + "ethtravel.png", to: "airForm" }
      ]
    },
    airForm: form("Air Transport", [
      { label: "Ticket / Reference Number", icon: "ticket", type: "text", key: "account", placeholder: "Enter Reference Number" }
    ], { channel: "mb" }),
    landtransport: {
      kind: "tiles", title: "Land Transport", search: true, items: [
        { label: "Ethio Travel Services", img: B + "ethtravel.png", to: "airForm" },
        { label: "Seregela Gebeya", img: B + "seregela.png", to: "seregela" }
      ]
    },
    tolo: { kind: "toll", title: "Toll Road · ETC" },

    /* ------------------------------------------------------------ shopping */
    shopping: {
      kind: "tiles", title: "Shopping", search: true, items: [
        { label: "Seregela Gebeya", img: B + "seregela.png", to: "seregela" },
        { label: "Flomart", img: B + "flomart.png", to: "seregela" }
      ]
    },
    seregela: form("Seregela", [
      { label: "Order ID", icon: "pencil", type: "text", key: "account", placeholder: "Enter Order ID" }
    ], { channel: "mb", labelInside: true }),

    /* ------------------------------------------------------- entertainment */
    entertainment: {
      kind: "tiles", title: "Entertainment", search: true, items: [
        { label: "DStv", img: B + "dstv.png", to: "dstv" },
        { label: "Semu Audio film Production", img: B + "semu.png", to: "semu" }
      ]
    },
    dstv: {
      kind: "rows", title: "DStv", search: true, items: [
        { label: "DSTV Pay Current Package", sub: "DSTV Pay Current Package", img: B + "dstv.png", to: "dstvForm" },
        { label: "DStv Pay Change Package", sub: "DStv Pay Change Package", img: B + "dstv.png", to: "dstvForm" },
        { label: "DStv Additional Payment (Change Package)", sub: "DStv Additional Payment (Change Package)", img: B + "dstv.png", to: "dstvForm" },
        { label: "DStv Additional Payment (current package)", sub: "DStv Additional Payment (current package)", img: B + "dstv.png", to: "dstvForm" }
      ]
    },
    dstvForm: form("DStv", [
      { label: "Smartcard / IUC Number", icon: "idCard", type: "tel", key: "account", placeholder: "Enter Smartcard Number" }
    ], { channel: "bill" }),
    semu: form("Semu Audio", [
      { label: "Reference Number", icon: "pencil", type: "text", key: "account", placeholder: "Enter Reference Number" }
    ], { channel: "bill", labelInside: true }),

    /* ------------------------------------------------------------- pay for */
    payfor: {
      kind: "tiles", title: "Pay for", search: true, items: [
        { label: "School Fee", icon: "school", to: "payforForm" },
        { label: "Donation", icon: "hands", to: "payforForm" },
        { label: "Auction Ethiopia", icon: "briefcase", to: "payforForm" },
        { label: "Moenco", img: B + "moenco.png", to: "payforForm" },
        { label: "British Council", img: B + "british.png", to: "payforForm" },
        { label: "Hajj and Umrah", img: B + "haji.png", to: "payforForm" },
        { label: "Digital Equb", img: B + "equb.png", to: "payforForm" },
        { label: "Santimpay by PNR", img: B + "santim.png", to: "payforForm" },
        { label: "Booking Technologies", img: B + "booking.png", to: "payforForm" },
        { label: "Chapa", img: B + "chapa.png", to: "payforForm" },
        { label: "StarPay", img: B + "starpay.png", to: "payforForm" },
        { label: "BirrLink", img: B + "birrlink.png", to: "payforForm" },
        { label: "YagoutPay", img: B + "yagout.png", to: "payforForm" },
        { label: "EMYC Payment", img: B + "emyc.png", to: "payforForm" },
        { label: "LakiPay", img: B + "lakipay.png", to: "payforForm" },
        { label: "Vite Technologies", img: B + "vite.png", to: "payforForm" }
      ]
    },
    payforForm: form("Pay for", [
      { label: "Reference Number", icon: "pencil", type: "text", key: "account", placeholder: "Enter Reference Number" }
    ], { channel: "mb" }),

    /* ------------------------------------------------------- tax payment -- */
    tax: {
      kind: "rows", title: "Tax Payment", search: true, items: [
        { label: "Ministry of Revenue (MOR) Tax Payment", sub: "Ministry of Revenue (MOR) Tax Payment", icon: "receiptLines", to: "mor" },
        { label: "Tax Payments", sub: "Tax Payments", icon: "receiptLines", to: "taxlist" }
      ]
    },
    mor: {
      kind: "form", title: "MOR", channel: "tax", fields: [
        { label: "Tax Center", icon: "building", type: "select", options: ["Addis Ababa – Bole", "Addis Ababa – Kirkos", "Addis Ababa – Arada", "Addis Ababa – Yeka", "Adama", "Bahir Dar", "Hawassa", "Mekelle"], key: "bankName" },
        { label: "Order Code", icon: "pencil", type: "text", key: "account", placeholder: "Enter Order Code" }
      ]
    },
    taxlist: {
      kind: "tiles", title: "Tax Payments", search: true, items: [
        { label: "Ministry of Revenue", img: B + "mor.png", to: "mor" },
        { label: "Addis Ababa Revenue", img: B + "aarev.png", to: "mor" },
        { label: "Dire Dawa Revenue", img: B + "dirrev.png", to: "mor" },
        { label: "Somali Revenue", img: B + "somrev.png", to: "mor" }
      ]
    },

    /* ------------------------------------------------ ethiopian shipping -- */
    esl: form("ESL", [
      { label: "Reference Number", icon: "pencil", type: "text", key: "account", placeholder: "Enter Reference Number" }
    ], { channel: "mb", labelInside: true }),

    /* --------------------------------------------------------- other services (login screen) */
    otherServices: {
      kind: "oservices", title: "Other Services", nav: false, items: [
        { label: "Exchange Rates", icon: "swap" },
        { label: "Internet Banking", icon: "bank" },
        { label: "USSD", icon: "ussd" },
        { label: "Verify Receipt", icon: "receiptLines", to: "verifyReceipt" },
        { label: "Feedback", icon: "chat" },
        { label: "CBE Locator", icon: "mapPin" },
        { label: "Call Center", icon: "phoneCall" },
        { label: "Privacy Policy", img: "img/cbe-logo.png", to: "privacy" },
        { label: "Terms and\nTariffs", img: "img/cbe-logo.png", to: "terms" },
        { label: "Survey", img: "img/cbe-logo.png" },
        { label: "CBE Links", icon: "link", wide: true }
      ]
    }
  };

  /* wallet / airtime style forms resolve to a single shared form screen */
  CATALOG.walletForm = form("Wallet", [
    { label: "Wallet Number", icon: "wallet", type: "tel", key: "account", placeholder: "Enter Wallet Number" }
  ], { channel: "wallet" });

  /* search index for the menu search screen */
  function searchIndex() {
    var out = [];
    HOME_TILES.forEach(function (t) { out.push({ label: t.label, icon: t.icon, img: t.img, to: t.to, bubble: t.bubble }); });
    Object.keys(CATALOG).forEach(function (key) {
      var cat = CATALOG[key];
      if (!cat || !cat.items || key === "otherServices") return;
      cat.items.forEach(function (it) {
        if (it.to || it.data) out.push({ label: it.label, icon: it.icon || "list", img: it.img, to: it.to || key });
      });
    });
    out.push({ label: "Settings", icon: "settings", to: "settings" });
    out.push({ label: "Transactions", icon: "bank", to: "transactions" });
    out.push({ label: "Scan QR", icon: "qrScan", to: "scan" });
    out.push({ label: "Verify Receipt", icon: "receiptLines", to: "verifyReceipt" });
    out.push({ label: "Contact Us", icon: "phoneCall", to: "contact" });
    out.push({ label: "My Information", icon: "users", to: "myinfo" });
    return out;
  }

  global.Brands = {
    QUICK: QUICK,
    HOME_TILES: HOME_TILES,
    CATALOG: CATALOG,
    BANK_LIST: BANK_LIST,
    form: form,
    searchIndex: searchIndex
  };
})(window);
