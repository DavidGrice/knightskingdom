# Grok Session Continuation Guide

Use this folder to resume work on **LEGO Creator: Knight's Kingdom** modernization after a new Grok session or token reset.

**Active branch:** `grok-dev` (all Grok changes; `main` stays stable)

**Project path (VS Code):** `D:\CODING\THREEJS\knightskingdom\knightskingdom`

**Grok sandbox worktree:** `C:\Users\david\.grok\worktrees\knightskingdom-knightskingdom\knightskingdom`

> Grok edits land in the sandbox first. User merges manually into the VS Code repo.

---

## Quick Start for a New Session

Tell Grok:

> Read `grok/README.md` and `grok/ROADMAP.md`. We are on branch `grok-dev`. Phases 0–10 complete; continue from user backlog or new features.

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

## Current Status (2026-06-28)

| Area | State |
|------|-------|
| **Phases 0–10** | ✅ Complete |
| **Working on** | User backlog + optional polish (see below) |
| **User backlog** | MyModels further polish, workshop menu (WorkShop) |

**Recent commits:**
```
0117c9b Phase 9: snapshot gallery, workshop mapData, dark weather, worlds 2-10
f15c48a Replace fog particles with atmospheric fog and low-lying mist layers
6da68aa Phase 8c: engine cleanup
5d6ace3 Phase 8b: GameEngineCore
a430cc2 Phase 8a: hydrate saved scene state
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
| `localWorlds.js` | Worlds 1–10 (all playable; map1 placeholder for 2–10) |
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
- [ ] **Fix workshop menu** — WorkShop toolbar/panel UI/layout polish
- [ ] Fix save game menu styling (MyModels — further polish)

### Deferred

- [ ] React Three Fiber migration (optional; plain Three.js is working)
- [ ] Unique GLB assets per world 2–10
- [ ] Shared worlds engine playability

---

## Known Issues Still Open

| Area | Issue |
|------|-------|
| SnapShot / screenshot menu | ✅ Layout restored from original CRA styles |
| WorkShop / workshop menu | Toolbar and panel layout need polish (backlog) |
| MyModels / save UI | Further layout polish needed (backlog) |
| Shared worlds | No `filePath` / engine assets |
| Worlds 2–10 | Reuse `map1` GLB until unique maps added |
| ESLint | Minor unused-vars in some components (non-blocking) |
| Workshop | Brick tools visual only; no 3D brick editor yet |

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

---

## Session Prompt Templates

**Continue Phase 10:**
> Read `grok/ROADMAP.md` Phase 10. On `grok-dev`, extract `userService.js` and add lazy loading for main-game routes.

**Fix styling:**
> Fix save game menu styling in MyModels on `grok-dev`. Match SnapShot/WorldBody layout patterns.

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