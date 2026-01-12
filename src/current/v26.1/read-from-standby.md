---
title: Read from Standby
summary: Direct read-only queries to your standby cluster instead of your primary cluster.
toc: true
docs_area: manage
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

In addition to providing [failover]({% link {{ page.version.version }}/failover-replication.md %}) capabilities for [disaster recovery]({% link {{ page.version.version }}/disaster-recovery-overview.md %}), [**physical cluster replication (PCR)**]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) allows you to direct read-only queries to your standby cluster. This process offloads ad-hoc analytics query traffic from the primary cluster.

Use this page to understand how the _read from standby_ feature works and how to utilize it.

## How the read from standby feature works

PCR utilizes [cluster virtualization]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}) to separate a cluster's control plane from its data plane. A cluster always has one control plane, called a _system virtual cluster (system VC)_, and at least one data plane, called an _application virtual cluster (app VC)_. The standby cluster's system VC manages the PCR job and other cluster metadata, and is not used for application queries. All data tables, system tables, and cluster settings in the standby cluster's app VC are identical to the primary cluster's app VC. The standby cluster's app VC itself remains offline during replication.

When using read from standby, applications can read from the standby cluster, but they do not connect directly to the standby cluster's app VC. Instead, PCR introduces a _reader virtual cluster (reader VC)_. The reader VC ensures a clean, isolated environment specifically for serving read queries without interfering with replication or system metadata. It reads continuously from the standby cluster's app VC using internal pointers, providing access to the replicated data while keeping the app VC offline. The reader VC itself only stores a small amount of metadata and no user data, so it is not expected to take up additional storage space.

The standby cluster's reader VC has its own system tables and [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}). The reader VC replicates a subset of system tables, including **Users** and **Roles**, from the app VC, so that existing primary users can authenticate using the same [users and roles]({% link {{ page.version.version }}/security-reference/authorization.md %}) as on the primary cluster's app VC. Other system tables and cluster settings are set to defaults in the reader VC. For more information, consult [Physical Cluster Replication Technical Overview]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}).

In the event of failover, the reader VC is destroyed.

## Use the read from standby feature

{{ site.data.alerts.callout_info }}
The read from standby feature allows you to increase PCR standby cluster hardware utilization during replication. However, PCR's primary use case is disaster recovery, not workload isolation. If you need a workload isolation solution but do not need disaster recovery, deploy a single cluster and use [follower reads]({% link {{ page.version.version }}/follower-reads.md %}) instead.
{{ site.data.alerts.end }}

### Before you begin

Prior to setting up read from standby, ensure that:

- You have already configured PCR between a _primary_ cluster and a _standby_ cluster. For information on configuring PCR, refer to [Set Up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}).
- Your CockroachDB version is v24.3 or later. The `read from standby` option is not supported in earlier versions.

### Start a PCR stream with read from standby

To start a PCR stream that allows read access to the standby cluster, use the [`CREATE VIRTUAL CLUSTER ... REPLICATION`]({% link {{ page.version.version }}/create-virtual-cluster.md %}) statement with the `READ VIRTUAL CLUSTER` option:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE VIRTUAL CLUSTER main FROM REPLICATION OF main ON 'postgresql://{connection string to primary}' WITH READ VIRTUAL CLUSTER;
~~~

### Add read from standby to a PCR stream

To add read from standby capabilities to an existing PCR stream, use the [`ALTER VIRTUAL CLUSTER`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIRTUAL CLUSTER main SET REPLICATION READ VIRTUAL CLUSTER;
~~~

{{site.data.alerts.callout_info}}
The standby cluster's app VC must have a status of `replicating` before you can create your reader VC. Use the [`SHOW VIRTUAL CLUSTERS`]({% link {{ page.version.version }}/show-virtual-cluster.md %}) command to check the status of the app VC.
{{site.data.alerts.end}}

### Check the status of your reader virtual cluster

To confirm that your reader virtual cluster is active:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW VIRTUAL CLUSTERS;
~~~

The output shows a `standby-readonly` virtual cluster in addition to the system VC and app VC:

~~~
  id |       name       | data_state  | service_mode
-----+------------------+-------------+---------------
   1 | system           | ready       | shared
   3 | standby          | replicating | none
   4 | standby-readonly | ready       | shared
~~~

{{site.data.alerts.callout_info}}
The reader VC cannot serve reads until after the PCR initial scan is complete. After completing the initial scan, wait until the reader VC's `service_mode` is `shared`, then wait about one minute before connecting to the reader VC.
{{site.data.alerts.end}}

### Run read-only queries on the standby cluster

Once you have created a reader virtual cluster on the standby cluster, you can connect to it and run [read (`SELECT`) queries]({% link {{ page.version.version }}/selection-queries.md %}). For example:

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
- [Physical Cluster Replication Technical Overview]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %})
- [`CREATE VIRTUAL CLUSTER`]({% link {{ page.version.version }}/create-virtual-cluster.md %})
- [`ALTER VIRTUAL CLUSTER`]({% link {{ page.version.version }}/alter-virtual-cluster.md %})
- [`SHOW VIRTUAL CLUSTER`]({% link {{ page.version.version }}/show-virtual-cluster.md %})