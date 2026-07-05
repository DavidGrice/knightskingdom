"""Dump minifigkingleo00 LCA object hierarchy for rig authoring."""
import json
import os
import sys

TOOLS = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "resources",
    "model_files",
    "tools",
)
sys.path.insert(0, TOOLS)

from export_obj import build_tree  # noqa: E402
from lca_parser import parse_lca  # noqa: E402

LCA = os.path.join(
    os.path.dirname(TOOLS),
    "extracted",
    "pak",
    "warehouse",
    "main_interface",
    "minifigures_animals",
    "minifigkingleo00.lca",
)


def obj_label(ob, symbols):
    num = ob.get("number")
    name = symbols.get(num) or f"obj_{num}"
    typ = "GROUP" if ob["type"] == 0xFFFF else "MESH"
    return f"{num:03d}_{name}"


def walk(ob, symbols, depth=0):
    rot = ob.get("rot") or {}
    brees = rot.get("brees", [0, 0, 0])
    center = rot.get("center", [0, 0, 0])
    row = {
        "number": ob.get("number"),
        "name": symbols.get(ob.get("number")),
        "type": "group" if ob["type"] == 0xFFFF else "mesh",
        "pos": ob.get("pos"),
        "size": ob.get("size"),
        "brees": brees,
        "rot_center": center,
        "depth": depth,
        "children": [],
    }
    for ch in ob.get("children", []):
        row["children"].append(walk(ch, symbols, depth + 1))
    return row


def main():
    r = parse_lca(LCA)
    objects = r["wld"]["objects"]
    build_tree(objects)
    symbols = {}
    for s in r["wld"]["symbols"]:
        if s.get("type") == 0 and s.get("name"):
            symbols[s["number"]] = s["name"]

    root = objects[0]
    tree = walk(root, symbols)
    print(json.dumps(tree, indent=2))


if __name__ == "__main__":
    main()