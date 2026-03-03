---
title: Create a CockroachDB Advanced Cluster
summary: Learn how to create your CockroachDB Advanced cluster.
toc: true
docs_area: deploy
---

{% include cockroachcloud/filter-tabs/create-cluster-cloud.md %}

This page guides you through the process of creating a CockroachDB {{ site.data.products.advanced }} cluster using the [Cloud Console](https://cockroachlabs.cloud). To use the Cloud API instead, refer to [Create an Advanced cluster]({% link cockroachcloud/cloud-api.md %}#create-an-advanced-cluster) in the API documentation.

Only [CockroachDB {{ site.data.products.cloud }} Organization Admins]({% link cockroachcloud/authorization.md %}#organization-admin) or users with Cluster Creator / Cluster Admin roles assigned at organization scope can create clusters. If you need permission to create a cluster, contact an CockroachDB {{ site.data.products.cloud }} Organization Admin.

{{site.data.alerts.callout_danger}}
If you are creating a cluster for a [BYOC deployment]({% link cockroachcloud/byoc-deployment.md %}) you must use the [{{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}) to perform the actions described on this page.
{{site.data.alerts.end}}

## Step 1. Start the cluster creation process

1. If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs_create_account" rel="noopener" target="_blank">sign up for a CockroachDB {{ site.data.products.cloud }} account</a>, then [log in](https://cockroachlabs.cloud/).
{% include cockroachcloud/prefer-sso.md %}
1. If there are multiple [organizations](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/architecture/glossary#organization) in your account, verify the one that is selected in the top right corner.
1. On the **Clusters** page, click **Create Cluster** or, if you also have permission to create folders, then click **Create > Create Cluster**.
1. On the **Select a plan** page, select the **Advanced** plan.

## Step 2. Select the cloud provider

On the **Cloud & Regions page**, go to the **Cloud provider** section and select your deployment environment: **Google Cloud**, **AWS**, or **Microsoft Azure**.

{{site.data.alerts.callout_info}}
For more details about CockroachDB {{ site.data.products.advanced }} on Azure, refer to [CockroachDB Advanced on Azure]({% link cockroachcloud/cockroachdb-advanced-on-azure.md %}).
{{site.data.alerts.end}}

You do not need an account in the deployment environment you choose. The cluster is created on infrastructure managed by Cockroach Labs. For optimal performance, create your cluster on the cloud provider and in the regions that best align with your existing cloud services.

{% include cockroachcloud/cockroachcloud-pricing.md %}

## Step 3. Configure regions and nodes

Select the region(s) and number of nodes for your cluster:

1. In the **Regions** section, select at minimum one region. Refer to [CockroachDB {{ site.data.products.cloud }} Regions]({% link cockroachcloud/regions.md %}) for the regions where CockroachDB {{ site.data.products.advanced }} clusters can be deployed. For optimal performance, create your cluster on the cloud provider and in the regions that best align with your existing cloud services. For example, if your application is deployed in GCP's `us-east1` region, select `us-east1` for your CockroachDB {{ site.data.products.advanced }} cluster.

    A multi-region cluster requires at minimum three regions and can survive the loss of a single region. Refer to [Planning your cluster](plan-your-cluster-advanced.html?filters=advanced) for the configuration requirements and recommendations for CockroachDB {{ site.data.products.advanced }} clusters.

    For clusters deployed on GCP, each region requires a `/19` CIDR block.

1. Select the number of nodes:
    - For single-region production deployments, we recommend a minimum of 3 nodes. The number of nodes indirectly impacts Your cluster's storage and compute capacity scale with the number of nodes. Refer to [Plan your cluster]({% link cockroachcloud/plan-your-cluster-advanced.md %}#example).
    - A multi-region deployment requires a minimum of 3 nodes per region. For best performance and stability, we recommend configuring  the same number of nodes in each region.
    - Single-node clusters are supported only for application development and testing, and are not available on Azure.

Refer to [Plan a CockroachDB Advanced cluster](plan-your-cluster-advanced.html) for details.

{% include cockroachcloud/nodes-limitation.md %}

You can add a maximum of 150 nodes to your cluster. To express interest in larger configurations, [contact your Cockroach Labs account team](https://support.cockroachlabs.com/hc/requests/new).

Click **Next: Capacity**.

## Step 4. Enable VPC Peering (optional)

You can use [VPC peering]({% link cockroachcloud/network-authorization.md %}#vpc-peering) to connect a GCP application to a CockroachDB {{ site.data.products.cloud }} cluster deployed on GCP. A separate VPC Peering connection is required for each cluster.

VPC peering is available only for GCP clusters. For clusters deployed on AWS, you can [configure AWS PrivateLink]({% link cockroachcloud/network-authorization.md %}#aws-privatelink) after creating your cluster. [Azure Virtual Network Peering](https://learn.microsoft.com/azure/virtual-network/virtual-network-peering-overview) is not yet supported. Refer to [CockroachDB {{ site.data.products.advanced }} on Azure]({% link cockroachcloud/cockroachdb-advanced-on-azure.md %}).

You can use CockroachDB {{ site.data.products.cloud }}'s default IP range and size (`172.28.0.0/14`) as long as it doesn't overlap with the IP ranges in your network. Alternatively, you can configure the IP range. Each region consumes a `/19` CIDR range from the CIDR range configured during cluster creation. If you add a region later, the region's IP range will be automatically assigned from the cluster's CIDR range.

1. In the **VPC Peering section**, select **Configure the IP range** to configure your own IP range.

1. Enter the IP range and size (in CIDR format) for the CockroachDB {{ site.data.products.cloud }} network based on the following considerations:
      -  As per [GCP's overlapping subnets restriction](https://cloud.google.com/vpc/docs/vpc-peering#restrictions), configure an IP range that doesn't overlap with the IP ranges in your application network.
      - The IP range and size cannot be changed after the cluster is created. Configuring a smaller IP range size may limit your ability to expand into multiple regions in the future. We recommend configuring an IP range size of `/16` or lower.

        {{site.data.alerts.callout_info}}
        Custom IP ranges are temporarily unavailable for multi-region clusters.
        {{site.data.alerts.end}}

1. Click **Next: Capacity**.

        After your cluster is created, you can [establish VPC Peering or AWS PrivateLink]({% link cockroachcloud/connect-to-an-advanced-cluster.md %}#establish-private-connectivity).

If you don't want to enable VPC Peering, leave the default selection of **Use the default IP range** as is and click **Next: Capacity**.

## Step 5. Configure cluster capacity

{% capture cap_per_vcpu %}{% include_cached {{ site.current_cloud_version }}/prod-deployment/provision-storage.md %}{% endcapture %}

The choice of hardware per node determines the [cost](#step-2-select-the-cloud-provider), throughput, and performance characteristics of your cluster. Refer to [Plan your {{ site.data.products.advanced }} cluster]({% link cockroachcloud/plan-your-cluster-advanced.md %}#example).

1. On the **Capacity** page, select the **Compute per node** according to the requirements of the cluster's workload  and **Storage per node** . Refer to [Cluster sizing and scaling]({% link cockroachcloud/plan-your-cluster-advanced.md %}#cluster-sizing-and-scaling).

1. Select the **Storage per node**, up to <b>{{ cap_per_vcpu }}</b>. Refer to [Storage capacity]({% link cockroachcloud/plan-your-cluster-advanced.md %}#storage-capacity) and [Pricing](https://www.cockroachlabs.com/pricing/) for details.

After your cluster is created, refer to:
- [Manage a CockroachDB {{ site.data.products.advanced }} Cluster]({% link cockroachcloud/cluster-management.md %})
- [Establish private connectivity]({% link cockroachcloud/connect-to-an-advanced-cluster.md %}#establish-private-connectivity)

Click **Next: Security**.

## Step 6. Configure advanced security features

You can enable advanced security features for PCI DSS and HIPAA [compliance]({% link cockroachcloud/compliance.md %}) at an additional cost. These features are in Preview for CockroachDB {{ site.data.products.advanced }} on Azure. Refer to [CockroachDB {{ site.data.products.advanced }} on Azure]({% link cockroachcloud/cockroachdb-advanced-on-azure.md %}).

{{site.data.alerts.callout_danger}}
Advanced security features cannot be enabled or disabled after cluster creation.
{{site.data.alerts.end}}

## Step 7. Enter billing details

1. On the **Finalize** page, verify:
    - Your cluster's cloud provider, regions, and configuration.
    - The hourly estimated cost for the cluster. The cost displayed does not include taxes. You will be billed monthly.
1. Add your preferred [payment method]({% link cockroachcloud/billing-management.md %}).
1. If applicable, the 30-day trial code is pre-applied to your cluster.

      {{site.data.alerts.callout_info}}
      Remember to [delete your trial cluster]({% link cockroachcloud/cluster-management.md %}#delete-cluster) before the trial expires. Otherwise, your credit card will be charged after the trial ends. You can check the validity of the code on the [Billing]({% link cockroachcloud/billing-management.md %}) page.
      {{site.data.alerts.end}}

<a id="step-7-name-the-cluster"></a>

## Step 8. Name the cluster

The cluster is automatically given a randomly-generated name. If desired, change the cluster's name. The cluster name must be 6-20 characters in length, and can include lowercase letters, numbers, and dashes (but no leading or trailing dashes). A cluster's name cannot be edited after the cluster is created.

<a id="step-8-select-the-cockroachdb-version"></a>

## Step 8. Select the CockroachDB version

When you create a new cluster, it uses the [latest CockroachDB {{ site.data.products.cloud }} production release](https://www.cockroachlabs.com/docs/releases/cloud) by default. All clusters are then upgraded automatically to each subsequent patch release of their major version as it becomes available. To learn more, refer to [Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}).

To select the cluster version:

1. Under **Cluster version**, click the version selector.
1. Select a CockroachDB version.

## Step 9. Finish creating the cluster

Click **Create cluster**. Your cluster will be created in approximately 20-30 minutes.

## What's next

To start using your CockroachDB {{ site.data.products.advanced }} cluster, refer to:

- [Connect to your cluster]({% link cockroachcloud/connect-to-your-cluster.md %})
- [Manage access]({% link cockroachcloud/managing-access.md %})
- [Deploy a Python To-Do App with Flask, Kubernetes, and CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/deploy-a-python-to-do-app-with-flask-kubernetes-and-cockroachcloud.md %})
- For a multi-region cluster, it is important to choose the most appropriate [survival goal]({% link {{site.current_cloud_version}}/multiregion-survival-goals.md %}) for each database and the most appropriate [table locality]({% link {{site.current_cloud_version}}/table-localities.md %}) for each table. Otherwise, your cluster may experience unexpected latency and reduced resiliency. For more information, refer to [Multi-Region Capabilities Overview]({% link {{ site.current_cloud_version}}/multiregion-overview.md %}).
