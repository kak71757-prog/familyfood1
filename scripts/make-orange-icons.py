"""
Generate the simple orange PWA icons (literal spec, 2026-10-23):
solid #ff6600 background, white family+bowl glyph from the approved artwork,
glyph kept inside the 80% maskable safe zone. Outputs:
public/icon-192.png, public/icon-512.png, public/apple-touch-icon.png (180)
"""
from PIL import Image

SRC = "/home/user/uploads/image-1.png"
BG = (255, 102, 0)  # #ff6600

im = Image.open(SRC).convert("RGB")
w, h = im.size
s = min(w, h)
im = im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))
px = im.load()

# glyph = bright (white) pixels of the artwork; alpha ramp for anti-aliasing
glyph = Image.new("RGBA", (s, s), (0, 0, 0, 0))
gp = glyph.load()
minx, miny, maxx, maxy = s, s, -1, -1
for y in range(s):
    for x in range(s):
        r, g, b = px[x, y]
        lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
        a = int(max(0.0, min(1.0, (lum - 60.0) / 180.0)) * 255)
        if a > 0:
            gp[x, y] = (255, 255, 255, a)
            if a > 128:
                minx = min(minx, x); maxx = max(maxx, x)
                miny = min(miny, y); maxy = max(maxy, y)
gw, gh = maxx - minx + 1, maxy - miny + 1
glyph = glyph.crop((minx, miny, maxx + 1, maxy + 1))
print("glyph bbox", (minx, miny, maxx, maxy))

def make(n, path):
    side = int(round(n * 0.70))  # glyph spans 70% -> inside 80% safe zone
    g = glyph.resize((side, side), Image.LANCZOS)
    canvas = Image.new("RGB", (n, n), BG)
    canvas.paste(g, ((n - side) // 2, (n - side) // 2), g)
    canvas.save(path, "PNG", optimize=True)
    chk = canvas.load()
    assert chk[0, 0] == BG and chk[n - 1, n - 1] == BG
    print("wrote", path, canvas.size)

make(512, "/home/user/saas/public/icon-512.png")
make(192, "/home/user/saas/public/icon-192.png")
make(180, "/home/user/saas/public/apple-touch-icon.png")
print("OK")
