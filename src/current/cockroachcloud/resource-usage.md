---
title: Understand the Resource Usage of your CockroachDB Standard Cluster
summary: Diagnose your RU consumption and tune your workload to reduce costs
toc: true
docs_area: deploy
---

{{site.data.alerts.callout_info}}
CockroachDB Standard is currently in [Preview]({% link {{ site.current_cloud_version }}/cockroachdb-feature-availability.md %}).
{{site.data.alerts.end}}

{% include cockroachcloud/filter-tabs/resource-usage.md %}

This page describes how to understand your CockroachDB {{ site.data.products.standard }} cluster's Request Unit (RU) consumption and tune your workload to balance performance and costs.

- [Understand resource consumption](#understand-resource-consumption) gives an overview of the CockroachDB {{ site.data.products.standard }} architecture that affects RU and storage consumption and explains how RUs are calculated.

- [Diagnose and optimize your resource consumption](#diagnose-and-optimize-your-resource-consumption) explains how to find and optimize queries and processes that may be consuming excessive resources.

- [General tips for reducing RU usage](#general-tips-for-reducing-ru-usage) gives recommendations depending on the kind of resource usage.

For information on planning your cluster configuration, refer to [Plan a {{ site.data.products.standard }} Cluster]({% link cockroachcloud/plan-your-cluster.md %}) for a {{ site.data.products.standard }} cluster.

## Understand resource consumption

CockroachDB {{ site.data.products.standard }} clusters consume three kinds of resources:

- SQL CPU
- Network egress
- Storage layer I/O

A CockroachDB {{ site.data.products.standard }} cluster is divided into a SQL layer and a storage layer that run in separate processes. The SQL layer receives and runs your SQL queries and background jobs. When the SQL layer needs to read or write data rows, it calls the storage layer, which manages a replicated, transactional row store that is distributed across many machines.

**SQL CPU** is the CPU consumed by SQL processes (not storage processes) and is converted to [Request Units]({% link cockroachcloud/plan-your-cluster-basic.md %}#request-units) using this equivalency: 1 RU = 3 milliseconds SQL CPU.

**Network egress** measures the number of bytes that are returned from a SQL process to the calling client. It also includes any bytes sent by bulk operations like `EXPORT` or changefeeds. It is converted to Request Units using this equivalency: 1 RU = 1 KiB network egress.

**Storage layer I/O** includes the read and write requests sent by the SQL layer to the storage layer. These operations are sent in batches containing any number of requests. Requests can have a payload containing any number of bytes. Write operations are replicated to multiple storage processes (3 by default), with each replica counted as a separate write operation. Storage layer I/O is converted to Request Units using these equivalencies:

- 1 RU = 2 storage read batches
- 1 RU = 8 storage read requests
- 1 RU = 64 KiB read request payload (prorated)

- 1 RU = 1 storage write batch
- 1 RU = 1 storage write request
- 1 RU = 1 KiB write request payload (prorated)

## Diagnose and optimize your resource consumption

Substantial RU consumption (greater than 100 RU/second) is usually caused by SQL queries issued by the application. This can be confirmed by verifying that RU consumption tightly follows changes to the application’s SQL QPS (queries per second). On the CockroachDB {{ site.data.products.cloud }} Console [**Overview** metrics page]({% link cockroachcloud/metrics-overview.md %}), you can compare the [**Request Units** chart]({% link cockroachcloud/metrics-overview.md %}#request-units) to the [**SQL Statements** chart]({% link cockroachcloud/metrics-overview.md %}#sql-statements). Assuming the charts correlate, then reducing Request Unit consumption is about [optimizing application SQL queries]({% link {{site.current_cloud_version}}/performance-best-practices-overview.md %}) ([`SELECT`]({% link {{site.current_cloud_version}}/select-clause.md %}), [`UPDATE`]({% link {{site.current_cloud_version}}/update.md %}), [`INSERT`]({% link {{site.current_cloud_version}}/insert.md %}), [`DELETE`]({% link {{site.current_cloud_version}}/delete.md %})).

In the CockroachDB {{ site.data.products.cloud }} Console, you can monitor your cluster's SQL activity on the [**Statements**]({% link cockroachcloud/statements-page.md %}) and [**Transactions**]({% link cockroachcloud/transactions-page.md %}) pages.

To see which queries are using the most resources, sort queries by the time they took to process, the number of rows processed, or the number of bytes read. If you have queries that return more data than needed or [have long runtimes]({% link {{site.current_cloud_version}}/manage-long-running-queries.md %}), those are good candidates for optimization.

### Expensive queries

Expensive queries, [especially `FULL SCAN` operations]({% link {{site.current_cloud_version}}/performance-best-practices-overview.md %}#table-scan-best-practices), are the most common cause of unexpected RU consumption increases. To diagnose expensive queries:

1. Navigate to the [**Statements** tab]({% link cockroachcloud/statements-page.md %}) of your cluster's **SQL Activity** page in the {{ site.data.products.cloud }} Console.
1. Click on the title of the **Rows Processed** column to sort your queries by the number of rows processed. 
 
    For most queries, total rows processed should be no more than a few hundred. Read queries are often more expensive than write queries.
  
1. Sort the queries by the **Bytes Read** column. Most queries should read no more than a few kilobytes per row.

If any queries are more expensive than expected, you can use the [`EXPLAIN ANALYZE` SQL command]({% link {{site.current_cloud_version}}/explain-analyze.md %}#global-properties) for an estimate of the RUs consumed. Efficient queries generally consume fewer RUs, so the guidelines for [optimizing query performance]({% link {{site.current_cloud_version}}/performance-best-practices-overview.md %}) can be applied here. For more information, refer to [How to troubleshoot and optimize query performance in CockroachDB](https://www.cockroachlabs.com/blog/query-performance-optimization/).

### Excessive queries

Each query has an associated RU cost, so the total number of queries is an important factor in your consumption.

To diagnose excessive queries, navigate to your cluster's [**Overview** metrics page]({% link cockroachcloud/metrics-overview.md %}) in the {{ site.data.products.cloud }} Console. The [**SQL Statements** chart]({% link cockroachcloud/metrics-overview.md %}#sql-statements) displays the number of queries over time. Look for any spikes or increases in QPS (queries per second) that may correspond to increases in the [**Request Units** chart]({% link cockroachcloud/metrics-overview.md %}#request-units).

Reducing the rate of queries is application-specific and must be achieved at the application level.

To investigate potentially problematic queries - ones that are excessive and expensive:

1. Navigate to the [**Statements** tab]({% link cockroachcloud/statements-page.md %}) of your cluster's **SQL Activity** page in the {{ site.data.products.cloud }} Console.
1. Click on the title of the **Execution Count** column to sort your queries by the number of executions of the statements within the time interval.
1. Sort the queries by the **Rows Processed** or **Bytes Read** column. For most queries, total rows processed should be no more than a few hundred. Most queries should read no more than a few kilobytes per row.

### Excessive number of connections

CockroachDB {{ site.data.products.standard }} clusters consume minimal resources per connection, so increased RU consumption is not likely to be caused by a high number of connections. However, it will be important to manage your connections for both performance optimization and RU consumption as your application scales up.

Maintaining fewer than five active connections is recommended for most workloads. To diagnose excessive connections, navigate to your cluster's [**Overview** metrics page]({% link cockroachcloud/metrics-overview.md %}) in the {{ site.data.products.cloud }} Console. The [**SQL Connections** chart]({% link cockroachcloud/metrics-overview.md %}#sql-connections) displays new SQL connection attempts over time.

[Connection pooling]({% link {{site.current_cloud_version}}/connection-pooling.md %}) is the recommended way to manage the number of connections for many workloads. To read more about connection pooling, see [What is Connection Pooling, and Why Should You Care](https://www.cockroachlabs.com/blog/what-is-connection-pooling/).

### Excessive data egress

To diagnose excessive data egress, navigate to your cluster's [**Request Units** metrics page]({% link cockroachcloud/metrics-request-units.md %}) in the {{ site.data.products.cloud }} Console and monitor the [**Egress** chart]({% link cockroachcloud/metrics-request-units.md %}#egress) for high RU's for client traffic or bulk I/O operations.

Excessive egress can be treated similarly to [expensive queries](#expensive-queries). Reducing the amount of data returned per query is often the best way to decrease egress data. You can also reduce the frequency of [excessive queries](#excessive-queries).

### Database UI tools

Database management tools like [DBeaver](https://dbeaver.com/) also consume RUs. They can cause excessive RU consumption by running expensive queries to populate views and periodically refreshing in the background if left running.

To determine whether database UI tools are contributing to your RU usage, navigate to the **SQL Activity** page in the {{ site.data.products.cloud }} Console and search for queries similar to the following:

~~~ sql
SELECT count(*) FROM crdb_internal.cluster_sessions

SELECT avg((((statistics->'')->'')->'_')::INT8) AS meanrunlatency
FROM crdb_internal.statement_statistics AS ciss
WHERE ciss.aggregated_ts::DATE = current_date()
~~~

You might also see [multiple open connections](#excessive-number-of-connections) to your cluster that persist regardless of workload. This can indicate that multiple team members have a database UI tool running.

### Data migration

An initial data load during a migration may consume a high number of RUs. Generally in this case, optimized performance will also coincide with optimized RU consumption. For more information about migrations, refer to the [Migration Overview]({% link molt/migration-overview.md %}).

### Changefeeds (CDC)

[Changefeeds]({% link {{site.current_cloud_version}}/change-data-capture-overview.md %}) can contribute to significant RU usage. To monitor changefeed performance, navigate to your cluster's [**Changefeeds** metrics page]({% link cockroachcloud/metrics-changefeeds.md %}) in the {{ site.data.products.cloud }} Console and monitor the available charts.

Refer to [Change Data Capture Queries]({% link {{site.current_cloud_version}}/cdc-queries.md %}) for performance guidance that may decrease RU consumption.

## General tips for reducing RU usage

RU consumption can be broken down to more granular components that can give additional optimization insight. Use the {{ site.data.products.cloud }} Console [**Request Units** metrics]({% link cockroachcloud/metrics-request-units.md %}) charts to see what kind of resource usage is driving RU consumption.

The following recommendations can help minimize the RU cost of a query by reducing the work your cluster must do to execute that query. The tips are grouped according to the type of resource usage.

### Reads

If the [**Reads** chart]({% link cockroachcloud/metrics-request-units.md %}#reads) shows high RU's for batches, requests, or bytes (payload):

- Use [secondary indexes](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/schema-design-indexes) that reduce the number of rows that need to be scanned.
- Avoid “wide” columns in tables that are frequently scanned, such as large text or [binary]({% link {{site.current_cloud_version}}/bytes.md %}) columns. Instead, offload them to a separate table that is only accessed when those columns are needed.
- Don't disable [automatic statistics]({% link {{ site.current_cloud_version }}/cost-based-optimizer.md %}#table-statistics), as they are needed to power the [optimizer](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/cost-based-optimizer).
- Take advantage of SQL [filters]({% link {{ site.current_cloud_version }}/select-clause.md %}#filter-rows), [joins]({% link {{ site.current_cloud_version }}/joins.md %}), and [aggregations]({% link {{ site.current_cloud_version }}/select-clause.md %}#aggregate-functions) rather than performing these operations in the application to reduce the amount of data returned to the client.

### Writes

If the [**Writes** chart]({% link cockroachcloud/metrics-request-units.md %}#writes) shows high RU's for batches, requests, or bytes (payload):

- [Drop indexes]({% link {{ site.current_cloud_version }}/drop-index.md %}) that are no longer needed since each additional index requires an additional write.
- Use [batched `INSERT`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/insert#bulk-inserts) statements to insert multiple rows in a single statement, rather than sending a separate statement per row.
- Use range [`UPDATE`]({% link {{site.current_cloud_version}}/update.md %}) and [`DELETE`]({% link {{site.current_cloud_version}}/delete.md %}) statements to affect many rows in a single statement, rather than sending a separate statement per row.

### Egress

If the [**Egress** chart]({% link cockroachcloud/metrics-request-units.md %}#egress) shows high RU's for client traffic or bulk I/O operations:

- Avoid returning columns that your application does not need.
- Take advantage of SQL [filters]({% link {{ site.current_cloud_version }}/select-clause.md %}#filter-rows), [joins]({% link {{ site.current_cloud_version }}/joins.md %}), and [aggregations]({% link {{ site.current_cloud_version }}/select-clause.md %}#aggregate-functions) rather than performing these operations in the application to reduce the amount of data returned to the client.

### Cross-region Networking

If the [**Cross-region Networking** chart]({% link cockroachcloud/metrics-request-units.md %}#cross-region-networking) shows high RU's for network traffic:

- For [multi-region clusters]({% link cockroachcloud/plan-your-cluster-basic.md %}#multi-region-clusters), avoid cross-region reads by using features such as [global tables](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/global-tables), [regional by row tables](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/regional-tables), and [follower reads](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/follower-reads) where possible.

### SQL CPU

If the [**CPU** chart]({% link cockroachcloud/metrics-request-units.md %}#cpu) shows high RU's for total amount of CPU used by SQL pods:

- Most of the above tips also apply to reducing SQL CPU.
- Ensure that frequently executed queries are [“prepared”]({% link {{site.current_cloud_version}}/sql-grammar.md %}#prepare_stmt) so they can be cached by the SQL layer. Most [ORMs and drivers]({% link {{ site.current_cloud_version }}/third-party-database-tools.md %}) do this automatically, so it’s usually not a problem.

## Example Request Unit calculation

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

The amount of SQL CPU needed to execute this query is about 1.5 milliseconds. The network egress is also minimal, around 50 bytes.

Most of the cost comes from 6 write requests to the storage layer with about 6 KiB in request payload (plus some extra overhead). The `INSERT` is first issued for the primary index on `k`, and then for the secondary index on `v`. Each of those writes is replicated 3 times to different storage locations, which is a total of 6 requests. All of these costs add up to a total number of RUs:

1.5 SQL CPU milliseconds = 0.5 RU

50 bytes network egress = 50/1024 = 0.05 RU

6 storage write batches = 6 RU

6 storage write requests = 6 RU

6 KiB write payloads = 6 RU

**Total cost** = 18.55 RU

Note that this is not exact, as there can be slight variations in multiple parts of the calculation.

You can use the [`EXPLAIN ANALYZE` SQL command]({% link {{site.current_cloud_version}}/explain-analyze.md %}#global-properties) with your statements to estimate the RU usage of that statement. For example, prepend `EXPLAIN ANALYZE` to the `INSERT` statement:

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

This will insert the data, and also output information from the optimizer about the execution of the statement. The `estimated RUs consumed` field represents the optimizer's estimate of RU consumption for the statement. In this case, the optimizer estimated the `INSERT` statement would consume 15 RUs, which is similar to the estimate of 18.5 RUs.

## Learn more

- [CockroachDB {{ site.data.products.cloud }} Pricing]({% link cockroachcloud/plan-your-cluster-basic.md %}#pricing)
- [Request Units]({% link cockroachcloud/plan-your-cluster-basic.md %}#request-units)
- [Manage Your CockroachDB {{ site.data.products.standard }} Cluster]({% link cockroachcloud/cluster-management.md %})
