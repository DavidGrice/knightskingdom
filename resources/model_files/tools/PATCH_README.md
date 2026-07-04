# PATCH README — KK Toolchain Session Integration Guide

Audience: an AI coding assistant (or human) patching this session's changes
into the Knights' Kingdom reverse-engineering repo. Read fully before
editing anything. The repo layout this targets:

```
<repo>/
  run.py                  <- top level (one-click wrapper)
  extract_all.py          <- top level (pipeline orchestrator)
  tools/                  <- ALL other pipeline scripts live here
    lca_parser.py, export_obj.py, export_textured.py, ...
  extracted/              <- generated output (never commit game assets)
```

---

## 0. INVARIANTS — do not violate

1. **Frozen core — do not edit under any circumstances:**
   `tools/lca_parser.py`, `tools/export_obj.py`,
   `tools/export_obj_prefer_c.py`, `tools/export_template.py`,
   `tools/export_template_parts.py`, `tools/export_template_placements.py`,
   `tools/export_textured.py`, `tools/gltf_writer.py`,
   `tools/obj_to_glb.py`, `tools/generate_asset_manifest.py`,
   `tools/snd_dump.py`, `tools/sprite_dump.py`, `tools/xvr_extract.py`,
   `tools/smo_parser.py`, `tools/pak_extract.py`.
   None of this session's fixes require touching them.
   *Post-integration amendment (2026-07-03): `smo_parser.py` received one
   authorized change under the §5 new-evidence clause — its strict
   `off == len(d)` assert now tolerates trailing residue (see §5, first
   item, RESOLVED). Truncated files still fail.*

2. **The coordinate finding — resist the urge to "fix" the exporter.**
   This session proved KK content is authored **+Y-up** in VRT world
   space, while the frozen exporter's historical Y-flip leaves model-up
   at **negative OBJ Y**. The live game/JS pipeline consumes those OBJ/GLB
   files as-is and compensates. Therefore: OBJ/GLB output stays exactly
   as it is; the fix is applied only in *display/consumer* paths
   (render_obj, catalog thumbnails, Blender add-on, LDraw bridge). If you
   see the vertical negation in those four places and it looks like a
   hack — it is intentional and validated. Do NOT "simplify" it away and
   do NOT add a matching flip to export_obj/export_textured/gltf_writer.

3. **Never disassemble SCL bytecode** (project policy).

4. `extract_all.py` imports `tools/associate_sounds.py` **in-process**
   (Windows 32K command-line limit workaround). Its public surface
   (`load_sound_files(dir)`, `associate(path, wavs, csvwriter)`) must not
   change signature.

---

## 1. File manifest

### 1.1 NEW files — copy in verbatim

| Delivered file | Destination | Purpose |
|---|---|---|
| `catalog_build.py` | `tools/` | HTML model catalog + `model_catalog.json` (ShapeSignatureIndex-compatible schema) |
| `ldraw_bridge.py` | `tools/` | .lca → LDraw MPD (BrickLink Studio / LeoCAD) |
| `io_import_lca.py` | `blender/` (or repo root) — **not** a pipeline step | Blender 3.0+ add-on: .lca import + .smo animation import |
| `test_addon_mock.py` | `blender/` or `tests/` | mock-bpy harness for the add-on (23 checks) |
| `smo_pose_test.py` | `tests/` | SMO rotation-mapping proof (posed OBJ renders) |
| `LCA_Format_Specification.md` | `docs/` | authoritative binary format spec (KK edition) |
| `README_ADDON.md` | `docs/` or beside the add-on | add-on usage + SMO semantics |
| `VALIDATION_REPORT.md` | `docs/` | phase-2 validation ledger |

### 1.2 REPLACED files — overwrite, or apply the semantic diff in §2
if the local copy has diverged from the versions that were uploaded
to this session

| Delivered file | Destination | Change summary |
|---|---|---|
| `extract_all.py` | repo root | 3 new pipeline steps + 2 root-list fixes + manifest skip guard (§2.1) |
| `run.py` | repo root | final banner lists new output folders (§2.2) |
| `associate_sounds.py` | `tools/` | BUGFIX: SCL character-code matching (§2.3) |
| `render_obj.py` | `tools/` | display vertical fix (§2.4) |

---

## 2. Semantic diffs (for surgical application)

### 2.1 `extract_all.py`
All additions live between the existing step 4 (models + sound_map) and
the final `print(f'\nDone. ...')`.

a) **Step 5 — SMO animations** (new, before the manifest step): glob
   `*.smo` recursively under `game` and `pak_out`; if any and
   `extracted/animations/*.json` count < smo count, run
   `smo_parser.py <out>/animations <smo...>`.

b) **Manifest root fix + skip guard** (the existing manifest call): it
   previously ran `generate_asset_manifest.py <out>/asset_manifest.json
   pak_out` — this misses .lca files that live in the game dir itself.
   Replace with: skip if `asset_manifest.json` exists (unless
   `--force-manifest` in argv); otherwise pass roots
   `[game] + [pak_out if isdir]`.

c) **Step 6 — catalog** (new): output `extracted/catalog/`; skip if
   `catalog.html` exists unless `--force-catalog`; run
   `catalog_build.py <out>/catalog <models>/textures --reuse <models>
   [--sounds <out>/sound_map.csv] <game> [<pak_out>]`.
   Note `tex_link = <models>/textures` already exists at this point
   (created in step 4, contains PNGs + creator2000.pal).

d) **Step 7 — LDraw** (new): output `extracted/ldraw/`; skip if `.mpd`
   count >= lca count; otherwise run `ldraw_bridge.py <out>/ldraw <lca…>`
   **batched 25 paths per invocation** (Windows CreateProcess limit —
   same pattern as the existing export_textured batching).

