---
title: SHOW REGIONS
summary: The SHOW REGIONS statement shows the cluster regions or database regions in a multi-region cluster.
toc: true
docs_area: reference.sql
---

{% assign rd = site.data.releases | where_exp: "rd", "rd.major_version == page.version.version" | first %}

{% if rd %}
{% assign remote_include_version = page.version.version | replace: "v", "" %}
{% else %}
{% assign remote_include_version = site.versions["stable"] | replace: "v", "" %}
{% endif %}

 The `SHOW REGIONS` [statement](sql-statements.html) lists the [cluster regions](multiregion-overview.html#cluster-regions) for a multi-region cluster, or the [database regions](multiregion-overview.html#database-regions) for the databases in a multi-region cluster.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-{{ remote_include_version }}/grammar_svg/show_regions.html %}
</div>

## Required privileges

Only members of the [`admin` role](security-reference/authorization.html#admin-role) can run `SHOW REGIONS`. By default, the `root` user belongs to the `admin` role.

## Parameters

Parameter | Description
----------|------------
`FROM CLUSTER`| Show the [cluster regions](multiregion-overview.html#cluster-regions) for a cluster.<br>Cluster regions are specified [at cluster startup](cockroach-start.html#locality).
`FROM DATABASE` | Show all [database regions](multiregion-overview.html#database-regions) for the current database.<br>Database regions can be added [at database creation](create-database.html), or [after a database has been created](alter-database.html).
`FROM DATABASE database_name` | Show all database regions from the database named `database_name`.
`FROM ALL DATABASES` | Show the database regions for all databases in the cluster.

## Response

`SHOW REGIONS`, `SHOW REGIONS FROM CLUSTER`, and `SHOW REGIONS FROM DATABASE` return the following fields for each region:

Field | Description  | `SHOW REGIONS` | `SHOW REGIONS FROM CLUSTER` | `SHOW REGIONS FROM DATABASE`
------|--------------|----------------|-----------------------------|------------------------
`region` | The name of the region. | ✓ | ✓ | ✓
`zones` | The availability zones for the region. | ✓ | ✓ | ✓
`database_names` | A set of database names that use the region. | ✓ | |
`primary_region_of` | A set of database names for which the region is the primary region. | ✓ | |
`database`| The name of the database that uses the region.  | | | ✓
`primary` | If `true`, indicates that the region is the primary region. | | | ✓

`SHOW REGIONS FROM ALL DATABASES` returns the following fields for each database:

Field | Description
------|--------------
`database_name` | The name of the database.
`regions` | A set of region names in use by the database.
`primary_region` | The primary region of the database.

## Examples

{% include {{page.version.version}}/sql/movr-statements-nodes.md %}

### View the regions in a cluster

After cluster startup, you can view all of the cluster regions available in the cluster with `SHOW REGIONS FROM CLUSTER`:

{% include_cached copy-clipboard.html %}
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

[Add an available region](add-region.html) as the primary region for the `movr` database:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr PRIMARY REGION "us-east";
~~~

~~~
ALTER DATABASE PRIMARY REGION
~~~

{{site.data.alerts.callout_info}}
Only [cluster regions](multiregion-overview.html#cluster-regions) (i.e., regions that are defined at [node startup time](cockroach-start.html#locality)) can be added to a multi-region database.
{{site.data.alerts.end}}

Then, add more regions to the database:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr ADD REGION "us-west";
~~~

~~~
ALTER DATABASE ADD REGION
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr ADD REGION "us-central";
~~~

~~~
ALTER DATABASE ADD REGION
~~~

To view the regions associated with the database:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW REGIONS FROM DATABASE movr;
~~~

~~~
  database |   region   | primary |            zones
-----------+------------+---------+------------------------------
  movr     | us-east    |  true   | {us-east-a,us-east-b}
  movr     | us-central |  false  | {us-central-a,us-central-b}
  movr     | us-west    |  false  | {us-west-a,us-west-b}
(3 rows)
~~~

With `movr` set as the current database, the following statement returns the same results:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW REGIONS FROM DATABASE;
~~~

~~~
  database |   region   | primary |            zones
-----------+------------+---------+------------------------------
  movr     | us-east    |  true   | {us-east-a,us-east-b}
  movr     | us-central |  false  | {us-central-a,us-central-b}
  movr     | us-west    |  false  | {us-west-a,us-west-b}
(3 rows)
~~~

### View the regions for all databases in a cluster

Create another database in the cluster with a primary region:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE DATABASE cockroachlabs PRIMARY REGION "us-east";
~~~

Then, add another region to the database:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE cockroachlabs ADD REGION "us-west";
~~~

To show the regions in use by all the databases in a cluster, use `SHOW REGIONS`:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

- [Multi-Region Capabilities Overview](multiregion-overview.html)
- [`ADD REGION`](add-region.html)
- [`DROP REGION`](drop-region.html)
- [`ADD SUPER REGION`](add-super-region.html)
- [`DROP SUPER REGION`](drop-super-region.html)
- [`SHOW SUPER REGIONS`](show-super-regions.html)
- [SQL Statements](sql-statements.html)
