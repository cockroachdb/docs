### Requirements

- Multi-region clusters require at least 3 nodes per region.
- We don't allow 2-region clusters because they are less stable and would be unable to survive a single region failure.
- We don't allow 2-node clusters because 2-replica configurations are less reliable than a single replica.
- You can have a maximum of 9 regions per cluster through the console. If you need to add more regions, [contact us](https://support.cockroachlabs.com).

### Recommendations

We recommend you use the same number of nodes in each region of your cluster for best performance and stability. GCP clusters use 3 Availability Zones (AZs), and AWS clusters use either 3 or 4 AZs. For balanced data distribution and best performance, we recommend using a number of nodes that is a multiple of the number of AZs. For example, a GCP cluster with 3 AZs would have balanced data distribution with 3, 6, or 9 nodes per region.

Adding or removing regions or nodes incurs a non-trivial amount of load on the cluster. Changing the cluster configuration during times of heavy traffic can result in degraded application performance or longer times for node modifications. We recommend you add or remove regions or nodes from a cluster when the cluster isn't experiencing heavy traffic.

Before removing nodes from a cluster, ensure that the reduced disk space will be sufficient for the existing and anticipated data. Before removing regions from a cluster, be aware that access to the database from that region will no longer be as fast.

If you have changed the [replication factor](../{{site.versions["stable"]}}/configure-zone.html) for a cluster, you might not be able to remove nodes from the cluster. For example, suppose you have a 5-node cluster and you had previously changed the replication factor from its default value of 3 to 5. Now if you want to scale down the cluster to 3 nodes, the decommissioning nodes operation to remove nodes from the cluster might fail. To successfully remove nodes from the cluster, you will have to change the replication factor back to 3.