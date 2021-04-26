---
title: Create a CockroachCloud Cluster
summary: Learn how to create your CockroachCloud cluster.
toc: true
redirect_from:
- ../v20.2/cockroachcloud-create-your-cluster.html
---

<div class="filters clearfix">
    <a href="create-a-free-cluster.html"><button class="filter-button page-level">CockroachCloud Free (beta)</button></a>
    <a href="create-your-cluster.html"><button class="filter-button page-level current">CockroachCloud</button></a>
</div>

This page walks you through the process of creating a CockroachCloud cluster. Note that only [CockroachCloud Console Administrators](console-access-management.html#console-admin) can create clusters. If you are a Developer and need to create a cluster, contact your CockroachCloud Administrator.

{{site.data.alerts.callout_success}}
To create and connect to a 30-day free CockroachCloud cluster and run your first query, see the [Quickstart](quickstart.html).
{{site.data.alerts.end}}

## Step 1. Start the cluster creation process

1. If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs_create_dedicated_cluster" rel="noopener" target="_blank">sign up for a CockroachCloud account</a>.
1. [Log in](https://cockroachlabs.cloud/) to your CockroachCloud account.
1. If there are multiple [organizations](console-access-management.html#organization) in your account, select the correct organization in the top right corner.
1. On the **Overview** page, click **Create Cluster**.

## Step 2. Select the cloud provider

On the **Create new cluster** page, select either **Google Cloud** or **AWS** as your preferred cloud provider.

{% include cockroachcloud/cockroachcloud-pricing.md %}

## Step 3. Select the region

For optimal performance, select the cloud provider region in which you are running your application. For example, if your application is deployed in GCP's `us-east1` region, select `us-east1` for your CockroachCloud cluster.

{{site.data.alerts.callout_info}}
Some regions in GCP and AWS might not be displayed in the **Regions** list. We run CockroachCloud in EKS and GKE - the managed Kubernetes offerings for AWS and GCP respectively - and support all regions that the offerings are available in. If a particular region is not available on the CockroachCloud console, that is due to the cloud provider not supporting the managed Kubernetes offering in that region. See list of [EKS regions](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/) and list of [GKE regions](https://cloud.google.com/about/locations/) for details.
{{site.data.alerts.end}}

**Known issue:** In addition to the non-GKE regions, we had to temporarily disable the following 4 GCP regions due to GCP's technical limitations:

- `asia-northeast2`
- `europe-north1`
- `europe-west3`
- `europe-west6`

## Step 4. Select the number of nodes

- For single-region application development and testing, you may create a one-node cluster.
- For single-region production deployments, we recommend a minimum of three nodes. The number of nodes also depends on your storage capacity and performance requirements. See [Example](#example) for further guidance.
- For multi-region deployments, [contact us](mailto:sales@cockroachlabs.com).

{{site.data.alerts.callout_info}}
You cannot create a 2-node cluster because 2-replica configurations are less reliable than a single replica.
{{site.data.alerts.end}}

As of now, you can add a maximum of 24 nodes to your cluster. For larger configurations, [contact us](https://support.cockroachlabs.com/hc/en-us/requests/new).

## Step 5. Select the hardware per node

The choice of hardware per node determines the [cost](#step-2-select-the-cloud-provider), throughput, and performance characteristics of your cluster. To select the hardware configuration, consider the following factors:

Factor | Description
----------|------------
Capacity | Total raw data size you expect to store without replication.
Replication | The default replication factor for a CockroachCloud cluster is 3.
Buffer | Additional buffer (overhead data, accounting for data growth, etc.). If you are importing an existing dataset, we recommend you provision at least 50% additional storage to account for the import functionality.
Compression | The percentage of savings you can expect to achieve with compression. With CockroachDB's default compression algorithm, we typically see about a 40% savings on raw data size.
Transactions per second | Each vCPU can handle around 1000 transactions per second. Hence an `Option 1` node (2vCPUs) can handle 2000 transactions per second and an `Option 2` node (4vCPUs) can handle 4000 transactions per second. If you need more than 4000 transactions per second per node, [contact us](https://support.cockroachlabs.com/hc/en-us/requests/new).

To change the hardware configuration after the cluster is created, you will have to [contact us](https://support.cockroachlabs.com/hc/en-us/requests/new).

See [Example](#example) for further guidance.

## Step 6. Name the cluster

The cluster name must be 6-20 characters in length, and can include lowercase letters, numbers, and dashes (but no leading or trailing dashes).

Click **Next**. Optionally, you can enable VPC peering for your cluster.

## Step 7. Enable VPC Peering (optional)

VPC peering is only available for GCP clusters. For AWS clusters, you can [set up AWS PrivateLink](network-authorization.html#aws-privatelink) after creating your cluster.

You can use [VPC peering](network-authorization.html#vpc-peering) to connect your GCP application to the CockroachCloud cluster. To enable VPC peering:

1. Under **Additional Settings**, toggle the VPC Peering switch to **Yes**.
1. Configure the IP address range and size (in CIDR format) for the CockroachCloud network based on the following considerations:
      -  As per [GCP's overlapping subnets restriction](https://cloud.google.com/vpc/docs/vpc-peering#restrictions), configure an IP range that doesn't overlap with the IP ranges in your application network.
      - The IP range and size cannot be changed after the cluster is created. Configuring a smaller IP range size may limit your ability to expand into multiple regions in the future. We recommend configuring an IP range size of `/16` or lower.

        Alternatively, you can use CockroachCloud's default IP range and size (`172.28.0.0/14`) as long as it doesn't overlap with the IP ranges in your network.

        To use the default IP range, select **Use the default IP range**. To configure your own IP range, select **Configure the IP range** and enter the IP range and size in CIDR format.

1. Click **Next**.

## Step 8. Enter billing details

1. On the **Summary** page, verify your selections for the cloud provider, region, number of nodes, and the hardware configuration per node.
1. Verify the hourly estimated cost for the cluster.
    {{site.data.alerts.callout_info}}
    The cost displayed does not include taxes.
    {{site.data.alerts.end}}
    You will be billed on the 1st and 15th of every month.
1. Add your preferred [payment method](console-access-management.html#manage-billing-for-the-organization).
1. [If applicable](frequently-asked-questions.html#how-do-cockroachcloud-free-trials-work), the 30-day trial code is pre-applied to your cluster.
      {{site.data.alerts.callout_info}}
      Make sure that you [delete your trial cluster](cluster-management.html#delete-cluster) before the trial expires. Your credit card will be charged after the trial ends. You can check the validity of the code on the [Billing](console-access-management.html#manage-billing-for-the-organization) page.
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

<!--
### [WIP] Select hardware configuration based on performance requirements

Let's say we want to run a TPC-C workload with 500 warehouses on a CockroachCloud cluster.

One TPC-C `warehouse` is about 200MB of data. CockroachDB can handle approximately 45 warehouses per vCPU. So a 4 vCPU node can handle 180 warehouses which is 36GB of unreplicated raw data.

With a default replication factor of 3, the total amount of data we need to store is (3 * 36GB) = 108GB of data.

So for a workload resembling TPC-C, we want to build out your cluster with `Option 2` nodes, and you'll only use 1/3 of the storage.

<Need numbers from the perf tests>
-->
