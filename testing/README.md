# Regression tests

Automated checks for menu styling/layout and 3D world loading. Factored out
of ad-hoc Puppeteer probes so `grok-dev-vanilla` can enforce quality on every
styling change.

## Requirements

- Dev server running (`npm run dev`) at `http://localhost:3000` (override with `TEST_BASE_URL`)
- `puppeteer` (devDependency)

## Quick start

```bash
npm run dev          # terminal 1
npm run test:menu    # menu layout only
npm run test:regression   # menu + 3D engine suites
```

Save review screenshots (gitignored):

```bash
TEST_CAPTURE=1 npm run test:menu
# → testing/output/*.png
```

## Suite map

| Script | Category | Checks |
|--------|----------|--------|
| `menu-auth.layout.test.mjs` | Menu | `MenuStageLayout` 800×600 scale, auth corners |
| `menu-start.layout.test.mjs` | Menu | World picker dual-header, 3×3 grid, leave icon |
| `menu-mymodels.layout.test.mjs` | Menu | Save game holder + paginated grid |
| `menu-snapshot.layout.test.mjs` | Menu | Photo album holder positioned + grid |
| `world-load.test.mjs` | Engine | All 10 worlds load without errors |
| `placements.test.mjs` | Engine | Named placements spawn in scene |
| `extraction_fixtures_test.py` | RE | Placement name fixtures (no dev server) |
| `run-regression.mjs` | Runner | Orchestrates all of the above |

## Shared libraries

| File | Role |
|------|------|
| `lib/driver.mjs` | Browser launch, auth seed, world select |
| `lib/menuDriver.mjs` | Navigate to auth / start / save / photo screens |
| `lib/menuLayoutAssert.mjs` | Stage scale, centering, grid cell assertions |

## Metrics tooling

```bash
npm run analyze:menu      # menu background / holder inventory
npm run analyze:workshop  # workshop pixel landmarks (needs sharp)
```

## Output

`testing/output/` is gitignored — local screenshot captures only.