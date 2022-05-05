---
title: Manage a CockroachDB Dedicated Cluster
summary: Manage your cluster's schema, data, and more.
toc: true
filter_category: cluster_mgmt
filter_html: CockroachDB Dedicated
filter_sort: 2
docs_area: manage
---

{% include filter-tabs.md %}

This page describes the cluster management and cluster deletion workflows for {{ site.data.products.dedicated }}.

## Planning your cluster

Before making any changes to your cluster's nodes or regions, review the [requirements and recommendations](plan-your-cluster.html) for {{ site.data.products.db }} cluster configuration.

## View Clusters page

On [logging in to the {{ site.data.products.db }} Console](https://cockroachlabs.cloud/), the **Clusters** page is displayed. The **Clusters** page provides a high-level view of your clusters.

For each cluster, the following details display:

- The cluster's **Name**
- The cluster's **Plan Type**, either Serverless or Dedicated
- The date and time the cluster was **Created**
- The cluster's current **State**
- The cluster's **Cloud** provider, either GCP or AWS
- The **Version** of CockroachDB the cluster is running
- The **Action** button, which is used to:
    - [**Add or remove nodes**](?filters=dedicated#add-or-remove-nodes-from-a-cluster)
    - [**Increase storage**](?filters=dedicated#increase-storage-for-a-cluster)
    - [**Change compute**](?filters=dedicated#change-compute-for-a-cluster)
    - [**Upgrade major version**](upgrade-to-v21.2.html)
    {% comment %}
    - [**Add/remove regions**](?filters=dedicated#add-or-remove-regions-from-a-cluster)
    {% endcomment %}
    - [**Delete cluster**](#delete-cluster)

To view and manage a specific cluster, click the name of the cluster. The [**Overview**](#view-cluster-overview) page will display.

## View cluster overview

The **Overview** page displays details about the selected {{ site.data.products.db }} cluster:

- The **Current Charges** and next billing date for the cluster
- The cluster's **Cloud** provider
- The cluster's **Hardware per node**
- A list of the selected cluster's nodes.

    For each node, the page displays the node's `Name` and `Status`, nested under its region.

From the **Overview** page, you can connect to your cluster. For more information, see [Connect to Your {{ site.data.products.dedicated }} Cluster](connect-to-your-cluster.html).

## Scale your cluster

### Add or remove nodes from a cluster

You can add or remove nodes from your cluster through the Console. See [Planning your cluster](plan-your-cluster.html) for cluster requirements and recommendations before proceeding.

{{site.data.alerts.callout_info}}
You cannot scale a multi-node cluster down to a single-node cluster. If you need to scale down to a single-node cluster, [backup](run-bulk-operations.html?filters=cloud#backup-and-restore-data) your cluster and [restore](run-bulk-operations.html?filters=cloud#restore-a-cluster) it into a new single-node cluster.
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
### Add or remove regions from a cluster

You can add or remove up to three regions at a time through the Console. See the [Planning your cluster](plan-your-cluster.html) section of this page for cluster requirements and recommendations before proceeding.

### Add a region to your cluster

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

1. Navigate to the cluster's **Overview** page.
1. Select **Actions > Edit cluster**.

    The **Edit cluster** page displays.

1. Click the **X** button next to each region you want to remove.
1. In the **Summary** sidebar, verify the hourly estimated cost for the cluster.
1. Click **Continue to payment**.
1. In the **Confirmation** dialog, verify your new cluster configuration.
1. Click **OK**.
{% endcomment %}

## Restore data from a backup

Cockroach Labs runs full backups daily and incremental backups hourly for every {{ site.data.products.dedicated }} cluster. The full backups are retained for 30 days and incremental backups for 7 days.

{{site.data.alerts.callout_info}}
All databases are not backed up at the same time. Each database is backed up every hour based on the time of creation. For larger databases, you might see an hourly CPU spike while the database is being backed up.
{{site.data.alerts.end}}

To restore your data, [contact us](https://support.cockroachlabs.com).

Additionally, you can [backup and restore](../{{site.versions["stable"]}}/take-full-and-incremental-backups.html) data on your own.

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
