const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const path = require('path');
const sass = require('sass');
const { Liquid } = require('liquidjs');
const { versionsPlugin, VERSION_CONFIG } = require('./lib/plugins/versions');

// Create a Liquid engine instance for processing dynamic includes
// Configure to handle both .md and .html files in includes
const liquidEngine = new Liquid({
  root: [path.join(__dirname, 'content', '_includes')],
  extname: '',  // Don't add extension automatically - files specify their own
  dynamicPartials: true,  // Allow variable includes
  strictFilters: false,   // Don't error on unknown filters
  strictVariables: false  // Don't error on undefined variables
});

// Register custom tags for the LiquidJS engine
// These mirror the shortcodes defined for Eleventy

// Override the include tag to support Jekyll-style include.* parameter access
// Jekyll makes include parameters available as include.paramName, but LiquidJS
// only makes them available as paramName directly.
liquidEngine.registerTag('include', {
  parse: function(tagToken, remainTokens) {
    const args = tagToken.args.trim();
    // Parse the file path (can be quoted or unquoted)
    const match = args.match(/^["']?([^"',\s]+)["']?\s*(?:,\s*(.*))?$/);
    if (match) {
      this.filePath = match[1];
      this.argsStr = match[2] || '';
    } else {
      this.filePath = args;
      this.argsStr = '';
    }
  },
  render: async function(ctx, emitter) {
    try {
      // Parse the parameters
      const params = {};
      if (this.argsStr) {
        // Parse key: value pairs
        // Handle both quoted strings and variable references (including nested like page.version.version)
        const paramPattern = /(\w+)\s*:\s*(?:["']([^"']+)["']|([\w.]+))/g;
        let paramMatch;
        while ((paramMatch = paramPattern.exec(this.argsStr)) !== null) {
          const key = paramMatch[1];
          // Value is either quoted string or variable name
          if (paramMatch[2] !== undefined) {
            params[key] = paramMatch[2];
          } else {
            // It's a variable reference - look it up in context
            // Handle nested paths like page.version.version
            const varPath = paramMatch[3];
            const pathParts = varPath.split('.');
            const value = ctx.get(pathParts);
            params[key] = value;
          }
        }
      }

      // Read the include file
      const includesDir = path.join(__dirname, 'content', '_includes');
      const fullPath = path.join(includesDir, this.filePath);

      if (require('fs').existsSync(fullPath)) {
        const content = require('fs').readFileSync(fullPath, 'utf8');

        // Create the context with Jekyll-style include object
        // Parameters are available both directly AND via include.paramName
        const includeContext = {
          ...params,           // Direct access: {{ tab_names }}
          include: params      // Jekyll style: {{ include.tab_names }}
        };

        // Merge with parent context (for page, site, etc.)
        const parentScope = ctx.getAll();
        const fullContext = { ...parentScope, ...includeContext };

        // Render the include content with merged context
        const rendered = await liquidEngine.parseAndRender(content, fullContext);
        emitter.write(rendered);
      } else {
        emitter.write(`<!-- Include not found: ${this.filePath} -->`);
      }
    } catch (error) {
      console.error(`LiquidJS include error for ${this.filePath}: ${error.message}`);
      emitter.write(`<!-- Include error: ${error.message} -->`);
    }
  }
});

