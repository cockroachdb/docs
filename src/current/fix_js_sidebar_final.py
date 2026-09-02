#!/usr/bin/env python3
"""
Final fix for JavaScript sidebar to remove ALL v25.1 and newer version references
"""
import re
from pathlib import Path

OFFLINE_SNAP = Path("/Users/eeshan/Documents/docs/src/current/offline_snap")

def fix_file(file_path):
    """Remove v25.1 and newer references from JavaScript sidebar"""
    try:
        content = file_path.read_text(encoding='utf-8')
        original_content = content
        
        # Target versions to remove (anything newer than v19.2)
        versions_to_remove = [
            'v25.3', 'v25.2', 'v25.1', 
            'v24.3', 'v24.2', 'v24.1', 
            'v23.2', 'v23.1', 
            'v22.2', 'v22.1', 
            'v21.2', 'v21.1',
            'v20.2', 'v20.1'
        ]
        
        for version in versions_to_remove:
            # Remove URLs in arrays like "v25.1/some-page.html",
            patterns = [
                r'"{}/[^"]*",?\s*'.format(version),      # "v25.1/page.html",
                r"'{}/[^']*',?\s*".format(version),      # 'v25.1/page.html',
                r'"{}"\s*:\s*"[^"]*",?\s*'.format(version),  # "v25.1": "something",
                r"'{}'\s*:\s*'[^']*',?\s*".format(version),  # 'v25.1': 'something',
            ]
            
            for pattern in patterns:
                content = re.sub(pattern, '', content, flags=re.MULTILINE | re.DOTALL)
        
        # Clean up any leftover commas and formatting issues
        content = re.sub(r',\s*,', ',', content)  # Remove double commas
        content = re.sub(r',\s*\]', ']', content)  # Remove trailing commas before ]
        content = re.sub(r',\s*\}', '}', content)  # Remove trailing commas before }
        content = re.sub(r'\[\s*,', '[', content)  # Remove leading commas after [
        content = re.sub(r'\{\s*,', '{', content)  # Remove leading commas after {
        
        if content != original_content:
            file_path.write_text(content, encoding='utf-8')
            return True
        return False
        
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    """Fix all HTML files with JavaScript sidebars"""
    if not OFFLINE_SNAP.exists():
        print(f"❌ Offline snap directory not found: {OFFLINE_SNAP}")
        return
    
    print("🚀 Final cleanup: removing ALL v25.1+ references from JavaScript sidebars...")
    
    fixed_count = 0
    total_count = 0
    
    # Process all HTML files
    for html_file in OFFLINE_SNAP.rglob("*.html"):
        # Only process files that likely contain JavaScript sidebars
        file_content = html_file.read_text(encoding='utf-8')
        if 'const sidebar = {' in file_content or 'v25.1' in file_content:
            total_count += 1
            if fix_file(html_file):
                fixed_count += 1
                if fixed_count <= 5:
                    print(f"✅ Fixed {html_file.name}")
    
    print(f"\n✅ Fixed {fixed_count} out of {total_count} files containing v25.1+ references")
    
    if fixed_count > 0:
        print("\n🎯 All v25.1+ version references should now be removed from navigation!")
    else:
        print("\n⚠️  No v25.1+ references found to fix.")

if __name__ == "__main__":
    main()