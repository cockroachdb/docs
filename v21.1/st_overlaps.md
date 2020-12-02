---
title: ST_Overlaps
summary: ST_Overlaps(A, B) returns true if the shapes intersect, but neither is contained within the other.
toc: true
has_prefixed_variant: true
---

Given two shapes _A_ and _B_, `ST_Overlaps(A, B)` returns `true` if the following criteria are met:

- The shapes share any of the same space -- that is, if any point in the set that comprises _A_ is also a member of the set of points that make up _B_.
- Neither of the shapes is contained by the other, in the [`ST_Contains`](st_contains.html) sense.

In other words, `ST_Overlaps` returns `true` if the shapes intersect (in the [`ST_Intersects`](st_intersects.html) sense), but neither is contained within the other.

`ST_Overlaps` works on the following spatial data types:

- [`GEOMETRY`](spatial-glossary.html#geometry)

{% if page.has_prefixed_variant %}
{{site.data.alerts.callout_info}}
`{{page.title}}` will attempt to use any available [spatial index](spatial-indexes.html) to speed up its operation.  Use the prefixed variant `_{{page.title}}` if you do not want any spatial indexes to be used.
{{site.data.alerts.end}}
{% endif %}

## Examples

{% include {{page.version.version}}/misc/geojson_geometry_note.md %}

### True

In this example, `{{page.title}}` returns `true` because:

- There is a Point in the set that comprises Polygon _A_ that is also a member of the set of Points that make up Polygon _B_.
- Neither of the shapes is contained by the other, in the [`ST_Contains`](st_contains.html) sense.

{% include copy-clipboard.html %}
~~~ sql
SELECT st_overlaps(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))'), st_geomfromtext('SRID=4326;POLYGON((-84.191605 39.758949, -75.165222 39.952583, -78.878738 42.880230, -84.191605 39.758949))'));
~~~

~~~
  st_overlaps
---------------
     true

(1 row)
~~~

<img src="{{ 'images/v21.1/geospatial/st_overlaps_true.png' | relative_url }}" alt="ST_Overlaps - true" style="border:1px solid #eee;max-width:100%" />

### False

In this example, `{{page.title}}` returns `false` because:

- - There is not any Point in the set that comprises Polygon _A_ that is also a member of the set of Points that make up Polygon _B_.

{% include copy-clipboard.html %}
~~~ sql
SELECT st_overlaps(st_geomfromtext('SRID=4326;POLYGON((-79.995888 40.440624,-74.666728 40.358244, -76.5 42.443333, -79.995888 40.440624))'), st_geomfromtext('SRID=4326;POLYGON((-79.976111 40.374444, -74.621157 40.323294, -76.609383 39.299236, -79.976111 40.374444))'));
~~~

~~~
  st_overlaps
---------------
     false
(1 row)
~~~

<img src="{{ 'images/v21.1/geospatial/st_overlaps_false.png' | relative_url }}" alt="ST_Overlaps - false" style="border:1px solid #eee;max-width:100%" />

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
- [`ST_Touches`](st_touches.html)
- [`ST_ConvexHull`](st_convexhull.html)
- [`ST_Union`](st_union.html)
- [Migrate from Shapefiles](migrate-from-shapefiles.html)
- [Migrate from GeoJSON](migrate-from-geojson.html)
- [Migrate from GeoPackage](migrate-from-geopackage.html)
- [Migrate from OpenStreetMap](migrate-from-openstreetmap.html)
