"""From-scratch LCA/SHAP parser -> OBJ/MTL

This parser treats the file as a flat sequence of 16-bit chunk headers and
payloads. It does not assume any pre-defined hierarchy mapping. Instead it
applies a small heuristic: if a chunk payload begins with what looks like
one or more valid chunk headers (16-bit type, 16-bit length) that point inside
that payload, we treat the payload as a container and recursively parse it.

We implement direct parsers for three SDK-defined payload types (per
`APP_TYPE.H` semantics):
 - Points chunk (T_POINTSCHK structure)
 - Lines chunk (T_LINECHK structure)
 - Facets chunk (T_FACETCHK / T_FACET structures)

All integer fields are treated with 16-bit semantics and header words are
masked with 0x3FFF to clear high flags (per SDK).

Usage:
    python lca2obj.py <input.lca> [output_prefix]

Output: <output_prefix>.obj and <output_prefix>.mtl written in cwd.
"""

import sys
import os
import struct
import math
from collections import deque

# Constants
HDR_MASK = 0x3FFF  # clear high bits in header words (14-bit values)
MIN_CHK_WORDS = 2  # minimum words for a chunk header (type+length)
MIN_CHK_BYTES = MIN_CHK_WORDS * 2

# SDK subchunk ids (shape-level identifiers as described in APP_TYPE.H)
E_SCPOINTS = 0x0000
E_SCLINES = 0x0001
E_SCFACETS = 0x0002

# Orientation bit present in facet line indices
FACET_ORIENT_BIT = 0x8000

# Safety caps
MAX_POINTS = 200000
MAX_LINES = 200000
MAX_FACETS = 200000


def read_u16(data, pos):
    return struct.unpack_from('<H', data, pos)[0]


def read_i16(data, pos):
    return struct.unpack_from('<h', data, pos)[0]


def is_plausible_chunk_header(data, pos, base_end):
    """Return True if a 4-byte clean chunk header exists at pos and points inside base_end."""
    if pos + 4 > base_end:
        return False
    try:
        raw_type = read_u16(data, pos)
        raw_len = read_u16(data, pos + 2)
    except struct.error:
        return False
    chk = raw_type & HDR_MASK
    ln = raw_len & HDR_MASK
    # length measured in words; require at least header words and not overflow
    if ln < MIN_CHK_WORDS:
        return False
    payload_bytes = (ln - 2) * 2  # header consumes two words
    payload_start = pos + 4
    payload_end = payload_start + payload_bytes
    return payload_end <= base_end and payload_end > payload_start


class Chunk:
    """Represents a parsed chunk header and payload slice.

    Fields:
        start: absolute offset of header word (type)
        chk_type: masked chunk type (14-bit)
        length_words: length in 16-bit words (masked)
        payload_start, payload_end: absolute offsets of payload range (bytes)
    """

    __slots__ = ('start', 'chk_type', 'length_words', 'payload_start', 'payload_end')

    def __init__(self, start, chk_type, length_words, payload_start, payload_end):
        self.start = start
        self.chk_type = chk_type
        self.length_words = length_words
        self.payload_start = payload_start
        self.payload_end = payload_end

    def __repr__(self):
        return f"Chunk(start={self.start}, type=0x{self.chk_type:04X}, words={self.length_words}, payload={self.payload_start}-{self.payload_end})"


