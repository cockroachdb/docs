---
title: Export Spatial Data
summary: Learn how to export spatial data from CockroachDB into various formats.
toc: true
---

<span class="version-tag">New in v20.2</span>: CockroachDB supports efficiently storing and querying spatial data.

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

1. Open the CSV file where you will be storing the combined output in a text editor.  You will need to manually add the CSV header columns to that file so that the `ogr2ogr` output we generate below will have the proper column names.  Start by running [`SHOW COLUMNS`](show-columns.html) on the table you are exporting to get the necessary column names:

    {% include copy-clipboard.html %}
    ~~~ sql
    SHOW COLUMNS FROM "1950-2018-torn-initpoint";
    ~~~

    ~~~
      column_name |    data_type    | is_nullable | column_default | generation_expression |  indices  | is_hidden
    --------------+-----------------+-------------+----------------+-----------------------+-----------+------------
      gid         | INT8            |    false    | unique_rowid() |                       | {primary} |   false
      om          | FLOAT8          |    true     | NULL           |                       | {}        |   false
      yr          | FLOAT8          |    true     | NULL           |                       | {}        |   false
      mo          | FLOAT8          |    true     | NULL           |                       | {}        |   false
      dy          | FLOAT8          |    true     | NULL           |                       | {}        |   false
      date        | VARCHAR(80)     |    true     | NULL           |                       | {}        |   false
      time        | VARCHAR(80)     |    true     | NULL           |                       | {}        |   false
      tz          | FLOAT8          |    true     | NULL           |                       | {}        |   false
      st          | VARCHAR(80)     |    true     | NULL           |                       | {}        |   false
      stf         | FLOAT8          |    true     | NULL           |                       | {}        |   false
      stn         | FLOAT8          |    true     | NULL           |                       | {}        |   false
      mag         | FLOAT8          |    true     | NULL           |                       | {}        |   false
      inj         | FLOAT8          |    true     | NULL           |                       | {}        |   false
      fat         | FLOAT8          |    true     | NULL           |                       | {}        |   false
      loss        | DECIMAL         |    true     | NULL           |                       | {}        |   false
      closs       | DECIMAL         |    true     | NULL           |                       | {}        |   false
      slat        | DECIMAL         |    true     | NULL           |                       | {}        |   false
      slon        | DECIMAL         |    true     | NULL           |                       | {}        |   false
      elat        | DECIMAL         |    true     | NULL           |                       | {}        |   false
      elon        | DECIMAL         |    true     | NULL           |                       | {}        |   false
      len         | DECIMAL         |    true     | NULL           |                       | {}        |   false
      wid         | FLOAT8          |    true     | NULL           |                       | {}        |   false
      fc          | FLOAT8          |    true     | NULL           |                       | {}        |   false
      geom        | GEOMETRY(POINT) |    true     | NULL           |                       | {}        |   false
    (24 rows)
    ~~~

2. Edit the SQL column name output above into header columns in CSV format, and save the header columns in your target output CSV file (e.g., `tornadoes-export.csv`).  For the tornadoes database, the header columns will look like the following:

    ~~~
    gid, om, yr, mo, dy, date, time, tz, st, stf, stn, mag, inj, fat, loss, closs, slat, slon, elat, elon, len, wid, fc, geom
    ~~~

2. Concatenate the non-header data from all of the exported CSV files, and append the output to the target CSV file as shown below.  The node's store directory on this machine is `/tmp/node0`.

    {% include copy-clipboard.html %}
    ~~~ shell
    cat /tmp/node0/extern/tornadoes/*.csv >> tornadoes-export.csv
    ~~~

## Step 3. Convert CSV to other formats using `ogr2ogr`

Now that you have your data in CSV format, you can convert it to other spatial formats using [`ogr2ogr`](https://gdal.org/programs/ogr2ogr.html).

For example, to convert the data to SQL, run the following command:

{% include copy-clipboard.html %}
~~~ shell
ogr2ogr -f PGDUMP tornadoes.sql -lco LAUNDER=NO -lco DROP_TABLE=OFF tornadoes-export.csv
~~~

For more information about the formats supported by `ogr2ogr`, see the [`ogr2ogr` documentation](https://gdal.org/programs/ogr2ogr.html).

{% include {{page.version.version}}/spatial/ogr2ogr-supported-version.md %}

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
