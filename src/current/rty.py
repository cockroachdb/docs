import os

def remove_includes(file_content):
    # Split content into lines
    lines = file_content.splitlines()
    # Keep lines that don't contain {% include
    filtered_lines = [line for line in lines if '{% include' not in line]
    # Join lines back together
    return '\n'.join(filtered_lines)

def process_file(filepath):
    try:
        # Read the file
        with open(filepath, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Remove includes
        modified_content = remove_includes(content)
        
        # Write back to file
        with open(filepath, 'w', encoding='utf-8') as file:
            file.write(modified_content)
            
        print(f"Processed: {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {str(e)}")

def main():
    directory = '/Users/eeshan/Documents/docs/src/current/v25.1'
    
    # Walk through all files in directory
    for root, _, files in os.walk(directory):
        for file in files:
            filepath = os.path.join(root, file)
            if filepath.endswith(('.md', '.html')):  # Process markdown and html files
                process_file(filepath)

if __name__ == "__main__":
    main()