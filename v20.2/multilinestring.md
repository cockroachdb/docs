---
title: MULTILINESTRING
summary: A MULTILINESTRING is a collection of LINESTRINGs.
toc: true
---

A `MULTILINESTRING` is a collection of [LineStrings](linestring.html).  MultiLineStrings are useful for gathering a group of LineStrings into one geometry. For example, you may want to gather the LineStrings denoting all of the roads in a particular municipality.

## Examples

### Well known text

A MultiLineString can be created from SQL by calling the `st_geomfromtext` function on a MultiLineString definition expressed in the [Well Known Text (WKT)](spatial-glossary.html#wkt) format.

{% include copy-clipboard.html %}
~~~ sql
SELECT ST_GeomFromText('MULTILINESTRING((0 0, 1440 900), (800 600, 200 400))');
~~~

~~~
                                                                                     st_geomfromtext
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  0105000000020000000102000000020000000000000000000000000000000000000000000000008096400000000000208C4001020000000200000000000000000089400000000000C0824000000000000069400000000000007940
(1 row)
~~~

### SQL

A MultiLineString can be created from SQL by calling an aggregate function such as `ST_Collect` or [`ST_Union`](st_union.html) on a column that contains [LineString](linestring.html) geometries.  In the example below, we will build a MultiLineString from several LineStrings.

First, insert the LineStrings:

{% include copy-clipboard.html %}
~~~ sql
CREATE TABLE tmp_linestrings (id INT8 default unique_rowid(), geom GEOMETRY);

INSERT INTO tmp_linestrings (geom)
VALUES
(st_geomfromtext('SRID=4326;LINESTRING(-88.243385 40.116421, -87.906471 43.038902, -95.992775 36.153980)')),
(st_geomfromtext('SRID=4326;LINESTRING(-75.704722 36.076944, -95.992775 36.153980, -87.906471 43.038902)')),
(st_geomfromtext('SRID=4326;LINESTRING(-76.8261 42.1727,  -75.6608 41.4102,-73.5422 41.052, -73.929 41.707,  -76.8261 42.1727)'));
~~~

Next, build a MultiLineString from the individual [LineStrings](linestring.html) using `ST_Collect`, and check the output with `ST_GeometryType` to verify that it is indeed a MultiLineString:

{% include copy-clipboard.html %}
~~~ sql
SELECT ST_GeometryType(st_collect(geom)) AS output FROM tmp_linestrings;
~~~

~~~
        output
----------------------
  ST_MultiLineString
(1 row)
~~~

Finally, drop the temporary table:

{% include copy-clipboard.html %}
~~~ sql
DROP TABLE tmp_linestrings;
~~~

## See also

- [Spatial objects](spatial-features.html#spatial-objects)
- [POINT](point.html)
- [LINESTRING](linestring.html)
- [POLYGON](polygon.html)
- [MULTIPOINT](multipoint.html)
- [MULTIPOLYGON](multipolygon.html)
- [GEOMETRYCOLLECTION](geometrycollection.html)
