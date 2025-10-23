import struct
import os

def hex_to_bytes(hex_str):
    cleaned = ''.join(hex_str.split())
    return bytes.fromhex(cleaned)

base = os.path.dirname(os.path.abspath(__file__))
txt_path = os.path.join(base, 'model_files', 'workshop_slim_00_l307000.txt')

with open(txt_path, 'r') as f:
    hex_str = f.read()

data = hex_to_bytes(hex_str)

# Find textual header
header_start = b'SuperScape (c) New Dimension International Ltd.'
first = data.find(header_start)
second = -1
if first != -1:
    second = data.find(header_start, first + len(header_start))

shap_idx = -1
if second != -1:
    shap_idx = second
elif data.find(b'SHAP') != -1:
    shap_idx = data.find(b'SHAP')

print('shap_idx', shap_idx)
if shap_idx == -1:
    raise SystemExit('SHAP header not found')

data_start = shap_idx + 256
print('data_start', data_start)

start = data_start
print('\nDump 660..900 (relative to file):')
for i in range(660, 901, 16):
    chunk = data[i:i+16]
    hexs = ' '.join(f"{b:02X}" for b in chunk)
    print(f"{i:06}: {hexs}")

print('\nInterpret words at 682..')
for off in range(682, 682+24, 2):
    if off+2 <= len(data):
        w = struct.unpack_from('<H', data, off)[0]
        print(f"{off:06}: word 0x{w:04X} ({w})")

# Walk chunks from data_start and print first few chunks
pos = data_start
print('\nScanning chunks from data_start until SCPOINTS found:')
while pos + 4 <= len(data):
    chk_type = struct.unpack_from('<H', data, pos)[0]
    length = struct.unpack_from('<H', data, pos+2)[0]
    print(f"chunk at {pos}: type=0x{chk_type:04X} len={length}")
    payload_start = pos + 4
    if chk_type == 0x0000:
        try:
            np, nc = struct.unpack_from('<HH', data, payload_start)
            print(f"  points header inside chunk: num_points={np} num_cels={nc}")
        except Exception as e:
            print('  points header unpack error', e)
        # Dump per-point raw data for inspection
        try:
            ppos = payload_start + 4
            print('\n  Per-point entries (raw):')
            for i in range(min(200, np)):
                if ppos + 2 > len(data):
                    break
                hdr = struct.unpack_from('<H', data, ppos)[0]
                b0 = data[ppos:ppos+8]
                hexs = ' '.join(f"{b:02X}" for b in b0)
                ptype = hdr & 0x0007
                dyn = bool(hdr & 0x8000)
                print(f"    entry {i}: hdr=0x{hdr:04X} (type={ptype} dyn={int(dyn)}) bytes: {hexs}")
                if ptype == 2:
                    ppos += 2 + 6
                else:
                    ppos += 2 + 4
        except Exception as e:
            print('  per-point dump error', e)
        break
    # advance to next chunk
    if length <= 0:
        print('  zero-length chunk, advancing by 4 to avoid infinite loop')
        pos += 4
    else:
        pos += length

print('\n--- Direct inspect at offset 682 ---')
off = 682
if off + 4 <= len(data):
    t = struct.unpack_from('<H', data, off)[0]
    l = struct.unpack_from('<H', data, off+2)[0]
    print(f'at {off}: type=0x{t:04X} len={l}')
    pstart = off + 4
    try:
        np, nc = struct.unpack_from('<HH', data, pstart)
        print(f'  points header: num_points={np} num_cels={nc}')
        ppos = pstart + 4
        for i in range(np):
            if ppos + 2 > len(data):
                break
            hdr = struct.unpack_from('<H', data, ppos)[0]
            ptype = hdr & 0x0007
            dyn = bool(hdr & 0x8000)
            print(f'    entry {i}: hdr=0x{hdr:04X} type={ptype} dyn={int(dyn)}')
            if ptype == 2:
                # print geom struct bytes
                if ppos+8 <= len(data):
                    p1 = struct.unpack_from('<h', data, ppos+2)[0]
                    p2 = struct.unpack_from('<h', data, ppos+4)[0]
                    shift = data[ppos+6]
                    mult = data[ppos+7]
                    print(f'      geom p1={p1} p2={p2} shift={shift} mult={mult}')
                ppos += 8
            else:
                if ppos+6 <= len(data):
                    x = struct.unpack_from('<h', data, ppos+2)[0]
                    y = struct.unpack_from('<h', data, ppos+4)[0]
                    print(f'      rel x={x} y={y}')
                ppos += 6
    except Exception as e:
        print('  direct inspect error', e)
    except Exception as e:
        print('  points header unpack error', e)

print('\nDone')
