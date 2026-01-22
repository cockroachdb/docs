---
title: Logical Data Replication
summary: An overview of CockroachDB logical data replication (LDR).
toc: true
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}

Logical data replication is only supported in CockroachDB {{ site.data.products.core }} clusters.
{{site.data.alerts.end}}

{% include_cached new-in.html version="v24.3" %} **Logical data replication (LDR)** continuously replicates tables between an active _source_ CockroachDB cluster to an active _destination_ CockroachDB cluster. Both source and destination can receive application reads and writes, and participate in [_bidirectional_](#use-cases) LDR for eventual consistency in the replicating tables. The active-active setup between clusters can provide protection against cluster, datacenter, or region failure while still achieving single-region low latency reads and writes in the individual CockroachDB clusters. Each cluster in an LDR job still benefits individually from [multi-active availability]({% link {{ page.version.version }}/multi-active-availability.md %}) with CockroachDB's built-in [Raft replication]({% link {{ page.version.version }}/demo-replication-and-rebalancing.md %}) providing data consistency across nodes, zones, and regions.

{{site.data.alerts.callout_success}}
Cockroach Labs also has a [physical cluster replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) tool that continuously replicates data for transactional consistency from a primary cluster to an independent standby cluster.
{{site.data.alerts.end}}

## Use cases

You can run LDR in a _unidirectional_ or _bidirectional_ setup to meet different use cases that support:

- [High availability and single-region write latency in two-datacenter deployments](#achieve-high-availability-and-single-region-write-latency-in-two-datacenter-2dc-deployments)
- [Workload isolation between clusters](#achieve-workload-isolation-between-clusters)

{{site.data.alerts.callout_info}}
For a comparison of CockroachDB high availability and resilience features and tooling, refer to the [Data Resilience]({% link {{ page.version.version }}/data-resilience.md %}) page.
{{site.data.alerts.end}}

### Achieve high availability and single-region write latency in two-datacenter (2DC) deployments

Maintain [high availability]({% link {{ page.version.version }}/data-resilience.md %}#high-availability) and resilience to region failures with a two-datacenter topology. You can run bidirectional LDR to ensure [data resilience]({% link {{ page.version.version }}/data-resilience.md %}) in your deployment, particularly in datacenter or region failures. If you set up two single-region clusters, in LDR, both clusters can receive application reads and writes with low, single-region write latency. Then, in a datacenter, region, or cluster outage, you can redirect application traffic to the surviving cluster with [low downtime]({% link {{ page.version.version }}/data-resilience.md %}#high-availability). In the following diagram, the two single-region clusters are deployed in US East and West to provide low latency for that region. The two LDR jobs ensure that the tables on both clusters will reach eventual consistency.

<image src="{{ 'images/{{ page.version.version }}/east-west-region.svg' | relative_url }}" alt="Diagram showing bidirectional LDR from cluster A to B and back again from cluster B to A." style="width:60%" />

### Achieve workload isolation between clusters

Isolate critical application workloads from non-critical application workloads. For example, you may want to run jobs like [changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}) or [backups]({% link {{ page.version.version }}/backup-and-restore-overview.md %}) from one cluster to isolate these jobs from the cluster receiving the principal application traffic.

<image src="{{ 'images/{{ page.version.version }}/unidirectional.svg' | relative_url }}" alt="Diagram showing unidirectional LDR from a source cluster to a destination cluster with the destination cluster supporting secondary workloads plus jobs and the source cluster accepting the main application traffic." style="width:80%" />

## Features

- **Table-level replication**: When you initiate LDR, it will replicate all of the source table's existing data to the destination table. From then on, LDR will replicate the source table's data to the destination table to achieve eventual consistency.
- **Last write wins conflict resolution**: LDR uses [_last write wins (LWW)_ conflict resolution]({% link {{ page.version.version }}/manage-logical-data-replication.md %}#conflict-resolution), which will use the latest [MVCC]({% link {{ page.version.version }}/architecture/storage-layer.md %}#mvcc) timestamp to resolve a conflict in row insertion.
- **Dead letter queue (DLQ)**: When LDR starts, the job will create a [DLQ table]({% link {{ page.version.version }}/manage-logical-data-replication.md %}#dead-letter-queue-dlq) with each replicating table in order to track unresolved conflicts. You can interact and manage this table like any other SQL table.
- **Monitoring**: To [monitor]({% link {{ page.version.version }}/logical-data-replication-monitoring.md %}) LDR's initial progress, current status, and performance, you can view metrics available in the DB Console, Prometheus, and Metrics Export.

## Get started

- To set up unidirectional or bidirectional LDR, follow the [Set Up Logical Data Replication]({% link {{ page.version.version }}/set-up-logical-data-replication.md %}) tutorial.
- Once you've set up LDR, use the [Manage Logical Data Replication]({% link {{ page.version.version }}/manage-logical-data-replication.md %}) page to coordinate and manage different parts of the job.
- For an overview of metrics to track and monitoring tools, refer to the [Monitor Logical Data Replication]({% link {{ page.version.version }}/logical-data-replication-monitoring.md %}) page.

## Known limitations

- {% include {{ page.version.version }}/known-limitations/ldr-triggers.md %}
- {% include {{ page.version.version }}/known-limitations/ldr-udfs.md %}
- {% include {{ page.version.version }}/known-limitations/ldr-sequences.md %}
- {% include {{ page.version.version }}/known-limitations/ldr-indexes.md %}
- {% include {{ page.version.version }}/known-limitations/ldr-column-families.md %}
- {% include {{ page.version.version }}/known-limitations/ldr-composite-primary.md %}
