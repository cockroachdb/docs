import os

def fix_liquid_syntax(file_content):
    # Fix the assign statement syntax
    fixed_content = file_content.replace('{% assign external = "true"}', '{% assign external = "true" %}')
    return fixed_content

def process_file(filepath):
    # Read the file
    with open(filepath, 'r') as file:
        content = file.read()
    
    # Fix the content
    fixed_content = fix_liquid_syntax(content)
    
    # Write back to the file
    with open(filepath, 'w') as file:
        file.write(fixed_content)

def main():
    filepath = '/Users/eeshan/Documents/docs/src/current/_includes/filter-tabs.md'
    print(f"Processing: {filepath}")
    process_file(filepath)
    print(f"Completed: {filepath}")

if __name__ == "__main__":
    main()