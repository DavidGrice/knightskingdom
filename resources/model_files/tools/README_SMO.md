# SMO Format — Minifig Character Animations
### LEGO Creator: Knights' Kingdom (Superscape VRT 5.10 era)

**Status:** fully decoded, byte-exact across all 92 retail files (2 carry
stale trailing residue from LEGO's own re-export tooling — see §2).
**Tool:** `smo_parser.py` (reads `.smo`, emits `.json`).
**Date:** 2026-07-03.

---

## 1. What an SMO file is

An `.smo` file is a **baked skeletal animation clip for the minifig character rig**.
Each file stores one named gesture or locomotion cycle (`anim_c_angry`,
`anim_c_run`, ...) as a flat table of absolute pose samples — one full-body
pose per game tick — for the named objects that make up the minifig.

It is **not** a native Superscape container. Unlike `.lca`, `.spr`, `.xvr`
and the other files handled so far in this project, an SMO has:

- no `SuperScape (c) New Dimension International Ltd.` text preamble,
- no 4-character magic (`SPRT`, etc.), no revision/version bytes,
- no VCA archiver check-words (no 4-byte word per 1000 bytes),
- no chunk directory.

It is a lean, game-side format — presumably consumed by `LEGO2000.DLL` /
the game code rather than by the VRT engine's own loaders. Animation is
applied to world objects **by name at runtime**: the track names match the
minifig world-object names from the bound master world verbatim.

## 2. Binary layout

All values little-endian. No alignment padding beyond what is shown.

```
Header
    u16   numTracks        number of animated objects (rig parts)
    u16   numFrames        keyframe count, shared by every track

Track record  (repeated numTracks times)
    u16   nameLen
    char  name[nameLen]    ASCII, no terminator (e.g. "leftfoot")
    u16   reserved         0 in every observed track
    f32   frames[numFrames][6]
              [0..2]  position X, Y, Z   (VRT world units, Y-down)
              [3..5]  rotation triplet   (DEGREES)
```

File size check: `4 + Σ(2 + nameLen + 2 + numFrames×24)` — exact for 90
of the 92 retail files.

**Exception — stale residue (2 files).** `anim_r_explainleftreturn.smo`
and `anim_r_think.smo` are larger than the size check predicts (by 5808
and 1320 bytes). Verified 2026-07-03: both are shorter re-exports written
**in place over an older, longer take without truncating the file** —
LEGO's authoring tool's bug, shipped on the disc. The residue is the old
version's tail: with the same 11 track names, an old take of 36 frames
(vs 14) and 120 frames (vs 115) respectively lands on the actual file
sizes *exactly*, and the old track-name strings (`rightarm`, `body`,
`hips`, `rightfoot`, `righthand`, `lefthand`) appear at the byte offsets
the old layout predicts. The header's frame count describes the live
data correctly; parse the declared frames and ignore anything after
them. (`smo_parser.py` prints a note and skips the residue; a file
*shorter* than the layout demands is still an error.)

Key properties:

- **Absolute samples, not deltas.** Every frame is a complete pose; there
  are no interpolation keys, tangents, or timing fields. Playback is one
  sample per tick (20 ticks/sec assumed, per the AniVel convention
  established earlier in the project — making `run` a 1.05 s loop and the
  161-frame emotes ~8 s).
- **Frame 0 is the rest pose** and matches the minifig rig offsets known
  from the master world: hips Y=5800, body 3280, head 4750, arms ±3270
  with the (−10, −45, ±15)° hang, feet at Y=−4350 (Y-down).
- **Positions are parent-relative rig offsets**, not world coordinates.
- Track order is not fixed between files; consumers must match by name.

## 3. Rotation axis caveat

The rotation triplet is confirmed to be degrees (values like ±45, ±76,
−132.7), but the axis ordering is **not** a plain world-XYZ Euler: the
run cycle's leg swing lives in float `[4]` (the middle rotation value),
not `[3]`. The exact VRT axis convention should be confirmed against the
SDK's `T_ROTATE` / object-rotation documentation before retargeting onto
exported models. Until then treat the triplet as an opaque (a, b, c)
rotation in VRT's native order.

## 4. The rig

Standard track set (11 objects):

```
hips  body  head
leftarm   righthand   leftleg   leftfoot
rightarm  lefthand    rightleg  rightfoot
```

`anim_c_attention.smo` carries a twelfth track, **`horn`** — a herald's
trumpet prop that exists in the rig only for that gesture (static pose at
(1.8, 1250, −1543.7), pre-tilted (−1.3, 0.6, 0)°).

The `_c_` filename infix presumably selects a character class; sibling
`anim_a_` / `anim_b_` files, if present on the disc, would confirm the
scheme.

## 5. The seven sample clips

| File | Tracks | Frames | ~Duration | Content |
|---|---|---|---|---|
| anim_c_run.smo       | 11 | 21  | 1.05 s | Run cycle: legs ±76°, arms counterswing to −133°, hips bob 6100–7850 |
| anim_c_decline.smo   | 11 | 63  | 3.2 s  | "No": head shakes ±60° yaw, arms raise with hand curls |
| anim_c_confused.smo  | 11 | 92  | 4.6 s  | Head tilt/wobble, arms lift (with elbow-style Y offset), hand rotations |
| anim_c_attention.smo | 12 | 93  | 4.7 s  | Salute/announce: arm raised to −138°, `horn` prop present |
| anim_c_pleased.smo   | 11 | 99  | 5.0 s  | Body sway ±25°, gentle arm raise, head nod |
| anim_c_angry.smo     | 11 | 161 | 8.1 s  | Full tantrum: arm flails, head shakes, hip jump to 19625 (stomp) |
| anim_c_sad.smo       | 11 | 161 | 8.1 s  | Slump: head drops −28°, arms droop with slight raise, body sag |

Emotes keep legs/feet static (planted); only `run` animates the lower
body. Static tracks are still stored at full length — the format does no
compression whatsoever, which is why `angry`/`sad` reach 42 KB.

## 6. Tooling

- `smo_parser.py` — standalone, stdlib-only. Parses any `.smo` into JSON:
  `{file, num_tracks, num_frames, tracks:[{name, reserved, frames:[{pos, rot}]}]}`.
  Asserts zero leftover bytes.
- JSON dumps for all seven clips delivered alongside.

## 7. Suggested next steps

1. Confirm rotation axis order against SDK `T_ROTATE` docs / headers.
2. Extend `io_import_lca.py` to load SMO clips as Blender actions on the
   imported minifig (name-matched, one keyframe per sample at 20 fps).
3. Add SMO→glTF animation export beside the existing morph-target path,
   so clips travel with the GLB minifig.
4. Sweep the install/disc for further `.smo` files (other character
   prefixes, NPC-specific gestures) and for the code path that loads them,
   to confirm the tick rate and the `reserved` field's purpose.
