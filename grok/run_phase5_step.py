"""Run phase5_add_bone.py with BONE_STEP=1..12.

Usage: python grok/run_phase5_step.py 2
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    step = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    if step < 1 or step > 12:
        raise SystemExit("BONE_STEP must be 1..12")
    proc = subprocess.run(
        [
            sys.executable,
            str(ROOT / "grok" / "run_blender_script.py"),
            str(ROOT / "grok" / "phase5_add_bone.py"),
            f"BONE_STEP={step}",
        ],
        cwd=ROOT,
    )
    raise SystemExit(proc.returncode)


if __name__ == "__main__":
    main()