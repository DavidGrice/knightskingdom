# LCA Format Specification — Knights' Kingdom Edition

**LEGO Creator (2000) / LEGO Creator: Knights' Kingdom — Superscape VRT 5.10**

Status: every structure in this document is implemented by the frozen
toolchain (`lca_parser.py` and companions) and validated against the full
model corpus (259+ files, zero parse warnings), the global runtime bank
(`creator2000.xvr` contents: 2225-object master world, 51-shape bank,
310-sprite bank, 92-sound bank), and the seven `.smo` gesture clips.
All multi-byte integers are **little-endian** unless noted.

---

## 1. Conventions

### 1.1 Units
| Context | Scale | Verified by |
|---|---|---|
| SHAP shape space | 100 units = 1 mm | L306800 = LEGO 3068 Tile 2×2 = 16×3.2×16 mm |
| WRLD world space | 1000 units = 1 mm | same part placed; world authoring is 10× shape scale |
| LDraw bridge | 400 WLD units = 1 LDU (0.4 mm) | 2-stud brick = 40 LDU |
| Blender import | 1 WLD unit = 1 µm (1e-6 m) | minifig ≈ 4.6 cm |

### 1.2 Coordinate system
Superscape documentation describes VRT as Y-down, but **KK content is
authored with +Y as world-up** (verified: minifig head at larger Y than
feet; template terrain mass at low Y, mountains rising toward +Y).
Treat VRT here as **X right, +Y up, Z horizontal**, one mirror away from
right-handed conventions.

| Target | Vertex mapping | Winding | Note |
|---|---|---|---|
| OBJ (RH, Y-up, mm) | `(x, −y, z) × 0.001` | reverse | **historical**: the frozen exporter's HP-era flip leaves model-up at NEGATIVE OBJ Y; kept frozen because the live game pipeline consumes it as-is. Display consumers must re-flip the vertical. |
| Blender (RH, Z-up, m) | `(x, z, y) × 1e-6` | reverse | upright |
| LDraw (−Y-up, LDU) | `(x, −y, z) / 400` | `BFC NOCERTIFY` | upright |
| QA / thumbnail display | matplotlib `(x, z, −y_obj)` | n/a | re-flips the OBJ vertical |

Rotations are stored as **brees** (binary degrees: 65536 = 360°) in the
order `[bx, by, bz]` and applied **RY(by) · RX(bx) · RZ(bz)** — bearing,
then pitch, then roll. Converting a rotation matrix `R` to a mirrored
target space uses the conjugation `R' = C R Cᵀ` with the mapping matrix
`C` above (the result is always a proper rotation).

### 1.3 Symbol table record (`T_SYMNAME`, shared by SHAP/WRLD/SOUN)
```
u16  type        (WRLD: 0 = object symbol)
u16  length      always 38
s16  number      target object/shape/sound number
char name[32]    NUL-padded Latin-1
```
`0xFFFF` words between records are padding and are skipped.

---

## 2. The .lca container

```
0x000  char app[32]        e.g. game identifier, NUL-padded
0x020  char category[32]   'Minifigure' | 'Castle' | 'Brick' | 'User' | ...
...    (header continues to 0x148)
0x054  VCA byte stream begins
```

`category == 'User'` marks world templates and challenges; these get the
template flat-plane rule (§4.6) instead of the classic ground-plane rule.

### 2.1 VCA check-word stream (`destream`)
Starting at file offset **0x54**, the archiver inserts a 4-byte check
word after **every 1000 bytes** of payload:

```
[1000 payload bytes][s32 checksum] repeated; final block may be short
checksum = sum of the 1000 payload bytes as SIGNED bytes
```
Strip the check words (validating each full block) to obtain the pristine
VCA stream. A checksum mismatch on a full block is a hard error.

### 2.2 VCA directory
At **stream offset 0xF4**:
```
0x0F4  char magic[6]   ".VRT\0\0"
0x0FA  u32  version
0x0FE  u16  format
0x100  u16  count
0x102  count × { char name[14]; u32 offset; u32 length }   (22 bytes each)
```
Directory offsets are **unreliable** in shipped files; locate the
sub-files by scanning each directory blob for its magic (`SHAP`, `PALT`,
`WRLD`) instead. Every shipped `.lca` contains exactly NOTNAMED.SHP /
.PAL / .WLD; none embeds a sprite bank (textures reference the global
bank directly, §6).

---

## 3. SHAP — shape bank

```
0x00  'SHAP'
0x06  u32  revision
0x0A  u16  version          (low byte . high byte, e.g. 5.0A = 5.10)
0x10  u32  default_size[3]
0x1C  shape records begin (offset 28)
```

