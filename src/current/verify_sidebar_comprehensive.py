#!/usr/bin/env python3
"""
Verify that ALL pages have the comprehensive sidebar with full navigation
"""
import re
from pathlib import Path
from collections import defaultdict

OFFLINE_SNAP = Path("/Users/eeshan/Desktop/docs/src/current/offline_snap")

def analyze_sidebar(file_path):
    """Analyze sidebar content in a single HTML file"""
    try:
        content = file_path.read_text(encoding='utf-8')
        
        # Check if it has a sidebar at all
        if 'const sidebar = {' not in content:
            return {
                'has_sidebar': False,
                'type': 'no_sidebar',
                'top_level_sections': 0,
                'total_urls': 0
            }
        
        # Extract sidebar content
        sidebar_start = content.find('const sidebar = {')
        sidebar_end = content.find('};', sidebar_start)
        sidebar_content = content[sidebar_start:sidebar_end + 2]
        
        # Count top-level sections
        top_level_sections = len(re.findall(r'"is_top_level":\s*true', sidebar_content))
        
        # Count total URLs
        total_urls = len(re.findall(r'"urls":\s*\[', sidebar_content))
        
        # Count total items
        total_items = len(re.findall(r'"title":', sidebar_content))
        
        # Determine sidebar type
        if top_level_sections >= 8 and total_items >= 100:
            sidebar_type = 'comprehensive'
        elif top_level_sections >= 5 and total_items >= 50:
            sidebar_type = 'medium'
        elif total_items >= 10:
            sidebar_type = 'basic'
        else:
            sidebar_type = 'minimal'
        
        return {
            'has_sidebar': True,
            'type': sidebar_type,
            'top_level_sections': top_level_sections,
            'total_items': total_items,
            'total_urls': total_urls
        }
        
    except Exception as e:
        return {
            'has_sidebar': False,
            'type': 'error',
            'error': str(e),
            'top_level_sections': 0,
            'total_urls': 0
        }

def main():
    """Analyze sidebars across all pages"""
    if not OFFLINE_SNAP.exists():
        print(f"❌ Offline snap directory not found: {OFFLINE_SNAP}")
        return
    
    print("🚀 Analyzing sidebar comprehensiveness across ALL pages...")
    
    # Group results by directory and sidebar type
    results = defaultdict(list)
    sidebar_types = defaultdict(int)
    
    # Analyze all HTML files
    total_files = 0
    for html_file in OFFLINE_SNAP.rglob("*.html"):
        if '_internal' in str(html_file):  # Skip internal files
            continue
            
        total_files += 1
        analysis = analyze_sidebar(html_file)
        
        # Group by directory
        directory = html_file.parent.name
        if directory == 'offline_snap':
            directory = 'root'
        
        results[directory].append({
            'file': html_file.name,
            'path': str(html_file.relative_to(OFFLINE_SNAP)),
            'analysis': analysis
        })
        
        sidebar_types[analysis['type']] += 1
    
    # Print summary
    print(f"\n📊 SIDEBAR ANALYSIS RESULTS:")
    print(f"Total files analyzed: {total_files}")
    print(f"\n📈 Sidebar Types Distribution:")
    for sidebar_type, count in sidebar_types.items():
        print(f"  {sidebar_type}: {count} files")
    
    # Check for non-comprehensive sidebars
    non_comprehensive = []
    for directory, files in results.items():
        for file_info in files:
            if file_info['analysis']['type'] != 'comprehensive':
                non_comprehensive.append(file_info)
    
    if non_comprehensive:
        print(f"\n⚠️  FOUND {len(non_comprehensive)} FILES WITH NON-COMPREHENSIVE SIDEBARS:")
        
        # Group by type
        by_type = defaultdict(list)
        for file_info in non_comprehensive:
            by_type[file_info['analysis']['type']].append(file_info)
        
        for sidebar_type, files in by_type.items():
            print(f"\n  📁 {sidebar_type.upper()} sidebars ({len(files)} files):")
            for file_info in files[:5]:  # Show first 5 examples
                analysis = file_info['analysis']
                print(f"     • {file_info['path']}")
                print(f"       Top-level sections: {analysis.get('top_level_sections', 0)}")
                print(f"       Total items: {analysis.get('total_items', 0)}")
            
            if len(files) > 5:
                print(f"       ... and {len(files) - 5} more")
    
    else:
        print(f"\n🎉 SUCCESS! ALL {total_files} pages have comprehensive sidebars!")
    
    # Show directory breakdown
    print(f"\n📂 By Directory:")
    for directory, files in results.items():
        comprehensive_count = sum(1 for f in files if f['analysis']['type'] == 'comprehensive')
        total_count = len(files)
        percentage = (comprehensive_count / total_count * 100) if total_count > 0 else 0
        
        status = "✅" if comprehensive_count == total_count else "⚠️"
        print(f"  {status} {directory}/: {comprehensive_count}/{total_count} comprehensive ({percentage:.1f}%)")
    
    return len(non_comprehensive) == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)