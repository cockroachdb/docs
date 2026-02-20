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

def run_cmd(cmd, description):
    """Run a shell command"""
    print(f"    {description}...")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0 and "verify" not in cmd.lower():
        print(f"      Warning: {result.stderr[:200] if result.stderr else 'Command had issues but continuing'}")
    return result.returncode == 0

def fix_navigation_in_archive(version):
    """Apply all navigation fixes to the archive"""
    print(f"  Applying navigation fixes for {version}...")

    fixed_count = 0
    for html_file in Path("offline_snap").rglob("*.html"):
        content = html_file.read_text()
        original = content

        # Fix 1: JavaScript syntax error — use flexible regex instead of exact string
        # match to handle any whitespace variation in the empty replacement argument
        content = re.sub(
            r"url\.replace\(/\^stable\\\/\/, \s*\)\.replace\(/\\\/stable\\\/\/, '/" + re.escape(version) + r"/'\)",
            f"url.replace(/^stable\\//, '{version}/').replace(/\\/stable\\//,'/{version}/')",
            content
        )

        # Fix 2: Archive detection with nested directory handling
        # Look for the old pattern that might exist
        old_patterns = [
            # Pattern from make_navigation_dynamic.py with v19.2
            re.compile(r'// Method 2: Look for archive structure \(docs, v19\.2, releases, etc\.\).*?var archiveMatch = currentPath\.match\(/\\/\(\[\^/\]\+\)\\/\(docs\|v19\\\.2\|releases\|advisories\|cockroachcloud\|molt\)\\//\);', re.DOTALL),
            # Pattern with any version
            re.compile(r'// Method 2: Look for archive structure.*?var archiveMatch = currentPath\.match\(/\\/\(\[\^/\]\+\)\\/\(docs\|v\d+\\\.\d+\|releases\|advisories\|cockroachcloud\|molt\)\\//\);', re.DOTALL),
        ]

        for pattern in old_patterns:
            if pattern.search(content):
                # Replace with the correct version
                content = re.sub(
                    r'var archiveMatch = currentPath\.match\(/\\/\(\[\^/\]\+\)\\/\(docs\|v[\d\.\\]+\|releases\|advisories\|cockroachcloud\|molt\)\\//\);',
                    f'var archiveMatch = currentPath.match(/\\/([^\\/]+)\\/(docs|{version.replace(".", "\\.")}|releases|advisories|cockroachcloud|molt)\\//);',
                    content
                )

        # Also apply the nested directory fix
        if 'var knownDirs' not in content and 'archiveMatch = currentPath.match' in content:
            # The file has old detection, update it with better logic
            old_detection = """                        // Method 1: Look for _internal folder pattern
                        var internalMatch = currentPath.match(/\\/([^\\/]+)\\/_internal\\//);
                        if (internalMatch) {
                            archiveFolder = internalMatch[1];
                            offlineSnapIndex = currentPath.indexOf('/' + archiveFolder + '/');
                        } else {
                            // Method 2: Look for archive structure (docs, """ + version.replace('.', '\\.') + """, releases, etc.)
                            var archiveMatch = currentPath.match(/\\/([^\\/]+)\\/(docs|""" + version.replace('.', '\\.') + """|releases|advisories|cockroachcloud|molt)\\//);
                            if (archiveMatch) {
                                archiveFolder = archiveMatch[1];
                                offlineSnapIndex = currentPath.indexOf('/' + archiveFolder + '/');
                            }
                        }"""

            new_detection = """                        // Archive detection - handles nested known directories
                        var offlineSnapIndex = -1;
                        var archiveFolder = '';

                        // Split path into parts for analysis
                        var pathParts = currentPath.split('/').filter(function(p) { return p; });

                        // List of known directories in our documentation structure
                        var knownDirs = ['""" + version + """', 'cockroachcloud', 'releases', 'advisories', 'molt', '_internal'];

                        // Check if the path contains any known directories
                        var hasKnownDir = false;
                        var firstKnownDirIndex = -1;
                        for (var j = 0; j < pathParts.length; j++) {
                            if (knownDirs.indexOf(pathParts[j]) !== -1) {
                                hasKnownDir = true;
                                if (firstKnownDirIndex === -1) {
                                    firstKnownDirIndex = j;
                                }
                            }
                        }

                        if (!hasKnownDir && pathParts.length > 0) {
                            // We're likely at root - the archive folder is the parent of this file
                            // For /path/to/offline_snap/index.html, get 'offline_snap'
                            archiveFolder = pathParts[pathParts.length - 2];
                            if (archiveFolder && archiveFolder.indexOf('.html') === -1) {
                                offlineSnapIndex = currentPath.lastIndexOf('/' + archiveFolder + '/');
                            }
                        } else if (firstKnownDirIndex > 0) {
                            // The archive folder is the parent of the first known directory
                            // For /path/offline_snap/releases/""" + version + """/, archive is 'offline_snap'
                            archiveFolder = pathParts[firstKnownDirIndex - 1];
                            offlineSnapIndex = currentPath.lastIndexOf('/' + archiveFolder + '/');
                        }"""

            content = content.replace(old_detection, new_detection)

        if content != original:
            html_file.write_text(content)
            fixed_count += 1

    print(f"    Fixed {fixed_count} files")

