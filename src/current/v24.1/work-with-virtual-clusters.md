---
title: Work with virtual clusters
summary: Learn how to connect to and work with virtual clusters.
toc: true
docs_area: deploy
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}

Refer to the [Cluster Virtualization Overview]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}#known-limitations) for further detail.
{{site.data.alerts.end}}

This page shows how to work with a cluster with [cluster virtualization]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}).

## Connect to a virtual cluster

This section shows how to use SQL clients or the DB Console to connect to a virtual cluster.

{% capture pcr_application_cluster_note %}
{{site.data.alerts.callout_success}}
When [Physical Cluster Replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) is enabled, the default virtual cluster is named `application`.
{{site.data.alerts.end}}
{% endcapture %}

{{ pcr_application_cluster_note }}

### DB Console

This section shows how to connect using DB Console when cluster virtualization is enabled.

{{site.data.alerts.callout_success}}
If the same SQL user has the `admin` role on the system virtual cluster and also has roles other virtual clusters, that user can switch among them from the top of the DB Console.
{{site.data.alerts.end}}

Unless you specify which virtual cluster to connect to, when you connect using the DB Console, you are logged into the default virtual cluster. When [Physical Cluster Replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) is enabled, the default virtual cluster is named `application`.

To connect to a specific virtual cluster, add the `GET` URL parameter `options=-ccluster={virtual_cluster_name}` to the DB Console URL. Replace `{virtual_cluster_name}` with the name of the virtual cluster.

{{site.data.alerts.callout_success}}
When connecting to the default virtual cluster, you can optionally include `options=-ccluster={virtual_cluster_name}` in the DB Console URL so that the intention to connect to a specific virtual cluster is more clear.
{{site.data.alerts.end}}

#### Connect to the system virtual cluster

{{site.data.alerts.callout_info}}
You should only connect to the system virtual cluster for cluster administration. To work with databases, tables, or workloads, connect to a virtual cluster.
{{site.data.alerts.end}}

To connect to the system virtual cluster using the DB Console, add the `GET` URL parameter `options=-ccluster=system` to the DB Console URL.

### SQL clients

This section shows how to connect using `cockroach sql` when cluster virtualization is enabled.

Unless you specify which virtual cluster to connect to, when you connect using a SQL client, you are logged into the default virtual cluster. When [Physical Cluster Replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) is enabled, the default virtual cluster is named `application`.

To connect to a specific virtual cluster, add the `GET` URL parameter `options=-ccluster={virtual_cluster_name}` to the connection URL. Replace `{virtual_cluster_name}` with the name of the virtual cluster. You must use `--url` rather than `--host`.

For example:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach sql --url \
"postgresql://root@{node IP or hostname}:26257/?options=-optionsl=-ccluster={virtual_cluster_name}&sslmode=verify-full" \
--certs-dir "certs"
~~~

Replace:

- `{node IP or hostname}`: the IP or hostname of a cluster node.
- `{virtual_cluster_name}`: the name of the virtual cluster.
- `{certs_dir}`: The directory containing the cluster's certificates.

{{site.data.alerts.callout_success}}
When connecting to the default virtual cluster, you can optionally include `options=-ccluster={virtual_cluster_name}` in the connection string so that the intention to connect to a specific virtual cluster is more clear.
{{site.data.alerts.end}}

#### Connect to the system virtual cluster

{{site.data.alerts.callout_info}}
You should only connect to the system virtual cluster for cluster administration. To work with databases, tables, or workloads, connect to a virtual cluster.
{{site.data.alerts.end}}

To connect to the system virtual cluster, pass the `options=-ccluster=system` parameter in the URL. You must have the `admin` role on the system virtual cluster.

For example, to connect to the system virtual cluster using the `cockroach sql` command:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach sql --url \
"postgresql://root@{node IP or hostname}:26257/?options=-ccluster=system&sslmode=verify-full" \
--certs-dir "certs"
~~~

## Grant access to the system virtual cluster

To grant access to the system virtual cluster, you must connect to the system virtual cluster as a user with the `admin` role, then grant either of the following to the SQL user:

