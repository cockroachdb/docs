## Databases

The **Databases** page shows:

- Whether [automatic statistics collection]({% link {{ version_prefix }}/cost-based-optimizer.md %}#table-statistics) is enabled for the cluster. The **Auto stats collection** indicator is on the top right.
- A list of the databases on the cluster.

The following information is displayed for each database:

 Column       | Description
--------------|-------------
Name          | The name of the database. Click a database name to view the [**Database Tables**](#database-tables) page for the selected database.
Size          | The approximate total disk size across all table replicas in the database.
Tables        | The total number of tables in the database.
Regions/Nodes | Regions/Nodes on which the database tables are located. Hover on a region for a list of nodes in that region.{% if page.cloud == true %}<br><br>NOTE: Not available on Standard or Basic clusters.{% endif %}

### Search and filter databases

By default, the **Databases** page shows all databases on the cluster.

To search for specific databases, use the search field at the top right:

1. Enter a string in the search box.
1. Press `Enter`.

    The list of databases is filtered by the string.

{% include_cached new-in.html version="v24.3" %} To filter databases based on the nodes on which the database tables are located, use the nodes multi-select dropdown at the top right:

1. Click the dropdown arrow.
1. Select one or more nodes. You may need to scroll down for nodes in different regions. You may also type in the beginning of the node name to narrow the list.

    The list of databases is filtered by the nodes selected.

{% if page.cloud == true  -%}
NOTE: Nodes multi-select dropdown is not available on Standard or Basic clusters. 
{% endif %}

### Refresh data

{% include_cached new-in.html version="v24.3" %} TODO
