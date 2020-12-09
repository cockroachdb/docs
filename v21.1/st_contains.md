---
title: ST_Contains
summary: ST_Contains(A, B) returns true if no point in shape B lies outside of shape A, and at least one point in the interior of B lies in the interior of A.
toc: true
has_prefixed_variant: true
---

Given two shapes _A_ and _B_, the predicate function `ST_Contains(A, B)` returns `true` if:

- No point in _B_ lies outside of shape _A_, and
- At least one point in the interior of _B_ lies in the interior of _A_.

In other words, the exterior of shape _A_ must not include any point in _B_, and one or more points of _B_'s interior must lie in the interior of _A_.

This behavior is similar to [`ST_Covers`](st_covers.html), except that the criteria are more exacting, and therefore some pairs of shapes will be rejected by this function that would be accepted by `ST_Covers`.

`ST_Contains` works on the following data types:

- [`GEOMETRY`](spatial-glossary.html#geometry)

{% if page.has_prefixed_variant %}
{{site.data.alerts.callout_info}}
`{{page.title}}` will attempt to use any available [spatial index](spatial-indexes.html) to speed up its operation.  Use the prefixed variant `_{{page.title}}` if you do not want any spatial indexes to be used.
{{site.data.alerts.end}}
{% endif %}

{{site.data.alerts.callout_info}}
This function is the inverse of [`ST_Within`](st_within.html).
{{site.data.alerts.end}}

## Examples

{% include {{page.version.version}}/misc/geojson_geometry_note.md %}

### True

In this example, `{{page.title}}` returns `true` because:

- No point in the LineString _B_ lies outside of the Polygon _A_, and
- At least one point in the interior of _B_ lies in the interior of _A_.

{% include copy-clipboard.html %}
~~~ sql
SELECT ST_Contains(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))'), st_geomfromtext('SRID=4326;LINESTRING(-88.243385 40.116421, -87.906471 43.038902, -95.992775 36.153980)'));
~~~

~~~
  st_contains
---------------
     true

(1 row)
~~~

<img src="{{ 'images/v21.1/geospatial/st_contains_true.png' | relative_url }}" alt="ST_Contains - true" style="border:1px solid #eee;max-width:100%" />

### False

In this example, `{{page.title}}` returns `false` because:

- At least one point in the interior of LineString _B_ does not lie in the interior of the Polygon _A_.  

Note that A query against these shapes with [`ST_Covers`](st_covers.html) will return `true`.

{% include copy-clipboard.html %}
~~~ sql
SELECT st_contains(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))'), st_geomfromtext('SRID=4326;LINESTRING( -87.906471 43.038902, -95.992775 36.153980)'));
~~~

~~~
  st_contains
---------------
     false
(1 row)
~~~

<img src="{{ 'images/v21.1/geospatial/st_contains_false.png' | relative_url }}" alt="ST_Contains - false" style="border:1px solid #eee;max-width:100%" />

## See also

- [Working with Spatial Data](spatial-data.html)
- [Spatial and GIS Glossary of Terms](spatial-glossary.html)
- [Spatial indexes](spatial-indexes.html)
- [Spatial functions](functions-and-operators.html#spatial-functions)
- [`ST_Covers`](st_covers.html)
- [`ST_CoveredBy`](st_coveredby.html)
- [`ST_Within`](st_within.html)
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
