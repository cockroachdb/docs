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
    {% comment %}- [**Add/remove regions**](?filters=dedicated#add-or-remove-regions-from-a-cluster){% endcomment %}
    - [**Delete cluster**](#delete-cluster)

To view and manage a specific cluster, click the name of the cluster. The [**Overview**](#view-cluster-overview) page will display.

## View cluster overview

The [**Overview** page]({% link cockroachcloud/cluster-overview-page.md %}?filter=dedicated) displays details about the selected CockroachDB {{ site.data.products.cloud }} cluster:

The cluster's **Configuration** shows details about the cluster, its deployment environment, and its nodes, such as the cluster's cloud provider, plan type, regions, and each node's status, compute, and storage.

The **Cluster upgrades** section shows the cluster's [**Upgrade window**](#set-a-maintenance-window) for patch upgrades and the current value for the [**Delay patch upgrades**](#set-a-maintenance-window) setting.

- The **PCI Ready** section shows the status of features required for PCI DSS. Requires CockroachDB {{ site.data.products.dedicated }} advanced.

- The status of security features required for [PCI readiness](#configure-pci-ready-features-dedicated-advanced).

From the **Overview** page, you can connect to your cluster. For more information, see [Connect to Your CockroachDB {{ site.data.products.dedicated }} Cluster]({% link cockroachcloud/connect-to-your-cluster.md %}).

## Scale your cluster

These sections show how to scale a {{ site.data.products.dedicated }} cluster horizontally by adding or removing nodes or vertically by changing each node's storage and compute resources.

### Add or remove nodes from a cluster

You can add or remove nodes from your cluster through the Console. See [Planning your cluster]({% link cockroachcloud/plan-your-cluster.md %}) for cluster requirements and recommendations before proceeding.

{{site.data.alerts.callout_info}}
You cannot scale a multi-node cluster down to a single-node cluster. If you need to scale down to a single-node cluster, [backup]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}?filters=cloud#back-up-a-cluster) your cluster and [restore]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}?filters=cloud#restore-a-cluster) it into a new single-node cluster.
{{site.data.alerts.end}}

To add or remove nodes from your cluster:

1. Navigate to the cluster's **Overview** page.
1. Select **Actions > Edit cluster**.

    The **Edit cluster** page displays.

1. From the **Nodes** dropdown, select the number of nodes you want in each region.
1. In the **Summary** sidebar, verify the hourly estimated cost for the cluster.
1. Click **Next: Payment**.
1. On the **Summary** page, verify your new cluster configuration.
1. Click **Update**.

### Increase storage for a cluster

{{site.data.alerts.callout_danger}}
AWS disks can only be scaled once every six hours.
{{site.data.alerts.end}}

1. Navigate to the cluster's **Overview** page.
1. Select **Actions > Edit cluster**.

    The **Edit cluster** page displays.

1. Navigate to the **Storage** dropdown in the **Hardware per node** section.
1. Select the new amount of storage per node.

    {{site.data.alerts.callout_danger}}
    Storage space cannot be removed due to cloud provider limitations.
    {{site.data.alerts.end}}

1. In the **Summary** sidebar, verify the hourly estimated cost for the cluster.
1. Click **Next: Payment**.
1. On the **Summary** page, verify your new cluster configuration.
1. Click **Update**.

### Change compute for a cluster

1. Navigate to the cluster's **Overview** page.
1. Select **Actions > Edit cluster**.

    The **Edit cluster** page displays.

1. Navigate to the **Compute** dropdown in the **Hardware per node** section.
1. Select the new amount of vCPUs per node.

    {{site.data.alerts.callout_info}}
    When scaling up your cluster, it is generally more effective to increase node size up to 16 vCPUs before adding more nodes. For most production applications, we recommend **at least 4 to 8 vCPUs** per node.
    {{site.data.alerts.end}}

1. In the **Summary** sidebar, verify the hourly estimated cost for the cluster.
1. Click **Next: Payment**.
1. On the **Summary** page, verify your new cluster configuration.
1. Click **Update**.

{% comment %}
## Add or remove regions from a cluster

You can add or remove up to nine regions at a time through the Console. Note that you cannot have a two-region cluster, and it will take about 30 minutes to add or remove each region. See [Planning your cluster]({% link cockroachcloud/plan-your-cluster.md %}) for cluster requirements and recommendations before proceeding. -->

## Add a region to your cluster

You can add up to nine regions at a time through the Console. See [Planning your cluster]({% link cockroachcloud/plan-your-cluster.md %}) for cluster requirements and recommendations before proceeding.

{{site.data.alerts.callout_info}}
The ability to remove a region from a cluster through the Console is temporarily disabled. If you need to remove a region, [contact support](https://support.cockroachlabs.com).
{{site.data.alerts.end}}

1. Navigate to the cluster's **Overview** page.
1. Select **Actions > Edit cluster**.

    The **Edit cluster** page displays.

1. Click **Add a region**.

    If you have a GCP cluster with [VPC peering]({% link cockroachcloud/network-authorization.md %}) enabled, the IP range will be automatically populated for added regions.

1. From the **Choose a region** dropdown, select the region you want to use.
1. From the **Nodes** dropdown, select the number of nodes in the new region.
1. In the **Summary** sidebar, verify the hourly estimated cost for the cluster.
1. Click **Continue to payment**.
1. In the **Confirmation** dialog, verify your new cluster configuration.
1. Click **OK**.

### Remove a region from your cluster

When you remove a region from a [multi-region]({% link cockroachcloud/plan-your-cluster.md %}#multi-region-clusters) cluster, the node in that region with the highest ordinal will be [decommissioned](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/node-shutdown?filters=decommission#decommission-the-node) first. Any ranges on that node will be [up-replicated](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/ui-replication-dashboard#snapshot-data-received) to other nodes, and once decommission is complete that node will be shut down. This process is then repeated for every other node in the region. To remove a region from your cluster:

1. Navigate to the cluster's **Overview** page.
1. Select **Actions > Edit cluster**.

    The **Edit cluster** page displays.

1. Click the **X** button next to each region you want to remove.
1. In the **Summary** sidebar, verify the hourly estimated cost for the cluster.
1. Click **Continue to payment**.
1. In the **Confirmation** dialog, verify your new cluster configuration.
1. Click **OK**.
{% endcomment %}

## Set a maintenance window

From your cluster's [**Overview** page]({% link cockroachcloud/cluster-overview-page.md %}), you can view and manage the maintenance and [patch upgrade]({% link cockroachcloud/upgrade-policy.md %}#patch-version-upgrades) window for your cluster. During the window, your cluster may experience restarts, degraded performance, and downtime for single-node clusters. To help keep your clusters updated while minimizing disruptions, set a window of time when your cluster is experiencing the lowest traffic. If no upgrade window is set, your cluster will be automatically upgraded as soon as new patch versions are available. Refer to [Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}).

{{site.data.alerts.callout_info}}
Maintenance operations that are critical for cluster security or stability may be applied outside of the upgrade window, and upgrades that begin in a maintenance window may not always be completed by the end of the window.
{{site.data.alerts.end}}

To set an upgrade window:

1. Click the pencil icon next to **Cluster maintenance** to edit the upgrade window.
1. From the **Day** dropdown, select the day of the week during which maintenance may be applied.
1. From the **Start of window** dropdown, select a start time for your maintenance window in UTC.

    The window will last for 6 hours from the start time.

1. (Optional) If you want to delay automatic patch upgrades for 60 days, switch **Delay patch upgrades** to **On**.

    Enable this setting for production clusters to ensure that development and testing clusters are upgraded before production clusters. This setting applies only to patch versions and not to other kinds of upgrades.

## Restore data from a backup

Cockroach Labs runs full backups daily and incremental backups hourly for every CockroachDB {{ site.data.products.dedicated }} cluster. Full backups are retained for 30 days and incremental backups for 7 days. See the [Use Managed-Service Backups](use-managed-service-backups.html?filters=dedicated#ways-to-restore-data) page for ways to restore data from your cluster's automatic backups in the Console.

Additionally, you can [back up and restore]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}) your CockroachDB {{ site.data.products.dedicated }} cluster manually. For detail on taking backups to your cloud storage, see [Take and Restore Customer-Owned Backups]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}?filters=cloud#back-up-data).

{{site.data.alerts.callout_info}}
All databases are not backed up at the same time. Each database is backed up every hour based on the time of creation. For larger databases, you might see an hourly CPU spike while the database is being backed up.
{{site.data.alerts.end}}

## Configure PCI ready features (Dedicated advanced)

CockroachDB {{ site.data.products.dedicated }} advanced clusters have a **PCI ready** panel to monitor the status of security features required for [PCI readiness]({% link cockroachcloud/pci-dss.md %}). Feature statuses will update from **INACTIVE** to **ACTIVE** once you configure them. Learn more about configuring these features:

- [CockroachDB {{ site.data.products.cloud }} Organization Audit logs]({% link cockroachcloud/cloud-org-audit-logs.md %})
- [Customer-Managed Encryption Keys (CMEK)]({% link cockroachcloud/managing-cmek.md %})
- [Egress Perimeter Controls]({% link cockroachcloud/egress-perimeter-controls.md %})
- Single Sign-On (SSO) for your [CockroachDB {{ site.data.products.cloud }} organization]({% link cockroachcloud/configure-cloud-org-sso.md %}) and your [clusters]({% link cockroachcloud/cloud-sso-sql.md %})
- [Network security]({% link cockroachcloud/network-authorization.md %})

You can also check the status of these features on the [**PCI ready**]({% link cockroachcloud/cluster-overview-page.md %}?filters=dedicated#pci-ready-dedicated-advanced) page of the CockroachDB {{ site.data.products.cloud }} Console.


## Delete cluster

{{site.data.alerts.callout_danger}}
Deleting a cluster will delete all cluster data.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
You will only be billed for a CockroachDB {{ site.data.products.dedicated }} cluster while it is running. You can delete a cluster at any time to stop charges from accumulating.
{{site.data.alerts.end}}

Proceed with the following steps only if you are sure you want to delete a cluster:

1. Navigate to the **Overview** page for the cluster you want to delete.
1. Click the **Actions** button in the top right corner.
1. Select **Delete cluster**.
1. In the confirmation window, enter the name of the cluster.
1. Click **Delete**.
