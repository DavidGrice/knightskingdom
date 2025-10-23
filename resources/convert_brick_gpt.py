# ...existing code...
import logging
import struct
import os
import math
import argparse
import sys

from collections import defaultdict, Counter

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
base = os.path.dirname(os.path.abspath(__file__))

# Track which chunk diagnostics we've already written this run to avoid spamming
# the debug_facets directory with repeated duplicate dumps for the same chunk.
_dumped_incomplete_header_chunks = set()
_dumped_incomplete_line_idx_chunks = set()

# Heuristics: toggle these to try different interpretations of indices/fields
# Some SHAP variants use 0-based indices; some store geometric point indices as unsigned
ZERO_BASE_INDICES = True
GEOM_POINT_UNSIGNED = False
# cuboid handling: 'auto' will detect if first 8 parsed points form an AABB cuboid
# other options: 'seed' (always seed canonical unit-cube), 'file' (use file-first-8 as cuboid)
POINTS_CUBOID_MODE = 'auto'

# Global runtime tunables (can be set via CLI)
GLOBAL_CLUSTER_FRACTION = 0.03
GLOBAL_BACKTRACK_TOP_K = 6
GLOBAL_BACKTRACK_MAX_EXTRA = 12
FORCE_PARSE = None


def hex_to_bytes(hex_str):
    cleaned = ''.join(hex_str.split())
    try:
        return bytes.fromhex(cleaned)
    except ValueError as e:
        logger.error(f"Error converting hex to bytes: {e}")
        raise


def find_shap_offset(data):
    """
    Try to locate the SHAP header. original file had duplicate textual header,
    but some dumps only have the 'SHAP' signature — try several strategies.
    """
    header_start = b'SuperScape (c) New Dimension International Ltd.'
    # try to find the textual header twice (original logic)
    first = data.find(header_start)
    if first != -1:
        second = data.find(header_start, first + len(header_start))
        if second != -1:
            logger.debug(f"Found textual header twice at {second}")
            return second

    # fallback: try to find ASCII "SHAP" magic directly
    shap_idx = data.find(b'SHAP')
    if shap_idx != -1:
        logger.debug(f"Found 'SHAP' magic at {shap_idx}")
        return shap_idx

    # final fallback: if none found, raise
    raise ValueError("SHAP header not found")


def parse_file_header(data, offset):
    """
    Parse file header at offset. Be defensive: wrap unpack calls.
    Return (symbols_offset, data_start_offset)
    """
    try:
        text = data[offset:offset+200].decode('ascii', errors='ignore').rstrip('\x00')
    except Exception:
        text = ''
    try:
        spares = struct.unpack_from('<10l', data, offset+200)
    except struct.error:
        spares = (0,) * 10
    try:
        symbols_offset = struct.unpack_from('<l', data, offset+240)[0]
    except struct.error:
        raise ValueError("Unable to read symbols offset")
    try:
        file_type = data[offset+244:offset+248].decode('ascii', errors='ignore')
    except Exception:
        file_type = ''
    try:
        machine = struct.unpack_from('<H', data, offset+248)[0]
    except struct.error:
        machine = 0
    try:
        revision = struct.unpack_from('<l', data, offset+250)[0]
    except struct.error:
        revision = 0
    try:
        version = data[offset+254]
        sub_version = data[offset+255]
    except Exception:
        version = 0
        sub_version = 0
    logger.info(f"Type: {file_type}, Rev: {revision}, Ver: {version}.{sub_version}, Symbols: {symbols_offset}")
    if file_type.strip() != 'SHAP':
        # allow case where we started at 'SHAP' magic (not full textual header)
        if data[offset:offset+4] != b'SHAP':
            raise ValueError("Not SHAP")
    return symbols_offset, offset + 256


