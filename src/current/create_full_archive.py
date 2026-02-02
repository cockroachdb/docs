#!/usr/bin/env python3
"""
Full Website Archive Creator for CockroachDB Documentation

Creates a complete offline archive from _site/docs that can be opened locally
in a browser. Matches the structure and patterns of complete_test_archive_latest.zip.

Usage:
    python3 create_full_archive.py

Output:
    - Creates 'complete_archive/' directory with the full offline site
    - Optionally creates 'complete_archive.zip' for distribution
"""
import re
import shutil
import requests
import os
import sys
from pathlib import Path
from urllib.parse import urlparse
from bs4 import BeautifulSoup
import json
from datetime import datetime
import argparse

# Configuration
SCRIPT_DIR = Path(__file__).parent
SITE_DIR = SCRIPT_DIR / "_site" / "docs"
OUTPUT_DIR = SCRIPT_DIR / "complete_archive"

# All versions to include in the archive
ALL_VERSIONS = [
    "v23.1", "v23.2", "v24.1", "v24.2", "v24.3",
    "v25.1", "v25.2", "v25.3", "v25.4", "v26.1"
]

# Current stable version (update as needed)
STABLE_VERSION = "v25.3"

# Directories to copy entirely
ASSET_DIRS = ["css", "js", "images", "fonts", "_internal"]

# Top-level content directories to include
CONTENT_DIRS = ["cockroachcloud", "releases", "advisories", "molt", "stable"]

# Top-level HTML files to include
TOP_LEVEL_FILES = ["index.html", "404.html", "search.html"]

# Google Fonts URL for offline download
FONTS_CSS_URL = (
    "https://fonts.googleapis.com/css2?"
    "family=Poppins:wght@400;600&"
    "family=Source+Code+Pro&"
    "family=Source+Sans+Pro:wght@300;400;600;700&"
    "display=swap"
)


