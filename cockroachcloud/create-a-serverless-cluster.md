---
title: Create a CockroachDB Serverless Cluster
summary: Learn how to create a cluster using CockroachDB Serverless.
toc: true
docs_area: deploy
cloud: true
---

{% include cockroachcloud/filter-tabs/create-cluster-cloud.md %}

This page walks you through the process of creating a cluster using {{ site.data.products.serverless }}. Note that only [{{ site.data.products.db }} Org Administrators](authorization.html#org-administrator-legacy) or users with Cluster Creator / Cluster Admin roles assigned at organization scope can create clusters. If you are a Developer and need to create a cluster, contact your {{ site.data.products.db }} Administrator.

## Before you begin

If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs_create_serverless_cluster" rel="noopener" target="_blank">sign up for a {{ site.data.products.db }} account</a>.

{% include cockroachcloud/free-cluster-limit.md %}

## Step 1. Start the cluster creation process

1. [Log in](https://cockroachlabs.cloud/) to your {{ site.data.products.db }} account.
{% include cockroachcloud/prefer-sso.md %}
1. If there are multiple [organizations](../{{site.versions["stable"]}}/architecture/glossary.html#organization) in your account, select the correct organization in the top right corner.
1. On the **Overview** page, click **Create Cluster**.

## Step 2. Select the cloud provider

1. _(Optional)_ Select a cloud provider (GCP or AWS) in the **Cloud provider** section. Creating a Serverless cluster on Azure is not supported.

1. _(Optional)_ Select a region in the **Regions** section. For optimal performance, select the cloud provider region closest to the region in which you are running your application.

If you want to create a cluster in an unavailable region, please [contact Support](https://support.cockroachlabs.com).

{{site.data.alerts.callout_info}}
You do not need an account with the cloud provider you choose in order to create a cluster on that cloud provider. The cluster is created on infrastructure managed by Cockroach Labs. If you have existing cloud services on either GCP or AWS that you intend to use with your {{ site.data.products.serverless }} cluster, you should select that cloud provider and the region closest to your existing cloud services to maximize performance.
{{site.data.alerts.end}}

## Step 3. Select the regions

In the **Regions** section, select up to six regions. To create a multi-region cluster, click **Add regions** until you have the desired number of regions.

For optimal performance, select the cloud provider and region nearest to where your SQL clients, applications, or external data are located. For example, if your client application is deployed in GCP's `us-east1` region, select GCP as your deployment environment and select `us-east1` as your cluster's region. For multi-region clusters, CockroachDB will optimize access to data from the **Primary region**. See [Multi-Region Capabilities Overview](../{{site.versions["stable"]}}/multiregion-overview.html) to learn more. If you want to create a cluster in an unavailable region, [contact Support](https://support.cockroachlabs.com) or your Cockroach Labs account team.

{{site.data.alerts.callout_info}}
**Multi-region for {{ site.data.products.serverless }} is in [preview](../{{site.versions["stable"]}}/cockroachdb-feature-availability.html)** and subject to change. You cannot currently add or remove regions once a cluster has been created. To share feedback and/or issues, contact [Support](https://support.cockroachlabs.com/hc/en-us).
{{site.data.alerts.end}}

## Step 4. Set resource limits

Your cluster's [resource limits](../{{site.versions["stable"]}}/architecture/glossary.html#resource-limits) are the maximum amount of storage and RUs you can use in a month. If you reach your storage limit, your cluster will be throttled and you may only be able to delete data. If you reach your RU limit, your cluster will be disabled until the end of the billing cycle unless you raise the limit.

All {{ site.data.products.db }} organizations get 50M RUs and 10 GiB of storage for free each month. Free resources can be spent across all {{ site.data.products.serverless }} clusters in an organization. You can set higher resource limits to maintain a high level of performance with larger workloads. You will only be charged for what you use.

{% include cockroachcloud/serverless-usage.md %} For more information, see [Planning your cluster](plan-your-cluster.html).

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="free">Free</button>
  <button class="filter-button page-level" data-scope="paid">Paid</button>
</div>

<section class="filter-content" markdown="1" data-scope="free">

1. Select the **Start for free** option.

    {{site.data.alerts.callout_info}}
    This will only be available if you haven't already created a free {{ site.data.products.serverless }} cluster or set up billing information.
    {{site.data.alerts.end}}

1. Click **Create cluster**.

Your cluster will be created in a few seconds.

</section>

<section class="filter-content" markdown="1" data-scope="paid">

1. If the option to **Start for free** is still available to you, select **Upgrade your resources** instead.

1. Enter your **Resource limits**.
    - If you select **Set a monthly limit**, you can set storage and RU limits individually, or enter a dollar amount that will be split automatically between both resources. You will only be charged for the resources you use.
    - If you select **Unlimited**, your cluster will scale to meet your application's needs. You will only be charged for the resources you use.

1. Click **Next: Payment**.

1. Verify your cluster configuration and [resource limits](../{{site.versions["stable"]}}/architecture/glossary.html#resource-limits).

    {{site.data.alerts.callout_info}}
    The cost displayed does not include taxes.
    {{site.data.alerts.end}}

1. Add your preferred [payment method](billing-management.html).

1. Click **Create cluster**.

Your cluster will be created in a few seconds.

</section>

## What's next

- [Connect to your {{ site.data.products.serverless }} cluster](connect-to-a-serverless-cluster.html)
- [Authorize users](managing-access.html)
- [Learn CockroachDB SQL](learn-cockroachdb-sql.html).
- Explore our [example apps](../{{site.current_cloud_version}}/example-apps.html) for examples on how to build applications using your preferred driver or ORM and run it on CockroachDB.
- [Migrate your existing data](../{{site.current_cloud_version}}/migration-overview.html).
- Build a simple CRUD application in [Go](../{{site.current_cloud_version}}/build-a-go-app-with-cockroachdb.html), [Java](../{{site.current_cloud_version}}/build-a-java-app-with-cockroachdb.html), [Node.js](../{{site.current_cloud_version}}/build-a-nodejs-app-with-cockroachdb.html), or [Python](../{{site.current_cloud_version}}/build-a-python-app-with-cockroachdb.html).
- For examples of applications that use free {{ site.data.products.db }} clusters, check out the following [Hack the North](https://hackthenorth.com/) projects:
    - [flock](https://devpost.com/software/flock-figure-out-what-film-to-watch-with-friends)
    - [mntr.tech](https://devpost.com/software/mntr-tech)
    - [curbshop.online](https://devpost.com/software/curbshop-online)
