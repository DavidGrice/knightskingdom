"""lca2obj.py

Standalone LCA (.lca) to OBJ/MTL converter implementing SDK 16-bit chunk parsing
(simplified, focused on Points, Lines, Facets chunks per SDK chapters 7/8).

Usage: python lca2obj.py <input.lca> [output_prefix]

This script intentionally keeps a small dependency footprint (stdlib only).
"""

import sys
import os
import struct
import math
from collections import defaultdict

# SDK constants and helpers (16-bit semantics)
CHK_HDR_WORDS = 2  # chunk header consists of two 16-bit words: type, length
HDR_MASK = 0x3FFF  # clear high flag bits per SDK

# Chunk types (common names seen in existing code)
# These values are inferred from repo tools and common VRT/LEGO formats.
T_POINTSCHK = 0x0001
T_LINECHK = 0x0002
T_FACETCHK = 0x0003

# Safety limits
MAX_POINTS = 100000
MAX_LINES = 200000
MAX_FACETS = 100000

# Minimal vector helpers

def read_u16(data, pos):
    return struct.unpack_from('<H', data, pos)[0]


def read_i16(data, pos):
    return struct.unpack_from('<h', data, pos)[0]


class LCAParser:
    def __init__(self, data):
        self.data = data
        self.size = len(data)
        self.points = []
        self.lines = []
        self.facets = []

    def find_shap(self):
        # Find 'SHAP' magic or textual header used by SHAP files
        idx = self.data.find(b'SHAP')
        if idx != -1:
            # If 'SHAP' is found inside a textual header, move back to start of header
            # Try to find an earlier textual header marker (optional)
            return idx
        # fallback: start at 0
        return 0

    def parse(self):
        # Follow SDK APP_TYPE.H semantics: iterate shapes until 0xFFFF terminator
        shap_off = self.find_shap()
        pos = shap_off
        # If file has a full textual header, the shape data often starts at offset+256
        if pos + 256 < self.size and self.data[pos:pos+4] != b'SHAP':
            # try to decode textual header like convert_brick_gpt
            # search for ASCII 'SHAP' and assume header starts 0..256 bytes before it
            sidx = self.data.find(b'SHAP')
            if sidx != -1:
                pos = sidx
        # If we found 'SHAP', advance to after a possible 256-byte file header
        data_start = pos + 256 if pos + 256 < self.size else pos
        cur = data_start
        while cur + 4 <= self.size:
            # peek for end marker
            try:
                peek = read_u16(self.data, cur)
            except struct.error:
                break
            if peek == 0xFFFF:
                break
            # begin parsing shape chunks
            size_x = size_y = size_z = 1.0
            inner = cur
            while inner + 4 <= self.size:
                raw_chk = read_u16(self.data, inner)
                raw_len = read_u16(self.data, inner + 2)
                if raw_chk == 0xFFFF:
                    inner += 2
                    break
                chk_type = raw_chk & HDR_MASK
                length_words = raw_len & HDR_MASK
                if length_words < 4:
                    length_words = 4
                payload_bytes = (length_words - 2) * 2  # because header counted in words
                payload_start = inner + 4
                payload_end = payload_start + payload_bytes
                if payload_end > self.size:
                    payload_end = self.size
                print(f"chunk at {inner}: type=0x{chk_type:04X} len_words={length_words} payload {payload_start}-{payload_end}")
                # sizes chunk
                if chk_type == 0x0006 and payload_end - payload_start >= 12:
                    try:
                        sx, sy, sz = struct.unpack_from('<lll', self.data, payload_start)
                        size_x = float(sx); size_y = float(sy); size_z = float(sz)
                    except struct.error:
                        pass
                elif chk_type == 0x0000:
                    pts = self.parse_points_chunk(payload_start, payload_end)
                    if pts is not None:
                        self.points = pts
                elif chk_type == 0x0001:
                    lns = self.parse_lines_chunk(payload_start, payload_end)
                    if lns is not None:
                        self.lines = lns
                elif chk_type == 0x0002:
                    facs = self.parse_facets_chunk(payload_start, payload_end)
                    if facs is not None:
                        self.facets = facs
                # advance
                inner = payload_end
            # move to next shape (stop after first for now)
            break

    def parse_points_chunk(self, start, end):
        # Points chunk format (per SDK): header with num_points (USHORT) maybe extra fields
        pos = start
        if pos + 4 > end:
            # not enough for typical header - try to read whatever possible
            return
        try:
            num_points = read_u16(self.data, pos)
        except struct.error:
            return
        pos += 2
        # skip potential cell count or reserved word if present
        # Many tools expect an extra USHORT cell count here; try to detect
        # If remaining size fits num_points*6 bytes (3 x SHORT per point), assume no extra cell count
        remaining = end - pos
        expected_coords_bytes = num_points * 6  # 3 signed shorts per point
        if remaining >= expected_coords_bytes:
            # likely no extra word
            pass
        else:
            # try consuming a cell-count word
            if pos + 2 <= end:
                _cell_count = read_u16(self.data, pos)
                pos += 2
                remaining = end - pos
        # read points as 3 x signed 16-bit fixed coords (assume units; we normalize later)
        points = []
        for i in range(num_points):
            if pos + 6 > end:
                break
            x = read_i16(self.data, pos); y = read_i16(self.data, pos+2); z = read_i16(self.data, pos+4)
            pos += 6
            # convert to float (assume scale 1/256 or 1/512 not known). We'll keep raw ints for now.
            points.append((float(x), float(y), float(z)))
        self.points = points
        print(f'Parsed POINTS: {len(points)}')

    def parse_lines_chunk(self, start, end):
        pos = start
        if pos + 2 > end:
            return
        # many formats start with num_lines (USHORT)
        try:
            num_lines = read_u16(self.data, pos)
        except struct.error:
            return
        pos += 2
        lines = []
        for i in range(num_lines):
            if pos + 4 > end:
                break
            p1 = read_u16(self.data, pos); p2 = read_u16(self.data, pos+2)
            pos += 4
            # indices in file are often 1-based; convert later if needed
            lines.append((p1, p2))
        self.lines = lines
        print(f'Parsed LINES: {len(lines)}')

    def parse_facets_chunk(self, start, end):
        pos = start
        if pos + 2 > end:
            return
        try:
            num_facets = read_u16(self.data, pos)
        except struct.error:
            return
        pos += 2
        facets = []
        for fi in range(num_facets):
            if pos + 4 > end:
                # incomplete facet header
                break
            num_lines = self.data[pos]
            fac_att = self.data[pos+1]
            number = read_u16(self.data, pos+2)
            pos += 4
            # read num_lines of ushorts
            facet_lines = []
            for li in range(num_lines):
                if pos + 2 > end:
                    break
                liw = read_u16(self.data, pos)
                pos += 2
                # line index may have orientation bit (0x8000)
                orient = (liw & 0x8000) != 0
                li_idx = liw & 0x7FFF
                # Store signed style orientation by making negative index if reversed
                facet_lines.append(-li_idx if orient else li_idx)
            if len(facet_lines) >= 3:
                facets.append(facet_lines)
        self.facets = facets
        print(f'Parsed FACETS: {len(facets)}')

    def build_faces_from_facets(self):
        # Convert line indices to vertex indices and produce face vertex lists
        faces = []
        # Prepare point indexing assumptions:
        # If lines reference point indices that exceed points count, maybe lines store 1-based indices.
        pts_count = len(self.points)
        for facet in self.facets:
            # each facet is a list of line indices (signed by orientation)
            # Build vertex loop by chaining line endpoints
            vertex_loop = []
            if not facet:
                continue
            # map line_index -> endpoints
            def get_line_endpoints(li):
                idx = abs(li)
                if idx == 0 or idx > len(self.lines):
                    return None
                a_raw, b_raw = self.lines[idx-1]
                # convert line point indices to 0-based
                a = a_raw - 1 if a_raw > 0 else a_raw
                b = b_raw - 1 if b_raw > 0 else b_raw
                if li < 0:
                    # reversed orientation
                    return (b, a)
                return (a, b)

            # Start with first line
            ep = get_line_endpoints(facet[0])
            if not ep:
                continue
            v0, v1 = ep
            vertex_loop.append(v0)
            vertex_loop.append(v1)
            for li in facet[1:]:
                ep = get_line_endpoints(li)
                if not ep:
                    continue
                a,b = ep
                # if a matches last vertex, append b, else try to reorder
                if a == vertex_loop[-1]:
                    vertex_loop.append(b)
                elif b == vertex_loop[-1]:
                    vertex_loop.append(a)
                else:
                    # try to stitch by searching for matching endpoint and rotate
                    if a in vertex_loop:
                        # rotate loop so a is at end
                        while vertex_loop[-1] != a:
                            vertex_loop.append(vertex_loop[0]); vertex_loop.pop(0)
                        vertex_loop.append(b)
                    elif b in vertex_loop:
                        while vertex_loop[-1] != b:
                            vertex_loop.append(vertex_loop[0]); vertex_loop.pop(0)
                        vertex_loop.append(a)
                    else:
                        # disconnect - append both endpoints to keep geometry
                        vertex_loop.append(a); vertex_loop.append(b)
            # deduplicate consecutive duplicates
            if len(vertex_loop) >= 3:
                # remove duplicates
                cleaned = []
                for v in vertex_loop:
                    if not cleaned or cleaned[-1] != v:
                        cleaned.append(v)
                # ensure at least 3 unique vertices
                if len(set(cleaned)) >= 3:
                    faces.append(cleaned)
        return faces

    def write_obj(self, out_prefix):
        obj_path = out_prefix + '.obj'
        mtl_path = out_prefix + '.mtl'
        # Write MTL with single default material
        with open(mtl_path, 'w') as mf:
            mf.write('newmtl mat0\n')
            mf.write('Kd 0.8 0.8 0.8\n')
        faces = self.build_faces_from_facets()
        # Write OBJ
        with open(obj_path, 'w') as of:
            of.write(f'mtllib {os.path.basename(mtl_path)}\n')
            of.write('usemtl mat0\n')
            # write vertices
            for p in self.points:
                x,y,z = p
                of.write(f'v {x:.6f} {y:.6f} {z:.6f}\n')
            # write faces (1-based indices expected by OBJ)
            for f in faces:
                # convert to 1-based OBJ indices
                verts = [str(v+1 if v >= 0 else v) for v in f]
                of.write('f ' + ' '.join(verts) + '\n')
        print('Wrote', obj_path, mtl_path)


def main(argv):
    if len(argv) < 2:
        print('Usage: python lca2obj.py <input.lca> [output_prefix]')
        return
    inp = argv[1]
    outpref = argv[2] if len(argv) >= 3 else os.path.splitext(os.path.basename(inp))[0]
    with open(inp, 'rb') as f:
        data = f.read()
    p = LCAParser(data)
    p.parse()
    p.write_obj(os.path.join(os.getcwd(), outpref))

if __name__ == '__main__':
    main(sys.argv)
