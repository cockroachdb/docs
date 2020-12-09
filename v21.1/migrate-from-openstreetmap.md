---
title: Migrate from OpenStreetMap
summary: Learn how to migrate data from the OpenStreetMap pbf format into a CockroachDB cluster.
toc: true
---

 CockroachDB supports efficiently storing and querying [spatial data](spatial-data.html).

This page has instructions for migrating data from [OpenStreetMap](https://www.openstreetmap.org) `.pbf` data files into CockroachDB using [`osm2pgsql`](https://github.com/openstreetmap/osm2pgsql/) and [`IMPORT`][import].

In the example below we will import the [OSM data for Australia](https://download.geofabrik.de/australia-oceania/australia.html) that is available from [GeoFabrik GmbH](http://www.geofabrik.de/data/shapefiles.html).

## Before You Begin

To follow along with the example below, you will need the following prerequisites:

- CockroachDB [installed](install-cockroachdb.html) and [running](start-a-local-cluster.html)
- [`osm2pgsql`](https://github.com/openstreetmap/osm2pgsql/)

## Step 1. Download the OpenStreetMap data

First, download the OSM data:

{% include copy-clipboard.html %}
~~~ shell
wget https://download.geofabrik.de/australia-oceania/australia-latest.osm.pbf
~~~

## Step 2. Prepare the database

{% include copy-clipboard.html %}
~~~ shell
cockroach sql --insecure
~~~

Next, create a database to hold the Australia map data:

{% include copy-clipboard.html %}
~~~ sql
CREATE DATABASE IF NOT EXISTS australia;
USE australia;
~~~

## Step 3. Import the OpenStreetMap data

Run the `osm2pgsql` command shown below to convert the OSM data and import it into the `australia` database. The arguments to `osm2pgsql` shown below assume a [locally running insecure cluster](start-a-local-cluster.html) and may need to be changed depending on your system. You may also need to tweak the cache setting (`-C`) depending on your system's hardware.

{% include copy-clipboard.html %}
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
- [Export Spatial Data](export-spatial-data.html)
- [Working with Spatial Data](spatial-data.html)
- [Spatial indexes](spatial-indexes.html)
- [Migrate from GeoPackages](migrate-from-geopackage.html)
- [Migrate from GeoJSON](migrate-from-geojson.html)
- [Migrate from Shapefiles](migrate-from-shapefiles.html)
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
