#!/usr/bin/env python3
"""
Fix absolute file:/// URLs in offline documentation archive
Converts absolute paths to relative paths for portability
"""
import os
import re
from pathlib import Path
from bs4 import BeautifulSoup
import sys

def fix_absolute_links(file_path, base_dir):
    """Convert absolute file:/// URLs to relative paths in HTML file"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Parse HTML
    soup = BeautifulSoup(content, 'html.parser')
    modified = False
    
    # Pattern to match absolute file URLs
    absolute_pattern = re.compile(r'file:///[^"\'#\s]+')
    
    # Fix links in href attributes
    for tag in soup.find_all(attrs={'href': True}):
        href = tag['href']
        if href.startswith('file:///'):
            # Extract path after file:///
            abs_path = href[8:]  # Remove 'file:///'
            
            # Find the offline_snap or archive directory in the path
            if '/offline_snap/' in abs_path:
                idx = abs_path.index('/offline_snap/')
                relative_path = abs_path[idx + len('/offline_snap/'):]
            elif '/offline_full_archive/' in abs_path:
                idx = abs_path.index('/offline_full_archive/')
                relative_path = abs_path[idx + len('/offline_full_archive/'):]
            else:
                # Try to extract just the docs part
                parts = abs_path.split('/')
                if 'docs' in parts:
                    idx = parts.index('docs')
                    relative_path = '/'.join(parts[idx:])
                else:
                    relative_path = abs_path.split('/')[-1]
            
            # Calculate relative path from current file to target
            current_file = Path(file_path)
            current_depth = len(current_file.relative_to(base_dir).parent.parts)
            
            # Build relative path with correct number of ../
            if current_depth > 0:
                prefix = '../' * current_depth
                new_href = prefix + relative_path
            else:
                new_href = relative_path
            
            tag['href'] = new_href
            modified = True
            print(f"  Fixed: {href[:50]}... -> {new_href}")
    
    # Fix links in src attributes
    for tag in soup.find_all(attrs={'src': True}):
        src = tag['src']
        if src.startswith('file:///'):
            abs_path = src[8:]
            
            if '/offline_snap/' in abs_path:
                idx = abs_path.index('/offline_snap/')
                relative_path = abs_path[idx + len('/offline_snap/'):]
            elif '/offline_full_archive/' in abs_path:
                idx = abs_path.index('/offline_full_archive/')
                relative_path = abs_path[idx + len('/offline_full_archive/'):]
            else:
                parts = abs_path.split('/')
                if 'docs' in parts:
                    idx = parts.index('docs')
                    relative_path = '/'.join(parts[idx:])
                else:
                    relative_path = abs_path.split('/')[-1]
            
            current_file = Path(file_path)
            current_depth = len(current_file.relative_to(base_dir).parent.parts)
            
            if current_depth > 0:
                prefix = '../' * current_depth
                new_src = prefix + relative_path
            else:
                new_src = relative_path
            
            tag['src'] = new_src
            modified = True
            print(f"  Fixed: {src[:50]}... -> {new_src}")
    
    # Fix inline styles and JavaScript with file:/// URLs
    style_tags = soup.find_all('style')
    for tag in style_tags:
        if tag.string and 'file:///' in tag.string:
            original = tag.string
            fixed = re.sub(r'file:///[^\'"\)]+/offline_snap/', '', original)
            fixed = re.sub(r'file:///[^\'"\)]+/offline_full_archive/', '', fixed)
            if fixed != original:
                tag.string = fixed
                modified = True
                print(f"  Fixed URLs in <style> tag")
    
    script_tags = soup.find_all('script')
    for tag in script_tags:
        if tag.string and 'file:///' in tag.string:
            original = tag.string
            # Replace absolute paths in JavaScript
            fixed = re.sub(r'file:///[^\'"\s]+/offline_snap/', '/', original)
            fixed = re.sub(r'file:///[^\'"\s]+/offline_full_archive/', '/', fixed)
            if fixed != original:
                tag.string = fixed
                modified = True
                print(f"  Fixed URLs in <script> tag")
    
    if modified:
        # Write back the fixed content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(str(soup))
        return True
    
    return False

def main():
    # Determine which directory to process
    if len(sys.argv) > 1:
        archive_dir = Path(sys.argv[1])
    else:
        # Check which directories exist
        if Path('offline_snap').exists():
            archive_dir = Path('offline_snap')
        elif Path('offline_full_archive').exists():
            archive_dir = Path('offline_full_archive')
        else:
            print("❌ No archive directory found (offline_snap or offline_full_archive)")
            sys.exit(1)
    
    if not archive_dir.exists():
        print(f"❌ Directory {archive_dir} does not exist")
        sys.exit(1)
    
    print(f"🔧 Fixing absolute file:/// URLs in {archive_dir}")
    print("=" * 60)
    
    # Find all HTML files
    html_files = list(archive_dir.rglob('*.html'))
    print(f"📁 Found {len(html_files)} HTML files to process")
    
    fixed_count = 0
    for html_file in html_files:
        print(f"\n📄 Processing: {html_file.relative_to(archive_dir)}")
        if fix_absolute_links(html_file, archive_dir):
            fixed_count += 1
    
    print("\n" + "=" * 60)
    print(f"✅ Fixed {fixed_count} files with absolute links")
    print(f"📦 Archive is now portable and can be shared!")
    
    # Also fix any JSON files that might contain absolute paths
    json_files = list(archive_dir.rglob('*.json'))
    if json_files:
        print(f"\n📋 Checking {len(json_files)} JSON files...")
        for json_file in json_files:
            with open(json_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if 'file:///' in content:
                fixed = re.sub(r'file:///[^\'"\s]+/offline_snap/', '/', content)
                fixed = re.sub(r'file:///[^\'"\s]+/offline_full_archive/', '/', fixed)
                
                if fixed != content:
                    with open(json_file, 'w', encoding='utf-8') as f:
                        f.write(fixed)
                    print(f"  Fixed: {json_file.relative_to(archive_dir)}")

if __name__ == "__main__":
    main()