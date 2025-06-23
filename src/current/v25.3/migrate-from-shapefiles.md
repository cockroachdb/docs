---
title: Migrate from Shapefiles
summary: Learn how to migrate data from ESRI Shapefiles into a CockroachDB cluster.
toc: true
docs_area: migrate
---

CockroachDB supports efficiently storing and querying [spatial data]({% link {{ page.version.version }}/export-spatial-data.md %}).

This page has instructions for migrating data from ESRI [Shapefiles]({% link {{ page.version.version }}/architecture/glossary.md %}#shapefile) into CockroachDB using [`ogr2ogr`](https://gdal.org/programs/ogr2ogr.html) and [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}).

In the example below we will import a [tornadoes data set](http://web.archive.org/web/20201018170120/https://www.spc.noaa.gov/gis/svrgis/zipped/1950-2018-torn-initpoint.zip) that is [available from the US National Weather Service](https://www.spc.noaa.gov/gis/svrgis/) (NWS).

{{site.data.alerts.callout_info}}
Please refer to the documentation of your GIS software for instructions on exporting GIS data to Shapefiles.
{{site.data.alerts.end}}

## Before you begin

To follow along with the example below, you will need the following prerequisites:

- CockroachDB [installed]({% link {{ page.version.version }}/install-cockroachdb.md %}) and [running]({% link {{ page.version.version }}/start-a-local-cluster.md %})
- [`ogr2ogr`](https://gdal.org/programs/ogr2ogr.html)
    {% include {{page.version.version}}/spatial/ogr2ogr-supported-version.md %}
- [Python 3](https://www.python.org)
- The tornado data:
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl -o 1950-2018-torn-initpoint.zip http://web.archive.org/web/20201018170120/https://www.spc.noaa.gov/gis/svrgis/zipped/1950-2018-torn-initpoint.zip && unzip 1950-2018-torn-initpoint.zip
    ~~~

## Step 1. Convert the Shapefile data to CSV

Navigate to the folder containing the data:

{% include_cached copy-clipboard.html %}
~~~ shell
cd 1950-2018-torn-initpoint/
~~~

Convert the Shapefile data to CSV using the following `ogr2ogr` command:

{% include_cached copy-clipboard.html %}
~~~ shell
ogr2ogr -f CSV tornadoes.CSV -lco GEOMETRY=AS_WKT 1950-2018-torn-initpoint.shp
~~~

You will import the CSV data into a CockroachDB table.

## Step 2. Host the file where the cluster can access it

Each node in the CockroachDB cluster needs to have access to the files being imported.  There are several ways for the cluster to access the data; for a complete list of the types of storage [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) can pull from, see [Import file location]({% link {{ page.version.version }}/import-into.md %}#import-file-location).

For local testing, you can [start a local file server]({% link {{ page.version.version }}/use-a-local-file-server.md %}).  The following command will start a local file server listening on port 3000:

{% include_cached copy-clipboard.html %}
~~~ shell
python3 -m http.server 3000
~~~

## Step 3. Prepare the CockroachDB database

Create a database to hold the bus-stop data:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach sql --insecure
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE DATABASE tornadoes;
USE tornadoes;
~~~

## Step 4. Create a CockroachDB table

To import the CSV data, you need to create a table with the necessary columns and data types.

Convert the Shapefile data to SQL using the following `ogr2ogr` command:

{% include_cached copy-clipboard.html %}
~~~ shell
ogr2ogr -f PGDUMP tornadoes.sql -lco LAUNDER=NO -lco DROP_TABLE=OFF 1950-2018-torn-initpoint.shp
~~~

Create a CockroachDB table that corresponds to the DDL statements in `tornadoes.sql`:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE tornadoes (
    wkb_geometry GEOMETRY(POINT) NULL,
    om NUMERIC NULL,
    yr NUMERIC NULL,
    mo NUMERIC NULL,
    dy NUMERIC NULL,
    date VARCHAR NULL,
    time VARCHAR NULL,
    tz NUMERIC NULL,
    st VARCHAR NULL,
    stf NUMERIC NULL,
    stn NUMERIC NULL,
    mag NUMERIC NULL,
    inj NUMERIC NULL,
    fat NUMERIC NULL,
    loss NUMERIC NULL,
    closs NUMERIC NULL,
    slat NUMERIC NULL,
    slon NUMERIC NULL,
    elat NUMERIC NULL,
    elon NUMERIC NULL,
    len NUMERIC NULL,
    wid NUMERIC NULL,
    fc NUMERIC NULL
);
~~~

## Step 5. Import the CSV

Since the file is being served from a local server and is formatted as CSV, you can import the data using the following [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
IMPORT INTO tornadoes CSV DATA ('http://localhost:3000/tornadoes.csv') WITH skip = '1';
~~~

~~~
        job_id       |  status   | fraction_completed | rows  | index_entries |  bytes
---------------------+-----------+--------------------+-------+---------------+-----------
  981219367971323905 | succeeded |                  1 | 63645 |             0 | 15681599
~~~

## See also

- [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %})
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
