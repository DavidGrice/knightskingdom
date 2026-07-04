#!/usr/bin/env python3
"""
extract_all.py -- one-command asset extraction for LEGO Creator:
Knights' Kingdom.

Point it at your own installed copy of the game and it produces the full
open-format asset set under ./extracted/ :

    extracted/pak/         contents of system.pak and warehouse.pak
    extracted/xvr/         decompressed creator2000.xvr sub-files
    extracted/textures/    all 300+ textures as PNG
    extracted/sounds/      the 92 named world sounds as WAV
    extracted/models/      every .lca as textured OBJ + MTL (+ GLB)
    extracted/animations/  every .smo character animation as JSON
    extracted/templates/*/parts/  per-shape template parts (OBJ+MTL+GLB)
    extracted/catalog/     browsable catalog.html + model_catalog.json
    extracted/ldraw/       every model as LDraw MPD (BrickLink Studio)
    extracted/sound_map.csv  object -> sound association manifest

Usage:
    python extract_all.py "C:\\Program Files (x86)\\LEGO Media\\Constructive\\LEGO Creator Knights Kingdom"

Requires: Python 3.8+; Pillow (pip install pillow) for texture export.
This tool ships with NO game assets. You need your own copy of the game.
"""
import glob
import os
import shutil
import subprocess
import sys

KEEP_BMP = '--keep-bmp' in sys.argv          # skip PNG conversion if set

HERE = os.path.dirname(os.path.abspath(__file__))
TOOLS = os.path.join(HERE, 'tools')
sys.path.insert(0, TOOLS)


def run(script, *args):
    cmd = [sys.executable, os.path.join(TOOLS, script)] + list(args)
    print('+', ' '.join(cmd))
    subprocess.run(cmd, check=True)


def find(root, name):
    hits = glob.glob(os.path.join(root, '**', name), recursive=True)
    return hits[0] if hits else None


