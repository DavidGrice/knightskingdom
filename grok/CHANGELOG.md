# Grok Changelog

All changes made on branch `grok-dev` via Grok sessions.

---

## 2026-06-28 — Phase 0: Branch Setup

- Created `grok-dev` branch from `main` (local, VS Code repo + Grok worktree)
- User preference: local only initially (no `git push` yet)

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

## Build Status

- `npm run build` — **passes** (warnings only, pre-existing ESLint)
- 14 App Router pages generated; main-game chunk ~280 kB