def parse_points_chunk(data, start_pos, chunk_length, size_x, size_y, size_z):
    chunk_end = start_pos + chunk_length - 4
    pos = start_pos
    # According to APP_TYPE.H: T_POINTSCHK contains NumPoints, NumCels (both ushorts)
    # Then NumPoints entries follow. Each entry begins with a 16-bit header that
    # encodes dynamic flag and type in its high bits (E_PNTDYNAMIC and E_PNTTYPEMASK).
    # For relative/absolute points the header contains the first signed short (x)
    # followed by y,z signed shorts. For geometric points the header is followed
    # by T_GEOMPOINT: short Point1, short Point2, uchar Shift, uchar Mult.
    try:
        num_points, num_cels = struct.unpack_from('<HH', data, pos)
        pos += 4
        logger.debug(f"Points header: num_points={num_points} num_cels={num_cels}")
    except struct.error:
        logger.warning("Incomplete points header")
        return [], chunk_end

    # We'll parse the chunk into a temporary list first, then decide whether to
    # (a) prepend a canonical seeded unit-cube (current behavior), or
    # (b) treat the file's first 8 parsed points as the cuboid (if they resemble one).

    # canonical seed points (0..7) - unit cube, scaled later by sizes
    seed_points = [
        (0.0, 0.0, 0.0), (0.0, 0.0, 1.0), (0.0, 1.0, 0.0), (0.0, 1.0, 1.0),
        (1.0, 0.0, 0.0), (1.0, 0.0, 1.0), (1.0, 1.0, 0.0), (1.0, 1.0, 1.0)
    ]

    # helper masks from SDK
    E_PNTDYNAMIC = 0x8000
    E_PNTTYPEMASK = 0x0007
    E_PNTRELTYPE = 1
    E_PNTGEOMTYPE = 2
    E_PNTUABTYPE = 3

    # Read exactly num_points entries
    # We'll attempt the SDK-consistent (16-bit / header-based) parse first, and when
    # a float32-pair fast-path exists we'll also try it and choose the more plausible
    # result. This avoids wrongly preferring float32 when the original file used
    # 16-bit fixed-point values (which previously produced more correct corners).
    remaining = chunk_end - pos

    def score_points(pts):
        # Simple plausibility scoring: unique point count + 10*bbox_diag
        if not pts:
            return 0.0
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        uniq = len({(round(x, 6), round(y, 6), round(z, 6)) for x, y, z in pts})
        bbox_diag = math.hypot(max(xs) - min(xs), max(ys) - min(ys)) if xs and ys else 0.0
        return uniq + 10.0 * bbox_diag

    # --- SDK/16-bit parse into a temp list ---
    p_pos = pos
    # points_fixed holds parsed points in file order so geometric points can
    # reference earlier entries (SDK semantics). We'll collect all parsed
    # points here and use it for scoring/selection.
    points_fixed = []
    temp_points = points_fixed
    success_fixed = True
    try:
        for i in range(num_points):
            if p_pos + 2 > chunk_end:
                success_fixed = False
                logger.debug("Incomplete point entry during fixed parse")
                break
            header = struct.unpack_from('<H', data, p_pos)[0]
            p_pos += 2
            is_dynamic = bool(header & E_PNTDYNAMIC)
            ptype = header & E_PNTTYPEMASK
            if ptype == E_PNTGEOMTYPE:
                if p_pos + 6 > chunk_end:
                    success_fixed = False
                    logger.debug("Incomplete geometric point data during fixed parse")
                    break
                if GEOM_POINT_UNSIGNED:
                    p1 = struct.unpack_from('<H', data, p_pos)[0]; p_pos += 2
                    p2 = struct.unpack_from('<H', data, p_pos)[0]; p_pos += 2
                else:
                    p1 = struct.unpack_from('<h', data, p_pos)[0]; p_pos += 2
                    p2 = struct.unpack_from('<h', data, p_pos)[0]; p_pos += 2
                shift = struct.unpack_from('<B', data, p_pos)[0]; p_pos += 1
                mult = struct.unpack_from('<B', data, p_pos)[0]; p_pos += 1
                den = 1 << shift if shift < 31 else 1
                frac = (mult / den) if den != 0 else 0
                try:
                    if ZERO_BASE_INDICES:
                        a = points_fixed[p1]
                        b = points_fixed[p2]
                    else:
                        a = points_fixed[p1 - 1]
                        b = points_fixed[p2 - 1]
                    x = a[0] + (b[0] - a[0]) * frac
                    y = a[1] + (b[1] - a[1]) * frac
                    z = a[2] + (b[2] - a[2]) * frac
                except Exception:
                    x = y = z = 0.0
                # record geometric point into parsed list for subsequent references
                points_fixed.append((x, y, z))
            else:
                if p_pos + 4 > chunk_end:
                    success_fixed = False
                    logger.debug("Incomplete relative/abs point data during fixed parse")
                    break
                x = struct.unpack('<h', struct.pack('<H', header))[0] / 16384.0
                y = struct.unpack_from('<h', data, p_pos)[0] / 16384.0; p_pos += 2
                z = struct.unpack_from('<h', data, p_pos)[0] / 16384.0; p_pos += 2
                points_fixed.append((x, y, z))
            if is_dynamic and num_cels > 1:
                skip_bytes = (num_cels - 1) * (2 + (6 if ptype == E_PNTGEOMTYPE else 4))
                if p_pos + skip_bytes > chunk_end:
                    p_pos = chunk_end
                    break
                p_pos += skip_bytes
    except struct.error:
        success_fixed = False

    scaled_temp = [(x * size_x, y * size_y, z * size_z) for x, y, z in points_fixed]

    # Decide whether the file's first 8 points look like a cuboid. We'll consider
    # them a cuboid if num_points >= 8 and the first 8 points correspond to the
    # 8 unique combinations of (xmin/xmax, ymin/ymax, zmin/zmax) within a tolerance.
    def is_8_corner_cuboid(pts, tol=1e-4):
        if len(pts) < 8:
            return False
        first8 = pts[:8]
        xs = [p[0] for p in first8]
        ys = [p[1] for p in first8]
        zs = [p[2] for p in first8]
        xmin, xmax = min(xs), max(xs)
        ymin, ymax = min(ys), max(ys)
        zmin, zmax = min(zs), max(zs)
        if xmax - xmin < tol or ymax - ymin < tol or zmax - zmin < tol:
            return False
        expected = set()
        for xi in (xmin, xmax):
            for yi in (ymin, ymax):
                for zi in (zmin, zmax):
                    expected.add((round(xi,6), round(yi,6), round(zi,6)))
        found = set((round(p[0],6), round(p[1],6), round(p[2],6)) for p in first8)
        return found == expected

    chosen_points = None
    mode = POINTS_CUBOID_MODE
    # allow CLI/force via global FORCE_PARSE switch (reuse existing flag naming)
    # if FORCE_PARSE set to 'file-cuboid' or 'seed-cuboid' interpret accordingly
    try:
        if FORCE_PARSE == 'file-cuboid':
            mode = 'file'
        elif FORCE_PARSE == 'seed-cuboid':
            mode = 'seed'
    except Exception:
        pass

    if mode == 'file':
        if is_8_corner_cuboid(scaled_temp):
            chosen_points = scaled_temp
            logger.info('Using file-first-8 as cuboid (forced)')
        else:
            chosen_points = seed_points + scaled_temp
            logger.info('Forced file-first-8 mode but file did not look like cuboid; falling back to seeded cube')
    elif mode == 'seed':
        chosen_points = seed_points + scaled_temp
        logger.info('Using seeded unit-cube for first 8 points (forced)')
    else:  # auto
        if is_8_corner_cuboid(scaled_temp):
            chosen_points = scaled_temp
            logger.info('Auto-detect: file-first-8 detected as cuboid; using file cuboid')
        else:
            chosen_points = seed_points + scaled_temp
            logger.info('Auto-detect: no file-first-8 cuboid detected; using seeded cube')

    if pos < chunk_end:
        logger.debug(f"Padding {chunk_end - pos} bytes in points")
    pos = chunk_end
    return chosen_points, pos


def parse_lines_chunk(data, start_pos, chunk_length):
    chunk_end = start_pos + chunk_length - 4
    pos = start_pos
    lines = []
    # According to APP_TYPE.H: T_LINECHK has NumLines then an array of T_LINE
    if pos + 2 > chunk_end:
        logger.warning("Incomplete lines header")
        return [], chunk_end
    try:
        num_lines = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        logger.debug(f"Num lines: {num_lines}")
    except struct.error:
        logger.warning("Struct error in lines header")
        return [], chunk_end

    for _ in range(num_lines):
        if pos + 4 > chunk_end:
            logger.warning("Incomplete line record")
            break
        try:
            p1_raw = struct.unpack_from('<H', data, pos)[0]
            pos += 2
            p2_raw = struct.unpack_from('<H', data, pos)[0]
            pos += 2
        except struct.error:
            logger.warning("Struct error in line record")
            break
        # Clear top two flag bits (dynamic/origin) to get actual point index (14 bits)
        p1 = p1_raw & 0x3FFF
        p2 = p2_raw & 0x3FFF
        # Keep the raw p1/p2 as they are (likely 1-based indices into points)
        lines.append((p1, p2))
    if pos < chunk_end:
        logger.debug(f"Padding {chunk_end - pos} bytes in lines")
    pos = chunk_end
    return lines, pos


