---
title: SHOW SCHEMAS
summary: The SHOW SCHEMAS statement lists the schemas in a database.
toc: true
---

The `SHOW SCHEMAS` [statement](sql-statements.html) lists all [schemas](sql-name-resolution.html#logical-schemas-and-namespaces) in a database.

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to list the schemas in a database.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_schemas.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`name` | The name of the database for which to show [schemas](sql-name-resolution.html#logical-schemas-and-namespaces). When omitted, the schemas in the [current database](sql-name-resolution.html#current-database) are listed.

## Example

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

### Show ownership of schemas

To show ownership of schemas, you need to query tables in the `pg_catalog` schema:

{% include copy-clipboard.html %}
~~~ sql
> SELECT
  nspname, usename
FROM
  pg_catalog.pg_namespace
  LEFT JOIN pg_catalog.pg_user ON pg_namespace.nspowner = pg_user.usesysid;
~~~

~~~
       nspname       | usename
---------------------+----------
  crdb_internal      | NULL
  information_schema | NULL
  pg_catalog         | NULL
  pg_extension       | NULL
  public             | NULL
  org_one            | root
(6 rows)
~~~

## See also

- [Logical Schemas and Namespaces](sql-name-resolution.html)
- [`CREATE SCHEMA`](create-schema.html)
- [`SHOW DATABASES`](show-databases.html)
- [Information Schema](information-schema.html)
- [Other SQL Statements](sql-statements.html)
