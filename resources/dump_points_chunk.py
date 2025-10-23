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

# simulate converter loop and find points chunk for the second shape (shape_index 1)
pos = data_start
shape_index = 0
while pos + 2 <= len(data) and shape_index <= 2:
    peek = struct.unpack_from('<H', data, pos)[0]
    if peek == 0xFFFF:
        print('End of shapes list at', pos)
        break
    print(f"Starting shape {shape_index} at pos {pos}")
    inner_pos = pos
    found_points = False
    while inner_pos + 4 <= len(data):
        chk_type = struct.unpack_from('<H', data, inner_pos)[0]
        inner_pos += 2
        if chk_type == 0xFFFF:
            print('  Found chunk terminator 0xFFFF')
            break
        length = struct.unpack_from('<H', data, inner_pos)[0]
        inner_pos += 2
        payload_start = inner_pos
        print(f"  chunk at {payload_start}: type=0x{chk_type:04X} length={length} payload_end={payload_start + (length-4)}")
        if chk_type == 0x0000 and shape_index == 1:
            print('\n=== Found SCPOINTS payload ===')
            start = payload_start
            end = payload_start + (length - 4)
            print(f'payload offsets: {start}..{end} (len={end-start})')
            # dump hex with offsets
            for off in range(start, min(end, start+512), 16):
                chunk = data[off:off+16]
                hexs = ' '.join(f"{b:02X}" for b in chunk)
                print(f"{off:06}: {hexs}")
            # Try interpreting payload as little-endian float32 sequence
            print('\nFloat32 decode (first 32 floats or until end):')
            for foff in range(start, min(end, start+128), 4):
                if foff + 4 <= len(data):
                    val = struct.unpack_from('<f', data, foff)[0]
                    print(f"{foff:06}: {val:.6f}")
                else:
                    break
            # interpret header
            try:
                np, nc = struct.unpack_from('<HH', data, start)
                print(f"\npoints header: num_points={np} num_cels={nc}")
            except Exception as e:
                print('points header unpack failed', e)
                break
            ppos = start + 4
            for i in range(np):
                if ppos + 2 > end:
                    print(f'  entry {i}: truncated at {ppos}')
                    break
                hdr = struct.unpack_from('<H', data, ppos)[0]
                ptype = hdr & 0x0007
                dyn = bool(hdr & 0x8000)
                print(f"  entry {i}: offset={ppos} hdr=0x{hdr:04X} (type={ptype} dyn={int(dyn)})")
                if ptype == 2:
                    # print as signed and unsigned
                    p1s = struct.unpack_from('<h', data, ppos+2)[0] if ppos+4 <= len(data) else None
                    p2s = struct.unpack_from('<h', data, ppos+4)[0] if ppos+6 <= len(data) else None
                    p1u = struct.unpack_from('<H', data, ppos+2)[0] if ppos+4 <= len(data) else None
                    p2u = struct.unpack_from('<H', data, ppos+4)[0] if ppos+6 <= len(data) else None
                    shift = data[ppos+6] if ppos+6 < len(data) else None
                    mult = data[ppos+7] if ppos+7 < len(data) else None
                    print(f"    p1 signed={p1s} unsigned={p1u}  p2 signed={p2s} unsigned={p2u}  shift={shift} mult={mult}")
                    ppos += 8
                else:
                    # header contains first signed short (x), then y,z
                    x = struct.unpack_from('<h', struct.pack('<H', hdr))[0]
                    y = struct.unpack_from('<h', data, ppos+2)[0] if ppos+4 <= len(data) else None
                    z = struct.unpack_from('<h', data, ppos+4)[0] if ppos+6 <= len(data) else None
                    print(f"    rel x={x} y={y} z={z}")
                    ppos += 6
            found_points = True
            break
        # advance to next chunk
        if length <= 0:
            inner_pos += 0
        else:
            inner_pos = payload_start + (length - 4)
    if found_points:
        break
    pos = inner_pos
    shape_index += 1

print('\nDone')
