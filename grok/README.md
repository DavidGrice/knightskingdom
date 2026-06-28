# Grok Session Continuation Guide

Use this folder to resume work on **LEGO Creator: Knight's Kingdom** modernization after a new Grok session or token reset.

**Active branch:** `grok-dev` (all Grok changes; `main` stays stable)

**Project path (VS Code):** `D:\CODING\THREEJS\knightskingdom\knightskingdom`

**Grok sandbox worktree (isolated):** `C:\Users\david\.grok\worktrees\knightskingdom-knightskingdom\knightskingdom`

> Grok edits may land in the sandbox first. Sync or cherry-pick into the VS Code repo when needed.

---

## Quick Start for a New Session

Tell Grok:

> Read `grok/README.md` and `grok/ROADMAP.md`. We are on branch `grok-dev`. Continue from Phase 3 (or specify a task).

**Run the app:**
```powershell
cd D:\CODING\THREEJS\knightskingdom\knightskingdom
git checkout grok-dev
npm start
```

**Verify build:**
```powershell
npm run build
```

---

## Project Overview

Dual-purpose repo:

1. **Reverse engineering** — `resources/`, `tools/lca2obj/` (Superscape VRT/LCA formats). **Out of scope** for game UI work unless explicitly requested.
2. **Modern web app** — `src/` (React 18 + CRA, Three.js, react-router-dom v6)

### Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 (Create React App 5) |
| Routing | react-router-dom v6 (nested routes) |
| 3D | Three.js v0.161 (imperative WebGL in `GameEngine.jsx`) |
| Styling | CSS Modules per component |
| Persistence | `localStorage` key `knights-kingdom-user-data` + stub API POST |

### Scale (approx.)

- ~112 JS/JSX files, ~52 CSS modules
- ~1,004 images in `src/`
- Stack pattern: `*Stack` folders with `*ResourceStack/index.js` asset barrels

---

## Architecture (Game Code Only)

```
App.js (auth gate, dual Router)
├── AuthenticationStack (/authentication)
│   └── Authentication → ProfileContainer → ProfileInput / ProfileIcon
└── MainMenuStack (/main-menu/*)
    ├── MainMenu, Options, Credits
    └── StartStack (/start-stack/*)
        ├── Start → World (WorldHeader + WorldBody)
        └── MainGameStack (/main-game/*)
            ├── MainGame → GameEngine + ComponentTop/Bottom
            ├── WorkShop → ComponentTop/Bottom (no 3D)
            └── SnapShot → SnapShotBody gallery
```

### Navigation flow

```
Authentication → MainMenu → Start (world pick) → MainGame
                              ├── Workshop (hammer icon)
                              └── Snapshot (camera icon)
```

### Key shared components (`src/Components/Common/`)

| Export | Purpose |
|--------|---------|
| `CommonComponent` | Image button with hover (_2 / _4 PNG pairs) |
| `HelpComponent` | Animated help frames |
| `IconComponent` | Typed icon animations |
| `BackCheckmarkButton` | Shared confirm/back button |
| `MenuScreenLayout` | Full-screen menu shell + corner slots |
| `usePaginatedGrid` | Pagination state hook |
| `PaginatedGrid` | Paginated item grid UI |

### World data (`src/data/worlds/`)

| File | Contents |
|------|----------|
| `engineAssets.js` | Map GLB, grass skybox, default models |
| `localWorlds.js` | Local world catalog (only World 1 fully playable) |
| `sharedWorlds.js` | Shared worlds metadata |
| `index.js` | Re-exports |

`WorldBodyResourceStack/index.js` — UI themes/frames only; re-exports world data.

### API layer (`src/api/`)

- `fetchData()` — localStorage → fallback `userData.json`
- `persistUserData()` — saves to localStorage, tries POST `/updateUserData`
- `defaultProfileOptions` — defaults for new profiles
- **Deleted:** `api.js` (dead Express server)

---

## Git / Branch Workflow

```text
main          → stable, untouched
grok-dev      → all Grok-assisted changes
```

```powershell
git checkout grok-dev    # resume Grok work
git checkout main        # return to stable
# When ready for remote backup:
git push -u origin grok-dev
```

---

## Completed Work Log

See [CHANGELOG.md](./CHANGELOG.md) for file-level detail.

### Phase 0 — Setup
- [x] Created `grok-dev` branch (local + VS Code repo)

### Phase 1 — Minimal cleanup (bugs + dead code) ✅ COMPLETE

**Cross-cutting**
- [x] Fixed `App.js` import casing (`./Components/`)
- [x] Renamed API persist fn to `persistUserData`
- [x] localStorage profile persistence
- [x] Removed dead `src/api/api.js`

**AuthenticationStack**
- [x] Profile selection passes full object (not string/boolean)
- [x] `updateUserData` wired on add/delete
- [x] Stable profile IDs, default `options`
- [x] Broke circular import in `AuthenticationStack.jsx`

