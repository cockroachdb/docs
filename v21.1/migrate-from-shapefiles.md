---
title: Migrate from Shapefiles
summary: Learn how to migrate data from ESRI Shapefiles into a CockroachDB cluster.
toc: true
---

 CockroachDB supports efficiently storing and querying [spatial data](spatial-data.html).

This page has instructions for migrating data from ESRI [Shapefiles](spatial-glossary.html#shapefile) into CockroachDB using [`shp2pgsql`](https://manpages.debian.org/stretch/postgis/shp2pgsql.1.en.html) and [`IMPORT`][import].

{{site.data.alerts.callout_success}}
We are using `shp2pgsql` in the example below, but [`ogr2ogr`](https://gdal.org/programs/ogr2ogr.html) could also be used, e.g.
`ogr2ogr -f PGDUMP file.sql -lco LAUNDER=NO -lco DROP_TABLE=OFF file.shp`
{{site.data.alerts.end}}

{% include {{page.version.version}}/spatial/ogr2ogr-supported-version.md %}

In the example below we will import a [tornadoes data set](https://www.spc.noaa.gov/gis/svrgis/zipped/1950-2018-torn-initpoint.zip) that is [available from the US National Weather Service](https://www.spc.noaa.gov/gis/svrgis/) (NWS).

{{site.data.alerts.callout_info}}
Please refer to the documentation of your GIS software for instructions on exporting GIS data to Shapefiles.
{{site.data.alerts.end}}

## Before You Begin

To follow along with the example below, you will need the following prerequisites:

- CockroachDB [installed](install-cockroachdb.html) and [running](start-a-local-cluster.html)
- [`shp2pgsql`](https://manpages.debian.org/stretch/postgis/shp2pgsql.1.en.html)
- [Python 3](https://www.python.org)

## Step 1. Download the Shapefile data

First, download and unzip the tornado data:

{% include copy-clipboard.html %}
~~~ shell
wget https://www.spc.noaa.gov/gis/svrgis/zipped/1950-2018-torn-initpoint.zip
~~~

{% include copy-clipboard.html %}
~~~ shell
unzip 1950-2018-torn-initpoint.zip
~~~

{% include copy-clipboard.html %}
~~~ shell
cd 1950-2018-torn-initpoint/
~~~

## Step 2. Convert the Shapefile data to SQL

To load the tornado Shapefile into CockroachDB, we must first convert it to SQL using the `shp2pgsql` tool:

{% include copy-clipboard.html %}
~~~ shell
shp2pgsql 1950-2018-torn-initpoint.shp > tornado-points.sql &
~~~

## Step 3. Host the files where the cluster can access them

Each node in the CockroachDB cluster needs to have access to the files being imported. There are several ways for the cluster to access the data; for a complete list of the types of storage [`IMPORT`][import] can pull from, see [import file locations](import.html#import-file-location).

For local testing, you can [start a local file server](create-a-file-server.html). The following command will start a local file server listening on port 3000:

{% include copy-clipboard.html %}
~~~ shell
python3 -m http.server 3000
~~~

## Step 4. Prepare the database

Next, create a `tornadoes` database to store the data in, and switch to it:

{% include copy-clipboard.html %}
~~~ shell
cockroach sql --insecure
~~~

{% include copy-clipboard.html %}
~~~ sql
CREATE DATABASE IF NOT EXISTS tornadoes;
USE tornadoes;
~~~

## Step 5. Import the SQL

Since the file is being served from a local server and is formatted as Postgres-compatible SQL, we can import the data using the following [`IMPORT PGDUMP`](import.html#import-a-postgres-database-dump) statement:

{% include copy-clipboard.html %}
~~~ sql
IMPORT PGDUMP ('http://localhost:3000/tornado-points.sql');
~~~

~~~
        job_id       |  status   | fraction_completed | rows  | index_entries |  bytes
---------------------+-----------+--------------------+-------+---------------+-----------
  584874782851497985 | succeeded |                  1 | 63645 |             0 | 18287213
(1 row)
~~~

## See also

- [`IMPORT`][import]
- [Export Spatial Data](export-spatial-data.html)
- [Working with Spatial Data](spatial-data.html)
- [Spatial indexes](spatial-indexes.html)
- [Migrate from OpenStreetMap](migrate-from-openstreetmap.html)
- [Migrate from GeoJSON](migrate-from-geojson.html)
- [Migrate from GeoPackage](migrate-from-geopackage.html)
- [Migration Overview](migration-overview.html)
- [Migrate from MySQL][mysql]
- [Migrate from Postgres][postgres]
- [SQL Dump (Export)](cockroach-dump.html)
- [Back Up and Restore Data](backup-and-restore.html)
- [Use the Built-in SQL Client](cockroach-sql.html)
- [Other Cockroach Commands](cockroach-commands.html)

<!-- Reference Links -->

[postgres]: migrate-from-postgres.html
[mysql]: migrate-from-mysql.html
[import]: import.html
