---
title: Strong Consistency
summary: CockroachDB implements consistent replication via majority consensus between replicas.
toc: false
---

CockroachDB replicates your data multiple times and guarantees consistency between replicas 
using the [Raft consensus algorithm](https://raft.github.io/), a popular alternative to 
[Paxos](http://research.microsoft.com/en-us/um/people/lamport/pubs/paxos-simple.pdf). 
A consensus algorithm guarantees that any majority of replicas together can always provide 
the most recently written data on reads. Writes must reach a majority of replicas (2 out of 
3 by default) before they are considered committed. If a write does not reach a majority of 
replicas, it will fail, not be permanent, and will never be visible to readers. This means 
that clients always see serializable consistency when viewing data (i.e., stale reads are 
not possible).  

-   No downtime for server restarts, machine failures, or datacenter outages
-   Local or wide-area replication with no stale reads on failover
-   Employs Raft, a popular successor to Paxos

<img src="images/2strong-consistency.png" alt="Strong consistency in CockroachDB" style="width: 400px" />

## See Also

- [Consensus, Made Thrive](https://www.cockroachlabs.com/blog/consensus-made-thrive/)
- [Trust, But Verify: How CockroachDB Checks Replication](https://www.cockroachlabs.com/blog/trust-but-verify-cockroachdb-checks-replication/)
