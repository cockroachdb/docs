#!/usr/bin/env python3
"""
Fix ${VERSION} placeholders in the navigation JavaScript
"""
import os
import re
from pathlib import Path

OFFLINE_SNAP = Path("/Users/eeshan/Desktop/docs/src/current/offline_snap")
TARGET_VERSION = "v19.2"

def fix_html_file(file_path):
    """Replace ${VERSION} placeholders with v19.2"""
    try:
        content = file_path.read_text(encoding='utf-8')
        original_content = content
        
        # Replace ${VERSION} in URLs within JavaScript
        # Pattern 1: In sidebar JavaScript
        content = re.sub(r'\$\{VERSION\}', TARGET_VERSION, content)
        
        # Pattern 2: In quoted strings (both single and double quotes)
        content = re.sub(r'(["\'])/\$\{VERSION\}/', rf'\1/{TARGET_VERSION}/', content)
        content = re.sub(r'(["\'])\$\{VERSION\}/', rf'\1{TARGET_VERSION}/', content)
        
        # Pattern 3: URL patterns with ${VERSION}
        content = re.sub(r'"/\$\{VERSION\}/([^"]+)"', rf'"/{TARGET_VERSION}/\1"', content)
        content = re.sub(r"'/\$\{VERSION\}/([^']+)'", rf"'/{TARGET_VERSION}/\1'", content)
        
        # Pattern 4: In JavaScript template strings
        content = re.sub(r'`/\$\{VERSION\}/([^`]+)`', rf'`/{TARGET_VERSION}/\1`', content)
        
        # Pattern 5: In href attributes
        content = re.sub(r'href="/\$\{VERSION\}/', rf'href="/{TARGET_VERSION}/', content)
        content = re.sub(r'href="\$\{VERSION\}/', rf'href="{TARGET_VERSION}/', content)
        
        # Also replace stable references
        content = re.sub(r'(["\'])/stable/', rf'\1/{TARGET_VERSION}/', content)
        content = re.sub(r'(["\'])stable/', rf'\1{TARGET_VERSION}/', content)
        
        if content != original_content:
            file_path.write_text(content, encoding='utf-8')
            return True
        return False
            
    except Exception as e:
        print(f"❌ Error fixing {file_path}: {e}")
        return False

def main():
    """Apply the version placeholder fix"""
    if not OFFLINE_SNAP.exists():
        print(f"❌ Offline snap directory not found: {OFFLINE_SNAP}")
        return
    
    print(f"🚀 Fixing ${{VERSION}} placeholders with {TARGET_VERSION}...")
    
    fixed_count = 0
    total_count = 0
    
    # Find all HTML files
    for html_file in OFFLINE_SNAP.rglob("*.html"):
        total_count += 1
        if fix_html_file(html_file):
            fixed_count += 1
            if fixed_count <= 5:
                print(f"✅ Fixed {html_file.name}")
    
    print(f"\n✅ Fixed {fixed_count} out of {total_count} HTML files")
    
    if fixed_count > 0:
        print(f"\n🎯 All ${{VERSION}} placeholders have been replaced with {TARGET_VERSION}")
        print("   Navigation links should now resolve correctly!")
    else:
        print("\n⚠️  No ${VERSION} placeholders found. This might already be fixed.")

if __name__ == "__main__":
    main()