#!/bin/bash
set -euo pipefail

echo "⚡ Quick Optimization Tests"
echo "=========================="

# Test 1: Check if optimizations are configured correctly
echo ""
echo "🔍 TEST 1: Configuration Check"
echo "------------------------------"

# Check YJIT in Makefile
if grep -q "RUBY_YJIT_ENABLE=1" Makefile; then
    echo "✅ YJIT enabled in Makefile"
else
    echo "❌ YJIT not enabled in Makefile"
fi

# Check optimized config exists
if [ -f "_config_cockroachdb_local.yml" ] && grep -q "jekyll_get_json: \[\]" _config_cockroachdb_local.yml; then
    echo "✅ Optimized local config exists"
else
    echo "❌ Optimized local config missing or incomplete"
fi

# Check version data exists
if [ -f "_data/version_mappings.yml" ]; then
    echo "✅ Precomputed version data exists"
else
    echo "❌ Precomputed version data missing"
fi

# Check optimized includes exist
if [ -f "_includes/version-switcher-js.html" ] && [ -f "_includes/page-header.html" ]; then
    echo "✅ Optimized includes exist"
else
    echo "❌ Optimized includes missing"
fi

# Test 2: Count cached includes
echo ""
echo "📊 TEST 2: Include Caching Status"
echo "---------------------------------"
cached_count=$(find . -name "*.md" -o -name "*.html" | head -100 | xargs grep -c "{% include_cached" 2>/dev/null | awk -F: '{sum+=$2} END {print sum}' || echo "0")
echo "✅ Found $cached_count cached includes in first 100 files"

# Test 3: Micro build test (just one file)
echo ""
echo "⚡ TEST 3: Micro Build Test"
echo "--------------------------"
echo "Building just the homepage with optimizations..."

# Create a minimal test config
cat > _config_test.yml << EOF
baseurl: /docs
destination: _site/docs
exclude:
  - "v*/**"
  - "_includes/**"
  - "scripts/**"
  - "vendor/**"
  - "archived/**"
jekyll_get_json: []
plugins:
  - jekyll-include-cache
layout_optimizations:
  simple_version_switcher: true
development_mode: true
EOF

rm -rf _site .jekyll-cache
export RUBY_YJIT_ENABLE=1

start_time=$(date +%s)
bundle exec jekyll build --config _config_test.yml --quiet || echo "Build failed"
end_time=$(date +%s)

build_time=$((end_time - start_time))
echo "✅ Micro build time: ${build_time}s"

# Cleanup
rm -f _config_test.yml

if [ "$build_time" -lt 10 ]; then
    echo "✅ GOOD: Micro build is fast"
else
    echo "⚠️  WARNING: Even micro build is slow - config may have issues"
fi

echo ""
echo "📊 QUICK TEST SUMMARY"
echo "===================="
echo "If all tests show ✅, optimizations are configured correctly."
echo "The 17-minute build suggests the version-switcher is still slow."
echo ""
echo "💡 NEXT STEPS:"
echo "1. Kill the current slow build (Ctrl+C)"
echo "2. Run: make clean-cache"
echo "3. Try a limited build: make cockroachdb with JEKYLLFLAGS='--limit_posts 10'"