def parse_facets_chunk(data, start_pos, chunk_length):
    chunk_end = start_pos + chunk_length - 4
    pos = start_pos
    # According to APP_TYPE.H: T_FACETCHK contains NumFacets (ushort) followed by
    # T_FACET entries: NumLines (uchar), FacAtt (uchar), Number (ushort), then NumLines ushorts
    if pos + 2 > chunk_end:
        logger.warning("Incomplete facets header")
        return [], chunk_end
    try:
        num_facets = struct.unpack_from('<H', data, pos)[0]
        pos += 2
    except struct.error:
        logger.warning("Struct error in facets header")
        return [], chunk_end
    if num_facets > 2000:
        logger.warning("Unreasonable num_facets, skipping")
        return [], chunk_end
    facets = []
    for fi in range(num_facets):
        if pos + 4 > chunk_end:
            logger.warning("Incomplete facet header")
            # Dump diagnostic slice for post-mortem
            try:
                dbg_dir = os.path.join(base, 'model_files', 'debug_facets')
                os.makedirs(dbg_dir, exist_ok=True)
                dump_path = os.path.join(dbg_dir, f'facets_chunk_{start_pos}_incomplete_header.txt')
                # Create the diagnostic file only if it does not already exist to avoid duplicates
                if not os.path.exists(dump_path):
                    with open(dump_path, 'w') as df:
                        df.write(f"INCOMPLETE FACET HEADER at chunk_start={start_pos} facet_index={fi} pos={pos} chunk_end={chunk_end}\n")
                        df.write(data[pos:chunk_end].hex() + "\n")
            except Exception:
                logger.exception('Failed to write facet header diagnostic')
            # attempt conservative resynchronization: look ahead for next plausible
            # chunk header or 0xFFFF terminator within a small window and jump there
            try:
                found = None
                reason = None
                max_scan = min(len(data) - 4, pos + 512)
                for k in range(pos, max_scan):
                    try:
                        raw1 = struct.unpack_from('<H', data, k)[0]
                        raw2 = struct.unpack_from('<H', data, k+2)[0]
                    except struct.error:
                        continue
                    if raw1 == 0xFFFF:
                        found = k
                        reason = 'terminator'
                        break
                    chk = raw1 & 0x3FFF
                    length_m = raw2 & 0x3FFF
                    # prefer known chunk types and plausible lengths
                    if length_m >= 4 and k + length_m <= len(data) and chk in (0x0000,0x0001,0x0002,0x0003,0x0004,0x0005,0x0006,0x0007,0x000A):
                        found = k
                        reason = f'chunk_0x{chk:04X}'
                        break
                if found is not None:
                    logger.warning(f"Resync: jumping from bad facet at {pos} to candidate header at {found} ({reason})")
                    pos = found
                    chunk_end = found
                    # continue outer loop; we'll return pos at end
                    break
                else:
                    # nothing plausible found; advance to chunk_end to avoid stalling
                    pos = chunk_end
                    break
            except Exception:
                break
        try:
            num_sides = struct.unpack_from('<B', data, pos)[0]
            pos += 1
            fac_att = struct.unpack_from('<B', data, pos)[0]
            pos += 1
            number = struct.unpack_from('<H', data, pos)[0]
            pos += 2
        except struct.error:
            logger.warning("Struct error in facet header")
            break
        if num_sides <= 0:
            logger.debug("Facet with zero sides, skipping")
            continue
        if num_sides > 200:
            logger.warning("Unreasonable num_sides, skipping facet")
            skip_bytes = 2 * num_sides
            if pos + skip_bytes <= chunk_end:
                pos += skip_bytes
            else:
                pos = chunk_end
            continue
        facet_lines = []
        for __ in range(num_sides):
            if pos + 2 > chunk_end:
                logger.warning("Incomplete line idx in facet")
                # Dump current facet partial data for inspection
                try:
                    dbg_dir = os.path.join(base, 'model_files', 'debug_facets')
                    os.makedirs(dbg_dir, exist_ok=True)
                    dump_path = os.path.join(dbg_dir, f'facets_chunk_{start_pos}_incomplete_line_idx.txt')
                    # Create the diagnostic file only if it does not already exist to avoid duplicates
                    if not os.path.exists(dump_path):
                        with open(dump_path, 'w') as df:
                            df.write(f"INCOMPLETE LINE IDX at chunk_start={start_pos} facet_index={fi} expected_sides={num_sides} got_so_far={len(facet_lines)} pos={pos} chunk_end={chunk_end}\n")
                            df.write('partial_lines: ' + ','.join(str(x) for x in facet_lines) + "\n")
                            df.write(data[pos:chunk_end].hex() + "\n")
                except Exception:
                    logger.exception('Failed to write facet line idx diagnostic')
                # try the same conservative resync as for header failures
                try:
                    found = None
                    reason = None
                    max_scan = min(len(data) - 4, pos + 512)
                    for k in range(pos, max_scan):
                        try:
                            raw1 = struct.unpack_from('<H', data, k)[0]
                            raw2 = struct.unpack_from('<H', data, k+2)[0]
                        except struct.error:
                            continue
                        if raw1 == 0xFFFF:
                            found = k
                            reason = 'terminator'
                            break
                        chk = raw1 & 0x3FFF
                        length_m = raw2 & 0x3FFF
                        if length_m >= 4 and k + length_m <= len(data) and chk in (0x0000,0x0001,0x0002,0x0003,0x0004,0x0005,0x0006,0x0007,0x000A):
                            found = k
                            reason = f'chunk_0x{chk:04X}'
                            break
                    if found is not None:
                        logger.warning(f"Resync: jumping from bad facet line at {pos} to candidate header at {found} ({reason})")
                        pos = found
                        chunk_end = found
                        break
                    else:
                        pos = chunk_end
                        break
                except Exception:
                    break
            try:
                idx_raw = struct.unpack_from('<H', data, pos)[0]
                pos += 2
            except struct.error:
                logger.warning("Struct error in facet line idx")
                break
            # zero is a valid line index (references first line entry) - do not skip
            sign = -1 if (idx_raw & 0x8000) else 1
            # clear origin/dynamic flags and keep sign bit
            idx = (idx_raw & 0x3FFF) * sign
            facet_lines.append(idx)
        # Accept partial facets when at least 3 line indices were collected.
        if len(facet_lines) >= 3:
            logger.debug(f"Parsed facet lines: {facet_lines}")
            facets.append(facet_lines)
        else:
            # If truncated but provided some indices, log and skip; otherwise silent skip
            if len(facet_lines) > 0:
                logger.debug(f"Skipping truncated facet with insufficient lines: {facet_lines}")
            else:
                logger.debug(f"Skipping facet with insufficient lines: {facet_lines}")
    if pos < chunk_end:
        logger.debug(f"Padding {chunk_end - pos} bytes in facets")
    pos = chunk_end
    return facets, pos


def parse_colors_chunk(data, start_pos, chunk_length):
    chunk_end = start_pos + chunk_length - 4
    pos = start_pos
    if pos + 2 > chunk_end:
        logger.warning("Incomplete colors header")
        return [], chunk_end
    try:
        num_cols = struct.unpack_from('<H', data, pos)[0]
        pos += 2
    except struct.error:
        logger.warning("Struct error in colors header")
        return [], chunk_end
    if num_cols > 2000:  # Increased cap
        logger.warning("Unreasonable num_cols, skipping")
        return [], chunk_end
    colors = []
    for _ in range(num_cols):
        if pos + 1 > chunk_end:
            logger.warning("Incomplete color byte")
            break
        colors.append(data[pos])
        pos += 1
    if pos < chunk_end:
        logger.debug(f"Padding {chunk_end - pos} bytes in colors")
    pos = chunk_end
    return colors, pos


def get_system_palette(idx):
    # Expanded with info from core_data_struct.txt and PAL chunk
    colors = [
        (0, 0, 0), (0, 0, 0), (0, 0, 167), (171, 0, 0), (0, 127, 0), (171, 0, 171), (163, 0, 167), (170, 170, 170),
        (85, 85, 85), (0, 187, 255), (0, 0, 255), (255, 0, 0), (0, 255, 0), (204, 204, 204), (255, 255, 0), (255, 255, 255),
        # Additional from PAL data in hex (normalized RGB)
        (244, 255, 238), (229, 206, 11), (234, 192, 0), (202, 161, 0), (255, 48, 48), (254, 17, 17), (240, 0, 0), (208, 0, 0),
        (85, 109, 254), (254, 52, 81), (255, 22, 50), (255, 0, 34), (243, 32, 160), (21, 16, 128), (3, 0, 255), (230, 0, 255)
    ]
    return colors[idx % len(colors)]