class FullArchiveCreator:
    def __init__(self, site_dir=None, output_dir=None, stable_version=None):
        self.site_dir = Path(site_dir) if site_dir else SITE_DIR
        self.output_dir = Path(output_dir) if output_dir else OUTPUT_DIR
        self.stable_version = stable_version or STABLE_VERSION
        self.processed_files = 0
        self.error_count = 0

    def log(self, message, level="INFO"):
        """Log a message with timestamp and level"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        prefix = {
            "INFO": "[*]",
            "SUCCESS": "[+]",
            "WARNING": "[!]",
            "ERROR": "[-]",
            "DEBUG": "[.]"
        }.get(level, "[*]")
        print(f"[{timestamp}] {prefix} {message}")

    def clean_output_dir(self):
        """Remove existing output directory if it exists"""
        if self.output_dir.exists():
            self.log(f"Removing existing {self.output_dir}")
            shutil.rmtree(self.output_dir)
        self.output_dir.mkdir(parents=True)
        self.log(f"Created output directory: {self.output_dir}", "SUCCESS")

    def copy_asset_dirs(self):
        """Copy all asset directories (css, js, images, fonts, _internal)"""
        self.log("Copying asset directories...")
        for asset_dir in ASSET_DIRS:
            src = self.site_dir / asset_dir
            if src.exists():
                dst = self.output_dir / asset_dir
                shutil.copytree(src, dst, dirs_exist_ok=True)
                self.log(f"  Copied {asset_dir}/", "SUCCESS")
            else:
                self.log(f"  {asset_dir}/ not found, skipping", "WARNING")

    def copy_tree_ignore_broken_symlinks(self, src, dst):
        """Copy directory tree, ignoring broken/circular symlinks"""
        dst.mkdir(parents=True, exist_ok=True)

        for item in src.iterdir():
            src_item = src / item.name
            dst_item = dst / item.name

            try:
                if src_item.is_symlink():
                    # Check if symlink is valid
                    try:
                        src_item.resolve(strict=True)
                        # Valid symlink - copy target or recreate link
                        target = os.readlink(src_item)
                        # Skip circular symlinks (symlink pointing to parent dir)
                        if item.name in target or target.startswith('..'):
                            continue
                        os.symlink(target, dst_item)
                    except (OSError, RuntimeError):
                        # Broken/circular symlink - skip it
                        continue
                elif src_item.is_dir():
                    self.copy_tree_ignore_broken_symlinks(src_item, dst_item)
                elif src_item.is_file():
                    shutil.copy2(src_item, dst_item)
            except Exception as e:
                # Skip any problematic items
                continue

    def copy_version_dirs(self):
        """Copy all version directories with their content"""
        self.log("Copying version directories...")
        copied_count = 0
        for version in ALL_VERSIONS:
            src = self.site_dir / version
            if src.exists():
                dst = self.output_dir / version
                self.copy_tree_ignore_broken_symlinks(src, dst)
                file_count = len(list(dst.rglob("*.html")))
                self.log(f"  Copied {version}/ ({file_count} HTML files)", "SUCCESS")
                copied_count += 1
            else:
                self.log(f"  {version}/ not found, skipping", "WARNING")
        self.log(f"Copied {copied_count} version directories", "SUCCESS")

    def copy_content_dirs(self):
        """Copy content directories (cockroachcloud, releases, advisories, etc.)"""
        self.log("Copying content directories...")
        for content_dir in CONTENT_DIRS:
            src = self.site_dir / content_dir
            if src.exists() or src.is_symlink():
                dst = self.output_dir / content_dir
                try:
                    if src.is_symlink():
                        # Resolve the symlink and copy the actual content
                        # (zip files don't handle symlinks well across platforms)
                        target = os.readlink(src)
                        resolved_src = self.site_dir / target
                        if resolved_src.exists():
                            self.copy_tree_ignore_broken_symlinks(resolved_src, dst)
                            self.log(f"  Copied {content_dir}/ (from {target})", "SUCCESS")
                        else:
                            self.log(f"  {content_dir} symlink target {target} not found", "WARNING")
                    else:
                        self.copy_tree_ignore_broken_symlinks(src, dst)
                        self.log(f"  Copied {content_dir}/", "SUCCESS")
                except Exception as e:
                    self.log(f"  Error copying {content_dir}: {e}", "WARNING")
            else:
                self.log(f"  {content_dir}/ not found, skipping", "WARNING")

    def copy_top_level_files(self):
        """Copy top-level HTML files"""
        self.log("Copying top-level files...")
        for filename in TOP_LEVEL_FILES:
            src = self.site_dir / filename
            if src.exists():
                dst = self.output_dir / filename
                shutil.copy2(src, dst)
                self.log(f"  Copied {filename}", "SUCCESS")
            else:
                self.log(f"  {filename} not found, skipping", "WARNING")

    def get_file_depth(self, file_path):
        """Calculate the depth of a file relative to output directory"""
        try:
            rel_path = file_path.relative_to(self.output_dir)
            return len(rel_path.parent.parts)
        except ValueError:
            return 0

    def get_relative_prefix(self, file_path):
        """Get the relative path prefix (../) for a file"""
        depth = self.get_file_depth(file_path)
        return "../" * depth if depth > 0 else ""

    def fix_docs_home_url(self, content):
        """Fix 1: Replace '/' with 'index.html' in sidebar nav JSON"""
        content = re.sub(
            r'"urls":\s*\[\s*"/"\s*\]',
            '"urls": ["index.html"]',
            content
        )
        return content

    def get_arrow_fix_css(self):
        """Fix 2: CSS to hide ALL arrows from version-switcher"""
        return '''
/* Remove ALL arrows from version-switcher */
#version-switcher .arrow,
#version-switcher .tier-1 .arrow,
#version-switcher .tier-1 a .arrow {
    display: none !important;
    visibility: hidden !important;
}
#version-switcher .nav li > a > span:after,
#version-switcher .nav li > a > span::after,
#version-switcher li > a > span:after,
#version-switcher li > a > span::after,
#version-switcher .tier-1 > a > span:after,
#version-switcher .tier-1 > a > span::after,
#version-switcher .version-name:after,
#version-switcher .version-name::after {
    content: none !important;
    display: none !important;
}
'''

    def fix_version_links(self, content, file_depth):
        """Fix 3: Fix version switcher links to use correct relative paths"""
        prefix = "../" * file_depth if file_depth > 0 else ""

        def fix_version_link(match):
            full_match = match.group(0)
            href = match.group(1)
            classes = match.group(2)

            # Extract version and page from href
            version_match = re.match(r'^(?:\.\./)*(?:/docs/)?(v\d+\.\d+)/(.+)$', href)
            if version_match:
                version = version_match.group(1)
                page = version_match.group(2)
                if not page.endswith('.html'):
                    page = page + '.html'
                return f'href="{prefix}{version}/{page}"{classes}'

            # No version directory - check if it's a relative path without version
            clean_href = re.sub(r'^(?:\.\./)+', '', href)
            if clean_href and not clean_href.startswith(('http', '#', 'mailto', 'javascript')):
                if not clean_href.endswith('.html') and '.' not in clean_href.split('/')[-1]:
                    clean_href = clean_href + '.html'
                return f'href="{prefix}{clean_href}"{classes}'

            return full_match

        # Fix version--mobile and version--desktop links
        content = re.sub(
            r'href="([^"]+)"(\s+[^>]*class="[^"]*version--(?:mobile|desktop)[^"]*")',
            fix_version_link,
            content
        )

        return content

    def preserve_version_switcher(self, content):
        """Fix 4: Preserve version-switcher (don't remove via JS or CSS)"""
        # Change JS to only remove feedback-widget, not version-switcher
        content = re.sub(
            r"\$\('\.version-switcher,\s*#version-switcher,\s*\.feedback-widget'\)\.remove\(\);",
            "$('.feedback-widget').remove(); // version-switcher preserved for offline",
            content
        )

        # Change CSS to only hide feedback-widget, not version-switcher
        content = re.sub(
            r'\.version-switcher,\s*#version-switcher,\s*\.feedback-widget,',
            '.feedback-widget,',
            content
        )

        return content

    def fix_asset_paths(self, content, prefix):
        """Fix 5: Convert absolute asset paths to relative"""
        # Fix /docs/images/ paths
        content = re.sub(
            r'content:\s*url\(/docs/images/([^)]+)\)',
            f'content:url({prefix}images/\\1)',
            content
        )

        # Fix other absolute image paths in CSS
        content = re.sub(
            r'url\(["\']?/docs/images/([^)"\']+)["\']?\)',
            f'url({prefix}images/\\1)',
            content
        )

        return content

    def get_offline_styles(self, prefix):
        """Get CSS styles for offline mode - comprehensive version matching reference archive"""
        arrow_fix = self.get_arrow_fix_css()
        return f'''<style>
/* Offline archive styles */
{arrow_fix}

/* Force sidebar visibility */
#sidebar, #sidebarMenu, .navbar-collapse {{
    display: block !important;
    visibility: visible !important;
    height: auto !important;
    overflow: visible !important;
}}

/* Hide online-only elements - comprehensive list */
.ask-ai, #ask-ai, [data-ask-ai], .ai-widget, .kapa-widget,
[class*="kapa"], [id*="kapa"], [class*="ask-ai"], [id*="ask-ai"],
.feedback-widget, #feedback-widget, [id*="feedback"],
.helpful-widget, .page-helpful,
button[aria-label*="AI"], div[data-kapa-widget],
.kapa-ai-button, .ai-assistant, .ai-chat,
.floating-action-button, .fab, [class*="floating-button"],
.search, #search, .search-bar, .search-input, .search-form,
[class*="search"], [id*="search"], input[type="search"],
.algolia-search, .docsearch, [class*="docsearch"],
form[action*="search"], input[placeholder*="Search" i],
input[placeholder*="search" i], input[name="query"],
form[action="/docs/search"], form[action*="/search"] {{
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
    position: absolute !important;
    left: -9999px !important;
}}

/* Sidebar base link styles */
#sidebar a {{
    display: block;
    padding: 0.5em 1em;
    text-decoration: none;
    color: #374151;
}}
#sidebar a:hover {{
    text-decoration: underline;
    background-color: #f3f4f6;
}}

/* Highlight the active page */
.navgoco li.active > a {{
    font-weight: 600;
    background-color: #e0e7ff;
    color: #3730a3;
}}

/* Remove arrows on true top-level */
.navgoco > li > a {{
    position: relative;
    padding-left: 1em;
}}

/* Arrows for 2nd-level (and deeper) items with children */
.navgoco li li.hasChildren > a::before {{
    content: ">";
    position: absolute;
    left: 0.5em;
    top: 50%;
    transform: translateY(-50%);
    transition: transform .2s ease;
}}
.navgoco li li.open.hasChildren > a::before {{
    transform: translateY(-50%) rotate(90deg);
}}

/* Submenu visibility */
.navgoco li > ul {{
    display: none;
    margin: 0;
    padding-left: 1.5em;
}}
.navgoco li.open > ul {{
    display: block;
}}
</style>'''

    def get_nav_dependencies(self, prefix):
        """Get navigation JS dependencies to inject"""
        return f'''<link rel="stylesheet" href="{prefix}css/jquery.navgoco.css">
<script src="{prefix}js/jquery.min.js"></script>
<script src="{prefix}js/jquery.cookie.min.js"></script>
<script src="{prefix}js/jquery.navgoco.min.js"></script>'''

    def get_nav_init_script(self):
        """Get navigation initialization script"""
        return '''<script>
$(function(){
    // Remove online-only elements
    $('.ask-ai, #ask-ai, [data-ask-ai], .kapa-widget').remove();
    $('[class*="kapa"], [id*="kapa"]').remove();
    $('.feedback-widget, #feedback-widget').remove();

    // Initialize navigation
    $('#sidebar, #sidebarMenu, #mysidebar').navgoco({
        cookie: false,
        accordion: true
    });

    // Highlight current page
    var page = location.pathname.split('/').pop() || 'index.html';
    $('#sidebar a, #sidebarMenu a').each(function() {
        var href = $(this).attr('href');
        if (href && (href.endsWith(page) || href.endsWith('/' + page))) {
            $(this).closest('li').addClass('active');
            $(this).parents('ul').show().parent('li').addClass('open');
        }
    });
});
</script>'''

    def process_html_file(self, file_path):
        """Process a single HTML file with all offline fixes"""
        try:
            content = file_path.read_text(encoding='utf-8')
            prefix = self.get_relative_prefix(file_path)
            depth = self.get_file_depth(file_path)

            # Apply all fixes
            content = self.fix_docs_home_url(content)
            content = self.fix_version_links(content, depth)
            content = self.preserve_version_switcher(content)
            content = self.fix_asset_paths(content, prefix)

            # Fix various path patterns
            # Remove /docs/ prefix from paths
            content = re.sub(r'(href|src)="/docs/([^"]+)"', r'\1="\2"', content)
            content = re.sub(r'(href|src)="docs/([^"]+)"', r'\1="\2"', content)
            # Fix bare /docs/ link (navbar brand) - match reference archive pattern
            content = re.sub(r'href="/docs/"', 'href=""', content)
            content = re.sub(r'href="/docs"', 'href=""', content)
            # Fix action attributes for search forms
            content = re.sub(r'action="/docs/search"', f'action="{prefix}search.html"', content)

            # Fix stable -> actual stable version
            content = re.sub(r'(href|src)="stable/', f'\\1="{self.stable_version}/', content)
            content = re.sub(r'(href|src)="/stable/', f'\\1="{self.stable_version}/', content)

            # Fix absolute paths to relative for assets
            for asset in ASSET_DIRS:
                content = re.sub(
                    rf'(src|href)="/{asset}/([^"]+)"',
                    rf'\1="{prefix}{asset}/\2"',
                    content
                )
                content = re.sub(
                    rf'(src|href)="{asset}/([^"]+)"',
                    rf'\1="{prefix}{asset}/\2"',
                    content
                )

            # Replace Google Fonts CDN with local
            content = re.sub(
                r'<link[^>]+fonts\.googleapis\.com[^>]+>',
                f'<link rel="stylesheet" href="{prefix}css/google-fonts.css">',
                content
            )

            # Fix 1 (additional): CSS @import paths - convert absolute to relative
            content = re.sub(
                r'@import url\(["\']?/docs/([^)"\']+)["\']?\)',
                f'@import url({prefix}\\1)',
                content
            )
            content = re.sub(
                r'@import url\(["\']?docs/([^)"\']+)["\']?\)',
                f'@import url({prefix}\\1)',
                content
            )

            # Fix 3: Clean up double-slash paths and remaining /docs/ references
            content = re.sub(r'(href|src)="\.\.//docs/', r'\1="../', content)
            content = re.sub(r'(href|src)="\.\.//+', r'\1="../', content)
            content = re.sub(r'(href|src)="//+([^/])', r'\1="\2', content)

            # Fix 4: Strip query parameters from local image URLs
            content = re.sub(
                r'(src="[^"?]+\.(png|jpg|jpeg|svg|gif|webp))\?[^"]*"',
                r'\1"',
                content
            )
            content = re.sub(
                r'(href="[^"?]+\.(png|jpg|jpeg|svg|gif|webp|css))\?[^"]*"',
                r'\1"',
                content
            )

            # Fix 6: Replace CDN jQuery with local version
            content = re.sub(
                r'<script[^>]+cdn\.jsdelivr\.net[^>]+jquery[^>]*></script>',
                f'<script src="{prefix}js/jquery.min.js"></script>',
                content
            )

            # Inject navigation dependencies before </head>
            nav_deps = self.get_nav_dependencies(prefix)
            offline_styles = self.get_offline_styles(prefix)
            content = re.sub(
                r'</head>',
                f'{nav_deps}\n{offline_styles}\n</head>',
                content,
                flags=re.IGNORECASE
            )

            # Inject navigation init script before </body>
            nav_init = self.get_nav_init_script()
            content = re.sub(
                r'</body>',
                f'{nav_init}\n</body>',
                content,
                flags=re.IGNORECASE
            )

            # Final cleanup: normalize any remaining double slashes in paths (but not in URLs)
            content = re.sub(r'(href|src)="([^"]*[^:])//+([^"]*)"', r'\1="\2/\3"', content)

            # Write processed content
            file_path.write_text(content, encoding='utf-8')
            self.processed_files += 1

        except Exception as e:
            self.log(f"Error processing {file_path}: {e}", "ERROR")
            self.error_count += 1

    def process_all_html_files(self):
        """Process all HTML files in the output directory"""
        self.log("Processing HTML files...")
        html_files = list(self.output_dir.rglob("*.html"))
        total = len(html_files)

        for i, file_path in enumerate(html_files, 1):
            if i % 100 == 0:
                self.log(f"  Progress: {i}/{total} ({i*100//total}%)")
            self.process_html_file(file_path)

        self.log(f"Processed {self.processed_files} HTML files, {self.error_count} errors", "SUCCESS")

    def download_google_fonts(self):
        """Download and localize Google Fonts"""
        self.log("Downloading Google Fonts...")

        fonts_dir = self.output_dir / "fonts"
        fonts_dir.mkdir(exist_ok=True)
        css_dir = self.output_dir / "css"
        css_dir.mkdir(exist_ok=True)

        try:
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            css_response = requests.get(FONTS_CSS_URL, headers=headers, timeout=10)
            css_response.raise_for_status()
            css_content = css_response.text

            # Find all font URLs
            font_urls = set(re.findall(r"url\((https://fonts\.gstatic\.com/[^\)]+)\)", css_content))

            for url in font_urls:
                try:
                    font_response = requests.get(url, headers=headers, timeout=10)
                    font_response.raise_for_status()

                    parsed = urlparse(url)
                    font_path = parsed.path.lstrip("/")
                    dst = fonts_dir / font_path
                    dst.parent.mkdir(parents=True, exist_ok=True)
                    dst.write_bytes(font_response.content)

                    css_content = css_content.replace(url, f"../fonts/{font_path}")

                except Exception as e:
                    self.log(f"  Failed to download font: {e}", "WARNING")

            (css_dir / "google-fonts.css").write_text(css_content, encoding="utf-8")
            self.log("Google Fonts localized", "SUCCESS")

        except Exception as e:
            self.log(f"Error downloading fonts: {e}", "ERROR")
            # Create fallback CSS
            fallback = '''/* Fallback fonts */
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
code, pre { font-family: Consolas, Monaco, "Courier New", monospace; }'''
            (css_dir / "google-fonts.css").write_text(fallback)

    def ensure_nav_assets(self):
        """Ensure required navigation JS assets exist"""
        self.log("Ensuring navigation assets...")

        js_dir = self.output_dir / "js"
        js_dir.mkdir(exist_ok=True)
        css_dir = self.output_dir / "css"
        css_dir.mkdir(exist_ok=True)

        assets = [
            ("jquery.min.js", "https://code.jquery.com/jquery-3.6.3.min.js", js_dir),
            ("jquery.cookie.min.js", "https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js", js_dir),
            ("jquery.navgoco.min.js", "https://raw.githubusercontent.com/tefra/navgoco/master/src/jquery.navgoco.js", js_dir),
            ("jquery.navgoco.css", "https://raw.githubusercontent.com/tefra/navgoco/master/src/jquery.navgoco.css", css_dir),
        ]

        for name, url, dest_dir in assets:
            dest_file = dest_dir / name
            if not dest_file.exists():
                try:
                    self.log(f"  Downloading {name}...")
                    response = requests.get(url, timeout=10)
                    response.raise_for_status()
                    dest_file.write_bytes(response.content)
                    self.log(f"  Downloaded {name}", "SUCCESS")
                except Exception as e:
                    self.log(f"  Failed to download {name}: {e}", "ERROR")
            else:
                self.log(f"  {name} already exists", "SUCCESS")

    def add_archived_banner(self):
        """Add archived version banner to index.html"""
        self.log("Adding archived banner to index.html...")

        index_path = self.output_dir / "index.html"
        if not index_path.exists():
            self.log("index.html not found", "WARNING")
            return

        content = index_path.read_text(encoding='utf-8')

        banner_css = '''<style>
.archived-banner {
    background-color: #FFF3CD;
    border-bottom: 1px solid #FFEAA7;
    padding: 8px 0;
    text-align: center;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1035;
}
.archived-banner-text {
    font-size: 14px;
    font-weight: 500;
    color: #856404;
    margin: 0;
}
.archived-banner-link {
    color: #6933FF;
    text-decoration: none;
    font-weight: 600;
}
.archived-banner-link:hover {
    text-decoration: underline;
}
body { padding-top: 32px; }
.navbar.fixed-top { top: 32px !important; }
</style>'''

        banner_html = '''<div class="archived-banner">
<p class="archived-banner-text">
This is an archived version of the CockroachDB documentation.
<a href="https://www.cockroachlabs.com/docs/stable/" class="archived-banner-link">View the latest documentation</a>
</p>
</div>'''

        content = content.replace('</head>', banner_css + '\n</head>')
        content = content.replace('<body>', '<body>\n' + banner_html)

        index_path.write_text(content, encoding='utf-8')
        self.log("Added archived banner", "SUCCESS")

    def clean_macos_artifacts(self):
        """Remove macOS artifacts from the archive"""
        self.log("Cleaning macOS artifacts...")

        # Remove __MACOSX directories
        for macosx_dir in self.output_dir.rglob("__MACOSX"):
            shutil.rmtree(macosx_dir)
            self.log(f"  Removed {macosx_dir}", "SUCCESS")

        # Remove .DS_Store files
        for ds_store in self.output_dir.rglob(".DS_Store"):
            ds_store.unlink()

        # Remove ._ files
        for dot_file in self.output_dir.rglob("._*"):
            dot_file.unlink()

        self.log("Cleaned macOS artifacts", "SUCCESS")

    def create_zip_archive(self):
        """Create a zip archive of the output directory"""
        self.log("Creating zip archive...")

        zip_path = self.output_dir.with_suffix('.zip')
        if zip_path.exists():
            zip_path.unlink()

        # Use shutil to create the zip
        shutil.make_archive(
            str(self.output_dir),
            'zip',
            self.output_dir.parent,
            self.output_dir.name
        )

        # Get zip size
        zip_size = zip_path.stat().st_size / (1024 * 1024)
        self.log(f"Created {zip_path.name} ({zip_size:.1f} MB)", "SUCCESS")

    def build(self, create_zip=False):
        """Main build process"""
        print("\n" + "=" * 60)
        print("COCKROACHDB FULL WEBSITE ARCHIVE CREATOR")
        print("=" * 60)

        self.log(f"Source: {self.site_dir}")
        self.log(f"Output: {self.output_dir}")
        self.log(f"Stable version: {self.stable_version}")
        self.log(f"Versions: {', '.join(ALL_VERSIONS)}")

        if not self.site_dir.exists():
            self.log(f"Source directory not found: {self.site_dir}", "ERROR")
            self.log("Run 'jekyll build' first to generate _site", "ERROR")
            return False

        # Build steps
        self.clean_output_dir()
        self.copy_asset_dirs()
        self.copy_version_dirs()
        self.copy_content_dirs()
        self.copy_top_level_files()
        self.ensure_nav_assets()
        self.download_google_fonts()
        self.process_all_html_files()
        self.add_archived_banner()
        self.clean_macos_artifacts()

        if create_zip:
            self.create_zip_archive()

        # Summary
        print("\n" + "=" * 60)
        self.log("ARCHIVE CREATED SUCCESSFULLY!", "SUCCESS")
        self.log(f"Output: {self.output_dir}")
        self.log(f"Files processed: {self.processed_files}")
        self.log(f"Errors: {self.error_count}")
        print("=" * 60)
        print(f"\nTo test: open {self.output_dir}/index.html in your browser")

        return True


def main():
    parser = argparse.ArgumentParser(description="Create full website archive from _site")
    parser.add_argument("--site-dir", help="Path to _site/docs directory")
    parser.add_argument("--output-dir", help="Output directory for archive")
    parser.add_argument("--stable-version", default=STABLE_VERSION, help="Stable version (default: v25.3)")
    parser.add_argument("--zip", action="store_true", help="Create zip archive")
    args = parser.parse_args()

    creator = FullArchiveCreator(
        site_dir=args.site_dir,
        output_dir=args.output_dir,
        stable_version=args.stable_version
    )

    success = creator.build(create_zip=args.zip)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
