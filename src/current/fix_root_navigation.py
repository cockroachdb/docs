#!/usr/bin/env python3
"""
Fix navigation for root-level index.html and other root files
"""
import re
from pathlib import Path

def fix_root_navigation(file_path):
    """Fix navigation in root-level HTML files"""
    try:
        content = file_path.read_text(encoding='utf-8')
        
        # Check if this is a root-level file
        archive_path = file_path.parent
        relative_path = file_path.relative_to(archive_path)
        
        if len(relative_path.parts) != 1:
            return False  # Not a root file
        
        # Replace the broken detection with better logic for root files
        broken_detection = """// Dynamic archive folder detection - FIXED
                        var offlineSnapIndex = -1;
                        var archiveFolder = '';
                        
                        // Split the path and look for the archive folder
                        var pathParts = currentPath.split('/');
                        
                        // Find the folder that's the parent of our known directories
                        for (var i = pathParts.length - 2; i >= 0; i--) {
                            var part = pathParts[i + 1];
                            // Check if this part is one of our known directories
                            if (part === 'v19.2' || part === 'cockroachcloud' || 
                                part === 'releases' || part === 'advisories' || 
                                part === 'molt' || part === '_internal' || part === 'docs') {
                                // The previous part is our archive folder
                                if (pathParts[i]) {
                                    archiveFolder = pathParts[i];
                                    offlineSnapIndex = currentPath.lastIndexOf('/' + archiveFolder + '/');
                                    break;
                                }
                            }
                        }"""
        
        improved_detection = """// Dynamic archive folder detection - FIXED FOR ROOT
                        var offlineSnapIndex = -1;
                        var archiveFolder = '';
                        
                        // Split the path and look for the archive folder
                        var pathParts = currentPath.split('/');
                        
                        // Special handling for root-level files (index.html at archive root)
                        // Check if current file is at root by looking for subdirectories in same folder
                        var isRootFile = false;
                        
                        // If the path doesn't contain any of our known directories, we might be at root
                        var hasKnownDir = false;
                        for (var j = 0; j < pathParts.length; j++) {
                            if (pathParts[j] === 'v19.2' || pathParts[j] === 'cockroachcloud' || 
                                pathParts[j] === 'releases' || pathParts[j] === 'advisories' || 
                                pathParts[j] === 'molt' || pathParts[j] === '_internal') {
                                hasKnownDir = true;
                                break;
                            }
                        }
                        
                        if (!hasKnownDir && pathParts.length > 0) {
                            // We're likely at root - the archive folder is the parent of this file
                            archiveFolder = pathParts[pathParts.length - 2] || pathParts[pathParts.length - 1];
                            if (archiveFolder && archiveFolder.indexOf('.html') === -1) {
                                offlineSnapIndex = currentPath.lastIndexOf('/' + archiveFolder + '/');
                                isRootFile = true;
                            }
                        }
                        
                        // If not a root file, use the standard detection
                        if (!isRootFile) {
                            for (var i = pathParts.length - 2; i >= 0; i--) {
                                var part = pathParts[i + 1];
                                // Check if this part is one of our known directories
                                if (part === 'v19.2' || part === 'cockroachcloud' || 
                                    part === 'releases' || part === 'advisories' || 
                                    part === 'molt' || part === '_internal' || part === 'docs') {
                                    // The previous part is our archive folder
                                    if (pathParts[i]) {
                                        archiveFolder = pathParts[i];
                                        offlineSnapIndex = currentPath.lastIndexOf('/' + archiveFolder + '/');
                                        break;
                                    }
                                }
                            }
                        }"""
        
        new_content = content.replace(broken_detection, improved_detection)
        
        if new_content != content:
            file_path.write_text(new_content, encoding='utf-8')
            return True
            
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    # Find archive folder
    archive_folders = ['my_dynamic_archive', 'test_portable_docs', 'offline_snap']
    archive_path = None
    
    for folder in archive_folders:
        if Path(folder).exists():
            archive_path = Path(folder)
            break
    
    if not archive_path:
        print("❌ No archive folder found")
        return
    
    print(f"🔧 Fixing root navigation in {archive_path}")
    
    # Process root-level HTML files only
    root_files = [f for f in archive_path.glob("*.html")]
    
    fixed_count = 0
    for html_file in root_files:
        if fix_root_navigation(html_file):
            fixed_count += 1
            print(f"   ✅ Fixed: {html_file.name}")
    
    print(f"\n✅ Fixed {fixed_count} root-level files")
    print("📁 Root navigation should now work correctly")

if __name__ == "__main__":
    main()