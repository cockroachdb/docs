# Jekyll to Eleventy (11ty) Migration Plan

## Executive Summary

This document outlines the migration strategy for converting the CockroachDB documentation site from Jekyll 4.3.4 to Eleventy (11ty). The migration is non-trivial due to extensive use of Jekyll-specific features, custom Ruby plugins, and ~131K uses of the `{% link %}` tag.

**Estimated Effort:** Medium-Large
**Risk Level:** Medium (can be done incrementally)

---

## Table of Contents

1. [Current Architecture](#current-architecture)
2. [Migration Blockers](#migration-blockers)
3. [Phased Migration Plan](#phased-migration-plan)
4. [Phase 1: Project Setup & Compatibility Layer](#phase-1-project-setup--compatibility-layer)
5. [Phase 2: Data & Includes Migration](#phase-2-data--includes-migration)
6. [Phase 3: Versioning System](#phase-3-versioning-system)
7. [Phase 4: Markdown Processing](#phase-4-markdown-processing)
8. [Phase 5: Content Migration](#phase-5-content-migration)
9. [Phase 6: Build & Deploy](#phase-6-build--deploy)
10. [Rollback Strategy](#rollback-strategy)

---

## Current Architecture

### Jekyll Configuration

| Component | Current Setup |
|-----------|---------------|
| Jekyll Version | 4.3.4 |
| Markdown Parser | Redcarpet (custom plugin) |
| Syntax Highlighting | Rouge |
| CSS Preprocessor | SASS (compressed) |
| Search | Algolia |

### Directory Structure

```
src/current/
├── _config_base.yml          # Base configuration
├── _config_cockroachdb.yml   # Production overrides
├── _data/                    # YAML, JSON, CSV data files
│   ├── releases.yml
│   ├── versions.csv
│   └── v*/metrics/           # Version-specific data
├── _includes/                # Partials and components
│   ├── cockroachcloud/       # Cloud-specific includes
│   └── v*/                   # Version-specific includes
├── _layouts/                 # Page templates
│   ├── default.html
│   ├── page.html
│   └── homepage.html
├── _plugins/                 # Custom Ruby plugins
│   ├── redcarpet_markdown.rb
│   ├── versions.rb
│   ├── rss_data.rb
│   └── versions/
├── v1.0/ - v26.1/           # Versioned documentation
├── cockroachcloud/          # Cloud documentation
├── releases/                # Release notes
└── molt/                    # Migration tool docs
```

### Custom Ruby Plugins

#### 1. `redcarpet_markdown.rb`
Custom markdown renderer with:
- Rouge syntax highlighting
- `markdown="1"` attribute support for nested markdown
- Custom code block wrapper with language classes

#### 2. `versions/` (generator.rb, version.rb, etc.)
Complex versioning system that:
- Injects `page.version`, `page.release_info`, `page.versions` into every page
- Creates symlinks for `stable` and `dev` versions
- Powers the version switcher dropdown
- Sets `page.sidebar_data` and `page.canonical`

#### 3. `rss_data.rb`
Parses XML files from `_data/` into site data objects.

#### 4. `sidebar_htmltest.rb`
HTML validation for sidebar content.

---

## Migration Blockers

### Critical Issues

| Issue | Occurrences | Severity | Resolution |
|-------|-------------|----------|------------|
| `{% link %}` tag | ~131,354 | **CRITICAL** | Custom shortcode + bulk regex |
| `page.version.version` | ~131,000 | **CRITICAL** | Versioning plugin rewrite |
| `{% include_cached %}` | ~500+ | **HIGH** | Replace with standard include |
| Custom versioning plugin | 1 system | **HIGH** | JavaScript rewrite |
| Redcarpet markdown | All .md files | **HIGH** | Configure markdown-it |

### Medium Issues

| Issue | Occurrences | Severity | Resolution |
|-------|-------------|----------|------------|
| `\| relative_url` filter | ~5,720 | **MEDIUM** | Custom filter |
| `\| absolute_url` filter | ~10 | **LOW** | Custom filter |
| `\| where` filter | ~139 | **MEDIUM** | 11ty has this, slight syntax diff |
| Include with parameters | ~1,000+ | **MEDIUM** | Works in 11ty, verify syntax |
| `site.data.*` access | ~55,000 | **MEDIUM** | Works as `data.*` in 11ty |

### Low Issues

| Issue | Occurrences | Severity | Resolution |
|-------|-------------|----------|------------|
| `{% raw %}` blocks | 0 | **NONE** | Not used |
| `{% highlight %}` tag | 0 | **NONE** | Not used (uses fenced blocks) |
| `{% post_url %}` tag | 0 | **NONE** | Not used |

---

## Phased Migration Plan

```
Phase 1: Project Setup & Compatibility Layer     [Foundation]
    ↓
Phase 2: Data & Includes Migration              [Content Infrastructure]
    ↓
Phase 3: Versioning System                      [Core Functionality]
    ↓
Phase 4: Markdown Processing                    [Content Rendering]
    ↓
Phase 5: Content Migration                      [Bulk Content]
    ↓
Phase 6: Build & Deploy                         [Production Ready]
```

---

## Phase 1: Project Setup & Compatibility Layer

### Goals
- Set up 11ty project structure
- Create Jekyll-compatible filters and shortcodes
- Establish build pipeline

### Tasks

#### 1.1 Initialize 11ty Project
```bash
mkdir src/eleventy
cd src/eleventy
npm init -y
npm install @11ty/eleventy
npm install markdown-it markdown-it-anchor markdown-it-attrs
npm install @11ty/eleventy-plugin-syntaxhighlight
npm install sass
```

#### 1.2 Create Base Configuration

**File: `.eleventy.js`**
```javascript
module.exports = function(eleventyConfig) {
  // Passthrough copies
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("fonts");

  // Jekyll compatibility filters
  eleventyConfig.addFilter("relative_url", require("./lib/filters/relative-url"));
  eleventyConfig.addFilter("absolute_url", require("./lib/filters/absolute-url"));

  // Jekyll link tag replacement
  eleventyConfig.addShortcode("link", require("./lib/shortcodes/link"));

  // Include cached (just use regular include)
  eleventyConfig.addShortcode("include_cached", async function(file, data) {
    // Delegate to standard include behavior
    return this.include(file, data);
  });

  return {
    dir: {
      input: "content",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
      output: "_site"
    },
    templateFormats: ["md", "html", "liquid", "njk"],
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid"
  };
};
```

#### 1.3 Create Compatibility Filters

**File: `lib/filters/relative-url.js`**
```javascript
module.exports = function(url) {
  if (!url) return '';
  // Adjust base path as needed
  const basePath = process.env.DOCS_BASE_PATH || '/docs';
  if (url.startsWith('/')) {
    return `${basePath}${url}`;
  }
  return url;
};
```

**File: `lib/filters/absolute-url.js`**
```javascript
module.exports = function(url) {
  const baseUrl = process.env.SITE_URL || 'https://www.cockroachlabs.com';
  if (!url) return baseUrl;
  if (url.startsWith('http')) return url;
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};
```

#### 1.4 Create Link Shortcode

**File: `lib/shortcodes/link.js`**
```javascript
module.exports = function(path) {
  if (!path) return '#';

  // Remove .md extension
  let url = path.replace(/\.md$/, '');

  // Handle defined variables like {{ page.version.version }}
  // These will be resolved by Liquid before reaching the shortcode

  // Ensure leading slash
  if (!url.startsWith('/')) {
    url = '/' + url;
  }

  // Remove trailing /index
  url = url.replace(/\/index$/, '/');

  return url;
};
```

#### 1.5 Create Project Structure
```
src/eleventy/
├── .eleventy.js
├── package.json
├── lib/
│   ├── filters/
│   │   ├── relative-url.js
│   │   └── absolute-url.js
│   ├── shortcodes/
│   │   └── link.js
│   └── plugins/
│       └── versions.js
├── content/           # Will hold migrated content
├── _includes/         # Will hold migrated includes
├── _layouts/          # Will hold migrated layouts
└── _data/             # Will hold migrated data
```

### Validation
- [ ] `npm run build` succeeds with empty content
- [ ] `npm run serve` starts dev server
- [ ] Filters return expected values in test templates

---

## Phase 2: Data & Includes Migration

### Goals
- Migrate `_data/` directory
- Migrate `_includes/` with syntax updates
- Migrate `_layouts/` with syntax updates

### Tasks

#### 2.1 Migrate Data Files
```bash
# Data files should work as-is
cp -r ../current/_data ./
```

**Data Access Changes:**
| Jekyll | 11ty |
|--------|------|
| `site.data.releases` | `data.releases` or `releases` |
| `site.data.versions` | `data.versions` or `versions` |

#### 2.2 Migrate Includes

**Syntax Changes Required:**

| Jekyll Syntax | 11ty Liquid Syntax |
|--------------|-------------------|
| `{% include file.html %}` | `{% include "file.html" %}` (quotes required) |
| `{% include_cached file.html %}` | `{% include "file.html" %}` |
| `{% include file.html param=value %}` | `{% include "file.html", param: value %}` |
| `{{ include.param }}` | `{{ param }}` (in the included file) |

**Migration Script for Includes:**
```bash
# Create in lib/scripts/migrate-includes.js
```

#### 2.3 Migrate Layouts

**Key Changes:**
1. Update include syntax
2. Change `site.data.*` to `data.*`
3. Update `{% link %}` to `{% link "path" %}`

---

## Phase 3: Versioning System

### Goals
- Replicate Jekyll versioning plugin functionality in JavaScript
- Inject version data into all pages
- Support version switcher

### Tasks

#### 3.1 Create Versioning Plugin

**File: `lib/plugins/versions.js`**
```javascript
const fs = require('fs');
const path = require('path');

// Version configuration (from _config.yml)
const VERSION_CONFIG = {
  versions: {
    stable: 'v26.1',
    dev: 'v26.2'  // if applicable
  }
};

// Parse version from path
function getVersionFromPath(inputPath) {
  const match = inputPath.match(/\/(v\d+\.\d+)\//);
  return match ? match[1] : null;
}

// Version class
class Version {
  constructor(version, config) {
    this.version = version;
    this.name = this.formatName(version, config);
    this.tag = version;
    this._stable = config.versions.stable === version;
  }

  formatName(version, config) {
    if (config.versions.stable === version) {
      return `${version} (Stable)`;
    }
    if (config.versions.dev === version) {
      return `${version} (Dev)`;
    }
    return version;
  }

  stable() {
    return this._stable;
  }
}

module.exports = {
  // Computed data for all pages
  eleventyComputed: {
    version: (data) => {
      return getVersionFromPath(data.page.inputPath);
    },

    release_info: (data) => {
      // Load from data files
      return data.releases?.[data.version] || {};
    },

    sidebar_data: (data) => {
      const version = getVersionFromPath(data.page.inputPath);
      if (version) {
        return `sidebars/${version}.yml`;
      }
      return `sidebars/${VERSION_CONFIG.versions.stable}.yml`;
    },

    canonical: (data) => {
      // Generate canonical URL pointing to stable version
      const stableVersion = VERSION_CONFIG.versions.stable;
      return data.page.url.replace(/\/v\d+\.\d+\//, `/${stableVersion}/`);
    }
  }
};
```

#### 3.2 Create Version Switcher Data

**File: `_data/eleventyComputed.js`**
```javascript
module.exports = {
  versions: (data) => {
    // Return list of all versions for version switcher
    const allVersions = ['v26.1', 'v25.3', 'v25.2', 'v25.1', /* etc */];
    return allVersions.map(v => ({
      version: v,
      name: v === 'v26.1' ? `${v} (Stable)` : v,
      stable: v === 'v26.1'
    }));
  }
};
```

#### 3.3 Update Layouts for Version Data
- Version switcher include uses `{{ version }}` and `{{ versions }}`
- Sidebar include uses `{{ sidebar_data }}`

---

## Phase 4: Markdown Processing

### Goals
- Configure markdown-it to match Redcarpet behavior
- Set up syntax highlighting
- Handle custom code block classes

### Tasks

#### 4.1 Configure Markdown-it

**Update `.eleventy.js`:**
```javascript
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

module.exports = function(eleventyConfig) {
  // Syntax highlighting
  eleventyConfig.addPlugin(syntaxHighlight, {
    templateFormats: ["md"],
    preAttributes: {
      class: ({ language }) => `highlight language-${language}`
    }
  });

  // Custom markdown config
  const md = markdownIt({
    html: true,           // Allow HTML in markdown
    breaks: false,        // Don't convert \n to <br>
    linkify: true,        // Auto-link URLs
    typographer: false    // Don't do smart quotes
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: 'after',
      class: 'anchor-link',
      symbol: '#'
    }),
    level: [2, 3, 4, 5]
  });

  eleventyConfig.setLibrary('md', md);

  // ... rest of config
};
```

#### 4.2 Handle Fenced Code Blocks
Redcarpet output:
```html
<div class="highlight">
  <pre><code class="language-sql" data-lang="sql">...</code></pre>
</div>
```

Configure 11ty/Prism to match this structure or update CSS.

#### 4.3 Handle `markdown="1"` Attribute
This Redcarpet feature allows markdown inside HTML blocks. Options:
1. Pre-process files to remove the need
2. Add markdown-it plugin for this behavior
3. Convert to 11ty's paired shortcode pattern

---

## Phase 5: Content Migration

### Goals
- Bulk convert `{% link %}` tags
- Update frontmatter if needed
- Migrate all content files

### Tasks

#### 5.1 Create Link Tag Migration Script

**File: `lib/scripts/migrate-links.js`**
```javascript
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern: {% link {{ page.version.version }}/path/file.md %}
// Convert to: {% link "{{ page.version.version }}/path/file.md" %}

const LINK_PATTERN = /\{%\s*link\s+([^%]+?)\s*%\}/g;

function migrateLinks(content) {
  return content.replace(LINK_PATTERN, (match, linkPath) => {
    // Clean up the path
    let cleanPath = linkPath.trim();

    // If already quoted, leave as-is
    if (cleanPath.startsWith('"') || cleanPath.startsWith("'")) {
      return match;
    }

    // Add quotes around the path
    return `{% link "${cleanPath}" %}`;
  });
}

// Process all markdown files
const files = glob.sync('content/**/*.md');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const migrated = migrateLinks(content);
  if (content !== migrated) {
    fs.writeFileSync(file, migrated);
    console.log(`Migrated: ${file}`);
  }
});
```

#### 5.2 Create Bulk Migration Script

**File: `lib/scripts/migrate-content.sh`**
```bash
#!/bin/bash

# Copy content directories
cp -r ../current/v* ./content/
cp -r ../current/cockroachcloud ./content/
cp -r ../current/releases ./content/
cp -r ../current/molt ./content/

# Copy static assets
cp -r ../current/images ./content/
cp -r ../current/js ./content/
cp -r ../current/css ./content/
cp -r ../current/fonts ./content/

# Run link migration
node lib/scripts/migrate-links.js

# Run include syntax migration
node lib/scripts/migrate-includes.js
```

#### 5.3 Validate Content Migration
- [ ] All .md files parse without errors
- [ ] Links resolve correctly
- [ ] Images load
- [ ] Code blocks render with highlighting

---

## Phase 6: Build & Deploy

### Goals
- Optimize build performance
- Set up production build
- Configure deployment

### Tasks

#### 6.1 Build Optimization
```javascript
// .eleventy.js additions
module.exports = function(eleventyConfig) {
  // Cache busting
  eleventyConfig.addFilter('bust', (url) => {
    const timestamp = Date.now();
    return `${url}?v=${timestamp}`;
  });

  // HTML minification (production only)
  if (process.env.NODE_ENV === 'production') {
    eleventyConfig.addTransform('htmlmin', require('./lib/transforms/htmlmin'));
  }
};
```

#### 6.2 Package.json Scripts
```json
{
  "scripts": {
    "dev": "eleventy --serve",
    "build": "NODE_ENV=production eleventy",
    "build:stats": "eleventy --stats",
    "clean": "rm -rf _site",
    "debug": "DEBUG=Eleventy* eleventy"
  }
}
```

#### 6.3 Netlify Configuration
**File: `netlify.toml`**
```toml
[build]
  command = "npm run build"
  publish = "_site"

[build.environment]
  NODE_ENV = "production"

[[redirects]]
  from = "/docs/*"
  to = "/:splat"
  status = 200
```

---

## Rollback Strategy

If migration encounters blocking issues:

1. **Keep Jekyll build working** - Don't remove Jekyll config until 11ty is proven
2. **Feature flag** - Use environment variable to switch between builds
3. **Incremental migration** - Can run both systems in parallel during transition

```bash
# Run Jekyll (original)
cd src/current && bundle exec jekyll serve

# Run 11ty (new)
cd src/eleventy && npm run dev
```

---

## Success Criteria

### Phase 1 Complete When:
- [ ] Empty 11ty project builds successfully
- [ ] All compatibility filters work
- [ ] Link shortcode resolves paths correctly

### Phase 2 Complete When:
- [ ] All data files accessible via `data.*`
- [ ] All includes work with new syntax
- [ ] Layouts render without errors

### Phase 3 Complete When:
- [ ] Version data injected into pages
- [ ] Version switcher shows all versions
- [ ] Canonical URLs generated correctly

### Phase 4 Complete When:
- [ ] Markdown renders identically to Redcarpet
- [ ] Code blocks have syntax highlighting
- [ ] Anchor links work on headings

### Phase 5 Complete When:
- [ ] All 131K+ links converted
- [ ] All content files parse without errors
- [ ] Full site builds in reasonable time

### Phase 6 Complete When:
- [ ] Production build completes
- [ ] Site deploys to staging
- [ ] Visual regression tests pass

---

## Appendix: File Counts

| Content Type | Count |
|-------------|-------|
| Total .md files | ~10,000+ |
| Total .html files | ~500 |
| Include files | ~800 |
| Data files | ~65 |
| Versioned directories | 20+ |

---

## Migration Progress

### Status: Build Working ✅

**Build Output:** 1011 files written in 22 seconds

### Completed Phases

#### Phase 1: Project Setup & Compatibility Layer ✅
- Created `.eleventy.js` with full Jekyll compatibility layer
- Added filters: `relative_url`, `absolute_url`, `scssify`, `where`, `where_exp`, `sort_by`, `group_by`
- Added shortcodes: `link`, `youtube`, `new_in`
- Created versioning plugin (`lib/plugins/versions.js`)

#### Phase 2: Data & Includes Migration ✅
- Migrated `_data/`, `_includes/`, `_layouts/` from Jekyll
- Ran automated syntax migrations:
  - `{% include file %}` → `{% include "file" %}`
  - `{% include_cached file %}` → `{% include "file" %}`
  - `{% else if %}` → `{% elsif %}`
  - Dynamic includes → `{% dynamic_include %}` shortcode
  - Remote includes → `{% remote_include %}` shortcode
- Created `include_file` shortcode for variable-based includes (sidebar data)

### Known Issues (Warnings, Not Blocking)

| Issue | Count | Status |
|-------|-------|--------|
| Missing dynamic include files | ~116 | Files don't exist in v26.1 includes |
| Unresolved remote include URLs | ~217 | Liquid variables not resolved before shortcode |
| Missing sidebar_data param | 1 | Edge case in internal JSON file |

### Remaining Work

#### Phase 3: Full Site Build Validation (In Progress)
- [ ] Fix meta tag generation (og:url, title)
- [ ] Resolve remote include variable timing issue
- [ ] Add missing v26.1 include files (or convert to static)
- [ ] Test generated HTML output quality

#### Phase 4: Production Readiness
- [ ] CSS compilation (currently using `@import`, may need SASS processing)
- [ ] Image optimization
- [ ] HTML minification
- [ ] Performance benchmarking vs Jekyll

---

## Technical Notes

### Shortcodes Created

| Shortcode | Purpose |
|-----------|---------|
| `{% link "path" %}` | Jekyll link tag replacement |
| `{% dynamic_include var, "/suffix" %}` | Include with version variable |
| `{% remote_include url %}` | Fetch remote content |
| `{% include_file var %}` | Include file by variable path |
| `{% youtube id %}` | YouTube embed |
| `{% new_in version %}` | Version badge |

### Key Files

```
src/eleventy/
├── .eleventy.js              # Main config with all filters/shortcodes
├── lib/
│   ├── plugins/versions.js   # Version injection plugin
│   └── scripts/
│       ├── migrate-content.sh    # Content copy script
│       ├── migrate-links.js      # Link syntax migration
│       ├── migrate-includes.js   # Include syntax migration
│       └── migrate-remote-includes.js
├── content/                  # Migrated content (1011 pages)
├── _includes/               # Migrated includes
├── _layouts/                # Migrated layouts
└── _data/                   # Migrated data files
```

---

*Document created: 2024-12-17*
*Last updated: 2024-12-17*
