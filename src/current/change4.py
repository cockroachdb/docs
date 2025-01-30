import os
import re

def fix_liquid_links(file_content):
    # Dictionary of patterns and their replacements
    patterns = [
        # Pattern 1: {% link v24.2/path/file.md %} -> /docs/v24.2/path/file
        (r'{%\s*link\s+v(\d+\.\d+)/([^%]+?)\s*%}', r'/docs/v\1/\2'),
        
        # Pattern 2: {% link releases/v24.2.md %}#v24-2-0 -> /docs/releases/v24.2#v24-2-0
        (r'{%\s*link\s+releases/v(\d+\.\d+)\.md\s*%}#([\w-]+)', r'/docs/releases/v\1#\2'),
        
        # Pattern 3: Remove .md extensions from links
        (r'(/docs/[^\s)]+)\.md', r'\1')
    ]
    
    # Apply each pattern
    content = file_content
    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content)
    
    return content

def process_file(filepath):
    # Read the file
    with open(filepath, 'r') as file:
        content = file.read()
    
    # Fix the content
    fixed_content = fix_liquid_links(content)
    
    # Write back to the file
    with open(filepath, 'w') as file:
        file.write(fixed_content)
    
    # Print the changes (for verification)
    print("\nModified content:")
    print(fixed_content)

def main():
    filepath = '/Users/eeshan/Documents/docs/src/current/cockroachcloud/advanced-cluster-management.md'
    
    print(f"Processing: {filepath}")
    process_file(filepath)
    print(f"Completed: {filepath}")

if __name__ == "__main__":
    main()