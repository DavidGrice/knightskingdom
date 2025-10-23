import logging
import struct
import os

from collections import defaultdict

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
base = os.path.dirname(os.path.abspath(__file__))

def hex_to_bytes(hex_str):
    cleaned = ''.join(hex_str.split())
    try:
        return bytes.fromhex(cleaned)
    except ValueError as e:
        logger.error(f"Error converting hex to bytes: {e}")
        raise

def find_shap_offset(data):
    header_start = b'SuperScape (c) New Dimension International Ltd.'
    offset = data.find(header_start)
    if offset == -1:
        raise ValueError("Header not found")
    offset = data.find(header_start, offset + len(header_start))
    if offset == -1:
        raise ValueError("SHAP header not found")
    logger.debug(f"SHAP header at {offset}")
    return offset

def parse_file_header(data, offset):
    text = data[offset:offset+200].decode('ascii', errors='ignore').rstrip('\x00')
    spares = struct.unpack_from('<10l', data, offset+200)
    symbols_offset = struct.unpack_from('<l', data, offset+240)[0]
    file_type = data[offset+244:offset+248].decode('ascii')
    machine = struct.unpack_from('<H', data, offset+248)[0]
    revision = struct.unpack_from('<l', data, offset+250)[0]
    version = data[offset+254]
    sub_version = data[offset+255]
    logger.info(f"Type: {file_type}, Rev: {revision}, Ver: {version}.{sub_version}, Symbols: {symbols_offset}")
    if file_type != 'SHAP':
        raise ValueError("Not SHAP")
    return symbols_offset, offset + 256

def parse_points_chunk(data, start_pos, chunk_length, size_x, size_y, size_z):
    chunk_end = start_pos + chunk_length - 4
    pos = start_pos
    if pos + 6 > chunk_end:
        logger.warning("Incomplete points header")
        return [], chunk_end
    try:
        num_cels, num_dyn, num_static = struct.unpack_from('<HHH', data, pos)
    except struct.error:
        logger.warning("Struct error in points header")
        return [], chunk_end
    pos += 6
    logger.debug(f"Points num_cels={num_cels} num_dyn={num_dyn} num_static={num_static}")
    points = [
        (0,0,0), (0,0,1), (0,1,0), (0,1,1), (1,0,0), (1,0,1), (1,1,0), (1,1,1)
    ]
    # Parse static points
    for _ in range(num_static):
        if pos + 2 > chunk_end:
            logger.warning("Incomplete static point")
            break
        try:
            word = struct.unpack_from('<h', data, pos)[0]
        except struct.error:
            logger.warning("Struct error in static word")
            break
        pos += 2
        if word & 0x8000:
            if pos + 6 > chunk_end:
                logger.warning("Incomplete geometric static")
                break
            try:
                log_den = word & 0x001F
                den = 1 << log_den
                p1 = struct.unpack_from('<h', data, pos)[0] & 0x7FFF
                pos += 2
                p2 = struct.unpack_from('<h', data, pos)[0] & 0x7FFF
                pos += 2
                num = struct.unpack_from('<h' , data, pos)[0]
                pos += 2
                frac = num / den
                px1, py1, pz1 = points[p1]
                px2, py2, pz2 = points[p2]
                x = px1 + (px2 - px1) * frac
                y = py1 + (py2 - py1) * frac
                z = pz1 + (pz2 - pz1) * frac
            except struct.error:
                logger.warning("Struct error in geometric static")
                break
            except IndexError:
                logger.warning("Index error in geometric static points access")
                break
        else:
            if pos + 4 > chunk_end:
                logger.warning("Incomplete relative static")
                break
            try:
                x = word / 16384.0
                y = struct.unpack_from('<h', data, pos)[0] / 16384.0
                pos += 2
                z = struct.unpack_from('<h', data, pos)[0] / 16384.0
                pos += 2
            except struct.error:
                logger.warning("Struct error in relative static")
                break
            points.append((x, y, z))
    # Parse dynamic points
    for _ in range(num_dyn):
        if pos + 2 > chunk_end:
            logger.warning("Incomplete dynamic point")
            break
        try:
            word = struct.unpack_from('<h', data, pos)[0]
        except struct.error:
            logger.warning("Struct error in dynamic word")
            break
        pos += 2
        bytes_per_pos = 8 if word & 0x8000 else 6
        if word & 0x8000:
            if pos + 6 > chunk_end:
                logger.warning("Incomplete geometric dynamic")
                break
            try:
                log_den = word & 0x001F
                den = 1 << log_den
                p1 = struct.unpack_from('<h', data, pos)[0] & 0x7FFF
                pos += 2
                p2 = struct.unpack_from('<h', data, pos)[0] & 0x7FFF
                pos += 2
                num = struct.unpack_from('<h', data, pos)[0]
                pos += 2
                frac = num / den
                px1, py1, pz1 = points[p1]
                px2, py2, pz2 = points[p2]
                x = px1 + (px2 - px1) * frac
                y = py1 + (py2 - py1) * frac
                z = pz1 + (pz2 - pz1) * frac
                points.append((x, y, z))
            except struct.error:
                logger.warning("Struct error in geometric dynamic")
                break
            except IndexError:
                logger.warning("Index error in geometric dynamic points access")
                break
        else:
            if pos + 4 > chunk_end:
                logger.warning("Incomplete relative dynamic")
                break
            try:
                x = word / 16384.0
                y = struct.unpack_from('<h', data, pos)[0] / 16384.0
                pos += 2
                z = struct.unpack_from('<h', data, pos)[0] / 16384.0
                pos += 2
                points.append((x, y, z))
            except struct.error:
                logger.warning("Struct error in relative dynamic")
                break
        skip_bytes = (num_cels - 1) * bytes_per_pos
        if pos + skip_bytes > chunk_end:
            logger.warning("Skip would overrun, adjusting")
            pos = chunk_end
        else:
            pos += skip_bytes
    scaled = [(x * size_x, y * size_y, z * size_z) for x, y, z in points]
    if pos < chunk_end:
        logger.debug(f"Padding {chunk_end - pos} bytes in points")
    pos = chunk_end
    return scaled, pos

