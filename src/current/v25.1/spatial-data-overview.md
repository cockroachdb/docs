---
title: Spatial Data Overview
summary: A summary of CockroachDB's support for storing and querying spatial data.
toc: true
docs_area: reference.sql
key: spatial-features.html
---

CockroachDB supports efficiently storing and querying spatial data.

See the links below for more information about how to use CockroachDB for spatial use cases.

## Getting Started

- [Install CockroachDB]({{ page.version.version }}/install-cockroachdb.md)
- [Spatial tutorial]({{ page.version.version }}/spatial-tutorial.md)

## Migrating spatial data into and out of CockroachDB

- [Migrate from Shapefiles]({{ page.version.version }}/migrate-from-shapefiles.md)
- [Migrate from GeoJSON]({{ page.version.version }}/migrate-from-geojson.md)
- [Migrate from GeoPackage]({{ page.version.version }}/migrate-from-geopackage.md)
- [Migrate from OpenStreetMap]({{ page.version.version }}/migrate-from-openstreetmap.md)
- [Export Spatial Data]({{ page.version.version }}/export-spatial-data.md)

## Reference

- [Spatial indexes]({{ page.version.version }}/spatial-indexes.md)
- [Spatial and GIS Glossary of Terms]({{ page.version.version }}/architecture/glossary.md)
- [Known Limitations]({{ page.version.version }}/known-limitations.md#spatial-support-limitations)
- [Spatial functions]({{ page.version.version }}/functions-and-operators.md#spatial-functions)
- [Client library compatibility]({{ page.version.version }}/query-spatial-data.md#compatibility)

### Spatial objects

- [POINT]({{ page.version.version }}/point.md)
- [LINESTRING]({{ page.version.version }}/linestring.md)
- [POLYGON]({{ page.version.version }}/polygon.md)
- [MULTIPOINT]({{ page.version.version }}/multipoint.md)
- [MULTILINESTRING]({{ page.version.version }}/multilinestring.md)
- [MULTIPOLYGON]({{ page.version.version }}/multipolygon.md)
- [GEOMETRYCOLLECTION]({{ page.version.version }}/geometrycollection.md)

### Data representations

- [Well known text]({{ page.version.version }}/well-known-text.md)
- [Well known binary]({{ page.version.version }}/well-known-binary.md)
- [GeoJSON]({{ page.version.version }}/geojson.md)
- [SRID 4326 - longitude and latitude]({{ page.version.version }}/srid-4326.md)

### Spatial functions

In addition to the [generated reference documentation for spatial functions]({{ page.version.version }}/functions-and-operators.md#spatial-functions), we have written additional documentation for the following functions, including examples:

- [`ST_Contains`]({{ page.version.version }}/st_contains.md)
- [`ST_ConvexHull`]({{ page.version.version }}/st_convexhull.md)
- [`ST_CoveredBy`]({{ page.version.version }}/st_coveredby.md)
- [`ST_Covers`]({{ page.version.version }}/st_covers.md)
- [`ST_Disjoint`]({{ page.version.version }}/st_disjoint.md)
- [`ST_Equals`]({{ page.version.version }}/st_equals.md)
- [`ST_Intersects`]({{ page.version.version }}/st_intersects.md)
- [`ST_Overlaps`]({{ page.version.version }}/st_overlaps.md)
- [`ST_Touches`]({{ page.version.version }}/st_touches.md)
- [`ST_Union`]({{ page.version.version }}/st_union.md)
- [`ST_Within`]({{ page.version.version }}/st_within.md)

## See also

- [Introducing Distributed Spatial Data in Free, Open Source CockroachDB](https://www.cockroachlabs.com/blog/spatial-data/) (blog post)
- [Using GeoServer with CockroachDB]({{ page.version.version }}/geoserver.md)