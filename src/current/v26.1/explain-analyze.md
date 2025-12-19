---
title: EXPLAIN ANALYZE
summary: The EXPLAIN ANALYZE statement executes a query and generates a physical statement plan with execution statistics.
toc: true
docs_area: reference.sql
---

The `EXPLAIN ANALYZE` [statement]({% link {{ page.version.version }}/sql-statements.md %}) **executes a SQL query** and generates a statement plan with execution statistics. Statement plans provide information around SQL execution, which can be used to troubleshoot slow queries by figuring out where time is being spent, how long a processor (i.e., a component that takes streams of input rows and processes them according to a specification) is not doing work, etc. The `(DISTSQL)` option returns the statement plan and performance statistics as well as a generated link to a graphical distributed SQL physical statement plan tree. For more information about distributed SQL queries, see the [DistSQL section of our SQL layer architecture docs]({% link {{ page.version.version }}/architecture/sql-layer.md %}#distsql). The `(DEBUG)` option generates a URL to download a bundle with more details about the statement plan for advanced debugging.

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
`PLAN`             |  _(Default)_ Execute the statement and return a statement plan with planning and execution time for an [explainable statement]({% link {{ page.version.version }}/sql-grammar.md %}#preparable_stmt). See [`PLAN` option](#plan-option).
`VERBOSE`          | Execute the statement and show as much information as possible about the statement plan.
`TYPES`            | Execute the statement and include the intermediate [data types]({% link {{ page.version.version }}/data-types.md %}) CockroachDB chooses to evaluate intermediate SQL expressions.
`DEBUG`            | Execute the statement and generate a ZIP file containing files with detailed information about the query and the database objects referenced in the query. See [`DEBUG` option](#debug-option).
`REDACT`           | Execute the statement and redact constants, literal values, parameter values, and personally identifiable information (PII) from the output. See [`REDACT` option](#redact-option).
`DISTSQL`          | Execute the statement and return a statement plan and performance statistics as well as a generated link to a graphical distributed SQL physical statement plan tree. See [`DISTSQL` option](#distsql-option).
`preparable_stmt`  | The [statement]({% link {{ page.version.version }}/sql-grammar.md %}#preparable_stmt) you want to execute and analyze. All preparable statements are explainable.

## Required privileges

To generate a statement bundle, you must have the [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) to execute the SQL statement, as well as the privileges required to collect the statement bundle.

To find the minimum required privileges for a SQL statement, refer to the [SQL reference documentation]({% link {{ page.version.version}}/sql-statements.md %}) for the statement.

A user with the `VIEWACTIVITY` [system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) can generate a bundle for any statement. To grant this privilege, issue the following SQL commands. Replace `{user}` with the user's ID.

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER USER {user} WITH VIEWACTIVITY;
GRANT SYSTEM VIEWSYSTEMTABLE TO {user};
~~~

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
`plan type` | The plan type used by the query: `generic, re-optimized`, `generic, reused`, or `custom`. For details, refer to [Query plan type]({% link {{ page.version.version }}/cost-based-optimizer.md %}#query-plan-type).
`vectorized` | Whether the [vectorized execution engine]({% link {{ page.version.version }}/vectorized-execution.md %}) was used in this statement.
`rows decoded from KV` | The number of rows read from the [storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}).
`cumulative time spent in KV` | The total amount of time spent in the storage layer.
`cumulative time spent due to contention` | The total amount of time this statement spent waiting in [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#understanding-and-avoiding-transaction-contention).
`cumulative time spent waiting in admission control` | The total amount of time this statement spent waiting in [admission control]({% link {{ page.version.version }}/admission-control.md %}). This includes time spent in [quorum replication flow control]({% link {{ page.version.version }}/admission-control.md %}#replication-admission-control). This property is displayed only when the wait time is greater than zero.
`maximum memory usage` | The maximum amount of memory used by this statement anytime during its execution.
`network usage` | The amount of data transferred over the network while the statement was executed. If the value is 0 B, the statement was executed on a single node and didn't use the network.
`regions` | The [regions]({% link {{ page.version.version }}/show-regions.md %}) where the affected nodes were located.
`kv cpu time` | The total amount of time spent in the [KV layer]({% link {{ page.version.version }}/architecture/overview.md %}#layers) on the critical path of serving the query. Excludes time spent on asynchronous replication and in the [storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}).
`sql cpu time` | The total amount of time spent in the [SQL layer]({% link {{ page.version.version }}/architecture/sql-layer.md %}).
`max sql temp disk usage` | ([`DISTSQL`](#distsql-option) option only) How much disk spilling occurs when executing a query. This property is displayed only when the disk usage is greater than zero.
`estimated RUs consumed` | The estimated number of [Request Units (RUs)]({% link cockroachcloud/plan-your-cluster-basic.md %}#request-units) consumed by the statement. This property is visible only on CockroachDB {{ site.data.products.basic }} clusters.
`isolation level` | The [isolation level]({% link {{ page.version.version }}/transactions.md %}#isolation-levels) at which this statement executed.
`priority` | The [transaction priority level]({% link {{ page.version.version }}/transactions.md %}#transaction-priorities) at which this statement executed.
`quality of service` | The session's [quality of service]({% link {{ page.version.version }}/admission-control.md %}#set-quality-of-service-level-for-a-session) level at which the statement executed.
`historical` | The timestamp and [follower read type]({% link {{ page.version.version }}/follower-reads.md %}#follower-read-types), if applicable, for [historical reads]({% link {{ page.version.version }}/as-of-system-time.md %}).

### Statement plan tree properties

Statement plan tree properties | Description
-------------------------------|------------
`processor` | Each processor in the statement plan hierarchy has a node with details about that phase of the statement. For example, a statement with a `GROUP BY` clause has a `group` processor with details about the cluster nodes, rows, and operations related to the `GROUP BY` operation.
`sql nodes` | The names of CockroachDB SQL nodes that were chosen to perform additional manipulation (like filtering and joins) over the rows affected by this SQL statement. This always includes the gateway node.
`kv nodes` | The names of CockroachDB nodes that had to perform reads from disk to fetch necessary data for this SQL statement.
`regions` | The [regions]({% link {{ page.version.version }}/show-regions.md %}) where the affected nodes were located.
`used follower read` | Whether the query used a [follower read]({% link {{ page.version.version }}/follower-reads.md %}#verify-that-cockroachdb-is-performing-follower-reads).
`actual row count` | The actual number of rows affected by this processor during execution.
`vectorized batch count` | When the [vectorized execution engine]({% link {{ page.version.version }}/vectorized-execution.md %}) is used, the number of batches of column data that are processed by the vectorized engine.
`KV time` | The total time this phase of the statement was in the [storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}).
`KV contention time` | The time the [storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}) was in contention during this phase of the statement.
`KV rows read` | During scans, the number of rows in the [storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}) read by this phase of the statement.
`KV bytes read` | During scans, the amount of data read from the [storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}) during this phase of the statement.
`KV gRPC calls` | During scans, the number of [gRPC calls]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#grpc) made between nodes during this phase of the statement.
`estimated max memory allocated` | The estimated maximum allocated memory for a statement.
`estimated max sql temp disk usage` | The estimated maximum temporary disk usage for a statement.
`MVCC step count (ext/int)` | The number of times that the underlying storage iterator stepped forward during the work to serve the operator's reads, including stepping over [MVCC keys]({% link {{ page.version.version }}/architecture/storage-layer.md %}#mvcc) that could not be used in the scan.
`MVCC seek count (ext/int)` | The number of times that the underlying storage iterator jumped (seeked) to a different data location.
`sql cpu time` | The total time this phase of the statement was in the [SQL layer]({% link {{ page.version.version }}/architecture/sql-layer.md %}). It does not include time spent in the [storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}).
`estimated row count` | The estimated number of rows affected by this processor according to the statement planner, the percentage of the table the query spans, and when the statistics for the table were last collected.
`table` | The table and index used in a scan operation in a statement, in the form `{table name}@{index name}`.
`spans` | The interval of the key space read by the processor. `FULL SCAN` indicates that the table is scanned on all key ranges of the index (also known as a "full table scan" or "unlimited full scan"). `FULL SCAN (SOFT LIMIT)` indicates that a full table scan can be performed, but will halt early once enough rows have been scanned. `LIMITED SCAN` indicates that the table will be scanned on a subset of key ranges of the index. `[/1 - /1]` indicates that only the key with value `1` is read by the processor.

## `PLAN` option

By default, `EXPLAIN ANALYZE` uses the `PLAN` option. `EXPLAIN ANALYZE` and `EXPLAIN ANALYZE (PLAN)` produce the same output.

### `PLAN` suboptions

The `PLAN` suboptions `VERBOSE` and `TYPES` described in [`EXPLAIN` options]({% link {{ page.version.version }}/explain.md %}#options) are also supported. For an example, see [`EXPLAIN ANALYZE (VERBOSE)`](#explain-analyze-verbose).

## `DISTSQL` option

`EXPLAIN ANALYZE (DISTSQL)` generates a physical statement in the [plan diagram](#distsql-plan-diagram). The DistSQL plan diagram displays the physical statement plan, as well as execution statistics. The statistics listed depend on the query type and the [execution engine used]({% link {{ page.version.version }}/vectorized-execution.md %}). If the query contains subqueries or post-queries there will be multiple diagrams.

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
KV time | The total time this phase of the query was in the [storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}). | Both
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
&lt;data type&gt; |  If you specify [`EXPLAIN (DISTSQL, TYPES)`]({% link {{ page.version.version }}/explain.md %}#distsql-option), lists the data types of the input columns. | Both
Response | The response back to the client. | Both

## `DEBUG` option

`EXPLAIN ANALYZE (DEBUG)` executes a query and generates a link to a ZIP file that contains the [physical statement plan](#distsql-plan-diagram), execution statistics, statement tracing, and other information about the query.

File                | Description
--------------------+-------------------
`stats-{table}.sql` | Contains [statistics]({% link {{ page.version.version }}/create-statistics.md %}) for a table in the query.
`schema.sql`        | Contains [`CREATE`]({% link {{ page.version.version }}/create-table.md %}) statements for objects in the query.
`env.sql`           | Contains information about the CockroachDB environment.
`trace.txt`         | Contains [statement traces]({% link {{ page.version.version }}/show-trace.md %}) in plaintext format.
`trace.json`        | Contains statement traces in JSON format.
`trace-jaeger.json` | Contains statement traces in JSON format that can be [imported to Jaeger]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}#visualize-statement-traces-in-jaeger).
`distsql.html`      | The query's [physical statement plan](#distsql-plan-diagram). This diagram is identical to the one generated by [`EXPLAIN (DISTSQL)`]({% link {{ page.version.version }}/explain.md %}#distsql-option).
`plan.txt`          | The query execution plan. This is identical to the output of [`EXPLAIN (VERBOSE)`]({% link {{ page.version.version }}/explain.md %}#verbose-option).
`opt.txt`           | The statement plan tree generated by the [cost-based optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}). This is identical to the output of [`EXPLAIN (OPT)`]({% link {{ page.version.version }}/explain.md %}#opt-option).
`opt-v.txt`         | The statement plan tree generated by the cost-based optimizer, with cost details. This is identical to the output of [`EXPLAIN (OPT, VERBOSE)`]({% link {{ page.version.version }}/explain.md %}#opt-option).
`opt-vv.txt`        | The statement plan tree generated by the cost-based optimizer, with cost details and input column data types. This is identical to the output of [`EXPLAIN (OPT, TYPES)`]({% link {{ page.version.version }}/explain.md %}#opt-option).
`vec.txt`           | The statement plan tree generated by the [vectorized execution]({% link {{ page.version.version }}/vectorized-execution.md %}) engine. This is identical to the output of [`EXPLAIN (VEC)`]({% link {{ page.version.version }}/explain.md %}#vec-option).
`vec-v.txt`         | The statement plan tree generated by the vectorized execution engine. This is identical to the output of [`EXPLAIN (VEC, VERBOSE)`]({% link {{ page.version.version }}/explain.md %}#vec-option).
`statement.txt`     | The SQL statement for the query.

You can obtain this ZIP file by following the link provided in the `EXPLAIN ANALYZE (DEBUG)` output, or by activating [statement diagnostics]({% link {{ page.version.version }}/ui-statements-page.md %}#diagnostics) in the DB Console.

{% include common/sql/statement-bundle-warning.md %}

## `REDACT` option

`EXPLAIN ANALYZE (REDACT)` executes a query and causes constants, literal values, parameter values, and personally identifiable information (PII) to be redacted as `‹×›` in the output.

You can use the `REDACT` flag in combination with the [`PLAN`](#plan-option) option (including the `VERBOSE` and `TYPES` [suboptions](#plan-suboptions)) to redact sensitive values in the physical statement plan, and with the [`DEBUG`](#debug-option) option to redact values in the statement bundle.

For an example, see [`EXPLAIN ANALYZE (REDACT)`](#explain-analyze-redact).

## Examples

The following examples use the [`movr` example dataset]({% link {{ page.version.version }}/cockroach-demo.md %}#datasets).

{% include {{ page.version.version }}/demo_movr.md %}

### `EXPLAIN ANALYZE`

Use `EXPLAIN ANALYZE` without an option, or equivalently with the `PLAN` option, to execute a query and display the physical statement plan with execution statistics.

For example, the following `EXPLAIN ANALYZE` statement executes a simple query against the [MovR database]({% link {{ page.version.version }}/movr.md %}) and then displays the physical statement plan with execution statistics:

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN ANALYZE SELECT city, AVG(revenue) FROM rides GROUP BY city;
~~~

~~~
                                       info
----------------------------------------------------------------------------------
  planning time: 4ms
  execution time: 5ms
  distribution: full
  vectorized: true
  plan type: custom
  rows decoded from KV: 500 (87 KiB, 1 gRPC calls)
  cumulative time spent in KV: 4ms
  maximum memory usage: 240 KiB
  network usage: 0 B (0 messages)
  regions: us-east1
  kv cpu time: 1ms
  sql cpu time: 443µs
  estimated RUs consumed: 0
  isolation level: serializable
  priority: normal
  quality of service: regular

  • group (streaming)
  │ sql nodes: n1
  │ regions: us-east1
  │ actual row count: 9
  │ sql cpu time: 237µs
  │ estimated row count: 9
  │ group by: city
  │ ordered: +city
  │
  └── • scan
        sql nodes: n1
        kv nodes: n1
        regions: us-east1
        actual row count: 500
        KV time: 4ms
        KV contention time: 0µs
        KV rows decoded: 500
        KV bytes read: 87 KiB
        KV gRPC calls: 1
        estimated max memory allocated: 130 KiB
        sql cpu time: 205µs
        estimated row count: 500 (100% of the table; stats collected 4 days ago)
        table: rides@rides_pkey
        spans: FULL SCAN
(40 rows)
~~~

If you perform a join, the estimated max memory allocation is also reported for the join. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN ANALYZE SELECT * FROM vehicles JOIN rides ON rides.vehicle_id = vehicles.id and rides.city = vehicles.city limit 100;
~~~
~~~
                                         info
--------------------------------------------------------------------------------------
  planning time: 2ms
  execution time: 7ms
  distribution: local
  vectorized: true
  plan type: custom
  rows decoded from KV: 515 (90 KiB, 2 gRPC calls)
  cumulative time spent in KV: 6ms
  maximum memory usage: 590 KiB
  network usage: 0 B (0 messages)
  regions: us-east1
  sql cpu time: 511µs
  estimated RUs consumed: 0
  isolation level: serializable
  priority: normal
  quality of service: regular

  • limit
  │ count: 100
  │
  └── • hash join
      │ sql nodes: n1
      │ regions: us-east1
      │ actual row count: 100
      │ estimated max memory allocated: 320 KiB
      │ estimated max sql temp disk usage: 0 B
      │ sql cpu time: 214µs
      │ estimated row count: 56
      │ equality: (vehicle_id, city) = (id, city)
      │ right cols are key
      │
      ├── • scan
      │     sql nodes: n1
      │     kv nodes: n1
      │     regions: us-east1
      │     actual row count: 500
      │     KV time: 3ms
      │     KV contention time: 0µs
      │     KV rows decoded: 500
      │     KV bytes read: 87 KiB
      │     KV gRPC calls: 1
      │     estimated max memory allocated: 250 KiB
      │     sql cpu time: 264µs
      │     estimated row count: 500 (100% of the table; stats collected 4 days ago)
      │     table: rides@rides_pkey
      │     spans: FULL SCAN
      │
      └── • scan
            sql nodes: n1
            kv nodes: n1
            regions: us-east1
            actual row count: 15
            KV time: 3ms
            KV contention time: 0µs
            KV rows decoded: 15
            KV bytes read: 2.4 KiB
            KV gRPC calls: 1
            estimated max memory allocated: 20 KiB
            sql cpu time: 32µs
            estimated row count: 15 (100% of the table; stats collected 4 days ago)
            table: vehicles@vehicles_pkey
            spans: FULL SCAN
(61 rows)
~~~

### `EXPLAIN ANALYZE (VERBOSE)`

Use the `VERBOSE` suboption of `PLAN` to execute a query and display the physical statement plan with additional execution statistics.

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN ANALYZE (VERBOSE) SELECT city, AVG(revenue) FROM rides GROUP BY city;
~~~

~~~
                                       info
----------------------------------------------------------------------------------
  planning time: 60µs
  execution time: 4ms
  distribution: full
  vectorized: true
  plan type: generic, reused
  rows decoded from KV: 500 (87 KiB, 500 KVs, 1 gRPC calls)
  cumulative time spent in KV: 4ms
  maximum memory usage: 240 KiB
  network usage: 0 B (0 messages)
  regions: us-east1
  kv cpu time: 944µs
  sql cpu time: 275µs
  estimated RUs consumed: 0
  isolation level: serializable
  priority: normal
  quality of service: regular

  • group (streaming)
  │ columns: (city, avg)
  │ sql nodes: n1
  │ regions: us-east1
  │ actual row count: 9
  │ vectorized batch count: 1
  │ sql cpu time: 74µs
  │ estimated row count: 9
  │ aggregate 0: avg(revenue)
  │ group by: city
  │ ordered: +city
  │
  └── • scan
        columns: (city, revenue)
        ordering: +city
        sql nodes: n1
        kv nodes: n1
        regions: us-east1
        actual row count: 500
        vectorized batch count: 1
        KV time: 4ms
        KV contention time: 0µs
        KV rows decoded: 500
        KV pairs read: 500
        KV bytes read: 87 KiB
        KV gRPC calls: 1
        estimated max memory allocated: 130 KiB
        sql cpu time: 201µs
        MVCC step count (ext/int): 500/500
        MVCC seek count (ext/int): 9/9
        estimated row count: 500 (100% of the table; stats collected 4 days ago)
        table: rides@rides_pkey
        spans: FULL SCAN
(49 rows)
~~~

### `EXPLAIN ANALYZE (DISTSQL)`

Use `EXPLAIN ANALYZE (DISTSQL)` to execute a query, display the physical statement plan with execution statistics, and generate a link to a graphical DistSQL statement plan.

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN ANALYZE (DISTSQL) SELECT city, AVG(revenue) FROM rides GROUP BY city;
~~~

~~~
           info
----------------------------------------------------------------------------------
  planning time: 580µs
  execution time: 4ms
  distribution: full
  vectorized: true
  plan type: custom
  rows decoded from KV: 500 (87 KiB, 1 gRPC calls)
  cumulative time spent in KV: 4ms
  maximum memory usage: 240 KiB
  network usage: 0 B (0 messages)
  regions: us-east1
  kv cpu time: 1ms
  sql cpu time: 300µs
  estimated RUs consumed: 0
  isolation level: serializable
  priority: normal
  quality of service: regular

  • group (streaming)
  │ sql nodes: n1
  │ regions: us-east1
  │ actual row count: 9
  │ sql cpu time: 78µs
  │ estimated row count: 9
  │ group by: city
  │ ordered: +city
  │
  └── • scan
        sql nodes: n1
        kv nodes: n1
        regions: us-east1
        actual row count: 500
        KV time: 4ms
        KV contention time: 0µs
        KV rows decoded: 500
        KV bytes read: 87 KiB
        KV gRPC calls: 1
        estimated max memory allocated: 130 KiB
        sql cpu time: 222µs
        estimated row count: 500 (100% of the table; stats collected 4 days ago)
        table: rides@rides_pkey
        spans: FULL SCAN

  Diagram: https://cockroachdb.github.io/distsqlplan/decode.html#eJyUU9FO6z...
(42 rows)
~~~

To view the [DistSQL plan diagram](#distsql-plan-diagram), open the URL following **Diagram**. For an example, see [`DISTSQL` option]({% link {{ page.version.version }}/explain.md %}#distsql-option).

### `EXPLAIN ANALYZE (DEBUG)`

Use the [`DEBUG`](#debug-option) option to generate a ZIP file containing files with information about the query and the database objects referenced in the query. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN ANALYZE (DEBUG) SELECT city, AVG(revenue) FROM rides GROUP BY city;
~~~

~~~
                                       info
-----------------------------------------------------------------------------------
  Statement diagnostics bundle generated. Download using the SQL shell or command
  line.
  SQL shell: \statement-diag download 938793171367755777
  Command line: cockroach statement-diag download 938793171367755777
(4 rows)
~~~

To download the ZIP file containing the statement diagnostics, run the `\statement-diag download` or `cockroach statement-diag download` commands. You can also obtain the bundle by activating [statement diagnostics]({% link {{ page.version.version }}/ui-statements-page.md %}#diagnostics) in the DB Console.

### `EXPLAIN ANALYZE (REDACT)`

Use the [`REDACT` option](#redact-option) to execute a query and cause constants, literal values, parameter values, and personally identifiable information (PII) to be redacted as `‹×›` in the physical statement plan or statement bundle.

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN ANALYZE (REDACT) SELECT * FROM rides WHERE revenue > 90 ORDER BY revenue ASC;
~~~

~~~
                                         info
--------------------------------------------------------------------------------------
  planning time: 390µs
  execution time: 20ms
  distribution: full
  vectorized: true
  plan type: custom
  rows decoded from KV: 500 (87 KiB, 1 gRPC calls)
  cumulative time spent in KV: 18ms
  maximum memory usage: 290 KiB
  network usage: 0 B (0 messages)
  regions: us-east1
  kv cpu time: 2ms
  sql cpu time: 2ms
  estimated RUs consumed: 0
  isolation level: serializable
  priority: normal
  quality of service: regular

  • sort
  │ sql nodes: n1
  │ regions: us-east1
  │ actual row count: 58
  │ estimated max memory allocated: 40 KiB
  │ estimated max sql temp disk usage: 0 B
  │ sql cpu time: 827µs
  │ estimated row count: 50
  │ order: +revenue
  │
  └── • filter
      │ sql nodes: n1
      │ regions: us-east1
      │ actual row count: 58
      │ sql cpu time: 373µs
      │ estimated row count: 50
      │ filter: revenue > ‹×›
      │
      └── • scan
            sql nodes: n1
            kv nodes: n1
            regions: us-east1
            actual row count: 500
            KV time: 18ms
            KV contention time: 0µs
            KV rows decoded: 500
            KV bytes read: 87 KiB
            KV gRPC calls: 1
            estimated max memory allocated: 250 KiB
            sql cpu time: 631µs
            estimated row count: 500 (100% of the table; stats collected 4 days ago)
            table: rides@rides_pkey
            spans: FULL SCAN
(49 rows)
~~~

In the preceding output, the `revenue` comparison value is redacted as `‹×›`.

## See also

- [`ALTER TABLE`]({% link {{ page.version.version }}/alter-table.md %})
- [`ALTER SEQUENCE`]({% link {{ page.version.version }}/alter-sequence.md %})
- [`BACKUP`]({% link {{ page.version.version }}/backup.md %})
- [`CANCEL JOB`]({% link {{ page.version.version }}/cancel-job.md %})
- [`CREATE DATABASE`]({% link {{ page.version.version }}/create-database.md %})
- [`DROP DATABASE`]({% link {{ page.version.version }}/drop-database.md %})
- [`EXPLAIN`]({% link {{ page.version.version }}/explain.md %})
- [`EXECUTE`]({% link {{ page.version.version }}/sql-grammar.md %}#execute_stmt)
- [Indexes]({% link {{ page.version.version }}/indexes.md %})
- [`INSERT`]({% link {{ page.version.version }}/insert.md %})
- [`PAUSE JOB`]({% link {{ page.version.version }}/pause-job.md %})
- [`RESET`]({% link {{ page.version.version }}/reset-vars.md %})
- [`RESTORE`]({% link {{ page.version.version }}/restore.md %})
- [`RESUME JOB`]({% link {{ page.version.version }}/resume-job.md %})
- [`SELECT`]({% link {{ page.version.version }}/select-clause.md %})
- [Selection Queries]({% link {{ page.version.version }}/selection-queries.md %})
- [`SET`]({% link {{ page.version.version }}/set-vars.md %})
- [`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %})
- [`SHOW COLUMNS`]({% link {{ page.version.version }}/show-columns.md %})
- [`UPDATE`]({% link {{ page.version.version }}/update.md %})
- [`UPSERT`]({% link {{ page.version.version }}/upsert.md %})
