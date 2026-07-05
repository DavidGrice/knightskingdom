"""Probe which local euler axis swings left foot toward +Z."""

from __future__ import annotations

import json
import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kingleo_blender_utils import ARMATURE_NAME, blend_path

bpy.ops.wm.open_mainfile(filepath=blend_path("minifigkingleo00_rigged.blend"))
arm = bpy.data.objects[ARMATURE_NAME]
foot = next(o for o in bpy.data.objects if o.name.startswith("013_"))
rest = foot.matrix_world.translation.copy()

bpy.ops.object.select_all(action="DESELECT")
arm.select_set(True)
bpy.context.view_layer.objects.active = arm
with bpy.context.temp_override(
    active_object=arm, object=arm, selected_objects=[arm], editable_objects=[arm]
):
    bpy.ops.object.mode_set(mode="POSE")
pb = arm.pose.bones["leg.L"]

rows = []
for axis, idx in (("X", 0), ("Y", 1), ("Z", 2)):
    for deg in (45, -45):
        pb.rotation_mode = "XYZ"
        pb.rotation_euler = [0.0, 0.0, 0.0]
        e = [0.0, 0.0, 0.0]
        e[idx] = math.radians(deg)
        pb.rotation_euler = e
        bpy.context.view_layer.update()
        d = foot.matrix_world.translation - rest
        rows.append(
            {
                "axis": axis,
                "deg": deg,
                "foot_delta": [round(d[i], 5) for i in range(3)],
                "dominant": "xyz"[max(range(3), key=lambda i: abs(d[i]))],
            }
        )

with bpy.context.temp_override(
    active_object=arm, object=arm, selected_objects=[arm], editable_objects=[arm]
):
    bpy.ops.object.mode_set(mode="OBJECT")
print(json.dumps(rows, indent=2))