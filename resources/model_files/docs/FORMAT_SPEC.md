# LEGO Creator: Knights' Kingdom — Format Specification & Developer Handoff

Byte-level documentation of every file format in LEGO Creator: Knights'
Kingdom (LEGO Media, 2000; Superscape VRT 5.10 engine), reverse-engineered
and verified against a complete retail install (264/264 models extract
cleanly). This is the deep companion to the README: it records not just
the formats but the **traps** — conventions that look correct under
partial evidence and cost real debugging time.

All multi-byte integers are little-endian. "u16/u32/s16" = unsigned/signed
widths. Offsets are hex unless noted.

---

## 1. Coordinate system, units, and scale

- VRT space is **Y-down, left-handed**. Smaller Y = physically higher.
- Project scale: **1000 VRT units = 1 mm** (verified against real brick
  dimensions, e.g. tile 3068 = 16×3.2×16 mm). Exporters emit millimetres.
- OBJ conversion flips Y (`y_obj = -y_vrt`) and reverses facet winding so
  normals stay outward in Y-up space.
- Rotations are stored as "brees": 65536 units per full circle, applied
  in the order **Y (bearing) → X (pitch) → Z (roll)**, around a stored
  per-object rotation centre.
- Object sizes define a bounding cube; relative shape points scale into
  it (an *instance* can rescale a shape arbitrarily — world templates
  instance a 20000-unit shape at 20,000,000 to make a 20 m ground plate).

---

## 2. `.lca` — the model container

A LEGO wrapper around a Superscape **VCA** archive.

### 2.1 Check-word stream (the wrapper's one trick)
From offset **0x54**, the payload is interleaved with a **4-byte check
word after every 1000 payload bytes**. Each check word is the s32 sum of
the preceding 1000 bytes interpreted as *signed chars*. Strip these
("destreaming") before parsing anything; insert them when writing.
All 264 retail files verify byte-exact.

### 2.2 Header and VCA directory
The LCA header includes a **category string** (`Brick`, `Minifigure`,
`Castle`, `Weapon`, `Cannon`, `Building`, `Destructor`, `Horse`,
`Animal`, `Bat Flock`, `Dragon`, `Scenery`, and `User` for world
templates & challenge maps). The destreamed payload contains a VCA
directory at ~0xF4: entry = filename (`NOTNAMED.SHP` / `.PAL` / `.WLD`,
null-padded) + u32 offset + u32 length. Each sub-file = a
`SuperScape (c) ...` preamble terminated by **0x1A**, then a 4-byte
magic (`SHAP`, `PALT`, `WRLD`).

No thumbnail chunks exist in retail `.lca` files — warehouse previews
ship as standalone BMPs beside each model inside `warehouse.pak`.

### 2.3 SHP (shapes)
After the `SHAP` header: shapes as chunk lists, each chunk =
`{u16 type, u16 length_incl_header, payload}`, list terminated by
0xFFFF (double 0xFFFF ends the file region); then a symbol table (§8).

Chunk types observed in retail SHPs: 0 POINTS, 1 LINES, 2 FACETS,
3 COLOURS, 5 TEXT, 6 SIZE/misc, 7, 8, 11 NORMALS. **No texture or UV
chunks live in SHP** — see §5.

- **Points**: three kinds. ABS = absolute s32 xyz. REL = s16 triplet
  scaled by instance size /16384 (values may exceed ±16384 — benign
  overshoot, e.g. terrain dipping below its cube). GEOM = derived:
  interpolate between two prior points by mult/2^shift. The first 8
  points are always the implicit bounding-cube corners.
- **Lines**: point-index pairs. **Facets**: numbered; each lists
  (line index, reverse flag) entries; chain the directed edges to get
  the vertex loop. Retail facets are stored pre-chained (loop order ==
  edge file order) — relevant for UV pairing (§5).
- **Known benign anomaly**: almost every shape ends with exactly one
  4-line facet that does not close (always the highest facet number).
  Skipping it loses no geometry. Purpose unknown (open question §10).
- LOD convention: `<name> D1/D2/D3` shapes are distance variants;
  shapes may omit points/lines and inherit them from the previous
  shape in the file (LOD sharing).

### 2.4 PAL (palette)
`PALT` magic + 14 more header bytes, then **256 RGB byte triples**
starting at magic+18. This is the *file's own* palette — see §7 for
when it is and isn't the one that matters.
(The XVR-bound `CREATO~2.PAL` uses a shorter header: triples at
magic+16. Both verified independently.)

