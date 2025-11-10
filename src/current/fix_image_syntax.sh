#!/bin/bash

# Fix the broken image syntax we caused with our global replace
# Convert {{ 'images/{{ page.version.version }}' to {{ 'images/' | append: page.version.version | append: '

echo "Fixing broken image syntax..."

# Find and fix the broken pattern
find . -name "*.md" -type f -exec grep -l "images/{{ page\.version\.version" {} \; | while read file; do
    echo "Fixing $file"
    sed -i '' "s/{{ 'images\/{{ page\.version\.version }}\//{{ 'images\/' | append: page.version.version | append: '\//g" "$file"
done

echo "Done fixing image syntax."