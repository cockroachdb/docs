---
title: Reads and Writes in CockroachDB
summary: Learn how reads and writes are affected by the replicated and distributed nature of data in CockroachDB.
toc: true
---

This page explains how reads and writes are affected by the replicated and distributed nature of data in CockroachDB. It starts by summarizing some important [CockroachDB architectural concepts](overview.html) and then walks you through a few simple read and write scenarios.

{{site.data.alerts.callout_info}}
For a more detailed trace of a query through the layers of CockroachDB's architecture, see [Life of a Distributed Transaction](life-of-a-distributed-transaction.html).
{{site.data.alerts.end}}

## Important concepts

{% include {{ page.version.version }}/misc/basic-terms.md %}

As mentioned above, when a query is executed, the cluster routes the request to the leaseholder for the range containing the relevant data. If the query touches multiple ranges, the request goes to multiple leaseholders. For a read request, only the leaseholder of the relevant range retrieves the data. For a write request, the Raft consensus protocol dictates that a majority of the replicas of the relevant range must agree before the write is committed.

Let's consider how these mechanics play out in some hypothetical queries.

## Read scenario

First, imagine a simple read scenario where:

- There are 3 nodes in the cluster.
- There are 3 small tables, each fitting in a single range.
- Ranges are replicated 3 times (the default).
- A query is executed against node 2 to read from table 3.

<img src="{{ 'images/v21.1/perf_tuning_concepts1.png' | relative_url }}" alt="Perf tuning concepts" style="max-width:100%" />

In this case:

1. Node 2 (the gateway node) receives the request to read from table 3.
2. The leaseholder for table 3 is on node 3, so the request is routed there.
3. Node 3 returns the data to node 2.
4. Node 2 responds to the client.

If the query is received by the node that has the leaseholder for the relevant range, there are fewer network hops:

<img src="{{ 'images/v21.1/perf_tuning_concepts2.png' | relative_url }}" alt="Perf tuning concepts" style="max-width:100%" />

## Write scenario

Now imagine a simple write scenario where a query is executed against node 3 to write to table 1:

<img src="{{ 'images/v21.1/perf_tuning_concepts3.png' | relative_url }}" alt="Perf tuning concepts" style="max-width:100%" />

In this case:

1. Node 3 (the gateway node) receives the request to write to table 1.
2. The leaseholder for table 1 is on node 1, so the request is routed there.
3. The leaseholder is the same replica as the Raft leader (as is typical), so it simultaneously appends the write to its own Raft log and notifies its follower replicas on nodes 2 and 3.
4. As soon as one follower has appended the write to its Raft log (and thus a majority of replicas agree based on identical Raft logs), it notifies the leader and the write is committed to the key-values on the agreeing replicas. In this diagram, the follower on node 2 acknowledged the write, but it could just as well have been the follower on node 3. Also note that the follower not involved in the consensus agreement usually commits the write very soon after the others.
5. Node 1 returns acknowledgement of the commit to node 3.
6. Node 3 responds to the client.

Just as in the read scenario, if the write request is received by the node that has the leaseholder and Raft leader for the relevant range, there are fewer network hops:

<img src="{{ 'images/v21.1/perf_tuning_concepts4.png' | relative_url }}" alt="Perf tuning concepts" style="max-width:100%" />

## Network and I/O bottlenecks

With the above examples in mind, it's always important to consider network latency and disk I/O as potential performance bottlenecks. In summary:

- For reads, hops between the gateway node and the leaseholder add latency.
- For writes, hops between the gateway node and the leaseholder/Raft leader, and hops between the leaseholder/Raft leader and Raft followers, add latency. In addition, since Raft log entries are persisted to disk before a write is committed, disk I/O is important.
