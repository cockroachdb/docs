---
title: Performance tuning recipes
summary: Identifying and fixing common performance problems
toc: true
toc_not_nested: true
---

This page provides recipes for fixing performance issues in your clusters.

{{site.data.alerts.callout_success}}
For guidance on deployment and data location techniques to minimize network latency, see [Topology Patterns](topology-patterns.html).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
If you aren't sure whether SQL query performance needs to be improved on your cluster, see [Identify slow queries](query-behavior-troubleshooting.html#identify-slow-statements).
{{site.data.alerts.end}}

## Problem: Your application is encountering serialization errors

Your application is experiencing degraded performance with serialization errors like:

  - `SQLSTATE: 40001`
  - `RETRY_WRITE_TOO_OLD`
  - `RETRY_SERIALIZABLE`

### Possible cause of the error

These errors indicate that your workload is experiencing [contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention).

### Fixing the error

{% include {{ page.version.version }}/performance/statement_contention.md %}

## Problem: The SQL Statement Contention chart is showing spikes

The [SQL Statement Contention graph](ui-sql-dashboard.html#sql-statement-contention) graph is showing spikes over time.

{%comment%} Add screenshot of high-contention graph {%endcomment%}

### Possible cause of the error

These errors indicate that your workload is experiencing [contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention).

### Fixing the error

{% include {{ page.version.version }}/performance/statement_contention.md %}

## The SQL Statement Errors chart is showing spikes in retries

The [SQL Statement Errors graph](ui-sql-dashboard.html#sql-statement-errors) graph is showing spikes in retries over time.

### Possible cause of the error

These errors indicate that your workload is experiencing [contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention).

### Fixing the error

{% include {{ page.version.version }}/performance/statement_contention.md %}