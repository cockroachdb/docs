#!/usr/bin/env python3
"""
Comprehensive navigation testing - tests all sidebar links from multiple pages
"""
import json
import re
from pathlib import Path
from collections import defaultdict
import random

def extract_sidebar_urls(html_content):
    """Extract all URLs from the sidebar JavaScript"""
    urls = set()
    
    # Find sidebar items in JavaScript
    sidebar_pattern = r'"urls":\s*\[\s*"([^"]+)"'
    matches = re.findall(sidebar_pattern, html_content)
    urls.update(matches)
    
    # Also find any href links in sidebar
    href_pattern = r'href="([^"]+\.html)"'
    href_matches = re.findall(href_pattern, html_content)
    urls.update(href_matches)
    
    return urls

def calculate_expected_path(from_page, to_url, archive_folder):
    """Calculate what the expected path should be for a navigation"""
    from_parts = from_page.parts[from_page.parts.index(archive_folder)+1:]
    
    # Remove the filename to get directory depth
    from_dir_parts = from_parts[:-1]
    
    # Calculate how many ../ needed
    up_levels = len(from_dir_parts)
    
    # Clean the target URL
    target = to_url.lstrip('/')
    
    # Build expected path
    expected = '../' * up_levels + target
    expected = expected.replace('//', '/')
    
    return expected

def test_navigation_js(html_path, archive_path):
    """Test the JavaScript navigation logic in a specific HTML file"""
    try:
        content = html_path.read_text(encoding='utf-8')
        archive_folder = archive_path.name
        
        # Extract sidebar URLs
        sidebar_urls = extract_sidebar_urls(content)
        
        # Check if dynamic navigation fix is present
        has_dynamic_fix = "Dynamic archive folder detection" in content
        
        # Check if the navigation would work
        issues = []
        
        # Simulate navigation for each URL
        for url in sidebar_urls:
            if url.startswith('http'):
                continue  # Skip external URLs
                
            # Calculate expected navigation path
            expected = calculate_expected_path(html_path, url, archive_folder)
            
            # Check if target file exists
            if url.startswith('/'):
                target_path = archive_path / url[1:]
            else:
                target_path = html_path.parent / url
                
            target_exists = target_path.exists() or (archive_path / url.lstrip('/')).exists()
            
            if not target_exists:
                # Try with .html extension if missing
                if not url.endswith('.html'):
                    url_with_html = url + '.html'
                    target_path = archive_path / url_with_html.lstrip('/')
                    target_exists = target_path.exists()
            
            if not target_exists:
                issues.append({
                    'url': url,
                    'type': 'missing_target',
                    'expected_path': str(target_path)
                })
        
        return {
            'path': str(html_path.relative_to(archive_path)),
            'sidebar_urls': len(sidebar_urls),
            'has_dynamic_fix': has_dynamic_fix,
            'issues': issues
        }
        
    except Exception as e:
        return {
            'path': str(html_path),
            'error': str(e)
        }

