---
title: POINT
summary: A POINT is a geometry object; a sizeless location identified by its X and Y coordinates.
toc: true
docs_area: reference.sql
---

A `POINT` is a sizeless location identified by its X and Y coordinates. These coordinates are then translated according to the current [spatial reference system]({{ page.version.version }}/architecture/glossary.md#spatial-reference-system) (denoted by an [SRID]({{ page.version.version }}/architecture/glossary.md#srid)) to determine what the Point "is", or what it "means" relative to the [other spatial objects]({{ page.version.version }}/spatial-data-overview.md#spatial-objects) (if any) in the data set. 


## Examples

### SQL

A Point can be created in SQL by the `st_point` function.

The statement below creates a Point (using the common [SRID 4326]({{ page.version.version }}/architecture/glossary.md#srid)).

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

A Point can be created from SQL by calling the `st_geomfromtext` function on a Point definition expressed in the [Well Known Text (WKT)]({{ page.version.version }}/architecture/glossary.md#wkt) format as shown below.

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

- [Spatial tutorial]({{ page.version.version }}/spatial-tutorial.md)
- [Spatial objects]({{ page.version.version }}/spatial-data-overview.md#spatial-objects)
- [LINESTRING]({{ page.version.version }}/linestring.md)
- [POLYGON]({{ page.version.version }}/polygon.md)
- [MULTIPOINT]({{ page.version.version }}/multipoint.md)
- [MULTILINESTRING]({{ page.version.version }}/multilinestring.md)
- [MULTIPOLYGON]({{ page.version.version }}/multipolygon.md)
- [GEOMETRYCOLLECTION]({{ page.version.version }}/geometrycollection.md)
- [Using GeoServer with CockroachDB]({{ page.version.version }}/geoserver.md)