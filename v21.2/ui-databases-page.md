---
title: Databases Page
summary: The Databases page provides details about databases configured, the tables in each database, and the grants assigned to each user.
toc: true
docs_area: reference.db_console
---

{% include {{ page.version.version }}/ui/admin-access.md %}

The **Databases** page of the DB Console provides details of the following:

- The databases configured.
- The tables in each database.
- The grants assigned to each user.

To view this page, [access the DB Console](ui-overview.html#db-console-access) and click **Databases** in the left-hand navigation.

## Databases list

The **Databases** list shows the databases on the cluster.

The following information is displayed for each database:

| Parameter     | Description                                                                                                             |
|---------------|-------------------------------------------------------------------------------------------------------------------------|
| Database Name | The name of the database.                                                                                               |
| Size          | Approximate disk size across all table replicas in the database.                                                        |
| Tables        | The number of tables in this database.                                                                                  |
| Range count   | The number of ranges across all tables in this database.                                                                |
| Regions/nodes | The regions and nodes on which the tables in this database are located. This is not displayed on a single-node cluster. |

Click any database name to open the [Tables page](#tables-view).

## Tables view

The **Tables** view shows details of the system table as well as the tables in your databases. On the Tables page, make sure that **View: Tables** is selected in the pulldown menu.

The following information is displayed for each table:

| Parameter        | Description                                                                                              |
|------------------|----------------------------------------------------------------------------------------------------------|
| Table Name       | The name of the table.                                                                                   |
| Replication Size | The approximate disk size of all replicas of this table on the cluster.                                  |
| Ranges           | The number of ranges in the table.                                                                       |
| Columns          | The number of columns in the table.                                                                      |
| Indexes          | The number of indexes in the table.                                                                      |
| Regions          | The regions and nodes on which the table data is stored. This is not displayed on a single-node cluster. |

Click any table name to view [table details](#table-details).

### Table details

Click any table name in [**Tables**](#tables-view) view to display details for that table.

- **Overview** displays the SQL statements used to [create and define the table](create-table.html), as well as [partitioning](partitioning.html) info, [zone configurations](configure-replication-zones.html), constraints, and lease preferences. In addition, the following metrics are displayed:
	- **Size** displays the approximate disk size of all replicas of this table on the cluster.
	- **Ranges** displays the number of [ranges](architecture/overview.html#architecture-range) in this table.
	- **Replicas** displays the number of [replicas](architecture/replication-layer.html) of this table on the cluster.
	- **Regions/nodes** displays the regions and nodes on which the table data is stored. This is not displayed on a single-node cluster.
	- **Database** displays the database on which the table is found.
	- **Indexes** displays the names of the indexes in the table.
- **Grants** displays the [grants](#grants-view) associated with the table.

## Grants view

The **Grants** view shows the [privileges](security-reference/authorization.html#managing-privileges) granted to users for each database. On the [Tables page](#tables-view), make sure that **View: Grants** is selected in the pulldown menu.

The following information is displayed for each table:

| Parameter  | Description                       |
|------------|-----------------------------------|
| Table Name | The name of the table.            |
| Users      | The number of users of the table. |
| Roles      | The list of roles on the table.   |
| Grants     | The list of grants of the table.  |

For more details about grants and privileges, see [`GRANT`](grant.html).

## See also

- [Statements page](ui-statements-page.html)
- [Assign privileges](security-reference/authorization.html#managing-privileges)
- [`GRANT`](grant.html)
- [Raw status endpoints](monitoring-and-alerting.html#raw-status-endpoints)
