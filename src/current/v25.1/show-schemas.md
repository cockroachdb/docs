---
title: SHOW SCHEMAS
summary: The SHOW SCHEMAS statement lists the schemas in a database.
toc: true
docs_area: reference.sql
---

The `SHOW SCHEMAS` [statement]({{ page.version.version }}/sql-statements.md) lists all [schemas]({{ page.version.version }}/sql-name-resolution.md#naming-hierarchy) in a database.

## Required privileges

The `CONNECT` [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on the database is required to list the schemas in a database.

## Synopsis

<div>
</div>

## Parameters

Parameter | Description
----------|------------
`name` | The name of the database for which to show [schemas]({{ page.version.version }}/sql-name-resolution.md#naming-hierarchy). When omitted, the schemas in the [current database]({{ page.version.version }}/sql-name-resolution.md#current-database) are listed.

## Example


### Show schemas in the current database

~~~ sql
> CREATE SCHEMA org_one;
~~~

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

- [Logical Schemas and Namespaces]({{ page.version.version }}/sql-name-resolution.md)
- [`CREATE SCHEMA`]({{ page.version.version }}/create-schema.md)
- [`SHOW DATABASES`]({{ page.version.version }}/show-databases.md)
- [Information Schema]({{ page.version.version }}/information-schema.md)
- [SQL Statements]({{ page.version.version }}/sql-statements.md)