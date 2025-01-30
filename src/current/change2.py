import os
import re

def fix_includes(content):
    """Fix all include statements to use _includes directory"""
    # Pattern to match {% include something %} with optional parameters
    pattern = r'{%\s*include\s+([^"\s]+|"[^"]+")([^%]*?)%}'
    
    def replacement(match):
        include_path = match.group(1).strip('"\'')
        params = match.group(2)  # Preserve any parameters
        
        # Don't modify if already starts with _includes
        if include_path.startswith('_includes/'):
            return match.group(0)
            
        # Special case for version-based includes
        if '{{ page.version.version }}' in include_path:
            # Replace version variable with 25.1
            include_path = include_path.replace('{{ page.version.version }}', '25.1')
            
        # Add _includes prefix
        new_path = f'_includes/{include_path}'
        
        return f'{{% include "{new_path}"{params}%}}'

    return re.sub(pattern, replacement, content)

def process_files(directory_path):
    """Process all markdown and HTML files recursively"""
    count = 0
    for root, _, files in os.walk(directory_path):
        for file in files:
            if file.endswith(('.md', '.html', '.markdown')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    if '{%' in content and 'include' in content:
                        new_content = fix_includes(content)
                        if new_content != content:
                            with open(file_path, 'w', encoding='utf-8') as f:
                                f.write(new_content)
                            print(f"Fixed includes in: {file_path}")
                            count += 1
                
                except Exception as e:
                    print(f"Error processing {file_path}: {str(e)}")
    
    print(f"\nTotal files processed: {count}")

# Run the script
directory_path = '/Users/eeshan/Documents/docs/src/current'
process_files(directory_path)