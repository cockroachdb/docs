---
title: Create a CockroachDB Standard Cluster
summary: Learn how to create your CockroachDB Standard cluster.
toc: true
docs_area: deploy
---

{{site.data.alerts.callout_info}}
CockroachDB Standard, our new, enterprise-ready plan, is currently in [Preview]({% link {{ site.current_cloud_version }}/cockroachdb-feature-availability.md %}).
{{site.data.alerts.end}}

{% include cockroachcloud/filter-tabs/create-cluster-cloud.md %}

This page guides you through the process of creating a CockroachDB {{ site.data.products.standard }} cluster using the [Cloud Console](https://cockroachlabs.cloud). To use the Cloud API instead, refer to [Create a Standard cluster]({% link cockroachcloud/cloud-api.md %}#create-a-standard-cluster) in the API documentation.

If you need permission to create a cluster, contact an CockroachDB {{ site.data.products.cloud }} Organization Admin.

{{site.data.alerts.callout_success}}
To create and connect to a 30-day free CockroachDB {{ site.data.products.standard }} cluster and run your first query, refer to the [Quickstart]({% link cockroachcloud/quickstart-trial-cluster.md %}).
{{site.data.alerts.end}}

## Step 1. Start the cluster creation process

1. If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs_create_account" rel="noopener" target="_blank">sign up for a CockroachDB {{ site.data.products.cloud }} account</a>, then [log in](https://cockroachlabs.cloud/).
{% include cockroachcloud/prefer-sso.md %}
1. [Log in](https://cockroachlabs.cloud/) to your CockroachDB {{ site.data.products.cloud }} account.
1. If there are multiple organizations in your account, select the correct organization in the top right corner.
1. On the **Overview** page, click **Create Cluster**.
1. On the **Select a plan** page, select the **Standard** plan.

## Step 2. Select the cloud provider

On the **Cloud & Regions page**, in the **Cloud provider** section, select your deployment environment: **Google Cloud** or **AWS**. Creating a CockroachDB {{ site.data.products.standard }} cluster on Azure is not yet supported.

You do not need an account in the deployment environment you choose. The cluster is created on infrastructure managed by Cockroach Labs. For optimal performance, create your cluster on the cloud provider and in the regions that best align with your existing cloud services.

Pricing depends on your cloud provider and region selections.

{% include cockroachcloud/cockroachcloud-pricing.md %}

## Step 3. Configure regions

In the **Regions** section, select at least one region. Refer to [CockroachDB {{ site.data.products.cloud }} Regions]({% link cockroachcloud/regions.md %}) for the regions where CockroachDB {{ site.data.products.standard }} clusters can be deployed.

For optimal performance, create your cluster on the cloud provider and in the regions that best align with your existing cloud services. For example, if your application is deployed in GCP's `us-east1` region, create your cluster on GCP and select `us-east1` for your CockroachDB {{ site.data.products.standard }} cluster.

A multi-region cluster can survive the loss of a single region. For multi-region clusters, CockroachDB will optimize access to data from the primary region. Refer to [Planning your cluster](plan-your-cluster.html) for the configuration requirements and recommendations for CockroachDB {{ site.data.products.standard }} clusters.

{{site.data.alerts.callout_info}}
You cannot remove a region.
{{site.data.alerts.end}}

After creating a multi-region cluster deployed on AWS, you can optionally [set up AWS PrivateLink (Limited Access)]({% link cockroachcloud/network-authorization.md %}#aws-privatelink) so that incoming connections to your cluster from applications or services running in your AWS account flow over private AWS network infrastructure rather than the public internet.

Private connectivity is not available for {{ site.data.products.standard }} clusters on GCP.

Click **Next: Capacity**.

## Step 4. Provision cluster capacity

Provisioned capacity refers to the reserved compute capacity for your cluster, expressed in vCPUs. We recommend at minimum 4-8 vCPUs for production workloads, and allowing for at least 40% above expected peak workload to avoid performance issues. Refer to [Plan your cluster]({% link cockroachcloud/plan-your-cluster.md %}) for the configuration requirements and recommendations for CockroachDB {{ site.data.products.standard }} clusters.

{% comment %}Verify VPC Peering status
{{site.data.alerts.callout_success}}
You can [set up private connectivity]({% link cockroachcloud/connect-to-your-cluster.md %}#establish-private-connectivity) after creating your cluster.
{{site.data.alerts.end}}

You can use CockroachDB {{ site.data.products.cloud }}'s default IP range and size (`172.28.0.0/14`) as long as it doesn't overlap with the IP ranges in your network. Alternatively, you can configure the IP range:

1. In the **VPC Peering section**, select **Configure the IP range** to configure your own IP range.

1. Enter the IP range and size (in CIDR format) for the CockroachDB {{ site.data.products.cloud }} network based on the following considerations:
      -  As per [GCP's overlapping subnets restriction](https://cloud.google.com/vpc/docs/vpc-peering#restrictions), configure an IP range that doesn't overlap with the IP ranges in your application network.
      - The IP range and size cannot be changed after the cluster is created. Configuring a smaller IP range size may limit your ability to expand into multiple regions in the future. We recommend configuring an IP range size of `/16` or lower.

        {{site.data.alerts.callout_info}}
        Custom IP ranges are temporarily unavailable for multi-region clusters.
        {{site.data.alerts.end}}

        After your cluster is created, refer to [Establish private connectivity]({% link cockroachcloud/connect-to-your-cluster.md %}#gcp-vpc-peering) to finish setting up VPC Peering for your cluster.{% endcomment %}

Click **Next: Finalize**.

## Step 5. Enter billing details

1. On the **Finalize** page, verify:
    - Your cluster's cloud provider, regions, and configuration.
    - The hourly estimated cost for the cluster. The cost displayed does not include taxes. You will be billed monthly.

1. Add your preferred [payment method]({% link cockroachcloud/billing-management.md %}).
1. If applicable, the 30-day trial code is pre-applied to your cluster.
      {{site.data.alerts.callout_info}}
      Make sure that you [delete your trial cluster]({% link cockroachcloud/cluster-management.md %}#delete-cluster) before the trial expires. Your credit card will be charged after the trial ends. You can check the validity of the code on the [Billing]({% link cockroachcloud/billing-management.md %}) page.
      {{site.data.alerts.end}}

<a id="step-7-name-the-cluster"></a>

## Step 6. Name the cluster

The cluster is automatically given a randomly-generated name. If desired, change the cluster's name. The cluster name must be 6-20 characters in length, and can include lowercase letters, numbers, and dashes (but no leading or trailing dashes). A cluster's name cannot be edited after it is created.

Click **Create cluster**. Your cluster will be created in a few seconds.

{% comment %}## Step 8. Select the CockroachDB version

When you create a new CockroachDB {{ site.data.products.standard }} cluster, it defaults to using the [latest CockroachDB {{ site.data.products.cloud }} production release]({% link releases/cloud.md %}) unless you select a release explicitly. Releases are rolled out gradually to CockroachDB {{ site.data.products.cloud }}. At any given time, you may be able to choose among multiple releases. In the list:

- **No label**: The latest patch of a Regular [Production release]({% link cockroachcloud/upgrade-policy.md %}) that is not the latest. A Regular release has full support for one year from the release date, at which a cluster must be [upgraded]({% link cockroachcloud/upgrade-policy.md %}) to maintain support.
- **Latest**: The latest patch of the latest regular [Production release]({% link cockroachcloud/upgrade-policy.md %}). This is the default version for new clusters.
- **Innovation Release**: The latest patch of an [Innovation release]({% link cockroachcloud/upgrade-policy.md %}). Innovation releases are optional releases that provide earlier access to new features, and are released between regular releases. An Innovation release has full support for six months from the release date, at which time a cluster must be [upgraded]({% link cockroachcloud/upgrade-policy.md %}) to the next Regular release to maintain support.
- **Pre-Production Preview**: A [Pre-Production Preview]({% link cockroachcloud/upgrade-policy.md %}#pre-production-preview-upgrades). Leading up to a new CockroachDB Regular [Production release]({% link cockroachcloud/upgrade-policy.md %}), a series of Beta and Release Candidate (RC) patches may be made available for CockroachDB {{ site.data.products.standard }} as Pre-Production Preview releases. Pre-Production Preview releases are not suitable for production environments. They are no longer available in CockroachDB {{ site.data.products.cloud }} for new clusters or upgrades after the new version is GA. When the GA release is available, a cluster running a Pre-Production Preview is automatically upgraded to the GA release and subsequent patches and is eligible for support.

1. To choose a version for your cluster, select the cluster version from the **Cluster version** list.

After the cluster is created, patch releases within its major version are required and are applied automatically. If you install or upgrade to a Pre-Production Preview release, subsequent Pre-Production Preview patch releases, the GA release, and subsequent patches within the major version are applied automatically. To learn more, refer to the [CockroachDB Cloud Support and Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}).

## Step 9{% endcomment %}

<a id="step-9-finish-creating-the-cluster"></a>
## Step 7. Finish creating the cluster

Click **Create cluster**. Your cluster will be created in approximately 20-30 minutes.

## What's next

To start using your CockroachDB {{ site.data.products.standard }} cluster, refer to:

- [Connect to your cluster]({% link cockroachcloud/connect-to-your-cluster.md %})
- [Authorize users]({% link cockroachcloud/managing-access.md %})
- [Deploy a Python To-Do App with Flask, Kubernetes, and CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/deploy-a-python-to-do-app-with-flask-kubernetes-and-cockroachcloud.md %})
- For a multi-region cluster, it is important to choose the most appropriate [survival goal]({% link {{site.current_cloud_version}}/multiregion-survival-goals.md %}) for each database and the most appropriate [table locality]({% link {{site.current_cloud_version}}/table-localities.md %}) for each table. Otherwise, your cluster may experience unexpected latency and reduced resiliency. For more information, refer to [Multi-Region Capabilities Overview]({% link {{ site.current_cloud_version}}/multiregion-overview.md %}).
