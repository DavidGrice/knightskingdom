#!/usr/bin/env python3
"""
Decompress a Superscape .XVR/.SVR world and split its bound sub-files.

Format: 3-byte magic 'XVR' (or 'SVR') followed by a raw DEFLATE stream
(zlib wbits=-15).  The decompressed payload is a bound VRT file: a small
wrapper, then concatenated sub-files, each 'SuperScape (c)' preamble
(0x1A-terminated) + 4-byte magic (WRLD/SHAP/PALT/SPRT/...).

Usage: python3 xvr_extract.py file.xvr [outdir]
Writes <outdir>/<name>.vrt (full payload) plus one file per sub-file.
"""
import os
import re
import sys
import zlib

MAGICS = [b'WRLD', b'SHAP', b'PALT', b'SPRT', b'SND\x00', b'SCFG', b'FONT']


def main():
    path = sys.argv[1]
    outdir = sys.argv[2] if len(sys.argv) > 2 else '.'
    name = os.path.splitext(os.path.basename(path))[0]
    d = open(path, 'rb').read()
    if d[:3] not in (b'XVR', b'SVR'):
        raise SystemExit('not an XVR/SVR file')
    out = zlib.decompressobj(-15).decompress(d[3:])
    os.makedirs(outdir, exist_ok=True)
    vrt = os.path.join(outdir, name + '.vrt')
    open(vrt, 'wb').write(out)
    print(f'{vrt}: {len(out):,} bytes (from {len(d):,})')

    # locate sub-files by their preambles, use magic offsets as bounds
    pres = [m.start() for m in re.finditer(rb'SuperScape \(c\)', out)]
    for i, p in enumerate(pres):
        seg_end = pres[i + 1] if i + 1 < len(pres) else len(out)
        # descriptor line, e.g. 'World file CREATO~2.WLD revision 1395'
        desc = out[p:p + 160].split(b'\x0a\x0a\x0d')
        label = desc[1].split(b'\x0a')[0].decode('latin1') if len(desc) > 1 \
            else f'sub{i}'
        # find the first known magic after the preamble terminator
        term = out.index(0x1A, p)
        body_start = None
        for mg in MAGICS:
            j = out.find(mg, term, term + 0x200)
            if j != -1 and (body_start is None or j < body_start):
                body_start = j
        if body_start is None:
            body_start = term + 1
        # SPRT banks use offsets relative to the SUB-FILE START (preamble
        # included) -- keep the whole preamble for those
        if out[body_start:body_start+4] == b'SPRT' or \
                (body_start == term + 1 and b'SPRT' in out[term:term+0x200]):
            body_start = p
        ext = label.split()[-3].split('.')[-1].lower() \
            if 'revision' in label else f'sub{i}'
        dest = os.path.join(outdir, f'{name}.{ext}')
        open(dest, 'wb').write(out[body_start:seg_end])
        print(f'  {dest}: {seg_end - body_start:,} bytes  ({label})')


if __name__ == '__main__':
    main()
