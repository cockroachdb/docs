#!/usr/bin/env python3
"""
Create a single documentation archive for a specific CockroachDB version
Usage: python3 create_single_archive.py <version>
Example: python3 create_single_archive.py v23.1
"""
import subprocess
import shutil
import re
import sys
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

        # Fix 1: JavaScript syntax error
        content = content.replace(
            f"url = url.replace(/^stable\\//, ).replace(/\\/stable\\//, '/{version}/');",
            f"url = url.replace(/^stable\\//, '{version}/').replace(/\\/stable\\//, '/{version}/');"
        )

        # Fix 2: Archive detection with nested directory handling
        if 'var knownDirs' not in content and 'archiveMatch = currentPath.match' in content:
            # Apply the nested directory fix
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
    print(f"🚀 Creating {version} archive")
    print('='*60)

    # Clean up any existing offline_snap
    if Path("offline_snap").exists():
        shutil.rmtree("offline_snap")

    # Step 1: Modify snapshot_relative.py for this version
    print(f"📝 Setting up for {version}...")

    snapshot_file = Path("snapshot_relative.py")
    if not snapshot_file.exists():
        print(f"❌ Error: snapshot_relative.py not found!")
        return False

    snapshot_content = snapshot_file.read_text()

    # Update version references
    snapshot_content = re.sub(r'sidebar-v[\d.]+\.html', f'sidebar-{version}.html', snapshot_content)
    snapshot_content = re.sub(r'TARGET_VERSION = "[^"]*"', f'TARGET_VERSION = "{version}"', snapshot_content)

    snapshot_file.write_text(snapshot_content)

    # Step 2: Run the 14-step process
    print(f"\n📚 Running the 14-step archive creation process for {version}...")

    # Step 1: Create base archive
    if not run_cmd("python3 snapshot_relative.py", "Step 1: Creating base archive"):
        print("❌ Failed to create base archive")
        return False

    # Check if offline_snap was created
    if not Path("offline_snap").exists():
        print("❌ Error: offline_snap directory was not created")
        return False

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
    temp_script = Path(f"fix_{version.replace('.', '_')}_versions.py")
    temp_script.write_text(fix_versions_script)
    run_cmd(f"python3 {temp_script.name}", "    Running version fix")

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
        try:
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
        except (ValueError, IndexError):
            print(f"    Warning: Could not parse version {version} for sidebar cleaning")

    # Steps 6-14: Run remaining fix scripts
    run_cmd("python3 fix_js_sidebar_final.py", "Step 6: Fixing JavaScript sidebar")
    run_cmd("python3 fix_remaining_v25_refs.py", "Step 7: Fixing remaining references")
    run_cmd("mkdir -p offline_snap/advisories/internal", "Step 8: Creating advisories directory")
    run_cmd("cp _site/docs/advisories/internal/advisories.json offline_snap/advisories/internal/ 2>/dev/null || true",
            "Step 9: Copying advisories JSON")
    run_cmd("python3 fix_incomplete_sidebars.py", "Step 10: Fixing incomplete sidebars")

    # Step 11: Use the version-aware make_navigation_dynamic_v2.py
    print(f"  Step 11: Making navigation dynamic with correct version ({version})...")
    if Path("make_navigation_dynamic_v2.py").exists():
        run_cmd(f"python3 make_navigation_dynamic_v2.py offline_snap {version}",
                "    Making navigation dynamic with version-specific detection")
    else:
        run_cmd(f"python3 make_navigation_dynamic.py offline_snap",
                "    Making navigation dynamic (legacy)")

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
    temp_script.unlink(missing_ok=True)

    # Check size
    zip_file = Path(zip_name)
    if zip_file.exists():
        size_mb = zip_file.stat().st_size / (1024 * 1024)
        print(f"✅ Created: {zip_name} ({size_mb:.1f} MB)")
        return True
    else:
        print(f"❌ Failed to create {zip_name}")
        return False

def main():
    """Main function"""
    if len(sys.argv) != 2:
        print("Usage: python3 create_single_archive.py <version>")
        print("Example: python3 create_single_archive.py v23.1")
        sys.exit(1)

    version = sys.argv[1]

    # Validate version format
    if not version.startswith('v') or '.' not in version:
        print(f"Error: Version should be in format vX.Y (e.g., v23.1)")
        sys.exit(1)

    print("="*60)
    print(f"📚 Creating Documentation Archive for {version}")
    print("="*60)

    # Check prerequisites
    if not Path("_site").exists():
        print("❌ Error: _site directory not found. Run Jekyll build first.")
        sys.exit(1)

    start_time = time.time()

    success = create_version_archive(version)

    # Clean up
    if Path("offline_snap").exists():
        shutil.rmtree("offline_snap")

    # Summary
    elapsed = time.time() - start_time
    print("\n" + "="*60)
    if success:
        print(f"✅ Successfully created archive for {version}")
    else:
        print(f"❌ Failed to create archive for {version}")
    print(f"⏱️  Time: {elapsed:.1f} seconds")
    print("="*60)

if __name__ == "__main__":
    main()