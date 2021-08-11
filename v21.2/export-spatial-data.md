---
title: Export Spatial Data
summary: Learn how to export spatial data from CockroachDB into various formats.
toc: true
---

 CockroachDB supports efficiently storing and querying spatial data.

This page has instructions for exporting spatial data from CockroachDB and converting it to other spatial formats using the [`ogr2ogr`](https://gdal.org/programs/ogr2ogr.html) command.

{% include {{page.version.version}}/spatial/ogr2ogr-supported-version.md %}

## Step 1. Export data to CSV

First, use the [`EXPORT`](export.html) statement to export your data to a CSV file.

In the example statement below, we export the tornadoes database used in [Working with spatial data](spatial-data.html).

The statement will place the CSV file in the node's [store directory](cockroach-start.html#store), in a subdirectory named `extern/tornadoes`. The file's name is automatically generated, and will be displayed as output in the [SQL shell](cockroach-sql.html).

{% include copy-clipboard.html %}
~~~ sql
EXPORT INTO CSV 'nodelocal://self/tornadoes' WITH nullas = '' FROM SELECT * from "1950-2018-torn-initpoint";
~~~

~~~
                     filename                     | rows  |  bytes
--------------------------------------------------+-------+-----------
  export16467a35d30d25700000000000000001-n1.0.csv | 63645 | 16557064
(1 row)
~~~

{{site.data.alerts.callout_info}}
This example uses local file storage.  For more information about other locations where you can export your data (such as cloud storage), see [`EXPORT`](export.html).
{{site.data.alerts.end}}

## Step 2. Combine multiple CSV files into one, as needed

You should now have one or more CSV files in the `extern/tornadoes` subdirectory of your node's [store directory](cockroach-start.html#store).  Depending on the size of the data set, there may be more than one CSV file.

To combine multiple CSVs into one file:

1. Open the CSV file where you will be storing the combined output in a text editor.  You will need to manually add the CSV header columns to that file so that the `ogr2ogr` output we generate below will have the proper column names.  Start by running the statement below on the table you are exporting to get the necessary column names:

    {% include copy-clipboard.html %}
    ~~~ sql
    SELECT string_agg(column_name, ',') FROM [SHOW COLUMNS FROM "1950-2018-torn-initpoint"];
    ~~~

    ~~~
                                                  string_agg
    ------------------------------------------------------------------------------------------------------
      gid,om,yr,mo,dy,date,time,tz,st,stf,stn,mag,inj,fat,loss,closs,slat,slon,elat,elon,len,wid,fc,geom
    ~~~

2. Add the column names output above to your target output CSV file (e.g., `tornadoes.csv`) as header columns.  For the tornadoes database, they should look like the following:

    ~~~
    gid, om, yr, mo, dy, date, time, tz, st, stf, stn, mag, inj, fat, loss, closs, slat, slon, elat, elon, len, wid, fc, geom
    ~~~

2. Concatenate the non-header data from all of the exported CSV files, and append the output to the target CSV file as shown below.  The node's store directory on this machine is `/tmp/node0`.

    {% include copy-clipboard.html %}
    ~~~ shell
    cat /tmp/node0/extern/tornadoes/*.csv >> tornadoes.csv
    ~~~

## Step 3. Convert CSV to other formats using `ogr2ogr`

Now that you have your data in CSV format, you can convert it to other spatial formats using [`ogr2ogr`](https://gdal.org/programs/ogr2ogr.html).

For example, to convert the data to SQL, run the following command:

{% include copy-clipboard.html %}
~~~ shell
ogr2ogr -f PGDUMP tornadoes.sql -lco LAUNDER=NO -lco DROP_TABLE=OFF -oo GEOM_POSSIBLE_NAMES=geom -oo KEEP_GEOM_COLUMNS=off tornadoes.csv
~~~

Note that the options `-oo GEOM_POSSIBLE_NAMES=<geom_column_name> -oo KEEP_GEOM_COLUMNS=off` are required no matter what output format you are converting into.

For more information about the formats supported by `ogr2ogr`, see the [`ogr2ogr` documentation](https://gdal.org/programs/ogr2ogr.html).

{% include {{page.version.version}}/spatial/ogr2ogr-supported-version.md %}

Finally, note that SQL type information is lost in the conversion to CSV, such that the `tornadoes.sql` file output by the `ogr2ogr` command above lists every non-geometry field as a [`VARCHAR`](string.html).

This can be addressed in one of the following ways:

- Modify the data definitions in the SQL output file to use the correct types.

- Run [`ALTER TYPE`](alter-type.html) statements to restore the data's SQL types after loading this data into another database (including another CockroachDB instance).

## See also

- [`EXPORT`](export.html)
- [Migrate from Shapefiles](migrate-from-shapefiles.html)
- [Migrate from GeoJSON](migrate-from-geojson.html)
- [Migrate from GeoPackage](migrate-from-geopackage.html)
- [Migrate from OpenStreetMap](migrate-from-openstreetmap.html)
- [Spatial features](spatial-features.html)
- [Spatial indexes](spatial-indexes.html)
- [Working with Spatial Data](spatial-data.html)
- [Spatial and GIS Glossary of Terms](spatial-glossary.html)
- [Known Limitations](known-limitations.html#spatial-support-limitations)
- [Spatial functions](functions-and-operators.html#spatial-functions)
- [POINT](point.html)
- [LINESTRING](linestring.html)
- [POLYGON](polygon.html)
- [MULTIPOINT](multipoint.html)
- [MULTILINESTRING](multilinestring.html)
- [MULTIPOLYGON](multipolygon.html)
- [GEOMETRYCOLLECTION](geometrycollection.html)
- [Well known text](well-known-text.html)
- [Well known binary](well-known-binary.html)
- [GeoJSON](geojson.html)
- [SRID 4326 - longitude and latitude](srid-4326.html)
- [`ST_Contains`](st_contains.html)
- [`ST_ConvexHull`](st_convexhull.html)
- [`ST_CoveredBy`](st_coveredby.html)
- [`ST_Covers`](st_covers.html)
- [`ST_Disjoint`](st_disjoint.html)
- [`ST_Equals`](st_equals.html)
- [`ST_Intersects`](st_intersects.html)
- [`ST_Overlaps`](st_overlaps.html)
- [`ST_Touches`](st_touches.html)
- [`ST_Union`](st_union.html)
- [`ST_Within`](st_within.html)
