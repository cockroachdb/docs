---
title: LINESTRING
summary: A LINESTRING is a collection of POINTs joined into a line.
toc: true
docs_area: reference.sql
---

A `LINESTRING` is a collection of [Points]({% link {{ page.version.version }}/point.md %}) that are "strung together" into one geometric object. A LineString can be used to represent an arbitrary curve, such as a [Bézier curve](https://wikipedia.org/wiki/Bézier_curve).  In practice, this means that LineStrings are useful for representing real-world objects such as roads and rivers.

The coordinates of each Point that makes up the LineString are translated according to the current [spatial reference system]({% link {{ page.version.version }}/architecture/glossary.md %}#spatial-reference-system) (denoted by an [SRID]({% link {{ page.version.version }}/architecture/glossary.md %}#srid)) to determine what the Point "is", or what it "means" relative to the [other spatial objects]({% link {{ page.version.version }}/spatial-data-overview.md %}#spatial-objects) (if any) in the data set.

{% include {{page.version.version}}/spatial/zmcoords.md %}

## Examples

A LineString can be created from SQL by calling the `st_geomfromtext` function on a LineString definition expressed in the [Well Known Text (WKT)]({% link {{ page.version.version }}/architecture/glossary.md %}#wkt) format as shown below.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT ST_GeomFromText('LINESTRING(0 0, 1440 900)');
~~~

~~~
                                   st_geomfromtext
--------------------------------------------------------------------------------------
  0102000000020000000000000000000000000000000000000000000000008096400000000000208C40
(1 row)
~~~

You can also make a LineString using the [aggregate function form]({% link {{ page.version.version }}/functions-and-operators.md %}#aggregate-functions) of `st_makeline`.

## See also

- [Spatial tutorial]({% link {{ page.version.version }}/spatial-tutorial.md %})
- [Spatial objects]({% link {{ page.version.version }}/spatial-data-overview.md %}#spatial-objects)
- [POINT]({% link {{ page.version.version }}/point.md %})
- [POLYGON]({% link {{ page.version.version }}/polygon.md %})
- [MULTIPOINT]({% link {{ page.version.version }}/multipoint.md %})
- [MULTILINESTRING]({% link {{ page.version.version }}/multilinestring.md %})
- [MULTIPOLYGON]({% link {{ page.version.version }}/multipolygon.md %})
- [GEOMETRYCOLLECTION]({% link {{ page.version.version }}/geometrycollection.md %})
- [Using GeoServer with CockroachDB]({% link {{ page.version.version }}/geoserver.md %})
