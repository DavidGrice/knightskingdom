#!/usr/bin/env python3
"""
ldraw_bridge.py -- convert LEGO Creator: Knights' Kingdom .lca models to
LDraw MPD documents (BrickLink Studio / LeoCAD / LDView compatible).

Two tiers, full coverage:
  1. Shapes named 'L<part><ss> ...' (the game's own convention; the last
     two digits are a variant/revision suffix, e.g. L306800 = part 3068 =
     Tile 2x2, L449500 = part 4495 = flag) become type-1 references to the
     official part file '<part>.dat', coloured by the dominant facet
     colour mapped to the nearest classic LDraw colour code.
  2. Everything else -- unnamed scenery, minifig pieces, terrain -- is
     embedded as an MPD subfile carrying the real facet geometry as
     type-3/4 lines with LDraw *direct colours* (0x2RRGGBB), so no part
     library lookup is needed and per-facet palette colours survive
     exactly.  --embed-all forces tier 2 for L-parts too (guaranteed
     geometry when a part number or its origin convention is in doubt).

Coordinates: KK content is +Y-up in VRT; LDraw is -Y-up: (x, -y, z) / 400
(1 LDU = 0.4 mm = 400 WLD units; verified via L306800 = Tile 2x2 = 16 mm
= 40 LDU).  Files are emitted 0 BFC NOCERTIFY, so winding is renderer-safe.

Official-part origin assumption (tier 1 only): LDraw part origins sit at
the top-centre of the part footprint; VRT boxes are corner-origined, so
the reference point is the local (sx/2, 0, sz/2).  If a placed official
part looks offset in Studio, use --embed-all (geometry is always right)
and report the part number.

Usage:
  python3 ldraw_bridge.py <outdir> [--embed-all] [--selfcheck] <files.lca...>
    --selfcheck also converts each MPD's embedded geometry back to an OBJ
    (<name>.check.obj) for offline visual verification with render_obj.py.
"""
import math
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lca_parser import parse_lca, facet_to_loop
from export_obj import (build_tree, mat_identity, mat_mul, mat_vec,
                        rot_from_brees, resolve_points_scaled)
from export_template import parse_template

E_INVISIBLE = 0xC0000000
LDU = 1.0 / 400.0                    # WLD units -> LDU
L_NAME = re.compile(r'^L\s*(\d{4,8})\b')

# classic LDraw colour table (code -> sRGB) for official-part colouring
LDRAW_COLORS = {
    0: (5, 19, 29), 15: (255, 255, 255), 4: (201, 26, 9),
    1: (0, 85, 191), 2: (35, 120, 65), 14: (242, 205, 55),
    25: (254, 138, 24), 6: (88, 57, 39), 70: (88, 42, 18),
    19: (228, 205, 158), 28: (149, 138, 115), 7: (155, 161, 157),
    71: (160, 165, 169), 8: (109, 110, 92), 72: (108, 110, 104),
    27: (187, 233, 11), 10: (75, 159, 74), 288: (0, 69, 26),
    320: (114, 14, 15), 9: (180, 210, 227), 73: (90, 147, 219),
    22: (129, 0, 123), 5: (200, 112, 160), 26: (146, 57, 120),
    3: (0, 143, 155), 11: (85, 165, 175), 47: (252, 252, 252),
}


def nearest_ldraw(rgb):
    r, g, b = rgb
    return min(LDRAW_COLORS,
               key=lambda c: (LDRAW_COLORS[c][0] - r) ** 2 +
                             (LDRAW_COLORS[c][1] - g) ** 2 +
                             (LDRAW_COLORS[c][2] - b) ** 2)


def direct_color(rgb):
    return '0x2%02X%02X%02X' % tuple(rgb)


def ld_pos(v):
    """VRT world -> LDraw position.  KK content is +Y-up; LDraw is -Y-up,
    so Y is negated (single mirror; files are BFC NOCERTIFY)."""
    return (v[0] * LDU, -v[1] * LDU, v[2] * LDU)


def ld_rot(M):
    """Conjugate a VRT rotation by the Y mirror: S M S, S=diag(1,-1,1)."""
    S = [[1, 0, 0], [0, -1, 0], [0, 0, 1]]
    return mat_mul(S, mat_mul(M, S))


def fmt(x):
    s = ('%.4f' % x).rstrip('0').rstrip('.')
    return s if s not in ('-0', '') else '0'


