---
title: Disaster Recovery Tool Comparison
summary: Learn about what disaster recovery options CockroachDB provides.
toc: false
docs_area: manage
---

CockroachDB is built to be [fault-tolerant and to recover automatically]({% link {{ page.version.version }}/demo-fault-tolerance-and-recovery.md %}). However, disasters are unpredictable, and so it is essential to prepare a robust disaster recovery plan to address situations beyond the control of CockroachDB. For example, disasters can manifest as [hardware failures]({% link {{ page.version.version }}/disaster-recovery-planning.md %}#hardware-failure), [data failures]({% link {{ page.version.version }}/disaster-recovery-planning.md %}#data-failure), or [compromised security keys]({% link {{ page.version.version }}/disaster-recovery-planning.md %}#compromised-security-keys).

While CockroachDB is resilient, disaster recovery planning is also important to meet regulatory and compliance requirements.

For further on CockroachDB's automatic replication and disaster recovery tools, refer to:

- Single and multi-region replication: [Replication layer]({% link {{ page.version.version }}/architecture/replication-layer.md %})
- Physical cluster replication: [Overview]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %})
- Backup and restore: [Overview]({% link {{ page.version.version }}/backup-and-restore-overview.md %})

This table compares CockroachDB's automatic resiliency and the disaster recovery tools.

<table class="comparison-chart">
  <tr>
    <th></th>
    <th>Single-region replication (sync)</th>
    <th>Multi-region replication (sync)</th>
    <th>Physical cluster replication (async)</th>
    <th>Backup and restore</th>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>RPO</b>
    </td>
    <td>0 seconds</td>
    <td>0 seconds</td>
    <td>~10s of seconds</td>
    <td>>= 5 minutes</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>RTO</b>
    </td>
    <td>1–10 seconds</td>
    <td>1–10 seconds</td>
    <td>~10s of minutes</td>
    <td>~ minutes to hours</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Write latency</b>
    </td>
    <td>Region-local write latency<br>p50 latency &lt; 5ms<br>(for multiple AZs in <code>us-east1)</code></td>
    <td>Cross-region write latency<br>p50 latency &gt; 50ms<br>(for a MR cluster in <code>us-east1</code>, <code>us-east1</code>, <code>us-west1</code>)</td>
    <td>No impact</td>
    <td>No impact</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Recovery</b>
    </td>
    <td>Automatic</td>
    <td>Automatic</td>
    <td>Manual failover</td>
    <td>Manual restore</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Hardware cost</b>
    </td>
    <td>1x</td>
    <td>1.5x</td>
    <td>2x</td>
    <td>1x</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Minimum regions</b>
    </td>
    <td>1</td>
    <td>3</td>
    <td>2</td>
    <td>1</td>
  </tr>

  <tr>
    <td class="comparison-chart__feature">
      <b>Fault tolerance</b>
    </td>
    <td>Node, AZ failures</td>
    <td>Node, AZ, Region failure</td>
    <td>Node, AZ, Region failure</td>
    <td>N/A</td>
  </tr>
</table>