/**
 * Migration script: Convert Jekyll include syntax to 11ty Liquid format
 *
 * Changes:
 * 1. {% include file.html %} -> {% include "file.html" %}
 * 2. {% include_cached file.html %} -> {% include "file.html" %}
 * 3. {% include file.html param=value %} -> {% include "file.html" param: value %}
 * 4. {% include {{ var }}/file.html %} -> {% dynamic_include var "/file.html" %}
 *
 * Also migrates inside include files:
 * - {{ include.param }} -> {{ param }}
 *
 * Usage: node lib/scripts/migrate-includes.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const DRY_RUN = process.argv.includes('--dry-run');
const CONTENT_DIR = path.join(__dirname, '../../content');

// Pattern for dynamic includes: {% include {{ var }}/path/file.md %} or with params
// This is Jekyll-specific and needs special handling
// Group 1: variable name (e.g., page.version.version)
// Group 2: rest of path (e.g., /zone-configs/file.md)
// Group 3: optional parameters (e.g., hide-enterprise-warning="true")
const DYNAMIC_INCLUDE_PATTERN = /\{%[-]?\s*include(?:_cached)?\s+\{\{\s*([^}]+)\s*\}\}([^\s%]+)(\s+[^%]+)?\s*[-]?%\}/g;

// Pattern for {% include file.html %} or {% include_cached file.html %}
// With optional parameters - but NOT matching dynamic includes
const STATIC_INCLUDE_PATTERN = /\{%[-]?\s*include(?:_cached)?\s+([^\s%{]+)(\s+[^%]*)?\s*[-]?%\}/g;

// Pattern for {{ include.param }}
const INCLUDE_VAR_PATTERN = /\{\{\s*include\.(\w+)\s*\}\}/g;

// Pattern for parameter assignments: key=value or key="value"
const PARAM_PATTERN = /(\w+)\s*=\s*("[^"]*"|'[^']*'|[^\s%]+)/g;

function migrateIncludeSyntax(content, filePath) {
  let changeCount = 0;

  // First, handle dynamic includes: {% include {{ page.version.version }}/path.md %}
  // Convert to: {% dynamic_include page.version.version, "/path.md" %}
  // Note: parameters after the path are currently not supported and will be dropped
  let migrated = content.replace(DYNAMIC_INCLUDE_PATTERN, (match, varName, restOfPath, paramsStr) => {
    changeCount++;

    const hasLeadingDash = match.startsWith('{%-');
    const hasTrailingDash = match.endsWith('-%}');

    // Log warning if parameters are being dropped
    if (paramsStr && paramsStr.trim()) {
      console.warn(`  Warning: Dropping parameters "${paramsStr.trim()}" from dynamic include`);
    }

    let result = hasLeadingDash ? '{%-' : '{%';
    result += ` dynamic_include ${varName.trim()}, "${restOfPath.trim()}"`;
    result += ' ';
    result += hasTrailingDash ? '-%}' : '%}';

    return result;
  });

  // Then, handle static includes (but not the ones we already converted)
  migrated = migrated.replace(STATIC_INCLUDE_PATTERN, (match, fileName, paramsStr) => {
    // Skip if this looks like it was already converted or is a dynamic_include
    if (match.includes('dynamic_include')) {
      return match;
    }

    // Skip if fileName starts with a quote (already migrated)
    if (fileName.startsWith('"') || fileName.startsWith("'")) {
      return match;
    }

    changeCount++;

    const hasLeadingDash = match.startsWith('{%-');
    const hasTrailingDash = match.endsWith('-%}');

    let result = hasLeadingDash ? '{%-' : '{%';
    result += ` include "${fileName.trim()}"`;

    // Convert parameters if present
    if (paramsStr && paramsStr.trim()) {
      const params = [];
      let paramMatch;

      // Reset regex lastIndex
      PARAM_PATTERN.lastIndex = 0;

      while ((paramMatch = PARAM_PATTERN.exec(paramsStr)) !== null) {
        const [, key, value] = paramMatch;
        // Convert = to : for 11ty Liquid
        params.push(`${key}: ${value}`);
      }

      if (params.length > 0) {
        result += ', ' + params.join(', ');
      }
    }

    result += ' ';
    result += hasTrailingDash ? '-%}' : '%}';

    return result;
  });

  // Then, migrate include.param references
  migrated = migrated.replace(INCLUDE_VAR_PATTERN, (match, paramName) => {
    changeCount++;
    return `{{ ${paramName} }}`;
  });

  return { migrated, changeCount };
}

async function main() {
  console.log(`\nMigrating include syntax...`);
  console.log(`Content directory: ${CONTENT_DIR}`);
  if (DRY_RUN) {
    console.log('DRY RUN - no files will be modified\n');
  }

  // Find all template files
  const files = await glob('**/*.{md,html,liquid}', {
    cwd: CONTENT_DIR,
    absolute: true,
    ignore: ['**/node_modules/**', '**/_site/**']
  });

  console.log(`Found ${files.length} files to process\n`);

  let totalChanges = 0;
  let filesModified = 0;
  let dynamicIncludes = 0;

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');

      // Count dynamic includes before migration
      const dynamicMatches = content.match(DYNAMIC_INCLUDE_PATTERN);
      if (dynamicMatches) {
        dynamicIncludes += dynamicMatches.length;
      }

      const { migrated, changeCount } = migrateIncludeSyntax(content, file);

      if (changeCount > 0) {
        totalChanges += changeCount;
        filesModified++;

        const relativePath = path.relative(CONTENT_DIR, file);
        console.log(`  ${relativePath}: ${changeCount} change(s)`);

        if (!DRY_RUN) {
          fs.writeFileSync(file, migrated, 'utf8');
        }
      }
    } catch (error) {
      console.error(`Error processing ${file}: ${error.message}`);
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Total: ${totalChanges} changes in ${filesModified} files`);
  console.log(`Dynamic includes converted: ${dynamicIncludes}`);
  if (DRY_RUN) {
    console.log('Run without --dry-run to apply changes');
  } else {
    console.log('Migration complete!');
  }
}

main().catch(console.error);
