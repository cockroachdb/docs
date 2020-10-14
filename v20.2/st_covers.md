---
title: st_covers
summary: st_covers(A, B) returns true if no point in shape B lies outside of shape A
toc: true
has_prefixed_variant: true
---

Given two shapes _A_ and _B_, predicate function `st_covers(A, B)` returns `true` if no point in _B_ lies outside of shape _A_.  Otherwise, it returns `false`.

In other words, shape _A_ must completely cover every point in _B_.

`st_covers` works on the following data types:

- [`GEOMETRY`](spatial-glossary.html#geometry)
- [`GEOGRAPHY`](spatial-glossary.html#geography)

{% if page.has_prefixed_variant %}
{{site.data.alerts.callout_info}}
`{{page.title}}` will attempt to use any available [spatial index](spatial-indexes.html) to speed up its operation.  Use the prefixed variant `_{{page.title}}` if you do not want any spatial indexes to be used.
{{site.data.alerts.end}}
{% endif %}

{{site.data.alerts.callout_info}}
This function is the inverse of [`st_coveredby`](st_coveredby.html).
{{site.data.alerts.end}}

## Examples

The screenshots in these examples were generated using [geojson.io](http://geojson.io).

### True

{% include copy-clipboard.html %}
~~~ sql
SELECT st_covers(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))'), st_geomfromtext('SRID=4326;POLYGON((-87.623177 41.881832, -90.199402 38.627003, -82.446732 38.413651, -87.623177 41.881832))'));
~~~

~~~
   st_covers
---------------
     true

(1 row)
~~~

<img src="{{ 'images/v20.2/geospatial/st_covers_true.png' | relative_url }}" alt="st_covers - true" style="border:1px solid #eee;max-width:100%" />

### False

{% include copy-clipboard.html %}
~~~ sql
SELECT st_covers(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))'), st_geomfromtext('SRID=4326;POLYGON((-84.191605 39.758949, -75.165222 39.952583, -78.878738 42.880230, -84.191605 39.758949))'));
~~~

~~~
   st_covers
---------------
     false
(1 row)
~~~

<img src="{{ 'images/v20.2/geospatial/st_covers_false.png' | relative_url }}" alt="st_covers - false" style="border:1px solid #eee;max-width:100%" />

## See also

- [Working with Spatial Data](spatial-data.html)
- [Spatial and GIS Glossary of Terms](spatial-glossary.html)
- [Spatial indexes](spatial-indexes.html)
- [Spatial functions](functions-and-operators.html#spatial-functions)
+ [`st_coveredby`](st_coveredby.html)
- [`st_contains`](st_contains.html)
- [`st_within`](st_within.html)
- [`st_intersects`](st_intersects.html)
- [`st_coveredby`](st_coveredby.html)
- [`st_disjoint`](st_disjoint.html)
- [`st_equals`](st_equals.html)
- [`st_overlaps`](st_overlaps.html)
- [`st_touches`](st_touches.html)
- [`st_convexhull`](st_convexhull.html)
- [`st_union`](st_union.html)
- [Migrate from Shapefiles](migrate-from-shapefiles.html)
- [Migrate from GeoJSON](migrate-from-geojson.html)
- [Migrate from GeoPackage](migrate-from-geopackage.html)
- [Migrate from OpenStreetMap](migrate-from-openstreetmap.html)
