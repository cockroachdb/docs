---
title: Performance Benchmarking with TPC-C
summary: Learn how to benchmark CockroachDB against TPC-C 1k.
toc: true
toc_not_nested: true
redirect-from: performance-benchmarking-with-tpc-c.html
---

This page shows you how to reproduce [CockroachDB's TPC-C performance benchmarking results](performance.html#scale) on commodity AWS hardware. Across all scales, CockroachDB can process tpmC (new order transactions per minute) at near maximum efficiency. Start by choosing the scale you're interested in:

<div class="filters filters-big clearfix">
  <button class="filter-button current"><strong>1000</strong></button>
  <a href="performance-benchmarking-with-tpc-c-10k-warehouses.html"><button class="filter-button">10,000</button></a>
  <a href="performance-benchmarking-with-tpc-c-100k-warehouses.html"><button class="filter-button">100,000</button></a>
</div>

Warehouses | Data size | Cluster size
-----------|-----------|-------------
1000 | 80GB | 3 nodes on `c5d.4xlarge` machines
10,000 | 800GB | 15 nodes on `c5d.4xlarge` machines
100,000 | 8TB | 81 nodes on `c5d.9xlarge` machines

TBD
