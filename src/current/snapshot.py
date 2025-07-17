#!/usr/bin/env python3
"""
Complete Offline Documentation Archiver for Jekyll CockroachDB Documentation
Fixed version that preserves CSS structure from Code 2
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
    
    def process_html_file(self, src_path):
        """Process a single HTML file using Code 2's approach"""
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
            
            # Inject sidebar HTML if available
            if self.sidebar_html:
                html = re.sub(
                    r"(<div id=\"sidebar\"[^>]*>)(\s*?</div>)",
                    rf"\1{self.sidebar_html}\2",
                    html,
                    flags=re.IGNORECASE,
                )
            
            # Parse with BeautifulSoup to fix sidebar links
            soup = BeautifulSoup(html, "html.parser")
            
            # Remove Ask AI widget and other unwanted elements
            remove_selectors = [
                # Ask AI widget - more comprehensive selectors
                '.ask-ai', '#ask-ai', '[data-ask-ai]', '.ai-widget', '.kapa-widget',
                'script[src*="kapa"]', '#kapa-widget-container', '.kapa-trigger',
                '.kapa-ai-button', '[class*="kapa"]', '[id*="kapa"]',
                'div[data-kapa-widget]', 'button[aria-label*="AI"]',
                '[class*="ask-ai"]', '[id*="ask-ai"]',
                'iframe[src*="kapa"]', 'iframe[id*="kapa"]',
                
                # Version switcher
                '.version-switcher', '#version-switcher', '.version-dropdown',
                
                # Feedback widgets
                '.feedback-widget', '#feedback-widget', '[id*="feedback"]',
                '.helpful-widget', '.page-helpful',
                
                # Analytics
                'script[src*="googletagmanager"]', 'script[src*="google-analytics"]',
                'script[src*="segment"]', 'script[src*="heap"]',
            ]
            
            for selector in remove_selectors:
                for elem in soup.select(selector):
                    elem.decompose()
            
            # Also remove any script tags that contain kapa or AI-related code
            for script in soup.find_all('script'):
                if script.string and any(term in script.string.lower() for term in ['kapa', 'askai', 'ask-ai', 'aiwidget']):
                    script.decompose()
            
            # Remove any iframes that might be Ask AI related
            for iframe in soup.find_all('iframe'):
                src = iframe.get('src', '')
                if any(term in src.lower() for term in ['kapa', 'ask', 'ai']):
                    iframe.decompose()
            
            # Inject sidebar HTML if available
            if self.sidebar_html:
                html = re.sub(
                    r"(<div id=\"sidebar\"[^>]*>)(\s*?</div>)",
                    rf"\1{self.sidebar_html}\2",
                    html,
                    flags=re.IGNORECASE,
                )
            
            # Parse with BeautifulSoup to fix sidebar links
            soup = BeautifulSoup(html, "html.parser")
            
            # Remove Ask AI widget and other unwanted elements
            remove_selectors = [
                # Ask AI widget - more comprehensive selectors
                '.ask-ai', '#ask-ai', '[data-ask-ai]', '.ai-widget', '.kapa-widget',
                'script[src*="kapa"]', '#kapa-widget-container', '.kapa-trigger',
                '.kapa-ai-button', '[class*="kapa"]', '[id*="kapa"]',
                'div[data-kapa-widget]', 'button[aria-label*="AI"]',
                '[class*="ask-ai"]', '[id*="ask-ai"]',
                'iframe[src*="kapa"]', 'iframe[id*="kapa"]',
                
                # Version switcher
                '.version-switcher', '#version-switcher', '.version-dropdown',
                
                # Feedback widgets
                '.feedback-widget', '#feedback-widget', '[id*="feedback"]',
                '.helpful-widget', '.page-helpful',
                
                # Analytics
                'script[src*="googletagmanager"]', 'script[src*="google-analytics"]',
                'script[src*="segment"]', 'script[src*="heap"]',
            ]
            
            for selector in remove_selectors:
                for elem in soup.select(selector):
                    elem.decompose()
            
            # Also remove any script tags that contain kapa or AI-related code
            for script in soup.find_all('script'):
                if script.string and any(term in script.string.lower() for term in ['kapa', 'askai', 'ask-ai', 'aiwidget']):
                    script.decompose()
            
            # Remove any iframes that might be Ask AI related
            for iframe in soup.find_all('iframe'):
                src = iframe.get('src', '')
                if any(term in src.lower() for term in ['kapa', 'ask', 'ai']):
                    iframe.decompose()
            
            # Process sidebar links with clearer logic
            sidebar_links = soup.select("#sidebar a[href], #sidebarMenu a[href], #mysidebar a[href]")
            
            for a in sidebar_links:
                original_href = a.get("href", "")
                
                # Skip external links and anchors
                if original_href.startswith(('http://', 'https://', 'mailto:', '#', 'javascript:')):
                    continue
                
                # Store original
                a['data-original-href'] = original_href
                
                # Process the href step by step
                h = original_href.strip()
                
                # Check if this was originally a relative link (important for context)
                was_relative = not h.startswith('/')
                
                # Step 1: Handle stable -> v19.2 conversion
                h = h.replace('/stable/', f'/{TARGET_VERSION}/')
                h = h.replace('stable/', f'{TARGET_VERSION}/')
                
                # Step 2: Remove domain/localhost if present
                if '127.0.0.1:4000/' in h:
                    h = h.split('127.0.0.1:4000/')[-1]
                if 'localhost:4000/' in h:
                    h = h.split('localhost:4000/')[-1]
                
                # Step 3: Remove /docs/ prefix
                if h.startswith('/docs/'):
                    h = h[6:]  # Remove '/docs/'
                elif h.startswith('docs/'):
                    h = h[5:]  # Remove 'docs/'
                
                # Step 4: Remove any remaining leading slashes
                h = h.lstrip('/')
                
                # Step 5: Determine if we need to add version directory
                needs_version = False
                if h:  # If we have a path
                    # Check if it already has a version
                    if not h.startswith(f'{TARGET_VERSION}/'):
                        # List of paths that should NOT get version prefix
                        non_versioned = [
                            'cockroachcloud/', 'releases/', 'advisories/', 
                            'images/', 'css/', 'js/', '_internal/', 'fonts/',
                            'img/', 'assets/'
                        ]
                        
                        # Check if it's a special non-versioned path
                        is_special = any(h.startswith(d) for d in non_versioned)
                        
                        # Check if it has a file extension that indicates an asset
                        is_asset = any(h.endswith(ext) for ext in [
                            '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', 
                            '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'
                        ])
                        
                        # CRITICAL FIX: If we're already in a version directory and this is
                        # a simple doc page (like secure-a-cluster.html), we DON'T need to add version
                        # because it will be relative to the current directory
                        if is_in_version_dir and not is_special and not is_asset and '/' not in h:
                            # This is a simple filename in the same version directory
                            needs_version = False
                            if 'secure-a-cluster' in h:
                                self.log(f"NOT adding version to '{h}' - already in version dir", "WARNING")
                        elif was_relative and is_in_version_dir:
                            # Original link was relative AND we're in a version directory
                            needs_version = False
                        elif not is_special and not is_asset:
                            # Otherwise, if it's not special and not an asset, it needs version
                            needs_version = True
                            if sidebar_links.index(a) < 5:  # Debug first few
                                self.log(f"Adding version to: {h} (was_relative={was_relative}, in_version={is_in_version_dir})", "DEBUG")
                
                # Add version directory if needed
                if needs_version:
                    h = f'{TARGET_VERSION}/{h}'
                
                # Step 6: Add .html if needed
                if h and not h.endswith('/') and not h.endswith('.html'):
                    # Check if it already has an extension
                    parts = h.split('/')
                    last_part = parts[-1]
                    if '.' not in last_part:
                        h += '.html'
                
                # Step 7: Calculate the correct relative path
                # Now that we've been smart about adding version, this is simpler
                
                # Special debugging for secure-a-cluster.html
                if 'secure-a-cluster' in h or sidebar_links.index(a) < 3:
                    self.log(f"  Final path calc: h='{h}' in_v_dir={is_in_version_dir}", "DEBUG")
                
                if is_in_version_dir:
                    # We're in a version directory
                    if h.startswith(f'{TARGET_VERSION}/'):
                        # This shouldn't happen if we were smart above, but just in case
                        # Remove redundant version prefix
                        h = h[len(TARGET_VERSION) + 1:]
                        final_href = h
                        self.log(f"  WARNING: Had to strip redundant version prefix", "WARNING")
                    elif any(h.startswith(d) for d in ['cockroachcloud/', 'releases/', 'advisories/', 'images/', 'css/', 'js/']):
                        # These need to go up a level from version dir
                        final_href = "../" + h
                    else:
                        # Simple filename in same directory
                        final_href = h
                else:
                    # We're NOT in version dir, use normal prefix
                    final_href = prefix + h if h else prefix + "index.html"
                
                a["href"] = final_href
                
                # Debug output
                if sidebar_links.index(a) < 5 or 'secure-a-cluster' in original_href:
                    self.log(f"Sidebar: '{original_href}' -> '{final_href}'", "INFO")
            
            # Process ALL other links
            all_links = soup.select("a[href]")
            content_link_count = 0
            for a in all_links:
                if a in sidebar_links:  # Skip already processed
                    continue
                    
                original_href = a.get("href", "")
                
                # Skip external links and anchors
                if original_href.startswith(('http://', 'https://', 'mailto:', '#', 'javascript:')):
                    continue
                
                # Store original
                a['data-original-href'] = original_href
                
                # Apply same processing
                h = original_href.strip()
                
                # Check if this was originally relative
                was_relative = not h.startswith('/')
                
                # Handle stable -> v19.2
                h = h.replace('/stable/', f'/{TARGET_VERSION}/')
                h = h.replace('stable/', f'{TARGET_VERSION}/')
                
                # Remove domain
                if '127.0.0.1:4000/' in h:
                    h = h.split('127.0.0.1:4000/')[-1]
                if 'localhost:4000/' in h:
                    h = h.split('localhost:4000/')[-1]
                
                # Remove /docs/ prefix
                if h.startswith('/docs/'):
                    h = h[6:]
                elif h.startswith('docs/'):
                    h = h[5:]
                
                # Remove leading slashes
                h = h.lstrip('/')
                
                # Determine if we need to add version directory
                needs_version = False
                if h:  # If we have a path
                    # Check if it already has a version
                    if not h.startswith(f'{TARGET_VERSION}/'):
                        # List of paths that should NOT get version prefix
                        non_versioned = [
                            'cockroachcloud/', 'releases/', 'advisories/', 
                            'images/', 'css/', 'js/', '_internal/', 'fonts/',
                            'img/', 'assets/'
                        ]
                        
                        # Check if it's a special non-versioned path
                        is_special = any(h.startswith(d) for d in non_versioned)
                        
                        # Check for file extensions that indicate assets
                        is_asset = any(h.endswith(ext) for ext in [
                            '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', 
                            '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'
                        ])
                        
                        # CRITICAL FIX: If we're already in a version directory and this is
                        # a simple doc page (like secure-a-cluster.html), we DON'T need to add version
                        if is_in_version_dir and not is_special and not is_asset and '/' not in h:
                            # This is a simple filename in the same version directory
                            needs_version = False
                            if 'secure-a-cluster' in h:
                                self.log(f"NOT adding version to '{h}' - already in version dir", "WARNING")
                        elif was_relative and is_in_version_dir:
                            # Original link was relative AND we're in a version directory
                            needs_version = False
                        elif not is_special and not is_asset:
                            # Otherwise, if it's not special and not an asset, it needs version
                            needs_version = True
                
                # Add version directory if needed
                if needs_version:
                    h = f'{TARGET_VERSION}/{h}'
                
                # Add .html if needed
                if h and not h.endswith('/') and not h.endswith('.html'):
                    parts = h.split('/')
                    last_part = parts[-1]
                    if '.' not in last_part:
                        h += '.html'
                
                # Calculate the correct relative path
                # Now that we've been smart about adding version, this is simpler
                
                if is_in_version_dir:
                    # We're in a version directory
                    if h.startswith(f'{TARGET_VERSION}/'):
                        # This shouldn't happen if we were smart above, but just in case
                        # Remove redundant version prefix
                        h = h[len(TARGET_VERSION) + 1:]
                        final_href = h
                    elif any(h.startswith(d) for d in ['cockroachcloud/', 'releases/', 'advisories/', 'images/', 'css/', 'js/']):
                        # These need to go up a level from version dir
                        final_href = "../" + h
                    else:
                        # Simple filename in same directory
                        final_href = h
                else:
                    # We're NOT in version dir, use normal prefix
                    final_href = prefix + h if h else prefix + "index.html"
                
                a["href"] = final_href
                
                # Debug first few content links
                if content_link_count < 3 or 'secure-a-cluster' in original_href:
                    self.log(f"Content: '{original_href}' -> '{final_href}'", "INFO")
                    content_link_count += 1
            
            # Convert back to string
            html = str(soup)
            
            # Convert back to string
            html = str(soup)
            
            # Clean up query parameters
            html = re.sub(
                r"(src|href)=\"([^\"?]+)\?[^\" ]+\"",
                lambda m: f'{m.group(1)}="{m.group(2)}"',
                html,
            )
            
            # Fix various path patterns
            # Handle stable version references first
            html = re.sub(r'(href|src)="/docs/stable/', rf'\1="{TARGET_VERSION}/', html)
            html = re.sub(r'(href|src)="docs/stable/', rf'\1="{TARGET_VERSION}/', html)
            
            # Remove /docs/ prefix while preserving version
            # This regex specifically handles /docs/vXX.X/ patterns
            html = re.sub(r'(href|src)="/docs/(v\d+\.\d+/[^"]+)"', r'\1="\2"', html)
            html = re.sub(r'(href|src)="docs/(v\d+\.\d+/[^"]+)"', r'\1="\2"', html)
            
            # For non-versioned docs paths
            html = re.sub(r'(href|src)="/docs/([^v][^"]+)"', r'\1="\2"', html)
            html = re.sub(r'(href|src)="docs/([^v][^"]+)"', r'\1="\2"', html)
            
            # Remove any remaining leading slashes from local paths
            # Skip URLs that start with // (protocol-relative)
            html = re.sub(r'(href|src)="/(?!/)([^"]+)"', r'\1="\2"', html)
            
            # Fix asset paths - this is critical for CSS
            for asset in ["css", "js", "images", "_internal"]:
                html = re.sub(
                    rf"(src|href)=[\"']/{asset}/([^\"']+)[\"']",
                    rf'\1="{asset}/\2"',
                    html,
                )
            
            # Fix img paths
            html = re.sub(
                r"(src|href)=[\"']/?img/([^\"']+)[\"']",
                r'\1="img/\2"',
                html,
            )
            
            # Fix docs/images paths
            html = re.sub(
                r"(src|href|xlink:href)=[\"']/?docs/images/([^\"']+)[\"']",
                r'\1="images/\2"',
                html,
            )
            
            # Replace Google Fonts
            html = re.sub(
                r"<link[^>]+fonts\.googleapis\.com[^>]+>",
                '<link rel="stylesheet" href="css/google-fonts.css">',
                html,
            )
            
            # Fix CSS imports
            html = re.sub(
                r"@import\s+url\((['\"]?)/docs/(css/[^)]+)\1\);",
                r"@import url(\2);",
                html,
            )
            
            # Apply relative prefixes to asset paths
            for asset in ["css", "js", "images", "_internal", "img"]:
                html = re.sub(
                    rf'(src|href)="({asset}/[^"]+)"',
                    rf'\1="{prefix}\2"',
                    html,
                )
            
            # # Fix remaining paths that need prefix
            # # Only add prefix to paths that don't already have it and aren't external
            # html = re.sub(
            #     r'(href|src)="(?!\.\./)(?!https?:)(?!mailto:)(?!#)(?!javascript:)(?!//)([^"]+)"',
            #     rf'\1="{prefix}\2"',
            #     html,
            # )
            
            # Debug: Check if we still have absolute paths
            if len(self.processed_files) < 3:  # Only for first few files
                import re as regex
                abs_paths = regex.findall(r'href="/(v19\.2/[^"]+)"', html)
                if abs_paths:
                    self.log(f"Warning: Found absolute paths in {rel_path}: {abs_paths[:3]}", "WARNING")
            
            # Final cleanup - remove any double slashes or incorrect patterns
            html = html.replace('"//', '"/')  # Fix double slashes
            html = re.sub(r'"\.\./+', '"../', html)  # Fix multiple slashes after ../
            
            # Fix any paths that might have lost their 'v' prefix
            html = re.sub(r'(href|src)="(\.\./)*19\.2/', rf'\1="\2v19.2/', html)
            
            # Ensure v19.2 paths don't have unnecessary prefixes
            html = re.sub(r'(href|src)="(\.\./)+v19\.2/v19\.2/', r'\1="\2v19.2/', html)
            
            # Inject navigation dependencies - CRITICAL FOR STYLING
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

