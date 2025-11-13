"""doc:// resource handler."""

from __future__ import annotations

from ..core.fastmcp_compat import ResourceResult, TextResource
from ..core.fetch import fetch_markdown_from_raw


async def resolve_doc_uri(uri: str) -> ResourceResult:
    _, remainder = uri.split("doc://", 1)
    version, _, path = remainder.partition("/")
    if not version or not path:
        raise ValueError("Resource must look like doc://{version}/{path}")
    markdown = await fetch_markdown_from_raw(version, path)
    if markdown is None:
        raise FileNotFoundError(path)
    return TextResource(content=markdown, mime_type="text/markdown")
