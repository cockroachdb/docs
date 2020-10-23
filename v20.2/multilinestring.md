---
title: MULTILINESTRING
summary: A MULTILINESTRING is a collection of LINESTRINGs.
toc: true
---

A `MULTILINESTRING` is a collection of [Linestrings](linestring.html).  MultiLinestrings are useful for gathering a group of Linestrings into one geometry: for example, you may want to gather the Linestrings denoting all of the roads in a particular municipality.

## Examples

A MultiLinestring can be created from SQL by calling the `st_geomfromtext` function on a MultiLinestring definition expressed in the [Well Known Text (WKT)](spatial-glossary.html#wkt) format.

{% include copy-clipboard.html %}
~~~ sql
SELECT st_geomfromtext('MULTILINESTRING((0 0, 1440 900), (800 600, 200 400))');
~~~

~~~
                                                                                     st_geomfromtext
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  0105000000020000000102000000020000000000000000000000000000000000000000000000008096400000000000208C4001020000000200000000000000000089400000000000C0824000000000000069400000000000007940
(1 row)
~~~

## See also

- [Spatial objects](spatial-features.html#spatial-objects)
- [POINT](point.html)
- [LINESTRING](linestring.html)
- [POLYGON](polygon.html)
- [MULTIPOINT](multipoint.html)
- [MULTIPOLYGON](multipolygon.html)
- [GEOMETRYCOLLECTION](geometrycollection.html)
