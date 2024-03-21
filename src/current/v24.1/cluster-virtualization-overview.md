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

This page gives an overview of _cluster virtualization_ in CockroachDB {{page.version.version}}. Cluster virtualization allows you to separate a cluster's _control plane_ from its _data plane_. The cluster's control plane manages cluster nodes and node-to-node traffic, while its data plane reads data from and writes data to the cluster's storage.

{{site.data.alerts.callout_success}}
Cluster virtualization is enabled automatically when you configure [Physical Cluster Replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}).
{{site.data.alerts.end}}

When cluster virtualization is disabled, the control plane and data plane are unified, and the `cockroach` process on a node handles all system and user activity, and manages the cluster's control plane and data plane. When cluster virtualization is enabled, the `cockroach` process on a node runs both a _system virtual cluster_ and one or more _virtual clusters_.

- The system virtual cluster manages the cluster's control plane. Administrative access to the system virtual cluster can be restricted. Certain low-level cluster settings can be modified only on the system virtual cluster.
- A virtual cluster manages its own data plane. Administrative access on a virtual cluster does not grant any access to the system virtual cluster. The effect of some settings is scoped to the virtual cluster rather than the system virtual cluster.

## Differences when cluster virtualization is enabled

When cluster virtualization is enabled, CockroachDB's behavior changes in several key areas, as described in the following sections. For details about working with a cluster with cluster virtualization enabled, refer to [Work with virtual clusters]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}).

### Connecting to a cluster

When cluster virtualization is enabled, by default when you connect using `cockroach sql` or the DB Console, you are connected to the virtual cluster. To connect to the system virtual cluster, you set `-ccluster=system` in the connection string (for SQL clients) or the DB Console URL. For details, refer to [Work with virtual clusters]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}#connecting-to-a-cluster).

{{site.data.alerts.callout_success}}
If a SQL user has been added to the system virtual cluster and one or more virtual clusters with the same username and password, that user can select which to connect to from the top of the DB Console.
{{site.data.alerts.end}}

### Cluster settings

When [cluster virtualization]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}) is enabled, each [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) has a scope, which may be the virtual cluster or the system virtual cluster.

- When a cluster setting is scoped to the virtual cluster, it affects only the virtual cluster and not the system virtual cluster. To configure a cluster setting that is scoped to the virtual cluster, you must have the `admin` role on the virtual cluster, and you must connect to the virtual cluster before configuring the setting. The majority of cluster settings are scoped to the virtual cluster and are visible only when connected to the virtual cluster.
- When a cluster setting is scoped to the system virtual cluster, it effects the entire storage cluster. To configure a cluster setting that is scoped to the system virtual cluster, you must have the `admin` role on the system virtual cluster, and you must connect to the system virtual cluster before configuring the setting. For example, the cluster setting `admission.disk_bandwidth_tokens.elastic.enabled` is scoped to the system virtual cluster.
- When a cluster setting is system-visible, it can be set only from the system virtual cluster but can be queried from any virtual cluster. For example, a virtual cluster can query a system-visible cluster setting's value, such as `storage.max_sync_duration`, to help adapt to the storage cluster's configuration.

For more details, including the scope of each cluster setting, refer to [Cluster Setting Scopes with Cluster Virtualization enabled]({% link {{ page.version.version }}/cluster-virtualization-setting-scopes.md %}).

### Security

By default, when connecting to a cluster using a SQL client or the DB Console, if a user does not specify whether to connect to a virtual cluster or the system virtual cluster, they are connected to the virtual cluster.

To grant access to the system virtual cluster, you must connect to the system virtual cluster as a user with the `admin` role, then grant the `admin` role to the SQL user. For details, refer to [Work with virtual clusters]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}#grant-access-to-the-system-virtual-cluster).

### Upgrades

When cluster virtualization is enabled to upgrade to a new major version, you must first replace the binary on each node and restart the node, [finalize] the upgrade on the system virtual cluster to upgrade it, then finalize the upgrade on the virtual cluster to upgrade it. This allows you to roll back an upgrade of the system virtual cluster without impacting schemas or data in virtual clusters. The system virtual cluster can be at most one major version ahead of virtual clusters. For example, a system virtual cluster on CockroachDB v24.1 can have virtual clusters on CockroachDB v23.2.

