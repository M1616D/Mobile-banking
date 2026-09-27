/* =========================================================================
   receive.js — Receive Money (QR) and Scan QR
   ========================================================================= */
(function () {
  "use strict";

  function receiveView() {
    var amount = 0;
    var el = UI.h('<div class="screen receive">' +
      '<div class="receive__bg" aria-hidden="true"></div>' +
      UI.appbar({ title: "Receive Money", light: true }) +
      '<div class="body"><div class="sheet">' +
        '<div class="receive-wrap">' +
          '<div class="receive-card">' +
            '<div class="receive-card__brand">' +
              '<img src="img/cbe-logo.png" alt="">' +
              "<span><div class='receive-card__name'>Commercial Bank of Ethiopia</div>" +
              "<div class='receive-card__tag'>The bank you can always rely on!</div></span>" +
            "</div>" +
            '<div class="receive-card__acct">Account No: <b data-slot="acct"></b></div>' +
            '<div class="receive-card__kv">' +
              "<span><i>Amount</i><b data-slot='amount'>0.00</b></span>" +
              "<span style='text-align:right'><i>Reason</i><b>Mobile Banking</b></span>" +
            "</div>" +
            '<div style="display:grid;place-items:center;padding:16px 0 4px">' +
              '<div class="qr-frame"><div data-qr></div>' +
                '<span class="qr-frame__logo"><img src="img/cbe-logo.png" alt=""></span>' +
              "</div>" +
            "</div>" +
          "</div>" +
          '<div class="receive-actions">' +
            '<button data-act="share">' + Icon("share", 24) + "<span>Share QR</span></button>" +
            '<button data-act="link">' + Icon("link", 24) + "<span>Copy Link</span></button>" +
            '<button data-act="download">' + Icon("download", 24) + "<span>Download</span></button>" +
          "</div>" +
          '<button class="btn btn--block" data-act="add" style="margin-top:12px">ADD AMOUNT</button>' +
        "</div>" +
      "</div></div></div>");

    var s = Store.get();
    el.querySelector('[data-slot="acct"]').textContent = U.maskShort(s.accountNumber);

    var canvas = document.createElement("canvas");
    el.querySelector("[data-qr]").appendChild(canvas);

    function payload() {
      return "CBE|RECEIVE|" + s.accountNumber + "|" + (amount ? U.money(amount) : "0.00") + "|Mobile Banking";
    }
    function paintQr() { QR.draw(canvas, payload(), 200, "M", 2); }
    paintQr();

    el.addEventListener("click", function (e) {
      var act = e.target.closest("[data-act]");
      if (!act) return;
      var a = act.dataset.act;
      if (a === "add") {
        Flow.amountSheet(amount ? U.money(amount) : "", function (cents) {
          amount = cents;
          el.querySelector('[data-slot="amount"]').textContent = U.money(cents);
          paintQr();
          UI.toast("Amount added to your QR");
        });
        return;
      }
      if (a === "share") {
        if (navigator.share) navigator.share({ title: "CBE receive", text: payload() }).catch(function () { });
        else UI.toast("Share QR");
        return;
      }
      if (a === "link") {
        if (navigator.clipboard) navigator.clipboard.writeText(payload()).catch(function () { });
        UI.toast("Payment link copied");
        return;
      }
      if (a === "download") {
        var url = canvas.toDataURL("image/png");
        var link = document.createElement("a");
        link.href = url; link.download = "CBE-receive-" + s.accountNumber + ".png";
        document.body.appendChild(link); link.click();
        setTimeout(function () { document.body.removeChild(link); }, 60);
        UI.toast("QR downloaded");
      }
    });

    return { el: el };
  }

  function scanView() {
    var el = UI.h('<div class="screen">' +
      '<div class="scan">' +
        '<div class="scan__bar">' +
          '<button class="iconbtn" data-act="back" aria-label="Back">' + Icon("back", 22) + "</button>" +
          '<span class="scan__title">Scan QR</span>' +
        "</div>" +
        '<div class="scan__stage">' +
          '<div class="scan__hint">Place the QR Code within the frame</div>' +
          '<div class="scan__frame">' +
            '<span class="scan__corner scan__corner--tl"></span>' +
            '<span class="scan__corner scan__corner--tr"></span>' +
            '<span class="scan__corner scan__corner--bl"></span>' +
            '<span class="scan__corner scan__corner--br"></span>' +
            '<span class="scan__laser"></span>' +
          "</div>" +
        "</div>" +
        '<div class="scan__zoom">' + Icon("zoomOut", 18) +
          '<span class="scan__track"><span class="scan__knob" data-knob></span></span>' +
          Icon("zoomIn", 18) + "</div>" +
        '<div class="scan__modes">' +
          '<button class="scan__mode scan__mode--flash" data-act="flash">' +
            '<span class="scan__disc">' + Icon("flash", 22) + '</span>Flash on</button>' +
          '<button class="scan__mode" data-act="gallery">' +
            '<span class="scan__disc">' + Icon("image", 22) + "</span>Gallery</button>" +
        "</div>" +
      "</div>" +
      UI.bottomNav("home") +
    "</div>");

    var track = el.querySelector(".scan__track");
    var knob = el.querySelector("[data-knob]");
    var pos = 0.05;
    function paint() { knob.style.left = (pos * 100) + "%"; }
    paint();
    track.addEventListener("click", function (e) {
      var r = track.getBoundingClientRect();
      pos = U.clamp((e.clientX - r.left) / r.width, 0, 1);
      paint();
      UI.toast("Zoom " + Math.round(1 + pos * 3) + "×");
    });

    el.addEventListener("click", function (e) {
      var nav = e.target.closest("[data-nav]");
      if (nav) {
        var id = nav.dataset.nav;
        if (id === "home") Router.root("home");
        else if (id === "transactions") Router.root("transactions");
        else Router.root("settings");
        return;
      }
      var act = e.target.closest("[data-act]");
      if (!act) return;
      if (act.dataset.act === "flash") { act.classList.toggle("is-on"); UI.toast("Flash toggled"); return; }
      if (act.dataset.act === "gallery") { UI.toast("Pick a QR image from your gallery"); return; }
    });
    return { el: el };
  }

  Router.define("receive", receiveView);
  Router.define("scan", scanView);
})();
