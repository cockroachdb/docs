## Table Indexes

To view this page, click on a table name on the [**Database Tables**](#database-tables) page and then click on the **Indexes** tab.

The **Table Indexes** page lists indexes on a table with possible index recommendations and actions.

The following information is displayed for each index:

 Column          | Description
-----------------|-------------
Index Name       | The name of the index. Click an index name to view the [**Index**](#index) page for the selected index.
Last Read        | The time the index was created, last read, or index statistics were reset.
Total Reads      | The number of times the index was read since index statistics were reset.
Recommendations  | A recommendation to drop the index if it is unused.
Action           | If recommended, a **Drop index** button is displayed. [Admin users]({% link {{ version_prefix }}/security-reference/authorization.md %}#admin-role) can click this to drop an unused index.

### Reset index statistics

Index statistics accumulate from the time an index was created or when statistics were reset. If desired, [admin users]({% link {{ version_prefix }}/security-reference/authorization.md %}#admin-role) may reset index statistics for the entire cluster by clicking **Reset all index stats**. This link does not appear for non-admin users. **Last reset** is the timestamp at which the last reset started.