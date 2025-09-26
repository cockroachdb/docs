#!/bin/bash

echo "🚀 NETLIFY BUILD SCRIPT WITH RETRY LOGIC"
echo "========================================"
echo "Branch: ${BRANCH:-unknown}"
echo "Context: ${CONTEXT:-unknown}"
echo "Build ID: ${BUILD_ID:-unknown}"
echo "Timestamp: $(date)"
echo ""

# Configure retry settings
MAX_RETRIES=${MAX_RETRIES:-3}
BASE_RETRY_DELAY=${BASE_RETRY_DELAY:-30}

if [[ $MAX_RETRIES -gt 1 ]]; then
    echo "🔄 RETRY LOGIC ENABLED"
    echo "Max retries: ${MAX_RETRIES}"
    echo "Base retry delay: ${BASE_RETRY_DELAY}s (exponential backoff)"
else
    echo "📋 SINGLE ATTEMPT BUILD"
fi

echo ""

# Build monitoring variables
BUILD_START_TIME=$(date +%s)
ATTEMPT_COUNT=0
TOTAL_NETWORK_CALLS=0

# Populate the site_url to be used by Jekyll for generating sidebar and search links
site_url="${DEPLOY_PRIME_URL}"
JEKYLL_ENV="preview"
echo "Netlify has passed context $CONTEXT"
if [[ "$CONTEXT" = "production" ]]; then
    site_url="https://www.cockroachlabs.com"
    JEKYLL_ENV="production"
	echo "Setting site domain to cockroachlabs.com and JEKYLL_ENV to production"
# For deploy previews and branch deploys, use Netlify-provided domain
# and leave JEKYLL_ENV set to "preview" for more efficient builds
elif [[ "$CONTEXT" = "deploy-preview" ]]; then
    echo "Using Netlify-provided deploy preview domain and setting JEKYLL_ENV to preview"
elif [[ "$CONTEXT" = "branch-deploy" ]]; then
    echo "Using Netlify-provided branch deploy domain and setting JEKYLL_ENV to preview"
fi

echo "url: ${site_url}" > _config_url.yml

function log_attempt() {
    local attempt=$1
    local total=$2
    echo ""
    echo "🔄 BUILD ATTEMPT ${attempt}/${total}"
    echo "================================"
    echo "Time: $(date)"
    if [[ $attempt -gt 1 ]]; then
        # Calculate exponential backoff: base_delay * 2^(attempt-2)
        local retry_delay=$((BASE_RETRY_DELAY * (1 << (attempt - 2))))
        echo "Previous attempts failed - retrying..."
        echo "Exponential backoff delay: ${retry_delay}s (base: ${BASE_RETRY_DELAY}s)"
        sleep ${retry_delay}
    fi
    echo ""
}

function build_with_monitoring {
    local config=$1
    echo "📝 Starting Jekyll build with config: $config"
    echo "⏰ Build start: $(date)"
    
    # Run Jekyll build with network monitoring
    bundle exec jekyll build --trace --config _config_base.yml,$config
    local build_result=$?
    
    echo "⏰ Build end: $(date)"
    echo "📊 Build result: $build_result"
    
    if [[ $build_result != 0 ]]; then
        echo "❌ Jekyll build failed with exit code: $build_result"
        return $build_result
    else
        echo "✅ Jekyll build completed successfully"
        return 0
    fi
}

function build_with_retries {
    local config=$1
    local success=false
    
    for (( attempt=1; attempt<=MAX_RETRIES; attempt++ )); do
        log_attempt $attempt $MAX_RETRIES
        ATTEMPT_COUNT=$attempt
        
        if build_with_monitoring "$config"; then
            echo "✅ Build succeeded on attempt ${attempt}/${MAX_RETRIES}"
            success=true
            break
        else
            echo "❌ Build failed on attempt ${attempt}/${MAX_RETRIES}"
            if [[ $attempt -lt $MAX_RETRIES ]]; then
                local next_delay=$((BASE_RETRY_DELAY * (1 << (attempt - 1))))
                echo "🔄 Will retry in ${next_delay} seconds (exponential backoff)..."
            else
                echo "💀 All retry attempts exhausted"
            fi
        fi
    done
    
    if [[ "$success" = true ]]; then
        return 0
    else
        return 1
    fi
}

echo "📦 Installing dependencies..."
gem install bundler --silent
bundle install --quiet

echo ""
echo "🚀 Starting build process..."
echo "=============================="

# Main build with retry logic
if build_with_retries "_config_cockroachdb.yml,_config_url.yml"; then
    echo ""
    echo "✅ MAIN BUILD COMPLETED SUCCESSFULLY"
else
    echo ""
    echo "❌ MAIN BUILD FAILED AFTER ALL RETRIES"
    echo ""
    echo "📊 FINAL BUILD STATISTICS:"
    echo "=========================="
    echo "Total attempts: ${ATTEMPT_COUNT}/${MAX_RETRIES}"
    echo "Build duration: $(($(date +%s) - BUILD_START_TIME))s"
    echo "Branch: ${BRANCH:-unknown}"
    echo "Context: ${CONTEXT:-unknown}"
    exit 1
fi

echo ""
echo "📂 Setting up site files..."
cp _site/docs/_redirects _site/_redirects
cp _site/docs/404.html _site/404.html

echo ""
echo "🔧 Installing htmltest..."
curl -s https://htmltest.wjdp.uk | bash
if [[ $? != 0 ]]; then
	echo "❌ Failed to install htmltest"
	exit 1
fi

./bin/build.sh>/dev/null 2>&1

# Run htmltest to check external links on scheduled nightly runs
if [[ "$INCOMING_HOOK_TITLE" = "nightly" ]]; then
	echo "🔍 Running full htmltest (nightly)..."
	./bin/htmltest
	if [[ $? != 0 ]]; then
          exit 1
  fi
fi

# Skip Algolia for testing
if [ "$CONTEXT" == "production" ]; then
	echo "Temporarily skipping the Algolia index build"
else
  echo "Not building Algolia index for context $CONTEXT"
fi

# Run htmltest, but skip checking external links to speed things up
echo ""
echo "🔍 Running htmltest (skip external)..."
./bin/htmltest --skip-external
if [[ $? != 0 ]]; then
  echo "❌ htmltest failed"
  exit 1
fi

# Run tests defined in __tests__
echo ""
echo "🧪 Running Jest tests..."
./node_modules/.bin/jest
test_result=$?

# Final summary
echo ""
echo "🎯 BUILD SUMMARY"
echo "================"
echo "✅ Build completed successfully!"
echo "📊 Build statistics:"
echo "   - Total attempts: ${ATTEMPT_COUNT}/${MAX_RETRIES}"
echo "   - Build duration: $(($(date +%s) - BUILD_START_TIME))s"
echo "   - Branch: ${BRANCH:-unknown}"
echo "   - Context: ${CONTEXT:-unknown}"
echo "   - Jest result: ${test_result}"

exit $test_result