# Blender MCP — Grok Setup (Knights Kingdom)

**Last updated:** 2026-07-05 (stdio / official Blender Lab MCP)  
**Verified working:** Grok CLI → `python -m blmcp` → Blender 5.1 Lab MCP addon

---

## For future Grok sessions — read this first

This project uses the **official Blender Lab MCP stack**, not the community `uvx blender-mcp` package (ahujasid) and not the placeholder `grok_blender_mcp` config.

**Correct workflow:**

```powershell
grok
```

Then ask naturally, e.g. *"Get the scene info."* — Grok spawns the MCP server and calls Blender tools over **stdio**. You do **not** manually launch the MCP server, open port 9876, or run raw socket scripts.

**Quick health check:**

```powershell
grok mcp doctor blender
```

Expect: `handshake OK`, **26 tools** discovered.

**One-shot test:**

```powershell
grok -p "Get the scene info from Blender. Be brief." --always-approve
```

---

## Architecture (what actually runs)

```
Grok CLI  ⇐stdio⇒  python -m blmcp  ⇐TCP localhost:9876⇒  Blender Lab MCP addon
```

| Layer | Role |
|-------|------|
| **Grok CLI** | MCP client; talks to the server over **stdio only** |
| **`python -m blmcp`** | Official Blender Lab MCP server (package `blender-mcp` v1.0.0) |
| **Blender addon** | Official Lab extension (`lab.blender.org` / MCP), TCP on `:9876` internally |
| **Port 9876** | Internal bridge between `blmcp` and Blender — **not** where Grok sends MCP messages |

Grok never touches TCP or HTTP for MCP. The MCP server may also support `--transport http` for other clients (e.g. llama.cpp web UI); Grok uses **stdio** (default).

---

## What was fixed (2026-07-05 session)

### Problem

1. `~/.grok/config.toml` pointed at a **broken placeholder**:
   ```toml
   # BAD — do not restore
   command = "python"
   args = ["-- -m grok_blender_mcp.server", "--env", "PYTHONPATH=C:\\path\\to\\grok-blender-mcp\\src"]
   ```
   → `grok mcp doctor` failed: handshake / module not found.

2. A prior doc pass used **`uvx blender-mcp`** (PyPI v1.6.x, ahujasid) — **wrong package** with a different protocol (`get_scene_info`, no null terminator). That conflicts with the **official Blender Lab addon** already installed in Blender 5.1.

3. Raw socket tests (`grok/test_mcp_socket.py`) used the community protocol and timed out with `Client timed out` — misleading for MCP debugging.

### Solution applied

