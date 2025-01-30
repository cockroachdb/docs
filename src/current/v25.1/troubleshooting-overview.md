---
title: Troubleshooting Overview
summary: Initial steps to take if you experience an issue when using CockroachDB.
toc: false
docs_area: manage
---

If you experience an issue when using CockroachDB, try these steps to resolve the problem:

- Check your [logs]({{ page.version.version }}/logging-overview.md) for errors. Logs are generated on a per-node basis, so you must either identify the node where the issue occurred or [collect the logs from all active nodes in your cluster]({{ page.version.version }}/cockroach-debug-zip.md).
  - Consult the list of [common errors and solutions]({{ page.version.version }}/common-errors.md).
  - If you are getting transaction retry errors, see [client-side retry handling]({{ page.version.version }}/transaction-retry-error-reference.md#client-side-retry-handling) and the [Transaction Retry Error Reference]({{ page.version.version }}/transaction-retry-error-reference.md#transaction-retry-error-reference).

- If the problem doesn't match a common error, try the following pages:
  - [Troubleshoot Cluster Setup]({{ page.version.version }}/cluster-setup-troubleshooting.md) helps you start and scale your cluster.
  - [Troubleshoot Common Problems]({{ page.version.version }}/query-behavior-troubleshooting.md) helps you handle errors and troubleshooting problems that may arise during application development.
  - [Troubleshoot Statement Behavior]({{ page.version.version }}/query-behavior-troubleshooting.md) helps you with unexpected query results.

- If you are using Cockroach Cloud, see the errors and solutions in [Troubleshoot CockroachDB Cloud](troubleshooting-page.md).

- If you see discrepancies in metrics, refer to [Differences in Metrics between Third-Party Monitoring Integrations and DB Console]({{ page.version.version }}/differences-in-metrics-between-third-party-monitoring-integrations-and-db-console.md).

- [Replication Reports]({{ page.version.version }}/query-replication-reports.md) let you query the status of your cluster's data replication, data placement, and zone constraint conformance.

- If you cannot resolve the issue yourself, the following tools can help you move forward:
  - [Support Resources]({{ page.version.version }}/support-resources.md) identify ways you can get help with troubleshooting.
  - [File an Issue]({{ page.version.version }}/file-an-issue.md) provides details on how to file an issue that you're unable to resolve.
 
- In a support escalation, you may be directed to use the following features by the [Cockroach Labs support team]({{ page.version.version }}/support-resources.md):

  - [`cockroach debug zip`]({{ page.version.version }}/cockroach-debug-zip.md)
  - [`cockroach debug tsdump`]({{ page.version.version }}/cockroach-debug-tsdump.md)
  - [Automatic CPU Profiler]({{ page.version.version }}/automatic-cpu-profiler.md)