import os
import re

def fix_liquid_links(file_content):
    # Replace {% link v24.2/something.md %} with /docs/v24.2/something
    pattern = r'{%\s*link\s+v(\d+\.\d+)/([^%]+?)\s*%}'
    return re.sub(pattern, r'/docs/v\1/\2', file_content)

def process_file(filepath):
    # Read the file
    with open(filepath, 'r') as file:
        content = file.read()
    
    # Fix the content
    fixed_content = fix_liquid_links(content)
    
    # Write back to the file
    with open(filepath, 'w') as file:
        file.write(fixed_content)

def main():
    directory_path = '/Users/eeshan/Documents/docs/src/current'
    
    # Process all .md files in the directory
    for root, dirs, files in os.walk(directory_path):
        for file in files:
            if file.endswith('.md'):
                filepath = os.path.join(root, file)
                print(f"Processing: {filepath}")
                process_file(filepath)
                print(f"Completed: {filepath}")

if __name__ == "__main__":
    main()