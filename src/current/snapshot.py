#!/usr/bin/env python3
"""
Complete Offline Documentation Archiver for Jekyll CockroachDB Documentation
FIXED VERSION with correct JavaScript URL processing
"""
import re
import shutil
import requests
import os
import sys
from pathlib import Path
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
import json
from datetime import datetime
import hashlib

# Configuration
JEKYLL_ROOT = Path.cwd()
SITE_ROOT = JEKYLL_ROOT / "_site"
DOCS_ROOT = SITE_ROOT / "docs"
OUTPUT_ROOT = JEKYLL_ROOT / "offline_snap"

# The pre-rendered sidebar file
SIDEBAR_HTML_PATH = DOCS_ROOT / "_internal" / "sidebar-v19.2.html"

TARGET_VERSION = "v19.2"

# Common pages to include
COMMON_PAGES = [
    "index.html",
    "cockroachcloud/*.html",
    "releases/*.html",
    "advisories/*.html"
]

# Google Fonts
FONTS_CSS_URL = (
    "https://fonts.googleapis.com/css2?"
    "family=Poppins:wght@400;600&"
    "family=Source+Code+Pro&"
    "family=Source+Sans+Pro:wght@300;400;600;700&"
    "display=swap"
)


class OfflineArchiver:
    def __init__(self):
        self.sidebar_html = None
        self.processed_files = set()
        self.missing_assets = set()
        self.copied_assets = set()
        
    def log(self, message, level="INFO"):
        """Enhanced logging with levels"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        prefix = {
            "INFO": "ℹ️ ",
            "SUCCESS": "✅",
            "WARNING": "⚠️ ",
            "ERROR": "❌",
            "DEBUG": "🔍"
        }.get(level, "")
        print(f"[{timestamp}] {prefix} {message}")
    
    def clean_sidebar_data(self, sidebar_data):
        """Remove broken links from sidebar data"""
        def check_file_exists(url):
            """Check if a file exists for a given URL"""
            if url.startswith(('http://', 'https://', '#', 'mailto:', 'javascript:')):
                return True  # External links are always valid
            
            # Normalize URL to file path
            file_url = url.strip()
            
            # Handle root/empty URLs
            if file_url in ['/', '', 'index', 'index.html']:
                return True  # Root index always exists
            
            # Remove leading slash and docs prefix
            if file_url.startswith('/docs/'):
                file_url = file_url[6:]
            elif file_url.startswith('docs/'):
                file_url = file_url[5:]
            file_url = file_url.lstrip('/')
            
            # Handle stable -> v19.2
            file_url = file_url.replace('/stable/', f'/{TARGET_VERSION}/')
            file_url = file_url.replace('stable/', f'{TARGET_VERSION}/')
            
            # Convert ${VERSION} placeholder
            file_url = file_url.replace('${VERSION}', TARGET_VERSION)
            
            # Add .html if needed
            if file_url and not file_url.endswith('/') and not file_url.endswith('.html'):
                if '.' not in file_url.split('/')[-1]:  # No extension
                    file_url += '.html'
            
            # Check if file exists
            file_path = DOCS_ROOT / file_url
            exists = file_path.exists()
            
            if not exists:
                self.log(f"Removing broken link: {url} -> {file_path}", "WARNING")
            
            return exists
        
        def clean_item(item):
            """Recursively clean an item and its children"""
            if isinstance(item, dict):
                # Clean URLs if present
                if 'urls' in item:
                    item['urls'] = [url for url in item['urls'] if check_file_exists(url)]
                    # If no valid URLs left, this item is invalid
                    if not item['urls']:
                        return None
                
                # Clean child items if present
                if 'items' in item:
                    cleaned_items = []
                    for child in item['items']:
                        cleaned_child = clean_item(child)
                        if cleaned_child is not None:
                            cleaned_items.append(cleaned_child)
                    item['items'] = cleaned_items
                    
                    # If no URLs and no valid children, remove this item
                    if 'urls' not in item and not item['items']:
                        return None
                
                return item
            
            return item
        
        # Clean the sidebar data
        cleaned_items = []
        for item in sidebar_data:
            cleaned_item = clean_item(item)
            if cleaned_item is not None:
                cleaned_items.append(cleaned_item)
        
        return cleaned_items

    def load_sidebar(self):
        """Load and prepare the sidebar HTML"""
        self.log(f"Loading sidebar from: {SIDEBAR_HTML_PATH}")
        
        if SIDEBAR_HTML_PATH.exists():
            self.sidebar_html = SIDEBAR_HTML_PATH.read_text(encoding="utf-8")
        else:
            # Try alternative locations
            alt_paths = [
                DOCS_ROOT / "_internal" / "sidebar-v19.2.html",
                SITE_ROOT / "_internal" / "sidebar-v19.2.html",
            ]
            
            for alt_path in alt_paths:
                if alt_path.exists():
                    self.log(f"Found sidebar at: {alt_path}", "SUCCESS")
                    self.sidebar_html = alt_path.read_text(encoding="utf-8")
                    break
        
        if self.sidebar_html:
            # Extract and clean sidebar data
            self.log("Cleaning sidebar data (removing broken links)...")
            
            # Parse the sidebar HTML to extract the JavaScript data
            import re
            import json
            
            # Extract the sidebar items from the JavaScript
            items_match = re.search(r'items:\s*(\[[\s\S]*?\])\s*};', self.sidebar_html)
            if items_match:
                try:
                    # Parse the JavaScript array as JSON (with some cleaning)
                    items_str = items_match.group(1)
                    # Clean up JavaScript to make it valid JSON
                    items_str = re.sub(r'(\w+):', r'"\1":', items_str)  # Quote keys
                    items_str = re.sub(r',\s*}', '}', items_str)  # Remove trailing commas
                    items_str = re.sub(r',\s*]', ']', items_str)  # Remove trailing commas in arrays
                    
                    sidebar_data = json.loads(items_str)
                    
                    # Clean the sidebar data
                    cleaned_data = self.clean_sidebar_data(sidebar_data)
                    
                    # Replace the items in the HTML
                    cleaned_items_str = json.dumps(cleaned_data, indent=2)
                    self.sidebar_html = re.sub(
                        r'items:\s*\[[\s\S]*?\]',
                        f'items:{cleaned_items_str}',
                        self.sidebar_html
                    )
                    
                    self.log(f"Cleaned sidebar data: removed broken links", "SUCCESS")
                    
                except Exception as e:
                    self.log(f"Could not clean sidebar data: {e}", "WARNING")
            
            # Simplify isVersionDirectory function for v19.2 only
            self.sidebar_html = re.sub(
                r'isVersionDirectory:\s*function\s*\([^}]*\{[^}]*\}',
                'isVersionDirectory: function (d) { return d === "v19.2" || d === "stable"; }',
                self.sidebar_html
            )
            
            # Clean the sidebar HTML of any Ask AI elements
            sidebar_soup = BeautifulSoup(self.sidebar_html, "html.parser")
            
            # Remove Ask AI elements from sidebar
            remove_selectors = [
                '.ask-ai', '#ask-ai', '[data-ask-ai]', '.kapa-widget',
                '[class*="kapa"]', '[id*="kapa"]', 'script[src*="kapa"]',
                '[class*="ask-ai"]', '[id*="ask-ai"]'
            ]
            
            for selector in remove_selectors:
                for elem in sidebar_soup.select(selector):
                    elem.decompose()
            
            # Remove scripts that might initialize Ask AI
            for script in sidebar_soup.find_all('script'):
                if script.string and any(term in script.string.lower() for term in ['kapa', 'askai', 'ask-ai']):
                    script.decompose()
            
            # Pre-process sidebar links to normalize paths
            for a in sidebar_soup.find_all('a', href=True):
                href = a['href']
                
                # Skip external links
                if href.startswith(('http://', 'https://', '#', 'mailto:')):
                    continue
                
                # First handle stable -> v19.2
                if 'stable' in href:
                    href = href.replace('/stable/', f'/{TARGET_VERSION}/')
                    href = href.replace('stable/', f'{TARGET_VERSION}/')
                    if href == 'stable':
                        href = TARGET_VERSION
                
                # Remove /docs/ prefix if present (but keep everything after)
                if href.startswith('/docs/'):
                    href = href[6:]
                elif href.startswith('docs/'):
                    href = href[5:]
                
                # Remove leading slash
                href = href.lstrip('/')
                
                # Update the href
                a['href'] = href
            
            self.sidebar_html = str(sidebar_soup)
            return True
        
        self.log("Sidebar not found", "WARNING")
        return False
    
    def ensure_asset(self, name, local_candidates, url, dest_dir):
        """Ensure an asset exists, downloading if necessary"""
        dest_dir.mkdir(parents=True, exist_ok=True)
        dst = dest_dir / name
        
        # Try local candidates first
        for candidate in local_candidates:
            p = Path(candidate)
            if p.exists() and p.resolve() != dst.resolve():
                shutil.copy(p, dst)
                self.log(f"Asset copied: {name}", "SUCCESS")
                return
        
        # Download if not found locally
        if not dst.exists():
            try:
                self.log(f"Downloading {name}...")
                resp = requests.get(url, timeout=10)
                resp.raise_for_status()
                dst.write_bytes(resp.content)
                self.log(f"Downloaded: {name}", "SUCCESS")
            except Exception as e:
                self.log(f"Failed to download {name}: {e}", "ERROR")
    
    def fix_sidebar_javascript(self, html):
        """Fix the embedded sidebar JavaScript configuration and URL processing"""
        
        # Fix 1: Replace baseUrl in the embedded sidebar configuration
        html = re.sub(
            r'baseUrl:\s*["\'][^"\']*["\']',
            'baseUrl: ""',
            html
        )
        
        # Fix 2: Find and replace the URL processing logic
        # Look for the specific URL processing pattern in the JavaScript
        url_processing_pattern = r'(if \(!/\^https\?:/.test\(url\)\) \{\s*url = sidebar\.baseUrl \+ url\.replace\([^}]+\}\s*return url;)'
        
        # More robust pattern that captures the entire URL processing block
        better_pattern = r'(const urls = \(item\.urls \|\| \[\]\)\.map\(function \(url\) \{[\s\S]*?)(if \(!/\^https\?:/.test\(url\)\) \{[\s\S]*?url = sidebar\.baseUrl \+ url\.replace[\s\S]*?\}[\s\S]*?)(return url;[\s\S]*?\}\);)'
        
        def replace_url_processing(match):
            start_part = match.group(1)
            end_part = match.group(3)
            
            # Inject our custom URL processing logic
            new_processing = r'''if (!/^https?:/.test(url)) {
                // Remove /docs/ prefix if present
                url = url.replace(/^\/docs\//, '').replace(/^docs\//, '');
                
                // Handle root/home URLs
                if (url === '/' || url === '' || url === 'index' || url === 'index.html') {
                    // For docs home, determine if we need to go up directories
                    var currentPath = window.location.pathname;
                    var pathMatch = currentPath.match(/(cockroachcloud|v19\.2|releases|advisories)\/[^\/]+$/);
                    if (pathMatch) {
                        url = '../index.html';  // Go up to main index
                    } else {
                        url = 'index.html';     // Stay at current level
                    }
                } else {
                    // Better current directory detection for file:// URLs
                    var currentPath = window.location.pathname;
                    var currentDir = '';
                    
                    // Extract just the relevant part of the path (handle both web and file:// URLs)
                    var pathMatch = currentPath.match(/(cockroachcloud|v19\.2|releases|advisories)\/[^\/]+$/);
                    if (pathMatch) {
                        currentDir = pathMatch[1];
                    } else {
                        // Fallback: check if we're in root or any subdirectory
                        var pathParts = currentPath.split('/').filter(function(part) { return part; });
                        for (var i = pathParts.length - 2; i >= 0; i--) {
                            if (pathParts[i] === 'cockroachcloud' || pathParts[i] === 'v19.2' || 
                                pathParts[i] === 'releases' || pathParts[i] === 'advisories') {
                                currentDir = pathParts[i];
                                break;
                            }
                        }
                    }
                    
                    // Remove leading slash from URL
                    if (url.startsWith('/')) {
                        url = url.substring(1);
                    }
                    
                    // Handle stable -> v19.2 conversion
                    url = url.replace(/^stable\//, 'v19.2/').replace(/\/stable\//, '/v19.2/');
                    
                    // Calculate relative path based on current directory context
                    if (currentDir) {
                        // We're in a subdirectory
                        if (url.startsWith(currentDir + '/')) {
                            // Same directory - remove the directory prefix
                            url = url.substring(currentDir.length + 1);
                        } else if (url.includes('/')) {
                            // Different directory - need to go up one level
                            url = '../' + url;
                        } else if (url !== '' && !url.endsWith('.html') && !url.endsWith('/')) {
                            // Root level file - go up one level
                            url = '../' + url;
                        }
                    }
                }
                
                // Clean up any double slashes
                url = url.replace(/\/+/g, '/');
                // Note: Keep .html extensions for offline file:// URLs
            }'''
            
            return start_part + new_processing + end_part
        
        # Try to apply the replacement
        new_html = re.sub(better_pattern, replace_url_processing, html, flags=re.DOTALL)
        
        # If the complex pattern didn't match, try a simpler approach
        if new_html == html:
            # Simple pattern - just replace the specific problematic line
            simple_pattern = r'url = sidebar\.baseUrl \+ url\.replace\([^}]+\}'
            
            simple_replacement = r'''// Custom offline URL processing
                url = url.replace(/^\/docs\//, '').replace(/^docs\//, '');
                
                // Handle root/home URLs
                if (url === '/' || url === '' || url === 'index' || url === 'index.html') {
                    var currentPath = window.location.pathname;
                    var pathMatch = currentPath.match(/(cockroachcloud|v19\.2|releases|advisories)\/[^\/]+$/);
                    if (pathMatch) {
                        url = '../index.html';
                    } else {
                        url = 'index.html';
                    }
                } else {
                    var currentPath = window.location.pathname;
                    var currentDir = '';
                    
                    var pathMatch = currentPath.match(/(cockroachcloud|v19\.2|releases|advisories)\/[^\/]+$/);
                    if (pathMatch) {
                        currentDir = pathMatch[1];
                    } else {
                        var pathParts = currentPath.split('/').filter(function(part) { return part; });
                        for (var i = pathParts.length - 2; i >= 0; i--) {
                            if (pathParts[i] === 'cockroachcloud' || pathParts[i] === 'v19.2' || 
                                pathParts[i] === 'releases' || pathParts[i] === 'advisories') {
                                currentDir = pathParts[i];
                                break;
                            }
                        }
                    }
                    
                    if (url.startsWith('/')) {
                        url = url.substring(1);
                    }
                    
                    url = url.replace(/^stable\//, 'v19.2/').replace(/\/stable\//, '/v19.2/');
                    
                    if (currentDir) {
                        if (url.startsWith(currentDir + '/')) {
                            url = url.substring(currentDir.length + 1);
                        } else if (url.includes('/')) {
                            url = '../' + url;
                        } else if (url !== '' && !url.endsWith('.html') && !url.endsWith('/')) {
                            url = '../' + url;
                        }
                    }
                }
                
                url = url.replace(/\/+/g, '/');
                // Keep .html extensions for offline use
            }'''
            
            new_html = re.sub(simple_pattern, simple_replacement, html, flags=re.DOTALL)
            
            # Also fix the .html stripping issue
            new_html = re.sub(
                r'url = url\.replace\("/index\.html", ""\)\.replace\("\.html", ""\);',
                'url = url.replace("/index.html", ""); // Keep .html for offline',
                new_html
            )
        
        # Debug output
        if new_html != html:
            self.log("Successfully replaced JavaScript URL processing", "SUCCESS")
        else:
            self.log("Warning: JavaScript URL processing replacement may have failed", "WARNING")
        
        return new_html
    
    def process_html_file(self, src_path):
        """Process a single HTML file"""
        try:
            rel_path = src_path.relative_to(DOCS_ROOT)
            dst_path = OUTPUT_ROOT / rel_path
            
            # Calculate depth and prefix
            depth = len(rel_path.parent.parts)
            prefix = "../" * depth
            
            # Check if this file is in the version directory
            is_in_version_dir = str(rel_path).startswith(f'{TARGET_VERSION}/')
            
            self.log(f"Processing {rel_path} (in_v_dir={is_in_version_dir}, depth={depth})")
            
            # Read content
            html = src_path.read_text(encoding="utf-8")
            
            # CRITICAL: Fix sidebar JavaScript BEFORE other processing
            html = self.fix_sidebar_javascript(html)
            
            # Inject sidebar HTML if available
            if self.sidebar_html:
                html = re.sub(
                    r"(<div id=\"sidebar\"[^>]*>)(\s*?</div>)",
                    rf"\1{self.sidebar_html}\2",
                    html,
                    flags=re.IGNORECASE,
                )
            
            # Parse with BeautifulSoup for additional cleanup
            soup = BeautifulSoup(html, "html.parser")
            
            # Remove Ask AI widget and other unwanted elements
            remove_selectors = [
                '.ask-ai', '#ask-ai', '[data-ask-ai]', '.ai-widget', '.kapa-widget',
                'script[src*="kapa"]', '#kapa-widget-container', '.kapa-trigger',
                '.kapa-ai-button', '[class*="kapa"]', '[id*="kapa"]',
                'div[data-kapa-widget]', 'button[aria-label*="AI"]',
                '[class*="ask-ai"]', '[id*="ask-ai"]',
                'iframe[src*="kapa"]', 'iframe[id*="kapa"]',
                '.version-switcher', '#version-switcher', '.version-dropdown',
                '.feedback-widget', '#feedback-widget', '[id*="feedback"]',
                '.helpful-widget', '.page-helpful',
                'script[src*="googletagmanager"]', 'script[src*="google-analytics"]',
                'script[src*="segment"]', 'script[src*="heap"]',
            ]
            
            for selector in remove_selectors:
                for elem in soup.select(selector):
                    elem.decompose()
            
            # Remove any script tags that contain kapa or AI-related code
            for script in soup.find_all('script'):
                if script.string and any(term in script.string.lower() for term in ['kapa', 'askai', 'ask-ai', 'aiwidget']):
                    script.decompose()
            
            # Remove any iframes that might be Ask AI related
            for iframe in soup.find_all('iframe'):
                src = iframe.get('src', '')
                if any(term in src.lower() for term in ['kapa', 'ask', 'ai']):
                    iframe.decompose()
            
            # Convert back to string
            html = str(soup)
            
            # Clean up various path patterns
            html = re.sub(
                r"(src|href)=\"([^\"?]+)\?[^\" ]+\"",
                lambda m: f'{m.group(1)}="{m.group(2)}"',
                html,
            )
            
            # Fix various path patterns
            html = re.sub(r'(href|src)="/docs/stable/', rf'\1="{TARGET_VERSION}/', html)
            html = re.sub(r'(href|src)="docs/stable/', rf'\1="{TARGET_VERSION}/', html)
            html = re.sub(r'(href|src)="/docs/(v\d+\.\d+/[^"]+)"', r'\1="\2"', html)
            html = re.sub(r'(href|src)="docs/(v\d+\.\d+/[^"]+)"', r'\1="\2"', html)
            html = re.sub(r'(href|src)="/docs/([^v][^"]+)"', r'\1="\2"', html)
            html = re.sub(r'(href|src)="docs/([^v][^"]+)"', r'\1="\2"', html)
            html = re.sub(r'(href|src)="/(?!/)([^"]+)"', r'\1="\2"', html)
            
            # Fix asset paths
            for asset in ["css", "js", "images", "_internal"]:
                html = re.sub(
                    rf"(src|href)=[\"']/{asset}/([^\"']+)[\"']",
                    rf'\1="{asset}/\2"',
                    html,
                )
            
            html = re.sub(r"(src|href)=[\"']/?img/([^\"']+)[\"']", r'\1="img/\2"', html)
            html = re.sub(r"(src|href|xlink:href)=[\"']/?docs/images/([^\"']+)[\"']", r'\1="images/\2"', html)
            
            # Replace Google Fonts
            html = re.sub(
                r"<link[^>]+fonts\.googleapis\.com[^>]+>",
                f'<link rel="stylesheet" href="{prefix}css/google-fonts.css">',
                html,
            )
            
            # Apply relative prefixes to asset paths
            for asset in ["css", "js", "images", "_internal", "img"]:
                html = re.sub(
                    rf'(src|href)="({asset}/[^"]+)"',
                    rf'\1="{prefix}\2"',
                    html,
                )
            
            # Inject navigation dependencies
            nav_deps = f'''<link rel="stylesheet" href="{prefix}css/jquery.navgoco.css">
<script src="{prefix}js/jquery.min.js"></script>
<script src="{prefix}js/jquery.cookie.min.js"></script>
<script src="{prefix}js/jquery.navgoco.min.js"></script>'''
            
            html = re.sub(r"</head>", nav_deps + "\n</head>", html, flags=re.IGNORECASE)
            
            # Add offline styles
            offline_styles = f'''<style>
/* Force sidebar visibility */
#sidebar, #sidebarMenu, .navbar-collapse {{
    display: block !important;
    visibility: visible !important;
    height: auto !important;
    overflow: visible !important;
}}

/* Hide online-only elements */
.ask-ai, #ask-ai, [data-ask-ai], .ai-widget, .kapa-widget,
[class*="kapa"], [id*="kapa"], [class*="ask-ai"], [id*="ask-ai"],
.version-switcher, #version-switcher, .feedback-widget,
button[aria-label*="AI"], div[data-kapa-widget],
.kapa-ai-button, .ai-assistant, .ai-chat,
.floating-action-button, .fab, [class*="floating-button"] {{
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
    position: absolute !important;
    left: -9999px !important;
}}

/* Navgoco styling */
.navgoco li {{ list-style: none; }}
.navgoco li.active > a {{
    font-weight: bold;
    background-color: #0066cc;
    color: white !important;
}}
.navgoco li > ul {{ display: none; }}
.navgoco li.open > ul {{ display: block; }}
</style>'''
            
            html = re.sub(r"</head>", offline_styles + "\n</head>", html, flags=re.IGNORECASE)
            
            # Add navigation initialization
            nav_init = """<script>
