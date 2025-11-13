import asyncio

import pytest

from python_mcp_crdb_docs.core import fetch


@pytest.mark.asyncio
async def test_fetch_markdown_from_raw_uses_cache(monkeypatch):
    calls = 0

    async def fake_fetch(urls):
        nonlocal calls
        calls += 1
        return "data"

    monkeypatch.setattr(fetch, "_fetch_first", fake_fetch)
    fetch._MD_CACHE.clear()
    result1 = await fetch.fetch_markdown_from_raw("stable", "foo")
    result2 = await fetch.fetch_markdown_from_raw("stable", "foo")
    assert result1 == result2 == "data"
    assert calls == 1


@pytest.mark.asyncio
async def test_list_versions(monkeypatch):
    async def fake_client():
        class Dummy:
            async def __aenter__(self):
                return self

            async def __aexit__(self, *exc):
                return False

            async def get(self, url):
                class Resp:
                    status_code = 200

                    def raise_for_status(self):
                        pass

                    def json(self):
                        return [
                            {"type": "dir", "name": "current"},
                            {"type": "file", "name": "README.md"},
                        ]

                return Resp()

        return Dummy()

    class DummyClient:
        async def __aenter__(self):
            return self

        async def __aexit__(self, *exc):
            return False

        async def get(self, url):
            class Resp:
                status_code = 200

                def raise_for_status(self):
                    pass

                def json(self):
                    return [
                        {"type": "dir", "name": "current"},
                        {"type": "dir", "name": "stable"},
                    ]

            return Resp()

    monkeypatch.setattr(fetch, "create_client", lambda: DummyClient())
    fetch._MD_CACHE.clear()
    versions = await fetch.list_versions_from_github()
    assert versions == ["current", "stable"]
