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

  # Run built-in unit tests (no network required):
  python .github/scripts/validate_branch_existence.py --self-test

Exit codes:
  0  all checks passed
  1  one or more issues found
  2  fatal error (versions.csv not found)

Environment:
  GITHUB_TOKEN    Optional. Raises API rate limit from 60 to 5000 req/hr.
  GITHUB_ACTIONS  Set automatically in CI. Enables pr-comment.md output.
"""

import contextlib
import csv
import io
import json
import os
import re
import sys
import urllib.error
import urllib.parse
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
        encoded = urllib.parse.quote(branch, safe="")
        result = _api_get(f"repos/{GENERATED_DIAGRAMS_REPO}/branches/{encoded}")
        _cache[branch] = result is not None
    return _cache[branch]


def load_versions_csv() -> list[dict]:
    if not VERSIONS_CSV.exists():
        print(f"Error: {VERSIONS_CSV} not found. Run from the repo root.", file=sys.stderr)
        sys.exit(2)
    with open(VERSIONS_CSV, newline="") as f:
        return list(csv.DictReader(f))


def run_checks(rows: list[dict], _exists_fn=None) -> list[dict]:
    """Check each versions.csv row for branch existence and staleness.

    _exists_fn is injectable for unit tests; defaults to branch_exists.
    """
    if _exists_fn is None:
        _exists_fn = branch_exists

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
            if _exists_fn(branch):
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
            if _exists_fn(expected):
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
# Self-tests (no network required)
# ---------------------------------------------------------------------------

def _run_self_tests() -> None:
    """Unit tests for run_checks logic using injected exists functions."""

    def _quiet(rows, exists_fn):
        with contextlib.redirect_stdout(io.StringIO()):
            return run_checks(rows, _exists_fn=exists_fn)

    # branch_missing: listed branch does not exist
    rows = [{"major_version": "v26.1", "crdb_branch_name": "release-26.1"}]
    failures = _quiet(rows, lambda b: False)
    assert len(failures) == 1, failures
    assert failures[0]["type"] == "branch_missing", failures

    # all OK: branch exists and matches expected
    rows = [{"major_version": "v26.1", "crdb_branch_name": "release-26.1"}]
    failures = _quiet(rows, lambda b: True)
    assert failures == [], failures

    # branch_mismatch: listed branch exists but a newer canonical branch also exists
    rows = [{"major_version": "v26.2", "crdb_branch_name": "release-26.1"}]
    known = {"release-26.1", "release-26.2"}
    failures = _quiet(rows, lambda b: b in known)
    assert len(failures) == 1, failures
    assert failures[0]["type"] == "branch_mismatch", failures
    assert failures[0]["expected"] == "release-26.2", failures

    # N/A entries are skipped entirely
    rows = [{"major_version": "v24.1", "crdb_branch_name": "N/A"}]
    failures = _quiet(rows, lambda b: (_ for _ in ()).throw(AssertionError("unexpected call")))
    assert failures == [], failures

    # empty branch field is skipped
    rows = [{"major_version": "v25.1", "crdb_branch_name": ""}]
    failures = _quiet(rows, lambda b: (_ for _ in ()).throw(AssertionError("unexpected call")))
    assert failures == [], failures

    print("All self-tests passed.")
    sys.exit(0)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    if "--self-test" in sys.argv:
        _run_self_tests()

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
