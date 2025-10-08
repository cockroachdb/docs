---
title: Well Known Binary
summary: The Well Known Binary format provides a representation of a geometric shape that is efficient for machine processing and storage.
toc: true
docs_area: reference.sql
---

The Well Known Binary format (hereafter _WKB_) provides a non-textual, binary representation of a geometric shape. It is used to:

- Allow shapes to be transferred between CockroachDB and a [SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}) or [application]({% link {{ page.version.version }}/build-a-java-app-with-cockroachdb.md %}).
- Provide a portable binary format that can be read across different platforms.

WKB is obtained by serializing a shape as a sequence of numbers. For more detailed information about the structure of the WKB format, see the diagrams showing WKB integer codes in the [OpenGIS Implementation Specification for Geographic information - Simple feature access - Part 1: Common architecture](https://portal.opengeospatial.org/files/?artifact_id=25355).

<a name="ewkb"></a>

The Extended Well Known Binary (_EWKB_) format is the same as WKB, with an [SRID]({% link {{ page.version.version }}/architecture/glossary.md %}#srid) representation prepended to the data structure.

## See also

- [Spatial Data Overview]({% link {{ page.version.version }}/spatial-data-overview.md %})
- [Spatial tutorial]({% link {{ page.version.version }}/spatial-tutorial.md %})
- [Spatial indexes]({% link {{ page.version.version }}/spatial-indexes.md %})
- [Spatial and GIS Glossary of Terms]({% link {{ page.version.version }}/architecture/glossary.md %})
- [OpenGIS Implementation Specification for Geographic information - Simple feature access - Part 1: Common architecture](https://portal.opengeospatial.org/files/?artifact_id=25355)
- [Well known text]({% link {{ page.version.version }}/well-known-text.md %})
- [GeoJSON]({% link {{ page.version.version }}/geojson.md %})
- [SRID 4326 - longitude and latitude]({% link {{ page.version.version }}/srid-4326.md %})
- [Introducing Distributed Spatial Data in CockroachDB](https://www.cockroachlabs.com/blog/spatial-data/) (blog post)
- [Using GeoServer with CockroachDB]({% link {{ page.version.version }}/geoserver.md %})
