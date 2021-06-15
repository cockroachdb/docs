### Requirements

- Multi-region clusters must contain at least 3 regions to ensure that data replicated across regions can survive the loss of one region. For example, this applies to internal system data that is important for overall cluster operations as well as tables with the [`GLOBAL`](../{{site.versions["stable"]}}/global-tables.html) table locality or the [`REGIONAL BY TABLE`](../{{site.versions["stable"]}}/regional-tables.html#regional-tables) table locality and [`REGION` survival goal](../{{site.versions["stable"]}}/multiregion-overview.html#surviving-region-failures). 
-  Each region of a multi-region cluster must contain at least 3 nodes to ensure that data located entirely in a region can survive the loss of one node in that region. For example, this applies to tables with the [`REGIONAL BY ROW`](../{{site.versions["stable"]}}/regional-tables.html#regional-by-row-tables) table locality. 
- You can have a maximum of 9 regions per cluster through the Console. If you need to add more regions, [contact us](https://support.cockroachlabs.com).

### Recommendations

{% comment %}
- All CockroachCloud clusters use 3 Availability Zones (AZs). For balanced data distribution and best performance, we recommend using a number of nodes that is a multiple of 3 (e.g., 3, 6, or 9 nodes per region).
{% endcomment %}

- We recommend you use the same number of nodes in each region of your cluster for best performance and stability.
- When scaling up your cluster, it is generally more effective to increase node size up to 16 vCPUs before adding more nodes. For example, if you have a 3-node cluster with 2 vCPUs per node, consider scaling up to 8 vCPUs before adding a fourth node. For most production applications, we recommend at least 4 to 8 vCPUs per node.
- We recommend you add or remove regions or nodes from a cluster when the cluster isn't experiencing heavy traffic. Adding or removing regions or nodes incurs a non-trivial amount of load on the cluster. Changing the cluster configuration during times of heavy traffic can result in degraded application performance or longer times for node modifications.
- Before removing nodes from a cluster, ensure that the reduced disk space will be sufficient for the existing and anticipated data. 
- Before removing regions from a cluster, be aware that access to the database from that region will no longer be as fast.
- If you have changed the [replication factor](../{{site.versions["stable"]}}/configure-zone.html) for a cluster, you might not be able to remove nodes from the cluster. For example, suppose you have a 5-node cluster and you had previously changed the replication factor from its default value of 3 to 5. Now if you want to scale down the cluster to 3 nodes, the decommissioning nodes operation to remove nodes from the cluster might fail. To successfully remove nodes from the cluster, you will have to change the replication factor back to 3.