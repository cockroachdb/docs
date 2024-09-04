---
title: Understand your Serverless Resource Usage
summary: Diagnose your RU consumption and tune your workload to reduce costs
toc: true
docs_area: deploy
---

This page describes how to diagnose your CockroachDB {{ site.data.products.serverless }} cluster's Request Unit (RU) consumption and tune your workload to reduce costs.

- [Understand resource consumption in CockroachDB {{ site.data.products.serverless }}](#understand-resource-consumption-in-cockroachdb-serverless) gives an overview of the CockroachDB {{ site.data.products.serverless }} architecture that affects RU and storage consumption and explains how RUs are calculated.

- [Diagnose and optimize your resource consumption](#diagnose-and-optimize-your-resource-consumption) explains how to find and optimize queries and processes that may be consuming excessive resources and provides general tips for reducing resource usage.

For information on planning your cluster configuration and setting resource limits, refer to [Plan a Serverless Cluster]({% link cockroachcloud/plan-your-cluster-serverless.md %}).

## Understand resource consumption in CockroachDB {{ site.data.products.serverless }}

CockroachDB {{ site.data.products.serverless }} clusters consume three kinds of resources:

- SQL CPU
- Network egress
- Storage layer I/O

To understand these resources, you need to understand a bit about the CockroachDB {{ site.data.products.serverless }} [architecture]({% link cockroachcloud/architecture.md %}). A CockroachDB {{ site.data.products.serverless }} cluster is divided into two layers that run in separate processes: the SQL layer and the storage layer. The SQL layer receives and runs your SQL queries and background jobs. When the SQL layer needs to read or write data rows, it calls the storage layer, which manages a replicated, transactional row store that is distributed across many machines.

**SQL CPU** is the CPU consumed by SQL processes (not storage processes) and is converted to [Request Units]({% link cockroachcloud/plan-your-cluster-serverless.md %}#request-units) using this equivalency: 1 RU = 3 milliseconds SQL CPU.

**Network egress** measures the number of bytes that are returned from a SQL process to the calling client. It also includes any bytes sent by bulk operations like `EXPORT` or changefeeds. It is converted to Request Units using this equivalency: 1 RU = 1 KiB Network egress.

**Storage layer I/O** includes the read and write requests sent by the SQL layer to the storage layer. These operations are sent in batches containing any number of requests. Requests can have a payload containing any number of bytes. Write operations are replicated to multiple storage processes (3 by default), with each replica counted as a separate write operation. Storage layer I/O is converted to Request Units using these equivalencies:

- 1 RU = 2 storage read batches
- 1 RU = 8 storage read requests
- 1 RU = 64 KiB read request payload (prorated)

- 1 RU = 1 storage write batch
- 1 RU = 1 storage write request
- 1 RU = 1 KiB write request payload (prorated)

## Diagnose and optimize your resource consumption

In the CockroachDB {{ site.data.products.cloud }} Console, you can monitor your cluster's SQL activity on the [**Statements**]({% link cockroachcloud/statements-page.md %}) and [**Transactions**]({% link cockroachcloud/transactions-page.md %}) pages. You can sort queries by the time they took to process, the number of rows processed, or the number of bytes read to see which queries are using the most resources. If you have queries that return more data than needed or have long runtimes, those are good candidates for optimization. 

### Expensive queries

Expensive queries, especially `FULL SCAN` operations, are the most common cause of unexpected RU consumption increases and a good place to begin investigating your consumption. To diagnose expensive queries:

1. Navigate to the [**Statements** tab]({% link cockroachcloud/statements-page.md %}) of your cluster's **SQL Activity** page in the {{ site.data.products.cloud }} Console.
1. Click on the title of the **Rows Processed** column to sort your queries by the number of rows processed. 
 
    For most queries, total rows processed should be fewer than 50. Read queries are often more expensive than write queries.
  
1. Next, sort the queries by the **Bytes Read** column. Most queries should read fewer than 1000 bytes.

If any queries are more expensive than expected, you can use the [`EXPLAIN ANALYZE` SQL command]({% link {{site.current_cloud_version}}/explain-analyze.md %}) for an estimate of the RUs consumed. Efficient queries generally consume fewer RUs, so the guidelines for [Optimizing Query Performance]({% link {{ site.current_cloud_version }}/performance-best-practices-overview.md %}) can be applied here. You can also refer to [Cockroach Labs Blog - How to troubleshoot and optimize query performance in CockroachDB](https://www.cockroachlabs.com/blog/query-performance-optimization/) for further information.

### Excessive queries

Each query has an associated RU cost, so the total number of queries is an important factor in your consumption.

To diagnose excessive queries, navigate to your cluster's [**Metrics** page]({% link cockroachcloud/metrics-page.md %}) in the {{ site.data.products.cloud }} Console. The **SQL Statements** chart displays the number of queries over time. Look for any spikes or increases in QPS (queries per second) that may correspond to increases in your resource consumption.

Reducing the rate of queries is application-specific and must be achieved at the application level.

### Excessive number of connections

CockroachDB {{ site.data.products.serverless }} consumes minimal resources per connection, so the number of connections is not the most likely cause of increased RU consumption. However, managing your connections is increasingly important for both performance optimization and RU consumption as your application scales up.

To diagnose excessive connections, navigate to your cluster's [**Metrics** page]({% link cockroachcloud/metrics-page.md %}) in the {{ site.data.products.cloud }} Console. The **SQL Connection Attempts** chart displays new SQL connection attempts over time. Maintaining fewer than five active connections is recommended for most workloads.

[Connection pooling]({% link {{ site.current_cloud_version }}/connection-pooling.md %}) is the recommended way to manage the number of connections for many workloads. To read more about connection pooling, see our [What is Connection Pooling, and Why Should You Care](https://www.cockroachlabs.com/blog/what-is-connection-pooling/) blog post.

### Excessive data egress

The {{ site.data.products.cloud }} Console does not currently provide direct observability of data egress, but you can observe the component of egress that comes from SQL Statements:

1. Navigate to the [**Statements** tab]({% link cockroachcloud/statements-page.md %}) of your cluster's **SQL Activity** page in the {{ site.data.products.cloud }} Console.
1. Sort the queries by the **Bytes Read** column. Most queries should read fewer than 1000 bytes.

Excessive egress can be treated similarly to [expensive queries](#expensive-queries). Reducing the amount of data returned per query is often the best way to decrease egress data. You can also reduce the frequency of [excessive queries](#excessive-queries).

### Database UI tools

Database management tools like [DBeaver](https://dbeaver.com/) also consume RUs. They can cause excessive RU consumption by running expensive queries to populate views and periodically refreshing in the background if left running.

To determine whether database UI tools are contributing to your RU usage, navigate to the **SQL Activity** page in the {{ site.data.products.cloud }} Console and search for queries similar to the following:

~~~
SELECT count(*) FROM crdb_internal.cluster_sessions

SELECT avg((((statistics->'')->'')->'_')::INT8) AS meanrunlatency
FROM crdb_internal.statement_statistics AS ciss
WHERE ciss.aggregated_ts::DATE = current_date()
~~~

You might also see [multiple open connections](#excessive-number-of-connections) to your cluster that persist regardless of workload. This can indicate that multiple team members have a database UI tool running.

### Data migration

Initial data ingestion during a migration may consume a high number of RUs. Generally, optimized performance will also coincide with optimized RU consumption in this case. Refer to our [Migration Overview]({% link {{ site.current_cloud_version }}/migration-overview.md %}) documentation for more information.

### Changefeeds (CDC)

The {{ site.data.products.cloud }} Console does not currently provide direct observability of changefeeds, but they can contribute to significant RU usage. Refer to our documentation on [Optimizing changefeeds]({% link {{ site.current_cloud_version }}/cdc-queries.md %}) for performance guidance that may decrease RU consumption. CockroachDB {{ site.data.products.dedicated }} users can also [Monitor and Debug Changefeeds]({% link {{ site.current_cloud_version }}/monitor-and-debug-changefeeds.md %}) in the DB Console.

### General tips for reducing RU usage

The following recommendations can help reduce the RU cost of a query by reducing the work your cluster must do to execute that query:

- Drop indexes that are no longer needed.
- Use [secondary indexes]({% link {{site.current_cloud_version}}/schema-design-indexes.md %}) that reduce the number of rows that need to be scanned.
- Take advantage of SQL filters, joins, and aggregations rather than performing these operations in the application to reduce the amount of data returned to the client.
- Use [batched `INSERT`]({% link {{site.current_cloud_version}}/insert.md %}#bulk-inserts) statements to insert multiple rows in a single statement, rather than sending a separate statement per row.
- Use range `UPDATE` and `DELETE` statements to affect many rows in a single statement, rather than sending a separate statement per row.
- Avoid returning columns that your application does not need.
- Don't disable automatic statistics, as they are needed to power the [optimizer]({% link {{ site.current_cloud_version }}/cost-based-optimizer.md %}).
- For [multi-region clusters]({% link cockroachcloud/plan-your-cluster-serverless.md %}#multi-region-clusters), avoid cross-region reads by using features such as [global tables]({% link {{ site.current_cloud_version }}/global-tables.md %}), [regional by row tables]({% link {{ site.current_cloud_version }}/regional-tables.md %}), and [follower reads]({% link {{ site.current_cloud_version }}/follower-reads.md %}) where possible.

### Example Request Unit calculation

Say you have a simple key-value pair table with a secondary index:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE kv (k INT PRIMARY KEY, v STRING, INDEX (v));
~~~

Now you insert a row into the table:

{% include_cached copy-clipboard.html %}
~~~ sql
INSERT INTO kv VALUES (1, '...imagine this is a 1 KiB string...');
~~~

The amount of SQL CPU needed to execute this query is about 1.5 milliseconds. The network egress is also minimal, around 50 bytes. Most of the cost comes from 6 write requests to the storage layer with about 6K in request payload (plus a bit of extra overhead). The `INSERT` needs to be made first for the primary index on the `k` column and again for the secondary index on the `v` column. Each of those writes is replicated 3 times to different storage locations, which is a total of 6 requests. All of these costs add up to a total number of RUs:

1.5 SQL CPU milliseconds = 0.5 RU

50 bytes network egress = 50/1024 = 0.05 RU

6 storage write batches = 6 RU

6 storage write requests = 6 RU

6 KiB write payloads = 6 RU

**Total cost** = 18.55 RU

Note that this is not exact, as there can be slight variations in multiple parts of the calculation.

You can use the [`EXPLAIN ANALYZE` SQL command]({% link {{site.current_cloud_version}}/explain-analyze.md %}) with your statements to estimate the RU usage of that statement. For example, prepend `EXPLAIN ANALYZE` to the `INSERT` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN ANALYZE INSERT INTO kv VALUES (1, '...imagine this is a 1 KiB string...');
~~~

~~~
               info
-----------------------------------
  planning time: 13ms
  execution time: 6ms
  distribution: local
  vectorized: true
  maximum memory usage: 10 KiB
  network usage: 0 B (0 messages)
  estimated RUs consumed: 15

  • insert fast path
    nodes: n1
    actual row count: 1
    into: kv(k, v)
    auto commit
    size: 2 columns, 1 row
(14 rows)


Time: 71ms total (execution 20ms / network 50ms)
~~~

This will insert the data, and also output information from the optimizer about the execution of the statement. The `estimated RUs consumed` field represents the optimizer's estimate of RU consumption for the statement. In this case, the optimizer estimated the `INSERT` statement would consume 15 RUs, which is similar to the estimate of 18.5 RUs we made earlier.

## Learn more

- [Learn About CockroachDB {{ site.data.products.serverless }} Pricing]({% link cockroachcloud/plan-your-cluster-serverless.md %}#pricing)
- [Learn About Request Units]({% link cockroachcloud/plan-your-cluster-serverless.md %}#request-units)
- [Manage Your CockroachDB {{ site.data.products.serverless }} Cluster]({% link cockroachcloud/serverless-cluster-management.md %})
- [CockroachDB Cloud Architecture]({% link cockroachcloud/architecture.md %})
