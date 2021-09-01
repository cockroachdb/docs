---
title: Create a CockroachCloud Serverless (beta) Cluster
summary: Learn how to create a cluster using CockroachCloud Serverless (beta).
toc: true
---

<div class="filters clearfix">
    <a href="create-a-serverless-cluster.html"><button class="filter-button page-level current">CockroachCloud Serverless (beta)</button></a>
    <a href="create-your-cluster.html"><button class="filter-button page-level">CockroachCloud Dedicated</button></a>
</div>

This page walks you through the process of creating a cluster using CockroachCloud Serverless (beta). Note that only [CockroachCloud Console Administrators](console-access-management.html#console-admin) can create clusters. If you are a Developer and need to create a cluster, contact your CockroachCloud Administrator.

{% include cockroachcloud/free-limitations.md %}

## Before you begin

If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs_create_serverless_cluster" rel="noopener" target="_blank">sign up for a CockroachCloud account</a>.

## Step 1. Start the cluster creation process

1. [Log in](https://cockroachlabs.cloud/) to your CockroachCloud account.
2. If there are multiple [organizations](console-access-management.html#organization) in your account, select the correct organization in the top right corner.
3. On the **Overview** page, click **Create Cluster**.

## Step 2. Select a cloud provider & region

1. _(Optional)_ Select a cloud provider (GCP or AWS) in the **Cloud Provider & Region** section.

1. _(Optional)_ Select a region in the **Cloud Provider & Region** section. For optimal performance, select the cloud provider region closest to the region in which you are running your application.

## Step 3. Enter a spend limit

Free clusters include 250M RUs with 10M RUs reserved for [burst performance](architecture.html#concepts) and 5GiB of storage per month. They have a guaranteed baseline performance of 100 RUs per second, or up to 100 QPS.

Paid clusters include additional resources with no throttling. You will only be charged for the resources you use up to your spend limit. If you reach your spend limit, you will still have access to the resources included with free clusters.

{{site.data.alerts.callout_info}}
For more information on determining your resource usage, see [Planning your cluster](serverless-cluster-management.html#planning-your-cluster).
{{site.data.alerts.end}}

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="free">Free</button>
  <button class="filter-button page-level" data-scope="paid">Paid</button>
</div>

<section class="filter-content" markdown="1" data-scope="free">

1. Click **Create cluster**.

Your cluster will be created in approximately 20-30 seconds.

</section>

<section class="filter-content" markdown="1" data-scope="paid">

1. Enter your **Spend limit**.

    This is the maximum amount you could be charged per month. You will be charged only for what you use.

1. Click **Continue to payment details**.

1. Verify the hourly estimated cost for the cluster.
    {{site.data.alerts.callout_info}}
    The cost displayed does not include taxes.
    {{site.data.alerts.end}}
    You will be billed monthly.
    
1. Add your preferred [payment method](console-access-management.html#manage-billing-for-the-organization).

1. Click **Create cluster**.

Your cluster will be created in approximately 20-30 minutes.

</section>

## What's next

- [Connect to your CockroachCloud Serverless (beta) cluster](connect-to-a-serverless-cluster.html)
- [Authorize users](user-authorization.html)

## Usage examples

Free CockroachCloud Serverless (beta) clusters can be used for proofs-of-concept, toy programs, or to use while completing [Cockroach University](https://www.cockroachlabs.com/cockroach-university/).

For examples of applications that use free CockroachCloud clusters, check out the following [Hack the North](https://hackthenorth.com/) projects:

- [flock](https://devpost.com/software/flock-figure-out-what-film-to-watch-with-friends)
- [mntr.tech](https://devpost.com/software/mntr-tech)
- [curbshop.online](https://devpost.com/software/curbshop-online)
