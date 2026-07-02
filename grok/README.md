# Grok Session Continuation Guide

Use this folder to resume work on **LEGO Creator: Knight's Kingdom** modernization after a new Grok session or token reset.

**Active branch:** `grok-dev` (all Grok changes; `main` stays stable)

**Project path (VS Code):** `D:\CODING\THREEJS\knightskingdom\knightskingdom`

**Grok sandbox worktree:** `C:\Users\david\.grok\worktrees\knightskingdom-knightskingdom\knightskingdom`

> Grok edits in the sandbox worktree, **pushes to `origin/grok-dev`**, then user pulls in VS Code. See **`grok/WORKFLOW.md`** for the full git flow.

---

## Quick Start for a New Session

Tell Grok:

> Read `grok/README.md`, `grok/WORKSHOP_3D.md`, `grok/ROADMAP.md` Phase 11, and `grok/WORKFLOW.md`. We are on branch `grok-dev`. Phases 0–10 complete; workshop UI done. **Active work: workshop 3D brick editor** (see WORKSHOP_3D.md). Push to `origin/grok-dev` after every commit.

**Grok must push after committing** (user syncs via `git pull` in VS Code):

```powershell
git push origin grok-dev
```

**Run the app:**
```powershell
cd D:\CODING\THREEJS\knightskingdom\knightskingdom
git checkout grok-dev
npm run dev:clean
```

**Verify build:**
```powershell
npm run build
```

---

## Current Status (2026-07-02)

| Area | State |
|------|-------|
| **Phases 0–10** | ✅ Complete |
| **Phase 11** | 🔄 Workshop 3D — **D2b done**, D5 optional next |
| **MainGame warehouse bucket** | ✅ Real models (108/108), was non-functional |
| **WorkShop bricks** | 🔄 42/141 real geometry, rest parametric (bad catalog metadata, not mesh defects) |
| **World selector templates** | 🔄 Started — blocked, see `grok/CHANGELOG.md` 2026-07-02 |
| **Constraint (revised)** | LCA→GLB is viable again for the reworked toolchain — see `grok/CHANGELOG.md` / `WORKSHOP_3D.md` 2026-07-02 entries. Live rendering path is now direct OBJ/MTL loading (`shared/objMtlLoader.js`), not GLB conversion. |

**Recent commits:**
```
cbb5ed0 Move this session's new tooling out of resources/model_files/
5d116bf Remove chroma-key green background from warehouse bucket thumbnails
a369c9c Load OBJ/MTL directly at runtime instead of the GLB conversion
8b42b9b Stop tracking extraction-derived 3D model assets in git
5ab8feb Fix WorkShop GLB bricks: never loaded, and sank below the plate
```

---

## Project Overview

Dual-purpose repo:

1. **Reverse engineering** — `resources/`, `tools/lca2obj/` (Superscape VRT/LCA). **Out of scope** unless requested.
2. **Modern web app** — `src/` + `app/` (Next.js 15, plain Three.js)

### Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Routing | `app/` pages + `src/lib/routes.js` |
| 3D | Three.js v0.161 via `GameEngineCore` (imperative WebGL) |
| State | `GameContext` (useReducer) + `WorldSessionProvider` |
| Styling | CSS Modules per component |
| Persistence | `src/services/userService.js` + `src/api/worldSave.js` |

### Scale (approx.)

- ~112 JS/JSX files, ~52 CSS modules
- ~1,004 images in `src/`
- Stack pattern: `*Stack` folders with `*ResourceStack/index.js` asset barrels

---

## Architecture (Game Code)

```
app/
├── layout.jsx                    ← UserDataProvider
├── (game)/layout.jsx             ← auth gate
└── (game)/start-stack/layout.jsx ← WorldSessionProvider

src/Components/
├── Common/                       ← PaginatedGrid, MenuScreenLayout, etc.
├── AuthenticationStack/
└── MainMenuStack/StartStack/
    ├── World/                    ← world picker
    └── MainGameStack/
        ├── shared/               ← GameShell, ComponentTop/Bottom, Bucket, Palette
        ├── context/              ← GameContext, sceneSchema
        ├── MainGame/GameEngine/  ← GameEngineCore + loaders
        ├── WorkShop/
        ├── SnapShot/
        └── MyModels/             ← save game list
```

