#!/usr/bin/env python3
"""
Asset lineage manifest: for every extracted .lca (standalone model *and*
world template), record each of its shapes' identity and provenance --
symbol name, geometry stats, size, and which texture sprites it references.

This is the authoritative "where does this model's data come from" tracker
requested to anchor the semi-vanilla per-part reconstruction work in the
core extraction pipeline rather than a downstream, ad hoc script. It
supersedes resources/model_pipeline/model_metadata.generated.json as the
source of truth: that file only covered the 264 flattened standalone
exports (derived from their merged OBJ output); this covers every
template's *locally bundled* shapes too, which is what export_template_parts.py
needs to find and export individually.

Reuses lca_parser.parse_lca (shp/wld parsing), export_obj.resolve_points_scaled
/facet_to_loop (geometry resolution), and export_textured.texspecs (texture
reference resolution) -- no new binary parsing.

Usage: python3 generate_asset_manifest.py <outfile.json> <lca_root_dir>
  (scans all *.lca under lca_root_dir, recursively)
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lca_parser import parse_lca, facet_to_loop
from export_obj import resolve_points_scaled
from export_textured import texspecs


def shape_geometry(shapes, idx):
    """idx is the 0-based shapes[] array index (== WLD type + 1)."""
    if idx >= len(shapes) or not shapes[idx]:
        return None
    shape = shapes[idx]
    lines = shape.get('lines')
    fallback_pts = None
    if 'points' not in shape or lines is None:
        for prev in reversed(shapes[:idx]):
            if fallback_pts is None and prev.get('points'):
                fallback_pts = resolve_points_scaled(prev, shape.get('size') or [1000, 1000, 1000], None)
            if lines is None and prev.get('lines'):
                lines = prev['lines']
            if fallback_pts is not None and lines is not None:
                break
    lines = lines or []
    size = shape.get('size') or [1000, 1000, 1000]
    pts = resolve_points_scaled(shape, size, fallback_pts)
    face_count = sum(
        1 for f in shape.get('facets', [])
        if facet_to_loop(f, lines) is not None and len(facet_to_loop(f, lines)) >= 3
    )
    return {'vertexCount': len(pts), 'facetCount': face_count, 'size': size}


def scan_lca(path):
    r = parse_lca(path)
    header = r.get('header', {})
    category = header.get('category')
    shp = r.get('shp', {})
    shapes = shp.get('shapes', [])
    shape_names = {s['number']: s['name'] for s in shp.get('symbols', []) if s.get('name')}

    # which WLD objects use which local shape index, and texture refs
    usage = {}
    tex_refs_by_shape = {}
    if 'wld' in r:
        try:
            with open(path, 'rb') as fh:
                raw = fh.read()
            from lca_parser import split_container
            _hdr, subs = split_container(raw)
            specs, trans, _litcols, _materials = (
                texspecs(subs['WRLD']) if 'WRLD' in subs else ({}, {}, {}, {}))
        except Exception:
            specs, trans = {}, {}
        for ob in r['wld']['objects']:
            typ = ob['type']
            if typ == 0xFFFF:
                continue
            usage.setdefault(typ, []).append(ob['number'])
            my_specs = specs.get(ob['number'], [])
            my_trans = trans.get(ob['number'])
            refs = set()
            for s in my_specs:
                gref = s['tex']
                if my_trans:
                    gref = my_trans[gref] if 0 <= gref < len(my_trans) else None
                if gref is not None:
                    refs.add(gref)
            if refs:
                tex_refs_by_shape.setdefault(typ, set()).update(refs)

    shapes_out = []
    for idx in range(1, len(shapes)):
        if not shapes[idx]:
            continue
        geom = shape_geometry(shapes, idx)
        if not geom:
            continue
        typ = idx - 1  # WLD object 'type' field == shapes[] index - 1
        shapes_out.append({
            'shapeIndex': typ,
            'symbolName': shape_names.get(typ),
            'vertexCount': geom['vertexCount'],
            'facetCount': geom['facetCount'],
            'size': geom['size'],
            'usedByObjectNumbers': usage.get(typ, []),
            'textureRefs': sorted(tex_refs_by_shape.get(typ, [])),
        })

    return {
        'id': os.path.splitext(os.path.basename(path))[0],
        'category': category,
        'shapeCount': len(shapes_out),
        'shapes': shapes_out,
    }


def main():
    out_path = sys.argv[1]
    roots = sys.argv[2:]
    lca_paths = []
    for root in roots:
        for dirpath, _dirnames, filenames in os.walk(root):
            for fn in filenames:
                if fn.lower().endswith('.lca'):
                    lca_paths.append(os.path.join(dirpath, fn))

    manifest = {}
    errors = []
    for path in sorted(lca_paths):
        try:
            entry = scan_lca(path)
            manifest[entry['id']] = entry
        except Exception as exc:
            errors.append((path, str(exc)))

    with open(out_path, 'w') as fh:
        json.dump(manifest, fh, indent=2)

    print(f'scanned {len(lca_paths)} .lca files -> {len(manifest)} entries, {len(errors)} errors')
    for path, err in errors[:10]:
        print(f'  ERROR {path}: {err}')
    print(f'wrote {out_path}')


if __name__ == '__main__':
    main()