def main():
    if len(sys.argv) < 2 or sys.argv[1].startswith('--'):
        raise SystemExit(__doc__)
    game = sys.argv[1]
    out = os.path.join(HERE, 'extracted')
    pak_out = os.path.join(out, 'pak')
    xvr_out = os.path.join(out, 'xvr')
    os.makedirs(out, exist_ok=True)

    # 1) PAK archives (system.pak = sounds/help/UI, warehouse.pak = models)
    for pak in ('system.pak', 'warehouse.pak'):
        p = find(game, pak)
        if p:
            dest = os.path.join(pak_out, pak[:-4])
            if os.path.isdir(dest) and os.listdir(dest):
                print(f'== {pak} already extracted, skipping')
                continue
            try:
                run('pak_extract.py', p, dest)
            except subprocess.CalledProcessError:
                print(f'!! {pak} did not extract cleanly -- please report '
                      f'its first 16 bytes on the issue tracker')
                continue
        else:
            print(f'-- {pak} not found under {game} (skipping)')

    # 1b) convert extracted .bmp images to .png (originals removed unless
    #     --keep-bmp is passed); covers system.pak UI art & warehouse art
    bmps = glob.glob(os.path.join(pak_out, '**', '*.bmp'), recursive=True)
    if bmps:
        try:
            from PIL import Image
            for b in bmps:
                Image.open(b).save(b[:-4] + '.png')
                if not KEEP_BMP:
                    os.remove(b)
            print(f'converted {len(bmps)} BMP -> PNG')
        except ImportError:
            print('-- Pillow not installed; leaving BMPs as-is '
                  '(pip install pillow)')

    # 2) the bound master world (textures, sounds, palette live inside)
    xvr = find(game, 'creator2000.xvr') or find(pak_out, 'creator2000.xvr')
    if not xvr:
        raise SystemExit('creator2000.xvr not found -- extraction cannot '
                         'continue (is the game path correct?)')
    if os.path.exists(os.path.join(xvr_out, 'creator2000.spr')):
        print('== creator2000.xvr already unpacked, skipping')
    else:
        run('xvr_extract.py', xvr, xvr_out)

    # 3) textures and sounds
    spr = os.path.join(xvr_out, 'creator2000.spr')
    pal = os.path.join(xvr_out, 'creator2000.pal')
    texdir = os.path.join(out, 'textures')
    if len(glob.glob(os.path.join(texdir, '*.png'))) > 50:
        print('== textures already dumped, skipping')
    else:
        run('sprite_dump.py', spr, pal, texdir)
    snddir = os.path.join(out, 'sounds')
    if len(glob.glob(os.path.join(snddir, '*.wav'))) > 50:
        print('== sounds already dumped, skipping')
    else:
        run('snd_dump.py', os.path.join(xvr_out, 'creator2000.snd'), snddir)

    # 4) every .lca -> textured OBJ (models share one textures/ folder)
    all_lcas = sorted(set(
        glob.glob(os.path.join(game, '**', '*.lca'), recursive=True) +
        glob.glob(os.path.join(pak_out, '**', '*.lca'), recursive=True)))
    lcas = all_lcas
    models = os.path.join(out, 'models')
    os.makedirs(models, exist_ok=True)
    tex_link = os.path.join(models, 'textures')
    if not os.path.isdir(tex_link):
        shutil.copytree(os.path.join(out, 'textures'), tex_link)
    # the global runtime palette must travel with the textures: LITCOLS
    # (minifig body-part colours) index it rather than each .lca's PALT
    palsrc = os.path.join(xvr_out, 'creator2000.pal')
    if os.path.exists(palsrc):
        shutil.copy(palsrc, os.path.join(tex_link, 'creator2000.pal'))
    todo = [p for p in lcas if not os.path.exists(os.path.join(
        models, os.path.splitext(os.path.basename(p))[0] + '.obj'))]
    if lcas and not todo:
        print(f'== all {len(lcas)} models already exported, skipping')
    lcas = todo
    if lcas:
        # batch to keep command lines short on Windows
        for i in range(0, len(lcas), 25):
            run('export_textured.py', models, *lcas[i:i + 25])
        # in-process (a subprocess command line with hundreds of paths
        # exceeds the Windows 32K CreateProcess limit -> WinError 206)
        import csv as _csv
        import associate_sounds as AS
        wavs = AS.load_sound_files(os.path.join(out, 'sounds'))
        csv_path = os.path.join(out, 'sound_map.csv')
        with open(csv_path, 'w', newline='') as fh:
            w = _csv.writer(fh)
            w.writerow(['lca_file', 'object_number', 'object_name',
                        'sound_id', 'sound_name', 'wav_file', 'match_rule'])
            total = sum(AS.associate(p, wavs, w) for p in
                        sorted(set(glob.glob(os.path.join(game, '**',
                                             '*.lca'), recursive=True) +
                                   glob.glob(os.path.join(pak_out, '**',
                                             '*.lca'), recursive=True))))
        print(f'{csv_path}: {total} associations')
    else:
        print('-- no .lca files found; models step skipped')

    # 5) asset lineage manifest -- every shape's identity/provenance across
    #    every .lca (standalone model *and* world template), the source of
    #    truth downstream tooling (semi-vanilla per-part reconstruction)
    #    reads from instead of re-deriving stats from merged OBJ output.
    if all_lcas:
        mpath = os.path.join(out, 'asset_manifest.json')
        if os.path.exists(mpath) and '--force-manifest' not in sys.argv:
            print('== asset manifest already built, skipping '
                  '(--force-manifest to rebuild)')
        else:
            roots = [game] + ([pak_out] if os.path.isdir(pak_out) else [])
            run('generate_asset_manifest.py', mpath, *roots)

    # 6) .smo character animations (Animation Files/ under the game install)
    #    -> extracted/animations/<name>.json, one per rig (minifig bone
    #    tracks: position + rotation per frame, no interpolation keys).
    smos = sorted(glob.glob(os.path.join(game, '**', '*.smo'), recursive=True))
    anim_out = os.path.join(out, 'animations')
    todo_smos = [p for p in smos if not os.path.exists(os.path.join(
        anim_out, os.path.splitext(os.path.basename(p))[0] + '.json'))]
    if smos and not todo_smos:
        print(f'== all {len(smos)} animations already parsed, skipping')
    elif todo_smos:
        os.makedirs(anim_out, exist_ok=True)
        bad_smos = []
        for i in range(0, len(todo_smos), 25):
            batch = todo_smos[i:i + 25]
            try:
                run('smo_parser.py', anim_out, *batch)
            except subprocess.CalledProcessError:
                # one malformed file (e.g. an unsupported per-object timing
                # chunk) aborts its whole batch -- isolate the offender(s)
                # so the rest of the batch, and the rest of the pipeline,
                # aren't blocked by it.
                for p in batch:
                    jpath = os.path.join(anim_out, os.path.splitext(
                        os.path.basename(p))[0] + '.json')
                    if os.path.exists(jpath):
                        continue
                    try:
                        run('smo_parser.py', anim_out, p)
                    except subprocess.CalledProcessError:
                        bad_smos.append(p)
        if bad_smos:
            print(f'!! {len(bad_smos)} .smo file(s) did not parse cleanly '
                  f'-- skipped (see traceback above for each):')
            for p in bad_smos:
                print('   ', os.path.basename(p))
    else:
        print('-- no .smo files found under the game install; animations step skipped')

    # 7) GLB alongside every exported OBJ -- native Python, no Node/npm
    #    dependency, so this tool's own output is glTF-ready standalone.
    #    Covers extracted/models/*.obj (264 standalone models + the 9
    #    template merged bakes, which share that dir) and, opportunistically,
    #    extracted/templates/*/parts/*.obj if export_template_parts.py has
    #    been run (that step isn't part of this pipeline yet -- see
    #    export_template_parts.py's own docstring).
    glb_targets = sorted(
        glob.glob(os.path.join(models, '*.obj')) +
        glob.glob(os.path.join(out, 'templates', '*', 'parts', '*.obj')))
    todo_glb = [p for p in glb_targets
                if not os.path.exists(p[:-4] + '.glb')]
    if glb_targets and not todo_glb:
        print(f'== all {len(glb_targets)} GLBs already built, skipping')
    elif todo_glb:
        for i in range(0, len(todo_glb), 25):
            run('obj_to_glb.py', '--textures', out, *todo_glb[i:i + 25])
    else:
        print('-- no exported OBJ files found; GLB step skipped')

    # 8) browsable HTML catalog (+ model_catalog.json fingerprint index),
    #    reusing the already-exported textured OBJs from step 4
    cat_out = os.path.join(out, 'catalog')
    if all_lcas:
        if os.path.exists(os.path.join(cat_out, 'catalog.html')) and \
                '--force-catalog' not in sys.argv:
            print('== catalog already built, skipping (--force-catalog '
                  'to rebuild)')
        else:
            args = [cat_out, tex_link, '--reuse', models]
            csvp = os.path.join(out, 'sound_map.csv')
            if os.path.exists(csvp):
                args += ['--sounds', csvp]
            roots = [game] + ([pak_out] if os.path.isdir(pak_out) else [])
            run('catalog_build.py', *args, *roots)

    # 9) LDraw / BrickLink Studio export (MPD per model)
    ldraw_out = os.path.join(out, 'ldraw')
    if all_lcas:
        done = len(glob.glob(os.path.join(ldraw_out, '*.mpd')))
        if done >= len(all_lcas):
            print(f'== all {len(all_lcas)} LDraw models already exported,'
                  ' skipping')
        else:
            for i in range(0, len(all_lcas), 25):
                run('ldraw_bridge.py', ldraw_out, *all_lcas[i:i + 25])

    print(f'\nDone. Everything is under {out}')


if __name__ == '__main__':
    main()
