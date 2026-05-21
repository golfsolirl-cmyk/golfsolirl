#!/usr/bin/env python3
"""Legacy wrapper — use scripts/generate-brand-asset-pack.mjs for HQ output."""
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MJS = ROOT / "scripts" / "generate-brand-asset-pack.mjs"

if __name__ == "__main__":
    raise SystemExit(subprocess.call(["node", str(MJS)], cwd=ROOT))
