#!/bin/bash
set -o pipefail  # Ensure pipeline exits with first failed command's exit code

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

# Testing: Simulate network errors to verify retry logic
# Set SIMULATE_NETWORK_ERROR=1 to test retry behavior
# Set SIMULATE_NETWORK_ERROR_ATTEMPTS=N to fail first N attempts (default: 1)
SIMULATE_NETWORK_ERROR=${SIMULATE_NETWORK_ERROR:-0}
SIMULATE_NETWORK_ERROR_ATTEMPTS=${SIMULATE_NETWORK_ERROR_ATTEMPTS:-1}

if [[ $MAX_RETRIES -gt 1 ]]; then
    echo "🔄 RETRY LOGIC ENABLED"
    echo "Max retries: ${MAX_RETRIES}"
    echo "Base retry delay: ${BASE_RETRY_DELAY}s (exponential backoff)"
else
    echo "📋 SINGLE ATTEMPT BUILD"
fi

if [[ "$SIMULATE_NETWORK_ERROR" == "1" ]]; then
    echo "🧪 TESTING MODE: Network error simulation enabled"
    echo "   Will simulate failure for first ${SIMULATE_NETWORK_ERROR_ATTEMPTS} attempt(s)"
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
    local build_log="build_${ATTEMPT_COUNT}.log"

    echo "📝 Starting Jekyll build with config: $config"
    echo "⏰ Build start: $(date)"
    echo "📄 Build log: $build_log"

    # Testing: Simulate network error if enabled
    if [[ "$SIMULATE_NETWORK_ERROR" == "1" && $ATTEMPT_COUNT -le $SIMULATE_NETWORK_ERROR_ATTEMPTS ]]; then
        echo "🧪 TESTING: Simulating network error (attempt $ATTEMPT_COUNT of $SIMULATE_NETWORK_ERROR_ATTEMPTS simulated failures)"
        echo "Liquid Exception: Failed to open TCP connection to raw.githubusercontent.com:443 (getaddrinfo: Temporary failure in name resolution)" | tee "$build_log"
        echo "⏰ Build end: $(date)"
        echo "❌ Jekyll build failed with exit code: 1 (simulated)"
        echo "🔍 Analyzing build errors for retry eligibility..."
        echo "🌐 Transient network error detected - eligible for retry"
        echo "📋 Network error details:"
        grep -iE "(temporary failure in name resolution|failed to open tcp connection)" "$build_log" | head -3
        return 2  # Retryable error
    fi

    # Capture Jekyll output for error analysis
    if bundle exec jekyll build --trace --config _config_base.yml,$config 2>&1 | tee "$build_log"; then
        echo "⏰ Build end: $(date)"
        echo "✅ Jekyll build completed successfully"
        return 0
    else
        local exit_code=$?
        echo "⏰ Build end: $(date)"
        echo "❌ Jekyll build failed with exit code: $exit_code"
        
        # Analyze build log for error classification
        echo "🔍 Analyzing build errors for retry eligibility..."
        
        # Check for transient network errors that should be retried
        if grep -qiE "(temporary failure in name resolution|connection refused|connection reset|SSL_connect|certificate verify failed|execution expired|timeout|network is unreachable|failed to open tcp connection|socketerror)" "$build_log"; then
            echo "🌐 Transient network error detected - eligible for retry"
            echo "📋 Network error details:"
            grep -iE "(temporary failure in name resolution|connection refused|connection reset|SSL_connect|certificate verify failed|execution expired|timeout|network is unreachable|failed to open tcp connection|socketerror)" "$build_log" | head -3
            return 2  # Retryable error
        fi
        
        # Check for permanent errors that should NOT be retried
        if grep -qiE "(liquid.*syntax error|liquid error|argumenterror|no such file or directory|undefined method|unknown tag|was not properly terminated|missing file)" "$build_log"; then
            echo "🚫 Permanent build error detected - not retrying"
            echo "📋 Error details:"
            grep -iE "(liquid.*syntax error|liquid error|argumenterror|no such file or directory|undefined method|unknown tag|was not properly terminated|missing file)" "$build_log" | head -3
            return 1  # Non-retryable error
        fi
        
        # If we can't classify the error, treat it as non-retryable to be safe
        echo "❓ Unclassified build error - treating as permanent (not retrying)"
        echo "📋 Last few lines of build log:"
        tail -5 "$build_log"
        return 1  # Non-retryable error by default
    fi
}

function build_with_retries {
    local config=$1
    local success=false
    
    for (( attempt=1; attempt<=MAX_RETRIES; attempt++ )); do
        log_attempt $attempt $MAX_RETRIES
        ATTEMPT_COUNT=$attempt
        
        build_with_monitoring "$config"
        local result=$?
        
        if [[ $result == 0 ]]; then
            echo "✅ Build succeeded on attempt ${attempt}/${MAX_RETRIES}"
            success=true
            break
        elif [[ $result == 1 ]]; then
            echo "❌ Build failed on attempt ${attempt}/${MAX_RETRIES} with permanent error"
            echo "🚫 Permanent error detected - failing immediately (no retry)"
            break  # Don't retry permanent errors
        elif [[ $result == 2 ]]; then
            echo "❌ Build failed on attempt ${attempt}/${MAX_RETRIES} with transient error"
            if [[ $attempt -lt $MAX_RETRIES ]]; then
                local next_delay=$((BASE_RETRY_DELAY * (1 << (attempt - 1))))
                echo "🔄 Transient error - will retry in ${next_delay} seconds (exponential backoff)..."
            else
                echo "💀 All retry attempts exhausted for transient error"
            fi
        else
            # Fallback for unexpected return codes
            echo "❌ Build failed on attempt ${attempt}/${MAX_RETRIES} with unexpected error code: $result"
            echo "⚠️ Treating as permanent error - not retrying"
            break
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