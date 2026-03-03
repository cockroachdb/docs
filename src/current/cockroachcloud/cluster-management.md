---
title: Manage a CockroachDB Standard Cluster
summary: Manage your cluster's schema, data, and more.
toc: true
docs_area: manage
---

{{site.data.alerts.callout_info}}
CockroachDB Standard is currently in [Preview]({% link {{ site.current_cloud_version }}/cockroachdb-feature-availability.md %}).
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

## Edit labels

You can [organize CockroachDB {{ site.data.products.cloud }} clusters using labels]({% link cockroachcloud/labels.md %}).

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

### Set major-version upgrades to automatic or manual

By default, major-version upgrades are automatically applied to CockroachDB {{ site.data.products.standard }} clusters. For each cluster, you have the option to enable manual upgrades, instead.

When automatic upgrades are enabled and a new major version is available for CockroachDB {{ site.data.products.standard }}:

- The cluster is automatically upgraded by Cockroach Labs to an early production patch release of the new major version, for example `vXX.Y.1`.
- Standard clusters are upgraded only to [Regular releases]({% link releases/index.md %}).
- Each upgrade is finalized immediately, so it is not possible to roll back to the previous major version.

When manual upgrades are enabled and a new major version is available for CockroachDB {{ site.data.products.standard }}:

- You will need to [manually upgrade the cluster]({% link cockroachcloud/upgrade-cockroach-version.md %}) during its support window, to maintain support.
- Once the initial production patch release for the new major version is made available to CockroachDB {{ site.data.products.standard }}, you can upgrade at any time to the latest available patch release for that major version.
- You can choose to skip Innovation releases and upgrade directly to the subsequent major verison.
- The upgrade is finalized after a 72-hour window, within which you can choose to roll back to the previous major version.

{{site.data.alerts.callout_info}}
For clusters that have the default setting to receive automatic major version upgrades, each upgrade is finalized immediately and cannot be rolled back.
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
If you disable automatic major-version upgrades for a cluster, to maintain support for the cluster, you must manually upgrade it to a supported major version before its current version reaches [End of Support (EOS)]({% link cockroachcloud/upgrade-policy.md %}). If you have not upgraded a cluster's major version for more than one year, it will be upgraded automatically.
{{site.data.alerts.end}}

To disable automatic major-version upgrades for a CockroachDB {{ site.data.products.standard }} cluster:

1. On the [**Cluster Overview** page for the cluster](#view-cluster-overview), click **Actions**, then select **Manual upgrade settings**.
1. Read the information provided, then set **Manual upgrades** to **on**.
1. Click **Apply**.

For manual upgrades to a newer major version of CockroachDB, refer to [Upgrade a cluster in CockroachDB Cloud]({% link cockroachcloud/upgrade-cockroach-version.md %}).

### Automatic major-version upgrades

When Manual upgrades is set to Off, a CockroachDB {{ site.data.products.standard }} cluster will automatically upgrade to a new major version. The version will be a production patch release (likely vXX.Y.1) that is made available soon after the initial GA release (vXX.Y.0).

Before an upgrade is set to occur, a banner displayed in the Console informing you of the version to which the cluster will be upgraded.

When the upgrade occurs, your cluster status will be listed as `Available (Maintenance)` and will remain operational. When the upgrade is complete, the new version will be indicated in the CockroachDB Cloud Console and you will receive an email notification.

### Upgrade the major version manually

For manual upgrades to a newer major version of CockroachDB, refer to [Upgrade a cluster in CockroachDB Cloud]({% link cockroachcloud/upgrade-cockroach-version.md %}).

## Change a cluster's plan

To change your cluster's plan between {{ site.data.products.basic }} and {{ site.data.products.standard }}, refer to [Change a Cluster's Plan Between Standard and Basic]({% link cockroachcloud/change-plan-between-basic-and-standard.md %}).

To change from {{ site.data.products.standard }} to {{ site.data.products.advanced }}, refer to [Migrate from Standard or Basic to Advanced]({% link cockroachcloud/migrate-from-standard-to-advanced.md %}).

## Restore data from a backup

Refer to [Managed Backups]({% link cockroachcloud/managed-backups.md %}) for instructions to restore your cluster from an automatic cluster backup.

You can also [back up and restore]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}) your CockroachDB {{ site.data.products.basic }} or {{ site.data.products.standard }} cluster manually. You can take [backups locally]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}) to [`userfile`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/use-userfile-storage) or [back up to cloud storage]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}).

## Enable deletion protection

To help prevent a cluster from being deleted by mistake, you can enable _deletion protection_. Before you can delete a cluster with deletion protection enabled, you must disable deletion protection. A user with permission to delete a cluster can enable deletion protection on the same cluster.

1. Navigate to the **Overview** page for the cluster you want to protect.
1. If deletion protection is disabled, click the pencil icon next to it. Toggle the setting, then click **Save**.

## Delete cluster

{{site.data.alerts.callout_danger}}
Deleting a cluster will delete all cluster data. Deleted clusters can not be restored.
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
