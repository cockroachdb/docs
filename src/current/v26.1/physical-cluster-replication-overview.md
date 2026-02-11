---
title: Physical Cluster Replication
summary: An overview of CockroachDB physical cluster replication (PCR).
toc: true
docs_area: manage
---

CockroachDB **physical cluster replication (PCR)** continuously sends all data at the cluster level from a _primary_ cluster to an independent _standby_ cluster. Existing data and ongoing changes on the active primary cluster, which is serving application data, replicate asynchronously to the passive standby cluster. 

You can [_fail over_]({% link {{ page.version.version }}/failover-replication.md %}) from the primary cluster to the standby cluster. This will stop the replication stream, reset the standby cluster to a point in time (in the past or future) where all ingested data is consistent, and make the standby ready to accept application traffic. 

For a list of requirements for PCR, refer to the [Before you begin]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#before-you-begin) section of the [setup tutorial]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}).

{{site.data.alerts.callout_success}}
Cockroach Labs also has a [logical data replication]({% link {{ page.version.version }}/logical-data-replication-overview.md %}) tool that continuously replicates tables between an active _source_ CockroachDB cluster to an active _destination_ CockroachDB cluster. Both source and destination can receive application reads and writes, and participate in [_bidirectional_]({% link {{ page.version.version }}/logical-data-replication-overview.md %}#use-cases) LDR for eventual consistency in the replicating tables.
{{site.data.alerts.end}}

## Use cases

You can use PCR to:

- Meet your RTO (Recovery Time Objective) and RPO (Recovery Point Objective) requirements. PCR provides lower RTO and RPO than [backup and restore]({% link {{ page.version.version }}/backup-and-restore-overview.md %}).
- Automatically replicate everything in your primary cluster to recover quickly from a control plane or full cluster failure.
- Protect against region failure when you cannot use individual [multi-region clusters]({% link {{ page.version.version }}/multiregion-overview.md %})—for example, if you have a two-datacenter architecture and do not have access to three regions; or, you need low-write latency in a single region. PCR allows for an active-passive (primary-standby) structure across two clusters with the passive cluster in a different region.
- Quickly recover from user error (for example, dropping a database) by [failing over]({% link {{ page.version.version }}/failover-replication.md %}) to a time in the near past.
- Create a [blue-green deployment model](https://en.wikipedia.org/wiki/Blue%E2%80%93green_deployment) by using the standby cluster for testing upgrades and hardware changes.

## Features

- **Asynchronous cluster-level replication**: When you initiate a replication stream, it will replicate byte-for-byte all of the primary cluster's existing user data and associated metadata to the standby cluster asynchronously. From then on, it will continuously replicate the primary cluster's data and metadata to the standby cluster. PCR will automatically replicate changes related to operations such as [schema changes]({% link {{ page.version.version }}/online-schema-changes.md %}), user and [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) modifications, and [zone configuration]({% link {{ page.version.version }}/show-zone-configurations.md %}) updates without any manual work.
- **Transactional consistency**: Avoid conflicts in data after recovery; the replication completes to a transactionally consistent state.
- **Improved RPO and RTO**: Depending on workload and deployment configuration, [replication lag]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}) between the primary and standby is generally in the tens-of-seconds range. The failover process from the primary cluster to the standby should typically happen within five minutes when completing a failover to the latest replicated time using [`LATEST`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}#synopsis).
- **Failover to a timestamp in the past or the future**: In the case of logical disasters or mistakes, you can [fail over]({% link {{ page.version.version }}/failover-replication.md %}) from the primary to the standby cluster to a timestamp in the past. This means that you can return the standby to a timestamp before the mistake was replicated to the standby. Furthermore, you can plan a failover by specifying a timestamp in the future.
- **Fast failback**: Switch back from the promoted standby cluster to the original primary cluster after a failover event by replicating net-new changes rather than fully replacing existing data for an initial scan.
- **Read from standby cluster**: You can configure PCR to allow `SELECT` queries on the standby cluster. For more details, refer to [Start a PCR stream with read from standby]({% link {{ page.version.version }}/create-virtual-cluster.md %}#start-a-pcr-stream-with-read-from-standby).
- **Monitoring**: To monitor the replication's initial progress, current status, and performance, you can use metrics available in the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) and [Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}). For more details, refer to [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}).

## Known limitations

{% include {{ page.version.version }}/known-limitations/physical-cluster-replication.md %}
- {% include {{ page.version.version }}/known-limitations/failover-stop-application.md %}

{{site.data.alerts.callout_info}}
Frequent large schema changes or imports may cause a significant spike in [replication lag]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}).
{{site.data.alerts.end}}

## Get started

This section is a quick overview of the initial requirements to start a replication stream. For more comprehensive guides, refer to:

- [Cluster Virtualization Overview]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}): for information on enabling cluster virtualization, a requirement for setting up PCR.
- [Set Up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}): for a tutorial on how to start a replication stream.
- [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}): for detail on metrics and observability into a replication stream.
- [Fail Over from a Primary Cluster to a Standby Cluster]({% link {{ page.version.version }}/failover-replication.md %}): for a guide on how to complete a replication stream and fail over to the standby cluster.
- [Technical Overview]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}): to understand PCR in more depth before setup.

### Manage replication in the SQL shell

To start, manage, and observe PCR, you can use the following SQL statements:

Statement | Action
----------+------
[`CREATE VIRTUAL CLUSTER ... FROM REPLICATION OF ...`]({% link {{ page.version.version }}/create-virtual-cluster.md %}) | Start a replication stream.
[`ALTER VIRTUAL CLUSTER ... PAUSE REPLICATION`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}) | Pause a running replication stream.
[`ALTER VIRTUAL CLUSTER ... RESUME REPLICATION`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}) | Resume a paused replication stream.
[`ALTER VIRTUAL CLUSTER ... START SERVICE SHARED`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}) | Initiate a [failover]({% link {{ page.version.version }}/failover-replication.md %}).
[`SHOW VIRTUAL CLUSTER`]({% link {{ page.version.version }}/show-virtual-cluster.md %}) | Show all virtual clusters.
[`DROP VIRTUAL CLUSTER`]({% link {{ page.version.version }}/drop-virtual-cluster.md %}) | Remove a virtual cluster.

## Cluster versions and upgrades

To safely perform a major version upgrade on a cluster with PCR, you must upgrade the standby cluster before the primary cluster to avoid version incompatibility. If you are using a reader virtual cluster (reader VC), you must upgrade it separately from the primary and standby clusters. 

Follow the process described in [Upgrade a Cluster Running PCR]({% link {{ page.version.version }}/upgrade-with-pcr.md %}).

## Demo video

Learn how to use PCR to meet your RTO and RPO requirements with the following demo:

{% include_cached youtube.html video_id="5hpAqUErUic" %}