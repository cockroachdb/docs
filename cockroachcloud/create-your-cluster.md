---
title: Create a CockroachDB Dedicated Cluster
summary: Learn how to create your CockroachDB Dedicated cluster.
toc: true
---

<div class="filters clearfix">
    <a href="create-a-serverless-cluster.html"><button class="filter-button page-level">{{ site.data.products.serverless }}</button></a>
    <a href="create-your-cluster.html"><button class="filter-button page-level current">{{ site.data.products.dedicated }}</button></a>
</div>

This page walks you through the process of creating a {{ site.data.products.dedicated }} cluster. Note that only [{{ site.data.products.db }} Console Administrators](console-access-management.html#console-admin) can create clusters. If you are a Developer and need to create a cluster, contact your {{ site.data.products.db }} Administrator.

{{site.data.alerts.callout_success}}
To create and connect to a 30-day free {{ site.data.products.dedicated }} cluster and run your first query, see the [Quickstart](quickstart-trial-cluster.html).
{{site.data.alerts.end}}

## Step 1. Start the cluster creation process

1. If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs_create_dedicated_cluster" rel="noopener" target="_blank">sign up for a {{ site.data.products.db }} account</a>.
1. [Log in](https://cockroachlabs.cloud/) to your {{ site.data.products.db }} account.
1. If there are multiple [organizations](console-access-management.html#organization) in your account, select the correct organization in the top right corner.
1. On the **Overview** page, click **Create Cluster**.
1. Selected the **Dedicated** plan.

## Step 2. Select the cloud provider

In the **Cloud provider** section, select either **Google Cloud** or **AWS** as your preferred cloud provider.

{{ site.data.products.db }} GCP clusters use [N1 standard](https://cloud.google.com/compute/docs/machine-types#n1_machine_types) machine types and [Persistent Disk storage](https://cloud.google.com/compute/docs/disks#pdspecs). AWS clusters use [M5 instance types](https://aws.amazon.com/ec2/instance-types/m5/#Product_Details) and [Elastic Block Store (EBS)](https://aws.amazon.com/ebs/features/). The IOPS associated with each node size in GCP is equal to 30 times the storage size, and the IOPS for AWS nodes is listed below.

{% include cockroachcloud/cockroachcloud-pricing.md %}

## Step 3. Select the region(s)

In the **Regions & nodes** section, select a region. For optimal performance, select the cloud provider region in which you are running your application. For example, if your application is deployed in GCP's `us-east1` region, select `us-east1` for your {{ site.data.products.dedicated }} cluster.

To create a multi-region cluster, click **Add regions** until you have the desired number of regions.

{{site.data.alerts.callout_info}}
Multi-region clusters must contain at least 3 regions to ensure that data spread across regions can survive the loss of one region. See [Planning your cluster](cluster-management.html?filters=dedicated#planning-your-cluster) for more information about our requirements and recommendations for cluster configuration.
{{site.data.alerts.end}}

**Known issue:** We had to temporarily disable the following GCP regions due to GCP's quota restrictions:

- Mumbai (`asia-south1`)
- Osaka (`asia-northeast2`)
- Hamina (`europe-north1`)
- Frankfurt (`europe-west3`)
- Zurich (`europe-west6`)

If you want to create a cluster in a disabled region, please [contact Support](https://support.cockroachlabs.com).

## Step 4. Select the number of nodes

In the **Regions & nodes** section, select the number of nodes. 

- For single-region application development and testing, you may create a 1-node cluster.
- For single-region production deployments, we recommend a minimum of 3 nodes. The number of nodes also depends on your storage capacity and performance requirements. See [Example](#example) for further guidance.
- For multi-region deployments, we require a minimum of 3 nodes per region. For best performance and stability, you should use the same number of nodes in each region.
- See [Planning your cluster](cluster-management.html?filters=dedicated#planning-your-cluster) for more information about our requirements and recommendations for cluster configuration.

{% include cockroachcloud/nodes-limitation.md %}

Currently, you can add a maximum of 150 nodes to your cluster. For larger configurations, [contact us](https://support.cockroachlabs.com/hc/en-us/requests/new).

## Step 5. Select the hardware per node

The choice of hardware per node determines the [cost](#step-2-select-the-cloud-provider), throughput, and performance characteristics of your cluster. To select the hardware configuration, consider the following factors:

Factor | Description
----------|------------
Capacity | Total raw data size you expect to store without replication.
Replication | The default replication factor for a {{ site.data.products.db }} cluster is 3.
Buffer | Additional buffer (overhead data, accounting for data growth, etc.). If you are importing an existing dataset, we recommend you provision at least 50% additional storage to account for the import functionality.
Compression | The percentage of savings you can expect to achieve with compression. With CockroachDB's default compression algorithm, we typically see about a 40% savings on raw data size.
Transactions per second | Each vCPU can handle around 1000 transactions per second. Hence an `Option 1` node (2vCPUs) can handle 2000 transactions per second and an `Option 2` node (4vCPUs) can handle 4000 transactions per second. If you need more than 4000 transactions per second per node, [contact us](https://support.cockroachlabs.com/hc/en-us/requests/new).

{{site.data.alerts.callout_success}}
When scaling up your cluster, it is generally more effective to increase node size up to 16 vCPUs before adding more nodes. For most production applications, we recommend at least 4 to 8 vCPUs per node.
{{site.data.alerts.end}}

For more detailed disk performance numbers, see the relevant [GCP](https://cloud.google.com/compute/docs/disks/performance) and [AWS](https://aws.amazon.com/ebs/features/#Amazon_EBS_volume_types) documentation.

To change the hardware configuration after the cluster is created, see [Cluster management](cluster-management.html).

See [Example](#example) for further guidance.

## Step 6. Name the cluster

The cluster name must be 6-20 characters in length, and can include lowercase letters, numbers, and dashes (but no leading or trailing dashes).

Click **Next**. Optionally, you can enable VPC peering for your cluster.

## Step 7. Enable VPC Peering (optional)

VPC peering is only available for GCP clusters. For AWS clusters, you can [set up AWS PrivateLink](network-authorization.html#aws-privatelink) after creating your cluster.

{{site.data.alerts.callout_info}}
If you have multiple clusters, you will have to create a new VPC Peering or AWS PrivateLink connection for each cluster.
{{site.data.alerts.end}}

You can use [VPC peering](network-authorization.html#vpc-peering) to connect your GCP application to the {{ site.data.products.db }} cluster. To enable VPC peering:

1. Under **Additional Settings**, toggle the VPC Peering switch to **Yes**.
1. Configure the IP address range and size (in CIDR format) for the {{ site.data.products.db }} network based on the following considerations:
      -  As per [GCP's overlapping subnets restriction](https://cloud.google.com/vpc/docs/vpc-peering#restrictions), configure an IP range that doesn't overlap with the IP ranges in your application network.
      - The IP range and size cannot be changed after the cluster is created. Configuring a smaller IP range size may limit your ability to expand into multiple regions in the future. We recommend configuring an IP range size of `/16` or lower.

        Alternatively, you can use {{ site.data.products.db }}'s default IP range and size (`172.28.0.0/14`) as long as it doesn't overlap with the IP ranges in your network.

        To use the default IP range, select **Use the default IP range**. To configure your own IP range, select **Configure the IP range** and enter the IP range and size in CIDR format.

        {{site.data.alerts.callout_info}}
        Custom IP ranges are temporarily unavailable for multi-region clusters.
        {{site.data.alerts.end}}

1. Click **Next**.

## Step 8. Enter billing details

1. On the **Summary** page, verify your selections for the cloud provider, region(s), number of nodes, and the hardware configuration per node.
1. Verify the hourly estimated cost for the cluster.
    {{site.data.alerts.callout_info}}
    The cost displayed does not include taxes.
    {{site.data.alerts.end}}
    You will be billed monthly.
1. Add your preferred [payment method](billing-management.html).
1. [If applicable](frequently-asked-questions.html#how-do-cockroachdb-dedicated-free-trials-work), the 30-day trial code is pre-applied to your cluster.
      {{site.data.alerts.callout_info}}
      Make sure that you [delete your trial cluster](cluster-management.html#delete-cluster) before the trial expires. Your credit card will be charged after the trial ends. You can check the validity of the code on the [Billing](billing-management.html) page.
      {{site.data.alerts.end}}
1. Click **Create cluster**.

Your cluster will be created in approximately 20-30 minutes.

## Example

Let's say we want to create a cluster to connect with an application with a requirement of 2000 TPS that is running on the Google Cloud Platform in the `us-east1` region.

Suppose the raw data amount we expect to store without replication is 500 GB.
At 40% Compression, we can expect a savings of 200 GB. Then the amount of data we need to store is 300 GB.

Let's consider a storage buffer of 50% to account for overhead and data growth. Then net raw data amount to be stored is 450 GB.

With the default replication factor of 3, the total amount of data stored is (3 * 450GB) = 1350 GB.

To determine the number of nodes and the hardware configuration to store 1350 GB of data, refer to the table in [Step 2](#step-2-select-the-cloud-provider). We can see that the best option to store 1350 GB of data is 9 `Option 2` nodes.

Let's verify if 9 `Option 2` nodes meet our performance requirements of 2000 TPS. 9 `Option 2` nodes have (9*4) = 36 vCPUs. Since each vCPU can handle around 1000 TPS, 9 `Option 2` nodes can meet our performance requirements.

Thus our final configuration is as follows:

Component | Selection
----------|----------
Cloud provider | GCP
Region | us-east1
Number of nodes | 9
Size | `Option 2`

## What's next

To start using your {{ site.data.products.db }} cluster, see the following pages:

- [Connect to your cluster](connect-to-your-cluster.html)
- [Authorize users](user-authorization.html)
- [Deploy a Python To-Do App with Flask, Kubernetes, and {{ site.data.products.db }}](deploy-a-python-to-do-app-with-flask-kubernetes-and-cockroachcloud.html)

If you created a multi-region cluster, it is important to carefully choose:

- The right [survival goal](../{{site.versions["stable"]}}/multiregion-overview.html#survival-goals) for each database.
- The right [table locality](../{{site.versions["stable"]}}/multiregion-overview.html#table-locality) for each of your tables.

Not doing so can result in unexpected latency and resiliency.  For more information, see the [Multi-Region Capabilities Overview](../stable/multiregion-overview.html).

<!--
### [WIP] Select hardware configuration based on performance requirements

Let's say we want to run a TPC-C workload with 500 warehouses on a {{ site.data.products.db }} cluster.

One TPC-C `warehouse` is about 200MB of data. CockroachDB can handle approximately 45 warehouses per vCPU. So a 4 vCPU node can handle 180 warehouses which is 36GB of unreplicated raw data.

With a default replication factor of 3, the total amount of data we need to store is (3 * 36GB) = 108GB of data.

So for a workload resembling TPC-C, we want to build out your cluster with `Option 2` nodes, and you'll only use 1/3 of the storage.

<Need numbers from the perf tests>
-->
