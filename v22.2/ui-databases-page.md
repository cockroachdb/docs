---
title: Databases Page
summary: The Databases page provides details about databases configured, the tables in each database, and the grants assigned to each user.
toc: true
docs_area: reference.db_console
---

{% include {{ page.version.version }}/ui/admin-access.md %}

The **Databases** page of the DB Console provides details of the following:

- The databases configured.
- The tables in each database and the indexes on each table.
- The grants assigned to each role and user.
- [Index recommendations](#index-recommendations).

To view this page, [access the DB Console](ui-overview.html#db-console-access) and click **Databases** in the left-hand navigation.

## Index recommendations

{% include_cached new-in.html version="v22.2" %} The database, table details, and index details pages show recommendations to drop indexes based on index usage. You can traverse the database and table views to determine which indexes have recommendations.

You configure the threshold for determining when to drop an index due to low usage in the `sql.index_recommendation.drop_unused_duration` [cluster setting](cluster-settings.html). The default value is 7 days.
For other settings, see [Schema insight settings](ui-insights-page.html#schema-insight-settings).

## Databases

The **Databases** page shows:

- Whether [automatic statistics collection](cost-based-optimizer.html#table-statistics) is enabled for the cluster.
- A list of the databases on the cluster.

The following information is displayed for each database:

| Column                | Description                                                                                                             |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------|
| Databases             | The name of the database.                                                                                               |
| Size                  | Approximate disk size across all table replicas in the database.                                                        |
| Tables                | The number of tables in the database.                                                                                   |
| Range Count           | The number of ranges across all tables in the database.                                                                 |
| Regions/Nodes         | The regions and nodes on which the tables in the database are located. This is not displayed on a single-node cluster.  |
| Index Recommendations | The number of index recommendations for the database.                                                                   |

Click a **database name** to open the **Tables** page.

-  Select **View: Tables** in the pulldown menu to display the [Tables view](#tables-view).
-  Select **View: Grants** in the pulldown menu to display the [Grants view](#grants-view).

## Tables view

The **Tables** view shows the tables in your database.

The following information is displayed for each table:

| Column                         | Description                                                                                                      |
|--------------------------------|------------------------------------------------------------------------------------------------------------------|
| Tables                         | The name of the table.                                                                                           |
| Replication Size               | The approximate disk size of all replicas of this table on the cluster.                                          |
| Ranges                         | The number of ranges in the table.                                                                               |
| Columns                        | The number of columns in the table.                                                                              |
| Indexes                        | The number of indexes in the table. If there is an index recommendation, a caution icon will display.            |
| Regions                        | The regions and nodes on which the table data is stored. This is not displayed on a single-node cluster.         |
| Table Stats Last Updated (UTC) | The last time table statistics were created or updated.                                                          |

Click a **table name** to view table details.

### Table details

The table details page contains details of a table. It contains an **Overview** tab and a **Grants** tab displays the users and [grants](grant.html) associated with the table.

#### Overview tab

The **Overview** tab displays the SQL statements used to [create the table](create-table.html), table details, and index statistics.

The table details include:

- **Size**: the approximate disk size of all replicas of this table on the cluster.
- **Replicas**: the number of [replicas](architecture/replication-layer.html) of this table on the cluster.
- **Ranges**: the number of [ranges](architecture/glossary.html#architecture-range) in this table.
- **Table Stats Last Updated**: the last time table statistics were created or updated.
- **Auto Stats Collection**: whether [automatic statistics collection](cost-based-optimizer.html#table-statistics) is enabled.
- **Regions/Nodes**: the regions and nodes on which the table data is stored. This is not displayed on a single-node cluster.
- **Database**: the database in which the table is found.
- **Indexes**: the names of the indexes defined on the table.

#### Index details

The **Index Stats** table displays index statistics for a table.

Index statistics accumulate from the time an index was created or when statistics were reset. To reset index statistics for the cluster, click **Reset all index stats**.

The following information is displayed for each index:

| Column                | Description                                                                |
|-----------------------|----------------------------------------------------------------------------|
| Indexes               | The name of the index.                                                     |
| Total Reads           | The number of times the index was read since index statistics were reset.  |
| Last Used (UTC)       | The time the index was created, last read, or index statistics were reset. |
| Index Recommendations | A recommendation to drop the index if it is unused.                        |

Click an **index name** to view index details. The index details page displays the query used to create the index, the number of times the index was read since index statistics were reset, the time the index was last read, and the reason for the index recommendation.

## Grants view

The **Grants** view shows the [privileges](security-reference/authorization.html#managing-privileges) granted to users and roles for each database.

The following information is displayed for each table:

| Column     | Description                       |
|------------|-----------------------------------|
| Tables     | The name of the table.            |
| Users      | The number of users of the table. |
| Roles      | The list of roles on the table.   |
| Grants     | The list of grants of the table.  |

For more details about grants and privileges, see [`GRANT`](grant.html).


## See also

- [Statements page](ui-statements-page.html)
- [Assign privileges](security-reference/authorization.html#managing-privileges)
- [`GRANT`](grant.html)
- [Raw status endpoints](monitoring-and-alerting.html#raw-status-endpoints)
