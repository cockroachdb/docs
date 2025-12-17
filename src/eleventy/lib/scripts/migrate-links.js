/**
 * Migration script: Convert Jekyll {% link %} tags to 11ty format
 *
 * Jekyll syntax:
 *   {% link {{ page.version.version }}/path/file.md %}
 *   {% link path/to/file.md %}
 *
 * 11ty syntax:
 *   {% link "{{ page.version.version }}/path/file.md" %}
 *   {% link "path/to/file.md" %}
 *
 * Usage: node lib/scripts/migrate-links.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const DRY_RUN = process.argv.includes('--dry-run');
const CONTENT_DIR = path.join(__dirname, '../../content');

// Pattern to match {% link ... %} tags
// Captures the content between {% link and %}
const LINK_PATTERN = /\{%[-]?\s*link\s+([^%]+?)\s*[-]?%\}/g;

function migrateLinks(content, filePath) {
  let changeCount = 0;

  const migrated = content.replace(LINK_PATTERN, (match, linkPath) => {
    const trimmedPath = linkPath.trim();

    // Skip if already quoted
    if (trimmedPath.startsWith('"') || trimmedPath.startsWith("'")) {
      return match;
    }

    changeCount++;

    // Wrap the path in quotes
    // Preserve any whitespace control characters (- in {%- or -%})
    const hasLeadingDash = match.startsWith('{%-');
    const hasTrailingDash = match.endsWith('-%}');

    let result = '{%';
    if (hasLeadingDash) result = '{%-';
    result += ` link "${trimmedPath}" `;
    if (hasTrailingDash) {
      result += '-%}';
    } else {
      result += '%}';
    }

    return result;
  });

  return { migrated, changeCount };
}

async function main() {
  console.log(`\nMigrating {% link %} tags...`);
  console.log(`Content directory: ${CONTENT_DIR}`);
  if (DRY_RUN) {
    console.log('DRY RUN - no files will be modified\n');
  }

  // Find all markdown and HTML files
  const files = await glob('**/*.{md,html}', {
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
      const { migrated, changeCount } = migrateLinks(content, file);

      if (changeCount > 0) {
        totalChanges += changeCount;
        filesModified++;

        const relativePath = path.relative(CONTENT_DIR, file);
        console.log(`  ${relativePath}: ${changeCount} link(s)`);

        if (!DRY_RUN) {
          fs.writeFileSync(file, migrated, 'utf8');
        }
      }
    } catch (error) {
      console.error(`Error processing ${file}: ${error.message}`);
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Total: ${totalChanges} links in ${filesModified} files`);
  if (DRY_RUN) {
    console.log('Run without --dry-run to apply changes');
  } else {
    console.log('Migration complete!');
  }
}

main().catch(console.error);
