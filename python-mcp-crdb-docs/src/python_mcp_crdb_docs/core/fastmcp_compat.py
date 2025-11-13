"""Fallback shim for fastmcp when the real package is unavailable."""

from __future__ import annotations

try:  # pragma: no cover
    from fastmcp import FastMCP, HTTPTransport, ResourceResult, TextResource, ToolResult
except ModuleNotFoundError:  # pragma: no cover - exercised when dependency missing
    class ToolResult:  # type: ignore[override]
        def __init__(self, content):
            self.content = content

    class ResourceResult:  # type: ignore[override]
        def __init__(self, content):
            self.content = content

    class TextResource(ResourceResult):  # type: ignore[override]
        def __init__(self, content: str, mime_type: str = "text/plain"):
            super().__init__(content)
            self.mime_type = mime_type

    class FastMCP:  # type: ignore[override]
        def __init__(self, name: str):
            self.name = name
            self.tools = {}
            self.resources = {}

        def add_tool(self, name, func, args_model=None):
            self.tools[name] = (func, args_model)

        def add_resource(self, name, scheme, handler):
            self.resources[scheme] = handler

        def run(self, transport=None):
            raise RuntimeError("fastmcp package not installed; server cannot run")

    class HTTPTransport:  # type: ignore[override]
        def __init__(self, host: str = "127.0.0.1", port: int = 3000):
            self.host = host
            self.port = port

__all__ = ["FastMCP", "HTTPTransport", "ToolResult", "ResourceResult", "TextResource"]
