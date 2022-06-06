---
title: Plan a CockroachDB Cloud Cluster
summary: Plan your cluster's configuration.
toc: true
docs_area: manage
redirect_from: planning-your-serverless-cluster.html
---

This page describes how to plan your {{ site.data.products.dedicated }} or {{ site.data.products.serverless }} cluster.

## Planning your cluster

Before making any changes to your cluster's configuration, review the requirements and recommendations for {{ site.data.products.db }} clusters.

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="serverless">{{ site.data.products.serverless }}</button>
  <button class="filter-button page-level" data-scope="dedicated">{{ site.data.products.dedicated }}</button>
</div>

<section class="filter-content" markdown="1" data-scope="serverless">

### Request Units

With {{ site.data.products.serverless }}, you are charged for the storage and activity of your cluster. All cluster activity, including SQL queries, bulk operations, and background jobs, is measured in Request Units, or RUs. RUs are an abstracted metric that represent the size and complexity of requests made to your cluster. All database operations cost a certain amount of RUs depending on the resources used. For example, a "small read" might cost 2 RUs, and a "large read" such as a full table scan with indexes might cost 100 RUs.

The cost to do a prepared point read (fetching a single row by its key) of a 64 byte row is approximately 1 RU:

  ~~~ shell
  SELECT * FROM table_with_64_byte_rows WHERE key = $1;
  ~~~

Writing a 64 byte row costs approximately7 RUs, which includes the cost of replicating the write 3 times for high availability and durability:

  ~~~ shell
  INSERT INTO table_with_64_byte_rows (key, val) VALUES (100, $1);
  ~~~

RU and storage consumption is prorated at the following prices:

  Activity Measure        | Price
  ------------------------|------
  10M Request Units       | $1.00
  1 GiB storage per month | $0.50

### Cluster scaling

{{ site.data.products.serverless }} clusters scale based on your workload. Baseline performance for a Serverless cluster is 100 RUs per second, and any usage above that is called [burst performance](architecture.html#cockroachdb-cloud-terms). Clusters start with 10M RUs of free burst capacity each month and earn 100 RUs per second up to a maximum of 250M free RUs per month. Earned RUs can be used immediately or accumulated as burst capacity. If you use all of your burst capacity, your cluster will revert to baseline performance.

You can set your spend limit higher to maintain a high level of performance with larger workloads. If you have set a spend limit, your cluster will not be throttled to baseline performance once you use all of your free earned RUs. Instead, it will continue to use burst performance as needed until you reach your spend limit. You will only be charged for the resources you use up to your spend limit. If you reach your spend limit, your cluster will revert to the baseline performance of 100 RUs per second.

The following diagram shows how RUs are accumulated and consumed:

<img src="{{ 'images/cockroachcloud/ru-diagram.png' | relative_url }}" alt="RU diagram" style="max-width:100%" />

### Resource usage

{% include cockroachcloud/serverless-usage.md %}

All [Console Admins](console-access-management.html#console-admin) will receive email alerts when your cluster reaches 75% and 100% of its burst capacity or storage limit. If you set a spend limit, you will also receive alerts at 50%, 75%, and 100% of your spend limit.

### Serverless Example 

Let's say you have an application that processes sensor data at the end of the week. Most of the week it handles only occasional read requests and uses under the 100 RUs per second baseline. At the end of the week the sensors send in their data to the application, requiring a performance burst over the 100 RUs per second baseline. When the cluster requires more than 100 RUs per second to cover the burst, it first spends the earned RUs that accrued over the previous week and the 10M free burst RUs given to the cluster each month. 

If you have a free cluster, it will be throttled to baseline performance once all of the free and earned burst RUs are used. The sensor data will still be processed while the cluster is throttled, but it may take longer to complete the job. If you have set a spend limit set, the cluster will be able to scale up and spend RUs to cover the burst, up to your maximum spend limit. If you reach your spend limit at any point during the month, your cluster will be throttled to baseline performance.

If your cluster gets throttled after using all of its burst capacity during the high load period, it will still earn RUs during lower load periods and be able to burst again. At the end of the month, your usage will reset and you will receive another 10M free burst RUs.
</section>
<section class="filter-content" markdown="1" data-scope="dedicated">

### Cluster configuration

A single node cluster is only appropriate for single-region application development and testing. For single-region production deployments, we recommend a minimum of 3 nodes. The number of nodes you choose also affects your storage capacity and performance. See the [Example](#dedicated-example) for more information.

All {{ site.data.products.db }} clusters use 3 Availability Zones (AZs). For balanced data distribution and best performance, we recommend using a number of nodes that is a multiple of 3 (e.g., 3, 6, or 9 nodes per region).

#### Multi-region clusters

Multi-region clusters must contain at least 3 regions to ensure that data replicated across regions can survive the loss of one region. For example, this applies to internal system data that is important for overall cluster operations as well as tables with the [`GLOBAL`](../{{site.versions["stable"]}}/global-tables.html) table locality or the [`REGIONAL BY TABLE`](../{{site.versions["stable"]}}/regional-tables.html#regional-tables) table locality and [`REGION` survival goal](../{{site.versions["stable"]}}/multiregion-overview.html#surviving-region-failures). 

Each region of a multi-region cluster must contain at least 3 nodes to ensure that data located entirely in a region can survive the loss of one node in that region. For example, this applies to tables with the [`REGIONAL BY ROW`](../{{site.versions["stable"]}}/regional-tables.html#regional-by-row-tables) table locality. We recommend you use the same number of nodes in each region of your cluster for best performance and stability.

You can have a maximum of 9 regions per cluster through the Console. If you need to add more regions, [contact us](https://support.cockroachlabs.com). 

### Cluster scaling

When scaling up your cluster, it is generally more effective to increase node size up to 16 vCPUs before adding more nodes. For example, if you have a 3 node cluster with 2 vCPUs per node, consider scaling up to 8 vCPUs before adding a fourth node. For most production applications, we recommend at least 4 to 8 vCPUs per node.

We recommend you add or remove nodes from a cluster when the cluster isn't experiencing heavy traffic. Adding or removing nodes incurs a non-trivial amount of load on the cluster. Changing the cluster configuration during times of heavy traffic can result in degraded application performance or longer times for node modifications. Before removing nodes from a cluster, ensure that the reduced disk space will be sufficient for the existing and anticipated data. 

If you have changed the [replication factor](../{{site.versions["stable"]}}/configure-zone.html) for a cluster, you might not be able to remove nodes from the cluster. For example, suppose you have a 5-node cluster and you had previously changed the replication factor from its default value of 3 to 5. Now if you want to scale down the cluster to 3 nodes, the decommissioning nodes operation might fail. To successfully remove nodes from the cluster in this example, change the replication factor back to 3, and then remove the nodes.
{% comment %}
When AZ zones are updated:
When add/remove regions is available:
- We recommend you add or remove regions or nodes from a cluster when the cluster isn't experiencing heavy traffic. Adding or removing regions or nodes incurs a non-trivial amount of load on the cluster. Changing the cluster configuration during times of heavy traffic can result in degraded application performance or longer times for node modifications.
- Before removing regions from a cluster, be aware that access to the database from that region will no longer be as fast.
{% endcomment %}

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
</section>