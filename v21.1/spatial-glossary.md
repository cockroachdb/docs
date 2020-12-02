---
title: Spatial and GIS Glossary of Terms
summary: A summary of CockroachDB's support for storing and querying spatial data.
toc: true
---

This page contains a glossary of terms common to spatial databases and geographic information systems (GIS). Where possible, we provide links to further information.

{{site.data.alerts.callout_info}}
This page is provided for reference purposes only. The inclusion of a term in this glossary does not imply that CockroachDB has support for any feature(s) related to that term. For more information about the specific spatial and GIS features supported by CockroachDB, see [Working with Spatial Data](spatial-data.html).
{{site.data.alerts.end}}

## Geometry Terms

<a name="bounding-box"></a>

- _Bounding box_: Given a set of points, a bounding box is the smallest rectangle that encloses all of the points in the set. Due to edge cases in how geographic points are mapped to [cartographic projections](#cartographic-projection), a bounding box for a given set of points may be larger than expected.

<a name="spheroid"></a>

- _Spheroid_: A spheroid (also known as an ellipsoid) is essentially a "slightly squished" sphere. Spheroids are used to represent almost-but-not-quite spherical objects. For example, a spheroid is used to represent the Earth in the [World Geodetic System](#wgs84) standard.

<a name="cartographic-projection"></a>

- _Cartographic projection_: A cartographic projection, or map projection, is the process used to represent 3-dimensional (or higher) data on a 2-dimensional surface. This is usually related to how we might display 3-dimensional shapes represented in a database by the [`GEOGRAPHY` data type](#geography) on the surface of a map, which is a flat plane. For more information, see the GIS Lounge article [What is a Map Projection?](https://www.gislounge.com/map-projection/) by Caitlin Dempsey.

<a name="covering"></a>

- _Covering_: The covering of a shape _A_ is a set of locations (in CockroachDB, [S2 cell IDs](#s2)) that comprise another shape _B_ such that no points of _A_ lie outside of _B_.

<a name="geocoder"></a>

- _Geocoder_: Takes an address or the name of a place, and returns latitude and longitude coordinates. For more information, see [the wikipedia article on Geocoding](https://en.wikipedia.org/wiki/Geocoding).

<a name="nearest-neighbor-search"></a>

- _Nearest-neighbor search_: Given a starting point on a map and a set of search criteria, find the specified number of points nearest the starting point that meet the criteria. For example, a nearest-neighbor search can be used to answer the question, "What are the 10 closest [Waffle House restaurants](https://www.wafflehouse.com) to my current location?"  This is also sometimes referred to as "_k_ nearest-neighbor" search.

<a name="srid"></a>

- _SRID_: The Spatial Referencing System Identifier (a.k.a. SRID) is used to tell which spatial reference system will be used to interpret each spatial object. A [commonly used SRID is 4326](srid-4326.html), which represents spatial data using longitude and latitude coordinates on the Earth's surface as defined in the [WGS84](#wgs84) standard.

<a name="spatial-reference-system"></a>

- _Spatial reference system_: Used to define what a spatial object "means". For example, a spatial object could use [geographic](#geography) coordinates using latitude and longitude, or a [geometry](#geometry) projection using points with X,Y coordinates in a 2-dimensional plane.

## Data types

<a name="geometry"></a>

- `GEOMETRY`: Used to represent shapes relative to 2-, 3-, or higher-dimensional plane geometry.

<a name="geography"></a>

- `GEOGRAPHY`: Used to represent shapes relative to locations on the Earth's [spheroidal](#spheroid) surface.

## Data Formats

<a name="ewkt"></a>


<a name="wkt"></a>

- _WKT_: The "Well Known Text" data format is a convenient human-readable notation for representing [spatial objects](#spatial-objects). For example a 2-dimensional point object with x- and y-coordinates is represented in WKT as `POINT(123,456)`. This format is defined by the [OGC](#ogc). For more information, see the [Well Known Text](well-known-text.html) documentation.

- _EWKT_: The "Extended Well Known Text" data format extends [WKT](#wkt) by prepending an [SRID](#srid) to the shape's description.  For more information, see the [Well Known Text](well-known-text.html#ewkt) documentation.

<a name="ewkb"></a>


<a name="wkb"></a>

- _WKB_: The "Well Known Binary" data format is a convenient machine-readable binary representation for [spatial objects](#spatial-objects). For efficiency, an application may choose to use this data format, but humans may prefer to read [WKT](#wkt). This format is defined by the [OGC](#ogc).  For more information, see [Well Known Binary](well-known-binary.html).

- _EWKB_: The "Extended Well Known Binary" data format extends [WKB](#wkb) by prepending [SRID](#srid) information to the shape's description.  For more information, see [Well Known Binary](well-known-binary.html#ewkb).

## Organizations

<a name="osgeo"></a>

- _OSGeo_: The Open Source Geospatial Foundation. For more information, see <https://www.osgeo.org>.

<a name="ogc"></a>

- _OGC_: The [Open Geospatial Consortium](https://www.ogc.org) was formerly known as the "Open GIS Consortium". The organization is still referred to colloquially as "OpenGIS" in many places online. The OGC is a consortium of businesses, government agencies, universities, etc., described as "a worldwide community committed to improving access to geospatial (location) information."

<a name="mapbox"></a>

- _MapBox_: A company providing a location data platform for mobile and web applications. For more information, see <https://www.mapbox.com/>.

<a name="esri"></a>

- _Esri_: A company providing "location intelligence" services. Esri develops spatial and [GIS](#gis) software, including the popular [ArcGIS](#arcgis) package. For more information about Esri, see <https://www.esri.com>.

## Industry Standards

<a name="sql-mm"></a>

- _SQL/MM_: The SQL Multimedia Applications specification. The part of this standard that applies to SQL geospatial data types is defined in [part 3 of the ISO/IEC 13249 document](https://www.iso.org/standard/60343.html). For a freely available paper discussing the geospatial data types and functions defined by the standard, see the (PDF) paper [SQL/MM Spatial: The Standard to Manage Spatial Data in Relational Database Systems](http://doesen0.informatik.uni-leipzig.de/proceedings/paper/68.pdf), by Knut Stolze.

<a name="wgs84"></a>

- _WGS84_: The latest revision of the [World Geodetic System](http://wiki.gis.com/wiki/index.php/World_Geodetic_System) standard (from 1984 CE), which defines a standard spheroidal reference system for mapping the Earth. See also: [spheroid](#spheroid), [cartographic projection](#cartographic-projection).

<a name="de-9IM"></a>

- _DE-9IM_: The [Dimensionally Extended nine-Intersection Model (DE-9IM)](https://en.wikipedia.org/wiki/DE-9IM) defines a method that uses a 3x3 matrix to determine whether two shapes (1) touch along a boundary, (2), intersect (overlap), or (3) are equal to each other - that is, they are the same shape that covers the same area. This notation is used by the `ST_Relate` built-in function. Almost all other spatial predicate functions can be logically implemented using this model. However, in practice, most are not, and `ST_Relate` is reserved for advanced use cases.

## File Formats

<a name="shapefile"></a>

- _Shapefile_: A spatial data file format developed by [Esri](#esri) and used by [GIS](#gis) software for storing geospatial data. It can be automatically converted to SQL by tools like [shp2pgsql](https://manpages.debian.org/stretch/postgis/shp2pgsql.1.en.html) for use by a database that can run spatial queries.

<a name="vector-file"></a>

- _Vector file_: A file format that uses a non-pixel-based, abstract coordinate representation for geospatial data. Because it is abstract and not tied to pixels, the vector format is scalable. The motivation is similar to that behind the [Scalable Vector Graphics (SVG)](https://en.wikipedia.org/wiki/Scalable_Vector_Graphics) image format: scaling the image up or down does not reveal any "jaggedness" (due to loss of information) such as might be revealed by a pixel representation. However, vector files are usually much larger in size and more expensive (in terms of CPU, memory, and disk) to work with than [Raster files](#raster-file).

<a name="raster-file"></a>

- _Raster file_: A file format that uses a non-scalable, pixel-based representation for geospatial data. Raster files are smaller and generally faster to read, write, or generate than [Vector files](#vector-file). However, raster files have inferior image quality and/or accuracy when compared to vector files: they can appear "jagged" due to the reduced information available when compared to vector files.

<a name="geojson"></a>

- _GeoJSON_: A format for encoding geometric and geographic data as [JSON](https://www.json.org). For more information, see [GeoJSON](geojson.html).

## Software and Code Libraries

<a name="gis"></a>

- _GIS_: A "Geographic Information System" (or GIS) is used to store geographic information in a computer for processing and interaction by humans and/or other software. Some systems provide graphical "point and click" user interfaces, and some are embedded in programming languages or data query languages like SQL. For example, CockroachDB versions 20.2 and later provide support for [executing spatial queries from SQL](spatial-data.html).

<a name="arcgis"></a>

- _ArcGIS_: A commercial [GIS](#gis) software package developed by the location intelligence company [Esri](#esri). For more information, see Esri's [ArcGIS overview](https://www.esri.com/en-us/arcgis/about-arcgis/overview).

<a name="postgis"></a>

- _PostGIS_: An extension to the [Postgres](https://postgresql.org/) database that adds support for geospatial queries. For more information, see [postgis.net](https://postgis.net).

<a name="geos"></a>

- _GEOS_: An open source geometry library used by CockroachDB, [PostGIS](#postgis), and other projects to provide the calculations underlying various spatial predicate functions and operators. For more information, see <http://trac.osgeo.org/geos/>.

<a name="geographiclib"></a>

- _GeographicLib_: A C++ library for performing various geographic and other calculations used by CockroachDB and other projects. For more information, see <https://geographiclib.sourceforge.io>.

<a name="gdal"></a>

- _GDAL_: A Geospatial Data Abstraction Library used to provide support for many types of [raster file formats](#raster-file). Used in [PostGIS](#postgis). For more information, see <https://www.gdal.org/>.

<a name="proj"></a>

- _PROJ_: A [cartographic projection](#cartographic-projection) library. Used by CockroachDB and other projects. For more information, see <https://www.proj4.org/>.

<a name="geobuf"></a>

- _GeoBuf_: A compact binary encoding developed by [MapBox](#mapbox) that provides nearly lossless compression of [GeoJSON](#geojson) data into [protocol buffers](https://developers.google.com/protocol-buffers/). For more information, see <https://github.com/mapbox/geobuf>.

<a name="cgal"></a>

- _CGAL_: The computational geometry algorithms library. For more information, see <https://www.cgal.org>.

<a name="sfcgal"></a>

- _SFCGAL_: A C++ wrapper library around [CGAL](#cgal). For more information, see <http://www.sfcgal.org>.

<a name="tiger"></a>

- _TIGER_: The "Topographically Integrated Geographic Encoding and Referencing System" released by the [U.S. Census Bureau](https://www.census.gov/programs-surveys/geography/guidance/tiger-data-products-guide.html).

<a name="s2"></a>

- _S2_: The [S2 Geometry Library](http://s2geometry.io) is a C++ code library for performing spherical geometry computations.  It models a sphere using a [quadtree](https://en.wikipedia.org/wiki/Quadtree) "divide the space" approach, and is used by CockroachDB.

## Spatial objects

This section has information about the representation of geometric and geographic "shapes" according to the [SQL/MM](#sql-mm) standard.

<a name="point"></a>

- _Point_: A point is a sizeless location identified by its X and Y coordinates. These coordinates are then translated according to the [spatial reference system](#spatial-reference-system) to determine what the point "is", or what it "means" relative to the other geometric objects (if any) in the data set. A point can be created in SQL by the `ST_Point()` function.

<a name="linestring"></a>

- _LineString_: A linestring is a collection of [points](#point) that are "strung together" into one geometric object, like a necklace. If the "necklace" were "closed", it could also represent a [polygon](#polygon). A linestring can also be used to represent an arbitrary curve, such as a [Bézier curve](https://en.wikipedia.org/wiki/Bézier_curve).

<a name="polygon"></a>

- _Polygon_: A polygon is a closed shape that can be made up of straight or curved lines. It can be thought of as a "closed" [linestring](#linestring). Irregular polygons can take on almost any arbitrary shape. Common regular polygons include: squares, rectangles, hexagons, and so forth. For more information about regular polygons, see the ['Regular polygon' Wikipedia article](https://en.wikipedia.org/wiki/Regular_polygon).

<a name="geometrycollection"></a>

- _GeometryCollection_: A geometry collection is a "box" or "bag" used for gathering 1 or more of the other types of objects defined above into a collection: namely, points, linestrings, or polygons. In the particular case of SQL, it provides a way of referring to a group of spatial objects as one "thing" so that you can operate on it/them more conveniently, using various SQL functions.

## Spatial System tables

<a name="pg_extension"></a>

- `pg_extension`: A table used by the Postgres database to store information about extensions to that database. Provided for compatibility by CockroachDB. For more information, see [the Postgres documentation](https://www.postgresql.org/docs/current/catalog-pg-extension.html).

<a name="spatial_ref_sys"></a>

- `spatial_ref_sys`: A SQL table defined by the [OGC](#ogc) that holds the list of [SRID](#srid)s supported by a database, e.g., `SELECT count(*) FROM spatial_ref_sys;`

<a name="geometry_columns"></a>

- `geometry_columns`: Used to list all of the columns in a database with the [`GEOMETRY`](#geometry) data type, e.g., `SELECT * from geometry_columns`.

<a name="geography_columns"></a>

- `geography_columns`: Used to list all of the columns in a database with the [`GEOGRAPHY`](#geography) data type, e.g., `SELECT * from geography_columns`.

## See also

- [Spatial Features](spatial-features.html)
- [Working with Spatial Data](spatial-data.html)
- [Spatial indexes](spatial-indexes.html)
- [Spatial functions](functions-and-operators.html#spatial-functions)
- [Migrate from Shapefiles](migrate-from-shapefiles.html)
- [Migrate from GeoJSON](migrate-from-geojson.html)
- [Migrate from GeoPackage](migrate-from-geopackage.html)
- [Migrate from OpenStreetMap](migrate-from-openstreetmap.html)
- [Well known text](well-known-text.html)
- [Well known binary](well-known-binary.html)
- [GeoJSON](geojson.html)
- [SRID 4326 - longitude and latitude](srid-4326.html)
