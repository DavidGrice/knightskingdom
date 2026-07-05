"""
Phase 2 — Import minifigkingleo00 OBJ+MTL only (no rigging).

Run: python grok/run_blender_script.py grok/phase2_import_kingleo.py
"""

from __future__ import annotations

import json
import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kingleo_blender_utils import (
    IMPORT_SCALE,
    OBJ_PATH,
    PART_PREFIXES,
    ROOT_NAME,
    TEXTURE_DIR,
    blend_path,
    clear_scene,
)

OUT = blend_path("minifigkingleo00_imported.blend")


def _fix_texture_paths() -> None:
    for image in bpy.data.images:
        if not image.filepath:
            continue
        basename = os.path.basename(bpy.path.abspath(image.filepath).replace("\\", "/"))
        resolved = os.path.join(TEXTURE_DIR, basename)
        if os.path.isfile(resolved):
            image.filepath = resolved


def _world_bounds(obj: bpy.types.Object) -> tuple[Vector, Vector, Vector]:
    coords = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    mins = Vector((min(c[i] for c in coords) for i in range(3)))
    maxs = Vector((max(c[i] for c in coords) for i in range(3)))
    return mins, maxs, (mins + maxs) * 0.5


def _import_meshes() -> list[bpy.types.Object]:
    if not os.path.isfile(OBJ_PATH):
        raise FileNotFoundError(OBJ_PATH)

    before = {o.name for o in bpy.data.objects}
    bpy.ops.wm.obj_import(filepath=OBJ_PATH, global_scale=IMPORT_SCALE)

    imported = [
        o
        for o in bpy.data.objects
        if o.name not in before and o.type == "MESH" and any(o.name.startswith(p) for p in PART_PREFIXES)
    ]
    if len(imported) != 12:
        raise RuntimeError(
            f"Expected 12 mesh parts, got {len(imported)}: {sorted(o.name for o in imported)}"
        )

    _fix_texture_paths()
    return sorted(imported, key=lambda o: o.name)


def _orient_root(root: bpy.types.Object, meshes: list[bpy.types.Object]) -> None:
    """Stand upright (Z-up) and place feet on ground. No armature."""
    root.rotation_mode = "XYZ"
    root.rotation_euler = (math.radians(90), 0.0, math.radians(180))
    bpy.context.view_layer.update()

    zmin = min(_world_bounds(o)[0].z for o in meshes)
    root.location.z -= zmin


def _frame_all() -> None:
    if not bpy.context.screen:
        return
    for area in bpy.context.screen.areas:
        if area.type != "VIEW_3D":
            continue
        region = next((r for r in area.regions if r.type == "WINDOW"), None)
        if region is None:
            continue
        with bpy.context.temp_override(area=area, region=region):
            bpy.ops.view3d.view_all(center=True)
        break


def main() -> None:
    clear_scene(keep_camera_light=False)

    meshes = _import_meshes()

    root = bpy.data.objects.new(ROOT_NAME, None)
    bpy.context.collection.objects.link(root)
    root.empty_display_size = 0.05

    for obj in meshes:
        obj.parent = root

    _orient_root(root, meshes)
    bpy.context.view_layer.update()

    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    bpy.context.view_layer.objects.active = root

    bpy.ops.wm.save_as_mainfile(filepath=OUT)
    _frame_all()

    report = {
        "phase": 2,
        "imported_meshes": [o.name for o in meshes],
        "mesh_count": len(meshes),
        "root": root.name,
        "root_location": list(root.location),
        "root_rotation_deg": [math.degrees(r) for r in root.rotation_euler],
        "rigging": "none",
        "saved": OUT,
    }
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()