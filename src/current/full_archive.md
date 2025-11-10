# 📚 Complete Multi-Version CockroachDB Documentation Archive Creation Guide

## 🎯 Overview

This guide details how to create a complete, portable offline documentation archive containing **ALL versions** of CockroachDB documentation with working navigation, sidebar, and version switchers.

## 📊 Archive Specifications

### Available Content
- **15 Version Directories**: v19.2, v20.2, v21.1, v21.2, v22.1, v22.2, v23.1, v23.2, v24.1, v24.2, v24.3, v25.1, v25.2, v25.3
- **Additional Sections**: stable, cockroachcloud, releases, advisories, molt
- **Total HTML Files**: 7,533 pages
- **Sidebar Data**: 20 version-specific navigation files
- **Estimated Archive Size**: ~3.5GB (vs 50MB for v19.2 only)

### Version Directory Sizes
| Version | Size | Notes |
|---------|------|-------|
| v19.2 | 122MB | Oldest supported version |
| v20.2 | 176MB | +44% larger than v19.2 |
| v21.1 | 185MB | +51% larger than v19.2 |
| v21.2 | 200MB | +64% larger than v19.2 |
| v22.1 | 218MB | +79% larger than v19.2 |
| v22.2 | 217MB | +78% larger than v19.2 |
| v23.1 | 229MB | +88% larger than v19.2 |
| v23.2 | 244MB | +100% larger than v19.2 |
| v24.1 | 245MB | +101% larger than v19.2 |
| v24.2 | 248MB | +103% larger than v19.2 |
| v24.3 | 258MB | +111% larger than v19.2 |
| v25.1 | 261MB | +114% larger than v19.2 |
| v25.2 | 273MB | +124% larger than v19.2 |
| v25.3 | 275MB | +125% larger than v19.2 |
| stable | 275MB | Same as v25.3 (stable=latest) |

