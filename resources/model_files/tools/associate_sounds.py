#!/usr/bin/env python3
"""
Associate LEGO Creator (Knights' Kingdom) sounds with objects in .lca files.

The shipped .lca files carry no per-object sound chunks (triggering lives
in compiled SCL scripts), but the game's naming is highly consistent, so
this tool matches WLD object names and SHP shape names against the 92
named sounds in the global bank (CREATO~2.SND inside creator2000.xvr).

Output: a CSV manifest, one row per (object, sound) association:
  lca_file, object_number, object_or_shape_name, sound_id, sound_name,
  wav_file, match_rule

Character codes in the bank: KL=King Leo, QL=Queen Leonora,
PS=Princess Storm, RS=Richard the Strong, CB=Cedric the Bull, W=Weezil,
GB=Gilbert the Bad, JM=John of Mayne, GenB/GenG=generic boy/girl.
Every minifigure also gets Step/Fart; every Brick-category file gets the
global brick-interaction sounds (Link/Collide/Connect); Environmentals
attach to world roots (templates/challenges), not objects.

Usage:
  python3 associate_sounds.py <sounds_dir> <out.csv> <files.lca...>
"""
import csv
import glob
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lca_parser as L

# keyword (in object/shape name, lowercase) -> sound ids
KEYWORDS = {
    'drawbridge': [20], 'portcullis': [66], 'door': [26, 27],
    'window': [24, 25], 'cupboard': [28, 29], 'treasure': [68, 69],
    'chest': [68, 69], 'cannon': [22], 'trebuchet': [60],
    'crossbow': [18, 80], 'longbow': [8], 'bow': [8], 'sword': [12],
    'spear': [13], 'halbeard': [19, 82], 'halberd': [19, 82],
    'flag': [23], 'banner': [23], 'bat': [55, 56], 'falcon': [54],
    'horse': [52, 76, 77, 81], 'carriage': [61, 83], 'wheel': [58],
    'ram': [84], 'axe': [79], 'bridge': [62], 'prison': [63],
    'bomb': [67], 'horn': [91], 'flame': [59], 'torch': [59],
    'fire': [59], 'joust': [51], 'mug': [9], 'lock': [78],
    'revolving': [65], 'tipping': [64], 'dragon': [21],
    'lightning': [89], 'owl': [90],
}
# character-name keywords -> (Collision, Greeting, Random, extra...)
CHARACTERS = {
    'kingleo': [17, 42, 43], 'king leo': [17, 42, 43],
    'queen': [10, 34, 35], 'leonora': [10, 34, 35],
    'princess': [46, 47, 48], 'storm': [46, 47, 48],
    'richard': [11, 36, 37, 50],
    'cedric': [15, 44, 45, 53], 'bull': [15, 44, 45, 53],
    'weezil': [14, 38, 39], 'gilbert': [16, 40, 41],
    'john': [7, 30, 31], 'mayne': [7, 30, 31],
    'skeleton': [49],
    'boy': [70, 71, 72], 'girl': [73, 74, 75],
}
MINIFIG_COMMON = [32, 33]                  # Step, Fart
BRICK_GLOBAL = [3, 4, 5]                   # Link, Collide, Connect
ENVIRONMENTALS = [0, 1, 2, 6, 85, 86, 87, 88, 89, 90]


def load_sound_files(sounds_dir):
    out = {}
    for f in glob.glob(os.path.join(sounds_dir, 'snd*.wav')):
        m = re.match(r'snd(\d+)', os.path.basename(f))
        if m:
            out[int(m.group(1))] = os.path.basename(f)
    return out


def sound_name(fn):
    return re.sub(r'^snd\d+_', '', fn)[:-4].replace('_', ' ')


def associate(path, wavs, writer):
    r = L.parse_lca(path)
    base = os.path.basename(path)
    cat = r['header'].get('category', '')
    shp = r['shp']
    snm = {s['number']: s['name'] for s in shp['symbols'] if s.get('name')}
    rows = 0

    def emit(num, name, sid, rule):
        nonlocal rows
        if sid not in wavs:
            return
        writer.writerow([base, num, name, sid, sound_name(wavs[sid]),
                         wavs[sid], rule])
        rows += 1

    seen = set()
    names = []                              # (obj_number, display_name)
    if 'wld' in r:
        onm = {s['number']: s['name'] for s in r['wld']['symbols']
               if s.get('type') == 0 and s.get('name')}
        for ob in r['wld']['objects']:
            nm = onm.get(ob['number']) or \
                (snm.get(ob['type']) if ob['type'] != 0xFFFF else None)
            if nm:
                names.append((ob['number'], nm))
    else:
        names = [(-1, n) for n in snm.values()]

    for num, nm in names:
        low = nm.lower()
        key = (num, nm)
        if key in seen:
            continue
        seen.add(key)
        matched_char = False
        for kw, ids in CHARACTERS.items():
            if kw in low:
                for sid in ids + MINIFIG_COMMON:
                    emit(num, nm, sid, f'character:{kw}')
                matched_char = True
                break
        if not matched_char and 'minifig' in low:
            for sid in MINIFIG_COMMON:
                emit(num, nm, sid, 'minifig-common')
        for kw, ids in KEYWORDS.items():
            if re.search(r'(?<![a-z])' + re.escape(kw), low):
                for sid in ids:
                    emit(num, nm, sid, f'keyword:{kw}')

    if cat == 'Brick':
        for sid in BRICK_GLOBAL:
            emit(0, f'<all bricks in {base}>', sid, 'brick-global')
    if cat == 'User':
        for sid in ENVIRONMENTALS:
            emit(0, '<world ambience>', sid, 'environmental')
    return rows


def main():
    sounds_dir, out_csv = sys.argv[1], sys.argv[2]
    wavs = load_sound_files(sounds_dir)
    with open(out_csv, 'w', newline='') as fh:
        w = csv.writer(fh)
        w.writerow(['lca_file', 'object_number', 'object_name', 'sound_id',
                    'sound_name', 'wav_file', 'match_rule'])
        total = 0
        for path in sys.argv[3:]:
            total += associate(path, wavs, w)
    print(f'{out_csv}: {total} associations across {len(sys.argv)-3} files')


if __name__ == '__main__':
    main()
