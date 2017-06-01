---
title: Architecture: SQL Layer
summary: 
toc: false
---

The SQL Layer of CockroachDB's architecture accepts client RPCs and sends them to the underlying transaction layer.

<div id="toc"></div>

## Overview

To begin interacting with CockroachDB, developers need nothing more than a connection string that routes to a node and SQL statements. Every node in your cluster can receive SQL statements (either DDL or DML), which it then acts as "gateway node" for as it communicates with the rest of your cluster.

Though CockroachDB uses SQL as its API, data is ultimately written to and read from the storage layer as key-value (KV) pairs. This means that the function of the SQL layer is to:

- Convert user's SQL statements into KV data and processes
- Determine the plan to execute the statement

## Components

### Relational Structure

Developers experience data stored in CockroachDB in a relational structure, i.e., rows and columns. Sets of rows and columns are organized into tables. Collections of tables are organized into databases.

In CockroachDB, a collection of tables is called a "database"; in other RDBMS implementations, this is called a "schema". CockroachDB does not use the word "schema" in this way.

Because CockroachDB relates data together, we're able to provide typical database features like constraints (e.g., foreign keys). This lets application developers trust that the database will ensure consistent structuring of the application's data; data validation doesn't need to be built into the application logic separately.

### SQL API

CockroachDB implements a large portion of the ANSI SQL standard to manifest its relational structure. You can view [all of the SQL features CockroachDB supports here](sql-feature-support.html).

Importantly, through the SQL API, we also let developers use ACID-semantic transactions just like they would through any SQL database (`BEGIN`, `END`, `ISOLATION LEVELS`, etc.)

### PostgreSQL Wire Protocol

SQL queries reach your cluster through the Postgres wire protocol. This makes connecting your application to the cluster simple by supporting most PostgreSQL-compatible drivers, as well as many PostgreSQL ORMs, such as GORM (Go) and Hibernate (Java).

### SQL Parser, Planner, Executor

After receiving the request, CockroachDB parses the statement, plans an execution, and then executes the query.

#### Parsing

CockroachDB's supported SQL API is described in a [`yacc`](https://github.com/cockroachdb/cockroach/blob/master/pkg/sql/parser/sql.y) file, which we've derived from PostgreSQL. The received query is then parsed against the `yacc` file, converting the string version of the query into [Abstract Syntax Trees (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree).

#### Planning

Given the AST from the parser, CockroachDB begins planning the query's execution by generating a tree of `planNodes`.
this is ultimately how CockroachDB converts SQL statements into KV operations. Each of these nodes is a contained set
of code that can be executed to operate on the data from the KV layer.

This step also includes steps analyzing the client's SQL statements against the expected AST expressions, which includes things like type checking.

You can see the planNodes a query generates using [`EXPLAIN`](/docs/explain.html).

#### Executing

planNodes are then executed, which begins by communicating with the Transaction Layer.

This step also includes encoding values from your statements, as well as decoding values retrieved from the KV layer.

### Encoding

Though SQL queries are written in parsable strings, lower layers of CockroachDB deal primarily in bytes. This means at the SQL layer, in query execution, CockroachDB must convert row data from their SQL representation as strings into bytes, and convert bytes returned from lower layers into SQL data that can be passed back to the client.

It's also important––for indexed columns––that this byte encoding preserve the same sort order as the data type it represents. This is because of the way CockroachDB ultimately stores data in a sorted key-value map; storing bytes in the same order as the data it represents lets us efficiently scan data in the key-value layer.

However, for non-indexed columns (i.e. those that are covered or stored by an index), CockroachDB instead uses an encoding (known as "value encoding") which consumes less space but does not preserve ordering.

You can find more exhaustive detail in the [Encoding Tech Note](https://github.com/cockroachdb/cockroach/blob/master/docs/tech-notes/encoding.md).

### DistSQL

Because CockroachDB is a distributed database, we've begun implementing a Distributed SQL (DistSQL) optimization tool for some queries. Though its architecture is worthy of its own documentation, here's a brief outline of how it works.

For a subset of SQL statements, our execution phase works slightly differently. Instead of querying each node for rows that match a query and aggregating the results on the coordinating gateway node, we bring the query to each node involved. Each node then processes the query for the rows it stores. The processed results (instead of all involved rows) are then returned to the coordinating node, which aggregates the results and returns it to the client.

To run SQL statements in a distributed fashion, we introduce a couple of concepts:

- **Logical plan**: Similar the AST/planNode tree described above, it represents the abstract (non-distributed) data flow through computation stages.
- **Physical plan**: A physical plan is conceptually a mapping of the logical plan nodes to CockroachDB nodes. Logical plan nodes are replicated and specialized depending on the cluster topology. The components of the physical plan are scheduled and run on the cluster.

You can find much greater detail in the [DistSQL RFC](https://github.com/cockroachdb/cockroach/blob/master/docs/RFCS/distributed_sql.md).

## Interactions with Other Layers

Executing the query plan begins sending KV operations to the Transaction Layer.
