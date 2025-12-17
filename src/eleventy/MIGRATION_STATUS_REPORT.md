# Eleventy Migration Status Report

**Date:** December 17, 2024
**Phase:** Initial Build Validation Complete
**Status:** Build Successful with Warnings

---

## Executive Summary

The CockroachDB documentation site has been successfully migrated from Jekyll to Eleventy (11ty) at a foundational level. The build completes without errors, generating 1,011 HTML pages in 22 seconds. However, there are 333 warnings related to unresolved includes that require investigation.

---

## Build Metrics

| Metric | Value |
|--------|-------|
| **Build Status** | ✅ Success |
| **Files Generated** | 1,011 HTML pages |
| **Assets Copied** | 7,627 files |
| **Build Time (cold)** | ~24 seconds (first build, populating cache) |
| **Build Time (cached)** | ~5 seconds (subsequent builds) |
| **Eleventy Version** | 3.1.2 |

**Note:** Remote content (SVG diagrams, code samples) is cached using `@11ty/eleventy-fetch` with a 1-day cache duration. Cache stored in `.cache/` directory.

---

## Migration Completed

### Phase 1: Project Setup & Compatibility Layer ✅

Created a full Jekyll-compatible Eleventy configuration:

**Filters Implemented:**
| Filter | Purpose | Status |
|--------|---------|--------|
| `relative_url` | Prepend base path to URLs | ✅ Working |
| `absolute_url` | Generate full site URLs | ✅ Working |
| `scssify` | SCSS compilation (placeholder) | ⚠️ Placeholder only |
| `where` | Filter arrays by property | ✅ Working |
| `where_exp` | Filter with expressions | ✅ Working |
| `sort_by` | Sort arrays by property | ✅ Working |
| `group_by` | Group arrays by property | ✅ Working |
| `jsonify` | Convert to JSON | ✅ Built-in |

**Shortcodes Implemented:**
| Shortcode | Purpose | Status |
|-----------|---------|--------|
| `{% link "path" %}` | Jekyll link tag replacement | ✅ Working |
| `{% dynamic_include var, "/path" %}` | Version-based dynamic includes | ✅ Working |
| `{% remote_include url %}` | Fetch remote content | ⚠️ Partial (see issues) |
| `{% include_file var %}` | Include by variable path | ✅ Working |
| `{% youtube id %}` | YouTube embed | ✅ Working |
| `{% new_in version %}` | Version badge | ✅ Working |

### Phase 2: Content Migration ✅

**Files Migrated:**
- `_data/` - All YAML, JSON, CSV data files
- `_includes/` - All partial templates
- `_layouts/` - All page layouts
- `content/` - Stable version (v26.1) documentation pages

**Syntax Conversions Applied:**
| From (Jekyll) | To (Eleventy) | Files Affected |
|---------------|---------------|----------------|
| `{% include file %}` | `{% include "file" %}` | ~2,000+ |
| `{% include_cached file %}` | `{% include "file" %}` | 38 |
| `{% else if %}` | `{% elsif %}` | 10 |
| `{% include {{ var }}/path %}` | `{% dynamic_include var, "/path" %}` | ~50 |
| `{% remote_include URL %}` | `{% remote_include "URL" %}` | ~200 |

---

## Outstanding Issues

### Issue 1: Unresolved Remote Include URLs - MOSTLY RESOLVED

**Previous State:** 217 unresolved URLs
**Current State:** ~4 remaining issues

**Solution Implemented:**
1. Created `release_info.js` data file that processes `versions.csv` and `releases.yml` to provide version-specific release information (including `crdb_branch_name`)
2. Updated `remote_include` shortcode to resolve Liquid variables manually by accessing the LiquidJS context
3. Added fallback to use stable version's release_info for pages not in versioned directories

**Remaining Issues (4):**
- 3 pages still have unresolved `{{ page.release_info.crdb_branch_name }}` (likely edge cases)
- 1 page uses `{{ latest_operator_version }}` which needs separate handling

**Key Technical Detail:**
- v26.1's `crdb_branch_name` is `release-25.4` (from versions.csv)
- Remote URLs now resolve to: `https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-25.4/grammar_svg/*.html`

### Issue 2: Missing Dynamic Include Files (116 warnings)

**Symptom:**
```
dynamic_include: File not found: /Users/kikia/development/docs/src/eleventy/content/_includes/v26.1/sql/combine-alter-table-commands.md
```

**Possible Causes:**
1. Files genuinely don't exist in the v26.1 includes directory
2. Version variable not resolving correctly (related to Issue 1)
3. Files exist in a different version directory

**Files Most Frequently Missing:**
- `v26.1/admin-ui/*.md`
- `v26.1/sql/diagrams/*.html`
- `v26.1/misc/*.md`
- `v26.1/known-limitations/*.md`

### Issue 3: Placeholder Implementations

| Component | Status | Notes |
|-----------|--------|-------|
| `scssify` filter | Placeholder | Returns content as-is, no SCSS compilation |
| CSS `@import` | Not processed | SASS needs to be compiled separately |
| Meta tags | Partially broken | `og:url` showing malformed URLs |

---

## File Structure Created

```
src/eleventy/
├── .eleventy.js                    # Main configuration (395 lines)
├── package.json                    # Node dependencies
├── lib/
│   ├── plugins/
│   │   └── versions.js             # Version injection plugin
│   └── scripts/
│       ├── migrate-content.sh      # Content copy script
│       ├── migrate-links.js        # Link syntax migration
│       ├── migrate-includes.js     # Include syntax migration
│       └── migrate-remote-includes.js
├── content/                        # Migrated content
│   ├── *.md                        # ~800 top-level pages
│   ├── _data/                      # Data files
│   ├── _includes/                  # Partial templates
│   ├── _layouts/                   # Page layouts
│   ├── images/                     # Static images
│   ├── js/                         # JavaScript files
│   ├── css/                        # Stylesheets
│   └── v26.1/                      # Versioned content
└── _site/                          # Build output
```

---

## Next Steps

### Immediate Priority: Variable Resolution

1. **Investigate Jekyll's `remote_include` implementation**
   - Check `_plugins/` for custom remote include logic
   - Understand how `page.release_info.crdb_branch_name` is populated
   - Determine if pre-processing occurs before include execution

2. **Fix variable resolution order**
   - Either pre-process URLs before shortcode execution
   - Or use Eleventy's computed data to resolve variables first

3. **Validate include file paths**
   - Confirm which files genuinely don't exist
   - Check if version variable resolution would fix paths

### Secondary Priority: Production Readiness

1. Add SASS/SCSS compilation pipeline
2. Fix meta tag generation in layouts
3. Add HTML minification for production
4. Performance comparison with Jekyll build

---

## Commands Reference

```bash
# Run build
cd src/eleventy && npm run build

# Run dev server
cd src/eleventy && npm run dev

# Check build output
ls -la src/eleventy/_site/

# Count warnings
npm run build 2>&1 | grep -c "dynamic_include: File not found"
npm run build 2>&1 | grep -c "remote_include: Skipping"
```

---

## Appendix: Sample Warning Output

```
remote_include: Skipping unresolved URL: https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_table.html
dynamic_include: File not found: /Users/kikia/development/docs/src/eleventy/content/_includes/v26.1/sql/combine-alter-table-commands.md
include_file: No file path provided
[11ty] Copied 7627 Wrote 1011 files in 22.00 seconds (21.8ms each, v3.1.2)
```

---

*Report generated: December 17, 2024*
