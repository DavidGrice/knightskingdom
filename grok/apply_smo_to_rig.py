"""
Apply a retail .smo clip to the King Leo armature (pose bones).

Uses SMO rotation semantics from smo_pose_test / io_import_lca:
  brees_x = -rot[4], brees_y = -rot[3], brees_z = +rot[5]
applied as bone-local Euler deltas from frame 0.

Run:
  python grok/run_blender_script.py grok/apply_smo_to_rig.py SMO_PATH=...
Default SMO: game install anim_c_run.smo
"""

from __future__ import annotations

import json
import math
import os
import sys

import bpy

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOLS = os.path.join(ROOT, "resources", "model_files", "tools")
sys.path.insert(0, TOOLS)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

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
VRT_TO_M = 1e-3  # 1000 VRT units = 1 mm → metres

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


def _rot_delta_to_euler(track: str, delta: list[float]) -> tuple[float, float, float]:
    """SMO rot degrees delta [r3,r4,r5] → bone XYZ euler radians."""
    r3, r4, r5 = delta
    # Leg swing lives in SMO rot[1] (r4). Our leg bones run +Y with roll π:
    # forward/back stride maps to local Z rotation.
    if track in ("leftleg", "rightleg"):
        # Forward/back stride: rotate about local X (matches leg_lift test).
        return (math.radians(-r4), 0.0, math.radians(r5))
    if track in ("leftfoot", "rightfoot"):
        return (math.radians(-r4), 0.0, math.radians(r5))
    if track in ("leftarm", "rightarm"):
        return (math.radians(-r3), math.radians(-r4), math.radians(r5))
    if track in ("lefthand", "righthand"):
        return (0.0, 0.0, math.radians(r5))
    # hips / body / head — bearing + pitch from SMO
    return (math.radians(-r4), math.radians(-r3), math.radians(r5))


def _pos_delta_to_loc(track: str, delta: list[float]) -> tuple[float, float, float]:
    """SMO position delta (VRT) → pose bone location metres in our scene."""
    dx, dy, dz = (delta[0] * VRT_TO_M, delta[1] * VRT_TO_M, delta[2] * VRT_TO_M)
    if track == "hips":
        # LCA +Y up → phase2 scene: vertical bob mostly on world Y.
        return (dx, -dy, dz)
    return (dx, -dy, dz)


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
    bpy.context.scene.render.fps = fps

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
        pb.rotation_mode = "XYZ"
        rest_rot = tr["frames"][0]["rot"]
        rest_pos = tr["frames"][0]["pos"]

        for i, fr in enumerate(tr["frames"]):
            frame = 1 + i * step
            drot = [fr["rot"][j] - rest_rot[j] for j in range(3)]
            dpos = [fr["pos"][j] - rest_pos[j] for j in range(3)]

            pb.rotation_euler = _rot_delta_to_euler(track, drot)
            if track in ("hips", "body"):
                pb.location = _pos_delta_to_loc(track, dpos)
            else:
                pb.location = (0.0, 0.0, 0.0)

            pb.keyframe_insert(data_path="rotation_euler", frame=frame)
            if track in ("hips", "body"):
                pb.keyframe_insert(data_path="location", frame=frame)

        mapped.append({"track": track, "bone": bone_name, "keys": len(tr["frames"])})

    with _arm_override(arm):
        bpy.ops.object.mode_set(mode="OBJECT")

    bpy.context.scene.frame_set(1)
    _activate_arm(arm)
    bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)

    report = {
        "clip": clip_name,
        "smo_path": smo_path,
        "frames": nframes,
        "fps": fps,
        "step": step,
        "mapped": mapped,
        "missing_tracks": missing,
        "saved": OUT_BLEND,
        "note": "Open timeline and play — legs should swing ±76° on run cycle",
    }
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()