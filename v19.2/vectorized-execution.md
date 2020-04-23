---
title: Vectorized Query Execution
summary: The CockroachDB vectorized SQL query execution engine processes query plans using a column-oriented model to improve performance.
toc: true
---

<span class="version-tag">New in v19.2:</span> CockroachDB supports [column-oriented](https://en.wikipedia.org/wiki/Column-oriented_DBMS#Column-oriented_systems) ("vectorized") query execution.

Many SQL databases execute [query plans](https://en.wikipedia.org/wiki/Query_plan) one row of table data at a time. Row-oriented execution models can offer good performance for [online transaction processing (OLTP)](https://en.wikipedia.org/wiki/Online_transaction_processing) queries, but suboptimal performance for [online analytical processing (OLAP)](https://en.wikipedia.org/wiki/Online_analytical_processing) queries. The CockroachDB vectorized execution engine dramatically improves performance over [row-oriented execution](https://en.wikipedia.org/wiki/Column-oriented_DBMS#Row-oriented_systems) by processing each component of a query plan on type-specific batches of column data.

{{site.data.alerts.callout_info}}
CockroachDB does not support vectorized execution for all data types. For details, see [supported data types](#supported-data-types).
{{site.data.alerts.end}}

## Configuring vectorized execution

By default, vectorized execution is enabled in CockroachDB for [all queries that are guaranteed to execute in memory](#memory-intensive-operations), on tables with [supported data types](#supported-data-types).

You can turn vectorized execution on or off for all queries in the current session with the `vectorize` [session variable](set-vars.html). The following options are supported:

Option | Description
----------|------------
`auto` | Instructs CockroachDB to use the vectorized execution engine on most queries that execute in memory, without the need to spill intermediate results to disk. See [Memory-intensive operations](#memory-intensive-operations) for more information.<br><br>**Default:** `vectorize=auto`
`experimental_on` | Turns on vectorized execution for all supported queries. We do not recommend using this option in production environments, as it can lead to memory issues.<br/>See [Known limitations](#known-limitations) for more information.
`off` | Turns off vectorized execution for all queries.

For information about setting session variables, see [`SET` &lt;session variable&gt;](set-vars.html).

{{site.data.alerts.callout_success}}
CockroachDB supports vectorized execution on columns with [supported data types](#supported-data-types) only. Setting the `vectorize` session variable to `experimental_on` does not turn vectorized execution on for queries on columns with unsupported data types.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
To see if CockroachDB will use the vectorized execution engine for a query, run a simple [`EXPLAIN`](explain.html) statement on the query. If `vectorize` is `true`, the query will be executed with the vectorized engine. If it is `false`, the row-oriented execution engine is used instead.
{{site.data.alerts.end}}

### Setting the row threshold for vectorized execution

The efficiency of vectorized execution increases with the number of rows processed. If you are querying a table with a small number of rows, it is more efficient to use row-oriented execution.

By default, vectorized execution is enabled for queries on tables of 1000 rows or more. If the number of rows in a table falls below 1000, CockroachDB uses the row-oriented execution engine instead.

For performance tuning, you can change the minimum number of rows required to use the vectorized engine to execute a query plan in the current session with the `vectorize_row_count_threshold` [session variable](set-vars.html). This variable is ignored if `vectorize=experimental_on`.


## How vectorized execution works

When you issue a query, the gateway node (i.e., the node from which you issue the query) [parses the query and creates a physical plan](architecture/sql-layer.html#sql-parser-planner-executor) for execution on each node that receives the plan. If vectorized execution is enabled, the physical plan is sent to each node to be executed by the vectorized execution engine.

{{site.data.alerts.callout_success}}
To see a detailed view of the vectorized execution plan for a query, run the [`EXPLAIN(VEC)`](explain.html#vec-option) statement on the query.
{{site.data.alerts.end}}

For information about vectorized execution in the context of the CockroachDB architecture, see [Query Execution](architecture/sql-layer.html#query-execution).

For detailed examples of vectorized query execution for hash and merge joins, see the blog posts [40x faster hash joiner with vectorized execution](https://www.cockroachlabs.com/blog/vectorized-hash-joiner/) and [Vectorizing the merge joiner in CockroachDB](https://www.cockroachlabs.com/blog/vectorizing-the-merge-joiner-in-cockroachdb/).

## Known limitations

Vectorized execution is not as extensively tested as CockroachDB's existing row-oriented execution engine. In addition, some data types are not supported, and support for some operations is experimental.

### Supported data types

Vectorized execution is supported for the following [data types](data-types.html) and their aliases:

- [`BOOL`](bool.html)
- [`BYTES`](bytes.html)
- [`DATE`](date.html)
- [`FLOAT`](float.html)
- [`INT`](int.html)
- [`STRING`](string.html)
- [`TIMESTAMP`](timestamp.html)
- [`UUID`](uuid.html)

{{site.data.alerts.callout_info}}
CockroachDB uses the vectorized engine to execute queries on columns with supported data types, even if a column's parent table includes unused columns with unsupported data types.
{{site.data.alerts.end}}

### Queries with constant `NULL` arguments

The vectorized execution engine does not support queries that contain constant `NULL` arguments, with the exception of the `IS` projection operators `IS NULL` and `IS NOT NULL`.

For example, `SELECT x IS NOT NULL FROM t` is supported, but `SELECT x + NULL FROM t` returns an `unable to vectorize execution plan` error.

For more information, see the [tracking issue](https://github.com/cockroachdb/cockroach/issues/41001).

### Memory-intensive operations

Support for vectorized execution is experimental for the following memory-intensive operations:

{% include {{page.version.version}}/sql/disk-spilling-ops.md %}

We do not recommend using vectorized execution in production environments for memory-intensive queries that cannot spill to disk. Executing these queries with the vectorized execution engine (i.e., with the `vectorize` [session variable](set-vars.html) set to `experimental_on`) can cause CockroachDB nodes to run out of memory and crash.

## See also

- [SQL Layer](architecture/sql-layer.html)
- [`SET` &lt;session variable&gt;](set-vars.html)
- [`SHOW` &lt;session variable&gt;](show-vars.html)
