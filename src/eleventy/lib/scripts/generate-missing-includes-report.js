#!/usr/bin/env node
/**
 * Generate a CSV report of missing includes and which pages reference them.
 *
 * Usage: node generate-missing-includes-report.js
 *
 * Reads build errors from stdin or a file, then searches source files
 * to find which pages reference each missing include.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONTENT_DIR = path.join(__dirname, '..', '..', 'content');
const ERRORS_FILE = '/tmp/missing_includes.txt';

// Read error file
const errorContent = fs.readFileSync(ERRORS_FILE, 'utf8');
const errorLines = errorContent.split('\n').filter(line => line.trim());

// Parse errors into categories
const dynamicIncludes = new Map(); // path -> Set of referencing pages
const remoteIncludes = new Map();  // url -> Set of referencing pages

errorLines.forEach(line => {
  if (line.includes('dynamic_include: File not found:')) {
    const match = line.match(/File not found: (.+)$/);
    if (match) {
      let filePath = match[1].trim();
      // Extract just the include path (relative to _includes)
      const includesMatch = filePath.match(/_includes\/(.+)$/);
      if (includesMatch) {
        filePath = includesMatch[1];
      }
      if (!dynamicIncludes.has(filePath)) {
        dynamicIncludes.set(filePath, new Set());
      }
    }
  } else if (line.includes('remote_include error: Bad response for')) {
    const match = line.match(/Bad response for ([^\s]+)/);
    if (match) {
      const url = match[1];
      if (!remoteIncludes.has(url)) {
        remoteIncludes.set(url, new Set());
      }
    }
  }
});

console.log(`Found ${dynamicIncludes.size} unique missing dynamic includes`);
console.log(`Found ${remoteIncludes.size} unique missing remote includes`);

// Search for references in source files
function searchForPattern(pattern, fileGlob = '*.md') {
  try {
    // Escape special regex chars for grep
    const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const result = execSync(
      `grep -rl "${escapedPattern}" --include="${fileGlob}" ${CONTENT_DIR} 2>/dev/null || true`,
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    );
    return result.split('\n').filter(f => f.trim()).map(f => {
      // Make path relative to content dir
      return f.replace(CONTENT_DIR + '/', '');
    });
  } catch (e) {
    return [];
  }
}

// For dynamic includes, search for the include path pattern
console.log('\nSearching for dynamic include references...');
dynamicIncludes.forEach((pages, includePath) => {
  // Extract the path after version prefix (e.g., "v26.1/ui/insights.md" -> "ui/insights.md")
  // or handle malformed paths like "v26.1ui/insights.md"
  let searchPattern = includePath;

  // Try to find the meaningful part of the path
  const pathMatch = includePath.match(/v\d+\.\d+\/?(.+)$/);
  if (pathMatch) {
    searchPattern = pathMatch[1];
  }

  // Search for this pattern in dynamic_include calls
  const refs = searchForPattern(searchPattern);
  refs.forEach(ref => pages.add(ref));
});

// For remote includes, search for the URL or a unique part of it
console.log('Searching for remote include references...');
remoteIncludes.forEach((pages, url) => {
  // Extract the filename from the URL for searching
  const urlMatch = url.match(/\/([^\/]+)$/);
  if (urlMatch) {
    const filename = urlMatch[1];
    const refs = searchForPattern(filename);
    refs.forEach(ref => pages.add(ref));
  }
});

// Generate CSV output
const csvLines = [];
csvLines.push('Type,Missing Resource,Referencing Pages');

// Sort and output dynamic includes
const sortedDynamic = [...dynamicIncludes.entries()].sort((a, b) => a[0].localeCompare(b[0]));
sortedDynamic.forEach(([includePath, pages]) => {
  const pageList = [...pages].sort().join('; ') || '(unable to determine)';
  // Escape quotes in CSV
  const escapedPath = includePath.replace(/"/g, '""');
  const escapedPages = pageList.replace(/"/g, '""');
  csvLines.push(`dynamic_include,"${escapedPath}","${escapedPages}"`);
});

// Sort and output remote includes
const sortedRemote = [...remoteIncludes.entries()].sort((a, b) => a[0].localeCompare(b[0]));
sortedRemote.forEach(([url, pages]) => {
  const pageList = [...pages].sort().join('; ') || '(unable to determine)';
  // Escape quotes in CSV
  const escapedUrl = url.replace(/"/g, '""');
  const escapedPages = pageList.replace(/"/g, '""');
  csvLines.push(`remote_include,"${escapedUrl}","${escapedPages}"`);
});

// Write CSV file
const csvContent = csvLines.join('\n');
const outputPath = path.join(__dirname, '..', '..', 'MISSING_INCLUDES_REPORT.csv');
fs.writeFileSync(outputPath, csvContent);

console.log(`\nReport written to: ${outputPath}`);
console.log(`Total entries: ${dynamicIncludes.size + remoteIncludes.size}`);

// Also output a summary to console
console.log('\n--- Summary ---');
console.log('\nTop missing dynamic includes:');
sortedDynamic.slice(0, 10).forEach(([path, pages]) => {
  console.log(`  ${path} (${pages.size} refs)`);
});

console.log('\nTop missing remote includes:');
sortedRemote.slice(0, 10).forEach(([url, pages]) => {
  // Shorten URL for display
  const shortUrl = url.length > 80 ? url.substring(0, 77) + '...' : url;
  console.log(`  ${shortUrl} (${pages.size} refs)`);
});
