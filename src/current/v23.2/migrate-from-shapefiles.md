---
title: Migrate from Shapefiles
summary: Learn how to migrate data from ESRI Shapefiles into a CockroachDB cluster.
toc: true
docs_area: migrate
---

CockroachDB supports efficiently storing and querying [spatial data]({% link {{ page.version.version }}/export-spatial-data.md %}).

This page has instructions for migrating data from ESRI [Shapefiles]({% link {{ page.version.version }}/architecture/glossary.md %}#shapefile) into CockroachDB using [`shp2pgsql`](https://manpages.debian.org/stretch/postgis/shp2pgsql.1.html) and [`IMPORT`][import].

{{site.data.alerts.callout_success}}
We are using `shp2pgsql` in the example below, but [`ogr2ogr`](https://gdal.org/programs/ogr2ogr.html) could also be used, e.g.
`ogr2ogr -f PGDUMP file.sql -lco LAUNDER=NO -lco DROP_TABLE=OFF file.shp`
{{site.data.alerts.end}}

{% include {{page.version.version}}/spatial/ogr2ogr-supported-version.md %}

In the example below we will import a [tornadoes data set](http://web.archive.org/web/20201018170120/https://www.spc.noaa.gov/gis/svrgis/zipped/1950-2018-torn-initpoint.zip) that is [available from the US National Weather Service](https://www.spc.noaa.gov/gis/svrgis/) (NWS).

{{site.data.alerts.callout_info}}
Please refer to the documentation of your GIS software for instructions on exporting GIS data to Shapefiles.
{{site.data.alerts.end}}

## Before You Begin

To follow along with the example below, you will need the following prerequisites:

- CockroachDB [installed]({% link {{ page.version.version }}/install-cockroachdb.md %}) and [running]({% link {{ page.version.version }}/start-a-local-cluster.md %})
- [`shp2pgsql`](https://manpages.debian.org/stretch/postgis/shp2pgsql.1.html)
- [Python 3](https://www.python.org)

## Step 1. Download the Shapefile data

1. Download the tornado data:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl -o 1950-2018-torn-initpoint.zip http://web.archive.org/web/20201018170120/https://www.spc.noaa.gov/gis/svrgis/zipped/1950-2018-torn-initpoint.zip
    ~~~

1. Unzip the data file:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    unzip 1950-2018-torn-initpoint.zip
    ~~~

1. Change to the data folder:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd 1950-2018-torn-initpoint/
    ~~~

## Step 2. Convert the Shapefile data to SQL

To load the tornado Shapefile into CockroachDB, we must first convert it to SQL using the `shp2pgsql` tool:

{% include_cached copy-clipboard.html %}
~~~ shell
shp2pgsql 1950-2018-torn-initpoint.shp > tornado-points.sql &
~~~

## Step 3. Host the files where the cluster can access them

Each node in the CockroachDB cluster needs to have access to the files being imported. There are several ways for the cluster to access the data; for a complete list of the types of storage [`IMPORT`][import] can pull from, see [import file locations]({% link {{ page.version.version }}/import.md %}#import-file-location).

For local testing, you can [start a local file server]({% link {{ page.version.version }}/use-a-local-file-server.md %}). The following command will start a local file server listening on port 3000:

{% include_cached copy-clipboard.html %}
~~~ shell
python3 -m http.server 3000
~~~

## Step 4. Prepare the database

Next, create a `tornadoes` database to store the data in, and switch to it:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach sql --insecure
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE DATABASE IF NOT EXISTS tornadoes;
USE tornadoes;
~~~

## Step 5. Import the SQL

Since the file is being served from a local server and is formatted as PostgreSQL-compatible SQL, we can import the data using the following [`IMPORT PGDUMP`]({% link {{ page.version.version }}/import.md %}#import-a-postgresql-database-dump) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
IMPORT PGDUMP ('http://localhost:3000/tornado-points.sql') WITH ignore_unsupported_statements;
~~~

~~~
        job_id       |  status   | fraction_completed | rows  | index_entries |  bytes
---------------------+-----------+--------------------+-------+---------------+-----------
  584874782851497985 | succeeded |                  1 | 63645 |             0 | 18287213
(1 row)
~~~

## See also

- [`IMPORT`][import]
- [Export Spatial Data]({% link {{ page.version.version }}/export-spatial-data.md %})
- [Spatial tutorial]({% link {{ page.version.version }}/spatial-tutorial.md %})
- [Spatial indexes]({% link {{ page.version.version }}/spatial-indexes.md %})
- [Using GeoServer with CockroachDB]({% link {{ page.version.version }}/geoserver.md %})
- [Migrate from OpenStreetMap]({% link {{ page.version.version }}/migrate-from-openstreetmap.md %})
- [Migrate from GeoJSON]({% link {{ page.version.version }}/migrate-from-geojson.md %})
- [Migrate from GeoPackage]({% link {{ page.version.version }}/migrate-from-geopackage.md %})
- [Migration Overview]({% link molt/migration-overview.md %})
- [Migrate from MySQL]({% link molt/migrate-to-cockroachdb.md %}?filters=mysql)
- [Migrate from PostgreSQL]({% link molt/migrate-to-cockroachdb.md %})
- [Back Up and Restore Data]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %})
- [Use the Built-in SQL Client]({% link {{ page.version.version }}/cockroach-sql.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})

{% comment %} Reference Links {% endcomment %}

[postgres]: migrate-from-postgres.html
[mysql]: migrate-from-mysql.html
[import]: import.html
