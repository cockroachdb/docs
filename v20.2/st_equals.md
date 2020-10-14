---
title: st_equals
summary: st_equals(A, B) returns true if every point that makes up shape A is also part of shape B, and vice versa.
toc: true
has_prefixed_variant: true
---

Given two shapes _A_ and _B_, `st_equals(A, B)` returns `true` if every point in the set of points that make up _A_ is also in _B_, and if every point in the set of points that make up _B_ is also in _A_.  The ordering of the points in _A_ and _B_ may differ, but they must be made up of equivalent sets.

Another way of describing `st_equals(A, B)` is that it will return `true` if both `st_within(A, B)` and `st_within(B, A)` also return `true`.

`st_equals` works on the following data types:

- [`GEOMETRY`](spatial-glossary.html#geometry)

{% if page.has_prefixed_variant %}
{{site.data.alerts.callout_info}}
`{{page.title}}` will attempt to use any available [spatial index](spatial-indexes.html) to speed up its operation.  Use the prefixed variant `_{{page.title}}` if you do not want any spatial indexes to be used.
{{site.data.alerts.end}}
{% endif %}

## Examples

The screenshots in these examples were generated using [geojson.io](http://geojson.io).

### True

In the example below, there are two triangles with the same vertices, which are ordered differently.  In the screenshot, one triangle is drawn in yellow, and the other blue.  The blue and yellow strokes of the two separate triangles' boundaries are visible. Because the images are overlaid on each other, the yellow and blue combine to make part of the exterior outline of the image a green color.

{% include copy-clipboard.html %}
~~~ sql
SELECT st_equals(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))'), st_geomfromtext('SRID=4326;POLYGON((-95.992775 36.153980, -87.906471 43.038902, -75.704722 36.076944, -95.992775 36.153980))'));
~~~

~~~
   st_equals
---------------
     true

(1 row)
~~~

<img src="{{ 'images/v20.2/geospatial/st_equals_true.png' | relative_url }}" alt="st_equals - true" style="border:1px solid #eee;max-width:100%" />

### False

{% include copy-clipboard.html %}
~~~ sql
SELECT st_equals(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))'), st_geomfromtext('SRID=4326;POLYGON((-84.191605 39.758949, -75.165222 39.952583, -78.878738 42.880230, -84.191605 39.758949))'));
~~~

~~~
   st_equals
---------------
     false
(1 row)
~~~

<img src="{{ 'images/v20.2/geospatial/st_equals_false.png' | relative_url }}" alt="st_equals - false" style="border:1px solid #eee;max-width:100%" />

## See also

- [Working with Spatial Data](spatial-data.html)
- [Spatial and GIS Glossary of Terms](spatial-glossary.html)
- [Spatial indexes](spatial-indexes.html)
- [Spatial functions](functions-and-operators.html#spatial-functions)
- [`st_covers`](st_covers.html)
- [`st_coveredby`](st_coveredby.html)
- [`st_contains`](st_contains.html)
- [`st_within`](st_within.html)
- [`st_intersects`](st_intersects.html)
- [`st_coveredby`](st_coveredby.html)
- [`st_covers`](st_covers.html)
- [`st_disjoint`](st_disjoint.html)
- [`st_overlaps`](st_overlaps.html)
- [`st_touches`](st_touches.html)
- [`st_convexhull`](st_convexhull.html)
- [`st_union`](st_union.html)
- [Migrate from Shapefiles](migrate-from-shapefiles.html)
- [Migrate from GeoJSON](migrate-from-geojson.html)
- [Migrate from GeoPackage](migrate-from-geopackage.html)
- [Migrate from OpenStreetMap](migrate-from-openstreetmap.html)
