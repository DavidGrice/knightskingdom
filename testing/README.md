# Regression tests

Reusable checks factored out of the throwaway puppeteer scripts written
during the "world templates / semi-vanilla placements" work, so future
sessions don't re-derive the same auth-seeding and navigation boilerplate
from scratch.

## Requirements

- Dev server running (`npm run dev`) at `http://localhost:3000` (override
  with `TEST_BASE_URL`).
- `puppeteer` (already a devDependency) for the browser-driven tests.

## Tests

| File | Checks |
|---|---|
| `world-load.test.mjs` | Every world (1-10) reaches `/start-stack/main-game` with no console errors or failed requests. |
| `placements.test.mjs` | Known tier-1 named placements (e.g. Queen Leonora on World 1) actually spawn in the live scene, via the `window.__placedObjects` hook `MapPlacementsLoader.jsx` populates on success. |
| `extraction_fixtures_test.py` | `export_template_placements.py`'s tier-1 name resolution still matches the hand-verified fixtures (no dev server needed). |

## Running

```bash
npm run dev &                                 # in another terminal
node testing/world-load.test.mjs              # all 10 worlds
node testing/world-load.test.mjs 0            # just World 1
node testing/placements.test.mjs
python3 testing/extraction_fixtures_test.py
```

`lib/driver.mjs` holds the shared browser helpers (`launch`, `seedAuth`,
`selectWorld`, `waitForMapLoad`) -- extend it rather than re-deriving
auth-seeding/navigation in a new one-off script.
