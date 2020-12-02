---
title: ST_Touches
summary: ST_Touches(A, B) returns true if A and B have at least one point in common, but their interiors do not intersect.
toc: true
has_prefixed_variant: true
---

Given two shapes _A_ and _B_, `ST_Touches(A, B)` returns `true` if both the following are true:

- At least one point in the set of points that comprises _A_ is also a member of the set of points that make up _B_.
- No points that make up the interior of _A_ are also part of the interior of _B_.

In other words, _A_ and _B_ have a point along their boundaries in common (i.e., they "touch"), but none of their interior points intersect.  This distinction between shapes touching along a boundary vs. intersecting is also made by the [DE-9IM](spatial-glossary.html#de-9IM) standard.

`ST_Touches` works on the following data types:

- [`GEOMETRY`](spatial-glossary.html#geometry)

{% if page.has_prefixed_variant %}
{{site.data.alerts.callout_info}}
`{{page.title}}` will attempt to use any available [spatial index](spatial-indexes.html) to speed up its operation.  Use the prefixed variant `_{{page.title}}` if you do not want any spatial indexes to be used.
{{site.data.alerts.end}}
{% endif %}

## Examples

{% include {{page.version.version}}/misc/geojson_geometry_note.md %}

### True

In this example, `{{page.title}}` returns `true` because both of the following are true:

- At least one point in the set of Points that comprise Polygon _A_ is a member of the set of points that make up the LineString _B_.
- No points from the interior of _A_ are also part of the interior of _B_.

{% include copy-clipboard.html %}
~~~ sql
SELECT st_touches(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902), (-87.623177 41.881832, -90.199402 38.627003, -82.446732 38.413651, -87.623177 41.881832))'), st_geomfromtext('SRID=4326;LINESTRING(-87.623177 41.881832, -90.199402 38.627003, -82.446732 38.413651, -87.623177 41.881832)'));
~~~

~~~
   st_touches
---------------
     true

(1 row)
~~~

<img src="{{ 'images/v21.1/geospatial/st_touches_true.png' | relative_url }}" alt="ST_Touches - true" style="border:1px solid #eee;max-width:100%" />

### False

In this example, `{{page.title}}` returns `false` because:

- Some points from the interior of the LineString _B_ are also part of the interior of the Polygon _A_.

{% include copy-clipboard.html %}
~~~ sql
SELECT st_touches(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))'), st_geomfromtext('SRID=4326;LINESTRING(-88.243385 40.116421, -87.906471 43.038902, -95.992775 36.153980, -95.235278 38.971667)'));
~~~

~~~
   st_touches
---------------
     false
(1 row)
~~~

<img src="{{ 'images/v21.1/geospatial/st_touches_false.png' | relative_url }}" alt="ST_Touches - false" style="border:1px solid #eee;max-width:100%" />

## See also

- [Working with Spatial Data](spatial-data.html)
- [Spatial and GIS Glossary of Terms](spatial-glossary.html)
- [Spatial indexes](spatial-indexes.html)
- [Spatial functions](functions-and-operators.html#spatial-functions)
- [`ST_Covers`](st_covers.html)
- [`ST_CoveredBy`](st_coveredby.html)
- [`ST_Contains`](st_contains.html)
- [`ST_Within`](st_within.html)
- [`ST_Intersects`](st_intersects.html)
- [`ST_CoveredBy`](st_coveredby.html)
- [`ST_Covers`](st_covers.html)
- [`ST_Disjoint`](st_disjoint.html)
- [`ST_Equals`](st_equals.html)
- [`ST_Overlaps`](st_overlaps.html)
- [`ST_ConvexHull`](st_convexhull.html)
- [`ST_Union`](st_union.html)
- [Migrate from Shapefiles](migrate-from-shapefiles.html)
- [Migrate from GeoJSON](migrate-from-geojson.html)
- [Migrate from GeoPackage](migrate-from-geopackage.html)
- [Migrate from OpenStreetMap](migrate-from-openstreetmap.html)
