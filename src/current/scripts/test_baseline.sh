#!/bin/bash
set -euo pipefail

echo "📏 Baseline Performance Test"
echo "=========================="

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
PROFILE_DIR="perf"
mkdir -p "$PROFILE_DIR"

echo "🧹 Clean build for accurate baseline..."
rm -rf _site .jekyll-cache

echo "⏱️  Measuring baseline build time..."
export JEKYLL_ENV=development
export RUBY_YJIT_ENABLE=1

start_time=$(date +%s)
bundle exec jekyll build \
    --config _config_base.yml,_config_cockroachdb.yml,_config_cockroachdb_local.yml \
    --profile > "$PROFILE_DIR/test1-baseline-$TIMESTAMP.txt" 2>&1
end_time=$(date +%s)

build_time=$((end_time - start_time))

echo ""
echo "📊 BASELINE RESULTS:"
echo "======================"
echo "⏱️  Total build time: ${build_time}s"
echo "📁 Profile saved: $PROFILE_DIR/test1-baseline-$TIMESTAMP.txt"
echo ""
echo "🎯 Current top bottlenecks:"
grep -A 10 "Site Render Stats:" "$PROFILE_DIR/test1-baseline-$TIMESTAMP.txt" | head -15