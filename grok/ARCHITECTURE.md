# Architecture Reference

Deep-dive breakdown of the **game codebase** (`src/`).  
For RE assets see `resources/` and root `README.md`.

---

## Repository Layout

```
knightskingdom/
├── grok/                    ← Session continuation docs (this folder)
├── src/                     ← Modern React app
│   ├── App.js
│   ├── api/
│   ├── data/worlds/         ← World catalogs + engine assets (Phase 2)
│   └── Components/
│       ├── Common/            ← Shared UI primitives
│       ├── AuthenticationStack/
│       └── MainMenuStack/
│           └── StartStack/
│               └── MainGameStack/
├── public/
├── resources/               ← RE only
└── tools/lca2obj/           ← RE only
```

---

## App Entry & Auth Gate

`App.js` is a **class component** that:

1. Loads profiles via `fetchData()` on mount
2. Persists via `persistUserData()` in `componentDidUpdate`
3. Toggles `isAuthenticated` to swap `AuthenticationStack` vs `MainMenuStack`
4. Each stack gets its **own** `<Router>` (known limitation; Phase 6 fix)

**Profile shape:**
```json
{
  "id": 1,
  "name": "David",
  "level": "baronet",
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

### AuthenticationStack
| Path | Component |
|------|-----------|
| `/authentication` | Authentication |
| `*` | → `/authentication` |

### MainMenuStack
| Path | Component |
|------|-----------|
| `/main-menu` | MainMenu |
| `/options` | Options |
| `/credits` | Credits |
| `/start-stack/*` | StartStack |
| `*` | → `/main-menu` |

### StartStack
| Path | Component |
|------|-----------|
| `/start-stack/start` | Start (World picker) |
| `/start-stack/main-game/*` | MainGameStack |

### MainGameStack
| Path | Component |
|------|-----------|
| `/game` | MainGame (default) |
| `/workshop` | WorkShop |
| `/snapshot` | SnapShot |

---

## Component Patterns

### ResourceStack barrels

Each UI area has `*ResourceStack/index.js` importing hundreds of PNGs and exporting:
- Frame arrays for animations
- Static images
- Data arrays (bucket items, etc.)

**Convention:** `_2.png` = default, `_4.png` = hover.

### Menu screens (post-Phase 2)

```jsx
<MenuScreenLayout
  backgroundImage={bg}
  contentClassName={styles.centeredContainer}
  bottomLeft={<BackCheckmarkButton onClick={onConfirm} />}
  bottomRight={<HelpComponent ... />}  // optional
  topRight={<IconComponent ... />}     // optional
>
  {children}
</MenuScreenLayout>
```

### Pagination (post-Phase 2)

```jsx
const grid = usePaginatedGrid({
  items,
  itemsPerPage: 9,
  arrows: { upSolid, upGreen, downSolid, downGreen },
  resetToken: didUpdate,
  onReset: () => { /* clear parent state */ },
});

<PaginatedGrid
  styles={paginatedStyles}  // maps to existing CSS module classes
  {...grid}
  onItemClick={handleItemClick}
  getItemKey={(item) => item.id}
/>
```

---

## GameEngine (Three.js)

**Location:** `MainGame/GameEngine/GameEngine.jsx`

### Loaders
| Loader | Role |
|--------|------|
| `MapLoader` | Terrain GLTF |
| `ModelLoader` | Preload + add models; raycast placement |
| `SkyBoxLoader` | Cube skybox + climate shader |
| `ClimateLoader` | Weather particles (snow, rain, fog) |

### Interaction modes (`Modes` enum)
`NONE`, `ADDING`, `MOVING`, `ROTATING`, `PAINTING`, `DELETING`, `ACTION`, `DRIVING`, `PLAYING`

Raycasting on canvas drives brick tools. Object flags: `isMovable`, `isPaintable`, `isDeletable`, `isDriveable`, etc.

### World data consumption

`mapData` from world selection includes:
```js
{
  id, name, image, isLocked,
  filePath,      // map GLB
  skyBoxes: [{ filePath, name }],
  models: [{ filePath, position, name }]
}
```

Only **World 1** in `localWorlds.js` has full engine fields today.

---

## MainGame vs WorkShop Duplication

Two nearly parallel trees (Phase 3 target):

```
MainGame/                          WorkShop/
├── ComponentTop/                  ├── ComponentTop/
├── ComponentBottom/               ├── ComponentBottom/
├── GameEngine/                    └── (none)
└── MainGame.jsx (~360 lines)      └── WorkShop.jsx (~60 lines)
```

Shared layout CSS: `mainDiv`, `topComponent`, `bottomComponent`.

---

## World Selection Data Flow

```
WorldBody selects item
  → Start.setWorldData(item)
  → StartStack.setSelectedMap(mapData)
  → navigate('/start-stack/main-game/game')
  → MainGameStack.worldData
  → MainGame / GameEngine
```

**Workshop/Snapshot (Phase 1 fix):**
```
MainGame.handleNavigateToWorkshop()
  → navigateToWorkshop({ ...mapData, sceneSnapshot })
MainGame.handleNavigateToSnapShot()
  → navigateToSnapshot(intermediateMapData)
  → worldData.sceneSnapshot stored on MainGameStack
```

---

## SnapShot / MyModels

- **SnapShot:** Static image gallery from `SnapShotBodyResourceStack`; `mapData` received but not used for rendering yet
- **MyModels:** Empty stub; assets exist in `MyModelsResourceStack/`; no route

---

## Original Superscape / RE Context (Read-Only)

- `.lca` files = wrapper over VCA (SHP, PAL, WRLD chunks)
- `tools/lca2obj/lca2obj.py` — 16-bit chunk parser → OBJ/MTL
- `resources/research/` — format diagrams
- Not needed for React game work

---

## ESLint / Tech Debt (Non-Blocking)

- Many `no-unused-vars` in game components
- `react-hooks/exhaustive-deps` in GameEngine, WorldBody, HelpComponent
- CRA/babel deprecation warnings on build
- 3.2 MB main bundle — no code splitting