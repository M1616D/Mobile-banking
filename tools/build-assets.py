#!/usr/bin/env python3
"""Copy the read-only ui/ reference assets into img/ with clean web-safe names.

ui/ is the design source of truth and is NEVER written to by this script.
Run from the project root:  python3 tools/build-assets.py
"""
import os
from PIL import Image

SRC = "ui"
LOGO_DIR = os.path.join(SRC, "logos")
OUT = "img"
BRANDS = os.path.join(OUT, "brands")

# ---------------------------------------------------------------- ui/logos ----
BRAND_MAP = {
    "AA TMA Traffic and parking payemt and penalty logo.png": "aatma.png",
    "AAWSA logo.png": "aawsa.png",
    "CBEBIRR logo.png": "cbebirr.png",
    "DARS logo.png": "dars.png",
    "ETHIOPIAN ELECTRIC UTILITY logo.png": "eeu.png",
    "KAAFI Mirofinance logo.png": "kaafi.png",
    "MOTRI logo.png": "motri.png",
    "RAYS Microsfinance logo.png": "rays.png",
    "WeBirr logo.png": "webirr.png",
    "abay bank log.png": "abay.png",
    "addis ababa land admin logo.png": "aaland.png",
    "addis ababa revenu logo.png": "aarev.png",
    "addis bank logo.png": "addis.png",
    "ahadu bank logo.png": "ahadu.png",
    "amhara bank logo.png": "amhara.png",
    "awash bank.png": "awash.png",
    "bank of abysninia logo.png": "abyssinia.png",
    "berehan bank logo.jpg": "berhan.png",
    "binget birr logo.jpg": "binget.png",
    "birrlink logo.png": "birrlink.png",
    "booking tecnologies logo.png": "booking.png",
    "british councile  logo.png": "british.png",
    "buna bank logo.png": "buna.png",
    "chapa logo.png": "chapa.png",
    "digital equb logo.png": "equb.png",
    "dire dewa revenue logo.png": "dirrev.png",
    "dstv logo.png": "dstv.png",
    "ebirr logo.png": "ebirr.png",
    "emyc payment logo.png": "emyc.png",
    "era overloding penalty logo.png": "era.png",
    "ethiopa travel service logo.png": "ethtravel.png",
    "ethiopan airline logo.png": "ethiopian.png",
    "ethiotelocom logo.png": "ethiotelecom.png",
    "facebook logo.png": "facebook.png",
    "fcsc logo.png": "fcsc.png",
    "federal houcing corporation logo.png": "fhc.png",
    "flomat logo.png": "flomart.png",
    "guzo go logo.png": "guzo.png",
    "haji and umrah logo.png": "haji.png",
    "lakipay logo.png": "lakipay.png",
    "linkidin logo.png": "linkedin.png",
    "m-pasa logo.png": "mpesa.png",
    "ministry of revenue logo.png": "mor.png",
    "moenco logo.png": "moenco.png",
    "nib internatinal bank logo.png": "nib.png",
    "sahaaypay logo.jpg": "sahaypay.png",
    "santim by pnr logo.png": "santim.png",
    "semu audio film proudaction logo.png": "semu.png",
    "seregela gebeya logo.png": "seregela.png",
    "somali revenue logo.png": "somrev.png",
    "starpay logo.png": "starpay.png",
    "telebirr logo.png": "telebirr.png",
    "telegram logo.png": "telegram.png",
    "tsehay bank logo.png": "tsehay.png",
    "twitter logo.png": "twitter.png",
    "vision Fund microfinace logo.png": "vision.png",
    "vite technologies logo.png": "vite.png",
    "websprix logo.png": "websprix.png",
    "yagoutpay logo.png": "yagout.png",
    "yaya wallet logo.png": "yaya.png",
    "youtube logo .png": "youtube.png",
    "zagol logo.png": "zagol.png",
    "zemen bank logo.jpg": "zemen.png",
}

# single assets (not brand tiles)
SINGLE_MAP = {
    "logos/logo  trnasparent.png": "cbe-logo.png",
    "logos/logo white background.jpg": "cbe-logo-light.png",
    "logos/app icon/CBE Mobile Banking app icon.jpg": "appicon.jpg",
    "logos/app icon/app icon must to look like this.jpg": "appicon-dark.jpg",
    "logos/app icon/when seeing with other app.jpg": "appicon-context.jpg",
    # the two uploaded fingerprint glyphs: light one for dark/purple grounds,
    # dark one for the white biometric sheets and the authenticating dialog
    "finger print icon/fingerprint.png": "fingerprint-light.png",
    "finger print icon/fingerprint 2.png": "fingerprint-dark.png",
    "recite/stump/big recite stamb.png": "stamp.png",
}