Shapes are chunk lists, each terminated by a `u16 0xFFFF`; the whole
sequence ends with an **extra** `0xFFFF`, followed by the symbol table.
An empty chunk list (immediate `0xFFFF`) is a null shape slot. **WLD
object `type` = shapes[] array index − 1** (type 0 → second slot).

Chunk header: `u16 ChkType, u16 Length` — Length includes the 4-byte
header. Chunk types:

| ID | Name | Payload |
|---|---|---|
| 0 | POINTS | see §3.1 |
| 1 | LINES | `u16 n`, then n × `{u16 a, u16 b}` point indices |
| 2 | FACETS | see §3.2 |
| 3 | COLOURS | one palette index byte per facet, ordered by facet `Number` (1-based) |
| 4 | LITCOLS | (shape-level; rare — object-level 0x17 is the live path) |
| 5 | TEXT | NUL-terminated annotation |
| 6 | SIZE | `s32 x, y, z` shape bounding size |
| 7 | SCL | compiled script blob (length recorded; **never disassembled**) |
| 8 | ANIMCOLS | present in bank shapes; not needed for geometry |
| 9–11 | TEXTURES / SPRTRANS / NORMALS | reserved; object-level variants are the live path |

### 3.1 POINTS (chunk 0)
```
u16 npts, u16 ncels, then npts records:
  u16 flags     bits 0–2 type, bits 3–5 anim mask, bit 15 PNT_DYNAMIC
  positions     ncels entries if PNT_DYNAMIC else 1, each 6 bytes:
    type 0 ABS  : s16 x, y, z            (shape-space units)
    type 1 REL  : s16 x, y, z            coord = size × v / 16384
    type 2 GEOM : s16 p1, s16 p2, u8 shift, u8 mult
                  point = P1 + (P2 − P1) × mult / 2^shift
    type 3 UAB  : treated as REL
```
**Points 0–7 are implicit**: the shape box corners, index bits
`(bit2→X, bit1→Y, bit0→Z)` selecting 0 or size on each axis. Defined
points start at index 8. REL points therefore only have meaning against
an **instance size** — objects may re-instance a shape at any size.

`ncels > 1` = vertex animation: one full position set per cel for
dynamic points (playback ~20 cels/s, §8.3).

### 3.2 FACETS (chunk 2)
```
u16 nfac, then nfac records:
  u8  NumLines, u8 FacAtt, u16 Number, NumLines × u16 line
  line & 0x7FFF = index into LINES; bit 0x8000 = edge reversed
  FacAtt & 0x10 (E_FACSPECIAL) = mesh facet, line indices not bounded
```
Edges chain **anticlockwise seen from the visible side**; the loop is
reconstructed by chaining shared endpoints. `Number` keys the facet into
COLOURS (index Number−1) and into object-level TEXCOORDS/LITCOLS.
Facets with < 3 chainable lines are points/wireframe edges.

### 3.3 LOD inheritance
LOD shapes may omit POINTS and/or LINES; they reuse the most recent
earlier shape that defined them (resolved against the *current* instance
size).

### 3.4 The exporter junk bug (critical)
The original authoring exporter occasionally leaves a stray 4-byte
insertion of the form `XX XX 00 00` inside POINTS, LINES, and FACETS
payloads that the chunk **Length does not count**. These chunks must be
parsed by record count with validity oracles, resyncing over junk:

- POINTS: a flags word failing `(flags & 0x7FC0) == 0` whose next two
  bytes are `00 00` is junk (before a record, or between flags and
  coordinates — the latter detected by probing the following record).
- LINES: a pair referencing a point index ≥ npts with `00 00` in the
  high half is junk occupying one slot.
- FACETS: try-read with plausibility checks (`0 < NumLines ≤ 64`,
  `Number ≤ 4096`, line indices bounded unless E_FACSPECIAL); on failure
  skip forward 2 bytes at a time (≤ 8) and retry; a 4-byte skip is also
  probed between the (NumLines, FacAtt) pair and Number.

The whole 259+ file corpus parses with zero warnings under these rules.

---

## 4. PALT — palette

`'PALT'`, then at offset **18**: 256 × 3 bytes RGB. Facet COLOURS bytes
index this table. The **global runtime palette** (creator2000.pal, same
layout) is a separate table indexed by object-level LITCOLS (§5, 0x17).

---

## 5. WRLD — world / object tree

Stream of chunks from offset **12**; `0xFFFF 0xFFFF` terminates the
object stream, followed by the symbol table. Chunk header as in SHAP.

