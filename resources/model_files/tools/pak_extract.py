#!/usr/bin/env python3
"""
Extract LEGO Creator (Knights' Kingdom) system.pak — 'DPAK' format.

Format (reverse-engineered from PAKMgr.ocx + system.pak):
  0x00  magic 'DPAK'
  0x04  u32 version = 0x00010000
  0x08  u32 tree offset   (0x18)
  0x0C  u32 entry table offset
  0x10  u32 string table offset
  0x14  u32 data start offset
  Tree node : u32 count, u32 name_str_off[count], u32 child_off[count]
              child offsets pointing inside the entry table are files;
              otherwise they are subdirectory nodes.
  File entry: u32 length, u32 data_offset

Usage: python3 pak_extract.py system.pak [outdir] [--list]
"""
import os
import struct
import sys


def parse(pak_path):
    fh = open(pak_path, 'rb')
    hdr = fh.read(0x18)
    if hdr[:4] != b'DPAK':
        raise SystemExit('not a DPAK file (bad magic)')
    ver, tree0, ent0, str0, data0 = struct.unpack_from('<5I', hdr, 4)
    if ver != 0x00010000:
        print(f'warning: unexpected version {ver:#x}')
    fh.seek(0)
    head = fh.read(data0)                      # whole directory region
    u32 = lambda o: struct.unpack_from('<I', head, o)[0]

    def cstr(o):
        e = head.index(0, o)
        return head[o:e].decode('latin1')

    files = []

    def walk(off, path):
        if ent0 <= off < str0:                 # file entry
            files.append(('/'.join(path), u32(off + 4), u32(off)))
            return
        n = u32(off)
        names = [u32(off + 4 + 4 * i) for i in range(n)]
        kids = [u32(off + 4 + 4 * n + 4 * i) for i in range(n)]
        for s, k in zip(names, kids):
            walk(k, path + [cstr(s)])

    walk(tree0, [])
    return fh, files


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    pak = sys.argv[1]
    listonly = '--list' in sys.argv
    outdir = next((a for a in sys.argv[2:] if not a.startswith('--')),
                  'pak_extracted')
    fh, files = parse(pak)
    total = sum(ln for _, _, ln in files)
    print(f'{len(files)} files, {total:,} bytes')
    if listonly:
        for name, off, ln in files:
            print(f'{name:50s} off={off:#010x} len={ln:,}')
        return
    for name, off, ln in files:
        dest = os.path.join(outdir, *name.split('/'))
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        fh.seek(off)
        with open(dest, 'wb') as o:
            remaining = ln
            while remaining:
                chunk = fh.read(min(1 << 20, remaining))
                if not chunk:
                    raise SystemExit(f'truncated read in {name}')
                o.write(chunk)
                remaining -= len(chunk)
        print('extracted', dest)


if __name__ == '__main__':
    main()
