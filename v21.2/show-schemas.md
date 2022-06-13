---
title: SHOW SCHEMAS
summary: The SHOW SCHEMAS statement lists the schemas in a database.
toc: true
docs_area: reference.sql
---

The `SHOW SCHEMAS` [statement](sql-statements.html) lists all [schemas](sql-name-resolution.html#naming-hierarchy) in a database.

## Required privileges

The `CONNECT` [privilege](security-reference/authorization.html#managing-privileges) on the database is required to list the schemas in a database.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-21.2/grammar_svg/show_schemas.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`name` | The name of the database for which to show [schemas](sql-name-resolution.html#naming-hierarchy). When omitted, the schemas in the [current database](sql-name-resolution.html#current-database) are listed.

## Example

{% include {{page.version.version}}/sql/movr-statements.md %}

### Show schemas in the current database

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

## See also

- [Logical Schemas and Namespaces](sql-name-resolution.html)
- [`CREATE SCHEMA`](create-schema.html)
- [`SHOW DATABASES`](show-databases.html)
- [Information Schema](information-schema.html)
- [SQL Statements](sql-statements.html)
