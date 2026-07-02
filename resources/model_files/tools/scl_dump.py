#!/usr/bin/env python3
"""
scl_dump.py -- first-pass "gleaner" for compiled SCL scripts (chunk 0x06)
in LEGO Creator: Knights' Kingdom world files.

SCL is Superscape Control Language, a tokenized stack bytecode. The
complete builtin-function opcode table (687 entries) ships in the SDK's
APP_DEFS.H ("E_SCL<name>"). What this v0 tool decodes reliably:

  - string literals:  0x13, u16 length, bytes (null-terminated)
  - one-byte opcodes 0x2F..0xEB via the table
  - page-prefixed opcodes: 0xFC <b> = 0x100+b, 0xFD <b> = 0x200+b
    (verified: fc 70 = sound, fc 74 = soundq, fd ea = property --
     the latter always following a pushed string: property("name"))

Everything else (constant pushes, variable slots, flow control -- the
encodings the SDK comment says are NOT in the table) is shown as raw
bytes. Output is a per-object report of strings and recognized calls:
enough to see WHAT each script touches, if not yet its exact logic.

Usage: python3 scl_dump.py <files.lca...>          (report to stdout)
       python3 scl_dump.py --csv out.csv <files...>
"""
import csv
import os
import re
import struct
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lca_parser as L

# opcode table extracted from APP_DEFS.H (SDK 5.71)
def load_ops():
    ops = {}
    here = os.path.dirname(os.path.abspath(__file__))
    for cand in (os.path.join(here, 'APP_DEFS.H'),
                 os.path.join(here, '..', 'APP_DEFS.H')):
        if os.path.exists(cand):
            txt = open(cand, 'rb').read().decode('latin1')
            for m in re.finditer(r'#define\s+E_SCL(\w+)\s+(0x[0-9A-Fa-f]+)',
                                 txt):
                ops[int(m.group(2), 16)] = m.group(1).lower()
            return ops
    # fallback: the calls this game actually uses most
    for k, v in {0x170: 'sound', 0x174: 'soundq', 0x2EA: 'property',
                 0xEB: 'prop', 0xEA: 'obey', 0xE9: 'call', 0x3A: 'random',
                 0xD9: 'vis', 0xDA: 'invis', 0xC9: 'activate',
                 0xCD: 'settrig', 0x8E: 'var', 0x8D: 'counter'}.items():
        ops[k] = v
    return ops


OPS = load_ops()


def glean(b):
    """Return (strings, calls) recognized in one SCL chunk."""
    strings, calls = [], []
    i = 0
    n = len(b)
    while i < n:
        t = b[i]
        if t == 0x13 and i + 3 <= n:                    # string literal
            ln = struct.unpack_from('<H', b, i + 1)[0]
            s = b[i + 3:i + 3 + ln]
            if 0 < ln < 200 and all(32 <= c < 127 or c == 0 for c in s):
                strings.append(s.rstrip(b'\0').decode('latin1'))
                i += 3 + ln
                continue
        if t == 0xFC and i + 1 < n:                     # page 1 opcodes
            op = 0x100 + b[i + 1]
            if op in OPS:
                calls.append(OPS[op])
                i += 2
                continue
        if t == 0xFD and i + 1 < n:                     # page 2 opcodes
            op = 0x200 + b[i + 1]
            if op in OPS:
                calls.append(OPS[op])
                i += 2
                continue
        if 0x2F <= t <= 0xEB and t in OPS:              # single-byte ops
            calls.append(OPS[t])
        i += 1
    return strings, calls


def scan_file(path):
    data = open(path, 'rb').read()
    _hdr, subs = L.split_container(data)
    if 'WRLD' not in subs:
        return []
    wld = subs['WRLD']
    o, cur = 12, None
    out = []
    while o + 4 <= len(wld):
        t = struct.unpack_from('<H', wld, o)[0]
        if t == 0xFFFF:
            o += 2
            if o + 2 <= len(wld) and \
                    struct.unpack_from('<H', wld, o)[0] == 0xFFFF:
                break
            continue
        ln = struct.unpack_from('<H', wld, o + 2)[0]
        if ln < 4 or o + ln > len(wld):
            break
        if t == 0 and ln >= 0x44:
            cur = struct.unpack_from('<H', wld, o + 6)[0]
        elif t == 6:
            strings, calls = glean(wld[o + 4:o + ln])
            out.append((cur, ln - 4, strings, calls))
        o += ln
    return out


def main():
    args = sys.argv[1:]
    csvpath = None
    if args and args[0] == '--csv':
        csvpath, args = args[1], args[2:]
    rows = []
    for path in args:
        base = os.path.basename(path)
        for objnum, size, strings, calls in scan_file(path):
            import collections
            top = collections.Counter(calls)
            interesting = {k: v for k, v in top.items()
                           if k not in ('var', 'counter', 'star', 'eq',
                                        'plus', 'minus', 'eqeq', 'less',
                                        'great', 'me')}
            rows.append([base, objnum, size, '; '.join(strings),
                         ', '.join(f'{k}x{v}' for k, v in
                                   sorted(interesting.items()))])
            if not csvpath:
                print(f'{base} obj {objnum} ({size}B)')
                if strings:
                    print(f'   strings: {strings}')
                if interesting:
                    print(f'   calls  : {interesting}')
    if csvpath:
        with open(csvpath, 'w', newline='') as fh:
            w = csv.writer(fh)
            w.writerow(['lca_file', 'object', 'scl_bytes', 'strings',
                        'calls'])
            w.writerows(rows)
        print(f'{csvpath}: {len(rows)} SCL chunks gleaned')


if __name__ == '__main__':
    main()
