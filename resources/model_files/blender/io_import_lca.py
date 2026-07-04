# -*- coding: utf-8 -*-
bl_info = {
    'name': 'Import LEGO Creator Knights\' Kingdom (.lca) + SMO animation',
    'author': 'KK reverse-engineering toolchain',
    'version': (1, 0, 0),
    'blender': (3, 0, 0),
    'location': 'File > Import > LEGO Creator KK (.lca) / KK Animation (.smo)',
    'description': 'Imports Superscape VRT .lca models (n-gon facets, '
                   'hierarchy, hidden LODs, palette/texture materials, '
                   'cel shape keys) and .smo character animation clips',
    'category': 'Import-Export',
}

import math
import os
import struct
import zlib

try:
    import bpy
    from bpy_extras.io_utils import ImportHelper
except ImportError:            # mock-harness / offline analysis
    bpy = None
    ImportHelper = object

# ===========================================================================
# Embedded frozen parser (lca_parser.py) -- spliced verbatim at build time.
SC_POINTS, SC_LINES, SC_FACETS, SC_COLOURS, SC_LITCOLS, SC_TEXT, \
    SC_SIZE, SC_SCL, SC_ANIMCOLS, SC_TEXTURES, SC_SPRTRANS, SC_NORMALS = range(12)
SC_NAMES = ['POINTS', 'LINES', 'FACETS', 'COLOURS', 'LITCOLS', 'TEXT',
            'SIZE', 'SCL', 'ANIMCOLS', 'TEXTURES', 'SPRTRANS', 'NORMALS']

CT_STANDARD, CT_COLOURS, CT_PROPERTIES = 0x00, 0x01, 0x1F
CT_INITSIZE, CT_INITPOS = 0x0F, 0x15

PNT_TYPEMASK, PNT_DYNAMIC = 0x0007, 0x8000
PNT_ABS, PNT_REL, PNT_GEOM, PNT_UAB = 0, 1, 2, 3


def u16(b, o): return struct.unpack_from('<H', b, o)[0]
def s16(b, o): return struct.unpack_from('<h', b, o)[0]
def u32(b, o): return struct.unpack_from('<I', b, o)[0]


def cstr(b):
    i = b.find(b'\0')
    return (b[:i] if i >= 0 else b).decode('latin-1')


# ==========================================================================
def destream(data):
    """Remove the 4-byte check words the VCA archiver inserts after every
    1000 bytes of stream (stream starts at file offset 0x54).  Returns the
    pristine VCA stream."""
    out = bytearray()
    p = 0x54
    while p < len(data):
        take = data[p:p + 1000]
        out += take
        p += 1000
        if p + 4 <= len(data):
            stored = struct.unpack_from('<i', data, p)[0]
            calc = sum(b - 256 if b > 127 else b for b in take)
            if len(take) == 1000 and stored != calc:
                raise ValueError(
                    f'checksum mismatch @{p:#x}: stored {stored} != {calc}')
            p += 4
    return bytes(out)


def split_container(data):
    stream = destream(data)
    # VCA directory at stream 0xF4: ".VRT\0\0" ver(u32) fmt(u16) count(u16)
    assert stream[0xF4:0xF8] == b'.VRT', stream[0xF0:0x100]
    count = u16(stream, 0x100)
    o = 0x102
    entries = []
    for _ in range(count):
        name = cstr(stream[o:o + 14])
        off, ln = struct.unpack_from('<II', stream, o + 14)
        entries.append((name, off, ln))
        o += 22
    subs = {}
    for name, off, ln in entries:
        blob = stream[off:off + ln]
        for sig in (b'SHAP', b'PALT', b'WRLD'):
            p = blob.find(sig)
            if 0 <= p:
                subs[sig.decode()] = blob[p:]
                break
    hdr = {'app': cstr(data[0:0x20]), 'category': cstr(data[0x20:0x40]),
           'directory': entries}
    return hdr, subs


# ==========================================================================
def plausible_flags(w):
    """Point flags word: type bits 0-2, anim mask bits 3-5, dynamic bit 15."""
    return (w & 0x7FC0) == 0


def parse_points_chunk(b, o):
    npts, ncels = u16(b, o + 4), u16(b, o + 6)
    pts, p, junk = [], o + 8, []
    for _ in range(npts):
        flags = u16(b, p)
        if not plausible_flags(flags) and b[p + 2:p + 4] == b'\x00\x00':
            junk.append(p)                       # junk before the record
            p += 4
            flags = u16(b, p)
        p += 2
        ptype = flags & PNT_TYPEMASK
        npos = ncels if (flags & PNT_DYNAMIC) else 1

        def read_positions(q):
            out = []
            for _ in range(npos):
                if ptype == PNT_GEOM:
                    out.append({'p1': s16(b, q), 'p2': s16(b, q + 2),
                                'shift': b[q + 4], 'mult': b[q + 5]})
                else:
                    out.append([s16(b, q), s16(b, q + 2), s16(b, q + 4)])
                q += 6
            return out, q

        positions, p2 = read_positions(p)
        # junk between flags and coords: detect via next record's flags
        if (p2 + 2 <= len(b) and not plausible_flags(u16(b, p2))
                and b[p + 2:p + 4] == b'\x00\x00'
                and p + 6 <= len(b) and plausible_flags(u16(b, p2 + 4))):
            junk.append(p)
            positions, p2 = read_positions(p + 4)
        pts.append({'flags': flags, 'type': ptype, 'pos': positions})
        p = p2
    return {'ncels': ncels, 'points': pts, 'consumed': p - o, 'junk': junk}