### Additional Sections
- **cockroachcloud/**: 37MB (Cloud documentation)
- **releases/**: 20MB (Release notes)
- **advisories/**: 28MB (Security advisories)  
- **molt/**: 4.6MB (Migration tool docs)

## 🔧 Required Modifications to Existing System

### Current System Limitations
The existing `snapshot_relative.py` script is hardcoded for v19.2 only:

```python
TARGET_VERSION = "v19.2"  # ❌ Single version only
SIDEBAR_HTML_PATH = DOCS_ROOT / "_internal" / "sidebar-v19.2.html"  # ❌ v19.2 specific
COMMON_PAGES = [
    f"{TARGET_VERSION}/*.html"  # ❌ Only includes v19.2
]
```

### Key Modifications Required

#### 1. Multi-Version Configuration
```python
# Replace single TARGET_VERSION with ALL_VERSIONS list
ALL_VERSIONS = [
    "v19.2", "v20.2", "v21.1", "v21.2", "v22.1", "v22.2", 
    "v23.1", "v23.2", "v24.1", "v24.2", "v24.3", "v25.1", "v25.2", "v25.3"
]
LATEST_VERSION = "v25.3"  # For stable mapping
SIDEBAR_HTML_PATHS = {
    version: DOCS_ROOT / "_internal" / f"sidebar-{version}.html" 
    for version in ALL_VERSIONS
}
```

#### 2. Enhanced COMMON_PAGES
```python
COMMON_PAGES = [
    "index.html",
    "cockroachcloud/*.html",
    "releases/*.html", 
    "advisories/*.html",
    "molt/*.html",
    "stable/*.html",  # Include stable
    *[f"{version}/*.html" for version in ALL_VERSIONS]  # ALL versions
]
```

#### 3. Multi-Version URL Processing
Current system converts everything to v19.2. New system needs to:
- Preserve original version paths
- Handle cross-version navigation 
- Map stable → v25.3 (latest)
- Support version switcher navigation

#### 4. Version-Specific Sidebar Processing
Each version needs its own sidebar:
```python
def process_version_sidebars(self):
    """Process sidebar for each version"""
    for version in ALL_VERSIONS:
        sidebar_path = DOCS_ROOT / "_internal" / f"sidebar-{version}.html"
        if sidebar_path.exists():
            # Process version-specific sidebar
            self.process_sidebar_for_version(version, sidebar_path)
```

## 📋 Detailed Implementation Plan

### Phase 1: Modify Base Archive Script (snapshot_relative.py)

#### 1.1 Update Configuration Section (Lines 20-37)
```python
# BEFORE (v19.2 only)
TARGET_VERSION = "v19.2"
COMMON_PAGES = [f"{TARGET_VERSION}/*.html"]

# AFTER (All versions)
ALL_VERSIONS = ["v19.2", "v20.2", ..., "v25.3"]
LATEST_VERSION = "v25.3"
COMMON_PAGES = [*[f"{v}/*.html" for v in ALL_VERSIONS], "stable/*.html", ...]
```

#### 1.2 Modify OfflineArchiver Class (Lines 49-57)
```python
def __init__(self):
    self.version_sidebars = {}  # Store sidebar for each version
    self.processed_versions = set()
    self.version_file_counts = {}
    # ... existing attributes
```

#### 1.3 Update File Discovery Logic (Lines ~600-700)
Current script filters out non-v19.2 directories:
```python
# BEFORE - Skip other versions
if (rel_path.parts[0].startswith('v') and 
    rel_path.parts[0] != TARGET_VERSION):
    continue

# AFTER - Include all versions
if (rel_path.parts[0].startswith('v') and 
    rel_path.parts[0] not in ALL_VERSIONS):
    continue
```

#### 1.4 Multi-Version URL Processing
Update all URL conversion logic to handle multiple versions:
```python
def process_urls_multi_version(self, html, current_version):
    """Process URLs for multi-version archive"""
    # Map stable to latest version
    if 'stable' in html:
        html = html.replace('/stable/', f'/{LATEST_VERSION}/')
    
    # Preserve version-specific paths
    # Handle cross-version navigation
    # Support relative path calculation between versions
```

### Phase 2: Update All Fix Scripts (9 Scripts Total)

#### 2.1 fix_navigation_quick.py
```python
# BEFORE
TARGET_VERSION = "v19.2"

# AFTER  
ALL_VERSIONS = ["v19.2", "v20.2", ..., "v25.3"]
for version in ALL_VERSIONS:
    process_version_navigation(version)
```

#### 2.2 fix_version_placeholders.py  
```python
# BEFORE - Replace ${VERSION} with v19.2
content = content.replace('${VERSION}', 'v19.2')

# AFTER - Replace ${VERSION} with current page's version
def fix_placeholders_by_version(file_path, content):
    current_version = detect_version_from_path(file_path)
    return content.replace('${VERSION}', current_version)
```

#### 2.3 fix_sidebar_v19_2.py → fix_all_version_sidebars.py
```python
# BEFORE - Clean only v19.2 sidebar
sidebar_file = "sidebar-v19.2.html"

# AFTER - Clean all version sidebars
SIDEBAR_FILES = [f"sidebar-{v}.html" for v in ALL_VERSIONS]
for sidebar_file in SIDEBAR_FILES:
    clean_version_sidebar(sidebar_file)
```

#### 2.4 fix_js_sidebar_final.py
```python
# BEFORE - Remove v25.1+ references only
remove_pattern = r'v25\.[1-9]+'

# AFTER - Clean JS for each version appropriately
def clean_js_for_version(content, version):
    # Remove references to versions newer than current
    # Keep references to older versions for proper navigation
```

#### 2.5 fix_incomplete_sidebars.py
```python
# BEFORE - Use single comprehensive sidebar
comprehensive_sidebar = extract_sidebar_from_index()

# AFTER - Use version-appropriate sidebars
def fix_sidebars_multi_version():
    for version in ALL_VERSIONS:
        comprehensive_sidebar = extract_sidebar_for_version(version)
        fix_pages_for_version(version, comprehensive_sidebar)
```

#### 2.6 make_navigation_dynamic.py
```python
# BEFORE - Dynamic navigation for v19.2 archive
archive_detection = detect_v19_2_archive()

# AFTER - Dynamic navigation for multi-version archive
archive_detection = detect_multi_version_archive()
version_switching = enable_cross_version_navigation()
```

### Phase 3: Enhanced Version Switcher Implementation

#### 3.1 Complete Version List (20 versions total)
```javascript
const ALL_VERSIONS = [
    {id: "stable", name: "v25.3.0 (Stable)", path: "stable"},
    {id: "v25.3", name: "v25.3.0", path: "v25.3"},
    {id: "v25.2", name: "v25.2.0", path: "v25.2"},
    // ... all 15+ versions
    {id: "v1.0", name: "v1.0", path: "v1.0"}
];
```

#### 3.2 Cross-Version Navigation Logic
```javascript
function navigateToVersion(targetVersion) {
    var currentPath = window.location.pathname;
    var currentVersion = detectCurrentVersion(currentPath);
    var pageName = extractPageName(currentPath);
    
    // Build new path: /{targetVersion}/{pageName}
    var newPath = buildVersionPath(targetVersion, pageName);
    window.location.href = newPath;
}
```

#### 3.3 Version-Aware Sidebar Loading
```javascript
function loadSidebarForVersion(version) {
    // Load sidebar-{version}.html
    // Initialize navgoco for that version
    // Highlight current page within version
}
```

### Phase 4: File Structure & Organization

#### 4.1 Expected Output Structure
```
multi_version_archive/
├── index.html                    # Root landing page
├── v19.2/                        # 122MB, ~500 pages
│   ├── index.html
│   ├── backup.html
│   └── [498+ other pages]
├── v20.2/                        # 176MB, ~550 pages
├── v21.1/                        # 185MB, ~580 pages
├── v21.2/                        # 200MB, ~600 pages
├── v22.1/                        # 218MB, ~650 pages
├── v22.2/                        # 217MB, ~650 pages
├── v23.1/                        # 229MB, ~700 pages
├── v23.2/                        # 244MB, ~720 pages
├── v24.1/                        # 245MB, ~730 pages
├── v24.2/                        # 248MB, ~740 pages
├── v24.3/                        # 258MB, ~750 pages
├── v25.1/                        # 261MB, ~760 pages
├── v25.2/                        # 273MB, ~780 pages
├── v25.3/                        # 275MB, ~800 pages
├── stable/                       # 275MB, same as v25.3
├── cockroachcloud/              # 37MB, ~150 pages
├── releases/                    # 20MB, ~80 pages
├── advisories/                  # 28MB, ~100 pages
├── molt/                        # 4.6MB, ~20 pages
├── css/                         # Shared stylesheets
├── js/                          # Shared JavaScript
├── images/                      # Shared images
├── fonts/                       # Shared fonts
└── _internal/                   # Internal assets
    ├── sidebar-v19.2.html       # Version-specific sidebars
    ├── sidebar-v20.2.html
    ├── sidebar-v21.1.html
    └── [sidebar-{version}.html for all versions]
```

#### 4.2 Asset Optimization Strategy
- **Shared Assets**: Single copy of CSS, JS, images, fonts
- **Version-Specific Assets**: Only copy unique assets per version
- **Deduplication**: Remove duplicate files across versions
- **Compression**: Optimize images and minify CSS/JS

### Phase 5: Navigation & Cross-Version Features

#### 5.1 Enhanced Version Switcher
- **Complete dropdown**: All 15+ versions visible
- **Current page detection**: Automatically highlight current version
- **Cross-version navigation**: Navigate to same page in different version
- **Fallback handling**: Redirect to closest available page if exact page doesn't exist

#### 5.2 Version-Specific Sidebar Navigation
Each version gets its own navigation structure:
- **v19.2 sidebar**: Original structure from sidebar-data-v19.2.json
- **v25.3 sidebar**: Latest structure with new features
- **Version-appropriate links**: Links only to pages that exist in that version
- **Accordion behavior**: navgoco plugin working for all versions

#### 5.3 Cross-Version Link Handling
```javascript
function handleCrossVersionLinks() {
    // Detect when user clicks link to different version
    // Check if target page exists in that version
    // If not, redirect to version index or closest equivalent
    // Update sidebar to match target version
}
```

## 🚀 Implementation Steps

### Step 1: Prepare Environment
```bash
cd /Users/eeshan/Desktop/docs/src/current

# Ensure Jekyll site is built
bundle exec jekyll build

# Verify all versions exist
ls _site/docs/v*/ | wc -l  # Should show 15+ directories
```

### Step 2: Create Modified Scripts

#### 2.1 Create snapshot_all_versions.py
Based on `snapshot_relative.py` but modified for all versions:
```python
#!/usr/bin/env python3
"""
Complete Multi-Version Archive Creator
Based on snapshot_relative.py but includes ALL versions
"""

