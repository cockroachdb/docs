---
title: ST_Equals
summary: ST_Equals(A, B) returns true if every point that makes up shape A is also part of shape B, and vice versa.
toc: true
has_prefixed_variant: true
docs_area: reference.sql
---

Given two shapes _A_ and _B_, `ST_Equals(A, B)` returns `true` if every point in the set of points that make up _A_ is also in _B_, and if every point in the set of points that make up _B_ is also in _A_.  The ordering of the points in _A_ and _B_ may differ, but they must be made up of equivalent sets.

Another way of describing `ST_Equals(A, B)` is that it will return `true` if both `ST_Within(A, B)` and `ST_Within(B, A)` also return `true`.

`ST_Equals` works on the following data types:

- [`GEOMETRY`]({% link {{ page.version.version }}/architecture/glossary.md %}#geometry)

{% if page.has_prefixed_variant %}
{{site.data.alerts.callout_info}}
`{{page.title}}` will attempt to use any available [spatial index]({% link {{ page.version.version }}/spatial-indexes.md %}) to speed up its operation.  Use the prefixed variant `_{{page.title}}` if you do not want any spatial indexes to be used.
{{site.data.alerts.end}}
{% endif %}

## Examples

{% include {{page.version.version}}/misc/geojson_geometry_note.md %}

### True

In this example, `{{page.title}}` returns `true` because:

- Every Point in the set of Points that make up Polygon _A_ is also in Polygon _B_, and  every Point in the set of Points that make up Polygon _B_ is also in Polygon _A_

As mentioned above, the ordering of the points in _A_ and _B_ does not matter.  Below, there are two triangles with the same vertices, which are ordered differently.  In the screenshot, one triangle is drawn in yellow, and the other blue.  The blue and yellow strokes of the two separate triangles' boundaries are visible. Because the images are overlaid on each other, the yellow and blue combine to make part of the exterior outline of the image a green color.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT st_equals(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))'), st_geomfromtext('SRID=4326;POLYGON((-95.992775 36.153980, -87.906471 43.038902, -75.704722 36.076944, -95.992775 36.153980))'));
~~~

~~~
   st_equals
---------------
     true

(1 row)
~~~

<img src="{{ 'images/v23.2/geospatial/st_equals_true.png' | relative_url }}" alt="ST_Equals - true" style="border:1px solid #eee;max-width:100%" />

### False

In this example, `{{page.title}}` returns `false` because:

- It's obvious that not every Point that makes up the set of Points in Polygon _A_ is not also in Polygon _B_.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT st_equals(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))'), st_geomfromtext('SRID=4326;POLYGON((-84.191605 39.758949, -75.165222 39.952583, -78.878738 42.880230, -84.191605 39.758949))'));
~~~

~~~
   st_equals
---------------
     false
(1 row)
~~~

<img src="{{ 'images/v23.2/geospatial/st_equals_false.png' | relative_url }}" alt="ST_Equals - false" style="border:1px solid #eee;max-width:100%" />

## See also

- [Export Spatial Data](export-spatial-data.html)
- [Spatial tutorial]({% link {{ page.version.version }}/spatial-tutorial.md %})
- [Spatial and GIS Glossary of Terms]({% link {{ page.version.version }}/architecture/glossary.md %})
- [Spatial indexes]({% link {{ page.version.version }}/spatial-indexes.md %})
- [Spatial functions]({% link {{ page.version.version }}/functions-and-operators.md %}#spatial-functions)
- [`ST_Covers`]({% link {{ page.version.version }}/st_covers.md %})
- [`ST_CoveredBy`]({% link {{ page.version.version }}/st_coveredby.md %})
- [`ST_Contains`]({% link {{ page.version.version }}/st_contains.md %})
- [`ST_Within`]({% link {{ page.version.version }}/st_within.md %})
- [`ST_Intersects`]({% link {{ page.version.version }}/st_intersects.md %})
- [`ST_CoveredBy`]({% link {{ page.version.version }}/st_coveredby.md %})
- [`ST_Covers`]({% link {{ page.version.version }}/st_covers.md %})
- [`ST_Disjoint`]({% link {{ page.version.version }}/st_disjoint.md %})
- [`ST_Overlaps`]({% link {{ page.version.version }}/st_overlaps.md %})
- [`ST_Touches`]({% link {{ page.version.version }}/st_touches.md %})
- [`ST_ConvexHull`]({% link {{ page.version.version }}/st_convexhull.md %})
- [`ST_Union`]({% link {{ page.version.version }}/st_union.md %})
- [Migrate from Shapefiles]({% link {{ page.version.version }}/migrate-from-shapefiles.md %})
- [Migrate from GeoJSON]({% link {{ page.version.version }}/migrate-from-geojson.md %})
- [Migrate from GeoPackage]({% link {{ page.version.version }}/migrate-from-geopackage.md %})
- [Migrate from OpenStreetMap]({% link {{ page.version.version }}/migrate-from-openstreetmap.md %})
- [Introducing Distributed Spatial Data in CockroachDB](https://www.cockroachlabs.com/blog/spatial-data/) (blog post)
- [Using GeoServer with CockroachDB]({% link {{ page.version.version }}/geoserver.md %})