# the CBE Noor identity: the icon-only mark and the lock-up that carries the
# "ኑህ ኑር / CBE NOOR" wordmark.  Both keep their transparent background.
NOOR_MAP = {
    "cbe noor logo.png": "noor-icon.png",
    "cbe noor logo with text.png": "noor-logo.png",
}

# the world map behind the balance card; big, so it keeps a generous limit
BACKGROUND_MAP = {"home page/map.png": "map.png"}

# per-asset long-edge caps (the defaults are too generous for some sources)
LIMITS = {"stamp.png": 420, "map.png": 1024, "appicon-context.jpg": 512}

# ------------------------------------------------- installable app icons ----
# Square, white-background icons for the manifest + apple-touch-icon, built
# from the uploaded white-background CBE logo.  The "maskable" size keeps a
# larger safe margin so Android's mask never clips the mark.
ICON_SRC = "logos/logo  trnasparent.png"
ICON_SIZES = {
    "icon-192.png": (192, 0.78),
    "icon-512.png": (512, 0.78),
    "icon-maskable-512.png": (512, 0.62),
    "apple-touch-icon.png": (180, 0.78),
}


def trim(im):
    """Trim a fully transparent / uniform border so every logo is tight."""
    if im.mode in ("RGBA", "LA"):
        box = im.split()[-1].getbbox()
    else:
        rgb = im.convert("RGB")
        bg = rgb.getpixel((0, 0))
        from PIL import ImageChops

        diff = ImageChops.difference(rgb, Image.new("RGB", rgb.size, bg)).convert("L")
        box = diff.point(lambda p: 255 if p > 14 else 0).getbbox()
    return im.crop(box) if box else im


def save_png(src, dst, limit=512):
    im = Image.open(src)
    im = im.convert("RGBA") if im.mode in ("RGBA", "LA", "P") else im.convert("RGB")
    im = trim(im)
    if max(im.size) > limit:
        s = limit / max(im.size)
        im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
    im.save(dst, "PNG", optimize=True)


def build_icons():
    src = os.path.join(SRC, ICON_SRC)
    if not os.path.exists(src):
        print("  ! missing", src)
        return 0
    logo = trim(Image.open(src).convert("RGBA"))
    for out, (px, fill) in ICON_SIZES.items():
        canvas = Image.new("RGBA", (px, px), (255, 255, 255, 255))
        target = max(1, int(px * fill))
        s = target / max(logo.size)
        mark = logo.resize((max(1, int(logo.width * s)), max(1, int(logo.height * s))), Image.LANCZOS)
        canvas.alpha_composite(mark, ((px - mark.width) // 2, (px - mark.height) // 2))
        canvas.convert("RGB").save(os.path.join(OUT, out), "PNG", optimize=True)
    print("app icons written ->", ", ".join(ICON_SIZES))
    return len(ICON_SIZES)


def main():
    os.makedirs(BRANDS, exist_ok=True)
    n = 0
    for name, out in BRAND_MAP.items():
        src = os.path.join(LOGO_DIR, name)
        if not os.path.exists(src):
            print("  ! missing", src)
            continue
        save_png(src, os.path.join(BRANDS, out), limit=384)
        n += 1
    for name, out in NOOR_MAP.items():
        src = os.path.join(LOGO_DIR, name)
        if not os.path.exists(src):
            print("  ! missing", src)
            continue
        save_png(src, os.path.join(BRANDS, out), limit=768)
        n += 1
    for rel, out in SINGLE_MAP.items():
        src = os.path.join(SRC, rel)
        if not os.path.exists(src):
            print("  ! missing", src)
            continue
        cap = LIMITS.get(out, 768)
        if out.endswith(".jpg"):
            im = Image.open(src).convert("RGB")
            im.thumbnail((cap, cap), Image.LANCZOS)
            im.save(os.path.join(OUT, out), "JPEG", quality=88, optimize=True)
        else:
            save_png(src, os.path.join(OUT, out), limit=cap)
        n += 1
    # world-map watermark used behind the hero / balance cards
    for rel, out in BACKGROUND_MAP.items():
        src = os.path.join(SRC, rel)
        if not os.path.exists(src):
            print("  ! missing", src)
            continue
        save_png(src, os.path.join(OUT, out), limit=LIMITS.get(out, 1440))
        n += 1
    n += build_icons()
    print(f"assets written: {n}  -> {OUT}/")


if __name__ == "__main__":
    main()
