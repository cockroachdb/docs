---
title: Manage a CockroachDB Serverless Cluster
summary: Manage your cluster's schema, data, and more.
toc: true
docs_area: manage
---

{% include cockroachcloud/filter-tabs/cluster-management.md %}

This page describes the cluster management and cluster deletion workflows for {{ site.data.products.serverless }}.

## View Clusters page

On [logging in to the {{ site.data.products.db }} Console](https://cockroachlabs.cloud/), the **Clusters** page is displayed. The **Clusters** page provides a high-level view of your clusters.

For each cluster, the following details display:

- The cluster's **Name**
- The cluster's **Plan type**, either Serverless or Dedicated
- The date and time the cluster was **Created**
- The cluster's current **State**
- The cluster's cloud provider, either GCP or AWS
- The **Version** of CockroachDB the cluster is running
- The **Action** button, which is used to:
    - [**Edit spend limit**](#edit-your-spend-limit)
    - [**Delete cluster**](#delete-cluster)

To view and manage a specific cluster, click the name of the cluster. The [**Overview**](#view-cluster-overview) page will display.

## View cluster overview

The **Overview** page displays details about the selected {{ site.data.products.serverless }} cluster:

- The **Cluster settings** section, including **Cloud provider**, **Plan type**, and **Region**
- The **Usage this month** section, including the **Spend limit**, **Storage**, and **Request Units**
- The cluster's **Current activity**
- Time-series graphs of the cluster's **Storage usage**, **Request Units**, and **SQL statements**

For more information, see [Cluster Overview Page](cluster-overview-page.html).

## Estimate usage cost

{{site.data.alerts.callout_info}}
This feature is not available if your organization is billed through [Credits](billing-management.html#view-credits-balance).
{{site.data.alerts.end}}

The monthly cost estimate is calculated using simple extrapolation that assumes your workload during the selected time frame is an accurate representation of your workload over the month. If you haven't been running a workload for at least the length of the selected time frame, your results will be inaccurate.

1. In the **Usage this month** section of your cluster's [**Overview** page](cluster-overview-page.html), click **Estimate usage cost**.
1. Select a time frame in which your workload was active.

    Your used [RUs](learn-about-request-units.html), used storage, and spend from the selected time frame will be shown along with your monthly cost estimate. The spend and cost estimate do not account for the [free resources](learn-about-pricing.html#free-vs-paid-usage) granted to every {{ site.data.products.serverless }} cluster, which you would have to use up before being charged.

## Edit your spend limit

You can edit your spend limit from the **Overview** page. The change in your spend limit will affect current and upcoming billing cycles. See [Planning your cluster](plan-your-cluster.html) for more information on resource usage.

1. Navigate to the **Overview** page for the cluster you want to edit.
1. Click the pencil icon (or **Add a spend limit** if you haven't set one before) next to your **Spend limit** in the **Usage this month** section.

    You will be taken to the **Edit cluster** page, which shows a graph of your cluster's **Recommended budget** compared to your current budget.

1. Enter a new **Spend limit**.

1. Click **Update**.

## Create a database

You can use the [**Databases** page](databases-page.html) to create a new database from the {{ site.data.products.db }} Console.

1. Select your cluster to navigate to the cluster [**Overview** page](cluster-overview-page.html).
1. Click **Databases** in the **Data** section of the left side navigation.
1. Click **Add database**.
1. Enter a name for the new database.
1. Click **Create**.

## Restore data from a backup

Use the [Managed-Service Backups](use-managed-service-backups.html) to restore your cluster from automatic full cluster backups.

You can also [back up and restore](take-and-restore-customer-owned-backups.html) your {{ site.data.products.serverless }} cluster manually. You can take [backups locally](take-and-restore-customer-owned-backups.html#back-up-data) to [`userfile`](../{{site.current_cloud_version}}/use-userfile.html) or [back up to cloud storage](take-and-restore-customer-owned-backups.html?filters=cloud#back-up-data).

## Delete cluster

{{site.data.alerts.callout_danger}}
Deleting a cluster will delete all cluster data.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Free {{ site.data.products.serverless }} clusters are subject to deletion after 6 months of no activity.
{{site.data.alerts.end}}

Proceed with the following steps only if you are sure you want to delete a cluster:

1. Navigate to the **Overview** page for the cluster you want to delete.
1. Click the **Actions** button in the top right corner.
1. Select **Delete cluster**.
1. In the confirmation window, enter the name of the cluster.
1. Click **Delete**.
