"""
Phase 3 — Merge Blender scene dump + LCA + project metadata.

Run: python grok/phase3_analyze_kingleo.py
"""

from __future__ import annotations

import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GROK = os.path.join(ROOT, "grok")
TOOLS = os.path.join(ROOT, "resources", "model_files", "tools")
LCA_PATH = os.path.join(
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
OUT_PATH = os.path.join(GROK, "kingleo00_scene_analysis.json")
RIG_DATA_PATH = os.path.join(GROK, "kingleo00_rig_data.json")
MANIFEST_PATH = os.path.join(ROOT, "resources", "model_pipeline", "asset_manifest.generated.json")
METADATA_PATH = os.path.join(ROOT, "resources", "model_pipeline", "model_metadata.generated.json")


def _run_blender_dump() -> dict:
    cmd = [
        sys.executable,
        os.path.join(GROK, "run_blender_script.py"),
        os.path.join(GROK, "phase3_blender_scene_dump.py"),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, cwd=ROOT)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr or proc.stdout)
    text = proc.stdout
    if "---JSON---" not in text:
        raise RuntimeError(f"No JSON marker in blender output:\n{text}")
    payload = text.split("---JSON---", 1)[1].strip()
    return json.loads(payload)


def _load_lca_objects() -> list[dict]:
    sys.path.insert(0, TOOLS)
    from export_obj import build_tree
    from lca_parser import parse_lca

    r = parse_lca(LCA_PATH)
    objs = r["wld"]["objects"]
    build_tree(objs)
    rows = []
    for ob in objs:
        rot = ob.get("rot") or {}
        rows.append(
            {
                "number": ob["number"],
                "type": "group" if ob["type"] == 0xFFFF else "mesh",
                "pos": ob["pos"],
                "size": ob["size"],
                "brees": rot.get("brees", [0, 0, 0]),
                "rot_center": rot.get("center", []),
                "child_count": len(ob.get("children", [])),
            }
        )
    return rows


def _load_manifest_shapes() -> list[dict]:
    with open(MANIFEST_PATH, encoding="utf-8") as fh:
        data = json.load(fh)
    entry = data.get("minifigkingleo00", {})
    shapes = []
    for sh in entry.get("shapes", []):
        nums = sh.get("usedByObjectNumbers", [])
        shapes.append(
            {
                "symbolName": sh.get("symbolName"),
                "usedByObjectNumbers": nums,
                "size_vrt": sh.get("size"),
                "textureRefs": sh.get("textureRefs", []),
            }
        )
    return shapes


def _load_model_metadata() -> dict:
    with open(METADATA_PATH, encoding="utf-8") as fh:
        data = json.load(fh)
    for entry in data.get("models", []):
        if entry.get("id") == "minifigkingleo00":
            return {
                "bbox": entry.get("bbox"),
                "objectCount": entry.get("objectCount"),
                "materials": entry.get("materials"),
                "vertexCount": entry.get("vertexCount"),
                "faceCount": entry.get("faceCount"),
            }
    return {}


def main() -> None:
    with open(RIG_DATA_PATH, encoding="utf-8") as fh:
        rig_data = json.load(fh)

    report = {
        "phase": 3,
        "id": "minifigkingleo00",
        "sources": {
            "lca": LCA_PATH,
            "obj": rig_data["source"]["obj"],
            "rig_reference": RIG_DATA_PATH,
        },
        "blender": _run_blender_dump(),
        "lca_objects": _load_lca_objects(),
        "manifest_shapes": _load_manifest_shapes(),
        "model_metadata": _load_model_metadata(),
        "rig_part_map": rig_data.get("hierarchy", {}).get("parts", {}),
        "smo_track_names": rig_data.get("smo_bone_names", []),
    }

    with open(OUT_PATH, "w", encoding="utf-8") as fh:
        json.dump(report, fh, indent=2)

    checks = report["blender"]["blender_scene"]["assembly_checks"]
    print(json.dumps({"phase": 3, "saved": OUT_PATH, "assembly_checks": checks}, indent=2))


if __name__ == "__main__":
    main()