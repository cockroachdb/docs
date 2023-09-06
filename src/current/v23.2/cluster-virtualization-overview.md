---
title: Cluster Virtualization Overview
summary: Learn more about cluster virtualization and how it facilities cluster-to-cluster replication.
toc: true
docs_area: deploy
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}

Refer to the [Known Limitations](#known-limitations) section for further detail.
{{site.data.alerts.end}}

This page gives an overview of _cluster virtualization_ in CockroachDB {{page.version.version}}. Cluster virtualization allows you to separate a cluster's _control plane_ from its _data plane_. The cluster's control plane manages cluster nodes and node-to-node traffic, while its data plane reads and writes data to the cluster's storage.

{{site.data.alerts.callout_success}}
Cluster virtualization is enabled automatically when you configure [Physical Cluster Replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}). This is the only situation where cluster virtualization is supported in production.
{{site.data.alerts.end}}

When cluster virtualization is disabled, the `cockroach` process on a node runs a single cluster that handles all system and user activity, and manages the cluster's control plane and data plane. When cluster virtualization is enabled, the `cockroach` process on a node runs both a _system interface_ and one or more _virtual clusters_.

- The system interface manages the cluster's control plane. Administrative access to the system interface can be restricted. Certain low-level cluster settings can be modified only on the system interface.
- One or more virtual clusters manage their own data plane. Administrative access on a virtual cluster does not grant any access to the system interface. The effect of some settings is scoped to the virtual cluster rather than the system interface.

## Differences when cluster virtualization is enabled

When cluster virtualization is enabled, CockroachDB's behavior changes in several key areas, as described in the following sections. For details about working with a cluster with cluster virtualization enabled, refer to [Work with virtual clusters]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}).

### Connecting to a cluster

When cluster virtualization is enabled, by default when you connect using `cockroach sql` or the DB Console, you are connected to the virtual cluster. To connect to the system interface, you set `-ccluster=system` in the connection string (for SQL clients) or the DB Console URL. For details, refer to [Work with virtual clusters]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}#connecting-to-a-cluster).

{{site.data.alerts.callout_success}}
If the same SQL user has the `admin` role on the system interface and also has roles in the virtual cluster, that user can switch between them from the top of the DB Console.
{{site.data.alerts.end}}

### Cluster settings

When [cluster virtualization]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}) is enabled, each [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) has a scope, which may be the virtual cluster or the system interface.

- When a cluster setting is scoped to the virtual cluster, it affects only the virtual cluster and not the system interface. To configure a cluster setting that is scoped to the virtual cluster, you must have the `admin` role on the virtual cluster, and you must connect to the virtual cluster before configuring the setting. The majority of cluster settings are scoped to the virtual cluster and are visible only when connected to the virtual cluster.
- When a cluster setting is scoped to the system interface, it effects the entire storage cluster. To configure a cluster setting that is scoped to the system interface, you must have the `admin` role on the system interface, and you must connect to the system interface before configuring the setting.
- When a cluster setting is system-visible, it can be set only from the system interface but can be queried from any virtual cluster. For example, virtual cluster can query a system-visible cluster setting's value to help adapt to the storage cluster's configuration.

For more details, including the scope of each cluster setting, refer to [Cluster Setting Scopes with Cluster Virtualization enabled]({% link {{ page.version.version }}/cluster-virtualization-setting-scopes.md %}).

### Security

By default, when connecting to a cluster using a SQL client or the DB Console, if a user does not specify whether to connect to a virtual cluster or the system interface, they are connected to the virtual cluster.

To grant access to the system interface, you must connect to the system interface as a user with the `admin` role, then grant the `admin` role to the SQL user. For details, refer to [Work with virtual clusters]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}#grant-access-to-the-system-interface).

### Upgrades

When cluster virtualization is enabled to upgrade to a new major version, you must first replace the binary on each node and restart the node, [finalize] the upgrade on the system interface to upgrade it, then finalize the upgrade on the virtual cluster to upgrade it. This allows you to roll back an upgrade of the system interface without impacting schemas or data in virtual clusters. The system interface can be at most one major version ahead of virtual clusters. For example, when v24.1 is released, a system interface on CockroachDB v24.1 can have virtual clusters on CockroachDB v23.2.

For details, refer to [Work with virtual clusters]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}#upgrade-a-cluster).

### Disaster recovery

When cluster virtualization is enabled, the default scope of [backup]({% link {{ page.version.version }}/backup.md %}) and [restore]({% link {{ page.version.version }}/restore.md %}) commands is the virtual cluster. This means that:

- By default, backups taken from a virtual cluster contain only data for that virtual cluster, not the system interface.
- To back up the entire cluster, you must connect to the system interface to run the backup and include the `INCLUDE_ALL_SECONDARY_TENANTS` flag.
- A backup of a virtual cluster can be restored as a virtual cluster in any storage cluster with cluster virtualization enabled.

For more details about backing up and restoring a cluster with cluster virtualization enabled, refer to [Work with virtual clusters]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}#disaster-recovery).

{{site.data.alerts.callout_success}}
For details about configuring and using Physical Cluster Replication for disaster recovery, refer to [Physical Cluster Replication Overview]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}).
{{site.data.alerts.end}}

### Observability

When cluster virtualization is enabled, cluster log messages and metrics are scoped to the virtual cluster or to the system interface, and are labeled accordingly.

When connected to a virtual cluster, most pages and views are scoped to the virtual cluster. By default the DB Console displays only metrics about that virtual cluster, and excludes metrics for other virtual clusters and the system interface. To allow the DB Console to display system-level metrics from within a virtual cluster, you can grant the virtual cluster the `can_view_node_info` permission.

Some pages and views are only viewable from the system interface, including those pertaining to overall cluster health.

For details, refer to [Work with virtual clusters]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}#observability)

### SQL API

When cluster virtualization is enabled, certain low-level SQL APIs (TODO: Which ones) are accessible only by those users with the `admin` role on the system interface, and not from virtual clusters.

### Span Config Bounds

- Span config bounds can be set in a virtual cluster or in the system interface. Span config bounds set in the system interface override zone config settings that are set in a virtual cluster.
- Zone configs can be set only in a virtual cluster, but span config bounds set in the system interface override zone configs that are set in a virtual cluster.

## See also

- [Work with virtual clusters]({% link {{ page.version.version }}/work-with-virtual-clusters.md %})
- [Cluster Setting Scopes]({% link {{ page.version.version }}/cluster-virtualization-setting-scopes.md %})
- [Cluster Metric Scopes]({% link {{ page.version.version }}/cluster-virtualization-metric-scopes.md %})
- [Physical Cluster Replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %})

## Known Limitations

In CockroachDB {{page.version.version}}, cluster virtualization has the following limitations:

- Cluster virtualization is supported only for [Physical Cluster Replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}). General-purpose virtual clusters are not supported.
- A single physical cluster can have a maximum of one system interface and one virtual cluster.
