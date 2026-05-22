#!/bin/bash
set -euo pipefail

echo "🔄 Converting Static Includes to Cached Versions"
echo "=============================================="

# List of includes that are safe to cache (no page context dependencies)
STATIC_INCLUDES=(
    "copy-clipboard.html"
    "contribute-options.html"
    "warning.html"
    "note.html"
    "info.html"
    "sql-include-tab.html"
    "filter-tabs.html"
    "sidebar-releases.json"
    "sql-table-columns.html"
    "sql-table-indexes.html"
    "tooltip.html"
    "collapse-start.html"
    "collapse-end.html"
    "enterprise-feature.html"
    "new-in.html"
    "cloud-callout.html"
    "experimental-disclaimer.html"
    "tab-start.html"
    "tab-end.html"
    "feedback-widget-bottom.html"
)

# Create backup
echo "📦 Creating backup..."
cp -r _includes _includes.backup 2>/dev/null || true

converted_count=0
total_files=0

for include in "${STATIC_INCLUDES[@]}"; do
    echo "🔍 Converting: $include"
    
    # Find all files that use this include
    files=$(find . -name "*.md" -o -name "*.html" | xargs grep -l "{% include $include" 2>/dev/null || true)
    
    if [[ -n "$files" ]]; then
        for file in $files; do
            # Skip if it's already cached
            if grep -q "{% include_cached $include" "$file" 2>/dev/null; then
                continue
            fi
            
            # Convert to cached version
            sed -i.bak "s/{% include $include/{% include_cached $include/g" "$file"
            rm -f "$file.bak" 2>/dev/null || true
            
            ((converted_count++))
        done
        
        file_count=$(echo "$files" | wc -l)
        ((total_files += file_count))
        echo "  ✅ Converted in $file_count files"
    else
        echo "  ℹ️  No usage found"
    fi
done

echo ""
echo "📊 CONVERSION SUMMARY:"
echo "======================"
echo "✅ Total conversions: $converted_count"
echo "📁 Files processed: $total_files"
echo "🗂️  Include types converted: ${#STATIC_INCLUDES[@]}"
echo ""
echo "💡 Backup created at: _includes.backup"
echo "🚀 Ready for performance testing!"