### 5.1 E_CTSTANDARD (type 0x0000, 0x44 bytes on disk)
```
<HHHHiiIIHiiiiiiiHHIIH>  =
u16 type(0), u16 len, u16 totlen, u16 number,
s32 child, s32 sibling,          # BYTE offsets relative to this record's
                                 # own offset; 0 = none
u32 ptr, u32 ptr,                # garbage runtime pointers, ignore
u16 maxchunk,
s32 xsize, ysize, zsize,         # instance size (rescales the shape)
s32 xpos,  ypos,  zpos,          # position relative to parent origin
s32 diag,
u16 type,                        # shape ref = shapes[] index − 1;
                                 # 0xFFFF = group (no geometry)
u16 layer, u32 dflags, u32 oflags,
u16 trigger
```
`totlen` counts the standard chunk plus all its optional chunks; the
first object is the world root. Hierarchy: follow `child`, then that
object's `sibling` chain (offsets are relative to each record's own
offset).

Object flags (`oflags`):
| Bit | Meaning |
|---|---|
| 0x80000000 | E_OFINVISIBLE — hidden (LOD stand-in, proxy, helper) |
| 0x40000000 | E_OFINVISDEF — hidden by default |

Hidden objects hide their whole subtree at runtime.

### 5.2 Optional per-object chunks
| ID | Name | Payload |
|---|---|---|
| 0x01 | CT_COLOURS | facet colour override bytes (by facet Number−1), beats shape COLOURS |
| 0x03 | E_CTROTATE | `s16 bx, by, bz` (brees) … `s32 cx, cy, cz` at +14 into payload (file offset o+18): rotation **centre** in local space |
| 0x0F | CT_INITSIZE | `s32 × 3` |
| 0x15 | CT_INITPOS | `s32 × 3` |
| 0x17 | LITCOLS | per-facet indices into the **global runtime palette** |
| 0x1C | SPRTRANS | `u16 n`, n × u16 — local→global sprite translate table (master world only; shipped .lca refs are already direct) |
| 0x1F | CT_PROPERTIES | NUL-separated strings |
| 0x20 | TEXCOORDS | see §5.3 |
| 0x23 | MATERIAL | `u8 shininess, u8 ishin, u8 transparency, u8 itransp, u32 flags` — flags bit 0: value inherits to children |

Object frame composition (validated math):
```
local(v) = pos + c + R·(v − c)        R from brees, c = rotation centre
world    = parent_world ∘ local
```
Objects without a rotation chunk pivot about their box corner; the
Blender importer places mesh origins at `c` (or size/2 when absent) so
runtime-style rotation replacement works.

### 5.3 TEXCOORDS (0x20) — facet UV records
```
u16 count, u16 pad, then count × T_TEXCOORDSPEC:
  u16 Facet          matches facet Number
  u16 NumPoints
  s16 Texture        DIRECT global sprite index in shipped .lca;
                     via SPRTRANS in the master world; 0 = untextured
  s16 ITexture, s16 TexScale, s16 ITexScale,
  s16 ScaleX, ScaleY, OffsetX, OffsetY
  f32 uv[NumPoints × 2]
```
UV `v` is top-down (D3D-style): OBJ/Blender `v = 1 − tv`. UVs pair with
the facet loop **in order**; a spec whose NumPoints mismatches the loop
length is ignored (falls back to colour). Textured facets render with a
white base (no colour modulation) — validated against in-game look.

### 5.4 Name conventions (WLD/SHP symbols)
- `L <part><ss> <desc> <colour>[nnn]` — LEGO part reference; strip the
  final two digits for the LDraw part number (L306800 → 3068,
  L449500 → 4495).
- `SCL M/F : <CODE><nn>` — character minifig roots. Codes: KL King Leo,
  QL Queen Leonora, PS Princess Storm, RS Richard the Strong,
  CB Cedric the Bull, W Weezil, GB Gilbert the Bad, JM John of Mayne.
- `SCL Castle/Bomb/Vehicle : <id>` — scripted assemblies.
- `<name> C` — alternate-state/close-up proxy (hidden); `… D1/D2/D3` —
  damage-state variants; ` PART n` — standard visible piece.
- Standalone character rigs are otherwise **unnamed**; the SMO track
  names correspond to global SHP bank shape names
  (`Minifig - Arm Left`, `Leg Right`, `left foot`, `HipsBelt`, `horn`).

### 5.5 Ground/shadow planes
Helper flats satisfy `YSize ≤ 10 and (XSize ≥ 20000 or ZSize ≥ 20000)`.
Classic models: hide all such flats. **Template rule** (`User`
category): flats parented directly to the world root are legitimate
terrain mats and stay; only *nested* flats (shadow/footprint helpers,
chained plane → B-spline path → tint plane trios) are hidden.

---

## 6. SPRT — sprite (texture) bank

Global bank: `CREATO~2.SPR` inside `creator2000.xvr` — 310 entries
(304 real; entries with all-zero table rows are empty placeholder
slots). System UI bank: `VIS.SPR` (71 entries, 36 real).

