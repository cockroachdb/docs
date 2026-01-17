# Snapshot Script Fixes Required

This document outlines the changes needed in `snapshot_full.py` to produce offline archives that match the expected behavior of the old working archive.

## Summary of Issues Found

During testing, several issues were discovered in the generated archive compared to the old working archive:

1. **Docs Home link** - Points to `/` instead of `index.html`
2. **Version switcher arrows** - Shows multiple arrows instead of none
3. **Version switcher links** - Missing version directory and `.html` extension
4. **Version-switcher visibility** - Was being hidden by CSS and removed by JS
5. **Asset paths** - Some paths were absolute instead of relative

---

## Fix 1: Docs Home URL

### Problem
The sidebar navigation JSON has `"urls": ["/"]` for Docs Home, which doesn't work offline.

### Solution
Replace `"/"` with `"index.html"` in the sidebar nav JSON:

```python
# In the HTML processing function, add:
content = re.sub(
    r'"urls":\s*\[\s*"/"\s*\]',
    '"urls": ["index.html"]',
    content
)
```

---

## Fix 2: Version Switcher Arrows

### Problem
The version switcher shows 2-3 arrows when it should show none (matching the old archive).

### Root Cause
Multiple sources of arrows:
1. `<div class="arrow">` element with `content:url(/docs/images/caret-filled-down-blue.svg)` CSS
2. Navgoco CSS: `.nav li > a > span:after { content: '\25be'; }` adds a down arrow
3. Bootstrap `.arrow::before` pseudo-element

### Solution
Add CSS to hide ALL arrow sources for the version-switcher:

```python
arrow_fix_css = '''
/* Remove ALL arrows from version-switcher to match old archive */
#version-switcher .arrow,
#version-switcher .tier-1 .arrow,
#version-switcher .tier-1 a .arrow {
    display: none !important;
    visibility: hidden !important;
}
/* Remove navgoco's span::after arrows */
#version-switcher .nav li > a > span:after,
#version-switcher .nav li > a > span::after,
#version-switcher li > a > span:after,
#version-switcher li > a > span::after,
#version-switcher .tier-1 > a > span:after,
#version-switcher .tier-1 > a > span::after,
#version-switcher .version-name:after,
#version-switcher .version-name::after {
    content: none !important;
    display: none !important;
}
'''
# Inject before </style></head>
content = re.sub(r'(</style>\s*</head>)', arrow_fix_css + r'\1', content, count=1)
```

---

## Fix 3: Version Switcher Links

### Problem
Version switcher links have incorrect format:
- Missing version directory (e.g., `../why-cockroachdb.html` instead of `../v26.1/why-cockroachdb.html`)
- Missing `.html` extension (e.g., `../v25.4/why-cockroachdb` instead of `../v25.4/why-cockroachdb.html`)
- Wrong relative prefix

### Solution
Process all `version--mobile` and `version--desktop` links to ensure proper format:

```python
def fix_version_link(href_value, file_depth, stable_version, all_versions):
    """Ensure version links have format: ../vXX.X/page.html"""
    prefix = "../" * file_depth if file_depth > 0 else ""

    # Extract version and page from href
    version_match = re.match(r'^(\.\./)*(v\d+\.\d+)/(.+)$', href_value)
    if version_match:
        version = version_match.group(2)
        page = version_match.group(3)
        if not page.endswith('.html'):
            page = page + '.html'
        return f'{prefix}{version}/{page}'
    else:
        # No version directory - add stable version
        clean_href = re.sub(r'^(\.\./)+', '', href_value)
        if not clean_href.endswith('.html'):
            clean_href = clean_href + '.html'
        return f'{prefix}{stable_version}/{clean_href}'

# Apply to all version--mobile and version--desktop links
content = re.sub(
    r'href="([^"]+)"(\s+[^>]*class="version--(?:mobile|desktop)")',
    lambda m: f'href="{fix_version_link(m.group(1))}"' + m.group(2),
    content
)
```

