---
title: GEOMETRYCOLLECTION
summary: A GEOMETRYCOLLECTION is used for gathering one or more of the spatial object types into a group.
toc: true
docs_area: reference.sql
---

A `GEOMETRYCOLLECTION` is a collection of heterogeneous [spatial objects]({% link {{ page.version.version }}/spatial-data-overview.md %}#spatial-objects), such as [Points]({% link {{ page.version.version }}/point.md %}), [LineStrings]({% link {{ page.version.version }}/linestring.md %}), [Polygons]({% link {{ page.version.version }}/polygon.md %}), or other `GEOMETRYCOLLECTION`s.  It provides a way of referring to a group of spatial objects as one "thing" so that you can operate on it/them more conveniently using various SQL functions.

{% include {{page.version.version}}/spatial/zmcoords.md %}

## Examples

A GeometryCollection can be created from SQL by calling the `st_geomfromtext` function on a GeometryCollection definition expressed in the [Well Known Text (WKT)]({% link {{ page.version.version }}/architecture/glossary.md %}#wkt) format as shown below.

{% include_cached copy-clipboard.html %}
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

- [Spatial tutorial]({% link {{ page.version.version }}/spatial-tutorial.md %})
- [Spatial objects]({% link {{ page.version.version }}/spatial-data-overview.md %}#spatial-objects)
- [POINT]({% link {{ page.version.version }}/point.md %})
- [LINESTRING]({% link {{ page.version.version }}/linestring.md %})
- [POLYGON]({% link {{ page.version.version }}/polygon.md %})
- [MULTIPOINT]({% link {{ page.version.version }}/multipoint.md %})
- [MULTILINESTRING]({% link {{ page.version.version }}/multilinestring.md %})
- [MULTIPOLYGON]({% link {{ page.version.version }}/multipolygon.md %})
- [Using GeoServer with CockroachDB]({% link {{ page.version.version }}/geoserver.md %})
