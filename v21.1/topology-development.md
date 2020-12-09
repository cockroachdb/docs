---
title: Development Topology
summary: Guidance for a single-node cluster for local development.
toc: true
---

While developing an application against CockroachDB, it's sufficient to deploy a single-node cluster close to your test application, whether that's on a single VM or on your laptop.

{{site.data.alerts.callout_success}}
If you haven't already, [review the full range of topology patterns](topology-patterns.html) to ensure you choose the right one for your use case.
{{site.data.alerts.end}}

## Prerequisites

{% include {{ page.version.version }}/topology-patterns/fundamentals.md %}

## Configuration

<img src="{{ 'images/v21.1/topology-patterns/topology_development1.png' | relative_url }}" alt="Development topology" style="max-width:100%" />

For this pattern, you can either [run CockroachDB locally](start-a-local-cluster.html) or [deploy a single-node cluster on a cloud VM](manual-deployment.html).

## Characteristics

### Latency

With the CockroachDB node in the same region as your client, and without the overhead of replication, both read and write latency are very low:

<img src="{{ 'images/v21.1/topology-patterns/topology_development_latency.png' | relative_url }}" alt="Development topology" style="max-width:100%" />

### Resiliency

In a single-node cluster, CockroachDB does not replicate data and, therefore, is not resilient to failures. If the machine where the node is running fails, or if the region or availability zone containing the machine fails, the cluster becomes unavailable:

<img src="{{ 'images/v21.1/topology-patterns/topology_development2.png' | relative_url }}" alt="Development topology" style="max-width:100%" />

## See also

{% include {{ page.version.version }}/topology-patterns/see-also.md %}
