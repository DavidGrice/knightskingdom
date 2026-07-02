# Architecture Reference

Deep-dive breakdown of the **game codebase** (`src/` + `app/`).  
For RE assets see `resources/` and root `README.md`.

**Last updated:** 2026-07-02 (real models in MainGame warehouse bucket + WorkShop bricks)

---

## Repository Layout

```
knightskingdom/
├── app/                     ← Next.js 15 App Router pages
│   ├── layout.jsx           ← UserDataProvider
│   └── (game)/              ← Auth-gated game screens
├── grok/                    ← Session continuation docs
├── src/
│   ├── api/                 ← re-exports userService + worldSave
│   ├── services/            ← userService (persistence layer)
│   ├── data/worlds/         ← World catalogs + engine assets
│   ├── lib/
│   │   ├── routes.js        ← Canonical ROUTES constants
│   │   └── context/         ← UserDataProvider, WorldSessionProvider
│   └── Components/
│       ├── Common/
│       ├── AuthenticationStack/
│       └── MainMenuStack/StartStack/MainGameStack/
├── public/
├── resources/               ← RE only
└── tools/lca2obj/           ← RE only
```

---

## App Entry & Auth Gate

**Next.js App Router** (`app/`):

1. `app/layout.jsx` wraps all pages in `UserDataProvider`
2. `UserDataProvider` loads profiles via `fetchData()` and persists via `persistUserData()`
3. `/` redirects to `/authentication` or `/main-menu` based on `isAuthenticated`
4. `app/(game)/layout.jsx` auth-gates all game screens

`App.js` and react-router shells are **removed** (Phase 7).

**Profile shape:**
```json
{
  "id": 1,
  "name": "David",
  "level": "baronet",
  "savedWorlds": {
    "1": {
      "worldId": 1,
      "worldName": "World 1",
      "scene": { "models": [], "camera": {}, "climate": "SUNNY" },
      "thumbnail": "data:image/png;base64,...",
      "snapshots": [{ "id": 123, "imageDataUrl": "...", "createdAt": "..." }],
      "updatedAt": "2026-06-28T..."
    }
  },
  "options": {
    "brickQuality": "high",
    "renderer": "hardware",
    "dialogue": "on",
    "music": "off"
  }
}
```

---

## Routing Map

Canonical paths in `src/lib/routes.js`.

| Path | Component | Provider scope |
|------|-----------|----------------|
| `/authentication` | Authentication | `UserDataProvider` |
| `/main-menu` | MainMenu | `(game)` auth gate |
| `/options` | Options | `(game)` auth gate |
| `/credits` | Credits | `(game)` auth gate |
| `/start-stack/start` | Start (World picker) | `WorldSessionProvider` |
| `/start-stack/main-game` | MainGame | `WorldSessionProvider` + `GameProvider` |
| `/start-stack/main-game/workshop` | WorkShop | `WorldSessionProvider` |
| `/start-stack/main-game/snapshot` | SnapShot | `WorldSessionProvider` |
| `/start-stack/main-game/my-models` | MyModels | `WorldSessionProvider` |

**Save flow:** `GameContext.handleSave` → `onSaveWorldProgress` → `router.push(my-models)`

**Snapshot flow:** Camera icon → `captureFrame()` + `appendWorldSnapshot` → SnapShot gallery

---

## MainGameStack Architecture (post Phase 3–9)

```
MainGameStack/
  shared/                    ← GameShell, ComponentTop/Bottom, Bucket, Palette
  context/                   ← GameContext, sceneSchema, gameReducer
  MainGame/
    GameEngine/
      GameEngineCore.js      ← Three.js lifecycle (Phase 8b)
      GameEngine.jsx         ← React wrapper + canvas input (Phase 8c)
      sceneDispose.js
      Loaders/               ← Map, Model, SkyBox, Climate
    ComponentBottom/         ← Climate, Music (game-only overlays)
    ComponentTop/            ← Drive (game-only)
  WorkShop/                  ← Thin wrapper; receives mapData (Phase 9)
  SnapShot/                  ← Real capture gallery (Phase 9)
  MyModels/                  ← Saved worlds list
```

MainGame vs WorkShop duplication **merged** into `shared/` with `mode` config.

---

## GameEngine (Three.js)

