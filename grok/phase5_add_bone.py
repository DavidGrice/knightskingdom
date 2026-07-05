"""
Phase 5 — Add one rig bone at a time (gated steps).

Set BONE_STEP=1..12 before running. Step 1 loads the imported blend;
later steps load the previous rig_step blend.

Bones use world-space mesh/LCA axis analysis (UP=-Y, FWD=+Z after phase2
root rotation) converted to armature-local coords, with 180° roll correction
for LCA -Z → scene +Z facing.

Run:
  python grok/run_blender_script.py grok/phase5_add_bone.py
"""

from __future__ import annotations

import json
import os
import sys

import bpy
from mathutils import Matrix, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kingleo_blender_utils import ARMATURE_NAME, ROOT_NAME, blend_path
from kingleo_rig_coords import (
    FACING_YAW_CORRECTION,
    WORLD_FWD,
    WORLD_UP,
    apply_facing_roll,
    bone_endpoints_world,
    world_to_arm,
)

BONE_STEP = int(os.environ.get("BONE_STEP", "1"))

STEPS = (
    {"step": 1, "bone": "pelvis", "mesh": 8, "parent": None},
    {"step": 2, "bone": "spine", "mesh": 18, "parent": "pelvis"},
    {"step": 3, "bone": "head", "mesh": 20, "parent": "spine"},
    {"step": 4, "bone": "head_acc", "mesh": 23, "parent": "head"},
    {"step": 5, "bone": "leg.L", "mesh": 11, "parent": "pelvis"},
    {"step": 6, "bone": "foot.L", "mesh": 13, "parent": "leg.L"},
    {"step": 7, "bone": "leg.R", "mesh": 15, "parent": "pelvis"},
    {"step": 8, "bone": "foot.R", "mesh": 17, "parent": "leg.R"},
    {"step": 9, "bone": "arm.L", "mesh": 32, "parent": "spine"},
    {"step": 10, "bone": "hand.L", "mesh": 35, "parent": "arm.L"},
    {"step": 11, "bone": "arm.R", "mesh": 27, "parent": "spine"},
    {"step": 12, "bone": "hand.R", "mesh": 30, "parent": "arm.R"},
)


def _find_part(num: int) -> bpy.types.Object:
    prefix = f"{num:03d}_"
    for obj in bpy.data.objects:
        if obj.type == "MESH" and obj.name.startswith(prefix):
            return obj
    raise KeyError(f"Missing mesh prefix {prefix}")


def _parent_keep_world(mesh: bpy.types.Object, arm: bpy.types.Object, bone_name: str) -> Matrix:
    world = mesh.matrix_world.copy()
    mesh.parent = arm
    mesh.parent_type = "BONE"
    mesh.parent_bone = bone_name
    mesh.matrix_world = world
    return world


def _matrix_near(a: Matrix, b: Matrix, eps: float = 1e-5) -> bool:
    return max(abs(a[i][j] - b[i][j]) for i in range(4) for j in range(4)) < eps


def _load_source_blend(step: int) -> str:
    if step == 1:
        return blend_path("minifigkingleo00_imported.blend")
    return blend_path(f"minifigkingleo00_rig_step_{step - 1:02d}.blend")


def _output_blend(step: int) -> str:
    return blend_path(f"minifigkingleo00_rig_step_{step:02d}.blend")


