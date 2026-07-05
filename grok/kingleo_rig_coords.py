"""
King Leo rig joint math for the phase2 Blender scene.

Phase2 root rotation (90°, 0°, 180°) maps LCA +Y-up / -Z-forward into:
  - world UP    = -Y  (head at more negative Y)
  - world DOWN  = +Y  (feet toward Y ≈ 0)
  - world FWD   = +Z  (LCA -Z became +Z after the 180° yaw)

Bone edit positions must be in armature-local space (arm.matrix_world⁻¹).
"""

from __future__ import annotations

import math

import bpy
from mathutils import Vector

# LCA faced -Z; phase2 root Z=180° → character faces +Z in this scene.
WORLD_UP = Vector((0.0, -1.0, 0.0))
WORLD_FWD = Vector((0.0, 0.0, 1.0))
FACING_YAW_CORRECTION = math.pi


def world_bounds(obj: bpy.types.Object) -> tuple[Vector, Vector, Vector]:
    coords = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    mins = Vector((min(c[i] for c in coords) for i in range(3)))
    maxs = Vector((max(c[i] for c in coords) for i in range(3)))
    return mins, maxs, (mins + maxs) * 0.5


def find_part(num: int) -> bpy.types.Object:
    prefix = f"{num:03d}_"
    for obj in bpy.data.objects:
        if obj.type == "MESH" and obj.name.startswith(prefix):
            return obj
    raise KeyError(f"Missing mesh prefix {prefix}")


def world_to_arm(arm: bpy.types.Object, point: Vector) -> Vector:
    return arm.matrix_world.inverted() @ point


def _span_endpoints(
    mn: Vector, mx: Vector, ct: Vector, axis: str, head_toward_up: bool
) -> tuple[Vector, Vector]:
    idx = {"x": 0, "y": 1, "z": 2}[axis]
    lo = mn[idx]
    hi = mx[idx]
    head_val = lo if head_toward_up else hi
    tail_val = hi if head_toward_up else lo
    head = Vector(ct)
    tail = Vector(ct)
    head[idx] = head_val
    tail[idx] = tail_val
    if axis == "y":
        head.x, tail.x = ct.x, ct.x
        head.z, tail.z = ct.z, ct.z
    elif axis == "x":
        head.y, tail.y = ct.y, ct.y
        head.z, tail.z = ct.z, ct.z
    else:
        head.x, tail.x = ct.x, ct.x
        head.y, tail.y = ct.y, ct.y
    return head, tail


def pelvis_world() -> tuple[Vector, Vector]:
    mn, mx, ct = world_bounds(find_part(8))
    # Hips top (toward torso) is min Y; tail toward legs is max Y.
    return _span_endpoints(mn, mx, ct, "y", head_toward_up=True)


def spine_world() -> tuple[Vector, Vector]:
    hips = find_part(8)
    body = find_part(18)
    hmn, hmx, hct = world_bounds(hips)
    bmn, bmx, bct = world_bounds(body)
    head = Vector((hct.x, hmn.y, hct.z))
    tail = Vector((bct.x, bmn.y, bct.z))
    return head, tail


def head_world() -> tuple[Vector, Vector]:
    body = find_part(18)
    head = find_part(20)
    bmn, bmx, _ = world_bounds(body)
    hmn, hmx, hct = world_bounds(head)
    neck_y = (bmn.y + hmx.y) * 0.5
    return Vector((hct.x, neck_y, hct.z)), Vector((hct.x, hmn.y, hct.z))


def head_acc_world() -> tuple[Vector, Vector]:
    crown = find_part(23)
    mn, mx, ct = world_bounds(crown)
    return _span_endpoints(mn, mx, ct, "y", head_toward_up=True)


