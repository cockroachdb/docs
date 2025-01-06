---
title: Troubleshoot Hotspots
summary: Learn how to identify and resolve hotspots in CockroachDB
toc: true
---

## Terminology

### Hotspot

The word _hotspot_, used in different ways depending on the context, describes a variety of skewed data access patterns in a database cluster. Generally, this manifests as one or more nodes in the cluster experiencing higher CPU utilization with respect to the cluster average. Hotspots however are not strictly limited to CPU, a hotspot can be based on disk I/O, memory usage, or any other finite resource in the system.

What makes hotspots troublesome is that they are often limited to a fixed-size subset of the cluster’s resources, which puts them in a class of performance issues which cannot be solved by scaling the cluster size.

### Hot Node

A _hot node_, or a _node hotspot_, is the most common way to identify a hotspot, as observability around distributed SQL systems often has this information by default (resource utilization by node).

Identifying a hot node is often part of troubleshooting hotspots in distributed databases, and while identifying this may not be the first place you start seeing issues, it often is the first place that you can confidently say that you have a hotspot. Often, multiple nodes will become hot, but they will be clearly identifiable as their utilization metrics will be outliers compared to the rest of the cluster.

All hotspot types described by this document will create hot nodes, as long as the cluster is not already operating at maximum capacity.

Figure 1. A graph of CPU utilization broken out by node. Note how most of the nodes hover around 25%, while one node is around 95%. That the “hot” node changes indicates that the hotspot is moving as the ranges containing writes fill up and split.


### Hot Range

A _hot range_, or a _range hotspot_ is one level down from the node hotspot. Ranges have a state machine, designed for replication built on top of them, and contain a lexigraphically contiguous subset of the cluster’s data.

If a node is hot, it is often the case that a single range is hot. When a single range is hot, one of two things will generally happen. The first is that the system will recognize the range is hot, identify a boundary within its span where it can be split, and split it to redistribute the load. The alternative is that the range stays hot, until it fills up, and then splits, where the split is likely a continuation of the hotspot.

Ranges are critically important in the context of hotspots because in CockroachDB, they are the smallest unit of data distribution among hardware. If the system is unable to identify a good splitting point for a hot range, the hot range becomes a bottleneck.

Knowing which range is hot, as well as understanding the keyspace allows you to approximate the nature of the hotspot better than just node level statistics.

### Moving Hotspot

A moving hotspot describes a type of hotspot where the hotspot is moving consistently during its life. Moving hotspots are important because the load balancing algorithms that redistribute load will not effectively partition the data to resolve it.

It should be noted that the term _moving hotspot_ seeks to encapsulate both a hotspot which is moving around in the cluster (for example, from node to node) as well as a hotspot which is continuously moving within the keyspace (for example, the last 10 inserted rows on table T).

### Static Hotspot

A _static hotspot_ is immobile in the keyspace. This is not to say that the hotspot will not move from node to node (as it potentially makes each node unavailable), but that the underlying subject of the hotspot whether it be a span or a key remains the same.

A static hotspot may be moving within the cluster, but within the keyspace it remains fixed.

### Point Hotspot

A _point hotspot_ is a type of hotspot which is inherently unsplittable because the contents of the hotspot themselves are unsplittable. In practice this generally refers to a single row in the system.

### Read Hotspot

A _read hotspot, or _hot by read_, describes any hotspot pattern that is hot because of read throughput. That read throughput could be a few queries that read a large amount of data, or it could be many queries which read a small amount of data. A read hotspot can be hot because many queries request the same information, or because many queries access information close to adjacent accesses.

While hotspots are often either hot by read or hot by write, they are seldom hot because of both.

### Write Hotspot

_Write hotspots_, or _hot by write_, tend to be more limiting than hot by read. Hotspots which are hot by write require raft consensus, and therefore tend to limit query throughput at much lower rates than hot by read. Write hotspots also increase the likelihood of contention within the burdened node or range, therefore increasing the likelihood that the node or range can become unavailable.

Write hotspots also have the unique effect of affecting more than a single node, since consensus and replication must take place, write hotspots often affect three nodes (the default replication factor) rather than just one node.

### Read/Write Pressure

_Pressure_ is a term used to describe how close a resource is to its respective limit. In the metaphorical sense, pressure is the force exerted on the actual resources in the system. Pressure can be directed towards disk I/O, cpu, memory, and even non-hardware resources like locks.

Pressure becomes especially useful when correlating it with activity, for example, the read pressure on Node 1 is coming from the key `/User/10`.

Read and write pressure are especially important for circumstances when QPS is low, but utilization is high. Keys can begin to become bottlenecks, simply because of their size, which can be exacerbated by MVCC data. Rows which experience frequent updates (ASK BRIAN).

Index Tail

The _index tail_, or the _index maximum present key_ is the largest existing key of an index, lexigraphically. Note that this is different from the index or spans, as /Table/1/1 is not a valid row key, nor is /Table/2. This instead refers to the last real key which appears in the index. For example:

- Index Span: `[/Table/1/1, /Table/1/2)`
- Head and tail of the index: `[/Table/1/1/aardvark, /Table/1/1/zultan]` 