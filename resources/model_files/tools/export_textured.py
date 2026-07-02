#!/usr/bin/env python3
"""
Textured exporter: .lca -> OBJ/MTL with real UVs and texture maps.

Texture architecture (reverse-engineered):
- Facet UVs live on WORLD OBJECTS as E_CTTEXCOORDS (0x20) chunks:
  T_TEXCOORDSPEC {u16 Facet, u16 NumPoints, s16 Texture, ITexture,
  TexScale, ITexScale, ScaleX, ScaleY, OffsetX, OffsetY,
  float uv[NumPoints*2]} -- Facet matches the facet's Number field.
- In shipped .lca files the Texture ref is a DIRECT index into the game's
  global 310-sprite bank (CREATO~2.SPR inside creator2000.xvr).
- In the master world an E_CTSPRTRANS (0x1C) per-object table translates
  local refs to global ones.
- Textures are 8-bit sprites, most with their own trailing 768-byte
  palette (Height flag 0x8000); pixels at entry offset (+4 if Width flag
  0x4000 hotspot); V axis is flipped vs OBJ convention.

Usage: python3 export_textured.py <outdir> <files.lca...>
Needs: texture PNGs pre-dumped by sprite_dump.py into <outdir>/textures/
       (or pass --textures <dir>).  Applies the template flat-plane rule.
"""
import collections
import os
import shutil
import struct
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import export_obj as E
import lca_parser as L
from export_template import parse_template

E_OFINVISIBLE = 0x80000000
E_OFINVISDEF = 0x40000000