def parse_facets_chunk(b, o, nlines):
    nfac = u16(b, o + 4)
    facets, p, junk = [], o + 6, []

    def try_read(q, allow_inner_skip=True):
        if q + 4 > len(b):
            return None
        nl, att = b[q], b[q + 1]
        if nl == 0 or nl > 64:
            return None
        skip = 0
        num = u16(b, q + 2)
        if num > 4096 and allow_inner_skip and b[q + 4:q + 6] == b'\x00\x00':
            skip = 4                              # junk after (NL, FacAtt)
            num = u16(b, q + 2 + skip)
        if num > 4096:
            return None
        base = q + 4 + skip
        if base + 2 * nl > len(b):
            return None
        idxs = [u16(b, base + 2 * i) for i in range(nl)]
        if (not (att & 0x10)) and nlines \
                and any((w & 0x7FFF) >= nlines for w in idxs):
            return None                          # 0x10 = E_FACSPECIAL (mesh)
        return (nl, att, num, idxs, base + 2 * nl, skip)

    for _ in range(nfac):
        r, s = try_read(p), 0
        while r is None and s < 8:                # junk before the record
            s += 2
            r = try_read(p + s, allow_inner_skip=False)
        if r is None:
            break
        if s:
            junk.append(p)
        nl, att, num, idxs, nxt, skip = r
        if skip:
            junk.append(p + 2)
        facets.append({'natt': att, 'number': num,
                       'lines': [(x & 0x7FFF, bool(x & 0x8000)) for x in idxs]})
        p = nxt
    return facets, p - o, junk


def parse_symbols(b, o):
    syms = []
    while o + 4 <= len(b):
        t = u16(b, o)
        if t == 0xFFFF:
            o += 2
            continue
        ln = u16(b, o + 2)
        if ln != 38 or o + ln > len(b):
            break
        syms.append({'type': t, 'number': s16(b, o + 4),
                     'name': cstr(b[o + 6:o + 38]).strip()})
        o += ln
    return syms


def parse_shp(shp):
    rev, ver = u32(shp, 6), u16(shp, 10)
    defsize = list(struct.unpack_from('<III', shp, 16))
    o = 28
    shapes, cur, warnings = [], None, []
    last_points, last_lines = None, None

    def flush():
        nonlocal cur
        shapes.append(cur if cur is not None else {})
        cur = None

    end_of_shapes = None
    while o + 2 <= len(shp):
        t = u16(shp, o)
        if t == 0xFFFF:
            o += 2
            flush()
            if o + 2 <= len(shp) and u16(shp, o) == 0xFFFF:
                o += 2
                end_of_shapes = o
                break
            continue
        if o + 4 > len(shp):
            break
        ct, ln = t, u16(shp, o + 2)
        if ct >= len(SC_NAMES) or ln < 4:
            warnings.append(f'desync @+{o:#x}: {shp[o:o+12].hex(" ")}')
            break
        if cur is None:
            cur = {}
        if ct == SC_POINTS:
            pc = parse_points_chunk(shp, o)
            cur['ncels'] = pc['ncels']
            cur['points'] = pc['points']
            last_points = pc['points']
            if pc['junk']:
                warnings.append(
                    f'points junk @{[hex(j) for j in pc["junk"]]}')
            o += pc['consumed']
            continue
        elif ct == SC_LINES:
            n = u16(shp, o + 4)
            npts = 8 + len(cur.get('points', last_points or []))
            pairs, p, junked = [], o + 6, []
            while len(pairs) < n and p + 4 <= len(shp):
                a, b2 = u16(shp, p), u16(shp, p + 2)
                if (a >= npts or b2 >= npts) and shp[p + 2:p + 4] == b'\x00\x00':
                    junked.append(p)              # 4-byte junk = one slot
                    p += 4
                    continue
                pairs.append((a, b2))
                p += 4
            cur['lines'] = pairs
            last_lines = pairs
            if junked:
                warnings.append(f'lines junk @{[hex(j) for j in junked]}')
                o = p
                continue
        elif ct == SC_FACETS:
            nlines = len(cur.get('lines', []))
            if not nlines:                        # LOD shape reusing lines?
                for prev in reversed(shapes):
                    if prev.get('lines'):
                        nlines = len(prev['lines'])
                        break
            facets, consumed, junk = parse_facets_chunk(shp, o, nlines)
            cur['facets'] = facets
            if junk:
                warnings.append(f'facets junk @{[hex(j) for j in junk]}')
            o += consumed
            continue
        elif ct == SC_COLOURS:
            cur['colours'] = list(shp[o + 4:o + ln])
        elif ct == SC_SIZE:
            cur['size'] = list(struct.unpack_from('<iii', shp, o + 4))
        elif ct == SC_TEXT:
            cur['text'] = shp[o + 4:o + ln].split(b'\0')[0].decode('latin-1')
        elif ct == SC_SCL:
            cur['scl_len'] = ln
        else:
            cur.setdefault('other', []).append({'type': SC_NAMES[ct], 'len': ln})
        o += ln

    symbols = parse_symbols(shp, end_of_shapes if end_of_shapes else o)
    return {'revision': rev, 'version': f'{ver & 0xff}.{ver >> 8:02x}',
            'defsize': defsize, 'shapes': shapes, 'symbols': symbols,
            'warnings': warnings}


# ==========================================================================
def parse_pal(pal):
    rgb = pal[18:18 + 768]
    return [[rgb[i], rgb[i + 1], rgb[i + 2]] for i in range(0, len(rgb), 3)]


# ==========================================================================
STD_FMT = '<HHHHiiIIHiiiiiiiHHIIH'


def parse_wld(wld):
    o = 12
    objects, order = {}, []
    warnings = []
    while o + 4 <= len(wld):
        t = u16(wld, o)
        if t == 0xFFFF:
            o += 2
            if o + 2 <= len(wld) and u16(wld, o) == 0xFFFF:
                o += 2
                break
            continue
        ct, ln = t, u16(wld, o + 2)
        if ln < 4 or o + ln > len(wld):
            warnings.append(f'wld desync @+{o:#x}: {wld[o:o+12].hex(" ")}')
            break
        if ct == CT_STANDARD and ln >= 0x44:
            f = struct.unpack_from(STD_FMT, wld, o)
            (_c, _l, totlen, number, child, sibling, _p, _q, _maxchunk,
             xs, ys, zs, xp, yp, zp, _diag, typ, layer, dflags, oflags,
             _trig) = f
            obj = {'offset': o, 'number': number, 'totlen': totlen,
                   'child': child, 'sibling': sibling,
                   'size': [xs, ys, zs], 'pos': [xp, yp, zp],
                   'type': typ, 'layer': layer,
                   'dflags': dflags, 'oflags': oflags, 'chunks': {}}
            objects[o] = obj
            order.append(o)
        elif order:
            cur = objects[order[-1]]
            if ct == CT_COLOURS:
                cur['chunks']['colours'] = list(wld[o + 4:o + ln])
            elif ct == CT_PROPERTIES:
                cur['chunks']['properties'] = [
                    s.decode('latin-1')
                    for s in wld[o + 4:o + ln].split(b'\0') if s]
            elif ct == CT_INITPOS:
                cur['chunks']['initpos'] = \
                    list(struct.unpack_from('<iii', wld, o + 4))
            elif ct == CT_INITSIZE:
                cur['chunks']['initsize'] = \
                    list(struct.unpack_from('<iii', wld, o + 4))
            elif ct == 0x0003 and ln >= 30:      # E_CTROTATIONS
                ax, ay, az = struct.unpack_from('<hhh', wld, o + 4)
                cx, cy, cz = struct.unpack_from('<iii', wld, o + 18)
                cur['rot'] = {'brees': [ax, ay, az],
                              'center': [cx, cy, cz]}
            else:
                cur['chunks'].setdefault('other', []).append([ct, ln])
        o += ln

    symbols = parse_symbols(wld, o)
    return {'objects': [objects[k] for k in order], 'symbols': symbols,
            'warnings': warnings}


