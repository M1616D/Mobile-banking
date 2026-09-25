/* CBE Mobile Banking — inline SVG icon set */
(function () {
  const S = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/>',
    bank: '<path d="M3 10h18M4 10V19h16v-9M2 10l10-6 10 6"/><path d="M8 19v-5M12 19v-5M16 19v-5"/>',
    swap: '<path d="M7 4v12M7 4 4 7M7 4l3 3M17 20V8M17 20l3-3M17 20l-3-3"/>',
    settings: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v3M12 18.2v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2.8 12h3M18.2 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    gear: '<path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.5-2.4 1a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5a7.6 7.6 0 0 0-2.6 1.5l-2.4-1-2 3.5 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.5 2.4-1a7.6 7.6 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.6 7.6 0 0 0 2.6-1.5l2.4 1 2-3.5Z"/><circle cx="12" cy="12" r="3.2"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    chev: '<path d="M9 5l7 7-7 7"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    bell: '<path d="M6 9.5a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19.5a2.2 2.2 0 0 0 4 0"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>',
    send: '<path d="M4 12 20 4l-4 16-4.5-6.5L4 12Z"/><path d="m11.5 13.5 4-4"/>',
    receive: '<path d="M20 12 4 20l4-16 4.5 6.5L20 12Z"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M4 4l16 16"/><path d="M9.9 5.9A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.5 17.5 0 0 1-3 3.7M6.6 6.6A16.9 16.9 0 0 0 2.5 12S6 18.5 12 18.5a9.4 9.4 0 0 0 4.3-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    qr: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><path d="M14 14h3v3h-3zM19.5 14H21v1.5h-1.5zM14 19.5h1.5V21H14zM18 18h3v3h-3z"/>',
    scan: '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><path d="M4 12h16"/>',
    phone: '<path d="M5 4h4l1.5 4.5L8 10a12 12 0 0 0 6 6l1.5-2.5L20 15v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
    card: '<rect x="2.5" y="5.5" width="19" height="13" rx="2.5"/><path d="M2.5 10h19M6 15h4"/>',
    doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 16.5h6"/>',
    statement: '<path d="M6 3h12v18H6z"/><path d="M9 7.5h6M9 11h6M9 14.5h4"/>',
    cash: '<rect x="2.5" y="7" width="19" height="11" rx="2"/><circle cx="12" cy="12.5" r="2.6"/><path d="M6 10v.01M18 15v.01"/>',
    share: '<circle cx="6" cy="12" r="2.5"/><circle cx="17.5" cy="5.5" r="2.5"/><circle cx="17.5" cy="18.5" r="2.5"/><path d="m8.3 10.8 7-4M8.3 13.2l7 4"/>',
    download: '<path d="M12 4v11M12 15l-4.5-4.5M12 15l4.5-4.5M4.5 19.5h15"/>',
    screenshot: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3.6"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    check: '<path d="M4.5 12.5 10 18 19.5 7"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2.5"/>',
    user: '<circle cx="12" cy="8.2" r="3.7"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
    users: '<circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M15.5 6.3a3.2 3.2 0 0 1 0 5.9M17.5 13.8a5.5 5.5 0 0 1 3 5.2"/>',
    fingerprint: '<path d="M12 11a3 3 0 0 0-3 3c0 2.5-.5 4.5-1.5 6M12 11a3 3 0 0 1 3 3c0 1.8.2 3.4.7 4.8M12 7.6A6.4 6.4 0 0 0 5.6 14c0 1.6-.2 3-.7 4.3M12 7.6a6.4 6.4 0 0 1 6.4 6.4c0 .6 0 1.2.1 1.8M8.5 4.9A9.3 9.3 0 0 1 12 4.1a9.4 9.4 0 0 1 7.6 3.9M4 8.4A9.4 9.4 0 0 1 6 6.3"/>',
    wifi: '<path d="M4 9.5a12 12 0 0 1 16 0M7 13a8 8 0 0 1 10 0M10 16.4a4 4 0 0 1 4 0"/><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5a13.5 13.5 0 0 1 0 17M12 3.5a13.5 13.5 0 0 0 0 17"/>',
    mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 7.8v.2"/>',
    shield: '<path d="M12 3 5 5.8v5.4c0 4.4 3 8.4 7 9.8 4-1.4 7-5.4 7-9.8V5.8Z"/><path d="m9.2 11.8 2 2 3.6-3.8"/>',
    key: '<circle cx="8" cy="14" r="4"/><path d="m11 11 8.5-8.5M17 5l2.5 2.5M14.5 7.5 17 10"/>',
    lock: '<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/>',
    logout: '<path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9M15.5 16l4-4-4-4M19.5 12H9.5"/>',
    pin: '<path d="M12 21s-6.5-5.4-6.5-10.2a6.5 6.5 0 0 1 13 0C18.5 15.6 12 21 12 21Z"/><circle cx="12" cy="10.5" r="2.3"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="2"/><path d="M5.5 15.5h-1a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    link: '<path d="M9.5 14.5 14.5 9.5"/><path d="M11 6.5 13 4.5a4.6 4.6 0 0 1 6.5 6.5l-2 2"/><path d="m13 17.5-2 2a4.6 4.6 0 0 1-6.5-6.5l2-2"/>',
    flash: '<path d="M13 2 5 13.5h5L11 22l8-11.5h-5Z"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="9.5" r="1.6"/><path d="m4.5 17.5 4.7-4.7 3 3 3.3-3.3 4 4"/>',
    trash: '<path d="M4.5 6.5h15M9.5 6V4.5h5V6M7 6.5l.8 13h8.4l.8-13M10.2 10v6M13.8 10v6"/>',
    edit: '<path d="M4 20h4.5L20 8.5a2.5 2.5 0 0 0-4.5-4.5L4 15.5Z"/><path d="m14.5 6.5 3 3"/>',
    history: '<path d="M3.5 12a8.5 8.5 0 1 1 2.5 6M3.5 12H8M3.5 12 6 9.5"/><path d="M12 8v4.2l3 1.8"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
    wallet: '<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5Z"/><path d="M15 12h3.5M3 9.5h13"/>',
    gift: '<rect x="4" y="9" width="16" height="11.5" rx="1.5"/><path d="M12 9v11.5M4 13.5h16"/><path d="M12 9C10 9 7.5 8.4 7.5 6.4A2.2 2.2 0 0 1 12 5.7a2.2 2.2 0 0 1 4.5.7c0 2-2.5 2.6-4.5 2.6Z"/>',
    ticket: '<path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z"/><path d="M13 6v2.5M13 11v2M13 15.5V18"/>',
    film: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M8 4.5v15M16 4.5v15M3.5 9.5H8M3.5 14.5H8M16 9.5h4.5M16 14.5h4.5"/>',
    cart: '<circle cx="9.5" cy="19" r="1.6"/><circle cx="17" cy="19" r="1.6"/><path d="M3.5 4.5H6l2.5 10.5h9L20 8H7"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="7.5" cy="7.5" r="2.4"/><circle cx="16.5" cy="16.5" r="2.4"/>',
    plane: '<path d="m10.5 13.5-7-2 1.5-1.5 6 .5 5-5.5a1.6 1.6 0 0 1 2.5 2l-5.5 5 .5 6-1.5 1.5-2-7Z"/>',
    bus: '<rect x="4.5" y="4" width="15" height="13.5" rx="2.5"/><path d="M4.5 11h15M8 21v-3.5M16 21v-3.5"/><circle cx="8.5" cy="14.5" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="14.5" r="1" fill="currentColor" stroke="none"/>',
    ship: '<path d="M4 13.5 5 9h14l1 4.5"/><path d="M3 13.5c1.5 4 3.5 6 4.5 6s2-1 4.5-1 3.5 1 4.5 1 3-2 4.5-6"/><path d="M12 9V5.5M8.5 5.5h7"/>',
    tax: '<path d="M5 21V4l7-1.5V21M12 8h6.5v13M5 21h14"/><path d="M7.5 8h1M7.5 12h1M7.5 16h1"/>',
    gov: '<path d="M12 3 3 7.5V10h18V7.5Z"/><path d="M5 10v7M9.5 10v7M14.5 10v7M19 10v7M3 20.5h18M3 17.5h18"/>',
    coin: '<circle cx="12" cy="12" r="8.5"/><path d="M9.5 8.5h4a1.8 1.8 0 0 1 0 3.6h-3a1.8 1.8 0 0 0 0 3.6h4M12 6.8v1.7M12 15.7v1.7"/>',
    utility: '<path d="m13 3-8 10h6l-1 8 8-10h-6Z"/>',
    drop: '<path d="M12 3.5S6 10 6 14.5a6 6 0 0 0 12 0C18 10 12 3.5 12 3.5Z"/>',
    splash: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/><circle cx="12" cy="12" r="3"/>',
    lockOpen: '<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 6.9-.9"/>',
    sms: '<path d="M4 5.5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    bellOff: '<path d="M6 9.5a6 6 0 0 1 9.3-5M18 12.7c.4 1.6 2 2.8 2 2.8H8M4 4l16 16"/><path d="M10 19.5a2.2 2.2 0 0 0 4 0"/>',
    refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4h-4"/>',
    bookmark: '<path d="M6.5 4h11v17l-5.5-4-5.5 4Z"/>',
    scale: '<path d="M12 4v16M6 8h12"/><path d="M6 8 3.5 14a2.8 2.8 0 0 0 5 0ZM18 8l-2.5 6a2.8 2.8 0 0 0 5 0Z"/>',
    building: '<path d="M4 21V5l8-2v18M12 21h8V9l-8-2"/><path d="M7 8h2M7 12h2M7 16h2M15 12h2M15 16h2"/>'
  };

  const CACHE = {};
  CBE.icon = function (name, size, cls) {
    const key = name + '|' + (size || 24) + '|' + (cls || '');
    if (CACHE[key]) return CACHE[key];
    const body = S[name] || S.info;
    const s = size || 24;
    const html = '<svg class="ic ' + (cls || '') + '" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
    CACHE[key] = html;
    return html;
  };
})();
