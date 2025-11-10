#!/usr/bin/env python3
"""
Fix broken sidebar links - removes v25.3 references and handles query parameters
"""
import re
from pathlib import Path

def fix_sidebar_links(html_content, archive_path):
    """Fix broken links in sidebar JavaScript"""
    fixed_content = html_content
    changes_made = []
    
    # 1. Remove or redirect v25.3 links to v19.2 equivalents
    v25_pattern = r'"(/?)v25\.3/([^"]+)"'
    def replace_v25(match):
        changes_made.append(f"v25.3/{match.group(2)} -> v19.2/{match.group(2)}")
        # Check if v19.2 equivalent exists
        v19_file = archive_path / f"v19.2/{match.group(2)}"
        if v19_file.exists():
            return f'"{match.group(1)}v19.2/{match.group(2)}"'
        else:
            # Try without .html
            base_name = match.group(2).replace('.html', '')
            v19_file_alt = archive_path / f"v19.2/{base_name}.html"
            if v19_file_alt.exists():
                return f'"{match.group(1)}v19.2/{base_name}.html"'
            # Default to v19.2 anyway (better than broken v25.3)
            return f'"{match.group(1)}v19.2/{match.group(2)}"'
    
    fixed_content = re.sub(v25_pattern, replace_v25, fixed_content)
    
    # 2. Handle URLs with query parameters - strip them for offline use
    query_pattern = r'"([^"]+\.html)\?[^"]*"'
    def strip_query(match):
        url = match.group(1)
        # Special case for terraform provisioning - redirect to a related page
        if 'provision-a-cluster-with-terraform' in url:
            changes_made.append(f"{match.group(0)} -> cockroachcloud/quickstart.html")
            return '"/cockroachcloud/quickstart.html"'
        changes_made.append(f"Stripped query params from {url}")
        return f'"{url}"'
    
    fixed_content = re.sub(query_pattern, strip_query, fixed_content)
    
    # 3. Fix any remaining v24.x or v23.x references
    other_versions_pattern = r'"(/?)v2[345]\.\d+/([^"]+)"'
    def replace_other_versions(match):
        changes_made.append(f"v2x.x/{match.group(2)} -> v19.2/{match.group(2)}")
        return f'"{match.group(1)}v19.2/{match.group(2)}"'
    
    fixed_content = re.sub(other_versions_pattern, replace_other_versions, fixed_content)
    
    return fixed_content, changes_made

def process_archive(archive_path):
    """Process all HTML files in the archive"""
    archive_path = Path(archive_path)
    
    if not archive_path.exists():
        print(f"❌ Archive {archive_path} not found")
        return
    
    print(f"🔧 Fixing broken sidebar links in {archive_path}")
    
    html_files = list(archive_path.rglob("*.html"))
    total_fixed = 0
    all_changes = []
    
    for i, html_file in enumerate(html_files):
        if i % 100 == 0 and i > 0:
            print(f"Progress: {i}/{len(html_files)} files")
        
        try:
            content = html_file.read_text(encoding='utf-8')
            fixed_content, changes = fix_sidebar_links(content, archive_path)
            
            if fixed_content != content:
                html_file.write_text(fixed_content, encoding='utf-8')
                total_fixed += 1
                all_changes.extend(changes)
        except Exception as e:
            print(f"Error processing {html_file}: {e}")
    
    print(f"\n✅ Fixed {total_fixed} files")
    
    if all_changes:
        print(f"\n📝 Changes made:")
        # Show unique changes
        unique_changes = list(set(all_changes))
        for change in unique_changes[:20]:  # Show first 20 unique changes
            print(f"   • {change}")
        if len(unique_changes) > 20:
            print(f"   ... and {len(unique_changes) - 20} more unique changes")

def main():
    # Find archive
    archive_folders = ['my_dynamic_archive', 'test_portable_docs', 'offline_snap']
    
    for folder in archive_folders:
        if Path(folder).exists():
            process_archive(folder)
            break
    else:
        print("❌ No archive folder found")

if __name__ == "__main__":
    main()