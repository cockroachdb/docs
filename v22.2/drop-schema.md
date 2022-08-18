---
title: DROP SCHEMA
summary: The DROP SCHEMA statement removes a schema and all its objects from a CockroachDB cluster.
toc: true
docs_area: reference.sql
---

{% assign rd = site.data.releases | where_exp: "rd", "rd.major_version == page.version.version" | first %}

{% if rd %}
{% assign remote_include_version = page.version.version | replace: "v", "" %}
{% else %}
{% assign remote_include_version = site.versions["stable"] | replace: "v", "" %}
{% endif %}

The `DROP SCHEMA` [statement](sql-statements.html) removes a user-defined [schema](sql-name-resolution.html#naming-hierarchy).

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

{% include {{ page.version.version }}/misc/declarative-schema-changer-note.md %}

## Required privileges

The user must have the `DROP` [privilege](security-reference/authorization.html#managing-privileges) on the schema and on all tables in the schema. If the user is the owner of the schema, `DROP` privileges are not necessary.

## Syntax

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-{{ remote_include_version }}/grammar_svg/drop_schema.html %}
</div>

### Parameters

Parameter | Description
----------|------------
`IF EXISTS`   | Drop the schema if it exists. If it does not exist, do not return an error.
`schema_name_list`  | The schema, or a list of schemas, that you want to drop.<br>To drop a schema in a database other than the current database, specify the name of the database and the name of the schema, separated by a "`.`" (e.g., `DROP SCHEMA IF EXISTS database.schema;`).
`CASCADE` | Drop all tables and views in the schema as well as all objects (such as [constraints](constraints.html) and [views](views.html)) that depend on those tables.<br><br>`CASCADE` does not list objects it drops, so should be used cautiously.
`RESTRICT` | _(Default)_ Do not drop the schema if it contains any [tables](create-table.html) or [views](create-view.html).

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Drop a schema

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA org_one;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW SCHEMAS;
~~~

~~~
     schema_name
----------------------
  crdb_internal
  information_schema
  org_one
  pg_catalog
  pg_extension
  public
(6 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP SCHEMA org_one;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW SCHEMAS;
~~~

~~~
     schema_name
----------------------
  crdb_internal
  information_schema
  pg_catalog
  pg_extension
  public
(5 rows)
~~~

### Drop a schema with tables

To drop a schema that contains tables, you need to use the `CASCADE` keyword.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA org_two;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW SCHEMAS;
~~~

~~~
     schema_name
----------------------
  crdb_internal
  information_schema
  org_two
  pg_catalog
  pg_extension
  public
(6 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE org_two.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        city STRING,
        name STRING,
        address STRING
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM org_two;
~~~

~~~
  schema_name | table_name | type  | estimated_row_count
--------------+------------+-------+----------------------
  org_two     | users      | table |                   0
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP SCHEMA org_two;
~~~

~~~
ERROR: schema "org_two" is not empty and CASCADE was not specified
SQLSTATE: 2BP01
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP SCHEMA org_two CASCADE;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW SCHEMAS;
~~~

~~~
     schema_name
----------------------
  crdb_internal
  information_schema
  pg_catalog
  pg_extension
  public
(5 rows)
~~~

## See also

- [`CREATE SCHEMA`](create-schema.html)
- [`SHOW SCHEMAS`](show-schemas.html)
- [`SHOW JOBS`](show-jobs.html)
- [SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
