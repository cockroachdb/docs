#!/bin/bash
set -euo pipefail

echo "🧪 Testing Individual Optimizations"
echo "==================================="

PROFILE_DIR="perf/tests"
mkdir -p "$PROFILE_DIR"

# Test 1: YJIT Test
echo ""
echo "🧪 TEST 1: YJIT Performance"
echo "----------------------------"
echo "Testing with and without YJIT..."

# Without YJIT
echo "Building WITHOUT YJIT..."
rm -rf _site .jekyll-cache
time timeout 120 bundle exec jekyll build \
    --config _config_base.yml,_config_cockroachdb.yml \
    --limit_posts 5 2>/dev/null || echo "Build timed out or failed"

# With YJIT  
echo "Building WITH YJIT..."
rm -rf _site .jekyll-cache
export RUBY_YJIT_ENABLE=1
time timeout 120 bundle exec jekyll build \
    --config _config_base.yml,_config_cockroachdb.yml \
    --limit_posts 5 2>/dev/null || echo "Build timed out or failed"

echo "✅ YJIT test complete"

# Test 2: Config Optimizations
echo ""
echo "🧪 TEST 2: Config Optimizations"
echo "-------------------------------"
echo "Testing base config vs optimized config..."

# Base config
echo "Building with BASE config..."
rm -rf _site .jekyll-cache
time timeout 120 bundle exec jekyll build \
    --config _config_base.yml,_config_cockroachdb.yml \
    --limit_posts 5 2>/dev/null || echo "Build timed out or failed"

# Optimized config
echo "Building with OPTIMIZED config..."
rm -rf _site .jekyll-cache
time timeout 120 bundle exec jekyll build \
    --config _config_base.yml,_config_cockroachdb.yml,_config_cockroachdb_local.yml \
    --limit_posts 5 2>/dev/null || echo "Build timed out or failed"

echo "✅ Config test complete"

# Test 3: Version Switcher Test
echo ""
echo "🧪 TEST 3: Version Switcher"
echo "---------------------------"
echo "Checking if simplified version switcher is being used..."

# Check if our optimized version switcher exists
if [ -f "_includes/version-switcher-js.html" ]; then
    echo "✅ JavaScript version switcher exists"
else
    echo "❌ JavaScript version switcher missing"
fi

# Check if local config has optimization flags
if grep -q "simple_version_switcher: true" _config_cockroachdb_local.yml; then
    echo "✅ Version switcher optimization enabled in config"
else
    echo "❌ Version switcher optimization not enabled"
fi

# Check if page-header is using optimized logic
if grep -q "version-switcher-js.html" _includes/page-header.html; then
    echo "✅ Page header uses optimized version switcher"
else
    echo "❌ Page header not using optimized version switcher"
fi

# Test 4: Include Caching Test
echo ""
echo "🧪 TEST 4: Include Caching"
echo "--------------------------"
echo "Checking cached includes..."

cached_count=$(find . -name "*.md" -o -name "*.html" | xargs grep -c "{% include_cached" 2>/dev/null | awk -F: '{sum+=$2} END {print sum}' || echo "0")
regular_count=$(find . -name "*.md" -o -name "*.html" | xargs grep -c "{% include [^_]" 2>/dev/null | awk -F: '{sum+=$2} END {print sum}' || echo "0")

echo "✅ Cached includes: $cached_count"
echo "ℹ️  Regular includes: $regular_count"
if [ "$cached_count" -gt 1000 ]; then
    echo "✅ Good: Many includes are cached"
else
    echo "⚠️  Warning: Few includes are cached"
fi

# Test 5: Quick Build Test
echo ""
echo "🧪 TEST 5: Quick Build Test"
echo "---------------------------"
echo "Testing a single page build..."

rm -rf _site .jekyll-cache
export RUBY_YJIT_ENABLE=1

echo "Building single page with all optimizations..."
start_time=$(date +%s)
timeout 60 bundle exec jekyll build \
    --config _config_base.yml,_config_cockroachdb.yml,_config_cockroachdb_local.yml \
    --limit_posts 1 2>/dev/null || echo "Build timed out"
end_time=$(date +%s)

build_time=$((end_time - start_time))
echo "✅ Single page build time: ${build_time}s"

if [ "$build_time" -lt 30 ]; then
    echo "✅ GOOD: Single page builds quickly"
else
    echo "⚠️  WARNING: Single page build is slow"
fi

echo ""
echo "📊 OPTIMIZATION TEST SUMMARY"
echo "============================"
echo "Review the results above to see which optimizations are working."
echo "If any tests show warnings, those optimizations need fixing."
echo ""
echo "💡 To fix issues:"
echo "  - Check config files for correct settings"
echo "  - Verify include file paths"
echo "  - Clear Jekyll cache: make clean-cache"