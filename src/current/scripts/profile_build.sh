#!/bin/bash
set -euo pipefail

echo "🔧 Jekyll Build Profiler"
echo "======================="

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
PROFILE_DIR="perf"
mkdir -p "$PROFILE_DIR"

echo "🧹 Cleaning previous build artifacts..."
rm -rf _site .jekyll-cache

echo "📊 Running Jekyll build with profiling..."
echo "YJIT: Enabled"
echo "Config: Base + CockroachDB + Local optimizations"
echo ""

export JEKYLL_ENV=development
export RUBY_YJIT_ENABLE=1

time bundle exec jekyll build \
    --config _config_base.yml,_config_cockroachdb.yml,_config_cockroachdb_local.yml \
    --profile 2>&1 | tee "$PROFILE_DIR/profile-$TIMESTAMP.txt"

echo ""
echo "✅ Profile complete!"
echo "📁 Results saved to: $PROFILE_DIR/profile-$TIMESTAMP.txt"
echo ""
echo "🎯 Top bottlenecks:"
grep -A 10 "Site Render Stats:" "$PROFILE_DIR/profile-$TIMESTAMP.txt" | head -15