---

## Fix 4: Preserve Version-Switcher Visibility

### Problem
The injected JavaScript removes the version-switcher:
```javascript
$('.version-switcher, #version-switcher, .feedback-widget').remove();
```

And the injected CSS hides it:
```css
.version-switcher, #version-switcher, .feedback-widget { display: none !important; }
```

### Solution
1. **Don't remove version-switcher in JS** - Only remove `.feedback-widget`:
```python
# Change this:
"$('.version-switcher, #version-switcher, .feedback-widget').remove();"
# To this:
"$('.feedback-widget').remove(); // version-switcher preserved"
```

2. **Don't hide version-switcher in CSS** - Remove it from the hide list:
```python
# Change this:
".version-switcher, #version-switcher, .feedback-widget,"
# To this:
".feedback-widget,"
```

---

## Fix 5: Asset Paths

### Problem
Some CSS rules use absolute paths like `/docs/images/caret-filled-down-blue.svg` which don't work offline.

### Solution
Convert absolute paths to relative based on file depth:

```python
def get_file_depth(file_path, archive_root):
    """Calculate depth from archive root"""
    relative = file_path.relative_to(archive_root)
    return len(relative.parts) - 1

# Fix absolute image paths in CSS
depth = get_file_depth(file_path, ARCHIVE_DIR)
img_prefix = "../" * depth if depth > 0 else ""
content = re.sub(
    r'content:\s*url\(/docs/images/([^)]+)\)',
    f'content:url({img_prefix}images/\\1)',
    content
)
```

---

## Fix 6: Clean macOS Artifacts

### Problem
macOS creates `__MACOSX/`, `.DS_Store`, and `._*` files that bloat the archive.

### Solution
Before zipping:
```bash
find complete_test_archive -name "__MACOSX" -type d -exec rm -rf {} +
find complete_test_archive -name "._*" -type f -delete
```

When zipping:
```bash
zip -r archive.zip complete_test_archive -x "*.DS_Store" -x "__MACOSX/*" -x "*/__MACOSX/*" -x "*/._*" -x "._*"
```

---

## Complete Fix Script

A standalone fix script (`fix_version_switcher.py`) was created that applies all these fixes to an existing archive. The key function structure is:

```python
def fix_html_file(file_path):
    content = file_path.read_text(encoding='utf-8')

    # 1. Preserve version-switcher (don't remove via JS)
    content = re.sub(
        r"\$\('\.version-switcher,\s*#version-switcher,\s*\.feedback-widget'\)\.remove\(\);",
        "$('.feedback-widget').remove();",
        content
    )

    # 2. Don't hide version-switcher in CSS
    content = re.sub(
        r'\.version-switcher,\s*#version-switcher,\s*\.feedback-widget,',
        '.feedback-widget,',
        content
    )

    # 3. Fix Docs Home URL
    content = re.sub(
        r'"urls":\s*\[\s*"/"\s*\]',
        '"urls": ["index.html"]',
        content
    )

    # 4. Inject arrow-hiding CSS
    # (see Fix 2 above)

    # 5. Fix version switcher links
    # (see Fix 3 above)

    file_path.write_text(content, encoding='utf-8')
```

---

## Verification Checklist

After generating an archive, verify:

1. [ ] Open `index.html` - page loads correctly
2. [ ] Click "Docs Home" in sidebar - navigates to `index.html`, not directory
3. [ ] Version switcher shows "Version vXX.X" with NO arrows
4. [ ] Click version switcher - dropdown opens with version links
5. [ ] Version links navigate to correct pages (e.g., `../v25.3/page.html`)
6. [ ] Right sidebar "On this page" TOC is visible and populated
7. [ ] Sidebar navigation links work correctly
8. [ ] No broken images or missing assets

---

## Files Modified

- `/Users/eeshan/docs-1/src/current/snapshot_full.py` - Main archive script
- `/Users/eeshan/docs-1/src/current/fix_version_switcher.py` - Post-processing fix script
