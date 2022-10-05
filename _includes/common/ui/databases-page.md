{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.versions["stable"]}}/{% endcapture %}
  {% assign page_prefix = "" %}
{% else %}
  {% assign link_prefix = "" %}
  {% assign page_prefix = "ui-" %}
{% endif %}

## Tables view

The **Tables** view shows the tables in your database.

The following information is displayed for each table:

| Column                         | Description                                                                                              |
|--------------------------------|----------------------------------------------------------------------------------------------------------|
| Tables                         | The name of the table.                                                                                   |
{% if page.cloud != true -%}
| Replication Size               | The approximate disk size of all replicas of this table on the cluster.                                  |
| Ranges                         | The number of ranges in the table.                                                                       |
{% endif -%}
| Columns                        | The number of columns in the table.                                                                      |
| Indexes                        | The number of indexes in the table.                                                                      |
{% if page.cloud != true -%}
| Regions                        | The regions and nodes on which the table data is stored. This is not displayed on a single-node cluster. |
{% endif -%}
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
- **Table Stats Last Updated**: The last time table statistics were created or updated.
{% endif %}
- **Auto Stats Collection**: Whether [automatic statistics collection]({{ link_prefix }}cost-based-optimizer.html#table-statistics) is enabled.
{% if page.cloud != true %}
- **Regions/Nodes**: The regions and nodes on which the table data is stored. This is not displayed on a single-node cluster.
{% endif %}
- **Database**: The database in which the table is found.
- **Indexes**: The names of the indexes defined on the table.
