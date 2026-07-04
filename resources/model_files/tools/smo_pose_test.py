#!/usr/bin/env python3
"""
smo_pose_test.py -- validation for the SMO->rig mapping used by the
Blender add-on (Phase 1). Applies an .smo frame to a standalone
'SCL M/F' minifig rig (auto-mapped structurally, since standalone rigs
are unnamed) and exports a posed OBJ + QA render through the frozen
export path.

Pinned SMO semantics (validated against minifigkingleo01.lca whose rig
rest E_CTROTATE brees match the SMO rest pose exactly):
    brees_x = -smo_rot[4]   (pitch)
    brees_y = -smo_rot[3]   (bearing / yaw)
    brees_z = +smo_rot[5]   (roll)
    position: applied as DELTA from the clip's frame-0 rest position,
    added to the object's own authored position (rigs differ in absolute
    offsets; rotation-replace + position-delta ports a clip anywhere).

Usage: python3 smo_pose_test.py <outdir> <rig.lca> <clip.smo> <frame> [...]
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import export_obj as E
from lca_parser import parse_lca as _orig_parse
from smo_parser import parse_smo

DEG2BREE = 65536.0 / 360.0


def automap_scl_rig(objects, symbols):
    """Structural auto-map of an unnamed 'SCL M/F' rig -> SMO track names.
    Fingerprints: arms are the two groups with brees[0] ~ 45 deg (8192);
    left arm has brees[1] > 0. Hands are their child groups with
    brees ~ [0,0,-+10 deg] (lefthand bz<0). Legs are the two sibling groups
    holding a rotated bottom 'foot' child; L/R follows the arms' X side.
    hips = the shape object parenting the body chain; body/head follow it.
    """
    E.build_tree(objects)
    by_num = {ob['number']: ob for ob in objects}
    mapping = {}

    def brees(ob):
        return ob.get('rot', {}).get('brees', [0, 0, 0])

    groups = [ob for ob in objects if ob['type'] == 0xFFFF]
    arms = [ob for ob in groups if abs(abs(brees(ob)[0]) - 8192) <= 64]
    if len(arms) == 2:
        left = max(arms, key=lambda ob: brees(ob)[1])     # by > 0 = left
        right = arms[0] if arms[1] is left else arms[1]
        mapping['leftarm'], mapping['rightarm'] = left, right
        for arm, hand in ((left, 'lefthand'), (right, 'righthand')):
            for ch in arm['children']:
                for g in ([ch] + ch['children']):
                    bz = brees(g)[2]
                    if g['type'] == 0xFFFF and abs(abs(bz) - 1820) <= 64:
                        if (hand == 'lefthand') == (bz < 0):
                            mapping[hand] = g
        arm_left_x = left['pos'][0]
    else:
        arm_left_x = 0

    # legs: sibling groups each containing a rotated bottom child (foot)
    legs = []
    for ob in groups:
        feet = [ch for ch in ob['children']
                if ch.get('rot') and ch['pos'][1] < 0 and ch['type'] != 0xFFFF]
        if feet and ob.get('pos', [0, 0, 0])[1] < 0:
            legs.append((ob, feet[0]))
    if len(legs) == 2:
        # left leg is on the same X side as the left arm
        legs.sort(key=lambda lf: lf[0]['pos'][0])
        if arm_left_x <= (legs[0][0]['pos'][0] + legs[1][0]['pos'][0]) / 2:
            (lleg, lfoot), (rleg, rfoot) = legs
        else:
            (rleg, rfoot), (lleg, lfoot) = legs
        mapping['leftleg'], mapping['leftfoot'] = lleg, lfoot
        mapping['rightleg'], mapping['rightfoot'] = rleg, rfoot
        # hips: the non-group sibling of the leg groups (the hip piece),
        # which parents the body chain
        parent = next((p for p in objects
                       if lleg in p.get('children', [])), None)
        if parent:
            hips = next((ch for ch in parent['children']
                         if ch['type'] != 0xFFFF and ch is not lleg
                         and ch is not rleg and ch.get('rot')), None)
            if hips:
                mapping['hips'] = hips
                body = next((ch for ch in hips['children']
                             if ch['type'] == 0xFFFF), None)
                if body:
                    mapping['body'] = body
                    # head: first grandchild group chain under the body
                    for ch in body['children']:
                        if ch['type'] == 0xFFFF:
                            mapping['head'] = ch
                            break
    return mapping


def apply_smo_frame(path, clip, frame_idx):
    r = _orig_parse(path)
    objs = r['wld']['objects']
    mapping = automap_scl_rig(objs, r['wld']['symbols'])
    applied = []
    for tr in clip['tracks']:
        ob = mapping.get(tr['name'])
        if ob is None:
            continue
        fr = tr['frames'][min(frame_idx, len(tr['frames']) - 1)]
        rest = tr['frames'][0]
        r3, r4, r5 = fr['rot']
        bre = [int(round(-r4 * DEG2BREE)),
               int(round(-r3 * DEG2BREE)),
               int(round(r5 * DEG2BREE))]
        rot = ob.setdefault('rot', {'brees': [0, 0, 0],
                                    'center': [s // 2 for s in ob['size']]})
        rot['brees'] = bre
        delta = [fr['pos'][i] - rest['pos'][i] for i in range(3)]
        # SMO positions are authored at the master rig's shape scale
        # (100 u/mm); this rig's WLD offsets are the same scale here.
        ob['pos'] = [ob['pos'][i] + delta[i] for i in range(3)]
        applied.append(tr['name'])
    return r, applied, mapping


def main():
    outdir = sys.argv[1]
    rig = sys.argv[2]
    args = sys.argv[3:]
    os.makedirs(outdir, exist_ok=True)
    import render_obj
    while args:
        smo, frame = args[0], int(args[1])
        args = args[2:]
        clip = parse_smo(smo)
        r, applied, mapping = apply_smo_frame(rig, clip, frame)
        tag = (os.path.splitext(os.path.basename(smo))[0]
               + f'_f{frame}')
        saved = E.parse_lca
        E.parse_lca = lambda _p, _r=r: _r
        try:
            obj_path, stats = E.export_obj(rig, outdir)
        finally:
            E.parse_lca = saved
        posed = os.path.join(outdir, tag + '.obj')
        os.replace(obj_path, posed)
        mtl = obj_path[:-4] + '.mtl'
        posed_mtl = posed[:-4] + '.mtl'
        os.replace(mtl, posed_mtl)
        # patch mtllib to the renamed mtl
        txt = open(posed).read().replace(
            os.path.basename(obj_path)[:-4] + '.mtl',
            os.path.basename(posed_mtl))
        open(posed, 'w').write(txt)
        render_obj.render(posed, posed[:-4] + '.png')
        print(f'{tag}: mapped={sorted(mapping)} applied={applied} {stats}')


if __name__ == '__main__':
    main()
