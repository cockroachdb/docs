---
title: Data Resilience
summary: An overview of how CockroachDB deployments can achieve resilience with built-in features and tooling.
---

CockroachDB provides built-in [_high availability_](#high-availability) features and [_disaster recovery_](#disaster-recovery) tooling to achieve operational resiliency in various deployment topologies and use cases. To maximize uptime, high availability features ensure continuous access to data without interruption even in the presence of failures or disruptions. Disaster recovery tools allow for recovery from major incidents to minimize downtime and data loss.

<image src="{{ 'images/v24.3/resilience.svg' | relative_url }}" alt="Diagram showing how high availability features and disaster recovery tools create a resilient CockroachDB deployment." style="width:80%" />

You can balance required SLAs and [recovery objectives]({% link {{ page.version.version }}/disaster-recovery-overview.md %}) with the cost and management of each of these features to build a resilient deployment.

{{site.data.alerts.callout_success}}
For a practical guide on how CockroachDB uses Raft to replicate, distribute, and rebalance data, refer to the [Replication and Rebalancing]({% link {{ page.version.version }}/demo-replication-and-rebalancing.md %}) demo.
{{site.data.alerts.end}}

## High availability

- [**Raft replication**]({% link {{ page.version.version }}/architecture/replication-layer.md %}): CockroachDB's built-in Raft replication stores data safely and consistently on multiple nodes to ensure no downtime even during a temporary node outage. [Replication controls]({% link {{ page.version.version }}/configure-replication-zones.md %}) allow you to configure the number and location of replicas to suit a deployment.
- [**Fault tolerance**]({% link {{ page.version.version }}/demo-fault-tolerance-and-recovery.md %}): Capabilities built in to CockroachDB to perform routine maintenance operations without any affect on performance. For example, [online schema changes]({% link {{ page.version.version }}/online-schema-changes.md %}), [WAL failover]({% link {{ page.version.version }}/cockroach-start.md %}#write-ahead-log-wal-failover).
- **Logical data replication (LDR)** (Preview): A cross-cluster replication tool between multiple active CockroachDB clusters, which supports a diverse range of topologies. LDR provides eventually consistent, table-level replication.

### Choose a high availability strategy

CockroachDB uses synchronous, built-in Raft replication to create and distribute copies of data, ensuring consistency across the data copies. The database can tolerate nodes going offline without service interruption, whether in a single-region or [multi-region]({% link {{ page.version.version }}/multiregion-overview.md %}) cluster.

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
    <td>Immediate mode 0.5 seconds<br>Transactional mode ~10s of seconds</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>RTO</b>
    </td>
    <td>Zero RTO<br>Potential increased latency for 1-9 seconds</td>
    <td>Zero RTO<br>Potential increased latency for 1-9 seconds</td>
    <td>Zero RTO<br>Add application cutover time</td>
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
      <b>Hardware cost</b>
    </td>
    <td>1x<br>Networking between availability zones</td>
    <td>1x<br>Networking between datacenters</td>
    <td>2x<br>Networking between availability zones or datacenters</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Minimum regions</b>
    </td>
    <td>1</td>
    <td>3</td>
    <td>2</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Fault tolerance</b>
    </td>
    <td>Zero RPO node, availability zone failures</td>
    <td>Zero RPO node, availability zone failures, region failures</td>
    <td>Zero RPO node, availability zone, region failures with loss up to RPO</td>
  </tr>

</table>

For details on designing your cluster topology for high availability with replication, refer to the [Disaster Recovery Planning]({% link {{ page.version.version }}/disaster-recovery-planning.md %}#hardware-failure) page.

## Disaster recovery

- [**Backup and point-in-time restore**]({% link {{ page.version.version }}/take-backups-with-revision-history-and-restore-from-a-point-in-time.md %}): While point-in-time backup and restore allows you to roll back to a specific point in time. Multiple supported [cloud storage]({% link {{ page.version.version }}/use-cloud-storage.md %}) providers means that you can store backups in an alternative provider. [Incremental backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}) allow you to configure backup frequency for lower [RPO]({% link {{ page.version.version }}/disaster-recovery-overview.md %}).
- [**Physical cluster replication (PCR)**]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}): A cross-cluster replication tool between an active primary and a passive standy CockroachDB cluster. PCR provides transactionally consistent full-cluster replication.

### Choose a disaster recovery strategy

CockroachDB is designed to recover automatically; however, building backups or PCR into your disaster recovery plan protects against unforeseen incidents.

{% include {{page.version.version}}/resilience/dr-feature-table.md %}