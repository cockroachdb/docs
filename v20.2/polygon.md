---
title: POLYGON
summary: A POLYGON
toc: true
---

A `POLYGON` is a closed shape that can be made up of straight or curved lines. It can be thought of as a "closed" [Linestring](linestring.html). Irregular Polygons can take on almost any arbitrary shape. Common regular Polygons include: squares, rectangles, hexagons, and so forth. For more information about regular Polygons, see the ['Regular polygon' Wikipedia article](https://en.wikipedia.org/wiki/Regular_polygon).

The coordinates of each Point and line that make up the Polygon are translated according to the current [spatial reference system](spatial-glossary.html#spatial-reference-system) (denoted by an [SRID](spatial-glossary.html#srid)) to determine what the point "is", or what it "means" relative to the [other spatial objects](spatial-features.html#spatial-objects) (if any) in the data set.

## Examples

A Polygon can be created from SQL by calling the `st_geomfromtext` function on a Linestring definition expressed in the [Well Known Text (WKT)](spatial-glossary.html#wkt) format as shown below.

{% include copy-clipboard.html %}
~~~ sql
SELECT st_geomfromtext('POLYGON((0 0, 0 1024, 1024 1024, 1024 0, 0 0))');
~~~

~~~
                                                                                       st_geomfromtext
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  010300000001000000050000000000000000000000000000000000000000000000000000000000000000009040000000000000904000000000000090400000000000009040000000000000000000000000000000000000000000000000
(1 row)
~~~

You can also use the `st_makepolygon` function on a Linestring that defines the outer boundary of the Polygon, e.g.:

{% include copy-clipboard.html %}
~~~ sql
SELECT st_makepolygon('LINESTRING(0 0, 0 1024, 1024 1024, 1024 0, 0 0)');
~~~

~~~
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  010300000001000000050000000000000000000000000000000000000000000000000000000000000000009040000000000000904000000000000090400000000000009040000000000000000000000000000000000000000000000000
(1 row)
~~~

## See also

- [Spatial objects](spatial-features.html#spatial-objects)
- [POINT](point.html)
- [LINESTRING](linestring.html)
- [MULTIPOINT](multipoint.html)
- [MULTILINESTRING](multilinestring.html)
- [MULTIPOLYGON](multipolygon.html)
- [GEOMETRYCOLLECTION](geometrycollection.html)
