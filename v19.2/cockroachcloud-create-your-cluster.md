---
title: Create Your CockroachCloud Cluster
summary: Learn how to create your CockroachCloud cluster.
toc: true
build_for: [cockroachcloud]
---

Once you have signed into your CockroachCloud account, you can create CockroachDB clusters using the CockroachCloud Console.

{{site.data.alerts.callout_info}}
Before creating a cluster, check that you have the correct organization selected. Click the drop down in the top right corner to select a specific organization. For more information on creating and managing organizations, see Organizations.
{{site.data.alerts.end}}

## Step 1. Access the Create new cluster page

1. Sign in to your CockroachCloud account.
2. On the **Overview** page, click **Create Cluster**.

##Step 2. Select the cloud provider

On the **Create new cluster** page, select either **Google Cloud** or **AWS** as your preferred cloud provider.

The choice of the cloud provider decides the performance characteristics and price per node. For optimal performance, choose the cloud platform on which your application is deployed. For pricing comparison, refer to the following table:

Hardware configuration	| GCP Pricing (per node, per month)	| AWS Pricing (per node, per month)
----------|------------|------------
Small (2 vCPU, 60 GB disk) |	$75	| $180
Medium	(4 vCPU, 100 GB disk) | $300 | $400
Large (4 vCPU, 250 GB disk) | $540	| $700

## Step 3. Select the region and number of nodes

### Select region

For optimal performance, select the cloud provider region in which you are running your application. For example, if your application is deployed in GCP's `us-east1` region, select `us-east1` for your CockroachCloud cluster.

### Select number of nodes

- For single-region application development and testing, you may create a one-node cluster.
- For single-region production deployments, we recommend a minimum of three nodes. The number of nodes also depends on your storage capacity requirements. See Example for further guidance.
- For multi-region deployments, [contact us](mailto:sales@cockroachlabs.com).

As of now, you can add a maximum of 24 nodes to your cluster.

## Step 4. Select the hardware configuration

While selecting the hardware configuration, consider the following factors:

Factor | Description
----------|------------
Capacity | Total raw data size you expect to store without replication.
Replication | The default replication factor for a CockroachCloud cluster is 3.
Buffer | Additional buffer (overhead data, accounting for data growth, etc.).
Compression | The percentage of savings you can expect to achieve with compression. With Snappy, the default algorithm, we typically see about a 40% savings on raw data size.  

To change the hardware configuration after the cluster is created, you will have to contact us.

The choice of hardware per node determines the throughput and performance characteristics of your cluster.

The following table gives the performance characteristics for YCSB and TPC-C workloads per hardware configuration:

<Performance characteristics table>
<Also include IOPS numbers for each config>

## Step 5. Name the cluster

The cluster name must be 6-20 characters in length, and can include lowercase letters, numbers, and dashes (but no leading or trailing dashes).

After entering the cluster name, click **Continue to Summary**

## Step 6. Enter your billing details

<Add info here>

## Example

Let's say we want to create a cluster to connect with an application that is running on the Google Cloud Platform in the `useast-1` region.

Suppose the raw data amount we expect to store without replication is 500 GB.
At 0.4% Compression, we can expect a savings of 200 GB. Then the amount of data we need to store is 300 GB.

Let's consider a storage buffer of 0.5% to account for overhead and data growth. Then net raw data amount to be stored is 450 GB.

With the default replication factor of 3, the total amount of data stored is (3 * 450GB) = 1350 GB.

To determine the number of nodes and the hardware configuration to store 1350 GB of data, refer to the table in [Step 2](#step-2-select-the-cloud-provider). We can see that the best option to store 1350 GB of data is 6 Large nodes.

Thus our final configuration is as follows:

Component | Selection
----------|----------
Cloud provider | GCP
Region | us-east1
Number of nodes | 6
Size | Large
