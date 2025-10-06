---
title: Read from Standby
summary: Direct read-only queries to your standby cluster instead of your primary cluster.
toc: true
docs_area: manage
---

In addition to providing [failover]({% link {{ page.version.version }}/failover-replication.md %}) capabilities for disaster recovery, CockroachDB **physical cluster replication (PCR)** allows you to direct read-only queries to your standby cluster. This process offloads traffic such as application reads, analytics queries, and ad-hoc reporting from the primary cluster.

Use this page to understand how the **read from standby** feature works and how to utilize it.

## How the read from standby feature works

PCR utilizes cluster virtualization to separate clusters' control planes from their data planes. A cluster always has one control plane, called a _system virtual cluster (SystemVC)_, and at least one data plane, called an _App Virtual Cluster (AppVC)_. A cluster's SystemVC manages PCR jobs and cluster metadata, and is not used for application queries. All data tables, system tables, and cluster settings in the standby cluster's AppVC are identical to the primary cluster's AppVC. The standby cluster's AppVC itself remains offline during replication.

When using read from standby, applications can read from the standby cluster, but they do not connect directly to the standby cluster's AppVC. Instead, PCR introduces a _reader virtual cluster (ReaderVC)_. The ReaderVC ensures a clean, isolated environment specifically for serving read queries without interfering with replication or system metadata. It reads continuously from the standby cluster's AppVC using internal pointers, providing access to the replicated data while keeping the AppVC offline. The ReaderVC does not store any data itself, so it does not require extra disk space.

The standby cluster's ReaderVC has its own system tables and cluster settings. The ReaderVC replicates a subset of system tables, including **Users** and **Roles**, from the AppVC, so that existing primary users can authenticate. Other system tables and cluster settings are set to defaults in the ReaderVC.

In the event of failover, the ReaderVC's response depends on the type of failover. After failover to the latest timestamp, the ReaderVC continues pointing to the AppVC but stops receiving updates. After failover to a point-in-time timestamp, the ReaderVC is destroyed.

## Use the read from standby feature
### Before you begin

Prior to setting up read from standby, ensure that:

- you have already configured PCR between a _primary_ cluster and a _standby_ cluster. For information on configuring PCR, refer to [Set Up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}).
- your CockroachDB version is v24.3 or later. The `read from standby` option is not supported in earlier versions.

### Start a PCR stream with read from standby

To start a PCR stream that allows read access to the standby cluster, use the `CREATE VIRTUAL CLUSTER ... REPLICATION` statement with the `READ VIRTUAL CLUSTER` option:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE VIRTUAL CLUSTER main FROM REPLICATION OF main ON 'postgresql://{connection string to primary}' WITH READ VIRTUAL CLUSTER;
~~~

### Add read from standby to a PCR stream

To add read from standby capabilities to an existing PCR stream, use the `ALTER VIRTUAL CLUSTER` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIRTUAL CLUSTER main SET REPLICATION READ VIRTUAL CLUSTER;
~~~

### Check the status of your reader virtual cluster

To confirm that your reader virtual cluster is active:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW VIRTUAL CLUSTERS;
~~~

The output shows a `standby-readonly` virtual cluster in addition to the primary and standby clusters:

~~~
  id |       name       | data_state  | service_mode
-----+------------------+-------------+---------------
   1 | system           | ready       | shared
   3 | standby          | replicating | none
   4 | standby-readonly | ready       | shared
~~~

### Run read-only queries on the standby cluster

Once you have created a reader virtual cluster on the standby cluster, you can connect to it and run read (`SELECT`) queries. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT COUNT(*) FROM customers;
SELECT region, SUM(amount) FROM orders GROUP BY region;
~~~

The results of queries on the standby cluster reflect the state of the primary cluster as of the replicated time.

{{ site.data.alerts.callout_info }}
Write operations are not permitted on the standby cluster.
{{ site.data.alerts.end }}

### Monitor replication lag

Reading from the standby cluster may return slightly stale data due to replication lag between the primary cluster and the standby cluster. You can monitor replication lag to understand how current the data in the standby cluster is. To check the standby cluster's replication status:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW VIRTUAL CLUSTER REPLICATION STATUS <standby_name>;
~~~

The output provides the following information:
- the replication status of the standby cluster
- the timestamp of the most recently applied event on the standby cluster
- any lag relative to the primary cluster

## See also
- [Set Up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %})
- [Fail Over from a Primary Cluster to a Standby Cluster]({% link {{ page.version.version }}/failover-replication.md %})
- [`CREATE VIRTUAL CLUSTER`]({% link {{ page.version.version }}/create-virtual-cluster.md %})