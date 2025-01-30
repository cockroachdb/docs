---
title: ST_Contains
summary: ST_Contains(A, B) returns true if no point in shape B lies outside of shape A, and at least one point in the interior of B lies in the interior of A.
toc: true
has_prefixed_variant: true
docs_area: reference.sql
---

Given two shapes _A_ and _B_, the predicate function `ST_Contains(A, B)` returns `true` if:

- No point in _B_ lies outside of shape _A_, and
- At least one point in the interior of _B_ lies in the interior of _A_.

In other words, the exterior of shape _A_ must not include any point in _B_, and one or more points of _B_'s interior must lie in the interior of _A_.

This behavior is similar to [`ST_Covers`]({{ page.version.version }}/st_covers.md), except that the criteria are more exacting, and therefore some pairs of shapes will be rejected by this function that would be accepted by `ST_Covers`.

`ST_Contains` works on the following data types:

- [`GEOMETRY`]({{ page.version.version }}/architecture/glossary.md#geometry)

{% if page.has_prefixed_variant %}
{{site.data.alerts.callout_info}}
`{{page.title}}` will attempt to use any available [spatial index]({{ page.version.version }}/spatial-indexes.md) to speed up its operation.  Use the prefixed variant `_{{page.title}}` if you do not want any spatial indexes to be used.
{{site.data.alerts.end}}
{% endif %}

{{site.data.alerts.callout_info}}
This function is the inverse of [`ST_Within`]({{ page.version.version }}/st_within.md).
{{site.data.alerts.end}}

## Examples


### True

In this example, `{{page.title}}` returns `true` because:

- No point in the LineString _B_ lies outside of the Polygon _A_, and
- At least one point in the interior of _B_ lies in the interior of _A_.

~~~ sql
SELECT ST_Contains(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))'), st_geomfromtext('SRID=4326;LINESTRING(-88.243385 40.116421, -87.906471 43.038902, -95.992775 36.153980)'));
~~~

~~~
  st_contains
---------------
     true

(1 row)
~~~

![ST_Contains - true](/images/v24.2/geospatial/st_contains_true.png)

### False

In this example, `{{page.title}}` returns `false` because:

- At least one point in the interior of LineString _B_ does not lie in the interior of the Polygon _A_.

Note that A query against these shapes with [`ST_Covers`]({{ page.version.version }}/st_covers.md) will return `true`.

~~~ sql
SELECT st_contains(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))'), st_geomfromtext('SRID=4326;LINESTRING( -87.906471 43.038902, -95.992775 36.153980)'));
~~~

~~~
  st_contains
---------------
     false
(1 row)
~~~

![ST_Contains - false](/images/v24.2/geospatial/st_contains_false.png)

## See also

- [Export Spatial Data]({{ page.version.version }}/export-spatial-data.md)
- [Spatial tutorial]({{ page.version.version }}/spatial-tutorial.md)
- [Spatial and GIS Glossary of Terms]({{ page.version.version }}/architecture/glossary.md)
- [Spatial indexes]({{ page.version.version }}/spatial-indexes.md)
- [Spatial functions]({{ page.version.version }}/functions-and-operators.md#spatial-functions)
- [`ST_Covers`]({{ page.version.version }}/st_covers.md)
- [`ST_CoveredBy`]({{ page.version.version }}/st_coveredby.md)
- [`ST_Within`]({{ page.version.version }}/st_within.md)
- [`ST_Intersects`]({{ page.version.version }}/st_intersects.md)
- [`ST_CoveredBy`]({{ page.version.version }}/st_coveredby.md)
- [`ST_Covers`]({{ page.version.version }}/st_covers.md)
- [`ST_Disjoint`]({{ page.version.version }}/st_disjoint.md)
- [`ST_Equals`]({{ page.version.version }}/st_equals.md)
- [`ST_Overlaps`]({{ page.version.version }}/st_overlaps.md)
- [`ST_Touches`]({{ page.version.version }}/st_touches.md)
- [`ST_ConvexHull`]({{ page.version.version }}/st_convexhull.md)
- [`ST_Union`]({{ page.version.version }}/st_union.md)
- [Migrate from Shapefiles]({{ page.version.version }}/migrate-from-shapefiles.md)
- [Migrate from GeoJSON]({{ page.version.version }}/migrate-from-geojson.md)
- [Migrate from GeoPackage]({{ page.version.version }}/migrate-from-geopackage.md)
- [Migrate from OpenStreetMap]({{ page.version.version }}/migrate-from-openstreetmap.md)
- [Introducing Distributed Spatial Data in Free, Open Source CockroachDB](https://www.cockroachlabs.com/blog/spatial-data/) (blog post)
- [Using GeoServer with CockroachDB]({{ page.version.version }}/geoserver.md)