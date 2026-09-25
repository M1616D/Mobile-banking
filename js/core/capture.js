/* =========================================================================
   capture.js — turn a live DOM node into a PNG, with no library and no
   network.  The node is cloned, every computed style is frozen inline, each
   bitmap is swapped for a data URI and the clone is rasterised through an SVG
   <foreignObject>.  That reproduces the on-screen receipt pixel for pixel
   instead of redrawing an approximation.
   ========================================================================= */
(function (global) {
  "use strict";

  /* every declaration that can affect layout or paint inside a receipt */
  var PROPS = [
    "display", "position", "top", "right", "bottom", "left", "float", "clear",
    "box-sizing", "width", "height", "min-width", "min-height", "max-width", "max-height",
    "margin-top", "margin-right", "margin-bottom", "margin-left",
    "padding-top", "padding-right", "padding-bottom", "padding-left",
    "border-top-width", "border-right-width", "border-bottom-width", "border-left-width",
    "border-top-style", "border-right-style", "border-bottom-style", "border-left-style",
    "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
    "border-top-left-radius", "border-top-right-radius",
    "border-bottom-left-radius", "border-bottom-right-radius",
    "background-color", "background-image", "background-size", "background-position",
    "background-repeat", "background-origin", "background-clip",
    "box-shadow", "opacity", "visibility",
    "color", "font-family", "font-size", "font-weight", "font-style",
    "font-variant-numeric", "line-height", "letter-spacing", "word-spacing",
    "text-align", "text-transform", "text-indent", "text-shadow", "text-overflow",
    "text-decoration-line", "text-decoration-color", "white-space",
    "word-break", "overflow-wrap", "vertical-align", "direction",
    "flex-direction", "flex-wrap", "flex-grow", "flex-shrink", "flex-basis",
    "align-items", "align-self", "align-content", "justify-content",
    "gap", "row-gap", "column-gap", "order",
    "grid-template-columns", "grid-template-rows", "grid-auto-flow", "grid-column", "grid-row",
    "overflow", "overflow-x", "overflow-y",
    "object-fit", "object-position", "transform", "transform-origin", "z-index",
    "list-style-type", "aspect-ratio", "mix-blend-mode", "isolation"
  ];

  function copyStyle(srcEl, dstEl) {
    var cs = global.getComputedStyle(srcEl);
    var out = "";
    for (var i = 0; i < PROPS.length; i++) {
      var v = cs.getPropertyValue(PROPS[i]);
      if (v) out += PROPS[i] + ":" + v + ";";
    }
    dstEl.setAttribute("style", out);
  }

  /* local bitmaps -> data URI so the SVG image can be rasterised untainted */
  function toDataUrl(src) {
    if (!src || /^data:/.test(src)) return Promise.resolve(src);
    return fetch(src, { cache: "force-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.blob();
      })
      .then(function (blob) {
        return new Promise(function (resolve, reject) {
          var fr = new FileReader();
          fr.onload = function () { resolve(fr.result); };
          fr.onerror = reject;
          fr.readAsDataURL(blob);
        });
      })
      .catch(function () { return src; });
  }

  function loadImage(url) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = url;
    });
  }

  /**
   * Capture.png(node, opts) -> Promise<HTMLCanvasElement>
   *   opts.width/height  the captured viewport in CSS px (defaults to the node box)
   *   opts.scale         device pixel ratio of the output (default 2)
   *   opts.background    canvas fill behind the node (default white)
   *   opts.hide          selectors removed from the clone before painting
   */
  function png(node, opts) {
    opts = opts || {};
    return new Promise(function (resolve, reject) {
      try {
        var rect = node.getBoundingClientRect();
        var w = opts.width || Math.round(rect.width) || 360;
        var h = opts.height || Math.round(rect.height) || 800;
        var scale = opts.scale || 2;

        var clone = node.cloneNode(true);
        clone.classList.remove("screen--enter", "screen--pop", "screen--pop--done");
        clone.removeAttribute("id");
        clone.querySelectorAll("[id]").forEach(function (n) { n.removeAttribute("id"); });

        var srcAll = [node].concat(Array.prototype.slice.call(node.querySelectorAll("*")));
        var dstAll = [clone].concat(Array.prototype.slice.call(clone.querySelectorAll("*")));
        var imgPairs = [];
        for (var i = 0; i < srcAll.length; i++) {
          if (!dstAll[i]) continue;
          copyStyle(srcAll[i], dstAll[i]);
          /* pair bitmaps by position — replacing nodes must not shift the map */
          if (srcAll[i].tagName === "IMG") imgPairs.push([srcAll[i], dstAll[i]]);
        }

        /* a live <canvas> (the receipt QR) is swapped for its own bitmap */
        for (var c = 0; c < srcAll.length; c++) {
          if (srcAll[c].tagName === "CANVAS" && dstAll[c] && dstAll[c].tagName === "CANVAS") {
            var bitmap = document.createElement("img");
            try { bitmap.src = srcAll[c].toDataURL("image/png"); } catch (e) { continue; }
            bitmap.style.cssText = dstAll[c].getAttribute("style") || "";
            bitmap.style.display = "block";
            dstAll[c].parentNode.replaceChild(bitmap, dstAll[c]);
          }
        }

        /* panels the reference export leaves out (action row, Close button…) */
        (opts.hide || []).forEach(function (sel) {
          clone.querySelectorAll(sel).forEach(function (n) { n.parentNode.removeChild(n); });
        });

        clone.style.width = w + "px";
        clone.style.height = h + "px";
        clone.style.maxWidth = "none";
        clone.style.maxHeight = "none";
        clone.style.minHeight = "0";
        clone.style.overflow = "hidden";
        clone.style.margin = "0";
        clone.style.transform = "none";
        clone.style.position = "static";

        Promise.all(imgPairs.map(function (pair) {
          return toDataUrl(pair[0].currentSrc || pair[0].getAttribute("src"));
        }))
          .then(function (urls) {
            urls.forEach(function (u, idx) {
              if (imgPairs[idx] && imgPairs[idx][1] && u) imgPairs[idx][1].setAttribute("src", u);
            });

            var wrapper = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
            wrapper.setAttribute("style", "width:" + w + "px;height:" + h + "px;overflow:hidden;" +
              "background:" + (opts.background || "#ffffff") + ";");
            wrapper.appendChild(clone);

            var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '">' +
              '<foreignObject x="0" y="0" width="' + w + '" height="' + h + '">' +
              new XMLSerializer().serializeToString(wrapper) +
              "</foreignObject></svg>";

            var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
            return loadImage(url);
          })
          .then(function (img) {
            var canvas = document.createElement("canvas");
            canvas.width = Math.round(w * scale);
            canvas.height = Math.round(h * scale);
            var ctx = canvas.getContext("2d");
            ctx.fillStyle = opts.background || "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas);
          })
          .catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  /* download a canvas as a file, falling back to an <a download> */
  function saveCanvas(canvas, filename) {
    return new Promise(function (resolve, reject) {
      function fire(url, revoke) {
        var a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
          if (a.parentNode) a.parentNode.removeChild(a);
          if (revoke) URL.revokeObjectURL(url);
        }, 4000);
      }
      try {
        if (canvas.toBlob) {
          canvas.toBlob(function (blob) {
            if (!blob) { fire(canvas.toDataURL("image/png"), false); resolve(); return; }
            fire(URL.createObjectURL(blob), true);
            resolve();
          }, "image/png");
        } else {
          fire(canvas.toDataURL("image/png"), false);
          resolve();
        }
      } catch (e) { reject(e); }
    });
  }

  global.Capture = { png: png, saveCanvas: saveCanvas, toDataUrl: toDataUrl };
})(window);
