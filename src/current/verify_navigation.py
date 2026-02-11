#!/usr/bin/env python3
"""
Verification script to check that all sidebar navigation links work correctly
and don't produce 404 errors in the offline archive.
"""
import os
import re
import json
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from collections import defaultdict

OFFLINE_SNAP = Path("/Users/eeshan/Desktop/docs/src/current/offline_snap")

class NavigationVerifier:
    def __init__(self):
        self.total_pages = 0
        self.total_links = 0
        self.broken_links = defaultdict(list)  # page -> list of broken links
        self.working_links = 0
        self.external_links = 0
        self.anchor_links = 0
        self.tested_combinations = set()  # Track (from_page, to_url) to avoid duplicates
        
    def log(self, message, level="INFO"):
        """Simple logging with emoji indicators"""
        prefix = {
            "INFO": "ℹ️",
            "SUCCESS": "✅",
            "WARNING": "⚠️",
            "ERROR": "❌",
            "DEBUG": "🔍"
        }.get(level, "")
        print(f"{prefix} {message}")
    
    def extract_sidebar_urls(self, html_content, page_path):
        """Extract all URLs from the sidebar JavaScript in the page"""
        urls = []
        
        # Find the sidebar JavaScript object
        sidebar_match = re.search(r'const sidebar = \{[\s\S]*?\};', html_content, re.DOTALL)
        if not sidebar_match:
            return urls
        
        sidebar_js = sidebar_match.group(0)
        
        # Extract all URLs from the items array
        # Look for patterns like "urls": ["url1", "url2"] or urls: ['url1', 'url2']
        url_patterns = [
            r'"urls"\s*:\s*\[(.*?)\]',
            r'urls\s*:\s*\[(.*?)\]'
        ]
        
        for pattern in url_patterns:
            matches = re.finditer(pattern, sidebar_js, re.DOTALL)
            for match in matches:
                urls_string = match.group(1)
                # Extract individual URLs from the array
                url_matches = re.findall(r'["\']([^"\']+)["\']', urls_string)
                urls.extend(url_matches)
        
        # Also try to parse the sidebar as JSON if possible
        try:
            # Extract just the items array
            items_match = re.search(r'items\s*:\s*(\[[\s\S]*?\])\s*(?:,|\})', sidebar_js, re.DOTALL)
            if items_match:
                items_str = items_match.group(1)
                # Convert JS to JSON (basic conversion)
                items_str = re.sub(r'(\w+):', r'"\1":', items_str)  # Quote property names
                items_str = re.sub(r"'", '"', items_str)  # Convert single quotes to double
                items_str = re.sub(r',\s*\]', ']', items_str)  # Remove trailing commas
                items_str = re.sub(r',\s*\}', '}', items_str)  # Remove trailing commas
                
                try:
                    items = json.loads(items_str)
                    urls.extend(self.extract_urls_from_items(items))
                except:
                    pass  # JSON parsing failed, rely on regex extraction
        except:
            pass
        
        # Also extract from rendered HTML sidebar if present
        soup = BeautifulSoup(html_content, 'html.parser')
        sidebar_elem = soup.find(id='sidebar') or soup.find(id='sidebarMenu')
        if sidebar_elem:
            for link in sidebar_elem.find_all('a', href=True):
                href = link.get('href')
                if href and not href.startswith(('#', 'javascript:', 'mailto:')):
                    urls.append(href)
        
        return list(set(urls))  # Remove duplicates
    
    def extract_urls_from_items(self, items):
        """Recursively extract URLs from sidebar items structure"""
        urls = []
        
        if isinstance(items, list):
            for item in items:
                if isinstance(item, dict):
                    if 'urls' in item:
                        urls.extend(item['urls'])
                    if 'items' in item:
                        urls.extend(self.extract_urls_from_items(item['items']))
        elif isinstance(items, dict):
            if 'urls' in items:
                urls.extend(items['urls'])
            if 'items' in items:
                urls.extend(self.extract_urls_from_items(items['items']))
        
        return urls
    
    def resolve_url(self, base_path, url):
        """Resolve a URL relative to a base path, simulating browser behavior"""
        # Skip external, anchor, and special URLs
        if not url or url.startswith(('http://', 'https://', '#', 'mailto:', 'javascript:')):
            return None
        
        # Get the directory of the current page
        base_dir = base_path.parent
        
        # Remove any /docs/ prefix
        if url.startswith('/docs/'):
            url = url[6:]
        elif url.startswith('docs/'):
            url = url[5:]
        
        # Handle stable -> v19.2
        url = url.replace('/stable/', '/v19.2/')
        url = url.replace('stable/', 'v19.2/')
        if url == 'stable':
            url = 'v19.2'
        
        # Handle absolute paths (start with /)
        if url.startswith('/'):
            # Absolute path from offline_snap root
            resolved = OFFLINE_SNAP / url.lstrip('/')
        else:
            # Relative path from current page's directory
            resolved = base_dir / url
        
        # Normalize the path
        try:
            resolved = resolved.resolve()
        except:
            pass
        
        # Add .html if needed
        if resolved.exists():
            return resolved
        elif resolved.with_suffix('.html').exists():
            return resolved.with_suffix('.html')
        elif (resolved / 'index.html').exists():
            return resolved / 'index.html'
        
        return resolved  # Return even if it doesn't exist, for error reporting
    
    def check_page(self, page_path):
        """Check all sidebar links on a single page"""
        try:
            # Read the page content
            content = page_path.read_text(encoding='utf-8')
            
            # Extract sidebar URLs
            urls = self.extract_sidebar_urls(content, page_path)
            
            if not urls:
                return  # No sidebar URLs found
            
            rel_path = page_path.relative_to(OFFLINE_SNAP)
            
            for url in urls:
                # Skip if we've already tested this combination
                test_key = (str(rel_path), url)
                if test_key in self.tested_combinations:
                    continue
                self.tested_combinations.add(test_key)
                
                self.total_links += 1
                
                # Check if it's external or special
                if url.startswith(('http://', 'https://')):
                    self.external_links += 1
                    continue
                elif url.startswith('#'):
                    self.anchor_links += 1
                    continue
                elif url.startswith(('mailto:', 'javascript:')):
                    continue
                
                # Resolve the URL
                resolved_path = self.resolve_url(page_path, url)
                
                if resolved_path and resolved_path.exists():
                    self.working_links += 1
                else:
                    # Record the broken link
                    self.broken_links[str(rel_path)].append({
                        'url': url,
                        'resolved': str(resolved_path) if resolved_path else 'Could not resolve',
                        'expected_file': str(resolved_path.relative_to(OFFLINE_SNAP)) if resolved_path and OFFLINE_SNAP in resolved_path.parents else str(resolved_path)
                    })
                    
        except Exception as e:
            self.log(f"Error checking {page_path}: {e}", "ERROR")
    
    def print_report(self):
        """Print a detailed report of the verification results"""
        print("\n" + "="*70)
        print("📊 NAVIGATION VERIFICATION REPORT")
        print("="*70)
        
        print(f"\n📄 Pages scanned: {self.total_pages}")
        print(f"🔗 Total links checked: {self.total_links}")
        print(f"✅ Working links: {self.working_links}")
        print(f"🌐 External links (skipped): {self.external_links}")
        print(f"#️⃣ Anchor links (skipped): {self.anchor_links}")
        print(f"❌ Broken links: {sum(len(links) for links in self.broken_links.values())}")
        
        if self.broken_links:
            print("\n" + "="*70)
            print("❌ BROKEN LINKS DETAILS")
            print("="*70)
            
            # Group broken links by pattern
            patterns = defaultdict(list)
            for page, links in self.broken_links.items():
                for link_info in links:
                    # Identify the pattern
                    url = link_info['url']
                    if 'cockroachcloud' in page and 'v19.2' in link_info['expected_file']:
                        pattern = "cockroachcloud → v19.2"
                    elif 'v19.2' in page and 'cockroachcloud' in link_info['expected_file']:
                        pattern = "v19.2 → cockroachcloud"
                    elif 'releases' in page:
                        pattern = "releases → other"
                    elif 'advisories' in page:
                        pattern = "advisories → other"
                    else:
                        pattern = "other"
                    
                    patterns[pattern].append({
                        'page': page,
                        'url': url,
                        'expected': link_info['expected_file']
                    })
            
            # Print by pattern
            for pattern, links in patterns.items():
                print(f"\n🔍 Pattern: {pattern}")
                print(f"   Found {len(links)} broken links")
                
                # Show first few examples
                for i, link in enumerate(links[:3]):
                    print(f"\n   Example {i+1}:")
                    print(f"   From page: {link['page']}")
                    print(f"   Tried URL: {link['url']}")
                    print(f"   Expected file: {link['expected']}")
                
                if len(links) > 3:
                    print(f"   ... and {len(links) - 3} more")
        
        print("\n" + "="*70)
        
        if not self.broken_links:
            print("🎉 SUCCESS! All navigation links are working correctly!")
        else:
            print(f"⚠️  Found {sum(len(links) for links in self.broken_links.values())} broken links that need fixing.")
            print("\n💡 Common issues:")
            print("   1. Cross-directory navigation (cockroachcloud ↔ v19.2)")
            print("   2. Missing .html extensions")
            print("   3. Incorrect relative path calculations")
            
            # Suggest fixes
            print("\n🔧 Suggested fixes:")
            print("   1. Run: python3 fix_navigation_quick.py")
            print("   2. Run: python3 fix_navigation_subdirectory.py")
            print("   3. If issues persist, regenerate with: python3 snapshot_relative.py")
    
    def verify(self):
        """Main verification process"""
        if not OFFLINE_SNAP.exists():
            self.log(f"Offline snap directory not found: {OFFLINE_SNAP}", "ERROR")
            return False
        
        print("🚀 Starting navigation verification...")
        print(f"📁 Checking offline archive at: {OFFLINE_SNAP}")
        
        # Find all HTML files
        html_files = list(OFFLINE_SNAP.rglob("*.html"))
        self.total_pages = len(html_files)
        
        print(f"📄 Found {self.total_pages} HTML files to check")
        
        # Check each page
        for i, html_file in enumerate(html_files, 1):
            if i % 10 == 0:
                print(f"   Progress: {i}/{self.total_pages} pages checked...")
            
            self.check_page(html_file)
        
        # Print the report
        self.print_report()
        
        return len(self.broken_links) == 0

def main():
    """Run the navigation verification"""
    verifier = NavigationVerifier()
    success = verifier.verify()
    
    if success:
        exit(0)
    else:
        exit(1)

if __name__ == "__main__":
    main()