#!/usr/bin/env python3
"""
Test script for cleaning JavaScript sidebar items array in individual HTML pages
"""
import re
import json
from pathlib import Path

# Configuration
JEKYLL_ROOT = Path.cwd()
SITE_ROOT = JEKYLL_ROOT / "_site"
DOCS_ROOT = SITE_ROOT / "docs"
TARGET_VERSION = "v19.2"

def check_file_exists(url):
    """Test if a file exists for a given URL"""
    print(f"      Checking URL: {url}")
    original_url = url
    
    if url.startswith(('http://', 'https://', '#', 'mailto:', 'javascript:')):
        print(f"        -> External/anchor link, keeping: {url}")
        return True
    
    # Normalize URL to file path
    file_url = url.strip()
    
    # Handle root/empty URLs
    if file_url in ['/', '', 'index', 'index.html']:
        print(f"        -> Root URL, keeping: {url}")
        return True
    
    # Remove leading slash and docs prefix
    if file_url.startswith('/docs/'):
        file_url = file_url[6:]
    elif file_url.startswith('docs/'):
        file_url = file_url[5:]
    file_url = file_url.lstrip('/')
    
    # Handle stable -> v19.2
    file_url = file_url.replace('/stable/', f'/{TARGET_VERSION}/')
    file_url = file_url.replace('stable/', f'{TARGET_VERSION}/')
    if file_url == 'stable':
        file_url = TARGET_VERSION
    
    # Convert ${VERSION} placeholder
    file_url = file_url.replace('${VERSION}', TARGET_VERSION)
    
    print(f"        -> Normalized: {original_url} → {file_url}")
    
    # Try multiple file path variations
    possible_paths = [
        file_url,
        file_url + '.html' if file_url and not file_url.endswith('.html') and '.' not in file_url.split('/')[-1] else None,
        file_url + '/index.html' if file_url and not file_url.endswith('/') else None,
        file_url.rstrip('/') + '.html' if file_url.endswith('/') else None
    ]
    
    # Check if any variation exists
    for path in possible_paths:
        if path:
            file_path = DOCS_ROOT / path
            if file_path.exists():
                print(f"        -> ✅ FOUND: {path}")
                return True
    
    print(f"        -> ❌ NOT FOUND: {url}")
    return False

def clean_sidebar_items(items_data):
    """Clean the sidebar items array"""
    removed_urls_count = 0
    
    def clean_item(item, level=0):
        nonlocal removed_urls_count
        """Recursively clean an item"""
        indent = "    " * level
        
        if not isinstance(item, dict):
            return item
        
        title = item.get('title', 'Unknown')
        print(f"{indent}Cleaning: '{title}'")
        
        # Clean URLs if present
        if 'urls' in item and item['urls']:
            original_count = len(item['urls'])
            valid_urls = []
            
            print(f"{indent}  Found {original_count} URLs:")
            for url in item['urls']:
                if check_file_exists(url):
                    valid_urls.append(url)
                else:
                    print(f"{indent}    REMOVING: {url}")
                    removed_urls_count += 1
            
            if valid_urls:
                item['urls'] = valid_urls
                print(f"{indent}  Result: {len(valid_urls)} kept, {original_count - len(valid_urls)} removed")
            else:
                print(f"{indent}  Result: No valid URLs, removing urls key")
                del item['urls']
        
        # Clean child items if present
        if 'items' in item and item['items']:
            original_children = len(item['items'])
            cleaned_items = []
            
            print(f"{indent}  Processing {original_children} child items:")
            for child in item['items']:
                cleaned_child = clean_item(child, level + 1)
                if cleaned_child is not None:
                    cleaned_items.append(cleaned_child)
            
            if cleaned_items:
                item['items'] = cleaned_items
                print(f"{indent}  Children result: {len(cleaned_items)} kept, {original_children - len(cleaned_items)} removed")
            else:
                print(f"{indent}  Children result: No valid children, removing items key")
                del item['items']
        
        # Decide whether to keep this item
        has_urls = 'urls' in item and item['urls']
        has_children = 'items' in item and item['items']
        is_top_level = item.get('is_top_level', False)
        
        if has_urls or has_children or is_top_level:
            print(f"{indent}KEEPING '{title}' (urls={has_urls}, children={has_children}, top_level={is_top_level})")
            return item
        else:
            print(f"{indent}REMOVING '{title}' (no valid content)")
            return None
    
    # Clean the items array
    print(f"  Cleaning {len(items_data)} top-level items")
    cleaned_items = []
    
    for item in items_data:
        cleaned_item = clean_item(item)
        if cleaned_item is not None:
            cleaned_items.append(cleaned_item)
    
    print(f"  Final result: {len(cleaned_items)} sections kept, {len(items_data) - len(cleaned_items)} removed")
    return cleaned_items, removed_urls_count

