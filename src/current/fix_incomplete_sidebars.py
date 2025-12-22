#!/usr/bin/env python3
"""
Fix pages with incomplete sidebars by replacing them with the comprehensive sidebar
"""
import re
from pathlib import Path

OFFLINE_SNAP = Path("/Users/eeshan/Documents/docs/src/current/offline_snap")

def extract_comprehensive_sidebar():
    """Extract comprehensive sidebar from a working page"""
    # Use index.html as the source of the comprehensive sidebar
    source_file = OFFLINE_SNAP / "index.html"
    
    if not source_file.exists():
        print("❌ Source file (index.html) not found")
        return None
    
    content = source_file.read_text(encoding='utf-8')
    
    # Find the sidebar JavaScript
    sidebar_start = content.find('const sidebar = {')
    if sidebar_start == -1:
        print("❌ Comprehensive sidebar not found in source file")
        return None
    
    sidebar_end = content.find('};', sidebar_start)
    if sidebar_end == -1:
        print("❌ Sidebar end not found in source file")
        return None
    
    comprehensive_sidebar = content[sidebar_start:sidebar_end + 2]
    print(f"✅ Extracted comprehensive sidebar ({len(comprehensive_sidebar)} characters)")
    return comprehensive_sidebar

def fix_page_sidebar(file_path, comprehensive_sidebar):
    """Replace incomplete sidebar with comprehensive one"""
    try:
        content = file_path.read_text(encoding='utf-8')
        
        # Find existing sidebar
        sidebar_start = content.find('const sidebar = {')
        if sidebar_start == -1:
            return False
        
        sidebar_end = content.find('};', sidebar_start)
        if sidebar_end == -1:
            return False
        
        # Replace the sidebar
        new_content = (
            content[:sidebar_start] + 
            comprehensive_sidebar + 
            content[sidebar_end + 2:]
        )
        
        file_path.write_text(new_content, encoding='utf-8')
        return True
        
    except Exception as e:
        print(f"❌ Error fixing {file_path}: {e}")
        return False

def main():
    """Fix all pages with incomplete sidebars"""
    if not OFFLINE_SNAP.exists():
        print(f"❌ Offline snap directory not found: {OFFLINE_SNAP}")
        return
    
    print("🚀 Fixing pages with incomplete sidebars...")
    
    # Get comprehensive sidebar
    comprehensive_sidebar = extract_comprehensive_sidebar()
    if not comprehensive_sidebar:
        return
    
    # List of files that need fixing (from the previous analysis)
    files_to_fix = [
        "v19.2/as-of-system-time.html",
        "v19.2/show-grants.html", 
        "v19.2/add-constraint.html",
        "v19.2/performance-benchmarking-with-tpc-c-100k-warehouses.html",
        "v19.2/recommended-production-settings.html"
    ]
    
    # Get complete list by checking all v19.2 files
    print("🔍 Scanning for all files with incomplete sidebars...")
    
    incomplete_files = []
    for html_file in (OFFLINE_SNAP / "v19.2").rglob("*.html"):
        try:
            content = html_file.read_text(encoding='utf-8')
            if 'const sidebar = {' in content:
                # Count top-level sections
                top_level_sections = len(re.findall(r'"is_top_level":\s*true', content))
                if top_level_sections < 8:  # Less than comprehensive
                    incomplete_files.append(html_file)
        except:
            continue
    
    print(f"📋 Found {len(incomplete_files)} files with incomplete sidebars")
    
    # Fix each file
    fixed_count = 0
    for file_path in incomplete_files:
        if fix_page_sidebar(file_path, comprehensive_sidebar):
            fixed_count += 1
            if fixed_count <= 5:
                print(f"✅ Fixed {file_path.name}")
    
    print(f"\n✅ Fixed {fixed_count} out of {len(incomplete_files)} files")
    
    if fixed_count > 0:
        print("🎯 All pages should now have comprehensive sidebars!")
    
    return fixed_count > 0

if __name__ == "__main__":
    main()