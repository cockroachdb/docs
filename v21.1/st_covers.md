---
title: ST_Covers
summary: ST_Covers(A, B) returns true if no point in shape B lies outside of shape A
toc: true
has_prefixed_variant: true
---

Given two shapes _A_ and _B_, predicate function `ST_Covers(A, B)` returns `true` if no point in _B_ lies outside of shape _A_.  Otherwise, it returns `false`.

In other words, shape _A_ must completely cover every point in _B_.

This behavior is similar to [`ST_Contains`](st_contains.html), except that the criteria for `ST_Contains` are more exacting, and therefore some pairs of shapes will be accepted by this function that would be rejected by `ST_Contains`.

`ST_Covers` works on the following data types:

- [`GEOMETRY`](spatial-glossary.html#geometry)
- [`GEOGRAPHY`](spatial-glossary.html#geography)

{% if page.has_prefixed_variant %}
{{site.data.alerts.callout_info}}
`{{page.title}}` will attempt to use any available [spatial index](spatial-indexes.html) to speed up its operation.  Use the prefixed variant `_{{page.title}}` if you do not want any spatial indexes to be used.
{{site.data.alerts.end}}
{% endif %}

{{site.data.alerts.callout_info}}
This function is the inverse of [`ST_CoveredBy`](st_coveredby.html).
{{site.data.alerts.end}}

## Examples

{% include {{page.version.version}}/misc/geojson_geometry_note.md %}

### True

In this example, `{{page.title}}` returns `true` because:

- No Point in the smaller Polygon _B_ lies outside of the larger Polygon _A_.

{% include copy-clipboard.html %}
~~~ sql
SELECT ST_Covers(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))'), st_geomfromtext('SRID=4326;POLYGON((-87.623177 41.881832, -90.199402 38.627003, -82.446732 38.413651, -87.623177 41.881832))'));
~~~

~~~
   st_covers
---------------
     true

(1 row)
~~~

<img src="{{ 'images/v21.1/geospatial/st_covers_true.png' | relative_url }}" alt="ST_Covers - true" style="border:1px solid #eee;max-width:100%" />

### False

In this example, `{{page.title}}` returns `false` because:

- Many Points in the smaller Polygon _B_ lie outside of the larger Polygon _A_.

{% include copy-clipboard.html %}
~~~ sql
SELECT ST_Covers(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))'), st_geomfromtext('SRID=4326;POLYGON((-84.191605 39.758949, -75.165222 39.952583, -78.878738 42.880230, -84.191605 39.758949))'));
~~~

~~~
   st_covers
---------------
     false
(1 row)
~~~

<img src="{{ 'images/v21.1/geospatial/st_covers_false.png' | relative_url }}" alt="ST_Covers - false" style="border:1px solid #eee;max-width:100%" />

## See also

- [Working with Spatial Data](spatial-data.html)
- [Spatial and GIS Glossary of Terms](spatial-glossary.html)
- [Spatial indexes](spatial-indexes.html)
- [Spatial functions](functions-and-operators.html#spatial-functions)
+ [`ST_CoveredBy`](st_coveredby.html)
- [`ST_Contains`](st_contains.html)
- [`ST_Within`](st_within.html)
- [`ST_Intersects`](st_intersects.html)
- [`ST_CoveredBy`](st_coveredby.html)
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
