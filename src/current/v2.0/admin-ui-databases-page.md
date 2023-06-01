---
title: Database Page
toc: true
---

The **Databases** page of the Admin UI provides details of the databases configured, the tables in each database, and the grants assigned to each user. To view these details, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui) and then click **Databases** on the left-hand navigation bar.


## Tables View

The **Tables** view shows details of the system table as well as the tables in your databases. To view these details, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui) and then select **Databases** from the left-hand navigation bar.

<img src="{{ 'images/v2.0/admin_ui_database_tables_view.png' | relative_url }}" alt="CockroachDB Admin UI Database Tables View" style="border:1px solid #eee;max-width:100%" />

The following details are displayed for each table:

Metric | Description
--------|----
Table Name | The name of the table.
Size | Approximate total disk size of the table across all replicas.
Ranges | The number of ranges in the table.
\# of Columns | The number of columns in the table.
\# of Indices | The number of indices for the table.

## Grants View

The **Grants** view shows the [privileges](privileges.html) granted to users for each database. To view these details, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui) and then select **Databases** from the left-hand navigation bar, select **Databases** from the left-hand navigation bar, and then select **Grants** from the **View** menu.

For more details about grants and privileges, see [Grants](grant.html).

<img src="{{ 'images/v2.0/admin_ui_database_grants_view.png' | relative_url }}" alt="CockroachDB Admin UI Database Grants View" style="border:1px solid #eee;max-width:100%" />
