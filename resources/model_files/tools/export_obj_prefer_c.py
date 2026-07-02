#!/usr/bin/env python3
"""
Variant exporter: prefer 'NAME C' (alternate-state / close-up) objects over
their standard 'PART n' siblings.  See SESSION_HANDOFF.md §5.4 for the C
variant semantics.  Name-based: only works when the WLD symbol table names
the objects (most Brick files; NOT the unnamed portcullis-style assemblies).

Usage: python3 export_obj_prefer_c.py <outdir> <files.lca...>
Output files get the same base name; rename to *_hidetail.* (and patch the
mtllib line inside the .obj!) if delivering alongside the standard exports.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import export_obj as E
from lca_parser import parse_lca as _orig_parse

INV = 0xC0000000


def parse_prefer_c(path):
    r = _orig_parse(path)
    if 'wld' not in r:
        return r
    objs = r['wld']['objects']
    syms = {s['number']: s['name'] for s in r['wld']['symbols']
            if s.get('type') == 0 and s.get('name')}
    by_off = {ob['offset']: ob for ob in objs}
    kids = {}
    for ob in objs:
        c = ob['child']
        if c:
            ch = by_off.get(ob['offset'] + c)
            while ch:
                kids.setdefault(ob['number'], []).append(ch)
                s = ch['sibling']
                ch = by_off.get(ch['offset'] + s) if s else None
    for pn, chs in kids.items():
        cs = [ob for ob in chs if (syms.get(ob['number']) or '').endswith(' C')
              and ob['oflags'] & INV]
        flats = [ob for ob in chs
                 if ' PART ' in (syms.get(ob['number']) or '')
                 and not (syms.get(ob['number']) or '').rstrip()
                     .endswith(('D1', 'D2', 'D3'))
                 and not ob['oflags'] & INV]
        if len(cs) == 1 and len(flats) == 1:
            cs[0]['oflags'] &= ~INV            # show alternate-state C
            flats[0]['oflags'] |= 0x80000000   # hide standard part
    return r


E.parse_lca = parse_prefer_c

if __name__ == '__main__':
    out = sys.argv[1]
    for path in sys.argv[2:]:
        p, st = E.export_obj(path, out)
        print(p, st)
