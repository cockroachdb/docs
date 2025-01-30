import os
import re

def convert_links(content):
    """Convert Jekyll-style links to Eleventy URL filter syntax"""
    pattern = r"{%-?\s*link\s+[\'\"](.*?)[\'\"]?\s*-?%}"
    def replacement(match):
        path = match.group(1)
        return f"{{{{ '{path}' | url }}}}"
    return re.sub(pattern, replacement, content)

def process_directory(directory_path):
    """Process all markdown files recursively"""
    for root, _, files in os.walk(directory_path):
        for file in files:
            if file.endswith(('.md', '.markdown')):
                file_path = os.path.join(root, file)
                #print(f"Processed: {file_path}")
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    if '{%' in content and 'link' in content:
                        new_content = convert_links(content)
                        if new_content != content:
                            print("APT")
                            with open(file_path, 'w', encoding='utf-8') as f:
                                f.write(new_content)
                            print(f"Processed: {file_path}")
                
                except Exception as e:
                    print(f"Error processing {file_path}: {str(e)}")

# Run the script
directory_path = '/Users/eeshan/Documents/docs/src/current'
process_directory(directory_path)