---
title: Monitoring Page
summary: The Monitoring page is currently under development. In the future, time series charts will display here.
toc: true
build_for: [managed]
---

The **Monitoring** page is currently under development. In the future, time series charts will display here. In the meantime, you can use the cluster's built-in Admin UI to see them.

You can use the cluster's built-in Admin UI to view time series data on SQL queries, troubleshoot query performance, view a list of jobs, and more.

## Access the Admin UI

To access the Admin UI:

1. On the cluster's **Monitoring** page, click **Open Admin UI**.

    You can also access the Admin UI by navigating to `https://<cluster-name>crdb.io:8080/#/metrics/overview/cluster`. Replace the `<cluster-name>` placeholder with the name of your cluster.

2. Log in with your [SQL username](managed-authorization.html#use-the-console) and password.

{{site.data.alerts.callout_info}}
For details on creating additional users that can connect to the cluster and access the Admin UI, see [User Management](managed-authorization.html#use-the-console).
{{site.data.alerts.end}}

## Explore the Admin UI

- For an overview of all the areas of the Admin UI, see [Admin UI Overview](admin-ui-overview.html).
- Be sure to check out the [**Node Map**](admin-ui-overview.html), which visualizes the geographic configuration of your cluster on a world map and provides real-time cluster metrics, with the ability to drill down to individual nodes. This Enterprise feature has been pre-configured and enabled for you.