/* Hide online-only elements - comprehensive */
.ask-ai, #ask-ai, [data-ask-ai], .ai-widget, .kapa-widget,
[class*="kapa"], [id*="kapa"], [class*="ask-ai"], [id*="ask-ai"],
.version-switcher, #version-switcher, .feedback-widget,
button[aria-label*="AI"], div[data-kapa-widget],
.kapa-ai-button, .ai-assistant, .ai-chat {{
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
    position: absolute !important;
    left: -9999px !important;
}}

/* Hide floating action buttons */
.floating-action-button, .fab, [class*="floating-button"],
button[style*="fixed"], button[style*="absolute"] {{
    display: none !important;
}}

/* Hide any fixed position elements in bottom right (common for chat widgets) */
[style*="position: fixed"][style*="bottom"][style*="right"],
[style*="position:fixed"][style*="bottom"][style*="right"] {{
    display: none !important;
}}

/* Hide iframes that might be chat widgets */
iframe[src*="kapa"], iframe[id*="kapa"], iframe[class*="chat"] {{
    display: none !important;
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
    // Aggressively remove Ask AI widget and other online-only elements
    $('.ask-ai, #ask-ai, [data-ask-ai], .ai-widget, .kapa-widget').remove();
    $('[class*="kapa"], [id*="kapa"], [class*="ask-ai"], [id*="ask-ai"]').remove();
    $('.version-switcher, #version-switcher, .feedback-widget').remove();
    $('button[aria-label*="AI"], div[data-kapa-widget]').remove();
    $('.floating-action-button, .fab, [class*="floating-button"]').remove();
    
    // Remove any floating buttons
    $('button').each(function() {
        var style = $(this).attr('style');
        if (style && (style.includes('fixed') || style.includes('absolute'))) {
            $(this).remove();
        }
    });
    
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

// Double-check removal after page fully loads
window.addEventListener('load', function() {
    setTimeout(function() {
        document.querySelectorAll('.ask-ai, #ask-ai, [data-ask-ai], .kapa-widget, [class*="kapa"], [id*="kapa"]').forEach(function(el) {
            el.remove();
        });
    }, 100);
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
            # Get CSS
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            css_response = requests.get(FONTS_CSS_URL, headers=headers, timeout=10)
            css_response.raise_for_status()
            css_content = css_response.text
            
            # Extract and download font files
            font_urls = set(re.findall(r"url\((https://fonts\.gstatic\.com/[^\)]+)\)", css_content))
            
            for url in font_urls:
                try:
                    # Download font
                    font_response = requests.get(url, headers=headers, timeout=10)
                    font_response.raise_for_status()
                    
                    # Save font
                    parsed = urlparse(url)
                    font_path = parsed.path.lstrip("/")
                    dst = fonts_dir / font_path
                    dst.parent.mkdir(parents=True, exist_ok=True)
                    dst.write_bytes(font_response.content)
                    
                    # Update CSS
                    css_content = css_content.replace(url, f"../fonts/{font_path}")
                    
                except Exception as e:
                    self.log(f"Failed to download font from {url}: {e}", "WARNING")
            
            # Save localized CSS
            (OUTPUT_ROOT / "css" / "google-fonts.css").write_text(css_content, encoding="utf-8")
            self.log("Google Fonts localized", "SUCCESS")
            
        except Exception as e:
            self.log(f"Error downloading fonts: {e}", "ERROR")
            # Create fallback
            fallback = """/* Fallback fonts */
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
code, pre { font-family: Consolas, Monaco, "Courier New", monospace; }"""
            (OUTPUT_ROOT / "css" / "google-fonts.css").write_text(fallback)
    
    def create_link_test_page(self):
        """Create a test page to verify link processing"""
        test_html = f"""<!DOCTYPE html>
<html>
<head>
    <title>Link Test Page</title>
    <style>
        body {{ font-family: monospace; padding: 20px; }}
        .test {{ margin: 10px 0; padding: 10px; background: #f0f0f0; }}
        .original {{ color: #666; }}
        .processed {{ color: #00a; font-weight: bold; }}
        .context {{ color: #080; font-style: italic; }}
    </style>
</head>
<body>
    <h1>Link Processing Test Results</h1>
    <p>This page shows how different link patterns were processed:</p>
    
    <h2>From pages NOT in version directory:</h2>
    <div class="test">
        <div class="context">Context: Page at /index.html</div>
        <div class="original">Original: /docs/insert.html</div>
        <div class="processed">Should be: v19.2/insert.html</div>
        <a href="v19.2/insert.html">Test Link</a>
    </div>
    
    <div class="test">
        <div class="context">Context: Page at /index.html</div>
        <div class="original">Original: /docs/v19.2/secure-a-cluster.html</div>
        <div class="processed">Should be: v19.2/secure-a-cluster.html</div>
        <a href="v19.2/secure-a-cluster.html">Test Link</a>
    </div>
    
    <h2>From pages IN version directory:</h2>
    <div class="test">
        <div class="context">Context: Page at /v19.2/index.html</div>
        <div class="original">Original: /docs/secure-a-cluster.html</div>
        <div class="processed">Should be: secure-a-cluster.html (same dir)</div>
        <p>This link would be at: v19.2/secure-a-cluster.html</p>
    </div>
    
    <div class="test">
        <div class="context">Context: Page at /v19.2/index.html</div>
        <div class="original">Original: /docs/v19.2/secure-a-cluster.html</div>
        <div class="processed">Should be: secure-a-cluster.html (same dir)</div>
        <p>This link would be at: v19.2/secure-a-cluster.html</p>
    </div>
    
    <h2>Special cases:</h2>
    <div class="test">
        <div class="original">Original: /docs/stable/something.html</div>
        <div class="processed">Should be: v19.2/something.html</div>
        <a href="v19.2/something.html">Test Link</a>
    </div>
    
    <div class="test">
        <div class="original">Original: /docs/cockroachcloud/quickstart.html</div>
        <div class="processed">Should be: cockroachcloud/quickstart.html</div>
        <a href="cockroachcloud/quickstart.html">Test Link</a>
    </div>
    
    <div class="test">
        <div class="original">Original: /docs/releases/index.html</div>
        <div class="processed">Should be: releases/index.html</div>
        <a href="releases/index.html">Test Link</a>
    </div>
    
    <p><strong>Note:</strong> Click each link to verify it works correctly.</p>
</body>
</html>"""
        
        test_path = OUTPUT_ROOT / "_link_test.html"
        test_path.write_text(test_html)
        self.log("Created link test page: _link_test.html", "SUCCESS")
    
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
        /* Hide online-only elements - comprehensive */
        .ask-ai, #ask-ai, [data-ask-ai], .ai-widget, .kapa-widget,
        [class*="kapa"], [id*="kapa"], [class*="ask-ai"], [id*="ask-ai"],
        .floating-action-button, .fab, [class*="floating-button"],
        button[aria-label*="AI"], div[data-kapa-widget] {{
            display: none !important;
            visibility: hidden !important;
            position: absolute !important;
            left: -9999px !important;
        }}
        
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
    
    <script>
        // Remove any Ask AI elements that might load
        document.addEventListener('DOMContentLoaded', function() {{
            var selectors = ['.ask-ai', '#ask-ai', '[data-ask-ai]', '.kapa-widget', 
                           '[class*="kapa"]', '[id*="kapa"]', '.floating-action-button'];
            selectors.forEach(function(selector) {{
                document.querySelectorAll(selector).forEach(function(el) {{
                    el.remove();
                }});
            }});
        }});
    </script>
</body>
</html>"""
        
        (OUTPUT_ROOT / "index.html").write_text(index_html)
        self.log("Created index.html", "SUCCESS")
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
        /* Hide online-only elements - comprehensive */
        .ask-ai, #ask-ai, [data-ask-ai], .ai-widget, .kapa-widget,
        [class*="kapa"], [id*="kapa"], [class*="ask-ai"], [id*="ask-ai"],
        .floating-action-button, .fab, [class*="floating-button"],
        button[aria-label*="AI"], div[data-kapa-widget] {{
            display: none !important;
            visibility: hidden !important;
            position: absolute !important;
            left: -9999px !important;
        }}
        
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
    
    <script>
        // Remove any Ask AI elements that might load
        document.addEventListener('DOMContentLoaded', function() {{
            var selectors = ['.ask-ai', '#ask-ai', '[data-ask-ai]', '.kapa-widget', 
                           '[class*="kapa"]', '[id*="kapa"]', '.floating-action-button'];
            selectors.forEach(function(selector) {{
                document.querySelectorAll(selector).forEach(function(el) {{
                    el.remove();
                }});
            }});
        }});
    </script>
</body>
</html>"""
        
        (OUTPUT_ROOT / "index.html").write_text(index_html)
        self.log("Created index.html", "SUCCESS")
    
    def build(self):
        """Main build process following Code 2's structure"""
        print("\n" + "="*60)
        print("🚀 COCKROACHDB OFFLINE DOCUMENTATION ARCHIVER")
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
        
        # CRITICAL: Copy global assets FIRST (from SITE_ROOT, not DOCS_ROOT)
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
        self.log("ARCHIVE COMPLETE!", "SUCCESS")
        self.log(f"Output directory: {OUTPUT_ROOT.resolve()}")
        self.log(f"Total files: {len(self.processed_files)}")
        self.log("✅ Ask AI widget removed", "SUCCESS")
        self.log("✅ All links converted to relative paths", "SUCCESS")
        self.log("✅ Version directory (v19.2) added where needed", "SUCCESS")
        
        print(f"\n🎉 Offline site built in {OUTPUT_ROOT}")
        print(f"\n📦 To test: open file://{OUTPUT_ROOT.resolve()}/index.html")
        print(f"\n📌 Note: Check console output above for link transformation details")
        
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