1. Installed official Blender Lab MCP Python package:
   ```powershell
   pip install -e "C:\Users\david\AppData\Local\uv\cache\git-v0\checkouts\3d3f7baf3c11ea72\98b0e49\mcp"
   ```
   (Editable install from Blender's `blender_mcp` repo checkout in uv cache. Re-install from [Blender Lab releases](https://projects.blender.org/lab/blender_mcp/releases) if missing.)

2. Updated Grok user config:
   ```powershell
   grok mcp remove blender
   grok mcp add blender -- python -m blmcp
   ```

3. Verified end-to-end:
   - `grok mcp doctor blender` → 26 tools, healthy
   - `grok -p "Get the scene info..."` → scene summary returned from live Blender

### Current config (`~/.grok/config.toml`)

```toml
[mcp_servers.blender]
command = "python"
args = ["-m", "blmcp"]
enabled = true
```

Project-scoped copy: `.grok/config.toml` (same server block, for teammates / fresh clones).

---

## Blender side (one-time)

**Addon in use:** Official **Blender Lab MCP** extension (Blender 5.1+), not `grok/blender-mcp-addon.py`.

| | Official Lab MCP | `grok/blender-mcp-addon.py` |
|--|------------------|----------------------------|
| Source | [blender.org/lab/mcp-server](https://www.blender.org/lab/mcp-server/) | Community ahujasid fork (reference only) |
| Protocol | `{"type":"execute","code":"...","strict_json":bool}\0` | `{"type":"get_scene_info",...}` (no `\0`) |
| MCP server | `python -m blmcp` | `uvx blender-mcp` (different PyPI package) |

**Install official addon (if needed):**

1. Blender 5.1 → Extensions → install from [Blender Lab MCP release](https://www.blender.org/lab/mcp-server/) (drag-and-drop twice: repo, then addon).
2. Enable **MCP** extension.
3. In addon preferences: **Start Server** (or enable auto-start). Server listens on `localhost:9876` for `blmcp` only.

**Do not** enable both the Lab MCP extension and the community BlenderMCP addon on the same port.

---

## Daily workflow

1. **Open Blender 5.1** with the Lab MCP server **started** (addon preferences).
2. Run **`grok`** in the project directory (Grok spawns `python -m blmcp` automatically).
3. Ask for Blender work in natural language.

**No manual steps:** do not run `uvx blender-mcp`, do not `python -m grok_blender_mcp.server`, do not test MCP via raw TCP unless debugging the addon itself.

**After changing MCP config:** fully restart Grok so tools reload.

---

## Grok Build / Cursor agent note

The in-IDE agent (`CallMcpTool` / `blender__*`) may **not** have Blender MCP tools loaded in every session even when `grok mcp doctor` passes. For reliable Blender control, use the **Grok CLI** (`grok` in terminal). That is the supported path for this project.

---

## Available tools (official — 26)

Examples Grok can call via stdio:

| Tool | Purpose |
|------|---------|
| `execute_blender_code` | Run Python in the open Blender session |
| `get_objects_summary` | Scene object overview |
| `get_blendfile_summary_datablocks` | Data-block counts, render engine |
| `get_screenshot_of_window_as_image` | Viewport / window capture |
| `search_api_docs` / `search_manual_docs` | Blender Python API / manual search |
| `render_viewport_to_path` | Render viewport to disk |

List all: `grok mcp doctor blender` (or `/mcps` inside `grok`).

---

## OBJ import orientation (all extracted models)

**Canonical detail:** [`resources/model_files/README.md`](../resources/model_files/README.md) § *Importing OBJ models — orientation*.

Summary for rigging / scene work in Blender:

| Stage | Orientation |
|-------|-------------|
| OBJ on disk | mm, model-up at **−Y**, forward ≈ **+Z** in file space |
| After `wm.obj_import` + `global_scale=0.001` | Metres; still needs a root empty to stand upright |
| Phase2 root `(90°, 0°, 180°)` + ground Z | World **−Y = up**, **+Z = forward** (LCA was −Z) |

**Rigging pitfalls (King Leo / SCL M/F minifigs):**

- Do not place `edit_bones` from world bounds directly — convert with
  `arm.matrix_world.inverted() @ world_point`.
- Vertical span is **Y**, not Z, after the phase2 root rotation.
- Each bone needs **roll += π** for the facing flip when parenting with
  keep-transform (`grok/kingleo_rig_coords.py`).

**Scripts:** `grok/phase2_import_kingleo.py`, `grok/kingleo_rig_coords.py`,
`grok/phase5_add_bone.py`, `grok/kingleo_coord_analysis.py`,
`python grok/run_phase5_step.py <step>`.

---

## Knights Kingdom export paths

When authoring hero parts or fixing meshes in Blender, export to:

| Asset type | Export | Game path |
|------------|--------|-----------|
| Workshop brick | OBJ + MTL | `public/models/bricks/<brickId>.obj` (+ `.mtl`) |
| Warehouse prop | OBJ + MTL | `public/models/warehouse/<id>.obj` |
| Custom creation | GLB or OBJ | `public/workshop/bricks/` or catalog entry |

After export, run `resources/model_pipeline/copy_obj_assets.mjs` if needed, then validate with `npm run test:workshop` / in-game load.

**Export tips:**

- Origin at `(0,0,0)` before export — off-origin exports caused placement bugs
- Match catalog `studs` / `heightPlates` or run `convert_bricks.mjs` validation gate
- Live game uses **OBJ/MTL** via `shared/objMtlLoader.js`, not GLB

---

## Example Grok prompts

- "Get the scene info."
- "List all objects and their bounding boxes."
- "Export the selected mesh as OBJ to `public/models/bricks/c5_2x4.obj`"
- "Take a viewport screenshot."
- "Center the mesh origin to world origin before export."

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `handshake failed` / `grok_blender_mcp` | Wrong MCP server in config | `grok mcp add blender -- python -m blmcp` |
| `uvx blender-mcp` hangs / wrong tools | Community PyPI package (1.6.x) | Use `python -m blmcp` only |
| `Client timed out` on raw socket test | Wrong JSON protocol or missing `\0` | Ignore socket tests; use `grok mcp doctor` |
| Doctor OK but no tools in IDE agent | Agent session ≠ Grok CLI MCP | Use `grok` terminal |
| Connection refused :9876 | Blender closed or addon server stopped | Start Blender + MCP addon server |
| `blmcp` not found | Package not installed | `pip install` from [Lab MCP `mcp/` folder](https://projects.blender.org/lab/blender_mcp) |

**Logs:**

```
C:\Users\david\.grok\logs\mcp\blender.stderr.log
```

**Diagnostics:**

```powershell
grok mcp list
grok mcp doctor blender
python -c "from blmcp.tools_helpers.connection import send_code; print(send_code('import bpy; print(bpy.app.version_string)', False))"
```

---

## Files in this repo (reference)

| Path | Purpose |
|------|---------|
| `grok/BLENDER_MCP.md` | **This file** — canonical setup for future Groks |
| `.grok/config.toml` | Project-scoped MCP server config |
| `grok/test_mcp_socket.py` | Low-level addon debug only — **not** for MCP verification |
| `grok/blender-mcp-addon.py` | Community addon copy — **not installed**; kept for reference |
| `grok/grok-blender-mcp/` | Third-party Grok bridge repo — **not used** with Lab MCP |

---

## Related project docs

- `grok/README.md` — session handoff
- `grok/WORKSHOP_3D.md` — D5 optional hand-authored hero parts
- `resources/model_pipeline/` — batch OBJ copy + brick validation
- [Blender Lab MCP docs](https://www.blender.org/lab/mcp-server/)