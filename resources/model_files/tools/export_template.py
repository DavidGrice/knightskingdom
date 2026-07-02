#!/usr/bin/env python3
"""
Template exporter: for LEGO Creator 2000 world templates (category 'User').

Differences from the standard model exporter:
- skip_huge disabled: root-parented flat planes are legitimate terrain
  (grass/water/sand mats hang directly off the world root).
- Flat planes (YSize <= 10, XSize or ZSize >= 20000) whose parent is NOT
  the world root are shadow/footprint helper planes belonging to placed
  model subtrees; they are hidden by setting the invisible flag before
  export (chained trios: plane -> B-spline path -> tint plane).

Usage: python3 export_template.py <outdir> <files.lca...>
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import export_obj as E
from lca_parser import parse_lca as _orig_parse

E_OFINVISIBLE = 0x80000000


def _flat(ob):
    xs, ys, zs = ob['size']
    return ys <= 10 and (xs >= 20000 or zs >= 20000)


def parse_template(path):
    r = _orig_parse(path)
    if 'wld' not in r:
        return r
    objs = r['wld']['objects']
    if not objs:
        return r
    root_num = objs[0]['number']
    by_off = {ob['offset']: ob for ob in objs}
    parent = {}
    for ob in objs:
        c = ob['child']
        if c:
            ch = by_off.get(ob['offset'] + c)
            while ch:
                parent[ch['number']] = ob['number']
                s = ch['sibling']
                ch = by_off.get(ch['offset'] + s) if s else None
    hidden = 0
    for ob in objs:
        if _flat(ob) and parent.get(ob['number']) != root_num:
            ob['oflags'] |= E_OFINVISIBLE
            hidden += 1
    r['template_flats_hidden'] = hidden
    return r


def export_template(path, outdir):
    saved = E.parse_lca
    E.parse_lca = parse_template
    try:
        return E.export_obj(path, outdir, skip_huge=0)
    finally:
        E.parse_lca = saved


if __name__ == '__main__':
    out = sys.argv[1]
    for p in sys.argv[2:]:
        pth, st = export_template(p, out)
        print(pth, st)
