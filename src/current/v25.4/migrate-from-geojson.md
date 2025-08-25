---
title: Migrate from GeoJSON
summary: Learn how to migrate data from GeoJSON into a CockroachDB cluster.
toc: true
docs_area: migrate
---

CockroachDB supports efficiently storing and querying [spatial data]({% link {{ page.version.version }}/export-spatial-data.md %}).

This page has instructions for migrating data from the [GeoJSON](https://wikipedia.org/wiki/GeoJSON) format into CockroachDB using [`ogr2ogr`](https://gdal.org/programs/ogr2ogr.html) and [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}).

In the following example, you will import a data set with [the locations of underground storage tanks in the state of Vermont (USA)](https://anrweb.vt.gov/DEC/ERT/UST.aspx?ustfacilityid=96).

## Before you begin

To follow along with the example below, you will need the following prerequisites:

- CockroachDB [installed]({% link {{ page.version.version }}/install-cockroachdb.md %}) and [running]({% link {{ page.version.version }}/start-a-local-cluster.md %})
- [`ogr2ogr`](https://gdal.org/programs/ogr2ogr.html)
  {% include {{page.version.version}}/spatial/ogr2ogr-supported-version.md %}
- [Python 3](https://www.python.org)
- The storage tank GeoJSON data:
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl -o tanks.geojson https://geodata.vermont.gov/datasets/986155613c5743239e7b1980b45bbf36_162.geojson
    ~~~

## Step 1. Convert the GeoJSON data to CSV

Convert the GeoJSON data to CSV using the following `ogr2ogr` command:

{% include_cached copy-clipboard.html %}
~~~ shell
ogr2ogr -f CSV tanks.csv -lco GEOMETRY=AS_WKT tanks.geojson
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

Create a database to hold the storage tank data:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach sql --insecure
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE DATABASE IF NOT EXISTS tanks;
USE tanks;
~~~

## Step 4. Create a CockroachDB table

To import the CSV data, you need to create a table with the necessary columns and data types.

Convert the GeoJSON data to SQL using the following `ogr2ogr` command:

{% include_cached copy-clipboard.html %}
~~~ shell
ogr2ogr -f PGDUMP tanks.sql -lco LAUNDER=NO -lco DROP_TABLE=OFF tanks.geojson
~~~

Create a CockroachDB table that corresponds to the DDL statements in `tanks.sql`:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE underground_storage_tank (
  wkb_geometry GEOMETRY(POINT) NULL,
  "TankID" INT8 NULL,
  "FacilityID" INT8 NULL,
  "Name" VARCHAR NULL,
  "TankStatus" VARCHAR NULL,
  "TankCapacity" INT8 NULL,
  "YearInstalled" VARCHAR NULL,
  "LastInspDate" TIMESTAMPTZ NULL,
  "Address" VARCHAR NULL,
  "Town" VARCHAR NULL,
  "State" VARCHAR NULL,
  "Zip" VARCHAR NULL,
  "DecLat" FLOAT8 NULL,
  "DecLong" FLOAT8 NULL,
  "DocLink" VARCHAR NULL,
  "ActorName" VARCHAR NULL,
  "PermitExpires" TIMESTAMPTZ NULL
);
~~~

## Step 5. Import the CSV

Since the file is being served from a local server and is formatted as CSV, you can import the data using the following [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
IMPORT INTO underground_storage_tank CSV DATA ('http://localhost:3000/tanks.csv') WITH skip = '1';
~~~

~~~
        job_id       |  status   | fraction_completed | rows | index_entries | bytes
---------------------+-----------+--------------------+------+---------------+---------
  980386389822701569 | succeeded |                  1 | 3256 |             0 | 904102
~~~

## See also

- [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %})
- [Export Spatial Data]({% link {{ page.version.version }}/export-spatial-data.md %})
- [Spatial tutorial]({% link {{ page.version.version }}/spatial-tutorial.md %})
- [Migrate from OpenStreetMap]({% link {{ page.version.version }}/migrate-from-openstreetmap.md %})
- [Migrate from Shapefiles]({% link {{ page.version.version }}/migrate-from-shapefiles.md %})
- [Migrate from GeoPackage]({% link {{ page.version.version }}/migrate-from-geopackage.md %})
- [Spatial indexes]({% link {{ page.version.version }}/spatial-indexes.md %})
- [Migration Overview]({% link molt/migration-overview.md %})
- [Migrate from MySQL]({% link molt/migrate-to-cockroachdb.md %}?filters=mysql)
- [Migrate from PostgreSQL]({% link molt/migrate-to-cockroachdb.md %})
- [Back Up and Restore Data]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %})
- [Use the Built-in SQL Client]({% link {{ page.version.version }}/cockroach-sql.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})
- [Using GeoServer with CockroachDB]({% link {{ page.version.version }}/geoserver.md %})

{% comment %} Reference Links {% endcomment %}

[postgres]: migrate-from-postgres.html
[mysql]: migrate-from-mysql.html