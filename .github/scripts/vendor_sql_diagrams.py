#!/usr/bin/env python3
"""Fetch SQL diagram HTML referenced by docs pages into local include files."""

from __future__ import annotations

import csv
import re
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
SRC_CURRENT = REPO_ROOT / "src" / "current"
VERSIONS_CSV = SRC_CURRENT / "_data" / "versions.csv"
VENDORED_ROOT = SRC_CURRENT / "_includes" / "cockroach-generated"
FETCH_WORKERS = 16

REMOTE_PREFIX = (
    "https://raw.githubusercontent.com/cockroachdb/generated-diagrams/"
    "{{ page.release_info.crdb_branch_name }}/grammar_svg/"
)
REMOTE_PATTERN = re.compile(
    r"{%\s*remote_include\s+"
    r"https://raw\.githubusercontent\.com/cockroachdb/generated-diagrams/"
    r"{{\s*page\.release_info\.crdb_branch_name\s*}}"
    r"/grammar_svg/([A-Za-z0-9_.-]+\.html)\s*%}"
)
HTML_COMMENT_PATTERN = re.compile(r"<!--.*?-->", re.DOTALL)
COMMENTED_DIAGRAM_BLOCK_PATTERN = re.compile(
    r"\n?<div>\n"
    r"{%\s*remote_include\s+"
    r"https://raw\.githubusercontent\.com/cockroachdb/generated-diagrams/"
    r"{{\s*page\.release_info\.crdb_branch_name\s*}}"
    r"/grammar_svg/[A-Za-z0-9_.-]+\.html\s*%}\n"
    r"</div>\n?",
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


def fetch(url: str) -> bytes:
    last_error: Exception | None = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(url, timeout=30) as response:
                return response.read()
        except (urllib.error.URLError, TimeoutError) as e:
            last_error = e
            if attempt < 2:
                time.sleep(2**attempt)
    raise RuntimeError(f"failed to fetch {url}: {last_error}")


def fetch_diagram(job: tuple[str, str, str, Path]) -> Path:
    _branch, _diagram, url, dest = job
    dest.write_bytes(fetch(url))
    return dest


def include_text(diagram: str) -> str:
    return (
        "{% capture diagram_include %}"
        "cockroach-generated/{{ page.release_info.crdb_branch_name }}"
        f"/sql-diagrams/{diagram}"
        "{% endcapture %}{% include {{ diagram_include }} %}"
    )


def strip_commented_diagram_blocks(text: str) -> str:
    def clean_comment(match: re.Match[str]) -> str:
        return COMMENTED_DIAGRAM_BLOCK_PATTERN.sub("\n", match.group(0))

    return HTML_COMMENT_PATTERN.sub(clean_comment, text)


def comment_spans(text: str) -> list[tuple[int, int]]:
    return [(m.start(), m.end()) for m in HTML_COMMENT_PATTERN.finditer(text)]


def in_spans(offset: int, spans: list[tuple[int, int]]) -> bool:
    return any(start <= offset < end for start, end in spans)


def rewrite_active_diagrams(text: str) -> tuple[str, set[str]]:
    text = strip_commented_diagram_blocks(text)
    spans = comment_spans(text)
    parts: list[str] = []
    diagrams: set[str] = set()
    last = 0

    for match in REMOTE_PATTERN.finditer(text):
        if in_spans(match.start(), spans):
            continue
        diagram = match.group(1)
        diagrams.add(diagram)
        parts.append(text[last : match.start()])
        parts.append(include_text(diagram))
        last = match.end()

    if not diagrams:
        return text, set()

    parts.append(text[last:])
    return "".join(parts), diagrams


def main() -> int:
    branch_names = load_branch_names()
    inventory: dict[str, set[str]] = {}
    page_rewrites: list[tuple[Path, str]] = []

    for page in sorted(SRC_CURRENT.glob("v*/*.md")):
        version = version_for_page(page)
        if version is None:
            continue
        branch = branch_names.get(version)
        if branch is None:
            raise RuntimeError(f"no crdb_branch_name for {version}")

        text = page.read_text()
        rewritten, diagrams = rewrite_active_diagrams(text)
        if not diagrams:
            if rewritten != text:
                page_rewrites.append((page, rewritten))
            continue

        inventory.setdefault(branch, set()).update(diagrams)
        page_rewrites.append((page, rewritten))

    if not inventory:
        print("No SQL diagram remote_include tags found.")
        return 0

    jobs: list[tuple[str, str, str, Path]] = []
    for branch, diagrams in sorted(inventory.items()):
        dest_dir = VENDORED_ROOT / branch / "sql-diagrams"
        dest_dir.mkdir(parents=True, exist_ok=True)
        for diagram in sorted(diagrams):
            url = (
                "https://raw.githubusercontent.com/cockroachdb/generated-diagrams/"
                f"{branch}/grammar_svg/{diagram}"
            )
            jobs.append((branch, diagram, url, dest_dir / diagram))

    fetched = 0
    with ThreadPoolExecutor(max_workers=min(FETCH_WORKERS, len(jobs))) as executor:
        futures = [executor.submit(fetch_diagram, job) for job in jobs]
        for future in as_completed(futures):
            future.result()
            fetched += 1

    for page, rewritten in page_rewrites:
        page.write_text(rewritten)

    expected = {
        VENDORED_ROOT / branch / "sql-diagrams" / diagram
        for branch, diagrams in inventory.items()
        for diagram in diagrams
    }
    for existing in VENDORED_ROOT.glob("*/sql-diagrams/*.html"):
        if existing not in expected:
            existing.unlink()

    missing: list[str] = []
    for branch, diagrams in sorted(inventory.items()):
        for diagram in sorted(diagrams):
            dest = VENDORED_ROOT / branch / "sql-diagrams" / diagram
            if not dest.exists():
                missing.append(str(dest.relative_to(REPO_ROOT)))

    remaining = []
    for page in sorted(SRC_CURRENT.glob("v*/*.md")):
        text = page.read_text()
        if REMOTE_PREFIX in text or REMOTE_PATTERN.search(text):
            remaining.append(str(page.relative_to(REPO_ROOT)))

    print(f"Fetched {fetched} SQL diagram files.")
    print(f"Updated {len(page_rewrites)} docs pages.")

    if missing:
        print("Missing vendored diagram files:", file=sys.stderr)
        for path in missing:
            print(f"  {path}", file=sys.stderr)
        return 1

    if remaining:
        print("Remaining SQL diagram remote includes:", file=sys.stderr)
        for path in remaining:
            print(f"  {path}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
