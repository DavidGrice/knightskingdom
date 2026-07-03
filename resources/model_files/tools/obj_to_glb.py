#!/usr/bin/env python3
"""
obj_to_glb.py -- convert already-exported OBJ+MTL pairs to self-contained
GLB, using gltf_writer.py. Writes <name>.glb next to each .obj (same
sibling-output convention as render_obj.py's PNG previews, not an explicit
outdir), since textures are resolved relative to the OBJ's own directory.

Usage: python3 obj_to_glb.py [--textures dir]... file.obj [more.obj ...]
       (--textures gives an extra fallback parent dir -- one that itself
       contains a `textures/` folder -- to resolve `map_Kd textures/foo.png`
       against, for OBJs like template parts that don't keep their own
       `textures/` copy alongside, e.g. --textures extracted; repeatable)
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gltf_writer import write_glb


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    tex_dirs = []
    obj_paths = []
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == '--textures':
            i += 1
            tex_dirs.append(args[i])
        else:
            obj_paths.append(args[i])
        i += 1
    for obj_path in obj_paths:
        mtl_path = os.path.splitext(obj_path)[0] + '.mtl'
        glb_path = os.path.splitext(obj_path)[0] + '.glb'
        result = write_glb(obj_path, mtl_path, glb_path, tex_dirs=tex_dirs)
        if result:
            print(f'{obj_path} -> {glb_path} ({os.path.getsize(glb_path):,} bytes)')
        else:
            print(f'{obj_path}: no triangulatable faces, skipped')


if __name__ == '__main__':
    main()
