"""Mapping helpers between docs URLs and GitHub raw URLs."""

from __future__ import annotations

from urllib.parse import urlparse

BASE_RAW = "https://raw.githubusercontent.com/cockroachdb/docs"
MAIN_BRANCH = "main"


def infer_version_path(url_path: str) -> str:
    parts = [p for p in url_path.split("/") if p]
    if len(parts) < 2:
        return "src/current"
    if parts[0] != "docs":
        return "src/current"
    version = parts[1]
    remainder = "/".join(parts[2:]) or "index.html"
    if remainder.endswith(".html"):
        remainder = remainder[:-5] + ".md"
    return f"src/{version}/{remainder}"


def raw_url_from_github_tree(tree_url: str) -> str:
    parsed = urlparse(tree_url)
    parts = [p for p in parsed.path.split("/") if p]
    if len(parts) < 5:
        raise ValueError("Unexpected GitHub tree URL")
    owner, repo, _, branch, *path = parts
    raw_path = "/".join(path)
    return f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{'/'.join(path)}"


def build_raw_url(version: str, path: str, extension_priority: tuple[str, ...] = (".md", ".mdx")) -> list[str]:
    base = f"{BASE_RAW}/{MAIN_BRANCH}/src/{version}/{path.strip('/') }"
    candidates = []
    if "." in base.split("/")[-1]:
        candidates.append(base)
    else:
        for ext in extension_priority:
            candidates.append(f"{base}{ext}")
    return candidates
