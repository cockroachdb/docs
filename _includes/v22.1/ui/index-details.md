#### Index details

The **Index Stats** table displays index statistics for a table.

Index statistics accumulate from the time an index was created or when statistics were reset. If desired, [admin users]({{ link_prefix }}security-reference/authorization.html#admin-role) may reset index statistics for the cluster by clicking **Reset all index stats**. This link does not appear for non-admin users.

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
{% if page.cloud != true -%}
| Tables     | The name of the table.            |
{% endif -%}
| Users      | The number of users of the table. |
{% if page.cloud != true -%}
| Roles      | The list of roles on the table.   |
{% endif -%}
| Grants     | The list of grants of the table.  |

For more details about grants and privileges, see [`GRANT`]({{ link_prefix }}grant.html).

## See also

- [Statements page]({{ link_prefix }}ui-statements-page.html)
- [Assign privileges]({{ link_prefix }}security-reference/authorization.html#managing-privileges)
- [`GRANT`]({{ link_prefix }}grant.html)
- [Raw status endpoints]({{ link_prefix }}monitoring-and-alerting.html#raw-status-endpoints)
