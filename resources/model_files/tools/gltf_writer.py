#!/usr/bin/env python3
"""
gltf_writer.py -- minimal, stdlib-only glTF 2.0 (.glb) writer that converts
an already-exported OBJ+MTL pair (as produced by export_obj.py /
export_textured.py / export_template_parts.py) into a single self-contained
binary glTF file, embedding any referenced PNG textures directly.

Deliberately does NOT touch the exporters that build the OBJ/MTL text --
it re-reads their already-correct output, mirroring what the Node-side
conversion (resources/model_pipeline/obj2gltfHelper.mjs) already does for
the live game's warehouse/brick models. No axis/scale correction is
applied here: export_obj.py/export_textured.py/export_template_parts.py
already flip Y and write millimetres, so the GLB mirrors the OBJ 1:1.

Source facets are convex n-gons, so faces are fan-triangulated; glTF (unlike
three.js's OBJLoader) never auto-generates normals, so each triangle gets an
explicit flat normal, with vertices duplicated per-triangle so every
primitive is a plain non-indexed TRIANGLES draw (no index buffer needed).
"""
import json
import os
import struct

GL_ARRAY_BUFFER = 34962
GL_FLOAT = 5126
GL_TRIANGLES = 4
GL_REPEAT = 10497
GL_LINEAR = 9729
GL_LINEAR_MIPMAP_LINEAR = 9987


def _parse_mtl(mtl_path):
    """newmtl name -> {'kd': (r,g,b), 'd': alpha, 'map_kd': relative-path}."""
    mats = {}
    name = None
    if not mtl_path or not os.path.exists(mtl_path):
        return mats
    for line in open(mtl_path, encoding='utf-8', errors='replace'):
        p = line.split()
        if not p:
            continue
        if p[0] == 'newmtl':
            name = p[1]
            mats[name] = {'kd': (0.7, 0.7, 0.7), 'd': 1.0, 'map_kd': None}
        elif p[0] == 'Kd' and name:
            mats[name]['kd'] = tuple(float(x) for x in p[1:4])
        elif p[0] == 'd' and name:
            mats[name]['d'] = float(p[1])
        elif p[0] == 'map_Kd' and name:
            mats[name]['map_kd'] = p[-1]
    return mats


def _parse_obj(obj_path):
    """Returns (positions, uvs, {material: [(vidx, tidx_or_None), ...]})."""
    positions = []
    uvs = []
    cur_mat = '__default__'
    faces_by_mat = {}
    for line in open(obj_path, encoding='utf-8', errors='replace'):
        p = line.split()
        if not p:
            continue
        if p[0] == 'v':
            positions.append(tuple(float(x) for x in p[1:4]))
        elif p[0] == 'vt':
            uvs.append((float(p[1]), float(p[2])))
        elif p[0] == 'usemtl':
            cur_mat = p[1]
        elif p[0] == 'f':
            vidx, tidx, has_uv = [], [], True
            for tok in p[1:]:
                parts = tok.split('/')
                vidx.append(int(parts[0]) - 1)
                if len(parts) > 1 and parts[1]:
                    tidx.append(int(parts[1]) - 1)
                else:
                    has_uv = False
            faces_by_mat.setdefault(cur_mat, []).append(
                (vidx, tidx if has_uv else None))
    return positions, uvs, faces_by_mat


def _sub(a, b):
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def _cross(a, b):
    return (a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0])


def _normalize(v):
    length = (v[0] ** 2 + v[1] ** 2 + v[2] ** 2) ** 0.5
    if length < 1e-12:
        return (0.0, 0.0, 1.0)
    return (v[0] / length, v[1] / length, v[2] / length)


def _build_primitives(positions, uvs, faces_by_mat):
    """Fan-triangulates each material's faces into flat lists of duplicated
    per-triangle vertex data (positions/flat normals/[uvs]) -- a plain
    non-indexed draw, no shared-vertex indexing needed."""
    prims = {}
    for mat, faces in faces_by_mat.items():
        pos_out, nrm_out, uv_out = [], [], []
        any_uv = False
        for vidx, tidx in faces:
            n = len(vidx)
            if n < 3:
                continue
            for i in range(1, n - 1):
                tri_v = (vidx[0], vidx[i], vidx[i + 1])
                tri_t = (tidx[0], tidx[i], tidx[i + 1]) if tidx else None
                p0, p1, p2 = (positions[k] for k in tri_v)
                normal = _normalize(_cross(_sub(p1, p0), _sub(p2, p0)))
                for k, vi in enumerate(tri_v):
                    pos_out.extend(positions[vi])
                    nrm_out.extend(normal)
                    if tri_t:
                        uv_out.extend(uvs[tri_t[k]])
                        any_uv = True
                    else:
                        uv_out.extend((0.0, 0.0))
        if not pos_out:
            continue
        prims[mat] = {'positions': pos_out, 'normals': nrm_out,
                       'uvs': uv_out if any_uv else None}
    return prims


