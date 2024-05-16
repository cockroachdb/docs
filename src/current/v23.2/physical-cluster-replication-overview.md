---
title: Physical Cluster Replication
summary: An overview of CockroachDB's physical cluster replication.
toc: true
docs_area: manage
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}

Refer to the [Known Limitations](#known-limitations) section for further detail.
{{site.data.alerts.end}}

{% include_cached new-in.html version="v23.2" %} CockroachDB physical cluster replication continuously sends all data at the byte level from a _primary_ cluster to an independent _standby_ cluster. Existing data and ongoing changes on the active primary cluster, which is serving application data, replicate asynchronously to the passive standby cluster.

In a disaster recovery scenario, you can [_cut over_]({% link {{ page.version.version }}/cutover-replication.md %}) from the unavailable primary cluster to the standby cluster. This will stop the replication stream, reset the standby cluster to a point in time where all ingested data is consistent, and mark the standby as ready to accept application traffic.

{% include enterprise-feature.md %}

## Use cases

You can use physical cluster replication in a disaster recovery plan to:

- Meet your RTO (Recovery Time Objective) and RPO (Recovery Point Objective) requirements. Physical cluster replication provides lower RTO and RPO than [backup and restore]({% link {{ page.version.version }}/backup-and-restore-overview.md %}).
- Automatically replicate everything in your primary cluster to recover quickly from a control plane or full cluster failure.
- Protect against region failure when you cannot use individual [multi-region clusters]({% link {{ page.version.version }}/multiregion-overview.md %}) — for example, if you have a two-datacenter architecture and do not have access to three regions; or, you need low-write latency in a single region. Physical cluster replication allows for an active-passive (primary-standby) structure across two clusters with the passive cluster in different region.
- Avoid conflicts in data after recovery; the replication completes to a transactionally consistent state as of a certain point in time.

## Features

- **Asynchronous byte-level replication**: When you initiate a replication stream, it will replicate byte-for-byte all of the primary cluster's existing user data and associated metadata to the standby cluster asynchronously. From then on, it will continuously replicate the primary cluster's data and metadata to the standby cluster. Physical cluster replication will automatically replicate changes related to operations such as [schema changes]({% link {{ page.version.version }}/online-schema-changes.md %}), user and [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) modifications, and [zone configuration]({% link {{ page.version.version }}/show-zone-configurations.md %}) updates without any manual work.
- **Transactional consistency**: You can cut over to the standby cluster at the [`LATEST` timestamp]({% link {{ page.version.version }}/cutover-replication.md %}#cut-over-to-the-most-recent-replicated-time) or a [point of time]({% link {{ page.version.version }}/cutover-replication.md %}#cut-over-to-a-point-in-time) in the past or the future. When the cutover process completes, the standby cluster will be in a transactionally consistent state as of the point in time you specified.
- **Maintained/improved RPO and RTO**: Depending on workload and deployment configuration, [replication lag]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}) between the primary and standby is generally in the tens-of-seconds range. The cutover process from the primary cluster to the standby should typically happen within five minutes when completing a cutover to the latest replicated time using `LATEST`.
- **Cutover to a timestamp in the past or the future**: In the case of logical disasters or mistakes, you can [cut over]({% link {{ page.version.version }}/cutover-replication.md %}) from the primary to the standby cluster to a timestamp in the past. This means that you can return the standby to a timestamp before the mistake was replicated to the standby. You can also configure the [`WITH RETENTION`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}#set-a-retention-window) option to control how far in the past you can cut over to. Furthermore, you can plan a cutover by specifying a timestamp in the future.
- **Monitoring**: To monitor the replication's initial progress, current status, and performance, you can use metrics available in the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) and [Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}). For more detail, refer to [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}).

{{site.data.alerts.callout_info}}
[Cutting over to a timestamp in the past]({% link {{ page.version.version }}/cutover-replication.md %}#cut-over-to-a-point-in-time) involves reverting data on the standby cluster. As a result, this type of cutover takes longer to complete than cutover to the [latest replicated time]({% link {{ page.version.version }}/cutover-replication.md %}#cut-over-to-the-most-recent-replicated-time). The increase in cutover time will correlate to how much data you are reverting from the standby. For more detail, refer to the [Technical Overview]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}) page for physical cluster replication.
{{site.data.alerts.end}}

## Known limitations

{% include {{ page.version.version }}/known-limitations/physical-cluster-replication.md %}
- {% include {{ page.version.version }}/known-limitations/pcr-scheduled-changefeeds.md %}

## Get started

This section is a quick overview of the initial requirements to start a replication stream.

For more comprehensive guides, refer to:

- [Technical Overview]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}): to understand physical cluster replication in more depth before setup.
- [Set Up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}): for a tutorial on how to start a replication stream.
- [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}): for detail on metrics and observability into a replication stream.
- [Cut Over from a Primary Cluster to a Standby Cluster]({% link {{ page.version.version }}/cutover-replication.md %}): for a guide on how to complete a replication stream and cut over to the standby cluster.

