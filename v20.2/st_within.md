---
title: st_within
summary: st_within(A, B) returns true if no point in shape A lies outside of shape B, and at least one point in the interior of A lies in the interior of B.
toc: true
has_prefixed_variant: true
---

Given two shapes _A_ and _B_, the predicate function `st_within(A, B)` returns `true` if:

- No point in _A_ lies outside of _B_, and
- At least one point in the interior of _A_ lies in the interior of _B_.

In other words, the exterior of shape _B_ must not include any point in _A_, and one or more points of _A_'s interior must lie to the interior of _B_.

This behavior is similar to [`st_coveredby`](st_coveredby.html), except that the criteria are more exacting, and therefore some pairs of shapes will be rejected by this function that would be accepted by `st_coveredby`.

`st_within` works on the following spatial data types:

- [`GEOMETRY`](spatial-glossary.html#geometry)

{% if page.has_prefixed_variant %}
{{site.data.alerts.callout_info}}
`{{page.title}}` will attempt to use any available [spatial index](spatial-indexes.html) to speed up its operation.  Use the prefixed variant `_{{page.title}}` if you do not want any spatial indexes to be used.
{{site.data.alerts.end}}
{% endif %}

{{site.data.alerts.callout_info}}
This function is the inverse of [`st_contains`](st_contains.html).
{{site.data.alerts.end}}

## Examples

The screenshots in these examples were generated using [geojson.io](http://geojson.io).

### True

{% include copy-clipboard.html %}
~~~ sql
SELECT st_within(st_geomfromtext('SRID=4326;POLYGON((-87.623177 41.881832, -90.199402 38.627003, -82.446732 38.413651, -87.623177 41.881832))'), st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))'));
~~~

~~~
   st_within
---------------
     true

(1 row)
~~~

<img src="{{ 'images/v20.2/geospatial/st_within_true.png' | relative_url }}" alt="st_within - true" style="border:1px solid #eee;max-width:100%" />

### False

{% include copy-clipboard.html %}
~~~ sql
SELECT st_within(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902), (-87.623177 41.881832, -90.199402 38.627003, -82.446732 38.413651, -87.623177 41.881832))'), st_geomfromtext('SRID=4326;POLYGON((-87.356934 41.595161, -84.512016 39.103119, -86.529167 39.162222, -87.356934 41.595161))'));
~~~

~~~
   st_within
---------------
     false
(1 row)
~~~

<img src="{{ 'images/v20.2/geospatial/st_within_false.png' | relative_url }}" alt="st_within - false" style="border:1px solid #eee;max-width:100%" />

## See also

- [Working with Spatial Data](spatial-data.html)
- [Spatial and GIS Glossary of Terms](spatial-glossary.html)
- [Spatial indexes](spatial-indexes.html)
- [Spatial functions](functions-and-operators.html#spatial-functions)
- [`st_covers`](st_covers.html)
- [`st_coveredby`](st_coveredby.html)
- [`st_contains`](st_contains.html)
- [`st_intersects`](st_intersects.html)
- [`st_coveredby`](st_coveredby.html)
- [`st_covers`](st_covers.html)
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