# ==========================================================================
def resolve_points(shape, inherited, inherited_size):
    """-> (points list [x,y,z] floats in local units, size) for cel 0."""
    size = shape.get('size') or inherited_size or [10000, 10000, 10000]
    sx, sy, sz = size
    if 'points' not in shape:
        if inherited is not None:
            return inherited, size
        return [[(sx if i & 4 else 0), (sy if i & 2 else 0),
                 (sz if i & 1 else 0)] for i in range(8)], size
    out = [[(sx if i & 4 else 0), (sy if i & 2 else 0),
            (sz if i & 1 else 0)] for i in range(8)]
    for pt in shape['points']:
        pos = pt['pos'][0]
        if pt['type'] == PNT_GEOM:
            p1, p2 = out[pos['p1']], out[pos['p2']]
            fr = pos['mult'] / (1 << pos['shift']) if pos['shift'] < 31 else 0.0
            out.append([p1[i] + (p2[i] - p1[i]) * fr for i in range(3)])
        elif pt['type'] == PNT_ABS:
            out.append([float(v) for v in pos])
        else:                                     # REL / UAB
            out.append([sx * (pos[0] & 0xFFFF) / 16384.0,
                        sy * (pos[1] & 0xFFFF) / 16384.0,
                        sz * (pos[2] & 0xFFFF) / 16384.0])
    return out, size


def facet_to_loop(facet, lines):
    edges = []
    for idx, rev in facet['lines']:
        if idx >= len(lines):
            return None
        a, b = lines[idx]
        edges.append((b, a) if rev else (a, b))
    if len(edges) < 3:
        return None
    loop = [edges[0][0], edges[0][1]]
    rest = list(edges[1:])
    while rest:
        for k, (a, b) in enumerate(rest):
            if a == loop[-1]:
                loop.append(b); rest.pop(k); break
            if b == loop[-1]:
                loop.append(a); rest.pop(k); break
        else:
            return None
    if loop[0] == loop[-1]:
        loop.pop()
    return loop


# ==========================================================================
def parse_lca(path):
    data = open(path, 'rb').read()
    hdr, subs = split_container(data)
    result = {'file': path.split('/')[-1], 'header': hdr,
              'subfiles': list(subs)}
    if 'SHAP' in subs:
        result['shp'] = parse_shp(subs['SHAP'])
    if 'PALT' in subs:
        result['pal'] = parse_pal(subs['PALT'])
    if 'WRLD' in subs:
        result['wld'] = parse_wld(subs['WRLD'])
    return result

# ===========================================================================

# ===========================================================================
# WLD texture/material chunk decode (from export_textured.py, verbatim math)
# ===========================================================================

def texspecs(wld):
    """Per-object-number texture specs / translate / litcols / materials."""
    import collections
    o, cur = 12, None
    specs = collections.defaultdict(list)
    trans = {}
    litcols = {}
    materials = {}
    while o + 4 <= len(wld):
        t = struct.unpack_from('<H', wld, o)[0]
        if t == 0xFFFF:
            o += 2
            if o + 2 <= len(wld) and \
                    struct.unpack_from('<H', wld, o)[0] == 0xFFFF:
                break
            continue
        ln = struct.unpack_from('<H', wld, o + 2)[0]
        if ln < 4 or o + ln > len(wld):
            break
        if t == 0x0000 and ln >= 0x44:
            cur = struct.unpack_from('<H', wld, o + 6)[0]
        elif t == 0x20 and cur is not None:                # TEXCOORDS
            nt = struct.unpack_from('<H', wld, o + 4)[0]
            p = o + 8
            for _ in range(nt):
                if p + 20 > o + ln:
                    break
                (fac, npt, tex, _it, _tsc, _its, _sx, _sy, _ox, _oy) = \
                    struct.unpack_from('<HHhhhhhhhh', wld, p)
                if p + 20 + 8 * npt > o + ln:
                    break
                uv = struct.unpack_from('<%df' % (2 * npt), wld, p + 20)
                specs[cur].append(
                    {'facet': fac, 'tex': tex,
                     'uv': [(uv[2 * i], uv[2 * i + 1]) for i in range(npt)]})
                p += 20 + 8 * npt
        elif t == 0x1C and cur is not None:                # SPRTRANS
            n = struct.unpack_from('<H', wld, o + 4)[0]
            n = min(n, (ln - 6) // 2)
            trans[cur] = list(struct.unpack_from('<%dH' % n, wld, o + 6))
        elif t == 0x17 and cur is not None:                # LITCOLS
            litcols[cur] = list(wld[o + 4:o + ln])
        elif t == 0x23 and cur is not None:                # MATERIAL
            shin, _is, tr, _it = struct.unpack_from('<4B', wld, o + 4)
            materials[cur] = (shin, tr)
        o += ln
    return specs, trans, litcols, materials


# ===========================================================================
# Pure-python 3x3 math (no mathutils, so the mock harness runs everywhere)
# ===========================================================================

def m_identity():
    return [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]


def m_mul(a, b):
    return [[sum(a[i][k] * b[k][j] for k in range(3)) for j in range(3)]
            for i in range(3)]


def m_vec(m, v):
    return [m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
            m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
            m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]]


