---
title: Work with virtual clusters
summary: Learn how to connect to and work with virtual clusters.
toc: true
docs_area: deploy
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

Enable [cluster virtualization]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}) in your CockroachDB cluster to set up a [**physical cluster replication (PCR)**]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) stream. This page is a guide to working with virtual clusters.

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

For example, in the output of the [Prometheus endpoint]({% link {{ page.version.version }}/prometheus-endpoint.md %}) on a cluster with a virtual cluster named `demo`, the metric `sql_txn_commit_count` is shown separately for the `demo` virtual cluster and the system virtual cluster:

~~~ none
sql_txn_commit_count{tenant="system"} 0
sql_txn_commit_count{tenant="demo"} 0
~~~

When connected to a virtual cluster from the DB Console, metrics which measure SQL and related activity show data scoped to the virtual cluster. All other metrics are collected system-wide and display the same data on all virtual clusters including the system virtual cluster.

## Backup and restore

Cockroach Labs recommends regularly [backing up]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#full-backups) your data. When using virtual clusters, perform backups on the _application virtual cluster (app VC)_. Only the app VC's data is included in these backups. Data from other virtual clusters or the _system virtual cluster (system VC)_ is omitted. You can also back up your system VC to preserve its metadata, although this data is usually not critical.

### Create a backup schedule for your app VC

Cockroach Labs recommends using [backup schedules]({% link {{ page.version.version }}/create-schedule-for-backup.md %}) to automate full and incremental backups of your data.

