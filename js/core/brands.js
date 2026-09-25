/* CBE Mobile Banking — brand logos + provider catalogs (all images local) */
(function () {
  const B = {
    // banks
    awash: 'img/brands/awash.png', abyssinia: 'img/brands/abyssinia.png', berhan: 'img/brands/berhan.png',
    bunna: 'img/brands/bunna.png', coop: 'img/brands/coop.png', dashen: 'img/brands/dashen.png',
    enat: 'img/brands/enat.png', nib: 'img/brands/nib.png', oromia: 'img/brands/oromia.png',
    zemen: 'img/brands/zemen.png', amhara: 'img/brands/amhara.png', addis: 'img/brands/addis.png',
    ahadu: 'img/brands/ahadu.png', abay: 'img/brands/abay.png', tsehay: 'img/brands/tsehay.png',
    // wallets
    telebirr: 'img/brands/telebirr.png', ebirr: 'img/brands/ebirr.png', mpesa: 'img/brands/mpesa.png',
    yaya: 'img/brands/yaya.png', binget: 'img/brands/binget.png', sahaypay: 'img/brands/sahaypay.png',
    // telecom / airtime
    ethiotelecom: 'img/brands/ethiotelecom.png',
    // utilities & gov
    eeu: 'img/brands/eeu.png', aawsa: 'img/brands/aawsa.png', webirr: 'img/brands/webirr.png',
    websprix: 'img/brands/websprix.png', dars: 'img/brands/dars.png', aatma: 'img/brands/aatma.png',
    aaland: 'img/brands/aaland.png', fhc: 'img/brands/fhc.png', era: 'img/brands/era.png',
    motri: 'img/brands/motri.png', fcsc: 'img/brands/fcsc.png', mor: 'img/brands/mor.png',
    dirrev: 'img/brands/dirrev.png', somrev: 'img/brands/somrev.png', aarev: 'img/brands/aarev.png',
    // pay-for & shopping & travel & entertainment
    dstv: 'img/brands/dstv.png', semu: 'img/brands/semu.png', seregela: 'img/brands/seregela.png',
    flomart: 'img/brands/flomart.png', british: 'img/brands/british.png', haji: 'img/brands/haji.png',
    equb: 'img/brands/equb.png', santim: 'img/brands/santim.png', booking: 'img/brands/booking.png',
    chapa: 'img/brands/chapa.png', starpay: 'img/brands/starpay.png', birrlink: 'img/brands/birrlink.png',
    yagout: 'img/brands/yagout.png', emyc: 'img/brands/emyc.png', lakipay: 'img/brands/lakipay.png',
    vite: 'img/brands/vite.png', moenco: 'img/brands/moenco.png', zagol: 'img/brands/zagol.png',
    guzo: 'img/brands/guzo.png', ethiopian: 'img/brands/ethiopian.png', ethtravel: 'img/brands/ethtravel.png',
    // microfinance
    kaafi: 'img/brands/kaafi.png', rays: 'img/brands/rays.png', vision: 'img/brands/vision.png'
  };

  CBE.logo = function (key) {
    return B[key] ? '<img class="logo" src="' + B[key] + '" alt="" loading="lazy">' : null;
  };
  CBE.logoSrc = function (key) { return B[key] || null; };
  CBE.mono = function (text, cls) {
    return '<span class="mono ' + (cls || '') + '">' + CBE.util.esc(text) + '</span>';
  };

  // provider catalogs from the ui/ reference lists
  CBE.catalog = {
    banks: [
      {k: 'awash', n: 'Awash Bank'}, {k: 'abyssinia', n: 'Bank of Abyssinia'}, {k: 'berhan', n: 'Berhan Bank'},
      {k: 'bunna', n: 'Bunna Bank'}, {k: 'coop', n: 'Cooperative Bank of Oromia S.C.'}, {k: 'coop', n: 'Coopay E-Birr'},
      {k: 'dashen', n: 'Dashen Bank'}, {k: 'enat', n: 'Enat Bank'}, {k: 'abay', n: 'Abay Bank'},
      {k: 'addis', n: 'Addis Bank'}, {k: 'ahadu', n: 'Ahadu Bank'}, {k: 'amhara', n: 'Amhara Bank'},
      {k: 'tsehay', n: 'Tsehay Bank'}, {k: 'nib', n: 'Nib International Bank'}, {k: 'oromia', n: 'Oromia Bank'},
      {k: 'zemen', n: 'Zemen Bank'}, {k: 'buna', n: 'Buna Bank'}, {k: 'goh', n: 'Goh Betoch Bank'},
      {k: 'global', n: 'Global Bank Ethiopia'}, {k: 'gadaa', n: 'Gadaa Bank'}, {k: 'hijra', n: 'Hijra Bank'},
      {k: 'hibret', n: 'Hibret Bank'}, {k: 'halal', n: 'Halal Pay'}, {k: 'hcash', n: 'H-CASH'},
      {k: 'lion', n: 'Lion International Bank'}, {k: 'omo', n: 'Omo Bank'}, {k: 'nibb', n: 'Nib E-birr'},
      {k: 'kacha', n: 'Kacha'}, {k: 'tsedey', n: 'Tsedey Bank'}, {k: 'siket', n: 'Siket Bank'},
      {k: 'siinqee', n: 'Siinqee Bank'}, {k: 'sidama', n: 'Sidama Bank'}, {k: 'shabelle', n: 'Shabelle Bank'},
      {k: 'rammis', n: 'Rammis Bank'}, {k: 'zamzam', n: 'ZamZam Bank'}, {k: 'wegagen', n: 'Wegagen Bank'},
      {k: 'wegagen', n: 'Wegagen E-Birr'}, {k: 'yaya', n: 'YaYa Wallet'}, {k: 'mpesa', n: 'M-Pesa'},
      {k: 'vite', n: 'VitaBirr Financial Service S.C'}
    ],
    wallets: [
      {k: 'telebirr', n: 'TeleBirr'}, {k: 'ebirr', n: 'EBirr'}, {k: 'mpesa', n: 'M-Pesa'},
      {k: 'yaya', n: 'YaYa Wallet'}, {k: 'binget', n: 'BinGet Birr'}, {k: 'sahaypay', n: 'SahayPay'}
    ],
    sacco: [
      {k: null, n: 'Awach SACCO'}, {k: null, n: 'Yehulu SACCO'}, {k: null, n: 'Dil SACCO'}, {k: null, n: 'Amigos SACCO'}
    ],
    micro: [
      {k: 'rays', n: 'RAYs Microfinance'}, {k: 'vision', n: 'Vision Fund Microfinance'}, {k: 'kaafi', n: 'KAAFI Microfinance'},
      {k: null, n: 'Nisir Microfinance'}, {k: null, n: 'Dire Microfinance'}, {k: null, n: 'DECSI-Microfinance'},
      {k: null, n: 'Metemamen Microfinance'}
    ]
  };
})();
