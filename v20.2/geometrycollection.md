---
title: GEOMETRYCOLLECTION
summary: A GEOMETRYCOLLECTION is used for gathering one or more of the spatial object types into a group.
toc: true
---

A `GEOMETRYCOLLECTION` is a collection of heterogeneous [spatial objects](spatial-features.html#spatial-objects), such as [Points](point.html), [LineStrings](linestring.html), [Polygons](polygon.html), or other `GEOMETRYCOLLECTION`s.  It provides a way of referring to a group of spatial objects as one "thing" so that you can operate on it/them more conveniently using various SQL functions.

## Examples

A GeometryCollection can be created from SQL by calling the `st_geomfromtext` function on a GeometryCollection definition expressed in the [Well Known Text (WKT)](spatial-glossary.html#wkt) format as shown below.

{% include copy-clipboard.html %}
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

- [Spatial objects](spatial-features.html#spatial-objects)
- [POINT](point.html)
- [LINESTRING](linestring.html)
- [POLYGON](polygon.html)
- [MULTIPOINT](multipoint.html)
- [MULTILINESTRING](multilinestring.html)
- [MULTIPOLYGON](multipolygon.html)
