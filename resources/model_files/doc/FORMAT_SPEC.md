# LEGO Creator 2000 `.lca` Conversion Project — COMPLETE SESSION HANDOFF (v4)

**Purpose:** Give this file plus the tool set to a new Claude session to
continue seamlessly. Supersedes v3. The user has been modernising LEGO
Creator 2000 (Knights' Kingdom edition) since 2021 and is in contact with
an original developer (who supplied the Superscape SDK 5.71 manual and VRT
C headers). **This session's headline: the texture pipeline is fully
cracked — textured OBJ export now works end to end.**

**v4 changes (this session):**
- World **templates** (9) and **challenge maps** (6) converted: 265 models
  total, all zero parse warnings. New category string `"User"`; new tool
  `export_template.py` (root-vs-nested flat-plane rule, see §15).
- **`system.pak` cracked** ("DPAK" container) → `pak_extract.py` (§16).
- **XVR compression cracked** (raw DEFLATE) → `xvr_extract.py` (§17).
- **Global texture bank found & decoded** (310 sprites in
  `creator2000.xvr` → CREATO~2.SPR) → `sprite_dump.py` (§18).
- **Texture architecture reverse-engineered** (per-object E_CTTEXCOORDS
  UV chunks; direct global refs in .lca; SPRTRANS translation in master
  world) → `export_textured.py` (§19).
- Master game world (creator2000) parsed & exported (§20).

## 1. PROJECT STATE
- 265 models converted with zero parse warnings (250 at v3, +9 templates,
  +6 challenges). Toolchain for plain exports FROZEN and unchanged.
- NEW capability: textured exports via `export_textured.py` + the dumped
  texture library (needs `textures/` PNGs beside the OBJ, `map_Kd` wired).
- Game: **LEGO Creator Knights' Kingdom**, install dir
  `C:\Program Files (x86)\LEGO Media\Constructive\LEGO Creator Knights
  Kingdom` (explains Castle/portcullis/drawbridge content).

## 2-13. (UNCHANGED FROM v3 — container format, check words, VCA
directory, SHP/PAL/WLD structures, exporter pipeline, QA methodology,
category strings, bug log, conversion log, limitations, batch workflow,
environment notes. Re-use v3 sections; only additions below.)

Additions to §8 category strings: `User` (templates & challenges).
Additions to benign classes (§5.6): one open 4-line facet per shape,
always the last-numbered facet (terminal metadata facet; templates
showed 10 shapes × instances = 41 skips, no geometry loss).

## 14. WORLD TEMPLATES & CHALLENGES (completed)
- Same LCA/VCA container, category `User`. Roots named
  `SCL World Play Area: T<n>` / `Challenge <n>`.
- Template signature: massive instance rescales (e.g. Bowl shape 20000
  VRT instanced at 20,000,000 = 20 m plate). Diorama construction: play
  mats plateau at y≈0, terrain skirts descend ~2 m underground.
- Waypoint `Arrow` shapes exist but ALL instances are flagged invisible
  in-file — no special handling needed.
- B-Spline shapes (`B-Spline[nn]`) = path objects, every facet a single
  line segment; chained under per-model footprint planes.

## 15. export_template.py — TEMPLATE RULE
Run templates/challenges through this driver (not plain export_obj):
- `skip_huge=0` (root-parented flat planes are terrain: grass pal072,
  water pal028, sand pal032).
- Pre-hide flats (YSize<=10, XZ>=20000) whose parent is NOT the world
  root: they are per-model shadow/footprint helper trios
  (plane -> B-spline path -> tint plane). Verified: zero real shapes
  lost under hidden flats in all 15 files.

