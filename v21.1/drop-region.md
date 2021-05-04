---
title: DROP REGION
summary: The DROP REGION statement drops a region from a multi-region database.
toc: true
---

<span class="version-tag">New in v21.1:</span> The `ALTER DATABASE .. DROP REGION` [statement](sql-statements.html) drops a [region](multiregion-overview.html#database-regions) from a [multi-region database](multiregion-overview.html) with database regions.

{{site.data.alerts.callout_info}}
`DROP REGION` is a subcommand of [`ALTER DATABASE`](alter-database.html).
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
You can only drop the primary region from a multi-region database if it's the last remaining region.  After that, the database will no longer be a multi-region database.
{{site.data.alerts.end}}

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/generated/diagrams/alter_database_drop_region.html %}
</div>

## Parameters

| Parameter       | Description                                                                                                                                                       |
|-----------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `database_name` | The database from which you are dropping a [region](multiregion-overview.html#database-regions).                                                                      |
| `region_name`   | The [region](multiregion-overview.html#database-regions) being dropped from this database.  Allowed values include any region present in `SHOW REGIONS FROM DATABASE database_name`. You can only drop the primary region from a multi-region database if it's the last remaining region. |

## Required privileges

The user must be a member of the [`admin`](authorization.html#roles) or [owner](authorization.html#object-ownership) roles, or have the [`CREATE` privilege](authorization.html#supported-privileges) on the database.

## Examples

### Set the primary region

To add the first region, or to set an already-added region as the primary region, use the following statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER DATABASE foo PRIMARY REGION "us-east1";
~~~

~~~
ALTER DATABASE PRIMARY REGION
~~~

### Add a region to a database

To add another region to a database that already has at least one region, use a statement like the following:

{% include copy-clipboard.html %}
~~~ sql
ALTER database foo ADD REGION "us-west1";
~~~

~~~
ALTER DATABASE ADD REGION
~~~

For more information, see [Database regions](multiregion-overview.html#database-regions).

{{site.data.alerts.callout_info}}
Only regions that are defined at [node startup time](cockroach-start.html#locality) can be added to a multi-region database. For more information, see [Cluster regions](multiregion-overview.html#cluster-regions).
{{site.data.alerts.end}}

### View a database's regions

To view the regions associated with a multi-region database, use a [`SHOW REGIONS`](show-regions.html) statement:

{% include copy-clipboard.html %}
~~~ sql
SHOW REGIONS FROM DATABASE foo;
~~~

~~~
  database |  region  | primary |          zones
-----------+----------+---------+--------------------------
  foo      | us-east1 |  true   | {us-east1-a,us-east1-b}
  foo      | us-west1 |  false  | {us-west1-a,us-west1-b}
(2 rows)
~~~

For more information, see [Database regions](multiregion-overview.html#database-regions).

### Drop a region from a database

To drop a region from a multi-region database, use the following statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER DATABASE foo DROP REGION "us-west1";
~~~

~~~
ALTER DATABASE DROP REGION
~~~

{% include copy-clipboard.html %}
~~~ sql
SHOW REGIONS FROM DATABASE foo;
~~~

~~~
  database |  region  | primary |          zones
-----------+----------+---------+--------------------------
  foo      | us-east1 |  true   | {us-east1-a,us-east1-b}
(1 row)
~~~


## See also

- [Multi-region overview](multiregion-overview.html)
- [`ADD REGION`](add-region.html)
- [`SHOW REGIONS`](show-regions.html)
- [`ALTER TABLE`](alter-table.html)
- [Other SQL Statements](sql-statements.html)
