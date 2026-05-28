#!/usr/bin/env python3
"""Fetch example app source referenced by docs pages into local include files."""

from __future__ import annotations

import hashlib
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
SRC_CURRENT = REPO_ROOT / "src" / "current"
VENDORED_ROOT = SRC_CURRENT / "_includes" / "example-apps"
FETCH_WORKERS = 16

REMOTE_INCLUDE_PATTERN = re.compile(
    r"{%\s*remote_include\s+"
    r"(?P<url>https://raw\.githubusercontent\.com/"
    r"(?P<owner>[^/\s%]+)/(?P<repo>[^/\s%]+)/(?P<ref>[^/\s%]+)/(?P<path>[^\s%]+))"
    r"(?P<args>\s+\|\|.*?|\s*)%}"
)
HTML_COMMENT_PATTERN = re.compile(r"<!--.*?-->", re.DOTALL)


@dataclass(frozen=True)
class IncludeSpec:
    url: str
    owner: str
    repo: str
    ref: str
    path: str
    start_marker: str | None = None
    end_marker: str | None = None

    @property
    def is_slice(self) -> bool:
        return self.start_marker is not None and self.end_marker is not None


def is_example_app_remote(owner: str, repo: str) -> bool:
    return owner == "cockroachlabs" or (
        owner == "cockroachdb" and repo.startswith("example-app-")
    )


def parse_markers(args: str) -> tuple[str | None, str | None]:
    args = args.strip()
    if not args:
        return None, None
    if not args.startswith("||"):
        raise ValueError(f"unexpected remote_include args: {args}")
    parts = args[2:].split("||", 1)
    if len(parts) != 2:
        raise ValueError(f"expected start and end markers in: {args}")
    start_marker = parts[0].strip()
    end_marker = parts[1].strip()
    if not start_marker or not end_marker:
        raise ValueError(f"empty start or end marker in: {args}")
    return start_marker, end_marker


def fetch(url: str) -> str:
    last_error: Exception | None = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(url, timeout=30) as response:
                charset = response.headers.get_content_charset() or "utf-8"
                return response.read().decode(charset)
        except (UnicodeDecodeError, urllib.error.URLError, TimeoutError) as e:
            last_error = e
            if attempt < 2:
                time.sleep(2**attempt)
    raise RuntimeError(f"failed to fetch {url}: {last_error}")


def extract_between_markers(content: str, spec: IncludeSpec) -> str:
    if spec.start_marker is None or spec.end_marker is None:
        return content

    start = content.find(spec.start_marker)
    if start == -1:
        raise RuntimeError(f"start marker not found in {spec.url}: {spec.start_marker}")
    after_start = start + len(spec.start_marker)
    end = content.find(spec.end_marker, after_start)
    if end == -1:
        raise RuntimeError(f"end marker not found in {spec.url}: {spec.end_marker}")

    snippet_start = content.find("\n", after_start)
    if snippet_start == -1 or snippet_start > end:
        snippet_start = after_start
    else:
        snippet_start += 1

    snippet_end = content.rfind("\n", snippet_start, end)
    if snippet_end == -1:
        snippet_end = end
    else:
        snippet_end += 1

    snippet = content[snippet_start:snippet_end]
    return snippet


def normalize_include_content(content: str) -> str:
    content = content.replace("\r\n", "\n").replace("\r", "\n")
    lines = [line.rstrip() for line in content.splitlines()]
    return "\n".join(lines).rstrip("\n") + "\n"


def marker_slug(marker: str) -> str:
    marker = marker.strip()
    marker = re.sub(r"^(--|#|//|/\*+|\*)\s*", "", marker)
    marker = re.sub(r"\s*\*/$", "", marker)
    marker = re.sub(r"^(START|BEGIN)\s+", "", marker, flags=re.IGNORECASE)
    marker = marker.strip().lower()
    marker = re.sub(r"[^a-z0-9]+", "-", marker).strip("-")
    return marker or hashlib.sha256(marker.encode()).hexdigest()[:8]


def local_include_path(spec: IncludeSpec) -> Path:
    rel_parts = [spec.owner, spec.repo, spec.ref]
    source_path = Path(urllib.parse.unquote(spec.path))
    if spec.is_slice:
        assert spec.start_marker is not None
        filename = source_path.name
        suffixes = "".join(source_path.suffixes)
        if suffixes:
            stem = filename[: -len(suffixes)]
            snippet_name = f"{stem}__{marker_slug(spec.start_marker)}{suffixes}"
        else:
            snippet_name = f"{filename}__{marker_slug(spec.start_marker)}"
        source_path = source_path.with_name(snippet_name)
    return Path("example-apps", *rel_parts) / source_path


