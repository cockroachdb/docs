---
title: Serverless Performance Benchmarking
summary: Learn more about CockroachDB Serverless performance benchmarks
toc: true
---

This page describes {{ site.data.products.serverless }} performance benchmarking with a KV workload.

## Introduction

{{ site.data.products.serverless }} is a fully-managed, auto-scaling deployment of CockroachDB. This page describes what you can expect from the free {{ site.data.products.serverless-plan }} baseline performance of 100 RU/s and the burst performance for the same cluster. For more information about how {{ site.data.products.serverless-plan }} scales based on your workload, see [Architecture](architecture.html#performance).

### What are RUs?

{{ site.data.products.serverless }} cluster resource usage is measured by two metrics: storage and Request Units, or RUs. RUs represent the compute and I/O resources used by a query. All database operations cost a certain amount of RUs depending on the resources used. For example, a "small read" might cost 2 RUs, and a "large read" such as a full table scan with indexes could cost a large number of RUs. You can see how many request units your cluster has used on the [Cluster Overview](serverless-cluster-management.html#view-cluster-overview) page.

### What is KV 95?

KV 95 is a simple benchmark that tests linear scaling by [running a workload](../{{site.versions["stable"]}}/cockroach-workload.html#workloads) that is 95% point reads and 5% point writes. Reads and writes are distributed to keys spread uniformly across the cluster.

## Baseline performance

Baseline performance was benchmarked for a free CockroachDB Serverless cluster running in an organization without billing information on file. This is the level of performance guaranteed for all clusters that have run out of burst capacity and are throttled.

<img src="{{ 'images/cockroachcloud/serverless-performance.png' | relative_url }}" alt="Serverless performance" style="max-width:100%" />

This chart shows the linear consumption of RUs by a CockroachDB Serverless cluster under a constant [KV 95](#what-is-kv-95) workload. The total number of RUs consumed over one hour is 436,876. The cluster is performing about 40 operations per second, and each operation (a point read or write) is consuming about 3 RUs. We can calculate that (40 operations/sec * 3 RUs/operation) gives us a performance of 120 RU/s. These results have been adjusted for a constant overhead of 5 RU/s that is unrelated to the workload.

## Burst performance

When not throttled to baseline performance, the same cluster we benchmarked above used 3,325,231 RUs over five minutes, performing 4,325 operations per second and using an average of 2.56 RUs per operation. This gives us a burst performance rate of 11,072 RU/s.

## Learn more

- See [CockroachDB Performance](../{{site.versions["stable"]}}/performance.html) for more information about CockroachDB performance benchmarking.
- See [SQL Performance Best Practices](../{{site.versions["stable"]}}/performance-best-practices-overview.html) for guidance on tuning real workloads.