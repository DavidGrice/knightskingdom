# io_import_lca.py — Blender add-on (Knights' Kingdom edition)

Blender 3.0+ (tested design target 5.1). Install via Edit > Preferences >
Add-ons > Install, or paste into the scripting workspace and run.

## Operators
- **File > Import > LEGO Creator KK (.lca)** — full scene import:
  n-gon facet meshes, complete object hierarchy (groups as empties),
  hidden LOD/proxy subtrees imported *hidden* (toggle), metre scale
  (1 WLD unit = 1 µm; a minifig ≈ 4.6 cm), palette + textured materials,
  animation cels as looping shape keys. Optional **Texture bank** field:
  point it at `creator2000.spr` (or any blob containing the SPRT bank,
  e.g. the decompressed `.vrt`) for real face/torso/decal textures —
  without it, textured facets get magenta placeholders.
- **File > Import > KK Animation (.smo)** — select any object of an
  imported model first; the clip is keyframed onto the rig as one Action
  per part (quaternion rotation + location, 20 ticks/s mapped to scene
  FPS).

## SMO semantics (empirically pinned, see smo_pose_test.py)
- `brees_x = -rot[4]` (pitch), `brees_y = -rot[3]` (bearing),
  `brees_z = +rot[5]` (roll); applied in VRT's RY·RX·RZ order about each
  object's own rotation centre (mesh origins are placed there at import).
- Validated against minifigkingleo01.lca, whose rig rest E_CTROTATE brees
  match SMO frame-0 exactly (arms 45/10/15°, hands ∓10°), and by run-cycle
  stride direction / attention arm-raise numerics.
- Positions default to **delta from the clip's frame 0** added to the
  imported rest position (clips port across rigs whose absolute offsets
  differ); ABSOLUTE and rotations-only modes available.

## Track → object matching (three tiers)
1. exact lowercase name (`hips`, `leftarm`, …)
2. token aliases for master-world shape labels
   (`Minifig - Arm Left` → leftarm, `HipsBelt` → hips, `left foot` → …)
3. structural auto-map for unnamed standalone `SCL M/F` rigs
   (arm/hand rest-rotation fingerprints, leg/foot tree shape, hips =
   the body-bearing piece) — driven by `lca_*` custom properties the
   LCA importer stamps on every object.

## Validation
- `test_addon_mock.py` — mock-bpy harness, 22 checks, all passing against
  minifigkingleo01.lca / oc6098b2.lca / template-01.lca + real banks
  (VIS.SPR, creator2000.spr 304/304 non-empty sprites, .vrt container).
- `smo_pose_test.py` — applies SMO frames through the frozen exporter and
  renders posed OBJs (run passing pose, attention raise) to prove the
  rotation mapping outside Blender.

## Known limits / next steps
- Frame timing assumes the project-standard 20 ticks/s (no per-object
  AniVel decode yet).
- LITCOLS facets currently resolve against the file palette; global
  runtime-palette resolution (creator2000.pal) is a small follow-up.
- Master-world (creator2000.wld) direct import is a natural later phase:
  it parses clean (2225 objects, zero warnings) but ships as a bare WRLD
  sub-file, not an .lca container.
