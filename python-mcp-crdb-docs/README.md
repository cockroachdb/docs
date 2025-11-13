# Python MCP Server for CockroachDB Docs

This package ships a FastMCP-compatible server that exposes CockroachDB documentation via:

* `search_docs` – Algolia-backed search results
* `get_page` – Fetch Markdown for a docs page, with HTML-to-source discovery
* `list_versions` – Enumerate available version folders from GitHub
* `doc://` resource scheme – Direct access to Markdown via version + path

## Local development

```bash
cd python-mcp-crdb-docs
pip install -e .[dev]
pytest
FASTMCP_LOG_LEVEL=INFO python -m python_mcp_crdb_docs.server
```

Configuration is handled with environment variables:

* `ALGOLIA_APP_ID` (default `HPNPWALV9D`)
* `ALGOLIA_SEARCH_KEY` (default search-only key for staging index)
* `ALGOLIA_INDEX` (default `stage_cockroach_docs`)

All HTTP requests are routed through a hardened client that enforces a 10s timeout, 512KB body limit, and allowlisted domains.
