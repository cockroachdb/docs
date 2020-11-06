---
title: POINT
summary: A POINT is a geometry object; a sizeless location identified by its X and Y coordinates.
toc: true
---

A `POINT` is a sizeless location identified by its X and Y coordinates. These coordinates are then translated according to the current [spatial reference system](spatial-glossary.html#spatial-reference-system) (denoted by an [SRID](spatial-glossary.html#srid)) to determine what the Point "is", or what it "means" relative to the [other spatial objects](spatial-features.html#spatial-objects) (if any) in the data set. 

## Examples

### SQL

A Point can be created in SQL by the `st_point` function.

The statement below creates a Point (using the common [SRID 4326](spatial-glossary.html#srid)).

{% include copy-clipboard.html %}
~~~ sql
SELECT ST_SetSRID(ST_Makepoint(0,0), 4326);
~~~

~~~
                      st_setsrid
------------------------------------------------------
  0101000020E610000000000000000000000000000000000000
(1 row)
~~~

### Well known text

A Point can be created from SQL by calling the `st_geomfromtext` function on a Point definition expressed in the [Well Known Text (WKT)](spatial-glossary.html#wkt) format as shown below.

{% include copy-clipboard.html %}
~~~ sql
SELECT ST_GeomFromText('POINT(0 0)');
~~~

~~~
               st_geomfromtext
----------------------------------------------
  010100000000000000000000000000000000000000
(1 row)
~~~

## See also

- [Spatial objects](spatial-features.html#spatial-objects)
- [LINESTRING](linestring.html)
- [POLYGON](polygon.html)
- [MULTIPOINT](multipoint.html)
- [MULTILINESTRING](multilinestring.html)
- [MULTIPOLYGON](multipolygon.html)
- [GEOMETRYCOLLECTION](geometrycollection.html)
