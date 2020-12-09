---
title: Spatial Features
summary: A summary of CockroachDB's support for storing and querying spatial data.
toc: true
---

 CockroachDB supports efficiently storing and querying spatial data.

See the links below for more information about how to use CockroachDB for spatial use cases.

## Getting Started

- [Install CockroachDB](install-cockroachdb.html)
- [Working with Spatial Data](spatial-data.html)

## Migrating spatial data into and out of CockroachDB

- [Migrate from Shapefiles](migrate-from-shapefiles.html)
- [Migrate from GeoJSON](migrate-from-geojson.html)
- [Migrate from GeoPackage](migrate-from-geopackage.html)
- [Migrate from OpenStreetMap](migrate-from-openstreetmap.html)
- [Export Spatial Data](export-spatial-data.html)

## Reference

- [Spatial indexes](spatial-indexes.html)
- [Spatial and GIS Glossary of Terms](spatial-glossary.html)
- [Known Limitations](known-limitations.html#spatial-support-limitations)
- [Spatial functions](functions-and-operators.html#spatial-functions)

### Spatial objects

- [POINT](point.html)
- [LINESTRING](linestring.html)
- [POLYGON](polygon.html)
- [MULTIPOINT](multipoint.html)
- [MULTILINESTRING](multilinestring.html)
- [MULTIPOLYGON](multipolygon.html)
- [GEOMETRYCOLLECTION](geometrycollection.html)

### Data representations

- [Well known text](well-known-text.html)
- [Well known binary](well-known-binary.html)
- [GeoJSON](geojson.html)
- [SRID 4326 - longitude and latitude](srid-4326.html)

### Spatial functions

In addition to the [generated reference documentation for spatial functions](functions-and-operators.html#spatial-functions), we have written additional documentation for the following functions, including examples:

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
