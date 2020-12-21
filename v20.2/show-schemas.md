---
title: SHOW SCHEMAS
summary: The SHOW SCHEMAS statement lists the schemas in a database.
toc: true
---

The `SHOW SCHEMAS` [statement](sql-statements.html) lists all [schemas](sql-name-resolution.html#naming-hierarchy) in a database.

## Required privileges

The `SELECT` [privilege](authorization.html#assign-privileges) on the database is required to list the schemas in a database.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_schemas.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`name` | The name of the database for which to show [schemas](sql-name-resolution.html#naming-hierarchy). When omitted, the schemas in the [current database](sql-name-resolution.html#current-database) are listed.

## Example

{% include {{page.version.version}}/sql/movr-statements.md %}

### Show schemas in the current database

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA org_one;
~~~

{% include copy-clipboard.html %}
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
- [Other SQL Statements](sql-statements.html)