class LCA2OBJ:
    def __init__(self, data):
        self.data = data
        self.size = len(data)
        self.points = []  # list of (x,y,z) floats
        self.lines = []   # list of (p1_idx, p2_idx) (1-based as found)
        self.facets = []  # list of [signed line indices]
        self.diagnostics = []

    def discover_top_level_chunks(self):
        """Scan the file as a flat sequence of chunk headers (no assumptions)."""
        chunks = []
        pos = 0
        while pos + 4 <= self.size:
            try:
                raw_type = read_u16(self.data, pos)
                raw_len = read_u16(self.data, pos + 2)
            except struct.error:
                break
            if raw_type == 0xFFFF:
                # 0xFFFF used as terminator in some formats; advance and stop
                pos += 2
                break
            chk_type = raw_type & HDR_MASK
            length_words = raw_len & HDR_MASK
            if length_words < MIN_CHK_WORDS:
                # malformed; force minimal length to avoid infinite loop
                length_words = MIN_CHK_WORDS
            payload_bytes = (length_words - 2) * 2
            payload_start = pos + 4
            payload_end = payload_start + payload_bytes
            if payload_end > self.size:
                payload_end = self.size
            chunks.append(Chunk(pos, chk_type, length_words, payload_start, payload_end))
            # advance to next candidate header
            pos = payload_end
        return chunks

    def parse(self):
        # Top-level scan
        top_chunks = self.discover_top_level_chunks()
        if not top_chunks:
            print('No top-level chunks discovered')
            return
        # We'll process each top-level chunk and if a chunk's payload looks like a
        # nested sequence of valid chunk headers, recursively parse children.
        queue = deque(top_chunks)
        while queue:
            chk = queue.popleft()
            # Heuristic: check if payload contains nested chunk headers
            nested_found = False
            # scan first few bytes of payload for plausible inner header sequence
            scan_start = chk.payload_start
            scan_end = chk.payload_end
            # check every possible word-aligned offset inside payload (limit scan length)
            limit_scan = min(scan_start + 1024, scan_end)
            for p in range(scan_start, limit_scan, 2):
                if is_plausible_chunk_header(self.data, p, scan_end):
                    nested_found = True
                    break
            if nested_found:
                # parse nested children as top-level inside this payload region
                pos = chk.payload_start
                while pos + 4 <= chk.payload_end:
                    try:
                        raw_type = read_u16(self.data, pos)
                        raw_len = read_u16(self.data, pos + 2)
                    except struct.error:
                        break
                    if raw_type == 0xFFFF:
                        pos += 2
                        break
                    ctype = raw_type & HDR_MASK
                    clen = raw_len & HDR_MASK
                    if clen < MIN_CHK_WORDS:
                        clen = MIN_CHK_WORDS
                    cbytes = (clen - 2) * 2
                    pstart = pos + 4
                    pend = min(pstart + cbytes, chk.payload_end)
                    child = Chunk(pos, ctype, clen, pstart, pend)
                    # push child to queue for processing
                    queue.append(child)
                    pos = pend
                continue
            # If not nested, try to decode chunk as data payload for points/lines/facets
            if chk.chk_type in (E_SCPOINTS,):
                # Parse points chunk
                self._parse_points_payload(chk.payload_start, chk.payload_end)
            elif chk.chk_type in (E_SCLINES,):
                self._parse_lines_payload(chk.payload_start, chk.payload_end)
            elif chk.chk_type in (E_SCFACETS,):
                self._parse_facets_payload(chk.payload_start, chk.payload_end)
            else:
                # Unknown chunk type — attempt to detect if it *contains* a points/lines/facets structure
                # We'll attempt quick signature sniffing: points begin with two ushorts (NumPoints, NumCels)
                # lines begin with one ushort (NumLines) and facets begin with one ushort (NumFacets).
                # Try points
                if self._sniff_points(chk.payload_start, chk.payload_end):
                    self._parse_points_payload(chk.payload_start, chk.payload_end)
                elif self._sniff_lines(chk.payload_start, chk.payload_end):
                    self._parse_lines_payload(chk.payload_start, chk.payload_end)
                elif self._sniff_facets(chk.payload_start, chk.payload_end):
                    self._parse_facets_payload(chk.payload_start, chk.payload_end)
                else:
                    # not recognized — skip
                    pass

    # ---------- sniffers ----------
    def _sniff_points(self, start, end):
        if start + 4 > end:
            return False
        try:
            npts = read_u16(self.data, start)
        except struct.error:
            return False
        if npts == 0 or npts > MAX_POINTS:
            return False
        # remaining bytes must be enough for at least one point (6 bytes each)
        rem = end - (start + 4)
        return rem >= 6

    def _sniff_lines(self, start, end):
        if start + 2 > end:
            return False
        try:
            n = read_u16(self.data, start)
        except struct.error:
            return False
        if n == 0 or n > MAX_LINES:
            return False
        # at least one line record of 4 bytes
        rem = end - (start + 2)
        return rem >= 4

    def _sniff_facets(self, start, end):
        if start + 2 > end:
            return False
        try:
            n = read_u16(self.data, start)
        except struct.error:
            return False
        if n == 0 or n > MAX_FACETS:
            return False
        # can't reliably validate further without parsing, so accept
        return True

    # ---------- payload parsers (fresh implementations) ----------
    def _parse_points_payload(self, start, end):
        pos = start
        if pos + 4 > end:
            self.diagnostics.append(('points_incomplete_header', start))
            return
        try:
            num_points = read_u16(self.data, pos)
            num_cels = read_u16(self.data, pos + 2)
        except struct.error:
            self.diagnostics.append(('points_struct_error', start))
            return
        pos += 4
        points = []
        # Each point is typically 3 x signed shorts (6 bytes). We'll parse as many as available
        for i in range(num_points):
            if pos + 6 > end:
                # truncated
                break
            x = float(read_i16(self.data, pos)); y = float(read_i16(self.data, pos+2)); z = float(read_i16(self.data, pos+4))
            pos += 6
            points.append((x, y, z))
        # accumulate points across chunks
        self.points.extend(points)
        print(f'Parsed fresh POINTS: {len(points)} (declared {num_points})')

    def _parse_lines_payload(self, start, end):
        pos = start
        if pos + 2 > end:
            self.diagnostics.append(('lines_incomplete_header', start))
            return
        try:
            num_lines = read_u16(self.data, pos)
        except struct.error:
            self.diagnostics.append(('lines_struct_error', start))
            return
        pos += 2
        lines = []
        for i in range(num_lines):
            if pos + 4 > end:
                break
            p1 = read_u16(self.data, pos); p2 = read_u16(self.data, pos+2)
            pos += 4
            # preserve raw indices; they may be 1-based
            lines.append((p1, p2))
        # accumulate lines across chunks
        self.lines.extend(lines)
        print(f'Parsed fresh LINES: {len(lines)} (declared {num_lines})')

    def _parse_facets_payload(self, start, end):
        pos = start
        if pos + 2 > end:
            self.diagnostics.append(('facets_incomplete_header', start))
            return
        try:
            num_facets = read_u16(self.data, pos)
        except struct.error:
            self.diagnostics.append(('facets_struct_error', start))
            return
        pos += 2
        facets = []
        for fi in range(num_facets):
            if pos + 4 > end:
                # incomplete facet header
                self.diagnostics.append(('facet_incomplete_header', (start, fi, pos)))
                break
            num_lines = self.data[pos]
            fac_att = self.data[pos+1]
            number = read_u16(self.data, pos+2)
            pos += 4
            facet_lines = []
            for li in range(num_lines):
                if pos + 2 > end:
                    # truncated line indices
                    self.diagnostics.append(('facet_incomplete_lines', (start, fi, len(facet_lines), num_lines)))
                    break
                raw = read_u16(self.data, pos); pos += 2
                sign = -1 if (raw & FACET_ORIENT_BIT) else 1
                idx = (raw & 0x3FFF) * sign
                facet_lines.append(idx)
            if len(facet_lines) >= 3:
                facets.append(facet_lines)
        # accumulate facets across chunks
        self.facets.extend(facets)
        print(f'Parsed fresh FACETS: {len(facets)} (declared {num_facets})')

    # ---------- assembly and export ----------
    def assemble_faces(self):
        """Given self.points, self.lines, and self.facets, attempt to build faces as vertex index lists (1-based for OBJ).
        This is a straightforward stitcher: it uses the orientation encoded in facet line indices to chain endpoints.
        If chaining fails, it will fallback to a greedy order of unique vertices and emit triangles via fan triangulation.
        """
        faces = []
        pts = self.points
        lns = self.lines
        for facet in self.facets:
            # build sequence of vertex indices
            verts = []
            def get_endpoints(li):
                aidx = abs(li)
                if aidx == 0 or aidx > len(lns):
                    return None
                p1_raw, p2_raw = lns[aidx-1]
                # keep as zero-based indices for points list
                p1 = p1_raw - 1 if p1_raw > 0 else p1_raw
                p2 = p2_raw - 1 if p2_raw > 0 else p2_raw
                if li < 0:
                    return (p2, p1)
                return (p1, p2)

            first = get_endpoints(facet[0])
            if not first:
                continue
            verts.append(first[0]); verts.append(first[1])
            for li in facet[1:]:
                ep = get_endpoints(li)
                if not ep:
                    continue
                a, b = ep
                if a == verts[-1]:
                    verts.append(b)
                elif b == verts[-1]:
                    verts.append(a)
                else:
                    # try to find and rotate
                    if a in verts:
                        while verts[-1] != a:
                            verts.append(verts.pop(0))
                        verts.append(b)
                    elif b in verts:
                        while verts[-1] != b:
                            verts.append(verts.pop(0))
                        verts.append(a)
                    else:
                        verts.append(a); verts.append(b)
            # clean duplicates
            cleaned = []
            for v in verts:
                if not cleaned or cleaned[-1] != v:
                    cleaned.append(v)
            if len(set(cleaned)) >= 3:
                # convert to 1-based for OBJ
                faces.append([v+1 for v in cleaned])
        return faces

    def write_obj(self, out_prefix):
        obj_file = out_prefix + '.obj'
        mtl_file = out_prefix + '.mtl'
        # write simple MTL
        with open(mtl_file, 'w') as mf:
            mf.write('newmtl mat0\n')
            mf.write('Kd 0.8 0.8 0.8\n')
        faces = self.assemble_faces()
        with open(obj_file, 'w') as of:
            of.write(f'mtllib {os.path.basename(mtl_file)}\n')
            of.write('usemtl mat0\n')
            for x, y, z in self.points:
                of.write(f'v {x:.6f} {y:.6f} {z:.6f}\n')
            for f in faces:
                of.write('f ' + ' '.join(str(i) for i in f) + '\n')
        print(f'Wrote OBJ: {obj_file} (verts={len(self.points)} faces={len(faces)})')


def main(argv):
    if len(argv) < 2:
        print('Usage: python lca2obj.py <input.lca> [out_prefix]')
        return
    inp = argv[1]
    out = argv[2] if len(argv) > 2 else os.path.splitext(os.path.basename(inp))[0]
    with open(inp, 'rb') as f:
        data = f.read()
    parser = LCA2OBJ(data)
    parser.parse()
    parser.write_obj(out)
    if parser.diagnostics:
        print('Diagnostics:')
        for d in parser.diagnostics[:20]:
            print(' ', d)


if __name__ == '__main__':
    main(sys.argv)
