#!/usr/bin/env python3
"""
Cross-Version Asset & Link Analysis Report Generator
Finds BOTH href links AND asset references (images, CSS, JS) to other versions.
Excludes navigation/version switcher links.
"""

import os
import re
import csv
from collections import defaultdict
from pathlib import Path
from bs4 import BeautifulSoup

class CrossVersionAssetReporter:
    def __init__(self, site_dir):
        self.site_dir = Path(site_dir)
        self.docs_dir = self.site_dir / "docs"
        self.cross_version_references = []
        self.versions = self._discover_versions()
        
    def _discover_versions(self):
        """Discover all version directories"""
        versions = []
        if self.docs_dir.exists():
            for item in self.docs_dir.iterdir():
                if item.is_dir() and re.match(r'v\d+\.\d+', item.name):
                    versions.append(item.name)
        return sorted(versions)
    
    def _extract_cross_version_references(self, html_file, source_version):
        """Extract cross-version content links AND asset references"""
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f.read(), 'html.parser')
            
            # Remove navigation elements that contain version switchers
            navigation_selectors = [
                'nav', 'header', 'footer',
                '.version-switcher', '.version-dropdown', '.navbar',
                '.topnav', '.sidebar-nav', '#version-switcher',
                '[class*="version"]', '.breadcrumb'
            ]
            
            for selector in navigation_selectors:
                for element in soup.select(selector):
                    element.decompose()
            
            # Focus on main content areas
            content_areas = soup.select('main, article, .content, .main-content, .docs-content')
            if not content_areas:
                content_areas = [soup.find('body')] if soup.find('body') else [soup]
            
            cross_version_refs = []
            
            for content_area in content_areas:
                if content_area:
                    # Check for href links
                    for tag in content_area.find_all('a', href=True):
                        href = tag['href']
                        ref_info = self._analyze_reference(href, source_version, tag, 'href')
                        if ref_info:
                            ref_info['source_file'] = str(html_file.relative_to(self.docs_dir))
                            cross_version_refs.append(ref_info)
                    
                    # Check for src attributes (images, scripts, etc.)
                    for tag in content_area.find_all(['img', 'script', 'link'], src=True):
                        src = tag['src']
                        ref_info = self._analyze_reference(src, source_version, tag, 'src')
                        if ref_info:
                            ref_info['source_file'] = str(html_file.relative_to(self.docs_dir))
                            cross_version_refs.append(ref_info)
                    
                    # Check for link tags with href (CSS, etc.)
                    for tag in content_area.find_all('link', href=True):
                        href = tag['href']
                        # Skip if it's already processed as a navigation link
                        if tag.get('rel') and any(rel in ['stylesheet', 'icon', 'preload'] for rel in tag.get('rel', [])):
                            ref_info = self._analyze_reference(href, source_version, tag, 'href')
                            if ref_info:
                                ref_info['source_file'] = str(html_file.relative_to(self.docs_dir))
                                cross_version_refs.append(ref_info)
            
            return cross_version_refs
            
        except Exception as e:
            print(f"Error reading {html_file}: {e}")
            return []
    
    def _analyze_reference(self, url, source_version, tag, attr_type):
        """Analyze if a URL is a cross-version reference"""
        # Check for version-specific paths in /docs/images/, /docs/v{version}/, etc.
        version_patterns = [
            r'/docs/(v\d+\.\d+)/',      # /docs/v22.1/page.html
            r'/docs/images/(v\d+\.\d+)/', # /docs/images/v22.1/image.png
            r'/images/(v\d+\.\d+)/',    # /images/v22.1/image.png
        ]
        
        for pattern in version_patterns:
            version_match = re.search(pattern, url)
            if version_match:
                target_version = version_match.group(1)
                
                # Only include if it's a different version
                if target_version != source_version:
                    # Additional filtering to exclude navigation links for href
                    if attr_type == 'href' and not self._is_content_link(tag, url):
                        continue
                    
                    link_text = tag.get_text().strip() if hasattr(tag, 'get_text') else tag.get('alt', '')
                    context = self._get_reference_context(tag)
                    
                    return {
                        'source_version': source_version,
                        'target_version': target_version,
                        'reference_type': attr_type,
                        'asset_type': self._get_asset_type(url, tag),
                        'url': url,
                        'link_text': link_text[:100],  # Limit length
                        'context': context[:200],  # Limit length
                        'tag_name': tag.name
                    }
        
        return None
    
    def _get_asset_type(self, url, tag):
        """Determine the type of asset being referenced"""
        if tag.name == 'img':
            return 'image'
        elif tag.name == 'script':
            return 'javascript'
        elif tag.name == 'link':
            rel = tag.get('rel', [])
            if 'stylesheet' in rel:
                return 'css'
            elif 'icon' in rel:
                return 'icon'
            else:
                return 'link'
        elif tag.name == 'a':
            # Determine by file extension
            if re.search(r'\.(png|jpg|jpeg|gif|svg|webp)$', url, re.I):
                return 'image_link'
            elif re.search(r'\.(css)$', url, re.I):
                return 'css_link'
            elif re.search(r'\.(js)$', url, re.I):
                return 'js_link'
            elif re.search(r'\.(pdf|doc|docx)$', url, re.I):
                return 'document_link'
            else:
                return 'page_link'
        else:
            return 'other'
    
    def _is_content_link(self, tag, url):
        """Determine if a link is likely a content link vs navigation"""
        # Skip if parent has navigation-related classes
        parent = tag.parent
        while parent:
            parent_classes = parent.get('class', [])
            nav_indicators = ['nav', 'menu', 'dropdown', 'breadcrumb', 'version', 'switcher', 'sidebar']
            if any(indicator in ' '.join(parent_classes).lower() for indicator in nav_indicators):
                return False
            parent = parent.parent
        
        # Skip if it has data-proofer-ignore (navigation indicator)
        if tag.get('data-proofer-ignore'):
            return False
        
        # Skip if the link text suggests navigation
        link_text = tag.get_text().strip().lower()
        nav_text_patterns = ['v20.', 'v21.', 'v22.', 'v23.', 'v24.', 'v25.', 'stable', 'latest', 'previous', 'next']
        if any(pattern in link_text for pattern in nav_text_patterns) and len(link_text) < 20:
            return False
            
        # Skip if it's just a version number
        if re.match(r'^v\d+\.\d+$', link_text):
            return False
            
        return True
    
    def _get_reference_context(self, tag):
        """Get surrounding text context for the reference"""
        # Try to get the parent paragraph or container
        context_parent = tag.parent
        while context_parent and context_parent.name not in ['p', 'li', 'td', 'div', 'section']:
            context_parent = context_parent.parent
        
        if context_parent:
            return context_parent.get_text().strip().replace('\n', ' ').replace('\r', '')
        else:
            return tag.get_text().strip() if hasattr(tag, 'get_text') else str(tag)
    
    def analyze_version_directory(self, version):
        """Analyze all HTML files in a version directory for cross-version references"""
        version_dir = self.docs_dir / version
        if not version_dir.exists():
            return
        
        print(f"Analyzing {version} for cross-version references...")
        
        for html_file in version_dir.rglob("*.html"):
            cross_refs = self._extract_cross_version_references(html_file, version)
            self.cross_version_references.extend(cross_refs)
    
    def generate_report(self):
        """Generate the cross-version references report"""
        print(f"Starting cross-version asset & link analysis in {self.docs_dir}")
        print(f"Analyzing versions: {', '.join(self.versions)}")
        
        # Analyze each version directory
        for version in self.versions:
            self.analyze_version_directory(version)
        
        # Sort references by priority (newer source -> older target = higher priority)
        def reference_priority(ref):
            source_ver = ref['source_version'].replace('v', '').replace('.', '')
            target_ver = ref['target_version'].replace('v', '').replace('.', '')
            version_gap = int(source_ver) - int(target_ver)
            
            # Prioritize images higher since they're more likely to be outdated
            type_priority = {
                'image': 1000,
                'image_link': 900,
                'css': 800,
                'css_link': 700,
                'javascript': 600,
                'js_link': 500,
                'page_link': 100,
                'other': 50
            }
            
            return version_gap + type_priority.get(ref['asset_type'], 0)
        
        self.cross_version_references.sort(key=reference_priority, reverse=True)
        
        return self.cross_version_references
    
    def save_report_csv(self, filename="cross_version_assets_report.csv"):
        """Save the report as CSV for technical writer review"""
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['priority', 'asset_type', 'source_version', 'target_version', 'version_gap', 
                         'source_file', 'reference_type', 'url', 'link_text', 'context', 'tag_name']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            
            for ref in self.cross_version_references:
                # Calculate version gap
                source_num = float(ref['source_version'].replace('v', ''))
                target_num = float(ref['target_version'].replace('v', ''))
                version_gap = abs(source_num - target_num)
                
                # Assign priority based on version gap and asset type
                if version_gap >= 3.0:
                    if ref['asset_type'] in ['image', 'image_link']:
                        priority = "CRITICAL"
                    else:
                        priority = "HIGH"
                elif version_gap >= 1.0:
                    priority = "MEDIUM"
                else:
                    priority = "LOW"
                
                writer.writerow({
                    'priority': priority,
                    'asset_type': ref['asset_type'],
                    'source_version': ref['source_version'],
                    'target_version': ref['target_version'],
                    'version_gap': f"{version_gap:.1f}",
                    'source_file': ref['source_file'],
                    'reference_type': ref['reference_type'],
                    'url': ref['url'],
                    'link_text': ref['link_text'],
                    'context': ref['context'],
                    'tag_name': ref['tag_name']
                })
    
    def print_summary(self):
        """Print a summary for the technical writer"""
        if not self.cross_version_references:
            print("\n" + "="*60)
            print("NO CROSS-VERSION REFERENCES FOUND")
            print("="*60)
            print("All cross-version references appear to be navigation/version switcher links.")
            print("The documentation appears to be well-isolated by version.")
            return
        
        print("\n" + "="*60)
        print("CROSS-VERSION ASSET & LINK REFERENCES FOUND")
        print("="*60)
        
        print(f"\nTotal cross-version references: {len(self.cross_version_references)}")
        
        # Asset type breakdown
        asset_counts = defaultdict(int)
        for ref in self.cross_version_references:
            asset_counts[ref['asset_type']] += 1
        
        print(f"\nAsset Type Breakdown:")
        for asset_type, count in sorted(asset_counts.items(), key=lambda x: x[1], reverse=True):
            print(f"  {asset_type}: {count}")
        
        # Priority breakdown
        priority_counts = defaultdict(int)
        for ref in self.cross_version_references:
            source_num = float(ref['source_version'].replace('v', ''))
            target_num = float(ref['target_version'].replace('v', ''))
            version_gap = abs(source_num - target_num)
            
            if version_gap >= 3.0:
                if ref['asset_type'] in ['image', 'image_link']:
                    priority_counts["CRITICAL"] += 1
                else:
                    priority_counts["HIGH"] += 1
            elif version_gap >= 1.0:
                priority_counts["MEDIUM"] += 1
            else:
                priority_counts["LOW"] += 1
        
        print(f"\nPriority Breakdown:")
        print(f"  CRITICAL (images 3+ versions old): {priority_counts['CRITICAL']}")
        print(f"  HIGH (other assets 3+ versions old): {priority_counts['HIGH']}")
        print(f"  MEDIUM (1-3 version gap): {priority_counts['MEDIUM']}")
        print(f"  LOW (<1 version gap): {priority_counts['LOW']}")
        
        # Show top 15 examples
        print(f"\nTop 15 Cross-Version References (by priority):")
        print("-" * 100)
        for i, ref in enumerate(self.cross_version_references[:15]):
            source_num = float(ref['source_version'].replace('v', ''))
            target_num = float(ref['target_version'].replace('v', ''))
            version_gap = abs(source_num - target_num)
            
            print(f"{i+1}. {ref['asset_type'].upper()}: {ref['source_version']} → {ref['target_version']} (gap: {version_gap:.1f})")
            print(f"   File: {ref['source_file']}")
            print(f"   URL: {ref['url']}")
            if ref['link_text']:
                print(f"   Text: '{ref['link_text'][:50]}{'...' if len(ref['link_text']) > 50 else ''}'")
            print()

