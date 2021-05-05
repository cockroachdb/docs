---
title: SET PRIMARY REGION
summary: The SET PRIMARY REGION statement sets the primary region of a multi-region database.
toc: true
---

<span class="version-tag">New in v21.1:</span> The `ALTER DATABASE .. SET PRIMARY REGION` [statement](sql-statements.html) sets the primary [region](multiregion-overview.html#database-regions) of a [multi-region database](multiregion-overview.html).

{% include enterprise-feature.md %}

{{site.data.alerts.callout_info}}
`SET PRIMARY REGION` is a subcommand of [`ALTER DATABASE`](alter-database.html).
{{site.data.alerts.end}}

{{site.data.alerts.callout_warning}}
If a database's zone configuration has been directly set with an [`ALTER DATABASE ... CONFIGURE ZONE`](configure-zone.html) statement, CockroachDB will block all `ALTER DATABASE ... SET PRIMARY REGION` statements on the database.
{{site.data.alerts.end}}

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/generated/diagrams/alter_database_primary_region.html %}
</div>

## Parameters

| Parameter       | Description                                                                                                                                                       |
|-----------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `database_name` | The database whose primary region to set.                                                                      |
| `region_name`   | The region to set as the database's primary region.<br>Allowed values include any region present in `SHOW REGIONS FROM CLUSTER`. |

## Required privileges

The user must be a member of the [`admin`](authorization.html#roles) or [owner](authorization.html#object-ownership) roles, or have the [`CREATE` privilege](authorization.html#supported-privileges) and `ZONECONFIG` privilege on the database.

## Examples

### Set the primary region

To add the first region, or to set an already-added region as the primary region, use the following statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER DATABASE foo SET PRIMARY REGION "us-east1";
~~~

~~~
ALTER DATABASE PRIMARY REGION
~~~

Given a cluster with multiple regions, any databases in that cluster that have not yet had their primary regions set will have their replicas spread as broadly as possible for resiliency. When a primary region is added to one of these databases:

- All tables will be [`REGIONAL BY TABLE`](set-locality.html#regional-by-table) in the primary region by default.
- This means that all such tables will have all of their voting replicas and leaseholders moved to the primary region. This process is known as [rebalancing](architecture/replication-layer.html#leaseholder-rebalancing).

{{site.data.alerts.callout_info}}
Only regions that are defined at [node startup time](cockroach-start.html#locality) can be used as [database regions](multiregion-overview.html#database-regions) in a multi-region database. For more information, see [Cluster regions](multiregion-overview.html#cluster-regions).
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
(1 row)
~~~

For more information, see [Database regions](multiregion-overview.html#database-regions).

### Drop a region from a database

To [drop a region](drop-region.html) from a multi-region database, use the following statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER DATABASE foo DROP REGION "us-east1";
~~~

~~~
ALTER DATABASE DROP REGION
~~~

{{site.data.alerts.callout_danger}}
You can only drop the primary region from a multi-region database if it's the last remaining region. After that, the database will no longer be a multi-region database.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
SHOW REGIONS FROM DATABASE foo;
~~~

~~~
  database | region | primary | zones
-----------+--------+---------+--------
(0 rows)
~~~

## See also

- [Multi-region overview](multiregion-overview.html)
- [`ADD REGION`](add-region.html)
- [`DROP REGION`](drop-region.html)
- [`SHOW REGIONS`](show-regions.html)
- [`ALTER TABLE`](alter-table.html)
- [Other SQL Statements](sql-statements.html)
