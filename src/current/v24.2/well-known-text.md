---
title: Well Known Text
summary: The Well Known Text format provides a text representation of a geometric shape.
toc: true
docs_area: reference.sql
---

The Well Known Text format (hereafter _WKT_) provides a text representation of a geometric shape.  It can be used to:

- Build instances of various shapes (e.g., using `ST_MakePolygon` on a Linestring).
- Convert existing shapes to a text representation for ease of reading.

Each shape in WKT has a _tag_ which says what it is, usually followed by a list of coordinates.  For example, here are some common tags:

- `POINT(...)`
- `LINESTRING(...)`
- `POLYGON((...))`

WKT is technically case insensitive, but is sometimes displayed using "CamelCase" for easier reading.  For example, one can represent a MultiPolygon as either of:

- `MULTIPOLYGON(...)`
- `MultiPolygon(...)`

When a shape is made up of homogeneous subcomponents, such as a polygon made up of various points, the subcomponents do not need to have their own tags. For example:

`LINESTRING(-88.243385 40.116421, -87.906471 43.038902, -95.992775 36.153980)`

<a name="ewkt"></a>

Shapes expressed in WKT can have an [SRID]({% link {{ page.version.version }}/architecture/glossary.md %}) prepended to the shape and followed by a semicolon, in the form `SRID=123;TAG(...)`.  The format is known as Extended Well Known Text (_EWKT_); it is the same as WKT, with an [SRID]({% link {{ page.version.version }}/architecture/glossary.md %}#srid) representation prepended to the data structure.

For example, below is a polygon representing a geometry that uses [SRID 4326]({% link {{ page.version.version }}/srid-4326.md %}), which is used to represent latitude and longitude coordinates on the Earth as defined in the [WGS84]({% link {{ page.version.version }}/architecture/glossary.md %}#wgs84) standard:

`SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))`

{{site.data.alerts.callout_info}}
For more detailed information about the Well Known Text format, see [the OGC specification for WKT](http://docs.opengeospatial.org/is/18-010r7/18-010r7.html).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
CockroachDB only supports 2-dimensional geometries.
{{site.data.alerts.end}}

## See also

- [Spatial Data Overview]({% link {{ page.version.version }}/spatial-data-overview.md %})
- [Spatial tutorial]({% link {{ page.version.version }}/spatial-tutorial.md %})
- [Spatial indexes]({% link {{ page.version.version }}/spatial-indexes.md %})
- [Spatial and GIS Glossary of Terms]({% link {{ page.version.version }}/architecture/glossary.md %})
- [Geographic information — Well-known text representation of coordinate reference systems](http://www.opengis.net/doc/is/wkt-crs/2.0.6)
- [OpenGIS Implementation Specification for Geographic information - Simple feature access - Part 1: Common architecture](https://portal.opengeospatial.org/files/?artifact_id=25355)
- [Well known binary]({% link {{ page.version.version }}/well-known-binary.md %})
- [GeoJSON]({% link {{ page.version.version }}/geojson.md %})
- [SRID 4326 - longitude and latitude]({% link {{ page.version.version }}/srid-4326.md %})
- [Introducing Distributed Spatial Data in Free, Open Source CockroachDB](https://www.cockroachlabs.com/blog/spatial-data/) (blog post)
- [Using GeoServer with CockroachDB]({% link {{ page.version.version }}/geoserver.md %})
