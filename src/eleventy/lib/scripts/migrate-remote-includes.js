/**
 * Migration script: Convert remote_include syntax for 11ty
 *
 * Changes:
 * {% remote_include URL %} -> {% remote_include "URL" %}
 * {% remote_include URL ||start ||end %} -> {% remote_include "URL", "start", "end" %}
 *
 * Usage: node lib/scripts/migrate-remote-includes.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const DRY_RUN = process.argv.includes('--dry-run');
const CONTENT_DIR = path.join(__dirname, '../../content');

// Pattern for remote_include with markers: {% remote_include URL ||start ||end %}
// The URL can contain {{ liquid }} expressions
const REMOTE_INCLUDE_WITH_MARKERS = /\{%[-]?\s*remote_include\s+(.+?)\s+\|\|(.+?)\s*\|\|(.+?)\s*[-]?%\}/g;

// Pattern for simple remote_include: {% remote_include URL %}
// The URL can contain {{ liquid }} expressions
const REMOTE_INCLUDE_SIMPLE = /\{%[-]?\s*remote_include\s+(.+?)\s*[-]?%\}/g;

function migrateRemoteIncludes(content, filePath) {
  let changeCount = 0;

  // First, handle remote_include with markers
  let migrated = content.replace(REMOTE_INCLUDE_WITH_MARKERS, (match, url, startMarker, endMarker) => {
    changeCount++;
    const hasLeadingDash = match.startsWith('{%-');
    const hasTrailingDash = match.endsWith('-%}');

    let result = hasLeadingDash ? '{%-' : '{%';
    result += ` remote_include "${url.trim()}", "${startMarker.trim()}", "${endMarker.trim()}"`;
    result += ' ';
    result += hasTrailingDash ? '-%}' : '%}';

    return result;
  });

  // Then handle simple remote_include (but not the ones we already converted)
  migrated = migrated.replace(REMOTE_INCLUDE_SIMPLE, (match, url) => {
    // Skip if already has quotes
    if (url.startsWith('"') || url.startsWith("'")) {
      return match;
    }

    changeCount++;
    const hasLeadingDash = match.startsWith('{%-');
    const hasTrailingDash = match.endsWith('-%}');

    let result = hasLeadingDash ? '{%-' : '{%';
    result += ` remote_include "${url.trim()}"`;
    result += ' ';
    result += hasTrailingDash ? '-%}' : '%}';

    return result;
  });

  return { migrated, changeCount };
}

async function main() {
  console.log(`\nMigrating remote_include syntax...`);
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

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const { migrated, changeCount } = migrateRemoteIncludes(content, file);

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
  if (DRY_RUN) {
    console.log('Run without --dry-run to apply changes');
  } else {
    console.log('Migration complete!');
  }
}

main().catch(console.error);
