/* ==========================================================================
   icons.js — one inline SVG icon set (stroke based, 24x24) plus the small
   hand-built brand emblems for brands we have no uploaded artwork for.
   ========================================================================== */
(function (global) {
  'use strict';

  var CBE = global.CBE || (global.CBE = {});
  var esc = CBE.esc;

  /* ------------------------------------------------------------- icons */
  var I = {
    home: '<path d="M4 10.4 12 4l8 6.4V20a1 1 0 0 1-1 1h-4.6v-6.2H9.6V21H5a1 1 0 0 1-1-1Z"/>',
    grid4: '<rect x="3.4" y="3.4" width="7.2" height="7.2" rx="1.6" fill="currentColor" stroke="none"/><rect x="13.4" y="3.4" width="7.2" height="7.2" rx="1.6" fill="currentColor" stroke="none"/><rect x="3.4" y="13.4" width="7.2" height="7.2" rx="1.6" fill="currentColor" stroke="none"/><rect x="13.4" y="13.4" width="7.2" height="7.2" rx="1.6" fill="currentColor" stroke="none"/>',
    bell: '<path d="M18 15.6V10a6 6 0 1 0-12 0v5.6L4.4 18h15.2Z"/><path d="M10 21h4"/>',
    search: '<circle cx="11" cy="11" r="6.4"/><path d="M15.8 15.8 20.4 20.4"/>',
    refresh: '<path d="M20 11.6A8 8 0 0 0 6.2 6.8L4 9"/><path d="M4 4.6V9h4.4"/><path d="M4 12.4a8 8 0 0 0 13.8 4.8L20 15"/><path d="M20 19.4V15h-4.4"/>',
    chevronLeft: '<path d="M14.6 5.6 8.2 12l6.4 6.4"/>',
    chevronRight: '<path d="M9.4 5.6 15.8 12l-6.4 6.4"/>',
    chevronDown: '<path d="M5.6 9.4 12 15.8l6.4-6.4"/>',
    eye: '<path d="M2.6 12S6 6.2 12 6.2 21.4 12 21.4 12 18 17.8 12 17.8 2.6 12 2.6 12Z"/><circle cx="12" cy="12" r="2.8"/>',
    eyeOff: '<path d="M4 4l16 16"/><path d="M9.6 5.1A9.8 9.8 0 0 1 12 4.9c6 0 9.4 5.8 9.4 5.8a17 17 0 0 1-2.6 3.4"/><path d="M6.2 7A17 17 0 0 0 2.6 10.7S6 16.5 12 16.5a9 9 0 0 0 3.5-.7"/><path d="M9.9 10.2a2.8 2.8 0 0 0 3.9 3.9"/>',
    copy: '<rect x="8.6" y="8.6" width="11" height="11" rx="2.2"/><path d="M15.4 5.6A2 2 0 0 0 13.4 4.4H6.6a2 2 0 0 0-2 2v6.8a2 2 0 0 0 1.2 1.8"/>',
    share: '<circle cx="17.6" cy="6" r="2.6"/><circle cx="6.4" cy="12" r="2.6"/><circle cx="17.6" cy="18" r="2.6"/><path d="M8.8 10.8 15.2 7.3"/><path d="M8.8 13.2 15.2 16.7"/>',
    download: '<path d="M12 4.4v10.2"/><path d="M8.2 11 12 14.8 15.8 11"/><path d="M4.6 17.6v1.2a1.6 1.6 0 0 0 1.6 1.6h11.6a1.6 1.6 0 0 0 1.6-1.6v-1.2"/>',
    camera: '<path d="M4 8.4h2.6l1.4-2h8l1.4 2H20a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13.6" r="3.4"/>',
    qr: '<rect x="3.6" y="3.6" width="6.4" height="6.4" rx="1"/><rect x="14" y="3.6" width="6.4" height="6.4" rx="1"/><rect x="3.6" y="14" width="6.4" height="6.4" rx="1"/><path d="M14 14h2.6v2.6H14zM19.4 19.4h1v1h-1zM14 20.4h1v-1"/>',
    scan: '<path d="M3.6 8.6V5.6a1.6 1.6 0 0 1 1.6-1.6h3"/><path d="M15.8 4h3a1.6 1.6 0 0 1 1.6 1.6v3"/><path d="M20.4 15.8v3a1.6 1.6 0 0 1-1.6 1.6h-3"/><path d="M8.6 20.4h-3a1.6 1.6 0 0 1-1.6-1.6v-3"/><path d="M3.6 12h16.8"/>',
    plus: '<path d="M12 5.6v12.8"/><path d="M5.6 12h12.8"/>',
    minus: '<path d="M5.6 12h12.8"/>',
    check: '<path d="M5 12.8 9.6 17.4 19 8"/>',
    x: '<path d="M6.4 6.4 17.6 17.6"/><path d="M17.6 6.4 6.4 17.6"/>',
    trash: '<path d="M4.6 7.4h14.8"/><path d="M9 7.4V5.2h6v2.2"/><path d="M6.4 7.4l.9 11.4a1.4 1.4 0 0 0 1.4 1.3h6.6a1.4 1.4 0 0 0 1.4-1.3l.9-11.4"/>',
    user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20.4a7.2 7.2 0 0 1 14.4 0"/>',
    users: '<circle cx="9.2" cy="8.4" r="3.2"/><path d="M3.6 19.6a5.6 5.6 0 0 1 11.2 0"/><path d="M16 5.6a3.2 3.2 0 0 1 0 6.2"/><path d="M17.4 19.6a5.7 5.7 0 0 0-1.4-3.8"/>',
    idCard: '<rect x="3.2" y="5.2" width="17.6" height="13.6" rx="2.2"/><circle cx="9" cy="11.2" r="1.8"/><path d="M5.8 16.6a3.6 3.6 0 0 1 6.4 0"/><path d="M14.4 10.4h4.2M14.4 13.6h3"/>',
    contact: '<rect x="3.6" y="4.4" width="16.8" height="15.2" rx="2.2"/><circle cx="10" cy="10.4" r="1.9"/><path d="M7.2 15.8a3.2 3.2 0 0 1 5.6 0"/><path d="M15 9.6h3M15 13.2h3"/>',
    lock: '<rect x="5.4" y="10.4" width="13.2" height="9.6" rx="2"/><path d="M8.6 10.4V8.2a3.4 3.4 0 0 1 6.8 0v2.2"/>',
    key: '<circle cx="8.2" cy="8.2" r="3.4"/><path d="M10.6 10.6 19 19"/><path d="M15.4 14.4l1.8 1.8"/><path d="M17.6 12.2l1.8 1.8"/>',
    shieldCheck: '<path d="M12 3.4 19 6.2v5.6c0 4.3-3 8-7 9.2-4-1.2-7-4.9-7-9.2V6.2Z"/><path d="M8.8 12.2 11 14.4l4.2-4.4"/>',
    shield: '<path d="M12 3.4 19 6.2v5.6c0 4.3-3 8-7 9.2-4-1.2-7-4.9-7-9.2V6.2Z"/>',
    logout: '<path d="M14.4 4.6h3.2a1.6 1.6 0 0 1 1.6 1.6v11.6a1.6 1.6 0 0 1-1.6 1.6h-3.2"/><path d="M10.4 8 6.4 12l4 4"/><path d="M6.4 12h9.2"/>',
    info: '<circle cx="12" cy="12" r="8.4"/><path d="M12 11v5.2"/><path d="M12 7.8h.01"/>',
    globe: '<circle cx="12" cy="12" r="8.4"/><path d="M3.6 12h16.8"/><path d="M12 3.6a13 13 0 0 1 0 16.8 13 13 0 0 1 0-16.8Z"/>',
    mail: '<rect x="3.2" y="5.6" width="17.6" height="12.8" rx="2"/><path d="M4.2 7 12 12.4 19.8 7"/>',
    mapPin: '<path d="M12 21c4.2-4.6 6.6-7.6 6.6-10.8a6.6 6.6 0 1 0-13.2 0C5.4 13.4 7.8 16.4 12 21Z"/><circle cx="12" cy="10.2" r="2.4"/>',
    chat: '<path d="M20.4 11.6c0 4-3.8 7.2-8.4 7.2a9.7 9.7 0 0 1-2.7-.4L4.6 20l1.2-3.6A7 7 0 0 1 3.6 11.6C3.6 7.6 7.4 4.4 12 4.4s8.4 3.2 8.4 7.2Z"/>',
    phone: '<path d="M6.6 3.6h2.2l1.6 4-2 1.4a11 11 0 0 0 5.8 5.8l1.4-2 4 1.6v2.2a2 2 0 0 1-2.2 2 16.4 16.4 0 0 1-13.4-13.4 2 2 0 0 1 2-2Z"/>',
    receipt: '<path d="M6 3.6h12v16.8l-3-1.8-3 1.8-3-1.8-3 1.8Z"/><path d="M9 8.4h6M9 12h6"/>',
    receiptCheck: '<path d="M5.6 3.6h12.8v16.8l-3.2-1.8-3.2 1.8-3.2-1.8-3.2 1.8Z"/><path d="M9.2 11.4l2 2 3.6-3.8"/>',
    calendar: '<rect x="3.6" y="5.4" width="16.8" height="15" rx="2.2"/><path d="M3.6 10h16.8"/><path d="M8.2 3.4v3.4M15.8 3.4v3.4"/>',
    link: '<path d="M10.4 13.6a3.6 3.6 0 0 0 5.1 0l2.5-2.5a3.6 3.6 0 1 0-5.1-5.1l-1 1"/><path d="M13.6 10.4a3.6 3.6 0 0 0-5.1 0l-2.5 2.5a3.6 3.6 0 1 0 5.1 5.1l1-1"/>',
    printer: '<path d="M7 9V4.6h10V9"/><rect x="3.6" y="9" width="16.8" height="7.4" rx="1.8"/><path d="M7 14.4h10v5H7z"/>',
    coins: '<ellipse cx="9.6" cy="7.6" rx="5.6" ry="2.8"/><path d="M4 7.6v4c0 1.5 2.5 2.8 5.6 2.8"/><path d="M4 11.6v4c0 1.6 2.5 2.8 5.6 2.8 1 0 2-.2 2.8-.5"/><ellipse cx="15.4" cy="15.6" rx="4.6" ry="2.4"/><path d="M10.8 15.6v3.6c0 1.3 2 2.4 4.6 2.4s4.6-1.1 4.6-2.4v-3.6"/>',
    droplet: '<path d="M12 3.6c3.4 4 5.4 6.6 5.4 9.2a5.4 5.4 0 0 1-10.8 0c0-2.6 2-5.2 5.4-9.2Z"/>',
    bolt: '<path d="M13.6 3.4 6.4 13.2h4.6l-.6 7.4 7.2-9.8h-4.6Z"/>',
    chart: '<path d="M4.4 20.4V4.6"/><path d="M4.4 20.4h15.2"/><path d="M8.4 20.4v-6M12.4 20.4V9.6M16.4 20.4v-4"/>',
    sliders: '<path d="M5 8h14"/><path d="M5 16h14"/><circle cx="9.6" cy="8" r="2.2" fill="currentColor" stroke="none"/><circle cx="14.4" cy="16" r="2.2" fill="currentColor" stroke="none"/>',
    shoppingBag: '<path d="M5.6 8.4h12.8l1 11.2a1.4 1.4 0 0 1-1.4 1.5H6a1.4 1.4 0 0 1-1.4-1.5Z"/><path d="M9 8.4V6.6a3 3 0 0 1 6 0v1.8"/>',
    cart: '<circle cx="9.6" cy="19" r="1.6"/><circle cx="17" cy="19" r="1.6"/><path d="M3.4 4.4h2.2l2.2 10.2h10.4l2-7.4H6.2"/>',
    tag: '<path d="M11 3.8H4.6V10l9.4 9.4 6.4-6.4Z"/><circle cx="8" cy="7.2" r="1.4"/>',
    briefcase: '<rect x="3.4" y="7.6" width="17.2" height="12" rx="2"/><path d="M8.6 7.6V6a1.6 1.6 0 0 1 1.6-1.6h3.6A1.6 1.6 0 0 1 15.4 6v1.6"/>',
    percent: '<path d="M6.4 6.4 17.6 17.6"/><circle cx="7.6" cy="7.6" r="2.4"/><circle cx="16.4" cy="16.4" r="2.4"/>',
    dots9: '<circle cx="6" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="6" cy="18" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="18" r="1.5" fill="currentColor" stroke="none"/>',
    gift: '<rect x="3.6" y="9.4" width="16.8" height="10.6" rx="1.8"/><path d="M3.6 13.4h16.8"/><path d="M12 9.4V20"/><path d="M12 9.4S10.6 4.6 8.2 4.6a2.4 2.4 0 0 0 0 4.8Z"/><path d="M12 9.4s1.4-4.8 3.8-4.8a2.4 2.4 0 0 1 0 4.8Z"/>',
    bank: '<path d="M3.6 9.8 12 4.6l8.4 5.2Z"/><path d="M5.6 9.8v8.2M9.6 9.8v8.2M14.4 9.8v8.2M18.4 9.8v8.2"/><path d="M3.6 18h16.8v2.4H3.6z"/>',
    building: '<rect x="5" y="4.4" width="14" height="16.2" rx="1.8"/><path d="M8.6 8.4h2.2M13.2 8.4h2.2M8.6 12h2.2M13.2 12h2.2"/><path d="M10 20.6v-3.8h4v3.8"/>',
    atm: '<rect x="3.6" y="5.4" width="16.8" height="14" rx="2"/><path d="M7.2 9.4h9.6"/><path d="M7.2 13h4M7.2 16h6"/>',
    arrowUpRight: '<path d="M7.4 16.6 16.6 7.4"/><path d="M9.6 7.4h7v7"/>',
    arrowDownLeft: '<path d="M16.6 7.4 7.4 16.6"/><path d="M14.4 16.6h-7v-7"/>',
    arrowsSwap: '<path d="M4.4 8.6h13.2"/><path d="M14.4 5.4 17.6 8.6l-3.2 3.2"/><path d="M19.6 15.4H6.4"/><path d="M9.6 12.2 6.4 15.4l3.2 3.2"/>',
    wallet: '<path d="M4.4 7.4A2 2 0 0 1 6.4 5.4h11.2a2 2 0 0 1 2 2v9.2a2 2 0 0 1-2 2H6.4a2 2 0 0 1-2-2Z"/><path d="M3.6 9.6h16.4"/><circle cx="16.4" cy="14" r="1.2" fill="currentColor" stroke="none"/>',
    listRows: '<path d="M5.6 7.4h12.8M5.6 12h12.8M5.6 16.6h8.4"/>',
    creditCard: '<rect x="3.2" y="5.6" width="17.6" height="12.8" rx="2"/><path d="M3.2 10h17.6"/><path d="M6.6 14.4h3.2"/>',
    send: '<path d="M20.4 4.6 3.6 11.2l6.4 2.4 2.4 6.4Z"/><path d="M20.4 4.6 10 13.6"/>',
    bookmarkCheck: '<path d="M6.4 3.8h11.2v16.8l-5.6-3.4-5.6 3.4Z"/><path d="M9.4 11l1.8 1.8L14.6 9.4"/>',
    clock: '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.6V12l3 2"/>',
    filter: '<path d="M4.4 6.4h15.2"/><path d="M7.4 12h9.2"/><path d="M10.4 17.6h3.2"/>',
    star: '<path d="M12 4.4l2.4 5 5.4.7-3.9 3.7 1 5.4-4.9-2.7-4.9 2.7 1-5.4L4.2 10l5.4-.7Z"/>',
    car: '<path d="M5 15.6v2.6M19 15.6v2.6"/><path d="M3.6 15.6v-3.4l1.8-4.6h13.2l1.8 4.6v3.4Z"/><circle cx="7.4" cy="15.6" r="1.4"/><circle cx="16.6" cy="15.6" r="1.4"/>',
    plane: '<path d="M20.4 12 3.6 5.4l3.6 6.6-3.6 6.6Z"/>',
    wifi: '<path d="M4.4 9.6a11 11 0 0 1 15.2 0"/><path d="M7 12.8a7.2 7.2 0 0 1 10 0"/><path d="M9.6 16a3.4 3.4 0 0 1 4.8 0"/><path d="M12 19.4h.01"/>',
    book: '<path d="M4.4 5.4A1.8 1.8 0 0 1 6.2 3.6h12v16.8h-12a1.8 1.8 0 0 0-1.8 1.8Z"/><path d="M4.4 18.6a1.8 1.8 0 0 1 1.8-1.8h12v3.6h-12a1.8 1.8 0 0 1-1.8-1.8Z"/>',
    ticket: '<path d="M3.6 8.4V6.6h16.8v1.8a2.4 2.4 0 0 0 0 4.8v1.8a2.4 2.4 0 0 0 0 4.8v.4H3.6v-.4a2.4 2.4 0 0 0 0-4.8v-1.8a2.4 2.4 0 0 0 0-4.8Z"/><path d="M13.4 6.6v12"/>',
    heart: '<path d="M12 19.6S4.4 15.2 4.4 10.2a4 4 0 0 1 7.6-1.8 4 4 0 0 1 7.6 1.8c0 5-7.6 9.4-7.6 9.4Z"/>',
    graduation: '<path d="M12 4.6 21 9l-9 4.4L3 9Z"/><path d="M6.6 11.4v4.8c0 1.4 2.4 2.6 5.4 2.6s5.4-1.2 5.4-2.6v-4.8"/>',
    ruler: '<path d="M14.4 3.6 20.4 9.6 9.6 20.4 3.6 14.4Z"/><path d="M9 9l2 2M12 6l2 2M6 12l2 2"/>',
    power: '<path d="M12 4v7"/><path d="M7.6 6.6a7 7 0 1 0 8.8 0"/>',
    fingerprint: '<path d="M6.6 9.4a7.4 7.4 0 0 1 10.8 0"/><path d="M9 12.4a4 4 0 0 1 6 0"/><path d="M11.6 15.6a.9.9 0 0 1 1.6 0c.4 1.6.4 3.4 0 4.8"/><path d="M8.2 18.4c-.6-1.4-.8-2.8-.8-4.2"/><path d="M16.6 18.4c.5-1.4.7-2.8.7-4.2"/>',
    doc: '<path d="M6.4 4.6h7l4.6 4.6v10.2a1.6 1.6 0 0 1-1.6 1.6H6.4a1.6 1.6 0 0 1-1.6-1.6V6.2a1.6 1.6 0 0 1 1.6-1.6Z"/><path d="M13.4 4.6v4.6h4.6"/><path d="M8.4 13.4h7M8.4 16.6h4.6"/>',
    exchange: '<path d="M5.6 7.6h11l-2.6-2.6"/><path d="M16.6 12h-11l2.6 2.6"/>',
    ussd: '<circle cx="6" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="18" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="6" cy="18" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="18" r="1.4" fill="currentColor" stroke="none"/>',
    bankCard: '<rect x="3.2" y="6" width="17.6" height="12" rx="2"/><path d="M3.2 10.4h17.6"/><path d="M6.8 14.6h4"/>',
    lightbulb: '<path d="M9.4 17.4h5.2"/><path d="M10.2 20.4h3.6"/><path d="M12 3.6a5.6 5.6 0 0 1 3.4 10c-.6.5-.9 1-.9 1.8H9.5c0-.8-.3-1.3-.9-1.8A5.6 5.6 0 0 1 12 3.6Z"/>',
    alert: '<path d="M12 4.6 21 19.4H3Z"/><path d="M12 10v4"/><path d="M12 16.8h.01"/>',
    calculator: '<rect x="4.4" y="3.4" width="15.2" height="17.2" rx="2.2"/><rect x="7.4" y="6.4" width="9.2" height="3.2" rx="1"/><path d="M8.2 13.2h.01M12 13.2h.01M15.8 13.2h.01M8.2 17h.01M12 17h.01M15.8 17h.01"/>',
    screenshot: '<path d="M8.6 3.6H6.2a2.6 2.6 0 0 0-2.6 2.6v2.4"/><path d="M15.4 3.6h2.4a2.6 2.6 0 0 1 2.6 2.6v2.4"/><path d="M20.4 15.4v2.4a2.6 2.6 0 0 1-2.6 2.6h-2.4"/><path d="M8.6 20.4H6.2a2.6 2.6 0 0 1-2.6-2.6v-2.4"/>',
    dot: '<circle cx="12" cy="12" r="3.4" fill="currentColor" stroke="none"/>'
  };

  function icon(name, size, cls) {
    var d = I[name] || I.dot;
    var s = size || 22;
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" width="' + s + '" height="' + s +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + d + '</svg>';
  }

  /* ------------------------------------------------------- brand emblems */
  /* small standalone marks for brands we have no artwork file for; each one
     is drawn to read like the logo in the screenshots at 40 px. */
  var E = {
    safaricom: '<svg viewBox="0 0 48 48" width="100%" height="100%"><path d="M8 22c0-8 7-14 16-14s16 6 16 14" fill="none" stroke="#3ba935" stroke-width="5.5" stroke-linecap="round"/><path d="M40 26c0 8-7 14-16 14S8 34 8 26" fill="none" stroke="#3ba935" stroke-width="5.5" stroke-linecap="round"/><path d="M31 16c-2.4-2.4-6-3.4-9.4-2.4-4.6 1.4-6.6 6-4.4 9.6 1.8 3 5.6 4 8.8 2.4" fill="none" stroke="#e0212c" stroke-width="4.4" stroke-linecap="round"/></svg>',
    aawsa: '<svg viewBox="0 0 48 48" width="100%" height="100%"><circle cx="24" cy="24" r="21" fill="#fff" stroke="#1f6fb2" stroke-width="2.4"/><path d="M24 11c5 6.4 7.6 10.4 7.6 14.2a7.6 7.6 0 0 1-15.2 0C16.4 21.4 19 17.4 24 11Z" fill="#39a3dc"/><path d="M18 30c3 2 9 2 12 0" fill="none" stroke="#1f6fb2" stroke-width="2" stroke-linecap="round"/></svg>',
    webirr: '<svg viewBox="0 0 48 48" width="100%" height="100%"><rect x="3" y="3" width="42" height="42" rx="8" fill="#fff"/><path d="M13 20a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" fill="#1a1a1a"/><path d="M25 28a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" fill="#3aa63c"/><path d="M21 34a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" fill="#3aa63c"/><path d="M13 14a5 5 0 0 1 10 0" fill="none" stroke="#1a1a1a" stroke-width="2"/></svg>',
    websprix: '<svg viewBox="0 0 48 48" width="100%" height="100%"><rect x="3" y="8" width="42" height="32" rx="5" fill="#f5d400"/><text x="24" y="30" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="#1a1a1a" text-anchor="middle">WS</text><text x="24" y="37" font-family="Arial, sans-serif" font-size="6.5" fill="#1a1a1a" text-anchor="middle">WEBSPrix</text></svg>',
    'ethiopian-electric': '<svg viewBox="0 0 48 48" width="100%" height="100%"><path d="M6 20c0-5 5-9 11-9s11 4 11 9" fill="none" stroke="#7b2bbd" stroke-width="7" stroke-linecap="round"/><path d="M6 28c0 5 5 9 11 9s11-4 11-9" fill="none" stroke="#7b2bbd" stroke-width="7" stroke-linecap="round"/><path d="M30 24h12" stroke="#7b2bbd" stroke-width="6" stroke-linecap="round"/></svg>',
    eeu: '<svg viewBox="0 0 48 48" width="100%" height="100%"><circle cx="24" cy="24" r="20" fill="#fff"/><path d="M24 4a20 20 0 0 1 0 40Z" fill="#f08a1c"/><path d="M24 4a20 20 0 0 0 0 40Z" fill="#3fae49"/><path d="M24 12v24M17 20h14M17 28h14" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>',
    halalpay: '<svg viewBox="0 0 48 48" width="100%" height="100%"><text x="24" y="26" font-family="Georgia, serif" font-size="13" font-weight="700" fill="#1a1a1a" text-anchor="middle">Halal</text><text x="24" y="37" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#1a1a1a" text-anchor="middle">Pay</text></svg>',
    kacha: '<svg viewBox="0 0 48 48" width="100%" height="100%"><path d="M12 10 24 22 12 34" fill="none" stroke="#f2b21a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M26 22h13" fill="none" stroke="#e2231a" stroke-width="7" stroke-linecap="round"/></svg>'
  };

  /* monogram tile for everything else: colour matched, never a broken image */
  function mark(text, color, size, radius) {
    var s = size || 40;
    var fs = Math.max(9, Math.round(s * (String(text).length > 2 ? 0.3 : 0.4)));
    return '<span class="logo-tile" style="width:' + s + 'px;height:' + s + 'px;background:' + color +
      ';font-size:' + fs + 'px;border-radius:' + (radius || 9) + 'px">' + esc(text) + '</span>';
  }

  function emblem(name, size) {
    var s = size || 40;
    return '<span style="display:inline-flex;width:' + s + 'px;height:' + s +
      'px;align-items:center;justify-content:center">' + (E[name] || '') + '</span>';
  }

  CBE.icon = icon;
  CBE.mark = mark;
  CBE.emblem = emblem;
  CBE.iconNames = I;
})(typeof window !== 'undefined' ? window : this);
