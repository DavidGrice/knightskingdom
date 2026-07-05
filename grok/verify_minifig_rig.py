"""Verify minifig rig assembly — parts should stay connected, not float."""
import json
import math

import bpy
from mathutils import Vector

ARMATURE_NAME = "minifigkingleo00_rig"
ROOT_NAME = "minifigkingleo00"
BLEND_OUT = bpy.path.abspath("//minifigkingleo00_rigged.blend")


def _bounds(obj):
    coords = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    mn = Vector((min(c[i] for c in coords) for i in range(3)))
    mx = Vector((max(c[i] for c in coords) for i in range(3)))
    return mn, mx, (mn + mx) * 0.5


arm = bpy.data.objects.get(ARMATURE_NAME)
root = bpy.data.objects.get(ROOT_NAME)
if not arm:
    raise RuntimeError(f"Missing {ARMATURE_NAME}")

meshes = [o for o in bpy.data.objects if o.type == "MESH" and o.parent == arm and o.parent_type == "BONE"]
centers = {o.name: list(_bounds(o)[2]) for o in meshes}

# Gap check: head bottom should be near body top
body = next(o for o in meshes if o.name.startswith("018_"))
head = next(o for o in meshes if o.name.startswith("020_"))
hips = next(o for o in meshes if o.name.startswith("008_"))
_, body_mx, _ = _bounds(body)
head_mn, _, _ = _bounds(head)
_, hips_mx, _ = _bounds(hips)

head_body_gap = abs(head_mn.z - body_mx.z)
hips_body_gap = abs(hips_mx.z - _bounds(hips)[0].z)  # sanity

report = {
    "mesh_count": len(meshes),
    "bones": [b.name for b in arm.data.bones],
    "mesh_bone_parents": {o.name: o.parent_bone for o in meshes},
    "centers": centers,
    "head_body_gap_z": round(head_body_gap, 5),
    "assembled_ok": head_body_gap < 0.02,
}

# Light test pose
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode="POSE")
pose = arm.pose.bones
if "arm.R" in pose:
    pose["arm.R"].rotation_mode = "XYZ"
    pose["arm.R"].rotation_euler = (0.0, math.radians(30), 0.0)
if "head" in pose:
    pose["head"].rotation_mode = "XYZ"
    pose["head"].rotation_euler = (math.radians(8), 0.0, 0.0)
bpy.ops.object.mode_set(mode="OBJECT")

if BLEND_OUT.startswith("//"):
    out = bpy.path.abspath(BLEND_OUT)
else:
    out = BLEND_OUT
bpy.ops.wm.save_as_mainfile(filepath=out)
report["saved"] = out
report["test_pose"] = "arm.R +30deg Y, head +8deg X"
print(json.dumps(report, indent=2))