e) Docstring output listing: add `animations/`, `catalog/`, `ldraw/`
   lines.

### 2.2 `run.py`
In the ALL DONE banner, after the `pak/` line, add:
```
  animations/  minifig gesture clips as JSON
  catalog/   open catalog.html in a browser to explore
  ldraw/     .mpd files for BrickLink Studio / LeoCAD
```
No logic changes.

### 2.3 `tools/associate_sounds.py` — BUGFIX
Character minifigs are named with SCL codes (`SCL M/F : KL01`), which the
CHARACTERS keyword table never matched → e.g. King Leo got **zero**
sounds. Add above `MINIFIG_COMMON`:
```python
SCL_CODES = {'KL': 'kingleo', 'QL': 'queen', 'PS': 'princess',
             'RS': 'richard', 'CB': 'cedric', 'W': 'weezil',
             'GB': 'gilbert', 'JM': 'john'}
SCL_MF_RE = re.compile(r'SCL M/F\s*:\s*([A-Z]+)\d*', re.I)
```
and in `associate()`, before the CHARACTERS keyword loop: if
`SCL_MF_RE` matches the object name and the code is in `SCL_CODES`, emit
`CHARACTERS[mapped] + MINIFIG_COMMON` with rule `scl-code:<CODE>` and
skip the keyword loop. Expected effect on the three sample files:
12 → 22 associations.

### 2.4 `tools/render_obj.py` — display vertical fix
The single line
```python
verts = verts[:, [0, 2, 1]]                  # OBJ Y-up -> mpl Z-up
```
becomes
```python
verts = verts[:, [0, 2, 1]] * np.array([1.0, 1.0, -1.0])
```
(with a comment noting KK OBJs carry model-up at negative Y). Renders
are QA-only; no data output changes.

### 2.5 Already-delivered content baked into the NEW files (context, no
action needed): `catalog_build.py` renders thumbnails upright and
samples textures at each face's UV centroid (so decorated faces aren't
white); `--reuse <models_dir>` skips re-export when an OBJ already
exists. `ldraw_bridge.py` maps VRT→LDraw as `(x, −y, z)/400`
(LDraw is −Y-up) with rotation conjugation `S=diag(1,−1,1)`.
`io_import_lca.py` uses `C_MAT = (x, z, y)` for VRT→Blender.

---

## 3. The Blender add-on is a GENERATED file

`io_import_lca.py` embeds `tools/lca_parser.py` **verbatim** (spliced
between markers at build time) so parser and add-on can never drift.
If `lca_parser.py` ever legitimately changes, regenerate rather than
hand-editing the embedded copy:

```python
src = open('tools/lca_parser.py').read()
parser = src[src.index('SC_POINTS, SC_LINES'):src.index('def summarize')].rstrip() + '\n'
body = open('blender/addon_body.py').read()   # template with '# #<<PARSER>>' marker
open('blender/io_import_lca.py', 'w').write(body.replace('# #<<PARSER>>', parser))
```
(If `addon_body.py` isn't in the repo, the delivered `io_import_lca.py`
IS the current build; treat it as the template by re-inserting the
marker in place of the embedded parser section, which spans from the
`SC_POINTS, SC_LINES` constants line to the end of `parse_lca`.)

---

## 4. Verification after patching

Run from the repo root; needs Python 3.8+, Pillow, matplotlib, numpy.

1. `python -m py_compile run.py extract_all.py tools/*.py` — all compile.
2. `python run.py` (or `python extract_all.py "<game path>"`) — full
   pipeline. Expected new outputs: `extracted/animations/*.json` (7),
   `extracted/catalog/catalog.html` + `model_catalog.json`,
   `extracted/ldraw/*.mpd` (one per .lca).
3. Re-run immediately: **every step must print a `== ... skipping`
   line**; zero tool subprocesses should launch (idempotent resume).
4. `grep -c 'scl-code:KL' extracted/sound_map.csv` — must be ≥ 5
   (King Leo's sounds; was 0 before the fix).
5. Open `extracted/catalog/catalog.html`: models upright (heads/towers
   up), decorated faces coloured (not white).
6. If the mock harness + sample files are present:
   `python test_addon_mock.py` → `ALL MOCK TESTS PASSED` (23 checks,
   includes an upright-orientation assertion).
7. Open one `extracted/ldraw/*.mpd` in BrickLink Studio: model upright.
   Known open item: official-part placements (type-1 `.dat` refs) assume
   top-centre part origins — if one is offset, re-export that model with
   `--embed-all` and report the part number.

## 5. Known open items (do not attempt without new evidence)
- **RESOLVED 2026-07-03 — .smo trailing bytes.** Two retail files
  (`anim_r_explainleftreturn.smo`, `anim_r_think.smo`) failed
  `smo_parser.py`'s `off == len(d)` assert. Proven cause: each is a
  shorter re-export written in place over an older, longer take without
  truncating (old takes of 36 and 120 frames land on the actual file
  sizes exactly, and the old track-name strings appear at the offsets
  the old layout predicts). Not an unknown chunk — the header frame
  count is correct and the declared data is complete. Fix applied:
  the assert now tolerates (and reports) trailing residue; 92/92
  animations extract. Full analysis in `README_SMO.md` §2.
- Per-object AniVel timing chunk (cel/clip playback currently fixed at
  20 ticks/s — matches observed behaviour).
- CNFG/SCFG internals; SCL bytecode (policy: never).
- Front/back (Z) orientation is unverified ground truth; if models read
  mirrored front-to-back in Blender or Studio, it is a one-line sign
  flip in `C_MAT` / `ld_pos` respectively — ask before changing.
