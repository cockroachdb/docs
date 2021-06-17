---
title: High Availability
summary: CockroachDB is designed to survive software and hardware failures, from server restarts to datacenter outages.
toc: false
---

CockroachDB is designed to survive software and hardware failures, from server restarts to datacenter outages. This is accomplished without confusing artifacts typical of other distributed systems (e.g., stale reads) using strongly-consistent replication as well as automated repair after failures.

## Replication

CockroachDB replicates your data for availability and guarantees consistency between replicas using the [Raft consensus algorithm](https://raft.github.io/), a popular alternative to <a href="https://www.microsoft.com/en-us/research/publication/paxos-made-simple/" data-proofer-ignore>Paxos</a>. You can [define the location of replicas](configure-replication-zones.html) in various ways, depending on the types of failures you want to secure against and your network topology. You can locate replicas on:

- Different servers within a rack to tolerate server failures
- Different servers on different racks within a datacenter to tolerate rack power/network failures
- Different servers in different datacenters to tolerate large scale network or power outages

When replicating across datacenters, be aware that the round-trip latency between datacenters will have a direct effect on your database's performance. Latency in cross-continent clusters will be noticeably worse than in clusters where all nodes are geographically close together.

## Automated repair

For short-term failures, such as a server restart, CockroachDB uses Raft to continue seamlessly as long as a majority of replicas remain available. Raft makes sure that a new “leader” for each group of replicas is elected if the former leader fails, so that transactions can continue and affected replicas can rejoin their group once they’re back online. For longer-term failures, such as a server/rack going down for an extended period of time or a datacenter outage, CockroachDB automatically rebalances replicas from the missing nodes, using the unaffected replicas as sources. Using capacity information from the gossip network, new locations in the cluster are identified and the missing replicas are re-replicated in a distributed fashion using all available nodes and the aggregate disk and network bandwidth of the cluster.
