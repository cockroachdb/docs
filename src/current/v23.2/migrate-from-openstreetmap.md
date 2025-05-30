---
title: Migrate from OpenStreetMap
summary: Learn how to migrate data from the OpenStreetMap pbf format into a CockroachDB cluster.
toc: true
docs_area: migrate
---

 CockroachDB supports efficiently storing and querying [spatial data]({% link {{ page.version.version }}/export-spatial-data.md %}).

This page has instructions for migrating data from [OpenStreetMap](https://www.openstreetmap.org) `.pbf` data files into CockroachDB using [`osm2pgsql`](https://github.com/openstreetmap/osm2pgsql/) and [`IMPORT`][import].

In the example below we will import the [OSM data for Australia](https://download.geofabrik.de/australia-oceania/australia.html) that is available from [GeoFabrik GmbH](http://www.geofabrik.de/data/shapefiles.html).

## Before You Begin

To follow along with the example below, you will need the following prerequisites:

- CockroachDB [installed]({% link {{ page.version.version }}/install-cockroachdb.md %}) and [running]({% link {{ page.version.version }}/start-a-local-cluster.md %})
- [`osm2pgsql`](https://github.com/openstreetmap/osm2pgsql/)

## Step 1. Download the OpenStreetMap data

First, download the OSM data:

{% include_cached copy-clipboard.html %}
~~~ shell
curl -o australia-oceania/australia-latest.osm.pbf https://download.geofabrik.de/australia-oceania/australia-latest.osm.pbf
~~~

## Step 2. Prepare the database

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach sql --insecure
~~~

Next, create a database to hold the Australia map data:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE DATABASE IF NOT EXISTS australia;
USE australia;
~~~

## Step 3. Import the OpenStreetMap data

Run the `osm2pgsql` command shown below to convert the OSM data and import it into the `australia` database. The arguments to `osm2pgsql` shown below assume a [locally running insecure cluster]({% link {{ page.version.version }}/start-a-local-cluster.md %}) and may need to be changed depending on your system. You may also need to tweak the cache setting (`-C`) depending on your system's hardware.

{% include_cached copy-clipboard.html %}
~~~ shell
osm2pgsql -C 2048 -d australia -U root -H localhost -P 26257 australia-latest.osm.pbf
~~~

This will take a few (30+) minutes to run on a laptop, and there will be a lot of output. A successful run will look something like the following:

~~~
osm2pgsql version 1.3.0

Allocating memory for dense node cache
Allocating dense node cache in one big chunk
Allocating memory for sparse node cache
Sharing dense sparse
Node-cache: cache=2048MB, maxblocks=32768*65536, allocation method=3
Using built-in tag processing pipeline
Using projection SRS 3857 (Spherical Mercator)
WARNING:  setting session var "synchronous_commit" is a no-op
WARNING:  setting session var "synchronous_commit" is a no-op
Setting up table: planet_osm_point
NOTICE:  UNLOGGED TABLE will behave as a regular table in CockroachDB
NOTICE:  storage parameter "autovacuum_enabled = 'off'" is ignored
WARNING:  setting session var "synchronous_commit" is a no-op
Setting up table: planet_osm_line
NOTICE:  UNLOGGED TABLE will behave as a regular table in CockroachDB
NOTICE:  storage parameter "autovacuum_enabled = 'off'" is ignored
WARNING:  setting session var "synchronous_commit" is a no-op
Setting up table: planet_osm_polygon
NOTICE:  UNLOGGED TABLE will behave as a regular table in CockroachDB
NOTICE:  storage parameter "autovacuum_enabled = 'off'" is ignored
WARNING:  setting session var "synchronous_commit" is a no-op
Setting up table: planet_osm_roads
NOTICE:  UNLOGGED TABLE will behave as a regular table in CockroachDB
NOTICE:  storage parameter "autovacuum_enabled = 'off'" is ignored

Reading in file: australia-latest.osm.pbf
Using PBF parser.
Processing: Node(66994k 411.0k/s) Way(4640k 7.13k/s) Relation(124777 1313.4/s)  parse time: 909s
Node stats: total(66994811), max(7888181047) in 163s
Way stats: total(4640490), max(845495883) in 651s
Relation stats: total(124777), max(11596803) in 95s
Sorting data and creating indexes for planet_osm_point
node cache: stored: 66994811(100.00%), storage efficiency: 50.93% (dense blocks: 800, sparse nodes: 62492547), hit rate: 100.00%
Sorting data and creating indexes for planet_osm_line
Sorting data and creating indexes for planet_osm_polygon
Sorting data and creating indexes for planet_osm_roads
Using native order for clustering
Using native order for clustering
Using native order for clustering
Using native order for clustering
Copying planet_osm_roads to cluster by geometry finished
Creating geometry index on planet_osm_roads
Copying planet_osm_point to cluster by geometry finished
Creating geometry index on planet_osm_point
Creating indexes on planet_osm_roads finished
Copying planet_osm_polygon to cluster by geometry finished
Creating geometry index on planet_osm_polygon
All indexes on planet_osm_roads created in 318s
Completed planet_osm_roads
Copying planet_osm_line to cluster by geometry finished
Creating geometry index on planet_osm_line
Creating indexes on planet_osm_point finished
All indexes on planet_osm_point created in 1084s
Completed planet_osm_point
Creating indexes on planet_osm_polygon finished
All indexes on planet_osm_polygon created in 1897s
Completed planet_osm_polygon
Creating indexes on planet_osm_line finished
All indexes on planet_osm_line created in 1961s
Completed planet_osm_line

Osm2pgsql took 2879s overall
~~~

## See also

- [`IMPORT`][import]
- [Export Spatial Data]({% link {{ page.version.version }}/export-spatial-data.md %})
- [Spatial tutorial]({% link {{ page.version.version }}/spatial-tutorial.md %})
- [Spatial indexes]({% link {{ page.version.version }}/spatial-indexes.md %})
- [Migrate from GeoPackages]({% link {{ page.version.version }}/migrate-from-geopackage.md %})
- [Migrate from GeoJSON]({% link {{ page.version.version }}/migrate-from-geojson.md %})
- [Migrate from Shapefiles]({% link {{ page.version.version }}/migrate-from-shapefiles.md %})
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
[import]: import.html
