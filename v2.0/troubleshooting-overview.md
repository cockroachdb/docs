---
title: Troubleshooting Overview
summary: Initial steps to take if you run in to issues with CockroachDB.
toc: false
---

If you run into issues with CockroachDB, there are a few initial steps you can always take:

1. Check your [logs](debug-and-error-logs.html) for errors related to your issue.
    - Logs are generated on a per-node basis, so you must either identify the node where the issue occurred or [collect the logs from all active nodes in your cluster](debug-zip.html).
    - Alternately, you can [stop](stop-a-node.html) and [restart](start-a-node.html) problematic nodes with the `--logtostderr` flag to print logs to your terminal through `stderr`, letting you see all cluster activities as it occurs.

2. Check our list of [common errors](common-errors.html) for a solution.

3. If the problem doesn't match a common error, try the following pages:
    - [Troubleshoot Cluster Setup](cluster-setup-troubleshooting.html) helps start your cluster and scale it by adding nodes.
    - [Troubleshoot Query Behavior](query-behavior-troubleshooting.html) helps with unexpected query results.

4. If you cannot resolve the issue easily yourself, the following tools can help you get unstuck:
    - [Support Resources](support-resources.html) identifies ways you can get help with troubleshooting.
    - [File an Issue](file-an-issue.html) provides details about filing issues that you're unable to resolve.
