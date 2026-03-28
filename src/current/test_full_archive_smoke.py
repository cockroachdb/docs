#!/usr/bin/env python3
"""
Smoke test for create_full_archive.py.

Creates a minimal _site/docs fixture, runs FullArchiveCreator.build(), and
verifies key invariants without requiring a full Jekyll build or network access.

Run from src/current/:
    python3 test_full_archive_smoke.py
"""
import re
import shutil
import sys
import tempfile
from pathlib import Path
from unittest.mock import patch

SCRIPT_DIR = Path(__file__).parent
STABLE_VERSION = "v26.1"

# Minimal HTML page with a /docs/-prefixed href and a Google Fonts link
FIXTURE_HTML = """\
<!DOCTYPE html>
<html>
<head>
  <title>Test Page</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins&display=swap">
  <link rel="stylesheet" href="/docs/css/styles.css">
</head>
<body>
  <a href="/docs/stable/overview.html">Overview</a>
  <a href="/docs/cockroachcloud/index.html">CockroachCloud</a>
  <script>
    var baseUrl = "/docs";
  </script>
</body>
</html>"""

FIXTURE_CSS = "body { font-family: Arial; }"


def _build_fixture(site_dir: Path):
    """Populate a minimal _site/docs tree."""
    version_dir = site_dir / STABLE_VERSION
    version_dir.mkdir(parents=True)
    (version_dir / "index.html").write_text(FIXTURE_HTML, encoding="utf-8")

    css_dir = site_dir / "css"
    css_dir.mkdir()
    (css_dir / "styles.css").write_text(FIXTURE_CSS, encoding="utf-8")

    js_dir = site_dir / "js"
    js_dir.mkdir()
    (js_dir / "jquery.min.js").write_text("/* jquery stub */", encoding="utf-8")
    (js_dir / "jquery.cookie.min.js").write_text("/* cookie stub */", encoding="utf-8")
    (js_dir / "jquery.navgoco.min.js").write_text("/* navgoco stub */", encoding="utf-8")

    css_navgoco = site_dir / "css" / "jquery.navgoco.css"
    css_navgoco.write_text("/* navgoco css stub */", encoding="utf-8")

    (site_dir / "index.html").write_text(FIXTURE_HTML, encoding="utf-8")


def _make_creator(site_dir: Path, output_dir: Path):
    sys.path.insert(0, str(SCRIPT_DIR))
    from create_full_archive import FullArchiveCreator
    sys.path.pop(0)
    return FullArchiveCreator(
        site_dir=str(site_dir),
        output_dir=str(output_dir),
        stable_version=STABLE_VERSION,
    )


def test_output_dir_created(site_dir, output_dir):
    """Output directory is created and index.html is present."""
    creator = _make_creator(site_dir, output_dir)

    # Stub out network calls so the test works offline
    with patch.object(creator, "download_google_fonts", return_value=None), \
         patch.object(creator, "ensure_nav_assets", return_value=None):
        creator.build(create_zip=False)

    assert output_dir.exists(), "FAIL: output directory was not created"
    assert (output_dir / "index.html").exists(), "FAIL: index.html not in output"
    print("  PASS: output directory created and index.html present")


def test_no_stable_artifacts(site_dir, output_dir):
    """No internal /stable/ path remains in processed HTML (external https:// links are allowed)."""
    creator = _make_creator(site_dir, output_dir)

    with patch.object(creator, "download_google_fonts", return_value=None), \
         patch.object(creator, "ensure_nav_assets", return_value=None):
        creator.build(create_zip=False)

    # Match href/src that start with a relative or absolute *internal* path containing /stable/
    # External URLs (https://) are intentional (e.g. the archived banner link) and excluded.
    stable_pattern = re.compile(r'(?:href|src)=["\'](?!https?://)[^"\']*?/stable/')
    for html_file in output_dir.rglob("*.html"):
        content = html_file.read_text(encoding="utf-8", errors="replace")
        match = stable_pattern.search(content)
        assert not match, (
            f"FAIL: internal /stable/ artifact found in {html_file}: {match.group()}"
        )
    print("  PASS: no internal /stable/ artifacts in processed HTML")


def test_nav_assets_present(site_dir, output_dir):
    """Navigation JS assets exist in the output directory."""
    creator = _make_creator(site_dir, output_dir)

    with patch.object(creator, "download_google_fonts", return_value=None), \
         patch.object(creator, "ensure_nav_assets", return_value=None):
        creator.build(create_zip=False)

    # ensure_nav_assets is stubbed, but assets were copied from fixture
    assert (output_dir / "js" / "jquery.min.js").exists(), (
        "FAIL: jquery.min.js missing from output"
    )
    print("  PASS: nav assets present in output")


def test_zip_created(site_dir, output_dir):
    """ZIP archive is created when --zip flag is used."""
    creator = _make_creator(site_dir, output_dir)

    with patch.object(creator, "download_google_fonts", return_value=None), \
         patch.object(creator, "ensure_nav_assets", return_value=None):
        creator.build(create_zip=True)

    zip_path = output_dir.with_suffix(".zip")
    assert zip_path.exists(), f"FAIL: expected zip at {zip_path}"
    assert zip_path.stat().st_size > 0, "FAIL: zip file is empty"
    print("  PASS: complete_archive.zip created and non-empty")


def main():
    print("Running full archive smoke tests...")
    failures = []

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        site_dir = tmp_path / "_site" / "docs"
        _build_fixture(site_dir)

        tests = [
            ("output dir created + index.html present",
             lambda: test_output_dir_created(site_dir, tmp_path / "out1")),
            ("no /stable/ artifacts in output HTML",
             lambda: test_no_stable_artifacts(site_dir, tmp_path / "out2")),
            ("nav assets present",
             lambda: test_nav_assets_present(site_dir, tmp_path / "out3")),
            ("zip created",
             lambda: test_zip_created(site_dir, tmp_path / "out4")),
        ]

        for name, fn in tests:
            try:
                fn()
            except AssertionError as e:
                print(f"  {e}")
                failures.append(name)
            except Exception as e:
                print(f"  ERROR in '{name}': {e}")
                failures.append(name)

    if failures:
        print(f"\nFAILED: {len(failures)} test(s): {', '.join(failures)}")
        sys.exit(1)
    else:
        print(f"\nAll {len(tests)} smoke tests passed.")


if __name__ == "__main__":
    main()
