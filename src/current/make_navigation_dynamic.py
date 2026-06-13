#!/usr/bin/env python3
"""
Make archive navigation work with any folder name by replacing hardcoded offline_snap references
"""
import os
import re
import sys
from pathlib import Path

def make_navigation_dynamic(file_path):
    """Replace hardcoded offline_snap references with dynamic folder detection"""
    try:
        content = file_path.read_text(encoding='utf-8')
        
        # Pattern 1: Replace the hardcoded indexOf('/offline_snap/') with dynamic detection
        pattern1 = r"var offlineSnapIndex = currentPath\.indexOf\('/offline_snap/'\);"
        replacement1 = '''// Dynamic archive folder detection
                        var offlineSnapIndex = -1;
                        var archiveFolder = '';
                        
                        // Method 1: Look for _internal folder pattern
                        var internalMatch = currentPath.match(/\\/([^\\/]+)\\/_internal\\//);
                        if (internalMatch) {
                            archiveFolder = internalMatch[1];
                            offlineSnapIndex = currentPath.indexOf('/' + archiveFolder + '/');
                        } else {
                            // Method 2: Look for archive structure (docs, v19.2, releases, etc.)
                            var archiveMatch = currentPath.match(/\\/([^\\/]+)\\/(docs|v19\\.2|releases|advisories|cockroachcloud|molt)\\//);
                            if (archiveMatch) {
                                archiveFolder = archiveMatch[1];
                                offlineSnapIndex = currentPath.indexOf('/' + archiveFolder + '/');
                            }
                        }'''
        
        # Pattern 2: Replace the hardcoded substring calculation
        pattern2 = r"var currentFromSnap = currentPath\.substring\(offlineSnapIndex \+ '/offline_snap/'\.length\);"
        replacement2 = "var currentFromSnap = currentPath.substring(offlineSnapIndex + ('/' + archiveFolder + '/').length);"
        
        # Apply replacements
        new_content = re.sub(pattern1, replacement1, content, flags=re.MULTILINE)
        new_content = re.sub(pattern2, replacement2, new_content, flags=re.MULTILINE)
        
        # Also fix comments that mention "offline_snap root"
        new_content = new_content.replace('// Calculate how many ../ we need to get to offline_snap root', 
                                         '// Calculate how many ../ we need to get to archive root')
        new_content = new_content.replace('// Target path is always relative to offline_snap root',
                                         '// Target path is always relative to archive root')
        
        if new_content != content:
            file_path.write_text(new_content, encoding='utf-8')
            return True
        
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    if len(sys.argv) > 1:
        archive_path = Path(sys.argv[1])
    else:
        archive_path = Path("offline_snap")
    
    if not archive_path.exists():
        print(f"❌ Archive folder {archive_path} not found!")
        return
    
    print(f"🔧 Making navigation dynamic in: {archive_path}")
    
    # Find all HTML files
    html_files = list(archive_path.rglob("*.html"))
    
    fixed_count = 0
    total_files = len(html_files)
    
    for i, html_file in enumerate(html_files):
        if i % 100 == 0 and i > 0:
            print(f"Progress: {i}/{total_files} ({i/total_files*100:.1f}%)")
        
        if make_navigation_dynamic(html_file):
            fixed_count += 1
    
    print(f"✅ Made navigation dynamic in {fixed_count} HTML files")
    print(f"🎯 Archive can now be renamed to any folder name!")
    print(f"📁 Navigation will auto-detect the archive folder and work correctly")

if __name__ == "__main__":
    main()