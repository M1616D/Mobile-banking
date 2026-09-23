/* ==========================================================================
   ui.js — icons, real brand logos, fingerprint art, formatters, overlays
   ========================================================================== */
(function (global) {
  'use strict';
  var CBE = global.CBE || (global.CBE = {});

  /* ------------------------------------------------------------- icons
     Every glyph is drawn on a 24x24 grid with round caps so it matches the
     stroke weight of the screenshots. Keep them simple: one path per idea. */
  var ICONS = {
    grid: '<rect x="3.6" y="3.6" width="7" height="7" rx="2.2"/><rect x="13.4" y="3.6" width="7" height="7" rx="2.2"/><rect x="3.6" y="13.4" width="7" height="7" rx="2.2"/><rect x="13.4" y="13.4" width="7" height="7" rx="2.2"/>',
    bell: '<path d="M18 8.6a6 6 0 0 0-12 0c0 6.3-2.3 7.4-2.3 7.4h16.6S18 14.9 18 8.6Z"/><path d="M10.2 20.2a2.1 2.1 0 0 0 3.6 0"/>',
    refresh: '<path d="M20.4 12a8.4 8.4 0 0 1-14.6 5.7"/><path d="M3.6 12a8.4 8.4 0 0 1 14.6-5.7"/><path d="M18.4 3.2v3.4h-3.4"/><path d="M5.6 20.8v-3.4h3.4"/>',
    sync: '<path d="M19.9 8.4A8 8 0 0 0 6 6.2L4 8"/><path d="M4.1 15.6A8 8 0 0 0 18 17.8l2-1.8"/><path d="M4 4.2V8h3.8"/><path d="M20 19.8V16h-3.8"/>',
    search: '<circle cx="11" cy="11" r="6.6"/><path d="M20 20l-4.1-4.1"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    chevronLeft: '<path d="M15 5l-7 7 7 7"/>',
    chevronRight: '<path d="M9 5l7 7-7 7"/>',
    chevronDown: '<path d="M5 9l7 7 7-7"/>',
    chevronUp: '<path d="M5 15l7-7 7 7"/>',
    bank: '<path d="M3 9.4 12 3.2l9 6.2"/><path d="M5.4 10v8.8M9.8 10v8.8M14.2 10v8.8M18.6 10v8.8"/><path d="M3 19.2h18"/><path d="M2.4 21.4h19.2"/>',
    columns: '<path d="M4 8h16"/><path d="M5.6 8v9.6M9.6 8v9.6M14.4 8v9.6M18.4 8v9.6"/><path d="M3.2 17.6h17.6"/><path d="M12 3.2 21 8H3Z"/>',
    phone: '<path d="M6.6 3.5h3.1l1.6 4-2 1.4a11.6 11.6 0 0 0 5.8 5.8l1.4-2 4 1.6v3.1a2 2 0 0 1-2.2 2A16.9 16.9 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"/>',
    phoneHandset: '<path d="M6.6 3.5h3.1l1.6 4-2 1.4a11.6 11.6 0 0 0 5.8 5.8l1.4-2 4 1.6v3.1a2 2 0 0 1-2.2 2A16.9 16.9 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"/>',
    callCenter: '<path d="M4.4 5.6a2 2 0 0 1 2-2h2.4l1.4 3.6-1.8 1.2a10.6 10.6 0 0 0 5.2 5.2l1.2-1.8 3.6 1.4v2.4a2 2 0 0 1-2 2C9.6 17.5 6.5 12.4 4.4 5.6Z"/><path d="M16.4 3.4a4 4 0 0 1 4 4"/><path d="M16.4 6.4a1.4 1.4 0 0 1 1.4 1.4"/>',
    transfer: '<path d="M4.5 8.2h13.2l-3.4-3.4"/><path d="M19.5 15.8H6.3l3.4 3.4"/>',
    cash: '<rect x="2.8" y="6.4" width="18.4" height="11.2" rx="2.4"/><circle cx="12" cy="12" r="2.6"/>',
    cashOut: '<circle cx="12" cy="12" r="8.4"/><path d="M12 7v10"/><path d="M14.6 9.2a3.2 2.6 0 0 0-2.6-1.1c-1.5 0-2.6.8-2.6 2s1.1 1.8 2.6 2.1c1.6.3 2.8 1 2.8 2.3s-1.2 2.1-2.8 2.1a3.3 2.8 0 0 1-2.7-1.2"/>',
    card: '<rect x="2.8" y="5.4" width="18.4" height="13.2" rx="2.6"/><path d="M2.8 10h18.4"/><path d="M6.4 14.6h3.6"/>',
    cardStack: '<rect x="2.6" y="6" width="15.4" height="11" rx="2.4"/><path d="M5.4 6V4.8a1.6 1.6 0 0 1 1.6-1.6h11a1.6 1.6 0 0 1 1.6 1.6v9.4a1.6 1.6 0 0 1-1.6 1.6h-1.1"/><path d="M18.2 13.6h1.4"/>',
    receipt: '<path d="M5.6 3.4h12.8v17.2l-3.2-2-3.2 2-3.2-2-3.2 2Z"/><path d="M9 8.4h6M9 12h6"/>',
    statement: '<path d="M6.6 3.4h10.8v17.2H6.6Z"/><path d="M9.4 8h5.2M9.4 11.4h5.2M9.4 14.8h3.2"/>',
    receiptCheck: '<path d="M5.6 3.4h12.8v17.2l-3.2-2-3.2 2-3.2-2-3.2 2Z"/><path d="M9.4 11l1.8 1.8 3.6-3.8"/>',
    users: '<circle cx="9.4" cy="8.2" r="3.4"/><path d="M3.4 20.4c0-3.3 2.7-5.8 6-5.8s6 2.5 6 5.8"/><path d="M16.4 5.4a3.4 3.4 0 0 1 0 6.6"/><path d="M17.6 14.9c2.1.7 3.6 2.5 3.6 4.9"/>',
    userPlus: '<circle cx="10" cy="8.4" r="3.6"/><path d="M3.6 20.4c0-3.4 2.9-6 6.4-6 1 0 2 .2 2.8.6"/><path d="M18 12.6v6M15 15.6h6"/>',
    person: '<circle cx="12" cy="8.4" r="3.6"/><path d="M5 20.4c0-3.6 3.1-6.2 7-6.2s7 2.6 7 6.2"/>',
    userCog: '<circle cx="9.4" cy="7.8" r="3.4"/><path d="M3.4 20.4c0-3.3 2.7-5.8 6-5.8 1 0 2 .2 2.8.6"/><circle cx="18" cy="16.4" r="2.2"/><path d="M18 12.8v1.2M18 18.8v1.2M14.6 16.4h1.2M20.2 16.4h1.2M15.6 14l.9.9M19.6 18l.9.9M20.4 14l-.9.9M16.4 18l-.9.9"/>',
    trash: '<path d="M4.6 6.6h14.8"/><path d="M9.4 6.6V4.8a1.2 1.2 0 0 1 1.2-1.2h2.8a1.2 1.2 0 0 1 1.2 1.2v1.8"/><path d="M6.8 6.6l.9 12.2a1.6 1.6 0 0 0 1.6 1.5h5.4a1.6 1.6 0 0 0 1.6-1.5l.9-12.2"/><path d="M10.4 10.4v6M13.6 10.4v6"/>',
    fingerprint: '<path d="M12 3.4a8.6 8.6 0 0 0-8.6 8.6v1.6"/><path d="M8.8 6.6A8.6 8.6 0 0 1 20.6 12v1.4"/><path d="M12 6.4A5.6 5.6 0 0 0 6.4 12v3.4"/><path d="M17.6 12a5.6 5.6 0 0 0-2.1-4.4"/><path d="M12 9.4A2.6 2.6 0 0 0 9.4 12v4.4a8 8 0 0 0 .7 3.3"/><path d="M12 12.4v5.2a8 8 0 0 0 .5 2.8"/><path d="M14.6 12.6v5.2c0 1-.1 2-.4 2.9"/>',
    eyeOff: '<path d="M10.6 6.6A8.8 8.8 0 0 1 12 6.5c4.7 0 8.6 3.1 9.7 5.5a11.6 11.6 0 0 1-2.4 3.3"/><path d="M6.4 8.2A12.5 12.5 0 0 0 2.3 12c1.1 2.4 5 5.5 9.7 5.5a9.6 9.6 0 0 0 3.6-.7"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><path d="M3.6 3.6l16.8 16.8"/>',
    eye: '<path d="M2.3 12S6.1 6.5 12 6.5 21.7 12 21.7 12 17.9 17.5 12 17.5 2.3 12 2.3 12Z"/><circle cx="12" cy="12" r="3"/>',
    copy: '<rect x="8.6" y="8.6" width="11.4" height="11.4" rx="2.2"/><path d="M15.4 5.4a2.2 2.2 0 0 0-2.2-2.2H6.2A2.2 2.2 0 0 0 4 5.4v7a2.2 2.2 0 0 0 2.2 2.2"/>',
    plusCircle: '<circle cx="12" cy="12" r="8.6"/><path d="M12 8.6v6.8M8.6 12h6.8"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    arrowUpRight: '<path d="M7 17 17 7"/><path d="M9.4 7H17v7.6"/>',
    arrowDownLeft: '<path d="M17 7 7 17"/><path d="M14.6 17H7V9.4"/>',
    arrowLeft: '<path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/>',
    arrowRight: '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
    wallet: '<path d="M3.4 7.8A2.4 2.4 0 0 1 5.8 5.4h11.4a2.4 2.4 0 0 1 2.4 2.4v.4"/><rect x="3.4" y="7.8" width="17.2" height="11.6" rx="2.6"/><path d="M20.6 11.4h-3.4a2.4 2.4 0 0 0 0 4.8h3.4"/>',
    share: '<circle cx="6.4" cy="12" r="2.6"/><circle cx="17.6" cy="6.6" r="2.6"/><circle cx="17.6" cy="17.4" r="2.6"/><path d="M8.8 10.8 15.2 7.8M8.8 13.2l6.4 3"/>',
    splitShare: '<path d="M12 20.4v-5.8"/><path d="M12 14.6 6.4 9.4v-3.2"/><path d="M12 14.6l5.6-5.2V6.2"/><path d="M4.6 6.2h4.4"/><path d="M15 6.2h4.4"/>',
    link: '<path d="M10.4 13.6a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M13.6 10.4a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 0 0 5.7 5.7l1-1"/>',
    download: '<path d="M12 3.6v10.8"/><path d="M8 10.6 12 14.6l4-4"/><path d="M4.4 17v1.6a1.8 1.8 0 0 0 1.8 1.8h11.6a1.8 1.8 0 0 0 1.8-1.8V17"/>',
    qr: '<rect x="3.4" y="3.4" width="6.6" height="6.6" rx="1.6"/><rect x="14" y="3.4" width="6.6" height="6.6" rx="1.6"/><rect x="3.4" y="14" width="6.6" height="6.6" rx="1.6"/><path d="M14 14h2.8v2.8H14zM20.6 14v6.6H14"/>',
    lock: '<rect x="4.6" y="10.4" width="14.8" height="10" rx="2.4"/><path d="M8.4 10.4V7.8a3.6 3.6 0 0 1 7.2 0v2.6"/><path d="M12 14.4v2.6"/>',
    lockSquare: '<rect x="3.6" y="3.6" width="16.8" height="16.8" rx="4.6"/><rect x="8.4" y="11" width="7.2" height="5.6" rx="1.6"/><path d="M9.8 11V9.6a2.2 2.2 0 0 1 4.4 0V11"/>',
    key: '<circle cx="8.4" cy="15.6" r="3.6"/><path d="M11 13 20 4"/><path d="M17.4 6.6l2.2 2.2"/><path d="M15.2 8.8l2.2 2.2"/>',
    globe: '<circle cx="12" cy="12" r="8.6"/><path d="M3.6 12h16.8"/><path d="M12 3.4c2.4 2.4 3.6 5.4 3.6 8.6s-1.2 6.2-3.6 8.6c-2.4-2.4-3.6-5.4-3.6-8.6S9.6 5.8 12 3.4Z"/>',
    exchangeRate: '<path d="M4.4 9.6h13.2l-3-3"/><path d="M19.6 14.4H6.4l3 3"/><circle cx="12" cy="12" r="9"/>',
    sliders: '<path d="M4.4 7.4h8.6M18 7.4h1.6"/><circle cx="15.6" cy="7.4" r="2.2"/><path d="M4.4 16.6h1.6M11 16.6h8.6"/><circle cx="8.4" cy="16.6" r="2.2"/>',
    filterLines: '<path d="M4.4 7h15.2M6.8 12h10.4M9.6 17h4.8"/>',
    logOut: '<path d="M14.4 4.6h3.2A1.8 1.8 0 0 1 19.4 6.4v11.2a1.8 1.8 0 0 1-1.8 1.8h-3.2"/><path d="M10 15.4 13.4 12 10 8.6"/><path d="M13.4 12H4.6"/>',
    store: '<path d="M4.4 9.8V19a1.4 1.4 0 0 0 1.4 1.4h12.4a1.4 1.4 0 0 0 1.4-1.4V9.8"/><path d="M3.4 9.8 5.6 4.2h12.8l2.2 5.6a2.6 2.6 0 0 1-4.9 1 2.6 2.6 0 0 1-4.9 0 2.6 2.6 0 0 1-4.9 0 2.6 2.6 0 0 1-4.9-1Z"/><path d="M9.6 20.4v-4.6h4.8v4.6"/>',
    bus: '<rect x="4.4" y="3.8" width="15.2" height="13.4" rx="2.4"/><path d="M4.4 11.6h15.2"/><path d="M8 17.2v2.4M16 17.2v2.4"/><path d="M7.6 14.4h.01M16.4 14.4h.01"/>',
    car: '<path d="M4.4 16.6v2.2M19.6 16.6v2.2"/><path d="M3.4 16.6h17.2v-3.4l-1.8-5.2a1.6 1.6 0 0 0-1.5-1.1H6.7a1.6 1.6 0 0 0-1.5 1.1L3.4 13.2Z"/><path d="M6.6 13.4h.01M17.4 13.4h.01"/>',
    plane: '<path d="M21 5.4 13.4 13l.8 5.4-2 2-1.9-5.3-5.3-1.9 2-2 5.4.8L20 4.4Z"/>',
    cart: '<circle cx="9.4" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2.2l2.4 11.2h11.2L21 7.6H6.2"/>',
    film: '<rect x="3" y="4.6" width="18" height="14.8" rx="2.6"/><path d="M8 4.6v14.8M16 4.6v14.8M3 12h18"/>',
    clip: '<rect x="6.4" y="4.2" width="11.2" height="16" rx="2.2"/><path d="M9.4 3.2h5.2v2.6H9.4z"/><path d="M9.4 10h5.2M9.4 13h5.2M9.4 16h3.2"/>',
    home: '<path d="M4.4 10.6 12 4.4l7.6 6.2v8.2a1.6 1.6 0 0 1-1.6 1.6H6a1.6 1.6 0 0 1-1.6-1.6Z"/><path d="M9.6 20.4v-5.2h4.8v5.2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.2 14.4a1.6 1.6 0 0 0 .3 1.8l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a1.9 1.9 0 1 1-3.8 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3.1a1.9 1.9 0 1 1 0-3.8h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3.1a1.9 1.9 0 1 1 3.8 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.2a1.9 1.9 0 1 1 0 3.8h-.1a1.6 1.6 0 0 0-1.5 1Z"/>',
    coins: '<ellipse cx="12" cy="6.6" rx="7.4" ry="3"/><path d="M4.6 6.6v4c0 1.6 3.3 3 7.4 3s7.4-1.4 7.4-3v-4"/><path d="M4.6 10.6v4c0 1.6 3.3 3 7.4 3s7.4-1.4 7.4-3v-4"/><path d="M4.6 14.6v3c0 1.6 3.3 3 7.4 3s7.4-1.4 7.4-3v-3"/>',
    doc: '<path d="M6.4 3.4h7.2l4.4 4.4v12.8H6.4Z"/><path d="M13.6 3.4v4.4H18"/><path d="M9.4 12h5.2M9.4 15.4h5.2"/>',
    medal: '<circle cx="12" cy="14.6" r="5"/><path d="M8.6 10.4 6.4 3.2h11.2l-2.2 7.2"/>',
    check: '<path d="M5 13l4.6 4.6L19 7.4"/>',
    shieldCheck: '<path d="M12 3.4l7.2 2.8v6c0 4.3-3 8.1-7.2 9.2-4.2-1.1-7.2-4.9-7.2-9.2v-6Z"/><path d="M8.8 12.2l2.4 2.4 4-4.4"/>',
    shield: '<path d="M12 3.4l7.2 2.8v6c0 4.3-3 8.1-7.2 9.2-4.2-1.1-7.2-4.9-7.2-9.2v-6Z"/>',
    warning: '<path d="M12 4.4 2.8 20h18.4Z"/><path d="M12 10v4.4M12 17.4h.01"/>',
    scan: '<path d="M4 9V6.4A2.4 2.4 0 0 1 6.4 4H9"/><path d="M15 4h2.6A2.4 2.4 0 0 1 20 6.4V9"/><path d="M20 15v2.6a2.4 2.4 0 0 1-2.4 2.4H15"/><path d="M9 20H6.4A2.4 2.4 0 0 1 4 17.6V15"/><path d="M4 12h16"/>',
    scanQr: '<path d="M4 9V6.4A2.4 2.4 0 0 1 6.4 4H9"/><path d="M15 4h2.6A2.4 2.4 0 0 1 20 6.4V9"/><path d="M20 15v2.6a2.4 2.4 0 0 1-2.4 2.4H15"/><path d="M9 20H6.4A2.4 2.4 0 0 1 4 17.6V15"/><path d="M9.4 9.4h2v2h-2zM13.4 9.4h1.6M9.4 14h2M13.4 12.6h1.6v1.8"/>',
    micro: '<path d="M9.4 3.6h5.2c1.9 0 3.4 1.5 3.4 3.4s-1.5 3.4-3.4 3.4H9.4"/>','coinBag' : '<path d="M9.4 3.6h5.2c1.9 0 3.4 1.5 3.4 3.4s-1.5 3.4-3.4 3.4H9.4"/>',
    moneyBag: '<path d="M9.4 3.6h5.2c1.9 0 3.4 1.5 3.4 3.4s-1.5 3.4-3.4 3.4H9.4c-1.9 0-3.4-1.5-3.4-3.4s1.5-3.4 3.4-3.4Z"/><path d="M6.6 10.4 4.8 13a6.4 6.4 0 0 0 4.2 8.6 6.6 6.6 0 0 0 8.2-4.2l1.4-4.4a2.6 2.6 0 0 0-2.4-3.4"/>',
    sacco: '<ellipse cx="12" cy="5.4" rx="6.2" ry="2.4"/><path d="M5.8 5.4v4c0 1.3 2.8 2.4 6.2 2.4s6.2-1.1 6.2-2.4v-4"/><path d="M5.8 9.4v4c0 1.3 2.8 2.4 6.2 2.4s6.2-1.1 6.2-2.4v-4"/><path d="M9.4 17.4c-2.1.4-3.6 1.2-3.6 2 0 1.3 2.8 2.4 6.2 2.4s6.2-1.1 6.2-2.4c0-.8-1.5-1.6-3.6-2"/>',
    ussd: '<circle cx="5.6" cy="5.6" r="1.5"/><circle cx="12" cy="5.6" r="1.5"/><circle cx="18.4" cy="5.6" r="1.5"/><circle cx="5.6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18.4" cy="12" r="1.5"/><circle cx="5.6" cy="18.4" r="1.5"/><circle cx="12" cy="18.4" r="1.5"/><circle cx="18.4" cy="18.4" r="1.5"/>',
    chat: '<path d="M20.4 12a7.6 7.6 0 0 1-11.2 6.8L4.4 20.4l1.6-4.8A7.6 7.6 0 1 1 20.4 12Z"/><path d="M8.6 11.4h.01M12 11.4h.01M15.4 11.4h.01"/>',
    feedback: '<path d="M20.4 11.4c0 3.9-3.6 7-8.4 7a9.6 9.6 0 0 1-2.6-.4L4.4 20l1.6-4.2a6.6 6.6 0 0 1-2.4-4.4c0-3.9 3.8-7 8.4-7s8.4 3.1 8.4 7Z"/><path d="M8.4 11.4h.01M12 11.4h.01M15.6 11.4h.01"/>',
    pin: '<path d="M12 21s6.4-5.6 6.4-11a6.4 6.4 0 1 0-12.8 0C5.6 15.4 12 21 12 21Z"/><circle cx="12" cy="9.8" r="2.4"/>',
    survey: '<rect x="4.4" y="3.6" width="15.2" height="16.8" rx="3"/><path d="M8 9h8M8 12.6h8M8 16.2h5"/>',
    handshake: '<path d="M3.4 12.4 7 8.8h4.6l2.6 2.6-2 2"/><path d="M11.6 15.6l3.4-3.4h3.6"/><path d="M3.4 12.4 6.8 16l2.4 2.4"/><path d="M20.6 10.2 17 6.6h-3"/>',
    building: '<path d="M4.4 20.4V6.6L12 3.4l7.6 3.2v13.8Z"/><path d="M9 20.4v-4.6h6v4.6"/><path d="M9 9.4h1.6M13.4 9.4H15M9 12.6h1.6M13.4 12.6H15"/>',
    chip: '<rect x="6.6" y="6.6" width="10.8" height="10.8" rx="2.4"/><path d="M10 6.6V3.4M14 6.6V3.4M10 20.6v-3.2M14 20.6v-3.2M6.6 10H3.4M6.6 14H3.4M20.6 10h-3.2M20.6 14h-3.2"/>',
    contactless: '<path d="M8.4 6a8.6 8.6 0 0 1 0 12"/><path d="M12.4 8.4a5.4 5.4 0 0 1 0 7.2"/><path d="M16.4 10.6a2.6 2.6 0 0 1 0 2.8"/>',
    rocket: '<path d="M13.6 3.4c3 0 7 4 7 7 0 3.8-4.2 6.4-6.6 8.2l-3.6 1.6-1.4-1.4 1.6-3.6c1.8-2.4 4.4-6.6 3-11.8Z"/><path d="M9 15l-3.4.8L4 14.4l.8-3.4"/><circle cx="14.6" cy="9.4" r="1.6"/>',
    power: '<path d="M12 3.6v8"/><path d="M17.6 6.6a8 8 0 1 1-11.2 0"/>',
    phoneGrid: '<rect x="6.6" y="2.8" width="10.8" height="18.4" rx="2.6"/><path d="M10.6 5.6h2.8"/><path d="M12 18.4h.01"/>',
    tv: '<rect x="3" y="5.4" width="18" height="12" rx="2.4"/><path d="M8 20.4h8"/>',
    star: '<path d="M12 4l2.5 5.3 5.5.7-4 3.8 1 5.6L12 16.7 7 19.4l1-5.6-4-3.8 5.5-.7Z"/>',
    edit: '<path d="M15.6 4.6 19.4 8.4 8.8 19H5v-3.8Z"/><path d="M13.6 6.6l3.8 3.8"/>',
    clock: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.4V12l3 1.8"/>',
    calculator: '<rect x="4.6" y="3.4" width="14.8" height="17.2" rx="2.6"/><rect x="7.6" y="6.4" width="8.8" height="3.2" rx="1"/><path d="M8.2 13h.01M12 13h.01M15.8 13h.01M8.2 16.6h.01M12 16.6h.01M15.8 16.6h.01"/>',
    bankNote: '<rect x="2.8" y="6.4" width="18.4" height="11.2" rx="2.4"/><path d="M2.8 10.8h18.4"/><path d="M6.4 14.6h4.2"/>',
    transferOut: '<path d="M4.4 8.6h13l-3.2-3.2"/><path d="M19.6 15.4h-13l3.2 3.2"/>',
    /* the sparkle the receipt uses for "Screenshot" */
    screenshot: '<rect x="3.4" y="6.4" width="17.2" height="13.2" rx="2.6"/><path d="M8.6 6.4l1.6-2.2h3.6l1.6 2.2"/><circle cx="12" cy="13" r="3.4"/><path d="M19.6 3.4v3.4M17.9 5.1h3.4"/>',
    scanShare: '<circle cx="5.4" cy="5.4" r="1.9"/><circle cx="12" cy="5.4" r="1.9"/><circle cx="18.6" cy="5.4" r="1.9"/><circle cx="5.4" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="18.6" cy="12" r="1.9"/><circle cx="5.4" cy="18.6" r="1.9"/><circle cx="12" cy="18.6" r="1.9"/><circle cx="18.6" cy="18.6" r="1.9"/>'
  };

  function icon(name, opts) {
    opts = opts || {};
    var size = opts.size || 22;
    var cls = opts.cls ? ' class="' + opts.cls + '"' : '';
    var body = ICONS[name] || ICONS.grid;
    var fill = opts.fill ? 'fill="' + opts.fill + '" stroke="none"' : 'fill="none" stroke="currentColor"';
    return '<svg' + cls + ' width="' + size + '" height="' + size + '" viewBox="0 0 24 24" ' +
      fill + ' stroke-width="' + (opts.weight || 1.7) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  }

  /* ------------------------------------------------------------ real logos
     Every logo below is the artwork that ships in assets/img/brands. */
  var LOGO = {
    abay: 'abay', addis: 'addis', ahadu: 'ahadu', amhara: 'amhara', awash: 'awash',
    abyssinia: 'abyssinia', bunna: 'bunna', berhan: 'berhan', nib: 'nib', tsehay: 'tsehay',
    zemen: 'zemen', coop: 'coop', dashen: 'dashen', enat: 'enat', oromia: 'oromia',
    wegagen: 'wegagen',
    telebirr: 'telebirr', ebirr: 'ebirr', mpesa: 'mpesa', mpesa2: 'mpesa',
    yaya: 'yaya', binget: 'binget', sahaypay: 'sahaypay',
    ethiotelecom: 'ethiotelecom', ethio: 'ethiotelecom'
    /* brands with no artwork on disk use the branded letter tile below, so a
       screen can never show a broken image */
  };

  /* fallbacks for the brands we do not have artwork for — built from the brand
     colour, exactly like the letter tiles the app shows for unknown banks */
  var FALLBACK = {
    safaricom: ['#e2231a', 'S'],
    eeu: ['#f0a11a', 'EEU'],
    aawsa: ['#2b6fc4', 'AA'],
    webirr: ['#2f9e44', 'we'],
    websprix: ['#f5d90a', 'WS'],
    bird: ['#f08a24', 'OB'],
    vita: ['#1560bd', 'V'],
    dwallet: ['#6c22a6', 'W'],
    cbo: ['#29abe2', 'CBO'],
    dashen: ['#20347a', 'DB'],
    enat: ['#d63b3b', 'EN'],
    gadaa: ['#e2402f', 'GA'],
    global: ['#1f9d55', 'GB'],
    goh: ['#1a3f7a', 'GH'],
    hibret: ['#2b7fc4', 'HB'],
    hijra: ['#1f67c8', 'HJ'],
    lion: ['#2f8f4e', 'LB'],
    oromia: ['#1f9d55', 'OB'],
    siinqee: ['#e2731f', 'SQ'],
    tsedey: ['#1f6fb2', 'TD'],
    wegagen: ['#f0a11a', 'WG'],
    zamzam: ['#1d8f6f', 'ZZ'],
    abayb: ['#1b5e9c', 'AB']
  };

  function logoSrc(key) {
    var file = LOGO[key];
    return file ? 'assets/img/brands/' + file + '.png' : null;
  }

  /* brand() keeps its old signature so every existing screen keeps working,
     but now renders the uploaded artwork whenever we have it. */
  function brand(kind, size) {
    size = size || 38;
    var src = logoSrc(kind);
    if (src) {
      return '<img src="' + src + '" alt="" loading="lazy" decoding="async" ' +
        'style="width:' + size + 'px;height:' + size + 'px;object-fit:contain">';
    }
    var fb = FALLBACK[kind] || ['#6c22a6', String(kind || '').slice(0, 3).toUpperCase()];
    return '<span style="display:inline-grid;place-items:center;width:' + size + 'px;height:' + size + 'px;border-radius:' +
      Math.round(size * 0.28) + 'px;background:' + fb[0] + ';color:#fff;font-weight:800;font-size:' +
      Math.max(9, Math.round(size * 0.3)) + 'px;letter-spacing:.02em">' + esc(fb[1]) + '</span>';
  }

  function logoImg(key, size, cls) {
    var src = logoSrc(key);
    size = size || 36;
    if (!src) return brand(key, size);
    return '<img src="' + src + '" alt="" loading="lazy" decoding="async" class="' + (cls || 'brand-img') +
      '" style="width:' + size + 'px;height:' + size + 'px;object-fit:contain">';
  }

  function badge(bank, size) {
    var cls = 'brand-badge' + (size === 'sm' ? ' sm' : size === 'lg' ? ' lg' : '');
    if (bank && bank.logo) return logoImg(bank.logo, size === 'lg' ? 46 : size === 'sm' ? 30 : 34);
    var abbr = (bank && (bank.abbr || bank.name) || '?').slice(0, 3);
    return '<span class="' + cls + '" style="background:' + ((bank && bank.color) || '#6c22a6') +
      ';color:' + ((bank && bank.fg) || '#fff') + '">' + esc(abbr) + '</span>';
  }

  function logoFor(item, size) {
    if (item && item.logo) return logoImg(item.logo, size || 34);
    if (item && item.brand) return brand(item.brand, size || 38);
    return badge(item, size === 46 ? 'lg' : 'sm');
  }

  /* the fingerprint line-art: white for the purple sensor circle, purple for
     the light sheets and the round loader. Both are cut from the uploaded
     artwork with a transparent background, so they scale cleanly. */
  function fingerprint(size, cls) {
    return '<img src="assets/img/fingerprint-white.png" alt="" class="fp-glyph ' + (cls || '') +
      '" style="width:' + (size || 56) + 'px;height:' + (size || 56) + 'px;object-fit:contain">';
  }
  function fingerprintLine(size, cls) {
    return '<img src="assets/img/fingerprint.png" alt="" class="fp-glyph ' + (cls || '') +
      '" style="width:' + (size || 72) + 'px;height:' + (size || 72) + 'px;object-fit:contain">';
  }
  /* the round purple sensor button from the sign-in screenshot: purple disc,
     white fingerprint, soft glow. */
  function bioButton(size, action, label) {
    return '<button class="bio-btn" data-action="' + (action || 'biometric') + '" ' +
      (label ? 'aria-label="' + esc(label) + '"' : '') +
      ' style="width:' + (size || 96) + 'px;height:' + (size || 96) + 'px">' +
      fingerprint(Math.round((size || 96) * 0.46)) + '</button>';
  }
  function cbeLogo(size, cls) {
    return '<img src="assets/img/cbe-logo.png" alt="" class="' + (cls || '') +
      '" style="width:' + (size || 34) + 'px;height:' + (size || 34) + 'px;object-fit:contain">';
  }

  /* ---------------------------------------------------------- formatters */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function group(n) {
    var parts = Number(n).toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }
  function money(n) { return group(Math.abs(Number(n) || 0)); }
  function moneyCur(n) { return group(Math.abs(Number(n) || 0)) + ' ETB'; }
  function signed(n) { return (n < 0 ? '-' : '+') + group(Math.abs(Number(n) || 0)); }
  function toDate(v) { return v instanceof Date ? v : new Date(v); }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function h12(d) { var h = d.getHours(); return (h % 12 || 12) + ':' + pad(d.getMinutes()) + ' ' + (h < 12 ? 'AM' : 'PM'); }
  function h12p(d) { var h = d.getHours(); return pad(h % 12 || 12) + ':' + pad(d.getMinutes()) + ' ' + (h < 12 ? 'AM' : 'PM'); }
  function shortDate(v) { var d = toDate(v); return d.getDate() + ' ' + MON[d.getMonth()] + ' ' + String(d.getFullYear()).slice(2) + ' ' + h12(d); }
  function longDate(v) { var d = toDate(v); return MON[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + ' ' + h12p(d); }
  function cardStamp(v) { var d = toDate(v); return d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear() + ' • ' + h12p(d); }
  function dayStamp(v) { var d = toDate(v); return MON[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + ' • ' + h12p(d); }
  function clock(v) { var d = toDate(v); return d.getHours() + ':' + pad(d.getMinutes()); }
  function initials(name) {
    var p = String(name || '').trim().split(/\s+/);
    return ((p[0] || '')[0] || '').toUpperCase() + ((p[1] || '')[0] || '').toUpperCase();
  }
  function ref() {
    var A = 'ABCDEFGHJKLMNPQRSTUVWXYZ', chars = '';
    for (var i = 0; i < 4; i++) chars += A[Math.floor(Math.random() * A.length)];
    var num = String(Math.floor(25000 + Math.random() * 900));
    return 'FT' + num + chars + 'X' + A[Math.floor(Math.random() * A.length)];
  }
  var ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
    'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  var TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function under1000(n) {
    var out = [];
    if (n >= 100) { out.push(ONES[Math.floor(n / 100)] + ' Hundred'); n %= 100; }
    if (n >= 20) { out.push(TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '')); n = 0; }
    if (n > 0) out.push(ONES[n]);
    return out.join(' ');
  }
  function words(n) {
    n = Math.floor(Math.abs(Number(n) || 0));
    if (n === 0) return 'Zero';
    var parts = [];
    var units = [[1000000000, 'Billion'], [1000000, 'Million'], [1000, 'Thousand']];
    units.forEach(function (u) {
      if (n >= u[0]) { parts.push(under1000(Math.floor(n / u[0])) + ' ' + u[1]); n %= u[0]; }
    });
    if (n > 0) parts.push(under1000(n));
    return parts.join(' ');
  }
  function amountInWords(amount) {
    var whole = Math.floor(Math.abs(amount));
    var cents = Math.round((Math.abs(amount) - whole) * 100);
    var s = words(whole) + ' ETB';
    if (cents > 0) s += ' and ' + words(cents) + (cents === 1 ? ' cent' : ' cents');
    return s;
  }
  /* mask 1000407533619 -> 1******3619, exactly like the account rows in the
     reference screenshots */
  function maskAccount(v) {
    var digits = String(v || '').replace(/\D/g, '');
    if (digits.length < 6) return String(v || '');
    return digits.slice(0, 1) + '******' + digits.slice(-4);
  }
  function last4(v) { return String(v || '').replace(/\D/g, '').slice(-4); }

  /* --------------------------------------------------------- overlays */
  var layerRoot = null;
  var stack = [];

  function setRoot(el) { layerRoot = el; }

  function open(html, opts) {
    opts = opts || {};
    var scrim = document.createElement('div');
    scrim.className = 'scrim';
    var el = document.createElement('div');
    el.className = opts.className || (opts.modal ? 'modal' : 'sheet');
    el.innerHTML = html;
    scrim.appendChild(el);
    if (opts.dismissible !== false) {
      scrim.addEventListener('click', function (e) { if (e.target === scrim) close(el); });
    }
    layerRoot.appendChild(scrim);
    var entry = { scrim: scrim, el: el, onClose: opts.onClose };
    stack.push(entry);
    /* swipe the sheet down to dismiss it — transform only, so it stays on the
       compositor and never triggers layout while the finger moves */
    if (!opts.modal && opts.dismissible !== false) {
      var startY = 0, dy = 0, dragging = false;
      el.addEventListener('touchstart', function (e) {
        if (e.touches.length !== 1) return;
        startY = e.touches[0].clientY;
        dy = 0;
        dragging = true;
        el.style.transition = 'none';
      }, { passive: true });
      el.addEventListener('touchmove', function (e) {
        if (!dragging) return;
        dy = e.touches[0].clientY - startY;
        if (dy < 0) dy = 0;
        el.style.transform = 'translate3d(0,' + dy + 'px,0)';
      }, { passive: true });
      el.addEventListener('touchend', function () {
        if (!dragging) return;
        dragging = false;
        el.style.transition = 'transform .22s var(--ease)';
        if (dy > 90) {
          el.style.transform = 'translate3d(0,' + (el.offsetHeight + 40) + 'px,0)';
          setTimeout(function () { close(el); }, 90);
        } else {
          el.style.transform = 'translate3d(0,0,0)';
        }
      }, { passive: true });
    }
    if (opts.onMount) opts.onMount(el);
    return el;
  }

  function close(el) {
    var idx = -1;
    for (var i = 0; i < stack.length; i++) if (stack[i].el === el || stack[i].scrim === el) idx = i;
    if (idx < 0) return;
    var entry = stack.splice(idx, 1)[0];
    entry.scrim.style.transition = 'opacity .15s linear';
    entry.scrim.style.opacity = '0';
    setTimeout(function () {
      if (entry.scrim.parentNode) entry.scrim.parentNode.removeChild(entry.scrim);
      if (entry.onClose) entry.onClose();
    }, 140);
  }

  function closeTop() {
    if (!stack.length) return false;
    close(stack[stack.length - 1].el);
    return true;
  }
  function closeAll() { while (stack.length) close(stack[stack.length - 1].el); }
  function hasLayers() { return stack.length > 0; }

  var toastTimer = null;
  function toast(msg, ms) {
    var old = layerRoot.querySelector('.toast');
    if (old) old.parentNode.removeChild(old);
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    layerRoot.appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      t.style.transition = 'opacity .2s linear';
      t.style.opacity = '0';
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 200);
    }, ms || 1800);
  }

  function copy(text, msg) {
    var done = function () { toast(msg || 'Copied'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else { fallbackCopy(text); done(); }
  }
  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e) { /* ignore */ }
  }

  /* --------------------------------------------------------- fragments */
  function appbar(title, opts) {
    opts = opts || {};
    return '<header class="appbar">' +
      '<button class="icon-btn" data-action="back" aria-label="Back">' + icon('chevronLeft', { size: 24 }) + '</button>' +
      '<h1' + (opts.id ? ' id="' + opts.id + '"' : '') + '>' + esc(title) + '</h1>' +
      (opts.right === '' ? '' : (opts.right || '<button class="icon-btn" data-action="searchMenu" aria-label="Search">' + icon('search', { size: 21 }) + '</button>')) +
      '</header>';
  }

  function row(o) {
    var ico = o.iconHtml ? '<span class="ico' + (o.round ? ' round' : '') + (o.plain ? ' plain' : '') + '">' + o.iconHtml + '</span>' : '';
    return '<button class="row' + (o.cls ? ' ' + o.cls : '') + '" data-action="' + esc(o.action || '') + '"' +
      (o.goto ? ' data-goto="' + esc(o.goto) + '"' : '') +
      (o.value ? ' data-value="' + esc(o.value) + '"' : '') +
      (o.extra || '') + '>' + ico +
      '<span class="txt"><b>' + esc(o.title) + '</b>' + (o.sub ? '<small>' + esc(o.sub) + '</small>' : '') + '</span>' +
      '<span class="chev">' + icon('chevronRight', { size: 20 }) + '</span></button>';
  }

  function field(o) {
    return '<div class="field"' + (o.id ? ' id="' + o.id + '"' : '') + '>' +
      (o.icon ? '<span class="fico">' + icon(o.icon, { size: 21 }) + '</span>' : '') +
      '<input ' + (o.type ? 'type="' + o.type + '"' : 'type="text"') +
      ' id="' + esc(o.inputId || '') + '" name="' + esc(o.name || '') + '"' +
      ' placeholder="' + esc(o.placeholder || '') + '"' +
      (o.inputmode ? ' inputmode="' + o.inputmode + '"' : '') +
      (o.value ? ' value="' + esc(o.value) + '"' : '') +
      (o.readonly ? ' readonly' : '') +
      (o.maxlength ? ' maxlength="' + o.maxlength + '"' : '') + '>' +
      (o.tail ? '<span class="tail"' + (o.tailAction ? ' data-action="' + o.tailAction + '" style="cursor:pointer"' : '') + '>' + o.tail + '</span>' : '') +
      '</div>';
  }

  function balanceCard(opts) {
    opts = opts || {};
    var st = CBE.state;
    var shown = st.showBalance;
    var noor = !!st.noor;
    var account = shown ? String(st.profile.accountNumber) : maskAccount(st.profile.accountNumber);
    return '<div class="balance-card">' +
      '<div class="bc-brand">' +
        '<span class="bc-logo">' + cbeLogo(28) + '</span>' +
        '<div><div class="n">' + esc(noor ? CBE.t('cbeNoor') : CBE.t('bankNameLong')) + '</div>' +
        '<div class="t">' + esc(noor ? 'ስሉ ኑር' : CBE.t('tagline')) + '</div></div>' +
      '</div>' +
      '<div class="bc-balance">' +
        '<span class="amt' + (shown ? '' : ' masked') + '">' + (shown ? money(st.balance) : '******') + '</span>' +
        '<span class="cur">ETB</span>' +
        '<button class="eye" data-action="toggleBalance" aria-label="Show balance">' + icon(shown ? 'eyeOff' : 'eye', { size: 20 }) + '</button>' +
      '</div>' +
      '<button class="bc-account" data-action="copyAccount">' +
        '<span>' + esc(CBE.t('savingAccount')) + ' ' + esc(account) + '</span>' +
        '<span class="copy">' + icon('copy', { size: 16 }) + '</span>' +
      '</button>' +
      '<div class="bc-time">' + esc(cardStamp(opts.at || Date.now())) + '</div>' +
    '</div>';
  }

  /* ---------------------------------------------------------- home pieces */
  function homeHead(opts) {
    opts = opts || {};
    var st = CBE.state;
    var name = opts.name || st.user.short || st.profile.holderName;
    return '<header class="home-head">' +
      '<div class="hh-top">' +
        '<span class="hh-avatar">' + esc(String(name || 'B')[0].toUpperCase()) + '</span>' +
        '<span class="hh-name"><small>' + esc(CBE.t('hello')) + '</small><b>' + esc(name) + '</b></span>' +
        '<span class="hh-actions">' +
          '<button class="lang-pill" data-action="language">' + esc(CBE.t('language')) + icon('chevronDown', { size: 15 }) + '</button>' +
          '<button class="icon-btn" data-action="notifications" aria-label="Notifications">' + icon('bell', { size: 21 }) + '</button>' +
          '<button class="icon-btn" data-action="searchMenu" aria-label="Search">' + icon('search', { size: 21 }) + '</button>' +
        '</span>' +
      '</div>' +
    '</header>';
  }

  /* the four round icon buttons with the label under them */
  function iconTile(o) {
    return '<button class="tile" data-action="' + esc(o.action || 'goto') + '"' +
      (o.goto ? ' data-goto="' + esc(o.goto) + '"' : '') +
      (o.value ? ' data-value="' + esc(o.value) + '"' : '') + '>' +
      '<span class="tile-ico">' + icon(o.icon || 'grid', { size: 22, weight: 1.8 }) + '</span>' +
      '<span class="tile-lbl">' + esc(o.title) + '</span></button>';
  }

  /* the wider two-per-row cards */
  function cardTile(o) {
    var cls = 'card-tile' + (o.center ? ' center' : '');
    var inner = o.center
      ? (o.logo ? logoImg(o.logo, 40) : '<span class="ct-ico"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[o.icon] || ICONS.grid) + '</svg></span>') +
        '<b>' + esc(o.title) + '</b>'
      : '<span class="ct-ico ' + (o.tone || 'pink') + '">' + icon(o.icon || 'transfer', { size: 19, weight: 2 }) + '</span>' +
        '<span class="ct-txt"><b>' + esc(o.title) + '</b>' + (o.sub ? '<small>' + esc(o.sub) + '</small>' : '') + '</span>';
    return '<button class="' + cls + '" data-action="' + esc(o.action || 'goto') + '"' +
      (o.goto ? ' data-goto="' + esc(o.goto) + '"' : '') +
      (o.value ? ' data-value="' + esc(o.value) + '"' : '') + '>' + inner + '</button>';
  }

  function walletTile(o) {
    return '<button class="wallet-tile" data-action="' + esc(o.action || 'goto') + '"' +
      (o.goto ? ' data-goto="' + esc(o.goto) + '"' : '') +
      (o.value ? ' data-value="' + esc(o.value) + '"' : '') + '>' +
      logoFor(o, 44) + '<span class="lbl">' + esc(o.title || o.name) + '</span></button>';
  }

  function osItem(o) {
    return '<button class="os-item" data-action="' + esc(o.action || 'goto') + '"' +
      (o.goto ? ' data-goto="' + esc(o.goto) + '"' : '') +
      (o.value ? ' data-value="' + esc(o.value) + '"' : '') + '>' +
      '<span class="oi">' + (o.logo ? logoImg(o.logo, 26) : (o.cbe ? cbeLogo(24) : icon(o.icon || 'grid', { size: 23, weight: 1.8 }))) + '</span>' +
      '<span class="lbl">' + esc(o.title) + '</span></button>';
  }

  function switchRow(o) {
    return '<div class="switch-row"><span class="txt"><b>' + esc(o.title) + '</b>' +
      (o.sub ? '<small>' + esc(o.sub) + '</small>' : '') + '</span>' +
      '<button class="switch' + (o.on ? ' on' : '') + '" data-toggle="' + esc(o.key) + '" aria-label="' + esc(o.title) + '"></button></div>';
  }

  function kvRow(k, v) {
    return '<div class="kv"><span class="k">' + esc(k) + '</span><span class="v">' + esc(v) + '</span></div>';
  }

  /* flat bank / wallet row used by the Bank Name sheet exactly like the photo */
  function bankRow(item) {
    return '<button class="bank-row" data-bank="' + esc(item.name) + '">' +
      '<span class="lg">' + logoFor(item, 36) + '</span>' +
      '<span class="txt"><b>' + esc(item.name) + '</b></span></button>';
  }

  function accountCard(account) {
    return '<button class="acct-card" data-action="pickAccount">' +
      '<small>' + esc(CBE.t('fromAccount')) + '</small>' +
      '<div class="acc">' + esc(account.label) + '</div>' +
      '<div class="dots">****** ' + icon('eyeOff', { size: 15 }) + '</div>' +
    '</button>';
  }

  function txRow(t) {
    var out = t.amount < 0;
    return '<button class="txn" data-action="txDetail" data-value="' + esc(t.id) + '">' +
      '<span class="ico ' + (out ? 'out' : 'in') + '">' + icon(out ? 'arrowUpRight' : 'arrowDownLeft', { size: 20, weight: 2 }) + '</span>' +
      '<span class="txt"><b>' + esc(t.name) + '</b><small>' + esc(shortDate(t.date)) + '</small></span>' +
      '<span class="right"><span class="amt ' + (out ? 'out' : 'in') + '">' + signed(t.amount) + ' ETB</span>' +
      '<span class="chip' + (t.tag === 'TRANSFER' ? ' purple' : '') + '">' + esc(t.tag) + '</span></span>' +
      '</button>';
  }

  function emptyState(text) { return '<div class="empty-state">' + esc(text) + '</div>'; }

  function tabbar(active) {
    var items = [
      { id: 'home', label: CBE.t('home'), icon: 'home' },
      { id: 'transactions', label: CBE.t('transactions'), icon: 'columns' },
      { id: 'settings', label: CBE.t('settings'), icon: 'gear' }
    ];
    return '<nav class="tabbar"><div class="tabbar-inner">' + items.map(function (it) {
      return '<button class="nav-item' + (active === it.id ? ' active' : '') + '" data-action="nav" data-value="' + it.id + '">' +
        '<span class="pill">' + icon(it.icon, { size: 22, weight: active === it.id ? 2 : 1.6 }) + '</span>' +
        '<span>' + esc(it.label) + '</span></button>';
    }).join('') + '</div></nav>';
  }

  function listRowSimple(o) {
    return '<button class="row" data-action="' + esc(o.action || 'goto') + '"' +
      (o.goto ? ' data-goto="' + esc(o.goto) + '"' : '') +
      (o.value ? ' data-value="' + esc(o.value) + '"' : '') + '>' +
      '<span class="ico">' + icon(o.icon || 'grid', { size: 22 }) + '</span>' +
      '<span class="txt"><b>' + esc(o.title) + '</b>' + (o.sub ? '<small>' + esc(o.sub) + '</small>' : '') + '</span>' +
      '<span class="chev">' + icon('chevronRight', { size: 20 }) + '</span></button>';
  }

  /* "Coming soon" placeholder — used by Mini Statement, Bill Share and the
     replacement-card request, exactly like the real app */
  function comingSoon(opts) {
    opts = opts || {};
    return '<section class="screen">' +
      appbar(opts.title || 'Coming Soon') +
      '<div class="sheet-light"><div class="screen-body no-nav">' +
        '<div class="soon">' +
          '<span class="halo"><span class="box">' + icon(opts.icon || 'rocket', { size: 30 }) + '</span></span>' +
          '<h2>' + esc(opts.heading || 'Coming Soon') + '</h2>' +
          '<p>' + esc(opts.text || '') + '</p>' +
          '<button class="btn btn-primary" data-action="back">' + esc(opts.cta || 'Go Back') + '</button>' +
        '</div>' +
      '</div></div>' +
    '</section>';
  }

  function govItem(o) {
    return '<button class="gov-item" data-action="' + esc(o.action || 'goto') + '"' +
      (o.goto ? ' data-goto="' + esc(o.goto) + '"' : '') +
      (o.value ? ' data-value="' + esc(o.value) + '"' : '') + '>' +
      '<span class="mark">' + (o.logo ? logoImg(o.logo, 40) : (o.img ? '<img src="' + o.img + '" alt="">' : icon(o.icon || 'building', { size: 22 }))) + '</span>' +
      '<span class="txt"><b>' + esc(o.title) + '</b>' + (o.sub ? '<small>' + esc(o.sub) + '</small>' : '') + '</span>' +
      '<span class="chev">' + icon('chevronDown', { size: 19 }) + '</span></button>';
  }

  function merchantTile(o) {
    return '<button class="merchant-tile" data-action="' + esc(o.action || 'goto') + '"' +
      (o.goto ? ' data-goto="' + esc(o.goto) + '"' : '') +
      (o.value ? ' data-value="' + esc(o.value) + '"' : '') + '>' +
      (o.logo ? logoImg(o.logo, 42) : '<span class="mark">' + esc(o.mark || String(o.title || '?').slice(0, 2)) + '</span>') +
      '<span class="lbl">' + esc(o.title) + '</span></button>';
  }

  function emptyVisual(o) {
    return '<div class="empty-visual">' +
      '<span class="sq">' + icon(o.icon || 'receipt', { size: 34 }) + '</span>' +
      '<h3>' + esc(o.title) + '</h3>' +
      '<p>' + esc(o.text) + '</p>' +
      (o.cta ? '<button class="pill-btn" data-action="' + esc(o.action || 'refreshHistory') + '"' +
        (o.value ? ' data-value="' + esc(o.value) + '"' : '') + '>' + icon(o.ctaIcon || 'refresh', { size: 19 }) + esc(o.cta) + '</button>' : '') +
    '</div>';
  }

  CBE.icon = icon;
  CBE.brand = brand;
  CBE.logoImg = logoImg;
  CBE.badge = badge;
  CBE.logoFor = logoFor;
  CBE.fingerprint = fingerprint;
  CBE.fingerprintLine = fingerprintLine;
  CBE.bioButton = bioButton;
  CBE.cbeLogo = cbeLogo;
  CBE.bankRow = bankRow;
  CBE.ui = {
    /* brand helpers are exposed here as well as on CBE so either call style works */
    badge: badge, brand: brand, logoImg: logoImg, logoFor: logoFor,
    cbeLogo: cbeLogo, fingerprint: fingerprint, fingerprintLine: fingerprintLine, bioButton: bioButton,
    esc: esc, money: money, moneyCur: moneyCur, group: group, signed: signed,
    shortDate: shortDate, longDate: longDate, cardStamp: cardStamp, dayStamp: dayStamp,
    clock: clock, initials: initials, ref: ref, words: words, amountInWords: amountInWords,
    maskAccount: maskAccount, last4: last4,
    setRoot: setRoot, open: open, close: close, closeTop: closeTop,
    closeAll: closeAll, hasLayers: hasLayers, toast: toast, copy: copy,
    appbar: appbar, row: row, listRowSimple: listRowSimple, field: field,
    balanceCard: balanceCard, accountCard: accountCard, txRow: txRow, bankRow: bankRow,
    emptyState: emptyState, tabbar: tabbar, comingSoon: comingSoon,
    govItem: govItem, merchantTile: merchantTile, emptyVisual: emptyVisual,
    homeHead: homeHead, iconTile: iconTile, cardTile: cardTile, walletTile: walletTile,
    osItem: osItem, switchRow: switchRow, kvRow: kvRow
  };
})(typeof window !== 'undefined' ? window : this);
