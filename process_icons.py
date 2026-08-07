from PIL import Image
import numpy as np
import os

INPUT_DIR = r"D:\Projects\Meow\lemeow\extracted\Le Meow Icons"
OUTPUT_DIR = r"D:\Projects\Meow\lemeow\output_512"
TARGET = 512

os.makedirs(OUTPUT_DIR, exist_ok=True)

def content_bbox(img_rgba):
    """Tight bbox of drawn pixels: opaque AND not near-white."""
    data = np.array(img_rgba)
    alpha = data[:, :, 3]
    rgb   = data[:, :, :3]

    is_opaque    = alpha > 10
    is_not_white = np.any(rgb < 230, axis=2)
    mask = is_opaque & is_not_white

    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    if not rows.any():
        return None

    top    = int(np.argmax(rows))
    bottom = int(len(rows) - np.argmax(rows[::-1]))
    left   = int(np.argmax(cols))
    right  = int(len(cols) - np.argmax(cols[::-1]))
    return (left, top, right, bottom)

for filename in sorted(os.listdir(INPUT_DIR)):
    if not filename.lower().endswith(".png"):
        continue

    src = os.path.join(INPUT_DIR, filename)
    img = Image.open(src).convert("RGBA")

    bbox = content_bbox(img)
    if bbox is None:
        print(f"SKIP (no content): {filename}")
        continue

    img = img.crop(bbox)
    w, h = img.size

    # Contain: scale so both sides <= TARGET, maintain ratio, center on white canvas
    scale = min(TARGET / w, TARGET / h)
    new_w = round(w * scale)
    new_h = round(h * scale)
    img = img.resize((new_w, new_h), Image.LANCZOS)

    canvas = Image.new("RGBA", (TARGET, TARGET), (255, 255, 255, 255))
    paste_x = (TARGET - new_w) // 2
    paste_y = (TARGET - new_h) // 2
    canvas.paste(img, (paste_x, paste_y), img)
    img = canvas

    out_path = os.path.join(OUTPUT_DIR, filename)
    img.save(out_path, "PNG")
    print(f"OK  {filename}  content={w}x{h}  scaled={new_w}x{new_h}")

print("\nDone.")
