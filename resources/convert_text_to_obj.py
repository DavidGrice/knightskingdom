# import re
# import struct
# import math
import os

# def parse_lca_to_obj(lca_file, obj_file='model.obj'):
#     with open(lca_file, 'r') as f:
#         text = f.read()
#     # Remove newlines and any non-hex characters if necessary
#     hex_str = ''.join(re.findall(r'[0-9a-fA-F]', text))
#     try:
#         data = bytes.fromhex(hex_str)
#     except ValueError:
#         raise ValueError("Invalid hex data in file")
    
#     # Find the metadata string "Size: "
#     pos = data.find(b'Size: ')
#     if pos == -1:
#         raise ValueError("No Size: found in file")
    
#     # Extract the size string, assuming "3 2 3" or similar, up to 10 bytes
#     size_bytes = data[pos+6: pos+16]
#     try:
#         size_str = size_bytes.split(b'\x0d')[0].decode('ascii').strip()  # Split on CR if present
#     except UnicodeDecodeError:
#         raise ValueError("Invalid size string")
    
#     sizes = list(map(int, size_str.split()))
#     if len(sizes) != 3:
#         raise ValueError("Invalid size format, expected 3 integers")
    
#     sx, sy, sz = sizes
    
#     # Generate OBJ for a box (cube-like) with given dimensions, centered at origin
#     halfx = sx / 2.0
#     halfy = sy / 2.0
#     halfz = sz / 2.0
    
#     vertices = [
#         (-halfx, -halfy, -halfz),
#         (-halfx, -halfy, halfz),
#         (-halfx, halfy, -halfz),
#         (-halfx, halfy, halfz),
#         (halfx, -halfy, -halfz),
#         (halfx, -halfy, halfz),
#         (halfx, halfy, -halfz),
#         (halfx, halfy, halfz),
#     ]
    
#     faces = [
#         [1, 2, 4, 3],  # left
#         [5, 6, 8, 7],  # right
#         [1, 2, 6, 5],  # bottom
#         [3, 4, 8, 7],  # top
#         [1, 3, 7, 5],  # back
#         [2, 4, 8, 6],  # front
#     ]
    
#     with open(obj_file, 'w') as f:
#         for v in vertices:
#             f.write(f"v {v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n")
#         for face in faces:
#             f.write("f " + " ".join(map(str, face)) + "\n")
    
#     print(f"OBJ file created: {obj_file}")

# base = os.path.dirname(os.path.abspath(__file__))
# parse_lca_to_obj(os.path.join(base, 'model_files', "workshop_slim_00_l307000.txt"),
#                  os.path.join(base, 'model_files', 'workshop_slim_00_l307000.obj'))

import re

def parse_vca_to_obj(vca_file, obj_file='minifig.obj', scale_factor=1/409.0):
    with open(vca_file, 'r') as f:
        text = f.read()
    hex_str = ''.join(re.findall(r'[0-9a-fA-F]', text))
    try:
        data = bytes.fromhex(hex_str)
    except ValueError:
        raise ValueError("Invalid hex data in file")

    # Find SHAP section
    shap_pos = data.find(b'SHAP')
    if shap_pos == -1:
        raise ValueError("No SHAP section found in file")

    pos = shap_pos + 4  # Skip 'SHAP'
    # Skip length (4 bytes)
    pos += 4
    # Skip flags (4 bytes, e.g., 050a0600)
    pos += 4
    # Skip bounds (12 bytes, 3 x 4-byte longs)
    pos += 12
    # Skip ffff (2 bytes)
    pos += 2
    # Skip additional header (6 bytes, e.g., 000008024000)
    pos += 6

    verts = []
    while pos + 6 <= len(data):
        x = int.from_bytes(data[pos:pos+2], 'little', signed=True)
        y = int.from_bytes(data[pos+2:pos+4], 'little', signed=True)
        z = int.from_bytes(data[pos+4:pos+6], 'little', signed=True)

        # Stop if values look like non-vertex data (heuristic: small values or patterns)
        if abs(x) < 1 and abs(y) < 1 and abs(z) < 1 and len(verts) > 0:
            break
        if abs(x) > 32767 or abs(y) > 32767 or abs(z) > 32767:  # Exceed signed short
            break

        verts.append((x * scale_factor, y * scale_factor, z * scale_factor))
        pos += 6

    # Attempt to parse faces (heuristic: assume next block is LE short indices, grouped into quads)
    faces = []
    indices = []
    while pos + 2 <= len(data):
        i = int.from_bytes(data[pos:pos+2], 'little', signed=False)
        if i == 0 or i > len(verts) + 1:  # Invalid index
            break
        indices.append(i)  # Assume 1-based
        pos += 2

    # Group into quads (assume all quads)
    for i in range(0, len(indices) - len(indices) % 4, 4):
        faces.append(indices[i:i+4])

    # Write OBJ
    with open(obj_file, 'w') as f:
        for v in verts:
            f.write(f"v {v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n")
        for face in faces:
            f.write("f " + " ".join(map(str, face)) + "\n")

    print(f"OBJ file created: {obj_file} with {len(verts)} vertices and {len(faces)} faces.")
    print("Note: Textures (e.g., chest, face, crown) are not extracted as UV mapping data appears absent or in truncated sections. Colors may be palette-based from PAL section, but not applied here. Sword and shield are likely separate hierarchy parts.")

# Example usage:
# parse_vca_to_obj("minifigkingleo01.txt")
base = os.path.dirname(os.path.abspath(__file__))
parse_vca_to_obj(os.path.join(base, 'model_files', "minifigkingleo01.txt"),
                 os.path.join(base, 'model_files', 'minifigkingleo01.obj'))