def m_transpose(m):
    return [[m[j][i] for j in range(3)] for i in range(3)]


def rot_from_brees(brees):
    """VRT rotation, applied Y (bearing), X (pitch), Z (roll). Verbatim
    math from the frozen exporter (260+ validated conversions)."""
    rx, ry, rz = [b * 2.0 * math.pi / 65536.0 for b in brees]
    cx, sx = math.cos(rx), math.sin(rx)
    cy, sy = math.cos(ry), math.sin(ry)
    cz, sz = math.cos(rz), math.sin(rz)
    RX = [[1, 0, 0], [0, cx, -sx], [0, sx, cx]]
    RY = [[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]]
    RZ = [[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]]
    return m_mul(RY, m_mul(RX, RZ))


def rot_from_smo_degrees(r3, r4, r5):
    """SMO rotation triplet -> VRT matrix. Empirically pinned against the
    'SCL M/F' rig whose rest E_CTROTATE brees match SMO frame 0 exactly:
    brees_x = -rot[4] (pitch), brees_y = -rot[3] (bearing),
    brees_z = +rot[5] (roll). Validated by run-cycle stride direction and
    the attention arm-raise (see smo_pose_test.py)."""
    k = 65536.0 / 360.0
    return rot_from_brees([-r4 * k, -r3 * k, r5 * k])


# KK content is authored +Y-up in VRT world space (verified: minifig
# head at larger Y than feet; template terrain mass at low Y).  VRT ->
# Blender (Z up): (x, z, y).  det = -1: a single mirror, matching the
# frozen OBJ path's handedness treatment (winding reversed once below).
C_MAT = [[1.0, 0.0, 0.0], [0.0, 0.0, 1.0], [0.0, 1.0, 0.0]]
C_T = m_transpose(C_MAT)
SCALE = 1.0e-6                 # 1 WLD unit = 0.001 mm = 1e-6 m


def conj_rot(R):
    """Blender-space rotation = C R C^T (stays a proper rotation)."""
    return m_mul(C_MAT, m_mul(R, C_T))


def conv_vec(v, scale=SCALE):
    w = m_vec(C_MAT, v)
    return (w[0] * scale, w[1] * scale, w[2] * scale)


def mat_to_quat(m):
    """3x3 proper rotation -> (w, x, y, z), Shepperd's method."""
    t = m[0][0] + m[1][1] + m[2][2]
    if t > 0:
        s = math.sqrt(t + 1.0) * 2
        return (0.25 * s, (m[2][1] - m[1][2]) / s,
                (m[0][2] - m[2][0]) / s, (m[1][0] - m[0][1]) / s)
    if m[0][0] > m[1][1] and m[0][0] > m[2][2]:
        s = math.sqrt(1.0 + m[0][0] - m[1][1] - m[2][2]) * 2
        return ((m[2][1] - m[1][2]) / s, 0.25 * s,
                (m[0][1] + m[1][0]) / s, (m[0][2] + m[2][0]) / s)
    if m[1][1] > m[2][2]:
        s = math.sqrt(1.0 + m[1][1] - m[0][0] - m[2][2]) * 2
        return ((m[0][2] - m[2][0]) / s, (m[0][1] + m[1][0]) / s,
                0.25 * s, (m[1][2] + m[2][1]) / s)
    s = math.sqrt(1.0 + m[2][2] - m[0][0] - m[1][1]) * 2
    return ((m[1][0] - m[0][1]) / s, (m[0][2] + m[2][0]) / s,
            (m[1][2] + m[2][1]) / s, 0.25 * s)


# ===========================================================================
# Sprite bank (.spr / .xvr) -> Blender images.  SPRT layout per
# sprite_dump.py (byte-exact, verified on the 310-sprite global bank).
# ===========================================================================

class SpriteBank:
    def __init__(self, path, fallback_palette=None):
        d = open(path, 'rb').read()
        if d[:3] in (b'XVR', b'SVR'):
            d = zlib.decompressobj(-15).decompress(d[3:])
        j = d.find(b'SPRT')
        if j == -1:
            raise ValueError('no SPRT bank in ' + path)
        pre = d.rfind(b'SuperScape (c)', 0, j)
        self.body = d[pre:] if pre != -1 else d
        j = self.body.find(b'SPRT')
        self.count = struct.unpack_from('<H', self.body, j + 12)[0]
        self.table = j + 14
        g = d.find(b'PALT')                       # global palette, if bound
        if g != -1:
            rgb = d[g + 16:g + 16 + 768]
            self.global_pal = [tuple(rgb[3 * i:3 * i + 3])
                               for i in range(256)]
        else:
            self.global_pal = fallback_palette or [(200, 200, 200)] * 256
        self._cache = {}

    def pixels(self, k):
        """-> (w, h, [ (r,g,b) rows top-down ]) or None."""
        if k in self._cache:
            return self._cache[k]
        if not (0 <= k < self.count):
            return None
        w, h, off = struct.unpack_from('<HHI', self.body,
                                       self.table + 8 * k)
        rw, rh = w & 0x3FFF, h & 0x3FFF
        if not (0 < rw <= 4096 and 0 < rh <= 4096):
            return None
        src = off + (4 if w & 0x4000 else 0)
        px = self.body[src:src + rw * rh]
        if len(px) < rw * rh:
            return None
        if (h & 0x4000) and (h & 0x8000):          # attached AND used
            p = self.body[src + rw * rh:src + rw * rh + 768]
            pal = [tuple(p[3 * i:3 * i + 3]) for i in range(256)] \
                if len(p) == 768 else self.global_pal
        else:
            pal = self.global_pal
        out = (rw, rh, [pal[b] for b in px])
        self._cache[k] = out
        return out

    def bpy_image(self, k):
        got = self.pixels(k)
        if got is None:
            return None
        rw, rh, rgb = got
        name = 'spr%03d' % k
        img = bpy.data.images.get(name)
        if img is not None:
            return img
        img = bpy.data.images.new(name, rw, rh, alpha=True)
        flat = [0.0] * (rw * rh * 4)
        for y in range(rh):                        # flip: bpy rows bottom-up
            srow = (rh - 1 - y) * rw
            drow = y * rw * 4
            for x in range(rw):
                r, g, b = rgb[srow + x]
                i = drow + x * 4
                flat[i] = r / 255.0
                flat[i + 1] = g / 255.0
                flat[i + 2] = b / 255.0
                flat[i + 3] = 1.0
        img.pixels = flat
        try:
            img.pack()
        except Exception:
            pass
        return img