def texspecs(wld):
    """Per-object-number texture specs and translate tables from raw WLD."""
    o, cur = 12, None
    specs = collections.defaultdict(list)
    trans = {}
    litcols = {}
    materials = {}
    while o + 4 <= len(wld):
        t = struct.unpack_from('<H', wld, o)[0]
        if t == 0xFFFF:
            o += 2
            if o + 2 <= len(wld) and \
                    struct.unpack_from('<H', wld, o)[0] == 0xFFFF:
                break
            continue
        ln = struct.unpack_from('<H', wld, o + 2)[0]
        if ln < 4 or o + ln > len(wld):
            break
        if t == 0x0000 and ln >= 0x44:
            cur = struct.unpack_from('<H', wld, o + 6)[0]
        elif t == 0x20 and cur is not None:                # TEXCOORDS
            nt = struct.unpack_from('<H', wld, o + 4)[0]
            p = o + 8
            for _ in range(nt):
                if p + 20 > o + ln:
                    break
                (fac, npt, tex, _it, tsc, _its, _sx, _sy, _ox, _oy) = \
                    struct.unpack_from('<HHhhhhhhhh', wld, p)
                if p + 20 + 8 * npt > o + ln:
                    break
                uv = struct.unpack_from('<%df' % (2 * npt), wld, p + 20)
                specs[cur].append(
                    {'facet': fac, 'tex': tex,
                     'uv': [(uv[2 * i], uv[2 * i + 1]) for i in range(npt)]})
                p += 20 + 8 * npt
        elif t == 0x1C and cur is not None:                # SPRTRANS
            n = struct.unpack_from('<H', wld, o + 4)[0]
            n = min(n, (ln - 6) // 2)
            trans[cur] = list(struct.unpack_from('<%dH' % n, wld, o + 6))
        elif t == 0x17 and cur is not None:                # LITCOLS
            litcols[cur] = list(wld[o + 4:o + ln])
        elif t == 0x23 and cur is not None:                # MATERIAL
            shin, _is, tr, _it = struct.unpack_from('<4B', wld, o + 4)
            fl, = struct.unpack_from('<I', wld, o + 8)
            materials[cur] = (shin, tr, fl)
        o += ln
    return specs, trans, litcols, materials


def export_textured(lca_path, out_dir, tex_dir=None, prefer_template=None):
    raw = open(lca_path, 'rb').read()
    _hdr, subs = L.split_container(raw)
    specs, trans, litcols, materials = texspecs(subs['WRLD']) \
        if 'WRLD' in subs else ({}, {}, {}, {})
    # LITCOLS index the game's GLOBAL runtime palette, not the .lca PALT
    gpal = None
    for cand in ([tex_dir] if tex_dir else []) + \
            [os.path.join(out_dir, 'textures'),
             os.path.join(out_dir, '..', 'xvr'),
             os.path.dirname(os.path.abspath(lca_path))]:
        p = os.path.join(cand, 'creator2000.pal')
        if os.path.exists(p):
            d = open(p, 'rb').read()
            gg = d.find(b'PALT')
            gpal = [tuple(d[gg + 16 + 3 * i:gg + 19 + 3 * i])
                    for i in range(256)]
            break

    if prefer_template is None:
        # world templates & challenges use category 'User' and need the
        # template flat-plane rule; regular models (Brick, Castle, ...)
        # use the classic parse with the standard ground-plane skip
        prefer_template = _hdr.get('category') == 'User'
    r = parse_template(lca_path) if prefer_template else L.parse_lca(lca_path)
    name = os.path.splitext(os.path.basename(lca_path))[0]
    shp = r['shp']
    pal = r.get('pal') or [[200, 200, 200]] * 256
    shapes = shp['shapes']
    shape_names = {s['number']: s['name'] for s in shp['symbols']
                   if s.get('name')}
    objects = r['wld']['objects'] if 'wld' in r else []
    obj_names = {}
    if 'wld' in r:
        for s in r['wld']['symbols']:
            if s.get('type') == 0 and s.get('name'):
                obj_names.setdefault(s['number'], s['name'])
    E.build_tree(objects)
    root = objects[0] if objects else None
    if not prefer_template:
        # classic model rule: hide huge flat ground/shadow planes
        for ob in objects:
            xs_, ys_, zs_ = ob['size']
            if ys_ <= 10 and (xs_ >= 20000 or zs_ >= 20000):
                ob['oflags'] |= E_OFINVISIBLE

    tex_dir = tex_dir or os.path.join(out_dir, 'textures')
    have_tex = {}
    if os.path.isdir(tex_dir):
        for f in os.listdir(tex_dir):
            if f.startswith('spr') and f.endswith('.png'):
                have_tex[int(f[3:6])] = f

    obj_lines = [f'# Converted from {os.path.basename(lca_path)} (textured)',
                 f'mtllib {name}.mtl', '']
    used_pal, used_tex, used_glit = set(), set(), set()
    vbase = 1
    vtbase = 1
    stats = {'objects': 0, 'faces': 0, 'tex_faces': 0, 'skipped': 0,
             'missing_tex': set()}

    def emit_object(ob, pM, pT, inh_mat=None):
        nonlocal vbase, vtbase
        if ob['oflags'] & (E_OFINVISIBLE | E_OFINVISDEF):
            return
        own = materials.get(ob['number'])
        eff = own if own is not None else inh_mat
        child_inh = own if (own and own[2] & 1) else inh_mat
        rot = ob.get('rot')
        if rot and any(rot['brees']):
            R = E.rot_from_brees(rot['brees'])
            c = rot['center']
        else:
            R, c = E.mat_identity(), [0, 0, 0]
        base = [ob['pos'][i] + c[i] - E.mat_vec(R, c)[i] for i in range(3)]
        M = E.mat_mul(pM, R)
        T = [pT[i] + E.mat_vec(pM, base)[i] for i in range(3)]
        typ = ob['type']
        if typ != 0xFFFF and typ + 1 < len(shapes) and shapes[typ + 1]:
            emit_shape(ob, shapes[typ + 1], typ, M, T, eff)
        for ch in ob['children']:
            emit_object(ch, M, T, child_inh)

    def emit_shape(ob, shape, typ, M, T, eff_mat=None):
        nonlocal vbase, vtbase
        shin, transp = (eff_mat[0], eff_mat[1]) if eff_mat else (0, 0)
        sfx = ''
        if shin or transp:
            sfx = f'_s{shin}t{transp}'
        lines = shape.get('lines')
        fallback_pts = None
        if 'points' not in shape or lines is None:
            idx = typ + 1
            for prev in reversed(shapes[:idx]):
                if fallback_pts is None and prev.get('points'):
                    fallback_pts = E.resolve_points_scaled(
                        prev, ob['size'], None)
                if lines is None and prev.get('lines'):
                    lines = prev['lines']
                if fallback_pts is not None and lines is not None:
                    break
        lines = lines or []
        pts = E.resolve_points_scaled(shape, ob['size'], fallback_pts)

        wname = obj_names.get(ob['number'])
        sname = shape_names.get(typ) or f'shape{typ}'
        gname = f'{ob["number"]:03d}_{wname or sname}'
        gname = ''.join(c if c.isalnum() or c in '-.' else '_'
                        for c in gname).strip('_')
        obj_lines.append(f'o {gname}')
        for p in pts:
            w = E.mat_vec(M, p)
            obj_lines.append(f'v {(w[0]+T[0])*0.001:.5f} '
                             f'{-(w[1]+T[1])*0.001:.5f} '
                             f'{(w[2]+T[2])*0.001:.5f}')

        myspecs = {s['facet']: s for s in specs.get(ob['number'], [])}
        mytrans = trans.get(ob['number'])
        mylit = litcols.get(ob['number'])
        ocols = ob['chunks'].get('colours')
        scols = shape.get('colours') or []
        cur_mat = None
        for f in shape.get('facets', []):
            loop = E.facet_to_loop(f, lines)
            if loop is None or len(loop) < 3:
                stats['skipped'] += 1
                continue
            num = f['number']
            spec = myspecs.get(num)
            gref = None
            if spec:
                gref = spec['tex']
                if mytrans:
                    gref = mytrans[gref] if 0 <= gref < len(mytrans) else None
                # refs are DIRECT global sprite indices (0 = untextured)
            if spec and gref is not None and gref in have_tex and len(spec['uv']) == len(loop):
                mat = f'tex{gref:03d}{sfx}'
                if mat != cur_mat:
                    obj_lines.append(f'usemtl {mat}')
                    used_tex.add((gref, shin, transp))
                    cur_mat = mat
                uvs = list(reversed(spec['uv']))
                vts = []
                for (tu, tv) in uvs:
                    # VRT tv is TOP-DOWN (D3D-style): OBJ vt v = 1 - tv.
                    # (Do not trust tree billboards for this: their
                    # textures are stored pre-flipped.)
                    obj_lines.append(f'vt {tu:.5f} {1.0 - tv:.5f}')
                    vts.append(vtbase)
                    vtbase += 1
                idxs = [vbase + p for p in reversed(loop)]
                obj_lines.append(
                    'f ' + ' '.join(f'{v}/{t}' for v, t in zip(idxs, vts)))
                stats['tex_faces'] += 1
            else:
                if spec and gref not in have_tex:
                    stats['missing_tex'].add(gref)
                ci = None
                mat = None
                if ocols and 1 <= num <= len(ocols):
                    ci = ocols[num - 1]
                elif gpal is not None and mylit and 1 <= num <= len(mylit):
                    gi = mylit[num - 1]        # global runtime palette
                    mat = f'glit{gi:03d}{sfx}'
                    used_glit.add((gi, shin, transp))
                elif scols and 1 <= num <= len(scols):
                    ci = scols[num - 1]
                if mat is None:
                    if ci is None:
                        ci = 7
                    mat = f'pal{ci:03d}{sfx}'
                    used_pal.add((ci, shin, transp))
                if mat != cur_mat:
                    obj_lines.append(f'usemtl {mat}')
                    cur_mat = mat
                idxs = [vbase + p for p in reversed(loop)]
                obj_lines.append('f ' + ' '.join(map(str, idxs)))
            stats['faces'] += 1
        vbase += len(pts)
        stats['objects'] += 1

    if root:
        root = dict(root, pos=[0, 0, 0])
        emit_object(root, E.mat_identity(), [0.0, 0.0, 0.0], None)

    os.makedirs(out_dir, exist_ok=True)
    obj_path = os.path.join(out_dir, name + '.obj')
    with open(obj_path, 'w') as fh:
        fh.write('\n'.join(obj_lines) + '\n')
    with open(os.path.join(out_dir, name + '.mtl'), 'w') as fh:
        def phys(shin, transp):
            ks = 0.06 + (shin / 255.0) * 0.85
            ns = 24 + shin * 4
            d = 1.0 - transp / 255.0
            return ks, ns, d

        def suffix(shin, transp):
            return f'_s{shin}t{transp}' if (shin or transp) else ''

        for ci, shin, transp in sorted(used_pal):
            rr, gg, bb = [c / 255.0 for c in pal[ci]]
            ks, ns, dd = phys(shin, transp)
            fh.write(f'newmtl pal{ci:03d}{suffix(shin,transp)}\n'
                     f'Kd {rr:.4f} {gg:.4f} {bb:.4f}\n'
                     f'Ks {ks:.3f} {ks:.3f} {ks:.3f}\nNs {ns}\n'
                     f'd {dd:.3f}\n\n')
        for gi, shin, transp in sorted(used_glit):
            rr, gg2, bb = [c / 255.0 for c in (gpal[gi] if gpal else (200,)*3)]
            ks, ns, dd = phys(shin, transp)
            fh.write(f'newmtl glit{gi:03d}{suffix(shin,transp)}\n'
                     f'Kd {rr:.4f} {gg2:.4f} {bb:.4f}\n'
                     f'Ks {ks:.3f} {ks:.3f} {ks:.3f}\nNs {ns}\n'
                     f'd {dd:.3f}\n\n')
        for tr, shin, transp in sorted(used_tex):
            ks, ns, dd = phys(shin, transp)
            fh.write(f'newmtl tex{tr:03d}{suffix(shin,transp)}\n'
                     f'Kd 1 1 1\nKs {ks:.3f} {ks:.3f} {ks:.3f}\nNs {ns}\n'
                     f'd {dd:.3f}\nmap_Kd textures/{have_tex[tr]}\n\n')
    stats['missing_tex'] = sorted(stats['missing_tex'])
    return obj_path, stats


if __name__ == '__main__':
    out = sys.argv[1]
    for p in sys.argv[2:]:
        pth, st = export_textured(p, out)
        print(pth, st)
