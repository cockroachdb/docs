---
title: EXPLAIN ANALYZE
summary: The EXPLAIN ANALYZE statement executes a query and generates a physical statement plan with execution statistics.
toc: true
docs_area: reference.sql
---

The `EXPLAIN ANALYZE` [statement](sql-statements.html) **executes a SQL query** and generates a statement plan with execution statistics. Statement plans provide information around SQL execution, which can be used to troubleshoot slow queries by figuring out where time is being spent, how long a processor (i.e., a component that takes streams of input rows and processes them according to a specification) is not doing work, etc. The `(DISTSQL)` option returns the statement plan and performance statistics as well as a generated link to a graphical distributed SQL physical statement plan tree. For more information about distributed SQL queries, see the [DistSQL section of our SQL layer architecture docs](architecture/sql-layer.html#distsql). The `(DEBUG)` option generates a URL to download a bundle with more details about the statement plan for advanced debugging.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/sql/physical-plan-url.md %}
{{site.data.alerts.end}}

## Aliases

`EXPLAIN ANALYSE` is an alias for `EXPLAIN ANALYZE`.

## Synopsis

<div>{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/explain_analyze.html %}</div>

## Parameters

Parameter          | Description
-------------------|-----------
`PLAN`             |  _(Default)_ Execute the statement and return a statement plan with planning and execution time for an [explainable statement](sql-grammar.html#preparable_stmt). See [`PLAN` option](#plan-option).
`DISTSQL`          | Execute the statement and return a statement plan and performance statistics as well as a generated link to a graphical distributed SQL physical statement plan tree. See [`DISTSQL` option](#distsql-option).
`DEBUG`            | Execute the statement and generate a ZIP file containing files with detailed information about the query and the database objects referenced in the query. See [`DEBUG` option](#debug-option).
`preparable_stmt`  | The [statement](sql-grammar.html#preparable_stmt) you want to execute and analyze. All preparable statements are explainable.

## Required privileges

The user requires the appropriate [privileges](security-reference/authorization.html#managing-privileges) for the statement being explained.

## Success responses

A successful `EXPLAIN ANALYZE` statement returns a table with the following details in the `info` column:

 Detail | Description
--------|------------
[Global properties](#global-properties) | The properties and statistics that apply to the entire statement plan.
[Statement plan tree properties](#statement-plan-tree-properties) | A tree representation of the hierarchy of the statement plan.
Node details | The properties, columns, and ordering details for the current statement plan node in the tree.
Time | The time details for the statement. The total time is the planning and execution time of the statement. The execution time is the time it took for the final statement plan to complete. The network time is the amount of time it took to distribute the statement across the relevant nodes in the cluster. Some statements do not need to be distributed, so the network time is 0ms.

If you use the [`DISTSQL` option](#distsql-option), the statement will also return a URL generated for a physical statement plan that provides high level information about how a statement will be executed. {% include {{ page.version.version }}/sql/physical-plan-url.md %} For details about reading the physical statement plan, see [DistSQL plan diagram](#distsql-plan-diagram).

If you use the [`DEBUG` option](#debug-option), the statement will return only a URL and instructions to download the `DEBUG` bundle, which includes the physical statement plan.

### Global properties

Property        | Description
----------------|------------
`planning time` | The total time the planner took to create a statement plan.
`execution time` | The time it took for the final statement plan to complete.
`distribution` | Whether the statement was distributed or local. If `distribution` is `full`, execution of the statement is performed by multiple nodes in parallel, then the results are returned by the gateway node. If `local`, the execution plan is performed only on the gateway node. Even if the execution plan is `local`, row data may be fetched from remote nodes, but the processing of the data is performed by the local node.
`vectorized` | Whether the [vectorized execution engine](vectorized-execution.html) was used in this statement.
`rows read from KV` | The number of rows read from the [storage layer](architecture/storage-layer.html).
`cumulative time spent in KV` | The total amount of time spent in the storage layer.
`cumulative time spent due to contention` | The total amount of time this statement spent waiting in [contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention).
`maximum memory usage` | The maximum amount of memory used by this statement anytime during its execution.
`network usage` | The amount of data transferred over the network while the statement was executed. If the value is 0 B, the statement was executed on a single node and didn't use the network.
`regions` | The [regions](show-regions.html) where the affected nodes were located.
`max sql temp disk usage` | ([`DISTSQL`](#distsql-option) option only) How much disk spilling occurs when executing a query. This property is displayed only when the disk usage is greater than zero.
`estimated RUs consumed` | The estimated number of [Request Units (RUs)](../cockroachcloud/learn-about-request-units.html) consumed by the statement. This property is only visible on {{ site.data.products.serverless }} clusters.

### Statement plan tree properties

Statement plan tree properties | Description
-------------------------------|------------
`processor` | Each processor in the statement plan hierarchy has a node with details about that phase of the statement. For example, a statement with a `GROUP BY` clause has a `group` processor with details about the cluster nodes, rows, and operations related to the `GROUP BY` operation.
`nodes` | The names of the CockroachDB cluster nodes affected by this phase of the statement.
`regions` | The [regions](show-regions.html) where the affected nodes were located.
`actual row count` | The actual number of rows affected by this processor during execution.
`vectorized batch count` | When the [vectorized execution engine](vectorized-execution.html) is used, the number of batches of column data that are processed by the vectorized engine.
`KV time` | The total time this phase of the statement was in the [storage layer](architecture/storage-layer.html).
`KV contention time` | The time the [storage layer](architecture/storage-layer.html) was in contention during this phase of the statement.
`KV rows read` | During scans, the number of rows in the [storage layer](architecture/storage-layer.html) read by this phase of the statement.
`KV bytes read` | During scans, the amount of data read from the [storage layer](architecture/storage-layer.html) during this phase of the statement.
`KV gRPC calls` | During scans, the number of [gRPC calls](architecture/distribution-layer.html#grpc) made between nodes during this phase of the statement.
`estimated max memory allocated` | The estimated maximum allocated memory for a statement.
`estimated max sql temp disk usage` | The estimated maximum temporary disk usage for a statement.
`MVCC step count (ext/int)` | The number of times that the underlying storage iterator stepped forward during the work to serve the operator's reads, including stepping over [MVCC keys](architecture/storage-layer.html#mvcc) that could not be used in the scan.
`MVCC seek count (ext/int)` | The number of times that the underlying storage iterator jumped (seeked) to a different data location.
`estimated row count` | The estimated number of rows affected by this processor according to the statement planner, the percentage of the table the query spans, and when the statistics for the table were last collected.
`table` | The table and index used in a scan operation in a statement, in the form `{table name}@{index name}`.
`spans` | The interval of the key space read by the processor. `FULL SCAN` indicates that the table is scanned on all key ranges of the index (also known as a "full table scan" or "unlimited full scan"). `FULL SCAN (SOFT LIMIT)` indicates that a full table scan can be performed, but will halt early once enough rows have been scanned. `LIMITED SCAN` indicates that the table will be scanned on a subset of key ranges of the index. `[/1 - /1]` indicates that only the key with value `1` is read by the processor.

## `PLAN` option

By default, `EXPLAIN ANALYZE` uses the `PLAN` option. `EXPLAIN ANALYZE` and `EXPLAIN ANALYZE (PLAN)` produce the same output.

### `PLAN` options

The `PLAN` options `VERBOSE` and `TYPES` described in [`EXPLAIN` options](explain.html#options) are also supported. For an example, see [`EXPLAIN ANALYZE (VERBOSE)`](#explain-analyze-verbose).

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
`stats-{table}.sql` | Contains [statistics](create-statistics.html) for a table in the query.
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

The following examples use the [`movr` example dataset](cockroach-demo.html#datasets).

{% include {{ page.version.version }}/demo_movr.md %}

### `EXPLAIN ANALYZE`

Use `EXPLAIN ANALYZE` without an option, or equivalently with the `PLAN` option, to execute a query and display the physical statement plan with execution statistics.

For example, the following `EXPLAIN ANALYZE` statement executes a simple query against the [MovR database](movr.html) and then displays the physical statement plan with execution statistics:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN ANALYZE SELECT city, AVG(revenue) FROM rides GROUP BY city;
~~~

~~~
  planning time: 604µs
  execution time: 51ms
  distribution: full
  vectorized: true
  rows read from KV: 125,000 (21 MiB)
  cumulative time spent in KV: 106ms
  maximum memory usage: 5.0 MiB
  network usage: 2.6 KiB (24 messages)
  regions: us-east1

  • group (streaming)
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
        KV time: 106ms
        KV contention time: 0µs
        KV rows read: 125,000
        KV bytes read: 21 MiB
        estimated max memory allocated: 21 MiB
        estimated row count: 125,000 (100% of the table; stats collected 1 hour ago)
        table: rides@rides_pkey
        spans: FULL SCAN
(30 rows)
~~~

If you perform a join, the estimated max memory allocation is also reported for the join. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN ANALYZE SELECT * FROM vehicles JOIN rides ON rides.vehicle_id = vehicles.id and rides.city = vehicles.city limit 100;
~~~
~~~
                        info
-----------------------------------------------------
  planning time: 1ms
  execution time: 18ms
  distribution: full
  vectorized: true
  rows read from KV: 3,173 (543 KiB)
  cumulative time spent in KV: 37ms
  maximum memory usage: 820 KiB
  network usage: 3.3 KiB (2 messages)
  regions: us-east1

  • limit
  │ nodes: n1
  │ regions: us-east1
  │ actual row count: 100
  │ estimated row count: 100
  │ count: 100
  │
  └── • lookup join
      │ nodes: n1, n2, n3
      │ regions: us-east1
      │ actual row count: 194
      │ KV time: 31ms
      │ KV contention time: 0µs
      │ KV rows read: 173
      │ KV bytes read: 25 KiB
      │ estimated max memory allocated: 300 KiB
      │ estimated row count: 13,837
      │ table: vehicles@vehicles_pkey
      │ equality: (city, vehicle_id) = (city,id)
      │ equality cols are key
      │
      └── • scan
  ...
(41 rows)
~~~

### `EXPLAIN ANALYZE (VERBOSE)`

The `VERBOSE` option displays the physical statement plan with additional execution statistics.

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN ANALYZE (VERBOSE) SELECT city, AVG(revenue) FROM rides GROUP BY city;
~~~

~~~
                                         info
--------------------------------------------------------------------------------------
  planning time: 5ms
  execution time: 65ms
  distribution: full
  vectorized: true
  rows read from KV: 125,000 (21 MiB)
  cumulative time spent in KV: 114ms
  maximum memory usage: 5.0 MiB
  network usage: 2.6 KiB (24 messages)
  regions: us-east1

  • group (streaming)
  │ columns: (city, avg)
  │ nodes: n1, n2, n3
  │ regions: us-east1
  │ actual row count: 9
  │ vectorized batch count: 4
  │ estimated row count: 9
  │ aggregate 0: avg(revenue)
  │ group by: city
  │ ordered: +city
  │
  └── • scan
        columns: (city, revenue)
        ordering: +city
        nodes: n1, n2, n3
        regions: us-east1
        actual row count: 125,000
        vectorized batch count: 124
        KV time: 114ms
        KV contention time: 0µs
        KV rows read: 125,000
        KV bytes read: 21 MiB
        estimated max memory allocated: 21 MiB
        MVCC step count (ext/int): 125,000/125,000
        MVCC seek count (ext/int): 18/18
        estimated row count: 125,000 (100% of the table; stats collected 1 hour ago)
        table: rides@rides_pkey
        spans: FULL SCAN
(38 rows)
~~~

### `EXPLAIN ANALYZE (DISTSQL)`

Use `EXPLAIN ANALYZE (DISTSQL)` to execute a query, display the physical statement plan with execution statistics, and generate a link to a graphical DistSQL statement plan.

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN ANALYZE (DISTSQL) SELECT city, AVG(revenue) FROM rides GROUP BY city;
~~~

~~~
                                          info
----------------------------------------------------------------------------------------------------
  planning time: 638µs
  execution time: 132ms
  distribution: full
  vectorized: true
  rows read from KV: 125,000 (21 MiB)
  cumulative time spent in KV: 228ms
  maximum memory usage: 7.5 MiB
  network usage: 2.5 KiB (24 messages)
  regions: us-east1

  • group (streaming)
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
        KV time: 228ms
        KV contention time: 0µs
        KV rows read: 125,000
        KV bytes read: 21 MiB
        estimated max memory allocated: 20 MiB
        estimated row count: 125,000 (100% of the table; stats collected 1 second ago)
        table: rides@rides_pkey
        spans: FULL SCAN

  Diagram: https://cockroachdb.github.io/distsqlplan/decode.html#eJzUmF9u47YTx99_pyD4lMVPuxIpWZb8...
(32 rows)
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
  Debug -> Statement Diagnostics History), via the direct link below, or using
  the SQL shell or command line.
  Admin UI: http://127.0.0.1:8080
  Direct link: http://127.0.0.1:8080/_admin/v1/stmtbundle/765493679630483457 (Not available for {{ site.data.products.serverless }} clusters.)
  SQL shell: \statement-diag download 765493679630483457
  Command line: cockroach statement-diag download 765493679630483457
(7 rows)
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
