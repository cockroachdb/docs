---
title: Strong Consistency
toc: false
---

CockroachDB implements consistent replication via majority consensus between replicas. This allows forward progress for both readers and writers in the event of failures, with no possibility of reading stale data. Applications can be written without being defensive, making them simpler and less error-prone. Consistent replication can be configured within or across datacenters for high availability. Upgrade… Patch… Restart… Rest assured, your applications won’t notice.

- 	No downtime for server restarts, machine failures, or datacenter outages
-	Local or wide-area replication with no stale reads on failover
-	Employs Raft, a popular successor to Paxos