**Core:** `GameEngineCore.js` — plain Three.js, no React Three Fiber.

| Responsibility | Owner |
|----------------|-------|
| Scene/camera/renderer lifecycle | `GameEngineCore` |
| Single render loop + frame callbacks | `GameEngineCore.registerFrameCallback` |
| World load / climate / hydrate | `GameEngineCore.loadWorld`, `setClimate`, `hydrateFromSaved` |
| Canvas mouse interaction | `GameEngine.jsx` (canvas-bound events) |
| React mount/unmount | `GameEngine.jsx` → `core.mount()` / `core.dispose()` |

### Loaders

| Loader | Role |
|--------|------|
| `MapLoader` | Terrain GLTF → `GameMap` |
| `ModelLoader` | Preload / add / restore; shared `configureGltfMeshNodes`. For catalog entries with `objUrl`/`mtlUrl` (the MainGame warehouse bucket, 2026-07-02), loads via the shared `objMtlLoader.js` instead of `GLTFLoader` — see below |
| `SkyBoxLoader` | Cube skybox + climate shader uniforms |
| `ClimateLoader` | Weather: snow, rain, wind particles; atmospheric fog + mist layers |

### Model loading: GLTF vs. OBJ/MTL (2026-07-02)

Two model formats coexist in `ModelLoader.jsx` / `BrickFactory.js`:

- **GLTF/GLB** — hand-authored assets (`archer_with_box2.glb`, `map1.glb`) and
  the generated `warehouseModelCatalog.generated.js` / `brickCatalog.generated.js`
  `model`/`glbUrl` fields (from `resources/model_pipeline/convert_warehouse.mjs`
  / `convert_bricks.mjs`, an `obj2gltf` conversion pipeline). Still generated,
  still loadable, **not the live path** for extracted models any more.
