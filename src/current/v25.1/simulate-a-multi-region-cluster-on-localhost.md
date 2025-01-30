---
title: Simulate a Multi-Region Cluster on localhost (Insecure)
summary: Run a simulated multi-region CockroachDB cluster locally using cockroach demo.
toc: true
docs_area: deploy
---

 Once you've [installed CockroachDB]({{ page.version.version }}/install-cockroachdb.md), you can simulate multi-region cluster on your local machine using [`cockroach demo`]({{ page.version.version }}/cockroach-demo.md)to learn about CockroachDB's [multi-region abstractions]({{ page.version.version }}/multiregion-overview.md).

{{site.data.alerts.callout_info}}
[`cockroach demo`]({{ page.version.version }}/cockroach-demo.md) is not suitable for production deployments. Additionally, simulating multiple geographically distributed nodes on a single host is not representative of the [performance you should expect]({{ page.version.version }}/frequently-asked-questions.md#single-row-perf) in a production deployment. To learn more about production multi-region deployments, refer to [Orchestrate CockroachDB Across Multiple Kubernetes Clusters]({{ page.version.version }}/orchestrate-cockroachdb-with-kubernetes-multi-cluster.md) and [Deploy a Global, Serverless Application]({{ page.version.version }}/movr-flask-deployment.md), and review the [Production Checklist](recommended-production-settings.html).
{{site.data.alerts.end}}

## Before you begin

[Download](releases/index.md) and [Install CockroachDB]({{ page.version.version }}/install-cockroachdb.md).

## Step 1. Start the cluster


## Step 2. Enter SQL statements at the prompt

Now that your simulated multi-region cluster is running, you are presented with a SQL prompt:

~~~
root@127.0.0.1:26257/defaultdb>
~~~

You can run some basic [CockroachDB SQL statements]({{ page.version.version }}/learn-cockroachdb-sql.md):

~~~ sql
> CREATE DATABASE bank;
~~~

~~~ sql
> USE bank;
~~~

~~~ sql
> CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
~~~

~~~ sql
> INSERT INTO bank.accounts VALUES (1, 1000.50);
~~~

~~~ sql
> SELECT * FROM bank.accounts;
~~~

~~~
  id | balance
+----+---------+
   1 | 1000.50
(1 row)
~~~

## Step 3. View cluster health and performance in the DB Console

The [DB Console]({{ page.version.version }}/ui-overview.md) gives you insight into the overall health of your cluster, as well as the performance of any [client workloads]({{ page.version.version }}/cockroach-workload.md).

To verify that the 9 nodes you specified are up and running as expected, go to the [**Cluster Overview**]({{ page.version.version }}/ui-cluster-overview-page.md) at <a href="http://localhost:8080/#/overview/list" data-proofer-ignore>http://localhost:8080/#/overview/list</a>.

{{site.data.alerts.callout_info}}
Capacity metrics can be incorrect when running multiple nodes on a single machine. For more details, see this [limitation]({{ page.version.version }}/known-limitations.md#available-capacity-metric-in-the-db-console).
{{site.data.alerts.end}}

To see which nodes are located in which regions, and to see the simulated latencies between them, go to the [**Network Diagnostics**]({{ page.version.version }}/ui-network-latency-page.md) page at <a href="http://localhost:8080/#/reports/network/region" data-proofer-ignore>http://localhost:8080/#/reports/network/region</a>

To access a variety of time series charts, including graphs of [SQL queries]({{ page.version.version }}/ui-sql-dashboard.md#sql-queries-per-second) and [SQL service latency]({{ page.version.version }}/ui-sql-dashboard.md#service-latency-sql-99th-percentile), go to the [**Metrics**]({{ page.version.version }}/ui-overview-dashboard.md) page at <a href="http://localhost:8080/#/metrics" data-proofer-ignore>http://localhost:8080/#/metrics</a>

You may also find the following pages useful:

- The [**Databases**]({{ page.version.version }}/ui-databases-page.md) page at <a data-proofer-ignore href="http://localhost:8080/#/databases">http://localhost:8080/#/databases</a> shows details about your databases and tables.
- The [**Statements**]({{ page.version.version }}/ui-statements-page.md) page at <a data-proofer-ignore href="http://localhost:8080/#/statements">http://localhost:8080/#/statements</a> is used to assess the performance of specific queries.
- The [**Jobs**]({{ page.version.version }}/ui-jobs-page.md) page at <a data-proofer-ignore href="http://localhost:8080/#/jobs">http://localhost:8080/#/jobs</a> is used to monitor the status of long-running operations like [schema changes]({{ page.version.version }}/online-schema-changes.md).

## Step 4. Wipe the cluster

When you're done with your demo cluster, you can wipe the cluster by typing the command shown below at the SQL prompt. Note that because this is a temporary, in-memory cluster, this will wipe any data you have added to the cluster. For more information, see the [`cockroach demo`]({{ page.version.version }}/cockroach-demo.md) documentation.

~~~ sql
\quit
~~~

## What's next?

- [Install the client driver]({{ page.version.version }}/install-client-drivers.md) for your preferred language
- Learn more about [CockroachDB SQL]({{ page.version.version }}/learn-cockroachdb-sql.md) and the [built-in SQL client]({{ page.version.version }}/cockroach-sql.md)
- [Build an app with CockroachDB]({{ page.version.version }}/example-apps.md)
- Further explore CockroachDB capabilities like:
  - [Low Latency Reads and Writes in a Multi-Region Cluster]({{ page.version.version }}/demo-low-latency-multi-region-deployment.md)
  - [Fault tolerance and automated repair]({{ page.version.version }}/demo-cockroachdb-resilience.md)
  - [Serializable transactions]({{ page.version.version }}/demo-serializable.md)
  - [JSON support]({{ page.version.version }}/demo-json-support.md)