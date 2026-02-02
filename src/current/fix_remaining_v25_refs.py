#!/usr/bin/env python3
"""
Fix remaining v25.1 URL references in JSON-like structures
"""
import re
from pathlib import Path

OFFLINE_SNAP = Path("/Users/eeshan/Documents/docs/src/current/offline_snap")

def fix_file(file_path):
    """Remove remaining v25.1 references from URL arrays"""
    try:
        content = file_path.read_text(encoding='utf-8')
        original_content = content
        
        # Remove entire URL entries in arrays that reference v25.1 or newer
        versions_to_remove = [
            'v25.3', 'v25.2', 'v25.1', 
            'v24.3', 'v24.2', 'v24.1', 
            'v23.2', 'v23.1', 
            'v22.2', 'v22.1', 
            'v21.2', 'v21.1',
            'v20.2', 'v20.1'
        ]
        
        for version in versions_to_remove:
            # Pattern to match full URL entries like:
            #   "/v25.1/some-page.html"
            # including the quotes and comma
            patterns = [
                r'"/' + version + r'/[^"]*"(?:\s*,)?\s*',    # "/v25.1/page.html",
                r"'/" + version + r"/[^']*'(?:\s*,)?\s*",    # '/v25.1/page.html',
            ]
            
            for pattern in patterns:
                content = re.sub(pattern, '', content, flags=re.MULTILINE)
        
        # Clean up empty arrays and trailing commas
        content = re.sub(r'"urls":\s*\[\s*\]', '"urls": []', content)
        content = re.sub(r',\s*\]', ']', content)
        content = re.sub(r'\[\s*,', '[', content)
        
        if content != original_content:
            file_path.write_text(content, encoding='utf-8')
            return True
        return False
        
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    """Fix remaining v25.1 references"""
    if not OFFLINE_SNAP.exists():
        print(f"❌ Offline snap directory not found: {OFFLINE_SNAP}")
        return
    
    print("🚀 Removing remaining v25.1+ URL references...")
    
    fixed_count = 0
    total_files = 0
    
    # Look for files that still contain v25.1 references
    for html_file in OFFLINE_SNAP.rglob("*.html"):
        try:
            content = html_file.read_text(encoding='utf-8')
            if any(f'/{version}/' in content for version in ['v25.1', 'v24.1', 'v23.1']):
                total_files += 1
                if fix_file(html_file):
                    fixed_count += 1
                    if fixed_count <= 5:
                        print(f"✅ Fixed {html_file.name}")
        except:
            continue
    
    print(f"\n✅ Fixed {fixed_count} out of {total_files} files with remaining version references")

if __name__ == "__main__":
    main()