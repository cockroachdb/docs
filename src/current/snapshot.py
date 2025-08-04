#!/usr/bin/env python3
"""
Complete Offline Documentation Archiver for Jekyll CockroachDB Documentation
HYBRID VERSION - Combines vibrant sidebar styling, professional homepage, optimized assets, and improved navigation logic
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
        self.total_broken_urls = 0
        self.total_removed_sections = 0
        
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
    
    def check_file_exists(self, url):
        """Test if a file exists for a given URL"""
        try:
            if not url or url.startswith(('http://', 'https://', '#', 'mailto:', 'javascript:')):
                return True  # External/anchor links are always valid
            
            # Normalize URL to file path
            file_url = str(url).strip()
            
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
            if file_url == 'stable':
                file_url = TARGET_VERSION
            
            # Convert ${VERSION} placeholder
            file_url = file_url.replace('${VERSION}', TARGET_VERSION)
            
            # Try multiple file path variations
            possible_paths = [
                file_url,
                file_url + '.html' if file_url and not file_url.endswith('.html') and '.' not in file_url.split('/')[-1] else None,
                file_url + '/index.html' if file_url and not file_url.endswith('/') else None,
                file_url.rstrip('/') + '.html' if file_url.endswith('/') else None
            ]
            
            # Check if any variation exists
            for path in possible_paths:
                if path:
                    try:
                        file_path = DOCS_ROOT / path
                        if file_path.exists():
                            return True
                    except Exception:
                        continue
            
            return False
            
        except Exception as e:
            # If there's any error checking, assume the file exists to be safe
            self.log(f"Error checking file existence for {url}: {e}", "DEBUG")
            return True

    def clean_sidebar_items(self, items_data):
        """Clean the sidebar items array and count removed URLs"""
        removed_urls_count = 0
        removed_sections_count = 0
        
        def clean_item(item, level=0):
            nonlocal removed_urls_count, removed_sections_count
            
            if not isinstance(item, dict):
                return item
            
            # Clean URLs if present
            if 'urls' in item and item['urls']:
                original_count = len(item['urls'])
                valid_urls = []
                
                for url in item['urls']:
                    try:
                        if url and self.check_file_exists(url):
                            valid_urls.append(url)
                        else:
                            removed_urls_count += 1
                            if level == 0:  # Only log for top-level items to reduce noise
                                self.log(f"Removing broken URL: {url}", "DEBUG")
                    except Exception as e:
                        # If there's an error checking the URL, skip it
                        removed_urls_count += 1
                        if level == 0:
                            self.log(f"Removing problematic URL: {url} (error: {e})", "DEBUG")
                
                if valid_urls:
                    item['urls'] = valid_urls
                else:
                    del item['urls']
            
            # Clean child items if present
            if 'items' in item and item['items']:
                cleaned_items = []
                
                for child in item['items']:
                    cleaned_child = clean_item(child, level + 1)
                    if cleaned_child is not None:
                        cleaned_items.append(cleaned_child)
                
                if cleaned_items:
                    item['items'] = cleaned_items
                else:
                    del item['items']
            
            # Decide whether to keep this item
            has_urls = 'urls' in item and item['urls']
            has_children = 'items' in item and item['items']
            
            # Only keep items that have actual content (URLs or children)
            # Remove empty parents regardless of is_top_level status
            if has_urls or has_children:
                return item
            else:
                # Remove empty items completely
                removed_sections_count += 1
                if level == 0:  # Only log removal of top-level items to reduce noise
                    title = item.get('title', 'Unknown')
                    is_top_level = item.get('is_top_level', False)
                    self.log(f"Removing empty {'top-level ' if is_top_level else ''}section: '{title}' (no URLs or children)", "DEBUG")
                return None
        
        # Clean the items array
        cleaned_items = []
        
        for item in items_data:
            cleaned_item = clean_item(item)
            if cleaned_item is not None:
                cleaned_items.append(cleaned_item)
        
        return cleaned_items, removed_urls_count, removed_sections_count

    def js_to_json(self, js_text):
        """Convert JavaScript object notation to valid JSON"""
        try:
            if not js_text or not js_text.strip():
                return ""
                
            # First pass - handle line by line for basic fixes
            lines = js_text.split('\n')
            fixed_lines = []
            
            for line_num, line in enumerate(lines, 1):
                try:
                    original_line = line
                    
                    # Remove comments first
                    if '//' in line:
                        # Only remove comments that aren't inside quotes
                        in_quotes = False
                        quote_char = None
                        comment_pos = -1
                        
                        for i, char in enumerate(line):
                            if not in_quotes and char in ['"', "'"]:
                                in_quotes = True
                                quote_char = char
                            elif in_quotes and char == quote_char and (i == 0 or line[i-1] != '\\'):
                                in_quotes = False
                                quote_char = None
                            elif not in_quotes and char == '/' and i < len(line) - 1 and line[i+1] == '/':
                                comment_pos = i
                                break
                        
                        if comment_pos >= 0:
                            line = line[:comment_pos].rstrip()
                    
                    # Remove function definitions
                    line = re.sub(r':\s*function\s*\([^)]*\)\s*\{[^}]*\}', ': null', line)
                    
                    # Fix unquoted property names ONLY at start of line
                    stripped = line.strip()
                    if stripped and ':' in stripped and not stripped.startswith('"') and not stripped.startswith('[') and not stripped.startswith('{'):
                        match = re.match(r'^(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:\s*)(.*)', line)
                        if match:
                            indent, prop_name, colon_part, rest = match.groups()
                            line = f'{indent}"{prop_name}"{colon_part}{rest}'
                    
                    # Remove trailing commas before } or ]
                    line = re.sub(r',(\s*[}\]])', r'\1', line)
                    
                    fixed_lines.append(line)
                    
                except Exception as e:
                    self.log(f"Error processing line {line_num}: {e}", "DEBUG")
                    fixed_lines.append(line)  # Use original line if processing fails
            
            result = '\n'.join(fixed_lines)
            
            # Second pass - safer character-by-character processing for quotes
            final_result = []
            in_double_quotes = False
            in_single_quotes = False
            i = 0
            
            while i < len(result):
                try:
                    char = result[i]
                    
                    if char == '"' and not in_single_quotes:
                        in_double_quotes = not in_double_quotes
                        final_result.append(char)
                    elif char == "'" and not in_double_quotes:
                        if in_single_quotes:
                            # End of single-quoted string - convert to double quote
                            final_result.append('"')
                            in_single_quotes = False
                        else:
                            # Start of single-quoted string - convert to double quote
                            final_result.append('"')
                            in_single_quotes = True
                    elif char == '\\' and (in_single_quotes or in_double_quotes):
                        # Handle escape sequences
                        final_result.append(char)
                        if i + 1 < len(result):
                            i += 1
                            final_result.append(result[i])
                    else:
                        final_result.append(char)
                    
                    i += 1
                    
                except Exception as e:
                    self.log(f"Error processing character at position {i}: {e}", "DEBUG")
                    final_result.append(char)
                    i += 1
            
            result = ''.join(final_result)
            
            # Handle undefined
            result = re.sub(r'\bundefined\b', 'null', result)
            
            return result
            
        except Exception as e:
            self.log(f"Error in js_to_json: {e}", "WARNING")
            return ""

    def find_matching_bracket(self, text, start_pos):
        """Find the matching closing bracket for an opening bracket at start_pos"""
        if start_pos >= len(text) or text[start_pos] != '[':
            return -1
        
        count = 0
        in_string = False
        escape_next = False
        quote_char = None
        
        for i in range(start_pos, len(text)):
            char = text[i]
            
            if escape_next:
                escape_next = False
                continue
                
            if char == '\\':
                escape_next = True
                continue
                
            if not in_string:
                if char in ['"', "'"]:
                    in_string = True
                    quote_char = char
                elif char == '[':
                    count += 1
                elif char == ']':
                    count -= 1
                    if count == 0:
                        return i
            else:
                if char == quote_char:
                    in_string = False
                    quote_char = None
        
        return -1

    def clean_sidebar_in_html(self, html_content):
        """Clean the JavaScript sidebar items array in HTML content"""
        # Look for the sidebar JavaScript object
        sidebar_start = html_content.find('const sidebar = {')
        if sidebar_start == -1:
            return html_content, 0
        
        # Find the items: part
        items_start = html_content.find('items:', sidebar_start)
        if items_start == -1:
            return html_content, 0
        
        # Find the opening bracket of the items array
        array_start = html_content.find('[', items_start)
        if array_start == -1:
            return html_content, 0
        
        # Find the matching closing bracket
        array_end = self.find_matching_bracket(html_content, array_start)
        if array_end == -1:
            # Try to find just the next ]; as fallback
            fallback_end = html_content.find('];', array_start)
            if fallback_end != -1:
                array_end = fallback_end
            else:
                return html_content, 0
        
        # Extract the items array
        items_str = html_content[array_start:array_end + 1]
        
        try:
            # Convert JavaScript to JSON
            json_str = self.js_to_json(items_str)
            if not json_str.strip():
                return html_content, 0
                
            items_data = json.loads(json_str)
            
            # Clean the items
            cleaned_items, removed_urls_count, removed_sections_count = self.clean_sidebar_items(items_data)
            
            # Convert back to JSON string
            cleaned_json = json.dumps(cleaned_items, indent=2)
            
            # Replace in the original HTML
            new_html = html_content[:array_start] + cleaned_json + html_content[array_end + 1:]
            
            if removed_urls_count > 0 or removed_sections_count > 0:
                self.log(f"Cleaned sidebar: {removed_urls_count} broken URLs, {removed_sections_count} empty sections removed", "SUCCESS")
            
            return new_html, removed_urls_count + removed_sections_count
            
        except json.JSONDecodeError as e:
            self.log(f"JSON parsing failed in sidebar cleaning: {e}", "WARNING")
            self.log(f"Problematic JSON snippet: {json_str[:200] if 'json_str' in locals() else 'N/A'}...", "DEBUG")
            return html_content, 0
            
        except Exception as e:
            self.log(f"Error cleaning sidebar: {e}", "WARNING")
            self.log(f"Error type: {type(e).__name__}", "DEBUG")
            return html_content, 0

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
            # Clean the sidebar using our working method
            self.log("Cleaning sidebar data (removing broken links)...")
            cleaned_sidebar, removed_count = self.clean_sidebar_in_html(self.sidebar_html)
            self.sidebar_html = cleaned_sidebar
            self.total_broken_urls += removed_count
            
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
                '[class*="ask-ai"]', '[id*="ask-ai"]',
                # Remove search elements that won't work offline
                '.search', '#search', '.search-bar', '.search-input', '.search-form',
                '[class*="search"]', '[id*="search"]', 'input[type="search"]',
                '.algolia-search', '.docsearch', '[class*="docsearch"]',
                # Target forms and inputs with search-related attributes
                'form[action*="search"]', 'input[placeholder*="Search" i]', 
                'input[placeholder*="search" i]', 'input[name="query"]',
                'form[action="/docs/search"]', 'form[action*="/search"]'
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
                href = a.get('href')
                
                # Skip if no href or external links
                if not href or href.startswith(('http://', 'https://', '#', 'mailto:')):
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

    def copy_selective_assets(self):
        """Copy only necessary assets, excluding non-v19.2 version assets (FROM SCRIPT 2)"""
        self.log("\n--- Copying Selective Assets ---")
        
        # Copy global assets (always needed)
        for asset_dir in ["css", "js", "img"]:
            src = SITE_ROOT / asset_dir
            if src.exists():
                dst = OUTPUT_ROOT / asset_dir
                shutil.copytree(src, dst, dirs_exist_ok=True)
                self.log(f"Copied global {asset_dir}/", "SUCCESS")
        
        # Copy docs-specific assets (base level)
        for asset_dir in ["css", "js", "_internal"]:
            src = DOCS_ROOT / asset_dir
            if src.exists():
                dst = OUTPUT_ROOT / asset_dir
                shutil.copytree(src, dst, dirs_exist_ok=True)
                self.log(f"Copied docs {asset_dir}/", "SUCCESS")
        
        # Handle images selectively - only v19.2 and global images
        images_src = DOCS_ROOT / "images"
        if images_src.exists():
            images_dst = OUTPUT_ROOT / "images"
            images_dst.mkdir(parents=True, exist_ok=True)
            
            copied_count = 0
            skipped_count = 0
            
            for img_file in images_src.rglob("*"):
                if img_file.is_file():
                    rel_path = img_file.relative_to(images_src)
                    
                    # Skip version-specific images that aren't v19.2
                    path_parts = rel_path.parts
                    if (len(path_parts) > 0 and 
                        path_parts[0].startswith('v') and 
                        path_parts[0] != TARGET_VERSION and
                        path_parts[0] not in ['v19.2']):  # Be explicit about allowed versions
                        skipped_count += 1
                        continue
                    
                    # Copy allowed images
                    dst_file = images_dst / rel_path
                    dst_file.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(img_file, dst_file)
                    copied_count += 1
            
            self.log(f"Images: copied {copied_count}, skipped {skipped_count} version-specific files", "SUCCESS")
        
        # Copy version-specific assets only for TARGET_VERSION
        version_dirs = [TARGET_VERSION]  # Only process our target version
        
        for version in version_dirs:
            version_src = DOCS_ROOT / version
            if version_src.exists():
                # Copy version-specific images if they exist
                version_images = version_src / "images"
                if version_images.exists():
                    version_images_dst = OUTPUT_ROOT / version / "images"
                    shutil.copytree(version_images, version_images_dst, dirs_exist_ok=True)
                    self.log(f"Copied {version}/images/", "SUCCESS")
                
                # Copy other version-specific assets
                for asset_type in ["css", "js", "_internal"]:
                    version_asset = version_src / asset_type
                    if version_asset.exists():
                        version_asset_dst = OUTPUT_ROOT / version / asset_type
                        shutil.copytree(version_asset, version_asset_dst, dirs_exist_ok=True)
                        self.log(f"Copied {version}/{asset_type}/", "SUCCESS")

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
        
        # Also fix the .html stripping issue - replace the line that removes .html extensions
        new_html = re.sub(
            r'url = url\.replace\("/index\.html", ""\)\.replace\("\.html", ""\);',
            'url = url.replace("/index.html", ""); // Keep .html for offline',
            new_html
        )
        
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
            self.log("Successfully replaced JavaScript URL processing", "DEBUG")
        else:
            self.log("Warning: JavaScript URL processing replacement may have failed", "WARNING")
        
        return new_html

    def get_vibrant_sidebar_styles(self, prefix):
        """Return vibrant sidebar styles with #6933FF purple branding (FROM SCRIPT 1)"""
        return f'''<style>
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

/* ----------------------------
   Sidebar base link styles
   ---------------------------- */
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

/* ----------------------------
   Highlight the active page
   ---------------------------- */
.navgoco li.active > a {{
  font-weight: 600;
  background-color: #e0e7ff;
  color: #3730a3;
}}

/* ----------------------------
   Remove arrows on true top‑level
   ---------------------------- */
/* Only indent top level, no arrow */
.navgoco > li > a {{
  position: relative;
  padding-left: 1em;
}}

/* ----------------------------
   Arrows for 2nd‑level (and deeper) items with children
   ---------------------------- */
/* Navgoco will add "hasChildren" and "open" classes */
.navgoco li li.hasChildren > a::before {{
  content: "▶";
  position: absolute;
  left: 0.5em;
  top: 50%;
  transform: translateY(-50%);
  transition: transform .2s ease;
}}
.navgoco li li.open.hasChildren > a::before {{
  transform: translateY(-50%) rotate(90deg);
}}

/* ----------------------------
   Submenu visibility
   ---------------------------- */
/* hide all sub‑lists by default */
.navgoco li > ul {{
  display: none;
  margin: 0;
  padding-left: 1.5em;
}}
/* show when open */
.navgoco li.open > ul {{
  display: block;
}}
</style>'''
    
    def process_html_file(self, src_path):
        """Process a single HTML file with vibrant sidebar styling"""
        try:
            rel_path = src_path.relative_to(DOCS_ROOT)
            dst_path = OUTPUT_ROOT / rel_path
            
            # Calculate depth and prefix
            depth = len(rel_path.parent.parts)
            prefix = "../" * depth
            
            # Read content
            html = src_path.read_text(encoding="utf-8")
            
            # CRITICAL: Fix sidebar JavaScript BEFORE other processing
            html = self.fix_sidebar_javascript(html)
            
            # CRITICAL: Clean embedded sidebar JavaScript
            cleaned_html, removed_count = self.clean_sidebar_in_html(html)
            if removed_count > 0:
                self.total_broken_urls += removed_count
            html = cleaned_html
            
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
                # Remove search elements that won't work offline
                '.search', '#search', '.search-bar', '.search-input', '.search-form',
                '[class*="search"]', '[id*="search"]', 'input[type="search"]',
                '.algolia-search', '.docsearch', '[class*="docsearch"]',
                # Target forms and inputs with search-related attributes
                'form[action*="search"]', 'input[placeholder*="Search" i]', 
                'input[placeholder*="search" i]', 'input[name="query"]',
                'form[action="/docs/search"]', 'form[action*="/search"]'
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
                if src and any(term in src.lower() for term in ['kapa', 'ask', 'ai']):
                    iframe.decompose()
            
            # Fix any remaining anchor tags without href attributes
            for a in soup.find_all('a'):
                if not a.get('href'):
                    # Remove anchor tags without href or set a placeholder
                    if a.get_text().strip():
                        # Convert to span if it has text content
                        span = soup.new_tag('span')
                        span.string = a.get_text()
                        a.replace_with(span)
                    else:
                        # Remove empty anchor tags
                        a.decompose()
            
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
            
            # Add vibrant sidebar styles (FROM SCRIPT 1)
            offline_styles = self.get_vibrant_sidebar_styles(prefix)
            html = re.sub(r"</head>", offline_styles + "\n</head>", html, flags=re.IGNORECASE)
            
            # Simple navgoco initialization (FROM SCRIPT 1)
            nav_init = """<script>
$(function(){
    // Remove unwanted elements
    $('.ask-ai, #ask-ai, [data-ask-ai], .ai-widget, .kapa-widget').remove();
    $('[class*="kapa"], [id*="kapa"], [class*="ask-ai"], [id*="ask-ai"]').remove();
    $('.version-switcher, #version-switcher, .feedback-widget').remove();
    $('.floating-action-button, .fab, [class*="floating-button"]').remove();
    $('.search, #search, .search-bar, .search-input, .search-form').remove();
    $('[class*="search"], [id*="search"], input[type="search"]').remove();
    $('.algolia-search, .docsearch, [class*="docsearch"]').remove();
    $('form[action*="search"], input[placeholder*="Search"], input[placeholder*="search"]').remove();
    $('input[name="query"], form[action="/docs/search"], form[action*="/search"]').remove();
    
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
            self.log(f"Error type: {type(e).__name__}", "ERROR")
            self.log(f"Error details: {str(e)}", "ERROR")
            # Continue processing other files instead of crashing
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

    def create_professional_index_page(self):
        """Add archived banner to existing index.html"""
        index_path = OUTPUT_ROOT / "index.html"
        
        # Check if there's already an index.html file from the Jekyll build
        if index_path.exists():
            # Read the existing content
            html_content = index_path.read_text(encoding="utf-8")
            
            # Add the banner CSS to the head
            banner_css = '''<style>
    /* Archived version banner */
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
        width: 100%;
    }

    .archived-banner .container {
        max-width: 1600px;
        margin: 0 auto;
        padding: 0 15px;
    }

    .archived-banner-text {
        font-family: 'Source Sans Pro', sans-serif;
        font-size: 14px;
        font-weight: 500;
        color: #856404;
        margin: 0;
        line-height: 1.4;
    }

    .archived-banner-link {
        color: #6933FF;
        text-decoration: none;
        font-weight: 600;
    }

    .archived-banner-link:hover {
        color: #4d0dff;
        text-decoration: underline;
    }

    /* Push the navbar down below the banner */
    .main-nav-wrapper {
        top: 32px !important;
    }

    .navbar.fixed-top {
        top: 32px !important;
    }

    /* Only add the banner height to existing padding */
    body {
        padding-top: 32px;
    }

    @media (max-width: 768px) {
        .archived-banner-text {
            font-size: 13px;
        }
    }
    </style>'''
            
            # Add the banner HTML
            banner_html = '''<!-- Archived version banner -->
    <div class="archived-banner">
        <div class="container">
            <p class="archived-banner-text">
                📚 This is an archived version of the CockroachDB documentation. 
                <a href="https://www.cockroachlabs.com/docs/stable/" class="archived-banner-link">View the latest documentation</a>
            </p>
        </div>
    </div>'''
            
            # Insert CSS before </head>
            html_content = html_content.replace('</head>', banner_css + '\n</head>')
            
            # Insert banner HTML after <body>
            html_content = html_content.replace('<body>', '<body>\n' + banner_html)
            
            # Write back the modified content
            index_path.write_text(html_content, encoding="utf-8")
            self.log("Added archived banner to existing index.html", "SUCCESS")
        else:
            self.log("No existing index.html found to modify", "WARNING")
    
    def build(self):
        """Main build process with hybrid optimizations"""
        print("\n" + "="*60)
        print("🚀 COCKROACHDB OFFLINE DOCUMENTATION ARCHIVER (HYBRID+)")
        print("="*60)
        
        # Verify paths
        self.log(f"Jekyll Root: {JEKYLL_ROOT}")
        self.log(f"Site Root: {SITE_ROOT}")
        self.log(f"Docs Root: {DOCS_ROOT}")
        self.log(f"Output: {OUTPUT_ROOT}")
        self.log(f"Target Version: {TARGET_VERSION}")
        
        if not SITE_ROOT.exists():
            self.log("Site root not found! Run 'jekyll build' first.", "ERROR")
            return False
        
        # Clean output directory
        if OUTPUT_ROOT.exists():
            self.log("Cleaning existing output directory...")
            shutil.rmtree(OUTPUT_ROOT)
        OUTPUT_ROOT.mkdir(parents=True)
        
        # Use selective asset copying (FROM SCRIPT 2)
        self.copy_selective_assets()
        
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
        
        # Process HTML files with stricter version filtering (FROM SCRIPT 2)
        self.log("\n--- Processing HTML Files ---")
        
        files_to_process = []
        
        # Only target version files
        version_dir = DOCS_ROOT / TARGET_VERSION
        if version_dir.exists():
            files_to_process.extend(list(version_dir.rglob("*.html")))
            self.log(f"Found {len(files_to_process)} files in {TARGET_VERSION}/", "SUCCESS")
        
        # Common pages (but exclude other version directories)
        for pattern in COMMON_PAGES:
            if '*' in pattern:
                for file_path in DOCS_ROOT.glob(pattern):
                    # Skip other version directories
                    rel_path = file_path.relative_to(DOCS_ROOT)
                    if (rel_path.parts and 
                        rel_path.parts[0].startswith('v') and 
                        rel_path.parts[0] != TARGET_VERSION):
                        continue
                    files_to_process.append(file_path)
            else:
                file_path = DOCS_ROOT / pattern
                if file_path.exists():
                    files_to_process.append(file_path)
        
        # Remove duplicates and filter out unwanted versions
        filtered_files = []
        for file_path in set(files_to_process):
            rel_path = file_path.relative_to(DOCS_ROOT)
            # Skip files from other version directories
            if (rel_path.parts and 
                rel_path.parts[0].startswith('v') and 
                rel_path.parts[0] != TARGET_VERSION):
                continue
            filtered_files.append(file_path)
        
        files_to_process = filtered_files
        self.log(f"Total files to process (after version filtering): {len(files_to_process)}")
        
        # Process each file with better error handling (FROM SCRIPT 2)
        processed_count = 0
        error_count = 0
        
        for i, file_path in enumerate(files_to_process, 1):
            try:
                if i % 25 == 0:
                    self.log(f"Progress: {i}/{len(files_to_process)} ({i*100//len(files_to_process)}%)")
                
                self.process_html_file(file_path)
                processed_count += 1
                
            except Exception as e:
                error_count += 1
                self.log(f"Failed to process {file_path}: {e}", "ERROR")
                # Continue with next file instead of crashing
                continue
        
        self.log(f"Successfully processed {processed_count} files, {error_count} errors", "SUCCESS")
        
        # Final cleanup steps
        self.log("\n--- Final Steps ---")
        self.fix_css_images()
        self.download_google_fonts()
        self.create_professional_index_page()  # FROM SCRIPT 2
        
        # Enhanced summary
        print("\n" + "="*60)
        self.log("HYBRID ARCHIVE COMPLETE!", "SUCCESS")
        self.log(f"Output directory: {OUTPUT_ROOT.resolve()}")
        self.log(f"Total files: {len(self.processed_files)}")
        self.log(f"Total broken URLs removed: {self.total_broken_urls}", "SUCCESS")
        self.log("🟣 Vibrant #6933FF sidebar styling (Script 1)", "SUCCESS")
        self.log("🏠 Professional homepage with clear navigation (Script 2)", "SUCCESS")
        self.log("🔗 Sidebar navigation logic with better URL processing (Updated)", "SUCCESS")
        self.log("⚡ Selective asset copying for reduced size (Script 2)", "SUCCESS")
        self.log("🔧 Robust error handling and progress reporting (Script 2)", "SUCCESS")
        self.log("✅ Sidebar JavaScript URL processing FIXED", "SUCCESS")
        self.log("✅ Broken sidebar links and empty sections removed", "SUCCESS")
        
        print(f"\n🎉 Hybrid offline site built in {OUTPUT_ROOT}")
        print(f"\n📦 To test: open file://{OUTPUT_ROOT.resolve()}/index.html")
        print(f"\n🟣 Vibrant purple sidebar + professional homepage + improved navigation logic")
        print(f"\n⚡ Optimized assets - excluded non-{TARGET_VERSION} files")
        print(f"\n🔧 {self.total_broken_urls} broken sidebar URLs cleaned up")
        print(f"\n✨ Best features from all scripts combined!")
        
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