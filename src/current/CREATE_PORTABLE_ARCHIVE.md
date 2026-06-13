# Creating a Portable CockroachDB Documentation Archive

This guide shows how to create a fully portable, offline documentation archive for any CockroachDB version that works with **any folder name** and has **working navigation**.

## What You'll Get

- **Portable Archive**: Works when renamed to any folder name
- **Dynamic Navigation**: Automatically detects archive location
- **Comprehensive Sidebars**: Full navigation on every page
- **Fully Offline**: No internet connection required
- **Version-Specific**: Contains only docs relevant to the target version

## Prerequisites

- Jekyll site built and ready: `bundle exec jekyll build`
- Python 3.x installed
- BeautifulSoup4: `pip install beautifulsoup4`
- Requests: `pip install requests`

## Quick Start

### Create Archive for a Single Version

```bash
# Navigate to the docs source directory
cd src/current

# Create archive for any version (e.g., v23.1, v24.2, v25.4)
python3 create_single_archive.py v23.1
```

This will create `cockroachdb-docs-v23.1-offline.zip` containing the complete offline documentation.

### Create Archives for Multiple Versions

```bash
# Create archives for multiple versions (default: v20.2, v21.1, v21.2, v22.1, v22.2)
python3 create_all_archives_fixed.py
```

## The 14-Step Archive Creation Process

The `create_single_archive.py` script automates the following steps:

1. **Create base archive** - `snapshot_relative.py`
2. **Apply navigation fixes** - `fix_navigation_quick.py`
3. **Fix version placeholders** - Dynamic script for target version
4. **Remove non-target sidebars** - Keep only target version sidebar
5. **Clean target sidebar** - Remove references to newer versions
6. **Fix JavaScript sidebar** - `fix_js_sidebar_final.py`
7. **Fix remaining references** - `fix_remaining_v25_refs.py`
8. **Create advisories directory** - For security advisories JSON
9. **Copy advisories JSON** - From `_site/docs/advisories/internal/`
10. **Fix incomplete sidebars** - `fix_incomplete_sidebars.py`
11. **Make navigation dynamic** - `make_navigation_dynamic_v2.py`
12. **Fix root navigation** - `fix_root_navigation.py`
13. **Fix broken sidebar links** - `fix_broken_sidebar_links.py`
14. **Fix final broken links** - `fix_final_broken_links.py`

## Output Structure

```
offline_snap/  (or any name you choose)
├── index.html                   # Root landing page
├── {version}/                   # Version-specific documentation
│   ├── index.html
│   └── [documentation pages]
├── cockroachcloud/              # CockroachCloud docs
├── advisories/                  # Security advisories
├── releases/                    # Release notes
├── molt/                        # MOLT migration tool docs
├── css/                         # Stylesheets
├── js/                          # JavaScript
├── images/                      # Images
│   └── {version}/               # Version-specific images
├── fonts/                       # Localized Google Fonts
└── _internal/                   # Internal assets
    └── sidebar-{version}.html   # Navigation sidebar
```

## Required Scripts

### Main Scripts

| Script | Purpose |
|--------|---------|
| `create_single_archive.py` | Creates a single version archive (recommended) |
| `create_all_archives_fixed.py` | Creates archives for multiple versions |
| `snapshot_relative.py` | Core archiver that creates the base structure |

### Supporting Scripts (14-step process)

| Script | Purpose |
|--------|---------|
| `fix_navigation_quick.py` | Basic navigation fixes |
| `fix_js_sidebar_final.py` | Remove newer version references from JavaScript |
| `fix_remaining_v25_refs.py` | Final URL cleanup |
| `fix_incomplete_sidebars.py` | Ensures all pages have comprehensive sidebar |
| `make_navigation_dynamic_v2.py` | Makes navigation work with any folder name |
| `fix_root_navigation.py` | Fixes navigation from root index.html |
| `fix_broken_sidebar_links.py` | Removes broken links from sidebars |
| `fix_final_broken_links.py` | Final pass for remaining broken links |

## Features

### Dynamic Folder Detection

The archive can be renamed to any folder name and navigation will continue to work:

```javascript
// The JavaScript automatically detects the archive folder:
// Works with: my-docs/, cockroachdb-archive/, custom_name/, etc.

// Method 1: Look for _internal folder pattern
var internalMatch = currentPath.match(/\/([^\/]+)\/_internal\//);

// Method 2: Look for known directory structure
var archiveMatch = currentPath.match(/\/([^\/]+)\/(v\d+\.\d+|cockroachcloud|releases)/);
```

### Cross-Directory Navigation

- Navigate between version docs, cockroachcloud, advisories, and releases
- Proper relative path calculation from any page
- Sidebar works identically on all pages

## Usage Instructions

### Opening the Archive

```bash
# Extract the archive
unzip cockroachdb-docs-v23.1-offline.zip

# Open in browser (from within archive directory)
cd offline_snap
open index.html

# Or use full path
open /path/to/offline_snap/index.html
```

### Sharing the Archive

1. Share the zip file
2. User can extract and rename to anything: `my-docs/`, `cockroach-archive/`, etc.
3. Navigation will work automatically with the new name

## Troubleshooting

### Jekyll Build Missing

```bash
# Ensure _site directory exists
bundle exec jekyll build
```

### Navigation Issues

- **Problem**: Links go to wrong location
- **Solution**: Open `index.html` from within the archive directory

### Folder Renaming Issues

- **Problem**: Navigation breaks after renaming
- **Solution**: The `make_navigation_dynamic_v2.py` script should have been run during creation

### Missing Sidebars

- **Problem**: Some pages have minimal sidebars
- **Solution**: Run `fix_incomplete_sidebars.py` on the archive

## Version Support

The scripts support creating archives for any CockroachDB version:

- v2.1, v19.1, v19.2, v20.1, v20.2
- v21.1, v21.2
- v22.1, v22.2
- v23.1, v23.2
- v24.1, v24.2, v24.3
- v25.1, v25.2, v25.3, v25.4
- v26.1

## Notes

- Archives grow in size with newer versions due to more documentation
- Each archive is typically 100-200MB
- Archives are self-contained and work completely offline
- Navigation auto-detects the archive folder name for portability
