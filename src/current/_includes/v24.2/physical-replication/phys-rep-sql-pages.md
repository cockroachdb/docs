PCR happens between an _active_ primary cluster and a _passive_ standby cluster that accepts updates from the primary cluster. The unit of replication is a _virtual cluster_, which is part of the underlying infrastructure in the primary and standby clusters. The CockroachDB cluster has:

{% include {{ page.version.version }}/physical-replication/interface-virtual-cluster.md %}

For more detail, refer to the [Physical Cluster Replication Overview]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}).