# ===========================================================================
# Point resolution (cel-aware variant of the frozen exporter's
# resolve_points_scaled -- identical for cel 0)
# ===========================================================================

def resolve_points_cel(shape, size, cel, fallback_points):
    sx, sy, sz = size
    cube = [[(sx if i & 4 else 0.0), (sy if i & 2 else 0.0),
             (sz if i & 1 else 0.0)] for i in range(8)]
    if 'points' not in shape:
        return fallback_points if fallback_points is not None else cube
    out = list(cube)
    for pt in shape['points']:
        pos = pt['pos'][min(cel, len(pt['pos']) - 1)]
        if pt['type'] == PNT_GEOM:
            p1, p2 = out[pos['p1']], out[pos['p2']]
            fr = pos['mult'] / float(1 << pos['shift'])
            out.append([p1[i] + (p2[i] - p1[i]) * fr for i in range(3)])
        elif pt['type'] == PNT_ABS:
            out.append([float(v) for v in pos])
        else:                                     # REL / UAB
            out.append([sx * pos[0] / 16384.0,
                        sy * pos[1] / 16384.0,
                        sz * pos[2] / 16384.0])
    return out


def build_tree(objects):
    by_off = {ob['offset']: ob for ob in objects}
    for ob in objects:
        ob['children'] = []
    for ob in objects:
        c = ob['child']
        if c:
            child = by_off.get(ob['offset'] + c)
            while child:
                ob['children'].append(child)
                s = child['sibling']
                child = by_off.get(child['offset'] + s) if s else None
    return by_off


E_OFINVISIBLE = 0x80000000
E_OFINVISDEF = 0x40000000
TICKS_PER_SEC = 20.0           # project-standard AniVel assumption


def _flat(ob):
    xs, ys, zs = ob['size']
    return ys <= 10 and (xs >= 20000 or zs >= 20000)


def apply_flat_plane_rules(r):
    """Template rule for 'User' files (hide nested helper flats, keep
    root-parented terrain); classic ground-plane rule otherwise. Flats are
    HIDDEN, not skipped -- the add-on imports everything."""
    if 'wld' not in r:
        return
    objs = r['wld']['objects']
    if not objs:
        return
    if r['header'].get('category') == 'User':
        root_num = objs[0]['number']
        parent = {}
        by_off = {ob['offset']: ob for ob in objs}
        for ob in objs:
            c = ob['child']
            if c:
                ch = by_off.get(ob['offset'] + c)
                while ch:
                    parent[ch['number']] = ob['number']
                    s = ch['sibling']
                    ch = by_off.get(ch['offset'] + s) if s else None
        for ob in objs:
            if _flat(ob) and parent.get(ob['number']) != root_num:
                ob['oflags'] |= E_OFINVISIBLE
    else:
        for ob in objs:
            if _flat(ob):
                ob['oflags'] |= E_OFINVISIBLE


# ===========================================================================
# LCA import core
# ===========================================================================

