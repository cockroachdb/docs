#!/bin/bash

# ENHANCED BUILD SCRIPT WITH TESTING AND MONITORING
# This is a test version of build.sh with added cache/retry monitoring

echo "🧪 NETLIFY BUILD TEST SCRIPT"
echo "================================"

# Build metrics tracking
BUILD_START=$(date +%s)
CACHE_DIR=".netlify-cache"
REMOTE_CACHE="$CACHE_DIR/remote-includes"
TEST_LOG="build-test.log"

echo "Build started: $(date)" | tee -a $TEST_LOG
echo "Build ID: $BUILD_ID" | tee -a $TEST_LOG
echo "Deploy ID: $DEPLOY_ID" | tee -a $TEST_LOG
echo "Context: $CONTEXT" | tee -a $TEST_LOG

# Create cache directories
mkdir -p "$REMOTE_CACHE"
mkdir -p "_data/cached"

# Populate the site_url to be used by Jekyll for generating sidebar and search links
site_url="${DEPLOY_PRIME_URL}"
JEKYLL_ENV="preview"
echo "Netlify has passed context $CONTEXT"
if [[ "$CONTEXT" = "production" ]]; then
    echo "🚨 WARNING: Running in production context during testing!" | tee -a $TEST_LOG
    site_url="https://www.cockroachlabs.com"
    JEKYLL_ENV="production"
elif [[ "$CONTEXT" = "deploy-preview" ]]; then
    echo "✅ Using deploy preview (safe for testing)" | tee -a $TEST_LOG
elif [[ "$CONTEXT" = "branch-deploy" ]]; then
    echo "✅ Using branch deploy (safe for testing)" | tee -a $TEST_LOG
fi

echo "url: ${site_url}" > _config_url.yml

# Cache status check
echo ""
echo "📊 CACHE STATUS CHECK"
echo "===================="
if [ -d ".jekyll-cache" ]; then
    CACHE_SIZE=$(du -sh .jekyll-cache | cut -f1)
    CACHE_FILES=$(find .jekyll-cache -type f | wc -l)
    echo "✅ Jekyll cache found: $CACHE_SIZE ($CACHE_FILES files)" | tee -a $TEST_LOG
else
    echo "❌ No Jekyll cache found (first build or cache miss)" | tee -a $TEST_LOG
fi

if [ -d "$REMOTE_CACHE" ]; then
    REMOTE_SIZE=$(du -sh $REMOTE_CACHE | cut -f1 2>/dev/null || echo "0")
    REMOTE_FILES=$(find $REMOTE_CACHE -type f 2>/dev/null | wc -l)
    echo "✅ Remote includes cache found: $REMOTE_SIZE ($REMOTE_FILES files)" | tee -a $TEST_LOG
else
    echo "❌ No remote includes cache found" | tee -a $TEST_LOG
fi

# Enhanced build function with retry logic and monitoring
function build_with_monitoring {
    local config=$1
    local retries=3
    local delay=30
    local count=0
    
    echo ""
    echo "🔨 STARTING BUILD WITH MONITORING"
    echo "================================"
    
    # Check if this is a test with intentional failure
    if [[ "$NETLIFY_TEST_FAILURE" == "true" ]]; then
        echo "⚠️ TEST MODE: Injecting intentional failure" | tee -a $TEST_LOG
        # This will cause the first build to fail
        export JEKYLL_REMOTE_INCLUDE_FAIL_RATE="0.3"
    fi
    
    while [ $count -lt $retries ]; do
        count=$((count + 1))
        echo "🔄 Build attempt $count of $retries" | tee -a $TEST_LOG
        echo "Timestamp: $(date)" | tee -a $TEST_LOG
        
        # Time individual build attempt
        ATTEMPT_START=$(date +%s)
        
        if bundle exec jekyll build --trace --config _config_base.yml,$config; then
            ATTEMPT_END=$(date +%s)
            ATTEMPT_TIME=$((ATTEMPT_END - ATTEMPT_START))
            echo "✅ Build successful on attempt $count (${ATTEMPT_TIME}s)" | tee -a $TEST_LOG
            return 0
        else
            ATTEMPT_END=$(date +%s)
            ATTEMPT_TIME=$((ATTEMPT_END - ATTEMPT_START))
            echo "❌ Build failed on attempt $count (${ATTEMPT_TIME}s)" | tee -a $TEST_LOG
            
            if [ $count -lt $retries ]; then
                echo "⏳ Waiting ${delay}s before retry..." | tee -a $TEST_LOG
                sleep $delay
            fi
        fi
    done
    
    echo "💥 Build failed after $retries attempts" | tee -a $TEST_LOG
    return 1
}

