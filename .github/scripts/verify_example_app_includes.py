#!/usr/bin/env python3
"""Verify example app source is served from local include files."""

from __future__ import annotations

import re
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
SRC_CURRENT = REPO_ROOT / "src" / "current"
VENDORED_ROOT = SRC_CURRENT / "_includes" / "example-apps"

REMOTE_INCLUDE_PATTERN = re.compile(
    r"{%\s*remote_include\s+"
    r"(?P<url>https://raw\.githubusercontent\.com/"
    r"(?P<owner>[^/\s%]+)/(?P<repo>[^/\s%]+)/[^\s%]+)"
    r"(?:\s+\|\|.*?|\s*)%}"
)
LOCAL_INCLUDE_PATTERN = re.compile(
    r"{%\s*include\s+"
    r"(?P<path>example-apps/[^\s%]+)\s*%}"
)


def is_example_app_remote(owner: str, repo: str) -> bool:
    return owner == "cockroachlabs" or (
        owner == "cockroachdb" and repo.startswith("example-app-")
    )


def rel(path: Path) -> str:
    return str(path.relative_to(REPO_ROOT))


def main() -> int:
    remote_refs: list[tuple[Path, int, str]] = []
    include_sites = 0
    expected_files: set[Path] = set()

    for page in sorted(SRC_CURRENT.glob("v*/*.md")):
        text = page.read_text()
        for lineno, line in enumerate(text.splitlines(), start=1):
            for match in REMOTE_INCLUDE_PATTERN.finditer(line):
                if is_example_app_remote(match.group("owner"), match.group("repo")):
                    remote_refs.append((page, lineno, line.strip()))

            for match in LOCAL_INCLUDE_PATTERN.finditer(line):
                include_sites += 1
                expected_files.add(SRC_CURRENT / "_includes" / match.group("path"))

    existing_files = set(VENDORED_ROOT.rglob("*")) if VENDORED_ROOT.exists() else set()
    existing_files = {path for path in existing_files if path.is_file()}
    missing_files = sorted(expected_files - existing_files)
    stale_files = sorted(existing_files - expected_files)
    empty_files = sorted(path for path in existing_files if path.stat().st_size == 0)

    if remote_refs:
        print("Found example app remote includes:", file=sys.stderr)
        for page, lineno, line in remote_refs[:50]:
            print(f"  {rel(page)}:{lineno}: {line}", file=sys.stderr)
        if len(remote_refs) > 50:
            print(f"  ... and {len(remote_refs) - 50} more", file=sys.stderr)

    if missing_files:
        print("Missing example app include files:", file=sys.stderr)
        for path in missing_files[:50]:
            print(f"  {rel(path)}", file=sys.stderr)
        if len(missing_files) > 50:
            print(f"  ... and {len(missing_files) - 50} more", file=sys.stderr)

    if stale_files:
        print("Unreferenced example app include files:", file=sys.stderr)
        for path in stale_files[:50]:
            print(f"  {rel(path)}", file=sys.stderr)
        if len(stale_files) > 50:
            print(f"  ... and {len(stale_files) - 50} more", file=sys.stderr)

    if empty_files:
        print("Empty example app include files:", file=sys.stderr)
        for path in empty_files[:50]:
            print(f"  {rel(path)}", file=sys.stderr)
        if len(empty_files) > 50:
            print(f"  ... and {len(empty_files) - 50} more", file=sys.stderr)

    if remote_refs or missing_files or stale_files or empty_files:
        return 1

    print(f"Verified {include_sites} example app include sites.")
    print(f"Verified {len(existing_files)} example app include files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
