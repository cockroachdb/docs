---
title: Plan a CockroachDB Advanced Cluster
summary: Plan your cluster's configuration.
toc: true
docs_area: deploy
cloud: true
---

{% include cockroachcloud/filter-tabs/plan-your-cluster.md %}

This page describes how to plan your CockroachDB {{ site.data.products.advanced }} cluster.

Before making any changes to your cluster's configuration, review these requirements and recommendations for CockroachDB {{ site.data.products.advanced }} clusters. We recommend that you test configuration changes carefully before applying them to production clusters.

## {{ site.data.products.advanced}} cluster architecture

The following diagram shows the internal architecture and network flow of a CockroachDB {{ site.data.products.advanced }} cluster:

<img src="{{ 'images/cockroachcloud/advanced-architecture.png' | relative_url }}" alt="Diagram showing the architecture of Advanced plan Cloud deployments" style="border:1px solid #eee;max-width:100%" />

CockroachDB {{ site.data.products.cloud }} operations are split into logical layers for **control** and **data**:

- Control operations manage the CockroachDB cluster as a whole. These requests are handled by the **CockroachDB Cloud control plane** which communicates directly with cluster nodes as needed. These connections include access to the {{ site.data.products.cloud }} Console, DB Console, [Cloud API]({% link cockroachcloud/cloud-api.md %}), [observability features]({% link cockroachcloud/metrics.md %}), and other cluster management tools.
- Data operations involve connections between data applications and your underlying CockroachDB nodes, including SQL queries and responses. Each region has a network load balancer (NLB) that handles and distributes requests across CockroachDB nodes within the region. {{ site.data.products.advanced }} clusters can utilize [private connectivity]({% link cockroachcloud/private-clusters.md %}) across the cloud to limit the amount of network traffic that is sent over the public Internet.

In a "bring your own cloud" (BYOC) deployment of CockroachDB {{ site.data.products.cloud }}, the data operations layer is hosted within your own cloud service account rather than an account managed by Cockroach Labs. To learn more, [read the BYOC deployment documentation]({% link cockroachcloud/byoc-deployment.md %}).

## Cluster topology

### Single-region clusters

For single-region production deployments, Cockroach Labs recommends a minimum of 3 nodes. The number of nodes you choose also affects your storage capacity and performance. See the [Example](#example) for more information.

Some of a CockroachDB {{ site.data.products.advanced }} cluster's provisioned memory capacity is used for system overhead factors such as filesystem cache and sidecars, so the full amount of memory may not be available to the cluster's workloads.

CockroachDB {{ site.data.products.advanced }} clusters use three Availability Zones (AZs). For balanced data distribution and best performance, we recommend using a number of nodes that is a multiple of 3 (for example, 3, 6, or 9 nodes per region).

You cannot scale a multi-node cluster down to a single-node cluster. If you need to scale down to a single-node cluster, [back up]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}) your cluster and [restore]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}) it into a new single-node cluster.

### Multi-region clusters

