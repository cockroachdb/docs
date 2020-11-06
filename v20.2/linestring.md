---
title: LINESTRING
summary: A LINESTRING is a collection of POINTs joined into a line.
toc: true
---

A `LINESTRING` is a collection of [Points](point.html) that are "strung together" into one geometric object. A LineString can be used to represent an arbitrary curve, such as a [Bézier curve](https://en.wikipedia.org/wiki/Bézier_curve).  In practice, this means that LineStrings are useful for representing real-world objects such as roads and rivers.

The coordinates of each Point that makes up the LineString are translated according to the current [spatial reference system](spatial-glossary.html#spatial-reference-system) (denoted by an [SRID](spatial-glossary.html#srid)) to determine what the Point "is", or what it "means" relative to the [other spatial objects](spatial-features.html#spatial-objects) (if any) in the data set.

## Examples

A LineString can be created from SQL by calling the `st_geomfromtext` function on a LineString definition expressed in the [Well Known Text (WKT)](spatial-glossary.html#wkt) format as shown below.

{% include copy-clipboard.html %}
~~~ sql
SELECT ST_GeomFromText('LINESTRING(0 0, 1440 900)');
~~~

~~~
                                   st_geomfromtext
--------------------------------------------------------------------------------------
  0102000000020000000000000000000000000000000000000000000000008096400000000000208C40
(1 row)
~~~

You can also make a LineString using the [aggregate function form](functions-and-operators.html#aggregate-functions) of `st_makeline`.

## See also

- [Spatial objects](spatial-features.html#spatial-objects)
- [POINT](point.html)
- [POLYGON](polygon.html)
- [MULTIPOINT](multipoint.html)
- [MULTILINESTRING](multilinestring.html)
- [MULTIPOLYGON](multipolygon.html)
- [GEOMETRYCOLLECTION](geometrycollection.html)
