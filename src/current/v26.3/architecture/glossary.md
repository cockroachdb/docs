---
title: Glossary
summary: Learn about database, CockroachDB architecture and deployment, and CockroachCloud terminology.
toc: true
docs_area: get_started
---

This page defines terms that you will encounter throughout the documentation.

## Database terms

{% include {{ page.version.version }}/misc/database-terms.md %}

## CockroachDB architecture terms

{% include {{ page.version.version }}/misc/basic-terms.md %}

For more information on CockroachDB architecture, see [Architecture Overview]({% link {{ page.version.version }}/architecture/overview.md %}#overview).

## CockroachDB deployment terms

#### Region

A logical identification of how nodes and data are clustered around [geographical locations]({% link {{ page.version.version }}/multiregion-overview.md %}). A _cluster region_ is the set of locations where cluster nodes are running. A _database region_ is the subset of cluster regions database data should be restricted to.

#### Availability zone

A part of a data center that is considered to form a unit with regards to failures and fault tolerance. There can be multiple nodes in a single availability zone, however Cockroach Labs recommends that you to place different replicas of your data in different availability zones.

#### [CockroachDB {{ site.data.products.core }}]({% link {{ page.version.version }}/start-a-local-cluster.md %})

A full featured, self-managed CockroachDB deployment.

{% include common/basic-terms.md %}

## Spatial and GIS terms

This section contains a glossary of terms common to spatial databases and geographic information systems (GIS). Where possible, we provide links to further information.

{{site.data.alerts.callout_info}}
This section is provided for reference purposes only. The inclusion of a term in this glossary does not imply that CockroachDB has support for any feature(s) related to that term. For more information about the specific spatial and GIS features supported by CockroachDB, see [Working with Spatial Data]({% link {{ page.version.version }}/query-spatial-data.md %}).
{{site.data.alerts.end}}

### Geometry terms

#### Bounding box

Given a set of points, a bounding box is the smallest rectangle that encloses all of the points in the set. Due to edge cases in how geographic points are mapped to [cartographic projections](#cartographic-projection), a bounding box for a given set of points may be larger than expected.

#### Spheroid

A spheroid (also known as an ellipsoid) is essentially a "slightly squished" sphere. Spheroids are used to represent almost-but-not-quite spherical objects. For example, a spheroid is used to represent the Earth in the [World Geodetic System](#wgs84) standard.

#### Cartographic projection

A cartographic projection, or map projection, is the process used to represent 3-dimensional (or higher) data on a 2-dimensional surface. This is usually related to how we might display 3-dimensional shapes represented in a database by the [`GEOGRAPHY` data type](#geography) on the surface of a map, which is a flat plane. For more information, see the GIS Lounge article [What is a Map Projection?](https://www.gislounge.com/map-projection/) by Caitlin Dempsey.

#### Covering

The covering of a shape _A_ is a set of locations (in CockroachDB, [S2 cell IDs](#s2)) that comprise another shape _B_ such that no points of _A_ lie outside of _B_.

#### Geocoder

Takes an address or the name of a place, and returns latitude and longitude coordinates. For more information, see [the Wikipedia article on Geocoding](https://wikipedia.org/wiki/Geocoding).

#### Nearest-neighbor search

Given a starting point on a map and a set of search criteria, find the specified number of points nearest the starting point that meet the criteria. For example, a nearest-neighbor search can be used to answer the question, "What are the 10 closest [Waffle House restaurants](https://www.wafflehouse.com) to my current location?"  This is also sometimes referred to as "_k_ nearest-neighbor" search.

#### SRID

The Spatial Referencing System Identifier (a.k.a. SRID) is used to tell which spatial reference system will be used to interpret each spatial object. A [commonly used SRID is 4326]({% link {{ page.version.version }}/srid-4326.md %}), which represents spatial data using longitude and latitude coordinates on the Earth's surface as defined in the [WGS84](#wgs84) standard.

#### Spatial reference system

Used to define what a spatial object "means". For example, a spatial object could use [geographic](#geography) coordinates using latitude and longitude, or a [geometry](#geometry) projection using points with X,Y coordinates in a 2-dimensional plane.

### Data types

#### `GEOMETRY`

Used to represent shapes relative to 2-, 3-, or higher-dimensional plane geometry.  For more information about the spatial objects used to represent geometries, see:
  - [`POINT`]({% link {{ page.version.version }}/point.md %})
  - [`LINESTRING`]({% link {{ page.version.version }}/linestring.md %})
  - [`POLYGON`]({% link {{ page.version.version }}/polygon.md %})
  - [`MULTIPOINT`]({% link {{ page.version.version }}/multipoint.md %})
  - [`MULTILINESTRING`]({% link {{ page.version.version }}/multilinestring.md %})
  - [`MULTIPOLYGON`]({% link {{ page.version.version }}/multipolygon.md %})
  - [`GEOMETRYCOLLECTION`]({% link {{ page.version.version }}/geometrycollection.md %})

#### `GEOGRAPHY`

Used to represent shapes relative to locations on the Earth's [spheroidal](#spheroid) surface.

### Data formats

#### WKT

The "Well Known Text" data format is a convenient human-readable notation for representing [spatial objects](#spatial-objects). For example a 2-dimensional point object with x- and y-coordinates is represented in WKT as `POINT(123,456)`. This format is defined by the [OGC](#ogc). For more information, see the [Well Known Text]({% link {{ page.version.version }}/well-known-text.md %}) documentation.

#### EWKT

The "Extended Well Known Text" data format extends [WKT](#wkt) by prepending an [SRID](#srid) to the shape's description.  For more information, see the [Well Known Text]({% link {{ page.version.version }}/well-known-text.md %}#ewkt) documentation.

#### WKB

The "Well Known Binary" data format is a convenient machine-readable binary representation for [spatial objects](#spatial-objects). For efficiency, an application may choose to use this data format, but humans may prefer to read [WKT](#wkt). This format is defined by the [OGC](#ogc).  For more information, see [Well Known Binary]({% link {{ page.version.version }}/well-known-binary.md %}).

#### EWKB

The "Extended Well Known Binary" data format extends [WKB](#wkb) by prepending [SRID](#srid) information to the shape's description.  For more information, see [Well Known Binary]({% link {{ page.version.version }}/well-known-binary.md %}#ewkb).

### Organizations

#### OSGeo

The Open Source Geospatial Foundation. For more information, see <https://www.osgeo.org>.

#### OGC

The [Open Geospatial Consortium](https://www.ogc.org) was formerly known as the "Open GIS Consortium". The organization is still referred to colloquially as "OpenGIS" in many places online. The OGC is a consortium of businesses, government agencies, universities, etc., described as "a worldwide community committed to improving access to geospatial (location) information."

#### MapBox

A company providing a location data platform for mobile and web applications. For more information, see <https://www.mapbox.com/>.

#### Esri

A company providing "location intelligence" services. Esri develops spatial and [GIS](#gis) software, including the popular [ArcGIS](#arcgis) package. For more information about Esri, see <https://www.esri.com>.

### Industry Standards

#### SQL/MM

The SQL Multimedia Applications specification. The part of this standard that applies to SQL geospatial data types is defined in [part 3 of the ISO/IEC 13249 document](https://www.iso.org/standard/60343.html). For a freely available paper discussing the geospatial data types and functions defined by the standard, see the (PDF) paper [SQL/MM Spatial: The Standard to Manage Spatial Data in Relational Database Systems](http://doesen0.informatik.uni-leipzig.de/proceedings/paper/68.pdf), by Knut Stolze.

#### WGS84

The latest revision of the [World Geodetic System](http://wiki.gis.com/wiki/index.php/World_Geodetic_System) standard (from 1984 CE), which defines a standard spheroidal reference system for mapping the Earth. See also: [spheroid](#spheroid), [cartographic projection](#cartographic-projection).

#### DE-9IM

The [Dimensionally Extended nine-Intersection Model (DE-9IM)](https://wikipedia.org/wiki/DE-9IM) defines a method that uses a 3x3 matrix to determine whether two shapes (1) touch along a boundary, (2), intersect (overlap), or (3) are equal to each other - that is, they are the same shape that covers the same area. This notation is used by the `ST_Relate` built-in function. Almost all other spatial predicate functions can be logically implemented using this model. However, in practice, most are not, and `ST_Relate` is reserved for advanced use cases.

### File Formats

#### Shapefile

A spatial data file format developed by [Esri](#esri) and used by [GIS](#gis) software for storing geospatial data. It can be automatically converted to SQL by tools like [shp2pgsql](https://manpages.debian.org/stretch/postgis/shp2pgsql.1.html) for use by a database that can run spatial queries.

#### Vector file

A file format that uses a non-pixel-based, abstract coordinate representation for geospatial data. Because it is abstract and not tied to pixels, the vector format is scalable. The motivation is similar to that behind the [Scalable Vector Graphics (SVG)](https://wikipedia.org/wiki/Scalable_Vector_Graphics) image format: scaling the image up or down does not reveal any "jaggedness" (due to loss of information) such as might be revealed by a pixel representation. However, vector files are usually much larger in size and more expensive (in terms of CPU, memory, and disk) to work with than [Raster files](#raster-file).

#### Raster file

A file format that uses a non-scalable, pixel-based representation for geospatial data. Raster files are smaller and generally faster to read, write, or generate than [Vector files](#vector-file). However, raster files have inferior image quality and/or accuracy when compared to vector files: they can appear "jagged" due to the reduced information available when compared to vector files.

#### GeoJSON

A format for encoding geometric and geographic data as [JSON](https://www.json.org). For more information, see [GeoJSON]({% link {{ page.version.version }}/geojson.md %}).

### Software and Code Libraries

#### GIS

A "Geographic Information System" (or GIS) is used to store geographic information in a computer for processing and interaction by humans and/or other software. Some systems provide graphical "point and click" user interfaces, and some are embedded in programming languages or data query languages like SQL. For example, CockroachDB versions 20.2 and later provide support for [executing spatial queries from SQL]({% link {{ page.version.version }}/query-spatial-data.md %}).

#### ArcGIS

A commercial [GIS](#gis) software package developed by the location intelligence company [Esri](#esri). For more information, see Esri's [ArcGIS overview](https://www.esri.com/en-us/arcgis/about-arcgis/overview).

#### PostGIS

An extension to the [PostgreSQL](https://postgresql.org/) database that adds support for geospatial queries. For more information, see [postgis.net](https://postgis.net).

#### GEOS

A geometry library used by CockroachDB, [PostGIS](#postgis), and other projects to provide the calculations underlying various spatial predicate functions and operators. For more information, see <http://trac.osgeo.org/geos/>.

#### GeographicLib

A C++ library for performing various geographic and other calculations used by CockroachDB and other projects. For more information, see <https://geographiclib.sourceforge.io>.

#### GDAL

A Geospatial Data Abstraction Library used to provide support for many types of [raster file formats](#raster-file). Used in [PostGIS](#postgis). For more information, see <https://www.gdal.org/>.

#### PROJ

A [cartographic projection](#cartographic-projection) library. Used by CockroachDB and other projects. For more information, see <https://proj.org/>.

#### GeoBuf

A compact binary encoding developed by [MapBox](#mapbox) that provides nearly lossless compression of [GeoJSON](#geojson) data into [protocol buffers](https://developers.google.com/protocol-buffers/). For more information, see <https://github.com/mapbox/geobuf>.

#### CGAL

The computational geometry algorithms library. For more information, see <https://www.cgal.org>.

#### SFCGAL

A C++ wrapper library around [CGAL](#cgal). For more information, see <http://www.sfcgal.org>.

#### TIGER

The "Topographically Integrated Geographic Encoding and Referencing System" released by the [U.S. Census Bureau](https://www.census.gov/programs-surveys/geography/guidance/tiger-data-products-guide.html).

#### S2

The [S2 Geometry Library](http://s2geometry.io) is a C++ code library for performing spherical geometry computations.  It models a sphere using a [quadtree](https://wikipedia.org/wiki/Quadtree) "divide the space" approach, and is used by CockroachDB.

### Spatial objects

This section has information about the representation of geometric and geographic "shapes" according to the [SQL/MM](#sql-mm) standard.

#### Point

A point is a sizeless location identified by its X and Y coordinates. These coordinates are then translated according to the [spatial reference system](#spatial-reference-system) to determine what the point "is", or what it "means" relative to the other geometric objects (if any) in the data set. A point can be created in SQL by the `ST_Point()` function.

#### LineString

A linestring is a collection of [points](#point) that are "strung together" into one geometric object, like a necklace. If the "necklace" were "closed", it could also represent a [polygon](#polygon). A linestring can also be used to represent an arbitrary curve, such as a [Bézier curve](https://wikipedia.org/wiki/Bézier_curve).

#### Polygon

A polygon is a closed shape that can be made up of straight or curved lines. It can be thought of as a "closed" [linestring](#linestring). Irregular polygons can take on almost any arbitrary shape. Common regular polygons include: squares, rectangles, hexagons, and so forth. For more information about regular polygons, see the ['Regular polygon' Wikipedia article](https://wikipedia.org/wiki/Regular_polygon).

#### GeometryCollection

A geometry collection is a "box" or "bag" used for gathering 1 or more of the other types of objects defined above into a collection: namely, points, linestrings, or polygons. In the particular case of SQL, it provides a way of referring to a group of spatial objects as one "thing" so that you can operate on it/them more conveniently, using various SQL functions.

### Spatial System tables

#### `pg_extension`

A table used by the PostgreSQL database to store information about extensions to that database. Provided for compatibility by CockroachDB. For more information, see [the PostgreSQL documentation](https://www.postgresql.org/docs/current/catalog-pg-extension.html).

#### `spatial_ref_sys`

A SQL table defined by the [OGC](#ogc) that holds the list of [SRID](#srid)s supported by a database, e.g., `SELECT count(*) FROM spatial_ref_sys;`

#### `geometry_columns`

Used to list all of the columns in a database with the [`GEOMETRY`](#geometry) data type, e.g., `SELECT * from geometry_columns`.

#### `geography_columns`

Used to list all of the columns in a database with the [`GEOGRAPHY`](#geography) data type, e.g., `SELECT * FROM geography_columns`.
