---
title: ST_Intersects
summary: ST_Intersects(A, B) returns true if any point in shape A lies within shape B.
toc: true
has_prefixed_variant: true
---

Given two shapes _A_ and _B_, `ST_Intersects(A, B)` returns `true` if the shapes share any of the same space -- that is, if any point in the set that comprises _A_ is also a member of the set of points that make up _B_.

`ST_Intersects` works on the following data types:

- [`GEOMETRY`](spatial-glossary.html#geometry)
- [`GEOGRAPHY`](spatial-glossary.html#geography)

{% if page.has_prefixed_variant %}
{{site.data.alerts.callout_info}}
`{{page.title}}` will attempt to use any available [spatial index](spatial-indexes.html) to speed up its operation.  Use the prefixed variant `_{{page.title}}` if you do not want any spatial indexes to be used.
{{site.data.alerts.end}}
{% endif %}

{{site.data.alerts.callout_info}}
This function is the inverse of [`ST_Disjoint`](st_disjoint.html).
{{site.data.alerts.end}}

## Examples

{% include {{page.version.version}}/misc/geojson_geometry_note.md %}

### True

In this example, `{{page.title}}` returns `true` because:

- The shapes share some of the same space -- that is, there are Points in the set that comprises Polygon _A_ that are also members of Polygon _B_.

{% include copy-clipboard.html %}
~~~ sql
SELECT st_intersects(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))'), st_geomfromtext('SRID=4326;POLYGON((-84.191605 39.758949, -75.165222 39.952583, -78.878738 42.880230, -84.191605 39.758949))'));
~~~

~~~
 st_intersects
---------------
     true

(1 row)
~~~

<img src="{{ 'images/v21.1/geospatial/st_intersects_true.png' | relative_url }}" alt="ST_Intersects - true" style="border:1px solid #eee;max-width:100%" />

### False

In this example, `{{page.title}}` returns `false` because:

- The shapes do not share any of the same space -- that is, there are no Points in the set that comprises Polygon _A_ that are also members of Polygon _B_.

{% include copy-clipboard.html %}
~~~ sql
SELECT st_intersects(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))'), st_geomfromtext('SRID=4326;POLYGON((-79.995888 40.440624,-74.666728 40.358244, -76.5 42.443333, -79.995888 40.440624))'));
~~~

~~~
 st_intersects
---------------
     false
(1 row)
~~~

<img src="{{ 'images/v21.1/geospatial/st_intersects_false.png' | relative_url }}" alt="ST_Intersects - false" style="border:1px solid #eee;max-width:100%" />

## See also

- [Working with Spatial Data](spatial-data.html)
- [Spatial and GIS Glossary of Terms](spatial-glossary.html)
- [Spatial indexes](spatial-indexes.html)
- [Spatial functions](functions-and-operators.html#spatial-functions)
- [`ST_Covers`](st_covers.html)
- [`ST_CoveredBy`](st_coveredby.html)
- [`ST_Contains`](st_contains.html)
- [`ST_Within`](st_within.html)
- [`ST_CoveredBy`](st_coveredby.html)
- [`ST_Covers`](st_covers.html)
- [`ST_Disjoint`](st_disjoint.html)
- [`ST_Equals`](st_equals.html)
- [`ST_Overlaps`](st_overlaps.html)
- [`ST_Touches`](st_touches.html)
- [`ST_ConvexHull`](st_convexhull.html)
- [`ST_Union`](st_union.html)
- [Migrate from Shapefiles](migrate-from-shapefiles.html)
- [Migrate from GeoJSON](migrate-from-geojson.html)
- [Migrate from GeoPackage](migrate-from-geopackage.html)
- [Migrate from OpenStreetMap](migrate-from-openstreetmap.html)
