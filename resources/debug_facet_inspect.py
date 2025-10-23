import struct, os, sys, math
base = os.path.dirname(os.path.abspath(__file__))
hex_path = os.path.join(base, 'model_files', 'workshop_slim_00_l307000.txt')
if not os.path.exists(hex_path):
    print('Hex input not found:', hex_path); sys.exit(1)
with open(hex_path, 'r') as f:
    hex_str = ''.join(f.read().split())
try:
    data = bytes.fromhex(hex_str)
except Exception as e:
    print('hex->bytes fail', e); sys.exit(1)
# find textual header twice or SHAP
hdr = b'SuperScape (c) New Dimension International Ltd.'
first = data.find(hdr)
shap_idx = None
if first != -1:
    second = data.find(hdr, first + len(hdr))
    if second != -1:
    shap_idx = second
if shap_idx is None:
    shap_idx = data.find(b'SHAP')
if shap_idx == -1:
    print('SHAP not found'); sys.exit(1)
print('shap_idx', shap_idx)
# parse file header minimally: symbols offset at offset+240 (long little endian)
try:
    symbols = struct.unpack_from('<l', data, shap_idx+240)[0]
except Exception:
    symbols = 0
data_start = shap_idx + 256
print('symbols', symbols, 'data_start', data_start)
pos = data_start
shape_i = 0
# safety limit: don't iterate more than 1000 shapes
while pos < len(data) and shape_i < 1000:
    if pos+2 > len(data): break
    peek = struct.unpack_from('<H', data, pos)[0]
    if peek == 0xFFFF:
    print('end of shapes at', pos); break
    print('\nStarting shape', shape_i, 'at', pos)
    inner = pos
    # safety: avoid pathological infinite loops per shape
    inner_iterations = 0
    while inner < len(data):
    inner_iterations += 1
    if inner_iterations > 10000:
            print('  too many inner iterations, aborting shape')
            break
    if inner + 4 > len(data):
            print('incomplete chunk header at', inner); break
    raw_type = struct.unpack_from('<H', data, inner)[0]
    raw_len = struct.unpack_from('<H', data, inner+2)[0]
    chk_type = raw_type & 0x3FFF
    length = raw_len & 0x3FFF
    print(f' chunk @ {inner}: raw_type=0x{raw_type:04X} raw_len=0x{raw_len:04X} -> type=0x{chk_type:04X} len={length}')
    # compute header_start so we can always advance at least past the header
    header_start = inner
    inner += 4
    payload_start = inner
    # defensive: the length field should be >= 4 (header). If not, advance by at least 4
    total_len = length
    if total_len < 4:
            print('  WARNING: chunk length < 4 (malformed). Forcing minimum advance of 4 bytes')
            total_len = 4
    payload_end = header_start + total_len
    if payload_end > len(data):
            print('  WARNING: payload_end', payload_end, 'beyond file len', len(data))
            payload_end = len(data)
    if chk_type == 0x0002:  # facets
            print('  FACETS chunk at', payload_start, 'payload_end', payload_end)
            # show first 200 bytes of payload hex for quick view
            snippet = data[payload_start:payload_start+200]
            print('   payload(200):', snippet.hex())
            # parse facets header
            import struct, os, sys, math

            base = os.path.dirname(os.path.abspath(__file__))
            hex_path = os.path.join(base, 'model_files', 'workshop_slim_00_l307000.txt')
            if not os.path.exists(hex_path):
                print('Hex input not found:', hex_path); sys.exit(1)
            with open(hex_path, 'r') as f:
                hex_str = ''.join(f.read().split())
            try:
                data = bytes.fromhex(hex_str)
            except Exception as e:
                print('hex->bytes fail', e); sys.exit(1)

            # find textual header twice or SHAP
            hdr = b'SuperScape (c) New Dimension International Ltd.'
            first = data.find(hdr)
            shap_idx = None
            if first != -1:
                second = data.find(hdr, first + len(hdr))
                if second != -1:
                    shap_idx = second
            if shap_idx is None:
                shap_idx = data.find(b'SHAP')
            if shap_idx == -1:
                print('SHAP not found'); sys.exit(1)
            print('shap_idx', shap_idx)
            # parse file header minimally: symbols offset at offset+240 (long little endian)
            try:
                symbols = struct.unpack_from('<l', data, shap_idx+240)[0]
            except Exception:
                symbols = 0
            data_start = shap_idx + 256
            print('symbols', symbols, 'data_start', data_start)

            pos = data_start
            shape_i = 0
            # safety limit: don't iterate more than 1000 shapes
            while pos < len(data) and shape_i < 1000:
                if pos+2 > len(data): break
                peek = struct.unpack_from('<H', data, pos)[0]
                if peek == 0xFFFF:
                    print('end of shapes at', pos); break
                print('\nStarting shape', shape_i, 'at', pos)
                inner = pos
                # safety: avoid pathological infinite loops per shape
                inner_iterations = 0
                while inner < len(data):
                    inner_iterations += 1
                    if inner_iterations > 10000:
                        print('  too many inner iterations, aborting shape')
                        break
                    if inner + 4 > len(data):
                        print('incomplete chunk header at', inner); break
                    raw_type = struct.unpack_from('<H', data, inner)[0]
                    raw_len = struct.unpack_from('<H', data, inner+2)[0]
                    chk_type = raw_type & 0x3FFF
                    length = raw_len & 0x3FFF
                    print(f' chunk @ {inner}: raw_type=0x{raw_type:04X} raw_len=0x{raw_len:04X} -> type=0x{chk_type:04X} len={length}')
                    # compute header_start so we can always advance at least past the header
                    header_start = inner
                    inner += 4
                    payload_start = inner
                    # defensive: the length field should be >= 4 (header). If not, advance by at least 4
                    total_len = length
                    if total_len < 4:
                        print('  WARNING: chunk length < 4 (malformed). Forcing minimum advance of 4 bytes')
                        total_len = 4
                    payload_end = header_start + total_len
                    if payload_end > len(data):
                        print('  WARNING: payload_end', payload_end, 'beyond file len', len(data))
                        payload_end = len(data)
                    if chk_type == 0x0002:  # facets
                        print('  FACETS chunk at', payload_start, 'payload_end', payload_end)
                        # show first 200 bytes of payload hex for quick view
                        snippet = data[payload_start:payload_start+200]
                        print('   payload(200):', snippet.hex())
                        # parse facets header
                        if payload_start + 2 > payload_end:
                            print('   incomplete T_FACETCHK header')
                        else:
                            num_facets = struct.unpack_from('<H', data, payload_start)[0]
                            print('   num_facets', num_facets)
                            fpos = payload_start + 2
                            for fi in range(num_facets):
                                if fpos + 4 > payload_end:
                                    print('    INCOMPLETE facet header at', fpos, "(need 4 bytes)")
                                    break
                                num_lines = struct.unpack_from('<B', data, fpos)[0]
                                fac_att = struct.unpack_from('<B', data, fpos+1)[0]
                                number = struct.unpack_from('<H', data, fpos+2)[0]
                                print(f'    facet[{fi}] @ {fpos}: num_lines={num_lines} fac_att=0x{fac_att:02X} number={number}')
                                fpos += 4
                                for li in range(num_lines):
                                    if fpos + 2 > payload_end:
                                        print('     INCOMPLETE line idx at', fpos, 'for facet', fi)
                                        break
                                    idx_raw = struct.unpack_from('<H', data, fpos)[0]
                                    sign = '-' if (idx_raw & 0x8000) else '+'
                                    masked = idx_raw & 0x3FFF
                                    print(f'     line[{li}] raw=0x{idx_raw:04X} sign={sign} masked={masked}')
                                    fpos += 2
                    inner = payload_end
                    # safety: prevent pathological infinite loops
                    if inner <= header_start:
                        print('  ERROR: parser did not advance (header_start', header_start, 'inner', inner, '). Aborting to avoid infinite loop.')
                        inner = len(data)
                pos = inner
                shape_i += 1
            print('\nDone')
            print('  FACETS chunk at', payload_start, 'payload_end', payload_end)
            # show first 200 bytes of payload hex for quick view
            snippet = data[payload_start:payload_start+200]
            print('   payload(200):', snippet.hex())
            # parse facets header
            if payload_start + 2 > payload_end:
                print('   incomplete T_FACETCHK header')
            else:
                num_facets = struct.unpack_from('<H', data, payload_start)[0]
                print('   num_facets', num_facets)
                fpos = payload_start + 2
                for fi in range(num_facets):
                    if fpos + 4 > payload_end:
                        print('    INCOMPLETE facet header at', fpos, "(need 4 bytes)")
                        break
                    num_lines = struct.unpack_from('<B', data, fpos)[0]
                    fac_att = struct.unpack_from('<B', data, fpos+1)[0]
                    number = struct.unpack_from('<H', data, fpos+2)[0]
                    print(f'    facet[{fi}] @ {fpos}: num_lines={num_lines} fac_att=0x{fac_att:02X} number={number}')
                    fpos += 4
                    for li in range(num_lines):
                        if fpos + 2 > payload_end:
                            print('     INCOMPLETE line idx at', fpos, 'for facet', fi)
                            break
                        idx_raw = struct.unpack_from('<H', data, fpos)[0]
                        sign = '-' if (idx_raw & 0x8000) else '+'
                        masked = idx_raw & 0x3FFF
                        print(f'     line[{li}] raw=0x{idx_raw:04X} sign={sign} masked={masked}')
                        fpos += 2
        inner = payload_end
    pos = inner
    shape_i += 1
print('\nDone')
