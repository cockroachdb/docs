---
title: Work with virtual clusters
summary: Learn how to connect to and work with virtual clusters.
toc: true
docs_area: deploy
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

{% include_cached new-in.html version="v23.2" %} Enable [cluster virtualization]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}) in your CockroachDB cluster to set up a [**physical cluster replication (PCR)**]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) stream. This page is a guide to working with virtual clusters.

## Connect to a virtual cluster

This section shows how to use [SQL clients](#sql-clients) or the [DB Console](#db-console) to connect to a virtual cluster.

{% capture pcr_application_cluster_note %}
When [PCR]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) is enabled, the virtual cluster is named `main`.
{% endcapture %}

{{ pcr_application_cluster_note }}

### SQL clients

This section shows how to connect using [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}) when cluster virtualization is enabled.

Unless you specify which virtual cluster to connect to, when you connect using a SQL client, you are logged into the default virtual cluster. When [PCR]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) is enabled, the default virtual cluster is named `main`.

To connect to a specific virtual cluster, add the `GET` URL parameter `options=-ccluster={virtual_cluster_name}` to the connection URL. Replace `{virtual_cluster_name}` with the name of the virtual cluster. You must use `--url` rather than `--host`.

For example:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach sql --url \
"postgresql://root@{node IP or hostname}:26257?options=-ccluster={virtual_cluster_name}&sslmode=verify-full" \
--certs-dir "certs"
~~~

Replace:

- `{node IP or hostname}`: the IP or hostname of a cluster node.
- `{virtual_cluster_name}`: the name of a virtual cluster.
- `{certs_dir}`: The directory containing the cluster's certificates.


#### Connect to the system virtual cluster

{{site.data.alerts.callout_info}}
You should only connect to the system virtual cluster for cluster administration and to manage PCR. To work with databases, tables, or workloads, connect to a virtual cluster.
{{site.data.alerts.end}}

To connect to the system virtual cluster, pass the `options=-ccluster=system` parameter in the URL. You must have the `admin` role on the system virtual cluster.

For example, to connect to the system virtual cluster using the `cockroach sql` command:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach sql --url \
"postgresql://root@{node IP or hostname}:26257?options=-ccluster=system&sslmode=verify-full" \
--certs-dir "certs"
~~~

### DB Console

This section shows how to connect using the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) when cluster virtualization is enabled.

Unless you specify which virtual cluster to connect to, when you connect using the DB Console, you are logged into the default virtual cluster. When [PCR]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) is enabled, the default virtual cluster is named `main`. In order to view metrics on [replication lag]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}) for a PCR job, connect to the standby cluster's DB Console.

To connect to a specific virtual cluster, add the `GET` URL parameter `options=-ccluster={virtual_cluster_name}` to the DB Console URL. Replace `{virtual_cluster_name}` with the name of the virtual cluster.

If the same SQL user has the `admin` role on the system virtual cluster and also has roles on other virtual clusters, that user can switch among them from the top of the DB Console.

#### Connect to the system virtual cluster

{{site.data.alerts.callout_info}}
You should only connect to the system virtual cluster for cluster administration. To work with databases, tables, or workloads, connect to a virtual cluster.
{{site.data.alerts.end}}

To connect to the system virtual cluster using the DB Console, add the `GET` URL parameter `options=-ccluster=system` to the DB Console URL.

## Grant access to the system virtual cluster

To [grant]({% link {{ page.version.version }}/grant.md %}) access to the system virtual cluster, you must connect to the system virtual cluster as a user with the `admin` role, then grant either of the following to the SQL user:

