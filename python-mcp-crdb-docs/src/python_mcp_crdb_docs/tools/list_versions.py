"""list_versions tool."""

from __future__ import annotations

from ..core.fastmcp_compat import ToolResult
from ..core.fetch import list_versions_from_github


async def list_versions() -> ToolResult:
    versions = await list_versions_from_github()
    return ToolResult(content={"versions": versions})
