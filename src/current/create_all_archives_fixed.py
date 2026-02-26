#!/usr/bin/env python3
"""
Create all documentation archives (v20.2, v21.1, v21.2, v22.1, v22.2)
with FIXED navigation that properly detects the version
"""
import subprocess
import shutil
import re
import tempfile
from pathlib import Path
import time
from bs4 import BeautifulSoup


def run_cmd(cmd_list, description):
    """Run a command using subprocess list form (no shell=True)."""
    print(f"    {description}...")
    result = subprocess.run(cmd_list, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"      Warning: {result.stderr[:200] if result.stderr else 'Command had issues but continuing'}")
    return result.returncode == 0


def fix_navigation_in_archive(version):
    """Apply navigation fixes to the archive using BeautifulSoup for DOM safety.

    Regex is applied only to the text content of <script> tags, never to raw
    HTML, so inline JSON, data attributes, and other non-JS content are not
    accidentally modified.
    """
    print(f"  Applying navigation fixes for {version}...")

    fixed_count = 0
    for html_file in Path("offline_snap").rglob("*.html"):
        try:
            soup = BeautifulSoup(
                html_file.read_text(encoding="utf-8", errors="replace"),
                "html.parser",
            )
            changed = False

            for script in soup.find_all("script"):
                txt = script.string
                if not txt:
                    continue
                original = txt

                # Fix 1: JavaScript syntax error — flexible regex to handle any
                # whitespace variation in the empty replacement argument.
                txt = re.sub(
                    r"url\.replace\(/\^stable\\\/\/, \s*\)\.replace\(/\\\/stable\\\/\/, '/"
                    + re.escape(version)
                    + r"/'\)",
                    f"url.replace(/^stable\\//, '{version}/').replace(/\\/stable\\//,'/{version}/')",
                    txt,
                )

                # Fix 2: Update old archiveMatch pattern to use the correct version.
                old_archive_match = re.compile(
                    r"var archiveMatch = currentPath\.match\("
                    r"/\\/\(\[\^/\]\+\)\\/\(docs\|v[\d\.\\]+\|releases\|advisories\|cockroachcloud\|molt\)\\//\);",
                )
                if old_archive_match.search(txt):
                    txt = old_archive_match.sub(
                        f"var archiveMatch = currentPath.match("
                        f"/\\/([^\\/]+)\\/(docs|{version.replace('.', '\\.')}|releases|advisories|cockroachcloud|molt)\\//);",
                        txt,
                    )

                # Fix 3: Replace old two-method detection block with knownDirs approach.
                if "var knownDirs" not in txt and "archiveMatch = currentPath.match" in txt:
                    old_detection = (
                        "                        // Method 1: Look for _internal folder pattern\n"
                        "                        var internalMatch = currentPath.match(/\\/([^\\/]+)\\/_internal\\//);\\n"
                        "                        if (internalMatch) {\n"
                        "                            archiveFolder = internalMatch[1];\n"
                        "                            offlineSnapIndex = currentPath.indexOf('/' + archiveFolder + '/');\n"
                        "                        } else {\n"
                        "                            // Method 2: Look for archive structure (docs, "
                        + version.replace(".", "\\.")
                        + ", releases, etc.)\n"
                        "                            var archiveMatch = currentPath.match(/\\/([^\\/]+)\\/(docs|"
                        + version.replace(".", "\\.")
                        + "|releases|advisories|cockroachcloud|molt)\\//);\\n"
                        "                            if (archiveMatch) {\n"
                        "                                archiveFolder = archiveMatch[1];\n"
                        "                                offlineSnapIndex = currentPath.indexOf('/' + archiveFolder + '/');\n"
                        "                            }\n"
                        "                        }"
                    )
                    new_detection = (
                        "                        // Archive detection - handles nested known directories\n"
                        "                        var offlineSnapIndex = -1;\n"
                        "                        var archiveFolder = '';\n\n"
                        "                        // Split path into parts for analysis\n"
                        "                        var pathParts = currentPath.split('/').filter(function(p) { return p; });\n\n"
                        "                        // List of known directories in our documentation structure\n"
                        f"                        var knownDirs = ['{version}', 'cockroachcloud', 'releases', 'advisories', 'molt', '_internal'];\n\n"
                        "                        // Check if the path contains any known directories\n"
                        "                        var hasKnownDir = false;\n"
                        "                        var firstKnownDirIndex = -1;\n"
                        "                        for (var j = 0; j < pathParts.length; j++) {\n"
                        "                            if (knownDirs.indexOf(pathParts[j]) !== -1) {\n"
                        "                                hasKnownDir = true;\n"
                        "                                if (firstKnownDirIndex === -1) {\n"
                        "                                    firstKnownDirIndex = j;\n"
                        "                                }\n"
                        "                            }\n"
                        "                        }\n\n"
                        "                        if (!hasKnownDir && pathParts.length > 0) {\n"
                        "                            archiveFolder = pathParts[pathParts.length - 2];\n"
                        "                            if (archiveFolder && archiveFolder.indexOf('.html') === -1) {\n"
                        "                                offlineSnapIndex = currentPath.lastIndexOf('/' + archiveFolder + '/');\n"
                        "                            }\n"
                        "                        } else if (firstKnownDirIndex > 0) {\n"
                        f"                            // Archive folder is the parent of the first known subdir\n"
                        "                            archiveFolder = pathParts[firstKnownDirIndex - 1];\n"
                        "                            offlineSnapIndex = currentPath.lastIndexOf('/' + archiveFolder + '/');\n"
                        "                        }"
                    )
                    txt = txt.replace(old_detection, new_detection)

                if txt != original:
                    script.string = txt
                    changed = True

            if changed:
                html_file.write_text(str(soup), encoding="utf-8")
                fixed_count += 1

        except Exception:
            continue

    print(f"    Fixed {fixed_count} files")


