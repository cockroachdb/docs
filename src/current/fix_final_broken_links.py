#!/usr/bin/env python3
"""
Final cleanup - remove or redirect links to pages that don't exist in v19.2
"""
import re
from pathlib import Path

def fix_non_existent_links(html_content, archive_path):
    """Remove or redirect links to non-existent pages"""
    fixed_content = html_content
    changes_made = []
    
    # Map of non-existent pages to best alternatives in v19.2
    redirect_map = {
        'v19.2/example-apps.html': 'v19.2/build-an-app-with-cockroachdb.html',
        'v19.2/kubernetes-overview.html': 'v19.2/orchestrate-cockroachdb-with-kubernetes.html',
        'v19.2/demo-cockroachdb-resilience.html': 'v19.2/demo-fault-tolerance-and-recovery.html',
        'v19.2/sso-sql.html': 'v19.2/authentication.html',
        'v19.2/security-reference/transport-layer-security.html': 'v19.2/security.html',
        'v19.2/hashicorp-integration.html': 'v19.2/orchestration.html',
        'v19.2/cockroachdb-feature-availability.html': 'v19.2/enterprise-licensing.html'
    }
    
    for old_url, new_url in redirect_map.items():
        # Check if the new URL actually exists
        new_path = archive_path / new_url.lstrip('/')
        if new_path.exists():
            # Replace in both quoted and non-quoted contexts
            patterns = [
                f'"{old_url}"',
                f'"/{old_url}"',
                f'"{old_url.replace("v19.2/", "/v19.2/")}"'
            ]
            
            for pattern in patterns:
                if pattern in fixed_content:
                    replacement = f'"{new_url}"' if not pattern.startswith('"/') else f'"/{new_url}"'
                    fixed_content = fixed_content.replace(pattern, replacement)
                    changes_made.append(f"{old_url} -> {new_url}")
    
    # Remove any remaining links to non-existent v19.2 pages by checking existence
    url_pattern = r'"(/?)v19\.2/([^"#]+)(#[^"]+)?"'
    
    def check_and_fix(match):
        slash = match.group(1)
        page = match.group(2)
        anchor = match.group(3) or ''
        
        # Check if file exists
        check_path = archive_path / f"v19.2/{page}"
        if not check_path.exists() and page.endswith('.html'):
            # Try to find a similar page
            base_name = page.replace('.html', '')
            
            # Common replacements
            if 'example' in base_name or 'demo' in base_name:
                changes_made.append(f"Redirected {page} to index")
                return f'"{slash}v19.2/index.html"'
            elif 'security' in base_name:
                changes_made.append(f"Redirected {page} to security.html")
                return f'"{slash}v19.2/security.html"'
            elif 'kubernetes' in base_name or 'k8s' in base_name:
                changes_made.append(f"Redirected {page} to orchestrate-cockroachdb-with-kubernetes.html")
                return f'"{slash}v19.2/orchestrate-cockroachdb-with-kubernetes.html"'
            
        return match.group(0)  # Keep original if exists or can't fix
    
    fixed_content = re.sub(url_pattern, check_and_fix, fixed_content)
    
    return fixed_content, changes_made

def main():
    archive_folders = ['my_dynamic_archive', 'test_portable_docs', 'offline_snap']
    archive_path = None
    
    for folder in archive_folders:
        if Path(folder).exists():
            archive_path = Path(folder)
            break
    
    if not archive_path:
        print("❌ No archive folder found")
        return
    
    print(f"🔧 Final cleanup of broken links in {archive_path}")
    
    html_files = list(archive_path.rglob("*.html"))
    total_fixed = 0
    all_changes = []
    
    for i, html_file in enumerate(html_files):
        if i % 100 == 0 and i > 0:
            print(f"Progress: {i}/{len(html_files)} files")
        
        try:
            content = html_file.read_text(encoding='utf-8')
            fixed_content, changes = fix_non_existent_links(content, archive_path)
            
            if fixed_content != content:
                html_file.write_text(fixed_content, encoding='utf-8')
                total_fixed += 1
                all_changes.extend(changes)
        except Exception as e:
            print(f"Error: {e}")
    
    print(f"\n✅ Fixed {total_fixed} files")
    
    if all_changes:
        print(f"\n📝 Redirects applied:")
        unique = list(set(all_changes))
        for change in unique[:10]:
            print(f"   • {change}")

if __name__ == "__main__":
    main()