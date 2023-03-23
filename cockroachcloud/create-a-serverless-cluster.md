---
title: Create a CockroachDB Serverless Cluster
summary: Learn how to create a cluster using CockroachDB Serverless.
toc: true
docs_area: deploy
---

{% include cockroachcloud/filter-tabs/create-cluster-cloud.md %}

This page walks you through the process of creating a cluster using {{ site.data.products.serverless }}. Note that only [{{ site.data.products.db }} Console Administrators](console-access-management.html#console-admin) can create clusters. If you are a Developer and need to create a cluster, contact your {{ site.data.products.db }} Administrator.

## Before you begin

If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs_create_serverless_cluster" rel="noopener" target="_blank">sign up for a {{ site.data.products.db }} account</a>.

## Step 1. Start the cluster creation process

1. [Log in](https://cockroachlabs.cloud/) to your {{ site.data.products.db }} account.
{% include cockroachcloud/prefer-sso.md %}
1. If there are multiple [organizations](console-access-management.html#organization) in your account, select the correct organization in the top right corner.
1. On the **Overview** page, click **Create Cluster**.

## Step 2. Select a cloud provider & region

1. _(Optional)_ Select a cloud provider (GCP or AWS) in the **Cloud provider** section.

1. _(Optional)_ Select a region in the **Regions** section. For optimal performance, select the cloud provider region closest to the region in which you are running your application.

If you want to create a cluster in an unavailable region, please [contact Support](https://support.cockroachlabs.com).

{{site.data.alerts.callout_info}}
You do not need an account with the cloud provider you choose in order to create a cluster on that cloud provider. The cluster is created on infrastructure managed by Cockroach Labs. If you have existing cloud services on either GCP or AWS that you intend to use with your {{ site.data.products.serverless }} cluster, you should select that cloud provider and the region closest to your existing cloud services to maximize performance.
{{site.data.alerts.end}}

## Step 3. Enter a spend limit

Every cluster starts with 10M RUs of free [burst capacity](architecture.html#cockroachdb-cloud-terms) each month and earns 100 RUs per second up to a maximum of 50M free RUs per month. Earned RUs can be used immediately or accumulated as burst capacity. If you use all of your burst capacity, your cluster will revert to baseline performance.

If you set a spend limit, your cluster will not be throttled to baseline performance once you use all of your free earned RUs. Instead, it will continue to use burst performance as needed until you reach your spend limit. You will only be charged for the resources you use up to your spend limit. If you reach your spend limit, your cluster will revert to the baseline performance of 100 RUs per second.

{% include cockroachcloud/serverless-usage.md %} For more information, see [Planning your cluster](plan-your-cluster.html).

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="free">Free</button>
  <button class="filter-button page-level" data-scope="paid">Paid</button>
</div>

<section class="filter-content" markdown="1" data-scope="free">

1. Click **Create cluster**.

Your cluster will be created in a few seconds.

</section>

<section class="filter-content" markdown="1" data-scope="paid">

1. Enter your **Spend limit**.

    This is the maximum amount you could be charged per month. You will be charged only for what you use.

1. Click **Next: Payment info**.

1. Verify your cluster configuration and spend limit.

    {{site.data.alerts.callout_info}}
    The cost displayed does not include taxes.
    {{site.data.alerts.end}}

1. Add your preferred [payment method](billing-management.html).

1. Click **Create cluster**.

Your cluster will be created in a few seconds.

</section>

## What's next

- [Connect to your {{ site.data.products.serverless }} cluster](connect-to-a-serverless-cluster.html)
- [Authorize users](user-authorization.html)

## Usage examples

Free {{ site.data.products.serverless }} clusters can be used for proofs-of-concept, toy programs, or to use while completing [Cockroach University](https://www.cockroachlabs.com/cockroach-university/).

For examples of applications that use free {{ site.data.products.db }} clusters, check out the following [Hack the North](https://hackthenorth.com/) projects:

- [flock](https://devpost.com/software/flock-figure-out-what-film-to-watch-with-friends)
- [mntr.tech](https://devpost.com/software/mntr-tech)
- [curbshop.online](https://devpost.com/software/curbshop-online)
