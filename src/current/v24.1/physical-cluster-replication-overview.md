---
title: Physical Cluster Replication
summary: An overview of CockroachDB physical cluster replication (PCR).
toc: true
docs_area: manage
---

CockroachDB **physical cluster replication (PCR)** continuously sends all data at the cluster level from a _primary_ cluster to an independent _standby_ cluster. Existing data and ongoing changes on the active primary cluster, which is serving application data, replicate asynchronously to the passive standby cluster. 

You can [_cut over_]({% link {{ page.version.version }}/cutover-replication.md %}) from the primary cluster to the standby cluster. This will stop the replication stream, reset the standby cluster to a point in time (in the past or future) where all ingested data is consistent, and make the standby ready to accept application traffic.

For a list of requirements for PCR, refer to the [Before you begin]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#before-you-begin) section of the [setup tutorial]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}).

## Use cases

You can use PCR to:

- Meet your RTO (Recovery Time Objective) and RPO (Recovery Point Objective) requirements. PCR provides lower RTO and RPO than [backup and restore]({% link {{ page.version.version }}/backup-and-restore-overview.md %}).
- Automatically replicate everything in your primary cluster to recover quickly from a control plane or full cluster failure.
- Protect against region failure when you cannot use individual [multi-region clusters]({% link {{ page.version.version }}/multiregion-overview.md %})—for example, if you have a two-datacenter architecture and do not have access to three regions; or, you need low-write latency in a single region. PCR allows for an active-passive (primary-standby) structure across two clusters with the passive cluster in a different region.
- Quickly recover from user error (for example, dropping a database) by [failing over]({% link {{ page.version.version }}/cutover-replication.md %}) to a time in the near past.
- Create a [blue-green deployment model](https://en.wikipedia.org/wiki/Blue%E2%80%93green_deployment) by using the standby cluster for testing upgrades and hardware changes.

## Features

- **Asynchronous cluster-level replication**: When you initiate a replication stream, it will replicate byte-for-byte all of the primary cluster's existing user data and associated metadata to the standby cluster asynchronously. From then on, it will continuously replicate the primary cluster's data and metadata to the standby cluster. PCR will automatically replicate changes related to operations such as [schema changes]({% link {{ page.version.version }}/online-schema-changes.md %}), user and [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) modifications, and [zone configuration]({% link {{ page.version.version }}/show-zone-configurations.md %}) updates without any manual work.
- **Transactional consistency**: Avoid conflicts in data after recovery; the replication completes to a transactionally consistent state as of a certain point in time.
- **Improved RPO and RTO**: Depending on workload and deployment configuration, [replication lag]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}) between the primary and standby is generally in the tens-of-seconds range. The cutover process from the primary cluster to the standby should typically happen within five minutes when completing a cutover to the latest replicated time using [`LATEST`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}#synopsis).
- **Cutover to a timestamp in the past or the future**: In the case of logical disasters or mistakes, you can [cut over]({% link {{ page.version.version }}/cutover-replication.md %}) from the primary to the standby cluster to a timestamp in the past. This means that you can return the standby to a timestamp before the mistake was replicated to the standby. Furthermore, you can plan a cutover by specifying a timestamp in the future.
- **Monitoring**: To monitor the replication's initial progress, current status, and performance, you can use metrics available in the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) and [Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}). For more detail, refer to [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}).

## Known limitations

{% include {{ page.version.version }}/known-limitations/physical-cluster-replication.md %}
- {% include {{ page.version.version }}/known-limitations/fast-cutback-latest-timestamp.md %}
- {% include {{ page.version.version }}/known-limitations/pcr-scheduled-changefeeds.md %}
- {% include {{ page.version.version }}/known-limitations/cutover-stop-application.md %}

{{site.data.alerts.callout_info}}
Frequent large schema changes or imports may cause a significant spike in [replication lag]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}).
{{site.data.alerts.end}}

## Get started

This section is a quick overview of the initial requirements to start a replication stream.

For more comprehensive guides, refer to:

- [Set Up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}): for a tutorial on how to start a replication stream.
- [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}): for detail on metrics and observability into a replication stream.
- [Cut Over from a Primary Cluster to a Standby Cluster]({% link {{ page.version.version }}/cutover-replication.md %}): for a guide on how to complete a replication stream and cut over to the standby cluster.
- [Technical Overview]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}): to understand PCR in more depth before setup.

### Manage replication in the SQL shell

To start, manage, and observe PCR, you can use the following SQL statements:

Statement | Action
----------+------
[`CREATE VIRTUAL CLUSTER ... FROM REPLICATION OF ...`]({% link {{ page.version.version }}/create-virtual-cluster.md %}) | Start a replication stream.
[`ALTER VIRTUAL CLUSTER ... PAUSE REPLICATION`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}) | Pause a running replication stream.
[`ALTER VIRTUAL CLUSTER ... RESUME REPLICATION`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}) | Resume a paused replication stream.
[`ALTER VIRTUAL CLUSTER ... START SERVICE SHARED`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}) | Initiate a [cutover]({% link {{ page.version.version }}/cutover-replication.md %}).
[`SHOW VIRTUAL CLUSTER`]({% link {{ page.version.version }}/show-virtual-cluster.md %}) | Show all virtual clusters.
[`DROP VIRTUAL CLUSTER`]({% link {{ page.version.version }}/drop-virtual-cluster.md %}) | Remove a virtual cluster.

## Cluster versions and upgrades

{{site.data.alerts.callout_danger}}
The standby cluster must be at the same version as, or one version ahead of, the primary's virtual cluster.
{{site.data.alerts.end}}

When PCR is enabled, upgrade with the following procedure. This upgrades the standby cluster before the primary cluster. Within the primary and standby CockroachDB clusters, the system virtual cluster must be at a cluster version greater than or equal to the virtual cluster:

1. [Upgrade the binaries]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#step-4-perform-the-rolling-upgrade) on the primary and standby clusters. Replace the binary on each node of the cluster and restart the node.
1. [Finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#step-6-finish-the-upgrade) the upgrade on the standby's system virtual cluster.
1. [Finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#step-6-finish-the-upgrade) the upgrade on the primary's system virtual cluster.
1. [Finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#step-6-finish-the-upgrade) the upgrade on the standby's virtual cluster.
1. [Finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#step-6-finish-the-upgrade) the upgrade on the primary's virtual cluster.

## Demo video

Learn how to use PCR to meet your RTO and RPO requirements with the following demo:

{% include_cached youtube.html video_id="VDqw4XIpEAk" %}
