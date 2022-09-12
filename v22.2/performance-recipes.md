---
title: Performance Tuning Recipes
summary: Identify, diagnose, and fix common performance problems
toc: true
toc_not_nested: false
docs_area: develop
---

This page provides recipes for fixing performance issues in your applications.

## Problems

This section describes how to use CockroachDB commands and dashboards to identify performance problems in your applications.

<table>
  <tr>
    <th>Observation</th>
    <th>Diagnosis</th>
    <th>Solution</th>
  </tr>
  <tr>
    <tr>
      <td><ul><li>Your application takes a long time to return results.</li></ul></td>
      <td><ul><li>Excess network latency.</li></ul></td>
      <td><ul><li>Use the correct <a href="topology-patterns.html">topology pattern</a> for your cluster.</li></ul></td>
    </tr>
    <td><ul>
      <li>Your application is experiencing degraded performance with the following transaction retry errors:
        <ul>
          <li><code>SQLSTATE: 40001</code></li>
          <li><code>RETRY_WRITE_TOO_OLD</code></li>
          <li><code>RETRY_SERIALIZABLE</code></li>
          </ul>
      <li>The <a href="ui-sql-dashboard.html#sql-statement-contention">SQL Statement Contention dashboard</a> in the DB Console is showing spikes over time.</li>
      <li>The <a href="ui-sql-dashboard.html#sql-statement-errors">SQL Statement Errors graph</a> in the DB Console is showing spikes in retries over time.</li>
    </ul>
    </td>
    <td><ul><li>Your application is experiencing transaction contention.</li></ul></td>
    <td><ul><li><a href="#transaction-contention">Reduce transaction contention.</a></li></ul></td>
  </tr>
  <tr>
    <td><ul>
      <li>The statement plan produced by <a href="explain.html"><code>EXPLAIN</code></a> or <a href="explain-analyze.html"><code>EXPLAIN ANALYZE</code></a> indicates that the statement uses a full table scan.</li>
      <li>Querying the <code>crdb_internal.node_statement_statistics</code> table indicates that you have full table scans in some statement's plans.</li>
      <li>Viewing the statement plan on the <a href="ui-statements-page.html#statement-fingerprint-page">Statement Fingerprint page</a> of the DB Console indicates that the plan contains full table scans.</li>
      <li>Running the <a href="show-full-table-scans.html"><code>SHOW FULL TABLE SCANS</code></a> statement returns results.</li>
      <li>The <a href="ui-sql-dashboard.html#full-table-index-scans">Full Table/Index Scans graph</a> in the DB Console is showing spikes over time.</li>
    </ul>
    </td>
    <td><ul><li>Poor quality statement plans retrieve more rows than are required, leading to longer execution times.</li></ul></td>
    <td><ul><li><a href="#statements-with-full-table-scans">Use indexes to reduce full table scans.</a></li></ul></td>
  </tr>
  <tr>
    <td><ul>
      <li>The <a href="ui-hardware-dashboard.html">Hardware metrics dashboard</a> in the DB Console shows high resource usage per node.</li>
      <li>The Problem Ranges report on the <a href="ui-debug-pages.html">Advanced Debug page</a> of the DB Console indicates a high number of queries per second on a subset of ranges or nodes.</li>
    </ul>
    </td>
    <td><ul><li>You have resource contention.</li></ul></td>
    <td><ul><li><a href="#suboptimal-primary-keys">Improve primary key usage.</a></li></ul></td>
  </tr>
  <tr>
    <td><ul><li>The <a href="ui-overview-dashboard.html#">Overview dashboard</a> in the DB Console shows high service latency and QPS for <code>INSERT</code> and <code>UPDATE</code> statements.</li></ul></td>
    <td><ul><li>Your tables have long write times.</li></ul></td>
    <td><ul><li><a href="#slow-writes">Remove unnecessary indexes.</a></li></ul></td>
  </tr>
</table>

## Solutions

This section provides solutions for common performance issues in your applications.

### Transaction contention

Transaction contention occurs when transactions issued from multiple clients at the same time operate on the same data. This can cause transactions to wait on each other (like when many people try to check out with the same cashier at a store) and decrease performance.

#### Indicators that your application is experiencing transaction contention

