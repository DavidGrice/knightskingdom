# LEGO Creator: Knights' Kingdom — Decompilation & Modernization

Tools and format documentation for extracting and converting the assets of
**LEGO Creator: Knights' Kingdom** (LEGO Media, 2000), built on the
Superscape VRT 5.10 engine. Every asset type in the game — geometry,
palettes, textures, and audio — can be exported to open formats
(OBJ/MTL, PNG, WAV) using the tools in this repository.

> **This repository contains no game assets.** You need your own copy of
> the game; the tools extract everything from your installation. Please
> don't commit or redistribute extracted assets (models, textures,
> sounds) — they remain the property of the LEGO Group.

## Quick start

1. Install [Python 3.8+](https://www.python.org).
2. Clone this repo, open **`run.py`**, and press **Run** (VS Code) — or:

   ```
   python run.py
   ```

   That's it. `run.py` finds your game install automatically (or asks
   once and remembers), installs its one dependency (Pillow) if
   missing, runs the whole pipeline, and **resumes** if interrupted —
   re-running skips finished steps.

   Prefer explicit control? The same pipeline is available as:

   ```
   python extract_all.py "C:\Program Files (x86)\LEGO Media\Constructive\LEGO Creator Knights Kingdom"
   ```

3. Everything lands in `extracted/`:

   | Folder | Contents |
   |---|---|
   | `extracted/models/` | every model as textured **OBJ + MTL** (open in Blender: File → Import → Wavefront, then switch the viewport to *Material Preview*) |
   | `extracted/textures/` | the game's global texture bank as **PNG** |
   | `extracted/sounds/` | the 92 named world sounds as **WAV** (minifig chatter, doors, portcullis…) |
   | `extracted/pak/` | contents of `system.pak` (challenge voice-overs, help text, UI art) and `warehouse.pak` |
   | `extracted/sound_map.csv` | object → sound association manifest |

## What a full extraction produces

Verified against a retail install (one run of `run.py`, 100% success):

```
  Models (textured OBJ+MTL) : 264     the complete warehouse library
  Textures (PNG)            : 304     the game's global texture bank
  World sounds (WAV)        : 92      named minifig/action/ambience sounds
  Voice-overs (WAV)         : 371     challenge dialogue lines
  Images & thumbnails       : 287     model previews + UI art
  Help / text files         : 392
  Object-sound associations : 1,587   auto-generated manifest
  Total                     : 256 MB  of open-format assets
```

## Repository layout

```
knightskingdom/
├── README.md
├── run.py                  ← ONE-CLICK runner (start here: just press Run)
├── extract_all.py          ← the same pipeline, path passed explicitly
├── .gitignore              ← keeps extracted assets out of git
├── tools/
│   ├── lca_parser.py            core .lca container/SHP/PAL/WLD parser
│   ├── export_obj.py            plain OBJ/MTL exporter (palette colors)
│   ├── export_obj_prefer_c.py   variant: prefer alternate-state "C" parts
│   ├── export_template.py       world templates & challenge maps
│   ├── export_textured.py       textured OBJ exporter (UVs + map_Kd)
│   ├── render_obj.py            quick PNG previews for QA
│   ├── pak_extract.py           "DPAK" archives (system.pak, warehouse.pak)
│   ├── xvr_extract.py           .XVR/.SVR decompressor + sub-file splitter
│   ├── sprite_dump.py           SPRT texture banks → PNG
│   ├── snd_dump.py              SOUN sound banks → named WAV
│   ├── associate_sounds.py      object → sound manifest builder
│   ├── scl_dump.py              SCL script "gleaner" (strings + calls)
│   ├── scl_grammar.py           SCL bytecode tokeniser (shared)
│   └── scl_decompile.py         SCL disassembler (readable listings)
└── docs/
    └── FORMAT_SPEC.md           reverse-engineered format documentation
```

All scripts in `tools/` must stay together in one folder — several import
each other. Individual tools can also be run standalone; each has usage
notes in its docstring.

## The pipeline at a glance

```
game install
 ├── system.pak / warehouse.pak ──pak_extract──► WAVs, help, UI art, .lca files
 ├── creator2000.xvr ──xvr_extract──► CFG / WLD / SHP / PAL / SND / SPR
 │        ├── SPR + PAL ──sprite_dump──► textures/*.png
 │        └── SND ──snd_dump──► sounds/*.wav (named)
 └── *.lca ──export_textured (+ textures/) ──► models/*.obj + *.mtl
```

## Format highlights

Full details in [`docs/FORMAT_SPEC.md`](docs/FORMAT_SPEC.md). The short
version of what was reverse-engineered:

- **`.lca`** — a LEGO wrapper around Superscape VCA archives, with a
  4-byte check word every 1000 bytes; contains SHP (shapes), PAL
  (palette), WLD (world) sub-files.
- **`.pak`** — custom "DPAK" container (magic `DPAK`, path-tree
  directory, uncompressed).
- **`.xvr`** — 3-byte magic + a raw DEFLATE stream; a whole VRT world
  bound into one file, including the global texture and sound banks.
- **Textures** — 8-bit sprites in a SPRT bank; facet UVs live on world
  objects; texture references are DIRECT indices into the global bank
  (ref 0 = untextured), with `vt = (tu, 1-tv)`.
- **Two colour systems** — plain `COLOURS` chunks index each file's own
  embedded palette, while minifig body parts use `LITCOLS` chunks that
  index the game's *global runtime palette* (from creator2000.xvr).
- **Sounds** — 8-bit PCM records in a SOUN bank with a symbol table
  naming all 92 (the engine pitch-shifts them for variety — that's why
  minifig chatter never sounds quite the same twice).

Full byte-level detail, including the traps that cost us real debugging
time, lives in [`docs/FORMAT_SPEC.md`](docs/FORMAT_SPEC.md).

## Acknowledgements

- An original developer of the game generously provided the Superscape
  SDK 5.71 documentation and VRT headers that anchored this work.
- Superscape VRT © Superscape VR plc. LEGO® is a trademark of the LEGO
  Group, which does not sponsor, authorize, or endorse this project.
  This is a non-commercial fan preservation effort in the spirit of the
  LEGO Island community projects.