### 2.5 WLD (world)
After `WRLD` header (objects begin at +12): a stream of chunks; type 0
with length ≥ 0x44 is an **object record** (number, type = shape index
- 1 (0xFFFF = group), position, size, flags, child/sibling offsets
forming the tree, rotation). Other chunk types attach to the most
recent object. Observed per-object chunk types:

| type | name | notes |
|---|---|---|
| 0x01 | COLOURS | per-facet palette indices → **file palette** |
| 0x03 | ROTATIONS | brees + centre |
| 0x04 | DISTANCE | LOD switch distances |
| 0x05/0x0D | TEXT/TEXTINFO | labels, e.g. `BRICK: L 394101` (0x0D is **not** a translate table — naming trap) |
| 0x06 | SCL | compiled script (undecompiled; objects named `SCL Bomb` etc. confirm sounds/behaviour trigger here) |
| 0x14 | COLLISION | |
| 0x17 | **LITCOLS** | per-facet indices → **global runtime palette** (§7) |
| 0x1C | SPRTRANS | "textures used" translate table (master world only) |
| 0x1F | PROPERTIES | |
| 0x20 | **TEXCOORDS** | per-facet UV specs (§5) |
| 0x23 | **MATERIAL** | `{u8 Shininess,IShin, u8 Transparency,ITransp, u32 Flags,...}`. Flags bit0 = E_MATCHILDREN (inherit down the subtree). Metals are authored here: King Leo's root carries Shininess=50 inherited by sword/crown — the runtime specular gleam. Transparency 0..255 (helper plates ship at 225–255 = near-invisible). Exporter maps these to MTL Ks/Ns/d with `_s{shin}t{transp}` material variants. |
| 0x24 | PROJECTOR | |

Object flags: 0x80000000 invisible, 0x40000000 invisible-by-default.
LOD stand-ins and gameplay helpers (waypoint Arrows, alternate-state
"`<name> C`" parts) ship pre-hidden — honour the flags.

**Flat-plane handling** differs by category. Regular models: skip huge
horizontal planes (YSize ≤ 10, X or Z ≥ 20000) — they are shadow
planes. `User`-category worlds: those planes are terrain when parented
directly to the world root (grass/water/sand mats); hide only
non-root-parented flats (per-model footprint trios of
plane → B-spline path → tint plane). Verified: zero real geometry lost
under this rule across all 15 world files.

---

## 3. `.pak` — "DPAK" archives (system.pak, warehouse.pak)

