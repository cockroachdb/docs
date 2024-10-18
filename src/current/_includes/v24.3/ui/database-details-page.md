## Database Details Page

To view this page, click on a database name on the [Databases List Page](#databases-list-page) page. The Database Details Page has two tabs: [**Tables**](#tables-list-tab) and [**Grants**](#database-grants-tab).

You can also [refresh data](#refresh-data) that is displayed on this page and the [Databases List Page](#databases-list-page).

### Tables List Tab

Click on the **Tables** tab of the [Database Details Page](#database-details-page) to view a list of the tables in the selected database.

The following information is displayed for each table:

 Column                        | Description
-------------------------------|-------------
Name                           | The name of the table. Click a table name to view the [Table Details Page](#table-details-page) page for the selected table.
Replication Size               | The approximate compressed total disk size across all replicas of the table.
Ranges                         | The number of ranges in the table.
Columns                        | The number of columns in the table.
Indexes                        | The number of indexes in the table.
Regions/Nodes                  | Regions/Nodes on which the table's data is stored.{% if page.cloud == true %}<br><br>NOTE: Not available on Standard or Basic clusters.{% endif %}
% of Live Data                 | The percentage of total uncompressed logical data that has not been modified (updated or deleted).
Table auto stats enabled       | Whether automatic [table statistics]({% link {{ version_prefix }}/cost-based-optimizer.md %}#table-statistics) is enabled. Automatic statistics can help improve query performance.
Stats last updated             | The last time table statistics used by the SQL optimizer were updated.

#### Search and filter tables

By default, Tables List Tab shows all tables in a selected database.

To search for specific databases, use the search field above the table:

1. Enter a string in the search box.
1. Press `Enter`.

    The list of tables is filtered by the string.

{% include_cached new-in.html version="v24.3" %} To filter databases based on the nodes on which the database tables are located, use the nodes multi-select dropdown above the table:

1. Click the dropdown arrow.
1. Select one or more nodes. You may need to scroll down for nodes in different regions. You may also type in the beginning of the node name to narrow the list.

    The list of tables is filtered by the nodes selected.

{% if page.cloud == true  -%}
NOTE: Nodes multi-select dropdown is not available on Standard or Basic clusters. 
{% endif %}

### Database Grants Tab

{% include_cached new-in.html version="v24.3" %} Click on the **Grants** tab [Database Details Page](#database-details-page) to show the [privileges]({% link {{ version_prefix }}/security-reference/authorization.md %}#managing-privileges) granted to users and roles on the database.

The following information is displayed for each grantee:

 Column    | Description
-----------|-------------
Grantee    | The role or user.
Privileges | The list of privileges for the role or user on the database.

For more details about grants and privileges, refer to [`GRANT`]({% link {{ version_prefix }}/grant.md %}).