## 16. system.pak — "DPAK" CONTAINER (solved) — pak_extract.py
Header: 'DPAK', u32 ver 0x00010000, u32 tree_off(0x18), u32 entry_off,
u32 string_off, u32 data_off. Tree node = {u32 n, u32 name_str[n],
u32 child[n]}; child pointing into entry table = file; file entry =
{u32 length, u32 offset}. No compression. Contents: 777 files/209 MB —
371 challenge-voiceover WAVs, 392 help TXTs, 13 UI master BMPs, and
creator2000.xvr. Reader lives statically in PAKMgr.ocx ('DataPAK
Manager'); its PAK-creation path is stubbed in the game release.

## 17. XVR FORMAT (solved) — xvr_extract.py
.XVR/.SVR = 3-byte magic + **raw DEFLATE stream (zlib wbits=-15)**.
creator2000.xvr: 3.4 MB -> 11.9 MB bound VRT containing CFG, WLD
(3.2 MB), SHP (167 KB), PAL, SND (2 MB), SPR (7 MB). Sub-file = preamble
(0x1A-terminated) + magic. CRITICAL: SPRT sub-file offsets are relative to the SUB-FILE START
INCLUDING THE 120-BYTE PREAMBLE — keep the whole preamble when
splitting (tool does). Using preamble-end as base shifts every sprite
by 120 bytes: wrap seams in the bottom rows of small sprites, 120-px
horizontal wrap on 256-wide ones ('cutting into other's sections').
Verified: fixed spr113 correlates 1.0 at (0,0) with an in-game
reference supplied by the user.

## 18. SPRT IMAGE BANK (solved) — sprite_dump.py
Global texture bank CREATO~2.SPR, revision 5932, fmt 0x0A05 (5.10),
**310 sprites**. Header after 'SPRT': u16 0, u16 rev, u16 0, u16 fmt,
**u16 count @+12, entry table @+14** (count is u16, NOT u32 — off-by-2
bug trap). Entry = {u16 W, u16 H, u32 Off}. Real dims = value & 0x3FFF.
Flags: W&0x4000 -> 4-byte hotspot precedes pixels. H&0x8000
(E_SPRPALETTE) -> a 768-byte RGB palette FOLLOWS the pixels, but it is
only USED FOR DISPLAY when H&0x4000 (E_SPRUSEPAL) is ALSO set (110
sprites). H=0x8000-only sprites (164, e.g. minifig faces) carry an
attached authoring palette but their pixels index the GLOBAL palette --
decoding them with the attached palette gives garish magenta/orange
output (verified: spr112 face = LEGO yellow only under global). 16
sprites have no attached palette at all. Pixels 8-bit indices. 159 real textures (>=8x8:
256x256 x29, 512x512 x10, 64x64 x23, ...); 145 entries are 1x1 colour
swatches / empty slots. VIS.SPR (UI cursors, VRT 3.68) shares the format.

## 19. TEXTURE ARCHITECTURE (solved) — export_textured.py
- UVs are NOT in SHP. They live on WORLD OBJECTS as chunk **0x20
  E_CTTEXCOORDS**: {u16 NTex, u16 Flags, then per spec: u16 Facet
  (matches facet Number), u16 NumPoints, s16 Texture, ITexture, TexScale,
  ITexScale, ScaleX, ScaleY, OffsetX, OffsetY, float uv[2*NumPoints]}.
  UVs >1 = tiling. OBJ conversion: vt = (tu, 1-tv); reverse UV order with
  the winding reversal.
- **Texture refs are 1-BASED.** In .lca files: global sprite index =
  ref - 1 (ref 1 = sprite 0 = null = untextured). Verified via tree
  billboards: refs 180/183 -> silhouette sprites 179/182. In the master
  world, per-object **0x1C E_CTSPRTRANS** tables {u16 n, u16 map[n]}
  have a null slot 0; global sprite = map[ref] directly (values already
  0-based).
- **VRT tv is BOTTOM-UP, same as OBJ: vt = (tu, tv), do NOT flip.**
  Verified via tree quad: top-of-quad vertices carry tv=0.84, bottom
  tv=0.13, treetop at image top. (An earlier 1-tv flip + 0-based-ref
  build shipped briefly and showed neighbouring textures upside down.)
- Chunk 0x0D E_CTTEXTINFO is a TEXT LABEL (e.g. 'BRICK: L 394101'),
  not a translate table — naming trap.
- export_textured.py: standalone textured exporter (applies template
  rule); emits pal materials for untextured facets, texNNN materials
  with map_Kd textures/sprNNN.png for textured ones. Textured faces:
  t05 3113/14043, t03 2057/3605, ch3 538/6628, master 66/2093.

## 20. MASTER WORLD (creator2000.xvr)
51 shapes / 2225 objects, zero warnings, parsed by feeding raw sub-files
to lca_parser.parse_shp/parse_wld/parse_pal (they accept magic-first
bytes). It is the RUNTIME GAME SCENE (workshop; minifig parts, ammo,
Lightning effect), NOT a master library — .lca files remain the per-model
sources. Only 49/2225 objects visible (rest = hidden runtime stock).

## 20b. SOUND BANK (solved) -- snd_dump.py, associate_sounds.py
CREATO~2.SND inside creator2000.xvr: 'SOUN' bank, same header family
as SPRT (len | magic | u16 0 | u16 rev(482) | u16 0 | u16 fmt 0x0A05).
Sequential T_SOUNDREC records: {u16 Type(0=8bit signed PCM), u32
Length(TOTAL bytes INCL the 12-byte header -- trap!), u8 Pitch(MIDI),
u8 Spare, u32 Flags, data}. Sample rate not stored; 11025 Hz default,
engine pitch-shifts via the MIDI pitch (that's the randomized minifig
chatter trick). Ends with a T_SYMNAME symbol table: ALL 92 SOUNDS ARE
NAMED (Minifigures: KL Random, Action: Portcullis Open, ...).
Character codes: KL=King Leo, QL=Queen Leonora, PS=Princess Storm,
RS=Richard the Strong, CB=Cedric the Bull, W=Weezil, GB=Gilbert the
Bad, JM=John of Mayne, GenB/GenG=generic kids. Challenge VOICEOVERS
are separate: 371 plain WAVs inside system.pak (pak_extract.py).
.lca files carry NO per-object sound chunks -- triggering is compiled
SCL (objects named 'SCL Bomb' etc. confirm). associate_sounds.py maps
objects->sounds by the game's consistent naming; emits a CSV manifest.

## 21. VIS.* SYSTEM FILES
VIS.SPR/RSC/FNT/MSG = Superscape Visualiser system files saved from VRT
**3.68** (older than the 5.10 assets — note for the developer). vis.dev =
MZ display driver. options.ocf = single u32 (settings value).

## 22. OPEN QUESTIONS (for the original developer)
1. Check-word stream: VCA save path or LEGO wrapper addition?
2. The single open 4-line terminal facet per shape — collision/outline?
3. Were .lca texture refs always authored against the fixed global bank?
4. Any other XVRs (SVRs) shipped? Tools now open all of them.

## 23. NEXT CANDIDATES
- Batch-run export_textured.py over the full converted library (user
  re-uploads .lca batches; textures/ dir ships once).
- Extract full system.pak locally (user-side, pak_extract.py).
- UI master bitmaps + help texts from the pak for the modernization.
- Challenge SCL scripts (WLD SCL chunks) if gameplay logic is wanted.

## TOOLS (current set)
lca_parser.py, export_obj.py, export_obj_prefer_c.py, render_obj.py
(frozen); export_template.py, export_textured.py, xvr_extract.py,
sprite_dump.py, pak_extract.py (new this session). Workflow per batch:
parse -> export (right driver) -> numeric QA -> render -> per-batch zip.
