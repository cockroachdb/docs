---
title: Cluster Management
summary: Manage your cluster's schema, data, and backups.
toc: true
---

This page describes the cluster management, backup/restore, and cluster deletion workflows.

## View Clusters page

On [signing in to the Console](cockroachcloud-create-your-account.html#sign-in), the **Clusters** page is displayed. The **Clusters** page provides a high-level view of your clusters.

For each cluster, the following details display:

- The cluster's **Name**
- The **Version** of CockroachDB the cluster is running
- The number of **Nodes** in the cluster
- The date and time the cluster was **Created**

To view and manage a specific cluster, click the name of the cluster. The [**Overview**](#view-cluster-overview) page will display.

## Access tab

On the **Clusters > Access** tab, Console administrators can manage Console access settings for the Organization.

## View cluster overview

The **Cluster Overview** page displays a list of the selected cluster's nodes.

For each node, the page displays the node's `Name`, nested under its region.

From the **Cluster Overview** page, you can connect to your cluster. For more information, see [Connect to Your CockroachCloud Cluster](cockroachcloud-connect-to-your-cluster.html).

## Manage cluster configuration

Although you can leverage [geo-partitioning](partitioning.html), advanced [replication controls](configure-replication-zones.html), and [CDC](change-data-capture.html) without intervention from Cockroach Labs, we recommend [reaching out](https://support.cockroachlabs.com) for initial guidance and best practices.

To add or remove nodes, please contact [Support](https://support.cockroachlabs.com). Our team will work with you to update your cluster configurations. We expect this to be self-service next year.

## Restore data from a backup

Cockroach Labs runs full backups daily and incremental backups hourly for every CockroachCloud cluster. The full backups are retained for 30 days and incremental backups for 7 days.

{{site.data.alerts.callout_info}}
All databases are not backed up at the same time. Each database is backed up every hour based on the time of creation. For larger databases, you might see an hourly CPU spike while the database is being backed up.
{{site.data.alerts.end}}

To restore your data, [contact us](https://support.cockroachlabs.com).

Additionally, you can [backup and restore](backup-and-restore.html) data on your own.

### Backup and restore from a self-hosted CockroachDB cluster

You can [backup](backup.html) your self-hosted CockroachDB databases to an [external location](backup.html#backup-file-urls) and then [restore](restore.html) to your CockroachCloud cluster.

{{site.data.alerts.callout_danger}}
If you are backing up the data to AWS or GCP, use the `specified` option for the `AUTH` parameter.
{{site.data.alerts.end}}

## Delete cluster

{{site.data.alerts.callout_danger}}
Deleting a cluster will delete all cluster data.
{{site.data.alerts.end}}

Proceed with the following steps only if you are sure you want to delete a cluster:

1. Navigate to the **Cluster Overview** page for the cluster you want to delete.
2. On the right-hand side, select **Delete cluster** from the **Actions** drop-down.
3. In the confirmation window, enter the name of the cluster and click **Delete**.
