---
title: SQL Layer
summary: 
toc: false
---

The SQL Layer of CockroachDB's architecture exposes its SQL API to developers, which lets applications interact with the data stored in CockroachDB. After receiving SQL RPCs, the SQL Layer converts these requests into key-value operations used by the rest of the database.

{{site.data.alerts.callout_info}}If you haven't already, we recommend reading the <a href="overview.html">Architecture Overview</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Overview

After deploying CockroachDB, developers only need a connection string to the cluster and SQL statements to start working.

Because CockroachDB's nodes all behave symmetrically, developers can send requests to any node (which means CockroachDB works well with load balancers). Whichever node receives the request acts as the "gateway node," as other layers process the request.

When developers send requests to the cluster, they arrive as SQL statements, but data is ultimately written to and read from the storage layer as key-value (KV) pairs. To handle this, the SQL layer converts SQL statements into a plan of KV operations, which it passes along to the Transaction Layer.

### Interactions with Other Layers

In relationship to other layers in CockroachDB, the SQL Layer:

- Sends requests to and receives responses from the Transaction Layer.

## Components

### Relational Structure

Developers experience data stored in CockroachDB through a relational structure common to RDBMSs, i.e., using rows and columns, organized into tables, which are in turn organized into databases. And, like you would expect, your CockroachDB cluster can contain many databases.

Through this structure, CockroachDB provides typical relational features like constraints (e.g., foreign keys), `JOIN`s, and type enforcement. All together, these features makes a developer's life easier by ensuring consistency.

### SQL API

CockroachDB's relational structure is accessed by our implementation of large portions of the ANSI SQL standard. You can view [all of the SQL features CockroachDB supports here](../sql-feature-support.html).

Importantly, through the SQL API, we also let developers use ACID-semantic transactions just like they would through any SQL database (`BEGIN`, `END`, `ISOLATION LEVELS`, etc.)

### PostgreSQL Wire Protocol

Clients connect to your cluster through the PostgreSQL wire protocol, which means you can use most PostgreSQL-compatible drivers, as well as many PostgreSQL ORMs, such as [GORM (Go)](../build-a-go-app-with-cockroachdb-gorm.html) and [Hibernate (Java)](../build-a-java-app-with-cockroachdb-hibernate.html).

### SQL Parser, Planner, Executor

After your node receives a SQL request from a client, CockroachDB parses the statement, creates a query plan, and then executes the plan.

#### Parsing

Received queries are parsed against our `yacc` file (which describes our supported syntax), and converted into an [Abstract Syntax Tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree) (AST).

#### Planning

CockroachDB uses the AST version of the query to generate a tree of `planNode`s. Each `planNode` contains the  CRUD-type operations from the SQL statement in a way that lower levels of CockroachDB can understand, i.e., as KV operations. You can see the `planNodes` a query generates using [`EXPLAIN`](../explain.html).

Planning also includes steps to analyze the SQL statements against the expected AST expressions, including operations like type checking.

#### Executing

The KV operations in the `planNodes` are then executed, which begins by communicating with the Transaction Layer.

As operations execute, their values are also encoded. As the results of queries return, they are similarly decoded.

### Encoding

Because lower layers of CockroachDB deal primarily in bytes, SQL queries must have values (originally represented as strings when sent by the client) encoded, i.e., converted into bytes. And, on the other side, bytes in response to queries must be decoded into strings which can be returned to the client.

To achieve this, CockroachDB uses two types of encoding:

- **Order-preserving** for indexed columns, which maintain the same sort order as the data it represents
- **Value encoding** for *non*-indexed columns, which *does not* maintain its order but *does* consume less space

You can find more exhaustive detail in the [Encoding Tech Note](https://github.com/cockroachdb/cockroach/blob/master/docs/tech-notes/encoding.md).

### DistSQL

To leverage the power of widely distributed nodes, CockroachDB implements a Distributed SQL (DistSQL) optimization tool for some queries, which can substantially improve their performance. Though DistSQL's architecture is worthy of its own documentation, this cursory explanation can provide some insight into how it works.

For non-distributed queries, the coordinating node receives all of the rows that match its query, and then performs any computations on the entire data set. 

However, for DistSQL-compatible queries, each node does computations on the rows it contains, and then sends the results (instead of the rows in their entirety) to the coordinating node. The coordinating node then aggregates the results from each node, and finally returns a single response to the client.

This dramatically reduces the amount of data brought to the coordinating node, and leverages the well-proven concept of parallel computing, ultimately reducing the time it takes for complex queries to complete. In addition, this processes data on the node that already stores it, which lets CockroachDB handle row sets that are larger than an individual node's storage.

You can find much greater detail in the [DistSQL RFC](https://github.com/cockroachdb/cockroach/blob/master/docs/RFCS/20160421_distributed_sql.md).

## Technical Interactions with Other Layers

### SQL & Transaction Layer

KV operations from executed `planNodes` are sent to the Transaction Layer.

The Transaction Layer then sends the results and status of the KV operations to the SQL Layer, which in turn sends them to the client.

## What's Next?

Learn how CockroachDB handles concurrent requests in the [Transaction Layer](transaction-layer.html).
