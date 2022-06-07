---
title: Simulate a Multi-Region Cluster on localhost (Insecure)
summary: Run a simulated multi-region CockroachDB cluster locally using cockroach demo.
toc: true
---

{% include_cached new-in.html version="v21.1" %} Once you've [installed CockroachDB](install-cockroachdb.html), it's simple to simulate multi-region cluster on your local machine using [`cockroach demo`](cockroach-demo.html). This is a useful way to start playing with the [improved multi-region abstractions](multiregion-overview.html) provided by CockroachDB.

{{site.data.alerts.callout_info}}
[`cockroach demo`](cockroach-demo.html) is not suitable for production deployments.  Additionally, simulating multiple geographically distributed nodes on a single host is not representative of the [performance you should expect](frequently-asked-questions.html#single-row-perf) of a production deployment. For instructions showing how to do production multi-region deployments, see [Orchestrate CockroachDB Across Multiple Kubernetes Clusters](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html) and [Deploy a Global, Serverless Application](movr-flask-deployment.html). Also be sure to review the [Production Checklist](recommended-production-settings.html).
{{site.data.alerts.end}}

## Before you begin

- Make sure you have already [installed CockroachDB](install-cockroachdb.html).

## Step 1. Start the cluster

{% include {{page.version.version}}/sql/start-a-multi-region-demo-cluster.md %}

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
> USE bank;
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

To access a variety of time series charts, including graphs of [SQL queries](ui-sql-dashboard.html#sql-statements) and [SQL service latency](ui-sql-dashboard.html#service-latency-sql-99th-percentile), go to the [**Metrics**](ui-overview-dashboard.html) page at <a href="http://localhost:8080/#/metrics" data-proofer-ignore>http://localhost:8080/#/metrics</a>

You may also find the following pages useful:

- The [**Databases**](ui-databases-page.html) page at <a data-proofer-ignore href="http://localhost:8080/#/databases">http://localhost:8080/#/databases</a> shows details about your databases and tables.
- The [**Statements**](ui-statements-page.html) page at <a data-proofer-ignore href="http://localhost:8080/#/statements">http://localhost:8080/#/statements</a> is used to assess the performance of specific queries.
- The [**Jobs**](ui-jobs-page.html) page at <a data-proofer-ignore href="http://localhost:8080/#/jobs">http://localhost:8080/#/jobs</a> is used to monitor the status of long-running operations like [schema changes](online-schema-changes.html).

## Step 4. Wipe the cluster

When you're done with your demo cluster, you can wipe the cluster by typing the command shown below at the SQL prompt. Note that because this is a temporary, in-memory cluster, this will wipe any data you have added to the cluster. For more information, see the [`cockroach demo`](cockroach-demo.html) documentation.

{% include copy-clipboard.html %}
~~~ sql
\quit
~~~

## What's next?

- [Install the client driver](install-client-drivers.html) for your preferred language
- Learn more about [CockroachDB SQL](learn-cockroachdb-sql.html) and the [built-in SQL client](cockroach-sql.html)
- [Build an app with CockroachDB](hello-world-example-apps.html)
- Further explore CockroachDB capabilities like:
  - [Multi-region SQL performance](demo-low-latency-multi-region-deployment.html)
  - [Fault tolerance and automated repair](demo-fault-tolerance-and-recovery.html)
  - [Serializable transactions](demo-serializable.html)
  - [JSON support](demo-json-support.html)
