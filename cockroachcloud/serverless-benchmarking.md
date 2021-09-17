---
title: Serverless Performance Benchmarking
summary: Learn more about CockroachCloud Serverless performance benchmarks
toc: true
---

This page describes {{ site.data.products.serverless }} performance benchmarking with a KV workload.

## Introduction

{{ site.data.products.serverless }} is a fully-managed, auto-scaling deployment of CockroachDB. This page describes what you can expect from the free {{ site.data.products.serverless-plan }} baseline performance of 100 RU/s. Results for [burst performance](architecture.html#concepts) and Serverless clusters with larger budgets are coming soon. For more information about how {{ site.data.products.serverless-plan }} scales based on your workload, see [Architecture](architecture.html#performance).

### What are RUs?

Most resource usage in {{ site.data.products.serverless }} is measured in Request Units, or RUs. RUs represent the compute and I/O resources used by a query. All database operations cost a certain amount of RUs depending on the resources used. For example, a "small read" might cost 1 RU, and a "large read" such as a full table scan with indexes could cost a large number of RUs. You can see how many request units your cluster has used on the [Cluster Overview](serverless-cluster-management.html#view-cluster-overview) page.

### What is KV 95?

KV 95 is a simple benchmark that tests linear scaling by [running a workload](../{{site.versions["stable"]}}/cockroach-workload.html#workloads) that is 95% point reads and 5% point writes. Reads and writes are distributed to keys spread uniformly across the cluster.

## Baseline Performance

### Topology 

Baseline performance was benchmarked for a free {{ site.data.products.serverless-plan }} cluster hosted by an AWS 3-node cluster using `r5.4xlarge` machine type.

The RU usage was determined by monitoring the metrics provided by each of the host cluster nodes, which get updated every 10 seconds.

High vs low trust.

### Results 

Placeholder text

<img src="{{ 'images/cockroachcloud/serverless-performance.png' | relative_url }}" alt="Serverless performance" style="max-width:100%" />

## Learn more

- See [CockroachDB Performance](../{{site.versions["stable"]}}/performance.html) for more information about CockroachDB performance benchmarking.
- See [SQL Performance Best Practices](../{{site.versions["stable"]}}/performance-best-practices-overview.html) for guidance on tuning real workloads.