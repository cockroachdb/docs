---
title: Create a CockroachDB Dedicated Cluster
summary: Learn how to create your CockroachDB Dedicated cluster.
toc: true
docs_area: deploy
---

{% include cockroachcloud/filter-tabs/create-cluster-cloud.md %}

This page walks you through the process of creating a {{ site.data.products.dedicated }} cluster. Note that only [{{ site.data.products.db }} Console Administrators](console-access-management.html#console-admin) can create clusters. If you are a Developer and need to create a cluster, contact your {{ site.data.products.db }} Administrator.

{{site.data.alerts.callout_success}}
To create and connect to a 30-day free {{ site.data.products.dedicated }} cluster and run your first query, see the [Quickstart](quickstart-trial-cluster.html).
{{site.data.alerts.end}}

## Step 1. Start the cluster creation process

1. If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs_create_dedicated_cluster" rel="noopener" target="_blank">sign up for a {{ site.data.products.db }} account</a>.
{% include cockroachcloud/prefer-sso.md %}
1. [Log in](https://cockroachlabs.cloud/) to your {{ site.data.products.db }} account.
1. If there are multiple [organizations](console-access-management.html#organization) in your account, select the correct organization in the top right corner.
1. On the **Overview** page, click **Create Cluster**.
1. Selected the **Dedicated** plan.

## Step 2. Select the cloud provider

In the **Cloud provider** section, select either **Google Cloud** or **AWS** as your preferred cloud provider.

{{site.data.alerts.callout_info}}
You do not need an account with the cloud provider you choose in order to create a cluster on that cloud provider. The cluster is created on infrastructure managed by Cockroach Labs. If you have existing cloud services on either GCP or AWS that you intend to use with your {{ site.data.products.dedicated }} cluster, you should select that cloud provider and the region closest to your existing cloud services to maximize performance.
{{site.data.alerts.end}}

{{ site.data.products.db }} GCP clusters use [N1 standard](https://cloud.google.com/compute/docs/machine-types#n1_machine_types) machine types and [Persistent Disk storage](https://cloud.google.com/compute/docs/disks#pdspecs). AWS clusters use [M5 instance types](https://aws.amazon.com/ec2/instance-types/m5/#Product_Details) and [Elastic Block Store (EBS)](https://aws.amazon.com/ebs/features/).

For GCP clusters, each GiB of storage costs  $0.0011986 per hour, and 30 IOPS per GiB are provisioned. For AWS clusters, each GiB of storage costs $0.0005088 per hour, and 15 IOPS per GiB are provisioned at an additional cost of $0.0000196 per IOPS per hour.

{% include cockroachcloud/cockroachcloud-pricing.md %}

## Step 3. Select the region(s)

In the **Regions & nodes** section, select a region. For optimal performance, select the cloud provider region in which you are running your application. For example, if your application is deployed in GCP's `us-east1` region, select `us-east1` for your {{ site.data.products.dedicated }} cluster.

To create a multi-region cluster, click **Add regions** until you have the desired number of regions.

{{site.data.alerts.callout_info}}
Multi-region clusters must contain at least 3 regions to ensure that data spread across regions can survive the loss of one region. See [Planning your cluster](plan-your-cluster.html?filters=dedicated) for the requirements and recommendations for {{ site.data.products.dedicated }} cluster configuration.
{{site.data.alerts.end}}

**Known issue:** We had to temporarily disable the following GCP regions due to GCP's quota restrictions:

- Mumbai (`asia-south1`)
- Osaka (`asia-northeast2`)
- Hamina (`europe-north1`)
- Frankfurt (`europe-west3`)
- Zurich (`europe-west6`)

If you want to create a cluster in a disabled or unavailable region, please [contact Support](https://support.cockroachlabs.com).

## Step 4. Select the number of nodes

In the **Regions & nodes** section, select the number of nodes.

- For single-region application development and testing, you may create a 1 node cluster.
- For single-region production deployments, we recommend a minimum of 3 nodes. The number of nodes also depends on your storage capacity and performance requirements. See [Example](plan-your-cluster.html?filters=dedicated#dedicated-example) for further guidance.
- For multi-region deployments, we require a minimum of 3 nodes per region. For best performance and stability, you should use the same number of nodes in each region.
- See [Plan a CockroachDB Cloud cluster](plan-your-cluster.html?filters=dedicated) for the requirements and recommendations for {{ site.data.products.dedicated }} cluster configuration.

{% include cockroachcloud/nodes-limitation.md %}

Currently, you can add a maximum of 150 nodes to your cluster. For larger configurations, [contact us](https://support.cockroachlabs.com/hc/en-us/requests/new).

## Step 5. Select the hardware per node

{% capture cap_per_vcpu %}{% include_cached v22.1/prod-deployment/provision-storage.md %}{% endcapture %}

The choice of hardware per node determines the [cost](#step-2-select-the-cloud-provider), throughput, and performance characteristics of your cluster.

1. Select the **Compute**.

    When selecting your compute power, consider the following factors:

    Factor | Description
    ----------|------------
    Transactions per second | Each vCPU can handle around 1000 transactions per second. For example, 2 vCPUs can handle 2000 transactions per second and 4 vCPUs can handle 4000 transactions per second.
    Scaling | When scaling up your cluster, it is generally more effective to increase node size up to 16 vCPUs before adding more nodes. For most production applications, we recommend **at least 4 to 8 vCPUs per node**.

1. Select the **Storage**.

    {{site.data.alerts.callout_danger}}
    Storage space cannot be removed from a node once added.
    {{site.data.alerts.end}}

    We recommending choosing up to {{ cap_per_vcpu | strip_html }}. See [Step 2](#step-2-select-the-cloud-provider) for pricing information. When selecting your storage capacity, consider the following factors:

    Factor | Description
    ----------|------------
    Capacity | Total raw data size you expect to store without replication.
    Replication | The default replication factor for a {{ site.data.products.db }} cluster is 3.
    Buffer | Additional buffer (overhead data, accounting for data growth, etc.). If you are importing an existing dataset, we recommend you provision at least 50% additional storage to account for the import functionality.
    Compression | The percentage of savings you can expect to achieve with compression. With CockroachDB's default compression algorithm, we typically see about a 40% savings on raw data size.

    For more detailed disk performance numbers, see the relevant [GCP](https://cloud.google.com/compute/docs/disks/performance) and [AWS](https://aws.amazon.com/ebs/features/#Amazon_EBS_volume_types) documentation.

To change the hardware configuration after the cluster is created, see [Manage a {{ site.data.products.dedicated }} Cluster](cluster-management.html).

See the [Example](plan-your-cluster.html?filters=dedicated#dedicated-example) for further guidance.

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

        Once your cluster is created, see [Establish VPC Peering or AWS PrivateLink](connect-to-your-cluster.html#establish-vpc-peering-or-aws-privatelink) to finish setting up VPC Peering for your cluster.

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

## What's next

To start using your {{ site.data.products.db }} cluster, see the following pages:

- [Connect to your cluster](connect-to-your-cluster.html)
- [Authorize users](user-authorization.html)
- [Deploy a Python To-Do App with Flask, Kubernetes, and {{ site.data.products.db }}](deploy-a-python-to-do-app-with-flask-kubernetes-and-cockroachcloud.html)

If you created a multi-region cluster, it is important to carefully choose:

- The right [survival goal](../{{site.versions["cloud"]}}/multiregion-overview.html#survival-goals) for each database.
- The right [table locality](../{{site.versions["cloud"]}}/multiregion-overview.html#table-locality) for each of your tables.

Not doing so can result in unexpected latency and resiliency.  For more information, see the [Multi-Region Capabilities Overview](../stable/multiregion-overview.html).

<!--
### [WIP] Select hardware configuration based on performance requirements

Let's say we want to run a TPC-C workload with 500 warehouses on a {{ site.data.products.db }} cluster.

One TPC-C `warehouse` is about 200MB of data. CockroachDB can handle approximately 45 warehouses per vCPU. So a 4 vCPU node can handle 180 warehouses which is 36GB of unreplicated raw data.

With a default replication factor of 3, the total amount of data we need to store is (3 * 36GB) = 108GB of data.

So for a workload resembling TPC-C, we want to build out your cluster with `Option 2` nodes, and you'll only use 1/3 of the storage.

<Need numbers from the perf tests>
-->
