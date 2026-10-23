"""Generates PWA icons (192/512, any+maskable) — orange brand plate glyph."""
from PIL import Image, ImageDraw
for size in (192, 512):
    img = Image.new("RGB", (size, size), (249, 115, 22))  # orange-500
    d = ImageDraw.Draw(img)
    c = size // 2
    d.ellipse([c - int(size*.31), c - int(size*.31), c + int(size*.31), c + int(size*.31)], fill=(255, 255, 255))
    d.ellipse([c - int(size*.20), c - int(size*.20), c + int(size*.20), c + int(size*.20)], fill=(249, 115, 22))
    d.ellipse([c - int(size*.07), c - int(size*.07), c + int(size*.07), c + int(size*.07)], fill=(255, 255, 255))
    img.save(f"public/icon-{size}.png")
print("icons ok")
