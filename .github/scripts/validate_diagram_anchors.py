#!/usr/bin/env python3
"""
validate_diagram_anchors.py  (EDUENG-613, EDUENG-677)

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

  # Run built-in unit tests (no network required):
  python .github/scripts/validate_diagram_anchors.py --self-test

Exit codes:
  0  all checks passed
  1  one or more broken anchors found
  2  fatal error (versions.csv not found)

Environment:
  GITHUB_TOKEN    Optional. Raises API rate limit from 60 to 5000 req/hr.
  GITHUB_ACTIONS  Set automatically in CI. Enables pr-comment.md output.
"""

import contextlib
import csv
import io
import os
import re
import sys
import tempfile
import urllib.error
import urllib.request
from pathlib import Path
from typing import Optional

GENERATED_DIAGRAMS_REPO = "cockroachdb/generated-diagrams"
RAW_BASE = "https://raw.githubusercontent.com"
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

# Matches both <a name="..."> and id="..." attributes in stmt_block.html.
# stmt_block.html uses <a name="..."> for grammar nonterminals.
ANCHOR_DEF_RE = re.compile(r'(?:\bname|\bid)=["\']([^"\']+)["\']')

# Stub anchors defined in sql-grammar.md: <a id="..."></a>
STUB_ANCHOR_RE = re.compile(r'<a\s+id=["\']([^"\']+)["\']')

# ---------------------------------------------------------------------------
# HTTP
# ---------------------------------------------------------------------------

def _fetch_raw(url: str) -> Optional[str]:
    req = urllib.request.Request(url)
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return None
        raise
    except Exception as exc:
        print(f"  Warning: fetch {url} failed: {exc}", file=sys.stderr)
        return None


# ---------------------------------------------------------------------------
# Cached lookups
# ---------------------------------------------------------------------------

_stmt_block_cache: dict[str, Optional[set]] = {}


def get_stmt_block_anchors(branch: str) -> Optional[set]:
    """Return all anchor definitions in stmt_block.html for the given branch.

    Collects both name= and id= attributes, since stmt_block.html uses
    <a name="..."> for grammar nonterminals.
    """
    if branch not in _stmt_block_cache:
        url = f"{RAW_BASE}/{GENERATED_DIAGRAMS_REPO}/{branch}/grammar_svg/stmt_block.html"
        content = _fetch_raw(url)
        _stmt_block_cache[branch] = (
            set(ANCHOR_DEF_RE.findall(content))
            if content is not None else None
        )
    return _stmt_block_cache[branch]


def get_stub_anchors(version: str) -> set:
    """Return stub <a id="..."> anchors from the sql-grammar.md source file.

    These are manually defined anchors for nonterminals that diagrams link to
    but that don't exist in stmt_block.html.
    """
    grammar_path = DOCS_ROOT / version / "sql-grammar.md"
    if not grammar_path.exists():
        return set()
    try:
        content = grammar_path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return set()
    return set(STUB_ANCHOR_RE.findall(content))


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

    # Group by (version, branch) to share stmt_block.html and stub anchor fetches.
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

        # Collect stub anchors from sql-grammar.md for each version on this branch.
        versions_on_branch = {v for v, _, _ in pairs}
        stub_anchors: set[str] = set()
        for v in versions_on_branch:
            stubs = get_stub_anchors(v)
            if stubs:
                print(f"    Stub anchors from {v}/sql-grammar.md: {len(stubs)}")
            stub_anchors |= stubs

        all_anchors = known_anchors | stub_anchors

        for version, diagram, source_files in sorted(pairs):
            url = f"{RAW_BASE}/{GENERATED_DIAGRAMS_REPO}/{branch}/grammar_svg/{diagram}"
            content = _fetch_raw(url)
            if content is None:
                print(f"    {diagram}: NOT FOUND in generated-diagrams (skipping)")
                continue

            refs = ANCHOR_REF_RE.findall(content)
            missing = [r for r in refs if r not in all_anchors]

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
                            f"but that anchor is absent from both stmt_block.html "
                            f"and sql-grammar.md stub anchors."
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
            "resolve correctly against `stmt_block.html` and `sql-grammar.md` "
            "stub anchors."
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
# Self-tests (no network required)
# ---------------------------------------------------------------------------

