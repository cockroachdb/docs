## Databases

The **Databases** page shows:

- Whether [automatic statistics collection]({{ link_prefix }}cost-based-optimizer.html#table-statistics) is enabled for the cluster.
- A list of the databases on the cluster.

The following information is displayed for each database:

| Column        | Description                                                                                                             |
|---------------|-------------------------------------------------------------------------------------------------------------------------|
| Databases     | The name of the database.                                                                                               |
{% if page.cloud != true  -%}
| Size          | Approximate disk size across all table replicas in the database.                                                        |
{% endif -%}
| Tables        | The number of tables in the database.                                                                                   |
{% if page.cloud != true  -%}
| Range Count   | The number of ranges across all tables in the  database.                                                                |
| Regions/Nodes | The regions and nodes on which the tables in the database are located. This is not displayed on a single-node cluster.  |
| Index Recommendations | The number of index recommendations for the database.                                                           |
{%- else -%}
| Regions | The regions where the tables in the database are located.  |
{% endif -%}

Click a **database name** to open the **Tables** page.

-  Select **View: Tables** in the pulldown menu to display the [Tables view](#tables-view).
-  Select **View: Grants** in the pulldown menu to display the [Grants view](#grants-view).

## Search and filter

By default, the Databases page shows all databases running on the cluster. By default, the [**Tables** view](#tables-view) and the [**Grants** view](#grants-view) show all tables in a selected database.

### Search databases or tables

To search using the search field:

1. Enter a string in the search box at the top of the tab. To search for exact terms in order, wrap the search string in quotes.
1. Press `Enter`.

    The list of databases or tables is filtered by the string.

### Filter

To filter the databases on the **Databases** page or tables on the [**Tables** view](#tables-view) or the [**Grants** view](#grants-view):

1. Click the **Filters** field.
      - To filter by one or more nodes on which the data reside for the database or table, select **Node** and select one or more nodes.
1. Click **Apply**.

## Tables view

The **Tables** view shows the tables in your database.

The following information is displayed for each table:

| Column                         | Description                                                                                              |
|--------------------------------|----------------------------------------------------------------------------------------------------------|
| Tables                         | The name of the table.                                                                                   |
{% if page.cloud != true -%}
| Replication Size               | The approximate disk size of all replicas of this table on the cluster.                                  |
| Ranges                         | The number of ranges in the table.                                                                       |
{%- endif -%}
| Columns                        | The number of columns in the table.                                                                      |
| Indexes                        | The number of indexes in the table.                                                                      |
{% if page.cloud != true -%}
| Regions                        | The regions and nodes on which the table data is stored. This is not displayed on a single-node cluster. |
{% else -%}
| Regions                        | The regions where the table data is stored.
{% endif -%}
| % of Live Data                 | Percent of total uncompressed logical data that has not been modified (updated or deleted).              |
| Table Stats Last Updated (UTC) | The last time table statistics were created or updated.   |

Click a **table name** to view table details.

### Table details

The table details page contains details of a table. It contains an **Overview** tab and a **Grants** tab displays the users and [grants]({{ link_prefix }}grant.html) associated with the table.

#### Overview tab

The **Overview** tab displays the SQL statements used to [create the table]({{ link_prefix }}create-table.html), table details, and index statistics.

The table details include:

{% if page.cloud != true %}
- **Size**: The approximate disk size of all replicas of this table on the cluster.
- **Replicas**: The number of [replicas]({{ link_prefix }}architecture/replication-layer.html) of this table on the cluster.
- **Ranges**: The number of [ranges]({{ link_prefix }}architecture/glossary.html#architecture-range) in this table.
- **% of Live Data**: Percentage of total uncompressed logical data that has not been modified (updated or deleted).
- **Table Stats Last Updated**: The last time table statistics were created or updated.
{% endif %}
- **Auto Stats Collection**: Whether [automatic statistics collection]({{ link_prefix }}cost-based-optimizer.html#table-statistics) is enabled.
{% if page.cloud != true %}
- **Regions/Nodes**: The regions and nodes on which the table data is stored. This is not displayed on a single-node cluster.
{% else %}
- **Regions**: The regions where the table data is stored.
{% endif %}
- **Database**: The database in which the table is found.
- **Indexes**: The names of the indexes defined on the table.
