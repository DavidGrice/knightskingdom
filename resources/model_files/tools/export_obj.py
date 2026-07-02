#!/usr/bin/env python3
"""
Export LEGO Creator .lca files to Wavefront OBJ/MTL.

Conventions:
- 100 VRT units = 1 mm (verified: L306800 = LEGO 3068 Tile 2x2 = 16x3.2x16mm).
  OBJ is written in millimetres.
- VRT is Y-down / left-handed; OBJ output flips Y (and Z position sign stays)
  and reverses facet winding so normals stay outward in a Y-up space.
- Relative points are resolved against the *object instance* size (objects
  can rescale shapes).
- Facet colour = object CT_COLOURS override (by facet Number-1), else the
  shape's COLOURS chunk; palette index -> material 'palNNN'.
- Facets with fewer than 3 lines (points/edges/wireframe shapes) are skipped
  for faces; 2-line facets are optionally emitted as OBJ 'l' lines.
"""
import math
import os
import sys

from lca_parser import (parse_lca, facet_to_loop, PNT_GEOM, PNT_ABS)


def mat_identity():
    return [[1.0, 0, 0], [0, 1.0, 0], [0, 0, 1.0]]


def mat_mul(a, b):
    return [[sum(a[i][k] * b[k][j] for k in range(3)) for j in range(3)]
            for i in range(3)]


def mat_vec(m, v):
    return [m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
            m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
            m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]]


def rot_from_brees(brees):
    """VRT rotation matrix, Y (bearing) then X (pitch) then Z (roll)."""
    rx, ry, rz = [b * 2.0 * math.pi / 65536.0 for b in brees]
    cx, sx = math.cos(rx), math.sin(rx)
    cy, sy = math.cos(ry), math.sin(ry)
    cz, sz = math.cos(rz), math.sin(rz)
    RX = [[1, 0, 0], [0, cx, -sx], [0, sx, cx]]
    RY = [[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]]
    RZ = [[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]]
    return mat_mul(RY, mat_mul(RX, RZ))


def resolve_points_scaled(shape, size, fallback_points):
    """Resolve shape points for cel 0 against an instance size (VRT units)."""
    sx, sy, sz = size
    cube = [[(sx if i & 4 else 0.0), (sy if i & 2 else 0.0),
             (sz if i & 1 else 0.0)] for i in range(8)]
    if 'points' not in shape:
        if fallback_points is not None:
            return fallback_points
        return cube
    out = list(cube)
    for pt in shape['points']:
        pos = pt['pos'][0]
        if pt['type'] == PNT_GEOM:
            p1, p2 = out[pos['p1']], out[pos['p2']]
            fr = pos['mult'] / float(1 << pos['shift'])
            out.append([p1[i] + (p2[i] - p1[i]) * fr for i in range(3)])
        elif pt['type'] == PNT_ABS:
            out.append([float(v) for v in pos])
        else:                                    # REL (and UAB treated alike)
            out.append([sx * pos[0] / 16384.0,
                        sy * pos[1] / 16384.0,
                        sz * pos[2] / 16384.0])
    return out


def build_tree(objects):
    """Return {offset: obj} plus children lists resolved from offsets."""
    by_off = {ob['offset']: ob for ob in objects}
    for ob in objects:
        ob['children'] = []
    for ob in objects:
        c = ob['child']
        if c:
            child = by_off.get(ob['offset'] + c)
            while child:
                ob['children'].append(child)
                s = child['sibling']
                child = by_off.get(child['offset'] + s) if s else None
    return by_off


E_OFINVISIBLE = 0x80000000
E_OFINVISDEF = 0x40000000


