import struct
import os

base = os.path.dirname(os.path.abspath(__file__))
txt_path = os.path.join(base, 'model_files', 'workshop_slim_00_l307000.txt')

with open(txt_path, 'r') as f:
    hex_str = f.read()

data = bytes.fromhex(''.join(hex_str.split()))

# find textual header
header_start = b'SuperScape (c) New Dimension International Ltd.'
first = data.find(header_start)
second = -1
if first != -1:
    second = data.find(header_start, first + len(header_start))
shap_idx = second if second != -1 else data.find(b'SHAP')
if shap_idx == -1:
    raise SystemExit('SHAP header not found')

data_start = shap_idx + 256
print('data_start', data_start)

# Walk shapes and locate shape 1
pos = data_start
shape_index = 0
while pos + 2 <= len(data):
    peek = struct.unpack_from('<H', data, pos)[0]
    if peek == 0xFFFF:
        print('End of shapes list at', pos)
        break
    print(f"Starting shape {shape_index} at pos {pos}")
    inner_pos = pos
    lines_chunk = None
    facets_chunk = None
    points_chunk = None
    while inner_pos + 4 <= len(data):
        chk_type = struct.unpack_from('<H', data, inner_pos)[0]
        inner_pos += 2
        if chk_type == 0xFFFF:
            break
        length = struct.unpack_from('<H', data, inner_pos)[0]
        inner_pos += 2
        payload_start = inner_pos
        payload_end = payload_start + (length - 4)
        if payload_end > len(data):
            payload_end = len(data)
        if chk_type == 0x0000:
            points_chunk = (payload_start, payload_end)
        elif chk_type == 0x0001:
            lines_chunk = (payload_start, payload_end)
        elif chk_type == 0x0002:
            facets_chunk = (payload_start, payload_end)
        inner_pos = payload_end
    if shape_index == 1:
        print('Found chunks:')
        print('  points_chunk=', points_chunk)
        print('  lines_chunk=', lines_chunk)
        print('  facets_chunk=', facets_chunk)
        # Dump lines chunk
        if lines_chunk:
            s,e = lines_chunk
            print('\n--- LINES CHUNK DUMP ---')
            for off in range(s, e, 16):
                chunk = data[off:off+16]
                print(f"{off:06}: " + ' '.join(f"{b:02X}" for b in chunk))
            # interpret
            p = s
            num_lines = struct.unpack_from('<H', data, p)[0]
            print('\nnum_lines=', num_lines)
            p += 2
            lines = []
            for i in range(num_lines):
                if p + 4 > e:
                    print(f'  line {i}: truncated at {p}')
                    break
                a_raw = struct.unpack_from('<H', data, p)[0]
                b_raw = struct.unpack_from('<H', data, p+2)[0]
                print(f'  line {i}: raw a=0x{a_raw:04X} b=0x{b_raw:04X} (dec {a_raw},{b_raw})')
                a = a_raw & 0x3FFF
                b = b_raw & 0x3FFF
                print(f'         masked a={a} b={b}')
                lines.append((a,b))
                p += 4
        # Dump facets chunk
        if facets_chunk:
            s,e = facets_chunk
            print('\n--- FACETS CHUNK DUMP ---')
            for off in range(s, min(e, s+256), 16):
                chunk = data[off:off+16]
                print(f"{off:06}: " + ' '.join(f"{b:02X}" for b in chunk))
            p = s
            num_facets = struct.unpack_from('<H', data, p)[0]
            print('\nnum_facets=', num_facets)
            p += 2
            facets = []
            for fi in range(num_facets):
                if p + 4 > e:
                    print(f'  facet {fi}: truncated at {p}')
                    break
                num_sides = struct.unpack_from('<B', data, p)[0]
                fac_att = struct.unpack_from('<B', data, p+1)[0]
                number = struct.unpack_from('<H', data, p+2)[0]
                print(f'  facet {fi}: num_sides={num_sides} fac_att=0x{fac_att:02X} number={number} at offset {p}')
                p += 4
                idxs = []
                for si in range(num_sides):
                    if p + 2 > e:
                        print(f'    side {si}: truncated at {p}')
                        break
                    raw = struct.unpack_from('<H', data, p)[0]
                    sign = -1 if (raw & 0x8000) else 1
                    masked = raw & 0x3FFF
                    idxs.append((raw, sign, masked))
                    print(f'    side {si}: raw=0x{raw:04X} sign={sign} masked={masked}')
                    p += 2
                facets.append(idxs)
        # print mapping of lines to points
        if lines_chunk:
            print('\nMapping lines -> point indices (masked):')
            for i,(a,b) in enumerate(lines):
                print(f'  line {i+1}: pointA={a} pointB={b}')
        break
    pos = inner_pos
    shape_index += 1

print('\nDone')