def _activate(obj: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.context.view_layer.update()


def _get_or_create_armature(root: bpy.types.Object) -> bpy.types.Object:
    arm = bpy.data.objects.get(ARMATURE_NAME)
    if arm:
        return arm

    arm_data = bpy.data.armatures.new(ARMATURE_NAME)
    arm_obj = bpy.data.objects.new(ARMATURE_NAME, arm_data)
    bpy.context.collection.objects.link(arm_obj)
    arm_obj.parent = root
    arm_obj.show_in_front = True
    _activate(arm_obj)
    return arm_obj


def _add_bone(
    arm: bpy.types.Object,
    name: str,
    head_world: Vector,
    tail_world: Vector,
    parent: str | None,
) -> dict:
    bpy.context.view_layer.update()
    head_local = world_to_arm(arm, head_world)
    tail_local = world_to_arm(arm, tail_world)

    _activate(arm)
    override = {
        "active_object": arm,
        "object": arm,
        "selected_objects": [arm],
        "editable_objects": [arm],
    }
    with bpy.context.temp_override(**override):
        if bpy.context.active_object and bpy.context.active_object.mode != "OBJECT":
            bpy.ops.object.mode_set(mode="OBJECT")
        bpy.ops.object.mode_set(mode="EDIT")
        eb = arm.data.edit_bones
        if name in eb:
            bpy.ops.object.mode_set(mode="OBJECT")
            raise RuntimeError(f"Bone {name} already exists — wrong BONE_STEP?")
        bone = eb.new(name)
        bone.head = head_local
        bone.tail = tail_local
        if parent:
            bone.parent = eb[parent]
        apply_facing_roll(bone)
        bpy.ops.object.mode_set(mode="OBJECT")

    head_back = arm.matrix_world @ head_local
    tail_back = arm.matrix_world @ tail_local
    return {
        "head_world": list(head_world),
        "tail_world": list(tail_world),
        "head_world_roundtrip": list(head_back),
        "tail_world_roundtrip": list(tail_back),
        "bone_vector_world": list(tail_back - head_back),
        "facing_roll_rad": FACING_YAW_CORRECTION,
    }


def main() -> None:
    if BONE_STEP < 1 or BONE_STEP > 12:
        raise ValueError(f"BONE_STEP must be 1..12, got {BONE_STEP}")

    step_cfg = STEPS[BONE_STEP - 1]
    source = _load_source_blend(BONE_STEP)
    if not os.path.isfile(source):
        raise FileNotFoundError(source)

    bpy.ops.wm.open_mainfile(filepath=source)
    bpy.context.view_layer.update()

    root = bpy.data.objects.get(ROOT_NAME)
    if not root:
        raise RuntimeError(f"Missing root empty {ROOT_NAME}")

    mesh = _find_part(step_cfg["mesh"])
    world_before = mesh.matrix_world.copy()
    rot_before = mesh.rotation_euler.copy()

    arm = _get_or_create_armature(root)
    head_w, tail_w = bone_endpoints_world(step_cfg["bone"])
    bone_info = _add_bone(arm, step_cfg["bone"], head_w, tail_w, step_cfg["parent"])
    _parent_keep_world(mesh, arm, step_cfg["bone"])

    world_preserved = _matrix_near(world_before, mesh.matrix_world)
    rot_delta = max(abs(mesh.rotation_euler[i] - rot_before[i]) for i in range(3))

    out = _output_blend(BONE_STEP)
    _activate(arm)
    bpy.ops.wm.save_as_mainfile(filepath=out)

    final_out = None
    if BONE_STEP == 12:
        final_out = blend_path("minifigkingleo00_rigged.blend")
        bpy.ops.wm.save_as_mainfile(filepath=final_out)

    report = {
        "phase": 5,
        "bone_step": BONE_STEP,
        "bone": step_cfg["bone"],
        "mesh": mesh.name,
        "parent_bone": step_cfg["parent"],
        "scene_axes": {
            "world_up": list(WORLD_UP),
            "world_fwd": list(WORLD_FWD),
            "note": "LCA -Z forward → phase2 +Z; roll += pi on each bone",
        },
        "bone_placement": bone_info,
        "bones_in_rig": [b.name for b in arm.data.bones],
        "meshes_rigged": [
            o.name
            for o in bpy.data.objects
            if o.type == "MESH" and o.parent == arm and o.parent_type == "BONE"
        ],
        "world_transform_preserved": world_preserved,
        "mesh_rotation_delta_rad": round(rot_delta, 6),
        "loaded": source,
        "saved": out,
    }
    if final_out:
        report["final_saved"] = final_out
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()