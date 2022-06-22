---
title: SET PRIMARY REGION
summary: The SET PRIMARY REGION statement sets the primary region of a multi-region database.
toc: true
---

{% include_cached new-in.html version="v21.1" %} The `ALTER DATABASE .. SET PRIMARY REGION` [statement](sql-statements.html) sets the primary [region](multiregion-overview.html#database-regions) of a [multi-region database](multiregion-overview.html).

{% include_cached enterprise-feature.md %}

{{site.data.alerts.callout_info}}
`SET PRIMARY REGION` is a subcommand of [`ALTER DATABASE`](alter-database.html).
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
If a database's [zone configuration](configure-replication-zones.html) has been directly set with an [`ALTER DATABASE ... CONFIGURE ZONE`](configure-zone.html) statement, CockroachDB will block all `ALTER DATABASE ... SET PRIMARY REGION` statements on the database.

To remove existing, manually-configured zones from a database (and unblock `SET PRIMARY REGION` statements on the database), use an [`ALTER DATABASE ... CONFIGURE ZONE DISCARD`](configure-zone.html#remove-a-replication-zone) statement.
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

To add a primary region to a database with no existing regions, the user must have one of the following:

- Membership to the [`admin`](authorization.html#roles) role for the cluster.
- Membership to the [owner](authorization.html#object-ownership) role, or the [`CREATE` privilege](authorization.html#supported-privileges), for the database and all tables in the database.

To switch primary regions to a region that has already been added to a database, the user must have membership to the [owner](authorization.html#object-ownership) role for the database, or have the [`CREATE` privilege](authorization.html#supported-privileges) on the database.

## Examples

{% include {{page.version.version}}/sql/multiregion-example-setup.md %}

### Set the primary region

Suppose you have a database `foo` in your cluster, and you want to make it a multi-region database.

To add the first region to the database, or to set an already-added region as the primary region, use a `SET PRIMARY REGION` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE foo SET PRIMARY REGION "us-east1";
~~~

~~~
ALTER DATABASE PRIMARY REGION
~~~

Given a cluster with multiple regions, any databases in that cluster that have not yet had their primary regions set will have their replicas spread as broadly as possible for resiliency. When a primary region is added to one of these databases:

- All tables will be [`REGIONAL BY TABLE`](set-locality.html#regional-by-table) in the primary region by default.
- This means that all such tables will have all of their voting replicas and leaseholders moved to the primary region. This process is known as [rebalancing](architecture/replication-layer.html#leaseholder-rebalancing).

### Add more regions to the database

To add more regions to the database, use an [`ADD REGION`](add-region.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER database foo ADD region "europe-west1";
~~~

~~~
ALTER DATABASE ADD REGION
~~~

To view the database's regions, and to see which region is the primary region, use a [`SHOW REGIONS FROM DATABASE`](show-regions.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW REGIONS FROM DATABASE foo;
~~~

~~~
  database |    region    | primary |  zones
-----------+--------------+---------+----------
  foo      | us-east1     |  true   | {b,c,d}
  foo      | europe-west1 |  false  | {b,c,d}
(2 rows)
~~~

### Change an existing primary region

To change the primary region to another region in the database, use a `SET PRIMARY REGION` statement.

You can only change an existing primary region to a region that has already been added to the database. If you try to change the primary region to a region that is not already associated with a database, CockroachDB will return an error:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE foo SET PRIMARY REGION "us-west1";
~~~

~~~
ERROR: region "us-west1" has not been added to the database
SQLSTATE: 42602
HINT: you must add the region to the database before setting it as primary region, using ALTER DATABASE foo ADD REGION "us-west1"
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER database foo ADD region "us-west1";
~~~

~~~
ALTER DATABASE ADD REGION
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE foo SET PRIMARY REGION "us-west1";
~~~

~~~
ALTER DATABASE PRIMARY REGION
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW REGIONS FROM DATABASE foo;
~~~

~~~
  database |    region    | primary |  zones
-----------+--------------+---------+----------
  foo      | us-west1     |  true   | {a,b,c}
  foo      | europe-west1 |  false  | {b,c,d}
  foo      | us-east1     |  false  | {b,c,d}
(3 rows)
~~~

### Drop a region from a database

To drop a region from a multi-region database, use a [`DROP REGION`](drop-region.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE foo DROP REGION "us-west1";
~~~

~~~
ALTER DATABASE DROP REGION
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW REGIONS FROM DATABASE foo;
~~~

~~~
  database |    region    | primary |  zones
-----------+--------------+---------+----------
  foo      | us-east1     |  true   | {b,c,d}
  foo      | europe-west1 |  false  | {b,c,d}
(2 rows)
~~~

{{site.data.alerts.callout_info}}
You can only drop the primary region from a multi-region database if it's the last remaining region.
{{site.data.alerts.end}}

If you try to drop the primary region when there is more than one region, CockroachDB will return an error:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE foo DROP REGION "us-east1";
~~~

~~~
ERROR: cannot drop region "us-east1"
SQLSTATE: 42P12
HINT: You must designate another region as the primary region using ALTER DATABASE foo PRIMARY REGION <region name> or remove all other regions before attempting to drop region "us-east1"
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE foo DROP REGION "europe-west1";
~~~

~~~
ALTER DATABASE DROP REGION
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW REGIONS FROM DATABASE foo;
~~~

~~~
  database |  region  | primary |  zones
-----------+----------+---------+----------
  foo      | us-east1 |  true   | {b,c,d}
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE foo DROP REGION "us-east1";
~~~

~~~
ALTER DATABASE DROP REGION
~~~

{% include_cached copy-clipboard.html %}
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
