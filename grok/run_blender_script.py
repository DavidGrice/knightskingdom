"""Run a Blender Python script via blmcp connection (host-side helper)."""
import sys
from pathlib import Path

from blmcp.tools_helpers.connection import send_code

script = Path(sys.argv[1]).resolve().as_posix()
env_lines = []
for arg in sys.argv[2:]:
    if "=" not in arg:
        continue
    key, value = arg.split("=", 1)
    env_lines.append(f"os.environ[{key!r}] = {value!r}")
env_prefix = "\n".join(["import os", *env_lines, ""])
code = f"{env_prefix}import runpy\nrunpy.run_path(r'{script}', run_name='__main__')\n"
resp = send_code(code, False)
print("status:", resp.get("status"))
if resp.get("stdout"):
    print(resp["stdout"], end="" if resp["stdout"].endswith("\n") else "\n")
if resp.get("stderr"):
    print("stderr:", resp["stderr"], file=sys.stderr)
if resp.get("message"):
    print("message:", resp["message"], file=sys.stderr)
sys.exit(0 if resp.get("status") == "ok" else 1)