- The `admin` [role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) grants the ability to read and modify system tables and cluster settings on any virtual cluster, including the system virtual cluster.
- The `VIEWSYSTEMDATA` [system privilege]({% link v24.1/security-reference/authorization.md %}#supported-privileges) grants the ability to read system tables and cluster settings on any virtual cluster, including the system virtual cluster.

{{site.data.alerts.callout_info}}
To prevent unauthorized access, you should limit the users with access to the system virtual cluster.
{{site.data.alerts.end}}

## Observability

When cluster virtualization is enabled, cluster log entries and metrics are scoped to a virtual cluster or to the system virtual cluster.

### View cluster logs with cluster virtualization enabled

When cluster virtualization is enabled, each cluster log is labeled with the name of the virtual cluster that generated it, including the system virtual cluster. For example, this log message relates to a virtual cluster named `demo`:

~~~ none
I230815 19:31:07.290757 922 sql/temporary_schema.go:554 ⋮ [T4,demo,n1] 148  found 0 temporary schemas
~~~

### Work with metrics with cluster virtualization enabled

Metrics are also scoped to the virtual cluster or to the system virtual cluster, and are labeled accordingly. All metrics are visible from the system virtual cluster, but metrics scoped to the system virtual cluster are not visible from a virtual cluster. Metrics related to SQL activity and jobs are visible only from the virtual cluster.

For example, in the output of the `_status/vars` HTTP endpoint on a cluster with a virtual cluster named `demo`, the metric `sql_txn_commit_count` is shown separately for the virtual cluster and the system virtual cluster:

~~~ none
sql_txn_commit_count{tenant="system"} 0
sql_txn_commit_count{tenant="demo"} 0
~~~

When connected to a virtual cluster from DB Console, most pages and views are scoped to the virtual cluster. By default the DB Console displays only metrics about that virtual cluster, and excludes metrics for other virtual clusters and the system virtual cluster. DB Console pages related to SQL activity and jobs are visible only from the virtual cluster.

Some pages and views are by default viewable only from the system virtual cluster, including those pertaining to overall cluster health. To allow the DB Console to display system-level metrics from within a virtual cluster, you can grant the virtual cluster the `can_view_node_info` permission.

## Disaster recovery

When cluster virtualization is enabled, the default scope of [backup]({% link {{ page.version.version }}/backup.md %}) and [restore]({% link {{ page.version.version }}/restore.md %}) commands is the virtual cluster.

### Back up a virtual cluster

To back up a virtual cluster:

1. [Connect to the virtual cluster](#connect-to-a-virtual-cluster) as a user with the `admin` role on the virtual cluster.
1. [Back up the cluster]({% link {{ page.version.version }}/backup.md %}). Only the virtual cluster's data and settings are included in the backup, and data and settings for other virtual clusters or for the system virtual cluster is omitted.

{{site.data.alerts.callout_success}}
A virtual cluster can be [restored](#restore-a-virtual-cluster) to the original virtual cluster on the original storage cluster, a different virtual cluster on the original storage cluster, or a different virtual cluster on a different storage cluster with cluster virtualization enabled.
{{site.data.alerts.end}}

### Back up the entire cluster

To back up the entire storage cluster, including all virtual clusters and the system virtual cluster:

1. [Connect to the system virtual cluster](#connect-to-the-system-virtual-cluster) as a user with the `admin` role on the system virtual cluster.
1. [Back up the cluster]({% link {{ page.version.version }}/backup.md %}), and include the `INCLUDE_ALL_SECONDARY_TENANTS` flag in the `BACKUP` command. All virtual clusters and the system virtual cluster are included in the backup.

### Restore a virtual cluster

{{site.data.alerts.callout_success}}
A virtual cluster can be restored to the original virtual cluster on the original storage cluster, a different virtual cluster on the original storage cluster, or a different virtual cluster on a different storage cluster with cluster virtualization enabled.
{{site.data.alerts.end}}

To restore only a single virtual cluster:

1. [Connect to the destination virtual cluster](#connect-to-a-virtual-cluster) as a user with the `admin` role on the virtual cluster.
1. [Restore the cluster]({% link {{ page.version.version }}/restore.md %}). Only the virtual cluster's data and settings are restored.

### Restore the entire cluster

To restore the entire storage cluster, including all virtual clusters and the system virtual cluster:

1. [Connect to the destination system virtual cluster](#connect-to-the-system-virtual-cluster) as a user with the `admin` role on the system virtual cluster.
1. [Restore the cluster]({% link {{ page.version.version }}/restore.md %}) from a backup that included the the `INCLUDE_ALL_SECONDARY_VIRTUAL_CLUSTERS` flag. All virtual clusters and the system virtual cluster are restored.

### Cluster logs

When cluster virtualization is enabled, cluster log messages for the system virtual cluster and each virtual cluster are labeled according to the cluster they are associated with.

### SQL API

When cluster virtualization is enabled, certain low-level SQL APIs (TODO: Which ones) are accessible only by a virtual cluster's cluster administrators, and not by other cluster users.

### Span Config Bounds

- Span config bounds can be set at the overall cluster level or in the system virtual cluster. Span config bounds set in the system virtual cluster override zone config settings that are set in a virtual cluster.
- Zone configs can be set only in a virtual cluster, but span config bounds set in the system virtual cluster override zone config settings that are set in a virtual cluster.

### DB Console

In the DB Console, users with access to both the system virtual cluster and virtual clusters can select which cluster to connect to.

Some pages and views are only viewable from the system virtual cluster, including those pertaining to overall cluster health.

When connected to a virtual cluster, most pages and views are scoped to the virtual cluster. by default the DB Console displays only metrics about that virtual cluster, and excludes metrics for other virtual clusters and the system virtual cluster. To allow the DB Console to display system-level metrics from within a virtual cluster, you can grant the virtual cluster the `can_view_node_info` permission.

## Configure cluster settings

When [cluster virtualization]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}) is enabled, each [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) has a scope, which may be the virtual cluster or the system virtual cluster.

- When a cluster setting is scoped to the virtual cluster, it affects only the virtual cluster and not the system virtual cluster. To configure a cluster setting that is scoped to the virtual cluster, you must have the `admin` role on the virtual cluster, and you must connect to the virtual cluster before configuring the setting. The majority of cluster settings are scoped to the virtual cluster and are visible only when connected to the virtual cluster.
- When a cluster setting is scoped to the system virtual cluster, it effects the entire storage cluster. To configure a cluster setting that is scoped to the system virtual cluster, you must have the `admin` role on the system virtual cluster, and you must connect to the system virtual cluster before configuring the setting.
- When a cluster setting is system-visible, it can be set only from the system virtual cluster but can be queried from any virtual cluster. For example, virtual cluster can query a system-visible cluster setting's value to help adapt to the storage cluster's configuration.

For more details, including the scope of each cluster setting, refer to [Cluster Setting Scopes with Cluster Virtualization enabled]({% link {{ page.version.version }}/cluster-virtualization-setting-scopes.md %}).

## Upgrade a cluster

When cluster virtualization is enabled to upgrade to a new major version, you must:

1. Replace the binary on each node and restart the node.
1. [Finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#step-6-finish-the-upgrade) the upgrade on the system virtual cluster to upgrade it, or roll back the upgrade if you decide not to finalize it. Until it is finalized, the cluster still operates in compatibility with the previous major version, and virtual clusters cannot be upgraded.
1. After the system virtual cluster is finalized, finalize the upgrade on the virtual cluster to upgrade it, or roll it back if you decide not to finalize it. Until it is finalized, the virtual cluster still operates in compatibility with the previous major version, some features may not be available on the virtual cluster.

This allows you to roll back an upgrade of the system virtual cluster without impacting schemas or data in virtual clusters. The system virtual cluster can be at most one major version ahead of virtual clusters. For example, a system virtual cluster on CockroachDB v24.1 can have virtual clusters on CockroachDB v23.2.

{{site.data.alerts.callout_info}}
The `preserve_downgrade_option` cluster setting is scoped to the virtual cluster. To prevent automatic finalization of the upgrade, you must set it to `false` both in the virtual cluster and in the system virtual cluster.
{{site.data.alerts.end}}

To apply a patch-version upgrade, you must only replace the binary on each node and restart the node. Finalization is not required.

- Cluster virtualization is supported only for [Physical Cluster Replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}). General-purpose virtual clusters are not supported.
- A single physical cluster can have a maximum of one system virtual cluster and one virtual cluster.

## See also

- [Cluster Virtualization Overview]({% link {{ page.version.version }}/cluster-virtualization-overview.md %})
- [Cluster Setting Scopes]({% link {{ page.version.version }}/cluster-virtualization-setting-scopes.md %})
- [Cluster Metric Scopes]({% link {{ page.version.version }}/cluster-virtualization-metric-scopes.md %})
- [Physical Cluster Replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %})

## Known Limitations

In CockroachDB {{page.version.version}}, cluster virtualization has the following limitations:

- Cluster virtualization is supported only for [Physical Cluster Replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}). General-purpose virtual clusters are not supported.
- A single physical cluster can have a maximum of one system virtual cluster and one virtual cluster.
