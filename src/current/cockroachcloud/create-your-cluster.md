---
title: Create a CockroachDB Standard Cluster
summary: Learn how to create your CockroachDB Standard cluster.
toc: true
docs_area: deploy
---

{% include cockroachcloud/filter-tabs/create-cluster-cloud.md %}

This page guides you through the process of creating a CockroachDB {{ site.data.products.standard }} cluster using the [Cloud Console](httrps://cockroachlabs.cloud). To use the Cloud API instead, refer to [Create a New Cluster]({% link cockroachcloud/cloud-api.md %}#create-a-new-cluster).

Only [CockroachDB {{ site.data.products.cloud }} Org Administrators]({% link cockroachcloud/authorization.md %}#org-administrator-legacy) or users with Cluster Creator / Cluster Admin roles assigned at organization scope can create clusters. If you are a Developer and need to create a cluster, contact your CockroachDB {{ site.data.products.cloud }} Administrator.

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

On the **Cloud & Regions page**, in the **Cloud provider** section, select your deployment environment: **Google Cloud** or **AWS**.

You do not need an account in the deployment environment you choose. The cluster is created on infrastructure managed by Cockroach Labs. If you intend to use your CockroachDB {{ site.data.products.standard }} cluster with data or services in a cloud tenant that you manage, you should select that cloud provider and the region closest to your existing cloud services to maximize performance.

Pricing depends on your cloud provider and region selections. 

{% include cockroachcloud/cockroachcloud-pricing.md %}

## Step 3. Configure region(s)

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

You will be charged only for the storage you use. Storage starts at $0.75/GiB hour and the cost varies by region.

Click **Next: Finalize**.

## Step 5. Enter billing details

1. On the **Finalize** page, verify your selections for the cloud provider, region(s), and the capacity.
1. Verify the hourly estimated cost for the cluster. The cost displayed does not include taxes.

    You will be billed monthly.

1. Add your preferred [payment method]({% link cockroachcloud/billing-management.md %}).
1. [If applicable]({% link cockroachcloud/frequently-asked-questions.md %}#how-do-cockroachdb-free-trials-work), the 30-day trial code is pre-applied to your cluster.
      {{site.data.alerts.callout_info}}
      Make sure that you [delete your trial cluster]({% link cockroachcloud/cluster-management.md %}#delete-cluster) before the trial expires. Your credit card will be charged after the trial ends. You can check the validity of the code on the [Billing]({% link cockroachcloud/billing-management.md %}) page.
      {{site.data.alerts.end}}

## Step 7. Name the cluster

The cluster is automatically given a randomly-generated name. If desired, change the cluster's name. The cluster name must be 6-20 characters in length, and can include lowercase letters, numbers, and dashes (but no leading or trailing dashes). A cluster's name cannot be edited after it is created.

Click **Create cluster**. Your cluster will be created in a few seconds.

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
