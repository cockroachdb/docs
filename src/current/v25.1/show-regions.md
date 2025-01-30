---
title: SHOW REGIONS
summary: The SHOW REGIONS statement shows the cluster regions or database regions in a multi-region cluster.
toc: true
docs_area: reference.sql
---

The `SHOW REGIONS` [statement]({{ page.version.version }}/sql-statements.md) lists the [cluster regions]({{ page.version.version }}/multiregion-overview.md#cluster-regions) for a multi-region cluster, or the [database regions]({{ page.version.version }}/multiregion-overview.md#database-regions) for the databases in a multi-region cluster.

## Synopsis

<div>
</div>

## Required privileges

Only members of the [`admin` role]({{ page.version.version }}/security-reference/authorization.md#admin-role) can run `SHOW REGIONS`. By default, the `root` user belongs to the `admin` role.

## Parameters

Parameter | Description
----------|------------
`FROM CLUSTER`| Show the [cluster regions]({{ page.version.version }}/multiregion-overview.md#cluster-regions) for a cluster.<br>Cluster regions are specified [at cluster startup]({{ page.version.version }}/cockroach-start.md#locality).
`FROM DATABASE` | Show all [database regions]({{ page.version.version }}/multiregion-overview.md#database-regions) for the current database.<br>Database regions can be added [at database creation]({{ page.version.version }}/create-database.md), or [after a database has been created]({{ page.version.version }}/alter-database.md).
`FROM DATABASE database_name` | Show all database regions from the database named `database_name`.
`FROM ALL DATABASES` | Show the database regions for all databases in the cluster.

## Response

`SHOW REGIONS`, `SHOW REGIONS FROM CLUSTER`, and `SHOW REGIONS FROM DATABASE` return the following fields for each region:

Field | Description  | `SHOW REGIONS` | `SHOW REGIONS FROM CLUSTER` | `SHOW REGIONS FROM DATABASE`
------|--------------|----------------|-----------------------------|------------------------
`region` | The name of the region. | ✓ | ✓ | ✓
`zones` | The availability zones for the region. | ✓ | ✓ | ✓
`database_names` | A set of database names that use the region. | ✓ | |
`primary_region_of` | A set of database names for which the region is the [primary region]({{ page.version.version }}/alter-database.md#set-primary-region). | ✓ | |
`secondary_region_of` | A set of database names for which the region is the [secondary region]({{ page.version.version }}/multiregion-overview.md#secondary-regions). | ✓ | |
`database`| The name of the database that uses the region.  | | | ✓
`primary` | If `true`, indicates that the region is the primary region. | | | ✓

`SHOW REGIONS FROM ALL DATABASES` returns the following fields for each database:

Field | Description
------|--------------
`database_name` | The name of the database.
`regions` | A set of region names in use by the database.
`primary_region` | The primary region of the database.
`secondary_region` | The [secondary region]({{ page.version.version }}/multiregion-overview.md#secondary-regions) of the database.

## Examples


### View the regions in a cluster

After cluster startup, you can view all of the cluster regions available in the cluster with `SHOW REGIONS FROM CLUSTER`:

~~~ sql
SHOW REGIONS FROM CLUSTER;
~~~

~~~
    region   |            zones
-------------+------------------------------
  us-central | {us-central-a,us-central-b}
  us-east    | {us-east-a,us-east-b}
  us-west    | {us-west-a,us-west-b}
(3 rows)
~~~

### View the regions in a single database

`SHOW REGIONS FROM DATABASE` returns the database regions for a specific database.

[Add an available region]({{ page.version.version }}/alter-database.md#add-region) as the primary region for the `movr` database:

~~~ sql
ALTER DATABASE movr PRIMARY REGION "us-east";
~~~

~~~
ALTER DATABASE PRIMARY REGION
~~~

{{site.data.alerts.callout_info}}
Only [cluster regions]({{ page.version.version }}/multiregion-overview.md#cluster-regions) (i.e., regions that are defined at [node startup time]({{ page.version.version }}/cockroach-start.md#locality)) can be added to a multi-region database.
{{site.data.alerts.end}}

Then, add more regions to the database:

~~~ sql
ALTER DATABASE movr ADD REGION "us-west";
~~~

~~~
ALTER DATABASE ADD REGION
~~~

~~~ sql
ALTER DATABASE movr ADD REGION "us-central";
~~~

~~~
ALTER DATABASE ADD REGION
~~~

To view the regions associated with the database:

~~~ sql
SHOW REGIONS FROM DATABASE movr;
~~~

~~~
  database |   region   | primary | secondary |            zones
-----------+------------+---------+-----------+------------------------------
  movr     | us-east    |    t    |     f     | {us-east-a,us-east-b}
  movr     | us-central |    f    |     f     | {us-central-a,us-central-b}
  movr     | us-west    |    f    |     f     | {us-west-a,us-west-b}
(3 rows)
~~~

The `secondary` column in each row says whether that region has been made a _secondary region_ for failover purposes. For more information, see [Secondary regions]({{ page.version.version }}/multiregion-overview.md#secondary-regions).

With `movr` set as the current database, the following statement returns the same results:

~~~ sql
SHOW REGIONS FROM DATABASE;
~~~

### View the regions for all databases in a cluster

Create another database in the cluster with a primary region:

~~~ sql
CREATE DATABASE cockroachlabs PRIMARY REGION "us-east";
~~~

Then, add another region to the database:

~~~ sql
ALTER DATABASE cockroachlabs ADD REGION "us-west";
~~~

To show the regions in use by all the databases in a cluster, use `SHOW REGIONS`:

~~~ sql
SHOW REGIONS;
~~~

~~~
    region   |            zones            |    database_names    |  primary_region_of
-------------+-----------------------------+----------------------+-----------------------
  us-central | {us-central-a,us-central-b} | {movr}               | {}
  us-east    | {us-east-a,us-east-b}       | {cockroachlabs,movr} | {cockroachlabs,movr}
  us-west    | {us-west-a,us-west-b}       | {cockroachlabs,movr} | {}
(3 rows)
~~~

To show the region information for each database in the cluster, use `SHOW REGIONS FROM ALL DATABASES`:

~~~ sql
SHOW REGIONS FROM ALL DATABASES;
~~~

~~~
  database_name |           regions            | primary_region
----------------+------------------------------+-----------------
  cockroachlabs | {us-east,us-west}            | us-east
  defaultdb     | {}                           | NULL
  movr          | {us-central,us-east,us-west} | us-east
  postgres      | {}                           | NULL
  system        | {}                           | NULL
(5 rows)
~~~

## See also

- [Multi-Region Capabilities Overview]({{ page.version.version }}/multiregion-overview.md)
- [`ADD REGION`]({{ page.version.version }}/alter-database.md#add-region)
- [`DROP REGION`]({{ page.version.version }}/alter-database.md#drop-region)
- [`ADD SUPER REGION`]({{ page.version.version }}/alter-database.md#add-super-region)
- [`DROP SUPER REGION`]({{ page.version.version }}/alter-database.md#drop-super-region)
- [`SHOW SUPER REGIONS`]({{ page.version.version }}/show-super-regions.md)
- [Secondary regions]({{ page.version.version }}/multiregion-overview.md#secondary-regions)
- [`SET SECONDARY REGION`]({{ page.version.version }}/alter-database.md#set-secondary-region)
- [`DROP SECONDARY REGION`]({{ page.version.version }}/alter-database.md#drop-secondary-region)
- [SQL Statements]({{ page.version.version }}/sql-statements.md)