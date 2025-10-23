#!/usr/bin/env python3
import sys
from pathlib import Path

def file_to_hex_lines(input_path, output_path, bytes_per_line=16):
    CHUNK = 64 * 1024
    bytes_buffer = bytearray()
    with open(input_path, "rb") as fin, open(output_path, "w", encoding="ascii") as fout:
        while True:
            chunk = fin.read(CHUNK)
            if not chunk:
                break
            bytes_buffer.extend(chunk)
            # flush full lines
            while len(bytes_buffer) >= bytes_per_line:
                block = bytes(bytes_buffer[:bytes_per_line])
                del bytes_buffer[:bytes_per_line]
                fout.write(block.hex() + "\n")
        # flush remaining bytes (if any) as final line
        if bytes_buffer:
            fout.write(bytes(bytes_buffer).hex() + "\n")

def main():
    if len(sys.argv) != 3:
        print("Usage: python3 dump_hex_lines.py input.file output.txt", file=sys.stderr)
        sys.exit(1)
    inp = Path(sys.argv[1])
    out = Path(sys.argv[2])
    if not inp.is_file():
        print(f"Input not found: {inp}", file=sys.stderr)
        sys.exit(2)
    file_to_hex_lines(inp, out, bytes_per_line=16)

if __name__ == "__main__":
    main()