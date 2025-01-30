---
title: Migrate from GeoPackage
summary: Learn how to migrate data from GeoPackages into a CockroachDB cluster.
toc: true
docs_area: migrate
---

 CockroachDB supports efficiently storing and querying [spatial data]({{ page.version.version }}/export-spatial-data.md).

This page has instructions for migrating data from the [GeoPackage](https://www.geopackage.org/) format into CockroachDB using [`ogr2ogr`](https://gdal.org/programs/ogr2ogr.html) and [`IMPORT INTO`]({{ page.version.version }}/import-into.md).

In the following example, you will import a data set with the locations of bus stops in the cities of Minneapolis and St. Paul, MN (USA) that is made available via [gisdata.mn.gov](https://gisdata.mn.gov/dataset/us-mn-state-metc-trans-better-bus-stops).

## Before you begin

To follow along with the example below, you will need the following prerequisites:

- CockroachDB [installed]({{ page.version.version }}/install-cockroachdb.md) and [running]({{ page.version.version }}/start-a-local-cluster.md)
- [`ogr2ogr`](https://gdal.org/programs/ogr2ogr.html)
- [Python 3](https://www.python.org)
- The bus-stop GeoPackage data:
    ~~~ shell
    curl -o gpkg_trans_better_bus_stops.zip https://resources.gisdata.mn.gov/pub/gdrs/data/pub/us_mn_state_metc/trans_better_bus_stops/gpkg_trans_better_bus_stops.zip && unzip gpkg_trans_better_bus_stops.zip
    ~~~

## Step 1. Convert the GeoPackage data to CSV

Convert the GeoPackage data to CSV using the following `ogr2ogr` command:

~~~ shell
ogr2ogr -f CSV busstops.CSV -lco GEOMETRY=AS_WKT trans_better_bus_stops.gpkg
~~~

You will import the CSV data into a CockroachDB table.

## Step 2. Host the file where the cluster can access it

Each node in the CockroachDB cluster needs to have access to the files being imported.  There are several ways for the cluster to access the data; for a complete list of the types of storage [`IMPORT INTO`]({{ page.version.version }}/import-into.md) can pull from, see [Import file location]({{ page.version.version }}/import-into.md#import-file-location).

For local testing, you can [start a local file server]({{ page.version.version }}/use-a-local-file-server.md).  The following command will start a local file server listening on port 3000:

~~~ shell
python3 -m http.server 3000
~~~

## Step 3. Prepare the CockroachDB database

Create a database to hold the bus-stop data:

~~~ shell
cockroach sql --insecure
~~~

~~~ sql
CREATE DATABASE busstops;
USE busstops;
~~~

## Step 4. Create a CockroachDB table

To import the CSV data, you need to create a table with the necessary columns and data types.

Convert the GeoPackage data to SQL using the following `ogr2ogr` command:

~~~ shell
ogr2ogr -f PGDUMP busstops.sql -lco LAUNDER=NO -lco DROP_TABLE=OFF trans_better_bus_stops.gpkg
~~~

Create a CockroachDB table that corresponds to the DDL statements in `busstops.sql`:

~~~ sql
CREATE TABLE busstops (
    geom GEOMETRY(POINT) NULL,
    site_ID INT8 NULL,
    site_on VARCHAR NULL,
    site_at VARCHAR NULL,
    corn_desc VARCHAR NULL,
    Completion INT8 NULL,
    Improvemen VARCHAR NULL,
    Improvem_1 VARCHAR NULL,
    Public_Com VARCHAR NULL,
    Project_Na VARCHAR NULL
);
~~~

## Step 5. Import the CSV

Since the file is being served from a local server and is formatted as CSV, you can import the data using the following [`IMPORT INTO`]({{ page.version.version }}/import-into.md) statement:

~~~ sql
IMPORT INTO busstops CSV DATA ('http://localhost:3000/busstops.csv') WITH skip = '1';
~~~

~~~
        job_id       |  status   | fraction_completed | rows | index_entries | bytes
---------------------+-----------+--------------------+------+---------------+---------
  980669141570682881 | succeeded |                  1 |  945 |             0 | 173351
~~~

## See also

- [`IMPORT INTO`]({{ page.version.version }}/import-into.md)
- [Export Spatial Data]({{ page.version.version }}/export-spatial-data.md)
- [Spatial tutorial]({{ page.version.version }}/spatial-tutorial.md)
- [Spatial indexes]({{ page.version.version }}/spatial-indexes.md)
- [Migrate from OpenStreetMap]({{ page.version.version }}/migrate-from-openstreetmap.md)
- [Migrate from Shapefiles]({{ page.version.version }}/migrate-from-shapefiles.md)
- [Migration Overview]({{ page.version.version }}/migration-overview.md)
- [Migrate from MySQL][mysql]
- [Migrate from PostgreSQL][postgres]
- [Back Up and Restore Data]({{ page.version.version }}/take-full-and-incremental-backups.md)
- [Use the Built-in SQL Client]({{ page.version.version }}/cockroach-sql.md)
- [`cockroach` Commands Overview]({{ page.version.version }}/cockroach-commands.md)
- [Using GeoServer with CockroachDB]({{ page.version.version }}/geoserver.md)

{% comment %} Reference Links {% endcomment %}

[postgres]: migrate-from-postgres.html
[mysql]: migrate-from-mysql.html