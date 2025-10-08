#!/usr/bin/env python3
"""
Fix the sidebar-v19.2.html file to remove references to versions newer than v19.2
"""
import re
from pathlib import Path

SIDEBAR_FILE = Path("/Users/eeshan/Desktop/docs/src/current/offline_snap/_internal/sidebar-v19.2.html")

def fix_sidebar():
    """Remove all references to versions newer than v19.2 from the sidebar"""
    if not SIDEBAR_FILE.exists():
        print(f"❌ Sidebar file not found: {SIDEBAR_FILE}")
        return False
    
    print("🚀 Cleaning v19.2 sidebar file of newer version references...")
    
    content = SIDEBAR_FILE.read_text(encoding='utf-8')
    original_content = content
    
    # Remove links to versions newer than v19.2
    newer_versions = [
        'v25.3', 'v25.2', 'v25.1', 'v24.3', 'v24.2', 'v24.1', 
        'v23.2', 'v23.1', 'v22.2', 'v22.1', 'v21.2', 'v21.1',
        'v20.2', 'v20.1'
    ]
    
    for version in newer_versions:
        # Remove entire <a> tags that link to these versions
        patterns = [
            rf'<a[^>]*href=["\'][^"\']*/{version}\.html["\'][^>]*>.*?</a>',
            rf'<a[^>]*href=["\'][^"\']*{version}\.html["\'][^>]*>.*?</a>',
            rf'<a[^>]*href=["\'][^"\']*{version}/[^"\']*["\'][^>]*>.*?</a>'
        ]
        
        for pattern in patterns:
            content = re.sub(pattern, '', content, flags=re.DOTALL | re.IGNORECASE)
        
        # Remove <li> elements containing these links
        li_patterns = [
            rf'<li[^>]*>.*?{version}\.html.*?</li>',
            rf'<li[^>]*>.*?{version}/.*?</li>'
        ]
        
        for pattern in li_patterns:
            content = re.sub(pattern, '', content, flags=re.DOTALL | re.IGNORECASE)
    
    # Clean up any empty list items or double spaces
    content = re.sub(r'<li[^>]*>\s*</li>', '', content)
    content = re.sub(r'\s+', ' ', content)
    content = re.sub(r'>\s+<', '><', content)
    
    changes_made = content != original_content
    
    if changes_made:
        SIDEBAR_FILE.write_text(content, encoding='utf-8')
        print("✅ Cleaned v19.2 sidebar file of newer version references")
        return True
    else:
        print("ℹ️  No newer version references found to clean")
        return False

def main():
    success = fix_sidebar()
    if success:
        print("\n🎯 Sidebar cleaned! Only v19.2 and older versions should remain.")
    else:
        print("\n⚠️  No changes were made to the sidebar.")

if __name__ == "__main__":
    main()