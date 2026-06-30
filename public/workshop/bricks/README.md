# Optional workshop brick GLB assets

Drop `.glb` files here to override parametric bricks. Register in `brickCatalog.js`:

```js
l300500: {
  name: 'Brick 2×4',
  shape: 'GLB',
  glbUrl: '/workshop/bricks/l300500.glb',
  studs: { w: 2, d: 4 },
  heightPlates: 3,
},
```

**Sources for hand-authored models (not LCA-derived):**
- [LDraw Parts Library](https://github.com/ldraw/ldraw) — `.dat` parts; convert in Blender
- [LDraw Parts Library (JSON)](https://github.com/gkjohnson/ldraw-parts-library) — metadata for dimensions
- Sketchfab / TurboSquid — search "LEGO brick" CC0/CC-BY; verify license before shipping

LCA→GLB from game files is **not** used — offsets are unreliable.