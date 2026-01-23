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

- [Install CockroachDB]({% link {{ page.version.version }}/install-cockroachdb.md %})
- [Spatial tutorial]({% link {{ page.version.version }}/spatial-tutorial.md %})

## Migrating spatial data into and out of CockroachDB

- [Migrate from Shapefiles]({% link {{ page.version.version }}/migrate-from-shapefiles.md %})
- [Migrate from GeoJSON]({% link {{ page.version.version }}/migrate-from-geojson.md %})
- [Migrate from GeoPackage]({% link {{ page.version.version }}/migrate-from-geopackage.md %})
- [Migrate from OpenStreetMap]({% link {{ page.version.version }}/migrate-from-openstreetmap.md %})
- [Export Spatial Data]({% link {{ page.version.version }}/export-spatial-data.md %})

## Reference

- [Spatial indexes]({% link {{ page.version.version }}/spatial-indexes.md %})
- [Spatial and GIS Glossary of Terms]({% link {{ page.version.version }}/architecture/glossary.md %})
- [Known Limitations]({% link {{ page.version.version }}/known-limitations.md %}#spatial-support-limitations)
- [Spatial functions]({% link {{ page.version.version }}/functions-and-operators.md %}#spatial-functions)
- [Client library compatibility]({% link {{ page.version.version }}/query-spatial-data.md %}#compatibility)

### Spatial objects

- [POINT]({% link {{ page.version.version }}/point.md %})
- [LINESTRING]({% link {{ page.version.version }}/linestring.md %})
- [POLYGON]({% link {{ page.version.version }}/polygon.md %})
- [MULTIPOINT]({% link {{ page.version.version }}/multipoint.md %})
- [MULTILINESTRING]({% link {{ page.version.version }}/multilinestring.md %})
- [MULTIPOLYGON]({% link {{ page.version.version }}/multipolygon.md %})
- [GEOMETRYCOLLECTION]({% link {{ page.version.version }}/geometrycollection.md %})

### Data representations

- [Well known text]({% link {{ page.version.version }}/well-known-text.md %})
- [Well known binary]({% link {{ page.version.version }}/well-known-binary.md %})
- [GeoJSON]({% link {{ page.version.version }}/geojson.md %})
- [SRID 4326 - longitude and latitude]({% link {{ page.version.version }}/srid-4326.md %})

### Spatial functions

In addition to the [generated reference documentation for spatial functions]({% link {{ page.version.version }}/functions-and-operators.md %}#spatial-functions), we have written additional documentation for the following functions, including examples:

- [`ST_Contains`]({% link {{ page.version.version }}/st_contains.md %})
- [`ST_ConvexHull`]({% link {{ page.version.version }}/st_convexhull.md %})
- [`ST_CoveredBy`]({% link {{ page.version.version }}/st_coveredby.md %})
- [`ST_Covers`]({% link {{ page.version.version }}/st_covers.md %})
- [`ST_Disjoint`]({% link {{ page.version.version }}/st_disjoint.md %})
- [`ST_Equals`]({% link {{ page.version.version }}/st_equals.md %})
- [`ST_Intersects`]({% link {{ page.version.version }}/st_intersects.md %})
- [`ST_Overlaps`]({% link {{ page.version.version }}/st_overlaps.md %})
- [`ST_Touches`]({% link {{ page.version.version }}/st_touches.md %})
- [`ST_Union`]({% link {{ page.version.version }}/st_union.md %})
- [`ST_Within`]({% link {{ page.version.version }}/st_within.md %})

## Known limitations

{% include {{ page.version.version }}/known-limitations/spatial-limitations.md %}

## See also

- [Introducing Distributed Spatial Data in CockroachDB](https://www.cockroachlabs.com/blog/spatial-data/) (blog post)
- [Using GeoServer with CockroachDB]({% link {{ page.version.version }}/geoserver.md %})
