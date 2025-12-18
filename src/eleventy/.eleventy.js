const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const path = require('path');
const sass = require('sass');
const { versionsPlugin } = require('./lib/plugins/versions');

module.exports = function(eleventyConfig) {
  // ---------------------------------------------------------------------------
  // Ignore non-content files
  // ---------------------------------------------------------------------------
  eleventyConfig.ignores.add("content/AGENTS.md");
  eleventyConfig.ignores.add("content/README*.md");
  // Ignore .html versions when .md exists (duplicate content)
  eleventyConfig.ignores.add("content/install-cockroachdb.html");
  eleventyConfig.ignores.add("content/install-cockroachdb-linux.html");
  eleventyConfig.ignores.add("content/install-cockroachdb-mac.html");
  eleventyConfig.ignores.add("content/install-cockroachdb-windows.html");

  // ---------------------------------------------------------------------------
  // Passthrough File Copies
  // ---------------------------------------------------------------------------
  eleventyConfig.addPassthroughCopy("content/images");
  eleventyConfig.addPassthroughCopy("content/js");
  // Note: CSS is handled by SCSS compilation below, but we still copy non-SCSS files
  eleventyConfig.addPassthroughCopy({ "content/css/**/*.css": "css" });
  eleventyConfig.addPassthroughCopy("content/fonts");

  // ---------------------------------------------------------------------------
  // SCSS Compilation
  // ---------------------------------------------------------------------------
  // Compile main SCSS files to CSS
  eleventyConfig.addTemplateFormats("scss");
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",

    // Only compile main SCSS files, not partials (files starting with _)
    compileOptions: {
      permalink: function(contents, inputPath) {
        // Guard against undefined inputPath
        if (!inputPath) {
          return false;
        }
        // Skip partials and files in subdirectories (they're imported, not standalone)
        const fileName = path.basename(inputPath);
        if (fileName.startsWith('_')) {
          return false; // Don't output this file
        }
        // Only compile top-level SCSS files in css/
        if (!inputPath.includes('/css/') || inputPath.includes('/css/global/') ||
            inputPath.includes('/css/bs/') || inputPath.includes('/css/layouts/') ||
            inputPath.includes('/css/components/') || inputPath.includes('/css/utils/')) {
          return false;
        }
        return undefined; // Use default permalink
      }
    },

    compile: async function(inputContent, inputPath) {
      // Guard against undefined inputs
      if (!inputContent || !inputPath) {
        return;
      }

      // Skip partials
      const fileName = path.basename(inputPath);
      if (fileName.startsWith('_')) {
        return;
      }

      // Skip files in partial directories
      if (inputPath.includes('/global/') || inputPath.includes('/bs/') ||
          inputPath.includes('/layouts/') || inputPath.includes('/components/') ||
          inputPath.includes('/utils/') || inputPath.includes('/syntax/')) {
        return;
      }

      try {
        // Strip Jekyll front matter (---\n---) if present
        let scssContent = inputContent;
        const frontMatterMatch = inputContent.match(/^---\s*\n---\s*\n/);
        if (frontMatterMatch) {
          scssContent = inputContent.slice(frontMatterMatch[0].length);
        }

        const result = sass.compileString(scssContent, {
          loadPaths: [
            path.join(__dirname, 'content', 'css'),
            path.join(__dirname, 'content', '_includes'),
            path.join(__dirname, 'content'),
            path.dirname(inputPath)
          ],
          style: 'compressed',
          silenceDeprecations: ['mixed-decls', 'color-functions', 'global-builtin', 'import'],
          futureDeprecations: []  // Suppress future deprecation warnings
        });

        return async () => result.css;
      } catch (error) {
        console.error(`SCSS compilation error in ${inputPath}:`, error.message);
        return;
      }
    }
  });

  // ---------------------------------------------------------------------------
  // Plugins
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Default Layout (replicate Jekyll's defaults configuration)
  // ---------------------------------------------------------------------------
  // Jekyll had: defaults: - scope: { path: '', type: pages } values: { layout: page }
  eleventyConfig.addGlobalData("layout", "page");

  // Versioning plugin (CockroachDB-specific)
  eleventyConfig.addPlugin(versionsPlugin);

  // Syntax highlighting
  eleventyConfig.addPlugin(syntaxHighlight, {
    templateFormats: ["md"],
    preAttributes: {
      class: ({ language }) => `highlight language-${language || 'text'}`
    },
    codeAttributes: {
      class: ({ language }) => `language-${language || 'text'}`,
      'data-lang': ({ language }) => language || 'text'
    }
  });

  // ---------------------------------------------------------------------------
  // Markdown Configuration
  // ---------------------------------------------------------------------------
  const md = markdownIt({
    html: true,           // Allow HTML in markdown
    breaks: false,        // Don't convert \n to <br>
    linkify: true,        // Auto-link URLs
    typographer: false    // Don't do smart quotes (match Redcarpet)
  }).use(markdownItAnchor, {
    // Don't add permalink - let AnchorJS handle that (matches production behavior)
    permalink: false,
    level: [2, 3, 4, 5],
    slugify: (s) => s.toLowerCase().replace(/[^\w]+/g, '-')
  });

  // Disable indented code blocks (match Redcarpet config)
  md.disable('code');

  eleventyConfig.setLibrary('md', md);

  // ---------------------------------------------------------------------------
  // Jekyll Compatibility Filters
  // ---------------------------------------------------------------------------

  // relative_url filter - prepends base path
  // Uses the same DOCS_BASE_PATH as pathPrefix for consistency
  // Check for undefined explicitly since empty string is a valid value for local dev
  const basePath = process.env.DOCS_BASE_PATH !== undefined ? process.env.DOCS_BASE_PATH : '/docs';

  eleventyConfig.addFilter("relative_url", function(url) {
    if (!url) return '';
    // Don't modify external URLs
    if (url.startsWith('http') || url.startsWith('//')) {
      return url;
    }
    // Prepend basePath for all paths
    if (url.startsWith('/')) {
      return `${basePath}${url}`;
    }
    // For relative paths, also prepend basePath with /
    return `${basePath}/${url}`;
  });

  // absolute_url filter - prepends full site URL
  eleventyConfig.addFilter("absolute_url", function(url) {
    const baseUrl = process.env.SITE_URL || 'https://www.cockroachlabs.com';
    if (!url) return baseUrl;
    if (url.startsWith('http')) return url;
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  });

  // scssify filter - SCSS compilation using dart-sass (with caching)
  const scssifyCache = new Map();

  eleventyConfig.addFilter("scssify", function(content) {
    if (!content) return '';

    // Check cache first (using content hash as key)
    const cacheKey = content.length + '_' + content.slice(0, 100);
    if (scssifyCache.has(cacheKey)) {
      return scssifyCache.get(cacheKey);
    }

    try {
      const result = sass.compileString(content, {
        loadPaths: [
          path.join(__dirname, 'content', 'css'),
          path.join(__dirname, 'content', '_includes'),
          path.join(__dirname, 'content')
        ],
        style: 'compressed',
        silenceDeprecations: ['mixed-decls', 'color-functions', 'global-builtin', 'import'],
        futureDeprecations: []  // Suppress future deprecation warnings
      });

      // Cache the result
      scssifyCache.set(cacheKey, result.css);
      return result.css;
    } catch (error) {
      console.error('SCSS compilation error:', error.message);
      // Return the original content if compilation fails
      return content;
    }
  });

  // where filter - filter array by property value (Jekyll compatibility)
  eleventyConfig.addFilter("where", function(array, key, value) {
    if (!Array.isArray(array)) return [];
    return array.filter(item => item[key] === value);
  });

  // where_exp filter - filter with expression (simplified version)
  eleventyConfig.addFilter("where_exp", function(array, itemName, expression) {
    // This is a simplified version - complex expressions may need adjustment
    if (!Array.isArray(array)) return [];
    return array.filter(item => {
      // Handle simple equality expressions like "item.key == value"
      const match = expression.match(/(\w+)\.(\w+)\s*==\s*["']?([^"']+)["']?/);
      if (match) {
        const [, , key, value] = match;
        return item[key] === value;
      }
      return true;
    });
  });

  // sort filter with property
  eleventyConfig.addFilter("sort_by", function(array, key) {
    if (!Array.isArray(array)) return [];
    return [...array].sort((a, b) => {
      if (a[key] < b[key]) return -1;
      if (a[key] > b[key]) return 1;
      return 0;
    });
  });

  // group_by filter
  eleventyConfig.addFilter("group_by", function(array, key) {
    if (!Array.isArray(array)) return [];
    const groups = {};
    array.forEach(item => {
      const groupKey = item[key] || 'undefined';
      if (!groups[groupKey]) {
        groups[groupKey] = { name: groupKey, items: [] };
      }
      groups[groupKey].items.push(item);
    });
    return Object.values(groups);
  });

  // ---------------------------------------------------------------------------
  // Jekyll Compatibility Shortcodes
  // ---------------------------------------------------------------------------

  // link shortcode - replaces {% link path/to/file.md %}
  eleventyConfig.addShortcode("link", function(filePath) {
    if (!filePath) return '#';

    // Remove .md extension
    let url = filePath.replace(/\.md$/, '');

    // Remove .html extension
    url = url.replace(/\.html$/, '');

    // Ensure leading slash
    if (!url.startsWith('/')) {
      url = '/' + url;
    }

    // Remove trailing /index
    url = url.replace(/\/index$/, '/');

    return url;
  });

  // include_cached - just delegates to standard include (11ty handles caching)
  // This is handled automatically by 11ty's include system

  // ---------------------------------------------------------------------------
  // Dynamic Include Shortcodes
  // ---------------------------------------------------------------------------

  const fs = require('fs');
  const pathModule = require('path');

  // include_file - includes a file by its path (passed as a resolved variable)
  // Usage: {% include_file sidebar_data %} where sidebar_data = "sidebar-data-v26.1.json"
  eleventyConfig.addShortcode("include_file", function(filePath) {
    try {
      if (!filePath) {
        console.warn('include_file: No file path provided');
        return '[]';
      }

      const includesDir = pathModule.join(__dirname, 'content', '_includes');
      const fullPath = pathModule.join(includesDir, filePath);

      if (fs.existsSync(fullPath)) {
        return fs.readFileSync(fullPath, 'utf8');
      } else {
        console.warn(`include_file: File not found: ${fullPath}`);
        return '[]';
      }
    } catch (error) {
      console.error(`include_file error: ${error.message}`);
      return '[]';
    }
  });

  // dynamic_include - handles Jekyll's dynamic include pattern
  // Converts {% include {{ page.version.version }}/path.md %}
  // To: {% dynamic_include page.version.version, "/path.md" %}

  eleventyConfig.addAsyncShortcode("dynamic_include", async function(versionVar, pathSuffix) {
    try {
      // Get the version from the page context
      // The versionVar comes as a string like "page.version.version"
      // We need to resolve it from the current context

      let version;
      if (versionVar === 'page.version.version') {
        // Most common case - get version from page data
        version = this.page?.version || this.ctx?.version || this.version;
      } else if (versionVar === 'site.versions.stable') {
        // Site-level stable version - read from _data/versions.yml
        version = this.ctx?.site?.versions?.stable || 'v26.1';
      } else if (this.ctx && this.ctx[versionVar]) {
        version = this.ctx[versionVar];
      } else if (this[versionVar]) {
        version = this[versionVar];
      }

      if (!version) {
        // Try to extract version from the current page path
        const inputPath = this.page?.inputPath || '';
        const versionMatch = inputPath.match(/[/\\](v\d+\.\d+)[/\\]/);
        version = versionMatch ? versionMatch[1] : 'v26.1'; // Default to stable
      }

      // Build the full include path
      const includePath = `${version}${pathSuffix}`;

      // Read the include file
      const includesDir = pathModule.join(__dirname, 'content', '_includes');
      const fullPath = pathModule.join(includesDir, includePath);

      if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');

        // If it's a markdown file, we might want to render it
        // For now, just return the content (Liquid will process it)
        return content;
      } else {
        console.warn(`dynamic_include: File not found: ${fullPath}`);
        return `<!-- Include not found: ${includePath} -->`;
      }
    } catch (error) {
      console.error(`dynamic_include error: ${error.message}`);
      return `<!-- Include error: ${error.message} -->`;
    }
  });

  // ---------------------------------------------------------------------------
  // Remote Include Shortcode
  // ---------------------------------------------------------------------------

  // remote_include - fetches content from a remote URL with disk caching
  // Usage: {% remote_include URL %}
  // Or with markers: {% remote_include URL ||START_MARKER ||END_MARKER %}
  const EleventyFetch = require("@11ty/eleventy-fetch");

  // Debug flag - set to true to see context structure
  const DEBUG_REMOTE_INCLUDE = false;

  eleventyConfig.addAsyncShortcode("remote_include", async function(url, startMarker, endMarker) {
    try {
      // Resolve Liquid variables in the URL
      // Pattern: {{ page.release_info.crdb_branch_name }} or {{ variable.path }}
      let resolvedUrl = url;
      const varPattern = /\{\{\s*([^}]+)\s*\}\}/g;
      let match;

      // In Eleventy shortcodes, 'this' contains the template context
      // this.ctx contains the data available to the template
      const ctx = this.ctx || {};

      // Try multiple ways to access template data in LiquidJS
      let releaseInfo = null;
      let pageObj = null;

      // Method 1: Try ctx.get() if available
      if (typeof ctx.get === 'function') {
        releaseInfo = ctx.get(['release_info']);
        pageObj = ctx.get(['page']);
      }

      // Method 2: Try ctx.getAll() if available
      if (!releaseInfo && typeof ctx.getAll === 'function') {
        const allVars = ctx.getAll();
        releaseInfo = allVars?.release_info;
        pageObj = allVars?.page;
      }

      // Method 3: Check if data is passed directly to shortcode via this
      if (!releaseInfo || Object.keys(releaseInfo).length === 0) {
        releaseInfo = this.release_info;
        pageObj = this.page;
      }

      // Method 5: If release_info is still empty, look up from global data
      // For pages not in versioned directories, use stable version's release_info
      if (!releaseInfo || Object.keys(releaseInfo).length === 0) {
        // Try to get the release_info data from the full data object
        const allReleaseInfo = this.release_info; // This might be the full keyed object

        // Determine version from page path or use stable
        let version = null;
        if (pageObj?.inputPath) {
          const versionMatch = pageObj.inputPath.match(/[/\\](v\d+\.\d+)[/\\]/);
          version = versionMatch ? versionMatch[1] : null;
        }

        // Default to stable version
        const stableVersion = 'v26.1';
        const lookupVersion = version || stableVersion;

        // If release_info is keyed by version, look it up
        if (allReleaseInfo && allReleaseInfo[lookupVersion]) {
          releaseInfo = allReleaseInfo[lookupVersion];
        } else if (!releaseInfo || Object.keys(releaseInfo).length === 0) {
          // Hard-coded fallback for v26.1
          releaseInfo = {
            crdb_branch_name: 'release-25.4', // From versions.csv
            major_version: 'v26.1'
          };
        }
      }

      // Method 4: Try looking in scopes array
      if (!releaseInfo && ctx.scopes) {
        for (const scope of ctx.scopes) {
          if (scope?.release_info) {
            releaseInfo = scope.release_info;
            pageObj = scope.page;
            break;
          }
        }
      }

      // Debug: log what we found
      if (DEBUG_REMOTE_INCLUDE && !this._debugLogged) {
        console.log('this keys:', Object.keys(this).slice(0, 20));
        console.log('release_info type:', typeof releaseInfo);
        console.log('release_info keys:', releaseInfo ? Object.keys(releaseInfo).slice(0, 10) : 'none');
        console.log('release_info sample:', JSON.stringify(releaseInfo).slice(0, 200));
        console.log('page.inputPath:', pageObj?.inputPath);
        this._debugLogged = true;
      }

      // Build the context for variable resolution
      const pageData = {
        page: {
          ...(pageObj || {}),
          release_info: releaseInfo || {}
        },
        release_info: releaseInfo || {},
        version: pageObj?.version || null
      };

      while ((match = varPattern.exec(url)) !== null) {
        const varPath = match[1].trim();
        const parts = varPath.split('.');

        // Navigate the context to find the value
        let value = pageData;
        for (const part of parts) {
          if (value && typeof value === 'object') {
            value = value[part];
          } else {
            value = undefined;
            break;
          }
        }

        if (value && typeof value === 'string') {
          resolvedUrl = resolvedUrl.replace(match[0], value);
        }
      }

      // Still has unresolved variables? Log with more context for debugging
      if (resolvedUrl.includes('{{') || resolvedUrl.includes('{%')) {
        // Only warn once per unique unresolved pattern
        const unresolvedMatch = resolvedUrl.match(/\{\{[^}]+\}\}/);
        console.warn(`remote_include: Could not resolve '${unresolvedMatch?.[0]}' in URL (page: ${pageData.page?.inputPath || 'unknown'})`);
        return `<!-- remote_include: unresolved variables in URL -->`;
      }

      // Fetch the content using eleventy-fetch with disk caching
      // Cache duration: "1d" = 1 day, reduces rebuild time significantly
      let content = await EleventyFetch(resolvedUrl, {
        duration: "1d",  // Cache for 1 day
        type: "text",    // Return as text/HTML string
        fetchOptions: {
          headers: {
            "User-Agent": "CockroachDB-Docs-Builder/1.0"
          }
        }
      });

      // Ensure content is a string (eleventy-fetch may return Buffer in some cases)
      if (Buffer.isBuffer(content)) {
        content = content.toString('utf8');
      } else if (typeof content !== 'string') {
        content = String(content);
      }

      // If markers are provided, extract the content between them
      if (startMarker && endMarker) {
        const startIdx = content.indexOf(startMarker);
        const endIdx = content.indexOf(endMarker);
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
          content = content.substring(startIdx + startMarker.length, endIdx).trim();
        }
      }

      return content;
    } catch (error) {
      console.error(`remote_include error for ${url}: ${error.message}`);
      return `<!-- Remote include error: ${error.message} -->`;
    }
  });

  // ---------------------------------------------------------------------------
  // Custom Shortcodes for common patterns
  // ---------------------------------------------------------------------------

  // YouTube embed shortcode
  eleventyConfig.addShortcode("youtube", function(videoId) {
    return `<div class="youtube-wrapper">
      <iframe
        src="https://www.youtube.com/embed/${videoId}"
        frameborder="0"
        allowfullscreen>
      </iframe>
    </div>`;
  });

  // New-in version badge shortcode
  eleventyConfig.addShortcode("new_in", function(version) {
    return `<span class="version-tag">New in ${version}:</span>`;
  });

  // ---------------------------------------------------------------------------
  // Global Data
  // ---------------------------------------------------------------------------

  // Note: site.* variables are now provided by content/_data/site.js
  // which includes site.data.* namespace for Jekyll compatibility

  // ---------------------------------------------------------------------------
  // Collections
  // ---------------------------------------------------------------------------

  // Create collections for each version
  eleventyConfig.addCollection("allPages", function(collectionApi) {
    return collectionApi.getAll();
  });

  // ---------------------------------------------------------------------------
  // Build Configuration
  // ---------------------------------------------------------------------------

  // Watch targets
  eleventyConfig.addWatchTarget("./content/css/");
  eleventyConfig.addWatchTarget("./lib/");

  // Quiet mode for cleaner output
  eleventyConfig.setQuietMode(true);

  // ---------------------------------------------------------------------------
  // Transform: Jekyll Compatibility (markdown in HTML, fenced code blocks, callouts)
  // ---------------------------------------------------------------------------
  eleventyConfig.addTransform("jekyll-compat", function(content) {
    if (!this.page.outputPath || !this.page.outputPath.endsWith('.html')) {
      return content;
    }

    let result = content;

    // Step 1: Process unprocessed ~~~ fenced code blocks
    // These appear as literal text when markdown-it skips them (inside HTML blocks)
    // Match ~~~ with optional language, content, and closing ~~~
    // Output Jekyll/Rouge-compatible HTML structure for CSS compatibility
    const fencedCodePattern = /~~~\s*(\w*)\s*\n([\s\S]*?)\n~~~(?=\s*<|\s*$|\n)/g;
    result = result.replace(fencedCodePattern, function(match, lang, code) {
      const language = lang || 'text';
      // First, convert any <a> tags back to plain URLs (markdown linkify may have processed them)
      let plainCode = code.replace(/<a[^>]*href="([^"]*)"[^>]*>[^<]*<\/a>/gi, '$1');
      // Then escape HTML entities in the code
      const escapedCode = plainCode
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      // Match Jekyll/Rouge HTML structure for CSS compatibility
      return `<div class="language-${language} highlighter-rouge"><div class="highlight"><pre class="highlight"><code class="language-${language}" data-lang="${language}">${escapedCode.trim()}</code></pre></div></div>\n`;
    });

    // Step 2: Process markdown inside callouts (bs-callout divs)
    // The callout HTML contains raw markdown that needs processing
    const calloutPattern = /(<div class="bs-callout[^"]*">)(<div class="bs-callout__label">[^<]*<\/div>)\s*([\s\S]*?)(<\/div>)(?=\s*(?:<\/li>|<\/ol>|<\/ul>|<h|<p|<div|$))/gi;
    result = result.replace(calloutPattern, function(match, openTag, label, innerContent, closeTag) {
      // Process markdown in the callout content
      let processed = innerContent.trim();
      // Convert markdown links [text](url) to HTML
      processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
      // Convert *text* to <em>text</em>
      processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      // Convert **text** to <strong>text</strong>
      processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      // Convert `code` to <code>code</code>
      processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');

      return `${openTag}\n${label}\n<p>${processed}</p>\n${closeTag}`;
    });

    // Step 3: Process inline code backticks that weren't processed by markdown
    // This happens when content is inside HTML blocks (like filter-content divs)
    // Convert `code` to <code>code</code>, but not inside <pre>, <code>, or <script> tags
    // Use a negative lookbehind-like approach by splitting on these tags
    const processInlineCode = (text) => {
      // Don't process inside existing code/pre/script blocks
      const parts = text.split(/(<pre[\s\S]*?<\/pre>|<code[^>]*>[\s\S]*?<\/code>|<script[\s\S]*?<\/script>)/gi);
      return parts.map((part, i) => {
        // Odd indices are the preserved blocks
        if (i % 2 === 1) return part;
        // Even indices are text to process
        return part.replace(/`([^`\n]+)`/g, '<code>$1</code>');
      }).join('');
    };
    result = processInlineCode(result);

    // Step 4: Remove markdown="1" attribute from elements
    // The content inside should already be processed by Eleventy's markdown processor
    // for blocks that it could handle, or by Step 1 above for fenced code
    result = result.replace(/\s*markdown=["']1["']/gi, '');

    // Step 5: Convert Eleventy syntax highlighter output to Jekyll/Rouge structure
    // This MUST run before the list structure fix (Step 6) because that step looks for the Jekyll/Rouge structure
    // Eleventy outputs: <pre class="highlight language-X"><code>...</code></pre>
    // Jekyll/Rouge expects: <div class="language-X highlighter-rouge"><div class="highlight"><pre class="highlight"><code>...</code></pre></div></div>
    const eleventyCodePattern = /<pre class="highlight language-(\w+)">([\s\S]*?<\/pre>)/g;
    result = result.replace(eleventyCodePattern, function(match, lang, rest) {
      return `<div class="language-${lang} highlighter-rouge"><div class="highlight"><pre class="highlight">${rest}</div></div>`;
    });

    // Step 6: Fix <p><pre> and <p><div class="language-*"> nesting (invalid HTML - block in inline)
    // Note: Copy-clipboard transforms removed - now handled by client-side JS in customscripts.js
    result = result.replace(/<p>(<pre[\s\S]*?<\/pre>)/g, '$1');
    result = result.replace(/<p>(<div class="language-[\s\S]*?<\/div>)<\/p>/g, '$1');

    return result;
  });

  // ---------------------------------------------------------------------------
  // Directory Configuration
  // ---------------------------------------------------------------------------

  // Path prefix for serving docs (matches production URL structure)
  // Use empty string for local dev, /docs for production
  const pathPrefix = process.env.DOCS_BASE_PATH !== undefined ? process.env.DOCS_BASE_PATH : "/docs";

  return {
    dir: {
      input: "content",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
      output: "_site"
    },
    pathPrefix: pathPrefix,
    templateFormats: ["md", "html", "liquid", "njk"],
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid",
    dataTemplateEngine: "liquid"
  };
};
