---
title: Physical Cluster Replication
summary: An overview of CockroachDB physical cluster replication (PCR).
toc: true
docs_area: manage
---

{{site.data.alerts.callout_info}}
Physical cluster replication is only supported in CockroachDB {{ site.data.products.core }} clusters.
{{site.data.alerts.end}}

CockroachDB **physical cluster replication (PCR)** continuously sends all data at the byte level from a _primary_ cluster to an independent _standby_ cluster. Existing data and ongoing changes on the active primary cluster, which is serving application data, replicate asynchronously to the passive standby cluster.

In a disaster recovery scenario, you can [_fail over_]({% link {{ page.version.version }}/failover-replication.md %}) from the unavailable primary cluster to the standby cluster. This will stop the replication stream, reset the standby cluster to a point in time where all ingested data is consistent, and mark the standby as ready to accept application traffic.

For a list of requirements for PCR, refer to the [Before you begin]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#before-you-begin) section of the [setup tutorial]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}).

{{site.data.alerts.callout_success}}
Cockroach Labs also has a [logical data replication]({% link {{ page.version.version }}/logical-data-replication-overview.md %}) tool that continuously replicates tables between an active _source_ CockroachDB cluster to an active _destination_ CockroachDB cluster. Both source and destination can receive application reads and writes, and participate in [_bidirectional_]({% link {{ page.version.version }}/logical-data-replication-overview.md %}#use-cases) LDR for eventual consistency in the replicating tables.
{{site.data.alerts.end}}

## Use cases

You can use PCR in a disaster recovery plan to:

- Meet your RTO (Recovery Time Objective) and RPO (Recovery Point Objective) requirements. PCR provides lower RTO and RPO than [backup and restore]({% link {{ page.version.version }}/backup-and-restore-overview.md %}).
- Automatically replicate everything in your primary cluster to recover quickly from a control plane or full cluster failure.
- Protect against region failure when you cannot use individual [multi-region clusters]({% link {{ page.version.version }}/multiregion-overview.md %}) — for example, if you have a two-datacenter architecture and do not have access to three regions; or, you need low-write latency in a single region. PCR allows for an active-passive (primary-standby) structure across two clusters with the passive cluster in a different region.
- Avoid conflicts in data after recovery; the replication completes to a transactionally consistent state as of a certain point in time.

## Features

- **Asynchronous byte-level replication**: When you initiate a replication stream, it will replicate byte-for-byte all of the primary cluster's existing user data and associated metadata to the standby cluster asynchronously. From then on, it will continuously replicate the primary cluster's data and metadata to the standby cluster. PCR will automatically replicate changes related to operations such as [schema changes]({% link {{ page.version.version }}/online-schema-changes.md %}), user and [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) modifications, and [zone configuration]({% link {{ page.version.version }}/show-zone-configurations.md %}) updates without any manual work.
- **Transactional consistency**: You can fail over to the standby cluster at the [`LATEST` timestamp]({% link {{ page.version.version }}/failover-replication.md %}#fail-over-to-the-most-recent-replicated-time) or a [point of time]({% link {{ page.version.version }}/failover-replication.md %}#fail-over-to-a-point-in-time) in the past or the future. When the failover process completes, the standby cluster will be in a transactionally consistent state as of the point in time you specified.
- **Maintained/improved RPO and RTO**: Depending on workload and deployment configuration, [replication lag]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}) between the primary and standby is generally in the tens-of-seconds range. The failover process from the primary cluster to the standby should typically happen within five minutes when completing a failover to the latest replicated time using `LATEST`.
- **Failover to a timestamp in the past or the future**: In the case of logical disasters or mistakes, you can [fail over]({% link {{ page.version.version }}/failover-replication.md %}) from the primary to the standby cluster to a timestamp in the past. This means that you can return the standby to a timestamp before the mistake was replicated to the standby. You can also configure the [`WITH RETENTION`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}#set-a-retention-window) option to control how far in the past you can fail over to. Furthermore, you can plan a failover by specifying a timestamp in the future.
- {% include_cached new-in.html version="v24.3" %} **Read from standby cluster**: You can configure PCR to allow read queries on the standby cluster. For more details, refer to [Start a PCR stream with read from standby]({% link {{ page.version.version }}/create-virtual-cluster.md %}#start-a-pcr-stream-with-read-from-standby).
- **Monitoring**: To monitor the replication's initial progress, current status, and performance, you can use metrics available in the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) and [Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}). For more details, refer to [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}).

{{site.data.alerts.callout_info}}
[Failing over to a timestamp in the past]({% link {{ page.version.version }}/failover-replication.md %}#fail-over-to-a-point-in-time) involves reverting data on the standby cluster. As a result, this type of failover takes longer to complete than failover to the [latest replicated time]({% link {{ page.version.version }}/failover-replication.md %}#fail-over-to-the-most-recent-replicated-time). The increase in failover time will correlate to how much data you are reverting from the standby. For more detail, refer to the [Technical Overview]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}) page for PCR.
{{site.data.alerts.end}}

## Known limitations

{% include {{ page.version.version }}/known-limitations/physical-cluster-replication.md %}
- {% include {{ page.version.version }}/known-limitations/failover-stop-application.md %}

## Performance

Cockroach Labs testing has demonstrated the following results for workloads up to the outlined scale:

- Initial data load: 30TB
- 100,000 writes per second
- [Replication lag]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}) (steady state, no bulk changes): 20–45 seconds
- [Failover]({% link {{ page.version.version }}/failover-replication.md %}): 2–5 minutes

{{site.data.alerts.callout_info}}
Frequent large schema changes or imports may cause a significant spike in [replication lag]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}).
{{site.data.alerts.end}}

