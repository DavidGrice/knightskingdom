import struct
import math
import os

def extract_shape_to_obj(lca_filename, obj_filename):
    with open(lca_filename, 'rb') as f:
        data = f.read()

    # Find the SHAP section
    shap_pos = data.find(b'SHAP')
    if shap_pos == -1:
        print("No SHAP section found")
        return

    # Read the 4-byte little-endian length after 'SHAP'
    length_pos = shap_pos + 4
    length = struct.unpack('<I', data[length_pos:length_pos + 4])[0]

    # Extract the shape data
    shape_start = length_pos + 4
    shape_end = shape_start + length
    shape_data = data[shape_start:shape_end]

    print(f"SHAP position: {shap_pos}")
    print(f"SHAP length: {length}")
    print(f"Shape data length: {len(shape_data)}")

    # Find the text part (source code) in the shape data
    text_pos = shape_data.find(b'BOT:')
    if text_pos == -1:
        print("No geometry text found in SHAP section")
        return

    print(f"Text position in shape data: {text_pos}")

    # Decode the text (ignore errors, as there might be binary after)
    text_end = shape_data.find(b'\x00ffff', text_pos)
    if text_end == -1:
        text = shape_data[text_pos:].decode('ascii', 'ignore')
    else:
        text = shape_data[text_pos:text_end].decode('ascii', 'ignore')
    print(f"Full geometry text:\n{text}")

    # Parse the text for BOT blocks
    lines = text.splitlines()

    vertices = []
    faces = []
    v_offset = 0  # Vertex index offset (OBJ indices start at 1)

    type = None
    pos = (0.0, 0.0, 0.0)
    size = (0.0, 0.0, 0.0)

    box_pos = None
    box_size = None
    tube_pos = None
    tube_size = None

    for line in lines:
        line = line.strip()
        if 'Type:' in line:
            if '+SINGLE' in line:
                type = 'box'
            elif '+TUBESINGLE' in line:
                type = 'tube'
            print(f"Found BOT type: {type}")
        elif 'Pos:' in line:
            parts = line.split(':')[1].strip().split()
            if len(parts) == 3:
                pos = (float(parts[0]), float(parts[1]), float(parts[2]))
                print(f"Pos: {pos}")
        elif 'Size:' in line:
            parts = line.split(':')[1].strip().split()
            if len(parts) == 3:
                size = (float(parts[0]), float(parts[1]), float(parts[2]))
                print(f"Size: {size}")

                if type == 'box':
                    box_pos = pos
                    box_size = size
                elif type == 'tube':
                    tube_pos = pos
                    tube_size = size

    # Now generate the geometry with hole
    if box_size is None or tube_size is None:
        print("Missing box or tube info")
        return

    x1, y1, z1 = box_pos
    x2 = x1 + box_size[0]
    y2 = y1 + box_size[1]
    z2 = z1 + box_size[2]

    bevel_radius = 0.2
    num_bevel_segments = 16
    num_sides_per_side = 8  # Segments per square side
    num_sides = 4 * num_sides_per_side  # 32

    step = box_size[0] / float(num_sides_per_side)  # Assume square, x==z

    # Create outer bottom profile at y=y1=0
    outer_bottom = []
    # Bottom side (z=z1, x=x1 to x2)
    for i in range(num_sides_per_side + 1):
        x = x1 + step * i
        z = z1
        outer_bottom.append((x, y1, z))
    # Right side (x=x2, z=z1 to z2)
    for i in range(1, num_sides_per_side + 1):
        x = x2
        z = z1 + step * i
        outer_bottom.append((x, y1, z))
    # Top side (z=z2, x=x2 to x1)
    for i in range(1, num_sides_per_side + 1):
        x = x2 - step * i
        z = z2
        outer_bottom.append((x, y1, z))
    # Left side (x=x1, z=z2 to z1)
    for i in range(1, num_sides_per_side + 1):
        x = x1
        z = z2 - step * i
        outer_bottom.append((x, y1, z))
    # Remove last duplicate
    outer_bottom = outer_bottom[:-1]
    assert len(outer_bottom) == num_sides

    # Normals for shrinking
    norm_len = 1.0 / math.sqrt(2.0)
    normals = []
    # Bottom side 0 to 8 (9 points)
    normals.append((norm_len, 0, norm_len))  # corner 0
    for _ in range(1, num_sides_per_side):
        normals.append((0, 0, 1))
    normals.append((-norm_len, 0, norm_len))  # corner
    # Right  to next 8
    for _ in range(1, num_sides_per_side):
        normals.append((-1, 0, 0))
    normals.append((-norm_len, 0, -norm_len))  # corner
    # Top
    for _ in range(1, num_sides_per_side):
        normals.append((0, 0, -1))
    normals.append((norm_len, 0, -norm_len))  # corner
    # Left
    for _ in range(1, num_sides_per_side):
        normals.append((1, 0, 0))
    assert len(normals) == num_sides

    # Add outer bottom vertices
    bottom_v_start = len(vertices) + 1
    vertices.extend(outer_bottom)

    # Lower upper at y = y2 - bevel_radius
    y_lower = y2 - bevel_radius
    outer_lower = [(p[0], y_lower, p[2]) for p in outer_bottom]
    lower_v_start = len(vertices) + 1
    vertices.extend(outer_lower)

    # Lower sides faces
    for i in range(num_sides):
        i1 = bottom_v_start + i
        i2 = bottom_v_start + (i + 1) % num_sides
        i3 = lower_v_start + (i + 1) % num_sides
        i4 = lower_v_start + i
        faces.append([i1, i4, i3, i2])  # Adjusted order for normal out

    # Bevel levels
    level_starts = [lower_v_start]
    for k in range(1, num_bevel_segments + 1):
        theta = (k / num_bevel_segments) * (math.pi / 2)
        shrink = bevel_radius * (1 - math.cos(theta))
        y = y_lower + bevel_radius * math.sin(theta)
        new_profile = []
        for i in range(num_sides):
            px = outer_lower[i][0] + normals[i][0] * shrink
            pz = outer_lower[i][2] + normals[i][2] * shrink
            new_profile.append((px, y, pz))
        this_start = len(vertices) + 1
        vertices.extend(new_profile)
        level_starts.append(this_start)

    # Bevel sides
    for k in range(num_bevel_segments):
        curr = level_starts[k]
        next_l = level_starts[k + 1]
        for i in range(num_sides):
            i1 = curr + i
            i2 = curr + (i + 1) % num_sides
            i3 = next_l + (i + 1) % num_sides
            i4 = next_l + i
            faces.append([i1, i4, i3, i2])

    # Top face
    top_start = level_starts[-1]
    top_face = [top_start + i for i in range(num_sides)]
    faces.append(top_face[::-1])  # Reverse for normal up

    # Tube (hole)
    center_x = tube_pos[0] + tube_size[0] / 2.0
    center_z = tube_pos[2] + tube_size[2] / 2.0
    radius_x = tube_size[0] / 2.0
    radius_z = tube_size[2] / 2.0
    height = tube_size[1]
    y_start = tube_pos[1]
    y_end = y_start + height

    inner_bottom = []
    inner_top = []
    for i in range(num_sides):
        angle = 2 * math.pi * i / num_sides
        dx = radius_x * math.cos(angle)
        dz = radius_z * math.sin(angle)
        inner_bottom.append((center_x + dx, y_start, center_z + dz))
        inner_top.append((center_x + dx, y_end, center_z + dz))

    inner_bottom_start = len(vertices) + 1
    vertices.extend(inner_bottom)
    inner_top_start = len(vertices) + 1
    vertices.extend(inner_top)

    # Tube sides
    for i in range(num_sides):
        i1 = inner_bottom_start + i
        i2 = inner_top_start + i
        i3 = inner_top_start + (i + 1) % num_sides
        i4 = inner_bottom_start + (i + 1) % num_sides
        faces.append([i1, i4, i3, i2])  # Normal inward for hole

    # Inner top (ceiling of hole)
    inner_top_face = [inner_top_start + i for i in range(num_sides)]
    faces.append(inner_top_face)  # Normal down

    # Annulus for bottom
    for i in range(num_sides):
        i1 = bottom_v_start + i
        i2 = bottom_v_start + (i + 1) % num_sides
        i3 = inner_bottom_start + (i + 1) % num_sides
        i4 = inner_bottom_start + i
        faces.append([i1, i2, i3, i4])  # Normal down

    # Write to OBJ file
    with open(obj_filename, 'w') as f:
        for v in vertices:
            f.write(f"v {v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n")
        for face in faces:
            f.write("f " + " ".join(map(str, face)) + "\n")

    print(f"Extracted shape to {obj_filename}")

# Example usage
base = os.path.dirname(os.path.abspath(__file__))
extract_shape_to_obj(os.path.join(base, 'model_files', '10_l306800.lca'),
                     os.path.join(base, 'model_files', '10_l306800.obj'))
