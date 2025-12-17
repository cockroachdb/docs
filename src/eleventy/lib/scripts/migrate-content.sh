#!/bin/bash
#
# Content Migration Script
# Copies content from Jekyll source to 11ty structure
#
# Usage: npm run migrate:content
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ELEVENTY_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
JEKYLL_DIR="$(dirname "$ELEVENTY_DIR")/current"
CONTENT_DIR="$ELEVENTY_DIR/content"

echo "=================================================="
echo "CockroachDB Docs: Jekyll to 11ty Content Migration"
echo "=================================================="
echo ""
echo "Source (Jekyll): $JEKYLL_DIR"
echo "Target (11ty):   $CONTENT_DIR"
echo ""

# Check if Jekyll source exists
if [ ! -d "$JEKYLL_DIR" ]; then
    echo "ERROR: Jekyll source directory not found: $JEKYLL_DIR"
    exit 1
fi

# Create content directory if it doesn't exist
mkdir -p "$CONTENT_DIR"

echo "Step 1: Copying _data directory..."
cp -r "$JEKYLL_DIR/_data" "$CONTENT_DIR/" 2>/dev/null || echo "  (no _data found or already exists)"

echo "Step 2: Copying _includes directory..."
cp -r "$JEKYLL_DIR/_includes" "$CONTENT_DIR/" 2>/dev/null || echo "  (no _includes found or already exists)"

echo "Step 3: Copying _layouts directory..."
cp -r "$JEKYLL_DIR/_layouts" "$CONTENT_DIR/" 2>/dev/null || echo "  (no _layouts found or already exists)"

echo "Step 4: Copying versioned content directories..."
for dir in "$JEKYLL_DIR"/v*/; do
    if [ -d "$dir" ]; then
        dirname=$(basename "$dir")
        echo "  Copying $dirname..."
        cp -r "$dir" "$CONTENT_DIR/"
    fi
done

echo "Step 5: Copying other content directories..."
for dir in cockroachcloud releases molt advisories; do
    if [ -d "$JEKYLL_DIR/$dir" ]; then
        echo "  Copying $dir..."
        cp -r "$JEKYLL_DIR/$dir" "$CONTENT_DIR/"
    fi
done

echo "Step 6: Copying static assets..."
for asset in images js css fonts; do
    if [ -d "$JEKYLL_DIR/$asset" ]; then
        echo "  Copying $asset..."
        cp -r "$JEKYLL_DIR/$asset" "$CONTENT_DIR/"
    fi
done

echo "Step 7: Copying root-level pages..."
for file in "$JEKYLL_DIR"/*.md "$JEKYLL_DIR"/*.html; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        # Skip Jekyll-specific files
        if [[ "$filename" != "_"* ]]; then
            echo "  Copying $filename..."
            cp "$file" "$CONTENT_DIR/"
        fi
    fi
done

echo ""
echo "=================================================="
echo "Content copy complete!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "  1. Run: npm run migrate:links -- --dry-run"
echo "  2. Run: npm run migrate:includes -- --dry-run"
echo "  3. Review changes, then run without --dry-run"
echo "  4. Run: npm run dev"
echo ""
