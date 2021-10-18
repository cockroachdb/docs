---
title: Create a CockroachCloud Free (beta) Cluster
summary: Learn how to create a cluster using CockroachCloud Free (beta).
toc: true
---

<div class="filters clearfix">
    <a href="create-a-free-cluster.html"><button class="filter-button page-level current">{{ site.data.products.serverless }}</button></a>
    <a href="create-your-cluster.html"><button class="filter-button page-level">{{ site.data.products.dedicated }}</button></a>
</div>

This page walks you through the process of creating a cluster using {{ site.data.products.serverless }}. Note that only [{{ site.data.products.db }} Console Administrators](console-access-management.html#console-admin) can create clusters. If you are a Developer and need to create a cluster, contact your {{ site.data.products.db }} Administrator.

{% include cockroachcloud/free-limitations.md %}

## Before you begin

If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs_create_free_cluster" rel="noopener" target="_blank">sign up for a {{ site.data.products.db }} account</a>.

## Step 1. Start the cluster creation process

1. [Log in](https://cockroachlabs.cloud/) to your {{ site.data.products.db }} account.
2. If there are multiple [organizations](console-access-management.html#organization) in your account, select the correct organization in the top right corner.
3. On the **Overview** page, click **Create Cluster**.

## Step 2. Select Free Plan

1. On the **Create your cluster** page, select the **{{ site.data.products.serverless-plan }}**.

    {{site.data.alerts.callout_info}}
    This cluster will be free forever.
    {{site.data.alerts.end}}

1. _(Optional)_ Select a cloud provider (GCP or AWS) in the **Additional configuration** section.

1. _(Optional)_ Select a region in the **Additional configuration** section. For optimal performance, select the cloud provider region closest to the region in which you are running your application.

1. Click **Create your free cluster**.

Your cluster will be created in approximately 20-30 seconds.

## What's next

- [Connect to your free cluster](connect-to-a-free-cluster.html)
- [Authorize users](user-authorization.html)

## Usage examples

{{ site.data.products.serverless }} can be used for proofs-of-concept, toy programs, or to use while completing [Cockroach University](https://www.cockroachlabs.com/cockroach-university/).

For examples of applications that use {{ site.data.products.serverless }}, check out the following [Hack the North](https://hackthenorth.com/) projects:

- [flock](https://devpost.com/software/flock-figure-out-what-film-to-watch-with-friends)
- [mntr.tech](https://devpost.com/software/mntr-tech)
- [curbshop.online](https://devpost.com/software/curbshop-online)
