---
title: Cluster Management
summary: Manage your cluster's schema, data, and more.
toc: true
redirect_from:
- ../v20.2/cockroachcloud-cluster-management.html
---

This page describes the cluster management and cluster deletion workflows.

## View Clusters page

On [logging in to the Console](https://cockroachlabs.cloud/), the **Clusters** page is displayed. The **Clusters** page provides a high-level view of your clusters.

For each cluster, the following details display:

- The cluster's **Name**
- The cluster's **Plan Type**, either Free or Paid
- The date and time the cluster was **Created**
- The cluster's current **State**
- The **Version** of CockroachDB the cluster is running
- The **Action** button, which is used to:
    - [**Add/remove nodes**](#add-or-remove-nodes-from-a-cluster) (Paid clusters only)
    - [**Delete cluster**](#delete-cluster)

To view and manage a specific cluster, click the name of the cluster. The [**Overview**](#view-cluster-overview) page will display.

Select the type of cluster you are viewing (and page content below will change accordingly):
<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="free">CockroachCloud Free (beta)</button>
  <button class="filter-button page-level" data-scope="dedicated">CockroachCloud</button>
</div>

## View cluster overview

<section class="filter-content" markdown="1" data-scope="free">
The **Overview** page displays details about the selected CockroachCloud Free (beta) cluster:

- The **Plan** that the cluster was created with
- The cluster's **Cloud** provider
- The amount of **Storage** the cluster is using

    There is an upper limit of 5GB storage per CockroachCloud Free (beta) cluster.

- The cluster's **Throughput**

    Throughput is measured in queries per second.
</section>

<section class="filter-content" markdown="1" data-scope="dedicated">
The **Overview** page displays a list of the selected cluster's nodes.

For each node, the page displays the node's `Name`, nested under its region.

From the **Overview** page, you can connect to your cluster. For more information, see [Connect to Your CockroachCloud Cluster](connect-to-your-cluster.html).

## Add or remove nodes from a cluster

You can add or remove nodes from your cluster through the Console.

{{site.data.alerts.callout_info}}
At this time, you cannot use the Console to scale up a single-node cluster or scale down to a single-node cluster. For these changes, contact [Support](https://support.cockroachlabs.com).
{{site.data.alerts.end}}

### Considerations

- Adding or removing nodes incurs a non-trivial amount of load on the cluster. Changing the cluster configuration during times of heavy traffic can result in degraded application performance or longer times for node modifications. We recommend you add or remove nodes from a cluster when the cluster isn't experiencing heavy traffic.
- If you have changed the [replication factor](../{{site.versions["stable"]}}/configure-zone.html) for a cluster, you might not be able to remove nodes from the cluster. For example, suppose you have a 5-node cluster and you had previously changed the replication factor from its default value of 3 to 5. Now if you want to scale down the cluster to 3 nodes, the decommissioning nodes operation to remove nodes from the cluster might fail. To successfully remove nodes from the cluster, you will have to change the replication factor back to 3.
- Before removing nodes from a cluster, ensure that the reduced disk space will be sufficient for the existing and anticipated data.

To add or remove nodes from your cluster:

1. Navigate to the cluster's **Overview** page
1. Click the **Actions** button in the top right corner.
1. Select **Add/remove nodes**.

    The **Edit <cluster name>** page displays.

1. From the **Nodes** dropdown, select the number of nodes you want in your cluster.
1. Click **Next**.
1. On the **Summary** page, verify the hourly estimated cost for the cluster.
1. Click **Add/remove nodes**.

## Restore data from a backup

Cockroach Labs runs full backups daily and incremental backups hourly for every CockroachCloud cluster. The full backups are retained for 30 days and incremental backups for 7 days.

{{site.data.alerts.callout_info}}
All databases are not backed up at the same time. Each database is backed up every hour based on the time of creation. For larger databases, you might see an hourly CPU spike while the database is being backed up.
{{site.data.alerts.end}}

To restore your data, [contact us](https://support.cockroachlabs.com).

Additionally, you can [backup and restore](../{{site.versions["stable"]}}/backup-and-restore.html) data on your own.
</section>

## Delete cluster

{{site.data.alerts.callout_danger}}
Deleting a cluster will delete all cluster data.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
CockroachCloud Free (beta) clusters are subject to deletion after 6 months of no activity.
{{site.data.alerts.end}}

Proceed with the following steps only if you are sure you want to delete a cluster:

1. Navigate to the **Overview** page for the cluster you want to delete.
1. Click the **Actions** button in the top right corner.
1. Select **Delete cluster**.
1. In the confirmation window, enter the name of the cluster.
1. Click **Delete**.
