---
title: EXPLAIN ANALYZE
summary: The EXPLAIN ANALYZE statement executes a query and generates a physical statement plan with execution statistics.
toc: true
docs_area: reference.sql
---

The `EXPLAIN ANALYZE` [statement](sql-statements.html) **executes a SQL query** and generates a statement plan with execution statistics. The `(DEBUG)` option generates a URL to download a bundle with more details about the statement plan for advanced debugging. Statement plans provide information around SQL execution, which can be used to troubleshoot slow queries by figuring out where time is being spent, how long a processor (i.e., a component that takes streams of input rows and processes them according to a specification) is not doing work, etc. For more information about distributed SQL queries, see the [DistSQL section of our SQL layer architecture docs](architecture/sql-layer.html#distsql).

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/sql/physical-plan-url.md %}
{{site.data.alerts.end}}

## Aliases

In CockroachDB, the following are aliases for `EXPLAIN ANALYZE`:

- `EXPLAIN ANALYSE`

## Synopsis

<div>{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-21.2/grammar_svg/explain_analyze.html %}</div>

## Parameters

Parameter          | Description
-------------------|-----------
`PLAN`             |  _(Default)_ Executes the statement and returns CockroachDB's statement plan with planning and execution time for an [explainable statement](sql-grammar.html#preparable_stmt). See [Plan option](#plan-option).
`DISTSQL`          | Return the statement plan and performance statistics as well as a generated link to a graphical distributed SQL physical statement plan tree. See [`DISTSQL` option](#distsql-option).
`DEBUG`            |  Generate a ZIP file containing files with detailed information about the query and the database objects referenced in the query. See [`DEBUG` option](#debug-option).
`preparable_stmt`  | The [statement](sql-grammar.html#preparable_stmt) you want to execute and analyze. All preparable statements are explainable.

## Required privileges

The user requires the appropriate [privileges](security-reference/authorization.html#managing-privileges) for the statement being explained.

## Success responses

Successful `EXPLAIN ANALYZE` statements return tables with the following details in the `info` column:

 Detail | Description
--------|------------
[Global properties](#global-properties) | The properties and statistics that apply to the entire statement plan.
[Statement plan tree](#statement-plan-tree-properties) | A tree representation of the hierarchy of the statement plan.
Node details | The properties, columns, and ordering details for the current statement plan node in the tree.
Time | The time details for the statement. The total time is the planning and execution time of the statement. The execution time is the time it took for the final statement plan to complete. The network time is the amount of time it took to distribute the statement across the relevant nodes in the cluster. Some statements do not need to be distributed, so the network time is 0ms.

If you use the [`DISTSQL` option](#distsql-option), the statement will also return a URL generated for a physical statement plan that provides high level information about how a statement will be executed. {% include {{ page.version.version }}/sql/physical-plan-url.md %} For details about reading the physical statement plan, see [DistSQL plan diagram](#distsql-plan-diagram).

If you use the [`DEBUG` option](#debug-option), the statement will return a single `text` column with a URL and instructions to download the `DEBUG` bundle, which includes the physical statement plan.

### Global properties

Property        | Description
----------------|------------
planning time | The total time the planner took to create a statement plan.
execution time | The time it took for the final statement plan to complete.
distribution | Whether the statement was distributed or local. If `distribution` is `full`, execution of the statement is performed by multiple nodes in parallel, then the results are returned by the gateway node. If `local`, the execution plan is performed only on the gateway node. Even if the execution plan is `local`, row data may be fetched from remote nodes, but the processing of the data is performed by the local node.
vectorized | Indicates whether the [vectorized execution engine](vectorized-execution.html) was used in this statement.
rows read from KV | The number of rows read from the [storage layer](architecture/storage-layer.html).
cumulative time spent in KV | The total amount of time spent in the storage layer.
maximum memory usage | The maximum amount of memory used by this statement anytime during its execution.
network usage | The amount of data transferred over the network while the statement was executed. If the value is 0 B, the statement was executed on a single node and didn't use the network.
max sql temp disk usage | **New in v21.2:** <br /> (`DISTSQL` only) How much disk spilling occurs when executing a query. This property is displayed only when the disk usage is greater than zero.

### Statement plan tree properties

Statement plan tree properties | Description
-------------------------------|------------
processor | Each processor in the statement plan hierarchy has a node with details about that phase of the statement. For example, a statement with a `GROUP BY` clause has a `group` processor with details about the cluster nodes, rows, and operations related to the `GROUP BY` operation.
nodes | The names of the CockroachDB cluster nodes affected by this phase of the statement.
regions | The [regions](show-regions.html) where the affected nodes were located.
actual row count | The actual number of rows affected by this processor during execution.
KV time | The total time this phase of the statement was in the [storage layer](architecture/storage-layer.html).
KV contention time | The time the [storage layer](architecture/storage-layer.html) was in contention during this phase of the statement.
KV rows read | During scans, the number of rows in the [storage layer](architecture/storage-layer.html) read by this phase of the statement.
KV bytes read | During scans, the amount of data read from the [storage layer](architecture/storage-layer.html) during this phase of the statement.
estimated row count | The estimated number of rows affected by this processor according to the statement planner, the percentage of the table the query spans, and when the statistics for the table were last collected.
table | The table and index used in a scan operation in a statement, in the form `{table name}@{index name}`.
spans | The interval of the key space read by the processor. If `spans` is `FULL SCAN` the table is scanned on all key ranges of the index. If `spans` is `[/1 - /1]` only the key with value `1` is read by the processor.

## `PLAN` option

By default, `EXPLAIN ANALYZE` uses the `PLAN` option. `EXPLAIN ANALYZE` and `EXPLAIN ANALYZE (PLAN)` produce the same output.

## `DISTSQL` option

`EXPLAIN ANALYZE (DISTSQL)` generates a physical statement in the [plan diagram](#distsql-plan-diagram). The DistSQL plan diagram displays the physical statement plan, as well as execution statistics. The statistics listed depend on the query type and the [execution engine used](vectorized-execution.html). If the query contains subqueries or post-queries there will be multiple diagrams.

{{site.data.alerts.callout_info}}
You can use `EXPLAIN ANALYZE (DISTSQL)` only as the top-level statement in a query.
{{site.data.alerts.end}}

### DistSQL plan diagram

The graphical plan diagram displays the processors and operations that make up the statement plan. While the text output from the `PLAN` option shows the statement plan across the cluster, the `DISTSQL` option shows details on each node involved in the query.

Field | Description | Execution engine
------+-------------+----------------
&lt;Processor&gt;/&lt;id&gt; | The processor and processor ID used to read data into the SQL execution engine.<br><br>A processor is a component that takes streams of input rows, processes them according to a specification, and outputs one stream of rows. For example, a `TableReader `processor reads in data, and an `Aggregator` aggregates input rows. | Both
&lt;table&gt;@&lt;index&gt; | The index used by the processor. | Both
Spans | The interval of the key space read by the processor. For example, `[/1 - /1]` indicates that only the key with value `1` is read by the processor. | Both
Out | The output columns. | Both
KV time | The total time this phase of the query was in the [storage layer](architecture/storage-layer.html). | Both
KV contention time | The time the storage layer was in contention during this phase of the query. | Both
KV rows read | During scans, the number of rows in the storage layer read by this phase of the query. | Both
KV bytes read | During scans, the amount of data read from the storage layer during this phase of the query. | Both
cluster nodes | The names of the CockroachDB cluster nodes involved in the execution of this processor. | Both
batches output | The number of batches of columnar data output. | Vectorized engine only
rows output | The number of rows output. | Vectorized engine only
IO time | How long the TableReader processor spent reading data from disk. | Vectorized engine only
stall time | How long the processor spent not doing work. This is aggregated into the stall time numbers as the query progresses down the tree (i.e., stall time is added up and overlaps with previous time). | Row-oriented engine only
bytes read | The size of the data read by the processor. | Both
rows read | The number of rows read by the processor. | Both
@&lt;n&gt; | The index of the column relative to the input. | Both
max memory used | How much memory (if any) is used to buffer rows. | Row-oriented engine only
max disk used | How much disk (if any) is used to buffer data. Routers and processors will spill to disk buffering if there is not enough memory to buffer the data. | Row-oriented engine only
execution time | How long the engine spent executing the processor. | Vectorized engine only
max vectorized memory allocated | How much memory is allocated to the processor to buffer batches of columnar data. | Vectorized engine only
max vectorized disk used | How much disk (if any) is used to buffer columnar data. Processors will spill to disk buffering if there is not enough memory to buffer the data. | Vectorized engine only
left(@&lt;n&gt;)=right(@&lt;n&gt;) | The equality columns used in the join. | Both
stored side | The smaller table that was stored as an in-memory hash table. | Both
rows routed | How many rows were sent by routers, which can be used to understand network usage. | Row-oriented engine only
network latency | The latency time in nanoseconds between nodes in a stream. | Vectorized engine only
bytes sent | The number of actual bytes sent (i.e., encoding of the rows). This is only relevant when doing network communication. | Both
Render | The stage that renders the output. | Both
by hash | _(Orange box)_ The router, which is a component that takes one stream of input rows and sends them to a node according to a routing algorithm.<br><br>For example, a hash router hashes columns of a row and sends the results to the node that is aggregating the result rows. | Both
unordered / ordered | _(Blue box)_ A synchronizer that takes one or more output streams and merges them to be consumable by a processor. An ordered synchronizer is used to merge ordered streams and keeps the rows in sorted order. | Both
&lt;data type&gt; |  If you specify [`EXPLAIN (DISTSQL, TYPES)`](explain.html#distsql-option), lists the data types of the input columns. | Both
Response | The response back to the client. | Both


## `DEBUG` option

`EXPLAIN ANALYZE (DEBUG)` executes a query and generates a link to a ZIP file that contains the [physical statement plan](#distsql-plan-diagram), execution statistics, statement tracing, and other information about the query.

File                | Description
--------------------+-------------------
`stats-<table>.sql` | Contains [statistics](create-statistics.html) for a table in the query.
`schema.sql`        | Contains [`CREATE`](create-table.html) statements for objects in the query.
`env.sql`           | Contains information about the CockroachDB environment.
`trace.txt`         | Contains [statement traces](show-trace.html) in plaintext format.
`trace.json`        | Contains statement traces in JSON format.
`trace-jaeger.json` | Contains statement traces in JSON format that can be [imported to Jaeger](query-behavior-troubleshooting.html#visualize-statement-traces-in-jaeger).
`distsql.html`      | The query's [physical statement plan](#distsql-plan-diagram). This diagram is identical to the one generated by [`EXPLAIN (DISTSQL)`](explain.html#distsql-option).
`plan.txt`          | The query execution plan. This is identical to the output of [`EXPLAIN (VERBOSE)`](explain.html#verbose-option).
`opt.txt`           | The statement plan tree generated by the [cost-based optimizer](cost-based-optimizer.html). This is identical to the output of [`EXPLAIN (OPT)`](explain.html#opt-option).
`opt-v.txt`         | The statement plan tree generated by the cost-based optimizer, with cost details. This is identical to the output of [`EXPLAIN (OPT, VERBOSE)`](explain.html#opt-option).
`opt-vv.txt`        | The statement plan tree generated by the cost-based optimizer, with cost details and input column data types. This is identical to the output of [`EXPLAIN (OPT, TYPES)`](explain.html#opt-option).
`vec.txt`           | The statement plan tree generated by the [vectorized execution](vectorized-execution.html) engine. This is identical to the output of [`EXPLAIN (VEC)`](explain.html#vec-option).
`vec-v.txt`         | The statement plan tree generated by the vectorized execution engine. This is identical to the output of [`EXPLAIN (VEC, VERBOSE)`](explain.html#vec-option).
`statement.txt`     | The SQL statement for the query.

You can obtain this ZIP file by following the link provided in the `EXPLAIN ANALYZE (DEBUG)` output, or by activating [statement diagnostics](ui-statements-page.html#diagnostics) in the DB Console.

{% include common/sql/statement-bundle-warning.md %}

## Examples

{% include {{ page.version.version }}/demo_movr.md %}

### `EXPLAIN ANALYZE`

Use `EXPLAIN ANALYZE` without an option, or equivalently with the `PLAN` option, to execute a query and display the physical statement plan with execution statistics.

For example, the following `EXPLAIN ANALYZE` statement executes a simple query against the [MovR database](movr.html) and then displays the physical statement plan with execution statistics:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN ANALYZE SELECT city, AVG(revenue) FROM rides GROUP BY city;
~~~

~~~
                  info
----------------------------------------
  planning time: 706µs
  execution time: 693ms
  distribution: full
  vectorized: true
  rows read from KV: 125,000 (21 MiB)
  cumulative time spent in KV: 1.2s
  maximum memory usage: 11 MiB
  network usage: 2.6 KiB (24 messages)
  regions: us-east1

  • group
  │ nodes: n1, n2, n3
  │ regions: us-east1
  │ actual row count: 9
  │ group by: city
  │ ordered: +city
  │
  └── • scan
        nodes: n1, n2, n3
        regions: us-east1
        actual row count: 125,000
        KV time: 2ms
        KV contention time: 0µs
        KV rows read: 125,000
        KV bytes read: 21 MiB
        missing stats
        table: rides@primary
        spans: FULL SCAN
(28 rows)

Time: 694ms total (execution 694ms / network 0ms)
~~~

### `EXPLAIN ANALYZE (DISTSQL)`

Use `EXPLAIN ANALYZE (DISTSQL)` to execute a query, display the physical statement plan with execution statistics, and generate a link to a graphical DistSQL statement plan.

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN ANALYZE (DISTSQL) SELECT city, AVG(revenue) FROM rides GROUP BY city;
~~~

~~~
                                             info
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  planning time: 2ms
  execution time: 782ms
  distribution: full
  vectorized: true
  rows read from KV: 125,000 (21 MiB)
  cumulative time spent in KV: 1.4s
  maximum memory usage: 953 KiB
  network usage: 2.6 KiB (24 messages)
  regions: us-east1

  • group
  │ nodes: n1, n2, n3
  │ regions: us-east1
  │ actual row count: 9
  │ estimated row count: 9
  │ group by: city
  │ ordered: +city
  │
  └── • scan
        nodes: n1, n2, n3
        regions: us-east1
        actual row count: 125,000
        KV time: 1.4s
        KV contention time: 0µs
        KV rows read: 125,000
        KV bytes read: 21 MiB
        estimated row count: 125,000 (100% of the table; stats collected 45 seconds ago)
        table: rides@primary
        spans: FULL SCAN

  Diagram: https://cockroachdb.github.io/distsqlplan/decode.html#eJzMV-9u2zYQ_76nIPgpxdRZJGVL1ic3RbsFTewifwYUUxDQ0sURaosuSSfOguxJBuwp9gJ7lD3JQMlebFmmZcdp-8UQeeLx7nf3-_n0gNWXIQ7x2bvjd2_PUZzqewfx28GBhFvIJvAKvT_tnSCZJqDQz6e9i4_o8FP-GnZwJhLo8hEoHP6GCXYwxQ5m-NLBYyliUEpIY3rIXzxKpjh0HZxm44k225cOjoUEHD5gneoh4BCf8_4QToEnIBsudnACmqfD3H0eQWcs0xGX5u6zMc9UiF43ItwXSosswo0IB__-9WcUTSGIomnSPoyiqetG0TRw508rP8PCjLGDexMdog51OsTc_eFXpNMRhIgxMlLFRiwyDZlORTazuf_8PTNJcaeQBJ6EiPqO77eK7f69hvm-91MLnaSH2MEjPkUjGAl5j_hwKGKuwdibLvqQ2_tcxzegkJjosQmKBtjB-Q3_7xR3XD46uNiaIao0HwAOyaNTH_U3g4GEAddCNtgy6B1T1J5MQJr48tWb7qerbu_8qntxfHzQIa9MKS5ODjrUPL3tXXTPZ88whXiyABXNQSxnRlYSK-X0FGb_Ht1wdbMS4eXjU950bd5PfkSRT9nPj4UjCzit54FzdnFydWTgYWZ1ClkC0pxzUIc2OqwCMi8o2msjaGxtI7AagEyyKkgq0eiK12LcaC8DsVLp6qi9ctTttVF7S1GT-qJBaonGvjTDiM-Yy1TlfowPZiz8DxVFU87gl82-SBRN-7RYYsSzBBEk9A3I9Xrk-952etRqO57nreoRoTvKUWtFjmZX1JOjDfVcYJz3cnLk1ZMjf49yRPYrR_7XlqO2W01sWgatWVOOaH1i07rE3icfDb8Vz9C15FmcqljM_QbQMr_XUdR_H0VTct2p59m97tgnjfb2k0bgVk0a_l4njcCtSe0NFV3o3uY3nzTKf5rPoTbdL7WDr01tWnfSIDtMGhW5noIai0xBaeKo9uwatCAZQIGuEhMZw0cp4vyaYtnLz-UbCShdWEmxOMoKkwlw8TApHyaLh-nSYZJHoyvnHcZY3nHVXCNzqhmz-jJEGkZjlKTqM5ooPjDURlVMdMvQ5xzcJoPW2gwy0HdCfkZDriGL70NUfOHMt-94qku5JaBApnyY_s4X24YVbTM_OJOmGNJbkzpdMM3laW5jTZqnPbePQBk0ll6p_b2wDSrtF0elaQXFtYDiboKE7tgo1MoTtgxJ-TCzk8y1s8yznm7aDzd3pGj9UnqetcFday2ZrcEDby8NzlaraUdlPe1XZmCPWoSL7Shcz89gHxS115UE1roSW13pRpbWqitZRaW1DUt3QsX3fQsqvl3OmxZUWl6wCRWv9qfDMiq-FZXALiDBiwsI8wrQ1kD6PfaZHZQtxga6DpRW0wYKJbuPDaz1UmODHZX1mlRW1Vly1aJKX3AabH9j-aDezs1O_f1Mg_k32uMP_wUAAP__K-8jbQ==
(31 rows)


Time: 841ms total (execution 840ms / network 0ms)
~~~

To view the [DistSQL plan diagram](#distsql-plan-diagram), open the URL following **Diagram**. For an example, see [`DISTSQL` option](explain.html#distsql-option).

### `EXPLAIN ANALYZE (DEBUG)`

Use the [`DEBUG`](#debug-option) option to generate a ZIP file containing files with information about the query and the database objects referenced in the query. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN ANALYZE (DEBUG) SELECT city, AVG(revenue) FROM rides GROUP BY city;
~~~

~~~
                                      info
--------------------------------------------------------------------------------
  Statement diagnostics bundle generated. Download from the DB Console (Advanced
  Debug -> Statement Diagnostics History), using the direct link, or using
  the SQL shell or command line.
  DB Console: http://127.0.0.1:8080
  Direct link: http://127.0.0.1:8080/_admin/v1/stmtbundle/727822547420741633 (Not available for {{ site.data.products.serverless }} clusters.)
  SQL shell: \statement-diag download 727822547420741633
  Command line: cockroach statement-diag download 727822547420741633
(6 rows)

Time: 873ms total (execution 873ms / network 0ms)
~~~

To download the ZIP file containing the statement diagnostics, open the URL after **Direct link**, run the `\statement-diag download` command, or run `cockroach statement-diag download`. You can also obtain the bundle by activating [statement diagnostics](ui-statements-page.html#diagnostics) in the DB Console.

## See also

- [`ALTER TABLE`](alter-table.html)
- [`ALTER SEQUENCE`](alter-sequence.html)
- [`BACKUP`](backup.html)
- [`CANCEL JOB`](cancel-job.html)
- [`CREATE DATABASE`](create-database.html)
- [`DROP DATABASE`](drop-database.html)
- [`EXPLAIN`](explain.html)
- [`EXECUTE`](sql-grammar.html#execute_stmt)
- [`IMPORT`](import.html)
- [Indexes](indexes.html)
- [`INSERT`](insert.html)
- [`PAUSE JOB`](pause-job.html)
- [`RESET`](reset-vars.html)
- [`RESTORE`](restore.html)
- [`RESUME JOB`](resume-job.html)
- [`SELECT`](select-clause.html)
- [Selection Queries](selection-queries.html)
- [`SET`](set-vars.html)
- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`SHOW COLUMNS`](show-columns.html)
- [`UPDATE`](update.html)
- [`UPSERT`](upsert.html)
