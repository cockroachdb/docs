---
title: Manage a CockroachDB Serverless Cluster
summary: Manage your cluster's schema, data, and more.
toc: true
docs_area: manage
---

{% include cockroachcloud/filter-tabs/cluster-management.md %}

This page describes the cluster management and cluster deletion workflows for CockroachDB {{ site.data.products.serverless }}.

## View Clusters page

On [logging in to the CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud/), the **Clusters** page is displayed. The **Clusters** page provides a high-level view of your clusters.

For each cluster, the following details display:

- The cluster's **Name**
- The cluster's **Plan type**, either Serverless or Dedicated
- The date and time the cluster was **Created**
- The cluster's current **State**
- The cluster's cloud provider, either GCP or AWS
- The **Version** of CockroachDB the cluster is running
- The **Action** button, which is used to:
    - [**Edit cluster**](#edit-cluster-capacity)
    - [**Move cluster**]({% link cockroachcloud/folders.md %}#move-a-cluster-into-or-out-of-a-folder)
    - [**Delete cluster**](#delete-cluster)
    - **Get support**

To view and manage a specific cluster, click the name of the cluster. The [**Overview**](#view-cluster-overview) page will display.

## View cluster overview

The **Overview** page displays details about the selected CockroachDB {{ site.data.products.serverless }} cluster:

- The **Cluster settings** section, including **Cloud provider**, **Plan type**, and **Regions**
- The **Capacity used this month** section, including **Request Units** and **Storage**
- The cluster's **Current activity**
- Time-series graphs of the cluster's **Request Units**, **Storage usage**, and **SQL statements**

For more information, see [Cluster Overview Page]({% link cockroachcloud/cluster-overview-page.md %}).

## Estimate usage cost

{{site.data.alerts.callout_info}}
This feature is not available if your organization is billed through [Credits]({% link cockroachcloud/billing-management.md %}#view-credits-balance).
{{site.data.alerts.end}}

The monthly cost estimate is calculated using simple extrapolation that assumes your workload during the selected time frame is an accurate representation of your workload over the month. If you haven't been running a workload for at least the length of the selected time frame, your results will be inaccurate.

1. In the **Capacity used this month** section of your cluster's [**Overview** page]({% link cockroachcloud/cluster-overview-page.md %}), click **Update capacity**.
1. On the **Edit cluster** page, navigate to **Capacity**.
1. Under the **Estimate cost based on usage** section, select a time period in which your workload was active.

    Your used [RUs]({% link cockroachcloud/plan-your-cluster-serverless.md %}#request-units), used storage, and accrued costs during the time period will be shown along with a monthly cost estimate. The accrued costs and monthly cost estimate do not account for the [free resources]({% link cockroachcloud/plan-your-cluster-serverless.md %}#free-vs-paid-usage) granted to each non-contract organization, which you would have to use up before being charged.

## Edit cluster capacity

On the **Overview** page, you can edit your resource limits. Changes apply to the current and future billing cycles. For more details, refer to [Plan a CockroachDB {{ site.data.products.serverless }} cluster](plan-your-cluster-serverless.html).

1. In the **Capacity used this month** section of your cluster's [**Overview** page]({% link cockroachcloud/cluster-overview-page.md %}), click **Update capacity**.

1. On the **Capacity** page, set the configure the new resource limits. In the sidebar, click **Update cluster**.

## Edit regions

You can add up to six [regions]({% link cockroachcloud/regions.md %}) at a time and change your [primary region]({% link cockroachcloud/plan-your-cluster-serverless.md %}#multi-region-clusters) through the {{ site.data.products.cloud }} Console. You cannot currently edit the region configuration for a single-region cluster once it has been created, and you cannot remove a region once it has been added.

{{site.data.alerts.callout_info}}
You can only add regions to clusters created after May 16, 2023.
{{site.data.alerts.end}}

### Add regions

To add regions to your cluster:

1. Navigate to the cluster's **Overview** page.
1. In the **Cluster settings** section, click the pencil icon next to the cluster's **Regions**.

    The **Edit cluster** page displays.

1. Click **Add region**.
1. Choose the region you want to add or use the suggested one.
1. In the sidebar, verify the hourly estimated cost for the cluster.
1. Click **Next: Capacity** and then click **Update cluster**.

### Edit the primary region

To set the primary region:

1. Navigate to the cluster's **Overview** page.
1. In the **Cluster settings** section, click the pencil icon next to the cluster's **Regions**.

    The **Edit cluster** page displays.

1. Select **Set primary region** next to your preferred region.
1. Click **Next: Capacity** and then click **Update cluster**.

### Move cluster to a new region

A CockroachDB {{ site.data.products.serverless }} cluster cannot be moved from one region to another directly. Instead, you must restore the cluster's data from a backup to a new CockroachDB {{ site.data.products.serverless }} cluster with the desired region configuration:

1. [Back up your existing cluster's data]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}).
1. [Create a new CockroachDB Serverless cluster]({% link cockroachcloud/create-a-serverless-cluster.md %}) in the desired region.
1. Once the new cluster is set up, [restore your data]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}) from the backup into the new cluster.

## Restore data from a backup

Use the [Managed-Service Backups]({% link cockroachcloud/use-managed-service-backups.md %}) to restore your cluster from automatic full cluster backups.

You can also [back up and restore]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}) your CockroachDB {{ site.data.products.serverless }} cluster manually. You can take [backups locally]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}) to [`userfile`]({% link {{site.current_cloud_version}}/use-userfile-storage.md %}) or [back up to cloud storage]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}).

## Enable deletion protection

To help prevent a cluster from being deleted by mistake, you can enable _deletion protection_. Before you can delete a cluster with deletion protection enabled, you must disable deletion protection. A user with permission to delete a cluster can enable deletion protection on the same cluster.

1. Navigate to the **Overview** page for the cluster you want to protect.
1. If deletion protection is disabled, click the pencil icon next to it. Toggle the setting, then click **Save**.

## Delete cluster

{{site.data.alerts.callout_danger}}
Deleting a cluster will delete all cluster data.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Free CockroachDB {{ site.data.products.serverless }} clusters are subject to deletion after 6 months of no activity.
{{site.data.alerts.end}}

Proceed with the following steps only if you are sure you want to delete a cluster:

1. Navigate to the **Overview** page for the cluster you want to delete.
1. If [deletion protection](#enable-deletion-protection) is enabled, click the pencil icon next to it. Toggle the setting, then click **Save**.
1. Click the **Actions** button in the top right corner.
1. Select **Delete cluster**.
1. In the confirmation window, enter the name of the cluster.
1. Click **Delete**.
