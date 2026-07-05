"""
Phase 1 — Clear Blender scene and save empty project.

Run: python grok/run_blender_script.py grok/phase1_clear_scene.py
"""

from __future__ import annotations

import json
import os
import sys

import bpy

# Allow import when run via runpy from project root
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kingleo_blender_utils import blend_path, clear_scene, remaining_object_names

OUT = blend_path("minifigkingleo00_empty.blend")


def main() -> None:
    removed = clear_scene(keep_camera_light=True)
    remaining = remaining_object_names()

    bpy.ops.wm.save_as_mainfile(filepath=OUT)

    report = {
        "phase": 1,
        "removed_count": len(removed),
        "removed_sample": removed[:20],
        "remaining_objects": remaining,
        "saved": OUT,
    }
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()