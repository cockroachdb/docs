---
title: ST_Touches
summary: ST_Touches(A, B) returns true if A and B have at least one point in common, but their interiors do not intersect.
toc: true
has_prefixed_variant: true
docs_area: reference.sql
---

Given two shapes _A_ and _B_, `ST_Touches(A, B)` returns `true` if both the following are true:

- At least one point in the set of points that comprises _A_ is also a member of the set of points that make up _B_.
- No points that make up the interior of _A_ are also part of the interior of _B_.

In other words, _A_ and _B_ have a point along their boundaries in common (i.e., they "touch"), but none of their interior points intersect.  This distinction between shapes touching along a boundary vs. intersecting is also made by the [DE-9IM]({{ page.version.version }}/architecture/glossary.md#de-9im) standard.

`ST_Touches` works on the following data types:

- [`GEOMETRY`]({{ page.version.version }}/architecture/glossary.md#geometry)

{% if page.has_prefixed_variant %}
{{site.data.alerts.callout_info}}
`{{page.title}}` will attempt to use any available [spatial index]({{ page.version.version }}/spatial-indexes.md) to speed up its operation.  Use the prefixed variant `_{{page.title}}` if you do not want any spatial indexes to be used.
{{site.data.alerts.end}}
{% endif %}

## Examples


### True

In this example, `{{page.title}}` returns `true` because both of the following are true:

- At least one point in the set of Points that comprise Polygon _A_ is a member of the set of points that make up the LineString _B_.
- No points from the interior of _A_ are also part of the interior of _B_.

~~~ sql
SELECT st_touches(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902), (-87.623177 41.881832, -90.199402 38.627003, -82.446732 38.413651, -87.623177 41.881832))'), st_geomfromtext('SRID=4326;LINESTRING(-87.623177 41.881832, -90.199402 38.627003, -82.446732 38.413651, -87.623177 41.881832)'));
~~~

~~~
   st_touches
---------------
     true

(1 row)
~~~

![ST_Touches - true](/images/v24.2/geospatial/st_touches_true.png)

### False

In this example, `{{page.title}}` returns `false` because:

- Some points from the interior of the LineString _B_ are also part of the interior of the Polygon _A_.

~~~ sql
SELECT st_touches(st_geomfromtext('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902))'), st_geomfromtext('SRID=4326;LINESTRING(-88.243385 40.116421, -87.906471 43.038902, -95.992775 36.153980, -95.235278 38.971667)'));
~~~

~~~
   st_touches
---------------
     false
(1 row)
~~~

![ST_Touches - false](/images/v24.2/geospatial/st_touches_false.png)

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
- [`ST_Intersects`]({{ page.version.version }}/st_intersects.md)
- [`ST_CoveredBy`]({{ page.version.version }}/st_coveredby.md)
- [`ST_Covers`]({{ page.version.version }}/st_covers.md)
- [`ST_Disjoint`]({{ page.version.version }}/st_disjoint.md)
- [`ST_Equals`]({{ page.version.version }}/st_equals.md)
- [`ST_Overlaps`]({{ page.version.version }}/st_overlaps.md)
- [`ST_ConvexHull`]({{ page.version.version }}/st_convexhull.md)
- [`ST_Union`]({{ page.version.version }}/st_union.md)
- [Migrate from Shapefiles]({{ page.version.version }}/migrate-from-shapefiles.md)
- [Migrate from GeoJSON]({{ page.version.version }}/migrate-from-geojson.md)
- [Migrate from GeoPackage]({{ page.version.version }}/migrate-from-geopackage.md)
- [Migrate from OpenStreetMap]({{ page.version.version }}/migrate-from-openstreetmap.md)
- [Introducing Distributed Spatial Data in Free, Open Source CockroachDB](https://www.cockroachlabs.com/blog/spatial-data/) (blog post)
- [Using GeoServer with CockroachDB]({{ page.version.version }}/geoserver.md)