---
title: ST_Intersects
summary: ST_Intersects(A, B) returns true if any point in shape A lies within shape B.
toc: true
has_prefixed_variant: true
docs_area: reference.sql
---

Given two shapes _A_ and _B_, `ST_Intersects(A, B)` returns `true` if the shapes share any of the same space -- that is, if any point in the set that comprises _A_ is also a member of the set of points that make up _B_.

`ST_Intersects` works on the following data types:

- [`GEOMETRY`]({{ page.version.version }}/architecture/glossary.md#geometry)
- [`GEOGRAPHY`]({{ page.version.version }}/architecture/glossary.md#geography)

{% if page.has_prefixed_variant %}
{{site.data.alerts.callout_info}}
`{{page.title}}` will attempt to use any available [spatial index]({{ page.version.version }}/spatial-indexes.md) to speed up its operation.  Use the prefixed variant `_{{page.title}}` if you do not want any spatial indexes to be used.
{{site.data.alerts.end}}
{% endif %}

{{site.data.alerts.callout_info}}
This function is the inverse of [`ST_Disjoint`]({{ page.version.version }}/st_disjoint.md).
{{site.data.alerts.end}}

## Examples


### True

In this example, `{{page.title}}` returns `true` because:

- The shapes share some of the same space -- that is, there are Points in the set that comprises Polygon _A_ that are also members of Polygon _B_.

~~~ sql
SELECT st_intersects(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))'), st_geomfromtext('SRID=4326;POLYGON((-84.191605 39.758949, -75.165222 39.952583, -78.878738 42.880230, -84.191605 39.758949))'));
~~~

~~~
 st_intersects
---------------
     true

(1 row)
~~~

![ST_Intersects - true](/images/v24.2/geospatial/st_intersects_true.png)

### False

In this example, `{{page.title}}` returns `false` because:

- The shapes do not share any of the same space -- that is, there are no Points in the set that comprises Polygon _A_ that are also members of Polygon _B_.

~~~ sql
SELECT st_intersects(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))'), st_geomfromtext('SRID=4326;POLYGON((-79.995888 40.440624,-74.666728 40.358244, -76.5 42.443333, -79.995888 40.440624))'));
~~~

~~~
 st_intersects
---------------
     false
(1 row)
~~~

![ST_Intersects - false](/images/v24.2/geospatial/st_intersects_false.png)

## See also

- [Export Spatial Data](export-spatial-data.html)
- [Spatial tutorial]({{ page.version.version }}/spatial-tutorial.md)
- [Spatial and GIS Glossary of Terms]({{ page.version.version }}/architecture/glossary.md)
- [Spatial indexes]({{ page.version.version }}/spatial-indexes.md)
- [Spatial functions]({{ page.version.version }}/functions-and-operators.md#spatial-functions)
- [`ST_Covers`]({{ page.version.version }}/st_covers.md)
- [`ST_CoveredBy`]({{ page.version.version }}/st_coveredby.md)
- [`ST_Contains`]({{ page.version.version }}/st_contains.md)
- [`ST_Within`]({{ page.version.version }}/st_within.md)
- [`ST_CoveredBy`]({{ page.version.version }}/st_coveredby.md)
- [`ST_Covers`]({{ page.version.version }}/st_covers.md)
- [`ST_Disjoint`]({{ page.version.version }}/st_disjoint.md)
- [`ST_Equals`]({{ page.version.version }}/st_equals.md)
- [`ST_Overlaps`]({{ page.version.version }}/st_overlaps.md)
- [`ST_Touches`]({{ page.version.version }}/st_touches.md)
- [`ST_ConvexHull`]({{ page.version.version }}/st_convexhull.md)
- [`ST_Union`]({{ page.version.version }}/st_union.md)
- [Migrate from Shapefiles]({{ page.version.version }}/migrate-from-shapefiles.md)
- [Migrate from GeoJSON]({{ page.version.version }}/migrate-from-geojson.md)
- [Migrate from GeoPackage]({{ page.version.version }}/migrate-from-geopackage.md)
- [Migrate from OpenStreetMap]({{ page.version.version }}/migrate-from-openstreetmap.md)
- [Introducing Distributed Spatial Data in Free, Open Source CockroachDB](https://www.cockroachlabs.com/blog/spatial-data/) (blog post)
- [Using GeoServer with CockroachDB]({{ page.version.version }}/geoserver.md)