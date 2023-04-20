---
title: Troubleshooting Overview
summary: Initial steps to take if you experience an issue when using CockroachDB.
toc: false
docs_area: manage
---

If you experience an issue when using CockroachDB, try these steps to resolve the problem:

- Check your [logs](logging-overview.html) for errors. Logs are generated on a per-node basis, so you must either identify the node where the issue occurred or [collect the logs from all active nodes in your cluster](cockroach-debug-zip.html).
  - Consult the list of [common errors and solutions](common-errors.html).
  - If you are getting transaction retry errors, see [client-side retry handling](transaction-retry-error-reference.html#client-side-retry-handling) and the [Transaction Retry Error Reference](transaction-retry-error-reference.html#transaction-retry-error-reference).

- If the problem doesn't match a common error, try the following pages:
  - [Troubleshoot Cluster Setup](cluster-setup-troubleshooting.html) helps you start and scale your cluster.
  - [Troubleshoot Common Problems](error-handling-and-troubleshooting.html) helps you handle errors and troubleshooting problems that may arise during application development.
  - [Troubleshoot Statement Behavior](query-behavior-troubleshooting.html) helps you with unexpected query results.

- If you are using Cockroach Cloud, see the errors and solutions in [Troubleshoot CockroachDB Cloud](../cockroachcloud/troubleshooting-page.html).

- [Replication Reports](query-replication-reports.html) let you query the status of your cluster's data replication, data placement, and zone constraint conformance.

- If you cannot resolve the issue yourself, the following tools can help you move forward:
  - [Support Resources](support-resources.html) identify ways you can get help with troubleshooting.
  - [File an Issue](file-an-issue.html) provides details on how to file an issue that you're unable to resolve.
