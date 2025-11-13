"""Markdown fetching utilities."""

from __future__ import annotations

import re
from typing import Optional

from .cache import TTLCache
from .http import create_client
from .logging import debug
from .mapping import build_raw_url

_MD_CACHE = TTLCache[str, str](maxsize=128, ttl=120)


async def _fetch_first(urls: list[str]) -> Optional[str]:
    async with create_client() as client:
        for url in urls:
            resp = await client.get(url)
            if resp.status_code == 200:
                return resp.text
    return None


async def fetch_markdown_from_raw(version: str, path: str) -> Optional[str]:
    cache_key = f"raw:{version}:{path}"
    cached = _MD_CACHE.get(cache_key)
    if cached:
        return cached
    candidates = build_raw_url(version, path)
    content = await _fetch_first(candidates)
    if content:
        _MD_CACHE.set(cache_key, content)
    return content


def _extract_source_href(html: str) -> Optional[str]:
    anchor_pattern = re.compile(r"<a[^>]+href=\"([^\"]+)\"[^>]*>(.*?)</a>", re.IGNORECASE | re.DOTALL)
    tag_pattern = re.compile(r"<[^>]+>")
    for match in anchor_pattern.finditer(html):
        text = tag_pattern.sub("", match.group(2)).strip().lower()
        if "view page source" in text:
            return match.group(1)
    return None


async def fetch_markdown_from_html_page(url: str) -> Optional[str]:
    cache_key = f"html:{url}"
    cached = _MD_CACHE.get(cache_key)
    if cached:
        return cached
    async with create_client() as client:
        resp = await client.get(url)
        if resp.status_code != 200:
            return None
        href = _extract_source_href(resp.text)
        if not href:
            return None
        source_url = href
        if source_url.startswith("//"):
            source_url = f"https:{source_url}"
        elif source_url.startswith("/"):
            source_url = f"https://www.cockroachlabs.com{source_url}"
        raw_candidates = [source_url.replace("/blob/", "/raw/")]
        content = await _fetch_first(raw_candidates)
        if content:
            _MD_CACHE.set(cache_key, content)
        return content


async def list_versions_from_github() -> list[str]:
    cache_key = "versions"
    cached = _MD_CACHE.get(cache_key)
    if cached:
        return cached.split(",")
    async with create_client() as client:
        resp = await client.get("https://api.github.com/repos/cockroachdb/docs/contents/src")
        resp.raise_for_status()
        data = resp.json()
        versions = sorted(item["name"] for item in data if item.get("type") == "dir")
        _MD_CACHE.set(cache_key, ",".join(versions))
        return versions
