---
title: MULTIPOLYGON
summary: A MULTIPOLYGON is a collection of POLYGONs.
toc: true
---

A `MULTIPOLYGON` is a collection of [Polygons](polygon.html).  MultiPolygons are useful for gathering a group of Polygons into one geometry. For example, you may want to gather the Polygons denoting a group of properties in a particular municipality.  Another use of MultiPolygons is to represent states or countries that include islands, or that are otherwise made up of non-overlapping shapes.

## Examples

A MultiPolygon can be created from SQL by calling the `st_geomfromtext` function on a MultiPolygon definition expressed in the [Well Known Text (WKT)](spatial-glossary.html#wkt) format.

{% include copy-clipboard.html %}
~~~ sql
SELECT ST_GeomFromText('SRID=4326;MULTIPOLYGON(((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902), (-87.623177 41.881832, -90.199402 38.627003, -82.446732 38.413651, -87.623177 41.881832), (-84.191605 39.758949, -75.165222 39.952583, -78.878738 42.880230, -84.191605 39.758949)))');
~~~

~~~
                                                                                                                                                                                                                            st_geomfromtext
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  0106000020E610000001000000010300000003000000040000006FF1F09E03FA55C0DFDFA0BDFA844540545227A089FF57C0791EDC9DB513424064B14D2A1AED52C0CCCF0D4DD90942406FF1F09E03FA55C0DFDFA0BDFA84454004000000A4A7C821E2E755C07C48F8DEDFF0444073309B00C38C56C038BF61A241504340E884D041979C54C0967A1684F2344340A4A7C821E2E755C07C48F8DEDFF044400400000001309E41430C55C07C2AA73D25E143401AA54BFF92CA52C0DFDC5F3DEEF9434028F04E3E3DB853C0A27A6B60AB70454001309E41430C55C07C2AA73D25E14340
(1 row)
~~~

## See also

- [Spatial objects](spatial-features.html#spatial-objects)
- [POINT](point.html)
- [LINESTRING](linestring.html)
- [POLYGON](polygon.html)
- [MULTIPOINT](multipoint.html)
- [MULTILINESTRING](multilinestring.html)
- [GEOMETRYCOLLECTION](geometrycollection.html)
