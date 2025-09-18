---
title: "Stress Test Multiple Remote Include Failures"
summary: "Maximum failure scenario testing for build resilience"
toc: true
docs_area: testing
---

# Stress Testing Multiple Remote Include Failures

This page contains many intentional failures to stress test the retry system.

## Working Control
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.2/grammar_svg/select.html %}

## DNS Failures (5 different domains)
{% remote_include https://fake-domain-1-test.nonexistent/test.html %}
{% remote_include https://fake-domain-2-test.nonexistent/test.html %}
{% remote_include https://fake-domain-3-test.nonexistent/test.html %}
{% remote_include https://fake-domain-4-test.nonexistent/test.html %}
{% remote_include https://fake-domain-5-test.nonexistent/test.html %}

## 404 Errors (5 different paths)
{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/fake-branch-1/docs/test.md %}
{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/fake-branch-2/docs/test.md %}
{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/fake-branch-3/docs/test.md %}
{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/fake-branch-4/docs/test.md %}
{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/fake-branch-5/docs/test.md %}

## Timeout Scenarios (multiple delays)
{% remote_include https://httpbin.org/delay/25 %}
{% remote_include https://httpbin.org/delay/30 %}
{% remote_include https://httpbin.org/delay/35 %}

## Mixed Working and Failing
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.2/grammar_svg/create_table.html %}
{% remote_include https://another-fake-domain.test/fail.html %}
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.2/grammar_svg/update.html %}
{% remote_include https://httpbin.org/status/500 %}
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.2/grammar_svg/delete.html %}

## Test Expectations

This stress test should:
1. **Trigger many retry attempts** - each failure should retry 5 times with 15s delays
2. **Show retry patterns in logs** - look for "Retry attempt X/5" messages
3. **Test system resilience** - verify build doesn't crash on multiple failures
4. **Measure total build time** - with all retries, this could take 10-15 minutes
5. **No caching** - every retry hits the network fresh

Expected failure patterns:
- DNS failures: Immediate failure, no wait time
- 404 errors: Quick HTTP response, immediate retry
- Timeouts: Full 30+ second wait before retry
- Mixed scenarios: Some succeed, some fail, showing recovery capability

Total expected failures: 18 failures × 5 retries = 90 network attempts
Plus successful requests = ~95+ total network operations