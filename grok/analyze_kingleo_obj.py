"""Analyze minifig OBJ part positions."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def analyze(path: Path) -> None:
    cur = None
    objs = []
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        if line.startswith(("o ", "g ")):
            if cur:
                objs.append(cur)
            cur = {"name": line.split(maxsplit=1)[1], "verts": []}
        elif line.startswith("v ") and cur:
            parts = line.split()
            cur["verts"].append(tuple(float(x) for x in parts[1:4]))
    if cur:
        objs.append(cur)

    print("===", path)
    for o in objs:
        vs = o["verts"]
        if not vs:
            continue
        xs = [v[0] for v in vs]
        ys = [v[1] for v in vs]
        zs = [v[2] for v in vs]
        cx = sum(xs) / len(xs)
        cy = sum(ys) / len(ys)
        cz = sum(zs) / len(ys)
        print(
            f"{o['name']}: center=({cx:.2f},{cy:.2f},{cz:.2f}) "
            f"x=[{min(xs):.2f},{max(xs):.2f}] "
            f"y=[{min(ys):.2f},{max(ys):.2f}] "
            f"z=[{min(zs):.2f},{max(zs):.2f}] n={len(vs)}"
        )


if __name__ == "__main__":
    analyze(ROOT / "resources/model_files/extracted/models/minifigkingleo00.obj")
    print()
    analyze(
        ROOT
        / "resources/model_files/extracted/pak_models/warehouse/main_interface/minifigures_animals/minifigkingleo00.obj"
    )