#!/usr/bin/env python3
"""
Smoke test for archive creation scripts.

Creates a minimal offline_snap fixture, runs fix_navigation_in_archive(),
and verifies invariants without requiring a full Jekyll build.

Run from src/current/:
    python3 test_archive_smoke.py
"""
import hashlib
import shutil
import sys
import tempfile
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
VERSION = "v22.2"

# Broken JS that the fix should correct (matches what make_navigation_dynamic.py writes)
BROKEN_JS = (
    f"url = url.replace(/^stable\\//, ).replace(/\\/stable\\//, '/{VERSION}/');"
)
# Expected output after fix (no space after comma — matches replacement string in script)
FIXED_JS = (
    f"url = url.replace(/^stable\\//, '{VERSION}/')"
    f".replace(/\\/stable\\//,'/{VERSION}/');"
)

BROKEN_HTML = f"""<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
<script>
var url = window.location.href;
{BROKEN_JS}
document.write(url);
</script>
</body>
</html>"""

CLEAN_HTML = """<!DOCTYPE html>
<html><head><title>No JS</title></head><body><p>No scripts here.</p></body></html>"""


def _sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def test_fix_navigation(work_dir):
    """fix_navigation_in_archive() patches broken JS only inside <script> tags."""
    snap = work_dir / "offline_snap" / VERSION
    snap.mkdir(parents=True)

    broken_file = snap / "index.html"
    clean_file = snap / "about.html"
    broken_file.write_text(BROKEN_HTML, encoding="utf-8")
    clean_file.write_text(CLEAN_HTML, encoding="utf-8")

    # Temporarily make offline_snap visible from cwd (the function uses Path("offline_snap"))
    orig_cwd = Path.cwd()
    import os
    os.chdir(work_dir)
    try:
        sys.path.insert(0, str(SCRIPT_DIR))
        from create_all_archives_fixed import fix_navigation_in_archive
        fix_navigation_in_archive(VERSION)
    finally:
        os.chdir(orig_cwd)
        sys.path.pop(0)

    patched = broken_file.read_text(encoding="utf-8")
    assert BROKEN_JS not in patched, (
        f"FAIL: broken JS pattern still present in {broken_file}\n{patched}"
    )
    assert FIXED_JS in patched, (
        f"FAIL: expected fixed JS not found in {broken_file}\n{patched}"
    )

    # Clean file must be unchanged (BeautifulSoup reserialises, but no JS change)
    assert "No scripts here." in clean_file.read_text(), (
        "FAIL: clean HTML file was unexpectedly modified"
    )
    print("  PASS: fix_navigation_in_archive patches broken JS via script tags only")


def test_snapshot_relative_unchanged():
    """snapshot_relative.py must not be modified by running the archive scripts."""
    snapshot = SCRIPT_DIR / "snapshot_relative.py"
    if not snapshot.exists():
        print("  SKIP: snapshot_relative.py not present")
        return

    before = _sha256(snapshot)

    # Import the module (which should not touch the file on import)
    sys.path.insert(0, str(SCRIPT_DIR))
    try:
        import importlib
        import create_all_archives_fixed  # noqa: F401
        importlib.import_module("create_all_archives_fixed")
    finally:
        sys.path.pop(0)

    after = _sha256(snapshot)
    assert before == after, (
        "FAIL: snapshot_relative.py hash changed after importing create_all_archives_fixed"
    )
    print("  PASS: snapshot_relative.py is unchanged after module import")


def test_no_shell_true():
    """Neither create_all_archives_fixed.py nor create_single_archive.py should
    pass shell=True to subprocess.run()."""
    import re
    # Match shell=True as an actual keyword argument to subprocess.run, not in comments/docstrings.
    pattern = re.compile(r"subprocess\.run\s*\([^)]*shell\s*=\s*True")
    for script in ["create_all_archives_fixed.py", "create_single_archive.py"]:
        src = (SCRIPT_DIR / script).read_text()
        assert not pattern.search(src), (
            f"FAIL: subprocess.run(..., shell=True) found in {script}"
        )
    print("  PASS: no subprocess.run shell=True in archive creation scripts")


def main():
    print("Running archive smoke tests...")
    failures = []

    with tempfile.TemporaryDirectory() as tmp:
        work_dir = Path(tmp)

        tests = [
            ("fix_navigation_in_archive patches JS", lambda: test_fix_navigation(work_dir)),
            ("snapshot_relative.py unchanged", test_snapshot_relative_unchanged),
            ("no shell=True", test_no_shell_true),
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