def create_version_archive(version):
    """Create archive for a specific version."""
    print(f"\n{'='*60}")
    print(f"Creating {version} archive with FIXED navigation")
    print("=" * 60)

    # Clean up
    if Path("offline_snap").exists():
        shutil.rmtree("offline_snap")

    # Step 1: Write a version-specific copy of snapshot_relative.py to a temp
    # file so the checked-in source is never modified in-place.
    print(f"Setting up for {version}...")
    snapshot_content = Path("snapshot_relative.py").read_text()

    snapshot_content = re.sub(r"sidebar-v[\d.]+\.html", f"sidebar-{version}.html", snapshot_content)
    snapshot_content = re.sub(r'TARGET_VERSION = "[^"]*"', f'TARGET_VERSION = "{version}"', snapshot_content)

    tmp_snap = tempfile.NamedTemporaryFile(mode="w", suffix="_snapshot.py", dir=".", delete=False)
    tmp_snap.write(snapshot_content)
    tmp_snap.close()
    tmp_snap_path = Path(tmp_snap.name)

    print(f"\nRunning the 14-step archive creation process for {version}...")

    # Step 1: Create base archive using the temp snapshot (never touches snapshot_relative.py)
    run_cmd(["python3", tmp_snap_path.name], "Step 1: Creating base archive")
    tmp_snap_path.unlink(missing_ok=True)

    # Step 2: Apply navigation fixes
    run_cmd(["python3", "fix_navigation_quick.py"], "Step 2: Applying navigation fixes")

    # Step 3: Fix version placeholders (write a temp helper script, run it, delete it)
    print("  Step 3: Fixing version placeholders...")
    fix_versions_script = f"""#!/usr/bin/env python3
from pathlib import Path
import re

for html in Path("offline_snap").rglob("*.html"):
    content = html.read_text()
    content = re.sub(r'/v2\\.1/', '/{version}/', content)
    content = re.sub(r'"v2\\.1/', '"{version}/', content)
    content = re.sub(r"'v2\\.1/", "'{version}/", content)
    content = re.sub(r'v2\\.1\\.html', '{version}.html', content)
    content = re.sub(r'sidebar-v2\\.1', 'sidebar-{version}', content)
    content = content.replace('${{VERSION}}', '{version}')
    content = re.sub(r'/stable/', '/{version}/', content)
    html.write_text(content)
print("Fixed version placeholders")
"""
    ver_script = Path(f"fix_{version.replace('.', '_')}_versions.py")
    ver_script.write_text(fix_versions_script)
    run_cmd(["python3", ver_script.name], "    Running version fix")

    # Step 4: Remove non-target sidebars (pure Python, no shell glob/find)
    print("    Step 4: Removing other version sidebars...")
    internal_dir = Path("offline_snap/_internal")
    if internal_dir.exists():
        for sidebar in internal_dir.glob("sidebar-v*.html"):
            if sidebar.name != f"sidebar-{version}.html":
                sidebar.unlink()

    # Step 5: Clean target version sidebar
    print(f"  Step 5: Cleaning {version} sidebar...")
    sidebar_file = Path(f"offline_snap/_internal/sidebar-{version}.html")
    if sidebar_file.exists():
        content = sidebar_file.read_text()
        major_minor = ".".join(version[1:].split(".")[:2]) if version.startswith("v") else version
        major = int(major_minor.split(".")[0])
        minor = int(major_minor.split(".")[1])

        newer = []
        for maj in range(major + 1, 27):
            for min_ in range(1, 5):
                newer.append(f"v{maj}.{min_}")
        for min_ in range(minor + 1, 5):
            newer.append(f"v{major}.{min_}")

        for v in newer:
            content = re.sub(f"<a[^>]*{v}[^>]*>.*?</a>", "", content, flags=re.DOTALL)
            content = re.sub(f"<li[^>]*>.*?{v}.*?</li>", "", content, flags=re.DOTALL)

        sidebar_file.write_text(content)

    # Steps 6-14
    run_cmd(["python3", "fix_js_sidebar_final.py"], "Step 6: Fixing JavaScript sidebar")
    run_cmd(["python3", "fix_remaining_v25_refs.py"], "Step 7: Fixing remaining references")

    # Step 8: Create advisories directory (pure Python)
    Path("offline_snap/advisories/internal").mkdir(parents=True, exist_ok=True)
    print("    Step 8: Created advisories directory")

    # Step 9: Copy advisories JSON (pure Python, ignore if missing)
    src_json = Path("_site/docs/advisories/internal/advisories.json")
    if src_json.exists():
        shutil.copy2(src_json, "offline_snap/advisories/internal/advisories.json")
        print("    Step 9: Copied advisories JSON")
    else:
        print("    Step 9: advisories.json not found, skipping")

    run_cmd(["python3", "fix_incomplete_sidebars.py"], "Step 10: Fixing incomplete sidebars")

    print(f"  Step 11: Making navigation dynamic with correct version ({version})...")
    run_cmd(
        ["python3", "make_navigation_dynamic_v2.py", "offline_snap", version],
        "    Making navigation dynamic with version-specific detection",
    )

    run_cmd(["python3", "fix_root_navigation.py"], "Step 12: Fixing root navigation")
    run_cmd(["python3", "fix_broken_sidebar_links.py"], "Step 13: Fixing broken sidebar links")
    run_cmd(["python3", "fix_final_broken_links.py"], "Step 14: Fixing final broken links")

    fix_navigation_in_archive(version)

    # Create ZIP (pure Python, no external zip binary)
    print(f"\nCreating ZIP archive for {version}...")
    zip_stem = f"cockroachdb-docs-{version}-offline"
    shutil.make_archive(zip_stem, "zip", ".", "offline_snap")

    # Cleanup temp version script
    ver_script.unlink(missing_ok=True)

    zip_file = Path(f"{zip_stem}.zip")
    if zip_file.exists():
        size_mb = zip_file.stat().st_size / (1024 * 1024)
        print(f"Created: {zip_file.name} ({size_mb:.1f} MB)")
    else:
        print(f"Failed to create {zip_file.name}")

    return zip_file.exists()


def main():
    """Main function to create all archives."""
    versions = ["v20.2", "v21.1", "v21.2", "v22.1", "v22.2"]
    successful = []
    failed = []

    print("=" * 60)
    print("Creating Documentation Archives with FIXED Navigation")
    print(f"   Versions: {', '.join(versions)}")
    print("=" * 60)

    start_time = time.time()

    for version in versions:
        if create_version_archive(version):
            successful.append(version)
        else:
            failed.append(version)

    if Path("offline_snap").exists():
        shutil.rmtree("offline_snap")

    elapsed = time.time() - start_time
    print("\n" + "=" * 60)
    print("Archive Creation Summary")
    print("=" * 60)
    print(f"Successful: {', '.join(successful) if successful else 'None'}")
    if failed:
        print(f"Failed: {', '.join(failed)}")
    print(f"Total time: {elapsed:.1f} seconds")
    print("=" * 60)

    print("\nCreated Archives:")
    for version in successful:
        zip_file = Path(f"cockroachdb-docs-{version}-offline.zip")
        if zip_file.exists():
            size_mb = zip_file.stat().st_size / (1024 * 1024)
            print(f"   - {zip_file.name}: {size_mb:.1f} MB")


if __name__ == "__main__":
    main()
