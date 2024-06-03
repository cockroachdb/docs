---
title: Create a CockroachDB Dedicated Cluster
summary: Learn how to create your CockroachDB Dedicated cluster.
toc: true
docs_area: deploy
---

{% include cockroachcloud/filter-tabs/create-cluster-cloud.md %}

This page walks you through the process of creating a CockroachDB {{ site.data.products.dedicated }} cluster using the [Cloud Console](https://cockroachlabs.cloud). To use the Cloud API instead, refer to [Create a New Cluster]({% link cockroachcloud/cloud-api.md %}#create-a-new-cluster).

Only [CockroachDB {{ site.data.products.cloud }} Org Administrators]({% link cockroachcloud/authorization.md %}#org-administrator) or users with Cluster Creator / Cluster Admin roles assigned at organization scope can create clusters. If you need to create a cluster and do not have one of the required roles, contact your CockroachDB {{ site.data.products.cloud }} Administrator.

{{site.data.alerts.callout_success}}
To create and connect to a 30-day free CockroachDB {{ site.data.products.dedicated }} cluster and run your first query, see the [Quickstart]({% link cockroachcloud/quickstart-trial-cluster.md %}).
{{site.data.alerts.end}}

## Step 1. Start the cluster creation process

1. If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs_create_dedicated_cluster" rel="noopener" target="_blank">sign up for a CockroachDB {{ site.data.products.cloud }} account</a>.
{% include cockroachcloud/prefer-sso.md %}
1. [Log in](https://cockroachlabs.cloud/) to your CockroachDB {{ site.data.products.cloud }} account.
1. If there are multiple [organizations](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/architecture/glossary#organization) in your account, select the correct organization in the top right corner.
1. On the **Overview** page, click **Create Cluster**.
1. On the **Select a plan** page, select the **Dedicated standard** or **Dedicated advanced** plan.

CockroachDB {{ site.data.products.dedicated }} advanced clusters have access to features required for [PCI DSS readiness]({% link cockroachcloud/pci-dss.md %}) in addition to all CockroachDB {{ site.data.products.dedicated }} standard features. You must be a contract customer to create a CockroachDB {{ site.data.products.dedicated }} advanced cluster. For more information, [contact us](https://www.cockroachlabs.com/contact-sales/).

## Step 2. Select the cloud provider

On the **Cloud & Regions page**, in the **Cloud provider** section, select your deployment environment: **Google Cloud**, **AWS**, or **Microsoft Azure**.

{{site.data.alerts.callout_info}}
CockroachDB {{ site.data.products.dedicated }} advanced clusters cannot currently be deployed on Azure.
{{site.data.alerts.end}}

You do not need an account in the deployment environment you choose. The cluster is created on infrastructure managed by Cockroach Labs. If you intend to use your CockroachDB {{ site.data.products.dedicated }} cluster with data or services in a cloud tenant, you should select that cloud provider and the region closest to your existing cloud services to maximize performance.

{% include cockroachcloud/cockroachcloud-pricing.md %}

## Step 3. Configure region(s) and node(s)

Select the region(s) and number of nodes for your cluster:

1. In the **Regions** section, select at minimum one region. Refer to [CockroachDB {{ site.data.products.cloud }} Regions]({% link cockroachcloud/regions.md %}) for the regions where CockroachDB {{ site.data.products.dedicated }} clusters can be deployed. For optimal performance, select the cloud provider region in which you are running your application. For example, if your application is deployed in GCP's `us-east1` region, select `us-east1` for your CockroachDB {{ site.data.products.dedicated }} cluster.

    A multi-region cluster contains at minimum three regions and can survive the loss of a single region. Refer to [Planning your cluster](plan-your-cluster.html?filters=dedicated) for the configuration requirements and recommendations for CockroachDB {{ site.data.products.dedicated }} clusters.

1. Select the number of nodes:
    - For single-region application development and testing on AWS or GCP, you can create a single-node cluster. Single-node clusters are not available on Azure.
    - For single-region production deployments, we recommend a minimum of 3 nodes. The number of nodes also depends on your storage capacity and performance requirements. See [Example](plan-your-cluster.html?filters=dedicated#dedicated-example) for further guidance.
    - For multi-region deployments, we require a minimum of 3 nodes per region. For best performance and stability, you should use the same number of nodes in each region.
    - See [Plan a CockroachDB Cloud cluster](plan-your-cluster.html?filters=dedicated) for the requirements and recommendations for CockroachDB {{ site.data.products.dedicated }} cluster configuration.

        {% include cockroachcloud/nodes-limitation.md %}

        Currently, you can add a maximum of 150 nodes to your cluster. For larger configurations, [contact us](https://support.cockroachlabs.com/hc/requests/new).

Click **Next: Capacity**.

<a id="step-4-enable-vpc-peering-optional"></a>
## Step 4. Enable GCP VPC Peering (optional)

You can use [GCP VPC peering]({% link cockroachcloud/network-authorization.md %}#gcp-vpc-peering) to establish a private connection between a GCP application and a CockroachDB {{ site.data.products.dedicated }} cluster deployed on GCP. A separate VPC Peering connection is required for each cluster.

If you don't want to enable VPC Peering, leave the default selection of **Use the default IP range** as is and click **Next: Capacity**.

{{site.data.alerts.callout_success}}
You can [set up GCP Private Service Connect (Preview)]({% link cockroachcloud/connect-to-your-cluster.md %}#gcp-private-service-connect) instead of VPC peering after creating your cluster.
{{site.data.alerts.end}}

You can use CockroachDB {{ site.data.products.cloud }}'s default IP range and size (`172.28.0.0/14`) as long as it doesn't overlap with the IP ranges in your network. Alternatively, you can configure the IP range:

1. In the **VPC Peering section**, select **Configure the IP range** to configure your own IP range.

1. Enter the IP range and size (in CIDR format) for the CockroachDB {{ site.data.products.cloud }} network based on the following considerations:
      -  As per [GCP's overlapping subnets restriction](https://cloud.google.com/vpc/docs/vpc-peering#restrictions), configure an IP range that doesn't overlap with the IP ranges in your application network.
      - The IP range and size cannot be changed after the cluster is created. Configuring a smaller IP range size may limit your ability to expand into multiple regions in the future. We recommend configuring an IP range size of `/16` or lower.

        {{site.data.alerts.callout_info}}
        Custom IP ranges are temporarily unavailable for multi-region clusters.
        {{site.data.alerts.end}}

1. Click **Next: Capacity**.

        After your cluster is created, refer to [Establish private connectivity]({% link cockroachcloud/connect-to-your-cluster.md %}#gcp-vpc-peering) to finish setting up VPC Peering for your cluster.

## Step 5. Configure cluster capacity

{% capture cap_per_vcpu %}{% include_cached v23.1/prod-deployment/provision-storage.md %}{% endcapture %}

The choice of hardware per node determines the [cost](#step-2-select-the-cloud-provider), throughput, and performance characteristics of your cluster.

1. On the **Capacity** page, select the **Compute per node**.

    When selecting your compute power, consider the following factors:

    Factor | Description
    ----------|------------
    Transactions per second | Each vCPU can handle approximately 400 transactions per second, depending on the workload. Read-heavy workloads can be expected to perform better.
    Scaling | When scaling up your cluster, it is generally more effective to increase node size up to 16 vCPUs before adding more nodes. For most production applications, we recommend **at least 4 to 8 vCPUs per node**.

    {{site.data.alerts.callout_info}}
    Clusters deployed in CockroachDB {{ site.data.products.cloud }} can be created with a minimum of 2 vCPUs per node on AWS and GCP or 4 vCPUs per node on Azure.
    {{site.data.alerts.end}}

    Memory | Some of a node's provisioned RAM is used for system overhead factors such as filesystem cache and sidecars, so the full amount of memory may not be available to the cluster's workloads.

1. Select the **Storage per node**.

    {{site.data.alerts.callout_danger}}
    Storage space cannot be removed due to cloud provider limitations.
    {{site.data.alerts.end}}

    For optimal performance, choose up to <b>{{ cap_per_vcpu }}</b>. Refer to [Pricing](https://www.cockroachlabs.com/pricing/) for details. IOPS for Azure disks are determined by the disk size, regardless of the VM configuration. To learn more, refer to [Premium SSD size](https://learn.microsoft.com/azure/virtual-machines/disks-types#premium-ssd-size) in the Azure documentation.

    When selecting your storage capacity, consider the following factors:

    Factor | Description
    ----------|------------
    Capacity | Total raw data size you expect to store without replication.
    Replication | The default replication factor for a CockroachDB {{ site.data.products.cloud }} cluster is 3.
    Buffer | Additional buffer (overhead data, accounting for data growth, etc.). If you are importing an existing dataset, we recommend you provision at least 50% additional storage to account for the import functionality.
    Compression | The percentage of savings you can expect to achieve with compression. With CockroachDB's default compression algorithm, we typically see about a 40% savings on raw data size.

    For more details about disk performance on a given cloud provider, refer to: <ul><li><b>GCP</b>: <a href="https://cloud.google.com/compute/docs/disks/performance">Configure disks to meet performance requirements</a></li><li><b>AWS</b>: <a href="https://aws.amazon.com/ebs/features/#Amazon_EBS_volume_types">Amazon EBS volume types</a></li><li><b>Azure</b>: <a href="https://learn.microsoft.com/azure/virtual-machines/disks-performance">Virtual machine and disk performance</a></li></ul>

To change the hardware configuration after the cluster is created, see [Manage a CockroachDB {{ site.data.products.dedicated }} Cluster]({% link cockroachcloud/cluster-management.md %}).

See the [Example](plan-your-cluster.html?filters=dedicated#dedicated-example) for further guidance.


Click **Next: Finalize**.

## Step 6. Enter billing details

1. On the **Finalize** page, verify your selections for the cloud provider, region(s), number of nodes, and the capacity.

        Once your cluster is created, see [Establish VPC Peering or AWS PrivateLink]({% link cockroachcloud/connect-to-your-cluster.md %}#establish-gcp-vpc-peering-or-aws-privatelink) to finish setting up VPC Peering for your cluster.

1. Verify the hourly estimated cost for the cluster. The cost displayed does not include taxes.

    You will be billed monthly.

1. Add your preferred [payment method]({% link cockroachcloud/billing-management.md %}).
1. [If applicable]({% link cockroachcloud/frequently-asked-questions.md %}#how-do-cockroachdb-dedicated-free-trials-work), the 30-day trial code is pre-applied to your cluster.
      {{site.data.alerts.callout_info}}
      Make sure that you [delete your trial cluster]({% link cockroachcloud/cluster-management.md %}#delete-cluster) before the trial expires. Your credit card will be charged after the trial ends. You can check the validity of the code on the [Billing]({% link cockroachcloud/billing-management.md %}) page.
      {{site.data.alerts.end}}

## Step 7. Name the cluster

The cluster is automatically given a randomly-generated name. If desired, change the cluster's name. The cluster name must be 6-20 characters in length, and can include lowercase letters, numbers, and dashes (but no leading or trailing dashes). A cluster's name cannot be edited after it is created.

## Step 8. Select the CockroachDB version

When you create a new cluster, it uses the [latest CockroachDB {{ site.data.products.cloud }} production release](https://www.cockroachlabs.com/docs/releases/cloud) by default. All clusters are then upgraded automatically to each subsequent patch release of their major version as it becomes available. To learn more, refer to [Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}).

Prior to the GA release of a new CockroachDB major version, a series of Beta and Release Candidate (RC) releases are made available for CockroachDB {{ site.data.products.dedicated }} as [Pre-Production Preview]({% link cockroachcloud/upgrade-policy.md %}#pre-production-preview-upgrades) releases. If available, the latest Pre-Production Preview release is listed as an option alongside the latest production release.

{{site.data.alerts.callout_danger}}
Testing releases, including Pre-Production Preview releases, are provided for testing and experimentation only, and are not qualified for production environments and not eligible for support or uptime SLA commitments.
{{site.data.alerts.end}}

If you install a Pre-Production Preview release, it will be upgraded to each subsequent beta or RC release automatically, before being upgraded to the GA and subsequent patch releases as they become available.

Click **Create cluster**. Your cluster will be created in approximately 20-30 minutes.

## What's next

To start using your CockroachDB {{ site.data.products.cloud }} cluster, see the following pages:

- [Connect to your cluster]({% link cockroachcloud/connect-to-your-cluster.md %})
- [Authorize users]({% link cockroachcloud/managing-access.md %})
- [Deploy a Python To-Do App with Flask, Kubernetes, and CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/deploy-a-python-to-do-app-with-flask-kubernetes-and-cockroachcloud.md %})

If you created a multi-region cluster, it is important to carefully choose:

- The right [survival goal](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/multiregion-survival-goals) for each database.
- The right [table locality](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/table-localities) for each of your tables.

Not doing so can result in unexpected latency and resiliency.  For more information, see the [Multi-Region Capabilities Overview]({% link {{ site.current_cloud_version}}/multiregion-overview.md %}).

{% comment %}
### [WIP] Select hardware configuration based on performance requirements

Let's say we want to run a TPC-C workload with 500 warehouses on a CockroachDB {{ site.data.products.cloud }} cluster.

One TPC-C `warehouse` is about 200MB of data. CockroachDB can handle approximately 45 warehouses per vCPU. So a 4 vCPU node can handle 180 warehouses which is 36GB of unreplicated raw data.

With a default replication factor of 3, the total amount of data we need to store is (3 * 36GB) = 108GB of data.

So for a workload resembling TPC-C, we want to build out your cluster with `Option 2` nodes, and you'll only use 1/3 of the storage.

<Need numbers from the perf tests>
{% endcomment %}
