import os
from bs4 import BeautifulSoup

# Directory paths (relative to the script)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCS_DIR = BASE_DIR
SIDEBAR_DIR = os.path.join(BASE_DIR, "_site/docs/_internal")


# Define excluded files and directories from your configuration
EXCLUDED_FILES_AND_DIRS = [
    "index.html", "index.md", "search.html", "404.md",
    "src/current/v23.1/", "v23.1/", "node_modules/",
    "__tests__", "build", "scripts", "vendor/", "_includes/",
    "_site/", "jekyll-algolia-dev/", "jekyll-algolia-dev", "archived",
    "package.json", "package-lock.json",
    "v1.0/", "v1.1/", "v2.0/", "v2.1/",
    "v19.1/", "v19.2/", "v20.1/", "v20.2/", 
    "v21.1/", "v22.1/", "v24.2/", "v23.2/",
    "v21.2/", "v22.2/", "v24.1/", "ci"
]

def is_excluded(path):
    """
    Check if a given path should be excluded based on the exclusion list.
    """
    for excluded in EXCLUDED_FILES_AND_DIRS:
        if excluded.endswith('/'):  # Check for directories
            if path.startswith(excluded):
                return True
        else:  # Check for files
            if path == excluded:
                return True
    return False

def extract_sidebar_urls(sidebar_file):
    """
    Extract URLs from a sidebar HTML file.
    """
    sidebar_urls = []
    with open(sidebar_file, 'r') as f:
        soup = BeautifulSoup(f, 'html.parser')
        for link in soup.find_all('a'):
            href = link.get('href')
            if href:
                # Append only the part after /docs/
                sidebar_urls.append(href.split("/docs/")[-1]) 
    return sidebar_urls

def find_markdown_files(docs_dir):
    """
    Find all Markdown files in the specified directory, excluding certain files and directories.
    """
    markdown_files = []
    for root, _, files in os.walk(docs_dir):
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, docs_dir)

                # Check exclusion
                if not is_excluded(relative_path):
                    markdown_files.append(relative_path)  # Store the relative path
    return markdown_files

def main():
    # Extract sidebar URLs
    sidebar_urls = []
    for sidebar_file in os.listdir(SIDEBAR_DIR):
        if sidebar_file.startswith("sidebar-") and sidebar_file.endswith(".html"):
            sidebar_path = os.path.join(SIDEBAR_DIR, sidebar_file)
            sidebar_urls.extend(extract_sidebar_urls(sidebar_path))

    # Find all Markdown files that should be included after exclusions
    markdown_files = find_markdown_files(DOCS_DIR)

    # Compare Markdown files with sidebar URLs to find missing files
    missing_files = []
    for md_file in markdown_files:
        md_file_url = f"/docs/{md_file[:-3]}.html"  # Convert .md to .html
        if md_file_url.split("/docs/")[-1] not in sidebar_urls:
            missing_files.append(md_file)

    # Print Markdown files that are not included in the sidebar
    print("\n--- Markdown Files Not Included in Sidebar ---")
    for missing in missing_files:
        print(missing)

if __name__ == "__main__":
    main()