def lines_to_vertices(facets, lines, points, shape_index=0, debug=True, backtrack_top_k=4, backtrack_max_extra=8):
    """
    Convert facets (list of line indices lists) together with raw lines and points
    into faces expressed as vertex index lists (1-based for OBJ).
    The file stores line indices (signed) with sign indicating orientation and absolute
    values being 1-based indexes into the 'lines' list. Each 'line' contains two
    point indices (likely 1-based) which we convert to zero-based to index 'points'.
    """
    faces = []
    for facet_idx, facet in enumerate(facets):
        if not facet:
            continue
        # Filter invalid lines: require 1 <= abs(l) <= len(lines)
        valid_facet = [l for l in facet if 0 < abs(l) <= len(lines)]
        if len(valid_facet) < 3:
            logger.warning("Facet has too few valid lines, skipping")
            continue
        logger.debug(f"Building face for lines: {valid_facet}")

        # First, try simple ordered-side reconstruction: many SHAP facets list sides in polygon order.
        ordered_success = False
        for base_try in (0, 1):
            try:
                side_edges = []
                for l in valid_facet:
                    sign = 1 if l > 0 else -1
                    line_idx = abs(l) - base_try
                    if line_idx < 1 or line_idx > len(lines):
                        raise ValueError("line_idx out of range")
                    line_idx0 = line_idx - 1
                    p1_raw, p2_raw = lines[line_idx0]
                    p1 = p1_raw - base_try
                    p2 = p2_raw - base_try
                    if sign < 0:
                        p_from, p_to = p2, p1
                    else:
                        p_from, p_to = p1, p2
                    if p_from < 0 or p_from >= len(points) or p_to < 0 or p_to >= len(points):
                        raise ValueError("point index invalid")
                    side_edges.append((p_from, p_to))
                # Build loop: start from first side's from, then append each to
                loop = [side_edges[0][0]] + [e[1] for e in side_edges]
                # If closed (last == first) accept, else try reversing side order
                if loop[0] == loop[-1]:
                    faces.append([p + 1 for p in loop[:-1]])
                    ordered_success = True
                    break
                # try reversed order
                rev_edges = list(reversed(side_edges))
                loop = [rev_edges[0][0]] + [e[1] for e in rev_edges]
                if loop[0] == loop[-1]:
                    faces.append([p + 1 for p in loop[:-1]])
                    ordered_success = True
                    break
            except Exception:
                continue
        if ordered_success:
            continue

        # If ordered reconstruction failed, build directed_edges by trying index bases (0 or 1)
        directed_edges = None
        successful_base = None
        for base_try in (0, 1):
            tmp_edges = []
            failed = False
            for l in valid_facet:
                sign = 1 if l > 0 else -1
                abs_l = abs(l)
                if base_try == 1:
                    # expect 1..len(lines)
                    if abs_l < 1 or abs_l > len(lines):
                        failed = True
                        break
                    line_idx0 = abs_l - 1
                else:
                    # base_try == 0: accept 0..len(lines)-1 as valid 0-based line index
                    if abs_l < 0 or abs_l >= len(lines):
                        failed = True
                        break
                    line_idx0 = abs_l
                p1_raw, p2_raw = lines[line_idx0]
                p1 = p1_raw - base_try
                p2 = p2_raw - base_try
                if sign < 0:
                    p_from, p_to = p2, p1
                else:
                    p_from, p_to = p1, p2
                if p_from < 0 or p_from >= len(points) or p_to < 0 or p_to >= len(points):
                    failed = True
                    break
                tmp_edges.append((p_from, p_to))
            if not failed and len(tmp_edges) >= 3:
                directed_edges = tmp_edges
                successful_base = base_try
                break
        if directed_edges is None:
            logger.warning("Not enough valid directed edges after trying index bases, skipping facet")
            continue

        # Geometry-guided traversal: build adjacency from each vertex and choose the next edge
        # by selecting the outgoing edge that continues the polygon boundary with the
        # smallest left-turn (i.e., largest clockwise angle) relative to the current direction.
        # This respects side orientation, consumes multiplicity, and is robust for arbitrary side order.
        coords = points  # list of (x,y,z)

        # Build adjacency lists with multiplicity counts early so we can try Eulerian paths
        multiedges = defaultdict(int)
        out_map = defaultdict(list)  # u -> list of (v)
        nodes_set = set()
        for u, v in directed_edges:
            multiedges[(u, v)] += 1
            out_map[u].append(v)
            nodes_set.add(u)
            nodes_set.add(v)

        # truncation detection: if we filtered some invalid lines, mark truncated
        truncated = (len(valid_facet) != len(facet))

        # compute indegree/outdegree per vertex
        indeg = Counter()
        outdeg = Counter()
        for (u, v), m in multiedges.items():
            outdeg[u] += m
            indeg[v] += m

        # helper: undirected connectivity check for vertices with edges
        def undirected_connected():
            if not nodes_set:
                return False
            adj = defaultdict(set)
            for (u, v), m in multiedges.items():
                if m > 0:
                    adj[u].add(v)
                    adj[v].add(u)
            # BFS
            start = next(iter(nodes_set))
            seen = {start}
            stack = [start]
            while stack:
                x = stack.pop()
                for nb in adj.get(x, []):
                    if nb not in seen:
                        seen.add(nb)
                        stack.append(nb)
            return seen >= nodes_set

        # Eulerian (Hierholzer) pass: if indeg==outdeg for all nodes and connected, produce circuit
        eulerian = all(indeg[n] == outdeg[n] for n in nodes_set)
        if eulerian and undirected_connected() and not truncated:
            # build mutable multimap for traversal
            rem = dict(multiedges)

            def hierholzer(start):
                stack = [start]
                circuit = []
                while stack:
                    u = stack[-1]
                    # find a v with remaining edge
                    found = False
                    for (a, b), cnt in list(rem.items()):
                        if a == u and cnt > 0:
                            rem[(a, b)] -= 1
                            stack.append(b)
                            found = True
                            break
                    if not found:
                        circuit.append(stack.pop())
                return circuit[::-1]

            # pick start vertex with nonzero outdeg
            start_v = None
            for n in nodes_set:
                if outdeg.get(n, 0) > 0:
                    start_v = n
                    break
            if start_v is not None:
                circ = hierholzer(start_v)
                # verify all edges consumed
                if all(c == 0 for c in rem.values()) and len(circ) >= 2:
                    # circ is closed with last == first often; produce loop without trailing duplicate
                    if circ[0] == circ[-1]:
                        loop = circ[:-1]
                    else:
                        loop = circ
                    if len(loop) >= 3:
                        faces.append([p + 1 for p in loop])
                        continue

        # If Eulerian failed or truncated, try centroid-angle ordering of unique vertices
        # This is a lightweight heuristic that often recovers simple polygons when directed edges are noisy.
        unique_vs = sorted(nodes_set)
        if unique_vs:
            cx = sum(coords[v][0] for v in unique_vs) / len(unique_vs)
            cy = sum(coords[v][1] for v in unique_vs) / len(unique_vs)
            # capture atan2 locally to avoid closure issues
            atan2 = math.atan2
            vs_sorted = sorted(unique_vs, key=lambda v, _atan2=atan2: _atan2(coords[v][1] - cy, coords[v][0] - cx))
            if len(vs_sorted) >= 3 and not truncated:
                faces.append([p + 1 for p in vs_sorted])
                continue

        def vec(a, b):
            return (coords[b][0] - coords[a][0], coords[b][1] - coords[a][1])

        def angle_from(dir_vec, candidate_vec):
            # compute signed angle from dir_vec to candidate_vec in XY plane
            ax, ay = dir_vec
            bx, by = candidate_vec
            cross = ax * by - ay * bx
            dot = ax * bx + ay * by
            ang = math.atan2(cross, dot)  # signed angle (-pi..pi)
            return ang

        def build_cycle_by_geometry():
            # try each directed edge as a start
            for start_u, start_v in directed_edges:
                remaining = dict(multiedges)
                path = [start_u, start_v]
                remaining[(start_u, start_v)] -= 1
                # initial direction vector
                cur_dir = vec(start_u, start_v)
                # walk until cycle or fail
                while True:
                    cur = path[-1]
                    # if closed
                    if cur == path[0] and remaining and all(v == 0 for v in remaining.values()):
                        return path[:-1]
                    # candidate next vertices
                    candidates = []
                    for nx in set(out_map.get(cur, [])):
                        if remaining.get((cur, nx), 0) > 0:
                            candidates.append(nx)
                    if not candidates:
                        break
                    # choose candidate with minimal left turn (most negative angle) to continue polygon edge
                    best = None
                    best_ang = None
                    for nx in candidates:
                        cand_vec = vec(cur, nx)
                        ang = angle_from(cur_dir, cand_vec)
                        # prefer turning that keeps us going around boundary: smallest positive angle or if none, smallest magnitude
                        if best is None or ang < best_ang:
                            best = nx
                            best_ang = ang
                    # use chosen
                    remaining[(cur, best)] -= 1
                    path.append(best)
                    cur_dir = vec(cur, best)
                    # safety
                    if len(path) > len(directed_edges) + 5:
                        break
                # try next start edge
            return None

        cycle = build_cycle_by_geometry()
        if cycle:
            faces.append([p + 1 for p in cycle])
            continue

        # If greedy geometry traversal fails, try a bounded DFS/backtracking search
        # prioritized by geometric angle (prefer small left-turns). This allows limited
        # backtracking and tends to find correct polygon loops when greedy alone fails.

        def build_cycle_backtrack(max_depth=None, top_k=3):
            # allow deeper search by default
            if max_depth is None:
                max_depth = max(len(directed_edges) * 3, len(directed_edges) + 12)

            # precompute vector function
            def edge_vec(u, v):
                return (coords[v][0] - coords[u][0], coords[v][1] - coords[u][1])

            # compute bounding box diagonal to normalize distance penalty
            xs = [p[0] for p in coords]
            ys = [p[1] for p in coords]
            if xs and ys:
                bbox_diag = math.hypot(max(xs) - min(xs), max(ys) - min(ys))
                if bbox_diag == 0:
                    bbox_diag = 1.0
            else:
                bbox_diag = 1.0

            def score(dir_vec, cand_vec):
                # prefer smaller left-turn angles (more negative angles)
                ax, ay = dir_vec
                bx, by = cand_vec
                cross = ax * by - ay * bx
                dot = ax * bx + ay * by
                ang = math.atan2(cross, dot)
                # length penalty: prefer shorter continuation edges (normalized)
                length = math.hypot(bx, by) / bbox_diag
                # Combine: angle primary, then a small fraction of length
                return ang + 0.05 * length

            mult = dict(multiedges)

            # recursive dfs
            def dfs(path, cur_dir, remaining, depth):
                if depth > max_depth:
                    return None
                cur = path[-1]
                # success if closed and all edges consumed
                if cur == path[0] and all(v == 0 for v in remaining.values()):
                    return path[:-1]
                # gather candidates with remaining multiplicity
                cand_list = []
                for nx in set(out_map.get(cur, [])):
                    if remaining.get((cur, nx), 0) > 0:
                        cand_vec = edge_vec(cur, nx)
                        sc = score(cur_dir, cand_vec)
                        cand_list.append((sc, nx))
                if not cand_list:
                    return None
                # sort by score (ascending: prefer smallest left-turn)
                cand_list.sort(key=lambda x: x[0])
                # limit branching to top_k candidates
                for sc, nx in cand_list[:top_k]:
                    remaining[(cur, nx)] -= 1
                    path.append(nx)
                    next_dir = edge_vec(cur, nx)
                    res = dfs(path, next_dir, remaining, depth + 1)
                    if res:
                        return res
                    # backtrack
                    path.pop()
                    remaining[(cur, nx)] += 1
                return None

            # try each directed edge as start (prefer ones with more multiplicity)
            starts = sorted(directed_edges, key=lambda e: -mult.get(e, 0))
            for u, v in starts:
                rem = dict(mult)
                rem[(u, v)] -= 1
                path = [u, v]
                init_dir = edge_vec(u, v)
                res = dfs(path, init_dir, rem, 1)
                if res:
                    return res
            return None

        cycle = build_cycle_backtrack(max_depth=len(directed_edges) + backtrack_max_extra, top_k=backtrack_top_k)
        if cycle:
            faces.append([p + 1 for p in cycle])
            continue

        # Rounded-edge fallback: many older models represent rounded corners as
        # short segments/points clustered near the true corner. If cycle building
        # failed, try clustering nearby vertices (by XY distance) to compress the
        # graph, then attempt Eulerian/cycle/backtrack on the compressed graph.
        try:
            # bounding diag to set clustering tolerance
            xs = [coords[v][0] for v in nodes_set]
            ys = [coords[v][1] for v in nodes_set]
            if xs and ys:
                bbox_diag = math.hypot(max(xs) - min(xs), max(ys) - min(ys))
            else:
                bbox_diag = 0.0
            tol = bbox_diag * GLOBAL_CLUSTER_FRACTION if bbox_diag > 0 else 0.01

            # union-find for clustering
            parent = {v: v for v in nodes_set}
            def find(u):
                while parent[u] != u:
                    parent[u] = parent[parent[u]]
                    u = parent[u]
                return u
            def union(a, b):
                ra = find(a); rb = find(b)
                if ra != rb:
                    parent[rb] = ra

            nodes = list(nodes_set)
            for i in range(len(nodes)):
                for j in range(i+1, len(nodes)):
                    a = nodes[i]; b = nodes[j]
                    dx = coords[a][0] - coords[b][0]
                    dy = coords[a][1] - coords[b][1]
                    if math.hypot(dx, dy) <= tol:
                        union(a, b)

            clusters = defaultdict(list)
            for v in nodes:
                clusters[find(v)].append(v)

            if len(clusters) < len(nodes):
                # Build compressed mapping: pick representative vertex for each cluster
                comp_map = {}
                comp_idx_map = {}
                comp_nodes = []
                for ci, (root, members) in enumerate(clusters.items()):
                    # choose representative as cluster centroid nearest point
                    cx = sum(coords[m][0] for m in members) / len(members)
                    cy = sum(coords[m][1] for m in members) / len(members)
                    best = min(members, key=lambda m: (coords[m][0]-cx)**2 + (coords[m][1]-cy)**2)
                    comp_map[root] = best
                    comp_idx_map[root] = ci
                    comp_nodes.append(best)

                # rebuild directed edges on compressed indices
                comp_edges = []
                comp_mult = defaultdict(int)
                for (u, v), m in multiedges.items():
                    ru = find(u); rv = find(v)
                    cu = comp_idx_map[ru]; cv = comp_idx_map[rv]
                    comp_edges.append((cu, cv))
                    comp_mult[(cu, cv)] += m

                # attempt simple Eulerian/cycle/backtrack on compressed graph by remapping
                # prepare data structures similar to earlier code
                comp_out = defaultdict(list)
                comp_nodes_set = set()
                for (u, v), m in comp_mult.items():
                    if m > 0:
                        comp_out[u].append(v)
                        comp_nodes_set.add(u); comp_nodes_set.add(v)

                # try Hierholzer on compressed
                comp_indeg = Counter(); comp_outdeg = Counter()
                for (u, v), m in comp_mult.items():
                    comp_outdeg[u] += m; comp_indeg[v] += m
                comp_eulerian = all(comp_indeg[n] == comp_outdeg[n] for n in comp_nodes_set)
                def comp_hierholzer(start):
                    rem = dict(comp_mult)
                    stack = [start]; circ = []
                    while stack:
                        u = stack[-1]
                        found = False
                        for (a, b), cnt in list(rem.items()):
                            if a == u and cnt > 0:
                                rem[(a, b)] -= 1
                                stack.append(b); found = True; break
                        if not found:
                            circ.append(stack.pop())
                    return circ[::-1], rem

                if comp_eulerian and comp_nodes_set and not truncated:
                    start_v = next(iter(comp_nodes_set))
                    circ, rem = comp_hierholzer(start_v)
                    if circ and (circ[0] == circ[-1]):
                        loop = circ[:-1]
                    else:
                        loop = circ
                    if len(loop) >= 3 and all(v == 0 for v in rem.values()):
                        # map compressed nodes back to representative original vertex indices
                        rep_vertices = [comp_map[list(clusters.keys())[list(comp_idx_map.values()).index(n)]] for n in loop]
                        faces.append([rv + 1 for rv in rep_vertices])
                        logger.debug('Built face from compressed rounded-edge graph')
                        continue
        except Exception:
            logger.exception('Rounded-edge clustering fallback failed')

        # Diagnostic output: when cycle building fails and debug is enabled, write a small
        # debug OBJ and a candidate-angle table for manual inspection.
        if debug:
            try:
                dbg_dir = os.path.join(base, 'model_files', 'debug_facets')
                os.makedirs(dbg_dir, exist_ok=True)
                dbg_obj = os.path.join(dbg_dir, f'debug_shape_{shape_index}_facet_{facet_idx}.obj')
                dbg_txt = os.path.join(dbg_dir, f'debug_shape_{shape_index}_facet_{facet_idx}.txt')
                # write a tiny OBJ with vertices and line segments (edges)
                with open(dbg_obj, 'w') as dobj:
                    dobj.write(f"# Debug OBJ for shape {shape_index} facet {facet_idx}\n")
                    dobj.write(f"# original facet lines: {valid_facet}\n")
                    # write vertices
                    for (x, y, z) in points:
                        dobj.write(f"v {x:.6f} {y:.6f} {z:.6f}\n")
                    # write directed edges as lines using 1-based indices
                    for u, v in directed_edges:
                        dobj.write(f"l {u+1} {v+1}\n")
                # write a human-readable candidate/angle table
                with open(dbg_txt, 'w') as dtxt:
                    dtxt.write(f"Debug facet {facet_idx} for shape {shape_index}\n")
                    dtxt.write(f"Original facet lines: {valid_facet}\n")
                    dtxt.write("Directed edges (u->v) and multiplicity:\n")
                    for e, m in multiedges.items():
                        dtxt.write(f"  {e[0]} -> {e[1]}  mul={m}\n")
                    dtxt.write("\nOutgoing candidates and angles (deg) per vertex:\n")
                    for u in sorted(out_map.keys()):
                        dtxt.write(f" vertex {u}:\n")
                        for v in out_map[u]:
                            vx = coords[v][0] - coords[u][0]
                            vy = coords[v][1] - coords[u][1]
                            ang = math.degrees(math.atan2(vy, vx))
                            dtxt.write(f"    -> {v}  angle={ang:.2f}\n")
            except Exception:
                logger.exception("Failed to write debug facet files")

        # fallback greedy order -> fan triangulation
        verts = []
        seen = set()
        for u, v in directed_edges:
            if u not in seen:
                verts.append(u)
                seen.add(u)
            if v not in seen:
                verts.append(v)
                seen.add(v)
        if len(verts) >= 3:
            logger.warning("Cycle not found; using greedy vertex order with fan triangulation fallback")
            base_idx = verts[0] + 1
            for i in range(1, len(verts) - 1):
                faces.append([base_idx, verts[i] + 1, verts[i + 1] + 1])
        else:
            logger.warning("Failed to build cycle for facet")

    return faces