def facet_colour(shape, ob, num, pal):
    ocols = ob['chunks'].get('colours')
    scols = shape.get('colours') or []
    ci = None
    if ocols and 1 <= num <= len(ocols):
        ci = ocols[num - 1]
    elif scols and 1 <= num <= len(scols):
        ci = scols[num - 1]
    if ci is None:
        ci = 7
    return tuple(pal[ci]) if ci < len(pal) else (200, 200, 200)


def shape_geometry(shapes, typ, size):
    idx = typ + 1
    shape = shapes[idx]
    lines = shape.get('lines')
    fallback = None
    if 'points' not in shape or lines is None:
        for prev in reversed(shapes[:idx]):
            if fallback is None and prev.get('points'):
                fallback = resolve_points_scaled(prev, size, None)
            if lines is None and prev.get('lines'):
                lines = prev['lines']
            if fallback is not None and lines is not None:
                break
    lines = lines or []
    pts = resolve_points_scaled(shape, size, fallback)
    return shape, pts, lines


def convert(lca_path, outdir, embed_all=False, selfcheck=False):
    r = parse_template(lca_path)          # applies flat-plane rules for User
    name = os.path.splitext(os.path.basename(lca_path))[0]
    shp = r['shp']
    shapes = shp['shapes']
    pal = r.get('pal') or [[200, 200, 200]] * 256
    shape_names = {s['number']: s['name'] for s in shp['symbols']
                   if s.get('name')}
    objects = r['wld']['objects'] if 'wld' in r else []
    obj_names = {}
    for s in r['wld']['symbols'] if 'wld' in r else []:
        if s.get('type') == 0 and s.get('name'):
            obj_names.setdefault(s['number'], s['name'])
    build_tree(objects)
    if r['header'].get('category') != 'User':
        for ob in objects:                 # classic ground-plane rule
            xs, ys, zs = ob['size']
            if ys <= 10 and (xs >= 20000 or zs >= 20000):
                ob['oflags'] |= 0x80000000

    main = ['0 FILE %s.ldr' % name,
            '0 %s (LEGO Creator: Knights\' Kingdom)' % name,
            '0 Name: %s.ldr' % name,
            '0 BFC NOCERTIFY']
    subfiles = {}                          # key -> (fname, lines)
    stats = {'official': 0, 'embedded': 0, 'placed': 0, 'skipped': 0}
    check_tris = []                        # (world tri, rgb) for selfcheck

    def subfile_for(typ, ob):
        key = (typ, tuple(ob['size']))
        if key in subfiles:
            return subfiles[key][0]
        shape, pts, lines = shape_geometry(shapes, typ, ob['size'])
        body = []
        for f in shape.get('facets', []):
            loop = facet_to_loop(f, lines)
            if loop is None or len(loop) < 3:
                continue
            rgb = facet_colour(shape, ob, f['number'], pal)
            col = direct_color(rgb)
            vv = [ld_pos(pts[i]) for i in loop]
            if len(vv) == 3:
                body.append('3 %s %s' % (col, ' '.join(
                    fmt(c) for v in vv for c in v)))
            elif len(vv) == 4:
                body.append('4 %s %s' % (col, ' '.join(
                    fmt(c) for v in vv for c in v)))
            else:                          # n-gon: fan triangulation
                for i in range(1, len(vv) - 1):
                    tri = (vv[0], vv[i], vv[i + 1])
                    body.append('3 %s %s' % (col, ' '.join(
                        fmt(c) for v in tri for c in v)))
        if not body:
            return None
        fname = 'shape%04d_%d.ldr' % (typ, len(subfiles))
        subfiles[key] = (fname, ['0 FILE %s' % fname,
                                 '0 BFC NOCERTIFY'] + body)
        return fname

    def dominant_colour(typ, ob):
        shape, _pts, _lines = shape_geometry(shapes, typ, ob['size'])
        from collections import Counter
        cc = Counter()
        for f in shape.get('facets', []):
            cc[facet_colour(shape, ob, f['number'], pal)] += 1
        return cc.most_common(1)[0][0] if cc else (200, 200, 200)

    def emit(ob, pM, pT):
        if ob['oflags'] & E_INVISIBLE:
            stats['skipped'] += 1
            return
        rot = ob.get('rot')
        if rot and any(rot['brees']):
            R = rot_from_brees(rot['brees'])
            c = rot['center']
        else:
            R, c = mat_identity(), [0, 0, 0]
        base = [ob['pos'][i] + c[i] - mat_vec(R, c)[i] for i in range(3)]
        M = mat_mul(pM, R)
        T = [pT[i] + mat_vec(pM, base)[i] for i in range(3)]
        typ = ob['type']
        if typ != 0xFFFF and typ + 1 < len(shapes) and shapes[typ + 1]:
            nm = obj_names.get(ob['number']) or shape_names.get(typ) or ''
            m = L_NAME.match(nm.strip())
            Mld = ld_rot(M)
            rot9 = ' '.join(fmt(Mld[i][j]) for i in range(3)
                            for j in range(3))
            if m and not embed_all and len(m.group(1)) > 2:
                part = m.group(1)[:-2]
                sx, _sy, sz = ob['size']
                p0 = [sx / 2.0, 0.0, sz / 2.0]     # top-centre origin
                w = [T[i] + mat_vec(M, p0)[i] for i in range(3)]
                pos = ld_pos(w)
                col = nearest_ldraw(dominant_colour(typ, ob))
                main.append('1 %d %s %s %s %s %s.dat' %
                            (col, fmt(pos[0]), fmt(pos[1]), fmt(pos[2]),
                             rot9, part))
                stats['official'] += 1
            else:
                fname = subfile_for(typ, ob)
                if fname:
                    pos = ld_pos(T)
                    main.append('1 16 %s %s %s %s %s' %
                                (fmt(pos[0]), fmt(pos[1]), fmt(pos[2]),
                                 rot9, fname))
                    stats['embedded'] += 1
                    if selfcheck:
                        shape, pts, lines = shape_geometry(
                            shapes, typ, ob['size'])
                        for f in shape.get('facets', []):
                            loop = facet_to_loop(f, lines)
                            if loop is None or len(loop) < 3:
                                continue
                            rgb = facet_colour(shape, ob, f['number'], pal)
                            wv = [[mat_vec(M, pts[i])[k] + T[k]
                                   for k in range(3)] for i in loop]
                            for i in range(1, len(wv) - 1):
                                check_tris.append(
                                    ((wv[0], wv[i], wv[i + 1]), rgb))
            stats['placed'] += 1
        for ch in ob['children']:
            emit(ch, M, T)

    if objects:
        root = dict(objects[0], pos=[0, 0, 0])
        root['children'] = objects[0]['children']
        emit(root, mat_identity(), [0.0, 0.0, 0.0])

    os.makedirs(outdir, exist_ok=True)
    mpd = os.path.join(outdir, name + '.mpd')
    with open(mpd, 'w') as fh:
        fh.write('\n'.join(main) + '\n')
        for fname, lines in subfiles.values():
            fh.write('\n' + '\n'.join(lines) + '\n')

    if selfcheck and check_tris:
        obj_p = os.path.join(outdir, name + '.check.obj')
        mtl_p = obj_p[:-4] + '.mtl'
        cols = {}
        with open(obj_p, 'w') as fh:
            fh.write('mtllib %s\n' % os.path.basename(mtl_p))
            vi = 1
            for tri, rgb in check_tris:
                mat = 'c%02X%02X%02X' % rgb
                cols[mat] = rgb
                fh.write('usemtl %s\n' % mat)
                for v in tri:
                    fh.write('v %.5f %.5f %.5f\n' %
                             (v[0] * 0.001, -v[1] * 0.001, v[2] * 0.001))
                fh.write('f %d %d %d\n' % (vi, vi + 1, vi + 2))
                vi += 3
        with open(mtl_p, 'w') as fh:
            for mat, rgb in cols.items():
                fh.write('newmtl %s\nKd %.4f %.4f %.4f\n\n' %
                         (mat, rgb[0] / 255.0, rgb[1] / 255.0,
                          rgb[2] / 255.0))
    stats['subfiles'] = len(subfiles)
    return mpd, stats


def main():
    args = sys.argv[1:]
    embed_all = '--embed-all' in args
    selfcheck = '--selfcheck' in args
    args = [a for a in args if not a.startswith('--')]
    outdir = args[0]
    for path in args[1:]:
        mpd, st = convert(path, outdir, embed_all, selfcheck)
        print(mpd, st)


if __name__ == '__main__':
    main()
