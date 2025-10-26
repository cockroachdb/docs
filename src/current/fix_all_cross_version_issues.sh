#!/bin/bash

echo "🔧 Fixing all remaining cross-version link and Liquid syntax issues..."

# Fix all cross-version links to v22.2 (replace with v23.2 or archived)
echo "1. Fixing cross-version links to v22.2..."

# Fix backward-incompatible/alpha.1.md files across all versions
find ./_includes -name "alpha.1.md" -path "*/backward-incompatible/*" -exec sed -i '' \
    -e 's/{% link v22\.2\/grant\.md %}/{% link v23.2\/grant.md %}/g' \
    -e 's/{% link v22\.2\/transactions\.md %}/{% link v23.2\/transactions.md %}/g' \
    {} \;

echo "   ✅ Fixed grant.md and transactions.md references"

# Fix broken image syntax patterns
echo "2. Fixing broken image syntax..."

# Fix the pattern: {{ 'images/{{ page.version.version }}/ → {{ 'images/' | append: page.version.version | append: '/
find . -name "*.md" -type f -exec sed -i '' \
    "s/{{ 'images\/{{ page\.version\.version }}\//{{ 'images\/' | append: page.version.version | append: '\//g" \
    {} \;

echo "   ✅ Fixed broken image syntax patterns"

# Count the fixes
echo "3. Verification..."

cross_version_count=$(grep -r "{% link v22\.2/" --include="*.md" . | wc -l)
broken_image_count=$(grep -r "images/{{ page\.version\.version }}" --include="*.md" . | wc -l)

echo "   Cross-version v22.2 links remaining: $cross_version_count"
echo "   Broken image syntax remaining: $broken_image_count"

if [ "$cross_version_count" -eq 0 ] && [ "$broken_image_count" -eq 0 ]; then
    echo "✅ All cross-version issues fixed!"
else
    echo "⚠️  Some issues may remain - manual review needed"
fi

echo "🎯 Cross-version archive cleanup complete!"