def js_to_json(js_text):
    """Convert JavaScript object notation to valid JSON"""
    print("    Converting JavaScript to JSON...")
    
    # First pass - handle line by line for basic fixes
    lines = js_text.split('\n')
    fixed_lines = []
    
    for line_num, line in enumerate(lines, 1):
        original_line = line
        
        # Remove comments first
        if '//' in line:
            # Only remove comments that aren't inside quotes
            in_quotes = False
            quote_char = None
            comment_pos = -1
            
            for i, char in enumerate(line):
                if not in_quotes and char in ['"', "'"]:
                    in_quotes = True
                    quote_char = char
                elif in_quotes and char == quote_char and (i == 0 or line[i-1] != '\\'):
                    in_quotes = False
                    quote_char = None
                elif not in_quotes and char == '/' and i < len(line) - 1 and line[i+1] == '/':
                    comment_pos = i
                    break
            
            if comment_pos >= 0:
                line = line[:comment_pos].rstrip()
        
        # Remove function definitions
        line = re.sub(r':\s*function\s*\([^)]*\)\s*\{[^}]*\}', ': null', line)
        
        # Fix unquoted property names ONLY at start of line
        stripped = line.strip()
        if stripped and ':' in stripped and not stripped.startswith('"') and not stripped.startswith('[') and not stripped.startswith('{'):
            match = re.match(r'^(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:\s*)(.*)', line)
            if match:
                indent, prop_name, colon_part, rest = match.groups()
                line = f'{indent}"{prop_name}"{colon_part}{rest}'
        
        # Remove trailing commas before } or ]
        line = re.sub(r',(\s*[}\]])', r'\1', line)
        
        if line != original_line:
            print(f"      Modified line {line_num}: {original_line.strip()[:60]}...")
            print(f"                            -> {line.strip()[:60]}...")
        
        fixed_lines.append(line)
    
    result = '\n'.join(fixed_lines)
    
    # Second pass - safer character-by-character processing for quotes
    final_result = []
    in_double_quotes = False
    in_single_quotes = False
    i = 0
    
    while i < len(result):
        char = result[i]
        
        if char == '"' and not in_single_quotes:
            in_double_quotes = not in_double_quotes
            final_result.append(char)
        elif char == "'" and not in_double_quotes:
            if in_single_quotes:
                # End of single-quoted string - convert to double quote
                final_result.append('"')
                in_single_quotes = False
            else:
                # Start of single-quoted string - convert to double quote
                final_result.append('"')
                in_single_quotes = True
        elif char == '\\' and (in_single_quotes or in_double_quotes):
            # Handle escape sequences
            final_result.append(char)
            if i + 1 < len(result):
                i += 1
                final_result.append(result[i])
        else:
            final_result.append(char)
        
        i += 1
    
    result = ''.join(final_result)
    
    # Handle undefined
    result = re.sub(r'\bundefined\b', 'null', result)
    
    print(f"    Converted to JSON ({len(result)} chars)")
    return result

def find_matching_bracket(text, start_pos):
    """Find the matching closing bracket for an opening bracket at start_pos"""
    if start_pos >= len(text) or text[start_pos] != '[':
        return -1
    
    count = 0
    in_string = False
    escape_next = False
    quote_char = None
    
    for i in range(start_pos, len(text)):
        char = text[i]
        
        if escape_next:
            escape_next = False
            continue
            
        if char == '\\':
            escape_next = True
            continue
            
        if not in_string:
            if char in ['"', "'"]:
                in_string = True
                quote_char = char
            elif char == '[':
                count += 1
            elif char == ']':
                count -= 1
                if count == 0:
                    return i
        else:
            if char == quote_char:
                in_string = False
                quote_char = None
    
    return -1

