"""Entry point for the FastMCP CockroachDB docs server."""

from __future__ import annotations

import os

from .core.fastmcp_compat import FastMCP, HTTPTransport

from .resources.doc_resource import resolve_doc_uri
from .tools.get_page import GetPageArgs, get_page
from .tools.list_versions import list_versions
from .tools.search import SearchArgs, search_docs

mcp = FastMCP("cockroachdb-docs")
mcp.add_tool("search_docs", search_docs, args_model=SearchArgs)
mcp.add_tool("get_page", get_page, args_model=GetPageArgs)
mcp.add_tool("list_versions", list_versions)
mcp.add_resource("doc", scheme="doc://", handler=resolve_doc_uri)


def main() -> None:
    transport = HTTPTransport(host="0.0.0.0", port=int(os.getenv("PORT", "3000")))
    mcp.run(transport=transport)


if __name__ == "__main__":  # pragma: no cover
    main()
