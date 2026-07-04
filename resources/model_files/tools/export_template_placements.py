#!/usr/bin/env python3
"""
Extract placed-object data from LEGO Creator 2000 world templates ('User'
category .lca files) without baking it into the merged terrain OBJ.

Every real (non-terrain, non-group) placed object resolves to *something*
loadable, via two sources tried in order:

  1. Catalog match -- exact name resolution (tier 1: ~2-3 named objects per
     template in the game's own SCL convention, 'SCL M/F : QL01' etc.) or
     high-confidence geometry-fingerprint match against the 264-model
     warehouse catalog (tier 2, via ShapeSignatureIndex). Preferred when
     available since it's the game's actual player-facing asset.
  2. Local part -- export_template_parts.py already exported this exact
     object's own shape as a standalone OBJ/MTL (see parts_manifest.json).
     This is the fallback for the ~84% of objects with no catalog
     counterpart, and is what actually achieves full coverage: nothing
     needs to "match" anything since the template bundles its own complete
     geometry for everything it places.

Terrain objects (see export_template_parts.find_terrain_and_real_shapes)
are excluded entirely -- they're not placements, they stay in the base map.

Reuses export_obj.py's tree-walk/transform math (build_tree, rot_from_brees,
mat_mul/mat_vec, resolve_points_scaled), lca_parser's facet_to_loop, and
export_template_parts' terrain classification, so a placement's position,
geometry signature, and terrain/real split are all computed the exact way
the rest of this pipeline already computes them -- not reimplemented.

Usage: python3 export_template_placements.py <outdir> <parts_dir> <template.lca...>
  (parts_dir is where export_template_parts.py wrote <template-id>/parts_manifest.json)
"""
import json
import math
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lca_parser import parse_lca, facet_to_loop, split_container
from export_obj import (
    build_tree, rot_from_brees, mat_identity, mat_mul, mat_vec,
    resolve_points_scaled,
)
from export_template_parts import find_terrain_and_real_shapes
from export_textured import texspecs

SCALE = 0.001  # matches export_obj.py's default (VRT units -> mm)
E_OFINVISIBLE = 0x80000000
E_OFINVISDEF = 0x40000000

MODEL_METADATA_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    '..', '..', 'model_pipeline', 'model_metadata.generated.json')

# The geometry-fingerprint metadata indexes all 264 extracted models, but the
# game can only spawn the curated subset wired into the runtime warehouse
# catalog (~107 models). Matching against models the loader can't resolve
# produces broken placements (a wrong id -> missing asset -> a hole where a
# castle wall should be). So the match set is intersected with this catalog.
RUNTIME_CATALOG_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    '..', '..', '..', 'src', 'Components', 'MainMenuStack', 'StartStack',
    'MainGameStack', 'MainGame', 'GameEngine', 'Loaders',
    'warehouseModelCatalog.generated.js')

_PREFIX_RE = re.compile(r'^\d+_')


def normalize_catalog_id(model_id):
    """The extracted-model ids carry a `NN_` warehouse-ordering prefix
    (`04_l614100`) that the runtime catalog and public asset paths drop
    (`l614100`). Strip it so a fingerprint match resolves to a loadable id."""
    return _PREFIX_RE.sub('', model_id)


def load_loadable_catalog_ids(path):
    """The set of model ids the runtime warehouse catalog can actually spawn,
    read as the `.obj` basenames of its objUrl entries. Returns None if the
    catalog is unavailable, in which case matching stays unrestricted."""
    if not os.path.exists(path):
        return None
    txt = open(path, encoding='utf-8').read()
    return set(re.findall(r'/([A-Za-z0-9_.-]+)\.obj', txt)) or None

# FORMAT_SPEC.md §6.1 character codes -> the minifig<name> id convention
# already used in BucketBottomResourceStack/minifigures_animals/.
CHARACTER_CODES = {
    'KL': 'kingleo',
    'QL': 'queenleonora',
    'PS': 'princessstorm',
    'RS': 'richardstrong',
    'CB': 'cedricbull',
    'W': 'weezil',
    'GB': 'gilbertbad',
    'JM': 'johnmayne',
}

NAME_PATTERNS = [
    (re.compile(r'^SCL M/F\s*:\s*([A-Z]+)(\d+)$'), 'character'),
    (re.compile(r'^SCL Bomb\s*:\s*(\w+)$'), 'prop'),
    (re.compile(r'^SCL Vehicle\s*:\s*(\w+)$'), 'vehicle'),
]


