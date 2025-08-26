#!/usr/bin/env python3
"""
Comprehensive sidebar cleaning to remove ALL non-v19.2 version references
"""
import os
import re
import json
from pathlib import Path

OFFLINE_SNAP = Path("/Users/eeshan/Desktop/docs/src/current/offline_snap")
TARGET_VERSION = "v19.2"

def clean_sidebar_javascript(content):
    """Remove all non-v19.2 version links from sidebar JavaScript"""
    
    # Pattern 1: Remove entire URL entries that reference other versions
    version_patterns = [
        r'v25\.\d+', r'v24\.\d+', r'v23\.\d+', r'v22\.\d+', r'v21\.\d+', r'v20\.\d+',
        r'v2\.\d+', r'v1\.\d+'
    ]
    
    for version_pattern in version_patterns:
        if version_pattern.replace(r'\.', '.') == TARGET_VERSION:
            continue
            
        # Remove URL array entries that contain this version
        content = re.sub(
            rf'"urls"\s*:\s*\[[^\]]*"{version_pattern}/[^"]*"[^\]]*\]',
            '"urls": []',
            content,
            flags=re.DOTALL
        )
        
        # Remove individual URL entries
        content = re.sub(
            rf'"{version_pattern}/[^"]*",?\s*',
            '',
            content
        )
        content = re.sub(
            rf"'{version_pattern}/[^']*',?\s*",
            '',
            content
        )
    
    # Clean up empty arrays and trailing commas
    content = re.sub(r'"urls"\s*:\s*\[\s*\]', '"urls": []', content)
    content = re.sub(r',\s*\]', ']', content)
    content = re.sub(r',\s*\}', '}', content)
    
    return content

def clean_sidebar_html(content):
    """Remove non-v19.2 version links from HTML sidebar"""
    
    version_patterns = [
        r'v25\.\d+', r'v24\.\d+', r'v23\.\d+', r'v22\.\d+', r'v21\.\d+', r'v20\.\d+',
        r'v2\.\d+', r'v1\.\d+'
    ]
    
    for version_pattern in version_patterns:
        if version_pattern.replace(r'\.', '.') == TARGET_VERSION:
            continue
            
        # Remove entire <a> tags that link to other versions
        content = re.sub(
            rf'<a[^>]*href=["\'][^"\']*{version_pattern}/[^"\']*["\'][^>]*>.*?</a>',
            '',
            content,
            flags=re.DOTALL | re.IGNORECASE
        )
        
        # Remove <li> elements containing these links
        content = re.sub(
            rf'<li[^>]*>.*?{version_pattern}/.*?</li>',
            '',
            content,
            flags=re.DOTALL | re.IGNORECASE
        )
    
    return content

def fix_html_file(file_path):
    """Clean all version references from a single HTML file"""
    try:
        content = file_path.read_text(encoding='utf-8')
        original_content = content
        
        # Clean JavaScript sidebar
        if 'const sidebar = {' in content:
            content = clean_sidebar_javascript(content)
        
        # Clean HTML sidebar
        if '<a href=' in content:
            content = clean_sidebar_html(content)
        
        # Additional cleanup: remove any remaining version references in URLs
        version_patterns = [
            r'/v25\.\d+/', r'/v24\.\d+/', r'/v23\.\d+/', r'/v22\.\d+/', r'/v21\.\d+/', r'/v20\.\d+/',
            r'/v2\.\d+/', r'/v1\.\d+/'
        ]
        
        for pattern in version_patterns:
            if f'/{TARGET_VERSION}/' in pattern:
                continue
            content = re.sub(pattern, f'/{TARGET_VERSION}/', content)
        
        if content != original_content:
            file_path.write_text(content, encoding='utf-8')
            return True
        return False
            
    except Exception as e:
        print(f"❌ Error fixing {file_path}: {e}")
        return False

def main():
    """Apply comprehensive sidebar cleaning"""
    if not OFFLINE_SNAP.exists():
        print(f"❌ Offline snap directory not found: {OFFLINE_SNAP}")
        return
    
    print(f"🚀 Comprehensive sidebar cleaning - removing ALL non-{TARGET_VERSION} version links...")
    
    fixed_count = 0
    total_count = 0
    
    # Process all HTML files
    for html_file in OFFLINE_SNAP.rglob("*.html"):
        total_count += 1
        if fix_html_file(html_file):
            fixed_count += 1
            if fixed_count <= 5:
                print(f"✅ Fixed {html_file.name}")
    
    print(f"\n✅ Cleaned {fixed_count} out of {total_count} HTML files")
    
    if fixed_count > 0:
        print(f"\n🎯 All non-{TARGET_VERSION} version links removed from sidebars!")
        print("   Only v19.2 links should remain in navigation.")
    else:
        print(f"\n⚠️  No non-{TARGET_VERSION} version links found.")

if __name__ == "__main__":
    main()