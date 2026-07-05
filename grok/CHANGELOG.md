# Grok Changelog

All changes made on branch `grok-dev` / `grok-dev-vanilla` via Grok sessions.

**Sync:** Grok pushes to `origin/grok-dev` after commits — see `grok/WORKFLOW.md`.  
**Active branch (2026-07-05 session):** `grok-dev-vanilla` — menu/workshop GUI tests + Phase 11 D5.

---

## 2026-07-05 — Menu/workshop GUI test pyramids + Phase 11 D5 challenges

### Menu GUI test pipeline (P0–P5) — complete

| Layer | Suites | npm script |
|-------|--------|------------|
| Unit | layout contracts, holder metrics, CSS vars | `npm run test:menu:unit` |
| Layout | 7 screens + scale matrix | `npm run test:menu:layout` |
| Smoke | 7 route click-through paths | `npm run test:menu:smoke` |
| Visual | 8 desktop-1280 baselines (pixel diff) | `npm run test:menu:visual` |
| Orchestrator | all of the above | `npm run test:menu` |

Key infra: `MenuStageLayout`, frozen metrics in `menuStageMetrics.js`, `testing/lib/driver.mjs`, `testing/lib/testRoutes.mjs` (avoids importing `src/lib/routes.js` — PowerShell stderr warnings).

### Workshop GUI test pipeline — complete

| Layer | Suites | npm script |
|-------|--------|------------|
| Unit | workshop metrics, CSS vars, challenges (16 cases) | `npm run test:workshop:unit` |
| Layout | default, bucket-open, palette-open | `npm run test:workshop:layout` |
| Smoke | route nav + challenge flow | `npm run test:workshop:smoke` |
| Visual | 3 baselines (default, bucket, palette) | `npm run test:workshop:visual` |
| Orchestrator | all of the above | `npm run test:workshop` |

Key infra: `testing/lib/workshopDriver.mjs`, `workshopLayoutAssert.mjs`, `workshopVisualCapture.mjs` (hides WebGL canvas for stable screenshots).

### Template map render regression

| File | Change |
|------|--------|
| `testing/template-map-render.test.mjs` | **New** — samples canvas luminance for worlds 1–9 |
| `testing/lib/canvasSample.mjs` | **New** — avgLum + darkRatio probe |
| `package.json` | `npm run test:template-maps` |
| `testing/run-regression.mjs` | Wired into engine suites |

**Result (2026-07-05):** all 9 template worlds PASS on dev machine (avgLum 69–151, darkRatio 0–18%). The old "black render" bug does **not** reproduce here — templates load with color.

### Phase 11 D5 — workshop challenge tutorials (mostly done)

| File | Change |
|------|--------|
| `src/data/workshop/workshopChallenges.js` | 3 challenges with `steps[]`, `starterInstances`, `targetInstances` |
| `src/data/workshop/workshopChallengeMatch.js` | Position-tolerant `evaluateChallengeMatch` |
| `src/data/workshop/challengeBrickThumbs.js` | Bucket PNG map for instruction previews |
| `WorkshopInstructionsPanel/` | Overlay: progress, paginated steps, Check/Dismiss |
| `InstructionStepPreview.jsx` | Mini plate preview (brick thumb / stack / row layout) |
| `WorkshopContext.jsx` | `handleChallengeSelect`, `checkActiveChallenge`, `dismissActiveChallenge` |
| `workshopReducer.js` | `activeChallenge`, `challengeMatch` state |
| `BucketBottomResourceStack/index.js` | Tab 9 shows 3 tutorial tiles (`challengeId`) not individual c5 parts |
| `BucketTopResourceStack/index.js` | **Fix:** added missing 10th tab icon (challenges) — tab 9 was unreachable |
| `shared/Bucket/*` | Test hooks: `workshop-bucket-tab-N`, `workshop-bucket-item`, `data-challenge-id` |
| `testing/workshop/unit/workshop-challenges.test.mjs` | 5 unit cases |
| `testing/workshop/smoke/workshop-challenges.smoke.test.mjs` | Select challenge → preview → step nav → dismiss |

**Challenges:** `c5-stacked-wall`, `c5-door-frame`, `c5-door-and-window`

**Commits:** `dc6b74b` (smoke + template maps), `e2adcec` (D5 core), `9ce888c` (visual step viewer)

### D5 still optional / user-owned

- Hand-authored GLB hero parts (manual asset work, not pipeline)
- Workshop visual baseline refresh if instructions panel shifts frozen layout
- **User next:** integrate **part item** UI in the modernized look (bucket brick tiles / part picker styling)

---

## 2026-07-02 — Real 3D models in MainGame warehouse bucket + WorkShop bricks

**Reverses the 2026-06-30 "LCA→GLB abandoned" verdict** for the MainGame
warehouse bucket entirely, and for 42/141 WorkShop bricks — the reworked
`resources/model_files/` extraction toolchain (materials/LITCOLS/palette
handling rewritten the same day) produces correct geometry; the earlier
verdict was reached against the old legacy converter scripts. See
`grok/WORKSHOP_3D.md`'s 2026-07-02 entry for the full brick-side history.

### Track A — MainGame warehouse bucket (108 items, previously non-functional)

