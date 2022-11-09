---
title: Optimize Your CockroachDB Serverless Workload
summary: Tune your workload to reduce costs
toc: true
docs_area: deploy
---

This page describes how to tune your {{ site.data.products.serverless }} workload to reduce costs.

## Understanding your resource usage

{{ site.data.products.serverless }} clusters consume three kinds of resources:

- SQL CPU
- Network egress
- Storage layer I/O

To understand these resources, you need to understand a bit about the {{ site.data.products.serverless }} [architecture](architecture.html). A Serverless cluster is divided into two layers that run in separate processes: the SQL layer and the storage layer. The SQL layer receives and runs your SQL queries and background jobs. When the SQL layer needs to read or write data rows, it calls the storage layer, which manages a replicated, transactional row store that is distributed across many machines.

**SQL CPU** is the CPU consumed by SQL processes (not storage processes) and is converted to [Request Units](learn-about-request-units.html) using this equivalency: 1 RU = 3 milliseconds SQL CPU.

**Network egress** measures the number of bytes that are returned from a SQL process to the calling client. It also includes any bytes sent by bulk operations like `EXPORT` or changefeeds. It is converted to Request Units using this equivalency: 1 RU = 1 KiB Network egress.

**Storage layer I/O** includes the read and write requests sent by the SQL layer to the storage layer. These operations are sent in batches containing any number of requests. Requests can have a payload containing any number of bytes. Write operations are replicated to multiple storage processes (3 by default), with each replica counted as a separate write operation. Storage layer I/O is converted to Request Units using these equivalencies:

  - 1 RU = 8 storage read requests
  - 1 RU = 64 KiB request payload (prorated)
  - 1 RU = 2 storage read batches
  - 1 RU = 1 storage write batch
  - 1 RU = 1 storage write request
  - 1 RU = 1 KiB request payload (prorated)
  
### Example Request Unit calculation

Say you have a simple key-value pair table with a secondary index:

`CREATE TABLE kv (k INT PRIMARY KEY, v STRING, INDEX (v))`

Now you insert a row into the table:

`INSERT INTO kv VALUES (1, “...imagine this is a 1 KiB string…”)`

The amount of SQL CPU needed to execute this query is about 1.5 milliseconds. The network egress is also minimal, around 50 bytes. Most of the cost comes from 6 write requests to the storage layer with about 6K in request payload (plus a bit of extra overhead). The `INSERT` needs to be made first for the primary index on the `k` column and again for the secondary index on the `v` column. Each of those writes is replicated 3 times to different storage locations, which is a total of 6 requests. All of these costs add up to a total number of RUs:

1.5 SQL CPU milliseconds = 0.5 RU

50 bytes network egress = 50/1024 = 0.05 RU

6 storage write batches = 6 RU

6 storage write requests = 6 RU

6 KiB write payloads = 6 RU

**Total cost** = 18.55 RU

Note that this is not exact, as there can be slight variations in multiple parts of the calculation.

## Understanding which queries to optimize

In the {{ site.data.products.db }} Console, you can monitor your cluster's SQL activity on the [**Statements**](statements-page.html) and [**Transactions**](transactions-page.html) pages. You can sort queries by the time they took to process, the number of rows processed, or the number of bytes read to see which queries are using the most resources. If you have queries that return more data than needed or have long runtimes, those are good candidates for optimization.

## Tips for reducing RU usage

You can reduce the RU cost of a query by reducing the work your cluster must do to execute that query. We recommend the following:

- Drop indexes that are no longer needed.
- Use [secondary indexes](../{{site.versions["stable"]}}/schema-design-indexes.html) that reduce the number of rows that need to be scanned.
- Take advantage of SQL filters, joins, and aggregations rather than performing these operations in the application to reduce the amount of data returned to the client.
- Use [batched `INSERT`](../{{site.versions["stable"]}}/insert.html#bulk-inserts) statements to insert multiple rows in a single statement, rather than sending a separate statement per row.
- Use range `UPDATE` and `DELETE` statements to affect many rows in a single statement, rather than sending a separate statement per row.
- Avoid returning columns that your application does not need.
- Don't disable automatic statistics, as they are needed to power the [optimizer](../stable/cost-based-optimizer.html).

## Learn more

- [Learn About {{ site.data.products.serverless }} Pricing](learn-about-pricing.html)
- [Learn About Request Units](learn-about-request-units.html)
- [Manage Your {{ site.data.products.serverless }} Cluster](serverless-cluster-management.html)
- [CockroachDB Cloud Architecture](architecture.html)