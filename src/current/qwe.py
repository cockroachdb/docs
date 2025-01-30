import os

def remove_sidebar_data_references(root_dir):
    # Traverse all files in the directory recursively
    for subdir, dirs, files in os.walk(root_dir):
        for file in files:
            file_path = os.path.join(subdir, file)
            
            # Skip non-text files (like images, etc.)
            if not file.endswith('.html') and not file.endswith('.md') and not file.endswith('.js'):
                continue

            with open(file_path, 'r') as f:
                lines = f.readlines()

            # Open the file again in write mode to overwrite it
            with open(file_path, 'w') as f:
                for line in lines:
                    # Remove lines containing sidebar_data (you can adjust this to remove other references)
                    if 'sidebar_data' not in line:
                        f.write(line)

            print(f"Updated: {file_path}")

if __name__ == '__main__':
    # Set the root directory for your project (adjust this path as needed)
    root_directory = '/Users/eeshan/Documents/docs/src/current'
    
    # Call the function to remove references to sidebar_data
    remove_sidebar_data_references(root_directory)
    print("Finished removing references to sidebar_data.")