- **OBJ/MTL** (live path for extracted models) — `MainMenuStack/shared/objMtlLoader.js`
  loads `.obj`/`.mtl` directly via `OBJLoader`/`MTLLoader` from `public/models/`
  (populated by `resources/model_pipeline/copy_obj_assets.mjs`). Chosen because
  the `obj2gltf` conversion had an orientation/culling bug; OBJ/MTL sidesteps
  it entirely (a negated Y-scale component both uprights the model and lets
  three.js's negative-determinant winding auto-correction fix the culling).

Both catalogs carry both sets of fields; loaders check `objUrl`/`mtlUrl` first
and fall back to `model`/`glbUrl` if absent.

### Climate modes (all wired)

`SUNNY`, `WINDY`, `FOGGY`, `RAIN`, `SNOW`  
`DARK_SUNNY`, `DARK_WINDY`, `DARK_FOGGY`, `DARK_DRIZZLY`, `DARK_THUNDERSTORM`

UI index 3 = `RAIN` (drizzly icon); index 4 = `SNOW` (thunderstorm icon).

### Interaction modes (`Modes` enum)

`NONE`, `ADDING`, `MOVING`, `ROTATING`, `PAINTING`, `DELETING`, `ACTION`, `DRIVING`, `PLAYING`

Raycasting on canvas drives tools. Object flags: `isMovable`, `isPaintable`, `isDeletable`, `isDriveable`.

### Save/load

1. **Live edits** → `serializeSceneFromThree` → `GameContext.sceneState`
2. **Save game** → `saveWorldProgress` → `profile.savedWorlds[id]`
3. **Load game** → `hydrationScene` from saved world → `applySavedSceneToThree` on asset ready

---

## World Selection Data Flow

```
WorldBody selects item
  → WorldSessionProvider.setWorldData(mapData)
  → router.push(/start-stack/main-game)
  → GameProvider(mapData) + GameEngine
```

**Workshop (UI ✅, 3D editor ⬜):**
```
handleNavigateToWorkshop()
  → navigateToWorkshop({ ...mapData, sceneSnapshot })
  → WorkShop(mapData)
       ├── GameShell + toolbar/bucket/palette (done)
       └── black viewport — empty div today; Phase 11 adds WorkshopEngine
```

**Workshop 3D editor (planned — see `grok/WORKSHOP_3D.md`):**
```
Brick bucket select → WorkshopContext SET_MODE ADDING
  → click build plate → BrickLoader places snapped brick
  → move/rotate/paint/delete/duplicate/sweep via toolbar
  → save → brickInstances[] JSON → profile.customCreations[]
  → main game bucket → BrickFactory.buildGroup() → place in world (no GLB file)
```

**Snapshot:**
```
handleNavigateToSnapShot()
  → captureFrame() + appendWorldSnapshot
  → navigateToSnapshot(entry)
  → SnapShotBody merges profile + session snapshots
```

---

## SnapShot / MyModels

### SnapShot (Phase 9 ✅)
- Paginated grid of `imageDataUrl` captures from `savedWorlds[id].snapshots`
- Print opens selected capture; delete calls `removeWorldSnapshot`
- Preview panel shows selected thumbnail

### MyModels (Phase 4 ✅)
- Lists `getSavedWorldsList(profile)` with thumbnails
- Delete removes saved world slot


---

## Component Patterns

### ResourceStack barrels

Each UI area has `*ResourceStack/index.js` importing PNGs and exporting frame arrays, static images, and data arrays.

**Convention:** `_2.png` = default, `_4.png` / `_5.png` = hover/active.

### Shared game UI (Phase 3)

```jsx
<GameShell mode="game" top={<ComponentTop mode="game" ... />} bottom={...}>
  <GameEngine ref={gameEngineRef} mapData={mapData} ... />
</GameShell>
```

---

## Lazy Loading (Phase 10)

Game stack routes use `next/dynamic` via `src/lib/lazyGameScreens.jsx`:

| Route | Lazy screen |
|-------|-------------|
| `/start-stack/main-game` | `MainGameScreen` (GameProvider + MainGame + Three.js) |
| `.../workshop` | `WorkshopScreen` |
| `.../snapshot` | `SnapshotScreen` |
| `.../my-models` | `MyModelsScreen` |

Page shells stay ~300–400 B; heavy chunks load on demand.

## Workshop Stack (Phase 11 — in progress)

| Layer | Status | Notes |
|-------|--------|-------|
| `WorkShop.jsx` + `WorkshopStageLayout` | ✅ | 800×600 scaled stage, CSS vars from `workshopStageMetrics.js` |
| `shared/ComponentTop` (workshop mode) | ✅ UI / ⬜ handlers | move/rotate/delete/duplicate icons present; not wired to engine |
| `shared/Bucket` (`dataSource: 'bricks'`) | ✅ UI / ⬜ selection | ~200 brick entries with `modelPath`; no `SelectedModel` / `handleLoadModel` |
| `shared/ComponentBottom` sweep | ⬜ | `console.log('Sweep')` placeholder |
| `WorkshopEngine` | ⬜ planned | Fork of `GameEngineCore`; flat plate, no map/climate |
| `WorkshopContext` | ⬜ planned | Mirror `GameContext` subset for workshop tools |
| `BrickFactory` | ⬜ planned | Parametric Three.js meshes from `brickCatalog.js` stud recipes |
| `sceneSchema` extensions | ⬜ planned | `brickInstances[]` + `customCreations[]` on profile |

**Brick assets:** PNG thumbnails for UI; 3D from **parametric factory** by default. As of 2026-07-02, 42/141 bricks (the ones whose extracted geometry matches their catalog stud footprint within tolerance) instead load real geometry via `objMtlLoader.js` from `public/models/bricks/`; see "Model loading: GLTF vs. OBJ/MTL" above and `grok/WORKSHOP_3D.md`.

---

## ESLint / Tech Debt (Non-Blocking)

- Some unused vars in game components
- Workshop 3D editor — see `grok/WORKSHOP_3D.md`
- Unique models per world 2–10 — **in progress, blocked**: `template-01`…`09`
  exist in the extraction toolchain but render solid black through
  `objMtlLoader.js` for reasons not yet found (ruled out winding/culling and
  pure-ambient lighting); see `grok/CHANGELOG.md` 2026-07-02
- WorkShop: 99/141 bricks' catalog `studs`/footprint don't match their real
  geometry (a guessed value, not measured) — only affects which bricks are
  eligible for the real-geometry overlay, not correctness of what's shipped

---

## Original Superscape / RE Context (Read-Only)

- LCA files = wrapper over VCA (SHP, PAL, WRLD chunks)
- Not needed for React game work