def write_glb(obj_path, mtl_path, glb_path, tex_dirs=None):
    """Converts obj_path (+ sibling mtl_path) to a self-contained glb_path.
    `map_Kd textures/foo.png` is resolved against the OBJ's own directory
    first (standalone models keep a `textures/` copy alongside, per
    extract_all.py step 4), then against each of `tex_dirs` in order --
    template parts reference a `textures/` folder that isn't duplicated
    into every part dir (the live JS loader resolves this the same way,
    via MTLLoader.setResourcePath to one shared texture bank instead of
    each MTL's own directory; see objMtlLoader.js).
    Returns glb_path, or None if the OBJ has no triangulatable faces."""
    positions, uvs, faces_by_mat = _parse_obj(obj_path)
    materials = _parse_mtl(mtl_path)
    prims = _build_primitives(positions, uvs, faces_by_mat)
    if not prims:
        return None

    obj_dir = os.path.dirname(os.path.abspath(mtl_path or obj_path))
    search_dirs = [obj_dir] + list(tex_dirs or [])
    buffer = bytearray()
    buffer_views, accessors = [], []
    images, textures, gltf_materials = [], [], []
    texture_index_by_path = {}
    material_index_by_name = {}

    def add_buffer_view(data_bytes, target=None):
        while len(buffer) % 4 != 0:               # glTF alignment convention
            buffer.append(0)
        offset = len(buffer)
        buffer.extend(data_bytes)
        bv = {'buffer': 0, 'byteOffset': offset, 'byteLength': len(data_bytes)}
        if target is not None:
            bv['target'] = target
        buffer_views.append(bv)
        return len(buffer_views) - 1

    def add_vec_accessor(flat_floats, kind, with_bounds=False):
        n_comp = 3 if kind == 'VEC3' else 2
        data = struct.pack('<%df' % len(flat_floats), *flat_floats)
        bv = add_buffer_view(data, target=GL_ARRAY_BUFFER)
        acc = {'bufferView': bv, 'componentType': GL_FLOAT,
               'count': len(flat_floats) // n_comp, 'type': kind}
        if with_bounds:
            comps = [flat_floats[i::n_comp] for i in range(n_comp)]
            acc['min'] = [min(c) for c in comps]
            acc['max'] = [max(c) for c in comps]
        accessors.append(acc)
        return len(accessors) - 1

    def get_texture_index(rel_path):
        for cand_dir in search_dirs:
            full = os.path.normpath(os.path.join(cand_dir, rel_path))
            if full in texture_index_by_path:
                return texture_index_by_path[full]
            if os.path.exists(full):
                break
        else:
            return None
        png_bytes = open(full, 'rb').read()
        bv = add_buffer_view(png_bytes)
        images.append({'bufferView': bv, 'mimeType': 'image/png'})
        textures.append({'source': len(images) - 1, 'sampler': 0})
        idx = len(textures) - 1
        texture_index_by_path[full] = idx
        return idx

    def get_material_index(name):
        if name in material_index_by_name:
            return material_index_by_name[name]
        info = materials.get(
            name, {'kd': (0.7, 0.7, 0.7), 'd': 1.0, 'map_kd': None})
        r, g, b = info['kd']
        alpha = info['d']
        mat = {'pbrMetallicRoughness': {
                   'baseColorFactor': [r, g, b, alpha],
                   'metallicFactor': 0.0, 'roughnessFactor': 0.8},
               'doubleSided': True}
        if info.get('map_kd'):
            tex_idx = get_texture_index(info['map_kd'])
            if tex_idx is not None:
                mat['pbrMetallicRoughness']['baseColorTexture'] = {'index': tex_idx}
                mat['pbrMetallicRoughness']['baseColorFactor'] = [1.0, 1.0, 1.0, alpha]
        if alpha < 1.0:
            mat['alphaMode'] = 'BLEND'
        gltf_materials.append(mat)
        material_index_by_name[name] = len(gltf_materials) - 1
        return material_index_by_name[name]

    gltf_primitives = []
    for mat_name, data in prims.items():
        pos_acc = add_vec_accessor(data['positions'], 'VEC3', with_bounds=True)
        nrm_acc = add_vec_accessor(data['normals'], 'VEC3')
        attrs = {'POSITION': pos_acc, 'NORMAL': nrm_acc}
        if data['uvs']:
            attrs['TEXCOORD_0'] = add_vec_accessor(data['uvs'], 'VEC2')
        gltf_primitives.append({'attributes': attrs,
                                 'material': get_material_index(mat_name),
                                 'mode': GL_TRIANGLES})

    gltf = {
        'asset': {'version': '2.0', 'generator': 'knightskingdom gltf_writer.py'},
        'scene': 0,
        'scenes': [{'nodes': [0]}],
        'nodes': [{'mesh': 0}],
        'meshes': [{'primitives': gltf_primitives}],
        'materials': gltf_materials,
        'accessors': accessors,
        'bufferViews': buffer_views,
        'buffers': [{'byteLength': len(buffer)}],
    }
    if images:
        gltf['images'] = images
        gltf['textures'] = textures
        gltf['samplers'] = [{'magFilter': GL_LINEAR,
                              'minFilter': GL_LINEAR_MIPMAP_LINEAR,
                              'wrapS': GL_REPEAT, 'wrapT': GL_REPEAT}]

    json_bytes = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    json_bytes += b' ' * ((4 - len(json_bytes) % 4) % 4)   # pad w/ spaces
    bin_bytes = bytes(buffer)
    bin_bytes += b'\x00' * ((4 - len(bin_bytes) % 4) % 4)  # pad w/ zeros

    total_len = 12 + 8 + len(json_bytes) + 8 + len(bin_bytes)
    os.makedirs(os.path.dirname(os.path.abspath(glb_path)) or '.', exist_ok=True)
    with open(glb_path, 'wb') as fh:
        fh.write(struct.pack('<4sII', b'glTF', 2, total_len))
        fh.write(struct.pack('<I', len(json_bytes)) + b'JSON')
        fh.write(json_bytes)
        fh.write(struct.pack('<I', len(bin_bytes)) + b'BIN\x00')
        fh.write(bin_bytes)
    return glb_path
