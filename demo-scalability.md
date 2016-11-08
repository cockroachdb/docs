---
title: Demo Scalability
summary: 
toc: false
---

This page demonstrates how adding nodes to a CockroachDB cluster increases client throughput...?

create 3 nodes
echo 'range_max_bytes: 65536' | cockroach zone set .default -f -
load generator that creates schema and loads it. photos app. generate enough data to have multiple ranges.
visit admin ui while running, watch number of ranges increase
add 2 nodes
watch rebalance in admin ui

<div id="toc"></div>

## Before You Begin

Make sure you have already:

- [Installed CockroachDB](install-cockroachdb.html) 
- [Started a local cluster](start-a-local-cluster.html) in insecure mode
