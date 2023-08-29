---
title: MULTILINESTRING
summary: The spatial MULTILINESTRING object is a collection of LINESTRINGs.
toc: true
docs_area: reference.sql
---

A `MULTILINESTRING` is a collection of [LineStrings]({% link {{ page.version.version }}/linestring.md %}).  MultiLineStrings are useful for gathering a group of LineStrings into one geometry. For example, you may want to gather the LineStrings denoting all of the roads in a particular municipality.

{% include {{page.version.version}}/spatial/zmcoords.md %}

## Examples

### Well known text

A MultiLineString can be created from SQL by calling the `st_geomfromtext` function on a MultiLineString definition expressed in the [Well Known Text (WKT)]({% link {{ page.version.version }}/architecture/glossary.md %}#wkt) format.

{% include_cached copy-clipboard.html %}
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

A MultiLineString can be created from SQL by calling an aggregate function such as `ST_Collect` or [`ST_Union`]({% link {{ page.version.version }}/st_union.md %}) on a column that contains [LineString]({% link {{ page.version.version }}/linestring.md %}) geometries.  In the example below, we will build a MultiLineString from several LineStrings.

1. Insert the LineStrings:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE tmp_linestrings (id INT8 default unique_rowid(), geom GEOMETRY);

    INSERT INTO tmp_linestrings (geom)
    VALUES
    (st_geomfromtext('SRID=4326;LINESTRING(-88.243385 40.116421, -87.906471 43.038902, -95.992775 36.153980)')),
    (st_geomfromtext('SRID=4326;LINESTRING(-75.704722 36.076944, -95.992775 36.153980, -87.906471 43.038902)')),
    (st_geomfromtext('SRID=4326;LINESTRING(-76.8261 42.1727,  -75.6608 41.4102,-73.5422 41.052, -73.929 41.707,  -76.8261 42.1727)'));
    ~~~

1. Build a MultiLineString from the individual [LineStrings]({% link {{ page.version.version }}/linestring.md %}) using `ST_Collect`, and check the output with `ST_GeometryType` to verify that it is indeed a MultiLineString:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT ST_GeometryType(st_collect(geom)) AS output FROM tmp_linestrings;
    ~~~

    ~~~
            output
    ----------------------
      ST_MultiLineString
    (1 row)
    ~~~

1. Drop the temporary table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    DROP TABLE tmp_linestrings;
    ~~~

## See also

- [Spatial tutorial]({% link {{ page.version.version }}/spatial-tutorial.md %})
- [Spatial objects]({% link {{ page.version.version }}/spatial-data-overview.md %}#spatial-objects)
- [POINT]({% link {{ page.version.version }}/point.md %})
- [LINESTRING]({% link {{ page.version.version }}/linestring.md %})
- [POLYGON]({% link {{ page.version.version }}/polygon.md %})
- [MULTIPOINT]({% link {{ page.version.version }}/multipoint.md %})
- [MULTIPOLYGON]({% link {{ page.version.version }}/multipolygon.md %})
- [GEOMETRYCOLLECTION]({% link {{ page.version.version }}/geometrycollection.md %})
- [Using GeoServer with CockroachDB]({% link {{ page.version.version }}/geoserver.md %})
