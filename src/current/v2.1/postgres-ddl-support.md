---
title: Postgres DDL Support
summary: Learn about which Postgres DDL statements are supported in CockroachDB.
toc: true
toc_not_nested: true
---

This page lists Postgres DDL statements and describes the level of support for each statement in CockroachDB. In some cases where features are not implemented, workarounds are suggested. Where relevant, CockroachDB extensions are listed.

{{site.data.alerts.callout_info}}
The Postgres reference syntax used in this document was taken from [the Postgres 10 docs](https://www.postgresql.org/docs/10/). Any features specific to Postgres 11 are not covered here.
{{site.data.alerts.end}}

## Tablespace-level DDL

From the [Postgres `CREATE TABLESPACE` documentation](https://www.postgresql.org/docs/10/static/sql-createtablespace.html):

~~~
CREATE TABLESPACE tablespace_name
    [ OWNER { new_owner | CURRENT_USER | SESSION_USER } ]
    LOCATION 'directory'
    [ WITH ( tablespace_option = value [, ... ] ) ]
~~~

### Support in CockroachDB

This feature is not supported in CockroachDB.

Instead, CockroachDB nodes should be [started with the `--store` parameter](start-a-node.html#store) and [zone configurations](configure-replication-zones.html) should be used to attach databases/tables to the appropriate stores.

## Database-level DDL

{{site.data.alerts.callout_info}}
Postgres uses the terms "database" and "catalog" interchangeably.
{{site.data.alerts.end}}

### `CREATE DATABASE`

From the [Postgres `CREATE DATABASE` documentation][pg_create_database]:

~~~
CREATE DATABASE name
    [ [ WITH ] [ OWNER [=] user_name ]
           [ TEMPLATE [=] template ]
           [ ENCODING [=] encoding ]
           [ LC_COLLATE [=] lc_collate ]
           [ LC_CTYPE [=] lc_ctype ]
           [ TABLESPACE [=] tablespace_name ]
           [ ALLOW_CONNECTIONS [=] allowconn ]
           [ CONNECTION LIMIT [=] connlimit ]
           [ IS_TEMPLATE [=] istemplate ] ]
~~~

#### Support in CockroachDB

The basic form without options is supported in CockroachDB 2.1. For more information, see [`CREATE DATABASE`](create-database.html).

Supported options:

| `WITH` Option       | Supported in 2.1? | Notes                                                                                                              |
|---------------------+-------------------+--------------------------------------------------------------------------------------------------------------------|
| `OWNER`             | No                | See [#30875](https://github.com/cockroachdb/cockroach/issues/30875).                                               |
| `TEMPLATE`          | Yes/Ignored       | Fixed "template0", no template actually used. See [#10151](https://github.com/cockroachdb/cockroach/issues/10151). |
| `IS_TEMPLATE`       | No                | See [#10151](https://github.com/cockroachdb/cockroach/issues/10151).                                               |
| `ENCODING`          | Yes/Ignored       | Fixed "UTF-8"/"UNICODE".                                                                                           |
| `LC_COLLATE`        | Yes/Ignored       | Fixed "C"/"C.UTF-8". See [#16618](https://github.com/cockroachdb/cockroach/issues/16618).                          |
| `LC_CTYPE`          | Yes/Ignored       | Fixed "C"/"C.UTF-8".                                                                                               |
| `TABLESPACE`        | No                | See [Tablespace-level DDL](#tablespace-level-ddl).                                                                 |
| `ALLOW_CONNECTIONS` | No                |                                                                                                                    |
| `CONNECTION LIMIT`  | No                |                                                                                                                    |

### `ALTER DATABASE`

From the [Postgres `ALTER DATABASE` documentation](https://www.postgresql.org/docs/10/static/sql-alterdatabase.html):

~~~
ALTER DATABASE name [ [ WITH ] option [ ... ] ]

where option can be:

    ALLOW_CONNECTIONS allowconn
    CONNECTION LIMIT connlimit
    IS_TEMPLATE istemplate

ALTER DATABASE name RENAME TO new_name

ALTER DATABASE name OWNER TO { new_owner | CURRENT_USER | SESSION_USER }

ALTER DATABASE name SET TABLESPACE new_tablespace

ALTER DATABASE name SET configuration_parameter { TO | = } { value | DEFAULT }
ALTER DATABASE name SET configuration_parameter FROM CURRENT
ALTER DATABASE name RESET configuration_parameter
ALTER DATABASE name RESET ALL
~~~

#### Support in CockroachDB

Only `ALTER DATABASE ... RENAME TO ...` is supported. For more information, see [`ALTER DATABASE`](alter-database.html).

Owner support is conditional on the completion of [#30875](https://github.com/cockroachdb/cockroach/issues/30875).

#### Extensions

- Use [`ALTER DATABASE ... CONFIGURE ZONE ...`](configure-zone.html) to [configure replication zones](configure-replication-zones.html).

### `DROP DATABASE`

From the [Postgres `DROP DATABASE` documentation](https://www.postgresql.org/docs/10/static/sql-dropdatabase.html):

~~~
DROP DATABASE [ IF EXISTS ] name
~~~

#### Support in CockroachDB

Supported in CockroachDB.

#### Extensions

~~~
DROP DATABASE [ IF EXISTS ] name [ CASCADE | RESTRICT ]
~~~

For more information, see [`DROP DATABASE`](drop-database.html).

## Schema-level DDL

{{site.data.alerts.callout_info}}
Currently, CockroachDB supports a single pre-defined schema called `public`.
{{site.data.alerts.end}}

### `CREATE SCHEMA`

From the [Postgres `CREATE SCHEMA` documentation][pg_create_schema]:

~~~ 
CREATE SCHEMA schema_name [ AUTHORIZATION role_specification ] [ schema_element [ ... ] ]
CREATE SCHEMA AUTHORIZATION role_specification [ schema_element [ ... ] ]
CREATE SCHEMA IF NOT EXISTS schema_name [ AUTHORIZATION role_specification ]
CREATE SCHEMA IF NOT EXISTS AUTHORIZATION role_specification

where role_specification can be:

    user_name
  | CURRENT_USER
  | SESSION_USER
~~~

#### Support in CockroachDB

Not supported. For more information, see [#26443](https://github.com/cockroachdb/cockroach/issues/26443).

### `ALTER SCHEMA`

From the [Postgres `ALTER SCHEMA` documentation](https://www.postgresql.org/docs/10/static/sql-alterschema.html):

~~~
ALTER SCHEMA name RENAME TO new_name
ALTER SCHEMA name OWNER TO { new_owner | CURRENT_USER | SESSION_USER }
~~~

#### Support in CockroachDB

Not supported. For more information, see [#26443](https://github.com/cockroachdb/cockroach/issues/26443) and [30875](https://github.com/cockroachdb/cockroach/issues/30875).

### `DROP SCHEMA`

From the [Postgres `DROP SCHEMA` documentation](https://www.postgresql.org/docs/10/static/sql-dropschema.html):

~~~
DROP SCHEMA [ IF EXISTS ] name [, ...] [ CASCADE | RESTRICT ]
~~~

#### Support in CockroachDB

Not supported. For more information, see [#26443](https://github.com/cockroachdb/cockroach/issues/26443).

## Sequence DDL

### `CREATE SEQUENCE`

From the [Postgres `CREATE SEQUENCE` documentation][pg_create_sequence]:

~~~
CREATE [ TEMPORARY | TEMP ] SEQUENCE [ IF NOT EXISTS ] name
    [ AS data_type ]
    [ INCREMENT [ BY ] increment ]
    [ MINVALUE minvalue | NO MINVALUE ] [ MAXVALUE maxvalue | NO MAXVALUE ]
    [ START [ WITH ] start ] [ CACHE cache ] [ [ NO ] CYCLE ]
    [ OWNED BY { table_name.column_name | NONE } ]
~~~

#### Support in CockroachDB

Most options are supported. For details, see the table below.

For more information, see [`CREATE SEQUENCE`](create-sequence.html).

{{site.data.alerts.callout_info}}
Sequences are **not** the preferred way to create row IDs in CockroachDB. For best performance, use [UUIDs](uuid.html). For more information, see [How do I generate unique, slowly increasing sequential numbers in CockroachDB?](sql-faqs.html#how-do-i-generate-unique-slowly-increasing-sequential-numbers-in-cockroachdb)
{{site.data.alerts.end}}

| Qualifier                    | Supported? | Notes                                                                                                                                              |
|------------------------------+------------+----------------------------------------------------------------------------------------------------------------------------------------------------|
| `TEMPORARY` / `TEMP`         | No         | See [#5807](https://github.com/cockroachdb/cockroach/issues/5807).                                                                                 |
| `AS <type>`                  | No         | Sequences always have type [`INT8`/`BIGINT`](int.html). For more information, see [#25110](https://github.com/cockroachdb/cockroach/issues/25110). |
| `INCREMENT [ BY ] ...`       | Yes        |                                                                                                                                                    |
| `[NO] MINVALUE/MAXVALUE ...` | Yes        |                                                                                                                                                    |
| `START ...`                  | Yes        |                                                                                                                                                    |
| `CACHE 1`                    | Yes        | (This is also the default.)                                                                                                                        |
| `CACHE N`                    | No         |                                                                                                                                                    |
| `NO CYCLE`                   | Yes        | (This is also the default.)                                                                                                                        |
| `CYCLE`                      | No         | See [#20961](https://github.com/cockroachdb/cockroach/issues/20961).                                                                               |
| `OWNED BY`                   | No         | See [#26382](https://github.com/cockroachdb/cockroach/issues/26382).                                                                               |

#### Extensions

- Virtual sequences (experimental): Create a virtual sequence with values auto-generated by `unique_rowid()`. For more information, see the [`SERIAL` data type documentation](serial.html#generated-values-for-modes-rowid-and-virtual_sequence).

### `ALTER SEQUENCE`

From the [Postgres `ALTER SEQUENCE` documentation](https://www.postgresql.org/docs/10/static/sql-altersequence.html):

~~~
ALTER SEQUENCE [ IF EXISTS ] name
    [ AS data_type ]
    [ INCREMENT [ BY ] increment ]
    [ MINVALUE minvalue | NO MINVALUE ] [ MAXVALUE maxvalue | NO MAXVALUE ]
    [ START [ WITH ] start ]
    [ RESTART [ [ WITH ] restart ] ]
    [ CACHE cache ] [ [ NO ] CYCLE ]
    [ OWNED BY { table_name.column_name | NONE } ]
ALTER SEQUENCE [ IF EXISTS ] name OWNER TO { new_owner | CURRENT_USER | SESSION_USER }
ALTER SEQUENCE [ IF EXISTS ] name RENAME TO new_name
ALTER SEQUENCE [ IF EXISTS ] name SET SCHEMA new_schema
~~~

#### Support in CockroachDB

Some options are supported. For details, see the table below.

For more information, see [`ALTER SEQUENCE`](alter-sequence.html).

| Qualifier                    | Supported? | Notes                                                                                                                                              |
|------------------------------+------------+----------------------------------------------------------------------------------------------------------------------------------------------------|
| `AS <type>`                  | No         | Sequences always have type [`INT8`/`BIGINT`](int.html). For more information, see [#25110](https://github.com/cockroachdb/cockroach/issues/25110). |
| `INCREMENT [BY] ...`         | Yes        |                                                                                                                                                    |
| `[NO] MINVALUE/MAXVALUE ...` | Yes        |                                                                                                                                                    |
| `START ...`                  | Yes        |                                                                                                                                                    |
| `RESTART ...`                | No         | See [#20956](https://github.com/cockroachdb/cockroach/issues/20956).                                                                               |
| `CACHE 1`                    | Yes        | (This is also the default.)                                                                                                                        |
| `CACHE N`                    | No         |                                                                                                                                                    |
| `NO CYCLE`                   | Yes        | (This is also the default.)                                                                                                                        |
| `CYCLE`                      | No         | See [#20961](https://github.com/cockroachdb/cockroach/issues/20961).                                                                               |
| `OWNED BY`                   | No         | See [#26382](https://github.com/cockroachdb/cockroach/issues/26382).                                                                               |
| `ALTER ... OWNER TO`         | No         | See [#30875](https://github.com/cockroachdb/cockroach/issues/30875).                                                                               |
| `ALTER ... RENAME TO`        | Yes        | For more information, see [`RENAME SEQUENCE`](rename-sequence.html).                                                                               |
| `ALTER ... SET SCHEMA`       | No         | See [#26443](https://github.com/cockroachdb/cockroach/issues/26443).                                                                               |

### `DROP SEQUENCE`

From the [Postgres `DROP SEQUENCE` documentation](https://www.postgresql.org/docs/10/static/sql-dropsequence.html):

~~~
DROP SEQUENCE [ IF EXISTS ] name [, ...] [ CASCADE | RESTRICT ]
~~~

#### Support in CockroachDB

Supported in CockroachDB. For more information, see [`DROP SEQUENCE`](drop-sequence.html).

{{site.data.alerts.callout_danger}}
Note that because `OWNED BY` and sequence dependencies are not tracked properly in CockroachDB, the effects of `CASCADE`/`RESTRICT` are different (incomplete) in CockroachDB when compared to Postgres. For more information, see [#20965](https://github.com/cockroachdb/cockroach/issues/20965).
{{site.data.alerts.end}}

## View DDL

### `CREATE VIEW`

From the [Postgres `CREATE VIEW` documentation][pg_create_view]:

~~~
CREATE [ OR REPLACE ] [ TEMP | TEMPORARY ] [ RECURSIVE ] VIEW name [ ( column_name [, ...] ) ]
    [ WITH ( view_option_name [= view_option_value] [, ... ] ) ]
    AS query
    [ WITH [ CASCADED | LOCAL ] CHECK OPTION ]
~~~

#### Support in CockroachDB

Only the basic form is supported, as described below. For more information, see [`CREATE VIEW`](create-view.html).

~~~
CREATE VIEW name [ ( column_name ... ) ] AS query
~~~

Features not supported yet:

- `OR REPLACE` not supported.
- `TEMP` / `TEMPORARY` not supported. For more information, see [#5807](https://github.com/cockroachdb/cockroach/issues/5807).
- `RECURSIVE` views not supported (in general, recursive queries are not supported in CockroachDB).
- `WITH` option views not supported.

Additional restrictions:

- SQL `'*'` cannot be used in views. For more information, see [#10028](https://github.com/cockroachdb/cockroach/issues/10028).
- View column dependencies are not tracked precisely. For more information, see [#29021](https://github.com/cockroachdb/cockroach/issues/29021) and [#24556](https://github.com/cockroachdb/cockroach/issues/24556).
- Cannot `INSERT`/`UPDATE`/`DELETE` data using a view. For more information, see [#20948](https://github.com/cockroachdb/cockroach/issues/20948).

### `CREATE MATERIALIZED VIEW`

From the [Postgres `CREATE MATERIALIZED VIEW` documentation](https://www.postgresql.org/docs/10/static/sql-creatematerializedview.html):

~~~
CREATE MATERIALIZED VIEW [ IF NOT EXISTS ] table_name
    [ (column_name [, ...] ) ]
    [ WITH ( storage_parameter [= value] [, ... ] ) ]
    [ TABLESPACE tablespace_name ]
    AS query
    [ WITH [ NO ] DATA ]
~~~

#### Support in CockroachDB

Not supported. For more information, see [#24747](https://github.com/cockroachdb/cockroach/issues/24747).

{{site.data.alerts.callout_success}}
Consider using [computed columns](computed-columns.html) instead, which are materialized in CockroachDB.
{{site.data.alerts.end}}

### `ALTER VIEW`

From the [Postgres `ALTER VIEW` documentation](https://www.postgresql.org/docs/10/static/sql-alterview.html):

~~~
ALTER VIEW [ IF EXISTS ] name ALTER [ COLUMN ] column_name SET DEFAULT expression
ALTER VIEW [ IF EXISTS ] name ALTER [ COLUMN ] column_name DROP DEFAULT
ALTER VIEW [ IF EXISTS ] name OWNER TO { new_owner | CURRENT_USER | SESSION_USER }
ALTER VIEW [ IF EXISTS ] name RENAME TO new_name
ALTER VIEW [ IF EXISTS ] name SET SCHEMA new_schema
ALTER VIEW [ IF EXISTS ] name SET ( view_option_name [= view_option_value] [, ... ] )
ALTER VIEW [ IF EXISTS ] name RESET ( view_option_name [, ... ] )
~~~

#### Support in CockroachDB

Only view renames are supported:

~~~
ALTER VIEW [ IF EXISTS ] name RENAME TO new_name
~~~

For more information, see [`ALTER VIEW`](alter-view.html).

Additional features being considered include:

- Owner support - [#30875](https://github.com/cockroachdb/cockroach/issues/30875).
- Schema support - [#26443](https://github.com/cockroachdb/cockroach/issues/26443).

### `DROP VIEW`

From the Postgres [`DROP VIEW`](https://www.postgresql.org/docs/10/static/sql-dropview.html):

~~~
DROP VIEW [ IF EXISTS ] name [, ...] [ CASCADE | RESTRICT ]
~~~

#### Support in CockroachDB

Supported in CockroachDB. For more information, see [`DROP VIEW`](drop-view.html).

## Table-level DDL

### `CREATE TABLE`

From the [Postgres `CREATE TABLE` documentation][pg_create_table]:

Simple tables:

~~~ 
CREATE [ [ GLOBAL | LOCAL ] { TEMPORARY | TEMP } | UNLOGGED ] TABLE [ IF NOT EXISTS ] table_name ( [
  { column_name data_type [ COLLATE collation ] [ column_constraint [ ... ] ]
    | table_constraint
    | LIKE source_table [ like_option ... ] }
    [, ... ]
] )
[ INHERITS ( parent_table [, ... ] ) ]
[ PARTITION BY ... ]
[ WITH ( storage_parameter [= value] [, ... ] ) | WITH OIDS | WITHOUT OIDS ]
[ ON COMMIT { PRESERVE ROWS | DELETE ROWS | DROP } ]
[ TABLESPACE tablespace_name ]
and like_option is:

{ INCLUDING | EXCLUDING } { COMMENTS | CONSTRAINTS | DEFAULTS | IDENTITY | INDEXES | STATISTICS | STORAGE | ALL }
~~~

Typed tables:

~~~
CREATE ... TABLE ... table_name OF type_name
~~~

#### Support in CockroachDB

The basic form is supported, with the restrictions described below. For more information, see [`CREATE TABLE`](create-table.html).

| Qualifier               | Supported | Notes                                                                                       |
|-------------------------+-----------+---------------------------------------------------------------------------------------------|
| `GLOBAL` / `LOCAL`      | No        | See [#5807](https://github.com/cockroachdb/cockroach/issues/5807).                          |
| `TEMPORARY` / `TEMP`    | No        | See [#5807](https://github.com/cockroachdb/cockroach/issues/5807).                          |
| `UNLOGGED`              | No        |                                                                                             |
| `LIKE`                  | No        | See [#30840](https://github.com/cockroachdb/cockroach/issues/30840).                        |
| `INHERITS`              | No        |                                                                                             |
| `WITH (...)`            | No        | Use [stores](start-a-node.html#store) and [zone configs](configure-replication-zones.html). |
| `WITH` / `WITHOUT OIDS` | No        | CockroachDB does not use OIDs for rows.                                                     |
| `ON COMMIT`             | No        | See [#5807](https://github.com/cockroachdb/cockroach/issues/5807).                          |
| `TABLESPACE`            | No        | See the section on [Tablespace-level DDL](#tablespace-level-ddl).                           |
| `OF ...` (typed tables) | No        |                                                                                             |

### `CREATE TABLE ... PARTITION OF ...`

Partitioned tables are available in CockroachDB but do not follow the Postgres model. For information, see [Define Table Partitions](partitioning.html).

The restrictions on `CREATE TABLE` described in [the previous section](#create-table) apply here.

### Column data types

For each data type listed below:

- Aliases are listed.
- The level of support is described.
- Links to additional information are provided (when available).

The list of data types is taken from the [Postgres documentation](https://www.postgresql.org/docs/10/static/datatype.html).

| Name                                      | Aliases              | Supported   | Notes                                                                                                                      |
|-------------------------------------------+----------------------+-------------+----------------------------------------------------------------------------------------------------------------------------|
| `bigint`                                  | `int8`               | Yes         | See [the `INT` documentation](int.html)                                                                                    |
| `bigserial`                               | `serial8`            | Yes         | Not generated unless [session option enabled](https://github.com/cockroachdb/cockroach/pull/28575).                        |
| `bit [(n)]`                               |                      | No          | Planned for support in 2.2.                                                                                                |
| `bit varying [(n)]`                       | `varbit [(n)]`       | No          | Planned for support in 2.2.                                                                                                |
| `boolean`                                 | `bool`               | Yes         |                                                                                                                            |
| `box`                                     |                      | No          | See [#21286](https://github.com/cockroachdb/cockroach/issues/21286).                                                       |
| `bytea`                                   | `bytes`              | Yes         | See [`BYTES`](bytes.html).                                                                                                 |
| `bytes`                                   | `bytea`              | EXTENSION   | See [`BYTES`](bytes.html).                                                                                                 |
| `character [(n)]`                         | `char [(n)]`         | Yes         | See [`STRING`](string.html).                                                                                               |
| `character varying [(n)]`                 | `varchar [(n)]`      | Yes         | See [`STRING`](string.html).                                                                                               |
| `cidr`                                    |                      | No          |                                                                                                                            |
| `circle`                                  |                      | No          | See [#21286](https://github.com/cockroachdb/cockroach/issues/21286).                                                       |
| `date`                                    |                      | Yes/Partial | Different range from Postgres; may convert incorrectly.  See [`TIME`](time.html).                                          |
| `double precision`                        | `float8`             | Yes         | See [`FLOAT`](float.html).                                                                                                 |
| `inet`                                    |                      | Yes         | See [`INET`](inet.html).                                                                                                   |
| `integer`                                 | `int`, `int4`        | Yes/Partial | Handled as `INT8` not `INT4`. See [#26925](https://github.com/cockroachdb/cockroach/pull/28575).                           |
| `interval`                                |                      | Yes         | Different range from PostgreSQL; may convert incorrectly. See [`INTERVAL`](interval.html).                                 |
| `interval [ fields ] [ (p) ]`             |                      | No          |                                                                                                                            |
| `json`                                    |                      | Yes/Partial | An alias to "jsonb". There is no text type "json" in CockroachDB. See [`JSONB`](jsonb.html).                               |
| `jsonb`                                   |                      | Yes/Partial | Some operators may be missing. See [`JSONB`](jsonb.html).                                                                  |
| `line`                                    |                      | No          | See [#21286](https://github.com/cockroachdb/cockroach/issues/21286).                                                       |
| `lseg`                                    |                      | No          | See [#21286](https://github.com/cockroachdb/cockroach/issues/21286).                                                       |
| `macaddr`                                 |                      | No          |                                                                                                                            |
| `macaddr8`                                |                      | No          |                                                                                                                            |
| `money`                                   |                      | No          |                                                                                                                            |
| `numeric [ (p, s) ]`                      | `decimal [ (p, s) ]` | Yes         | See [`DECIMAL`](decimal.html).                                                                                             |
| `path`                                    |                      | No          | See [#21286](https://github.com/cockroachdb/cockroach/issues/21286).                                                       |
| `pg_lsn`                                  |                      | No          |                                                                                                                            |
| `point`                                   |                      | No          | See [#21286](https://github.com/cockroachdb/cockroach/issues/21286).                                                       |
| `polygon`                                 |                      | No          | See [#21286](https://github.com/cockroachdb/cockroach/issues/21286).                                                       |
| `real`                                    | `float4`             | Yes/Partial | Separate type from `FLOAT8`, but handled the same internally. Results may differ from Postgres. See [`FLOAT`](float.html). |
| `smallint`                                | `int2`               | Yes         | See [`INT`](int.html).                                                                                                     |
| `smallserial`                             | `serial2`            | Yes         | Sequence not automatically generated unless session option is opted in. See [`SERIAL`](serial.html).                       |
| `serial`                                  | `serial4`            | Yes/Partial | Integer currently handled as `int8` not `int4`. See [#26925](https://github.com/cockroachdb/cockroach/pull).               |
| `text`                                    |                      | Yes         | See [`STRING`](string.html).                                                                                               |
| `time [ without time zone ]`              |                      | Yes         | Different range from Postgres; may convert incorrectly. See [`TIME`](time.html).                                           |
| `time [ (p) ] with time zone`             | `timetz`             | No          |                                                                                                                            |
| `time [ (p) ] [ without time zone ]`      |                      | No          | Precision not supported.                                                                                                   |
| `timestamp [ without time zone ]`         |                      | Yes         | See [`TIME`](time.html).                                                                                                   |
| `timestamp with time zone`                | `timestamptz`        | Yes         | See [`TIME`](time.html).                                                                                                   |
| `timestamp [ (p) ] [ without time zone ]` |                      | No          | Precision not supported. See [#32098](https://github.com/cockroachdb/cockroach/issues/32098).                              |
| `timestamp [ (p) ] with time zone`        | `timestamptz`        | No          | Precision not supported. See [#32098](https://github.com/cockroachdb/cockroach/issues/32098).                              |
| `tsquery`                                 |                      | No          | Related to "Full-text search". See [#7821](https://github.com/cockroachdb/cockroach/issues/7821)                           |
| `tsvector`                                |                      | No          | Related to "Full-text search".                                                                                             |
| `txid_snapshot`                           |                      | No          |                                                                                                                            |
| `uuid`                                    |                      | Yes         | See [`UUID`](uuid.html).                                                                                                   |
| `xml`                                     |                      | No          |                                                                                                                            |

### Column constraints for `CREATE TABLE`

From the [Postgres `CREATE TABLE` documentation][pg_create_table]:

~~~ 
[ CONSTRAINT constraint_name ]
{ NOT NULL |
  NULL |
  CHECK ( expression ) [ NO INHERIT ] |
  DEFAULT default_expr |
  GENERATED { ALWAYS | BY DEFAULT } AS IDENTITY [ ( sequence_options ) ] |
  UNIQUE index_parameters |
  PRIMARY KEY index_parameters |
  REFERENCES reftable [ ( refcolumn ) ] [ MATCH FULL | MATCH PARTIAL | MATCH SIMPLE ]
    [ ON DELETE action ] [ ON UPDATE action ] }
[ DEFERRABLE | NOT DEFERRABLE ] [ INITIALLY DEFERRED | INITIALLY IMMEDIATE ]
~~~

#### Support in CockroachDB

Most options are supported, with the restrictions described below. For more information, see [`CREATE TABLE`](create-table.html).

| Qualifier                                               | Supported      | Notes                                                                                                                          |
|---------------------------------------------------------+----------------+--------------------------------------------------------------------------------------------------------------------------------|
| `NULL` / `NOT NULL`                                     | Yes            | See [`NOT NULL` constraint](not-null.html).                                                                                    |
| `CHECK`                                                 | Yes            | See [`CHECK` constraint](check.html).                                                                                          |
| `NO INHERIT on CHECK`                                   | No             |                                                                                                                                |
| `DEFAULT`                                               | Yes            | See [`DEFAULT` value constraint](default-value.html).                                                                          |
| `GENERATED ... AS IDENTITY`                             | No             |                                                                                                                                |
| `UNIQUE`                                                | Yes            | See [`UNIQUE` constraint](unique.html).                                                                                        |
| `PRIMARY KEY`                                           | Yes            | See [`PRIMARY KEY` constraint](primary-key.html).                                                                              |
| `REFERENCES ...` (basic form)                           | Yes (see note) | CockroachDB may create more foreign key indexes than Postgres for an equivalent [`CREATE TABLE`](create-table.html) statement. |
| `REFERENCES ... MATCH`                                  | Partial        | See [#30026](https://github.com/cockroachdb/cockroach/issues/30026).                                                           |
| `REFERENCES ... ON DELETE/UPDATE`                       | Yes            | See [foreign key constraint](foreign-key.html).                                                                                |
| `[NOT] DEFERRABLE` / `INITIALLY DEFERRED` / `IMMEDIATE` | No/Partial     | Only `NOT DEFERRABLE INITIALLY IMMEDIATE` is supported. See [#9897](https://github.com/cockroachdb/cockroach/issues/9897).     |

#### Extensions

- [Computed Columns](computed-columns.html)

### Table constraints for `CREATE TABLE`

From the [Postgres `CREATE TABLE` documentation][pg_create_table]:

~~~
[ CONSTRAINT constraint_name ]
{ CHECK ( expression ) [ NO INHERIT ] |
  UNIQUE ( column_name [, ... ] ) index_parameters |
  PRIMARY KEY ( column_name [, ... ] ) index_parameters |
  EXCLUDE [ USING index_method ] ( exclude_element WITH operator [, ... ] ) index_parameters [ WHERE ( predicate ) ] |
  FOREIGN KEY ( column_name [, ... ] ) REFERENCES reftable [ ( refcolumn [, ... ] ) ]
    [ MATCH FULL | MATCH PARTIAL | MATCH SIMPLE ] [ ON DELETE action ] [ ON UPDATE action ] }
[ DEFERRABLE | NOT DEFERRABLE ] [ INITIALLY DEFERRED | INITIALLY IMMEDIATE ]

index_parameters in UNIQUE, PRIMARY KEY, and EXCLUDE constraints are:

[ WITH ( storage_parameter [= value] [, ... ] ) ]
[ USING INDEX TABLESPACE tablespace_name ]

exclude_element in an EXCLUDE constraint is:

{ column_name | ( expression ) } [ opclass ] [ ASC | DESC ] [ NULLS { FIRST | LAST } ]
~~~

#### Support in CockroachDB

Some options are supported, with the restrictions described below. For more information, see [`CREATE TABLE`](create-table.html).

| Qualifier                                | Supported? | Notes                                                                                       |
|------------------------------------------+------------+---------------------------------------------------------------------------------------------|
| `CHECK`                                  | Yes        | See [`CHECK` constraint](check.html).                                                       |
| `CHECK ... NO INHERIT`                   | No         |                                                                                             |
| `UNIQUE`                                 | Yes        | See [`UNIQUE` constraint](unique.html).                                                     |
| `PRIMARY KEY`                            | Yes        | See [`PRIMARY KEY` constraint](primary-key.html).                                           |
| `EXCLUDE`                                | No         |                                                                                             |
| `FOREIGN KEY`                            | Partial    | See [the notes about `REFERENCES` above](#column-constraints-for-create-table).             |
| Index parameter `WITH`                   | No         | Use [stores](start-a-node.html#store) and [zone configs](configure-replication-zones.html). |
| Index parameter `USING INDEX TABLESPACE` | No         | See the section on [Tablespace-level DDL](#tablespace-level-ddl).                           |

#### Extensions

- [Column families](column-families.html)

- Index definitions: CockroachDB supports creating indexes as part of the [`CREATE TABLE`](create-table.html) statement, for example:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE t (
    X INT, 
    Y INT,
    INDEX idx (X DESC, Y ASC)
  );
~~~

### `CREATE TABLE AS`

From the [Postgres `CREATE TABLE AS` documentation][pg_create_table_as]:

~~~
CREATE [ [ GLOBAL | LOCAL ] { TEMPORARY | TEMP } | UNLOGGED ] TABLE [ IF NOT EXISTS ] table_name
    [ (column_name [, ...] ) ]
    [ WITH ( storage_parameter [= value] [, ... ] ) | WITH OIDS | WITHOUT OIDS ]
    [ ON COMMIT { PRESERVE ROWS | DELETE ROWS | DROP } ]
    [ TABLESPACE tablespace_name ]
    AS query
    [ WITH [ NO ] DATA ]
~~~

#### Support in CockroachDB

Only the basic form without options is supported, with the restrictions described below. For more information, see [`CREATE TABLE AS`](create-table-as.html).

| Qualifier             | Supported | Notes                                                                                       |
|-----------------------+-----------+---------------------------------------------------------------------------------------------|
| `GLOBAL` / `LOCAL`    | No        | See [#5807](https://github.com/cockroachdb/cockroach/issues/5807).                          |
| `TEMPORARY` / `TEMP`  | No        | See [#5807](https://github.com/cockroachdb/cockroach/issues/5807).                          |
| `UNLOGGED`            | No        |                                                                                             |
| `WITH (...)`          | No        | Use [stores](start-a-node.html#store) and [zone configs](configure-replication-zones.html). |
| `WITH`/`WITHOUT OIDS` | No        | CockroachDB does not use OIDs for rows.                                                     |
| `ON COMMIT`           | No        | See [#5807](https://github.com/cockroachdb/cockroach/issues/5807).                          |
| `TABLESPACE`          | No        | See the section on [Tablespace-level DDL](#tablespace-level-ddl).                           |
| `WITH [NO] DATA`      | No        | Table data is always copied.                                                                |

### `ALTER TABLE` - Statement forms

From the [Postgres `ALTER TABLE` documentation][pg_alter_table]:

~~~ 
ALTER TABLE [ IF EXISTS ] [ ONLY ] name [ * ]
    action [, ... ]
ALTER TABLE [ IF EXISTS ] [ ONLY ] name [ * ]
    RENAME [ COLUMN ] column_name TO new_column_name
ALTER TABLE [ IF EXISTS ] [ ONLY ] name [ * ]
    RENAME CONSTRAINT constraint_name TO new_constraint_name
ALTER TABLE [ IF EXISTS ] name
    RENAME TO new_name
ALTER TABLE [ IF EXISTS ] name
    SET SCHEMA new_schema
ALTER TABLE ALL IN TABLESPACE name [ OWNED BY role_name [, ... ] ]
    SET TABLESPACE new_tablespace [ NOWAIT ]
ALTER TABLE [ IF EXISTS ] name
    ATTACH PARTITION partition_name FOR VALUES partition_bound_spec
ALTER TABLE [ IF EXISTS ] name
    DETACH PARTITION partition_name
~~~

#### Support in CockroachDB

Some options are supported, with the restrictions described below. For more information, see [`ALTER TABLE`](alter-table.html).

| Statement form                 | Supported? | Notes                                                                                                                                                               |
|--------------------------------+------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `ALTER TABLE name ...`         | Yes        | See [`ALTER TABLE` - Table actions](#alter-table-table-actions).                                                                                                    |
| `ALTER TABLE ONLY name`        | No         | Table inheritance is not yet supported.                                                                                                                             |
| `ALTER TABLE name *`           | No         | Table inheritance is not yet supported.                                                                                                                             |
| `ALTER TABLE RENAME TO`        | Yes        | See [`ALTER TABLE`](alter-table.html).                                                                                                                              |
| `ALTER TABLE SET SCHEMA`       | No         | See [#26443](https://github.com/cockroachdb/cockroach/issues/26443).                                                                                                |
| `ALTER TABLE SET TABLESPACE`   | No         | See the section on [Tablespace-level DDL](#tablespace-level-ddl).                                                                                                   |
| `ALTER TABLE ATTACH PARTITION` | No         | See note below.                                                                                                                                                     |
| `ALTER TABLE DETACH PARTITION` | No         | Partitioned tables are available in CockroachDB, but they do not follow the Postgres model. For more information, see [Define Table Partitions](partitioning.html). |

### `ALTER TABLE` - Table actions

{{site.data.alerts.callout_success}}
The information in this section applies to [`ALTER TABLE`](alter-table.html) statement forms that [change the schema](online-schema-changes.html) of a table.
{{site.data.alerts.end}}

From the [Postgres `ALTER TABLE` documentation][pg_alter_table]:

~~~
    ADD [ COLUMN ] [ IF NOT EXISTS ] column_name data_type [ COLLATE collation ] [ column_constraint [ ... ] ]
    DROP [ COLUMN ] [ IF EXISTS ] column_name [ RESTRICT | CASCADE ]
    ALTER [ COLUMN ] column_name [ SET DATA ] TYPE data_type [ COLLATE collation ] [ USING expression ]
    ALTER [ COLUMN ] column_name SET DEFAULT expression
    ALTER [ COLUMN ] column_name DROP DEFAULT
    ALTER [ COLUMN ] column_name { SET | DROP } NOT NULL
    ALTER [ COLUMN ] column_name ADD GENERATED { ALWAYS | BY DEFAULT } AS IDENTITY [ ( sequence_options ) ]
    ALTER [ COLUMN ] column_name { SET GENERATED { ALWAYS | BY DEFAULT } | SET sequence_option | RESTART [ [ WITH ] restart ] } [...]
    ALTER [ COLUMN ] column_name DROP IDENTITY [ IF EXISTS ]
    ALTER [ COLUMN ] column_name SET STATISTICS integer
    ALTER [ COLUMN ] column_name SET ( attribute_option = value [, ... ] )
    ALTER [ COLUMN ] column_name RESET ( attribute_option [, ... ] )
    ALTER [ COLUMN ] column_name SET STORAGE { PLAIN | EXTERNAL | EXTENDED | MAIN }
    ADD table_constraint [ NOT VALID ]
    ADD table_constraint_using_index
    ALTER CONSTRAINT constraint_name [ DEFERRABLE | NOT DEFERRABLE ] [ INITIALLY DEFERRED | INITIALLY IMMEDIATE ]
    VALIDATE CONSTRAINT constraint_name
    DROP CONSTRAINT [ IF EXISTS ]  constraint_name [ RESTRICT | CASCADE ]
    DISABLE TRIGGER [ trigger_name | ALL | USER ]
    ENABLE TRIGGER [ trigger_name | ALL | USER ]
    ENABLE REPLICA TRIGGER trigger_name
    ENABLE ALWAYS TRIGGER trigger_name
    DISABLE RULE rewrite_rule_name
    ENABLE RULE rewrite_rule_name
    ENABLE REPLICA RULE rewrite_rule_name
    ENABLE ALWAYS RULE rewrite_rule_name
    DISABLE ROW LEVEL SECURITY
    ENABLE ROW LEVEL SECURITY
    FORCE ROW LEVEL SECURITY
    NO FORCE ROW LEVEL SECURITY
    CLUSTER ON index_name
    SET WITHOUT CLUSTER
    SET WITH OIDS
    SET WITHOUT OIDS
    SET TABLESPACE new_tablespace
    SET { LOGGED | UNLOGGED }
    SET ( storage_parameter = value [, ... ] )
    RESET ( storage_parameter [, ... ] )
    INHERIT parent_table
    NO INHERIT parent_table
    OF type_name
    NOT OF
    OWNER TO { new_owner | CURRENT_USER | SESSION_USER }
    REPLICA IDENTITY { DEFAULT | USING INDEX index_name | FULL | NOTHING }

and table_constraint_using_index is:

    [ CONSTRAINT constraint_name ]
    { UNIQUE | PRIMARY KEY } USING INDEX index_name
    [ DEFERRABLE | NOT DEFERRABLE ] [ INITIALLY DEFERRED | INITIALLY IMMEDIATE ]
~~~

#### Support in CockroachDB

Some options are supported, with the restrictions described below. For more information, see [`ALTER TABLE`](alter-table.html) and [`ALTER COLUMN`](alter-column.html).

| Table action                               | Supported?  | Notes                                                                                                                                                                    |
|--------------------------------------------+-------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `ADD COLUMN`                               | Yes         | See [`ADD COLUMN`](add-column.html).                                                                                                                                     |
| `DROP COLUMN`                              | Yes         | See [`DROP COLUMN`](drop-column.html).                                                                                                                                   |
| `ALTER COLUMN [SET DATA] TYPE`             | Partial     | Only conversions that do not require column rewrites are supported, e.g., `INT2 -> INT4`, `CHAR(10) -> CHAR(100)`.                                                        |
| `ALTER COLUMN SET DEFAULT`                 | Yes         | See [`ALTER COLUMN`](alter-column.html).                                                                                                                                 |
| `ALTER COLUMN DROP DEFAULT`                | Yes         | See [`ALTER COLUMN`](alter-column.html).                                                                                                                                 |
| `ALTER COLUMN DROP NOT NULL`               | Yes         | See row below, and [`ALTER COLUMN`](alter-column.html).                                                                                                                  |
| `ALTER COLUMN SET NOT NULL`                | No          | See [#28751](https://github.com/cockroachdb/cockroach/issues/28751).                                                                                                     |
| `ALTER COLUMN ADD GENERATED`               | No          | See notes about [`GENERATED` for `CREATE TABLE`](#column-constraints-for-create-table). As a workaround, use [`ALTER COLUMN SET DEFAULT nextval...`](alter-column.html). |
| `ALTER COLUMN {SET GENERATED/SET/RESTART}` | No          | See notes about [`GENERATED` for `CREATE TABLE`](#column-constraints-for-create-table). As a workaround, use [`ALTER SEQUENCE`](alter-sequence.html).                    |
| `ALTER COLUMN DROP IDENTITY`               | No          | See notes about [`GENERATED` for `CREATE TABLE`](#column-constraints-for-create-table).                                                                                  |
| `ALTER COLUMN SET STATISTICS`              | No          |                                                                                                                                                                          |
| `ALTER COLUMN SET/RESET (attributes)`      | No          |                                                                                                                                                                          |
| `ALTER COLUMN SET STORAGE`                 | No          |                                                                                                                                                                          |
| `ADD (constraint)`                         | Yes/Partial | See [`ADD CONSTRAINT`](add-constraint.html).                                                                                                                             |
| `ADD (constraint) NOT VALID`               | Yes/Partial | See [`ADD CONSTRAINT`](add-constraint.html).                                                                                                                             |
| `ALTER CONSTRAINT`                         | No          |                                                                                                                                                                          |
| `VALIDATE CONSTRAINT`                      | Yes         | See [`VALIDATE CONSTRAINT`](validate-constraint.html).                                                                                                                   |
| `DROP CONSTRAINT`                          | Yes/Partial | See [`DROP CONSTRAINT`](drop-constraint.html).                                                                                                                           |
| `ENABLE/DISABLE ... TRIGGER`               | No          |                                                                                                                                                                          |
| `ENABLE/DISABLE ... RULE`                  | No          |                                                                                                                                                                          |
| `[NO] DISABLE/ENABLE/FORCE ROW SECURITY`   | No          |                                                                                                                                                                          |
| `CLUSTER ON`                               | No          |                                                                                                                                                                          |
| `SET WITHOUT CLUSTER`                      | No          |                                                                                                                                                                          |
| `SET WITH/WITHOUT OIDs`                    | No          | CockroachDB does not use OIDs for rows.                                                                                                                                  |
| `SET TABLESPACE`                           | No          | See the section on [Tablespace-level DDL](#tablespace-level-ddl).                                                                                                        |
| `SET LOGGED/UNLOGGED`                      | No          |                                                                                                                                                                          |
| `SET/RESET (storage parameters)`           | No          | Use [stores](start-a-node.html#store) and [zone configs](configure-replication-zones.html).                                                                              |
| `INHERIT`                                  | No          |                                                                                                                                                                          |
| `NOT/OF ...` (typed tables)                | No          |                                                                                                                                                                          |
| `OWNER TO`                                 | No          | See [#30875](https://github.com/cockroachdb/cockroach/issues/30875).                                                                                                     |
| `REPLICA IDENTITY`                         | No          |                                                                                                                                                                          |

#### Extensions

- `ALTER` for [computed columns](computed-columns.html).
- `ALTER` for [table partitions](partitioning.html).
- [`ALTER ... EXPERIMENTAL AUDIT`](sql-audit-logging.html).

### `DROP TABLE`

From the [Postgres `DROP TABLE` documentation](https://www.postgresql.org/docs/10/static/sql-droptable.html):

~~~
DROP TABLE [ IF EXISTS ] name [, ...] [ CASCADE | RESTRICT ]
~~~

#### Support in CockroachDB

Fully supported in CockroachDB. For more information, see [`DROP TABLE`](drop-table.html).

## See Also

- [Porting from Postgres](porting-postgres.html)
- [Migrate from Postgres](migrate-from-postgres.html)
- [Migration Overview](migration-overview.html)
- [Configure Replication Zones](configure-replication-zones.html)
- [Start a Node](start-a-node.html)

<!-- Reference Links -->

[pg_alter_table]:     https://www.postgresql.org/docs/10/static/sql-altertable.html 
[pg_create_database]: https://www.postgresql.org/docs/10/static/sql-createdatabase.html
[pg_create_schema]:   https://www.postgresql.org/docs/10/static/sql-createschema.html
[pg_create_sequence]: https://www.postgresql.org/docs/10/static/sql-createsequence.html
[pg_create_table]:    https://www.postgresql.org/docs/10/static/sql-createtable.html
[pg_create_table_as]: https://www.postgresql.org/docs/10/static/sql-createtableas.html
[pg_create_view]:     https://www.postgresql.org/docs/10/static/sql-createview.html
