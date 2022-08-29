---
title: Databases Page
summary: The Databases page of the CockroachDB Cloud Console provides details about databases configured, the tables in each database, and the grants assigned to each user.
toc: true
docs_area: manage
---

The **Databases** page of the {{ site.data.products.db }} Console allows you to create new databases and provides details of the following:

- The databases configured.
- The tables in each database and the indexes on each table.
- The grants assigned to each user.

To view this page, navigate to your [**Cluster Overview** page](cluster-overview-page.html) and click **Databases** in the left-hand navigation.

## Databases

The **Databases** page shows:

- Whether [automatic statistics collection](../{{site.versions["stable"]}}/cost-based-optimizer.html#table-statistics) is enabled for the cluster.
- A list of the databases on the cluster.
- The **Add database** button, which allows you to create a new database.

The following information is displayed for each database:

| Column        | Description                           |
|---------------|---------------------------------------|
| Databases     | The name of the database.             |                           
| Tables        | The number of tables in the database. |

Click a **database name** to open the **Tables** page.

-  Select **View: Tables** in the pulldown menu to display the [Tables view](#tables-view).
-  Select **View: Grants** in the pulldown menu to display the [Grants view](#grants-view).

## Tables view

The **Tables** view shows the tables in your database.

The following information is displayed for each table:

| Column         | Description                          |
|----------------|--------------------------------------|
| Tables         | The name of the table.               |                                      
| Columns        | The number of columns in the table.  |
| Indexes        | The number of indexes in the table.  |

Click a **table name** to view table details.

### Table details

The table details page contains details of a table. It contains an **Overview** tab and a **Grants** tab displays the users and [grants](../{{site.versions["stable"]}}/grant.html) associated with the table.

#### Overview tab

The **Overview** tab displays the SQL statements used to [create the table](../{{site.versions["stable"]}}/create-table.html), table details, and index statistics.

The table details include:

- **Database**: the database in which the table is found.
- **Indexes**: the names of the indexes defined on the table.
- **Auto Stats Collection**: whether [automatic statistics collection](../{{site.versions["stable"]}}/cost-based-optimizer.html#table-statistics) is enabled.

#### Index details

The **Index Stats** table displays index statistics for a table.

The following information is displayed for each index:

| Column           | Description                                                                |
|------------------|----------------------------------------------------------------------------|
| Indexes          | The name of the index.                                                     |
| Total Reads      | The number of times the index was read since index statistics were reset.  |
| Last Used (UTC)  | The time the index was created, last read, or index statistics were reset. |

## Grants view

The **Grants** view shows the [privileges](../{{site.versions["stable"]}}/security-reference/authorization.html#managing-privileges) granted to users and roles for each database.

The following information is displayed for each table:

| Column     | Description                       |
|------------|-----------------------------------|
| User       | The name of the SQL user.         |
| Grants     | The list of grants for the user.  |

For more details about grants and privileges, see [`GRANT`](../{{site.versions["stable"]}}/grant.html).
