---
title: SQL Layer
summary: The SQL layer of CockroachDB's architecture exposes its SQL API to developers and converts SQL statements into key-value operations.
toc: true
---

The SQL layer of CockroachDB's architecture exposes its SQL API to developers and converts SQL statements into key-value operations used by the rest of the database.

{{site.data.alerts.callout_info}}
If you haven't already, we recommend reading the [Architecture Overview](overview.html).
{{site.data.alerts.end}}

## Overview

Once CockroachDB has been deployed, developers need nothing more than a connection string to the cluster and SQL statements to start working.

Because CockroachDB's nodes all behave symmetrically, developers can send requests to any node (which means CockroachDB works well with load balancers). Whichever node receives the request acts as the "gateway node," as other layers process the request.

When developers send requests to the cluster, they arrive as SQL statements, but data is ultimately written to and read from the storage layer as key-value (KV) pairs. To handle this, the SQL layer converts SQL statements into a plan of KV operations, which it passes along to the transaction layer.

### Interactions with other layers

In relationship to other layers in CockroachDB, the SQL layer:

- Sends requests to the transaction layer.

## Components

### Relational structure

Developers experience data stored in CockroachDB in a relational structure, i.e., rows and columns. Sets of rows and columns are organized into tables. Collections of tables are organized into databases. Your cluster can contain many databases.

Because of this structure, CockroachDB provides typical relational features like constraints (e.g., foreign keys). This lets application developers trust that the database will ensure consistent structuring of the application's data; data validation doesn't need to be built into the application logic separately.

### SQL API

CockroachDB implements a large portion of the ANSI SQL standard to manifest its relational structure. You can view [all of the SQL features CockroachDB supports here](../sql-feature-support.html).

Importantly, through the SQL API, we also let developers use ACID-semantic transactions like they would through any SQL database (`BEGIN`, `END`, `COMMIT`, etc.)

### PostgreSQL wire protocol

SQL queries reach your cluster through the PostgreSQL wire protocol. This makes connecting your application to the cluster simple by supporting most PostgreSQL-compatible drivers, as well as many PostgreSQL ORMs, such as GORM (Go) and Hibernate (Java).

### SQL parser, planner, executor

After your node ultimately receives a SQL request from a client, CockroachDB parses the statement, [creates a query plan](../cost-based-optimizer.html), and then executes the plan.

#### Parsing

Received queries are parsed against our `yacc` file (which describes our supported syntax), and converts the string version of each query into [abstract syntax trees](https://en.wikipedia.org/wiki/Abstract_syntax_tree) (AST).

#### Logical planning

The AST is subsequently transformed into a query plan in three phases:

1. The AST is transformed into a high-level logical query plan. During this transformation, CockroachDB also performs [semantic analysis](https://en.wikipedia.org/wiki/Semantic_analysis_(compilers)), which includes checking whether the query is valid, resolving names, eliminating unneeded intermediate computations, and finalizing which data types to use for intermediate results.

2. The logical plan is *simplified* using transformation optimizations that are always valid.

3. The logical plan is *optimized* using a [search algorithm](../cost-based-optimizer.html) that evaluates many possible ways to execute a query and selects an execution plan with the least costs.

The result of the optimization phase is an optimized logical plan. This can be observed with [`EXPLAIN`](../explain.html).

#### Physical planning

The physical planning phase decides which nodes will participate in
the execution of the query, based on range locality information. This
is where CockroachDB decides to distribute a query to perform some
computations close to where the data is stored.

The result of physical planning is a physical plan and can be observed
with [`EXPLAIN(DISTSQL)`](../explain.html).

#### Query execution

Components of the physical plan are sent to one or more nodes for execution. On each node, CockroachDB spawns a *logical processor* to compute a part of the query. Logical processors inside or across nodes communicate with each other over a *logical flow* of data. The combined results of the query are sent back to the first node where the query was received, to be sent further to the SQL client.

Each processor uses an encoded form for the scalar values manipulated by the query. This is a binary form which is different from that used in SQL. So the values listed in the SQL query must be encoded, and the data communicated between logical processors, and read from disk, must be decoded before it is sent back to the SQL client.

#### Vectorized query execution

If [vectorized execution](../vectorized-execution.html) is enabled, the physical plan is sent to nodes to be processed by the vectorized execution engine.

Upon receiving the physical plan, the vectorized engine reads batches of table data [from disk](storage-layer.html) and converts the data from row format to columnar format. These batches of column data are stored in memory so the engine can access them quickly during execution.

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

## Technical interactions with other layers

### SQL and transaction layer

KV operations from executed `planNodes` are sent to the transaction layer.

## What's next?

Learn how CockroachDB handles concurrent requests in the [transaction layer](transaction-layer.html).
