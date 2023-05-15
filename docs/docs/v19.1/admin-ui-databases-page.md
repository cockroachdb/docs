---
title: Database Page
toc: true
---

{{site.data.alerts.callout_info}}
On a secure cluster, this area of the Admin UI can only be accessed by an `admin` user. See [Admin UI access](admin-ui-overview.html#admin-ui-access).
{{site.data.alerts.end}}

The **Databases** page of the Admin UI provides details of the databases configured, the tables in each database, and the grants assigned to each user. To view these details, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui) and then click **Databases** on the left-hand navigation bar.


## Tables view

The **Tables** view shows details of the system table as well as the tables in your databases. To view these details, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui) and then select **Databases** from the left-hand navigation bar.

<img src="{{ 'images/v19.1/admin_ui_database_tables_view.png' | relative_url }}" alt="CockroachDB Admin UI Database Tables View" style="border:1px solid #eee;max-width:100%" />

The following details are displayed for each table:

Metric | Description
--------|----
Table Name | The name of the table.
Size | Approximate total disk size of the table across all replicas.
Ranges | The number of ranges in the table.
\# of Columns | The number of columns in the table.
\# of Indices | The number of indices for the table.

## Grants view

The **Grants** view shows the [privileges](authorization.html#assign-privileges) granted to users for each database. To view these details, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui) and then select **Databases** from the left-hand navigation bar, select **Databases** from the left-hand navigation bar, and then select **Grants** from the **View** menu.

For more details about grants and privileges, see [Grants](grant.html).

<img src="{{ 'images/v19.1/admin_ui_database_grants_view.png' | relative_url }}" alt="CockroachDB Admin UI Database Grants View" style="border:1px solid #eee;max-width:100%" />

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