```
preamble ('SuperScape (c)' … 0x1A)     # offsets below are relative to
                                       # the SUB-FILE START incl. preamble
u32  body_len
'SPRT', u16 0, u16 revision, u16 0, u16 fmt (0x0A05 = 5.10)
u16  count
count × { u16 Width, u16 Height, u32 Offset }
```
Per entry (`E_SPRMASK = 0x3FFF` masks real dimensions):
- `Width & 0x4000` — a 4-byte hotspot precedes the pixels
- `Height & 0x8000` — a 768-byte RGB palette **follows** the pixels
- `Height & 0x4000` — that palette is actually used for display;
  attached-but-unused palettes (0x8000 only) are authoring data and the
  pixels index the **global** palette

Pixels: 8-bit palette indices, row-major, **top-down** (flip for
bottom-up targets such as Blender images).

## 7. SOUN — sound bank

`CREATO~2.SND`: 92 sounds. Same framing as SPRT (`u32 body_len` before
the magic; `u16 revision` at +6). Records from magic+12:
```
u16 Type       0 = signed 8-bit PCM, 1 = 16-bit PCM
u32 Length     TOTAL record bytes incl. this 12-byte header
u8  Pitch      MIDI note
u8  Spare
u32 Flags
u8  Data[Length − 12]
```
Sample rate is **not stored**; 11025 Hz is correct for this game. A
T_SYMNAME symbol table (sound names) follows the last record. Convert
type-0 data to unsigned (+128) for WAV.

## 8. Containers and animation

### 8.1 XVR archive
`'XVR'` (or `'SVR'`) magic, then a raw DEFLATE stream (`zlib`
wbits = −15). The payload is a **bound VRT**: a small wrapper followed
by concatenated sub-files, each `'SuperScape (c)'` preamble
(0x1A-terminated, carrying a descriptor like
`World file CREATO~2.WLD revision 1395`) + body magic
(WRLD/SHAP/PALT/SPRT/SND\0/SCFG/FONT). SPRT bodies must keep their
preamble (offset base, §6). creator2000.xvr additionally binds a
57-byte `CREATO~2.XVR` directory stub — a genuine sub-file, not
corruption.

### 8.2 SMO — character animation clips
Game-side format, **no Superscape preamble/check-words**:
```
u16 numTracks, u16 numFrames, then numTracks ×:
  u16  nameLen
  char name[nameLen]      'hips','body','head','leftarm','rightarm',
                          'lefthand','righthand','leftleg','rightleg',
                          'leftfoot','rightfoot' (+'horn' in attention)
  u16  reserved (0)
  f32  frame[numFrames][6]
       [0..2] position XYZ (WLD units)
       [3..5] rotation triplet in DEGREES
```
Absolute pose per tick (~20 ticks/s); frame 0 is the rest pose.

**Rotation semantics (empirically pinned):**
```
brees_x = −rot[4]   (pitch)      applied RY · RX · RZ about the
brees_y = −rot[3]   (bearing)    object's own E_CTROTATE centre
brees_z = +rot[5]   (roll)
```
Proof: the standalone `SCL M/F` rig's rest E_CTROTATE brees equal SMO
frame-0 exactly (arms 45°/10°/15°, hands ∓10°); run-cycle stride
direction, hip bob, and the attention arm-raise verify signs
numerically. **Positions port across rigs as deltas from frame 0**
(absolute offsets differ between the standalone and master rigs).

Shipped clips: run 21f · decline 63f · confused 92f · attention 93f
(12 tracks) · pleased 99f · angry 161f · sad 161f. The run cycle is
symmetric: f0/f10 are opposite strides, f5 ≡ f15 is the passing pose.

### 8.3 Cel playback
Shapes with `ncels > 1` cycle one cel per tick at the same ~20 ticks/s
(per-object AniVel decoding is an open item; the constant matches
observed behaviour).

---

## 9. Validation status

| Area | Evidence |
|---|---|
| Container/SHAP/PALT/WRLD | 259+ .lca corpus + master world (2225 objects) + global SHP (51 shapes): **zero warnings** |
| Geometry/transform math | 260+ OBJ exports QA-rendered; scale anchored to real LEGO part dimensions |
| Texture suite (0x17/0x1C/0x20/0x23) | textured exports vs in-game look; `missing_tex = []` against the real bank on all samples |
| SPRT | 304/304 + 36/36 real sprites decoded; empty-slot pattern characterised |
| SOUN | 92/92 WAVs, symbol names resolved |
| XVR | synthetic recompress → extract → **byte-identical** sub-files |
| SMO | rest-pose identity + posed-render/numeric checks; Blender add-on 22/22 harness checks |
| LDraw mapping | MPD round-trip geometry identical to the frozen exporter to <0.05 mm |

Open items: AniVel timing chunk, CNFG (SCFG) internals, SCL bytecode
(**out of scope by policy — never disassembled**).
