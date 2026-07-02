#!/usr/bin/env python3
"""
Dump a Superscape SPRT image bank (e.g. CREATO~2.SPR from creator2000.xvr)
to PNG files.

Layout (verified on the LEGO Creator 2000 global bank, 310 sprites):
  preamble (0x1A-terminated) ... u32 body_len, 'SPRT', u16 0, u16 revision,
  u16 0, u16 fmt(0x0A05=5.10), u32 count, then count x 8-byte entries
  {u16 Width, u16 Height, u32 Offset}.  Offsets are relative to the byte
  after the preamble.  Flag bits (E_SPRMASK=0x3FFF gives real dims):
    Width  & 0x4000  -> 4-byte hotspot precedes pixel data
    Height & 0x8000  -> 768-byte RGB palette FOLLOWS the pixels
  Pixels are 8-bit indices; without an own palette the global PALT is used.

Usage: python3 sprite_dump.py <sprfile-or-vrt> <global_palt_file> <outdir>
   (accepts either a bare .spr body or a full decompressed .vrt --
    it locates the SPRT bank either way)
"""
import os
import struct
import sys

from PIL import Image


def load_palette(palt):
    d = open(palt, 'rb').read()
    g = d.find(b'PALT')
    if g == -1:
        raise SystemExit('no PALT magic in palette file')
    rgb = d[g + 16:g + 16 + 768]
    return [tuple(rgb[3 * i:3 * i + 3]) for i in range(256)]


def main():
    src, palt, outdir = sys.argv[1], sys.argv[2], sys.argv[3]
    d = open(src, 'rb').read()
    j = d.find(b'SPRT')
    if j == -1:
        raise SystemExit('no SPRT bank found')
    # offsets are relative to the sub-file start INCLUDING the preamble
    pre = d.rfind(b'SuperScape (c)', 0, j)
    body = d[pre:] if pre != -1 else d
    j = body.find(b'SPRT')
    rev = struct.unpack_from('<H', body, j + 6)[0]
    cnt = struct.unpack_from('<H', body, j + 12)[0]
    tbl = j + 14
    GLOBAL = load_palette(palt)
    os.makedirs(outdir, exist_ok=True)
    saved = 0
    for k in range(cnt):
        w, h, off = struct.unpack_from('<HHI', body, tbl + 8 * k)
        rw, rh = w & 0x3FFF, h & 0x3FFF
        if not (0 < rw <= 4096 and 0 < rh <= 4096):
            continue
        src_o = off + (4 if w & 0x4000 else 0)
        px = body[src_o:src_o + rw * rh]
        if len(px) < rw * rh:
            continue
        # 0x8000 = palette attached; 0x4000 = USE it for display.
        # Attached-but-unused palettes (0x8000 only) are authoring data;
        # those sprites' pixels index the GLOBAL palette.
        if (h & 0x4000) and (h & 0x8000):
            p = body[src_o + rw * rh:src_o + rw * rh + 768]
            pal = [tuple(p[3 * i:3 * i + 3]) for i in range(256)] \
                if len(p) == 768 else GLOBAL
        else:
            pal = GLOBAL
        img = Image.new('RGB', (rw, rh))
        img.putdata([pal[b] for b in px])
        img.save(os.path.join(outdir, f'spr{k:03d}_{rw}x{rh}.png'))
        saved += 1
    print(f'SPRT rev {rev}: dumped {saved} of {cnt} entries to {outdir}')


if __name__ == '__main__':
    main()
