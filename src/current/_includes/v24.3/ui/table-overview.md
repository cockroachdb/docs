## Table Overview

To view this page, click on a table name on the [**Database Tables**](#database-tables) page.

The **Table Overview** page displays the SQL statement used to [create the table]({% link {{ version_prefix }}/create-table.md %}) and table details.

The following information is displayed for the table:

 Detail                        | Description
-------------------------------|-------------
Size                           | The approximate compressed total disk size across all replicas of the table.
Ranges                         | The number of [ranges]({% link {{ version_prefix }}/architecture/replication-layer.md %}) in the table.
Replicas                       | The number of [replicas]({% link {{ version_prefix }}/architecture/glossary.md %}#architecture-range) in the table.
Regions/Nodes                  | Regions/Nodes on which the table's data is stored.{% if page.cloud == true %}<br><br>NOTE: Not available on Standard or Basic clusters.{% endif %}
% of Live Data                 | The percentage of total uncompressed logical data that has not been modified (updated or deleted).
Auto stats collections         | Automatic statistics can help improve query performance. Learn how to [manage statistics collection]({% link {{ version_prefix }}/cost-based-optimizer.md %}#control-automatic-statistics).
Stats last updated             | The last time table statistics used by the SQL optimizer were updated.

### Last updated

{% include_cached new-in.html version="v24.3" %} TODO