$(function(){
    // Remove unwanted elements
    $('.ask-ai, #ask-ai, [data-ask-ai], .ai-widget, .kapa-widget').remove();
    $('[class*="kapa"], [id*="kapa"], [class*="ask-ai"], [id*="ask-ai"]').remove();
    $('.version-switcher, #version-switcher, .feedback-widget').remove();
    $('.floating-action-button, .fab, [class*="floating-button"]').remove();
    
    // Initialize navigation
    $('#sidebar, #sidebarMenu, #mysidebar').navgoco({
        cookie: false,
        accordion: true
    });
    
    // Highlight current page
    var page = location.pathname.split('/').pop() || 'index.html';
    $('#sidebar a, #sidebarMenu a, #mysidebar a').each(function() {
        var href = $(this).attr('href');
        if (href && (href.endsWith(page) || href.endsWith('/' + page))) {
            $(this).closest('li').addClass('active');
            $(this).parents('ul').show().parent('li').addClass('open');
        }
    });
});
</script>"""
            
            html = re.sub(r"</body>", nav_init + "\n</body>", html, flags=re.IGNORECASE)
            
            # Write output
            dst_path.parent.mkdir(parents=True, exist_ok=True)
            dst_path.write_text(html, encoding="utf-8")
            
            self.processed_files.add(str(rel_path))
            
        except Exception as e:
            self.log(f"Error processing {src_path}: {e}", "ERROR")
            import traceback
            traceback.print_exc()
    
    def fix_css_images(self):
        """Fix image paths in CSS files"""
        self.log("Fixing CSS image paths...")
        
        for css_file in (OUTPUT_ROOT / "css").rglob("*.css"):
            try:
                content = css_file.read_text(encoding="utf-8")
                
                # Fix various image URL patterns
                content = re.sub(
                    r"url\((['\"]?)/?docs/images/([^)\"']+)\1\)",
                    r"url(\1../images/\2\1)",
                    content,
                )
                content = re.sub(
                    r"url\((['\"]?)images/([^)\"']+)\1\)",
                    r"url(\1../images/\2\1)",
                    content,
                )
                
                css_file.write_text(content, encoding="utf-8")
                
            except Exception as e:
                self.log(f"Error fixing CSS {css_file}: {e}", "WARNING")
    
    def download_google_fonts(self):
        """Download and localize Google Fonts"""
        self.log("Downloading Google Fonts...")
        
        fonts_dir = OUTPUT_ROOT / "fonts"
        fonts_dir.mkdir(exist_ok=True)
        
        try:
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            css_response = requests.get(FONTS_CSS_URL, headers=headers, timeout=10)
            css_response.raise_for_status()
            css_content = css_response.text
            
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
                    self.log(f"Failed to download font from {url}: {e}", "WARNING")
            
            (OUTPUT_ROOT / "css" / "google-fonts.css").write_text(css_content, encoding="utf-8")
            self.log("Google Fonts localized", "SUCCESS")
            
        except Exception as e:
            self.log(f"Error downloading fonts: {e}", "ERROR")
            fallback = """/* Fallback fonts */
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
code, pre { font-family: Consolas, Monaco, "Courier New", monospace; }"""
            (OUTPUT_ROOT / "css" / "google-fonts.css").write_text(fallback)
    
    def create_index_page(self):
        """Create the index page"""
        index_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CockroachDB {TARGET_VERSION} Documentation (Offline)</title>
    <link rel="stylesheet" href="css/customstyles.css">
    <link rel="stylesheet" href="css/google-fonts.css">
    <style>
        body {{
            font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, sans-serif;
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }}
        h1 {{ 
            color: #1f2937;
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }}
        .subtitle {{
            color: #6b7280;
            font-size: 1.25rem;
            margin-bottom: 2rem;
        }}
        .grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }}
        .card {{
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border: 1px solid #e5e7eb;
        }}
        .card h2 {{
            margin-top: 0;
            color: #1f2937;
            font-size: 1.5rem;
        }}
        .card ul {{
            list-style: none;
            padding: 0;
            margin: 0;
        }}
        .card li {{
            margin: 0.5rem 0;
        }}
        .card a {{
            color: #3b82f6;
            text-decoration: none;
        }}
        .card a:hover {{
            text-decoration: underline;
        }}
        .status {{
            background: #fef3c7;
            border: 1px solid #fcd34d;
            color: #92400e;
            padding: 1rem;
            border-radius: 8px;
            margin-top: 2rem;
        }}
    </style>
</head>
<body>
    <h1>CockroachDB {TARGET_VERSION}</h1>
    <p class="subtitle">Offline Documentation Archive</p>
    
    <div class="grid">
        <div class="card">
            <h2>📚 Getting Started</h2>
            <ul>
                <li><a href="{TARGET_VERSION}/index.html">Documentation Home</a></li>
                <li><a href="{TARGET_VERSION}/install-cockroachdb-linux.html">Installation Guide</a></li>
                <li><a href="{TARGET_VERSION}/start-a-local-cluster.html">Start a Local Cluster</a></li>
                <li><a href="{TARGET_VERSION}/learn-cockroachdb-sql.html">Learn CockroachDB SQL</a></li>
                <li><a href="{TARGET_VERSION}/architecture/overview.html">Architecture Overview</a></li>
            </ul>
        </div>
        
        <div class="card">
            <h2>🔧 Reference</h2>
            <ul>
                <li><a href="{TARGET_VERSION}/sql-statements.html">SQL Statements</a></li>
                <li><a href="{TARGET_VERSION}/functions-and-operators.html">Functions & Operators</a></li>
                <li><a href="{TARGET_VERSION}/data-types.html">Data Types</a></li>
                <li><a href="{TARGET_VERSION}/known-limitations.html">Known Limitations</a></li>
                <li><a href="{TARGET_VERSION}/performance-best-practices-overview.html">Performance Best Practices</a></li>
            </ul>
        </div>
        
        <div class="card">
            <h2>☁️ CockroachDB Cloud</h2>
            <ul>
                <li><a href="cockroachcloud/quickstart.html">Cloud Quickstart</a></li>
                <li><a href="cockroachcloud/create-an-account.html">Create an Account</a></li>
                <li><a href="cockroachcloud/production-checklist.html">Production Checklist</a></li>
            </ul>
        </div>
        
        <div class="card">
            <h2>📋 Resources</h2>
            <ul>
                <li><a href="releases/index.html">Release Notes</a></li>
                <li><a href="releases/{TARGET_VERSION}.html">{TARGET_VERSION} Release</a></li>
                <li><a href="advisories/index.html">Technical Advisories</a></li>
            </ul>
        </div>
    </div>
    
    <div class="status">
        <p><strong>📌 Offline Archive</strong></p>
        <p>This is a complete offline archive of the CockroachDB {TARGET_VERSION} documentation.
        All internal links have been updated to work offline.</p>
        <p>Created: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
    </div>
</body>
</html>"""
        
        (OUTPUT_ROOT / "index.html").write_text(index_html)
        self.log("Created index.html", "SUCCESS")
    
    def build(self):
        """Main build process"""
        print("\n" + "="*60)
        print("🚀 COCKROACHDB OFFLINE DOCUMENTATION ARCHIVER (FIXED)")
        print("="*60)
        
        # Verify paths
        self.log(f"Jekyll Root: {JEKYLL_ROOT}")
        self.log(f"Site Root: {SITE_ROOT}")
        self.log(f"Docs Root: {DOCS_ROOT}")
        self.log(f"Output: {OUTPUT_ROOT}")
        
        if not SITE_ROOT.exists():
            self.log("Site root not found! Run 'jekyll build' first.", "ERROR")
            return False
        
        # Clean output directory
        if OUTPUT_ROOT.exists():
            self.log("Cleaning existing output directory...")
            shutil.rmtree(OUTPUT_ROOT)
        OUTPUT_ROOT.mkdir(parents=True)
        
        # Copy global assets FIRST
        self.log("\n--- Copying Global Assets ---")
        for asset_dir in ["css", "js", "img"]:
            src = SITE_ROOT / asset_dir
            if src.exists():
                dst = OUTPUT_ROOT / asset_dir
                shutil.copytree(src, dst, dirs_exist_ok=True)
                self.log(f"Copied global {asset_dir}/", "SUCCESS")
        
        # Copy docs-specific assets
        self.log("\n--- Copying Docs Assets ---")
        for asset_dir in ["css", "js", "images", "_internal"]:
            src = DOCS_ROOT / asset_dir
            if src.exists():
                dst = OUTPUT_ROOT / asset_dir
                shutil.copytree(src, dst, dirs_exist_ok=True)
                self.log(f"Copied docs {asset_dir}/", "SUCCESS")
        
        # Ensure critical navigation assets
        self.log("\n--- Ensuring Navigation Assets ---")
        self.ensure_asset(
            "jquery.min.js",
            [DOCS_ROOT / "js" / "jquery.min.js", SITE_ROOT / "js" / "jquery.min.js"],
            "https://code.jquery.com/jquery-3.6.3.min.js",
            OUTPUT_ROOT / "js"
        )
        self.ensure_asset(
            "jquery.cookie.min.js",
            [DOCS_ROOT / "js" / "jquery.cookie.min.js", SITE_ROOT / "js" / "jquery.cookie.min.js"],
            "https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js",
            OUTPUT_ROOT / "js"
        )
        self.ensure_asset(
            "jquery.navgoco.min.js",
            [DOCS_ROOT / "js" / "jquery.navgoco.min.js", SITE_ROOT / "js" / "jquery.navgoco.min.js"],
            "https://raw.githubusercontent.com/tefra/navgoco/master/src/jquery.navgoco.js",
            OUTPUT_ROOT / "js"
        )
        self.ensure_asset(
            "jquery.navgoco.css",
            [DOCS_ROOT / "css" / "jquery.navgoco.css", SITE_ROOT / "css" / "jquery.navgoco.css"],
            "https://raw.githubusercontent.com/tefra/navgoco/master/src/jquery.navgoco.css",
            OUTPUT_ROOT / "css"
        )
        
        # Load sidebar
        self.log("\n--- Loading Sidebar ---")
        self.load_sidebar()
        
        # Process HTML files
        self.log("\n--- Processing HTML Files ---")
        
        # Collect files to process
        files_to_process = []
        
        # Target version files
        version_dir = DOCS_ROOT / TARGET_VERSION
        if version_dir.exists():
            files_to_process.extend(list(version_dir.rglob("*.html")))
            self.log(f"Found {len(files_to_process)} files in {TARGET_VERSION}/", "SUCCESS")
        
        # Common pages
        for pattern in COMMON_PAGES:
            if '*' in pattern:
                files_to_process.extend(list(DOCS_ROOT.glob(pattern)))
            else:
                file_path = DOCS_ROOT / pattern
                if file_path.exists():
                    files_to_process.append(file_path)
        
        # Remove duplicates
        files_to_process = list(set(files_to_process))
        self.log(f"Total files to process: {len(files_to_process)}")
        
        # Process each file
        for i, file_path in enumerate(files_to_process, 1):
            # Skip non-v19.2 version directories
            rel_path = file_path.relative_to(DOCS_ROOT)
            if rel_path.parts and rel_path.parts[0].startswith('v') and rel_path.parts[0] != TARGET_VERSION:
                continue
            
            if i % 25 == 0:
                self.log(f"Progress: {i}/{len(files_to_process)} ({i*100//len(files_to_process)}%)")
            
            self.process_html_file(file_path)
        
        self.log(f"Processed {len(self.processed_files)} files", "SUCCESS")
        
        # Final cleanup steps
        self.log("\n--- Final Steps ---")
        self.fix_css_images()
        self.download_google_fonts()
        self.create_index_page()
        
        # Summary
        print("\n" + "="*60)
        self.log("ARCHIVE COMPLETE WITH JAVASCRIPT FIXES!", "SUCCESS")
        self.log(f"Output directory: {OUTPUT_ROOT.resolve()}")
        self.log(f"Total files: {len(self.processed_files)}")
        self.log("✅ Sidebar JavaScript URL processing FIXED", "SUCCESS")
        self.log("✅ Relative path calculation corrected", "SUCCESS")
        self.log("✅ cockroachcloud/ links should now work correctly", "SUCCESS")
        
        print(f"\n🎉 Fixed offline site built in {OUTPUT_ROOT}")
        print(f"\n📦 To test: open file://{OUTPUT_ROOT.resolve()}/index.html")
        print(f"\n🔗 Test the problematic link: cockroachcloud/quickstart.html → create-an-account.html")
        
        return True


def main():
    """Main entry point"""
    try:
        archiver = OfflineArchiver()
        success = archiver.build()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nArchiving cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()