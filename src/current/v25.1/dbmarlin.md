---
title: Monitor CockroachDB with DBmarlin
summary: The CockroachDB integration with DBmarlin enables data visualization and alerting on CockroachDB metrics.
toc: true
docs_area: manage
---

[DBmarlin](https://www.dbmarlin.com/home) is a monitoring platform for databases. The CockroachDB integration with DBmarlin enables DBmarlin to view CockroachDB metrics stored in the [`crdb_internal` system catalog]({{ page.version.version }}/monitoring-and-alerting.md#crdb_internal-system-catalog).

In this tutorial, you will enable the CockroachDB integration in DBmarlin, run a workload on CockroachDB, and visualize data.

For more information about the integration, see the [Cockroach Labs blog post](https://www.cockroachlabs.com/blog/dbmarlin-cockroachdb/).

{{site.data.alerts.callout_success}}
For more information about using DBmarlin, see the [DBmarlin documentation](https://docs.dbmarlin.com/).
{{site.data.alerts.end}}

## Before you begin

You must have the following set up before proceeding with this tutorial:

- [DBmarlin installation on a supported platform](https://docs.dbmarlin.com/docs/Getting-Started/supported-platforms#supported-installation-platforms)
- [Supported version of CockroachDB](https://docs.dbmarlin.com/docs/Getting-Started/supported-platforms#supported-database-platforms)

## Step 1. Connect DBmarlin to CockroachDB

Follow the steps in [CockroachDB](https://docs.dbmarlin.com/docs/Monitored-Technologies/Databases/cockroachdb).

## Step 2. Run a sample workload

To test the dashboard functionality, use [`cockroach workload`]({{ page.version.version }}/cockroach-workload.md) to run a sample workload on the cluster.

Initialize the workload for MovR, a fictional vehicle-sharing company:

~~~ shell
cockroach workload init movr  "postgresql://<username>:<password>@<host-address>:26257/movr?sslmode=verify-full&sslrootcert=$HOME/.postgresql/root.crt&options=--cluster%<cluster-id>"
~~~

Run the MovR workload for 5 minutes:

~~~ shell
cockroach workload run movr --duration=5m <username>:<password>@<host-address>:26257/movr?sslmode=verify-full&sslrootcert=$HOME/.postgresql/root.crt&options=--cluster%<cluster-id>"
~~~

## Step 3. View database behavior in DBmarlin

Follow the steps in [Instance Dashboard](https://docs.dbmarlin.com/docs/Using-DBmarlin/instance-dashboard).

When you open the dashboard you'll see :

![CockroachDB Overview dashboard for DBmarlin](/images/v24.2/dbmarlin-crdb-dashboard.png)

## See also

- [Monitoring and Alerting]({{ page.version.version }}/monitoring-and-alerting.md)
- [DB Console Overview]({{ page.version.version }}/ui-overview.md)
- [Logging Overview]({{ page.version.version }}/logging-overview.md)