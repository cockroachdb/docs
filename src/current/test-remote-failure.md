---
title: "Test Remote Include Failures"
summary: "Test page to inject remote include failures for testing retry mechanisms"
toc: true
docs_area: testing
---

# Testing Remote Include Failures

This page is designed to test how the build system handles remote include failures.

## Working Remote Include (Control)

This should work fine:
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.2/grammar_svg/select.html %}

## Intentional Failure #1 - Non-existent Domain

This will definitely fail and should trigger retry:
{% remote_include https://non-existent-domain-for-testing.fake/test.html %}

## Intentional Failure #2 - Valid Domain, Bad Path

This will fail with 404:
{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/non-existent-branch/docs/test.md %}

## Intentional Failure #3 - Timeout Simulation

This should timeout (using a slow endpoint):
{% remote_include https://httpbin.org/delay/30 %}

## Another Working Remote Include

This should work to verify system recovery:
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.2/grammar_svg/create_table.html %}

## Test Notes

- **Failure #1**: Tests DNS resolution failure
- **Failure #2**: Tests HTTP 404 error handling  
- **Failure #3**: Tests network timeout handling
- Working includes test that system can recover after failures

Expected behavior:
1. First build attempt should fail due to these broken includes
2. Retry mechanism should attempt 2-3 more times
3. Final build may still fail, but we should see retry attempts in logs
4. Cache mechanism should not cache failed requests