- The `admin` [role]({% link {{page.version.version}}/security-reference/authorization.md %}#admin-role) grants the ability to read and modify system tables and cluster settings on any virtual cluster, including the system virtual cluster.
- The `VIEWSYSTEMDATA` [system privilege]({% link {{page.version.version}}/security-reference/authorization.md %}#supported-privileges) grants the ability to read system tables and cluster settings on any virtual cluster, including the system virtual cluster.

To prevent unauthorized access, you should limit the users with access to the system virtual cluster.

## Observability

When cluster virtualization is enabled, cluster log entries and metrics are scoped to a virtual cluster or to the system virtual cluster.

### View cluster logs with cluster virtualization enabled

When cluster virtualization is enabled, each cluster log is labeled with the name of the virtual cluster that generated it, including the system virtual cluster. For example, this log message relates to a virtual cluster named `demo`:

~~~ none
I230815 19:31:07.290757 922 sql/temporary_schema.go:554 ⋮ [T4,demo,n1] 148  found 0 temporary schemas
~~~

### Work with metrics with cluster virtualization enabled

When cluster virtualization is enabled, metrics are also scoped to a virtual cluster or to the system virtual cluster, and are labeled accordingly. All metrics are visible from the system virtual cluster, but metrics scoped to the system virtual cluster are not visible from a virtual cluster. Metrics related to SQL activity and jobs are visible only from a virtual cluster.

For example, in the output of the `_status/vars` HTTP endpoint on a cluster with a virtual cluster named `demo`, the metric `sql_txn_commit_count` is shown separately for the `demo` virtual cluster and the system virtual cluster:

~~~ none
sql_txn_commit_count{tenant="system"} 0
sql_txn_commit_count{tenant="demo"} 0
~~~

When connected to a virtual cluster from the DB Console, metrics which measure SQL and related activity show data scoped to the virtual cluster. All other metrics are collected system-wide and display the same data on all virtual clusters including the system virtual cluster.

## Disaster recovery

When cluster virtualization is enabled, [backup]({% link {{ page.version.version }}/backup.md %}) and [restore]({% link {{ page.version.version }}/restore.md %}) commands are scoped to the virtual cluster by default.

### Back up a virtual cluster

To back up a virtual cluster:

1. [Connect to the virtual cluster](#connect-to-a-virtual-cluster) you want to back up as a user with the `admin` role on the virtual cluster.
1. [Back up the cluster]({% link {{ page.version.version }}/backup.md %}). Only the virtual cluster's data and settings are included in the backup, and data and settings for other virtual clusters or for the system virtual cluster is omitted.

For details about restoring a backup of a virtual cluster, refer to [Restore a virtual cluster](#restore-a-virtual-cluster).

### Back up the entire cluster

To back up the entire CockroachDB cluster, including all virtual clusters and the system virtual cluster:

1. [Connect to the system virtual cluster](#connect-to-the-system-virtual-cluster) as a user with the `admin` role on the system virtual cluster.
1. [Back up the cluster]({% link {{ page.version.version }}/backup.md %}), and include the `INCLUDE_ALL_SECONDARY_TENANTS` flag in the `BACKUP` command. All virtual clusters and the system virtual cluster are included in the backup.

### Restore a virtual cluster

You can restore a backup of a virtual cluster to:

- The original virtual cluster on the original CockroachDB cluster.
- A different virtual cluster on the original CockroachDB cluster.
- A different virtual cluster on a different CockroachDB cluster with cluster virtualization enabled.

To restore only a virtual cluster:

1. [Connect to the destination virtual cluster](#connect-to-a-virtual-cluster) as a user with the `admin` role on the virtual cluster.
1. [Restore the cluster]({% link {{ page.version.version }}/restore.md %}). Only the virtual cluster's data and settings are restored.

### Restore the entire cluster

To restore the entire CockroachDB cluster, including all virtual clusters and the system virtual cluster:

1. [Connect to the destination system virtual cluster](#connect-to-the-system-virtual-cluster) as a user with the `admin` role on the system virtual cluster.
1. [Restore the cluster]({% link {{ page.version.version }}/restore.md %}) from a backup that included the the `INCLUDE_ALL_SECONDARY_VIRTUAL_CLUSTERS` flag. All virtual clusters and the system virtual cluster are restored.

## Configure cluster settings

When [cluster virtualization]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}) is enabled, each [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) is scoped to either a virtual cluster or the system virtual cluster.

- When a cluster setting is scoped to a virtual cluster, it affects only the virtual cluster and not the system virtual cluster. To configure a cluster setting that is scoped to a virtual cluster, you must have the `admin` role on the virtual cluster, and you must connect to the virtual cluster before configuring the setting. The majority of cluster settings are scoped to a virtual cluster and are visible only when connected to it.
- When a cluster setting is scoped to the system virtual cluster, it affects the entire CockroachDB cluster. To configure a cluster setting that is scoped to the system virtual cluster, you must have the `admin` role on the system virtual cluster, and you must connect to the system virtual cluster before configuring the setting.
- When a cluster setting is system-visible, it can be set only from the system virtual cluster but can be queried from any virtual cluster. For example, a virtual cluster can query a system-visible cluster setting's value to help adapt to the CockroachDB cluster's configuration.

For more details, including the scope of each cluster setting, refer to [Cluster Setting Scopes with Cluster Virtualization enabled]({% link {{ page.version.version }}/cluster-virtualization-setting-scopes.md %}).

## Upgrade a cluster

To upgrade to a new major version when cluster virtualization is enabled , you must:

1. Replace the binary on each node and restart the node.
1. [Finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#step-6-finish-the-upgrade) the upgrade on the system virtual cluster to upgrade it, or roll back the upgrade if you decide not to finalize it. Until it is finalized, the cluster still operates in compatibility with the previous major version, and virtual clusters cannot be upgraded.
1. After the system virtual cluster is finalized, finalize the upgrade on a virtual cluster to upgrade it, or roll back the upgrade if you decide not to finalize it. Until it is finalized, a virtual cluster still operates in compatibility with the previous major version, and some features may not be available on the virtual cluster.

This allows you to roll back an upgrade of the system virtual cluster without impacting schemas or data in virtual clusters. The system virtual cluster can be at most one major version ahead of virtual clusters. For example, a system virtual cluster on CockroachDB v24.1 can have virtual clusters on CockroachDB v23.2.

{{site.data.alerts.callout_info}}
The `preserve_downgrade_option` cluster setting is scoped to a virtual cluster. To prevent automatic finalization of the upgrade, you must set it to `false` both in the virtual cluster and in the system virtual cluster.
{{site.data.alerts.end}}

To apply a patch-version upgrade, you must replace the binary on each node and restart the node. Finalization is not required.

## See also

- [Cluster Virtualization Overview]({% link {{ page.version.version }}/cluster-virtualization-overview.md %})
- [Cluster Setting Scopes]({% link {{ page.version.version }}/cluster-virtualization-setting-scopes.md %})
- [Cluster Metric Scopes]({% link {{ page.version.version }}/cluster-virtualization-metric-scopes.md %})
- [Physical Cluster Replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %})
