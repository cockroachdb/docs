---
title: Upgrade a Cluster Running PCR
summary: Upgrade your primary and standby clusters when using PCR.
toc: true
docs_area: manage
---

To safely perform a major version upgrade on a cluster with [**physical cluster replication (PCR)**]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}), you must upgrade the standby cluster before the primary cluster to avoid version incompatibility. You cannot replicate data from a cluster on a newer version to a cluster on an older version. 

This page describes the process for safely performing a major version upgrade on a pair of clusters that have PCR enabled.

{{site.data.alerts.callout_info}}
The entire standby cluster must be on the same major version as the primary cluster or a major version the primary cluster [can directly upgrade to]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#compatible-versions). Within the primary and standby CockroachDB clusters, the _system virtual cluster (system VC)_ must be at a cluster major version greater than or equal to the _application virtual cluster (app VC)_.
{{site.data.alerts.end}}

## Minor version upgrades

Minor versions are not relevant when determining PCR compatibility. There is no need to consider PCR compatibility when upgrading to a specific minor version within a major version, so you can follow the normal [patch upgrade process]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#perform-a-patch-upgrade).

## Upgrade primary and standby clusters

To upgrade your primary and standby clusters:

1. Ensure that the virtual clusters on both your primary cluster and your standby cluster are [finalized]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#finalize-a-major-version-upgrade-manually) on the current version before beginning the upgrade process.

1. [Upgrade the binaries]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#perform-a-major-version-upgrade) on the standby cluster. On each node of the cluster, replace the binary and restart the node.

1. [Connect]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}#connect-to-the-system-virtual-cluster) to the standby cluster's system VC:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url \
    "postgresql://root@{standby node IP or hostname}:26257?options=-ccluster=system&sslmode=verify-full" \
    --certs-dir "certs"
    ~~~

1. [Finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#finalize-a-major-version-upgrade-manually) the upgrade on the standby cluster's system VC:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING version '{VERSION}';
    ~~~

    {{site.data.alerts.callout_info}}
    If you need to [roll back]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#roll-back-a-major-version-upgrade) an upgrade, you must do so before the upgrade has been finalized.
    {{site.data.alerts.end}}

1. Confirm that finalization is complete on the standby cluster's system VC:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW CLUSTER SETTING version;
    ~~~

1. [Upgrade the binaries]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#perform-a-major-version-upgrade) on the primary cluster. On each node of the cluster, replace the binary and restart the node.

1. [Connect]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}#connect-to-the-system-virtual-cluster) to the primary cluster's system VC:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url \
    "postgresql://root@{primary node IP or hostname}:26257?options=-ccluster=system&sslmode=verify-full" \
    --certs-dir "certs"
    ~~~

1. [Finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#finalize-a-major-version-upgrade-manually) the upgrade on the primary cluster's system VC:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING version '{VERSION}';
    ~~~

    {{site.data.alerts.callout_info}}
    If you need to [roll back]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#roll-back-a-major-version-upgrade) an upgrade, you must do so before the upgrade has been finalized. Rolling back the upgrade on the primary cluster does not roll back the standby cluster.
    {{site.data.alerts.end}}

1. Confirm that finalization is complete on the primary cluster's system VC:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW CLUSTER SETTING version;
    ~~~

1. [Connect]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}#connect-to-the-system-virtual-cluster) to the primary cluster's app VC:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url \
    "postgresql://root@{primary node IP or hostname}:26257?options=-ccluster={app_virtual_cluster_name}&sslmode=verify-full" \
    --certs-dir "certs"
    ~~~

1. [Finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#finalize-a-major-version-upgrade-manually) the upgrade on the primary cluster's app VC: 

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING version '{VERSION}';
    ~~~

    Upgrading the primary cluster's app VC also upgrades the standby cluster's app VC, since it replicates from the primary.

1. Confirm that finalization is complete on the primary cluster's app VC:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW CLUSTER SETTING version;
    ~~~

## Upgrade reader VC

If you have a [_reader virtual cluster (reader VC)_]({% link {{ page.version.version }}/read-from-standby.md %}), you must drop and recreate it to upgrade after completing the main upgrade process on the primary and standby clusters. Follow these steps to upgrade your reader VC:

1. After upgrading the app VC on your primary cluster, wait for the replicated time to pass the time at which the upgrade completed.
1. On the standby cluster, stop the reader VC service:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER <readervc-name> STOP SERVICE;
    ~~~

1. Drop the reader VC:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    DROP VIRTUAL CLUSTER <readervc-name>;
    ~~~

1. On the standby cluster, re-create the reader VC:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER <readervc-name> SET REPLICATION READ VIRTUAL CLUSTER;
    ~~~

At this point, the reader VC is on the same version as the standby cluster.

## Failover and fast failback during upgrade

If needed, you can perform a [failover]({% link {{ page.version.version }}/failover-replication.md %}) while upgrading your clusters.

However, after performing a failover you cannot perform a [fast failback]({% link {{ page.version.version }}/failover-replication.md %}#failback) to the original primary cluster while the standby cluster version is newer than the primary cluster version. This is because you cannot replicate data from a cluster on a newer version to a cluster on an older version. 