## Database Tables

To view this page, click on a database name on the [**Databases**](#databases) page.

The **Database Tables** page lists the tables in a selected database.

The following information is displayed for each table:

 Column                        | Description
-------------------------------|-------------
Name                           | The name of the table. Click a table name to view the [**Table Overview**](#table-overview) page for the selected table.
Replication Size               | The approximate compressed total disk size across all replicas of the table.
Ranges                         | The number of ranges in the table.
Columns                        | The number of columns in the table.
Indexes                        | The number of indexes in the table.
Regions/Nodes                  | Regions/Nodes on which the table's data is stored.{% if page.cloud == true %}<br><br>NOTE: Not available on Standard or Basic clusters.{% endif %}
% of Live Data                 | The percentage of total uncompressed logical data that has not been modified (updated or deleted).
Table auto stats enabled       | Automatic statistics can help improve query performance. Learn how to [manage statistics collection]({% link {{ version_prefix }}/cost-based-optimizer.md %}#control-automatic-statistics).
Stats last updated             | The last time table statistics used by the SQL optimizer were updated.

### Search and filter tables

By default, the **Database Tables** page shows all tables in a selected database.

To search for specific databases, use the search field at the top right:

1. Enter a string in the search box.
1. Press `Enter`.

    The list of tables is filtered by the string.

{% include_cached new-in.html version="v24.3" %} To filter databases based on the nodes on which the database tables are located, use the nodes multi-select dropdown at the top right:

1. Click the dropdown arrow.
1. Select one or more nodes. You may need to scroll down for nodes in different regions. You may also type in the beginning of the node name to narrow the list.

    The list of tables is filtered by the nodes selected.

{% if page.cloud == true  -%}
NOTE: Nodes multi-select dropdown is not available on Standard or Basic clusters. 
{% endif %}
