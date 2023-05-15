---
title: Database Page
toc: true
---

{{site.data.alerts.callout_info}}
On a secure cluster, this area of the Admin UI can only be accessed by an `admin` user. See [Admin UI access](admin-ui-overview.html#admin-ui-access).
{{site.data.alerts.end}}

The **Databases** page of the Admin UI provides details of the following:

- The databases configured.
- The tables in each database.
- The grants assigned to each user. 

To view this page, [access the Admin UI](admin-ui-overview.html#admin-ui-access) and click **Databases** in the left-hand navigation.

## Tables view

The **Tables** view shows details of the system table as well as the tables in your databases.

To view [table details](#table-details), click on a table name.

<img src="{{ 'images/v20.1/admin_ui_database_tables_view.png' | relative_url }}" alt="CockroachDB Admin UI Database Tables View" style="border:1px solid #eee;max-width:100%" />

The following are displayed for each table:

Parameter | Description
--------|----
Table Name | The name of the table.
Size | Approximate disk size of all replicas of this table on the cluster.
Ranges | The number of ranges in the table.
\# of Columns | The number of columns in the table.
\# of Indices | The number of indices for the table.

### Table details

Click any table name in [Tables](#tables-view) view to display details for that table.

<img src="{{ 'images/v20.1/admin_ui_database_tables_details.png' | relative_url }}" alt="CockroachDB Admin UI Database Tables View" style="border:1px solid #eee;max-width:100%" />

- **Overview** displays the SQL statements used to [create and define the table](create-table.html), as well as [partitioning](partitioning.html) info and [zone configurations](configure-replication-zones.html). In addition, the following metrics are displayed:
	- **Size** is the approximate disk size of all replicas of this table on the cluster.
	- **Ranges** is the number of [ranges](architecture/overview.html#terms) in this table.
	- **Replicas** is the number of [replicas](architecture/replication-layer.html) of this table on the cluster.
- **Grants** displays the [grants](#grants-view) associated with the table.

## Grants view

The **Grants** view shows the [privileges](authorization.html#assign-privileges) granted to users for each database.

For more details about grants and privileges, see [`GRANT <privileges>`](grant.html).

<img src="{{ 'images/v20.1/admin_ui_database_grants_view.png' | relative_url }}" alt="CockroachDB Admin UI Database Grants View" style="border:1px solid #eee;max-width:100%" />

## See also

- [Statements page](admin-ui-statements-page.html)
- [Assign privileges](authorization.html#assign-privileges)
- [`GRANT <privileges>`](grant.html)
- [Raw status endpoints](monitoring-and-alerting.html#raw-status-endpoints)