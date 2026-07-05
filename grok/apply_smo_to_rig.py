"""
Apply a retail .smo clip to the King Leo armature (pose bones).

VRT (+Y up, −Z forward) → phase2 Blender (−Y up, +Z forward).
Leg stride uses local Y rotation (probed: swings foot along ±Z).
Pelvis gets a small vertical bob only; torso stays upright on run clips.

Run:
  python grok/run_blender_script.py grok/apply_smo_to_rig.py
"""

from __future__ import annotations

import json
import math
import os
import sys

import bpy
from mathutils import Matrix, Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOLS = os.path.join(ROOT, "resources", "model_files", "tools")
sys.path.insert(0, TOOLS)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from export_obj import rot_from_brees  # noqa: E402
from smo_parser import parse_smo  # noqa: E402
from kingleo_blender_utils import ARMATURE_NAME, blend_path

DEFAULT_SMO = os.path.join(
    os.environ.get("KK_GAME", r"C:\Program Files (x86)\LEGO Media\Constructive"),
    "LEGO Creator Knights Kingdom",
    "Animation Files",
    "anim_c_run.smo",
)
RIGGED = blend_path("minifigkingleo00_rigged.blend")
OUT_BLEND = blend_path("minifigkingleo00_run_anim.blend")

TICKS_PER_SEC = 20.0
VRT_TO_M = 1e-6  # 1000 VRT units = 1 mm

TRACK_TO_BONE = {
    "hips": "pelvis",
    "body": "spine",
    "head": "head",
    "leftarm": "arm.L",
    "rightarm": "arm.R",
    "lefthand": "hand.L",
    "righthand": "hand.R",
    "leftleg": "leg.L",
    "rightleg": "leg.R",
    "leftfoot": "foot.L",
    "rightfoot": "foot.R",
}

# VRT (+Y, −Z) → world (−Y, +Z)
S_SCENE = Matrix(((1.0, 0.0, 0.0), (0.0, -1.0, 0.0), (0.0, 0.0, -1.0)))
DEG2BREE = 65536.0 / 360.0

LEG_TRACKS = frozenset({"leftleg", "rightleg"})
UPRIGHT_TRACKS = frozenset({"hips", "body"})  # no smo tilt — stay standing


def _smo_path() -> str:
    for arg in sys.argv[1:]:
        if arg.startswith("SMO_PATH="):
            return arg.split("=", 1)[1]
    return os.environ.get("SMO_PATH", DEFAULT_SMO)


