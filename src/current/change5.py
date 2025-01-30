import os
import re

# Function to remove or replace '{% link %}' tags with URLs (for Eleventy migration)
def remove_link_tags(content):
    # Regular expression to find '{% link %}' tags
    link_tag_regex = r"{% link (.+?) %}"

    # Replace '{% link %}' tags with the URL part (removing the tag)
    fixed_content = re.sub(link_tag_regex, r"\1", content)
    
    return fixed_content

# Function to process files in a given directory and subdirectories
def process_files_in_directory(directory):
    # Walk through all files in the directory and subdirectories
    for root, dirs, files in os.walk(directory):
        for file in files:
            # Only process .md files
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                print(f"Attempting to process: {file_path}")  # Debug: Print the file path

                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = f.read()

                    # Remove the link tags in the file content
                    fixed_content = remove_link_tags(data)

                    # If content was modified, save the changes
                    if fixed_content != data:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(fixed_content)
                        print(f"Removed link tag in file: {file_path}")
                    else:
                        print(f"No changes needed in: {file_path}")
                
                except Exception as e:
                    print(f"Error processing file {file_path}: {e}")

# Main script execution
if __name__ == "__main__":
    # Set the path to your Eleventy project directory
    directory_path = '/Users/eeshan/Documents/docs/src/current'
    process_files_in_directory(directory_path)
