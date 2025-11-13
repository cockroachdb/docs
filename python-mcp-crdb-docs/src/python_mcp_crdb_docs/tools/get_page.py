"""get_page tool."""

from __future__ import annotations

from pydantic import BaseModel, Field

from ..core.fastmcp_compat import ToolResult
from ..core.fetch import fetch_markdown_from_html_page, fetch_markdown_from_raw


class GetPageArgs(BaseModel):
    url: str | None = Field(default=None, description="Docs page URL")
    version: str | None = Field(default=None, description="Docs version folder, e.g. stable")
    path: str | None = Field(default=None, description="Path inside version, e.g. sql-statements.md")


async def get_page(args: GetPageArgs) -> ToolResult:
    if args.url:
        markdown = await fetch_markdown_from_html_page(args.url)
        resource = args.url
    elif args.version and args.path:
        markdown = await fetch_markdown_from_raw(args.version, args.path)
        resource = f"doc://{args.version}/{args.path}"
    else:
        raise ValueError("Either url or version+path must be provided")
    if markdown is None:
        raise FileNotFoundError("Unable to fetch Markdown")
    return ToolResult(content={"resource": resource, "markdown": markdown})
