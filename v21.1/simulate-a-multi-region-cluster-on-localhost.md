---
title: Simulate a Multi-Region Cluster on localhost (insecure)
summary: Run an insecure simulated multi-region CockroachDB cluster locally using 'cockroach demo'.
toc: true
---

<span class="version-tag">New in v21.1:</span> Once you've [installed CockroachDB](install-cockroachdb.html), it's simple to simulate multi-region cluster on your local machine using [`cockroach demo`](cockroach-demo.html). This is a useful way to start playing with the [improved multi-region abstractions](multiregion-overview.html) provided by CockroachDB.

## Before you begin

- Make sure you have already [installed CockroachDB](install-cockroachdb.html).
- Note that simulating multiple geographically distributed nodes on a single host is useful for testing, but not for production. It is especially not representative of the [performance you should expect](frequently-asked-questions.html#single-row-perf) of a production deployment.
  - For instructions showing how to do production multi-region deployments, see [Orchestrate CockroachDB Across Multiple Kubernetes Clusters](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html) and [Deploy a Multi-Region Web Application](multi-region-deployment.html). Also be sure to review the [Production Checklist](recommended-production-settings.html).

## Step 1. Start the cluster

Use the [`cockroach demo`](cockroach-demo.html) command shown below to start the cluster. This particular combination of flags results in an in-memory cluster of 9 nodes, with 3 nodes in each region. It sets the appropriate [node localities](cockroach-start.html#locality) and also simulates the network latency that would occur between nodes in these localities. For more information about each flag, see the [`cockroach demo`](cockroach-demo.html#flags) documentation, especially for [`--global`](cockroach-demo.html#global-flag).

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo --global --nodes 9 --empty --insecure
~~~

When the cluster starts, you'll see a message like the one shown below, followed by a SQL prompt.

Note the URLs for:
- Viewing the [DB Console](ui-overview.html): `http://127.0.0.1:8080`
- Connecting to the database from a [SQL shell](cockroach-sql.html) or a [programming language](connect-to-the-database.html): `postgres://root@127.0.0.1:26257?sslmode=disable`

~~~
# Welcome to the CockroachDB demo database!
#
# You are connected to a temporary, in-memory CockroachDB cluster of 9 nodes.
#
# This demo session will attempt to enable enterprise features
# by acquiring a temporary license from Cockroach Labs in the background.
# To disable this behavior, set the environment variable
# COCKROACH_SKIP_ENABLING_DIAGNOSTIC_REPORTING=true.
#
# Reminder: your changes to data stored in the demo session will not be saved!
#
# Connection parameters:
#   (console) http://127.0.0.1:8080
#   (sql)     postgres://root:unused@?host=%2Fvar%2Ffolders%2Fbh%2F_32m6zhj67z534slcg79nm_w0000gp%2FT%2Fdemo956443538&port=26257
#   (sql/tcp) postgres://root@127.0.0.1:26257?sslmode=disable
# 
# To display connection parameters for other nodes, use \demo ls.
# Server version: CockroachDB CCL v21.1.0-alpha.3-1368-g0ee391c3b9 (x86_64-apple-darwin19.6.0, built 2021/03/18 14:54:44, go1.16) (same version as client)
# Cluster ID: 063fa964-1f43-4b7f-b1e6-f70afd9ad921
~~~

## Step 2. Enter SQL statements at the prompt

Now that your simulated multi-region cluster is running, you are presented with a SQL prompt:

~~~
root@127.0.0.1:26257/defaultdb> 
~~~

You can run some basic [CockroachDB SQL statements](learn-cockroachdb-sql.html):

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank;
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO bank.accounts VALUES (1, 1000.50);
~~~

{% include copy-clipboard.html %}
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

The [DB Console](ui-overview.html) gives you insight into the overall health of your cluster, as well as the performance of any [client workloads](cockroach-workload.html).

To verify that the 9 nodes you specified are up and running as expected, go to the [**Cluster Overview**](ui-cluster-overview-page.html) at <a href="http://localhost:8080/#/overview/list" data-proofer-ignore>http://localhost:8080/#/overview/list</a>.

{{site.data.alerts.callout_info}}
Capacity metrics can be incorrect when running multiple nodes on a single machine. For more details, see this [limitation](known-limitations.html#available-capacity-metric-in-the-db-console).
{{site.data.alerts.end}}

To see which nodes are located in which regions, and to see the simulated latencies between them, go to the [**Network Diagnostics**](ui-network-latency-page.html) page at <a href="http://localhost:8080/#/reports/network/region" data-proofer-ignore>http://localhost:8080/#/reports/network/region</a>

To access a variety of time series charts, including graphs of [SQL queries](ui-sql-dashboard.html#sql-queries) and [SQL service latency](ui-sql-dashboard.html#service-latency-sql-99th-percentile), go to the [**Metrics**](ui-overview-dashboard.html) page at <a href="http://localhost:8080/#/metrics" data-proofer-ignore>http://localhost:8080/#/metrics</a>

You may also find the following pages useful:

- The [**Databases**](ui-databases-page.html) page at <a data-proofer-ignore href="http://localhost:8080/#/databases">http://localhost:8080/#/databases</a> shows details about your databases and tables.
- The [**Statements**](ui-statements-page.html) page at <a data-proofer-ignore href="http://localhost:8080/#/statements">http://localhost:8080/#/statements</a> is used to assess the performance of specific queries.
- The [**Jobs**](ui-jobs-page.html) page at <a data-proofer-ignore href="http://localhost:8080/#/jobs">http://localhost:8080/#/jobs</a> is used to monitor the status of long-running operations like [schema changes](online-schema-changes.html).

## Step 4. Wipe the cluster

When you're done with your demo cluster, you can wipe the cluster by typing the command shown below at the SQL prompt. Note that because this is a temporary, in-memory cluster, this will wipe any data you have added to the cluster. For more information, see the [`cockroach demo`](cockroach-demo.html) documentation.

{% include copy-clipboard.html %}
~~~ sql
\q
~~~

## What's next?

- [Install the client driver](install-client-drivers.html) for your preferred language
- Learn more about [CockroachDB SQL](learn-cockroachdb-sql.html) and the [built-in SQL client](cockroach-sql.html)
- [Build an app with CockroachDB](build-an-app-with-cockroachdb.html)
- Further explore CockroachDB capabilities like [fault tolerance and automated repair](demo-fault-tolerance-and-recovery.html), [multi-region SQL performance](demo-low-latency-multi-region-deployment.html), [serializable transactions](demo-serializable.html), and [JSON support](demo-json-support.html).
