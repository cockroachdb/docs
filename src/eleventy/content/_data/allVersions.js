/**
 * Versions Data File
 *
 * Provides the list of all CockroachDB versions for the version switcher.
 * Pre-computes release info and LTS status to avoid expensive template loops.
 * Only includes versions that have content directories in Eleventy.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Version configuration - should match lib/plugins/versions.js
const VERSION_CONFIG = {
  stable: 'v26.1',
  dev: null,
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
  unsupported: [
    'v19.2',
    'v19.1',
    'v2.1',
    'v2.0',
    'v1.1',
    'v1.0'
  ]
};

// Check which versions have content directories in Eleventy
function getAvailableVersions() {
  const contentDir = path.join(__dirname, '..');
  return VERSION_CONFIG.all.filter(ver => {
    const versionDir = path.join(contentDir, ver);
    return fs.existsSync(versionDir) && fs.statSync(versionDir).isDirectory();
  });
}

function formatVersionName(ver) {
  if (ver === VERSION_CONFIG.stable) {
    return `${ver} (Stable)`;
  }
  if (ver === VERSION_CONFIG.dev) {
    return `${ver} (Development)`;
  }
  if (VERSION_CONFIG.unsupported.includes(ver)) {
    return `${ver} (Unsupported)`;
  }
  return ver;
}

// Load and parse releases.yml to count releases per version
function loadReleases() {
  try {
    const releasesPath = path.join(__dirname, 'releases.yml');
    const content = fs.readFileSync(releasesPath, 'utf8');
    return yaml.load(content) || [];
  } catch (err) {
    console.warn('Could not load releases.yml:', err.message);
    return [];
  }
}

// Load and parse versions.csv to get LTS info
function loadVersionsCSV() {
  try {
    const versionsPath = path.join(__dirname, 'versions.csv');
    const content = fs.readFileSync(versionsPath, 'utf8');
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || '';
      });
      return obj;
    });
  } catch (err) {
    console.warn('Could not load versions.csv:', err.message);
    return [];
  }
}

module.exports = function() {
  // Load data once during build
  const releases = loadReleases();
  const versionsCSV = loadVersionsCSV();

  // Count releases per version
  const releaseCounts = {};
  for (const rel of releases) {
    const ver = rel.major_version;
    releaseCounts[ver] = (releaseCounts[ver] || 0) + 1;
  }

  // Build lookup for version details from CSV
  const versionDetails = {};
  for (const v of versionsCSV) {
    versionDetails[v.major_version] = v;
  }

  // Only include versions that have content directories in Eleventy
  const availableVersions = getAvailableVersions();

  // Build the versions array for the version switcher
  return availableVersions.map(ver => {
    const details = versionDetails[ver] || {};
    const hasReleases = (releaseCounts[ver] || 0) > 0;
    const isLts = details.initial_lts_patch && details.initial_lts_patch !== 'N/A';

    return {
      version: {
        version: ver,
        name: formatVersionName(ver),
        tag: ver,
        stable: ver === VERSION_CONFIG.stable,
        unsupported: VERSION_CONFIG.unsupported.includes(ver)
      },
      // Pre-computed values to avoid expensive template loops
      hasReleases: hasReleases,
      releaseCount: releaseCounts[ver] || 0,
      isLts: isLts,
      // Version details from CSV
      details: details,
      // URL for this version (template can adjust based on current page)
      url: `/${ver}/`
    };
  });
};
