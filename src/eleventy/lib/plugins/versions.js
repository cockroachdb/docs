/**
 * Versioning Plugin for CockroachDB Docs
 *
 * Replicates the Jekyll versioning plugin functionality:
 * - Injects page.version, page.release_info, page.versions into pages
 * - Determines sidebar_data based on version
 * - Generates canonical URLs
 * - Supports version switcher
 */

// Version configuration - update this as new versions are released
const VERSION_CONFIG = {
  // Current stable version
  stable: 'v26.1',

  // Development version (if any)
  dev: null,

  // All available versions in order (newest first)
  all: [
    'v26.1',
    'v25.4',
    'v25.3',
    'v25.2',
    'v25.1',
    'v24.3',
    'v24.2',
    'v24.1',
    'v23.2',
    'v23.1',
    'v22.2',
    'v22.1',
    'v21.2',
    'v21.1',
    'v20.2',
    'v20.1',
    'v19.2',
    'v19.1',
    'v2.1',
    'v2.0',
    'v1.1',
    'v1.0'
  ],

  // Versions that are no longer supported (for display purposes)
  unsupported: [
    'v19.2',
    'v19.1',
    'v2.1',
    'v2.0',
    'v1.1',
    'v1.0'
  ]
};

/**
 * Extract version from file path
 * @param {string} inputPath - The input file path
 * @returns {string|null} - The version string (e.g., 'v26.1') or null
 */
function getVersionFromPath(inputPath) {
  if (!inputPath) return null;

  // Match version pattern like /v26.1/ or /v2.1/
  const match = inputPath.match(/[/\\](v\d+\.\d+)[/\\]/);
  return match ? match[1] : null;
}

/**
 * Format version name for display
 * @param {string} version - The version string
 * @returns {string} - Formatted version name
 */
function formatVersionName(version) {
  if (version === VERSION_CONFIG.stable) {
    return `${version} (Stable)`;
  }
  if (version === VERSION_CONFIG.dev) {
    return `${version} (Development)`;
  }
  if (VERSION_CONFIG.unsupported.includes(version)) {
    return `${version} (Unsupported)`;
  }
  return version;
}

/**
 * Get page key for version comparison
 * Pages with the same key across versions are linked in the version switcher
 * @param {object} page - The page object
 * @returns {string} - The page key
 */
function getPageKey(page) {
  // Check if page has a custom key in frontmatter
  if (page.data && page.data.key) {
    return page.data.key;
  }

  // Use the URL path without the version prefix
  let url = page.url || '';
  url = url.replace(/^\/v\d+\.\d+\//, '/');
  url = url.replace(/\/index\.html$/, '/');
  url = url.replace(/\.html$/, '');

  return url;
}

/**
 * Build versions array for version switcher
 * @returns {Array} - Array of version objects
 */
function buildVersionsArray() {
  return VERSION_CONFIG.all.map(version => ({
    version: version,
    name: formatVersionName(version),
    tag: version,
    stable: version === VERSION_CONFIG.stable,
    unsupported: VERSION_CONFIG.unsupported.includes(version)
  }));
}

/**
 * Eleventy computed data for versioning
 * These values are computed for each page and available in templates
 */
const eleventyComputed = {
  // The version object for the current page
  // Templates expect page.version.version, page.version.name, etc.
  version: (data) => {
    const version = getVersionFromPath(data.page?.inputPath);
    if (!version) return null;

    return {
      version: version,
      name: formatVersionName(version),
      stable: version === VERSION_CONFIG.stable,
      unsupported: VERSION_CONFIG.unsupported.includes(version)
    };
  },

  // Release info for the current version (loaded from data files)
  release_info: (data) => {
    const version = getVersionFromPath(data.page?.inputPath);
    if (!version) return {};

    // Use the processed release_info data
    if (data.release_info && data.release_info[version]) {
      return data.release_info[version];
    }

    // Fallback to stable version's release_info
    const stableInfo = data.release_info?.[VERSION_CONFIG.stable];
    return stableInfo || {};
  },

  // All versions for the version switcher
  versions: (data) => {
    return buildVersionsArray();
  },

  // Sidebar data file path for the current version
  sidebar_data: (data) => {
    // If already set in frontmatter, use that
    if (data.sidebar_data) return data.sidebar_data;

    const inputPath = data.page?.inputPath || '';

    // Cockroachcloud pages use the stable version's sidebar
    // (the main sidebar includes cockroachcloud links under "Get Started")
    if (inputPath.includes('/cockroachcloud/')) {
      return `sidebar-data-${VERSION_CONFIG.stable}.json`;
    }

    // Check for versioned pages (e.g., /v26.1/page.md)
    const version = getVersionFromPath(inputPath);
    if (version) {
      return `sidebar-data-${version}.json`;
    }

    // Default to stable version's sidebar for non-versioned pages
    return `sidebar-data-${VERSION_CONFIG.stable}.json`;
  },

  // Canonical URL (points to stable version of the page)
  canonical: (data) => {
    // If already set in frontmatter, use that
    if (data.canonical) return data.canonical;

    const url = data.page?.url || '';
    const stableVersion = VERSION_CONFIG.stable;

    // Replace version in URL with stable version
    const canonicalUrl = url.replace(/\/v\d+\.\d+\//, `/${stableVersion}/`);

    // Clean up the URL
    return canonicalUrl
      .replace(/\/index\.html$/, '/')
      .replace(/\.html$/, '')
      .toLowerCase();
  }
};

/**
 * Plugin configuration for Eleventy
 * @param {object} eleventyConfig - Eleventy config object
 * @param {object} options - Plugin options
 */
function versionsPlugin(eleventyConfig, options = {}) {
  // Merge options with defaults
  const config = { ...VERSION_CONFIG, ...options };

  // Add global data for version config
  eleventyConfig.addGlobalData('versionConfig', config);

  // Add computed data
  eleventyConfig.addGlobalData('eleventyComputed', eleventyComputed);

  // Add filter to check if a version is stable
  eleventyConfig.addFilter('isStableVersion', (version) => {
    return version === config.stable;
  });

  // Add filter to check if a version is supported
  eleventyConfig.addFilter('isSupportedVersion', (version) => {
    return !config.unsupported.includes(version);
  });

  // Add filter to get version display name
  eleventyConfig.addFilter('versionName', formatVersionName);

  // Add shortcode for version badge
  eleventyConfig.addShortcode('versionBadge', (version) => {
    const isStable = version === config.stable;
    const isUnsupported = config.unsupported.includes(version);

    let badgeClass = 'version-badge';
    if (isStable) badgeClass += ' version-badge--stable';
    if (isUnsupported) badgeClass += ' version-badge--unsupported';

    return `<span class="${badgeClass}">${formatVersionName(version)}</span>`;
  });
}

module.exports = {
  VERSION_CONFIG,
  getVersionFromPath,
  formatVersionName,
  getPageKey,
  buildVersionsArray,
  eleventyComputed,
  versionsPlugin
};
