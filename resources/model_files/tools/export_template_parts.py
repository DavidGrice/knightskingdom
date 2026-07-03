#!/usr/bin/env python3
"""
Export every unique shape a template actually places (as a real, non-terrain
object) as its own standalone OBJ/MTL pair -- instead of relying on the
merged, pre-rendered bake export_textured.py produces for the whole map.

Each template .lca already bundles the complete local geometry for
everything it places (that's what the merged bake reads); this just writes
each *unique* shape out on its own instead of merging it into one file, so
it can be loaded and positioned independently by the live engine (see
MapPlacementsLoader.jsx) via export_template_placements.py's placement data.

Terrain identification: NOT export_template.py's `_flat` heuristic (that
targets near-zero-height shadow/footprint helper planes and doesn't catch
this game's actual terrain, which has real height variation -- mountains
are bumpy, not flat). Instead, a placed object is terrain if its own
instance size is a large fraction of the whole map's overall extent
(TERRAIN_SIZE_FRACTION) -- terrain is necessarily map-scale, discrete props
never are, regardless of their own shape. See find_terrain_and_real_shapes.

Geometry/texture resolution mirrors export_textured.py's emit_shape, minus
the world-space M/T transform (a "part" is exported in its own local shape
space, like any standalone catalog model, ready to be positioned by the
placements pipeline) -- reuses resolve_points_scaled, facet_to_loop, and
texspecs verbatim; the material/texture-per-facet branching is duplicated
in miniature here (not extracted into a shared function, to avoid touching
export_textured.py's delicate, already-working closure that every
standalone model export also depends on).

A shape's REL points are only meaningful relative to *some* instance size
(a shape can be instanced at an arbitrary size per FORMAT_SPEC), so each
part is exported at its *representative* placed instance's own scale, and
parts_manifest.json records that reference size so other instances of the
same shape at a different size can be scaled proportionally at placement
time (see export_template_placements.py).

Usage: python3 export_template_parts.py <outdir> <tex_dir> <template.lca...>
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lca_parser import parse_lca, facet_to_loop, split_container
from export_obj import build_tree, resolve_points_scaled
from export_template import parse_template
from export_textured import texspecs

E_OFINVISIBLE = 0x80000000
E_OFINVISDEF = 0x40000000


# How large a placed object's own size has to be, relative to the whole
# map's overall extent, before it's treated as terrain rather than a
# discrete prop. A module constant so it's easy to tune against real
# templates -- see find_terrain_and_real_shapes' docstring for why.
TERRAIN_SIZE_FRACTION = 0.15


def find_terrain_and_real_shapes(objects):
    """Returns (terrain_shape_indices, real_shape_to_representative_object).

    export_template.py's `_is_flat` (ys<=10, i.e. a near-zero-height shadow/
    footprint helper plane) does NOT catch this game's actual ground/
    mountain terrain -- that geometry has real height variation (mountains
    are bumpy, not flat) and can be hundreds of mm tall. What genuinely
    distinguishes terrain from discrete props (trees, walls, castle bricks,
    even large vehicles) is *scale relative to the whole map*: terrain is
    necessarily a large fraction of the map's own overall extent, while any
    individually-placeable prop is not, regardless of its own shape. Uses
    each real object's own *placed instance* size (`ob['size']`), matching
    FORMAT_SPEC's noted convention that a small shape can be instanced at an
    arbitrary size (its literal example: a 20000-unit shape instanced at
    20,000,000 to make a 20m ground plate) -- so the instance size is what
    actually determines footprint, not the underlying shape's own geometry.
    """
    by_off = {ob['offset']: ob for ob in objects}
    parent = {}
    root_num = objects[0]['number'] if objects else None
    for ob in objects:
        c = ob['child']
        if c:
            ch = by_off.get(ob['offset'] + c)
            while ch:
                parent[ch['number']] = ob['number']
                s = ch['sibling']
                ch = by_off.get(ch['offset'] + s) if s else None

    real_candidates = [
        ob for ob in objects
        if not (ob['oflags'] & (E_OFINVISIBLE | E_OFINVISDEF)) and ob['type'] != 0xFFFF
    ]
    if not real_candidates:
        return set(), {}
    map_max_dimension = max(max(ob['size']) for ob in real_candidates)
    terrain_threshold = map_max_dimension * TERRAIN_SIZE_FRACTION

    terrain_shapes = set()
    real_shapes = {}  # shape_index -> representative object dict
    for ob in real_candidates:
        typ = ob['type']
        if max(ob['size']) >= terrain_threshold:
            terrain_shapes.add(typ)
            continue
        real_shapes.setdefault(typ, ob)
    return terrain_shapes, real_shapes


def resolve_shape_points(shapes, typ, instance_size):
    """Resolves shape geometry against `instance_size` -- the *representative
    placed object's* own size, not the shape's declared default -- matching
    export_textured.py's emit_shape exactly (`resolve_points_scaled(shape,
    ob['size'], fallback_pts)`). A shape's REL points are only meaningful
    relative to *some* instance size (FORMAT_SPEC: a shape can be instanced
    at an arbitrary size), so the exported part is at the representative
    instance's actual scale; other instances of the same shape at a
    different size get a per-instance scale factor computed by the
    placements script (instance_size / this reference size)."""
    idx = typ + 1
    if idx >= len(shapes) or not shapes[idx]:
        return None, None
    shape = shapes[idx]
    lines = shape.get('lines')
    fallback_pts = None
    if 'points' not in shape or lines is None:
        for prev in reversed(shapes[:idx]):
            if fallback_pts is None and prev.get('points'):
                fallback_pts = resolve_points_scaled(prev, instance_size, None)
            if lines is None and prev.get('lines'):
                lines = prev['lines']
            if fallback_pts is not None and lines is not None:
                break
    lines = lines or []
    pts = resolve_points_scaled(shape, instance_size, fallback_pts)
    return shape, (pts, lines)


def export_part(shape, pts, lines, ob, specs, trans, litcols, gpal, have_tex, pal, out_path, scale=0.001):
    """Mirrors export_textured.py's emit_shape material/texture branching,
    but in local shape-space (no world M/T transform) and writing its own
    standalone file rather than appending to a shared merged buffer."""
    my_specs = {s['facet']: s for s in specs.get(ob['number'], [])}
    my_trans = trans.get(ob['number'])
    my_lit = litcols.get(ob['number'])
    ocols = ob['chunks'].get('colours')
    scols = shape.get('colours') or []

    obj_lines = [f'mtllib {os.path.basename(out_path)}.mtl', 'o part']
    for p in pts:
        obj_lines.append(f'v {p[0]*scale:.5f} {-p[1]*scale:.5f} {p[2]*scale:.5f}')

    mats = {}  # name -> (kind, key)
    vt_counter = 0
    cur_mat = None
    face_count = 0
    for f in shape.get('facets', []):
        loop = facet_to_loop(f, lines)
        if loop is None or len(loop) < 3:
            continue
        num = f['number']
        spec = my_specs.get(num)
        gref = None
        if spec:
            gref = spec['tex']
            if my_trans:
                gref = my_trans[gref] if 0 <= gref < len(my_trans) else None
        if spec and gref is not None and gref in have_tex and len(spec['uv']) == len(loop):
            mat = f'tex{gref:03d}'
            mats[mat] = ('tex', gref)
            if mat != cur_mat:
                obj_lines.append(f'usemtl {mat}')
                cur_mat = mat
            uvs = list(reversed(spec['uv']))
            vts = []
            for (tu, tv) in uvs:
                obj_lines.append(f'vt {tu:.5f} {1.0 - tv:.5f}')
                vt_counter += 1
                vts.append(vt_counter)
            idxs = [p + 1 for p in reversed(loop)]
            obj_lines.append('f ' + ' '.join(f'{v}/{t}' for v, t in zip(idxs, vts)))
        else:
            ci = None
            mat = None
            if ocols and 1 <= num <= len(ocols):
                ci = ocols[num - 1]
            elif gpal is not None and my_lit and 1 <= num <= len(my_lit):
                gi = my_lit[num - 1]
                mat = f'glit{gi:03d}'
                mats[mat] = ('glit', gi)
            elif scols and 1 <= num <= len(scols):
                ci = scols[num - 1]
            if mat is None:
                if ci is None:
                    ci = 7
                mat = f'pal{ci:03d}'
                mats[mat] = ('pal', ci)
            if mat != cur_mat:
                obj_lines.append(f'usemtl {mat}')
                cur_mat = mat
            idxs = [p + 1 for p in reversed(loop)]
            obj_lines.append('f ' + ' '.join(map(str, idxs)))
        face_count += 1

    if face_count == 0:
        return None

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path + '.obj', 'w') as fh:
        fh.write('\n'.join(obj_lines) + '\n')

    with open(out_path + '.mtl', 'w') as fh:
        for mat, (kind, key) in sorted(mats.items()):
            if kind == 'pal':
                rr, gg, bb = [c / 255.0 for c in (pal[key] if pal and key < len(pal) else (200, 200, 200))]
                fh.write(f'newmtl {mat}\nKd {rr:.4f} {gg:.4f} {bb:.4f}\nKs 0.06 0.06 0.06\nNs 24\nd 1.0\n\n')
            elif kind == 'glit' and gpal:
                rr, gg, bb = [c / 255.0 for c in gpal[key]]
                fh.write(f'newmtl {mat}\nKd {rr:.4f} {gg:.4f} {bb:.4f}\nKs 0.06 0.06 0.06\nNs 24\nd 1.0\n\n')
            elif kind == 'tex' and key in have_tex:
                fh.write(f'newmtl {mat}\nKd 1 1 1\nKs 0.06 0.06 0.06\nNs 24\nd 1.0\n'
                         f'map_Kd textures/{have_tex[key]}\n\n')

    return {'faceCount': face_count, 'vertexCount': len(pts)}


def export_template_parts(lca_path, out_dir, tex_dir):
    r = parse_template(lca_path)
    if 'wld' not in r or 'shp' not in r:
        return {'exported': 0, 'terrainShapes': 0}
    objects = r['wld']['objects']
    shapes = r['shp']['shapes']
    pal = r.get('pal') or [[200, 200, 200]] * 256
    build_tree(objects)

    terrain_shapes, real_shapes = find_terrain_and_real_shapes(objects)

    raw = open(lca_path, 'rb').read()
    _hdr, subs = split_container(raw)
    specs, trans, litcols, _materials = (
        texspecs(subs['WRLD']) if 'WRLD' in subs else ({}, {}, {}, {}))

    gpal = None
    palsrc = os.path.join(tex_dir, 'creator2000.pal')
    if os.path.exists(palsrc):
        d = open(palsrc, 'rb').read()
        gg = d.find(b'PALT')
        if gg >= 0:
            gpal = [tuple(d[gg + 16 + 3 * i:gg + 19 + 3 * i]) for i in range(256)]

    have_tex = {}
    if os.path.isdir(tex_dir):
        for f in os.listdir(tex_dir):
            if f.startswith('spr') and f.endswith('.png'):
                have_tex[int(f[3:6])] = f

    template_id = os.path.splitext(os.path.basename(lca_path))[0]
    exported = 0
    parts_manifest = {}
    for typ, ob in sorted(real_shapes.items()):
        shape, resolved = resolve_shape_points(shapes, typ, ob['size'])
        if not shape or not resolved:
            continue
        pts, lines = resolved
        out_path = os.path.join(out_dir, template_id, 'parts', f'shape{typ:04d}')
        result = export_part(shape, pts, lines, ob, specs, trans, litcols, gpal, have_tex, pal, out_path)
        if result:
            exported += 1
            parts_manifest[typ] = {
                'referenceSize': list(ob['size']),
                'representativeObjectNumber': ob['number'],
                **result,
            }

    manifest_path = os.path.join(out_dir, template_id, 'parts_manifest.json')
    os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
    with open(manifest_path, 'w') as fh:
        json.dump(parts_manifest, fh, indent=2)

    return {'exported': exported, 'terrainShapes': len(terrain_shapes), 'realShapeCandidates': len(real_shapes)}


def main():
    out_dir = sys.argv[1]
    tex_dir = sys.argv[2]
    lca_paths = sys.argv[3:]
    for path in lca_paths:
        stats = export_template_parts(path, out_dir, tex_dir)
        print(os.path.basename(path), stats)


if __name__ == '__main__':
    main()
