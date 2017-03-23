---
title: Load Balancing
summary:
toc: false
---

CockroachDB replicates and distributes data for you behind-the-scenes and uses a [Gossip protocol](https://en.wikipedia.org/wiki/Gossip_protocol) to guarantee that each node can locate data across the cluster. As a result, each node is an equally suitable SQL gateway; clients can connect to any node and CockroachDB will route their requests automatically.

However, it's important to note that a gateway node does a lot of work. In addition to routing queries, it receives data from other nodes, performs its own computations, and returns results to the client. Sending all client requests to a single node will therefore result in suboptimal performance (queries per second). Instead, it's recommended to balance client workloads across nodes for more efficient and performant processing.

The guides in this section show you various ways to load balance a CockroachDB cluster:

- Use HAProxy
- Use Round-Robin DNS
