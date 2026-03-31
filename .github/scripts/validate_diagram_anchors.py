#!/usr/bin/env python3
"""
validate_diagram_anchors.py  (EDUENG-613)

For doc files that contain remote_include tags pulling from
cockroachdb/generated-diagrams grammar_svg, fetches each referenced diagram
HTML and verifies that every sql-grammar.html#ANCHOR link inside it resolves
against stmt_block.html on the same branch.

This is the exact failure that blocked production builds on 2026-01-29:
  show_statement_hints.html referenced sql-grammar.html#opt_with_show_hints_options
  but that anchor did not yet exist in stmt_block.html on release-26.1.

Usage:
  # Check specific files (e.g. changed files in a PR):
  python .github/scripts/validate_diagram_anchors.py file1.md file2.md ...

  # Full scan:
  python .github/scripts/validate_diagram_anchors.py

Exit codes:
  0  all checks passed
  1  one or more broken anchors found
  2  fatal error (versions.csv not found)

Environment:
  GITHUB_TOKEN    Optional. Raises GitHub API rate limit from 60 to 5000 req/hr.
  GITHUB_ACTIONS  Set automatically in CI. Enables pr-comment.md output.
"""

import base64
import csv
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path
from typing import Optional

GENERATED_DIAGRAMS_REPO = "cockroachdb/generated-diagrams"
GITHUB_API_BASE = "https://api.github.com"
VERSIONS_CSV = Path("src/current/_data/versions.csv")
DOCS_ROOT = Path("src/current")

# {% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/
#   {{ page.release_info.crdb_branch_name }}/grammar_svg/show_statement_hints.html %}
REMOTE_INCLUDE_RE = re.compile(
    r"\{%-?\s*remote_include\s+"
    r"https://raw\.githubusercontent\.com/cockroachdb/generated-diagrams/"
    r"\{\{[^}]*crdb_branch_name[^}]*\}\}/grammar_svg/"
    r"([\w.-]+\.html)"
    r"\s*-?%\}"
)

# href="sql-grammar.html#opt_with_show_hints_options"
ANCHOR_REF_RE = re.compile(r'href=["\']sql-grammar\.html#([^"\']+)["\']')

# ---------------------------------------------------------------------------
# HTTP
# ---------------------------------------------------------------------------

def _fetch_github_content(repo: str, path: str, ref: str) -> Optional[str]:
    """Fetch a file from GitHub using the Contents API.

    Uses the REST API endpoint so that GITHUB_TOKEN properly raises rate
    limits and authenticates against private repos.  Falls back to the
    download_url for files larger than 1 MB (the API returns the field but
    omits the base64 payload in that case).
    """
    encoded_ref  = urllib.parse.quote(ref,  safe="")
    encoded_path = urllib.parse.quote(path, safe="/")
    url = (
        f"{GITHUB_API_BASE}/repos/{repo}/contents/{encoded_path}"
        f"?ref={encoded_ref}"
    )

    req = urllib.request.Request(url)
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        req.add_header("Authorization", f"Bearer {token}")

    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode())

        # Normal case: inline base64 payload
        if data.get("encoding") == "base64" and data.get("content"):
            return base64.b64decode(data["content"].encode()).decode(
                "utf-8", errors="replace"
            )

        # Large file (>1 MB): fall back to the raw download_url
        download_url = data.get("download_url")
        if download_url:
            with urllib.request.urlopen(download_url, timeout=20) as resp:
                return resp.read().decode("utf-8", errors="replace")

        return None
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return None
        raise
    except Exception as exc:
        print(f"  Warning: fetch {repo}/{path}@{ref} failed: {exc}", file=sys.stderr)
        return None


# ---------------------------------------------------------------------------
# Cached lookups
# ---------------------------------------------------------------------------

_stmt_block_cache: dict[str, Optional[set]] = {}


class _IDCollector(HTMLParser):
    """Collects all id= attribute values from an HTML document."""

    def __init__(self) -> None:
        super().__init__()
        self.ids: set[str] = set()

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, Optional[str]]]
    ) -> None:
        for name, value in attrs:
            if name == "id" and value:
                self.ids.add(value)


def get_stmt_block_anchors(branch: str) -> Optional[set]:
    """Return all id= values in stmt_block.html for the given branch."""
    if branch not in _stmt_block_cache:
        content = _fetch_github_content(
            GENERATED_DIAGRAMS_REPO, "grammar_svg/stmt_block.html", branch
        )
        if content is None:
            _stmt_block_cache[branch] = None
        else:
            collector = _IDCollector()
            collector.feed(content)
            _stmt_block_cache[branch] = collector.ids
    return _stmt_block_cache[branch]


# ---------------------------------------------------------------------------
# Parsing helpers
# ---------------------------------------------------------------------------

def load_versions_csv() -> dict[str, str]:
    """Return {major_version: crdb_branch_name} for all valid rows."""
    if not VERSIONS_CSV.exists():
        print(f"Error: {VERSIONS_CSV} not found. Run from the repo root.", file=sys.stderr)
        sys.exit(2)
    result = {}
    with open(VERSIONS_CSV, newline="") as f:
        for row in csv.DictReader(f):
            v = row.get("major_version", "").strip()
            b = row.get("crdb_branch_name", "").strip()
            if v and b and b != "N/A":
                result[v] = b
    return result


