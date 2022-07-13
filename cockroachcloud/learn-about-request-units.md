---
title: Learn About Request Units
summary: Understand CockroachDB Serverless pricing and Request Units.
toc: true
docs_area: deploy
---

This page describes how Request Units and pricing work in {{ site.data.products.serverless }}.

## Request Units

With {{ site.data.products.serverless }}, you are charged for the storage and activity of your cluster. All cluster activity, including SQL queries, bulk operations, and background jobs, is measured in Request Units, or RUs. RUs are an abstracted metric that represent the size and complexity of requests made to your cluster.

You can see your cluster's RU and storage usage on the [**Cluster Overview** page](cluster-overview-page.html).

### Pricing

The examples that follow show the costs of some common queries and how they increase with the size and complexity of the query. Note that the prices listed are estimates and your actual costs may vary slightly.

The cost to do a prepared point read (fetching a single row by its key) of a 64 byte row is approximately 1 RU, plus 1 RU for each additional KiB:

  Query                    | RUs per 1 query    | Price per 1M queries
  -------------------------|--------------------|----------
  Read 1 row of 64 bytes   | 1.03               | $0.04
  Read 1 row of 1024 bytes | 1.99               | $0.14
  Read 1 row of 2048 bytes | 3.01               | $0.24
  
Writing a 64 byte row costs approximately 7 RUs, which includes the cost of replicating the write 3 times for high availability and durability, plus 3 RUs for each additional KiB:
  
  Query                     | RUs per 1 query    | Price per 1M queries
  --------------------------|--------------------|----------
  Write 1 row of 64 bytes   | 6.71               | $0.12
  Write 1 row of 1024 bytes | 9.59               | $0.17
  Write 1 row of 2048 bytes | 12.62              | $0.22
  
Adding complexity to a query, such as an index or a join, increases the number of RUs consumed:
  
  Query                                     | RUs per 1 query    | Price per 1M queries
  ------------------------------------------|--------------------|----------
  Write 1 row of 1024 bytes, with 0 indexes | 9.59               | $0.31
  Write 1 row of 1024 bytes, with 1 index   | 18.69              | $0.31
  Write 1 row of 1024 bytes, with 2 indexes | 27.80              | $0.45

A small scan costs about 3 RUs, and the cost increases with the size of the scan:

  Query                                 | RUs per 1 query | Price per 1M queries
  --------------------------------------|-----------------|----------
  Scan 1K rows of 64 bytes, return 1    | 3.26            | $0.11
  Scan 1K rows of 1024 bytes, return 1  | 22.39           | $0.65
  Scan 10K rows of 1024 bytes, return 1 | 196.05          | $4.74
  
Other cluster activity such as establishing a SQL connection or executing a `SELECT` statement also consume RUs:  
  
  Query                    | RUs per 1 query  | Price per 1M queries
  -------------------------|------------------|----------
  Establish SQL Connection | 4.36             | $0.22
  `SELECT 1`               | 0.14             | $0.01
  
In addition to queries that you run, Request Units can be consumed by background activity, such as automatic statistics gathering used to optimize your queries or changefeeds that you’ve set up to send changes to an external sink like Kafka.

## Example Request Unit calculation

Say you have a simple key-value pair table with a secondary index:

`CREATE TABLE kv (k INT PRIMARY KEY, v STRING, INDEX (v))`

Now you insert a row into the table:

`INSERT INTO kv VALUES (1, “...imagine this is a 1 KiB string…”)`

The amount of SQL CPU needed to execute this query is small, about 1.5 milliseconds. The network egress is also minimal, around 50 bytes. Most of the cost comes from 6 write requests to the storage layer with about 6K in request payload (plus a bit of extra overhead). The `INSERT` needs to be made first for the primary index on the `k` column and again for the secondary index on the `v` column. Each of those writes is replicated 3 times to different storage locations, for a total of 2 x 3 = 6 requests. Converting all these costs into a single RU number:

  1.5 SQL CPU milliseconds = 0.5 RU

  50 bytes Network Egress = 50/1024 = 0.05 RU

  6 Storage write batches = 6 RU

  6 Storage write requests = 6 RU

  6 KiB write payloads = 6 RU

  Total cost = 18.55 RU

Note that this is not exact, as there is a bit of payload overhead, variation in the SQL CPU measurement, etc.

## Learn more

- [Learn About {{ site.data.products.serverless }} Pricing](learn-about-pricing.html)
- [Optimize Your {{ site.data.products.serverless }} Workload](optimize-serverless-workload.html)
- [Manage Your {{ site.data.products.serverless }} Cluster](serverless-cluster-management.html)