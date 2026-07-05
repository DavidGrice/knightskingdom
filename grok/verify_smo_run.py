"""Sample anim_c_run keyframes and check parts stay connected."""

from __future__ import annotations

import json
import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kingleo_blender_utils import ARMATURE_NAME, blend_path

BLEND = blend_path("minifigkingleo00_run_anim.blend")


def _gap_y(mesh_a, mesh_b, top="max", bottom="min"):
    ca = [mesh_a.matrix_world @ Vector(c) for c in mesh_a.bound_box]
    cb = [mesh_b.matrix_world @ Vector(c) for c in mesh_b.bound_box]
    ya = max(c.y for c in ca) if top == "max" else min(c.y for c in ca)
    yb = max(c.y for c in cb) if bottom == "max" else min(c.y for c in cb)
    return abs(yb - ya)


arm = bpy.data.objects.get(ARMATURE_NAME)
if not arm:
    raise RuntimeError("missing armature")

meshes = [o for o in bpy.data.objects if o.type == "MESH" and o.parent == arm]
by_prefix = {o.name.split("_")[0]: o for o in meshes}
hips = by_prefix["008"]
body = by_prefix["018"]
head = by_prefix["020"]
leg_l = by_prefix["011"]

foot_l = by_prefix["013"]
foot_rest = foot_l.matrix_world.translation.copy()

frames = [1, 6, 11, 16, 21]
rows = []

for f in frames:
    bpy.context.scene.frame_set(f)
    bpy.context.view_layer.update()
    pb = arm.pose.bones
    foot_pos = foot_l.matrix_world.translation
    foot_delta = foot_pos - foot_rest
    rows.append(
        {
            "frame": f,
            "pelvis_loc": [round(v, 5) for v in arm.pose.bones["pelvis"].location],
            "foot_delta_xyz": [round(foot_delta[i], 5) for i in range(3)],
            "head_body_gap_y": round(_gap_y(body, head, "max", "min"), 5),
            "hips_leg_gap_y": round(_gap_y(hips, leg_l, "min", "max"), 5),
            "assembled_ok": _gap_y(body, head, "max", "min") < 0.025,
            "stride_mostly_z": abs(foot_delta.z) >= abs(foot_delta.y),
        }
    )

print(
    json.dumps(
        {
            "blend": BLEND,
            "frame_end": bpy.context.scene.frame_end,
            "samples": rows,
            "all_assembled": all(r["assembled_ok"] for r in rows),
            "stride_on_z": all(r["stride_mostly_z"] for r in rows if r["frame"] > 1),
        },
        indent=2,
    )
)