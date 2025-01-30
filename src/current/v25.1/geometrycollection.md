---
title: GEOMETRYCOLLECTION
summary: A GEOMETRYCOLLECTION is used for gathering one or more of the spatial object types into a group.
toc: true
docs_area: reference.sql
---

A `GEOMETRYCOLLECTION` is a collection of heterogeneous [spatial objects]({{ page.version.version }}/spatial-data-overview.md#spatial-objects), such as [Points]({{ page.version.version }}/point.md), [LineStrings]({{ page.version.version }}/linestring.md), [Polygons]({{ page.version.version }}/polygon.md), or other `GEOMETRYCOLLECTION`s.  It provides a way of referring to a group of spatial objects as one "thing" so that you can operate on it/them more conveniently using various SQL functions.


## Examples

A GeometryCollection can be created from SQL by calling the `st_geomfromtext` function on a GeometryCollection definition expressed in the [Well Known Text (WKT)]({{ page.version.version }}/architecture/glossary.md#wkt) format as shown below.

~~~ sql
SELECT ST_GeomFromText('GEOMETRYCOLLECTION(POINT(0 0), LINESTRING(0 0, 1440 900), POLYGON((0 0, 0 1024, 1024 1024, 1024 0, 0 0)))');
~~~

~~~
                                                                                                                                                              st_geomfromtext
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  0107000000030000000101000000000000000000000000000000000000000102000000020000000000000000000000000000000000000000000000008096400000000000208C40010300000001000000050000000000000000000000000000000000000000000000000000000000000000009040000000000000904000000000000090400000000000009040000000000000000000000000000000000000000000000000
(1 row)
~~~

## See also

- [Spatial tutorial]({{ page.version.version }}/spatial-tutorial.md)
- [Spatial objects]({{ page.version.version }}/spatial-data-overview.md#spatial-objects)
- [POINT]({{ page.version.version }}/point.md)
- [LINESTRING]({{ page.version.version }}/linestring.md)
- [POLYGON]({{ page.version.version }}/polygon.md)
- [MULTIPOINT]({{ page.version.version }}/multipoint.md)
- [MULTILINESTRING]({{ page.version.version }}/multilinestring.md)
- [MULTIPOLYGON]({{ page.version.version }}/multipolygon.md)
- [Using GeoServer with CockroachDB]({{ page.version.version }}/geoserver.md)