def leg_l_world() -> tuple[Vector, Vector]:
    hips = find_part(8)
    leg = find_part(11)
    hmn, hmx, _ = world_bounds(hips)
    lmn, lmx, lct = world_bounds(leg)
    hip_y = hmn.y + (hmx.y - hmn.y) * 0.55
    head = Vector((lmx.x, hip_y, lct.z))
    tail = Vector((lct.x, lmx.y, lct.z))
    return head, tail


def foot_l_world() -> tuple[Vector, Vector]:
    leg = find_part(11)
    foot = find_part(13)
    lmn, lmx, lct = world_bounds(leg)
    fmn, _, fct = world_bounds(foot)
    head = Vector((lct.x, lmx.y, lct.z))
    tail = Vector((fct.x, fmn.y, fct.z))
    return head, tail


def leg_r_world() -> tuple[Vector, Vector]:
    hips = find_part(8)
    leg = find_part(15)
    hmn, hmx, _ = world_bounds(hips)
    lmn, lmx, lct = world_bounds(leg)
    hip_y = hmn.y + (hmx.y - hmn.y) * 0.55
    head = Vector((lmn.x, hip_y, lct.z))
    tail = Vector((lct.x, lmx.y, lct.z))
    return head, tail


def foot_r_world() -> tuple[Vector, Vector]:
    leg = find_part(15)
    foot = find_part(17)
    lmn, lmx, lct = world_bounds(leg)
    fmn, _, fct = world_bounds(foot)
    head = Vector((lct.x, lmx.y, lct.z))
    tail = Vector((fct.x, fmn.y, fct.z))
    return head, tail


def arm_l_world() -> tuple[Vector, Vector]:
    body = find_part(18)
    arm = find_part(32)
    bmn, bmx, _ = world_bounds(body)
    almn, almx, alct = world_bounds(arm)
    shoulder_y = bmn.y + (bmx.y - bmn.y) * 0.08
    head = Vector((almx.x, shoulder_y, alct.z))
    tail = Vector((alct.x, almx.y, alct.z))
    return head, tail


def hand_l_world() -> tuple[Vector, Vector]:
    arm = find_part(32)
    hand = find_part(35)
    almn, almx, alct = world_bounds(arm)
    hmn, _, hct = world_bounds(hand)
    head = Vector((alct.x, almx.y, alct.z))
    tail = Vector((hct.x, hmn.y, hct.z))
    return head, tail


def arm_r_world() -> tuple[Vector, Vector]:
    body = find_part(18)
    arm = find_part(27)
    bmn, bmx, _ = world_bounds(body)
    armn, armx, arct = world_bounds(arm)
    shoulder_y = bmn.y + (bmx.y - bmn.y) * 0.08
    head = Vector((armn.x, shoulder_y, arct.z))
    tail = Vector((arct.x, armx.y, arct.z))
    return head, tail


def hand_r_world() -> tuple[Vector, Vector]:
    arm = find_part(27)
    hand = find_part(30)
    armn, armx, arct = world_bounds(arm)
    hmn, _, hct = world_bounds(hand)
    head = Vector((arct.x, armx.y, arct.z))
    tail = Vector((hct.x, hmn.y, hct.z))
    return head, tail


BONE_WORLD_FN = {
    "pelvis": pelvis_world,
    "spine": spine_world,
    "head": head_world,
    "head_acc": head_acc_world,
    "leg.L": leg_l_world,
    "foot.L": foot_l_world,
    "leg.R": leg_r_world,
    "foot.R": foot_r_world,
    "arm.L": arm_l_world,
    "hand.L": hand_l_world,
    "arm.R": arm_r_world,
    "hand.R": hand_r_world,
}


def bone_endpoints_world(bone_name: str) -> tuple[Vector, Vector]:
    fn = BONE_WORLD_FN.get(bone_name)
    if fn is None:
        raise ValueError(f"Unknown bone {bone_name}")
    return fn()


def apply_facing_roll(ebone: bpy.types.EditBone) -> None:
    """Yaw 180° so bone twist matches +Z-forward scene (LCA was -Z)."""
    ebone.roll += FACING_YAW_CORRECTION