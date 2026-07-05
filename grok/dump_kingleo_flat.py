import os
import sys

TOOLS = os.path.join(os.path.dirname(os.path.dirname(__file__)), "resources", "model_files", "tools")
sys.path.insert(0, TOOLS)
from export_obj import build_tree
from lca_parser import parse_lca

LCA = os.path.join(
    os.path.dirname(TOOLS),
    "extracted",
    "pak",
    "warehouse",
    "main_interface",
    "minifigures_animals",
    "minifigkingleo00.lca",
)
r = parse_lca(LCA)
objs = r["wld"]["objects"]
build_tree(objs)
for ob in objs:
    n = ob["number"]
    t = "G" if ob["type"] == 0xFFFF else "M"
    rot = ob.get("rot") or {}
    print(
        f"{n:3d} {t} pos={ob['pos']} brees={rot.get('brees', [0, 0, 0])} "
        f"center={rot.get('center', [])} children={len(ob.get('children', []))}"
    )