def include_text(spec: IncludeSpec) -> str:
    return f"{{% include {local_include_path(spec).as_posix()} %}}"


def comment_spans(text: str) -> list[tuple[int, int]]:
    return [(m.start(), m.end()) for m in HTML_COMMENT_PATTERN.finditer(text)]


def in_spans(offset: int, spans: list[tuple[int, int]]) -> bool:
    return any(start <= offset < end for start, end in spans)


def spec_from_match(match: re.Match[str]) -> IncludeSpec | None:
    owner = match.group("owner")
    repo = match.group("repo")
    if not is_example_app_remote(owner, repo):
        return None

    start_marker, end_marker = parse_markers(match.group("args"))
    return IncludeSpec(
        url=match.group("url"),
        owner=owner,
        repo=repo,
        ref=match.group("ref"),
        path=match.group("path"),
        start_marker=start_marker,
        end_marker=end_marker,
    )


def rewrite_page(text: str) -> tuple[str, set[IncludeSpec]]:
    spans = comment_spans(text)
    parts: list[str] = []
    specs: set[IncludeSpec] = set()
    last = 0

    for match in REMOTE_INCLUDE_PATTERN.finditer(text):
        if in_spans(match.start(), spans):
            continue
        spec = spec_from_match(match)
        if spec is None:
            continue
        specs.add(spec)
        parts.append(text[last : match.start()])
        parts.append(include_text(spec))
        last = match.end()

    if not specs:
        return text, set()

    parts.append(text[last:])
    return "".join(parts), specs


def write_include(spec: IncludeSpec, remote_content: str) -> Path:
    content = normalize_include_content(extract_between_markers(remote_content, spec))
    if not content:
        raise RuntimeError(f"empty include content for {spec}")

    dest = SRC_CURRENT / "_includes" / local_include_path(spec)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(content)
    return dest


def main() -> int:
    page_rewrites: list[tuple[Path, str]] = []
    specs: set[IncludeSpec] = set()

    for page in sorted(SRC_CURRENT.glob("v*/*.md")):
        text = page.read_text()
        rewritten, page_specs = rewrite_page(text)
        if page_specs:
            specs.update(page_specs)
            page_rewrites.append((page, rewritten))

    if not specs:
        print("No example app remote_include tags found.")
        return 0

    urls = sorted({spec.url for spec in specs})
    remote_content: dict[str, str] = {}
    with ThreadPoolExecutor(max_workers=min(FETCH_WORKERS, len(urls))) as executor:
        futures = {executor.submit(fetch, url): url for url in urls}
        for future in as_completed(futures):
            url = futures[future]
            remote_content[url] = future.result()

    expected: set[Path] = set()
    include_owners: dict[Path, IncludeSpec] = {}
    for spec in sorted(specs, key=lambda s: local_include_path(s).as_posix()):
        rel = local_include_path(spec)
        previous = include_owners.get(rel)
        if previous is not None and previous != spec:
            raise RuntimeError(f"local include path collision: {rel}")
        include_owners[rel] = spec

        dest = write_include(spec, remote_content[spec.url])
        expected.add(dest)

    for page, rewritten in page_rewrites:
        page.write_text(rewritten)

    if VENDORED_ROOT.exists():
        for existing in VENDORED_ROOT.rglob("*"):
            if existing.is_file() and existing not in expected:
                existing.unlink()

    missing = [path for path in sorted(expected) if not path.exists()]
    remaining: list[str] = []
    for page in sorted(SRC_CURRENT.glob("v*/*.md")):
        text = page.read_text()
        for match in REMOTE_INCLUDE_PATTERN.finditer(text):
            spec = spec_from_match(match)
            if spec is not None:
                remaining.append(str(page.relative_to(REPO_ROOT)))
                break

    print(f"Fetched {len(urls)} example app source files.")
    print(f"Wrote {len(expected)} example app include files.")
    print(f"Updated {len(page_rewrites)} docs pages.")

    if missing:
        print("Missing vendored example app files:", file=sys.stderr)
        for path in missing:
            print(f"  {path.relative_to(REPO_ROOT)}", file=sys.stderr)
        return 1

    if remaining:
        print("Remaining example app remote includes:", file=sys.stderr)
        for path in remaining:
            print(f"  {path}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
