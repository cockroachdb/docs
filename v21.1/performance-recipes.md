---
title: Performance tuning recipes
summary: Identifying and fixing common performance problems
toc: true
toc_not_nested: true
---

This page provides recipes for fixing performance issues in your clusters.

{{site.data.alerts.callout_info}}
If you aren't sure whether SQL query performance needs to be improved on your cluster, see [Identify slow queries](query-behavior-troubleshooting.html#identify-slow-statements).
{{site.data.alerts.end}}


<table>
  <tr>
    <th>Problem</th>
    <th>Possible solution</th>
  </tr>
  <tr>
    <td>Your application is experiencing high latency.</td>
    <td>Use the correct <a href="topology-patterns.html">topology pattern</a> for your cluster to minimize network latency.</td>
  </tr>
  <tr>
    <td><ul>
      <li>Your application is experiencing degraded performance with the following serialization errors:
        <ul>
          <li><code>SQLSTATE: 40001</code></li>
          <li><code>RETRY_WRITE_TOO_OLD</code></li>
          <li><code>RETRY_SERIALIZABLE</code></li>
          </ul>
      <li>The <a href="ui-sql-dashboard.html#sql-statement-contention">SQL Statement Contention dashboard</a> in the DB Console is showing spikes over time.</li>
      <li>The <a href="ui-sql-dashboard.html#sql-statement-errors">SQL Statement Errors graph</a> in the DB Console is showing spikes in retries over time.</li>
    </ul>
    </td>
    <td><a href="performance-recipes-solutions.html?filters=contention">Your workload is experiencing contention</a></td>
  </tr>
  <tr>
    <td><ul>
      <li>The statement plan produced by <a href="explain.html"><code>EXPLAIN</code></a> or <a href="explain-analyze.html"><code>EXPLAIN ANALYZE</code></a> indicates that the statement uses a full table scan.</li>
      <li>Querying the <code>crdb_internal.node_statement_statistics</code> table indicates that you have full table scans in some statement's plans.</li>
      <li>Viewing the statement plan on the <a href="ui-statements-page.html#statement-details-page">Statement details page</a> of the DB Console indicates that the plan contains full table scans.</li>
      <li>Running the <a href="show-full-table-scans.html"><code>SHOW FULL TABLE SCANS</code></a> statement returns results.</li>
    </ul>
    </td>
    <td><a href="performance-recipes-solutions.html?filters=fullscans">Poor quality statement plans retrieve more rows than are required, leading to longer execution times</a></td>
  </tr>
  <tr>
    <td><ul>
      <li>The <a href="ui-hardware-dashboard.html">Hardware metrics dashboard</a> in the DB Console shows high resource usage per node.</li>
      <li>The Problem Ranges report on the <a href="ui-debug-pages.html">Advanced Debug page</a> of the DB Console indicates a high number of queries per second on a subset of ranges or nodes.</li>
    </ul>
    </td>
    <td><a href="performance-recipes-solutions.html?filters=primarykey">Your tables may be using a suboptimal primary key, causing resource contention</a></td>
  </tr>
</table>
