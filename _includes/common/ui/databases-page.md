{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.versions["stable"]}}/{% endcapture %}
  {% assign page_prefix = "" %}
{% else %}
  {% assign link_prefix = "" %}
  {% assign page_prefix = "ui-" %}
{% endif %}

{% if page.cloud != true %}
if not cloud
{% endif %}


## Databases

The **Databases** page shows:

- Whether [automatic statistics collection]({{ link_prefix }}cost-based-optimizer.html#table-statistics) is enabled for the cluster.
- A list of the databases on the cluster.
{% if page.cloud == true %}
- The **Add database** button, which allows you to [create a new database](serverless-cluster-management.html#create-a-database).if not cloud
{% endif %}

The following information is displayed for each database:

| Column        | Description                                                                                                             |
|---------------|-------------------------------------------------------------------------------------------------------------------------|
| Databases     | The name of the database.                                                                                               |
{% if page.cloud != true %}
| Size          | Approximate disk size across all table replicas in the database.                                                        |
{% endif %}
| Tables        | The number of tables in the database.                                                                                   |
{% if page.cloud != true %}
| Range count   | The number of ranges across all tables in the  database.                                                                |
| Regions/nodes | The regions and nodes on which the tables in the database are located. This is not displayed on a single-node cluster.  |
{% endif %}

Click a **database name** to open the **Tables** page.

-  Select **View: Tables** in the pulldown menu to display the [Tables view](#tables-view).
-  Select **View: Grants** in the pulldown menu to display the [Grants view](#grants-view).

## Tables view

The **Tables** view shows the tables in your database.

The following information is displayed for each table:

| Column                         | Description                                                                                              |
|--------------------------------|----------------------------------------------------------------------------------------------------------|
| Tables                         | The name of the table.                                                                                   |
{% if page.cloud != true %}
| Replication Size               | The approximate disk size of all replicas of this table on the cluster.                                  |
| Ranges                         | The number of ranges in the table.                                                                       |
{% endif %}
| Columns                        | The number of columns in the table.                                                                      |
| Indexes                        | The number of indexes in the table.                                                                      |
{% if page.cloud != true %}
| Regions                        | The regions and nodes on which the table data is stored. This is not displayed on a single-node cluster. |
{% endif %}
| Table Stats Last Updated (UTC) | The last time table statistics were created or updated.   |

Click a **table name** to view table details.

### Table details

The table details page contains details of a table. It contains an **Overview** tab and a **Grants** tab displays the users and [grants]({{ link_prefix }}grant.html) associated with the table.

#### Overview tab

The **Overview** tab displays the SQL statements used to [create the table]({{ link_prefix }}create-table.html), table details, and index statistics.

The table details include:

{% if page.cloud != true %}
- **Size**: the approximate disk size of all replicas of this table on the cluster.
- **Replicas**: the number of [replicas]({{ link_prefix }}architecture/replication-layer.html) of this table on the cluster.
- **Ranges**: the number of [ranges]({{ link_prefix }}architecture/glossary.html#architecture-range) in this table.
- **Table Stats Last Updated**: the last time table statistics were created or updated.
{% endif %}
- **Auto Stats Collection**: whether [automatic statistics collection]({{ link_prefix }}cost-based-optimizer.html#table-statistics) is enabled.
{% if page.cloud != true %}
- **Regions/nodes**: the regions and nodes on which the table data is stored. This is not displayed on a single-node cluster.
{% endif %}
- **Database**: the database in which the table is found.
- **Indexes**: the names of the indexes defined on the table.

#### Index details

The **Index Stats** table displays index statistics for a table.

Index statistics accumulate from the time an index was created or when statistics were reset. To reset index statistics for the cluster, click **Reset all index stats**.

The following information is displayed for each index:

| Column           | Description                                                                |
|------------------|----------------------------------------------------------------------------|
| Indexes          | The name of the index.                                                     |
| Total Reads      | The number of times the index was read since index statistics were reset.  |
| Last Used (UTC)  | The time the index was created, last read, or index statistics were reset. |

{% if page.cloud != true %}
Click an **index name** to view index details. The index details page displays the query used to create the index, the number of times the index was read since index statistics were reset, and the time the index was last read.
{% endif %}

## Grants view

The **Grants** view shows the [privileges]({{ link_prefix }}security-reference/authorization.html#managing-privileges) granted to users and roles for each database.

The following information is displayed for each table:

| Column     | Description                       |
|------------|-----------------------------------|
{% if page.cloud != true %}
| Tables     | The name of the table.            |
{% endif %}
| Users      | The number of users of the table. |
{% if page.cloud != true %}
| Roles      | The list of roles on the table.   |
{% endif %}
| Grants     | The list of grants of the table.  |

For more details about grants and privileges, see [`GRANT`]({{ link_prefix }}grant.html).

## See also

- [Statements page](ui-statements-page.html)
- [Assign privileges](security-reference/authorization.html#managing-privileges)
- [`GRANT`](grant.html)
- [Raw status endpoints](monitoring-and-alerting.html#raw-status-endpoints)
