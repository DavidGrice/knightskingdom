# Workshop 3D Brick Editor — Plan & Session Handoff

**Branch:** `grok-dev`  
**Last updated:** 2026-07-02  
**Status:** **D4 implemented** (2026-06-30), D2b backlog done. 42/141 bricks now use real geometry (2026-07-02) — D5 optional remains next.
**Prior work:** Workshop UI/layout ✅ complete (`WorkshopStageLayout`, `workshopStageMetrics.js`, `HolderGridLayout`)

---

## Quick Start for a New Session

Tell Grok:

> Read `grok/README.md`, `grok/WORKSHOP_3D.md`, and `grok/ROADMAP.md` Phase 11. On `grok-dev`. Workshop UI done. **User chose Option D.** LCA→GLB is abandoned — use procedural/parametric bricks only. Implement Phase D1. Push to `origin/grok-dev` after every commit.

---

## ⚠️ 2026-07-02 update — LCA → GLB reversed for a subset of bricks

**User decision (2026-07-02):** the 2026-06-30 verdict below was reached using
the old legacy RE converter scripts (`resources/convert_brick.py` era). The
`resources/model_files/` toolchain was substantially reworked since (real
materials, LITCOLS/palette handling, world templates) and produces correct
OBJ/MTL geometry — confirmed by rendering pilot conversions before trusting
the batch run (see the "Wire real 3D models" plan / session log for
2026-07-02). A batch pipeline (`resources/model_pipeline/convert_bricks.mjs`)
converts every brick to `public/workshop/bricks/<id>.glb` (uniform 0.1x
scale correction: the toolchain's coordinates are true LEGO mm, and 8mm
stud * 0.1 = the Workshop's `STUD=0.8`), and `generate-brick-catalog.mjs`
enables `shape:'GLB'` only where the converted mesh's measured bounding box
matches its catalog stud footprint within tolerance -- **42 of 141** bricks
so far. The other 99 mismatch because `brickCatalog.generated.js`'s
`studs`/`heightPlates` were themselves guessed via fuzzy digit-matching
against a small ~60-part reference table and are wrong for parts outside it
(confirmed visually, e.g. `l420100` is a large multi-stud baseplate, not the
small composite the guesser assumed) -- not a mesh defect. Those keep their
existing parametric shape unchanged: no regression versus before this
pipeline existed. The procedural `BrickFactory` path below remains the
fallback/default for everything not GLB-validated.

**Later the same day:** the `obj2gltf` GLB conversion turned out to have an
inverted Y axis (source coordinates are Y-down) and, because a single
flipped axis inverts mesh handedness, back faces three.js's default culling
treated as missing. Rather than debug the conversion further, the **live**
rendering path was switched to loading `.obj`/`.mtl` directly at runtime
(`MainMenuStack/shared/objMtlLoader.js`, `resources/model_pipeline/copy_obj_assets.mjs`
→ `public/models/bricks/<id>.{obj,mtl}`) -- a single negated Y-scale
component both uprights the model and fixes the culling (three.js
auto-reverses front-face winding for a negative-determinant transform). The
GLB pipeline above (`convert_bricks.mjs`, `shape:'GLB'`/`glbUrl`) is
unchanged and still generated/loadable, it's just not what the running game
actually uses any more -- `BrickFactory.js` checks `objUrl`/`mtlUrl` first.
Same 42/141 validated set either way. Verified live: validated bricks render
upright, solid, and correctly textured; unvalidated ones are unaffected
(still parametric).

## Original 2026-06-30 constraint (superseded above for the 42 validated bricks)

**User decision (2026-06-30):** After ~2 years of RE work, LCA/VCA → GLB/OBJ conversion **does not produce usable meshes**. Offset parsing is unreliable; output is consistently wrong.

| Approach | Status |
|----------|--------|
| Legacy RE converter scripts | ❌ Not viable for game assets |
| `resources/convert_brick.py` | ❌ Not viable for game assets |
| Batch model-file → `.glb` pipeline | ⚠️ Reworked toolchain + per-brick validation reversed this 2026-07-02 for 42/141 bricks — see above |
| Raw model files in `BucketBottomResourceStack/` | ✅ Keep for RE reference + UI thumbnails only |
| PNG bucket thumbnails | ✅ Keep — UI already uses these |

**Do not block workshop implementation on mesh extraction.** Build the editor with **procedural/parametric Three.js geometry** keyed to catalog entries, with validated GLBs overlaid where available (see 2026-07-02 update above).

---

## User Choices (confirmed)

| Decision | Choice |
|----------|--------|
| Implementation option | **Option D** (phased hybrid) |
| Brick meshes | **Procedural/parametric** — not LCA-derived |
| World transfer | Single grouped placement in main world (original game behavior) |
| Camera | Fixed isometric-style (match original workshop viewport) — *default unless user says otherwise* |
| Persistence | Per-profile `customCreations[]` — *default unless user says otherwise* |
| Challenges | Defer to D5 |

---

## Original Game — What the Workshop Did

| Feature | Original behavior | Our approach |
|---------|-------------------|--------------|
| Separate 3D viewport | Black panel on workshop background | `WorkshopEngine` in `.stage` |
| Brick library (9 tabs) | Medieval part categories | Same UI; 3D = parametric shapes per catalog ID |
| Tools | Place, move, rotate, paint, delete, duplicate, sweep | Reuse `GameEngine` interaction patterns |
| Stud snapping | Grid-aligned placement | 0.8 stud unit snap (LEGO: 1 stud = 8mm → use 0.8 world units) |
| Save & transfer | Grouped model → main world bucket | **Runtime Group from `brickInstances[]` JSON** — no GLB required |
| Building instructions | Optional | Defer (D5) |

---

## Revised Option D — Phased Plan (no LCA pipeline)

```mermaid
flowchart LR
    D1[D1 Engine + core bricks]
    D2[D2 Tools + save/load]
    D3[D3 Full parametric catalog]
    D4[D4 World placement]
    D5[D5 Challenges optional]
    D1 --> D2 --> D3 --> D4 --> D5
```

| Phase | Goal | Deliverable | Effort |
|-------|------|-------------|--------|
| **D1** | Playable workshop | `WorkshopEngineCore`, build plate, ~12 core parametric bricks, place/move/rotate/delete/sweep, bucket selection wired | Small |
| **D2** | Polish + persistence | ✅ `workshopSave.js`, save/load `brickInstances[]` on `savedWorlds[id].workshopDraft` | Medium |
| **D3** | Full bucket catalog (3D) | `brickCatalog.js` — map every bucket entry to parametric shape + stud footprint; approximate slopes/cylinders/arches | Medium–Large |
| **D4** | Main world integration | Export creation → `customCreations[]` → "My Creations" in game bucket → place as runtime `Group` in world | Medium |
| **D5** | Optional extras | Challenge builds, building instructions, hand-curated GLBs for hero parts | Large / optional |

Each phase must pass `npm run build`.

---

## Backlog (user-reported, post-D1) ✅ D2b shipped 2026-06-30

| Priority | Issue | Status |
|----------|-------|--------|
| High | **Bucket stays open on brick select** | ✅ Removed `TOGGLE_BUCKET false` on select |
| High | **Fixed straight camera** | ✅ `(0, 5, 10)` — matches main game |
| Medium | **Finite export bounds** | ✅ 16×16 stud yellow border; save/export clamped |
| Medium | **Top-bar tools** | ✅ Recursive raycast + selection boxes + stack-on-place |
| Medium | **Duplicate above** | ✅ One brick-height gap above source |
| Medium | **Selector box per brick** | ✅ `transparentBox` + wireframe on each brick |

---

## Brick Asset Strategy (replaces LCA→GLB)

### Primary: Parametric `BrickFactory`

One factory builds Three.js meshes from a **shape recipe** + **stud dimensions**:

```js
// Example catalog entry (NOT from LCA geometry)
{
  id: 'l300500',           // from filename 00_l300500
  name: 'Brick 2×4',
  category: 'basic',
  shape: 'BOX',            // BOX | PLATE | SLOPE | CYLINDER | ARCH | WEDGE approx
  studs: { w: 2, d: 4 },   // stud footprint
  heightPlates: 3,         // 1 brick = 3 plates; 1 plate = 0.8/3 units
  thumbnail: '...png',     // existing UI asset
}
```

**Stud constants:**
- `STUD = 0.8` world units (width/depth per stud)
- Plate height = `STUD / 3`
- Brick height = `STUD` (3 plates)
- Snap grid = `STUD` on X/Z; Y snaps to plate increments

**Shape approximations for D3** (good enough for gameplay; refine visually against PNG thumbnails):

| Category | Parametric shape |
|----------|------------------|
| Basic / slim | `BoxGeometry` from stud footprint × height |
| Plates / tiles | Thin box (1 plate height) |
| Wedges / slopes | `BoxGeometry` + shear or pre-defined slope angles (45°, 33°) |
| Cylindrical | `CylinderGeometry` with stud-aligned radius |
| Arches | `ExtrudeGeometry` or composite boxes |
| Castle / windows | Composite of boxes (frame + hole via CSG or multi-mesh) |

### Secondary (optional, post-D3): Manual GLBs

- Author individual parts in Blender using bucket PNG as reference
- Drop into `public/bricks/<id>.glb`
- Catalog entry: `shape: 'GLB', glbPath: '...'`
- **Never depend on this for MVP**

### What we keep from RE assets

| Asset | Use |
|-------|-----|
| Raw model files | RE archive only; do not parse at runtime |
| PNG thumbnails | Bucket UI (unchanged) |
| `l<number>` in filenames | Catalog ID → map to public LEGO part dimensions (Rebrickable/LDraw reference for stud size, not mesh) |

---

## Data Model

### Workshop scene (in memory + saved)

```json
{
  "id": "creation-uuid",
  "name": "My Castle Gate",
  "brickInstances": [
    {
      "brickId": "l300500",
      "position": { "x": 0, "y": 0, "z": 0 },
      "rotation": { "x": 0, "y": 0, "z": 0 },
      "color": "c91a09"
    }
  ],
  "thumbnail": "data:image/png;base64,...",
  "updatedAt": "2026-06-30T..."
}
```

### Profile extension

```json
{
  "customCreations": {
    "creation-uuid": { /* scene above */ }
  }
}
```

### World placement (D4)

- User picks creation from game bucket → `ModelLoader` builds a `THREE.Group` from `brickInstances[]` via `BrickFactory`
- Group tagged `isModel`, `isMovable`, `userData.creationId`
- Serialized in world `scene.models[]` as one entry referencing `creationId` (or inlined brick list)

**No GLB export required** for save/load or world placement.

---

## Target Architecture

```
WorkShop.jsx
  └── WorkshopProvider (WorkshopContext)
        ├── GameShell (existing UI)
        ├── WorkshopEngine.jsx
        │     └── WorkshopEngineCore.js   ← flat plate, fixed camera, no map/climate
        │     └── BrickFactory.js         ← parametric mesh from brickCatalog
        │     └── useWorkshopInteraction  ← extracted from GameEngine mouse logic
        ├── Bucket → onBrickSelect(brickId) → mode ADDING
        └── ComponentTop/Bottom → tool handlers

MainGame (D4):
  Bucket "My Creations" tab (screenshot thumbnail per creation)
    → handleLoadModel('CREATION_<id>')
    → BrickFactory.buildGroup(customCreations[id])
    → place in world scene
```

---

## Phase D1 — Implementation Checklist (START HERE)

### Create

| File | Purpose |
|------|---------|
| `WorkShop/WorkshopEngine/WorkshopEngineCore.js` | Fork `GameEngineCore`: build plate, fixed isometric camera, single rAF loop |
| `WorkShop/WorkshopEngine/WorkshopEngine.jsx` | Mount in viewport; pointer events; mode-driven interaction |
| `WorkShop/WorkshopEngine/BrickFactory.js` | `createBrick(brickId, color)` from catalog recipe |
| `WorkShop/WorkshopEngine/brickCatalog.js` | **Starter set ~12 bricks** (2×4, 2×2, 1×1, 2×3 plate, 1×2 plate, etc.) |
| `WorkShop/WorkshopEngine/studGrid.js` | `snapToStud(position)`, `STUD` constant |
| `WorkShop/context/WorkshopContext.jsx` | Mode state, selected brick, color, handlers |
| `WorkShop/context/workshopReducer.js` | Actions: SET_MODE, SELECT_BRICK, SET_COLOR, etc. |

### Modify

| File | Change |
|------|--------|
| `WorkShop.jsx` | Wrap in `WorkshopProvider`; mount `WorkshopEngine` in `.stage` |
| `shared/Bucket/Bucket.jsx` | Workshop: `onBrickSelect(brickId)` not `SelectedModel` |
| `shared/ComponentTop/ComponentTop.jsx` | Wire workshop move/rotate/delete/duplicate to context |
| `shared/ComponentBottom/ComponentBottom.jsx` | Sweep → clear all `brickInstances` from scene |
| `screens/WorkshopScreen.jsx` | Pass profile if needed for D2 prep |

### D1 acceptance criteria

- [x] Black viewport renders build plate + placed bricks
- [x] Select brick from bucket → click plate → brick appears snapped
- [x] Move, rotate 90°, delete, duplicate, sweep work
- [x] Paint via palette (bonus — planned for D2, shipped early)
- [x] Leave returns to main game (save persistence → D2)
- [x] `npm run build` passes

### D1 files shipped

| Path | Role |
|------|------|
| `WorkShop/WorkshopEngine/WorkshopEngineCore.js` | Build plate, lighting, brick CRUD |
| `WorkShop/WorkshopEngine/WorkshopEngine.jsx` | Pointer tools + canvas mount |
| `WorkShop/WorkshopEngine/BrickFactory.js` | Parametric bricks + optional GLB loader |
| `WorkShop/WorkshopEngine/brickCatalog.js` | Starter 13 recipes + `extractBrickId()` |
| `WorkShop/WorkshopEngine/studGrid.js` | Stud snap constants |
| `WorkShop/context/WorkshopContext.jsx` | Tool state + handlers |
| `WorkShop/WorkShop.jsx` | Wires engine + toolbar + bucket |
| `public/workshop/bricks/` | Drop zone for hand-authored GLB overrides |

---

## Phase D2 — Tools + Persistence

- Paint tool + palette color → `BrickFactory` material update
- Duplicate → clone selected instance offset 1 stud
- Save workshop → `customCreations[id]` on profile via `persistUserData`
- Load workshop → restore `brickInstances[]` on re-enter
- Auto-thumbnail via `renderer.domElement` capture (like snapshot)

---

## Phase D3 — Map Full Bucket UI to Parametric Catalog ✅

- [x] Parse `BucketBottomResourceStack/index.js` entries → `grok/generate-brick-catalog.mjs` → `brickCatalog.generated.js`
- [x] Use `l<number>` filename + category folder to pick shape recipe
- [x] Shape approximations: BOX, PLATE, TILE, SLOPE, CYLINDER, ARCH, COMPOSITE (+ optional GLB override)
- [x] Categories: basic, slim, wedge, cylindrical, arches, castle_components, windows_doors_fences, castle_accessories, tiles, challenges
- [x] **141 catalog entries** — regenerate via `npm run generate:brick-catalog`

---

## Phase D4 — Main World Placement ✅

- [x] `customCreations` on profile + `customCreations.js` helpers (max 20)
- [x] Game bucket: **tab 6 / bottom-right** (hand+brick `challenges_2` icon — original game slot) shows saved creations when present; workshop screenshot per tile; bucket auto-opens on that tab after workshop save
- [x] `CreationLoader` + `buildGroupFromBrickInstances()` with selection box wireframe
- [x] `sceneSchema` serializes/restores `CREATION_<id>` entries
- [x] Workshop save → exports to `customCreations` + links `workshopDraft.creationId`

### D2b backlog ✅ (2026-06-30)

- [x] Bucket stays open on brick select; other toolbar icons still close bucket
- [x] Straight fixed camera `(0, 5, 10)`
- [x] Finite 16×16 stud export region (yellow border on plate)
- [x] Move / rotate / paint / delete / duplicate via selection-box raycast
- [x] Duplicate places copy above with one brick-height gap
- [x] Per-brick `transparentBox` + wireframe selector

---

## Phase D5 — Optional

- Challenge brick tutorials (predefined `brickInstances` targets)
- Building instructions viewer
- Hand-authored GLBs for select hero parts (manual, not pipeline)

---

## Current Codebase Gaps (unchanged)

| Gap | Addressed in |
|-----|--------------|
| No engine in workshop viewport | D1 |
| Bucket not wired to 3D | D1 |
| No brick meshes | D1 (`BrickFactory`) |
| Save does nothing | D2/D4 |
| No world transfer | D4 |
| `sceneSchema` lacks creations | D2/D4 |

---

## Open Decisions (minor — defaults set)

| # | Question | Default | Override? |
|---|----------|---------|-----------|
| 1 | Camera | Fixed isometric | User can request orbit/zoom |
| 2 | Persistence | Per-profile `customCreations[]` | Could scope per-world instead |
| 3 | Creation limit | TBD (suggest max 20 per profile) | Set in D2 |

---

## RE Assets — Read-Only Reference

Do not invest further Grok sessions in LCA parsing unless user explicitly requests RE-only work.

| Path | Role |
|------|------|
| `resources/convert_brick.py` | RE experiment (broken for production) |
| `resources/research/` | Format documentation |
| `BucketBottomResourceStack/` | Archive + UI companion to PNGs |

---

## Session History

| Date | Event |
|------|-------|
| 2026-06-30 | Workshop UI ✅. Researched original game. Option D recommended. |
| 2026-06-30 | **User confirmed Option D.** LCA→GLB abandoned. Plan revised. |
| 2026-06-30 | **D1 shipped:** WorkshopEngine, BrickFactory, WorkshopContext, toolbar wired. |
| 2026-06-30 | **Backlog added:** bucket stay-open, straight camera, finite build bounds. |
| 2026-06-30 | **D2 shipped:** `workshopSave.js`, hydrate on enter, save on save/leave + thumbnail. |
| 2026-06-30 | **D3 shipped:** `generate-brick-catalog.mjs` → 141 parametric recipes; SLOPE/CYLINDER/ARCH/COMPOSITE/TILE in `BrickFactory`. |
| 2026-06-30 | **D4 shipped:** `customCreations.js`, `CreationLoader`, My Creations bucket tab, workshop save exports to main world. **Next: D2b** backlog. |
| 2026-07-02 | **User reversed the LCA→GLB verdict** for the reworked `resources/model_files/` toolchain (also wired real GLB models into the MainGame warehouse bucket, previously non-functional). Pilot-verified conversion + a per-brick stud-footprint validation gate enabled `shape:'GLB'` for 42/141 bricks; the other 99 keep their parametric shape unchanged (bad catalog metadata, not bad meshes). See `resources/model_pipeline/convert_bricks.mjs`. |
| 2026-07-02 | **Switched live rendering to direct OBJ/MTL loading** (`shared/objMtlLoader.js`) after finding the `obj2gltf` GLB conversion had an inverted Y axis and, from the resulting handedness flip, back faces three.js was culling as missing. Same 42/141 validated set; GLB pipeline stays generated but unused. Also fixed two real bugs found by driving the app live: `createBrickSync` never checked `recipe.shape` at all (always parametric regardless of catalog data), and the ground-alignment offset was silently discarded by the placement caller's absolute `position.set(...)`, sinking bricks below the plate. Also de-chromakeyed the MainGame warehouse thumbnails (solid green background → transparent) and moved this session's tooling out of `resources/model_files/` into `resources/model_pipeline/`. **Started, blocked:** wiring the `/start-stack/start` world selector to `template-01`…`09` (all 9 exist in the toolchain) — piloting one through the same OBJ/MTL loader renders solid black; ruled out winding/culling and pure-ambient lighting, cause not yet found. |

---

## Related Docs

| File | Contents |
|------|----------|
| [README.md](./README.md) | Project overview, current status |
| [ROADMAP.md](./ROADMAP.md) | Phase 11 summary |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Workshop vs main game architecture |
| [CHANGELOG.md](./CHANGELOG.md) | File-level change log |