---
title: DROP REGION
summary: The DROP REGION statement drops a region from a multi-region database.
toc: true
docs_area: reference.sql
---

 The `ALTER DATABASE .. DROP REGION` [statement](sql-statements.html) drops a [region](multiregion-overview.html#database-regions) from a [multi-region database](multiregion-overview.html).

{% include enterprise-feature.md %}

{{site.data.alerts.callout_info}}
`DROP REGION` is a subcommand of [`ALTER DATABASE`](alter-database.html).
{{site.data.alerts.end}}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-21.2/grammar_svg/alter_database_drop_region.html %}
</div>

## Parameters

| Parameter       | Description                                                                                                                                                       |
|-----------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `database_name` | The database from which you are dropping a [region](multiregion-overview.html#database-regions).                                                                      |
| `region_name`   | The [region](multiregion-overview.html#database-regions) being dropped from this database.  Allowed values include any region present in `SHOW REGIONS FROM DATABASE database_name`.<br>You can only drop the primary region from a multi-region database if it's the last remaining region. |

## Required privileges

To drop a region from a database, the user must have one of the following:

- Membership to the [`admin`](security-reference/authorization.html#roles) role for the cluster.
- Membership to the [owner](authorization.html#object-ownership) role, or the [`CREATE` privilege](authorization.html#supported-privileges), for the database and all [`REGIONAL BY ROW`](multiregion-overview.html#regional-by-row-tables) tables in the database.

## Examples

{% include {{page.version.version}}/sql/multiregion-example-setup.md %}

### Set the primary region

Suppose you have a database `foo` in your cluster, and you want to make it a multi-region database.

To add the first region to the database, or to set an already-added region as the primary region, use a [`SET PRIMARY REGION`](set-primary-region.html) statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER DATABASE foo SET PRIMARY REGION "us-east1";
~~~

~~~
ALTER DATABASE PRIMARY REGION
~~~

### Add regions to a database

To add more regions to a database that already has at least one region, use an [`ADD REGION`](add-region.html) statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER database foo ADD region "us-west1";
~~~

~~~
ALTER DATABASE ADD REGION
~~~

{% include copy-clipboard.html %}
~~~ sql
ALTER database foo ADD region "europe-west1";
~~~

~~~
ALTER DATABASE ADD REGION
~~~

### View a database's regions

To view the regions associated with a multi-region database, use a [`SHOW REGIONS FROM DATABASE`](show-regions.html) statement:

{% include copy-clipboard.html %}
~~~ sql
SHOW REGIONS FROM DATABASE foo;
~~~

~~~
  database |    region    | primary |  zones
-----------+--------------+---------+----------
  foo      | us-east1     |  true   | {b,c,d}
  foo      | europe-west1 |  false  | {b,c,d}
  foo      | us-west1     |  false  | {a,b,c}
(3 rows)
~~~

### Drop regions from a database

To drop a region from a multi-region database, use a `DROP REGION` statement:

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
  database |    region    | primary |  zones
-----------+--------------+---------+----------
  foo      | us-east1     |  true   | {b,c,d}
  foo      | europe-west1 |  false  | {b,c,d}
(2 rows)
~~~

You can only drop the primary region from a multi-region database if it's the last remaining region.

If you try to drop the primary region when there is more than one region, CockroachDB will return an error:

{% include copy-clipboard.html %}
~~~ sql
ALTER DATABASE foo DROP REGION "us-east1";
~~~

~~~
ERROR: cannot drop region "us-east1"
SQLSTATE: 42P12
HINT: You must designate another region as the primary region using ALTER DATABASE foo PRIMARY REGION <region name> or remove all other regions before attempting to drop region "us-east1"
~~~

{% include copy-clipboard.html %}
~~~ sql
ALTER DATABASE foo DROP REGION "europe-west1";
~~~

~~~
ALTER DATABASE DROP REGION
~~~

{% include copy-clipboard.html %}
~~~ sql
SHOW REGIONS FROM DATABASE foo;
~~~

~~~
  database |  region  | primary |  zones
-----------+----------+---------+----------
  foo      | us-east1 |  true   | {b,c,d}
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
ALTER DATABASE foo DROP REGION "us-east1";
~~~

~~~
ALTER DATABASE DROP REGION
~~~

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

- [Multi-Region Capabilities Overview](multiregion-overview.html)
- [`SET PRIMARY REGION`](set-primary-region.html)
- [`ADD REGION`](add-region.html)
- [`SHOW REGIONS`](show-regions.html)
- [`ALTER TABLE`](alter-table.html)
- [Other SQL Statements](sql-statements.html)