def resolve_named_model_id(name, models_dir):
    """Tier 1: turn a WLD object name into a confirmed standalone model id
    (a file that actually exists in extracted/models/), or None."""
    for pattern, kind in NAME_PATTERNS:
        m = pattern.match(name.strip())
        if not m:
            continue
        if kind == 'character':
            code, variant = m.group(1), m.group(2)
            char_name = CHARACTER_CODES.get(code)
            if not char_name:
                return None, kind
            candidate = f'minifig{char_name}{variant}'
            if os.path.exists(os.path.join(models_dir, candidate + '.obj')):
                return candidate, kind
            fallback = f'minifig{char_name}00'
            if os.path.exists(os.path.join(models_dir, fallback + '.obj')):
                return fallback, kind
            return None, kind
        else:  # prop / vehicle: id is already catalog-shaped, just lowercase it
            candidate = m.group(1).lower()
            if os.path.exists(os.path.join(models_dir, candidate + '.obj')):
                return candidate, kind
            return None, kind
    return None, 'unknown'


SPR_RE = re.compile(r'spr(\d+)')


def _catalog_texture_ids(materials):
    """The set of global spr texture numbers a catalog model paints itself
    with, read from each material's `map_Kd` (e.g. 'textures/spr164_...png'
    -> 164). This is the same global texture id the template's per-facet
    `spec['tex']` resolves to, so the two sets are directly comparable."""
    ids = set()
    for mat in materials or []:
        ref = mat.get('map_Kd')
        if not ref:
            continue
        hit = SPR_RE.search(ref)
        if hit:
            ids.add(int(hit.group(1)))
    return ids


class ShapeSignatureIndex:
    """Tier 2: nearest-fingerprint match against the standalone catalog's
    precomputed vertex/face/bbox signatures (model_metadata.generated.json).

    Pure geometry (vertex/face/bbox) cannot separate a family of parts that
    share a mould but differ only by printed decoration -- e.g. the green
    path plates l4109610..l4109613 are byte-identical in shape and colour and
    differ solely by their spr texture. So the printed-texture signature is
    carried alongside the geometry one and used to break those ties.
    """

    def __init__(self, metadata_path, loadable_ids=None):
        with open(metadata_path) as fh:
            report = json.load(fh)
        self.models = []
        for m in report['models']:
            norm = normalize_catalog_id(m['id'])
            # Skip anything the runtime loader can't actually spawn, so a
            # fingerprint match never resolves to a missing asset.
            if loadable_ids is not None and norm not in loadable_ids:
                continue
            self.models.append({
                'id': norm,
                'vertexCount': m['vertexCount'],
                'faceCount': m['faceCount'],
                'size': m['bbox']['size'],
                'textures': _catalog_texture_ids(m.get('materials')),
            })
        self.by_counts = {}
        for m in self.models:
            self.by_counts.setdefault((m['vertexCount'], m['faceCount']), []).append(m)

    @staticmethod
    def _aspect_distance(size_a, size_b):
        """Scale-invariant shape similarity: compare sorted axis ratios
        rather than absolute dimensions (an instance may be placed at a
        different absolute scale than the standalone model's default)."""
        def ratios(size):
            s = sorted(x for x in size if x > 0) or [1.0]
            longest = s[-1]
            return [x / longest for x in s]
        ra, rb = ratios(size_a), ratios(size_b)
        n = max(len(ra), len(rb))
        ra += [0.0] * (n - len(ra))
        rb += [0.0] * (n - len(rb))
        return sum(abs(a - b) for a, b in zip(ra, rb))

    def match(self, vertex_count, face_count, size, texture_ids=None):
        texture_ids = texture_ids or set()
        exact = self.by_counts.get((vertex_count, face_count))
        if exact:
            if texture_ids:
                # Placed shape is textured: the printed decoration is the
                # discriminator. Prefer the geometry-tied candidate whose spr
                # set overlaps it most (aspect distance only breaks further
                # ties). If NOTHING in the bucket shares a texture, this is a
                # bad geometry coincidence (a decorated part colliding with an
                # undecorated brick of equal vertex/face count) -- refuse it so
                # the caller falls back to the template's own local part
                # rather than spawning a wrong, wrongly-skinned catalog model.
                ranked = sorted(
                    exact,
                    key=lambda m: (
                        -len(texture_ids & m['textures']),
                        self._aspect_distance(size, m['size']),
                    ),
                )
                best = ranked[0]
                if not (texture_ids & best['textures']):
                    return None, 'texture-mismatch'
                tied = [m for m in ranked
                        if len(texture_ids & m['textures'])
                        == len(texture_ids & best['textures'])]
                return best['id'], 'exact' if len(tied) == 1 else 'exact-ambiguous'
            if len(exact) == 1:
                return exact[0]['id'], 'exact'
            best = min(exact, key=lambda m: self._aspect_distance(size, m['size']))
            return best['id'], 'exact-ambiguous'

        # Near match: small count tolerance, ranked by count delta then shape.
        TOL = 2
        candidates = [
            m for m in self.models
            if abs(m['vertexCount'] - vertex_count) <= TOL
            and abs(m['faceCount'] - face_count) <= TOL
        ]
        if not candidates:
            return None, 'none'
        best = min(
            candidates,
            key=lambda m: (
                abs(m['vertexCount'] - vertex_count) + abs(m['faceCount'] - face_count),
                self._aspect_distance(size, m['size']),
            ),
        )
        return best['id'], 'approximate'


