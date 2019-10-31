---
title: Cluster Management
summary: Manage your cluster's schema, data, and users.
toc: true
build_for: [cockroachcloud]
redirect-from: managed-cluster-management.html
---

## Manage cluster configuration

While you manage your [schema](learn-cockroachdb-sql.html), [data](migration-overview.html), and [users](cockroachcloud-authorization.html#use-the-console) yourself, for any of the following cluster management tasks, please reach out to Cockroach Labs at [support.cockroachlabs.com](https://support.cockroachlabs.com) and a member of our team will assist you:

- Adding or removing nodes
- Restoring data from a backup

Also, although you can leverage [geo-partitioning](partitioning.html), advanced [replication controls](configure-replication-zones.html), and [CDC](change-data-capture.html) without intervention from Cockroach Labs, we recommend reaching out for initial guidance and best practices.  

## Delete cluster

{{site.data.alerts.callout_danger}}
Deleting a cluster will delete all cluster data.
{{site.data.alerts.end}}

Proceed with the following steps only if you are sure you want to delete a cluster:

1. Navigate to the cluster overview page for the cluster you want to delete.
2. On the right-hand side, select **Delete cluster** from the **Actions** drop-down.
3. In the confirmation window, enter the name of the cluster and click **Delete**.