def create_version_archive(version):
    """Create archive for a specific version"""
    print(f"\n{'='*60}")
    print(f"🚀 Creating {version} archive with FIXED navigation")
    print('='*60)

    # Clean up
    if Path("offline_snap").exists():
        shutil.rmtree("offline_snap")

    # Step 1: Write a version-specific copy of snapshot_relative.py to a temp file
    # so the checked-in source is never modified in-place.
    print(f"📝 Setting up for {version}...")
    snapshot_content = Path("snapshot_relative.py").read_text()

    snapshot_content = re.sub(r'sidebar-v[\d.]+\.html', f'sidebar-{version}.html', snapshot_content)
    snapshot_content = re.sub(r'TARGET_VERSION = "[^"]*"', f'TARGET_VERSION = "{version}"', snapshot_content)

    tmp_snap = tempfile.NamedTemporaryFile(
        mode='w', suffix='_snapshot.py', dir='.', delete=False
    )
    tmp_snap.write(snapshot_content)
    tmp_snap.close()
    tmp_snap_path = Path(tmp_snap.name)

    # Step 2: Run the 14-step process
    print(f"\n📚 Running the 14-step archive creation process for {version}...")

    # Step 1: Create base archive
    run_cmd(f"python3 {tmp_snap_path.name}", "Step 1: Creating base archive")

    # Clean up the temp snapshot script now that step 1 is done
    tmp_snap_path.unlink(missing_ok=True)

    # Step 2: Apply navigation fixes
    run_cmd("python3 fix_navigation_quick.py", "Step 2: Applying navigation fixes")

    # Step 3: Fix version placeholders
    print("  Step 3: Fixing version placeholders...")
    fix_versions_script = f"""#!/usr/bin/env python3
from pathlib import Path
import re

for html in Path("offline_snap").rglob("*.html"):
    content = html.read_text()
    # Replace any v2.1 references with {version}
    content = re.sub(r'/v2\\.1/', '/{version}/', content)
    content = re.sub(r'"v2\\.1/', '"{version}/', content)
    content = re.sub(r"'v2\\.1/", "'{version}/", content)
    content = re.sub(r'v2\\.1\\.html', '{version}.html', content)
    content = re.sub(r'sidebar-v2\\.1', 'sidebar-{version}', content)
    # Replace ${{VERSION}} with {version}
    content = content.replace('${{VERSION}}', '{version}')
    # Replace /stable/ with /{version}/
    content = re.sub(r'/stable/', '/{version}/', content)
    html.write_text(content)
print("Fixed version placeholders")
"""
    Path(f"fix_{version.replace('.', '_')}_versions.py").write_text(fix_versions_script)
    run_cmd(f"python3 fix_{version.replace('.', '_')}_versions.py", "    Running version fix")

    # Step 4: Remove non-target sidebars
    run_cmd(f'find offline_snap/_internal -name "sidebar-v*.html" ! -name "sidebar-{version}.html" -delete',
            "Step 4: Removing other version sidebars")

    # Step 5: Clean target version sidebar
    print(f"  Step 5: Cleaning {version} sidebar...")
    sidebar_file = Path(f"offline_snap/_internal/sidebar-{version}.html")
    if sidebar_file.exists():
        content = sidebar_file.read_text()
        # Get the major.minor version number
        major_minor = '.'.join(version[1:].split('.')[:2]) if version.startswith('v') else version
        major = int(major_minor.split('.')[0])
        minor = int(major_minor.split('.')[1])

        # Remove references to newer versions
        newer = []
        for maj in range(major + 1, 27):  # Up to v26
            for min in range(1, 5):  # Up to .4
                newer.append(f"v{maj}.{min}")
        # Also remove newer minor versions of same major
        for min in range(minor + 1, 5):
            newer.append(f"v{major}.{min}")

        for v in newer:
            content = re.sub(f'<a[^>]*{v}[^>]*>.*?</a>', '', content, flags=re.DOTALL)
            content = re.sub(f'<li[^>]*>.*?{v}.*?</li>', '', content, flags=re.DOTALL)

        sidebar_file.write_text(content)

    # Steps 6-14: Run remaining fix scripts
    run_cmd("python3 fix_js_sidebar_final.py", "Step 6: Fixing JavaScript sidebar")
    run_cmd("python3 fix_remaining_v25_refs.py", "Step 7: Fixing remaining references")
    run_cmd("mkdir -p offline_snap/advisories/internal", "Step 8: Creating advisories directory")
    run_cmd("cp _site/docs/advisories/internal/advisories.json offline_snap/advisories/internal/ 2>/dev/null || true",
            "Step 9: Copying advisories JSON")
    run_cmd("python3 fix_incomplete_sidebars.py", "Step 10: Fixing incomplete sidebars")

    # Step 11: CRITICAL - Use the new make_navigation_dynamic_v2.py with version parameter
    print(f"  Step 11: Making navigation dynamic with correct version ({version})...")
    run_cmd(f"python3 make_navigation_dynamic_v2.py offline_snap {version}",
            "    Making navigation dynamic with version-specific detection")

    run_cmd("python3 fix_root_navigation.py", "Step 12: Fixing root navigation")
    run_cmd("python3 fix_broken_sidebar_links.py", "Step 13: Fixing broken sidebar links")
    run_cmd("python3 fix_final_broken_links.py", "Step 14: Fixing final broken links")

    # Apply additional navigation fixes
    fix_navigation_in_archive(version)

    # Create ZIP
    print(f"\n📦 Creating ZIP archive for {version}...")
    zip_name = f"cockroachdb-docs-{version}-offline.zip"
    run_cmd(f"zip -r {zip_name} offline_snap/ -q", "Creating ZIP file")

    # Cleanup temporary script
    Path(f"fix_{version.replace('.', '_')}_versions.py").unlink(missing_ok=True)

    # Check size
    zip_file = Path(zip_name)
    if zip_file.exists():
        size_mb = zip_file.stat().st_size / (1024 * 1024)
        print(f"✅ Created: {zip_name} ({size_mb:.1f} MB)")
    else:
        print(f"❌ Failed to create {zip_name}")

    return zip_file.exists()