Follow these steps to create a backup schedule for your app VC. In this example, the schedule takes an incremental backup every day at midnight, and a full backup weekly. Consult [CREATE SCHEDULE FOR BACKUP]({% link {{ page.version.version }}/create-schedule-for-backup.md %}#parameters) for a full list of backup schedule options.

1. [Connect](#connect-to-a-virtual-cluster) to the app VC as a user with the [required privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges). In this example, the user has the `BACKUP` privilege.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url \
    "postgresql://root@{primary node IP or hostname}:26257?options=-ccluster={app_virtual_cluster_name}&sslmode=verify-full" \
    --certs-dir "certs"
    ~~~

1. [Create a backup schedule]({% link {{ page.version.version }}/create-schedule-for-backup.md %}#create-a-scheduled-backup-for-a-cluster). This example is for a cluster-level backup:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE SCHEDULE schedule_label
    FOR BACKUP INTO 's3://test/backups/schedule_test?AWS_ACCESS_KEY_ID={aws_access_key_id}&AWS_SECRET_ACCESS_KEY={aws_secret_access_key}'
        RECURRING '@daily';
    ~~~

    ~~~
        schedule_id     |     name       |                     status                     |            first_run             | schedule |                                                                               backup_stmt
    ---------------------+----------------+------------------------------------------------+----------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------------------
      588796190000218113 | schedule_label | PAUSED: Waiting for initial backup to complete | NULL                             | @daily   | BACKUP INTO LATEST IN 's3://test/schedule-test?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x', detached
      588796190012702721 | schedule_label | ACTIVE                                         | 2020-09-10 16:52:17.280821+00:00 | @weekly  | BACKUP INTO 's3://test/schedule-test?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x', detached
    (2 rows)
    ~~~

    {% include {{ page.version.version }}/backups/backup-storage-collision.md %}

For information on scheduling backups at different levels or with other options, consult [CREATE SCHEDULE FOR BACKUP]({% link {{ page.version.version }}/create-schedule-for-backup.md %}).

### Take a one-off backup of your app VC

Follow these steps to take a one-off full backup of your app VC. Even if you use backup schedules, taking a one-off backup can be useful for creating a separate copy.

1. [Connect](#connect-to-a-virtual-cluster) to the app VC as a user with the [required privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges). In this example, the user has the `BACKUP` privilege.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url \
    "postgresql://root@{primary node IP or hostname}:26257?options=-ccluster={app_virtual_cluster_name}&sslmode=verify-full" \
    --certs-dir "certs"
    ~~~

1. [Perform a full backup]({% link {{ page.version.version }}/backup.md %}#back-up-a-cluster):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    BACKUP INTO 'external://backup_s3/app' AS OF SYSTEM TIME '-10s';
    ~~~

You can also take one-off backups of [databases]({% link {{ page.version.version }}/backup.md %}#back-up-a-database) or [tables]({% link {{ page.version.version }}/backup.md %}#back-up-a-table-or-view) on your app VC. For more information on backup options, consult [BACKUP]({% link {{ page.version.version }}/backup.md %}).

### Back up your system VC

You can also back up your system VC to preserve its stored metadata. Follow these steps to back up your system VC.

1. [Connect](#connect-to-the-system-virtual-cluster) to the system VC as a user with the  [required privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges). In this example the user has the `BACKUP` privilege.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url \
    "postgresql://root@{primary node IP or hostname}:26257?options=-ccluster=system&sslmode=verify-full" \
    --certs-dir "certs"
    ~~~

1. [Perform a full backup]({% link {{ page.version.version }}/backup.md %}#back-up-a-cluster):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    BACKUP INTO 'external://backup_s3/system' AS OF SYSTEM TIME '-10s';
    ~~~

    {% include {{ page.version.version }}/backups/backup-storage-collision.md %}

### Restore a virtual cluster

If needed, you can restore a backup to a new app VC. For cluster-level restores, the new app VC must not contain any user-created databases or tables. To restore your app VC from the latest backup:

1. [Connect to the destination app VC](#connect-to-a-virtual-cluster) as a user with the [required privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges). In this example the user has the `RESTORE` privilege.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url \
    "postgresql://root@{primary node IP or hostname}:26257?options=-ccluster={app_virtual_cluster_name}&sslmode=verify-full" \
    --certs-dir "certs"
    ~~~

1. [Restore the cluster]({% link {{ page.version.version }}/restore.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    RESTORE FROM LATEST IN 's3://bucket/path?AUTH=implicit';
    ~~~

You can also restore a [database-level]({% link {{ page.version.version }}/restore.md %}#restore-a-database) or [table-level]({% link {{ page.version.version }}/restore.md %}#restore-a-table) backup to the same app VC where it was created. For more information on restore options, consult [RESTORE]({% link {{ page.version.version }}/restore.md %}).

## Configure cluster settings

When [cluster virtualization]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}) is enabled, each [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) is scoped to either a virtual cluster or the system virtual cluster.

- When a cluster setting is scoped to a virtual cluster, it affects only the virtual cluster and not the system virtual cluster. To configure a cluster setting that is scoped to a virtual cluster, you must have the `admin` role on the virtual cluster, and you must connect to the virtual cluster before configuring the setting. The majority of cluster settings are scoped to a virtual cluster and are visible only when connected to it.
- When a cluster setting is scoped to the system virtual cluster, it affects the entire CockroachDB cluster. To configure a cluster setting that is scoped to the system virtual cluster, you must have the `admin` role on the system virtual cluster, and you must connect to the system virtual cluster before configuring the setting.
- When a cluster setting is system-visible, it can be set only from the system virtual cluster but can be queried from any virtual cluster. For example, a virtual cluster can query a system-visible cluster setting's value to help adapt to the CockroachDB cluster's configuration.

For more details, including the scope of each cluster setting, refer to [Cluster Setting Scopes with Cluster Virtualization enabled]({% link {{ page.version.version }}/cluster-virtualization-setting-scopes.md %}).

## Upgrade a cluster

To upgrade to a new major version when cluster virtualization is enabled, you must:

1. Replace the binary on each node and restart the node.
1. [Finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#finalize-a-major-version-upgrade-manually) the upgrade on the system virtual cluster to upgrade it (if auto-finalization is disabled) or roll back the upgrade if you decide not to finalize it. Until it is finalized, the cluster still operates in compatibility with the previous major version, and virtual clusters cannot be upgraded.
1. Finalize the upgrade on a virtual cluster to upgrade it, or roll back the upgrade if you decide not to finalize it. Until it is finalized, a virtual cluster still operates in compatibility with the previous major version, and some features may not be available on the virtual cluster.

This allows you to roll back an upgrade of the system virtual cluster without impacting schemas or data in virtual clusters. The system virtual cluster can be at most one [Regular release]({% link releases/index.md %}#release-types) ahead of virtual clusters. For example, a system virtual cluster on CockroachDB v24.3 can have virtual clusters on CockroachDB v24.1 (a Regular release) or v24.2 (an Innovation release).

{{site.data.alerts.callout_info}}
Both the `auto_upgrade.enabled` and `preserve_downgrade_option` [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}) are scoped to a virtual cluster. To prevent automatic finalization of an upgrade, you must do one of the following:

- Set `auto_upgrade.enabled` to `false` before beginning an upgrade. This setting persists after an upgrade. To finalize the upgrade manually, refer to [Upgrade a cluster]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}). This is the preferred way to disable auto-upgrade.
- Set `preserve_downgrade_option` to the cluster's current major version. This setting is reset during upgrade finalization and must be set again before the next major-version upgrade.

Either setting, if enabled, disables auto-finalization.
{{site.data.alerts.end}}

To apply a patch-version upgrade, you must replace the binary on each node and restart the node. Finalization is not required.

## See also

- [Cluster Virtualization Overview]({% link {{ page.version.version }}/cluster-virtualization-overview.md %})
- [Cluster Setting Scopes]({% link {{ page.version.version }}/cluster-virtualization-setting-scopes.md %})
- [Cluster Metric Scopes]({% link {{ page.version.version }}/cluster-virtualization-metric-scopes.md %})
- [Physical Cluster Replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %})