def export_obj(lca_path, out_dir, scale=0.001, emit_lines=True,
               skip_huge=150000, include_invisible=False):
    r = parse_lca(lca_path)
    name = os.path.splitext(os.path.basename(lca_path))[0]
    shp = r['shp']
    pal = r.get('pal') or [[200, 200, 200]] * 256
    shapes = shp['shapes']
    shape_names = {s['number']: s['name'] for s in shp['symbols']
                   if s.get('name')}

    objects = r['wld']['objects'] if 'wld' in r else []
    # object names from the WLD symbol table (type 0 = object symbols)
    obj_names = {}
    if 'wld' in r:
        for s in r['wld']['symbols']:
            if s.get('type') == 0 and s.get('name'):
                obj_names.setdefault(s['number'], s['name'])
    build_tree(objects)
    root = objects[0] if objects else None

    obj_lines = [f'# Converted from {os.path.basename(lca_path)}',
                 f'# LEGO Creator 2000 / Superscape VRT 5.10',
                 f'# category: {r["header"]["category"]}',
                 f'mtllib {name}.mtl', '']
    used_mats = set()
    vbase = 1
    stats = {'objects': 0, 'faces': 0, 'lines': 0, 'skipped': 0}

    def emit_object(ob, pM, pT):
        nonlocal vbase
        if not include_invisible and \
                ob['oflags'] & (E_OFINVISIBLE | E_OFINVISDEF):
            stats['invisible'] = stats.get('invisible', 0) + 1
            return                                # skip LOD/hidden subtree
        # object frame: O(v) = pM @ (pos + c + R@(v - c)) + pT
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
            shape = shapes[typ + 1]
            # ground/shadow planes: horizontally flat (YSize ~ 0) and
            # broad in X and Z.  Legit flat objects (flags, decals) are
            # flat in X or Z instead, so they are unaffected.
            xs_, ys_, zs_ = ob['size']
            ground = (skip_huge and ys_ <= 10
                      and (xs_ >= 20000 or zs_ >= 20000))
            if not ground:
                emit_shape(ob, shape, typ, M, T)
        for ch in ob['children']:
            emit_object(ch, M, T)

    def emit_shape(ob, shape, typ, M, T):
        nonlocal vbase
        # find lines/points fallback from earlier shapes (LOD sharing)
        lines = shape.get('lines')
        fallback_pts = None
        if 'points' not in shape or lines is None:
            idx = typ + 1
            for prev in reversed(shapes[:idx]):
                if fallback_pts is None and prev.get('points'):
                    fallback_pts = resolve_points_scaled(
                        prev, ob['size'], None)
                if lines is None and prev.get('lines'):
                    lines = prev['lines']
                if fallback_pts is not None and lines is not None:
                    break
        lines = lines or []
        pts = resolve_points_scaled(shape, ob['size'], fallback_pts)

        wname = obj_names.get(ob['number'])
        if wname:
            gname = f'{ob["number"]:03d}_{wname}'
        else:
            sname = shape_names.get(typ) or f'shape{typ}'
            gname = f'{ob["number"]:03d}_{sname}'
        gname = ''.join(c if c.isalnum() or c in '-.' else '_'
                        for c in gname).strip('_')
        obj_lines.append(f'o {gname}')
        # vertices: rotate+translate via frame, scale, flip Y
        for p in pts:
            w = mat_vec(M, p)
            wx = (w[0] + T[0]) * scale
            wy = -(w[1] + T[1]) * scale
            wz = (w[2] + T[2]) * scale
            obj_lines.append(f'v {wx:.5f} {wy:.5f} {wz:.5f}')

        ocols = ob['chunks'].get('colours')
        scols = shape.get('colours') or []

        cur_mat = None
        for f in shape.get('facets', []):
            loop = facet_to_loop(f, lines)
            if loop is None or len(loop) < 3:
                if emit_lines and f['lines'] and len(f['lines']) <= 2:
                    li, rev = f['lines'][0]
                    if li < len(lines):
                        a, b = lines[li]
                        obj_lines.append(f'l {vbase + a} {vbase + b}')
                        stats['lines'] += 1
                else:
                    stats['skipped'] += 1
                continue
            num = f['number']
            ci = None
            if ocols and 1 <= num <= len(ocols):
                ci = ocols[num - 1]
            elif scols and 1 <= num <= len(scols):
                ci = scols[num - 1]
            if ci is None:
                ci = 7
            mat = f'pal{ci:03d}'
            if mat != cur_mat:
                obj_lines.append(f'usemtl {mat}')
                used_mats.add(ci)
                cur_mat = mat
            # reverse winding for the Y flip
            idxs = [vbase + p for p in reversed(loop)]
            obj_lines.append('f ' + ' '.join(map(str, idxs)))
            stats['faces'] += 1
        vbase += len(pts)
        stats['objects'] += 1

    if root:
        rootpos = list(root['pos'])
        root = dict(root, pos=[0, 0, 0])
        emit_object(root, mat_identity(), [0.0, 0.0, 0.0])
    else:                                        # no world: dump shapes in a row
        x = 0.0
        for i, shape in enumerate(shapes):
            if not shape or not shape.get('facets'):
                continue
            fake = {'number': i, 'size': shape.get('size', [1000] * 3),
                    'chunks': {}, 'pos': [0, 0, 0], 'children': []}
            emit_shape(fake, shape, i - 1, mat_identity(), [x, 0.0, 0.0])
            x += shape.get('size', [1000] * 3)[0] * 1.2

    os.makedirs(out_dir, exist_ok=True)
    obj_path = os.path.join(out_dir, name + '.obj')
    with open(obj_path, 'w') as fh:
        fh.write('\n'.join(obj_lines) + '\n')

    with open(os.path.join(out_dir, name + '.mtl'), 'w') as fh:
        for ci in sorted(used_mats):
            rr, gg, bb = [c / 255.0 for c in pal[ci]]
            fh.write(f'newmtl pal{ci:03d}\n'
                     f'Kd {rr:.4f} {gg:.4f} {bb:.4f}\n'
                     f'Ka {rr * 0.3:.4f} {gg * 0.3:.4f} {bb * 0.3:.4f}\n'
                     f'Ks 0.06 0.06 0.06\nNs 24\nd 1.0\n\n')
    return obj_path, stats


if __name__ == '__main__':
    out = sys.argv[1]
    for path in sys.argv[2:]:
        p, st = export_obj(path, out)
        print(p, st)