For details, refer to [Work with virtual clusters]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}#upgrade-a-cluster).

### Disaster recovery

When cluster virtualization is enabled, the default scope of [backup]({% link {{ page.version.version }}/backup.md %}) and [restore]({% link {{ page.version.version }}/restore.md %}) commands is the virtual cluster. This means that:

- A backup taken from a virtual cluster contains all data for that virtual cluster, but does not contain modifications made via the system virtual cluster such as system-level cluster settings.
- If your deployment contains system-level customizations, you can take a separate backup of the system virtual cluster to capture them.
- A backup of a virtual cluster can be restored as a virtual cluster in any storage cluster with cluster virtualization enabled.

For more details about backing up and restoring a cluster with cluster virtualization enabled, refer to [Work with virtual clusters]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}#disaster-recovery).

{{site.data.alerts.callout_success}}
For details about configuring and using Physical Cluster Replication for disaster recovery, refer to [Physical Cluster Replication Overview]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}).
{{site.data.alerts.end}}

### Observability

When cluster virtualization is enabled, cluster log messages are scoped to the virtual cluster or to the system virtual cluster, and are labeled accordingly. For example, this log message relates to a virtual cluster named `demo`:

~~~ none
I230815 19:31:07.290757 922 sql/temporary_schema.go:554 ⋮ [T4,demo,n1] 148  found 0 temporary schemas
~~~

Metrics are also scoped to the virtual cluster or to the system virtual cluster, and are labeled accordingly. All metrics are visible from the system virtual cluster, but metrics scoped to the system virtual cluster are not visible from a virtual cluster. Metrics related to SQL activity and jobs are visible only from the virtual cluster.

For example, in the output of the `_status/vars` HTTP endpoint on a cluster with a virtual cluster named `demo`, the metric `sql_txn_commit_count` is shown separately for the virtual cluster and the system virtual cluster:

~~~ none
sql_txn_commit_count{tenant="system"} 0
sql_txn_commit_count{tenant="demo"} 0
~~~

When connected to a virtual cluster from DB Console, most pages and views are scoped to the virtual cluster. By default the DB Console displays only metrics about that virtual cluster, and excludes metrics for other virtual clusters and the system virtual cluster. DB Console pages related to SQL activity and jobs are visible only from the virtual cluster.

Some pages and views are by default viewable only from the system virtual cluster, including those pertaining to overall cluster health. To allow the DB Console to display system-level metrics from within a virtual cluster, you can grant the virtual cluster the `can_view_node_info` permission.

For details, refer to [Work with virtual clusters]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}#observability)

{% comment %}
### SQL API

When cluster virtualization is enabled, certain low-level SQL APIs, such as (TODO: Which ones) are accessible only by those users with the `admin` role on the system virtual cluster, and not from virtual clusters.
{% endcomment %}

### Replication

[Replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}) can be configured only in a virtual cluster, and are not applicable to the `system` virtual cluster.

{% comment %}- Span config bounds can be set in a virtual cluster or in the system virtual cluster. Span config bounds set in the system virtual cluster override zone config settings that are set in a virtual cluster.{% endcomment %}

### Node draining

When cluster virtualization is enabled, [draining a node]({% link {{ page.version.version }}/node-shutdown.md %}#drain-a-node-manually) can cause a temporary SQL latency spike.

## See also

- [Work with virtual clusters]({% link {{ page.version.version }}/work-with-virtual-clusters.md %})
- [Cluster Setting Scopes]({% link {{ page.version.version }}/cluster-virtualization-setting-scopes.md %})
- [Cluster Metric Scopes]({% link {{ page.version.version }}/cluster-virtualization-metric-scopes.md %})
- [Physical Cluster Replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %})

## Known Limitations

In CockroachDB {{page.version.version}}, cluster virtualization has the following limitations:

- Creating virtual clusters without the intent of using them as either a physical cluster replication source or target is not yet supported.
- Currently, a single physical cluster can have a maximum of one system virtual cluster and one virtual cluster.
