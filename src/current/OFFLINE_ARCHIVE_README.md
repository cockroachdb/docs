# Offline Archive Creator for CockroachDB Documentation

This tool creates a complete offline archive of the CockroachDB documentation that can be viewed locally in a browser without an internet connection.

## Prerequisites

- Python 3.8+
- Required packages: `requests`, `beautifulsoup4`
- Built Jekyll site in `_site/docs/`

```bash
pip install requests beautifulsoup4
```

## Usage

### Basic Usage

Generate the archive directory only:

```bash
python3 create_full_archive.py
```

### Generate Archive with ZIP

Generate the archive and create a distributable ZIP file:

```bash
python3 create_full_archive.py --zip
```

### Custom Options

```bash
# Specify stable version
python3 create_full_archive.py --stable-version v26.1 --zip

# Custom source and output directories
python3 create_full_archive.py --site-dir /path/to/_site/docs --output-dir /path/to/output
```

## Output

| Output | Description |
|--------|-------------|
| `complete_archive/` | Directory containing the full offline site |
| `complete_archive.zip` | ZIP file for distribution (with `--zip` flag) |

## What the Script Does

1. **Copies all content** - All version directories (v23.1 - v26.1), cockroachcloud, releases, advisories, molt
2. **Copies assets** - CSS, JS, images, fonts, sidebar data
3. **Localizes external resources**:
   - Downloads Google Fonts for offline use
   - Replaces CDN jQuery with local copy
   - Downloads navgoco navigation library
4. **Fixes paths for offline viewing**:
   - Converts absolute paths to relative
   - Fixes version switcher links
   - Removes query parameters from image URLs
5. **Applies offline-specific fixes**:
   - Hides search (requires online connection)
   - Hides AI assistant widgets
   - Preserves version switcher functionality
   - Adds archived version banner
6. **Cleans artifacts** - Removes macOS `.DS_Store` and `._*` files

## Included Versions

The archive includes documentation for:
- v23.1, v23.2
- v24.1, v24.2, v24.3
- v25.1, v25.2, v25.3, v25.4
- v26.1
- CockroachDB Cloud
- MOLT migration tools
- Releases and Advisories

## Testing the Archive

1. Run the script:
   ```bash
   python3 create_full_archive.py
   ```

2. Open in browser:
   ```bash
   open complete_archive/index.html
   ```

3. Verify:
   - Sidebar navigation works
   - Version switcher displays (no arrows)
   - Links between pages work
   - Images load correctly
   - No console errors for missing resources

## Archive Size

- Uncompressed: ~4 GB
- Compressed ZIP: ~1.5 GB

## Offline Fixes Applied

The script applies several fixes to make the documentation work offline:

| Fix | Description |
|-----|-------------|
| Home URL | Replaces `/` with `index.html` in sidebar JSON |
| Version arrows | Hides dropdown arrows (non-functional offline) |
| Version links | Converts to relative paths (`../v25.3/page.html`) |
| Version switcher | Preserves visibility (not removed by JS/CSS) |
| Asset paths | Converts absolute `/docs/...` to relative `../...` |
| Google Fonts | Downloads and localizes font files |
| jQuery | Uses local copy instead of CDN |
| macOS artifacts | Removes `.DS_Store` and `._*` files |
