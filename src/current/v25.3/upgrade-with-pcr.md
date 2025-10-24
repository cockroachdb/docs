---
title: Upgrade with Physical Cluster Replication Enabled
summary: Upgrade your primary and standby clusters when using PCR.
toc: true
docs_area: manage
---

When [**physical cluster replication (PCR)**]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) is enabled, you must use the process on this page to upgrade your clusters. This process ensures that the standby cluster upgrades before the primary cluster.

{{site.data.alerts.callout_info}}
The entire standby cluster must be on the same version as the primary cluster or a version the primary cluster can directly upgrade to. Within the primary and standby CockroachDB clusters, the _system virtual cluster (SystemVC)_ must be at a cluster version greater than or equal to the _app virtual cluster (AppVC)_.
{{site.data.alerts.end}}

## Upgrade primary and standby clusters

To upgrade your primary and standby clusters:

1. Ensure that the virtual clusters on both your primary cluster and your standby cluster are finalized on the current version. If their versions have not been finalized, [finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#finalize-a-major-version-upgrade-manually) them before beginning the upgrade process.

1. [Upgrade the binaries]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#perform-a-major-version-upgrade) on the standby cluster. Replace the binary on each node of the cluster and restart the node.

1. [Finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#finalize-a-major-version-upgrade-manually) the upgrade on the standby cluster's SystemVC. 

    {{site.data.alerts.callout_info}}
    If you need to [roll back]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#roll-back-a-major-version-upgrade) an upgrade, you must do so before the upgrade has been finalized.
    {{site.data.alerts.end}}

    After you have finalized the upgrade on the standby cluster's SystemVC, the clusters can remain in this state for an indefinite amount of time. You can wait to upgrade the primary cluster as long as is needed.

1. [Upgrade the binaries]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#perform-a-major-version-upgrade) on the primary cluster. Replace the binary on each node of the cluster and restart the node.

1. [Finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#finalize-a-major-version-upgrade-manually) the upgrade on the primary cluster's SystemVC. 

    {{site.data.alerts.callout_info}}
    If you need to [roll back]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#roll-back-a-major-version-upgrade) an upgrade, you must do so before the upgrade has been finalized. Rolling back the upgrade on the primary cluster does not also roll back the standby cluster.
    {{site.data.alerts.end}}

1. [Finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#finalize-a-major-version-upgrade-manually) the upgrade on the primary cluster's AppVC. 

    Upgrading the primary cluster's AppVC also upgrades the standby cluster's AppVC, since it replicates from the primary.

## Upgrade ReaderVC

If you have a [_reader virtual cluster (ReaderVC)_]({% link {{ page.version.version }}/read-from-standby.md %}), use the following steps to upgrade it by dropping and re-creating it:

1. After upgrading the AppVC on your primary cluster, wait for the replicated time to pass the time at which the upgrade completed.
1. On the standby cluster, stop the ReaderVC service:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER <readervc-name> STOP SERVICE
    ~~~

1. Drop the ReaderVC:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    DROP VIRTUAL CLUSTER <readervc-name>
    ~~~

1. Back on the standby cluster, if the version is as expected, re-create the ReaderVC:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER dest-system SET REPLICATION READ VIRTUAL CLUSTER
    ~~~

## Failover and fast failback during upgrade

If you need to perform a [failover]({% link {{ page.version.version }}/failover-replication.md %}) while upgrading your clusters, you can do that using the normal process.

However, after performing a failover you cannot perform a [fast failback]({% link {{ page.version.version }}/failover-replication.md %}#failback) to the original primary cluster during the upgrade process. This is because at times during the upgrade the standby cluster is ahead of the primary cluster.

## Minor version upgrades

Minor versions are not relevant when determining PCR compatibility. There is no need to consider PCR compatibility when upgrading to a specific minor version within a major version.