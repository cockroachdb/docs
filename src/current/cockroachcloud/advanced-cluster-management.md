---
title: Manage a CockroachDB Advanced Cluster
summary: Manage your cluster's schema, data, and more.
toc: true
docs_area: manage
---

{% include cockroachcloud/filter-tabs/cluster-management.md %}

This page describes the cluster management and cluster deletion workflows for CockroachDB {{ site.data.products.advanced }}.

{{site.data.alerts.callout_danger}}
If you are managing clusters in a [BYOC deployment]({% link cockroachcloud/byoc-deployment.md %}) you must use the [{{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}) to perform the actions described on this page.
{{site.data.alerts.end}}

## Planning your cluster

Before making any changes to your cluster's nodes or regions, review the [requirements and recommendations]({% link cockroachcloud/plan-your-cluster.md %}) for CockroachDB {{ site.data.products.cloud }} cluster configuration.

## View Clusters page

On [logging in to the CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud/), the **Clusters** page is displayed. The **Clusters** page provides a high-level view of your clusters.

To view and manage a specific cluster, click the name of the cluster. The [**Overview**](#view-cluster-overview) page will display.

## View cluster overview

The [**Overview** page]({% link cockroachcloud/cluster-overview-page.md %}) displays details about the selected CockroachDB {{ site.data.products.cloud }} cluster.

From the **Overview** page, you can connect to your cluster. For more information, see [Connect to Your CockroachDB {{ site.data.products.advanced }} Cluster]({% link cockroachcloud/connect-to-your-cluster.md %}).

## Edit labels

You can [organize CockroachDB {{ site.data.products.cloud }} clusters using labels]({% link cockroachcloud/labels.md %}).

## Scale your cluster

These sections show how to scale a {{ site.data.products.advanced }} cluster horizontally by adding or removing nodes or vertically by changing each node's storage and compute resources.

### Add or remove nodes from a cluster

You can add or remove nodes from your cluster through the Console. See [Planning your cluster]({% link cockroachcloud/plan-your-cluster.md %}) for cluster requirements and recommendations before proceeding.

{{site.data.alerts.callout_info}}
You cannot scale a multi-node cluster down to a single-node cluster.
{{site.data.alerts.end}}

To add or remove nodes from your cluster:

1. Navigate to the cluster's **Overview** page.
1. In the **Cluster settings** section, click the pencil icon next to the cluster's **Regions**.

    The **Edit cluster** page displays.

1. On the **Regions** page, select the number of nodes you want in each region from the **Nodes** dropdown.
1. In the sidebar, verify the hourly estimated cost for the cluster.
1. Click **Next: Capacity** and then **Update cluster**.

### Change compute for a cluster

1. Navigate to the cluster's **Overview** page and click **Update capacity**.

    The **Edit cluster** page displays.

1. In the **Compute per node** section, select the new amount of vCPUs per node.

    {{site.data.alerts.callout_info}}
    When scaling up your cluster, it is generally more effective to increase node size up to 16 vCPUs before adding more nodes. For most production applications, we recommend **at least 4 to 8 vCPUs** per node. For new CockroachDB {{ site.data.products.cloud }} organizations created after September 26, 2024, a cluster must have at least 4 vCPUs per node.
    {{site.data.alerts.end}}

1. In the sidebar, verify the hourly estimated cost for the cluster.
1. Click **Next: Update cluster**.

### Increase storage for a cluster

{{site.data.alerts.callout_danger}}
AWS disks can only be scaled once every six hours.
{{site.data.alerts.end}}

1. Navigate to the cluster's **Overview** page.
1. Select **Actions > Edit cluster**.

    The **Edit cluster** page displays.

1. In the **Storage per node** section, select the new amount of storage per node.

    {{site.data.alerts.callout_danger}}
    Storage space cannot be removed due to cloud provider limitations.
    {{site.data.alerts.end}}

1. In the sidebar, verify the hourly estimated cost for the cluster.
1. Click **Next: Update cluster**.

## Add or remove regions from a cluster

You can add or remove up to nine regions at a time through the Console. Note that you cannot have a two-region cluster, and it will take about 30 minutes to add or remove each region. See [Planning your cluster]({% link cockroachcloud/plan-your-cluster.md %}) for cluster requirements and recommendations before proceeding.

### Add a region to a cluster

You can add up to nine regions at a time through the Console. See [Planning your cluster]({% link cockroachcloud/plan-your-cluster.md %}) for cluster requirements and recommendations before proceeding.

1. Navigate to the cluster's **Overview** page.
1. In the **Cluster settings** section, click the pencil icon next to the cluster's **Regions**.

    The **Edit cluster** page displays.

1. On the **Regions** page, click **Add a region**.

    For GCP, each region consumes a `/19` CIDR range from the CIDR range configured during cluster creation. If you add a region to a GCP cluster with [VPC peering]({% link cockroachcloud/network-authorization.md %}) enabled, the region's IP range will be populated automatically.

1. Select the desired new region and specify the number of nodes for it.
1. In the sidebar, verify the hourly estimated cost for the cluster.
1. Click **Next: Capacity** and then **Update cluster**.

### Remove a region from your cluster

When you remove a region from a [multi-region]({% link cockroachcloud/plan-your-cluster-advanced.md %}#multi-region-clusters) cluster, the node in that region with the highest ordinal will be [decommissioned]({% link {{site.current_cloud_version}}/node-shutdown.md %}?filters=decommission#decommission-the-node) first. Any ranges on that node will be [up-replicated]({% link {{site.current_cloud_version}}/ui-replication-dashboard.md %}#snapshot-data-received) to other nodes, and once decommission is complete that node will be shut down. This process is then repeated for every other node in the region.

{{site.data.alerts.callout_info}}
If your [zone configurations]({% link {{site.current_cloud_version}}/configure-replication-zones.md %}) are set to pin range replicas to a specific region, you cannot remove that region.
{{site.data.alerts.end}}

To remove a region from your cluster:

1. Navigate to the cluster's **Overview** page.
1. In the **Cluster settings** section, click the pencil icon next to the cluster's **Regions**.

    The **Edit cluster** page displays.

1. On the **Regions** page, click the **X** button next to each region you want to remove.

    {{site.data.alerts.callout_info}}
    If you remove one region from a three-region cluster, CockroachDB Cloud will automatically reduce it to a single-region configuration by deleting two regions.
    {{site.data.alerts.end}}

1. In the sidebar, verify the hourly estimated cost for the cluster.
1. Click **Next: Capacity** and then **Update cluster**.

## Set a maintenance window

From your cluster's [**Overview** page]({% link cockroachcloud/cluster-overview-page.md %}), you can view and manage the maintenance and [patch upgrade]({% link cockroachcloud/upgrade-policy.md %}#patch-version-upgrades) window for your cluster. During the window, your cluster may experience restarts, degraded performance, and downtime for single-node clusters. To help keep your clusters updated while minimizing disruptions, set a window of time when your cluster is experiencing the lowest traffic. If no maintenance window is set, your cluster will be automatically upgraded as soon as new patch versions are available, and other cluster maintenance occurs as needed. Refer to [CockroachDB Cloud Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}).

Setting maintenance windows requires the [Cluster Admin]({% link cockroachcloud/authorization.md %}#cluster-admin) or [Cluster Operator]({% link cockroachcloud/authorization.md %}#cluster-operator) role.

{{site.data.alerts.callout_info}}
Maintenance operations that are critical for cluster security or stability may be applied outside of the maintenance window, and upgrades that begin in a maintenance window may not always be completed by the end of the window.
{{site.data.alerts.end}}

To set a maintenance window in the {{ site.data.products.cloud }} console:

1. Click the pencil icon next to **Cluster maintenance** to edit the maintenance window.
1. From the **Day** dropdown, select the day of the week during which maintenance may be applied.
1. From the **Start of window** dropdown, select a start time for your maintenance window in UTC.

    The window will last for 6 hours from the start time.

1. (Optional) If you want to delay automatic patch upgrades, switch **Delay patch upgrades** to **On**. You can set a deferral period of 30, 60, or 90 days after the patch is released.

    Enable this setting for production clusters to ensure that development and testing clusters are upgraded before production clusters. This setting applies only to patch upgrades and not to major version upgrades. The patch upgrade occurs during a maintenance window after the deferral period.

You can also configure maintenance windows and patch upgrade deferral periods using the [{{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}#configure-a-cockroachdb-advanced-clusters-maintenance-window).

## Restore data from a backup

Cockroach Labs automatically runs full managed backups daily and incremental backups hourly for every CockroachDB {{ site.data.products.advanced }} cluster. Full backups are retained for 30 days and incremental backups for 7 days. Refer to [Use Managed Backups]({% link cockroachcloud/managed-backups.md %}) for ways to restore data from your cluster's automatic backups in the Console.

Additionally, you can [back up and restore]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}) your CockroachDB {{ site.data.products.advanced }} cluster manually. For detail on taking backups to your cloud storage, see [Take and Restore Self-Managed Backups]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}).

{{site.data.alerts.callout_info}}
All databases are not backed up at the same time. Each database is backed up every hour based on the time of creation. For larger databases, you might see an hourly CPU spike while the database is being backed up.
{{site.data.alerts.end}}

## Configure PCI ready features

CockroachDB {{ site.data.products.advanced }} advanced clusters have a **PCI ready** panel to monitor the status of security features required for [PCI readiness]({% link cockroachcloud/pci-dss.md %}). Feature statuses will update from **INACTIVE** to **ACTIVE** once you configure them. Learn more about configuring these features:

- [CockroachDB {{ site.data.products.cloud }} Organization Audit logs]({% link cockroachcloud/cloud-org-audit-logs.md %})
- [Customer-Managed Encryption Keys (CMEK)]({% link cockroachcloud/managing-cmek.md %})
- [Egress Perimeter Controls]({% link cockroachcloud/egress-perimeter-controls.md %})
- Single Sign-On (SSO) for your [CockroachDB {{ site.data.products.cloud }} organization]({% link cockroachcloud/configure-cloud-org-sso.md %}) and your [clusters]({% link cockroachcloud/cloud-sso-sql.md %})
- [Network security]({% link cockroachcloud/network-authorization.md %})

You can also check the status of these features on the [**PCI ready**]({% link cockroachcloud/cluster-overview-page.md %}) page of the CockroachDB {{ site.data.products.cloud }} Console.


## Delete cluster

{{site.data.alerts.callout_danger}}
Deleting a cluster will delete all cluster data. Deleted clusters can not be restored.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
You will only be billed for a CockroachDB {{ site.data.products.advanced }} cluster while it is running. You can delete a cluster at any time to stop charges from accumulating.
{{site.data.alerts.end}}

Proceed with the following steps only if you are sure you want to delete a cluster:

1. Navigate to the **Overview** page for the cluster you want to delete.
1. Click the **Actions** button in the top right corner.
1. Select **Delete cluster**.
1. In the confirmation window, enter the name of the cluster.
1. Click **Delete**.
