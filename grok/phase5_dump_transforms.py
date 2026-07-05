"""Dump mesh origins, world matrices, and armature state for rig debugging."""

from __future__ import annotations

import json
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kingleo_blender_utils import ARMATURE_NAME, ROOT_NAME, blend_path

BLEND = blend_path("minifigkingleo00_rig_step_01.blend")


def _bounds(obj):
    coords = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    mn = Vector((min(c[i] for c in coords) for i in range(3)))
    mx = Vector((max(c[i] for c in coords) for i in range(3)))
    return [list(mn), list(mx), list((mn + mx) * 0.5)]


bpy.ops.wm.open_mainfile(filepath=BLEND)

root = bpy.data.objects.get(ROOT_NAME)
arm = bpy.data.objects.get(ARMATURE_NAME)

rows = []
for obj in sorted(bpy.data.objects, key=lambda o: o.name):
    if obj.type != "MESH":
        continue
    rows.append(
        {
            "name": obj.name,
            "parent": obj.parent.name if obj.parent else None,
            "parent_bone": obj.parent_bone if obj.parent_type == "BONE" else None,
            "location": list(obj.location),
            "rotation_euler": list(obj.rotation_euler),
            "world_center": _bounds(obj)[2],
            "world_bounds": _bounds(obj)[:2],
        }
    )

bones = []
if arm:
    for b in arm.data.bones:
        hb = arm.matrix_world @ Vector(b.head_local)
        tb = arm.matrix_world @ Vector(b.tail_local)
        bones.append(
            {
                "name": b.name,
                "head_world": list(hb),
                "tail_world": list(tb),
                "vector_world": list(tb - hb),
                "matrix": [list(row) for row in (arm.matrix_world @ b.matrix_local).to_3x3()],
            }
        )

print(
    json.dumps(
        {
            "blend": BLEND,
            "root": {
                "location": list(root.location) if root else None,
                "rotation_euler": list(root.rotation_euler) if root else None,
            },
            "armature": {
                "location": list(arm.location) if arm else None,
                "rotation_euler": list(arm.rotation_euler) if arm else None,
                "parent": arm.parent.name if arm and arm.parent else None,
            },
            "bones": bones,
            "meshes": rows,
        },
        indent=2,
    )
)