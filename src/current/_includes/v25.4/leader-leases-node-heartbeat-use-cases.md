For the purposes of [Raft replication]({% link {{ page.version.version }}/architecture/replication-layer.md %}#raft) and determining the [leaseholder]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-leaseholder) of a [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range), node health is no longer determined by heartbeating a single "liveness range"; instead it is determined using [Leader leases]({% link {{ page.version.version }}/architecture/replication-layer.md %}#leader-leases).

<a name="liveness-range"></a>

However, node heartbeats of a single range are still used to determine:

- Whether a node is still a member of a cluster (this is used by [`cockroach node decommission`]({% link {{ page.version.version }}/cockroach-node.md %}#node-decommission)).
- Whether a node is dead (in which case [its leases will be transferred away]({% link {{ page.version.version }}/architecture/replication-layer.md %}#how-leases-are-transferred-from-a-dead-node)).
- How to avoid placing replicas on dead, decommissioning or unhealthy nodes, and to make decisions about lease transfers.
