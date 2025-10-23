lca2obj
======

Simple LCA (.lca) to OBJ/MTL converter implementing 16-bit SDK chunk parsing for points, lines, and facets.

Usage:

```powershell
python lca2obj.py path\to\file.lca [output_prefix]
```

The script writes <output_prefix>.obj and <output_prefix>.mtl in the current working directory.

Notes:
- This is a focused, standalone parser. It implements conservative heuristics and keeps raw integer coordinates (no scale applied).
- It expects the SDK 16-bit chunk header format (type, length in words) and basic chunk payloads. It is intended as a clean starting point for further improvements.
