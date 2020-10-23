---
title: POLYGON
summary: A POLYGON
toc: true
---

A `POLYGON` is a shape with a closed exterior that is made up of lines. Polygons can also contain holes.  Polygons are often used to represent areas such as countries, states, or municipalities.

The coordinates of each Point and line that make up the Polygon are translated according to the current [spatial reference system](spatial-glossary.html#spatial-reference-system) (denoted by an [SRID](spatial-glossary.html#srid)) to determine what the point "is", or what it "means" relative to the [other spatial objects](spatial-features.html#spatial-objects) (if any) in the data set.

## Examples

### Well known text

A Polygon can be created from SQL by calling the `st_geomfromtext` function on a LineString definition expressed in the [Well Known Text (WKT)](spatial-glossary.html#wkt) format as shown below.

{% include copy-clipboard.html %}
~~~ sql
SELECT ST_GeomFromText('POLYGON((0 0, 0 1024, 1024 1024, 1024 0, 0 0))');
~~~

~~~
                                                                                       st_geomfromtext
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  010300000001000000050000000000000000000000000000000000000000000000000000000000000000009040000000000000904000000000000090400000000000009040000000000000000000000000000000000000000000000000
(1 row)
~~~

### Polygons with holes

To represent a polygon with holes in [WKT](spatial-glossary.html#wkt), add one or more additional lists of coordinates that define the boundaries of the holes as shown below:

{% include copy-clipboard.html %}
~~~ sql
SELECT ST_GeomFromText('POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902), (-87.623177 41.881832, -90.199402 38.627003, -82.446732 38.413651, -87.623177 41.881832))');
~~~

~~~
                                                                                                                                           st_geomfromtext
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  010300000002000000040000006FF1F09E03FA55C0DFDFA0BDFA844540545227A089FF57C0791EDC9DB513424064B14D2A1AED52C0CCCF0D4DD90942406FF1F09E03FA55C0DFDFA0BDFA84454004000000A4A7C821E2E755C07C48F8DEDFF0444073309B00C38C56C038BF61A241504340E884D041979C54C0967A1684F2344340A4A7C821E2E755C07C48F8DEDFF04440
(1 row)
~~~

### Using a SQL function

You can also use the `st_makepolygon` function on a LineString that defines the outer boundary of the Polygon, e.g.:

{% include copy-clipboard.html %}
~~~ sql
SELECT ST_MakePolygon('LINESTRING(0 0, 0 1024, 1024 1024, 1024 0, 0 0)');
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