# Configuration for all versions
ALL_VERSIONS = ["v19.2", "v20.2", "v21.1", "v21.2", "v22.1", "v22.2", 
                "v23.1", "v23.2", "v24.1", "v24.2", "v24.3", "v25.1", "v25.2", "v25.3"]
LATEST_VERSION = "v25.3"
OUTPUT_ROOT = JEKYLL_ROOT / "multi_version_archive"

# Include all versions in common pages
COMMON_PAGES = [
    "index.html",
    "cockroachcloud/*.html",
    "releases/*.html",
    "advisories/*.html", 
    "molt/*.html",
    "stable/*.html",
    *[f"{version}/*.html" for version in ALL_VERSIONS]
]
```

#### 2.2 Create fix_all_versions.py
Multi-version equivalent of the 9 fix scripts:
```python
#!/usr/bin/env python3
"""
Apply all fixes to multi-version archive
Combines and adapts all 9 fix scripts for multiple versions
"""

def fix_version_placeholders_all():
    """Replace ${VERSION} with appropriate version for each directory"""
    for version in ALL_VERSIONS:
        version_dir = OUTPUT_ROOT / version
        for html_file in version_dir.glob("**/*.html"):
            # Replace ${VERSION} with the current directory's version
            
def fix_navigation_all_versions():
    """Fix navigation for all versions"""
    
