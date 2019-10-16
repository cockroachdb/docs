---
title: Vectorized Query Execution
summary: The CockroachDB vectorized SQL query execution engine processes query plans using a column-oriented model to improve performance.
toc: true
---

 <span class="version-tag">New in v19.2:</span> CockroachDB supports [column-oriented](https://en.wikipedia.org/wiki/Column-oriented_DBMS#Column-oriented_systems) ("vectorized") query execution on all [streaming SQL operations](#non-streaming-operations).

 Many SQL databases execute [query plans](https://en.wikipedia.org/wiki/Query_plan) one row of table data at a time. Row-oriented execution models can offer good performance for [online transaction processing (OLTP)](https://en.wikipedia.org/wiki/Online_transaction_processing) queries, but suboptimal performance for [online analytical processing (OLAP)](https://en.wikipedia.org/wiki/Online_analytical_processing) queries. The CockroachDB vectorized execution engine dramatically improves performance over [row-oriented execution](https://en.wikipedia.org/wiki/Column-oriented_DBMS#Row-oriented_systems) by processing each component of a query plan on type-specific batches of column data.

## Configuring vectorized execution

By default, vectorized execution is enabled in CockroachDB for all [streaming operations](#non-streaming-operations) on tables with [supported data types](#supported-data-types).

You can turn vectorized execution on for non-streaming operations, or off for all operations, with the `sql.defaults.vectorize` [cluster setting](cluster-settings.html) or the `vectorize` [session variable](set-vars.html). The following options are supported for both the cluster setting and session variable:

Option | Description
----------|------------
`auto` | Instructs CockroachDB to use the vectorized execution engine on streaming operations.<br><br>**Default:** `vectorize=auto`
`experimental_on` | Turns on vectorized execution for non-streaming operations. We do not recommend using this setting in production environments, as it can lead to memory issues.<br/>See [Known Limitations](vectorized-execution.html#known-limitations) for more information.
`off` | Turns off vectorized execution for all operations.

For more information about configuring cluster settings, see [Cluster Settings](cluster-settings.html).<br>For more information about setting session variables, see [`SET` &lt;session variable&gt;](set-vars.html).

You can see if CockroachDB will use the vectorized execution engine for a query by running a simple [`EXPLAIN`](explain.html) statement on the query.

### Setting the row threshold for vectorized execution

The efficiency of vectorized execution increases with the number of rows processed. If you are querying a table with a small number of rows, it is more efficient to use row-oriented execution.

By default, vectorized execution is enabled for queries on tables of 1000 rows or more. If the number of rows in a table falls below 1000, CockroachDB uses the row-oriented execution engine instead.

For performance tuning, you can change the minimum number of rows required to use the vectorized engine to execute a query plan with the `vectorize_row_count_threshold` [cluster setting](cluster-settings.html). This setting is ignored if `vectorize=experimental_on`.


## How vectorized execution works

When you issue a query, the gateway node (i.e. the node from which you issue the query) [parses the query and creates a physical plan](architecture/sql-layer.html#sql-parser-planner-executor) for execution on each node that receives the plan. If vectorized execution is enabled, the physical plan is sent to each node to be executed by the vectorized execution engine. To see a detailed view of the vectorized execution plan for a query, you can use the [`EXPLAIN(VEC)`](explain.html#vec-option) statement. For information about vectorized execution in the context of the CockroachDB architecture, see [Query Execution](architecture/sql-layer.html#query-execution).

For detailed examples of vectorized query execution for hash and merge joins, see the blog posts [40x faster hash joiner with vectorized execution](https://www.cockroachlabs.com/blog/vectorized-hash-joiner/) and [Vectorizing the merge joiner in CockroachDB](https://www.cockroachlabs.com/blog/vectorizing-the-merge-joiner-in-cockroachdb/).

## Known Limitations

Vectorized execution is not as extensively tested as CockroachDB's existing row-oriented execution engine. In addition, some data types are not supported, and support for some operations is experimental.

### Supported data types

Vectorized execution is supported for the following [data types](data-types.html):

- [`BOOL`](bool.html)
- [`BYTES`](bytes.html)
- [`FLOAT`](float.html)
- [`INT`](int.html)
- [`STRING`](string.html)

In all [`vectorize` modes](#configuring-vectorized-execution), queries on tables that contain unsupported data types are executed with the row-oriented execution engine. Using [`EXPLAIN(VEC)`](explain.html#vec-option) on queries of tables that include unsupported data types will return an unhandled data type error.

### Non-streaming operations

By default, vectorized execution is enabled for all operations that do not require [memory buffering](https://en.wikipedia.org/wiki/Data_buffer) (i.e. "streaming" operations). There is a risk that queries that perform large joins or other memory-intensive operations could cause the executing node to run out of memory and crash. As such, support for vectorized execution is experimental for the following non-streaming operations:

- Global [sorts](query-order.html).
- [Window functions](window-functions.html).
- [Hash joins](joins.html#hash-joins).
- [Merge joins](joins.html#merge-joins) on non-unique columns. Merge joins on columns that are guaranteed to have one row per value, also known as "key columns", are considered streaming operations.

We do not recommend using vectorized execution for non-streaming operations in production environments, as these operations can buffer an unlimited number of rows before they can start producing output.

## See also

- [SQL Layer](architecture/sql-layer.html)
- [Cluster Settings](cluster-settings.html)
- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`SHOW CLUSTER SETTING`](show-cluster-setting.html)
- [`SET` &lt;session variable&gt;](set-vars.html)
- [`SHOW` &lt;session variable&gt;](show-vars.html)
