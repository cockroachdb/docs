---
title: Vectorized Query Execution
summary: The CockroachDB vectorized SQL query execution engine processes query plans using a column-oriented model to improve performance.
toc: true
---

 <span class="version-tag">New in v19.2:</span> CockroachDB supports column-oriented ("vectorized") query execution on all [supported SQL operations](https://www.cockroachlabs.com/docs/stable/sql-feature-support.html).

 Many SQL databases, including MySQL, PostgreSQL, and all versions of CockroachDB released prior to 19.2, execute [query plans](https://en.wikipedia.org/wiki/Query_plan) one row of table data at a time. The CockroachDB vectorized execution engine dramatically improves performance over row-oriented execution by processing each component of a query plan on type-specific batches of column data. Column-oriented execution models contrast with row-oriented execution models, which can offer good performance for [online transaction processing (OLTP)](https://en.wikipedia.org/wiki/Online_transaction_processing) queries, but suboptimal performance for [online analytical processing (OLAP)](https://en.wikipedia.org/wiki/Online_analytical_processing) queries.


## Configuring vectorized execution

By default, vectorized execution is enabled in CockroachDB for all supported "streaming" SQL operations (i.e. operations that do not require [memory buffering](https://en.wikipedia.org/wiki/Data_buffer)). Non-streaming operations include global [sorts](query-order.html), [window functions](window-functions.html), [hash joins](joins.html#hash-joins), and [merge joins](joins.html#merge-joins) on non-unique columns. Merge joins on columns that are guaranteed to have one row per value, also known as "key columns", are considered streaming operations.

You can turn vectorized execution on or off for all operations with the `sql.defaults.vectorize` [cluster setting](cluster-settings.html) or the `vectorize` [session variable](set-vars.html). The following options are supported for both the cluster setting and session variable:

Option | Description
----------|------------
`auto` | Instructs CockroachDB to use the column-oriented vectorized SQL execution engine on streaming operations. By default, `vectorize=auto`.
`experimental_on` | Turns vectorization on for all supported operations. We do not recommend using this setting in production environments, as it can lead to memory issues. See [Known Limitations](vectorized-execution.html#known-limitations) for more information.
`off` | Turns vectorization off for all operations.

You can verify whether will use the execution engine or not with the [`EXPLAIN`](explain.html) statement.

For more information about configuring cluster settings, see [Cluster Settings](cluster-settings.html). For more information about setting session variables, see [`SET` &lt;session variable&gt;](set-vars.html).

### Setting the row threshold for vectorized execution

The efficiency of column-oriented execution increases with the number of rows processed. If you are querying a table with a small number of rows, it is currently more efficient to use row-oriented execution.

With `vectorize=auto`, the `vectorize_row_count_threshold` [cluster setting](cluster-settings.html) specifies the minimum number of rows required to use the vectorized engine to execute a query plan. If the number of rows being processed falls below the row count threshold, CockroachDB uses the row-oriented execution engine instead. By default, `vectorize_row_count_threshold=1000`.

## How vectorized execution works

When you issue a SQL query in CockroachDB, the gateway node (i.e. the node from which you issue the query) [parses the query and creates a physical plan](architecture/sql-layer.html#sql-parser-planner-executor) for execution on each node. If vectorized execution is enabled, the physical plan is sent to each node, to be processed by the vectorized execution engine.

Upon receiving [the physical plan](explain-analyze.html#distsql-plan-viewer), the vectorized engine reads batches of table data [from disk](architecture/storage-layer.html) and converts the data from row format to columnar format. These batches of column data are stored in-memory so that the engine can access them quickly during execution.

To limit the complexity of query execution, the engine uses specialized, precompiled functions that quickly iterate over the type-specific arrays of column data. The columnar output from the functions is stored in memory as the engine processes each column of data. After processing all columns of data in the input buffer, the engine converts the columnar output back to row format, and then returns the processed rows to the SQL interface. After a batch of table data has been fully processed, the engine reads the following batch of table data for processing, until the query has been executed.

To see a detailed view of the vectorized execution plan for a query, you can use the [`EXPLAIN(VEC)`](explain.html#vec-option) statement. For detailed examples of vectorized query execution for hash and merge joins, see the blog posts [40x faster hash joiner with vectorized execution](https://www.cockroachlabs.com/blog/vectorized-hash-joiner/) and [Vectorizing the merge joiner in CockroachDB](https://www.cockroachlabs.com/blog/vectorizing-the-merge-joiner-in-cockroachdb/).

## Known Limitations

The vectorized execution engine has the following limitations:

- It is not as extensively tested as CockroachDB's existing row-oriented execution engine.
- There is a risk that queries that perform large joins or other memory-intensive operations could cause the node to run out of memory and crash. As such, vectorized execution is experimental for non-streaming operations, including global sorts, hash joins, merge joins on non-unique columns, and window functions. We do not recommend using vectorized execution for non-streaming operations in production environments, as these operations can buffer an unlimited number of rows before they can start producing output.

## See also

- [SQL Layer](architecture/sql-layer.html)
- [Cluster Settings](cluster-settings.html)
- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`SHOW CLUSTER SETTING`](show-cluster-setting.html)
- [`SET` &lt;session variable&gt;](set-vars.html)
- [`SHOW` &lt;session variable&gt;](show-vars.html)
