import pytest

from python_mcp_crdb_docs.tools import search


@pytest.mark.asyncio
async def test_search_docs_formats_hits(monkeypatch):
    class DummyIndex:
        def search(self, query, params):
            assert query == "txn"
            assert params["hitsPerPage"] == 5
            return {
                "hits": [
                    {
                        "hierarchy": {"lvl0": "Transactions"},
                        "url": "https://example.com",
                        "_snippetResult": {"content": {"value": "<em>txn</em> docs"}},
                    }
                ],
                "nbHits": 1,
                "page": 0,
            }

    monkeypatch.setattr(search, "_index", DummyIndex())
    result = await search.search_docs(search.SearchArgs(query="txn", hits_per_page=5))
    assert result.content["hits"][0]["snippet"].startswith("txn")
