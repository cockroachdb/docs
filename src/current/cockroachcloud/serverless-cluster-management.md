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
    - [**Edit resource limits**](#edit-your-resource-limits)
    - [**Delete cluster**](#delete-cluster)

To view and manage a specific cluster, click the name of the cluster. The [**Overview**](#view-cluster-overview) page will display.

## View cluster overview

The **Overview** page displays details about the selected CockroachDB {{ site.data.products.serverless }} cluster:

- The **Cluster settings** section, including **Cloud provider**, **Plan type**, and **Regions**
- The **Usage this month** section, including the **Resource limits**, **Storage**, and **Request Units**
- The cluster's **Current activity**
- Time-series graphs of the cluster's **Storage usage**, **Request Units**, and **SQL statements**

For more information, see [Cluster Overview Page]({% link cockroachcloud/cluster-overview-page.md %}).

## Estimate usage cost

{{site.data.alerts.callout_info}}
This feature is not available if your organization is billed through [Credits]({% link cockroachcloud/billing-management.md %}#view-credits-balance).
{{site.data.alerts.end}}

The monthly cost estimate is calculated using simple extrapolation that assumes your workload during the selected time frame is an accurate representation of your workload over the month. If you haven't been running a workload for at least the length of the selected time frame, your results will be inaccurate.

1. In the **Usage this month** section of your cluster's [**Overview** page]({% link cockroachcloud/cluster-overview-page.md %}), click **Estimate usage cost**.
1. Select a time period in which your workload was active.

    Your used [RUs]({% link cockroachcloud/plan-your-cluster-serverless.md %}#request-units), used storage, and accrued costs during the time period will be shown along with a monthly cost estimate. The accrused costs and monthly cost estimate do not account for the [free resources]({% link cockroachcloud/plan-your-cluster-serverless.md %}#free-vs-paid-usage) granted to each non-contract organization, which you would have to use up before being charged.

## Edit your resource limits

On the **Overview** page, you can edit your [resource limits](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/architecture/glossary#resource-limits). Changes apply to the current and future billing cycles. For more details, refer to [Plan a CockroachDB {{ site.data.products.serverless }} cluster](plan-your-cluster-serverless.html).

1. Navigate to the **Overview** page for the cluster you want to edit.
1. Click the pencil icon (or **Add resource limits** if you haven't set one before) next to your **Resource limits** in the **Usage this month** section.

    You will be taken to the **Edit cluster** page, which shows a graph of your cluster's **Recommended budget** compared to your current budget.

1. Enter new **Resource limits**.

1. Click **Update**.

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
1. In the **Summary** sidebar, verify the hourly estimated cost for the cluster.
1. Click **Update**.

### Edit the primary region

To set the primary region:

1. Navigate to the cluster's **Overview** page.
1. In the **Cluster settings** section, click the pencil icon next to the cluster's **Regions**.

    The **Edit cluster** page displays.

1. Select **Set primary region** next to your preferred region.
1. Click **Update**.

## Restore data from a backup

Use the [Managed-Service Backups]({% link cockroachcloud/use-managed-service-backups.md %}) to restore your cluster from automatic full cluster backups.

You can also [back up and restore]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}) your CockroachDB {{ site.data.products.serverless }} cluster manually. You can take [backups locally]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}#back-up-data) to [`userfile`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/use-userfile-storage) or [back up to cloud storage]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}?filters=cloud#back-up-data).

## Delete cluster

{{site.data.alerts.callout_danger}}
Deleting a cluster will delete all cluster data.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Free CockroachDB {{ site.data.products.serverless }} clusters are subject to deletion after 6 months of no activity.
{{site.data.alerts.end}}

Proceed with the following steps only if you are sure you want to delete a cluster:

1. Navigate to the **Overview** page for the cluster you want to delete.
1. Click the **Actions** button in the top right corner.
1. Select **Delete cluster**.
1. In the confirmation window, enter the name of the cluster.
1. Click **Delete**.
