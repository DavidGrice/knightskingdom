"""Shared helpers for King Leo incremental rig phases."""

from __future__ import annotations

import os

import bpy

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GROK_DIR = os.path.join(ROOT, "grok")
OBJ_PATH = os.path.join(ROOT, "resources", "model_files", "extracted", "models", "minifigkingleo00.obj")
MTL_DIR = os.path.join(ROOT, "resources", "model_files", "extracted", "models")
TEXTURE_DIR = os.path.join(MTL_DIR, "textures")
ROOT_NAME = "minifigkingleo00"
ARMATURE_NAME = "minifigkingleo00_rig"
IMPORT_SCALE = 0.001

PART_NUMBERS = (8, 11, 13, 15, 17, 18, 20, 23, 27, 30, 32, 35)
PART_PREFIXES = tuple(f"{n:03d}_" for n in PART_NUMBERS)


def blend_path(name: str) -> str:
    return os.path.join(GROK_DIR, name)


def clear_scene(keep_camera_light: bool = True) -> list[str]:
    """Remove scene objects; optionally keep default camera and lights."""
    keep_types = {"CAMERA", "LIGHT"} if keep_camera_light else set()
    removed = []
    for obj in list(bpy.data.objects):
        if keep_camera_light and obj.type in keep_types:
            continue
        removed.append(obj.name)
        obj_type = obj.type
        data = obj.data
        bpy.data.objects.remove(obj, do_unlink=True)
        if data and hasattr(data, "users") and data.users == 0:
            if obj_type == "MESH":
                try:
                    bpy.data.meshes.remove(data)
                except (ReferenceError, AttributeError):
                    pass
            elif obj_type == "ARMATURE":
                try:
                    bpy.data.armatures.remove(data)
                except (ReferenceError, AttributeError):
                    pass

    for arm in list(bpy.data.armatures):
        if arm.users == 0:
            bpy.data.armatures.remove(arm)
    for mesh in list(bpy.data.meshes):
        if mesh.users == 0:
            bpy.data.meshes.remove(mesh)

    return removed


def remaining_object_names() -> list[str]:
    return [o.name for o in bpy.data.objects]