## Get started

This section is a quick overview of the initial requirements to start a replication stream.

For more comprehensive guides, refer to:

- [Technical Overview]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}): to understand PCR in more depth before setup.
- [Set Up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}): for a tutorial on how to start a replication stream.
- [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}): for detail on metrics and observability into a replication stream.
- [Fail Over from a Primary Cluster to a Standby Cluster]({% link {{ page.version.version }}/failover-replication.md %}): for a guide on how to complete a replication stream and fail over to the standby cluster.

### Start clusters

{{site.data.alerts.callout_danger}}
Before starting PCR, ensure that the standby cluster is at the same version, or one version ahead of, the primary cluster. For more details, refer to [Cluster versions and upgrades](#cluster-versions-and-upgrades).
{{site.data.alerts.end}}

To use PCR on clusters, you must [initialize]({% link {{ page.version.version }}/cockroach-start.md %}) the primary and standby CockroachDB clusters with the `--virtualized` and `--virtualized-empty` flags respectively. This enables [cluster virtualization]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}) and sets up each cluster ready for replication.

The active primary cluster that serves application traffic:

~~~shell
cockroach init ... --virtualized
~~~

The passive standby cluster that will ingest the replicated data:

~~~shell
cockroach init ... --virtualized-empty
~~~

The node topology of the two clusters does not need to be the same. For example, you can provision the standby cluster with fewer nodes. However, consider that:

- The standby cluster requires enough storage to contain the primary cluster's data.
- During a failover scenario, the standby will need to handle the full production load. However, the clusters cannot have different region topologies (refer to [Limitations](#known-limitations)).

{{site.data.alerts.callout_info}}
Every node in the standby cluster must be able to make a network connection to every node in the primary cluster to start a replication stream successfully. Refer to [Manage the cluster certificates]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-3-manage-the-cluster-certificates) for details.
{{site.data.alerts.end}}

### Connect to the system virtual cluster and virtual cluster

A cluster with PCR enabled is a [virtualized cluster]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}); the primary and standby clusters each contain:

{% include {{ page.version.version }}/physical-replication/interface-virtual-cluster.md %}

To connect to a virtualized cluster using the SQL shell:

- For the system virtual cluster, include the `options=-ccluster=system` parameter in the `postgresql` connection URL:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url "postgresql://root@{your IP or hostname}:26257?options=-ccluster=system&sslmode=verify-full" --certs-dir "certs"
    ~~~

- For the virtual cluster, include the `options=-ccluster=main` parameter in the `postgresql` connection URL:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url "postgresql://root@{your IP or hostname}:26257?options=-ccluster=main&sslmode=verify-full" --certs-dir "certs"
    ~~~

{{site.data.alerts.callout_info}}
PCR requires an [{{ site.data.products.enterprise }} license]({% link {{ page.version.version }}/licensing-faqs.md %}#types-of-licenses) on the primary and standby clusters. You must set {{ site.data.products.enterprise }} licenses from the system virtual cluster.
{{site.data.alerts.end}}

To connect to the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) and view the **Physical Cluster Replication** dashboard, the user must have the correct privileges. Refer to [Create a user for the standby cluster]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#create-a-user-for-the-standby-cluster).

### Manage replication in the SQL shell

To start, manage, and observe PCR, you can use the following SQL statements:

Statement | Action
----------+------
[`CREATE VIRTUAL CLUSTER ... FROM REPLICATION OF ...`]({% link {{ page.version.version }}/create-virtual-cluster.md %}) | Start a replication stream.
[`ALTER VIRTUAL CLUSTER ... PAUSE REPLICATION`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}) | Pause a running replication stream.
[`ALTER VIRTUAL CLUSTER ... RESUME REPLICATION`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}) | Resume a paused replication stream.
[`ALTER VIRTUAL CLUSTER ... START SERVICE SHARED`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}#start-a-virtual-cluster) | Initiate a [failover]({% link {{ page.version.version }}/failover-replication.md %}).
[`SHOW VIRTUAL CLUSTER`]({% link {{ page.version.version }}/show-virtual-cluster.md %}) | Show all virtual clusters.
[`DROP VIRTUAL CLUSTER`]({% link {{ page.version.version }}/drop-virtual-cluster.md %}) | Remove a virtual cluster.

### Cluster versions and upgrades

{{site.data.alerts.callout_danger}}
The standby cluster must be at the same version as, or one version ahead of, the primary's virtual cluster.
{{site.data.alerts.end}}

When PCR is enabled, upgrade with the following procedure. This upgrades the standby cluster before the primary cluster. Within the primary and standby CockroachDB clusters, the system virtual cluster must be at a cluster version greater than or equal to the virtual cluster:

1. [Upgrade the binaries]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#perform-a-major-version-upgrade) on the primary and standby clusters. Replace the binary on each node of the cluster and restart the node.
1. [Finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#finalize-a-major-version-upgrade-manually) the upgrade on the standby's system virtual cluster if auto-finalization is disabled.
1. [Finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#finalize-a-major-version-upgrade-manually) the upgrade on the primary's system virtual cluster if auto-finalization is disabled.
1. [Finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#finalize-a-major-version-upgrade-manually) the upgrade on the standby's virtual cluster.
1. [Finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#finalize-a-major-version-upgrade-manually) the upgrade on the primary's virtual cluster.

The standby cluster must be at the same version as, or one version ahead of, the primary's virtual cluster at the time of [failover]({% link {{ page.version.version }}/failover-replication.md %}).

## Demo video

Learn how to use PCR to meet your RTO and RPO requirements with the following demo:

{% include_cached youtube.html video_id="VDqw4XIpEAk" %}
