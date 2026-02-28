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
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

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
STABLE_VERSION = "v26.1"

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

    @staticmethod
    def _make_session(retries=3, backoff=0.5):
        """Create a requests Session with automatic retry and exponential backoff."""
        session = requests.Session()
        retry = Retry(
            total=retries,
            backoff_factor=backoff,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        session.mount("https://", HTTPAdapter(max_retries=retry))
        session.mount("http://", HTTPAdapter(max_retries=retry))
        return session

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
        """Copy directory tree, resolving symlinks to their targets (portable across platforms)."""
        dst.mkdir(parents=True, exist_ok=True)

        for item in src.iterdir():
            src_item = src / item.name
            dst_item = dst / item.name

            try:
                if src_item.is_symlink():
                    try:
                        resolved = src_item.resolve(strict=True)
                    except (OSError, RuntimeError):
                        # Broken or circular symlink — skip
                        continue
                    if resolved.is_dir():
                        self.copy_tree_ignore_broken_symlinks(resolved, dst_item)
                    else:
                        shutil.copy2(resolved, dst_item)
                elif src_item.is_dir():
                    self.copy_tree_ignore_broken_symlinks(src_item, dst_item)
                elif src_item.is_file():
                    shutil.copy2(src_item, dst_item)
            except Exception:
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
                        try:
                            resolved = src.resolve(strict=True)
                        except (OSError, RuntimeError):
                            self.log(f"  {content_dir} symlink is broken, skipping", "WARNING")
                            continue
                        self.copy_tree_ignore_broken_symlinks(resolved, dst)
                        self.log(f"  Copied {content_dir}/ (resolved symlink)", "SUCCESS")
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

    def _rewrite_url(self, url, prefix):
        """Rewrite a URL for offline use: strip /docs/ prefix and make it relative."""
        if not url or re.match(r'^(https?://|mailto:|javascript:|data:|#)', url):
            return url

        # Strip /docs/ prefix
        if url.startswith('/docs/'):
            url = url[6:]
            if not url:           # was '/docs/' exactly → root index
                url = 'index.html'
        elif url in ('/docs', '/docs/'):
            return f'{prefix}index.html'

        # /stable/ → actual stable version
        url = re.sub(r'^/?stable/', f'{self.stable_version}/', url)

        # Strip remaining leading slash
        url = url.lstrip('/')

        # Strip query strings from static asset URLs
        url = re.sub(
            r'^([^?]+\.(png|jpg|jpeg|svg|gif|webp|woff2?|ttf|eot|css|js))\?.*$',
            r'\1', url
        )

        # Add .html extension to version page paths that lack an extension
        for version in ALL_VERSIONS:
            if url.startswith(f'{version}/'):
                page = url[len(f'{version}/'):]
                last_seg = page.split('/')[-1]
                if last_seg and '.' not in last_seg:
                    url = f'{version}/{page}.html'
                break

        # Prefix with relative path depth (skip if already relative)
        if url and not url.startswith(('../', './')):
            url = f'{prefix}{url}'

        return url

    def fix_asset_paths(self, content, prefix):
        """Fix CSS url() expressions: convert absolute /docs/images/ paths to relative."""
        content = re.sub(
            r'content:\s*url\(/docs/images/([^)]+)\)',
            f'content:url({prefix}images/\\1)',
            content
        )
        content = re.sub(
            r'url\(["\']?/docs/images/([^)"\']+)["\']?\)',
            f'url({prefix}images/\\1)',
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
        """Process a single HTML file for offline use via BeautifulSoup."""
        try:
            content = file_path.read_text(encoding='utf-8')
            prefix = self.get_relative_prefix(file_path)

            soup = BeautifulSoup(content, 'html.parser')

            # Rewrite href attributes on all tags
            for tag in soup.find_all(href=True):
                tag['href'] = self._rewrite_url(tag['href'], prefix)

            # Rewrite src attributes on all tags
            for tag in soup.find_all(src=True):
                tag['src'] = self._rewrite_url(tag['src'], prefix)

            # Fix form actions for search
            for form in soup.find_all('form', action=True):
                if '/search' in form['action']:
                    form['action'] = f'{prefix}search.html'

            # Localize Google Fonts link tags
            for link in soup.find_all('link', rel='stylesheet'):
                if 'fonts.googleapis.com' in link.get('href', ''):
                    link['href'] = f'{prefix}css/google-fonts.css'

            # Localize CDN jQuery script tags
            for script in soup.find_all('script', src=True):
                src = script.get('src', '')
                if 'cdn.jsdelivr.net' in src and 'jquery' in src.lower():
                    script['src'] = f'{prefix}js/jquery.min.js'

            # Fix inline script content (version-switcher, nav JSON, archive root detection)
            for script in soup.find_all('script'):
                txt = script.string
                if not txt:
                    continue
                # Preserve version-switcher: only remove feedback-widget
                if '.version-switcher' in txt and 'feedback-widget' in txt:
                    txt = txt.replace(
                        "$('.version-switcher, #version-switcher, .feedback-widget').remove();",
                        "$('.feedback-widget').remove();"
                    )
                # Fix sidebar baseUrl: Jekyll sets it to "/docs", making every sidebar link
                # resolve to file:///docs/... in a local file:// archive.
                # Fix: set baseUrl to "" and patch the href generation to use archive-root
                # detection instead of counting from the filesystem root.
                if 'baseUrl: "/docs"' in txt:
                    txt = txt.replace('baseUrl: "/docs"', 'baseUrl: ""')
                    # Replace .attr("href", ...) with archive-root-aware relative path computation.
                    # Detects the archive root by finding a path component followed by a known
                    # archive subdirectory, then computes depth only relative to that root —
                    # works correctly regardless of where the archive is placed on disk.
                    txt = txt.replace(
                        '.attr("href", urls[0] || "#")',
                        '.attr("href", (function(u){'
                        'if(!u||u==="#"||/^https?:/.test(u))return u||"#";'
                        'if(!u.startsWith("/"))return u;'
                        'var pp=window.location.pathname.split("/");'
                        'var idx=-1;'
                        'var kd=["cockroachcloud","molt","releases","advisories","stable","_internal","css","js","images","fonts"];'
                        'for(var i=0;i<pp.length-1;i++){'
                        'if(pp[i]&&((/^v\\d+\\.\\d+$/.test(pp[i+1]))||kd.indexOf(pp[i+1])!==-1))'
                        '{idx=i;break;}'
                        '}'
                        'var depth=idx!==-1?pp.length-idx-2:0;'
                        'var pfx="";for(var j=0;j<depth;j++)pfx+="../";'
                        'var path=u.slice(1);'
                        'if(!path||path==="/")return pfx+"index.html";'
                        'if(!path.match(/\\.\\w{2,4}$/))path+=".html";'
                        'return pfx+path;'
                        '})(urls[0]))'
                    )
                # Fix archive root detection for older site builds that use archiveIndex approach:
                # 'stable' is a valid top-level archive subdir but wasn't in the detection list.
                if "(pathParts[i+1] === 'advisories') // Has advisories subfolder" in txt:
                    txt = txt.replace(
                        "(pathParts[i+1] === 'advisories') // Has advisories subfolder",
                        "(pathParts[i+1] === 'advisories') || // Has advisories subfolder\n"
                        "                        (pathParts[i+1] === 'stable') // Has stable subfolder"
                    )
                if txt != script.string:
                    script.string = txt

            # Fix CSS url() paths inside <style> tags (safe: CSS content, not HTML structure)
            for style in soup.find_all('style'):
                if style.string:
                    style.string = self.fix_asset_paths(style.string, prefix)

            # Fix CSS url() in inline style attributes
            for tag in soup.find_all(style=True):
                tag['style'] = self.fix_asset_paths(tag['style'], prefix)

            # Inject offline nav assets and styles into <head>
            if soup.head is not None:
                soup.head.append(
                    BeautifulSoup(self.get_nav_dependencies(prefix), 'html.parser')
                )
                soup.head.append(
                    BeautifulSoup(self.get_offline_styles(prefix), 'html.parser')
                )

            # Inject nav init script before </body>
            if soup.body is not None:
                soup.body.append(
                    BeautifulSoup(self.get_nav_init_script(), 'html.parser')
                )

            file_path.write_text(str(soup), encoding='utf-8')
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

        session = self._make_session()
        try:
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            css_response = session.get(FONTS_CSS_URL, headers=headers, timeout=10)
            css_response.raise_for_status()
            css_content = css_response.text

            # Find all font URLs
            font_urls = set(re.findall(r"url\((https://fonts\.gstatic\.com/[^\)]+)\)", css_content))

            for url in font_urls:
                try:
                    font_response = session.get(url, headers=headers, timeout=10)
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

        session = self._make_session()
        for name, url, dest_dir in assets:
            dest_file = dest_dir / name
            if not dest_file.exists():
                try:
                    self.log(f"  Downloading {name}...")
                    response = session.get(url, timeout=10)
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

        soup = BeautifulSoup(index_path.read_text(encoding='utf-8'), 'html.parser')

        banner_style = BeautifulSoup('''<style>
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
</style>''', 'html.parser')

        banner_div = BeautifulSoup('''<div class="archived-banner">
<p class="archived-banner-text">
This is an archived version of the CockroachDB documentation.
<a href="https://www.cockroachlabs.com/docs/stable/" class="archived-banner-link">View the latest documentation</a>
</p>
</div>''', 'html.parser')

        if soup.head is not None:
            soup.head.append(banner_style)
        if soup.body is not None:
            soup.body.insert(0, banner_div)

        index_path.write_text(str(soup), encoding='utf-8')
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
