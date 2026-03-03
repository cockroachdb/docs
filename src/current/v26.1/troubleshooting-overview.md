---
title: Troubleshooting Overview
summary: Initial steps to take if you experience an issue when using CockroachDB.
toc: false
docs_area: manage
---

If you experience an issue when using CockroachDB, try these steps to resolve the problem:

- Check your [logs]({% link {{ page.version.version }}/logging-overview.md %}) for errors. Logs are generated on a per-node basis, so you must either identify the node where the issue occurred or [collect the logs from all active nodes in your cluster]({% link {{ page.version.version }}/cockroach-debug-zip.md %}).
  - Consult the list of [common errors and solutions]({% link {{ page.version.version }}/common-errors.md %}).
  - If you are getting transaction retry errors, see [client-side retry handling]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#client-side-retry-handling) and the [Transaction Retry Error Reference]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#transaction-retry-error-reference).

- If the problem doesn't match a common error, try the following pages:
  - [Troubleshoot Cluster Setup]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}) helps you start and scale your cluster.
  - [Troubleshoot Common Problems]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}) helps you handle errors and troubleshooting problems that may arise during application development.
  - [Troubleshoot Statement Behavior]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}) helps you with unexpected query results.

- If you are using Cockroach Cloud, see the errors and solutions in [Troubleshoot CockroachDB Cloud]({% link cockroachcloud/troubleshooting-page.md %}).

- If you see discrepancies in metrics, refer to [Differences in Metrics between Third-Party Monitoring Integrations and DB Console]({% link {{ page.version.version }}/differences-in-metrics-between-third-party-monitoring-integrations-and-db-console.md %}).

- The [critical nodes endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#critical-nodes-endpoint) lets you query the status of your cluster's data replication, data placement, and zone constraint conformance.

- If you believe [replicas]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-replica) are not behaving as specified by your zone configurations, whether in terms of data placement or zone constraint conformance, see [Troubleshoot Replication Zones]({% link {{ page.version.version}}/troubleshoot-replication-zones.md %}).

- If you cannot resolve the issue yourself, the following tools can help you move forward:
  - [Support Resources]({% link {{ page.version.version }}/support-resources.md %}) identify ways you can get help with troubleshooting.
  - [File an Issue]({% link {{ page.version.version }}/file-an-issue.md %}) provides details on how to file an issue that you're unable to resolve.
 
- In a support escalation, you may be directed to use the following features by the [Cockroach Labs support team]({% link {{ page.version.version }}/support-resources.md %}):

  - [`cockroach debug zip`]({% link {{ page.version.version }}/cockroach-debug-zip.md %})
  - [`cockroach debug tsdump`]({% link {{ page.version.version }}/cockroach-debug-tsdump.md %})
  - [Automatic CPU Profiler]({% link {{ page.version.version }}/automatic-cpu-profiler.md %})
  - [Automatic Go Execution Tracer]({% link {{ page.version.version }}/automatic-go-execution-tracer.md %})
  - [Transaction Diagnostics]({% link {{ page.version.version }}/transaction-diagnostics.md %})