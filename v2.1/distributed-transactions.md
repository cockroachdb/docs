---
title: Distributed Transactions
summary: CockroachDB implements efficient, fully-serializable distributed transactions.
toc: false
---

CockroachDB distributes [transactions](transactions.html) across your cluster, whether it’s a few servers in a single location or many servers across multiple datacenters. Unlike with sharded setups, you do not need to know the precise location of data; you just talk to any node in your cluster and CockroachDB gets your transaction to the right place seamlessly. Distributed transactions proceed without downtime or additional latency while rebalancing is underway. You can even move tables – or entire databases – between data centers or cloud infrastructure providers while the cluster is under load.

-   Easily build consistent applications
-   Optimistic concurrency with distributed deadlock detection
-   Serializable isolation level

<img src="{{ 'images/v2.1/2distributed-transactions.png' | relative_url }}" alt="Distributed transactions in CockroachDB" style="width: 400px" />

## See also

- [How CockroachDB Does Distributed, Atomic Transactions](https://www.cockroachlabs.com/blog/how-cockroachdb-distributes-atomic-transactions/)
- [Serializable, Lockless, Distributed: Isolation in CockroachDB](https://www.cockroachlabs.com/blog/serializable-lockless-distributed-isolation-cockroachdb/)
