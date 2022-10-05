---
title: SURVIVE {ZONE, REGION} FAILURE
summary: The SURVIVE {ZONE,REGION} FAILURE statement configures a multi-region database.
toc: true
docs_area: reference.sql
---

 The `ALTER DATABASE ... SURVIVE {ZONE,REGION} FAILURE` [statement](sql-statements.html) sets the [survival goal](multiregion-overview.html#survival-goals) for a [multi-region database](multiregion-overview.html).

{{site.data.alerts.callout_info}}
`SURVIVE {ZONE,REGION} FAILURE` is a subcommand of [`ALTER DATABASE`](alter-database.html).
{{site.data.alerts.end}}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_database_survival_goal.html %}
</div>

## Parameters

| Parameter       | Description                                                                                                                                                                       |
|-----------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `database_name` | The database whose [survival goal](multiregion-overview.html#survival-goals) you are configuring.                                                                                 |

## Required privileges

The user must be a member of the [`admin`](security-reference/authorization.html#roles) or [owner](security-reference/authorization.html#object-ownership) roles, or have the [`CREATE` privilege](security-reference/authorization.html#supported-privileges) on the database.

## Examples

### Survive zone failures

To change the survival goal of a multi-region database to survive zone failures, use the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE {db} SURVIVE ZONE FAILURE;
~~~

~~~
ALTER DATABASE SURVIVE
~~~

{{site.data.alerts.callout_info}}
Surviving zone failures is the default setting for multi-region databases.
{{site.data.alerts.end}}

For more information about the zone survival goal, see [Surviving zone failures](multiregion-overview.html#surviving-zone-failures).

### Survive region failures

To change the survival goal of a multi-region database to survive region failures, use the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE {db} SURVIVE REGION FAILURE;
~~~

~~~
ALTER DATABASE SURVIVE
~~~

If you try to change a database with less than 3 [database regions](multiregion-overview.html#database-regions) to survive region failures, the following error will be signalled:

~~~
ERROR: at least 3 regions are required for surviving a region failure
SQLSTATE: 42602
HINT: you must add additional regions to the database using ALTER DATABASE mr ADD REGION <region_name>
~~~

For more information about the region survival goal, see [Surviving region failures](multiregion-overview.html#surviving-region-failures).

## See also

- [Multi-Region Capabilities Overview](multiregion-overview.html)
- [`ALTER TABLE`](alter-table.html)
- [SQL Statements](sql-statements.html)
