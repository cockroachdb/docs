# CockroachDB Offline Documentation Archive Creation Guide

This guide explains how to create offline documentation archives for specific CockroachDB versions.

## Prerequisites

Before creating archives, ensure you have:

1. **Jekyll Build Directory**: `_site/` directory with built documentation
   - Run Jekyll build if not present: `bundle exec jekyll build`

2. **Python 3**: Required for all scripts

3. **Supporting Scripts**: All scripts listed in the "Required Scripts" section below

4. **Disk Space**: Each archive is 100-200MB, ensure adequate space

## Quick Start

### Create Archives for Multiple Versions

```bash
# Create archives for versions v20.1 through v22.2
python3 create_all_archives_fixed.py
```

This will create archives for the default versions: v20.2, v21.1, v21.2, v22.1, v22.2

### Create Archive for a Single Version

```bash
# Create archive for a specific version
python3 create_single_archive.py v23.1
```

## The 14-Step Archive Creation Process

Each archive goes through the following steps:

1. **Create base archive** - `snapshot_relative.py`
2. **Apply navigation fixes** - `fix_navigation_quick.py`
3. **Fix version placeholders** - Dynamic script
4. **Remove non-target sidebars** - Shell command
5. **Clean target sidebar** - Python logic
6. **Fix JavaScript sidebar** - `fix_js_sidebar_final.py`
7. **Fix remaining references** - `fix_remaining_v25_refs.py`
8. **Create advisories directory** - Shell command
9. **Copy advisories JSON** - Shell command
10. **Fix incomplete sidebars** - `fix_incomplete_sidebars.py`
11. **Make navigation dynamic** - `make_navigation_dynamic_v2.py`
12. **Fix root navigation** - `fix_root_navigation.py`
13. **Fix broken sidebar links** - `fix_broken_sidebar_links.py`
14. **Fix final broken links** - `fix_final_broken_links.py`

## Required Scripts

### Main Scripts
- **`create_all_archives_fixed.py`** - Creates multiple version archives with all fixes
- **`create_single_archive.py`** - Creates a single version archive
- **`make_navigation_dynamic_v2.py`** - Makes navigation work with any folder name (version-aware)

### Supporting Scripts (14-step process)
- **`snapshot_relative.py`** - Creates the initial archive structure
- **`fix_navigation_quick.py`** - Applies initial navigation fixes
- **`fix_js_sidebar_final.py`** - Fixes JavaScript sidebar functionality
- **`fix_remaining_v25_refs.py`** - Removes references to newer versions
- **`fix_incomplete_sidebars.py`** - Completes sidebar HTML structure
- **`fix_root_navigation.py`** - Fixes navigation for root-level files
- **`fix_broken_sidebar_links.py`** - Repairs broken links in sidebars
- **`fix_final_broken_links.py`** - Final pass to fix any remaining broken links

## Common Issues and Solutions

### Issue 1: Navigation Links Go to System Paths
**Symptom**: Links resolve to `file:///Users/username/Documents/index.html` instead of staying in archive

**Cause**: The `make_navigation_dynamic.py` script has a hardcoded version (v19.2) in the pattern

**Solution**: Use `make_navigation_dynamic_v2.py` which accepts the target version as a parameter

### Issue 2: Sidebar Shows Newer Versions
**Symptom**: Archive for v20.1 shows links to v25.x in sidebar

**Cause**: Sidebar cleaning step didn't remove all newer version references

**Solution**: The script automatically removes references to versions newer than the target

### Issue 3: Archive Doesn't Work When Renamed
**Symptom**: Navigation breaks when archive folder is renamed from `offline_snap`

**Cause**: Hardcoded folder name in navigation JavaScript

**Solution**: `make_navigation_dynamic_v2.py` makes the navigation detect any folder name

### Issue 4: JavaScript Syntax Errors
**Symptom**: Browser console shows syntax errors, navigation completely broken

**Cause**: Missing arguments in JavaScript `replace()` calls

**Solution**: The scripts automatically fix these syntax errors during creation

## Archive Structure

Each archive contains:
```
offline_snap/
├── _internal/
│   └── sidebar-vX.Y.html      # Version-specific sidebar
├── v[version]/                 # Version-specific documentation
├── releases/                   # Release notes
├── advisories/                 # Security advisories
├── cockroachcloud/            # Cloud documentation
├── molt/                      # MOLT documentation
└── index.html                 # Main entry point
```

## Testing Archives

1. **Extract the archive**:
   ```bash
   unzip cockroachdb-docs-v20.1-offline.zip
   ```

2. **Open in browser**:
   ```bash
   open offline_snap/index.html
   ```

3. **Test navigation**:
   - Click "Docs Home" - should stay within archive
   - Click version-specific links - should navigate correctly
   - Check that sidebar shows only appropriate versions

## Version Support

The scripts support creating archives for any CockroachDB version. Common versions:
- v2.1, v19.2, v20.1, v20.2
- v21.1, v21.2
- v22.1, v22.2
- v23.1, v23.2
- v24.1, v24.2, v24.3
- v25.1, v25.2, v25.3, v25.4
- v26.1

## Advanced Usage

### Customizing the Archive Creation

Edit `create_all_archives_fixed.py` to:
- Change which versions are created (modify the `versions` list)
- Adjust the cleaning logic for sidebars
- Add additional fix steps

### Manual Navigation Fix

If you need to fix navigation in an existing archive:

```bash
# Extract archive
unzip cockroachdb-docs-vX.Y-offline.zip

# Apply navigation fix with correct version
python3 make_navigation_dynamic_v2.py offline_snap vX.Y

# Re-create archive
zip -r cockroachdb-docs-vX.Y-offline.zip offline_snap/
```

## Troubleshooting

### Scripts Not Found
Ensure all supporting scripts are in the same directory as the main scripts.

### Jekyll Build Missing
Run `bundle exec jekyll build` to create the `_site` directory.

### Out of Disk Space
Each archive is 100-200MB. The creation process also needs temporary space.

### Navigation Still Broken After Fixes
Check browser console for JavaScript errors. The issue is likely a syntax error that needs fixing.

## Notes

- Archives grow in size with newer versions due to more documentation
- The creation process takes ~2-3 minutes per version
- Archives are self-contained and work offline
- Navigation auto-detects the archive folder name for portability