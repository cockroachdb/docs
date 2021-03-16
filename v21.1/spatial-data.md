---
title: Working with Spatial Data
summary: CockroachDB has special support for efficiently storing and querying spatial data.
toc: true
---

This page provides information about working with spatial data in CockroachDB.

## Supported data types

Supported [spatial](spatial-features.html) data types include:

- Geometric objects such as [points](point.html), [lines](linestring.html), and [polygons](polygon.html) in 2-dimensional space. These are projected onto the flat surface of a plane and are represented in SQL by the `GEOMETRY` data type.

- Geographic objects, which are also made up of [points](point.html), [lines](linestring.html), [polygons](polygon.html), etc., in 2-dimensional space. They are projected onto the surface of a sphere and are represented in SQL by the `GEOGRAPHY` data type. (Technically, they are projected onto a spheroid: "a sphere with a bulge"). The spheroid projection means that:

    - The X and Y coordinates of 2-dimensional points are actually Longitude and Latitude values.
    - The paths between geographic objects are not straight lines; they are curves, and so the distances between objects are calculated using [great circle math](https://en.wikipedia.org/wiki/Great-circle_distance).

## Compatibility

Just as CockroachDB strives for [Postgres compatibility](postgresql-compatibility.html), our spatial data support is designed to be as compatible as possible with the functionality provided by the [PostGIS](https://postgis.net) extension.

However, we do not yet implement the full list of PostGIS built-in functions and operators. Also, our [spatial indexing works differently](spatial-indexes.html) (see the [Performance](#performance) section below). For a list of the spatial functions we support, see [Geospatial functions](functions-and-operators.html#spatial-functions).

If your application needs support for functions that are not yet implemented, please check out [our meta-issue for built-in function support on GitHub](https://github.com/cockroachdb/cockroach/issues/49203), which describes how to find an issue for the built-in function(s) you need.

For a list of other known limitations, see [Known Limitations](known-limitations.html#spatial-support-limitations).

## Troubleshooting

For general CockroachDB troubleshooting information, see [this troubleshooting overview](troubleshooting-overview.html).

If you need help troubleshooting an issue with our spatial support, please get in touch using our [Support resources](support-resources.html).

## Performance

In order to avoid full table scans, make sure to add [indexes](spatial-indexes.html) to any columns that are accessed as part of a predicate in the [`WHERE`](select-clause.html#filter-on-a-single-condition) clause. For geospatial columns, the index will only be used if the column is accessed using an index-accelerated geospatial function from the list below (all of these functions work on `GEOMETRY` data types; a `*` means that a function also works on `GEOGRAPHY` data types):

- [`ST_Covers`](st_covers.html) (*)
- [`ST_CoveredBy`](st_coveredby.html) (*)
- [`ST_Contains`](st_contains.html)
- `ST_ContainsProperly`
- `ST_Crosses`
- `ST_DWithin` (*)
- `ST_DFullyWithin`
- [`ST_Equals`](st_equals.html)
- [`ST_Intersects`](st_intersects.html) (*)
- [`ST_Overlaps`](st_overlaps.html)
- [`ST_Touches`](st_touches.html)
- [`ST_Within`](st_within.html)

To use a version of a function from the list above that will explicitly *not* use the index, add an underscore (`_`) to the beginning of the function name, e.g., [`_ST_Covers`](st_covers.html).

You can check which queries are using which indexes using the [`EXPLAIN`](explain.html) statement. For more information about general query tuning (including index usage), see [Make queries fast](make-queries-fast.html).

The syntax for adding an [index](spatial-indexes.html) to a geometry column is. For example, to add an index to the `geom` column of the [sample `tornadoes` database](migrate-from-shapefiles.html):

{% include copy-clipboard.html %}
~~~ sql
CREATE INDEX tornado_geom_idx ON tornadoes USING GIST (geom);
~~~

This creates a (spatial) [inverted index](inverted-indexes.html) on the `geom` column.

Because CockroachDB is a scale-out, multi-node database, our spatial indexing strategy is based on a [space-filling curve](https://en.wikipedia.org/wiki/Space-filling_curve)/quad-tree design (also known as "divide the space"), rather than the [R-Tree](https://en.wikipedia.org/wiki/R-tree) data structure used by some other spatial databases (also known as "divide the objects"). Other databases that use a "divide the space" strategy include Microsoft SQL Server and MongoDB.

For more detailed information about how CockroachDB's spatial indexes work, see [Spatial indexes](spatial-indexes.html).

If you encounter behavior that you think is due to a performance issue, please get in touch using our [Support resources](support-resources.html).

## Example: Load NYC data for the PostGIS tutorial

Follow the steps below to load the SQL for the NYC data used in the [Introduction to PostGIS](https://postgis.net/workshops/postgis-intro/) tutorial.

{{site.data.alerts.callout_info}}
CockroachDB can work with the tutorial up to Chapter 22, with the following exceptions:  

- Do not try to load Shapefiles via the GUI as shown in the tutorial. Instead, follow the steps below to load the SQL data directly into CockroachDB. (We have already converted the tutorial Shapefiles to SQL for you.)  
- We do not support GML or KML data.  
- We do not support SVG.  
{{site.data.alerts.end}}

### Before you begin

- Install a build of CockroachDB with support for spatial data by following the instructions at [Install CockroachDB](install-cockroachdb.html).

- [Start a local insecure cluster](start-a-local-cluster.html) and connect to that cluster from a [SQL client](cockroach-sql.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    cockroach sql --insecure --host=localhost --port=26257
    ~~~

    Leave this shell open for use in the examples below.

### Step 1. Load the NYC data

Clone the data set:

{% include copy-clipboard.html %}
~~~ shell
git clone https://github.com/otan-cockroach/otan-scripts
~~~

Load the SQL files into your CockroachDB cluster:

{% include copy-clipboard.html %}
~~~ shell
cat otan-scripts/geospatial_sql/*.sql | cockroach sql --insecure --host=localhost --port=26257
~~~

The command above will take a few minutes to run.

### Step 2. Follow the PostGIS tutorial

When the cluster is finished loading the data, open a SQL shell and start working through the [Introduction to PostGIS](https://postgis.net/workshops/postgis-intro/) tutorial:

{% include copy-clipboard.html %}
~~~ shell
cockroach sql --insecure --host=localhost --port=26257
~~~

## See also

- [Install CockroachDB](install-cockroachdb.html)
- [Spatial Features](spatial-features.html)
- [Spatial indexes](spatial-indexes.html)
- [Spatial & GIS Glossary of Terms](spatial-glossary.html)
- [Working with Spatial Data](spatial-data.html)
- [Migrate from Shapefiles](migrate-from-shapefiles.html)
- [Migrate from GeoJSON](migrate-from-geojson.html)
- [Migrate from GeoPackage](migrate-from-geopackage.html)
- [Migrate from OpenStreetMap](migrate-from-openstreetmap.html)
- [Spatial functions](functions-and-operators.html#spatial-functions)
- [POINT](point.html)
- [LINESTRING](linestring.html)
- [POLYGON](polygon.html)
- [MULTIPOINT](multipoint.html)
- [MULTILINESTRING](multilinestring.html)
- [MULTIPOLYGON](multipolygon.html)
- [GEOMETRYCOLLECTION](geometrycollection.html)
- [Well known text](well-known-text.html)
- [Well known binary](well-known-binary.html)
- [GeoJSON](geojson.html)
- [SRID 4326 - longitude and latitude](srid-4326.html)
- [`ST_Contains`](st_contains.html)
- [`ST_ConvexHull`](st_convexhull.html)
- [`ST_CoveredBy`](st_coveredby.html)
- [`ST_Covers`](st_covers.html)
- [`ST_Disjoint`](st_disjoint.html)
- [`ST_Equals`](st_equals.html)
- [`ST_Intersects`](st_intersects.html)
- [`ST_Overlaps`](st_overlaps.html)
- [`ST_Touches`](st_touches.html)
- [`ST_Union`](st_union.html)
- [`ST_Within`](st_within.html)
- [Introducing Distributed Spatial Data in Free, Open Source CockroachDB](https://www.cockroachlabs.com/blog/spatial-data/) (blog post)
- [Troubleshooting overview](troubleshooting-overview.html)
- [Support resources](support-resources.html)
