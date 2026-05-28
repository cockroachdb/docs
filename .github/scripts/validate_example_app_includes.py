#!/usr/bin/env python3
"""Validate vendored example app includes without making network requests."""

from __future__ import annotations

import runpy
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
VERIFY_SCRIPT = SCRIPT_DIR / "verify_example_app_includes.py"


def main() -> int:
    namespace = runpy.run_path(str(VERIFY_SCRIPT))
    return namespace["main"]()


if __name__ == "__main__":
    raise SystemExit(main())
