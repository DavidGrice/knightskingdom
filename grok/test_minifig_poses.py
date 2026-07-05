"""
Apply simple pose tests to the King Leo rig and save one blend per pose.

Run: python grok/run_blender_script.py grok/test_minifig_poses.py
"""

from __future__ import annotations

import json
import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kingleo_blender_utils import ARMATURE_NAME, blend_path

RIGGED = blend_path("minifigkingleo00_rigged.blend")
OUT_DIR = blend_path("pose_tests")


def _activate_arm(arm: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.context.view_layer.update()


def _mesh_centers(arm: bpy.types.Object) -> dict[str, list[float]]:
    out = {}
    for obj in bpy.data.objects:
        if obj.type != "MESH" or obj.parent != arm or obj.parent_type != "BONE":
            continue
        coords = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
        center = Vector(
            (
                sum(c[i] for c in coords) / 8.0
                for i in range(3)
            )
        )
        out[obj.name] = [round(v, 6) for v in center]
    return out


def _gap_head_body(arm: bpy.types.Object) -> float:
    meshes = [o for o in bpy.data.objects if o.type == "MESH" and o.parent == arm]
    body = next(o for o in meshes if o.name.startswith("018_"))
    head = next(o for o in meshes if o.name.startswith("020_"))
    body_coords = [body.matrix_world @ Vector(c) for c in body.bound_box]
    head_coords = [head.matrix_world @ Vector(c) for c in head.bound_box]
    body_top_y = max(c.y for c in body_coords)
    head_bot_y = min(c.y for c in head_coords)
    return round(abs(head_bot_y - body_top_y), 6)


def _with_arm_edit(arm: bpy.types.Object):
    _activate_arm(arm)
    return bpy.context.temp_override(
        active_object=arm,
        object=arm,
        selected_objects=[arm],
        editable_objects=[arm],
    )


def _apply_pose(arm: bpy.types.Object, pose_name: str) -> None:
    with _with_arm_edit(arm):
        if bpy.context.active_object and bpy.context.active_object.mode != "OBJECT":
            bpy.ops.object.mode_set(mode="OBJECT")
        bpy.ops.object.mode_set(mode="POSE")
    pb = arm.pose.bones

    for bone in pb:
        bone.rotation_mode = "XYZ"
        bone.rotation_euler = (0.0, 0.0, 0.0)
        bone.location = (0.0, 0.0, 0.0)

    if pose_name == "rest":
        pass
    elif pose_name == "wave_right":
        pb["arm.R"].rotation_euler = (math.radians(-20), math.radians(55), math.radians(10))
        pb["hand.R"].rotation_euler = (0.0, 0.0, math.radians(15))
    elif pose_name == "wave_left":
        pb["arm.L"].rotation_euler = (math.radians(-20), math.radians(-55), math.radians(-10))
        pb["hand.L"].rotation_euler = (0.0, 0.0, math.radians(-15))
    elif pose_name == "head_look":
        pb["head"].rotation_euler = (math.radians(12), math.radians(25), 0.0)
        pb["head_acc"].rotation_euler = (math.radians(8), math.radians(20), 0.0)
    elif pose_name == "leg_lift_left":
        pb["leg.L"].rotation_euler = (math.radians(35), 0.0, 0.0)
        pb["foot.L"].rotation_euler = (math.radians(-20), 0.0, 0.0)
    elif pose_name == "leg_lift_right":
        pb["leg.R"].rotation_euler = (math.radians(35), 0.0, 0.0)
        pb["foot.R"].rotation_euler = (math.radians(-20), 0.0, 0.0)
    elif pose_name == "walk_mid":
        pb["leg.L"].rotation_euler = (math.radians(30), 0.0, 0.0)
        pb["foot.L"].rotation_euler = (math.radians(-15), 0.0, 0.0)
        pb["leg.R"].rotation_euler = (math.radians(-25), 0.0, 0.0)
        pb["foot.R"].rotation_euler = (math.radians(10), 0.0, 0.0)
        pb["arm.L"].rotation_euler = (math.radians(10), math.radians(-25), 0.0)
        pb["arm.R"].rotation_euler = (math.radians(10), math.radians(25), 0.0)
    elif pose_name == "bow":
        pb["spine"].rotation_euler = (math.radians(18), 0.0, 0.0)
        pb["head"].rotation_euler = (math.radians(10), 0.0, 0.0)
        pb["arm.L"].rotation_euler = (math.radians(5), math.radians(-35), 0.0)
        pb["arm.R"].rotation_euler = (math.radians(5), math.radians(35), 0.0)
    else:
        raise ValueError(pose_name)

    with _with_arm_edit(arm):
        bpy.ops.object.mode_set(mode="OBJECT")


POSES = (
    "rest",
    "wave_right",
    "wave_left",
    "head_look",
    "leg_lift_left",
    "leg_lift_right",
    "walk_mid",
    "bow",
)


def main() -> None:
    if not os.path.isfile(RIGGED):
        raise FileNotFoundError(RIGGED)

    os.makedirs(OUT_DIR, exist_ok=True)
    bpy.ops.wm.open_mainfile(filepath=RIGGED)
    arm = bpy.data.objects.get(ARMATURE_NAME)
    if not arm:
        raise RuntimeError(f"Missing {ARMATURE_NAME}")

    rest_centers = _mesh_centers(arm)
    results = []

    for pose_name in POSES:
        bpy.ops.wm.open_mainfile(filepath=RIGGED)
        arm = bpy.data.objects[ARMATURE_NAME]
        _apply_pose(arm, pose_name)

        centers = _mesh_centers(arm)
        max_drift = 0.0
        for name, rest in rest_centers.items():
            cur = centers.get(name)
            if not cur:
                continue
            drift = math.sqrt(sum((cur[i] - rest[i]) ** 2 for i in range(3)))
            max_drift = max(max_drift, drift)

        out_blend = os.path.join(OUT_DIR, f"minifigkingleo00_pose_{pose_name}.blend")
        _activate_arm(arm)
        bpy.ops.wm.save_as_mainfile(filepath=out_blend)

        results.append(
            {
                "pose": pose_name,
                "head_body_gap_y": _gap_head_body(arm),
                "max_center_drift_m": round(max_drift, 6),
                "parts_connected": max_drift < 0.05,
                "saved": out_blend,
            }
        )

    summary = {
        "source": RIGGED,
        "pose_count": len(results),
        "poses": results,
        "all_connected": all(p["parts_connected"] for p in results),
    }
    report_path = os.path.join(OUT_DIR, "pose_test_report.json")
    with open(report_path, "w", encoding="utf-8") as fh:
        json.dump(summary, fh, indent=2)

    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()