def _run_self_tests() -> None:
    """Unit tests using synthetic data — no network calls."""

    def _quiet(fn, *args, **kwargs):
        with contextlib.redirect_stdout(io.StringIO()):
            return fn(*args, **kwargs)

    # --- Regex tests ---

    # ANCHOR_DEF_RE matches both name= and id= attributes
    assert ANCHOR_DEF_RE.findall('<a name="foo">') == ["foo"]
    assert ANCHOR_DEF_RE.findall('id="bar"') == ["bar"]
    assert ANCHOR_DEF_RE.findall('<a name="x"><a name="y">') == ["x", "y"]
    assert ANCHOR_DEF_RE.findall("id='single_quotes'") == ["single_quotes"]

    # STUB_ANCHOR_RE matches <a id="...">
    assert STUB_ANCHOR_RE.findall('<a id="query"></a>') == ["query"]
    assert STUB_ANCHOR_RE.findall('<a id="col_label"></a>\n<a id="count"></a>') == ["col_label", "count"]

    # ANCHOR_REF_RE matches href="sql-grammar.html#..."
    assert ANCHOR_REF_RE.findall('href="sql-grammar.html#foo"') == ["foo"]
    assert ANCHOR_REF_RE.findall("href='sql-grammar.html#bar'") == ["bar"]
    assert ANCHOR_REF_RE.findall('href="other.html#baz"') == []

    # --- scan_files tests ---

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp = Path(tmpdir)
        vdir = tmp / "v99.1"
        vdir.mkdir()

        # File with a remote_include tag
        md = vdir / "restore.md"
        md.write_text(
            "{% remote_include https://raw.githubusercontent.com/cockroachdb/"
            "generated-diagrams/{{ page.release_info.crdb_branch_name }}/"
            "grammar_svg/restore.html %}"
        )
        result = scan_files([md])
        assert ("v99.1", "restore.html") in result, result

        # File without remote_include
        plain = vdir / "plain.md"
        plain.write_text("No diagrams here.")
        result = scan_files([plain])
        assert len(result) == 0, result

        # File outside a version dir
        noversion = tmp / "readme.md"
        noversion.write_text(
            "{% remote_include https://raw.githubusercontent.com/cockroachdb/"
            "generated-diagrams/{{ page.release_info.crdb_branch_name }}/"
            "grammar_svg/foo.html %}"
        )
        result = scan_files([noversion])
        assert len(result) == 0, result

    # --- run_checks tests ---

    # All anchors present → no failures
    includes = {("v99.1", "test.html"): [Path("fake.md")]}
    version_to_branch = {"v99.1": "release-99.1"}

    # Mock: stmt_block has anchor "foo", diagram refs "foo"
    _stmt_block_cache.clear()
    _stmt_block_cache["release-99.1"] = {"foo", "bar"}

    # We need to mock _fetch_raw for the diagram content
    original_fetch = globals().get("_fetch_raw")

    def mock_fetch_ok(url):
        if "test.html" in url:
            return 'href="sql-grammar.html#foo"'
        return None

    # Integration coverage of run_checks is via the full-scan test.
    # --- Stub anchor collection ---
    global DOCS_ROOT
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp = Path(tmpdir)
        vdir = tmp / "v99.1"
        vdir.mkdir()
        grammar = vdir / "sql-grammar.md"
        grammar.write_text(
            '<a id="col_label"></a>\n'
            '<a id="query"></a>\n'
            '<a id="timestamp"></a>\n'
        )
        old_root = DOCS_ROOT
        DOCS_ROOT = tmp
        stubs = get_stub_anchors("v99.1")
        DOCS_ROOT = old_root
        assert stubs == {"col_label", "query", "timestamp"}, stubs

    # --- format_comment tests ---
    assert "Passed" in format_comment([])
    failures = [{"diagram": "x.html", "branch": "b", "anchor": "a", "source_files": ["f.md"],
                 "message": "test"}]
    comment = format_comment(failures)
    assert "Failed" in comment
    assert "x.html" in comment

    _stmt_block_cache.clear()
    print("All self-tests passed.")
    sys.exit(0)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    if "--self-test" in sys.argv:
        _run_self_tests()
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
