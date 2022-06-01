---
title: Serverless Performance Benchmarking
summary: Learn more about CockroachDB Serverless performance benchmarks
toc: true
docs_area: reference.benchmarking
---

This page describes {{ site.data.products.serverless }} performance benchmarking with a KV workload.

## Introduction

{{ site.data.products.serverless }} is a fully-managed, auto-scaling deployment of CockroachDB. This page describes what you can expect from the free {{ site.data.products.serverless-plan }} baseline performance of 100 RU/s and the burst performance for the same cluster. For more information about how {{ site.data.products.serverless-plan }} scales based on your workload, see [Architecture](architecture.html#performance).

### What are RUs?

{{ site.data.products.serverless }} cluster resource usage is measured by two metrics: storage and Request Units, or RUs. RUs represent the compute and I/O resources used by a query. All database operations cost a certain amount of RUs depending on the resources used. For example, a "small read" might cost 2 RUs, and a "large read" such as a full table scan with indexes could cost a large number of RUs. You can see how many request units your cluster has used on the [Cluster Overview](serverless-cluster-management.html#view-cluster-overview) page.

### What is KV 95?

KV 95 is a simple benchmark that tests linear scaling by [running a workload](../{{site.versions["stable"]}}/cockroach-workload.html#workloads) that is 95% point reads and 5% point writes. Reads and writes are distributed to keys spread uniformly across the cluster.

## Baseline performance

Baseline performance was benchmarked for a free {{ site.data.products.serverless }} cluster running in an organization without billing information on file. This is the level of performance guaranteed for all clusters that have run out of burst capacity and are throttled.

<img src="{{ 'images/cockroachcloud/serverless-performance.png' | relative_url }}" alt="Serverless performance" style="max-width:100%" />

This chart shows the linear consumption of RUs by a {{ site.data.products.serverless }} cluster under a constant [KV 95](#what-is-kv-95) workload. The total number of RUs consumed over 20 minutes is 119,536. The cluster is performing about 21 operations per second, and each operation (a point read or write) is consuming 4.86 RUs. We can also calculate that 119,536 RUs used over 1200 seconds gives us the guaranteed baseline performance of 100 RU/s. These results have been adjusted for a constant overhead of 5 RU/s that is unrelated to the workload.

## Burst performance

When the previously benchmarked cluster was not throttled to 100 RU/s, it used 86,984,376 RUs over 10 minutes, performing 54,460 operations per second and using an average of 2.66 RUs per operation. This results in a burst performance rate of 144,974 RU/s.

## Learn more

- See [CockroachDB Performance](../{{site.versions["stable"]}}/performance.html) for more information about CockroachDB performance benchmarking.
- See [SQL Performance Best Practices](../{{site.versions["stable"]}}/performance-best-practices-overview.html) for guidance on tuning real workloads.