### Start clusters

To initiate physical cluster replication on clusters, you must [start]({% link {{ page.version.version }}/cockroach-start.md %}) the primary and standby CockroachDB clusters with the `--config-profile` flag. This enables [cluster virtualization]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}) and sets up each cluster ready for replication.

The active primary cluster that serves application traffic:

~~~shell
cockroach start ... --config-profile replication-source
~~~

The passive standby cluster that will ingest the replicated data:

~~~shell
cockroach start ... --config-profile replication-target
~~~

The node topology of the two clusters does not need to be the same. For example, you can provision the standby cluster with fewer nodes. However, consider that:

- The standby cluster requires enough storage to contain the primary cluster's data.
- During a failover scenario, the standby will need to handle the full production load. However, the clusters cannot have different region topologies (refer to [Limitations](#known-limitations)).

{{site.data.alerts.callout_info}}
Every node in the standby cluster must be able to make a network connection to every node in the primary cluster to start a replication stream successfully. Refer to [Copy certificates]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-3-copy-certificates) for details.
{{site.data.alerts.end}}

### Connect to the system virtual cluster and virtual cluster

A cluster with physical cluster replication enabled is a [virtualized cluster]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}); the primary and standby clusters each contain:

{% include {{ page.version.version }}/physical-replication/interface-virtual-cluster.md %}

To connect to a virtualized cluster using the SQL shell:

- For the system virtual cluster, include the `options=-ccluster=system` parameter in the `postgresql` connection URL:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url "postgresql://root@{your IP or hostname}:26257?options=-ccluster=system&sslmode=verify-full" --certs-dir "certs"
    ~~~

- For the application virtual cluster, include the `options=-ccluster=application` parameter in the `postgresql` connection URL:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url "postgresql://root@{your IP or hostname}:26257?options=-ccluster=application&sslmode=verify-full" --certs-dir "certs"
    ~~~

{{site.data.alerts.callout_info}}
Physical cluster replication requires an [{{ site.data.products.enterprise }} license]({% link {{ page.version.version }}/enterprise-licensing.md %}) on the primary and standby clusters. You must set {{ site.data.products.enterprise }} licenses from the system virtual cluster.
{{site.data.alerts.end}}

To connect to the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) and view the **Physical Cluster Replication** dashboard, the user must have the correct privileges. Refer to [Create a user for the standby cluster]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#create-a-user-for-the-standby-cluster).

### Manage replication in the SQL shell

To start, manage, and observe physical cluster replication, you can use the following SQL statements:

Statement | Action
----------+------
[`CREATE VIRTUAL CLUSTER ... FROM REPLICATION OF ...`]({% link {{ page.version.version }}/create-virtual-cluster.md %}) | Start a replication stream.
[`ALTER VIRTUAL CLUSTER ... PAUSE REPLICATION`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}) | Pause a running replication stream.
[`ALTER VIRTUAL CLUSTER ... RESUME REPLICATION`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}) | Resume a paused replication stream.
[`ALTER VIRTUAL CLUSTER ... START SERVICE SHARED`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}#start-a-virtual-cluster) | Initiate a [cutover]({% link {{ page.version.version }}/cutover-replication.md %}).
[`SHOW VIRTUAL CLUSTER`]({% link {{ page.version.version }}/show-virtual-cluster.md %}) | Show all virtual clusters.
[`DROP VIRTUAL CLUSTER`]({% link {{ page.version.version }}/drop-virtual-cluster.md %}) | Remove a virtual cluster.

### Cluster versions and upgrades

The standby cluster host will need to be at the same major version as, or one version ahead of, the primary's application virtual cluster at the time of cutover.

To [upgrade]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}) a virtualized cluster, you must carefully and manually apply the upgrade. For details, refer to [Upgrades]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}#upgrade-a-cluster) in the [Cluster Virtualization Overview]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}).

When physical cluster replication is enabled, we recommend following this procedure on the standby cluster first, before upgrading the primary cluster. It is preferable to avoid a situation in which the application virtual cluster, which is being replicated, is a version higher than what the standby cluster can serve if you were to cut over.

## Demo video

Learn how to harness Physical Cluster Replication to meet your RTO and RPO requirements with the following demo:

{% include_cached youtube.html video_id="VDqw4XIpEAk" %}