def parse_lines_chunk(data, start_pos, chunk_length):
    chunk_end = start_pos + chunk_length - 4
    pos = start_pos
    lines = []
    while pos + 4 <= chunk_end:
        try:
            p1 = struct.unpack_from('<h', data, pos)[0]
            pos += 2
            p2 = struct.unpack_from('<h', data, pos)[0]
            pos += 2
        except struct.error:
            logger.warning("Struct error in lines")
            break
        lines.append((p1, p2))
    if pos < chunk_end:
        logger.debug(f"Padding {chunk_end - pos} bytes in lines")
    pos = chunk_end
    return lines, pos

def parse_facets_chunk(data, start_pos, chunk_length):
    chunk_end = start_pos + chunk_length - 4
    pos = start_pos
    if pos + 4 > chunk_end:
        logger.warning("Incomplete facets header")
        return [], chunk_end
    try:
        num_facets = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        spare = struct.unpack_from('<H', data, pos)[0]
        pos += 2
    except struct.error:
        logger.warning("Struct error in facets header")
        return [], chunk_end
    if num_facets > 2000:
        logger.warning("Unreasonable num_facets, skipping")
        return [], chunk_end
    facets = []
    for _ in range(num_facets):
        if pos + 2 > chunk_end:
            logger.warning("Incomplete num_sides")
            break
        try:
            num_sides = struct.unpack_from('<H', data, pos)[0]
            pos += 2
        except struct.error:
            logger.warning("Struct error in num_sides")
            break
        if num_sides > 200:
            logger.warning("Unreasonable num_sides, skipping facet")
            pos += 2 * num_sides if pos + 2 * num_sides <= chunk_end else chunk_end - pos
            continue
        facet_lines = []
        for __ in range(num_sides):
            if pos + 2 > chunk_end:
                logger.warning("Incomplete line idx")
                break
            try:
                idx = struct.unpack_from('<H', data, pos)[0]
                pos += 2
            except struct.error:
                logger.warning("Struct error in line idx")
                break
            line_num = idx & 0x7FFF
            if line_num == 0 or line_num > 32766:
                logger.warning(f"Ignoring invalid line num {line_num}")
                continue
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
    if num_cols > 2000:
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
    colors = [
        (0,0,0), (0,0,0), (0,0,167), (171,0,0), (0,127,0), (171,0,171), (163,0,167), (170,170,170),
        (85,85,85), (0,187,255), (0,0,255), (255,0,0), (0,255,0), (204,204,204), (255,255,0), (255,255,255),
        (244,255,238), (229,206,11), (234,192,0), (202,161,0), (255,48,48), (254,17,17), (240,0,0), (208,0,0),
        (85,109,254), (254,52,81), (255,22,50), (255,0,34), (243,32,160), (21,16,128), (3,0,255), (230,0,255)
    ]
    return colors[idx % len(colors)]

