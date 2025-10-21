---
title: Upgrade with Physical Cluster Replication Enabled
summary: Upgrade your primary and standby clusters when using PCR.
toc: true
docs_area: manage
---

When [**physical cluster replication (PCR)**]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) is enabled, you must use the process on this page to upgrade your clusters. This process ensures that the standby cluster upgrades before the primary cluster.

{{site.data.alerts.callout_info}}
The entire standby cluster must be at the same version as, or one version ahead of, the primary's virtual cluster. Within the primary and standby CockroachDB clusters, the _system virtual cluster (SystemVC)_ must be at a cluster version greater than or equal to the _app virtual cluster (AppVC)_.
{{site.data.alerts.end}}

## Upgrade primary and standby clusters

To upgrade your primary and standby clusters:

1. [Upgrade the binaries]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#perform-a-major-version-upgrade) on the standby cluster. Replace the binary on each node of the cluster and restart the node.

    After upgrading the binaries on the standby cluster, the primary cluster is not upgradable until the standby cluster's upgrade has finalized.

    If auto-finalization is enabled, the upgrade auto-finalizes after 72 hours.

1. If auto-finalization is disabled, [finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#finalize-a-major-version-upgrade-manually) the upgrade on the standby cluster's SystemVC. 

    {{site.data.alerts.callout_info}}
    If you need to [roll back]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#roll-back-a-major-version-upgrade) an upgrade, you must do so before the upgrade has been finalized.
    {{site.data.alerts.end}}

1. If auto-finalization is disabled, [finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#finalize-a-major-version-upgrade-manually) the upgrade on the standby cluster's AppVC.

    After you have finalized the upgrade on the standby cluster's AppVC, the clusters can remain in this state for an indefinite amount of time. You can wait to upgrade the primary cluster as long as is needed.

1. [Upgrade the binaries]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#perform-a-major-version-upgrade) on the primary cluster. Replace the binary on each node of the cluster and restart the node.

    After upgrading the binaries on the primary cluster, the standby cluster is not upgradable until the primary cluster's upgrade has finalized.

1. If auto-finalization is disabled, [finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#finalize-a-major-version-upgrade-manually) the upgrade on the primary cluster's SystemVC. 

    {{site.data.alerts.callout_info}}
    If you need to [roll back]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#roll-back-a-major-version-upgrade) an upgrade, you must do so before the upgrade has been finalized.
    {{site.data.alerts.end}}

1. If auto-finalization is disabled, [finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#finalize-a-major-version-upgrade-manually) the upgrade on the primary cluster's AppVC.

## Upgrade ReaderVC

If you have a [_reader virtual cluster (ReaderVC)_]({% link {{ page.version.version }}/read-from-standby.md %}), use the following steps to upgrade it by dropping and re-creating it:

1. After upgrading the AppVCs on your primary and standby clusters, wait for the replicated time to pass the time at which the upgrade completed.
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

1. On the AppVC, double-check that the standby cluster's AppVC has upgraded:
    
    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW CLUSTER SETTING version
    ~~~

1. Back on the standby cluster, if the version is as expected, re-create the ReaderVC:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER dest-system SET REPLICATION READ VIRTUAL CLUSTER
    ~~~

## Failover and fast failback during upgrade

If you need to perform a [failover]({% link {{ page.version.version }}/failover-replication.md %}) while upgrading your clusters, you can do that using the normal process.

However, after performing a failover you cannot perform a [fast failback]({% link {{ page.version.version }}/failover-replication.md %}#failback) to the original primary cluster during the upgrade process. This is because at times during the upgrade the standby cluster is ahead of the primary cluster.

## Patch deferrals

Patch versions are not relevant when determining PCR compatibility. There is no need to consider PCR compatibility when upgrading to a specific patch version within a major version.