---
title: Plan a CockroachDB Dedicated Cluster
summary: Plan your cluster's configuration.
toc: true
docs_area: deploy
---

This page describes how to plan your {{ site.data.products.dedicated }} cluster.

## Planning your cluster

Before making any changes to your cluster's configuration, review the requirements and recommendations for {{ site.data.products.dedicated }} clusters.

### Cluster configuration

A single node cluster is only appropriate for single-region application development and testing. For single-region production deployments, we recommend a minimum of 3 nodes. The number of nodes you choose also affects your storage capacity and performance. See the [Example](#dedicated-example) for more information.

All {{ site.data.products.db }} clusters use 3 Availability Zones (AZs). For balanced data distribution and best performance, we recommend using a number of nodes that is a multiple of 3 (e.g., 3, 6, or 9 nodes per region).

#### {{ site.data.products.dedicated }} advanced

You should choose {{ site.data.products.dedicated }} advanced if your cluster needs access to all features required for [PCI compliance](../{{site.versions["stable"]}}/security-reference/security-overview.html). {{ site.data.products.dedicated }} advanced clusters have all the same features as {{ site.data.products.dedicated }} base clusters with the addition of these security features.


#### Multi-region clusters

Multi-region clusters must contain at least 3 regions to ensure that data replicated across regions can survive the loss of one region. For example, this applies to internal system data that is important for overall cluster operations as well as tables with the [`GLOBAL`](../{{site.current_cloud_version}}/global-tables.html) table locality or the [`REGIONAL BY TABLE`](../{{site.current_cloud_version}}/regional-tables.html#regional-tables) table locality and [`REGION` survival goal](../{{site.current_cloud_version}}/multiregion-overview.html#surviving-region-failures).

Each region of a multi-region cluster must contain at least 3 nodes to ensure that data located entirely in a region can survive the loss of one node in that region. For example, this applies to tables with the [`REGIONAL BY ROW`](../{{site.current_cloud_version}}/regional-tables.html#regional-by-row-tables) table locality. We recommend you use the same number of nodes in each region of your cluster for best performance and stability.

You can have a maximum of 9 regions per cluster through the Console. If you need to add more regions, [contact us](https://support.cockroachlabs.com).

### Cluster scaling

{{site.data.alerts.callout_info}}
The ability to add and remove regions from a cluster through the Console is temporarily disabled. If you need to do this, [contact support](https://support.cockroachlabs.com).
{{site.data.alerts.end}}

When scaling up your cluster, it is generally more effective to increase node size up to 16 vCPUs before adding more nodes. For example, if you have a 3 node cluster with 2 vCPUs per node, consider scaling up to 8 vCPUs before adding a fourth node. For most production applications, we recommend at least 4 to 8 vCPUs per node.

We recommend you add or remove nodes from a cluster when the cluster isn't experiencing heavy traffic. Adding or removing nodes incurs a non-trivial amount of load on the cluster and takes about 30 minutes per region. Changing the cluster configuration during times of heavy traffic can result in degraded application performance or longer times for node modifications. Before removing nodes from a cluster, ensure that the reduced disk space will be sufficient for the existing and anticipated data. Before removing regions from a cluster, be aware that access to the database from that region will no longer be as fast.

If you have changed the [replication factor](../{{site.current_cloud_version}}/configure-replication-zones.html) for a cluster, you might not be able to remove nodes from the cluster. For example, suppose you have a 5-node cluster and you had previously changed the replication factor from its default value of 3 to 5. Now if you want to scale down the cluster to 3 nodes, the decommissioning nodes operation might fail. To successfully remove nodes from the cluster in this example, change the replication factor back to 3, and then remove the nodes.

### Dedicated Example

Let's say you want to create a cluster to connect with an application with a requirement of 2000 TPS that is running on the Google Cloud Platform in the `us-east1` region.

Suppose the raw data amount you expect to store without replication is 500 GiB.
At 40% compression, you can expect a savings of 200 GiB, making the amount of data you need to store is 300 GiB.

Assume a storage buffer of 50% to account for overhead and data growth. The net raw data amount you need to store is now 450 GiB.

With the default replication factor of 3, the total amount of data stored is (3 * 450 GiB) = 1350 GiB.

To determine the number of nodes and the hardware configuration to store 1350 GiB of data, refer to the table in [Create Your Cluster](create-your-cluster.html#step-2-select-the-cloud-provider). One way to reach a 1350 GiB storage capacity is 3 nodes with 480 GiB per node, which gives you a capacity of (3*480 GiB) = 1440 GiB.

Let's see how many vCPUs you need to meet your performance requirement of 2000 TPS. We don't recommend 2 vCPU nodes for production, so the first compute configuration you should check is 3 nodes with 4 vCPUs per node. This configuration has (3*4 vCPUs) = 12 vCPUs. Since each vCPU can handle around 1000 TPS, a configuration of 4 vCPUs per node meets your performance requirements.

Your final configuration is as follows:

Component | Selection
----------|----------
Cloud provider | GCP
Region | us-east1
Number of nodes | 3
Compute | 4 vCPU
Storage | 480 GiB
