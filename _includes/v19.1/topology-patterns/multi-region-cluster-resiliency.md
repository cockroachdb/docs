CockroachDB stores important internal data in what are called system ranges. For example:

- The "meta" ranges contain authoritative information about the location of all data in the cluster.
- The "liveness" range contains authoritative information about which nodes are live at any given time.
- Other system ranges contain information needed to allocate new table IDs and track the status of a cluster's nodes.

For the cluster as a whole to remain available, these system ranges must retain a majority of their replicas, so CockroachDB comes with [pre-configured replication zones](configure-replication-zones.html#create-a-replication-zone-for-a-system-range) for them with the replication factor increased to `5` by default. Based on the [multi-region cluster setup](#cluster-setup) described above, with each node started with the `--locality` flag specifying its region and AZ combination, each system range's replicas are spread across 3 regions. This means that one entire region can fail without causing any system range to lose consensus:

<img src="{{ 'images/v19.1/topology-patterns/topology_multi-region_cluster_resiliency1.png' | relative_url }}" alt="Multi-region cluster resiliency" style="max-width:100%" />

However, if a broader combination of failures causes one or more important system ranges to lose consensus, the entire cluster becomes unavailable:

<img src="{{ 'images/v19.1/topology-patterns/topology_multi-region_cluster_resiliency2.png' | relative_url }}" alt="Multi-region cluster resiliency" style="max-width:100%" />
