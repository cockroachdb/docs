---
title: Migrate from GeoJSON
summary: Learn how to migrate data from GeoJSON into a CockroachDB cluster.
toc: true
---

 CockroachDB supports efficiently storing and querying [spatial data](spatial-data.html).

This page has instructions for migrating data from the [GeoJSON](https://en.wikipedia.org/wiki/GeoJSON) format into CockroachDB using [`ogr2ogr`](https://gdal.org/programs/ogr2ogr.html) and [`IMPORT`][import].

In the example below we will import a data set with [the locations of underground storage tanks in the state of Vermont (USA)](https://anrweb.vt.gov/DEC/ERT/UST.aspx?ustfacilityid=96) that is made available via [data.gov](https://catalog.data.gov/dataset/underground-storage-tank-working).

## Before You Begin

To follow along with the example below, you will need the following prerequisites:

- CockroachDB [installed](install-cockroachdb.html) and [running](start-a-local-cluster.html)
- [`ogr2ogr`](https://gdal.org/programs/ogr2ogr.html)
- [Python 3](https://www.python.org)

{% include {{page.version.version}}/spatial/ogr2ogr-supported-version.md %}

## Step 1. Download the GeoJSON data

First, download the storage tank GeoJSON data:

{% include copy-clipboard.html %}
~~~ shell
wget -O tanks.geojson https://geodata.vermont.gov/datasets/986155613c5743239e7b1980b45bbf36_162.geojson
~~~

## Step 2. Convert the GeoJSON data to SQL

Next, convert the GeoJSON data to SQL using the following `ogr2ogr` command:

{% include copy-clipboard.html %}
~~~ shell
ogr2ogr -f PGDUMP tanks.sql -lco LAUNDER=NO -lco DROP_TABLE=OFF tanks.geojson
~~~

{% include {{page.version.version}}/spatial/ogr2ogr-supported-version.md %}

## Step 3. Host the files where the cluster can access them

Each node in the CockroachDB cluster needs to have access to the files being imported.  There are several ways for the cluster to access the data; for a complete list of the types of storage [`IMPORT`][import] can pull from, see [import file locations](import.html#import-file-location).

For local testing, you can [start a local file server](create-a-file-server.html).  The following command will start a local file server listening on port 3000:

{% include copy-clipboard.html %}
~~~ shell
python3 -m http.server 3000
~~~

## Step 4. Prepare the database

Next, create a database to hold the storage tank data:

{% include copy-clipboard.html %}
~~~ shell
cockroach sql --insecure
~~~

{% include copy-clipboard.html %}
~~~ sql
CREATE DATABASE IF NOT EXISTS tanks;
USE tanks;
~~~

## Step 5. Import the SQL

Since the file is being served from a local server and is formatted as Postgres-compatible SQL, we can import the data using the following [`IMPORT PGDUMP`](import.html#import-a-postgres-database-dump) statement:

{% include copy-clipboard.html %}
~~~ sql
IMPORT PGDUMP ('http://localhost:3000/tanks.sql');
~~~

~~~
        job_id       |  status   | fraction_completed | rows | index_entries | bytes
---------------------+-----------+--------------------+------+---------------+---------
  588555793549328385 | succeeded |                  1 | 2709 |          2709 | 822504
(1 row)
~~~

## See also

- [`IMPORT`][import]
- [Export Spatial Data](export-spatial-data.html)
- [Working with Spatial Data](spatial-data.html)
- [Migrate from OpenStreetMap](migrate-from-openstreetmap.html)
- [Migrate from Shapefiles](migrate-from-shapefiles.html)
- [Migrate from GeoPackage](migrate-from-geopackage.html)
- [Spatial indexes](spatial-indexes.html)
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
