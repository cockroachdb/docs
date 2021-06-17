---
title: Strong Consistency
summary: CockroachDB implements consistent replication via majority consensus between replicas.
toc: false
---

CockroachDB replicates your data multiple times and guarantees consistency between replicas.

Key properties:

-   CockroachDB guarantees serializable SQL transactions
    [as long as system clocks are synchronized with NTP](https://www.cockroachlabs.com/blog/living-without-atomic-clocks/)
-   No downtime for server restarts, machine failures, or datacenter outages
-   Local or wide-area replication with no stale reads on failover
-   Employs Raft, a popular successor to Paxos

How does this work?

- Stored data is versioned with MVCC, so reads simply limit
  their scope to the data visible at the time the read transaction started.

- Writes are serviced using the
  [Raft consensus algorithm](https://raft.github.io/), a popular
  alternative to
  <a href="https://www.microsoft.com/en-us/research/publication/paxos-made-simple/" data-proofer-ignore>Paxos</a>.
  A consensus algorithm guarantees that any majority of replicas
  together always agree on whether an update was committed
  successfully. Updates (writes) must reach a majority of replicas (2
  out of 3 by default) before they are considered committed.

  To ensure that a write transaction does not interfere with
  read transactions that start after it, CockroachDB also uses
  a [timestamp cache](https://www.cockroachlabs.com/blog/serializable-lockless-distributed-isolation-cockroachdb/)
  which remembers when data was last read by ongoing transactions.

  This ensures that clients always observe serializable consistency
  with regards to other concurrent transactions.

<img src="{{ 'images/v2.0/2strong-consistency.png' | relative_url }}" alt="Strong consistency in CockroachDB" style="width: 400px" />

## See Also

- [Serializable, Lockless, Distributed: Isolation in CockroachDB](https://www.cockroachlabs.com/blog/serializable-lockless-distributed-isolation-cockroachdb/)
- [Consensus, Made Thrive](https://www.cockroachlabs.com/blog/consensus-made-thrive/)
- [Trust, But Verify: How CockroachDB Checks Replication](https://www.cockroachlabs.com/blog/trust-but-verify-cockroachdb-checks-replication/)
- [Living Without Atomic Clocks](https://www.cockroachlabs.com/blog/living-without-atomic-clocks/)
- [The CockroachDB Architecture Document](https://github.com/cockroachdb/cockroach/blob/master/docs/design.md)