// link tag - replaces {% link path/to/file.md %}
liquidEngine.registerTag('link', {
  parse: function(tagToken) {
    this.filePath = tagToken.args.trim().replace(/^["']|["']$/g, '');
  },
  render: async function(ctx) {
    let url = this.filePath;

    // Resolve Liquid variables in the path
    // Get version from context
    const version = ctx.get(['version', 'version']) ||
                   ctx.get(['page', 'version', 'version']) ||
                   'v26.1';

    // Replace version placeholders
    url = url.replace(/\{\{\s*page\.version\.version\s*\}\}/g, version);
    url = url.replace(/\{\{page\.version\.version\}\}/g, version);
    url = url.replace(/\{\{\s*version\.version\s*\}\}/g, version);

    // Remove .md and .html extensions
    url = url.replace(/\.md$/, '');
    url = url.replace(/\.html$/, '');

    // Ensure leading slash
    if (!url.startsWith('/')) {
      url = '/' + url;
    }

    // Remove trailing /index
    url = url.replace(/\/index$/, '/');

    return url;
  }
});

module.exports = function(eleventyConfig) {
  // ---------------------------------------------------------------------------
  // Liquid Engine Configuration - Use custom Liquid instance with raw tags
  // This bypasses Eleventy's argument parser which fails on URLs with colons
  // ---------------------------------------------------------------------------
  const { Liquid } = require('liquidjs');

  // Create custom Liquid engine
  const customLiquid = new Liquid({
    root: [path.join(__dirname, 'content', '_includes')],
    extname: '',
    dynamicPartials: true,
    strictFilters: false,
    strictVariables: false,
    jsTruthy: true
  });

  // Register custom tags directly on the Liquid engine (before Eleventy wraps it)
  const fs = require('fs');
  const pathModule = require('path');
  const EleventyFetch = require("@11ty/eleventy-fetch");

  // Helper to resolve {{ variable }} expressions in a string
  function resolveVarsInCtx(str, ctx) {
    const varPattern = /\{\{\s*([^}]+)\s*\}\}/g;
    return str.replace(varPattern, (match, varPath) => {
      const parts = varPath.trim().split('.');
      const resolved = ctx.get(parts);
      return resolved !== undefined ? resolved : '';
    });
  }

  // remote_include tag
  customLiquid.registerTag('remote_include', {
    parse: function(tagToken) { this.args = tagToken.args; },
    render: async function(ctx, emitter) {
      try {
        let resolvedUrl = resolveVarsInCtx(this.args.trim(), ctx);
        if (resolvedUrl.includes('{{')) {
          emitter.write(`<!-- remote_include: unresolved vars -->`);
          return;
        }
        let content = await EleventyFetch(resolvedUrl, {
          duration: "1d", type: "text",
          fetchOptions: { headers: { "User-Agent": "CockroachDB-Docs-Builder/1.0" } }
        });
        if (Buffer.isBuffer(content)) content = content.toString('utf8');
        emitter.write(content);
      } catch (error) {
        console.error(`remote_include error: ${error.message}`);
        emitter.write(`<!-- Remote include error: ${error.message} -->`);
      }
    }
  });

  // link tag
  customLiquid.registerTag('link', {
    parse: function(tagToken) { this.args = tagToken.args; },
    render: async function(ctx) {
      let url = resolveVarsInCtx(this.args.trim(), ctx);
      url = url.replace(/^["']|["']$/g, '').replace(/\.md$/, '').replace(/\.html$/, '');
      if (!url.startsWith('/')) url = '/' + url;
      return url.replace(/\/index$/, '/');
    }
  });

  // include tag
  customLiquid.registerTag('include', {
    parse: function(tagToken) { this.args = tagToken.args; },
    render: async function(ctx, emitter) {
      let argsStr = resolveVarsInCtx(this.args.trim(), ctx);
      const pathMatch = argsStr.match(/^["']?([^"'\s]+)["']?\s*(.*)$/);
      if (!pathMatch) { emitter.write(`<!-- include: parse error -->`); return; }
      let filePath = pathMatch[1];

      // If filePath looks like a variable name (no quotes, no slashes, no dots in filename part),
      // try to resolve it from context. E.g., {% include sidebar_data %}
      if (!filePath.includes('/') && !filePath.includes('.') && !argsStr.startsWith('"') && !argsStr.startsWith("'")) {
        const resolved = ctx.get([filePath]);
        if (resolved && typeof resolved === 'string') {
          filePath = resolved;
        }
      }

      const params = {};
      const paramPattern = /(\w+)\s*[=:]\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
      let match;
      while ((match = paramPattern.exec(pathMatch[2] || '')) !== null) {
        const key = match[1], value = match[2] || match[3] || match[4];
        params[key] = (value && !value.startsWith('"') && !value.startsWith("'"))
          ? (ctx.get(value.split('.')) ?? value) : value;
      }
      const fullPath = pathModule.join(__dirname, 'content', '_includes', filePath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const fullContext = { ...ctx.getAll(), include: params, ...params };
        try {
          emitter.write(await customLiquid.parseAndRender(content, fullContext));
        } catch (err) { emitter.write(`<!-- include error: ${err.message} -->`); }
      } else {
        if (!filePath.includes('copy-clipboard')) console.warn(`include: Not found: ${fullPath}`);
        emitter.write(`<!-- include: not found: ${filePath} -->`);
      }
    }
  });

  // include_cached tag - same as include
  customLiquid.registerTag('include_cached', {
    parse: function(tagToken) { this.args = tagToken.args; },
    render: async function(ctx, emitter) {
      let argsStr = resolveVarsInCtx(this.args.trim(), ctx);
      const pathMatch = argsStr.match(/^["']?([^"'\s]+)["']?\s*(.*)$/);
      if (!pathMatch) { emitter.write(`<!-- include_cached: parse error -->`); return; }
      let filePath = pathMatch[1];

      // If filePath looks like a variable name (no quotes, no slashes, no dots in filename part),
      // try to resolve it from context. E.g., {% include_cached sidebar_data %}
      if (!filePath.includes('/') && !filePath.includes('.') && !argsStr.startsWith('"') && !argsStr.startsWith("'")) {
        const resolved = ctx.get([filePath]);
        if (resolved && typeof resolved === 'string') {
          filePath = resolved;
        }
      }

      const params = {};
      const paramPattern = /(\w+)\s*[=:]\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
      let match;
      while ((match = paramPattern.exec(pathMatch[2] || '')) !== null) {
        const key = match[1], value = match[2] || match[3] || match[4];
        params[key] = (value && !value.startsWith('"') && !value.startsWith("'"))
          ? (ctx.get(value.split('.')) ?? value) : value;
      }
      const fullPath = pathModule.join(__dirname, 'content', '_includes', filePath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const fullContext = { ...ctx.getAll(), include: params, ...params };
        try {
          emitter.write(await customLiquid.parseAndRender(content, fullContext));
        } catch (err) { emitter.write(`<!-- include_cached error: ${err.message} -->`); }
      } else {
        if (!filePath.includes('copy-clipboard')) console.warn(`include_cached: Not found: ${fullPath}`);
        emitter.write(`<!-- include_cached: not found: ${filePath} -->`);
      }
    }
  });

  // Set this as the Liquid library
  eleventyConfig.setLibrary("liquid", customLiquid);

  // ---------------------------------------------------------------------------
  // Dev Server Configuration - /stable/ URL rewrite (not redirect)
  // ---------------------------------------------------------------------------
  eleventyConfig.setServerOptions({
    middleware: [
      // Rewrite /stable/* to serve content from current stable version
      // URL stays as /stable/ but internally serves from /v26.1/
      (req, res, next) => {
        if (req.url.startsWith('/stable/')) {
          req.url = req.url.replace('/stable/', `/${VERSION_CONFIG.stable}/`);
        }
        next();
      }
    ]
  });
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
  // NOTE: The link, include, and include_cached tags are registered directly
  // on customLiquid above (around line 185-265) to handle URLs with colons
  // and variable resolution. Do NOT add duplicate addLiquidTag registrations here.

  // ---------------------------------------------------------------------------
  // Dynamic Include Shortcodes
  // ---------------------------------------------------------------------------

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
  //
  // This shortcode reads the include file and processes it through Liquid
  // with the current template context, so variables like version.version work.

  eleventyConfig.addAsyncShortcode("dynamic_include", async function(versionVar, pathSuffix) {
    try {
      // Get the version from the Eleventy context
      // In our setup, 'version' is set by the directory data file (v26.1.11tydata.js)
      let version = this.ctx?.version?.version || this.version?.version;

      // Fallback: try to extract version from the current page path
      if (!version) {
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

        // Build the context for Liquid rendering
        // Include all the data available to the template
        const context = {
          // Page data
          page: this.page || {},
          // Version data from directory data file
          version: this.ctx?.version || this.version || { version: version },
          // Site data
          site: this.ctx?.site || this.site || {},
          // All versions for switcher
          allVersions: this.ctx?.allVersions || this.allVersions || [],
          // Pass through any other context
          ...this.ctx
        };

        // Also add page.version for Jekyll compatibility
        if (!context.page.version) {
          context.page.version = context.version;
        }

        // Render the content through Liquid
        let rendered;
        try {
          rendered = await liquidEngine.parseAndRender(content, context);
        } catch (liquidError) {
          console.error(`dynamic_include LIQUID ERROR in ${includePath}: ${liquidError.message}`);
          return `<!-- Liquid error in ${includePath}: ${liquidError.message} -->`;
        }

        return rendered;
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
