# Grok Changelog

All changes made on branch `grok-dev` via Grok sessions.

**Sync:** Grok pushes to `origin/grok-dev` after commits — see `grok/WORKFLOW.md`.

---

## 2026-06-30 — Workshop brick collision + Shift vertical move

| File | Change |
|------|--------|
| `brickCollision.js` | **New** — stud-footprint AABB overlap checks (rotation-aware) |
| `WorkshopEngineCore.js` | Collision on place/move/duplicate/stack/rotate; `trySetBrickPosition` |
| `WorkshopEngine.jsx` | Shift+drag moves brick on Y-axis (mouse up = higher); collision-aware drag |
| `studGrid.js` | `snapYToPlate` for plate-height vertical snapping |

Bricks can no longer overlap when adjacent. Hold **Shift** while dragging in move mode to raise/lower a brick in plate-height steps.

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