def _activate_arm(arm: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.context.view_layer.update()


def _arm_override(arm: bpy.types.Object):
    _activate_arm(arm)
    return bpy.context.temp_override(
        active_object=arm,
        object=arm,
        selected_objects=[arm],
        editable_objects=[arm],
    )


def _smo_rot_matrix(r3: float, r4: float, r5: float) -> Matrix:
    brees = [-r4 * DEG2BREE, -r3 * DEG2BREE, r5 * DEG2BREE]
    return Matrix(rot_from_brees(brees))


def _scene_delta_rot(rot: list[float], rest_rot: list[float]) -> Matrix:
    rvrt = _smo_rot_matrix(rot[0], rot[1], rot[2])
    r0 = _smo_rot_matrix(rest_rot[0], rest_rot[1], rest_rot[2])
    dvrt = rvrt @ r0.inverted()
    return S_SCENE @ dvrt @ S_SCENE.transposed()


def _bone_local_delta(scene_delta: Matrix, bone_name: str, arm: bpy.types.Object) -> Matrix:
    rest = arm.pose.bones[bone_name].bone.matrix_local.to_3x3()
    return rest.inverted() @ scene_delta @ rest


def _scene_pos_delta(delta_vrt: list[float]) -> Vector:
    v = Vector([delta_vrt[i] * VRT_TO_M for i in range(3)])
    return S_SCENE @ v


def _leg_euler(fr_rot: list[float], rest_rot: list[float]) -> tuple[float, float, float]:
    """SMO pitch r4 → local Y rotation (stride along ±Z in world)."""
    d4 = fr_rot[1] - rest_rot[1]
    d5 = fr_rot[2] - rest_rot[2]
    return (0.0, math.radians(-d4), math.radians(d5))


def _apply_track_pose(
    pb: bpy.types.Object,
    track: str,
    bone_name: str,
    arm: bpy.types.Object,
    fr_rot: list[float],
    rest_rot: list[float],
    dpos: list[float],
) -> None:
    if track in LEG_TRACKS:
        pb.rotation_mode = "XYZ"
        pb.rotation_euler = _leg_euler(fr_rot, rest_rot)
        pb.location = Vector((0.0, 0.0, 0.0))
        return

    if track in UPRIGHT_TRACKS:
        pb.rotation_mode = "QUATERNION"
        pb.rotation_quaternion = (1.0, 0.0, 0.0, 0.0)
        if track == "hips":
            pb.location = _scene_pos_delta(dpos)
        else:
            pb.location = Vector((0.0, 0.0, 0.0))
        return

    if track in ("leftfoot", "rightfoot"):
        pb.rotation_mode = "QUATERNION"
        pb.rotation_quaternion = (1.0, 0.0, 0.0, 0.0)
        pb.location = Vector((0.0, 0.0, 0.0))
        return

    pb.rotation_mode = "QUATERNION"
    scene_d = _scene_delta_rot(fr_rot, rest_rot)
    local_d = _bone_local_delta(scene_d, bone_name, arm)
    pb.rotation_quaternion = local_d.to_quaternion()
    pb.location = Vector((0.0, 0.0, 0.0))


def main() -> None:
    smo_path = _smo_path()
    if not os.path.isfile(smo_path):
        raise FileNotFoundError(smo_path)
    if not os.path.isfile(RIGGED):
        raise FileNotFoundError(RIGGED)

    clip = parse_smo(smo_path)
    nframes = clip["num_frames"]
    bpy.ops.wm.open_mainfile(filepath=RIGGED)

    arm = bpy.data.objects.get(ARMATURE_NAME)
    if not arm:
        raise RuntimeError(f"Missing {ARMATURE_NAME}")

    clip_name = os.path.splitext(os.path.basename(smo_path))[0]
    if arm.animation_data is None:
        arm.animation_data_create()
    action = bpy.data.actions.new(f"{clip_name}_rig")
    arm.animation_data.action = action

    fps = bpy.context.scene.render.fps or 25
    step = fps / TICKS_PER_SEC
    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = int(1 + (nframes - 1) * step) + 1

    mapped = []
    missing = []

    with _arm_override(arm):
        bpy.ops.object.mode_set(mode="POSE")

    for tr in clip["tracks"]:
        track = tr["name"]
        bone_name = TRACK_TO_BONE.get(track)
        if not bone_name or bone_name not in arm.pose.bones:
            missing.append(track)
            continue

        pb = arm.pose.bones[bone_name]
        rest_rot = tr["frames"][0]["rot"]
        rest_pos = tr["frames"][0]["pos"]

        for i, fr in enumerate(tr["frames"]):
            frame = 1 + i * step
            dpos = [fr["pos"][j] - rest_pos[j] for j in range(3)]
            _apply_track_pose(pb, track, bone_name, arm, fr["rot"], rest_rot, dpos)

            if pb.rotation_mode == "QUATERNION":
                pb.keyframe_insert(data_path="rotation_quaternion", frame=frame)
            else:
                pb.keyframe_insert(data_path="rotation_euler", frame=frame)
            if track == "hips":
                pb.keyframe_insert(data_path="location", frame=frame)

        mapped.append({"track": track, "bone": bone_name, "keys": len(tr["frames"])})

    with _arm_override(arm):
        bpy.ops.object.mode_set(mode="OBJECT")

    bpy.context.scene.frame_set(1)
    _activate_arm(arm)
    bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)

    report = {
        "clip": clip_name,
        "frames": nframes,
        "space_fix": "legs: local Y from SMO r4; torso upright; hips bob 1e-6",
        "mapped": mapped,
        "missing_tracks": missing,
        "saved": OUT_BLEND,
    }
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()