# Install dependencies
gem install bundler --silent
bundle install --quiet

# Run the monitored build
if build_with_monitoring _config_cockroachdb.yml,_config_url.yml; then
    echo "🎉 Build completed successfully!" | tee -a $TEST_LOG
else
    echo "💥 Build failed after all retries" | tee -a $TEST_LOG
    exit 1
fi

# Post-build cache analysis
echo ""
echo "📊 POST-BUILD CACHE ANALYSIS"
echo "============================"
if [ -d ".jekyll-cache" ]; then
    NEW_CACHE_SIZE=$(du -sh .jekyll-cache | cut -f1)
    NEW_CACHE_FILES=$(find .jekyll-cache -type f | wc -l)
    echo "✅ Jekyll cache after build: $NEW_CACHE_SIZE ($NEW_CACHE_FILES files)" | tee -a $TEST_LOG
fi

# Continue with rest of original build script
cp _site/docs/_redirects _site/_redirects
cp _site/docs/404.html _site/404.html

# Set up htmltest
curl -s https://htmltest.wjdp.uk | bash
if [[ $? != 0 ]]; then
    echo "Failed to install htmltest"
    exit 1
fi

./bin/build.sh>/dev/null 2>&1

# Skip external link checking in tests unless specifically requested
if [[ "$NETLIFY_TEST_EXTERNAL_LINKS" = "true" ]]; then
    if [[ "$INCOMING_HOOK_TITLE" = "nightly" ]]; then
        ./bin/htmltest
        if [[ $? != 0 ]]; then
            exit 1
        fi
    fi
fi

# Skip Algolia in tests
echo "⏭️ Skipping Algolia index build during testing" | tee -a $TEST_LOG

# Run htmltest, but skip checking external links to speed things up
./bin/htmltest --skip-external
if [[ $? != 0 ]]; then
  exit 1
fi

# Run tests defined in __tests__
./node_modules/.bin/jest

# Final build metrics
BUILD_END=$(date +%s)
BUILD_TIME=$((BUILD_END - BUILD_START))

echo ""
echo "📊 FINAL BUILD METRICS"
echo "====================="
echo "Total build time: ${BUILD_TIME}s" | tee -a $TEST_LOG
echo "Build completed: $(date)" | tee -a $TEST_LOG
echo "Remote includes processed: $(grep -r "remote_include" _site/ 2>/dev/null | wc -l || echo 0)" | tee -a $TEST_LOG

# Create build report
cat > build-report.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "build_id": "$BUILD_ID",
  "deploy_id": "$DEPLOY_ID",
  "context": "$CONTEXT",
  "total_time": $BUILD_TIME,
  "cache_hit": $([ -d ".jekyll-cache" ] && echo "true" || echo "false"),
  "remote_cache_hit": $([ -d "$REMOTE_CACHE" ] && echo "true" || echo "false"),
  "jekyll_cache_size": "$(du -sh .jekyll-cache 2>/dev/null | cut -f1 || echo '0')",
  "remote_cache_size": "$(du -sh $REMOTE_CACHE 2>/dev/null | cut -f1 || echo '0')"
}
EOF

echo "📋 Build report saved to build-report.json"
cat build-report.json | tee -a $TEST_LOG

exit $?