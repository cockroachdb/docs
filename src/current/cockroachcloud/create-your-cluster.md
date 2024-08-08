---
title: Create a CockroachDB Standard Cluster
summary: Learn how to create your CockroachDB Standard cluster.
toc: true
docs_area: deploy
---

{% include cockroachcloud/filter-tabs/create-cluster-cloud.md %}

This page guides you through the process of creating a CockroachDB {{ site.data.products.standard }} cluster using the [Cloud Console](httrps://cockroachlabs.cloud). To use the Cloud API instead, refer to [Create a New Cluster]({% link cockroachcloud/cloud-api.md %}#create-a-new-cluster).

Only [CockroachDB {{ site.data.products.cloud }} Org Administrators]({% link cockroachcloud/authorization.md %}#org-administrator) or users with Cluster Creator / Cluster Admin roles assigned at organization scope can create clusters. If you need to create a cluster and do not have one of the required roles, contact your CockroachDB {{ site.data.products.cloud }} Administrator.

{{site.data.alerts.callout_success}}
To create and connect to a 30-day free CockroachDB {{ site.data.products.standard }} cluster and run your first query, refer to the [Quickstart]({% link cockroachcloud/quickstart-trial-cluster.md %}).
{{site.data.alerts.end}}

## Step 1. Start the cluster creation process

1. If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs_create_account" rel="noopener" target="_blank">sign up for a CockroachDB {{ site.data.products.cloud }} account</a>.
{% include cockroachcloud/prefer-sso.md %}
1. [Log in](https://cockroachlabs.cloud/) to your CockroachDB {{ site.data.products.cloud }} account.
1. If there are multiple [organizations](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/architecture/glossary#organization) in your account, select the correct organization in the top right corner.
1. On the **Overview** page, click **Create Cluster**.
1. On the **Select a plan** page, select the **Standard** plan.

## Step 2. Select the cloud provider

On the **Cloud & Regions page**, in the **Cloud provider** section, select your deployment environment: **Google Cloud** or **AWS**. Creating a CockroachDB {{ site.data.products.standard }} cluster on Azure is not yet supported.

You do not need an account in the deployment environment you choose. The cluster is created on infrastructure managed by Cockroach Labs. If you intend to use your CockroachDB {{ site.data.products.standard }} cluster with data or services in a cloud tenant that you manage, you should select that cloud provider and the region closest to your existing cloud services to maximize performance.

Pricing depends on your cloud provider and region selections.

{% include cockroachcloud/cockroachcloud-pricing.md %}

## Step 3. Configure regions

In the **Regions** section, select at least one region. Refer to [CockroachDB {{ site.data.products.cloud }} Regions]({% link cockroachcloud/regions.md %}) for the regions where CockroachDB {{ site.data.products.standard }} clusters can be deployed.

For optimal performance, select the cloud provider region nearest to the region where you are running your application. For example, if your application is deployed in GCP's `us-east1` region, create your cluster on GCP and select `us-east1` for your CockroachDB {{ site.data.products.standard }} cluster.

A multi-region cluster can survive the loss of a single region. For multi-region clusters, CockroachDB will optimize access to data from the primary region. Refer to [Planning your cluster](plan-your-cluster.html) for the configuration requirements and recommendations for CockroachDB {{ site.data.products.standard }} clusters.

{{site.data.alerts.callout_info}}
You cannot remove regions once they have been added.
{{site.data.alerts.end}}

After creating a multi-region cluster deployed on AWS, you can optionally [set up AWS PrivateLink (Limited Access)]({% link cockroachcloud/network-authorization.md %}#aws-privatelink) so that incoming connections to your cluster from applications or services running in your AWS account flow over private AWS network infrastructure rather than the public internet.

Private connectivity is not available for {{ site.data.products.serverless }} clusters on GCP.

Click **Next: Capacity**.

## Step 4. Provision cluster capacity

Provisioned capacity refers to the processing resources (Request Units per sec) reserved for your workload. Each 500 RUs/sec equals approximately 1 vCPU. We recommend setting capacity at least 40% above expected peak workload to avoid performance issues. Refer to [Planning your cluster](plan-your-cluster.html) for the configuration requirements and recommendations for CockroachDB {{ site.data.products.standard }} clusters.

{{site.data.alerts.callout_success}}
You can [set up private connectivity]({% link cockroachcloud/connect-to-your-cluster.md %}#gcp-private-service-connect) after creating your cluster.
{{site.data.alerts.end}}

You can use CockroachDB {{ site.data.products.cloud }}'s default IP range and size (`172.28.0.0/14`) as long as it doesn't overlap with the IP ranges in your network. Alternatively, you can configure the IP range:

1. In the **VPC Peering section**, select **Configure the IP range** to configure your own IP range.

1. Enter the IP range and size (in CIDR format) for the CockroachDB {{ site.data.products.cloud }} network based on the following considerations:
      -  As per [GCP's overlapping subnets restriction](https://cloud.google.com/vpc/docs/vpc-peering#restrictions), configure an IP range that doesn't overlap with the IP ranges in your application network.
      - The IP range and size cannot be changed after the cluster is created. Configuring a smaller IP range size may limit your ability to expand into multiple regions in the future. We recommend configuring an IP range size of `/16` or lower.

        {{site.data.alerts.callout_info}}
        Custom IP ranges are temporarily unavailable for multi-region clusters.
        {{site.data.alerts.end}}

        After your cluster is created, refer to [Establish private connectivity]({% link cockroachcloud/connect-to-your-cluster.md %}#gcp-vpc-peering) to finish setting up VPC Peering for your cluster.

Click **Next: Finalize**.

## Step 5. Enter billing details

1. On the **Finalize** page, verify your selections for the cloud provider, region(s), and the capacity.
1. Verify the hourly estimated cost for the cluster. The cost displayed does not include taxes.

    You will be billed monthly.

1. If you have not yet configured billing for your CockroachDB {{ site.data.products.cloud }} organization, add your preferred [payment method]({% link cockroachcloud/billing-management.md %}).
1. If applicable, the 30-day trial code is pre-applied to your cluster.
      {{site.data.alerts.callout_info}}
      Make sure that you [delete your trial cluster]({% link cockroachcloud/cluster-management.md %}#delete-cluster) before the trial expires. Your credit card will be charged after the trial ends. You can check the validity of the code on the [Billing]({% link cockroachcloud/billing-management.md %}) page.
      {{site.data.alerts.end}}

<a id="step-7-name-the-cluster"></a>

## Step 6. Name the cluster

The cluster is automatically given a randomly-generated name. If desired, change the cluster's name. The cluster name must be 6-20 characters in length, and can include lowercase letters, numbers, and dashes (but no leading or trailing dashes). A cluster's name cannot be edited after it is created.

Click **Create cluster**. Your cluster will be created in a few seconds.

{% comment %}Commented out until this is in the Cloud 2.0 UI

## Step 8. Select the CockroachDB version

When you create a new CockroachDB {{ site.data.products.dedicated }} cluster, it defaults to using the [latest CockroachDB {{ site.data.products.cloud }} production release]({% link releases/cloud.md %}) unless you select a release explicitly. Releases are rolled out gradually to CockroachDB {{ site.data.products.cloud }}. At any given time, you may be able to choose among two or more types of releases. In the list, releases are labeled according to their stability:

- **Latest Stable**: The latest stable GA release is the default version and is suitable for production.
- **Stable**: One or more stable releases may be listed at any given time. All listed releases that are not labeled **Pre-Production Preview** are stable releases suitable for production.
- **Pre-Production Preview**: Prior to the GA release of a new CockroachDB major version, a series of Beta and Release Candidate (RC) releases may be made available for CockroachDB {{ site.data.products.dedicated }} as [Pre-Production Preview]({% link cockroachcloud/upgrade-policy.md %}#pre-production-preview-upgrades) releases. Pre-Production Preview releases are no longer available after the GA release of a major version.

    {{site.data.alerts.callout_danger}}
    Testing releases, including Pre-Production Preview releases, are provided for testing and experimentation only, and are not qualified for production environments and not eligible for support or uptime SLA commitments.
    {{site.data.alerts.end}}

To select a version for your cluster:

1. Under **Cluster Version**, click **More versions**.
1. Select the cluster version from the **Cluster version** list.

After the cluster is created, patch releases within its major version are required and are applied automatically. If you install or upgrade to a Pre-Production Preview release, subsequent Pre-Production Preview patch releases, the GA release, and subsequent patches within the major version are applied automatically. To learn more, refer to the [CockroachDB Cloud Support and Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}).

## Step 9{% endcomment %}

<a id="step-9-finish-creating-the-cluster"></a>
## Step 7. Finish creating the cluster

Click **Create cluster**. Your cluster will be created in approximately 20-30 minutes.

## What's next

To start using your CockroachDB {{ site.data.products.dedicated }} cluster, refer to:

- [Connect to your cluster]({% link cockroachcloud/connect-to-your-cluster.md %})
- [Authorize users]({% link cockroachcloud/managing-access.md %})
- [Deploy a Python To-Do App with Flask, Kubernetes, and CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/deploy-a-python-to-do-app-with-flask-kubernetes-and-cockroachcloud.md %})
- For [multi-region clusters]({% link {{ site.current_cloud_version}}/multiregion-overview.md %}), learn how to reduce latency and increase resiliency by choosing the best [survival goal]({% link {{site.current_cloud_version}}/multiregion-survival-goals.md %}) for each database and the best [table locality]({% link {{site.current_cloud_version}}/table-localities.md %}) for each table.

{% comment %}
### [WIP] Select hardware configuration based on performance requirements

Let's say we want to run a TPC-C workload with 500 warehouses on a CockroachDB {{ site.data.products.cloud }} cluster.

One TPC-C `warehouse` is about 200MB of data. CockroachDB can handle approximately 45 warehouses per vCPU. So a 4 vCPU node can handle 180 warehouses which is 36GB of unreplicated raw data.

With a default replication factor of 3, the total amount of data we need to store is (3 * 36GB) = 108GB of data.

So for a workload resembling TPC-C, we want to build out your cluster with `Option 2` nodes, and you'll only use 1/3 of the storage.

<Need numbers from the perf tests>
{% endcomment %}
