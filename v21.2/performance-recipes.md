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


Problem  | Possible solution
---------|--------------------
Your application is experiencing degraded performance with the following serialization errors:<br>`SQLSTATE: 40001`<br>`RETRY_WRITE_TOO_OLD`<br>`RETRY_SERIALIZABLE`<br><br>The [SQL Statement Contention dashboard](ui-sql-dashboard.html#sql-statement-contention) in the DB Console is showing spikes over time.<br><br>The [SQL Statement Errors graph](ui-sql-dashboard.html#sql-statement-errors) in the DB Console is showing spikes in retries over time. | [Your workload is experiencing contention](performance-recipes-solutions.html?filters=contention)
The statement plan produced by `EXPLAIN` or `EXPLAIN ANALYZE` indicates that the statement uses a full table scan.<br><br>Querying the `CRDB_INTERNAL.node_statement_statistics` table indicates that you have full table scans in some statement's plans.<br><br>Viewing the statement plan on the [Statement details page](ui-statements-page.html#statement-details-page) of the DB Console indicates that the plan contains full table scans.<br><br>Running the `SHOW FULL TABLE SCANS` statement returns results. <br><br>The [Full Table/Index Scans graph](ui-sql-dashboard.html#full-table-index-scans) in the DB Console is showing spikes over time. | [Poor quality statement plans retrieve more rows than are required, leading to longer execution times](performance-recipes-solutions.html?filters=fullscans)
The [Hardware metrics dashboard](ui-hardware-dashboard.html) in the DB Console shows high resource usage per node.<br><br>The Problem Ranges report on the [Advanced Debug page](ui-debug-pages.html) of the DB Console indicates a high number of queries per second on a subset of ranges or nodes. | [Your tables may be using a suboptimal primary key, causing resource contention](performance-recipes-solutions.html?filters=primarykey)
