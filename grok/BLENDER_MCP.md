# Blender MCP — Grok Setup (Knights Kingdom)

**Configured:** 2026-07-05  
**Grok config:** `C:\Users\david\.grok\config.toml` → `[mcp_servers.blender]`  
**Blender:** 5.1 installed at `C:\Program Files\Blender Foundation\Blender 5.1`

---

## What was done

1. Installed **uv** → `C:\Users\david\.local\bin\uvx.exe`
2. Added Blender MCP to Grok:
   ```powershell
   grok mcp add blender -e UV_PYTHON_PREFERENCE=only-managed -e DISABLE_TELEMETRY=true -- C:\Users\david\.local\bin\uvx.exe --python 3.11 blender-mcp
   ```
3. Verified: `grok mcp doctor blender` → **22 tools**, handshake OK

---

## One-time Blender addon install

If the addon is not already enabled:

1. Open Blender 5.1
2. **Edit → Preferences → Add-ons → Install…**
3. Select `grok/blender-mcp-addon.py` (copy of [ahujasid/blender-mcp addon.py](https://github.com/ahujasid/blender-mcp))
4. Enable **Interface: Blender MCP**
5. Press **N** in the 3D view → **BlenderMCP** tab → **Connect to MCP**

The MCP server talks to Blender on `localhost:9876` (default).

---

## Daily workflow

1. **Start Blender** and click **Connect** in the BlenderMCP sidebar
2. **Restart Grok** (or start a new session) so MCP tools load
3. Ask Grok to use Blender tools — namespaced as `blender__*` (e.g. scene info, execute code, export)

**Diagnostics:**
```powershell
grok mcp list
grok mcp doctor blender
```

**Logs if handshake fails:**
```
C:\Users\david\.grok\logs\mcp\blender.stderr.log
```

---

## Knights Kingdom export paths

When authoring hero parts or fixing meshes in Blender, export to:

| Asset type | Export | Game path |
|------------|--------|-----------|
| Workshop brick | OBJ + MTL | `public/models/bricks/<brickId>.obj` (+ `.mtl`) |
| Warehouse prop | OBJ + MTL | `public/models/warehouse/<id>.obj` |
| Custom creation | GLB or OBJ | `public/workshop/bricks/` or catalog entry |

After export, run `resources/model_pipeline/copy_obj_assets.mjs` if needed, then validate with `npm run test:workshop` / in-game load.

**Export tips (from prior sessions):**
- Origin at `(0,0,0)` before export — off-origin exports caused placement bugs
- Match catalog `studs` / `heightPlates` or run `convert_bricks.mjs` validation gate
- Live game uses **OBJ/MTL** via `shared/objMtlLoader.js`, not GLB

---

## Example Grok prompts

- "List all objects in the Blender scene and their dimensions"
- "Export the selected mesh as OBJ to `public/models/bricks/c5_2x4.obj` with Y-up"
- "Apply LEGO yellow material and show a viewport screenshot"
- "Center the mesh origin to the world origin before export"

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `spawn uvx ENOENT` | Use full path `C:\Users\david\.local\bin\uvx.exe` in config (already set) |
| MCP tools missing in Grok | Fully quit and relaunch Grok after config change |
| Connection refused :9876 | Blender not open, or addon not connected |
| Timeout on first command | Normal on cold start; retry after Blender addon shows connected |

**Only run one MCP client instance** (Grok *or* Cursor Blender MCP, not both on the same port).

---

## Related project docs

- `grok/WORKSHOP_3D.md` — D5 optional hand-authored GLB hero parts
- `resources/model_pipeline/` — batch OBJ copy + brick validation
- `resources/model_files/blender/` — LCA import addon (separate from BlenderMCP)