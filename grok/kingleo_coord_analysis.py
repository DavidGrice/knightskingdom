"""
Compare LCA joint frames → OBJ → Blender (phase2 root) vs imported mesh bounds.

Run: python grok/kingleo_coord_analysis.py
"""

from __future__ import annotations

import json
import math
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOLS = os.path.join(ROOT, "resources", "model_files", "tools")
GROK = os.path.join(ROOT, "grok")
sys.path.insert(0, TOOLS)

from export_obj import build_tree, mat_identity, mat_mul, mat_vec, rot_from_brees  # noqa: E402
from lca_parser import parse_lca  # noqa: E402

LCA = os.path.join(
    ROOT,
    "resources",
    "model_files",
    "extracted",
    "pak",
    "warehouse",
    "main_interface",
    "minifigures_animals",
    "minifigkingleo00.lca",
)
SCENE = os.path.join(GROK, "kingleo00_scene_analysis.json")
SCALE = 0.001  # mm per VRT unit (100 VRT = 1mm)


def euler_xyz_matrix(rx: float, ry: float, rz: float) -> list[list[float]]:
    """Blender object.rotation_euler XYZ (intrinsic) as 3x3."""
    cx, sx = math.cos(rx), math.sin(rx)
    cy, sy = math.cos(ry), math.sin(ry)
    cz, sz = math.cos(rz), math.sin(rz)
    rx_m = [[1, 0, 0], [0, cx, -sx], [0, sx, cx]]
    ry_m = [[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]]
    rz_m = [[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]]
    return mat_mul(rz_m, mat_mul(ry_m, rx_m))


def mat4_from_r_t(r: list[list[float]], t: list[float]) -> list[list[float]]:
    return [
        [r[0][0], r[0][1], r[0][2], t[0]],
        [r[1][0], r[1][1], r[1][2], t[1]],
        [r[2][0], r[2][1], r[2][2], t[2]],
        [0.0, 0.0, 0.0, 1.0],
    ]


def mat4_mul(a, b):
    out = [[0.0] * 4 for _ in range(4)]
    for i in range(4):
        for j in range(4):
            out[i][j] = sum(a[i][k] * b[k][j] for k in range(4))
    return out


def mat4_vec(m, v):
    x = m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2] + m[0][3]
    y = m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2] + m[1][3]
    z = m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2] + m[2][3]
    return [x, y, z]


def walk_lca_frames(ob, p_m, p_t, out: dict[int, dict]) -> None:
    rot = ob.get("rot")
    if rot and any(rot["brees"]):
        r = rot_from_brees(rot["brees"])
        c = rot["center"]
    else:
        r, c = mat_identity(), [0, 0, 0]
    base = [ob["pos"][i] + c[i] - mat_vec(r, c)[i] for i in range(3)]
    m = mat_mul(p_m, r)
    t = [p_t[i] + mat_vec(p_m, base)[i] for i in range(4 - 1)]
    num = ob["number"]
    out[num] = {
        "pos_vrt": list(t),
        "rot_center_vrt": list(c),
        "brees": list(rot["brees"]) if rot else [0, 0, 0],
        "size_vrt": list(ob["size"]),
    }
    for ch in ob.get("children", []):
        walk_lca_frames(ch, m, t, out)


def vrt_to_obj_mm(v: list[float]) -> list[float]:
    return [v[0] * SCALE, -v[1] * SCALE, v[2] * SCALE]


def obj_mm_to_blender_m(v: list[float], root_z_offset: float = 0.0) -> list[float]:
    """OBJ mm coords → metres, then phase2 root RotX90 RotZ180, then ground drop."""
    p = [v[0] * 0.001, v[1] * 0.001, v[2] * 0.001]
    r = euler_xyz_matrix(math.radians(90), 0.0, math.radians(180))
    m4 = mat4_from_r_t(r, [0.0, 0.0, root_z_offset])
    return mat4_vec(m4, p)


def main() -> None:
    r = parse_lca(LCA)
    objs = r["wld"]["objects"]
    build_tree(objs)
    root = dict(objs[0], pos=[0, 0, 0])

    frames: dict[int, dict] = {}
    walk_lca_frames(root, mat_identity(), [0.0, 0.0, 0.0], frames)

    with open(SCENE, encoding="utf-8") as fh:
        scene = json.load(fh)

    root_loc = scene["blender"]["blender_scene"]["root"]["location"]
    root_z = root_loc[2]

    key_nums = (7, 8, 10, 11, 13, 14, 15, 17, 18, 19, 20, 23, 26, 27, 30, 31, 32, 35)
    rows = []
    for num in key_nums:
        if num not in frames:
            continue
        fr = frames[num]
        obj_mm = vrt_to_obj_mm(fr["pos_vrt"])
        bpy = obj_mm_to_blender_m(obj_mm, root_z)
        part = next(
            (p for p in scene["blender"]["blender_scene"]["parts"] if p["lca_object_number"] == num),
            None,
        )
        center = part["world_bounds"]["center"] if part else None
        rows.append(
            {
                "lca": num,
                "brees": fr["brees"],
                "vrt_pos": [round(x, 1) for x in fr["pos_vrt"]],
                "obj_mm": [round(x, 3) for x in obj_mm],
                "blender_predicted": [round(x, 5) for x in bpy],
                "blender_mesh_center": center,
            }
        )

    # Pelvis pivot: group 7 rot_center in world VRT
    g7 = objs[[o["number"] for o in objs].index(7)]
    rc = g7["rot"]["center"]
    # world rot center = transform chain position + R @ rc ... simplified: use frame pos
    pivot_vrt = frames[7]["pos_vrt"]  # group origin; rot_center is local to object
    pivot_obj = vrt_to_obj_mm(
        [frames[7]["pos_vrt"][i] + mat_vec(mat_identity(), rc)[i] for i in range(3)]
    )

    # Facing: compare LCA Z sign on head group vs Blender mesh centers
    head = next(p for p in scene["blender"]["blender_scene"]["parts"] if p["lca_object_number"] == 20)
    hips = next(p for p in scene["blender"]["blender_scene"]["parts"] if p["lca_object_number"] == 8)

    report = {
        "axis_notes": {
            "lca_content": "+Y up, character authored facing -Z (head group 19 pos Z=-4000)",
            "obj_export": "Y flipped: (x, -y, z) mm",
            "blender_phase2_root": "rotation_euler XYZ (90°, 0°, 180°), feet on Z=0",
            "game_loader": "rotation.x = PI on scaled OBJ (upright +Z facing in three.js)",
        },
        "pelvis_group7_rot_center_vrt": rc,
        "joint_compare": rows,
        "facing_check": {
            "lca_head_group19_pos_z_vrt": frames[19]["pos_vrt"][2],
            "blender_head_center": head["world_bounds"]["center"],
            "blender_hips_center": hips["world_bounds"]["center"],
            "blender_head_y_vs_hips_y": head["world_bounds"]["center"][1] - hips["world_bounds"]["center"][1],
        },
        "rig_inversion_hint": (
            "LCA forward is -Z; phase2 root Z=180° flips to +Z facing. "
            "Bone local Y (roll axis) and bearing rotations need a 180° yaw "
            "correction on the armature or per-bone roll vs naive bounds-based rig."
        ),
    }
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()