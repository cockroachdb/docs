"""Algolia search tool."""

from __future__ import annotations

import os
from typing import Any, Dict, List

try:  # pragma: no cover - dependency optional during tests
    from algoliasearch.search_client import SearchClient
except ModuleNotFoundError:  # pragma: no cover
    SearchClient = None  # type: ignore

import re
from pydantic import BaseModel, Field

from ..core.fastmcp_compat import ToolResult

ALGOLIA_APP_ID = os.getenv("ALGOLIA_APP_ID", "HPNPWALV9D")
ALGOLIA_SEARCH_KEY = os.getenv("ALGOLIA_SEARCH_KEY", "efe072446c86303530f568d267385786")
ALGOLIA_INDEX = os.getenv("ALGOLIA_INDEX", "stage_cockroach_docs")

_client = SearchClient.create(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY) if SearchClient else None
_index = _client.init_index(ALGOLIA_INDEX) if _client else None


class SearchArgs(BaseModel):
    query: str = Field(..., description="Search query")
    page: int = Field(0, ge=0, description="Algolia pagination page")
    hits_per_page: int = Field(10, ge=1, le=20)


_TAG_PATTERN = re.compile(r"<[^>]+>")


def _strip_html(value: str | None) -> str:
    if not value:
        return ""
    return _TAG_PATTERN.sub(" ", value).strip()


async def search_docs(args: SearchArgs) -> ToolResult:
    if _index is None:
        raise RuntimeError("algoliasearch dependency not installed")
    res = _index.search(args.query, {"page": args.page, "hitsPerPage": args.hits_per_page})
    hits: List[Dict[str, Any]] = []
    for hit in res.get("hits", []):
        hits.append(
            {
                "title": hit.get("hierarchy", {}).get("lvl0") or hit.get("title"),
                "url": hit.get("url"),
                "hierarchy": hit.get("hierarchy"),
                "snippet": _strip_html(hit.get("_snippetResult", {}).get("content", {}).get("value")),
            }
        )
    return ToolResult(
        content={
            "hits": hits,
            "nbHits": res.get("nbHits", 0),
            "page": res.get("page", 0),
        }
    )
