---
title: Vectorized Query Execution
summary: The CockroachDB vectorized SQL query execution engine processes query plans using a column-oriented model to improve performance.
toc: true
docs_area: develop
---

CockroachDB supports [column-oriented](https://en.wikipedia.org/wiki/Column-oriented_DBMS#Column-oriented_systems) ("vectorized") query execution on all [CockroachDB data types](data-types.html).

Many SQL databases execute [query plans](https://en.wikipedia.org/wiki/Query_plan) one row of table data at a time. Row-oriented execution models can offer good performance for [online transaction processing (OLTP)](https://en.wikipedia.org/wiki/Online_transaction_processing) queries, but suboptimal performance for [online analytical processing (OLAP)](https://en.wikipedia.org/wiki/Online_analytical_processing) queries. The CockroachDB vectorized execution engine dramatically improves performance over [row-oriented execution](https://en.wikipedia.org/wiki/Column-oriented_DBMS#Row-oriented_systems) by processing each component of a query plan on type-specific batches of column data.

## Configure vectorized execution

By default, vectorized execution is enabled in CockroachDB.

You can configure vectorized execution with the `vectorize` [session variable](set-vars.html). The following options are supported:

Option    | Description
----------|------------
`on`   | Turns on vectorized execution for all queries.<br><br>**Default:** `vectorize=on`
`off`  | Turns off vectorized execution for all queries.

For information about setting session variables, see [`SET` &lt;session variable&gt;](set-vars.html).

{{site.data.alerts.callout_success}}
To see if CockroachDB will use the vectorized execution engine for a query, run a simple [`EXPLAIN`](explain.html) statement on the query. If `vectorize` is `true`, the query will be executed with the vectorized engine. If it is `false`, the row-oriented execution engine is used instead.
{{site.data.alerts.end}}

## How vectorized execution works

When you issue a query, the gateway node (i.e., the node from which you issue the query) [parses the query and creates a physical plan](architecture/sql-layer.html#sql-parser-planner-executor) for execution on each node that receives the plan. If vectorized execution is enabled, the physical plan is sent to each node to be executed by the vectorized execution engine.

To see a detailed view of the vectorized execution plan for a query, run the [`EXPLAIN(VEC)`](explain.html#vec-option) statement on the query.

For information about vectorized execution in the context of the CockroachDB architecture, see [Query Execution](architecture/sql-layer.html#query-execution).

For detailed examples of vectorized query execution for hash and merge joins, see the blog posts [40x faster hash joiner with vectorized execution](https://www.cockroachlabs.com/blog/vectorized-hash-joiner/) and [Vectorizing the merge joiner in CockroachDB](https://www.cockroachlabs.com/blog/vectorizing-the-merge-joiner-in-cockroachdb/).

## Disk-spilling operations

The following disk-spilling operations require [memory buffering](https://en.wikipedia.org/wiki/Data_buffer) during execution. If there is not enough memory allocated for a disk-spilling operation, CockroachDB will spill the intermediate execution results to disk.

- Global [sorts](order-by.html)
- [Unordered aggregations](order-by.html)
- [Hash joins](joins.html#hash-joins)
- [Merge joins](joins.html#merge-joins) on non-unique columns. Merge joins on columns that are guaranteed to have one row per value, also known as "key columns", can execute entirely in-memory.
- [Window functions](window-functions.html).

By default, the memory limit allocated per disk-spilling operation is `64MiB`. This limit applies to a single operation within a single query, and is configured with the `sql.distsql.temp_storage.workmem` [cluster setting](cluster-settings.html).

To increase the limit, change the cluster setting:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.distsql.temp_storage.workmem = '100MiB';
~~~

{{site.data.alerts.callout_info}}
Operations that do not support disk spilling ignore the `sql.distsql.temp_storage.workmem` limit.
{{site.data.alerts.end}}

The [`--max-disk-temp-storage` flag](cockroach-start.html#general) sets the maximum on-disk storage capacity for disk spilling. If the maximum on-disk storage capacity is reached, the query will return an error during execution.

You can also configure a node's total budget for in-memory query processing with the [`--max-sql-memory` flag](cockroach-start.html#general) at node startup. This limit applies globally to all sessions at any point in time. When this limit is exceeded by an operation, it will result in an error instead of spilling to disk. For more details on `--max-sql-memory`, see [Cache and SQL memory size](recommended-production-settings.html#cache-and-sql-memory-size).

## Known limitations

### Unsupported queries

The vectorized engine does not support queries containing:

- A join filtered with an [`ON` expression](joins.html#supported-join-conditions). See [tracking issue](https://github.com/cockroachdb/cockroach/issues/38018).

### Spatial features

The vectorized engine does not support [working with spatial data](spatial-data.html). Queries with [geospatial functions](functions-and-operators.html#spatial-functions) or [spatial data](spatial-data.html) will revert to the row-oriented execution engine.

### Unordered distinct operations

{% include {{ page.version.version }}/known-limitations/unordered-distinct-operations.md %}

## See also

- [SQL Layer](architecture/sql-layer.html)
- [`SET` &lt;session variable&gt;](set-vars.html)
- [`SHOW` &lt;session variable&gt;](show-vars.html)
