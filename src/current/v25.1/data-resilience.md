---
title: Data Resilience
summary: An overview of how CockroachDB deployments can achieve resilience with built-in features and tooling.
toc: true
---

CockroachDB provides built-in [**high availability (HA)**](#high-availability) features and [**disaster recovery (DR)**](#disaster-recovery) tooling to achieve operational resiliency in various deployment [topologies]({% link {{ page.version.version }}/topology-patterns.md %}) and use cases.

- HA features ensure continuous access to data without interruption even in the presence of [failures]({% link {{ page.version.version }}/demo-cockroachdb-resilience.md %}) or disruptions to maximize uptime.
- DR tools allow for recovery from major incidents to minimize downtime and data loss.

<image src="{{ 'images/{{ page.version.version }}/resilience.svg' | relative_url }}" alt="Diagram showing how HA features and DR tools create a resilient CockroachDB deployment." style="width:80%" />

You can balance required SLAs and recovery objectives with the cost and management of each of these features to build a resilient deployment.

{% include {{page.version.version}}/resilience/recovery-objectives-definition.md %}

{{site.data.alerts.callout_success}}
For a practical guide on how CockroachDB uses Raft to replicate, distribute, and rebalance data, refer to the [CockroachDB Resilience demo]({% link {{ page.version.version }}/demo-cockroachdb-resilience.md %}).
{{site.data.alerts.end}}

## High availability

- [**Multi-active availability**]({% link {{ page.version.version }}/multi-active-availability.md %}): CockroachDB's built-in [Raft replication]({% link {{ page.version.version }}/architecture/replication-layer.md %}) stores data safely and consistently on multiple nodes to ensure no downtime even during a temporary node outage. [Replication controls]({% link {{ page.version.version }}/configure-replication-zones.md %}) allow you to configure the number and location of [replicas]({% link {{ page.version.version }}/architecture/glossary.md %}#replica) to suit a deployment.
  - For more detail on planning for single-region or multi-region recovery, refer to [Single-region survivability planning]({% link {{ page.version.version }}/disaster-recovery-planning.md %}#single-region-survivability-planning) or [Multi-region survivability planning]({% link {{ page.version.version }}/disaster-recovery-planning.md %}#multi-region-survivability-planning).
- [**Advanced fault tolerance**]({% link {{ page.version.version }}/demo-cockroachdb-resilience.md %}): Capabilities built in to CockroachDB to perform routine maintenance operations with minimal impact to foreground performance. For example, [online schema changes]({% link {{ page.version.version }}/online-schema-changes.md %}), [write-ahead log failover]({% link {{ page.version.version }}/cockroach-start.md %}#write-ahead-log-wal-failover).
- [**Logical data replication (LDR)**]({% link {{ page.version.version }}/logical-data-replication-overview.md %}) (Preview): A cross-cluster replication tool between active CockroachDB clusters, which supports a range of topologies. LDR provides eventually consistent, table-level replication between the clusters. Individually, each active cluster uses CockroachDB multi-active availability to achieve low, single-region write latency with transactionally consistent writes using Raft replication.

### Choose an HA strategy

<table class="comparison-chart">
  <tr>
    <th></th>
    <th>Single-region replication (synchronous)</th>
    <th>Multi-region replication (synchronous)</th>
    <th>Logical data replication (asynchronous)</th>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>RPO</b>
    </td>
    <td>0 seconds</td>
    <td>0 seconds</td>
    <td>Immediate mode 0.5 seconds</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>RTO</b>
    </td>
    <td>Zero RTO<br>Potential increased latency for 1-9 seconds</td>
    <td>Zero RTO<br>Potential increased latency for 1-9 seconds</td>
    <td>Zero RTO<br>Application traffic failover time</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Write latency</b>
    </td>
    <td>Region-local write latency<br>p50 latency < 5ms (for multiple availability zones in us-east1)</td>
    <td>Cross-region write latency<br>p50 latency > 50ms  (for a multi-region cluster in us-east1, us-east-2, us-west-1)</td>
    <td>Region-local latency depending on design<br>p50 latency < 5ms (for multiple availability zones in us-east1)</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Recovery</b>
    </td>
    <td>Automatic</td>
    <td>Automatic</td>
    <td>Semi-automatic</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Fault tolerance</b>
    </td>
    <td>Zero RPO node, availability zone failures within a cluster</td>
    <td>Zero RPO node, availability zone failures, region failures within a cluster</td>
    <td>Zero RPO node, availability zone within a cluster, region failures with loss up to RPO in a two-region (or two datacenter) setup</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Minimum regions to achieve fault tolerance</b>
    </td>
    <td>1</td>
    <td>3</td>
    <td>2</td>
  </tr>

</table>

For details on designing your cluster topology for HA with replication, refer to the [Disaster Recovery Planning]({% link {{ page.version.version }}/disaster-recovery-planning.md %}#hardware-failure) page.

## Disaster recovery

- [**Backup and point-in-time restore**]({% link {{ page.version.version }}/take-backups-with-revision-history-and-restore-from-a-point-in-time.md %}): Point-in-time backup and restore allows you to roll back to a specific point in time. Multiple supported [cloud storage]({% link {{ page.version.version }}/use-cloud-storage.md %}) providers means that you can store backups in your chosen provider. [Incremental backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}) allow you to configure backup frequency for lower [RPO]({% link {{ page.version.version }}/disaster-recovery-overview.md %}).
- [**Physical cluster replication (PCR)**]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}): A cross-cluster replication tool between an active primary CockroachDB cluster and a passive standby CockroachDB cluster. PCR provides transactionally consistent full-cluster replication.

### Choose a DR strategy

CockroachDB is designed to recover automatically; however, building backups or PCR into your DR plan protects against unforeseen incidents.

{% include {{page.version.version}}/resilience/dr-feature-table.md %}

## See also

- [Architecture Overview]({% link {{ page.version.version }}/architecture/overview.md %})
- [Set Up Logical Data Replication]({% link {{ page.version.version }}/set-up-logical-data-replication.md %})
- [Set Up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %})
- [Physical Cluster Replication Technical Overview]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %})
- [Backup Architecture]({% link {{ page.version.version }}/backup-architecture.md %})
- [Backup and Restore Overview]({% link {{ page.version.version }}/backup-and-restore-overview.md %})
- [Managed Backups]({% link cockroachcloud/managed-backups.md %})