| File | Change |
|------|--------|
| `MainGame/ComponentTop/Bucket/BucketBottom/BucketBottomResourceStack/` | 108 `.lca` (unused at runtime) → real geometry; PNG thumbnails refreshed from the extraction toolchain and de-chromakeyed |
| `grok/generate-warehouse-catalog.mjs` | **New** — regenerates bucket `index.js` `SelectedModel`/`model` fields + `warehouseModelCatalog.generated.js`, keyed off the bucket's own PNG imports (not the previously-dead `modelPath` field, which was wrong for the 4 challenges entries) |
| `MainGame/GameEngine/Loaders/warehouseModelCatalog.generated.js` | **New** — 106 catalog entries (`WH_<CATEGORY>_<ID>` keys) |
| `MainGame/GameEngine/Loaders/ModelLoader.jsx` | `SelectedModels` spreads the warehouse catalog; `'add'`/`'restore'` try `objUrl`/`mtlUrl` (live path) before falling back to `model` (glb); fixed a pre-existing uncaught-`TypeError` on unknown keys |
| `context/sceneSchema.js` | `PLAYABLE_MODEL_IDS` (misnomer — actually gates "needs reload via loader on restore" vs. "part of the preloaded static map") now includes every warehouse id, or placed props would vanish on save/restore |
| Bucket slot `MinifigureAnimals12` | Was a hand-authored "Archer" placeholder (`archer_with_box2.glb`) standing in for the real `minifigcedricbull00` thumbnail/model — now wired to its own real model |

### Track B — WorkShop brick bucket (141 items, previously 100% parametric)

| File | Change |
|------|--------|
| `resources/model_pipeline/convert_bricks.mjs` | **New** — converts + measures each brick's footprint against its catalog `studs`/`heightPlates`; only bricks matching within tolerance get real geometry |
| `grok/generate-brick-catalog.mjs` | Overlays `shape:'GLB'` + `objUrl`/`mtlUrl`/`glbUrl` onto the 42 validated entries; the other 99 keep their existing parametric shape (bad catalog metadata from the original fuzzy digit-matched `LEGO_PARTS` guess, not a mesh defect — e.g. `l420100` is a large multi-stud baseplate, not the small composite guessed) |
| `WorkShop/WorkshopEngine/BrickFactory.js` | `createBrick`/`createBrickSync` try `objUrl`/`mtlUrl` (live) → `glbUrl` (fallback) → parametric; **found and fixed two real bugs while verifying live:** (1) the live placement path (`createBrickSync`) never checked `recipe.shape` at all, so GLB-shaped bricks always fell back to parametric regardless of catalog data; (2) once loading was fixed, bricks rendered as a barely-visible sliver because the ground-alignment offset was silently discarded by the caller's absolute `position.set(...)` right after creation, sinking ~96% of the brick below the plate |
| `WorkShop/WorkshopEngine/WorkshopEngineCore.js` | Preloads both OBJ/MTL and GLB caches on mount so the first click renders real geometry, not a placeholder |

### OBJ/MTL pivot (both tracks) — the actual live rendering path

The `obj2gltf` GLB conversion pipeline (above) shipped first, but its output
had an inverted Y axis (source coordinates are Y-down) and, because a single
flipped axis inverts mesh handedness, back faces three.js's default culling
treated as missing geometry. Rather than keep debugging that conversion,
models now load directly via `OBJLoader`+`MTLLoader` at runtime:

| File | Change |
|------|--------|
| `MainMenuStack/shared/objMtlLoader.js` | **New** — shared loader; a single negated Y-scale component both uprights the model and fixes the culling (three.js auto-reverses front-face winding for a negative-determinant transform) |
| `resources/model_pipeline/copy_obj_assets.mjs` | **New** — populates `public/models/` (shared 305-file texture bank + per-model `.obj`/`.mtl`) from the extraction toolchain, mirroring the `public/workshop/bricks/` GLB convention |
| `ModelLoader.jsx`, `BrickFactory.js` | Both now prefer `objUrl`/`mtlUrl` over the GLB fields |

The GLB pipeline (`obj2gltfHelper.mjs`, `convert_warehouse.mjs`,
`convert_bricks.mjs`, generated `glbUrl`/`model` catalog fields) is
**unchanged and still functions** — it's just not the path the live game
takes any more. Verified end-to-end in the running app: models render
upright, solid, and correctly textured in both buckets.

### Housekeeping

