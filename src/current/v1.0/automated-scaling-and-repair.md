---
title: Automated Scaling & Repair
summary: CockroachDB transparently manages scale with an upgrade path from a single node to hundreds.
toc: false
---

CockroachDB scales horizontally with minimal operator overhead. You can run it on your local computer, a single server, a corporate development cluster, or a private or public cloud. [Adding capacity](start-a-node.html) is as easy as pointing a new node at the running cluster. 

At the key-value level, CockroachDB starts off with a single, empty range. As you put data in, this single range eventually reaches a threshold size (64MB by default). When that happens, the data splits into two ranges, each covering a contiguous segment of the entire key-value space. This process continues indefinitely; as new data flows in, existing ranges continue to split into new ranges, aiming to keep a relatively small and consistent range size.
 
When your cluster spans multiple nodes (physical machines, virtual machines, or containers), newly split ranges are automatically rebalanced to nodes with more capacity. CockroachDB communicates opportunities for rebalancing using a peer-to-peer [gossip protocol](https://en.wikipedia.org/wiki/Gossip_protocol) by which nodes exchange network addresses, store capacity, and other information.

-   Add resources to scale horizontally, with zero hassle and no downtime
-   Self-organizes, self-heals, and automatically rebalances
-   Migrate data seamlessly between clouds

<img src="{{ 'images/v1.1/2automated-scaling-repair.png' | relative_url }}" alt="Automated scaling and repair in CockroachDB" style="width: 400px" />