**MainMenuStack**
- [x] Deleted empty `PlayerSelect/`
- [x] Removed broken `/change-player`, `/quit` routes
- [x] Trimmed Credits comments, unused Options props

**StartStack / World**
- [x] Clear world selection on tab switch
- [x] Guard checkmark (no null/locked worlds)
- [x] Fixed World 10 duplicate metadata

**MainGameStack**
- [x] Workshop/snapshot data flow fixes
- [x] SkyBox climate string → int mapping
- [x] `Modes` enum in MainGame
- [x] MyModels removed from barrel (TODO stub)

### Phase 2 — Moderate refactor (shared components) ✅ COMPLETE

- [x] `BackCheckmarkButton`, `MenuScreenLayout`
- [x] Migrated Authentication, MainMenu, Options, Credits, Start
- [x] `usePaginatedGrid` + `PaginatedGrid`
- [x] Refactored WorldBody, MainGame/WorkShop BucketBottom, SnapShotBody
- [x] Extracted world catalog to `src/data/worlds/`
- [x] WorldBody single render path (local vs shared)

---

## Roadmap — What's Next

See [ROADMAP.md](./ROADMAP.md) for full phase breakdown and options.

### Phase 3 — Shared game UI (recommended next)

- [ ] Merge `MainGame/ComponentTop` + `WorkShop/ComponentTop` via `mode: 'game' | 'workshop'` config
- [ ] Merge `ComponentBottom` similarly
- [ ] Shared `Bucket` with `dataSource` prop (models vs bricks)
- [ ] Unify palette config (color naming inconsistencies today)

**Estimated impact:** ~40% reduction in duplicated UI files.

### Phase 4 — Game state

- [ ] `GameContext` or Zustand store replacing 20+ `useState` in `MainGame.jsx`
- [ ] Serializable scene format (replace non-JSON `intermediateMapData`)
- [ ] Wire SnapShot to real canvas capture
- [ ] Implement or remove `MyModels`
- [ ] Persist Options per `selectedProfile.options`

### Phase 5 — Engine modernization (ambitious)

- [ ] Migrate `GameEngine` to `@react-three/fiber` + `@react-three/drei`
- [ ] Central render loop (fix competing `requestAnimationFrame` loops)
- [ ] Scene teardown / memory dispose on unmount
- [ ] Single top-level `Router` in `App.js`

### Phase 6 — Infrastructure

- [ ] `userService.js` abstraction (JSON → localStorage → API)
- [ ] Optional Express dev server + CRA proxy
- [ ] Asset pipeline / code splitting (3.2 MB bundle today)
- [ ] TypeScript (optional)

---

## Known Issues Still Open

| Area | Issue |
|------|-------|
| GameEngine | God `useEffect`, window-level mouse events, no scene teardown |
| ClimateLoader | Spawns own animation loop; windy system edge cases |
| ModelLoader | Duplicated preload/add paths; Vector3.copy bug in add case |
| SnapShot | Gallery is static; `mapData.sceneSnapshot` not rendered |
| WorkShop | Receives `mapData` but doesn't use it yet |
| Worlds 2–10 | Locked placeholders; no GLB assets |
| Shared worlds | No `filePath` / engine assets |
| ESLint | Many unused vars / hook-deps warnings (non-blocking) |

---

## Important File Paths

| Path | Role |
|------|------|
| `src/App.js` | Auth gate, profile state |
| `src/api/index.js` | fetchData, persistUserData |
| `src/Components/AuthenticationStack/` | Profile CRUD |
| `src/Components/MainMenuStack/` | Menu shell |
| `src/Components/MainMenuStack/StartStack/MainGameStack/MainGame/GameEngine/` | Three.js engine |
| `src/data/worlds/` | World + engine asset catalogs |
| `src/Components/Common/` | Shared UI primitives |
| `resources/` | RE research (do not touch for game work) |
| `tools/lca2obj/` | LCA → OBJ parser |

---

## Session Prompt Templates

**Continue Phase 3:**
> Read `grok/ROADMAP.md` Phase 3. On `grok-dev`, merge MainGame and WorkShop ComponentTop into a shared component with mode config. Keep ResourceStacks separate for now.

**Fix a bug:**
> Read `grok/README.md` known issues. Fix [describe bug] on `grok-dev`.

**Code review:**
> Read `grok/CHANGELOG.md` and review uncommitted changes on `grok-dev`.

---

## Document Index

| File | Contents |
|------|----------|
| [README.md](./README.md) | This file — start here |
| [ROADMAP.md](./ROADMAP.md) | Full phased plan with options per stack |
| [CHANGELOG.md](./CHANGELOG.md) | Detailed completed changes |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Deeper codebase breakdown |