#!/usr/bin/env python3
"""
run.py -- ONE-CLICK asset extraction for LEGO Creator: Knights' Kingdom.

Open this file in VS Code and press Run (or double-click it). No
arguments needed:

  1. finds your game install automatically (or asks once and remembers
     it in config.json),
  2. installs the one dependency (Pillow) if it's missing,
  3. runs the full pipeline -- PAK archives, the bound world, textures,
     sounds, textured OBJ models, sound map,
  4. and RESUMES if interrupted: run it again and finished steps are
     skipped.

Everything lands in the `extracted/` folder next to this script.
This tool ships with no game assets; you need your own copy of the game.
"""
import glob
import json
import os
import subprocess
import sys


def count(pattern):
    return len(glob.glob(pattern, recursive=True))


def folder_size(path):
    total = 0
    for root, _dirs, files in os.walk(path):
        for f in files:
            try:
                total += os.path.getsize(os.path.join(root, f))
            except OSError:
                pass
    return total


def tally(out):
    models = count(os.path.join(out, 'models', '*.obj'))
    textures = count(os.path.join(out, 'textures', '*.png'))
    sounds = count(os.path.join(out, 'sounds', '*.wav'))
    animations = count(os.path.join(out, 'animations', '*.json'))
    glbs = count(os.path.join(out, 'models', '*.glb')) + \
        count(os.path.join(out, 'templates', '**', '*.glb'))
    pak = os.path.join(out, 'pak')
    voices = count(os.path.join(pak, '**', '*.wav'))
    images = count(os.path.join(pak, '**', '*.png')) + \
        count(os.path.join(pak, '**', '*.bmp'))
    texts = count(os.path.join(pak, '**', '*.txt'))
    lcas = count(os.path.join(pak, '**', '*.lca'))
    csvp = os.path.join(out, 'sound_map.csv')
    assoc = 0
    if os.path.exists(csvp):
        with open(csvp) as fh:
            assoc = max(0, sum(1 for _ in fh) - 1)
    size = folder_size(out)
    banner('EXTRACTION TALLY')
    print(f'  Models (textured OBJ+MTL) : {models}')
    print(f'  Models as GLB             : {glbs}')
    print(f'  Textures (PNG)            : {textures}')
    print(f'  World sounds (WAV)        : {sounds}')
    print(f'  Character animations      : {animations}')
    print(f'  Voice-overs / pak audio   : {voices}')
    print(f'  Images & thumbnails (pak) : {images}')
    print(f'  Help / text files         : {texts}')
    print(f'  .lca source models found  : {lcas}')
    print(f'  Object-sound associations : {assoc}')
    print(f'  Total extracted size      : {size / 1024 / 1024:,.1f} MB')

HERE = os.path.dirname(os.path.abspath(__file__))
CONFIG = os.path.join(HERE, 'config.json')

COMMON_PATHS = [
    r'C:\Program Files (x86)\LEGO Media\Constructive'
    r'\LEGO Creator Knights Kingdom',
    r'C:\Program Files\LEGO Media\Constructive'
    r'\LEGO Creator Knights Kingdom',
    r'C:\LEGO Media\LEGO Creator Knights Kingdom',
]


def banner(msg):
    print('\n' + '=' * 62 + f'\n  {msg}\n' + '=' * 62)


def ensure_pillow():
    try:
        import PIL  # noqa: F401
        return
    except ImportError:
        pass
    banner('Installing Pillow (needed for texture/image export)...')
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'pillow'],
                       check=True)
    except subprocess.CalledProcessError:
        print('!! Could not install Pillow automatically. Textures and')
        print('   image conversion will be skipped. To fix, run:')
        print('       pip install pillow')


def looks_like_game(path):
    return path and os.path.isdir(path) and (
        glob.glob(os.path.join(path, '**', 'system.pak'), recursive=True) or
        glob.glob(os.path.join(path, '**', 'creator2000.xvr'),
                  recursive=True))


def find_game():
    # 1) remembered path
    if os.path.exists(CONFIG):
        try:
            saved = json.load(open(CONFIG)).get('game_path')
            if looks_like_game(saved):
                print(f'Using saved game path: {saved}')
                return saved
        except (ValueError, OSError):
            pass
    # 2) common install locations
    for p in COMMON_PATHS:
        if looks_like_game(p):
            print(f'Found game install: {p}')
            json.dump({'game_path': p}, open(CONFIG, 'w'))
            return p
    # 3) ask once, remember forever
    banner('Where is LEGO Creator: Knights\' Kingdom installed?')
    print('Paste the folder path (the one containing system.pak),')
    print('then press Enter:')
    while True:
        p = input('> ').strip().strip('"')
        if looks_like_game(p):
            json.dump({'game_path': p}, open(CONFIG, 'w'))
            return p
        print("Couldn't find system.pak or creator2000.xvr under that")
        print('folder -- please check the path and try again:')


def main():
    banner("LEGO Creator: Knights' Kingdom -- asset extraction")
    ensure_pillow()
    game = find_game()
    banner('Running the pipeline (safe to re-run: finished steps skip)')
    rc = subprocess.run(
        [sys.executable, os.path.join(HERE, 'extract_all.py'), game]).returncode
    out = os.path.join(HERE, 'extracted')
    if os.path.isdir(out):
        tally(out)
    if rc == 0:
        banner('ALL DONE')
        print(f'Your assets are in:\n  {out}\n')
        print('  models/    textured OBJ+MTL (Blender: File > Import >')
        print('             Wavefront, viewport to Material Preview)')
        print('             + self-contained .glb next to each (glTF)')
        print('  textures/  the texture bank as PNG')
        print('  sounds/    the 92 named world sounds as WAV')
        print('  animations/  character animations (.smo) as JSON')
        print('  pak/       voice-overs, help text, UI art')
        print('  sound_map.csv  object > sound associations')
    else:
        banner('Finished with errors -- scroll up for details.')
        print('Re-running this script will resume from where it stopped.')
    if os.name == 'nt' and not sys.stdout.isatty():
        input('\nPress Enter to close...')


if __name__ == '__main__':
    main()