* In the [Insights > Workload Insights > Transaction Executions](ui-insights-page.html) view, transaction executions display the High Contention Time insight.
* Your application is experiencing degraded performance with transaction errors like `SQLSTATE: 40001`, `RETRY_WRITE_TOO_OLD`, and `RETRY_SERIALIZABLE`. See [Transaction Retry Error Reference](transaction-retry-error-reference.html).
* The [SQL Statement Contention graph](ui-sql-dashboard.html#sql-statement-contention) is showing spikes over time.
<img src="{{ 'images/v22.2/ui-statement-contention.png' | relative_url }}" alt="SQL Statement Contention graph in the DB Console" style="border:1px solid #eee;max-width:100%" />
* The [Transaction Restarts graph](ui-sql-dashboard.html) is showing spikes in retries over time.

#### Fix transaction contention problems

{% include {{ page.version.version }}/performance/statement-contention.md %}

### Statements with full table scans

Full table scans often result in poor statement performance.

#### Indicators that your application has statements with full table scans

* The following query returns statements with full table scans in their statement plan:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW FULL TABLE SCANS;
    ~~~
* The following query against the `crdb_internal.node_statement_statistics` table returns results:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT count(*) as total_full_scans
    FROM crdb_internal.node_statement_statistics
    WHERE full_scan = true;
    ~~~
* Viewing the statement plan on the [Statement details page](ui-statements-page.html#statement-fingerprint-page) of the DB Console indicates that the plan contains full table scans.
* The statement plans returned by the [`EXPLAIN`](sql-tuning-with-explain.html) and [`EXPLAIN ANALYZE` commands](explain-analyze.html) indicate that there are full table scans.
* The [Full Table/Index Scans graph](ui-sql-dashboard.html#full-table-index-scans) in the DB Console is showing spikes over time.

#### Fix full table scans in statements

Not every full table scan is an indicator of poor performance. The [cost-based optimizer](cost-based-optimizer.html) may decide on a full table scan when other [index](indexes.html) or [join scans](joins.html) would result in longer execution time.

[Examine the statements](sql-tuning-with-explain.html) that result in full table scans and consider adding [secondary indexes](schema-design-indexes.html#create-a-secondary-index).

Also see [Table scans best practices](performance-best-practices-overview.html#table-scan-best-practices).

### Suboptimal primary keys

#### Indicators that your tables are using suboptimal primary keys

* The [Hardware metrics dashboard](ui-hardware-dashboard.html) in the DB Console shows high resource usage per node.
* The Problem Ranges report on the [Advanced Debug page](ui-debug-pages.html) of the DB Console indicates a high number of queries per second on a subset of ranges or nodes.

#### Fix suboptimal primary keys

Evaluate the schema of your table to see if you can redistribute data more evenly across multiple ranges. Specifically, make sure you have followed [best practices when selecting your primary key](schema-design-table.html#primary-key-best-practices).

If your application with a small dataset (for example, a dataset that contains few index key values) is experiencing resource contention, consider splitting your tables and indexes to [distribute ranges across multiple nodes](split-at.html#split-a-table) to reduce resource contention.

### Slow writes

#### Indicators that your tables are experiencing slow writes

If the [Overview dashboard](ui-overview-dashboard.html) in the DB Console shows high service latency when the QPS of `INSERT` and `UPDATE` statements is high, your tables are experiencing slow writes.

#### Fix slow writes

[Secondary indexes](schema-design-indexes.html) can improve application read performance. However, there is overhead in maintaining secondary indexes that can affect your write performance. You should profile your tables periodically to determine whether an index is worth the overhead. To identify infrequently accessed indexes that could be candidates to drop, do one of the following:

- In the DB Console, visit the [Databases page](ui-databases-page.html) and traverse databases and tables to find [index recommendations](ui-databases-page.html#index-recommendations) to drop unused indexes.
- Run a join query against the [`crdb_internal.index_usage_statistics`](crdb-internal.html#index_usage_statistics) and `crdb_internal.table_indexes` tables:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT ti.descriptor_name as table_name, ti.index_name, total_reads, last_read
    FROM crdb_internal.index_usage_statistics AS us
    JOIN crdb_internal.table_indexes ti
    ON us.index_id = ti.index_id
    AND us.table_id = ti.descriptor_id
    ORDER BY total_reads ASC;
    ~~~

    ~~~
                  table_name     |                  index_name                   | total_reads |           last_read
    -----------------------------+-----------------------------------------------+-------------+--------------------------------
      vehicle_location_histories | vehicle_location_histories_pkey               |           1 | 2021-09-28 22:59:03.324398+00
      rides                      | rides_auto_index_fk_city_ref_users            |           1 | 2021-09-28 22:59:01.500962+00
      rides                      | rides_auto_index_fk_vehicle_city_ref_vehicles |           1 | 2021-09-28 22:59:02.470526+00
      user_promo_codes           | user_promo_codes_pkey                         |         456 | 2021-09-29 00:01:17.063418+00
      promo_codes                | promo_codes_pkey                              |         910 | 2021-09-29 00:01:17.062319+00
      vehicles                   | vehicles_pkey                                 |        3591 | 2021-09-29 00:01:18.261658+00
      users                      | users_pkey                                    |        5401 | 2021-09-29 00:01:18.260198+00
      rides                      | rides_pkey                                    |       45658 | 2021-09-29 00:01:18.258208+00
      vehicles                   | vehicles_auto_index_fk_city_ref_users         |       87119 | 2021-09-29 00:01:19.071476+00
    (9 rows)
    ~~~

    Use the values in the `total_reads` and `last_read` columns to identify indexes that have low usage or are stale and could be dropped.

## See also

If you aren't sure whether SQL query performance needs to be improved, see [Identify slow queries](query-behavior-troubleshooting.html#identify-slow-queries).
