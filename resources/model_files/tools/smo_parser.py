#!/usr/bin/env python3
"""
smo_parser.py -- parser for .smo character animation files
(LEGO Creator: Knights' Kingdom, Superscape VRT 5.10 era).

Format (all little-endian, no container preamble -- this is a game-side
format, NOT a native Superscape VRT/SPRT container):

    u16  numTracks        number of animated objects (bones)
    u16  numFrames        keyframe count, shared by every track
    then numTracks records:
        u16   nameLen
        char  name[nameLen]     minifig rig object name (matches the
                                world-object names in the master world:
                                hips, body, head, leftarm, righthand...)
        u16   reserved          always 0 in all observed files
        f32   frame[numFrames][6]
              [0..2] = position X, Y, Z  (VRT world units, rest pose on
                       frame 0 matches the minifig rig offsets)
              [3..5] = rotation triplet in DEGREES (VRT axis order;
                       leg swing of the run cycle lives in float [4])

Every frame stores an absolute pose sample (no deltas, no interpolation
keys) -- playback is one pose per tick.

Usage:  python smo_parser.py <outdir> file.smo [more.smo ...]
        (writes <outdir>/<name>.json for each .smo -- matches every other
        tool in this toolchain taking an explicit output directory rather
        than writing next to the source, which lives in the read-only game
        install, not this repo)
"""
import struct, sys, json, os

def parse_smo(path):
    d = open(path, 'rb').read()
    ntracks, nframes = struct.unpack_from('<HH', d, 0)
    off = 4
    tracks = []
    for _ in range(ntracks):
        (nlen,) = struct.unpack_from('<H', d, off); off += 2
        name = d[off:off+nlen].decode('ascii'); off += nlen
        (reserved,) = struct.unpack_from('<H', d, off); off += 2
        frames = []
        for f in range(nframes):
            px, py, pz, rx, ry, rz = struct.unpack_from('<6f', d, off); off += 24
            frames.append({'pos': [px, py, pz], 'rot': [rx, ry, rz]})
        tracks.append({'name': name, 'reserved': reserved, 'frames': frames})
    assert off == len(d), f'{path}: {len(d)-off} unparsed bytes'
    return {'file': os.path.basename(path), 'num_tracks': ntracks,
            'num_frames': nframes, 'tracks': tracks}

if __name__ == '__main__':
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    outdir = sys.argv[1]
    os.makedirs(outdir, exist_ok=True)
    for path in sys.argv[2:]:
        data = parse_smo(path)
        out = os.path.join(outdir, os.path.splitext(os.path.basename(path))[0] + '.json')
        json.dump(data, open(out, 'w'), indent=1)
        print(f"{data['file']}: {data['num_tracks']} tracks x {data['num_frames']} frames "
              f"-> {out}")
        print('  objects:', ', '.join(t['name'] for t in data['tracks']))
