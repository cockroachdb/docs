---
title: ST_Within
summary: ST_Within(A, B) returns true if no point in shape A lies outside of shape B, and at least one point in the interior of A lies in the interior of B.
toc: true
has_prefixed_variant: true
---

Given two shapes _A_ and _B_, the predicate function `ST_Within(A, B)` returns `true` if the following criteria are met:

- No point in _A_ lies outside of _B_.
- At least one point in the interior of _A_ lies in the interior of _B_.

In other words, the exterior of shape _B_ must not include any point in _A_, and one or more points of _A_'s interior must lie to the interior of _B_.

This behavior is similar to [`ST_CoveredBy`](st_coveredby.html), except that the criteria are more exacting, and therefore some pairs of shapes will be rejected by this function that would be accepted by `ST_CoveredBy`.

`ST_Within` works on the following spatial data types:

- [`GEOMETRY`](spatial-glossary.html#geometry)

{% if page.has_prefixed_variant %}
{{site.data.alerts.callout_info}}
`{{page.title}}` will attempt to use any available [spatial index](spatial-indexes.html) to speed up its operation.  Use the prefixed variant `_{{page.title}}` if you do not want any spatial indexes to be used.
{{site.data.alerts.end}}
{% endif %}

{{site.data.alerts.callout_info}}
This function is the inverse of [`ST_Contains`](st_contains.html).
{{site.data.alerts.end}}

## Examples

{% include {{page.version.version}}/misc/geojson_geometry_note.md %}

### True

In this example, `{{page.title}}` returns `true` because:

- No point in Polygon _A_ lies outside of Polygon _B_.
- At least one point in the interior of Polygon _A_ lies in the interior of Polygon _B_.

{% include copy-clipboard.html %}
~~~ sql
SELECT ST_Within(st_geomfromtext('SRID=4326;POLYGON((-87.623177 41.881832, -90.199402 38.627003, -82.446732 38.413651, -87.623177 41.881832))'), st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))'));
~~~

~~~
   st_within
---------------
     true

(1 row)
~~~

<img src="{{ 'images/v21.1/geospatial/st_within_true.png' | relative_url }}" alt="ST_Within - true" style="border:1px solid #eee;max-width:100%" />

### False

In this example, `{{page.title}}` returns `false` because:

- All points in Polygon _A_ lie outside of Polygon _B_.

{% include copy-clipboard.html %}
~~~ sql
SELECT ST_Within(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902), (-87.623177 41.881832, -90.199402 38.627003, -82.446732 38.413651, -87.623177 41.881832))'), st_geomfromtext('SRID=4326;POLYGON((-87.356934 41.595161, -84.512016 39.103119, -86.529167 39.162222, -87.356934 41.595161))'));
~~~

~~~
   st_within
---------------
     false
(1 row)
~~~

<img src="{{ 'images/v21.1/geospatial/st_within_false.png' | relative_url }}" alt="ST_Within - false" style="border:1px solid #eee;max-width:100%" />

## See also

- [Working with Spatial Data](spatial-data.html)
- [Spatial and GIS Glossary of Terms](spatial-glossary.html)
- [Spatial indexes](spatial-indexes.html)
- [Spatial functions](functions-and-operators.html#spatial-functions)
- [`ST_Covers`](st_covers.html)
- [`ST_CoveredBy`](st_coveredby.html)
- [`ST_Contains`](st_contains.html)
- [`ST_Intersects`](st_intersects.html)
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
