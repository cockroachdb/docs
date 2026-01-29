---
title: Type Mappings
summary: Learn what the default type mappings are when using the MOLT Schema Conversion Tool and MOLT Fetch.
toc: true
docs_area: migrate
---

The MOLT Schema Conversion Tool and [MOLT Fetch]({% link molt/molt-fetch.md %}#handle-target-tables) can be used to automatically generate schema for a CockroachDB cluster. By default, types are mapped from the source database to CockroachDB as follows:

- PostgreSQL types are mapped to existing CockroachDB [types]({% link {{site.current_cloud_version}}/data-types.md %}) that have the same [`OID`]({% link {{site.current_cloud_version}}/oid.md %}).
- The following MySQL types are mapped to corresponding CockroachDB types:

	|                      MySQL type                     |                                      CockroachDB type                                     |                            Notes                             |
	|-----------------------------------------------------|-------------------------------------------------------------------------------------------|--------------------------------------------------------------|
	| `CHAR`, `CHARACTER`, `VARCHAR`, `NCHAR`, `NVARCHAR` | [`VARCHAR`]({% link {{site.current_cloud_version}}/string.md %})                          | Varying-length string; raises warning if BYTE semantics used |
	| `TINYTEXT`, `TEXT`, `MEDIUMTEXT`, `LONGTEXT`        | [`STRING`]({% link {{site.current_cloud_version}}/string.md %})                           | Unlimited-length string                                      |
	| `GEOMETRY`                                          | [`GEOMETRY`]({% link {{site.current_cloud_version}}/architecture/glossary.md %}#geometry) | Spatial type (PostGIS-style)                                 |
	| `LINESTRING`                                        | [`LINESTRING`]({% link {{site.current_cloud_version}}/linestring.md %})                   | Spatial type (PostGIS-style)                                 |
	| `POINT`                                             | [`POINT`]({% link {{site.current_cloud_version}}/point.md %})                             | Spatial type (PostGIS-style)                                 |
	| `POLYGON`                                           | [`POLYGON`]({% link {{site.current_cloud_version}}/polygon.md %})                         | Spatial type (PostGIS-style)                                 |
	| `MULTIPOINT`                                        | [`MULTIPOINT`]({% link {{site.current_cloud_version}}/multipoint.md %})                   | Spatial type (PostGIS-style)                                 |
	| `MULTILINESTRING`                                   | [`MULTILINESTRING`]({% link {{site.current_cloud_version}}/multilinestring.md %})         | Spatial type (PostGIS-style)                                 |
	| `MULTIPOLYGON`                                      | [`MULTIPOLYGON`]({% link {{site.current_cloud_version}}/multipolygon.md %})               | Spatial type (PostGIS-style)                                 |
	| `GEOMETRYCOLLECTION`, `GEOMCOLLECTION`              | [`GEOMETRYCOLLECTION`]({% link {{site.current_cloud_version}}/geometrycollection.md %})   | Spatial type (PostGIS-style)                                 |
	| `JSON`                                              | [`JSONB`]({% link {{site.current_cloud_version}}/jsonb.md %})                             | CRDB's native JSON format                                    |
	| `TINYINT`, `INT1`                                   | [`INT2`]({% link {{site.current_cloud_version}}/int.md %})                                | 2-byte integer                                               |
	| `BLOB`                                              | [`BYTES`]({% link {{site.current_cloud_version}}/bytes.md %})                             | Binary data                                                  |
	| `SMALLINT`, `INT2`                                  | [`INT2`]({% link {{site.current_cloud_version}}/int.md %})                                | 2-byte integer                                               |
	| `MEDIUMINT`, `INT`, `INTEGER`, `INT4`               | [`INT4`]({% link {{site.current_cloud_version}}/int.md %})                                | 4-byte integer                                               |
	| `BIGINT`, `INT8`                                    | [`INT`]({% link {{site.current_cloud_version}}/int.md %})                                 | 8-byte integer                                               |
	| `FLOAT`                                             | [`FLOAT4`]({% link {{site.current_cloud_version}}/float.md %})                            | 32-bit float                                                 |
	| `DOUBLE`                                            | [`FLOAT`]({% link {{site.current_cloud_version}}/float.md %})                             | 64-bit float                                                 |
	| `DECIMAL`, `NUMERIC`, `REAL`                        | [`DECIMAL`]({% link {{site.current_cloud_version}}/decimal.md %})                         | Validates scale ≤ precision; warns if precision > 19         |
	| `BINARY`, `VARBINARY`                               | [`BYTES`]({% link {{site.current_cloud_version}}/bytes.md %})                             | Binary data                                                  |
	| `DATETIME`                                          | [`TIMESTAMP`]({% link {{site.current_cloud_version}}/timestamp.md %})                     | Date and time (no time zone)                                 |
	| `TIMESTAMP`                                         | [`TIMESTAMPTZ`]({% link {{site.current_cloud_version}}/timestamp.md %})                   | Date and time with time zone                                 |
	| `TIME`                                              | [`TIME`]({% link {{site.current_cloud_version}}/time.md %})                               | Time of day (no date)                                        |
	| `BIT`                                               | [`VARBIT`]({% link {{site.current_cloud_version}}/bit.md %})                              | Variable-length bit array                                    |
	| `DATE`                                              | [`DATE`]({% link {{site.current_cloud_version}}/date.md %})                               | Date only (no time)                                          |
	| `TINYBLOB`, `MEDIUMBLOB`, `LONGBLOB`                | [`BYTES`]({% link {{site.current_cloud_version}}/bytes.md %})                             | Binary data                                                  |
	| `BOOL`, `BOOLEAN`                                   | [`BOOL`]({% link {{site.current_cloud_version}}/bool.md %})                               | Boolean                                                      |

- The following Oracle types are mapped to CockroachDB types:

    |             Oracle type(s)            |                                                                 CockroachDB type                                                                 |                                  Notes                                  |
    |---------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------|
    | `NCHAR`, `CHAR`, `CHARACTER`          | [`CHAR`]({% link {{site.current_cloud_version}}/string.md %})(n) or [`CHAR`]({% link {{site.current_cloud_version}}/string.md %})                | Fixed-length character; falls back to unbounded if length not specified |
    | `VARCHAR`, `VARCHAR2`, `NVARCHAR2`    | [`VARCHAR`]({% link {{site.current_cloud_version}}/string.md %})(n) or [`VARCHAR`]({% link {{site.current_cloud_version}}/string.md %})          | Varying-length string; raises warning if BYTE semantics used            |
    | `STRING`                              | [`STRING`]({% link {{site.current_cloud_version}}/string.md %})                                                                                  | Unlimited-length string                                                 |
    | `SMALLINT`                            | [`INT2`]({% link {{site.current_cloud_version}}/int.md %})                                                                                       | 2-byte integer                                                          |
    | `INTEGER`, `INT`, `SIMPLE_INTEGER`    | [`INT4`]({% link {{site.current_cloud_version}}/int.md %})                                                                                       | 4-byte integer                                                          |
    | `LONG`                                | [`INT8`]({% link {{site.current_cloud_version}}/int.md %})                                                                                       | 8-byte integer                                                          |
    | `FLOAT`, `BINARY_FLOAT`, `REAL`       | [`FLOAT4`]({% link {{site.current_cloud_version}}/float.md %})                                                                                   | 32-bit float                                                            |
    | `DOUBLE`, `BINARY_DOUBLE`             | [`FLOAT8`]({% link {{site.current_cloud_version}}/float.md %})                                                                                   | 64-bit float                                                            |
    | `DEC`, `NUMBER`, `DECIMAL`, `NUMERIC` | [`DECIMAL`]({% link {{site.current_cloud_version}}/decimal.md %})(p, s) or [`DECIMAL`]({% link {{site.current_cloud_version}}/decimal.md %})     | Validates scale ≤ precision; warns if precision > 19                    |
    | `DATE`                                | [`DATE`]({% link {{site.current_cloud_version}}/date.md %})                                                                                      | Date only (no time)                                                     |
    | `BLOB`, `RAW`, `LONG RAW`             | [`BYTES`]({% link {{site.current_cloud_version}}/bytes.md %})                                                                                    | Binary data                                                             |
    | `JSON`                                | [`JSONB`]({% link {{site.current_cloud_version}}/jsonb.md %})                                                                                    | CRDB's native JSON format                                               |
    | `CLOB`, `NCLOB`                       | [`STRING`]({% link {{site.current_cloud_version}}/string.md %})                                                                                  | Treated as large text                                                   |
    | `BOOLEAN`                             | [`BOOL`]({% link {{site.current_cloud_version}}/bool.md %})                                                                                      | Boolean                                                                 |
    | `TIMESTAMP`                           | [`TIMESTAMP`]({% link {{site.current_cloud_version}}/timestamp.md %}) or [`TIMESTAMPTZ`]({% link {{site.current_cloud_version}}/timestamp.md %}) | If `WITH TIME ZONE` → `TIMESTAMPTZ`, else `TIMESTAMP`                   |
    | `ROWID`, `UROWID`                     | [`STRING`]({% link {{site.current_cloud_version}}/string.md %})                                                                                  | Treated as opaque identifier                                            |
    | `SDO_GEOMETRY`                        | [`GEOMETRY`]({% link {{site.current_cloud_version}}/architecture/glossary.md %}#geometry)                                                        | Spatial type (PostGIS-style)                                            |
    | `XMLTYPE`                             | [`STRING`]({% link {{site.current_cloud_version}}/string.md %})                                                                                  | Stored as text                                                          |

## See also

- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %})