"""HTTP client with timeouts, allowlist, and response size guards."""

from __future__ import annotations

import asyncio
from typing import Any

import httpx

from .allowlist import ensure_allowed
from .logging import debug

MAX_RESPONSE_BYTES = 512 * 1024
REQUEST_TIMEOUT = 10.0


class SafeAsyncClient(httpx.AsyncClient):
    async def _request(self, *args: Any, **kwargs: Any) -> httpx.Response:  # type: ignore[override]
        url = str(kwargs.get("url") or args[1])
        ensure_allowed(url)
        kwargs.setdefault("timeout", REQUEST_TIMEOUT)
        debug("http_request", method=args[0] if args else kwargs.get("method"), url=url)
        response = await super()._request(*args, **kwargs)
        content = await response.aread()
        if len(content) > MAX_RESPONSE_BYTES:
            raise httpx.HTTPStatusError("response too large", request=response.request, response=response)
        response._content = content  # type: ignore[attr-defined]
        return response


def create_client() -> SafeAsyncClient:
    return SafeAsyncClient(headers={"User-Agent": "python-mcp-crdb-docs/0.1"})
