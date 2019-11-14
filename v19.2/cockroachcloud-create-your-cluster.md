---
title: Create Your CockroachCloud Cluster
summary: Learn how to create your CockroachCloud cluster.
toc: true
build_for: [cockroachcloud]
---

This page walks you through the process of creating a CockroachCloud cluster.

## Before you begin

- Before creating a cluster, check that you have the correct [organization](cockroachcloud-create-your-account.html) selected. Click the drop down in the top right corner to select a specific organization.
- Only [CockroachCloud Console Administrators](cockroachcloud-console-access-management.html#console-admin) can create clusters. If you are a Developer and need to create a cluster, contact your CockroachCloud Administrator.

## Step 1. Access the Create new cluster page

1. [Sign in](cockroachcloud-create-your-account.html#sign-in) to your CockroachCloud account.
2. On the **Overview** page, click **Create Cluster**.

##Step 2. Select the cloud provider

On the **Create new cluster** page, select either **Google Cloud** or **AWS** as your preferred cloud provider.

The choice of the cloud provider decides the price per node. For pricing comparison, refer to the following table:

Hardware configuration	| GCP Pricing (per node, per month)	| AWS Pricing (per node, per month)
----------|------------|------------
Small (2 vCPU, 60 GB disk) |	$75	| $180
Medium	(4 vCPU, 100 GB disk) | $300 | $400
Large (4 vCPU, 250 GB disk) | $540	| $700

To enable VPC peering in the future, choose the cloud platform on which your application is deployed.

## Step 3. Select the region and number of nodes

### Select the region

For optimal performance, select the cloud provider region in which you are running your application. For example, if your application is deployed in GCP's `us-east1` region, select `us-east1` for your CockroachCloud cluster.

{{site.data.alerts.callout_info}}
Some regions in GCP and AWS might not be displayed in the **Regions** list. We run CockroachCloud in EKS and GKE - the managed Kubernetes offerings for AWS and GCP respectively - and support all regions that the offerings are available in. If a particular region is not available on the CockroachCloud console, that is due to the cloud provider not supporting the managed Kubernetes offering in that region. See list of [EKS regions](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/) and list of [GKE regions](https://cloud.google.com/about/locations/) for details.
{{site.data.alerts.end}}

**Known issue:** In addition to the non-GKE regions, we had to temporarily disable the following 4 GCP regions due to technical limitations that we are actively trying to resolve:

- `asia-northeast2`
- `europe-north1`
- `europe-west3`
- `europe-west6`

### Select the number of nodes

- For single-region application development and testing, you may create a one-node cluster.
- For single-region production deployments, we recommend a minimum of three nodes. The number of nodes also depends on your storage capacity and performance requirements. See [Example](#example) for further guidance.
- For multi-region deployments, [contact us](mailto:sales@cockroachlabs.com).

{{site.data.alerts.callout_info}}
You cannot create a 2-node cluster because 2-replica configurations are less reliable than a single replica.
{{site.data.alerts.end}}

As of now, you can add a maximum of 24 nodes to your cluster. For larger configurations, [contact us](https://support.cockroachlabs.com/hc/en-us/requests/new).

## Step 4. Select the hardware configuration

The choice of hardware per node determines the [cost](#select-the-cloud-provider), throughput, and performance characteristics of your cluster. To select the hardware configuration, consider the following factors:

Factor | Description
----------|------------
Capacity | Total raw data size you expect to store without replication.
Replication | The default replication factor for a CockroachCloud cluster is 3.
Buffer | Additional buffer (overhead data, accounting for data growth, etc.). If you are importing an existing dataset, we recommend you provision at least 50% additional storage to account for the import functionality.
Compression | The percentage of savings you can expect to achieve with compression. With CockroachDB's default compression algorithm, we typically see about a 40% savings on raw data size.
Transactions per second | Each vCPU can handle around 1000 transactions per second. Hence a Small node (2vCPUs) can handle 2000 transactions per second and a Medium/Large (4vCPUs) node can handle 4000 transactions per second. If you need more than 4000 transactions per second per node, [contact us](https://support.cockroachlabs.com/hc/en-us/requests/new).

To change the hardware configuration after the cluster is created, you will have to [contact us](https://support.cockroachlabs.com/hc/en-us/requests/new).

See [Example](#example) for further guidance.

## Step 5. Name the cluster

The cluster name must be 6-20 characters in length, and can include lowercase letters, numbers, and dashes (but no leading or trailing dashes).

After entering the cluster name, click **Continue to Payment**.

## Step 6. Enter your billing details

1. On the **Summary** page, verify your selections for the cloud provider, region, number of nodes, and the hardware configuration per node.
2. Verify the monthly estimated cost for the cluster.
    {{site.data.alerts.callout_info}}
    The cost displayed does not include taxes.
    {{site.data.alerts.end}}
    You will be billed on the 1st and 15th of every month.
3. Add your preferred [payment method](cockroachcloud-console-access-management.html#manage-billing-for-the-organization).
4. Check the **I agree to Cockroach Labs Terms of Service and Privacy Policy** box.
5. Click **Create cluster**.

Your cluster will be created in approximately 20-30 minutes.

## Example

Let's say we want to create a cluster to connect with an application with a requirement of 2000 TPS that is running on the Google Cloud Platform in the `useast-1` region.

Suppose the raw data amount we expect to store without replication is 500 GB.
At 40% Compression, we can expect a savings of 200 GB. Then the amount of data we need to store is 300 GB.

Let's consider a storage buffer of 50% to account for overhead and data growth. Then net raw data amount to be stored is 450 GB.

With the default replication factor of 3, the total amount of data stored is (3 * 450GB) = 1350 GB.

To determine the number of nodes and the hardware configuration to store 1350 GB of data, refer to the table in [Step 2](#step-2-select-the-cloud-provider). We can see that the best option to store 1350 GB of data is 6 Large nodes.

Let's verify if 6 Large nodes meet our performance requirements of 2000 TPS. 6 Large nodes have (6*4) = 24 vCPUs. Since each vCPU can handle around 1000 TPS, 6 Large nodes can meet our performance requirements.

Thus our final configuration is as follows:

Component | Selection
----------|----------
Cloud provider | GCP
Region | us-east1
Number of nodes | 6
Size | Large

<!--
### [WIP] Select hardware configuration based on performance requirements

Let's say we want to run a TPC-C workload with 500 warehouses on a CockroachCloud cluster.

One TPC-C `warehouse` is about 200MB of data. CockroachDB can handle approximately 45 warehouses per vCPU. So a 4 vCPU node can handle 180 warehouses which is 36GB of unreplicated raw data.

With a default replication factor of 3, the total amount of data we need to store is (3 * 36GB) = 108GB of data.

So for a workload resembling TPC-C, we want to build out your cluster with "medium" nodes, and you'll only use 1/3 of the storage.

<Need numbers from the perf tests>
-->
