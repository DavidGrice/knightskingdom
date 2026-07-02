#!/usr/bin/env python3
"""
Parser for LEGO Creator 2000 .lca files (Superscape VRT 5.10 containers).

Verified layout
---------------
Container: 0x148-byte LCA header (category string at 0x20), then a VCA
archive holding NOTNAMED.SHP / .PAL / .WLD.  Directory offsets are
unreliable; sub-files are located by their "SuperScape (c)" preambles
followed by SHAP / PALT / WRLD magics.

SHAP: 28-byte header, then shapes; each shape = chunk list terminated by
u16 0xFFFF; the whole list ends with an extra 0xFFFF; then a T_SYMNAME
symbol table (shape names).  Chunk = ChkType(u16) + Length(u16, includes
the 4-byte header).  Points 0-7 are implicit outer-cube corners
(bit2=X, bit1=Y, bit0=Z of the index).  Defined points start at 8.
REL coords are 1/16384ths of the cube size.  GEOM = P1+(P2-P1)*Mult/2^Shift.
Facet = NumLines(u8) FacAtt(u8) Number(u16) Line[NumLines] (0x8000 flag =
reversed edge); edges chain anticlockwise seen from the visible side.

Exporter bug: some records contain a stray 4-byte insertion
(`XX XX 00 00`) that chunk Length fields do NOT count.  POINTS and FACETS
are therefore parsed by record count with a validity oracle, resyncing
over junk.

WLD: object chunk stream; E_CTSTANDARD (0x44 bytes on disk, incl. two
garbage pointer fields) + optional chunks per object; 0xFFFF terminators;
symbol table of object names at the end.
"""
import json
import re
import struct
import sys

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


def summarize(r):
    shp = r.get('shp', {})
    print(f"== {r['file']}  cat={r['header']['category']!r} subs={r['subfiles']}")
    syms = {s['number']: s['name'] for s in shp.get('symbols', [])}
    inherited, isize = None, None
    good = bad = 0
    for i, s in enumerate(shp.get('shapes', [])):
        if not s:
            continue
        pts, size = resolve_points(s, inherited, isize)
        if 'points' in s:
            inherited, isize = pts, size
        loops = closed = 0
        for f in s.get('facets', []):
            loops += 1
            lp = facet_to_loop(f, s.get('lines', []) or
                               next((p['lines'] for p in
                                     reversed(shp['shapes'][:i])
                                     if p.get('lines')), []))
            if lp:
                closed += 1
        good += closed
        bad += loops - closed
        nm = syms.get(i - 1, '')
        print(f"   shape {i}: pts={len(pts)} lines={len(s.get('lines', []))} "
              f"facets={loops} closed={closed} size={s.get('size')} "
              f"cels={s.get('ncels')} name={nm!r}")
    if shp.get('warnings'):
        print('   WARN:', shp['warnings'][:6])
    print(f"   facet loops: {good} closed / {bad} failed")
    wld = r.get('wld', {})
    print(f"   world: {len(wld.get('objects', []))} objects, "
          f"syms={[s['name'] for s in wld.get('symbols', [])][:10]}")
    if wld.get('warnings'):
        print('   WLD WARN:', wld['warnings'][:4])


if __name__ == '__main__':
    for path in sys.argv[1:]:
        summarize(parse_lca(path))
