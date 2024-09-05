---
title: SQL Layer
summary: The SQL layer of CockroachDB's architecture exposes its SQL API to developers and converts SQL statements into key-value operations.
toc: true
docs_area: reference.architecture 
---

The SQL layer of CockroachDB's architecture exposes a SQL API to developers and converts high-level [SQL statements]({% link {{ page.version.version }}/sql-statements.md %}) into low-level read and write requests to the underlying key-value store, which are passed to the [transaction Layer]({% link {{ page.version.version }}/architecture/transaction-layer.md %}).

It consists of the following sublayers:

- [SQL API](#sql-api), which forms the user interface.
- [Parser](#parsing), which converts SQL text into an abstract syntax tree (AST).
- [Cost-based optimizer](#logical-planning), which converts the AST into an optimized logical query plan.
- [Physical planner](#physical-planning), which converts the logical query plan into a physical query plan for execution by one or more nodes in the cluster.
- [SQL execution engine](#query-execution), which executes the physical plan by making read and write requests to the underlying key-value store.

{{site.data.alerts.callout_info}}
If you haven't already, we recommend reading the [Architecture Overview]({% link {{ page.version.version }}/architecture/overview.md %}).
{{site.data.alerts.end}}

## Overview

Once CockroachDB has been [deployed]({% link cockroachcloud/quickstart.md %}), developers need only a [connection string]({% link {{ page.version.version }}/connection-parameters.md %}) to the cluster, and they can start working with SQL statements.

<a name="gateway-node"></a>

Because each node in a CockroachDB cluster behaves symmetrically, developers can send requests to any node (which means CockroachDB works well with load balancers). Whichever node receives the request acts as the "gateway node," which processes the request and responds to the client.

Requests to the cluster arrive as SQL statements, but data is ultimately written to and read from the [storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}) as key-value (KV) pairs. To handle this, the SQL layer converts SQL statements into a plan of KV operations, which it then passes along to the [transaction layer]({% link {{ page.version.version }}/architecture/transaction-layer.md %}).

### Interactions with other layers

In relationship to other layers in CockroachDB, the SQL layer:

- Receives requests from the outside world via its [SQL API](#sql-api).
- Converts SQL statements into low-level KV operations, which it sends as requests to the [transaction layer]({% link {{ page.version.version }}/architecture/transaction-layer.md %}).

## Components

### Relational structure

Developers experience data stored in CockroachDB as a relational structure comprised of rows and columns. Sets of rows and columns are further organized into [tables]({% link {{ page.version.version }}/show-tables.md %}). Collections of tables are then organized into [databases]({% link {{ page.version.version }}/show-databases.md %}). A CockroachDB cluster can contain many databases.

CockroachDB provides typical relational features like [constraints]({% link {{ page.version.version }}/constraints.md %}) (e.g., [foreign keys]({% link {{ page.version.version }}/foreign-key.md %})). These features mean that application developers can trust that the database will ensure consistent structuring of the application's data; data validation doesn't need to be built into the application logic separately.

### SQL API

CockroachDB implements most of the ANSI SQL standard to manifest its relational structure. For a complete list of the SQL features CockroachDB supports, see [SQL Feature Support]({% link {{ page.version.version }}/sql-feature-support.md %}).

Importantly, through the SQL API developers have access to ACID-semantic [transactions]({% link {{ page.version.version }}/transactions.md %}) like they would through any SQL database (using [`BEGIN`]({% link {{ page.version.version }}/begin-transaction.md %}), [`COMMIT`]({% link {{ page.version.version }}/commit-transaction.md %}), etc.).

### PostgreSQL wire protocol

SQL queries reach your cluster through the PostgreSQL wire protocol. This makes connecting your application to the cluster simple by supporting many PostgreSQL-compatible [drivers and ORMs]({% link {{ page.version.version }}/install-client-drivers.md %}).

### SQL parser, planner, executor

When a node in a CockroachDB cluster receives a SQL request from a client, it [parses the statement](#parsing) and [creates an optimized logical query plan](#logical-planning) that is further translated into a [physical query plan](#physical-planning). Finally, it [executes the physical plan](#query-execution).

#### Parsing

SQL queries are parsed against our `yacc` file (which describes our supported syntax), and the SQL version of each query is converted into an [abstract syntax tree](https://wikipedia.org/wiki/Abstract_syntax_tree) (AST).

#### Logical planning

During the *logical planning* phase, the AST is transformed into a query plan in the following steps:

1. The AST is transformed into a high-level logical query plan. During this transformation, CockroachDB also performs [semantic analysis](https://wikipedia.org/wiki/Semantic_analysis_(compilers)), which includes operations like:
    - Checking whether the query is a valid statement in the SQL language.
    - Resolving names, such as the names of tables or variables to their values.
    - Eliminating unneeded intermediate computations, e.g., by replacing `0.6 + 0.4` with `1.0`. This is also known as [constant folding](https://wikipedia.org/wiki/Constant_folding).
    - Finalizing which data types to use for intermediate results, e.g., when a query contains one or more [subqueries]({% link {{ page.version.version }}/subqueries.md %}).

1. The logical plan is *simplified* using a series of transformations that are always valid. For example, `a BETWEEN b AND c` may be converted to `a >= b AND a <= c`.

1. The logical plan is *optimized* using a [search algorithm]({% link {{ page.version.version }}/cost-based-optimizer.md %}#how-is-cost-calculated) that evaluates many possible ways to execute a query and selects an execution plan with the least costs.

The result of the final step above is an optimized logical plan. To view the logical plan generated by the [cost-based optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}), use the [`EXPLAIN (OPT)`]({% link {{ page.version.version }}/explain.md %}) statement.

#### Physical planning

The physical planning phase decides which nodes will participate in
the execution of the query, based on range locality information. This
is where CockroachDB decides to distribute a query to perform some
computations close to where the data is stored.

More concretely, the physical planning phase transforms the optimized logical plan generated during [logical planning](#logical-planning) into a [directed acyclic graph](https://wikipedia.org/wiki/Directed_acyclic_graph) (DAG) of physical *SQL operators*. These operators can be viewed by running the [`EXPLAIN(DISTSQL)`]({% link {{ page.version.version }}/explain.md %}) statement.

Because the [distribution layer]({% link {{ page.version.version }}/architecture/distribution-layer.md %}) presents the abstraction of a single key space, the SQL layer can perform read and write operations for any range on any node. This allows the SQL operators to behave identically whether planned in gateway or distributed mode.

The decision about whether to distribute a query across multiple nodes is made by a heuristic that estimates the quantity of data that would need to be sent over the network. Queries that only need a small number of rows are executed on the gateway node. Other queries are distributed across multiple nodes.

For example, when a query is distributed, the physical planning phase splits the scan operations from the logical plan into multiple physical _TableReader_ operators, one for each node containing a range read by the scan. The remaining logical operations (which may perform filters, joins, and aggregations) are then scheduled on the same nodes as the TableReaders. This results in computations being performed as close to the physical data as possible.

#### Query execution

Components of the [physical plan](#physical-planning) are sent to one or more nodes for execution. On each node, CockroachDB spawns a *logical processor* to compute a part of the query. Logical processors inside or across nodes communicate with each other over a *logical flow* of data. The combined results of the query are sent back to the first node where the query was received, to be sent further to the SQL client.

Each processor uses an encoded form for the scalar values manipulated by the query. This is a binary form which is different from that used in SQL. So the values listed in the SQL query must be encoded, and the data communicated between logical processors, and read from disk, must be decoded before it is sent back to the SQL client.

#### Vectorized query execution

If [vectorized execution]({% link {{ page.version.version }}/vectorized-execution.md %}) is enabled, the physical plan is sent to nodes to be processed by the vectorized execution engine.

Upon receiving the physical plan, the vectorized engine reads batches of table data [from disk]({% link {{ page.version.version }}/architecture/storage-layer.md %}) and converts the data from row format to columnar format. These batches of column data are stored in memory so the engine can access them quickly during execution.

The vectorized engine uses specialized, precompiled functions that quickly iterate over the type-specific arrays of column data. The columnar output from the functions is stored in memory as the engine processes each column of data.

After processing all columns of data in the input buffer, the engine converts the columnar output back to row format, and then returns the processed rows to the SQL interface. After a batch of table data has been fully processed, the engine reads the following batch of table data for processing, until the query has been executed.

### Encoding

Though SQL queries are written in parsable strings, lower layers of CockroachDB deal primarily in bytes. This means at the SQL layer, in query execution, CockroachDB must convert row data from their SQL representation as strings into bytes, and convert bytes returned from lower layers into SQL data that can be passed back to the client.

It's also important––for indexed columns––that this byte encoding preserve the same sort order as the data type it represents. This is because of the way CockroachDB ultimately stores data in a sorted key-value map; storing bytes in the same order as the data it represents lets us efficiently scan KV data.

However, for non-indexed columns (e.g., non-`PRIMARY KEY` columns), CockroachDB instead uses an encoding (known as "value encoding") which consumes less space but does not preserve ordering.

You can find more exhaustive detail in the [Encoding Tech Note](https://github.com/cockroachdb/cockroach/blob/master/docs/tech-notes/encoding.md).

### DistSQL

Because CockroachDB is a distributed database, we've developed a Distributed SQL (DistSQL) optimization tool for some queries, which can dramatically speed up queries that involve many ranges. Though DistSQL's architecture is worthy of its own documentation, this cursory explanation can provide some insight into how it works.

In non-distributed queries, the coordinating node receives all of the rows that match its query, and then performs any computations on the entire data set.

However, for DistSQL-compatible queries, each node does computations on the rows it contains, and then sends the results (instead of the entire rows) to the coordinating node. The coordinating node then aggregates the results from each node, and finally returns a single response to the client.

This dramatically reduces the amount of data brought to the coordinating node, and leverages the well-proven concept of parallel computing, ultimately reducing the time it takes for complex queries to complete. In addition, this processes data on the node that already stores it, which lets CockroachDB handle row-sets that are larger than an individual node's storage.

To run SQL statements in a distributed fashion, we introduce a couple of concepts:

- **Logical plan**: Similar to the AST/`planNode` tree described above, it represents the abstract (non-distributed) data flow through computation stages.
- **Physical plan**: A physical plan is conceptually a mapping of the logical plan nodes to physical machines running `cockroach`. Logical plan nodes are replicated and specialized depending on the cluster topology. Like `planNodes` above, these components of the physical plan are scheduled and run on the cluster.

You can find much greater detail in the [DistSQL RFC](https://github.com/cockroachdb/cockroach/blob/master/docs/RFCS/20160421_distributed_sql.md).

## Schema changes

CockroachDB performs schema changes, such as the [addition of columns]({% link {{ page.version.version }}/alter-table.md %}#add-column) or [secondary indexes]({% link {{ page.version.version }}/create-index.md %}), using a protocol that allows tables to remain online (i.e., able to serve reads and writes) during the schema change. This protocol allows different nodes in the cluster to asynchronously transition to a new table schema at different times.

The schema change protocol decomposes each schema change into a sequence of incremental changes that will achieve the desired effect.

For example, the addition of a secondary index requires two intermediate schema versions between the start and end versions to ensure that the index is being updated on writes across the entire cluster before it becomes available for reads. To ensure that the database will remain in a consistent state throughout the schema change, we enforce the invariant that there are at most two successive versions of this schema used in the cluster at all times.

This approach is based on the paper [_Online, Asynchronous Schema Change in F1_](https://research.google/pubs/pub41376/).

For more information, including examples and limitations, see [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %}).

## Technical interactions with other layers

### SQL and transaction layer

KV operations from executed `planNodes` are sent to the transaction layer.

## What's next?

Learn how CockroachDB handles concurrent requests in the [transaction layer]({% link {{ page.version.version }}/architecture/transaction-layer.md %}).
