---
title: Create a CockroachDB Basic Cluster
summary: Learn how to create a cluster using CockroachDB Basic.
toc: true
docs_area: deploy
cloud: true
---

{% include cockroachcloud/filter-tabs/create-cluster-cloud.md %}

This page guides you through the process of creating a cluster using CockroachDB {{ site.data.products.basic }}. Note that only [CockroachDB {{ site.data.products.cloud }} Organization Admins]({% link cockroachcloud/authorization.md %}#organization-admin) or users with Cluster Creator / Cluster Admin roles assigned at organization scope can create clusters. If you are a Developer and need to create a cluster, contact your CockroachDB {{ site.data.products.cloud }} Administrator.

New CockroachDB {{ site.data.products.basic }} clusters always use the latest stable version of CockroachDB, and are automatically [upgraded]({% link cockroachcloud/upgrade-cockroach-version.md %}) to new patch versions, as well as new major versions, to maintain uninterrupted support and SLA guarantees. For more details, refer to [CockroachDB Cloud Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}).

## Before you begin

If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs_create_account" rel="noopener" target="_blank">sign up for a CockroachDB {{ site.data.products.cloud }} account</a>.

{% include cockroachcloud/free-cluster-limit.md %}

## Step 1. Start the cluster creation process

1. If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs_create_account" rel="noopener" target="_blank">sign up for a CockroachDB {{ site.data.products.cloud }} account</a>, then [log in](https://cockroachlabs.cloud/).
{% include cockroachcloud/prefer-sso.md %}
1. If there are multiple [organizations](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/architecture/glossary#organization) in your account, verify the one that is selected in the top right corner.
1. On the **Clusters** page, click **Create Cluster** or, if you also have permission to create folders, then click **Create > Create Cluster**.
1. On the **Select a plan** page, select **Basic**.

## Step 2. Select the cloud provider

On the **Cloud & Regions** page, select a cloud provider (GCP or AWS) in the **Cloud provider** section. {{ site.data.products.basic }} is not supported on Azure.

You do not need an account in the deployment environment you choose. The cluster is created on infrastructure managed by Cockroach Labs. For optimal performance, create your cluster on the cloud provider and in the regions that best align with your existing cloud services.

## Step 3. Select the regions

In the **Regions** section, select a region for the cluster. Refer to [CockroachDB {{ site.data.products.cloud }} Regions]({% link cockroachcloud/regions.md %}) for the regions where CockroachDB {{ site.data.products.basic }} clusters can be deployed.

For optimal performance, select the cloud provider and region nearest to where your SQL clients, applications, or external data are located. For multi-region clusters, CockroachDB will optimize access to data from the [**Primary region**]({% link {{site.current_cloud_version}}/multiregion-overview.md %}). Refer to [Plan a CockroachDB {{ site.data.products.basic }} Cluster]({% link cockroachcloud/plan-your-cluster-basic.md %}#multi-region-clusters) to learn more. To express interest in additional regions, [contact Support](https://support.cockroachlabs.com) or your Cockroach Labs account team.

To create a multi-region cluster, click **Add regions** and select additional regions. A cluster can have at most six regions.

{{site.data.alerts.callout_info}}
You cannot remove a region.
{{site.data.alerts.end}}

After creating a multi-region cluster deployed on AWS, you can optionally [set up AWS PrivateLink (Limited Access)]({% link cockroachcloud/network-authorization.md %}#aws-privatelink) so that incoming connections to your cluster from applications or services running in your AWS account flow over private AWS network infrastructure rather than the public internet.

Private connectivity is not available for {{ site.data.products.basic }} clusters on GCP.

Click **Next: Capacity**.

## Step 4. Configure cluster capacity

Your cluster's capacity dictates its resource limits, which are the maximum amount of storage and RUs you can use in a month. Resource limits are optional. If you reach your storage limit, your cluster will be throttled and you may only be able to delete data. If you reach your RU limit, your cluster will be disabled until the end of the billing cycle unless you raise the limit.

Each CockroachDB {{ site.data.products.cloud }} organization gets 50M RUs and 10 GiB of storage for free each month. Free resources can be spent across all CockroachDB {{ site.data.products.basic }} clusters in an organization. You can set higher resource limits to maintain a high level of performance with larger workloads. You will only be charged for what you use.

{% include cockroachcloud/basic-usage.md %} For more information, see [Planning your cluster]({% link cockroachcloud/plan-your-cluster.md %}).

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="free">Free</button>
  <button class="filter-button page-level" data-scope="paid">Paid</button>
</div>

<section class="filter-content" markdown="1" data-scope="free">

1. On the **Capacity** page, select **Start for free**.

    {{site.data.alerts.callout_info}}
    This will be available only if you haven't already created a free CockroachDB {{ site.data.products.basic }} cluster or set up billing information.
    {{site.data.alerts.end}}

1. Click **Next: Finalize**.

</section>

<section class="filter-content" markdown="1" data-scope="paid">

1. On the **Capacity** page, select **Upgrade your capacity**, even if the option to **Start for free** is also available.

1. Configure **On-Demand capacity**.
    - **Unlimited**: your cluster will scale to meet your application's needs. You will only be charged for the resources you use.
    - **Set a monthly limit**: you can set storage and RU limits individually, or enter a dollar amount that will be split automatically between both resources. You will only be charged for the resources you use.

1. Click **Next: Finalize**.

</section>

## Step 5. Enter billing details

1. On the **Finalize** page, verify your cluster and capacity configuration.

    {{site.data.alerts.callout_info}}
    The cost displayed does not include taxes and provides a maximum cost estimate. Your final bill will reflect your actual usage.
    {{site.data.alerts.end}}

1. If you haven't already, add your preferred [payment method]({% link cockroachcloud/billing-management.md %}).

## Step 6. Name the cluster

The cluster is automatically given a randomly-generated name. If desired, change the cluster's name. The cluster name must be 6-20 characters in length, and can include lowercase letters, numbers, and dashes (but no leading or trailing dashes). A cluster's name cannot be edited after it is created.

Click **Create cluster**. Your cluster will be created in a few seconds.

## What's next

- [Connect to your CockroachDB {{ site.data.products.basic }} cluster]({% link cockroachcloud/connect-to-your-cluster.md %})
- [Manage access]({% link cockroachcloud/managing-access.md %})
- Learn [CockroachDB SQL]({% link {{site.current_cloud_version}}/sql-statements.md %}).
- Explore our [example apps]({% link {{site.current_cloud_version}}/example-apps.md %}) for examples on how to build applications using your preferred driver or ORM and run it on CockroachDB.
- [Migrate your existing data]({% link molt/migration-overview.md %}).
- Build a simple CRUD application in [Go]({% link {{site.current_cloud_version}}/build-a-go-app-with-cockroachdb.md %}), [Java]({% link {{site.current_cloud_version}}/build-a-java-app-with-cockroachdb.md %}), [Node.js]({% link {{site.current_cloud_version}}/build-a-nodejs-app-with-cockroachdb.md %}), or [Python]({% link {{site.current_cloud_version}}/build-a-python-app-with-cockroachdb.md %}).
- For examples of applications that use free CockroachDB {{ site.data.products.cloud }} clusters, check out the following [Hack the North](https://hackthenorth.com/) projects:
    - [flock](https://devpost.com/software/flock-figure-out-what-film-to-watch-with-friends)
    - [mntr.tech](https://devpost.com/software/mntr-tech)
    - [curbshop.online](https://devpost.com/software/curbshop-online)