def write_obj(points, faces, colors,
              obj_file=os.path.join(base, 'model_files', 'workshop_slim_00_l307000_gpt.obj'),
              mtl_file=os.path.join(base, 'model_files', 'workshop_slim_00_l307000_gpt.mtl'),
              shape_name='Shape'):
    # ensure directory exists
    obj_dir = os.path.dirname(obj_file)
    if obj_dir and not os.path.exists(obj_dir):
        os.makedirs(obj_dir, exist_ok=True)

    with open(mtl_file, 'a') as f:
        for i, col_idx in enumerate(colors):
            r, g, b = get_system_palette(col_idx)
            f.write(f"newmtl color_{shape_name}_{i}\nKd {r/255:.3f} {g/255:.3f} {b/255:.3f}\n\n")
    with open(obj_file, 'a') as f:
        f.write(f"o {shape_name}\n")
        for x, y, z in points:
            f.write(f"v {x:.6f} {y:.6f} {z:.6f}\n")
        for i, face in enumerate(faces):
            if face:
                f.write(f"usemtl color_{shape_name}_{i % len(colors)}\n")  # Repeat colors if needed
                f.write("f " + " ".join(str(v) for v in face) + "\n")
    logger.info(f"Appended shape {shape_name} to {obj_file}, {mtl_file}")