def clean_sidebar_in_html_page(html_content, file_path):
    """Clean the JavaScript sidebar items array in an HTML page"""
    print(f"\n=== CLEANING SIDEBAR JS IN: {file_path} ===")
    
    # Look for the sidebar JavaScript object
    sidebar_start = html_content.find('const sidebar = {')
    if sidebar_start == -1:
        print("  No 'const sidebar = {' found in this page")
        return html_content, 0
    
    # Find the items: part
    items_start = html_content.find('items:', sidebar_start)
    if items_start == -1:
        print("  No 'items:' found in sidebar object")
        return html_content, 0
    
    # Find the opening bracket of the items array
    array_start = html_content.find('[', items_start)
    if array_start == -1:
        print("  No opening '[' found after 'items:'")
        return html_content, 0
    
    # Find the matching closing bracket
    array_end = find_matching_bracket(html_content, array_start)
    if array_end == -1:
        print("  Could not find matching closing ']' for items array")
        # Try to find just the next ]; or }; as fallback
        fallback_end = html_content.find('];', array_start)
        if fallback_end != -1:
            array_end = fallback_end
            print(f"  Using fallback end position: {array_end}")
        else:
            return html_content, 0
    
    # Extract the items array
    items_str = html_content[array_start:array_end + 1]
    print(f"  ✅ Extracted items array ({len(items_str)} chars)")
    
    try:
        # Convert JavaScript to JSON
        json_str = js_to_json(items_str)
        items_data = json.loads(json_str)
        print(f"  ✅ Parsed {len(items_data)} top-level sidebar items")
        
        # Clean the items
        cleaned_items, removed_urls_count = clean_sidebar_items(items_data)
        
        # Convert back to JSON string
        cleaned_json = json.dumps(cleaned_items, indent=2)
        
        # Replace in the original HTML
        new_html = html_content[:array_start] + cleaned_json + html_content[array_end + 1:]
        
        removed_sections = len(items_data) - len(cleaned_items)
        print(f"  SUCCESS: Cleaned sidebar JavaScript - {removed_sections} sections removed, {removed_urls_count} URLs removed")
        
        return new_html, removed_urls_count
        
    except json.JSONDecodeError as e:
        print(f"  ERROR: JSON parsing failed: {e}")
        
        # Extract error position information
        error_pos = getattr(e, 'pos', 0)
        error_line = getattr(e, 'lineno', 1)
        error_col = getattr(e, 'colno', 1)
        
        print(f"  Error at line {error_line}, column {error_col}, position {error_pos}")
        
        # Find the problematic section around the error
        lines = json_str.split('\n')
        start_line = max(0, error_line - 5)  # 5 lines before
        end_line = min(len(lines), error_line + 5)  # 5 lines after
        
        problematic_section = []
        for i in range(start_line, end_line):
            line_num = i + 1
            line_content = lines[i] if i < len(lines) else ""
            marker = " >>> ERROR LINE <<<" if line_num == error_line else ""
            problematic_section.append(f"{line_num:3d}: {line_content}{marker}")
        
        # Save only the problematic section
        debug_file = JEKYLL_ROOT / f"debug_{str(file_path).replace('/', '_')}.txt"
        with open(debug_file, 'w') as f:
            f.write(f"JSON PARSING ERROR in {file_path}\n")
            f.write(f"Error: {e}\n")
            f.write(f"Position: line {error_line}, column {error_col}, char {error_pos}\n\n")
            f.write("PROBLEMATIC SECTION (±5 lines around error):\n")
            f.write("=" * 50 + "\n")
            f.write('\n'.join(problematic_section))
            f.write("\n" + "=" * 50 + "\n")
            
            # Also show the exact character that failed
            if error_pos < len(json_str):
                f.write(f"\nCharacter at error position: '{json_str[error_pos]}'\n")
                f.write(f"Context around error: '{json_str[max(0, error_pos-20):error_pos+20]}'\n")
            
            # Save the full converted JSON for debugging
            f.write("\n" + "=" * 50 + "\n")
            f.write("FULL CONVERTED JSON:\n")
            f.write(json_str)
        
        print(f"  💾 Saved error details to: {debug_file}")
        return html_content, 0
        
    except Exception as e:
        print(f"  ERROR: {e}")
        import traceback
        traceback.print_exc()
        return html_content, 0

def main():
    print("🔍 SIDEBAR JAVASCRIPT CLEANING TEST")
    print("=" * 60)
    
    print(f"Looking for HTML files in: {DOCS_ROOT}")
    
    if not DOCS_ROOT.exists():
        print("❌ Docs root not found!")
        return
    
    # Find sample HTML files to test
    sample_files = []
    
    # Look for some common files that likely have sidebar
    common_files = [
        f"{TARGET_VERSION}/index.html",
        f"{TARGET_VERSION}/install-cockroachdb-linux.html", 
        "cockroachcloud/quickstart.html",
        "releases/index.html",
        f"{TARGET_VERSION}/sql-statements.html"
    ]
    
    for file_path in common_files:
        full_path = DOCS_ROOT / file_path
        if full_path.exists():
            sample_files.append(full_path)
    
    # If no common files found, grab first few HTML files
    if not sample_files:
        sample_files = list(DOCS_ROOT.rglob("*.html"))[:5]
    
    if not sample_files:
        print("❌ No HTML files found!")
        return
    
    print(f"✅ Found {len(sample_files)} sample files to test:")
    for f in sample_files[:5]:  # Limit to first 5 for testing
        print(f"  - {f.relative_to(DOCS_ROOT)}")
    
    total_removed = 0
    
    for html_file in sample_files[:5]:  # Test first 5 files only
        try:
            html_content = html_file.read_text(encoding="utf-8")
            cleaned_html, removed_count = clean_sidebar_in_html_page(html_content, html_file.relative_to(DOCS_ROOT))
            total_removed += removed_count
            
            # Save cleaned version for inspection
            if removed_count > 0:
                output_file = JEKYLL_ROOT / f"cleaned_{html_file.name}"
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(cleaned_html)
                print(f"  💾 Saved cleaned version to: {output_file}")
                
        except Exception as e:
            print(f"  ❌ Error processing {html_file}: {e}")
            import traceback
            traceback.print_exc()
    
    print(f"\n📊 SUMMARY:")
    print(f"  Total files processed: {len(sample_files[:5])}")
    print(f"  Total broken URLs removed: {total_removed}")
    
    if total_removed > 0:
        print(f"\n✅ Found and cleaned sidebar JavaScript - {total_removed} broken URLs removed!")
        print(f"This logic is ready to integrate into the main archiver.")
    else:
        print(f"\n🤔 No broken sidebar links found. Either:")
        print(f"  1. All sidebar links are valid, or")
        print(f"  2. The file checking logic needs adjustment")

if __name__ == "__main__":
    main()