def lines_to_vertices(facets, lines, points):
    faces = []
    for facet_idx, facet in enumerate(facets):
        if not facet:
            continue
        valid_facet = []
        for idx in facet:
            line_num = idx & 0x7FFF
            if line_num == 0 or line_num > len(lines):
                logger.warning(f"Invalid line num {line_num} for facet {facet_idx}")
                continue
            valid_facet.append(idx)
        if len(valid_facet) < 3:
            logger.warning(f"Facet {facet_idx} has too few valid lines, skipping")
            continue
        logger.debug(f"Building face for lines: {valid_facet}")
        # Convert to directed edges
        directed_edges = []
        for idx in valid_facet:
            dir_sign = -1 if idx & 0x8000 else 1
            l = idx & 0x7FFF - 1  # 0-based
            p1, p2 = lines[l]
            if dir_sign < 0:
                p1, p2 = p2, p1
            directed_edges.append((p1, p2))
        # Chain them
        current_loop = [directed_edges[0][0] + 1, directed_edges[0][1] + 1]
        current = directed_edges[0][1]
        remaining_edges = directed_edges[1:]
        while remaining_edges:
            found = False
            for i, next_edge in enumerate(remaining_edges):
                q1, q2 = next_edge
                if q1 == current:
                    current_loop.append(q2 + 1)
                    current = q2
                    del remaining_edges[i]
                    found = True
                    break
                elif q2 == current:
                    current_loop.append(q1 + 1)
                    current = q1
                    del remaining_edges[i]
                    found = True
                    break
            if not found:
                logger.warning(f"Cannot connect all edges in facet {facet_idx}")
                break
        if not remaining_edges and len(current_loop) >= 3:
            # Check if closes
            if current == current_loop[0] - 1:
                current_loop.pop()
            faces.append(current_loop)
        else:
            if len(current_loop) >= 3:
                logger.warning(f"Using fan triangulation as fallback for facet {facet_idx}")
                for i in range(1, len(current_loop) - 1):
                    faces.append([current_loop[0], current_loop[i], current_loop[i + 1]])
            else:
                logger.warning(f"Failed to build valid face for facet {facet_idx}")
    return faces

def write_obj(points, faces, colors,
              obj_file=os.path.join(base, 'model_files', 'workshop_slim_00_l307000.obj'),
              mtl_file=os.path.join(base, 'model_files', 'workshop_slim_00_l307000.mtl'),
              shape_name='Shape'):
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
                f.write(f"usemtl color_{shape_name}_{i % len(colors)}\n")
                f.write("f " + " ".join(str(v) for v in face) + "\n")
    logger.info(f"Appended shape {shape_name} to {obj_file}, {mtl_file}")

def main(hex_str, obj_file=os.path.join(base, 'model_files', 'workshop_slim_00_l307000.obj'),
         mtl_file=os.path.join(base, 'model_files', 'workshop_slim_00_l307000.mtl')):
    data = hex_to_bytes(hex_str)
    shap_offset = find_shap_offset(data)
    symbols, data_start = parse_file_header(data, shap_offset)
    pos = data_start
    shape_index = 0
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
        if pos >= symbols:
            logger.info("Reached symbols, stopping")
            break
        logger.info(f"Starting shape {shape_index}")
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
            if length < 4 or inner_pos + length - 4 > len(data):
                logger.warning(f"Invalid chunk length {length} for type 0x{chk_type:04X}, skipping")
                inner_pos += length - 4
                continue
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
            write_obj(points, faces, colors if colors else [1] * len(facets), obj_file, mtl_file, f"Shape_{shape_index}")
        else:
            logger.error(f"Missing essential chunks for shape {shape_index}")
        shape_index += 1

# Example usage:
with open(os.path.join(base, 'model_files', "workshop_slim_00_l307000.txt"), 'r') as f:
    hex_str = f.read()
main(hex_str)