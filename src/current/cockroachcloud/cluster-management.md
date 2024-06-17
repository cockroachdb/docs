---
title: Manage a CockroachDB Dedicated Cluster
summary: Manage your cluster's schema, data, and more.
toc: true
docs_area: manage
---

{% include cockroachcloud/filter-tabs/cluster-management.md %}

This page describes the cluster management and cluster deletion workflows for CockroachDB {{ site.data.products.dedicated }}.

## Planning your cluster

Before making any changes to your cluster's nodes or regions, review the [requirements and recommendations]({% link cockroachcloud/plan-your-cluster.md %}) for CockroachDB {{ site.data.products.cloud }} cluster configuration.

## View Clusters page

On [logging in to the CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud/), the **Clusters** page is displayed. The **Clusters** page provides a high-level view of your clusters.

For each cluster, the following details display:

- The cluster's **Name**
- The cluster's **Plan Type** (Serverless, Dedicated standard, or Dedicated advanced)
- The date and time the cluster was **Created**
- The cluster's current **State**
- The cluster's **Cloud** provider, GCP, AWS, or Azure
- The **Version** of CockroachDB the cluster is running
- The **Action** button, which is used to:
    - [**Add or remove nodes**](?filters=dedicated#add-or-remove-nodes-from-a-cluster)
    - [**Increase storage**](?filters=dedicated#increase-storage-for-a-cluster)
    - [**Change compute**](?filters=dedicated#change-compute-for-a-cluster)
    - [**Upgrade major version**]({% link cockroachcloud/upgrade-to-{{site.current_cloud_version}}.md %})
    - [**Add or remove regions**](?filters=dedicated#add-or-remove-regions-from-a-cluster)
    - [**Delete cluster**](#delete-cluster)

To view and manage a specific cluster, click the name of the cluster. The [**Overview**](#view-cluster-overview) page will display.

## View cluster overview

The [**Overview** page]({% link cockroachcloud/cluster-overview-page.md %}?filter=dedicated) displays details about the selected CockroachDB {{ site.data.products.cloud }} cluster:

The cluster's **Configuration** shows details about the cluster, its deployment environment, and its nodes, such as the cluster's cloud provider, plan type, regions, and each node's status, compute, and storage.

The **Cluster upgrades** section shows the cluster's [**Upgrade window**](#set-a-maintenance-window) for patch upgrades and the current value for the [**Delay patch upgrades**](#set-a-maintenance-window) setting.

- The **PCI Ready** section shows the status of features required for PCI DSS. Requires CockroachDB {{ site.data.products.dedicated }} advanced.

- The status of security features required for [PCI DSS readiness](#configure-pci-ready-features-dedicated-advanced).

From the **Overview** page, you can connect to your cluster. For more information, see [Connect to Your CockroachDB {{ site.data.products.dedicated }} Cluster]({% link cockroachcloud/connect-to-your-cluster.md %}).

## Scale your cluster

These sections show how to scale a {{ site.data.products.dedicated }} cluster horizontally by adding or removing nodes or vertically by changing each node's storage and compute resources.

### Add or remove nodes from a cluster

You can add or remove nodes from your cluster through the Console. See [Planning your cluster]({% link cockroachcloud/plan-your-cluster.md %}) for cluster requirements and recommendations before proceeding.

{{site.data.alerts.callout_info}}
You cannot scale a multi-node cluster down to a single-node cluster. If you need to scale down to a single-node cluster, [back up]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}) your cluster and [restore]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}) it into a new single-node cluster. Single-node clusters are not available on Azure.
{{site.data.alerts.end}}

To add or remove nodes from a cluster on AWS or GCP:

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
    When scaling up your cluster, it is generally more effective to increase node size up to 16 vCPUs before adding more nodes. For most production applications, we recommend **at least 4 to 8 vCPUs** per node.
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

### Add a region to your cluster

You can add up to nine regions at a time through the Console. See [Planning your cluster]({% link cockroachcloud/plan-your-cluster.md %}) for cluster requirements and recommendations before proceeding.

1. Navigate to the cluster's **Overview** page.
1. In the **Cluster settings** section, click the pencil icon next to the cluster's **Regions**.

    The **Edit cluster** page displays.

1. On the **Regions** page, click **Add a region**.

    If you have a GCP cluster with [VPC peering]({% link cockroachcloud/network-authorization.md %}) enabled, the IP range will be automatically populated for added regions.

1. Select the desired new region and specify the number of nodes for it.
1. In the sidebar, verify the hourly estimated cost for the cluster.
1. Click **Next: Capacity** and then **Update cluster**.

### Remove a region from your cluster

When you remove a region from a [multi-region]({% link cockroachcloud/plan-your-cluster.md %}#multi-region-clusters) cluster, the node in that region with the highest ordinal will be [decommissioned](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/node-shutdown?filters=decommission#decommission-the-node) first. Any ranges on that node will be [up-replicated](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/ui-replication-dashboard#snapshot-data-received) to other nodes, and once decommission is complete that node will be shut down. This process is then repeated for every other node in the region.

{{site.data.alerts.callout_info}}
If your [zone configurations](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/configure-replication-zones) are set to pin range replicas to a specific region, you cannot remove that region.
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

{{site.data.alerts.callout_info}}
Maintenance operations that are critical for cluster security or stability may be applied outside of the maintenance window, and upgrades that begin in a maintenance window may not always be completed by the end of the window.
{{site.data.alerts.end}}

To set a maintenance window:

1. Click the pencil icon next to **Cluster maintenance** to edit the maintenance window.
1. From the **Day** dropdown, select the day of the week during which maintenance may be applied.
1. From the **Start of window** dropdown, select a start time for your maintenance window in UTC.

    The window will last for 6 hours from the start time.

1. (Optional) If you want to delay automatic patch upgrades for 60 days, switch **Delay patch upgrades** to **On**.

    Enable this setting for production clusters to ensure that development and testing clusters are upgraded before production clusters. This setting applies only to patch versions and not to other kinds of upgrades.

## Restore data from a backup

Cockroach Labs runs full backups daily and incremental backups hourly for every CockroachDB {{ site.data.products.dedicated }} cluster. Full backups are retained for 30 days and incremental backups for 7 days. See the [Use Managed-Service Backups](use-managed-service-backups.html?filters=dedicated#ways-to-restore-data) page for ways to restore data from your cluster's automatic backups in the Console.

Additionally, you can [back up and restore]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}) your CockroachDB {{ site.data.products.dedicated }} cluster manually. For detail on taking backups to your cloud storage, see [Take and Restore Customer-Owned Backups]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}).

{{site.data.alerts.callout_info}}
All databases are not backed up at the same time. Each database is backed up every hour based on the time of creation. For larger databases, you might see an hourly CPU spike while the database is being backed up.
{{site.data.alerts.end}}

## Configure PCI ready features (Dedicated advanced)

CockroachDB {{ site.data.products.dedicated }} advanced clusters have a **PCI ready** panel to monitor the status of security features required for [PCI DSS readiness]({% link cockroachcloud/pci-dss.md %}). Feature statuses will update from **INACTIVE** to **ACTIVE** once you configure them. Learn more about configuring these features:

- [CockroachDB {{ site.data.products.cloud }} Organization Audit logs]({% link cockroachcloud/cloud-org-audit-logs.md %})
- [Customer-Managed Encryption Keys (CMEK)]({% link cockroachcloud/managing-cmek.md %})
- [Egress Perimeter Controls]({% link cockroachcloud/egress-perimeter-controls.md %})
- Single Sign-On (SSO) for your [CockroachDB {{ site.data.products.cloud }} organization]({% link cockroachcloud/configure-cloud-org-sso.md %}) and your [clusters]({% link cockroachcloud/cloud-sso-sql.md %})
- [Network security]({% link cockroachcloud/network-authorization.md %})

You can also check the status of these features on the [**PCI ready**]({% link cockroachcloud/cluster-overview-page.md %}?filters=dedicated#pci-ready-dedicated-advanced) page of the CockroachDB {{ site.data.products.cloud }} Console.

## Enable deletion protection

To help prevent a cluster from being deleted by mistake, you can enable _deletion protection_. Before you can delete a cluster with deletion protection enabled, you must disable deletion protection. A user with permission to delete a cluster can enable deletion protection on the same cluster.

1. Navigate to the **Overview** page for the cluster you want to protect.
1. If deletion protection is disabled, click the pencil icon next to it. Toggle the setting, then click **Save**.

## Delete cluster

{{site.data.alerts.callout_danger}}
Deleting a cluster will delete all cluster data.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
You will only be billed for a CockroachDB {{ site.data.products.dedicated }} cluster while it is running. You can delete a cluster at any time to stop charges from accumulating.
{{site.data.alerts.end}}

Proceed with the following steps only if you are sure you want to delete a cluster:

1. Navigate to the **Overview** page for the cluster you want to delete.
1. If [deletion protection](#enable-deletion-protection) is enabled, click the pencil icon next to it. Toggle the setting, then click **Save**.
1. Click the **Actions** button in the top right corner.
1. Select **Delete cluster**.
1. In the confirmation window, enter the name of the cluster.
1. Click **Delete**.
