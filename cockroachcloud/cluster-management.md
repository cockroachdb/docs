---
title: Cluster Management
summary: Manage your cluster's schema, data, and more.
toc: true
---

This page describes the cluster management and cluster deletion workflows.

## View Clusters page

On [logging in to the CockroachCloud Console](https://cockroachlabs.cloud/), the **Clusters** page is displayed. The **Clusters** page provides a high-level view of your clusters.

For each cluster, the following details display:

- The cluster's **Name**
- The cluster's **Plan Type**, either Free or Paid
- The date and time the cluster was **Created**
- The cluster's current **State**
- The **Version** of CockroachDB the cluster is running
- The **Action** button, which is used to:
    - [**Add/remove nodes**](?filters=dedicated#add-or-remove-nodes-from-a-cluster) (Paid clusters only)
    {% comment %}
    - [**Add/remove regions**](?filters=dedicated#add-or-remove-regions-from-a-cluster) (Paid clusters only)
    {% endcomment %}
    - [**Delete cluster**](#delete-cluster)

To view and manage a specific cluster, click the name of the cluster. The [**Overview**](#view-cluster-overview) page will display.

Select the type of cluster you are viewing (and page content below will change accordingly):
<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="free">CockroachCloud Free (beta)</button>
  <button class="filter-button page-level" data-scope="dedicated">CockroachCloud</button>
</div>

<section class="filter-content" markdown="1" data-scope="free">

## View cluster overview

The **Overview** page displays details about the selected CockroachCloud Free (beta) cluster:

- The **Plan** that the cluster was created with
- The cluster's **Cloud** provider
- The amount of **Storage** the cluster is using

    There is an upper limit of 5GB storage per CockroachCloud Free (beta) cluster.

- The cluster's **Throughput**

    Throughput is measured in queries per second.
</section>

<section class="filter-content" markdown="1" data-scope="dedicated">

## Planning your cluster

Before making any changes to your cluster's nodes or regions, review our requirements and recommendations for CockroachCloud cluster configuration.

{% include cockroachcloud/planning-your-cluster.md %}

## View cluster overview
    
The **Overview** page displays details about the selected CockroachCloud cluster:

- The **Current Charges** and next billing date for the cluster
- The cluster's **Cloud** provider
- The cluster's **Hardware per node**
- A list of the selected cluster's nodes.

    For each node, the page displays the node's `Name` and `Status`, nested under its region.
    
From the **Overview** page, you can connect to your cluster. For more information, see [Connect to Your CockroachCloud Cluster](connect-to-your-cluster.html).

## Add or remove nodes from a cluster

You can add or remove nodes from your cluster through the Console. See [Planning your cluster](#planning-your-cluster) for cluster requirements and recommendations before proceeding.

{{site.data.alerts.callout_info}}
At this time, you cannot use the Console to scale up a single-node cluster or scale down to a single-node cluster. For these changes, contact [Support](https://support.cockroachlabs.com).
{{site.data.alerts.end}}

To add or remove nodes from your cluster:

1. Navigate to the cluster's **Overview** page.
1. Click the **Actions** button in the top right corner.
1. Select **Add/remove nodes**.
{% comment %} This button will change {% endcomment %}

    The **Edit <cluster name>** page displays.

1. From the **Nodes** dropdown, select the number of nodes you want in your cluster.
1. In the **Summary** sidebar, verify the hourly estimated cost for the cluster.
1. Click **Continue to payment**.
1. In the **Confirmation** dialog, verify your new cluster configuration.
1. Click **OK**.

{% comment %}
## Add or remove regions from a cluster

You can add or remove up to three regions at a time through the Console. See the [Planning your cluster](#planning-your-cluster) section of this page for cluster requirements and recommendations before proceeding.

### Add a region to your cluster

1. Navigate to the cluster's **Overview** page.
1. Click the **Actions** button in the top right corner.
1. Select **Edit regions and nodes**.

    The **Edit <cluster name>** page displays.

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
1. Click the **Actions** button in the top right corner.
1. Select **Edit regions and nodes**.

    The **Edit <cluster name>** page displays.

1. Click the **X** button next to each region you want to remove.
1. In the **Summary** sidebar, verify the hourly estimated cost for the cluster.
1. Click **Continue to payment**.
1. In the **Confirmation** dialog, verify your new cluster configuration.
1. Click **OK**.
{% endcomment %}
## Restore data from a backup

Cockroach Labs runs full backups daily and incremental backups hourly for every CockroachCloud cluster. The full backups are retained for 30 days and incremental backups for 7 days.

{{site.data.alerts.callout_info}}
All databases are not backed up at the same time. Each database is backed up every hour based on the time of creation. For larger databases, you might see an hourly CPU spike while the database is being backed up.
{{site.data.alerts.end}}

To restore your data, [contact us](https://support.cockroachlabs.com).

Additionally, you can [backup and restore](../{{site.versions["stable"]}}/take-full-and-incremental-backups.html) data on your own.
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