| File | Change |
|------|--------|
| `.gitignore` | Extraction-derived `.glb`/`.obj`/`.mtl`/texture assets are no longer tracked (matches `resources/model_files/README.md`'s existing "don't commit game assets" policy); regenerate locally against your own game install |
| `resources/model_pipeline/` | **New** — all of this session's tooling (conversion scripts, pilot verification harnesses, the thumbnail dechroma script) moved out of `resources/model_files/`, which is back to exactly its pre-session file list |
| `resources/model_pipeline/dechroma_thumbnails.py` | **New** — the pak-sourced warehouse thumbnails render on a solid `(0,255,0)` chroma-key background; keys it to transparency (tight tolerance so green model parts, e.g. tree foliage, survive) |

**Known follow-up (started, not complete):** the `/start-stack/start` world
selector's 9 slots should each load a distinct world built from the
extraction toolchain's `template-01`…`template-09` models (already
identified: `resources/model_files/extracted/models/template-0N.obj` +
matching thumbnails at `.../pak/warehouse/worlds/templates/`) instead of
all ten worlds sharing the same `map1.glb` placeholder. Piloting one
template through the same OBJ/MTL loader renders almost entirely black —
ruled out winding/culling (`DoubleSide` didn't fix it) and pure ambient
light with no directional lights also didn't fix it, so this is a
different, unsolved problem specific to these larger multi-hundred-facet
world-scale meshes. Needs its own investigation before wiring in.

---

## 2026-06-30 — Centered selection box + group rotation fix

| File | Change |
|------|--------|
| `selectionBox.js` | **New** — content bounds, fixed wireframe offset, `updateSelectionBox` |
| `BrickFactory.js` | Center creation XZ pivot; refresh box after geometry changes |
| `WorkshopEngineCore.js` | Refresh selection box on rotate |
| `GameEngine.jsx` | Rotate whole creation/model group; refresh box after rotate |
| `ModelLoader.jsx`, `CreationLoader.js` | Recompute centered outline on load |

Fixes wireframe double-offset; main-game creations rotate around group center.

## 2026-06-30 — Main game: white outline when moving creations

| File | Change |
|------|--------|
| `selectionOutline.js` | **New** — show/hide wireframe; resolve creation group hitbox |
| `GameEngine.jsx` | Move mode shows white outline box; moves whole creation group |
| `BrickFactory.js` | Hide per-brick boxes on grouped creations; outline only while dragging |

## 2026-06-30 — Workshop build plate grid aligned to stud cells

| File | Change |
|------|--------|
| `WorkshopEngineCore.js` | `GridHelper` offset by `HALF_STUD` so floor squares match stud pitch |

Grid cell centers now line up with brick stud positions (no more half-square visual offset).

## 2026-06-30 — Workshop footprint-aware stud grid alignment

| File | Change |
|------|--------|
| `studGrid.js` | `snapBrickCenterAxis/XZ` — 1-wide snaps to integer studs, 2-wide to half-stud centers |
| `WorkshopEngineCore.js` | Place/move/load use footprint snap; export bounds check full footprint |
| `WorkshopEngine.jsx` | Move drag uses oriented footprint snap |
| `brickStuds.js` | Stack pick snaps click to nearest top stud |

Fixes 2×2 (and other even bricks) placing off-grid; 1×1 can stack on individual studs.

## 2026-06-30 — Workshop stud-aware stack placement

| File | Change |
|------|--------|
| `brickStuds.js` | **New** — top-stud positions; valid stack centers from click point |
| `WorkshopEngineCore.js` | `stackBrickOn` snaps to nearest stud; `exactPlacement` preserves offset |
| `WorkshopEngine.jsx` | Passes raycast hit point when stacking on a brick |
| `workshopInteraction.js` | `findBrickHitFromIntersects` returns brick + intersection point |

1×1 (and other bricks) now land on individual studs of a wider base (e.g. 2×2), not the base center.

## 2026-06-30 — Workshop stack move (lift base brick)

| File | Change |
|------|--------|
| `brickStack.js` | **New** — detect stacked bricks; resolve stack anchor |
| `WorkshopEngineCore.js` | `getBrickMoveGroup`, `tryMoveBrickGroup` moves anchor + stack together |
| `WorkshopEngine.jsx` | Move drag lifts entire stack; wireframe on all grouped bricks |
| `brickCollision.js` | Collision ignore supports brick groups (Set/array) |

Top brick moves alone; bottom brick lifts everything stacked on it (real LEGO behavior).

## 2026-06-30 — Workshop brick collision + Shift vertical move

| File | Change |
|------|--------|
| `brickCollision.js` | **New** — stud-footprint AABB overlap checks (rotation-aware) |
| `WorkshopEngineCore.js` | Collision on place/move/duplicate/stack/rotate; `trySetBrickPosition` |
| `WorkshopEngine.jsx` | Shift+drag moves brick on Y-axis (mouse up = higher); collision-aware drag |
| `studGrid.js` | `snapYToPlate` for plate-height vertical snapping |

Bricks can no longer overlap when adjacent. Hold **Shift** while dragging in move mode to raise/lower a brick in steps of that brick's own height (not fixed plate intervals).

## 2026-06-30 — Workshop menu complete; Phase 11 planning docs

| File | Change |
|------|--------|
| `grok/WORKSHOP_3D.md` | **New** — original game research, codebase gaps, options A–D, recommended phased plan (D1–D5), open decisions, D1 file list |
| `grok/README.md` | Status table, backlog, session prompts, doc index, key paths |
| `grok/ROADMAP.md` | Phase 11 added to overview + mermaid; sub-phases D1–D5 |
| `grok/ARCHITECTURE.md` | Workshop stack table, planned 3D data flow |

## 2026-06-30 — Option D confirmed; LCA→GLB removed from plan

| File | Change |
|------|--------|
| `grok/WORKSHOP_3D.md` | Major revision: LCA pipeline abandoned; procedural `BrickFactory` + `brickInstances[]` JSON; D1–D5 redefined |
| `grok/README.md`, `ROADMAP.md`, `ARCHITECTURE.md` | Align with new plan |

## 2026-06-30 — Phase 11 D1: Workshop 3D engine

| File | Change |
|------|--------|
| `WorkShop/WorkshopEngine/*` | **New** — `WorkshopEngineCore`, `WorkshopEngine`, `BrickFactory`, `brickCatalog`, `studGrid` |
| `WorkShop/context/*` | **New** — `WorkshopContext`, `workshopReducer` |
| `WorkShop/WorkShop.jsx` | Mount engine; wire toolbar, bucket, palette, sweep |
| `shared/ComponentTop.jsx` | Workshop move/rotate/delete/duplicate handlers |
| `shared/ComponentBottom.jsx` | Sweep callback |
| `shared/Bucket.jsx` | `onBrickSelect` for workshop |
| `public/workshop/bricks/README.md` | Optional GLB drop folder + sources |

Parametric bricks with stud bumps; unknown catalog ids fall back to 2×2. GLB override via `brickCatalog` `shape: 'GLB'`. Build passes.

## 2026-06-30 — Phase 11 D2: workshop save/load

| File | Change |
|------|--------|
| `src/api/workshopSave.js` | **New** — `getWorkshopDraft`, `saveWorkshopDraft`, `clearWorkshopDraft` |
| `WorkshopEngineCore.js` | `loadBrickInstances`, `captureFrame` |
| `WorkshopEngine.jsx` | Hydrate draft after engine mount |
| `WorkshopContext.jsx` | `persistDraft` on save + leave |
| `WorldSessionProvider.jsx` | `onSaveWorkshopDraft`, `workshopDraft` memo |
| `workshop/page.jsx`, `WorkshopScreen.jsx` | Wire profile + draft |

Draft stored at `profile.savedWorlds[worldId].workshopDraft`.

**Backlog logged:** bucket closes on brick select; straight camera; finite build bounds.

**Next: D3** — expand `brickCatalog.js`; address backlog items.

## 2026-06-30 — Phase 11 D3: full parametric brick catalog

| File | Change |
|------|--------|
| `grok/generate-brick-catalog.mjs` | **New** — parses bucket `index.js`; maps LEGO part numbers + category fallbacks to shape recipes |
| `brickCatalog.generated.js` | **New** — 141 auto-generated catalog entries |
| `brickCatalog.js` | Imports generated catalog; exports `catalogEntryCount` |
| `BrickFactory.js` | SLOPE, CYLINDER, ARCH, COMPOSITE, TILE parametric shapes |
| `WorkshopEngine/index.js` | Export `catalogEntryCount` |
| `package.json` | `npm run generate:brick-catalog` script |

Unknown bucket ids still fall back to 2×2 brick. Build passes.

**Next: D4** — `customCreations[]` → main world placement; or D2b backlog fixes.

## 2026-06-30 — Phase 11 D4: workshop → main world placement

| File | Change |
|------|--------|
| `src/api/customCreations.js` | **New** — profile `customCreations` CRUD, `CREATION_<id>` model ids |
| `CreationLoader.js` | **New** — place/restore grouped brick creations in main world |
| `BrickFactory.js` | `buildGroupFromBrickInstances()` + selection box wireframe |
| `creationsBucket.js` | **New** — dynamic My Creations bucket tab from profile |
| `sceneSchema.js` | Serialize/restore `CREATION_<id>` scene entries |
| `workshopSave.js` | `workshopDraft.creationId` links draft to exported creation |
| `WorkshopContext.jsx` | Save exports creation + navigates to main game |
| `WorldSessionProvider.jsx` | `onSaveWorkshopExport`, `customCreations` memo |
| `Bucket.jsx`, `GameEngine.jsx` | Wire creations tab + placement click handler |

Workshop save captures workshop camera screenshot (`captureFrame`) → stored as `customCreations[id].thumbnail` → shown as tile image in main-game bucket **My Creations** tab → click world to place. Build passes.

**Backlog expanded:** top-bar tools, duplicate-above, per-brick selector box.

**Next: D2b** backlog polish.

## 2026-06-30 — Phase 11 D2b: workshop backlog

| File | Change |
|------|--------|
| `WorkshopContext.jsx` | Bucket stays open on brick select |
| `WorkshopEngineCore.js` | Straight camera `(0,5,10)`; 16×16 export bounds; duplicate-above; stack placement |
| `WorkshopEngine.jsx` | Tool raycast via selection boxes; export-filtered instances |
| `workshopInteraction.js` | **New** — brick hit resolution + wireframe helpers |
| `BrickFactory.js` | Per-brick `transparentBox` + wireframe on create |
| `studGrid.js` | `EXPORT_PLATE_STUDS`, `clampXZToExportBounds` |

## 2026-06-30 — fix: close bucket when selecting other toolbar tools

| File | Change |
|------|--------|
| `WorkshopContext.jsx`, `GameContext.jsx` | Move/rotate/paint/etc. close bucket (brick select keeps it open in workshop) |

## 2026-06-30 — My Creations: original tab 6 (hand+brick icon)

| File | Change |
|------|--------|
| `creationsBucket.js` | `GAME_CREATIONS_TAB_INDEX = 5` — bottom-right challenges/hand+brick slot |
| `Bucket.jsx` | Merge creations into tab 6; `initialTab` selects hand+brick after workshop save |

Reverts mistaken tab-0 prepend; matches original game bucket layout.

## 2026-06-30 — Fix My Creations not visible in main-game bucket

| File | Change |
|------|--------|
| `Bucket.jsx` | Prepend My Creations as **tab 0** (was tab 7, clipped off-screen) |
| `BucketTop.module.css` | Fit 3 icon rows for 7 tabs |
| `WorldSessionProvider.jsx` | Session cache for `customCreations`; merge `worldData` on navigate; auto-open bucket after workshop save |
| `customCreations.js` | Robust profile id matching (`String` compare) |

## 2026-06-30 — D4 docs + bucket screenshot thumbnails

| File | Change |
|------|--------|
| `BucketBottom.jsx` | Render `data:` URL creation screenshots via `<img>` (CSS `url()` breaks captures) |
| `creationsBucket.js`, grok docs | Document: workshop `captureFrame` → My Creations bucket tile image |

---

## 2026-06-28 — MyModels: fix grid metrics (restore 50ecb12 layout)

| File | Change |
|------|--------|
| `MyModelsBody.module.css` | Restore `441×229` body, grid `gap: 18px 12px`, `margin-left: 13%` — was wrongly `gap: 40px` / `530px` tall |
| `MyModelsHolder.module.css` | Drop `justify-content: center` that squashed overlays |

Prior “SnapShot alignment” used incorrect CRA extract values; slots did not line up with purple `drop_down.png` cells.

---

## 2026-06-28 — MyModels: align overlay layout with SnapShot / WorldBody

| File | Change |
|------|--------|
| `MyModelsBody.module.css` | SnapShot-style absolute overlays: down arrow `bottom: 21%`, footer `bottom: 9%`, help `bottom: 13%` / `z-index: 10`, 530px grid root |
| `MyModelsHolder.module.css` | Match SnapShot holder pattern (`overflow: visible`, no flex center squash) |

Copy/delete icons and Richard help now anchor to the purple frame like screenshot/world selectors.

---

## 2026-06-28 — MyModels save menu polish

| File | Change |
|------|--------|
| `MyModelsBody.module.css` | Restore CRA layout; `wh_selection` frame at z-index 2; center down arrow; body fits holder |
| `MyModelsResourceStack/index.js` | Fix `selectedOverlay` — was `load_2.png` icon, now `wh_selection.png` (95×67) |
| `MyModelsHolder.module.css` | `background-size: contain` on dropdown frame |
| `MyModelsBody.jsx` | Thumbnail from first snapshot when save has no `thumbnail`; auto-select first slot |

Reverts accidental SnapShot CSS border hack on MyModels; selection frame matches workshop bucket cells.

---

## 2026-06-28 — SnapShot: use selected.png frame (match map selector)

| File | Change |
|------|--------|
| `SnapShotBody.jsx` | Restore `selectionOverlay={selectedImage}` like WorldBody |
| `SnapShotBody.module.css` | `highlightedImage` frame overlay; thumbnails via `background-image` (same stack as maps) |

Replaces custom CSS `::after` border with the original `selected.png` asset for visual consistency.

---

## 2026-06-28 — SnapShot: show thumbnails in grid (fix cyan overlay)

| File | Change |
|------|--------|
| `SnapShotBody.jsx` | Drop opaque `selected.png` overlay that hid captures |
| `SnapShotBody.module.css` | Cyan `outline` on selected cell only; screenshot stays visible |
| `PaginatedGrid.jsx` | `itemSelected` class; id-based selection; thumbnails when `itemThumbnail` style exists |

`selected.png` is a solid fill — it was drawn on top of data-URL captures. Selection now uses a transparent CSS outline like a map frame border.

---

## 2026-06-28 — SnapShot: grid-only preview and map-style selection frame

| File | Change |
|------|--------|
| `SnapShot.jsx` | Remove right-side `capturePreview` panel; screenshots live only in the yellow grid |
| `SnapShot.module.css` | Drop `capturePreview` styles |
| `SnapShotBody.module.css` | Restore `selected.png` frame overlay (WorldBody pattern) instead of full-cell CSS border |
| `SnapShotBody.jsx` / `SnapShotHolder.jsx` | Remove unused `onSelectSnapshot` preview wiring |

---

## 2026-06-28 — SnapShot grid alignment and cursor on filled cells only

| File | Change |
|------|--------|
| `SnapShotBody.module.css` | Restore original CRA 3×3 grid (`42×19` tracks, `90px` gap, `109×80` thumbnails); default cursor on empty cells |
| `SnapShotBody.jsx` | Drop padded empty slots; only render real snapshots |
| `PaginatedGrid.jsx` | `isItemInteractive` prop; pointer cursor and clicks only when item has an image |

Fixes thumbnails landing in oversized misaligned squares and empty yellow cells showing a clickable pointer.

---

## 2026-06-28 — Help/Icon hover frame animation (FrameAnimator)

| File | Change |
|------|--------|
| `FrameAnimator/` | Preload all frames; stacked `<img>` opacity swap for seamless hover GIF |
| `HelpComponent.jsx` | Uses FrameAnimator (Richard help, etc.) |
| `IconComponent.jsx` | Uses FrameAnimator (print, delete, trash, copy, etc.) |

Fixes invisible frames on hover (background-image swap before load) and film-strip stutter until cached.

---

## 2026-06-28 — SnapShot gallery: fix empty legacy thumbnails

| File | Change |
|------|--------|
| `worldSave.js` | `resolveSnapshotImage`, `normalizeSnapshotEntry`; prune corrupt snapshots on append |
| `SnapShotBody.jsx` | Support legacy `image` field; pad grid to 9 slots; skip empty cells |
| `GridThumbnail.jsx` | Hide broken/truncated image src on load error |
| `SnapShot.jsx` | Preview uses normalized image resolver |

Old snapshots saved as black frames or truncated localStorage data are filtered out; re-capture to refill gallery.

---

## 2026-06-28 — SnapShot capture: fix black frames and gallery sync

| File | Change |
|------|--------|
| `GameEngineCore.js` | `preserveDrawingBuffer: true`; force render before `toDataURL` |
| `GameContext.jsx` | Capture on `requestAnimationFrame` so buffer has latest frame |
| `WorldSessionProvider.jsx` | Safer `navigateToSnapshot` world state merge |
| `SnapShotBody.jsx` | Merge `sceneSnapshot` into gallery list; only show entries with images |
| `SnapShot.jsx` | Sync large preview when `sceneSnapshot` updates |
| `worldSave.js` | Dedup snapshots by id, not identical `imageDataUrl` strings |

---

## 2026-06-28 — Git workflow: push after commit

| File | Change |
|------|--------|
| `grok/WORKFLOW.md` | New — Grok must `git push origin grok-dev` after every commit |
| `grok/README.md` | Quick-start and sync instructions updated |
| `grok/ROADMAP.md` | Guiding principle: push after commit |

User preference: no more local-only commits; VS Code repo pulls from `origin/grok-dev`.

---

## 2026-06-28 — SnapShot thumbnail and selection overlay fix

| File | Change |
|------|--------|
| `PaginatedGrid.jsx` | Render thumbnails via `<img>` (fixes `data:` URL captures broken in CSS `url()`) |
| `SnapShotBody.module.css` | Full-bleed selection overlay (`inset: 0`); grid margins match WorldBody |
| `SnapShotBody.jsx` | Auto-select first snapshot for preview on load |
| `SnapShot.jsx` | Initial preview from first saved capture with `imageDataUrl` |
| `SnapShot.module.css` | Fixed-size preview pane with `object-fit: cover` |

---

## 2026-06-28 — SnapShot screenshot menu styling

Restored original CRA grid layout for the screenshot gallery.

| File | Change |
|------|--------|
| `SnapShotBody.module.css` | Original 3×3 grid (`gap: 90px`, 42×19 tracks, 109×80 items) |
| `SnapShot.module.css` | Preview border `#fff9` to match original |

**Backlog:** MyModels further polish re-added per user request.

---

## 2026-06-28 — MyModels save menu styling

Restored original CRA layout for the save game screen (had been incorrectly copied from SnapShot).

| File | Change |
|------|--------|
| `MyModels.module.css` | Full-viewport background; checkmark corner |
| `MyModelsHolder.module.css` | Holder at `left: 29.15%`, `top: 6%` on background frame |
| `MyModelsBody.module.css` | Original grid gap/spacing, flow-based footer, arrow positions |
| `MyModelsBody.jsx` | Use `myModelsData.selectedOverlay` instead of SnapShot overlay |

---

## 2026-06-28 — Phase 0: Branch Setup

- Created `grok-dev` branch from `main` (local, VS Code repo + Grok worktree)
- User preference: local only initially (superseded 2026-06-28 — see `grok/WORKFLOW.md`, push after commit)

---

## 2026-06-28 — Import Fix (pre-Phase 1)

**File:** `src/App.js`

- Changed `./components/` → `./Components/` (webpack case-sensitivity fix)

---

## 2026-06-28 — Phase 1: Minimal Cleanup

### `src/api/`

| Change | Files |
|--------|-------|
| Added `localStorage` persistence, `defaultProfileOptions`, `persistUserData` | `index.js` |
| Deleted dead Express server | `api.js` (removed) |

### `src/App.js`

- Import `persistUserData` (renamed from API `updateUserData`)
- Removed unused `Navigate`, `useNavigate`
- Combined `setState` in `navigateToMainMenu`

### `src/Components/AuthenticationStack/`

| File | Changes |
|------|---------|
| `AuthenticationStack.jsx` | Direct import of Authentication (no circular barrel) |
| `Authentication.jsx` | `updateProfiles()` helper; wired `updateUserData`; delete by `id`; `key={profile.id}` |
| `ProfileContainer.jsx` | Full profile object on add; `Math.max` ID; `defaultProfileOptions` |
| `ProfileInput.jsx` | Empty name guard; `onKeyDown`; removed bogus `setSelectedProfile(true)` |
| `index.js` | Removed commented Register/ForgotPassword exports |

### `src/Components/MainMenuStack/`

| File | Changes |
|------|---------|
| `MainMenuStack.jsx` | Removed `/change-player`, `/quit` routes; removed Authentication import |
| `Options/Options.jsx` | Removed unused `selectedProfile` prop |
| `MainMenu/MainMenu.jsx` | Removed stale comment |
| `Credits/Credits.jsx` | Removed 70-line commented LEGO credits block |
| `PlayerSelect/` | **Deleted** (empty stub) |

### `src/Components/MainMenuStack/StartStack/`

| File | Changes |
|------|---------|
| `Start/Start.jsx` | Guard checkmark; removed `console.log` |
| `World/WorldBody/WorldBody.jsx` | `setWorldData(null)` on tab reset; locked guard; `key={item.id}` |
| `World/WorldBody/WorldBodyResourceStack/index.js` | Fixed World 10 name/description |

### `src/Components/MainMenuStack/StartStack/MainGameStack/`

| File | Changes |
|------|---------|
| `MainGameStack.jsx` | `navigateToWorkshop(data)`, `navigateToSnapshot(data)` accept args |
| `MainGame/MainGame.jsx` | `Modes` enum; `handleNavigateToWorkshop`; removed debug `useEffect`; removed `setWorldData` prop |
| `MainGame/GameEngine/Loaders/SkyBoxLoader.jsx` | `climateModeToInt` mapping for shader |
| `index.js` | Removed MyModels from barrel; TODO comment |
| `MyModels/MyModels.jsx` | TODO stub |

---

## 2026-06-28 — Phase 2: Moderate Refactor

### New: `src/Components/Common/`

| File | Purpose |
|------|---------|
| `BackCheckmarkButton/BackCheckmarkButton.jsx` | Shared confirm button |
| `MenuScreenLayout/MenuScreenLayout.jsx` | Full-screen menu shell |
| `MenuScreenLayout/MenuScreenLayout.module.css` | Layout styles |
| `usePaginatedGrid.js` | Pagination state hook |
| `PaginatedGrid/PaginatedGrid.jsx` | Paginated grid UI |
| `index.js` | Updated exports |

### New: `src/data/worlds/`

| File | Purpose |
|------|---------|
| `engineAssets.js` | Map1, grass skybox, Archer model |
| `localWorlds.js` | Local world catalog |
| `sharedWorlds.js` | Shared world catalog |
| `index.js` | Re-exports |

### Refactored screens (MenuScreenLayout + BackCheckmarkButton)

- `Authentication/Authentication.jsx`
- `MainMenu/MainMenu.jsx`
- `Options/Options.jsx`
- `Credits/Credits.jsx`
- `Start/Start.jsx`

### Refactored grids (PaginatedGrid + usePaginatedGrid)

- `World/WorldBody/WorldBody.jsx` — single path for local/shared
- `MainGame/.../BucketBottom/BucketBottom.jsx`
- `WorkShop/.../BucketBottom/BucketBottom.jsx`
- `SnapShot/.../SnapShotBody/SnapShotBody.jsx`

### Slimmed

- `World/WorldBody/WorldBodyResourceStack/index.js` — removed inline world arrays + engine imports; re-exports from `src/data/worlds/`

---

## 2026-06-28 — Phase 3: Shared Game UI

### New: `MainGameStack/shared/`

| Area | Files | Purpose |
|------|-------|---------|
| `toolbarConfig/` | `topToolbar.js`, `bottomToolbar.js`, `bucketData.js`, `paletteData.js` | Mode-specific icon/data config; imports existing `*ResourceStack` barrels |
| `GameShell/` | `GameShell.jsx`, `GameShell.module.css` | Shared top/bottom layout shell (`mode` sets heights) |
| `TopIconComponent/` | merged `TopIconComponent` + `ComponentTopIcon` | Unified top toolbar icon |
| `BottomIconComponent/` | shared bottom icon | Climate, hammer, sweep, zoom, etc. |
| `Ball/` | mode-specific CSS | Zoom controls + optional target (game only) |
| `ComponentTop/` | `ComponentTop.jsx` + game/workshop CSS | 6 game tools + play vs 5 brick tools |
| `ComponentBottom/` | `ComponentBottom.jsx` + game/workshop CSS | 4 game buttons vs sweep-only workshop |
| `Bucket/` | `Bucket`, `BucketTop`, `BucketBottom`, `BucketIcon` | `dataSource`: `models` \| `bricks` |
| `Palette/` | `Palette.jsx` + game/workshop CSS | `variant` + optional `onColorSelect` (hex) |

### Updated screens

| File | Changes |
|------|---------|
| `MainGame/MainGame.jsx` | Uses `GameShell` + shared `ComponentTop`, `ComponentBottom`, `Bucket`, `Palette` |
| `WorkShop/WorkShop.jsx` | Same shared imports; no `MainGame.module.css` / `WorkShop.module.css` layout duplication |

### Thin re-exports (backward compat)

- `MainGame/ComponentTop/ComponentTop.jsx` → `shared` with `mode="game"`
- `WorkShop/ComponentTop/ComponentTop.jsx` → `shared` with `mode="workshop"`
- Same pattern for `ComponentBottom`, `Bucket`, `Palette`

### Preserved separately

- `*ResourceStack/` asset folders (unchanged)
- `MainGame/GameEngine/`, `Drive/`, `Climate/`, `Music/` (game-only)

---

## 2026-06-28 — Phase 4: Game State

### New: `MainGameStack/context/`

| File | Purpose |
|------|---------|
| `sceneSchema.js` | Serializable `{ models, camera, climate }`; `serializeSceneFromThree` |
| `gameReducer.js` | Consolidated game UI state + actions |
| `GameContext.jsx` | Provider with handlers, music ref, `gameEngineRef` |
| `index.js` | Barrel exports |

### New: `src/api/worldSave.js`

- `saveWorldProgress`, `appendWorldSnapshot`, `updateProfileOptions`
- Profile `savedWorlds[worldId]` slots with scene + thumbnail + snapshots

### Refactored

| File | Changes |
|------|---------|
| `MainGame/MainGame.jsx` | Thin shell; all state in `useGameContext` |
| `MainGame/GameEngine/GameEngine.jsx` | `forwardRef` + `captureFrame` / `getSceneState`; `onSceneChange` |
| `MainGameStack.jsx` | `GameProvider` wrapper; save/snapshot callbacks |
| `StartStack.jsx` | Threads `selectedProfile`, `userData`, `updateUserData` |
| `MainMenuStack.jsx` | Options persistence; profile lookup from `userData` |
| `App.js` | Passes `userData` + `updateUserData` to main menu |
| `Options/Options.jsx` | Controlled toggles bound to `profile.options` |
| `Options/OptionsMenuPlaceholder.jsx` | Controlled `activeSide` + `onSelect` |
| `SnapShot/SnapShot.jsx` | Shows latest `imageDataUrl` capture preview |
| `MyModels/MyModels.jsx` | Lists saved worlds from profile |

---

## 2026-06-28 — Next.js Migration Phases 1–4 (App Router)

### Scaffold (Phase 1–2, prior session)

- CRA → Next.js 15; `app/layout.jsx`, `app/globals.css`, `jsconfig.json`, `next.config.mjs`
- `src/lib/routes.js` — canonical `ROUTES` constants
- `src/lib/context/UserDataProvider.jsx` — replaces `App.js` class state

### App Router pages (Phase 3–4)

| Route | Page file |
|-------|-----------|
| `/` | Redirect → auth or main-menu |
| `/authentication` | `app/authentication/page.jsx` |
| `/main-menu` | `app/(game)/main-menu/page.jsx` |
| `/options` | `app/(game)/options/page.jsx` |
| `/credits` | `app/(game)/credits/page.jsx` |
| `/start-stack/start` | `app/(game)/start-stack/start/page.jsx` |
| `/start-stack/main-game` | `app/(game)/start-stack/main-game/page.jsx` |
| `/start-stack/main-game/workshop` | `.../workshop/page.jsx` |
| `/start-stack/main-game/snapshot` | `.../snapshot/page.jsx` |
| `/start-stack/main-game/my-models` | `.../my-models/page.jsx` |

### New providers

| File | Purpose |
|------|---------|
| `WorldSessionProvider.jsx` | Single `worldData` source; save/snapshot/delete callbacks; Next router navigation |
| `app/(game)/layout.jsx` | Auth gate (redirect unauthenticated → `/authentication`) |
| `app/(game)/start-stack/layout.jsx` | Wraps `WorldSessionProvider` |

### Removed / updated

- **Deleted** `app/legacy-game-shell.jsx` (react-router bridge)
- `UserDataProvider` — `navigateToMainMenu` / `navigateToAuthentication` use `next/navigation`
- `MainMenu.jsx` — `useRouter` + `ROUTES` instead of `react-router-dom`
- Main game route is now `/start-stack/main-game` (was `/start-stack/main-game/game`)

## 2026-06-28 — Phases 5–7 (Grid, Engine, Cleanup)

### Phase 5 — `usePaginatedGrid` infinite loop fix

- Replaced `useEffect` + `setState` sync with `useMemo` derived state for `displayedItems` and arrow images
- `BucketBottom` memoizes `arrows` object so deps stay stable

### Phase 6 — GameEngine fixes (partial)

- `loadedMapIdRef` reloads map assets when `mapData.id` changes (was stuck on first world)
- `canvasRef` assignment moved out of render into mount `useEffect`
- Scene parent updates deferred via `startTransition` (prior session)

### Phase 7 — Legacy cleanup

**Deleted:** `App.js`, `index.js`, CRA test/CSS files, `public/index.html`, react-router shells (`*Stack.jsx`)

**Removed dependency:** `react-router-dom`

**New scripts:** `npm run clean`, `npm run dev:clean`

---

## 2026-06-28 — Phase 8: Engine Hardening

### Phase 8a — Save/load hydrate (`a430cc2`)

| File | Changes |
|------|---------|
| `context/sceneSchema.js` | `applySavedSceneToThree`, `applyCameraFromState`, `isPlayableModelEntry` |
| `GameEngine/Loaders/ModelLoader.jsx` | `restore` case, `setupPlayableGltfScene` |
| `context/GameContext.jsx` | `hydrationScene` separate from live `sceneState` |
| `GameEngine/GameEngine.jsx` | Hydrate after assets ready |

### Phase 8b — GameEngineCore (`5d6ace3`)

| File | Changes |
|------|---------|
| `GameEngine/GameEngineCore.js` | **New** — single rAF loop, `mount()` / `dispose()`, `registerFrameCallback` |
| `GameEngine/sceneDispose.js` | **New** — dispose utilities, preserved world roots |
| `GameEngine/GameEngine.jsx` | Thin React wrapper delegating to core |
| `Loaders/SkyBoxLoader.jsx` | Removes old `SkyBox` before re-add |
| `Loaders/ClimateLoader.jsx` | Weather animation via frame callbacks (no orphan loops) |
| `Loaders/MapLoader.jsx` | Tags map as `GameMap` |

### Phase 8c — Engine cleanup (`6da68aa`)

| File | Changes |
|------|---------|
| `ModelLoader.jsx` | Shared `configureGltfMeshNodes`; preload reuses playable path; ~200 lines dead code removed |
| `GameEngine.jsx` | Canvas-bound pointer events; `getBoundingClientRect` raycasting |
| `ClimateLoader.jsx` | `FOGGY` particle drift + `DynamicDrawUsage` (later replaced by real fog) |

### Post-8 bug fixes

| Commit | Fix |
|--------|-----|
| `12c7730` | Toolbar toggle-close for paint, drive, climate, music, bucket |
| `2b94f13` | Music `AbortError` from interrupted `play()` promises |
| `a6d05d7` | Snow particles — scene lookup each frame |
| `d19e6b0`–`d84ea90` | Start page leave icon visibility / stacking |
| `f15c48a` | Real atmospheric fog + low-lying mist layers (replaced particle fog) |

---

## 2026-06-28 — Phase 9: Features (`0117c9b`)

### SnapShot real gallery

| File | Changes |
|------|---------|
| `api/worldSave.js` | `getWorldSnapshots`, `mergeSnapshotLists`, `removeWorldSnapshot` |
| `SnapShotBody.jsx` | Profile + session captures in paginated grid; print/delete |
| `SnapShotHolder.jsx` | Passes profile/mapData callbacks |
| `SnapShot.jsx` | Preview updates on selection |
| `snapshot/page.jsx` | Wires `currentProfile`, `onRemoveSnapshot` |
| `WorldSessionProvider.jsx` | `onRemoveSnapshot` callback |

### Workshop mapData

| File | Changes |
|------|---------|
| `WorkShop.jsx` | Receives `mapData`; world name label; save returns to game |
| `WorkShop.module.css` | Workshop background + world label styles |
| `workshop/page.jsx` | Passes `worldData` |

### Dark weather modes

| File | Changes |
|------|---------|
| `ClimateLoader.jsx` | `DARK_SUNNY`, `DARK_WINDY`, `DARK_DRIZZLY`, `DARK_THUNDERSTORM`; parameterized rain |

### Worlds 2–10

| File | Changes |
|------|---------|
| `localWorlds.js` | All 10 worlds unlocked; worlds 2–10 use `map1` placeholder assets |

---

## 2026-06-28 — Phase 10: Infrastructure

### `src/services/userService.js` (new)

- `loadUserData` / `saveUserData` — seed JSON → localStorage → API POST
- `readSessionAuth` / `writeSessionAuth` — session profile selection
- `defaultProfileOptions`, storage key constants
- `src/api/index.js` — thin re-export facade (backward compatible `fetchData` / `persistUserData`)

### Code splitting

| File | Role |
|------|------|
| `src/lib/lazyGameScreens.jsx` | `next/dynamic` wrappers with loading state |
| `MainGameStack/screens/*.jsx` | Thin screen entry points for lazy import |
| `app/.../main-game/*/page.jsx` | Pages import lazy screens only |

**Result:** `/start-stack/main-game` First Load JS ~284 kB → ~107 kB

### Cleanup

- `GameEngine.jsx` — exhaustive-deps warning fixed (map reload scoped to `mapId`)
- `WorkShop.module.css` — removed unused layout rules (now in `GameShell`)

---

## Build Status

- `npm run build` — **passes** (no ESLint warnings)
- 14 App Router pages; main-game route ~107 kB First Load JS
- **Phases 0–10 complete**
- **User backlog:** Workshop 3D brick editor
