---
title: ST_Within
summary: ST_Within(A, B) returns true if no point in shape A lies outside of shape B, and at least one point in the interior of A lies in the interior of B.
toc: true
has_prefixed_variant: true
docs_area: reference.sql
---

Given two shapes _A_ and _B_, the predicate function `ST_Within(A, B)` returns `true` if the following criteria are met:

- No point in _A_ lies outside of _B_.
- At least one point in the interior of _A_ lies in the interior of _B_.

In other words, the exterior of shape _B_ must not include any point in _A_, and one or more points of _A_'s interior must lie to the interior of _B_.

This behavior is similar to [`ST_CoveredBy`]({% link {{ page.version.version }}/st_coveredby.md %}), except that the criteria are more exacting, and therefore some pairs of shapes will be rejected by this function that would be accepted by `ST_CoveredBy`.

`ST_Within` works on the following spatial data types:

- [`GEOMETRY`]({% link {{ page.version.version }}/architecture/glossary.md %}#geometry)

{% if page.has_prefixed_variant %}
{{site.data.alerts.callout_info}}
`{{page.title}}` will attempt to use any available [spatial index]({% link {{ page.version.version }}/spatial-indexes.md %}) to speed up its operation.  Use the prefixed variant `_{{page.title}}` if you do not want any spatial indexes to be used.
{{site.data.alerts.end}}
{% endif %}

{{site.data.alerts.callout_info}}
This function is the inverse of [`ST_Contains`]({% link {{ page.version.version }}/st_contains.md %}).
{{site.data.alerts.end}}

## Examples

{% include {{page.version.version}}/misc/geojson_geometry_note.md %}

### True

In this example, `{{page.title}}` returns `true` because:

- No point in Polygon _A_ lies outside of Polygon _B_.
- At least one point in the interior of Polygon _A_ lies in the interior of Polygon _B_.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT ST_Within(st_geomfromtext('SRID=4326;POLYGON((-87.623177 41.881832, -90.199402 38.627003, -82.446732 38.413651, -87.623177 41.881832))'), st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))'));
~~~

~~~
   st_within
---------------
     true

(1 row)
~~~

<img src="/docs/images/{{ page.version.version }}/geospatial/st_within_true.png" alt="ST_Within - true" style="border:1px solid #eee;max-width:100%" />

### False

In this example, `{{page.title}}` returns `false` because:

- All points in Polygon _A_ lie outside of Polygon _B_.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT ST_Within(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902), (-87.623177 41.881832, -90.199402 38.627003, -82.446732 38.413651, -87.623177 41.881832))'), st_geomfromtext('SRID=4326;POLYGON((-87.356934 41.595161, -84.512016 39.103119, -86.529167 39.162222, -87.356934 41.595161))'));
~~~

~~~
   st_within
---------------
     false
(1 row)
~~~

<img src="/docs/images/{{ page.version.version }}/geospatial/st_within_false.png" alt="ST_Within - false" style="border:1px solid #eee;max-width:100%" />

## See also

- [Export Spatial Data](export-spatial-data.html)
- [Spatial tutorial]({% link {{ page.version.version }}/spatial-tutorial.md %})
- [Spatial and GIS Glossary of Terms]({% link {{ page.version.version }}/architecture/glossary.md %})
- [Spatial indexes]({% link {{ page.version.version }}/spatial-indexes.md %})
- [Spatial functions]({% link {{ page.version.version }}/functions-and-operators.md %}#spatial-functions)
- [`ST_Covers`]({% link {{ page.version.version }}/st_covers.md %})
- [`ST_CoveredBy`]({% link {{ page.version.version }}/st_coveredby.md %})
- [`ST_Contains`]({% link {{ page.version.version }}/st_contains.md %})
- [`ST_Intersects`]({% link {{ page.version.version }}/st_intersects.md %})
- [`ST_CoveredBy`]({% link {{ page.version.version }}/st_coveredby.md %})
- [`ST_Covers`]({% link {{ page.version.version }}/st_covers.md %})
- [`ST_Disjoint`]({% link {{ page.version.version }}/st_disjoint.md %})
- [`ST_Equals`]({% link {{ page.version.version }}/st_equals.md %})
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