def do_import(context, filepath, bank_path='', want_hidden=True,
              want_anim=True):
    r = parse_lca(filepath)
    apply_flat_plane_rules(r)
    name = os.path.splitext(os.path.basename(filepath))[0]
    shp = r['shp']
    shapes = shp['shapes']
    pal = r.get('pal') or [[200, 200, 200]] * 256
    shape_names = {s['number']: s['name'] for s in shp['symbols']
                   if s.get('name')}
    objects = r['wld']['objects'] if 'wld' in r else []
    obj_names = {}
    if 'wld' in r:
        for s in r['wld']['symbols']:
            if s.get('type') == 0 and s.get('name'):
                obj_names.setdefault(s['number'], s['name'])
    build_tree(objects)

    raw = open(filepath, 'rb').read()
    _hdr, subs = split_container(raw)
    specs, trans, litcols, materials = (
        texspecs(subs['WRLD']) if 'WRLD' in subs else ({}, {}, {}, {}))

    bank = None
    if bank_path:
        try:
            bank = SpriteBank(bank_path,
                              [tuple(c) for c in pal])
        except Exception as exc:
            print('LCA import: texture bank unavailable:', exc)

    coll = bpy.data.collections.new(name)
    context.scene.collection.children.link(coll)
    fps = context.scene.render.fps if context else 25
    mat_cache = {}

    def get_material(kind, key, shin=0, transp=0):
        ck = (kind, key, shin, transp)
        if ck in mat_cache:
            return mat_cache[ck]
        if kind == 'tex':
            mname = 'tex%03d' % key
        else:
            mname = '%s%03d' % (kind, key)
        if shin or transp:
            mname += '_s%dt%d' % (shin, transp)
        mat = bpy.data.materials.new(mname)
        mat.use_nodes = True
        tree = mat.node_tree
        bsdf = next(n for n in tree.nodes if n.type == 'BSDF_PRINCIPLED')
        rough = max(0.05, 1.0 - (shin / 255.0) * 0.9)
        bsdf.inputs['Roughness'].default_value = rough
        alpha = 1.0 - transp / 255.0
        if kind == 'tex' and bank is not None:
            img = bank.bpy_image(key)
            if img is not None:
                texnode = tree.nodes.new('ShaderNodeTexImage')
                texnode.image = img
                # shipped .lca facet refs modulate with WHITE (validated
                # exporter writes Kd 1 1 1) -- plain texture output
                tree.links.new(texnode.outputs['Color'],
                               bsdf.inputs['Base Color'])
            else:
                bsdf.inputs['Base Color'].default_value = (1, 0, 1, 1)
        else:
            rgb = pal[key] if key < len(pal) else (200, 200, 200)
            bsdf.inputs['Base Color'].default_value = (
                rgb[0] / 255.0, rgb[1] / 255.0, rgb[2] / 255.0, 1.0)
        if alpha < 1.0:
            bsdf.inputs['Alpha'].default_value = alpha
            mat.blend_method = 'BLEND'
        mat_cache[ck] = mat
        return mat

    stats = {'meshes': 0, 'empties': 0, 'hidden': 0, 'tex_faces': 0,
             'shape_key_objects': 0, 'materials': 0, 'images': 0}

    def stamp(bobj, ob):
        """Custom properties driving the SMO operator's rig auto-map."""
        bobj['lca_number'] = ob['number']
        bobj['lca_type'] = ob['type']
        bobj['lca_pos'] = list(ob['pos'])
        bobj['lca_size'] = list(ob['size'])
        rot = ob.get('rot')
        bobj['lca_brees'] = list(rot['brees']) if rot else [0, 0, 0]
        bobj['lca_center'] = list(rot['center']) if rot else \
            [s // 2 for s in ob['size']]

    def make_mesh(ob, typ, center, hidden):
        shape = shapes[typ + 1]
        lines = shape.get('lines')
        fallback_pts = None
        if 'points' not in shape or lines is None:
            idx = typ + 1
            for prev in reversed(shapes[:idx]):
                if fallback_pts is None and prev.get('points'):
                    fallback_pts = resolve_points_cel(
                        prev, ob['size'], 0, None)
                if lines is None and prev.get('lines'):
                    lines = prev['lines']
                if fallback_pts is not None and lines is not None:
                    break
        lines = lines or []
        pts = resolve_points_cel(shape, ob['size'], 0, fallback_pts)
        verts = [conv_vec([p[0] - center[0], p[1] - center[1],
                           p[2] - center[2]]) for p in pts]

        my_specs = {s['facet']: s for s in specs.get(ob['number'], [])}
        my_trans = trans.get(ob['number'])
        ocols = ob['chunks'].get('colours')
        scols = shape.get('colours') or []
        shin, transp = materials.get(ob['number'], (0, 0))

        faces, face_mats, face_uvs = [], [], []
        for f in shape.get('facets', []):
            loop = facet_to_loop(f, lines)
            if loop is None or len(loop) < 3:
                continue
            num = f['number']
            spec = my_specs.get(num)
            gref = None
            if spec:
                gref = spec['tex']
                if my_trans:
                    gref = my_trans[gref] \
                        if 0 <= gref < len(my_trans) else None
            rloop = list(reversed(loop))           # mirror -> flip winding
            if spec and gref and len(spec['uv']) == len(loop):
                mat = get_material('tex', gref, shin, transp)
                uv = [(u, 1.0 - v) for (u, v) in reversed(spec['uv'])]
                stats['tex_faces'] += 1
            else:
                ci = None
                if ocols and 1 <= num <= len(ocols):
                    ci = ocols[num - 1]
                elif scols and 1 <= num <= len(scols):
                    ci = scols[num - 1]
                if ci is None:
                    ci = 7
                mat = get_material('pal', ci, shin, transp)
                uv = None
            faces.append(rloop)
            face_mats.append(mat)
            face_uvs.append(uv)
        if not faces:
            return None

        mesh = bpy.data.meshes.new('m')
        mesh.from_pydata(verts, [], faces)
        mesh.update()
        mat_index = {}
        for mat in face_mats:
            if mat.name not in mat_index:
                mesh.materials.append(mat)
                mat_index[mat.name] = len(mat_index)
        for pi, mat in enumerate(face_mats):
            mesh.polygons[pi].material_index = mat_index[mat.name]
        if any(uv for uv in face_uvs):
            layer = mesh.uv_layers.new(name='UVMap')
            li = 0
            for pi, face in enumerate(faces):
                uv = face_uvs[pi]
                for k in range(len(face)):
                    if uv:
                        layer.data[li].uv = uv[k]
                    li += 1
        return mesh

    def add_shape_keys(bobj, ob, typ):
        shape = shapes[typ + 1]
        ncels = shape.get('ncels') or 1
        if ncels <= 1 or 'points' not in shape:
            return
        center = [float(c) for c in bobj['lca_center']]
        basis = bobj.shape_key_add(name='Basis', from_mix=False)
        step = fps / TICKS_PER_SEC
        for cel in range(1, ncels):
            pts = resolve_points_cel(shape, ob['size'], cel, None)
            key = bobj.shape_key_add(name='cel%02d' % cel, from_mix=False)
            n = min(len(key.data), len(pts))
            for i in range(n):
                p = pts[i]
                key.data[i].co = conv_vec([p[0] - center[0],
                                           p[1] - center[1],
                                           p[2] - center[2]])
            # one-hot looping cycle, constant interpolation
            for cyc in range(2):
                base = 1 + cyc * ncels * step
                for at, val in ((base + (cel - 1) * step, 0.0),
                                (base + cel * step, 1.0),
                                (base + (cel + 1) * step, 0.0)):
                    key.value = val
                    key.keyframe_insert('value', frame=at)
        stats['shape_key_objects'] += 1

    def emit(ob, parent_bobj, parent_center, hidden):
        hidden = hidden or bool(ob['oflags'] &
                                (E_OFINVISIBLE | E_OFINVISDEF))
        if hidden and not want_hidden:
            return
        rot = ob.get('rot')
        if rot:
            c = [float(v) for v in rot['center']]
        else:
            c = [s / 2.0 for s in ob['size']]
        if rot and any(rot['brees']):
            R = rot_from_brees(rot['brees'])
        else:
            R = m_identity()
        typ = ob['type']
        wname = obj_names.get(ob['number'])
        sname = shape_names.get(typ) if typ != 0xFFFF else None
        label = '%03d_%s' % (ob['number'],
                             wname or sname or
                             ('shape%d' % typ if typ != 0xFFFF else 'group'))
        label = ''.join(ch if ch.isalnum() or ch in '-._ ' else '_'
                        for ch in label)

        mesh = None
        if typ != 0xFFFF and typ + 1 < len(shapes) and shapes[typ + 1]:
            mesh = make_mesh(ob, typ, c, hidden)
        bobj = bpy.data.objects.new(label, mesh)
        coll.objects.link(bobj)
        stats['meshes' if mesh else 'empties'] += 1
        if mesh is None:
            bobj.empty_display_size = 0.005

        # local frame: origin at (pos + centre), relative to the parent's
        # own centre-shifted origin
        loc_vrt = [ob['pos'][i] + c[i] - parent_center[i] for i in range(3)]
        bobj.location = conv_vec(loc_vrt)
        bobj.rotation_mode = 'QUATERNION'
        bobj.rotation_quaternion = mat_to_quat(conj_rot(R))
        if parent_bobj is not None:
            bobj.parent = parent_bobj
        stamp(bobj, ob)
        if hidden:
            bobj.hide_viewport = True
            bobj.hide_render = True
            stats['hidden'] += 1
        if mesh is not None and want_anim:
            add_shape_keys(bobj, ob, typ)
        for ch in ob['children']:
            emit(ch, bobj, c, hidden)
        return bobj

    root_bobj = None
    if objects:
        root = dict(objects[0])
        root['pos'] = [0, 0, 0]
        root['children'] = objects[0]['children']
        root_bobj = emit(root, None, [0.0, 0.0, 0.0], False)
        root_bobj.name = name
    stats['materials'] = len(mat_cache)
    stats['images'] = len([1 for k in mat_cache if k[0] == 'tex'])
    return root_bobj, stats


# ===========================================================================
# SMO clip import
# ===========================================================================

def parse_smo(path):
    d = open(path, 'rb').read()
    ntracks, nframes = struct.unpack_from('<HH', d, 0)
    off = 4
    tracks = []
    for _ in range(ntracks):
        (nlen,) = struct.unpack_from('<H', d, off); off += 2
        nm = d[off:off + nlen].decode('ascii'); off += nlen
        off += 2                                   # reserved u16 (0)
        frames = []
        for _f in range(nframes):
            frames.append(struct.unpack_from('<6f', d, off)); off += 24
        tracks.append((nm, frames))
    return nframes, tracks


def _brees_prop(bobj):
    return list(bobj.get('lca_brees', [0, 0, 0]))


def automap_scl_rig(root_bobj):
    """Structural auto-map of an unnamed 'SCL M/F' rig, driven from the
    lca_* custom properties stamped at import. Fingerprints validated on
    minifigkingleo01.lca (see smo_pose_test.py):
      arms  = the two subtrees with rest brees[0] ~ 45deg; left has by>0
      hands = their descendants with rest brees ~ [0,0,-+10deg]; left bz<0
      legs  = sibling groups holding a rotated below-origin foot child;
              left leg sits on the left arm's X side
      hips/body/head follow the leg groups' parent chain."""
    everything = []

    def collect(o):
        everything.append(o)
        for ch in o.children:
            collect(ch)
    collect(root_bobj)
    mapping = {}

    def group(o):
        return o.get('lca_type', 0) == 0xFFFF

    arms = [o for o in everything if group(o)
            and abs(abs(_brees_prop(o)[0]) - 8192) <= 64]
    arm_left_x = 0
    if len(arms) == 2:
        left = max(arms, key=lambda o: _brees_prop(o)[1])
        right = arms[0] if arms[1] is left else arms[1]
        mapping['leftarm'], mapping['rightarm'] = left, right
        arm_left_x = left.get('lca_pos', [0, 0, 0])[0]
        for arm, hand in ((left, 'lefthand'), (right, 'righthand')):
            sub = []
            def col(o):
                sub.append(o)
                for ch in o.children:
                    col(ch)
            col(arm)
            for g in sub[1:]:
                bz = _brees_prop(g)[2]
                if group(g) and abs(abs(bz) - 1820) <= 64:
                    if (hand == 'lefthand') == (bz < 0):
                        mapping[hand] = g
                        break
    legs = []
    for o in everything:
        if not group(o) or o.get('lca_pos', [0, 0, 0])[1] >= 0:
            continue
        feet = [ch for ch in o.children
                if ch.get('lca_type', 0) != 0xFFFF
                and ch.get('lca_pos', [0, 0, 0])[1] < 0]
        if feet:
            legs.append((o, feet[0]))
    if len(legs) == 2:
        legs.sort(key=lambda lf: lf[0].get('lca_pos', [0, 0, 0])[0])
        mid = (legs[0][0].get('lca_pos')[0] + legs[1][0].get('lca_pos')[0]) / 2
        if arm_left_x <= mid:
            (lleg, lfoot), (rleg, rfoot) = legs
        else:
            (rleg, rfoot), (lleg, lfoot) = legs
        mapping['leftleg'], mapping['leftfoot'] = lleg, lfoot
        mapping['rightleg'], mapping['rightfoot'] = rleg, rfoot
        parent = lleg.parent
        if parent is not None:
            hips = next((ch for ch in parent.children
                         if ch.get('lca_type', 0) != 0xFFFF
                         and ch is not lleg and ch is not rleg
                         and any(g.get('lca_type', 0) == 0xFFFF
                                 for g in ch.children)), None)
            if hips is not None:
                mapping['hips'] = hips
                body = next((ch for ch in hips.children
                             if ch.get('lca_type', 0) == 0xFFFF), None)
                if body is not None:
                    mapping['body'] = body
                    head = next((ch for ch in body.children
                                 if ch.get('lca_type', 0) == 0xFFFF), None)
                    if head is not None:
                        mapping['head'] = head
    return mapping


def apply_smo(context, filepath, root_bobj, position_mode='DELTA',
              loop=True):
    """Keyframes an SMO clip onto an imported LCA hierarchy.
    Matching: exact lowercase name first (master-world rigs), then the
    structural auto-map for unnamed standalone 'SCL M/F' rigs.
    Rotations REPLACE the rest rotation (about each object's own imported
    origin == its VRT rotation centre); positions apply as deltas from the
    clip's frame 0 by default."""
    nframes, tracks = parse_smo(filepath)
    fps = context.scene.render.fps if context else 25
    step = fps / TICKS_PER_SEC

    # -- track name -> object matching, three tiers:
    #    1. exact lowercase name ('hips', 'leftarm' ...)
    #    2. token aliases, for master-world shape labels
    #       ('Minifig - Arm Left' -> leftarm; 'HipsBelt' -> hips)
    #    3. structural auto-map (unnamed standalone 'SCL M/F' rigs)
    TOKENS = {
        'hips': (('hips',),), 'body': (('body',),), 'head': (('head',),),
        'horn': (('horn',),),
        'leftarm': (('arm', 'left'),), 'rightarm': (('arm', 'right'),),
        'lefthand': (('hand', 'left'),), 'righthand': (('hand', 'right'),),
        'leftleg': (('leg', 'left'),), 'rightleg': (('leg', 'right'),),
        'leftfoot': (('foot', 'left'),), 'rightfoot': (('foot', 'right'),),
    }
    all_objs = []

    def collect(o):
        all_objs.append(o)
        for ch in o.children:
            collect(ch)
    collect(root_bobj)

    def norm(o):
        nm = o.name.split('_', 1)[-1].lower()
        return nm.split('.')[0]                    # drop .001 dedup suffix
    track_names = [nm for nm, _ in tracks]
    mapping = {}
    for nm in track_names:
        exact = next((o for o in all_objs if norm(o) == nm), None)
        if exact is not None:
            mapping[nm] = exact
            continue
        for tokens in TOKENS.get(nm, ()):
            hit = next((o for o in all_objs
                        if all(t in norm(o) for t in tokens)), None)
            if hit is not None:
                mapping[nm] = hit
                break
    if len(mapping) < len(track_names) // 2:
        mapping = automap_scl_rig(root_bobj)

    clip = os.path.splitext(os.path.basename(filepath))[0]
    applied = 0
    for nm, frames in tracks:
        bobj = mapping.get(nm)
        if bobj is None:
            continue
        rest_loc = tuple(bobj.location)
        rest_pos0 = frames[0][0:3]
        bobj.rotation_mode = 'QUATERNION'
        if bobj.animation_data is None:
            bobj.animation_data_create()
        action = bpy.data.actions.new('%s_%s' % (clip, nm))
        bobj.animation_data.action = action
        for i, fr in enumerate(frames):
            t = 1 + i * step
            px, py, pz, r3, r4, r5 = fr
            Rb = conj_rot(rot_from_smo_degrees(r3, r4, r5))
            bobj.rotation_quaternion = mat_to_quat(Rb)
            if position_mode == 'DELTA':
                d = conv_vec([px - rest_pos0[0], py - rest_pos0[1],
                              pz - rest_pos0[2]])
                bobj.location = (rest_loc[0] + d[0], rest_loc[1] + d[1],
                                 rest_loc[2] + d[2])
            elif position_mode == 'ABSOLUTE':
                bobj.location = conv_vec([px, py, pz])
            bobj.keyframe_insert('rotation_quaternion', frame=t)
            if position_mode != 'OFF':
                bobj.keyframe_insert('location', frame=t)
        applied += 1
    end = 1 + (nframes - 1) * step
    if context:
        context.scene.frame_end = max(context.scene.frame_end, int(end) + 1)
    return applied, len(tracks), sorted(mapping)


# ===========================================================================
# Operators / registration
# ===========================================================================

if bpy is not None:
    from bpy.props import StringProperty, BoolProperty, EnumProperty

    class IMPORT_OT_lca(bpy.types.Operator, ImportHelper):
        bl_idname = 'import_scene.lca_kk'
        bl_label = 'Import LEGO Creator KK (.lca)'
        bl_options = {'REGISTER', 'UNDO'}
        filename_ext = '.lca'
        filter_glob: StringProperty(default='*.lca', options={'HIDDEN'})
        bank_path: StringProperty(
            name='Texture bank',
            description='Optional creator2000.xvr or .spr sprite bank for '
                        'textured materials',
            default='', subtype='FILE_PATH')
        want_hidden: BoolProperty(
            name='Import hidden LODs/proxies', default=True,
            description='Import invisible LOD stand-ins and alternate-state '
                        'proxies (hidden) instead of skipping them')
        want_anim: BoolProperty(
            name='Animation cels as shape keys', default=True)

        def execute(self, context):
            root, stats = do_import(context, self.filepath, self.bank_path,
                                    self.want_hidden, self.want_anim)
            self.report({'INFO'}, 'LCA: %(meshes)d meshes, %(empties)d '
                        'empties, %(hidden)d hidden, %(materials)d '
                        'materials' % stats)
            return {'FINISHED'}

    class IMPORT_OT_smo(bpy.types.Operator, ImportHelper):
        bl_idname = 'import_anim.smo_kk'
        bl_label = 'Import KK Animation (.smo)'
        bl_options = {'REGISTER', 'UNDO'}
        filename_ext = '.smo'
        filter_glob: StringProperty(default='*.smo', options={'HIDDEN'})
        position_mode: EnumProperty(
            name='Positions',
            items=[('DELTA', 'Delta from rest',
                    'Add frame offsets from the clip rest pose to the '
                    'imported rig positions (portable across rigs)'),
                   ('ABSOLUTE', 'Absolute',
                    'Use clip positions directly (master-world rigs)'),
                   ('OFF', 'Rotations only', 'Ignore position channels')],
            default='DELTA')

        def execute(self, context):
            root = context.active_object
            if root is None:
                self.report({'ERROR'}, 'Select the imported LCA root first')
                return {'CANCELLED'}
            while root.parent is not None:
                root = root.parent
            applied, total, mapped = apply_smo(
                context, self.filepath, root, self.position_mode)
            self.report({'INFO'}, 'SMO: %d/%d tracks applied (%s)' %
                        (applied, total, ', '.join(mapped)))
            return {'FINISHED'}

    def menu_lca(self, context):
        self.layout.operator(IMPORT_OT_lca.bl_idname,
                             text='LEGO Creator KK (.lca)')

    def menu_smo(self, context):
        self.layout.operator(IMPORT_OT_smo.bl_idname,
                             text='KK Animation (.smo)')

    classes = (IMPORT_OT_lca, IMPORT_OT_smo)

    def register():
        for c in classes:
            bpy.utils.register_class(c)
        bpy.types.TOPBAR_MT_file_import.append(menu_lca)
        bpy.types.TOPBAR_MT_file_import.append(menu_smo)

    def unregister():
        bpy.types.TOPBAR_MT_file_import.remove(menu_smo)
        bpy.types.TOPBAR_MT_file_import.remove(menu_lca)
        for c in reversed(classes):
            bpy.utils.unregister_class(c)

    if __name__ == '__main__':
        register()
