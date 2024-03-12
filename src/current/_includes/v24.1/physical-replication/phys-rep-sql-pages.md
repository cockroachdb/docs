Physical cluster replication happens between an _active_ primary cluster and a _passive_ standby cluster that accepts updates from the primary cluster. The unit of replication is a _virtual cluster_, which is part of the underlying infrastructure in the primary and standby clusters. Each cluster has:

- The system interface manages the cluster's control plane and the replication of the virtual cluster.
- The virtual cluster manages its own data plane. Users connect to the virtual cluster that contains the application user data.

For more detail, refer to the [Physical Cluster Replication Overview]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}).