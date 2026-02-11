## Databases List Page

To view this page, click **Databases** in the left side navigation menu.

The Databases List Page shows:

- Whether [automatic statistics collection]({% link {{ version_prefix }}/cost-based-optimizer.md %}#table-statistics) is enabled for the cluster. The **Auto stats collection** indicator is on the top right.
- A list of the databases on the cluster.

The following information is displayed for each database:

 Column       | Description
--------------|-------------
Name          | The name of the database. Click a database name to view the [Database Details Page](#database-details-page) for the selected database.
Size          | The approximate total disk size across all table replicas in the database.
Tables        | The total number of tables in the database.
Regions/Nodes | Regions/Nodes on which the database tables are located. Hover on a region for a list of nodes in that region.{% if page.cloud == true %}<br><br>**Note:** Not available on Standard or Basic clusters.{% endif %}

### Search and filter databases

By default, the Databases List Page displays up to 10 databases on page 1. If more than 10 databases exist, use the page navigation at the bottom of the page to display the additional databases.

To search for specific databases, use the search field above the list table:

1. Enter a string in the search box.
1. Press `Enter`.

    The list of databases is filtered by the string.

To filter databases based on the nodes on which the database tables are located, use the nodes multi-select dropdown above the list table:

1. Click the dropdown arrow.
1. Select one or more nodes. You may need to scroll down for nodes in different regions. You may also type in the beginning of the node name to narrow the list.

    The list of databases is filtered by the nodes selected.

{% if page.cloud == true  -%}
{{site.data.alerts.callout_info}}
Nodes multi-select dropdown is not available on Standard or Basic clusters.
{{site.data.alerts.end}}
{%- endif %}

### Refresh data

The `system.table_metadata` table caches the necessary metadata of a table that populates the following:

- [Databases List Page](#databases-list-page)
- [Tables List Tab](#tables-list-tab) of the [Database Details Page](#database-details-page)
- [Overview Tab](#overview-tab) of the [Table Details Page](#table-details-page)

The [cluster settings]({% link {{ version_prefix }}/cluster-settings.md %}) that control the refresh behavior for the cached data in the `system.table_metadata` table are:

- `obs.tablemetadata.automatic_updates.enabled` (default: `false`) enables automatic updates of the table metadata cache `system.table_metadata`.
- `obs.tablemetadata.data_valid_duration` (default: `20m0s`) is the duration for which the data in `system.table_metadata` is considered valid.

On the [Databases List Page](#databases-list-page) and the [Tables List Tab](#tables-list-tab) of the [Database Details Page](#database-details-page), above the table of information, the **Last refreshed** indicator displays how long ago the cached data was last refreshed automatically (per the cluster settings) or manually.

The cached data can be refreshed in the following ways:

- Automatically: Set the cluster setting `obs.tablemetadata.automatic_updates.enabled` to `true`. The frequency of refreshes is controlled by the cluster setting `obs.tablemetadata.data_valid_duration`. Automatic updates is disabled by default to avoid unnecessarily consuming resources. However, if you want databases and tables information immediately when you visit the corresponding page, then enable automatic updates.
- Manually: When any user clicks the **Refresh data** icon button to the right of the **Last refreshed** indicator. If a refresh job has been triggered, the **Refresh data** icon button will be disabled and the hover text will display the time the job was started and the progress of the job.
- Additionally, when any user visits the [Databases List Page](#databases-list-page), the **Last refreshed** timestamp is compared to the cluster setting `obs.tablemetadata.data_valid_duration`. If the time since the **Last refreshed** timestamp exceeds the `obs.tablemetadata.data_valid_duration`, then a cache refresh is triggered.
