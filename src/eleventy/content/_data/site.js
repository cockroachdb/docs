/**
 * Site Data File
 *
 * This replicates Jekyll's site.data.* namespace for compatibility.
 * In Jekyll, data files are accessed via site.data.filename.key
 * In Eleventy, they're accessed directly via filename.key
 *
 * This file creates a site.data namespace that mirrors the data files
 * so that existing Jekyll templates like {{site.data.alerts.callout_info}}
 * continue to work in Eleventy.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

module.exports = function() {
  const dataDir = __dirname;
  const data = {};

  // List of YAML data files to include in site.data
  const dataFiles = [
    'alerts.yml',
    'cards.yml',
    'constants.yml',
    'menus.yml',
    'menuwhy.yml',
    'products.yml',
    'redirects.yml',
    'releases.yml',
    'settings_main_nav.yml',
    'versions.csv'
  ];

  for (const file of dataFiles) {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const baseName = file.replace(/\.(yml|yaml|csv)$/, '');

        if (file.endsWith('.csv')) {
          // Parse CSV into an array of objects
          const lines = content.trim().split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          data[baseName] = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj = {};
            headers.forEach((h, i) => {
              obj[h] = values[i] || '';
            });
            return obj;
          });
        } else {
          // Parse YAML
          data[baseName] = yaml.load(content);
        }
      } catch (err) {
        console.warn(`Warning: Could not load ${file}:`, err.message);
      }
    }
  }

  // Define the stable/current versions
  const stableVersion = "v26.1";

  // Return the site object with Jekyll-compatible structure
  return {
    title: "CockroachDB Docs",
    main_url: "https://www.cockroachlabs.com",
    baseurl: process.env.DOCS_BASE_PATH !== undefined ? process.env.DOCS_BASE_PATH : '/docs',
    // Version aliases map - used by sidebar.js.html for isVersionDirectory
    versions: {
      stable: stableVersion,
      dev: null,
    },
    // Current version for unversioned pages (like /molt/) that link to versioned docs
    // Used in templates as {{ site.current_cloud_version }}
    current_cloud_version: stableVersion,
    // The key part: data namespace for Jekyll compatibility
    data: data
  };
};
