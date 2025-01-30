import os
import re

def fix_includes(content):
    """Fix liquid includes by hardcoding version to 25.1"""
    # Pattern to match {% include {{ page.version.version }}/path/file.html %}
    pattern = r'{%\s*include\s*{{\s*page\.version\.version\s*}}/([^%]+?)\s*%}'
    
    def replacement(match):
        # Get the path part after the version
        path = match.group(1).strip()
        # Create new include with hardcoded version 25.1
        return f"{{% include 25.1/{path} %}}"
    
    return re.sub(pattern, replacement, content)

def process_files(directory_path):
    """Process all HTML and MD files recursively"""
    count = 0
    for root, _, files in os.walk(directory_path):
        for file in files:
            if file.endswith(('.html', '.md')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    if '{% include {{' in content:
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