---
title: Read from Standby
summary: Direct read-only queries to your standby cluster instead of your primary cluster.
toc: true
docs_area: manage
---

In addition to providing [failover]({% link {{ page.version.version }}/failover-replication.md %}) capabilities for disaster recovery, [**physical cluster replication (PCR)**]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) allows you to direct read-only queries to your standby cluster. This process offloads traffic such as application reads, analytics queries, and ad-hoc reporting from the primary cluster.

Use this page to understand how the _read from standby_ feature works and how to utilize it.

## How the read from standby feature works

PCR utilizes [cluster virtualization]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}) to separate a cluster's control plane from its data plane. A cluster always has one control plane, called a _system virtual cluster (SystemVC)_, and at least one data plane, called an _App Virtual Cluster (AppVC)_. The standby cluster's SystemVC manages the PCR job and other cluster metadata, and is not used for application queries. All data tables, system tables, and cluster settings in the standby cluster's AppVC are identical to the primary cluster's AppVC. The standby cluster's AppVC itself remains offline during replication.

When using read from standby, applications can read from the standby cluster, but they do not connect directly to the standby cluster's AppVC. Instead, PCR introduces a _reader virtual cluster (ReaderVC)_. The ReaderVC ensures a clean, isolated environment specifically for serving read queries without interfering with replication or system metadata. It reads continuously from the standby cluster's AppVC using internal pointers, providing access to the replicated data while keeping the AppVC offline. The ReaderVC itself only stores a small amount of metadata and no user data, so it is not expected to take up additional storage space.

The standby cluster's ReaderVC has its own system tables and cluster settings. The ReaderVC replicates a subset of system tables, including **Users** and **Roles**, from the AppVC, so that existing primary users can authenticate using the same users and roles as on the primary cluster's AppVC. Other system tables and cluster settings are set to defaults in the ReaderVC.

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

{{site.data.alerts.callout_info}}
The standby cluster's AppVC must have a status of `replicating` before you can create your ReaderVC. Use the `SHOW VIRTUAL CLUSTERS` command to check the status of the AppVC.
{{site.data.alerts.end}}

### Check the status of your reader virtual cluster

To confirm that your reader virtual cluster is active:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW VIRTUAL CLUSTERS;
~~~

The output shows a `standby-readonly` virtual cluster in addition to the systemVC and AppVC:

~~~
  id |       name       | data_state  | service_mode
-----+------------------+-------------+---------------
   1 | system           | ready       | shared
   3 | standby          | replicating | none
   4 | standby-readonly | ready       | shared
~~~

{{site.data.alerts.callout_info}}
The ReaderVC cannot serve reads until after the PCR initial scan is complete. After completing the initial scan, wait until the ReaderVC's `service_mode` is `shared`, then wait about one minute before connecting to the ReaderVC.
{{site.data.alerts.end}}

### Run read-only queries on the standby cluster

Once you have created a reader virtual cluster on the standby cluster, you can connect to it and run read (`SELECT`) queries. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT COUNT(*) FROM customers;
SELECT region, SUM(amount) FROM orders GROUP BY region;
~~~

The results of queries on the standby cluster reflect the state of the primary cluster as of a historical time that approaches the [replicated time]({% link {{ page.version.version }}/show-virtual-cluster.md %}#show-replication-status).

{{ site.data.alerts.callout_info }}
Write operations are not permitted on the standby cluster.
{{ site.data.alerts.end }}

## See also
- [Set Up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %})
- [Fail Over from a Primary Cluster to a Standby Cluster]({% link {{ page.version.version }}/failover-replication.md %})
- [`CREATE VIRTUAL CLUSTER`]({% link {{ page.version.version }}/create-virtual-cluster.md %})