def shape_geometry(shapes, typ):
    """Resolve a local shape index to (vertexCount, faceCount, size),
    honouring the same LOD point/line inheritance emit_shape() uses."""
    idx = typ + 1
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

    face_count = 0
    for f in shape.get('facets', []):
        loop = facet_to_loop(f, lines)
        if loop is not None and len(loop) >= 3:
            face_count += 1

    return {'vertexCount': len(pts), 'faceCount': face_count, 'size': size}


def shape_texture_ids(shape, ob, specs, trans):
    """The set of global spr texture numbers this placed object paints its
    facets with -- resolved exactly the way export_template_parts.export_part
    resolves a facet's `usemtl tex{gref:03d}`: the per-facet `spec['tex']`,
    remapped through the object's local texture-translation table. Directly
    comparable to a catalog model's _catalog_texture_ids()."""
    my_specs = {s['facet']: s for s in specs.get(ob['number'], [])}
    if not my_specs:
        return set()
    my_trans = trans.get(ob['number'])
    ids = set()
    for f in shape.get('facets', []):
        spec = my_specs.get(f['number'])
        if not spec:
            continue
        gref = spec['tex']
        if my_trans is not None:
            gref = my_trans[gref] if 0 <= gref < len(my_trans) else None
        if gref is not None:
            ids.add(gref)
    return ids


CATALOG_CONFIDENCE = {'exact', 'exact-ambiguous'}


