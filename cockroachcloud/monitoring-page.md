---
title: Monitoring Page
summary: The Monitoring page is currently under development. In the future, time series charts will display here.
toc: true
redirect_from:
- ../stable/cockroachcloud-monitoring-page.html
---

The **Monitoring** page is currently under development. In the future, time series charts will display here. In the meantime, you can use the cluster's built-in DB Console to see them.

You can use the cluster's built-in DB Console to view time series data on SQL queries, troubleshoot query performance, view a list of jobs, and more.

## Access the DB Console

To access the DB Console:

1. On the cluster's **Monitoring** page, click **Open DB Console**.

    You can also access the DB Console by navigating to `https://<cluster-name>crdb.io:8080/#/metrics/overview/cluster`. Replace the `<cluster-name>` placeholder with the name of your cluster.

2. Log in with your [SQL username](user-authorization.html) and password.

{{site.data.alerts.callout_info}}
For details on creating additional users that can connect to the cluster and access the DB Console, see [User Management](user-authorization.html).
{{site.data.alerts.end}}

## Explore the DB Console

- For an overview of all the areas of the DB Console, see [DB Console Overview](../stable/ui-overview.html).
- Be sure to check out the [**Node Map**](../stable/ui-overview.html), which visualizes the geographic configuration of your cluster on a world map and provides real-time cluster metrics, with the ability to drill down to individual nodes. This Enterprise feature has been pre-configured and enabled for you.

{{site.data.alerts.callout_info}}
If you have a single-node cluster, you may see a warning that you have under-replicated ranges. This is expected because the default replication factor for a single-node cluster is set to 3. You can learn more about replication issues [here](cluster-setup-troubleshooting.html#db-console-shows-under-replicated-unavailable-ranges).
{{site.data.alerts.end}}