def main():
    site_dir = "/Users/eeshan/Documents/docs/src/current/_site"
    
    if not os.path.exists(site_dir):
        print(f"Error: Site directory not found: {site_dir}")
        return
    
    reporter = CrossVersionAssetReporter(site_dir)
    
    # Generate the analysis
    cross_version_refs = reporter.generate_report()
    
    # Save CSV report
    csv_filename = "cross_version_assets_report.csv"
    reporter.save_report_csv(csv_filename)
    print(f"\nDetailed report saved to: {csv_filename}")
    
    # Print summary
    reporter.print_summary()
    
    print(f"\n" + "="*60)
    print("NEXT STEPS FOR TECHNICAL WRITER:")
    print("="*60)
    print("1. Review the CSV file for all cross-version references")
    print("2. Focus on CRITICAL priority items first (old images)")
    print("3. For each reference, decide:")
    print("   - UPDATE: Copy asset to current version or update reference")
    print("   - REMOVE: Delete if no longer relevant")
    print("   - KEEP: If intentionally referencing old version")
    print("4. Pay special attention to:")
    print("   - Images from 3+ versions ago (likely outdated UI)")
    print("   - CSS/JS from old versions (potential compatibility issues)")
    print("   - Page links that should point to current version")

if __name__ == "__main__":
    main()