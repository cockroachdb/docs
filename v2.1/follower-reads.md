---
title: Follower Reads
summary: Follower reads are consistent reads at historical timestamps from follower replicas.
toc: false
---

Follower reads are [consistent](strong-consistency.html) reads at historical timestamps from follower [replicas](architecture/overview.html#terms). They make the non-leaseholder replicas in a range suitable sources for historical reads. This can increase read throughput by allowing every replica to serve read requests. For geo-distributed clusters, this can translate to significant latency improvements, especially for foreign key checks.

By "reads at historical timestamps", we mean that follower reads will generally only be used for queries using [`AS OF SYSTEM TIME`](as-of-system-time.html) with timestamps suitably far in the past (10-20 seconds).

Follower reads are an optimization that happens automatically in the background.  There are no user-facing changes needed to your application or SQL code to take advantage of the performance features and other improvements they provide.

<div id="toc"></div>

## How follower reads work

At the [distributed sender](architecture/distribution-layer.html#distsender) (basically the gateway node), if a read is for a historical timestamp earlier than the current time less some target duration, the read can be serviced by the non-leaseholder replica nearest the sender as measured by health, latency, and locality, provided that some conditions are met.

This is accomplished by having the leaseholder for a replica propagate a _closed timestamp_ to its followers. The closed timestamp is not only a timestamp; it is a set of conditions that guarantee that a follower replica has all the state necessary to satisfy historical reads for any timestamp less than or equal to the closed timestamp.  These conditions include that the follower replica has:

- Applied the range's Raft log through a given position to match the leaseholder (for technical reasons, this is not exactly the Raft log position, but a close approximation).

- Received a closed timestamp from its leaseholder. To ensure followers know which timestamps are safe, the leaseholder for a range regularly communicates a closed timestamp to its followers via a heartbeat mechanism.  It follows from this that the closed timestamp mechanism assumes the range has a Raft quorum (in other words, that there are no network partitions).

## Examples

The explanation and diagrams below show how the process of determining whether a replica can serve follower reads works. We show a case where a follower replica is eligible to perform follower reads, and cases where it is not eligible.

### Eligible to serve follower read

In fig. 1,

1. The **Leaseholder** accepts a write at time *T*, which is written in its Raft log at position *P*.

2. The **Follower** subsequently applies the same log position *P*, and receives a closed timestamp *C* from the leaseholder, signifying that the follower can service reads at timestamps `<=` *C*.

3. Since the closed timestamp *C* is greater than the timestamp *S* that the user wants to read from, the **Follower** can serve the read at *S* while maintaining consistency since the closed timestamp mechanism guarantees that future writes at timestamps `<=` *C* (and therefore `<=` *S*) are impossible.

<img src="{{ 'images/v2.1/follower-reads-00.png' | relative_url }}" alt="Fig. 1" style="border:1px solid #eee;max-width:100%" />

### Not eligible to serve follower read

In fig. 2, consistency cannot be guaranteed because the **Leaseholder**'s Raft log is at position *P*, whereas the **Follower** is running behind and has only applied the range's Raft log to position *P-1*.  Therefore, the follower is not eligible to service the read and it must be serviced by the leaseholder.

<img src="{{ 'images/v2.1/follower-reads-01.png' | relative_url }}" alt="Fig. 2" style="border:1px solid #eee;max-width:100%" />

In fig. 3, If the closed timestamp *C* for the range is less than *S*, then a read by the follower replica at timestamp *S* cannot be guaranteed to be consistent; only reads `<=` *C* can be served in a consistent manner by the follower replica.  Therefore, the follower is not eligible to service the read and it must be serviced by the leaseholder.

<img src="{{ 'images/v2.1/follower-reads-02.png' | relative_url }}" alt="Fig. 3" style="border:1px solid #eee;max-width:100%" />

## See Also

- [Strong Consistency](strong-consistency.html)
- [Transaction Layer](architecture/transaction-layer.html)
