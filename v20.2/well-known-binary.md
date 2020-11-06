---
title: Well Known Binary
summary: The Well Known Binary format provides a representation of a geometric shape that is efficient for machine processing and storage.
toc: true
---

The Well Known Binary format (hereafter _WKB_) provides a non-textual, binary representation of a geometric shape. It is used to:

- Allow shapes to be transferred between CockroachDB and a [SQL client](cockroach-sql.html) or [application](build-a-java-app-with-cockroachdb.html).
- Provide a portable binary format that can be read across different platforms.

WKB is obtained by serializing a shape as a sequence of numbers. For more detailed information about the structure of the WKB format, see the diagrams showing WKB integer codes in the [OpenGIS Implementation Specification for Geographic information - Simple feature access - Part 1: Common architecture](https://portal.opengeospatial.org/files/?artifact_id=25355).

<a name="ewkb"></a>

The Extended Well Known Binary (_EWKB_) format is the same as WKB, with an [SRID](spatial-glossary.html#srid) representation prepended to the data structure.

## See also

- [Spatial features](spatial-features.html)
- [Spatial indexes](spatial-indexes.html)
- [Spatial and GIS Glossary of Terms](spatial-glossary.html)
- [OpenGIS Implementation Specification for Geographic information - Simple feature access - Part 1: Common architecture](https://portal.opengeospatial.org/files/?artifact_id=25355)
- [Well known text](well-known-text.html)
- [GeoJSON](geojson.html)
- [SRID 4326 - longitude and latitude](srid-4326.html)