Recovered from PAKMgr.ocx (the retail OCX still contains its stubbed
PAK-*creation* code, which is how the writer's constants were read).

```
0x00  'DPAK'
0x04  u32 version = 0x00010000
0x08  u32 tree_offset (0x18)
0x0C  u32 entry_table_offset
0x10  u32 string_table_offset
0x14  u32 data_offset
```
Tree node = `{u32 n, u32 name_str_off[n], u32 child_off[n]}`; a child
offset pointing inside the entry table is a file, otherwise a subdir
node. File entry = `{u32 length, u32 offset}`. Strings are C strings.
**No compression.** `system.pak`: 777 files (371 challenge voice-over
WAVs named `c<n>s<scene>t<take>.wav`, 392 help TXTs, UI BMPs,
creator2000.xvr). `warehouse.pak`: the 264 `.lca` models + a BMP
thumbnail per model.

---

## 4. `.xvr` — compressed bound world

`XVR` (or `SVR`) 3-byte magic + **raw DEFLATE** (zlib `wbits=-15`).
`creator2000.xvr` (3.4 MB) → 11.9 MB bound VRT containing, in order:
CFG, WLD (the runtime workshop scene: 51 shapes / 2225 objects, only
49 visible — the rest are hidden runtime stock), SHP, PAL, SND (§6),
SPR (§5.1). Sub-file boundary = `SuperScape (c)` preamble + magic.

**Trap:** the SPRT sub-file's internal offsets are relative to the
sub-file start **including its 120-byte preamble**. Splitting at the
magic shifts every sprite by 120 bytes (wrap seams in small sprites'
bottom rows; a 120-px horizontal wrap on 256-wide ones).

---

## 5. Textures

### 5.1 SPRT image bank (CREATO~2.SPR — 310 sprites)
```
u32 body_len | 'SPRT' | u16 0 | u16 revision | u16 0 | u16 fmt(0x0A05)
u16 count            <-- u16 at +12, table at +14 (NOT u32/+16 — trap)
count × {u16 Width, u16 Height, u32 Offset}
```
Real dimensions = value & 0x3FFF. Flag bits:

- `Width & 0x4000` — a 4-byte hotspot precedes the pixels (5 sprites).
- `Height & 0x8000` (E_SPRPALETTE) — a 768-byte RGB palette **follows**
  the pixels…
- …but it is only used for display when `Height & 0x4000`
  (E_SPRUSEPAL) is **also** set (110 sprites). The 164 sprites with
  0x8000 alone (e.g. minifig faces) carry an attached authoring
  palette whose pixels actually index the **global palette** —
  decoding them with the attached palette yields garish magenta/orange
  output. 16 sprites have no attached palette at all.

Pixels are 8-bit indices, `Width×Height`, first stored row first.
Bank contents: 159 real textures (29×256², 10×512², plus decals,
prints, faces) and ~145 1×1 colour swatches / empty slots. Sprite 0 is
a null entry.

### 5.2 UVs and referencing
Per-facet UVs live on **world objects** as chunk 0x20:
```
u16 NTextures, u16 Flags, then per spec:
u16 Facet (matches the facet's Number), u16 NumPoints,
s16 Texture, ITexture, TexScale, ITexScale,
s16 ScaleX, ScaleY, OffsetX, OffsetY,      (8.8 fixed; retail: always
float uv[2×NumPoints]                       0x100 scale / 0 offset)
```
- UV order follows the facet's stored line order; retail facets are
  pre-chained, so pairing with the derived loop is direct. Reverse the
  UV list together with the winding reversal.
- **Texture refs are DIRECT global sprite indices** (ref 0 = none;
  sprite 1 = the LEGO stud texture referenced by nearly every plate).
  The master world instead uses small local refs translated through
  per-object 0x1C SPRTRANS tables `{u16 n, u16 map[n]}` with a null
  slot 0: `global = map[ref]`.
  **Trap:** distanced-LOD tree billboards live at *adjacent* bank
  slots, which makes an off-by-one mapping look visually correct —
  do not calibrate indexing on trees.
- **V axis:** tv=0 addresses the FIRST stored row. With PNGs dumped in
  storage order, `vt = (tu, 1 − tv)`. Proven self-consistently by the
  King Leo shield: a full-window [0,1]² decal whose geometric point
  (tv=0 end) is stored in row 0. Decoration sprites are therefore
  stored "visually flipped" in the bank. UVs beyond [0,1] = tiling.

---

## 6. Sounds

### 6.1 SOUN bank (CREATO~2.SND — 92 sounds)
Same header family as SPRT (`len | 'SOUN' | 0 | rev 482 | 0 | 0x0A05`),
then **sequential** records:
```
u16 Type (0 = 8-bit signed PCM, 1 = 16-bit)
u32 Length       <-- TOTAL record length INCLUDING this 12-byte header (trap)
u8  Pitch (MIDI note of the recording), u8 Spare
u32 Flags (bit0 right, bit1 left)
u8  Data[Length-12]
```
Sample rate is not stored; 11025 Hz plays correctly (engine varies
Pitch for the randomized minifig-chatter effect). The bank ends with a
symbol table (§8) naming **all 92 sounds** — categories
`Minifigures : <char> Greeting/Random/Collision`, `Action : …`,
`Environmentals : …`, `Horses`, `Vehicles`, `Bricks : Link/Collide/
Connect`. Character codes: KL King Leo, QL Queen Leonora, PS Princess
Storm, RS Richard the Strong, CB Cedric the Bull, W Weezil, GB Gilbert
the Bad, JM John of Mayne, GenB/GenG generic kids, plus Skeleton.

### 6.2 Association
Shipped `.lca` files carry no per-object sound chunks; triggering is
compiled SCL. Name-convention matching (character/keyword tables in
`tools/associate_sounds.py`) yields a high-confidence object→sound
manifest; treat it as a starting map, not decoded logic.

---

## 7. The two colour systems (the palette trap)

| source chunk | palette used | typical content |
|---|---|---|
| COLOURS (0x01) / shape colours | the **file's own PALT** | bricks, terrain, most props (verified across all 264 models; e.g. grass = file-pal index 72 = 41,122,77) |
| LITCOLS (0x17) | the **global runtime palette** (CREATO~2.PAL from creator2000.xvr) | minifig body parts, some props |

Resolution order used by the exporter: object COLOURS override →
LITCOLS via global palette → shape COLOURS → default. Anchors that
prove the split on King Leo: litcol 18 → (234,192,0) LEGO yellow
(hands/head); 26 → (0,22,158) royal blue (torso/arms); 34 → grey
(sword); 37/38 → near-black (legs/hips); 150 → white — every one wrong
under the file palette, every one right under the global one.
Whether the `.lca` PALT is used at runtime at all is an open question.

---

## 8. Symbol tables

SHP, WLD, and SND end with T_SYMNAME records:
`{u16 type, u16 len=38, s16 number, char name[32]}`, 0xFFFF padding
tolerated between records. WLD type 0 = object names; SHP names key
shapes; SND names sounds. Warehouse minifig files may ship with empty
object names.

---

## 9. Verification methodology (why the traps were survivable)

Every convention above was pinned by at least one *self-contained*
proof: known-plaintext (the `SuperScape (c)` preamble validates the
XVR deflate), geometric self-consistency (the shield decal fixes the V
axis), content anchors (LEGO yellow fixes the LITCOLS palette; the
stud texture corroborates direct refs), byte-exact check-word
verification on all 264 files, and in-game references supplied by the
project owner (a face sprite matching at correlation 1.0, zero
offset). When two proxies disagreed, a game screenshot settled it —
maintain that habit.

---

## 10. Open questions (for the original developers)

1. Check-word stream: VCA save option or LEGO wrapper addition?
2. The single deliberately-open terminal facet per shape — collision
   footprint? selection outline?
3. Were `.lca` texture refs authored directly against the fixed global
   bank, or was a translate step baked out at export?
4. Is the `.lca` PALT used at runtime at all, or is it editor-only
   (given LITCOLS index the global palette)?
5. Native sample rate of the SOUN bank (11025 assumed)?
6. Anything remembered about SCL bytecode would unlock the last
   undecompiled system (behaviour, animations, challenge logic).

---

## 11. SCL scripts — partially decoded

SCL (Superscape Control Language) is a tokenized stack bytecode; the
engine ships compile AND decompile entry points, and **the complete
builtin opcode table (687 functions) is in the SDK's APP_DEFS.H**
(`E_SCL<name>` defines, 0x2F..0x4FD). Decoded so far (tools/scl_dump.py):

- String literals: `0x13, u16 length, bytes` (null-terminated) —
  scripts are full of readable property names (`"Random Sound"`,
  `"Footstep Sound"`, `"Current Waypoint"`, `"Action Sound Frame"`).
- Page-prefixed opcodes: `0xFC b` = opcode 0x100+b, `0xFD b` = 0x200+b
  (verified: `fc 70`=sound, `fc 74`=soundq, `fd ea`=property — the
  latter always following a pushed string).
- Single-byte opcodes 0x2F..0xEB map directly via the table.
- The idiom `push-string; property` is how scripts read the named
  object properties seen in chunk 0x1F.

**Now decoded (tools/scl_decompile.py, ~84%% of bytes, 100%% of 747
chunks tokenise end-to-end):**
- `0x71` = universal push-prefix introducing the next operand:
  `71 13 <u16 len> <bytes\0>` string; `71 FC/FD <b>` a call pushed as
  value; `71 F0 <b>` variable slot; `71 F2 <u16>` wide slot;
  `71 <small>` small constant.
- `0x28..0x2C` = push local var 0..4; `0x21 <u16>` = push constant;
  `0x50/0x51 <u16>` = branch-if-zero / branch-if-nonzero (relative);
  `0x8E`/`0x8D` = dereference var/counter; `0x00` = pad/type tag.
- `0xFC b` / `0xFD b` = opcode 0x100+b / 0x200+b (page selectors);
  `0xF0 b` / `0xF2 u16` = variable/property slot addressing.
- The `push-string; FD EA(property)` idiom reads a named object
  property; distance logic (`xpos/zpos/pow/sqrt`) and random-interval
  sound gating are now legible in the listings.

Remaining raw bytes are operand tails of a few rare multi-byte forms
and the exact statement-header layout -- enough to READ every script's
behaviour, not yet a byte-perfect recompiler. The SDK ships a
`_Decompile` entry point, so round-trip-faithful source was a designed
capability; this tool recovers the behaviour without it.

## 11b. Not yet decompiled
- CFG sub-file internals (runtime configuration).
- The XVR master WLD's runtime-only chunk types (viewpoints, light
  sources, horizon, fog) are parsed structurally but not interpreted.
