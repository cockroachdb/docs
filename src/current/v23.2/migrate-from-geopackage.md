---
title: Migrate from GeoPackage
summary: Learn how to migrate data from GeoPackages into a CockroachDB cluster.
toc: true
docs_area: migrate
---

 CockroachDB supports efficiently storing and querying [spatial data]({% link {{ page.version.version }}/export-spatial-data.md %}).

This page has instructions for migrating data from the [GeoPackage](https://www.geopackage.org/) format into CockroachDB using [`ogr2ogr`](https://gdal.org/programs/ogr2ogr.html) and [`IMPORT`][import].

In the example below we will import a data set with <a href="https://gisdata.mn.gov/dataset/env-mn-springs-inventory" data-proofer-ignore>the locations of natural springs in the state of Minnesota (USA)<a/> that is made available via <a href="https://gisdata.mn.gov" data-proofer-ignore>gisdata.mn.gov</a>.

## Before You Begin

To follow along with the example below, you will need the following prerequisites:

- CockroachDB [installed]({% link {{ page.version.version }}/install-cockroachdb.md %}) and [running]({% link {{ page.version.version }}/start-a-local-cluster.md %})
- [`ogr2ogr`](https://gdal.org/programs/ogr2ogr.html)
- [Python 3](https://www.python.org)

{% include {{page.version.version}}/spatial/ogr2ogr-supported-version.md %}

## Step 1. Download the GeoPackage data

1. Download the zip file containing the spring location data:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl -o gpkg_env_mn_springs_inventory.zip https://resources.gisdata.mn.gov/pub/gdrs/data/pub/us_mn_state_dnr/env_mn_springs_inventory/gpkg_env_mn_springs_inventory.zip
    ~~~

1. Unzip the file:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    unzip gpkg_env_mn_springs_inventory.zip
    ~~~

## Step 2. Convert the GeoPackage data to SQL

To load the GeoPackage into CockroachDB, we must first convert it to SQL using the `ogr2ogr` tool.

{% include_cached copy-clipboard.html %}
~~~ shell
ogr2ogr -f PGDUMP springs.sql -lco LAUNDER=NO -lco DROP_TABLE=OFF env_mn_springs_inventory.gpkg
~~~

This particular data set emits a warning  due to some date formatting.

~~~
Warning 1: Non-conformant content for record 1 in column field_ch_1, 2017/05/04, successfully parsed
~~~

{% include {{page.version.version}}/spatial/ogr2ogr-supported-version.md %}

## Step 3. Host the files where the cluster can access them

Each node in the CockroachDB cluster needs to have access to the files being imported.  There are several ways for the cluster to access the data; for a complete list of the types of storage [`IMPORT`][import] can pull from, see [import file locations]({% link {{ page.version.version }}/import.md %}#import-file-location).

For local testing, you can [start a local file server]({% link {{ page.version.version }}/use-a-local-file-server.md %}).  The following command will start a local file server listening on port 3000:

{% include_cached copy-clipboard.html %}
~~~ shell
python3 -m http.server 3000
~~~

## Step 4. Prepare the database

Next, create a database to hold the natural spring location data:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach sql --insecure
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE DATABASE springs;
USE springs;
~~~

## Step 5. Import the SQL

Since the file is being served from a local server and is formatted as PostgreSQL-compatible SQL, we can import the data using the following [`IMPORT PGDUMP`]({% link {{ page.version.version }}/import.md %}#import-a-postgresql-database-dump) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
IMPORT PGDUMP ('http://localhost:3000/springs.sql');
~~~

~~~
        job_id       |  status   | fraction_completed | rows | index_entries |  bytes
---------------------+-----------+--------------------+------+---------------+----------
  589053379352526849 | succeeded |                  1 | 5124 |          5124 | 2449139
(1 row)
~~~

## See also

- [`IMPORT`][import]
- [Export Spatial Data]({% link {{ page.version.version }}/export-spatial-data.md %})
- [Spatial tutorial]({% link {{ page.version.version }}/spatial-tutorial.md %})
- [Spatial indexes]({% link {{ page.version.version }}/spatial-indexes.md %})
- [Migrate from OpenStreetMap]({% link {{ page.version.version }}/migrate-from-openstreetmap.md %})
- [Migrate from Shapefiles]({% link {{ page.version.version }}/migrate-from-shapefiles.md %})
- [Migration Overview]({% link {{ page.version.version }}/migration-overview.md %})
- [Migrate from MySQL][mysql]
- [Migrate from PostgreSQL][postgres]
- [Back Up and Restore Data]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %})
- [Use the Built-in SQL Client]({% link {{ page.version.version }}/cockroach-sql.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})
- [Using GeoServer with CockroachDB]({% link {{ page.version.version }}/geoserver.md %})

{% comment %} Reference Links {% endcomment %}

[postgres]: migrate-from-postgres.html
[mysql]: migrate-from-mysql.html
[import]: import.html
