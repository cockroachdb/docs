---
title: Export Spatial Data
summary: Learn how to export spatial data from CockroachDB into various formats.
toc: true
docs_area: migrate
---

CockroachDB supports efficiently storing and querying spatial data.

This page has instructions for exporting spatial data from CockroachDB and converting it to other spatial formats using the [`ogr2ogr`](https://gdal.org/programs/ogr2ogr.html) command.

{% include {{page.version.version}}/spatial/ogr2ogr-supported-version.md %}

## Step 1. Export data to CSV

First, use the [`EXPORT`]({% link {{ page.version.version }}/export.md %}) statement to export your data to a CSV file.

In the example statement below, we export the tornadoes database used in [Query Spatial Data]({% link {{ page.version.version }}/query-spatial-data.md %}#use-a-sample-shapefile-dataset).

The statement will place the CSV file in the node's [store directory]({% link {{ page.version.version }}/cockroach-start.md %}#store), in a subdirectory named `extern/tornadoes`. The file's name is automatically generated, and will be displayed as output in the [SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}).

{% include_cached copy-clipboard.html %}
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
This example uses local file storage.  For more information about other locations where you can export your data (such as cloud storage), see [`EXPORT`]({% link {{ page.version.version }}/export.md %}).
{{site.data.alerts.end}}

## Step 2. Combine multiple CSV files into one, as needed

You should now have one or more CSV files in the `extern/tornadoes` subdirectory of your node's [store directory]({% link {{ page.version.version }}/cockroach-start.md %}#store).  Depending on the size of the data set, there may be more than one CSV file.

To combine multiple CSVs into one file:

1. Open the CSV file where you will be storing the combined output in a text editor.  You will need to manually add the CSV header columns to that file so that the `ogr2ogr` output we generate below will have the proper column names.  Start by running the statement below on the table you are exporting to get the necessary column names:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    WITH x AS (SHOW COLUMNS FROM "1950-2018-torn-initpoint") SELECT string_agg(column_name, ',') FROM x;
    ~~~

    ~~~
                                                  string_agg
    ------------------------------------------------------------------------------------------------------
      gid,om,yr,mo,dy,date,time,tz,st,stf,stn,mag,inj,fat,loss,closs,slat,slon,elat,elon,len,wid,fc,geom
    ~~~

1. Add the column names output above to your target output CSV file (e.g., `tornadoes.csv`) as header columns.  For the tornadoes database, they should look like the following:

    ~~~
    gid, om, yr, mo, dy, date, time, tz, st, stf, stn, mag, inj, fat, loss, closs, slat, slon, elat, elon, len, wid, fc, geom
    ~~~

1. Concatenate the non-header data from all of the exported CSV files, and append the output to the target CSV file as shown below.  The node's store directory on this machine is `/tmp/node0`.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cat /tmp/node0/extern/tornadoes/*.csv >> tornadoes.csv
    ~~~

## Step 3. Convert CSV to other formats using `ogr2ogr`

Now that you have your data in CSV format, you can convert it to other spatial formats using [`ogr2ogr`](https://gdal.org/programs/ogr2ogr.html).

For example, to convert the data to SQL, run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
ogr2ogr -f PGDUMP tornadoes.sql -lco LAUNDER=NO -lco DROP_TABLE=OFF -oo GEOM_POSSIBLE_NAMES=geom -oo KEEP_GEOM_COLUMNS=off tornadoes.csv
~~~

Note that the options `-oo GEOM_POSSIBLE_NAMES=<geom_column_name> -oo KEEP_GEOM_COLUMNS=off` are required no matter what output format you are converting into.

For more information about the formats supported by `ogr2ogr`, see the [`ogr2ogr` documentation](https://gdal.org/programs/ogr2ogr.html).

{% include {{page.version.version}}/spatial/ogr2ogr-supported-version.md %}

Finally, note that SQL type information is lost in the conversion to CSV, such that the `tornadoes.sql` file output by the `ogr2ogr` command above lists every non-geometry field as a [`VARCHAR`]({% link {{ page.version.version }}/string.md %}).

This can be addressed in one of the following ways:

- Modify the data definitions in the SQL output file to use the correct types.

- Run [`ALTER TYPE`]({% link {{ page.version.version }}/alter-type.md %}) statements to restore the data's SQL types after loading this data into another database (including another CockroachDB instance).

## See also

- [`EXPORT`]({% link {{ page.version.version }}/export.md %})
- [Migrate from Shapefiles]({% link {{ page.version.version }}/migrate-from-shapefiles.md %})
- [Migrate from GeoJSON]({% link {{ page.version.version }}/migrate-from-geojson.md %})
- [Migrate from GeoPackage]({% link {{ page.version.version }}/migrate-from-geopackage.md %})
- [Migrate from OpenStreetMap]({% link {{ page.version.version }}/migrate-from-openstreetmap.md %})
- [Spatial Data Overview]({% link {{ page.version.version }}/spatial-data-overview.md %})
- [Spatial indexes]({% link {{ page.version.version }}/spatial-indexes.md %})
- [Spatial and GIS Glossary of Terms]({% link {{ page.version.version }}/architecture/glossary.md %})
- [Known Limitations]({% link {{ page.version.version }}/spatial-data-overview.md %}#known-limitations)
- [Spatial functions]({% link {{ page.version.version }}/functions-and-operators.md %}#spatial-functions)
- [POINT]({% link {{ page.version.version }}/point.md %})
- [LINESTRING]({% link {{ page.version.version }}/linestring.md %})
- [POLYGON]({% link {{ page.version.version }}/polygon.md %})
- [MULTIPOINT]({% link {{ page.version.version }}/multipoint.md %})
- [MULTILINESTRING]({% link {{ page.version.version }}/multilinestring.md %})
- [MULTIPOLYGON]({% link {{ page.version.version }}/multipolygon.md %})
- [GEOMETRYCOLLECTION]({% link {{ page.version.version }}/geometrycollection.md %})
- [Well known text]({% link {{ page.version.version }}/well-known-text.md %})
- [Well known binary]({% link {{ page.version.version }}/well-known-binary.md %})
- [GeoJSON]({% link {{ page.version.version }}/geojson.md %})
- [SRID 4326 - longitude and latitude]({% link {{ page.version.version }}/srid-4326.md %})
- [`ST_Contains`]({% link {{ page.version.version }}/st_contains.md %})
- [`ST_ConvexHull`]({% link {{ page.version.version }}/st_convexhull.md %})
- [`ST_CoveredBy`]({% link {{ page.version.version }}/st_coveredby.md %})
- [`ST_Covers`]({% link {{ page.version.version }}/st_covers.md %})
- [`ST_Disjoint`]({% link {{ page.version.version }}/st_disjoint.md %})
- [`ST_Equals`]({% link {{ page.version.version }}/st_equals.md %})
- [`ST_Intersects`]({% link {{ page.version.version }}/st_intersects.md %})
- [`ST_Overlaps`]({% link {{ page.version.version }}/st_overlaps.md %})
- [`ST_Touches`]({% link {{ page.version.version }}/st_touches.md %})
- [`ST_Union`]({% link {{ page.version.version }}/st_union.md %})
- [`ST_Within`]({% link {{ page.version.version }}/st_within.md %})