def main():
    """Main function to create all archives"""
    versions = ["v20.2", "v21.1", "v21.2", "v22.1", "v22.2"]
    successful = []
    failed = []

    print("="*60)
    print("📚 Creating Documentation Archives with FIXED Navigation")
    print(f"   Versions: {', '.join(versions)}")
    print("="*60)

    start_time = time.time()

    for version in versions:
        if create_version_archive(version):
            successful.append(version)
        else:
            failed.append(version)

    # Clean up
    if Path("offline_snap").exists():
        shutil.rmtree("offline_snap")

    # Summary
    elapsed = time.time() - start_time
    print("\n" + "="*60)
    print("📊 Archive Creation Summary")
    print("="*60)
    print(f"✅ Successful: {', '.join(successful) if successful else 'None'}")
    if failed:
        print(f"❌ Failed: {', '.join(failed)}")
    print(f"⏱️  Total time: {elapsed:.1f} seconds")
    print("="*60)

    # List created files
    print("\n📁 Created Archives:")
    for version in successful:
        zip_file = Path(f"cockroachdb-docs-{version}-offline.zip")
        if zip_file.exists():
            size_mb = zip_file.stat().st_size / (1024 * 1024)
            print(f"   • {zip_file.name}: {size_mb:.1f} MB")

if __name__ == "__main__":
    main()