def extract_placements(lca_path, models_dir, sig_index, parts_manifest):
    r = parse_lca(lca_path)
    if 'wld' not in r or 'shp' not in r:
        return []
    objects = r['wld']['objects']
    if not objects:
        return []

    shapes = r['shp']['shapes']
    names = {s['number']: s['name'] for s in r['wld']['symbols']
              if s.get('type') == 0 and s.get('name')}
    build_tree(objects)
    root = objects[0]

    # Per-facet texture specs (same source export_template_parts.py bakes
    # from) so a placed shape's printed decoration can break geometry ties in
    # the catalog match. Absent on templates with no WRLD chunk -> no texture
    # signal, matching falls back to geometry-only.
    _hdr, subs = split_container(open(lca_path, 'rb').read())
    tex_specs, tex_trans = (
        texspecs(subs['WRLD'])[:2] if 'WRLD' in subs else ({}, {}))

    # find_terrain_and_real_shapes keeps one representative object per shape
    # type; terrain/real classification is per shape *type*, so any object
    # sharing a non-terrain type is real, matching export_template_parts.py.
    _terrain_shapes, real_shapes = find_terrain_and_real_shapes(objects)
    real_shape_types = set(real_shapes.keys())

    placements = []
    geometry_cache = {}  # local shape index -> resolved geometry (memoized per template)

    def walk(ob, pM, pT):
        if ob['oflags'] & (E_OFINVISIBLE | E_OFINVISDEF):
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

        name = names.get(ob['number'])
        is_terrain = typ != 0xFFFF and typ not in real_shape_types
        model_id, kind, tier, confidence, source = None, 'unknown', None, None, None
        instance_scale = None

        if not is_terrain and name:
            model_id, kind = resolve_named_model_id(name, models_dir)
            tier, confidence = 1, ('exact' if model_id else 'none')
            if model_id:
                source = 'catalog'
        elif not is_terrain and typ != 0xFFFF:
            geometry = geometry_cache.get(typ)
            if geometry is None:
                geometry = shape_geometry(shapes, typ) or {}
                geometry_cache[typ] = geometry
            if geometry:
                # Texture ids are per-object (facet specs key off the object
                # number), so they can't share the per-type geometry cache.
                shp = shapes[typ + 1] if typ + 1 < len(shapes) else None
                texture_ids = (shape_texture_ids(shp, ob, tex_specs, tex_trans)
                               if shp else set())
                model_id, confidence = sig_index.match(
                    geometry['vertexCount'], geometry['faceCount'],
                    geometry['size'], texture_ids)
                tier, kind = 2, 'prop'
                if model_id and confidence in CATALOG_CONFIDENCE:
                    source = 'catalog'
                else:
                    model_id = None  # don't spawn low-confidence catalog guesses

        # Fall back to this template's own exported part -- achieves full
        # coverage since nothing needs to externally match.
        if not is_terrain and source is None and typ != 0xFFFF:
            part_entry = parts_manifest.get(str(typ)) or parts_manifest.get(typ)
            if part_entry:
                ref_size = part_entry['referenceSize']
                instance_scale = [
                    (ob['size'][i] / ref_size[i]) if ref_size[i] else 1.0
                    for i in range(3)
                ]
                model_id = f'shape{typ:04d}'
                source = 'local-part'
                if tier is None:
                    tier, kind = 2, 'prop'

        if source is not None:
            # Position/Y-flip matches export_obj.py's emit_shape vertex math
            # exactly (T is already the object's local-origin world offset).
            position = [T[0] * SCALE, -T[1] * SCALE, T[2] * SCALE]
            # Yaw-only approximation -- see module docstring/README: placed
            # objects are expected upright with a heading rotation only.
            yaw_radians = math.atan2(M[0][2], M[0][0])
            placements.append({
                'number': ob['number'],
                'name': name,
                'kind': kind,
                'tier': tier,
                'source': source,
                'matchConfidence': confidence,
                'matchedModelId': model_id,
                'instanceScale': instance_scale,
                'position': position,
                'yawDegrees': math.degrees(yaw_radians),
                'size': list(ob['size']),
            })

        # A catalog-matched character (an "SCL M/F" minifig rig root) is
        # spawned as a whole minifig from the warehouse catalog. Its child
        # body-part objects must NOT also be emitted as local-parts, or they
        # reassemble a duplicate character right on top of it (the "two
        # queens" bug). Stop descending at the character root.
        if kind == 'character' and source == 'catalog':
            return

        for ch in ob['children']:
            walk(ch, M, T)

    walk(root, mat_identity(), [0.0, 0.0, 0.0])
    return placements


def main():
    outdir = sys.argv[1]
    parts_dir = sys.argv[2]
    lca_paths = sys.argv[3:]
    models_dir = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), '..', 'extracted', 'models')
    loadable_ids = load_loadable_catalog_ids(RUNTIME_CATALOG_PATH)
    sig_index = ShapeSignatureIndex(MODEL_METADATA_PATH, loadable_ids)

    manifest = {}
    for path in lca_paths:
        template_id = os.path.splitext(os.path.basename(path))[0]
        manifest_path = os.path.join(parts_dir, template_id, 'parts_manifest.json')
        parts_manifest = {}
        if os.path.exists(manifest_path):
            with open(manifest_path) as fh:
                parts_manifest = json.load(fh)

        placements = extract_placements(path, models_dir, sig_index, parts_manifest)
        manifest[template_id] = placements
        catalog = [p for p in placements if p['source'] == 'catalog']
        local_part = [p for p in placements if p['source'] == 'local-part']
        print(f'{template_id}: {len(placements)} placements '
              f'({len(catalog)} catalog, {len(local_part)} local-part)')

    os.makedirs(outdir, exist_ok=True)
    out_path = os.path.join(outdir, 'template_placements.generated.json')
    with open(out_path, 'w') as fh:
        json.dump(manifest, fh, indent=2)
    print(f'wrote {out_path}')


if __name__ == '__main__':
    main()
