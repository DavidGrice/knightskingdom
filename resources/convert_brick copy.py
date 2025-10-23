# ...existing code...
import logging
import struct
import os

from collections import defaultdict

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
base = os.path.dirname(os.path.abspath(__file__))

# Heuristics: toggle these to try different interpretations of indices/fields
# Some SHAP variants use 0-based indices; some store geometric point indices as unsigned
ZERO_BASE_INDICES = True
GEOM_POINT_UNSIGNED = True


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

    # seed points (0..7) - unit cube, we'll scale later by sizes
    points = [
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
    # Quick-detect: if remaining bytes match num_points * 8, many SHAP variants
    # store points as two float32 values (8 bytes per point). Parse that first.
    remaining = chunk_end - pos
    if remaining == num_points * 8:
        logger.debug("Detected 8-byte-per-point layout: parsing as float32 pairs")
        for i in range(num_points):
            if pos + 8 > chunk_end:
                logger.warning("Incomplete float point entry")
                break
            try:
                x = struct.unpack_from('<f', data, pos)[0]
                y = struct.unpack_from('<f', data, pos+4)[0]
                pos += 8
            except struct.error:
                logger.warning("Struct error reading float point")
                break
            points.append((x, y, 0.0))
        # scale and return
        scaled = [(x * size_x, y * size_y, z * size_z) for x, y, z in points]
        if pos < chunk_end:
            logger.debug(f"Padding {chunk_end - pos} bytes in points")
        pos = chunk_end
        return scaled, pos

    for i in range(num_points):
        if pos + 2 > chunk_end:
            logger.warning("Incomplete point entry")
            break
        try:
            header = struct.unpack_from('<H', data, pos)[0]
        except struct.error:
            logger.warning("Struct error in point header")
            break
        pos += 2
        is_dynamic = bool(header & E_PNTDYNAMIC)
        ptype = header & E_PNTTYPEMASK

        if ptype == E_PNTGEOMTYPE:
            # geometric entry: Point1, Point2 (shorts), Shift (uchar), Mult (uchar)
            if pos + 6 > chunk_end:
                logger.warning("Incomplete geometric point data")
                break
            try:
                if GEOM_POINT_UNSIGNED:
                    p1 = struct.unpack_from('<H', data, pos)[0]
                    pos += 2
                    p2 = struct.unpack_from('<H', data, pos)[0]
                    pos += 2
                else:
                    p1 = struct.unpack_from('<h', data, pos)[0]
                    pos += 2
                    p2 = struct.unpack_from('<h', data, pos)[0]
                    pos += 2
                shift = struct.unpack_from('<B', data, pos)[0]
                pos += 1
                mult = struct.unpack_from('<B', data, pos)[0]
                pos += 1
                den = 1 << shift if shift < 31 else 1
                frac = (mult / den) if den != 0 else 0
                # file indices appear to be 1-based
                try:
                    if ZERO_BASE_INDICES:
                        a = points[p1]
                        b = points[p2]
                    else:
                        a = points[p1 - 1]
                        b = points[p2 - 1]
                    x = a[0] + (b[0] - a[0]) * frac
                    y = a[1] + (b[1] - a[1]) * frac
                    z = a[2] + (b[2] - a[2]) * frac
                except Exception:
                    logger.warning("Index error in geometric point access")
                    x = y = z = 0.0
            except struct.error:
                logger.warning("Struct error in geometric point")
                break
            bytes_per_pos = 2 + 6
        else:
            # relative/absolute: header contains first signed short (x), then y,z
            if pos + 4 > chunk_end:
                logger.warning("Incomplete relative/abs point data")
                break
            try:
                x = struct.unpack('<h', struct.pack('<H', header))[0] / 16384.0
                y = struct.unpack_from('<h', data, pos)[0] / 16384.0
                pos += 2
                z = struct.unpack_from('<h', data, pos)[0] / 16384.0
                pos += 2
            except struct.error:
                logger.warning("Struct error in relative/abs point")
                break
            bytes_per_pos = 2 + 4

        points.append((x, y, z))

        # if dynamic, skip remaining cells for this point (we only used the first cell)
        if is_dynamic and num_cels > 1:
            skip_bytes = (num_cels - 1) * bytes_per_pos
            if pos + skip_bytes > chunk_end:
                logger.warning("Dynamic cell skip would overrun, adjusting")
                pos = chunk_end
            else:
                pos += skip_bytes

    # Scale points by shape size vectors
    scaled = [(x * size_x, y * size_y, z * size_z) for x, y, z in points]
    if pos < chunk_end:
        logger.debug(f"Padding {chunk_end - pos} bytes in points")
    pos = chunk_end
    return scaled, pos


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
    for _ in range(num_facets):
        if pos + 4 > chunk_end:
            logger.warning("Incomplete facet header")
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
        if len(facet_lines) >= 3:
            logger.debug(f"Parsed facet lines: {facet_lines}")
            facets.append(facet_lines)
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


def lines_to_vertices(facets, lines, points):
    """
    Convert facets (list of line indices lists) together with raw lines and points
    into faces expressed as vertex index lists (1-based for OBJ).
    The file stores line indices (signed) with sign indicating orientation and absolute
    values being 1-based indexes into the 'lines' list. Each 'line' contains two
    point indices (likely 1-based) which we convert to zero-based to index 'points'.
    """
    faces = []
    for facet in facets:
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
                line_idx = abs(l) - base_try
                if line_idx < 1 or line_idx > len(lines):
                    failed = True
                    break
                line_idx0 = line_idx - 1
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

        # Count available directed edges (there can be duplicates)
        edge_counts = defaultdict(int)
        out_edges = defaultdict(list)
        in_degree = defaultdict(int)
        out_degree = defaultdict(int)
        for u, v in directed_edges:
            edge_counts[(u, v)] += 1
            out_edges[u].append(v)
            out_degree[u] += 1
            in_degree[v] += 1

        # Try to find an Eulerian circuit that uses each directed edge exactly once.
        # This is robust for polygons encoded as directed edges with multiplicity.
        def find_eulerian_cycle():
            # quick degree check: in_degree == out_degree for all vertices in the subgraph
            verts = set(in_degree.keys()) | set(out_degree.keys())
            for vv in verts:
                if in_degree.get(vv, 0) != out_degree.get(vv, 0):
                    return None
            # copy mutable edge counts
            remaining = dict(edge_counts)
            # adjacency map from u to list of v (we'll pop from list)
            adj = {u: list(out_edges[u]) for u in out_edges}
            # find a start vertex with outgoing edges
            if not adj:
                return None
            start = next(iter(adj))
            stack = [start]
            circuit = []
            while stack:
                v = stack[-1]
                if v in adj and adj[v]:
                    w = adj[v].pop(0)
                    # consume one directed edge (v,w)
                    if remaining.get((v, w), 0) > 0:
                        remaining[(v, w)] -= 1
                        stack.append(w)
                    else:
                        # edge already used, keep looking
                        continue
                else:
                    circuit.append(stack.pop())
            # circuit holds vertices in reverse order and should form a closed loop
            if len(circuit) < 2:
                return None
            circuit = circuit[::-1]
            # ensure the cycle uses the correct number of directed edges
            used_edges = 0
            for i in range(len(circuit) - 1):
                u = circuit[i]
                v = circuit[i+1]
                # original multiplicity may be >1; count used
                if (u, v) in edge_counts:
                    used_edges += 1
            if used_edges != len(directed_edges):
                return None
            # drop the duplicate last vertex
            if circuit[0] == circuit[-1]:
                circuit = circuit[:-1]
            return circuit

        cycle = find_eulerian_cycle()

        if cycle:
            # Convert zero-based points to OBJ 1-based indices
            faces.append([p + 1 for p in cycle])
            continue

        # As a last resort attempt a greedy walk over unique vertices order
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
                chk_type = struct.unpack_from('<H', data, inner_pos)[0]
                inner_pos += 2
                if chk_type == 0xFFFF:
                    logger.info("Found chunk terminator 0xFFFF")
                    break
                length = struct.unpack_from('<H', data, inner_pos)[0]
                inner_pos += 2
            except struct.error:
                logger.warning("Struct error in chunk header")
                inner_pos = len(data)
                break
            if length < 4:
                logger.warning(f"Invalid chunk length {length} for type 0x{chk_type:04X}, skipping")
                continue
            if inner_pos + (length - 4) > len(data):
                logger.warning(f"Chunk overruns file: type 0x{chk_type:04X}, length {length}. Truncating.")
                # clamp to file end
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
            faces = lines_to_vertices(facets, lines, points)
            if not colors:
                # default color index 1 for each facet if none provided
                colors = [1] * max(1, len(faces))
            write_obj(points, faces, colors, obj_file, mtl_file, f"Shape_{shape_index}")
        else:
            logger.error(f"Missing essential chunks for shape {shape_index} (points:{bool(points)}, lines:{bool(lines)}, facets:{bool(facets)})")
        shape_index += 1


# Example usage:
if __name__ == "__main__":
    txt_path = os.path.join(base, 'model_files', "workshop_slim_00_l307000.txt")
    if not os.path.exists(txt_path):
        logger.error(f"Input file not found: {txt_path}")
    else:
        with open(txt_path, 'r') as f:
            hex_str = f.read()
        try:
            main(hex_str)
        except Exception as e:
            logger.exception("Unhandled exception in main")

# Example usage:
with open(os.path.join(base, 'model_files', "workshop_slim_00_l307000.txt"), 'r') as f:
    hex_str = f.read()
main(hex_str)