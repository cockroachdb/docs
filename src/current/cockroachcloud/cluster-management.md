---
title: Manage a CockroachDB Standard Cluster
summary: Manage your cluster's schema, data, and more.
toc: true
docs_area: manage
---

{{site.data.alerts.callout_info}}
CockroachDB Standard, our new, enterprise-ready plan, is currently in [Preview]({% link {{ site.current_cloud_version }}/cockroachdb-feature-availability.md %}).
{{site.data.alerts.end}}

{% include cockroachcloud/filter-tabs/cluster-management.md %}

This page describes the cluster management and cluster deletion workflows for CockroachDB {{ site.data.products.standard }}.

## Planning your cluster

Before making any changes to your cluster's regions, review the [requirements and recommendations]({% link cockroachcloud/plan-your-cluster.md %}) for CockroachDB {{ site.data.products.cloud }} cluster configuration.

## View Clusters page

After you [log in to the CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud/), the **Clusters** page is displayed. The **Clusters** page provides a high-level view of your clusters.

To view and manage a specific cluster, click the name of the cluster. The [**Overview**](#view-cluster-overview) page will display.

## View cluster overview

The [**Overview** page]({% link cockroachcloud/cluster-overview-page.md %}) displays details about the selected CockroachDB {{ site.data.products.cloud }} cluster.

From the **Overview** page, you can connect to your cluster. For more information, refer to [Connect to Your CockroachDB {{ site.data.products.standard }} Cluster]({% link cockroachcloud/connect-to-your-cluster.md %}).

## Add a region to your cluster

1. Navigate to the cluster's **Overview** page.
1. In the **Cluster settings** section, click the pencil icon next to the cluster's **Regions**.

    The **Edit Cluster** page displays.

1. On the **Regions** page, click Add Region and select the desired new region.
1. In the sidebar, verify the hourly estimated cost for the cluster.
1. Click **Next: Capacity** and then **Update cluster**.

## Edit cluster capacity

The price-performance characteristics of CockroachDB {{ site.data.products.standard }} vary significantly depending on the workload. It can be difficult to estimate a workload's compute requirements in advance. To increase or decrease a cluster's provisioned capacity:

To edit your cluster's capacity:

1. Navigate to the cluster's **Overview** page.
1. In the **Capacity** section, click **Update capacity**.
    The **Capacity** page displays.
1. Enter the desired number of request units per second or use the slider to increase or decrease the request units per second.

    {{site.data.alerts.callout_success}}
    You can decrease the provisioned capacity only three times within a 7-day period. You can increase the provisioned capacity at any time.
    {{site.data.alerts.end}}

1. In the sidebar, verify the new estimated cost for the cluster and click **Update cluster**.

To learn more, refer to [Plan a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/plan-your-cluster.md %}#provisioned-capacity).

## Manage cluster upgrades

By default, major-version and patch upgrades are automatically applied to CockroachDB {{ site.data.products.standard }} clusters. To control when a cluster is upgraded to a new major version, you can disable automatic major-version upgrades. Patch upgrades are always applied automatically.

{{site.data.alerts.callout_danger}}
If you disable automatic major-version upgrades for a cluster, to maintain support for the cluster, you must manually upgrade it to a later major version before its current version reaches [End of Support (EOS)]({% link cockroachcloud/upgrade-policy.md %}).
{{site.data.alerts.end}}

To disable automatic major-version upgrades for a CockroachDB {{ site.data.products.standard }} cluster:

1. On the [**Cluster Overview** page for the cluster](#view-cluster-overview), click **Action**, then select **Manual upgrade settings**.
1. Read the information provided, then set **Manual upgrades** to **on**.
1. Click **Apply**.

## Restore data from a backup

Refer to [Managed Backups]({% link cockroachcloud/managed-backups.md %}) for instructions to restore your cluster from an automatic cluster backup.

You can also [back up and restore]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}) your CockroachDB {{ site.data.products.serverless }} cluster manually. You can take [backups locally]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}) to [`userfile`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/use-userfile-storage) or [back up to cloud storage]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}).

## Enable deletion protection

To help prevent a cluster from being deleted by mistake, you can enable _deletion protection_. Before you can delete a cluster with deletion protection enabled, you must disable deletion protection. A user with permission to delete a cluster can enable deletion protection on the same cluster.

1. Navigate to the **Overview** page for the cluster you want to protect.
1. If deletion protection is disabled, click the pencil icon next to it. Toggle the setting, then click **Save**.

## Delete cluster

{{site.data.alerts.callout_danger}}
Deleting a cluster will delete all cluster data.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
You will be billed only for a CockroachDB {{ site.data.products.standard }} cluster while it is running. You can delete a cluster at any time to prevent charges from accumulating.
{{site.data.alerts.end}}

Proceed with the following steps only if you are sure you want to delete a cluster:

1. Navigate to the **Overview** page for the cluster you want to delete.
1. If [deletion protection](#enable-deletion-protection) is enabled, click the pencil icon next to it. Toggle the setting, then click **Save**.
1. Click the **Actions** button in the top right corner.
1. Select **Delete cluster**.
1. In the confirmation window, enter the name of the cluster.
1. Click **Delete**.
