#!/usr/bin/env python3
"""Verify SQL diagram HTML is served from local include files."""

from __future__ import annotations

import csv
import re
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
SRC_CURRENT = REPO_ROOT / "src" / "current"
VERSIONS_CSV = SRC_CURRENT / "_data" / "versions.csv"
VENDORED_ROOT = SRC_CURRENT / "_includes" / "cockroach-generated"

REMOTE_PATTERN = re.compile(
    r"{%\s*remote_include\s+"
    r"https://raw\.githubusercontent\.com/cockroachdb/generated-diagrams/"
    r"{{\s*page\.release_info\.crdb_branch_name\s*}}"
    r"/grammar_svg/[A-Za-z0-9_.-]+\.html\s*%}"
)
REMOTE_URL_PATTERN = re.compile(
    r"https://raw\.githubusercontent\.com/cockroachdb/generated-diagrams/"
)
LOCAL_INCLUDE_PATTERN = re.compile(
    r"cockroach-generated/{{\s*page\.release_info\.crdb_branch_name\s*}}"
    r"/sql-diagrams/([A-Za-z0-9_.-]+\.html)"
)


def load_branch_names() -> dict[str, str]:
    with VERSIONS_CSV.open(newline="") as f:
        return {
            row["major_version"]: row["crdb_branch_name"]
            for row in csv.DictReader(f)
            if row.get("major_version") and row.get("crdb_branch_name")
        }


def version_for_page(path: Path) -> str | None:
    rel = path.relative_to(SRC_CURRENT)
    if not rel.parts:
        return None
    version = rel.parts[0]
    return version if re.fullmatch(r"v\d+\.\d+", version) else None


def rel(path: Path) -> str:
    return str(path.relative_to(REPO_ROOT))


def main() -> int:
    branch_names = load_branch_names()
    expected_files: set[Path] = set()
    remote_refs: list[tuple[Path, int, str]] = []
    include_sites = 0

    for page in sorted(SRC_CURRENT.glob("v*/*.md")):
        version = version_for_page(page)
        if version is None:
            continue
        branch = branch_names.get(version)
        if branch is None:
            print(f"No crdb_branch_name for {version}", file=sys.stderr)
            return 1

        text = page.read_text()
        for lineno, line in enumerate(text.splitlines(), start=1):
            if REMOTE_PATTERN.search(line) or REMOTE_URL_PATTERN.search(line):
                remote_refs.append((page, lineno, line.strip()))

        for diagram in LOCAL_INCLUDE_PATTERN.findall(text):
            include_sites += 1
            expected_files.add(VENDORED_ROOT / branch / "sql-diagrams" / diagram)

    existing_files = set(VENDORED_ROOT.glob("*/sql-diagrams/*.html"))
    missing_files = sorted(expected_files - existing_files)
    stale_files = sorted(existing_files - expected_files)
    empty_files = sorted(path for path in existing_files if path.stat().st_size == 0)

    if remote_refs:
        print("Found SQL diagram remote references:", file=sys.stderr)
        for page, lineno, line in remote_refs[:50]:
            print(f"  {rel(page)}:{lineno}: {line}", file=sys.stderr)
        if len(remote_refs) > 50:
            print(f"  ... and {len(remote_refs) - 50} more", file=sys.stderr)

    if missing_files:
        print("Missing vendored SQL diagram files:", file=sys.stderr)
        for path in missing_files[:50]:
            print(f"  {rel(path)}", file=sys.stderr)
        if len(missing_files) > 50:
            print(f"  ... and {len(missing_files) - 50} more", file=sys.stderr)

    if stale_files:
        print("Unreferenced vendored SQL diagram files:", file=sys.stderr)
        for path in stale_files[:50]:
            print(f"  {rel(path)}", file=sys.stderr)
        if len(stale_files) > 50:
            print(f"  ... and {len(stale_files) - 50} more", file=sys.stderr)

    if empty_files:
        print("Empty vendored SQL diagram files:", file=sys.stderr)
        for path in empty_files[:50]:
            print(f"  {rel(path)}", file=sys.stderr)
        if len(empty_files) > 50:
            print(f"  ... and {len(empty_files) - 50} more", file=sys.stderr)

    if remote_refs or missing_files or stale_files or empty_files:
        return 1

    print(f"Verified {include_sites} SQL diagram include sites.")
    print(f"Verified {len(existing_files)} vendored SQL diagram files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
