#!/usr/bin/env python3
"""
Dump a Superscape SOUN sound bank (e.g. CREATO~2.SND from creator2000.xvr)
to .wav files.

Layout (mirrors the SPRT image bank): preamble (offsets are relative to
the sub-file start INCLUDING the preamble), then u32 body_len, 'SOUN',
u16 0, u16 revision, u16 0, u16 fmt (0x0A05 = 5.10), then sequential
T_SOUNDREC records: {u16 Type, u32 Length(TOTAL bytes incl. 12-byte header), u8 Pitch(MIDI),
u8 Spare, u32 Flags, u8 Data[Length]}.
Type 0 = 8-bit signed PCM (converted to unsigned for WAV), Type 1 =
16-bit PCM.  Sample rate is not stored per record; --rate sets it
(default 11025; try 22050 if playback sounds slow/deep).

Usage: python3 snd_dump.py <sndfile-or-vrt> <outdir> [--rate 11025]
"""
import os
import re
import struct
import sys
import wave


def main():
    src, outdir = sys.argv[1], sys.argv[2]
    rate = int(sys.argv[sys.argv.index('--rate') + 1]) \
        if '--rate' in sys.argv else 11025
    d = open(src, 'rb').read()
    j = d.find(b'SOUN')
    if j == -1:
        raise SystemExit('no SOUN bank found')
    rev = struct.unpack_from('<H', d, j + 6)[0]
    body_len = struct.unpack_from('<I', d, j - 4)[0]
    end = j - 4 + body_len
    os.makedirs(outdir, exist_ok=True)
    # pre-walk to find the symbol table (sound names) at the end
    names = {}
    o = j + 12
    while o + 12 <= len(d):
        typ, = struct.unpack_from('<H', d, o)
        ln, = struct.unpack_from('<I', d, o + 2)
        if typ > 3 or ln <= 12 or o + ln > len(d):
            break
        o += ln
    p = o
    while p + 38 <= len(d):                      # T_SYMNAME records
        t, l = struct.unpack_from('<HH', d, p)
        if t == 0xFFFF:
            p += 2
            continue
        if l != 38:
            break
        num, = struct.unpack_from('<h', d, p + 4)
        nm = d[p + 6:p + 38].split(b'\0')[0].decode('latin1')
        if nm:
            names[num] = nm
        p += 38
    o = j + 12
    n = 0
    while o + 12 <= min(end, len(d)):
        typ, = struct.unpack_from('<H', d, o)
        length, = struct.unpack_from('<I', d, o + 2)
        pitch = d[o + 6]
        flags, = struct.unpack_from('<I', d, o + 8)
        if typ > 3 or length <= 12 or length > 10_000_000:
            break
        nbytes = length - 12          # Length = TOTAL record incl. header
        data = d[o + 12:o + 12 + nbytes]
        if len(data) < nbytes:
            break
        nm = names.get(n, '')
        nm = re.sub(r'[^A-Za-z0-9]+', '_', nm).strip('_')
        path = os.path.join(outdir,
                            f'snd{n:03d}_{nm}.wav' if nm
                            else f'snd{n:03d}_p{pitch}.wav')
        with wave.open(path, 'wb') as w:
            w.setnchannels(1)
            w.setframerate(rate)
            if typ == 1:
                w.setsampwidth(2)
                w.writeframes(data)
            else:
                w.setsampwidth(1)
                # signed 8-bit -> unsigned 8-bit for WAV
                w.writeframes(bytes((b + 128) & 0xFF for b in data))
        n += 1
        o += length
    print(f'SOUN rev {rev}: extracted {n} sounds to {outdir} at {rate} Hz')


if __name__ == '__main__':
    main()
