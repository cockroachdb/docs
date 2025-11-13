from python_mcp_crdb_docs.core import mapping


def test_build_raw_url_adds_extensions():
    urls = mapping.build_raw_url("stable", "cockroach-start")
    assert urls[0].endswith("cockroach-start.md")
    assert urls[1].endswith("cockroach-start.mdx")


def test_infer_version_path_default():
    assert mapping.infer_version_path("/docs/stable/cockroach-start.html").endswith("cockroach-start.md")
