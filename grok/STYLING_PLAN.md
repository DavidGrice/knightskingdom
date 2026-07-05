# Knights Kingdom — Menu Styling Fix Plan (Revised)

**Branch:** `grok-dev-vanilla`  
**Scope:** Non-3D bitmap menus only  
**Out of scope:** `GameEngine*`, `WorkshopEngine*`, loaders, `sceneSchema`, climate, drive mode

**Last updated:** 2026-07-05

---

## What shipped in this revision

| Deliverable | Status |
|-------------|--------|
| `grok-dev-vanilla` branch | ✅ |
| Media gitignore (+ `resources/research/**` exception) | ✅ |
| Untrack ~1,000 PNGs from git index (9 research PNGs remain) | ✅ |
| `MenuStageLayout` + `MenuPanelShell` + `menuStageMetrics.js` | ✅ Built |
| `MenuScreenLayout` → delegates to `MenuStageLayout` | ✅ Wired |
| Auth + Start use `screenKey` + stage corners | ✅ Done |
| Auth profile rows (528×99 sprites + name overlay) | ✅ A3 done (2026-07-05) |
| Auth `modern` scale mode (centered stack, row gaps) | ✅ (2026-07-05) |
| World dual-header active tab sprites | ✅ A2 done (2026-07-05) |
| `grok/analyze-menu-images.mjs` | ✅ |
| `/testing` regression suite + `run-regression.mjs` | ✅ |
| MyModels / SnapShot on `MenuStageLayout` | ⬜ Next PR |

---

## Standardized styling model

All non-3D menus share one coordinate system:

```
MenuRoot (100vw×100vh black letterbox)
  └── MenuScaler (--msl-scale from viewport)
        └── Stage (800×600px, background PNG)
              ├── Content (screen-specific)
              ├── CornerCheckmark (120, 560)
              ├── CornerTrash (631, 560)     — auth only
              └── CornerLeave (696, 0)       — start only
```

### Panel archetypes

| Archetype | Screens | Header | Holder |
|-----------|---------|--------|--------|
| **PROFILE_LIST** | Authentication | — | Vertical name slots on parchment |
| **DUAL_HEADER** | World picker (Start) | Local + Shared tabs (141×57) | `WORLD_LIGHT` / `WORLD_DARK` 519×530 |
| **SINGLE_HEADER** | MyModels, SnapShot | — (frame includes chrome) | `MY_MODELS` 519×587 / `SNAPSHOT` 516×530 |

**Shared grid geometry** (all archetypes with 3×3 paginated cells):

- Cell: **109×80**
- Gap: **23×28**
- `PaginatedGrid` + `HolderGridLayout` + `usePaginatedGrid`
- Selection overlay: `selected.png` (world/snapshot) or `wh_selection.png` (save)

**Dual-header difference:** World picker stacks a **tab strip** above the holder body. Yellow (local) vs purple (shared) themes swap the holder background and footer icons — not a second grid.

---

## Implementation options

Choose one path (or hybrid). All assume `MenuStageLayout` is the root (already landed).

### Option A — **Incremental migration** (recommended)

Migrate one screen per PR; lowest risk; regression tests gate each step.

| PR | Work | Screens |
|----|------|---------|
| A1 | ✅ `MenuStageLayout` + Auth/Start `screenKey` | Auth, Start |
| A2 | `MenuPanelShell` + dual-header active tabs | Start/World |
| A3 | Auth profile column px coords (drop `position:fixed`) | Auth |
| A4 | MyModels → `MenuStageLayout` + `MenuPanelShell` SINGLE | Save game |
| A5 | SnapShot → same + holder position fix | Photo album |

**Pros:** Claude's 3D work unaffected; easy rollback per screen.  
**Cons:** Temporary inconsistency until A5 done.

### Option B — **Big-bang panel unification**

Refactor all four screens in one pass to `MenuPanelShell` + shared corner slots.

- World, MyModels, SnapShot bodies become thin wrappers: `{ archetype, screenKey, header?, children: <PaginatedGrid> }`
- Delete per-screen holder CSS (`componentHolder` left/top magic numbers)
- `WorldHeader` owns tab sprite swap internally

**Pros:** Fastest path to visual consistency.  
**Cons:** Large diff; harder to bisect regressions without test suite (now available).

### Option C — **Metrics-first / screenshot-driven**

Run `npm run analyze:menu` (+ optional `sharp`) and `TEST_CAPTURE=1 npm run test:menu` before any CSS edits. Tune `menuStageMetrics.js` until probe screenshots match your local original game captures. Only then migrate JSX.

