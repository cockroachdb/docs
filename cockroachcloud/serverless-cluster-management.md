---
title: Manage a CockroachDB Serverless Cluster
summary: Manage your cluster's schema, data, and more.
toc: true
filter_category: cluster_mgmt
filter_html: CockroachDB Serverless
filter_sort: 1
docs_area: manage
---

{% include filter-tabs.md %}

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

## Edit your spend limit  

You can edit your spend limit from the **Overview** page. The change in your spend limit will affect current and upcoming billing cycles. See [Planning your cluster](plan-your-cluster.html) for more information on resource usage.

1. Navigate to the **Overview** page for the cluster you want to edit.
1. Click the pencil icon (or **Add a spend limit** if you haven't set one before) next to your **Spend limit** in the **Usage this month** section.

    You will be taken to the **Edit cluster** page, which shows a graph of your cluster's **Recommended budget** compared to your current budget.

1. Enter a new **Spend limit**.

1. Click **Update**.

## Restore data from a backup

Use the [**Backups** page](backups-page.html) to restore your cluster from automatic full cluster backups.

You can also [backup and restore](run-bulk-operations.html#backup-and-restore-data) your {{ site.data.products.serverless }} cluster manually. If you don't have [billing information on file](billing-management.html) for your organization, you can take [backups locally](run-bulk-operations.html#backup-and-restore-data) to `userfile`. Once you enter billing information, even if you don't set a spend limit, you can also [backup to cloud storage](run-bulk-operations.html?filters=cloud#backup-and-restore-data).

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
