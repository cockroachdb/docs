# IBM Escrow Archive - Operating Runbook

## Overview

IBM Escrow requires a quarterly zip of the CockroachDB documentation delivered within 14 days of each new version release. The deliverable is `cockroachdb-docs.zip` containing a `complete_test_archive/` directory with all supported doc versions, viewable offline in a browser.

## Prerequisites

- Python 3.12+ with `beautifulsoup4` and `requests` installed
- The Jekyll site must be built (`_site/docs/` exists with the new version)
- Internet access (script downloads Google Fonts for offline use; falls back to system fonts if offline)
- ~2 GB free disk space

## Quick Start

```bash
cd /path/to/docs/src/current

# 1. Fetch the archive script
git fetch origin feat/offline-archive-scripts
git show "origin/feat/offline-archive-scripts:src/current/create_full_archive.py" > create_full_archive.py

# 2. Run it with the new version
python3 create_full_archive.py --add-version v26.2 --stable v26.2 --zip

# 3. Deliverable is ready
ls -lh cockroachdb-docs.zip
```

That's it. The script handles everything: copying all versions, fixing navigation for offline use, downloading fonts, cleaning macOS artifacts, and producing the final zip.

## CLI Reference

```
python3 create_full_archive.py [OPTIONS]

Options:
  --add-version VERSION   Add a doc version to the archive. Repeatable.
                          Example: --add-version v26.2
  --stable VERSION        Set the stable/default version.
                          Defaults to the highest version in the list.
  --zip                   Produce cockroachdb-docs.zip (required for delivery).
  --site-dir PATH         Path to _site/docs/ if non-standard.
  --output-dir PATH       Output directory name (default: complete_test_archive).
```

### Examples

```bash
# Standard quarterly delivery (add new version, set as stable)
python3 create_full_archive.py --add-version v26.2 --stable v26.2 --zip

# Add multiple new versions at once
python3 create_full_archive.py --add-version v26.2 --add-version v26.3 --stable v26.3 --zip

# Rebuild with all defaults (no new version)
python3 create_full_archive.py --zip
```

## Step-by-Step Walkthrough

### 1. Ensure the site is built

The script reads from `src/current/_site/docs/`. Confirm the new version directory exists:

```bash
ls _site/docs/v26.2/ | head -5
```

If not built, run `make build` or `jekyll build` from the repo root first.

### 2. Fetch the archive script

The script lives on the `feat/offline-archive-scripts` branch:

```bash
git fetch origin feat/offline-archive-scripts
git show "origin/feat/offline-archive-scripts:src/current/create_full_archive.py" > create_full_archive.py
```

### 3. Run the archive creator

```bash
python3 create_full_archive.py --add-version v26.2 --stable v26.2 --zip
```

The script runs these steps automatically:
1. Creates `complete_test_archive/` directory
2. Copies asset directories (css, js, images, fonts, _internal)
3. Copies all version directories (v23.1 through the new version)
4. Copies content directories (cockroachcloud, releases, advisories, molt, stable)
5. Copies top-level HTML files
6. Downloads jQuery and navgoco for offline navigation
7. Downloads and localizes Google Fonts
8. Processes all HTML files (rewrites URLs for offline use)
9. Adds "archived version" banner to index.html
10. Cleans macOS artifacts (__MACOSX, .DS_Store, ._ files)
11. Creates `cockroachdb-docs.zip` excluding macOS artifacts
12. Verifies 0 __MACOSX entries in the zip

### 4. Verify the archive

```bash
# Quick check: no macOS artifacts
unzip -l cockroachdb-docs.zip | grep -c __MACOSX  # should be 0

# Open in browser
mkdir -p /tmp/verify-archive
unzip -q cockroachdb-docs.zip -d /tmp/verify-archive
open /tmp/verify-archive/complete_test_archive/index.html
```

Browser verification checklist:
- [ ] Home page loads with sidebar and archived banner
- [ ] Sidebar navigation expands/collapses
- [ ] New version pages load (e.g., v26.2/install-cockroachdb.html)
- [ ] Older version pages load (e.g., v24.3/install-cockroachdb.html)
- [ ] CSS, fonts, and images render correctly
- [ ] No search bar or AI widgets visible (they are online-only)
- [ ] Console (Cmd+Option+J) shows no 404 errors for archive resources

Expected benign console errors (not issues):
- `file: URLs are treated as unique security origins` -- standard browser security for local files
- `"[object Object]" is not valid JSON` -- navgoco cookie state, sidebar still works
- `Failed to load resource: net::ERR_INVALID_URL` -- external resource stripped for offline
- `Cannot read properties of null (reading 'error')` -- HubSpot form loader, irrelevant offline

### 5. Deliver

Upload `cockroachdb-docs.zip` to the escrow delivery location.

### 6. Clean up

```bash
rm -f create_full_archive.py
rm -rf complete_test_archive/
rm -rf /tmp/verify-archive/
```

## Archive Structure

```
cockroachdb-docs.zip
  complete_test_archive/
    index.html              # Home page with archived banner
    404.html
    search.html
    css/                    # Stylesheets + google-fonts.css
    js/                     # jQuery, navgoco, site JS
    fonts/                  # Localized Google Fonts (Poppins, Source Sans/Code Pro)
    images/                 # All site images
    _internal/              # Sidebar HTML files per version
    cockroachcloud/         # CockroachDB Cloud docs
    releases/               # Release notes
    advisories/             # Technical advisories
    molt/                   # MOLT migration docs
    stable/                 # Symlink target (= latest stable version)
    v23.1/                  # Versioned docs
    v23.2/
    ...
    v26.2/                  # Latest version
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ModuleNotFoundError: bs4` | `pip3 install beautifulsoup4 requests` |
| `_site/docs/ not found` | Run `make build` or `jekyll build` first |
| Script fails with Python 3.14 syntax errors | Use Python 3.12 or 3.13 |
| Fonts fallback to system fonts | Check internet connectivity; archive still works |
| Zip is too small (< 1 GB) | Verify all version dirs exist in `_site/docs/` |

## Version History

| Delivery Date | Stable Version | Versions Included | Size |
|---------------|---------------|-------------------|------|
| 2026-05-22 | v26.2 | v23.1 -- v26.2 (11 versions) | 1.7 GB |
