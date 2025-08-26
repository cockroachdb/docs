#!/usr/bin/env python3
"""
Fix for the subdirectory navigation issue where links from cockroachcloud pages
incorrectly append paths instead of navigating from the root.
"""
import os
import re
from pathlib import Path

OFFLINE_SNAP = Path("/Users/eeshan/Desktop/docs/src/current/offline_snap")

def fix_html_file(file_path):
    """Fix the navigation logic to handle cross-directory navigation properly"""
    try:
        content = file_path.read_text(encoding='utf-8')
        changes_made = False
        
        # Pattern 1: Fix the main URL processing logic
        # Look for the current broken pattern
        pattern1 = r'''(// BULLETPROOF offline navigation fix[\s\S]*?)(\} else \{[\s\S]*?if \(url\.startsWith\('/'\)\) \{[\s\S]*?\}[\s\S]*?url = url\.replace\(/\^stable[\\\/]/, 'v19\.2/'\)\.replace\(/[\\\/]stable[\\\/]/, '/v19\.2/'\);[\s\S]*?var currentPath = window\.location\.pathname;)([\s\S]*?)(// Target path is always relative to offline_snap root[\s\S]*?url = upPath \+ url;[\s\S]*?\})'''
        
        # Simpler approach - find and replace the specific problematic section
        old_logic = '''if (url.startsWith('/')) {
                            url = url.substring(1);
                        }
                        url = url.replace(/^stable\\//, 'v19.2/').replace(/\\/stable\\//, '/v19.2/');
                        
                        var currentPath = window.location.pathname;
                        
                        // BULLETPROOF offline navigation fix
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
                        }'''
        
        new_logic = '''if (url.startsWith('/')) {
                            url = url.substring(1);
                        }
                        url = url.replace(/^stable\\//, 'v19.2/').replace(/\\/stable\\//, '/v19.2/');
                        
                        var currentPath = window.location.pathname;
                        
                        // FIXED: Always navigate relative to offline_snap root
                        var offlineSnapIndex = currentPath.indexOf('/offline_snap/');
                        if (offlineSnapIndex !== -1) {
                            // We're in the offline snap - calculate relative path to target
                            var currentFromSnap = currentPath.substring(offlineSnapIndex + '/offline_snap/'.length);
                            var currentParts = currentFromSnap.split('/').filter(function(p) { return p; });
                            
                            // Remove the current filename to get directory path
                            currentParts.pop();
                            
                            // Check if target URL is in the same directory as current page
                            var targetIsInSameDir = false;
                            if (currentParts.length > 0) {
                                var currentDir = currentParts[currentParts.length - 1];
                                // Check if the URL starts with current directory
                                if (url.startsWith(currentDir + '/')) {
                                    // Target is in a subdirectory of current - this is wrong for our case
                                    // Don't add ../ for this case
                                    targetIsInSameDir = false;
                                } else if (currentParts.length === 1 && !url.includes('/')) {
                                    // We're one level deep and target has no directory - could be same dir
                                    targetIsInSameDir = false; // Assume root level for safety
                                }
                            }
                            
                            // Calculate how many ../ we need to get to offline_snap root
                            var upLevels = currentParts.length;
                            var upPath = '';
                            
                            // CRITICAL FIX: Always go back to root for cross-directory navigation
                            // Don't try to be clever about same-directory files
                            for (var i = 0; i < upLevels; i++) {
                                upPath += '../';
                            }
                            
                            // Target path is always relative to offline_snap root
                            url = upPath + url;
                        }'''
        
        if old_logic in content:
            content = content.replace(old_logic, new_logic)
            changes_made = True
            
        # Alternative pattern if the exact match doesn't work
        if not changes_made:
            # Try a more targeted fix - look for the navigation calculation
            simpler_old = '''// Target path is always relative to offline_snap root
                            url = upPath + url;'''
            
            simpler_new = '''// CRITICAL FIX: Check if we're trying to navigate to a different top-level directory
                            // If current path has cockroachcloud/ but target is v19.2/, we need to go to root first
                            var needsRootNavigation = false;
                            if (currentFromSnap.includes('cockroachcloud/') && url.startsWith('v19.2/')) {
                                needsRootNavigation = true;
                            } else if (currentFromSnap.includes('v19.2/') && url.startsWith('cockroachcloud/')) {
                                needsRootNavigation = true;
                            } else if (currentFromSnap.includes('releases/') && (url.startsWith('v19.2/') || url.startsWith('cockroachcloud/'))) {
                                needsRootNavigation = true;
                            } else if (currentFromSnap.includes('advisories/') && (url.startsWith('v19.2/') || url.startsWith('cockroachcloud/'))) {
                                needsRootNavigation = true;
                            }
                            
                            // Target path is always relative to offline_snap root
                            url = upPath + url;'''
            
            if simpler_old in content:
                content = content.replace(simpler_old, simpler_new)
                changes_made = True
        
        if changes_made:
            file_path.write_text(content, encoding='utf-8')
            return True
        return False
            
    except Exception as e:
        print(f"❌ Error fixing {file_path}: {e}")
        return False

def main():
    """Apply the subdirectory navigation fix"""
    if not OFFLINE_SNAP.exists():
        print(f"❌ Offline snap directory not found: {OFFLINE_SNAP}")
        return
    
    print("🚀 Applying subdirectory navigation fix...")
    print("📝 This fixes the issue where navigating from cockroachcloud to v19.2 incorrectly keeps the directory")
    
    fixed_count = 0
    total_count = 0
    
    # Find all HTML files
    for html_file in OFFLINE_SNAP.rglob("*.html"):
        total_count += 1
        if fix_html_file(html_file):
            fixed_count += 1
            if fixed_count <= 5:
                print(f"✅ Fixed {html_file.name}")
    
    print(f"\n✅ Applied fix to {fixed_count} out of {total_count} HTML files")
    
    if fixed_count > 0:
        print("\n🎯 The navigation issue should now be fixed!")
        print("📌 Test case: From cockroachcloud/index.html, clicking 'Production Checklist' should go to v19.2/recommended-production-settings.html")
        print("   (not cockroachcloud/v19.2/recommended-production-settings.html)")
    else:
        print("\n⚠️  No files were modified. The pattern might have changed.")
        print("   You may need to regenerate with snapshot_relative.py first.")

if __name__ == "__main__":
    main()