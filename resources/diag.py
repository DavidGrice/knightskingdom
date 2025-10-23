#!/usr/bin/env python3
"""
LEGO Creator .lca Diagnostic Parser
Shows raw hex + structure to understand real format
"""

import struct
import sys
from pathlib import Path

def hexdump(data, start=0, length=256, offset_fmt='04X'):
    """Pretty hex dump"""
    lines = []
    for i in range(0, length, 16):
        chunk = data[start+i:start+i+16]
        hex_part = ' '.join(f'{b:02X}' for b in chunk)
        ascii_part = ''.join(chr(b) if 32 <= b <= 126 else '.' for b in chunk)
        lines.append(f"0x{start+i:{offset_fmt}} | {hex_part:<48} | {ascii_part}")
    return '\n'.join(lines)

def main():
    if len(sys.argv) != 2:
        print("Usage: python diag.py input.lca")
        sys.exit(1)
    
    filepath = Path(sys.argv[1])
    with open(filepath, 'rb') as f:
        data = f.read()
    
    print(f"📁 File: {filepath} ({len(data)} bytes)")
    print("=" * 80)
    
    # 1. LEGO Header (0x00-0x30)
    print("\n1️⃣ LEGO HEADER (0x00-0x30)")
    print(hexdump(data, 0, 48))
    
    # 2. Find all potential VRT markers
    print("\n2️⃣ SEARCHING FOR VRT MARKERS...")
    markers = []
    for i in range(0x30, len(data)-10):
        if data[i:i+4] == b'.VRT':
            markers.append(i)
    
    print(f"Found {len(markers)} '.VRT' markers:")
    for i, pos in enumerate(markers):
        print(f"  [{i}] 0x{pos:04X}: {hexdump(data, pos-8, 32)}")
    
    # 3. Check first marker
    if markers:
        first_vrt = markers[0]
        print(f"\n3️⃣ FIRST VRT at 0x{first_vrt:04X} (next 64 bytes):")
        print(hexdump(data, first_vrt, 64))
        
        # Try parsing as header
        if first_vrt + 13 <= len(data):
            version = struct.unpack('<I', data[first_vrt+5:first_vrt+9])[0]
            chunk_count = struct.unpack('<I', data[first_vrt+9:first_vrt+13])[0]
            print(f"  Version: 0x{version:08X} ({version})")
            print(f"  Chunks:  0x{chunk_count:08X} ({chunk_count})")
    
    # 4. Look for .SHP .PAL .WLD references
    print("\n4️⃣ FILE REFERENCES (.SHP .PAL .WLD)")
    refs = []
    for i in range(0x100, len(data)-16):
        chunk = data[i:i+16]
        if b'.SHP' in chunk or b'.PAL' in chunk or b'.WLD' in chunk:
            refs.append((i, chunk.decode('ascii', errors='ignore')))
    
    for i, (pos, ref) in enumerate(refs[:10]):
        print(f"  0x{pos:04X}: {ref}")
    
    # 5. Look for vertex patterns
    print("\n5️⃣ VERTEX PATTERNS (T_POINTREC3D)")
    patterns_found = 0
    for i in range(0x100, len(data)-16):
        x, y, z, uz = struct.unpack('<hhhh', data[i:i+8])
        if abs(x) < 0x1000 and abs(y) < 0x1000 and abs(z) < 0x1000 and abs(uz) < 0x100:
            patterns_found += 1
            if patterns_found <= 5:
                scale = struct.unpack('<h', data[i+8:i+10])[0]
                print(f"  0x{i:04X}: x={x:5d} y={y:5d} z={z:5d} uz={uz:4d} scale={scale:4d}")
    
    print(f"\n📊 SUMMARY:")
    print(f"   File size: {len(data)} bytes")
    print(f"   VRT markers: {len(markers)}")
    print(f"   File refs: {len(refs)}")
    print(f"   Vertex patterns: {patterns_found}")

if __name__ == "__main__":
    main()