**Pros:** Highest fidelity to original; metrics are data-driven.  
**Cons:** Requires your local asset copies + optional manual screenshot comparison.

### Hybrid (suggested)

**A1–A2 done → C for metric tuning → A3–A5 for migration**, with `npm run test:menu` on every commit.

---

## Regression test suite (`/testing`)

### Run commands

```bash
npm run dev                    # required
npm run test:menu              # layout only (4 tests)
npm run test:regression        # menu + world-load + placements
TEST_CAPTURE=1 npm run test:menu   # saves testing/output/*.png
```

### What each test asserts

| Test | Pass criteria |
|------|---------------|
| `menu-auth.layout` | `[data-testid=menu-stage]` present, `data-screen=AUTHENTICATION`, scale ≈ viewport/800, checkmark + trash corners |
| `menu-start.layout` | `data-screen=START_WORLD`, dual tabs exist, 9 grid cells, leave corner |
| `menu-mymodels.layout` | Holder mounted, 1–9 grid cells, checkmark (until MenuStage migration) |
| `menu-snapshot.layout` | Holder width ≥ 400px (positioning sanity), grid cells, checkmark |

### Extending tests (backlog)

- [ ] Pixel diff against golden `testing/output/baseline/` (optional, local only)
- [ ] Assert `MenuPanelShell data-archetype` after migration
- [ ] Assert active tab `background-image` contains `_4.png`
- [ ] Assert SnapShot Destroy button has click handler
- [ ] CI job: `test:menu` on PR (no engine tests in vanilla branch)

---

## Asset policy

| Location | Git policy |
|----------|------------|
| `resources/research/*.png` | **Tracked** — RE reference diagrams |
| All other `*.png`, audio, video, 3D | **Gitignored** — local only |
| `testing/output/` | **Gitignored** — probe screenshots |
| `testing/*.mjs`, `testing/lib/`, `testing/README.md` | **Tracked** |

Clone workflow: copy assets from your game install / upscaled exports locally; run `resources/model_pipeline/` scripts as needed.

---

## Per-screen remaining work

### Authentication (`PROFILE_LIST`)

- [ ] Replace `position: fixed; left: 52%` with `--msl-profile-*` CSS vars
- [ ] Vertical slot stack at `(400, 200)` per `menuStageMetrics`
- [ ] Remove browser `alert()` — disable checkmark when no selection

### Start / World (`DUAL_HEADER`)

- [x] Leave icon → `MenuStageLayout.topRight`
- [ ] Wrap `World` in `MenuPanelShell archetype=DUAL_HEADER`
- [ ] `WorldHeader`: swap `*_2` / `*_4` sprites on active tab
- [ ] Remove `World.module.css` absolute 660×587 — use `--msl-holder-cx/cy`

### MyModels (`SINGLE_HEADER`)

- [ ] Migrate to `MenuStageLayout screenKey=MY_MODELS`
- [ ] `MenuPanelShell` + drop `translateX(-52%)`
- [ ] `BackCheckmarkButton` via stage corner slot

### SnapShot (`SINGLE_HEADER`)

- [ ] Same as MyModels with `screenKey=SNAPSHOT`
- [ ] Fix holder `left/top` (currently unpositioned)
- [ ] Wire Destroy icon handler

---

## Files reference

| Path | Role |
|------|------|
| `src/Components/Common/MenuStageLayout/` | 800×600 scaler + metrics + panel shell |
| `src/Components/Common/HolderGridLayout/` | Grid cell geometry (shared) |
| `src/Components/Common/MenuScreenLayout/` | Thin wrapper over MenuStageLayout |
| `grok/analyze-menu-images.mjs` | Asset inventory + metrics report |
| `testing/run-regression.mjs` | Test orchestrator |
| `testing/lib/menuLayoutAssert.mjs` | Stage scale/center assertions |

---

## Off-limits (Claude / 3D)

```
src/Components/.../MainGame/GameEngine/**
src/Components/.../WorkShop/WorkshopEngine/**
src/Components/.../Loaders/**
src/Components/.../context/sceneSchema.js
public/models/**
resources/model_pipeline/**
```

---

## Success criteria

| Metric | Target |
|--------|--------|
| `npm run test:menu` | 4/4 pass at 1280×800 and 1920×1080 |
| Stage centering | ≤ 8px horizontal drift |
| Grid cells | 9 visible on world picker page 1 |
| Research PNGs | 9 files remain tracked |
| Other media | 0 files tracked in git index |