def version_from_path(path: Path) -> Optional[str]:
    for part in path.parts:
        if re.match(r"^v\d+\.\d+$", part):
            return part
    return None


def scan_files(files: list[Path]) -> dict[tuple[str, str], list[Path]]:
    """
    Scan markdown files for SQL diagram remote_include tags.
    Returns {(version, diagram_filename): [source_paths]}.
    """
    result: dict[tuple[str, str], list[Path]] = {}
    for path in files:
        if path.suffix not in (".md", ".markdown") or not path.exists():
            continue
        version = version_from_path(path)
        if not version:
            continue
        try:
            content = path.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        for m in REMOTE_INCLUDE_RE.finditer(content):
            key = (version, m.group(1))
            result.setdefault(key, []).append(path)
    return result


# ---------------------------------------------------------------------------
# Core logic
# ---------------------------------------------------------------------------

def run_checks(
    diagram_includes: dict[tuple[str, str], list[Path]],
    version_to_branch: dict[str, str],
) -> list[dict]:
    failures = []

    # Group by branch to share stmt_block.html fetches.
    branch_to_pairs: dict[str, list[tuple[str, str, list[Path]]]] = {}
    for (version, diagram), source_files in diagram_includes.items():
        branch = version_to_branch.get(version)
        if branch:
            branch_to_pairs.setdefault(branch, []).append((version, diagram, source_files))

    for branch, pairs in sorted(branch_to_pairs.items()):
        print(f"  Branch {branch}:")
        print(f"    Fetching stmt_block.html ...", end=" ", flush=True)
        known_anchors = get_stmt_block_anchors(branch)
        if known_anchors is None:
            print("NOT FOUND — skipping this branch")
            continue
        print(f"{len(known_anchors)} anchors")

        for version, diagram, source_files in sorted(pairs):
            content = _fetch_github_content(
                GENERATED_DIAGRAMS_REPO, f"grammar_svg/{diagram}", branch
            )
            if content is None:
                print(f"    {diagram}: NOT FOUND in generated-diagrams (skipping)")
                continue

            refs = ANCHOR_REF_RE.findall(content)
            missing = [r for r in refs if r not in known_anchors]

            if missing:
                print(f"    {diagram}: {len(missing)} MISSING anchor(s)")
                for anchor in missing:
                    failures.append({
                        "diagram": diagram,
                        "branch": branch,
                        "anchor": anchor,
                        "source_files": [str(f) for f in source_files],
                        "message": (
                            f"Diagram {diagram!r} on {branch!r} links to "
                            f"sql-grammar.html#{anchor}, "
                            f"but that anchor is absent from stmt_block.html."
                        ),
                    })
            else:
                print(f"    {diagram}: OK ({len(refs)} anchor ref(s))")

    return failures


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------

def format_comment(failures: list[dict]) -> str:
    if not failures:
        return (
            "## Diagram Anchor Check: Passed\n\n"
            "All `sql-grammar.html#anchor` references in SQL diagram files "
            "resolve correctly against `stmt_block.html`."
        )

    lines = [
        "## Diagram Anchor Check: Failed",
        "",
        f"Found **{len(failures)}** broken anchor(s) that will cause docs build failures.",
        "",
        "> **Context**: [EDUENG-613](https://cockroachlabs.atlassian.net/browse/EDUENG-613) — "
        "same failure mode as 2026-01-29 (`opt_with_show_hints_options` missing from `stmt_block.html`).",
        "",
    ]
    for f in failures:
        lines.append(
            f"- **`{f['diagram']}`** on `{f['branch']}` "
            f"→ missing anchor `#{f['anchor']}`"
        )
        for s in f["source_files"]:
            lines.append(f"  - referenced by `{s}`")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    version_to_branch = load_versions_csv()

    if len(sys.argv) > 1:
        files = [Path(a) for a in sys.argv[1:]]
    else:
        files = list(DOCS_ROOT.rglob("*.md"))

    print(f"Scanning {len(files)} file(s) for SQL diagram remote_include tags...")
    diagram_includes = scan_files(files)
    print(f"Found {len(diagram_includes)} unique (version, diagram) pair(s).\n")

    failures = run_checks(diagram_includes, version_to_branch)

    comment = format_comment(failures)
    if os.environ.get("GITHUB_ACTIONS"):
        summary = os.environ.get("GITHUB_STEP_SUMMARY")
        if summary:
            Path(summary).write_text(comment, encoding="utf-8")
        Path("pr-comment.md").write_text(comment, encoding="utf-8")

    if failures:
        print(f"\n--- Issues ---", file=sys.stderr)
        for f in failures:
            print(f"  {f['message']}", file=sys.stderr)
            for s in f["source_files"]:
                print(f"    referenced by: {s}", file=sys.stderr)
        print(f"\nTotal: {len(failures)} broken anchor(s).", file=sys.stderr)
        sys.exit(1)
    else:
        print("\nAll diagram anchor checks passed.")
        sys.exit(0)


if __name__ == "__main__":
    main()