def collect_stats(points, faces):
    # faces may include triangulated fans; count polygons vs triangles
    total_faces = len(faces)
    tri_faces = sum(1 for f in faces if len(f) == 3)
    poly_faces = total_faces - tri_faces
    verts = len(points)
    return {'verts': verts, 'total_faces': total_faces, 'tri_faces': tri_faces, 'poly_faces': poly_faces}


def main(hex_str, obj_file=os.path.join(base, 'model_files', 'workshop_slim_00_l307000_gpt.obj'),
         mtl_file=os.path.join(base, 'model_files', 'workshop_slim_00_l307000_gpt.mtl')):
    data = hex_to_bytes(hex_str)
    shap_offset = find_shap_offset(data)
    symbols, data_start = parse_file_header(data, shap_offset)
    pos = data_start
    shape_index = 0
    # Ensure output directory exists and clear files
    out_dir = os.path.dirname(obj_file)
    if out_dir and not os.path.exists(out_dir):
        os.makedirs(out_dir, exist_ok=True)
    open(mtl_file, 'w').close()  # Clear MTL
    open(obj_file, 'w').close()  # Clear OBJ
    while pos < len(data):
        if pos + 2 > len(data):
            break
        try:
            peek = struct.unpack_from('<H', data, pos)[0]
        except struct.error:
            logger.warning("Struct error in peek")
            break
        if peek == 0xFFFF:
            logger.info("End of shapes list")
            pos += 2
            break
        if pos >= symbols and symbols > 0:
            logger.info("Reached symbols, stopping")
            break
        logger.info(f"Starting shape {shape_index} at pos {pos}")
        size_x = size_y = size_z = 1.0
        points = None
        lines = []
        facets = []
        colors = []
        inner_pos = pos
        while inner_pos < len(data):
            if inner_pos + 4 > len(data):
                logger.error("Incomplete chunk header")
                break
            try:
                raw_chk_type = struct.unpack_from('<H', data, inner_pos)[0]
                inner_pos += 2
                if raw_chk_type == 0xFFFF:
                    logger.info("Found chunk terminator 0xFFFF")
                    break
                raw_length = struct.unpack_from('<H', data, inner_pos)[0]
                inner_pos += 2
            except struct.error:
                logger.warning("Struct error in chunk header")
                inner_pos = len(data)
                break
            # Mask high-bit flags which some SHAP variants use to mark special chunks.
            # APP_TYPE.H shows point flags 0x8000 and 0x4000 (E_PNTDYNAMIC/E_PNTORIGIN),
            # and we have observed both in chunk header words. Clear both so we
            # interpret chunk type/length correctly (14-bit payload fields).
            chk_type = raw_chk_type & 0x3FFF
            length = raw_length & 0x3FFF
            if raw_chk_type & ~0x3FFF or raw_length & ~0x3FFF:
                logger.debug(f"Masked high-bit flags in chunk header: raw_type=0x{raw_chk_type:04X} raw_len=0x{raw_length:04X} -> type=0x{chk_type:04X} len={length}")
            if length < 4:
                # Malformed chunk length (should be at least 4 for header). Force a
                # minimum length of 4 so we treat it as a zero-payload chunk and
                # advance correctly instead of repeatedly re-reading the same bytes.
                logger.warning(f"Invalid chunk length {length} for type 0x{chk_type:04X}, forcing minimum 4")
                length = 4
            if inner_pos + (length - 4) > len(data):
                logger.warning(f"Chunk overruns file: raw_type=0x{raw_chk_type:04X} raw_length={raw_length}. Truncating to available bytes.")
                # clamp to file end using masked length
                length = 4 + max(0, len(data) - inner_pos)
            if chk_type == 0x0006:
                if length - 4 >= 12:
                    try:
                        size_x, size_y, size_z = struct.unpack_from('<lll', data, inner_pos)
                        logger.debug(f"Sizes: {size_x} {size_y} {size_z}")
                    except struct.error:
                        logger.warning("Struct error in sizes")
                inner_pos += length - 4
            elif chk_type == 0x0000:
                points, inner_pos = parse_points_chunk(data, inner_pos, length, size_x, size_y, size_z)
            elif chk_type == 0x0001:
                lines, inner_pos = parse_lines_chunk(data, inner_pos, length)
            elif chk_type == 0x0002:
                facets, inner_pos = parse_facets_chunk(data, inner_pos, length)
            elif chk_type == 0x0003:
                colors, inner_pos = parse_colors_chunk(data, inner_pos, length)
            elif chk_type in (0x0004, 0x0005, 0x0007, 0x000A):
                inner_pos += length - 4  # Skip known unused
            else:
                logger.debug(f"Skipping unknown chunk 0x{chk_type:04X} length {length}")
                inner_pos += length - 4
        pos = inner_pos
        if points and lines and facets:
            # pass shape index and enable per-facet debugging for failing facets
            faces = lines_to_vertices(facets, lines, points, shape_index=shape_index, debug=True, backtrack_top_k=6, backtrack_max_extra=12)
            if not colors:
                # default color index 1 for each facet if none provided
                colors = [1] * max(1, len(faces))
            write_obj(points, faces, colors, obj_file, mtl_file, f"Shape_{shape_index}")
        else:
            logger.error(f"Missing essential chunks for shape {shape_index} (points:{bool(points)}, lines:{bool(lines)}, facets:{bool(facets)})")
        shape_index += 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Convert SHAP hex dump to OBJ/MTL. Use --compare to run parse-mode comparison.')
    parser.add_argument('--force-parse', choices=['fixed', 'float', 'auto'], default='auto', help='Force point parse mode')
    parser.add_argument('--compare', action='store_true', help='Run compare mode (fixed vs float vs auto) and print stats')
    parser.add_argument('--cluster-fraction', type=float, default=None, help='Override clustering tolerance fraction (e.g., 0.03)')
    parser.add_argument('--backtrack-top-k', type=int, default=None, help='Override backtrack_top_k')
    parser.add_argument('--backtrack-max-extra', type=int, default=None, help='Override backtrack_max_extra')
    parser.add_argument('--out-prefix', default='compare_runs', help='Output prefix directory under model_files to write OBJ results during sweep')
    args = parser.parse_args()

    txt_path = os.path.join(base, 'model_files', "workshop_slim_00_l307000.txt")
    if not os.path.exists(txt_path):
        logger.error(f"Input file not found: {txt_path}")
        sys.exit(1)
    with open(txt_path, 'r') as f:
        hex_str = f.read()

    # helper to collect stats for a pass
    def collect_pass(force_mode):
        global FORCE_PARSE
        prev = FORCE_PARSE if 'FORCE_PARSE' in globals() else None
        FORCE_PARSE = force_mode
        data = hex_to_bytes(hex_str)
        shap_offset = find_shap_offset(data)
        symbols, data_start = parse_file_header(data, shap_offset)
        local_pos = data_start
        shape_idx = 0
        results = []
        while local_pos < len(data):
            if local_pos + 2 > len(data):
                break
            try:
                peek = struct.unpack_from('<H', data, local_pos)[0]
            except struct.error:
                break
            if peek == 0xFFFF:
                local_pos += 2
                break
            if local_pos >= symbols and symbols > 0:
                break
            size_x = size_y = size_z = 1.0
            points = None
            lines = []
            facets = []
            colors = []
            inner_pos = local_pos
            while inner_pos < len(data):
                if inner_pos + 4 > len(data):
                    break
                try:
                    raw_chk_type = struct.unpack_from('<H', data, inner_pos)[0]
                    inner_pos += 2
                    if raw_chk_type == 0xFFFF:
                        break
                    raw_length = struct.unpack_from('<H', data, inner_pos)[0]
                    inner_pos += 2
                except struct.error:
                    inner_pos = len(data)
                    break
                # mask high-bit flags
                chk_type = raw_chk_type & 0x3FFF
                length = raw_length & 0x3FFF
                if raw_chk_type & ~0x3FFF or raw_length & ~0x3FFF:
                    logger.debug(f"Masked high-bit flags in chunk header (collect_pass): raw_type=0x{raw_chk_type:04X} raw_len=0x{raw_length:04X} -> type=0x{chk_type:04X} len={length}")
                if length < 4:
                    # Malformed chunk length in collect_pass: force minimum to avoid
                    # stalling the inner loop while remaining defensive.
                    logger.debug(f"collect_pass: invalid chunk length {length} for type 0x{chk_type:04X}, forcing minimum 4")
                    length = 4
                if inner_pos + (length - 4) > len(data):
                    length = 4 + max(0, len(data) - inner_pos)
                if chk_type == 0x0006:
                    if length - 4 >= 12:
                        try:
                            size_x, size_y, size_z = struct.unpack_from('<lll', data, inner_pos)
                        except struct.error:
                            pass
                    inner_pos += length - 4
                elif chk_type == 0x0000:
                    points, inner_pos = parse_points_chunk(data, inner_pos, length, size_x, size_y, size_z)
                elif chk_type == 0x0001:
                    lines, inner_pos = parse_lines_chunk(data, inner_pos, length)
                elif chk_type == 0x0002:
                    facets, inner_pos = parse_facets_chunk(data, inner_pos, length)
                elif chk_type == 0x0003:
                    colors, inner_pos = parse_colors_chunk(data, inner_pos, length)
                else:
                    inner_pos += length - 4
            local_pos = inner_pos
            if points and lines and facets:
                faces = lines_to_vertices(facets, lines, points, shape_index=shape_idx, debug=False, backtrack_top_k=6, backtrack_max_extra=12)
                results.append(collect_stats(points, faces))
            shape_idx += 1
        FORCE_PARSE = prev
        return results

    if args.compare:
        logger.info('Compare mode: fixed-only, float-only, auto')
        fixed = collect_pass('fixed')
        flt = collect_pass('float')
        auto = collect_pass(None)
        # Print per-shape and totals
        print('\nCOMPARE RESULTS:')
        for i in range(max(len(fixed), len(flt), len(auto))):
            f = fixed[i] if i < len(fixed) else {'verts':0,'total_faces':0,'tri_faces':0,'poly_faces':0}
            fo = flt[i] if i < len(flt) else {'verts':0,'total_faces':0,'tri_faces':0,'poly_faces':0}
            a = auto[i] if i < len(auto) else {'verts':0,'total_faces':0,'tri_faces':0,'poly_faces':0}
            print(f"Shape {i}: fixed v:{f['verts']} f:{f['total_faces']} (tri:{f['tri_faces']}) | float v:{fo['verts']} f:{fo['total_faces']} (tri:{fo['tri_faces']}) | auto v:{a['verts']} f:{a['total_faces']} (tri:{a['tri_faces']})")
        def sum_all(lst):
            s = {'verts':0,'total_faces':0,'tri_faces':0,'poly_faces':0}
            for it in lst:
                for k in s:
                    s[k] += it.get(k, 0)
            return s
        sf = sum_all(fixed); sfl = sum_all(flt); sa = sum_all(auto)
        print('\nTOTALS:')
        print(f"fixed: verts:{sf['verts']} faces:{sf['total_faces']} tri:{sf['tri_faces']}")
        print(f"float: verts:{sfl['verts']} faces:{sfl['total_faces']} tri:{sfl['tri_faces']}")
        print(f"auto : verts:{sa['verts']} faces:{sa['total_faces']} tri:{sa['tri_faces']}")
        sys.exit(0)
    else:
        # Set global FORCE_PARSE and run normal conversion writing OBJ/MTL
        FORCE_PARSE = None if args.force_parse == 'auto' else args.force_parse
    # apply CLI overrides
        if args.cluster_fraction is not None:
            GLOBAL_CLUSTER_FRACTION = args.cluster_fraction
        if args.backtrack_top_k is not None:
            GLOBAL_BACKTRACK_TOP_K = args.backtrack_top_k
        if args.backtrack_max_extra is not None:
            GLOBAL_BACKTRACK_MAX_EXTRA = args.backtrack_max_extra

        # If out-prefix present and compare True not set, do a sweep for requested combinations
        out_dir_base = os.path.join(base, 'model_files', args.out_prefix)
        os.makedirs(out_dir_base, exist_ok=True)

        # Default sweep values
        cluster_fracs = [0.01, 0.02, 0.03, 0.05]
        top_ks = [4, 6, 8]
        max_extra = GLOBAL_BACKTRACK_MAX_EXTRA

        csv_lines = ["run,cluster_frac,top_k,verts,total_faces,tri_faces,poly_faces,obj_path"]
        # run sweep
        for cf in cluster_fracs:
            GLOBAL_CLUSTER_FRACTION = cf
            for tk in top_ks:
                GLOBAL_BACKTRACK_TOP_K = tk
                GLOBAL_BACKTRACK_MAX_EXTRA = max_extra
                # prepare unique output file
                obj_out = os.path.join(out_dir_base, f"obj_cf{int(cf*100)}_tk{tk}.obj")
                mtl_out = obj_out.replace('.obj', '.mtl')
                # clear outputs
                open(mtl_out, 'w').close()
                open(obj_out, 'w').close()
                # run main conversion writing to the specific files
                try:
                    main(hex_str, obj_file=obj_out, mtl_file=mtl_out)
                except Exception:
                    logger.exception('Conversion failed for sweep run')
                # collect stats by re-parsing result in memory (cheap: call collect_pass-like one-shape read)
                # We'll reuse the existing collect_pass but simplified: re-run parse once with FORCE_PARSE and globals
                def gather():
                    data = hex_to_bytes(hex_str)
                    shap_offset = find_shap_offset(data)
                    symbols, data_start = parse_file_header(data, shap_offset)
                    local_pos = data_start
                    while local_pos < len(data):
                        if local_pos + 2 > len(data):
                            break
                        try:
                            peek = struct.unpack_from('<H', data, local_pos)[0]
                        except struct.error:
                            break
                        if peek == 0xFFFF:
                            local_pos += 2
                            break
                        if local_pos >= symbols and symbols > 0:
                            break
                        size_x = size_y = size_z = 1.0
                        points = None; lines = []; facets = []
                        inner_pos = local_pos
                        while inner_pos < len(data):
                            if inner_pos + 4 > len(data):
                                break
                            try:
                                raw_chk_type = struct.unpack_from('<H', data, inner_pos)[0]
                                inner_pos += 2
                                if raw_chk_type == 0xFFFF:
                                    break
                                raw_length = struct.unpack_from('<H', data, inner_pos)[0]
                                inner_pos += 2
                            except struct.error:
                                inner_pos = len(data); break
                            # mask high-bit flags
                            chk_type = raw_chk_type & 0x3FFF
                            length = raw_length & 0x3FFF
                            if raw_chk_type & ~0x3FFF or raw_length & ~0x3FFF:
                                logger.debug(f"Masked high-bit flags in chunk header (gather): raw_type=0x{raw_chk_type:04X} raw_len=0x{raw_length:04X} -> type=0x{chk_type:04X} len={length}")
                            if length < 4:
                                # Malformed chunk length in gather: force minimum and continue
                                # processing as a zero-payload chunk so parsing resynchronizes.
                                logger.debug(f"gather: invalid chunk length {length} for type 0x{chk_type:04X}, forcing minimum 4")
                                length = 4
                            if inner_pos + (length - 4) > len(data):
                                length = 4 + max(0, len(data) - inner_pos)
                            if chk_type == 0x0006:
                                if length - 4 >= 12:
                                    try:
                                        size_x, size_y, size_z = struct.unpack_from('<lll', data, inner_pos)
                                    except struct.error:
                                        pass
                                inner_pos += length - 4
                            elif chk_type == 0x0000:
                                points, inner_pos = parse_points_chunk(data, inner_pos, length, size_x, size_y, size_z)
                            elif chk_type == 0x0001:
                                lines, inner_pos = parse_lines_chunk(data, inner_pos, length)
                            elif chk_type == 0x0002:
                                facets, inner_pos = parse_facets_chunk(data, inner_pos, length)
                            else:
                                inner_pos += length - 4
                        local_pos = inner_pos
                        if points and lines and facets:
                            faces = lines_to_vertices(facets, lines, points, shape_index=0, debug=False, backtrack_top_k=GLOBAL_BACKTRACK_TOP_K, backtrack_max_extra=GLOBAL_BACKTRACK_MAX_EXTRA)
                            return collect_stats(points, faces)
                    return {'verts':0,'total_faces':0,'tri_faces':0,'poly_faces':0}
                stats = gather()
                csv_lines.append(f"run_cf{cf}_tk{tk},{cf},{tk},{stats['verts']},{stats['total_faces']},{stats['tri_faces']},{stats['poly_faces']},{obj_out}")

        # write CSV summary
        csv_path = os.path.join(out_dir_base, 'sweep_summary.csv')
        with open(csv_path, 'w') as cf:
            cf.write('\n'.join(csv_lines))
        print(f"Sweep complete. Results and OBJs saved under: {out_dir_base}. Summary: {csv_path}")
        sys.exit(0)