## Table Details Page

To view this page, click on a table name on the [Tables List Tab](#tables-list-tab) of the [Database Details Page](#database-details-page).

###  Overview Tab

Click on the **Overview** tab of the [Table Details Page](#table-details-page) to view the SQL statement used to [create the table]({% link {{ version_prefix }}/create-table.md %}) and other table details.

The following information is displayed for the table:

 Detail                        | Description
-------------------------------|-------------
Size                           | The approximate compressed total disk size across all replicas of the table.
Ranges                         | The number of [ranges]({% link {{ version_prefix }}/architecture/replication-layer.md %}) in the table.
Replicas                       | The number of [replicas]({% link {{ version_prefix }}/architecture/glossary.md %}#architecture-range) in the table.
Regions/Nodes                  | Regions/Nodes on which the table's data is stored.{% if page.cloud == true %}<br><br>NOTE: Not available on Standard or Basic clusters.{% endif %}
% of Live Data                 | The percentage of total uncompressed logical data that has not been modified (updated or deleted).
Auto stats collections         | Whether automatic [table statistics]({% link {{ version_prefix }}/cost-based-optimizer.md %}#table-statistics) is enabled. Automatic statistics can help improve query performance.
Stats last updated             | The last time table statistics used by the SQL optimizer were updated.

#### Last updated

The **Last updated** timestamp is the actual time the [metadata was last refreshed](#refresh-data) for the selected table.

When the refresh job runs to update the `system.table_metadata` table, if it encounters an error retrieving the metadata for the selected table, an error indicator will appear next to the **Last updated** timestamp and the error message will appear in the hover text.

### Table Grants Tab

Click on the **Grants** tab of the [Table Details Page](#table-details-page) to view the [privileges]({% link {{ version_prefix }}/security-reference/authorization.md %}#managing-privileges) granted to users and roles on the table.

The following information is displayed for each grantee:

 Column    | Description
-----------|-------------
Grantee    | The role or user.
Privileges | The list of privileges for the role or user on the table.

For more details about grants and privileges, refer to [`GRANT`]({% link {{ version_prefix }}/grant.md %}).

### Indexes List Tab

Click on the **Indexes** tab of the [Table Details Page](#table-details-page) to view a list of indexes on a table with index recommendations and actions.

The following information is displayed for each index:

 Column          | Description
-----------------|-------------
Index Name       | The name of the index. Click an index name to view the [Index Details Page](#index-details-page) for the selected index.
Last Read        | The time the index was created, last read, or index statistics were reset.
Total Reads      | The number of times the index was read since index statistics were reset.
Recommendations  | A [recommendation](#index-recommendations) to drop the index if it is unused.
Action           | If recommended, a **Drop index** button is displayed. [Admin users]({% link {{ version_prefix }}/security-reference/authorization.md %}#admin-role) can click this to drop an unused index.

#### Reset all index statistics

Index statistics accumulate from the time an index was created or when statistics were reset. If desired, [admin users]({% link {{ version_prefix }}/security-reference/authorization.md %}#admin-role) may reset index statistics for the entire cluster by clicking **Reset all index stats**. This link does not appear for non-admin users. **Last reset** is the timestamp at which the last reset started.