def main():
    # Find the archive folder
    archive_folders = ['my_dynamic_archive', 'test_portable_docs', 'offline_snap']
    archive_path = None
    
    for folder in archive_folders:
        if Path(folder).exists():
            archive_path = Path(folder)
            break
    
    if not archive_path:
        print("❌ No archive folder found!")
        return
    
    print(f"🔍 Testing navigation in archive: {archive_path}")
    print("=" * 60)
    
    # Test pages from different directories
    test_pages = [
        archive_path / "v19.2" / "index.html",
        archive_path / "cockroachcloud" / "quickstart.html",
        archive_path / "advisories" / "index.html" if (archive_path / "advisories" / "index.html").exists() else None,
        archive_path / "releases" / "index.html" if (archive_path / "releases" / "index.html").exists() else None,
    ]
    
    # Add some random pages
    all_html = list(archive_path.rglob("*.html"))
    if len(all_html) > 10:
        test_pages.extend(random.sample(all_html, 5))
    
    # Filter out None values
    test_pages = [p for p in test_pages if p and p.exists()]
    
    all_issues = defaultdict(list)
    stats = {
        'total_pages_tested': 0,
        'pages_with_issues': 0,
        'total_links_tested': 0,
        'broken_links': 0,
        'pages_without_dynamic_fix': 0
    }
    
    print(f"Testing navigation from {len(test_pages)} pages...\n")
    
    for page in test_pages:
        result = test_navigation_js(page, archive_path)
        stats['total_pages_tested'] += 1
        
        if 'error' in result:
            print(f"❌ Error testing {result['path']}: {result['error']}")
            continue
        
        stats['total_links_tested'] += result['sidebar_urls']
        
        if not result['has_dynamic_fix']:
            stats['pages_without_dynamic_fix'] += 1
            all_issues['missing_fix'].append(result['path'])
        
        if result['issues']:
            stats['pages_with_issues'] += 1
            stats['broken_links'] += len(result['issues'])
            
            print(f"⚠️  Issues in {result['path']}:")
            for issue in result['issues'][:5]:  # Show first 5 issues
                print(f"   - {issue['type']}: {issue['url']}")
            if len(result['issues']) > 5:
                print(f"   ... and {len(result['issues']) - 5} more issues")
            
            all_issues[result['path']] = result['issues']
        else:
            print(f"✅ {result['path']}: All {result['sidebar_urls']} sidebar links OK")
    
    # Generate report
    print("\n" + "=" * 60)
    print("📊 NAVIGATION TEST REPORT")
    print("=" * 60)
    
    print(f"\n📁 Archive: {archive_path.name}")
    print(f"📄 Pages tested: {stats['total_pages_tested']}")
    print(f"🔗 Total links tested: {stats['total_links_tested']}")
    
    print(f"\n✅ Success Rate:")
    if stats['total_links_tested'] > 0:
        success_rate = ((stats['total_links_tested'] - stats['broken_links']) / stats['total_links_tested']) * 100
        print(f"   {success_rate:.1f}% of links work correctly")
    
    print(f"\n⚠️  Issues Found:")
    print(f"   Pages with broken links: {stats['pages_with_issues']}")
    print(f"   Total broken links: {stats['broken_links']}")
    print(f"   Pages missing dynamic fix: {stats['pages_without_dynamic_fix']}")
    
    if all_issues:
        print(f"\n🔧 Most Common Broken Links:")
        link_counts = defaultdict(int)
        for issues in all_issues.values():
            if isinstance(issues, list):
                for issue in issues:
                    link_counts[issue['url']] += 1
        
        sorted_links = sorted(link_counts.items(), key=lambda x: x[1], reverse=True)
        for link, count in sorted_links[:10]:
            print(f"   {link}: broken in {count} pages")
    
    # Test actual navigation simulation
    print(f"\n🧪 Testing Actual Navigation Logic:")
    test_actual_navigation(archive_path)
    
    return stats

def test_actual_navigation(archive_path):
    """Test the actual JavaScript navigation logic"""
    test_html = archive_path / "v19.2" / "index.html"
    if not test_html.exists():
        print("   ❌ Could not find test page")
        return
    
    content = test_html.read_text(encoding='utf-8')
    
    # Check for the navigation fix
    if "Dynamic archive folder detection - FIXED" in content:
        print("   ✅ Has improved dynamic navigation fix")
    elif "Dynamic archive folder detection" in content:
        print("   ⚠️  Has old dynamic navigation (may not work)")
    elif "offlineSnapIndex" in content:
        print("   ❌ Has hardcoded offline_snap navigation")
    else:
        print("   ❌ No navigation fix found")
    
    # Check if archive folder would be detected correctly
    print(f"\n   Testing detection for folder: '{archive_path.name}'")
    
    # Simulate the JavaScript logic
    test_paths = [
        f"/Users/test/{archive_path.name}/v19.2/index.html",
        f"/Users/test/{archive_path.name}/cockroachcloud/quickstart.html",
        f"/var/www/{archive_path.name}/advisories/index.html"
    ]
    
    for test_path in test_paths:
        parts = test_path.split('/')
        detected = False
        
        for i in range(len(parts) - 2, -1, -1):
            next_part = parts[i + 1] if i + 1 < len(parts) else None
            if next_part in ['v19.2', 'cockroachcloud', 'advisories', 'releases', 'molt', '_internal', 'docs']:
                if parts[i] == archive_path.name:
                    detected = True
                    break
        
        status = "✅" if detected else "❌"
        print(f"   {status} Would detect from: {test_path}")

if __name__ == "__main__":
    main()