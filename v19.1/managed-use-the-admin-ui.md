---
title: Use the Admin UI for Your Managed Cluster
summary:
toc: true
build_for: [managed]
redirect_from: /v2.2/managed-use-the-admin-ui.html
---

Cockroach Labs actively monitors and manages the health of your cluster, but the Admin UI gives you the ability to observe your cluster's health and performance as well.

## Access the Admin UI

To access the admin UI:

1. Go to the URL provided in the [confirmation email](managed-sign-up-for-a-cluster.html#confirmation-email) you received from Cockroach Labs. This URL is a combination of the global hostname and port `8080`.

2. Log in with your username and password. If you're using the default user, the credentials were provided in the confirmation email.

{{site.data.alerts.callout_info}}
For details on creating additional users that can connect to the cluster and access the Admin UI, see [User Management](managed-user-management.html).
{{site.data.alerts.end}}

## Explore the Admin UI

- For an overview of all the areas of the Admin UI, see [Admin UI Overview](admin-ui-overview.html).
- Be sure to check out the [**Node Map**](admin-ui-overview.html), which visualizes the geographic configuration of your cluster on a world map and provides real-time cluster metrics, with the ability to drill down to individual nodes. This Enterprise feature has been pre-configured and enabled for you.
