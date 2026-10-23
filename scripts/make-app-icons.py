"""
Generate the Family Food Agadir PWA icons from the single approved source
image (uploads/image-1.png). Rules:
  - crop to a perfect 1:1 square
  - flatten: solid #111111 background, zero transparency
  - scale artwork so the circle spans exactly 80% of the canvas
    (=> 20% total safe-zone padding, maskable-ready)
Outputs: public/icon-512x512.png, public/icon-192x192.png, public/apple-touch-icon.png
"""
from PIL import Image

SRC = "/home/user/uploads/image-1.png"
BG = (17, 17, 17)  # #111111

im = Image.open(SRC).convert("RGB")
w, h = im.size
s = min(w, h)
im = im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))

px = im.load()
# 1) repaint the near-black backdrop with the exact #111111 (keep the circle's
#    own fill + anti-aliased ring untouched)
for y in range(s):
    for x in range(s):
        r, g, b = px[x, y]
        if 0.2126 * r + 0.7152 * g + 0.0722 * b < 16:
            px[x, y] = BG

# 2) measure the circle (fill is lum ~23; recolored backdrop is 17, border
#    noise <= 12, so threshold 20 isolates circle + glyph exactly)
minx, miny, maxx, maxy = s, s, -1, -1
for y in range(0, s, 2):
    for x in range(0, s, 2):
        r, g, b = px[x, y]
        if 0.2126 * r + 0.7152 * g + 0.0722 * b >= 20:
            minx = min(minx, x); maxx = max(maxx, x)
            miny = min(miny, y); maxy = max(maxy, y)
d = max(maxx - minx, maxy - miny) + 1
cx, cy = (minx + maxx) / 2.0, (miny + maxy) / 2.0
print("circle bbox", (minx, miny, maxx, maxy), "diameter", d, "center", (cx, cy))

def make(n, path):
    f = 0.80 * n / d  # circle = 80% of canvas -> 10% padding per side
    side = int(round(s * f))
    scaled = im.resize((side, side), Image.LANCZOS)
    canvas = Image.new("RGB", (n, n), BG)
    ox = int(round(n / 2.0 - (cx / s) * side))
    oy = int(round(n / 2.0 - (cy / s) * side))
    canvas.paste(scaled, (ox, oy))
    canvas.save(path, "PNG", optimize=True)
    chk = canvas.load()
    assert canvas.mode == "RGB" and chk[0, 0] == BG and chk[n - 1, n - 1] == BG
    print("wrote", path, canvas.size, canvas.mode)

make(512, "/home/user/saas/public/icon-512x512.png")
make(192, "/home/user/saas/public/icon-192x192.png")
make(180, "/home/user/saas/public/apple-touch-icon.png")
print("OK")
