## Database Details Page

To view this page, click on a database name on the [Databases List Page](#databases-list-page). The Database Details Page has two tabs: [**Tables**](#tables-list-tab) and [**Grants**](#database-grants-tab).

### Tables List Tab

Click on the **Tables** tab of the [Database Details Page](#database-details-page) to view a list of the tables in the selected database.

You can [refresh the data](#refresh-data) that is displayed on this page. **Note:** This also refreshes data on the [Databases List Page](#databases-list-page).

The following information is displayed for each table:

 Column                        | Description
-------------------------------|-------------
Name                           | The name of the table. Click a table name to view the [Table Details Page](#table-details-page) for the selected table.
Replication Size               | The approximate compressed total disk size across all [replicas]({% link {{ version_prefix }}/architecture/glossary.md %}#replica) of the table.
Ranges                         | The number of [ranges]({% link {{ version_prefix }}/architecture/glossary.md %}#range) in the table.
Columns                        | The number of columns in the table.
Indexes                        | The number of [indexes]({% link {{ version_prefix }}/indexes.md %}) in the table.
Regions/Nodes                  | Regions/Nodes on which the table's data is stored.{% if page.cloud == true %}<br><br>**Note:** Not available on Standard or Basic clusters.{% endif %}
% of Live Data                 | The percentage of total uncompressed logical data that has not been modified (updated or deleted).
Table auto stats enabled       | Whether automatic [table statistics]({% link {{ version_prefix }}/cost-based-optimizer.md %}#table-statistics) is enabled. Automatic statistics can help improve query performance.
Stats last updated             | The last time table statistics used by the SQL optimizer were updated.

#### Search and filter tables

By default, the Tables List Tab displays up to 10 tables of the selected database on page 1. If more than 10 tables exist, use the page navigation at the bottom of the page to display the additional tables.

To search for specific tables, use the search field above the list table:

1. Enter a string in the search box.
1. Press `Enter`.

    The list of tables is filtered by the string.

To filter databases based on the nodes on which the database tables are located, use the nodes multi-select dropdown above the list table:

1. Click the dropdown arrow.
1. Select one or more nodes. You may need to scroll down for nodes in different regions. You may also type in the beginning of the node name to narrow the list.

    The list of tables is filtered by the nodes selected.

{% if page.cloud == true  -%}
{{site.data.alerts.callout_info}}
Nodes multi-select dropdown is not available on Standard or Basic clusters.
{{site.data.alerts.end}}
{%- endif %}

### Database Grants Tab

Click on the **Grants** tab [Database Details Page](#database-details-page) to show the [privileges]({% link {{ version_prefix }}/security-reference/authorization.md %}#managing-privileges) granted to users and roles on the database.

The following information is displayed for each grantee:

 Column    | Description
-----------|-------------
Grantee    | The role or user.
Privileges | The list of privileges for the role or user on the database.

For more details about grants and privileges, refer to [`GRANT`]({% link {{ version_prefix }}/grant.md %}).