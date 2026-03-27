#!/usr/bin/env python3
"""
validate_branch_existence.py  (EDUENG-614)

For every row in src/current/_data/versions.csv, verifies that the listed
crdb_branch_name exists as a branch in cockroachdb/generated-diagrams.

Also flags entries where versions.csv still points to an older branch even
though the "natural" release-X.Y branch for that version now exists
(e.g. v26.2 pointing to release-26.1 after release-26.2 is created).

Usage:
  python .github/scripts/validate_branch_existence.py

Exit codes:
  0  all checks passed
  1  one or more issues found
  2  fatal error (versions.csv not found)

Environment:
  GITHUB_TOKEN    Optional. Raises API rate limit from 60 to 5000 req/hr.
  GITHUB_ACTIONS  Set automatically in CI. Enables pr-comment.md output.
"""

import csv
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

GENERATED_DIAGRAMS_REPO = "cockroachdb/generated-diagrams"
GITHUB_API_BASE = "https://api.github.com"
VERSIONS_CSV = Path("src/current/_data/versions.csv")

# ---------------------------------------------------------------------------
# HTTP
# ---------------------------------------------------------------------------

def _api_get(path: str) -> dict | None:
    url = f"{GITHUB_API_BASE}/{path}"
    req = urllib.request.Request(url)
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return None
        raise
    except Exception as exc:
        print(f"  Warning: request to {url} failed: {exc}", file=sys.stderr)
        return None


# ---------------------------------------------------------------------------
# Core logic
# ---------------------------------------------------------------------------

_cache: dict[str, bool] = {}


def branch_exists(branch: str) -> bool:
    if branch not in _cache:
        result = _api_get(f"repos/{GENERATED_DIAGRAMS_REPO}/branches/{branch}")
        _cache[branch] = result is not None
    return _cache[branch]


def load_versions_csv() -> list[dict]:
    if not VERSIONS_CSV.exists():
        print(f"Error: {VERSIONS_CSV} not found. Run from the repo root.", file=sys.stderr)
        sys.exit(2)
    with open(VERSIONS_CSV, newline="") as f:
        return list(csv.DictReader(f))


def run_checks(rows: list[dict]) -> list[dict]:
    failures = []
    checked: set[str] = set()

    for row in rows:
        version = row.get("major_version", "").strip()
        branch  = row.get("crdb_branch_name", "").strip()
        if not branch or branch == "N/A":
            continue

        # (a) Does the listed branch exist?
        if branch not in checked:
            checked.add(branch)
            print(f"  {version:8s} → {branch} ...", end=" ", flush=True)
            if branch_exists(branch):
                print("OK")
            else:
                print("MISSING")
                failures.append({
                    "type": "branch_missing",
                    "version": version,
                    "branch": branch,
                    "message": (
                        f"{version}: crdb_branch_name={branch!r} does not exist "
                        f"in cockroachdb/generated-diagrams."
                    ),
                })
                continue

        # (b) Is the version still pointing to an older branch?
        #     e.g. v26.2 → release-26.1 when release-26.2 now exists.
        expected = f"release-{version.lstrip('v')}"
        if branch != expected and expected not in checked:
            if branch_exists(expected):
                checked.add(expected)
                failures.append({
                    "type": "branch_mismatch",
                    "version": version,
                    "branch": branch,
                    "expected": expected,
                    "message": (
                        f"{version}: crdb_branch_name={branch!r} but {expected!r} "
                        f"now exists in cockroachdb/generated-diagrams. "
                        f"Update versions.csv to use {expected!r}."
                    ),
                })

    return failures


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------

def format_comment(failures: list[dict]) -> str:
    if not failures:
        return (
            "## Branch Existence Check: Passed\n\n"
            "All `crdb_branch_name` entries in `versions.csv` exist in "
            "`cockroachdb/generated-diagrams`."
        )

    lines = [
        "## Branch Existence Check: Failed",
        "",
        f"Found **{len(failures)}** issue(s) in `versions.csv`:",
        "",
        "> **Context**: [EDUENG-614](https://cockroachlabs.atlassian.net/browse/EDUENG-614)",
        "",
    ]
    for f in failures:
        icon = ":warning:" if f["type"] == "branch_mismatch" else ":x:"
        lines.append(f"- {icon} {f['message']}")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    rows = load_versions_csv()
    print(f"Checking {len(rows)} versions.csv entries against cockroachdb/generated-diagrams...\n")
    failures = run_checks(rows)

    comment = format_comment(failures)
    if os.environ.get("GITHUB_ACTIONS"):
        summary = os.environ.get("GITHUB_STEP_SUMMARY")
        if summary:
            Path(summary).write_text(comment, encoding="utf-8")
        Path("pr-comment.md").write_text(comment, encoding="utf-8")

    if failures:
        print(f"\n--- Issues ---", file=sys.stderr)
        for f in failures:
            print(f"  [{f['type']}] {f['message']}", file=sys.stderr)
        print(f"\nTotal: {len(failures)} issue(s).", file=sys.stderr)
        sys.exit(1)
    else:
        print("\nAll branch existence checks passed.")
        sys.exit(0)


if __name__ == "__main__":
    main()