Multi-region CockroachDB {{ site.data.products.advanced }} clusters must contain at least three regions to ensure that data replicated across regions can survive the loss of one region. For example, this applies to internal system data that is important for overall cluster operations as well as tables with the [`GLOBAL`]({% link {{site.current_cloud_version}}/global-tables.md %}) table locality or the [`REGIONAL BY TABLE`]({% link {{site.current_cloud_version}}/regional-tables.md %}#regional-tables) table locality and [`REGION` survival goal]({% link {{site.current_cloud_version}}/multiregion-survival-goals.md %}#survive-region-failures).

Each region of a multi-region cluster must contain at least 3 nodes to ensure that data located entirely in a region can survive the loss of one node in that region. For example, this applies to tables with the [`REGIONAL BY ROW`]({% link {{site.current_cloud_version}}/regional-tables.md %}#regional-by-row-tables) table locality. For best performance and stability, we recommend you use the same number of nodes in each region of your cluster.

You can configure a maximum of 9 regions per cluster through the Console. If you need to add more regions, [contact your Cockroach Labs account team](https://support.cockroachlabs.com).

{{site.data.alerts.callout_success}}
If your cluster's workload is subject to [compliance]({% link cockroachcloud/compliance.md %}) requirements such as PCI DSS or HIPAA, or to access advanced security features such as [CMEK]({% link cockroachcloud/cmek.md %}) or [Egress Perimeter Controls]({% link cockroachcloud/egress-perimeter-controls.md %}), you must enable [advanced security features]({% link cockroachcloud/create-an-advanced-cluster.md %}#step-6-configure-advanced-security-features) during cluster creation. This cannot be changed after the cluster is created. Advanced security features incurs additional costs. Refer to [Pricing](https://www.cockroachlabs.com/pricing/).
{{site.data.alerts.end}}

## Cluster sizing and scaling

A cluster's number of nodes and node capacity together determine the node's total compute and storage capacity.

When considering your cluster's scale, we recommend that you start by planning the compute requirements per node. If a workload requires more than 16 vCPUs per node, consider adding more nodes. For example, if a 3-node cluster with 8 vCPUs per node is not adequate for your workload, consider scaling up to 16 vCPUs before adding a fourth node. For most production applications, we recommend at minimum 8 vCPUs per node.  

{{site.data.alerts.callout_danger}}
Cockroach Labs does not provide support for clusters with only 2 vCPUs per node.
{{site.data.alerts.end}}

We recommend you avoid adding or removing nodes from a cluster when its load is expected to be high. Adding or removing nodes incurs a non-trivial amount of load on the cluster and can take more than half an hour per region. Changing the cluster configuration during times of heavy traffic may negatively impact application performance, and changes may take longer to be applied.

When considering scaling down a cluster's nodes, ensure that the remaining nodes have enough storage to contain the cluster's current and anticipated data.

If you remove a region from a cluster, requests from that region will be served by nodes in other regions, and may be slower as a result.

If you have changed the [replication factor](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/configure-replication-zones) for a cluster, you might need to reduce it before you can remove nodes from the cluster. For example, suppose you have a 5-node cluster with a replication factor of 5, up from the default of 3. Before you can scale the cluster down to 3 nodes, you must change the replication factor to 3.

## Storage capacity

When selecting your storage capacity, consider the following factors:

Factor      | Description
------------|------------
Capacity    | Total raw data size you expect to store without replication.
Replication | The default replication factor for a CockroachDB {{ site.data.products.cloud }} cluster is 3.
Buffer      | Additional buffer (overhead data, accounting for data growth, etc.). If you are importing an existing dataset, we recommend you provision at least 50% additional storage to account for the import functionality.
Compression | The percentage of savings you can expect to achieve with compression. With CockroachDB's default compression algorithm, we typically see about a 40% savings on raw data size.

For more details about disk performance, refer to:

- **AWS**: <a href="https://aws.amazon.com/ebs/features/">Amazon EBS volume types</a>
- **Azure**: <a href="https://learn.microsoft.com/azure/virtual-machines/disks-performance">Virtual machine and disk performance</a>
- **GCP**: <a href="https://cloud.google.com/compute/docs/disks/performance">Configure disks to meet performance requirements</a>


## Example

Let's say you want to create a cluster to connect with an application that is running on the Google Cloud Platform in the `us-east1` region, and that the application requires 2000 transactions per second.

Suppose the raw data amount you expect to store without replication is 500 GiB.
At 40% compression, you can expect a savings of 200 GiB, making the amount of data you need to store is 300 GiB.

Assume a storage buffer of 50% to account for overhead and data growth. The net raw data amount you need to store is now 450 GiB.

With the default replication factor of 3, the total amount of data stored is (3 * 450 GiB) = 1350 GiB.

To determine the number of nodes and the hardware configuration to store 1350 GiB of data, refer to the table in [Create Your Cluster]({% link cockroachcloud/create-your-cluster.md %}#step-2-select-the-cloud-provider). One way to reach a 1350 GiB storage capacity is 3 nodes with 480 GiB per node, which gives you a capacity of (3*480 GiB) = 1440 GiB.

To meet your performance requirement of 2000 TPS, consider a configuration of 3 nodes with 4 vCPUs per node. This configuration has (3*4 vCPUs) = 12 vCPUs. Each vCPU can handle around 1000 TPS, so this configuration provides 12000 TPS, which exceeds your performance requirements.

Your final configuration is as follows:

Component | Selection
----------|----------
Cloud provider | GCP
Region | us-east1
Number of nodes | 3
Compute | 4 vCPU
Storage | 480 GiB