### Navigation flow

```
Authentication → MainMenu → Start (world pick) → MainGame
                              ├── Workshop (hammer)
                              ├── Snapshot (camera)
                              └── Save → MyModels
```

### Key providers

| Provider | Scope | Role |
|----------|-------|------|
| `UserDataProvider` | App-wide | Profiles, auth, `persistUserData` |
| `WorldSessionProvider` | Start stack | `worldData`, save/snapshot/nav callbacks |
| `GameProvider` | Main game page | Game UI state, engine ref, tool handlers |

### World data (`src/data/worlds/`)

| File | Contents |
|------|----------|
| `engineAssets.js` | Map GLB, grass skybox, default models |
| `localWorlds.js` | Worlds 1–10 (all playable; **all 10 still share the `map1` placeholder** — see "Deferred" above for the blocked `template-01`…`09` swap-in) |
| `sharedWorlds.js` | Shared worlds metadata (no engine assets yet) |

### API layer (`src/api/`)

- `fetchData()` / `persistUserData()` — profile persistence
- `worldSave.js` — `saveWorldProgress`, `appendWorldSnapshot`, `removeWorldSnapshot`, `getWorldSnapshots`, `mergeSnapshotLists`

---

## Completed Phases Summary

| Phase | What shipped |
|-------|--------------|
| 0 | `grok-dev` branch |
| 1 | Bug fixes, dead code, data pipes |
| 2 | Common components, PaginatedGrid, world data extract |
| 3 | Shared game/workshop UI (`MainGameStack/shared/`) |
| 4 | GameContext, serializable saves, MyModels, options persist |
| 5 | PaginatedGrid infinite-loop fix |
| 6 | Next.js App Router migration |
| 7 | CRA / react-router removal |
| 8 | GameEngineCore, hydrate on load, engine cleanup, real fog |
| 9 | Snapshot gallery, workshop mapData, dark weather, worlds 2–10 |
| 10 | `userService`, lazy game routes, ESLint fix, dead CSS trim |

See [CHANGELOG.md](./CHANGELOG.md) for file-level detail.

---

## Roadmap — What's Next

### User backlog

- [x] **Lego Clock loading modal** — global overlay via `GameLoadingProvider` (navigation, lazy chunks, world assets)
- [x] **Fix screenshot menu** — SnapShot gallery UI/layout polish
- [x] **Fix workshop menu** — WorkShop toolbar/panel UI/layout polish (`WorkshopStageLayout`, pixel-anchored metrics)
- [ ] **Workshop 3D brick editor** — Phase 11; [`WORKSHOP_3D.md`](./WORKSHOP_3D.md)
  - D1 ✅: `WorkshopEngineCore` + `BrickFactory` + basic tools
  - D2 ✅: `workshopSave.js` + `brickInstances[]` persistence on save/leave
  - D2b ✅: bucket stay-open on select; straight camera; 16×16 export bounds; tools + selector boxes; duplicate-above
  - D3 ✅: full parametric catalog (141 bucket entries via `generate-brick-catalog.mjs`) — **not LCA-derived**
  - D4 ✅: workshop save → `customCreations` with camera screenshot → **My Creations** tab in main-game bucket → place in world (runtime Group)
- [ ] Fix save game menu styling (MyModels — further polish, optional)

### Deferred

- [ ] React Three Fiber migration (optional; plain Three.js is working)
- [ ] Unique models per world 2–10 — **in progress, blocked**; `template-01`…`template-09` exist in the extraction toolchain but render black through the OBJ/MTL loader (see `grok/CHANGELOG.md` 2026-07-02)
- [ ] Shared worlds engine playability
- [ ] WorkShop: bring the remaining 99/141 non-validated bricks' catalog `studs`/footprint in line with their real measured geometry (currently based on a fuzzy digit-matched guess against a small reference table)

