#!/usr/bin/env python3
"""
Quick fix for the current navigation issue in generated files
"""
import os
import re
from pathlib import Path

OFFLINE_SNAP = Path("/Users/eeshan/Documents/docs/src/current/offline_snap")

def fix_html_file(file_path):
    """Apply the quick navigation fix to current generated files"""
    try:
        content = file_path.read_text(encoding='utf-8')
        
        # Look for the current pattern in the generated files
        old_pattern = '''// Clean up any double slashes
                url = url.replace(/\/+/g, '/');
                
                // Use relative path for portability
                // Don't prepend baseUrl for relative navigation
                if (!sidebar.baseUrl || sidebar.baseUrl === '') {
                    // Already relative, just return
                } else if (sidebar.baseUrl.startsWith('file://')) {
                    // Legacy absolute path - convert to relative
                    url = url;
                } else {
                    url = sidebar.baseUrl + url;
                }'''
        
        # Insert our bulletproof logic BEFORE the baseUrl logic
        new_pattern = '''// Clean up any double slashes
                url = url.replace(/\/+/g, '/');
                
                // BULLETPROOF offline navigation fix
                var currentPath = window.location.pathname;
                var offlineSnapIndex = currentPath.indexOf('/offline_snap/');
                if (offlineSnapIndex !== -1) {
                    // We're in the offline snap - calculate relative path to target
                    var currentFromSnap = currentPath.substring(offlineSnapIndex + '/offline_snap/'.length);
                    var currentParts = currentFromSnap.split('/').filter(function(p) { return p; });
                    
                    // Remove the current filename to get directory path
                    currentParts.pop();
                    
                    // Calculate how many ../ we need to get to offline_snap root
                    var upLevels = currentParts.length;
                    var upPath = '';
                    for (var i = 0; i < upLevels; i++) {
                        upPath += '../';
                    }
                    
                    // Target path is always relative to offline_snap root
                    url = upPath + url;
                }
                
                // Use relative path for portability
                // Don't prepend baseUrl for relative navigation
                if (!sidebar.baseUrl || sidebar.baseUrl === '') {
                    // Already relative, just return
                } else if (sidebar.baseUrl.startsWith('file://')) {
                    // Legacy absolute path - convert to relative
                    url = url;
                } else {
                    url = sidebar.baseUrl + url;
                }'''
        
        if old_pattern in content:
            new_content = content.replace(old_pattern, new_pattern)
            file_path.write_text(new_content, encoding='utf-8')
            return True
        else:
            return False
            
    except Exception as e:
        print(f"❌ Error fixing {file_path}: {e}")
        return False

def main():
    """Apply the quick navigation fix"""
    if not OFFLINE_SNAP.exists():
        print(f"❌ Offline snap directory not found: {OFFLINE_SNAP}")
        return
    
    print("🚀 Applying QUICK navigation fix to generated files...")
    
    fixed_count = 0
    total_count = 0
    
    # Find all HTML files
    for html_file in OFFLINE_SNAP.rglob("*.html"):
        total_count += 1
        if fix_html_file(html_file):
            fixed_count += 1
            if fixed_count <= 5:
                print(f"✅ Fixed {html_file.name}")
    
    print(f"\n✅ Applied quick fix to {fixed_count} out of {total_count} HTML files")
    if fixed_count > 0:
        print("🎯 Navigation should now work perfectly!")
    else:
        print("⚠️  No files needed fixing - pattern may have changed")

if __name__ == "__main__":
    main()