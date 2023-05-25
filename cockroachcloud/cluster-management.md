---
title: Manage a CockroachDB Dedicated Cluster
summary: Manage your cluster's schema, data, and more.
toc: true
docs_area: manage
---

{% include cockroachcloud/filter-tabs/cluster-management.md %}

This page describes the cluster management and cluster deletion workflows for {{ site.data.products.dedicated }}.

## Planning your cluster

Before making any changes to your cluster's nodes or regions, review the [requirements and recommendations](plan-your-cluster.html) for {{ site.data.products.db }} cluster configuration.

## View Clusters page

On [logging in to the {{ site.data.products.db }} Console](https://cockroachlabs.cloud/), the **Clusters** page is displayed. The **Clusters** page provides a high-level view of your clusters.

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
    - [**Upgrade major version**](upgrade-to-{{site.current_cloud_version}}.html)
{% comment %} - [**Add/remove regions**](?filters=dedicated#add-or-remove-regions-from-a-cluster) {% endcomment %}
    - [**Delete cluster**](#delete-cluster)

To view and manage a specific cluster, click the name of the cluster. The [**Overview**](#view-cluster-overview) page will display.

## View cluster overview

The [**Overview** page](cluster-overview-page.html?filter=dedicated) displays details about the selected {{ site.data.products.db }} cluster:

- The **Current Charges** and next billing date for the cluster
- The cluster's **Cloud** provider
- The cluster's **Hardware per node**
- A list of the selected cluster's nodes.

    For each node, the page displays the node's `Name` and `Status`, nested under its region.

- The status of security features required for [PCI readiness](#configure-pci-ready-features-dedicated-advanced).

From the **Overview** page, you can connect to your cluster. For more information, see [Connect to Your {{ site.data.products.dedicated }} Cluster](connect-to-your-cluster.html).

## Scale your cluster

{{site.data.alerts.callout_info}}
During [limited access](/docs/{{site.versions["stable"]}}/cockroachdb-feature-availability.html), {{ site.data.products.dedicated }} clusters on Azure cannot be scaled. Refer to [{{ site.data.products.dedicated }} on Azure](cockroachdb-dedicated-on-azure.html).
{{site.data.alerts.end}}

### Add or remove nodes from a cluster

You can add or remove nodes from your cluster through the Console. See [Planning your cluster](plan-your-cluster.html) for cluster requirements and recommendations before proceeding.

{{site.data.alerts.callout_info}}
You cannot scale a multi-node cluster down to a single-node cluster. If you need to scale down to a single-node cluster, [backup](take-and-restore-customer-owned-backups.html?filters=cloud#back-up-a-cluster) your cluster and [restore](take-and-restore-customer-owned-backups.html?filters=cloud#restore-a-cluster) it into a new single-node cluster.
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
    Storage space cannot be removed from a node once added.
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

You can add or remove up to nine regions at a time through the Console. Note that you cannot have a two-region cluster, and it will take about 30 minutes to add or remove each region. See [Planning your cluster](plan-your-cluster.html) for cluster requirements and recommendations before proceeding. -->

## Add a region to your cluster

You can add up to nine regions at a time through the Console. See [Planning your cluster](plan-your-cluster.html) for cluster requirements and recommendations before proceeding.

{{site.data.alerts.callout_info}}
The ability to remove a region from a cluster through the Console is temporarily disabled. If you need to remove a region, [contact support](https://support.cockroachlabs.com).
{{site.data.alerts.end}}

1. Navigate to the cluster's **Overview** page.
1. Select **Actions > Edit cluster**.

    The **Edit cluster** page displays.

1. Click **Add a region**.

    If you have a GCP cluster with [VPC peering](network-authorization.html) enabled, the IP range will be automatically populated for added regions.

1. From the **Choose a region** dropdown, select the region you want to use.
1. From the **Nodes** dropdown, select the number of nodes in the new region.
1. In the **Summary** sidebar, verify the hourly estimated cost for the cluster.
1. Click **Continue to payment**.
1. In the **Confirmation** dialog, verify your new cluster configuration.
1. Click **OK**.

### Remove a region from your cluster

When you remove a region from a [multi-region](plan-your-cluster.html#multi-region-clusters) cluster, the node in that region with the highest ordinal will be [decommissioned](../{{site.versions["stable"]}}/node-shutdown.html?filters=decommission#decommission-the-node) first. Any ranges on that node will be [up-replicated](../{{site.versions["stable"]}}/ui-replication-dashboard.html#snapshot-data-received) to other nodes, and once decommission is complete that node will be shut down. This process is then repeated for every other node in the region. To remove a region from your cluster:

1. Navigate to the cluster's **Overview** page.
1. Select **Actions > Edit cluster**.

    The **Edit cluster** page displays.

1. Click the **X** button next to each region you want to remove.
1. In the **Summary** sidebar, verify the hourly estimated cost for the cluster.
1. Click **Continue to payment**.
1. In the **Confirmation** dialog, verify your new cluster configuration.
1. Click **OK**.
{% endcomment %}

## Create a database

You can use the [**Databases** page](databases-page.html) to create a new database from the {{ site.data.products.db }} Console.

1. Navigate to the **Databases** page from the **Overview** page of your cluster.
1. Click **Add database**.
1. Enter a name for the new database.
1. Click **Create**.

## Restore data from a backup

{{site.data.alerts.callout_info}}
During [limited access](/docs/{{site.versions["stable"]}}/cockroachdb-feature-availability.html), managed backups are not available for {{ site.data.products.dedicated }} clusters on Azure. Customers can [take and restore from their own backups on Azure storage](take-and-restore-customer-owned-backups.html), including encrypted backups. Refer to [{{ site.data.products.dedicated }} on Azure](cockroachdb-dedicated-on-azure.html).
{{site.data.alerts.end}}

Cockroach Labs runs full backups daily and incremental backups hourly for every {{ site.data.products.dedicated }} cluster. Full backups are retained for 30 days and incremental backups for 7 days. See the [Use Managed-Service Backups](use-managed-service-backups.html?filters=dedicated#ways-to-restore-data) page for ways to restore data from your cluster's automatic backups in the Console.

Additionally, you can [back up and restore](take-and-restore-customer-owned-backups.html) your {{ site.data.products.dedicated }} cluster manually. For detail on taking backups to your cloud storage, see [Take and Restore Customer-Owned Backups](take-and-restore-customer-owned-backups.html?filters=cloud#back-up-data).

{{site.data.alerts.callout_info}}
All databases are not backed up at the same time. Each database is backed up every hour based on the time of creation. For larger databases, you might see an hourly CPU spike while the database is being backed up.
{{site.data.alerts.end}}

## Configure PCI ready features (Dedicated advanced)

{{ site.data.products.dedicated }} advanced clusters have a **PCI ready** panel to monitor the status of security features required for [PCI readiness](pci-dss.html). Feature statuses will update from **INACTIVE** to **ACTIVE** once you configure them. Learn more about configuring these features:

- [Audit logs](cloud-org-audit-logs.html)
- [Customer-Managed Encryption Keys (CMEK)](managing-cmek.html)
- [Egress Perimeter Controls](egress-perimeter-controls.html)
- Single Sign-On (SSO) for your [{{ site.data.products.db }} organization](configure-cloud-org-sso.html) and your [clusters](cloud-sso-sql.html)
- [Network security](network-authorization.html)

You can also check the status of these features on the [**PCI ready**](cluster-overview-page.html?filters=dedicated#pci-ready-dedicated-advanced) page of the {{ site.data.products.db }} Console.


## Delete cluster

{{site.data.alerts.callout_danger}}
Deleting a cluster will delete all cluster data.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
You will only be billed for a {{ site.data.products.dedicated }} cluster while it is running. You can delete a cluster at any time to stop charges from accumulating.
{{site.data.alerts.end}}

Proceed with the following steps only if you are sure you want to delete a cluster:

1. Navigate to the **Overview** page for the cluster you want to delete.
1. Click the **Actions** button in the top right corner.
1. Select **Delete cluster**.
1. In the confirmation window, enter the name of the cluster.
1. Click **Delete**.
