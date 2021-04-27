---
title: ADD REGION
summary: The ADD REGION statement adds a region to a multi-region database.
toc: true
---

<span class="version-tag">New in v21.1:</span> The `ALTER DATABASE .. ADD REGION` [statement](sql-statements.html) adds a [region](multiregion-overview.html#database-regions) to a [multi-region database](multiregion-overview.html).

{{site.data.alerts.callout_info}}
`ADD REGION` is a subcommand of [`ALTER DATABASE`](alter-database.html).
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
In order to add a region with `ADD REGION`, you must first set a primary database region.  For an example showing how to add a primary region, see [Set the primary region](#set-the-primary-region).
{{site.data.alerts.end}}

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/generated/diagrams/alter_database_add_region.html %}
</div>

## Parameters

| Parameter       | Description                                                                                                                                                       |
|-----------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `database_name` | The database to which you are adding a [region](multiregion-overview.html#database-regions).                                                                      |
| `region_name`   | The [region](multiregion-overview.html#database-regions) being added to this database.  Allowed values include any region present in `SHOW REGIONS FROM CLUSTER`. |

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

Given a cluster with multiple regions, any databases in that cluster that have not yet had their primary regions set will have their replicas spread as broadly as possible for resiliency. When a primary region is added to one of these databases:

- All tables will be [`REGIONAL BY TABLE`](set-locality.html#regional-by-table) in the primary region by default.
- This means that all such tables will have all of their voting replicas and leaseholders moved to the primary region. This process is known as [rebalancing](architecture/replication-layer.html#leaseholder-rebalancing).

For more information about cluster regions and database regions, see [Cluster regions](multiregion-overview.html#cluster-regions) and [Database regions](multiregion-overview.html#database-regions).

### Add a region to a database

To add another region to a database that already has at least one region, use a statement like the following:

{% include copy-clipboard.html %}
~~~ sql
ALTER database foo ADD region "us-east1";
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
  database |  region  | primary |                     zones
-----------+----------+---------+------------------------------------------------
   foo     | us-east1 |  true   | {us-east1-b,us-east1-b,us-east1-b,us-east1-b}
(1 row)
~~~

For more information, see [Database regions](multiregion-overview.html#database-regions).

### Drop a region from a database

To drop a region from a multi-region database, use the following statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER DATABASE foo DROP REGION "us-east1";
~~~

~~~
ALTER DATABASE DROP REGION
~~~

{{site.data.alerts.callout_danger}}
You can only drop the primary region from a multi-region database if it's the last remaining region.  After that, the database will no longer be a multi-region database.
{{site.data.alerts.end}}

For more information, see [Database regions](multiregion-overview.html#database-regions).

## See also

- [Multi-region overview](multiregion-overview.html)
- [`ALTER TABLE`](alter-table.html)
- [`SHOW REGIONS`](show-regions.html)
- [Other SQL Statements](sql-statements.html)
