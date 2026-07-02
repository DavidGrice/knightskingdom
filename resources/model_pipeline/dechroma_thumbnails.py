#!/usr/bin/env python3
"""
dechroma_thumbnails.py -- remove the solid green chroma-key background from
the MainGame warehouse bucket's PNG thumbnails (extracted/pak/warehouse/
main_interface/, refreshed into the bucket by refresh_warehouse_thumbnails.mjs),
converting the green to transparency so only the model/character shows.

Usage: python3 resources/model_pipeline/dechroma_thumbnails.py [--dry-run]
"""
import sys
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
BUCKET = ROOT / "src/Components/MainMenuStack/StartStack/MainGameStack/MainGame/ComponentTop/Bucket/BucketBottom/BucketBottomResourceStack"


def dechroma(im):
    """Key out only the pure (0,255,0) chroma-key background -- tight
    tolerance so legitimately-green model parts (e.g. tree foliage, which
    sits around (10,136,32), well short of this threshold) survive."""
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    changed = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r < 30 and g > 230 and b < 30:
                px[x, y] = (r, g, b, 0)
                changed += 1
    return im, changed


def main():
    dry_run = "--dry-run" in sys.argv
    pngs = sorted(BUCKET.glob("**/*.png"))
    total = 0
    for p in pngs:
        if p.name in ("wh_selection.png", "down_arrow_2.png", "down_arrow_6.png",
                      "up_arrow_2.png", "up_arrow_6.png"):
            continue
        im = Image.open(p)
        result, changed = dechroma(im)
        if changed == 0:
            continue
        total += 1
        if not dry_run:
            result.save(p)
        print(f"  {p.relative_to(ROOT)}: {changed} px keyed out")
    print(f"\n{'Would update' if dry_run else 'Updated'} {total} thumbnails")


if __name__ == "__main__":
    main()