---

## Known Issues Still Open

| Area | Issue |
|------|-------|
| SnapShot / screenshot menu | ✅ Layout restored from original CRA styles |
| WorkShop / workshop menu | ✅ Layout complete (`WorkshopStageLayout`, `workshopStageMetrics.js`) |
| MyModels / save UI | Further layout polish needed (backlog) |
| Shared worlds | No `filePath` / engine assets |
| Worlds 2–10 | Reuse `map1` GLB until unique maps added |
| ESLint | Minor unused-vars in some components (non-blocking) |
| Workshop 3D editor | No engine in workshop viewport yet; brick tools are UI-only |

### Resolved (was open)

| Area | Fixed in |
|------|----------|
| GameEngine rAF loops / teardown | Phase 8b |
| Window mouse events | Phase 8c |
| ModelLoader duplication | Phase 8c |
| SkyBox re-add on climate change | Phase 8b |
| SnapShot static gallery | Phase 9 |
| WorkShop mapData unused | Phase 9 |
| Worlds 2–10 locked | Phase 9 |
| Fog particle squares | Phase 8c + fog rewrite |
| Toolbar toggle-close bugs | Post-8a |
| Music AbortError | Post-8a |
| Snow not animating | Post-8b |

---

## Important File Paths

| Path | Role |
|------|------|
| `app/(game)/start-stack/main-game/page.jsx` | MainGame + GameProvider |
| `src/lib/context/WorldSessionProvider.jsx` | Session state, navigation |
| `src/lib/context/UserDataProvider.jsx` | Profile persistence |
| `src/Components/.../GameEngine/GameEngineCore.js` | Three.js lifecycle |
| `src/Components/.../GameEngine/GameEngine.jsx` | React wrapper + input |
| `src/Components/.../context/GameContext.jsx` | Game UI state |
| `src/Components/.../context/sceneSchema.js` | Save/load schema |
| `src/api/worldSave.js` | Save/snapshot CRUD |
| `src/data/worlds/` | World catalogs |
| `grok/WORKSHOP_3D.md` | **Phase 11 plan** — workshop 3D editor gaps, options, D1 steps, 2026-07-02 LCA→GLB reversal |
| `WorkShop/WorkShop.jsx` | Workshop screen (UI done; no engine yet) |
| `WorkShop/.../BucketBottomResourceStack/` | ~200 brick raw model files + catalog `index.js` |
| `Common/WorkshopStageLayout/` | Pixel-anchored workshop layout metrics |
| `MainMenuStack/shared/objMtlLoader.js` | Runtime OBJ/MTL loader (the live model-rendering path for both warehouse props and validated bricks) |
| `resources/model_pipeline/` | This session's conversion/pilot/thumbnail tooling (kept separate from the original `resources/model_files/` toolchain) |

---

## Session Prompt Templates

**Continue workshop 3D editor (Phase 11):**
> Read `grok/WORKSHOP_3D.md`. On `grok-dev`, implement Phase D1: `WorkshopEngineCore`, procedural bricks, wire toolbar to workshop context. User chose Option D.

**Expand brick catalog (Phase D3):**
> Read `grok/WORKSHOP_3D.md`. Map bucket entries to parametric `brickCatalog.js` recipes. Do NOT use LCA conversion.

**Code review:**
> Read `grok/CHANGELOG.md` and review latest commits on `grok-dev`.

---

## Document Index

| File | Contents |
|------|----------|
| [README.md](./README.md) | This file — start here |
| [ROADMAP.md](./ROADMAP.md) | Full phased plan (Phases 0–10) |
| [CHANGELOG.md](./CHANGELOG.md) | Detailed completed changes |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Deeper codebase breakdown |
| [WORKSHOP_3D.md](./WORKSHOP_3D.md) | Phase 11 — workshop 3D editor plan & handoff |