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
    extracted/models/      every .lca as textured OBJ + MTL
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
            try:
                run('pak_extract.py', p, os.path.join(pak_out, pak[:-4]))
            except subprocess.CalledProcessError:
                print(f'!! {pak} did not extract cleanly -- please report '
                      f'its first 16 bytes on the issue tracker')
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
    run('xvr_extract.py', xvr, xvr_out)

    # 3) textures and sounds
    spr = os.path.join(xvr_out, 'creator2000.spr')
    pal = os.path.join(xvr_out, 'creator2000.pal')
    run('sprite_dump.py', spr, pal, os.path.join(out, 'textures'))
    run('snd_dump.py', os.path.join(xvr_out, 'creator2000.snd'),
        os.path.join(out, 'sounds'))

    # 4) every .lca -> textured OBJ (models share one textures/ folder)
    lcas = sorted(set(
        glob.glob(os.path.join(game, '**', '*.lca'), recursive=True) +
        glob.glob(os.path.join(pak_out, '**', '*.lca'), recursive=True)))
    models = os.path.join(out, 'models')
    os.makedirs(models, exist_ok=True)
    tex_link = os.path.join(models, 'textures')
    if not os.path.isdir(tex_link):
        shutil.copytree(os.path.join(out, 'textures'), tex_link)
    if lcas:
        # batch to keep command lines short on Windows
        for i in range(0, len(lcas), 25):
            run('export_textured.py', models, *lcas[i:i + 25])
        run('associate_sounds.py', os.path.join(out, 'sounds'),
            os.path.join(out, 'sound_map.csv'), *lcas)
    else:
        print('-- no .lca files found; models step skipped')

    print(f'\nDone. Everything is under {out}')


if __name__ == '__main__':
    main()