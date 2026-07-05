#!/usr/bin/env python3
"""
mirror_pak_models.py -- lay the exported models out the way the game's PAK
does: categorized by warehouse section, instead of one flat folder.

The rest of the pipeline writes every model into a single flat
`extracted/models/` folder (OBJ + MTL + GLB, plus a shared textures/ bank).
That's what the running app/tooling reads, so it stays as-is. But the game's
own PAK groups the very same models by section --

    pak/warehouse/workshop/cylindrical/04_l614100.lca
    pak/warehouse/main_interface/scenery/l4109612.lca
    pak/warehouse/worlds/templates/template-01.lca
    ...

each with a colocated `.png` icon. This tool reproduces that category tree
under `extracted/pak_models/` and fills it with the *updated* model files, so
you get a browsable, categorized "mimicked PAK" of models without touching the
flat models/ folder.

For every `<section>/<id>.lca` under extracted/pak/warehouse/ it writes:

    pak_models/<section>/<id>.obj  <id>.mtl  <id>.glb   (from models/)
    pak_models/<section>/<id>.png                       (the PAK icon, if any)
    pak_models/<section>/textures/sprNNN_*.png          (only the textures the
                                                         MTLs in that section
                                                         actually reference)

The MTLs are copied verbatim -- their `map_Kd textures/sprNNN.png` paths stay
valid because each section carries its own textures/ subfolder. GLBs are
self-contained (textures embedded) and render on their own.

Copies are incremental: a destination file is only rewritten when the source
is newer or a different size, so re-running after re-exporting a handful of
models only touches those.

Usage:
    python mirror_pak_models.py <extracted_dir> [--dest pak_models]
"""
import os
import re
import shutil
import sys

MODEL_EXTS = ('.obj', '.mtl', '.glb')
MAP_KD_RE = re.compile(r'^\s*map_Kd\s+(.+?)\s*$', re.IGNORECASE)


def copy_if_newer(src, dst):
    """Copy src->dst only when dst is missing/stale (mtime or size differ).
    Returns True if it copied, False if it skipped an up-to-date file."""
    if not os.path.exists(src):
        return None  # nothing to copy (e.g. a model with no icon png)
    if os.path.exists(dst):
        s, d = os.stat(src), os.stat(dst)
        if s.st_size == d.st_size and int(s.st_mtime) <= int(d.st_mtime):
            return False
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(src, dst)
    return True


def mtl_texture_names(mtl_path):
    """The set of texture image basenames an MTL references via map_Kd."""
    names = set()
    if not os.path.exists(mtl_path):
        return names
    with open(mtl_path, encoding='cp1252', errors='replace') as fh:
        for ln in fh:
            m = MAP_KD_RE.match(ln)
            if m:
                names.add(os.path.basename(m.group(1).replace('\\', '/')))
    return names


def mirror(extracted_dir, dest_name='pak_models'):
    pak_root = os.path.join(extracted_dir, 'pak')
    pak_wh = os.path.join(pak_root, 'warehouse')
    models = os.path.join(extracted_dir, 'models')
    tex_bank = os.path.join(models, 'textures')
    if not os.path.isdir(tex_bank):
        tex_bank = os.path.join(extracted_dir, 'textures')
    dest_root = os.path.join(extracted_dir, dest_name)

    if not os.path.isdir(pak_wh):
        print(f'-- {pak_wh} not found; run the PAK step first (skipping)')
        return 0
    if not os.path.isdir(models):
        print(f'-- {models} not found; run the models step first (skipping)')
        return 0

    lcas = []
    for root, _dirs, files in os.walk(pak_wh):
        for f in files:
            if f.lower().endswith('.lca'):
                lcas.append(os.path.join(root, f))
    lcas.sort()

    copied = skipped = missing = icons = textures = 0
    seen_models = 0
    for lca in lcas:
        # section keeps the leading 'warehouse/' so the tree faithfully
        # mirrors the PAK (pak/warehouse/... -> pak_models/warehouse/...)
        section = os.path.relpath(os.path.dirname(lca), pak_root)
        mid = os.path.splitext(os.path.basename(lca))[0]
        dest_dir = os.path.join(dest_root, section)

        obj_src = os.path.join(models, mid + '.obj')
        if not os.path.exists(obj_src):
            missing += 1
            continue
        seen_models += 1

        for ext in MODEL_EXTS:
            r = copy_if_newer(os.path.join(models, mid + ext),
                              os.path.join(dest_dir, mid + ext))
            if r is True:
                copied += 1
            elif r is False:
                skipped += 1

        # the PAK's own colocated icon thumbnail, if the game shipped one
        r = copy_if_newer(lca[:-4] + '.png', os.path.join(dest_dir, mid + '.png'))
        if r is not None:
            icons += 1

        # only the textures this model's MTL references, into the section's
        # own textures/ subfolder (keeps map_Kd paths valid, no rewriting)
        for tex in mtl_texture_names(os.path.join(models, mid + '.mtl')):
            r = copy_if_newer(os.path.join(tex_bank, tex),
                              os.path.join(dest_dir, 'textures', tex))
            if r is True:
                textures += 1

    print(f'  categorized {seen_models} models into {dest_root}')
    print(f'    files copied: {copied}, up-to-date (skipped): {skipped}')
    print(f'    icons: {icons}, section textures written: {textures}')
    if missing:
        print(f'    !! {missing} PAK entries had no exported model in {models}')
    return seen_models


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    dest = 'pak_models'
    if '--dest' in sys.argv:
        i = sys.argv.index('--dest')
        if i + 1 < len(sys.argv):
            dest = sys.argv[i + 1]
            args = [a for a in args if a != dest]
    if not args:
        raise SystemExit(__doc__)
    mirror(args[0], dest)


if __name__ == '__main__':
    main()
