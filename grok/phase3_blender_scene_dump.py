"""
Phase 3a — Dump live Blender scene mesh data as JSON (stdout).

Run via: python grok/run_blender_script.py grok/phase3_blender_scene_dump.py
"""

from __future__ import annotations

import json
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kingleo_blender_utils import PART_PREFIXES, ROOT_NAME, blend_path


def _world_bounds(obj: bpy.types.Object) -> dict:
    coords = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    mins = Vector((min(c[i] for c in coords) for i in range(3)))
    maxs = Vector((max(c[i] for c in coords) for i in range(3)))
    center = (mins + maxs) * 0.5
    return {
        "min": [round(v, 6) for v in mins],
        "max": [round(v, 6) for v in maxs],
        "center": [round(v, 6) for v in center],
        "size": [round(maxs[i] - mins[i], 6) for i in range(3)],
    }


def _mesh_materials(obj: bpy.types.Object) -> list[dict]:
    slots = []
    for slot in obj.material_slots:
        mat = slot.material
        if not mat:
            slots.append({"name": None})
            continue
        tex = None
        if mat.use_nodes and mat.node_tree:
            for node in mat.node_tree.nodes:
                if node.type == "TEX_IMAGE" and node.image:
                    tex = os.path.basename(bpy.path.abspath(node.image.filepath))
                    break
        slots.append({"name": mat.name, "texture": tex})
    return slots


def _ensure_imported_scene() -> None:
    meshes = [
        o for o in bpy.data.objects if o.type == "MESH" and any(o.name.startswith(p) for p in PART_PREFIXES)
    ]
    if len(meshes) >= 12:
        return
    path = blend_path("minifigkingleo00_imported.blend")
    if os.path.isfile(path):
        bpy.ops.wm.open_mainfile(filepath=path)


def main() -> None:
    _ensure_imported_scene()

    root = bpy.data.objects.get(ROOT_NAME)
    meshes = sorted(
        [
            o
            for o in bpy.data.objects
            if o.type == "MESH" and any(o.name.startswith(p) for p in PART_PREFIXES)
        ],
        key=lambda o: o.name,
    )

    parts = []
    for obj in meshes:
        prefix = obj.name.split("_", 1)[0]
        lca_num = int(prefix)
        mesh = obj.data
        parts.append(
            {
                "name": obj.name,
                "lca_object_number": lca_num,
                "parent": obj.parent.name if obj.parent else None,
                "vertex_count": len(mesh.vertices) if mesh else 0,
                "face_count": len(mesh.polygons) if mesh else 0,
                "world_bounds": _world_bounds(obj),
                "materials": _mesh_materials(obj),
            }
        )

    # Assembly checks (metres in Blender)
    by_num = {p["lca_object_number"]: p for p in parts}

    def gap_z(top_num: int, bottom_num: int, top_key: str, bottom_key: str) -> float | None:
        if top_num not in by_num or bottom_num not in by_num:
            return None
        return round(by_num[bottom_num]["world_bounds"][bottom_key][2] - by_num[top_num]["world_bounds"][top_key][2], 6)

    head_body_gap = gap_z(18, 20, "max", "min")  # body top vs head bottom on Z
    hips_body_gap = gap_z(8, 18, "max", "min")

    report = {
        "blender_scene": {
            "root": {
                "name": root.name if root else None,
                "location": list(root.location) if root else None,
                "rotation_euler": list(root.rotation_euler) if root else None,
            },
            "mesh_count": len(meshes),
            "parts": parts,
            "assembly_checks": {
                "head_to_body_gap_z": head_body_gap,
                "hips_to_body_gap_z": hips_body_gap,
                "left_leg_center_x": by_num.get(11, {}).get("world_bounds", {}).get("center", [None])[0],
                "right_leg_center_x": by_num.get(15, {}).get("world_bounds", {}).get("center", [None])[0],
                "assembled_ok": head_body_gap is not None and abs(head_body_gap) < 0.02,
            },
        }
    }

    print("---JSON---")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()