def fix_sidebars_all_versions():
    """Ensure each version has its appropriate sidebar"""
    
def make_all_navigation_dynamic():
    """Enable dynamic navigation for multi-version archive"""
```

#### 2.3 Create enhanced_version_switcher.py
```python
#!/usr/bin/env python3
"""
Add enhanced version switcher to all pages
Supports navigation between all 15+ versions
"""

VERSION_SWITCHER_HTML = '''
<div id="version-switcher">
    <ul class="nav">
        <li class="tier-1">
            <a href="#" role="button" aria-expanded="false">
                Version <span class="version-name" id="current-version-display">v25.3.0 (Stable)</span>
                <div class="arrow"></div>
            </a>
            <ul class="list-unstyled" style="display: none">
                <!-- All 15+ versions dynamically populated -->
            </ul>
        </li>
    </ul>
</div>
'''

def add_version_switcher_to_all_pages():
    """Add working version switcher to every page in archive"""
```

### Step 3: Enhanced Navigation System

#### 3.1 Dynamic Version Detection
```javascript
function detectCurrentVersion() {
    var path = window.location.pathname;
    
    // Check for version patterns
    var versionMatch = path.match(/\/(v\d+\.\d+)\//);
    if (versionMatch) return versionMatch[1];
    
    // Check for stable
    if (path.includes('/stable/')) return 'stable';
    
    // Check for cockroachcloud, releases, etc
    if (path.includes('/cockroachcloud/')) return 'cloud';
    
    return 'stable'; // Default
}
```

#### 3.2 Cross-Version Page Mapping
```javascript
function findPageInVersion(targetVersion, currentPageName) {
    // Common pages that exist in all versions
    var commonPages = ['index.html', 'backup.html', 'restore.html', ...];
    
    // If current page exists in target version, use it
    // Otherwise, redirect to version index
    
    return targetVersion + '/' + (commonPages.includes(currentPageName) ? currentPageName : 'index.html');
}
```

#### 3.3 Version-Specific Sidebar Loading
```javascript
function loadSidebarForCurrentVersion() {
    var version = detectCurrentVersion();
    var sidebarUrl = '_internal/sidebar-' + version + '.html';
    
    // Load and inject appropriate sidebar
    // Initialize navgoco for that version's structure
}
```

### Step 4: Performance Optimizations

#### 4.1 Asset Deduplication
```python
def deduplicate_assets():
    """Remove duplicate assets across versions"""
    # CSS files: Keep only unique stylesheets
    # JS files: Deduplicate identical JavaScript
    # Images: Remove duplicate images
    # Fonts: Single copy of font files
```

#### 4.2 Lazy Loading Implementation
```javascript
// Load version-specific content only when needed
function lazyLoadVersion(version) {
    if (!loadedVersions.includes(version)) {
        loadVersionSidebar(version);
        loadedVersions.push(version);
    }
}
```

#### 4.3 Compression Strategy
```python
def optimize_archive():
    """Optimize final archive for size"""
    # Minify CSS and JavaScript
    # Compress images where possible
    # Remove development files and comments
    # Optimize font loading
```

### Step 5: Testing & Verification

#### 5.1 Multi-Version Navigation Testing
```python
def test_multi_version_navigation():
    """Test navigation between all versions"""
    test_cases = [
        # Within same version
        ("v19.2/backup.html", "v19.2/restore.html"),
        # Cross-version (same page)
        ("v19.2/backup.html", "v25.3/backup.html"),  
        # Cross-version (different page)
        ("v19.2/index.html", "v25.3/index.html"),
        # To cockroachcloud from version
        ("v19.2/backup.html", "cockroachcloud/quickstart.html"),
        # From cockroachcloud to version
        ("cockroachcloud/quickstart.html", "v25.3/backup.html")
    ]
```

#### 5.2 Sidebar Verification
```python
def verify_all_version_sidebars():
    """Verify each version has working sidebar"""
    for version in ALL_VERSIONS:
        # Check sidebar loads correctly
        # Verify navgoco initialization
        # Test accordion expand/collapse
        # Verify current page highlighting
```

#### 5.3 Performance Testing
```bash
# Archive size verification
du -sh multi_version_archive/
# Expected: ~3.5GB

# File count verification  
find multi_version_archive/ -name "*.html" | wc -l
# Expected: 7,533 HTML files

# Navigation testing
python3 test_all_versions_navigation.py
# Expected: >99% success rate across all versions
```

## 🛠️ Complete Command Sequence

### Option 1: Automated (Recommended)
```bash
# Step 1: Create the modified scripts
python3 create_multi_version_scripts.py

# Step 2: Run complete multi-version archive creation
python3 create_multi_version_archive.py

# Step 3: Verify the archive
python3 verify_multi_version_archive.py
```

### Option 2: Manual Step-by-Step
```bash
# Step 1: Create base archive with all versions
python3 snapshot_all_versions.py

# Step 2: Apply version-specific fixes
python3 fix_navigation_all_versions.py
python3 fix_version_placeholders_all.py  
python3 fix_all_version_sidebars.py
python3 fix_js_all_versions.py
python3 fix_remaining_refs_all.py

# Step 3: Copy all version assets
mkdir -p multi_version_archive/_internal
cp _site/docs/_internal/sidebar-v*.html multi_version_archive/_internal/
cp -r _site/docs/advisories/internal multi_version_archive/advisories/

# Step 4: Ensure comprehensive sidebars for all
python3 fix_incomplete_sidebars_all_versions.py

# Step 5: Make navigation dynamic for all versions
python3 make_all_navigation_dynamic.py multi_version_archive

# Step 6: Add enhanced version switcher
python3 add_enhanced_version_switcher.py

# Step 7: Final optimizations
python3 optimize_multi_version_archive.py
```

## 🎯 Expected Results

### Archive Statistics
- **Total Size**: ~3.5GB (vs 50MB for v19.2 only)
- **HTML Files**: 7,533 pages across all versions
- **Working Navigation**: >99% success rate
- **Version Switcher**: Complete dropdown with 15+ versions
- **Cross-Version Links**: Working navigation between versions

### User Experience
- **Landing Page**: Choose any version to start browsing
- **Version Switcher**: Dropdown on every page to switch versions
- **Sidebar Navigation**: Version-appropriate sidebar on every page
- **Search**: Local search within current version (if implemented)
- **Completely Offline**: No internet required after creation

### Performance Features
- **Lazy Loading**: Version content loaded as needed
- **Asset Sharing**: Common CSS/JS shared between versions
- **Optimized Images**: Compressed where possible
- **Fast Navigation**: Minimal load times between pages

## 🔍 Quality Assurance

### Automated Testing
1. **Link Verification**: Test all 7,533+ pages for broken links
2. **Sidebar Testing**: Verify navigation works in all versions
3. **Version Switcher**: Test switching between all versions
4. **Cross-Version Navigation**: Test navigation between versions
5. **Performance Testing**: Verify load times are acceptable

### Manual Testing Checklist
- [ ] Open archive in browser from index.html
- [ ] Test navigation within v19.2 (original working version)
- [ ] Test navigation within v25.3 (latest version)  
- [ ] Test version switcher dropdown functionality
- [ ] Test cross-version navigation (v19.2 → v25.3)
- [ ] Test sidebar accordion behavior in multiple versions
- [ ] Test navigation to/from cockroachcloud, releases, advisories
- [ ] Verify all images and assets load correctly
- [ ] Test with different browser types (Chrome, Firefox, Safari)

## 🎉 Success Criteria

The multi-version archive is complete when:
- ✅ All 15+ versions have working navigation
- ✅ Version switcher works on every page
- ✅ Cross-version navigation preserves page context when possible
- ✅ Each version has appropriate sidebar content  
- ✅ Archive is fully portable (works when renamed/moved)
- ✅ >99% of navigation links work correctly
- ✅ Archive size is reasonable (~3.5GB for complete docs)
- ✅ Performance is acceptable (fast page loads)

This creates the ultimate CockroachDB documentation archive with complete version coverage and professional navigation experience!