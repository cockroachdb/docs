# Netlify Cache & Retry Testing - Execution Plan

## 🚀 Ready to Execute

I've created a complete testing suite with **intentional remote_include failures** to test both caching and retry mechanisms. Here's your execution plan:

## Files Created

✅ **Configuration Files**
- `netlify-test.toml` - Test configuration with cache and retry plugins
- `netlify/build-test.sh` - Enhanced build script with monitoring
- `_config_cache_test.yml` - Jekyll cache configuration

✅ **Test Files**  
- `test-remote-failure.md` - Page with intentional remote_include failures
- `run-cache-test.sh` - Automated test execution script
- `analyze-test-results.sh` - Results analysis script

## Execution Steps

### 1. Run the Automated Test Suite

```bash
# Execute the complete test suite
./run-cache-test.sh
```

This will create **4 test branches**:
1. `test-netlify-cache` - Cache testing only
2. `test-netlify-retry` - Retry with intentional failures  
3. `test-remote-failures` - Failure injection testing
4. `test-cache-retry-combined` - Combined cache + retry

### 2. Monitor Results

Each branch creates a **deploy preview** (safe, no production impact):
- Check Netlify dashboard for deploy previews
- Look for URLs like: `https://deploy-preview-XXX--your-site.netlify.app`

### 3. Analyze Build Logs

```bash  
# After deploys complete, analyze results
./analyze-test-results.sh
```

## Expected Test Results

### 🗂️ Cache Test Branch (`test-netlify-cache`)
**Expected behavior:**
- First build: 8-12 minutes (cache miss)
- Second build: 3-5 minutes (cache hit)  
- Logs show: `✅ Jekyll cache found (45MB)`

### 🔄 Retry Test Branch (`test-netlify-retry`)
**Expected behavior:**
- Build fails on attempt 1 (due to intentional failures)
- Logs show: `🔄 Build attempt 1 of 3`
- Logs show: `❌ Build failed on attempt 1`  
- Logs show: `⏳ Waiting 30s before retry...`
- May succeed on retry 2 or 3, or fail completely (expected for test)

### 💥 Failure Injection (`test-remote-failures`)
**Expected behavior:**
- Multiple failure types tested:
  - DNS resolution failure (`non-existent-domain-for-testing.fake`)
  - HTTP 404 error (`non-existent-branch`)
  - Network timeout (`httpbin.org/delay/30`)
- Retry attempts logged for each failure type
- Build eventually fails (expected - this tests failure handling)

### 🎯 Combined Test (`test-cache-retry-combined`)
**Expected behavior:**
- Cache hits where possible (faster builds)
- Retry only when network issues occur  
- Best performance + reliability combination
- Build time: 3-6 minutes with cache, retries only when needed

## Intentional Failures Injected

The `test-remote-failure.md` file contains these **intentional failures**:

1. **DNS Failure**: `https://non-existent-domain-for-testing.fake/test.html`
2. **404 Error**: `https://raw.githubusercontent.com/cockroachdb/cockroach/non-existent-branch/docs/test.md`  
3. **Timeout**: `https://httpbin.org/delay/30`

These will trigger the retry mechanism and test failure handling.

## Success Criteria

### ✅ Cache Working
- [ ] Build time reduced by >50% on cache hits
- [ ] Logs show cache sizes and hit/miss status
- [ ] Jekyll cache persists between builds

### ✅ Retry Working  
- [ ] Failed builds automatically retry (up to 3 times)
- [ ] 30-second delay between retry attempts
- [ ] Clear logging of retry attempts
- [ ] Eventual success or graceful failure

### ✅ Combined System
- [ ] Cache reduces network calls
- [ ] Retry handles remaining network issues
- [ ] Build reliability >95%
- [ ] Performance improvement maintained

## Production Deployment

After successful testing:

1. **Update main `netlify.toml`** with working configuration
2. **Deploy to production** 
3. **Monitor production builds** for 1-2 weeks
4. **Clean up test branches**

## Safety Notes

- ✅ All tests run as **deploy previews** (no production risk)
- ✅ Original `netlify.toml` unchanged  
- ✅ Can revert any changes easily
- ✅ Test branches clearly labeled

## Quick Start

```bash
# 1. Make scripts executable (already done)
chmod +x run-cache-test.sh analyze-test-results.sh

# 2. Run complete test suite  
./run-cache-test.sh

# 3. Check Netlify dashboard for deploy previews

# 4. After builds complete, analyze results
./analyze-test-results.sh
```

## Expected Timeline

- **Setup**: 5 minutes (running scripts)
- **First builds**: 10-15 minutes (cache miss)  
- **Retry builds**: 5-10 minutes (cache hit + retry testing)
- **Analysis**: 5 minutes
- **Total**: ~30-45 minutes for complete testing

---

**Ready to execute? Run `./run-cache-test.sh` to start!** 🚀