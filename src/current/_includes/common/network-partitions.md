A network partition occurs when two or more nodes are prevented from communicating with each other in one or both directions. A network partition can be caused by a network outage or a configuration problem with the network, such as when allowlisted IP addresses or hostnames change after a node is torn down and rebuilt.

In a **symmetric** partition, node communication is disrupted in both directions. In an **asymmetric** partition, nodes can communicate in one direction but not the other.

CockroachDB protects against asymmetric partitions by converting all asymmetric (uni-directional) network partitions into symmetric (bi-directional) network partitions. This increases cluster resiliency by reducing the number of partition-related failures that can occur.  Many temporary symmetric partitions can be recovered from automatically without operator intervention.

The effect of a network partition depends on which nodes are partitioned, where the ranges are located, and to a large extent, whether [localities]({% link {{ page.version.version }}/cockroach-start.md %}#locality) are defined. If localities are not defined, a partition that cuts off at least `(n-1)/2` nodes will cause data unavailability.
