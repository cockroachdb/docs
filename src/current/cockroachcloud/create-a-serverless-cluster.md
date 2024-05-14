---
title: Create a CockroachDB Serverless Cluster
summary: Learn how to create a cluster using CockroachDB Serverless.
toc: true
docs_area: deploy
cloud: true
---

{% include cockroachcloud/filter-tabs/create-cluster-cloud.md %}

This page guides you through the process of creating a cluster using CockroachDB {{ site.data.products.serverless }}. Only [CockroachDB {{ site.data.products.cloud }} Org Administrators]({% link cockroachcloud/authorization.md %}#org-administrator) or users with Cluster Creator / Cluster Admin roles assigned at organization scope can create clusters. If you need to create a cluster and do not have one of the required roles, contact your CockroachDB {{ site.data.products.cloud }} Administrator.

## Before you begin

If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs_create_serverless_cluster" rel="noopener" target="_blank">sign up for a CockroachDB {{ site.data.products.cloud }} account</a>.

{% include cockroachcloud/free-cluster-limit.md %}

## Step 1. Start the cluster creation process

1. [Log in](https://cockroachlabs.cloud/) to your CockroachDB {{ site.data.products.cloud }} account.
{% include cockroachcloud/prefer-sso.md %}
1. If there are multiple [organizations](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/architecture/glossary#organization) in your account, select the correct organization in the top right corner.
1. On the **Overview** page, click **Create Cluster**.
1. On the **Select a plan** page, select **Serverless**.

## Step 2. Select the cloud provider

On the **Cloud & Regions** page, select a cloud provider (GCP or AWS) in the **Cloud provider** section. Creating a Serverless cluster on Azure is not supported.

{{site.data.alerts.callout_info}}
You do not need an account with the cloud provider you choose in order to create a cluster on that cloud provider. The cluster is created on infrastructure managed by Cockroach Labs. If you have existing cloud services on either GCP or AWS that you intend to use with your CockroachDB {{ site.data.products.serverless }} cluster, you should select that cloud provider and the region closest to your existing cloud services to maximize performance.
{{site.data.alerts.end}}

## Step 3. Select the regions

In the **Regions** section, select a region for the cluster. Refer to [CockroachDB {{ site.data.products.cloud }} Regions]({% link cockroachcloud/regions.md %}) for the regions where CockroachDB {{ site.data.products.serverless }} clusters can be deployed.

For optimal performance, select the cloud provider and region nearest to where your SQL clients, applications, or external data are located. For multi-region clusters, CockroachDB will optimize access to data from the [**Primary region**](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/multiregion-overview). Refer to [Plan a CockroachDB {{ site.data.products.serverless }} Cluster](plan-your-cluster-serverless.html#multi-region-clusters) to learn more. To express interest in additional regions, [contact Support](https://support.cockroachlabs.com) or your Cockroach Labs account team.

To create a multi-region cluster, click **Add regions** and select additional regions. A cluster can have at most six regions.

{{site.data.alerts.callout_info}}
You cannot currently remove regions once they have been added.
{{site.data.alerts.end}}

After creating a multi-region cluster deployed on AWS, you can optionally [set up AWS PrivateLink (Limited Access)]({% link cockroachcloud/network-authorization.md %}#aws-privatelink) so that incoming connections to your cluster from applications or services running in your AWS account flow over private AWS network infrastructure rather than the public internet.

Private connectivity is not available for {{ site.data.products.serverless }} clusters on GCP.

Click **Next: Capacity**.

## Step 4. Configure cluster capacity

Your cluster's capacity dictates its [resource limits](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/architecture/glossary#resource-limits), which are the maximum amount of storage and RUs you can use in a month. If you reach your storage limit, your cluster will be throttled and you may only be able to delete data. If you reach your RU limit, your cluster will be disabled until the end of the billing cycle unless you raise the limit.

All CockroachDB {{ site.data.products.cloud }} organizations get 50M RUs and 10 GiB of storage for free each month. Free resources can be spent across all CockroachDB {{ site.data.products.serverless }} clusters in an organization. You can set higher resource limits to maintain a high level of performance with larger workloads. You will only be charged for what you use.

{% include cockroachcloud/serverless-usage.md %} For more information, see [Planning your cluster]({% link cockroachcloud/plan-your-cluster.md %}).

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="free">Free</button>
  <button class="filter-button page-level" data-scope="paid">Paid</button>
</div>

<section class="filter-content" markdown="1" data-scope="free">

1. On the **Capacity** page, select the **Start for free** option.

    {{site.data.alerts.callout_info}}
    This will only be available if you haven't already created a free CockroachDB {{ site.data.products.serverless }} cluster or set up billing information.
    {{site.data.alerts.end}}

1. Click **Next: Finalize**.

</section>

<section class="filter-content" markdown="1" data-scope="paid">

1. On the **Capacity** page, if the option to **Start for free** is still available to you, select **Upgrade your capacity** instead.

1. Configure **On-Demand capacity**.
    - If you select **Unlimited**, your cluster will scale to meet your application's needs. You will only be charged for the resources you use.
    - If you select **Set a monthly limit**, you can set storage and RU limits individually, or enter a dollar amount that will be split automatically between both resources. You will only be charged for the resources you use.

1. Click **Next: Finalize**.

</section>

## Step 5. Enter billing details

1. On the **Finalize** page, verify your cluster and capacity [capacity](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/architecture/glossary#resource-limits) configuration.

    {{site.data.alerts.callout_info}}
    The cost displayed does not include taxes and provides a maximum cost estimate. Your final bill will reflect your actual usage.
    {{site.data.alerts.end}}

1. If you haven't already, add your preferred [payment method]({% link cockroachcloud/billing-management.md %}).

## Step 6. Name the cluster

The cluster is automatically given a randomly-generated name. If desired, change the cluster's name. The cluster name must be 6-20 characters in length, and can include lowercase letters, numbers, and dashes (but no leading or trailing dashes). A cluster's name cannot be edited after it is created.

Click **Create cluster**. Your cluster will be created in a few seconds.

## Video demo

To learn the basics of multi-region Serverless clusters, watch the following video:

{% include_cached youtube.html video_id="qoexXvuHNfI" %}

## What's next

- [Connect to your CockroachDB {{ site.data.products.serverless }} cluster]({% link cockroachcloud/connect-to-a-serverless-cluster.md %})
- [Authorize users]({% link cockroachcloud/managing-access.md %})
- [Learn CockroachDB SQL]({% link cockroachcloud/learn-cockroachdb-sql.md %}).
- Explore our [example apps](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/example-apps) for examples on how to build applications using your preferred driver or ORM and run it on CockroachDB.
- [Migrate your existing data](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/migration-overview).
- Build a simple CRUD application in [Go](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/build-a-go-app-with-cockroachdb), [Java](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/build-a-java-app-with-cockroachdb), [Node.js](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/build-a-nodejs-app-with-cockroachdb), or [Python](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/build-a-python-app-with-cockroachdb).
- For examples of applications that use free CockroachDB {{ site.data.products.cloud }} clusters, check out the following [Hack the North](https://hackthenorth.com/) projects:
    - [flock](https://devpost.com/software/flock-figure-out-what-film-to-watch-with-friends)
    - [mntr.tech](https://devpost.com/software/mntr-tech)
    - [curbshop.online](https://devpost.com/software/curbshop-online)
