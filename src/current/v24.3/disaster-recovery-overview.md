---
title: Disaster Recovery Overview
summary: Learn how to make your cluster resilient with high availability and disaster recovery features.
toc: true
---

Resilient deployments aim for continuity in database operations to protect from data loss and downtime. CockroachDB's built-in [Raft replication]({% link {{ page.version.version }}/architecture/replication-layer.md %}) and [fault tolerance]({% link {{ page.version.version }}/demo-cockroachdb-resilience.md %}) provide high availability. However, it is still important to design a _disaster recovery_ plan to recover from unforeseen incidents to minimize downtime and data loss.

As you evaluate CockroachDB's disaster recovery features, consider your organization's requirements for the amount of tolerable data loss and the acceptable length of time to recover.

{% include {{page.version.version}}/resilience/recovery-objectives-definition.md %}

When you use backups, RPO and RTO can be visualized as follows:

<img src="{{ 'images/{{ page.version.version }}/rpo-rto.png' | relative_url }}" alt="Simulating RPO and RTO. With RPO representing the tolerable data loss, and RTO representing the tolerable time to recovery." style="border:0px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}
For an overview of resiliency features in CockroachDB, refer to [Data Resilience]({% link {{ page.version.version }}/data-resilience.md %}).
{{site.data.alerts.end}}

## Choose a disaster recovery strategy

CockroachDB is designed to recover automatically; however, building [backups]({% link {{ page.version.version }}/backup-and-restore-overview.md %}) or [physical cluster replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) into your disaster recovery planning protects against unforeseen incidents.

{% include {{page.version.version}}/resilience/dr-feature-table.md %}

## See also

- [Set Up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %})
- [Physical Cluster Replication Technical Overview]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %})
- [Backup Architecture]({% link {{ page.version.version }}/backup-architecture.md %})
- [Backup and Restore Overview]({% link {{ page.version.version }}/backup-and-restore-overview.md %})
- [Managed Backups]({% link cockroachcloud/managed-backups.md %})
