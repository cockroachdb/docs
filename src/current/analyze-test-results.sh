#!/bin/bash

# NETLIFY TEST RESULTS ANALYZER
# Fetches and analyzes build results from deploy previews

echo "📊 NETLIFY TEST RESULTS ANALYZER"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Check if we have netlify CLI
if ! command -v netlify &> /dev/null; then
    print_warning "Netlify CLI not found. Install with: npm install -g netlify-cli"
    echo "Or check results manually in Netlify dashboard"
    exit 1
fi

# Function to analyze build logs
analyze_build() {
    local site_name=$1
    local deploy_id=$2
    
    echo ""
    echo "📋 Analyzing Deploy: $deploy_id"
    echo "================================"
    
    # Get deploy info
    netlify api getDeploy --data='{"deploy_id":"'$deploy_id'"}' > deploy-$deploy_id.json 2>/dev/null || {
        print_warning "Could not fetch deploy $deploy_id via API"
        return
    }
    
    # Parse results
    if [[ -f "deploy-$deploy_id.json" ]]; then
        local state=$(jq -r '.state' deploy-$deploy_id.json 2>/dev/null || echo "unknown")
        local build_time=$(jq -r '.deploy_time' deploy-$deploy_id.json 2>/dev/null || echo "unknown")
        local error_count=$(jq -r '.error_count // 0' deploy-$deploy_id.json 2>/dev/null || echo "0")
        
        echo "State: $state"
        echo "Build time: $build_time seconds"  
        echo "Errors: $error_count"
        
        if [[ "$state" == "ready" ]]; then
            print_success "Build successful"
        else
            print_warning "Build state: $state"
        fi
    fi
}

# Function to get recent deploys
get_recent_deploys() {
    print_status "Fetching recent deploys..."
    
    netlify api listSiteDeploys --data='{"site_id":"'$NETLIFY_SITE_ID'"}' > recent-deploys.json 2>/dev/null || {
        print_warning "Could not fetch recent deploys. Make sure you're logged in: netlify login"
        return
    }
    
    # Find our test deploys
    if [[ -f "recent-deploys.json" ]]; then
        echo ""
        echo "🧪 TEST DEPLOY ANALYSIS"
        echo "======================"
        
        # Look for test branch deploys
        local test_branches=("test-netlify-cache" "test-netlify-retry" "test-remote-failures" "test-cache-retry-combined")
        
        for branch in "${test_branches[@]}"; do
            echo ""
            echo "📝 Branch: $branch"
            echo "-------------------"
            
            # Find deploys for this branch
            jq -r --arg branch "$branch" '.[] | select(.branch == $branch) | "\(.id) \(.state) \(.created_at) \(.deploy_time)"' recent-deploys.json 2>/dev/null | head -3 | while read deploy_id state created_at deploy_time; do
                if [[ -n "$deploy_id" ]]; then
                    echo "Deploy: $deploy_id"
                    echo "State: $state"
                    echo "Created: $created_at"
                    echo "Duration: ${deploy_time}s"
                    echo "---"
                fi
            done
        done
    fi
}

# Function to create summary report
create_summary_report() {
    print_status "Creating summary report..."
    
    cat > test-results-summary.md << 'EOF'
# Netlify Cache & Retry Testing Results

## Test Summary

Generated: $(date)

### Test Branches Analyzed
- `test-netlify-cache` - Cache testing only
- `test-netlify-retry` - Retry mechanism testing  
- `test-remote-failures` - Intentional failure injection
- `test-cache-retry-combined` - Combined cache + retry

### Key Metrics to Review

#### Cache Performance
- [ ] First build time (cache miss): _____ seconds
- [ ] Second build time (cache hit): _____ seconds  
- [ ] Cache size: _____ MB
- [ ] Cache hit rate: _____%

#### Retry Mechanism
- [ ] Builds that required retry: _____%
- [ ] Average retry attempts: _____
- [ ] Success rate after retry: _____%
- [ ] Time added by retries: _____ seconds

#### Failure Handling
- [ ] Intentional failures properly caught: Yes/No
- [ ] Build eventually succeeded: Yes/No
- [ ] Error messages clear: Yes/No

### Recommendations

Based on test results:

1. **Cache Configuration**
   - Recommended TTL: _____ seconds
   - Cache directories to include: _____

2. **Retry Configuration** 
   - Recommended max retries: _____
   - Recommended retry delay: _____ seconds

3. **Production Readiness**
   - [ ] Cache reduces build time by >50%
   - [ ] Retry handles <5% of builds
   - [ ] No impact on successful builds
   - [ ] Ready for production deployment

### Next Steps
- [ ] Review all test branch results
- [ ] Update production netlify.toml
- [ ] Deploy to staging
- [ ] Monitor production builds

EOF

    print_success "Summary report created: test-results-summary.md"
}

# Main execution
main() {
    # Check if we're in a netlify site
    if [[ ! -f "netlify.toml" ]]; then
        print_warning "Not in a Netlify site directory"
        exit 1
    fi
    
    # Try to get site ID
    if [[ -f ".netlify/state.json" ]]; then
        NETLIFY_SITE_ID=$(jq -r '.siteId' .netlify/state.json 2>/dev/null)
        print_status "Site ID: $NETLIFY_SITE_ID"
    else
        print_warning "No .netlify/state.json found. Run 'netlify link' first"
        print_status "Continuing with manual analysis instructions..."
    fi
    
    get_recent_deploys
    create_summary_report
    
    echo ""
    echo "📊 MANUAL ANALYSIS INSTRUCTIONS"
    echo "==============================="
    echo "1. Go to your Netlify dashboard"
    echo "2. Check deploys for these branches:"
    echo "   - test-netlify-cache"
    echo "   - test-netlify-retry" 
    echo "   - test-remote-failures"
    echo "   - test-cache-retry-combined"
    echo ""
    echo "3. For each deploy, check:"
    echo "   - Build logs for cache hit/miss messages"
    echo "   - Build time (should be faster with cache)"
    echo "   - Any retry attempts in logs"
    echo "   - Final success/failure status"
    echo ""
    echo "4. Look for these log messages:"
    echo "   - '✅ Jekyll cache found' (cache working)"
    echo "   - '🔄 Build attempt X of Y' (retry working)"
    echo "   - '📊 FINAL BUILD METRICS' (performance data)"
    echo ""
    print_success "Analysis complete! Review test-results-summary.md"
}

main "$@"