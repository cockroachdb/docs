---
title: EXPLAIN ANALYZE
summary: The EXPLAIN ANALYZE statement executes a query and generates a physical query plan with execution statistics.
toc: true
---

The `EXPLAIN ANALYZE` [statement](sql-statements.html) **executes a SQL query** and generates a URL for a physical query plan with execution statistics, or a URL to download a bundle with more details about the query plan. Query plans provide information around SQL execution, which can be used to troubleshoot slow queries by figuring out where time is being spent, how long a processor (i.e., a component that takes streams of input rows and processes them according to a specification) is not doing work, etc. For more information about distributed SQL queries, see the [DistSQL section of our SQL Layer Architecture docs](architecture/sql-layer.html#distsql).

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/sql/physical-plan-url.md %}
{{site.data.alerts.end}}

## Aliases

In CockroachDB, the following are aliases for `EXPLAIN ANALYZE`:

- `EXPLAIN ANALYSE`

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/explain_analyze.html %}</section>

## Parameters

Parameter          | Description
-------------------|-----------
`DISTSQL`          | _(Default)_ Generate a link to a distributed SQL physical query plan tree. For more information, see [Default option](#default-option).
`DEBUG`            | <span class="version-tag">New in v20.1:</span> Generate a ZIP file containing files with detailed information about the query and the database objects referenced in the query. For more information, see [`DEBUG` option](#debug-option).
`preparable_stmt`  | The [statement](sql-grammar.html#preparable_stmt) you want to execute and analyze. All preparable statements are explainable.

## Required privileges

The user requires the appropriate [privileges](authorization.html#assign-privileges) for the statement being explained.

## Success responses

Successful `EXPLAIN ANALYZE` (and `EXPLAIN ANALYZE (DISTSQL)`) statements return a table with the following columns:

 Column | Description
--------|------------
**automatic** | If `true`, the query is distributed. For more information about distributed SQL queries, see the [DistSQL section of our SQL Layer Architecture docs](architecture/sql-layer.html#distsql).
**url** | The URL generated for a physical query plan that provides high level information about how a query will be executed. For details about reading the physical query plan, see [DistSQL Plan Viewer](#distsql-plan-viewer).<br><br>{% include {{ page.version.version }}/sql/physical-plan-url.md %}

If you use the [`DEBUG` option](#debug-option), the statement will return a single `text` column with a URL and instructions to download the `DEBUG` bundle, which includes the physical query plan.

## Default option

By default, `EXPLAIN ANALYZE` uses the `DISTQL` option, which generates a physical query plan diagram in the [DistSQL Plan Viewer](#distsql-plan-viewer). `EXPLAIN ANALYZE` and `EXPLAIN ANALYZE (DISTSQL)` produce the same output.

### DistSQL Plan Viewer

The DistSQL Plan Viewer displays the physical query plan, as well as execution statistics:

Field | Description
------+------------
&lt;ProcessorName&gt;/&lt;n&gt; | The processor and processor ID used to read data into the SQL execution engine.<br><br>A processor is a component that takes streams of input rows, processes them according to a specification, and outputs one stream of rows. For example, an "aggregator" aggregates input rows.
&lt;table&gt;@&lt;index&gt; | The index used.
Out | The output columns.
@&lt;n&gt; | The index of the column relative to the input.
Render | The stage that renders the output.
unordered / ordered | _(Blue box)_ A synchronizer that takes one or more output streams and merges them to be consumable by a processor. An ordered synchronizer is used to merge ordered streams and keeps the rows in sorted order.
&lt;data type&gt; | <span class="version-tag">New in v20.1:</span> If [`EXPLAIN(DISTSQL, TYPES)`](explain.html#distsql-option) is specified, lists the data types of the input columns.
left(@&lt;n&gt;)=right(@&lt;n&gt;) | The equality columns used in the join.
rows read | The number of rows read by the processor.
stall time | How long the processor spent not doing work. This is aggregated into the stall time numbers as the query progresses down the tree (i.e., stall time is added up and overlaps with previous time).
stored side | The smaller table that was stored as an in-memory hash table.
max memory used | How much memory (if any) is used to buffer rows.
by hash | _(Orange box)_ The router, which is a component that takes one stream of input rows and sends them to a node according to a routing algorithm.<br><br>For example, a hash router hashes columns of a row and sends the results to the node that is aggregating the result rows.
max disk used | How much disk (if any) is used to buffer rows. Routers and processors will spill to disk buffering if there is not enough memory to buffer the rows.
rows routed | How many rows were sent by routers, which can be used to understand network usage.
bytes sent | The number of actual bytes sent (i.e., encoding of the rows). This is only relevant when doing network communication.
Response | The response back to the client.

{{site.data.alerts.callout_info}}
Any or all of the above fields may display for a given query plan.
{{site.data.alerts.end}}

## `DEBUG` option

<span class="version-tag">New in v20.1:</span> `EXPLAIN ANALYZE (DEBUG)` executes a query and generates a link to a ZIP file that contains the [physical query plan](#distsql-plan-viewer), execution statistics, statement tracing, and other information about the query.

        File        | Description
--------------------+-------------------
`stats-<table>.sql` | Contains [statistics](create-statistics.html) for a table in the query.
`schema.sql`        | Contains [`CREATE`](create-table.html) statements for objects in the query.
`env.sql`           | Contains information about the CockroachDB environment.
`trace.json`        | Contains [statement traces](show-trace.html).
`trace-jaeger.json` | Contains [statement traces](show-trace.html) in JSON format that can be [imported to Jaeger](query-behavior-troubleshooting.html#visualize-statement-traces-in-jaeger).
`distsql.html`      | The query's [physical query plan](#distsql-plan-viewer). This diagram is identical to the one generated by [`EXPLAIN(DISTSQL)`](explain.html#distsql-option)
`plan.txt`          | The query execution plan. This is identical to the output of [`EXPLAIN (VERBOSE)`](explain.html#verbose-option).
`opt-vv.txt`        | The query plan tree generated by the [cost-based optimizer](cost-based-optimizer.html), with cost details and input column data types. This is identical to the output of [`EXPLAIN (OPT, TYPES)`](explain.html#opt-option).
`opt-v.txt`         | The query plan tree generated by the [cost-based optimizer](cost-based-optimizer.html), with cost details. This is identical to the output of [`EXPLAIN (OPT, VERBOSE)`](explain.html#opt-option).
`opt.txt`           | The query plan tree generated by the [cost-based optimizer](cost-based-optimizer.html). This is identical to the output of [`EXPLAIN (OPT)`](explain.html#opt-option).
`statement.txt`     | The SQL statement for the query.

You can obtain this ZIP file by following the link provided in the `EXPLAIN ANALYZE (DEBUG)` output, or by activating [statement diagnostics](admin-ui-statements-page.html#diagnostics) in the Admin UI.

## Examples

### `EXPLAIN ANALYZE`

Use `EXPLAIN ANALYZE` without an option, or equivalently with the `DISTSQL` option, to execute a query and generate a link to a physical query plan with execution statistics.

For example, the following `EXPLAIN ANALYZE` statement executes a simple query against the [TPC-H database](http://www.tpc.org/tpch/) loaded to a 3-node CockroachDB cluster, and then generates a link to a physical query plan with execution statistics:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN ANALYZE SELECT l_shipmode, AVG(l_extendedprice) FROM lineitem GROUP BY l_shipmode;
~~~

~~~
  automatic |                      url                      
------------+-----------------------------------------------
    true    | https://cockroachdb.github.io/distsqlplan...
~~~

To view the [DistSQL Plan Viewer](#distsql-plan-viewer), point your browser to the URL provided:

<img src="{{ 'images/v20.1/explain-analyze-distsql-plan.png' | relative_url }}" alt="EXPLAIN ANALYZE (DISTSQL)" style="border:1px solid #eee;max-width:100%" />


### `EXPLAIN ANALYZE (DEBUG)`

Use the [`DEBUG`](#debug-option) option to generate a ZIP file containing files with information about the query and the database objects referenced in the query. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN ANALYZE (DEBUG) SELECT l_shipmode, AVG(l_extendedprice) FROM lineitem GROUP BY l_shipmode;
~~~

~~~
                                      text
--------------------------------------------------------------------------------
  Statement diagnostics bundle generated. Download from the Admin UI (Advanced
  Debug -> Statement Diagnostics History) or use the direct link below.
  Admin UI: http://127.0.0.1:12345
  Direct link: http://127.0.0.1:12345/_admin/v1/stmtbundle/...
~~~

Navigating to the URL will automatically download the ZIP file. You can also obtain the bundle by activating [statement diagnostics](admin-ui-statements-page.html#diagnostics) in the Admin UI.

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
