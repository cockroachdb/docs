---
title: Performance Tuning Recipe Solutions
summary: Identifying possible fixes for common performance problems
toc: true
toc_not_nested: true
---

This page provides solutions for common performance issues in your clusters. See [the recipes](performance-recipes.html) to identify performance problems in your workload.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="contention"><strong>Contention</strong></button>
    <button class="filter-button page-level" data-scope="fullscans"><strong>Full table scans</strong></button>
    <button class="filter-button page-level" data-scope="primarykey"><strong>Suboptimal primary keys</strong></button>
    <button class="filter-button page-level" data-scope="indexusage"><strong>Slow writes</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="contention">
## Indicators that your workload is experiencing contention

* Your application is experiencing degraded performance with serialization errors like `SQLSTATE: 40001`, `RETRY_WRITE_TOO_OLD`, and `RETRY_SERIALIZABLE`.
* The [SQL Statement Contention graph](ui-sql-dashboard.html#sql-statement-contention) graph is showing spikes over time.
<img src="{{ 'images/v21.2/ui-statement-contention.png' | relative_url }}" alt="SQL Statement Contention graph in the DB Console" style="border:1px solid #eee;max-width:100%" />
* The [Transaction Restarts graph](ui-sql-dashboard.html) graph is showing spikes in retries over time.

## Fix contention problems

{% include {{ page.version.version }}/performance/statement-contention.md %}
</section>

<section class="filter-content" markdown="1" data-scope="fullscans">

## Indicators that your workload has statements with full table scans

* The following query returns statements with full table scans in their statement plan:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW FULL TABLE SCANS;
    ~~~
* The following query against the `CRDB_INTERNAL.node_statement_statistics` table returns results:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT count(*) as total_full_scans
    FROM crdb_internal.node_statement_statistics
    WHERE FullTableScan = 'True';
    ~~~
* Viewing the statement plan on the [Statement details page](ui-statements-page.html#statement-details-page) of the DB Console indicates that the plan contains full table scans.
* The statement plans returned by the [`EXPLAIN`](sql-tuning-with-explain.html) and [`EXPLAIN ANALYZE` commands](explain-analyze.html) indicate that there are full table scans.
* The [Full Table/Index Scans graph](ui-sql-dashboard.html#full-table-index-scans) in the DB Console is showing spikes over time.

## Fix full table scans in statements

Full table scans often result in poor statement performance. Not every full table scan is an indicator of poor performance, however. The [cost-based optimizer](cost-based-optimizer.html) may decide on a full table scan when other [index](indexes.html) or [join scans](joins.html) would result in longer execution time.

[Examine the statements](sql-tuning-with-explain.html) that result in full table scans and consider adding [secondary indexes](schema-design-indexes.html#create-a-secondary-index).

</section>

<section class="filter-content" markdown="1" data-scope="primarykey">

## Indicators that your tables are using suboptimal primary keys

* The [Hardware metrics dashboard](ui-hardware-dashboard.html) in the DB Console shows high resource usage per node.
* The Problem Ranges report on the [Advanced Debug page](ui-debug-pages.html) of the DB Console indicates a high number of queries per second on a subset of ranges or nodes.

## Fix suboptimal primary keys

Evaluate the schema of your table to see if you can redistribute data more evenly across multiple ranges. Specifically, make sure you have followed [best practices when selecting your primary key](schema-design-table.html#primary-key-best-practices).

If your workload with a small dataset (for example, a dataset that contains few index key values) is experiencing resource contention, consider splitting your tables and indexes to [distribute ranges across multiple nodes](split-at.html#split-a-table) to reduce resource contention.

</section>

<section class="filter-content" markdown="1" data-scope="indexusage">

<a id="index-usage"></a>

## Indicators that your tables are experiencing slow writes

If the [Overview dashboard](ui-overview-dashboard.html) in the DB Console shows high service latency when the QPS of `INSERT` and `UPDATE` statements is high, your tables are experiencing slow writes.

## Fix slow writes

Secondary indexes can improve read workload performance. However, there is overhead in maintaining secondary indexes that can affect your write performance. You should profile your tables periodically to determine whether an index is worth the overhead. To identify infrequently accessed indexes that could be candidates to drop, query the `crdb_internal.index_usage_statistics` table :

~~~sql
SELECT
 ti.descriptor_name as table_name,
 ti.index_name,
 total_reads,
 last_read
FROM crdb_internal.index_usage_statistics AS us
JOIN crdb_internal.table_indexes ti
ON us.index_id = ti.index_id
 AND us.table_id = ti.descriptor_id
ORDER BY total_reads ASC;
~~~

Use the values in the `total_reads` and `last_read` columns to identify indexes that have low usage or are stale and could be dropped.

</section>
